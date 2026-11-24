import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Crumbs, crumbLd, faqLd, serviceLd, useSeo } from "./seo";
import { Faq, FinalCta, Pic, Shell, Tick, go, useShell } from "./shell";
import { ROUTES } from "./routes";
import { Related } from "./related";

const TITLE = "Taxi App Development Cost: What Drives the Budget";
const DESC = "Taxi app development cost explained: the factors that move the budget, white label vs custom, hidden running costs and a scope tool to size your project.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Taxi App Development", to: ROUTES.dev }, { name: "Taxi App Development Cost", to: ROUTES.cost }];

const FAQS: [string, string][] = [
  ["How much does taxi app development cost?", "There is no single number, and anyone quoting one without asking about your scope is guessing. Cost follows scope: how many apps, which features, how many integrations, how custom the design and rules are, and whether you start from a white label product. Send us your scope and we will give you a written estimate."],
  ["Why is a taxi app more expensive than a simple app?", "Because it is several products working in real time: a passenger app, a driver app and an admin dashboard, joined by a backend that handles live location, matching, pricing and payments. Each part needs design, build and testing."],
  ["Is white label cheaper than custom taxi app development?", "Usually the upfront cost is lower and launch is faster, because the product already exists. Custom development costs more at the start but is shaped around your rules. The cheaper route over time depends on how much you would otherwise need to change."],
  ["What costs come after the app is built?", "Mapping and routing usage, SMS or WhatsApp messages, payment processing fees, hosting, app store developer accounts, and maintenance or support. These are charged by providers or planned separately and are not part of the build."],
  ["Can I reduce the cost of a taxi app?", "Yes: launch one city first, keep the first release to must-have features, start from white label where your needs are standard, and add the rest after you see real trips. A tight scope is the largest lever."],
  ["What is an MVP taxi app and does it save money?", "A minimum viable product is the smallest release that lets real passengers and drivers complete trips. It saves money because you build what matters first and use real usage to decide what comes next."],
  ["Do you give fixed prices?", "After discovery we can scope a fixed set of deliverables so you know what is included. Changes beyond that scope are agreed before work starts. We do not publish a price list because scope varies too much for one to be honest."],
  ["How can I get an accurate estimate?", "Use the scope tool on this page to organise your requirements, then send it to us. A short call to clarify the details lets us return a written estimate with what is and is not included."],
];

type Opt = { id: string; label: string; w: number; note?: string };
const APPROACH: Opt[] = [{ id: "wl", label: "White label base", w: 1, note: "Starting from a finished product" }, { id: "hy", label: "White label plus custom parts", w: 3, note: "Ready product with extra work" }, { id: "cu", label: "Fully custom build", w: 5, note: "Designed around your operation" }];
const PLATFORM: Opt[] = [{ id: "one", label: "One mobile platform", w: 1 }, { id: "both", label: "iOS and Android", w: 2 }];
const APPS: Opt[] = [{ id: "pa", label: "Passenger app", w: 2 }, { id: "da", label: "Driver app", w: 2 }, { id: "ad", label: "Admin and dispatch dashboard", w: 2 }, { id: "co", label: "Corporate booking portal", w: 2 }];
const FEATS: Opt[] = [{ id: "sch", label: "Scheduled rides", w: 1 }, { id: "pro", label: "Promo codes", w: 1 }, { id: "pay", label: "In-app card payments", w: 2 }, { id: "rat", label: "Ratings and reviews", w: 1 }, { id: "lang", label: "Several languages or currencies", w: 1 }, { id: "wal", label: "Wallet or credits", w: 2 }, { id: "auto", label: "Automatic dispatch rules", w: 2 }, { id: "zone", label: "Fixed prices and zones", w: 1 }, { id: "city", label: "More than one city", w: 3 }];
const INTEG: Opt[] = [{ id: "sms", label: "SMS or WhatsApp", w: 1 }, { id: "gw", label: "Several payment methods", w: 1 }, { id: "sys", label: "Your own systems or APIs", w: 3 }];
const DESIGN: Opt[] = [{ id: "std", label: "Branded standard layout", w: 1 }, { id: "cus", label: "Fully custom design", w: 3 }];

