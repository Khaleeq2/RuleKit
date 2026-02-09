import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/home',
  '/decisions',
  '/history',
  '/billing',
  '/settings',
  '/dashboard',
  '/integrations',
  '/runs',
];

const MARKETING_ROUTE_PREFIXES = [
  '/api',
  ...PROTECTED_PREFIXES,
];

const EXCLUDED_PATHS = new Set([
  '/maintenance',
  '/robots.txt',
  '/sitemap.xml',
  '/favicon.ico',
]);

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isMarketingRoute(pathname: string): boolean {
  return MARKETING_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isExcludedPath(pathname: string): boolean {
  if (EXCLUDED_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/_next')) return true;
  return /\.[^/]+$/.test(pathname);
}

function hasSupabaseSession(request: NextRequest): boolean {
  const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || '';
  // Supabase stores auth tokens in cookies named sb-<project-id>-auth-token*
  for (const [name] of request.cookies) {
    if (name.startsWith(`sb-${projectId}-auth-token`)) {
      return true;
    }
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Maintenance mode ---
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  if (maintenanceMode && !isExcludedPath(pathname) && !isMarketingRoute(pathname)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = '/maintenance';
    rewriteUrl.search = '';
    return NextResponse.rewrite(rewriteUrl);
  }

  // --- Auth guard for protected app routes ---
  if (isProtectedRoute(pathname) && !hasSupabaseSession(request)) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = '/auth/sign-in';
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
