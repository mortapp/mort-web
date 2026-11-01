'use server'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'

export async function approveApplication(_formData: FormData): Promise<never> {
  await requireRole(['guardian'])
  redirect('/app/guardian?message=' + encodeURIComponent('Guardian application approval is not implemented by the production backend. The teen and job poster use the application workflow; Guardian Mode remains optional.'))
}

export async function rejectApplication(_formData: FormData): Promise<never> {
  await requireRole(['guardian'])
  redirect('/app/guardian?message=' + encodeURIComponent('Guardian application rejection is not implemented by the production backend. Guardian Mode remains optional.'))
}

export async function setTeenPaused(_formData: FormData): Promise<never> {
  await requireRole(['guardian'])
  redirect('/app/guardian?message=' + encodeURIComponent('Guardian pause controls are not implemented in the production schema. No account status was changed.'))
}