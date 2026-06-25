import { requireWorkspace } from '@/lib/auth';
import { getAdvancedAnalytics } from '@/lib/analytics';
import { money } from '@/lib/money';
import { Card, SectionTitle, StatTile, StatusPill, EmptyState, TierBadge } from '@/components/ui';
import { StatCounter } from '@/components/stat-counter';
import AnalyticsTrendChart from '@/components/analytics-trend-chart';
import { MousePointerClick, TrendingUp, Coins, Banknote, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const { org } = await requireWorkspace();
  const a = await getAdvancedAnalytics(org.id);
  const maxChannel = Math.max(...a.channels.map((c) => c.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
          <p className="text-sm text-muted">Performance, ROI, channels and campaign breakdown for {org.name}.</p>
        </div>
        <a href="/admin/analytics/export" className="btn-ghost !py-2 text-sm">
          <Download className="h-4 w-4" /> Export CSV
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Clicks" icon={MousePointerClick} accent="var(--accent)"><StatCounter value={a.kpis.clicks} /></StatTile>
        <StatTile label="Conv. rate" icon={TrendingUp} accent="var(--success)"><StatCounter value={a.kpis.convRate * 100} suffix="%" decimals={1} /></StatTile>
        <StatTile label="Revenue" icon={Banknote} accent="var(--brand)"><StatCounter value={a.kpis.revenueCents / 100} prefix="$" decimals={0} /></StatTile>
        <StatTile label="ROI" icon={Coins} accent="var(--warning)"><StatCounter value={a.kpis.roi} suffix="×" decimals={1} /></StatTile>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Conversions & reward spend" subtitle="Last 6 months" />
          <AnalyticsTrendChart data={a.trend} />
        </Card>

        <Card>
          <SectionTitle title="Top channels" subtitle="Where clicks come from" />
          {a.channels.length === 0 ? (
            <EmptyState title="No clicks yet" />
          ) : (
            <div className="space-y-3">
              {a.channels.slice(0, 7).map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-sm">
                    <span>{c.name}</span>
                    <span className="tabular-nums text-muted">{c.count}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${(c.count / maxChannel) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Campaign breakdown" subtitle="Conversions and spend per campaign" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-3 py-2 font-medium">Campaign</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 text-right font-medium">Referrers</th>
                  <th className="px-3 py-2 text-right font-medium">Conversions</th>
                  <th className="px-3 py-2 text-right font-medium">Spend</th>
                </tr>
              </thead>
              <tbody>
                {a.campaignBreakdown.map((c) => (
                  <tr key={c.id} className="border-t border-border/60 hover:bg-surface-2/40">
                    <td className="px-3 py-3 font-medium">{c.name}</td>
                    <td className="px-3 py-3"><StatusPill status={c.status} /></td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted">{c.referrals}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">{c.conversions}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{money(c.spendCents, org.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Top referrers" />
          {a.topReferrers.length === 0 ? (
            <EmptyState title="No referrers yet" />
          ) : (
            <ul className="space-y-2">
              {a.topReferrers.map((u, i) => (
                <li key={u.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-2/60">
                  <span className="w-4 text-sm text-muted">{i + 1}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.avatarUrl ?? ''} alt="" className="h-8 w-8 rounded-full border bg-surface-2" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <TierBadge name={u.tier.name} color={u.tier.color} />
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{u.conversions}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
