// Sign-in is a focused continuation of the public journey with a reliable in-app return path.
import Link from 'next/link'
import { login, signInWithGoogle } from '@/app/(auth)/actions'
import { AuthShell } from '@/components/auth-shell'
import { Toast } from '@/components/toast'
import { SubmitButton } from '@/components/submit-button'

function requestedDestination(value: string | undefined) {
  return value === '/app' || value?.startsWith('/app/') ? value : '/app'
}

export default async function Login({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const next = requestedDestination(sp?.next)
  const isOnboardingReturn = next === '/app/onboarding' || next.startsWith('/app/onboarding?')

  return (
    <AuthShell
      mode="login"
      kicker={isOnboardingReturn ? 'Pick up where you left off' : 'Welcome back'}
      title={isOnboardingReturn ? 'Your setup is waiting.' : 'Back to the hustle.'}
      description={isOnboardingReturn
        ? 'Sign in to continue setting up your MORT account. We’ll bring you straight back to onboarding.'
        : 'Your jobs, applications, earnings, and safety tools are waiting for you.'}
      bullets={isOnboardingReturn ? [
        { icon: '✓', text: 'Resume your MORT account setup' },
        { icon: '✓', text: 'Keep your requested page saved' },
        { icon: '✓', text: 'Continue toward dashboard access' },
      ] : [
        { icon: '✓', text: 'Browse local jobs near you' },
        { icon: '✓', text: 'Track applications and earnings' },
        { icon: '✓', text: 'Check in safely on active jobs' },
      ]}
      journey={isOnboardingReturn ? {
        label: 'YOUR NEXT STEPS',
        title: 'Sign in. Resume setup. Keep moving.',
        steps: ['Sign in', 'Onboarding', 'Review'],
        currentStep: 0,
        description: 'Your original onboarding destination is saved. Marketplace access follows completed setup and account review.'
      } : undefined}
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
