import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions, Status } from '@/components/ui'
import { acceptGuardianInvite, createGuardianInvite } from './actions'
import { Toast } from '@/components/toast'
import { SubmitButton } from '@/components/submit-button'
export const dynamic = 'force-dynamic'

export default async function Verify({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const { supabase, profile } = await requireUser()
  const sp = await searchParams
  const [{ data: identity }, { data: cases }, { data: links }] = await Promise.all([
    supabase.rpc('get_my_identity_verification_v2'),
    supabase.from('verification_cases').select('id, verification_type, status, provider, submitted_at, reviewed_at, reviewer_note').order('created_at', { ascending: false }).limit(10),
    supabase.from('guardian_links').select('id, teen_user_id, guardian_user_id, status, teen_consent_at, guardian_consent_at, created_at, updated_at').order('created_at', { ascending: false }).limit(20),
  ])
  const isTeen = profile?.role === 'teen'
  const isGuardian = profile?.role === 'guardian'

  return (
    <>
      <PageHeaderWithActions title="Verification & Guardian Mode" eyebrow="Trust and account controls">
        <p>Current role: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{profile?.role || 'not assigned'}</span> · account verification <Status value={identity?.status || profile?.verification_status} /></p>
      </PageHeaderWithActions>
      <Toast message={sp?.message} />
      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Identity verification status</h3>
        <p style={{ marginTop: 8 }}>{identity?.public_message || 'Identity verification is not currently available.'}</p>
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--muted2)' }}>Production provider: {identity?.production_provider_available ? 'available' : 'not configured'} · submissions: {identity?.submissions_enabled ? 'enabled' : 'disabled'}</p>
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--muted2)' }}>Do not upload identity documents to MORT until an approved production verification provider is connected.</p>
      </div>
      {isTeen && (
        <div className="card form" style={{ maxWidth: 600, marginBottom: 20 }}>
          <h3>Optional Guardian connection</h3>
          <p>Guardian Mode is optional. Create a one-time invite code and share it directly with the adult you choose. A link is not active until the guardian accepts.</p>
          <form action={createGuardianInvite}>
            <label>Guardian email (optional)<input name="invite_email" type="email" placeholder="guardian@example.com" /></label>
            <SubmitButton pendingLabel="Creating invite…">Create guardian invite</SubmitButton>
          </form>
        </div>
      )}
      {isGuardian && (
        <div className="card form" style={{ maxWidth: 600, marginBottom: 20 }}>
          <h3>Accept a Guardian invite</h3>
          <p>Enter the one-time code shared by the teen. Your account must be an active, email-confirmed adult Guardian account.</p>
          <form action={acceptGuardianInvite}>
            <label>Invite code<input name="invite_code" required placeholder="Paste the one-time code" autoComplete="off" /></label>
            <SubmitButton pendingLabel="Connecting…">Accept invite</SubmitButton>
          </form>
        </div>
      )}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 12 }}>Guardian connections</h3>
        {!links?.length ? <p style={{ color: 'var(--muted2)' }}>No Guardian connections are recorded for this account.</p> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Status</th><th>Teen consent</th><th>Guardian consent</th><th>Updated</th></tr></thead>
            <tbody>{links.map((link: any) => <tr key={link.id}>
              <td><Status value={link.status} /></td>
              <td>{link.teen_consent_at ? 'Recorded' : 'Pending'}</td>
              <td>{link.guardian_consent_at ? 'Recorded' : 'Pending'}</td>
              <td>{new Date(link.updated_at || link.created_at).toLocaleDateString()}</td>
            </tr>)}</tbody>
          </table></div>
        )}
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Verification history</h3>
        {!cases?.length ? <p style={{ color: 'var(--muted2)' }}>No verification cases have been submitted.</p> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Type</th><th>Status</th><th>Provider</th><th>Submitted</th></tr></thead>
            <tbody>{cases.map((item: any) => <tr key={item.id}>
              <td>{item.verification_type}</td><td><Status value={item.status} /></td><td>{item.provider || 'Not assigned'}</td><td>{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : '—'}</td>
            </tr>)}</tbody>
          </table></div>
        )}
      </div>
    </>
  )
}