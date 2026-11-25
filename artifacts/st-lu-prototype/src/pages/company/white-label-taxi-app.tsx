import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { AdminDash, Phone, RouteMap, Scaled } from "./mockups";
import { Crumbs, crumbLd, faqLd, serviceLd, useSeo } from "./seo";
import { Faq, FinalCta, Pic, Shell, Tick, go, useShell } from "./shell";
import { ROUTES } from "./routes";
import { Related } from "./related";

const TITLE = "White Label Taxi App Development: Launch Under Your Brand";
const DESC = "White label taxi app development: a ready-built taxi platform branded as yours. See what you can customise, what is included and how launch works.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Taxi App Development", to: ROUTES.dev }, { name: "White Label Taxi App Development", to: ROUTES.whiteLabel }];

const FAQS: [string, string][] = [
  ["What is a white label taxi app?", "It is a taxi platform that is already built and tested, which we configure and brand as yours: your name, logo, colours and store listings, with passenger app, driver app and admin dashboard included. Your customers never see anyone else's name."],
  ["How is white label different from custom taxi app development?", "White label starts from a finished product and customises the surface and settings, so you launch sooner. Custom development designs the product around your own workflows. If you need rules the base product does not support, custom development is the better route."],
  ["What can I customise in a white label taxi app?", "Typically your app name, logo, colours, vehicle types, fares and service areas, languages, payment gateway and the information in your store listing. Changes to how the product itself works are extra work and are agreed separately."],
  ["Will the apps be published under my own developer accounts?", "That is how we recommend it. Apps published under your own Apple and Google developer accounts stay in your control, whichever provider you work with. We guide you through setting the accounts up."],
  ["Can I add my own features later?", "Yes, within what the base product allows. Where a feature does not exist yet, we scope it as an extension. If you find you are extending a lot, it is worth looking at custom development instead."],
  ["How long does it take to launch?", "A white label launch is shorter than a custom build because the product exists already. The time depends on your branding assets, which services you connect (maps, payments, SMS) and how quickly your accounts are set up. We give a schedule once the scope is agreed."],
  ["What should I ask any white label provider before I buy?", "Who owns what, how updates are delivered, whether the apps go under your developer accounts, what support covers, and what happens if you want to move on. The checklist on this page lists the questions to ask us or anyone else."],
];

const COLORS = [["Blue", "#2b63ff"], ["Green", "#0e8f4a"], ["Orange", "#e0620d"], ["Purple", "#7a3cf0"]] as const;

function BrandPhone({ name, color }: { name: string; color: string }) {
  const nm = name.trim() || "Your Taxi Co";
  return (
    <div className="screen">
      <div style={{ position: "absolute", inset: 0 }}><RouteMap w={204} h={440} accent={{ a: color, soft: `${color}22` }} style={{ position: "absolute", left: -120, top: 0, width: 440, height: 300 }} /></div>
      <div className="st" style={{ position: "relative" }}><span>9:41</span><span>5G</span></div>
      <div className="m-card" style={{ position: "absolute", left: 10, right: 10, top: 40, padding: "9px 11px" }}>
        <div className="m-row">
          <span style={{ width: 26, height: 26, borderRadius: 8, background: color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, flex: "none" }}>{nm[0].toUpperCase()}</span>
          <b style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nm}</b>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "#fff", borderRadius: "20px 20px 0 0", padding: "14px 13px 16px", boxShadow: "0 -10px 30px rgba(10,19,48,.12)" }}>
        <div style={{ width: 34, height: 4, background: "#dde3f1", borderRadius: 3, margin: "-4px auto 10px" }} />
        <div className="m-row" style={{ padding: "8px 10px", borderRadius: 11, background: `${color}1f`, boxShadow: `inset 0 0 0 1.5px ${color}` }}><b style={{ flex: 1 }}>Economy</b><span style={{ color: "#64708f" }}>4 min</span></div>
        <div className="m-row" style={{ padding: "8px 10px", borderRadius: 11, background: "#f6f8fc", marginTop: 5 }}><b style={{ flex: 1 }}>Comfort</b><span style={{ color: "#64708f" }}>6 min</span></div>
        <span className="m-btn" style={{ background: color, marginTop: 10 }}>Book with {nm.length > 12 ? "us" : nm}</span>
      </div>
    </div>
  );
}

const MATRIX: { tag: string; cls: string; h: string; pts: string[] }[] = [
  { tag: "Included", cls: "t1", h: "Ready from day one", pts: ["Passenger app with booking and live tracking", "Driver app with requests and earnings", "Admin dashboard and dispatch", "Fare estimates and ride history", "Push notifications", "Payment gateway integration"] },
  { tag: "You configure", cls: "t2", h: "Made yours in settings", pts: ["App name, logo and colours", "Vehicle types and capacity", "Fares, surcharges and promo codes", "Service areas", "Languages and currency", "Store listing text and images"] },
  { tag: "Extra work", cls: "t3", h: "Scoped separately", pts: ["Features the base product lacks", "Integrations with your own systems", "Unusual pricing or dispatch rules", "Redesigned screens and flows", "Anything that changes how the product works"] },
];

