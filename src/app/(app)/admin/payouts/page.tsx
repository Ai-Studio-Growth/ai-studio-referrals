import { requireWorkspace } from '@/lib/auth';
import { db } from '@/lib/db';
import { money } from '@/lib/money';
import { Card, SectionTitle, StatTile, StatusPill, EmptyState } from '@/components/ui';
import { StatCounter } from '@/components/stat-counter';
import { PayUserButton, MarkPaidButton, RetryPayoutButton } from '@/components/payout-controls';
import { Wallet, CheckCircle2, Clock, Coins } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PayoutsPage() {
  const { org } = await requireWorkspace();

  const [payable, payouts, paidAgg] = await Promise.all([
    db.endUser.findMany({ where: { orgId: org.id, walletCents: { gt: 0 } }, orderBy: { walletCents: 'desc' } }),
    db.payout.findMany({ where: { orgId: org.id }, orderBy: { createdAt: 'desc' }, take: 30, include: { user: { select: { name: true, email: true } } } }),
    db.payout.aggregate({ where: { orgId: org.id, status: 'paid' }, _sum: { amountCents: true } }),
  ]);

  const payableTotal = payable.reduce((s, u) => s + u.walletCents, 0);
  const pendingTotal = payouts.filter((p) => p.status !== 'paid' && p.status !== 'failed').reduce((s, p) => s + p.amountCents, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Payouts</h2>
        <p className="text-sm text-muted">Pay referrers their cleared balances and track payout status.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Payable now" icon={Wallet} accent="var(--brand)"><StatCounter value={payableTotal / 100} prefix="$" decimals={0} /></StatTile>
        <StatTile label="Total paid" icon={CheckCircle2} accent="var(--success)"><StatCounter value={(paidAgg._sum.amountCents ?? 0) / 100} prefix="$" decimals={0} /></StatTile>
        <StatTile label="In progress" icon={Clock} accent="var(--warning)"><StatCounter value={pendingTotal / 100} prefix="$" decimals={0} /></StatTile>
        <StatTile label="Referrers owed" icon={Coins} accent="var(--accent)"><StatCounter value={payable.length} /></StatTile>
      </div>

      {/* Payable balances */}
      <Card>
        <SectionTitle title="Payable balances" subtitle="Referrers with cleared rewards ready to withdraw." />
        {payable.length === 0 ? (
          <EmptyState title="Nothing to pay out" hint="Balances appear here once rewards clear their hold period." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-3 py-2 font-medium">Referrer</th>
                  <th className="px-3 py-2 text-right font-medium">Balance</th>
                  <th className="px-3 py-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {payable.map((u) => (
                  <tr key={u.id} className="border-t border-border/60 hover:bg-surface-2/40">
                    <td className="px-3 py-3">
                      <p className="font-medium">{u.name ?? u.email}</p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">{money(u.walletCents, org.currency)}</td>
                    <td className="px-3 py-3"><div className="flex justify-end"><PayUserButton userId={u.id} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* History */}
      <Card>
        <SectionTitle title="Payout history" subtitle={`${payouts.length} most recent`} />
        {payouts.length === 0 ? (
          <EmptyState title="No payouts yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-3 py-2 font-medium">Referrer</th>
                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                  <th className="px-3 py-2 font-medium">Method</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-t border-border/60 hover:bg-surface-2/40">
                    <td className="px-3 py-3">{p.user.name ?? p.user.email}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">{money(p.amountCents, org.currency)}</td>
                    <td className="px-3 py-3 capitalize text-muted">{p.method}</td>
                    <td className="px-3 py-3"><StatusPill status={p.status === 'paid' ? 'paid' : p.status === 'failed' ? 'rejected' : p.status === 'processing' ? 'processing' : 'pending'} /></td>
                    <td className="px-3 py-3 text-xs text-muted">{(p.paidAt ?? p.createdAt).toISOString().slice(0, 10)}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        {p.status === 'processing' && <MarkPaidButton payoutId={p.id} />}
                        {p.status === 'failed' && <RetryPayoutButton payoutId={p.id} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
