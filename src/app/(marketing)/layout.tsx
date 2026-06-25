import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowRight } from 'lucide-react';

/** Public marketing chrome — a floating glass pill nav over a soft mesh. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg bg-mesh">
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 rounded-2xl border border-border/70 bg-bg/60 pl-4 pr-2 shadow-soft backdrop-blur-xl">
          <Link href="/" aria-label="Ai Studio Referrals home" className="shrink-0">
            <Logo />
          </Link>

          <nav className="mx-auto hidden items-center gap-1 md:flex">
            <NavLink href="/#features" label="Features" />
            <NavLink href="/#how" label="How it works" />
            <NavLink href="/#faq" label="FAQ" />
          </nav>

          <div className="ml-auto flex items-center gap-1.5 md:ml-0">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2/70 hover:text-fg"
            >
              Log in
            </Link>
            <Link href="/signup" className="btn-brand !py-2">
              Sign up <ArrowRight className="h-4 w-4" />
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
