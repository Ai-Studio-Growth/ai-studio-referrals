import { authenticateApi, json } from '@/lib/api-auth';
import { recordConversion } from '@/lib/referral/engine';
import { z } from 'zod';

const bodySchema = z.object({
  campaignId: z.string(),
  event: z.string(),
  refereeEmail: z.string().email().optional(),
  refereeName: z.string().optional(),
  valueCents: z.number().int().nonnegative().optional(),
  code: z.string().optional(),
  ip: z.string().optional(),
  device: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

/**
 * POST /api/conversions
 * Public, API-key-authenticated trigger-event ingestion. A business calls this
 * (or routes a webhook to it) when a qualifying event fires. The engine handles
 * attribution, fraud screening, reward resolution, and audit logging.
 */
export async function POST(req: Request) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (e) {
    return json({ error: 'invalid_body', details: (e as Error).message }, 400);
  }

  // Fall back to the attribution cookie when no explicit code is supplied.
  const cookieCode = req.headers
    .get('cookie')
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('rl_ref='))
    ?.split('=')[1];

  const result = await recordConversion({ ...parsed, code: parsed.code ?? cookieCode ?? null });

  if (!result.ok) return json({ accepted: false, reason: result.reason }, 200);
  return json(
    {
      accepted: true,
      conversionId: result.conversionId,
      status: result.status,
      rewardsIssued: result.rewardsIssued,
      flagged: result.flagged,
    },
    201,
  );
}
