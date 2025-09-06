import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  const isAppPath = /^\/(dashboard|alerts|settings)/.test(pathname);

  if (isAppPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/?error=unauthorized', req.url));
    }
    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (e) {
      return NextResponse.redirect(new URL('/?error=unauthorized', req.url));
    }
  }

  // If user is logged in, redirect from home to dashboard
  if (token && pathname === '/') {
     try {
      await jwtVerify(token, secret);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } catch (e) {
      // Invalid token, let them stay
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard', '/alerts', '/settings'],
};