'use server'
import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAuthenticatedUser, requireUser } from '@/lib/auth'

function val(fd: FormData, key: string) {
  const value = fd.get(key)
  return value == null ? null : String(value).trim()
}

function fail(path: string, code: string) {
  const messages: Record<string, string> = {
    dob_invalid: 'Enter a valid date of birth.',
    minimum_age_required: 'MORT is available only to people ages 13 and older.',
    adult_role_required: 'Choose an adult account type.',
    display_name_invalid: 'Enter a display name between 2 and 80 characters.',
    username_invalid: 'Use 3–24 lowercase letters, numbers, or underscores.',
    username_taken: 'That username is already in use. Choose another.',
    approximate_area_required: 'Enter a ZIP code or city for general-area matching.',
    general_location_required: 'Enter a city and two-letter state.',
    availability_required: 'Add a short availability description.',
    onboarding_work_preferences_invalid: 'Review your work preferences and try again.',
    onboarding_work_preferences_required: 'Choose at least one work category and one way to travel.',
    guardian_invite_required_or_skip: 'Choose Skip for now or complete the Guardian invite first.',
    onboarding_revision_conflict: 'Your setup changed in another session. Reload and try again.',
    published_legal_acceptance_required: 'Review and accept every required current MORT document.',
    electronic_signature_text_required: 'Type your name to sign the required document.',
    affirmative_checkbox_required: 'Confirm each required document before finishing.',
  }
  redirect(`${path}?message=${encodeURIComponent(messages[code] || 'MORT could not save this step. Please review it and try again.')}`)
}

async function callProgressRpc(supabase: any, name: string, params: Record<string, unknown>, path: string) {
  const { data, error } = await supabase.rpc(name, params)
  if (error) fail(path, error.code || error.message || 'save_failed')
  if (!data || data.ok !== true) fail(path, String(data?.code || 'save_failed'))
  revalidatePath('/app', 'layout')
  return data
}

function requestParams(expectedRevision: string | null) {
  return {
    p_client_request_id: randomUUID(),
    p_payload_version: 1,
    p_expected_revision: expectedRevision || null,
  }
}

export async function saveOnboardingAccount(formData: FormData) {
  const { supabase, profile } = await requireAuthenticatedUser()
  if (profile?.role === 'admin') redirect('/app/admin')
  if (profile?.onboarding_completed_at) redirect('/app/onboarding?message=Your setup is already complete.')

  const username = (val(formData, 'username') || '').toLowerCase()
  if (!/^[a-z0-9_]{3,24}$/.test(username)) fail('/app/onboarding', 'username_invalid')

  const dob = val(formData, 'dob') || ''
  const payload = {
    // The database derives teen vs. adult from DOB and validates eligibility.
    // The selected role is used only to distinguish adult from Guardian.
    role: val(formData, 'role') === 'guardian' ? 'guardian' : 'adult',
    display_name: val(formData, 'display_name') || '',
    username,
    dob,
    city: val(formData, 'city') || '',
    state: (val(formData, 'state') || '').toUpperCase(),
    location_setup_mode: 'city_state',
    approximate_area: val(formData, 'approximate_area') || '',
    adult_account_type: 'individual',
    business_name: null,
  }

  await callProgressRpc(supabase, 'save_my_onboarding_account_v2', {
    p_payload: payload,
    p_client_request_id: randomUUID(),
    p_payload_version: 1,
  }, '/app/onboarding')
  redirect('/app/onboarding?message=Account details saved.')
}

export async function saveOnboardingWork(formData: FormData) {
  const { supabase, profile } = await requireUser()
  if (profile?.onboarding_completed_at) redirect('/app/onboarding?message=Your setup is already complete.')

  const role = profile?.role
  const categories = formData.getAll('preferred_job_categories').map(String).filter(Boolean)
  const transportation = formData.getAll('transportation_methods').map(String).filter(Boolean)
  const payload = role === 'teen'
    ? {
        availability: val(formData, 'availability') || '',
        preferred_job_categories: categories,
        transportation_methods: transportation,
        max_travel_distance_miles: null,
        max_travel_minutes: null,
        walking_distance_only: false,
        guardian_transportation_possible: false,
      }
    : {}

  await callProgressRpc(supabase, 'save_my_onboarding_work_v2', {
    p_payload: payload,
    ...requestParams(val(formData, 'revision')),
  }, '/app/onboarding')
  redirect('/app/onboarding?message=Work preferences saved.')
}

export async function saveOnboardingSafety(formData: FormData) {
  const { supabase, profile } = await requireUser()
  if (profile?.onboarding_completed_at) redirect('/app/onboarding?message=Your setup is already complete.')

  const notification = val(formData, 'notification_intent') || 'ask_later'
  const payload = {
    notification_intent: ['ask_later', 'preferred', 'not_preferred'].includes(notification) ? notification : 'ask_later',
    // Guardian Mode is optional. This choice records an explicit skip; it
    // never creates a guardian link or grants another person account access.
    guardian_choice: profile?.role === 'teen' ? 'skip' : 'not_applicable',
  }

  await callProgressRpc(supabase, 'save_my_onboarding_safety_v2', {
    p_payload: payload,
    ...requestParams(val(formData, 'revision')),
  }, '/app/onboarding')
  redirect('/app/onboarding?message=Safety preferences saved.')
}

