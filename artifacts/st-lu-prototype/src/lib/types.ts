export type Status = "pending" | "assigned" | "on_the_way" | "at_pickup" | "onboard" | "completed" | "cancelled";
export type Service = "Airport Transfer" | "Round-Trip" | "Private Tour" | "Full-Day Tour";
export type QuoteService = "Point-to-Point" | "Chauffeur" | "Delivery";
export type Source = "Website" | "App" | "WhatsApp";
export type Payment = "Paid" | "Refunded" | "Refund processing" | "Review";
export type Channel = "SMS" | "WhatsApp";

export interface LogEntry { at: string; text: string; channels?: Channel[]; to?: string }

export interface Booking {
  ref: string;
  passenger: string;
  email: string;
  phone: string;
  service: Service;
  from: string;
  to: string;
  pickup: string; // ISO local "2026-12-14T14:30"
  pax: number;
  bags: number;
  flight?: string;
  note?: string;
  childSeat: boolean;
  extraStop: boolean;
  night: boolean;
  base: number;
  total: number;
  payout: number;
  payment: Payment;
  stripeId: string;
  driverId: string | null;
  accepted: boolean;
  status: Status;
  heading?: boolean;
  headingAt?: number;
  source: Source;
  token: string;
  timeline: LogEntry[];
  log: LogEntry[];
  rating?: { stars: number; tags: string[]; comment: string };
  cancelReason?: string;
  completedAt?: string;
  card?: string;
  returnTrip?: ReturnTrip;
}

export interface ReturnTrip { date: string; time: string; flight: string; pickup: string }
export interface Renewal { policy: string; expiry: string; file?: string; note: string; sent: boolean }
export interface JobUpdate { ref: string; oldTime: string; newTime: string; reason: string; accepted: boolean }
export interface Ext {
  delayed: boolean;
  jobUpdates: Record<string, JobUpdate>;
  reminder: { id: string; ref: string } | null;
  dismissed: string[];
  renewals: Record<string, Renewal>;
  cards: string[];
  changes: Record<string, { oldTime: string; oldPax: number }>;
}

/** Salted SHA-256 of a driver password. The plain password is never stored. */
export interface Credential { salt: string; hash: string; mustChange: boolean; setAt: string }
export interface Driver {
  cred?: Credential;
  id: string;
  name: string;
  type: "In-house" | "Outside";
  phone: string;
  email: string;
  tempPassword?: string;
  vehicle: string;
  color: string;
  year: number;
  plate: string;
  seats: number;
  rating: number;
  trips: number;
  tripsMonth: number;
  licenceNo: string;
  licenceExp: string;
  insuranceNo: string;
  insuranceExp: string;
  regExp: string;
  reminderDays: number;
  remindSms: boolean;
  remindWhatsApp: boolean;
  unavailable?: string;
  uploads?: { licence?: string; insurance?: string; registration?: string };
}

export interface Refund {
  id: string;
  ref: string;
  passenger: string;
  amount: number;
  reason: string;
  status: "Refunded" | "Processing" | "Dispatcher review" | "Declined";
  date: string;
}

export interface Alert {
  id: string;
  audience: "passenger" | "driver" | "admin";
  driverId?: string;
  email?: string;
  kind: "bell" | "clock" | "shield" | "refund" | "car" | "check" | "change";
  title: string;
  body: string;
  at: string;
  read: boolean;
  ref?: string;
}

export interface Quote {
  id: string;
  service: QuoteService;
  passenger: string;
  email: string;
  phone: string;
  from: string;
  to: string;
  date: string;
  details: string;
  status: "New" | "Quoted" | "Declined";
  price?: number;
  source: Source;
}

export interface Prices {
  "Airport Transfer": number;
  "Round-Trip": number;
  "Private Tour": number;
  "Full-Day Tour": number;
  childSeat: number;
  extraStop: number;
  night: number;
}

export interface TeamUser { id: string; name: string; email: string; role: "Admin" | "Dispatcher" }

export interface Settings {
  company: string;
  manager: string;
  address: string;
  phones: string[];
  website: string;
  email: string;
  policyHours: number;
  passengerReminderHours: number;
  driverReminderMinutes: number;
  docReminderDays: number;
  stripeConnected: boolean;
  stripeAccount: string;
  templates: { id: string; group: string; name: string; sms: string; whatsapp: string }[];
  team: TeamUser[];
}

export interface Draft {
  /** true once this draft has been paid, so Payment cannot be submitted twice */
  paid?: boolean;
  service: Service;
  from: string;
  to: string;
  date: string;
  time: string;
  flight: string;
  pax: number;
  bags: number;
  note: string;
  childSeat: boolean;
  extraStop: boolean;
  lastRef?: string;
  ret?: ReturnTrip;
}

export interface Identity { name: string; email: string; phone: string; card: string; sms: boolean; whatsapp: boolean; places: string[] }

export interface State {
  version: number;
  bookings: Booking[];
  drivers: Driver[];
  refunds: Refund[];
  alerts: Alert[];
  quotes: Quote[];
  prices: Prices;
  settings: Settings;
  draft: Draft;
  identity: Identity;
  demo: boolean;
  tourStep: number;
  chart: number[];
  ext: Ext;
}
