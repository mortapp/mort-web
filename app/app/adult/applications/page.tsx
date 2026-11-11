import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, ApplicationCard, EmptyState } from '@/components/ui'
import { setApplicationStatus } from '../actions'
import { startThreadFromApplication } from '../../messages/actions'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

// Production model: job_applications joined to jobs (poster) and applicant
// profile. Actions go through update_my_job_application_status, which only
// allows the poster's decisions: shortlist, reject, view, accept.
export default async function AdultApplications({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase, user, profile } = await requireRole(['adult','admin'])
  let q = supabase
    .from('job_applications')
    .select('*, jobs!inner(*), profiles!job_applications_applicant_id_fkey(display_name, username)')
    .order('created_at', { ascending: false })
  if (profile?.role !== 'admin') q = q.eq('jobs.poster_id', user.id)
  const { data: apps } = await q

  return (
    <>
      <PageHeaderWithActions title="Applicants" eyebrow="Adult" description="Review and respond to teens who applied to your jobs." />
      <Toast message={sp?.message} />

      {!apps?.length ? (
        <EmptyState icon="👥" title="No applicants yet" text="Once teens apply to your jobs, they'll show up here." href="/app/adult/post-job" action="Post a job" />
      ) : (
        <div className="grid two">
          {apps.map((a: any) => (
            <ApplicationCard
              key={a.id}
              title={a.jobs?.title}
              subtitle={`Applicant: ${a.profiles?.display_name || a.applicant_id}`}
              note={a.cover_note}
              status={a.status}
            >
              <form action={setApplicationStatus} className="row-actions" style={{ marginTop: 12 }}>
                <input type="hidden" name="application_id" value={a.id} />
                <button name="status" value="accepted" className="btn primary sm" disabled={a.status === 'accepted'}>Accept</button>
                <button name="status" value="shortlisted" className="btn sm" disabled={!['submitted'].includes(a.status)}>Shortlist</button>
                <button name="status" value="rejected" className="btn sm" disabled={!['submitted','shortlisted'].includes(a.status)}>Reject</button>
              </form>
              {a.status === 'accepted' && (
                <form action={startThreadFromApplication} className="row-actions" style={{ marginTop: 8 }}>
                  <input type="hidden" name="application_id" value={a.id} />
                  <button className="btn ghost sm">💬 Message applicant</button>
                </form>
              )}
            </ApplicationCard>
          ))}
        </div>
      )}
    </>
  )
}
