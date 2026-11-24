import { useState } from "react";
import { Ic } from "./sectionicons";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, FileText, Headset, Smartphone, Users } from "lucide-react";
import { AdminDash, DriverScreen, Phone, RouteMap, Scaled } from "./mockups";
import { Crumbs, crumbLd, faqLd, serviceLd, useSeo } from "./seo";
import { Faq, FinalCta, Pic, Shell, Tick, go, useShell } from "./shell";
import { ROUTES } from "./routes";
import { Related } from "./related";

const TITLE = "Taxi Dispatch Software: Dispatcher Console & Fleet Tracking";
const DESC = "Taxi dispatch software for fleets: dispatcher console, auto and manual driver assignment, zones and live fleet tracking. See how dispatch works.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Taxi App Development", to: ROUTES.dev }, { name: "Taxi Dispatch Software", to: ROUTES.dispatch }];

const FAQS: [string, string][] = [
  ["What is taxi dispatch software?", "It is the system a dispatcher or fleet manager uses to receive bookings, assign them to drivers, follow trips live and handle problems. It includes a dispatcher console, a driver app that receives jobs, and the backend that connects them."],
  ["What is the difference between manual and automatic dispatch?", "In manual dispatch a person picks the driver for each job. In automatic dispatch the system picks or offers the job by rules such as nearest available driver. Most fleets use a mix: automatic by default and a dispatcher who can override or reassign."],
  ["Can drivers who do not use the app still receive jobs?", "Yes. Job links by SMS or WhatsApp can reach drivers who work outside the app, and the dispatcher can still track the job status."],
  ["Can dispatchers create bookings for phone customers?", "Yes. The console can create a booking on a customer's behalf and assign it, so phone and walk-in bookings sit in the same queue as app bookings."],
  ["Does taxi dispatch software include fleet management?", "It can. Driver and vehicle records, document expiry alerts, shifts and availability are part of running dispatch well, and we include them in the admin side of the platform."],
  ["How does dispatch connect to the passenger booking app?", "Bookings from the passenger app enter the same job queue the dispatcher sees. See taxi booking app development for the passenger side, and this page for the operator side."],
  ["Can I start with dispatch and add a passenger app later?", "Yes. Many fleets start with the dispatcher console and driver app, then add a passenger app when they are ready. The platform is built in modular parts."],
];

type Job = { id: string; t: string; from: string; to: string; time: string; src: string };
type Drv = { id: string; n: string; car: string; km: number; busy: boolean };
const JOBS: Job[] = [
  { id: "j1", t: "Airport pickup", from: "Airport, Arrivals", to: "Harbour Hotel", time: "14:10", src: "App booking" },
  { id: "j2", t: "Hotel to Rodney Bay", from: "Marina Hotel", to: "Rodney Bay", time: "14:25", src: "Phone booking" },
  { id: "j3", t: "Town transfer", from: "Old Town Market", to: "Soufriere", time: "14:40", src: "App booking" },
];
const DRIVERS: Drv[] = [
  { id: "d1", n: "Marcus J.", car: "Toyota Noah", km: 1.2, busy: false },
  { id: "d2", n: "Alicia R.", car: "Nissan Note", km: 2.9, busy: false },
  { id: "d3", n: "Devon P.", car: "Kia Sorento", km: 4.1, busy: true },
];
const DOT: Record<string, [number, number]> = { d1: [120, 130], d2: [250, 70], d3: [320, 170], j1: [90, 60], j2: [200, 160], j3: [310, 50] };

