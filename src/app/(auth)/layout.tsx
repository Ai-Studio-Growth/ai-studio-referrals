import Link from 'next/link';
import { LogoMark } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { ShieldCheck, Lock, Sparkles, Star } from 'lucide-react';

/** Split-screen auth chrome: brand panel + form column. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-brand-gradient p-12 text-brand-fg lg:flex">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20 bg-grid" />
        <div aria-hidden className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-white/20 blur-3xl" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <LogoMark className="h-7 w-7" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">Ai Studio</span>
            <span className="text-base font-extrabold uppercase tracking-tight">Referrals.</span>
          </span>
        </Link>

        <div className="relative">
          <h2 className="text-balance text-3xl font-bold leading-tight">
            Turn customers into your growth engine.
          </h2>
          <ul className="mt-8 space-y-4">
            {[
              { icon: Sparkles, t: 'Launch double-sided campaigns in minutes' },
              { icon: ShieldCheck, t: 'Built-in fraud screening & reward holds' },
              { icon: Lock, t: 'Secure by design — hashed passwords & sessions' },
            ].map((f) => (
              <li key={f.t} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
                  <f.icon className="h-4 w-4" />
                </span>
                <span className="text-sm/relaxed opacity-90">{f.t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-2xl bg-white/10 p-5 backdrop-blur">
          <div className="flex gap-0.5 text-warning">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="mt-2 text-sm/relaxed opacity-90">
            “We launched our referral program over a weekend and saw a 1.8× viral coefficient within the
            first month.”
          </p>
          <p className="mt-2 text-xs opacity-70">— Growth lead, seed-stage SaaS</p>
        </div>
      </aside>

      {/* Form column */}
      <main className="relative flex flex-1 flex-col bg-bg bg-mesh">
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="flex items-center gap-2 lg:invisible">
            <LogoMark className="h-8 w-8" />
            <span className="text-sm font-extrabold uppercase tracking-tight">Referrals.</span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
