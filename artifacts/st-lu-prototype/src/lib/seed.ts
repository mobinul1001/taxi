import { defaultExt } from "./ext";
import type { Alert, Booking, Driver, Quote, Refund, Service, Source, State, Status } from "./types";

const PLACES = {
  UVF: "Hewanorra Airport (UVF)",
  SLU: "George F. L. Charles Airport (SLU)",
  PC: "Port Castries cruise terminal",
  PS: "Pointe Seraphine cruise terminal",
};

type DSeed = [string, string, "In-house" | "Outside", string, string, string, number, string, number, number, string, string, string];
// id, name, type, phone suffix, vehicle, plate, seats, color, rating, tripsMonth, licenceExp, insuranceExp, regExp
const D: DSeed[] = [
  ["DRV-007", "Marcus Joseph", "In-house", "0107", "Toyota Noah", "VF 4471", 7, "white", 4.9, 38, "2027-03-03", "2027-01-07", "2027-06-30"],
  ["DRV-012", "Andre Felix", "In-house", "0112", "Toyota Hiace", "VF 2208", 12, "silver", 4.8, 31, "2026-12-21", "2027-08-14", "2027-05-02"],
  ["DRV-040", "Delroy Charles", "In-house", "0140", "Nissan Serena", "VF 9034", 7, "grey", 4.7, 29, "2027-09-10", "2027-04-18", "2027-07-22"],
  ["DRV-066", "Kemar Leo", "Outside", "0166", "Toyota Voxy", "VF 3317", 7, "black", 4.6, 12, "2027-02-11", "2026-12-02", "2027-03-30"],
  ["DRV-081", "Rita Bennett", "Outside", "0181", "Honda Odyssey", "VF 7745", 7, "blue", 4.9, 9, "2027-10-01", "2027-06-06", "2027-11-19"],
  ["DRV-099", "Claude Joseph", "In-house", "0199", "Toyota Alphard", "VF 1120", 7, "white", 4.8, 27, "2027-05-15", "2027-03-21", "2027-08-08"],
  ["DRV-103", "Junior Augustin", "In-house", "0103", "Toyota Hiace", "VF 5521", 12, "white", 4.7, 24, "2027-04-04", "2027-02-26", "2027-09-14"],
  ["DRV-115", "Shane Pierre", "In-house", "0115", "Nissan Caravan", "VF 6082", 10, "silver", 4.8, 22, "2027-07-30", "2027-01-02", "2027-04-25"],
  ["DRV-121", "Kervin Alexander", "In-house", "0121", "Toyota Noah", "VF 3904", 7, "grey", 4.6, 20, "2027-06-12", "2027-05-09", "2027-10-03"],
  ["DRV-128", "Nathalie Edward", "In-house", "0128", "Hyundai H-1", "VF 8810", 8, "white", 4.9, 26, "2027-08-22", "2027-07-11", "2027-12-01"],
  ["DRV-134", "Gregory St Rose", "In-house", "0134", "Toyota Hiace", "VF 1456", 12, "white", 4.7, 19, "2027-01-28", "2027-03-03", "2027-02-17"],
  ["DRV-142", "Vincent Mathurin", "In-house", "0142", "Kia Carnival", "VF 2675", 7, "black", 4.8, 21, "2027-11-05", "2027-06-29", "2027-05-20"],
  ["DRV-150", "Dwayne Emmanuel", "In-house", "0150", "Toyota Voxy", "VF 4129", 7, "blue", 4.5, 15, "2027-02-02", "2027-09-30", "2027-03-09"],
  ["DRV-157", "Simone Louis", "Outside", "0157", "Honda Stepwgn", "VF 7302", 7, "red", 4.7, 8, "2027-03-17", "2026-12-30", "2027-06-06"],
  ["DRV-163", "Peter Jn Baptiste", "In-house", "0163", "Nissan Serena", "VF 5098", 7, "white", 4.6, 18, "2027-10-10", "2027-04-01", "2027-08-27"],
  ["DRV-170", "Allan Charlery", "In-house", "0170", "Toyota Coaster", "VF 9901", 22, "white", 4.8, 11, "2027-05-05", "2027-05-05", "2027-05-05"],
  ["DRV-176", "Curtis Hippolyte", "In-house", "0176", "Toyota Alphard", "VF 6644", 7, "pearl", 4.9, 23, "2027-07-07", "2027-02-14", "2027-09-09"],
  ["DRV-184", "Leon Francis", "Outside", "0184", "Mazda Biante", "VF 3388", 7, "silver", 4.5, 6, "2026-11-20", "2027-01-31", "2027-04-12"],
];

