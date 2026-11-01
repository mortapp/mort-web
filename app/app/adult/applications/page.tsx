import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, ApplicationCard, EmptyState } from '@/components/ui'
import { setApplicationStatus } from '../actions'
import { Toast } from '@/components/toast'
import { productionCapabilities } from '@/lib/production-capabilities'
export const dynamic = 'force-dynamic'

export default async function AdultApplications({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase, profile } = await requireRole(['adult'])
  const [{ data: result, error }, { data: runtime, error: runtimeError }] = await Promise.all([
    supabase.rpc('get_my_job_applications', { p_application_id: null }),
    supabase.rpc('get_runtime_feature_status'),
  ])
  const canAccept = profile?.verification_status === 'approved' && !runtimeError && runtime?.payments_disabled === false && runtime?.new_job_publishing_disabled === false && runtime?.maintenance_mode === false && productionCapabilities.perTaskGuardianApproval
  const apps = result?.ok === true && Array.isArray(result.items) ? result.items : []

  return (
    <>
      <PageHeaderWithActions title="Applicants" eyebrow="Adult" description="Review and respond to teens who applied to your jobs." />
      <Toast message={sp?.message} />

      {error && <div className="error">Applicants could not be loaded. Try again later.</div>}
      {!apps.length ? (
        <EmptyState icon="👥" title="No applicants yet" text="Once teens apply to your jobs, they'll show up here." href="/app/adult/post-job" action="Post a job" />
      ) : (
        <div className="grid two">
          {apps.map((a: any) => (
            <ApplicationCard
              key={a.id}
              title={a.jobs?.title}
              subtitle={`Applicant: ${a.teen?.display_name || 'Teen worker'}`}
              note={a.note}
              status={a.status}
            >
              {a.status === 'submitted' || a.status === 'shortlisted' ? (
                <form action={setApplicationStatus} className="row-actions" style={{ marginTop: 12 }}>
                  <input type="hidden" name="application_id" value={a.id} />
                  {canAccept && <button name="status" value="accepted" className="btn primary sm">Accept & secure funding</button>}
                  <button name="status" value="shortlisted" className="btn sm">Shortlist</button>
                  <button name="status" value="rejected" className="btn sm">Not selected</button>
                  {!canAccept && <p className="muted" style={{fontSize:12,marginTop:8}}>Acceptance is disabled until adult identity verification, teen age verification, production payment funding, and per-Task Guardian approval are available.</p>}
                </form>
              ) : <p style={{ fontSize: 12, color: 'var(--muted2)' }}>This application is in the assignment workflow. Manage active work from the job assignment screen.</p>}
            </ApplicationCard>
          ))}
        </div>
      )}
    </>
  )
}
