'use client'

// Calibrated Liquid Glass: role selection remains visually distinct while setup stays clear and keyboard-friendly.
import { useState } from 'react'
import { saveOnboarding } from '@/app/app/actions'
import { SubmitButton } from '@/components/submit-button'

interface Props {
  profile: any
  next?: string
}

const ROLES = [
  { value: 'teen', icon: '🔥', title: 'Teen worker', desc: 'Find nearby paid jobs and build XP.' },
  { value: 'adult', icon: '💼', title: 'Adult / business', desc: 'Post jobs for local teens to apply to.' },
  { value: 'guardian', icon: '🛡️', title: 'Guardian', desc: 'Watch over a connected teen\'s safety.' },
]

export function OnboardingForm({ profile, next }: Props) {
  const [role, setRole] = useState<string>(profile?.role || 'teen')

  return (
    <form action={saveOnboarding} className="form">
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="next" value={next || ''} />

      <div>
        <h4 style={{ marginBottom: 10 }}>I am a…</h4>
        <div className="grid three">
          {ROLES.map((r) => (
            <button
              type="button"
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`card hoverable ${role === r.value ? 'highlight' : ''}`}
              style={{ textAlign: 'left', cursor: 'pointer', position: 'relative' }}
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

      <div className="card">
        <h4 style={{ marginBottom: 12 }}>About you</h4>
        <div className="grid two">
          <label>Display name<input name="display_name" defaultValue={profile?.display_name || ''} required /></label>
          <label>Username<input name="username" defaultValue={profile?.username || ''} /></label>
          <label>Date of birth<input type="date" name="dob" defaultValue={profile?.dob || ''} /></label>
          <label>City<input name="city" defaultValue={profile?.city || 'Indianapolis'} /></label>
          <label>State<input name="state" defaultValue={profile?.state || 'IN'} /></label>
        </div>
      </div>

      {role === 'teen' && (
        <div className="card highlight">
          <h4 style={{ marginBottom: 12 }}>🔥 Teen details</h4>
          <div className="grid two">
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
          <h4 style={{ marginBottom: 12 }}>💼 Business details</h4>
          <div className="grid two">
            <label>Business name<input name="business_name" /></label>
            <label>Business type<input name="business_type" placeholder="Homeowner, lawn care, local shop" /></label>
          </div>
          <p style={{ fontSize: 12.5, marginTop: 10 }}>You&apos;ll need to pass verification before you can post jobs.</p>
        </div>
      )}

      {role === 'guardian' && (
        <div className="card highlight">
          <h4 style={{ marginBottom: 12 }}>🛡️ Guardian details</h4>
          <div className="grid two">
            <label>Emergency contact name<input name="emergency_contact_name" /></label>
            <label>Emergency contact phone<input name="emergency_contact_phone" /></label>
          </div>
        </div>
      )}

      <SubmitButton size="lg" pendingLabel="Saving…">Save and continue</SubmitButton>
    </form>
  )
}
