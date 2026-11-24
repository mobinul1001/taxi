import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Car, Compass, Plane, Users, Zap } from "lucide-react";
import { Crumbs, crumbLd, faqLd, serviceLd, useSeo } from "./seo";
import { Faq, FinalCta, Pic, Shell, go, useShell } from "./shell";
import { ROUTES } from "./routes";

const TITLE = "Taxi App Development Solutions for Every Taxi Business";
const DESC = "Taxi app development solutions by business model, operation and fleet size: taxi companies, ride-hailing, airport transfers, corporate and chauffeur services.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Taxi App Solutions", to: ROUTES.solutions }];

const FAQS: [string, string][] = [
  ["What are taxi app development solutions?", "They are ready combinations of apps and modules for a particular kind of taxi business: for example a passenger app, driver app and dispatch dashboard for a taxi company, or a two-sided marketplace for a ride-hailing start-up. The aim is to start from the setup that fits your operation instead of from a blank page."],
  ["How do I know which solution fits my business?", "Start with your business model and how many vehicles you run. The solution finder on this page turns those answers into a suggested set of apps, modules and approach. We then confirm it with you, because the details of your pricing and dispatch rules matter more than the label."],
  ["Is a solution the same as white label?", "No. A solution describes what the platform does for your business. White label, custom and hybrid describe how it is built. A taxi company solution can be delivered white label, as a custom build or a mix."],
  ["Can the solution grow as my fleet grows?", "It should. We plan the first release for your current fleet and structure the backend so more drivers, vehicle types and areas can be added later without starting again."],
  ["Do you offer solutions for airport transfers and corporate travel?", "Yes. These need fixed prices, scheduled bookings and, for corporate travel, business accounts and invoicing. They are covered in the business model cards below."],
  ["What is the difference between a solution and a service?", "A solution is shaped around a type of business. A service is a piece of work, such as design or backend development. Our services page lists those pieces and what you receive from each."],
  ["How do I get a proposal for my taxi business?", "Use the contact page to describe your business, fleet and city. We reply with questions and a proposed solution and scope."],
];

const BIZ = [
  { id: "taxi", t: "Taxi company", sub: "Fleet with its own drivers", I: Car, need: "Take bookings from several channels and keep drivers busy.", sol: "Passenger app, driver app and a dispatch console with manual and automatic assignment.", mods: ["Booking", "Dispatch", "Driver app", "Payments"], link: ROUTES.dispatch, label: "Taxi dispatch software" },
  { id: "ride", t: "Ride-hailing marketplace", sub: "Riders and independent drivers", I: Zap, need: "Match riders and drivers in real time and grow both sides.", sol: "A two-sided platform with live matching, ratings, driver onboarding and earnings.", mods: ["Live matching", "Ratings", "Onboarding", "Earnings"], link: ROUTES.uber, label: "Uber-like app development" },
  { id: "airport", t: "Airport transfer operator", sub: "Fixed routes and scheduled trips", I: Plane, need: "Fixed prices, flight-aware scheduling and reliable pickups.", sol: "Scheduled bookings, zone and fixed pricing, and driver reminders for pickups.", mods: ["Scheduling", "Fixed prices", "Reminders", "Payments"], link: ROUTES.booking, label: "Taxi booking app development" },
  { id: "corp", t: "Corporate transport", sub: "Company accounts and staff travel", I: Briefcase, need: "Business accounts, approvals and clear invoicing.", sol: "Corporate booking portal, account billing, trip reports and rule-based approvals.", mods: ["Business accounts", "Invoicing", "Reports", "Approvals"], link: ROUTES.custom, label: "Custom taxi app development" },
  { id: "chauf", t: "Chauffeur and limousine", sub: "Premium, booked in advance", I: Users, need: "Premium vehicles, pre-booked rides and a polished brand.", sol: "Branded apps, vehicle classes, advance booking and driver profiles.", mods: ["Branding", "Vehicle classes", "Advance booking", "Profiles"], link: ROUTES.whiteLabel, label: "White label taxi app" },
  { id: "tour", t: "Tour and island transport", sub: "Tours, transfers and round trips", I: Compass, need: "Sell tours, round trips and transfers under one booking flow.", sol: "Tour and round-trip booking, quotes, driver job details and a dispatch view.", mods: ["Tour booking", "Quotes", "Round trips", "Dispatch"], link: ROUTES.custom, label: "Custom taxi app development" },
] as const;

