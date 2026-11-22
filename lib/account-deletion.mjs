export const deletionPath = '/account-deletion'
export const receiptCookie = 'mort-deletion-receipt'
export const receiptMaxAge = 90 * 24 * 60 * 60

const statusLabels = Object.freeze({
  requested: 'Requested. You can cancel before processing starts.',
  processing: 'Processing. Account deletion has not completed yet.',
  retry_pending: 'Pending a retry. Account deletion has not completed yet.',
  retention_review: 'Paused for review of records that may need to be retained.',
  cancelled: 'Cancelled. This request will not delete your account.',
  completed: 'Completed. Your MORT account was deleted.',
  failed: 'Not completed. Contact MORT Support for help.',
})

export function deletionStatus(status) {
  return typeof status === 'string' && Object.hasOwn(statusLabels, status)
    ? statusLabels[status] : null
}

export function parseReceipt(value) {
  if (typeof value !== 'string') return null
  const code = value.trim().toLowerCase()
  return /^[0-9a-f]{64}$/.test(code) ? code : null
}

export function confirmedDeletion(value) {
  return typeof value === 'string' && value.trim() === 'DELETE'
}
