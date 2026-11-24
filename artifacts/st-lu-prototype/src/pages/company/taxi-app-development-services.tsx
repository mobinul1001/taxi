import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ClipboardList, Cloud, LayoutDashboard, LifeBuoy, PenTool, Smartphone } from "lucide-react";
import { AdminDash, PassengerScreen, DriverScreen, Phone, Scaled } from "./mockups";
import { Crumbs, crumbLd, faqLd, serviceLd, useSeo } from "./seo";
import { Faq, FinalCta, Pic, Shell, Tick, go, useShell } from "./shell";
import { ROUTES } from "./routes";
import { Related } from "./related";

const TITLE = "Taxi App Development Services: Scope, Process & Support";
const DESC = "Taxi app development services: discovery, design, apps, dispatch dashboard, backend, launch and support, with the scope, process and deliverables at each stage.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Taxi App Development", to: ROUTES.dev }, { name: "Taxi App Development Services", to: ROUTES.services }];

const FAQS: [string, string][] = [
  ["What do taxi app development services include?", "Usually discovery and scoping, UI/UX design, passenger and driver app development, an admin and dispatch dashboard, backend and integrations, testing, launch support and ongoing maintenance. You can buy the whole chain or only the parts you need."],
  ["Can I hire you for only part of the work, such as design or the backend?", "Yes. If you already have a designer or an app that needs a better backend, we can take just that piece. We review what exists first so the new work fits with it."],
  ["Do you build for both iOS and Android?", "Yes. The passenger and driver apps are delivered for both platforms. Whether we use native or cross-platform tooling is decided during scoping, based on your features and budget."],
  ["What will I own at the end of the project?", "That is agreed in writing before work starts. As a rule, you should expect to own your brand, your data and the developer accounts the apps are published under. Ask every provider, including us, to put source code and licence terms in the contract."],
  ["Can you improve or take over a taxi app that already exists?", "Often, yes. We start with a review of the code, the architecture and the open problems, then tell you whether fixing it, extending it or rebuilding part of it makes more sense."],
  ["What happens after the app is live?", "Most operators keep a maintenance and support arrangement: operating system and store updates, monitoring, fixes and the next set of features. It is planned separately from the build so you can see what each costs."],
  ["How do I get started?", "Send us a short description of your business, your city and the apps you need. We reply with questions, a proposed scope and the next step. If you want to understand budget first, read our guide to taxi app development cost."],
];

type Svc = { id: string; t: string; I: (p: { size?: number }) => ReactNode; d: string; does: string[]; gets: string[]; vis: "phones" | "admin" | "arch" | "doc" };
const SVCS: Svc[] = [
  { id: "discovery", t: "Discovery and scoping", I: ClipboardList, d: "Before any design or code, we work out who the product is for, what the first release must do and what can wait. This is where most budget surprises are removed.", does: ["Workshops on your operation, drivers and market", "Feature list sorted into must-have and later", "Choice of white label, custom or a mix", "Technical approach and integration plan"], gets: ["Written scope and feature list", "Release plan and milestones", "Risks and open questions list"], vis: "doc" },
  { id: "design", t: "UI/UX design", I: PenTool, d: "Flows and screens for the three people who use a taxi platform: the passenger, the driver and the dispatcher. We test them with you before development starts.", does: ["User flows for booking, accepting and dispatching", "Clickable prototype reviewed with you", "Branded visual design and component library", "Accessibility and small-screen checks"], gets: ["Approved screens for all apps", "Prototype to try on a phone", "Design files ready for development"], vis: "phones" },
  { id: "apps", t: "Passenger and driver apps", I: Smartphone, d: "The two mobile apps that carry the trip: booking, fare estimates, live tracking and payment on one side, requests, navigation and earnings on the other.", does: ["iOS and Android builds of both apps", "Live location, push notifications and in-app status", "Payments, ratings and ride history", "Store listings and submission support"], gets: ["Tested passenger and driver apps", "Builds in your developer accounts", "Release notes and handover"], vis: "phones" },
  { id: "admin", t: "Admin and dispatch dashboard", I: LayoutDashboard, d: "The control room for your business: bookings, drivers, vehicles, fares and reports, with manual and automatic dispatch where you want it.", does: ["Live map of drivers and jobs", "Manual and automatic driver assignment", "Fare, zone and promo code settings", "Driver onboarding and document checks"], gets: ["Web dashboard with role-based access", "Reports on trips, drivers and revenue", "Admin guide for your team"], vis: "admin" },
  { id: "backend", t: "Backend and integrations", I: Cloud, d: "The part nobody sees: matching, pricing, payments and notifications, wired to the maps, payment gateway and messaging services you choose.", does: ["API behind the apps and dashboard", "Matching, fare and trip-state logic", "Maps, payment and SMS or WhatsApp integrations", "Security, backups and monitoring setup"], gets: ["Documented API and architecture", "Staging and production environments", "Integration test results"], vis: "arch" },
  { id: "launch", t: "Testing, launch and support", I: LifeBuoy, d: "Checks across devices and roles, a controlled launch, then support while your first real trips run and the product settles in.", does: ["Test cases for trips, cancellations and failed payments", "Device and operating system checks", "Go-live plan and store submission", "Maintenance and feature roadmap"], gets: ["QA report and fixed issue list", "Live apps in your name", "Support arrangement in writing"], vis: "doc" },
];

