import { PageHeaderWithActions, EmptyState } from '@/components/ui'
export const dynamic = 'force-dynamic'

export default function TeamHustles() {
  return (
    <>
      <PageHeaderWithActions title="Team hustles" eyebrow="Groups — coming soon">
        <p>Team jobs, group chat rules, co-worker invites, and shared proof flow.</p>
      </PageHeaderWithActions>
      <EmptyState
        icon="🤝"
        title="Not wired up yet"
        text="Team hustles need a dedicated schema (team membership, shared job splits, group-safe messaging rules) that doesn't exist in the current database yet. This page is a placeholder in the nav — see README for what's needed to build it out."
      />
      <div className="grid three" style={{ marginTop: 24 }}>
        <div className="card"><div className="card-icon-tile">🧭</div><h3>Built into the nav</h3><p>This feature is part of the MORT product surface and ready for database wiring.</p></div>
        <div className="card"><div className="card-icon-tile yellow">🛡️</div><h3>Safety gated</h3><p>Any teen-facing version should keep reporting, guardian controls, and moderation on.</p></div>
        <div className="card"><div className="card-icon-tile blue">🛠️</div><h3>Next backend step</h3><p>Add schema tables, RLS policies, and server actions for this module.</p></div>
      </div>
    </>
  )
}
