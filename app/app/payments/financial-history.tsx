'use client'

import { useState } from 'react'
import { getFinancialDocument } from './actions'

type Event = {
  event_id?: string
  event_kind?: string
  event_type?: string
  title?: string
  display_subtitle?: string
  occurred_at?: string
  status?: string
  amount_cents?: number
  currency_code?: string
  receipt_id?: string | null
  order_number?: string | null
  no_receipt?: boolean
  document_type?: string | null
  safe_code?: string | null
}

type Document = {
  documentType: string
  receiptId: string
  orderNumber: string | null
  documentDate: string | null
  amountCents: number | null
  currencyCode: string
  status: string
  maskedProviderReference: string | null
  snapshot: unknown
  linkedDocumentRefs: unknown[]
}

function amount(cents: unknown, currency: unknown) {
  if (typeof cents !== 'number' || !Number.isSafeInteger(cents)) return null
  const code = typeof currency === 'string' && /^[A-Z]{3}$/.test(currency) ? currency : 'USD'
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(cents / 100)
  } catch {
    return `${(cents / 100).toFixed(2)} ${code}`
  }
}

function safeDate(value: unknown) {
  if (typeof value !== 'string') return 'Date unavailable'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString()
}

export function FinancialHistory({ items, message }: { items: Event[]; message?: string | null }) {
  const [documents, setDocuments] = useState<Record<string, Document>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function openReceipt(receiptId: string) {
    setLoading(receiptId)
    setError(null)
    try {
      const result = await getFinancialDocument(receiptId)
      if (result.ok === false) {
        setError(result.message)
        return
      }
      setDocuments((current) => ({ ...current, [receiptId]: result.document }))
    } catch {
      setError('The receipt could not be retrieved for this account.')
    } finally {
      setLoading(null)
    }
  }

  function downloadReceipt(receipt: Document) {
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${receipt.documentType.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${receipt.receiptId}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (message) return <div className="warning-box">{message}</div>
  if (items.length === 0) return <p className="muted">No financial events are available for this account yet.</p>

  return (
    <div className="financial-history">
      {items.map((item, index) => {
        const receiptId = typeof item.receipt_id === 'string' ? item.receipt_id : null
        const eventKey = item.event_id ?? `${item.event_type ?? item.event_kind ?? 'event'}-${index}`
        const formattedAmount = amount(item.amount_cents, item.currency_code)
        const receipt = receiptId ? documents[receiptId] : null
        return (
          <article className="card" key={eventKey}>
            <div className="history-heading">
              <div>
                <h3>{item.title ?? 'Financial activity'}</h3>
                <p className="muted">{item.display_subtitle ?? item.event_type ?? 'MORT financial record'}</p>
              </div>
              <span className="status-pill">{item.status ?? 'Recorded'}</span>
            </div>
            <p>{formattedAmount ?? 'Amount not available'} · {safeDate(item.occurred_at)}</p>
            {item.safe_code && <p className="muted">Reference: {item.safe_code}</p>}
            {receiptId && item.no_receipt !== true ? (
              <button className="btn ghost" type="button" disabled={loading === receiptId} onClick={() => void openReceipt(receiptId)}>
                {loading === receiptId ? 'Loading receipt…' : 'View receipt'}
              </button>
            ) : (
              <p className="muted">No receipt is available for this event.</p>
            )}
            {receipt && (
              <div className="receipt-view" aria-live="polite">
                <h4>{receipt.documentType}</h4>
                <p>Receipt {receipt.orderNumber ?? receipt.receiptId}</p>
                <p>{receipt.amountCents === null ? 'Amount unavailable' : amount(receipt.amountCents, receipt.currencyCode)} · {receipt.status}</p>
                <p>{safeDate(receipt.documentDate)}</p>
                {receipt.maskedProviderReference && <p className="muted">Provider reference: {receipt.maskedProviderReference}</p>}
                <button className="btn ghost" type="button" onClick={() => downloadReceipt(receipt)}>Download receipt JSON</button>
                <details>
                  <summary>Receipt detail</summary>
                  <pre>{JSON.stringify(receipt.snapshot, null, 2)}</pre>
                </details>
              </div>
            )}
          </article>
        )
      })}
      {error && <p className="error-note" role="alert">{error}</p>}
    </div>
  )
}
