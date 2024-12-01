import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'es', 'fr', 'pt']
const defaultLocale = 'es'

function getLocaleFromHeader(acceptLanguage: string | null): string {
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().substring(0, 2))
      .find(lang => locales.includes(lang))

    if (preferredLocale) {
      return preferredLocale
    }
  }
  return defaultLocale
}

export function middleware(request: NextRequest) {
  const localeCookie = request.cookies.get('locale')

  if (!localeCookie) {
    const acceptLanguage = request.headers.get('Accept-Language')
    const locale = getLocaleFromHeader(acceptLanguage)

    const response = NextResponse.redirect(request.url)
    response.cookies.set('locale', locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/'
    })

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
