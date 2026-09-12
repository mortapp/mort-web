import Link from 'next/link'
import { Icon } from '@/components/mort/icon'
import { SiteHeader } from '@/components/site-header'

export const metadata = {
  title: 'Page not found — MORT',
  description: 'This page does not exist or may have moved.',
}

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="section container" style={{ textAlign: 'center' }}>
        <div className="empty-state" style={{ maxWidth: 480, margin: '0 auto' }}>
          <div className="empty-icon"><Icon name="compass" size={18} /></div>
          <h3>This page doesn&rsquo;t exist.</h3>
          <p>The page you&rsquo;re looking for may have moved or never existed. Let&rsquo;s get you back on track.</p>
          <div className="row-actions" style={{ marginTop: 16 }}>
            <Link href="/" className="btn primary">Go home</Link>
            <Link href="/safety" className="btn ghost">Safety Center</Link>
          </div>
        </div>
      </main>
    </>
  )
}
