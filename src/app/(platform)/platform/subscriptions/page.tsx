import { db } from '@/lib/db';
import { requirePlatform } from '@/lib/auth';
import { formatCents } from '@/lib/config/campaign-config';
import { Card, SectionTitle, StatTile, StatusPill } from '@/components/ui';
import { StatCounter } from '@/components/stat-counter';
import { PlanSelect, StatusSelect } from '@/components/platform-controls';
import { CreditCard, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

const planLabel = (p: string) => p[0].toUpperCase() + p.slice(1);

export default async function SubscriptionsPage() {
  await requirePlatform();

  const [orgs, mrrAgg, active, pastDue, trialing] = await Promise.all([
    db.org.findMany({ orderBy: { mrrCents: 'desc' } }),
    db.org.aggregate({ where: { subStatus: { in: ['active', 'past_due'] } }, _sum: { mrrCents: true } }),
    db.org.count({ where: { subStatus: 'active' } }),
    db.org.count({ where: { subStatus: 'past_due' } }),
    db.org.count({ where: { subStatus: 'trialing' } }),
  ]);
  const mrr = mrrAgg._sum.mrrCents ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Subscriptions</h1>
        <p className="text-sm text-muted">Billing status and plan management across all clients.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="MRR" icon={CreditCard} accent="var(--success)"><StatCounter value={mrr / 100} prefix="$" decimals={0} /></StatTile>
        <StatTile label="Active" icon={TrendingUp} accent="var(--brand)"><StatCounter value={active} /></StatTile>
        <StatTile label="Trialing" icon={Clock} accent="var(--warning)"><StatCounter value={trialing} /></StatTile>
        <StatTile label="Past due" icon={AlertTriangle} accent="var(--danger)"><StatCounter value={pastDue} /></StatTile>
      </div>

      <Card>
        <SectionTitle title="Plans & billing" subtitle="Upgrade, downgrade, or change a client's status." />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2 font-medium">Client</th>
                <th className="px-3 py-2 font-medium">Plan</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 text-right font-medium">MRR</th>
                <th className="px-3 py-2 text-right font-medium">Seats</th>
                <th className="px-3 py-2 font-medium">Renews</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o.id} className="border-t border-border/60 hover:bg-surface-2/40">
                  <td className="px-3 py-3 font-medium">{o.name}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="chip border-brand/30 bg-brand/10 text-brand">{planLabel(o.plan)}</span>
                      <PlanSelect orgId={o.id} plan={o.plan} />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <StatusPill status={o.subStatus} />
                      <StatusSelect orgId={o.id} status={o.subStatus} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-medium">{formatCents(o.mrrCents)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted">{o.seats}</td>
                  <td className="px-3 py-3 text-xs text-muted">
                    {o.subStatus === 'trialing' && o.trialEndsAt
                      ? `trial ends ${o.trialEndsAt.toISOString().slice(0, 10)}`
                      : o.renewsAt
                        ? o.renewsAt.toISOString().slice(0, 10)
                        : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
