import { useSyncExternalStore } from "react";
import { seedState } from "./seed";
import { defaultExt } from "./ext";
import { hoursUntil, money, pickupLabel, routeShort, stamp, STATUS_LABEL, time, TODAY_ISO } from "./format";
import type { Alert, Booking, Channel, Driver, Quote, Renewal, State, Status } from "./types";

const KEY = "stlu-store-v3";
const BOTH: Channel[] = ["SMS", "WhatsApp"];

/** Backward-compatible hydration: saved v3 state from before the new screens gets default extension fields. */
function hydrate(s: State): State {
  const d = defaultExt();
  const e = (s.ext ?? {}) as Partial<State["ext"]>;
  s.ext = { ...d, ...e, jobUpdates: { ...(e.jobUpdates ?? {}) }, renewals: { ...(e.renewals ?? {}) }, changes: { ...d.changes, ...(e.changes ?? {}) }, dismissed: [...(e.dismissed ?? [])], cards: [...(e.cards ?? [])] };
  // older saved stores carried demo extras in the booking draft that the passenger never chose
  if (s.draft && s.draft.flight === "BA 2155" && s.draft.bags === 3 && s.draft.childSeat) s.draft = { ...s.draft, flight: "", bags: 1, pax: 1, childSeat: false };
  return s;
}

/* Storage that never throws (Safari private mode, blocked cookies, sandboxed iframes). Falls back to memory. */
const mem: Record<string, Record<string, string>> = { local: {}, session: {} };
function area(kind: "local" | "session"): Storage | null { try { return kind === "local" ? window.localStorage : window.sessionStorage; } catch { return null; } }
export const safeStore = {
  get(kind: "local" | "session", k: string): string | null { try { const a = area(kind); return a ? a.getItem(k) : (mem[kind][k] ?? null); } catch { return mem[kind][k] ?? null; } },
  set(kind: "local" | "session", k: string, v: string) { mem[kind][k] = v; try { area(kind)?.setItem(k, v); } catch { /* quota or blocked: memory copy is kept */ } },
  remove(kind: "local" | "session", k: string) { delete mem[kind][k]; try { area(kind)?.removeItem(k); } catch { /* blocked */ } },
};

/**
 * A stored state with the right version but the wrong shape (a half-written value, something edited by
 * hand) used to sail past the version check and throw somewhere deep in a screen, leaving the reader on
 * an error page that no reload could clear. Check that the parts the app indexes into are really there,
 * and fall back to the seed if they are not.
 */
const looksLikeState = (s: unknown): s is State => {
  const o = s as Partial<State> | null;
  return !!o && o.version === 3
    && Array.isArray(o.bookings) && Array.isArray(o.drivers) && Array.isArray(o.refunds) && Array.isArray(o.quotes)
    && !!o.draft && !!o.identity && !!o.settings && !!o.prices;
};

function load(): State {
  try {
    const raw = safeStore.get("local", KEY);
    if (raw) {
      const s = JSON.parse(raw) as State;
      if (looksLikeState(s)) return hydrate(s);
      // Keep nothing broken around: the next write starts from a clean seed.
      safeStore.remove("local", KEY);
    }
  } catch { /* ignore */ }
  return hydrate(seedState());
}

let state: State = load();
if (!safeStore.get("local", KEY)) safeStore.set("local", KEY, JSON.stringify(state));
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function persist() {
  safeStore.set("local", KEY, JSON.stringify(state));
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) { state = load(); emit(); }
  });
}

export function getState() { return state; }
export function update(fn: (s: State) => void) {
  state = load();
  const next = structuredClone(state);
  fn(next);
  state = next;
  persist();
  emit();
}
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => sel(state));
}
export const useAppState = () => useStore((s) => s);
/** the state as it is right now, for code that runs several actions in a row (React snapshots are stale between them) */
export const peek = () => state;

