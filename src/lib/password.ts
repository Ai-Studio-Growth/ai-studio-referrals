import { scrypt, randomBytes, timingSafeEqual, type ScryptOptions } from 'crypto';

// scrypt is a memory-hard KDF shipped with Node — no native deps required.
// Parameters: N=2^15 (cost), r=8, p=1, 64-byte derived key.
const KEYLEN = 64;
const COST: ScryptOptions = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function scryptAsync(password: string, salt: string, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, COST, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

/** Hash a plaintext password as `scrypt$<saltHex>$<hashHex>`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = await scryptAsync(password.normalize('NFKC'), salt, KEYLEN);
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

/** Verify a password against a stored hash using a constant-time comparison. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const derived = await scryptAsync(password.normalize('NFKC'), salt, KEYLEN);
  const hashBuf = Buffer.from(hash, 'hex');
  if (hashBuf.length !== derived.length) return false;
  return timingSafeEqual(hashBuf, derived);
}

/** Lightweight server-side password policy. Mirrors the client strength meter. */
export function passwordIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 8) issues.push('at least 8 characters');
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) issues.push('upper & lower case letters');
  if (!/[0-9]/.test(password)) issues.push('a number');
  return issues;
}
