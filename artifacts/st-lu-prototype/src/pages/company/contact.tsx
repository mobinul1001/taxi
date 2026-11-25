import { useId, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { submitEnquiry, thanksState } from "./formFlow";
import { ArrowRight, Check, Clock } from "lucide-react";
import { Crumbs, crumbLd, faqLd, useSeo, siteRef } from "./seo";
import { Faq, FinalCta, Pic, Shell, Tick, go } from "./shell";
import { ROUTES, canonicalOf } from "./routes";

const TITLE = "Contact Us: Taxi App Project Consultation";
const DESC = "Contact us about your taxi app project. Describe your taxi business and the apps you want, and we will reply with questions and a suggested next step.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Contact", to: ROUTES.contact }];

const FAQS: [string, string][] = [
  ["How do I request a taxi app development consultation?", "Fill in the form on this page with your name, work email and a short description of your taxi business and what you want to build. We read it and reply with questions and a suggested next step."],
  ["What should I include in my message?", "Your type of business, the city or area you serve, roughly how many vehicles or drivers you have, which apps you need and anything you already have, such as an existing app or a brand. Even a few lines are enough to start."],
  ["Is the consultation a commitment?", "No. A consultation is a conversation about your idea and the options. You decide afterwards whether to ask for a written proposal."],
  ["Do you work with businesses that already have a taxi app?", "Yes. Tell us what exists and what is not working. We can review it and suggest whether to fix, extend or rebuild parts of it."],
  ["I only want to understand the cost first. Can I still get in touch?", "Yes. Read our taxi app development cost guide, use the scope tool there, then send us the summary through this form for a written estimate."],
  ["Is my information kept private?", "The details you send are used to answer your enquiry. The form is sent through Formspree, a form-handling service."],
];

const KINDS = ["Taxi booking app", "Custom taxi app", "White label taxi app", "Uber-like app", "Taxi dispatch software", "Request a demo", "Not sure yet"];
const BIZ = ["Taxi company", "Ride-hailing start-up", "Airport transfer operator", "Corporate transport", "Chauffeur or limousine", "Tour operator", "Other"];
const STAGE = ["Just an idea", "Planning and comparing options", "I have an app that needs work", "Ready to start"];
const NEXT: [string, string][] = [
  ["We read your message", "A person on the team reads what you sent, not an automatic reply."],
  ["We reply with questions", "A few questions about your fleet, city and goals so we understand the business."],
  ["We suggest a scope", "The apps, features and approach that fit, with what is and is not included."],
  ["You decide", "Ask for a written proposal, change the scope or stop here."],
];
const TOPICS: [string, string, string][] = [
  ["Choosing a solution", "Which apps and modules fit your kind of taxi business.", ROUTES.solutions],
  ["Understanding the budget", "What drives cost, and what to plan beyond the build.", ROUTES.cost],
  ["Meeting the team", "Who would work on your project and how we collaborate.", ROUTES.developers],
  ["Reviewing the services", "Every service and what you receive from it.", ROUTES.services],
];

type Err = Partial<Record<"name" | "email" | "message", string>>;

