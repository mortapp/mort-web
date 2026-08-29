import { createReport } from '@/app/app/actions'
import { PageHeaderWithActions } from '@/components/ui'
import { SubmitButton } from '@/components/submit-button'
export const dynamic = 'force-dynamic'

export default async function NewReport({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = (await searchParams) || {}
  return (
    <>
      <PageHeaderWithActions
        title="Report an issue"
        eyebrow="Safety"
        description="Reports go straight to MORT admins for review. If you're in immediate danger, call emergency services first."
      />
      <form action={createReport} className="card form" style={{ maxWidth: 560 }}>
        <label>
          Reason
          <select name="reason" defaultValue={sp.reason || 'Unsafe job'}>
            <option>Unsafe job</option>
            <option>Harassment or bullying</option>
            <option>Scam/fake job</option>
            <option>Off-platform pressure</option>
            <option>Private information request</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          Target user ID (optional)
          <input name="target_user_id" defaultValue={sp.target_user_id || ''} placeholder="Auto-filled when reporting from a profile or message" />
        </label>
        <label>
          Target job ID (optional)
          <input name="target_job_id" defaultValue={sp.target_job_id || ''} />
        </label>
        <label>
          Target message ID (optional)
          <input name="target_message_id" defaultValue={sp.target_message_id || ''} />
        </label>
        <label>
          Details
          <textarea name="details" required defaultValue={sp.details || ''} placeholder="Tell us what happened. Include as much detail as you can." />
        </label>
        <SubmitButton variant="danger" pendingLabel="Submitting…">Submit report</SubmitButton>
      </form>
    </>
  )
}
