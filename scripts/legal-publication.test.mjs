import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'

test('legal publication verifier accepts matching published version and content hash', async () => {
  const legalPublication = await import('../lib/legal-publication.mjs').catch(() => ({}))
  assert.equal(typeof legalPublication.getLegalPublicationMismatches, 'function')

  const content = 'Approved terms body'
  const contentSha256 = createHash('sha256').update(content, 'utf8').digest('hex')
  const siteDocuments = Object.fromEntries(
    [
      ['terms', 'master_terms_of_service', 'MORT-LEGAL-2026-V3'],
      ['privacy', 'privacy_policy', 'MORT-PRIVACY-2026-10'],
      ['safety', 'safety_rules', 'MORT-SAFETY-2026-10'],
      ['community', 'community_guidelines', 'MORT-COMMUNITY-2026-10'],
    ].map(([name, documentKey, version]) => [name, { documentKey, version, content }]),
  )
  const manifest = {
    documents: {
      ...Object.fromEntries(
        Object.entries(siteDocuments).map(([name, document]) => [name, {
          documentKey: document.documentKey,
          version: document.version,
          status: 'published',
          contentSha256,
        }]),
      ),
    },
    sourceProjectRef: 'jxbnrkasktbhtiujkhay',
  }

  assert.deepEqual(legalPublication.getLegalPublicationMismatches(siteDocuments, manifest), [])
})

test('legal publication verifier reports version and content drift without exposing body text', async () => {
  const legalPublication = await import('../lib/legal-publication.mjs').catch(() => ({}))
  assert.equal(typeof legalPublication.getLegalPublicationMismatches, 'function')

  const siteDocuments = {
    terms: { documentKey: 'master_terms_of_service', version: 'wrong-version', content: 'private body text' },
  }
  const manifest = {
    documents: {
      ...Object.fromEntries(
        [
          ['terms', 'master_terms_of_service', 'MORT-LEGAL-2026-V3'],
          ['privacy', 'privacy_policy', 'MORT-PRIVACY-2026-10'],
          ['safety', 'safety_rules', 'MORT-SAFETY-2026-10'],
          ['community', 'community_guidelines', 'MORT-COMMUNITY-2026-10'],
        ].map(([name, documentKey, version]) => [name, {
          documentKey,
          version,
          status: 'published',
          contentSha256: '0'.repeat(64),
        }]),
      ),
    },
    sourceProjectRef: 'jxbnrkasktbhtiujkhay',
  }
  const result = legalPublication.getLegalPublicationMismatches(siteDocuments, manifest)

  assert.equal(result.some((issue) => issue.includes('version')), true)
  assert.equal(result.some((issue) => issue.includes('SHA-256')), true)
  assert.equal(result.join('\n').includes('private body text'), false)
})
