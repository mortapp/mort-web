import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, Status, MetricCard, AdminReviewCard } from '@/components/ui'
import { CountUp } from '@/components/count-up'
import { LocalTabs } from '@/components/local-tabs'
import { reviewBusinessVerification, updateReportStatus, updateUserStatus } from './actions'
import { updateSupportTicketStatus } from '../support/actions'
import { SubmitButton } from '@/components/submit-button'
import { PROOF_BUCKET } from '@/lib/mort'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function Admin({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase } = await requireRole(['admin'])

  const [
    { data: verifications },
    { data: reports },
    { data: users },
    { count: jobsCount },
    { data: needsHelpPings },
    { data: proofUploads, error: proofError },
    { data: tickets, error: ticketsError },
  ] = await Promise.all([
    supabase.from('business_verifications').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('jobs').select('id', { count: 'exact', head: true }),
    supabase.from('safety_pings').select('*').eq('status', 'needs_help').order('created_at', { ascending: false }).limit(10),
    supabase.from('proof_uploads').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('support_tickets').select('*').order('created_at', { ascending: false }).limit(30),
  ])

  const signedUrls: Record<string, string> = {}
  let proofStorageIssue: string | null = proofError?.message || null
  if (proofUploads?.length) {
    for (const p of proofUploads) {
      try {
        const { data, error } = await supabase.storage.from(PROOF_BUCKET).createSignedUrl(p.storage_path, 3600)
        if (error) { proofStorageIssue = error.message; continue }
        if (data?.signedUrl) signedUrls[p.id] = data.signedUrl
      } catch (e: any) {
        proofStorageIssue = e?.message || 'Could not load proof files.'
      }
    }
  }

  const openReports = (reports || []).filter((r: any) => r.status === 'open').length
  const openTickets = (tickets || []).filter((t: any) => t.status === 'open').length

  const verificationsContent = (
    <div className="grid two">
      {!verifications?.length && <p style={{ fontSize: 13 }}>Nothing pending review.</p>}
      {(verifications || []).map((b: any) => (
        <AdminReviewCard key={b.id} icon="✅" iconColor="blue" title={b.business_name || 'Business'} subtitle={b.business_type} meta={b.notes} status={b.status}>
          <form action={reviewBusinessVerification} className="row-actions" style={{ marginTop: 12 }}>
            <input type="hidden" name="id" value={b.id} />
            <input type="hidden" name="adult_id" value={b.adult_id} />
            <SubmitButton name="status" value="approved" size="sm" pendingLabel="Approving…">Approve</SubmitButton>
            <SubmitButton name="status" value="rejected" variant="danger" size="sm" pendingLabel="Rejecting…">Reject</SubmitButton>
          </form>
        </AdminReviewCard>
      ))}
    </div>
  )

  const reportsContent = (
    <div className="grid two">
      {!reports?.length && <p style={{ fontSize: 13 }}>No reports filed.</p>}
      {(reports || []).map((r: any) => (
        <AdminReviewCard key={r.id} icon="⚠️" iconColor="yellow" title={r.reason} subtitle={r.details} meta={`reporter ${(r.reporter_id || '').slice(0, 8)}…`} status={r.status}>
          <form action={updateReportStatus} className="row-actions" style={{ marginTop: 12 }}>
            <input type="hidden" name="id" value={r.id} />
            <SubmitButton name="status" value="reviewing" variant="ghost" size="sm" pendingLabel="…">Reviewing</SubmitButton>
            <SubmitButton name="status" value="resolved" size="sm" pendingLabel="Resolving…">Resolve</SubmitButton>
            <SubmitButton name="status" value="dismissed" variant="ghost" size="sm" pendingLabel="…">Dismiss</SubmitButton>
          </form>
        </AdminReviewCard>
      ))}
    </div>
  )

  const proofContent = (
    <>
      {proofStorageIssue && (
        <div className="warning-box" style={{ marginBottom: 16 }}>
          <strong>⚠️ Storage note</strong>
          <p style={{ marginTop: 6, fontSize: 13 }}>{proofStorageIssue}</p>
        </div>
      )}
      {!proofUploads?.length ? (
        <p style={{ fontSize: 13 }}>No proof uploaded yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Application</th><th>Uploaded by</th><th>Note</th><th>When</th><th></th></tr></thead>
            <tbody>
              {proofUploads.map((p: any) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.application_id?.slice(0, 8)}…</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.uploaded_by?.slice(0, 8)}…</td>
                  <td>{p.note || '—'}</td>
                  <td style={{ fontSize: 12 }}>{new Date(p.created_at).toLocaleString()}</td>
                  <td>{signedUrls[p.id] ? <a href={signedUrls[p.id]} target="_blank" rel="noreferrer" className="btn sm ghost">View</a> : <span className="status muted">Unavailable</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )

  const ticketsContent = (
    <>
      {ticketsError && (
        <div className="warning-box" style={{ marginBottom: 16 }}>
          <strong>⚠️ Support tables aren&apos;t set up yet</strong>
          <p style={{ marginTop: 6, fontSize: 13 }}>{ticketsError.message}</p>
        </div>
      )}
      {!tickets?.length ? (
        <p style={{ fontSize: 13 }}>No tickets submitted.</p>
      ) : (
        <div className="grid two">
          {tickets.map((t: any) => (
            <AdminReviewCard key={t.id} icon="🎧" iconColor="rose" title={t.subject} subtitle={new Date(t.created_at).toLocaleString()} meta={`user ${(t.requester_id || '').slice(0, 8)}…`} status={t.status}>
              <form action={updateSupportTicketStatus} className="row-actions" style={{ marginTop: 12 }}>
                <input type="hidden" name="ticket_id" value={t.id} />
                <SubmitButton name="status" value="in_progress" variant="ghost" size="sm" pendingLabel="…">In progress</SubmitButton>
                <SubmitButton name="status" value="resolved" size="sm" pendingLabel="Resolving…">Resolve</SubmitButton>
                <SubmitButton name="status" value="closed" variant="ghost" size="sm" pendingLabel="…">Close</SubmitButton>
              </form>
              <a href={`/app/support/${t.id}`} className="btn ghost sm" style={{ marginTop: 8, display: 'inline-flex' }}>Open thread</a>
            </AdminReviewCard>
          ))}
        </div>
      )}
    </>
  )

  const usersContent = (
    <div className="table-wrap">
      <table className="table">
        <tbody>
          {(users || []).map((u: any) => (
            <tr key={u.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar-tile sm muted">{(u.display_name || '?').charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{u.display_name}</div>
                    <p className="small" style={{ fontFamily: 'monospace', textTransform: 'none', letterSpacing: 0 }}>{u.id}</p>
                  </div>
                </div>
              </td>
              <td>{u.role}</td>
              <td><Status value={u.account_status} /></td>
              <td>
                <form action={updateUserStatus} className="row-actions">
                  <input type="hidden" name="user_id" value={u.id} />
                  <SubmitButton name="account_status" value="active" variant="ghost" size="sm" pendingLabel="…">Active</SubmitButton>
                  <SubmitButton name="account_status" value="suspended" variant="danger" size="sm" pendingLabel="…">Suspend</SubmitButton>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      <PageHeaderWithActions title="Admin HQ" eyebrow="Moderation">
        <p>Review adults, reports, users, safety pings, proof, and support tickets.</p>
      </PageHeaderWithActions>
      <Toast message={sp?.message} />

      {needsHelpPings && needsHelpPings.length > 0 && (
        <div className="sos-card" style={{ marginBottom: 24, textAlign: 'left' }}>
          <h3 style={{ color: 'var(--danger)', marginBottom: 10 }}>🚨 Active &quot;needs help&quot; safety pings</h3>
          {needsHelpPings.map((p: any) => (
            <div key={p.id} style={{ fontSize: 13, marginBottom: 6, fontFamily: 'monospace' }}>
              teen {p.teen_id.slice(0, 8)}… · {new Date(p.created_at).toLocaleString()} {p.note ? `— ${p.note}` : ''}
            </div>
          ))}
        </div>
      )}

      <div className="stats">
        <MetricCard icon="✅" label="Verifications" value={<CountUp value={verifications?.length || 0} />} />
        <MetricCard icon="⚠️" label="Open reports" value={<CountUp value={openReports} />} color={openReports ? 'var(--danger)' : undefined} />
        <MetricCard icon="🎧" label="Open tickets" value={<CountUp value={openTickets} />} color={openTickets ? 'var(--warning)' : undefined} />
        <MetricCard icon="💼" label="Jobs" value={<CountUp value={jobsCount || 0} />} />
      </div>

      <LocalTabs
        tabs={[
          { key: 'verifications', label: 'Verifications', icon: '✅', badge: verifications?.length, content: verificationsContent },
          { key: 'reports', label: 'Reports', icon: '⚠️', badge: openReports, content: reportsContent },
          { key: 'proof', label: 'Proof review', icon: '📸', content: proofContent },
          { key: 'tickets', label: 'Support', icon: '🎧', badge: openTickets, content: ticketsContent },
          { key: 'users', label: 'Users', icon: '👤', content: usersContent },
        ]}
      />
    </>
  )
}
