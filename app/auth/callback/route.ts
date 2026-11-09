import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/site-url.mjs'
import { ensureProfile } from '@/lib/auth'
import {
  getGoogleSignupDateOfBirth,
  GOOGLE_SIGNUP_COOKIE,
  GOOGLE_SIGNUP_COOKIE_PATH,
} from '@/lib/google-signup-state.mjs'

function callbackRedirect(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url))
  response.cookies.set(GOOGLE_SIGNUP_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: GOOGLE_SIGNUP_COOKIE_PATH,
    maxAge: 0,
  })
  return response
}

function ageFromDateOfBirth(value: string | null): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  const today = new Date()
  let age = today.getUTCFullYear() - year
  if (today.getUTCMonth() + 1 < month || (today.getUTCMonth() + 1 === month && today.getUTCDate() < day)) age -= 1
  return age
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = safeNext(requestUrl.searchParams.get('next'), '/app')
  const isSignup = requestUrl.searchParams.get('source') === 'signup'
  const signupDob = getGoogleSignupDateOfBirth(
    request.cookies.get(GOOGLE_SIGNUP_COOKIE)?.value,
    requestUrl.searchParams.get('signup_nonce'),
  )

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await ensureProfile(supabase, user)

        if (isSignup) {
          const age = ageFromDateOfBirth(signupDob)
          if (age === null || age < 13) {
            await supabase.auth.signOut()
            const message = age !== null && age < 13
              ? 'MORT is only available to people age 13 or older.'
              : 'The date of birth step was missing. Please restart signup.'
            return callbackRedirect(request, `/signup?message=${encodeURIComponent(message)}`)
          }
          const { data: savedDob, error: dobError } = await supabase.rpc('save_my_initial_dob_v1', {
            p_date_of_birth: signupDob,
          })
          if (dobError || savedDob?.ok !== true) {
            await supabase.auth.signOut()
            const message = savedDob?.code === 'minimum_age_required'
              ? 'MORT is only available to people age 13 or older.'
              : 'We could not save your date of birth. Please restart signup or contact MORT support.'
            return callbackRedirect(request, `/signup?message=${encodeURIComponent(message)}`)
          }
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed_at,account_status,date_of_birth')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) {
          return callbackRedirect(request, '/auth/auth-code-error')
        }
        if (!profile?.date_of_birth) {
          if (isSignup) {
            await supabase.auth.signOut()
            return callbackRedirect(request, '/signup?message=Date%20of%20birth%20is%20required%20to%20join%20MORT.')
          }
          const onboardingUrl = new URL('/app/onboarding', requestUrl.origin)
          onboardingUrl.searchParams.set('next', next)
          onboardingUrl.searchParams.set('message', 'Enter your date of birth to confirm you meet MORT\'s minimum age of 13.')
          return callbackRedirect(request, `${onboardingUrl.pathname}${onboardingUrl.search}`)
        }
        if (!profile?.onboarding_completed_at || profile.account_status !== 'active') {
          const onboardingUrl = new URL('/app/onboarding', requestUrl.origin)
          onboardingUrl.searchParams.set('next', next)
          return callbackRedirect(request, `${onboardingUrl.pathname}${onboardingUrl.search}`)
        }
      }
      return callbackRedirect(request, next)
    }
  }
  return callbackRedirect(request, '/auth/auth-code-error')
}
