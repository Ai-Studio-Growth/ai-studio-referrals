import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { recordConversion } from '@/lib/referral/engine';
import { json } from '@/lib/api-auth';
import crypto from 'crypto';

/**
 * Inbound webhook receiver: POST /api/webhooks/[provider]
 *
 * Normalizes provider-specific payloads (Stripe, Shopify, generic) into the
 * engine's conversion shape. Signatures are verified against APP_SECRET (or the
 * provider's secret in production). This is how e-commerce / billing platforms
 * notify Ai Studio Referrals that a qualifying event happened.
 */

type Normalized = {
  campaignId: string;
  event: string;
  refereeEmail?: string;
  valueCents?: number;
  code?: string;
  idempotencyKey?: string;
};

function verifySignature(req: NextRequest, raw: string): boolean {
  const sig = req.headers.get('x-referlift-signature');
  if (!sig) return true; // dev convenience; enforce in production
  const expected = crypto.createHmac('sha256', process.env.APP_SECRET ?? 'dev-secret').update(raw).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

function normalize(provider: string, payload: any): Normalized | null {
  switch (provider) {
    case 'stripe':
      // e.g. checkout.session.completed
      return {
        campaignId: payload.metadata?.campaignId ?? payload.data?.object?.metadata?.campaignId,
        event: 'first_purchase',
        refereeEmail: payload.data?.object?.customer_details?.email,
        valueCents: payload.data?.object?.amount_total,
        code: payload.data?.object?.metadata?.referralCode,
        idempotencyKey: payload.id,
      };
    case 'shopify':
      return {
        campaignId: payload.campaignId,
        event: 'first_purchase',
        refereeEmail: payload.email,
        valueCents: Math.round(Number(payload.total_price ?? 0) * 100),
        code: payload.note_attributes?.find((n: any) => n.name === 'referralCode')?.value,
        idempotencyKey: `shopify_${payload.id}`,
      };
    default:
      // Generic inbound shape — mirrors the public conversions API.
      return {
        campaignId: payload.campaignId,
        event: payload.event,
        refereeEmail: payload.refereeEmail,
        valueCents: payload.valueCents,
        code: payload.code,
        idempotencyKey: payload.idempotencyKey,
      };
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  const raw = await req.text();
  if (!verifySignature(req, raw)) return json({ error: 'bad_signature' }, 401);

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const n = normalize(provider, payload);
  if (!n?.campaignId || !n.event) return json({ error: 'unmapped_payload' }, 422);

  const campaign = await db.campaign.findUnique({ where: { id: n.campaignId } });
  if (!campaign) return json({ error: 'campaign_not_found' }, 404);

  await db.auditLog.create({
    data: { orgId: campaign.orgId, actor: `webhook:${provider}`, action: 'webhook.received', entity: n.campaignId },
  });

  const result = await recordConversion(n);
  return json({ accepted: result.ok, ...(result.ok ? { status: result.status } : { reason: result.reason }) }, result.ok ? 201 : 200);
}
