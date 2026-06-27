import { resolveMx } from 'node:dns/promises';
import { isDisposableEmail, looksLikeValidEmail } from '@/lib/referral/fraud';

/**
 * Real-world email + phone validation used by the auth flow. Reuses the shared
 * format/disposable helpers in `fraud.ts` and adds a DNS MX check so we reject
 * addresses at domains that can't actually receive mail.
 */

export type Validation = { ok: true } | { ok: false; reason: string };

// In-memory MX cache — a domain's mail capability rarely changes within a session,
// and this keeps repeated signups from re-querying DNS.
const mxCache = new Map<string, { ok: boolean; at: number }>();
const MX_TTL_MS = 60 * 60 * 1000;

/** Confirm the email is well-formed, non-disposable, and its domain has MX records. */
export async function validateEmail(email: string): Promise<Validation> {
  const value = email.trim().toLowerCase();
  if (!looksLikeValidEmail(value)) return { ok: false, reason: 'Enter a valid email address.' };
  if (isDisposableEmail(value)) return { ok: false, reason: 'Disposable email addresses are not allowed.' };

  const domain = value.split('@')[1];
  if (!domain) return { ok: false, reason: 'Enter a valid email address.' };

  const cached = mxCache.get(domain);
  if (cached && Date.now() - cached.at < MX_TTL_MS) {
    return cached.ok ? { ok: true } : { ok: false, reason: "This email domain can't receive mail." };
  }

  try {
    const records = await resolveMx(domain);
    const ok = Array.isArray(records) && records.length > 0;
    mxCache.set(domain, { ok, at: Date.now() });
    if (!ok) return { ok: false, reason: "This email domain can't receive mail." };
    return { ok: true };
  } catch (err) {
    const code = (err as { code?: string })?.code;
    // Definitive "this domain has no mail" answers → reject.
    if (code === 'ENOTFOUND' || code === 'ENODATA' || code === 'NXDOMAIN') {
      mxCache.set(domain, { ok: false, at: Date.now() });
      return { ok: false, reason: "This email domain can't receive mail. Check the address." };
    }
    // Transient/blocked resolver (ESERVFAIL, ETIMEOUT, EAI_AGAIN, or DNS disabled
    // in the host runtime) → fail open so we never block legitimate signups. Don't
    // cache, so a later attempt can re-check.
    return { ok: true };
  }
}

/**
 * Normalize a phone number to E.164 (e.g. "+14155552671"). Returns null when the
 * input can't be a valid international number. We accept spaces, dashes, parens
 * and a leading "+" or "00" international prefix.
 */
export function normalizePhone(raw: string): string | null {
  let s = raw.trim().replace(/[\s()\-.]/g, '');
  if (s.startsWith('00')) s = '+' + s.slice(2);
  const digits = s.replace(/^\+/, '');
  // E.164: up to 15 digits, country code can't start with 0, min ~8 to be a real number.
  if (!/^[1-9][0-9]{7,14}$/.test(digits)) return null;
  return '+' + digits;
}

export function validatePhone(raw: string): Validation {
  return normalizePhone(raw)
    ? { ok: true }
    : { ok: false, reason: 'Enter a valid phone number with country code, e.g. +14155552671.' };
}
