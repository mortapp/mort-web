import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, ApplicationCard, EmptyState } from '@/components/ui'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function AdultApplications({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase } = await requireRole(['adult'])
  const { data: result, error } = await supabase.rpc('get_my_job_applications', { p_application_id: null })
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
                <form action={async (formData: FormData) => {
                  'use server'
                  const { supabase } = await requireRole(['adult'])
                  const { data, error } = await supabase.rpc('update_my_job_application_status', {
                    p_application_id: String(formData.get('application_id') || ''),
                    p_action: String(formData.get('action') || ''),
                    p_expected_updated_at: null,
                  })
                  if (error || data?.ok !== true) redirect('/app/adult/applications?message=' + encodeURIComponent(data?.code || error?.message || 'Application update failed.'))
                  revalidatePath('/app/adult/applications')
                  redirect('/app/adult/applications?message=Application updated')
                }} className="row-actions" style={{ marginTop: 12 }}>
                  <input type="hidden" name="application_id" value={a.id} />
                  <button name="action" value="accepted" className="btn primary sm">Accept</button>
                  <button name="action" value="shortlisted" className="btn sm">Shortlist</button>
                  <button name="action" value="rejected" className="btn sm">Reject</button>
                </form>
              ) : <p style={{ fontSize: 12, color: 'var(--muted2)' }}>This application is in the assignment workflow. Manage active work from the job assignment screen.</p>}
            </ApplicationCard>
          ))}
        </div>
      )}
    </>
  )
}
