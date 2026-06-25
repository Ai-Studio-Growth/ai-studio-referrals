import { db } from '@/lib/db';
import crypto from 'crypto';

/**
 * Outbound webhooks. Each org can register endpoints; when a qualifying event
 * fires we POST a signed JSON payload and record the delivery. Signature header
 * `x-aisr-signature` = HMAC-SHA256(secret, rawBody) so receivers can verify.
 */

export function signPayload(secret: string, body: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

function endpointWantsEvent(events: string, event: string): boolean {
  if (events.trim() === '*' || events.trim() === '') return true;
  return events
    .split(',')
    .map((e) => e.trim())
    .includes(event);
}

/** Deliver `event` to one endpoint; record the result. Never throws. */
export async function deliver(endpoint: { id: string; url: string; secret: string }, event: string, data: unknown) {
  const body = JSON.stringify({ event, data, ts: Date.now() });
  try {
    const res = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-aisr-event': event,
        'x-aisr-signature': signPayload(endpoint.secret, body),
      },
      body,
      // Don't let a slow receiver hang the request path.
      signal: AbortSignal.timeout(8000),
    });
    await db.webhookDelivery.create({
      data: {
        endpointId: endpoint.id,
        event,
        status: res.ok ? 'success' : 'failed',
        statusCode: res.status,
        error: res.ok ? null : `HTTP ${res.status}`,
      },
    });
  } catch (e) {
    await db.webhookDelivery
      .create({
        data: { endpointId: endpoint.id, event, status: 'failed', error: (e as Error).message.slice(0, 300) },
      })
      .catch(() => {});
  }
}

/** Fan an event out to all of an org's active, subscribed endpoints (fire-and-forget). */
export async function dispatchOrgWebhooks(orgId: string, event: string, data: unknown) {
  const endpoints = await db.webhookEndpoint.findMany({ where: { orgId, status: 'active' } });
  await Promise.allSettled(
    endpoints
      .filter((e) => endpointWantsEvent(e.events, event))
      .map((e) => deliver({ id: e.id, url: e.url, secret: e.secret }, event, data)),
  );
}

export function newWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(24).toString('hex')}`;
}
