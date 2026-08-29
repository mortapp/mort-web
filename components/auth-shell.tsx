import Link from 'next/link'

// Calibrated Liquid Glass: the auth shell keeps one confident visual plane on desktop
// while collapsing to a clear, low-distraction form on small screens.
type AuthBullet = { icon: string; text: string }

interface AuthShellProps {
  kicker: string
  title: string
  description: string
  bullets: AuthBullet[]
  children: React.ReactNode
}

export function AuthShell({ kicker, title, description, bullets, children }: AuthShellProps) {
  return (
    <main className="auth-shell">
      <aside className="auth-brand-panel">
        <div className="auth-brand-halo" aria-hidden="true" />
        <Link href="/" className="logo auth-logo">
          <span className="logo-mark">M</span>
          <span>MORT</span>
        </Link>
        <div className="auth-brand-content">
          <div className="kicker">{kicker}</div>
          <h1 className="hero-title">{title}</h1>
          <p>{description}</p>
          <ul className="auth-bullet-list">
            {bullets.map((bullet) => (
              <li key={bullet.text}>
                <span aria-hidden="true">{bullet.icon}</span>
                <span>{bullet.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="auth-brand-note">MORT — Teen-safe local hustle marketplace</p>
      </aside>
      <section className="auth-form-panel">
        <div className="auth-form-content">{children}</div>
      </section>
    </main>
  )
}