const FLEET = [
  { id: "start", t: "Just starting", sub: "A few vehicles or none yet" },
  { id: "small", t: "Small fleet", sub: "You know your drivers" },
  { id: "grow", t: "Growing fleet", sub: "More drivers and areas" },
  { id: "large", t: "Large or multi-city", sub: "Several teams and areas" },
] as const;

const FLEET_SOL: Record<string, { approach: string; why: string; dispatch: string; extra: string[] }> = {
  start: { approach: "White label first", why: "Launch quickly under your brand, learn from real trips, then decide what to customise.", dispatch: "Manual dispatch from the admin panel", extra: ["One service area", "Standard pricing"] },
  small: { approach: "White label with a few custom parts", why: "Keep the proven base and add the pricing or booking rules that set you apart.", dispatch: "Manual with nearest-driver suggestions", extra: ["Driver records", "Basic reports"] },
  grow: { approach: "Custom core on a staged roadmap", why: "More drivers and areas need rules the standard product may not cover.", dispatch: "Automatic assignment with manual override", extra: ["Zones and surcharges", "Dispatcher roles"] },
  large: { approach: "Custom platform in stages", why: "Several teams and areas call for roles, reporting and integrations designed up front.", dispatch: "Zone queues and automatic dispatch rules", extra: ["Role-based access", "Integrations", "Detailed analytics"] },
};

const NEEDS: [string, string, string, string, string?][] = [
  ["Taking bookings", "Booking flow with fare estimate and scheduling", "Passenger app and web", "Taxi booking app development", ROUTES.booking],
  ["Assigning drivers", "Manual, nearest-driver and zone-queue dispatch", "Admin dashboard and driver app", "Taxi dispatch software", ROUTES.dispatch],
  ["Managing drivers and vehicles", "Records, document checks, availability and shifts", "Admin dashboard", "Taxi dispatch software", ROUTES.dispatch],
  ["Getting paid", "Payment gateway, wallets, promo codes and payouts", "All apps and backend", "Taxi app development cost", ROUTES.cost],
  ["Tracking trips", "Live location, arrival times and trip history", "Passenger and driver apps", "Taxi booking app development", ROUTES.booking],
  ["Running several areas", "Zones, area pricing and separate driver pools", "Backend and admin", "Custom taxi app development", ROUTES.custom],
  ["Branding the product", "Your name, colours and store listings", "All apps", "White label taxi app", ROUTES.whiteLabel],
  ["Seeing how the business performs", "Trips, acceptance, cancellations and revenue reports", "Admin dashboard", "Taxi app development services", ROUTES.services],
];

const PATH: [string, string[]][] = [
  ["Starting out", ["Manual dispatch", "One city", "One admin", "Standard pricing"]],
  ["Small fleet", ["Nearest-driver suggestions", "Driver records", "Scheduled rides", "Basic reports"]],
  ["Growing fleet", ["Automatic assignment", "Zones and surcharges", "Dispatcher roles", "Promo codes"]],
  ["Multi-city", ["Area-specific pricing", "Role-based access", "Integrations", "Detailed analytics"]],
];

