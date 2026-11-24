import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Navigation } from "lucide-react";
import { DriverScreen, PassengerScreen, Phone, Scaled } from "./mockups";
import { Crumbs, crumbLd, faqLd, serviceLd, useSeo } from "./seo";
import { Faq, FinalCta, Pic, Shell, Tick, go, useShell } from "./shell";
import { ROUTES } from "./routes";
import { Related } from "./related";

const TITLE = "Uber Like Taxi App Development: Features & How to Build";
const DESC = "Uber like taxi app development explained: the features of a ride-hailing app, how the marketplace works, what to build first and what not to copy.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Taxi App Development", to: ROUTES.dev }, { name: "Uber Clone App Development", to: ROUTES.uber }];

const FAQS: [string, string][] = [
  ["What is an Uber-like taxi app?", "It is a ride-hailing app inspired by the on-demand model: a passenger requests a ride, the system matches a nearby driver, both follow the trip live, and payment and rating happen in the app. It is built as your own product, with your own brand."],
  ["What features does an app like Uber need?", "At minimum: passenger booking with a fare estimate, a driver app with ride requests, real-time matching, live tracking, payments, ratings and an admin dashboard. The feature table on this page shows which feature belongs to the rider app, the driver app or the admin."],
  ["Is building an Uber clone legal?", "Building a ride-hailing app that works in a similar way is not a problem in itself. Copying another company's name, logo, design or code is. Ride-hailing is also regulated in many places, with licences, insurance and driver checks, so check the rules where you will operate. This is general information, not legal advice."],
  ["How is an Uber-like app different from a taxi booking app?", "An Uber-like app is a marketplace: independent drivers join your network and rides are matched on demand. A taxi booking app is built around a business that runs its own fleet and bookings, often with scheduling and dispatch. Many projects combine both. See taxi booking app development for the booking side."],
  ["Should I build an MVP first?", "Yes, in most cases. Launch the core loop of request, match, ride, pay and rate in one city, learn from real trips, then add scheduling, promo codes, dynamic pricing and more cities."],
  ["How do I get drivers and riders at the start?", "Start in one city and recruit drivers before you open to passengers, because riders leave quickly when nobody is available. Make driver sign-up and document checks simple, and plan how you will introduce the app to your first riders."],
  ["Can I start from a white label product?", "Yes. A white label taxi app can give you the core loop sooner under your own brand, and you can extend it. If your model needs much that is different, custom development fits better."],
  ["How long will it take and what will it cost?", "It depends on the scope of the first release, the integrations and the number of cities. We do not quote before discovery. After it you receive a phased plan with a schedule and a quote."],
];

const FEATS: [string, boolean, boolean, boolean][] = [
  ["Sign-up and profiles", true, true, true],
  ["Pickup and destination on a map", true, false, false],
  ["Fare estimate before booking", true, false, true],
  ["Vehicle types and categories", true, false, true],
  ["Real-time driver matching", true, true, true],
  ["Ride request with accept or decline", false, true, false],
  ["Live tracking and arrival time", true, true, false],
  ["In-app navigation", false, true, false],
  ["Payments: cards, wallets, cash", true, true, true],
  ["Two-way ratings and reviews", true, true, true],
  ["Driver onboarding and document checks", false, true, true],
  ["Earnings and payouts", false, true, true],
  ["Promo codes and pricing rules", true, false, true],
  ["Push notifications and SMS", true, true, false],
  ["Share trip status with a contact", true, false, false],
  ["Reports and analytics", false, false, true],
];

const STAGES: [string, string, string, string[]][] = [
  ["Stage 1", "Launch", "Prove the core loop in one city.", ["Rider booking and fare estimate", "Driver app and ride requests", "Real-time matching", "Live tracking", "Payments", "Ratings", "Admin basics"]],
  ["Stage 2", "Grow", "Add what real trips ask for.", ["Scheduled rides", "Promo codes", "More vehicle types", "Driver earnings reports", "In-app support"]],
  ["Stage 3", "Scale", "Run it as a bigger business.", ["Dynamic pricing rules", "More cities and areas", "Deeper analytics", "Corporate accounts", "Extra payment methods"]],
];

const RT: [string, string, string][] = [
  ["1", "Locations stream in", "Driver apps send their position to the backend every few seconds while online."],
  ["2", "The latest position is kept", "The backend holds each driver's current position and status, ready to search."],
  ["3", "A request finds a driver", "The matching service looks for nearby available drivers and offers the ride."],
  ["4", "Both apps stay in sync", "Push and live connections update rider and driver as the trip moves on."],
];

