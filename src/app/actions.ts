'use server';

import { db } from '@/lib/db';
import { recordConversion, releaseMaturedHolds, audit, getOrCreateReferral } from '@/lib/referral/engine';
import { getPayoutAdapter } from '@/lib/adapters/payouts';
import { emit } from '@/lib/adapters/messaging';
import { shortLink } from '@/lib/referral/codes';
import { hashPassword } from '@/lib/password';
import { requireSession, requireWorkspace } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Advertiser invites a person to become a referrer: ensures an EndUser, creates a
 * referrer login (temp password) linked to it, generates their referral in the
 * primary campaign, and emails the invite. Returns the share link + temp password.
 */
export async function inviteReferrerAction(input: { email: string; name: string }) {
  const { org } = await requireWorkspace();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false as const, error: 'Enter a valid email.' };

  const campaign =
    (await db.campaign.findFirst({ where: { orgId: org.id, status: 'active' }, orderBy: { createdAt: 'asc' } })) ??
    (await db.campaign.findFirst({ where: { orgId: org.id } }));
  if (!campaign) return { ok: false as const, error: 'Create a campaign first.' };

  const endUser = await db.endUser.upsert({
    where: { orgId_email: { orgId: org.id, email } },
    update: { name: name || undefined },
    create: { orgId: org.id, email, name: name || null },
  });

  let tempPassword: string | null = null;
  const existing = await db.account.findUnique({ where: { email } });
  if (!existing) {
    tempPassword = `ref-${Math.random().toString(36).slice(2, 10)}`;
    await db.account.create({
      data: {
        email,
        name: name || email,
        passwordHash: await hashPassword(tempPassword),
        orgId: org.id,
        role: 'referrer',
        endUserId: endUser.id,
      },
    });
  } else if (!existing.endUserId) {
    await db.account.update({ where: { id: existing.id }, data: { endUserId: endUser.id, role: 'referrer', orgId: org.id } });
  }

  const referral = await getOrCreateReferral({ campaignId: campaign.id, referrerId: endUser.id });
  const link = shortLink(referral.code);

  void emit('referral.invited', {
    orgId: org.id,
    to: email,
    subject: `You're invited to refer & earn with ${org.name}`,
    data: { link, campaign: campaign.name },
  });
  await audit(org.id, 'advertiser', 'referrer.invited', endUser.id, { email });
  revalidatePath('/admin/referrers');
  return { ok: true as const, link, tempPassword };
}

/**
 * Server actions that back the interactive UI surfaces. These are the same
 * operations the public API exposes, wired for the in-app demo (no API key
 * round-trip needed since the session is already authenticated).
 */

// ── Customizable referral link ───────────────────────────────────────────────
// Slugify free text into a URL-safe referral code.
function slugifyCode(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
    .slice(0, 40);
}

export type CustomizeResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

/**
 * Let a referrer personalise their link two ways:
 *  - mode "name":   derive the code from their display name (auto-suffixed if taken)
 *  - mode "custom": use an exact custom code (must be globally unique)
 * Scoped to the authenticated workspace; persists Referral.code + EndUser.name.
 */
export async function customizeReferralAction(input: {
  referralId: string;
  mode: 'name' | 'custom';
  value: string;
}): Promise<CustomizeResult> {
  const { org } = await requireSession();
  if (!org) return { ok: false, error: 'No workspace.' };

  const referral = await db.referral.findUnique({ where: { id: input.referralId }, include: { referrer: true } });
  if (!referral || referral.orgId !== org.id) return { ok: false, error: 'Referral not found.' };

  let base = slugifyCode(input.value);
  if (base.length < 3) return { ok: false, error: 'Use at least 3 letters or numbers.' };

  if (input.mode === 'custom') {
    // Exact code requested — must be free (ignoring this referral's own code).
    const taken = await db.referral.findUnique({ where: { code: base } });
    if (taken && taken.id !== referral.id) return { ok: false, error: `“${base}” is already taken — try another.` };
  } else {
    // Name mode — auto-suffix to guarantee uniqueness.
    let candidate = base;
    for (let i = 0; i < 50; i++) {
      const taken = await db.referral.findUnique({ where: { code: candidate } });
      if (!taken || taken.id === referral.id) break;
      candidate = `${base}-${Math.random().toString(36).slice(2, 5)}`;
    }
    base = candidate;
  }

  await db.$transaction(async (tx) => {
    await tx.referral.update({ where: { id: referral.id }, data: { code: base } });
    if (input.mode === 'name') {
      await tx.endUser.update({ where: { id: referral.referrerId }, data: { name: input.value.trim() } });
    }
  });

  await audit(org.id, referral.referrer.email, 'referral.customized', referral.id, { code: base, mode: input.mode });
  revalidatePath('/dashboard');
  return { ok: true, code: base };
}

