import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const appPath = pathname === '/app' || pathname.startsWith('/app/')
    ? `${pathname}${search}`
    : undefined
  return updateSession(request, appPath)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
