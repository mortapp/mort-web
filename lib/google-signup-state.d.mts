export const GOOGLE_SIGNUP_COOKIE: string
export const GOOGLE_SIGNUP_COOKIE_PATH: string

export function createGoogleSignupState(dateOfBirth: string): {
  nonce: string
  cookieValue: string
}

export function getGoogleSignupDateOfBirth(
  cookieValue: string | undefined,
  expectedNonce: string | null,
): string | null
