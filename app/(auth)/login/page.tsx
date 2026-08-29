// Calibrated Liquid Glass: sign-in is a focused continuation of the public journey, with a compact form and a reliable return path.
import Link from 'next/link'
import { login, signInWithGoogle } from '@/app/(auth)/actions'
import { AuthShell } from '@/components/auth-shell'
import { Toast } from '@/components/toast'
import { SubmitButton } from '@/components/submit-button'

function requestedDestination(value: string | undefined) {
  return value?.startsWith('/app/') && !value.startsWith('//') ? value : '/app'
}

export default async function Login({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const next = requestedDestination(sp?.next)

  return (
    <AuthShell
      kicker="Welcome back"
      title="Back to the hustle."
      description="Your jobs, applications, earnings, and safety tools are waiting for you."
      bullets={[
        { icon: '✓', text: 'Browse local jobs near you' },
        { icon: '✓', text: 'Track applications and earnings' },
        { icon: '✓', text: 'Check in safely on active jobs' },
        { icon: '✓', text: 'Build your XP and reputation' },
      ]}
    >
      <div className="auth-form-heading">
        <h2>Sign in to MORT</h2>
        <p>Enter your email and password to continue.</p>
      </div>
      <Toast message={sp?.message} />
      <form action={login} className="form">
        <input type="hidden" name="source" value="login" />
        <input type="hidden" name="next" value={next} />
        <button type="submit" formAction={signInWithGoogle} formNoValidate className="btn ghost full lg google-auth-button">
          <span aria-hidden="true">G</span> Continue with Google
        </button>
        <div className="auth-divider"><span>or use email</span></div>
        <label>
          Email address
          <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
        </label>
        <SubmitButton full size="lg" pendingLabel="Signing in…">Sign in</SubmitButton>
      </form>
      <div className="auth-form-footer">
        <p><Link href="/reset-password">Forgot your password?</Link></p>
        <p>Don&apos;t have an account? <Link href={`/signup?next=${encodeURIComponent(next)}`}>Create one free</Link></p>
      </div>
    </AuthShell>
  )
}
