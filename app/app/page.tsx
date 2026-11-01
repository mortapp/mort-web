import { redirect } from 'next/navigation'
import { requireAuthenticatedUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * The shared /app entry point must never aggregate or render cross-role data.
 * Each role is sent to its own guarded surface; the destination enforces the
 * account activation and role checks before reading role-specific records.
 */
export default async function DashboardEntry() {
  const { profile } = await requireAuthenticatedUser()

  if (!profile?.role) {
    redirect('/app/onboarding?message=' + encodeURIComponent('Complete account setup before opening MORT.'))
  }

  if (profile.role !== 'admin' && (!profile.date_of_birth || !profile.onboarding_completed_at || profile.account_status !== 'active')) {
    redirect('/app/onboarding?message=' + encodeURIComponent('Your account is pending review. Marketplace access is not enabled yet.'))
  }

  switch (profile.role) {
    case 'teen':
      redirect('/app/teen/jobs')
    case 'adult':
      redirect('/app/adult')
    case 'guardian':
      redirect('/app/guardian')
    case 'admin':
      redirect('/app/admin')
    default:
      redirect('/app/onboarding')
  }
}
