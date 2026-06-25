import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Search,
  Megaphone,
  PenTool,
  BarChart3,
  Share2,
  Mail,
  Check,
  Star,
  Quote,
  Zap,
} from 'lucide-react';
import {
  Reveal,
  Stagger,
  StaggerItem,
  Counter,
  Marquee,
  Tilt,
  HeroBackdrop,
  OrbitField,
  Parallax,
} from '@/components/agency';

/* ─── Content (placeholder — swap for the client's real brand + copy) ─── */

const clients = ['Northwind', 'Vertex', 'Halcyon', 'Brightwave', 'Monarch', 'Quanta', 'Lumen', 'Apex'];

const stats = [
  { to: 4.2, suffix: '×', decimals: 1, label: 'Average return on ad spend' },
  { to: 250, prefix: '+', suffix: '', decimals: 0, label: 'Brands scaled since 2018' },
  { to: 38, suffix: 'M', prefix: '$', decimals: 0, label: 'Revenue driven for clients' },
  { to: 98, suffix: '%', decimals: 0, label: 'Client retention rate' },
];

const services = [
  { icon: Search, t: 'SEO & Content', d: 'Technical SEO, topical authority and content that ranks and converts — not just traffic for traffic’s sake.' },
  { icon: Megaphone, t: 'Paid Media', d: 'Full-funnel Google, Meta, TikTok and LinkedIn campaigns engineered around ROAS, not vanity metrics.' },
  { icon: PenTool, t: 'Brand & Creative', d: 'Identity systems, motion and ad creative that stop the scroll and make your brand impossible to ignore.' },
  { icon: Share2, t: 'Social & Influencer', d: 'Always-on social, community building and creator partnerships that compound reach over time.' },
  { icon: Mail, t: 'Lifecycle & CRM', d: 'Email and SMS automations that turn first-time buyers into a loyal, repeat-revenue base.' },
  { icon: BarChart3, t: 'Analytics & CRO', d: 'Attribution, dashboards and conversion-rate experiments so every dollar is measured and improved.' },
];

const work = [
  { tag: 'E-commerce', name: 'Brightwave Skincare', metric: '+312%', desc: 'revenue in 6 months via paid social + lifecycle', tint: 'from-brand/25' },
  { tag: 'SaaS', name: 'Vertex Analytics', metric: '−41%', desc: 'cost per qualified lead with full-funnel search', tint: 'from-accent/25' },
  { tag: 'Hospitality', name: 'Monarch Resorts', metric: '5.7×', desc: 'ROAS across a multi-market launch campaign', tint: 'from-success/25' },
];

const steps = [
  { n: '01', t: 'Discover', d: 'We audit your funnel, market and data to find the fastest paths to growth.' },
  { n: '02', t: 'Strategy', d: 'A channel-by-channel plan with clear targets, budgets and a 90-day roadmap.' },
  { n: '03', t: 'Launch', d: 'Creative, campaigns and tracking go live — instrumented from day one.' },
  { n: '04', t: 'Scale', d: 'We double down on winners, kill losers and compound results month over month.' },
];

const pricing = [
  {
    name: 'Launch',
    price: '$2.5k',
    cadence: '/mo',
    blurb: 'For early-stage brands finding product–market fit.',
    features: ['1 paid channel', 'Landing page + tracking', 'Bi-weekly reporting', 'Email support'],
  },
  {
    name: 'Growth',
    price: '$6k',
    cadence: '/mo',
    blurb: 'For scaling brands ready to go full-funnel.',
    features: ['Up to 3 channels', 'Creative + lifecycle', 'Weekly strategy calls', 'CRO experiments', 'Dedicated lead'],
    featured: true,
  },
  {
    name: 'Scale',
    price: 'Custom',
    cadence: '',
    blurb: 'For market leaders with ambitious targets.',
    features: ['Unlimited channels', 'Full creative studio', 'Dedicated pod', 'Custom dashboards', 'Quarterly strategy'],
  },
];

