'use server'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'

export async function reviewBusinessVerification(_formData: FormData): Promise<never> {
  await requireRole(['admin'])
  redirect('/app/admin?message=' + encodeURIComponent('Identity verification review is unavailable until the approved production provider and review workflow are configured.'))
}

export async function updateReportStatus(_formData: FormData): Promise<never> {
  await requireRole(['admin'])
  redirect('/app/admin?message=' + encodeURIComponent('Safety report status changes are disabled because production does not expose an authorized report-review RPC.'))
}

export async function updateUserStatus(_formData: FormData): Promise<never> {
  await requireRole(['admin'])
  redirect('/app/admin?message=' + encodeURIComponent('Account-status administration is unavailable from this website until the production staff workflow is verified.'))
}