export async function completeOnboarding(formData: FormData) {
  const { supabase, profile } = await requireUser()
  if (profile?.role === 'admin') redirect('/app/admin')
  if (profile?.onboarding_completed_at) redirect('/app/onboarding?message=Your setup is already complete.')

  const { data: legal, error: legalError } = await supabase.rpc('get_my_legal_requirements')
  if (legalError || legal?.ok !== true) {
    fail('/app/onboarding', 'published_legal_acceptance_required')
  }

  const requirements = Array.isArray(legal.requirements) ? legal.requirements : []
  const required = requirements.filter((item: any) => item.required === true)
  if (required.length === 0) fail('/app/onboarding', 'published_legal_acceptance_required')

  const outstanding = required.filter((item: any) => !item.acceptance_id)
  const expectedIds = outstanding.map((item: any) => String(item.version_id)).sort()
  const submittedIds = formData.getAll('accepted_version_ids').map(String).sort()
  if (expectedIds.length !== submittedIds.length || expectedIds.some((id: string, i: number) => id !== submittedIds[i])) {
    fail('/app/onboarding', 'affirmative_checkbox_required')
  }

  if (expectedIds.length > 0) {
    const { data: versions, error: versionsError } = await supabase
      .from('legal_document_versions')
      .select('id,content_markdown')
      .in('id', expectedIds)
      .eq('publication_status', 'published')
    if (versionsError || !Array.isArray(versions) || versions.length !== expectedIds.length ||
        versions.some((version: any) => !String(version.content_markdown || '').trim())) {
      fail('/app/onboarding', 'published_legal_acceptance_required')
    }
  }

  const signature = val(formData, 'electronic_signature') || ''
  const teenSummaryViewed = val(formData, 'teen_summary_viewed') === 'true'
  if (profile?.role === 'teen' && outstanding.length > 0 && !teenSummaryViewed) {
    fail('/app/onboarding', 'affirmative_checkbox_required')
  }
  if (outstanding.some((item: any) => item.requires_electronic_signature === true) && signature.trim().length < 3) {
    fail('/app/onboarding', 'electronic_signature_text_required')
  }

  // Persist each affirmative acknowledgement through the dedicated legal RPC.
  // The completion RPC only marks onboarding complete after these records exist.
  for (const item of outstanding) {
    const { data: acceptance, error: acceptanceError } = await supabase.rpc('submit_legal_acceptance', {
      p_document_version_id: item.version_id,
      p_affirmative_checkbox: true,
      p_teen_summary_viewed: profile?.role === 'teen' ? teenSummaryViewed : false,
      p_electronic_signature_text: item.requires_electronic_signature === true ? signature : null,
      p_platform: 'web',
      p_app_version: '1.0.0',
      p_language_code: item.language_code || 'en-US',
    })
    if (acceptanceError || acceptance?.ok !== true) {
      fail('/app/onboarding', String(acceptance?.code || acceptanceError?.message || 'published_legal_acceptance_required'))
    }
  }

  await callProgressRpc(supabase, 'complete_my_onboarding_v2', {
    p_payload: {
      legal_version_ids: required.map((item: any) => String(item.version_id)),
      teen_summary_viewed: teenSummaryViewed,
      signature,
      platform: 'web',
      app_version: '1.0.0',
    },
    ...requestParams(val(formData, 'revision')),
  }, '/app/onboarding')

  // Completion is not activation. Keep the user on the status screen until
  // normal account review and release gates independently permit access.
  redirect('/app/onboarding?message=Setup complete. Your account is pending review; marketplace access is not yet enabled.')
}

export async function saveProfile(_formData: FormData): Promise<never> {
  await requireUser()
  // The active production project does not expose update_my_profile. Do not
  // fall back to direct profile writes or call a legacy RPC.
  redirect('/app/profile?message=' + encodeURIComponent('Profile editing is temporarily unavailable because the production profile-update RPC is not deployed. No profile data was changed.'))
}

// Compatibility endpoint for the archived pre-v2 onboarding prototype. It
// performs no writes and sends all users to the current server-authoritative
// four-step onboarding flow.
export async function saveOnboarding(_formData: FormData): Promise<never> {
  redirect('/app/onboarding?message=' + encodeURIComponent('The previous onboarding form has been replaced. Continue through the current four-step flow.'))
}

export async function savePaymentPreference() {
  await requireUser()
  redirect('/app/payments?message=' + encodeURIComponent('Payment preference saving is disabled. MORT does not process, move, hold, or guarantee local-job payments.'))
}

export async function createReport(formData: FormData) {
  const { supabase, profile } = await requireUser()
  const category = val(formData, 'reason') || 'other'
  const details = val(formData, 'details') || ''
  const { data, error } = await supabase.rpc('submit_safety_report_v2', {
    p_target_user_id: val(formData, 'target_user_id') || null,
    p_target_job_id: val(formData, 'target_job_id') || null,
    p_target_message_id: val(formData, 'target_message_id') || null,
    p_target_review_id: null,
    p_application_id: null,
    p_category: category,
    p_severity: 'normal',
    p_immediate_danger: false,
    p_details: details,
    p_occurred_at: null,
    p_location_type: null,
    p_desired_outcome: null,
    p_confidential_safety_feedback: false,
    p_client_request_id: randomUUID(),
  })
  if (error || data?.ok !== true) {
    const code = String(data?.code || error?.message || 'report_submit_failed')
    redirect(`/app/reports/new?message=${encodeURIComponent(code)}`)
  }
  const destination = profile?.role === 'teen' ? '/app/safety' : profile?.role === 'guardian' ? '/app/guardian' : profile?.role === 'admin' ? '/app/admin' : '/app/adult'
  redirect(`${destination}?message=Report submitted`)
}
