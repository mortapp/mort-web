'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import ui from './mort-index-home.module.css'

type ApplyState = 'idle' | 'applying' | 'applied' | 'view'
type Role = 'teen' | 'adult'

const stages = [
  {
    eyebrow: 'What you see',
    address: 'Broad Ripple area · 1.2 mi',
    explanation: 'Area and distance only. No street number, map pin, or coordinates.',
    status: 'Exact address: not shown',
  },
  {
    eyebrow: 'What you see',
    address: 'Broad Ripple area · 1.2 mi',
    explanation: 'You’re on the schedule. The exact address stays protected unless it’s needed.',
    status: 'Exact address: protected',
  },
  {
    eyebrow: 'While you travel and work',
    address: '1234 Example St',
    explanation: 'MORT navigation opens the route. The address appears only while it’s needed.',
    status: 'Exact address: visible for now',
  },
  {
    eyebrow: 'In your history',
    address: 'Broad Ripple area · 1.2 mi away',
    explanation: 'The exact address is gone from history. That protects the teen and the person who posted.',
    status: 'Exact address: removed',
  },
]

const categories = [
  ['Tutoring', 'Help with schoolwork'],
  ['Lawn care', 'Mowing and yard work'],
  ['Dog walking', 'Pet care nearby'],
  ['Errands', 'Everyday helpful tasks'],
  ['Car washing', 'Neighborhood car care'],
  ['Moving help', 'Age-appropriate assistance'],
]

const sampleDescription = 'Mow my front lawn, it’s about half an acre'
const payAmounts = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