const LEDGER: [string, string][] = [["Scope and release plan", "Discovery"], ["Approved screens and prototype", "Design"], ["Passenger and driver apps", "iOS and Android"], ["Admin and dispatch dashboard", "Web"], ["API, integrations and hosting", "Backend"], ["Test report and live release", "Launch"]];

const NEEDS: [string, string, string, string][] = [
  ["Launching a new taxi business", "You want bookings under your brand quickly, then to learn from real trips.", "White label taxi app", ROUTES.whiteLabel],
  ["Going digital with a fleet", "You already have drivers and customers and need booking, dispatch and tracking.", "Taxi dispatch software", ROUTES.dispatch],
  ["Starting a ride-hailing marketplace", "You are building both sides: riders and drivers, across a city or region.", "Uber-like app development", ROUTES.uber],
  ["Needing your own rules", "Your pricing, dispatch or systems are different from the usual.", "Custom taxi app development", ROUTES.custom],
];

const STAGES: [string, string, string][] = [
  ["Discovery", "Workshops, feature list, technical approach", "Scope document and release plan"],
  ["Design", "Flows, prototype, visual design", "Approved screens and design files"],
  ["Build", "Apps, dashboard, backend and integrations", "Working builds on a staging environment"],
  ["Test", "Device, role and trip-scenario testing", "QA report and fixes"],
  ["Launch", "Store submission, go-live, onboarding", "Live apps in your accounts"],
  ["Support", "Updates, monitoring, new features", "Maintenance plan and roadmap"],
];

function Visual({ v }: { v: Svc["vis"] }) {
  if (v === "phones") return <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "flex-end", overflow: "hidden", paddingTop: 8 }}><Scaled w={200} h={410}><Phone><PassengerScreen /></Phone></Scaled><Scaled w={200} h={410}><Phone><DriverScreen /></Phone></Scaled></div>;
  if (v === "admin") return <Scaled w={560} h={334}><AdminDash /></Scaled>;
  if (v === "arch") return <div className="backend" style={{ paddingBottom: 0 }}>{["Matching", "Pricing", "Payments", "Notifications", "Maps", "Reports"].map((x) => <span key={x}><Check size={16} aria-hidden />{x}</span>)}</div>;
  return <ul className="backend" style={{ paddingBottom: 0 }}>{["Scope", "Release plan", "Risks", "Sign-off"].map((x) => <li key={x}><span><Check size={16} aria-hidden />{x}</span></li>)}</ul>;
}

function Explorer() {
  const [i, setI] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const s = SVCS[i];
  const key = (e: KeyboardEvent, n: number) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (n + d + SVCS.length) % SVCS.length;
    setI(next); refs.current[next]?.focus();
  };
  return (
    <div className="svx">
      <div className="svx-tabs" role="tablist" aria-label="Taxi app development services" aria-orientation="vertical">
        {SVCS.map((x, n) => (
          <button key={x.id} ref={(el) => { refs.current[n] = el; }} type="button" role="tab" id={`svt-${x.id}`} aria-selected={n === i} aria-controls="svp" tabIndex={n === i ? 0 : -1} onClick={() => setI(n)} onKeyDown={(e) => key(e, n)}>
            <span className="i" aria-hidden><x.I size={17} /></span>{x.t}
          </button>
        ))}
      </div>
      <div className="svp" id="svp" role="tabpanel" aria-labelledby={`svt-${s.id}`} tabIndex={0}>
        <div><h3>{s.t}</h3><p className="d">{s.d}</p></div>
        <div className="two"><div><h4>What we do</h4><Tick items={s.does} /></div><div><h4>What you receive</h4><Tick items={s.gets} /></div></div>
        <Pic label={`Illustration for ${s.t.toLowerCase()}. Decorative.`} style={{ background: "linear-gradient(180deg,#eef2fb,#e4ebfa)", borderRadius: 14, padding: 18, maxHeight: 300, overflow: "hidden" }}><Visual v={s.vis} /></Pic>
      </div>
    </div>
  );
}

