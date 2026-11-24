import { useMemo, useState } from "react";
import { ArrowRight, Building2, Check, CreditCard, FileText, Globe2, Plug, Route, Accessibility, Headset, LayoutDashboard, Map, Navigation, Puzzle, Smartphone, Tag, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Crumbs, crumbLd, faqLd, serviceLd, useSeo } from "./seo";
import { Faq, FinalCta, Pic, Shell, go, useShell } from "./shell";
import { Scaled } from "./mockups";
import { ROUTES } from "./routes";
import { Related } from "./related";

const TITLE = "Custom Taxi App Development: Built Around Your Operation";
const DESC = "Custom taxi app development for operators with their own pricing, workflows and integrations. Compare custom vs white label, scope your app, request a quote.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Taxi App Development", to: ROUTES.dev }, { name: "Custom Taxi App Development", to: ROUTES.custom }];

const FAQS: [string, string][] = [
  ["What is custom taxi app development?", "It is building your taxi platform from your own requirements, rather than configuring an existing product. Your pricing rules, dispatch logic, screens and integrations are designed and engineered for how your business actually runs."],
  ["When is a custom taxi app better than white label?", "When something about your operation is not standard: unusual pricing, corporate accounts, dispatch rules, a brand experience that sets you apart, or systems you must connect to. If you mainly need to launch quickly with proven features, white label can be the better first step."],
  ["Who owns the code and the platform?", "Ownership, licensing and handover are agreed in writing before development starts, so there is no assumption on either side. Ask us about the terms you need and we will put them in the contract."],
  ["Can I start with a smaller first version?", "Yes, and we usually recommend it. A focused first release gets real trips running, and the modules you did not need on day one follow in later phases."],
  ["Can you connect the app to the systems we already use?", "Often, yes. Accounting, CRM, telephony and dispatch tools can be connected through their APIs. We check what each system offers during discovery, before we promise anything."],
  ["How do we decide what goes into the first release?", "Through a discovery workshop. The scope builder on this page is a starting point you can bring to it: tick the modules you think you need and we will challenge, trim and prioritise them with you."],
  ["How long will it take and what will it cost?", "It depends on the modules, integrations and how custom your rules are, so we do not quote a number before discovery. After discovery you get a phased plan with a schedule and a quote."],
];

const OPTS: { q: string; a: string[] }[] = [
  { q: "How unusual is your pricing?", a: ["Standard metered fares", "Zones and fixed routes", "Rules specific to my business"] },
  { q: "What do you need to connect to?", a: ["Only maps and payments", "A few extra tools", "My own systems (CRM, accounts, phones)"] },
  { q: "How much does your passenger experience set you apart?", a: ["Standard is fine", "It matters", "It is how we compete"] },
  { q: "What matters most for launch?", a: ["Speed to market", "A balance", "Exact fit to my operation"] },
];

