import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions, Status } from '@/components/ui'
import { acceptGuardianInvite, createGuardianInvite, uploadVerificationEvidence } from './actions'
import { Toast } from '@/components/toast'
import { SubmitButton } from '@/components/submit-button'
export const dynamic = 'force-dynamic'

export default async function Verify({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const { supabase, user, profile } = await requireUser()
  const sp = await searchParams
  const [{ data: verification }, { data: cases }] = await Promise.all([
    supabase.rpc('get_my_verification_requirements_v1'),
    supabase.rpc('list_my_verification_cases_v1'),
  ])

  const isTeen = profile?.role === 'teen'
  const evidenceType = isTeen ? 'school_id' : 'identity'
  const hasPendingCase = Array.isArray(cases) && cases.some((c: any) => ['pending', 'needs_review'].includes(c?.status))

  return (
    <>
      <PageHeaderWithActions title="Verify MORT account" eyebrow="Trust gate">
        <p>Current role: <span style={{textTransform:'capitalize',fontWeight:600}}>{profile?.role || 'none'}</span> · status <Status value={profile?.verification_status} /></p>
      </PageHeaderWithActions>
      <Toast message={sp?.message} />

      <div className="grid two">
        <form action={uploadVerificationEvidence} className="card form">
          <div className="card-icon-tile">{isTeen ? '🎓' : '💼'}</div>
          <h3>{isTeen ? 'Teen identity evidence' : 'Adult identity evidence'}</h3>
          <p style={{fontSize:13,marginBottom:4}}>
            {isTeen
              ? 'Upload a current school-issued photo ID, or official enrollment confirmation if your school has no photo ID. MORT staff review every submission.'
              : 'Upload a valid, unexpired government-issued photo ID (driver license, state ID, or passport). MORT staff review every submission.'}
          </p>
          <input type="hidden" name="verification_type" value={evidenceType} />
          <label>Document (JPG, PNG, HEIC, or PDF, max 10 MB)<input name="evidence" type="file" accept=".jpg,.jpeg,.png,.heic,.pdf,image/jpeg,image/png,image/heic,application/pdf" required /></label>
          {hasPendingCase ? (
            <p className="muted">You already have a submission under review. You can submit again after it is decided.</p>
          ) : null}
          <SubmitButton pendingLabel="Uploading…">Submit for review</SubmitButton>
          <p className="muted">Do not email identity documents to MORT support. Uploads go to a private bucket only you and MORT reviewers can access.</p>
        </form>

        <div className="card">
          <div className="card-icon-tile blue">📄</div>
          <h3>Your verification history</h3>
          {!!(Array.isArray(cases) && cases.length) ? (
            <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:12}}>
              {cases.map((c: any) => (
                <div key={c.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:'10px 14px',border:'1px solid var(--border)',borderRadius:12,background:'var(--bg-sunken)'}}>
                  <span style={{fontSize:13,color:'var(--muted2)'}}>
                    {c.verification_type === 'school_id' ? 'School ID' : c.verification_type === 'identity' ? 'Government ID' : c.verification_type}
                    {c.submitted_at ? ` · submitted ${new Date(c.submitted_at).toLocaleDateString()}` : ''}
                  </span>
                  <Status value={c.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="muted" style={{marginTop:8}}>No verification submissions yet.</p>
          )}
          {verification?.ok === true && (
            <p className="muted" style={{marginTop:12}}>{verification.identity_evidence_rule}</p>
          )}
        </div>

        <div className="card">
          <div className="card-icon-tile">🛡️</div>
          <h3>Guardian invite code</h3>
          <p style={{fontSize:13,marginBottom:12}}>Teens: create a one-time code for your parent or guardian. Copy it from the success message right after creation — the live backend stores only a hashed version after that.</p>
          <form action={createGuardianInvite} className="form">
            <label>Guardian email (optional)<input name="invite_email" type="email" placeholder="guardian@example.com" /></label>
            <SubmitButton pendingLabel="Creating…">Create invite code</SubmitButton>
          </form>
        </div>

        <form action={acceptGuardianInvite} className="card form">
          <div className="card-icon-tile blue">🔗</div>
          <h3>Guardian accepts invite</h3>
          <label>Invite code<input name="invite_code" required placeholder="ABC123" style={{textTransform:'uppercase'}} /></label>
          <SubmitButton pendingLabel="Connecting…">Connect as guardian</SubmitButton>
        </form>
      </div>
    </>
  )
}