const LEVELS = [
  { n: "Focused scope", t: "A small, clear release. Typically fast to plan and the easiest to estimate. Good for proving demand in one area.", m: 1 },
  { n: "Moderate scope", t: "Several apps and a handful of features. A well-defined release with room for a couple of integrations.", m: 2 },
  { n: "Substantial scope", t: "A broad feature set or custom rules. Expect a discovery phase, staged delivery and more testing.", m: 3 },
  { n: "Large scope", t: "A multi-city, integration-heavy or fully custom platform. Plan it in stages, with a first release that proves the core.", m: 4 },
];

const DRIVERS: [string, string, "l" | "m" | "h"][] = [
  ["Build approach", "Starting from white label is the biggest single difference. A custom build adds discovery, design and engineering time before the first trip.", "h"],
  ["Number of apps", "Each of the passenger app, driver app, dashboard and portals needs its own design, build and testing.", "h"],
  ["Feature scope", "Every feature adds screens, rules and tests. Payments, wallets and automatic dispatch cost more than ratings or promo codes.", "h"],
  ["Integrations", "Connecting your own systems costs more than standard maps, SMS or payment gateways, because the other side has to be understood too.", "m"],
  ["Pricing and dispatch rules", "Metered fares are simple. Zones, fixed routes, surcharges and custom matching add logic that must be built and tested.", "m"],
  ["Cities and areas", "A second city is more than a copy: pricing, drivers and rules can differ, and the backend needs to handle them separately.", "m"],
  ["Design depth", "A branded standard layout is quicker than a fully custom interface with its own components and animations.", "l"],
  ["Platforms", "Delivering for iOS and Android adds build and test effort, though shared tooling can reduce it.", "m"],
];

const COMPARE: [string, string, string, string][] = [
  ["Upfront investment", "Lowest of the three", "Moderate: focused first release", "Highest: full scope at once"],
  ["Time to first trip", "Shortest", "Medium", "Longest"],
  ["Flexibility", "Within the product's settings", "Core built, grows with you", "Fully yours to shape"],
  ["Where cost grows later", "Extra work beyond the product", "Each new stage of features", "Maintenance of a larger system"],
  ["Best when", "Your needs are standard and speed matters", "You have a clear core and want to learn first", "Your rules or integrations are the point"],
];

const STAGE_COST: [string, string][] = [
  ["Discovery", "Workshops, feature list and technical plan. Small in effort, large in effect: it prevents rework."],
  ["Design", "Flows, prototype and visual design for each app. Grows with the number of screens and roles."],
  ["Build", "The apps, dashboard, backend and integrations. The largest block, driven by scope."],
  ["Test", "Device, role and trip-scenario testing, including failed payments and cancellations."],
  ["Launch and support", "Store submission, go-live help and the first weeks of support."],
];

const PLAN: [string, string][] = [
  ["Write the must-have list", "Separate what a first passenger and driver need from what would be nice. Everything else is a later release."],
  ["Choose the approach", "Compare white label, a custom MVP and a full custom build against your rules, not the headline price."],
  ["Pick one launch area", "A single city or service area keeps the first release small and gives you real data."],
  ["Budget for running costs", "Add maps, messages, payment fees, hosting and support to the build, so the monthly picture is not a surprise."],
  ["Keep a reserve for what you learn", "Real trips reveal changes. A set-aside for the first release's feedback is cheaper than reopening scope mid-build."],
];

