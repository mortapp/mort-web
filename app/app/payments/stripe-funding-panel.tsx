'use client'

import { loadStripe, type Stripe, type StripeElements, type StripePaymentElement } from '@stripe/stripe-js'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  createFundingQuote,
  createJobPaymentIntent,
  getStripePaymentConfig,
  refreshJobPaymentStatus,
} from './actions'

type Config = {
  enabled: boolean
  publishableKey: string | null
  message: string | null
}

type Quote = {
  quoteId: string
  contractId: string
  basePayCents: number
  serviceFeeCents: number
  totalCents: number
  currencyCode: string
  paymentEligibility: boolean
  state: string
  expiresAt: string
}

type Payment = {
  publishableKey: string
  clientSecret: string
  providerPaymentIntentId: string
  basePayCents: number
  serviceFeeCents: number
  totalCents: number
  currencyCode: string
}

function money(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

function normalizedState(value: string) {
  return value.replaceAll('_', '').toUpperCase()
}

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    SUCCEEDED: 'Paid — verified by MORT',
    PROCESSING: 'Processing — awaiting final confirmation',
    REQUIRESACTION: 'Additional authentication required',
    REQUIRESPAYMENTMETHOD: 'Payment method needs attention',
    FUNDINGFAILED: 'Payment failed',
    CANCELLED: 'Payment canceled',
    CANCELED: 'Payment canceled',
    REFUNDED: 'Refunded',
    PARTIALLYREFUNDED: 'Partially refunded',
    DISPUTED: 'Under dispute review',
  }
  return labels[normalizedState(value)] ?? 'Status is being verified'
}

