import { AppShell } from '@/components/app-shell';
import { requireSession, homeForRole } from '@/lib/auth';
import { logoutAction } from '@/lib/auth-actions';
import { redirect } from 'next/navigation';
import { getNotifications, getUnreadCount } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

/**
 * Authenticated app chrome for advertisers and referrers. Super admins are sent
 * to the platform console. The shell renders role-appropriate navigation.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const { account, org, role } = session;
  if (role === 'super_admin' || !org) redirect(homeForRole(role));

  const user = {
    name: account.name,
    email: account.email,
    avatarUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(account.name)}`,
  };

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(session, 10),
    getUnreadCount(session),
  ]);

  return (
    <AppShell
      user={user}
      org={{ name: org.name }}
      role={role}
      logoutAction={logoutAction}
      notifications={notifications}
      unreadCount={unreadCount}
    >
      {children}
    </AppShell>
  );
}
