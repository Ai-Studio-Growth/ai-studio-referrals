'use client';

import { useState, useTransition } from 'react';
import { Loader2, Ban, RotateCcw, Power, Send } from 'lucide-react';
import {
  updateSubscriptionAction,
  setAccountStatusAction,
  setAccountRoleAction,
  toggleIntegrationAction,
  sendNotificationAction,
  createIntegrationProviderAction,
  toggleProviderEnabledAction,
  updatePlatformSettingAction,
  addPlatformSettingAction,
} from '@/app/(platform)/actions';
import { Plus, Power as PowerIcon, Check } from 'lucide-react';

const selectCls =
  'rounded-lg border bg-surface-2 px-2.5 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50';

export function PlanSelect({ orgId, plan }: { orgId: string; plan: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={plan}
      disabled={pending}
      onChange={(e) => start(() => updateSubscriptionAction({ orgId, plan: e.target.value }).then(() => {}))}
      className={selectCls}
    >
      {['free', 'starter', 'growth', 'scale'].map((p) => (
        <option key={p} value={p}>
          {p[0].toUpperCase() + p.slice(1)}
        </option>
      ))}
    </select>
  );
}

export function StatusSelect({ orgId, status }: { orgId: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => start(() => updateSubscriptionAction({ orgId, subStatus: e.target.value }).then(() => {}))}
      className={selectCls}
    >
      {['trialing', 'active', 'past_due', 'canceled'].map((s) => (
        <option key={s} value={s}>
          {s.replace('_', ' ')}
        </option>
      ))}
    </select>
  );
}

export function RoleSelect({ accountId, role, disabled }: { accountId: string; role: string; disabled?: boolean }) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={role}
      disabled={pending || disabled}
      onChange={(e) => start(() => setAccountRoleAction({ accountId, role: e.target.value }).then(() => {}))}
      className={selectCls}
    >
      {['super_admin', 'advertiser', 'referrer'].map((r) => (
        <option key={r} value={r}>
          {r.replace('_', ' ')}
        </option>
      ))}
    </select>
  );
}

export function SuspendButton({ accountId, status, disabled }: { accountId: string; status: string; disabled?: boolean }) {
  const [pending, start] = useTransition();
  const suspended = status === 'suspended';
  return (
    <button
      disabled={pending || disabled}
      onClick={() =>
        start(() => setAccountStatusAction({ accountId, status: suspended ? 'active' : 'suspended' }).then(() => {}))
      }
      className={
        'chip ' +
        (suspended
          ? 'border-success/30 bg-success/10 text-success hover:bg-success/20'
          : 'border-danger/30 bg-danger/10 text-danger hover:bg-danger/20') +
        (disabled ? ' opacity-40' : '')
      }
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : suspended ? <RotateCcw className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
      {suspended ? 'Reactivate' : 'Suspend'}
    </button>
  );
}

export function IntegrationToggle({ integrationId, status }: { integrationId: string; status: string }) {
  const [pending, start] = useTransition();
  const connected = status === 'connected';
  return (
    <button
      disabled={pending}
      onClick={() => start(() => toggleIntegrationAction({ integrationId }).then(() => {}))}
      className={
        'chip ' +
        (connected
          ? 'border-success/30 bg-success/10 text-success hover:bg-success/20'
          : 'border-border bg-surface-2 text-muted hover:bg-surface')
      }
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
      {connected ? 'Connected' : 'Connect'}
    </button>
  );
}

export function ProviderToggle({ id, enabled }: { id: string; enabled: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(() => toggleProviderEnabledAction({ id }).then(() => {}))}
      className={'chip ' + (enabled ? 'border-success/30 bg-success/10 text-success' : 'border-border bg-surface-2 text-muted')}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PowerIcon className="h-3.5 w-3.5" />}
      {enabled ? 'Enabled' : 'Disabled'}
    </button>
  );
}

