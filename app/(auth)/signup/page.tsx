// MORT signup begins with a neutral date-of-birth age screen.
import Link from 'next/link'
import { signUp, signInWithGoogle } from '@/app/(auth)/actions'
import { AuthShell } from '@/components/auth-shell'
import { Toast } from '@/components/toast'
import { SubmitButton } from '@/components/submit-button'

function requestedDestination(value: string | undefined) {
  return value === '/app' || value?.startsWith('/app/') ? value : '/app/teen/jobs'
}

function minimumEligibleDob() {
  const now = new Date()
  const year = now.getUTCFullYear() - 13
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function requestedRole(value: string | undefined): 'teen' | 'adult' | 'guardian' {
  if (value === 'adult' || value === 'guardian') return value
  return 'teen'
}

export default async function Signup({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const next = requestedDestination(sp?.next)
  const role = requestedRole(sp?.role)

  return (
    <AuthShell
      mode="signup"
      kicker="Join MORT"
      title="Start your local hustle."
      description="MORT is for people age 13 and older. Teens find safe local work. Adults post jobs. Guardians keep everyone safe."
      bullets={[
        { icon: '↗', text: 'Teens: find dog walking, lawn care, errands, and more' },
        { icon: '□', text: 'Adults: post jobs and hire verified teens nearby' },
        { icon: '◎', text: 'Guardians: stay connected with safety controls' },
      ]}
      journey={{
        label: 'YOUR PATH INTO MORT',
        title: 'Create. Set up. Get reviewed.',
        steps: ['Account', 'Setup', 'Review'],
        currentStep: 0,
        description: 'Complete onboarding and account review before marketplace access opens.'
      }}
    >
      <div className="auth-form-heading">
        <h2>Create your account</h2>
        <p>Free to join. No payment information needed.</p>
      </div>
      <Toast message={sp?.message} />
      <form action={signUp} className="form">
        <input type="hidden" name="source" value="signup" />
        <input type="hidden" name="next" value={next} />
        <fieldset className="signup-path-fieldset">
          <legend>Choose your path</legend>
          <p className="signup-path-intro">Pick what brings you to MORT. Your date of birth—not this selection—determines your age group. MORT is for ages 13 and older.</p>
          <div className="signup-path-options">
            <label className="signup-path-option">
              <input type="radio" name="role" value="teen" defaultChecked={role === 'teen'} />
              <span className="signup-path-option-panel">
                <span className="signup-path-option-heading"><span>I’m a teen</span><span className="signup-path-option-age">13–17</span></span>
                <span className="signup-path-option-description">Find safe local work and build experience.</span>
                <span className="signup-path-school-note"><strong>School email required:</strong> To continue teen onboarding, you’ll need a verified school email address on an approved school domain.</span>
              </span>
            </label>
            <label className="signup-path-option">
              <input type="radio" name="role" value="adult" defaultChecked={role === 'adult'} />
              <span className="signup-path-option-panel">
                <span className="signup-path-option-heading"><span>I’m an adult</span><span className="signup-path-option-age">18+</span></span>
                <span className="signup-path-option-description">Post local jobs and hire teens nearby.</span>
              </span>
            </label>
            <label className="signup-path-option">
              <input type="radio" name="role" value="guardian" defaultChecked={role === 'guardian'} />
              <span className="signup-path-option-panel">
                <span className="signup-path-option-heading"><span>I’m a guardian / parent</span><span className="signup-path-option-age">18+</span></span>
                <span className="signup-path-option-description">Stay connected and help support your teen.</span>
              </span>
            </label>
          </div>
        </fieldset>
        <label>
          Date of birth
          <input name="date_of_birth" type="date" autoComplete="bday" required max={minimumEligibleDob()} />
        </label>
        <p className="muted">Your date of birth confirms your age: people ages 13–17 enter as teens; adults 18+ can use the adult or guardian path.</p>
        <label>
          Display name
          <input name="display_name" autoComplete="name" required placeholder="Santiago, Mike, Keke..." />
        </label>
        <button type="submit" formAction={signInWithGoogle} formNoValidate className="btn ghost full lg google-auth-button">
          <span aria-hidden="true">G</span> Sign up with Google
        </button>
        <div className="auth-divider"><span>or use email</span></div>
        <label>
          Email address
          <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="new-password" required minLength={6} placeholder="At least 6 characters" />
        </label>
        <SubmitButton full size="lg" pendingLabel="Creating account…">Create free account</SubmitButton>
      </form>
      <div className="auth-form-footer">
        <p>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link></p>
        <p className="auth-legal">By creating an account you agree to our <Link href="/legal/terms">Terms of Service</Link> and <Link href="/legal/privacy">Privacy Policy</Link>.</p>
      </div>
    </AuthShell>
  )
}
