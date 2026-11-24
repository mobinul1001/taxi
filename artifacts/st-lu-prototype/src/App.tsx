import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, HashRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "@/components/kit";

// Loaded only when someone opens them, so the start page does not carry the office side, the guided
// tour, the device lab and the screen index in its first download.
const AdminRoutes = lazy(() => import("@/routes/admin-routes"));
const GuidedDemo = lazy(() => import("@/pages/demo"));
const Messages = lazy(() => import("@/pages/messages"));
const Screens = lazy(() => import("@/pages/screens"));
import { COMPANY_PATH, ROUTES } from "@/pages/company/routes";
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
const DeviceLab = lazy(() => import("@/pages/lab").then((m) => ({ default: m.DeviceLab })));
import { PhoneFrame } from "@/components/mobile";
import { startTicker, useAppState } from "@/lib/store";
import Hub from "@/pages/hub";
import Landing from "@/pages/landing";
import JobLink from "@/pages/job-link";
import { AppIndex, Login, Welcome } from "@/pages/app/entry";
import { PassengerHome } from "@/pages/app/home";
import { BookDetails, BookRoute, Confirmed, Fare, Payment } from "@/pages/app/book";
import { CancelTrip, TripDetail, Trips } from "@/pages/app/trips";
import { LiveTrip, RateTrip } from "@/pages/app/live";
import { Account, PassengerAlerts } from "@/pages/app/account";
import { DriverAlerts, DriverJobs, DriverProfile, DriverTrip, Earnings, NewTrip } from "@/pages/app/driver";
import { DriverDone, DriverProgress } from "@/pages/app/driver-progress";
import { AddCard, ChooseTour, FlightDelayed, PaymentFailed, QuoteSent, Receipt, RoundTripDetails, Terms, TripCancelled } from "@/pages/app/extra-passenger";
import { DriverAllTrips, RenewInsurance, RenewUpload, TripChanged } from "@/pages/app/extra-driver";
import { Photo } from "@/components/photo";
import { LogoMark } from "@/components/kit";
import { Phone } from "lucide-react";

function NotFound() {
  const s = useAppState();
  const phone = s.settings.phones?.[0] ?? "+1 758-732-4553";
  return (
    <div className="bar-clear app-minvh relative flex flex-col items-center justify-center overflow-hidden bg-ground px-5 py-12 text-center">
      <div aria-hidden className="absolute inset-0">
        <Photo slot="extra-taxi-pitons" sizes="100vw" priority scrim="bottom" />
        <span className="absolute inset-0 bg-ground/55 dark:bg-ink/55" />
      </div>
      <div className="relative z-10 w-full max-w-[520px] rounded-3xl border border-line bg-paper/95 p-7 shadow-e3 backdrop-blur-sm sm:p-9">
        <span className="mx-auto flex items-center justify-center gap-2"><LogoMark size={36} /><span className="font-serif text-[20px] font-semibold tracking-[-0.02em]">St Lu</span></span>
        <p className="mt-5 text-[13px] font-bold uppercase tracking-[0.2em] text-cta">404</p>
        <h1 className="t-display mt-1 text-[clamp(26px,5vw,36px)] leading-tight">This road does not lead anywhere.</h1>
        <p className="mt-2 text-[14px] leading-snug text-mute">The page you asked for is not part of the app. These two will get you back on the road.</p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link to="/app/book/route" data-testid="link-404-book" className="tap inline-flex min-h-12 items-center justify-center rounded-lg bg-cta px-5 text-[15px] font-bold text-cta-ink">Plan a ride</Link>
          <Link to="/" data-testid="link-404-home" className="tap inline-flex min-h-12 items-center justify-center rounded-lg border border-line-strong bg-paper px-5 text-[15px] font-bold text-ink">Back to home</Link>
        </div>
        <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="tap mt-5 inline-flex min-h-11 items-center justify-center gap-2 text-[14px] font-semibold text-green hover:underline"><Phone size={15} />{phone}</a>
        <p className="mt-1 text-[13px] text-mute">Morne Fortune, Castries, St. Lucia</p>
      </div>
    </div>
  );
}

/**
 * One page, one title. Every route used to share "St Lu Taxi And Tours", so a shared or bookmarked
 * link said nothing about where it led and a browser's history was a wall of identical rows.
 */
