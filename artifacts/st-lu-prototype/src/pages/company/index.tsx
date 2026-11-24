import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, BadgeDollarSign, BarChart3, Briefcase, Compass, PenTool, Plug, Rocket, Bell, BellRing, Boxes, CalendarClock, CreditCard, Gauge, Headset, History, Layers, Map,
  MapPin, Palette, Puzzle, ShieldCheck, Smartphone, Sparkles, Star, Tag, Timer, Users, Wallet, Server, Zap,
} from "lucide-react";
import { AdminDash, BLUE, BrandVis, BookingVis, DriverScreen, FlowVis, GpsVis, LiveWidget, MatchVis, PassengerScreen, Phone, RideCard, RouteMap, STLU, Scaled, WorkflowVis } from "./mockups";
import { Faq, FinalCta, Pic, Shell, Tick, go, useShell } from "./shell";
import { ROUTES } from "./routes";
import { StluLink } from "./stluLink";
import { Related } from "./related";
import { TechCards } from "./techcards";
import { BarsVis, FareVis, HistVis, NotifVis, PayVis, PromoVis, SchedVis, StarVis } from "./featvis";
import { faqLd, useSeo, webPageLd, orgRef, siteRef } from "./seo";

/* ---------------- hero ---------------- */
function Hero({ onConsult }: { onConsult: () => void }) {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div>
          <p className="eyebrow light">Taxi &amp; ride-hailing app development</p>
          <h1>Taxi App Development Company for Businesses Ready to <em>Move Forward.</em></h1>
          <p className="sub">Launch your own taxi booking platform with powerful passenger apps, driver apps, and intelligent fleet management solutions built around your business.</p>
          <div className="hero-btns">
            <button type="button" className="btn btn-primary" onClick={onConsult}>Get a Free Consultation</button>
            <button type="button" className="btn btn-ghost-dark" onClick={() => go("services")}>Explore Our Solutions</button>
          </div>
          <p className="caps" aria-label="Platforms: iOS, Android, Web, Custom Software">
            <span>iOS</span><i aria-hidden /><span>Android</span><i aria-hidden /><span>Web</span><i aria-hidden /><span>Custom Software</span>
          </p>
        </div>
        <Scaled w={580} h={640}>
          <div style={{ position: "absolute", left: 40, top: 40, width: 500, height: 330, borderRadius: 22, overflow: "hidden", boxShadow: "0 0 0 1.5px #2a3566, 0 30px 70px -20px rgba(0,0,0,.6)" }}><RouteMap w={500} h={330} style={{ width: 500, height: 330 }} /></div>
          <Phone style={{ position: "absolute", left: 0, top: 150 }}><PassengerScreen /></Phone>
          <Phone style={{ position: "absolute", left: 360, top: 190 }}><DriverScreen /></Phone>
          <RideCard style={{ position: "absolute", left: 246, top: 6 }} />
          <LiveWidget style={{ position: "absolute", left: 228, top: 470 }} />
        </Scaled>
      </div>
    </section>
  );
}

/* ---------------- sections ---------------- */
const CAPS = [
  { t: "iOS & Android Development", I: Smartphone }, { t: "Real-Time GPS Tracking", I: MapPin }, { t: "Secure Payment Integration", I: ShieldCheck },
  { t: "Fleet Management", I: Boxes }, { t: "Scalable Backend", I: Server },
];
function Capabilities() {
  return (
    <section className="sec-white" aria-label="Capabilities" style={{ borderBottom: "1px solid var(--line)" }}>
      <div className="wrap"><ul className="strip">{CAPS.map(({ t, I }) => <li key={t}><span className="ic"><I size={19} /></span>{t}</li>)}</ul></div>
    </section>
  );
}