export function MortMarketingHome({ isSignedIn = false }: { isSignedIn?: boolean }) {
  const [applyState, setApplyState] = useState<ApplyState>('idle')
  const [role, setRole] = useState<Role>('teen')
  const [stageIndex, setStageIndex] = useState(0)
  const [helpMessage, setHelpMessage] = useState('Help takes a deliberate hold, so it can’t be triggered by accident. Try it.')
  const [isHolding, setIsHolding] = useState(false)
  const [postText, setPostText] = useState('')
  const [suggestionsVisible, setSuggestionsVisible] = useState(false)
  const [selectedPay, setSelectedPay] = useState(30)
  const [customPay, setCustomPay] = useState<number | ''>('')
  const [showCustomPay, setShowCustomPay] = useState(false)
  const applyTimers = useRef<number[]>([])
  const holdTimer = useRef<number | null>(null)
  const holdActivated = useRef(false)
  const postTimer = useRef<number | null>(null)
  const postRevealTimer = useRef<number | null>(null)
  const postRef = useRef<HTMLElement>(null)
  const actionHref = isSignedIn ? '/app' : '/signup'
  const currentStage = stages[stageIndex]
  const roleContent = role === 'teen'
    ? {
        title: 'Turn your time into something.',
        description: 'Find real, age-appropriate work in your neighborhood, apply in minutes, and build a reputation.',
        button: 'Create a teen account',
        tabs: ['Home', 'Explore', 'Inbox', 'Profile'],
      }
    : {
        title: 'Post it. Pick the right teen.',
        description: 'Describe the job, review applicants, and manage the work from one place. Built for neighbors and local businesses.',
        button: 'Create an adult account',
        tabs: ['Home', 'Explore', '+', 'Inbox', 'Profile'],
      }

  const runApply = () => {
    applyTimers.current.forEach((timer) => window.clearTimeout(timer))
    setApplyState('idle')
    applyTimers.current = [
      window.setTimeout(() => setApplyState('applying'), 500),
      window.setTimeout(() => setApplyState('applied'), 1700),
      window.setTimeout(() => setApplyState('view'), 3000),
    ]
  }

  useEffect(() => {
    const timer = window.setTimeout(runApply, 1200)
    return () => {
      window.clearTimeout(timer)
      applyTimers.current.forEach((item) => window.clearTimeout(item))
    }
  }, [])

  const beginHelpHold = (event: { preventDefault: () => void }) => {
    event.preventDefault()
    if (holdTimer.current !== null) return
    holdActivated.current = false
    setIsHolding(true)
    setHelpMessage('Keep holding…')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    holdTimer.current = window.setTimeout(() => {
      holdActivated.current = true
      setIsHolding(false)
      setHelpMessage('Demo only. This site doesn’t contact anyone. In danger, call 911.')
      holdTimer.current = null
    }, reducedMotion ? 300 : 1250)
  }

  const endHelpHold = () => {
    if (holdTimer.current === null) return
    window.clearTimeout(holdTimer.current)
    holdTimer.current = null
    setIsHolding(false)
    if (!holdActivated.current) setHelpMessage('Released early, nothing was sent. That’s the point.')
  }

  const replayPost = () => {
    if (postTimer.current !== null) window.clearInterval(postTimer.current)
    if (postRevealTimer.current !== null) window.clearTimeout(postRevealTimer.current)
    setSelectedPay(30)
    setCustomPay('')
    setShowCustomPay(false)
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

  useEffect(() => {
    const node = postRef.current
    if (!node) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        replayPost()
        observer.disconnect()
      }
    }, { threshold: 0.35 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current)
    if (postTimer.current !== null) window.clearInterval(postTimer.current)
    if (postRevealTimer.current !== null) window.clearTimeout(postRevealTimer.current)
  }, [])

  const applyLabel = {
    idle: 'Apply',
    applying: 'Applying',
    applied: 'Applied ✓',
    view: 'View application',
  }[applyState]

  return (
    <div className={ui.page}>
      <header>
        <div className="wrap">
          <Link className="logo" href="#top" aria-label="MORT home">MORT</Link>
          <nav aria-label="Primary">
            <a href="#how">How it works</a><a href="#work">Work</a><a href="#safety">Safety</a><a href="#privacy">Privacy</a><Link href="/legal/terms">Legal</Link>
          </nav>
          <Link className="signin" href={isSignedIn ? '/app' : '/login'}>{isSignedIn ? 'Dashboard' : 'Sign in'}</Link>
          <Link className="btn sm" href={actionHref}>{isSignedIn ? 'Open MORT' : 'Get started'}</Link>
        </div>
      </header>

      <main>
        <div className="wrap hero" id="top">
          <div>
            <h1>Earn nearby. Move smart.</h1>
            <p className="lede">MORT is a safer way for teens 13–17 to find age-appropriate local work, and for neighbors to hire them.</p>
            <div className="row"><Link className="btn" href={actionHref}>{isSignedIn ? 'Open MORT' : 'Create account'}</Link><a className="btn ghost" href="#how">See how it works</a></div>
            <p className="hint">Safety is built into the experience. Availability varies by location and account.</p>
          </div>
          <div className="stage" aria-label="Illustration of the MORT app Home screen">
            <div className="phone">
              <h4>Quick jobs</h4>
              <div className="rail"><div className="chip"><b>Take out bins</b><span>10 min · $10</span></div><div className="chip"><b>Water plants</b><span>15 min · $12</span></div><div className="chip"><b>Carry groceries</b><span>20 min · $15</span></div></div>
              <div className="job"><div className="top"><span className="dist">0.4 mi</span><span>Dana R. · Verified</span></div><div className="t">Walk Biscuit around the block</div><div className="m">Today, 4:30 PM · 30 min</div><div className="foot"><span className="pay">$20</span><button className="apply" type="button" data-s={applyState} aria-live="polite" aria-label="Apply to illustrative sample job" onClick={() => { if (applyState === 'idle') runApply() }}>{applyLabel}{applyState === 'applying' && <span className="dots" aria-hidden="true" />}</button></div></div>
              <div className="job"><div className="top"><span className="dist">0.9 mi</span><span>Marcus T. · Verified</span></div><div className="t">Rake front yard leaves</div><div className="m">Sat, 10:00 AM · 1 hr</div><div className="foot"><span className="pay">$30</span><button className="apply" type="button" tabIndex={-1} aria-hidden="true">Apply</button></div></div>
              <div className="tabs"><span className="on">Home</span><span>Explore</span><span>Inbox</span><span>Profile</span></div>
            </div>
            <button className="replay" type="button" onClick={runApply}>Replay Apply</button>
          </div>
        </div>

        <section id="how"><div className="wrap split">
          <h2>From first look to first job.</h2>
          <div className="steps">
            <div><h3>See the work</h3><p>Jobs show up the moment you open MORT, with distance, who’s posting, pay, and time up front.</p></div>
            <div><h3>Apply in one tap</h3><p>Send a short, honest application. The person posting reviews and chooses.</p></div>
            <div><h3>Do it and build a reputation</h3><p>Agree on the details, follow the job steps, and earn the reliability that opens up better work.</p></div>
          </div>
        </div></section>

        <section id="work" className="work"><div className="wrap">
          <h2>Start with what you can do.</h2>
          <div className="cats">{categories.map(([title, description]) => <div className="cat" key={title}><h3>{title}</h3><p>{description}</p></div>)}</div>
        </div></section>

        <section className="band" id="safety"><div className="wrap safe">
          <div>
            <h2>Safety is part of the job, not an add-on.</h2>
            <div className="pts">
              <div><h3>Check-ins that fit the job</h3><p>Short jobs and long jobs both get them.</p></div>
              <div><h3>Start and finish PINs</h3><p>Both sides confirm when work begins and ends.</p></div>
              <div><h3>Exact address stays private</h3><p>Listings show distance and area. Details are shared only when needed.</p></div>
            </div>
            <p className="small">MORT’s tools aren’t emergency dispatch. In immediate danger, call 911. Features roll out by state and account.</p>
          </div>
          <div className="hold">
            <button className={`hb${isHolding ? ' go' : ''}`} type="button" id="hb" aria-describedby="hm" onPointerDown={beginHelpHold} onPointerUp={endHelpHold} onPointerLeave={endHelpHold} onPointerCancel={endHelpHold} onKeyDown={(event) => { if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) beginHelpHold(event) }} onKeyUp={(event) => { if (event.key === ' ' || event.key === 'Enter') endHelpHold() }}>
              <svg viewBox="0 0 180 180" aria-hidden="true"><circle className="tr" cx="90" cy="90" r="86" /><circle className="pr" cx="90" cy="90" r="86" /></svg>
              Hold for help
            </button>
            <p className="hmsg" id="hm" aria-live="polite">{helpMessage}</p>
          </div>
        </div></section>

        <section className="priv" id="privacy"><div className="wrap">
          <h2>Your address isn’t a permanent record.</h2>
          <div className="prow">
            <div className="stages" role="tablist" aria-label="Job stage">
              {['Before anyone is accepted', 'Accepted, before travel', 'On the way and on the job', 'After it’s done'].map((label, index) => <button type="button" role="tab" aria-selected={stageIndex === index} onClick={() => setStageIndex(index)} key={label}>{label}</button>)}
            </div>
            <div className="panel" role="tabpanel" aria-live="polite">
              <div className="k">{currentStage.eyebrow}</div>
              <div className="addr">{stageIndex === 2 ? <span className="mask">{currentStage.address}</span> : currentStage.address}</div>
              <p className="why">{currentStage.explanation}</p>
              <span className="tag">{currentStage.status}</span>
              <p className="sample">Sample address for illustration.</p>
            </div>
          </div>
        </div></section>

        <section className="post" id="post" ref={postRef}><div className="wrap">
          <h2>Posting is a sentence, not a form.</h2>
          <div className="pgrid">
            <div>
              <p className="lede">Say what you need in plain words. MORT suggests the title, category, time, tools, and pay. You confirm or change everything before it goes live.</p>
              <p className="pnote">The exact address stays private. Teens see the area and distance. Before you publish, you see the real job card a teen will see.</p>
              <div className="row replay-row"><button className="btn ghost" type="button" onClick={replayPost}>Replay</button></div>
            </div>
            <div className="sheet" aria-label="Illustration of the MORT post-a-job flow">
              <h4>What do you need help with?</h4>
              <div className="field" aria-live="polite">{postText}<span className="caret" aria-hidden="true" /></div>
              <div className={`sug${suggestionsVisible ? ' on' : ''}`}>
                <div><span>Title</span><b>Mow the front lawn</b></div>
                <div><span>Category</span><b>Lawn care</b></div>
                <div><span>Time needed</span><b>About 1 hr</b></div>
                <div><span>Tools</span><b>Poster provides mower</b></div>
              </div>
              <div className="pay"><div className="lab">Pay · tap to change, or type an amount</div>
                <div className="pills" role="group" aria-label="Pay amount">
                  {payAmounts.map((amount) => <button type="button" aria-pressed={!showCustomPay && selectedPay === amount} onClick={() => { setSelectedPay(amount); setShowCustomPay(false) }} key={amount}>${amount}{amount === 30 && <span className="rec">Suggested</span>}</button>)}
                  {showCustomPay ? <input type="number" min="10" inputMode="numeric" placeholder="$ amount" aria-label="Type a pay amount, minimum 10 dollars" value={customPay} onChange={(event) => { const value = event.target.value; setCustomPay(value === '' ? '' : Math.max(10, Math.floor(Number(value)))) }} /> : <button type="button" onClick={() => setShowCustomPay(true)}>Other</button>}
                </div>
              </div>
              <p className="rule">Late-cancellation window: set by MORT from the job’s length and effort, shown before you publish.</p>
            </div>
          </div>
        </div></section>

        <section><div className="wrap">
          <h2>One product, two sides of the street.</h2>
          <div className="roles">
            <div className="seg" role="tablist" aria-label="Choose your role">
              <button type="button" role="tab" aria-selected={role === 'teen'} onClick={() => setRole('teen')}>I’m a teen</button>
              <button type="button" role="tab" aria-selected={role === 'adult'} onClick={() => setRole('adult')}>I’m hiring</button>
            </div>
            <div className="rolebody" role="tabpanel">
              <div><h3>{roleContent.title}</h3><p>{roleContent.description}</p><Link className="btn" href={actionHref}>{isSignedIn ? 'Open MORT' : roleContent.button}</Link></div>
              <div className="bar" aria-label="App navigation">{roleContent.tabs.map((tab, index) => tab === '+' ? <b className="plus" aria-label="Post a job" key={`${tab}-${index}`}>+</b> : <span className={index === 0 ? 'on' : ''} key={tab}>{tab}</span>)}</div>
            </div>
          </div>
        </div></section>

        <section className="band cta"><div className="wrap"><h2>Earn nearby. Move smart.</h2><div className="row" style={{ marginTop: 32 }}><Link className="btn" style={{ background: '#fff', color: '#000', borderColor: '#fff' }} href={actionHref}>{isSignedIn ? 'Open MORT' : 'Get started'}</Link></div></div></section>
      </main>

      <footer><div className="wrap">
        <div><b>MORT</b><br />Local opportunity, with a little more thought behind it.<br />© 2026 MORT. Availability and features vary by location and account status.</div>
        <nav aria-label="Footer"><Link href="/safety">Safety</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link><Link href="/account-deletion">Delete account</Link><Link href={isSignedIn ? '/app' : '/login'}>{isSignedIn ? 'Dashboard' : 'Sign in'}</Link></nav>
      </div></footer>
    </div>
  )
}
