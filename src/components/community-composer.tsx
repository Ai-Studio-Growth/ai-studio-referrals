'use client';

import { useState, useTransition } from 'react';
import { Loader2, Send } from 'lucide-react';
import { createCommunityPostAction } from '@/app/community/actions';

const field = 'w-full rounded-xl border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30';
const CATS = ['general', 'announcements', 'feature-requests', 'wins'];

export function CommunityComposer() {
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ title: '', body: '', category: 'general' });
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <input className={field} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className={field} rows={3} placeholder="Share something with the community…" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
      <div className="flex flex-wrap items-center gap-2">
        <select className="rounded-xl border bg-surface-2 px-2.5 py-2.5 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {CATS.map((c) => <option key={c} value={c}>{c.replace('-', ' ')}</option>)}
        </select>
        <button
          onClick={() => start(async () => {
            setError(null);
            const r = await createCommunityPostAction(form);
            if (r.ok) setForm({ title: '', body: '', category: 'general' }); else setError(r.error);
          })}
          disabled={pending || !form.title || !form.body}
          className="btn-brand !py-2 text-sm"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Post
        </button>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    </div>
  );
}
