'use client'
import { useState } from 'react'
import { categoryIcons, categoryColors } from '@/components/ui'
import { JOB_CATEGORIES } from '@/lib/categories'

interface Props {
  name: string
  defaultValue?: string
}

export function CategoryPicker({ name, defaultValue = 'pet_care' }: Props) {
  const [selected, setSelected] = useState(defaultValue)

  return (
    <div>
      <input type="hidden" name={name} value={selected} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 8 }}>
        {JOB_CATEGORIES.map((opt) => {
          const color = categoryColors[opt.value] || 'muted'
          const icon = categoryIcons[opt.value] || opt.icon || '⚡'
          const active = selected === opt.value
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`category-tile ${active ? 'active' : ''}`}
              style={{ padding: '12px 8px', gap: 6, cursor: 'pointer', border: active ? undefined : undefined }}
              title={opt.label}
            >
              <div className={`category-tile-icon ${color}`} style={{ width: 36, height: 36, borderRadius: 10, fontSize: 16 }}>{icon}</div>
              <span style={{ fontSize: 11, fontWeight: 650, textTransform: 'capitalize', lineHeight: 1.2 }}>{opt.short}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
