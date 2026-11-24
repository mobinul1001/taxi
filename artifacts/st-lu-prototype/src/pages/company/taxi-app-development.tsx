import { useState } from "react";
import { Ic } from "./sectionicons";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, CreditCard, LayoutDashboard, Map, Server, Navigation, Users, Wallet } from "lucide-react";
import { AdminDash, DriverScreen, PassengerScreen, Phone, Scaled } from "./mockups";
import { Crumbs, crumbLd, faqLd, serviceLd, useSeo } from "./seo";
import { Faq, FinalCta, Pic, Shell, Tick, go, useShell } from "./shell";
import { ROUTES } from "./routes";
import { Related } from "./related";
import { TechCards } from "./techcards";

const TITLE = "Taxi App Development: Passenger, Driver & Admin Apps";
const DESC = "What taxi app development involves: passenger, driver and admin apps, backend, costs and process. Plan your taxi or ride-hailing platform with our team.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Taxi App Development", to: ROUTES.dev }];

const FAQS: [string, string][] = [
  ["What is taxi app development?", "It is the design and engineering of the software a taxi or ride-hailing business runs on: a passenger app to request rides, a driver app to accept and complete them, an admin dashboard to run the operation, and a backend that connects the three with dispatch, pricing, payments and notifications."],
  ["What does a complete taxi app include?", "Most platforms have four parts: a passenger app, a driver app, an admin dashboard and a backend with its integrations (maps, payments, SMS or push). Smaller launches can start with the parts that matter most and add the rest later."],
  ["Which type of taxi app is right for my business?", "It depends on how you earn. A taxi company or fleet needs dispatch and driver management, an airport transfer or tour operator needs scheduled and fixed-price bookings, and a marketplace needs on-demand matching of independent drivers. The table on this page maps each model to the modules it usually needs."],
  ["How is a taxi app built, from first call to launch?", "We start with discovery to agree the scope, then design the flows, build the apps and backend, connect maps and payments, test with real trip scenarios, and support the store release and go-live."],
  ["What affects the cost and timeline of a taxi app?", "Mainly the number of apps, the feature list, the integrations you need, how custom your pricing and dispatch rules are, and how many cities or service areas you run. We give a quote and schedule after a short discovery, once the scope is clear."],
  ["Do I need both an iOS and an Android app?", "Most operators serve both, because passengers and drivers use both. Cross-platform tools such as Flutter or React Native can cover both with one codebase, and native development is available where it makes sense."],
  ["Can I start small and add features later?", "Yes. The platform is built in modular parts, so a focused first release can go live and features such as scheduling, promo codes or new payment methods can follow."],
];

type Tab = { k: string; label: string; h: string; d: string; pts: string[] };
const TABS: Tab[] = [
  { k: "passenger", label: "Passenger app", h: "The app your riders open", d: "Passengers set a pickup and destination, see the fare before they commit, follow the driver on the map and pay inside the app.", pts: ["Ride booking and scheduling", "Fare estimates", "Live driver tracking", "In-app payments", "Trip history and receipts"] },
  { k: "driver", label: "Driver app", h: "The app your drivers work from", d: "Drivers go online, receive ride requests, navigate to pickup and drop-off, and see what they have earned.", pts: ["Ride requests with accept or decline", "Navigation", "Availability status", "Earnings dashboard", "Trip management"] },
  { k: "admin", label: "Admin dashboard", h: "The control room for your operation", d: "Your team manages drivers and vehicles, watches live trips, sets prices and reads the numbers that run the business.", pts: ["Driver and vehicle management", "Ride monitoring", "Pricing management", "Analytics and reports", "Dispatch tools"] },
  { k: "backend", label: "Backend & integrations", h: "The engine that connects everything", d: "The backend matches rides, calculates fares, processes payments and sends notifications, and talks to the maps, payment and messaging services you choose.", pts: ["Dispatch and driver matching", "Fare and pricing rules", "Payment gateway integration", "Push notifications and SMS", "Maps and routing"] },
];
const BACKEND = [["Dispatch engine", Navigation], ["Fares and pricing", Wallet], ["Payments", CreditCard], ["Notifications", Bell], ["Maps and routing", Map], ["Accounts and roles", Users], ["Reports", LayoutDashboard], ["Data and APIs", Server]] as const;

