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

  const [{ data: progress }, { data: legal }] = await Promise.all([
    supabase.rpc('get_my_onboarding_progress_v2'),
    supabase.rpc('get_my_legal_requirements'),
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
