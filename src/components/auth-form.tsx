'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Building2, AlertCircle, ArrowRight } from 'lucide-react';
import { loginAction, signupAction, type AuthState } from '@/lib/auth-actions';

const field =
  'w-full rounded-xl border bg-surface-2/60 pl-10 pr-10 py-2.5 text-sm outline-none transition-colors focus:border-brand/60 focus:ring-2 focus:ring-brand/30';
const labelCls = 'mb-1.5 block text-xs font-medium text-muted';

function strength(pw: string): { score: number; label: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
  return { score: s, label: ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][s] };
}

const BARS = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-accent', 'bg-success'];

export function AuthForm({ mode, next }: { mode: 'login' | 'signup'; next?: string }) {
  const action = mode === 'login' ? loginAction : signupAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState('');
  const st = strength(pw);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {mode === 'signup' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="name">Full name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input id="name" name="name" autoComplete="name" placeholder="Ada Lovelace" className={field} />
            </div>
            {fe.name && <p className="mt-1 text-xs text-danger">{fe.name}</p>}
          </div>
          <div>
            <label className={labelCls} htmlFor="company">Workspace</label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input id="company" name="company" autoComplete="organization" placeholder="Acme Inc." className={field} />
            </div>
            {fe.company && <p className="mt-1 text-xs text-danger">{fe.company}</p>}
          </div>
        </div>
      )}

      <div>
        <label className={labelCls} htmlFor="email">Work email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            className={field}
          />
        </div>
        {fe.email && <p className="mt-1 text-xs text-danger">{fe.email}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className={labelCls} htmlFor="password">Password</label>
          {mode === 'login' && (
            <Link href="/login" className="mb-1.5 text-xs text-brand hover:underline">
              Forgot?
            </Link>
          )}
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="password"
            name="password"
            type={showPw ? 'text' : 'password'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
            className={field}
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {fe.password && <p className="mt-1 text-xs text-danger">{fe.password}</p>}

        {mode === 'signup' && pw.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${i < st.score ? BARS[st.score] : 'bg-surface-2'}`}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-muted">{st.label}</p>
          </div>
        )}
      </div>

      {next && <input type="hidden" name="next" value={next} />}

      <button type="submit" disabled={pending} className="btn-brand w-full py-3 text-base">
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {mode === 'login' ? 'Log in' : 'Create account'} <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-muted">
        {mode === 'login' ? (
          <>
            New here?{' '}
            <Link href="/signup" className="font-medium text-brand hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-brand hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
