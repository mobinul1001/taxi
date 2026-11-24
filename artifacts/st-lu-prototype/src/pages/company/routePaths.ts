/** Pure data (no Vite or browser APIs) so the build plugin can read it too. */
export const ORIGIN = "https://taxiappdevelopment.org";

/** Every agency path. The homepage is "/" on the agency site itself; in the St Lu prototype build "/" is the St Lu hub. */
export const PATHS = {
  /** The agency homepage. In production this is "/"; in this prototype "/" is the St Lu hub. */
  home: "/taxi-app-development-company/",
  dev: "/taxi-app-development/",
  booking: "/taxi-booking-app-development/",
  custom: "/custom-taxi-app-development/",
  whiteLabel: "/white-label-taxi-app/",
  uber: "/uber-clone-app-development/",
  dispatch: "/taxi-dispatch-software/",
  services: "/taxi-app-development-services/",
  cost: "/taxi-app-development-cost/",
  developers: "/taxi-app-developers/",
  solutions: "/taxi-app-solutions/",
  contact: "/contact/",
  privacy: "/privacy-policy/",
  terms: "/terms-and-conditions/",
  cookies: "/cookie-policy/",
  disclaimer: "/disclaimer/",
  about: "/about-us/",
  pricing: "/pricing/",
  blog: "/blog/",
  portfolio: "/portfolio/",
  features: "/features/",
  demo: "/book-a-demo/",
  faq: "/faq/",
  sitemap: "/sitemap/",
  thankYou: "/thank-you/",
} as const;