import { Link } from "react-router-dom";
import { ArrowRight, Boxes, Code2, Smartphone } from "lucide-react";
import { StluLink } from "./stluLink";
import { AdminDash, DriverScreen, PassengerScreen, Phone, STLU, Scaled } from "./mockups";
import { Crumbs, crumbLd, useSeo, webPageLd } from "./seo";
import { FinalCta, Pic, Shell, Tick, useShell } from "./shell";
import { ROUTES } from "./routes";
import { Related } from "./related";

const TITLE = "Portfolio: St Lu Taxi & Tours Taxi App Case Study";
const DESC = "Case study of St Lu Taxi & Tours: a clickable prototype of a passenger app, driver app and dispatcher panel for a St. Lucia taxi and tours operator.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Portfolio", to: ROUTES.portfolio }];

const BUILT: [string, string, typeof Smartphone][] = [
  ["Passenger app", "Book an airport transfer, tour or taxi, choose a vehicle, pay online and follow the trip.", Smartphone],
  ["Driver app", "Receive a job, accept it and move it through its stages with one tap each.", Smartphone],
  ["Dispatcher panel", "Assign in-house and outside drivers, follow jobs on a live map and read the trip timeline.", Boxes],
];

const STEPS: [string, string][] = [
  ["The problem", "A St. Lucia taxi and tours operator takes airport transfers, tours and taxi bookings, and needed one place for passengers to book and for dispatchers to run the day."],
  ["The solution", "A booking app for passengers, a job app for drivers and a dispatcher panel, designed as one connected product with the operator's own orange brand."],
  ["How it was approached", "We scoped the first release around the jobs the business does every day, then designed the passenger, driver and dispatcher screens together so they use the same job states."],
];

function Body() {
  const { ask } = useShell();
  useSeo({ title: TITLE, description: DESC, path: ROUTES.portfolio, ld: [crumbLd(CRUMBS), webPageLd(TITLE, DESC, ROUTES.portfolio)] });
  return (
    <>
      <section className="hero hero-l hero-svc" id="top">
        <div className="wrap">
          <Crumbs items={CRUMBS} />
          <div className="grid2">
            <div>
              <p className="eyebrow">Case study</p>
              <h1>Portfolio: <em>St Lu Taxi &amp; Tours</em></h1>
              <p className="sub">A taxi, airport transfer and tours platform for a St. Lucia operator: a passenger app, a driver app and a dispatcher panel, shown as a clickable design prototype.</p>
              <div className="hero-btns">
                <StluLink to="/" className="btn btn-primary">Open the St Lu prototype</StluLink>
                <StluLink to="/landing" className="btn btn-outline">View the St Lu website</StluLink>
              </div>
              <p className="note" style={{ marginTop: 14 }}>This is a design prototype, not a live product, so the page shows no usage or revenue results.</p>
            </div>
            <Pic label="St Lu passenger app, driver app and dispatch dashboard sample screens. Illustrative." style={{ background: "linear-gradient(180deg,#fff0e2,#ffe0c4)", borderRadius: 28, padding: "24px 20px 0", overflow: "hidden", display: "flex", justifyContent: "center" }}>
              <Scaled w={440} h={420}>
                <div style={{ position: "absolute", left: 0, top: 24 }}><AdminDash w={340} accent={STLU} title="Dispatch" /></div>
                <Phone style={{ position: "absolute", left: 240, top: 100, transform: "scale(.8)", transformOrigin: "0 0" }}><PassengerScreen accent={STLU} brand="St Lu" /></Phone>
                <Phone style={{ position: "absolute", left: 60, top: 200, transform: "scale(.7)", transformOrigin: "0 0" }}><DriverScreen accent={STLU} /></Phone>
              </Scaled>
            </Pic>
          </div>
        </div>
      </section>

      <section className="sec sec-white" id="story" aria-labelledby="h-st">
        <div className="wrap">
          <p className="eyebrow">The project</p>
          <h2 className="h2 wide" id="h-st">From a daily operation to a connected product</h2>
          <ol className="askl" style={{ listStyle: "none", padding: 0 }}>{STEPS.map(([h, p]) => <li key={h}><h3>{h}</h3><p>{p}</p></li>)}</ol>
        </div>
      </section>

      <section className="sec sec-gray" id="built" aria-labelledby="h-bt">
        <div className="wrap">
          <p className="eyebrow">What is in the prototype</p>
          <h2 className="h2 wide" id="h-bt">Three connected parts</h2>
          <ul className="need4 c3">{BUILT.map(([h, p, I]) => <li key={h}><I size={22} color="#2b63ff" aria-hidden /><h3>{h}</h3><p>{p}</p></li>)}</ul>
          <div className="split2" style={{ marginTop: 28 }}>
            <div><h3>Features shown</h3><Tick items={["Passenger booking with online payment", "Driver job status updates", "Dispatcher assigns in-house and outside drivers", "Live map and trip timeline"]} /></div>
            <div><h3>How it is built</h3><p style={{ color: "var(--mute)", marginTop: 8 }}><Code2 size={16} aria-hidden style={{ verticalAlign: "-3px" }} /> A front-end prototype built with React and TypeScript. It runs in the browser with sample data and has no live backend or real payments.</p></div>
          </div>
        </div>
      </section>

      <section className="sec sec-white" id="outcome" aria-labelledby="h-oc">
        <div className="wrap">
          <p className="eyebrow">Outcome</p>
          <h2 className="h2 wide" id="h-oc">What this prototype gives the business</h2>
          <p className="lede">A product the owner and drivers can click through before anything is built for real, so the booking flow and dispatch rules can be agreed early and the budget set against a clear scope.</p>
          <p className="note">More projects will be added here as they are published. Want to see how a project like this would be priced? Read our <Link to={ROUTES.pricing}>pricing packages</Link>, or <Link to={ROUTES.demo}>book a demo</Link> of the prototype.</p>
          <div className="more"><Link className="link" to={ROUTES.booking}>Taxi booking app development <ArrowRight size={16} aria-hidden /></Link><Link className="link" to={ROUTES.dispatch}>Taxi dispatch software <ArrowRight size={16} aria-hidden /></Link></div>
        </div>
      </section>

      <Related page="portfolio" />
      <FinalCta title="Want a Platform Like This for Your Business?" text="Tell us about your fleet and what you want to launch. We reply with questions and a suggested next step." startLabel="Start a Conversation" consultLabel="Request a Demo" onStart={() => ask("Start a conversation", { kind: "Not sure yet" })} onConsult={() => ask("Request a demo", { kind: "Request a demo" })} />
    </>
  );
}

export default function Portfolio() {
  return <Shell testId="page-tad-portfolio"><Body /></Shell>;
}
