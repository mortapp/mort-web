import { createHash } from 'node:crypto'

const EXPECTED_PRODUCTION_PROJECT = 'jxbnrkasktbhtiujkhay'

export function getLegalPublicationMismatches(siteDocuments, manifest) {
  const mismatches = []

  if (manifest?.sourceProjectRef !== EXPECTED_PRODUCTION_PROJECT) {
    mismatches.push('manifest: source project is not the current production Supabase project')
  }

  const expectedDocuments = manifest?.documents || {}

  for (const name of ['terms', 'privacy', 'safety', 'community']) {
    const expected = expectedDocuments[name]
    const actual = siteDocuments?.[name]

    if (!expected || !actual) {
      mismatches.push(`${name}: published document metadata is missing`)
      continue
    }

    if (expected.status !== 'published') {
      mismatches.push(`${name}: production publication snapshot is not marked published`)
    }

    if (actual.documentKey !== expected.documentKey) {
      mismatches.push(`${name}: document key differs from the published record`)
    }

    if (actual.version !== expected.version) {
      mismatches.push(`${name}: version label differs from the published record`)
    }

    const actualHash = createHash('sha256').update(actual.content || '', 'utf8').digest('hex')
    if (actualHash !== expected.contentSha256) {
      mismatches.push(`${name}: SHA-256 differs from the published record`)
    }
  }

  return mismatches
}
