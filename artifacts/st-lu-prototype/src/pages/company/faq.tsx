import { Link } from "react-router-dom";
import { useMemo, useState, type ReactNode } from "react";
import { Crumbs, crumbLd, faqLd, useSeo } from "./seo";
import { FinalCta, Shell, go, useShell } from "./shell";
import { ROUTES } from "./routes";

const TITLE = "Taxi App Development FAQ: Apps, Dispatch, Cost & Support";
const DESC = "Answers about taxi app development: passenger and driver apps, admin dashboards, dispatch, custom or white label builds, integrations, maintenance and cost.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "FAQ", to: ROUTES.faq }];

type QA = { q: string; a: ReactNode; t: string };
type Cat = { id: string; h: string; items: QA[] };

const CATS: Cat[] = [
  { id: "passenger", h: "Passenger app", items: [
    { q: "What can passengers do in the app?", t: "", a: <>Typically they set a pickup and destination, see a fare estimate and arrival time, book now or later, follow the driver on a map and pay. The exact list is agreed in scope; the flow is shown on our <Link to={ROUTES.booking}>taxi booking app page</Link>.</> },
    { q: "Do passengers need an account to book?", t: "", a: <>That is a choice. Accounts give ride history and saved places; a guest option lowers the barrier for one-off bookings. We recommend deciding it with your customers in mind.</> },
    { q: "Can the passenger app work in more than one language?", t: "", a: <>Yes, languages and currency can be configured. Each extra language adds translation and testing, which is one of the factors in the <Link to={ROUTES.cost}>cost guide</Link>.</> },
  ] },
  { id: "driver", h: "Driver app", items: [
    { q: "How do drivers receive and accept jobs?", t: "", a: <>Drivers go online, receive a request with the pickup and fare, and accept or decline. Depending on your dispatch rules, jobs can also be assigned directly by a dispatcher.</> },
    { q: "Can drivers upload their documents in the app?", t: "", a: <>Yes. Driver and vehicle documents can be uploaded for review in the admin dashboard, with expiry reminders so records stay current.</> },
    { q: "What happens if a driver loses their connection?", t: "", a: <>Live features need a data connection. How the apps behave when the connection drops, for example how long a job is held, is something we define and test with you.</> },
  ] },
  { id: "admin", h: "Admin dashboard and dispatch", items: [
    { q: "What can an admin see and control?", t: "", a: <>Bookings, drivers, vehicles, fares and reports, with a live map. Which people can see or change what is controlled by roles.</> },
    { q: "Can I use my own drivers and independent drivers together?", t: "", a: <>Yes. A dispatcher can assign jobs to in-house drivers or to outside drivers, which suits operators who add partners at busy times. The operator side is covered in <Link to={ROUTES.dispatch}>taxi dispatch software</Link>.</> },
    { q: "Do I need dispatch software or a booking app?", t: "", a: <>Many businesses need both: a booking app for customers and dispatch tools for the people running the fleet. They are two sides of one platform, and you can start with one and add the other.</> },
  ] },
  { id: "approach", h: "Custom and white label", items: [
    { q: "How do I choose between custom and white label?", t: "", a: <>Choose white label if your needs are standard and speed matters; choose custom if your pricing, dispatch or integrations set you apart. Both are explained on the <Link to={ROUTES.whiteLabel}>white label</Link> and <Link to={ROUTES.custom}>custom</Link> pages.</> },
    { q: "Can I start white label and move to custom later?", t: "", a: <>Often, yes, and many businesses do. The move is easiest when ownership of your data and accounts was agreed at the start, so ask about it before you commit.</> },
    { q: "Can you build an Uber-like app?", t: "", a: <>We build ride-hailing platforms with the same kind of marketplace model, under your own brand. See <Link to={ROUTES.uber}>Uber-like app development</Link> for what that involves.</> },
  ] },
  { id: "integrations", h: "Integrations", items: [
    { q: "Which services can the platform connect to?", t: "", a: <>Common ones are maps and routing, payment gateways and SMS or WhatsApp messaging. Your own systems can be connected where they offer a way to integrate.</> },
    { q: "Who pays for maps, SMS and payment fees?", t: "", a: <>Those are charged by their providers based on usage, and are separate from development. Plan for them in your running costs.</> },
  ] },
  { id: "support", h: "Maintenance and support", items: [
    { q: "What does maintenance cover?", t: "", a: <>Typically fixes, operating system and app store updates, monitoring and a plan for new features. What is included is agreed in writing, separately from the build.</> },
    { q: "Can you take over or improve an existing taxi app?", t: "", a: <>Often. We start with a review of the code and the problems, then recommend fixing, extending or rebuilding parts of it. Our <Link to={ROUTES.services}>services page</Link> lists how we work on each part.</> },
  ] },
  { id: "cost", h: "Cost and getting started", items: [
    { q: "Why don't you publish prices?", t: "", a: <>Cost follows scope, and two taxi businesses rarely need the same thing, so a number without your requirements would mislead you. The <Link to={ROUTES.cost}>cost guide</Link> shows what moves it and lets you size your scope.</> },
    { q: "How can I reduce the cost of my taxi app?", t: "", a: <>Keep the first release to must-have features, launch in one area, and start from a ready product where your needs are standard.</> },
    { q: "How do I get started?", t: "", a: <>Send a short description of your business through the <Link to={ROUTES.contact}>contact page</Link>. We reply with questions and a suggested scope.</> },
  ] },
];

