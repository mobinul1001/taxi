import type { Booking, Driver, Status } from "./types";

/** Demo "today": Monday 14 Dec 2026, 12:00 local. */
export const NOW = new Date(2026, 11, 14, 12, 0);
export const TODAY_ISO = "2026-12-14";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const parse = (iso: string) => {
  const [d, t = "00:00"] = iso.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [h, mi] = t.split(":").map(Number);
  return new Date(y, m - 1, day, h, mi);
};
export const money = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const moneyShort = (n: number) => "$" + (Number.isInteger(n) ? n.toLocaleString("en-US") : n.toFixed(2));
export const time = (iso: string) => iso.split("T")[1]?.slice(0, 5) ?? "";
export const dayLabel = (iso: string) => { const d = parse(iso); return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
export const shortDate = (iso: string) => { const d = parse(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
export const longDate = (iso: string) => { const d = parse(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
export const pickupLabel = (iso: string) => `${dayLabel(iso)}, ${time(iso)}`;
export const isToday = (iso: string) => iso.startsWith(TODAY_ISO);
export const hoursUntil = (iso: string) => (parse(iso).getTime() - NOW.getTime()) / 36e5;
export const daysUntil = (iso: string) => Math.round((parse(iso).getTime() - new Date(2026, 11, 14).getTime()) / 864e5);
export const initials = (name: string) => name.replace(/\(.*\)/, "").split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
export const short = (place: string) => {
  if (place.includes("(UVF)")) return "UVF";
  if (place.includes("(SLU)")) return "SLU";
  return place;
};
export const routeShort = (b: Pick<Booking, "from" | "to">) => `${short(b.from)} to ${short(b.to)}`;
export const stamp = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const STATUS_LABEL: Record<Status, string> = {
  pending: "Pending to assign",
  assigned: "Driver assigned",
  on_the_way: "On the way",
  at_pickup: "At pickup",
  onboard: "Onboard",
  completed: "Completed",
  cancelled: "Cancelled",
};
export const ACTIVE: Status[] = ["on_the_way", "at_pickup", "onboard"];

export type DocState = { tone: "ok" | "warn" | "err"; label: string; days: number };
export const docState = (exp: string): DocState => {
  const days = daysUntil(exp + "T00:00");
  if (days < 0) return { tone: "err", label: "Expired", days };
  if (days <= 30) return { tone: "warn", label: `Expires in ${days} days`, days };
  return { tone: "ok", label: "Valid", days };
};
export const driverDocs = (d: Driver) => [
  { key: "licence" as const, name: "Driver licence", no: d.licenceNo, exp: d.licenceExp, ...docState(d.licenceExp) },
  { key: "insurance" as const, name: "Insurance", no: d.insuranceNo, exp: d.insuranceExp, ...docState(d.insuranceExp) },
  { key: "registration" as const, name: "Vehicle registration", no: d.plate, exp: d.regExp, ...docState(d.regExp) },
];
export const worstDoc = (d: Driver) => driverDocs(d).sort((a, b) => a.days - b.days)[0];
export const driverLabel = (d?: Driver | null) => (d ? (d.type === "Outside" ? `${d.name} (outside)` : d.name) : "Unassigned");

/** Pickup point label: only airports have an Arrivals hall. */
export const pickupSpot = (from: string) => (/airport|\bUVF\b|\bSLU\b/i.test(from) ? `${from}, Arrivals` : from);

/** Validates a booking date and time against the demo clock. Returns an error message or null. */
export function checkPickup(date: string, time: string, label = "Pickup"): string | null {
  if (!date || !time) return `Add the ${label.toLowerCase()} date and time`;
  const when = new Date(`${date}T${time}`);
  if (Number.isNaN(when.getTime())) return `Enter a valid ${label.toLowerCase()} date and time`;
  if (when.getTime() < NOW.getTime()) return `${label} must be in the future`;
  if (when.getTime() - NOW.getTime() > 365 * 24 * 36e5) return `${label} can be at most 12 months ahead`;
  return null;
}
