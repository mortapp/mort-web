import { AppShell } from '@/components/app-shell'
import { requireUser } from '@/lib/auth'
export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile, user } = await requireUser()
  let activeJob: { title: string; status: string } | undefined

  if (profile?.role === 'teen') {
    const { data: activeApplication } = await supabase
      .from('applications')
      .select('status, jobs(title)')
      .eq('teen_id', user.id)
      .in('status', ['accepted', 'in_progress', 'proof_submitted', 'completion_pending_release'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const relatedJob = Array.isArray(activeApplication?.jobs) ? activeApplication.jobs[0] : activeApplication?.jobs
    if (relatedJob?.title && activeApplication?.status) {
      activeJob = { title: relatedJob.title, status: activeApplication.status }
    }
  }

  return (
    <AppShell
      role={profile?.role || 'none'}
      displayName={profile?.display_name || user.email?.split('@')[0] || 'User'}
      xp={profile?.xp_points || 0}
      verificationStatus={profile?.verification_status}
      activeJob={activeJob}
    >
      {children}
    </AppShell>
  )
}