function Body() {
  const { ask } = useShell();
  useSeo({ title: TITLE, description: DESC, path: ROUTES.services, ld: [crumbLd(CRUMBS), serviceLd("Taxi app development services", DESC, ROUTES.services, "Taxi app development services"), faqLd(FAQS)] });
  const start = () => ask("Plan my taxi app services", { kind: "Not sure yet" });
  return (
    <>
      <section className="hero hero-l hero-svc" id="top">
        <div className="wrap">
          <Crumbs items={CRUMBS} />
          <div className="grid2">
            <div>
              <p className="eyebrow">Taxi app development services</p>
              <h1>Taxi App Development Services, <em>From First Idea to Live Platform</em></h1>
              <p className="sub">Everything needed to launch and run a taxi or ride-hailing business: scoping, design, passenger and driver apps, a dispatch dashboard, backend, launch and support. Buy the whole chain or the part you are missing.</p>
              <div className="hero-btns">
                <button type="button" className="btn btn-primary" onClick={start}>Plan Your Project</button>
                <button type="button" className="btn btn-outline" onClick={() => go("explorer")}>Explore the Services</button>
              </div>
            </div>
            <Pic label="Checklist of six taxi app development deliverables: scope, design, apps, dashboard, backend and launch" className="ledger-wrap">
              <div className="ledger">
                <h2>What you receive</h2>
                <ul>{LEDGER.map(([a, b], n) => <li key={a}><span className="n">{n + 1}</span><span><b>{a}</b><small>{b}</small></span><Check className="ok" size={18} aria-hidden /></li>)}</ul>
              </div>
            </Pic>
          </div>
        </div>
      </section>

      <section className="sec sec-white" id="explorer" aria-labelledby="h-ex">
        <div className="wrap">
          <p className="eyebrow">The service catalogue</p>
          <h2 className="h2 wide" id="h-ex">Six services, each with a clear deliverable</h2>
          <p className="lede">Pick a service to see what we do and what lands in your hands. Every item below is something you can review, test or own.</p>
          <Explorer />
        </div>
      </section>

      <section className="sec sec-gray" id="needs" aria-labelledby="h-need">
        <div className="wrap">
          <p className="eyebrow">Services by situation</p>
          <h2 className="h2 wide" id="h-need">Which service mix fits your business?</h2>
          <ul className="need4">{NEEDS.map(([h, p, l, to]) => <li key={h}><h3>{h}</h3><p>{p}</p><Link className="link" to={to}>{l} <ArrowRight size={16} /></Link></li>)}</ul>
        </div>
      </section>

      <section className="sec sec-white" id="stages" aria-labelledby="h-st">
        <div className="wrap">
          <p className="eyebrow">Stage by stage</p>
          <h2 className="h2 wide" id="h-st">What happens, and what you get, at every stage</h2>
          <table className="tbl">
            <caption className="sr">Development stages with activities and deliverables</caption>
            <thead><tr><th scope="col">Stage</th><th scope="col">What we do</th><th scope="col">What you receive</th></tr></thead>
            <tbody>{STAGES.map(([a, b, c]) => <tr key={a}><th scope="row">{a}</th><td data-label="What we do">{b}</td><td data-label="What you receive">{c}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="sec sec-navy on-navy" id="architecture" aria-labelledby="h-ar">
        <div className="wrap">
          <p className="eyebrow">Under the hood</p>
          <h2 className="h2 wide" id="h-ar">What our taxi app development services put in place</h2>
          <p className="lede" style={{ color: "var(--on-navy)" }}>A taxi platform is more than two apps. This is the architecture the services above build, from what users touch to the data underneath.</p>
          <Pic label="Layered architecture: apps, dashboard, API, matching and pricing services, data and third-party integrations" className="archx">
            <div className="lay"><b>Apps<small>What people use</small></b><ul><li>Passenger app</li><li>Driver app</li><li>Admin dashboard</li></ul></div>
            <div className="lay mid"><b>API<small>One entry point</small></b><ul><li>Accounts and roles</li><li>Booking and trip states</li><li>Live updates</li></ul></div>
            <div className="lay mid"><b>Core services<small>The business logic</small></b><ul><li>Driver matching</li><li>Fares and zones</li><li>Payments</li><li>Notifications</li></ul></div>
            <div className="lay data"><b>Data and partners<small>Stored and connected</small></b><ul><li>Trips and users</li><li>Maps provider</li><li>Payment gateway</li><li>SMS or WhatsApp</li></ul></div>
          </Pic>
        </div>
      </section>

      <section className="sec sec-gray" id="after" aria-labelledby="h-af">
        <div className="wrap">
          <p className="eyebrow">After launch</p>
          <h2 className="h2 wide" id="h-af">Support that keeps the platform healthy</h2>
          <div className="split2">
            <div><h3>Keep it running</h3><Tick items={["Operating system and store requirement updates", "Monitoring and bug fixes", "Backups and security patches", "Help for your dispatchers and drivers"]} /></div>
            <div><h3>Help it grow</h3><Tick items={["New features from a shared roadmap", "More cities, vehicle types and pricing rules", "Reports that show where to improve", "Moving from a first release to custom work"]} /></div>
          </div>
          <div className="more">
            <Link className="link" to={ROUTES.cost}>What drives taxi app development cost <ArrowRight size={16} /></Link>
            <Link className="link" to={ROUTES.developers}>Meet the taxi app developers <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <Faq items={FAQS} onAsk={() => ask("Ask us a question", { kind: "Not sure yet" })} heading="Taxi app development services questions, answered" />
      <Related page="services" />
      <FinalCta title="Tell Us Which Services You Need" text="Describe your business and what you have so far. We will propose a scope, and you decide the next step." startLabel="Plan Your Project" consultLabel="Request a Consultation" onStart={start} onConsult={() => ask("Request a consultation", { kind: "Not sure yet" })} />
    </>
  );
}

export default function TaxiAppDevelopmentServices() {
  return <Shell testId="page-tad-services"><Body /></Shell>;
}
