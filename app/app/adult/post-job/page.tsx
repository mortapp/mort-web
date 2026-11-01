import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, Status } from '@/components/ui'
import { postJob } from '../actions'
import { Toast } from '@/components/toast'
import { SubmitButton } from '@/components/submit-button'
import { CategoryPicker } from '@/components/category-picker'
import { productionCapabilities } from '@/lib/production-capabilities'
export const dynamic = 'force-dynamic'

export default async function PostJob({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const { supabase, profile } = await requireRole(['adult'])
  const sp = await searchParams
  const allowedCategories = ['yard_work', 'pet_care', 'tutoring', 'household_help', 'moving_help', 'tech_help', 'other']
  const defaultCategory = allowedCategories.includes(sp?.category || '') ? sp?.category : 'pet_care'
  const isApproved = profile?.verification_status === 'approved'
  const { data: runtime, error: runtimeError } = await supabase.rpc('get_runtime_feature_status')
  const canPublish = isApproved && !runtimeError && runtime?.new_job_publishing_disabled === false && runtime?.public_marketplace_closed === false && runtime?.maintenance_mode === false && runtime?.payments_disabled === false && productionCapabilities.perTaskGuardianApproval

  return (
    <>
      <PageHeaderWithActions
        title="Post a job"
        eyebrow="Adult / business"
        description="Prepare job details for review when all production safeguards are available."
      >
        <Status value={profile?.verification_status} />
      </PageHeaderWithActions>

      <Toast message={sp?.message} />

      {!canPublish && (
        <div className="warning-box" style={{marginBottom:20}}>
          <strong>⚠️ Job publishing is currently unavailable</strong>
          <p style={{marginTop:6,fontSize:14}}>{runtimeError || !runtime?.ok ? 'MORT could not verify production publishing status. No job can be submitted until the release controls are available.' : runtime?.new_job_publishing_disabled || runtime?.public_marketplace_closed || runtime?.maintenance_mode || runtime?.payments_disabled || !productionCapabilities.perTaskGuardianApproval ? 'MORT has publishing disabled until production verification, payment funding, and the per-Task Guardian approval workflow are available.' : 'Adult identity verification must be approved before publishing. The production verification provider is not currently available.'} <a href="/app/verify" style={{color:'var(--warning)',fontWeight:600}}>View verification status →</a></p>
        </div>
      )}

      <div className="grid two" style={{gap:24,alignItems:'start'}}>
        <form action={postJob} className="card form">
          <h3 style={{marginBottom:20}}>Job details</h3>
          <div className="grid two">
            <label>
              Job title
              <input name="title" required minLength={5} maxLength={120} placeholder="Dog walking, Lawn mowing..." />
            </label>
            <label style={{gridColumn:'1 / -1'}}>
              Category
              <CategoryPicker key={defaultCategory} name="category" defaultValue={defaultCategory} />
            </label>
            <label>
              Job pay (USD · minimum $10)
              <input name="pay_amount" placeholder="20" type="number" min="10" max="10000" step="0.01" required />
            </label>
            <label>
              City
              <input name="city" defaultValue={profile?.city||''} required />
            </label>
            <label>
              State
              <input name="state" defaultValue={profile?.region||''} required maxLength={2} pattern="[A-Za-z]{2}" />
            </label>
            <label>
              Neighborhood / general area
              <input name="location_text" placeholder="Broad Ripple, west side..." maxLength={80} />
            </label>
            <label>
              Start date/time
              <input type="datetime-local" name="starts_at" />
              <span className="small">Start times use Indianapolis local time.</span>
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
            <textarea name="description" required minLength={20} maxLength={5000} placeholder="Describe the job, what is needed, how long it takes, and any special requirements..." />
          </label>
          <div className="notice"><strong>Private-residence work is not supported yet.</strong><p>MORT&apos;s published Safety Rules require specific Guardian approval for each Task at a private residence and a second adult for work inside. The production website does not yet have that approval workflow.</p></div>
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
                'Do not post residential work until the per-Task Guardian approval workflow is available',
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
            <p style={{fontSize:14}}>MORT payment processing and payouts are disabled. Published MORT Terms require payments through the approved provider; do not request cash, Cash App, or other off-platform payment.</p>
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
