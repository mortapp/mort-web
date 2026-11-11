'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'

function v(fd: FormData, k: string) { const raw = fd.get(k); return raw == null ? null : String(raw).trim() }
function rpcText(data: any, fallback = 'The backend rejected this request.') { return data?.message || data?.code || fallback }

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/heic': 'heic',
  'application/pdf': 'pdf',
}
const MAX_BYTES = 10 * 1024 * 1024

export async function createGuardianInvite(formData?: FormData) {
  const { supabase, user } = await requireUser()
  const inviteEmail = formData ? v(formData, 'invite_email') : null
  const { data, error } = await supabase.rpc('create_guardian_invite_v2', { p_invite_email: inviteEmail || null })
  if (error) redirect(`/app/verify?message=${encodeURIComponent(error.message)}`)
  if (!data?.ok) redirect(`/app/verify?message=${encodeURIComponent(rpcText(data, 'Guardian invite could not be created.'))}`)
  revalidatePath('/app/verify')
  redirect(`/app/verify?message=${encodeURIComponent(`Guardian invite code: ${data.invite_code}`)}`)
}

export async function acceptGuardianInvite(formData: FormData) {
  const { supabase } = await requireUser()
  const invite_code = String(formData.get('invite_code') || '').trim().toUpperCase()
  if (!invite_code) redirect('/app/verify?message=' + encodeURIComponent('Enter the guardian invite code.'))
  const { error } = await supabase.rpc('accept_guardian_invite', { p_invite_code: invite_code })
  if (error) redirect(`/app/verify?message=${encodeURIComponent(error.message)}`)
  revalidatePath('/app/guardian')
  redirect('/app/guardian?message=Guardian connection accepted')
}

export async function uploadVerificationEvidence(formData: FormData) {
  const { supabase, user } = await requireUser()
  const file = formData.get('evidence')
  const evidenceType = String(formData.get('verification_type') || '')

  if (!(file instanceof File) || file.size === 0) {
    redirect('/app/verify?message=' + encodeURIComponent('Choose a file to upload.'))
  }
  if (!(evidenceType in { school_id: 1, identity: 1 })) {
    redirect('/app/verify?message=' + encodeURIComponent('Invalid evidence type.'))
  }
  const ext = ALLOWED_TYPES[file.type]
  if (!ext) {
    redirect('/app/verify?message=' + encodeURIComponent('Upload a JPG, PNG, HEIC image or a PDF.'))
  }
  if (file.size > MAX_BYTES) {
    redirect('/app/verify?message=' + encodeURIComponent('Files must be 10 MB or smaller.'))
  }

  const path = `${user.id}/${crypto.randomUUID()}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('verification-evidence')
    .upload(path, file, { contentType: file.type })
  if (uploadError) {
    redirect(`/app/verify?message=${encodeURIComponent(uploadError.message)}`)
  }

  const { data, error } = await supabase.rpc('submit_my_verification_evidence_v1', {
    p_verification_type: evidenceType,
    p_evidence_path: path,
  })
  if (error) {
    redirect(`/app/verify?message=${encodeURIComponent(error.message)}`)
  }
  if (!data?.ok) {
    redirect(`/app/verify?message=${encodeURIComponent(rpcText(data))}`)
  }
  revalidatePath('/app/verify')
  redirect('/app/verify?message=' + encodeURIComponent('Evidence submitted. MORT staff will review it and update your status.'))
}