function Services({ onConsult }: { onConsult: () => void }) {
  void onConsult;
  return (
    <section className="sec sec-gray" id="services" aria-labelledby="h-services">
      <div className="wrap">
        <p className="eyebrow">Services</p>
        <h2 className="h2 wide" id="h-services">Taxi App Development Solutions for Every Business</h2>
        <div className="svc">
          <article className="card hov a">
            <span className="ic"><Smartphone size={22} /></span>
            <h3>Taxi Booking App Development</h3>
            <p>Build feature-rich booking platforms for passengers and drivers.</p>
            <div className="vis"><BookingVis /></div>
            <Link className="link" to={ROUTES.booking}>Learn More <ArrowRight size={16} /><span className="sr"> about taxi booking app development</span></Link>
          </article>
          <article className="card hov dark b">
            <span className="ic"><Puzzle size={22} /></span>
            <h3>Custom Taxi App Development</h3>
            <p>Tailored ride-hailing platforms designed around unique operational requirements.</p>
            <div className="vis"><WorkflowVis /></div>
            <Link className="link" to={ROUTES.custom}>Learn More <ArrowRight size={16} /><span className="sr"> about custom taxi app development</span></Link>
          </article>
          <article className="card hov c">
            <span className="ic"><Palette size={22} /></span>
            <h3>White Label Taxi App Development</h3>
            <p>Launch a branded taxi booking solution with configurable functionality.</p>
            <div className="vis"><BrandVis /></div>
            <Link className="link" to={ROUTES.whiteLabel}>Learn More <ArrowRight size={16} /><span className="sr"> about white label taxi app development</span></Link>
          </article>
          <article className="card hov d">
            <span className="ic"><Zap size={22} /></span>
            <h3>Uber-Like App Development</h3>
            <p>Build a complete ride-hailing experience inspired by modern mobility platforms.</p>
            <div className="vis"><FlowVis /></div>
            <Link className="link" to={ROUTES.uber}>Learn More <ArrowRight size={16} /><span className="sr"> about Uber-like app development</span></Link>
          </article>
        </div>
      </div>
    </section>
  );
}


function Ecosystem() {
  return (
    <section className="sec sec-white" id="ecosystem" aria-labelledby="h-eco">
      <div className="wrap">
        <p className="eyebrow">The platform</p>
        <h2 className="h2 wide" id="h-eco">One taxi platform, three connected apps</h2>
        <p className="lede">A complete taxi business runs on a passenger app, a driver app, and an admin dashboard that keeps them in step.</p>
        <div className="eco">
          <article className="card p">
            <div className="stage"><Scaled w={220} h={450}><div style={{ position: "absolute", top: 0 }}><Phone><PassengerScreen /></Phone></div></Scaled></div>
            <div className="body"><h3>Passenger App</h3><Tick items={["Ride booking", "Fare estimates", "Live tracking", "Payments", "Trip history"]} /></div>
          </article>
          <article className="card d">
            <div className="stage"><Scaled w={220} h={450}><div style={{ position: "absolute", top: 0 }}><Phone><DriverScreen /></Phone></div></Scaled></div>
            <div className="body"><h3>Driver App</h3><Tick items={["Ride requests", "Navigation", "Availability status", "Earnings dashboard", "Trip management"]} /></div>
          </article>
          <article className="card a">
            <div className="stage" style={{ alignItems: "center" }}><Scaled w={560} h={334}><AdminDash /></Scaled></div>
            <div className="body"><h3>Admin Dashboard</h3><Tick items={["Driver management", "Ride monitoring", "Analytics", "Pricing management", "Fleet operations"]} /></div>
          </article>
        </div>
      </div>
    </section>
  );
}

