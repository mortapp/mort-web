'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface SegmentedTabsProps {
  items: { key: string; label: string; href: string; icon?: string }[]
  activeKey: string
}

/**
 * Same control as before (explicit active-state signifier: the selected
 * segment lifts off the track), now with a sliding indicator that
 * animates between positions on click instead of just snapping.
 */
export function SegmentedTabs({ items, activeKey }: SegmentedTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null)

  function measure(key: string) {
    const el = linkRefs.current[key]
    const container = containerRef.current
    if (el && container) {
      const elRect = el.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      setIndicator({ left: elRect.left - containerRect.left, width: elRect.width })
    }
  }

  useEffect(() => {
    measure(activeKey)
    const onResize = () => measure(activeKey)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeKey, items.length])

  return (
    <div className="segmented-tabs" ref={containerRef}>
      {indicator && (
        <span
          className="segmented-tabs-indicator"
          style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
        />
      )}
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          ref={(el) => { linkRefs.current[item.key] = el }}
          className={`segmented-tab ${item.key === activeKey ? 'active' : ''}`}
          onClick={() => measure(item.key)}
        >
          {item.icon && <span>{item.icon}</span>}{item.label}
        </Link>
      ))}
    </div>
  )
}
