import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, Status } from '@/components/ui'
import { setTeenPaused } from './actions'
import { SubmitButton } from '@/components/submit-button'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

// Guardian dashboard, aligned with the production schema:
// - connections: guardian_links (guardian_user_id) joined to teen profiles
// - teen applications: job_applications (applicant_id = connected teens)
// - safety pings: safety_pings (teen_id = connected teens)
// Guardian approval of jobs is standing consent through the active link;
// the adult's acceptance enforces it (mort_accept_job_application).
export default async function Guardian({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase, user } = await requireRole(['guardian','admin'])

  const { data: connections } = await supabase
    .from('guardian_links')
    .select('*, profiles!guardian_links_teen_user_id_fkey(display_name, username, city, region, verification_status, account_status, guardian_paused)')
    .eq('guardian_user_id', user.id)
    .order('created_at', { ascending: false })

  const teenIds = (connections || []).map((c: any) => c.teen_user_id)

  const { data: apps } = teenIds.length
    ? await supabase.from('job_applications')
        .select('*, jobs(title, category, city, region, pay_label, requires_guardian_approval), profiles!job_applications_applicant_id_fkey(display_name)')
        .in('applicant_id', teenIds)
        .order('created_at', { ascending: false })
        .limit(20)
    : { data: [] }

  const { data: pings } = teenIds.length
    ? await supabase.from('safety_pings').select('*').in('teen_id', teenIds).order('created_at',{ascending:false}).limit(30)
    : { data: [] }

  const needsHelp = (pings || []).filter((p: any) => p.status === 'needs_help')
  const guardianPendingApps = (apps || []).filter(
    (a: any) => a.jobs?.requires_guardian_approval && ['submitted', 'shortlisted'].includes(a.status)
  )

  return (
    <>
      <PageHeaderWithActions
        title="Guardian Mode"
        eyebrow="Optional oversight"
        description="Monitor your teen's safety, applications, and job activity."
      >
        <Link href="/app/verify" className="btn primary">Connect a teen</Link>
      </PageHeaderWithActions>

      <Toast message={sp?.message} />

      {needsHelp.length > 0 && (
        <div className="sos-card" style={{ marginBottom: 24, textAlign: 'left' }}>
          <h3 style={{ color: 'var(--red)', marginBottom: 10 }}>🚨 Recent &ldquo;needs help&rdquo; pings</h3>
          {needsHelp.slice(0, 5).map((p: any) => (
            <div key={p.id} style={{ fontSize: 13, marginBottom: 6 }}>
              {new Date(p.created_at).toLocaleString()} {p.note ? `— ${p.note}` : ''}
            </div>
          ))}
          <p style={{ marginTop: 10, fontSize: 12.5 }}>If your teen may be in immediate danger, call emergency services first — MORT is not a substitute for 911.</p>
        </div>
      )}

      {/* Applications on jobs that require guardian approval — informational.
          Guardian approval is standing consent through the active link. */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>⏳ Applications needing guardian approval ({guardianPendingApps.length})</h3>
        {!guardianPendingApps.length ? (
          <div className="card">
            <p style={{ fontSize: 13 }}>
              No applications on guardian-approval jobs right now. Your active link is the standing approval the adult&rsquo;s acceptance checks.
            </p>
          </div>
        ) : (
          <div className="grid two">
            {guardianPendingApps.map((a: any) => (
              <div className="card" key={a.id}>
                <h4 style={{fontSize:15,marginBottom:6}}>{a.jobs?.title || 'Job'}</h4>
                <p style={{fontSize:12,color:'var(--muted)',marginBottom:8}}>
                  {a.profiles?.display_name || 'Your teen'} · {[a.jobs?.city, a.jobs?.region].filter(Boolean).join(', ')} · {a.jobs?.pay_label || ''}
                </p>
                <Status value={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connected teens */}
      <div style={{marginBottom:24}}>
        <h3 style={{marginBottom:16}}>Connected teens ({connections?.length || 0})</h3>
        {!connections?.length ? (
          <div className="empty-state">
            <div className="empty-icon">🛡️</div>
            <h3>No teens connected</h3>
            <p>Ask your teen to generate an invite code from their Verification page, then enter it here.</p>
            <Link href="/app/verify" className="btn primary" style={{marginTop:16,display:'inline-flex'}}>Connect a teen</Link>
          </div>
        ) : (
          <div className="grid three">
            {connections.map((c: any) => {
              const teenProfile = c.profiles || {}
              const paused = !!teenProfile.guardian_paused
              return (
                <div className="person-card" key={c.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div className="avatar-tile">{(teenProfile.display_name || '?').charAt(0).toUpperCase()}</div>
                    <div className="person-card-body">
                      <div className="person-card-top-row">
                        <h3 style={{fontSize:15}}>{teenProfile.display_name || 'Connected teen'}</h3>
                      </div>
                      <p style={{fontSize:12,color:'var(--muted)'}}>{[teenProfile.city, teenProfile.region].filter(Boolean).join(', ')}</p>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:6}}>
                        <Status value={c.status} />
                        <Status value={teenProfile.verification_status} />
                        {paused && <span className="status red">Paused</span>}
                      </div>
                    </div>
                  </div>
                  <form style={{ marginTop: 12 }}>
                    <input type="hidden" name="teen_id" value={c.teen_user_id} />
                    <input type="hidden" name="paused" value={paused ? 'false' : 'true'} />
                    <SubmitButton
                      formAction={setTeenPaused}
                      variant={paused ? 'safe' : 'danger'}
                      size="sm"
                      full
                      pendingLabel={paused ? 'Resuming…' : 'Pausing…'}
                    >
                      {paused ? '▶ Resume account' : '⏸ Pause account'}
                    </SubmitButton>
                  </form>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent applications */}
      {apps && apps.length > 0 && (
        <div className="card" style={{marginBottom:24}}>
          <h3 style={{marginBottom:16}}>📋 Recent applications</h3>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Pay</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a: any) => (
                  <tr key={a.id}>
                    <td style={{fontWeight:600}}>{a.jobs?.title}</td>
                    <td>{a.jobs?.category}</td>
                    <td style={{color:'var(--muted2)',fontSize:13}}>{a.jobs?.city}, {a.jobs?.region}</td>
                    <td style={{color:'var(--rose-gold)',fontWeight:700}}>{a.jobs?.pay_label}</td>
                    <td><Status value={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Safety pings */}
      <div className="card">
        <h3 style={{marginBottom:16}}>🛡️ Safety pings</h3>
        {!pings?.length ? (
          <div style={{textAlign:'center',padding:'32px 0',color:'var(--muted)'}}>
            <div style={{fontSize:32,marginBottom:8}}>📡</div>
            <p>No safety pings yet from connected teens.</p>
          </div>
        ) : (
          <div className="timeline">
            {pings.map((p: any) => {
              const dotCls = p.status === 'ok' ? 'ok' : p.status === 'needs_help' ? 'bad' : 'warn'
              return (
                <div key={p.id} className="timeline-item">
                  <div className={`timeline-dot ${dotCls}`} />
                  <div className="timeline-content">
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                      <Status value={p.status} />
                      {p.note && <span style={{fontSize:13,color:'var(--muted2)'}}>{p.note}</span>}
                    </div>
                    <div className="timeline-time">{new Date(p.created_at).toLocaleString()}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
