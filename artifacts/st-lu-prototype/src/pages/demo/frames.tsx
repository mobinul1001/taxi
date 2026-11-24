import type { ReactNode } from "react";
import { BadgeCheck, Bell, Car, CheckCircle2, ChevronRight, CreditCard, Lock, MapPin, Plane, Star, Users } from "lucide-react";
import { Face } from "@/components/photo";
import { MapView } from "@/components/map";
import { driverFace } from "@/assets/media";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BOOKING, DRIVER, OTHER_DRIVERS, type DemoState } from "./script";

/* ---------- small shared pieces ---------- */

/** which leg of the trip the driver is on, so the map frames what matters now */
const legOf = (s: DemoState): "to-pickup" | "at-pickup" | "onboard" | undefined =>
  s.drv === "enroute" ? "to-pickup" : s.drv === "arrived" ? "at-pickup" : s.drv === "heading" ? "onboard" : undefined;

/** Ring + pointer dot on the control the actor presses in this step. */
export function Tap({ k, tap, className, children }: { k: string; tap?: string; className?: string; children: ReactNode }) {
  const on = tap === k;
  return <div className={cn("relative", on && "demo-tap", className)} data-tap={k}>{children}{on && <span aria-hidden className="demo-tap-dot" />}</div>;
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex items-baseline justify-between gap-3 py-1"><span className="text-[13px] text-mute">{label}</span><span className={cn("text-right text-[13px]", strong ? "font-bold" : "font-semibold")}>{value}</span></div>;
}

function Status({ children, tone = "info" }: { children: ReactNode; tone?: DemoState["tone"] }) {
  const map = { ok: "bg-ok text-green", warn: "bg-warn text-warn-ink", err: "bg-err/12 text-err", info: "bg-ok text-green", neutral: "bg-neutral text-neutral-ink" } as const;
  return <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-bold", map[tone])}>{children}</span>;
}

function Screen({ title, children, foot }: { title: string; children: ReactNode; foot?: ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-ground">
      <div data-frame-head className="shrink-0 border-b border-line bg-paper px-4 py-3"><p className="text-[15px] font-bold">{title}</p></div>
      <div data-frame-screen className="no-scrollbar min-h-0 flex-1 overflow-hidden p-3.5">{children}</div>
      {foot && <div data-frame-foot className="shrink-0 border-t border-line bg-paper p-3">{foot}</div>}
    </div>
  );
}

function Btn({ children, variant = "primary" }: { children: ReactNode; variant?: "primary" | "cta" | "outline" }) {
  const v = { primary: "bg-brand text-brand-ink", cta: "bg-cta text-cta-ink", outline: "border border-line-strong bg-paper text-ink" }[variant];
  return <span className={cn("flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg px-4 text-[15px] font-bold", v)}>{children}</span>;
}

/** Map height for the trim level: a shorter frame gets a shorter map rather than a cut-off one. */
export const mapH = (level: number, full = 160) => [full, Math.round(full * 0.88), Math.round(full * 0.78), 0][Math.min(level, 3)];

/** The trip on the real St. Lucia map. */
export function MapPanel({ progress, eta, label, leg, h = 150 }: { progress: number; eta: number; label: string; leg?: "to-pickup" | "at-pickup" | "onboard"; h?: number }) {
  // a short map is a sliver, not a map: the tightest frames drop it instead of squeezing it
  if (h < 120) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      {/* a fixed 16:10 window, so the map is a whole picture at every frame size, never a cut strip */}
      <div className="w-full" style={{ aspectRatio: "16 / 10", maxHeight: h, minHeight: Math.min(h, 84) }}>
        <MapView from="uvf" to="rodney-bay" progress={progress} caption={null} labels={h >= 110} fitAll
          focus={leg ? "leg" : "trip"} leg={leg} insets={{ top: 12, bottom: 12, left: 12, right: 12 }}
          ariaLabel={`Route from ${BOOKING.fromShort} to ${BOOKING.toShort}, ${label}`} />
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-line bg-paper px-3 py-2">
        <span className="truncate text-[13px] font-semibold text-mute">{BOOKING.fromShort} → {BOOKING.toShort}</span>
        <span className="whitespace-nowrap text-[13px] font-bold text-green">{eta > 0 ? `${eta} min` : label}</span>
      </div>
    </div>
  );
}

