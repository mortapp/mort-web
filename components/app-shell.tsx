'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { RoleBadge } from '@/components/ui'
import { Logomark } from '@/components/logomark'
import { Icon } from '@/components/mort/icon'

type NavItem = { href: string; icon: string; label: string; badge?: number; roles?: string[] }

const navItems: NavItem[] = [
  { href: '/app', icon: '⚡', label: 'Dashboard' },
  { href: '/app/teen/jobs', icon: '🔍', label: 'Browse jobs', roles: ['teen','admin'] },
  { href: '/app/teen/applications', icon: '📋', label: 'Applications', roles: ['teen','admin'] },
  { href: '/app/teen/active', icon: '⚙️', label: 'Active jobs', roles: ['teen','admin'] },
  { href: '/app/teen/saved', icon: '🔖', label: 'Saved jobs', roles: ['teen','admin'] },
  { href: '/app/teen/earnings', icon: '💰', label: 'Earnings', roles: ['teen','admin'] },
  { href: '/app/challenges', icon: '🏆', label: 'Challenges', roles: ['teen','admin'] },
  { href: '/app/team-hustles', icon: '🤝', label: 'Team hustles', roles: ['teen','admin'] },
  { href: '/app/adult', icon: '💼', label: 'Adult home', roles: ['adult','admin'] },
  { href: '/app/adult/post-job', icon: '➕', label: 'Post a job', roles: ['adult','admin'] },
  { href: '/app/adult/jobs', icon: '📁', label: 'My jobs', roles: ['adult','admin'] },
  { href: '/app/adult/applications', icon: '👥', label: 'Applicants', roles: ['adult','admin'] },
  { href: '/app/guardian', icon: '🛡️', label: 'Guardian', roles: ['guardian','admin'] },
  { href: '/app/messages', icon: '💬', label: 'Messages' },
  { href: '/app/safety', icon: '🚨', label: 'Safety center' },
  { href: '/app/payments', icon: '💳', label: 'Payment prefs' },
  { href: '/app/profile', icon: '👤', label: 'Profile' },
  { href: '/app/support', icon: '🎧', label: 'Support' },
  { href: '/app/reports/new', icon: '⚠️', label: 'Report issue' },
  { href: '/app/admin', icon: '🔐', label: 'Admin', roles: ['admin'] },
]

interface Props {
  children: React.ReactNode
  role?: string
  displayName?: string
  xp?: number
  verificationStatus?: string
}

function getLevelInfo(xp: number) {
  if (xp < 100) return { level: 1, name: 'New Hustler', next: 100 }
  if (xp < 300) return { level: 2, name: 'Trusted Helper', next: 300 }
  if (xp < 600) return { level: 3, name: 'Local Pro', next: 600 }
  if (xp < 1000) return { level: 4, name: 'Verified Hustler', next: 1000 }
  return { level: 5, name: 'MORT Elite', next: 1000 }
}

export function AppShell({ children, role = 'none', displayName, xp = 0, verificationStatus }: Props) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebar = useRef<HTMLElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const media = matchMedia('(max-width: 768px)')
    const sync = () => { if (sidebar.current) sidebar.current.inert = media.matches && !sidebarOpen }
    sync(); media.addEventListener('change', sync)
    if (sidebarOpen && media.matches) sidebar.current?.querySelector<HTMLElement>('a,button')?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (!sidebarOpen) return
      if (event.key === 'Escape') { setSidebarOpen(false); toggle.current?.focus() }
      if (event.key === 'Tab' && media.matches) {
        const nodes = sidebar.current?.querySelectorAll<HTMLElement>('a,button')
        if (!nodes?.length) return
        const first = nodes[0], last = nodes[nodes.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', keydown)
    return () => { media.removeEventListener('change', sync); window.removeEventListener('keydown', keydown) }
  }, [sidebarOpen])
  const lvl = getLevelInfo(xp)
  const xpPct = Math.min(100, (xp / lvl.next) * 100)

  const visibleItems = navItems.filter(item => !item.roles || item.roles.includes(role))

  const sections: { label: string; items: NavItem[] }[] = [
    { label: 'Main', items: visibleItems.filter(i => ['Dashboard','Browse jobs','Applications','Active jobs','Saved jobs','Earnings','Challenges','Team hustles'].includes(i.label)) },
    { label: 'Adult', items: visibleItems.filter(i => ['Adult home','Post a job','My jobs','Applicants'].includes(i.label)) },
    { label: 'Guardian', items: visibleItems.filter(i => ['Guardian'].includes(i.label)) },
    { label: 'Account', items: visibleItems.filter(i => ['Messages','Safety center','Payment prefs','Profile','Support','Report issue'].includes(i.label)) },
    { label: 'Admin', items: visibleItems.filter(i => ['Admin'].includes(i.label)) },
  ].filter(s => s.items.length > 0)

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside ref={sidebar} id="app-navigation" className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Workspace navigation">
        <div className="sidebar-header">
          <Link href="/" className="logo" onClick={() => setSidebarOpen(false)}>
            <Logomark size={28} />
            <span>MORT</span>
          </Link>
        </div>

        {displayName && (
          <div className="sidebar-user">
            <div className="sidebar-user-name">{displayName}</div>
            <div style={{ marginTop: 6 }}><RoleBadge role={role} /></div>
            <div className="sidebar-user-xp">
              <span>{xp} XP</span>
              <div className="sidebar-xp-bar">
                <div className="sidebar-xp-fill" style={{ width: `${xpPct}%` }} />
              </div>
              <span>{lvl.next} XP</span>
            </div>
          </div>
        )}

        <nav className="sidebar-nav" aria-label="Your workspace">
          {sections.map(section => (
            <div key={section.label}>
              <div className="sidebar-section">{section.label}</div>
              {section.items.map(item => {
                const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href + '/') && !visibleItems.some(other => other.href !== item.href && other.href.startsWith(item.href + '/') && (pathname === other.href || pathname.startsWith(other.href + '/'))))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sidebar-link-icon"><Icon name={item.icon} size={18} /></span>
                    <span>{item.label}</span>
                    {item.badge ? <span className="sidebar-link-badge">{item.badge}</span> : null}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <form action="/auth/signout" method="POST">
            <button className="btn ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="app-main">
        <header className="app-topbar">
          <button
            ref={toggle}
            type="button"
            className="btn ghost sm sidebar-toggle tooltip"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation"
            aria-expanded={sidebarOpen}
            aria-controls="app-navigation"
            data-tooltip="Menu"
          >
            <Icon name={sidebarOpen ? 'close' : 'menu'} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/app/safety" className="btn danger sm" aria-label="Safety Center"><Icon name="shield" size={17} /><span className="hide-mobile">Safety</span></Link>
            <Link href="/app/messages" className="btn ghost sm" aria-label="Messages"><Icon name="message" size={17} /><span className="hide-mobile">Messages</span></Link>
          </div>
          <span className="app-location">Your workspace / {role}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {verificationStatus && (
              <span className={`status ${verificationStatus === 'approved' ? 'green' : verificationStatus === 'pending' ? 'yellow' : 'muted'}`}>
                {verificationStatus}
              </span>
            )}
            <Link href="/app/profile" className="btn ghost sm"><Icon name="person" size={17} /><span className="profile-name">{displayName || 'Profile'}</span></Link>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="app-content">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close workspace navigation"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 49 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
