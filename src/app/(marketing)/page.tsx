import Link from 'next/link';
import {
  ArrowRight,
  Github,
  ShieldCheck,
  Zap,
  Trophy,
  Webhook,
  Gift,
  BarChart3,
  Crosshair,
  Check,
} from 'lucide-react';
import { LogoMark } from '@/components/logo';
import { Reveal, HeroPreview, FunnelMock, RewardMock } from '@/components/landing';

// Render dynamically — Hostinger's managed runtime mis-serves prerendered static pages (503).
export const dynamic = 'force-dynamic';

const trust = [
  { value: '82%', label: 'of buyers trust referrals from people they know', src: 'Nielsen' },
  { value: '5×', label: 'lower CAC than paid acquisition channels', src: 'HubSpot' },
  { value: '3×', label: 'higher lifetime value from referred customers', src: 'HBR' },
];

const steps = [
  { n: '01', t: 'Add the snippet', d: 'Drop one script tag — or call the REST API — to connect your product.' },
  { n: '02', t: 'Design your program', d: 'Pick a trigger and rewards in the no-code builder. Go live instantly.' },
  { n: '03', t: 'Grow on autopilot', d: 'Members share, conversions are attributed and rewarded automatically.' },
];

const industries = [
  { emoji: '💻', name: 'B2B SaaS', brands: 'Dropbox · Slack · Notion' },
  { emoji: '🔁', name: 'B2C Subscription', brands: 'Netflix · Spotify · Morning Brew' },
  { emoji: '🏦', name: 'Fintech', brands: 'Cash App · Venmo · Stripe' },
  { emoji: '🤝', name: 'Marketplaces', brands: 'Airbnb · Uber · Etsy' },
  { emoji: '🎓', name: 'Online Education', brands: 'Coursera · Udemy · MasterClass' },
  { emoji: '🛍️', name: 'E-commerce & D2C', brands: 'Glossier · Warby Parker · Allbirds' },
];

const grid = [
  { icon: Crosshair, t: 'Advanced attribution', d: 'First & last touch with a configurable window.' },
  { icon: BarChart3, t: 'Real-time analytics', d: 'Funnel, K-factor, CAC and cohort insights.' },
  { icon: Gift, t: 'Custom rewards', d: 'Cash, credit, discounts, points, gifts & tiers.' },
  { icon: ShieldCheck, t: 'Fraud prevention', d: 'Velocity limits, device checks & review queue.' },
  { icon: Trophy, t: 'Gamification', d: 'Leaderboards, badges and milestone tiers.' },
  { icon: Webhook, t: 'Integrations & API', d: 'Webhooks, REST API and an embeddable widget.' },
];

const faqs = [
  { q: 'Do I need to write code to launch?', a: 'No. Campaigns are fully config-driven — set the trigger, rewards, caps and eligibility from the builder. A public API and embeddable widget are there when you want to integrate deeply.' },
  { q: 'Can I reward both the referrer and the friend?', a: 'Yes. Every campaign supports double-sided rewards plus milestone/tier bonuses for your top referrers.' },
  { q: 'How are conversions attributed?', a: 'First-touch or last-touch within a configurable window, with an explicit referral code always taking priority over device/IP matching.' },
  { q: 'How do you prevent fraud and abuse?', a: 'Built-in self-referral blocking, IP/device velocity limits, disposable-email detection, a manual review queue and reward hold periods.' },
  { q: 'Which payout and messaging providers are supported?', a: 'Adapters for Stripe, PayPal, Razorpay, Wise and Tremendous payouts, plus Resend/SendGrid, Twilio and Slack/Discord — all swappable via env config.' },
];

