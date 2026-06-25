import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { ScrollProgress } from '@/components/agency';
import { ArrowRight, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Lumio — Digital Marketing Agency',
  description:
    'Lumio is a full-service digital marketing agency. We craft brands, run performance campaigns, and build experiences that turn attention into revenue.',
};

/* Self-contained chrome for the agency microsite: its own glass nav + footer.
   Placeholder brand ("Lumio") and copy — swap for the client's real details. */
export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg bg-mesh">
      <ScrollProgress />

      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 rounded-2xl border border-border/70 bg-bg/60 pl-4 pr-2 shadow-soft backdrop-blur-xl">
          <Link href="/agency" aria-label="Lumio home" className="flex shrink-0 items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-gradient text-brand-fg shadow-glow">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-base font-extrabold tracking-tight">
              Lumio<span className="text-accent">.</span>
            </span>
          </Link>

          <nav className="mx-auto hidden items-center gap-1 md:flex">
            <NavLink href="#services" label="Services" />
            <NavLink href="#work" label="Work" />
            <NavLink href="#process" label="Process" />
            <NavLink href="#pricing" label="Pricing" />
            <NavLink href="#faq" label="FAQ" />
          </nav>

          <div className="ml-auto flex items-center gap-1.5 md:ml-0">
            <ThemeToggle />
            <Link href="#contact" className="btn-brand !py-2">
              Book a call <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-fg"
    >
      {label}
    </Link>
  );
}
