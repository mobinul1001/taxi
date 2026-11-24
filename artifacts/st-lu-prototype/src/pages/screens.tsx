import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/kit";
import { setSession } from "@/lib/store";

const AREAS: { area: string; role?: "passenger" | "driver"; items: [string, string, string][] }[] = [
  { area: "Mobile app · entry", items: [["Main", "Welcome", "/app/welcome"], ["P02", "Login", "/app/login"]] },
  { area: "Mobile app · passenger", role: "passenger", items: [["P03", "Home", "/app/home"], ["P04", "Book route", "/app/book/route"], ["P05", "Trip details", "/app/book/details"], ["P06", "Fare summary", "/app/book/fare"], ["P07", "Payment", "/app/book/payment"], ["P08", "Booking confirmed", "/app/book/confirmed"], ["P09", "My trips", "/app/trips"], ["P10", "Trip detail", "/app/trips/SLU-48213"], ["P11", "Cancel sheet", "/app/trips/SLU-48315/cancel"], ["P12", "Live trip", "/app/trips/SLU-48213/live"], ["P13", "Arrived and rate", "/app/trips/SLU-47102/complete"], ["P14", "Alerts", "/app/alerts"], ["P15", "Account", "/app/account"]] },
  { area: "Mobile app · driver", role: "driver", items: [["D01", "Jobs", "/app/driver/jobs"], ["D02", "New trip assigned", "/app/driver/new-trip"], ["D03", "Trip detail", "/app/driver/trips/SLU-48318"], ["D04-D06", "Trip progress", "/app/driver/trips/SLU-48290/progress"], ["D07", "Completed", "/app/driver/trips/SLU-48251/done"], ["D08", "Earnings", "/app/driver/earnings"], ["D09", "Profile", "/app/driver/profile"], ["D10", "Alerts", "/app/driver/alerts"]] },
  { area: "Outside driver link", items: [["O01-O03", "Job link (accept, progress, done)", "/job/job-slu-48298"]] },
  { area: "Admin", items: [["A01", "Admin sign in", "/admin/login"], ["A02", "Dashboard", "/admin"], ["A03", "Bookings", "/admin/bookings"], ["A04", "Assign driver (from Bookings)", "/admin/bookings"], ["Drawer", "Booking detail drawer", "/admin/bookings?booking=SLU-48213"], ["A05", "Live map", "/admin/live-map"], ["A06", "Drivers", "/admin/drivers"], ["Detail", "Driver detail", "/admin/drivers/DRV-007"], ["A07", "Pricing", "/admin/pricing"], ["A08", "Refunds", "/admin/refunds"], ["Extra", "Passengers", "/admin/passengers"], ["Extra", "Passenger detail", "/admin/passengers/maria.thompson%40email.com"], ["Extra", "Reports", "/admin/reports"], ["Extra", "Settings", "/admin/settings"]] },
  { area: "More passenger screens", role: "passenger", items: [["N01", "Quote request sent (Home, Chauffeur, Request quote)", "/app/quote/sent"], ["N02", "Choose a tour", "/app/book/tour"], ["N03", "Round-Trip details", "/app/book/round-trip"], ["N04", "Payment did not go through", "/app/book/payment-failed"], ["N05", "Receipt", "/app/trips/SLU-47102/receipt"], ["N06", "Trip cancelled", "/app/trips/SLU-46890/cancelled"], ["N07", "My trips, empty (create a new account)", "/app/welcome"], ["N08", "Alerts, empty (create a new account)", "/app/welcome"], ["N09", "Log out sheet (Account, Log out)", "/app/account"], ["N10", "Add a card", "/app/account/cards/new"], ["N11", "Your flight is late", "/app/alerts/flight-delayed"], ["Terms", "Terms and privacy", "/app/terms"]] },
  { area: "More driver screens", role: "driver", items: [["N12", "Reminder banner on the driver jobs screen", "/app/driver/jobs"], ["N13", "Trip changed", "/app/driver/trips/SLU-48318/changed"], ["N14", "Renew insurance", "/app/driver/renew"], ["N15", "My trips, driver", "/app/driver/trips"], ["N16", "Send renewal", "/app/driver/renew/upload"], ["N09", "Log out sheet (Profile, Log out)", "/app/driver/profile"]] },
  { area: "New screens · outside driver and admin", items: [["N17", "Your job was updated (use 'Flight delayed' on the start page)", "/job/job-slu-48298"], ["N18", "Bookings, empty (search zzz)", "/admin/bookings"], ["N19", "Cancel booking? (drawer, Cancel)", "/admin/bookings?booking=SLU-48307"], ["N20", "Change status (drawer, status)", "/admin/bookings?booking=SLU-48290"], ["N21", "Disconnect Stripe? (Settings)", "/admin/settings"], ["N22", "Job link sent (Assign an outside driver)", "/admin/bookings"], ["N23", "Account menu and log out (SG avatar)", "/admin"], ["N24", "Reset your password", "/admin/forgot-password"]] },
  { area: "Extras", items: [["Hub", "Start page", "/"], ["Landing", "Landing page", "/landing"], ["Messages", "SMS and WhatsApp previews", "/previews/messages"]] },
];

/**
 * The internal codes (P03, N11) and the bracketed notes saying how to reach a screen were working
 * shorthand for building the thing; on a page a client opens they read as a test matrix. The data keeps
 * the codes so links stay stable, the page shows the plain name.
 */
const label = (name: string) => name.replace(/\s*\([^)]*\)\s*$/, "").trim();

export default function Screens() {
  return (
    <div className="bar-clear min-h-[100dvh] bg-ground">
      <header className="on-dark bg-green-night text-white"><div className="mx-auto flex min-h-16 w-full max-w-[1200px] flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2 sm:px-8 lg:px-10"><Link to="/" className="tap inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-3.5 text-[13px] font-semibold hover:bg-white/20"><ArrowLeft size={16} />Start page</Link><Logo size="sm" /><h1 className="font-display text-[20px] font-bold">All screens</h1></div></header>
      <main className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10">
        {AREAS.map(({ area, role, items }) => (
          <section key={area} className="mb-8">
            <h2 className="font-display text-[20px] font-bold">{area}</h2>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(([code, name, to]) => (
                <Link key={code + name} to={to} onClick={() => role && setSession(role === "driver" ? { role, driverId: "DRV-007" } : { role })} className="lift flex min-w-0 items-center gap-3 rounded-lg border border-line bg-paper p-3.5 shadow-e1 hover:border-green">
                  <span className="min-w-0 flex-1"><b className="block text-[15px] leading-snug">{label(name)}</b><span className="block break-all font-mono text-[12px] text-mute">{to}</span></span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
