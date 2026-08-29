import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { centsToDollars } from '@/lib/money'
import { PageHeaderWithActions, EmptyState, JobCard, CategoryTile } from '@/components/ui'
export const dynamic = 'force-dynamic'

const FEATURED_CATEGORIES = ['dog walking', 'lawn care', 'tutoring', 'cleaning', 'errands', 'babysitting', 'car washing', 'trash help']

export default async function Jobs({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const { supabase, user } = await requireUser()
  const sp = await searchParams
  const category = sp?.category
  const q = sp?.q

  const { data: teenProfile } = await supabase.from('teen_profiles').select('paused_by_guardian').eq('user_id', user.id).maybeSingle()
  const isPaused = !!teenProfile?.paused_by_guardian

  // Live counts per category so the tiles aren't guessing.
  const { data: openJobsForCounts } = await supabase.from('jobs').select('category').eq('status', 'open')
  const counts: Record<string, number> = {}
  for (const j of openJobsForCounts || []) {
    const key = (j.category || '').toLowerCase().trim()
    if (key) counts[key] = (counts[key] || 0) + 1
  }

  let query = supabase.from('jobs').select('*').eq('status','open').order('created_at',{ascending:false}).limit(60)
  if (category) query = query.ilike('category', `%${category}%`)
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  const { data: jobs, error } = await query

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

      {isPaused && (
        <div className="warning-box" style={{ marginBottom: 20 }}>
          <strong>⏸ Your account is paused by your guardian.</strong>
          <p style={{ marginTop: 6, fontSize: 13 }}>You can still browse, but you can&apos;t apply to jobs or start new chats until they resume it.</p>
        </div>
      )}

      {/* Search */}
      <div className="card" style={{marginBottom:24}}>
        <form style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
          <label style={{flex:1,minWidth:200}}>
            Search jobs
            <input name="q" placeholder="Dog walking, tutoring, lawn..." defaultValue={q||''} />
          </label>
          <button className="btn primary" style={{marginBottom:0,alignSelf:'flex-end'}}>Search</button>
          {(category || q) && <Link href="/app/teen/jobs" className="btn ghost" style={{alignSelf:'flex-end'}}>Clear</Link>}
        </form>
      </div>

      {/* Browse by category — the featured way in, not a buried dropdown */}
      <div style={{marginBottom:28}}>
        <h4 style={{marginBottom:14}}>Browse by category</h4>
        <div className="grid four">
          {FEATURED_CATEGORIES.map(c => (
            <CategoryTile
              key={c}
              category={c}
              count={counts[c] || 0}
              active={category?.toLowerCase() === c}
              href={`/app/teen/jobs?category=${encodeURIComponent(c)}`}
            />
          ))}
        </div>
      </div>

      {error && <div className="error" style={{marginBottom:16}}>{error.message}</div>}

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
              state={j.state}
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
