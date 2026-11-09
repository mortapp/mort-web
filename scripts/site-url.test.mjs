import assert from 'node:assert/strict'
import test from 'node:test'
import { safeNext } from '../lib/site-url.mjs'

test('safeNext preserves same-origin relative destinations', () => {
  assert.equal(safeNext('/app/teen/jobs?category=yard#results'), '/app/teen/jobs?category=yard#results')
})

test('safeNext rejects external and malformed redirect forms', () => {
  for (const value of [
    'https://example.com',
    '//example.com',
    '/\\example.com',
    '/   ',
    '/app\nLocation: https://example.com',
  ]) {
    assert.equal(safeNext(value), '/app', `expected fallback for ${JSON.stringify(value)}`)
  }
})
