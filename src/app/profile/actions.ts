'use server';

import { db } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { hashPassword, verifyPassword, passwordIssues } from '@/lib/password';
import { revalidatePath } from 'next/cache';

export async function updateProfileAction(input: { name: string; email: string }) {
  const { account } = await requireSession();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (name.length < 2) return { ok: false as const, error: 'Name is too short.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false as const, error: 'Enter a valid email.' };

  const taken = await db.account.findFirst({ where: { email, id: { not: account.id } } });
  if (taken) return { ok: false as const, error: 'That email is already in use.' };

  await db.account.update({ where: { id: account.id }, data: { name, email } });
  revalidatePath('/profile');
  return { ok: true as const };
}

export async function changePasswordAction(input: { current: string; next: string }) {
  const { account } = await requireSession();
  const ok = await verifyPassword(input.current, account.passwordHash);
  if (!ok) return { ok: false as const, error: 'Current password is incorrect.' };
  const issues = passwordIssues(input.next);
  if (issues.length) return { ok: false as const, error: `New password needs ${issues.join(', ')}.` };

  await db.account.update({ where: { id: account.id }, data: { passwordHash: await hashPassword(input.next) } });
  // Invalidate other sessions for safety, keep the current one.
  return { ok: true as const };
}
