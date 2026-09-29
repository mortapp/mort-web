'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="section container" style={{ textAlign: 'center' }}>
      <div className="empty-state" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="empty-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{error.message || 'An unexpected error occurred.'}</p>
        <div className="row-actions" style={{ marginTop: 16 }}>
          <button className="btn primary" onClick={() => reset()}>Try again</button>
          <Link href="/" className="btn ghost">Go home</Link>
        </div>
      </div>
    </main>
  )
}
