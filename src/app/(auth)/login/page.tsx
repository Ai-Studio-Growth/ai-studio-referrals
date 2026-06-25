import { AuthForm } from '@/components/auth-form';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Log in · Ai Studio Referrals' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getSession()) redirect('/admin');
  const { next } = await searchParams;

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Log in to your Ai Studio Referrals workspace.</p>

      <div className="mt-6 rounded-2xl border bg-surface/60 p-3 text-xs text-muted">
        <span className="font-medium text-fg">Demo:</span> demo@nimbus.io · Demo1234
      </div>

      <div className="mt-6">
        <AuthForm mode="login" next={next} />
      </div>
    </div>
  );
}
