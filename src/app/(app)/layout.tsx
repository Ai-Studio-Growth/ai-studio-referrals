import { AppShell } from '@/components/app-shell';
import { requireSession, homeForRole } from '@/lib/auth';
import { logoutAction } from '@/lib/auth-actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * Authenticated app chrome for advertisers and referrers. Super admins are sent
 * to the platform console. The shell renders role-appropriate navigation.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { account, org, role } = await requireSession();
  if (role === 'super_admin' || !org) redirect(homeForRole(role));

  const user = {
    name: account.name,
    email: account.email,
    avatarUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(account.name)}`,
  };

  return (
    <AppShell user={user} org={{ name: org.name }} role={role} logoutAction={logoutAction}>
      {children}
    </AppShell>
  );
}
