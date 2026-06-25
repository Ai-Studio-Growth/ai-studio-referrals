import { customAlphabet } from 'nanoid';
import QRCode from 'qrcode';
import crypto from 'crypto';

// Unambiguous alphabet (no 0/O/1/I) for human-friendly, copyable codes.
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const nano = customAlphabet(alphabet, 5);

/**
 * Generate a short, readable referral code, optionally prefixed with a slug of
 * the referrer's name — e.g. "alex-7q2k". Codes are stored lower-case and looked
 * up case-insensitively (see normalizeCode), so links work in any casing.
 */
export function generateCode(seedName?: string): string {
  const prefix = (seedName ?? '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4);
  const body = nano();
  return (prefix ? `${prefix}-${body}` : body).toLowerCase();
}

/** Canonical form for a referral code — codes are case-insensitive. */
export function normalizeCode(code: string): string {
  return code.trim().toLowerCase();
}

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

/** The public short link a referrer shares. Hits the edge redirect at /r/[code]. */
export function shortLink(code: string): string {
  return `${appUrl()}/r/${code}`;
}

/** The referee-facing landing page (clear value prop + referee reward). */
export function landingLink(code: string): string {
  return `${appUrl()}/join/${code}`;
}

/** Generate a QR code (data URL) for the short link — rendered instantly client/server side. */
export async function qrDataUrl(code: string): Promise<string> {
  return QRCode.toDataURL(shortLink(code), {
    margin: 1,
    width: 320,
    color: { dark: '#0b0b15', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  });
}

/** Hash IP / device fingerprints — we never persist raw PII. */
export function hashValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const secret = process.env.APP_SECRET ?? 'dev-secret';
  return crypto.createHmac('sha256', secret).update(value).digest('hex').slice(0, 32);
}
