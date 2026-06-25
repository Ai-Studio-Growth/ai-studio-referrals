import type { Prisma } from '@prisma/client';

/**
 * Referral-code expiry — fully config-driven, no schema change.
 *
 * A campaign opts in via `eligibility.referralExpiryDays` (see campaign-config).
 * A referral code — and the QR / short link that encodes it — is valid until
 * `createdAt + referralExpiryDays`. Omitted, zero, or negative ⇒ never expires.
 *
 * Enforced at the edge redirect (`/r/[code]`) and at conversion attribution
 * (`engine.recordConversion`), so an expired code neither tracks nor earns.
 */
export function expiryDaysFromEligibility(
  eligibility: Prisma.JsonValue | null | undefined,
): number | null {
  if (!eligibility || typeof eligibility !== 'object' || Array.isArray(eligibility)) return null;
  const v = (eligibility as Record<string, unknown>).referralExpiryDays;
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : null;
}

/** The absolute expiry instant for a referral, or null when it never expires. */
export function referralExpiresAt(createdAt: Date, expiryDays: number | null): Date | null {
  if (!expiryDays || expiryDays <= 0) return null;
  return new Date(createdAt.getTime() + expiryDays * 24 * 60 * 60 * 1000);
}

/** True when `now` is at or past the referral's expiry instant. */
export function isReferralExpired(
  createdAt: Date,
  eligibility: Prisma.JsonValue | null | undefined,
  now: Date = new Date(),
): boolean {
  const expiresAt = referralExpiresAt(createdAt, expiryDaysFromEligibility(eligibility));
  return expiresAt != null && now.getTime() >= expiresAt.getTime();
}
