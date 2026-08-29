// Calibrated Liquid Glass: password recovery is intentionally simple, using the same familiar auth frame as sign-in.
import Link from 'next/link'
import { sendPasswordReset } from '@/app/(auth)/actions'
import { AuthShell } from '@/components/auth-shell'
import { Toast } from '@/components/toast'
import { SubmitButton } from '@/components/submit-button'

export default async function ResetPassword({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const sp = await searchParams
  return (
    <AuthShell
      kicker="Account access"
      title="Reset, then return."
      description="We’ll email a secure link so you can choose a new password and get back to your account."
      bullets={[
        { icon: '✉️', text: 'Use the email address attached to your MORT account' },
        { icon: '🔒', text: 'The reset link opens a secure password screen' },
      ]}
    >
      <div className="auth-form-heading">
        <h2>Reset password</h2>
        <p>Enter your email and we’ll send the reset link.</p>
      </div>
      <Toast message={sp?.message} />
      <form action={sendPasswordReset} className="form">
        <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
        <SubmitButton full size="lg" pendingLabel="Sending link…">Send reset link</SubmitButton>
      </form>
      <div className="auth-form-footer"><p><Link href="/login">Back to sign in</Link></p></div>
    </AuthShell>
  )
}