export function AddProviderForm() {
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ name: '', category: 'payouts', description: '', fields: '' });
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const field = 'w-full rounded-xl border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30';

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={field} placeholder="Provider name (e.g. Razorpay)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select className={field} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {['payouts', 'messaging', 'ecommerce', 'crm', 'analytics', 'other'].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <input className={field} placeholder="Short description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <textarea
        className={field}
        rows={2}
        placeholder={'Config fields (optional), one per line:\napiKey|API key|password'}
        value={form.fields}
        onChange={(e) => setForm({ ...form, fields: e.target.value })}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={() => start(async () => {
            setMsg(null); setError(null);
            const r = await createIntegrationProviderAction(form);
            if (r.ok) { setMsg('Provider added ✓'); setForm({ name: '', category: 'payouts', description: '', fields: '' }); } else setError(r.error);
            setTimeout(() => setMsg(null), 2500);
          })}
          disabled={pending || !form.name}
          className="btn-brand !py-2 text-sm"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add provider
        </button>
        {error && <span className="text-xs text-danger">{error}</span>}
        {msg && <span className="text-xs text-success">{msg}</span>}
      </div>
    </div>
  );
}

export function SettingRow({ id, value, type }: { id: string; value: string; type: string }) {
  const [pending, start] = useTransition();
  const [val, setVal] = useState(value);
  const [saved, setSaved] = useState(false);
  const save = (v: string) => start(async () => { await updatePlatformSettingAction({ id, value: v }); setSaved(true); setTimeout(() => setSaved(false), 1500); });

  if (type === 'boolean') {
    const on = val === 'true';
    return (
      <button
        disabled={pending}
        onClick={() => { const v = on ? 'false' : 'true'; setVal(v); save(v); }}
        className={'chip ' + (on ? 'border-success/30 bg-success/10 text-success' : 'border-border bg-surface-2 text-muted')}
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PowerIcon className="h-3.5 w-3.5" />} {on ? 'On' : 'Off'}
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <input
        type={type === 'number' ? 'number' : 'text'}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => val !== value && save(val)}
        className="w-44 rounded-lg border bg-surface-2 px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-brand/30"
      />
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" /> : saved ? <Check className="h-3.5 w-3.5 text-success" /> : null}
    </div>
  );
}

export function AddSettingForm() {
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ label: '', key: '', value: '', type: 'text', group: 'general' });
  const [error, setError] = useState<string | null>(null);
  const field = 'rounded-xl border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30';

  return (
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      <p className="text-xs font-medium text-muted">Add a custom setting</p>
      <div className="flex flex-wrap gap-2">
        <input className={field + ' flex-1'} placeholder="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        <input className={field + ' w-32'} placeholder="value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
        <select className={field} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {['text', 'number', 'boolean'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button
          onClick={() => start(async () => {
            setError(null);
            const r = await addPlatformSettingAction(form);
            if (r.ok) setForm({ label: '', key: '', value: '', type: 'text', group: 'general' }); else setError(r.error);
          })}
          disabled={pending || !form.label}
          className="btn-brand !py-2 text-sm"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
        </button>
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

export function NotificationComposer() {
  const [pending, start] = useTransition();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [channel, setChannel] = useState('inapp');
  const [msg, setMsg] = useState<string | null>(null);

  const field = 'w-full rounded-xl border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30';

  function send() {
    setMsg(null);
    start(async () => {
      const res = await sendNotificationAction({ title, body, audience, channel });
      if (res.ok) {
        setTitle('');
        setBody('');
        setMsg('Notification sent ✓');
      } else {
        setMsg(res.error ?? 'Could not send');
      }
      setTimeout(() => setMsg(null), 3000);
    });
  }

  return (
    <div className="space-y-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={field} />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message…" rows={3} className={field} />
      <div className="flex flex-wrap gap-2">
        <select value={audience} onChange={(e) => setAudience(e.target.value)} className={selectCls}>
          <option value="all">All users</option>
          <option value="advertisers">Advertisers</option>
          <option value="referrers">Referrers</option>
        </select>
        <select value={channel} onChange={(e) => setChannel(e.target.value)} className={selectCls}>
          <option value="inapp">In-app</option>
          <option value="email">Email</option>
        </select>
        <button onClick={send} disabled={pending || !title || !body} className="btn-brand !py-1.5 text-xs">
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Send
        </button>
        {msg && <span className="self-center text-xs text-muted">{msg}</span>}
      </div>
    </div>
  );
}
