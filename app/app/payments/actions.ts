'use server'

import { requireRole, requireUser } from '@/lib/auth'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const paymentIntentPattern = /^pi_[A-Za-z0-9]+$/
const receiptPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/

function cents(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    ? value
    : null
}

function genericFailure() {
  return { ok: false as const, message: 'The secure payment service is unavailable. No payment was confirmed.' }
}

export async function getStripePaymentConfig() {
  const { supabase } = await requireRole(['adult'])
  const { data, error } = await supabase.functions.invoke('stripe-config', { body: {} })
  if (error || data?.ok !== true) return genericFailure()

  const sandboxOnly = data.mode === 'sandbox' && data.environment === 'test'
  const publishableKey = typeof data.publishable_key === 'string' && data.publishable_key.startsWith('pk_test_')
    ? data.publishable_key
    : null
  const enabled = sandboxOnly && publishableKey !== null &&
    data.payments_enabled === true && data.job_funding_enabled === true

  return {
    ok: true as const,
    enabled,
    mode: sandboxOnly ? 'sandbox' as const : 'unavailable' as const,
    publishableKey: enabled ? publishableKey : null,
    message: enabled
      ? null
      : 'Sandbox funding is not available. Live-mode payment is intentionally disabled in this experience.',
  }
}

export async function createFundingQuote(contractId: string, requestId: string) {
  if (!uuidPattern.test(contractId) || !uuidPattern.test(requestId)) return genericFailure()
  const { supabase } = await requireRole(['adult'])
  const { data, error } = await supabase.functions.invoke('stripe-create-job-funding-quote', {
    body: { contract_id: contractId, request_id: requestId },
  })
  if (error || data?.ok !== true) return genericFailure()

  const basePayCents = cents(data.base_pay_cents)
  const serviceFeeCents = cents(data.service_fee_cents)
  const totalCents = cents(data.authoritative_total_cents)
  if (
    typeof data.quote_id !== 'string' || !uuidPattern.test(data.quote_id) ||
    data.contract_id !== contractId ||
    basePayCents === null || serviceFeeCents === null || totalCents === null ||
    totalCents !== basePayCents + serviceFeeCents ||
    typeof data.currency_code !== 'string' || !/^[A-Z]{3}$/.test(data.currency_code) ||
    typeof data.payment_eligibility !== 'boolean' || !['ACTIVE', 'CONSUMED'].includes(data.state) ||
    typeof data.expires_at !== 'string' || Number.isNaN(Date.parse(data.expires_at))
  ) return genericFailure()

  return {
    ok: true as const,
    quote: {
      quoteId: data.quote_id,
      contractId: data.contract_id,
      basePayCents,
      serviceFeeCents,
      totalCents,
      currencyCode: data.currency_code,
      paymentEligibility: data.payment_eligibility,
      state: data.state,
      expiresAt: data.expires_at,
    },
  }
}

export async function createJobPaymentIntent(quoteId: string, requestId: string) {
  if (!uuidPattern.test(quoteId) || !uuidPattern.test(requestId)) return genericFailure()
  const { supabase } = await requireRole(['adult'])
  const { data, error } = await supabase.functions.invoke('stripe-create-job-payment-intent', {
    body: {
      quote_id: quoteId,
      request_id: requestId,
      // The website deliberately never persists a payment method by default.
      save_payment_method: false,
    },
  })
  if (error || data?.ok !== true) return genericFailure()

  const basePayCents = cents(data.base_pay_cents)
  const serviceFeeCents = cents(data.service_fee_cents)
  const totalCents = cents(data.total_amount_cents)
  if (
    data.environment !== 'test' ||
    typeof data.publishable_key !== 'string' || !data.publishable_key.startsWith('pk_test_') ||
    typeof data.payment_intent_client_secret !== 'string' ||
    !data.payment_intent_client_secret.startsWith('pi_') ||
    !data.payment_intent_client_secret.includes('_secret_') ||
    typeof data.provider_payment_intent_id !== 'string' || !paymentIntentPattern.test(data.provider_payment_intent_id) ||
    basePayCents === null || serviceFeeCents === null || totalCents === null ||
    totalCents !== basePayCents + serviceFeeCents ||
    typeof data.currency_code !== 'string' || !/^[A-Z]{3}$/.test(data.currency_code)
  ) return genericFailure()

  return {
    ok: true as const,
    payment: {
      publishableKey: data.publishable_key,
      clientSecret: data.payment_intent_client_secret,
      providerPaymentIntentId: data.provider_payment_intent_id,
      basePayCents,
      serviceFeeCents,
      totalCents,
      currencyCode: data.currency_code,
    },
  }
}

export async function refreshJobPaymentStatus(providerPaymentIntentId: string) {
  if (!paymentIntentPattern.test(providerPaymentIntentId)) return genericFailure()
  const { supabase } = await requireRole(['adult'])
  const { data, error } = await supabase.functions.invoke('stripe-get-job-payment-status', {
    body: { provider_payment_intent_id: providerPaymentIntentId },
  })
  if (error || data?.ok !== true || typeof data.state !== 'string') return genericFailure()
  return {
    ok: true as const,
    state: data.state,
    legacyStatus: typeof data.legacy_status === 'string' ? data.legacy_status : null,
    lastReconciledAt: typeof data.last_reconciled_at === 'string' ? data.last_reconciled_at : null,
  }
}

export async function getFinancialDocument(receiptId: string) {
  if (!receiptPattern.test(receiptId)) return genericFailure()
  const { supabase } = await requireUser()
  const { data, error } = await supabase.functions.invoke('stripe-get-financial-document', {
    body: { receipt_id: receiptId },
  })
  if (error || data?.ok !== true || !data.document || typeof data.document !== 'object') return genericFailure()

  const document = data.document as Record<string, unknown>
  const amountCents = cents(document.amount_cents)
  return {
    ok: true as const,
    document: {
      documentType: typeof document.document_type === 'string' ? document.document_type : 'Financial record',
      receiptId: typeof document.receipt_id === 'string' ? document.receipt_id : receiptId,
      orderNumber: typeof document.order_number === 'string' ? document.order_number : null,
      documentDate: typeof document.document_date === 'string' ? document.document_date : null,
      amountCents,
      currencyCode: typeof document.currency_code === 'string' ? document.currency_code : 'USD',
      status: typeof document.status === 'string' ? document.status : 'unavailable',
      maskedProviderReference: typeof document.masked_provider_reference === 'string' ? document.masked_provider_reference : null,
      snapshot: document.immutable_snapshot ?? null,
      linkedDocumentRefs: Array.isArray(document.linked_document_refs) ? document.linked_document_refs : [],
    },
  }
}