const FEATS = [
  ["Real-Time GPS Tracking", MapPin, "Passengers and dispatchers see every trip move on the map as it happens."],
  ["Smart Driver Matching", Users, "Requests go to the best available driver by distance and availability."],
  ["Ride Scheduling", CalendarClock, "Book rides ahead for airport runs, pickups and recurring trips."],
  ["Multiple Payment Options", CreditCard, "Cards and wallets through secure payment providers."],
  ["Fare Management", Wallet, "Set base fares, distance rates, surcharges and fixed prices."],
  ["Push Notifications", BellRing, "Keep riders and drivers informed from request to drop-off."],
  ["Ratings & Reviews", Star, "Two-way feedback that protects service quality."],
  ["Ride History", History, "Every trip, receipt and status in one searchable record."],
  ["Promo Codes", Tag, "Run launch offers and discounts you control."],
  ["Analytics & Reporting", BarChart3, "Bookings, revenue and driver performance at a glance."],
] as const;
const FVIS: Record<string, () => ReactElement> = { "Ride Scheduling": SchedVis, "Multiple Payment Options": PayVis, "Fare Management": FareVis, "Push Notifications": NotifVis, "Ratings & Reviews": StarVis, "Ride History": HistVis, "Promo Codes": PromoVis, "Analytics & Reporting": BarsVis };
function Features() {
  return (
    <section className="sec sec-gray" id="features" aria-labelledby="h-feat">
      <div className="wrap">
        <p className="eyebrow">Features</p>
        <h2 className="h2 wide" id="h-feat">Everything You Need to Run a Smarter Taxi Business</h2>
        <div className="feat">
          <article className="card l"><span className="ic"><MapPin size={21} /></span><h3>Real-Time GPS Tracking</h3><p>{FEATS[0][2]}</p><GpsVis /></article>
          <article className="card l"><span className="ic"><Users size={21} /></span><h3>Smart Driver Matching</h3><p>{FEATS[1][2]}</p><MatchVis /></article>
          {FEATS.slice(2).map(([t, I, d]) => { const V = FVIS[t]; return <article key={t} className="card hov s"><span className="ic"><I size={20} /></span><h3>{t}</h3><p>{d}</p>{V && <V />}</article>; })}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  ["Discovery & Strategy", "We learn your market, operations and goals.", Compass],
  ["UI/UX Design", "Clear flows and interfaces for riders, drivers and admins.", PenTool],
  ["App Development", "Passenger and driver apps built for iOS and Android.", Smartphone],
  ["Backend & API Integration", "Dispatch, pricing, payments and maps connected.", Plug],
  ["Testing & QA", "Testing across devices, roles and real trip scenarios.", ShieldCheck],
  ["Launch & Support", "Store release, go-live help and continued care.", Rocket],
] as const;
function Process() {
  return (
    <section className="sec sec-white" id="process" aria-labelledby="h-proc">
      <div className="wrap">
        <p className="eyebrow">Process</p>
        <h2 className="h2 wide" id="h-proc">From first call to a live taxi platform</h2>
        <ol className="steps6" style={{ listStyle: "none", padding: 0 }}>
          {STEPS.map(([t, d, I], i) => <li key={t}><span className="sn" aria-hidden>{String(i + 1).padStart(2, "0")}</span><span className="si" aria-hidden><I size={24} /></span><h3><span className="sr">Step {i + 1}: </span>{t}</h3><p>{d}</p></li>)}
        </ol>
      </div>
    </section>
  );
}

function Project() {
  return (
    <section className="sec sec-gray" id="project" aria-labelledby="h-proj">
      <div className="wrap">
        <p className="eyebrow">Featured project</p>
        <h2 className="h2 wide" id="h-proj">A taxi booking platform for St Lu Taxi &amp; Tours</h2>
        <div className="proj">
          <div className="proj-vis" aria-hidden>
            <Scaled w={560} h={700}>
              <div style={{ position: "absolute", left: 0, top: 4 }}><AdminDash w={372} accent={STLU} title="Dispatch" /></div>
              <Phone style={{ position: "absolute", left: 372, top: 4, transform: "scale(.84)", transformOrigin: "0 0" }}><PassengerScreen accent={STLU} brand="Hewanorra Airport" /></Phone>
              <Phone style={{ position: "absolute", left: 40, top: 360, transform: "scale(.72)", transformOrigin: "0 0" }}><DriverScreen accent={STLU} /></Phone>
              <div style={{ position: "absolute", left: 292, top: 440, width: 240, color: "#c7d6ff", fontSize: 14, lineHeight: 1.5 }}>One job, three views: the passenger books, the driver accepts and the dispatcher assigns.</div>
            </Scaled>
          </div>
          <div className="proj-txt">
            <div className="tags"><span className="tag">Passenger app</span><span className="tag">Driver app</span><span className="tag">Admin dispatch panel</span><span className="tag">Landing page</span></div>
            <p className="lede" style={{ marginTop: 0 }}>A ride-sharing and tours platform for a St. Lucia taxi operator: airport transfers, tours and taxi bookings, with a dispatcher panel behind them.</p>
            <div><h3 style={{ fontSize: 17, marginBottom: 12 }}>Features developed</h3>
              <Tick items={["Passenger booking with online payment", "Driver app with job status updates", "Dispatcher assigns in-house and outside drivers", "SMS and WhatsApp job links and alerts", "Document expiry alerts for drivers and vehicles", "Live map and trip timeline"]} /></div>
            <p className="note">The St Lu app you can open here is a clickable design prototype. It shows the product direction, not live client results.</p>
            <div className="hero-btns" style={{ marginTop: 0 }}>
              <StluLink to="/" className="btn btn-primary">Open the St Lu prototype</StluLink>
              <StluLink to="/landing" className="btn btn-outline">View the St Lu website</StluLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Compare({ onConsult }: { onConsult: () => void }) {
  return (
    <section className="sec sec-white" id="compare" aria-labelledby="h-cmp">
      <div className="wrap">
        <p className="eyebrow">Choose your route</p>
        <h2 className="h2 wide" id="h-cmp">White Label or Custom Taxi App Development</h2>
        <div className="cmp">
          <article className="wl">
            <span className="tag" style={{ alignSelf: "flex-start" }}>Launch faster</span>
            <h3>White Label Taxi App</h3>
            <p className="who">A proven foundation, configured and branded for you.</p>
            <Tick items={["Faster deployment", "Pre-built functionality", "Lower initial development effort", "Brand customization"]} />
            <div className="cta"><button type="button" className="btn btn-primary" onClick={onConsult}>Talk about white label</button></div>
          </article>
          <article className="cu">
            <span className="tag" style={{ alignSelf: "flex-start", background: "rgba(34,211,238,.15)", color: "#7ce8fb" }}>Built for you</span>
            <h3>Custom Taxi App</h3>
            <p className="who">Designed around how your business really operates.</p>
            <Tick items={["Unique business requirements", "Custom workflows", "Flexible integrations", "Full control over functionality", "Long-term scalability"]} />
            <div className="cta"><button type="button" className="btn btn-ghost-dark" onClick={onConsult}>Talk about custom</button></div>
          </article>
        </div>
      </div>
    </section>
  );
}

const PIC = [Compass, Briefcase, BadgeDollarSign, Users];
const PATHS: [string, string, string, string, string][] = [
  ["Find your fit", "Taxi app solutions", "Solutions by business model, operation and fleet size, with a finder.", ROUTES.solutions, "taxi app solutions"],
  ["See what you get", "Taxi app development services", "Every service and the deliverable that comes from it.", ROUTES.services, "taxi app development services"],
  ["Plan the budget", "Taxi app development cost", "What drives cost, and a tool to size your scope.", ROUTES.cost, "taxi app development cost"],
  ["Meet the team", "Taxi app developers", "The roles on your project and how we work together.", ROUTES.developers, "taxi app developers"],
];
function Explore() {
  return (
    <section className="sec sec-white" id="explore" aria-labelledby="h-explore">
      <div className="wrap">
        <p className="eyebrow">Where to start</p>
        <h2 className="h2 wide" id="h-explore">Explore our taxi app development work</h2>
        <p className="lede">Whether you are comparing solutions, working out a budget or choosing a team, each question has its own page.</p>
        <ul className="xplore">{PATHS.map(([q, h, p, to, a], i) => { const I = PIC[i]; return <li key={h}><span className="xic" aria-hidden><I size={22} /></span><span className="q">{q}</span><h3>{h}</h3><p>{p}</p><Link className="link" to={to}>Learn more <ArrowRight size={16} /><span className="sr"> about {a}</span></Link></li>; })}</ul>
        <div className="more"><Link className="link" to={ROUTES.contact}>Contact our team <ArrowRight size={16} /></Link></div>
      </div>
    </section>
  );
}

function Tech() {
  return (
    <section className="sec sec-gray" id="tech" aria-labelledby="h-tech">
      <div className="wrap">
        <p className="eyebrow">Technology</p>
        <h2 className="h2 wide" id="h-tech">Modern tools, chosen for your platform</h2>
        <p className="lede">We pick the stack that fits your scale and team, not the other way round.</p>
        <TechCards />
      </div>
    </section>
  );
}

const FAQS: [string, string][] = [
  ["How much does taxi app development cost?", "Cost depends on the scope: which apps you need, which features, and whether you choose white label or custom development. After a short discovery call we recommend a phased plan and a quote tailored to your budget. Third-party services such as maps, SMS and app store fees are billed by their providers."],
  ["How long does it take to build a taxi booking app?", "Timelines depend on scope. Many operators launch a focused first phase with the core booking, dispatch and driver features, then add more once real trips show what matters. We give a realistic schedule once the scope is agreed."],
  ["Can you develop an app similar to Uber?", "Yes. We build ride-hailing platforms with passenger and driver apps, live tracking, driver matching, payments and an admin dashboard, shaped around your market and brand."],
  ["Do you offer white-label taxi app solutions?", "Yes. A white-label solution gets you to market faster with pre-built functionality, branded and configured for your business. Custom development is there when you need workflows that are your own."],
  ["Can the platform support multiple cities?", "Yes. Platforms can be designed with several service areas, each with its own pricing and drivers, managed from one admin dashboard."],
  ["Can I have separate driver and passenger apps?", "Yes. Passengers and drivers get their own apps with the tools each needs, and both connect to the same backend and admin dashboard."],
  ["Do you support iOS and Android?", "Yes. We build for both platforms, using cross-platform tools like Flutter or React Native where they fit, or native development where it makes sense."],
  ["Can additional features be integrated later?", "Yes. The platform is built in modular parts, so features such as promo codes, scheduling or new payment methods can be added after launch."],
];

const HOME_TITLE = "Taxi App Development Company | TaxiAppDevelopment.org";
const HOME_DESC = "Taxi app development company building taxi booking apps, white label and custom taxi apps, Uber-like ride-hailing platforms, driver apps and admin dashboards.";

function HomeBody() {
  const { ask } = useShell();
  useSeo({
    title: HOME_TITLE, description: HOME_DESC, path: ROUTES.home,
    ld: [
      { "@context": "https://schema.org", ...orgRef, description: HOME_DESC },
      { "@context": "https://schema.org", ...siteRef, publisher: { "@id": orgRef["@id"] } },
      webPageLd(HOME_TITLE, HOME_DESC, ROUTES.home),
      faqLd(FAQS),
    ],
  });
  const consult = () => ask("Request a free consultation");
  const start = () => ask("Start your project");
  return (
    <>
      <Hero onConsult={consult} />
      <Capabilities />
      <Services onConsult={consult} />
      <Ecosystem />
      <Features />
      <Process />
      <Project />
      <Compare onConsult={consult} />
      <Tech />
      <Explore />
      <Faq items={FAQS} onAsk={() => ask("Ask us a question")} />
      <Related page="home" />
      <FinalCta onConsult={consult} onStart={start} />
    </>
  );
}

export default function Company() {
  return <Shell testId="page-company"><HomeBody /></Shell>;
}
