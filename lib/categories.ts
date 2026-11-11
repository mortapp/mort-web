// The production jobs.category check constraint allows only:
// yard_work, pet_care, tutoring, household_help, moving_help, tech_help, other.
// The web UI displays friendlier labels; this module is the single source of
// truth for mapping display categories to the database vocabulary.

export const JOB_CATEGORIES = [
  { value: 'pet_care', label: 'Dog Walking & Pet Care', short: 'Dog Walking', icon: '🐕' },
  { value: 'yard_work', label: 'Lawn Care & Yard Work', short: 'Lawn Care', icon: '🌿' },
  { value: 'tutoring', label: 'Tutoring & Tech Help', short: 'Tutoring', icon: '📚' },
  { value: 'household_help', label: 'Cleaning & Household Help', short: 'Cleaning', icon: '🧹' },
  { value: 'moving_help', label: 'Moving Help', short: 'Moving', icon: '📦' },
  { value: 'tech_help', label: 'Tech Help', short: 'Tech Help', icon: '💻' },
  { value: 'other', label: 'Other Local Work', short: 'Other', icon: '⚡' },
] as const

export type JobCategory = (typeof JOB_CATEGORIES)[number]['value']

// Legacy display names that older links/filters may still carry.
const LEGACY_CATEGORY_MAP: Record<string, string> = {
  'dog walking': 'pet_care',
  'pet care': 'pet_care',
  'lawn care': 'yard_work',
  'snow shoveling': 'yard_work',
  'raking leaves': 'yard_work',
  'trash help': 'household_help',
  cleaning: 'household_help',
  babysitting: 'household_help',
  errands: 'other',
  'car washing': 'other',
  'event help': 'other',
  general: 'other',
  moving: 'moving_help',
  tutoring: 'tutoring',
}

export function normalizeJobCategory(input: string | null | undefined): JobCategory | null {
  if (!input) return null
  const key = input.toLowerCase().trim()
  const match = JOB_CATEGORIES.find((c) => c.value === key)
  if (match) return match.value as JobCategory
  const mapped = LEGACY_CATEGORY_MAP[key]
  if (mapped) return mapped as JobCategory
  return null
}

export function jobCategoryLabel(value: string | null | undefined): string {
  const normalized = normalizeJobCategory(value)
  return JOB_CATEGORIES.find((c) => c.value === normalized)?.label || 'Other Local Work'
}
