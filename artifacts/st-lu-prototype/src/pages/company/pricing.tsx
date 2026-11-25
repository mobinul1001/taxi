import { Link } from "react-router-dom";
import { Ic } from "./sectionicons";
import { ArrowRight, CalendarClock, Layers, Rocket, Wallet } from "lucide-react";
import { Crumbs, crumbLd, faqLd, useSeo, webPageLd } from "./seo";
import { Faq, FinalCta, Shell, Tick, useShell } from "./shell";
import { Illus } from "./covers";
import { ROUTES } from "./routes";
import { Related } from "./related";

const TITLE = "Taxi App Pricing: MVP, Growth and Custom Packages";
const DESC = "Indicative taxi app pricing in USD: MVP, Growth and Custom packages with what each includes, timelines, add-ons and how we turn a scope into a written quote.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Pricing", to: ROUTES.pricing }];

type Pkg = { name: string; kind: string; icon: typeof Rocket; range: string; time: string; fit: string; items: string[] };
const PKGS: Pkg[] = [
  { name: "MVP", kind: "Custom taxi app", icon: Rocket, range: "$5,000 to $15,000", time: "About 3 to 4 months", fit: "One city, one fleet, a first release to test real demand.",
    items: ["Passenger app and driver app", "Core booking, fare estimate and live trip status", "One payment method and basic notifications", "Admin dashboard with manual dispatch", "Staging build, store submission help and handover"] },
  { name: "Growth", kind: "Custom taxi app", icon: Layers, range: "$16,000 to $30,000", time: "About 4 to 6 months", fit: "A working operation that needs automation, more payment options and reporting.",
    items: ["Everything in MVP", "Automatic and zone-based dispatch rules", "Scheduled rides, promo codes, ratings and driver payouts", "Several payment methods and richer reports", "Corporate accounts or a second service area"] },
  { name: "Custom", kind: "Uber-like app", icon: Wallet, range: "Contact us for a quote", time: "About 6 to 12 months", fit: "Multi-city platforms, marketplaces and unusual pricing or integration needs.",
    items: ["Everything in Growth", "Marketplace rules, surge or dynamic pricing", "Integrations with your own systems", "Multi-city, multi-language and multi-currency setup", "Phased roadmap with a named team"] },
];

const ADDONS: [string, string][] = [
  ["White label start", "Begin from a ready platform and brand it, then add features later. Quoted after we review your branding and modules."],
  ["Corporate portal", "Company accounts, invoicing and ride approval for business customers."],
  ["Extra languages or currencies", "Translations, local formats and currency handling for each new market."],
  ["Own-system integrations", "Connecting accounting, CRM, flight data or fleet systems you already use."],
  ["Support and maintenance", "A monthly plan covering fixes, store updates, monitoring and small changes."],
];

const HOW: [string, string][] = [
  ["Tell us about the business", "City, fleet size, the apps you need and anything you already have."],
  ["We agree a first scope", "A short list of must-have features, and a list of what waits for later."],
  ["You receive a written quote", "A fixed price for the agreed scope, or a clear estimate with the assumptions behind it."],
  ["You decide", "Change the scope, start with a smaller package, or stop here."],
];

const ROWS: [string, string, string, string][] = [
  ["Apps", "Passenger and driver", "Passenger, driver, corporate", "All roles plus partner or operator apps"],
  ["Dispatch", "Manual", "Manual, automatic and zones", "Custom rules and marketplace matching"],
  ["Payments", "One method", "Several methods and payouts", "Custom flows and local gateways"],
  ["Areas", "One city", "One or two areas", "Several cities and countries"],
  ["Timeline", "3 to 4 months", "4 to 6 months", "6 to 12 months"],
];

const FAQS: [string, string][] = [
  ["Are these prices fixed?", "No. They are indicative ranges in US dollars, set from what taxi app projects typically cost in the market. A quote is written only after we understand your scope."],
  ["Why is there such a wide range?", "Scope moves the price more than anything else: how many apps, which features, how many payment and dispatch rules, and how much connects to other systems."],
  ["Does the price include running costs?", "No. Maps, SMS, payment fees, hosting and app store accounts are paid to those providers and depend on usage. We help you estimate them before launch."],
  ["Can I start small and grow?", "Yes. Many projects begin with the MVP package and add features in later stages, so the first release is cheaper and you learn from real riders."],
  ["Is a white label app cheaper?", "Usually the starting cost is lower and launch is faster, with less freedom to change how it works. The cost guide compares the approaches in detail."],
  ["How do I get an exact price?", "Send us a short description through the contact form. We reply with questions and then a written quote for the scope we agree."],
];

