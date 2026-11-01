import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { centsToDollars } from '@/lib/money'
import { PageHeaderWithActions, EmptyState, JobCard } from '@/components/ui'

export const dynamic = 'force-dynamic'

const categories = [
  ['yard_work', 'Yard work'], ['pet_care', 'Pet care'], ['tutoring', 'Tutoring'],
  ['household_help', 'Household help'], ['moving_help', 'Moving help'],
  ['tech_help', 'Tech help'], ['other', 'Other'],
] as const

export default async function Explore({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const params = await searchParams
  const query = (params?.q || '').trim().slice(0, 100)
  const category = categories.some(([value]) => value === params?.category) ? params?.category : null
  const { supabase } = await requireRole(['teen'])
  const { data: result, error } = await supabase.rpc('list_open_jobs_page', {
    p_keyword: query,
    p_category: category,
    p_limit: 60,
  })
  const jobs = result?.ok === true && Array.isArray(result.items) ? result.items : []
  const errorMessage = error?.message || (result?.ok === false ? result.code : null)

  return (
    <>
      <PageHeaderWithActions title="Explore local work" eyebrow="Find the right fit" description="Search approved listings and narrow the results by the kind of work you want to do. Exact addresses stay private.">
        <Link href="/app/teen/jobs" className="btn">Back to Home</Link>
      </PageHeaderWithActions>

      <form action="/app/teen/explore" className="card explore-filter-form" style={{ marginBottom: 24 }}>
        <label style={{ flex: 1, minWidth: 220 }}>Search
          <input name="q" defaultValue={query} maxLength={100} placeholder="Dog walking, tutoring, lawn care…" />
        </label>
        <label style={{ minWidth: 190 }}>Category
          <select name="category" defaultValue={category || ''}>
            <option value="">All categories</option>
            {categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
        <div className="row-actions">
          <button className="btn primary" type="submit">Search jobs</button>
          <Link className="btn ghost" href="/app/teen/explore">Clear</Link>
        </div>
      </form>

      <div className="explore-results-heading">
        <div><h3>{category ? categories.find(([value]) => value === category)?.[1] : 'Available listings'}</h3><p>{jobs.length} result{jobs.length === 1 ? '' : 's'}</p></div>
        <span className="small">Updated from MORT listings</span>
      </div>

      {errorMessage && <div className="error" role="status">{errorMessage === 'public_marketplace_disabled' ? 'The marketplace is temporarily unavailable while production safety requirements are completed.' : 'Listings could not be loaded. Please try again later.'}</div>}
      {!jobs.length ? (
        <EmptyState icon="search" title="No listings match yet" text={errorMessage ? 'Search is temporarily unavailable. Your account and saved work remain unchanged.' : 'Try a different keyword or category. New approved listings will appear here when publishing is enabled.'} href="/app/teen/jobs" action="Back to Home" />
      ) : (
        <div className="explore-job-list">
          {jobs.map((job: any) => <JobCard key={job.id} id={job.id} title={job.title} category={job.category} city={job.city} state={job.state} locationText={job.location_text} description={job.description} payLabel={job.pay_label || centsToDollars(job.pay_amount_cents)} status={job.status} requiresGuardianApproval={job.requires_guardian_approval} href={`/app/teen/jobs/${job.id}`} />)}
        </div>
      )}
    </>
  )
}
