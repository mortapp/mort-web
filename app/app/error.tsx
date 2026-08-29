'use client'
import { useEffect } from 'react'

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="empty-state">
      <div className="empty-icon">⚠️</div>
      <h3>Something went wrong</h3>
      <p>{error.message || 'An unexpected error occurred loading this page.'}</p>
      <button className="btn primary" style={{ marginTop: 12 }} onClick={() => reset()}>
        Try again
      </button>
    </div>
  )
}
