import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site-url.mjs'
import { deletionPath } from '@/lib/account-deletion.mjs'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  let outcome = 'link_invalid'
  if (code && code.length <= 256) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.session && data.user?.email_confirmed_at) outcome = 'verified'
  }
  // Do not forward callback input, codes, account IDs, or user-controlled targets.
  return NextResponse.redirect(new URL(`${deletionPath}?result=${outcome}`, getSiteUrl()), {
    status: 303, headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  })
}
