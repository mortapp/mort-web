'use server'
import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireRole, requireUser } from '@/lib/auth'

function v(fd: FormData, k: string) { const raw = fd.get(k); return raw == null ? null : String(raw).trim() }
function rpcText(data: any, fallback = 'The backend rejected this request.') { return data?.message || data?.code || fallback }

export async function createGuardianInvite(formData?: FormData) {
  const { supabase } = await requireRole(['teen'])
  const inviteEmail = formData ? v(formData, 'invite_email') : null
  const { data, error } = await supabase.rpc('create_guardian_invite_v2', { p_invite_email: inviteEmail || null })
  if (error || data?.ok !== true) redirect(`/app/verify?message=${encodeURIComponent(rpcText(data, error?.message || 'Guardian invite could not be created.'))}`)
  revalidatePath('/app/verify')
  redirect(`/app/verify?message=${encodeURIComponent(`Guardian invite code: ${data.invite_code}`)}`)
}

export async function acceptGuardianInvite(formData: FormData) {
  const { supabase } = await requireRole(['guardian'])
  const invite_code = String(formData.get('invite_code') || '').trim().toUpperCase()
  if (!invite_code) redirect('/app/verify?message=' + encodeURIComponent('Enter the guardian invite code.'))
  const { data, error } = await supabase.rpc('accept_guardian_invite', { p_invite_code: invite_code })
  if (error) redirect(`/app/verify?message=${encodeURIComponent(error.message)}`)
  revalidatePath('/app/guardian')
  redirect('/app/guardian?message=Guardian connection accepted')
}

export async function saveTeenVerification(_formData: FormData): Promise<never> {
  await requireUser()
  redirect('/app/verify?message=' + encodeURIComponent('Teen identity verification submissions are disabled until the approved production verification provider is configured. MORT does not collect identity documents in this flow.'))
}

export async function submitBusinessVerification(_formData: FormData): Promise<never> {
  await requireUser()
  redirect('/app/verify?message=' + encodeURIComponent('Adult identity verification submissions are disabled until the approved production verification provider is configured. MORT does not collect identity documents in this flow.'))
}