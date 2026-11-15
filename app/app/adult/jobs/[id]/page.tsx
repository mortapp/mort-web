import { randomUUID } from 'node:crypto'
import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, Status, CategoryPill } from '@/components/ui'
import { setApplicationStatus } from '../../actions'
import { PROOF_BUCKET } from '@/lib/mort'
import { SubmitButton } from '@/components/submit-button'
export const dynamic = 'force-dynamic'

export default async function AdultJobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, user, profile } = await requireRole(['adult','admin'])

  const [{ data: job, error: jobError }, { data: apps, error: appsError }] = await Promise.all([
    supabase.from('jobs').select('*').eq('id', id).maybeSingle(),
    supabase.from('job_applications').select('*, profiles!job_applications_applicant_id_fkey(display_name, username, city, region)').eq('job_id', id).order('created_at', { ascending: false }),
  ])

  if (jobError) return <div className="error" role="alert">Job could not be loaded. Refresh and try again.</div>
  if (!job) return <div className="error">Job not found</div>
  if (profile?.role !== 'admin' && job.poster_id !== user.id) return <div className="error">You can only view applicants for jobs you posted.</div>

  const appIds = (apps || []).map((a: any) => a.id)
  const { data: proofRows, error: proofError } = appIds.length
    ? await supabase.from('proof_uploads').select('*').in('application_id', appIds).order('created_at', { ascending: false })
    : { data: [] as any[], error: null }

  const proofByApp: Record<string, any[]> = {}
  for (const p of proofRows || []) {
    if (!proofByApp[p.application_id]) proofByApp[p.application_id] = []
    proofByApp[p.application_id].push(p)
  }
  const signedUrls: Record<string, string> = {}
  let storageIssue: string | null = null
  for (const p of proofRows || []) {
    try {
      const { data, error } = await supabase.storage.from(PROOF_BUCKET).createSignedUrl(p.storage_path, 3600)
      if (error) { storageIssue = error.message; continue }
      if (data?.signedUrl) signedUrls[p.id] = data.signedUrl
    } catch (e: any) {
      storageIssue = e?.message || 'Could not load proof files.'
    }
  }

  return (
    <>
      <PageHeaderWithActions title={job.title} eyebrow="Applicant review">
        <CategoryPill category={job.category} />
        <Status value={job.status} />
      </PageHeaderWithActions>

      <div className="card" style={{ marginBottom: 24 }}>
        <p>{job.description}</p>
      </div>

      {storageIssue && (
        <div className="warning-box" style={{ marginBottom: 20 }}>
          <strong>⚠️ Proof storage note</strong>
          <p style={{ marginTop: 6, fontSize: 13 }}>{storageIssue}</p>
        </div>
      )}

      {appsError && <div className="warning-box" role="alert" style={{ marginBottom: 16 }}>Applicant records could not be loaded. Refresh and try again.</div>}
      {proofError && <div className="warning-box" role="alert" style={{ marginBottom: 16 }}>Proof submissions could not be loaded.</div>}

      <h2 style={{ marginBottom: 16 }}>Applicants ({appsError ? '—' : apps?.length || 0})</h2>
      {!appsError && !apps?.length ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No applicants yet</h3>
          <p>Once teens apply, they&apos;ll show up here for review.</p>
        </div>
      ) : (
        <div className="grid two">
          {apps.map((a: any) => (
            <div className="application-card" key={a.id}>
              <div className="application-card-header">
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="avatar-tile sm">{(a.profiles?.display_name || '?').charAt(0).toUpperCase()}</div>
                  <div>
                    <h3>{a.profiles?.display_name || 'Applicant'}</h3>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{[a.profiles?.city, a.profiles?.region].filter(Boolean).join(', ')}</p>
                  </div>
                </div>
                <Status value={a.status} />
              </div>
              {a.cover_note && <p className="application-card-note">{a.cover_note}</p>}

              {(proofByApp[a.id] || []).length > 0 && (
                <div>
                  <h4 style={{ marginBottom: 6 }}>Proof submitted ({proofByApp[a.id].length})</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {proofByApp[a.id].map((p: any) => (
                      <div key={p.id} style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px' }}>
                        <span style={{ color: 'var(--muted2)' }}>{p.note || 'Proof file'} · {new Date(p.created_at).toLocaleDateString()}</span>
                        {signedUrls[p.id]
                          ? <a href={signedUrls[p.id]} target="_blank" rel="noreferrer" className="btn sm ghost">View</a>
                          : <span className="status muted">Unavailable</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile?.role === 'adult' && ['submitted', 'shortlisted'].includes(a.status) ? (
                <form action={setApplicationStatus} className="row-actions">
                  <input type="hidden" name="application_id" value={a.id} />
                  <input type="hidden" name="client_request_id" value={randomUUID()} />
                  <input type="hidden" name="expected_updated_at" value={a.updated_at} />
                  <SubmitButton name="status" value="accepted" size="sm" pendingLabel="…">Accept</SubmitButton>
                  <SubmitButton name="status" value="rejected" variant="ghost" size="sm" pendingLabel="…">Reject</SubmitButton>
                </form>
              ) : <p className="muted">{profile?.role === 'admin' ? 'Administrator view is read-only; decisions are restricted to the job poster.' : 'No application decision is available in this status.'}</p>}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
