import { db } from '@/lib/db';
import { tierFor } from '@/lib/config/campaign-config';

// ── Referrer-level stats (personal dashboard) ────────────────────────────────
export async function getReferrerStats(userId: string) {
  const referrals = await db.referral.findMany({
    where: { referrerId: userId },
    include: {
      campaign: true,
      _count: { select: { clicks: true, conversions: true } },
      conversions: { select: { status: true } },
    },
  });

  const referralIds = referrals.map((r) => r.id);
  const clicks = referrals.reduce((s, r) => s + r._count.clicks, 0);
  const conversions = await db.conversion.findMany({
    where: { referralId: { in: referralIds } },
    select: { status: true, event: true },
  });
  const approved = conversions.filter((c) => c.status === 'approved').length;
  const pendingConv = conversions.filter((c) => c.status === 'pending').length;
  const signups = conversions.length;

  const rewards = await db.reward.findMany({ where: { userId, side: 'referrer' } });
  const cashRewards = rewards.filter((r) => r.type === 'cash' || r.type === 'credit');
  const pendingCents = cashRewards.filter((r) => r.status === 'pending').reduce((s, r) => s + r.amountCents, 0);
  const approvedCents = cashRewards.filter((r) => r.status === 'approved').reduce((s, r) => s + r.amountCents, 0);
  const paidCents = cashRewards.filter((r) => r.status === 'paid').reduce((s, r) => s + r.amountCents, 0);
  const points = rewards.filter((r) => r.type === 'points').reduce((s, r) => s + r.quantity, 0);

  const user = await db.endUser.findUniqueOrThrow({ where: { id: userId } });
  const { current, next } = tierFor(approved);

  return {
    user,
    referrals,
    clicks,
    signups,
    conversions: approved,
    pendingConversions: pendingConv,
    conversionRate: clicks ? approved / clicks : 0,
    earnings: { pendingCents, approvedCents, paidCents, walletCents: user.walletCents, points },
    tier: current,
    nextTier: next,
    toNextTier: next ? Math.max(0, next.min - approved) : 0,
  };
}

export type TimelineItem = {
  id: string;
  type: 'click' | 'conversion' | 'reward';
  label: string;
  detail?: string;
  status?: string;
  at: Date;
};

export async function getReferrerTimeline(userId: string, limit = 20): Promise<TimelineItem[]> {
  const referrals = await db.referral.findMany({ where: { referrerId: userId }, select: { id: true } });
  const ids = referrals.map((r) => r.id);

  const [clicks, conversions, rewards] = await Promise.all([
    db.click.findMany({ where: { referralId: { in: ids } }, orderBy: { createdAt: 'desc' }, take: limit }),
    db.conversion.findMany({ where: { referralId: { in: ids } }, orderBy: { createdAt: 'desc' }, take: limit }),
    db.reward.findMany({ where: { userId, side: 'referrer' }, orderBy: { createdAt: 'desc' }, take: limit }),
  ]);

  const items: TimelineItem[] = [
    ...clicks.map((c) => ({
      id: `c-${c.id}`,
      type: 'click' as const,
      label: 'New click on your link',
      detail: c.country ?? undefined,
      at: c.createdAt,
    })),
    ...conversions.map((c) => ({
      id: `v-${c.id}`,
      type: 'conversion' as const,
      label: c.status === 'approved' ? 'Referral converted 🎉' : 'Referral pending review',
      detail: c.event,
      status: c.status,
      at: c.createdAt,
    })),
    ...rewards.map((r) => ({
      id: `r-${r.id}`,
      type: 'reward' as const,
      label: `Reward ${r.status}`,
      detail: r.type,
      status: r.status,
      at: r.createdAt,
    })),
  ];

  return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}

