import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { VerifyForm } from '@/components/verify-form';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Verify · Ai Studio Referrals' };

type Pending = { email: string; purpose: 'signup' | 'login' };

export default async function VerifyPage() {
  if (await getSession()) redirect('/admin');

  const raw = (await cookies()).get('aisr_pending')?.value;
  let pending: Pending | null = null;
  try {
    pending = raw ? (JSON.parse(raw) as Pending) : null;
  } catch {
    pending = null;
  }
  // No in-flight challenge → nothing to verify.
  if (!pending?.email) redirect('/login');

  // Surface where the code was sent (email vs email+whatsapp) from the challenge.
  const challenge = await db.verificationCode.findFirst({
    where: { identifier: pending.email },
    orderBy: { createdAt: 'desc' },
    select: { channel: true },
  });
  const channels = (challenge?.channel ?? 'email').split('+');

  return (
    <div className="animate-fade-up">
      <VerifyForm email={pending.email} purpose={pending.purpose} channels={channels} />
    </div>
  );
}
