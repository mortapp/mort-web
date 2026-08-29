import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { centsToDollars } from '@/lib/money'
import { PageHeaderWithActions, Status, CategoryPill } from '@/components/ui'
import { applyToJob, saveJob } from '../../actions'
import { SubmitButton } from '@/components/submit-button'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function JobDetail({ params, searchParams }: { params: Promise<{id:string}>, searchParams?: Promise<Record<string,string>> }) {
  const { id } = await params
  const sp = await searchParams
  const { supabase } = await requireUser()
  const { data: job, error } = await supabase.from('jobs').select('*').eq('id', id).maybeSingle()

  if (error || !job) return (
    <div className="empty-state">
      <div className="empty-icon">❌</div>
      <h3>Job not found</h3>
      <p>This job may have been removed or is no longer available.</p>
      <Link href="/app/teen/jobs" className="btn primary" style={{marginTop:16,display:'inline-flex'}}>Back to jobs</Link>
    </div>
  )

  return (
    <>
      <PageHeaderWithActions
        title={job.title}
        eyebrow="Job detail"
        description={`${job.city}, ${job.state} · ${job.location_text}`}
      >
        <Link href="/app/teen/jobs" className="btn ghost">← Back to jobs</Link>
      </PageHeaderWithActions>

      <Toast message={sp?.message} />

      <div className="grid two" style={{gap:24,alignItems:'start'}}>
        {/* Job info */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="card">
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <CategoryPill category={job.category} />
              <Status value={job.status} />
              {job.requires_guardian_approval && <span className="pill green">🛡️ Guardian req.</span>}
            </div>

            <div style={{marginBottom:20}}>
              <h4 style={{marginBottom:4}}>Pay</h4>
              <span style={{fontSize:32,fontWeight:900,letterSpacing:'-0.04em',color:'var(--rose-gold)'}}>
                {job.pay_label || centsToDollars(job.pay_amount_cents)}
              </span>
            </div>

            <div style={{marginBottom:20}}>
              <h4 style={{marginBottom:8}}>Description</h4>
              <p style={{fontSize:15,lineHeight:1.7}}>{job.description}</p>
            </div>

            <div className="divider" />

            <div className="grid two" style={{gap:16}}>
              <div>
                <h4 style={{marginBottom:4}}>Location</h4>
                <p style={{fontSize:14}}>{job.city}, {job.state}</p>
                <p style={{fontSize:13,color:'var(--muted)'}}>{job.location_text}</p>
              </div>
              <div>
                <h4 style={{marginBottom:4}}>Age requirement</h4>
                <p style={{fontSize:14}}>Ages {job.teen_min_age}–{job.teen_max_age}</p>
              </div>
              {job.starts_at && (
                <div>
                  <h4 style={{marginBottom:4}}>Start time</h4>
                  <p style={{fontSize:14}}>{new Date(job.starts_at).toLocaleString()}</p>
                </div>
              )}
              <div>
                <h4 style={{marginBottom:4}}>Guardian approval</h4>
                <p style={{fontSize:14}}>{job.requires_guardian_approval ? '✅ Required' : '— Not required'}</p>
              </div>
            </div>
          </div>

          {/* Safety notice */}
          <div className="card info-card">
            <h4 style={{marginBottom:8}}>🛡️ Safety reminder</h4>
            <p style={{fontSize:13}}>Always check in when you arrive and when you finish. Never share personal contact info outside MORT. If anything feels wrong, use the SOS button.</p>
          </div>
        </div>

        {/* Apply panel */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="card highlight">
            <h3 style={{marginBottom:8}}>Apply for this job</h3>
            <p style={{fontSize:14,marginBottom:20}}>Write a short message to the adult. Tell them why you&apos;re a good fit.</p>
            <form action={applyToJob} className="form">
              <input type="hidden" name="job_id" value={job.id} />
              <label>
                Message to adult
                <textarea name="note" placeholder="I can do this job. I have experience with..." style={{minHeight:120}} />
              </label>
              <SubmitButton full size="lg" pendingLabel="Applying…">Apply for job</SubmitButton>
            </form>
          </div>

          <div className="card">
            <h3 style={{marginBottom:8}}>Save for later</h3>
            <p style={{fontSize:14,marginBottom:16}}>Not ready to apply? Save this job and come back to it.</p>
            <form action={saveJob}>
              <input type="hidden" name="job_id" value={job.id} />
              <SubmitButton full variant="ghost" pendingLabel="Saving…">🔖 Save job</SubmitButton>
            </form>
          </div>

          <div className="card">
            <h3 style={{marginBottom:8}}>⚠️ Report this job</h3>
            <p style={{fontSize:14,marginBottom:16}}>Something seem off? Report it to our admin team.</p>
            <Link href="/app/reports/new" className="btn danger" style={{width:'100%',justifyContent:'center',display:'flex'}}>
              Report job
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
