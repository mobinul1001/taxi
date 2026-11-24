import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Cloud, Compass, Layers, PenTool, ServerCog, ShieldCheck, Smartphone } from "lucide-react";
import { Crumbs, crumbLd, faqLd, serviceLd, useSeo } from "./seo";
import { Faq, FinalCta, Pic, Shell, Tick, go, useShell } from "./shell";
import { Illus } from "./covers";
import { ROUTES } from "./routes";
import { Related } from "./related";

const TITLE = "Taxi App Developers: Hire a Specialist Team";
const DESC = "Taxi app developers for ride-hailing and taxi platforms: the team roles, technical skills, ways to work together and how to evaluate any developer you hire.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Taxi App Development", to: ROUTES.dev }, { name: "Taxi App Developers", to: ROUTES.developers }];

const FAQS: [string, string][] = [
  ["Who are taxi app developers?", "They are engineers and designers who specialise in the parts a taxi platform needs: passenger and driver mobile apps, live location, driver matching, fares and payments, and the dispatch dashboard behind them. It is different from general app development because of the real-time and two-sided nature of the product."],
  ["What should I look for when hiring taxi app developers?", "Evidence that they have built real-time, multi-role products, a clear process, access to the people who will actually work on your project, and written terms on ownership, support and handover. The checklist on this page lists what to ask for and what to treat as a warning."],
  ["Should I hire a freelancer, an in-house team or an agency?", "A freelancer can suit a narrow task. An in-house team gives control but takes time and budget to build. A specialist team gives a ready mix of design, mobile, backend and testing, which suits a launch. The comparison table on this page sets out the trade-offs."],
  ["How will we work together day to day?", "You get a single point of contact, a shared task board, regular demos of working software and a staging build you can try on your own phone. Decisions are written down so nothing relies on memory."],
  ["Can I hire a dedicated team for my taxi platform?", "Yes. A dedicated team works only on your product and grows or shrinks with your roadmap. A fixed-scope project suits a defined release, and team extension suits an existing in-house group that needs more capacity."],
  ["Do your developers work with existing taxi apps?", "Yes. We can review an existing app, tell you what is sound and what is not, and then fix, extend or replace parts of it. We agree access to the code and environments up front."],
  ["How do I start working with your developers?", "Describe your business, your city and the apps you need. We reply with questions and a proposed team and scope, then agree the first milestone before any commitment beyond it."],
];

type Role = { t: string; I: (p: { size?: number }) => ReactNode; own: string; del: string };
const ROLES: Role[] = [
  { t: "Product and delivery lead", I: Compass, own: "Your single point of contact. Keeps scope, schedule and decisions clear.", del: "Release plan, status updates, written decisions" },
  { t: "UI/UX designer", I: PenTool, own: "Designs the passenger, driver and dispatcher experience and tests it with you.", del: "Prototype, screens and design files" },
  { t: "Mobile developers", I: Smartphone, own: "Build the passenger and driver apps for iOS and Android.", del: "Tested apps and store-ready builds" },
  { t: "Backend engineer", I: ServerCog, own: "Builds the API, matching, pricing, payments and integrations.", del: "Documented API and services" },
  { t: "QA engineer", I: ShieldCheck, own: "Tests trips, cancellations, failed payments and devices before every release.", del: "Test report and verified fixes" },
  { t: "DevOps and cloud", I: Cloud, own: "Sets up hosting, monitoring, backups and release pipelines.", del: "Staging and production environments" },
];

const SKILLS: [string, string, string][] = [
  ["Real-time location", "Streaming driver positions, handling weak GPS and dropped connections.", "Riders and dispatchers rely on a current map."],
  ["Matching and dispatch", "Nearest, offered and manual assignment with timeouts and fallbacks.", "A job that goes unanswered must go somewhere."],
  ["Fares and payments", "Metered, fixed and zone pricing, with gateway integration and refunds.", "Money handling needs to be correct and traceable."],
  ["Maps and routing", "Route, distance and arrival estimates from the maps provider you choose.", "Fares and ETAs depend on them."],
  ["Notifications", "Push, SMS and WhatsApp messages tied to trip status.", "Drivers and passengers stay informed without opening the app."],
  ["Security and data", "Role-based access, protected personal data and audit-friendly records.", "You hold trip, driver and payment-related information."],
  ["Reliability and scale", "Monitoring, backups and a design that grows past the first city.", "A busy evening should not break the platform."],
];

const MODELS: { id: string; t: string; best: string; get: string; watch: string }[] = [
  { id: "ded", t: "Dedicated team", best: "A product that will keep growing, with a steady roadmap.", get: "A team working only on your platform, scaled up or down.", watch: "Needs a clear roadmap to keep the team productive." },
  { id: "fix", t: "Fixed-scope project", best: "A defined first release with agreed deliverables.", get: "A scoped set of apps and features with milestones.", watch: "Changes beyond scope are agreed separately before work." },
  { id: "ext", t: "Team extension", best: "An in-house group that needs more capacity or a missing skill.", get: "Specialists who join your process and tools.", watch: "Your side needs time to coordinate and review." },
];

