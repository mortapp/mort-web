import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions, Status } from '@/components/ui'
import { acceptGuardianInvite, createGuardianInvite, saveTeenVerification, submitBusinessVerification } from './actions'
import { Toast } from '@/components/toast'
import { SubmitButton } from '@/components/submit-button'
export const dynamic = 'force-dynamic'

export default async function Verify({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const { supabase, user, profile } = await requireUser()
  const sp = await searchParams
  const [{ data: invites }, { data: biz }] = await Promise.all([
    supabase.from('guardian_connections').select('*').or(`teen_id.eq.${user.id},guardian_id.eq.${user.id}`).order('created_at', { ascending: false }),
    supabase.from('business_verifications').select('*').eq('adult_id', user.id).order('created_at', { ascending: false }),
  ])

  return (
    <>
      <PageHeaderWithActions title="Verify MORT account" eyebrow="Trust gate">
        <p>Current role: <span style={{textTransform:'capitalize',fontWeight:600}}>{profile?.role || 'none'}</span> · status <Status value={profile?.verification_status} /></p>
      </PageHeaderWithActions>
      <Toast message={sp?.message} />

      <div className="grid two">
        <form action={saveTeenVerification} className="card form">
          <div className="card-icon-tile">🔥</div>
          <h3>Teen verification</h3>
          <p style={{fontSize:13,marginBottom:4}}>Use this for 13–17 teen worker setup. No SSN. Keep sensitive docs out of this starter.</p>
          <label>Bio<textarea name="bio" placeholder="What kind of work can you do?" /></label>
          <label>Skills<input name="skills" placeholder="dog walking, trash, tutoring" /></label>
          <label>School year<input name="school_year" placeholder="9th grade" /></label>
          <label style={{flexDirection:'row',alignItems:'center',gap:8}}>
            <input type="checkbox" name="guardian_approval_required" style={{width:'auto'}} /> Guardian approval required
          </label>
          <SubmitButton pendingLabel="Submitting…">Submit teen profile</SubmitButton>
        </form>

        <form action={submitBusinessVerification} className="card form">
          <div className="card-icon-tile blue">💼</div>
          <h3>Adult / business verification</h3>
          <p style={{fontSize:13,marginBottom:4}}>Adults should be approved before posting jobs.</p>
          <label>Business / display name<input name="business_name" required /></label>
          <label>Business type<input name="business_type" placeholder="homeowner, local shop, lawn care" required /></label>
          <label>Notes<textarea name="notes" placeholder="Explain who you are and what jobs you plan to post." /></label>
          <SubmitButton pendingLabel="Submitting…">Submit adult verification</SubmitButton>
        </form>

        <div className="card">
          <div className="card-icon-tile">🛡️</div>
          <h3>Guardian invite code</h3>
          <p style={{fontSize:13,marginBottom:12}}>Teen creates a one-time code. Copy it from the success message right after creation — the live backend stores only a hashed version after that.</p>
          <form action={createGuardianInvite} className="form">
            <label>Guardian email (optional)<input name="invite_email" type="email" placeholder="guardian@example.com" /></label>
            <SubmitButton pendingLabel="Creating…">Create invite code</SubmitButton>
          </form>
          {!!invites?.length && (
            <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:16}}>
              {invites.map((i: any) => (
                <div key={i.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:'10px 14px',border:'1px solid var(--border)',borderRadius:12,background:'var(--bg-sunken)'}}>
                  <span style={{fontSize:13,color:'var(--muted2)'}}>Invite created {i.invite_expires_at ? `· expires ${new Date(i.invite_expires_at).toLocaleDateString()}` : ''}</span>
                  <Status value={i.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <form action={acceptGuardianInvite} className="card form">
          <div className="card-icon-tile blue">🔗</div>
          <h3>Guardian accepts invite</h3>
          <label>Invite code<input name="invite_code" required placeholder="ABC123" style={{textTransform:'uppercase'}} /></label>
          <SubmitButton pendingLabel="Connecting…">Connect as guardian</SubmitButton>
        </form>
      </div>

      {!!biz?.length && (
        <section className="section">
          <h2>Business verification history</h2>
          <div className="card">
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Business</th><th>Type</th><th>Status</th></tr></thead>
                <tbody>
                  {biz.map((b: any) => (
                    <tr key={b.id}>
                      <td style={{fontWeight:600,color:'var(--text)'}}>{b.business_name}</td>
                      <td>{b.business_type}</td>
                      <td><Status value={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
