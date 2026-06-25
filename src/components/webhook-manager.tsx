'use client';

import { useState, useTransition } from 'react';
import { Loader2, Plus, Copy, Check, Power, Trash2, Send } from 'lucide-react';
import { StatusPill } from '@/components/ui';
import {
  createWebhookAction,
  toggleWebhookAction,
  deleteWebhookAction,
  sendTestWebhookAction,
} from '@/app/(app)/admin/webhooks/actions';

const field = 'w-full rounded-xl border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30';

export type EndpointView = { id: string; url: string; events: string; status: string };

export function CreateWebhook() {
  const [pending, start] = useTransition();
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState('*');
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input className={field} placeholder="https://your-app.com/webhooks/aisr" value={url} onChange={(e) => setUrl(e.target.value)} />
        <input className={field + ' sm:max-w-[220px]'} placeholder="* or conversion.recorded" value={events} onChange={(e) => setEvents(e.target.value)} />
        <button
          onClick={() => start(async () => {
            setError(null); setSecret(null);
            const r = await createWebhookAction({ url, events });
            if (r.ok) { setSecret(r.secret); setUrl(''); setEvents('*'); } else setError(r.error);
          })}
          disabled={pending || !url}
          className="btn-brand !py-2.5 text-sm shrink-0"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add endpoint
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {secret && (
        <div className="rounded-xl border border-success/30 bg-success/10 p-3">
          <p className="mb-1 text-xs font-medium text-success">Signing secret — copy now, shown once:</p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate font-mono text-xs">{secret}</code>
            <button onClick={() => { navigator.clipboard.writeText(secret); setCopied(true); }} className="chip border-border bg-surface">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">Verify deliveries with header <code className="font-mono">x-aisr-signature</code> = HMAC-SHA256(secret, body).</p>
        </div>
      )}
    </div>
  );
}

export function EndpointRow({ ep }: { ep: EndpointView }) {
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-surface-2/40 p-3">
      <div className="min-w-0">
        <p className="truncate font-mono text-sm">{ep.url}</p>
        <p className="text-xs text-muted">events: <span className="font-mono">{ep.events}</span></p>
      </div>
      <div className="flex items-center gap-2">
        <StatusPill status={ep.status === 'active' ? 'approved' : 'rejected'} />
        <button
          disabled={pending}
          onClick={() => start(async () => { await sendTestWebhookAction({ id: ep.id }); setSent(true); setTimeout(() => setSent(false), 2000); })}
          className="chip border-border bg-surface hover:bg-surface-2"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : sent ? <Check className="h-3.5 w-3.5 text-success" /> : <Send className="h-3.5 w-3.5" />} Test
        </button>
        <button disabled={pending} onClick={() => start(() => toggleWebhookAction({ id: ep.id }).then(() => {}))} className="chip border-border bg-surface hover:bg-surface-2">
          <Power className="h-3.5 w-3.5" /> {ep.status === 'active' ? 'Disable' : 'Enable'}
        </button>
        <button disabled={pending} onClick={() => start(() => deleteWebhookAction({ id: ep.id }).then(() => {}))} className="chip border-danger/30 bg-danger/10 text-danger hover:bg-danger/20">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
