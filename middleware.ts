import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
    const isApiAuth = req.nextUrl.pathname.startsWith('/api/auth');

    // Permettre l'accès aux routes d'authentification API
    if (isApiAuth) {
      return NextResponse.next();
    }

    // Rediriger les utilisateurs connectés depuis les pages d'auth
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Protéger le dashboard
    if (isDashboard && !isAuth) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Laisser le middleware gérer l'autorisation
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*']
};
