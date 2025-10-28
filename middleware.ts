import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

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
    if (url.pathname.startsWith('/admin')) {
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};

