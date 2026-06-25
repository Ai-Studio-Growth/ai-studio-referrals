'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { LogoMark } from './logo';
import { MousePointerClick, UserCheck, CreditCard, Sparkles, TrendingUp, Gift } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

/** Scroll-reveal wrapper. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function FloatCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
        y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay },
      }}
    >
      {children}
    </motion.div>
  );
}

/** The hero product preview — a stylized, dark snapshot of the actual app. */
export function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 12 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, ease, delay: 0.15 }}
      className="relative mx-auto mt-16 max-w-5xl"
      style={{ perspective: 1200 }}
    >
      {/* Glow */}
      <div aria-hidden className="absolute -inset-x-16 -top-10 -bottom-16 -z-10 rounded-[3rem] bg-brand/30 blur-3xl" />

      {/* Browser frame */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c16] shadow-[0_40px_120px_-30px_rgba(91,52,242,0.55)]">
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 hidden rounded-md bg-white/5 px-3 py-1 text-[11px] text-slate-400 sm:block">
            app.aistudioreferrals.com/admin
          </span>
        </div>

        <div className="flex">
          {/* Mini sidebar */}
          <div className="hidden w-44 shrink-0 flex-col gap-1 border-r border-white/5 p-3 sm:flex">
            <div className="mb-3 flex items-center gap-2 px-1">
              <LogoMark className="h-7 w-7" />
              <div className="flex flex-col leading-none">
                <span className="text-[8px] font-bold uppercase tracking-wider text-brand">Ai Studio</span>
                <span className="text-[11px] font-extrabold text-white">Referrals.</span>
              </div>
            </div>
            {['Overview', 'Campaigns', 'Fraud review', 'Leaderboard'].map((l, i) => (
              <div
                key={l}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] ${
                  i === 0 ? 'bg-brand/20 text-white' : 'text-slate-400'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-sm ${i === 0 ? 'bg-brand' : 'bg-white/15'}`} />
                {l}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">Overview</div>
                <div className="text-[11px] text-slate-400">Nimbus Analytics</div>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-[#7c5cff] to-[#f5a623] px-3 py-1.5 text-[11px] font-semibold text-white">
                + Create program
              </div>
            </div>
            <div className="mb-3 grid grid-cols-4 gap-2">
              {[
                { l: 'Clicks', v: '12.4k' },
                { l: 'Signups', v: '3.1k' },
                { l: 'Conversions', v: '1,204' },
                { l: 'Revenue', v: '$89k' },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
                  <div className="text-[9px] text-slate-400">{s.l}</div>
                  <div className="mt-0.5 text-sm font-bold text-white">{s.v}</div>
                </div>
              ))}
            </div>
            {/* Chart */}
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
              <svg viewBox="0 0 320 90" className="h-24 w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="ha" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#7c5cff" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="hb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#19c3f5" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#19c3f5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 70 C40 40 60 60 90 45 C120 30 150 55 180 35 C210 18 250 40 320 22 L320 90 L0 90 Z" fill="url(#ha)" />
                <path d="M0 70 C40 40 60 60 90 45 C120 30 150 55 180 35 C210 18 250 40 320 22" fill="none" stroke="#7c5cff" strokeWidth="2" />
                <path d="M0 80 C50 70 70 78 110 66 C150 54 180 72 220 60 C260 48 290 58 320 50 L320 90 L0 90 Z" fill="url(#hb)" />
                <path d="M0 80 C50 70 70 78 110 66 C150 54 180 72 220 60 C260 48 290 58 320 50" fill="none" stroke="#19c3f5" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <FloatCard delay={0.6} className="absolute -left-4 top-24 hidden sm:block">
        <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-3.5 py-2.5 shadow-soft">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-success/15 text-success">
            <Gift className="h-4 w-4" />
          </span>
          <div>
            <div className="text-xs font-semibold">Reward sent</div>
            <div className="text-[11px] text-muted">+$50 to Alex</div>
          </div>
        </div>
      </FloatCard>

      <FloatCard delay={1.1} className="absolute -right-4 bottom-16 hidden sm:block">
        <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-3.5 py-2.5 shadow-soft">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/15 text-brand">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <div className="text-xs font-semibold">K-factor 1.8×</div>
            <div className="text-[11px] text-muted">Self-sustaining growth</div>
          </div>
        </div>
      </FloatCard>
    </motion.div>
  );
}

/** Attribution funnel mock for a feature section. */
export function FunnelMock() {
  const stages = [
    { icon: MousePointerClick, label: 'Link shared', tint: 'text-accent bg-accent/10' },
    { icon: MousePointerClick, label: 'Link clicked', tint: 'text-accent bg-accent/10' },
    { icon: UserCheck, label: 'Signed up', tint: 'text-brand bg-brand/10' },
    { icon: CreditCard, label: 'Purchased plan', tint: 'text-success bg-success/10' },
  ];
  return (
    <div className="glass space-y-2 p-5">
      {stages.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3" style={{ marginLeft: i * 14 }}>
          <span className={`grid h-9 w-9 place-items-center rounded-xl ${s.tint}`}>
            <s.icon className="h-4 w-4" />
          </span>
          <div className="flex-1 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-sm font-medium">{s.label}</div>
          {i === 3 && <span className="chip border-success/30 bg-success/10 text-success">+$50</span>}
        </div>
      ))}
    </div>
  );
}

/** Reward types mock. */
export function RewardMock() {
  const rewards = [
    { label: '$50 cash', tint: 'from-success/20' },
    { label: '20% off', tint: 'from-brand/20' },
    { label: '500 points', tint: 'from-accent/20' },
    { label: '3 free months', tint: 'from-warning/20' },
    { label: 'Store credit', tint: 'from-brand/20' },
    { label: 'Branded gift', tint: 'from-danger/20' },
  ];
  return (
    <div className="glass grid grid-cols-2 gap-3 p-5">
      {rewards.map((r) => (
        <div key={r.label} className={`flex items-center gap-2 rounded-xl border border-border bg-gradient-to-br ${r.tint} to-transparent px-3 py-3`}>
          <Sparkles className="h-4 w-4 text-brand" />
          <span className="text-sm font-medium">{r.label}</span>
        </div>
      ))}
    </div>
  );
}