const TITLES: [RegExp, string][] = [
  [/^\/landing/, "Airport transfers and tours in St. Lucia"],
  [/^\/demo/, "Guided demo tour"],
  [/^\/screens/, "All screens"],
  [/^\/lab/, "Phone and tablet sizes"],
  [/^\/previews\/messages/, "Messages"],
  [/^\/job\//, "Your job from dispatch"],
  [/^\/admin\/bookings/, "Bookings · Admin"],
  [/^\/admin\/live-map/, "Live map · Admin"],
  [/^\/admin\/drivers/, "Drivers · Admin"],
  [/^\/admin\/passengers/, "Passengers · Admin"],
  [/^\/admin\/pricing/, "Prices · Admin"],
  [/^\/admin\/refunds/, "Refunds · Admin"],
  [/^\/admin\/reports/, "Reports · Admin"],
  [/^\/admin\/settings/, "Settings · Admin"],
  [/^\/admin/, "Admin panel"],
  [/^\/app\/driver/, "Driver app"],
  [/^\/app\/book/, "Book a ride"],
  [/^\/app\/trips/, "My trips"],
  [/^\/app\/account/, "Account"],
  [/^\/app/, "St Lu app"],
];

function Title() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (COMPANY_PATH.test(pathname)) return; // the agency pages set their own title and meta (pages/company/seo.tsx)
    const found = TITLES.find(([re]) => re.test(pathname));
    document.title = found ? `${found[1]} · St Lu Taxi And Tours` : "St Lu Taxi And Tours";
  }, [pathname]);
  return null;
}

function App() {
  useEffect(() => startTicker(), []);
  // HashRouter is used only for the portable static preview build (VITE_HASH_ROUTER=1).
  const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter;
  return (
    <Router {...(import.meta.env.VITE_HASH_ROUTER ? {} : { basename: import.meta.env.BASE_URL.replace(/\/$/, "") })}>
      <Title />
      {/* The lazy groups above arrive as their own files; this is what fills the screen while one
          is on its way. It matches the boot splash in index.html so the two do not look different. */}
      <Suspense fallback={<div className="app-minvh flex items-center justify-center bg-ground"><span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-green" aria-label="Loading" role="status" /></div>}>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/landing" element={<Landing />} />
        <Route path={ROUTES.home} element={<Company />} />
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
        <Route path="/demo" element={<GuidedDemo />} />
        <Route path="/lab" element={<DeviceLab />} />
        <Route path="/previews/messages" element={<Messages />} />
        <Route path="/screens" element={<Screens />} />
        <Route path="/job/:token" element={<JobLink />} />
        <Route path="/app" element={<PhoneFrame />}>
          <Route index element={<AppIndex />} />
          <Route path="welcome" element={<Welcome />} />
          <Route path="login" element={<Login />} />
          <Route path="home" element={<PassengerHome />} />
          <Route path="book/route" element={<BookRoute />} />
          <Route path="book/tour" element={<ChooseTour />} />
          <Route path="book/round-trip" element={<RoundTripDetails />} />
          <Route path="book/payment-failed" element={<PaymentFailed />} />
          <Route path="quote/sent" element={<QuoteSent />} />
          <Route path="trips/:id/receipt" element={<Receipt />} />
          <Route path="trips/:id/cancelled" element={<TripCancelled />} />
          <Route path="alerts/flight-delayed" element={<FlightDelayed />} />
          <Route path="account/cards/new" element={<AddCard />} />
          <Route path="terms" element={<Terms />} />
          <Route path="driver/trips" element={<DriverAllTrips />} />
          <Route path="driver/trips/:id/changed" element={<TripChanged />} />
          <Route path="driver/renew" element={<RenewInsurance />} />
          <Route path="driver/renew/upload" element={<RenewUpload />} />
          <Route path="book/details" element={<BookDetails />} />
          <Route path="book/fare" element={<Fare />} />
          <Route path="book/payment" element={<Payment />} />
          <Route path="book/confirmed" element={<Confirmed />} />
          <Route path="trips" element={<Trips />} />
          <Route path="trips/:id" element={<TripDetail />} />
          <Route path="trips/:id/cancel" element={<CancelTrip />} />
          <Route path="trips/:id/live" element={<LiveTrip />} />
          <Route path="trips/:id/complete" element={<RateTrip />} />
          <Route path="alerts" element={<PassengerAlerts />} />
          <Route path="account" element={<Account />} />
          <Route path="driver/jobs" element={<DriverJobs />} />
          <Route path="driver/new-trip" element={<NewTrip />} />
          <Route path="driver/trips/:id" element={<DriverTrip />} />
          <Route path="driver/trips/:id/progress" element={<DriverProgress />} />
          <Route path="driver/trips/:id/done" element={<DriverDone />} />
          <Route path="driver/earnings" element={<Earnings />} />
          <Route path="driver/profile" element={<DriverProfile />} />
          <Route path="driver/alerts" element={<DriverAlerts />} />
        </Route>
        <Route path="/admin/*" element={<AdminRoutes notFound={<NotFound />} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      <Toaster />
    </Router>
  );
}

export default App;
