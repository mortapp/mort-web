import { createHash } from 'node:crypto'
import { parseHibpRangeResponse } from './leaked-password-response.mjs'

/**
 * Leaked-password protection via HaveIBeenPwned's k-anonymity range API.
 *
 * Supabase's built-in HIBP check requires a Pro plan, so MORT enforces the
 * same protection in the app layer before a password ever reaches Supabase
 * Auth: only the first five characters of the SHA-1 hash are sent to the
 * Pwned Passwords API, never the password itself.
 *
 * Availability policy: fail open on network/API errors (a temporary
 * third-party outage must not lock users out), but never allow a password
 * that is confirmed to appear in a known breach corpus.
 */
export async function isLeakedPassword(password: string): Promise<boolean> {
  const sha1 = createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase()
  const prefix = sha1.slice(0, 5)
  const suffix = sha1.slice(5)
  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return false
    const body = await res.text()
    return parseHibpRangeResponse(body, suffix) === true
  } catch {
    return false
  }
}

export const LEAKED_PASSWORD_MESSAGE =
  'This password appears in a public data breach. Choose a stronger, unique password.'
