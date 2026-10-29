import type { Metadata } from 'next'
import { LegalDocumentPage } from '@/components/legal-document-page'
import documents from '@/content/legal-documents.json'

export const metadata: Metadata = {
  title: 'Safety Rules | MORT',
  description: 'Published MORT Safety Rules, version MORT-SAFETY-2026-10.',
}

export default function SafetyRulesPage() {
  return <LegalDocumentPage document={documents.safety} />
}
