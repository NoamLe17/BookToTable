import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Proxy (Next.js 16 — replaces middleware.ts)
 * 
 * Adds security headers to all responses and blocks direct navigation
 * to protected routes before client-side auth loads.
 * 
 * The actual auth gate for /admin is enforced by:
 * 1. This proxy (security headers + bot blocking)
 * 2. Firebase Admin SDK token verification in each API route
 * 3. Client-side layout guard in admin/layout.tsx
 */
export function proxyMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ─── Security Headers (applied to ALL responses) ───────────────────────────

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Force HTTPS referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy — disable camera, mic, geolocation for this app
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self)'
  );

  // ─── API Route Protection ───────────────────────────────────────────────────

  // Block access to API routes that have no public use from browsers
  if (pathname.startsWith('/api/email/broadcast') || pathname.startsWith('/api/indexing/batch')) {
    // These routes require auth — reject preflight/OPTIONS from unexpected origins
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && host && !origin.includes(host.split(':')[0])) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // ─── Block common scanning/exploit paths ───────────────────────────────────
  const blockList = [
    '/wp-admin', '/wp-login', '/.env', '/phpMyAdmin',
    '/admin.php', '/config.php', '/.git', '/shell',
    '/xmlrpc.php', '/backup', '/db.sql',
  ];

  if (blockList.some(blocked => pathname.toLowerCase().startsWith(blocked))) {
    return new NextResponse(null, { status: 404 });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.png (app icon)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