/* ---------- toast ---------- */
type ToastMsg = { id: number; text: string; tone: "ok" | "info" | "err"; to?: string; cta?: string };
let toasts: ToastMsg[] = [];
const toastL = new Set<() => void>();
/** `link` adds a "where to see it" action to the message, e.g. { to: "/app/driver/jobs", cta: "Open the driver app" }. */
export function toast(text: string, tone: ToastMsg["tone"] = "ok", link?: { to: string; cta: string }) {
  const id = Date.now() + Math.random();
  toasts = [...toasts, { id, text, tone, ...link }];
  toastL.forEach((l) => l());
  setTimeout(() => { toasts = toasts.filter((t) => t.id !== id); toastL.forEach((l) => l()); }, link ? 6000 : 3200);
}
export const useToasts = () => useSyncExternalStore((cb) => { toastL.add(cb); return () => toastL.delete(cb); }, () => toasts);

/* ---------- session (per tab) ---------- */
export type Session = { role: "passenger" | "driver"; driverId?: string } | null;
const SKEY = "stlu-session";
let session: Session = (() => { try { return JSON.parse(safeStore.get("session", SKEY) || "null"); } catch { return null; } })();
const sessL = new Set<() => void>();
export function setSession(s: Session) {
  session = s;
  if (s) safeStore.set("session", SKEY, JSON.stringify(s)); else safeStore.remove("session", SKEY);
  sessL.forEach((l) => l());
}
export const useSession = () => useSyncExternalStore((cb) => { sessL.add(cb); return () => sessL.delete(cb); }, () => session);

/* ---------- helpers ---------- */
const uid = () => Math.random().toString(36).slice(2, 9);
const find = (s: State, ref: string) => s.bookings.find((b) => b.ref === ref);
const drv = (s: State, id: string | null) => s.drivers.find((d) => d.id === id);
const pushAlert = (s: State, a: Omit<Alert, "id" | "read" | "at"> & { at?: string }) =>
  s.alerts.unshift({ id: uid(), read: false, at: a.at ?? stamp(), ...a });
const log = (b: Booking, text: string, to: string, channels: Channel[] = BOTH) => b.log.unshift({ at: `${TODAY_ISO} ${stamp()}`, text, to, channels });
const tl = (b: Booking, text: string) => b.timeline.push({ at: `${TODAY_ISO} ${stamp()}`, text });

export const NOTIFIED = "Passenger and dispatcher notified by SMS and WhatsApp";

