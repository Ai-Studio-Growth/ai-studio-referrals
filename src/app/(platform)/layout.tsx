import { PlatformShell } from '@/components/platform-shell';
import { requirePlatform } from '@/lib/auth';
import { logoutAction } from '@/lib/auth-actions';

export const dynamic = 'force-dynamic';

/** Platform operator console — super-admin only. */
export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { account } = await requirePlatform();
  const user = {
    name: account.name,
    email: account.email,
    avatarUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(account.name)}`,
  };
  return (
    <PlatformShell user={user} logoutAction={logoutAction}>
      {children}
    </PlatformShell>
  );
}
