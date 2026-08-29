'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
}

/**
 * "Text appearing" animation for numbers — counts up from 0 to the real
 * value on mount instead of just being static. Respects
 * prefers-reduced-motion by collapsing the animation to a single frame
 * (still goes through requestAnimationFrame, just resolves immediately).
 */
export function CountUp({ value, duration = 900, prefix = '', suffix = '' }: Props) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const effectiveDuration = reduceMotion ? 0 : duration
    let raf: number
    startRef.current = null
    function tick(ts: number) {
      if (startRef.current === null) startRef.current = ts
      const elapsed = ts - (startRef.current as number)
      const progress = effectiveDuration === 0 ? 1 : Math.min(1, elapsed / effectiveDuration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <>{prefix}{display.toLocaleString()}{suffix}</>
}
