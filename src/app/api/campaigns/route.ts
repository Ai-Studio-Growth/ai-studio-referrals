import { authenticateApi, json } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { audit } from '@/lib/referral/engine';
import {
  referrerRewardSchema,
  refereeRewardSchema,
  eligibilitySchema,
  TRIGGER_EVENTS,
} from '@/lib/config/campaign-config';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  triggerEvent: z.enum(TRIGGER_EVENTS),
  triggerCustomName: z.string().optional(),
  attributionModel: z.enum(['first_touch', 'last_touch']).default('last_touch'),
  attributionWindowDays: z.number().int().positive().default(30),
  rewardHoldDays: z.number().int().nonnegative().default(7),
  maxRewardsPerUser: z.number().int().positive().nullable().optional(),
  totalBudgetCents: z.number().int().positive().nullable().optional(),
  referrerReward: referrerRewardSchema,
  refereeReward: refereeRewardSchema.nullable().optional(),
  eligibility: eligibilitySchema.optional(),
});

/** GET /api/campaigns — list campaigns for the authenticated org. */
export async function GET(req: Request) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  const campaigns = await db.campaign.findMany({
    where: { orgId: auth.orgId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { referrals: true, conversions: true } } },
  });
  return json({ data: campaigns });
}

/** POST /api/campaigns — no-code campaign creation (validated config). */
export async function POST(req: Request) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  let body;
  try {
    body = createSchema.parse(await req.json());
  } catch (e) {
    return json({ error: 'invalid_config', details: (e as Error).message }, 400);
  }

  const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const campaign = await db.campaign.create({
    data: {
      orgId: auth.orgId,
      name: body.name,
      slug,
      description: body.description,
      triggerEvent: body.triggerEvent,
      triggerCustomName: body.triggerCustomName,
      attributionModel: body.attributionModel,
      attributionWindowDays: body.attributionWindowDays,
      rewardHoldDays: body.rewardHoldDays,
      maxRewardsPerUser: body.maxRewardsPerUser ?? null,
      totalBudgetCents: body.totalBudgetCents ?? null,
      referrerReward: body.referrerReward,
      refereeReward: body.refereeReward ?? undefined,
      eligibility: body.eligibility ?? undefined,
    },
  });
  await audit(auth.orgId, auth.keyPrefix, 'campaign.created', campaign.id, { name: campaign.name });

  return json({ id: campaign.id, slug: campaign.slug }, 201);
}
