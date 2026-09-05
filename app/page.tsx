import { Icon } from '@/components/mort/icon'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { MortHero } from '@/components/mort-hero'
import { MortVoyage } from '@/components/mort-voyage'
import { Logomark } from '@/components/logomark'
import { CategoryTile } from '@/components/ui'
import { createClient } from '@/lib/supabase/server'

const categories = ['tutoring', 'lawn care', 'dog walking', 'cleaning', 'errands', 'babysitting', 'car washing', 'trash help']
const roles = [
  { number: '01', title: 'Your first step.\nYour own momentum.', role: 'FOR TEENS', text: 'Turn what you can do into experience. Find nearby work, apply, and build a history one completed job at a time.', cta: 'Find your opportunity' },
  { number: '02', title: 'Local help.\nA meaningful start.', role: 'FOR ADULTS', text: 'Post lawful, age-appropriate jobs. Review applicants, agree on the work, and help someone in your community get started.', cta: 'Bring a job to MORT' },
  { number: '03', title: 'Room to grow.\nA way to stay close.', role: 'FOR GUARDIANS', text: 'Connect through an invite code. Follow applications and safety check-ins, with approval controls where required.', cta: 'Be part of the journey' },
]
export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: openJobs } = await supabase.from('jobs').select('category').eq('status', 'open')
  const counts: Record<string, number> = {}
  for (const job of openJobs || []) { const key = (job.category || '').toLowerCase().trim(); if (key) counts[key] = (counts[key] || 0) + 1 }
  return <>
    <SiteHeader isSignedIn={!!user} />
    <main id="main-content" tabIndex={-1} className="cinema-home">
      <MortHero />
      <section id="crossing" className="chapter crossing-chapter">
        <div className="chapter-heading"><span className="eyeline">01 / THE CROSSING</span><h2>Every beginning<br />has a way forward.</h2><p>A job is more than a listing. From first application to finished work, know where you stand and what comes next.</p></div>
        <MortVoyage />
      </section>
      <section className="chapter manifesto">
        <span className="eyeline">02 / A LITTLE STRUCTURE. A LOT OF POSSIBILITY.</span>
        <h2>The world is big.<br /><span>Start where you are.</span></h2>
        <div className="principle-list">
          <article><span>01 — MOVE</span><h3>Real work, close to home.</h3><p>A lawn to care for. A subject to teach. A neighbor who could use a hand. Start with something you can do.</p></article>
          <article><span>02 — CONNECT</span><h3>People, with context.</h3><p>Profiles, job histories, applications and in-app messaging give each conversation a clear place to begin.</p></article>
          <article><span>03 — BUILD</span><h3>Experience that adds up.</h3><p>Follow a clear job lifecycle and keep a record of what you finish. One crossing becomes the start of another.</p></article>
        </div>
      </section>
      <section id="categories" className="chapter opportunity-chapter">
        <div className="chapter-heading split-heading"><div><span className="eyeline">03 / FIND YOUR START</span><h2>Something you can do.<br />Someone who needs it.</h2></div><p>Explore work in your community.<br />Availability comes from live job listings.</p></div>
        <div className="opportunity-list">{categories.map(category => <CategoryTile key={category} category={category} label={category.charAt(0).toUpperCase() + category.slice(1)} count={counts[category] || 0} href={`/signup?next=${encodeURIComponent(`/app/teen/jobs?category=${category}`)}`} />)}</div>
      </section>
      <section id="roles" className="chapter role-chapter">
        <div className="chapter-heading"><span className="eyeline">04 / NO ONE CROSSES ALONE</span><h2>Different roles.<br />A shared direction.</h2></div>
        <div className="role-editorial">{roles.map(role => <article key={role.role}><div className="role-index" aria-hidden="true">{role.number}</div><span className="eyeline">{role.role}</span><h3>{role.title}</h3><p>{role.text}</p><Link className="text-link" href="/signup">{role.cta}<span aria-hidden="true"><Icon name="↗" size={18} /></span></Link></article>)}</div>
      </section>
      <section className="chapter safety-chapter">
        <div className="safety-sigil" aria-hidden="true"><Logomark size={84} /><span>MOVE WITH CARE</span></div>
        <div><span className="eyeline">05 / SAFETY IS PART OF THE CROSSING</span><h2>Independence.<br />With people alongside.</h2><p>Reporting, blocking, safety check-ins and guardian connections belong in the experience. They are never a premium upgrade.</p><p className="safety-honesty">MORT cannot guarantee anyone’s safety. In an immediate emergency, contact local emergency services.</p><Link className="text-link" href="/safety">Inside the Safety Center <span aria-hidden="true"><Icon name="↗" size={18} /></span></Link></div>
      </section>
      <section className="chapter destination"><span className="eyeline">YOUR NEXT CHAPTER</span><h2>Make your<br /><em>first move.</em></h2><Link className="btn primary lg" href="/signup">Get started with MORT <span aria-hidden="true"><Icon name="↗" size={18} /></span></Link><p>Earn nearby. Move smart.</p></section>
    </main>
    <footer className="footer"><div className="container"><div className="footer-grid"><div><Link href="/" className="logo"><Logomark size={26} /><span>MORT</span></Link><p className="footer-description">Local opportunity.<br />Real experience. Your next chapter.</p></div><div><h3>Explore</h3><div className="footer-links"><Link href="#crossing">The crossing</Link><Link href="#roles">Who it’s for</Link><Link href="/safety">Safety</Link></div></div><div><h3>Legal</h3><div className="footer-links"><Link href="/legal/terms">Terms of service</Link><Link href="/legal/privacy">Privacy policy</Link></div></div><div><h3>Your account</h3><div className="footer-links"><Link href="/signup">Create account</Link><Link href="/login">Sign in</Link></div></div></div><div className="footer-bottom"><span>© 2026 MORT</span><span>Compensation is arranged off-platform.</span></div></div></footer>
  </>
}