/* ---------- passenger ---------- */

export function PassengerFrame({ s, tap, level = 0 }: { s: DemoState; tap?: string; level?: number }) {
  const mh = mapH(level);
  if (s.pax === "book" || s.pax === "price") return (
    <Screen title="Book a ride" foot={<Btn variant="cta">Continue to payment</Btn>}>
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-aground p-1">
        {["Airport", "Round-trip", "Tour"].map((t, i) => (
          i === 0
            ? <Tap key={t} k="service" tap={tap} className="rounded-md"><span className="block rounded-md bg-paper py-2 text-center text-[13px] font-bold text-ink shadow-e1">{t}</span></Tap>
            : <span key={t} className="rounded-md py-2 text-center text-[13px] font-bold text-mute">{t}</span>
        ))}
      </div>
      <div data-trim="1"><Tap k="quote" tap={tap} className="mt-2 rounded-lg">
        <div className="flex items-center justify-between rounded-lg border border-line bg-paper px-3 py-2.5"><span className="text-[13px] font-semibold">Chauffeur service</span><span className="text-[13px] font-bold text-green">Request a quote</span></div>
      </Tap></div>
      <div className="mt-3 rounded-xl border border-line bg-paper p-3">
        <div className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-green" /><div className="min-w-0"><p className="text-[13px] text-mute">Pickup</p><p className="text-[13px] font-semibold">{BOOKING.from}</p></div></div>
        <div className="mt-2.5 flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-cta" /><div className="min-w-0"><p className="text-[13px] text-mute">Drop-off</p><p className="text-[13px] font-semibold">{BOOKING.to}</p></div></div>
      </div>
      <div data-trim="2" className="mt-2.5 grid grid-cols-2 gap-2">
        {[["Date", BOOKING.day], ["Time", BOOKING.time]].map(([l, v]) => <div key={l} className="rounded-lg border border-line bg-paper px-3 py-2"><p className="text-[13px] text-mute">{l}</p><p className="text-[13px] font-semibold">{v}</p></div>)}
      </div>
      {(
        <div data-trim="1" className="mt-2.5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1.5 text-[13px] font-semibold"><Plane size={13} className="text-mute" />{BOOKING.flight}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1.5 text-[13px] font-semibold"><Users size={13} className="text-mute" />{BOOKING.pax} passengers</span>
        </div>
      )}
      <div data-trim="3" className="mt-3 rounded-xl bg-ok p-3">
        <p className="text-[13px] font-semibold text-green">Fixed price per vehicle</p>
        <p className="font-display text-[28px] font-bold leading-tight text-green">{money(BOOKING.total)}</p>
        <p className="text-[13px] text-green">No surge, no hidden fees.</p>
      </div>
    </Screen>
  );

  if (s.pax === "pay") return (
    <Screen title="Payment" foot={<Tap k="pay" tap={tap} className="rounded-lg"><Btn variant="cta"><Lock size={15} />Pay {money(BOOKING.total)}</Btn></Tap>}>
      <div className="rounded-xl border border-line bg-paper p-3">
        <Line label="Trip" value={`${BOOKING.fromShort} → ${BOOKING.toShort}`} />
        <Line label="When" value={`${BOOKING.day}, ${BOOKING.time}`} />
        <Line label="Passengers" value={String(BOOKING.pax)} />
        <div className="mt-1.5 border-t border-line pt-1.5"><Line label="Total" value={money(BOOKING.total)} strong /></div>
      </div>
      <div data-trim="2" className="mt-3 rounded-xl border border-line bg-paper p-3">
        <div className="flex items-center gap-2"><CreditCard size={16} className="text-green" /><span className="text-[13px] font-semibold">{BOOKING.card}</span><span className="ml-auto text-[13px] text-mute">Stripe test</span></div>
        <div className="mt-2 grid grid-cols-2 gap-2">{["12 / 29", "CVC ***"].map((t) => <span key={t} className="rounded-lg bg-aground px-3 py-2 text-[13px] font-semibold text-mute">{t}</span>)}</div>
      </div>
      <p data-trim="2" className="mt-2.5 text-[13px] text-mute">Free cancellation up to 24 hours before pickup.</p>
    </Screen>
  );

  if (s.pax === "waiting") return (
    <Screen title="Your trip">
      <div className="rounded-xl bg-ok p-3.5 text-center">
        <CheckCircle2 size={26} className="mx-auto text-green" />
        <p className="mt-1.5 text-[15px] font-bold text-green">Booking confirmed</p>
        <p className="text-[13px] text-green">{BOOKING.ref} · paid {money(BOOKING.total)}</p>
      </div>
      <div className="mt-3 rounded-xl border border-line bg-paper p-3.5 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-aground"><Car size={18} className="text-mute" /></span>
        <p className="mt-2 text-[13px] font-bold">Pending driver assignment</p>
        <p data-trim="3" className="mt-0.5 text-[13px] leading-snug text-mute">The dispatcher is matching a driver to your flight. You will get the car and plate here.</p>
      </div>
    </Screen>
  );

  if (s.pax === "assigned") return (
    <Screen title="Your trip">
      <div className="flex justify-center"><Status tone={s.drv === "off" || s.drv === "new" ? "info" : "ok"}>{s.drv === "new" || s.drv === "off" ? "Driver assigned" : "Driver accepted"}</Status></div>
      <div className="mt-3 rounded-xl border border-line bg-paper p-3.5">
        <div className="flex items-center gap-3">
          <Face slot={driverFace(DRIVER.id)} size={52} />
          <div className="min-w-0"><p className="text-[15px] font-bold">{DRIVER.name}</p><p className="text-[13px] text-mute">{DRIVER.vehicle}, {DRIVER.colour}</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[13px] font-semibold text-green"><Star size={12} className="fill-current" />{DRIVER.rating} · {DRIVER.trips} trips</p></div>
        </div>
        <div className="mt-3 rounded-lg bg-aground px-3 py-2 text-center"><p className="text-[13px] text-mute">Plate</p><p className="tnum text-[17px] font-bold tracking-wide">{DRIVER.plate}</p></div>
      </div>
      {(
        <div data-trim="1" className="mt-2.5 rounded-xl border border-line bg-paper p-3">
          <Line label="Pickup" value={`${BOOKING.day}, ${BOOKING.time}`} />
          <Line label="From" value={BOOKING.fromShort} />
          <Line label="To" value={BOOKING.toShort} />
        </div>
      )}
      <div data-trim="2"><Tap k="cancel" tap={tap} className="mt-2.5 rounded-lg"><Btn variant="outline">Cancel this trip</Btn></Tap></div>
    </Screen>
  );

  if (s.pax === "live") {
    const head = s.drv === "arrived" ? "Your driver is here" : s.drv === "heading" ? "On the way to Rodney Bay" : `${DRIVER.name.split(" ")[0]} is on the way`;
    const sub = s.drv === "arrived" ? `Waiting at ${BOOKING.fromShort}. Plate ${DRIVER.plate}.` : s.drv === "heading" ? "Arriving about 15:38." : `Arriving in about ${s.eta} minutes.`;
    return (
      <Screen title="Live trip">
        <div className="flex justify-center"><Status tone={s.drv === "arrived" ? "warn" : "info"}>{s.drv === "heading" ? "Trip in progress" : s.drv === "arrived" ? "At pickup" : "On the way"}</Status></div>
        <p className="mt-2.5 text-center text-[15.5px] font-bold">{head}</p>
        <p data-trim="3" className="mb-3 text-center text-[13px] text-mute">{sub}</p>
        <MapPanel progress={s.progress} eta={s.eta} leg={legOf(s)} h={mh} label={s.drv === "arrived" ? "At pickup" : "Arriving"} />
        {s.drv === "heading" && (
          <div data-trim="3" className="mt-2.5 rounded-xl border border-line bg-paper p-3">
            <div className="flex items-center justify-between text-[13px] font-semibold text-mute"><span>{BOOKING.fromShort}</span><span>{BOOKING.toShort}</span></div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-aground"><span className="demo-bar-fill block h-full rounded-full bg-green" style={{ width: `${Math.round(s.progress * 100)}%` }} /></div>
            <p className="mt-1.5 text-[13px] text-mute">Completes automatically at the destination.</p>
          </div>
        )}
        <div data-trim="2" className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-line bg-paper p-2.5">
          <Face slot={driverFace(DRIVER.id)} size={36} />
          <div className="min-w-0"><p className="truncate text-[13px] font-bold">{DRIVER.name}</p><p className="truncate text-[13px] text-mute">{DRIVER.vehicle} · {DRIVER.plate}</p></div>
        </div>
      </Screen>
    );
  }

  if (s.pax === "rating") return (
    <Screen title="Rate your trip" foot={<Btn variant="cta">Submit rating</Btn>}>
      <div data-trim="3" className="rounded-xl bg-ok p-3 text-center"><CheckCircle2 size={22} className="mx-auto text-green" /><p className="mt-1 text-[15px] font-bold text-green">Dropped off at {BOOKING.toShort}</p><p className="text-[13px] text-green">{BOOKING.ref} completed automatically</p></div>
      <div className="mt-3 flex items-center justify-center gap-2.5">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={30} className={i <= 5 ? "fill-current text-cta" : "text-line-strong"} />)}</div>
      <div data-trim="2" className="mt-3 grid grid-cols-2 gap-2">{["On time", "Clean car", "Safe driving", "Friendly"].map((t) => <span key={t} className="rounded-lg border border-line bg-paper px-2 py-2 text-center text-[13px] font-semibold">{t}</span>)}</div>
      <p data-trim="2" className="mt-2.5 text-center text-[13px] text-mute">Receipt sent to {BOOKING.passenger.split(" ")[0]} by email.</p>
    </Screen>
  );

  if (s.pax === "cancelled") return (
    <Screen title="Your trip">
      <div className="flex justify-center"><Status tone="err">Cancelled</Status></div>
      <div className="mt-3 rounded-xl border border-line bg-paper p-3.5">
        <p className="text-[15px] font-bold">{BOOKING.ref} cancelled</p>
        <p className="mt-1 text-[13px] leading-snug text-mute">Cancelled more than 24 hours before pickup, so the full amount goes back automatically.</p>
        <div className="mt-2.5 rounded-lg bg-ok px-3 py-2.5"><p className="text-[13px] font-semibold text-green">Refund</p><p className="font-display text-[24px] font-bold leading-tight text-green">{s.adm === "refund" ? money(BOOKING.total) : "Processing"}</p><p className="text-[13px] text-green">Back to your {BOOKING.card}</p></div>
      </div>
    </Screen>
  );

  return (
    <Screen title="Quote request">
      <div className="rounded-xl bg-warn p-3.5 text-center"><Bell size={22} className="mx-auto text-warn-ink" /><p className="mt-1 text-[15px] font-bold text-warn-ink">Request sent</p><p className="text-[13px] text-warn-ink">Chauffeur service · no payment taken</p></div>
      <div className="mt-3 rounded-xl border border-line bg-paper p-3">
        <Line label="Service" value="Chauffeur, full day" />
        <Line label="Date" value={BOOKING.day} />
        <Line label="Pickup" value={BOOKING.toShort} />
      </div>
      <p data-trim="2" className="mt-2.5 text-[13px] leading-snug text-mute">The dispatcher reviews your request and sends a price with a payment link. Nothing is charged until you pay.</p>
      {s.status.startsWith("Quoted") && <div className="mt-3 rounded-xl bg-ok p-3"><p className="text-[13px] font-semibold text-green">Quote received</p><p className="font-display text-[24px] font-bold leading-tight text-green">$420.00</p><p className="text-[13px] text-green">Tap to pay and confirm</p></div>}
    </Screen>
  );
}

