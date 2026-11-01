import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, XPBar } from '@/components/ui'

export const dynamic = 'force-dynamic'

function getLevelInfo(xp: number) {
  if (xp < 100) return { level: 1, name: 'Getting started', next: 100 }
  if (xp < 300) return { level: 2, name: 'Building momentum', next: 300 }
  if (xp < 600) return { level: 3, name: 'Growing locally', next: 600 }
  if (xp < 1000) return { level: 4, name: 'Established', next: 1000 }
  return { level: 5, name: 'Experienced', next: 1000 }
}

export default async function Progress() {
  const { profile } = await requireRole(['teen'])
  const xp = Number(profile?.xp_points || 0)
  const level = getLevelInfo(xp)

  return (
    <>
      <PageHeaderWithActions title="Your progress" eyebrow="Motion" description="A simple view of the progress currently recorded on your MORT account." />
      <section className="card progress-summary">
        <div className="progress-summary-top"><div><span className="small">CURRENT LEVEL</span><h2>{level.name}</h2></div><strong>{xp.toLocaleString()} <span>XP</span></strong></div>
        <XPBar current={xp} max={level.next} level={level.level} levelName={level.name} />
        <p className="muted" style={{ marginTop: 16 }}>Your account currently records {xp.toLocaleString()} XP. Challenge completion, badges, and reward claims are not active in the production website yet, so MORT does not show estimated or unearned rewards here.</p>
      </section>
      <section className="card" style={{ marginTop: 16 }}>
        <h3>Keep building your record</h3>
        <p style={{ marginTop: 6 }}>Focus on clear communication, following agreed job details, and completing work safely. Your job history remains separate from any unverified payment estimate.</p>
      </section>
    </>
  )
}
