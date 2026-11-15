import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync(new URL('../app/app/support/[id]/page.tsx', import.meta.url), 'utf8')

test('support thread distinguishes message-query failure from an empty conversation', () => {
  assert.match(page, /data:\s*msgs,\s*error:\s*messagesError/)
  assert.match(page, /messagesError\s*\?\s*\(/)
  assert.match(page, /Replies could not be loaded/)
  assert.match(page, /!msgs\?\.length\s*\?\s*<p[^>]*>No replies yet\.<\/p>/)
})
