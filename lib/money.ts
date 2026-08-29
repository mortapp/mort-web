export function centsToDollars(cents?: number | null) {
  if (typeof cents !== 'number') return 'Pay TBD'
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

export function dollarsToCents(value: FormDataEntryValue | null) {
  const raw = String(value || '').replace(/[^0-9.]/g, '')
  if (!raw || raw === '.') return null
  const num = Number(raw)
  if (!Number.isFinite(num)) return null
  return Math.max(0, Math.round(num * 100))
}
