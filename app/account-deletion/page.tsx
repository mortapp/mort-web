import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = {
  title: 'Delete your MORT account | MORT',
  description: 'Request deletion of your MORT account and associated personal information without reinstalling the app.',
}

const privacyEmail = 'mortapp.help@gmail.com'

export default function AccountDeletionPage() {
  return (
    <>
      <SiteHeader />
      <main className="section container legal-page">
        <div className="kicker">Privacy and account access</div>
        <h1>Delete your MORT account</h1>
        <p className="lead legal-page-lead">
          You can request deletion of your MORT account and associated personal information without reinstalling the app.
        </p>
        <div className="legal-document">
          <h2>Request deletion by email</h2>
          <p>
            Email <a href={`mailto:${privacyEmail}?subject=MORT%20account%20deletion%20request`}>{privacyEmail}</a> with
            the subject “MORT account deletion request.” If possible, send it from the email address you use for MORT.
            If you no longer have access to that address, say so in your message so MORT can explain how to verify ownership.
          </p>
          <p>Do not send your password, verification codes, identity documents, or payment information in the request.</p>
          <h2>What happens next</h2>
          <p>
            MORT may need to verify that you own the account before acting on your request. Some records may be
            retained for limited purposes such as payment disputes, safety investigations, or legal obligations.
            See the <Link href="/legal/privacy">MORT Privacy Policy</Link> for more information about retention and your rights.
          </p>
        </div>
      </main>
    </>
  )
}
