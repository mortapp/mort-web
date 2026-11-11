import Link from 'next/link'
export const dynamic = 'force-dynamic'

export default function AuthError() {
  return (
    <main className="section container" style={{ maxWidth: 680 }}>
      <h1 className="app-title">Verification link problem</h1>
      <div className="card">
        <p>
          This link has already been used or has expired. Verification links only work once.
        </p>
        <p>
          If you already verified your email, just sign in below. If not, try signing in with your
          email and password — we will send you a fresh verification link automatically.
        </p>
        <p className="muted">
          Still stuck? Make sure you open the link in the same browser you signed up with, and
          contact MORT support if it keeps failing.
        </p>
        <Link className="btn primary" href="/login">Back to login</Link>
      </div>
    </main>
  )
}
