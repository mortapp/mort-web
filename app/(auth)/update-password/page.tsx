// Calibrated Liquid Glass: the password update screen is a concise, secure endpoint with explicit state feedback.
import Link from 'next/link'
import { updatePassword } from '@/app/(auth)/actions'
import { AuthShell } from '@/components/auth-shell'
import { Toast } from '@/components/toast'
import { SubmitButton } from '@/components/submit-button'

export default async function UpdatePassword({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const sp = await searchParams
  return (
    <AuthShell
      kicker="Account access"
      title="Choose a new password."
      description="Use at least six characters and store the new password somewhere safe."
      bullets={[
        { icon: '🔒', text: 'Your new password is saved only after submission succeeds' },
        { icon: '✓', text: 'You’ll return to your profile when the update is complete' },
      ]}
    >
      <div className="auth-form-heading">
        <h2>Update password</h2>
        <p>Choose a new password for your MORT account.</p>
      </div>
      <Toast message={sp?.message} />
      <form action={updatePassword} className="form">
        <label>New password<input name="password" type="password" autoComplete="new-password" required minLength={6} placeholder="At least 6 characters" /></label>
        <SubmitButton full size="lg" pendingLabel="Updating password…">Save new password</SubmitButton>
      </form>
      <div className="auth-form-footer"><p><Link href="/login">Back to sign in</Link></p></div>
    </AuthShell>
  )
}