const RHYTHM: [string, string, string][] = [
  ["Week one", "Kickoff", "We confirm the scope, the team, the tools and how decisions are made."],
  ["Every sprint", "Working demo", "You see working software, not slides, and tell us what to adjust."],
  ["Continuously", "Staging builds", "Try the apps on your own phone against a safe test environment."],
  ["At release", "Handover", "Builds in your accounts, documentation and a support plan."],
];

const CHECK: [string, string, string][] = [
  ["Experience with real-time products", "A walkthrough of a similar live product and what was hard about it.", "Only generic app examples and no talk of live location or dispatch."],
  ["The people who will do the work", "Names and roles of the team on your project.", "Sales meets you, but nobody can say who will build it."],
  ["Process and visibility", "Demo cadence, staging builds and a shared task board.", "Updates only at the end, or only by invoice."],
  ["Ownership and access", "Written terms for source code, data and developer accounts.", "Apps published under the provider's accounts with no handover."],
  ["Testing approach", "How trips, cancellations and payment failures are tested.", "Testing described only as 'we check it before release'."],
  ["Support after launch", "What is covered, response times and who answers.", "Support offered verbally with nothing in the contract."],
];

const COMPARE: [string, string, string, string][] = [
  ["Skills covered", "Usually one or two", "What you manage to hire", "Design, mobile, backend, QA and DevOps"],
  ["Time to start", "Often quick", "Slow: hiring takes months", "Quick: the team already exists"],
  ["Continuity", "Depends on one person's availability", "Strong once built", "Team can cover absence"],
  ["Management load on you", "High: you coordinate the pieces", "High: you lead the team", "Lower: delivery lead coordinates"],
  ["Best when", "A narrow, well-defined task", "Taxi tech is your long-term core", "You want to launch and grow with support"],
];

