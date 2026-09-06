import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sceneProfile } from '../components/mort/scene/profile'
test('public chapters receive distinct scenes and workspace is explicitly quiet', () => {
  assert.equal(sceneProfile('/'), 'home')
  assert.equal(sceneProfile('/safety'), 'safety')
  assert.equal(sceneProfile('/legal/privacy'), 'legal')
  assert.equal(sceneProfile('/privacy'), 'legal')
  assert.equal(sceneProfile('/login'), 'auth')
  assert.equal(sceneProfile('/app/teen/jobs'), 'app')
  assert.equal(sceneProfile('/application'), 'home')
})
