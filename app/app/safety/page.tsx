import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions, Status } from '@/components/ui'
import { safetyPing } from '../teen/actions'
import { SubmitButton } from '@/components/submit-button'
import Link from 'next/link'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function Safety({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase, user } = await requireUser()
  const { data: pings } = await supabase.from('safety_pings').select('*').eq('teen_id', user.id).order('created_at', {ascending:false}).limit(20)

  return (
    <>
      <PageHeaderWithActions
        title="Safety center"
        eyebrow="Check-ins + emergency"
        description="Your safety tools. Use these during every job."
      />

      <Toast message={sp?.message} />

      <div className="emergency-disclaimer" style={{ marginBottom: 24 }}>
        ⚠️ <strong>MORT is not a replacement for calling 911 or local emergency services.</strong> If you or someone else is in immediate danger, call emergency services first — then use MORT to alert your guardian and MORT admins.
      </div>

      {/* Big SOS + Safe buttons */}
      <div className="grid two" style={{marginBottom:24,gap:16}}>
        <div className="sos-card">
          <div style={{fontSize:48,marginBottom:12}}>🚨</div>
          <h2 style={{fontSize:24,marginBottom:8,color:'var(--red)'}}>Need Help?</h2>
          <p style={{marginBottom:24,fontSize:15}}>Tap below to send an emergency ping to your guardian and MORT admin. Use this if you feel unsafe.</p>
          <form action={safetyPing}>
            <input type="hidden" name="status" value="needs_help" />
            <input type="hidden" name="note" value="SOS — I need help immediately." />
            <SubmitButton full variant="sos" size="lg" pendingLabel="Sending SOS…">
              🚨 SOS — I NEED HELP
            </SubmitButton>
          </form>
        </div>

        <div className="safe-card">
          <div style={{fontSize:48,marginBottom:12}}>✅</div>
          <h2 style={{fontSize:24,marginBottom:8,color:'var(--green)'}}>I&apos;m Safe</h2>
          <p style={{marginBottom:24,fontSize:15}}>Send a safety check-in to let your guardian know everything is okay on the job.</p>
          <form action={safetyPing}>
            <input type="hidden" name="status" value="ok" />
            <input type="hidden" name="note" value="I'm safe and okay." />
            <SubmitButton full variant="safe" size="lg" pendingLabel="Checking in…">
              ✅ I&apos;M SAFE
            </SubmitButton>
          </form>
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 24 }}>
        ℹ️ Safety pings are saved instantly so guardians and admins see them the next time they open MORT. Real-time push or SMS alerts are not implemented yet — see the README for details.
      </p>

      {/* Custom ping form */}
      <div className="grid two" style={{marginBottom:24}}>
        <div className="card">
          <h3 style={{marginBottom:16}}>📍 Send a custom check-in</h3>
          <form action={safetyPing} className="form">
            <label>
              Status
              <select name="status">
                <option value="ok">✅ I&apos;m okay</option>
                <option value="needs_help">🚨 I need help</option>
              </select>
            </label>
            <label>
              Note (optional)
              <textarea name="note" placeholder="I arrived. I started. I finished. Something felt off..." />
            </label>
            <SubmitButton full pendingLabel="Sending…">Send ping</SubmitButton>
          </form>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="card">
            <h3 style={{marginBottom:12}}>🚩 What gets flagged</h3>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[
                'Off-platform payment pressure',
                'Private address requests too early',
                'Grooming or inappropriate language',
                'Harassment or bullying',
                'Fake jobs or scam attempts',
                'Unsafe travel or location requests',
                'Threats of any kind',
              ].map(item => (
                <div key={item} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--muted2)'}}>
                  <span style={{color:'var(--danger)',fontSize:12}}>●</span> {item}
                </div>
              ))}
            </div>
          </div>
          <Link href="/app/reports/new" className="btn danger" style={{width:'100%',justifyContent:'center',padding:'14px',display:'flex'}}>
            ⚠️ Report a safety issue
          </Link>
        </div>
      </div>

      {/* Ping history */}
      <div className="card">
        <h3 style={{marginBottom:16}}>Recent safety pings</h3>
        {!pings?.length ? (
          <div style={{textAlign:'center',padding:'32px 0',color:'var(--muted)'}}>
            <div style={{fontSize:32,marginBottom:8}}>📡</div>
            <p>No pings sent yet. Use check-ins during every job.</p>
          </div>
        ) : (
          <div className="timeline">
            {pings.map((p: any) => {
              const dotCls = p.status === 'ok' ? 'ok' : p.status === 'needs_help' ? 'bad' : 'warn'
              return (
                <div key={p.id} className="timeline-item">
                  <div className={`timeline-dot ${dotCls}`} />
                  <div className="timeline-content">
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
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
