'use client'
import { useState } from 'react'
import { categoryIcons, categoryColors } from '@/components/ui'

const OPTIONS = [
  { value: 'pet_care', label: 'Pet care' },
  { value: 'yard_work', label: 'Yard work' },
  { value: 'tutoring', label: 'Tutoring' },
  { value: 'household_help', label: 'Household help' },
  { value: 'moving_help', label: 'Moving help' },
  { value: 'tech_help', label: 'Tech help' },
  { value: 'other', label: 'Other' },
]

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
        {OPTIONS.map((opt) => {
          const color = categoryColors[opt.label.toLowerCase()] || 'muted'
          const icon = categoryIcons[opt.label.toLowerCase()] || '⚡'
          const active = selected === opt.value
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`category-tile ${active ? 'active' : ''}`}
              style={{ padding: '12px 8px', gap: 6, cursor: 'pointer', border: active ? undefined : undefined }}
            >
              <div className={`category-tile-icon ${color}`} style={{ width: 36, height: 36, borderRadius: 10, fontSize: 16 }}>{icon}</div>
              <span style={{ fontSize: 11, fontWeight: 650, textTransform: 'capitalize', lineHeight: 1.2 }}>{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
