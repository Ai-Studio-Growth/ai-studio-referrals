'use server';

import { db } from '@/lib/db';
import { normalizeCode } from '@/lib/referral/codes';
import { recordConversion } from '@/lib/referral/engine';

/**
 * Public referee action — claims the welcome reward by recording an attributed
 * conversion for the referral code. No auth: this is the invited friend.
 */
export async function claimRewardAction(code: string, email?: string) {
  const referral = await db.referral.findUnique({
    where: { code: normalizeCode(code) },
    include: { campaign: true },
  });
  if (!referral) return { ok: false as const, error: 'This invite link is no longer valid.' };

  const c = referral.campaign;
  const event = c.triggerEvent === 'custom_event' ? c.triggerCustomName ?? 'custom_event' : c.triggerEvent;

  const res = await recordConversion({
    campaignId: c.id,
    event,
    code: normalizeCode(code),
    refereeEmail: email?.trim() || undefined,
    valueCents: 0,
  });

  if (!res.ok) return { ok: false as const, error: 'We could not validate this claim. Please try again.' };
  return { ok: true as const };
}
