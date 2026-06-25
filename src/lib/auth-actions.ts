'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword, passwordIssues } from '@/lib/password';
import { createSession, destroySession, homeForRole } from '@/lib/auth';
import { getOrCreateReferral, audit } from '@/lib/referral/engine';
import { hashValue } from '@/lib/referral/codes';

export type AuthState = { error?: string; fieldErrors?: Record<string, string> };

// ── Brute-force protection: per IP+email sliding window lockout ───────────────
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const e = attempts.get(key);
  if (!e || now - e.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
    return false;
  }
  e.count += 1;
  return e.count > MAX_ATTEMPTS;
}
function resetAttempts(key: string) {
  attempts.delete(key);
}

async function clientKey(email: string): Promise<string> {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0] ?? 'local';
  return `${hashValue(ip)}:${email.toLowerCase()}`;
}

const emailSchema = z.string().trim().toLowerCase().email();

// ── Sign up ──────────────────────────────────────────────────────────────────
const signupSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  company: z.string().trim().min(2, 'Please enter a workspace name'),
  email: emailSchema,
  password: z.string(),
});

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get('name'),
    company: formData.get('company'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues) fe[i.path[0] as string] = i.message;
    return { error: 'Please fix the highlighted fields.', fieldErrors: fe };
  }
  const { name, company, email, password } = parsed.data;

  const pwIssues = passwordIssues(password);
  if (pwIssues.length) return { fieldErrors: { password: `Password needs ${pwIssues.join(', ')}.` } };

  // Uniqueness check (generic message — don't leak which emails exist beyond signup).
  const existing = await db.account.findUnique({ where: { email } });
  if (existing) return { fieldErrors: { email: 'An account with this email already exists.' } };

  const passwordHash = await hashPassword(password);
  const slugBase = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'workspace';
  const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;

  const account = await db.$transaction(async (tx) => {
    const org = await tx.org.create({ data: { name: company, slug } });
    const acct = await tx.account.create({
      data: { email, name, passwordHash, orgId: org.id, role: 'advertiser', lastLoginAt: new Date() },
    });
    await tx.membership.create({ data: { orgId: org.id, email, name, role: 'admin' } });
    // Seed a starter campaign + the owner's own referral so the workspace works on day one.
    await tx.campaign.create({
      data: {
        orgId: org.id,
        name: 'Refer a friend',
        slug: 'refer-a-friend',
        description: 'Give a reward, get a reward when a friend signs up.',
        triggerEvent: 'signup',
        referrerReward: { base: { type: 'cash', amount: 1000, unit: 'cents', recurring: false }, milestones: [] },
        refereeReward: { type: 'discount', amount: 10, unit: 'percent', recurring: false },
      },
    });
    await tx.endUser.create({ data: { orgId: org.id, email, name } });
    return acct;
  });

  const orgId = account.orgId!;
  await audit(orgId, email, 'account.signup', account.id);

  // Generate the owner's referral link in the starter campaign.
  const camp = await db.campaign.findFirst({ where: { orgId } });
  const owner = await db.endUser.findFirst({ where: { orgId } });
  if (camp && owner) await getOrCreateReferral({ campaignId: camp.id, referrerId: owner.id });

  await createSession(account.id);
  redirect('/admin');
}

// ── Log in ───────────────────────────────────────────────────────────────────
const loginSchema = z.object({ email: emailSchema, password: z.string().min(1) });

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) return { error: 'Enter a valid email and password.' };
  const { email, password } = parsed.data;
  const next = (formData.get('next') as string | null) ?? '';

  const key = await clientKey(email);
  if (rateLimited(key)) return { error: 'Too many attempts. Please wait a few minutes and try again.' };

  const account = await db.account.findUnique({ where: { email } });
  // Always run a verify to keep timing consistent whether or not the email exists.
  const ok = account
    ? await verifyPassword(password, account.passwordHash)
    : await verifyPassword(password, 'scrypt$0$0');
  if (!account || !ok) return { error: 'Invalid email or password.' };
  if (account.status === 'suspended') return { error: 'This account has been suspended. Contact support.' };

  resetAttempts(key);
  await db.account.update({ where: { id: account.id }, data: { lastLoginAt: new Date() } });
  await createSession(account.id);
  // Route to the requested page if safe, else to the role's home.
  redirect(next.startsWith('/') ? next : homeForRole(account.role));
}

// ── Log out ──────────────────────────────────────────────────────────────────
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/login');
}