function Board() {
  const [sel, setSel] = useState<string>("j1");
  const [asg, setAsg] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("Select a job, then assign a driver or use auto-assign.");
  const jobOf = (id: string) => JOBS.find((j) => j.id === id)!;
  const drvOf = (id: string) => DRIVERS.find((d) => d.id === id)!;
  const taken = new Set(Object.values(asg));
  const free = (d: Drv) => !d.busy && !taken.has(d.id);
  const assign = (jid: string, did: string) => { setAsg((a) => ({ ...a, [jid]: did })); setMsg(`${drvOf(did).n} assigned to ${jobOf(jid).t}. The job is sent to the driver app.`); };
  const auto = () => {
    const c = DRIVERS.filter(free).sort((a, b) => a.km - b.km)[0];
    if (!c) { setMsg("No driver is free. The job stays in the queue until one becomes available."); return; }
    assign(sel, c.id);
  };
  const unassign = () => { const d = asg[sel]; if (!d) return; setAsg(({ [sel]: _x, ...rest }) => rest); setMsg(`${jobOf(sel).t} is back in the queue.`); };
  const reset = () => { setAsg({}); setSel("j1"); setMsg("Board reset."); };
  const cur = asg[sel];
  return (
    <section className="sec sec-gray" id="board" aria-labelledby="h-board">
      <div className="wrap">
        <p className="eyebrow">Try it</p>
        <h2 className="h2 wide" id="h-board">A taxi dispatch board you can try</h2>
        <p className="lede">Sample jobs and drivers. Pick a job, then assign a driver yourself or let the system choose the nearest free one.</p>
        <div className="board">
          <div className="bp">
            <h3>Job queue</h3>
            {JOBS.map((j) => (
              <button key={j.id} type="button" className="bi" aria-pressed={sel === j.id} onClick={() => setSel(j.id)}>
                <strong>{j.t}</strong><span className="s">{j.time} &middot; {j.from} &rarr; {j.to}</span>
                <span className={`badge ${asg[j.id] ? "b-ok" : "b-new"}`}>{asg[j.id] ? `Assigned: ${drvOf(asg[j.id]).n}` : `Unassigned · ${j.src}`}</span>
              </button>
            ))}
          </div>
          <div className="bp">
            <h3>Drivers</h3>
            {DRIVERS.map((d) => {
              const used = taken.has(d.id);
              return (
                <div className="drv" key={d.id}>
                  <div className="who"><strong>{d.n}</strong><span className="s">{d.car} &middot; {d.km} km away</span><span className={`badge ${d.busy || used ? "b-busy" : "b-ok"}`}>{d.busy ? "On a trip" : used ? "Assigned" : "Available"}</span></div>
                  <button type="button" className="btn btn-outline" disabled={!free(d) || !!cur} onClick={() => assign(sel, d.id)} aria-label={`Assign ${d.n} to ${jobOf(sel).t}`}>Assign</button>
                </div>
              );
            })}
            <div className="bar2">
              <button type="button" className="btn btn-primary btn-sm" onClick={auto} disabled={!!cur}>Auto-assign nearest</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={unassign} disabled={!cur}>Unassign</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={reset}>Reset</button>
            </div>
          </div>
          <div className="bp bmapc">
            <h3>Live map</h3>
            <Pic label="Sample live map with driver positions and job pickup points" className="bmap">
              <Scaled w={380} h={240}>
                <RouteMap w={380} h={240} route={false} style={{ position: "absolute", left: 0, top: 0, width: 440, height: 300 }} />
                {Object.entries(DOT).map(([k, [x, y]]) => {
                  const isJob = k.startsWith("j");
                  const on = isJob ? sel === k : taken.has(k);
                  return <span key={k} style={{ position: "absolute", left: x - 11, top: y - 11, width: 22, height: 22, borderRadius: isJob ? "6px" : "50%", background: isJob ? (on ? "#ea6a12" : "#fff") : (on ? "#0e8f4a" : DRIVERS.find((d) => d.id === k)!.busy ? "#8a94b1" : "#2b63ff"), border: `3px solid ${isJob ? "#ea6a12" : "#fff"}`, boxShadow: "0 4px 10px rgba(10,19,48,.35)", display: "block" }} />;
                })}
              </Scaled>
            </Pic>
            <p style={{ fontSize: 13, color: "var(--mute)", marginTop: 8 }}>Squares are pickups, circles are drivers.</p>
          </div>
        </div>
        <p className="bstat" role="status" aria-live="polite">{msg}</p>
      </div>
    </section>
  );
}

const MODES: [string, string, string, string][] = [
  ["Manual", "A dispatcher chooses the driver for each job.", "Small fleets, special jobs, VIP and phone customers.", "Full control and judgement, but the dispatcher is the bottleneck."],
  ["Nearest available driver", "The system offers the job to the closest free driver, who has a short time to accept.", "On-demand city taxis.", "Fast response without a person in the loop."],
  ["Offer to several drivers", "The job goes to a group and the first to accept gets it.", "Busy areas with many drivers.", "Quick acceptance, with a clear rule for who wins."],
  ["Zone queue", "Drivers wait in a queue for a zone, such as an airport, and jobs go out in order.", "Airports, stations and ranks.", "Fair turns and an orderly pickup area."],
];
const LIFE = ["New", "Assigned", "Accepted", "On the way", "Arrived", "In progress", "Completed"];
const EXC: [string, string][] = [
  ["No driver accepts", "The job moves to the next driver or returns to the dispatcher with an alert."],
  ["Passenger cancels", "The driver is told straight away and the job closes with a reason."],
  ["Driver drops out", "The dispatcher reassigns the job and the passenger sees the new driver."],
];
const REPORTS = ["Acceptance rate by driver", "Response and arrival times", "Cancellations and reasons", "Driver and vehicle utilisation", "Jobs by source and zone", "Document expiry and compliance"];

