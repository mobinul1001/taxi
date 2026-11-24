import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Info } from "lucide-react";
import { useSeo } from "./seo";
import { Shell } from "./shell";
import { ROUTES } from "./routes";
import { DELIVERY_LIVE } from "./formFlow";

const TITLE = "Thank You | TaxiAppDevelopment.org";
const DESC = "Confirmation page for enquiries sent through the TaxiAppDevelopment.org contact form.";

function Body() {
  // Not indexed: this page only makes sense straight after a submission.
  useSeo({ title: TITLE, description: DESC, path: ROUTES.thankYou, ld: [], robots: "noindex, follow" });
  const st = (useLocation().state ?? null) as { submitted?: boolean } | null;
  const ok = st?.submitted === true;
  return (
    <section className="docs-hero thanks" id="top">
      <div className="wrap">
        {ok ? (
          <div role="status">
            <CheckCircle2 size={44} color="#0a8f55" aria-hidden />
            <h1>Thank you for your enquiry</h1>
            <p className="sub">We have your details. We will read your message and reply with questions and a suggested next step.</p>
            {!DELIVERY_LIVE && <p className="note"><Info size={16} aria-hidden style={{ verticalAlign: "-3px" }} /> This is a design prototype, so nothing was sent anywhere. On the live site this form goes to the TaxiAppDevelopment.org team.</p>}
          </div>
        ) : (
          <div>
            <h1>No enquiry has been sent</h1>
            <p className="sub">This page confirms an enquiry once you have sent one. If you meant to get in touch, the contact form is the place to start.</p>
            <div className="hero-btns"><Link className="btn btn-primary" to={ROUTES.contact}>Go to the Contact Form</Link></div>
          </div>
        )}
        <h2 style={{ fontSize: 20, marginTop: 34 }}>{ok ? "While you wait" : "Or explore"}</h2>
        <ul className="xplore">
          {([["Back to the homepage", "See what we build.", ROUTES.home], ["Taxi app solutions", "Find the setup that fits your business.", ROUTES.solutions], ["Taxi app development cost", "See what drives the budget.", ROUTES.cost], ["Frequently asked questions", "Quick answers about taxi app projects.", ROUTES.faq]] as [string, string, string][]).map(([h, p, to]) => <li key={h}><h3>{h}</h3><p>{p}</p><Link className="link" to={to}>Open <span className="sr">{h}</span></Link></li>)}
        </ul>
      </div>
    </section>
  );
}

export default function ThankYou() {
  return <Shell testId="page-tad-thanks"><Body /></Shell>;
}
