'use client';

import { useTransition } from 'react';
import { Loader2, Wallet, Check, RotateCcw } from 'lucide-react';
import { payoutUserAction, markPayoutPaidAction, retryPayoutAction } from '@/app/(app)/admin/payouts/actions';

export function PayUserButton({ userId }: { userId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(() => payoutUserAction(userId).then(() => {}))}
      className="chip border-brand/30 bg-brand/10 text-brand hover:bg-brand/20"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wallet className="h-3.5 w-3.5" />} Pay out
    </button>
  );
}

export function MarkPaidButton({ payoutId }: { payoutId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(() => markPayoutPaidAction(payoutId).then(() => {}))}
      className="chip border-success/30 bg-success/10 text-success hover:bg-success/20"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Mark paid
    </button>
  );
}

export function RetryPayoutButton({ payoutId }: { payoutId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(() => retryPayoutAction(payoutId).then(() => {}))}
      className="chip border-border bg-surface-2 hover:bg-surface"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />} Retry
    </button>
  );
}