const LAUNCH: [string, string, string][] = [
  ["Brand and configure", "Logo, colours, app name, vehicle types and fares.", "We load them into the apps and admin settings."],
  ["Connect your services", "Your payment gateway and any SMS or map accounts.", "We integrate and test each one."],
  ["Test with real scenarios", "Review the apps on your own phones.", "We fix findings and rerun trip, payment and cancellation tests."],
  ["Submit to the stores", "Your Apple and Google developer accounts.", "We prepare builds and guide the store submission."],
  ["Go live and support", "Onboard your first drivers.", "We stay on hand during the first real trips."],
];

const CMP: [string, string, string][] = [
  ["Time to first launch", "Shorter. The product already exists.", "Longer. Discovery, design and build come first."],
  ["Upfront effort", "Mostly branding, settings and service accounts.", "Requirements, design reviews and scope decisions."],
  ["Flexibility", "Within what the base product supports.", "Designed around your rules and workflows."],
  ["Differentiation", "Your brand on a proven product.", "Your own product experience."],
  ["Best when", "You want to start taking bookings soon and your needs are standard.", "Your pricing, dispatch or integrations set you apart."],
];

const FIT: [string, string][] = [
  ["New taxi company", "Start with a branded app instead of waiting for a custom build, and learn from real trips first."],
  ["Existing fleet going digital", "Give regular customers an app and your drivers a proper job tool, under your name."],
  ["Airport transfer and tour operator", "Take fixed-price and scheduled bookings without phone tag."],
  ["Regional ride-hailing startup", "Test a market with a focused product before investing in custom engineering."],
];

const ASK: [string, string][] = [
  ["Who owns what?", "Ask who holds the licence, the source code and your customer and driver data, and get the answer in writing."],
  ["Which developer accounts are used?", "Apps should be published under your own Apple and Google accounts, so the listings stay yours."],
  ["How do updates reach me?", "Find out how fixes and new versions are delivered and whether they cost extra."],
  ["What does support include?", "Ask about response times, who you talk to and what happens during launch week."],
  ["What can be changed later?", "Ask what you can customise yourself and what needs the provider's team."],
  ["What if I want to leave?", "Ask how you would take your data and your apps with you, and what the exit terms are."],
];

function Hero() {
  const { ask } = useShell();
  const [name, setName] = useState("Your Taxi Co");
  const [color, setColor] = useState<string>(COLORS[0][1]);
  return (
    <section className="hero hero-b" id="top">
      <div className="wrap">
        <Crumbs items={CRUMBS} dark />
        <div className="grid2">
          <div>
            <p className="eyebrow light">White label taxi app development</p>
            <h1>White Label Taxi App Development: Your Brand, <em>Ready to Launch</em></h1>
            <p className="sub">Skip the long build. Get a finished taxi platform with passenger app, driver app and admin dashboard, branded as yours and configured for your market.</p>
            <div className="cfg">
              <h2>Try your brand on the app</h2>
              <label className="lb" htmlFor="wl-name">Your company name</label>
              <input id="wl-name" type="text" maxLength={22} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
              <p className="lb" id="wl-col" style={{ marginBottom: 6 }}>Brand colour</p>
              <div className="sws" role="group" aria-labelledby="wl-col">
                {COLORS.map(([n, c]) => <button key={n} type="button" className="sw" style={{ background: c }} aria-pressed={color === c} aria-label={n} onClick={() => setColor(c)}>{color === c && <Check size={18} aria-hidden />}</button>)}
              </div>
            </div>
            <div className="hero-btns">
              <button type="button" className="btn btn-primary" onClick={() => ask("Talk about a white label taxi app", { kind: "White label taxi app" })}>Talk About White Label</button>
              <button type="button" className="btn btn-ghost-dark" onClick={() => go("included")}>What&rsquo;s Included</button>
            </div>
          </div>
          <Pic label={`White label passenger app preview showing the company name ${name.trim() || "Your Taxi Co"} and the chosen brand colour. Illustrative.`} className="wl-stage">
            <span className="wl-ring r1" aria-hidden /><span className="wl-ring r2" aria-hidden />
            <div className="wl-phone"><Scaled w={220} h={450}><Phone><BrandPhone name={name} color={color} /></Phone></Scaled></div>
            <span className="wl-chip a" aria-hidden><i style={{ background: color }}>{(name.trim()[0] || "Y").toUpperCase()}</i><span><small>App name</small>{name.trim() || "Your Taxi Co"}</span></span>
            <span className="wl-chip b" aria-hidden><i className="sw2" style={{ background: color }} /><span><small>Colour</small>{color.toUpperCase()}</span></span>
          </Pic>
        </div>
      </div>
    </section>
  );
}

