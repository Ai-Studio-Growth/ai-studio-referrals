import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash, randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { hashValue } from '@/lib/referral/codes';
import { SESSION_COOKIE } from '@/lib/constants';
import type { Account, Org, EndUser } from '@prisma/client';

export type Role = 'super_admin' | 'advertiser' | 'referrer';

/** Where each role lands after login. */
export function homeForRole(role: string): string {
  if (role === 'super_admin') return '/platform';
  if (role === 'referrer') return '/dashboard';
  return '/admin';
}

export { SESSION_COOKIE };
const SESSION_TTL_DAYS = 30;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Create a session row + set the httpOnly session cookie. */
export async function createSession(accountId: string): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const h = await headers();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: {
      accountId,
      tokenHash: hashToken(token),
      expiresAt,
      ipHash: hashValue(h.get('x-forwarded-for')?.split(',')[0] ?? null),
      userAgent: h.get('user-agent')?.slice(0, 300) ?? null,
    },
  });

  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export type SessionContext = { account: Account; org: Org | null; endUser: EndUser | null; role: Role };

/** Read + validate the current session. Returns null if missing/expired/suspended. */
export async function getSession(): Promise<SessionContext | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { account: { include: { org: true, endUser: true } } },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  if (session.account.status === 'suspended') return null;

  return {
    account: session.account,
    org: session.account.org,
    endUser: session.account.endUser,
    role: session.account.role as Role,
  };
}

/** Require a valid session or redirect to /login (preserving the destination). */
export async function requireSession(next?: string): Promise<SessionContext> {
  const ctx = await getSession();
  if (!ctx) redirect(next ? `/login?next=${encodeURIComponent(next)}` : '/login');
  return ctx;
}

/** Require the platform operator (super admin). */
export async function requirePlatform(): Promise<{ account: Account }> {
  const ctx = await requireSession('/platform');
  if (ctx.role !== 'super_admin') redirect(homeForRole(ctx.role));
  return { account: ctx.account };
}

/** Require an advertiser with a workspace. */
export async function requireWorkspace(): Promise<{ account: Account; org: Org }> {
  const ctx = await requireSession('/admin');
  if (ctx.role !== 'advertiser' || !ctx.org) redirect(homeForRole(ctx.role));
  return { account: ctx.account, org: ctx.org };
}

/** Require a referrer with a linked profile + workspace. */
export async function requireReferrer(): Promise<{ account: Account; org: Org; endUser: EndUser }> {
  const ctx = await requireSession('/dashboard');
  if (ctx.role !== 'referrer' || !ctx.org || !ctx.endUser) redirect(homeForRole(ctx.role));
  return { account: ctx.account, org: ctx.org, endUser: ctx.endUser };
}

/** Destroy the current session (logout): delete the row and clear the cookie. */
export async function destroySession(): Promise<void> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  c.delete(SESSION_COOKIE);
}
