import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Car, LayoutDashboard, Server, Smartphone } from "lucide-react";
import { Crumbs, crumbLd, useSeo, webPageLd } from "./seo";
import { FinalCta, Shell, useShell } from "./shell";
import { ROUTES } from "./routes";
import { Related } from "./related";

const TITLE = "Taxi App Features: Passenger, Driver, Admin, Backend";
const DESC = "Every taxi app feature in one catalogue: passenger booking, driver tools, admin dashboard and backend services, so you can pick what your first release needs.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Features", to: ROUTES.features }];

type Cat = "passenger" | "driver" | "admin" | "backend";
const CATS: { id: Cat; label: string; icon: typeof Smartphone; blurb: string }[] = [
  { id: "passenger", label: "Passenger app", icon: Smartphone, blurb: "Everything a rider needs to book, pay and travel." },
  { id: "driver", label: "Driver app", icon: Car, blurb: "Tools that keep drivers earning and jobs moving." },
  { id: "admin", label: "Admin and dispatch", icon: LayoutDashboard, blurb: "How your team runs the fleet day to day." },
  { id: "backend", label: "Backend", icon: Server, blurb: "The services working behind every ride." },
];

const F: [Cat, string, string][] = [
  ["passenger", "Sign-up and profile", "Phone or email sign-up, saved places and payment methods."],
  ["passenger", "Booking flow", "Pickup and drop-off, vehicle choice and a clear fare estimate before booking."],
  ["passenger", "Scheduled rides", "Book now or for later, including airport pickups at a set time."],
  ["passenger", "Live tracking", "See the driver arrive on the map and share the trip with someone."],
  ["passenger", "Payments", "Card, wallet or cash, with receipts after each trip."],
  ["passenger", "Ratings and history", "Rate the driver, review past trips and rebook a favourite route."],
  ["passenger", "Promo codes", "Discounts and referral rewards you can switch on or off."],
  ["passenger", "Notifications", "Push, SMS or WhatsApp updates at each stage of the trip."],
  ["driver", "Driver onboarding", "Profile, vehicle details and document upload, reviewed by your team."],
  ["driver", "Online and offline", "Go online to receive jobs and go offline when finished."],
  ["driver", "Job requests", "Accept or decline a job with pickup, drop-off and fare shown."],
  ["driver", "Navigation", "Turn-by-turn directions to the passenger and the destination."],
  ["driver", "Trip stages", "One tap for on the way, arrived, trip started and completed."],
  ["driver", "Earnings", "Daily and weekly earnings, trip history and payout status."],
  ["driver", "Driver ratings", "Passenger feedback the driver can read and act on."],
  ["admin", "Dispatcher console", "A live queue of jobs with search, filters and status."],
  ["admin", "Manual and auto-assign", "Pick a driver yourself or let the nearest free driver be assigned."],
  ["admin", "Live fleet map", "Every driver and active trip on one map."],
  ["admin", "Fares and zones", "Set base fares, per-kilometre rates, zones and fixed prices."],
  ["admin", "Driver and vehicle management", "Approve drivers, check documents and manage vehicles."],
  ["admin", "Reports", "Trips, revenue and driver performance over any period."],
  ["admin", "Customer support tools", "Look up a trip, adjust a fare and issue a refund."],
  ["backend", "Maps and routing", "Distance, route and arrival time from a mapping service."],
  ["backend", "Matching and dispatch rules", "The logic that decides which driver gets which job."],
  ["backend", "Payment processing", "Secure card payments, payouts and receipts through a gateway."],
  ["backend", "Messaging", "SMS, WhatsApp and push notifications."],
  ["backend", "Roles and permissions", "Passengers, drivers, dispatchers and admins see only their own tools."],
  ["backend", "Security and backups", "Encrypted connections, access control and regular backups."],
];

function Body() {
  const { ask } = useShell();
  const [cat, setCat] = useState<Cat | "all">("all");
  useSeo({ title: TITLE, description: DESC, path: ROUTES.features, ld: [crumbLd(CRUMBS), webPageLd(TITLE, DESC, ROUTES.features)] });
  const shown = CATS.filter((c) => cat === "all" || c.id === cat);
  return (
    <>
      <section className="hero hero-l hero-svc" id="top">
        <div className="wrap">
          <Crumbs items={CRUMBS} />
          <p className="eyebrow">Features</p>
          <h1>Taxi App Features: <em>Choose What Your First Release Needs</em></h1>
          <p className="sub">Every feature a taxi platform can include, grouped by who uses it. Not every project needs all of them. We help you pick the must-haves and leave the rest for later.</p>
          <div className="hero-btns">
            <button type="button" className="btn btn-primary" onClick={() => ask("Discuss features", { kind: "Not sure yet" })}>Discuss Your Features</button>
            <Link className="btn btn-outline" to={ROUTES.pricing}>See Pricing</Link>
          </div>
        </div>
      </section>

      <section className="sec sec-white" id="catalogue" aria-labelledby="h-cat">
        <div className="wrap">
          <p className="eyebrow">Feature catalogue</p>
          <h2 className="h2 wide" id="h-cat">{F.length} features across four parts of the platform</h2>
          <div className="feat-filter" role="group" aria-label="Filter features">
            <button type="button" className={cat === "all" ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"} aria-pressed={cat === "all"} onClick={() => setCat("all")}>All</button>
            {CATS.map((c) => <button key={c.id} type="button" className={cat === c.id ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</button>)}
          </div>
          {shown.map((c) => (
            <div key={c.id} className="feat-grp" id={c.id}>
              <h3><c.icon size={22} color="#2b63ff" aria-hidden /> {c.label}</h3>
              <p className="lede" style={{ margin: "4px 0 14px" }}>{c.blurb}</p>
              <ul className="feat-list">{F.filter((f) => f[0] === c.id).map(([, t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}</ul>
            </div>
          ))}
          <div className="more">
            <Link className="link" to={ROUTES.booking}>See the booking flow in detail <ArrowRight size={16} aria-hidden /></Link>
            <Link className="link" to={ROUTES.dispatch}>See dispatch tools <ArrowRight size={16} aria-hidden /></Link>
            <Link className="link" to={ROUTES.custom}>Add custom features <ArrowRight size={16} aria-hidden /></Link>
          </div>
        </div>
      </section>

      <Related page="features" />
      <FinalCta title="Tell Us Which Features Matter Most" text="Send a short list. We reply with a suggested first scope and what can wait." startLabel="Discuss Your Features" consultLabel="Request a Demo" onStart={() => ask("Discuss features", { kind: "Not sure yet" })} onConsult={() => ask("Request a demo", { kind: "Request a demo" })} />
    </>
  );
}

export default function Features() {
  return <Shell testId="page-tad-features"><Body /></Shell>;
}
