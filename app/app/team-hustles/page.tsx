import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions, EmptyState } from '@/components/ui'
import { Toast } from '@/components/toast'
import { SubmitButton } from '@/components/submit-button'
import { createTeamHustle, joinTeamHustle, leaveTeamHustle, closeTeamHustle } from './actions'
export const dynamic = 'force-dynamic'

export default async function TeamHustles({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const { supabase, profile } = await requireUser()
  const sp = await searchParams
  const { data: hustles } = await supabase.rpc('list_team_hustles_v1')
  const list = Array.isArray(hustles) ? hustles : []
  const isAdult = profile?.role === 'adult' || profile?.role === 'admin'

  return (
    <>
      <PageHeaderWithActions title="Team hustles" eyebrow="Groups">
        <p>Jobs built for crews. An adult posts the hustle, teens join the team, and everyone stays inside MORT safety controls.</p>
      </PageHeaderWithActions>
      <Toast message={sp?.message} />

      {isAdult && (
        <form action={createTeamHustle} className="card form" style={{marginBottom:24}}>
          <h3>Post a team hustle</h3>
          <label>Title<input name="title" required placeholder="Fall leaf cleanup crew" /></label>
          <label>What the team does<textarea name="description" required placeholder="Describe the job, the team split, and what each teen handles." /></label>
          <div className="grid two" style={{gap:12}}>
            <label>Category<input name="category" placeholder="yard work" /></label>
            <label>Workers needed<input name="workers_needed" type="number" min={2} max={10} defaultValue={3} required /></label>
          </div>
          <div className="grid two" style={{gap:12}}>
            <label>Pay type
              <select name="pay_type" defaultValue="per_person">
                <option value="per_person">Pay per person</option>
                <option value="total_split">Total, split by team</option>
              </select>
            </label>
            <label>Amount (USD)<input name="pay_amount" type="number" min={1} step="0.01" placeholder="25" /></label>
          </div>
          <div className="grid two" style={{gap:12}}>
            <label>City<input name="city" placeholder="Indianapolis" /></label>
            <label>State<input name="region" placeholder="IN" maxLength={2} /></label>
          </div>
          <label>Location notes<input name="location_notes" placeholder="Meet at the park entrance; exact address after approval" /></label>
          <SubmitButton pendingLabel="Posting…">Post team hustle</SubmitButton>
          <p className="muted">MORT staff review new hustles for safety. Payments are arranged between you and the team — MORT does not process task payments yet.</p>
        </form>
      )}

      {list.length === 0 ? (
        <EmptyState
          icon="🤝"
          title="No open team hustles yet"
          text={isAdult ? 'Post the first one above.' : 'Check back soon — adults in your area are posting crew jobs.'}
        />
      ) : (
        <div className="grid two">
          {list.map((h: any) => (
            <div key={h.id} className="card">
              <h3>{h.title}</h3>
              <p className="muted" style={{marginTop:4}}>{h.description}</p>
              <p style={{fontSize:13,marginTop:10}}>
                {h.category ? `${h.category} · ` : ''}{h.city && h.region ? `${h.city}, ${h.region} · ` : ''}
                {h.workers_needed} spots{h.joined_count != null ? ` · ${h.joined_count} joined` : ''}
                {h.age_min != null && h.age_max != null ? ` · ages ${h.age_min}–${h.age_max}` : ''}
              </p>
              {h.pay_amount != null && h.pay_type && (
                <p style={{fontSize:13}}>${h.pay_amount} {h.pay_type === 'per_person' ? 'per person' : 'total, split by team'}</p>
              )}
              {h.location_notes && <p style={{fontSize:13,color:'var(--muted)'}}>{h.location_notes}</p>}
              {h.poster_display_name && (
                <p style={{fontSize:13,color:'var(--muted)'}}>Posted by {h.poster_display_name}</p>
              )}
              {h.status !== 'open' ? (
                <p className="muted">This hustle is closed.</p>
              ) : h.my_membership ? (
                <form action={leaveTeamHustle} style={{marginTop:12}}>
                  <input type="hidden" name="hustle_id" value={h.id} />
                  <button className="btn" type="submit">Leave team</button>
                </form>
              ) : h.i_am_poster ? (
                <form action={closeTeamHustle} style={{marginTop:12}}>
                  <input type="hidden" name="hustle_id" value={h.id} />
                  <button className="btn" type="submit">Close hustle</button>
                </form>
              ) : !isAdult ? (
                <form action={joinTeamHustle} style={{marginTop:12}}>
                  <input type="hidden" name="hustle_id" value={h.id} />
                  <SubmitButton pendingLabel="Joining…">Join team</SubmitButton>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
