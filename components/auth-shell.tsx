import Link from 'next/link'
import { Logomark } from '@/components/logomark'

// Editorial auth shell: the brand panel leads on desktop while the form stays
// calm and readable on every screen size.
type AuthBullet = { icon: string; text: string }

interface AuthShellProps {
  mode?: 'login' | 'signup'
  kicker: string
  title: string
  description: string
  bullets: AuthBullet[]
  children: React.ReactNode
}

export function AuthShell({ mode = 'login', kicker, title, description, bullets, children }: AuthShellProps) {
  return (
    <main className="auth-shell" data-auth-mode={mode}>
      <aside className="auth-brand-panel">
        <div className="auth-brand-halo" aria-hidden="true" />
        <div className="auth-brand-masthead">
          <Link href="/" className="logo auth-logo">
            <Logomark size={30} />
            <span>MORT</span>
          </Link>
          <span className="auth-brand-tag">LOCAL OPPORTUNITY NETWORK</span>
        </div>
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
