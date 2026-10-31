import { requireRole } from '@/lib/auth'

export default async function AdultLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['adult'])
  return <>{children}</>
}
