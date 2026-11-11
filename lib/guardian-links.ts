// Production-aligned guardian link helpers.
// The production schema is guardian_links (teen_user_id / guardian_user_id),
// not the legacy guardian_connections shape the web was written against.

export type GuardianLink = {
  id: string
  teen_user_id: string
  guardian_user_id: string
  status: string
  initiated_by: string
  teen_consent_at: string | null
  guardian_consent_at: string | null
  created_at: string
  updated_at: string
  teen?: {
    display_name: string | null
    username: string | null
    city: string | null
    region: string | null
    verification_status: string | null
    account_status: string | null
  }
}

export function isActiveLink(link: { status?: string | null }): boolean {
  return link?.status === 'active'
}

export function isFullyConsented(link: {
  status?: string | null
  teen_consent_at?: string | null
  guardian_consent_at?: string | null
}): boolean {
  return (
    link?.status === 'active' &&
    !!link?.teen_consent_at &&
    !!link?.guardian_consent_at
  )
}