function Body() {
  const { ask } = useShell();
  // FAQ structured data uses plain-text versions of the answers.
  const plain: [string, string][] = CATS.flatMap((c) => c.items.map((i) => [i.q, i.t || textOf(i.a)] as [string, string]));
  useSeo({ title: TITLE, description: DESC, path: ROUTES.faq, ld: [crumbLd(CRUMBS), faqLd(plain)] });
  const [term, setTerm] = useState("");
  const texts = useMemo(() => new Map(plain.map(([q, a]) => [q, `${q} ${a}`.toLowerCase()])), []);
  const t = term.trim().toLowerCase();
  const shown = CATS.map((c) => ({ ...c, items: t ? c.items.filter((i) => texts.get(i.q)!.includes(t)) : c.items })).filter((c) => c.items.length);
  const count = shown.reduce((n, c) => n + c.items.length, 0);
  return (
    <>
      <section className="docs-hero" id="top">
        <div className="wrap">
          <Crumbs items={CRUMBS} />
          <h1>Taxi App Development FAQ</h1>
          <p className="sub">Quick answers on passenger and driver apps, dispatch, custom and white label builds, integrations, support and cost. For depth, follow the links to the dedicated pages.</p>
          <div className="faq-search">
            <label htmlFor="faq-q" className="sr">Search the FAQ</label>
            <input id="faq-q" type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search questions, e.g. payment, driver, cost" autoComplete="off" />
            <p role="status" aria-live="polite" className="faq-count">{t ? `${count} ${count === 1 ? "answer" : "answers"} found` : `${plain.length} questions`}</p>
          </div>
        </div>
      </section>
      <section className="sec sec-white">
        <div className="wrap faq-layout">
          <nav className="faq-side" aria-label="FAQ topics">
            <p>Topics</p>
            <ul>{CATS.map((c) => <li key={c.id}><a href={`#${c.id}`} onClick={(e) => { e.preventDefault(); go(c.id); }}>{c.h}<span>{c.items.length}</span></a></li>)}</ul>
          </nav>
          <div className="faqs">
            {shown.map((c) => (
              <section key={c.id} id={c.id} aria-labelledby={`${c.id}-h`}>
                <h2 id={`${c.id}-h`}>{c.h}</h2>
                {c.items.map((i) => <details key={i.q} className="qa" open={t ? true : undefined}><summary>{i.q}</summary><div>{i.a}</div></details>)}
              </section>
            ))}
            {!count && <p className="faq-empty">No answers match “{term}”. Try a shorter word, or <button type="button" className="link" onClick={() => ask("Ask us a question", { kind: "Not sure yet" })}>ask us directly</button>.</p>}
          </div>
        </div>
      </section>
      <FinalCta title="Still Have a Question?" text="Ask us about your project. We reply with a clear next step." startLabel="Ask a Question" consultLabel="Request a Consultation" onStart={() => ask("Ask us a question", { kind: "Not sure yet" })} onConsult={() => ask("Request a consultation", { kind: "Not sure yet" })} />
    </>
  );
}

/** Flatten a React node of strings and elements into plain text. */
function textOf(n: ReactNode): string {
  if (n == null || typeof n === "boolean") return "";
  if (typeof n === "string" || typeof n === "number") return String(n);
  if (Array.isArray(n)) return n.map(textOf).join("");
  const props = (n as { props?: { children?: ReactNode } }).props;
  return textOf(props?.children);
}

export default function Faq() {
  return <Shell testId="page-tad-faq"><Body /></Shell>;
}
