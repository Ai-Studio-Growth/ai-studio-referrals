import { db } from '@/lib/db';
import { normalizeCode } from '@/lib/referral/codes';
import { describeReward } from '@/lib/config/campaign-config';
import { Card } from '@/components/ui';
import { ClaimReward } from '@/components/claim-reward';
import { Gift, ShieldCheck, Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

/** Frictionless referee landing page — clear value prop + the referee reward. */
export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const code = normalizeCode((await params).code);
  const referral = await db.referral.findUnique({
    where: { code },
    include: { campaign: true, referrer: true, org: true },
  });
  if (!referral) notFound();

  const { campaign, referrer, org } = referral;
  const refereeReward = campaign.refereeReward
    ? describeReward(campaign.refereeReward as Parameters<typeof describeReward>[0], org.currency)
    : null;

  return (
    <div className="mx-auto max-w-xl py-8">
      <Card className="relative overflow-hidden p-8 text-center">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-mesh opacity-80" />
        <div className="relative">
          <span className="chip mx-auto mb-4 w-fit border-brand/30 bg-brand/10 text-brand">
            <Sparkles className="h-3.5 w-3.5" /> {org.name}
          </span>

          <div className="mx-auto mb-4 flex items-center justify-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={referrer.avatarUrl ?? ''} alt="" className="h-10 w-10 rounded-full border bg-surface-2" />
            <p className="text-sm text-muted">
              <span className="font-semibold text-fg">{referrer.name ?? 'A friend'}</span> invited you
            </p>
          </div>

          <h1 className="text-balance text-3xl font-bold tracking-tight">
            {refereeReward ? (
              <>
                Get <span className="bg-brand-gradient bg-clip-text text-transparent">{refereeReward}</span>
              </>
            ) : (
              <>Join {org.name} and start earning</>
            )}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-pretty text-muted">
            {campaign.description ?? 'Sign up with this invite to claim your welcome reward.'}
          </p>

          {refereeReward && (
            <div className="mx-auto mt-6 flex max-w-sm items-center gap-3 rounded-2xl border bg-surface p-4 text-left">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient text-brand-fg shadow-glow">
                <Gift className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Your welcome reward</p>
                <p className="text-sm text-muted">{refereeReward} — applied after you join.</p>
              </div>
            </div>
          )}

          <ClaimReward code={code} rewardLabel={refereeReward} org={org.name} />

          <p className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="h-3.5 w-3.5" /> Protected by Ai Studio Referrals fraud screening · code{' '}
            <span className="font-mono">{code}</span>
          </p>
        </div>
      </Card>

      <p className="mt-4 text-center text-xs text-muted">
        Referrer earns{' '}
        {describeReward((campaign.referrerReward as { base: Parameters<typeof describeReward>[0] }).base, org.currency)} when you
        convert · within a {campaign.attributionWindowDays}-day window ({campaign.attributionModel.replace('_', ' ')}).
      </p>
    </div>
  );
}
