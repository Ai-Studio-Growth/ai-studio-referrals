import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { logoutAction } from '@/lib/auth-actions';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card, SectionTitle } from '@/components/ui';
import { ProfileInfoForm, PasswordForm } from '@/components/profile-forms';
import { ArrowLeft, LogOut, UserRound, Lock } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Profile · Ai Studio Referrals' };

const roleLabel: Record<string, string> = {
  super_admin: 'Platform admin',
  advertiser: 'Advertiser',
  referrer: 'Referrer',
};

export default async function ProfilePage() {
  const { account, role } = await requireSession('/profile');
  const home = role === 'super_admin' ? '/platform' : role === 'referrer' ? '/dashboard' : '/admin';

  return (
    <div className="min-h-screen bg-bg bg-mesh">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href={home} className="btn-ghost !py-2 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(account.name)}`}
            alt=""
            className="h-16 w-16 rounded-full ring-2 ring-brand/40"
          />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{account.name}</h1>
            <p className="text-sm text-muted">{account.email}</p>
            <span className="chip mt-1 border-brand/30 bg-brand/10 text-brand">{roleLabel[role] ?? role}</span>
          </div>
        </div>

        <Card>
          <SectionTitle title="Profile information" action={<UserRound className="h-4 w-4 text-muted" />} />
          <ProfileInfoForm name={account.name} email={account.email} />
        </Card>

        <Card>
          <SectionTitle title="Password" subtitle="Use a strong, unique password." action={<Lock className="h-4 w-4 text-muted" />} />
          <PasswordForm />
        </Card>

        <Card>
          <SectionTitle title="Session" />
          <form action={logoutAction}>
            <button type="submit" className="btn-ghost !py-2 text-sm text-danger">
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </form>
        </Card>
      </main>
    </div>
  );
}