function Estimator() {
  const { ask } = useShell();
  const [ap, setAp] = useState("wl");
  const [pf, setPf] = useState("both");
  const [des, setDes] = useState("std");
  const [sel, setSel] = useState<Record<string, boolean>>({ pa: true, da: true, ad: true, pay: true });
  const toggle = (id: string) => setSel((s) => ({ ...s, [id]: !s[id] }));
  const all = [...APPS, ...FEATS, ...INTEG];
  const r = useMemo(() => {
    const chosen = all.filter((o) => sel[o.id]);
    const base = (APPROACH.find((o) => o.id === ap)?.w ?? 0) + (PLATFORM.find((o) => o.id === pf)?.w ?? 0) + (DESIGN.find((o) => o.id === des)?.w ?? 0);
    const score = base + chosen.reduce((a, o) => a + o.w, 0);
    const lvl = score <= 11 ? 0 : score <= 19 ? 1 : score <= 27 ? 2 : 3;
    const heavy = [...chosen.filter((o) => o.w >= 2).map((o) => o.label)];
    if (ap !== "wl") heavy.unshift(APPROACH.find((o) => o.id === ap)!.label);
    if (des === "cus") heavy.push("Fully custom design");
    return { chosen, lvl, heavy, score };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, ap, pf, des]);
  const L = LEVELS[r.lvl];
  const summary = `Approach: ${APPROACH.find((o) => o.id === ap)!.label}. Platforms: ${PLATFORM.find((o) => o.id === pf)!.label}. Design: ${DESIGN.find((o) => o.id === des)!.label}. Selected: ${r.chosen.map((o) => o.label).join(", ") || "none"}. Scope level: ${L.n}.`;
  const radio = (name: string, legend: string, opts: Opt[], val: string, set: (v: string) => void) => (
    <fieldset><legend>{legend}</legend><div className="opts">{opts.map((o) => <label key={o.id} className="opt"><input type="radio" name={name} checked={val === o.id} onChange={() => set(o.id)} /><span>{o.label}</span></label>)}</div></fieldset>
  );
  const checks = (legend: string, opts: Opt[]) => (
    <fieldset><legend>{legend}</legend><div className="opts">{opts.map((o) => <label key={o.id} className="opt"><input type="checkbox" checked={!!sel[o.id]} onChange={() => toggle(o.id)} /><span>{o.label}</span></label>)}</div></fieldset>
  );
  return (
    <div className="est">
      <div>
        {radio("ap", "How will you build?", APPROACH, ap, setAp)}
        {radio("pf", "Which mobile platforms?", PLATFORM, pf, setPf)}
        {checks("Which apps do you need?", APPS)}
        {checks("Which features matter in the first release?", FEATS)}
        {checks("What must it connect to?", INTEG)}
        {radio("ds", "How custom is the design?", DESIGN, des, setDes)}
      </div>
      <aside className="res" aria-labelledby="est-h">
        <h3 id="est-h">Your scope level</h3>
        <p className="lvl" role="status" aria-live="polite">{L.n}</p>
        <div className="meter" aria-hidden>{[1, 2, 3, 4].map((n) => <i key={n} className={n <= L.m ? "on" : ""} />)}</div>
        <p>{L.t}</p>
        {r.heavy.length > 0 && <><p style={{ marginTop: 16, fontWeight: 650, color: "#fff" }}>Pushing the scope up</p><ul>{r.heavy.slice(0, 6).map((h) => <li key={h}><TrendingUp size={15} aria-hidden />{h}</li>)}</ul></>}
        <button type="button" className="btn btn-primary" onClick={() => ask("Get an estimate for my scope", { kind: ap === "wl" ? "White label taxi app" : "Custom taxi app", notes: summary })}>Send this scope for an estimate</button>
        <small>This is a relative guide to scope, not a price. It helps you organise requirements before a written estimate.</small>
      </aside>
    </div>
  );
}

