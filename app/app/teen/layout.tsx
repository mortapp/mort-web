import { requireRole } from '@/lib/auth'

export default async function TeenLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['teen'])
  return <>{children}</>
}
