import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, CalendarClock, Car, CheckCircle2, CreditCard, History, MapPin, Navigation, Star, Tag, Users } from "lucide-react";
import { LiveWidget, PassengerScreen, Phone, RideCard, RouteMap, STLU, Scaled } from "./mockups";
import { Crumbs, crumbLd, faqLd, serviceLd, useSeo } from "./seo";
import { Faq, FinalCta, Pic, Shell, go, useShell } from "./shell";
import { Illus } from "./covers";
import { ROUTES } from "./routes";
import { StluLink } from "./stluLink";
import { Related } from "./related";

const TITLE = "Taxi Booking App Development: Booking Flow & Dispatch";
const DESC = "Taxi booking app development for operators: ride booking flow, fare estimates, scheduled rides, driver dispatch and payments. See the flow and request a quote.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Taxi App Development", to: ROUTES.dev }, { name: "Taxi Booking App Development", to: ROUTES.booking }];

const FAQS: [string, string][] = [
  ["What is a taxi booking app?", "It is the software that lets passengers request or schedule a ride and lets an operator assign, track and manage those bookings. In practice it is a passenger booking app, a driver app and an admin or dispatcher panel working on the same booking data."],
  ["Can passengers book rides in advance?", "Yes. Scheduled bookings let a passenger choose a date and time, for example an airport pickup, and the booking is assigned to a driver closer to the time or by your dispatcher."],
  ["How are fares calculated and shown?", "Fares are configurable: a base fare with distance and time rates, fixed prices for set routes such as airport transfers, and surcharges where you need them. The passenger sees the fare estimate before they confirm."],
  ["How does driver assignment work?", "You choose the model. Requests can go to the nearest available driver with a short time to accept, be offered to several drivers, or be assigned by a dispatcher from the admin panel. If a driver does not respond, the request moves on."],
  ["Which payment methods can the app accept?", "Cards and wallets through a payment gateway of your choice, and cash where you want to allow it. Which methods you can offer depends on the payment provider and your country."],
  ["Can my dispatcher create bookings for phone customers?", "Yes. The admin panel can create a booking on a customer's behalf, assign a driver and send the job to them, so phone and walk-in bookings sit in the same system as app bookings."],
  ["Is a taxi booking app the same as a custom taxi app?", "Not exactly. A taxi booking app describes what the product does. Custom development describes how it is built. Many booking apps use proven building blocks, and when your pricing or workflow is unusual we build those parts to order. See custom taxi app development for that decision."],
];

const FLOW: { t: string; d: string; cap: string }[] = [
  { t: "Set pickup and destination", d: "The passenger drops a pin or types an address. Saved places and recent trips speed up repeat bookings.", cap: "Pickup and destination" },
  { t: "Choose a ride and see the fare", d: "Vehicle types are shown with arrival times and a fare estimate, so there is no surprise at the end.", cap: "Ride types and fare estimate" },
  { t: "Confirm the booking", d: "Now or scheduled, payment method chosen, one clear confirmation step.", cap: "Booking summary" },
  { t: "Match with a driver", d: "The request goes out by your matching rules. The passenger sees that a driver is being found.", cap: "Finding a driver" },
  { t: "Track the driver", d: "Driver details, vehicle and a live arrival estimate, with call and message options.", cap: "Driver on the way" },
  { t: "Ride in progress", d: "The route and the ETA stay visible until drop-off.", cap: "Trip in progress" },
  { t: "Pay and rate", d: "A receipt, the payment and a rating for the driver, all stored in the trip history.", cap: "Receipt and rating" },
];

function Status() { return <div className="st" style={{ position: "relative" }}><span>9:41</span><span>5G</span></div>; }
function Sheet({ children }: { children: ReactNode }) {
  return <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "#fff", borderRadius: "20px 20px 0 0", padding: "14px 13px 16px", boxShadow: "0 -10px 30px rgba(10,19,48,.12)" }}>{children}</div>;
}
const grab = <div style={{ width: 34, height: 4, background: "#dde3f1", borderRadius: 3, margin: "-4px auto 10px" }} />;
const Field = ({ dot, text, muted }: { dot: string; text: string; muted?: boolean }) => (
  <div className="m-row" style={{ padding: "6px 0" }}><span className="m-dot" style={{ background: dot, borderRadius: dot === "#0a1330" ? 2 : "50%" }} /><span style={{ color: muted ? "#64708f" : "#0a1330", fontWeight: muted ? 500 : 650 }}>{text}</span></div>
);

