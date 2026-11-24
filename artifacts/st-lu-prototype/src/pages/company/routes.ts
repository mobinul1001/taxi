import { ORIGIN, PATHS } from "./routePaths";
export { ORIGIN };

/** True in the build made for taxiappdevelopment.org (VITE_SITE=agency): only the agency pages, homepage at "/". */
export const AGENCY = import.meta.env.VITE_SITE === "agency";

export const ROUTES = { ...PATHS, home: (AGENCY ? "/" : PATHS.home) as string } as const;


/** The production path of each page (the homepage is "/" there). */
export const canonicalOf = (path: string) => (path === ROUTES.home ? `${ORIGIN}/` : `${ORIGIN}${path}`);

/** Matches every route owned by the agency site (used so the St Lu title logic leaves them alone). */
export const COMPANY_PATH = /^\/(taxi-app-development|taxi-booking-app-development|custom-taxi-app-development|white-label-taxi-app|uber-clone-app-development|taxi-dispatch-software|taxi-app-developers|taxi-app-solutions|privacy-policy|terms-and-conditions|cookie-policy|disclaimer|about-us|pricing|portfolio|features|book-a-demo|faq|sitemap|thank-you|contact\/?$)/;
