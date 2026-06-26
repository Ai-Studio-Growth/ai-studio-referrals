import { db } from '@/lib/db';
import { generateCode, hashValue } from './codes';
import { resolveRewards } from './rewards';
import { evaluateConversion, worstSeverity, looksLikeValidEmail } from './fraud';
import { isReferralExpired } from './expiry';
import { emit } from '@/lib/adapters/messaging';
import { dispatchOrgWebhooks } from '@/lib/webhooks';
import type { Prisma } from '@prisma/client';

/**
 * The universal referral engine. Everything here is config-driven by the
 * Campaign record — adding a new business never requires touching this file.
 */

// ── Audit ────────────────────────────────────────────────────────────────────
export async function audit(orgId: string, actor: string, action: string, entity?: string, metadata?: unknown) {
  await db.auditLog.create({
    data: { orgId, actor, action, entity, metadata: (metadata ?? undefined) as Prisma.InputJsonValue },
  });
}

// ── Referral code creation (instant) ─────────────────────────────────────────
export async function getOrCreateReferral(args: { campaignId: string; referrerId: string }) {
  const existing = await db.referral.findUnique({
    where: { campaignId_referrerId: { campaignId: args.campaignId, referrerId: args.referrerId } },
  });
  if (existing) return existing;

  const campaign = await db.campaign.findUniqueOrThrow({ where: { id: args.campaignId } });
  const referrer = await db.endUser.findUniqueOrThrow({ where: { id: args.referrerId } });

  // Retry on the (unlikely) code collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode(referrer.name ?? referrer.email);
    try {
      const referral = await db.referral.create({
        data: { orgId: campaign.orgId, campaignId: campaign.id, referrerId: referrer.id, code },
      });
      await audit(campaign.orgId, referrer.email, 'referral.created', referral.id, { code });
      return referral;
    } catch (e) {
      if (attempt === 4) throw e; // give up after retries
    }
  }
  throw new Error('Could not allocate a unique referral code');
}

// ── Click tracking (fast, async-friendly) ────────────────────────────────────
export async function recordClick(args: {
  code: string;
  ip?: string | null;
  device?: string | null;
  country?: string | null;
  userAgent?: string | null;
  referer?: string | null;
}) {
  const referral = await db.referral.findUnique({ where: { code: args.code } });
  if (!referral) return null;

  await db.click.create({
    data: {
      referralId: referral.id,
      ipHash: hashValue(args.ip),
      deviceHash: hashValue(args.device),
      country: args.country ?? null,
      userAgent: args.userAgent?.slice(0, 300) ?? null,
      referer: args.referer ?? null,
    },
  });
  await audit(referral.orgId, 'system', 'click.tracked', referral.id);
  return referral;
}

// ── Attribution ──────────────────────────────────────────────────────────────
// Given a referee identity + campaign, find the referral to credit using the
// campaign's attribution model and window.
async function attribute(args: {
  campaignId: string;
  attributionModel: string;
  windowDays: number;
  ipHash?: string | null;
  deviceHash?: string | null;
  explicitCode?: string | null;
}) {
  // An explicit code (from the cookie/link) always wins — strongest signal.
  if (args.explicitCode) {
    const r = await db.referral.findUnique({ where: { code: args.explicitCode } });
    if (r && r.campaignId === args.campaignId) return r;
  }

  // Otherwise match recent clicks by device/IP within the attribution window.
  const since = new Date(Date.now() - args.windowDays * 24 * 60 * 60 * 1000);
  const orFilters: Prisma.ClickWhereInput[] = [];
  if (args.deviceHash) orFilters.push({ deviceHash: args.deviceHash });
  if (args.ipHash) orFilters.push({ ipHash: args.ipHash });
  if (orFilters.length === 0) return null;

  const click = await db.click.findFirst({
    where: { createdAt: { gte: since }, referral: { campaignId: args.campaignId }, OR: orFilters },
    orderBy: { createdAt: args.attributionModel === 'first_touch' ? 'asc' : 'desc' },
    include: { referral: true },
  });
  return click?.referral ?? null;
}

