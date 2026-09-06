import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import './safety.css'

const chapters = [
  { id: 'before', label: 'Before the job', title: <>Trust starts<br />with context.</>, details: [
    ['Adult verification', 'Adults and businesses submit a verification request before they can post jobs. A human admin reviews and approves or rejects every request.'],
    ['Marketplace rules', 'No off-platform payment pressure, private info requests, unsafe meetups, harassment, bullying, fake jobs, or adult-to-teen manipulation of any kind.'],
  ] },
  { id: 'during', label: 'During the job', title: <>A connection.<br />With boundaries.</>, details: [
    ['Teen controls', 'Safety pings, one-tap reporting, Guardian Mode oversight, verified adults, visible job locations, proof-of-work uploads, and a dispute record for every job.'],
    ['Moderated messaging', "Teens and adults can only message once there's a real job application between them — never random direct messages. Messages are scanned for common risk patterns."],
  ] },
  { id: 'response', label: 'If something goes wrong', title: <>Your safety<br />comes first.</>, details: [
    ['In immediate danger', 'If you or someone else is in immediate danger, call emergency services first. MORT is not a replacement for calling 911 or local emergency services.'],
    ['A record of the work', 'One-tap reporting and a dispute record for every job are part of the teen controls. These tools do not replace emergency services.'],
  ] },
  { id: 'guardian', label: 'Guardian oversight', title: <>Room to grow.<br />A way to stay close.</>, details: [
    ['Guardian oversight', "Guardians can require approval before a teen's application goes to the job poster, and can see safety pings and job activity for connected teens at any time."],
  ] },
  { id: 'limits', label: 'Know the limitations', title: <>Safeguards.<br /><em>Not guarantees.</em></>, details: [
    ['Legal & safety limitations (please read)', "MORT is an MVP built for teens 13+. It has not yet completed formal legal review, background-check integration, or a 24/7 human moderation team. Treat every job with the same caution you'd use meeting anyone new — bring a friend, meet in public/visible locations, and tell a trusted adult where you're going."],
  ] },
]

export default function SafetyPage() {
  return <>
    <SiteHeader />
    <main id="main-content" tabIndex={-1} className="safe-passage">
      <section className="safe-opening" aria-labelledby="safe-title">
        <div className="safe-opening-copy">
          <p className="safe-label">The guarded crossing / MORT</p>
          <h1 id="safe-title">MORT Safety</h1>
          <p className="safe-display">A light to<br /><em>navigate by.</em></p>
          <p className="safe-intro">MORT is built around teen safety at every step — before, during, and after a job.</p>
          <a className="safe-link" href="#before">Understand the safeguards <span aria-hidden="true">↓</span></a>
        </div>
        <div className="safe-scene-window" data-scene-drag="true" aria-hidden="true">
          <span className="safe-horizon-mark">THE WATCH / 01</span>
          <span className="safe-interaction">Hold + drag to stir the atmosphere</span>
        </div>
        <aside className="safe-emergency" aria-label="Emergency guidance">
          <span className="safe-emergency-label">Immediate danger?</span>
          <p><strong>MORT is not a replacement for calling 911 or local emergency services.</strong> If you or someone else is in immediate danger, call emergency services first.</p>
        </aside>
        <span className="safe-opening-coordinate" aria-hidden="true">PROCEED WITH CARE — ALWAYS</span>
      </section>
      <nav className="safe-chapter-nav" aria-label="Safety chapters">
        {chapters.map((chapter, index) => <a href={`#${chapter.id}`} key={chapter.id}><span>0{index + 1}</span>{chapter.label}</a>)}
      </nav>
      <div className="safe-route">
        {chapters.map((chapter, index) => <section id={chapter.id} className={`safe-stop ${index % 2 ? 'safe-stop-right' : ''} safe-${chapter.id}`} key={chapter.id} aria-labelledby={`${chapter.id}-title`}>
          <div className="safe-stop-marker"><span>0{index + 1}</span><p>{chapter.label}</p></div>
          <div className="safe-stop-copy">
            <p className="safe-label">{['A considered first step', 'Keep the work in view', 'Know where to turn', 'Someone alongside', 'A clear view of where we stand'][index]}</p>
            <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
            {chapter.details.map(([heading, text]) => <div className="safe-detail" key={heading}><h3>{heading}</h3><p>{text}</p></div>)}
            {chapter.id === 'limits' && <div className="safe-end-links"><Link className="safe-link" href="/legal/terms">Read the terms <span aria-hidden="true">↗</span></Link><Link className="safe-link" href="/">Return to MORT <span aria-hidden="true">↗</span></Link></div>}
          </div>
          {(index === 0 || index === 2) && <div className="safe-sightline" aria-hidden="true"><span>{index === 0 ? 'Stay aware of the ground ahead.' : 'No one should have to navigate alone.'}</span><i /></div>}
        </section>)}
      </div>
    </main>
  </>
}
