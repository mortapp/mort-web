'use client'

import { useState } from 'react'

import {
  completeOnboarding,
  saveOnboardingAccount,
  saveOnboardingSafety,
  saveOnboardingWork,
} from '@/app/app/actions'
import { SubmitButton } from '@/components/submit-button'

type Requirement = {
  document_key: string
  title: string
  required: boolean
  version_id: string
  version_label: string
  content_hash: string
  requires_electronic_signature: boolean
  acceptance_id: string | null
  language_code?: string
}

interface Props {
  profile: any
  step: string
  revision: string
  requirements: Requirement[]
  legalDocuments: Record<string, string>
  legalAvailable: boolean
}

const categories = [
  ['yard_work', 'Yard work'],
  ['pet_care', 'Pet care'],
  ['tutoring', 'Tutoring'],
  ['household_help', 'Household help'],
  ['moving_help', 'Moving help'],
  ['tech_help', 'Tech help'],
  ['other', 'Other local work'],
] as const
const transport = [
  ['walking', 'Walking'],
  ['bicycle', 'Bicycle'],
  ['car', 'Car'],
  ['public_transit', 'Public transit'],
  ['rideshare', 'Rideshare'],
]

function isAdultDateOfBirth(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const today = new Date()
  let age = today.getFullYear() - year
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1
  return age >= 18
}

const stepOrder = ['account', 'work_preferences', 'safety_support', 'review']
const stepTitle: Record<string, string> = {
  account: '1. Your account',
  work_preferences: '2. Work preferences',
  safety_support: '3. Safety and support',
  review: '4. Review and finish',
}