const testimonials = [
  { quote: 'Lumio rebuilt our entire acquisition engine. We tripled revenue without tripling spend — they think like owners.', name: 'Sofia Marin', role: 'CMO, Brightwave' },
  { quote: 'The most data-driven agency we’ve worked with. Every decision is tied to a number and a hypothesis.', name: 'Daniel Cho', role: 'Founder, Vertex' },
  { quote: 'Creative that actually performs. Our cost per acquisition dropped 40% in the first quarter.', name: 'Amara Osei', role: 'VP Growth, Monarch' },
];

const faqs = [
  { q: 'How quickly will we see results?', a: 'Paid channels can show signal within 2–4 weeks; SEO and lifecycle compound over 3–6 months. We set 30/60/90-day milestones up front so you always know what “on track” looks like.' },
  { q: 'Are there long-term contracts?', a: 'We work on rolling monthly engagements after an initial 90-day sprint. No multi-year lock-in — we earn the relationship every month.' },
  { q: 'Who actually does the work?', a: 'A dedicated pod — strategist, media buyer, creative and analyst — not a rotating cast of juniors. You meet your team before you sign.' },
  { q: 'Do you work with our existing tools?', a: 'Yes. We plug into your stack (GA4, HubSpot, Shopify, Klaviyo, Meta, Google) and bring our own dashboards on top for a single source of truth.' },
];

