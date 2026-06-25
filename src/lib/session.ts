import { db } from '@/lib/db';

/**
 * Demo session resolver. To keep the showcase explorable without an IdP, the
 * "current org" and "current referrer" are resolved from a cookie/query, falling
 * back to the seeded demo org and its top referrer. In production this is where
 * the auth adapter's session would be read instead.
 */

export async function getDemoOrg(slug?: string) {
  if (slug) {
    const org = await db.org.findUnique({ where: { slug } });
    if (org) return org;
  }
  return db.org.findFirstOrThrow({ orderBy: { createdAt: 'asc' } });
}

export async function getDemoReferrer(orgId: string, userId?: string) {
  if (userId) {
    const u = await db.endUser.findUnique({ where: { id: userId } });
    if (u) return u;
  }
  // Default to the referrer with the most referrals (most interesting dashboard).
  const top = await db.endUser.findFirst({
    where: { orgId, referralsMade: { some: {} } },
    orderBy: { referralsMade: { _count: 'desc' } },
  });
  if (top) return top;
  return db.endUser.findFirstOrThrow({ where: { orgId } });
}
