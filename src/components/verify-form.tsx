'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { verifyAction, resendAction, type AuthState } from '@/lib/auth-actions';
import { OtpInput } from '@/components/otp-input';

const RESEND_COOLDOWN = 30;

export function VerifyForm({
  email,
  purpose,
  channels,
}: {
  email: string;
  purpose: 'signup' | 'login';
  channels: string[];
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(verifyAction, {});
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function resend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setNotice(null);
    const res = await resendAction();
    setResending(false);
    setNotice(res.error ?? res.notice ?? 'A new code is on its way.');
    setCooldown(RESEND_COOLDOWN);
  }

  const fe = state.fieldErrors ?? {};
  const where = channels.includes('whatsapp') ? 'email and WhatsApp' : 'email';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {purpose === 'signup' ? 'Verify your account' : 'Confirm it’s you'}
        </h1>
        <p className="mt-1 text-sm text-muted">
          We sent a 6-digit code to your {where}
          {email ? (
            <>
              {' '}
              (<span className="font-medium text-fg">{maskEmail(email)}</span>)
            </>
          ) : null}
          . Enter it below to continue.
        </p>
      </div>

      {state.error && (
        <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <OtpInput />
          {fe.code && <p className="mt-2 text-center text-xs text-danger">{fe.code}</p>}
        </div>

        <button type="submit" disabled={pending} className="btn-brand w-full py-3 text-base">
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Verify <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {notice && (
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-success">
          <CheckCircle2 className="h-3.5 w-3.5" /> {notice}
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0 || resending}
          className="font-medium text-brand hover:underline disabled:text-muted disabled:no-underline"
        >
          {resending ? 'Sending…' : cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
        <Link href={purpose === 'signup' ? '/signup' : '/login'} className="text-muted hover:text-fg">
          Use a different {purpose === 'signup' ? 'email' : 'account'}
        </Link>
      </div>
    </div>
  );
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const head = user.length <= 2 ? user[0] ?? '' : user.slice(0, 2);
  return `${head}${'•'.repeat(Math.max(1, user.length - head.length))}@${domain}`;
}