function Form() {
  const id = useId();
  const st = (useLocation().state ?? null) as { kind?: string; notes?: string } | null;
  const [errs, setErrs] = useState<Err>({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState("");
  const nav = useNavigate();
  const ref = useRef<HTMLFormElement>(null);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const name = String(d.get("name") ?? "").trim(), email = String(d.get("email") ?? "").trim(), message = String(d.get("message") ?? "").trim();
    const n: Err = {};
    if (!name) n.name = "Please enter your name.";
    if (!email) n.email = "Please enter your work email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) n.email = "That email does not look right. Check it and try again.";
    if (!message) n.message = "Please tell us a little about your project.";
    setErrs(n);
    const first = (["name", "email", "message"] as const).find((k) => n[k]);
    if (first) { ref.current?.querySelector<HTMLElement>(`[name=${first}]`)?.focus(); return; }
    setBusy(true); setFail("");
    const r = await submitEnquiry(Object.fromEntries(d) as Record<string, string>);
    setBusy(false);
    if (r.ok) nav(ROUTES.thankYou, { state: thanksState(String(d.get("kind") ?? "")) });
    else setFail(r.error);
  };
  const bad = Object.keys(errs).length > 0;
  const f = (k: "name" | "email" | "message") => ({ "aria-invalid": errs[k] ? true : undefined, "aria-describedby": errs[k] ? `${id}-${k}-e` : undefined } as const);
  return (
    <form className="cform" id="form" ref={ref} onSubmit={submit} noValidate aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`}>Request a consultation</h2>
      <p style={{ marginTop: 8, color: "var(--mute)", fontSize: 15 }}>Tell us about your taxi business and what you would like to launch. Fields marked * are required.</p>
      {bad && <div className="sum" role="alert">Please fix the highlighted fields and send again.</div>}
      <div className="row2">
        <div className="field"><label htmlFor={`${id}-name`}>Your name *</label><input id={`${id}-name`} name="name" autoComplete="name" required {...f("name")} />{errs.name && <span className="err" id={`${id}-name-e`}>{errs.name}</span>}</div>
        <div className="field"><label htmlFor={`${id}-email`}>Work email *</label><input id={`${id}-email`} name="email" type="email" autoComplete="email" required {...f("email")} />{errs.email && <span className="err" id={`${id}-email-e`}>{errs.email}</span>}</div>
      </div>
      <div className="row2">
        <div className="field"><label htmlFor={`${id}-biz`}>Type of business</label><select id={`${id}-biz`} name="business" defaultValue={BIZ[0]}>{BIZ.map((k) => <option key={k}>{k}</option>)}</select></div>
        <div className="field"><label htmlFor={`${id}-kind`}>What do you want to build?</label><select id={`${id}-kind`} name="kind" defaultValue={st?.kind && KINDS.includes(st.kind) ? st.kind : "Not sure yet"}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select></div>
      </div>
      <div className="field"><label htmlFor={`${id}-st`}>Where are you now?</label><select id={`${id}-st`} name="stage" defaultValue={STAGE[1]}>{STAGE.map((k) => <option key={k}>{k}</option>)}</select></div>
      <div className="field"><label htmlFor={`${id}-message`}>Project notes *</label><textarea id={`${id}-message`} name="message" required defaultValue={st?.notes ?? ""} {...f("message")} placeholder="Your city, fleet size, apps you need, anything you already have." />{errs.message && <span className="err" id={`${id}-message-e`}>{errs.message}</span>}</div>
      {fail && <p className="err" role="alert" style={{ marginTop: 12 }}>{fail}</p>}
      <button type="submit" className="btn btn-primary" disabled={busy} style={{ marginTop: 20, width: "100%" }}>{busy ? "Sending…" : "Send request"}</button>
      <p className="fine">We use what you send only to reply to your enquiry. See our <Link to={ROUTES.privacy}>privacy policy</Link> for details.</p>
    </form>
  );
}

function Body() {
  const nav = useNavigate();
  useSeo({
    title: TITLE, description: DESC, path: ROUTES.contact,
    ld: [crumbLd(CRUMBS), { "@context": "https://schema.org", "@type": "ContactPage", name: TITLE, description: DESC, url: canonicalOf(ROUTES.contact), isPartOf: siteRef }, faqLd(FAQS)],
  });
  return (
    <>
      <section className="hero hero-b" id="top">
        <div className="wrap">
          <Crumbs items={CRUMBS} dark />
          <div className="grid2" style={{ alignItems: "start" }}>
            <div>
              <p className="eyebrow light">Taxi app development company contact</p>
              <h1>Talk to Us About Your <em>Taxi App Project</em></h1>
              <p className="sub">Tell us about your taxi or ride-hailing business. We will reply with questions and a suggested scope, with no obligation to continue.</p>
              <h2 className="gl-h">What helps us most</h2>
              <ul className="gl-chips">{["Your type of business and the city you serve", "Roughly how many vehicles or drivers", "The apps you need, or what you already have", "Anything that must work a particular way"].map((t) => <li key={t}><Check size={16} aria-hidden />{t}</li>)}</ul>
              <p className="gl-note"><Clock size={16} aria-hidden /> We reply during working hours: Monday to Friday, 9:00 AM to 5:00 PM Eastern Time (ET).</p>
            </div>
            <Form />
          </div>
        </div>
      </section>

      <section className="sec sec-white" id="next" aria-labelledby="h-next">
        <div className="wrap">
          <p className="eyebrow">What happens next</p>
          <h2 className="h2 wide" id="h-next">From your message to a clear next step</h2>
          <div className="next-grid">
          <ol className="rhy" style={{ listStyle: "none", padding: 0 }}>{NEXT.map(([h, p], i) => <li key={h}><span className="when">Step {i + 1}</span><h3>{h}</h3><p>{p}</p></li>)}</ol>
          <Pic label="Example project brief with business type, fleet and apps filled in. Illustrative." className="brief-wrap">
            <div className="brief">
              <h3>Project brief (example)</h3>
              <dl><div><dt>Business</dt><dd>Airport transfer operator</dd></div><div><dt>Fleet</dt><dd>Small, growing</dd></div><div><dt>Apps</dt><dd>Passenger, driver, admin</dd></div></dl>
              <span className="tag2">Illustrative example, not a real client.</span>
            </div>
          </Pic>
          </div>
        </div>
      </section>

      <section className="sec sec-gray" id="topics" aria-labelledby="h-top">
        <div className="wrap">
          <p className="eyebrow">Before you write</p>
          <h2 className="h2 wide" id="h-top">Prepare for the consultation</h2>
          <p className="lede">These pages answer the questions most people bring to a first conversation.</p>
          <ul className="xplore">{TOPICS.map(([h, p, to]) => <li key={h}><h3>{h}</h3><p>{p}</p><Link className="link" to={to}>Read more <ArrowRight size={16} /><span className="sr"> about {h.toLowerCase()}</span></Link></li>)}</ul>
        </div>
      </section>

      <Faq items={FAQS} onAsk={() => go("form")} heading="Consultation questions, answered" lede="Still unsure? Send us a note with the form and we will answer." />
      <FinalCta title="Ready to Talk About Your Taxi App?" text="Send us a few lines about your business. We will take it from there." startLabel="Go to the Form" consultLabel="Browse Our Solutions" onStart={() => go("form")} onConsult={() => nav(ROUTES.solutions)} />
    </>
  );
}

export default function Contact() {
  return <Shell testId="page-tad-contact"><Body /></Shell>;
}
