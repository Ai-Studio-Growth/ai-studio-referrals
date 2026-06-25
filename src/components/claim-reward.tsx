'use client';

import { useState, useTransition } from 'react';
import { ArrowRight, Loader2, PartyPopper, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { claimRewardAction } from '@/app/join/actions';

export function ClaimReward({ code, rewardLabel, org }: { code: string; rewardLabel: string | null; org: string }) {
  const [pending, start] = useTransition();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div className="animate-fade-up rounded-2xl border border-success/30 bg-success/10 p-6 text-center">
        <PartyPopper className="mx-auto mb-2 h-7 w-7 text-success" />
        <p className="text-lg font-semibold">Reward claimed!</p>
        <p className="mt-1 text-sm text-muted">
          {rewardLabel ? `Your ${rewardLabel} is on the way.` : 'Welcome aboard.'} Thanks for joining {org}.
        </p>
      </div>
    );
  }

  function claim() {
    setError(null);
    start(async () => {
      const res = await claimRewardAction(code, email);
      if (res.ok) {
        confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 }, startVelocity: 45 });
        setDone(true);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-sm space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email (optional)"
        className="w-full rounded-xl border bg-surface-2/60 px-3 py-2.5 text-center text-sm outline-none focus:ring-2 focus:ring-brand/30"
      />
      <button onClick={claim} disabled={pending} className="btn-brand w-full">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Claim my reward <ArrowRight className="h-4 w-4" /></>}
      </button>
      {error && (
        <p className="flex items-center justify-center gap-1.5 text-xs text-danger">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
    </div>
  );
}
