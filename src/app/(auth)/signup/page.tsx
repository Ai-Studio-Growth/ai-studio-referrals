import { AuthForm } from '@/components/auth-form';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Sign up · Ai Studio Referrals' };

export default async function SignupPage() {
  if (await getSession()) redirect('/admin');

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-bold tracking-tight">Create your workspace</h1>
      <p className="mt-1 text-sm text-muted">Start a referral program for your business — free.</p>

      <div className="mt-6">
        <AuthForm mode="signup" />
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">
        By creating an account you agree to our Terms and acknowledge our Privacy Policy.
      </p>
    </div>
  );
}
