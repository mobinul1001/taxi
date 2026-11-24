import { Cloud, LayoutDashboard, Plug, Server, Smartphone } from "lucide-react";

/** One technology list for the whole site, so the home page and the service pages cannot disagree. */
const GROUPS = [
  { t: "Mobile", I: Smartphone, why: "Apps that feel native on iOS and Android, from one codebase or from native code.", tech: ["Flutter", "React Native", "Swift", "Kotlin"] },
  { t: "Web and admin", I: LayoutDashboard, why: "Fast dashboards and booking pages that dispatchers and customers use all day.", tech: ["React", "TypeScript"] },
  { t: "Backend", I: Server, why: "Reliable APIs for bookings, dispatch rules, pricing and accounts.", tech: ["Node.js", "Laravel", "REST APIs"] },
  { t: "Infrastructure", I: Cloud, why: "Hosting that scales with your rides, with backups and monitoring.", tech: ["Cloud hosting", "Managed database", "Backups and monitoring"] },
  { t: "Integrations", I: Plug, why: "Proven providers for the parts that should not be built from scratch.", tech: ["Maps and routing", "Payment gateways", "SMS and WhatsApp", "Push notifications"] },
] as const;

export function TechCards() {
  return (
    <ul className="techg">
      {GROUPS.map(({ t, I, why, tech }) => (
        <li key={t}>
          <span className="ic" aria-hidden><I size={22} /></span>
          <h3>{t}</h3>
          <p>{why}</p>
          <ul className="chips-t">{tech.map((x) => <li key={x}>{x}</li>)}</ul>
        </li>
      ))}
    </ul>
  );
}
