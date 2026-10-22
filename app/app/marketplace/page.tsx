import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { centsToDollars } from '@/lib/money'
import { applyToJob, saveJob } from '../teen/actions'
import { SubmitButton } from '@/components/submit-button'

export const dynamic = 'force-dynamic'

const CATEGORIES = ['All jobs', 'Pet care', 'Outdoor', 'Tutoring', 'Cleaning', 'Errands']

function getCategoryFilter(label: string) {
  const filters: Record<string, string> = {
    'Pet care': 'dog walking',
    Outdoor: 'lawn care',
    Tutoring: 'tutoring',
    Cleaning: 'cleaning',
    Errands: 'errands',
  }
  return filters[label] || ''
}

function makeHref(q: string, category: string, jobId?: string) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  if (jobId) params.set('job', jobId)
  const query = params.toString()
  return query ? `/app/marketplace?${query}` : '/app/marketplace'
}

export default async function Marketplace({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const { supabase, profile } = await requireUser()
  const sp = await searchParams
  const q = (sp?.q || '').trim().slice(0, 80)
  const category = (sp?.category || '').trim().slice(0, 40)
  const selectedId = (sp?.job || '').trim()
  const role = profile?.role || 'none'

  let jobsQuery = supabase
    .from('jobs')
    .select('id,title,category,city,state,description,pay_label,pay_amount_cents,starts_at,teen_min_age,teen_max_age,requires_guardian_approval,status,created_at')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(60)

  if (category) {
    const safeCategory = category.replace(/[^a-zA-Z0-9\s-]/g, ' ').trim()
    if (safeCategory) jobsQuery = jobsQuery.ilike('category', `%${safeCategory}%`)
  }
  if (q) {
    const safeQuery = q.replace(/[^a-zA-Z0-9\s-]/g, ' ').trim()
    if (safeQuery) jobsQuery = jobsQuery.or(`title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`)
  }

  const { data: jobs, error } = await jobsQuery
  let selectedJob: any = null

  if (selectedId) {
    const result = await supabase
      .from('jobs')
      .select('id,title,category,city,state,description,pay_label,pay_amount_cents,starts_at,teen_min_age,teen_max_age,requires_guardian_approval,status,created_at')
      .eq('id', selectedId)
      .eq('status', 'open')
      .maybeSingle()
    selectedJob = result.data
  }

  const closeHref = makeHref(q, category)
  const detailHref = (id: string) => makeHref(q, category, id)

  return (
    <>
      <div className="marketplace-heading">
        <div>
          <div className="page-header-eyebrow">MORT marketplace</div>
          <h1>Good work starts nearby.</h1>
          <p className="marketplace-intro">Browse local opportunities with clear pay, age requirements, and safety expectations.</p>
        </div>
        <div className="marketplace-trust-note">
          <span className="marketplace-trust-mark" aria-hidden="true">✳</span>
          <div><strong>Local. Clear. Accountable.</strong><span>Private addresses and applicant records stay protected.</span></div>
        </div>
      </div>

      <form className="marketplace-search" action="/app/marketplace" method="get">
        <label className="marketplace-search-field">
          <span aria-hidden="true">⌕</span>
          <input name="q" type="search" placeholder="Search dog walking, tutoring, yard work…" defaultValue={q} aria-label="Search local jobs" />
        </label>
        <button className="btn primary" type="submit">Search jobs</button>
        {(q || category) && <Link href="/app/marketplace" className="btn ghost">Clear</Link>}
      </form>

      <nav className="marketplace-categories" aria-label="Filter jobs by category">
        {CATEGORIES.map((label) => {
          const value = getCategoryFilter(label)
          const active = label === 'All jobs' ? !category : category === value
          return (
            <Link
              key={label}
              href={makeHref(q, value)}
              className={`marketplace-category-chip ${active ? 'active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <div className={`marketplace-layout ${selectedId ? 'has-selected-job' : ''}`}>
        <section className="marketplace-feed" aria-label="Open local jobs">
          <div className="marketplace-results-heading">
            <div><h2>{category ? category : 'Open opportunities'}</h2><p>Public listings only · no private addresses</p></div>
            <span className="marketplace-result-count">{jobs?.length || 0} found</span>
          </div>

          {error && <div className="error" role="alert">We couldn’t load jobs right now. Refresh to try again.</div>}

          {!error && !jobs?.length ? (
            <div className="empty-state marketplace-empty">
              <div className="empty-icon" aria-hidden="true">⌕</div>
              <h3>No matching jobs yet</h3>
              <p>Try a different search or category. New local opportunities appear when eligible listings are open.</p>
              <Link href="/app/marketplace" className="btn ghost">Show all jobs</Link>
            </div>
          ) : (
            <div className="marketplace-job-list">
              {(jobs || []).map((job: any) => (
                <Link
                  key={job.id}
                  href={detailHref(job.id)}
                  scroll={false}
                  className={`marketplace-job-card ${selectedId === job.id ? 'selected' : ''}`}
                  aria-current={selectedId === job.id ? 'true' : undefined}
                >
                  <div className="marketplace-job-card-top">
                    <div><span className="marketplace-job-category">{job.category || 'Local help'}</span><h3>{job.title}</h3></div>
                    <span className="marketplace-job-pay">{job.pay_label || centsToDollars(job.pay_amount_cents)}</span>
                  </div>
                  <p className="marketplace-job-description">{job.description || 'Details will be shared in the listing.'}</p>
                  <div className="marketplace-job-meta">
                    <span>{[job.city, job.state].filter(Boolean).join(', ') || 'Local area'}</span>
                    <span>Ages {job.teen_min_age ?? 13}–{job.teen_max_age ?? 17}</span>
                    {job.requires_guardian_approval && <span>Guardian approval may be required</span>}
                  </div>
                  <div className="marketplace-job-card-footer"><span>View job details</span><span aria-hidden="true">↗</span></div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {selectedId && (
          <aside className="marketplace-detail-panel" aria-label="Selected job details">
            <div className="marketplace-panel-header">
              <span>JOB DETAILS</span>
              <Link href={closeHref} scroll={false} className="marketplace-close" aria-label="Close job details">×</Link>
            </div>

            {!selectedJob ? (
              <div className="marketplace-unavailable">
                <h2>Listing unavailable</h2>
                <p>This job may have closed or been removed. No private information is shown.</p>
                <Link href={closeHref} scroll={false} className="btn primary">Back to marketplace</Link>
              </div>
            ) : (
              <>
                <span className="marketplace-job-category">{selectedJob.category || 'Local help'}</span>
                <h2 className="marketplace-detail-title">{selectedJob.title}</h2>
                <div className="marketplace-detail-pay">{selectedJob.pay_label || centsToDollars(selectedJob.pay_amount_cents)}</div>
                <div className="marketplace-detail-meta">
                  <span><b>Area</b>{[selectedJob.city, selectedJob.state].filter(Boolean).join(', ') || 'Local area'}</span>
                  <span><b>Age range</b>Ages {selectedJob.teen_min_age ?? 13}–{selectedJob.teen_max_age ?? 17}</span>
                  <span><b>Schedule</b>{selectedJob.starts_at ? new Date(selectedJob.starts_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Flexible — confirm with the poster'}</span>
                </div>
                <div className="divider" />
                <h3 className="marketplace-section-title">About this job</h3>
                <p className="marketplace-detail-description">{selectedJob.description || 'The poster has not added a description yet.'}</p>

                {selectedJob.requires_guardian_approval && (
                  <div className="marketplace-safety-note"><strong>Guardian approval</strong><span>Your guardian may need to approve this application before next steps unlock.</span></div>
                )}

                <div className="marketplace-safety-note"><strong>Keep it safe</strong><span>Review the task and pay before applying. Keep communication on MORT, and report anything that feels wrong.</span></div>

                {role === 'teen' ? (
                  <div className="marketplace-application">
                    <h3>Apply for this job</h3>
                    <p>Introduce yourself briefly. Eligibility and any required guardian approval are checked by MORT’s application flow.</p>
                    <form action={applyToJob} className="marketplace-application-form">
                      <input type="hidden" name="job_id" value={selectedJob.id} />
                      <input type="hidden" name="return_to" value="marketplace" />
                      <label>Short introduction
                        <textarea name="note" maxLength={500} rows={4} placeholder="Share relevant experience or why you’re a good fit." />
                      </label>
                      <label className="marketplace-check"><input type="checkbox" name="availability_confirmed" required /><span>I can make the listed time or will confirm the schedule before accepting.</span></label>
                      <label className="marketplace-check"><input type="checkbox" name="terms_confirmed" required /><span>I reviewed the job details and MORT’s safety guidance.</span></label>
                      <div className="marketplace-submit-row"><SubmitButton full size="lg" pendingLabel="Submitting…">Submit application</SubmitButton></div>
                    </form>
                    <form action={saveJob} className="marketplace-save-form">
                      <input type="hidden" name="job_id" value={selectedJob.id} />
                      <input type="hidden" name="return_to" value="marketplace" />
                      <SubmitButton full variant="ghost" pendingLabel="Saving…">Save for later</SubmitButton>
                    </form>
                  </div>
                ) : (
                  <div className="marketplace-permission-note">
                    <strong>Public listing view</strong>
                    <span>Applicant names, profiles, and applications remain private. Adults can review applicants only for jobs they are authorized to manage.</span>
                  </div>
                )}

                <Link href={`/app/reports/new?target_job_id=${encodeURIComponent(selectedJob.id)}`} className="marketplace-report-link">Report this listing</Link>
              </>
            )}
          </aside>
        )}
      </div>
    </>
  )
}
