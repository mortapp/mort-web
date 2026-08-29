// Shared MORT constants + lightweight safety helpers.
// Kept dependency-free so they work identically on the client and server.

export const PROOF_BUCKET = 'proof-uploads'

export const PROOF_MAX_BYTES = 10 * 1024 * 1024 // live submit_application_proof RPC allows JPEG files up to 10MB
export const PROOF_ALLOWED_TYPES = ['image/jpeg']

export function validateProofFile(file: File): string | null {
  if (file.size > PROOF_MAX_BYTES) return `File is too big (${Math.round(file.size / (1024 * 1024))}MB). Max size is 10MB.`
  if (file.type && !PROOF_ALLOWED_TYPES.includes(file.type)) return 'Unsupported file type. The live MORT backend currently accepts JPEG proof photos only.'
  return null
}

// Extremely lightweight keyword scanner for MVP moderation. This is NOT a
// replacement for a real trust & safety pipeline — see README "Known limitations".
const FLAG_PATTERNS: RegExp[] = [
  /\b(cash ?app|venmo|paypal|zelle)\b.{0,20}\b(before|first|upfront|deposit)\b/i,
  /\bmeet (me )?(at|outside|away from)\b/i,
  /\bdon'?t tell (your|my) (mom|dad|parent|guardian)\b/i,
  /\b(off[- ]?platform|off the app|outside (of )?mort|text me at|call me at)\b/i,
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // phone-number-like pattern
  /\b(send|share) (a )?(photo|pic|picture) of yourself\b/i,
  /\bkeep this (a )?secret\b/i,
]

export function scanMessage(body: string): 'clean' | 'flagged' {
  return FLAG_PATTERNS.some((re) => re.test(body)) ? 'flagged' : 'clean'
}

export function safeSlice(id?: string | null, len = 8) {
  return id ? id.slice(0, len) : '—'
}

// Computes whole-years age from a YYYY-MM-DD (or any Date-parseable) string.
// Returns null for missing/invalid input so callers can fail closed instead
// of silently treating "unknown age" as "any age".
export function calculateAge(dob?: string | null): number | null {
  if (!dob) return null
  const birth = new Date(dob)
  if (isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export const SUPPORT_CATEGORIES = ['safety', 'payment issue', 'job problem', 'account/verification', 'bug', 'other'] as const
