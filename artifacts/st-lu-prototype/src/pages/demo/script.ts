/**
 * Guided demo script.
 *
 * Every step carries a COMPLETE snapshot of the demo state, so Back, jump-to-step and restart are
 * exact: the frames always render `steps[i].s` and never replay side effects. The three frames
 * (passenger, driver, admin) read the same snapshot, which is what makes them move together.
 *
 * This state is separate from the real prototype store: running the demo never changes the
 * bookings, drivers or revenue a client sees in the admin panel.
 */

export type FrameKey = "passenger" | "admin" | "driver";
export type PaxScreen = "book" | "price" | "pay" | "confirmed" | "waiting" | "assigned" | "live" | "rating" | "cancelled" | "quote";
export type DrvScreen = "off" | "new" | "accepted" | "enroute" | "arrived" | "onboard" | "heading" | "earnings";
export type AdmScreen = "quiet" | "new" | "detail" | "assign" | "track" | "done" | "refund" | "quotes";

export interface DemoState {
  pax: PaxScreen;
  drv: DrvScreen;
  adm: AdmScreen;
  /** Admin row status label, "" while there is no booking yet. */
  status: string;
  tone: "neutral" | "warn" | "ok" | "err" | "info";
  alert: boolean;
  driver: boolean;
  eta: number;
  progress: number;
  earnings: number;
  revenue: number;
  trips: number;
}

export interface Step {
  n: number;
  title: string;
  say: string;
  actor: FrameKey | null;
  /** data-tap value of the control the actor presses in this step. */
  tap?: string;
  pulse: FrameKey[];
  msg?: { via: "SMS" | "WhatsApp"; to: string; text: string };
  s: DemoState;
}

export const BOOKING = {
  ref: "SLU-48331",
  passenger: "Maria Thompson",
  phone: "+44 7700 900123",
  service: "Airport Transfer",
  from: "Hewanorra Airport (UVF)",
  to: "Rodney Bay",
  fromShort: "UVF",
  toShort: "Rodney Bay",
  day: "Tue 15 Dec",
  time: "15:00",
  flight: "BA 2155",
  pax: 2,
  bags: 2,
  total: 89.25,
  payout: 64,
  card: "Visa 4242",
};

export const DRIVER = {
  id: "DRV-007",
  name: "Marcus Joseph",
  vehicle: "Toyota Noah",
  colour: "white",
  plate: "VF 4471",
  rating: 4.9,
  trips: 312,
  seats: 7,
  docs: "All documents valid",
  available: "Free from 13:30",
};

export const OTHER_DRIVERS = [
  { id: "DRV-012", name: "Andre Felix", vehicle: "Toyota Hiace, silver", rating: 4.8, state: "On a trip until 16:10", ok: false },
  { id: "DRV-040", name: "Delroy Charles", vehicle: "Nissan Serena, grey", rating: 4.7, state: "Free from 14:00", ok: true },
  { id: "DRV-066", name: "Kemar Leo", vehicle: "Toyota Voxy, black", rating: 4.6, state: "Insurance expires in 9 days", ok: false },
];

const BASE: DemoState = {
  pax: "book", drv: "off", adm: "quiet", status: "", tone: "neutral",
  alert: false, driver: false, eta: 0, progress: 0,
  earnings: 248, revenue: 1_412.5, trips: 6,
};
const at = (p: Partial<DemoState>): DemoState => ({ ...BASE, ...p });

