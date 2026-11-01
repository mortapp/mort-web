import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions, Status, XPBar } from '@/components/ui'
import { Toast } from '@/components/toast'
import { AppearanceCard } from '@/components/appearance-card'
export const dynamic = 'force-dynamic'

function getLevelInfo(xp: number) {
  if (xp < 100) return { level: 1, name: 'Getting started', next: 100 }
  if (xp < 300) return { level: 2, name: 'Building momentum', next: 300 }
  if (xp < 600) return { level: 3, name: 'Growing locally', next: 600 }
  if (xp < 1000) return { level: 4, name: 'Established', next: 1000 }
  return { level: 5, name: 'Experienced', next: 1000 }
}

export default async function Profile({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const { profile, user } = await requireUser()
  const sp = await searchParams
  const xp = profile?.xp_points || 0
  const lvl = getLevelInfo(xp)



  return (
    <>
      <PageHeaderWithActions
        title="Profile"
        eyebrow="Your account"
        description={user.email || ''}
      >
        <Status value={profile?.verification_status} />
      </PageHeaderWithActions>

      <Toast message={sp?.message} />

      <div className="grid two" style={{gap:24,alignItems:'start'}}>
        <section className="card profile-details-card">
          <div className="section-heading-row"><div><h3>Account details</h3><p>Private details for your signed-in account.</p></div><span className="status muted">Read only</span></div>
          <dl className="profile-detail-list">
            <div><dt>Display name</dt><dd>{profile?.display_name || 'Not set'}</dd></div>
            <div><dt>Username</dt><dd>{profile?.username ? `@${profile.username}` : 'Not set'}</dd></div>
            <div><dt>City</dt><dd>{profile?.city || 'Not set'}</dd></div>
            <div><dt>State / region</dt><dd>{profile?.region || 'Not set'}</dd></div>
            <div><dt>Email</dt><dd>{user.email || 'Not available'}</dd></div>
            <div><dt>Account type</dt><dd style={{textTransform:'capitalize'}}>{profile?.role || 'Not set'}</dd></div>
          </dl>
          <p className="muted" style={{marginTop:16}}>Profile editing is temporarily unavailable because the production backend does not expose a supported profile-update operation. Your date of birth and account role are protected from self-service changes.</p>
        </section>

        {/* Stats & badges */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <AppearanceCard />
          <div className="card">
            <h3 style={{marginBottom:16}}>Hustle progress</h3>
            <XPBar current={xp} max={lvl.next} level={lvl.level} levelName={lvl.name} />
          </div>

          <div className="card">
            <h3 style={{marginBottom:12}}>Progress</h3>
            <p style={{fontSize:13}}>Your recorded XP is shown above. Challenge tracking and badge rewards are not active in production yet.</p>
          </div>

          <div className="card">
            <h3 style={{marginBottom:12}}>Account info</h3>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                <span style={{color:'var(--muted)'}}>Email</span>
                <span>{user.email}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                <span style={{color:'var(--muted)'}}>Role</span>
                <span style={{textTransform:'capitalize'}}>{profile?.role || 'not set'}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                <span style={{color:'var(--muted)'}}>Verification</span>
                <Status value={profile?.verification_status} />
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                <span style={{color:'var(--muted)'}}>XP Points</span>
                <span style={{color:'var(--yellow)',fontWeight:700}}>{xp}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
