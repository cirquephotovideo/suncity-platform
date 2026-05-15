import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // /admin reste hors i18n (gardé par NextAuth via session check côté layout)
  if (pathname.startsWith('/admin')) return NextResponse.next();
  // /api reste hors i18n
  if (pathname.startsWith('/api')) return NextResponse.next();
  // assets
  if (pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|woff2?|ttf|otf|css|js|map|json|txt|xml)$/)) return NextResponse.next();

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!_next|_vercel|favicon.ico|robots.txt|sitemap.xml).*)'],
};
