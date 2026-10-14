
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // When visiting the root domain (e.g. www.lingolandverse.com or /)
  if (pathname === '/') {
    const authCookie = request.cookies.get('lingoland_auth')?.value
    // If not authenticated as user or guest, redirect directly to the sign-in section
    if (!authCookie || authCookie !== '1') {
      const url = request.nextUrl.clone()
      url.pathname = '/auth'
      url.hash = 'login-card-section'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}

