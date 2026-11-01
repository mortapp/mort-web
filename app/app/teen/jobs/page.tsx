import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { centsToDollars } from '@/lib/money'
import { PageHeaderWithActions, EmptyState, JobCard, CategoryTile } from '@/components/ui'
export const dynamic = 'force-dynamic'

const FEATURED_CATEGORIES = [
  { value: 'pet_care', label: 'Pet care' },
  { value: 'yard_work', label: 'Yard work' },
  { value: 'tutoring', label: 'Tutoring' },
  { value: 'household_help', label: 'Household help' },
  { value: 'moving_help', label: 'Moving help' },
  { value: 'tech_help', label: 'Tech help' },
  { value: 'other', label: 'Other' },
]

export default async function Jobs({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const { supabase } = await requireRole(['teen'])
  const sp = await searchParams
  const category = sp?.category
  const q = sp?.q


  // Use the production marketplace RPC so release controls are enforced
  // server-side. Direct table reads do not consult the marketplace kill switch.
  const { data: jobResult, error } = await supabase.rpc('list_open_jobs_page', {
    p_keyword: q || '',
    p_category: category || null,
    p_limit: 60,
  })
  const jobs = jobResult?.ok === true && Array.isArray(jobResult.items) ? jobResult.items : []
  const errorMessage = error?.message || (jobResult?.ok === false ? jobResult.code : null)
  const counts: Record<string, number> = {}
  for (const j of jobs) {
    const key = (j.category || '').toLowerCase().trim()
    if (key) counts[key] = (counts[key] || 0) + 1
  }

  return (
    <>
      <PageHeaderWithActions
        title="Find local jobs"
        eyebrow="Teen marketplace"
        description="Apply to jobs near you. Adults review applicants. Guardian approval may be required."
      >
        <Link href="/app/teen/saved" className="btn">🔖 Saved</Link>
        <Link href="/app/teen/applications" className="btn">📋 My apps</Link>
      </PageHeaderWithActions>


      {/* Browse by category — the featured way in, not a buried dropdown */}
      <div style={{marginBottom:28}}>
        <h4 style={{marginBottom:14}}>Explore by category</h4>
        <div className="grid four">
          {FEATURED_CATEGORIES.map(c => (
            <CategoryTile
              key={c.value}
              category={c.label}
              count={counts[c.value] || 0}
              active={category === c.value}
              href={`/app/teen/jobs?category=${encodeURIComponent(c.value)}`}
            />
          ))}
        </div>
      </div>

      {errorMessage && <div className="error" style={{marginBottom:16}}>{errorMessage === 'public_marketplace_disabled' ? 'The MORT marketplace is temporarily unavailable while production safety gates are completed.' : errorMessage}</div>}

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h4 style={{margin:0}}>{category ? `${category}` : 'All open jobs'}</h4>
        <span style={{fontSize:13,color:'var(--muted)'}}>{jobs?.length || 0} job{jobs?.length !== 1 ? 's' : ''} found</span>
      </div>

      {!jobs?.length ? (
        <EmptyState
          icon="🔍"
          title="No open jobs yet"
          text="When adults post verified jobs, they show here. Check back soon or try a different category."
          href="/app/teen/saved"
          action="View saved jobs"
        />
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {jobs.map((j: any) => (
            <JobCard
              key={j.id}
              id={j.id}
              title={j.title}
              category={j.category}
              city={j.city}
              state={j.region}
              locationText={j.location_text}
              description={j.description}
              payLabel={j.pay_label || centsToDollars(j.pay_amount_cents)}
              status={j.status}
              requiresGuardianApproval={j.requires_guardian_approval}
              href={`/app/teen/jobs/${j.id}`}
            />
          ))}
        </div>
      )}
    </>
  )
}
