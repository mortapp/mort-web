'use client'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/icons'

type Theme = 'dark' | 'light'

export function applyTheme(t: Theme) {
  document.documentElement.dataset.theme = t
  try { localStorage.setItem('mort-theme', t) } catch {}
  window.dispatchEvent(new CustomEvent('mort-theme-change', { detail: t }))
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>('light')
  useEffect(() => {
    const read = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
    read()
    window.addEventListener('mort-theme-change', read)
    return () => window.removeEventListener('mort-theme-change', read)
  }, [])
  return [theme, applyTheme]
}

export function ThemeToggle() {
  const [theme, set] = useTheme()
  const next: Theme = theme === 'dark' ? 'light' : 'dark'
  return (
    <button type="button" className="btn ghost sm theme-toggle" onClick={() => set(next)} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  )
}
