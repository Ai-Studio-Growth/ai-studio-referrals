import { db } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';
import { getOrgAnalytics, getOrgTimeSeries } from '@/lib/stats';
import { describeReward } from '@/lib/config/campaign-config';
import { money } from '@/lib/money';
import { Card, SectionTitle, StatTile, StatusPill, EmptyState } from '@/components/ui';
import { StatCounter } from '@/components/stat-counter';
import { ReviewButtons } from '@/components/review-buttons';
import AdminChart from '@/components/admin-chart';
import {
  MousePointerClick,
  Users,
  TrendingUp,
  Coins,
  Activity,
  ShieldAlert,
  Beaker,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { org } = await requireWorkspace();
  const [analytics, series, campaigns, flags] = await Promise.all([
    getOrgAnalytics(org.id),
    getOrgTimeSeries(org.id, 30),
    db.campaign.findMany({
      where: { orgId: org.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { referrals: true, conversions: true } } },
    }),
    db.fraudFlag.findMany({ where: { orgId: org.id, status: 'open', subjectType: 'conversion' }, orderBy: { createdAt: 'desc' }, take: 12 }),
  ]);

  // Hydrate fraud queue with conversion + referrer context.
  const convIds = [...new Set(flags.map((f) => f.subjectId))];
  const convs = await db.conversion.findMany({
    where: { id: { in: convIds } },
    include: { referral: { include: { referrer: { select: { name: true, email: true } } } } },
  });
  const convById = new Map(convs.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back 👋</h2>
        <p className="text-sm text-muted">Here’s how {org.name}’s referral program is performing.</p>
      </div>

      {/* KPI bento */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total clicks" icon={MousePointerClick} accent="var(--accent)">
          <StatCounter value={analytics.clicks} />
        </StatTile>
        <StatTile label="Conversions" icon={Users} accent="var(--brand)">
          <StatCounter value={analytics.approvedConversions} />
        </StatTile>
        <StatTile label="Conv. rate" icon={TrendingUp} accent="var(--success)">
          <StatCounter value={analytics.conversionRate * 100} suffix="%" decimals={1} />
        </StatTile>
        <StatTile label="Reward spend" icon={Coins} accent="var(--warning)">
          <StatCounter value={analytics.rewardSpendCents / 100} prefix="$" decimals={0} />
        </StatTile>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart + funnel */}
        <Card className="lg:col-span-2">
          <SectionTitle title="Clicks vs conversions" subtitle="Last 30 days" action={<Activity className="h-4 w-4 text-muted" />} />
          <AdminChart data={series} />
        </Card>

        <Card>
          <SectionTitle title="Growth metrics" />
          <dl className="space-y-3 text-sm">
            <Metric label="Viral K-factor" value={analytics.kFactor.toFixed(2)} hint={analytics.kFactor >= 1 ? 'self-sustaining 🚀' : 'sub-viral'} />
            <Metric label="Referral CAC" value={money(Math.round(analytics.referralCac * 100), org.currency)} />
            <Metric label="CAC reduction" value={`${analytics.cacReductionPct.toFixed(0)}%`} hint="vs $40 baseline" />
            <Metric label="Active referrers" value={analytics.referrers.toLocaleString()} />
            <Metric label="End users" value={analytics.endUsers.toLocaleString()} />
          </dl>
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Funnel</p>
            <div className="space-y-2">
              {analytics.funnel.map((s) => {
                const max = analytics.funnel[0].value || 1;
                return (
                  <div key={s.stage}>
                    <div className="flex justify-between text-xs">
                      <span>{s.stage}</span>
                      <span className="tabular-nums text-muted">{s.value.toLocaleString()}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${(s.value / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Campaigns */}
      <Card id="campaigns" className="scroll-mt-24">
        <SectionTitle
          title="Campaigns"
          subtitle="Config-driven — trigger, reward, caps & eligibility. A/B variants share a key."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => {
            const base = (c.referrerReward as { base: Parameters<typeof describeReward>[0] }).base;
            return (
              <div key={c.id} className="rounded-2xl border bg-surface-2/40 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{c.name}</p>
                  <StatusPill status={c.status} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  Trigger: <span className="font-medium text-fg">{c.triggerEvent.replace('_', ' ')}</span> ·{' '}
                  {c.attributionModel.replace('_', ' ')} · {c.attributionWindowDays}d
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="chip border-brand/30 bg-brand/10 text-brand">{describeReward(base, org.currency)}</span>
                  {c.abTestKey && (
                    <span className="chip border-accent/30 bg-accent/10 text-accent">
                      <Beaker className="h-3 w-3" /> A/B {c.abWeight}%
                    </span>
                  )}
                </div>
                <div className="mt-3 flex justify-between text-xs text-muted">
                  <span>{c._count.referrals} referrers</span>
                  <span>{c._count.conversions} conversions</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Fraud review queue */}
      <Card id="fraud" className="scroll-mt-24">
        <SectionTitle
          title="Fraud review queue"
          subtitle="Flagged conversions held for manual review."
          action={<ShieldAlert className="h-4 w-4 text-danger" />}
        />
        {flags.length === 0 ? (
          <EmptyState title="Queue is clear" hint="No conversions are currently flagged." />
        ) : (
          <div className="space-y-2">
            {flags.map((f) => {
              const conv = convById.get(f.subjectId);
              return (
                <div key={f.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-surface-2/40 p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusPill status={f.severity === 'high' ? 'rejected' : 'pending'} />
                      <span className="text-sm font-medium capitalize">{f.reason.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {conv?.referral.referrer.name ?? conv?.referral.referrer.email ?? 'unknown'} ·{' '}
                      {conv ? money(conv.valueCents, org.currency) : ''}
                    </p>
                  </div>
                  {conv && <ReviewButtons conversionId={conv.id} />}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold">
        {value}
        {hint && <span className="ml-1 text-xs font-normal text-muted">{hint}</span>}
      </dd>
    </div>
  );
}
