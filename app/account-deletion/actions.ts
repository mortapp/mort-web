'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site-url.mjs'
import { confirmedDeletion, deletionPath, parseReceipt, receiptCookie, receiptMaxAge } from '@/lib/account-deletion.mjs'

function finish(code: string): never {
  redirect(`${deletionPath}?result=${code}`)
}

function validEmail(form: FormData) {
  const value = form.get('email')
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  return email.length <= 254 && /^[^\s@]+@[^\s@]+$/.test(email) ? email : null
}

async function saveReceipt(value: string, secure = process.env.NODE_ENV === 'production') {
  const store = await cookies()
  store.set(receiptCookie, value, {
    path: deletionPath, sameSite: 'lax', httpOnly: true, secure, maxAge: receiptMaxAge,
  })
}

export async function verifyDeletionPassword(form: FormData) {
  const email = validEmail(form)
  const password = form.get('password')
  if (!email || typeof password !== 'string' || !password || password.length > 1024) finish('verify_failed')
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.session || !data.user?.email_confirmed_at) finish('verify_failed')
  finish('verified')
}

export async function sendDeletionVerification(form: FormData) {
  const email = validEmail(form)
  if (!email) finish('invalid_email')
  const supabase = await createClient()
  // Fixed callback origin and no signup. Never disclose whether an account exists.
  await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${getSiteUrl()}${deletionPath}/confirm` },
  })
  finish('check_email')
}

export async function verifyDeletionAuthenticator(form: FormData) {
  const factorId = form.get('factorId')
  const code = form.get('code')
  if (typeof factorId !== 'string' || !/^[a-f0-9-]{36}$/i.test(factorId) ||
      typeof code !== 'string' || !/^[0-9]{6}$/.test(code.trim())) finish('mfa_failed')
  const supabase = await createClient()
  const factors = await supabase.auth.mfa.listFactors()
  if (factors.error || !factors.data.totp.some((factor) => factor.id === factorId && factor.status === 'verified')) {
    finish('mfa_failed')
  }
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() })
  if (error) finish('mfa_failed')
  finish('verified')
}

export async function submitDeletionRequest(form: FormData) {
  if (!confirmedDeletion(form.get('confirmation'))) finish('confirmation_required')
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('request_account_deletion', { p_source: 'web' })
  if (data?.code === 'recent_reauthentication_required') finish('reauth_required')
  if (data?.code === 'account_deletion_rate_limited') finish('rate_limited')
  if (error || data?.ok !== true || typeof data.request?.id !== 'string') finish('unavailable')
  const { data: receipt } = await supabase.rpc('issue_my_account_deletion_receipt', { p_request_id: data.request.id })
  const code = parseReceipt(receipt)
  if (!code) finish('saved_no_receipt')
  await saveReceipt(code)
  finish('saved')
}

export async function renewDeletionReceipt(form: FormData) {
  const requestId = form.get('requestId')
  if (typeof requestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(requestId)) finish('unavailable')
  const supabase = await createClient()
  const { data } = await supabase.rpc('issue_my_account_deletion_receipt', { p_request_id: requestId })
  const code = parseReceipt(data)
  if (!code) finish('receipt_unavailable')
  await saveReceipt(code)
  finish('receipt_issued')
}

export async function cancelDeletionRequest() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('cancel_account_deletion_request')
  if (data?.code === 'recent_reauthentication_required') finish('reauth_required')
  if (error || data?.ok !== true || data.request?.status !== 'cancelled') finish('cancel_unavailable')
  finish('cancelled')
}

export async function findDeletionReceipt(form: FormData) {
  const code = parseReceipt(form.get('receipt'))
  if (!code) finish('receipt_not_found')
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_account_deletion_receipt_status', { p_receipt: code })
  if (error) finish('unavailable')
  if (!data?.status) finish('receipt_not_found')
  await saveReceipt(code)
  finish('receipt_found')
}

export async function forgetDeletionReceipt() {
  const store = await cookies()
  store.set(receiptCookie, '', { path: deletionPath, httpOnly: true, sameSite: 'lax', maxAge: 0,
    secure: process.env.NODE_ENV === 'production' })
  redirect(deletionPath)
}
