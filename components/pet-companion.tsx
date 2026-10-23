'use client'
// Optional cat/dog companion. Off by default; chosen in Profile > Appearance.
// Decorative only: hidden from assistive tech, ignores pointer events unless parked.
import { useEffect, useRef } from 'react'

const CAT = '<svg viewBox="0 0 60 48" stroke="var(--ps)" stroke-width="1.4" stroke-linejoin="round"><path class="tail" d="M12 30c-9 1-12-9-6-14" fill="none" stroke-linecap="round" stroke-width="4" stroke="var(--pe)"/><rect class="leg l3" x="19" y="34" width="5" height="11" rx="2.5" fill="var(--pe)"/><rect class="leg l4" x="38" y="34" width="5" height="11" rx="2.5" fill="var(--pe)"/><ellipse cx="28" cy="31" rx="18" ry="10" fill="var(--pf)"/><rect class="leg l1" x="14" y="35" width="5" height="10" rx="2.5" fill="var(--pf)"/><rect class="leg l2" x="33" y="35" width="5" height="10" rx="2.5" fill="var(--pf)"/><path class="ear" d="M37 17 38 6 45 12Z" fill="var(--pf)"/><path class="ear" d="M47 12 54 6 55 18Z" fill="var(--pf)"/><circle cx="46" cy="22" r="10" fill="var(--pf)"/><ellipse class="eye" cx="49" cy="21" rx="1.6" ry="2.3" fill="var(--ink)" stroke="none"/><path d="M54 24h3l-1.5 2Z" fill="var(--bl)" stroke="none"/><path d="M50 26l8 1M50 27l8 3" fill="none" opacity=".55" stroke-linecap="round"/></svg>'
const DOG = '<svg viewBox="0 0 60 48" stroke="var(--ps)" stroke-width="1.4" stroke-linejoin="round"><path class="tail" d="M11 28c-6-2-8-8-5-12" fill="none" stroke-linecap="round" stroke-width="4" stroke="var(--pe)"/><rect class="leg l3" x="19" y="34" width="5" height="11" rx="2.5" fill="var(--pe)"/><rect class="leg l4" x="38" y="34" width="5" height="11" rx="2.5" fill="var(--pe)"/><ellipse cx="28" cy="31" rx="18" ry="10" fill="var(--pf)"/><rect class="leg l1" x="14" y="35" width="5" height="10" rx="2.5" fill="var(--pf)"/><rect class="leg l2" x="33" y="35" width="5" height="10" rx="2.5" fill="var(--pf)"/><circle cx="44" cy="21" r="9.5" fill="var(--pf)"/><ellipse cx="53" cy="25" rx="6" ry="4.2" fill="var(--pf)"/><ellipse cx="57.5" cy="23.5" rx="2" ry="1.5" fill="var(--ink)" stroke="none"/><ellipse class="ear dear" cx="40" cy="23" rx="4" ry="8" transform="rotate(10 40 23)" fill="var(--pe)"/><ellipse class="eye" cx="47" cy="19" rx="1.6" ry="2.3" fill="var(--ink)" stroke="none"/><path class="tongue" d="M52 28h3v4a1.5 1.5 0 0 1-3 0Z" fill="var(--bl)" stroke="none"/></svg>'
const SAY = { cat: { l: 'purr', p: 'mrrp' }, dog: { l: 'woof!', p: 'woof' } } as const
type Kind = 'cat' | 'dog' | 'off'
type Mode = 'follow' | 'goto' | 'perch' | 'fall'
type Edge = 'top' | 'bottom' | 'left' | 'right'

