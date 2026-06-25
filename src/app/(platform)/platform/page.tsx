import { db } from '@/lib/db';
import { requirePlatform } from '@/lib/auth';
import { formatCents } from '@/lib/config/campaign-config';
import { Card, SectionTitle, StatTile, StatusPill } from '@/components/ui';
import { StatCounter } from '@/components/stat-counter';
import Link from 'next/link';
import { Building2, CreditCard, Coins, Users, TrendingUp, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

const planLabel = (p: string) => p[0].toUpperCase() + p.slice(1);

export default async function PlatformOverview() {
  await requirePlatform();

  const [orgs, activeSubs, trialing, pastDue, mrrAgg, referrers, conversions, rewardAgg, recent] = await Promise.all([
    db.org.count(),
    db.org.count({ where: { subStatus: 'active' } }),
    db.org.count({ where: { subStatus: 'trialing' } }),
    db.org.count({ where: { subStatus: 'past_due' } }),
    db.org.aggregate({ where: { subStatus: { in: ['active', 'past_due'] } }, _sum: { mrrCents: true } }),
    db.endUser.count({ where: { referralsMade: { some: {} } } }),
    db.conversion.count({ where: { status: 'approved' } }),
    db.reward.aggregate({ _sum: { amountCents: true } }),
    db.org.findMany({ orderBy: { createdAt: 'desc' }, take: 6, include: { _count: { select: { members: true, referrals: true } } } }),
  ]);

  const mrr = mrrAgg._sum.mrrCents ?? 0;
  const byPlan = await db.org.groupBy({ by: ['plan'], _count: { _all: true }, _sum: { mrrCents: true } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Platform overview</h1>
        <p className="text-sm text-muted">Health of every workspace on Ai Studio Referrals.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Clients" icon={Building2} accent="var(--brand)">
          <StatCounter value={orgs} />
        </StatTile>
        <StatTile label="MRR" icon={CreditCard} accent="var(--success)">
          <StatCounter value={mrr / 100} prefix="$" decimals={0} />
        </StatTile>
        <StatTile label="ARR (run-rate)" icon={TrendingUp} accent="var(--accent)">
          <StatCounter value={(mrr * 12) / 100} prefix="$" decimals={0} />
        </StatTile>
        <StatTile label="Reward spend" icon={Coins} accent="var(--warning)">
          <StatCounter value={(rewardAgg._sum.amountCents ?? 0) / 100} prefix="$" decimals={0} />
        </StatTile>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Subscription health */}
        <Card>
          <SectionTitle title="Subscription health" />
          <dl className="space-y-3 text-sm">
            <Row label="Active" value={activeSubs} tone="success" />
            <Row label="Trialing" value={trialing} tone="warning" />
            <Row label="Past due" value={pastDue} tone="danger" />
            <Row label="Total referrers" value={referrers} />
            <Row label="Approved conversions" value={conversions} />
          </dl>
        </Card>

        {/* Plan distribution */}
        <Card className="lg:col-span-2">
          <SectionTitle title="Revenue by plan" />
          <div className="space-y-3">
            {byPlan
              .sort((a, b) => (b._sum.mrrCents ?? 0) - (a._sum.mrrCents ?? 0))
              .map((p) => {
                const max = Math.max(...byPlan.map((x) => x._sum.mrrCents ?? 0), 1);
                return (
                  <div key={p.plan}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{planLabel(p.plan)}</span>
                      <span className="text-muted">
                        {p._count._all} client{p._count._all === 1 ? '' : 's'} · {formatCents(p._sum.mrrCents ?? 0)}/mo
                      </span>
                    </div>
                    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${((p._sum.mrrCents ?? 0) / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>

      {/* Recent clients */}
      <Card>
        <SectionTitle title="Newest clients" action={<Link href="/platform/clients" className="chip border-border hover:bg-surface-2">View all <ArrowRight className="h-3.5 w-3.5" /></Link>} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2 font-medium">Client</th>
                <th className="px-3 py-2 font-medium">Plan</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 text-right font-medium">MRR</th>
                <th className="px-3 py-2 text-right font-medium">Members</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-t border-border/60">
                  <td className="px-3 py-3 font-medium">{o.name}</td>
                  <td className="px-3 py-3"><span className="chip border-brand/30 bg-brand/10 text-brand">{planLabel(o.plan)}</span></td>
                  <td className="px-3 py-3"><StatusPill status={o.subStatus} /></td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCents(o.mrrCents)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted">{o._count.members}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: number; tone?: 'success' | 'warning' | 'danger' }) {
  const color = tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : tone === 'danger' ? 'text-danger' : 'text-fg';
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={`font-semibold tabular-nums ${color}`}>{value}</dd>
    </div>
  );
}
