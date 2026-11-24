import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "./routes";

type K = keyof typeof ROUTES;

/** One entry per target page: how it is introduced when linked from elsewhere (varied wording, not exact-match anchors). */
const T: Partial<Record<K, [string, string]>> = {
  dev: ["How taxi app development works end to end", "The four connected parts, the build process and the technology behind a taxi platform."],
  booking: ["The passenger booking flow in detail", "Fare estimates, scheduled rides, payments and what happens after the passenger taps Book."],
  custom: ["When a custom-built taxi app makes sense", "Scope your own pricing, dispatch rules and integrations, and compare with white label."],
  whiteLabel: ["Launching faster with a white label taxi app", "What a ready-built, branded platform includes and where its limits are."],
  uber: ["Building an Uber-like ride-hailing marketplace", "How a two-sided marketplace works and what to build first."],
  dispatch: ["Dispatch software for running a fleet", "Dispatcher console, job assignment, zones and live fleet tracking."],
  services: ["Our services, with a deliverable for each stage", "From discovery and design to backend, launch and support."],
  cost: ["What drives the budget of a taxi app", "The factors that move cost, running costs outside development and a scope tool."],
  developers: ["Meet the roles on a taxi app team", "The skills involved and how to evaluate any developer you hire."],
  solutions: ["Find the setup that fits your kind of taxi business", "Taxi companies, airport transfers, corporate and chauffeur services compared."],
  faq: ["Quick answers to common questions", "Passenger and driver apps, dispatch, integrations, support and cost."],
  pricing: ["Indicative packages and timelines", "MVP, Growth and Custom packages, add-ons and how we turn a scope into a quote."],
  portfolio: ["A case study: St Lu Taxi & Tours", "The problem, the platform we designed and what the prototype shows."],
  features: ["Every feature a taxi platform can include", "Passenger, driver, admin and backend features in one catalogue."],
  demo: ["See a working prototype first", "Open the St Lu prototype and request a guided walkthrough."],
  about: ["About the team behind this site", "What we build and the principles we apply to every project."],
};

const MAP: Partial<Record<K, K[]>> = {
  home: ["dev", "dispatch", "about", "faq"],
  dev: ["dispatch", "uber", "solutions", "faq"],
  booking: ["cost", "services", "solutions", "faq"],
  custom: ["whiteLabel", "cost", "developers", "dispatch"],
  whiteLabel: ["cost", "uber", "solutions", "faq"],
  uber: ["custom", "cost", "services", "developers"],
  dispatch: ["uber", "services", "solutions", "faq"],
  services: ["dev", "booking", "solutions", "faq"],
  cost: ["booking", "dispatch", "solutions", "faq"],
  developers: ["custom", "uber", "about", "solutions"],
  about: ["booking", "custom", "whiteLabel", "dispatch"],
  pricing: ["cost", "whiteLabel", "custom", "features"],
  portfolio: ["booking", "dispatch", "features", "pricing"],
  features: ["booking", "dispatch", "custom", "pricing"],
  demo: ["portfolio", "features", "pricing", "solutions"],
};

export function Related({ page }: { page: K }) {
  const keys = MAP[page] ?? [];
  if (!keys.length) return null;
  return (
    <section className="sec sec-gray" aria-labelledby="h-related">
      <div className="wrap">
        <p className="eyebrow">Keep exploring</p>
        <h2 className="h2 wide" id="h-related">Related pages for your taxi app project</h2>
        <ul className="xplore">
          {keys.map((k) => { const [h, p] = T[k]!; return <li key={k}><h3><Link to={ROUTES[k]}>{h}</Link></h3><p>{p}</p></li>; })}
        </ul>
        <div className="more"><Link className="link" to={ROUTES.contact}>Discuss your project with our team <ArrowRight size={16} aria-hidden /></Link></div>
      </div>
    </section>
  );
}