export default function AgencyLanding() {
  return (
    <div className="space-y-28 pb-10">
      {/* ─── Hero ─── */}
      <section className="relative pt-12 sm:pt-20">
        <HeroBackdrop />
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Reveal>
              <span className="chip mb-6 w-fit border-border bg-surface/70 backdrop-blur">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-gradient text-[9px] text-white">
                  <Sparkles className="h-2.5 w-2.5" />
                </span>
                Award-winning digital marketing agency
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
                We turn attention into{' '}
                <span className="bg-brand-gradient bg-clip-text text-transparent">revenue</span>.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-pretty text-lg text-muted">
                Lumio is a full-service growth partner. We blend brand, performance media and
                data to build marketing engines that scale — beautifully, and measurably.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="#contact" className="btn-brand px-6 py-3 text-base">
                  Start a project <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#work" className="btn-ghost px-6 py-3 text-base">
                  See our work
                </Link>
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm text-muted">
                <span className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </span>
                Rated 4.9/5 by 120+ founders
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <OrbitField labels={['SEO', 'Paid Ads', 'Creative', 'Email', 'Social', 'CRO']} />
          </Reveal>
        </div>
      </section>

      {/* ─── Client marquee ─── */}
      <section>
        <Reveal>
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Trusted by ambitious brands worldwide
          </p>
        </Reveal>
        <Marquee items={clients} />
      </section>

      {/* ─── Stats ─── */}
      <section>
        <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <div className="glass h-full p-6 text-center">
                <div className="text-4xl font-bold text-brand sm:text-5xl">
                  <Counter to={s.to} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
                </div>
                <p className="mt-2 text-sm text-muted">{s.label}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ─── Services ─── */}
      <section id="services" className="scroll-mt-24">
        <SectionHead eyebrow="What we do" title="Full-funnel growth, under one roof" />
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((f) => (
            <StaggerItem key={f.t}>
              <Tilt className="h-full">
                <div className="glass group h-full p-6 transition-shadow hover:shadow-glow">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-fg">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{f.t}</h3>
                  <p className="mt-2 text-sm text-muted">{f.d}</p>
                </div>
              </Tilt>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ─── Work / case studies ─── */}
      <section id="work" className="scroll-mt-24">
        <SectionHead eyebrow="Selected work" title="Results we’re proud of" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {work.map((w, i) => (
            <Parallax key={w.name} amount={i === 1 ? 70 : 36}>
              <Link
                href="#contact"
                className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-br ${w.tint} to-transparent p-6 transition-transform hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between">
                  <span className="chip border-border bg-surface/80 backdrop-blur">{w.tag}</span>
                  <ArrowUpRight className="h-5 w-5 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
                </div>
                <div className="mt-16">
                  <div className="text-4xl font-bold tracking-tight text-fg">{w.metric}</div>
                  <p className="mt-1 text-sm text-muted">{w.desc}</p>
                  <h3 className="mt-4 text-lg font-semibold">{w.name}</h3>
                </div>
              </Link>
            </Parallax>
          ))}
        </div>
      </section>

      {/* ─── Process ─── */}
      <section id="process" className="scroll-mt-24">
        <SectionHead eyebrow="How we work" title="A clear path from zero to scale" />
        <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div aria-hidden className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />
          <Stagger className="contents">
            {steps.map((s) => (
              <StaggerItem key={s.n}>
                <div className="relative h-full rounded-3xl border bg-surface p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-gradient text-sm font-bold text-brand-fg shadow-glow">
                    {s.n}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm text-muted">{s.d}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section>
        <SectionHead eyebrow="Kind words" title="What founders say about us" />
        <Stagger className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <figure className="glass flex h-full flex-col p-6">
                <Quote className="h-7 w-7 text-brand/40" />
                <blockquote className="mt-3 flex-1 text-pretty text-sm leading-relaxed">“{t.quote}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-brand-fg">
                    {t.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{t.name}</span>
                    <span className="block text-xs text-muted">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="scroll-mt-24">
        <SectionHead eyebrow="Engagements" title="Simple, transparent retainers" />
        <Stagger className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {pricing.map((p) => (
            <StaggerItem key={p.name}>
              <div
                className={`relative flex h-full flex-col rounded-3xl border p-6 ${
                  p.featured ? 'border-brand/50 bg-surface shadow-glow' : 'bg-surface'
                }`}
              >
                {p.featured && (
                  <span className="chip absolute -top-3 left-6 border-transparent bg-brand-gradient font-semibold text-brand-fg">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-bold tracking-tight">{p.price}</span>
                  <span className="mb-1 text-sm text-muted">{p.cadence}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{p.blurb}</p>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                        <Check className="h-3 w-3" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="#contact"
                  className={`mt-8 ${p.featured ? 'btn-brand' : 'btn-ghost'} w-full py-3`}
                >
                  {p.price === 'Custom' ? 'Talk to us' : 'Get started'} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24">
        <SectionHead eyebrow="FAQ" title="Questions, answered" />
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

      {/* ─── CTA / contact ─── */}
      <Reveal>
        <section id="contact" className="relative overflow-hidden rounded-[2rem] bg-brand-gradient px-6 py-16 text-center text-brand-fg scroll-mt-24 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20 bg-grid" />
          <div className="relative mx-auto max-w-2xl">
            <Zap className="mx-auto mb-4 h-8 w-8" />
            <h2 className="text-balance text-3xl font-bold sm:text-5xl">Let’s build your growth engine</h2>
            <p className="mx-auto mt-4 max-w-md opacity-90">
              Book a free 30-minute strategy call. We’ll map the three highest-leverage moves for
              your brand — no pitch, no obligation.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="mailto:hello@lumio.agency"
                className="btn bg-white px-7 py-3.5 text-base font-semibold text-brand hover:bg-white/90"
              >
                Book a strategy call <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#work"
                className="btn border border-white/40 px-7 py-3.5 text-base font-semibold text-brand-fg hover:bg-white/10"
              >
                View case studies
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border pt-10">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div className="max-w-xs">
            <span className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-gradient text-brand-fg shadow-glow">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-base font-extrabold tracking-tight">
                Lumio<span className="text-accent">.</span>
              </span>
            </span>
            <p className="mt-4 text-sm text-muted">
              A digital marketing agency building brands that grow. Strategy, media and creative —
              measured end to end.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
            <FooterLink href="#services" label="Services" />
            <FooterLink href="#work" label="Work" />
            <FooterLink href="#process" label="Process" />
            <FooterLink href="#pricing" label="Pricing" />
            <FooterLink href="#faq" label="FAQ" />
            <FooterLink href="#contact" label="Contact" />
          </div>
        </div>
        <div className="mt-10 flex items-center gap-2 border-t border-border pt-6 text-xs text-muted">
          <Check className="h-3.5 w-3.5 text-success" />© {new Date().getFullYear()} Lumio Agency. Demo
          microsite — replace copy and brand with the client’s.
        </div>
      </footer>
    </div>
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