export function OnboardingForm({
  profile,
  step,
  revision,
  requirements,
  legalDocuments,
  legalAvailable,
}: Props) {
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || '')
  const adultByDob = isAdultDateOfBirth(dateOfBirth)
  const currentStep = stepOrder.includes(step) ? step : 'account'
  const outstanding = requirements.filter((item) => item.required && !item.acceptance_id)
  const needsSignature = outstanding.some((item) => item.requires_electronic_signature)
  const role = profile?.role

  return (
    <div className="form">
      <div className="card">
        <p className="eyebrow">STEP {stepOrder.indexOf(currentStep) + 1} OF 4</p>
        <h2>{stepTitle[currentStep]}</h2>
        <div className="progress-track" aria-label="Onboarding progress">
          <div className="progress-fill" style={{ width: `${((stepOrder.indexOf(currentStep) + 1) / 4) * 100}%` }} />
        </div>
      </div>

      {currentStep === 'account' && (
        <form action={saveOnboardingAccount} className="form">
          <div className="card">
            <h3>Account details</h3>
            <p>Your date of birth determines your account type. Adult and Guardian options appear only when your date of birth indicates you are 18 or older. Your date of birth cannot be changed through profile settings after it is saved.</p>
            <div className="grid two">
              <label>Display name
                <input name="display_name" defaultValue={profile?.display_name || ''} minLength={2} maxLength={80} required />
              </label>
              <label>Username
                <input name="username" defaultValue={profile?.username || ''} minLength={3} maxLength={24} pattern="[a-z0-9_]+" autoCapitalize="none" required />
              </label>
              <label>Date of birth
                <input type="date" name="dob" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} required />
              </label>
              {adultByDob && (
                <>
                  <label>Adult account type
                    <select name="role" defaultValue={role === 'guardian' ? 'guardian' : 'adult'} required>
                      <option value="adult">Post or hire as an adult</option>
                      <option value="guardian">Supervise as a guardian</option>
                    </select>
                  </label>
                  <label>City
                    <input name="city" defaultValue={profile?.city || ''} autoComplete="address-level2" required />
                  </label>
                  <label>State
                    <input name="state" defaultValue={profile?.region || ''} maxLength={2} autoComplete="address-level1" required />
                  </label>
                </>
              )}
              {!adultByDob && (
                <label>General area for teen matching (ZIP or city)
                  <input name="approximate_area" defaultValue={profile?.approximate_area || ''} maxLength={80} required />
                </label>
              )}
            </div>
            <p className="muted">Teen accounts use a general area only. Do not enter a street address or exact location. Guardian Mode is optional and does not automatically share teen account data.</p>
          </div>
          <SubmitButton size="lg" pendingLabel="Saving account…">Save account and continue</SubmitButton>
        </form>
      )}

      {currentStep === 'work_preferences' && (
        <form action={saveOnboardingWork} className="form">
          <input type="hidden" name="revision" value={revision} />
          {role === 'teen' ? (
            <div className="card">
              <h3>What kind of work are you interested in?</h3>
              <div className="grid two">
                {categories.map(([value, label]) => (
                  <label key={value} className="choice">
                    <input type="checkbox" name="preferred_job_categories" value={value} defaultChecked={(profile?.preferred_job_categories || []).includes(value)} />
                    {label}
                  </label>
                ))}
              </div>
              <label>When are you usually available?
                <textarea name="availability" defaultValue={profile?.availability || ''} maxLength={240} required placeholder="For example, weekday evenings and Saturday mornings" />
              </label>
              <h3>How can you usually get to a job?</h3>
              <div className="grid two">
                {transport.map(([value, label], index) => (
                  <label key={value} className="choice">
                    <input type="checkbox" name="transportation_methods" value={value} defaultChecked={(profile?.transportation_methods || []).includes(value)} />
                    {label}
                  </label>
                ))}
              </div>
              <p className="muted">These are matching preferences, not a guarantee of transportation or job availability.</p>
            </div>
          ) : (
            <div className="card">
              <h3>No additional work preferences are required</h3>
              <p>Adults provide job details when posting. Guardians do not need teen work preferences. Job publishing remains subject to separate verification and release controls.</p>
            </div>
          )}
          <SubmitButton size="lg" pendingLabel="Saving preferences…">Save work preferences</SubmitButton>
        </form>
      )}

      {currentStep === 'safety_support' && (
        <form action={saveOnboardingSafety} className="form">
          <input type="hidden" name="revision" value={revision} />
          <div className="card">
            <h3>Safety stays available</h3>
            <p>Reporting, blocking, Safety Ping, and core safety tools are not premium requirements.</p>
            {role === 'teen' && (
              <div className="notice">
                <strong>Guardian Mode is optional.</strong>
                <p>You can choose to skip it now. This does not create a guardian connection or give anyone access to your account. A specific job may have separate safety requirements.</p>
                <p>For this setup, Guardian Mode will remain skipped unless you choose to connect someone later through the dedicated Guardian flow.</p>
              </div>
            )}
            <label>Notification preference
              <select name="notification_intent" defaultValue="ask_later">
                <option value="ask_later">Ask me later</option>
                <option value="preferred">I want safety and job notifications</option>
                <option value="not_preferred">Do not ask right now</option>
              </select>
            </label>
            <p className="muted">This records your preference only. Your device controls notification permission.</p>
          </div>
          <SubmitButton size="lg" pendingLabel="Saving safety preferences…">Save safety and support</SubmitButton>
        </form>
      )}

      {currentStep === 'review' && (
        <form action={completeOnboarding} className="form">
          <input type="hidden" name="revision" value={revision} />
          <div className="card">
            <h3>Review your setup</h3>
            <p>Account: {role === 'teen' ? 'Teen' : role === 'guardian' ? 'Guardian' : 'Adult'}</p>
            <p>Display name: {profile?.display_name || 'Not set'}</p>
            <p>Username: {profile?.username ? `@${profile.username}` : 'Not set'}</p>
            <p>General area: {role === 'teen' ? profile?.approximate_area || 'Not set' : [profile?.city, profile?.region].filter(Boolean).join(', ') || 'Not set'}</p>
          </div>
          <div className="card">
            <h3>Current published MORT documents</h3>
            {!legalAvailable ? (
              <div className="notice" role="alert">
                The legal acknowledgement service is not available for this pending account yet. Your account has not been activated. The production backend update is required before you can finish this step.
              </div>
            ) : outstanding.length === 0 ? (
              <p>All required current document versions are already recorded for this account.</p>
            ) : (
              <>
                <p>Read each required current version below and affirmatively acknowledge it. MORT records the exact published version and content hash.</p>
                {role === 'teen' && (
                  <section className="legal-document">
                    <h4>Teen plain-language summary</h4>
                    <p>Use MORT honestly and only consider work that is safe and age-appropriate. Protect private details and keep communication in MORT. MORT does not process or guarantee payment. Reports are reviewed and are not automatic findings. Verification signals have limits. Guardian Mode is optional unless a separate job-specific safety requirement applies.</p>
                    <label className="choice">
                      <input type="checkbox" name="teen_summary_viewed" value="true" required />
                      I reviewed the teen plain-language summary.
                    </label>
                  </section>
                )}
                {outstanding.map((item) => (
                  <section className="legal-document" key={item.version_id}>
                    <h4>{item.title}</h4>
                    <p className="muted">Version {item.version_label} · SHA-256 {item.content_hash}</p>
                    <details>
                      <summary>Read full document</summary>
                      <pre className="legal-content">{legalDocuments[item.version_id] || 'The published document text could not be loaded. Refresh before accepting.'}</pre>
                    </details>
                    <label className="choice">
                      <input type="checkbox" name="accepted_version_ids" value={item.version_id} required />
                      I have read and agree to this required document version.
                    </label>
                  </section>
                ))}
                {needsSignature && (
                  <label>Electronic signature
                    <input name="electronic_signature" minLength={3} maxLength={200} required placeholder="Type your full name" />
                  </label>
                )}
              </>
            )}
            <p className="muted">Browsing does not count as acceptance. Each required acknowledgement is an explicit action.</p>
          </div>
          {legalAvailable && (
            <SubmitButton size="lg" pendingLabel="Recording acknowledgements…">Finish setup</SubmitButton>
          )}
        </form>
      )}
    </div>
  )
}
