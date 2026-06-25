'use client';

import { useState, useTransition } from 'react';
import { Loader2, UserPlus, Copy, Check, Mail } from 'lucide-react';
import { WhatsAppIcon } from './social-icons';
import { inviteReferrerAction } from '@/app/actions';

const field = 'w-full rounded-xl border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30';

export function InviteReferrer() {
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ name: '', email: '' });
  const [result, setResult] = useState<{ link: string; tempPassword: string | null; sentTo: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input className={field} placeholder="Friend's name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={field} placeholder="friend@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <button
          onClick={() => start(async () => {
            setError(null); setResult(null);
            const r = await inviteReferrerAction(form);
            if (r.ok) { setResult({ link: r.link, tempPassword: r.tempPassword, sentTo: form.email.trim() }); setForm({ name: '', email: '' }); }
            else setError(r.error);
          })}
          disabled={pending || !form.email}
          className="btn-brand !py-2 text-sm shrink-0"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Invite
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {result && (
        <div className="rounded-xl border border-success/30 bg-success/10 p-3 text-sm">
          <p className="font-medium text-success">Invite sent ✓</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate font-mono text-xs">{result.link}</code>
            <button onClick={() => { navigator.clipboard.writeText(result.link); setCopied(true); }} className="chip border-border bg-surface">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>

          {/* Send the invite directly */}
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`You're invited to refer & earn — here's your link: ${result.link}`)}`}
              target="_blank"
              rel="noreferrer"
              className="chip border-transparent text-white"
              style={{ background: '#25D366' }}
            >
              <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <a
              href={`mailto:${encodeURIComponent(result.sentTo)}?subject=${encodeURIComponent("You're invited to refer & earn")}&body=${encodeURIComponent(`Hi,\n\nJoin and start referring — here's your personal link:\n${result.link}\n\nThanks!`)}`}
              className="chip border-transparent text-white"
              style={{ background: '#7C5CFF' }}
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
          </div>

          {result.tempPassword && (
            <p className="mt-2 text-xs text-muted">
              Portal login created · temp password <code className="font-mono text-fg">{result.tempPassword}</code>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
