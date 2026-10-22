'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type Position = { x: number; y: number; side: 'left' | 'right' }
type DragState = {
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
  moved: boolean
}

export function ActiveJobControl({ title, status }: { title: string; status: string }) {
  const [position, setPosition] = useState<Position | null>(null)
  const [open, setOpen] = useState(false)
  const drag = useRef<DragState | null>(null)

  useEffect(() => {
    const place = () => {
      setPosition((current) => {
        const side = current?.side || 'right'
        const x = side === 'left' ? 10 : window.innerWidth - 68
        const maxY = Math.max(72, window.innerHeight - 132)
        const y = Math.min(Math.max(current?.y ?? window.innerHeight - 168, 72), maxY)
        return { x, y, side }
      })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [])

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 && event.pointerType !== 'touch') return
    if (!position) return
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const current = drag.current
    if (!current || current.pointerId !== event.pointerId) return
    const dx = event.clientX - current.startX
    const dy = event.clientY - current.startY
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) current.moved = true
    if (!current.moved) return

    const x = Math.min(Math.max(current.originX + dx, 8), window.innerWidth - 66)
    const y = Math.min(Math.max(current.originY + dy, 72), Math.max(72, window.innerHeight - 132))
    setPosition({ x, y, side: x + 29 < window.innerWidth / 2 ? 'left' : 'right' })
  }

  function onPointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    const current = drag.current
    if (!current || current.pointerId !== event.pointerId) return
    if (!current.moved) {
      setOpen((value) => !value)
    } else {
      setPosition((value) => {
        const side = value && value.x + 29 < window.innerWidth / 2 ? 'left' : 'right'
        const y = Math.min(Math.max(value?.y ?? current.originY, 72), Math.max(72, window.innerHeight - 132))
        return { x: side === 'left' ? 10 : window.innerWidth - 68, y, side }
      })
    }
    drag.current = null
  }

  function onPointerCancel() {
    drag.current = null
  }

  if (!position) return null

  return (
    <>
      <button
        type="button"
        className="active-job-orb"
        style={{ left: position.x, top: position.y }}
        aria-label={`Open active job: ${title}`}
        aria-expanded={open}
        title="Drag to reposition · tap for active job"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen((value) => !value)
          }
        }}
      >
        <span aria-hidden="true">↗</span>
        <span className="active-job-orb-dot" aria-hidden="true" />
      </button>

      {open && (
        <section
          className={`active-job-sheet ${position.side === 'left' ? 'from-left' : 'from-right'}`}
          style={position.side === 'left' ? { left: 16 } : { right: 16 }}
          role="dialog"
          aria-label="Active job summary"
        >
          <div className="active-job-sheet-header">
            <span>ACTIVE JOB</span>
            <button type="button" className="active-job-sheet-close" onClick={() => setOpen(false)} aria-label="Close active job summary">×</button>
          </div>
          <h3>{title}</h3>
          <p className="active-job-sheet-status">{status.replace(/_/g, ' ')}</p>
          <p className="active-job-sheet-note">Your active job tools and safety check-ins are available here.</p>
          <div className="active-job-sheet-actions">
            <Link href="/app/teen/active" className="btn primary" onClick={() => setOpen(false)}>Open active job</Link>
            <Link href="/app/safety" className="btn ghost" onClick={() => setOpen(false)}>Safety center</Link>
          </div>
        </section>
      )}
    </>
  )
}