/** One drawn phone screen per booking step. Illustrative sample UI, not a real place or fare. */
function FlowScreen({ step }: { step: number }) {
  const bg = <div style={{ position: "absolute", inset: 0 }}><RouteMap w={204} h={440} route={step >= 1} style={{ position: "absolute", left: -120, top: 0, width: 440, height: 300 }} /></div>;
  return (
    <div className="screen">
      {step !== 2 && step !== 6 && bg}
      <Status />
      {step === 0 && (
        <>
          <div className="m-card" style={{ position: "absolute", left: 10, right: 10, top: 40, padding: "6px 11px" }}>
            <Field dot="#2b63ff" text="Current location" /><Field dot="#0a1330" text="Where to?" muted />
          </div>
          <Sheet>{grab}
            {["Airport, Arrivals", "Harbour Hotel", "Old Town Market"].map((p) => <div key={p} className="m-row" style={{ padding: "9px 4px", borderBottom: "1px solid #eef1f8" }}><MapPin size={15} color="#64708f" /><span style={{ fontWeight: 600 }}>{p}</span></div>)}
          </Sheet>
        </>
      )}
      {step === 1 && (
        <Sheet>{grab}
          {[["Economy", "4 min", true], ["Comfort", "6 min", false], ["Van, 6 seats", "9 min", false]].map(([n, t, on]) => (
            <div key={n as string} className="m-row" style={{ padding: "9px", borderRadius: 11, marginBottom: 5, background: on ? "#eaf0ff" : "#f6f8fc", boxShadow: on ? "inset 0 0 0 1.5px #2b63ff" : "none" }}>
              <Car size={17} color={on ? "#2b63ff" : "#64708f"} /><div style={{ flex: 1 }}><b>{n}</b><div style={{ color: "#64708f", fontSize: 11 }}>{t} away</div></div><b style={{ fontSize: 11.5 }}>Fare est.</b>
            </div>
          ))}
          <span className="m-btn" style={{ marginTop: 8 }}>Continue</span>
        </Sheet>
      )}
      {step === 2 && (
        <div style={{ position: "absolute", inset: "44px 12px 12px" }}>
          <b style={{ fontSize: 15 }}>Confirm your ride</b>
          <div className="m-card" style={{ marginTop: 12, padding: "6px 12px", boxShadow: "0 0 0 1px #e2e8f4" }}>
            <Field dot="#2b63ff" text="Current location" /><Field dot="#0a1330" text="Harbour Hotel" />
          </div>
          {[["Ride", "Economy"], ["When", "Now"], ["Payment", "Card"]].map(([k, v]) => <div key={k} className="m-row" style={{ justifyContent: "space-between", padding: "11px 2px", borderBottom: "1px solid #eef1f8" }}><span style={{ color: "#64708f" }}>{k}</span><b>{v}</b></div>)}
          <div className="m-row" style={{ gap: 6, marginTop: 12 }}><span className="m-chip" style={{ background: "#eaf0ff", color: "#1b46c4" }}><CalendarClock size={12} />Schedule instead</span></div>
          <span className="m-btn" style={{ position: "absolute", left: 0, right: 0, bottom: 4 }}>Confirm ride</span>
        </div>
      )}
      {step === 3 && (
        <Sheet>{grab}
          <div style={{ display: "grid", placeItems: "center", padding: "8px 0 12px" }}>
            <span className="pulse" style={{ width: 54, height: 54, borderRadius: "50%", background: "#eaf0ff", display: "grid", placeItems: "center", color: "#2b63ff" }}><Navigation size={22} /></span>
            <b style={{ marginTop: 10, fontSize: 14 }}>Finding your driver</b>
            <span style={{ color: "#64708f", fontSize: 11.5, marginTop: 2 }}>This usually takes a moment</span>
          </div>
          <span className="m-btn" style={{ background: "#f1f4fb", color: "#0a1330" }}>Cancel request</span>
        </Sheet>
      )}
      {step === 4 && (
        <Sheet>{grab}
          <div className="m-row" style={{ justifyContent: "space-between" }}><span className="m-chip" style={{ background: "#d9f7ea", color: "#0a7a4f" }}><CheckCircle2 size={12} />Driver assigned</span><b style={{ fontSize: 12 }}>4 min away</b></div>
          <div className="m-row" style={{ marginTop: 10 }}>
            <span style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2b63ff,#22d3ee)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 700 }}>MJ</span>
            <div style={{ flex: 1 }}><b>Marcus J.</b><div className="m-row" style={{ gap: 3, color: "#64708f", fontSize: 11 }}><Star size={11} fill="#f5b301" color="#f5b301" />4.9 · Toyota Noah</div></div>
          </div>
          <div className="m-row" style={{ gap: 6, marginTop: 10 }}><span className="m-btn" style={{ flex: 1, background: "#f1f4fb", color: "#0a1330" }}>Call</span><span className="m-btn" style={{ flex: 1, background: "#f1f4fb", color: "#0a1330" }}>Message</span></div>
        </Sheet>
      )}
      {step === 5 && (
        <Sheet>{grab}
          <b style={{ fontSize: 14 }}>Heading to Harbour Hotel</b>
          <div style={{ height: 6, borderRadius: 4, background: "#e6ecfa", marginTop: 12 }}><div style={{ width: "58%", height: "100%", borderRadius: 4, background: "#2b63ff" }} /></div>
          <div className="m-row" style={{ justifyContent: "space-between", marginTop: 8, color: "#64708f", fontSize: 11.5 }}><span>Pickup</span><b style={{ color: "#0a1330" }}>Arriving in 7 min</b></div>
        </Sheet>
      )}
      {step === 6 && (
        <div style={{ position: "absolute", inset: "44px 12px 12px", textAlign: "center" }}>
          <span style={{ width: 46, height: 46, borderRadius: "50%", background: "#d9f7ea", color: "#0a7a4f", display: "inline-grid", placeItems: "center" }}><CheckCircle2 size={24} /></span>
          <b style={{ display: "block", fontSize: 16, marginTop: 8 }}>You have arrived</b>
          <div className="m-card" style={{ marginTop: 14, padding: "6px 12px", textAlign: "left", boxShadow: "0 0 0 1px #e2e8f4" }}>
            {[["Fare", "Paid by card"], ["Receipt", "Sent to email"]].map(([k, v]) => <div key={k} className="m-row" style={{ justifyContent: "space-between", padding: "9px 0", borderBottom: k === "Fare" ? "1px solid #eef1f8" : 0 }}><span style={{ color: "#64708f" }}>{k}</span><b>{v}</b></div>)}
          </div>
          <div className="m-row" style={{ justifyContent: "center", gap: 4, marginTop: 18 }}>{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={22} fill="#f5b301" color="#f5b301" />)}</div>
          <span style={{ color: "#64708f", fontSize: 11.5 }}>Rate your driver</span>
          <span className="m-btn" style={{ position: "absolute", left: 0, right: 0, bottom: 4 }}>Done</span>
        </div>
      )}
    </div>
  );
}

