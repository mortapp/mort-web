'use client'
import { useEffect, useRef, useState } from 'react'

interface TabDef {
  key: string
  label: string
  icon?: string
  badge?: number
  content: React.ReactNode
}

interface Props {
  tabs: TabDef[]
}

/**
 * Same visual language as SegmentedTabs (sliding indicator), but switches
 * between already-rendered content client-side instead of navigating —
 * for cases like the admin dashboard where every section's data is fetched
 * once up front and paging between them shouldn't cost a round trip.
 */
export function LocalTabs({ tabs }: Props) {
  const [active, setActive] = useState(tabs[0]?.key)
  const containerRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null)

  function measure(key: string) {
    const el = btnRefs.current[key]
    const container = containerRef.current
    if (el && container) {
      const elRect = el.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      setIndicator({ left: elRect.left - containerRect.left, width: elRect.width })
    }
  }

  useEffect(() => {
    measure(active)
    const onResize = () => measure(active)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [active])

  const activeTab = tabs.find((t) => t.key === active) || tabs[0]

  return (
    <div>
      <div className="segmented-tabs" ref={containerRef} style={{ marginBottom: 24 }}>
        {indicator && (
          <span
            className="segmented-tabs-indicator"
            style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
          />
        )}
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            ref={(el) => { btnRefs.current[tab.key] = el }}
            className={`segmented-tab ${tab.key === active ? 'active' : ''}`}
            onClick={() => setActive(tab.key)}
          >
            {tab.icon && <span>{tab.icon}</span>}{tab.label}
            {!!tab.badge && <span className="tab-badge" style={{ marginLeft: 6 }}>{tab.badge}</span>}
          </button>
        ))}
      </div>
      <div key={activeTab?.key} style={{ animation: 'fadeInUp 0.3s cubic-bezier(0.16,1,0.3,1) both' }}>
        {activeTab?.content}
      </div>
    </div>
  )
}
