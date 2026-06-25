'use server';

import { db } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';
import { audit } from '@/lib/referral/engine';
import { getPayoutAdapter } from '@/lib/adapters/payouts';
import { emit } from '@/lib/adapters/messaging';
import { revalidatePath } from 'next/cache';

/** Advertiser-initiated payout of a referrer's full cleared balance. */
export async function payoutUserAction(userId: string) {
  const { org } = await requireWorkspace();
  const user = await db.endUser.findFirst({ where: { id: userId, orgId: org.id } });
  if (!user || user.walletCents <= 0) return { ok: false as const, error: 'No balance to pay out.' };

  const adapter = getPayoutAdapter();
  const amount = user.walletCents;
  const res = await adapter.send({ amountCents: amount, recipientEmail: user.email, recipientName: user.name, note: 'Referral payout' });

  const payout = await db.$transaction(async (tx) => {
    const p = await tx.payout.create({
      data: {
        orgId: org.id,
        userId: user.id,
        amountCents: amount,
        method: adapter.name,
        status: res.status,
        reference: res.reference,
        paidAt: res.status === 'paid' ? new Date() : null,
      },
    });
    await tx.endUser.update({ where: { id: user.id }, data: { walletCents: 0 } });
    await tx.reward.updateMany({
      where: { userId: user.id, status: 'approved', type: { in: ['cash', 'credit'] } },
      data: { status: 'paid', payoutId: p.id },
    });
    return p;
  });

  await audit(org.id, 'advertiser', 'payout.created', payout.id, { amount, method: adapter.name });
  void emit('payout.paid', { orgId: org.id, to: user.email, subject: 'Your payout is on the way 💸', data: { amount } });
  revalidatePath('/admin/payouts');
  return { ok: true as const, status: res.status };
}

/** Mark a processing/requested payout as paid (e.g. external transfer cleared). */
export async function markPayoutPaidAction(payoutId: string) {
  const { org } = await requireWorkspace();
  const p = await db.payout.findFirst({ where: { id: payoutId, orgId: org.id } });
  if (!p || p.status === 'paid') return { ok: false as const };
  await db.payout.update({ where: { id: p.id }, data: { status: 'paid', paidAt: new Date() } });
  await audit(org.id, 'advertiser', 'payout.marked_paid', p.id);
  revalidatePath('/admin/payouts');
  return { ok: true as const };
}

/** Retry a failed payout through the configured adapter. */
export async function retryPayoutAction(payoutId: string) {
  const { org } = await requireWorkspace();
  const p = await db.payout.findFirst({ where: { id: payoutId, orgId: org.id }, include: { user: true } });
  if (!p || p.status === 'paid') return { ok: false as const };
  const adapter = getPayoutAdapter();
  const res = await adapter.send({ amountCents: p.amountCents, recipientEmail: p.user.email, recipientName: p.user.name });
  await db.payout.update({
    where: { id: p.id },
    data: { status: res.status, reference: res.reference, method: adapter.name, paidAt: res.status === 'paid' ? new Date() : null },
  });
  await audit(org.id, 'advertiser', 'payout.retried', p.id, { status: res.status });
  revalidatePath('/admin/payouts');
  return { ok: true as const, status: res.status };
}