function Body() {
  const { ask } = useShell();
  useSeo({ title: TITLE, description: DESC, path: ROUTES.pricing, ld: [crumbLd(CRUMBS), webPageLd(TITLE, DESC, ROUTES.pricing), faqLd(FAQS)] });
  return (
    <>
      <section className="hero hero-b" id="top">
        <div className="wrap">
          <Crumbs items={CRUMBS} dark />
          <div className="grid2">
            <div>
              <p className="eyebrow light">Pricing</p>
              <h1>Taxi App Pricing: <em>Packages for Every Stage</em></h1>
              <p className="sub">Three packages: two with indicative price ranges and Custom priced on request, with timelines and what each includes. Every project is then quoted in writing against the scope we agree with you.</p>
              <div className="hero-btns">
                <button type="button" className="btn btn-primary" onClick={() => ask("Get a quote", { kind: "Not sure yet" })}>Get a Quote</button>
                <Link className="btn btn-ghost-dark" to={ROUTES.cost}>Read the Cost Guide</Link>
              </div>
            </div>
            <div className="gl-list" role="img" aria-label="Indicative price ranges: MVP 5 to 15 thousand dollars, Growth 16 to 30 thousand, Custom priced on request">
              {PKGS.map((p) => <div key={p.name} className={p.name === "Growth" ? "gl-i pop" : "gl-i"}><span className="gl-ic"><p.icon size={20} aria-hidden /></span><div><b>{p.name}</b><small>{p.time}</small></div><em>{p.range}</em></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="sec sec-white" id="packages" aria-labelledby="h-pk">
        <div className="wrap">
          <p className="eyebrow">Packages</p>
          <h2 className="h2 wide" id="h-pk">Choose the package that matches your stage</h2>
          <p className="lede">Prices are in US dollars and indicative. Custom has no listed price: contact us and we quote it after we understand your scope. None of this is a quote or an offer.</p>
          <ul className="pkgs">
            {PKGS.map((p) => (
              <li key={p.name} className={p.name === "Growth" ? "pkg pop" : "pkg"}>
                {p.name === "Growth" && <span className="pop-t">Most common</span>}
                <p.icon size={24} color="#2b63ff" aria-hidden />
                <h3>{p.name}</h3>
                <p className="pr">{p.range}</p>
                <p className="tm"><CalendarClock size={15} aria-hidden /> {p.time}</p>
                <p className="fit">{p.fit}</p>
                <Tick items={p.items} />
                <button type="button" className="btn btn-outline" onClick={() => ask(`Quote for the ${p.name} package`, { kind: p.kind, notes: p.name === "Custom" ? "Interested in the Custom package." : `Interested in the ${p.name} package (${p.range}).` })}>Ask about {p.name}</button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec sec-gray" id="compare" aria-labelledby="h-cmp">
        <div className="wrap">
          <p className="eyebrow">Compare</p>
          <h2 className="h2 wide" id="h-cmp">What changes between the packages</h2>
          <table className="tbl">
            <caption className="sr">Comparison of the MVP, Growth and Custom packages</caption>
            <thead><tr><th scope="col">&nbsp;</th><th scope="col">MVP</th><th scope="col">Growth</th><th scope="col">Custom</th></tr></thead>
            <tbody>{ROWS.map(([k, a, b, c]) => <tr key={k}><th scope="row">{k}</th><td data-label="MVP">{a}</td><td data-label="Growth">{b}</td><td data-label="Custom">{c}</td></tr>)}</tbody>
          </table>
          <p className="note">Wondering why a taxi app costs what it does? The <Link to={ROUTES.cost}>taxi app development cost guide</Link> explains the factors and running costs.</p>
        </div>
      </section>

      <section className="sec sec-white" id="addons" aria-labelledby="h-ad">
        <div className="wrap">
          <p className="eyebrow">Add-ons</p>
          <h2 className="h2 wide" id="h-ad">Extras you can add to any package</h2>
          <ul className="need4 c3">{ADDONS.map(([h, p], i) => <li key={h}><Ic set="addons" i={i} /><h3>{h}</h3><p>{p}</p></li>)}</ul>
        </div>
      </section>

      <section className="sec sec-gray" id="quote" aria-labelledby="h-q">
        <div className="wrap">
          <div className="sh"><div>
          <p className="eyebrow">How we quote</p>
          <h2 className="h2 wide" id="h-q">From your first message to a written price</h2>
          </div><Illus name="quote" /></div>
          <ol className="askl" style={{ listStyle: "none", padding: 0 }}>{HOW.map(([h, p]) => <li key={h}><h3>{h}</h3><p>{p}</p></li>)}</ol>
          <div className="more"><Link className="link" to={ROUTES.features}>See the features you can include <ArrowRight size={16} aria-hidden /></Link></div>
        </div>
      </section>

      <Faq items={FAQS} onAsk={() => ask("Ask about pricing", { kind: "Not sure yet" })} heading="Taxi app pricing questions, answered" sid="pricing-faq" />
      <Related page="pricing" />
      <FinalCta title="Get a Written Quote for Your Taxi App" text="Tell us about your business. We reply with questions and a quote for the scope we agree." startLabel="Get a Quote" consultLabel="Request a Demo" onStart={() => ask("Get a quote", { kind: "Not sure yet" })} onConsult={() => ask("Request a demo", { kind: "Request a demo" })} />
    </>
  );
}

export default function Pricing() {
  return <Shell testId="page-tad-pricing"><Body /></Shell>;
}
