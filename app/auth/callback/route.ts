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

function signupErrorRedirect(request: NextRequest, next: string, message: string) {
  const url = new URL('/signup', request.url)
  url.searchParams.set('next', next)
  url.searchParams.set('message', message)
  return callbackRedirect(request, `${url.pathname}${url.search}`)
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
            return signupErrorRedirect(request, next, message)
          }
          const { data: savedDob, error: dobError } = await supabase.rpc('save_my_initial_dob_v1', {
            p_date_of_birth: signupDob,
          })
          if (dobError || savedDob?.ok !== true) {
            await supabase.auth.signOut()
            const message = savedDob?.code === 'minimum_age_required'
              ? 'MORT is only available to people age 13 or older.'
              : 'We could not save your date of birth. Please restart signup or contact MORT support.'
            return signupErrorRedirect(request, next, message)
          }
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role,onboarding_completed_at,account_status,date_of_birth')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) {
          return callbackRedirect(request, '/auth/auth-code-error')
        }
        if (profile?.role === 'admin') {
          return NextResponse.redirect(new URL(next.startsWith('/app/admin') ? next : '/app/admin', requestUrl.origin))
        }
        if (!profile?.date_of_birth) {
          if (isSignup) {
            await supabase.auth.signOut()
            return signupErrorRedirect(request, next, 'Date of birth is required to join MORT.')
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
  // The code was rejected (link already used, or opened in a different browser
  // than the one that started signup). If the visitor already has a valid
  // session, continue to the app instead of dead-ending.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) return callbackRedirect(request, next)
  const loginUrl = new URL('/login', requestUrl.origin)
  loginUrl.searchParams.set('message', 'That verification link was already used or has expired. Try signing in — if your email is not verified yet, we will send you a fresh link.')
  loginUrl.searchParams.set('next', next)
  return callbackRedirect(request, `${loginUrl.pathname}${loginUrl.search}`)
}
