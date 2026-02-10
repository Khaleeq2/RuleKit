import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_PREFIXES = [
  '/home',
  '/rulebooks',
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

async function getSupabaseUser(request: NextRequest) {
  const supabaseUrl = `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co`;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }> = [];

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(nextCookies) {
        for (const cookie of nextCookies) {
          cookiesToSet.push(cookie);
        }
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  return { user: data.user, cookiesToSet };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Maintenance mode ---
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  if (maintenanceMode && !isExcludedPath(pathname) && !isMarketingRoute(pathname)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = '/maintenance';
    rewriteUrl.search = '';
    return NextResponse.rewrite(rewriteUrl);
  }

  // Collect any cookies that Supabase needs to refresh (token rotation)
  let pendingCookies: Array<{ name: string; value: string; options?: Record<string, unknown> }> = [];

  // --- Auth guard for protected app routes ---
  if (isProtectedRoute(pathname)) {
    // Explicit dev bypass — only when deliberately enabled
    const devBypass = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true';
    if (!devBypass) {
      const { user, cookiesToSet } = hasSupabaseSession(request)
        ? await getSupabaseUser(request)
        : { user: null, cookiesToSet: [] as Array<{ name: string; value: string; options?: Record<string, unknown> }> };

      if (!user) {
        const signInUrl = request.nextUrl.clone();
        signInUrl.pathname = '/auth/sign-in';
        signInUrl.searchParams.set('redirect', `${pathname}${request.nextUrl.search}`);
        const response = NextResponse.redirect(signInUrl);
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        return response;
      }

      // User is valid — carry refreshed cookies forward
      pendingCookies = cookiesToSet;
    }
  }

  // --- Redirect signed-in users away from auth pages ---
  if (pathname === '/auth/sign-in' || pathname === '/auth/sign-up' || pathname === '/auth/reset-password') {
    const devBypass = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true';
    if (!devBypass && hasSupabaseSession(request)) {
      const { user, cookiesToSet } = await getSupabaseUser(request);
      if (user) {
        const nextUrl = request.nextUrl.clone();
        nextUrl.pathname = '/home';
        nextUrl.search = '';
        const response = NextResponse.redirect(nextUrl);
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        return response;
      }
    }
  }

  // --- Redirect /decisions/* → /rulebooks/* ---
  if (pathname === '/decisions' || pathname.startsWith('/decisions/')) {
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = pathname.replace('/decisions', '/rulebooks');
    return NextResponse.redirect(newUrl);
  }

  // Forward any refreshed auth cookies so the browser stays in sync
  const response = NextResponse.next();
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