function Finder() {
  const { ask } = useShell();
  const [b, setB] = useState<string>("taxi");
  const [f, setF] = useState<string>("small");
  const biz = BIZ.find((x) => x.id === b)!;
  const fl = FLEET_SOL[f];
  const apps = b === "corp" ? ["Passenger app", "Driver app", "Admin dashboard", "Corporate portal"] : ["Passenger app", "Driver app", "Admin dashboard"];
  const notes = `Business: ${biz.t}. Fleet: ${FLEET.find((x) => x.id === f)!.t}. Suggested: ${apps.join(", ")}; ${biz.mods.join(", ")}; ${fl.approach}; ${fl.dispatch}.`;
  return (
    <div className="fnd" id="finder">
      <div>
        <fieldset><legend>What kind of taxi business is it?</legend>
          <div className="pills">
            {BIZ.map((x) => <label key={x.id} className="chs"><input type="radio" name="biz" checked={b === x.id} onChange={() => setB(x.id)} /><span>{x.t}</span></label>)}
          </div>
        </fieldset>
        <fieldset><legend>How big is your fleet?</legend>
          <div className="pills">
            {FLEET.map((x) => <label key={x.id} className="chs"><input type="radio" name="fleet" checked={f === x.id} onChange={() => setF(x.id)} /><span>{x.t}<small>{x.sub}</small></span></label>)}
          </div>
        </fieldset>
      </div>
      <aside className="res" aria-labelledby="fnd-h">
        <h3 id="fnd-h">Suggested solution</h3>
        <div role="status" aria-live="polite" style={{ display: "grid", gap: 14 }}>
          <p className="big">{biz.t}, {FLEET.find((x) => x.id === f)!.t.toLowerCase()}</p>
          <div><h4>Apps</h4><div className="chips">{apps.map((a) => <span key={a}>{a}</span>)}</div></div>
          <div><h4>Core modules</h4><div className="chips">{[...biz.mods, ...fl.extra.filter((e) => !biz.mods.some((m) => m.toLowerCase().split(" ").pop() === e.toLowerCase().split(" ").pop()))].map((a) => <span key={a}>{a}</span>)}</div></div>
          <div><h4>Suggested approach</h4><p><b style={{ color: "#fff" }}>{fl.approach}.</b> {fl.why}</p></div>
          <div><h4>Dispatch</h4><p>{fl.dispatch}</p></div>
        </div>
        <Link className="link" to={biz.link}>{biz.label} <ArrowRight size={16} /></Link>
        <button type="button" className="btn btn-primary" onClick={() => ask("Discuss my taxi app solution", { kind: f === "start" ? "White label taxi app" : "Custom taxi app", notes })}>Discuss this solution</button>
        <p style={{ fontSize: 13, color: "var(--on-navy-mute)" }}>A starting point to talk through, not a final recommendation.</p>
      </aside>
    </div>
  );
}

