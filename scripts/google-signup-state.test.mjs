import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  createGoogleSignupState,
  getGoogleSignupDateOfBirth,
} from '../lib/google-signup-state.mjs'

const authActions = readFileSync(new URL('../app/(auth)/actions.ts', import.meta.url), 'utf8')
const authCallback = readFileSync(new URL('../app/auth/callback/route.ts', import.meta.url), 'utf8')

test('Google signup state binds the DOB to a short-lived callback nonce', () => {
  const state = createGoogleSignupState('2005-05-04')
  assert.match(state.nonce, /^[0-9a-f-]{36}$/i)
  assert.equal(getGoogleSignupDateOfBirth(state.cookieValue, state.nonce), '2005-05-04')
})

test('Google signup state rejects missing, mismatched, and malformed values', () => {
  const state = createGoogleSignupState('2005-05-04')
  assert.equal(getGoogleSignupDateOfBirth(undefined, state.nonce), null)
  assert.equal(getGoogleSignupDateOfBirth(state.cookieValue, 'different-nonce'), null)
  assert.equal(getGoogleSignupDateOfBirth(`${state.nonce}.not-a-date`, state.nonce), null)
  assert.equal(getGoogleSignupDateOfBirth(`${state.nonce}.2005-05-04.extra`, state.nonce), null)
})

test('Google signup keeps the DOB out of callback URLs and uses a short-lived HttpOnly cookie', () => {
  assert.doesNotMatch(authActions, /searchParams\.set\(['"]signup_dob['"]/)
  assert.doesNotMatch(authCallback, /searchParams\.get\(['"]signup_dob['"]/)
  assert.match(authActions, /httpOnly:\s*true/)
  assert.match(authActions, /maxAge:\s*300/)
  assert.match(authCallback, /getGoogleSignupDateOfBirth/)
})
