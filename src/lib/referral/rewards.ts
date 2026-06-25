import {
  referrerRewardSchema,
  refereeRewardSchema,
  type RewardRule,
} from '@/lib/config/campaign-config';

export type ResolvedReward = {
  side: 'referrer' | 'referee';
  type: RewardRule['type'];
  amountCents: number;
  unit: string | null;
  quantity: number;
  badge?: string;
};

/** Turn a single reward rule into a concrete reward given the conversion value. */
function materialize(rule: RewardRule, side: 'referrer' | 'referee', valueCents: number): ResolvedReward {
  let amountCents = 0;
  let quantity = 0;
  let unit: string | null = rule.unit ?? null;

  switch (rule.type) {
    case 'cash':
    case 'credit':
      amountCents = rule.percentOfValue
        ? Math.round((valueCents * rule.percentOfValue) / 100)
        : Math.round(rule.amount);
      unit = 'cents';
      break;
    case 'discount':
      // amount is percent or flat-cents depending on unit; no wallet impact.
      quantity = rule.amount;
      unit = rule.unit ?? 'percent';
      break;
    case 'free_months':
      quantity = rule.amount;
      unit = 'months';
      break;
    case 'points':
      quantity = rule.amount;
      unit = 'points';
      break;
    case 'gift':
      quantity = 1;
      unit = 'gift';
      break;
  }

  return { side, type: rule.type, amountCents, unit, quantity };
}

/**
 * Given a campaign's reward config and the referrer's prior successful
 * conversion count, resolve all rewards to issue for a new conversion:
 *  - referrer base reward
 *  - any milestone/tier reward newly unlocked by this conversion
 *  - referee (double-sided) reward, if configured
 */
export function resolveRewards(args: {
  referrerRewardConfig: unknown;
  refereeRewardConfig: unknown | null;
  priorConversions: number; // referrer's successful conversions BEFORE this one
  valueCents: number;
}): ResolvedReward[] {
  const out: ResolvedReward[] = [];

  const referrerCfg = referrerRewardSchema.parse(args.referrerRewardConfig);
  out.push(materialize(referrerCfg.base, 'referrer', args.valueCents));

  // Milestone reached exactly at this conversion (priorConversions + 1).
  const reached = args.priorConversions + 1;
  for (const m of referrerCfg.milestones) {
    if (m.atConversions === reached) {
      const r = materialize(m.reward, 'referrer', args.valueCents);
      if (m.badge) r.badge = m.badge;
      out.push(r);
    }
  }

  if (args.refereeRewardConfig) {
    const refereeCfg = refereeRewardSchema.parse(args.refereeRewardConfig);
    out.push(materialize(refereeCfg, 'referee', args.valueCents));
  }

  return out;
}
