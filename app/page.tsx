import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Logomark } from '@/components/logomark'
import styles from './page.module.css'

type IconName = 'lawn' | 'pet' | 'tutoring' | 'car' | 'cleaning' | 'errands'

const categories: { name: string; key: string; icon: IconName; description: string }[] = [
  { name: 'Lawn care', key: 'lawn care', icon: 'lawn', description: 'Outdoor jobs and yard help' },
  { name: 'Pet care', key: 'dog walking', icon: 'pet', description: 'Walking and caring for pets' },
  { name: 'Tutoring', key: 'tutoring', icon: 'tutoring', description: 'Helping others learn' },
  { name: 'Car washing', key: 'car washing', icon: 'car', description: 'Cleaning and detailing cars' },
  { name: 'Cleaning', key: 'cleaning', icon: 'cleaning', description: 'Everyday household help' },
  { name: 'Errands', key: 'errands', icon: 'errands', description: 'Simple neighborhood tasks' },
]

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11" /></svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16m-7-7 7 7-7 7" /></svg>
  )
}

function CategoryIcon({ name }: { name: IconName }) {
  const common = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const }
  switch (name) {
    case 'lawn': return <svg {...common}><path d="M4 20V6m0 11 4-3 4 3 4-5 4 3M2 20h20M8 8l2-4 2 4M16 8l2-4 2 4" /></svg>
    case 'pet': return <svg {...common}><circle cx="5" cy="8" r="1.5" /><circle cx="10" cy="5" r="1.5" /><circle cx="16" cy="5" r="1.5" /><circle cx="20" cy="9" r="1.5" /><path d="M10 12c-2 1-5 3-5 6 0 2 2 3 4 2 2-1 4-1 6 0 2 1 4 0 4-2 0-3-4-6-6-6-1 0-2 0-3 0Z" /></svg>
    case 'tutoring': return <svg {...common}><path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14M6 9h3m6 0h3M6 13h3m6 0h3" /></svg>
    case 'car': return <svg {...common}><path d="m5 11 2-5h10l2 5M4 11h16a1 1 0 0 1 1 1v6H3v-6a1 1 0 0 1 1-1ZM6 18v2m12-2v2M6 14h2m8 0h2" /></svg>
    case 'cleaning': return <svg {...common}><path d="m8 6 8 8m-9-2 5-5m2 8 4 5H4l4-8m-2 5h12M15 3v4m-2-2h4" /></svg>
    default: return <svg {...common}><path d="M4 7h16v13H4zM8 7V5a4 4 0 0 1 8 0v2M4 12h16m-10 0v2h4v-2" /></svg>
  }
}

function MarketingHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link className={styles.brand} href="/" aria-label="MORT homepage"><Logomark size={28} /><span>MORT</span></Link>
        <nav className={styles.desktopNav} aria-label="Main navigation">
          <a href="#categories">Find work</a>
          <a href="#how-it-works">How it works</a>
          <a href="#for-posters">Post a job</a>
          <Link href="/safety">Safety</Link>
        </nav>
        <div className={styles.headerActions}>
          {signedIn ? <Link className={styles.headerButton} href="/app">Dashboard <Arrow /></Link> : <><Link className={styles.loginLink} href="/login">Log in</Link><Link className={styles.headerButton} href="/signup">Get started <Arrow /></Link></>}
        </div>
        <details className={styles.mobileMenu}>
          <summary aria-label="Open navigation"><span></span><span></span><span></span></summary>
          <nav aria-label="Mobile navigation">
            <a href="#categories">Find work</a>
            <a href="#how-it-works">How it works</a>
            <a href="#for-posters">Post a job</a>
            <Link href="/safety">Safety</Link>
            {!signedIn && <Link href="/login">Log in</Link>}
            <Link className={styles.mobilePrimary} href={signedIn ? '/app' : '/signup'}>{signedIn ? 'Dashboard' : 'Get started'} <Arrow /></Link>
          </nav>
        </details>
      </div>
    </header>
  )
}

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: openJobs } = await supabase.from('jobs').select('category').eq('status', 'open')
  const counts: Record<string, number> = {}
  for (const job of openJobs ?? []) {
    const key = (job.category ?? '').toLowerCase().trim()
    if (key) counts[key] = (counts[key] ?? 0) + 1
  }
  const jobsHref = user ? '/app/teen/jobs' : '/signup?next=%2Fapp%2Fteen%2Fjobs'
  const signupHref = user ? '/app' : '/signup'

  return (
    <div className={styles.landing}>
      <MarketingHeader signedIn={!!user} />
      <main id="main-content">
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <div className={styles.eyebrow}><span className={styles.dot} /> LOCAL OPPORTUNITIES FOR TEENS 13–17</div>
              <h1>Find work.<br /><span>Earn nearby.</span></h1>
              <p>Find local work you can do, build real experience, and connect with people in your community. MORT makes it easier to get started.</p>
              <div className={styles.heroActions}><Link href={jobsHref} className={styles.primaryButton}>Find opportunities <Arrow /></Link><a href="#for-posters" className={styles.secondaryButton}>I need help with a job</a></div>
              <p className={styles.heroNote}>Designed for teens, adults, and local businesses. Availability varies by area.</p>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.preview}>
                <div className={styles.previewHeader}><span className={styles.previewTitle}>Explore local work</span><span className={styles.previewDot}><span /></span></div>
                <p className={styles.previewSubtitle}>Opportunities start in your neighborhood.</p>
                <div className={styles.previewGrid}>
                  {categories.slice(0, 4).map(category => {
                    const next = `/app/teen/jobs?category=${category.key}`
                    const href = user ? `/app/teen/jobs?category=${encodeURIComponent(category.key)}` : `/signup?next=${encodeURIComponent(next)}`
                    return <Link key={category.key} className={styles.previewCategory} href={href}><span className={styles.previewCategoryIcon}><CategoryIcon name={category.icon} /></span><span>{category.name}</span><Arrow diagonal /></Link>
                  })}
                </div>
                <div className={styles.previewFooter}><span className={styles.previewFootIcon}>✓</span><span>Find opportunities that fit your skills and schedule.</span></div>
              </div>
              <div className={styles.previewAccent} aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className={styles.introStrip} aria-label="MORT overview"><div className={styles.container}>
          <div><strong>For teens 13–17</strong><span>Discover age-appropriate local work</span></div>
          <div><strong>For neighbors</strong><span>Find help with everyday tasks</span></div>
          <div><strong>Built around safety</strong><span>Reporting and safety tools included</span></div>
        </div></section>

        <section id="categories" className={styles.section}><div className={styles.container}>
          <div className={styles.sectionHead}><div><span className={styles.kicker}>DISCOVER WORK</span><h2>Work that fits your life.</h2><p>Explore everyday opportunities and find something you can do close to home.</p></div><Link className={styles.textLink} href={jobsHref}>Browse opportunities <Arrow /></Link></div>
          <div className={styles.categoryGrid}>
            {categories.map(category => {
              const count = counts[category.key] ?? 0
              const next = `/app/teen/jobs?category=${category.key}`
              const href = user ? `/app/teen/jobs?category=${encodeURIComponent(category.key)}` : `/signup?next=${encodeURIComponent(next)}`
              return <Link key={category.key} href={href} className={styles.categoryCard}><div className={styles.categoryIcon}><CategoryIcon name={category.icon} /></div><div className={styles.categoryCardBody}><h3>{category.name}</h3><p>{category.description}</p></div><div className={styles.categoryBottom}><span>{count > 0 ? `${count} open ${count === 1 ? 'job' : 'jobs'}` : 'Explore category'}</span><Arrow diagonal /></div></Link>
            })}
          </div>
        </div></section>

        <section id="how-it-works" className={styles.howSection}><div className={styles.container}>
          <div className={styles.sectionHead}><div><span className={styles.kicker}>SIMPLE FROM THE START</span><h2>How MORT works.</h2><p>From finding an opportunity to finishing a job, know what comes next.</p></div></div>
          <div className={styles.steps}>
            <div className={styles.step}><span className={styles.stepNo}>01</span><h3>Explore opportunities</h3><p>Browse local tasks, see what's involved, and choose work that fits you.</p></div>
            <div className={styles.step}><span className={styles.stepNo}>02</span><h3>Apply and coordinate</h3><p>Apply to a job, connect through MORT, and agree on the details before starting.</p></div>
            <div className={styles.step}><span className={styles.stepNo}>03</span><h3>Complete the work</h3><p>Follow the job's progress, finish the task, and build your experience.</p></div>
          </div>
        </div></section>

        <section id="for-posters" className={styles.forEveryone}><div className={styles.container}><div className={styles.dualGrid}>
          <article className={styles.audienceCard}><span className={styles.kicker}>FOR TEENS</span><h2>Your skills can<br />take you places.</h2><p>Discover work nearby, apply to jobs that interest you, and build real-world experience one opportunity at a time.</p><Link href={jobsHref} className={styles.primaryButton}>Explore work <Arrow /></Link><div className={styles.audienceArtTeen} aria-hidden="true"><span className={styles.audienceArtLabel}>YOUR NEXT OPPORTUNITY</span><span className={styles.audienceArtShape}>M</span></div></article>
          <article className={styles.audienceCard}><span className={styles.kicker}>FOR ADULTS & BUSINESSES</span><h2>Get a little help.<br />Make a big difference.</h2><p>Have an age-appropriate task that needs doing? Post an opportunity and connect with local teens interested in helping.</p><Link href={signupHref} className={styles.primaryButton}>Get started <Arrow /></Link><div className={styles.audienceArtAdult} aria-hidden="true"><span className={styles.audienceArtLabel}>LOCAL HELP, SIMPLIFIED</span><span className={styles.audienceArtBlocks}><i /><i /><i /></span></div></article>
        </div></div></section>

        <section className={styles.safetySection}><div className={styles.container}>
          <div className={styles.safetyCopy}><span className={styles.kicker}>SAFETY IS PART OF THE PRODUCT</span><h2>Built with younger workers in mind.</h2><p>Every opportunity deserves clear expectations. MORT includes tools for reporting concerns, managing conversations, and keeping track of work. No platform can guarantee safety, so responsible job screening and adult involvement remain important.</p><Link className={styles.textLink} href="/safety">Learn about safety at MORT <Arrow /></Link></div>
          <div className={styles.safetyFeatures}>
            <div><span className={styles.featureSymbol}>01</span><div><strong>Job tracking</strong><p>Know the status of each application and job.</p></div></div>
            <div><span className={styles.featureSymbol}>02</span><div><strong>Reporting tools</strong><p>Raise concerns and block unwanted contact.</p></div></div>
            <div><span className={styles.featureSymbol}>03</span><div><strong>Guardian involvement</strong><p>Family involvement and oversight options where supported.</p></div></div>
          </div>
        </div></section>

        <section className={styles.finalSection}><div className={styles.container}><div><span className={styles.finalKicker}>GET IN MOTION</span><h2>Ready to get started?</h2><p>Make your next move with MORT.</p></div><Link href={signupHref} className={styles.finalButton}>Get started <Arrow /></Link></div></section>
      </main>
      <footer className={styles.footer}><div className={styles.container}>
        <div className={styles.footerTop}><div className={styles.footerBrand}><Link className={styles.brand} href="/"><Logomark size={26} /><span>MORT</span></Link><p>Earn nearby. Move smart.</p></div>
          <div className={styles.footerLinks}>
            <div><strong>Explore</strong><a href="#categories">Find work</a><a href="#how-it-works">How it works</a><a href="#for-posters">Post a job</a></div>
            <div><strong>Resources</strong><Link href="/safety">Safety</Link><Link href="/login">Log in</Link><Link href="/signup">Create account</Link></div>
            <div><strong>Legal</strong><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link><a href="https://legal.mortapp.org">Legal center</a></div>
          </div>
        </div>
        <div className={styles.footerBottom}><span>© 2026 MORT. All rights reserved.</span><span>Opportunities are subject to local availability and applicable youth-work rules.</span></div>
      </div></footer>
    </div>
  )
}
