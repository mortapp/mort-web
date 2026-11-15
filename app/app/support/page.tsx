import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions, Status, EmptyState } from '@/components/ui'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function Support({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase, user } = await requireUser()

  let tickets: any[] | null = null
  let loadError: string | null = null
  const { data, error } = await supabase.from('support_tickets').select('*').eq('requester_id', user.id).order('created_at', { ascending: false })
  if (error) loadError = error.message
  else tickets = data

  return (
    <>
      <PageHeaderWithActions title="Support" eyebrow="We're here to help" description="Safety issues are always reviewed first. For emergencies, contact local emergency services." />
      <Toast message={sp?.error || sp?.message} variant={sp?.error ? 'error' : 'default'} />

      {loadError && (
        <div className="warning-box" style={{ marginBottom: 20 }}>
          <strong>⚠️ Support tickets could not load</strong>
          <p style={{ marginTop: 6, fontSize: 13 }}>{loadError}</p>
        </div>
      )}

      <div className="grid two" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3>New ticket</h3>
          <div className="warning-box" role="status" style={{ marginTop: 12 }}>
            Ticket submission is temporarily unavailable because the production backend has no support-ticket creation endpoint.
          </div>
          <p style={{ marginTop: 12 }}>For an immediate safety concern, use the <Link href="/app/safety">Safety Center</Link>. For emergencies, contact local emergency services.</p>
        </div>

        <div>
          <h3 style={{ marginBottom: 12 }}>My tickets</h3>
          {!tickets?.length ? (
            <EmptyState icon="🎧" title="No tickets yet" text="Submitted tickets will show up here." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tickets.map((t: any) => (
                <Link key={t.id} href={`/app/support/${t.id}`} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <h3 style={{ fontSize: 14 }}>{t.subject}</h3>
                    <Status value={t.status} />
                  </div>
                  <p style={{ fontSize: 12, marginTop: 4 }}>{t.category} · {new Date(t.created_at).toLocaleDateString()}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
