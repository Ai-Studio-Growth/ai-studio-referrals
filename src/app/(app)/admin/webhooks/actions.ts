'use server';

import { db } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';
import { audit } from '@/lib/referral/engine';
import { newWebhookSecret, deliver } from '@/lib/webhooks';
import { revalidatePath } from 'next/cache';

export async function createWebhookAction(input: { url: string; events: string }) {
  const { org } = await requireWorkspace();
  const url = input.url.trim();
  if (!/^https?:\/\/.+/.test(url)) return { ok: false as const, error: 'Enter a valid http(s) URL.' };
  const secret = newWebhookSecret();
  await db.webhookEndpoint.create({
    data: { orgId: org.id, url, secret, events: input.events.trim() || '*', status: 'active' },
  });
  await audit(org.id, 'advertiser', 'webhook.created', org.id, { url });
  revalidatePath('/admin/webhooks');
  return { ok: true as const, secret };
}

export async function toggleWebhookAction(input: { id: string }) {
  const { org } = await requireWorkspace();
  const ep = await db.webhookEndpoint.findFirst({ where: { id: input.id, orgId: org.id } });
  if (!ep) return { ok: false as const };
  await db.webhookEndpoint.update({
    where: { id: ep.id },
    data: { status: ep.status === 'active' ? 'disabled' : 'active' },
  });
  revalidatePath('/admin/webhooks');
  return { ok: true as const };
}

export async function deleteWebhookAction(input: { id: string }) {
  const { org } = await requireWorkspace();
  const ep = await db.webhookEndpoint.findFirst({ where: { id: input.id, orgId: org.id } });
  if (!ep) return { ok: false as const };
  await db.webhookEndpoint.delete({ where: { id: ep.id } });
  await audit(org.id, 'advertiser', 'webhook.deleted', org.id);
  revalidatePath('/admin/webhooks');
  return { ok: true as const };
}

/** Send a signed test event to an endpoint and record the delivery. */
export async function sendTestWebhookAction(input: { id: string }) {
  const { org } = await requireWorkspace();
  const ep = await db.webhookEndpoint.findFirst({ where: { id: input.id, orgId: org.id } });
  if (!ep) return { ok: false as const, error: 'Endpoint not found.' };
  await deliver({ id: ep.id, url: ep.url, secret: ep.secret }, 'ping.test', { message: 'Test event from Ai Studio Referrals', orgId: org.id });
  revalidatePath('/admin/webhooks');
  return { ok: true as const };
}