const TYPES: [string, string, string, string][] = [
  ["Taxi company or fleet", "You own or manage vehicles and employ or contract drivers.", "Dispatch console, driver and vehicle management, fixed and metered fares, job history.", "Dispatch-first"],
  ["Airport transfer and tour operator", "Customers book ahead for fixed routes and day tours.", "Scheduled bookings, fixed-price routes, flight and pickup details, confirmations by SMS or WhatsApp.", "Booking-first"],
  ["Ride-hailing marketplace", "Independent drivers join your network and passengers request rides on demand.", "Real-time driver matching, driver onboarding and documents, ratings, commission and payouts.", "Matching-first"],
  ["Corporate and chauffeur service", "Business accounts book rides for staff and guests.", "Company accounts, ride approvals, invoicing and reports, vehicle classes.", "Account-first"],
];

const FACTORS: [string, string][] = [
  ["Number of apps", "A passenger app, a driver app and an admin dashboard are the usual set. Fewer apps in a first release means a faster launch."],
  ["Feature scope", "Scheduling, promo codes, ratings and multi-language each add design and engineering work. A clear must-have list keeps the first release focused."],
  ["Integrations", "Maps, payment gateways, SMS or WhatsApp, and any system you already use are connected during the backend phase."],
  ["Pricing and dispatch rules", "Metered fares are simpler than zones, fixed routes, surcharges and custom matching logic."],
  ["Cities and service areas", "One city is the simplest. Several areas with their own pricing and drivers need more structure in the backend."],
  ["Design depth", "A branded, tested interface takes more design time than a standard layout."],
  ["Ongoing support", "Store updates, monitoring and new features after launch are planned separately from the build."],
];

const STEPS: [string, string][] = [
  ["Discovery & Strategy", "We learn your market, vehicles, drivers and goals, then agree what the first release must do."],
  ["UI/UX Design", "Flows and screens for passengers, drivers and admins, reviewed with you before development."],
  ["App Development", "The passenger and driver apps, built for iOS and Android."],
  ["Backend & API Integration", "Dispatch, pricing, payments and maps connected to the apps and dashboard."],
  ["Testing & QA", "Checks across devices, roles and realistic trip scenarios, including failed payments and cancellations."],
  ["Launch & Support", "Store submission, go-live help and support while your first real trips run."],
];

