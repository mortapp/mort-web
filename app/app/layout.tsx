import { AppShell } from '@/components/app-shell'
import { requireAuthenticatedUser } from '@/lib/auth'
export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, user } = await requireAuthenticatedUser()
  return (
    <AppShell
      role={profile?.role || 'none'}
      displayName={profile?.display_name || user.email?.split('@')[0] || 'User'}
      xp={profile?.xp_points || 0}
      verificationStatus={profile?.verification_status}
    >
      {children}
    </AppShell>
  )
}
