'use client'

// MORT voyage atmosphere — a calm fjord at first light, sitting behind the whole
// product. Restrained (dimmed) inside the authenticated app so UI stays legible.
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function MortAtmosphere() {
  const ref = useRef<HTMLCanvasElement>(null)
  const pathname = usePathname()
  const modeRef = useRef<'site' | 'app'>('site')

  useEffect(() => {
    modeRef.current = pathname && pathname.startsWith('/app') ? 'app' : 'site'
  }, [pathname])

  useEffect(() => {
    const cvs = ref.current
    if (!cvs) return
    const g = cvs.getContext('2d')
    if (!g) return
    const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0, t = 0, last = 0, waterY = 0, lightX = 0, raf = 0
    let stars: any[] = [], snow: any[] = [], ripples: any[] = [], headL: any = null, headR: any = null, ship: any = null
    let pnx = 0, pny = 0, px = 0, py = 0
    const rand = (a: number, b: number) => a + Math.random() * (b - a)
    const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
    const lerp = (a: number, b: number, f: number) => a + (b - a) * f
    const mul = (a: number) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296 }
    const tint = ['#fff', '#fff', '#eef3fb', '#d7e1ee', '#b7c6de']

    function size() { cvs.width = Math.round(w * DPR); cvs.height = Math.round(h * DPR); cvs.style.width = w + 'px'; cvs.style.height = h + 'px'; g.setTransform(DPR, 0, 0, DPR, 0, 0) }
    function mk(side: string) {
      const r = mul(side === 'left' ? 20482 : 77113)
      const ox = side === 'left' ? -w * 0.02 : w * 1.02
      const ix = side === 'left' ? w * (0.34 + r() * 0.03) : w * (0.66 - r() * 0.03)
      const ty = h * (0.30 + r() * 0.05); const N = 40; const pts: any[] = []
      const o1 = r() * 6.28, o2 = r() * 6.28, o3 = r() * 6.28
      for (let i = 0; i <= N; i++) { const f = i / N, x = lerp(ox, ix, f), tp = Math.pow(1 - f, 0.8); const ro = Math.sin(f * 7 + o1) * 0.55 + Math.sin(f * 17 + o2) * 0.28 + Math.sin(f * 31 + o3) * 0.14; let y = lerp(ty, waterY, Math.pow(f, 1.22)) - ro * tp * h * 0.045; if (y > waterY) y = waterY; pts.push({ x, y }) }
      const trees: any[] = []
      for (let i = 3; i < N - 5; i++) if (r() < 0.22) { const p = pts[i]; trees.push({ x: p.x, y: p.y, s: lerp(h * 0.024, h * 0.011, i / N) * (0.7 + r() * 0.6) }) }
      return { pts, trees, ix, ox }
    }
    function build() {
      waterY = h * 0.66; lightX = w * 0.5
      stars = []; const n = clamp(Math.floor((w * h) / 13000), 50, 150)
      for (let i = 0; i < n; i++) stars.push({ x: rand(0, w), y: rand(h * 0.02, waterY - h * 0.03), r: Math.random() < 0.85 ? rand(0.35, 1.05) : rand(0.9, 1.7), a: rand(0.12, 0.7), ph: rand(0, 6.28), tw: rand(0.4, 1.5), c: tint[(Math.random() * tint.length) | 0] })
      snow = []; const m = clamp(Math.floor((w * h) / 18000), 40, 120)
      for (let i = 0; i < m; i++) { const d = Math.random(); snow.push({ x: rand(0, w), y: rand(0, h), r: lerp(0.5, 2, d), vy: lerp(0.08, 0.4, d), sw: lerp(6, 20, d), ss: rand(0.0004, 0.0011), ph: rand(0, 6.28), a: lerp(0.1, 0.5, d), d }) }
      ripples = []; for (let i = 0; i < 6; i++) ripples.push({ p: Math.random(), sp: rand(0.006, 0.016), a: rand(0.03, 0.09), bow: rand(0.4, 1) })
      headL = mk('left'); headR = mk('right')
      ship = { bx: w * 0.5, x: w * 0.5, y: waterY + h * 0.012, s: Math.min(w, h) * 0.028, ph: rand(0, 6.28), rg: w * 0.05 }
    }
    function resize() { const nw = window.innerWidth, nh = window.innerHeight; const st = nw !== w || Math.abs(nh - h) > 120 || !stars.length; w = nw; h = nh; size(); if (st) build(); if (REDUCE) frame(0) }

    function frame(off: number) {
      g.clearRect(0, 0, w, h)
      let s = g.createLinearGradient(0, 0, 0, waterY); s.addColorStop(0, '#02040a'); s.addColorStop(0.55, '#060c17'); s.addColorStop(1, '#0b1626'); g.fillStyle = s; g.fillRect(0, 0, w, waterY + 2)
      g.save(); g.translate(off * 2, off); for (const st of stars) { const tw = (Math.sin(t * 0.0013 * st.tw + st.ph) + 1) * 0.5; g.globalAlpha = st.a * (0.55 + tw * 0.45); g.fillStyle = st.c; g.beginPath(); g.arc(st.x, st.y, st.r, 0, 6.283); g.fill() } g.globalAlpha = 1; g.restore()
      g.save(); g.globalCompositeOperation = 'lighter'; const bs: any[] = [[0.30, 0.026, 0.16, 1.3, 0.000028, 0, '120,156,212', 0.075], [0.35, 0.02, 0.13, 2, 0.000044, 2.4, '164,192,230', 0.05]]
      for (const b of bs) { const by = h * b[0], am = h * b[1], bo = by + h * b[2], step = Math.max(12, w / 80); g.beginPath(); g.moveTo(-30 + off * 4, bo); for (let x = -30; x <= w + 30; x += step) { const nx = x / w, y = by + Math.sin(nx * 6.283 * b[3] + t * b[4] + b[5]) * am + Math.sin(nx * 6.283 * b[3] * 2.4 - t * b[4] * 1.7) * am * 0.3; g.lineTo(x + off * 4, y) } g.lineTo(w + 30, bo); g.closePath(); const gr = g.createLinearGradient(0, by - am, 0, bo); gr.addColorStop(0, `rgba(${b[6]},0)`); gr.addColorStop(0.14, `rgba(${b[6]},${b[7]})`); gr.addColorStop(0.5, `rgba(${b[6]},${b[7] * 0.4})`); gr.addColorStop(1, `rgba(${b[6]},0)`); g.fillStyle = gr; g.fill() } g.restore()
      g.save(); g.globalCompositeOperation = 'lighter'; const R = Math.min(w, h) * 0.85; let gl = g.createRadialGradient(lightX, waterY, 0, lightX, waterY, R); gl.addColorStop(0, 'rgba(224,235,248,.37)'); gl.addColorStop(0.1, 'rgba(180,200,228,.15)'); gl.addColorStop(0.3, 'rgba(96,124,170,.06)'); gl.addColorStop(1, 'rgba(20,30,52,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, waterY + 4); let c = g.createRadialGradient(lightX, waterY, 0, lightX, waterY, Math.min(w, h) * 0.18); c.addColorStop(0, 'rgba(240,247,255,.44)'); c.addColorStop(1, 'rgba(240,247,255,0)'); g.fillStyle = c; g.fillRect(0, 0, w, waterY + 4); g.restore()
      let se = g.createLinearGradient(0, waterY, 0, h); se.addColorStop(0, '#132238'); se.addColorStop(0.14, '#0b1526'); se.addColorStop(1, '#03060d'); g.fillStyle = se; g.fillRect(0, waterY, w, h - waterY + 1)
      let hl = g.createLinearGradient(0, 0, w, 0); hl.addColorStop(0, 'rgba(150,172,208,0)'); hl.addColorStop(0.5, 'rgba(232,242,255,.5)'); hl.addColorStop(1, 'rgba(150,172,208,0)'); g.fillStyle = hl; g.fillRect(0, waterY - 1.2, w, 2.4)
      g.save(); g.globalCompositeOperation = 'lighter'; const tH = w * 0.01, bH = w * 0.07, rows = Math.max(20, Math.floor((h - waterY) / 6)); for (let i = 0; i < rows; i++) { const f = i / rows, y = waterY + f * (h - waterY), hf = lerp(tH, bH, f), fa = Math.pow(1 - f, 1.3) * 0.92 + 0.04, cx = lightX + Math.sin(f * 22 + t * 0.0009) * hf * 0.22, a = 0.19 * fa * (0.62 + 0.38 * Math.sin(f * 55 + t * 0.004)); const gy = g.createLinearGradient(cx - hf, 0, cx + hf, 0); gy.addColorStop(0, 'rgba(224,238,255,0)'); gy.addColorStop(0.5, `rgba(240,248,255,${a})`); gy.addColorStop(1, 'rgba(224,238,255,0)'); g.fillStyle = gy; g.fillRect(cx - hf, y, hf * 2, lerp(2.2, 5.2, f)) } g.restore()
      g.save(); g.globalCompositeOperation = 'lighter'; g.lineWidth = 1; for (const r of ripples) { const y = waterY + r.p * (h - waterY), f = (y - waterY) / (h - waterY); g.strokeStyle = `rgba(170,192,224,${r.a * (0.4 + f * 0.6)})`; g.beginPath(); const dip = 5 + f * 16 * r.bow; g.moveTo(-10, y); g.quadraticCurveTo(w * 0.5, y + dip, w + 10, y); g.stroke() } g.restore()
      const SH = ship.s, sx = ship.x + off * 1.8, sy = ship.y + Math.sin(t * 0.0006 + ship.ph) * SH * 0.1, tl = Math.sin(t * 0.0006 + ship.ph) * 0.03; g.save(); g.translate(sx, sy); g.rotate(tl); g.beginPath(); g.moveTo(-SH * 1.15, -SH * 0.5); g.lineTo(-SH * 0.98, 0); g.quadraticCurveTo(0, SH * 0.26, SH * 0.98, 0); g.lineTo(SH * 1.15, -SH * 0.55); g.quadraticCurveTo(SH * 0.95, -SH * 0.28, SH * 0.6, -SH * 0.16); g.lineTo(-SH * 0.6, -SH * 0.16); g.quadraticCurveTo(-SH * 0.95, -SH * 0.26, -SH * 1.15, -SH * 0.5); g.closePath(); g.fillStyle = '#04070d'; g.fill(); g.strokeStyle = '#04070d'; g.lineWidth = Math.max(1, SH * 0.05); g.beginPath(); g.moveTo(0, -SH * 0.16); g.lineTo(0, -SH * 1.25); g.stroke(); g.beginPath(); g.moveTo(-SH * 0.5, -SH * 1.12); g.lineTo(SH * 0.5, -SH * 1.12); g.lineTo(SH * 0.6, -SH * 0.42); g.lineTo(-SH * 0.6, -SH * 0.42); g.closePath(); g.fillStyle = '#060a12'; g.fill(); g.strokeStyle = 'rgba(206,220,244,.32)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-SH * 0.6, -SH * 0.42); g.lineTo(SH * 0.6, -SH * 0.42); g.moveTo(SH * 0.6, -SH * 0.42); g.lineTo(SH * 0.5, -SH * 1.12); g.stroke(); g.restore()
      for (const H of [headL, headR]) { g.save(); g.translate(off * 8, 0); g.beginPath(); g.moveTo(H.pts[0].x, H.pts[0].y); for (let i = 1; i < H.pts.length; i++) g.lineTo(H.pts[i].x, H.pts[i].y); g.lineTo(H.ix, waterY); g.lineTo(H.ox, waterY); g.closePath(); const bd = g.createLinearGradient(0, H.pts[0].y, 0, waterY); bd.addColorStop(0, '#070b14'); bd.addColorStop(1, '#020409'); g.fillStyle = bd; g.fill(); for (let i = 1; i < H.pts.length; i++) { const f = i / H.pts.length; g.strokeStyle = `rgba(188,206,236,${0.05 + f * 0.16})`; g.lineWidth = 1; g.beginPath(); g.moveTo(H.pts[i - 1].x, H.pts[i - 1].y); g.lineTo(H.pts[i].x, H.pts[i].y); g.stroke() } for (const tr of H.trees) { g.fillStyle = '#04060c'; const bx = tr.x, by = tr.y, s2 = tr.s; g.beginPath(); g.moveTo(bx, by - s2); g.lineTo(bx - s2 * 0.34, by); g.lineTo(bx + s2 * 0.34, by); g.closePath(); g.moveTo(bx, by - s2 * 0.55); g.lineTo(bx - s2 * 0.44, by - s2 * 0.05); g.lineTo(bx + s2 * 0.44, by - s2 * 0.05); g.closePath(); g.fill() } g.restore() }
      g.save(); g.translate(off * 10, 0); for (const p of snow) { p.y += p.vy; const sx2 = p.x + Math.sin(t * p.ss + p.ph) * p.sw; if (p.y > h + 4) { p.y = -4; p.x = rand(0, w) } g.globalAlpha = p.a; g.fillStyle = p.d > 0.6 ? '#f4f8ff' : '#cfd9ea'; g.beginPath(); g.arc(sx2, p.y, p.r, 0, 6.283); g.fill() } g.globalAlpha = 1; g.restore()
      if (modeRef.current === 'app') { g.fillStyle = 'rgba(3,6,12,.62)'; g.fillRect(0, 0, w, h) }
    }
    function loop(ts: number) { if (!last) last = ts; let dt = ts - last; last = ts; if (dt > 60) dt = 60; t += dt; const sx = Math.sin(t * 0.00006) * 0.34, sy = Math.cos(t * 0.000045) * 0.22; px += (clamp(pnx + sx, -1, 1) - px) * 0.04; py += (clamp(pny + sy, -1, 1) - py) * 0.04; ship.x = ship.bx + Math.sin(t * 0.00013 + ship.ph) * ship.rg; frame(px); raf = requestAnimationFrame(loop) }

    let rt: any
    const onResize = () => { clearTimeout(rt); rt = setTimeout(resize, 150) }
    const onMove = (e: PointerEvent) => { pnx = clamp((e.clientX / w - 0.5) * 2, -1, 1); pny = clamp((e.clientY / h - 0.5) * 2, -1, 1) }
    const onVis = () => { if (!document.hidden) last = 0 }
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('visibilitychange', onVis)
    resize()
    if (!REDUCE) raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); clearTimeout(rt); window.removeEventListener('resize', onResize); window.removeEventListener('pointermove', onMove); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  return (<><canvas id="mort-sky" ref={ref} aria-hidden="true" /><div className="mort-vignette" aria-hidden="true" /></>)
}
