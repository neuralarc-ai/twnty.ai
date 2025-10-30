import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { maybeRunHourlyBoost } from '@/lib/hourlyBoost';

export async function middleware(request: NextRequest) {
  // Opportunistically trigger small hourly engagement boosts (non-blocking when not due)
  // Errors are swallowed inside the function
  await maybeRunHourlyBoost();

  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Handle www subdomain - redirect to non-www
  // NOTE: This is disabled to avoid redirect loops. Configure www redirect at your hosting platform level (Vercel/etc)
  // if (hostname.startsWith('www.')) {
  //   const nonWwwHostname = hostname.replace('www.', '');
  //   const protocol = request.nextUrl.protocol;
  //   const path = request.nextUrl.pathname + request.nextUrl.search;
  //   const redirectUrl = `${protocol}//${nonWwwHostname}${path}`;
  //   return NextResponse.redirect(redirectUrl, 301);
  // }

  // Handle admin subdomain (admin.twnty.ai or admin.localhost in dev)
  const isAdminSubdomain = hostname.startsWith('admin.') || hostname.startsWith('admin.localhost');

  if (isAdminSubdomain) {
    // Admin subdomain: rewrite to admin routes
    // If accessing root, redirect to /admin/login
    if (url.pathname === '/') {
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
    
    // If not accessing admin routes, rewrite to admin
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  } else {
    // Public domain (twnty.ai): block direct access to admin routes
    // EXCEPT for the login page which is allowed
    if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
      // Redirect to homepage with error message or just redirect to home
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - static files (_next/static)
     * - image optimization files (_next/image)
     * - favicon and other public files
     * Note: www redirect should be handled at platform level (Vercel/etc) to avoid loops
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};