export const seedDrivers = (): Driver[] =>
  D.map(([id, name, type, ph, vehicle, plate, seats, color, rating, tripsMonth, licenceExp, insuranceExp, regExp], i) => ({
    id, name, type, phone: `+1 758-555-${ph}`,
    email: name.toLowerCase().replace(/[^a-z ]/g, "").replace(/ /g, ".") + "@stluciantaxiandtours.com",
    vehicle, color, year: 2018 + (i % 5), plate, seats, rating, trips: id === "DRV-007" ? 312 : 80 + i * 17, tripsMonth,
    licenceNo: `LC-${40211 + i * 37}`, licenceExp, insuranceNo: `INS-${7720 + i * 91}`, insuranceExp, regExp,
    reminderDays: 30, remindSms: true, remindWhatsApp: true,
  }));

let n = 0;
const stripe = () => `pi_3Q${(918273 + n++ * 7919).toString(36).toUpperCase()}x${n}Lk`;

interface BSeed {
  ref: string; passenger: string; service: Service; from: string; to: string; pickup: string; pax: number;
  base?: number; total?: number; driverId?: string | null; status: Status; source: Source; flight?: string; note?: string;
  childSeat?: boolean; payout?: number; bags?: number; payment?: Booking["payment"]; accepted?: boolean; email?: string; phone?: string;
}
const BASE: Record<Service, number> = { "Airport Transfer": 89.25, "Round-Trip": 180, "Private Tour": 199, "Full-Day Tour": 300 };
const phoneFor = (i: number) => `+1 ${["646", "305", "416", "202", "617", "312"][i % 6]}-555-${String(1200 + i * 43).slice(0, 4)}`;

const mk = (s: BSeed, i: number): Booking => {
  const base = s.base ?? BASE[s.service];
  const total = s.total ?? base + (s.childSeat ? 5 : 0);
  const at = s.pickup.split("T")[0];
  const statusFlow: Status[] = ["pending", "assigned", "on_the_way", "at_pickup", "onboard", "completed"];
  const idx = statusFlow.indexOf(s.status);
  const timeline = [{ at: at + " 09:00", text: "Booked and paid with Stripe" }];
  if (s.status === "cancelled") timeline.push({ at: at, text: "Cancelled" });
  else statusFlow.slice(1, idx + 1).forEach((st) => timeline.push({ at, text: st.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) }));
  return {
    ref: s.ref, passenger: s.passenger,
    email: s.email ?? s.passenger.toLowerCase().replace(/ /g, ".") + "@email.com",
    phone: s.phone ?? phoneFor(i), service: s.service, from: s.from, to: s.to, pickup: s.pickup,
    pax: s.pax, bags: s.bags ?? Math.min(s.pax + 1, 4), flight: s.flight, note: s.note, childSeat: !!s.childSeat,
    extraStop: false, night: false, base, total, payout: s.payout ?? Math.round(base * 0.717),
    payment: s.payment ?? (s.status === "cancelled" ? "Refunded" : "Paid"), stripeId: stripe(),
    driverId: s.driverId ?? null, accepted: s.accepted ?? (!!s.driverId && s.status !== "pending"), status: s.status,
    source: s.source, token: "job-" + s.ref.toLowerCase(), timeline,
    log: [{ at: at + " 09:00", text: "Booking confirmed sent to passenger", channels: ["SMS", "WhatsApp"], to: s.passenger }],
  };
};

