import { MortMarketingHome } from '@/components/mort-marketing-home'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <MortMarketingHome isSignedIn={!!user} />
}