// ── Conversion recording (the core trigger handler) ──────────────────────────
export type RecordConversionResult =
  | { ok: false; reason: string }
  | { ok: true; conversionId: string; status: string; rewardsIssued: number; flagged: string | null };

export async function recordConversion(args: {
  campaignId: string;
  event: string; // the trigger that fired
  refereeEmail?: string | null;
  refereeName?: string | null;
  valueCents?: number;
  code?: string | null; // explicit referral code from cookie/link
  ip?: string | null;
  device?: string | null;
  idempotencyKey?: string | null;
}): Promise<RecordConversionResult> {
  const campaign = await db.campaign.findUnique({ where: { id: args.campaignId } });
  if (!campaign) return { ok: false, reason: 'campaign_not_found' };
  if (campaign.status !== 'active') return { ok: false, reason: 'campaign_inactive' };

  // The configured trigger event must match.
  const expected = campaign.triggerEvent === 'custom_event' ? campaign.triggerCustomName : campaign.triggerEvent;
  if (expected && args.event !== expected) return { ok: false, reason: 'event_mismatch' };

  // Idempotency: webhooks may deliver more than once.
  if (args.idempotencyKey) {
    const dupe = await db.conversion.findUnique({ where: { idempotencyKey: args.idempotencyKey } });
    if (dupe) return { ok: true, conversionId: dupe.id, status: dupe.status, rewardsIssued: 0, flagged: null };
  }

  const ipHash = hashValue(args.ip);
  const deviceHash = hashValue(args.device);

  const referral = await attribute({
    campaignId: campaign.id,
    attributionModel: campaign.attributionModel,
    windowDays: campaign.attributionWindowDays,
    ipHash,
    deviceHash,
    explicitCode: args.code ?? null,
  });
  if (!referral) return { ok: false, reason: 'no_attribution' };

  // Config-driven referral expiry: an expired code can no longer earn a reward.
  if (isReferralExpired(referral.createdAt, campaign.eligibility)) {
    await audit(campaign.orgId, args.refereeEmail ?? 'system', 'conversion.rejected_expired', referral.id, {
      code: referral.code,
      event: args.event,
    });
    return { ok: false, reason: 'referral_expired' };
  }

  const referrer = await db.endUser.findUniqueOrThrow({ where: { id: referral.referrerId } });

  // Basic validation.
  if (args.refereeEmail && !looksLikeValidEmail(args.refereeEmail)) {
    return { ok: false, reason: 'invalid_referee_email' };
  }

  // Resolve / create the referee user (for double-sided rewards & dedupe).
  let refereeUserId: string | null = null;
  if (args.refereeEmail) {
    const referee = await db.endUser.upsert({
      where: { orgId_email: { orgId: campaign.orgId, email: args.refereeEmail } },
      update: { name: args.refereeName ?? undefined },
      create: { orgId: campaign.orgId, email: args.refereeEmail, name: args.refereeName ?? null },
    });
    refereeUserId = referee.id;
  }

  // Fraud evaluation → decide hold/review/reject.
  const signals = await evaluateConversion({
    orgId: campaign.orgId,
    referralId: referral.id,
    referrerEmail: referrer.email,
    refereeEmail: args.refereeEmail,
    ipHash,
    deviceHash,
  });
  const severity = worstSeverity(signals);

  // Caps: max rewards per user.
  if (campaign.maxRewardsPerUser != null) {
    const issued = await db.reward.count({
      where: { campaignId: campaign.id, userId: referrer.id, side: 'referrer' },
    });
    if (issued >= campaign.maxRewardsPerUser) return { ok: false, reason: 'reward_cap_reached' };
  }

  const valueCents = args.valueCents ?? 0;
  // high-severity → reject outright; medium → record but hold for manual review.
  const status = severity === 'high' ? 'rejected' : 'approved';

  const result = await db.$transaction(async (tx) => {
    const conversion = await tx.conversion.create({
      data: {
        orgId: campaign.orgId,
        campaignId: campaign.id,
        referralId: referral.id,
        refereeUserId,
        event: args.event,
        valueCents,
        status: status === 'rejected' ? 'rejected' : severity === 'medium' ? 'pending' : 'approved',
        attribution: campaign.attributionModel,
        idempotencyKey: args.idempotencyKey ?? null,
      },
    });

    for (const s of signals) {
      await tx.fraudFlag.create({
        data: {
          orgId: campaign.orgId,
          subjectType: 'conversion',
          subjectId: conversion.id,
          reason: s.reason,
          severity: s.severity,
          details: (s.details ?? undefined) as Prisma.InputJsonValue,
        },
      });
    }

    let rewardsIssued = 0;
    if (status !== 'rejected') {
      const priorConversions = await tx.conversion.count({
        where: { referral: { referrerId: referrer.id }, status: 'approved', id: { not: conversion.id } },
      });

      const resolved = resolveRewards({
        referrerRewardConfig: campaign.referrerReward,
        refereeRewardConfig: campaign.refereeReward,
        priorConversions,
        valueCents,
      });

      const holdUntil = new Date(Date.now() + campaign.rewardHoldDays * 24 * 60 * 60 * 1000);
      // medium severity → keep pending (manual review); else hold then auto-clear.
      const rewardStatus = severity === 'medium' ? 'pending' : 'pending';

      for (const r of resolved) {
        const userId = r.side === 'referrer' ? referrer.id : refereeUserId;
        if (!userId) continue; // referee reward but no referee identity
        await tx.reward.create({
          data: {
            orgId: campaign.orgId,
            campaignId: campaign.id,
            conversionId: conversion.id,
            userId,
            side: r.side,
            type: r.type,
            amountCents: r.amountCents,
            unit: r.unit,
            quantity: r.quantity,
            status: rewardStatus,
            holdUntil,
          },
        });
        rewardsIssued++;
      }
    }

    return { conversionId: conversion.id, status: conversion.status, rewardsIssued };
  });

  await audit(campaign.orgId, 'system', 'conversion.recorded', result.conversionId, {
    event: args.event,
    valueCents,
    flagged: severity,
    rewardsIssued: result.rewardsIssued,
  });

  // Fire-and-forget notifications via the messaging adapter.
  if (result.status !== 'rejected' && result.rewardsIssued > 0) {
    void emit('reward.issued', {
      orgId: campaign.orgId,
      to: referrer.email,
      subject: `You earned a reward from ${campaign.name}! 🎉`,
      data: { campaign: campaign.name, conversionId: result.conversionId },
    });
  }

  // Fan out to the org's registered webhook endpoints (signed, fire-and-forget).
  void dispatchOrgWebhooks(campaign.orgId, 'conversion.recorded', {
    conversionId: result.conversionId,
    campaignId: campaign.id,
    campaign: campaign.name,
    event: args.event,
    valueCents,
    status: result.status,
    rewardsIssued: result.rewardsIssued,
  });

  return { ok: true, ...result, flagged: severity };
}

// ── Reward lifecycle: release holds, approve, mark paid ──────────────────────
export async function releaseMaturedHolds(orgId?: string) {
  const now = new Date();
  const matured = await db.reward.findMany({
    where: { status: 'pending', holdUntil: { lte: now }, ...(orgId ? { orgId } : {}) },
    include: { conversion: true },
  });
  let cleared = 0;
  for (const reward of matured) {
    // Only clear if the underlying conversion is approved (not under review).
    if (reward.conversion && reward.conversion.status !== 'approved') continue;
    await db.$transaction(async (tx) => {
      await tx.reward.update({ where: { id: reward.id }, data: { status: 'approved' } });
      if ((reward.type === 'cash' || reward.type === 'credit') && reward.amountCents > 0) {
        await tx.endUser.update({
          where: { id: reward.userId },
          data: { walletCents: { increment: reward.amountCents } },
        });
      }
    });
    cleared++;
  }
  return cleared;
}
