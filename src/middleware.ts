import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/constants';

/**
 * Fast edge gate for the authenticated app. Only checks that a session cookie is
 * present (no DB access at the edge); full cryptographic validation happens in
 * the app layout via requireSession(). Missing cookie → bounce to /login with a
 * `next` param so we can return the user where they were headed.
 */
export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/platform/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/leaderboard/:path*',
    '/settings/:path*',
    '/profile',
    '/community',
  ],
};