function Decide() {
  const { ask } = useShell();
  const [ans, setAns] = useState<(number | null)[]>([null, null, null, null]);
  const done = ans.every((x) => x !== null);
  const score = ans.reduce<number>((a, b) => a + (b ?? 0), 0);
  const res = !done ? null : score <= 2
    ? { h: "White label is probably enough to start", p: "Your needs look close to a standard taxi platform. A white label solution can get you to market sooner. Custom work can still be added later for the parts that become important." }
    : score <= 5
    ? { h: "Either route could work, so start with discovery", p: "Your answers sit in the middle. A short discovery will show whether a configured base product covers you or whether the parts that differ justify custom development." }
    : { h: "Custom development is likely the better fit", p: "Your pricing, systems or customer experience go beyond a standard product. Building around them from the start avoids working against a platform that was not designed for you." };
  const summary = ans.map((v, i) => `${OPTS[i].q} ${v === null ? "-" : OPTS[i].a[v]}`).join("\n");
  return (
    <section className="sec sec-white" id="custom-vs-white-label" aria-labelledby="h-dec">
      <div className="wrap">
        <p className="eyebrow">Custom or white label?</p>
        <h2 className="h2 wide" id="h-dec">Is custom taxi app development right for you?</h2>
        <p className="lede">Four questions give a rule-of-thumb answer. It is a starting point for a conversation, not a quote.</p>
        <div className="decide">
          <form onSubmit={(e) => e.preventDefault()} aria-label="Custom or white label questions">
            {OPTS.map((o, qi) => (
              <fieldset key={o.q}>
                <legend>{qi + 1}. {o.q}</legend>
                <div className="opts">
                  {o.a.map((t, ai) => (
                    <label className="opt" key={t}><input type="radio" name={`q${qi}`} checked={ans[qi] === ai} onChange={() => setAns(ans.map((x, i) => (i === qi ? ai : x)))} /><span>{t}</span></label>
                  ))}
                </div>
              </fieldset>
            ))}
          </form>
          <div className="result" aria-live="polite">
            <p className="eyebrow">Our rule of thumb</p>
            {res ? (
              <>
                <h3>{res.h}</h3><p>{res.p}</p>
                <div className="more">
                  <button type="button" className="btn btn-primary" onClick={() => ask("Discuss custom or white label", { kind: score <= 2 ? "White label taxi app" : "Custom taxi app", notes: summary })}>Discuss this with us</button>
                  <Link className="link" to={ROUTES.whiteLabel}>See white label taxi app development <ArrowRight size={16} /></Link>
                </div>
              </>
            ) : <p>Answer all four questions to see a starting recommendation.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

const UIC = [Route, Building2, Headset, Globe2, Accessibility, Plug];
const USES: [string, string][] = [
  ["Fixed pricing for airports and tours", "Zone-to-zone and route-based prices, return trips and waiting time, shown to the customer before they confirm."],
  ["Corporate accounts and invoicing", "Company profiles, ride approvals, cost centres and monthly invoicing for business customers."],
  ["Dispatcher-first operations", "A console built around how your dispatchers work: manual assignment, outside drivers, job links by SMS or WhatsApp."],
  ["Several cities or service areas", "Separate pricing, drivers and rules per area, managed from one admin dashboard."],
  ["Special vehicles and passenger needs", "Vehicle classes, child seats, accessibility options and driver qualifications modelled as real rules."],
  ["Integration with your existing systems", "Accounting, CRM, telephony or fleet tools connected through their APIs, so your team keeps one source of truth."],
];

function Uses() {
  return (
    <section className="sec sec-gray" id="where-custom-pays-off" aria-labelledby="h-use">
      <div className="wrap">
        <p className="eyebrow">Where custom pays off</p>
        <h2 className="h2 wide" id="h-use">Situations that call for a custom taxi app</h2>
        <p className="lede">Custom development earns its extra effort where your business differs from the standard taxi playbook.</p>
        <ol className="uses" style={{ listStyle: "none", padding: 0 }}>
          {USES.map(([h, p], i) => <li className="use" key={h}>{(() => { const I = UIC[i]; return <span className="n" aria-hidden><I size={26} /></span>; })()}<h3>{h}</h3><p>{p}</p></li>)}
        </ol>
      </div>
    </section>
  );
}

const MODS: { g: string; items: [string, string][] }[] = [
  { g: "Apps", items: [["Passenger app", "iOS and Android"], ["Driver app", "iOS and Android"], ["Admin dashboard", "Web"], ["Dispatcher console", "Manual booking and assignment"]] },
  { g: "Pricing and booking", items: [["Fixed-price routes and zones", "Airports, tours"], ["Scheduled rides", "Book ahead"], ["Promo codes", "Offers and discounts"], ["Corporate accounts", "Approvals and invoicing"]] },
  { g: "Operations", items: [["Several cities or areas", "Own pricing per area"], ["Document expiry alerts", "Drivers and vehicles"], ["Multi-language", "Apps and messages"], ["Ratings and reviews", "Two-way feedback"]] },
  { g: "Connections", items: [["Payment gateway", "Cards and wallets"], ["SMS and WhatsApp job links", "For drivers"], ["Your CRM or accounting system", "Through its API"], ["Analytics and reports", "Trips, revenue, drivers"]] },
];
const DEFAULT_MODS = ["Passenger app", "Driver app", "Admin dashboard"];

function Scope() {
  const { ask } = useShell();
  const [sel, setSel] = useState<string[]>(DEFAULT_MODS);
  const toggle = (n: string) => setSel((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  const ordered = useMemo(() => MODS.flatMap((g) => g.items.map(([n]) => n)).filter((n) => sel.includes(n)), [sel]);
  return (
    <section className="sec sec-navy" id="scope" aria-labelledby="h-scope">
      <div className="wrap">
        <p className="eyebrow">Scope builder</p>
        <h2 className="h2 wide" id="h-scope">Sketch the scope of your custom taxi app</h2>
        <p className="lede">Tick the modules you think you need. We will use your list as the starting point for discovery, then challenge and prioritise it with you.</p>
        <div className="scope">
          <form onSubmit={(e) => e.preventDefault()} aria-label="Choose modules for your taxi app">
            {MODS.map((g) => (
              <fieldset key={g.g}>
                <legend>{g.g}</legend>
                <div className="mods">
                  {g.items.map(([n, d]) => (
                    <label className="mod" key={n}><input type="checkbox" checked={sel.includes(n)} onChange={() => toggle(n)} /><span className="bx" aria-hidden><Check size={14} /></span><span className="tx">{n}<small>{d}</small></span></label>
                  ))}
                </div>
              </fieldset>
            ))}
          </form>
          <aside className="sum" aria-live="polite" aria-label="Your scope">
            <h3>Your scope: {ordered.length} {ordered.length === 1 ? "module" : "modules"}</h3>
            {ordered.length ? <ul>{ordered.map((n) => <li key={n}><Check size={16} aria-hidden />{n}</li>)}</ul> : <p className="empty">Nothing selected yet.</p>}
            <button type="button" className="btn btn-primary" disabled={!ordered.length} onClick={() => ask("Request a quote for this scope", { kind: "Custom taxi app", notes: `Scope I have in mind:\n${ordered.map((n) => `- ${n}`).join("\n")}` })}>Request a quote for this scope</button>
            <p className="fine">No price is calculated here. A real quote follows discovery.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

const PHASES: [string, string, string[]][] = [
  ["Discovery workshop", "Goals, users, constraints and the systems you already run.", ["Requirements list", "Prioritised scope", "Definition of the first release"]],
  ["Architecture and plan", "How the pieces fit, and what connects to what.", ["Architecture outline", "Integration list", "Phased plan and schedule"]],
  ["UX and UI design", "Every screen for passengers, drivers and admins.", ["User flows", "Clickable prototype", "UI kit in your brand"]],
  ["Build in iterations", "Apps and backend built in stages you can try.", ["Working builds to test", "Admin dashboard", "Integrations connected"]],
  ["QA and hardening", "Tested on devices and in realistic trip scenarios.", ["Test results and fixes", "Failed-payment and cancellation cases", "Release checklist"]],
  ["Launch and handover", "Store release, go-live support and a clean handover.", ["Released apps", "Admin training", "Documentation as agreed"]],
];

function Phases() {
  return (
    <section className="sec sec-white" id="how-a-custom-build-runs" aria-labelledby="h-ph">
      <div className="wrap">
        <p className="eyebrow">How a custom build runs</p>
        <h2 className="h2 wide" id="h-ph">Six phases, and what you hold at the end of each</h2>
        <ol className="phs" style={{ listStyle: "none", padding: 0 }}>
          {PHASES.map(([t, d, gets], i) => (
            <li className="ph" key={t}>
              <span className="n" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
              <div><h3><span className="sr">Phase {i + 1}: </span>{t}</h3><p>{d}</p></div>
              <div className="get"><b>You get</b><ul>{gets.map((g) => <li key={g}>{g}</li>)}</ul></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Arch() {
  return (
    <section className="sec sec-gray" id="architecture" aria-labelledby="h-arch">
      <div className="wrap">
        <p className="eyebrow">Architecture</p>
        <h2 className="h2 wide" id="h-arch">A custom taxi platform is built in clear layers</h2>
        <p className="lede">Keeping the apps, the core services and your connections separate is what lets a custom platform grow without being rewritten.</p>
        <Pic label="Architecture of a custom taxi platform: apps on top, core services in the middle, external connections below" className="arch">
          <div className="lbl">Apps</div>
          <div className="row apps"><span>Passenger app</span><span>Driver app</span><span>Admin dashboard</span><span>Dispatcher console</span></div>
          <div className="bar" aria-hidden><Navigation size={18} style={{ transform: "rotate(180deg)" }} /></div>
          <div className="lbl">Core services</div>
          <div className="row core"><span>Booking</span><span>Dispatch</span><span>Pricing</span><span>Payments</span><span>Notifications</span><span>Accounts</span></div>
          <div className="bar" aria-hidden><Navigation size={18} style={{ transform: "rotate(180deg)" }} /></div>
          <div className="lbl">Your connections</div>
          <div className="row"><span>Maps</span><span>Payment gateway</span><span>SMS / WhatsApp</span><span>CRM / accounting</span><span>Analytics</span></div>
        </Pic>
        <p className="note">Ownership, licensing and handover of the code are agreed in writing before development starts.</p>
      </div>
    </section>
  );
}

const TILES: [string, typeof Smartphone, number, number][] = [
  ["Passenger app", Smartphone, 8, 24], ["Driver app", Navigation, 338, 8], ["Admin dashboard", LayoutDashboard, 360, 170],
  ["Pricing rules", Tag, 6, 170], ["Dispatch logic", Users, 24, 330], ["Payments", CreditCard, 190, 350], ["Your systems", Map, 340, 320], ["Reports", FileText, 190, 14],
];

function Body() {
  const { ask } = useShell();
  useSeo({
    title: TITLE, description: DESC, path: ROUTES.custom,
    ld: [crumbLd(CRUMBS), serviceLd("Custom taxi app development", DESC, ROUTES.custom, "Custom taxi app development"), faqLd(FAQS)],
  });
  return (
    <>
      <section className="hero hero-b" id="top">
        <div className="wrap">
          <Crumbs items={CRUMBS} dark />
          <div className="grid2">
            <div>
              <p className="eyebrow light">Custom taxi app development</p>
              <h1>Custom Taxi App Development Built Around <em>Your Operation</em></h1>
              <p className="sub">When your pricing, dispatch rules or customer experience are what set you apart, a standard product gets in the way. We design and build the taxi platform around how you actually work.</p>
              <div className="hero-btns">
                <button type="button" className="btn btn-primary" onClick={() => ask("Request a custom taxi app quote", { kind: "Custom taxi app" })}>Request a Custom Quote</button>
                <button type="button" className="btn btn-ghost-dark" onClick={() => go("scope")}>Build Your Scope</button>
              </div>
            </div>
            <Pic label="Modules of a custom taxi platform arranged around a single core: apps, pricing rules, dispatch logic, payments, reports and your own systems">
              <Scaled w={520} h={420}>
                <svg width="520" height="420" viewBox="0 0 520 420" style={{ position: "absolute", inset: 0 }} role="presentation">
                  {TILES.map(([n, , x, y]) => <line key={n} x1="260" y1="210" x2={x + 70} y2={y + 22} stroke="#2b63ff" strokeWidth="2" strokeDasharray="5 6" strokeOpacity=".7" />)}
                </svg>
                {TILES.map(([n, I, x, y]) => <span key={n} className="mod-t" style={{ left: x, top: y }}><I size={17} />{n}</span>)}
                <span className="mod-t core" style={{ left: 168, top: 182 }}><Puzzle size={20} />Your platform</span>
              </Scaled>
            </Pic>
          </div>
        </div>
      </section>
      <Decide />
      <Uses />
      <Scope />
      <Phases />
      <Arch />
      <Faq items={FAQS} onAsk={() => ask("Ask us a question")} heading="Custom taxi app development questions, answered" />
      <Related page="custom" />
      <FinalCta title="Ready to Scope Your Custom Taxi App?" text="Bring your scope list, your pricing rules and the systems you use. We will turn them into a phased plan and a quote." startLabel="Request a Custom Quote" consultLabel="Book a Discovery Call" onStart={() => ask("Request a custom taxi app quote", { kind: "Custom taxi app" })} onConsult={() => ask("Book a discovery call", { kind: "Custom taxi app" })} />
    </>
  );
}

export default function CustomTaxiAppDevelopment() {
  return <Shell testId="page-tad-custom"><Body /></Shell>;
}
