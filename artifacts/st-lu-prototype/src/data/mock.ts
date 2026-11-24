export const BOOKING_STATUSES = [
  "Pending",
  "Assigned",
  "Driver On The Way",
  "At Pickup",
  "Onboard",
  "Completed",
  "Cancelled",
  "Refunded",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type Currency = "USD";

export function formatPrice(price: number | null, currency: Currency = "USD"): string {
  if (price === null) return "Get quote";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export interface Package {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  description: string;
}

export const packages: Package[] = [
  { id: "pkg-airport", name: "Airport Transfer", price: 89.25, currency: "USD", description: "Hewanorra or George F. L. Charles to your hotel or villa." },
  { id: "pkg-roundtrip", name: "Round-Trip Transfer", price: 180.0, currency: "USD", description: "Arrival and departure transfers booked together." },
  { id: "pkg-private", name: "Private Tour", price: 199.0, currency: "USD", description: "A private driver-guide for a half day around the island." },
  { id: "pkg-fullday", name: "Full-Day Tour", price: 300.0, currency: "USD", description: "Pitons, Sulphur Springs, Marigot Bay and more, at your pace." },
];

export interface Service {
  id: string;
  name: string;
  price: null;
  priceLabel: "Get quote";
  currency: Currency;
  description: string;
}

export const services: Service[] = [
  { id: "svc-p2p", name: "Point-to-Point", price: null, priceLabel: "Get quote", currency: "USD", description: "Any pickup to any drop-off across the island." },
  { id: "svc-chauffeur", name: "Chauffeur", price: null, priceLabel: "Get quote", currency: "USD", description: "A dedicated driver by the hour for events or business." },
  { id: "svc-delivery", name: "Delivery", price: null, priceLabel: "Get quote", currency: "USD", description: "Parcels and documents carried with care." },
];

export interface Driver {
  id: string;
  name: string;
  phone: string;
  type: "in-house" | "outside";
  rating: number;
  vehicleModel?: string;
  plate?: string;
  insuranceExpiry?: string;
  licenceExpiry?: string;
  company?: string;
}

export const drivers: Driver[] = [
  { id: "drv-01", name: "Marcus Joseph", phone: "+1 758 712 4410", type: "in-house", rating: 4.9, vehicleModel: "Toyota HiAce 2022", plate: "TX 4821", insuranceExpiry: "2026-03-14", licenceExpiry: "2027-08-02" },
  { id: "drv-02", name: "Kendra Alexander", phone: "+1 758 485 2093", type: "in-house", rating: 4.8, vehicleModel: "Nissan Caravan 2021", plate: "TX 3307", insuranceExpiry: "2025-11-30", licenceExpiry: "2026-05-19" },
  { id: "drv-03", name: "Ronald St. Rose", phone: "+1 758 719 6625", type: "in-house", rating: 4.7, vehicleModel: "Toyota Noah 2020", plate: "TX 2194", insuranceExpiry: "2026-01-08", licenceExpiry: "2028-02-11" },
  { id: "drv-04", name: "Delia Charlemagne", phone: "+1 758 520 3318", type: "in-house", rating: 5.0, vehicleModel: "Hyundai H-1 2023", plate: "TX 5560", insuranceExpiry: "2026-07-22", licenceExpiry: "2027-12-01" },
  { id: "drv-05", name: "Junior Emmanuel", phone: "+1 758 286 7741", type: "in-house", rating: 4.6, vehicleModel: "Toyota Hiace 2019", plate: "TX 1876", insuranceExpiry: "2025-09-05", licenceExpiry: "2026-10-27" },
  { id: "drv-06", name: "Shermaine Polius", phone: "+1 758 723 9054", type: "in-house", rating: 4.9, vehicleModel: "Kia Carnival 2022", plate: "TX 4402", insuranceExpiry: "2026-04-17", licenceExpiry: "2027-06-30" },
  { id: "drv-07", name: "Gregory Felix", phone: "+1 758 458 1129", type: "outside", rating: 4.5, company: "Soufriere Shuttle Co." },
  { id: "drv-08", name: "Annette Mathurin", phone: "+1 758 384 6602", type: "outside", rating: 4.7, company: "Gros Islet Cabs" },
];

export interface Passenger {
  id: string;
  name: string;
  phone: string;
  country: "USA" | "Canada" | "UK" | "St Lucia";
  email: string;
}

export const passengers: Passenger[] = [
  { id: "pax-01", name: "Jennifer Caldwell", phone: "+1 404 555 0187", country: "USA", email: "jen.caldwell@mail.com" },
  { id: "pax-02", name: "Tyler Brooks", phone: "+1 312 555 0143", country: "USA", email: "tbrooks@mail.com" },
  { id: "pax-03", name: "Mathieu Tremblay", phone: "+1 514 555 0162", country: "Canada", email: "m.tremblay@mail.ca" },
  { id: "pax-04", name: "Priya Raman", phone: "+1 416 555 0139", country: "Canada", email: "priya.r@mail.ca" },
  { id: "pax-05", name: "Oliver Pemberton", phone: "+44 7700 900412", country: "UK", email: "o.pemberton@mail.co.uk" },
  { id: "pax-06", name: "Natasha Augustin", phone: "+1 758 716 2240", country: "St Lucia", email: "natasha.a@mail.lc" },
];

export interface Booking {
  id: string;
  ref: string;
  passengerId: string;
  driverId: string | null;
  packageId: string | null;
  serviceId: string | null;
  pickup: string;
  dropoff: string;
  datetime: string;
  passengers: number;
  status: BookingStatus;
  flight?: string;
}

export const bookings: Booking[] = [
  { id: "bk-01", ref: "SLT-2401", passengerId: "pax-01", driverId: null, packageId: "pkg-airport", serviceId: null, pickup: "Hewanorra Intl Airport (UVF)", dropoff: "Sugar Beach, Soufriere", datetime: "2025-06-14T13:40", passengers: 2, status: "Pending", flight: "DL 1873" },
  { id: "bk-02", ref: "SLT-2402", passengerId: "pax-05", driverId: null, packageId: null, serviceId: "svc-p2p", pickup: "Rodney Bay Marina", dropoff: "Castries Market", datetime: "2025-06-14T16:15", passengers: 1, status: "Pending" },
  { id: "bk-03", ref: "SLT-2403", passengerId: "pax-03", driverId: "drv-02", packageId: "pkg-roundtrip", serviceId: null, pickup: "Hewanorra Intl Airport (UVF)", dropoff: "Anse Chastanet", datetime: "2025-06-15T11:05", passengers: 3, status: "Assigned", flight: "AC 1720" },
  { id: "bk-04", ref: "SLT-2404", passengerId: "pax-02", driverId: "drv-07", packageId: "pkg-private", serviceId: null, pickup: "Sandals Grande, Gros Islet", dropoff: "Pigeon Island", datetime: "2025-06-15T09:30", passengers: 2, status: "Assigned" },
  { id: "bk-05", ref: "SLT-2405", passengerId: "pax-04", driverId: "drv-01", packageId: "pkg-airport", serviceId: null, pickup: "George F. L. Charles Airport (SLU)", dropoff: "Windjammer Landing", datetime: "2025-06-14T10:20", passengers: 4, status: "Driver On The Way", flight: "WS 2654" },
  { id: "bk-06", ref: "SLT-2406", passengerId: "pax-06", driverId: "drv-04", packageId: null, serviceId: "svc-chauffeur", pickup: "Derek Walcott Square, Castries", dropoff: "Cap Estate", datetime: "2025-06-14T10:45", passengers: 2, status: "At Pickup" },
  { id: "bk-07", ref: "SLT-2407", passengerId: "pax-01", driverId: "drv-03", packageId: "pkg-fullday", serviceId: null, pickup: "Jade Mountain, Soufriere", dropoff: "Marigot Bay", datetime: "2025-06-14T08:00", passengers: 2, status: "Onboard" },
  { id: "bk-08", ref: "SLT-2408", passengerId: "pax-05", driverId: "drv-06", packageId: "pkg-airport", serviceId: null, pickup: "Hewanorra Intl Airport (UVF)", dropoff: "Coconut Bay, Vieux Fort", datetime: "2025-06-12T15:10", passengers: 2, status: "Completed", flight: "BA 2159" },
  { id: "bk-09", ref: "SLT-2409", passengerId: "pax-03", driverId: "drv-08", packageId: null, serviceId: "svc-delivery", pickup: "Gros Islet", dropoff: "Bois d'Orange", datetime: "2025-06-11T12:30", passengers: 1, status: "Completed" },
  { id: "bk-10", ref: "SLT-2410", passengerId: "pax-02", driverId: "drv-05", packageId: "pkg-private", serviceId: null, pickup: "Rodney Bay Village", dropoff: "Tet Paul Nature Trail", datetime: "2025-06-10T09:00", passengers: 2, status: "Completed" },
  { id: "bk-11", ref: "SLT-2411", passengerId: "pax-04", driverId: null, packageId: "pkg-roundtrip", serviceId: null, pickup: "Hewanorra Intl Airport (UVF)", dropoff: "Ladera Resort", datetime: "2025-06-13T14:25", passengers: 2, status: "Cancelled", flight: "AA 1347" },
  { id: "bk-12", ref: "SLT-2412", passengerId: "pax-06", driverId: "drv-02", packageId: "pkg-fullday", serviceId: null, pickup: "Bay Gardens, Rodney Bay", dropoff: "Diamond Falls", datetime: "2025-06-09T08:30", passengers: 3, status: "Refunded" },
];

export const findPassenger = (id: string) => passengers.find((p) => p.id === id);
export const findDriver = (id: string | null) => (id ? drivers.find((d) => d.id === id) : undefined);
export const findPackage = (id: string | null) => (id ? packages.find((p) => p.id === id) : undefined);
export const findService = (id: string | null) => (id ? services.find((s) => s.id === id) : undefined);

/* ---------- Passenger app (step 2) ---------- */
export type ServiceKind = "airport" | "roundtrip" | "tour" | "p2p" | "chauffeur" | "delivery";
export interface PassengerService { id: string; name: string; price: number | null; kind: ServiceKind; blurb: string }

export const passengerServices: PassengerService[] = [
  { id: "pkg-airport", name: "Airport Transfer", price: 89.25, kind: "airport", blurb: "Meet and greet at arrivals" },
  { id: "pkg-roundtrip", name: "Round-Trip Transfer", price: 180, kind: "roundtrip", blurb: "Arrival and departure, one booking" },
  { id: "pkg-private", name: "Private Tour", price: 199, kind: "tour", blurb: "Half day with a driver-guide" },
  { id: "pkg-fullday", name: "Full-Day Tour", price: 300, kind: "tour", blurb: "Pitons, springs and bays" },
  { id: "svc-p2p", name: "Point-to-Point", price: null, kind: "p2p", blurb: "Anywhere to anywhere" },
  { id: "svc-chauffeur", name: "Chauffeur", price: null, kind: "chauffeur", blurb: "A driver by the hour" },
  { id: "svc-delivery", name: "Delivery", price: null, kind: "delivery", blurb: "Parcels carried with care" },
];
export const findPassengerService = (id?: string) => passengerServices.find((s) => s.id === id);

export const quickPickups = [
  { id: "uvf", label: "UVF Airport", place: "Hewanorra Intl Airport (UVF)", serviceId: "pkg-airport" },
  { id: "slu", label: "SLU Airport", place: "George F. L. Charles Airport (SLU)", serviceId: "pkg-airport" },
  { id: "port-castries", label: "Port Castries cruise terminal", place: "Port Castries Cruise Terminal", serviceId: "svc-p2p" },
  { id: "pointe-seraphine", label: "Pointe Seraphine cruise terminal", place: "Pointe Seraphine Cruise Terminal", serviceId: "svc-p2p" },
];

export interface Place { name: string; area: string; type: "Airport" | "Town" | "Bay" | "Landmark" | "Hotel" | "Port" }
export const stLuciaPlaces: Place[] = [
  { name: "Hewanorra Intl Airport (UVF)", area: "Vieux Fort", type: "Airport" },
  { name: "George F. L. Charles Airport (SLU)", area: "Castries", type: "Airport" },
  { name: "Port Castries Cruise Terminal", area: "Castries", type: "Port" },
  { name: "Pointe Seraphine Cruise Terminal", area: "Castries", type: "Port" },
  { name: "Rodney Bay", area: "Gros Islet", type: "Bay" },
  { name: "Marigot Bay", area: "Castries", type: "Bay" },
  { name: "Soufriere", area: "Soufriere", type: "Town" },
  { name: "Gros Islet", area: "Gros Islet", type: "Town" },
  { name: "Vieux Fort", area: "Vieux Fort", type: "Town" },
  { name: "Castries", area: "Castries", type: "Town" },
  { name: "The Pitons", area: "Soufriere", type: "Landmark" },
  { name: "Pigeon Island", area: "Gros Islet", type: "Landmark" },
  { name: "Sugar Beach, A Viceroy Resort", area: "Soufriere", type: "Hotel" },
  { name: "Jade Mountain", area: "Soufriere", type: "Hotel" },
  { name: "Ladera Resort", area: "Soufriere", type: "Hotel" },
  { name: "Anse Chastanet", area: "Soufriere", type: "Hotel" },
  { name: "Sandals Grande St. Lucian", area: "Gros Islet", type: "Hotel" },
  { name: "Windjammer Landing", area: "Castries", type: "Hotel" },
  { name: "Coconut Bay Beach Resort", area: "Vieux Fort", type: "Hotel" },
  { name: "Bay Gardens Beach Resort", area: "Rodney Bay", type: "Hotel" },
  { name: "Capella Marigot Bay", area: "Marigot Bay", type: "Hotel" },
];

export type DisplayCurrency = "USD" | "XCD" | "GBP" | "CAD";
/** Illustrative mock exchange rates for display only. Not live, not used for charging. */
export const mockExchangeRates: Record<DisplayCurrency, { label: string; symbol: string; rate: number }> = {
  USD: { label: "USD", symbol: "US$", rate: 1 },
  XCD: { label: "EC$", symbol: "EC$", rate: 2.7 },
  GBP: { label: "GBP", symbol: "£", rate: 0.79 },
  CAD: { label: "CAD", symbol: "CA$", rate: 1.37 },
};
export function formatDisplayPrice(usd: number | null, cur: DisplayCurrency = "USD"): string {
  if (usd === null) return "Get quote";
  const r = mockExchangeRates[cur];
  return `${r.symbol}${(usd * r.rate).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const countryCodes = [
  { id: "us-ca", label: "USA / Canada", dial: "+1" },
  { id: "uk", label: "UK", dial: "+44" },
  { id: "lc", label: "St Lucia", dial: "+1 758" },
  { id: "other", label: "Other", dial: "" },
];

export const fareInclusions = ["Fixed price, no meter, no surprises", "Air-conditioned vehicle and licensed driver", "Flight tracking and up to 60 min free wait at airports", "Bottled water on board", "All taxes and island road fees"];

export const demoUpcomingTrip = { ref: "SLT-2417", serviceId: "pkg-airport", pickup: "Hewanorra Intl Airport (UVF)", dropoff: "Sugar Beach, A Viceroy Resort", datetime: "2025-06-18T13:40", driver: "Marcus Joseph", status: "Assigned" as BookingStatus };

/* ---------- Passenger app (step 3): payment, trips, alerts, account ---------- */
export const PASSENGER_STAGES = ["Pending", "Assigned", "Driver On The Way", "At Pickup", "Onboard", "Completed"] as const;
export type PassengerStage = (typeof PASSENGER_STAGES)[number];
export const stageLabels: Record<PassengerStage, string> = {
  Pending: "Pending", Assigned: "Driver assigned", "Driver On The Way": "Driver on the way", "At Pickup": "Driver at pickup", Onboard: "Onboard", Completed: "Completed",
};

/** Assigned demo driver shown in the passenger app. Photo is a local illustrated SVG portrait. */
export const passengerDriver = {
  id: "drv-01", name: "Marcus Joseph", first: "Marcus", rating: 4.9, trips: 1284, vehicle: "Toyota Hiace", color: "Pearl white", plate: "LC 4521",
  phone: "+1 758 712 4410", photo: `${import.meta.env.BASE_URL}driver-marcus.svg`,
};

/** Clearly labeled mock quotes for "Get quote" services. Only used after the passenger explicitly approves. */
export const mockQuotes: Record<string, number> = { "svc-p2p": 64.5, "svc-chauffeur": 245.0, "svc-delivery": 38.75 };

/** Fake Stripe test cards. The prototype accepts only these. */
export const TEST_CARDS = { success: "4242424242424242", decline: "4000000000000002" };

export interface SavedCard { id: string; brand: "Visa" | "Mastercard"; last4: string; exp: string; isDefault: boolean }
export const demoSavedCards: SavedCard[] = [
  { id: "card-1", brand: "Visa", last4: "4242", exp: "08/28", isDefault: true },
  { id: "card-2", brand: "Mastercard", last4: "4444", exp: "11/27", isDefault: false },
];

export interface SavedPlace { id: string; label: string; place: string }
export const demoSavedPlaces: SavedPlace[] = [
  { id: "sp-1", label: "Villa", place: "Sugar Beach, A Viceroy Resort" },
  { id: "sp-2", label: "Airport", place: "Hewanorra Intl Airport (UVF)" },
];

export const supportContacts = { phone: "+1 758 450 2210", whatsapp: "+1 758 450 2211" };

export const passengerFaq = [
  { q: "When am I charged?", a: "Your card is charged in USD when you confirm the booking. Fixed fares never change on the day." },
  { q: "What if my flight is late?", a: "We track your flight. Your driver waits up to 60 minutes after landing at no cost." },
  { q: "How do refunds work?", a: "Cancel more than 24 hours before pickup and the full fare is returned to your card automatically. Inside 24 hours, contact support." },
  { q: "Can I pay cash?", a: "No. All bookings are paid online by card through Stripe, so your driver never handles money." },
];

export const deleteReasons = ["I finished my trip to St Lucia", "I have another account", "I get too many messages", "Privacy concerns", "Something else"];

const H = 3600_000;
const at = (offsetHours: number, hour?: number, min = 0) => {
  const d = new Date(Date.now() + offsetHours * H);
  if (hour !== undefined) d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

export type AlertChannel = "SMS" | "WhatsApp";
export interface PassengerAlert { id: string; tripRef: string; title: string; at: string; channels: AlertChannel[]; read: boolean; kind: "driver" | "status" | "reminder" | "done" }

export const seedAlerts = (): PassengerAlert[] => [
  { id: "al-6", tripRef: "SLT-20418", title: "Trip reminder: your pickup is tomorrow at 06:30", at: at(-0.3), channels: ["SMS", "WhatsApp"], read: false, kind: "reminder" },
  { id: "al-5", tripRef: "SLT-20377", title: "You have been dropped off, thank you", at: at(-46), channels: ["SMS", "WhatsApp"], read: false, kind: "done" },
  { id: "al-4", tripRef: "SLT-20377", title: "You are on board", at: at(-47), channels: ["WhatsApp"], read: true, kind: "status" },
  { id: "al-3", tripRef: "SLT-20377", title: "Your driver has arrived at the pickup point", at: at(-47.2), channels: ["SMS", "WhatsApp"], read: true, kind: "status" },
  { id: "al-2", tripRef: "SLT-20377", title: "Your driver is on the way", at: at(-47.6), channels: ["SMS", "WhatsApp"], read: true, kind: "status" },
  { id: "al-1", tripRef: "SLT-20377", title: "Your driver is Marcus, Toyota Hiace LC 4521", at: at(-49), channels: ["SMS", "WhatsApp"], read: true, kind: "driver" },
];

export interface TripRecord {
  id: string; ref: string; serviceId: string; serviceName: string; pickup: string; dropoff: string; pickupAt: string;
  pax: number; luggage: number; amount: number; quoted?: boolean; status: BookingStatus; driverId: string | null;
  cardLabel: string; createdAt: string; stageTimes: Partial<Record<BookingStatus, string>>; flight?: string;
  rating?: number; comment?: string; refundedAt?: string;
}

export const seedTrips = (): TripRecord[] => [
  { id: "t-20418", ref: "SLT-20418", serviceId: "pkg-airport", serviceName: "Airport Transfer", pickup: "Hewanorra Intl Airport (UVF)", dropoff: "Sugar Beach, A Viceroy Resort",
    pickupAt: at(24 + 20), pax: 2, luggage: 3, amount: 89.25, status: "Assigned", driverId: "drv-01", cardLabel: "Visa 4242", createdAt: at(-30), flight: "DL 1873",
    stageTimes: { Pending: at(-30), Assigned: at(-6) } },
  { id: "t-20431", ref: "SLT-20431", serviceId: "pkg-private", serviceName: "Private Tour", pickup: "Bay Gardens Beach Resort", dropoff: "Marigot Bay",
    pickupAt: at(9), pax: 3, luggage: 0, amount: 199, status: "Pending", driverId: null, cardLabel: "Visa 4242", createdAt: at(-3), stageTimes: { Pending: at(-3) } },
  { id: "t-20402", ref: "SLT-20402", serviceId: "pkg-fullday", serviceName: "Full-Day Tour", pickup: "Jade Mountain", dropoff: "The Pitons",
    pickupAt: at(72 + 48), pax: 2, luggage: 0, amount: 300, status: "Assigned", driverId: "drv-01", cardLabel: "Mastercard 4444", createdAt: at(-50),
    stageTimes: { Pending: at(-50), Assigned: at(-20) } },
  { id: "t-20377", ref: "SLT-20377", serviceId: "pkg-airport", serviceName: "Airport Transfer", pickup: "George F. L. Charles Airport (SLU)", dropoff: "Windjammer Landing",
    pickupAt: at(-48), pax: 2, luggage: 2, amount: 89.25, status: "Completed", driverId: "drv-01", cardLabel: "Visa 4242", createdAt: at(-120), flight: "AA 1347",
    stageTimes: { Pending: at(-120), Assigned: at(-60), "Driver On The Way": at(-48.6), "At Pickup": at(-48.2), Onboard: at(-48), Completed: at(-46) }, rating: 5, comment: "Marcus had cold water waiting and knew every bay." },
  { id: "t-20391", ref: "SLT-20391", serviceId: "svc-p2p", serviceName: "Point-to-Point", pickup: "Rodney Bay", dropoff: "Castries", pickupAt: at(-20), pax: 1, luggage: 0,
    amount: 64.5, quoted: true, status: "Completed", driverId: "drv-01", cardLabel: "Visa 4242", createdAt: at(-30),
    stageTimes: { Pending: at(-30), Assigned: at(-24), "Driver On The Way": at(-20.5), "At Pickup": at(-20.1), Onboard: at(-20), Completed: at(-19.4) } },
  { id: "t-20356", ref: "SLT-20356", serviceId: "pkg-roundtrip", serviceName: "Round-Trip Transfer", pickup: "Hewanorra Intl Airport (UVF)", dropoff: "Ladera Resort",
    pickupAt: at(-96), pax: 2, luggage: 4, amount: 180, status: "Refunded", driverId: null, cardLabel: "Visa 4242", createdAt: at(-240), refundedAt: at(-150),
    stageTimes: { Pending: at(-240), Refunded: at(-150) } },
];

/* ---------- Step 4: unified app, driver, outside job, shared store fixtures ---------- */
/** Public demo fixtures only. These are NOT real secrets and never leave the browser. */
export const DEMO_ACCOUNTS = {
  passenger: { label: "Passenger demo", email: "jen.caldwell@mail.com", password: "IslandRide2026", name: "Jennifer Caldwell", phone: "+1 404 555 0187" },
  driver: { label: "Driver demo", email: "marcus.joseph@stlutaxi.lc", password: "DriveSafe2026", driverId: "drv-01" },
} as const;
export const DRIVER_EMAIL_DOMAIN = "@stlutaxi.lc";

/** In-house driver demo profile (admin-created record). */
export const driverProfile = {
  id: "drv-01", name: "Marcus Joseph", phone: "+1 758 712 4410", vehicle: "Toyota Hiace, Pearl white", plate: "LC 4521",
  licenceExpiry: "2027-08-02", insuranceExpiry: "2026-12-12", insuranceLabel: "Insurance valid until 12 Dec 2026", rating: 4.9,
};
export const dispatcherContact = { name: "St Lu Dispatch", phone: "+1 758 450 2210" };

export const OUTSIDE_JOB_TOKEN = "SLT-7F3K9Q";
export const REMINDER_MINUTES = 90;
/** Simulated drive time from "Heading to destination" until automatic completion. */
export const HEADING_SECONDS = 20;
export const NOTIFY_TOAST = "Passenger and dispatcher notified by SMS and WhatsApp";
export const AUTO_COMPLETE_TEXT = "You have arrived. Trip completed automatically.";

export type Recipient = "passenger" | "driver" | "outside" | "dispatcher" | "admin";
export type SharedAlertKind = PassengerAlert["kind"] | "assigned" | "changed" | "booking" | "cancel" | "expiry";
export interface SharedAlert { id: string; tripRef: string; title: string; at: string; channels: AlertChannel[]; read: boolean; kind: SharedAlertKind; recipient: Recipient; driverId?: string }

/** Extra fields on shared trips used by driver, outside-driver and admin views. */
export interface SharedTrip extends TripRecord {
  /** Undefined means the trip belongs to the signed-in demo passenger. */
  paxOwner?: string; passengerName?: string; passengerPhone?: string; note?: string; payout?: number;
  accepted?: boolean; reminderSent?: boolean; headingStartedAt?: string; outsideToken?: string;
}
export const payoutFor = (t: SharedTrip) => t.payout ?? Math.round(t.amount * 0.68 * 100) / 100;

/** Passenger-facing message templates (also used by the shared store). */
export const passengerStatusMsg: Partial<Record<BookingStatus, string>> = {
  Assigned: `Your driver is ${"Marcus"}, Toyota Hiace LC 4521`,
  "Driver On The Way": "Your driver is on the way", "At Pickup": "Your driver has arrived at the pickup point",
  Onboard: "You are on board", Completed: "You have been dropped off, thank you",
};
export const dispatcherStatusMsg = (ref: string, driver: string, s: BookingStatus) => ({
  Assigned: `${ref}: ${driver} accepted the job`, "Driver On The Way": `${ref}: ${driver} is on the way`, "At Pickup": `${ref}: ${driver} is at pickup`,
  Onboard: `${ref}: passenger onboard with ${driver}`, Completed: `${ref}: trip completed by ${driver}`,
} as Partial<Record<BookingStatus, string>>)[s] ?? `${ref}: ${s}`;

const M = 60_000;
const atMin = (m: number) => new Date(Date.now() + m * M).toISOString();
const todayAt = (h: number, mi = 0) => { const d = new Date(); d.setHours(h, mi, 0, 0); return d.toISOString(); };

/** Driver and outside-driver seed trips. Times are relative to first load so the reminder is always eligible. */
export const seedDriverTrips = (): SharedTrip[] => [
  { id: "t-20442", ref: "SLT-20442", serviceId: "pkg-airport", serviceName: "Airport Transfer", pickup: "Hewanorra Intl Airport (UVF)", dropoff: "Sugar Beach, A Viceroy Resort",
    pickupAt: atMin(75), pax: 2, luggage: 3, amount: 89.25, payout: 60.7, status: "Assigned", driverId: "drv-01", cardLabel: "Visa 4242", createdAt: atMin(-60 * 26), flight: "DL 1873",
    note: "Meet at arrivals with a name sign. One large surfboard bag.", accepted: true, stageTimes: { Pending: atMin(-60 * 26), Assigned: atMin(-60 * 20) } },
  { id: "t-20447", ref: "SLT-20447", serviceId: "svc-p2p", serviceName: "Point-to-Point", pickup: "Rodney Bay Marina", dropoff: "Castries Market",
    pickupAt: atMin(60 * 5 + 20), pax: 1, luggage: 0, amount: 64.5, payout: 43.85, status: "Assigned", driverId: "drv-01", cardLabel: "Visa 1881", createdAt: atMin(-300),
    paxOwner: "pax-05", passengerName: "Oliver Pemberton", passengerPhone: "+44 7700 900412", note: "Guest is on the yacht Calypso, berth C14.", accepted: true,
    stageTimes: { Pending: atMin(-300), Assigned: atMin(-240) } },
  { id: "t-20425", ref: "SLT-20425", serviceId: "pkg-private", serviceName: "Private Tour", pickup: "Windjammer Landing", dropoff: "Pigeon Island",
    pickupAt: todayAt(7, 10), pax: 3, luggage: 0, amount: 199, payout: 135.3, status: "Completed", driverId: "drv-01", cardLabel: "Mastercard 5100", createdAt: atMin(-60 * 30),
    paxOwner: "pax-04", passengerName: "Priya Raman", passengerPhone: "+1 416 555 0139", accepted: true,
    stageTimes: { Pending: atMin(-60 * 30), Assigned: atMin(-60 * 24), Completed: todayAt(8, 5) } },
  { id: "t-20450", ref: "SLT-20450", serviceId: "pkg-airport", serviceName: "Airport Transfer", pickup: "George F. L. Charles Airport (SLU)", dropoff: "Sandals Grande St. Lucian",
    pickupAt: atMin(60 * 3 + 35), pax: 2, luggage: 2, amount: 89.25, payout: 58.0, status: "Assigned", driverId: "drv-07", cardLabel: "Visa 3391", createdAt: atMin(-200), flight: "AA 2271",
    paxOwner: "pax-02", passengerName: "Tyler Brooks", passengerPhone: "+1 312 555 0143", note: "Two golf bags. Call on landing.", accepted: false, outsideToken: OUTSIDE_JOB_TOKEN,
    stageTimes: { Pending: atMin(-200), Assigned: atMin(-30) } },
];

/** Pool used by "Simulate new trip alert" to build a genuine new shared job. */
export const simulatedAssignments = [
  { serviceName: "Airport Transfer", serviceId: "pkg-airport", pickup: "Hewanorra Intl Airport (UVF)", dropoff: "Ladera Resort", pax: 2, luggage: 2, amount: 89.25, flight: "BA 2159", passengerName: "Mathieu Tremblay", passengerPhone: "+1 514 555 0162", paxOwner: "pax-03", note: "Honeymoon couple. Chilled water please." },
  { serviceName: "Point-to-Point", serviceId: "svc-p2p", pickup: "Bay Gardens Beach Resort", dropoff: "Marigot Bay", pax: 4, luggage: 0, amount: 72.4, passengerName: "Natasha Augustin", passengerPhone: "+1 758 716 2240", paxOwner: "pax-06", note: "Dinner reservation at 19:30." },
  { serviceName: "Full-Day Tour", serviceId: "pkg-fullday", pickup: "Jade Mountain", dropoff: "Diamond Falls", pax: 3, luggage: 0, amount: 300, passengerName: "Oliver Pemberton", passengerPhone: "+44 7700 900412", paxOwner: "pax-05", note: "Add a stop at Tet Paul." },
];

export const seedSharedAlerts = (): SharedAlert[] => [
  { id: "sa-d1", tripRef: "SLT-20447", title: "New trip assigned: Rodney Bay Marina to Castries Market", at: atMin(-240), channels: ["SMS", "WhatsApp"], read: true, kind: "assigned", recipient: "driver", driverId: "drv-01" },
  { id: "sa-o1", tripRef: "SLT-20450", title: `New job assigned. Open: /job/${OUTSIDE_JOB_TOKEN}`, at: atMin(-30), channels: ["SMS", "WhatsApp"], read: false, kind: "assigned", recipient: "outside", driverId: "drv-07" },
  { id: "sa-x1", tripRef: "SLT-20447", title: "New booking SLT-20447 from Oliver Pemberton", at: atMin(-300), channels: ["SMS", "WhatsApp"], read: true, kind: "booking", recipient: "dispatcher" },
  { id: "sa-a1", tripRef: "-", title: "Insurance for TX 1876 (Junior Emmanuel) expires in 30 days", at: atMin(-600), channels: ["SMS", "WhatsApp"], read: false, kind: "expiry", recipient: "admin" },
];

/* ---------- Message preview templates (/previews/messages) ---------- */
export interface MessageTemplate { id: string; title: string; text: string; link?: string }
export const messageGroups: { recipient: string; who: string; items: MessageTemplate[] }[] = [
  { recipient: "Passenger", who: "Jennifer Caldwell", items: [
    { id: "p-confirm", title: "Booking confirmation", text: "St Lu Taxi And Tours: Booking SLT-20442 confirmed. Airport Transfer, Hewanorra (UVF) to Sugar Beach, Thu 13:40. Paid US$89.25. Reply HELP for support." },
    { id: "p-assigned", title: "Driver assigned", text: "Your driver is Marcus Joseph, Toyota Hiace, Pearl white, plate LC 4521. He will meet you at arrivals with a name sign." },
    { id: "p-otw", title: "Driver on the way", text: "Marcus is on the way to Hewanorra Intl Airport (UVF). Track live in the app." },
    { id: "p-pickup", title: "Driver at pickup", text: "Marcus has arrived at the pickup point. Look for the Pearl white Toyota Hiace, LC 4521." },
    { id: "p-onboard", title: "Onboard", text: "You are on board with Marcus. Sit back, the drive to Sugar Beach is about 55 minutes." },
    { id: "p-done", title: "Dropped off", text: "You have been dropped off at Sugar Beach, thank you for riding with St Lu Taxi And Tours. Rate your trip in the app." },
    { id: "p-remind", title: "Reminder 1 day before", text: "Reminder: your pickup is tomorrow at 06:30 from Sugar Beach to Hewanorra (UVF). Flight DL 1874. Driver details follow on the day." },
    { id: "p-refund", title: "Refund issued", text: "Refund issued for SLT-20356: US$180.00 returned to Visa 4242. It may take 5 to 10 business days to appear." },
  ] },
  { recipient: "In-house driver", who: "Marcus Joseph", items: [
    { id: "d-assigned", title: "Trip assigned", text: "New trip SLT-20442: UVF Airport to Sugar Beach, today 13:40. Jennifer Caldwell, 2 pax, flight DL 1873. Payout US$60.70. Open the driver app to accept." },
    { id: "d-remind", title: "Reminder 1 hour 30 minutes before", text: "Reminder: SLT-20442 pickup in 1 hour 30 minutes at Hewanorra Intl Airport (UVF). Flight DL 1873 is on time." },
    { id: "d-changed", title: "Trip changed", text: "Trip SLT-20447 changed: pickup moved to 15:45 at Rodney Bay Marina, berth C14. Passenger count now 2." },
  ] },
  { recipient: "Outside driver", who: "Gregory Felix, Soufriere Shuttle Co.", items: [
    { id: "o-assigned", title: "Job assigned with link", text: "St Lu Taxi And Tours: New job SLT-20450, SLU Airport to Sandals Grande. Payout US$58.00. View and accept:", link: `/job/${OUTSIDE_JOB_TOKEN}` },
  ] },
  { recipient: "Dispatcher", who: "St Lu Dispatch desk", items: [
    { id: "x-new", title: "New booking", text: "New booking SLT-20442: Jennifer Caldwell, Airport Transfer, UVF to Sugar Beach, Thu 13:40. Paid US$89.25." },
    { id: "x-otw", title: "Driver on the way", text: "SLT-20442: Marcus Joseph is on the way to Hewanorra Intl Airport (UVF)." },
    { id: "x-pickup", title: "At pickup", text: "SLT-20442: Marcus Joseph is at pickup. Passenger notified." },
    { id: "x-done", title: "Completed", text: "SLT-20442 completed automatically at Sugar Beach. Driver payout US$60.70 recorded." },
    { id: "x-cancel", title: "Cancellation", text: "SLT-20431 cancelled by passenger more than 24 hours before pickup. Full refund of US$199.00 issued." },
  ] },
  { recipient: "Admin", who: "Operations admin", items: [
    { id: "a-ins", title: "Insurance expires in 30 days", text: "Heads up: insurance for TX 1876 (Junior Emmanuel, Toyota Hiace) expires in 30 days. Upload the renewal before the driver is blocked from dispatch." },
    { id: "a-lic", title: "Licence expires in 30 days", text: "Heads up: the driving licence for Kendra Alexander expires in 30 days. Request a renewed copy." },
  ] },
];