function Flow() {
  const [i, setI] = useState(0);
  return (
    <section className="sec sec-white" id="flow" aria-labelledby="h-flow">
      <div className="wrap">
        <p className="eyebrow">The booking flow</p>
        <h2 className="h2 wide" id="h-flow">A taxi booking flow passengers finish without help</h2>
        <p className="lede">The booking screen is where a taxi business wins or loses a customer. Step through the seven moments we design for, and see what the passenger sees.</p>
        <div className="flow">
          <ol className="fsteps" style={{ listStyle: "none", padding: 0 }} aria-label="Booking steps">
            {FLOW.map((s, n) => (
              <li key={s.t}>
                <button type="button" className="fstep" aria-current={i === n ? "step" : undefined} onClick={() => setI(n)}>
                  <span className="n" aria-hidden>{n + 1}</span>
                  <span><strong><span className="sr">Step {n + 1}: </span>{s.t}</strong><span className="d">{s.d}</span></span>
                </button>
              </li>
            ))}
          </ol>
          <div className="fstage">
            <p className="fcap" aria-live="polite">{`Step ${i + 1} of ${FLOW.length}: ${FLOW[i].cap}`}</p>
            <Pic label={`Passenger app screen for step ${i + 1}: ${FLOW[i].cap}. Illustrative sample screen.`} style={{ maxWidth: 240, margin: "0 auto" }}>
              <Scaled w={220} h={450}><Phone><FlowScreen step={i} /></Phone></Scaled>
            </Pic>
          </div>
        </div>
      </div>
    </section>
  );
}

