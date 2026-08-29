'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface Props {
  message?: string | null
  variant?: 'default' | 'error'
}

function ToastInner({ message, variant = 'default' }: Props) {
  const [leaving, setLeaving] = useState(false)
  const [hidden, setHidden] = useState(!message)
  const lastMessageRef = useRef(message)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // React's documented pattern for "reset state when a prop changes":
  // adjust state during render by comparing against the previous render's
  // value, instead of syncing via useEffect (which would call setState
  // synchronously in the effect body and trigger a needless extra render).
  if (message !== lastMessageRef.current) {
    lastMessageRef.current = message
    setLeaving(false)
    setHidden(!message)
  }

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => dismiss(), 4200)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message])

  function dismiss() {
    setLeaving(true)
    setTimeout(() => {
      setHidden(true)
      const params = new URLSearchParams(searchParams?.toString())
      if (params.has('message')) {
        params.delete('message')
        const qs = params.toString()
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      }
    }, 200)
  }

  if (hidden || !message) return null

  const isError = variant === 'error' || /fail|error|denied|blocked|not found|cannot|can't/i.test(message)

  return (
    <div className="toast-stack">
      <div className={`toast ${isError ? 'error-toast' : ''} ${leaving ? 'leaving' : ''}`} role="status">
        <span style={{ fontSize: 15, lineHeight: 1 }}>{isError ? '⚠️' : '✅'}</span>
        <span style={{ flex: 1 }}>{message}</span>
        <button className="toast-close" onClick={dismiss} aria-label="Dismiss">✕</button>
      </div>
    </div>
  )
}

/**
 * Reads a `message` prop (typically forwarded from a server-rendered
 * searchParams value after a redirect) and shows it as an animated,
 * auto-dismissing toast — the micro-interaction pattern from the design
 * brief, instead of a static banner that never goes away. Wrapped in
 * Suspense because it uses useSearchParams().
 */
export function Toast(props: Props) {
  return (
    <Suspense fallback={null}>
      <ToastInner {...props} />
    </Suspense>
  )
}
