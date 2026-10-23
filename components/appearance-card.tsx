'use client'
import { useEffect, useState } from 'react'
import { useTheme } from '@/components/theme-toggle'

type Pet = 'cat' | 'dog' | 'off'

export function AppearanceCard() {
  const [theme, setTheme] = useTheme()
  const [pet, setPet] = useState<Pet>('off')
  useEffect(() => {
    try { const v = localStorage.getItem('mort-pet'); if (v === 'cat' || v === 'dog') setPet(v) } catch {}
  }, [])
  function choose(v: Pet) {
    setPet(v)
    try { localStorage.setItem('mort-pet', v) } catch {}
    window.dispatchEvent(new CustomEvent('mort-pet-change', { detail: v }))
  }
  const act = (a: 'put' | 'drop') => window.dispatchEvent(new CustomEvent('mort-pet-action', { detail: a }))
  return (
    <div className="card">
      <h3>Appearance</h3>
      <div className="appearance-row">
        <span>Theme</span>
        <div className="appearance-seg" role="group" aria-label="Theme">
          <button type="button" className="btn sm" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>Dark</button>
          <button type="button" className="btn sm" aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>Light</button>
        </div>
      </div>
      <div className="appearance-row">
        <span>Companion</span>
        <div className="appearance-seg" role="group" aria-label="Companion">
          {(['cat', 'dog', 'off'] as Pet[]).map(v => (
            <button key={v} type="button" className="btn sm" aria-pressed={pet === v} onClick={() => choose(v)}>{v[0].toUpperCase() + v.slice(1)}</button>
          ))}
        </div>
      </div>
      {pet !== 'off' && (
        <div className="appearance-row">
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>Right click puts it down on a screen edge. Click it there to make it fall.</span>
          <div className="appearance-seg">
            <button type="button" className="btn sm" onClick={() => act('put')}>Put down / pick up</button>
            <button type="button" className="btn sm" onClick={() => act('drop')}>Let it fall</button>
          </div>
        </div>
      )}
    </div>
  )
}
