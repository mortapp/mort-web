import { AppShell } from '@/components/app-shell'
import { requireAuthenticatedUser } from '@/lib/auth'
export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, user, supabase } = await requireAuthenticatedUser()

  // Admins see a live pending-approvals counter on the Admin sidebar link.
  // Non-admins never run this query (RLS would return nothing useful anyway).
  let adminPendingCount: number | undefined
  if (profile?.role === 'admin') {
    const { count } = await supabase
      .from('verification_cases')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'needs_review'])
    adminPendingCount = count ?? 0
  }

  return (
    <AppShell
      role={profile?.role || 'none'}
      displayName={profile?.display_name || user.email?.split('@')[0] || 'User'}
      xp={profile?.xp_points || 0}
      verificationStatus={profile?.verification_status}
      adminPendingCount={adminPendingCount}
    >
      {children}
    </AppShell>
  )
}
