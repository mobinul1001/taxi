import { Link } from "react-router-dom";
import { ArrowRight, Boxes, Code2, Smartphone } from "lucide-react";
import { AdminDash, Phone, PassengerScreen, DriverScreen, STLU, Scaled } from "./mockups";
import { Crumbs, crumbLd, useSeo } from "./seo";
import { FinalCta, Pic, Shell, Tick, useShell } from "./shell";
import { ROUTES } from "./routes";
import { Related } from "./related";

const TITLE = "About Us | Taxi App & Ride-Hailing Software Team";
const DESC = "About TaxiAppDevelopment.org: a taxi app and ride-hailing software development team building passenger apps, driver apps, dispatch tools and custom software.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "About Us", to: ROUTES.about }];

const DO: [string, string, typeof Smartphone][] = [
  ["Taxi and ride-hailing apps", "Passenger apps, driver apps and admin dashboards for taxi operators and ride-hailing businesses.", Smartphone],
  ["Dispatch and fleet tools", "Software to assign jobs, follow drivers and manage vehicles, drivers and bookings.", Boxes],
  ["Custom software", "Platforms built around the pricing, dispatch and integration needs of a particular operation.", Code2],
];

const WAY: [string, string][] = [
  ["Scope before code", "We agree what the first release must do, and what can wait, before design and development begin."],
  ["Straight answers on cost", "We explain what drives a budget instead of publishing a price list, and give written estimates against a defined scope."],
  ["Software you can try", "You see working software in demos and on a staging build, not only slides."],
  ["Your brand, your accounts", "We recommend that apps are published under your own developer accounts, and agree ownership in writing."],
];

function Body() {
  const { ask } = useShell();
  useSeo({ title: TITLE, description: DESC, path: ROUTES.about, ld: [crumbLd(CRUMBS)] });
  return (
    <>
      <section className="hero hero-l hero-svc" id="top">
        <div className="wrap">
          <Crumbs items={CRUMBS} />
          <div className="grid2">
            <div>
              <p className="eyebrow">About us</p>
              <h1>About Us: <em>Taxi App and Ride-Hailing Software Specialists</em></h1>
              <p className="sub">We design and build taxi booking apps, driver apps, dispatch tools and custom mobility software, for businesses that want a platform shaped around how they actually operate.</p>
              <div className="hero-btns">
                <button type="button" className="btn btn-primary" onClick={() => ask("Talk to the team", { kind: "Not sure yet" })}>Talk to the Team</button>
                <Link className="btn btn-outline" to={ROUTES.services}>Our Services</Link>
              </div>
            </div>
            <Pic label="Passenger app, driver app and dispatch dashboard sample screens. Illustrative." style={{ background: "linear-gradient(180deg,#dfe8ff,#cfdcff)", borderRadius: 28, padding: "24px 20px 0", overflow: "hidden", display: "flex", justifyContent: "center" }}>
              <Scaled w={440} h={420}>
                <div style={{ position: "absolute", left: 0, top: 24 }}><AdminDash w={340} accent={STLU} title="Dispatch" /></div>
                <Phone style={{ position: "absolute", left: 240, top: 100, transform: "scale(.8)", transformOrigin: "0 0" }}><PassengerScreen /></Phone>
                <Phone style={{ position: "absolute", left: 60, top: 200, transform: "scale(.7)", transformOrigin: "0 0" }}><DriverScreen /></Phone>
              </Scaled>
            </Pic>
          </div>
        </div>
      </section>

      <section className="sec sec-white" id="what" aria-labelledby="h-what">
        <div className="wrap">
          <p className="eyebrow">What we do</p>
          <h2 className="h2 wide" id="h-what">Mobility software, from first idea to live platform</h2>
          <ul className="need4 c3">{DO.map(([h, p, I]) => <li key={h}><I size={22} color="#2b63ff" aria-hidden /><h3>{h}</h3><p>{p}</p></li>)}</ul>
          <div className="more">
            <Link className="link" to={ROUTES.dev}>Taxi app development <ArrowRight size={16} /></Link>
            <Link className="link" to={ROUTES.solutions}>Taxi app solutions <ArrowRight size={16} /></Link>
            <Link className="link" to={ROUTES.developers}>The team and how we work <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="sec sec-gray" id="approach" aria-labelledby="h-way">
        <div className="wrap">
          <p className="eyebrow">How we work</p>
          <h2 className="h2 wide" id="h-way">Principles we apply to every taxi app project</h2>
          <ol className="askl" style={{ listStyle: "none", padding: 0 }}>{WAY.map(([h, p]) => <li key={h}><h3>{h}</h3><p>{p}</p></li>)}</ol>
        </div>
      </section>

      <section className="sec sec-white" id="who" aria-labelledby="h-who">
        <div className="wrap">
          <p className="eyebrow">Who we build for</p>
          <h2 className="h2 wide" id="h-who">Businesses we design taxi platforms for</h2>
          <p className="lede">Our work is aimed at businesses that move people for a living and need software that matches how they operate.</p>
          <Tick items={["Taxi companies and owner-operators moving from phone bookings to an app", "Airport transfer and tour transport businesses", "Ride-hailing start-ups building a marketplace under their own brand", "Fleets and corporate or chauffeur services that need dispatch and account billing"]} />
          <p className="note">Not sure which of these describes you? Our <Link to={ROUTES.solutions}>taxi app solutions guide</Link> maps each business type to a setup, and the <Link to={ROUTES.faq}>FAQ</Link> answers common questions.</p>
        </div>
      </section>

      <section className="sec sec-white" id="project" aria-labelledby="h-pr">
        <div className="wrap">
          <p className="eyebrow">Client project</p>
          <h2 className="h2 wide" id="h-pr">St Lu Taxi &amp; Tours</h2>
          <div className="split2">
            <div><h3>The project</h3><p style={{ color: "var(--mute)", marginTop: 8 }}>A ride-sharing and tours platform for a St. Lucia taxi operator, covering airport transfers, tours and taxi bookings, with a dispatcher panel behind them.</p>
              <p className="note">The St Lu app on this site is a clickable design prototype. It shows the product direction, not live client results.</p></div>
            <div><h3>What was developed</h3><Tick items={["Passenger booking with online payment", "Driver app with job status updates", "Dispatcher assigns in-house and outside drivers", "Live map and trip timeline"]} /></div>
          </div>
        </div>
      </section>

      <section className="sec sec-gray" id="details" aria-labelledby="h-det">
        <div className="wrap">
          <p className="eyebrow">Company details</p>
          <h2 className="h2 wide" id="h-det">Who is behind this website</h2>
          <dl className="facts">
            <div><dt>Website</dt><dd>TaxiAppDevelopment.org</dd></div>
            <div><dt>Legal entity</dt><dd><mark className="phold">[legal entity name]</mark></dd></div>
            <div><dt>Location</dt><dd><mark className="phold">[office or registered location]</mark></dd></div>
            <div><dt>Contact</dt><dd><Link className="ref" to={ROUTES.contact}>Contact page</Link> or <mark className="phold">[contact email address]</mark></dd></div>
          </dl>
        </div>
      </section>

      <Related page="about" />
      <FinalCta title="Let’s Talk About Your Taxi Platform" text="Tell us about your business and what you want to launch. We will reply with questions and a suggested next step." startLabel="Start a Conversation" consultLabel="Request a Consultation" onStart={() => ask("Start a conversation", { kind: "Not sure yet" })} onConsult={() => ask("Request a consultation", { kind: "Not sure yet" })} />
    </>
  );
}

export default function AboutUs() {
  return <Shell testId="page-tad-about"><Body /></Shell>;
}
