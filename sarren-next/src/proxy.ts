import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, type SessionData } from '@/lib/session'

// /api/admin/login and /api/admin/logout are matched by the config but must pass through unauthenticated
const PUBLIC_ADMIN_PATHS = new Set(['/api/admin/login', '/api/admin/logout'])

// Next.js 16: this function MUST be named `proxy` — the framework resolves it by name.
// Do not rename or replace with a default export.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, sessionOptions)

  if (!session.isLoggedIn) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path+', '/api/admin/:path*'],
}
