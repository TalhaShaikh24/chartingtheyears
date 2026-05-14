import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtEdge } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect admin routes — user/public routes are open
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    try {
      const payload = await verifyJwtEdge(token);

      if (payload.role !== 'ADMIN') {
        // Authenticated but not an admin — send to user area
        return NextResponse.redirect(new URL('/user', request.url));
      }

      return NextResponse.next();
    } catch {
      // Invalid token — clear cookie and redirect to sign in
      const response = NextResponse.redirect(new URL('/auth/signin', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // Prevent already-authenticated users from accessing auth pages
  if (pathname.startsWith('/auth')) {
    const token = request.cookies.get('token')?.value;
    if (token) {
      try {
        const payload = await verifyJwtEdge(token);
        return NextResponse.redirect(
          new URL(payload.role === 'ADMIN' ? '/admin/dashboard' : '/user', request.url)
        );
      } catch {
        // Token invalid — continue to auth page
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
};
