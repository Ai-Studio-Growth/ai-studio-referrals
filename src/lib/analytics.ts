import { db } from '@/lib/db';
import { getLeaderboard } from '@/lib/stats';

function monthKey(d: Date) {
  return d.toISOString().slice(0, 7); // YYYY-MM
}
function monthLabel(key: string) {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString('en-US', { month: 'short' });
}

/** Normalize a click referer into a coarse channel bucket. */
function channelOf(referer: string | null): string {
  if (!referer) return 'Direct';
  const r = referer.toLowerCase();
  if (r === 'direct') return 'Direct';
  if (r.includes('whatsapp') || r.includes('wa.me')) return 'WhatsApp';
  if (r.includes('twitter') || r.includes('x.com') || r.includes('t.co')) return 'X';
  if (r.includes('linkedin')) return 'LinkedIn';
  if (r.includes('facebook')) return 'Facebook';
  if (r.includes('t.me') || r.includes('telegram')) return 'Telegram';
  if (r.includes('mail') || r.includes('gmail')) return 'Email';
  if (r.includes('news.ycombinator')) return 'Hacker News';
  return 'Other';
}

export async function getAdvancedAnalytics(orgId: string) {
  const since = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

  const [clicks, approvedConv, totalConv, revenueAgg, rewardAgg, campaigns, topReferrers, recentConv, recentRewards, recentClicks] =
    await Promise.all([
      db.click.count({ where: { referral: { orgId } } }),
      db.conversion.count({ where: { orgId, status: 'approved' } }),
      db.conversion.count({ where: { orgId } }),
      db.conversion.aggregate({ where: { orgId, status: 'approved' }, _sum: { valueCents: true } }),
      db.reward.aggregate({ where: { orgId, type: { in: ['cash', 'credit'] } }, _sum: { amountCents: true } }),
      db.campaign.findMany({ where: { orgId }, include: { _count: { select: { referrals: true } } } }),
      getLeaderboard(orgId, 5),
      db.conversion.findMany({ where: { orgId, status: 'approved', createdAt: { gte: since } }, select: { createdAt: true } }),
      db.reward.findMany({ where: { orgId, type: { in: ['cash', 'credit'] }, createdAt: { gte: since } }, select: { createdAt: true, amountCents: true } }),
      db.click.findMany({ where: { referral: { orgId } }, select: { referer: true }, take: 5000 }),
    ]);

  const revenueCents = revenueAgg._sum.valueCents ?? 0;
  const spendCents = rewardAgg._sum.amountCents ?? 0;
  const convRate = clicks ? approvedConv / clicks : 0;
  const roi = spendCents ? revenueCents / spendCents : 0;

  // Per-campaign breakdown (approved conversions + reward spend).
  const campaignBreakdown = await Promise.all(
    campaigns.map(async (c) => {
      const [conv, spend] = await Promise.all([
        db.conversion.count({ where: { campaignId: c.id, status: 'approved' } }),
        db.reward.aggregate({ where: { campaignId: c.id, type: { in: ['cash', 'credit'] } }, _sum: { amountCents: true } }),
      ]);
      return {
        id: c.id,
        name: c.name,
        status: c.status,
        referrals: c._count.referrals,
        conversions: conv,
        spendCents: spend._sum.amountCents ?? 0,
      };
    }),
  );
  campaignBreakdown.sort((a, b) => b.conversions - a.conversions);

  // Last 6 months trend: conversions + reward spend.
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(monthKey(d));
  }
  const trend = months.map((key) => ({
    month: monthLabel(key),
    conversions: recentConv.filter((c) => monthKey(c.createdAt) === key).length,
    spend: recentRewards.filter((r) => monthKey(r.createdAt) === key).reduce((s, r) => s + r.amountCents, 0) / 100,
  }));

  // Channel breakdown from click referers.
  const channelMap = new Map<string, number>();
  for (const c of recentClicks) channelMap.set(channelOf(c.referer), (channelMap.get(channelOf(c.referer)) ?? 0) + 1);
  const channels = [...channelMap.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  return {
    kpis: { clicks, approvedConv, totalConv, convRate, revenueCents, spendCents, roi },
    campaignBreakdown,
    topReferrers,
    trend,
    channels,
  };
}