const SPEC: [typeof CalendarClock, string, string][] = [
  [CalendarClock, "On-demand and scheduled rides", "Book now for a pickup in minutes, or schedule ahead for airport runs, recurring trips and tour pickups. Scheduled jobs are held and assigned closer to the time or by your dispatcher."],
  [Tag, "Fare estimates and pricing rules", "Base fare, distance and time rates, fixed prices for set routes, surcharges and promo codes. Your admin team changes them without a new app release."],
  [Users, "Driver matching and dispatch", "Nearest available driver, timed offers and manual assignment from the admin panel, with a fallback when a driver does not answer."],
  [CreditCard, "Payments and receipts", "Card and wallet payments through a gateway you choose, cash where you allow it, and a receipt for every completed trip."],
  [Bell, "Notifications and job links", "Push notifications for passengers and drivers, plus SMS or WhatsApp job links for drivers who work outside the app."],
  [History, "Booking history and support", "Every booking, status change and receipt in one searchable record, so your team can answer a customer in seconds."],
];

const DISPATCH: [string, string][] = [
  ["Request", "The passenger confirms a booking, now or scheduled."],
  ["Match", "Your rules pick the driver: nearest, offered to several, or assigned by a dispatcher."],
  ["Offer", "The driver sees pickup, drop-off and fare, and has a short time to accept."],
  ["Accept or retry", "If nobody accepts, the request moves to the next driver or to your dispatcher."],
  ["Track", "Both sides see live status until drop-off, then payment and rating."],
];

const INTEG: { t: string; what: string; eg: string[] }[] = [
  { t: "Maps and routing", what: "Route and distance for fares, address search and live driver position.", eg: ["Google Maps Platform", "Mapbox"] },
  { t: "Payments", what: "Card and wallet gateway, a cash option and receipts. Availability depends on your country.", eg: ["Stripe", "PayPal", "Square"] },
  { t: "Messaging", what: "Push notifications, SMS and WhatsApp job links for passengers and drivers.", eg: ["Twilio", "WhatsApp Business Platform", "Firebase Cloud Messaging"] },
  { t: "Operations", what: "The admin booking panel, driver and vehicle records and document expiry alerts, built into the platform itself.", eg: ["Built in, no third party needed"] },
];

