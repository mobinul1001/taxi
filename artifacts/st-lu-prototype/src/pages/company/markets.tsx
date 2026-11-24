import { Globe2 } from "lucide-react";

/**
 * Markets we build for. Kept general on purpose: no licence, law number or provider is claimed for a market.
 * Each entry says only what usually differs there; the operator confirms the rules with their own adviser.
 */
const MARKETS: [string, string][] = [
  ["USA", "Taxi and ride-hailing rules are usually set by the state and the city, and privacy rules can differ by state."],
  ["United Kingdom", "Licensing is usually handled by local licensing authorities, and UK data protection rules apply to passenger and driver data."],
  ["Canada", "Licensing is usually set by province and city, and privacy rules apply federally and by province. Some regions need French as well as English."],
  ["Australia", "Rules are usually set by each state or territory, so a platform for two states may need two sets of settings."],
  ["Europe", "Rules differ country by country, EU data protection rules apply to personal data, and several languages and currencies are often needed."],
  ["Caribbean", "Rules, currencies and available payment providers can differ from island to island, so these are confirmed market by market."],
];

const SETUP = ["Currency and language", "Payment gateway your country supports", "SMS and WhatsApp provider", "Maps and routing coverage", "Driver and vehicle documents and expiry reminders", "Pricing and areas per city"];

export function Markets() {
  return (
    <section className="sec sec-white" id="markets" aria-labelledby="h-mk">
      <div className="wrap">
        <p className="eyebrow">Markets</p>
        <h2 className="h2 wide" id="h-mk">Built for taxi businesses in different markets</h2>
        <p className="lede">The platform is the same idea everywhere. What changes is the setup around it, and the local rules your business has to follow.</p>
        <ul className="techg mk">
          {MARKETS.map(([n, d]) => (
            <li key={n}><span className="ic" aria-hidden><Globe2 size={22} /></span><h3>{n}</h3><p>{d}</p></li>
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
