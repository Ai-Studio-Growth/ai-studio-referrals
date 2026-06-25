'use client';

import { useState, useTransition } from 'react';
import { Wallet } from 'lucide-react';
import { requestPayoutAction } from '@/app/actions';

export function PayoutButton({ userId, disabled }: { userId: string; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <button
        disabled={disabled || pending}
        onClick={() =>
          startTransition(async () => {
            const res = await requestPayoutAction(userId);
            setMsg(res.ok ? `Payout ${res.status}!` : 'Nothing to withdraw');
            setTimeout(() => setMsg(null), 3500);
          })
        }
        className="btn-brand w-full"
      >
        <Wallet className="h-4 w-4" />
        {pending ? 'Processing…' : 'Withdraw to bank'}
      </button>
      {msg && <span className="text-sm text-muted">{msg}</span>}
    </div>
  );
}