const RAW: BSeed[] = [
  { ref: "SLU-48213", passenger: "Maria Thompson", email: "maria.thompson@email.com", phone: "+44 7700 900123", service: "Airport Transfer", from: PLACES.UVF, to: "Rodney Bay", pickup: "2026-12-14T14:30", pax: 2, bags: 3, flight: "BA 2155", note: "Child seat needed", childSeat: true, payout: 64, status: "pending", source: "App" },
  { ref: "SLU-48307", passenger: "James Carter", service: "Airport Transfer", from: PLACES.SLU, to: "Soufriere", pickup: "2026-12-14T16:00", pax: 3, flight: "AA 1452", status: "pending", source: "Website" },
  { ref: "SLU-48290", passenger: "Priya Nair", service: "Private Tour", from: "Castries", to: "Pitons and Soufriere", pickup: "2026-12-14T09:00", pax: 4, driverId: "DRV-007", status: "on_the_way", source: "Website", payout: 140 },
  { ref: "SLU-48311", passenger: "Aisha Khan", service: "Full-Day Tour", from: PLACES.PC, to: "Island loop", pickup: "2026-12-15T08:30", pax: 2, driverId: "DRV-012", status: "assigned", source: "WhatsApp" },
  { ref: "SLU-48298", passenger: "Luc Moreau", service: "Round-Trip", from: "Castries", to: PLACES.UVF, pickup: "2026-12-16T08:15", pax: 2, driverId: "DRV-066", status: "assigned", source: "App" },
  { ref: "SLU-48244", passenger: "Tom Walsh", service: "Airport Transfer", from: PLACES.UVF, to: "Cap Estate", pickup: "2026-12-14T11:10", pax: 1, driverId: "DRV-040", status: "completed", source: "Website", flight: "VS 97" },
  { ref: "SLU-48190", passenger: "Sara Lee", service: "Round-Trip", from: "Rodney Bay", to: PLACES.SLU, pickup: "2026-12-13T18:00", pax: 2, status: "cancelled", source: "App" },
  { ref: "SLU-48286", passenger: "Grace Hill", service: "Airport Transfer", from: PLACES.SLU, to: "Marigot Bay", pickup: "2026-12-14T11:45", pax: 2, driverId: "DRV-099", status: "at_pickup", source: "WhatsApp", flight: "AA 1123" },
  { ref: "SLU-48281", passenger: "Daniel Brooks", service: "Airport Transfer", from: PLACES.UVF, to: "Gros Islet", pickup: "2026-12-14T11:20", pax: 3, driverId: "DRV-103", status: "onboard", source: "App", flight: "DL 1955" },
  { ref: "SLU-48279", passenger: "Hannah Price", service: "Private Tour", from: "Rodney Bay", to: PLACES.UVF, pickup: "2026-12-14T10:30", pax: 2, driverId: "DRV-081", status: "onboard", source: "Website" },
  { ref: "SLU-48284", passenger: "Olivia Grant", service: "Airport Transfer", from: "Soufriere", to: PLACES.UVF, pickup: "2026-12-14T12:15", pax: 2, driverId: "DRV-115", status: "on_the_way", source: "App" },
  { ref: "SLU-48277", passenger: "Ethan Cole", service: "Full-Day Tour", from: PLACES.PS, to: "Island loop", pickup: "2026-12-14T08:00", pax: 5, driverId: "DRV-128", status: "onboard", source: "WhatsApp" },
  { ref: "SLU-48315", passenger: "Maria Thompson", email: "maria.thompson@email.com", phone: "+44 7700 900123", service: "Private Tour", from: "Rodney Bay", to: "Soufriere and Pitons", pickup: "2026-12-16T09:00", pax: 2, status: "pending", source: "App" },
  { ref: "SLU-48318", passenger: "Chloe Martin", service: "Private Tour", from: "Marigot Bay", to: "Soufriere and Pitons", pickup: "2026-12-16T09:00", pax: 3, driverId: "DRV-007", status: "assigned", source: "Website", payout: 140 },
  { ref: "SLU-48322", passenger: "Noah Fraser", service: "Round-Trip", from: "Castries", to: PLACES.SLU, pickup: "2026-12-18T18:00", pax: 2, driverId: "DRV-007", status: "assigned", source: "WhatsApp", payout: 120 },
  { ref: "SLU-48251", passenger: "Isabel Ruiz", service: "Private Tour", from: "Rodney Bay", to: "Soufriere", pickup: "2026-12-11T09:30", pax: 2, driverId: "DRV-007", status: "completed", source: "Website", payout: 140 },
  { ref: "SLU-48233", passenger: "Kofi Mensah", service: "Airport Transfer", from: PLACES.SLU, to: "Cap Estate", pickup: "2026-12-10T15:00", pax: 2, driverId: "DRV-007", status: "completed", source: "App", payout: 52, base: 89.25 },
  { ref: "SLU-48219", passenger: "Emma Walsh", service: "Full-Day Tour", from: "Castries", to: "Island loop", pickup: "2026-12-09T08:00", pax: 4, driverId: "DRV-007", status: "completed", source: "WhatsApp", payout: 156 },
  { ref: "SLU-47102", passenger: "Maria Thompson", email: "maria.thompson@email.com", phone: "+44 7700 900123", service: "Airport Transfer", from: "Rodney Bay", to: PLACES.SLU, pickup: "2026-11-02T10:00", pax: 2, driverId: "DRV-007", status: "completed", source: "App" },
  { ref: "SLU-46890", passenger: "Maria Thompson", email: "maria.thompson@email.com", phone: "+44 7700 900123", service: "Round-Trip", from: "Rodney Bay", to: PLACES.UVF, pickup: "2026-10-28T09:00", pax: 2, status: "cancelled", source: "App" },
  { ref: "SLU-47950", passenger: "Ben Ortiz", service: "Airport Transfer", from: PLACES.UVF, to: "Vieux Fort", pickup: "2026-12-19T13:00", pax: 1, status: "cancelled", source: "Website", payment: "Refund processing" },
  { ref: "SLU-47802", passenger: "Nina Patel", service: "Private Tour", from: PLACES.PC, to: "Soufriere", pickup: "2026-12-05T09:00", pax: 2, status: "cancelled", source: "WhatsApp" },
  { ref: "SLU-47611", passenger: "Omar Haddad", service: "Airport Transfer", from: PLACES.SLU, to: "Rodney Bay", pickup: "2026-12-08T17:30", pax: 2, childSeat: true, status: "cancelled", source: "App" },
  { ref: "SLU-48326", passenger: "Lucas Bernard", service: "Airport Transfer", from: PLACES.UVF, to: "Anse Chastanet", pickup: "2026-12-17T13:45", pax: 2, status: "pending", source: "Website", flight: "BA 2159" },
  { ref: "SLU-48329", passenger: "Fatima Diallo", service: "Round-Trip", from: "Gros Islet", to: PLACES.UVF, pickup: "2026-12-15T06:30", pax: 3, status: "pending", source: "WhatsApp" },
];

