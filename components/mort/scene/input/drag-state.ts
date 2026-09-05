export function createDragState() {
  return { pointerId: null as number | null, x: 0, y: 0, vx: 0, vy: 0, energy: 0, time: 0, sequence: 0 }
}
export type DragState = ReturnType<typeof createDragState>
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export function beginDrag(s: DragState, id: number, button: number, primary: boolean, x: number, y: number, time: number) {
  if (button !== 0 || !primary || s.pointerId !== null) return false
  s.pointerId = id
  s.x = x; s.y = y; s.time = time
  return true
}
export function moveDrag(s: DragState, id: number, x: number, y: number, time: number) {
  if (s.pointerId !== id) return false
  const dt = Math.max(8, time - s.time)
  s.vx = clamp((x - s.x) / dt, -3, 3)
  s.vy = clamp((y - s.y) / dt, -3, 3)
  s.energy = clamp(Math.hypot(s.vx, s.vy) * 0.55, 0, 1)
  s.x = x; s.y = y; s.time = time; s.sequence++
  return true
}
export function endDrag(s: DragState, cancel = false) {
  s.pointerId = null
  if (cancel) { s.vx = 0; s.vy = 0; s.energy = 0 }
}
export function decayDrag(s: DragState, delta: number) {
  const damping = Math.exp(-3.5 * Math.min(delta, 0.05))
  s.energy *= damping; s.vx *= damping; s.vy *= damping
}
