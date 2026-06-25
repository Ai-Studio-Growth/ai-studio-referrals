'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import clsx from 'clsx';
import { markAllReadAction } from '@/app/(app)/notifications/actions';
import type { NotificationItem } from '@/lib/notifications';

function ago(date: Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationBell({
  items,
  unreadCount,
}: {
  items: NotificationItem[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  async function handleMarkAll() {
    setPending(true);
    try {
      await markAllReadAction();
      router.refresh();
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        className={clsx(
          'relative rounded-xl p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg',
          open && 'bg-surface-2 text-fg',
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold leading-none text-brand-fg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={clsx(
            'absolute right-0 z-50 mt-2 w-[340px] max-w-[calc(100vw-2rem)]',
            'overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={pending}
                className="text-xs text-brand transition-colors hover:text-brand/80 disabled:opacity-50"
              >
                {pending ? 'Marking…' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* Items list */}
          <ul className="max-h-[360px] overflow-y-auto">
            {items.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-muted">No notifications yet</li>
            )}
            {items.map((item) => (
              <li key={item.id}>
                <div
                  className={clsx(
                    'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-2/60',
                    !item.read && 'bg-brand/5',
                  )}
                >
                  {/* Unread dot */}
                  <span
                    className={clsx(
                      'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                      item.read ? 'bg-transparent' : 'bg-brand',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={clsx('text-sm', !item.read && 'font-semibold')}>{item.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted">{item.body}</p>
                  </div>
                  <time className="shrink-0 text-[11px] text-muted">{ago(item.createdAt)}</time>
                </div>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-brand transition-colors hover:text-brand/80"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
