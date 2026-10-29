import type { Metadata } from 'next'
import { LegalDocumentPage } from '@/components/legal-document-page'
import documents from '@/content/legal-documents.json'

export const metadata: Metadata = {
  title: 'Privacy Policy | MORT',
  description: 'Published MORT Privacy Policy, version MORT-PRIVACY-2026-10.',
}

export default function PrivacyPage() {
  return <LegalDocumentPage document={documents.privacy} />
}