/* ---------- actions ---------- */
export const actions = {
  reset() { safeStore.remove("local", KEY); state = hydrate(seedState()); persist(); emit(); setSession(null); },
  setDemo(v: boolean) { update((s) => { s.demo = v; }); },
  setTour(n: number) { update((s) => { s.tourStep = n; }); },
  setDraft(p: Partial<State["draft"]>) { update((s) => { s.draft = { ...s.draft, paid: false, ...p }; }); },

  createBooking(source: Booking["source"] = "App", over?: Partial<Booking>): string {
    let ref = "";
    update((s) => {
      const d = s.draft;
      const max = Math.max(...s.bookings.map((b) => Number(b.ref.slice(4))));
      ref = `SLU-${max + 1}`;
      const base = s.prices[d.service];
      const night = Number(d.time.slice(0, 2)) >= 22 || Number(d.time.slice(0, 2)) < 5;
      const total = base + (d.childSeat ? s.prices.childSeat : 0) + (d.extraStop ? s.prices.extraStop : 0) + (night ? s.prices.night : 0);
      const id = s.identity;
      const b: Booking = {
        ref, passenger: id.name, email: id.email, phone: id.phone, service: d.service, from: d.from, to: d.to,
        pickup: `${d.date}T${d.time}`, pax: d.pax, bags: d.bags, flight: d.flight || undefined,
        note: [d.childSeat ? "Child seat needed" : "", d.note].filter(Boolean).join(". ") || undefined,
        childSeat: d.childSeat, extraStop: d.extraStop, night, base, total, payout: Math.round(base * 0.717),
        payment: "Paid", stripeId: "pi_3Q" + uid().toUpperCase() + "St", driverId: null, accepted: false,
        status: "pending", source, token: "job-" + ref.toLowerCase(),
        timeline: [{ at: `${TODAY_ISO} ${stamp()}`, text: "Booked and paid with Stripe" }], log: [], ...over,
      };
      log(b, "Booking confirmed sent to passenger", b.passenger);
      log(b, "New booking to assign sent to dispatcher", "Dispatcher");
      s.bookings.unshift(b);
      // start the next booking clean: do not carry over this trip's extras, flight or note
      s.draft = { ...s.draft, paid: true, lastRef: ref, flight: "", note: "", childSeat: false, extraStop: false, pax: 1, bags: 1, ret: undefined };
      if (b.email === s.identity.email)
        pushAlert(s, { audience: "passenger", email: b.email, kind: "check", title: "Booking confirmed", body: `${ref} is confirmed. Paid ${money(total)} with Stripe.`, ref });
      pushAlert(s, { audience: "admin", kind: "bell", title: "New booking to assign", body: `${b.passenger} · ${ref} · ${routeShort(b)}`, ref });
      if (s.tourStep < 2) s.tourStep = 2;
    });
    return ref;
  },

  createQuote(q: Omit<Quote, "id" | "status">): string {
    let id = "";
    update((s) => { id = "Q-" + (2042 + s.quotes.length); s.quotes.unshift({ ...q, id, status: "New" }); });
    return id;
  },
  updateQuote(id: string, p: Partial<Quote>) { update((s) => { const q = s.quotes.find((x) => x.id === id); if (q) Object.assign(q, p); }); },

  assign(ref: string, driverId: string) {
    update((s) => {
      const b = find(s, ref); const d = drv(s, driverId); if (!b || !d || d.unavailable || ["completed", "cancelled"].includes(b.status)) return;
      b.driverId = driverId; b.accepted = false; b.status = "assigned"; b.heading = false;
      tl(b, `Driver assigned: ${d.name}`);
      log(b, `Driver assigned: ${d.name} · ${d.vehicle}, ${d.color} · plate ${d.plate}`, b.passenger);
      log(b, d.type === "Outside" ? `Job link sent to ${d.name}` : `Trip assigned sent to ${d.name}`, d.name);
      pushAlert(s, { audience: "passenger", email: b.email, kind: "car", title: "Driver assigned", body: `${d.name} · ${d.vehicle}, ${d.color} · plate ${d.plate}.`, ref });
      pushAlert(s, { audience: "driver", driverId, kind: "bell", title: "New trip assigned", body: `${b.service}, ${pickupLabel(b.pickup).replace(",", " at")}. ${routeShort(b)}. Tap to accept.`, ref });
      if (s.tourStep < 3) s.tourStep = 3;
    });
  },
  accept(ref: string) {
    update((s) => {
      const b = find(s, ref); if (!b || b.accepted || b.status !== "assigned") return;
      b.accepted = true; tl(b, "Driver accepted the trip"); log(b, "Driver accepted", "Dispatcher");
      pushAlert(s, { audience: "admin", kind: "check", title: "Driver accepted", body: `${ref} · ${drv(s, b.driverId)?.name ?? ""}`, ref });
      const t = b.pickup.slice(11, 16);
      if (b.pickup.startsWith(TODAY_ISO) && b.driverId) {
        const [h, m] = t.split(":").map(Number); const mm = h * 60 + m - 90;
        pushAlert(s, { audience: "driver", driverId: b.driverId, kind: "clock", title: "Pickup in 1 hour 30 minutes", body: `${b.passenger} at ${b.from}, ${t}.${b.flight ? ` Flight ${b.flight}.` : ""}`, ref, at: `${String(Math.floor(mm / 60)).padStart(2, "0")}:${String(mm % 60).padStart(2, "0")}` });
      }
    });
  },
  advance(ref: string) {
    update((s) => {
      const b = find(s, ref); if (!b) return;
      const d = drv(s, b.driverId);
      const name = d?.name.split(" ")[0] ?? "Your driver";
      if (b.status === "assigned") {
        b.status = "on_the_way"; b.accepted = true; tl(b, "On the way");
        pushAlert(s, { audience: "passenger", email: b.email, kind: "car", title: "Your driver is on the way", body: `${name} is heading to ${b.from}. Arriving in about 6 minutes.`, ref });
      } else if (b.status === "on_the_way") {
        b.status = "at_pickup"; tl(b, "At pickup");
        pushAlert(s, { audience: "passenger", email: b.email, kind: "bell", title: "Your driver is at pickup", body: `${name} is waiting at ${b.from}. Plate ${d?.plate ?? ""}.`, ref });
      } else if (b.status === "at_pickup") {
        b.status = "onboard"; tl(b, "Passenger onboard");
        pushAlert(s, { audience: "passenger", email: b.email, kind: "check", title: "You are onboard", body: `Heading to ${b.to}. Enjoy the ride.`, ref });
      } else if (b.status === "onboard" && !b.heading) {
        b.heading = true; b.headingAt = Date.now(); tl(b, "Heading to destination");
      } else return;
      pushAlert(s, { audience: "admin", kind: "car", title: `${ref}: ${b.heading && b.status === "onboard" ? "Heading to destination" : STATUS_LABEL[b.status]}`, body: `${b.passenger} · ${drv(s, b.driverId)?.name ?? ""}`, ref });
      log(b, `Status: ${b.heading && b.status === "onboard" ? "Heading to destination" : STATUS_LABEL[b.status]}`, "Passenger and dispatcher");
    });
  },
  complete(ref: string) {
    update((s) => {
      const b = find(s, ref); if (!b || b.status === "completed" || b.status === "cancelled") return;
      b.status = "completed"; b.heading = false; b.completedAt = stamp(); tl(b, "Completed automatically at destination");
      log(b, "Dropped off: trip completed automatically", "Passenger and dispatcher");
      pushAlert(s, { audience: "passenger", email: b.email, kind: "check", title: "Dropped off", body: `You arrived at ${b.to}. Trip ${ref} completed. Rate your driver.`, ref });
      pushAlert(s, { audience: "admin", kind: "check", title: `${ref}: completed automatically`, body: `${b.passenger} dropped off at ${b.to}`, ref });
      const d = drv(s, b.driverId); if (d) { d.trips += 1; d.tripsMonth += 1; }
      s.chart[s.chart.length - 1] += 0;
      if (s.tourStep < 5) s.tourStep = 5;
    });
  },
  setStatus(ref: string, status: Status, notify = true) {
    update((s) => {
      const b = find(s, ref); if (!b) return; b.status = status; b.heading = false; tl(b, `Status changed by dispatcher: ${STATUS_LABEL[status]}`);
      if (notify) log(b, `Status changed to ${STATUS_LABEL[status]}`, `${b.passenger} and driver`);
      else log(b, `Status changed to ${STATUS_LABEL[status]} (no message sent)`, "Dispatcher", []);
    });
  },
  cancel(ref: string, reason: string, by: "passenger" | "dispatcher", opts: { notifyPassenger?: boolean; notifyDriver?: boolean } = {}) {
    const notifyPassenger = opts.notifyPassenger ?? true;
    let auto = false;
    update((s) => {
      const b = find(s, ref); if (!b || b.status === "cancelled" || b.status === "completed") return;
      auto = hoursUntil(b.pickup) > s.settings.policyHours;
      b.status = "cancelled"; b.cancelReason = reason || undefined; b.heading = false;
      tl(b, `Cancelled by ${by}${reason ? `: ${reason}` : ""}`);
      if (auto) {
        b.payment = "Refund processing";
        s.refunds.unshift({ id: "RF-" + uid(), ref, passenger: b.passenger, amount: b.total, reason: `Auto: cancelled more than ${s.settings.policyHours} hours before pickup`, status: "Processing", date: TODAY_ISO });
        if (notifyPassenger) {
          log(b, `Refund issued ${money(b.total)}`, b.passenger);
          pushAlert(s, { audience: "passenger", email: b.email, kind: "refund", title: "Refund issued", body: `${money(b.total)} for ${ref} is on its way to your card.`, ref });
        }
      } else {
        b.payment = "Review";
        s.refunds.unshift({ id: "RF-" + uid(), ref, passenger: b.passenger, amount: b.total, reason: `Cancelled within ${s.settings.policyHours} hours: dispatcher will review`, status: "Dispatcher review", date: TODAY_ISO });
        if (notifyPassenger) log(b, "Cancellation received. Dispatcher will review the refund", b.passenger);
      }
      if (!notifyPassenger) log(b, "Passenger not notified of the cancellation", "Dispatcher", []);
      const dv = drv(s, b.driverId);
      if (opts.notifyDriver && dv) {
        log(b, `Trip cancelled sent to ${dv.name}`, dv.name);
        pushAlert(s, { audience: "driver", driverId: dv.id, kind: "change", title: "Trip cancelled by dispatcher", body: `${b.service}, ${pickupLabel(b.pickup)}. ${routeShort(b)}.`, ref });
      }
      pushAlert(s, { audience: "admin", kind: "refund", title: auto ? "Automatic refund" : "Refund to review", body: `${ref} · ${b.passenger} · ${money(b.total)}`, ref });
    });
    return auto;
  },
  refund(ref: string, amount: number, reason: string) {
    update((s) => {
      const b = find(s, ref); if (!b || b.payment === "Refunded" || b.payment === "Refund processing") return;
      b.payment = "Refunded";
      s.refunds.unshift({ id: "RF-" + uid(), ref, passenger: b.passenger, amount, reason: `Manual: ${reason || "dispatcher refund"}`, status: "Refunded", date: TODAY_ISO });
      log(b, `Refund issued ${money(amount)}`, b.passenger);
      pushAlert(s, { audience: "passenger", email: b.email, kind: "refund", title: "Refund issued", body: `${money(amount)} for ${ref} is on its way to your card.`, ref });
    });
  },
  resolveRefund(id: string, approve: boolean) {
    update((s) => {
      const r = s.refunds.find((x) => x.id === id); if (!r || r.status !== "Dispatcher review") return;
      r.status = approve ? "Refunded" : "Declined";
      const b = find(s, r.ref);
      if (b) { b.payment = approve ? "Refunded" : "Paid"; log(b, approve ? `Refund approved ${money(r.amount)}` : "Refund declined by dispatcher", b.passenger); }
      if (approve && b) pushAlert(s, { audience: "passenger", email: b.email, kind: "refund", title: "Refund issued", body: `${money(r.amount)} for ${r.ref} is on its way to your card.`, ref: r.ref });
    });
  },
  settleRefund(id: string) { update((s) => { const r = s.refunds.find((x) => x.id === id); if (r) r.status = "Refunded"; const b = r && find(s, r.ref); if (b) b.payment = "Refunded"; }); },
  rate(ref: string, stars: number, tags: string[], comment: string) {
    update((s) => { const b = find(s, ref); if (!b) return; b.rating = { stars, tags, comment }; log(b, `Passenger rated ${stars} stars`, "Dispatcher", []); s.tourStep = 5; });
  },
  message(ref: string, text: string) {
    update((s) => { const b = find(s, ref); if (!b) return; log(b, `Message: ${text}`, b.passenger); pushAlert(s, { audience: "passenger", email: b.email, kind: "bell", title: "Message from dispatcher", body: text, ref }); });
  },
  adminBooking(b: Partial<Booking> & Pick<Booking, "passenger" | "service" | "from" | "to" | "pickup">) {
    update((s) => {
      const max = Math.max(...s.bookings.map((x) => Number(x.ref.slice(4))));
      const ref = `SLU-${max + 1}`;
      const base = s.prices[b.service];
      const total = base + (b.childSeat ? s.prices.childSeat : 0);
      s.bookings.unshift({
        ref, email: b.passenger.toLowerCase().replace(/ /g, ".") + "@email.com", phone: "+1 758-555-0000", pax: 2, bags: 2,
        childSeat: false, extraStop: false, night: false, base, total, payout: Math.round(base * 0.717), payment: "Paid",
        stripeId: "pi_3Q" + uid().toUpperCase() + "Ad", driverId: null, accepted: false, status: "pending", source: "WhatsApp",
        token: "job-" + ref.toLowerCase(), timeline: [{ at: `${TODAY_ISO} ${stamp()}`, text: "Created by dispatcher, payment link paid" }], log: [], ...b,
      } as Booking);
    });
  },
  markRead(audience: Alert["audience"], key?: string) {
    update((s) => s.alerts.forEach((a) => { if (a.audience === audience && (!key || a.email === key || a.driverId === key)) a.read = true; }));
  },
  setDriverCred(id: string, cred: Driver["cred"]) { update((s) => { const d = s.drivers.find((x) => x.id === id); if (d) d.cred = cred; }); },
  saveDriver(d: Driver) { update((s) => { const i = s.drivers.findIndex((x) => x.id === d.id); if (i >= 0) s.drivers[i] = d; else s.drivers.push(d); }); },
  deleteDriver(id: string) { update((s) => { s.drivers = s.drivers.filter((d) => d.id !== id); s.bookings.forEach((b) => { if (b.driverId === id && b.status === "assigned") { b.driverId = null; b.status = "pending"; } }); }); },
  setUnavailable(id: string, reason: string | undefined) { update((s) => { const d = drv(s, id); if (d) d.unavailable = reason; }); },
  setPrices(p: State["prices"]) { update((s) => { s.prices = p; }); },
  setSettings(p: Partial<State["settings"]>) { update((s) => { s.settings = { ...s.settings, ...p }; }); },
  setIdentity(p: Partial<State["identity"]>) { update((s) => { s.identity = { ...s.identity, ...p }; }); },

  simulateNewTrip(driverId = "DRV-007") {
    update((s) => {
      const target = s.bookings.find((b) => b.ref === "SLU-48213" && b.status === "pending") ?? s.bookings.find((b) => b.status === "pending");
      if (!target) return;
      const d = drv(s, driverId); if (!d) return;
      target.driverId = driverId; target.status = "assigned"; target.accepted = false;
      tl(target, `Driver assigned: ${d.name}`);
      pushAlert(s, { audience: "driver", driverId, kind: "bell", title: "New trip assigned", body: `${target.service}, ${pickupLabel(target.pickup)}. ${routeShort(target)}. Tap to accept.`, ref: target.ref });
      pushAlert(s, { audience: "passenger", email: target.email, kind: "car", title: "Driver assigned", body: `${d.name} · ${d.vehicle}, ${d.color} · plate ${d.plate}.`, ref: target.ref });
      s.tourStep = 3;
    });
  },
  simulateArrival() {
    const b = state.bookings.find((x) => x.status === "onboard") ?? state.bookings.find((x) => ["on_the_way", "at_pickup"].includes(x.status));
    if (b) { actions.complete(b.ref); return b.ref; }
    return null;
  },
};

