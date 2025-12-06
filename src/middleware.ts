// ============================================================================
// Next.js Middleware - Route Protection & Authentication
// ============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/terms',
  '/privacy',
  '/api/auth/signup',
  '/api/auth/login',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
];

// Routes that require specific roles
const ROLE_PROTECTED_ROUTES: Record<string, string[]> = {
  '/users': ['admin'],
  '/settings/organization': ['admin'],
  '/settings/billing': ['admin'],
  '/settings/ai': ['admin'],
  '/api/users': ['admin'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    const supabase = createServerClient();

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Redirect to login if no session
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('id, email, role, organization_id, email_verified')
      .eq('id', session.user.id)
      .single();

    if (!user) {
      // User not found in database, redirect to login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check if email is verified (except for verify-email page)
    if (!user.email_verified && !pathname.startsWith('/verify-email')) {
      if (!process.env.SKIP_EMAIL_VERIFICATION) {
        const verifyUrl = new URL('/verify-email', request.url);
        return NextResponse.redirect(verifyUrl);
      }
    }

    // Check role-based access
    for (const [route, allowedRoles] of Object.entries(ROLE_PROTECTED_ROUTES)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(user.role)) {
          // Forbidden - redirect to dashboard with error
          const dashboardUrl = new URL('/dashboard', request.url);
          dashboardUrl.searchParams.set('error', 'insufficient_permissions');
          return NextResponse.redirect(dashboardUrl);
        }
      }
    }

    // Add user info to headers for use in API routes
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', user.role);
    response.headers.set('x-organization-id', user.organization_id);

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
