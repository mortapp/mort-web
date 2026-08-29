import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, Status, ApplicationCard } from '@/components/ui'
import { approveApplication, rejectApplication, setTeenPaused } from './actions'
import { SubmitButton } from '@/components/submit-button'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function Guardian({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const { supabase, user } = await requireRole(['guardian','admin'])
  const { data: connections } = await supabase
    .from('guardian_connections')
    .select('*, profiles!guardian_connections_teen_id_fkey(display_name, username, city, state, xp_points, verification_status)')
    .eq('guardian_id', user.id)

  const teenIds = (connections || []).map((c: any) => c.teen_id)

  const { data: teenProfiles } = teenIds.length
    ? await supabase.from('teen_profiles').select('user_id, paused_by_guardian').in('user_id', teenIds)
    : { data: [] }
  const pausedByTeenId: Record<string, boolean> = {}
  for (const tp of teenProfiles || []) pausedByTeenId[tp.user_id] = !!tp.paused_by_guardian

  const { data: pendingApps } = teenIds.length
    ? await supabase.from('applications').select('*, jobs(title, category, city, state, pay_label), profiles(display_name)').in('teen_id', teenIds).eq('status', 'guardian_pending').order('created_at', { ascending: false })
    : { data: [] }

  const { data: pings } = teenIds.length
    ? await supabase.from('safety_pings').select('*').in('teen_id', teenIds).order('created_at', {ascending:false}).limit(30)
    : { data: [] }

  const { data: apps } = teenIds.length
    ? await supabase.from('applications').select('*, jobs(title, category, city, state, pay_label)').in('teen_id', teenIds).order('created_at', {ascending:false}).limit(20)
    : { data: [] }

  const needsHelp = (pings || []).filter((p: any) => p.status === 'needs_help')

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
          <h3 style={{ color: 'var(--red)', marginBottom: 10 }}>🚨 Recent &quot;needs help&quot; pings</h3>
          {needsHelp.slice(0, 5).map((p: any) => (
            <div key={p.id} style={{ fontSize: 13, marginBottom: 6 }}>
              {new Date(p.created_at).toLocaleString()} {p.note ? `— ${p.note}` : ''}
            </div>
          ))}
          <p style={{ marginTop: 10, fontSize: 12.5 }}>If your teen may be in immediate danger, call emergency services first — MORT is not a substitute for 911.</p>
        </div>
      )}

      {/* Pending approvals */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>⏳ Pending approvals ({pendingApps?.length || 0})</h3>
        {!pendingApps?.length ? (
          <div className="card">
            <p style={{ fontSize: 13 }}>No applications are waiting on your approval right now.</p>
          </div>
        ) : (
          <div className="grid two">
            {pendingApps.map((a: any) => (
              <ApplicationCard
                key={a.id}
                title={a.jobs?.title || 'Job'}
                subtitle={`${a.profiles?.display_name || 'Your teen'} · ${[a.jobs?.city, a.jobs?.state].filter(Boolean).join(', ')} · ${a.jobs?.pay_label || ''}`}
                note={a.note}
                status={a.status}
              >
                <form className="row-actions" style={{ marginTop: 4 }}>
                  <input type="hidden" name="application_id" value={a.id} />
                  <SubmitButton formAction={approveApplication} size="sm" pendingLabel="Approving…">Approve</SubmitButton>
                  <SubmitButton formAction={rejectApplication} variant="danger" size="sm" pendingLabel="Rejecting…">Reject</SubmitButton>
                </form>
              </ApplicationCard>
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
              const paused = pausedByTeenId[c.teen_id]
              return (
                <div className="person-card" key={c.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div className="avatar-tile">{(c.profiles?.display_name || '?').charAt(0).toUpperCase()}</div>
                    <div className="person-card-body">
                      <div className="person-card-top-row">
                        <h3 style={{fontSize:15}}>{c.profiles?.display_name || 'Connected teen'}</h3>
                      </div>
                      <p style={{fontSize:12,color:'var(--muted)'}}>{[c.profiles?.city, c.profiles?.state].filter(Boolean).join(', ')}</p>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:6}}>
                        <Status value={c.status} />
                        <Status value={c.profiles?.verification_status} />
                        {paused && <span className="status red">Paused</span>}
                      </div>
                      {c.profiles?.xp_points !== undefined && (
                        <div style={{fontSize:11,color:'var(--muted)',marginTop:4}}>⚡ {c.profiles.xp_points} XP earned</div>
                      )}
                    </div>
                  </div>
                  <form style={{ marginTop: 12 }}>
                    <input type="hidden" name="teen_id" value={c.teen_id} />
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
                    <td style={{color:'var(--muted2)',fontSize:13}}>{a.jobs?.city}, {a.jobs?.state}</td>
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
                      <span style={{fontSize:12,color:'var(--muted)',fontFamily:'monospace'}}>{p.teen_id.slice(0,8)}...</span>
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
