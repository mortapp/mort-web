import './mort-public-home.css'
import { MortPublicHome } from '@/components/mort-public-home'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <MortPublicHome isSignedIn={!!user} />
}
