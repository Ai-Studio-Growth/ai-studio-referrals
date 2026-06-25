import Link from 'next/link';
import { Rocket, Megaphone, Gift, Plug, Code2, ShieldCheck, HelpCircle } from 'lucide-react';

export const metadata = { title: 'Docs & Help · Ai Studio Referrals' };

const sections = [
  {
    id: 'getting-started',
    icon: Rocket,
    title: 'Getting started',
    body: [
      'Create an account at /signup — that provisions your workspace, a starter campaign, and your first referral link automatically.',
      'Three roles share one login: platform admins manage the whole platform, advertisers run campaigns in their workspace, and referrers share links and track earnings.',
      'Use the demo logins (password Demo1234): super@aistudioreferrals.com, demo@nimbus.io, referrer@nimbus.io.',
    ],
  },
  {
    id: 'campaigns',
    icon: Megaphone,
    title: 'Creating campaigns',
    body: [
      'Go to Admin → Create program. Pick a trigger event (signup, first purchase, subscription, KYC, or a custom event) and an attribution model + window.',
      'Set a referrer reward and an optional double-sided referee reward. Everything is config-driven — no code or redeploy needed to launch.',
      'Run multiple campaigns at once, including A/B variants that share an A/B key and split traffic.',
    ],
  },
  {
    id: 'rewards',
    icon: Gift,
    title: 'Rewards & payouts',
    body: [
      'Rewards can be cash, account credit, % or flat discounts, free months, points, or gifts — one-time or recurring, with milestone tiers for top referrers.',
      'Rewards are held for a configurable period, screened for fraud, then cleared to the referrer wallet. Referrers request payouts from their dashboard.',
      'Pick your workspace currency in Settings — all amounts format accordingly.',
    ],
  },
  {
    id: 'referrers',
    icon: ShieldCheck,
    title: 'Inviting & managing referrers',
    body: [
      'Advertisers invite referrers from Admin → Referrers. Each invite creates a referral link and a portal login so the referrer can track their own performance.',
      'Referrers can personalize their link (from their name or a custom unique code) and share via WhatsApp, X, LinkedIn, Telegram, email, SMS or QR.',
      'Fraud protection blocks self-referrals, throttles velocity, flags disposable emails, and routes suspicious conversions to a manual review queue.',
    ],
  },
  {
    id: 'integrations',
    icon: Plug,
    title: 'Integrations',
    body: [
      'Connect payouts (Stripe, PayPal, Razorpay, Wise, Tremendous), messaging (Resend/SendGrid, Twilio, Slack/Discord), e-commerce, CRM and analytics.',
      'Platform admins manage the integration catalog from Platform → Integrations and can add entirely new providers with no code change.',
      'Inbound and outbound webhooks let any system notify Ai Studio Referrals when a qualifying event happens.',
    ],
  },
  {
    id: 'api',
    icon: Code2,
    title: 'API & widget',
    body: [
      'Generate an API key in Settings → API keys. Authenticate with `Authorization: Bearer <key>`.',
      'Key endpoints: POST /api/referrals (get/create a link), POST /api/conversions (record a trigger event), GET /api/referrals (paginated list), POST /api/payouts.',
      'Drop the embeddable widget into your app with one script tag — see /widget.js.',
    ],
  },
];

const faqs = [
  ['Is there a free tier?', 'Yes — new workspaces start on a free plan with a trial of paid features.'],
  ['Do referral links work in any casing?', 'Yes. Links are case-insensitive, so /r/SUMMER and /r/summer resolve to the same campaign.'],
  ['Can I white-label it?', 'Advertisers set brand and accent colors (and a custom domain) in Settings; the referrer experience adopts them.'],
];

export default function DocsPage() {
  return (
    <div className="py-10">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">Docs & Help</p>
        <h1 className="text-balance text-4xl font-bold tracking-tight">Everything you need to ship referrals</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">Guides for platform admins, advertisers, and referrers.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="space-y-1">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg">
                <s.icon className="h-4 w-4" /> {s.title}
              </a>
            ))}
            <a href="#faq" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg">
              <HelpCircle className="h-4 w-4" /> FAQ
            </a>
          </nav>
        </aside>

        {/* Content */}
        <div className="max-w-2xl space-y-12">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-brand-fg shadow-glow">
                  <s.icon className="h-5 w-5" />
                </span>
                <h2 className="text-2xl font-bold tracking-tight">{s.title}</h2>
              </div>
              <div className="space-y-3 text-pretty leading-relaxed text-muted">
                {s.body.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </section>
          ))}

          <section id="faq" className="scroll-mt-24">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-brand-fg shadow-glow">
                <HelpCircle className="h-5 w-5" />
              </span>
              <h2 className="text-2xl font-bold tracking-tight">FAQ</h2>
            </div>
            <div className="space-y-3">
              {faqs.map(([q, a]) => (
                <details key={q} className="group rounded-2xl border bg-surface p-5">
                  <summary className="cursor-pointer font-medium marker:content-['']">{q}</summary>
                  <p className="mt-2 text-sm text-muted">{a}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="rounded-2xl border bg-surface p-6 text-center">
            <p className="font-medium">Still stuck?</p>
            <p className="mt-1 text-sm text-muted">Ask the community or reach support.</p>
            <div className="mt-4 flex justify-center gap-3">
              <Link href="/community" className="btn-brand">Visit the community</Link>
              <a href="mailto:support@aistudioreferrals.com" className="btn-ghost">Email support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