// ── Org-level analytics (admin dashboard) ────────────────────────────────────
export async function getOrgAnalytics(orgId: string) {
  const [referrers, referrals, clicks, conversions, approvedConv, rewards, endUsers] = await Promise.all([
    db.endUser.count({ where: { orgId, referralsMade: { some: {} } } }),
    db.referral.count({ where: { orgId } }),
    db.click.count({ where: { referral: { orgId } } }),
    db.conversion.count({ where: { orgId } }),
    db.conversion.count({ where: { orgId, status: 'approved' } }),
    db.reward.findMany({ where: { orgId } }),
    db.endUser.count({ where: { orgId } }),
  ]);

  const cashOut = rewards
    .filter((r) => r.type === 'cash' || r.type === 'credit')
    .reduce((s, r) => s + r.amountCents, 0);

  // K-factor ≈ invites per user × conversion rate. Approximate invites by clicks.
  const invitesPerUser = referrers ? clicks / referrers : 0;
  const convRate = clicks ? approvedConv / clicks : 0;
  const kFactor = invitesPerUser * convRate;

  // Assume a baseline blended CAC of $40 for the ROI illustration; referral CAC
  // is reward spend per acquired customer.
  const referralCac = approvedConv ? cashOut / 100 / approvedConv : 0;
  const baselineCac = 40;
  const cacReductionPct = baselineCac ? Math.max(0, (1 - referralCac / baselineCac) * 100) : 0;

  return {
    referrers,
    referrals,
    clicks,
    conversions,
    approvedConversions: approvedConv,
    conversionRate: convRate,
    rewardSpendCents: cashOut,
    kFactor,
    referralCac,
    cacReductionPct,
    endUsers,
    funnel: [
      { stage: 'Clicks', value: clicks },
      { stage: 'Signups', value: conversions },
      { stage: 'Conversions', value: approvedConv },
      { stage: 'Rewarded', value: rewards.filter((r) => r.side === 'referrer').length },
    ],
  };
}

// 30-day time series of clicks vs conversions for the admin chart.
export async function getOrgTimeSeries(orgId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [clicks, conversions] = await Promise.all([
    db.click.findMany({ where: { referral: { orgId }, createdAt: { gte: since } }, select: { createdAt: true } }),
    db.conversion.findMany({ where: { orgId, createdAt: { gte: since } }, select: { createdAt: true } }),
  ]);

  const buckets = new Map<string, { date: string; clicks: number; conversions: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key.slice(5), clicks: 0, conversions: 0 });
  }
  for (const c of clicks) {
    const k = c.createdAt.toISOString().slice(0, 10);
    const b = buckets.get(k);
    if (b) b.clicks++;
  }
  for (const c of conversions) {
    const k = c.createdAt.toISOString().slice(0, 10);
    const b = buckets.get(k);
    if (b) b.conversions++;
  }
  return [...buckets.values()];
}

// Cross-tenant referrer performance (platform admin).
export async function getGlobalReferrers(limit = 100) {
  const users = await db.endUser.findMany({
    where: { referralsMade: { some: {} } },
    include: {
      org: { select: { name: true, currency: true } },
      referralsMade: { select: { id: true, _count: { select: { clicks: true } } } },
    },
  });

  const rows = await Promise.all(
    users.map(async (u) => {
      const referralIds = u.referralsMade.map((r) => r.id);
      const conversions = await db.conversion.count({ where: { referralId: { in: referralIds }, status: 'approved' } });
      const clicks = u.referralsMade.reduce((s, r) => s + r._count.clicks, 0);
      const earnings = await db.reward.aggregate({
        where: { userId: u.id, side: 'referrer', type: { in: ['cash', 'credit'] } },
        _sum: { amountCents: true },
      });
      return {
        id: u.id,
        name: u.name ?? u.email,
        email: u.email,
        avatarUrl: u.avatarUrl,
        org: u.org.name,
        currency: u.org.currency,
        clicks,
        conversions,
        earningsCents: earnings._sum.amountCents ?? 0,
        tier: tierFor(conversions).current,
      };
    }),
  );

  return rows.sort((a, b) => b.conversions - a.conversions || b.earningsCents - a.earningsCents).slice(0, limit);
}

export async function getLeaderboard(orgId: string, limit = 20) {
  const users = await db.endUser.findMany({
    where: { orgId, referralsMade: { some: {} } },
    include: {
      referralsMade: { select: { id: true, _count: { select: { clicks: true } } } },
    },
  });

  const rows = await Promise.all(
    users.map(async (u) => {
      const referralIds = u.referralsMade.map((r) => r.id);
      const conversions = await db.conversion.count({
        where: { referralId: { in: referralIds }, status: 'approved' },
      });
      const clicks = u.referralsMade.reduce((s, r) => s + r._count.clicks, 0);
      const earnings = await db.reward.aggregate({
        where: { userId: u.id, side: 'referrer', type: { in: ['cash', 'credit'] } },
        _sum: { amountCents: true },
      });
      return {
        id: u.id,
        name: u.name ?? u.email,
        avatarUrl: u.avatarUrl,
        conversions,
        clicks,
        earningsCents: earnings._sum.amountCents ?? 0,
        tier: tierFor(conversions).current,
      };
    }),
  );

  return rows.sort((a, b) => b.conversions - a.conversions || b.earningsCents - a.earningsCents).slice(0, limit);
}
