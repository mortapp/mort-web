'use client'
import { useState } from 'react'
import { categoryIcons, categoryColors } from '@/components/ui'

const OPTIONS = [
  'dog walking', 'lawn care', 'trash help', 'cleaning',
  'errands', 'tutoring', 'car washing', 'babysitting',
  'snow shoveling', 'raking leaves', 'moving', 'event help', 'general',
]

interface Props {
  name: string
  defaultValue?: string
}

export function CategoryPicker({ name, defaultValue = 'dog walking' }: Props) {
  const [selected, setSelected] = useState(defaultValue)

  return (
    <div>
      <input type="hidden" name={name} value={selected} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 8 }}>
        {OPTIONS.map((opt) => {
          const color = categoryColors[opt] || 'muted'
          const icon = categoryIcons[opt] || '⚡'
          const active = selected === opt
          return (
            <button
              type="button"
              key={opt}
              onClick={() => setSelected(opt)}
              className={`category-tile ${active ? 'active' : ''}`}
              style={{ padding: '12px 8px', gap: 6, cursor: 'pointer', border: active ? undefined : undefined }}
            >
              <div className={`category-tile-icon ${color}`} style={{ width: 36, height: 36, borderRadius: 10, fontSize: 16 }}>{icon}</div>
              <span style={{ fontSize: 11, fontWeight: 650, textTransform: 'capitalize', lineHeight: 1.2 }}>{opt}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