function Body() {
  const { ask } = useShell();
  useSeo({ title: TITLE, description: DESC, path: ROUTES.solutions, ld: [crumbLd(CRUMBS), serviceLd("Taxi app development solutions", DESC, ROUTES.solutions, "Taxi app development solutions"), faqLd(FAQS)] });
  const start = () => ask("Plan my taxi app solution", { kind: "Not sure yet" });
  const pick = (id: string) => { go("finder"); void id; };
  return (
    <>
      <section className="hero hero-b" id="top">
        <div className="wrap">
          <Crumbs items={CRUMBS} dark />
          <div className="grid2">
            <div>
              <p className="eyebrow light">Taxi app solutions</p>
              <h1>Taxi App Development Solutions for <em>Every Kind of Taxi Business</em></h1>
              <p className="sub">A taxi company, a ride-hailing start-up and an airport transfer operator do not need the same platform. Choose the solution that matches how you earn, how you dispatch and how many vehicles you run.</p>
              <div className="hero-btns">
                <button type="button" className="btn btn-primary" onClick={() => go("finder")}>Find Your Solution</button>
                <button type="button" className="btn btn-ghost-dark" onClick={start}>Talk to Us</button>
              </div>
            </div>
            <Pic label="Six taxi business types: taxi company, ride-hailing, airport transfer, corporate, chauffeur and tour transport" className="tiles-wrap">
              <div className="tiles6">
                {BIZ.map((x) => <button key={x.id} type="button" onClick={() => pick(x.id)}><span className="ic" aria-hidden><x.I size={18} /></span>{x.t}<small>{x.sub}</small></button>)}
              </div>
            </Pic>
          </div>
        </div>
      </section>

      <section className="sec sec-white" id="finder-sec" aria-labelledby="h-fnd">
        <div className="wrap">
          <p className="eyebrow">Solution finder</p>
          <h2 className="h2 wide" id="h-fnd">Which taxi app solution fits your business?</h2>
          <p className="lede">Pick your business type and fleet size. You get the apps, modules and build approach we would start the conversation with.</p>
          <Finder />
        </div>
      </section>

      <section className="sec sec-gray" id="models" aria-labelledby="h-biz">
        <div className="wrap">
          <p className="eyebrow">Solutions by business model</p>
          <h2 className="h2 wide" id="h-biz">Six taxi businesses, six different platforms</h2>
          <ul className="biz">{BIZ.map((x) => (
            <li key={x.id}><span className="av" aria-hidden style={{ width: 40, height: 40, borderRadius: 12, background: "#eaf0ff", color: "var(--blue)", display: "grid", placeItems: "center" }}><x.I size={19} /></span>
              <h3>{x.t}</h3><div><b>What they need</b><p>{x.need}</p></div><div><b>The solution</b><p>{x.sol}</p></div>
              <div className="chips lt">{x.mods.map((m) => <span key={m}>{m}</span>)}</div>
              <Link className="link" to={x.link}>{x.label} <ArrowRight size={16} /></Link></li>
          ))}</ul>
        </div>
      </section>

      <section className="sec sec-white" id="needs" aria-labelledby="h-need">
        <div className="wrap">
          <p className="eyebrow">Solutions by operational need</p>
          <h2 className="h2 wide" id="h-need">What each part of your operation needs from the platform</h2>
          <table className="tbl">
            <caption className="sr">Operational needs of a taxi business and the solution for each</caption>
            <thead><tr><th scope="col">Operational need</th><th scope="col">The solution</th><th scope="col">Where it lives</th><th scope="col">Read more</th></tr></thead>
            <tbody>{NEEDS.map(([a, b, c, d, to]) => <tr key={a}><th scope="row">{a}</th><td data-label="The solution">{b}</td><td data-label="Where it lives">{c}</td><td data-label="Read more"><Link className="ref" to={to!}>{d}</Link></td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="sec sec-navy on-navy" id="fleet" aria-labelledby="h-fl">
        <div className="wrap">
          <p className="eyebrow">Fleet requirements</p>
          <h2 className="h2 wide" id="h-fl">How the solution changes as your fleet grows</h2>
          <p className="lede" style={{ color: "var(--on-navy)" }}>You do not need the final system on day one. This is the path most taxi businesses follow, and why we design the first release so it can grow into the next.</p>
          <Pic label="Four stages of fleet growth and the modules added at each stage" className="archx">
            {PATH.map(([h, m], i) => <div key={h} className={`lay${i % 2 ? " mid" : ""}`}><b>{h}<small>Stage {i + 1}</small></b><ul>{m.map((x) => <li key={x}>{x}</li>)}</ul></div>)}
          </Pic>
          <div className="more"><Link className="link" to={ROUTES.dispatch}>See taxi dispatch software <ArrowRight size={16} /></Link><Link className="link" to={ROUTES.custom}>Plan a custom solution <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section className="sec sec-gray" id="deeper" aria-labelledby="h-dp">
        <div className="wrap">
          <p className="eyebrow">Go deeper</p>
          <h2 className="h2 wide" id="h-dp">From solution to a plan you can budget</h2>
          <ul className="xplore">
            {([["What you get", "Taxi app development services", "Every service, with the deliverable that comes from it.", ROUTES.services], ["What it costs", "Taxi app development cost", "What drives the budget and a tool to size your scope.", ROUTES.cost], ["Who builds it", "Taxi app developers", "The team roles and how we work together.", ROUTES.developers], ["How to build it", "Taxi app development", "Apps, backend and the ways to build.", ROUTES.dev]] as [string, string, string, string][]).map(([q, h, p, to]) => <li key={h}><span className="q">{q}</span><h3>{h}</h3><p>{p}</p><Link className="link" to={to}>Read more <ArrowRight size={16} /><span className="sr"> about {h.toLowerCase()}</span></Link></li>)}
          </ul>
        </div>
      </section>

      <Faq items={FAQS} onAsk={() => ask("Ask us a question", { kind: "Not sure yet" })} heading="Taxi app solutions questions, answered" />
      <FinalCta title="Tell Us About Your Taxi Business" text="Describe your business, fleet and city. We will suggest a solution and a first release to plan around." startLabel="Plan My Solution" consultLabel="Request a Consultation" onStart={start} onConsult={() => ask("Request a consultation", { kind: "Not sure yet" })} />
    </>
  );
}

export default function TaxiAppSolutions() {
  return <Shell testId="page-tad-solutions"><Body /></Shell>;
}