/* ---------------- the full trip: ten steps ---------------- */
const TRIP: Step[] = [
  {
    n: 1, title: "The passenger builds the trip", actor: "passenger", tap: "service", pulse: ["passenger"],
    say: "Maria picks Airport Transfer and fills in her flight, pickup and drop-off. The price is fixed per vehicle, so she sees it before she pays.",
    s: at({ pax: "book" }),
  },
  {
    n: 2, title: "She pays by card", actor: "passenger", tap: "pay", pulse: ["passenger"],
    say: "Stripe takes the card. No cash, no haggling at the airport, and the booking only exists once the payment clears.",
    s: at({ pax: "pay" }),
  },
  {
    n: 3, title: "Dispatch gets the booking at once", actor: null, pulse: ["admin", "passenger"],
    say: "The booking lands at the top of the dispatcher's list with a new-booking alert. Maria's app shows that a driver is being assigned.",
    msg: { via: "SMS", to: BOOKING.passenger, text: `Booking ${BOOKING.ref} confirmed. ${BOOKING.service}, ${BOOKING.day} ${BOOKING.time}. We will send your driver details shortly.` },
    s: at({ pax: "waiting", adm: "new", alert: true, status: "Pending to assign", tone: "warn", revenue: 1_501.75 }),
  },
  {
    n: 4, title: "The dispatcher picks a driver", actor: "admin", tap: "assign", pulse: ["admin"],
    say: "Samuel opens the booking and sees the trip plus every free driver with car, rating and document status. Assigning is a deliberate human choice, not an auction.",
    s: at({ pax: "waiting", adm: "assign", status: "Pending to assign", tone: "warn", revenue: 1_501.75 }),
  },
  {
    n: 5, title: "Driver details reach the passenger", actor: null, pulse: ["passenger", "driver"],
    say: "Maria immediately sees who is coming: name, car, plate and photo. Marcus gets the job on his phone with one button, because drivers cannot decline an assigned trip.",
    msg: { via: "WhatsApp", to: BOOKING.passenger, text: `Your driver is ${DRIVER.name}, ${DRIVER.vehicle} ${DRIVER.colour}, plate ${DRIVER.plate}.` },
    s: at({ pax: "assigned", drv: "new", adm: "detail", driver: true, status: "Driver assigned", tone: "info", revenue: 1_501.75 }),
  },
  {
    n: 6, title: "The driver accepts", actor: "driver", tap: "accept", pulse: ["driver", "passenger", "admin"],
    say: "One tap. The passenger sees the trip is accepted and the dispatcher's row turns green, so nobody has to phone anyone to check.",
    msg: { via: "SMS", to: BOOKING.passenger, text: `${DRIVER.name} accepted your trip ${BOOKING.ref}.` },
    s: at({ pax: "assigned", drv: "accepted", adm: "detail", driver: true, status: "Accepted", tone: "ok", revenue: 1_501.75 }),
  },
  {
    n: 7, title: "On the way, live on the map", actor: "driver", tap: "on-my-way", pulse: ["driver", "passenger", "admin"],
    say: "Marcus taps On my way. Maria watches the car move along the route with an ETA, and dispatch sees the same trip on the live map.",
    msg: { via: "WhatsApp", to: BOOKING.passenger, text: `${DRIVER.name.split(" ")[0]} is on the way to ${BOOKING.from}. About 12 minutes.` },
    s: at({ pax: "live", drv: "enroute", adm: "track", driver: true, status: "On the way", tone: "info", eta: 12, progress: 0.22, revenue: 1_501.75 }),
  },
  {
    n: 8, title: "Arrived at pickup", actor: "driver", tap: "arrived", pulse: ["driver", "passenger", "admin"],
    say: "He taps I have arrived. Maria gets \"your driver is here\" with the plate, which is the moment most airport pickups go wrong without an app.",
    msg: { via: "SMS", to: BOOKING.passenger, text: `${DRIVER.name.split(" ")[0]} is waiting at ${BOOKING.from}. Plate ${DRIVER.plate}.` },
    s: at({ pax: "live", drv: "arrived", adm: "track", driver: true, status: "At pickup", tone: "info", eta: 0, progress: 0.5, revenue: 1_501.75 }),
  },
  {
    n: 9, title: "Passenger onboard, heading out", actor: "driver", tap: "onboard", pulse: ["driver", "passenger", "admin"],
    say: "Marcus confirms she is in the car and starts the run to Rodney Bay. The passenger screen becomes a progress bar instead of a map of an empty road.",
    s: at({ pax: "live", drv: "heading", adm: "track", driver: true, status: "Onboard", tone: "info", eta: 38, progress: 0.72, revenue: 1_501.75 }),
  },
  {
    n: 10, title: "The trip closes itself", actor: null, pulse: ["passenger", "driver", "admin"],
    say: "At the drop-off the trip completes on its own: no end-trip button to forget. Maria rates the ride, Marcus sees his payout, and the day's numbers update.",
    msg: { via: "SMS", to: BOOKING.passenger, text: `You arrived at ${BOOKING.to}. Trip ${BOOKING.ref} is complete. Rate your driver in the app.` },
    s: at({ pax: "rating", drv: "earnings", adm: "done", driver: true, status: "Completed", tone: "ok", progress: 1, earnings: 248 + BOOKING.payout, revenue: 1_501.75, trips: 7 }),
  },
];

