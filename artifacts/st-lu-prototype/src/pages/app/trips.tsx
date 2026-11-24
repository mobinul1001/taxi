import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, CalendarDays, Info, ShieldCheck, Star } from "lucide-react";
import { Avatar, Btn, Card, Empty, Pill, ScreenHead, StatusPill } from "@/components/kit";
import { Screen } from "@/components/mobile";
import { ContactButtons, RouteBlock } from "@/components/bits";
import { actions, toast, useAppState } from "@/lib/store";
import { dayLabel, hoursUntil, money, parse, pickupLabel, routeShort, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Booking } from "@/lib/types";
import { myBookings } from "./home";
import { Face, SampleNote } from "@/components/photo";
import { driverFace } from "@/assets/media";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const freeUntil = (iso: string, h: number) => {
  const d = new Date(parse(iso).getTime() - h * 36e5);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export function Trips() {
  const s = useAppState();
  const [tab, setTab] = useState<"up" | "past">("up");
  const mine = useMemo(() => myBookings(s), [s]);
  const up = mine.filter((b) => !["completed", "cancelled"].includes(b.status)).sort((a, b) => a.pickup.localeCompare(b.pickup));
  const past = mine.filter((b) => ["completed", "cancelled"].includes(b.status)).sort((a, b) => b.pickup.localeCompare(a.pickup));
  const card = (b: Booking) => (
    <Link key={b.ref} to={`/app/trips/${b.ref}`} data-testid={`card-trip-${b.ref}`} className="anim-rise tap mt-3 block rounded-xl border border-line bg-paper p-4 shadow-card hover:border-line-strong">
      <div className="flex items-center justify-between">
        <StatusPill status={b.status} label={b.status === "pending" ? "Awaiting driver" : b.status === "cancelled" ? (b.payment === "Review" ? "Cancelled · in review" : "Cancelled · refunded") : undefined} />
        <span className="tnum text-[13px] font-medium text-mute">{b.ref}</span>
      </div>
      {b.status === "completed" || b.status === "cancelled" ? (
        <>
          <p className="mt-3 text-[17px] font-semibold">{b.service} · {shortDate(b.pickup)}</p>
          <p className="text-[14px] text-mute">{b.status === "cancelled" ? (b.payment === "Review" ? "Dispatcher will review the refund" : `${money(b.total)} refunded to your card`) : `${b.from} to ${b.to} · ${money(b.total)}`}</p>
          {b.status === "completed" && !b.rating && <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-green"><Star size={14} /> Rate this trip</span>}
        </>
      ) : (
        <>
          <p className="mt-3 text-[17px] font-semibold">{b.service}</p>
          <p className="text-[14px] text-mute">{pickupLabel(b.pickup)} · {routeShort(b)}</p>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-[14px]"><span className="text-mute">Paid</span><span className="tnum font-display text-[16px] font-bold">{money(b.total)}</span></div>
        </>
      )}
    </Link>
  );
  return (
    <Screen tabs="passenger" fit={false} className="px-5 pt-[clamp(18px,5vh,48px)]">
      <h1 className="font-display text-[clamp(24px,3.8vh,30px)] font-bold leading-tight">My trips</h1>
      {mine.length === 0 ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-neutral p-1"><span className="flex min-h-12 items-center justify-center rounded-md bg-paper text-[15px] font-semibold text-green shadow-e2">Upcoming</span><span className="flex min-h-12 items-center justify-center text-[15px] font-semibold text-mute">Past</span></div>
          <div className="mt-16" data-testid="empty-trips"><Empty icon={<CalendarDays />} title="No trips yet" body="Book an airport transfer or a tour and it will show up here."
            action={<Link to="/app/book/route" data-testid="button-book-first-ride" className="inline-flex min-h-[52px] items-center rounded-lg bg-green px-6 font-semibold text-white">Book your first ride</Link>} /></div>
        </>
      ) : <>
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-neutral p-1">
        {(["up", "past"] as const).map((t) => (
          <button key={t} data-testid={`tab-${t}`} onClick={() => setTab(t)} role="tab" aria-selected={tab === t} className={cn("tap min-h-12 rounded-md text-[14.5px] font-semibold", tab === t ? "bg-paper text-green shadow-e2" : "text-neutral-ink")}>{t === "up" ? "Upcoming" : "Past"}</button>
        ))}
      </div>
      {tab === "up" ? (
        <>
          {up.length ? <div className="tablet-2col mt-3 space-y-3 md:space-y-0">{up.map(card)}</div> : <Empty icon={<CalendarDays />} title="No upcoming trips" body="Book an airport transfer or tour at a fixed price." action={<Link to="/app/book/route" className="font-semibold text-green">Book a ride</Link>} />}
          {past.length > 0 && <><p className="mt-6 text-[12px] font-bold uppercase tracking-wider text-mute">RECENT</p>{past.slice(0, 2).map(card)}</>}
        </>
      ) : past.length ? past.map(card) : <Empty icon={<CalendarDays />} title="No past trips yet" body="Completed and cancelled trips appear here." />}
      </>}
      <div className="h-6" />
    </Screen>
  );
}

function TripBody({ b }: { b: Booking }) {
  const s = useAppState();
  const d = s.drivers.find((x) => x.id === b.driverId);
  return (
    <>
      <Card className="p-4">
        <p className="text-[19px] font-semibold">{b.service}</p>
        <p className="text-[15px] text-mute">{pickupLabel(b.pickup)} · {b.pax} passengers · {b.bags} bags</p>
        <RouteBlock className="mt-3" from={b.from} to={b.to} />
        {(b.flight || b.childSeat) && <p className="mt-3 text-[14px] text-mute">{[b.flight && `Flight ${b.flight}`, b.childSeat && "Child seat requested"].filter(Boolean).join(" · ")}</p>}
        {b.returnTrip && <p className="mt-2 border-t border-line pt-2 text-[14px] text-mute" data-testid="text-return-trip">Return · {pickupLabel(`${b.returnTrip.date}T${b.returnTrip.time}`)} from {b.returnTrip.pickup}{b.returnTrip.flight ? ` · Flight ${b.returnTrip.flight}` : ""}</p>}
      </Card>
      {d && b.status !== "cancelled" ? (
        <Card className="mt-3 p-4">
          <p className="text-[12px] font-bold uppercase tracking-wider text-mute">YOUR DRIVER</p>
          <div className="mt-3 flex items-center gap-3">
            <Face slot={driverFace(d.id)} size={58} />
            <div className="min-w-0 flex-1"><p className="flex items-center gap-1.5 text-[17px] font-semibold leading-tight"><span className="truncate">{d.name}</span><BadgeCheck size={17} className="shrink-0 text-green" aria-label="Verified driver" /></p><p className="text-[14px] text-mute">{d.vehicle} · {d.color} · {d.plate}</p></div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-neutral px-2.5 py-1 text-[13px] font-bold text-neutral-ink"><Star size={13} className="fill-orange text-orange" />{d.rating}</span>
          </div>
          <div className="mt-4"><ContactButtons phone={d.phone} /></div>
          <SampleNote className="mt-2.5" />
        </Card>
      ) : b.status === "pending" ? (
        <Card className="mt-3 flex gap-3 p-4"><Info className="shrink-0 text-warn-ink" size={20} /><p className="text-[14px]">Awaiting driver. Our dispatcher assigns your driver and you get the name, car and plate by SMS and WhatsApp.</p></Card>
      ) : null}
      <Card className="mt-3 p-4">
        <div className="flex justify-between py-1.5 text-[15px]"><span className="text-mute">Fixed fare</span><span>{money(b.base)}</span></div>
        {b.childSeat && <div className="flex justify-between py-1.5 text-[15px]"><span className="text-mute">Child seat</span><span>{money(5)}</span></div>}
        {b.extraStop && <div className="flex justify-between py-1.5 text-[15px]"><span className="text-mute">Extra stop</span><span>{money(8)}</span></div>}
        {b.night && <div className="flex justify-between py-1.5 text-[15px]"><span className="text-mute">Night pickup</span><span>{money(10)}</span></div>}
        <div className="mt-1 flex justify-between border-t border-line pt-3 text-[16px] font-bold"><span>{b.payment === "Paid" ? "Paid (Stripe)" : b.payment}</span><span>{money(b.total)}</span></div>
      </Card>
    </>
  );
}

export function TripDetail() {
  const { id } = useParams();
  const s = useAppState();
  const nav = useNavigate();
  const b = s.bookings.find((x) => x.ref === id);
  if (!b) return <Screen className="p-6"><Empty icon={<CalendarDays />} title="Trip not found" body="It may have been removed by the dispatcher." action={<Link to="/app/trips" className="font-semibold text-green">Back to trips</Link>} /></Screen>;
  const h = hoursUntil(b.pickup);
  const policy = s.settings.policyHours;
  const canCancel = b.status === "pending" || b.status === "assigned";
  const tracking = ["assigned", "on_the_way", "at_pickup", "onboard"].includes(b.status) && b.driverId;
  return (
    <Screen className="px-5" footer={
      <div className="flex flex-col gap-2">
        {tracking && <Btn className="min-h-[52px] text-[16px]" data-testid="button-track" onClick={() => nav(`/app/trips/${b.ref}/live`)}>Track my driver</Btn>}
        {b.status === "completed" && !b.rating && <Btn className="min-h-[52px] text-[16px]" onClick={() => nav(`/app/trips/${b.ref}/complete`)}>Rate your driver</Btn>}
        {(b.status === "completed" || (b.payment === "Paid" && b.status !== "cancelled")) && <Btn variant="outline" className="min-h-[52px] text-[16px]" data-testid="button-view-receipt" onClick={() => nav(`/app/trips/${b.ref}/receipt`)}>View receipt</Btn>}
        {b.status === "cancelled" && <Btn variant="outline" className="min-h-[52px] text-[16px]" data-testid="button-view-cancellation" onClick={() => nav(`/app/trips/${b.ref}/cancelled`)}>View cancellation</Btn>}
        {canCancel && <Btn variant="outline" className="min-h-[52px] !border-err !text-err text-[16px]" data-testid="button-cancel-trip" onClick={() => nav(`/app/trips/${b.ref}/cancel`)}>Cancel trip</Btn>}
      </div>}>
      <div className="-mx-5"><ScreenHead title="Trip detail" sub={b.ref} back="/app/trips" right={<StatusPill status={b.status} label={b.status === "pending" ? "Awaiting driver" : undefined} />} /></div>
      <TripBody b={b} />
      {canCancel && (
        <p className="mt-3 text-center text-[13px] text-mute">
          {h > policy ? `Cancel free of charge until ${freeUntil(b.pickup, policy)} (${policy} hours before pickup).` : `Pickup is within ${policy} hours. No automatic refund: the dispatcher will review a cancellation.`}
        </p>
      )}
      <div className="h-4" />
    </Screen>
  );
}

const REASONS = ["My plans changed", "Flight cancelled or moved", "Found another option"];
export function CancelTrip() {
  const { id } = useParams();
  const s = useAppState();
  const nav = useNavigate();
  const [reason, setReason] = useState(REASONS[0]);
  const b = s.bookings.find((x) => x.ref === id);
  if (!b) return <Screen className="p-6"><Empty icon={<CalendarDays />} title="Trip not found" body="It may have been removed by the dispatcher." action={<Link to="/app/trips" className="font-semibold text-green">Back to trips</Link>} /></Screen>;
  const auto = hoursUntil(b.pickup) > s.settings.policyHours;
  return (
    <div className="relative h-full bg-[#5E6861] text-white">
      <div className="px-5 pt-[clamp(18px,5vh,48px)] opacity-60">
        <h1 className="font-display text-[22px] font-bold">Trip detail</h1>
        <div className="mt-4 rounded-2xl border border-white/30 bg-white/10 p-4"><p className="font-semibold">{b.service}</p><p className="text-[15px]">{pickupLabel(b.pickup)} · {routeShort(b)}</p></div>
      </div>
      <button aria-label="Close" className="absolute inset-0" onClick={() => nav(`/app/trips/${b.ref}`)} />
      <div className="anim-sheet no-scrollbar absolute inset-x-0 bottom-0 max-h-[94%] overflow-y-auto rounded-t-3xl bg-ground px-5 pb-6 pt-3 text-ink shadow-float">
        <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-line-strong" />
        <h2 className="font-display text-[24px] font-bold">Cancel this trip?</h2>
        {b.status === "cancelled" ? <p className="mt-3 text-mute">This trip is already cancelled.</p> : (
          <>
            <div className={cn("mt-4 flex gap-3 rounded-2xl p-4 text-[15px]", auto ? "bg-ok" : "bg-warn")}>
              {auto ? <ShieldCheck className="shrink-0 text-green" size={22} /> : <Info className="shrink-0 text-warn-ink" size={22} />}
              {auto
                ? <p><b>Full refund of {money(b.total)}.</b> Your pickup is more than {s.settings.policyHours} hours away, so the refund goes to your {s.identity.card.replace("Visa", "Visa ending")} automatically.</p>
                : <p><b>No automatic refund.</b> Your pickup is within {s.settings.policyHours} hours. Dispatcher will review your cancellation and confirm by SMS and WhatsApp.</p>}
            </div>
            <p className="mt-4 text-[12px] font-bold uppercase tracking-wider text-mute">REASON (OPTIONAL)</p>
            <div className="mt-2 flex flex-col gap-2">
              {REASONS.map((r) => (
                <button key={r} onClick={() => setReason(r)} role="radio" aria-checked={reason === r} className={cn("tap flex min-h-[52px] items-center gap-3 rounded-lg border px-4 text-left text-[15.5px] font-medium", reason === r ? "border-green bg-ok/70" : "border-line-strong bg-paper")}>
                  <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border-2", reason === r ? "border-green" : "border-mute")}>{reason === r && <span className="h-2.5 w-2.5 rounded-full bg-green" />}</span>{r}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[13px] text-mute">Refunds usually reach your card in 5 to 10 business days. We confirm by SMS and WhatsApp.</p>
            <Btn variant="danger" className="mt-4 min-h-[52px] w-full text-[16px]" data-testid="button-confirm-cancel" onClick={() => {
              actions.cancel(b.ref, reason, "passenger");
              nav(`/app/trips/${b.ref}/cancelled`);
            }}>{auto ? `Cancel trip and refund ${money(b.total)}` : "Cancel trip, dispatcher will review"}</Btn>
          </>
        )}
        <Btn variant="outline" className="mt-2 min-h-[52px] w-full text-[16px]" onClick={() => nav(`/app/trips/${b.ref}`)}>Keep my trip</Btn>
        <p className="sr-only">{dayLabel(b.pickup)}</p>
      </div>
    </div>
  );
}
