'use client';

import { useTransition } from 'react';
import { Check, X } from 'lucide-react';
import { reviewConversionAction } from '@/app/actions';

export function ReviewButtons({ conversionId }: { conversionId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex gap-2">
      <button
        disabled={pending}
        onClick={() => startTransition(() => reviewConversionAction(conversionId, 'approve').then(() => {}))}
        className="chip border-success/30 bg-success/10 text-success hover:bg-success/20"
      >
        <Check className="h-3.5 w-3.5" /> Approve
      </button>
      <button
        disabled={pending}
        onClick={() => startTransition(() => reviewConversionAction(conversionId, 'reject').then(() => {}))}
        className="chip border-danger/30 bg-danger/10 text-danger hover:bg-danger/20"
      >
        <X className="h-3.5 w-3.5" /> Reject
      </button>
    </div>
  );
}
