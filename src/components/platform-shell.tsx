'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { LogoMark } from './logo';
import { ThemeToggle } from './theme-toggle';
import { LayoutGrid, Building2, CreditCard, Blocks, Bell, Users2, Gift, Settings, LogOut, Menu, X, ShieldCheck } from 'lucide-react';

const NAV = [
  { href: '/platform', label: 'Overview', icon: LayoutGrid },
  { href: '/platform/clients', label: 'Clients', icon: Building2 },
  { href: '/platform/referrers', label: 'Referrers', icon: Gift },
  { href: '/platform/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/platform/integrations', label: 'Integrations', icon: Blocks },
  { href: '/platform/notifications', label: 'Notifications', icon: Bell },
  { href: '/platform/users', label: 'Users', icon: Users2 },
  { href: '/platform/settings', label: 'Settings', icon: Settings },
];

const TITLES: Record<string, string> = Object.fromEntries(NAV.map((n) => [n.href, n.label]));

export function PlatformShell({
  user,
  logoutAction,
  children,
}: {
  user: { name: string; email: string; avatarUrl?: string | null };
  logoutAction: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? 'Platform';
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMobileOpen(false), [pathname]);

  const sidebar = (mobile: boolean, onClose?: () => void) => (
    <aside className="flex h-full w-[260px] flex-col border-r border-border bg-surface/40">
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/platform" className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8" />
          <span className="flex flex-col leading-none">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Ai Studio</span>
            <span className="text-sm font-extrabold uppercase tracking-tight">Referrals.</span>
          </span>
        </Link>
        {mobile && (
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-surface-2">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-3 pb-2">
        <span className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-3 py-2 text-xs font-semibold text-brand">
          <ShieldCheck className="h-4 w-4" /> Platform console
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV.map((item) => {
          const active = item.href === '/platform' ? pathname === '/platform' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-brand/15 text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
              )}
            >
              {active && <span className="absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full bg-brand" style={{ width: 3 }} />}
              <Icon className={clsx('h-4 w-4', active && 'text-brand')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={user.avatarUrl ?? ''} alt="" className="h-9 w-9 rounded-full ring-2 ring-brand/40" />
          <Link href="/profile" className="min-w-0 flex-1" title="Edit profile">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </Link>
          <form action={logoutAction}>
            <button type="submit" title="Log out" className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-danger">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );

  return (
    <div>
      <div className="flex h-screen overflow-hidden bg-bg text-fg">
        <div className="hidden md:block">{sidebar(false)}</div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full animate-fade-up">{sidebar(true, () => setMobileOpen(false))}</div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-bg/70 px-4 backdrop-blur-xl">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-muted hover:bg-surface-2 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold">{title}</h1>
            <span className="ml-1 hidden text-xs text-muted sm:block">· Platform administration</span>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