export default function Home() {
  return (
    <div className="space-y-28 pb-10">
      {/* ─── Hero ─── */}
      <section className="relative pt-10 sm:pt-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute right-10 top-40 -z-10 h-72 w-72 rounded-full bg-accent/20 blur-[100px]" />

        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Link
              href="https://github.com"
              className="chip mx-auto mb-6 w-fit border-border bg-surface/70 backdrop-blur transition-colors hover:border-brand/40"
            >
              <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-gradient text-[9px] text-white">★</span>
              Open-source-friendly · for any business model
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-7xl">
              Referral marketing,
              <br />
              made <span className="bg-brand-gradient bg-clip-text text-transparent">effortless</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted">
              Build powerful, double-sided referral programs for any product. Generate links, track
              referrals, automate rewards and grow through word-of-mouth — all from one premium platform.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup" className="btn-brand px-6 py-3 text-base">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="https://github.com" className="btn-ghost px-6 py-3 text-base">
                <Github className="h-4 w-4" /> View on GitHub
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted">No credit card · seeded demo data included</p>
          </Reveal>
        </div>

        <HeroPreview />
      </section>

      {/* ─── Trust / social proof ─── */}
      <section>
        <Reveal>
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Why word-of-mouth wins
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {trust.map((t, i) => (
            <Reveal key={t.src} delay={i * 0.08}>
              <div className="glass h-full p-6">
                <div className="text-4xl font-bold text-brand">{t.value}</div>
                <p className="mt-2 text-sm text-muted">{t.label}</p>
                <p className="mt-3 text-xs font-medium text-fg/70">— {t.src}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Feature: attribution ─── */}
      <FeatureRow
        eyebrow="Advanced attribution"
        title="Know exactly which share drove the sale"
        body="Track every step from shared link to paid plan. First- or last-touch attribution within a window you control, with explicit referral codes always taking priority."
        bullets={['Multi-stage funnel tracking', 'Configurable attribution window', 'Fraud-screened conversions']}
        mock={<FunnelMock />}
      />

      {/* ─── Feature: rewards ─── */}
      <FeatureRow
        reverse
        eyebrow="Any reward, double-sided"
        title="Reward the referrer and the friend"
        body="Cash, account credit, percentage or flat discounts, free months, points, physical gifts and milestone tiers — one-time or recurring. Configure it per campaign, no code."
        bullets={['6+ reward types out of the box', 'Milestone & tier bonuses', 'Reward both sides automatically']}
        mock={<RewardMock />}
      />

      {/* ─── Steps ─── */}
      <section id="how" className="scroll-mt-24">
        <SectionHead eyebrow="Setup in 3 easy steps" title="From zero to live in minutes" />
        <div className="relative grid gap-5 sm:grid-cols-3">
          <div aria-hidden className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent sm:block" />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="relative rounded-3xl border bg-surface p-6">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-gradient text-sm font-bold text-brand-fg shadow-glow">
                  {s.n}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Industries ─── */}
      <section>
        <SectionHead eyebrow="Support for every business model" title="One engine, every use case" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind, i) => (
            <Reveal key={ind.name} delay={(i % 3) * 0.06}>
              <div className="group flex h-full items-start gap-4 rounded-2xl border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-brand/40">
                <span className="text-2xl">{ind.emoji}</span>
                <div>
                  <h3 className="font-semibold">{ind.name}</h3>
                  <p className="mt-1 text-sm text-muted">{ind.brands}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Feature grid ─── */}
      <section id="features" className="scroll-mt-24">
        <SectionHead eyebrow="Full-featured platform" title="Everything you need to grow" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grid.map((f, i) => (
            <Reveal key={f.t} delay={(i % 3) * 0.06}>
              <div className="glass h-full p-6">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/10 text-brand">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{f.t}</h3>
                <p className="mt-1 text-sm text-muted">{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24">
        <SectionHead eyebrow="FAQ" title="Common questions, answered" />
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border bg-surface p-5 [&_summary]:cursor-pointer">
              <summary className="flex items-center justify-between font-medium marker:content-['']">
                {f.q}
                <span className="ml-4 text-xl text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <Reveal>
        <section className="relative overflow-hidden rounded-[2rem] bg-brand-gradient px-6 py-16 text-center text-brand-fg sm:py-20">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20 bg-grid" />
          <div className="relative">
            <Zap className="mx-auto mb-4 h-8 w-8" />
            <h2 className="text-balance text-3xl font-bold sm:text-5xl">Ready to grow with referrals?</h2>
            <p className="mx-auto mt-4 max-w-md opacity-90">
              Launch your first campaign with Ai Studio Referrals today — it takes minutes.
            </p>
            <Link href="/signup" className="btn mx-auto mt-8 bg-white px-7 py-3.5 text-base font-semibold text-brand hover:bg-white/90">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </Reveal>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border pt-10">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div className="max-w-xs">
            <span className="flex items-center gap-2.5">
              <LogoMark className="h-9 w-9" />
              <span className="flex flex-col leading-none">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Ai Studio</span>
                <span className="text-base font-extrabold uppercase tracking-tight">
                  Referrals<span className="text-accent">.</span>
                </span>
              </span>
            </span>
            <p className="mt-4 text-sm text-muted">Referral marketing made effortless — for any business.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
            <FooterLink href="/admin" label="Overview" />
            <FooterLink href="/dashboard" label="Share & earn" />
            <FooterLink href="/leaderboard" label="Leaderboard" />
            <FooterLink href="/admin/campaigns/new" label="New campaign" />
            <FooterLink href="/settings" label="Settings" />
            <FooterLink href="/widget.js" label="Embed widget" />
          </div>
        </div>
        <div className="mt-10 flex items-center gap-2 border-t border-border pt-6 text-xs text-muted">
          <Check className="h-3.5 w-3.5 text-success" />© {new Date().getFullYear()} Ai Studio Referrals. Built as a
          production-grade reference implementation.
        </div>
      </footer>
    </div>
  );
}

function FeatureRow({
  eyebrow,
  title,
  body,
  bullets,
  mock,
  reverse,
}: {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  mock: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <section className="grid items-center gap-10 lg:grid-cols-2">
      <Reveal className={reverse ? 'lg:order-2' : ''}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        <p className="mt-4 text-muted">{body}</p>
        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-3 text-sm">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                <Check className="h-3 w-3" />
              </span>
              {b}
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={0.1} className={reverse ? 'lg:order-1' : ''}>
        {mock}
      </Reveal>
    </section>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Reveal>
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      </div>
    </Reveal>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-muted transition-colors hover:text-fg">
      {label}
    </Link>
  );
}
