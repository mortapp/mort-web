import PhoneDemo from "@/components/PhoneDemo";
import HoldForHelp from "@/components/HoldForHelp";
import PrivacyStages from "@/components/PrivacyStages";
import PostDemo from "@/components/PostDemo";
import Roles from "@/components/Roles";

const CATEGORIES: [string, string][] = [
  ["Tutoring", "Help with schoolwork"],
  ["Lawn care", "Mowing and yard work"],
  ["Dog walking", "Pet care nearby"],
  ["Errands", "Everyday helpful tasks"],
  ["Car washing", "Neighborhood car care"],
  ["Moving help", "Age-appropriate assistance"],
];

export default function Home() {
  return (
    <>
      <div className="wrap hero" id="top">
        <div>
          <h1>Earn nearby. Move smart.</h1>
          <p className="lede">
            MORT is a safer way for teens 13–17 to find age-appropriate local work, and for neighbors to hire them.
          </p>
          <div className="row">
            <a className="btn" href="https://mortapp.org/signup">Create account</a>
            <a className="btn ghost" href="#how">See how it works</a>
          </div>
          <p className="hint">Safety is built into the experience. Availability varies by location and account.</p>
        </div>
        <PhoneDemo />
      </div>

      <section id="how">
        <div className="wrap split">
          <h2>From first look to first job.</h2>
          <div className="steps">
            <div><h3>See the work</h3><p>Jobs show up the moment you open MORT, with distance, who’s posting, pay, and time up front.</p></div>
            <div><h3>Apply in one tap</h3><p>Send a short, honest application. The person posting reviews and chooses.</p></div>
            <div><h3>Do it and build a reputation</h3><p>Agree on the details, follow the job steps, and earn the reliability that opens up better work.</p></div>
          </div>
        </div>
      </section>

      <section id="work" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2>Start with what you can do.</h2>
          <div className="cats">
            {CATEGORIES.map(([t, d]) => (
              <div className="cat" key={t}><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="safety">
        <div className="wrap safe">
          <div>
            <h2>Safety is part of the job, not an add-on.</h2>
            <div className="pts">
              <div><h3>Check-ins that fit the job</h3><p>Short jobs and long jobs both get them.</p></div>
              <div><h3>Start and finish PINs</h3><p>Both sides confirm when work begins and ends.</p></div>
              <div><h3>Exact address stays private</h3><p>Listings show distance and area. Details are shared only when needed.</p></div>
            </div>
            <p className="small">
              MORT’s tools aren’t emergency dispatch. In immediate danger, call 911. Features roll out by state and account.
            </p>
          </div>
          <HoldForHelp />
        </div>
      </section>

      <PrivacyStages />
      <PostDemo />
      <Roles />

      <section className="band cta">
        <div className="wrap">
          <h2>Earn nearby. Move smart.</h2>
          <div className="row" style={{ marginTop: 32 }}>
            <a className="btn" style={{ background: "#fff", color: "#000", borderColor: "#fff" }} href="https://mortapp.org/signup">
              Get started
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
