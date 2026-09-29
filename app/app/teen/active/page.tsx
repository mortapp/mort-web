import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, Status, EmptyState, CategoryPill } from '@/components/ui'
import { ProofUpload } from '@/components/proof-upload'
import { PROOF_BUCKET } from '@/lib/mort'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function Active({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase, user } = await requireRole(['teen'])
  const { data: apps } = await supabase
    .from('applications')
    .select('*, jobs(*)')
    .eq('teen_id', user.id)
    .in('status', ['accepted','in_progress','proof_submitted','completion_pending_release','completed','disputed'])
    .order('updated_at', { ascending: false })

  const appIds = (apps || []).map((a: any) => a.id)
  const { data: proofRows } = appIds.length
    ? await supabase.from('proof_uploads').select('*').in('application_id', appIds).order('created_at', { ascending: false })
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
        description="Upload real photo/video proof for jobs in progress. Adults and admins can review it."
      />

      <Toast message={sp?.message} />
      {storageIssue && (
        <div className="warning-box" style={{ marginBottom: 20 }}>
          <strong>⚠️ Proof storage isn&apos;t fully set up</strong>
          <p style={{ marginTop: 6, fontSize: 13 }}>{storageIssue} Ask your admin to finish the Supabase Storage setup in the README (bucket: <code>{PROOF_BUCKET}</code>).</p>
        </div>
      )}

      {!apps?.length ? (
        <EmptyState icon="⚙️" title="No active jobs" text="Accepted jobs show here so you can check in and upload proof." href="/app/teen/jobs" action="Browse jobs" />
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
                <h4 style={{ marginBottom: 8 }}>Proof on file ({(proofByApp[a.id] || []).length})</h4>
                {!(proofByApp[a.id] || []).length ? (
                  <p style={{ fontSize: 12.5 }}>No proof uploaded yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {proofByApp[a.id].map((p: any) => (
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

              {a.status === 'in_progress' ? <ProofUpload applicationId={a.id} /> : <p style={{ fontSize: 12.5, marginTop: 12, color: 'var(--muted2)' }}>Proof upload opens once the job is marked in progress.</p>}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
