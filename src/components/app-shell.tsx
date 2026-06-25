'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { LogoMark, Logo } from './logo';
import { ThemeToggle } from './theme-toggle';
import {
  LayoutGrid,
  Megaphone,
  ShieldAlert,
  Trophy,
  Gift,
  Settings,
  LifeBuoy,
  MessageCircle,
  Bell as BellIcon,
  Search,
  PanelLeft,
  Menu,
  Plus,
  LogOut,
  X,
  CornerDownLeft,
} from 'lucide-react';
import { NotificationBell } from './notification-bell';
import type { NotificationItem } from '@/lib/notifications';

type NavItem = { href: string; label: string; icon: typeof LayoutGrid };
type Role = 'super_admin' | 'advertiser' | 'referrer';

function navForRole(role: Role): { primary: { group: string; items: NavItem[] }[]; secondary: NavItem[] } {
  if (role === 'referrer') {
    return {
      primary: [
        {
          group: 'Referrer',
          items: [
            { href: '/dashboard', label: 'My performance', icon: Gift },
            { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
            { href: '/notifications', label: 'Notifications', icon: BellIcon },
          ],
        },
      ],
      secondary: [{ href: '/docs', label: 'Help & docs', icon: LifeBuoy }],
    };
  }
  return {
    primary: [
      {
        group: 'Workspace',
        items: [
          { href: '/admin', label: 'Overview', icon: LayoutGrid },
          { href: '/admin#campaigns', label: 'Campaigns', icon: Megaphone },
          { href: '/admin/referrers', label: 'Referrers', icon: Gift },
          { href: '/admin#fraud', label: 'Fraud review', icon: ShieldAlert },
          { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
          { href: '/notifications', label: 'Notifications', icon: BellIcon },
        ],
      },
    ],
    secondary: [
      { href: '/settings', label: 'Settings', icon: Settings },
      { href: '/docs', label: 'Help & docs', icon: LifeBuoy },
    ],
  };
}

const TITLES: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/campaigns/new': 'New campaign',
  '/admin/referrers': 'Referrers',
  '/dashboard': 'My performance',
  '/leaderboard': 'Leaderboard',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
};

export function AppShell({
  user,
  org,
  role,
  logoutAction,
  notifications,
  unreadCount,
  children,
}: {
  user: { name: string; email: string; avatarUrl?: string | null };
  org: { name: string };
  role: Role;
  logoutAction: () => void | Promise<void>;
  notifications: NotificationItem[];
  unreadCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { primary: PRIMARY, secondary: SECONDARY } = navForRole(role);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hash, setHash] = useState('');

  // Track hash so anchor nav items (e.g. /admin#campaigns) light up correctly.
  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [pathname]);

  // ⌘K / Ctrl-K opens the command palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if (e.key === 'Escape') setPaletteOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const title = TITLES[pathname] ?? 'Workspace';
  const showCreate = role === 'advertiser' && pathname !== '/admin/campaigns/new';

  function isActive(href: string) {
    const [path, frag] = href.split('#');
    if (pathname !== path) return false;
    if (frag) return hash === `#${frag}`;
    return hash === '' || !PRIMARY.some((g) => g.items.some((i) => i.href.startsWith(`${path}#`) && hash === `#${i.href.split('#')[1]}`));
  }

  const sidebar = (mobile: boolean) => (
    <aside
      className={clsx(
        'flex h-full flex-col border-r border-border bg-surface/40',
        mobile ? 'w-[270px]' : collapsed ? 'w-[76px]' : 'w-[260px]',
        'transition-[width] duration-200',
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 px-4">
        {collapsed && !mobile ? <LogoMark className="h-9 w-9" /> : <Logo />}
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto rounded-lg p-1.5 text-muted hover:bg-surface-2">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search / ⌘K */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setPaletteOpen(true)}
          className={clsx(
            'flex w-full items-center gap-2 rounded-xl border border-border bg-surface-2/60 text-sm text-muted transition-colors hover:bg-surface-2',
            collapsed && !mobile ? 'justify-center p-2.5' : 'px-3 py-2.5',
          )}
        >
          <Search className="h-4 w-4 shrink-0" />
          {(!collapsed || mobile) && (
            <>
              <span className="flex-1 text-left">Search…</span>
              <kbd className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
        {PRIMARY.map((g) => (
          <div key={g.group}>
            {(!collapsed || mobile) && (
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted/70">{g.group}</p>
            )}
            <ul className="space-y-1">
              {g.items.map((item) => (
                <li key={item.href}>
                  <NavRow item={item} active={isActive(item.href)} collapsed={collapsed && !mobile} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Secondary nav */}
      <div className="space-y-1 border-t border-border px-3 py-3">
        {SECONDARY.map((item) => (
          <NavRow key={item.label} item={item} active={pathname === item.href && item.href !== '/'} collapsed={collapsed && !mobile} />
        ))}
        <Link
          href="/community"
          className={clsx(
            'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg',
            collapsed && !mobile && 'justify-center px-0',
          )}
          title="Community"
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          {(!collapsed || mobile) && <span>Community</span>}
        </Link>
      </div>

      {/* User chip */}
      <div className="border-t border-border p-3">
        <div
          className={clsx(
            'flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-2',
            collapsed && !mobile && 'justify-center',
          )}
        >
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full ring-2 ring-brand/40" />
          ) : (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-brand-fg">
              {user.name.charAt(0)}
            </span>
          )}
          {(!collapsed || mobile) && (
            <>
              <Link href="/profile" className="min-w-0 flex-1" title="Edit profile">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Log out"
                  className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface hover:text-danger"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <div>
      <div className="flex h-screen overflow-hidden bg-bg text-fg">
        {/* Desktop sidebar */}
        <div className="hidden md:block">{sidebar(false)}</div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full animate-fade-up">{sidebar(true)}</div>
          </div>
        )}

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-bg/70 px-4 backdrop-blur-xl">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-muted hover:bg-surface-2 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="hidden rounded-lg p-2 text-muted hover:bg-surface-2 md:block"
              title="Toggle sidebar"
            >
              <PanelLeft className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden items-center gap-1.5 text-muted sm:flex">
                <span className="grid h-5 w-5 place-items-center rounded-md bg-brand-gradient text-[10px] font-bold text-brand-fg">
                  {org.name.charAt(0)}
                </span>
                {org.name}
              </span>
              <span className="hidden text-border sm:block">/</span>
              <h1 className="font-semibold">{title}</h1>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setPaletteOpen(true)}
                className="hidden items-center gap-2 rounded-xl border border-border bg-surface-2/60 px-3 py-2 text-xs text-muted transition-colors hover:bg-surface-2 lg:flex"
              >
                <Search className="h-3.5 w-3.5" /> Search
                <kbd className="rounded border border-border bg-surface px-1 text-[10px]">⌘K</kbd>
              </button>
              <NotificationBell items={notifications} unreadCount={unreadCount} />
              <ThemeToggle />
              {showCreate && (
                <Link href="/admin/campaigns/new" className="btn-brand !py-2">
                  <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Create program</span>
                </Link>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>

      {paletteOpen && (
        <CommandPalette
          items={[
            ...PRIMARY.flatMap((g) => g.items),
            ...SECONDARY,
            ...(showCreate ? [{ href: '/admin/campaigns/new', label: 'Create program', icon: Plus }] : []),
          ]}
          onClose={() => setPaletteOpen(false)}
        />
      )}
    </div>
  );
}

function NavRow({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={clsx(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
        collapsed && 'justify-center px-0',
        active ? 'bg-brand/15 text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
      )}
    >
      {active && <span className="absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full bg-brand" style={{ width: 3 }} />}
      <Icon className={clsx('h-4 w-4 shrink-0', active && 'text-brand')} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

function CommandPalette({ items, onClose }: { items: NavItem[]; onClose: () => void }) {
  const [q, setQ] = useState('');
  const results = items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results[0]) window.location.href = results[0].href;
            }}
            placeholder="Jump to…"
            className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted"
          />
          <kbd className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[10px]">esc</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No results</li>}
          {results.map((i) => {
            const Icon = i.icon;
            return (
              <li key={i.label}>
                <Link
                  href={i.href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-surface-2"
                >
                  <Icon className="h-4 w-4 text-muted" />
                  <span className="flex-1">{i.label}</span>
                  <CornerDownLeft className="h-3.5 w-3.5 text-muted opacity-0 group-hover:opacity-100" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
