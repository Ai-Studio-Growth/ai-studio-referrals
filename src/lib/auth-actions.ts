'use server';

import { z } from 'zod';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword, passwordIssues } from '@/lib/password';
import { createSession, destroySession, homeForRole } from '@/lib/auth';
import { getOrCreateReferral, audit } from '@/lib/referral/engine';
import { hashValue } from '@/lib/referral/codes';
import { validateEmail, normalizePhone } from '@/lib/validation';
import { createChallenge, verifyChallenge } from '@/lib/otp';

export type AuthState = { error?: string; fieldErrors?: Record<string, string>; notice?: string };

// Pending-verification pointer: a short-lived httpOnly cookie naming the email
// (and where to go next) for an in-flight OTP challenge. The code itself only
// lives in the DB (hashed) and is delivered out-of-band, so this is just a hint.
const PENDING_COOKIE = 'aisr_pending';
const PENDING_MAX_AGE = 15 * 60;

type Pending = { email: string; purpose: 'signup' | 'login'; next?: string };

async function setPending(p: Pending) {
  const jar = await cookies();
  jar.set(PENDING_COOKIE, JSON.stringify(p), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: PENDING_MAX_AGE,
  });
}
async function getPending(): Promise<Pending | null> {
  const raw = (await cookies()).get(PENDING_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Pending;
  } catch {
    return null;
  }
}
async function clearPending() {
  (await cookies()).delete(PENDING_COOKIE);
}

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
  phone: z.string().trim().min(1, 'Please enter your phone number'),
  password: z.string(),
});

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get('name'),
    company: formData.get('company'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues) fe[i.path[0] as string] = i.message;
    return { error: 'Please fix the highlighted fields.', fieldErrors: fe };
  }
  const { name, company, email, phone, password } = parsed.data;

  // Real phone validation → normalize to E.164.
  const e164 = normalizePhone(phone);
  if (!e164) {
    return { fieldErrors: { phone: 'Enter a valid phone number with country code, e.g. +14155552671.' } };
  }

  // Real email validation: format + disposable + MX records.
  const emailCheck = await validateEmail(email);
  if (!emailCheck.ok) return { fieldErrors: { email: emailCheck.reason } };

  const pwIssues = passwordIssues(password);
  if (pwIssues.length) return { fieldErrors: { password: `Password needs ${pwIssues.join(', ')}.` } };

  // Uniqueness check up-front so we don't send an OTP for an existing account.
  const existing = await db.account.findUnique({ where: { email } });
  if (existing) return { fieldErrors: { email: 'An account with this email already exists.' } };

  // Defer account creation: stash the pending payload on a hashed OTP challenge.
  const passwordHash = await hashPassword(password);
  await createChallenge({
    identifier: email,
    purpose: 'signup',
    email,
    phone: e164,
    payload: { name, company, email, phone: e164, passwordHash },
  });
  await setPending({ email, purpose: 'signup' });
  redirect('/verify');
}

/** Build the org + owner account from verified signup data. Returns the account. */
async function createWorkspaceAccount(data: {
  name: string;
  company: string;
  email: string;
  phone: string;
  passwordHash: string;
}) {
  const { name, company, email, phone, passwordHash } = data;
  const slugBase = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'workspace';
  const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;

  const account = await db.$transaction(async (tx) => {
    const org = await tx.org.create({ data: { name: company, slug } });
    const acct = await tx.account.create({
      data: { email, name, phone, passwordHash, orgId: org.id, role: 'advertiser', lastLoginAt: new Date() },
    });
    await tx.membership.create({ data: { orgId: org.id, email, name, role: 'admin' } });
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
  const camp = await db.campaign.findFirst({ where: { orgId } });
  const owner = await db.endUser.findFirst({ where: { orgId } });
  if (camp && owner) await getOrCreateReferral({ campaignId: camp.id, referrerId: owner.id });
  return account;
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

  // Password is correct — require a second factor before issuing the session.
  await createChallenge({ identifier: email, purpose: 'login', email, phone: account.phone });
  await setPending({ email, purpose: 'login', next: next.startsWith('/') ? next : undefined });
  redirect('/verify');
}

// ── Verify OTP ───────────────────────────────────────────────────────────────
export async function verifyAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const pending = await getPending();
  if (!pending) return { error: 'Your verification session expired. Please start again.' };

  const code = String(formData.get('code') ?? '').trim();
  if (!/^[0-9]{6}$/.test(code)) return { fieldErrors: { code: 'Enter the 6-digit code.' } };

  const result = await verifyChallenge({ identifier: pending.email, code });
  if (!result.ok) return { fieldErrors: { code: result.reason } };

  if (result.purpose === 'signup') {
    const p = result.payload as { name: string; company: string; email: string; phone: string; passwordHash: string } | null;
    if (!p) return { error: 'Your signup data was lost. Please sign up again.' };
    // Guard against a race where the email was registered after the OTP was sent.
    const dup = await db.account.findUnique({ where: { email: p.email } });
    if (dup) return { error: 'An account with this email already exists. Please log in.' };
    const account = await createWorkspaceAccount(p);
    await clearPending();
    await createSession(account.id);
    redirect('/admin');
  }

  // login
  const account = await db.account.findUnique({ where: { email: pending.email } });
  if (!account) return { error: 'Account not found. Please log in again.' };
  await db.account.update({ where: { id: account.id }, data: { lastLoginAt: new Date() } });
  await clearPending();
  await createSession(account.id);
  redirect(pending.next?.startsWith('/') ? pending.next : homeForRole(account.role));
}

/** Re-issue an OTP for the in-flight challenge. */
export async function resendAction(): Promise<AuthState> {
  const pending = await getPending();
  if (!pending) return { error: 'Your verification session expired. Please start again.' };

  if (pending.purpose === 'signup') {
    const existing = await db.verificationCode.findFirst({
      where: { identifier: pending.email, purpose: 'signup' },
      orderBy: { createdAt: 'desc' },
    });
    const p = existing?.payload as { phone?: string } | null;
    await createChallenge({
      identifier: pending.email,
      purpose: 'signup',
      email: pending.email,
      phone: p?.phone ?? null,
      payload: (existing?.payload ?? undefined) as Parameters<typeof createChallenge>[0]['payload'],
    });
  } else {
    const account = await db.account.findUnique({ where: { email: pending.email } });
    await createChallenge({ identifier: pending.email, purpose: 'login', email: pending.email, phone: account?.phone });
  }
  return { notice: 'A new code is on its way.' };
}

// ── Log out ──────────────────────────────────────────────────────────────────
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/login');
}
