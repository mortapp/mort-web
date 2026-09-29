'use client'

// Calibrated Liquid Glass: onboarding is a short 3-step voyage (Role → About →
// Details). All fields live in ONE form and stay mounted (inactive steps are just
// hidden), so the existing saveOnboarding server action receives everything at once.
import { Fragment, useRef, useState } from 'react'
import { saveOnboarding } from '@/app/app/actions'
import { SubmitButton } from '@/components/submit-button'

interface Props {
  profile: any
  next?: string
}

const ROLES = [
  { value: 'teen', icon: '🔥', title: 'Teen worker', desc: 'Find nearby paid jobs and build XP.' },
  { value: 'adult', icon: '💼', title: 'Adult / business', desc: 'Post jobs for local teens.' },
  { value: 'guardian', icon: '🛡️', title: 'Guardian', desc: 'Watch over a connected teen.' },
]

const STEPS = ['Role', 'About you', 'Details']
const TOTAL = STEPS.length

export function OnboardingForm({ profile, next }: Props) {
  const [role, setRole] = useState<string>(profile?.role || 'teen')
  const [step, setStep] = useState(1)
  const formRef = useRef<HTMLFormElement>(null)

  // Validate only the fields inside the step you're leaving (native constraints).
  function stepValid(n: number): boolean {
    const el = formRef.current?.querySelector(`[data-step="${n}"]`)
    if (!el) return true
    const fields = Array.from(el.querySelectorAll('input, select, textarea')) as HTMLInputElement[]
    for (const f of fields) {
      if (!f.checkValidity()) { f.reportValidity(); return false }
    }
    return true
  }
  function go(target: number) {
    if (target > step && !stepValid(step)) return
    setStep(Math.max(1, Math.min(TOTAL, target)))
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const stepCircle = (n: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center',
      fontSize: 13, fontWeight: 700, transition: 'all .2s ease',
    }
    if (step > n) return { ...base, background: 'linear-gradient(180deg,#fff,#9cc0ee)', color: '#0a1220', boxShadow: '0 0 10px rgba(156,192,238,.5)' }
    if (step === n) return { ...base, background: 'var(--primary-tint-bg)', color: 'var(--primary)', boxShadow: '0 0 0 4px var(--primary-tint-bg)' }
    return { ...base, background: 'var(--el-3)', color: 'var(--muted)', border: '1px solid var(--border-strong)' }
  }

  return (
    <form ref={formRef} action={saveOnboarding} className="form" style={{ maxWidth: 720, margin: '0 auto' }}>
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="next" value={next || ''} />

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0 30px' }} aria-label={`Step ${step} of ${TOTAL}`}>
        {STEPS.map((label, i) => {
          const n = i + 1
          const upcoming = step < n
          return (
            <Fragment key={label}>
              {i > 0 && (
                <div style={{ flex: 1, height: 2, borderRadius: 2, margin: '0 6px', background: step > i ? 'linear-gradient(90deg,#9cc0ee,#eef3fb)' : 'var(--border-strong)' }} />
              )}
              <div style={{ position: 'relative' }}>
                <span style={stepCircle(n)} aria-current={step === n ? 'step' : undefined}>{step > n ? '✓' : n}</span>
                <span style={{ position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 11, fontWeight: 600, color: upcoming ? 'var(--muted)' : 'var(--text)' }}>{label}</span>
              </div>
            </Fragment>
          )
        })}
      </div>

      {/* Step 1 — Role */}
      <div data-step="1" hidden={step !== 1}>
        <div className="card">
          <h3 style={{ marginBottom: 4 }}>How will you use MORT?</h3>
          <p style={{ fontSize: 'var(--text-sm)' }}>Teens get jobs · adults post them · guardians watch safety.</p>
          <div className="grid three" style={{ marginTop: 16 }}>
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`card hoverable ${role === r.value ? 'highlight' : ''}`}
                style={{ textAlign: 'left', cursor: 'pointer', position: 'relative' }}
                aria-pressed={role === r.value}
              >
                {role === r.value && (
                  <span style={{ position: 'absolute', top: 14, right: 14, color: 'var(--primary)', fontSize: 16 }}>✓</span>
                )}
                <div className="card-icon-tile">{r.icon}</div>
                <h3 style={{ fontSize: 15 }}>{r.title}</h3>
                <p style={{ fontSize: 12.5, marginTop: 4 }}>{r.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2 — About you */}
      <div data-step="2" hidden={step !== 2}>
        <div className="card">
          <h3 style={{ marginBottom: 4 }}>About you</h3>
          <p style={{ fontSize: 'var(--text-sm)' }}>Just the basics — this is what neighbors see.</p>
          <div className="grid two" style={{ marginTop: 16 }}>
            <label>Display name<input name="display_name" defaultValue={profile?.display_name || ''} required autoFocus /></label>
            <label>Username<input name="username" defaultValue={profile?.username || ''} /></label>
            <label>Date of birth<input type="date" name="dob" defaultValue={profile?.dob || ''} /></label>
            <label>City<input name="city" defaultValue={profile?.city || 'Indianapolis'} /></label>
            <label>State<input name="state" defaultValue={profile?.state || 'IN'} /></label>
          </div>
        </div>
      </div>

      {/* Step 3 — Details (role-specific) */}
      <div data-step="3" hidden={step !== 3}>
        {role === 'teen' && (
          <div className="card highlight">
            <h3 style={{ marginBottom: 4 }}>🔥 Teen details</h3>
            <p style={{ fontSize: 'var(--text-sm)' }}>Optional — you can fill these in later from your profile.</p>
            <div className="grid two" style={{ marginTop: 16 }}>
              <label>Bio<textarea name="bio" placeholder="What kind of work can you do?" /></label>
              <label>Skills (comma-separated)<input name="skills" placeholder="dog walking, trash, tutoring" /></label>
              <label>School year<input name="school_year" placeholder="9th grade" /></label>
              <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 }}>
                <input type="checkbox" name="guardian_required" style={{ width: 'auto' }} /> Require guardian approval for applications
              </label>
            </div>
          </div>
        )}

        {role === 'adult' && (
          <div className="card highlight">
            <h3 style={{ marginBottom: 4 }}>💼 Business details</h3>
            <p style={{ fontSize: 'var(--text-sm)' }}>You&apos;ll pass verification before you can post jobs.</p>
            <div className="grid two" style={{ marginTop: 16 }}>
              <label>Business name<input name="business_name" /></label>
              <label>Business type<input name="business_type" placeholder="Homeowner, lawn care, local shop" /></label>
            </div>
          </div>
        )}

        {role === 'guardian' && (
          <div className="card highlight">
            <h3 style={{ marginBottom: 4 }}>🛡️ Guardian details</h3>
            <p style={{ fontSize: 'var(--text-sm)' }}>So we can reach you fast if a teen needs help.</p>
            <div className="grid two" style={{ marginTop: 16 }}>
              <label>Emergency contact name<input name="emergency_contact_name" /></label>
              <label>Emergency contact phone<input name="emergency_contact_phone" /></label>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}>
        {step > 1 ? (
          <button type="button" className="btn ghost" onClick={() => go(step - 1)}>← Back</button>
        ) : (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Step {step} of {TOTAL}</span>
        )}
        <div style={{ flex: 1 }} />
        {step < TOTAL ? (
          <button type="button" className="btn primary" onClick={() => go(step + 1)}>Continue →</button>
        ) : (
          <SubmitButton pendingLabel="Saving…">Save and continue</SubmitButton>
        )}
      </div>
    </form>
  )
}
