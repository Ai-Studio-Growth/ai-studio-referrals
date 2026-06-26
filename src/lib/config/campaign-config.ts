import { z } from 'zod';

/**
 * Campaign configuration shapes. These define the *config-driven* surface of the
 * referral engine — businesses launch campaigns by setting these values (in the
 * admin builder or via API), never by editing engine code.
 */

// ── Trigger events ───────────────────────────────────────────────────────────
export const TRIGGER_EVENTS = [
  'signup',
  'first_purchase',
  'subscription',
  'kyc_complete',
  'custom_event',
] as const;
export type TriggerEvent = (typeof TRIGGER_EVENTS)[number];

// ── Reward types ─────────────────────────────────────────────────────────────
export const REWARD_TYPES = [
  'cash',
  'credit',
  'discount',
  'free_months',
  'points',
  'gift',
] as const;
export type RewardType = (typeof REWARD_TYPES)[number];

// A single reward rule. `recurring` rewards re-issue on each qualifying event
// (e.g. revenue share for every month the referee pays).
export const rewardRuleSchema = z.object({
  type: z.enum(REWARD_TYPES),
  // For cash/credit: amount in cents. For discount: the number (percent or cents).
  // For points/free_months: the quantity.
  amount: z.number().nonnegative().default(0),
  // discount → "percent" | "flat"; free_months → "months"; points → "points"
  unit: z.enum(['percent', 'flat', 'months', 'points', 'cents']).optional(),
  // Percentage-of-conversion-value reward (e.g. 10% of order). Mutually useful
  // with `type: cash|credit`. 0–100.
  percentOfValue: z.number().min(0).max(100).optional(),
  label: z.string().optional(), // human label, e.g. "$20 cash"
  recurring: z.boolean().default(false),
});
export type RewardRule = z.infer<typeof rewardRuleSchema>;

// Milestone/tiered rewards: unlock extra rewards at N successful conversions.
export const milestoneSchema = z.object({
  atConversions: z.number().int().positive(),
  reward: rewardRuleSchema,
  badge: z.string().optional(),
});
export type Milestone = z.infer<typeof milestoneSchema>;

// The referrer reward config supports a base reward + optional milestones (tiers).
export const referrerRewardSchema = z.object({
  base: rewardRuleSchema,
  milestones: z.array(milestoneSchema).default([]),
});
export type ReferrerRewardConfig = z.infer<typeof referrerRewardSchema>;

// Double-sided: the referee (invited friend) reward, e.g. a welcome discount.
export const refereeRewardSchema = rewardRuleSchema;

// ── Eligibility ──────────────────────────────────────────────────────────────
export const eligibilitySchema = z.object({
  newUsersOnly: z.boolean().default(true),
  allowedCountries: z.array(z.string()).optional(), // ISO codes; empty = all
  minOrderCents: z.number().nonnegative().optional(),
  blockDisposableEmail: z.boolean().default(true),
  // Referral codes (and the QR / short links that encode them) expire this many
  // days after creation. Omit or 0 = codes never expire. Enforced by the engine.
  referralExpiryDays: z.number().int().positive().optional(),
});
export type Eligibility = z.infer<typeof eligibilitySchema>;

// ── Fraud thresholds (sensible defaults; overridable per org later) ──────────
export const fraudConfig = {
  maxClicksPerIpPerHour: 40,
  maxConversionsPerIpPerDay: 3,
  maxConversionsPerDevicePerDay: 2,
  blockSelfReferral: true,
};

// Tier ladder used by the leaderboard / gamification surface.
export const TIERS = [
  { name: 'Bronze', min: 0, color: '28 60% 52%' },
  { name: 'Silver', min: 3, color: '210 16% 66%' },
  { name: 'Gold', min: 8, color: '43 90% 55%' },
  { name: 'Platinum', min: 15, color: '190 70% 60%' },
  { name: 'Diamond', min: 30, color: '256 88% 68%' },
] as const;

export function tierFor(conversions: number) {
  let current: (typeof TIERS)[number] = TIERS[0];
  let next: (typeof TIERS)[number] | null = null;
  for (let i = 0; i < TIERS.length; i++) {
    if (conversions >= TIERS[i].min) {
      current = TIERS[i];
      next = TIERS[i + 1] ?? null;
    }
  }
  return { current, next };
}

// Helper to format a reward rule into a short human label.
export function describeReward(r: RewardRule, currency = 'USD'): string {
  if (r.label) return r.label;
  switch (r.type) {
    case 'cash':
    case 'credit': {
      if (r.percentOfValue) return `${r.percentOfValue}% ${r.type === 'cash' ? 'cash back' : 'credit'}`;
      return `${formatCents(r.amount, currency)} ${r.type}`;
    }
    case 'discount':
      return r.unit === 'percent' ? `${r.amount}% off` : `${formatCents(r.amount, currency)} off`;
    case 'free_months':
      return `${r.amount} free month${r.amount === 1 ? '' : 's'}`;
    case 'points':
      return `${r.amount.toLocaleString()} points`;
    case 'gift':
      return r.label ?? 'Gift';
    default:
      return 'Reward';
  }
}

export function formatCents(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}