/* ---------- actions for the added screens ---------- */
export const extActions = {
  simulateFlightDelay() {
    update((s) => {
      const b = find(s, "SLU-48213"); if (!b) return;
      if (!s.ext.delayed) {
        const old = time(b.pickup);
        b.pickup = b.pickup.slice(0, 11) + "15:15";
        tl(b, `Pickup moved from ${old} to 15:15: flight ${b.flight ?? ""} delayed`);
        log(b, `Pickup time changed to 15:15 (was ${old}), flight delayed`, `${b.passenger} and driver`);
        s.ext.jobUpdates[b.token] = { ref: b.ref, oldTime: old, newTime: "15:15", reason: `Flight ${b.flight ?? "BA 2155"} delayed`, accepted: false };
        const o = find(s, "SLU-48298");
        if (o) {
          const oo = time(o.pickup);
          o.pickup = o.pickup.slice(0, 11) + "09:00";
          tl(o, `Pickup moved from ${oo} to 09:00 by dispatcher`);
          log(o, `Pickup time changed to 09:00 (was ${oo})`, `${o.passenger} and driver`);
          s.ext.jobUpdates[o.token] = { ref: o.ref, oldTime: oo, newTime: "09:00", reason: "Flight BA 2155 delayed, schedule moved", accepted: false };
        }
        s.ext.delayed = true;
      }
      s.alerts = s.alerts.filter((a) => a.id !== "flight-delay");
      s.alerts.unshift({ id: "flight-delay", audience: "passenger", email: b.email, kind: "bell", title: "Your flight is late", body: `${b.flight ?? "BA 2155"} now lands at 15:15 (was 14:30). New pickup time 15:15.`, at: stamp(), read: false, ref: b.ref });
      if (b.driverId) pushAlert(s, { audience: "driver", driverId: b.driverId, kind: "change", title: "Trip changed by dispatcher", body: `${b.ref}: pickup now 15:15, flight ${b.flight ?? ""} delayed.`, ref: b.ref });
      pushAlert(s, { audience: "admin", kind: "clock", title: `${b.ref}: flight delayed`, body: `Pickup moved to 15:15. Passenger and driver notified.`, ref: b.ref });
    });
  },
  simulateReminder() {
    update((s) => {
      const driverId = session?.role === "driver" ? session.driverId ?? "DRV-007" : "DRV-007";
      const assigned = s.bookings.filter((b) => b.driverId === driverId && !["completed", "cancelled"].includes(b.status));
      const b = assigned.find((b) => b.ref === "SLU-48213") ?? assigned.sort((a, b) => a.pickup.localeCompare(b.pickup))[0];
      if (!b) return;
      const id = "rem-" + uid();
      s.ext.reminder = { id, ref: b.ref };
      s.alerts.unshift({ id, audience: "driver", driverId, kind: "clock", title: "Pickup in 1 hour 30 minutes", body: `${b.passenger} at ${b.from}, ${time(b.pickup)}.${b.flight ? ` Flight ${b.flight}.` : ""}`, at: stamp(), read: false, ref: b.ref });
    });
  },
  dismissReminder(id: string) { update((s) => { if (!s.ext.dismissed.includes(id)) s.ext.dismissed.push(id); }); },
  acceptJobUpdate(token: string) {
    update((s) => {
      const u = s.ext.jobUpdates[token]; if (!u) return; u.accepted = true;
      const b = find(s, u.ref); if (b) { tl(b, `Driver accepted the updated pickup ${u.newTime}`); log(b, "Driver accepted the updated job", "Dispatcher"); }
      pushAlert(s, { audience: "admin", kind: "check", title: `${u.ref}: updated job accepted`, body: `New pickup ${u.newTime}`, ref: u.ref });
    });
  },
  setRenewal(driverId: string, p: Partial<Renewal>) {
    update((s) => { s.ext.renewals[driverId] = { ...{ policy: "", expiry: "", note: "", sent: false }, ...s.ext.renewals[driverId], ...p }; });
  },
  sendRenewal(driverId: string) {
    update((s) => {
      const r = s.ext.renewals[driverId]; if (!r) return; r.sent = true;
      const d = drv(s, driverId);
      pushAlert(s, { audience: "admin", kind: "shield", title: `Insurance renewal: ${d?.name ?? driverId}`, body: `Policy ${r.policy || "not given"}${r.expiry ? `, valid to ${r.expiry}` : ""}. ${r.file ?? "No file"}.` });
    });
  },
  addCard(label: string) { update((s) => { if (!s.ext.cards.includes(label) && s.identity.card !== label) s.ext.cards.push(label); }); },
};

/** Auto-complete trips heading to destination (runs in every tab, idempotent). */
export function startTicker() {
  const t = setInterval(() => {
    const due = state.bookings.filter((b) => b.status === "onboard" && b.heading && b.headingAt && Date.now() - b.headingAt > 14000);
    due.forEach((b) => actions.complete(b.ref));
  }, 1000);
  return () => clearInterval(t);
}

export const selectDriver = (id?: string | null) => (s: State) => s.drivers.find((d) => d.id === id);
export const selectBooking = (ref?: string) => (s: State) => s.bookings.find((b) => b.ref === ref);