/* ---------------- short scenario: cancel more than 24h before ---------------- */
const CANCEL: Step[] = [
  {
    n: 1, title: "A paid booking, pickup is days away", actor: null, pulse: ["passenger", "admin"],
    say: "Maria has a paid Airport Transfer on Tue 15 Dec. It is more than 24 hours away, which is what decides what happens next.",
    s: at({ pax: "assigned", adm: "detail", driver: true, status: "Driver assigned", tone: "info" }),
  },
  {
    n: 2, title: "She cancels in the app", actor: "passenger", tap: "cancel", pulse: ["passenger"],
    say: "Cancelling is two taps in her trip. She does not have to call the office or argue about the policy.",
    s: at({ pax: "cancelled", adm: "detail", driver: true, status: "Driver assigned", tone: "info" }),
  },
  {
    n: 3, title: "The refund is automatic", actor: null, pulse: ["passenger", "admin"],
    say: "Over 24 hours before pickup the rule refunds in full without a dispatcher touching it. The driver is freed and the refund is logged for the books.",
    msg: { via: "SMS", to: BOOKING.passenger, text: `${BOOKING.ref} cancelled. $89.25 is on its way back to your ${BOOKING.card}.` },
    s: at({ pax: "cancelled", adm: "refund", status: "Cancelled, refunded", tone: "err", revenue: 1_412.5 }),
  },
];

/* ---------------- short scenario: chauffeur quote request ---------------- */
const QUOTE: Step[] = [
  {
    n: 1, title: "Chauffeur service has no fixed price", actor: "passenger", tap: "quote", pulse: ["passenger"],
    say: "A full-day chauffeur depends on hours and route, so the app asks for the details instead of showing a price.",
    s: at({ pax: "book" }),
  },
  {
    n: 2, title: "The request is sent, no payment", actor: null, pulse: ["passenger", "admin"],
    say: "Nothing is charged. Maria sees that the dispatcher will come back with a price, which keeps the promise of no hidden fees honest.",
    s: at({ pax: "quote", adm: "quotes", status: "New quote request", tone: "warn" }),
  },
  {
    n: 3, title: "It lands in the admin quotes list", actor: "admin", tap: "quote-price", pulse: ["admin"],
    say: "Samuel prices it himself and sends a payment link. Quotes stay in their own list so they never get mixed up with paid bookings.",
    msg: { via: "WhatsApp", to: BOOKING.passenger, text: "Your chauffeur quote: $420 for the day. Tap to pay and confirm." },
    s: at({ pax: "quote", adm: "quotes", status: "Quoted $420", tone: "ok" }),
  },
];

export const SCENARIOS = [
  { id: "trip", name: "Full trip, booking to rating", steps: TRIP },
  { id: "cancel", name: "Cancel over 24h before: auto refund", steps: CANCEL },
  { id: "quote", name: "Chauffeur quote: no payment", steps: QUOTE },
] as const;

export type ScenarioId = (typeof SCENARIOS)[number]["id"];
export const scenarioOf = (id: ScenarioId) => SCENARIOS.find((x) => x.id === id) ?? SCENARIOS[0];
