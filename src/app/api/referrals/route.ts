import { authenticateApi, json } from '@/lib/api-auth';
import { getOrCreateReferral } from '@/lib/referral/engine';
import { shortLink, landingLink, qrDataUrl } from '@/lib/referral/codes';
import { db } from '@/lib/db';
import { z } from 'zod';

/**
 * POST /api/referrals — instantly get (or create) a referral code for a user.
 * Idempotent: returns the existing code if the user already has one for the
 * campaign. This powers the embeddable widget's "generate my link" action.
 */
const createSchema = z.object({
  campaignId: z.string(),
  user: z.object({
    email: z.string().email(),
    name: z.string().optional(),
    avatarUrl: z.string().url().optional(),
  }),
});

export async function POST(req: Request) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  let body;
  try {
    body = createSchema.parse(await req.json());
  } catch (e) {
    return json({ error: 'invalid_body', details: (e as Error).message }, 400);
  }

  const campaign = await db.campaign.findFirst({ where: { id: body.campaignId, orgId: auth.orgId } });
  if (!campaign) return json({ error: 'campaign_not_found' }, 404);

  const user = await db.endUser.upsert({
    where: { orgId_email: { orgId: auth.orgId, email: body.user.email } },
    update: { name: body.user.name, avatarUrl: body.user.avatarUrl },
    create: { orgId: auth.orgId, email: body.user.email, name: body.user.name, avatarUrl: body.user.avatarUrl },
  });

  const referral = await getOrCreateReferral({ campaignId: campaign.id, referrerId: user.id });

  return json(
    {
      code: referral.code,
      shortLink: shortLink(referral.code),
      landingLink: landingLink(referral.code),
      qr: await qrDataUrl(referral.code),
    },
    201,
  );
}

/**
 * GET /api/referrals?campaignId=&page=&pageSize= — server-side paginated,
 * indexed listing of referrals for large tables.
 */
export async function GET(req: Request) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  const url = new URL(req.url);
  const campaignId = url.searchParams.get('campaignId') ?? undefined;
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') ?? '20')));

  const where = { orgId: auth.orgId, ...(campaignId ? { campaignId } : {}) };
  const [total, rows] = await Promise.all([
    db.referral.count({ where }),
    db.referral.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        referrer: { select: { name: true, email: true } },
        _count: { select: { clicks: true, conversions: true } },
      },
    }),
  ]);

  return json({
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    data: rows.map((r) => ({
      code: r.code,
      referrer: r.referrer.name ?? r.referrer.email,
      clicks: r._count.clicks,
      conversions: r._count.conversions,
      shortLink: shortLink(r.code),
      createdAt: r.createdAt,
    })),
  });
}
