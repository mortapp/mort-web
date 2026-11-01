'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { RoleBadge } from '@/components/ui'
import { Logomark } from '@/components/logomark'
import { Icon } from '@/components/icons'
import { ThemeToggle } from '@/components/theme-toggle'

type NavItem = { href: string; icon: string; label: string; exact?: boolean }

interface Props {
  children: React.ReactNode
  role?: string
  displayName?: string
  xp?: number
  verificationStatus?: string
}

const consumerNav: Record<string, { primary: NavItem[]; secondary: NavItem[] }> = {
  teen: {
    primary: [
      { href: '/app/teen/jobs', icon: 'dashboard', label: 'Home', exact: true },
      { href: '/app/teen/explore', icon: 'search', label: 'Explore' },
      { href: '/app/messages', icon: 'message', label: 'Inbox' },
      { href: '/app/profile', icon: 'user', label: 'Profile' },
    ],
    secondary: [
      { href: '/app/teen/applications', icon: 'clipboard', label: 'Applications' },
      { href: '/app/teen/active', icon: 'bolt', label: 'Active jobs' },
      { href: '/app/teen/saved', icon: 'bookmark', label: 'Saved jobs' },
      { href: '/app/teen/earnings', icon: 'wallet', label: 'History' },
      { href: '/app/challenges', icon: 'trophy', label: 'Progress' },
    ],
  },
  adult: {
    primary: [
      { href: '/app/adult', icon: 'dashboard', label: 'Home', exact: true },
      { href: '/app/adult/explore', icon: 'search', label: 'Explore' },
      { href: '/app/messages', icon: 'message', label: 'Inbox' },
      { href: '/app/profile', icon: 'user', label: 'Profile' },
    ],
    secondary: [
      { href: '/app/adult/post-job', icon: 'plus', label: 'Post a job' },
      { href: '/app/adult/jobs', icon: 'briefcase', label: 'My jobs' },
      { href: '/app/adult/applications', icon: 'users', label: 'Applicants' },
      { href: '/app/verify', icon: 'shield', label: 'Verification' },
      { href: '/app/payments', icon: 'card', label: 'Payment settings' },
    ],
  },
  guardian: {
    primary: [
      { href: '/app/guardian', icon: 'dashboard', label: 'Home', exact: true },
      { href: '/app/verify', icon: 'shield', label: 'Connections' },
      { href: '/app/messages', icon: 'message', label: 'Inbox' },
      { href: '/app/profile', icon: 'user', label: 'Profile' },
    ],
    secondary: [
      { href: '/app/support', icon: 'headset', label: 'Support' },
    ],
  },
  admin: {
    primary: [
      { href: '/app/admin', icon: 'lock', label: 'Review workspace', exact: true },
    ],
    secondary: [],
  },
}

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/')
}

export function AppShell({ children, role = 'none', displayName }: Props) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const nav = consumerNav[role] || { primary: [], secondary: [] }
  const isAdult = role === 'adult'
  const isAdmin = role === 'admin'
  const closeMenu = () => setSidebarOpen(false)

  const renderLink = (item: NavItem, mobile = false) => {
    const active = isActive(pathname, item)
    return (
      <Link key={item.href} href={item.href} className={mobile ? (active ? 'active' : '') : `sidebar-link ${active ? 'active' : ''}`} onClick={closeMenu} aria-current={active ? 'page' : undefined}>
        {mobile ? <span className="mobile-nav-icon">{item.icon === 'plus' ? <span className="app-mobile-nav-add"><Icon name="plus" size={20} /></span> : <Icon name={item.icon} />}</span> : <span className="sidebar-link-icon"><Icon name={item.icon} /></span>}
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className={`app-shell ${isAdmin ? 'app-shell-admin' : ''}`}>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link href={isAdmin ? '/app/admin' : '/app'} className="logo" onClick={closeMenu}>
            <Logomark size={28} /><span>MORT</span>
          </Link>
          {isAdmin && <div className="workspace-label">INTERNAL WORKSPACE</div>}
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-name">{displayName || 'Your account'}</div>
          <div style={{ marginTop: 6 }}><RoleBadge role={role} /></div>
        </div>

        <nav className="sidebar-nav" aria-label={isAdmin ? 'Staff navigation' : 'Main navigation'}>
          <div className="sidebar-section">{isAdmin ? 'Review' : 'Main'}</div>
          {nav.primary.map(item => renderLink(item))}
          {nav.secondary.length > 0 && <>
            <div className="sidebar-section">{isAdmin ? 'Queues' : 'Your MORT'}</div>
            {nav.secondary.map(item => renderLink(item))}
          </>}
          {!isAdmin && <>
            <div className="sidebar-section">Help & safety</div>
            {role === 'teen' && renderLink({ href: '/app/safety', icon: 'shield', label: 'Safety center' })}
            {renderLink({ href: '/app/support', icon: 'headset', label: 'Support' })}
            {renderLink({ href: '/app/reports/new', icon: 'flag', label: 'Report an issue' })}
          </>}
        </nav>

        <div className="sidebar-footer">
          <form action="/auth/signout" method="POST">
            <button className="btn ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>Sign out</button>
          </form>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <button className="btn ghost sm sidebar-toggle" onClick={() => setSidebarOpen(value => !value)} aria-label="Toggle navigation" aria-expanded={sidebarOpen}>
            <Icon name="menu" />
          </button>
          <div className="app-topbar-context">
            <span>{isAdmin ? 'MORT staff' : role === 'teen' ? 'Local work, on your terms' : role === 'guardian' ? 'Connected by consent' : 'Your local work, organized'}</span>
          </div>
          <div className="app-topbar-actions">
            {role === 'teen' && <Link href="/app/safety" className="btn ghost sm"><Icon name="shield" /><span className="hide-mobile">Safety</span></Link>}
            {!isAdmin && <Link href="/app/messages" className="btn ghost sm"><Icon name="message" /><span className="hide-mobile">Inbox</span></Link>}
            <ThemeToggle />
            {!isAdmin && <Link href="/app/profile" className="btn ghost sm"><Icon name="user" /><span className="hide-mobile">Profile</span></Link>}
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>

      {sidebarOpen && <button className="app-sidebar-backdrop" aria-label="Close navigation" onClick={closeMenu} />}
      {!isAdmin && (
        <nav className={`app-mobile-nav ${isAdult ? 'app-mobile-nav-adult' : ''}`} aria-label="Primary navigation">
          {nav.primary.slice(0, 2).map(item => renderLink(item, true))}
          {isAdult && renderLink({ href: '/app/adult/post-job', icon: 'plus', label: 'Post' }, true)}
          {nav.primary.slice(2).map(item => renderLink(item, true))}
        </nav>
      )}
    </div>
  )
}
