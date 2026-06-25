'use client';

import { useState, useTransition } from 'react';
import { Loader2, Check } from 'lucide-react';
import { updateProfileAction, changePasswordAction } from '@/app/profile/actions';

const field = 'w-full rounded-xl border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30';
const label = 'mb-1.5 block text-xs font-medium text-muted';

export function ProfileInfoForm({ name, email }: { name: string; email: string }) {
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ name, email });
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Full name</label>
        <input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label className={label}>Email</label>
        <input className={field} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => start(async () => {
            setMsg(null); setError(null);
            const r = await updateProfileAction(form);
            if (r.ok) setMsg('Saved ✓'); else setError(r.error);
            setTimeout(() => setMsg(null), 2500);
          })}
          disabled={pending}
          className="btn-brand !py-2 text-sm"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save profile
        </button>
        {error && <span className="text-xs text-danger">{error}</span>}
        {msg && <span className="text-xs text-success">{msg}</span>}
      </div>
    </div>
  );
}

export function PasswordForm() {
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ current: '', next: '' });
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Current password</label>
        <input type="password" className={field} value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
      </div>
      <div>
        <label className={label}>New password</label>
        <input type="password" className={field} value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => start(async () => {
            setMsg(null); setError(null);
            const r = await changePasswordAction(form);
            if (r.ok) { setMsg('Password changed ✓'); setForm({ current: '', next: '' }); } else setError(r.error);
            setTimeout(() => setMsg(null), 2500);
          })}
          disabled={pending}
          className="btn-brand !py-2 text-sm"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Update password
        </button>
        {error && <span className="text-xs text-danger">{error}</span>}
        {msg && <span className="text-xs text-success">{msg}</span>}
      </div>
    </div>
  );
}
