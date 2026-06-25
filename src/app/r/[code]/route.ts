import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recordClick } from '@/lib/referral/engine';
import { landingLink, normalizeCode } from '@/lib/referral/codes';

/**
 * Sub-100ms referral redirect.
 *
 * The redirect response is returned immediately; click attribution is written
 * asynchronously (not awaited) so link latency is never gated on a DB write.
 * A short-lived attribution cookie carries the code through to conversion.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const code = normalizeCode((await ctx.params).code);

  // Resolve the destination first (single indexed lookup on Referral.code).
  const referral = await db.referral.findUnique({
    where: { code },
    select: { id: true, campaign: { select: { attributionWindowDays: true } } },
  });

  const destination = referral ? landingLink(code) : '/';
  const res = NextResponse.redirect(new URL(destination, req.url), 302);

  if (referral) {
    const windowDays = referral.campaign.attributionWindowDays;
    res.cookies.set('rl_ref', code, {
      maxAge: windowDays * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // readable by the embeddable widget for client-side attribution
    });

    // Fire-and-forget click tracking — do not await.
    void recordClick({
      code,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0] ?? null,
      device: req.headers.get('user-agent'),
      country: req.headers.get('x-vercel-ip-country') ?? null,
      userAgent: req.headers.get('user-agent'),
      referer: req.headers.get('referer'),
    }).catch(() => {});
  }

  return res;
}
