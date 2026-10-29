import type { Metadata } from 'next'
import { LegalDocumentPage } from '@/components/legal-document-page'
import documents from '@/content/legal-documents.json'

export const metadata: Metadata = {
  title: 'Community Guidelines | MORT',
  description: 'Published MORT Community Guidelines, version MORT-COMMUNITY-2026-10.',
}

export default function CommunityPage() {
  return <LegalDocumentPage document={documents.community} />
}
