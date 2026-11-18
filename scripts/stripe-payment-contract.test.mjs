import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const actions = read('../app/app/payments/actions.ts')
const page = read('../app/app/payments/page.tsx')
const panel = read('../app/app/payments/stripe-funding-panel.tsx')
const history = read('../app/app/payments/financial-history.tsx')
const paymentIntentEdge = read('../../app/supabase/functions/stripe-create-job-payment-intent/index.ts')
const recipientGateMigration = read('../../app/supabase/migrations/20261118131621_stripe_require_recipient_ready_for_funding_v1.sql')

test('web quote, config, PaymentIntent, and reconciliation actions are adult-only', () => {
  for (const fn of ['getStripePaymentConfig', 'createFundingQuote', 'createJobPaymentIntent', 'refreshJobPaymentStatus']) {
    const start = actions.indexOf(`export async function ${fn}`)
    assert.notEqual(start, -1, `${fn} exists`)
    const body = actions.slice(start, actions.indexOf('\n}\n', start) + 3)
    assert.match(body, /requireRole\(\['adult'\]\)/, `${fn} rechecks adult role on the server`)
  }
  assert.match(actions, /data\.environment !== 'test'/)
  assert.match(actions, /startsWith\('pk_test_'\)/)
})

test('client supplies identifiers only; all charge amounts are checked from the server response', () => {
  assert.match(actions, /body: \{ contract_id: contractId, request_id: requestId \}/)
  assert.match(actions, /body: \{\s*quote_id: quoteId,\s*request_id: requestId/)
  assert.match(actions, /totalCents !== basePayCents \+ serviceFeeCents/)
  assert.doesNotMatch(actions, /amount:\s*clientAmount|service_fee_cents:\s*clientFee|transfer_amount/)
  assert.match(paymentIntentEdge, /amount: consumed\.authoritative_total_cents/)
  assert.match(paymentIntentEdge, /provider_payment_intent_id: paymentIntent\.id/)
  assert.match(paymentIntentEdge, /payment_intent_id: paymentIntent\.id/)
})

test('web requires quote review before PaymentIntent creation and explicit Payment Element confirmation', () => {
  assert.match(panel, /async function handleQuote\(/)
  assert.match(panel, /async function handlePreparePayment\(/)
  assert.match(panel, /async function handleConfirm\(/)
  assert.match(panel, /createFundingQuote\(contractId/)
  assert.match(panel, /createJobPaymentIntent\(quote\.quoteId/)
  assert.match(panel, /stripe\.current\.confirmPayment\(/)
  assert.match(panel, /Confirm amount and continue to payment/)
  assert.match(panel, /Pay \$\{money\(payment\.totalCents/)
  assert.match(panel, /captured immediately/)
  assert.match(panel, /not held as escrow/)
  assert.match(panel, /refreshJobPaymentStatus/)
})

test('recipient eligibility and every retry are server-gated and idempotent', () => {
  assert.match(actions, /typeof data\.payment_eligibility !== 'boolean'/)
  assert.match(panel, /quote\.paymentEligibility/)
  assert.match(panel, /requestId\.current \?\?= sessionStorage\.getItem/)
  assert.match(panel, /sessionStorage\.setItem\(`mort-funding-payment-request:\$\{contractId\}`, requestId\.current\)/)
  assert.match(panel, /refreshJobPaymentStatus\(providerPaymentIntentId\)/)
  assert.match(panel, /terminalNoChargeState/)
  assert.match(recipientGateMigration, /connected_accounts_approved/)
  assert.match(recipientGateMigration, /payouts_approved/)
  assert.match(recipientGateMigration, /payment_eligibility is distinct from true/)
})

test('website limits Connect onboarding for minors and reads only server-minimized participant financial records', () => {
  assert.match(page, /role === 'adult'/)
  assert.match(page, /role === 'teen'/)
  assert.match(page, /No teen payout or connected-account onboarding is enabled/)
  assert.match(page, /stripe-list-financial-history/)
  assert.match(history, /getFinancialDocument\(receiptId\)/)
  assert.match(history, /Download receipt JSON/)
  assert.doesNotMatch(page + panel + history, /STRIPE_TEST_SECRET_KEY|sk_live_|client_secret.*localStorage/i)
})
