import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'ur'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language');
  
  // Check cookie first
  const cookieLocale = request.cookies.get('lang')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }
  
  // Then check accept-language header
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
    for (const lang of languages) {
      if (locales.includes(lang)) {
        return lang;
      }
      const baseLang = lang.split('-')[0];
      if (locales.includes(baseLang)) {
        return baseLang;
      }
    }
  }
  
  // Finally, fall back to default
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect if there is no locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|book-1920.jpg).*)'],
};
