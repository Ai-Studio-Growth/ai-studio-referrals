import { db } from '@/lib/db';
import { fraudConfig } from '@/lib/config/campaign-config';

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'trashmail.com',
  'yopmail.com',
  'sharklasers.com',
]);

export type FraudSignal = {
  reason: string;
  severity: 'low' | 'medium' | 'high';
  details?: Record<string, unknown>;
};

export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}

export function looksLikeValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function looksLikeValidPhone(phone?: string | null): boolean {
  if (!phone) return true; // phone optional
  return /^\+?[0-9 ()-]{7,20}$/.test(phone);
}

/**
 * Evaluate a prospective conversion for abuse. Returns the signals found so the
 * caller can decide whether to auto-hold, route to manual review, or reject.
 * Pure detection — never throws — so the conversion is always recorded with an
 * audit trail even when flagged.
 */
export async function evaluateConversion(args: {
  orgId: string;
  referralId: string;
  referrerEmail: string;
  refereeEmail?: string | null;
  ipHash?: string | null;
  deviceHash?: string | null;
}): Promise<FraudSignal[]> {
  const signals: FraudSignal[] = [];

  // 1. Self-referral: referee email == referrer email.
  if (
    fraudConfig.blockSelfReferral &&
    args.refereeEmail &&
    args.refereeEmail.toLowerCase() === args.referrerEmail.toLowerCase()
  ) {
    signals.push({ reason: 'self_referral', severity: 'high' });
  }

  // 2. Disposable / invalid referee email.
  if (args.refereeEmail && isDisposableEmail(args.refereeEmail)) {
    signals.push({ reason: 'disposable_email', severity: 'medium', details: { email: args.refereeEmail } });
  }

  // 3. IP velocity — too many conversions from one IP in 24h.
  if (args.ipHash) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const ipCount = await db.click.count({
      where: { ipHash: args.ipHash, createdAt: { gte: since }, referral: { orgId: args.orgId } },
    });
    if (ipCount > fraudConfig.maxConversionsPerIpPerDay * 10) {
      signals.push({ reason: 'ip_velocity', severity: 'medium', details: { clicks24h: ipCount } });
    }
  }

  // 4. Duplicate device — same fingerprint already converted recently.
  if (args.deviceHash) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dupDevice = await db.conversion.count({
      where: {
        orgId: args.orgId,
        createdAt: { gte: since },
        referral: { clicks: { some: { deviceHash: args.deviceHash } } },
      },
    });
    if (dupDevice >= fraudConfig.maxConversionsPerDevicePerDay) {
      signals.push({ reason: 'device_duplicate', severity: 'high', details: { count: dupDevice } });
    }
  }

  return signals;
}

export function worstSeverity(signals: FraudSignal[]): 'low' | 'medium' | 'high' | null {
  if (signals.length === 0) return null;
  if (signals.some((s) => s.severity === 'high')) return 'high';
  if (signals.some((s) => s.severity === 'medium')) return 'medium';
  return 'low';
}
