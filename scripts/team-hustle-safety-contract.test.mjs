import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const migration = readFileSync(new URL('../supabase/migrations/20261115_harden_team_hustle_gate_and_capacity.sql', import.meta.url), 'utf8')
const reviewMigration = readFileSync(new URL('../supabase/migrations/20261115_add_team_hustle_staff_review.sql', import.meta.url), 'utf8')
const independentReviewMigration = readFileSync(new URL('../supabase/migrations/20261115_prevent_team_hustle_self_review.sql', import.meta.url), 'utf8')
const actions = readFileSync(new URL('../app/app/team-hustles/actions.ts', import.meta.url), 'utf8')
const page = readFileSync(new URL('../app/app/team-hustles/page.tsx', import.meta.url), 'utf8')

test('team-hustle creation enforces active, approved adult status inside the RPC', () => {
  assert.match(migration, /private\.is_active_user\(\)/)
  assert.match(migration, /v_role = 'adult'::public\.mort_role[\s\S]*?coalesce\(v_verification_status, ''\) not in \('approved', 'verified'\)/)
  assert.match(migration, /'adult_verification_required'/)
})

test('team-hustle join serializes capacity check and membership insert', () => {
  assert.match(migration, /select \* into v_hustle[\s\S]*?for update;/)
  assert.match(migration, /count\(\*\)[\s\S]*?>= v_hustle\.workers_needed[\s\S]*?insert into public\.team_hustle_members/)
})

test('new team hustles remain hidden and unjoinable until admin review', () => {
  assert.match(reviewMigration, /review_status text not null default 'approved'/)
  assert.match(reviewMigration, /alter table public\.team_hustles alter column review_status set default 'pending'/)
  assert.match(reviewMigration, /th\.review_status = 'approved'/)
  assert.match(reviewMigration, /v_hustle\.review_status <> 'approved'/)
  assert.match(reviewMigration, /'staff_review_required'/)
  assert.match(reviewMigration, /'team_hustle_reviewed'/)
})

test('admin review requires a reason for rejection and is exposed in the UI', () => {
  assert.match(reviewMigration, /'rejection_reason_required'/)
  assert.match(actions, /export async function reviewTeamHustle/)
  assert.match(actions, /profile\?\.role !== 'admin'/)
  assert.match(actions, /p_decision: decision/)
  assert.match(actions, /p_reason: reason \|\| null/)
  assert.match(independentReviewMigration, /admin_self_review_not_allowed/)
  assert.match(independentReviewMigration, /v_status = v_target_status and v_reviewed_by = v_user/)
  assert.match(page, /h\.review_status === 'pending'/)
  assert.match(page, /isAdmin && !h\.i_am_poster/)
  assert.match(page, /name="decision" value="approve"/)
  assert.match(page, /name="decision" value="reject"/)
})

test('team-hustle page gates adult posting and separates errors from success', () => {
  assert.match(page, /const canPost =/)
  assert.match(page, /sp\?\.error \? 'error' : 'default'/)
  assert.match(page, /Adult identity verification must be approved/)
  assert.match(page, /review each new hustle before teens can see or join it/i)
  assert.match(actions, /Adults must be approved before posting team hustles/)
  assert.match(actions, /submitted for review\. Teens will see it only after approval/)
  assert.match(actions, /\?error=\$\{encodeURIComponent\(rpcText\(data\)\)\}/)
  assert.doesNotMatch(actions, /\?message=\$\{encodeURIComponent\(rpcText\(data\)\)\}/)
})