const NAMES = ["Sophie Laurent", "Ryan Mitchell", "Zara Ahmed", "Owen Hughes", "Mei Chen", "Carlos Vega", "Leah Goldberg", "Samir Haddad", "Ana Costa", "Jack Turner", "Ingrid Larsen", "Tariq Bello", "Ruth Adeyemi", "Felix Wagner", "Paula Reyes"];
const SERVICES: Service[] = ["Airport Transfer", "Round-Trip", "Private Tour", "Full-Day Tour", "Airport Transfer"];
const DESTS = ["Rodney Bay", "Soufriere", "Marigot Bay", "Cap Estate", "Gros Islet", "Castries", "Anse La Raye", "Dennery"];
const FROMS = [PLACES.UVF, PLACES.SLU, PLACES.PC, PLACES.PS, "Rodney Bay"];
const SOURCES: Source[] = ["Website", "App", "WhatsApp"];
const DRV = ["DRV-040", "DRV-099", "DRV-103", "DRV-115", "DRV-121", "DRV-128", "DRV-134", "DRV-142", "DRV-150", "DRV-163", "DRV-176", "DRV-012", "DRV-081", "DRV-157", "DRV-170"];

export const seedBookings = (): Booking[] => {
  n = 0;
  const out = RAW.map(mk);
  NAMES.forEach((p, i) => {
    const past = i < 10;
    const day = past ? 13 - (i % 9) : 15 + (i % 5);
    const s: BSeed = {
      ref: `SLU-${48100 + i * 7}`, passenger: p, service: SERVICES[i % 5], from: FROMS[i % 5], to: DESTS[i % 8],
      pickup: `2026-12-${String(day).padStart(2, "0")}T${String(7 + (i % 11)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
      pax: 1 + (i % 5), driverId: DRV[i], status: past ? "completed" : "assigned", source: SOURCES[i % 3],
    };
    out.push(mk(s, 40 + i));
  });
  return out.sort((a, b) => b.ref.localeCompare(a.ref));
};

export const seedRefunds = (): Refund[] => [
  { id: "RF-1", ref: "SLU-48190", passenger: "Sara Lee", amount: 180, reason: "Auto: cancelled more than 24 hours before pickup", status: "Refunded", date: "2026-12-11" },
  { id: "RF-2", ref: "SLU-47950", passenger: "Ben Ortiz", amount: 89.25, reason: "Auto: cancelled more than 24 hours before pickup", status: "Processing", date: "2026-12-13" },
  { id: "RF-3", ref: "SLU-47802", passenger: "Nina Patel", amount: 199, reason: "Manual: flight cancelled", status: "Refunded", date: "2026-12-04" },
  { id: "RF-4", ref: "SLU-47611", passenger: "Omar Haddad", amount: 94.25, reason: "Auto: cancelled more than 24 hours before pickup", status: "Refunded", date: "2026-12-06" },
  { id: "RF-0", ref: "SLU-46890", passenger: "Maria Thompson", amount: 180, reason: "Auto: cancelled more than 24 hours before pickup", status: "Refunded", date: "2026-10-24" },
];

export const seedAlerts = (): Alert[] => [
  { id: "a1", audience: "passenger", email: "maria.thompson@email.com", kind: "clock", title: "Reminder: pickup tomorrow", body: "Airport Transfer, Mon 14 Dec at 14:30. Have your flight details ready.", at: "13 Dec, 14:30", read: false, ref: "SLU-48213" },
  { id: "a2", audience: "passenger", email: "maria.thompson@email.com", kind: "check", title: "Booking confirmed", body: "SLU-48213 is confirmed. Paid $94.25 with Stripe.", at: "9 Dec", read: true, ref: "SLU-48213" },
  { id: "a3", audience: "passenger", email: "maria.thompson@email.com", kind: "refund", title: "Refund issued", body: "$180.00 for SLU-46890 is on its way to your card.", at: "24 Oct", read: true, ref: "SLU-46890" },
  { id: "a4", audience: "driver", driverId: "DRV-007", kind: "shield", title: "Insurance expires in 30 days", body: "Your vehicle insurance ends on 7 Jan 2027. Send the renewal to the dispatcher.", at: "8 Dec", read: true },
  { id: "a6", audience: "admin", kind: "shield", title: "Document expiry: Marcus Joseph", body: "Insurance expires 7 Jan 2027 (in 24 days). Reminder sent 30 days before.", at: "8 Dec", read: false },
  { id: "a7", audience: "admin", kind: "shield", title: "Document expiry: Andre Felix", body: "Licence expires 21 Dec 2026 (in 7 days).", at: "21 Nov", read: false },
  { id: "a8", audience: "admin", kind: "shield", title: "Document expired: Kemar Leo (outside)", body: "Insurance expired 2 Dec 2026.", at: "2 Dec", read: false },
  { id: "a9", audience: "driver", driverId: "DRV-012", kind: "shield", title: "Licence expires in 30 days", body: "Your driver licence ends on 21 Dec 2026. Send the renewal to the dispatcher.", at: "21 Nov", read: false },
  { id: "a10", audience: "passenger", email: "aisha.khan@email.com", kind: "clock", title: "Reminder: pickup tomorrow", body: "Full-Day Tour, Tue 15 Dec at 08:30.", at: "12:00", read: false, ref: "SLU-48311" },
  { id: "a11", audience: "driver", driverId: "DRV-012", kind: "clock", title: "Pickup tomorrow 08:30", body: "Aisha Khan at Port Castries cruise terminal. 1 hour 30 minute reminder follows on the day.", at: "12:00", read: false, ref: "SLU-48311" },
  { id: "a5", audience: "driver", driverId: "DRV-007", kind: "change", title: "Trip changed by dispatcher", body: "Private Tour on Wed 16 Dec now starts at 09:00.", at: "7 Dec", read: true, ref: "SLU-48318" },
];

export const seedQuotes = (): Quote[] => [
  { id: "Q-2041", service: "Chauffeur", passenger: "Victoria Hale", email: "v.hale@email.com", phone: "+1 917-555-0142", from: "Sugar Beach resort", to: "Full day, on call", date: "2026-12-18T09:00", details: "Wedding guests, 8 hours on call, 4 people.", status: "New", source: "Website" },
  { id: "Q-2038", service: "Delivery", passenger: "Bay Gardens Hotel", email: "ops@baygardens.lc", phone: "+1 758-555-0490", from: "Castries market", to: "Rodney Bay", date: "2026-12-15T11:00", details: "Two boxes of event supplies, about 30 kg.", status: "Quoted", price: 45, source: "WhatsApp" },
  { id: "Q-2035", service: "Point-to-Point", passenger: "Marc Antoine", email: "marc.antoine@email.com", phone: "+33 6 55 01 22 41", from: "Marigot Bay", to: "Castries", date: "2026-12-16T19:30", details: "Dinner run, return at 23:00.", status: "New", source: "App" },
];

// 30 day chart, 15 Nov to 14 Dec (organic counts, sums to 412 across December pace)
export const seedChart = () => [11, 14, 9, 16, 18, 13, 12, 15, 19, 17, 14, 10, 16, 20, 18, 12, 17, 21, 19, 14, 13, 18, 22, 20, 16, 15, 19, 23, 17, 18];

export const DEFAULT_TEMPLATES: State["settings"]["templates"] = [
  { id: "t1", group: "Passenger", name: "Booking confirmed", sms: "St Lu Taxi: {ref} confirmed. {service} {date} {time}. Paid {amount} with Stripe.", whatsapp: "Hi {passenger}, your booking {ref} is confirmed. {service} on {date} at {time}. Paid {amount} with Stripe." },
  { id: "t2", group: "Passenger", name: "Driver assigned", sms: "Your driver is {driver}, {vehicle}, plate {plate}. Ref {ref}.", whatsapp: "Good news {passenger}. {driver} will pick you up in a {vehicle}, plate {plate}." },
  { id: "t3", group: "Passenger", name: "On the way", sms: "{driver} is on the way to {pickup}.", whatsapp: "{driver} is on the way to {pickup}. Follow live: {link}" },
  { id: "t4", group: "Passenger", name: "At pickup", sms: "{driver} has arrived at {pickup}.", whatsapp: "{driver} is waiting at {pickup}. Plate {plate}." },
  { id: "t5", group: "Passenger", name: "Onboard", sms: "Trip {ref} started. Enjoy the ride.", whatsapp: "You are onboard. Heading to {dropoff}." },
  { id: "t6", group: "Passenger", name: "Dropped off", sms: "You have arrived at {dropoff}. Rate {driver}: {link}", whatsapp: "Thanks for riding with St Lu Taxi And Tours. Rate {driver}: {link}" },
  { id: "t7", group: "Passenger", name: "Reminder 1 day before", sms: "Reminder: {service} tomorrow at {time}.", whatsapp: "Reminder {passenger}: pickup tomorrow {date} at {time}." },
  { id: "t8", group: "Passenger", name: "Refund issued", sms: "Refund of {amount} for {ref} is on its way.", whatsapp: "We refunded {amount} for {ref}. It reaches your card in 5 to 10 business days." },
  { id: "t9", group: "In-house driver", name: "Trip assigned", sms: "New trip {ref}: {pickup} to {dropoff}, {date} {time}. Open the app to accept.", whatsapp: "New trip assigned: {ref}. Payout {payout}. Open the app to accept." },
  { id: "t10", group: "In-house driver", name: "Reminder 1 hour 30 minutes before", sms: "Pickup in 1 hour 30 minutes: {passenger} at {pickup}, {time}.", whatsapp: "Pickup in 1h30: {passenger} at {pickup}. Flight {flight}." },
  { id: "t11", group: "Outside driver", name: "Job link", sms: "New job {ref} from St Lu Taxi. Accept here: {link}", whatsapp: "Hi {driver}, new job {ref}, payout {payout}. Accept here: {link}" },
  { id: "t12", group: "Outside driver", name: "Reminder 1 hour 30 minutes before", sms: "Job {ref} pickup in 1h30 at {pickup}. {link}", whatsapp: "Reminder: job {ref} at {time}. Open: {link}" },
  { id: "t13", group: "Dispatcher", name: "New booking to assign", sms: "New booking {ref}, {service} {date} {time}. Assign a driver.", whatsapp: "New booking {ref} needs a driver." },
  { id: "t14", group: "Dispatcher", name: "Status update", sms: "{ref}: {driver} is {status}.", whatsapp: "{ref} update: {status}." },
  { id: "t15", group: "Admin", name: "Document expiry 30 days", sms: "{driver}: {document} expires on {expiry}.", whatsapp: "Reminder: {driver} {document} expires on {expiry}. Ask for the renewal." },
];

export const seedState = (): State => ({
  version: 3,
  ext: defaultExt(),
  bookings: seedBookings(),
  drivers: seedDrivers(),
  refunds: seedRefunds(),
  alerts: seedAlerts(),
  quotes: seedQuotes(),
  prices: { "Airport Transfer": 89.25, "Round-Trip": 180, "Private Tour": 199, "Full-Day Tour": 300, childSeat: 5, extraStop: 8, night: 10 },
  settings: {
    company: "St Lu Taxi And Tours", manager: "Samuel Green", address: "Morne Fortune, Castries, St. Lucia",
    phones: ["+1 758-732-4553", "+1 302-689-6001", "+1 758-489-0041"], website: "www.stluciantaxiandtours.com",
    email: "samuel@stluciantaxiandtours.com", policyHours: 24, passengerReminderHours: 24, driverReminderMinutes: 90,
    docReminderDays: 30, stripeConnected: true, stripeAccount: "acct_1PqStLu4553",
    templates: DEFAULT_TEMPLATES,
    team: [
      { id: "u1", name: "Samuel Green", email: "samuel@stluciantaxiandtours.com", role: "Admin" },
      { id: "u2", name: "Janelle Prospere", email: "dispatch@stluciantaxiandtours.com", role: "Dispatcher" },
    ],
  },
  draft: { service: "Airport Transfer", from: PLACES.UVF, to: "Rodney Bay", date: "2026-12-14", time: "14:30", flight: "", pax: 1, bags: 1, note: "", childSeat: false, extraStop: false },
  identity: { name: "Maria Thompson", email: "maria.thompson@email.com", phone: "+44 7700 900123", card: "Visa 4242", sms: true, whatsapp: true, places: ["Rodney Bay", PLACES.UVF] },
  demo: false,
  tourStep: 1,
  chart: seedChart(),
});

export { PLACES };
