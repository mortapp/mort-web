import { readFile } from 'node:fs/promises'
import { getLegalPublicationMismatches } from '../lib/legal-publication.mjs'

const [siteDocuments, manifest] = await Promise.all([
  readFile(new URL('../content/legal-documents.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../content/legal-publication-manifest.json', import.meta.url), 'utf8').then(JSON.parse),
])

const mismatches = getLegalPublicationMismatches(siteDocuments, manifest)

if (mismatches.length) {
  console.error(`Legal publication verification failed with ${mismatches.length} mismatch(es):`)
  for (const mismatch of mismatches) console.error(`- ${mismatch}`)
  process.exitCode = 1
} else {
  console.log('Legal publication verification passed: all four versions and SHA-256 hashes match the verified production snapshot.')
}
