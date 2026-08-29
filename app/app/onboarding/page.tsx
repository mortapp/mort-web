// Calibrated Liquid Glass: onboarding follows the app’s existing visual grammar while preserving an intentional safe destination.
import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions } from '@/components/ui'
import { OnboardingForm } from '@/components/onboarding-form'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

const roleHome: Record<string, string> = {
  teen: '/app/teen/jobs',
  adult: '/app/adult',
  guardian: '/app/guardian',
  admin: '/app/admin',
}

export default async function Onboarding({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const { profile } = await requireUser()
  const sp = await searchParams
  const alreadyDone = profile?.onboarding_completed && profile?.role

  return (
    <>
      <PageHeaderWithActions title="Onboarding" eyebrow="Setup" description="Pick how you use MORT. Teens get jobs, adults post jobs, guardians watch safety." />
      <Toast message={sp?.message} />
      {alreadyDone && (
        <div className="notice" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span>You&apos;ve already completed onboarding as a {profile.role}. You can update your info below, or head straight to your dashboard.</span>
          <Link href={roleHome[profile.role] || '/app'} className="btn primary sm">Go to dashboard</Link>
        </div>
      )}
      <OnboardingForm profile={profile} next={sp?.next} />
    </>
  )
}
