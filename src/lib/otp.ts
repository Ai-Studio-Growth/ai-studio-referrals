import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { getEmailAdapter, getWhatsAppAdapter } from '@/lib/adapters/messaging';

/**
 * Two-step OTP for signup/login. We persist only sha256(code) and (for signup)
 * the pending account payload — so no half-created Account exists until the code
 * is verified. The same 6-digit code is delivered over email and, when a phone
 * is on file, WhatsApp.
 */

export type ChallengePurpose = 'signup' | 'login';

const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function sha256(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

function sixDigits(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/**
 * Create (or replace) an OTP challenge for `identifier` and dispatch the code.
 * Returns the channels the code was actually sent over so the UI can tell the
 * user where to look.
 */
export async function createChallenge(opts: {
  identifier: string; // the email the challenge is keyed to
  purpose: ChallengePurpose;
  email: string;
  phone?: string | null;
  payload?: Prisma.InputJsonValue;
}): Promise<{ id: string; channels: string[] }> {
  const identifier = opts.identifier.trim().toLowerCase();
  const code = sixDigits();
  const channels = opts.phone ? ['email', 'whatsapp'] : ['email'];

  // Supersede any outstanding challenge for the same identifier+purpose.
  await db.verificationCode.deleteMany({ where: { identifier, purpose: opts.purpose } });

  const row = await db.verificationCode.create({
    data: {
      identifier,
      codeHash: sha256(code),
      channel: channels.join('+'),
      purpose: opts.purpose,
      payload: opts.payload ?? undefined,
      expiresAt: new Date(Date.now() + TTL_MS),
    },
  });

  await dispatch(code, opts.email, opts.phone);
  return { id: row.id, channels };
}

async function dispatch(code: string, email: string, phone?: string | null) {
  const subject = `Your Ai Studio verification code: ${code}`;
  const html = `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`;
  const body = `Your Ai Studio verification code is ${code}. It expires in 10 minutes.`;

  const tasks: Promise<unknown>[] = [getEmailAdapter().send({ to: email, subject, html })];
  if (phone) tasks.push(getWhatsAppAdapter().send({ to: phone, body }));
  // Best-effort delivery — never let a provider hiccup throw out of the auth flow.
  await Promise.allSettled(tasks);
}

export type VerifyResult =
  | { ok: true; purpose: ChallengePurpose; payload: Prisma.JsonValue | null }
  | { ok: false; reason: string };

/** Verify a submitted code against the latest challenge for `identifier`. */
export async function verifyChallenge(opts: { identifier: string; code: string }): Promise<VerifyResult> {
  const identifier = opts.identifier.trim().toLowerCase();
  const code = opts.code.trim();

  const challenge = await db.verificationCode.findFirst({
    where: { identifier },
    orderBy: { createdAt: 'desc' },
  });
  if (!challenge) return { ok: false, reason: 'No active code. Request a new one.' };

  if (challenge.expiresAt.getTime() < Date.now()) {
    await db.verificationCode.delete({ where: { id: challenge.id } });
    return { ok: false, reason: 'This code has expired. Request a new one.' };
  }
  if (challenge.attempts >= MAX_ATTEMPTS) {
    await db.verificationCode.delete({ where: { id: challenge.id } });
    return { ok: false, reason: 'Too many incorrect attempts. Request a new code.' };
  }

  const a = Buffer.from(sha256(code));
  const b = Buffer.from(challenge.codeHash);
  const match = a.length === b.length && timingSafeEqual(a, b);

  if (!match) {
    await db.verificationCode.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, reason: 'Incorrect code. Please try again.' };
  }

  // Single-use: consume on success.
  await db.verificationCode.delete({ where: { id: challenge.id } });
  return { ok: true, purpose: challenge.purpose as ChallengePurpose, payload: challenge.payload };
}
