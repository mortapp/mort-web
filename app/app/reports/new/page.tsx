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
        description="Reports are submitted to MORT's safety-report system for review. If you're in immediate danger, call emergency services first."
      />
      <form action={createReport} className="card form" style={{ maxWidth: 560 }}>
        <label>
          Reason
          <select name="reason" defaultValue={sp.reason || 'other'}>
            <option value="unsafe_meeting">Unsafe meeting</option>
            <option value="harassment">Harassment or bullying</option>
            <option value="scam">Scam or fake job</option>
            <option value="inappropriate_content">Inappropriate content</option>
            <option value="privacy">Privacy concern</option>
            <option value="underage_concern">Underage concern</option>
            <option value="payment">Payment concern</option>
            <option value="other">Other</option>
          </select>
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
          <textarea name="details" required minLength={10} maxLength={4000} defaultValue={sp.details || ''} placeholder="Tell us what happened. Include at least 10 characters." />
        </label>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <input type="checkbox" name="immediate_danger" style={{ width: 'auto', marginTop: 4 }} />
          <span>I believe someone may be in immediate danger. I understand this report does not contact emergency services.</span>
        </label>
        <SubmitButton variant="danger" pendingLabel="Submitting…">Submit report</SubmitButton>
      </form>
    </>
  )
}
