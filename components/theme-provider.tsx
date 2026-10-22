'use client'

import { useEffect } from 'react'

const THEME_KEY = 'mort-theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let theme: 'dark' | 'light' = 'dark'
    try {
      theme = window.localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
    } catch {
      // If storage is unavailable, keep the accessible dark default.
    }
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [])

  return <>{children}</>
}
