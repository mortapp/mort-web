'use client'
import { useSyncExternalStore } from 'react'
import { useTheme } from '@/components/theme-toggle'

type Pet = 'cat' | 'dog' | 'off'
const petChangeEvent = 'mort-pet-change'

function subscribeToPetChanges(onStoreChange: () => void) {
  window.addEventListener(petChangeEvent, onStoreChange)
  window.addEventListener('storage', onStoreChange)
  return () => {
    window.removeEventListener(petChangeEvent, onStoreChange)
    window.removeEventListener('storage', onStoreChange)
  }
}

function getPetSnapshot(): Pet {
  try {
    const value = localStorage.getItem('mort-pet')
    return value === 'cat' || value === 'dog' ? value : 'off'
  } catch {
    return 'off'
  }
}

function getServerPetSnapshot(): Pet {
  return 'off'
}

export function AppearanceCard() {
  const [theme, setTheme] = useTheme()
  const pet = useSyncExternalStore(subscribeToPetChanges, getPetSnapshot, getServerPetSnapshot)
  function choose(v: Pet) {
    try { localStorage.setItem('mort-pet', v) } catch {}
    window.dispatchEvent(new Event(petChangeEvent))
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