function Body() {
  const { ask } = useShell();
  useSeo({ title: TITLE, description: DESC, path: ROUTES.whiteLabel, ld: [crumbLd(CRUMBS), serviceLd("White label taxi app development", DESC, ROUTES.whiteLabel, "White label taxi app development"), faqLd(FAQS)] });
  const talk = () => ask("Talk about a white label taxi app", { kind: "White label taxi app" });
  return (
    <>
      <Hero />

      <section className="sec sec-white" id="included" aria-labelledby="h-inc">
        <div className="wrap">
          <p className="eyebrow">What you get</p>
          <h2 className="h2 wide" id="h-inc">What a white label taxi app includes, and what you can change</h2>
          <p className="lede">Knowing where the line sits between what is ready, what you set up and what is extra work is the most useful thing to know before you choose.</p>
          <div className="cols3">
            {MATRIX.map((m) => <div key={m.tag}><span className={`tag ${m.cls}`}>{m.tag}</span><h3>{m.h}</h3><Tick items={m.pts} /></div>)}
          </div>
          <Pic label="White label admin dashboard with drivers, active trips and bookings" style={{ marginTop: 34, background: "linear-gradient(180deg,#eef2fb,#e4ebfa)", borderRadius: 18, padding: "22px 22px 0", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 560 }}><Scaled w={560} h={334}><AdminDash /></Scaled></div>
          </Pic>
        </div>
      </section>

      <section className="sec sec-gray" id="launch" aria-labelledby="h-launch">
        <div className="wrap">
          <p className="eyebrow">Launch</p>
          <h2 className="h2 wide" id="h-launch">From signed brief to live app: who does what</h2>
          <ol className="yw" style={{ listStyle: "none", padding: 0 }}>
            {LAUNCH.map(([t, you, we], i) => (
              <li key={t}>
                <span className="n" aria-hidden>{i + 1}</span><h3><span className="sr">Step {i + 1}: </span>{t}</h3>
                <div><b>You</b><p>{you}</p></div><div><b>We</b><p>{we}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec sec-white" id="vs-custom" aria-labelledby="h-cmp">
        <div className="wrap">
          <p className="eyebrow">White label vs custom</p>
          <h2 className="h2 wide" id="h-cmp">White label or custom: the trade-offs side by side</h2>
          <table className="tbl">
            <caption className="sr">Comparison of white label and custom taxi app development</caption>
            <thead><tr><th scope="col">&nbsp;</th><th scope="col">White label</th><th scope="col">Custom</th></tr></thead>
            <tbody>{CMP.map(([k, a, b]) => <tr key={k}><th scope="row">{k}</th><td data-label="White label">{a}</td><td data-label="Custom">{b}</td></tr>)}</tbody>
          </table>
          <p className="note">If your answers lean towards the right-hand column, read about <Link className="ref" to={ROUTES.custom}>custom taxi app development</Link> and try the scope builder there.</p>
        </div>
      </section>

      <section className="sec sec-gray" id="who" aria-labelledby="h-fit">
        <div className="wrap">
          <p className="eyebrow">Who it suits</p>
          <h2 className="h2 wide" id="h-fit">Businesses a white label taxi app fits well</h2>
          <ul className="fit4">{FIT.map(([h, p]) => <li key={h}><h3>{h}</h3><p>{p}</p></li>)}</ul>
          <div className="more">
            <Link className="link" to={ROUTES.booking}>See how the booking flow works <ArrowRight size={16} /></Link>
            <Link className="link" to={ROUTES.dispatch}>See taxi dispatch software <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="sec sec-white" id="ask" aria-labelledby="h-ask">
        <div className="wrap">
          <p className="eyebrow">Before you buy</p>
          <h2 className="h2 wide" id="h-ask">Six questions to ask any white label taxi app provider</h2>
          <p className="lede">Ask us these, and ask anyone else you compare us with. We agree the answers in writing before work starts.</p>
          <ol className="askl" style={{ listStyle: "none", padding: 0 }}>{ASK.map(([h, p]) => <li key={h}><h3>{h}</h3><p>{p}</p></li>)}</ol>
        </div>
      </section>

      <Faq items={FAQS} onAsk={() => ask("Ask us a question", { kind: "White label taxi app" })} heading="White label taxi app questions, answered" />
      <Related page="whiteLabel" />
      <FinalCta title="Ready to Launch Under Your Own Brand?" text="Send us your brand basics and your market. We will confirm what is included and give you a launch plan." startLabel="Talk About White Label" consultLabel="Request a Consultation" onStart={talk} onConsult={() => ask("Request a consultation", { kind: "White label taxi app" })} />
    </>
  );
}

export default function WhiteLabelTaxiApp() {
  return <Shell testId="page-tad-whitelabel"><Body /></Shell>;
}
