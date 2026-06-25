'use client';

import { useState, useTransition } from 'react';
import { Loader2, Check, Copy, KeyRound, UserPlus } from 'lucide-react';
import { CURRENCIES } from '@/lib/money';
import {
  updateWorkspaceAction,
  updateBrandingAction,
  createApiKeyAction,
  inviteMemberAction,
} from '@/app/(app)/settings/actions';

const field = 'w-full rounded-xl border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30';
const label = 'mb-1.5 block text-xs font-medium text-muted';

function Status({ msg, error }: { msg: string | null; error: string | null }) {
  if (error) return <p className="text-xs text-danger">{error}</p>;
  if (msg) return <p className="text-xs text-success">{msg}</p>;
  return null;
}

export function WorkspaceForm({ name, currency, customDomain }: { name: string; currency: string; customDomain: string }) {
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ name, currency, customDomain });
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setMsg(null); setError(null);
    start(async () => {
      const r = await updateWorkspaceAction(form);
      if (r.ok) setMsg('Saved ✓'); else setError(r.error);
      setTimeout(() => setMsg(null), 2500);
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Workspace name</label>
        <input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label className={label}>Currency</label>
        <select className={field} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={label}>Custom domain</label>
        <input className={field} placeholder="refer.yourbrand.com" value={form.customDomain} onChange={(e) => setForm({ ...form, customDomain: e.target.value })} />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={pending} className="btn-brand !py-2 text-sm">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save changes
        </button>
        <Status msg={msg} error={error} />
      </div>
    </div>
  );
}

export function BrandingForm({ brandColor, accentColor }: { brandColor: string; accentColor: string }) {
  const [pending, start] = useTransition();
  const [brand, setBrand] = useState(brandColor);
  const [accent, setAccent] = useState(accentColor);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setMsg(null); setError(null);
    start(async () => {
      const r = await updateBrandingAction({ brandColor: brand, accentColor: accent });
      if (r.ok) setMsg('Saved ✓'); else setError(r.error);
      setTimeout(() => setMsg(null), 2500);
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>Brand color (HSL)</label>
        <div className="flex items-center gap-2">
          <span className="h-9 w-9 shrink-0 rounded-lg border border-border" style={{ background: `hsl(${brand})` }} />
          <input className={field} value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
      </div>
      <div>
        <label className={label}>Accent color (HSL)</label>
        <div className="flex items-center gap-2">
          <span className="h-9 w-9 shrink-0 rounded-lg border border-border" style={{ background: `hsl(${accent})` }} />
          <input className={field} value={accent} onChange={(e) => setAccent(e.target.value)} />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface-2/50 p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Live preview</p>
        <button className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-glow" style={{ background: `linear-gradient(135deg, hsl(${brand}), hsl(${accent}))` }}>
          Refer &amp; earn
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={pending} className="btn-brand !py-2 text-sm">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save branding
        </button>
        <Status msg={msg} error={error} />
      </div>
    </div>
  );
}

export function ApiKeyCreate() {
  const [pending, start] = useTransition();
  const [name, setName] = useState('');
  const [key, setKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-3 space-y-3 border-t border-border pt-3">
      {key ? (
        <div className="rounded-xl border border-success/30 bg-success/10 p-3">
          <p className="mb-1 text-xs font-medium text-success">New key — copy it now, shown once:</p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate font-mono text-sm">{key}</code>
            <button onClick={() => { navigator.clipboard.writeText(key); setCopied(true); }} className="chip border-border bg-surface">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input className={field} placeholder="Key name (e.g. Production)" value={name} onChange={(e) => setName(e.target.value)} />
          <button
            onClick={() => start(async () => { const r = await createApiKeyAction(name); if (r.ok) setKey(r.key); })}
            disabled={pending}
            className="btn-brand !py-2 text-sm shrink-0"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Generate
          </button>
        </div>
      )}
    </div>
  );
}

export function InviteMember() {
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ email: '', name: '', role: 'manager' });
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      <p className="text-xs font-medium text-muted">Invite a teammate</p>
      <div className="flex flex-wrap gap-2">
        <input className={field + ' flex-1'} placeholder="teammate@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <select className="rounded-xl border bg-surface-2 px-2.5 py-2.5 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="viewer">Viewer</option>
        </select>
        <button
          onClick={() => start(async () => {
            setMsg(null); setError(null);
            const r = await inviteMemberAction(form);
            if (r.ok) { setMsg('Invited ✓'); setForm({ email: '', name: '', role: 'manager' }); } else setError(r.error);
            setTimeout(() => setMsg(null), 2500);
          })}
          disabled={pending}
          className="btn-brand !py-2 text-sm shrink-0"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Invite
        </button>
      </div>
      <Status msg={msg} error={error} />
    </div>
  );
}
