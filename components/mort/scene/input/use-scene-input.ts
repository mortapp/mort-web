'use client'
import { useEffect, useRef } from 'react'
import { beginDrag, createDragState, endDrag, moveDrag } from './drag-state'

const UI = 'a,button,input,textarea,select,label,form,nav,summary,video,audio,[role="button"],[role="dialog"],[role="slider"],[role="link"],[role="textbox"],[contenteditable="true"],[data-no-scene],p,h1,h2,h3,h4,li'

export function useSceneInput(enabled: boolean) {
  const drag = useRef(createDragState())
  useEffect(() => {
    if (!enabled) return
    const state = drag.current
    let target: HTMLElement | null = null
    let originX = 0, originY = 0, pendingTouch = false
    const release = (cancel = false) => {
      const id = state.pointerId
      endDrag(state, cancel)
      if (id !== null && target?.hasPointerCapture(id)) target.releasePointerCapture(id)
      target = null; pendingTouch = false
      document.documentElement.removeAttribute('data-scene-dragging')
    }
    const down = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || event.target.closest(UI)) return
      const zone = event.target.closest<HTMLElement>('[data-scene-drag]')
      if (event.pointerType === 'touch' && !zone) return
      if (!beginDrag(state, event.pointerId, event.button, event.isPrimary, event.clientX, event.clientY, event.timeStamp)) return
      target = zone || (event.target instanceof HTMLElement ? event.target : event.target.parentElement)
      if (!target) { release(true); return }
      originX = event.clientX; originY = event.clientY
      pendingTouch = event.pointerType === 'touch'
      if (!pendingTouch) target.setPointerCapture(event.pointerId)
    }
    const move = (event: PointerEvent) => {
      if (event.pointerId !== state.pointerId) return
      if ((event.buttons & 1) === 0) { release(); return }
      if (pendingTouch) {
        const dx = Math.abs(event.clientX - originX), dy = Math.abs(event.clientY - originY)
        if (dy > 8 && dy > dx) { release(true); return }
        if (dx < 10 || dx < dy * 1.3) return
        pendingTouch = false
        target?.setPointerCapture(event.pointerId)
      }
      moveDrag(state, event.pointerId, event.clientX, event.clientY, event.timeStamp)
      if (state.energy > 0.01) document.documentElement.dataset.sceneDragging = 'true'
    }
    const up = (e: PointerEvent) => { if (e.pointerId === state.pointerId) release() }
    const cancel = () => release(true)
    const lostCapture = (event: PointerEvent) => { if (event.pointerId === state.pointerId) cancel() }
    const visibility = () => { if (document.hidden) cancel() }
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    window.addEventListener('lostpointercapture', lostCapture)
    window.addEventListener('blur', cancel)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      cancel()
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
      window.removeEventListener('lostpointercapture', lostCapture)
      window.removeEventListener('blur', cancel)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [enabled])
  return drag
}