function Body() {
  const { ask } = useShell();
  useSeo({ title: TITLE, description: DESC, path: ROUTES.cost, ld: [crumbLd(CRUMBS), serviceLd("Taxi app development cost guidance and estimates", DESC, ROUTES.cost, "Taxi app development estimates"), faqLd(FAQS)] });
  const est = () => ask("Get a written estimate", { kind: "Not sure yet" });
  return (
    <>
      <section className="hero hero-c" id="top">
        <div className="wrap in">
          <Crumbs items={CRUMBS} dark />
          <div className="txt">
            <p className="eyebrow light">Taxi app development cost</p>
            <h1>Taxi App Development Cost: What Really <em>Drives the Budget</em></h1>
            <p className="sub">No guessed price tags here; for indicative packages see our pricing page. This guide explains what moves the cost of a taxi app, where the money goes and what to budget beyond the build, then lets you size your own scope.</p>
            <div className="hero-btns">
              <button type="button" className="btn btn-primary" onClick={() => go("estimator")}>Size Your Scope</button>
              <button type="button" className="btn btn-ghost-dark" onClick={() => go("drivers")}>See the Cost Drivers</button>
            </div>
          </div>
          <Pic label="Budget formula: scope and approach plus integrations, then running costs" className="platform" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 10, color: "#fff", fontWeight: 650 }}>
            {["Scope", "×", "Approach", "+", "Integrations", "+", "Running costs", "=", "Your budget"].map((x, i) => (
              <span key={i} style={/[×+=]/.test(x) && x.length === 1 ? { color: "#22d3ee", fontSize: 22 } : { padding: "10px 16px", borderRadius: 12, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.18)" }}>{x}</span>
            ))}
          </Pic>
        </div>
      </section>

      <section className="sec sec-white" id="answer" aria-labelledby="h-ans">
        <div className="wrap">
          <p className="eyebrow">The short answer</p>
          <h2 className="h2 wide" id="h-ans">How much does it cost to build a taxi app?</h2>
          <p className="lede">It depends on scope far more than on the type of app. A branded ready-made platform and a multi-city custom system are both &ldquo;taxi apps&rdquo;, but they are very different projects. We do not publish prices, because a number without your scope would mislead you. What we can do is show exactly what moves it.</p>
          <div className="split2">
            <div><h3>What makes it cost less</h3><Tick items={["Starting from a white label product", "One city and a short must-have list", "Standard maps, payment and SMS services", "A branded standard design"]} /></div>
            <div><h3>What makes it cost more</h3><Tick items={["Custom pricing and dispatch rules", "Several cities, roles or corporate portals", "Integrations with your own systems", "Fully custom design and extra features"]} /></div>
          </div>
        </div>
      </section>

      <section className="sec sec-gray" id="estimator" aria-labelledby="h-est">
        <div className="wrap">
          <p className="eyebrow">Scope tool</p>
          <h2 className="h2 wide" id="h-est">Size your taxi app scope in a minute</h2>
          <p className="lede">Choose what you need. The tool shows how large the scope is and what is pushing it up, then you can send the summary to us for a written estimate.</p>
          <Estimator />
        </div>
      </section>

      <section className="sec sec-white" id="approach" aria-labelledby="h-app">
        <div className="wrap">
          <p className="eyebrow">Cost by approach</p>
          <h2 className="h2 wide" id="h-app">White label, custom MVP or full custom: how the cost behaves</h2>
          <table className="tbl">
            <caption className="sr">How cost behaves across three ways to build a taxi app</caption>
            <thead><tr><th scope="col">&nbsp;</th><th scope="col">White label</th><th scope="col">Custom MVP</th><th scope="col">Full custom</th></tr></thead>
            <tbody>{COMPARE.map(([k, a, b, c]) => <tr key={k}><th scope="row">{k}</th><td data-label="White label">{a}</td><td data-label="Custom MVP">{b}</td><td data-label="Full custom">{c}</td></tr>)}</tbody>
          </table>
          <div className="more">
            <Link className="link" to={ROUTES.whiteLabel}>White label taxi app development <ArrowRight size={16} /></Link>
            <Link className="link" to={ROUTES.custom}>Custom taxi app development <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="sec sec-gray" id="drivers" aria-labelledby="h-dr">
        <div className="wrap">
          <p className="eyebrow">Cost drivers</p>
          <h2 className="h2 wide" id="h-dr">Eight factors that change taxi app development cost</h2>
          <p className="lede">The tag shows how strongly each factor usually moves the budget. It is general guidance, not a measurement of your project.</p>
          <ul className="drv">{DRIVERS.map(([h, p, i]) => <li key={h}><div className="top"><h3>{h}</h3><span className={`imp ${i}`}>{i === "h" ? "High impact" : i === "m" ? "Medium impact" : "Lower impact"}</span></div><p>{p}</p></li>)}</ul>
        </div>
      </section>

      <section className="sec sec-white" id="stages" aria-labelledby="h-stg">
        <div className="wrap">
          <p className="eyebrow">Where the budget goes</p>
          <h2 className="h2 wide" id="h-stg">What each stage of development pays for</h2>
          <ol className="bud" style={{ listStyle: "none", padding: 0 }}>{STAGE_COST.map(([h, p], n) => <li key={h}><span className="n">STAGE {n + 1}</span><h3>{h}</h3><p>{p}</p></li>)}</ol>
          <p className="note">The services behind each stage are described on our <Link className="ref" to={ROUTES.services}>taxi app development services</Link> page.</p>
        </div>
      </section>

      <section className="sec sec-navy on-navy" id="running" aria-labelledby="h-run">
        <div className="wrap">
          <p className="eyebrow">Beyond the build</p>
          <h2 className="h2 wide" id="h-run">Costs that are not development, but still belong in your budget</h2>
          <p className="lede" style={{ color: "var(--on-navy)" }}>Most of these are charged by the provider, not by a developer. Check each provider&rsquo;s current pricing before you finalise your plan.</p>
          <div className="split2">
            <div style={{ background: "rgba(255,255,255,.06)", borderColor: "rgba(255,255,255,.16)" }}><h3 style={{ color: "#fff" }}>Set up once</h3><Tick items={["Apple and Google developer accounts", "Brand assets, fonts and licences", "Legal, licensing and insurance for your service", "Initial driver onboarding and training"]} /></div>
            <div style={{ background: "rgba(255,255,255,.06)", borderColor: "rgba(255,255,255,.16)" }}><h3 style={{ color: "#fff" }}>Paid as you operate</h3><Tick items={["Maps and routing usage", "SMS or WhatsApp messages", "Payment processing fees", "Hosting and monitoring", "Maintenance, support and updates"]} /></div>
          </div>
        </div>
      </section>

      <section className="sec sec-white" id="plan" aria-labelledby="h-plan">
        <div className="wrap">
          <p className="eyebrow">Budget planning</p>
          <h2 className="h2 wide" id="h-plan">How to plan a taxi app budget without surprises</h2>
          <ol className="askl" style={{ listStyle: "none", padding: 0 }}>{PLAN.map(([h, p]) => <li key={h}><h3>{h}</h3><p>{p}</p></li>)}</ol>
          <div className="more">
            <button type="button" className="btn btn-primary" onClick={est}>Get a Written Estimate</button>
            <Link className="link" to={ROUTES.developers}>Meet the taxi app developers <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <Faq items={FAQS} onAsk={() => ask("Ask us a question", { kind: "Not sure yet" })} heading="Taxi app development cost questions, answered" />
      <Related page="cost" />
      <FinalCta title="Get a Written Estimate for Your Taxi App" text="Send us your scope. We will confirm what is included and give you an estimate you can plan around." startLabel="Get a Written Estimate" consultLabel="Request a Consultation" onStart={est} onConsult={() => ask("Request a consultation", { kind: "Not sure yet" })} />
    </>
  );
}

export default function TaxiAppDevelopmentCost() {
  return <Shell testId="page-tad-cost"><Body /></Shell>;
}
