// MORT signup begins with a neutral date-of-birth age screen.
import Link from 'next/link'
import { signUp, signInWithGoogle } from '@/app/(auth)/actions'
import { AuthShell } from '@/components/auth-shell'
import { Toast } from '@/components/toast'
import { SubmitButton } from '@/components/submit-button'

function requestedDestination(value: string | undefined) {
  return value?.startsWith('/app/') && !value.startsWith('//') ? value : '/app/teen/jobs'
}

function minimumEligibleDob() {
  const now = new Date()
  const year = now.getUTCFullYear() - 13
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default async function Signup({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const next = requestedDestination(sp?.next)

  return (
    <AuthShell
      kicker="Join MORT"
      title="Start your local hustle."
      description="MORT is for people age 13 and older. Teens find safe local work. Adults post jobs. Guardians keep everyone safe."
      bullets={[
        { icon: '🔥', text: 'Teens: find dog walking, lawn care, errands, and more' },
        { icon: '💼', text: 'Adults: post jobs and hire verified teens nearby' },
        { icon: '🛡️', text: 'Guardians: stay connected with safety controls' },
      ]}
    >
      <div className="auth-form-heading">
        <h2>Create your account</h2>
        <p>Free to join. No payment information needed.</p>
      </div>
      <Toast message={sp?.message} />
      <form action={signUp} className="form">
        <input type="hidden" name="source" value="signup" />
        <input type="hidden" name="next" value={next} />
        <label>
          Date of birth
          <input name="date_of_birth" type="date" autoComplete="bday" required max={minimumEligibleDob()} />
        </label>
        <p className="muted">MORT requires every member to be at least 13. Your date of birth determines whether you enter as a teen or an adult.</p>
        <label>
          Display name
          <input name="display_name" autoComplete="name" required placeholder="Santiago, Mike, Keke..." />
        </label>
        <label>
          I am a...
          <select name="role" defaultValue="teen">
            <option value="teen">Teen worker (ages 13–17)</option>
            <option value="adult">Adult / customer / business</option>
            <option value="guardian">Guardian / parent</option>
          </select>
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
