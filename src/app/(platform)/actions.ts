'use server';

import { db } from '@/lib/db';
import { requirePlatform } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const PLAN_MRR: Record<string, number> = { free: 0, starter: 4900, growth: 9900, scale: 24900 };

/** Change a client's plan and/or subscription status. */
export async function updateSubscriptionAction(input: { orgId: string; plan?: string; subStatus?: string }) {
  await requirePlatform();
  const data: { plan?: string; subStatus?: string; mrrCents?: number } = {};
  if (input.plan) {
    data.plan = input.plan;
    data.mrrCents = PLAN_MRR[input.plan] ?? 0;
  }
  if (input.subStatus) data.subStatus = input.subStatus;
  await db.org.update({ where: { id: input.orgId }, data });
  revalidatePath('/platform/subscriptions');
  revalidatePath('/platform/clients');
  revalidatePath('/platform');
  return { ok: true as const };
}

/** Suspend or re-activate a user account. */
export async function setAccountStatusAction(input: { accountId: string; status: 'active' | 'suspended' }) {
  const { account } = await requirePlatform();
  if (input.accountId === account.id) return { ok: false as const, error: 'You cannot suspend yourself.' };
  await db.account.update({ where: { id: input.accountId }, data: { status: input.status } });
  // Suspending kills active sessions immediately.
  if (input.status === 'suspended') await db.session.deleteMany({ where: { accountId: input.accountId } });
  revalidatePath('/platform/users');
  return { ok: true as const };
}

/** Change a user's role (advertiser ↔ referrer ↔ super_admin). */
export async function setAccountRoleAction(input: { accountId: string; role: string }) {
  const { account } = await requirePlatform();
  if (input.accountId === account.id) return { ok: false as const, error: 'You cannot change your own role.' };
  await db.account.update({ where: { id: input.accountId }, data: { role: input.role } });
  revalidatePath('/platform/users');
  return { ok: true as const };
}

/** Toggle a client integration on/off. */
export async function toggleIntegrationAction(input: { integrationId: string }) {
  await requirePlatform();
  const intg = await db.integration.findUnique({ where: { id: input.integrationId } });
  if (!intg) return { ok: false as const };
  const next = intg.status === 'connected' ? 'disconnected' : 'connected';
  await db.integration.update({
    where: { id: intg.id },
    data: { status: next, connectedAt: next === 'connected' ? new Date() : null },
  });
  revalidatePath('/platform/integrations');
  return { ok: true as const, status: next };
}

// ── No-code: integration provider registry ───────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Add a brand-new integration provider to the catalog — no code change needed. */
export async function createIntegrationProviderAction(input: {
  name: string;
  category: string;
  description?: string;
  fields?: string; // newline list "key|Label|type"
}): Promise<{ ok: true } | { ok: false; error: string }> {
  await requirePlatform();
  const name = input.name.trim();
  if (name.length < 2) return { ok: false, error: 'Provider name is required.' };
  const slug = slugify(name);
  const existing = await db.integrationProvider.findUnique({ where: { slug } });
  if (existing) return { ok: false, error: 'A provider with that name already exists.' };

  const fields = (input.fields ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [key, label, type] = l.split('|').map((p) => p.trim());
      return { key: slugify(key || label || ''), label: label || key || '', type: type || 'text' };
    })
    .filter((f) => f.key);

  await db.integrationProvider.create({
    data: {
      slug,
      name,
      category: input.category || 'other',
      description: input.description?.trim() || null,
      fields: fields.length ? fields : undefined,
      enabled: true,
    },
  });
  revalidatePath('/platform/integrations');
  return { ok: true };
}

export async function toggleProviderEnabledAction(input: { id: string }) {
  await requirePlatform();
  const p = await db.integrationProvider.findUnique({ where: { id: input.id } });
  if (!p) return { ok: false as const };
  await db.integrationProvider.update({ where: { id: p.id }, data: { enabled: !p.enabled } });
  revalidatePath('/platform/integrations');
  return { ok: true as const, enabled: !p.enabled };
}

// ── No-code: platform settings (key/value) ───────────────────────────────────

export async function updatePlatformSettingAction(input: { id: string; value: string }) {
  await requirePlatform();
  await db.platformSetting.update({ where: { id: input.id }, data: { value: input.value } });
  revalidatePath('/platform/settings');
  return { ok: true as const };
}

export async function addPlatformSettingAction(input: {
  key: string;
  label: string;
  value: string;
  type: string;
  group: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  await requirePlatform();
  const key = slugify(input.key || input.label).replace(/-/g, '_');
  if (!key) return { ok: false, error: 'A key is required.' };
  const existing = await db.platformSetting.findUnique({ where: { key } });
  if (existing) return { ok: false, error: 'That setting key already exists.' };
  await db.platformSetting.create({
    data: { key, label: input.label || key, value: input.value, type: input.type || 'text', group: input.group || 'general' },
  });
  revalidatePath('/platform/settings');
  return { ok: true };
}

/** Send a notification (broadcast or targeted). */
export async function sendNotificationAction(input: {
  title: string;
  body: string;
  audience: string;
  channel: string;
}) {
  await requirePlatform();
  if (!input.title.trim() || !input.body.trim()) return { ok: false as const, error: 'Title and message are required.' };
  await db.notification.create({
    data: {
      title: input.title.trim(),
      body: input.body.trim(),
      audience: input.audience,
      channel: input.channel,
      status: 'sent',
    },
  });
  revalidatePath('/platform/notifications');
  return { ok: true as const };
}
