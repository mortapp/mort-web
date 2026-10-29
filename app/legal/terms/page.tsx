import type { Metadata } from 'next'
import { LegalDocumentPage } from '@/components/legal-document-page'
import documents from '@/content/legal-documents.json'

export const metadata: Metadata = {
  title: 'Master Terms of Service | MORT',
  description: 'Published MORT Master Terms of Service, version MORT-LEGAL-2026-V3.',
}

export default function TermsPage() {
  return <LegalDocumentPage document={documents.terms} />
}
