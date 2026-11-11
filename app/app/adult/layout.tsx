import { requireRole } from '@/lib/auth'

export default async function AdultLayout({ children }: { children: React.ReactNode }) {
  // Pages under /app/adult accept admins (the app shell shows admins the
  // adult section), so the layout must not be stricter than its pages.
  await requireRole(['adult', 'admin'])
  return <>{children}</>
}
