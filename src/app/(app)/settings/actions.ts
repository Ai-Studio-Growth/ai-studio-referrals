'use server';

import { db } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';
import { audit } from '@/lib/referral/engine';
import { revalidatePath } from 'next/cache';

/** Update workspace profile (name, currency, custom domain). */
export async function updateWorkspaceAction(input: { name: string; currency: string; customDomain: string }) {
  const { org } = await requireWorkspace();
  const name = input.name.trim();
  if (name.length < 2) return { ok: false as const, error: 'Workspace name is too short.' };
  const customDomain = input.customDomain.trim() || null;

  // Custom domain must be globally unique if set.
  if (customDomain) {
    const taken = await db.org.findFirst({ where: { customDomain, id: { not: org.id } } });
    if (taken) return { ok: false as const, error: 'That custom domain is already in use.' };
  }

  await db.org.update({ where: { id: org.id }, data: { name, currency: input.currency, customDomain } });
  await audit(org.id, 'admin', 'settings.workspace_updated', org.id);
  revalidatePath('/settings');
  revalidatePath('/admin');
  return { ok: true as const };
}

/** Update white-label branding colours (HSL triplets). */
export async function updateBrandingAction(input: { brandColor: string; accentColor: string }) {
  const { org } = await requireWorkspace();
  const hsl = /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/;
  if (!hsl.test(input.brandColor.trim()) || !hsl.test(input.accentColor.trim())) {
    return { ok: false as const, error: 'Use an HSL triplet like "256 88% 60%".' };
  }
  await db.org.update({
    where: { id: org.id },
    data: { brandColor: input.brandColor.trim(), accentColor: input.accentColor.trim() },
  });
  await audit(org.id, 'admin', 'settings.branding_updated', org.id);
  revalidatePath('/settings');
  return { ok: true as const };
}

/** Generate a new API key (returns the full key once). */
export async function createApiKeyAction(name: string) {
  const { org } = await requireWorkspace();
  const crypto = await import('crypto');
  const raw = `rl_live_${crypto.randomBytes(12).toString('hex')}`;
  await db.apiKey.create({
    data: {
      orgId: org.id,
      name: name.trim() || 'API key',
      prefix: raw.slice(0, 12),
      hashedKey: crypto.createHash('sha256').update(raw).digest('hex'),
    },
  });
  await audit(org.id, 'admin', 'settings.api_key_created', org.id);
  revalidatePath('/settings');
  return { ok: true as const, key: raw };
}

/** Invite a teammate (manager/viewer/admin). */
export async function inviteMemberAction(input: { email: string; name: string; role: string }) {
  const { org } = await requireWorkspace();
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false as const, error: 'Enter a valid email.' };
  const exists = await db.membership.findFirst({ where: { orgId: org.id, email } });
  if (exists) return { ok: false as const, error: 'That teammate is already a member.' };
  await db.membership.create({ data: { orgId: org.id, email, name: input.name.trim() || email, role: input.role } });
  await audit(org.id, 'admin', 'settings.member_invited', org.id, { email, role: input.role });
  revalidatePath('/settings');
  return { ok: true as const };
}
