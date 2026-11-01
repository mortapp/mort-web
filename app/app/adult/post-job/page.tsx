import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, Status } from '@/components/ui'
import { postJob } from '../actions'
import { Toast } from '@/components/toast'
import { SubmitButton } from '@/components/submit-button'
import { CategoryPicker } from '@/components/category-picker'
export const dynamic = 'force-dynamic'

export default async function PostJob({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const { supabase, profile } = await requireRole(['adult'])
  const sp = await searchParams
  const isApproved = profile?.verification_status === 'approved'
  const { data: runtime, error: runtimeError } = await supabase.rpc('get_runtime_feature_status')
  const canPublish = isApproved && !runtimeError && runtime?.new_job_publishing_disabled === false && runtime?.public_marketplace_closed === false && runtime?.maintenance_mode === false

  return (
    <>
      <PageHeaderWithActions
        title="Post a job"
        eyebrow="Adult / business"
        description="Create a local job listing for teens in your area."
      >
        <Status value={profile?.verification_status} />
      </PageHeaderWithActions>

      <Toast message={sp?.message} />

      {!canPublish && (
        <div className="warning-box" style={{marginBottom:20}}>
          <strong>⚠️ Job publishing is currently unavailable</strong>
          <p style={{marginTop:6,fontSize:14}}>{runtimeError || !runtime?.ok ? 'MORT could not verify production publishing status. No job can be submitted until the release controls are available.' : runtime?.new_job_publishing_disabled || runtime?.public_marketplace_closed || runtime?.maintenance_mode ? 'MORT has publishing disabled while production verification and safety release gates are completed.' : 'Adult identity verification must be approved before publishing. The production verification provider is not currently available.'} <a href="/app/verify" style={{color:'var(--warning)',fontWeight:600}}>View verification status →</a></p>
        </div>
      )}

      <div className="grid two" style={{gap:24,alignItems:'start'}}>
        <form action={postJob} className="card form">
          <h3 style={{marginBottom:20}}>Job details</h3>
          <div className="grid two">
            <label>
              Job title
              <input name="title" required placeholder="Dog walking, Lawn mowing..." />
            </label>
            <label style={{gridColumn:'1 / -1'}}>
              Category
              <CategoryPicker name="category" defaultValue="pet_care" />
            </label>
            <label>
              Job pay (USD · minimum $10)
              <input name="pay_amount" placeholder="20" type="number" min="10" max="10000" step="0.01" required />
            </label>
            <label>
              Pay label
              <input name="pay_label" placeholder="$20 cash after job" />
            </label>
            <label>
              City
              <input name="city" defaultValue={profile?.city||''} required />
            </label>
            <label>
              State
              <input name="state" defaultValue={profile?.region||''} required />
            </label>
            <label>
              Neighborhood / general area
              <input name="location_text" placeholder="Broad Ripple, west side..." maxLength={80} />
            </label>
            <label>
              Start date/time
              <input type="datetime-local" name="starts_at" />
            </label>
            <label>
              Min teen age
              <input name="teen_min_age" type="number" min="13" max="17" defaultValue="13" />
            </label>
            <label>
              Max teen age
              <input name="teen_max_age" type="number" min="13" max="17" defaultValue="17" />
            </label>
          </div>
          <label>
            Job description
            <textarea name="description" required placeholder="Describe the job, what's needed, how long it takes, any special requirements..." />
          </label>
          <label style={{flexDirection:'row',alignItems:'center',gap:10,cursor:'pointer'}}>
            <input type="checkbox" name="requires_guardian_approval" style={{width:'auto'}} />
            <span>Require guardian approval for teen applicants</span>
          </label>
          <SubmitButton full size="lg" pendingLabel="Publishing…" disabled={!canPublish}>
            Publish job listing
          </SubmitButton>
        </form>

        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="card highlight">
            <h3 style={{marginBottom:12}}>📋 Posting guidelines</h3>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {[
                'Be specific about what the job involves',
                'Set a fair pay rate for the work',
                'Include a neighborhood or general area only — never a street address',
                'Specify if guardian approval is needed',
                'Only post jobs you genuinely need help with',
              ].map(item => (
                <div key={item} style={{display:'flex',alignItems:'flex-start',gap:8,fontSize:13,color:'var(--muted2)'}}>
                  <span style={{color:'var(--green)',marginTop:2}}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 style={{marginBottom:8}}>💳 Payment</h3>
            <p style={{fontSize:14}}>MORT does not process, move, hold, guarantee, or enforce payments. Users may record a payment preference such as cash, Cash App, a Square link, flexible, or none. Set a clear pay label so teens know what to expect.</p>
          </div>
          <div className="card danger-card">
            <h3 style={{marginBottom:8}}>⚠️ Prohibited jobs</h3>
            <p style={{fontSize:14}}>Jobs involving alcohol, tobacco, adult content, dangerous equipment, or anything illegal are strictly prohibited and will be removed.</p>
          </div>
        </div>
      </div>
    </>
  )
}
