import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, Status } from '@/components/ui'
import { safetyPing } from '../teen/actions'
import { SubmitButton } from '@/components/submit-button'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function Safety({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase, user } = await requireRole(['teen'])
  const { data: pings, error } = await supabase.from('safety_pings').select('*').eq('teen_id', user.id).order('created_at', { ascending: false }).limit(20)

  return (
    <>
      <PageHeaderWithActions title="Safety center" eyebrow="Help request" description="Use this to request help from an active linked guardian. MORT is not an emergency-response service." />
      <Toast message={sp?.message} />
      <div className="emergency-disclaimer" style={{ marginBottom: 24 }}>
        <strong>If you are in immediate danger, call 911 or local emergency services first.</strong> A MORT help request does not contact emergency services, notify admins, or transmit your live location.
      </div>
      <div className="sos-card" style={{ maxWidth: 640, marginBottom: 24 }}>
        <div style={{ fontSize: 42, marginBottom: 12 }}>SOS</div>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>I need help</h2>
        <p style={{ marginBottom: 20, fontSize: 14 }}>Submitting this request can create an in-app notification for an active linked guardian, depending on that guardian's alert preferences.</p>
        <form action={safetyPing}>
          <input type="hidden" name="status" value="needs_help" />
          <label style={{ display: 'block', marginBottom: 12 }}><input type="checkbox" name="immediate_danger" value="true" /> I am in immediate danger</label>
          <label style={{ display: 'block', marginBottom: 12 }}>Optional note<textarea name="note" maxLength={500} placeholder="Tell your guardian what kind of help you need." /></label>
          <SubmitButton full variant="sos" size="lg" pendingLabel="Sending help request…">Send help request</SubmitButton>
        </form>
      </div>
      {error && <div className="error">Your help-request history could not be loaded.</div>}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Recent help requests</h3>
        {!pings?.length ? <p style={{ color: 'var(--muted2)' }}>No help requests yet.</p> : (
          <div className="timeline">
            {pings.map((ping: any) => (
              <div key={ping.id} className="timeline-item">
                <div className="timeline-dot bad" />
                <div className="timeline-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Status value={ping.status} />{ping.note && <span>{ping.note}</span>}</div>
                  <div className="timeline-time">{new Date(ping.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}