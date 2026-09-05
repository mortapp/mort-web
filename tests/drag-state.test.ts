import test from 'node:test'
import assert from 'node:assert/strict'
import { createDragState, beginDrag, moveDrag, endDrag, decayDrag } from '../components/mort/scene/input/drag-state'

test('hover and right button cannot activate the field', () => {
  const state = createDragState()
  moveDrag(state, 1, 300, 200, 16)
  assert.equal(state.energy, 0)
  assert.equal(beginDrag(state, 1, 2, true, 100, 100, 0), false)
  assert.equal(beginDrag(state, 2, 0, false, 100, 100, 0), false)
  assert.equal(state.pointerId, null)
})
test('primary movement injects velocity and fast gestures carry more energy', () => {
  const slow = createDragState(), fast = createDragState()
  for (const state of [slow, fast]) beginDrag(state, 1, 0, true, 100, 100, 0)
  moveDrag(slow, 1, 110, 100, 100)
  moveDrag(fast, 1, 210, 100, 100)
  assert.ok(fast.energy > slow.energy)
  assert.ok(fast.vx > slow.vx)
  assert.equal(moveDrag(fast, 7, 500, 400, 116), false)
})
test('release retains inertia then decays and cancel clears immediately', () => {
  const state = createDragState()
  beginDrag(state, 1, 0, true, 100, 100, 0)
  moveDrag(state, 1, 300, 200, 16)
  endDrag(state)
  const energy = state.energy
  assert.ok(energy > 0)
  for (let i = 0; i < 180; i++) decayDrag(state, 1 / 60)
  assert.ok(state.energy < energy * 0.001)
  beginDrag(state, 2, 0, true, 0, 0, 1000)
  moveDrag(state, 2, 300, 200, 1016)
  endDrag(state, true)
  assert.equal(state.energy, 0)
  assert.equal(state.vx, 0)
})
test('duplicate timestamps and extreme movement stay finite and bounded', () => {
  const state = createDragState()
  beginDrag(state, 1, 0, true, 0, 0, 0)
  moveDrag(state, 1, 1e8, -1e8, 0)
  assert.ok(Number.isFinite(state.vx))
  assert.ok(Math.abs(state.vx) <= 3)
  assert.ok(state.energy <= 1)
})
