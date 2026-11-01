import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, Status, EmptyState } from '@/components/ui'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function Guardian({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const { supabase, user } = await requireRole(['guardian'])
  const { data: links, error: linksError } = await supabase.from('guardian_links')
    .select('id, teen_user_id, status, teen_consent_at, guardian_consent_at, updated_at')
    .eq('guardian_user_id', user.id).eq('status', 'active').order('updated_at', { ascending: false })
  const teenIds = (links || []).filter((link: any) => link.teen_consent_at && link.guardian_consent_at).map((link: any) => link.teen_user_id)
  const teens = (links || []).filter((link: any) => link.teen_consent_at && link.guardian_consent_at)
  const [{ data: pingRows, error: pingError }, { data: appResult, error: appError }] = await Promise.all([
    teenIds.length ? supabase.from('safety_pings').select('id, teen_id, status, note, created_at').in('teen_id', teenIds).order('created_at', { ascending: false }).limit(30) : Promise.resolve({ data: [] as any[] }),
    supabase.rpc('get_my_job_applications', { p_application_id: null }),
  ])
  const applications = Array.isArray(appResult?.items) ? appResult.items.filter((item: any) => teenIds.includes(item.teen_id)) : []
  const needsHelp = (pingRows || []).filter((ping: any) => ping.status === 'needs_help')

  return (
    <>
      <PageHeaderWithActions title="Guardian Mode" eyebrow="Optional oversight" description="Review supported updates for teens who have actively connected and consented to Guardian Mode.">
        <Link href="/app/verify" className="btn">Guardian connections</Link>
      </PageHeaderWithActions>
      <Toast message={sp?.message} />
      {linksError && <div className="error">Guardian connections could not be loaded.</div>}
      {needsHelp.length > 0 && <div className="sos-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 10 }}>Help requests from connected teens</h3>
        {needsHelp.slice(0, 5).map((ping: any) => <p key={ping.id} style={{ fontSize: 13, marginBottom: 8 }}>{new Date(ping.created_at).toLocaleString()} · {ping.note || 'A teen requested help.'}</p>)}
        <p style={{ marginTop: 10, fontSize: 12 }}>MORT notifications are not emergency response. If someone may be in immediate danger, contact emergency services.</p>
      </div>}
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14 }}>Connected teens ({teens?.length || 0})</h3>
        {!teens?.length ? <EmptyState icon="shield" title="No active Guardian connections" text="Guardian Mode is optional. A teen must invite you, and both people must consent before a connection becomes active." href="/app/verify" action="Open Guardian connections" /> : (
          <div className="grid three">{teens.map((teen: any) => <div className="person-card card" key={teen.id}>
            <div className="avatar-tile">{(teen.display_name || '?').charAt(0).toUpperCase()}</div>
            <div className="person-card-body"><h3>Connected teen</h3><p>Active, mutually consented Guardian connection</p></div>
          </div>)}</div>
        )}
      </section>
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14 }}>Recent applications</h3>
        {appError && <div className="error">Application updates could not be loaded.</div>}
        {!applications.length ? <div className="card"><p>No applications are visible for active Guardian connections.</p></div> : <div className="grid two">
          {applications.slice(0, 20).map((item: any) => <div className="card" key={item.id}><h4>{item.jobs?.title || 'Job application'}</h4><p style={{ fontSize: 13, color: 'var(--muted2)' }}>{item.teen?.display_name || 'Connected teen'} · {[item.jobs?.city, item.jobs?.state].filter(Boolean).join(', ')}</p><Status value={item.status} /></div>)}
        </div>}
      </section>
      <section className="card">
        <h3 style={{ marginBottom: 14 }}>Recent help requests</h3>
        {pingError && <div className="error">Help-request history could not be loaded.</div>}
        {!pingRows?.length ? <p>No help requests recorded for connected teens.</p> : <div className="timeline">{pingRows.map((ping: any) => <div className="timeline-item" key={ping.id}><div className="timeline-dot bad" /><div className="timeline-content"><Status value={ping.status} />{ping.note && <p>{ping.note}</p>}<div className="timeline-time">{new Date(ping.created_at).toLocaleString()}</div></div></div>)}</div>}
      </section>
    </>
  )
}