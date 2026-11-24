import { Link } from "react-router-dom";
import { Ic } from "./sectionicons";
import { CalendarCheck, Clock, MousePointerClick, Presentation } from "lucide-react";
import { StluLink } from "./stluLink";
import { Crumbs, crumbLd, faqLd, useSeo, webPageLd } from "./seo";
import { Faq, FinalCta, Shell, Tick, useShell } from "./shell";
import { Illus } from "./covers";
import { ROUTES } from "./routes";
import { DEMO_PATH } from "./routePaths";
import { Related } from "./related";

const TITLE = "Book a Taxi App Demo: See the Prototype in Action";
const DESC = "Request a taxi app demo: try the St Lu prototype yourself, then ask for a guided walkthrough of the passenger app, driver app and dispatcher panel.";
const CRUMBS = [{ name: "Home", to: ROUTES.home }, { name: "Book a Demo", to: DEMO_PATH }];

const EXPECT: [string, string][] = [
  ["You send a short request", "Say who you are and what you run. It takes about a minute."],
  ["We reply with times", "We answer on weekdays, 9:00 AM to 5:00 PM Eastern Time (ET), USA, and suggest a time that suits you."],
  ["A guided walkthrough", "We show the passenger app, driver app and dispatcher panel and answer your questions."],
  ["A suggested next step", "A smaller scope, a package from our pricing, or no next step at all."],
];

const FAQS: [string, string][] = [
  ["Is the demo free?", "Yes. A demo is a conversation and a walkthrough of a prototype. It does not commit you to anything."],
  ["What will I see?", "The St Lu prototype: a clickable design of a taxi and tours platform with a passenger app, a driver app and a dispatcher panel."],
  ["Is the prototype a live product?", "No. It is a design prototype with sample data. It shows how a product could work, not live client results."],
  ["Can I try it before we talk?", "Yes. The prototype opens in a new tab and needs no sign-up."],
  ["How do you contact me?", "By email, using the address you enter in the form. We do not call unless you ask us to."],
];

function Body() {
  const { ask } = useShell();
  useSeo({ title: TITLE, description: DESC, path: DEMO_PATH, ld: [crumbLd(CRUMBS), webPageLd(TITLE, DESC, DEMO_PATH), faqLd(FAQS)] });
  return (
    <>
      <section className="hero hero-l hero-svc" id="top">
        <div className="wrap">
          <Crumbs items={CRUMBS} />
          <div className="grid2">
            <div>
              <p className="eyebrow">Book a demo</p>
              <h1>Book a Taxi App Demo: <em>See It Before You Build</em></h1>
              <p className="sub">Click through a working prototype on your own, then ask for a guided walkthrough with the team.</p>
              <div className="hero-btns">
                <button type="button" className="btn btn-primary" onClick={() => ask("Request a demo", { kind: "Request a demo" })}>Request a Demo</button>
                <StluLink to="/" className="btn btn-outline">Open the St Lu prototype</StluLink>
              </div>
            </div>
            <ul className="demo-cards">
              <li><MousePointerClick size={22} aria-hidden /><b>Try it yourself</b><span>Open the prototype in a new tab. No sign-up.</span></li>
              <li><Presentation size={22} aria-hidden /><b>Guided walkthrough</b><span>Passenger app, driver app and dispatcher panel.</span></li>
              <li><Clock size={22} aria-hidden /><b>Weekdays, 9 to 5 ET</b><span>Monday to Friday, Eastern Time (ET), USA.</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="sec sec-white" id="expect" aria-labelledby="h-ex">
        <div className="wrap">
          <p className="eyebrow">What to expect</p>
          <h2 className="h2 wide" id="h-ex">How a demo works</h2>
          <ol className="askl ic" style={{ listStyle: "none", padding: 0 }}>{EXPECT.map(([h, p], i) => <li key={h}><Ic set="expect" i={i} size={20} /><h3>{h}</h3><p>{p}</p></li>)}</ol>
        </div>
      </section>

      <section className="sec sec-gray" id="prepare" aria-labelledby="h-pp">
        <div className="wrap">
          <div className="sh"><div>
          <p className="eyebrow">Get the most from it</p>
          <h2 className="h2 wide" id="h-pp"><CalendarCheck size={26} aria-hidden style={{ verticalAlign: "-4px", marginRight: 8 }} />Helpful to mention in your request</h2>
          </div><Illus name="demo" /></div>
          <Tick items={["The type of business you run, for example taxi company or airport transfers", "The city or area you serve and roughly how many vehicles", "Which parts you care about most: booking, driver app or dispatch", "Whether you already have an app or are starting from scratch"]} />
          <p className="note">Prefer to see the work first? Read the <Link to={ROUTES.portfolio}>St Lu case study</Link>, or check <Link to={ROUTES.pricing}>indicative pricing</Link>.</p>
        </div>
      </section>

      <Faq items={FAQS} onAsk={() => ask("Ask about a demo", { kind: "Request a demo" })} heading="Demo questions, answered" sid="demo-faq" />
      <FinalCta title="Ready to See the Prototype With the Team?" text="Send a short request and we reply with times that suit you." startLabel="Request a Demo" consultLabel="Get a Quote" onStart={() => ask("Request a demo", { kind: "Request a demo" })} onConsult={() => ask("Get a quote", { kind: "Not sure yet" })} />
    </>
  );
}

export default function BookADemo() {
  return <Shell testId="page-tad-demo"><Body /></Shell>;
}
