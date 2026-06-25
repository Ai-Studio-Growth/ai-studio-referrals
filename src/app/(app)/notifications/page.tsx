import { redirect } from 'next/navigation';
import { requireSession, homeForRole } from '@/lib/auth';
import { getNotifications } from '@/lib/notifications';
import { markAllReadAction } from './actions';
import { EmptyState } from '@/components/ui';
import clsx from 'clsx';

function ago(date: Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function NotificationsPage() {
  const session = await requireSession();
  const { role } = session;

  if (role === 'super_admin') redirect(homeForRole(role));

  const notifications = await getNotifications(session, 100);
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-0.5 text-sm text-muted">
            {notifications.length === 0
              ? 'Nothing here yet'
              : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {hasUnread && (
          <form action={markAllReadAction}>
            <button
              type="submit"
              className="rounded-xl border border-border bg-surface-2/60 px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              Mark all as read
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          hint="When there are announcements or updates for you, they'll appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <ul className="divide-y divide-border">
            {notifications.map((item) => (
              <li
                key={item.id}
                className={clsx(
                  'flex items-start gap-4 px-5 py-4 transition-colors hover:bg-surface-2/40',
                  !item.read && 'bg-brand/5',
                )}
              >
                {/* Unread dot */}
                <span
                  className={clsx(
                    'mt-2 h-2 w-2 shrink-0 rounded-full',
                    item.read ? 'bg-transparent' : 'bg-brand',
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className={clsx('text-sm', !item.read ? 'font-semibold text-fg' : 'text-fg/90')}>
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-muted">{item.body}</p>
                </div>
                <time className="shrink-0 text-xs text-muted">{ago(item.createdAt)}</time>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