/* ---------- driver ---------- */

export function DriverFrame({ s, tap, level = 0 }: { s: DemoState; tap?: string; level?: number }) {
  const mh = mapH(level);
  if (s.drv === "new") return (
    <Screen title="New trip" foot={<Tap k="accept" tap={tap} className="rounded-lg"><Btn>Accept trip</Btn></Tap>}>
      <div className="rounded-xl bg-warn p-3 text-center"><Bell size={20} className="mx-auto text-warn-ink" /><p className="mt-1 text-[13px] font-bold text-warn-ink">Dispatch assigned you a trip</p></div>
      <div className="mt-3 rounded-xl border border-line bg-paper p-3">
        <Line label="Service" value={BOOKING.service} />
        <Line label="Pickup" value={`${BOOKING.day}, ${BOOKING.time}`} />
        <Line label="From" value={BOOKING.fromShort} />
        <Line label="To" value={BOOKING.toShort} />
        <div data-trim="2"><Line label="Flight" value={BOOKING.flight} /></div>
        <div className="mt-1.5 border-t border-line pt-1.5"><Line label="Your payout" value={money(BOOKING.payout)} strong /></div>
      </div>
      <p data-trim="1" className="mt-2.5 text-[13px] leading-snug text-mute">Assigned trips cannot be declined in the app. Call dispatch if you cannot drive it.</p>
    </Screen>
  );

  const step = s.drv === "accepted" ? { label: "Accepted", k: "on-my-way", cta: "On my way", tone: "ok" as const }
    : s.drv === "enroute" ? { label: "On the way", k: "arrived", cta: "I have arrived", tone: "info" as const }
      : s.drv === "arrived" ? { label: "At pickup", k: "onboard", cta: "Passenger onboard", tone: "warn" as const }
        : s.drv === "heading" ? { label: "Heading to destination", k: "", cta: "", tone: "info" as const }
          : { label: "Completed", k: "", cta: "", tone: "ok" as const };

  if (s.drv === "earnings") return (
    <Screen title="Earnings">
      <div className="rounded-xl bg-ok p-3.5 text-center"><CheckCircle2 size={24} className="mx-auto text-green" /><p className="mt-1 text-[15px] font-bold text-green">Trip completed</p><p className="text-[13px] text-green">{BOOKING.ref} · {BOOKING.fromShort} → {BOOKING.toShort}</p></div>
      <div className="mt-3 rounded-xl border border-line bg-paper p-3.5">
        <p className="text-[13px] text-mute">Today</p>
        <p className="font-display text-[32px] font-bold leading-tight">{money(s.earnings)}</p>
        <p className="mt-0.5 text-[13px] font-semibold text-green">+ {money(BOOKING.payout)} from this trip</p>
        <div data-trim="2" className="mt-3 flex items-end gap-1.5">{[38, 52, 30, 64, 44, 58, 76].map((h, i) => <span key={i} className={cn("flex-1 rounded-t", i === 6 ? "bg-green" : "bg-neutral")} style={{ height: h }} />)}</div>
        <p className="mt-1.5 text-[13px] text-mute">Last 7 days</p>
      </div>
    </Screen>
  );

  return (
    <Screen title="Current trip" foot={step.cta ? <Tap k={step.k} tap={tap} className="rounded-lg"><Btn>{step.cta}</Btn></Tap> : <p className="text-center text-[13px] text-mute">Completes automatically at the destination</p>}>
      <div data-trim="3" className="flex justify-center"><Status tone={step.tone}>{step.label}</Status></div>
      <div className="mt-3 rounded-xl border border-line bg-paper p-3">
        <p className="text-[13px] font-bold">{BOOKING.passenger}</p>
        <p data-trim="2" className="text-[13px] text-mute">{BOOKING.service} · {BOOKING.pax} passengers, {BOOKING.bags} bags</p>
        <div className="mt-2.5"><Line label="From" value={BOOKING.fromShort} /><Line label="To" value={BOOKING.toShort} /><Line label="Payout" value={money(BOOKING.payout)} strong /></div>
      </div>
      {(s.drv === "enroute" || s.drv === "heading") && <div data-trim="3" className="mt-2.5"><MapPanel progress={s.progress} eta={s.eta} leg={legOf(s)} h={mh} label={s.drv === "heading" ? "To drop-off" : "To pickup"} /></div>}
    </Screen>
  );
}

