import { ROUTES } from "./routes";

export type Group = "Main pages" | "Services" | "Solutions" | "Resources" | "Legal" | "hidden";

/**
 * Every agency route and where it belongs in the public HTML sitemap. It is a Record over the keys of ROUTES,
 * so adding a route to ROUTES without classifying it here is a type error: the sitemap cannot fall behind.
 * "hidden" routes (the thank-you page) are never listed.
 */
export const PAGE_INFO: Record<keyof typeof ROUTES, { label: string; group: Group; desc: string }> = {
  home: { label: "Taxi App Development Company", group: "Main pages", desc: "Who we are and what we build." },
  about: { label: "About Us", group: "Main pages", desc: "What we do and how we work." },
  contact: { label: "Contact", group: "Main pages", desc: "Request a project consultation." },
  dev: { label: "Taxi App Development", group: "Services", desc: "Apps, backend and the ways to build." },
  services: { label: "Taxi App Development Services", group: "Services", desc: "Every service and its deliverables." },
  booking: { label: "Taxi Booking App Development", group: "Services", desc: "Booking flow, dispatch and payments." },
  custom: { label: "Custom Taxi App Development", group: "Services", desc: "A platform built around your operation." },
  whiteLabel: { label: "White Label Taxi App", group: "Services", desc: "A finished platform branded as yours." },
  developers: { label: "Taxi App Developers", group: "Services", desc: "The team and how we work together." },
  solutions: { label: "Taxi App Solutions", group: "Solutions", desc: "By business model, operation and fleet size." },
  uber: { label: "Uber-Like App Development", group: "Solutions", desc: "Your own ride-hailing marketplace." },
  dispatch: { label: "Taxi Dispatch Software", group: "Solutions", desc: "Assign jobs and run the fleet." },
  pricing: { label: "Taxi App Pricing", group: "Resources", desc: "Indicative packages, timelines and add-ons." },
  portfolio: { label: "Portfolio: St Lu Taxi & Tours", group: "Main pages", desc: "A case study: a taxi and tours platform prototype." },
  features: { label: "Taxi App Features", group: "Solutions", desc: "Passenger, driver, admin and backend features." },
  cost: { label: "Taxi App Development Cost", group: "Resources", desc: "What drives the budget." },
  faq: { label: "FAQ", group: "Resources", desc: "Answers about taxi app projects." },
  privacy: { label: "Privacy Policy", group: "Legal", desc: "How personal information is handled." },
  terms: { label: "Terms and Conditions", group: "Legal", desc: "Terms for using this website." },
  cookies: { label: "Cookie Policy", group: "Legal", desc: "How cookies and similar tools are used." },
  disclaimer: { label: "Disclaimer", group: "Legal", desc: "What the information on this site is and is not." },
  thankYou: { label: "Thank You", group: "hidden", desc: "" },
};

export const GROUP_ORDER: Exclude<Group, "hidden">[] = ["Main pages", "Services", "Solutions", "Resources", "Legal"];

export function sitemapGroups() {
  return GROUP_ORDER.map((g) => ({
    group: g,
    pages: [
      ...(Object.keys(ROUTES) as (keyof typeof ROUTES)[]).filter((k) => PAGE_INFO[k].group === g).map((k) => ({ ...PAGE_INFO[k], to: ROUTES[k] })),
    ],
  }));
}