function Anatomy() {
  const [tab, setTab] = useState("passenger");
  const t = TABS.find((x) => x.k === tab)!;
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = (i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length;
    setTab(TABS[n].k);
    document.getElementById(`tab-${TABS[n].k}`)?.focus();
  };
  return (
    <section className="sec sec-gray" id="anatomy" aria-labelledby="h-anat">
      <div className="wrap">
        <p className="eyebrow">What a taxi app includes</p>
        <h2 className="h2 wide" id="h-anat">Four parts that work as one taxi platform</h2>
        <p className="lede">Taxi app development is not one app. It is a connected system, and each part has a different user and a different job.</p>
        <div className="anat-tabs" role="tablist" aria-label="Parts of a taxi app">
          {TABS.map((x, i) => (
            <button key={x.k} id={`tab-${x.k}`} type="button" role="tab" className="tab" aria-selected={tab === x.k} aria-controls="anat-panel" tabIndex={tab === x.k ? 0 : -1} onClick={() => setTab(x.k)} onKeyDown={(e) => onKey(e, i)}>{x.label}</button>
          ))}
        </div>
        <div className="anat" id="anat-panel" role="tabpanel" aria-labelledby={`tab-${t.k}`}>
          <div><h3>{t.h}</h3><p className="d">{t.d}</p><Tick items={t.pts} /></div>
          <div className="vis2">
            {t.k === "passenger" && <Pic label="Passenger app screen: a route on the map and a choice of ride types" style={{ maxWidth: 220 }}><Scaled w={220} h={300}><div style={{ position: "absolute", top: 0 }}><Phone style={{ height: 520 }}><PassengerScreen /></Phone></div></Scaled></Pic>}
            {t.k === "driver" && <Pic label="Driver app screen: earnings for the day and an incoming ride request" style={{ maxWidth: 220 }}><Scaled w={220} h={300}><div style={{ position: "absolute", top: 0 }}><Phone style={{ height: 520 }}><DriverScreen /></Phone></div></Scaled></Pic>}
            {t.k === "admin" && <Pic label="Admin dashboard: drivers, active trips and bookings with a recent-activity chart" style={{ paddingTop: 10 }}><Scaled w={560} h={334}><AdminDash /></Scaled></Pic>}
            {t.k === "backend" && <ul className="backend" aria-label="Backend modules">{BACKEND.map(([n, I]) => <li key={n} style={{ display: "contents" }}><span><I size={17} aria-hidden />{n}</span></li>)}</ul>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Types() {
  return (
    <section className="sec sec-white" id="types" aria-labelledby="h-types">
      <div className="wrap">
        <p className="eyebrow">Taxi app types</p>
        <h2 className="h2 wide" id="h-types">Which taxi app fits your business model</h2>
        <p className="lede">The same four building blocks are combined differently depending on how you earn. Here is how we usually start.</p>
        <table className="tbl">
          <caption className="sr">Taxi app types, who they suit and the modules they usually need</caption>
          <thead><tr><th scope="col">Business model</th><th scope="col">Who it suits</th><th scope="col">Modules it usually needs</th><th scope="col">Starts with</th></tr></thead>
          <tbody>
            {TYPES.map(([n, who, mods, start]) => (
              <tr key={n}><th scope="row">{n}</th><td data-label="Who it suits">{who}</td><td data-label="Modules it usually needs">{mods}</td><td data-label="Starts with">{start}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Routes() {
  return (
    <section className="sec sec-gray" id="routes" aria-labelledby="h-routes">
      <div className="wrap">
        <p className="eyebrow">Ways to build</p>
        <h2 className="h2 wide" id="h-routes">Three ways to get your taxi app built</h2>
        <p className="lede">Every route ends in the same four parts. What changes is how much is ready-made and how much is designed for you.</p>
        <div className="routes3">
          <article className="card hov">
            <h3>Taxi booking app</h3>
            <dl><div><dt>Best when</dt><dd>You need riders to book, pay and track trips, with dispatch behind it.</dd></div><div><dt>Trade-off</dt><dd>Focused on the booking and dispatch core rather than unusual workflows.</dd></div></dl>
            <Link className="link" to={ROUTES.booking}>Taxi booking app development <ArrowRight size={16} /></Link>
          </article>
          <article className="card hov">
            <h3>Custom taxi app</h3>
            <dl><div><dt>Best when</dt><dd>Your pricing, dispatch rules, brand or integrations are what set you apart.</dd></div><div><dt>Trade-off</dt><dd>More discovery and design up front, and a longer path to first release.</dd></div></dl>
            <Link className="link" to={ROUTES.custom}>Custom taxi app development <ArrowRight size={16} /></Link>
          </article>
          <article className="card hov">
            <h3>White label taxi app</h3>
            <dl><div><dt>Best when</dt><dd>You want to reach the market sooner with pre-built functionality under your brand.</dd></div><div><dt>Trade-off</dt><dd>You work within what the base product already does.</dd></div></dl>
            <Link className="link" to={ROUTES.whiteLabel}>White label taxi app development <ArrowRight size={16} /></Link>
          </article>
        </div>
        <p className="note" id="routes-wl">Not sure which route fits? Compare <Link className="ref" to={ROUTES.whiteLabel}>white label</Link> with <Link className="ref" to={ROUTES.custom}>custom development</Link>, or tell us about your operation and we will recommend a starting point.</p>
      </div>
    </section>
  );
}

function Cost({ onAsk }: { onAsk: () => void }) {
  return (
    <section className="sec sec-white" id="cost" aria-labelledby="h-cost">
      <div className="wrap">
        <p className="eyebrow">Cost and timeline</p>
        <h2 className="h2 wide" id="h-cost">What shapes taxi app development cost and timeline</h2>
        <p className="lede">We do not quote from a price list, because two taxi businesses rarely need the same thing. These are the factors that move the scope.</p>
        <ul className="factors">{FACTORS.map(([h, p]) => <li key={h}><h3>{h}</h3><p>{p}</p></li>)}</ul>
        <p className="note">Maps, SMS, payment processing and app store fees are charged by their providers and are separate from development.</p>
        <div className="more"><button type="button" className="btn btn-primary" onClick={onAsk}>Get a scoped estimate</button><Link className="link" to={ROUTES.cost}>Full taxi app development cost guide <ArrowRight size={16} /></Link><Link className="link" to={ROUTES.services}>Our development services <ArrowRight size={16} /></Link><Link className="link" to={ROUTES.developers}>Meet the developers <ArrowRight size={16} /></Link></div>
      </div>
    </section>
  );
}

function Phases() {
  return (
    <section className="sec sec-gray" id="process" aria-labelledby="h-ph">
      <div className="wrap">
        <p className="eyebrow">Development process</p>
        <h2 className="h2 wide" id="h-ph">How we build a taxi app, step by step</h2>
        <ol className="ph6" style={{ listStyle: "none", padding: 0 }}>
          {STEPS.map(([t, d], i) => <li key={t}><Ic set="devSteps" i={i} /><h3><span className="sr">Step {i + 1}: </span>{t}</h3><p>{d}</p></li>)}
        </ol>
      </div>
    </section>
  );
}

function Stack() {
  return (
    <section className="sec sec-white" id="technology" aria-labelledby="h-stack">
      <div className="wrap">
        <p className="eyebrow">Technology</p>
        <h2 className="h2 wide" id="h-stack">Technology we use to build taxi apps</h2>
        <p className="lede">We pick the stack that fits your scale and your team, not the other way round.</p>
        <TechCards />
      </div>
    </section>
  );
}

function Body() {
  const { ask } = useShell();
  useSeo({
    title: TITLE, description: DESC, path: ROUTES.dev,
    ld: [crumbLd(CRUMBS), serviceLd("Taxi app development", DESC, ROUTES.dev, "Taxi app development"), faqLd(FAQS)],
  });
  return (
    <>
      <section className="hero hero-c" id="top">
        <div className="wrap in">
          <Crumbs items={CRUMBS} dark />
          <div className="txt">
            <p className="eyebrow light">Taxi app development</p>
            <h1>Taxi App Development for Taxi and <em>Ride-Hailing Businesses</em></h1>
            <p className="sub">We design and build the passenger app, driver app, admin dashboard and backend that a taxi or ride-hailing business runs on, from first discovery call to store launch.</p>
            <div className="hero-btns">
              <button type="button" className="btn btn-primary" onClick={() => ask("Plan your taxi app", { kind: "Not sure yet" })}>Plan Your Taxi App</button>
              <button type="button" className="btn btn-ghost-dark" onClick={() => go("anatomy")}>See What&rsquo;s Included</button>
            </div>
          </div>
          <Pic label="A taxi platform: a driver app, an admin dashboard and a passenger app shown together" className="platform">
            <Scaled w={980} h={470}>
              <div style={{ position: "absolute", left: 210, top: 40, borderRadius: 16, overflow: "hidden", boxShadow: "0 30px 70px -20px rgba(0,0,0,.65)" }}><AdminDash w={560} /></div>
              <Phone style={{ position: "absolute", left: 60, top: 100, transform: "scale(.9)", transformOrigin: "0 0" }}><PassengerScreen /></Phone>
              <Phone style={{ position: "absolute", left: 700, top: 130, transform: "scale(.9)", transformOrigin: "0 0" }}><DriverScreen /></Phone>
            </Scaled>
          </Pic>
        </div>
      </section>
      <Anatomy />
      <Types />
      <Routes />
      <Cost onAsk={() => ask("Get a scoped estimate", { kind: "Not sure yet" })} />
      <Phases />
      <Stack />
      <Faq items={FAQS} onAsk={() => ask("Ask us a question")} heading="Taxi app development questions, answered" />
      <Related page="dev" />
      <FinalCta title="Ready to Plan Your Taxi App?" text="Tell us about your fleet, your drivers and your passengers. We will come back with a clear scope and a recommended first release." onConsult={() => ask("Request a consultation", { kind: "Not sure yet" })} onStart={() => ask("Start your project", { kind: "Not sure yet" })} />
    </>
  );
}

export default function TaxiAppDevelopment() {
  return <Shell testId="page-tad-development"><Body /></Shell>;
}
