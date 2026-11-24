import { Suspense, lazy } from "react";
import { BrowserRouter, HashRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "@/pages/company/routes";
import { Shell } from "@/pages/company/shell";
import { useSeo } from "@/pages/company/seo";

/**
 * The app for taxiappdevelopment.org (VITE_SITE=agency): the agency pages only, with the homepage at "/".
 * The St Lu prototype has its own build and its own host; none of its screens exist here, so none can be crawled.
 */
const Company = lazy(() => import("@/pages/company"));
const TaxiAppDev = lazy(() => import("@/pages/company/taxi-app-development"));
const TaxiBooking = lazy(() => import("@/pages/company/taxi-booking-app-development"));
const CustomTaxi = lazy(() => import("@/pages/company/custom-taxi-app-development"));
const WhiteLabel = lazy(() => import("@/pages/company/white-label-taxi-app"));
const UberLike = lazy(() => import("@/pages/company/uber-clone-app-development"));
const Dispatch = lazy(() => import("@/pages/company/taxi-dispatch-software"));
const TadServices = lazy(() => import("@/pages/company/taxi-app-development-services"));
const TadCost = lazy(() => import("@/pages/company/taxi-app-development-cost"));
const TadDevelopers = lazy(() => import("@/pages/company/taxi-app-developers"));
const TadSolutions = lazy(() => import("@/pages/company/taxi-app-solutions"));
const TadContact = lazy(() => import("@/pages/company/contact"));
const TadPrivacy = lazy(() => import("@/pages/company/legal").then((m) => ({ default: m.Privacy })));
const TadTerms = lazy(() => import("@/pages/company/legal").then((m) => ({ default: m.Terms })));
const TadCookies = lazy(() => import("@/pages/company/legal").then((m) => ({ default: m.Cookies })));
const TadDisclaimer = lazy(() => import("@/pages/company/legal").then((m) => ({ default: m.Disclaimer })));
const TadAbout = lazy(() => import("@/pages/company/about-us"));
const TadFaq = lazy(() => import("@/pages/company/faq"));
const TadSitemap = lazy(() => import("@/pages/company/sitemap"));
const TadThanks = lazy(() => import("@/pages/company/thank-you"));
const TadPricing = lazy(() => import("@/pages/company/pricing"));
const TadPortfolio = lazy(() => import("@/pages/company/portfolio"));
const TadFeatures = lazy(() => import("@/pages/company/features"));
const TadDemo = lazy(() => import("@/pages/company/book-a-demo"));

function NotFoundBody() {
  // A missing page must not be indexed. (The host should also answer it with status 404; see README.)
  useSeo({ title: "Page not found | TaxiAppDevelopment.org", description: "This page does not exist on TaxiAppDevelopment.org.", path: "/404/", ld: [], robots: "noindex, follow" });
  return (
    <section className="docs-hero thanks" id="top">
      <div className="wrap">
        <h1>Page not found</h1>
        <p className="sub">The page you asked for does not exist. These pages may help.</p>
        <div className="hero-btns">
          <Link className="btn btn-primary" to={ROUTES.home}>Go to the homepage</Link>
          <Link className="btn btn-outline" to={ROUTES.services}>Our services</Link>
          <Link className="btn btn-outline" to={ROUTES.sitemap}>Sitemap</Link>
        </div>
        <h2 style={{ fontSize: 20, marginTop: 34 }}>Popular pages</h2>
        <ul className="xplore">
          {([["Taxi app pricing", "Indicative packages and timelines.", ROUTES.pricing], ["Taxi app features", "Everything a taxi platform can include.", ROUTES.features], ["Portfolio", "The St Lu Taxi & Tours case study.", ROUTES.portfolio], ["Book a demo", "See the prototype with the team.", ROUTES.demo]] as const).map(([h, p, to]) => <li key={to}><h3><Link to={to}>{h}</Link></h3><p>{p}</p></li>)}
        </ul>
      </div>
    </section>
  );
}
const NotFound = () => <Shell testId="page-tad-404"><NotFoundBody /></Shell>;

export default function AgencyApp() {
  const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter;
  return (
    <Router {...(import.meta.env.VITE_HASH_ROUTER ? {} : { basename: import.meta.env.BASE_URL.replace(/\/$/, "") })}>
      <Suspense fallback={<div role="status" aria-label="Loading" style={{ minHeight: "100vh" }} />}>
        <Routes>
          <Route path={ROUTES.home} element={<Company />} />
          {/* The old prototype address of the homepage is not a second URL: it goes to "/". */}
          <Route path="/taxi-app-development-company/" element={<Navigate to={ROUTES.home} replace />} />
          <Route path={ROUTES.dev} element={<TaxiAppDev />} />
          <Route path={ROUTES.booking} element={<TaxiBooking />} />
          <Route path={ROUTES.custom} element={<CustomTaxi />} />
          <Route path={ROUTES.whiteLabel} element={<WhiteLabel />} />
          <Route path={ROUTES.uber} element={<UberLike />} />
          <Route path={ROUTES.dispatch} element={<Dispatch />} />
          <Route path={ROUTES.services} element={<TadServices />} />
          <Route path={ROUTES.cost} element={<TadCost />} />
          <Route path={ROUTES.developers} element={<TadDevelopers />} />
          <Route path={ROUTES.solutions} element={<TadSolutions />} />
          <Route path={ROUTES.contact} element={<TadContact />} />
          <Route path={ROUTES.privacy} element={<TadPrivacy />} />
          <Route path={ROUTES.terms} element={<TadTerms />} />
          <Route path={ROUTES.cookies} element={<TadCookies />} />
          <Route path={ROUTES.disclaimer} element={<TadDisclaimer />} />
          <Route path={ROUTES.about} element={<TadAbout />} />
          <Route path={ROUTES.faq} element={<TadFaq />} />
          <Route path={ROUTES.sitemap} element={<TadSitemap />} />
          <Route path={ROUTES.thankYou} element={<TadThanks />} />
          <Route path={ROUTES.pricing} element={<TadPricing />} />
          <Route path={ROUTES.portfolio} element={<TadPortfolio />} />
          <Route path={ROUTES.features} element={<TadFeatures />} />
          <Route path={ROUTES.demo} element={<TadDemo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