export function PetCompanion() {
  const petRef = useRef<HTMLDivElement>(null)
  const artRef = useRef<HTMLDivElement>(null)
  const flipRef = useRef<HTMLDivElement>(null)
  const bubRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const pet = petRef.current, art = artRef.current, flip = flipRef.current, bub = bubRef.current
    if (!pet || !art || !flip || !bub) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const HW = 24, HH = 19
    let W = innerWidth, H = innerHeight
    let kind: Kind = 'off', mode: Mode = 'follow'
    let cx = W - 60, cy = H - 40, tx = cx, ty = cy, ang = 0, dir = 1, vx = 0, vy = 0, spin = 0, bounced = false
    let perch: { e: Edge; t: number } = { e: 'bottom', t: 1 }
    let last = performance.now(), lastMove = last, sayT = 0, hapT = 0, raf = 0
    const cl = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

    function say(w: string, keep?: boolean) {
      bub!.textContent = w; bub!.classList.add('say'); clearTimeout(sayT)
      if (!keep) sayT = window.setTimeout(() => bub!.classList.remove('say'), 900)
    }
    function happy(w: string) {
      pet!.classList.remove('happy'); void pet!.offsetWidth; pet!.classList.add('happy'); say(w)
      clearTimeout(hapT); hapT = window.setTimeout(() => pet!.classList.remove('happy'), 650)
    }
    function edgeFor(px: number, py: number) {
      const d: Record<Edge, number> = { left: px, right: W - px, top: py, bottom: H - py }
      if (Math.min(px, W - px) < 80 && Math.min(py, H - py) < 80) return { e: (H - py < py ? 'bottom' : 'top') as Edge, t: px < W / 2 ? 0 : 1 }
      let e: Edge = 'bottom'
      for (const k of Object.keys(d) as Edge[]) if (d[k] < d[e]) e = k
      return { e, t: e === 'top' || e === 'bottom' ? px / W : py / H }
    }
    function spot() {
      const m = 2, a = { bottom: 0, top: 180, left: 90, right: -90 }[perch.e]
      let x: number, y: number
      if (perch.e === 'bottom' || perch.e === 'top') { x = cl(perch.t * W, HW, W - HW); y = perch.e === 'bottom' ? H - HH - m : HH + m }
      else { y = cl(perch.t * H, HW, H - HW); x = perch.e === 'left' ? HH + m : W - HH - m }
      return { x, y, a }
    }
    function sync() { pet!.classList.toggle('perch', mode === 'perch') }
    function putDown(px: number, py: number) {
      perch = edgeFor(px, py); say(kind === 'dog' ? SAY.dog.p : SAY.cat.p)
      if (reduce) { const s = spot(); cx = s.x; cy = s.y; ang = s.a; mode = 'perch' } else mode = 'goto'
      sync()
    }
    function pickUp() { mode = 'follow'; tx = cx; ty = cy; sync() }
    function drop() {
      if (mode !== 'perch') return
      if (reduce) { cy = H - HH - 2; ang = 0; mode = 'follow'; tx = cx; ty = cy; sync(); return }
      mode = 'fall'; bounced = false; vx = (Math.random() - 0.5) * 4; vy = -3; spin = (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 8)
      say('whoa'); sync()
    }
    function place() {
      pet!.style.transform = `translate(${cx - HW}px,${cy - HH}px) rotate(${ang}deg)`
      flip!.style.transform = `scaleX(${dir})`
      bub!.style.transform = `translate(${cx}px,${Math.max(2, cy - HH - 24)}px) translateX(-50%)`
    }
    function loop(ts: number) {
      const dt = Math.min((ts - last) / 16.7 || 1, 3); last = ts
      if (kind !== 'off') {
        const k = 1 - Math.pow(0.8, dt)
        let walking = false
        if (mode === 'follow') {
          if (!reduce) {
            const dx = tx - cx, dy = ty - cy, d = Math.hypot(dx, dy)
            cx += dx * k; cy += dy * k; if (Math.abs(dx) > 3) dir = dx < 0 ? -1 : 1
            walking = d > 10; ang += (0 - ang) * k
          }
        } else if (mode === 'goto') {
          const s = spot(), dx = s.x - cx, dy = s.y - cy, d = Math.hypot(dx, dy), k2 = 1 - Math.pow(0.86, dt)
          cx += dx * k2; cy += dy * k2; ang += (s.a - ang) * k2; if (Math.abs(dx) > 3) dir = dx < 0 ? -1 : 1
          walking = d > 4
          if (d < 2) { mode = 'perch'; cx = s.x; cy = s.y; ang = s.a; sync() }
        } else if (mode === 'perch') {
          const s = spot(); cx = s.x; cy = s.y; ang = s.a
        } else {
          vy += 0.75 * dt; cx = cl(cx + vx * dt, HW, W - HW); cy += vy * dt; ang += spin * dt
          const fl = H - HH - 2
          if (cy >= fl) {
            cy = fl
            if (vy > 6 && !bounced) { vy = -vy * 0.35; bounced = true; spin *= 0.4 }
            else {
              mode = 'follow'; ang = ((ang % 360) + 540) % 360 - 180; tx = cx; ty = cy
              pet!.classList.add('land'); window.setTimeout(() => pet!.classList.remove('land'), 450); sync()
            }
          }
        }
        const idle = performance.now() - lastMove
        const still = !walking && mode !== 'fall' && mode !== 'goto'
        const sl = still && idle > 12000
        pet!.classList.toggle('walk', walking)
        pet!.classList.toggle('sit', still && (mode === 'perch' || idle > 2500))
        pet!.classList.toggle('sleep', sl && !pet!.classList.contains('happy'))
        if (sl) { if (!bub!.classList.contains('say')) say('z z z', true) }
        else if (bub!.textContent === 'z z z') bub!.classList.remove('say')
        place()
      }
      raf = requestAnimationFrame(loop)
    }
    function set(v: Kind) {
      kind = v
      const off = v === 'off'
      pet!.hidden = off; bub!.hidden = off
      if (!off) art!.innerHTML = v === 'dog' ? DOG : CAT
      else { mode = 'follow'; bub!.classList.remove('say') }
      sync()
    }
    function load(): Kind { try { const v = localStorage.getItem('mort-pet'); return v === 'cat' || v === 'dog' ? v : 'off' } catch { return 'off' } }

    const onMove = (e: PointerEvent) => { lastMove = performance.now(); tx = cl(e.clientX + 26, HW, W - HW); ty = cl(e.clientY + 24, HH, H - HH) }
    const onDown = (e: PointerEvent) => { if (kind === 'off' || e.button !== 0) return; lastMove = performance.now(); happy(kind === 'dog' ? SAY.dog.l : SAY.cat.l) }
    const onPetDown = (e: PointerEvent) => { if (mode === 'perch') { e.stopPropagation(); drop() } }
    const onMenu = (e: MouseEvent) => {
      if (kind === 'off') return
      const t = e.target as Element | null
      if (t && t.closest && t.closest('input,textarea,select,a,button,[contenteditable="true"]')) return
      e.preventDefault(); lastMove = performance.now()
      if (mode === 'follow') putDown(e.clientX, e.clientY)
      else if (mode === 'perch' || mode === 'goto') pickUp()
    }
    const onResize = () => { W = innerWidth; H = innerHeight; tx = cl(tx, HW, W - HW); ty = cl(ty, HH, H - HH); if (mode === 'follow') { cx = cl(cx, HW, W - HW); cy = cl(cy, HH, H - HH) } }
    const onChange = () => set(load())
    const onAction = (e: Event) => {
      if (kind === 'off') return
      const a = (e as CustomEvent).detail
      if (a === 'drop') drop()
      else if (a === 'put') { if (mode === 'follow') putDown(cx, cy); else if (mode === 'perch' || mode === 'goto') pickUp() }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    pet.addEventListener('pointerdown', onPetDown)
    window.addEventListener('contextmenu', onMenu)
    window.addEventListener('resize', onResize)
    window.addEventListener('mort-pet-change', onChange)
    window.addEventListener('mort-pet-action', onAction)
    window.addEventListener('storage', onChange)
    set(load()); place(); raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf); clearTimeout(sayT); clearTimeout(hapT)
      window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerdown', onDown)
      pet.removeEventListener('pointerdown', onPetDown); window.removeEventListener('contextmenu', onMenu)
      window.removeEventListener('resize', onResize); window.removeEventListener('mort-pet-change', onChange)
      window.removeEventListener('mort-pet-action', onAction); window.removeEventListener('storage', onChange)
    }
  }, [])

  return (
    <>
      <span id="mort-pet-bub" ref={bubRef} hidden />
      <div id="mort-pet" ref={petRef} aria-hidden="true" hidden>
        <div id="mort-pet-flip" ref={flipRef}><div ref={artRef} /></div>
      </div>
    </>
  )
}
