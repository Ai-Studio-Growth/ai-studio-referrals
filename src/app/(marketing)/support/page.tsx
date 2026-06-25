import Link from 'next/link';
import { ArrowLeft, Mail, BookOpen, MessageCircle } from 'lucide-react';

// Render dynamically — Hostinger's managed runtime mis-serves prerendered static pages (503).
export const dynamic = 'force-dynamic';

export const metadata = { title: 'Support Desk · Ai Studio Craft' };

const options = [
  { icon: Mail, title: 'Email support', body: 'Reach our team directly — we reply within one business day.', href: 'mailto:support@aistudiocraft.in', cta: 'support@aistudiocraft.in' },
  { icon: BookOpen, title: 'Knowledge-base', body: 'Browse guides and answers to common questions.', href: '/docs', cta: 'Open the docs' },
  { icon: MessageCircle, title: 'Community', body: 'Ask questions and share wins with other builders.', href: '/community', cta: 'Visit the community' },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Support Desk</h1>
      <p className="mt-3 text-muted">We&apos;re here to help. Pick the channel that suits you best.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {options.map((o) => (
          <Link key={o.title} href={o.href} className="glass group flex h-full flex-col p-6 transition-transform hover:-translate-y-1">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/10 text-brand">
              <o.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-semibold">{o.title}</h2>
            <p className="mt-1 flex-1 text-sm text-muted">{o.body}</p>
            <span className="mt-4 text-sm font-medium text-brand group-hover:underline">{o.cta}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
