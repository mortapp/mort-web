import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions, Status } from '@/components/ui'
import { acceptGuardianInvite, createGuardianInvite, uploadVerificationEvidence } from './actions'
import { Toast } from '@/components/toast'
import { SubmitButton } from '@/components/submit-button'
import { VerificationUploader } from '@/components/verification-uploader'
export const dynamic = 'force-dynamic'

export default async function Verify({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const { supabase, user, profile } = await requireUser()
  const sp = await searchParams
  const [{ data: verification, error: verificationError }, { data: cases, error: casesError }] = await Promise.all([
    supabase.rpc('get_my_verification_requirements_v1'),
    supabase.rpc('list_my_verification_cases_v1'),
  ])

  const isTeen = profile?.role === 'teen'
  const evidenceType = isTeen ? 'school_id' : 'identity'
  const casesLoaded = !casesError && Array.isArray(cases)
  const hasPendingCase = !casesError && Array.isArray(cases) && cases.some((c: any) => ['pending', 'needs_review'].includes(c?.status))
  const canSubmitEvidence = !verificationError && verification?.ok === true && casesLoaded && !hasPendingCase

  return (
    <>
      <PageHeaderWithActions title="Verify MORT account" eyebrow="Trust gate">
        <p>Current role: <span style={{textTransform:'capitalize',fontWeight:600}}>{profile?.role || 'none'}</span> · status <Status value={profile?.verification_status} /></p>
      </PageHeaderWithActions>
      <Toast message={sp?.error || sp?.message} variant={sp?.error ? 'error' : 'default'} />
      {(verificationError || casesError || verification?.ok !== true || !casesLoaded) && (
        <div className="warning-box" role="alert" style={{ marginBottom: 16 }}>
          Verification status could not be loaded. Refresh before submitting evidence.
        </div>
      )}

      <div className="grid two">
        <VerificationUploader
          action={uploadVerificationEvidence}
          verificationType={evidenceType}
          isAdult={!isTeen}
          canSubmitEvidence={canSubmitEvidence}
          hasPendingCase={hasPendingCase}
        />

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
