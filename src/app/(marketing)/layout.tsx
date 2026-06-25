import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { CookieConsent } from '@/components/cookie-consent';

/** Public marketing chrome — a floating glass pill nav over a soft mesh. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg bg-mesh">
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 rounded-2xl border border-border/70 bg-bg/60 pl-3 pr-2 shadow-soft backdrop-blur-xl sm:gap-4 sm:pl-4">
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

            {/* Mobile disclosure menu (CSS-only, no JS) */}
            <details className="group relative md:hidden">
              <summary
                aria-label="Open menu"
                className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-xl text-muted transition-colors hover:bg-surface-2/70 hover:text-fg [&::-webkit-details-marker]:hidden"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path className="block group-open:hidden" d="M3 6h18M3 12h18M3 18h18" />
                  <path className="hidden group-open:block" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </summary>
              <div className="absolute right-0 top-full mt-2 w-44 origin-top-right rounded-2xl border border-border bg-surface/95 p-1.5 shadow-soft backdrop-blur-xl">
                <MobileLink href="/#features" label="Features" />
                <MobileLink href="/#how" label="How it works" />
                <MobileLink href="/#faq" label="FAQ" />
                <MobileLink href="/login" label="Log in" />
              </div>
            </details>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">{children}</main>
      <CookieConsent />
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

function MobileLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2/70 hover:text-fg"
    >
      {label}
    </Link>
  );
}
