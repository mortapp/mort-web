'use server'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'

function v(fd: FormData, k: string) {
  const x = fd.get(k)
  return x == null ? null : String(x).trim()
}

function fail(message: string): never {
  redirect(`/app/guardian?message=${encodeURIComponent(message)}`)
}

// Guardian pause/resume goes through the guarded backend RPC, which verifies
// an active, fully-consented guardian link (or admin staff role) before it
// touches the teen's profile, and writes an audit record.
export async function setTeenPaused(formData: FormData) {
  const { supabase } = await requireRole(['guardian', 'admin'])
  const teenId = v(formData, 'teen_id')
  const paused = v(formData, 'paused')

  if (!teenId) fail('Missing teen.')
  if (paused !== 'true' && paused !== 'false') fail('Invalid pause state.')

  const { data, error } = await supabase.rpc('mort_set_guardian_pause_v1', {
    p_teen_id: teenId,
    p_paused: paused === 'true',
  })
  if (error) fail(`Pause update failed: ${error.message}`)
  if (data && data.ok === false) fail(data.message || data.code || 'The backend rejected this request.')

  redirect(
    `/app/guardian?message=${encodeURIComponent(
      paused === 'true' ? 'Teen account paused. They cannot apply to jobs or message until you resume it.' : 'Teen account resumed.'
    )}`
  )
}
