import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, Status, EmptyState, CategoryPill } from '@/components/ui'
import { ProofUpload } from '@/components/proof-upload'
import { PROOF_BUCKET } from '@/lib/mort'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function Active({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase, user } = await requireRole(['teen'])
  const { data: apps, error: assignmentsError } = await supabase
    .from('job_assignments')
    .select('id, application_id, job_id, teen_user_id, adult_user_id, status, agreed_amount, accepted_at, started_at, completed_by_teen_at, completed_by_adult_at, closed_at, created_at, jobs(id, title, category, city, region, location_text, status)')
    .eq('teen_user_id', user.id)
    .order('created_at', { ascending: false })

  const appIds = (apps || []).map((a: any) => a.application_id)
  const { data: proofRows } = appIds.length
    ? await supabase.from('proof_uploads').select('id, application_id, storage_path, status, note, created_at').in('application_id', appIds).order('created_at', { ascending: false })
    : { data: [] as any[] }

  let storageIssue: string | null = null
  const proofByApp: Record<string, any[]> = {}
  for (const p of proofRows || []) {
    if (!proofByApp[p.application_id]) proofByApp[p.application_id] = []
    proofByApp[p.application_id].push(p)
  }

  // Best-effort signed URLs. If the bucket doesn't exist yet, note it once
  // instead of failing the whole page.
  const signedUrls: Record<string, string> = {}
  if (proofRows && proofRows.length) {
    for (const p of proofRows) {
      try {
        const { data, error } = await supabase.storage.from(PROOF_BUCKET).createSignedUrl(p.storage_path, 3600)
        if (error) { storageIssue = error.message; continue }
        if (data?.signedUrl) signedUrls[p.id] = data.signedUrl
      } catch (e: any) {
        storageIssue = e?.message || 'Could not load proof files.'
      }
    }
  }

  return (
    <>
      <PageHeaderWithActions
        title="Active jobs"
        eyebrow="Safety + proof"
        description="Upload proof files for assignments in progress. Adults can review evidence attached to their own jobs."
      />

      <Toast message={sp?.message} />
      {storageIssue && (
        <div className="warning-box" style={{ marginBottom: 20 }}>
          <strong>⚠️ Proof storage isn&apos;t fully set up</strong>
          <p style={{ marginTop: 6, fontSize: 13 }}>{storageIssue} Proof storage is not currently available. Your assignment record remains unchanged; do not repeatedly retry the same upload.</p>
        </div>
      )}

      {assignmentsError && <div className="error">Active assignments could not be loaded. Try again later.</div>}
      {!apps?.length ? (
        <EmptyState icon="⚙️" title="No active jobs" text="Accepted assignments appear here when work is in progress. MORT does not provide live location check-ins." href="/app/teen/jobs" action="Browse jobs" />
      ) : (
        <div className="grid two" style={{ alignItems: 'start' }}>
          {apps.map((a: any) => (
            <div className="card" key={a.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <h3>{a.jobs?.title}</h3>
                  <CategoryPill category={a.jobs?.category} />
                </div>
                <Status value={a.status} />
              </div>

              <div style={{ marginTop: 14 }}>
                <h4 style={{ marginBottom: 8 }}>Proof on file ({(proofByApp[a.application_id] || []).length})</h4>
                {!(proofByApp[a.application_id] || []).length ? (
                  <p style={{ fontSize: 12.5 }}>No proof uploaded yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {proofByApp[a.application_id].map((p: any) => (
                      <div key={p.id} style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, border: '1px solid var(--line)', borderRadius: 10, padding: '8px 10px' }}>
                        <span style={{ color: 'var(--muted2)' }}>{p.note || 'Proof file'} · {new Date(p.created_at).toLocaleDateString()}</span>
                        {signedUrls[p.id]
                          ? <a href={signedUrls[p.id]} target="_blank" rel="noreferrer" className="btn sm ghost">View</a>
                          : <span className="status muted">Unavailable</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {a.status === 'in_progress' ? <ProofUpload applicationId={a.application_id} /> : <p style={{ fontSize: 12.5, marginTop: 12, color: 'var(--muted2)' }}>Proof upload opens once the job is marked in progress.</p>}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
