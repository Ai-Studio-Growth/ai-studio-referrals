import { db } from '@/lib/db';
import { requirePlatform } from '@/lib/auth';
import { Card, SectionTitle, EmptyState } from '@/components/ui';
import { NotificationComposer } from '@/components/platform-controls';
import { Bell, Mail, Megaphone } from 'lucide-react';

export const dynamic = 'force-dynamic';

function ago(d: Date) {
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export default async function NotificationsPage() {
  await requirePlatform();
  const notifications = await db.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { org: { select: { name: true } } } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted">Broadcast announcements to advertisers and referrers.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <SectionTitle title="Compose" subtitle="Send an in-app or email announcement." />
          <NotificationComposer />
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle title="Sent" subtitle={`${notifications.length} most recent`} />
          {notifications.length === 0 ? (
            <EmptyState title="No notifications yet" hint="Compose one to get started." />
          ) : (
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li key={n.id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-surface-2/40 p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                    {n.channel === 'email' ? <Mail className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      <span className="chip border-border bg-surface text-[10px] capitalize">{n.audience}</span>
                      {n.org && <span className="chip border-border bg-surface text-[10px]">{n.org.name}</span>}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted">{n.body}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{ago(n.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
