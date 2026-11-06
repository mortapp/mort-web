import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const login = readFileSync(new URL('../app/(auth)/login/page.tsx', import.meta.url), 'utf8')
const signup = readFileSync(new URL('../app/(auth)/signup/page.tsx', import.meta.url), 'utf8')

test('login copy does not promise unavailable marketplace features', () => {
  assert.match(login, /Marketplace access is not open yet/)
  assert.match(login, /Job discovery and applications are unavailable/)
  assert.match(login, /Verification submissions are unavailable/)
  assert.doesNotMatch(login, /Browse local jobs near you|Track applications and earnings|active jobs/)
})

test('signup copy accurately describes pre-launch account setup', () => {
  assert.match(signup, /upcoming local-work marketplace/)
  assert.match(signup, /Job discovery, job posting, and identity-verification submissions are currently unavailable/)
  assert.match(signup, /Marketplace access is not open yet/)
  assert.match(signup, /Verification submissions are unavailable/)
  assert.doesNotMatch(signup, /Teens: find dog walking|Adults: post jobs and hire verified teens|Guardians: stay connected with safety controls/)
})