export function StripeFundingPanel({
  contractId,
  jobTitle,
}: {
  contractId: string
  jobTitle: string
}) {
  const [config, setConfig] = useState<Config | null>(null)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [providerPaymentIntentId, setProviderPaymentIntentId] = useState<string | null>(null)
  const [paymentState, setPaymentState] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const busyRef = useRef(false)
  const elementHost = useRef<HTMLDivElement | null>(null)
  const stripe = useRef<Stripe | null>(null)
  const elements = useRef<StripeElements | null>(null)
  const paymentElement = useRef<StripePaymentElement | null>(null)
  const requestId = useRef<string | null>(null)
  const quoteRequestId = useRef<string | null>(null)

  function beginBusy() {
    if (busyRef.current) return false
    busyRef.current = true
    setBusy(true)
    return true
  }

  function endBusy() {
    busyRef.current = false
    setBusy(false)
  }

  useEffect(() => {
    let alive = true
    getStripePaymentConfig().then((result) => {
      if (!alive) return
      if (result.ok === false) {
        setConfig({ enabled: false, publishableKey: null, message: result.message })
        return
      }
      setConfig({
        enabled: result.enabled,
        publishableKey: result.publishableKey,
        message: result.message,
      })
    }).catch(() => {
      if (alive) setConfig({ enabled: false, publishableKey: null, message: 'Sandbox funding is unavailable.' })
    })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    let alive = true
    let mountedElement: StripePaymentElement | null = null
    async function mountPaymentElement() {
      if (!payment || !elementHost.current) return
      try {
        const stripeClient = await loadStripe(payment.publishableKey)
        if (!alive || !stripeClient || !elementHost.current) return
        const stripeElements = stripeClient.elements({ clientSecret: payment.clientSecret })
        const element = stripeElements.create('payment')
        element.mount(elementHost.current)
        stripe.current = stripeClient
        elements.current = stripeElements
        paymentElement.current = element
        mountedElement = element
      } catch {
        if (alive) setError('The secure card form could not be loaded. No payment was confirmed.')
      }
    }
    void mountPaymentElement()
    return () => {
      alive = false
      mountedElement?.unmount()
      mountedElement?.destroy()
      if (paymentElement.current === mountedElement) paymentElement.current = null
      if (elements.current) elements.current = null
      if (stripe.current) stripe.current = null
    }
  }, [payment])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionKey = `mort-funding-intent:${contractId}`
    const savedQuoteRequest = sessionStorage.getItem(`mort-funding-quote-request:${contractId}`)
    const savedPaymentRequest = sessionStorage.getItem(`mort-funding-payment-request:${contractId}`)
    quoteRequestId.current = savedQuoteRequest && /^[0-9a-f-]{36}$/i.test(savedQuoteRequest) ? savedQuoteRequest : null
    requestId.current = savedPaymentRequest && /^[0-9a-f-]{36}$/i.test(savedPaymentRequest) ? savedPaymentRequest : null
    const returnedContract = params.get('funding_contract')
    const hasStripeReturn = params.has('payment_intent') || params.has('payment_intent_client_secret')
    const returnedProviderId = returnedContract === contractId
      ? params.get('payment_intent')
      : null
    if (hasStripeReturn) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    const candidate = returnedProviderId ?? sessionStorage.getItem(sessionKey)
    const providerId = candidate && /^pi_[A-Za-z0-9]+$/.test(candidate) ? candidate : null
    if (!providerId) return
    const timer = window.setTimeout(() => {
      setProviderPaymentIntentId(providerId)
      sessionStorage.setItem(sessionKey, providerId)
      void refreshStatus(providerId)
    }, 0)
    return () => window.clearTimeout(timer)
    // The return URL can contain Stripe's client-secret query parameter; remove
    // the entire query string immediately and retain only the provider object ID.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId])

  async function refreshStatus(providerId: string) {
    if (!beginBusy()) return
    setError(null)
    try {
      const result = await refreshJobPaymentStatus(providerId)
      if (result.ok === false) {
        setNotice(result.message)
        return
      }
      const state = normalizedState(result.state)
      setPaymentState(result.state)
      if (state === 'SUCCEEDED') {
        sessionStorage.removeItem(`mort-funding-intent:${contractId}`)
        sessionStorage.removeItem(`mort-funding-quote-request:${contractId}`)
        sessionStorage.removeItem(`mort-funding-payment-request:${contractId}`)
        quoteRequestId.current = null
        requestId.current = null
        setNotice('MORT reconciled this PaymentIntent as successful. The funding state shown below comes from the server.')
      } else {
        setNotice(statusLabel(result.state))
      }
    } catch {
      setError('Payment status could not be refreshed. Do not submit another payment until the status is verified.')
    } finally {
      endBusy()
    }
  }

  async function handleQuote(forceNew = false) {
    if (!config?.enabled || busyRef.current) return
    const state = normalizedState(paymentState ?? '')
    const retrySameIntent = Boolean(providerPaymentIntentId && !forceNew &&
      ['READY', 'REQUIRESPAYMENTMETHOD', 'DECLINED'].includes(state))
    const canceledIntent = Boolean(providerPaymentIntentId &&
      ['CANCELLED', 'CANCELED'].includes(state))
    if (providerPaymentIntentId && !retrySameIntent && !canceledIntent) {
      setError('The existing payment is not canceled. Refresh its status or resume the same payment; a second charge is blocked.')
      return
    }
    if (!beginBusy()) return
    setError(null)
    setNotice(null)
    try {
      if (retrySameIntent) {
        quoteRequestId.current ??= sessionStorage.getItem(`mort-funding-quote-request:${contractId}`)
        requestId.current ??= sessionStorage.getItem(`mort-funding-payment-request:${contractId}`)
        if (!quoteRequestId.current || !requestId.current) {
          setError('The original payment request could not be recovered. Refresh the provider status before continuing.')
          return
        }
      } else if (forceNew || canceledIntent || quote !== null || !quoteRequestId.current) {
        quoteRequestId.current = crypto.randomUUID()
        requestId.current = null
        sessionStorage.setItem(`mort-funding-quote-request:${contractId}`, quoteRequestId.current)
        sessionStorage.removeItem(`mort-funding-payment-request:${contractId}`)
        sessionStorage.removeItem(`mort-funding-intent:${contractId}`)
        setProviderPaymentIntentId(null)
        setPaymentState(null)
        setPayment(null)
      }
      if (!quoteRequestId.current) throw new Error('quote_request_unavailable')
      const result = await createFundingQuote(contractId, quoteRequestId.current)
      if (result.ok === false) {
        setError(result.message)
        return
      }
      setQuote(result.quote)
      setNotice(result.quote.paymentEligibility
        ? 'Review the exact server-generated amounts below. No PaymentIntent has been created yet.'
        : 'The recipient account is not approved and ready. No payment can be started from this quote.')
    } catch {
      setError('A funding quote could not be retrieved. No payment was started.')
    } finally {
      endBusy()
    }
  }

  async function handlePreparePayment() {
    if (!quote || !config?.enabled || busyRef.current || !quote.paymentEligibility) return
    if (!providerPaymentIntentId && Date.parse(quote.expiresAt) <= Date.now()) {
      setQuote(null)
      setPayment(null)
      setError('This quote expired. Request a new quote and review its amount before continuing.')
      return
    }
    if (!beginBusy()) return
    setError(null)
    try {
      if (providerPaymentIntentId) {
        const status = await refreshJobPaymentStatus(providerPaymentIntentId)
        if (status.ok === false) {
          setError(status.message)
          return
        }
        const state = normalizedState(status.state)
        setPaymentState(status.state)
        if (state === 'SUCCEEDED') {
          setNotice('MORT has verified this payment as successful. No additional payment can be started from this attempt.')
          return
        }
        if (!['READY', 'REQUIRESPAYMENTMETHOD', 'DECLINED'].includes(state)) {
          setNotice('MORT is still verifying this payment. Refresh status before attempting again.')
          return
        }
      }
      requestId.current ??= sessionStorage.getItem(`mort-funding-payment-request:${contractId}`) ?? crypto.randomUUID()
      sessionStorage.setItem(`mort-funding-payment-request:${contractId}`, requestId.current)
      const result = await createJobPaymentIntent(quote.quoteId, requestId.current)
      if (result.ok === false) {
        setError(result.message)
        return
      }
      setPayment(result.payment)
      setProviderPaymentIntentId(result.payment.providerPaymentIntentId)
      sessionStorage.setItem(`mort-funding-intent:${contractId}`, result.payment.providerPaymentIntentId)
      setNotice('Secure payment form is ready. Review the amount above, then explicitly choose Pay to confirm.')
    } catch {
      setError('The secure payment form could not be prepared. Retry only after refreshing payment status.')
    } finally {
      endBusy()
    }
  }

  async function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!stripe.current || !elements.current || !payment || !beginBusy()) return
    setError(null)
    setNotice(null)
    try {
      const result = await stripe.current.confirmPayment({
        elements: elements.current,
        confirmParams: {
          return_url: `${window.location.origin}/app/payments?funding_contract=${encodeURIComponent(contractId)}`,
        },
        redirect: 'if_required',
      })
      if (result.error) {
        setError(result.error.message ?? 'The payment could not be confirmed. Check the status before retrying.')
        return
      }
      if (!result.paymentIntent?.id) {
        setNotice('Confirmation was submitted. Refresh status before treating this payment as complete.')
        return
      }
      setProviderPaymentIntentId(result.paymentIntent.id)
      sessionStorage.setItem(`mort-funding-intent:${contractId}`, result.paymentIntent.id)
      const status = await refreshJobPaymentStatus(result.paymentIntent.id)
      if (status.ok === false) {
        setNotice(status.message)
        return
      }
      setPaymentState(status.state)
      if (normalizedState(status.state) === 'SUCCEEDED') {
        sessionStorage.removeItem(`mort-funding-intent:${contractId}`)
        sessionStorage.removeItem(`mort-funding-quote-request:${contractId}`)
        sessionStorage.removeItem(`mort-funding-payment-request:${contractId}`)
        quoteRequestId.current = null
        requestId.current = null
      }
      setNotice(normalizedState(status.state) === 'SUCCEEDED'
        ? 'MORT reconciled the payment as successful.'
        : statusLabel(status.state))
    } catch {
      setError('The payment result could not be verified. Refresh status before retrying; do not create a second payment.')
    } finally {
      endBusy()
    }
  }

  const quoteExpired = quote ? Date.parse(quote.expiresAt) <= Date.now() : false
  const paymentSucceeded = paymentState ? normalizedState(paymentState) === 'SUCCEEDED' : false
  const terminalNoChargeState = paymentState !== null && [
    'CANCELLED', 'CANCELED',
  ].includes(normalizedState(paymentState))
  const mayResumePayment = paymentState !== null && [
    'READY', 'REQUIRESPAYMENTMETHOD', 'DECLINED',
  ].includes(normalizedState(paymentState))
  const mayRequestQuote = !providerPaymentIntentId || terminalNoChargeState || mayResumePayment

  return (
    <section className="card" aria-labelledby={`funding-${contractId}`}>
      <h3 id={`funding-${contractId}`}>{jobTitle}</h3>
      <p className="muted">Funding is available only for the active, accepted agreement. The server determines the amount; this browser sends no amount or fee.</p>

      {config === null && <p role="status">Checking the sandbox payment controls…</p>}
      {config?.message && <div className="warning-box" role="status">{config.message}</div>}
      {config?.enabled && !quote && (
        <button className="btn primary" type="button" disabled={busy || !mayRequestQuote} onClick={() => void handleQuote()}>
          {busy ? 'Getting quote…' : mayResumePayment ? 'Resume existing payment' : terminalNoChargeState ? 'Request a new quote after cancellation' : 'Get server-generated quote'}
        </button>
      )}
      {providerPaymentIntentId && (
        <button className="btn ghost" type="button" disabled={busy} onClick={() => void refreshStatus(providerPaymentIntentId)}>
          Refresh payment status
        </button>
      )}

      {quote && (
        <>
          <dl className="payment-quote">
            <div><dt>Agreed gig amount</dt><dd>{money(quote.basePayCents, quote.currencyCode)}</dd></div>
            <div><dt>MORT fixed service fee</dt><dd>{money(quote.serviceFeeCents, quote.currencyCode)}</dd></div>
            <div className="payment-total"><dt>Total adult charge</dt><dd>{money(quote.totalCents, quote.currencyCode)}</dd></div>
          </dl>
          <p className="muted">Quote expires {new Date(quote.expiresAt).toLocaleString()}.</p>
          {!quote.paymentEligibility && <div className="warning-box">Recipient account approval and readiness are required. No charge can be started from this quote.</div>}
          {quoteExpired && <div className="warning-box">This quote has expired. Request a fresh quote before paying.</div>}
          {quoteExpired && !providerPaymentIntentId && config?.enabled && (
            <button className="btn ghost" type="button" disabled={busy} onClick={() => void handleQuote(true)}>Request a fresh quote</button>
          )}
          {!quote.paymentEligibility && !providerPaymentIntentId && config?.enabled && (
            <button className="btn ghost" type="button" disabled={busy} onClick={() => void handleQuote(true)}>Check recipient readiness again</button>
          )}
          {providerPaymentIntentId && terminalNoChargeState && config?.enabled && (
            <button className="btn ghost" type="button" disabled={busy} onClick={() => void handleQuote(true)}>Request a new quote after cancellation</button>
          )}
          {quote.paymentEligibility && <p className="warning-box">When you confirm payment, the adult charge is captured immediately if Stripe accepts it; it is not held as escrow until the gig is complete.</p>}
          {!payment && !quoteExpired && quote.paymentEligibility && config?.enabled && (
            <button className="btn primary" type="button" disabled={busy} onClick={handlePreparePayment}>
              {busy ? 'Preparing secure form…' : 'Confirm amount and continue to payment'}
            </button>
          )}
        </>
      )}

      {payment && !paymentSucceeded && (
        <form onSubmit={handleConfirm} className="form" style={{ marginTop: 16 }}>
          <h4>Secure payment method</h4>
          <p>Stripe collects payment details directly. MORT does not receive or store card numbers.</p>
          <div ref={elementHost} id={`stripe-payment-element-${contractId}`} />
          <button className="btn primary" type="submit" disabled={busy || !stripe.current || !elements.current}>
            {busy ? 'Verifying…' : `Pay ${money(payment.totalCents, payment.currencyCode)}`}
          </button>
        </form>
      )}

      {providerPaymentIntentId && !paymentSucceeded && (
        <button className="btn ghost" type="button" disabled={busy} onClick={() => void refreshStatus(providerPaymentIntentId)}>
          {busy ? 'Refreshing…' : 'Refresh payment status'}
        </button>
      )}

      {notice && <p role="status" className="status-note">{notice}</p>}
      {error && <p role="alert" className="error-note">{error}</p>}
      {paymentSucceeded && <p className="success-note">Verified paid status is shown by MORT. Any refund, dispute, cancellation, or transfer update appears in financial history.</p>}
    </section>
  )
}