function Hero() {
  const { ask } = useShell();
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <Crumbs items={CRUMBS} dark />
        <div className="hero-grid" style={{ paddingTop: 10 }}>
          <div>
            <p className="eyebrow light">Uber like taxi app development</p>
            <h1>Uber Like Taxi App Development for Your Own <em>Ride-Hailing Business</em></h1>
            <p className="sub">Build an on-demand ride-hailing app with a passenger app, a driver app and an admin dashboard, inspired by the on-demand model and built as your own brand.</p>
            <div className="hero-btns">
              <button type="button" className="btn btn-primary" onClick={() => ask("Plan an Uber-like app", { kind: "Uber-like app" })}>Plan Your Ride-Hailing App</button>
              <button type="button" className="btn btn-ghost-dark" onClick={() => go("features")}>See the Features</button>
            </div>
          </div>
          <Pic label="Ride-hailing concept: a passenger app choosing a ride on a map, linked to a driver app showing a new ride request">
            <Scaled w={560} h={520}>
              <Phone style={{ position: "absolute", left: 10, top: 20, height: 480 }}><PassengerScreen /></Phone>
              <Phone style={{ position: "absolute", left: 330, top: 40, height: 480 }}><DriverScreen /></Phone>
              <span className="m-chip" style={{ position: "absolute", left: 236, top: 244, background: "#22d3ee", color: "#06223a", padding: "7px 12px", fontSize: 12, zIndex: 4, boxShadow: "0 10px 24px -8px rgba(0,0,0,.6)" }}><Navigation size={13} />Ride request</span>
            </Scaled>
          </Pic>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const [f, setF] = useState<"all" | 0 | 1 | 2>("all");
  const rows = FEATS.filter((r) => f === "all" || r[f + 1] === true);
  const opts: [typeof f, string][] = [["all", "All features"], [0, "Rider app"], [1, "Driver app"], [2, "Admin"]];
  const mark = (v: boolean) => v ? <><Check size={17} className="chk" aria-hidden /><span className="sr">Yes</span></> : <><span className="dash" aria-hidden>&ndash;</span><span className="sr">No</span></>;
  return (
    <section className="sec sec-white" id="features" aria-labelledby="h-feat">
      <div className="wrap">
        <p className="eyebrow">Features</p>
        <h2 className="h2 wide" id="h-feat">Features of an Uber-like app, by who uses them</h2>
        <p className="lede">The same product has three audiences. Filter by the one you want to see, to understand what each side of the marketplace needs.</p>
        <div className="filt" role="group" aria-label="Filter features by app">
          {opts.map(([k, l]) => <button key={String(k)} type="button" className="tab" aria-pressed={f === k} style={f === k ? { background: "var(--ink)", color: "#fff", borderColor: "var(--ink)" } : undefined} onClick={() => setF(k)}>{l}</button>)}
        </div>
        <table className="mx">
          <caption className="sr">Ride-hailing features and which app uses them</caption>
          <thead><tr><th scope="col">Feature</th><th scope="col">Rider</th><th scope="col">Driver</th><th scope="col">Admin</th></tr></thead>
          <tbody>{rows.map(([n, a, b, c]) => <tr key={n}><th scope="row">{n}</th><td>{mark(a)}</td><td>{mark(b)}</td><td>{mark(c)}</td></tr>)}</tbody>
        </table>
        <p className="note" role="status">Showing {rows.length} of {FEATS.length} features.</p>
      </div>
    </section>
  );
}

