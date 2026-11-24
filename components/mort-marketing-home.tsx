'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Logomark } from '@/components/logomark'
import { ThemeToggle } from '@/components/theme-toggle'
import ui from './mort-marketing-home.module.css'

type ApplyState = 'idle' | 'applying' | 'applied' | 'view'
type Audience = 'teen' | 'adult'

const quickJobs = [
  { title: 'Take out bins', detail: '10 min · $10' },
  { title: 'Water plants', detail: '15 min · $12' },
  { title: 'Carry groceries', detail: '20 min · $15' },
]

const categories = [
  ['Tutoring', 'Help with schoolwork'],
  ['Lawn care', 'Mowing and yard work'],
  ['Dog walking', 'Pet care nearby'],
  ['Errands', 'Everyday helpful tasks'],
  ['Car washing', 'Neighborhood car care'],
  ['Moving help', 'Age-appropriate assistance'],
]

const privacyStages = [
  {
    label: 'Before anyone is accepted',
    eyebrow: 'What you see',
    address: 'Broad Ripple area · 1.2 mi',
    explanation: 'Area and distance only. No street number, map pin, or coordinates.',
    status: 'Exact address: not shown',
  },
  {
    label: 'Accepted, before travel',
    eyebrow: 'What you see',
    address: 'Broad Ripple area · 1.2 mi',
    explanation: 'You’re on the schedule. The exact address stays protected unless it’s needed.',
    status: 'Exact address: protected',
  },
  {
    label: 'On the way and on the job',
    eyebrow: 'While you travel and work',
    address: '1234 Example St',
    explanation: 'The sample address is shown only to illustrate a temporary operational view.',
    status: 'Sample only · not a real address',
  },
  {
    label: 'After it’s done',
    eyebrow: 'In your history',
    address: 'Broad Ripple area · 1.2 mi away',
    explanation: 'The exact address is not part of this sample history view.',
    status: 'Sample address: not shown',
  },
]

const sampleDescription = 'Mow my front lawn, it’s about half an acre'