/* ---------- admin ---------- */

const ROWS = [
  { ref: "SLU-48290", who: "Priya Nair", route: "Castries → Pitons", status: "On the way", tone: "info" as const },
  { ref: "SLU-48311", who: "Aisha Khan", route: "PC → Island loop", status: "Driver assigned", tone: "info" as const },
  { ref: "SLU-48244", who: "Tom Walsh", route: "UVF → Cap Estate", status: "Completed", tone: "ok" as const },
];

export function AdminFrame({ s, tap, feed = false, level = 0 }: { s: DemoState; tap?: string; feed?: boolean; level?: number }) {
  const mh = mapH(level, 210);
  const live = s.status !== "";
  const wrap = feed ? "break-words" : "truncate";
  const kpis = [["Bookings today", String(s.trips + (live && s.status !== "Cancelled, refunded" ? 1 : 0))], ["Revenue today", money(s.revenue)], ["Completed", String(s.trips)]];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-ground">
      <div className="flex shrink-0 items-center gap-2 border-b border-line bg-paper px-3 py-2.5">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-green text-[13px] font-bold text-white">SG</span>
        <p className="text-[13px] font-bold">Dispatch</p>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-aground px-2 py-1 text-[13px] font-semibold text-mute">
          <Bell size={13} className={s.alert ? "text-cta" : ""} />{s.alert ? "1 new" : "No alerts"}
        </span>
      </div>

      <div data-frame-screen className="no-scrollbar min-h-0 flex-1 overflow-hidden p-3">
        {!feed && (
          <div data-trim="1" className="grid grid-cols-3 gap-2">
            {kpis.map(([l, v]) => <div key={l} className="rounded-lg border border-line bg-paper px-2.5 py-2"><p className="truncate text-[13px] text-mute">{l}</p><p className="tnum mt-0.5 text-[15px] font-bold leading-tight">{v}</p></div>)}
          </div>
        )}

        {s.adm === "assign" ? (
          <div className="mt-3">
            <p className="text-[13px] font-bold uppercase tracking-wider text-mute">Choose a driver · {BOOKING.ref}</p>
            <Tap k="assign" tap={tap} className="mt-2 rounded-xl">
              <div className="rounded-xl border-2 border-green bg-paper p-2.5">
                <div className="flex items-center gap-2.5">
                  <Face slot={driverFace(DRIVER.id)} size={38} />
                  <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-bold">{DRIVER.name}</p><p className="truncate text-[13px] text-mute">{DRIVER.vehicle}, {DRIVER.colour} · {DRIVER.seats} seats</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] font-semibold text-green"><span className="inline-flex items-center gap-1"><Star size={11} className="fill-current" />{DRIVER.rating}</span><span className="inline-flex items-center gap-1"><BadgeCheck size={12} />{DRIVER.docs}</span><span>{DRIVER.available}</span></p></div>
                  <span className="shrink-0 rounded-lg bg-brand px-3 py-2 text-[13px] font-bold text-brand-ink">Assign</span>
                </div>
              </div>
            </Tap>
            <ul data-trim="2" className="mt-2 flex flex-col gap-1.5">
              {OTHER_DRIVERS.map((d) => (
                <li key={d.id} className="flex items-center gap-2.5 rounded-lg border border-line bg-paper px-2.5 py-2">
                  <Face slot={driverFace(d.id)} size={30} />
                  <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold">{d.name}</p><p className="truncate text-[13px] text-mute">{d.vehicle} · {d.rating}</p></div>
                  <span className={cn("shrink-0 whitespace-nowrap text-[13px] font-semibold", d.ok ? "text-mute" : "text-err")}>{d.state}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : s.adm === "quotes" ? (
          <div className="mt-3">
            <p className="text-[13px] font-bold uppercase tracking-wider text-mute">Quote requests</p>
            <Tap k="quote-price" tap={tap} className="mt-2 rounded-xl">
              <div className="rounded-xl border border-line bg-paper p-3">
                <div className="flex items-center justify-between gap-2"><p className="text-[13px] font-bold">{BOOKING.passenger}</p><Status tone={s.status.startsWith("Quoted") ? "ok" : "warn"}>{s.status.startsWith("Quoted") ? "Quoted" : "New"}</Status></div>
                <p className="mt-1 text-[13px] text-mute">Chauffeur, full day · {BOOKING.day} · Rodney Bay</p>
                <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-aground px-2.5 py-2"><span className="text-[13px] text-mute">Price</span><span className="text-[13px] font-bold">{s.status.startsWith("Quoted") ? "$420.00" : "Set a price"}</span></div>
              </div>
            </Tap>
            <p data-trim="2" className="mt-2 text-[13px] text-mute">Quotes are never charged automatically. The passenger pays the link.</p>
          </div>
        ) : (
          <div className="mt-3">
            {s.alert && <div className="demo-pop mb-2 flex items-center gap-2 rounded-lg bg-warn px-2.5 py-2 text-[13px] font-bold text-warn-ink"><Bell size={14} />New booking to assign</div>}
            <div className="overflow-hidden rounded-xl border border-line bg-paper">
              {live && (
                <div className={cn("gap-2.5 border-b border-line px-2.5 py-2.5", feed ? "flex flex-col items-start" : "flex items-center", s.adm === "detail" || s.adm === "track" || s.adm === "done" ? "bg-ok/60" : "bg-warn/40")} data-testid="demo-admin-row">
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-[13px] font-bold", wrap)}>{BOOKING.passenger} <span className="font-semibold text-mute">· {BOOKING.ref}</span></p>
                    <p className={cn("text-[13px] text-mute", wrap)}>{BOOKING.fromShort} → {BOOKING.toShort} · {BOOKING.time}</p>
                    {s.driver && <p className={cn("mt-0.5 text-[13px] font-semibold text-green", wrap)}>{DRIVER.name} · {DRIVER.plate}</p>}
                  </div>
                  <Status tone={s.tone}>{s.status}</Status>
                </div>
              )}
              {ROWS.map((r) => (
                <div data-trim="2" key={r.ref} className={cn("gap-2.5 border-b border-line px-2.5 py-2.5 last:border-0", feed ? "flex flex-col items-start" : "flex items-center")}>
                  <div className="min-w-0 flex-1"><p className={cn("text-[13px] font-semibold", wrap)}>{r.who} <span className="text-mute">· {r.ref}</span></p><p className={cn("text-[13px] text-mute", wrap)}>{r.route}</p></div>
                  <Status tone={r.tone}>{r.status}</Status>
                </div>
              ))}
            </div>

            {s.adm === "detail" && (
              <div data-trim="3" className="mt-2 rounded-xl border border-line bg-paper p-3">
                <div className="flex items-center justify-between gap-2"><p className="text-[13px] font-bold">{BOOKING.ref}</p><span className="text-[13px] text-mute">Paid {money(BOOKING.total)}</span></div>
                <div className="mt-1.5"><Line label="Flight" value={BOOKING.flight} /><Line label="Passengers" value={`${BOOKING.pax} · ${BOOKING.bags} bags`} /><Line label="Driver payout" value={money(BOOKING.payout)} /></div>
              </div>
            )}
            {s.adm === "track" && <div data-trim="3" className="mt-2"><MapPanel progress={s.progress} eta={s.eta} leg={legOf(s)} h={mh} label="Live" /></div>}
            {s.adm === "done" && <div className="mt-2 rounded-xl bg-ok p-3"><p className="text-[13px] font-bold text-green">{BOOKING.ref} completed automatically</p><p className="mt-0.5 text-[13px] text-green">Revenue and driver payout updated. Nothing to close by hand.</p></div>}
            {s.adm === "refund" && <div className="mt-2 rounded-xl border border-line bg-paper p-3"><p className="text-[13px] font-bold">Refunds</p><div className="mt-1.5 flex items-center justify-between gap-2 rounded-lg bg-aground px-2.5 py-2"><span className="min-w-0 truncate text-[13px]">{BOOKING.ref} · {BOOKING.passenger}</span><span className="whitespace-nowrap text-[13px] font-bold text-green">{money(BOOKING.total)} refunded</span></div><p className="mt-1.5 text-[13px] text-mute">Automatic: cancelled more than 24 hours before pickup.</p></div>}
          </div>
        )}
      </div>

      {feed && <div className="shrink-0 border-t border-line bg-paper px-3 py-2 text-[13px] font-semibold text-mute">Dispatch live feed <ChevronRight size={12} className="inline" /> {s.status || "waiting"}</div>}
    </div>
  );
}