// Trigger a *test* conversion against a referral code — powers the "See it work"
// button on the dashboard so a referrer can watch a conversion + reward land.
export async function simulateConversionAction(code: string) {
  const referral = await db.referral.findUnique({ where: { code }, include: { campaign: true } });
  if (!referral) return { ok: false as const, reason: 'unknown_code' };

  const event =
    referral.campaign.triggerEvent === 'custom_event'
      ? referral.campaign.triggerCustomName ?? 'custom_event'
      : referral.campaign.triggerEvent;

  const result = await recordConversion({
    campaignId: referral.campaignId,
    event,
    code,
    refereeEmail: `friend.${Math.random().toString(36).slice(2, 8)}@example.com`,
    refereeName: 'Demo Friend',
    valueCents: 4900,
  });

  revalidatePath('/dashboard');
  revalidatePath('/admin');
  return result;
}

export async function requestPayoutAction(userId: string) {
  const user = await db.endUser.findUnique({ where: { id: userId } });
  if (!user || user.walletCents <= 0) return { ok: false as const, reason: 'no_balance' };

  const adapter = getPayoutAdapter();
  const amount = user.walletCents;
  const res = await adapter.send({ amountCents: amount, recipientEmail: user.email, recipientName: user.name });

  await db.$transaction(async (tx) => {
    const payout = await tx.payout.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        amountCents: amount,
        method: adapter.name,
        status: res.status,
        reference: res.reference,
        paidAt: res.status === 'paid' ? new Date() : null,
      },
    });
    await tx.endUser.update({ where: { id: user.id }, data: { walletCents: 0 } });
    await tx.reward.updateMany({
      where: { userId: user.id, status: 'approved', type: { in: ['cash', 'credit'] } },
      data: { status: 'paid', payoutId: payout.id },
    });
  });

  await audit(user.orgId, user.email, 'payout.requested', userId, { amount });
  revalidatePath('/dashboard');
  return { ok: true as const, amount, status: res.status };
}

// Admin: approve or reject a conversion sitting in the review queue.
export async function reviewConversionAction(conversionId: string, decision: 'approve' | 'reject') {
  const conv = await db.conversion.findUnique({ where: { id: conversionId } });
  if (!conv) return { ok: false as const };

  await db.$transaction(async (tx) => {
    await tx.conversion.update({
      where: { id: conversionId },
      data: { status: decision === 'approve' ? 'approved' : 'rejected' },
    });
    await tx.reward.updateMany({
      where: { conversionId },
      data: { status: decision === 'approve' ? 'approved' : 'rejected' },
    });
    await tx.fraudFlag.updateMany({
      where: { subjectType: 'conversion', subjectId: conversionId },
      data: { status: decision === 'approve' ? 'cleared' : 'confirmed' },
    });
    if (decision === 'approve') {
      const cashRewards = await tx.reward.findMany({
        where: { conversionId, type: { in: ['cash', 'credit'] } },
      });
      for (const r of cashRewards) {
        await tx.endUser.update({ where: { id: r.userId }, data: { walletCents: { increment: r.amountCents } } });
      }
    }
  });

  await audit(conv.orgId, 'admin', `conversion.${decision}`, conversionId);
  revalidatePath('/admin');
  return { ok: true as const };
}

export async function releaseHoldsAction(orgId: string) {
  const cleared = await releaseMaturedHolds(orgId);
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return { cleared };
}

// No-code campaign builder backing action.
export async function createCampaignAction(input: {
  name: string;
  description?: string;
  triggerEvent: string;
  attributionModel: string;
  attributionWindowDays: number;
  rewardHoldDays: number;
  referrerType: string;
  referrerAmount: number;
  refereeType?: string;
  refereeAmount?: number;
  refereeUnit?: string;
}) {
  // Scope the new campaign to the authenticated advertiser's workspace.
  const { org } = await requireWorkspace();
  const slug =
    input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
    '-' +
    Math.random().toString(36).slice(2, 6);

  const referrerUnit =
    input.referrerType === 'cash' || input.referrerType === 'credit'
      ? 'cents'
      : input.referrerType === 'points'
        ? 'points'
        : input.referrerType === 'free_months'
          ? 'months'
          : 'percent';

  const campaign = await db.campaign.create({
    data: {
      orgId: org.id,
      name: input.name,
      slug,
      description: input.description,
      triggerEvent: input.triggerEvent,
      attributionModel: input.attributionModel,
      attributionWindowDays: input.attributionWindowDays,
      rewardHoldDays: input.rewardHoldDays,
      status: 'active',
      referrerReward: {
        base: { type: input.referrerType, amount: input.referrerAmount, unit: referrerUnit, recurring: false },
        milestones: [],
      },
      refereeReward:
        input.refereeType && input.refereeAmount
          ? { type: input.refereeType, amount: input.refereeAmount, unit: input.refereeUnit ?? 'percent', recurring: false }
          : undefined,
    },
  });

  await audit(org.id, 'admin', 'campaign.created', campaign.id, { name: campaign.name });
  revalidatePath('/admin');
  return { ok: true as const, id: campaign.id };
}
