import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, EmptyState } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function TeamHustles() {
  await requireRole(['teen'])
  return (
    <>
      <PageHeaderWithActions title="Team work" eyebrow="Not available in production" description="MORT is keeping group jobs disabled until team membership, shared job ownership, payout rules, and group-safe messaging have their own production contracts." />
      <EmptyState icon="users" title="Team work is not active yet" text="There are no team invitations, shared assignments, group chats, or team earnings in the current production backend. Nothing can be created from this page." href="/app/teen/jobs" action="Back to Home" />
      <section className="card" style={{ marginTop: 16 }}>
        <h3>Why this is gated</h3>
        <p style={{ marginTop: 6 }}>A team feature needs verified membership, clear responsibility for each job, teen-safe group messaging, Guardian visibility rules, and an auditable way to split work and compensation. MORT will not simulate those controls with placeholder data.</p>
      </section>
    </>
  )
}
