import { ArrowRight } from "lucide-react";
import { useToSection } from "./shell";
import { ROUTES } from "./routes";

/**
 * Markets we build for. Kept general on purpose: no licence, law number or provider is claimed for a market.
 * Each entry says only what usually differs there; the operator confirms the rules with their own adviser.
 */
const CODE: Record<string, string> = { USA: "US", "United Kingdom": "UK", Canada: "CA", Australia: "AU", Europe: "EU", Caribbean: "CB" };
const MARKETS: [string, string][] = [
  ["USA", "Taxi and ride-hailing rules are usually set by the state and the city, and privacy rules can differ by state."],
  ["United Kingdom", "Licensing is usually handled by local licensing authorities, and UK data protection rules apply to passenger and driver data."],
  ["Canada", "Licensing is usually set by province and city, and privacy rules apply federally and by province. Some regions need French as well as English."],
  ["Australia", "Rules are usually set by each state or territory, so a platform for two states may need two sets of settings."],
  ["Europe", "Rules differ country by country, EU data protection rules apply to personal data, and several languages and currencies are often needed."],
  ["Caribbean", "Rules, currencies and available payment providers can differ from island to island, so these are confirmed market by market."],
];

const SETUP = ["Currency and language", "Payment gateway your country supports", "SMS and WhatsApp provider", "Maps and routing coverage", "Distance in miles or kilometres, date and time formats", "Driver and vehicle documents and expiry reminders", "Pricing and areas per city"];

export function Markets() {
  return (
    <section className="sec sec-white" id="markets" aria-labelledby="h-mk">
      <div className="wrap">
        <p className="eyebrow">Markets</p>
        <h2 className="h2 wide" id="h-mk">Built for taxi businesses in different markets</h2>
        <p className="lede">The platform is the same idea everywhere. What changes is the setup around it, and the local rules your business has to follow.</p>
        <ul className="techg mk">
          {MARKETS.map(([n, d]) => (
            <li key={n}><span className="ic code" aria-hidden>{CODE[n]}</span><h3>{n}</h3><p>{d}</p></li>
          ))}
        </ul>
        <div className="mk-set">
          <h3>What we set up for your market</h3>
          <ul>{SETUP.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <p className="note">This is general information, not legal advice. Licensing, tax and data protection rules depend on where you operate. Please confirm them with your own legal adviser. We do not hold or arrange taxi licences for you.</p>
      </div>
    </section>
  );
}

/** What each market card already says, in a few words (same facts as the Markets section). */
const SHORT: Record<string, string> = { USA: "State and city rules", "United Kingdom": "Local licensing authorities", Canada: "Province and city rules, English and French", Australia: "State and territory rules", Europe: "Country by country, many languages", Caribbean: "Island by island" };

/** A short pointer to the Markets section, for the homepage and the About page. */
export function MarketsStrip() {
  const to = useToSection();
  return (
    <section className="sec sec-navy mk-strip" aria-labelledby="h-mks">
      <svg className="mks-dots" aria-hidden viewBox="0 0 600 300" preserveAspectRatio="xMaxYMid slice">
        <defs><pattern id="mkd" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#fff" fillOpacity=".16" /></pattern></defs>
        <rect width="600" height="300" fill="url(#mkd)" />
        <g stroke="#22d3ee" strokeOpacity=".16" strokeWidth="1.2" fill="none"><path d="M90 200 L210 120 L340 170 L470 80 L540 150" /><path d="M210 120 L260 40 L470 80" /><path d="M340 170 L400 250" /></g>
        <g fill="#22d3ee" opacity=".5">{[[90, 200], [210, 120], [340, 170], [470, 80], [540, 150], [260, 40], [400, 250]].map(([x, y]) => <g key={`${x}${y}`}><circle cx={x} cy={y} r="9" fillOpacity=".18" /><circle cx={x} cy={y} r="4" /></g>)}</g>
      </svg>
      <div className="wrap">
        <div className="mks">
          <div>
            <p className="eyebrow">Markets</p>
            <h2 className="h2" id="h-mks">Built for operators in six markets</h2>
            <p className="lede">The same platform, set up for your currency, language, payments and local rules.</p>
            <button type="button" className="btn btn-primary" onClick={() => to(ROUTES.solutions, "markets")}>See what changes by market <ArrowRight size={16} aria-hidden /></button>
          </div>
          <ul aria-label="Markets">{Object.entries(CODE).map(([n, c]) => <li key={n}><b aria-hidden>{c}</b><span><strong>{n}</strong><small>{SHORT[n]}</small></span></li>)}</ul>
        </div>
      </div>
    </section>
  );
}
