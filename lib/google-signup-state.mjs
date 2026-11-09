export const GOOGLE_SIGNUP_COOKIE = 'mort-google-signup'
export const GOOGLE_SIGNUP_COOKIE_PATH = '/auth/callback'

export function createGoogleSignupState(dateOfBirth) {
  const nonce = crypto.randomUUID()
  return { nonce, cookieValue: `${nonce}.${dateOfBirth}` }
}

export function getGoogleSignupDateOfBirth(cookieValue, expectedNonce) {
  if (!cookieValue || !expectedNonce) return null

  const [nonce, dateOfBirth, ...extra] = cookieValue.split('.')
  if (
    extra.length > 0 ||
    nonce !== expectedNonce ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth || '')
  ) {
    return null
  }

  return dateOfBirth
}
