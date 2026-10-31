import { requireRole } from '@/lib/auth'

export default async function GuardianLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['guardian'])
  return <>{children}</>
}