function Body() {
  const { ask } = useShell();
  useSeo({
    title: TITLE, description: DESC, path: ROUTES.booking,
    ld: [crumbLd(CRUMBS), serviceLd("Taxi booking app development", DESC, ROUTES.booking, "Taxi booking app development"), faqLd(FAQS)],
  });
  const quote = () => ask("Request a taxi booking app quote", { kind: "Taxi booking app" });
  return (
    <>
      <section className="hero-l" id="top">
        <div className="wrap">
          <Crumbs items={CRUMBS} />
          <div className="grid2">
            <div>
              <p className="eyebrow">Taxi booking app development</p>
              <h1>Taxi Booking App Development That Turns Requests Into <em>Completed Rides</em></h1>
              <p className="sub">A booking app your passengers can use in seconds, with the fares, dispatch and payments behind it that keep your drivers busy and your customers informed.</p>
              <div className="hero-btns">
                <button type="button" className="btn btn-primary" onClick={quote}>Get a Booking App Quote</button>
                <button type="button" className="btn btn-outline" onClick={() => go("flow")}>See the Booking Flow</button>
              </div>
              <p className="caps" style={{ color: "#4b5878" }}>Scheduled rides &middot; Fare estimates &middot; Driver dispatch &middot; Payments</p>
            </div>
            <Pic label="A passenger booking screen with a ride confirmed card and live driver tracking" className="panel">
              <Scaled w={500} h={520}>
                <Phone style={{ position: "absolute", left: 262, top: 40, height: 480 }}><PassengerScreen /></Phone>
                <RideCard style={{ position: "absolute", left: 0, top: 300 }} />
                <LiveWidget style={{ position: "absolute", left: 24, top: 130 }} />
              </Scaled>
            </Pic>
          </div>
        </div>
      </section>

      <Flow />

      <section className="sec sec-gray" id="features" aria-labelledby="h-spec">
        <div className="wrap">
          <p className="eyebrow">What the booking system does</p>
          <h2 className="h2 wide" id="h-spec">Taxi booking app features that matter day to day</h2>
          <ul className="spec">
            {SPEC.map(([I, h, p]) => <li key={h}><span className="ic"><I size={21} /></span><h3>{h}</h3><p>{p}</p></li>)}
          </ul>
        </div>
      </section>

      <section className="sec sec-navy on-navy" id="dispatch" aria-labelledby="h-dsp">
        <div className="wrap">
          <p className="eyebrow">Behind the Book button</p>
          <h2 className="h2 wide" id="h-dsp">What happens after the passenger taps Book</h2>
          <p className="lede">A booking only works if a driver actually gets it. This is the path every request takes through the system.</p>
          <ol className="dsp" style={{ listStyle: "none", padding: 0 }}>
            {DISPATCH.map(([t, d], n) => <li key={t}><b>Step {n + 1}</b><h3>{t}</h3><p>{d}</p></li>)}
          </ol>
          <div className="more"><button type="button" className="btn btn-primary" onClick={quote}>Talk through your dispatch rules</button><Link className="link" to={ROUTES.dispatch} style={{ color: "#8fb2ff" }}>Taxi dispatch software for operators <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section className="sec sec-white" id="integrations" aria-labelledby="h-int">
        <div className="wrap">
          <div className="sh"><div>
          <p className="eyebrow">Integrations</p>
          <h2 className="h2 wide" id="h-int">Connect the booking app to the services you already use</h2>
          <p className="lede">Bookings can come from the app or be entered by your dispatcher, and both end up in the same place. Providers are chosen with you during the backend phase.</p>
          </div><Illus name="integrations" /></div>
          <ul className="techg intg">{INTEG.map(({ t, what, eg }) => <li key={t}><h3>{t}</h3><p>{what}</p><p className="eg">Examples</p><ul className="chips-t">{eg.map((x) => <li key={x}>{x}</li>)}</ul></li>)}</ul>
          <p className="note">These are examples of well-known providers, not partnerships or endorsements. The right choice depends on your country and volume, and we agree it with you.</p>
        </div>
      </section>

      <section className="sec sec-gray" id="example" aria-labelledby="h-ex">
        <div className="wrap hero-grid" style={{ paddingBlock: 0 }}>
          <div>
            <p className="eyebrow">Case study</p>
            <h2 className="h2 wide" id="h-ex">Built for airport transfers, fleets and tour operators</h2>
            <p className="lede">St Lu Taxi &amp; Tours is our case study: a design project for a St. Lucia operator offering fixed-price airport transfers, private tours and chauffeur service. The prototype shows a booking app, a driver app and a dispatcher panel working together.</p>
            <div className="more">
              <StluLink className="btn btn-primary" to="/">Open the St Lu prototype</StluLink>
              <StluLink className="btn btn-outline" to="/landing">View the St Lu website</StluLink>
            </div>
            <p className="note">The St Lu app is a clickable design prototype, not live client results.</p>
          </div>
          <Pic label="St Lu Taxi and Tours booking app prototype: an orange route on a map with a ride confirmed card" style={{ background: "linear-gradient(180deg,#fff0e2,#ffe0c6)", borderRadius: 24, padding: "24px 20px 0", overflow: "hidden" }}>
            <Scaled w={440} h={400}>
              <div style={{ position: "absolute", left: 0, top: 0, width: 440, height: 300, borderRadius: 18, overflow: "hidden" }}><RouteMap w={440} h={300} accent={STLU} style={{ width: 440, height: 300 }} /></div>
              <RideCard accent={STLU} style={{ position: "absolute", left: 94, top: 230 }} />
            </Scaled>
          </Pic>
        </div>
      </section>

      <Faq items={FAQS} onAsk={() => ask("Ask us a question")} heading="Taxi booking app questions, answered" />
      <section className="sec sec-white" aria-label="Related pages" style={{ paddingBlock: 36 }}>
        <div className="wrap"><p style={{ color: "#4b5878" }}>Related: <Link className="ref" to={ROUTES.dev}>taxi app development overview</Link> &middot; <Link className="ref" to={ROUTES.custom}>custom taxi app development</Link> &middot; <Link className="ref" to={ROUTES.whiteLabel}>white label taxi app</Link> &middot; <Link className="ref" to={ROUTES.uber}>Uber-like app development</Link></p></div>
      </section>
      <Related page="booking" />
      <FinalCta title="Ready to Build Your Taxi Booking App?" text="Tell us how your customers book today and where it breaks down. We will map the booking flow and dispatch rules for your business." startLabel="Get a Booking App Quote" consultLabel="Talk to Our Team" onStart={quote} onConsult={() => ask("Talk to our team", { kind: "Taxi booking app" })} />
    </>
  );
}

export default function TaxiBookingAppDevelopment() {
  return <Shell testId="page-tad-booking"><Body /></Shell>;
}
