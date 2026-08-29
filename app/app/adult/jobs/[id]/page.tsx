import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, Status, CategoryPill } from '@/components/ui'
import { setApplicationStatus } from '../../actions'
import { PROOF_BUCKET } from '@/lib/mort'
import { SubmitButton } from '@/components/submit-button'
export const dynamic = 'force-dynamic'

export default async function AdultJobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, user, profile } = await requireRole(['adult','admin'])

  const [{ data: job }, { data: apps }] = await Promise.all([
    supabase.from('jobs').select('*').eq('id', id).maybeSingle(),
    supabase.from('applications').select('*, profiles(display_name, username, city, state)').eq('job_id', id).order('created_at', { ascending: false }),
  ])

  if (!job) return <div className="error">Job not found</div>
  if (profile?.role !== 'admin' && job.poster_id !== user.id) return <div className="error">You can only view applicants for jobs you posted.</div>

  const appIds = (apps || []).map((a: any) => a.id)
  const { data: proofRows } = appIds.length
    ? await supabase.from('proof_uploads').select('*').in('application_id', appIds).order('created_at', { ascending: false })
    : { data: [] as any[] }

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

      <h2 style={{ marginBottom: 16 }}>Applicants ({apps?.length || 0})</h2>
      {!apps?.length ? (
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
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{[a.profiles?.city, a.profiles?.state].filter(Boolean).join(', ')}</p>
                  </div>
                </div>
                <Status value={a.status} />
              </div>
              {a.note && <p className="application-card-note">{a.note}</p>}

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

              <form action={setApplicationStatus} className="row-actions">
                <input type="hidden" name="application_id" value={a.id} />
                <SubmitButton name="status" value="accepted" size="sm" pendingLabel="…">Accept</SubmitButton>
                <SubmitButton name="status" value="rejected" variant="ghost" size="sm" pendingLabel="…">Reject</SubmitButton>
                <SubmitButton name="status" value="in_progress" variant="safe" size="sm" pendingLabel="…">Start work</SubmitButton>
                <SubmitButton name="status" value="completed" variant="safe" size="sm" pendingLabel="…">Mark completed</SubmitButton>
              </form>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
