import { requireWorkspace } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * GET /admin/analytics/export — CSV of the workspace's conversions.
 * Auth-guarded to the advertiser's own org.
 */
export async function GET() {
  const { org } = await requireWorkspace();

  const conversions = await db.conversion.findMany({
    where: { orgId: org.id },
    orderBy: { createdAt: 'desc' },
    take: 5000,
    include: {
      campaign: { select: { name: true } },
      referral: { include: { referrer: { select: { name: true, email: true } } } },
      refereeUser: { select: { email: true } },
    },
  });

  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ['date', 'campaign', 'event', 'status', 'value_cents', 'referrer', 'referrer_email', 'referee_email', 'code'];
  const lines = [header.join(',')];
  for (const c of conversions) {
    lines.push(
      [
        c.createdAt.toISOString(),
        c.campaign.name,
        c.event,
        c.status,
        c.valueCents,
        c.referral.referrer.name ?? '',
        c.referral.referrer.email,
        c.refereeUser?.email ?? '',
        c.referral.code,
      ]
        .map(esc)
        .join(','),
    );
  }

  const csv = lines.join('\n');
  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="conversions-${org.slug}.csv"`,
    },
  });
}
