import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, EmptyState } from '@/components/ui'

export const dynamic = 'force-dynamic'

const categories = [
  { value: 'yard_work', label: 'Yard work', description: 'Outdoor cleanup, mowing, leaf removal, and garden tidying.' },
  { value: 'pet_care', label: 'Pet care', description: 'Dog walking, feeding, and basic pet check-ins.' },
  { value: 'tutoring', label: 'Tutoring', description: 'Subject support, study sessions, and homework help.' },
  { value: 'household_help', label: 'Household help', description: 'Simple organizing, tidying, and household tasks.' },
  { value: 'moving_help', label: 'Moving help', description: 'Light packing, sorting, and carrying appropriate items.' },
  { value: 'tech_help', label: 'Tech help', description: 'Basic device setup and everyday technology support.' },
  { value: 'other', label: 'Other local work', description: 'A clear, specific task that fits MORT’s safety rules.' },
]

export default async function AdultExplore({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  await requireRole(['adult'])
  const params = await searchParams
  const query = (params?.q || '').trim().slice(0, 80).toLowerCase()
  const matches = categories.filter(item => !query || `${item.label} ${item.description}`.toLowerCase().includes(query))

  return (
    <>
      <PageHeaderWithActions title="Explore job types" eyebrow="Explore" description="Browse the kinds of local work that can be listed on MORT. Choose a category to prepare a listing when production publishing is available.">
        <Link href="/app/adult/jobs" className="btn">My jobs</Link>
      </PageHeaderWithActions>
      <form action="/app/adult/explore" className="card explore-filter-form" style={{ marginBottom: 24 }}>
        <label style={{ flex: 1, minWidth: 220 }}>Search categories
          <input name="q" defaultValue={query} maxLength={80} placeholder="Yard work, pet care, tutoring…" />
        </label>
        <button className="btn primary" type="submit">Search</button>
        {query && <Link href="/app/adult/explore" className="btn ghost">Clear</Link>}
      </form>
      <div className="explore-results-heading"><div><h3>Local service categories</h3><p>{matches.length} category{matches.length === 1 ? '' : 'ies'}</p></div><span className="small">No live job listings are shown here</span></div>
      {!matches.length ? <EmptyState icon="search" title="No matching category" text="Try a broader term or clear your search." href="/app/adult/explore" action="Clear search" /> : (
        <div className="adult-explore-grid">
          {matches.map(item => <Link href={`/app/adult/post-job?category=${item.value}`} className="card adult-explore-card" key={item.value}>
            <span className="adult-explore-number">{String(categories.indexOf(item)+1).padStart(2,'0')}</span>
            <div><h3>{item.label}</h3><p>{item.description}</p></div>
            <span className="adult-explore-arrow" aria-hidden="true">↗</span>
          </Link>)}
        </div>
      )}
      <section className="notice" style={{ marginTop: 24 }}>
        <strong>Publishing is currently disabled.</strong>
        <p>Category browsing is available, but new listings cannot be submitted until adult verification, payment funding, and per-Task Guardian approval are supported in production.</p>
      </section>
    </>
  )
}
