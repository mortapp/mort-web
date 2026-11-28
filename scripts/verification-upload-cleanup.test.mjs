import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const action = readFileSync(new URL('../app/app/verify/actions.ts', import.meta.url), 'utf8')
const page = readFileSync(new URL('../app/app/verify/page.tsx', import.meta.url), 'utf8')
const uploader = readFileSync(new URL('../components/verification-uploader.tsx', import.meta.url), 'utf8')
const phoneQr = readFileSync(new URL('../components/phone-verification-qr.tsx', import.meta.url), 'utf8')
const onboarding = readFileSync(new URL('../app/app/onboarding/page.tsx', import.meta.url), 'utf8')
const appShell = readFileSync(new URL('../components/app-shell.tsx', import.meta.url), 'utf8')
const migration = readFileSync(new URL('../supabase/migrations/20261115_allow_unregistered_verification_evidence_cleanup.sql', import.meta.url), 'utf8')

test('verification upload cleanup runs only after registration failure and uses storage removal', () => {
  assert.match(action, /if \(error \|\| !data\?\.ok\)/)
  assert.match(action, /\.from\('verification-evidence'\)[\s\S]*?\.remove\(\[path\]\)/)
  assert.match(action, /contact support for secure cleanup/)
})

test('evidence delete policy requires caller-owned UUID path with no registered case', () => {
  assert.match(migration, /auth\.uid\(\)/)
  assert.match(migration, /verification_cases vc[\s\S]*?vc\.user_id = v_user and vc\.evidence_path = p_name/)
  assert.match(migration, /for delete to authenticated[\s\S]*?can_delete_my_unregistered_verification_evidence_v1\(name\)/)
})

test('verification page shows RPC failures and fails closed when cases are pending or unavailable', () => {
  assert.match(page, /error: verificationError/)
  assert.match(page, /error: casesError/)
  assert.match(page, /verification status could not be loaded/i)
  assert.match(page, /const canSubmitEvidence =/)
  assert.match(page, /canSubmitEvidence=\{canSubmitEvidence\}/)
  assert.match(uploader, /canSubmitEvidence \? \(/)
  assert.match(page, /verificationError \|\| casesError/)
  assert.match(page, /sp\?\.error \? 'error' : 'default'/)
})

test('adults can reach the private uploader from onboarding and account navigation', () => {
  assert.match(onboarding, /href="\/app\/verify"[\s\S]*?Upload your ID/)
  assert.match(appShell, /href: '\/app\/verify', icon: 'shield', label: 'Identity verification'/)
})

test('adult camera is click-to-start, stops tracks, and keeps file import as its fallback', () => {
  assert.match(uploader, /navigator\.mediaDevices\?\.getUserMedia/)
  assert.match(uploader, /window\.isSecureContext/)
  assert.match(uploader, /onClick=\{\(\) => void openCamera\('front'\)\}/)
  assert.match(uploader, /getTracks\(\)\.forEach\(\(track\) => track\.stop\(\)\)/)
  assert.match(uploader, /type="file"[\s\S]*?accept=\{accept\}[\s\S]*?required/)
  assert.match(uploader, /Camera permission was not granted\.[\s\S]*?choose a file below/)
  assert.match(uploader, /camera stays off until you choose Use computer camera/i)
})

test('front/back images are combined locally and the phone QR contains only the verification route', () => {
  assert.match(uploader, /async function combineImages\(files: File\[\]\)/)
  assert.match(uploader, /canvas\.toBlob[\s\S]*?'image\/jpeg'/)
  assert.match(phoneQr, /new URL\('\/app\/verify', window\.location\.origin\)/)
  assert.match(phoneQr, /navigation QR, not an encrypted file handoff/)
  assert.match(phoneQr, /no ID or sign-in information/)
  assert.match(phoneQr, /Sign in to the same MORT account/)
  assert.doesNotMatch(phoneQr, /access_token|transfer_session|evidence_path/i)
})

test('server action accepts bucket-supported WebP and refuses uncombined multi-file posts', () => {
  assert.match(action, /'image\/webp': 'webp'/)
  assert.match(action, /formData\.getAll\('evidence'\)/)
  assert.match(action, /evidenceFiles\.length > 1/)
  assert.match(action, /MAX_BYTES = 10 \* 1024 \* 1024/)
})
