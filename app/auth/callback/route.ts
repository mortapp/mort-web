import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/site-url'
import { ensureProfile } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = safeNext(requestUrl.searchParams.get('next'), '/app')
  const role = requestUrl.searchParams.get('role')
  const displayName = requestUrl.searchParams.get('display_name')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await ensureProfile(supabase, user, role, displayName)
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .maybeSingle()
        if (!profile?.onboarding_completed && !next.startsWith('/app/onboarding')) {
          const onboardingUrl = new URL('/app/onboarding', requestUrl.origin)
          onboardingUrl.searchParams.set('next', next)
          return NextResponse.redirect(onboardingUrl)
        }
      }
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }
  return NextResponse.redirect(new URL('/auth/auth-code-error', requestUrl.origin))
}