function Body() {
  const { ask } = useShell();
  useSeo({ title: TITLE, description: DESC, path: ROUTES.uber, ld: [crumbLd(CRUMBS), serviceLd("Uber-like taxi app development", DESC, ROUTES.uber, "Ride-hailing app development"), faqLd(FAQS)] });
  const plan = () => ask("Plan an Uber-like app", { kind: "Uber-like app" });
  return (
    <>
      <Hero />

      <section className="sec sec-navy on-navy" id="how-it-works" aria-labelledby="h-how">
        <div className="wrap">
          <p className="eyebrow">How it works</p>
          <h2 className="h2 wide" id="h-how">How an Uber-like app works: a two-sided marketplace</h2>
          <p className="lede">The product is a loop between riders and drivers, with your platform in the middle matching, pricing and keeping both sides informed.</p>
          <div className="loop">
            <div className="node"><h3>Rider</h3><ul><li>Requests a ride</li><li>Sees the fare and driver</li><li>Pays and rates</li></ul></div>
            <div className="arr" aria-hidden><span>request<br />&rarr;<br />&larr; match</span></div>
            <div className="node mid"><h3>Your platform</h3><p>Matching, pricing, payments, notifications and the admin dashboard that runs it all.</p></div>
            <div className="arr" aria-hidden><span>offer<br />&rarr;<br />&larr; accept</span></div>
            <div className="node"><h3>Driver</h3><ul><li>Goes online</li><li>Accepts the ride</li><li>Drives, gets paid</li></ul></div>
          </div>
        </div>
      </section>

      <Features />

      <section className="sec sec-gray" id="roadmap" aria-labelledby="h-road">
        <div className="wrap">
          <p className="eyebrow">What to build first</p>
          <h2 className="h2 wide" id="h-road">Build an Uber-like app in three stages, not all at once</h2>
          <p className="lede">Most of the features people associate with big ride-hailing apps came after years of real trips. This is the order we usually recommend.</p>
          <ol className="stages3" style={{ listStyle: "none", padding: 0 }}>
            {STAGES.map(([b, h, p, pts]) => <li key={h}><b>{b}</b><h3>{h}</h3><p>{p}</p><Tick items={pts} /></li>)}
          </ol>
        </div>
      </section>

      <section className="sec sec-white" id="own-it" aria-labelledby="h-own">
        <div className="wrap">
          <p className="eyebrow">Clone or original?</p>
          <h2 className="h2 wide" id="h-own">What to learn from Uber, and what not to copy</h2>
          <p className="lede">An Uber-like app is inspired by a proven model. It should never look like, or pretend to be, another company&rsquo;s product. We build original apps with no other brand&rsquo;s name, logo or code in them.</p>
          <div className="vs2">
            <div className="dk"><h3>Learn from the model</h3><Tick items={["Request a ride with a tap", "Upfront fare estimate", "Live tracking and arrival time", "Two-way ratings", "Cashless payment as an option"]} /></div>
            <div><h3>Make it yours</h3><Tick items={["Your own name, logo and identity", "Your pricing, commission and payout model", "Local payment methods and languages", "Local licensing, insurance and driver rules", "A launch plan for your city"]} /></div>
          </div>
        </div>
      </section>

      <section className="sec sec-gray" id="real-time" aria-labelledby="h-rt">
        <div className="wrap">
          <p className="eyebrow">Under the hood</p>
          <h2 className="h2 wide" id="h-rt">The real-time engine behind a ride-hailing app</h2>
          <p className="lede">Matching a rider to a driver in seconds depends on keeping fresh positions flowing and searchable. Weak GPS, dropped connections and battery use are the problems we design around.</p>
          <ol className="rt" style={{ listStyle: "none", padding: 0 }}>{RT.map(([n, h, p]) => <li key={n}><b>Step {n}</b><h3>{h}</h3><p>{p}</p></li>)}</ol>
        </div>
      </section>

      <section className="sec sec-white" id="launch-market" aria-labelledby="h-mkt">
        <div className="wrap">
          <p className="eyebrow">Launching the marketplace</p>
          <h2 className="h2 wide" id="h-mkt">Getting both sides of the marketplace on board</h2>
          <ul className="fit4 c3">
            <li><h3>Start in one city</h3><p>A focused launch area keeps drivers and riders close enough for fast matches.</p></li>
            <li><h3>Recruit drivers first</h3><p>Riders leave quickly if nobody is nearby, so have drivers online before you open bookings.</p></li>
            <li><h3>Make onboarding simple</h3><p>Upload documents in the app, review them in the admin, and approve drivers without delay.</p></li>
          </ul>
          <div className="more">
            <Link className="link" to={ROUTES.whiteLabel}>Start faster with white label <ArrowRight size={16} /></Link>
            <Link className="link" to={ROUTES.booking}>Taxi booking app development <ArrowRight size={16} /></Link>
            <Link className="link" to={ROUTES.dispatch}>Taxi dispatch software <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <Faq items={FAQS} onAsk={() => ask("Ask us a question", { kind: "Uber-like app" })} heading="Uber-like app questions, answered" />
      <Related page="uber" />
      <FinalCta title="Ready to Build Your Ride-Hailing App?" text="Tell us your city, your drivers and how you want to earn. We will shape a first release and a plan to grow it." startLabel="Plan Your Ride-Hailing App" consultLabel="Request a Consultation" onStart={plan} onConsult={() => ask("Request a consultation", { kind: "Uber-like app" })} />
    </>
  );
}

export default function UberCloneAppDevelopment() {
  return <Shell testId="page-tad-uber"><Body /></Shell>;
}
