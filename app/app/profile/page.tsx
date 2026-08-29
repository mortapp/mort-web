import { requireUser } from '@/lib/auth'
import { saveProfile } from '@/app/app/actions'
import { PageHeaderWithActions, Status, XPBar, BadgeRow } from '@/components/ui'
import { Toast } from '@/components/toast'
import { SubmitButton } from '@/components/submit-button'
export const dynamic = 'force-dynamic'

function getLevelInfo(xp: number) {
  if (xp < 100) return { level: 1, name: 'New Hustler', next: 100 }
  if (xp < 300) return { level: 2, name: 'Trusted Helper', next: 300 }
  if (xp < 600) return { level: 3, name: 'Local Pro', next: 600 }
  if (xp < 1000) return { level: 4, name: 'Verified Hustler', next: 1000 }
  return { level: 5, name: 'MORT Elite', next: 1000 }
}

export default async function Profile({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const { profile, user } = await requireUser()
  const sp = await searchParams
  const xp = profile?.xp_points || 0
  const lvl = getLevelInfo(xp)

  const badges = [
    { icon: '🐕', label: 'Dog Walker', earned: false },
    { icon: '🌿', label: 'Lawn Helper', earned: false },
    { icon: '⚡', label: 'Fast Responder', earned: false },
    { icon: '⭐', label: '5-Star Worker', earned: false },
    { icon: '🛡️', label: 'Guardian Verified', earned: !!profile?.guardian_required },
    { icon: '✅', label: 'Safe Check-In', earned: false },
    { icon: '🌅', label: 'Weekend Warrior', earned: false },
    { icon: '🔥', label: 'First Hustle', earned: false },
  ]

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
        {/* Edit form */}
        <form action={saveProfile} className="card form">
          <h3 style={{marginBottom:20}}>Edit profile</h3>
          <div className="grid two">
            <label>
              Display name
              <input name="display_name" defaultValue={profile?.display_name || ''} placeholder="Your name" />
            </label>
            <label>
              Username
              <input name="username" defaultValue={profile?.username || ''} placeholder="@username" />
            </label>
            <label>
              City
              <input name="city" defaultValue={profile?.city || ''} placeholder="Indianapolis" />
            </label>
            <label>
              State
              <input name="state" defaultValue={profile?.state || ''} placeholder="IN" />
            </label>
            <label>
              Date of birth
              <input type="date" name="dob" defaultValue={profile?.dob || ''} />
            </label>
            <label>
              Role
              <input value={profile?.role || 'not chosen'} disabled style={{opacity:0.5,cursor:'not-allowed'}} />
            </label>
          </div>
          <SubmitButton full size="lg" pendingLabel="Saving…">Save profile</SubmitButton>
        </form>

        {/* Stats & badges */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="card">
            <h3 style={{marginBottom:16}}>Hustle progress</h3>
            <XPBar current={xp} max={lvl.next} level={lvl.level} levelName={lvl.name} />
          </div>

          <div className="card">
            <h3 style={{marginBottom:12}}>Badges</h3>
            <BadgeRow badges={badges} />
            <p style={{fontSize:12,color:'var(--muted)',marginTop:12}}>Complete jobs and challenges to earn badges.</p>
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
