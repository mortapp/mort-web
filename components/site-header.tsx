'use client'

// Calibrated Liquid Glass: navigation has a stable opaque backdrop and a deliberate mobile drawer rather than disappearing links.
import Link from 'next/link'
import { useState } from 'react'
import { Logomark } from '@/components/logomark'
import { ThemeToggle } from '@/components/theme-toggle'

interface SiteHeaderProps {
  isSignedIn?: boolean
}

export function SiteHeader({ isSignedIn = false }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="logo" onClick={close}>
          <Logomark size={26} />
          <span>MORT</span>
        </Link>
        <button className="site-nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded={open} aria-controls="public-navigation" onClick={() => setOpen((value) => !value)}>
          <span aria-hidden="true">{open ? '×' : '☰'}</span>
        </button>
        <nav id="public-navigation" className={open ? 'open' : undefined} aria-label="Public navigation">
          <Link href="/#how-it-works" onClick={close}>How it works</Link>
          <Link href="/#who-its-for" onClick={close}>Roles</Link>
          <Link href="/safety" onClick={close}>Safety</Link>
          <Link href="/legal/terms" onClick={close}>Legal</Link>
          <ThemeToggle />
          {isSignedIn ? (
            <Link href="/app" className="btn sm" onClick={close}>Open MORT</Link>
          ) : (
            <>
              <Link href="/login" onClick={close}>Sign in</Link>
              <Link href="/signup" className="btn primary sm" onClick={close}>Get started</Link>
            </>
          )}
        </nav>
      </div>
      {open && <button className="site-nav-backdrop" type="button" aria-label="Close navigation" onClick={close} />}
    </header>
  )
}