function Body() {
  const { ask } = useShell();
  useSeo({ title: TITLE, description: DESC, path: ROUTES.dispatch, ld: [crumbLd(CRUMBS), serviceLd("Taxi dispatch software", DESC, ROUTES.dispatch, "Taxi dispatch software development"), faqLd(FAQS)] });
  const quote = () => ask("Plan your dispatch software", { kind: "Custom taxi app" });
  return (
    <>
      <section className="hero" id="top">
        <div className="wrap">
          <Crumbs items={CRUMBS} dark />
          <div className="hero-grid" style={{ paddingTop: 10 }}>
            <div>
              <p className="eyebrow light">Taxi dispatch software</p>
              <h1>Taxi Dispatch Software for Fleets That Run on <em>Fast Decisions</em></h1>
              <p className="sub">A dispatcher console, a driver app and the rules between them: assign jobs automatically or by hand, watch every driver on the map, and handle problems before passengers notice.</p>
              <div className="hero-btns">
                <button type="button" className="btn btn-primary" onClick={quote}>Plan Your Dispatch System</button>
                <button type="button" className="btn btn-ghost-dark" onClick={() => go("board")}>Try the Dispatch Board</button>
              </div>
            </div>
            <Pic label="Taxi dispatch dashboard with drivers, active trips and bookings, next to a driver app showing a new job">
              <Scaled w={600} h={470}>
                <div style={{ position: "absolute", left: 0, top: 30, borderRadius: 16, overflow: "hidden", boxShadow: "0 30px 70px -20px rgba(0,0,0,.65)" }}><AdminDash w={560} title="Dispatch" /></div>
                <Phone style={{ position: "absolute", left: 400, top: 90, transform: "scale(.88)", transformOrigin: "0 0" }}><DriverScreen /></Phone>
              </Scaled>
            </Pic>
          </div>
        </div>
      </section>

      <section className="sec sec-white" id="modes" aria-labelledby="h-modes">
        <div className="wrap">
          <p className="eyebrow">Dispatch modes</p>
          <h2 className="h2 wide" id="h-modes">Four ways to assign a taxi job, and when each fits</h2>
          <table className="tbl">
            <caption className="sr">Taxi dispatch modes compared</caption>
            <thead><tr><th scope="col">Mode</th><th scope="col">How it works</th><th scope="col">Best for</th><th scope="col">Trade-off</th></tr></thead>
            <tbody>{MODES.map(([m, h, b, t]) => <tr key={m}><th scope="row">{m}</th><td data-label="How it works">{h}</td><td data-label="Best for">{b}</td><td data-label="Trade-off">{t}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <Board />

      <section className="sec sec-white" id="console" aria-labelledby="h-con">
        <div className="wrap">
          <p className="eyebrow">What you get</p>
          <h2 className="h2 wide" id="h-con">The dispatcher console and fleet tools behind it</h2>
          <div className="two">
            <div><h3>Dispatcher console</h3><p className="d">Everything a dispatcher needs on one screen.</p><Tick items={["Live job queue with search and filters", "Live map of drivers and jobs", "Assign, reassign and override", "Create bookings for phone customers", "Notes and special instructions", "Alerts for unassigned and late jobs"]} /></div>
            <div><h3>Fleet management</h3><p className="d">The records that keep dispatch running.</p><Tick items={["Driver and vehicle records", "Document expiry alerts", "Availability and shifts", "Vehicle types and capacity", "Driver status: online, busy, offline", "Trip history per driver and vehicle"]} /></div>
          </div>
        </div>
      </section>

      <section className="sec sec-gray" id="lifecycle" aria-labelledby="h-life">
        <div className="wrap">
          <p className="eyebrow">Job lifecycle</p>
          <h2 className="h2 wide" id="h-life">Every job moves through clear states</h2>
          <p className="lede">Clear states let dispatchers see where each job is, and let the system react when something goes wrong.</p>
          <ol className="lc" style={{ listStyle: "none", padding: 0 }} aria-label="Job states">{LIFE.map((s) => <li key={s}><span>{s}</span></li>)}</ol>
          <ul className="exc" style={{ listStyle: "none", padding: 0 }}>{EXC.map(([h, p], i) => <li key={h}><Ic set="exc" i={i} size={20} /><h3>{h}</h3><p>{p}</p></li>)}</ul>
        </div>
      </section>

      <section className="sec sec-white" id="channels" aria-labelledby="h-chan">
        <div className="wrap">
          <p className="eyebrow">Channels into dispatch</p>
          <h2 className="h2 wide" id="h-chan">Every booking channel lands in one queue</h2>
          <ul className="fit4 c4" style={{ listStyle: "none", padding: 0 }}>
            <li><Smartphone size={22} color="#2b63ff" aria-hidden /><h3 style={{ marginTop: 10 }}>Passenger app</h3><p>On-demand and scheduled bookings enter the queue automatically.</p></li>
            <li><Headset size={22} color="#2b63ff" aria-hidden /><h3 style={{ marginTop: 10 }}>Phone and walk-in</h3><p>Dispatchers enter the booking and assign it from the same console.</p></li>
            <li><Bell size={22} color="#2b63ff" aria-hidden /><h3 style={{ marginTop: 10 }}>SMS and WhatsApp</h3><p>Job links reach drivers who work outside the app.</p></li>
            <li><Users size={22} color="#2b63ff" aria-hidden /><h3 style={{ marginTop: 10 }}>Business accounts</h3><p>Company bookings arrive with account details attached.</p></li>
          </ul>
        </div>
      </section>

      <section className="sec sec-navy on-navy" id="reports" aria-labelledby="h-rep">
        <div className="wrap">
          <p className="eyebrow">Control and reports</p>
          <h2 className="h2 wide" id="h-rep">Measure dispatch so you can improve it</h2>
          <p className="lede">The admin side turns every job into data for managers, so decisions about drivers, zones and rules rest on what happened.</p>
          <ul className="fit4 c3" style={{ listStyle: "none", padding: 0 }}>
            {REPORTS.map((r) => <li key={r} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)" }}><h3 style={{ color: "#fff", fontSize: 16, display: "flex", gap: 10, alignItems: "center" }}><FileText size={18} color="#22d3ee" aria-hidden />{r}</h3></li>)}
          </ul>
          <div className="more">
            <Link className="link" to={ROUTES.booking}>See the passenger booking side <ArrowRight size={16} /></Link>
            <Link className="link" to={ROUTES.custom}>Custom dispatch rules <ArrowRight size={16} /></Link>
            <Link className="link" to={ROUTES.whiteLabel}>Start with white label <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="sec sec-white" id="accounts" aria-labelledby="h-acc">
        <div className="wrap">
          <p className="eyebrow">Back office</p>
          <h2 className="h2 wide" id="h-acc">Accounts, invoicing and driver payouts</h2>
          <p className="lede">Dispatch does not end when the job is complete. Operators also need to bill customers and settle with drivers, and the dispatch system is where the data for both already lives.</p>
          <div className="split2">
            <div><h3>Customer billing</h3><Tick items={["Corporate or account customers with invoiced rides", "Fare, extras and waiting time recorded against each job", "Receipts and exportable trip records"]} /></div>
            <div><h3>Driver settlement</h3><Tick items={["Earnings per driver and per period", "Commission rules for independent drivers and partners", "Cash and card jobs reconciled separately"]} /></div>
          </div>
          <p className="note">Which of these you need depends on how you charge and pay. We confirm it during scoping, and it affects the <Link to={ROUTES.cost}>cost of the platform</Link>.</p>
        </div>
      </section>

      <Faq items={FAQS} onAsk={() => ask("Ask us a question", { kind: "Custom taxi app" })} heading="Taxi dispatch software questions, answered" />
      <Related page="dispatch" />
      <FinalCta title="Ready to Take Control of Your Dispatch?" text="Tell us about your fleet, your dispatchers and the way jobs reach them today. We will map the dispatch rules and the console to your operation." startLabel="Plan Your Dispatch System" consultLabel="Request a Consultation" onStart={quote} onConsult={() => ask("Request a consultation", { kind: "Custom taxi app" })} />
    </>
  );
}

export default function TaxiDispatchSoftware() {
  return <Shell testId="page-tad-dispatch"><Body /></Shell>;
}