function Models() {
  const { ask } = useShell();
  const [m, setM] = useState("fix");
  const cur = MODELS.find((x) => x.id === m)!;
  return (
    <>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="sr">Choose how you would like to work with taxi app developers</legend>
        <div className="mdl">
          {MODELS.map((x) => (
            <label key={x.id}>
              <input type="radio" name="model" checked={m === x.id} onChange={() => setM(x.id)} />
              <span className="c"><h3>{x.t}</h3><dl><div><dt>Best when</dt><dd>{x.best}</dd></div><div><dt>You get</dt><dd>{x.get}</dd></div><div><dt>Keep in mind</dt><dd>{x.watch}</dd></div></dl></span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="more"><span role="status">Selected: <b>{cur.t}</b></span><button type="button" className="btn btn-outline" onClick={() => ask(`Talk about a ${cur.t.toLowerCase()}`, { kind: "Not sure yet", notes: `Interested in: ${cur.t}.` })}>Discuss this model</button></div>
    </>
  );
}

function Body() {
  const { ask } = useShell();
  useSeo({ title: TITLE, description: DESC, path: ROUTES.developers, ld: [crumbLd(CRUMBS), serviceLd("Taxi app developers for hire", DESC, ROUTES.developers, "Taxi app developer team"), faqLd(FAQS)] });
  const start = () => ask("Talk to the developers", { kind: "Not sure yet" });
  return (
    <>
      <section className="hero hero-b" id="top">
        <div className="wrap">
          <Crumbs items={CRUMBS} dark />
          <div className="grid2">
            <div>
              <p className="eyebrow light">Taxi app developers</p>
              <h1>Taxi App Developers Who Build the Whole <em>Ride-Hailing Platform</em></h1>
              <p className="sub">A specialist team of designers, mobile and backend developers and testers for taxi and ride-hailing products. You get the right people, a clear way of working and software you can try every sprint.</p>
              <div className="hero-btns">
                <button type="button" className="btn btn-primary" onClick={start}>Talk to the Developers</button>
                <button type="button" className="btn btn-ghost-dark" onClick={() => go("team")}>Meet the Team Roles</button>
              </div>
            </div>
            <Pic label="Project board showing six team roles and their current work: scoping, designing, building and testing" className="crew-wrap">
              <ul className="crew">
                {([["Product lead", "Scope and plan", "Scoping", Compass], ["UI/UX designer", "Rider and driver flows", "Designing", PenTool], ["Mobile developers", "Passenger and driver apps", "Building", Smartphone], ["Backend engineer", "Matching and payments", "Building", ServerCog], ["QA engineer", "Trip scenarios", "Testing", ShieldCheck], ["DevOps", "Staging and release", "Ready", Layers]] as const).map(([a, b, c, I]) => (
                  <li key={a}><span className="av" aria-hidden><I size={18} /></span><span><b>{a}</b><small>{b}</small></span><span className="st">{c}</span></li>
                ))}
              </ul>
            </Pic>
          </div>
        </div>
      </section>

      <section className="sec sec-white" id="team" aria-labelledby="h-team">
        <div className="wrap">
          <p className="eyebrow">Who works on your project</p>
          <h2 className="h2 wide" id="h-team">The roles inside a taxi app development team</h2>
          <p className="lede">A taxi platform needs more than app developers. These are the people who own each part, and what each of them hands to you.</p>
          <ul className="sq">{ROLES.map((r) => <li key={r.t}><span className="av" aria-hidden><r.I size={20} /></span><h3>{r.t}</h3><p className="own">{r.own}</p><p className="del"><b>Delivers</b>{r.del}</p></li>)}</ul>
        </div>
      </section>

      <section className="sec sec-gray" id="skills" aria-labelledby="h-sk">
        <div className="wrap">
          <div className="sh"><div>
          <p className="eyebrow">Technical expertise</p>
          <h2 className="h2 wide" id="h-sk">What good taxi app developers know how to build</h2>
          <p className="lede">These are the areas that decide whether a taxi app works at rush hour, not just in a demo. Specific tools, such as native or cross-platform frameworks, are chosen per project.</p>
          </div><Illus name="tech-stack" /></div>
          <table className="tbl">
            <caption className="sr">Technical areas taxi app developers handle and why each matters</caption>
            <thead><tr><th scope="col">Area</th><th scope="col">What developers handle</th><th scope="col">Why it matters</th></tr></thead>
            <tbody>{SKILLS.map(([a, b, c]) => <tr key={a}><th scope="row">{a}</th><td data-label="What developers handle">{b}</td><td data-label="Why it matters">{c}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="sec sec-white" id="models" aria-labelledby="h-md">
        <div className="wrap">
          <p className="eyebrow">Ways to work together</p>
          <h2 className="h2 wide" id="h-md">Three ways to hire taxi app developers</h2>
          <Models />
        </div>
      </section>

      <section className="sec sec-gray" id="collaboration" aria-labelledby="h-co">
        <div className="wrap">
          <p className="eyebrow">Collaboration</p>
          <h2 className="h2 wide" id="h-co">What working with the team looks like</h2>
          <ol className="rhy" style={{ listStyle: "none", padding: 0 }}>{RHYTHM.map(([w, h, p]) => <li key={h}><span className="when">{w}</span><h3>{h}</h3><p>{p}</p></li>)}</ol>
          <div className="split2">
            <div><h3>What you always have</h3><Tick items={["One named point of contact", "A shared task board you can read", "Written decisions and scope changes", "A staging build to try yourself"]} /></div>
            <div><h3>What we ask of you</h3><Tick items={["Someone who can decide for your business", "Feedback after each demo", "Access to your accounts when needed", "Early sight of drivers or dispatchers for testing"]} /></div>
          </div>
        </div>
      </section>

      <section className="sec sec-white" id="evaluate" aria-labelledby="h-ev">
        <div className="wrap">
          <p className="eyebrow">Before you hire</p>
          <h2 className="h2 wide" id="h-ev">How to evaluate any taxi app developers, including us</h2>
          <table className="tbl">
            <caption className="sr">Checklist for evaluating taxi app developers</caption>
            <thead><tr><th scope="col">Check</th><th scope="col">Ask for</th><th scope="col">Warning sign</th></tr></thead>
            <tbody>{CHECK.map(([a, b, c]) => <tr key={a}><th scope="row">{a}</th><td data-label="Ask for">{b}</td><td data-label="Warning sign" className="redf">{c}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="sec sec-gray" id="why-team" aria-labelledby="h-wt">
        <div className="wrap">
          <p className="eyebrow">Why a specialist team</p>
          <h2 className="h2 wide" id="h-wt">Freelancer, in-house hire or specialist team?</h2>
          <table className="tbl">
            <caption className="sr">Comparison of freelancers, in-house teams and a specialist team</caption>
            <thead><tr><th scope="col">&nbsp;</th><th scope="col">Freelancer</th><th scope="col">In-house team</th><th scope="col">Specialist team</th></tr></thead>
            <tbody>{COMPARE.map(([k, a, b, c]) => <tr key={k}><th scope="row">{k}</th><td data-label="Freelancer">{a}</td><td data-label="In-house team">{b}</td><td data-label="Specialist team">{c}</td></tr>)}</tbody>
          </table>
          <div className="more">
            <Link className="link" to={ROUTES.services}>Our taxi app development services <ArrowRight size={16} /></Link>
            <Link className="link" to={ROUTES.cost}>Taxi app development cost <ArrowRight size={16} /></Link>
            <Link className="link" to={ROUTES.custom}>Custom taxi app development <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <Faq items={FAQS} onAsk={() => ask("Ask us a question", { kind: "Not sure yet" })} heading="Taxi app developers questions, answered" />
      <Related page="developers" />
      <FinalCta title="Talk to the Developers Who Would Build It" text="Tell us about your platform. We will propose a team, a first milestone and how we would work together." startLabel="Talk to the Developers" consultLabel="Request a Consultation" onStart={start} onConsult={() => ask("Request a consultation", { kind: "Not sure yet" })} />
    </>
  );
}

export default function TaxiAppDevelopers() {
  return <Shell testId="page-tad-developers"><Body /></Shell>;
}
