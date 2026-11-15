import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions, EmptyState } from '@/components/ui'
import { Toast } from '@/components/toast'
import { SubmitButton } from '@/components/submit-button'
import { createTeamHustle, joinTeamHustle, leaveTeamHustle, closeTeamHustle, reviewTeamHustle } from './actions'
export const dynamic = 'force-dynamic'

export default async function TeamHustles({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const { supabase, profile } = await requireUser()
  const sp = await searchParams
  const { data: hustles, error: hustlesError } = await supabase.rpc('list_team_hustles_v1')
  const list = !hustlesError && Array.isArray(hustles) ? hustles : []
  const isAdmin = profile?.role === 'admin'
  const isAdult = profile?.role === 'adult' || profile?.role === 'admin'
  const canPost = profile?.role === 'admin' || (
    profile?.role === 'adult' &&
    ['approved', 'verified'].includes(profile.verification_status || '')
  )

  return (
    <>
      <PageHeaderWithActions title="Team hustles" eyebrow="Groups">
        <p>Jobs built for crews. Verified adults can post; MORT staff review each new hustle before teens can see or join it.</p>
      </PageHeaderWithActions>
      <Toast message={sp?.error || sp?.message} variant={sp?.error ? 'error' : 'default'} />

      {isAdult && !canPost && (
        <div className="warning-box" role="status" style={{ marginBottom: 24 }}>
          Adult identity verification must be approved before posting a team hustle. <Link href="/app/verify">Review verification status</Link>.
        </div>
      )}

      {canPost && (
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
          <p className="muted">New posts stay hidden until staff approval. Payments are arranged between you and the team — MORT does not process task payments yet.</p>
        </form>
      )}

      {hustlesError ? (
        <div className="warning-box" role="alert" style={{ marginBottom: 20 }}>
          <strong>Team hustles could not be loaded</strong>
          <p style={{ marginTop: 6, fontSize: 13 }}>Refresh and try again. No team-hustle data was changed.</p>
        </div>
      ) : list.length === 0 ? (
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
              {h.review_status === 'pending' ? (
                isAdmin && !h.i_am_poster ? (
                  <form action={reviewTeamHustle} className="form" style={{ marginTop: 12 }}>
                    <input type="hidden" name="hustle_id" value={h.id} />
                    <label>Review note<input name="reason" maxLength={1000} placeholder="Required when rejecting" /></label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <SubmitButton name="decision" value="approve" variant="safe" size="sm">Approve</SubmitButton>
                      <SubmitButton name="decision" value="reject" variant="danger" size="sm">Reject</SubmitButton>
                    </div>
                  </form>
                ) : (
                  <p className="muted" role="status">{isAdmin && h.i_am_poster ? 'A different administrator must review this post.' : 'Awaiting MORT staff review. Teens cannot see or join this hustle until it is approved.'}</p>
                )
              ) : h.review_status === 'rejected' ? (
                <p className="warning-box" role="status">Not approved{h.review_note ? `: ${h.review_note}` : '.'}</p>
              ) : h.review_status !== 'approved' ? (
                <p className="warning-box" role="alert">Review status is unavailable. This hustle cannot be joined.</p>
              ) : h.status !== 'open' ? (
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
