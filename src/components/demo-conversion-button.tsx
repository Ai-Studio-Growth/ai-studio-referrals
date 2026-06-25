'use client';

import { useState, useTransition } from 'react';
import { Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { simulateConversionAction } from '@/app/actions';

/** "See it work" — fires a test conversion against the user's code and celebrates. */
export function DemoConversionButton({ code }: { code: string }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function run() {
    startTransition(async () => {
      const res = await simulateConversionAction(code);
      if (res.ok) {
        confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 }, startVelocity: 45 });
        setMsg(`Conversion tracked · ${res.rewardsIssued} reward(s) issued`);
      } else {
        setMsg(`No reward: ${res.reason}`);
      }
      setTimeout(() => setMsg(null), 4000);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={run} disabled={pending} className="btn-brand">
        <Zap className="h-4 w-4" />
        {pending ? 'Simulating…' : 'Simulate a conversion'}
      </button>
      {msg && <span className="animate-fade-up text-sm text-muted">{msg}</span>}
    </div>
  );
}
