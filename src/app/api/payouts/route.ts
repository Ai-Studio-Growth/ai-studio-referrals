import { authenticateApi, json } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { getPayoutAdapter } from '@/lib/adapters/payouts';
import { audit } from '@/lib/referral/engine';
import { emit } from '@/lib/adapters/messaging';
import { z } from 'zod';

const schema = z.object({
  userId: z.string(),
  amountCents: z.number().int().positive().optional(), // defaults to full available balance
});

/**
 * POST /api/payouts — request a payout of a referrer's cleared (approved) wallet
 * balance. Debits the wallet, marks approved rewards as paid, and dispatches via
 * the configured payout adapter.
 */
export async function POST(req: Request) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  let body;
  try {
    body = schema.parse(await req.json());
  } catch (e) {
    return json({ error: 'invalid_body', details: (e as Error).message }, 400);
  }

  const user = await db.endUser.findFirst({ where: { id: body.userId, orgId: auth.orgId } });
  if (!user) return json({ error: 'user_not_found' }, 404);

  const amount = body.amountCents ?? user.walletCents;
  if (amount <= 0 || amount > user.walletCents) return json({ error: 'insufficient_balance' }, 400);

  const adapter = getPayoutAdapter();
  const result = await adapter.send({
    amountCents: amount,
    recipientEmail: user.email,
    recipientName: user.name,
    note: 'Referral rewards payout',
  });

  const payout = await db.$transaction(async (tx) => {
    const p = await tx.payout.create({
      data: {
        orgId: auth.orgId,
        userId: user.id,
        amountCents: amount,
        method: adapter.name,
        status: result.status,
        reference: result.reference,
        paidAt: result.status === 'paid' ? new Date() : null,
      },
    });
    await tx.endUser.update({ where: { id: user.id }, data: { walletCents: { decrement: amount } } });
    // Settle approved cash/credit rewards into this payout up to the amount.
    const rewards = await tx.reward.findMany({
      where: { userId: user.id, status: 'approved', type: { in: ['cash', 'credit'] } },
      orderBy: { createdAt: 'asc' },
    });
    let remaining = amount;
    for (const r of rewards) {
      if (remaining <= 0) break;
      await tx.reward.update({ where: { id: r.id }, data: { status: 'paid', payoutId: p.id } });
      remaining -= r.amountCents;
    }
    return p;
  });

  await audit(auth.orgId, auth.keyPrefix, 'payout.requested', payout.id, { amount, method: adapter.name });
  void emit('payout.paid', { orgId: auth.orgId, to: user.email, subject: 'Your payout is on the way 💸', data: { amount } });

  return json({ payoutId: payout.id, status: payout.status, reference: payout.reference }, 201);
}