export function MortMarketingHome({ isSignedIn = false }: { isSignedIn?: boolean }) {
  const [applyState, setApplyState] = useState<ApplyState>('idle')
  const [audience, setAudience] = useState<Audience>('teen')
  const [privacyStage, setPrivacyStage] = useState(0)
  const [helpMessage, setHelpMessage] = useState('Help takes a deliberate hold. This demo does not contact anyone.')
  const [isHolding, setIsHolding] = useState(false)
  const [postText, setPostText] = useState(sampleDescription)
  const [suggestionsVisible, setSuggestionsVisible] = useState(true)
  const [selectedPay, setSelectedPay] = useState(30)
  const [customPay, setCustomPay] = useState('')
  const [showCustomPay, setShowCustomPay] = useState(false)
  const applyTimers = useRef<number[]>([])
  const helpTimer = useRef<number | null>(null)
  const holdActivated = useRef(false)
  const postTimer = useRef<number | null>(null)
  const postRevealTimer = useRef<number | null>(null)
  const actionHref = isSignedIn ? '/app' : '/signup'
  const privacy = privacyStages[privacyStage]

  const clearApplyTimers = () => {
    applyTimers.current.forEach((timer) => window.clearTimeout(timer))
    applyTimers.current = []
  }

  const replayApply = () => {
    clearApplyTimers()
    setApplyState('idle')
    applyTimers.current = [
      window.setTimeout(() => setApplyState('applying'), 500),
      window.setTimeout(() => setApplyState('applied'), 1700),
      window.setTimeout(() => setApplyState('view'), 3000),
    ]
  }

  useEffect(() => () => clearApplyTimers(), [])

  const beginHelpHold = (event: { preventDefault: () => void }) => {
    event.preventDefault()
    if (helpTimer.current !== null) return
    holdActivated.current = false
    setIsHolding(true)
    setHelpMessage('Keep holding… this sample will not call or alert anyone.')
    helpTimer.current = window.setTimeout(() => {
      holdActivated.current = true
      setIsHolding(false)
      setHelpMessage('Demo only: no alert was sent. In immediate danger, call 911.')
      helpTimer.current = null
    }, 1250)
  }

  const endHelpHold = () => {
    if (helpTimer.current !== null) {
      window.clearTimeout(helpTimer.current)
      helpTimer.current = null
      setIsHolding(false)
      if (!holdActivated.current) setHelpMessage('Released early; nothing was sent. This is a demo only.')
    }
  }

  useEffect(() => () => {
    if (helpTimer.current !== null) window.clearTimeout(helpTimer.current)
    if (postTimer.current !== null) window.clearInterval(postTimer.current)
    if (postRevealTimer.current !== null) window.clearTimeout(postRevealTimer.current)
  }, [])

  const replayPost = () => {
    if (postTimer.current !== null) window.clearInterval(postTimer.current)
    if (postRevealTimer.current !== null) window.clearTimeout(postRevealTimer.current)
    setSuggestionsVisible(false)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPostText(sampleDescription)
      setSuggestionsVisible(true)
      return
    }
    setPostText('')
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setPostText(sampleDescription.slice(0, index))
      if (index >= sampleDescription.length) {
        window.clearInterval(timer)
        postTimer.current = null
        postRevealTimer.current = window.setTimeout(() => setSuggestionsVisible(true), 300)
      }
    }, 32)
    postTimer.current = timer
  }

  const applyLabel = {
    idle: 'Apply',
    applying: 'Applying…',
    applied: 'Applied ✓',
    view: 'View application',
  }[applyState]

  return (
    <div className={ui.page}>
      <a className={ui.skipLink} href="#main-content">Skip to content</a>
      <header className={ui.header}>
        <div className={`${ui.shell} ${ui.headerInner}`}>
          <Link className={ui.brand} href="/" aria-label="MORT home">
            <Logomark size={28} />
            <span>MORT</span>
          </Link>
          <nav className={ui.primaryNav} aria-label="Primary navigation">
            <a href="#how">How it works</a>
            <a href="#work">Work</a>
            <a href="#safety">Safety</a>
            <a href="#privacy">Privacy</a>
            <Link href="/legal/terms">Legal</Link>
          </nav>
          <div className={ui.headerActions}>
            <ThemeToggle />
            <Link className={ui.signIn} href={isSignedIn ? '/app' : '/login'}>{isSignedIn ? 'Dashboard' : 'Sign in'}</Link>
            <Link className={`${ui.button} ${ui.buttonPrimary} ${ui.buttonSmall}`} href={actionHref}>{isSignedIn ? 'Open MORT' : 'Get started'}</Link>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className={`${ui.shell} ${ui.hero}`} id="top">
          <div className={ui.heroCopy}>
            <p className={ui.eyebrow}><span aria-hidden="true" /> Local work. Real opportunity.</p>
            <h1 className={ui.heroTitle}>Earn nearby.<br /><span>Move smart.</span></h1>
            <p className={ui.lede}>MORT is a safer way for teens 13–17 to find age-appropriate local work, and for neighbors to hire them.</p>
            <div className={ui.actionRow}>
              <Link className={`${ui.button} ${ui.buttonPrimary}`} href={actionHref}>{isSignedIn ? 'Open MORT' : 'Create account'}</Link>
              <a className={ui.textLink} href="#how">See how it works <span aria-hidden="true">↓</span></a>
            </div>
            <p className={ui.hint}>Safety is built into the experience. Availability varies by location and account.</p>
          </div>

          <div className={ui.phoneStage} aria-label="Illustrative MORT app screen">
            <div className={ui.phone}>
              <h2 className={ui.phoneTitle}>Quick jobs</h2>
              <div className={ui.quickRail}>
                {quickJobs.map((job) => <div className={ui.quickChip} key={job.title}><strong>{job.title}</strong><span>{job.detail}</span></div>)}
              </div>
              <article className={ui.jobCard}>
                <div className={ui.jobTop}><span className={ui.distance}>0.4 mi</span><span>Dana R. · Verified</span></div>
                <h3>Walk Biscuit around the block</h3>
                <p>Today, 4:30 PM · 30 min</p>
                <div className={ui.jobFooter}>
                  <strong>$20</strong>
                  {applyState === 'view' ? (
                    <Link className={ui.applyButton} href={actionHref}>{applyLabel}</Link>
                  ) : (
                    <button className={ui.applyButton} type="button" data-state={applyState} onClick={applyState === 'idle' ? replayApply : undefined} disabled={applyState !== 'idle'} aria-live="polite">{applyLabel}</button>
                  )}
                </div>
              </article>
              <article className={ui.jobCard}>
                <div className={ui.jobTop}><span className={ui.distance}>0.9 mi</span><span>Marcus T. · Verified</span></div>
                <h3>Rake front yard leaves</h3>
                <p>Sat, 10:00 AM · 1 hr</p>
                <div className={ui.jobFooter}><strong>$30</strong><span className={ui.sampleAction}>Sample job</span></div>
              </article>
              <div className={ui.phoneTabs} aria-hidden="true"><span className={ui.activeTab}>Home</span><span>Explore</span><span>Inbox</span><span>Profile</span></div>
            </div>
            <button className={ui.replayButton} type="button" onClick={replayApply}>Replay Apply</button>
            <p className={ui.sampleNote}>Illustrative screen with sample names, jobs, and pay. These are not live listings.</p>
          </div>
        </section>

        <section className={`${ui.section} ${ui.howSection}`} id="how">
          <div className={`${ui.shell} ${ui.split}`}>
            <h2 className={ui.sectionTitle}>From first look<br />to first job.</h2>
            <div className={ui.steps}>
              <article><h3>See the work</h3><p>Jobs show up when you open MORT, with distance, who’s posting, pay, and time up front.</p></article>
              <article><h3>Apply in one tap</h3><p>Send a short, honest application. The person posting reviews it and chooses.</p></article>
              <article><h3>Do it and build a reputation</h3><p>Agree on the details, follow the job steps, and build the reliability that opens up better work.</p></article>
            </div>
          </div>
        </section>

        <section className={`${ui.section} ${ui.workSection}`} id="work">
          <div className={ui.shell}>
            <div className={ui.sectionOverline}><p className={ui.eyebrow}>Real local work</p><span>Local skills. Real experience.</span></div>
            <h2 className={ui.sectionTitle}>Start with what<br />you can do.</h2>
            <div className={ui.categoryGrid}>
              {categories.map(([name, detail], index) => {
                const next = `/app/teen/jobs?category=${encodeURIComponent(name.toLowerCase())}`
                return <Link className={ui.category} href={isSignedIn ? next : `/signup?next=${encodeURIComponent(next)}`} key={name}>
                  <span className={ui.categoryNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={ui.categoryMark} aria-hidden="true">{['＋', '／', '⌁', '↗', '◌', '▤'][index]}</span>
                  <h3>{name}</h3><p>{detail}</p><span className={ui.categoryArrow} aria-hidden="true">↗</span>
                </Link>
              })}
            </div>
          </div>
        </section>

        <section className={ui.safetyBand} id="safety">
          <div className={`${ui.shell} ${ui.safetyGrid}`}>
            <div>
              <p className={ui.eyebrow}>Safety is part of the job</p>
              <h2 className={ui.sectionTitle}>Safety is part of the job, not an add-on.</h2>
              <div className={ui.safetyPoints}>
                <article><h3>Check-ins that fit the job</h3><p>Short jobs and longer jobs have check-in points.</p></article>
                <article><h3>Start and finish PINs</h3><p>Job milestones can be confirmed by both sides.</p></article>
                <article><h3>Exact address stays private</h3><p>Listings show an area and distance; exact details are limited to when they are needed.</p></article>
              </div>
              <p className={ui.safetyDisclaimer}>MORT is not emergency dispatch. In immediate danger, call 911. Safety features and availability vary by location and account.</p>
            </div>
            <div className={ui.holdDemo}>
              <button
                className={`${ui.holdButton} ${isHolding ? ui.holding : ''}`}
                type="button"
                aria-describedby="help-demo-message"
                onPointerDown={beginHelpHold}
                onPointerUp={endHelpHold}
                onPointerLeave={endHelpHold}
                onPointerCancel={endHelpHold}
                onKeyDown={(event) => { if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) beginHelpHold(event) }}
                onKeyUp={(event) => { if (event.key === ' ' || event.key === 'Enter') endHelpHold() }}
              >
                <svg viewBox="0 0 180 180" aria-hidden="true"><circle className={ui.holdTrack} cx="90" cy="90" r="86" /><circle className={ui.holdProgress} cx="90" cy="90" r="86" /></svg>
                <span>Hold for<br />help</span>
              </button>
              <p className={ui.holdMessage} id="help-demo-message" aria-live="polite">{helpMessage}</p>
              <p className={ui.sampleNoteDark}>Demonstration only — no call, alert, or message is sent.</p>
            </div>
          </div>
        </section>

        <section className={`${ui.section} ${ui.privacySection}`} id="privacy">
          <div className={ui.shell}>
            <p className={ui.eyebrow}>Location privacy</p>
            <h2 className={ui.sectionTitle}>Your address isn’t a permanent record.</h2>
            <div className={ui.privacyLayout}>
              <div className={ui.stageList} role="group" aria-label="Address visibility by job stage">
                {privacyStages.map((stage, index) => <button className={privacyStage === index ? ui.stageSelected : ''} type="button" aria-pressed={privacyStage === index} onClick={() => setPrivacyStage(index)} key={stage.label}>{stage.label}</button>)}
              </div>
              <div className={ui.privacyPanel} aria-live="polite">
                <p className={ui.panelEyebrow}>{privacy.eyebrow}</p>
                <p className={`${ui.sampleAddress} ${privacyStage === 2 ? ui.maskedAddress : ''}`}>{privacy.address}</p>
                <p className={ui.panelExplanation}>{privacy.explanation}</p>
                <span className={ui.panelTag}>{privacy.status}</span>
                <p className={ui.sampleNote}>Sample scenario for illustration; it does not display a real job address.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${ui.section} ${ui.postSection}`} id="post">
          <div className={ui.shell}>
            <p className={ui.eyebrow}>For neighbors and local businesses</p>
            <h2 className={ui.sectionTitle}>Posting is a sentence, not a form.</h2>
            <div className={ui.postGrid}>
              <div>
                <p className={ui.lede}>Describe what you need in plain words. MORT can suggest a title, category, time, tools, and pay for you to review.</p>
                <p className={ui.postNote}>This sample flow is illustrative. The exact address is not shown in public listings; features and availability vary by location and account.</p>
                <button className={`${ui.button} ${ui.buttonSecondary}`} type="button" onClick={replayPost}>Replay sample</button>
              </div>
              <div className={ui.postSheet} aria-label="Illustrative job-posting flow">
                <h3>What do you need help with?</h3>
                <div className={ui.promptField} aria-live="polite">{postText}<span className={ui.caret} aria-hidden="true" /></div>
                <div className={`${ui.suggestions} ${suggestionsVisible ? ui.suggestionsVisible : ''}`}>
                  <div><span>Title</span><strong>Mow the front lawn</strong></div>
                  <div><span>Category</span><strong>Lawn care</strong></div>
                  <div><span>Time needed</span><strong>About 1 hr</strong></div>
                  <div><span>Tools</span><strong>Poster provides mower</strong></div>
                </div>
                <div className={ui.paySelector}>
                  <p>Illustrative pay selector · sample amount ${showCustomPay && customPay ? customPay : selectedPay}</p>
                  <div className={ui.payPills} role="group" aria-label="Sample pay amount">
                    {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((amount) => <button type="button" aria-pressed={!showCustomPay && selectedPay === amount} className={!showCustomPay && selectedPay === amount ? ui.paySelected : ''} onClick={() => { setSelectedPay(amount); setShowCustomPay(false) }} key={amount}>${amount}{amount === 30 && <span>Suggested</span>}</button>)}
                    <button type="button" aria-pressed={showCustomPay} className={showCustomPay ? ui.paySelected : ''} onClick={() => setShowCustomPay(true)}>Other</button>
                    {showCustomPay && <label className={ui.customPay}>Custom amount (min $10)<input type="number" min="10" inputMode="numeric" value={customPay} onChange={(event) => setCustomPay(event.target.value)} placeholder="$ amount" /></label>}
                  </div>
                </div>
                <p className={ui.cancellationNote}>Any cancellation window and final job details are shown before a post is published.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${ui.section} ${ui.rolesSection}`} id="roles">
          <div className={ui.shell}>
            <p className={ui.eyebrow}>One product, two sides of the street</p>
            <h2 className={ui.sectionTitle}>One product, two sides of the street.</h2>
            <div className={ui.roleSwitch} role="group" aria-label="Choose your perspective">
              <button type="button" aria-pressed={audience === 'teen'} className={audience === 'teen' ? ui.roleSelected : ''} onClick={() => setAudience('teen')}>I’m a teen</button>
              <button type="button" aria-pressed={audience === 'adult'} className={audience === 'adult' ? ui.roleSelected : ''} onClick={() => setAudience('adult')}>I’m hiring</button>
            </div>
            <div className={ui.roleBody}>
              <div>
                <h3>{audience === 'teen' ? 'Turn your time into something.' : 'Post it. Pick the right teen.'}</h3>
                <p>{audience === 'teen' ? 'Find real, age-appropriate work in your neighborhood, apply in minutes, and build a reputation.' : 'Describe the job, review applicants, and manage the work from one place. Built for neighbors and local businesses.'}</p>
                <Link className={`${ui.button} ${ui.buttonPrimary}`} href={actionHref}>{audience === 'teen' ? 'Create a teen account' : 'Create an adult account'}</Link>
              </div>
              <div className={ui.appNavSample} aria-label="Illustrative app navigation"><span className={ui.appNavActive}>Home</span><span>Explore</span>{audience === 'adult' && <strong aria-label="Post a job">+</strong>}<span>Inbox</span><span>Profile</span></div>
            </div>
          </div>
        </section>

        <section className={ui.finalCta}>
          <div className={`${ui.shell} ${ui.finalInner}`}>
            <p className={ui.eyebrow}>Start the crossing</p>
            <h2>Earn nearby.<br />Move smart.</h2>
            <Link className={`${ui.button} ${ui.buttonLight}`} href={actionHref}>{isSignedIn ? 'Open MORT' : 'Get started'}</Link>
          </div>
        </section>
      </main>

      <footer className={ui.footer}>
        <div className={`${ui.shell} ${ui.footerInner}`}>
          <div className={ui.footerBrand}>
            <Link className={ui.brand} href="/" aria-label="MORT home"><Logomark size={26} /><span>MORT</span></Link>
            <p>Local opportunity, with a little more thought behind it.</p>
            <span>© 2026 MORT. Availability and features vary by location and account status.</span>
          </div>
          <nav className={ui.footerNav} aria-label="Footer navigation">
            <Link href="#how">How it works</Link><Link href="/safety">Safety</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link><Link href="/account-deletion">Delete account</Link><Link href={isSignedIn ? '/app' : '/login'}>{isSignedIn ? 'Dashboard' : 'Sign in'}</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
