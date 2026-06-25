import { db } from '@/lib/db';
import crypto from 'crypto';

// In-memory token bucket (per API key prefix). Production would use Redis/edge KV.
const buckets = new Map<string, { tokens: number; refilledAt: number }>();
const RATE = { capacity: 120, refillPerSec: 2 }; // 120 burst, 2 req/s sustained

export function rateLimit(key: string): boolean {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: RATE.capacity, refilledAt: now };
  const elapsed = (now - b.refilledAt) / 1000;
  b.tokens = Math.min(RATE.capacity, b.tokens + elapsed * RATE.refillPerSec);
  b.refilledAt = now;
  if (b.tokens < 1) {
    buckets.set(key, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(key, b);
  return true;
}

export type ApiAuthResult =
  | { ok: true; orgId: string; keyPrefix: string }
  | { ok: false; status: number; error: string };

/**
 * Authenticate a public API request via `Authorization: Bearer <key>`.
 * Keys are stored hashed; we hash the presented key and look it up by prefix.
 */
export async function authenticateApi(req: Request): Promise<ApiAuthResult> {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return { ok: false, status: 401, error: 'missing_api_key' };

  const prefix = token.slice(0, 12);
  const key = await db.apiKey.findUnique({ where: { prefix } });
  if (!key || key.revokedAt) return { ok: false, status: 401, error: 'invalid_api_key' };

  const presented = crypto.createHash('sha256').update(token).digest('hex');
  if (presented !== key.hashedKey) return { ok: false, status: 401, error: 'invalid_api_key' };

  if (!rateLimit(prefix)) return { ok: false, status: 429, error: 'rate_limited' };

  // Best-effort last-used timestamp.
  void db.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

  return { ok: true, orgId: key.orgId, keyPrefix: prefix };
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
