'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createCampaignAction } from '@/app/actions';
import { TRIGGER_EVENTS, REWARD_TYPES } from '@/lib/config/campaign-config';
import { Card, SectionTitle } from '@/components/ui';
import { Gift, Rocket, Users } from 'lucide-react';

const field = 'w-full rounded-xl border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/40';
const label = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted';

export default function NewCampaignPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: 'Give $10, Get $10',
    description: 'Double-sided reward on a friend’s first purchase.',
    triggerEvent: 'first_purchase',
    attributionModel: 'last_touch',
    attributionWindowDays: 30,
    rewardHoldDays: 7,
    referrerType: 'cash',
    referrerAmount: 1000,
    refereeType: 'discount',
    refereeAmount: 10,
    refereeUnit: 'percent',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  const isCents = (t: string) => t === 'cash' || t === 'credit';

  function submit() {
    startTransition(async () => {
      await createCampaignAction({
        ...form,
        referrerAmount: isCents(form.referrerType) ? form.referrerAmount : form.referrerAmount,
      });
      router.push('/admin');
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-brand-fg shadow-glow">
          <Rocket className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">New campaign</h1>
          <p className="text-sm text-muted">No code — set a trigger and rewards, then launch.</p>
        </div>
      </div>

      <Card className="space-y-5">
        <SectionTitle title="Basics" />
        <div>
          <label className={label}>Campaign name</label>
          <input className={field} value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className={label}>Description</label>
          <input className={field} value={form.description} onChange={set('description')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={label}>Trigger event</label>
            <select className={field} value={form.triggerEvent} onChange={set('triggerEvent')}>
              {TRIGGER_EVENTS.map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Attribution</label>
            <select className={field} value={form.attributionModel} onChange={set('attributionModel')}>
              <option value="last_touch">last touch</option>
              <option value="first_touch">first touch</option>
            </select>
          </div>
          <div>
            <label className={label}>Window (days)</label>
            <input type="number" className={field} value={form.attributionWindowDays} onChange={set('attributionWindowDays')} />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="space-y-4">
          <SectionTitle title="Referrer reward" action={<Users className="h-4 w-4 text-brand" />} />
          <div>
            <label className={label}>Type</label>
            <select className={field} value={form.referrerType} onChange={set('referrerType')}>
              {REWARD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>{isCents(form.referrerType) ? 'Amount (cents)' : 'Quantity / percent'}</label>
            <input type="number" className={field} value={form.referrerAmount} onChange={set('referrerAmount')} />
          </div>
          <div>
            <label className={label}>Reward hold (days)</label>
            <input type="number" className={field} value={form.rewardHoldDays} onChange={set('rewardHoldDays')} />
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionTitle title="Referee reward (double-sided)" action={<Gift className="h-4 w-4 text-accent" />} />
          <div>
            <label className={label}>Type</label>
            <select className={field} value={form.refereeType} onChange={set('refereeType')}>
              <option value="">none</option>
              {REWARD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Amount</label>
            <input type="number" className={field} value={form.refereeAmount} onChange={set('refereeAmount')} />
          </div>
          <div>
            <label className={label}>Unit</label>
            <select className={field} value={form.refereeUnit} onChange={set('refereeUnit')}>
              <option value="percent">percent</option>
              <option value="flat">flat (cents)</option>
              <option value="months">months</option>
              <option value="points">points</option>
            </select>
          </div>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => router.push('/admin')} className="btn-ghost">
          Cancel
        </button>
        <button onClick={submit} disabled={pending} className="btn-brand">
          <Rocket className="h-4 w-4" />
          {pending ? 'Launching…' : 'Launch campaign'}
        </button>
      </div>
    </div>
  );
}
