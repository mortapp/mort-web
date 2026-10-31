import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions } from '@/components/ui'
import { OnboardingForm } from '@/components/onboarding-form'
import { Toast } from '@/components/toast'

export const dynamic = 'force-dynamic'

export default async function Onboarding({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const { supabase, profile } = await requireUser()
  const sp = await searchParams

  if (profile?.role === 'admin') {
    return <div className="notice">Admin accounts are managed separately and do not use member onboarding.</div>
  }

  const [{ data: progress }, { data: legal }, { data: verification }] = await Promise.all([
    supabase.rpc('get_my_onboarding_progress_v2'),
    supabase.rpc('get_my_legal_requirements'),
    supabase.rpc('get_my_verification_requirements_v1'),
  ])

  const requirements = Array.isArray(legal?.requirements) ? legal.requirements : []
  const versionIds = requirements
    .map((item: any) => item.version_id)
    .filter((id: unknown): id is string => typeof id === 'string')

  let legalDocuments: Record<string, string> = {}
  if (versionIds.length > 0) {
    const { data: versions } = await supabase
      .from('legal_document_versions')
      .select('id,content_markdown')
      .in('id', versionIds)
      .eq('publication_status', 'published')

    legalDocuments = Object.fromEntries(
      (versions || []).map((version: any) => [version.id, String(version.content_markdown || '')])
    )
  }

  const completed = Boolean(profile?.onboarding_completed_at)
  const roleHome: Record<string, string> = {
    teen: '/app/teen/jobs',
    adult: '/app/adult',
    guardian: '/app/guardian',
  }

  return (
    <>
      <PageHeaderWithActions
        title="Set up your MORT account"
        eyebrow="Onboarding"
        description="Four steps. Your account role is determined by your date of birth, and safety controls stay separate from marketplace access."
      />
      <Toast message={sp?.message} />
      {verification?.ok === true && (
        <section className="card" aria-labelledby="verification-requirements-title">
          <h2 id="verification-requirements-title">Identity verification requirements</h2>
          {!verification.eligible ? (
            <div className="notice" role="alert">
              MORT is strictly for people age 13 and older. You must provide a valid date of birth showing you are at least 13 before continuing.
            </div>
          ) : verification.age_band === 'minor' ? (
            <>
              <p><strong>Teen accounts (ages 13–17)</strong> require a verified school email address on an approved school domain.</p>
              <p>For identity review, provide a current school-issued photo ID when your school issues one. If your school does not issue a photo ID, MORT can accept official enrollment confirmation or direct verification from a school administrator.</p>
              <p className="muted">A school ID or school email does not prove age by itself. MORT&apos;s independent age-verification provider is not yet available, so document submission is currently disabled. Do not email or upload identity documents to MORT support.</p>
            </>
          ) : (
            <>
              <p><strong>Adult accounts (18+)</strong> require a valid, unexpired government-issued photo ID, such as a driver&apos;s license, state ID card, or passport.</p>
              <p className="muted">Identity verification is not yet available through an approved production provider. Document submission is currently disabled. Do not email or upload identity documents to MORT support.</p>
            </>
          )}
        </section>
      )}
      {completed ? (
        <section className="card">
          <h2>Setup complete</h2>
          {profile?.account_status === 'active' ? (
            <>
              <p>Your onboarding is complete.</p>
              <Link href={roleHome[profile.role] || '/app'} className="btn primary">Continue to MORT</Link>
            </>
          ) : (
            <p>Your information and required acknowledgements are saved. Your account remains pending review. Completing onboarding does not activate marketplace access, verification, job publishing, or payments.</p>
          )}
        </section>
      ) : (
        <>
          {progress?.ok !== true && (
            <div className="notice" role="status">
              MORT could not load the onboarding progress contract. Refresh the page. Your account data has not been changed.
            </div>
          )}
          <OnboardingForm
            profile={profile}
            step={progress?.active_step || 'account'}
            revision={progress?.revision || ''}
            requirements={requirements}
            legalDocuments={legalDocuments}
            legalAvailable={legal?.ok === true}
          />
        </>
      )}
    </>
  )
}
