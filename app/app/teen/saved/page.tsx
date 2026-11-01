import { requireUser } from '@/lib/auth'
import { centsToDollars } from '@/lib/money'
import { PageHeaderWithActions, EmptyState, JobCard } from '@/components/ui'
export const dynamic = 'force-dynamic'

export default async function Saved() {
  const { supabase, user } = await requireUser()
  const { data: items } = await supabase.from('saved_jobs').select('job_id, jobs(id, title, category, city, region, location_text, description, pay_amount_cents, pay_label, status, requires_guardian_approval)').eq('user_id', user.id).order('created_at', { ascending: false })

  return (
    <>
      <PageHeaderWithActions title="Saved jobs" eyebrow="Teen" description="Jobs you've bookmarked to apply to later." />
      {!items.length ? (
        <EmptyState icon="🔖" title="No saved jobs" text="Save jobs from the job detail page." href="/app/teen/jobs" action="Browse jobs" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((it: any) => (
            <JobCard
              key={it.job_id}
              id={it.job_id}
              title={it.jobs?.title || 'Saved job'}
              category={it.jobs?.category}
              city={it.jobs?.city}
              state={it.jobs?.region}
              locationText={it.jobs?.location_text}
              description={it.jobs?.description}
              payLabel={it.jobs?.pay_label || centsToDollars(it.jobs?.pay_amount_cents)}
              status={it.jobs?.status}
              requiresGuardianApproval={it.jobs?.requires_guardian_approval}
              href={`/app/teen/jobs/${it.job_id}`}
            />
          ))}
        </div>
      )}
    </>
  )
}
