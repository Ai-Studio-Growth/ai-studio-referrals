import { db } from '@/lib/db';
import { requireReferrer } from '@/lib/auth';
import { getReferrerStats, getReferrerTimeline } from '@/lib/stats';
import { getOrCreateReferral } from '@/lib/referral/engine';
import { shortLink, qrDataUrl } from '@/lib/referral/codes';
import { describeReward, tierFor } from '@/lib/config/campaign-config';
import { money } from '@/lib/money';
import { Card, SectionTitle, StatTile, ProgressBar, TierBadge, StatusPill, EmptyState } from '@/components/ui';
import { StatCounter } from '@/components/stat-counter';
import { ShareHub } from '@/components/share-hub';
import { Timeline } from '@/components/timeline';
import { PayoutButton } from '@/components/payout-button';
import { DemoConversionButton } from '@/components/demo-conversion-button';
import { MousePointerClick, Users, Sparkle, Coins, Gift } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { org, endUser: user } = await requireReferrer();

  // Ensure the referrer has a referral for the org's primary active campaign.
  const campaign =
    (await db.campaign.findFirst({ where: { orgId: org.id, status: 'active' }, orderBy: { createdAt: 'asc' } })) ??
    (await db.campaign.findFirstOrThrow({ where: { orgId: org.id } }));
  const referral = await getOrCreateReferral({ campaignId: campaign.id, referrerId: user.id });

  const [stats, timeline, qr, rewards] = await Promise.all([
    getReferrerStats(user.id),
    getReferrerTimeline(user.id, 14),
    qrDataUrl(referral.code),
    db.reward.findMany({
      where: { userId: user.id, side: 'referrer' },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { campaign: { select: { name: true } } },
    }),
  ]);

  const link = shortLink(referral.code);
  const refConfig = campaign.referrerReward as { base: Parameters<typeof describeReward>[0]; milestones: { atConversions: number; badge?: string; reward: Parameters<typeof describeReward>[0] }[] };
  const tier = tierFor(stats.conversions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={user.avatarUrl ?? ''} alt="" className="h-12 w-12 rounded-full border bg-surface-2" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Welcome back, {user.name?.split(' ')[0] ?? 'there'} 👋</h1>
            <p className="text-sm text-muted">
              {org.name} · {campaign.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TierBadge name={tier.current.name} color={tier.current.color} />
        </div>
      </div>

      {/* Stat bento */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Clicks" icon={MousePointerClick} accent="var(--accent)">
          <StatCounter value={stats.clicks} />
        </StatTile>
        <StatTile label="Signups" icon={Users} accent="var(--brand)">
          <StatCounter value={stats.signups} />
        </StatTile>
        <StatTile label="Conversions" icon={Sparkle} accent="var(--success)">
          <StatCounter value={stats.conversions} />
        </StatTile>
        <StatTile label="Earned" icon={Coins} accent="var(--warning)">
          <StatCounter value={(stats.earnings.approvedCents + stats.earnings.paidCents) / 100} prefix="$" decimals={2} />
        </StatTile>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: share + activity */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionTitle title="Your share hub" subtitle="One link, every channel — referees get a reward too." />
            <ShareHub
              shortLink={link}
              qr={qr}
              referralId={referral.id}
              code={referral.code}
              displayName={user.name ?? ''}
            />
            <div className="mt-4 border-t border-border pt-4">
              <DemoConversionButton code={referral.code} />
            </div>
          </Card>

          <Card>
            <SectionTitle title="Activity" subtitle="Live feed of clicks, conversions and rewards." />
            <Timeline items={timeline} />
          </Card>
        </div>

        {/* Right: tier progress + wallet + rewards */}
        <div className="space-y-6">
          <Card>
            <SectionTitle title="Tier progress" />
            <div className="flex items-center justify-between text-sm">
              <TierBadge name={tier.current.name} color={tier.current.color} />
              {tier.next ? <span className="text-muted">Next: {tier.next.name}</span> : <span className="text-success">Top tier 🏆</span>}
            </div>
            <div className="mt-3">
              <ProgressBar value={stats.conversions} max={tier.next?.min ?? (stats.conversions || 1)} />
              <p className="mt-2 text-xs text-muted">
                {tier.next
                  ? `${stats.toNextTier} more conversion${stats.toNextTier === 1 ? '' : 's'} to ${tier.next.name}`
                  : 'You’ve reached the highest tier.'}
              </p>
            </div>
            {refConfig.milestones?.length > 0 && (
              <ul className="mt-4 space-y-2">
                {refConfig.milestones.map((m) => {
                  const unlocked = stats.conversions >= m.atConversions;
                  return (
                    <li key={m.atConversions} className="flex items-center justify-between text-sm">
                      <span className={unlocked ? 'text-fg' : 'text-muted'}>
                        {m.badge ? `${m.badge} · ` : ''}
                        {describeReward(m.reward, org.currency)}
                      </span>
                      <span className="text-xs text-muted">
                        {unlocked ? '✓ unlocked' : `at ${m.atConversions}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <SectionTitle title="Reward wallet" />
            <div className="rounded-2xl bg-brand-gradient p-5 text-brand-fg shadow-glow">
              <p className="text-sm/none opacity-80">Available balance</p>
              <p className="mt-2 text-3xl font-semibold">
                <StatCounter value={stats.earnings.walletCents / 100} prefix="$" decimals={2} />
              </p>
              <div className="mt-3 flex justify-between text-xs opacity-80">
                <span>Pending {money(stats.earnings.pendingCents, org.currency)}</span>
                <span>Paid {money(stats.earnings.paidCents, org.currency)}</span>
              </div>
            </div>
            {stats.earnings.points > 0 && (
              <p className="mt-3 text-sm text-muted">+ {stats.earnings.points.toLocaleString()} points</p>
            )}
            <div className="mt-4">
              <PayoutButton userId={user.id} disabled={stats.earnings.walletCents <= 0} />
            </div>
          </Card>

          <Card>
            <SectionTitle title="Recent rewards" />
            {rewards.length === 0 ? (
              <EmptyState title="No rewards yet" />
            ) : (
              <ul className="space-y-2">
                {rewards.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2 rounded-xl px-2 py-2 hover:bg-surface-2/60">
                    <span className="flex items-center gap-2 text-sm">
                      <Gift className="h-4 w-4 text-brand" />
                      {r.type === 'cash' || r.type === 'credit' ? money(r.amountCents, org.currency) : `${r.quantity} ${r.unit}`}
                    </span>
                    <StatusPill status={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
