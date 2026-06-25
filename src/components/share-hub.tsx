'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, Share2, Mail, MessageSquare, QrCode, Pencil, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WhatsAppIcon, XIcon, LinkedInIcon, FacebookIcon, TelegramIcon } from './social-icons';
import { customizeReferralAction } from '@/app/actions';

type Props = {
  shortLink: string;
  qr: string;
  referralId: string;
  code: string;
  displayName: string;
  message?: string;
};

const fireConfetti = () =>
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.7 },
    colors: ['#7c5cff', '#19c3f5', '#22c55e', '#f59e0b'],
  });

function previewSlug(v: string) {
  return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '').slice(0, 40);
}

export function ShareHub({
  shortLink,
  qr,
  referralId,
  code,
  displayName,
  message = 'I love this — join with my link and we both get a reward:',
}: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [editing, setEditing] = useState(false);

  const text = encodeURIComponent(message);
  const url = encodeURIComponent(shortLink);
  const base = shortLink.replace(/\/r\/.*$/, '/r/');

  const targets = [
    { name: 'WhatsApp', href: `https://wa.me/?text=${text}%20${url}`, color: '#25D366', Icon: WhatsAppIcon },
    { name: 'X', href: `https://twitter.com/intent/tweet?text=${text}&url=${url}`, color: '#000000', Icon: XIcon },
    { name: 'Telegram', href: `https://t.me/share/url?url=${url}&text=${text}`, color: '#229ED9', Icon: TelegramIcon },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`, color: '#0A66C2', Icon: LinkedInIcon },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${url}`, color: '#1877F2', Icon: FacebookIcon },
    { name: 'Email', href: `mailto:?subject=${encodeURIComponent('A reward for you')}&body=${text}%20${url}`, color: '#7C5CFF', Icon: Mail },
    { name: 'SMS', href: `sms:?&body=${text}%20${url}`, color: '#06B6D4', Icon: MessageSquare },
  ];

  async function copy() {
    await navigator.clipboard.writeText(shortLink);
    setCopied(true);
    fireConfetti();
    setTimeout(() => setCopied(false), 1800);
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join me', text: message, url: shortLink });
        fireConfetti();
      } catch {
        /* cancelled */
      }
    } else {
      void copy();
    }
  }

  return (
    <div className="space-y-4">
      {/* Link + copy */}
      <div className="flex items-stretch gap-2">
        <div className="flex min-w-0 flex-1 items-center rounded-xl border bg-surface-2 px-3 font-mono text-sm">
          <span className="truncate">{shortLink}</span>
        </div>
        <button onClick={copy} className="btn-brand shrink-0">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Customize toggle */}
      <button
        onClick={() => setEditing((e) => !e)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-brand"
      >
        <Pencil className="h-3.5 w-3.5" />
        {editing ? 'Close' : 'Customize your link'}
      </button>

      {editing && <CustomizePanel referralId={referralId} code={code} displayName={displayName} base={base} onDone={() => { setEditing(false); router.refresh(); }} />}

      {/* Premium share icons */}
      <div className="flex flex-wrap items-center gap-2">
        <IconButton label="Share" onClick={nativeShare} color="#7C5CFF">
          <Share2 className="h-[18px] w-[18px]" />
        </IconButton>
        {targets.map((t) => (
          <IconLink key={t.name} href={t.href} label={t.name} color={t.color}>
            <t.Icon className="h-[18px] w-[18px]" />
          </IconLink>
        ))}
        <IconButton label="QR code" onClick={() => setShowQr((s) => !s)} color="#0F172A" active={showQr}>
          <QrCode className="h-[18px] w-[18px]" />
        </IconButton>
      </div>

      {showQr && (
        <div className="animate-fade-up grid place-items-center rounded-2xl border bg-surface p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Referral QR code" className="h-44 w-44 rounded-xl" />
          <p className="mt-2 text-xs text-muted">Scan to open your referral link</p>
        </div>
      )}
    </div>
  );
}

function IconShell({ label, color, active, children }: { label: string; color: string; active?: boolean; children: React.ReactNode }) {
  return (
    <span
      style={{ '--c': color } as React.CSSProperties}
      className={
        'group grid h-11 w-11 place-items-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent hover:bg-[var(--c)] hover:text-white hover:shadow-lg ' +
        (active ? 'border-transparent bg-[var(--c)] text-white' : 'border-border bg-surface-2 text-fg/70')
      }
      title={label}
    >
      {children}
    </span>
  );
}

function IconLink({ href, label, color, children }: { href: string; label: string; color: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={fireConfetti} aria-label={label}>
      <IconShell label={label} color={color}>
        {children}
      </IconShell>
    </a>
  );
}

function IconButton({ label, color, active, onClick, children }: { label: string; color: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label}>
      <IconShell label={label} color={color} active={active}>
        {children}
      </IconShell>
    </button>
  );
}

function CustomizePanel({
  referralId,
  code,
  displayName,
  base,
  onDone,
}: {
  referralId: string;
  code: string;
  displayName: string;
  base: string;
  onDone: () => void;
}) {
  const [mode, setMode] = useState<'name' | 'custom'>('name');
  const [name, setName] = useState(displayName);
  const [custom, setCustom] = useState(code);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const preview = mode === 'name' ? previewSlug(name) : previewSlug(custom);

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await customizeReferralAction({
        referralId,
        mode,
        value: mode === 'name' ? name : custom,
      });
      if (res.ok) {
        fireConfetti();
        onDone();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="animate-fade-up space-y-3 rounded-2xl border bg-surface-2/50 p-4">
      {/* Segmented control */}
      <div className="inline-flex rounded-xl border bg-surface p-1 text-xs font-medium">
        {(['name', 'custom'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={
              'rounded-lg px-3 py-1.5 transition-colors ' +
              (mode === m ? 'bg-brand-gradient text-brand-fg shadow' : 'text-muted hover:text-fg')
            }
          >
            {m === 'name' ? 'From your name' : 'Custom link'}
          </button>
        ))}
      </div>

      {mode === 'name' ? (
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            className="w-full rounded-xl border bg-surface px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
      ) : (
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Choose a unique link</label>
          <div className="flex items-center overflow-hidden rounded-xl border bg-surface focus-within:ring-2 focus-within:ring-brand/30">
            <span className="select-none border-r bg-surface-2 px-3 py-2.5 font-mono text-xs text-muted">{base}</span>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="summer-2026"
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm outline-none"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-muted">
        <Sparkles className="h-3.5 w-3.5 text-brand" />
        Your link will be <span className="font-mono text-fg">{base}{preview || '…'}</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={save} disabled={pending || preview.length < 3} className="btn-brand !py-2 text-sm">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save link
        </button>
        <button onClick={onDone} className="btn-ghost !py-2 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}
