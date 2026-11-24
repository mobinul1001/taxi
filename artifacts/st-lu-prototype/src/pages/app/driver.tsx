import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bell, Briefcase, Car, ChevronRight, Clock, Headset, LogOut, MapPin, Navigation, Phone, ShieldAlert, ShieldCheck, Star, TrendingUp, Wallet } from "lucide-react";
import { Avatar, BackBtn, Btn, Card, DocPill, Empty, Pill, ThemeRow } from "@/components/kit";
import { Screen } from "@/components/mobile";
import { ContactButtons, Row, RouteBlock } from "@/components/bits";
import { actions, NOTIFIED, toast, useAppState, useSession } from "@/lib/store";
import { LogoutSheet } from "@/components/logout-sheet";
import { dayLabel, driverDocs, isToday, longDate, money, routeShort, time, worstDoc } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AlertList } from "./account";
import { Face, SampleNote } from "@/components/photo";
import { driverFace } from "@/assets/media";

export function useDriver() {
  const sess = useSession();
  const s = useAppState();
  const id = sess?.role === "driver" && sess.driverId ? sess.driverId : "DRV-007";
  const d = s.drivers.find((x) => x.id === id) ?? s.drivers[0];
  const mine = useMemo(() => s.bookings.filter((b) => b.driverId === d?.id).sort((a, b) => a.pickup.localeCompare(b.pickup)), [s, d?.id]);
  return { s, d, mine };
}

const when = (iso: string) => (isToday(iso) ? `Today · ${time(iso)}` : `${dayLabel(iso)} · ${time(iso)}`);

export function DriverJobs() {
  const { s, d, mine } = useDriver();
  const nav = useNavigate();
  if (!d) return <Navigate to="/app/welcome" replace />;
  const fresh = mine.filter((b) => b.status === "assigned" && !b.accepted);
  const active = mine.filter((b) => b.accepted && ["assigned", "on_the_way", "at_pickup", "onboard"].includes(b.status));
  const [next, ...later] = active;
  const doc = worstDoc(d);
  const unread = s.alerts.some((a) => a.audience === "driver" && a.driverId === d.id && !a.read);
  return (
    <Screen tabs="driver" className="">
      {/* the chip wraps to its own line before the greeting is ever squeezed */}
      <div className="px-5 pt-[clamp(18px,5vh,48px)]">
        <div className="flex items-center gap-3">
          <Face slot={driverFace(d.id)} size={46} />
          <div className="min-w-0 flex-1"><p className="whitespace-nowrap text-[13px] font-medium text-mute">Monday 14 Dec</p><h1 className="whitespace-nowrap font-display text-[clamp(21px,3.4vh,26px)] font-bold leading-tight">Hi, {d.name.split(" ")[0]}</h1></div>
          <Link to="/app/driver/alerts" aria-label="Alerts" className="tap relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-ink shadow-e1"><Bell size={20} />{unread && <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-orange" />}</Link>
        </div>
        {/* read-only: dispatch assigns every trip, drivers have no availability toggle.
            Its own line below the greeting, so the date and the name are never squeezed. */}
        <span className={cn("mt-2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-semibold", d.unavailable ? "bg-err-tint text-err" : "bg-neutral text-neutral-ink")}>{d.unavailable ? <><span className="h-2 w-2 rounded-full bg-err" />Marked unavailable</> : <><Headset size={13} />Dispatcher-managed</>}</span>
        <SampleNote className="mt-1.5" />
      </div>
      <div className="px-5">
      {d.unavailable && <div className="mt-4 rounded-lg bg-err-tint p-4 text-[14px] text-err"><b>Marked unavailable by the dispatcher.</b> {d.unavailable}. Call the dispatcher to change this.</div>}
      {doc.tone !== "ok" && (() => {
        // Escalates as the date nears: amber (15+ days), orange (8 to 14), red (7 or fewer, or expired).
        const level = doc.tone === "err" || doc.days <= 7 ? 2 : doc.days <= 14 ? 1 : 0;
        return (
          <button type="button" data-testid="banner-doc-expiry" data-level={level} onClick={() => doc.key === "insurance" && nav("/app/driver/renew")}
            className={cn("tap mt-3 flex w-full items-center gap-3 rounded-lg border p-3 text-left text-[14px] leading-snug", level === 0 ? "border-orange/25 bg-warn text-warn-ink" : level === 1 ? "border-orange bg-orange text-orange-ink shadow-e2" : "border-err bg-err text-white shadow-e2")}>
            <span className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md", level === 0 ? "bg-orange/20" : level === 1 ? "bg-white/35" : "bg-white/20")}>{level === 0 ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}</span>
            <p className="min-w-0 flex-1"><b>{doc.name} {doc.tone === "warn" ? `expires in ${doc.days} days` : "has expired"}</b> ({longDate(doc.exp)}). {doc.key === "insurance" && s.ext.renewals[d.id]?.sent ? "Renewal sent to dispatcher." : "Send the renewal to the dispatcher."}</p>
            {doc.key === "insurance" && <ChevronRight size={18} className="shrink-0 opacity-80" />}
          </button>
        );
      })()}
      {fresh.map((b) => (
        <button key={b.ref} data-testid={`button-new-trip-${b.ref}`} onClick={() => nav("/app/driver/new-trip")} className="anim-pop tap mt-3 flex w-full items-center gap-3 rounded-lg bg-orange p-3.5 text-left text-orange-ink shadow-e2">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/35"><Bell size={20} /></span><span className="min-w-0 flex-1"><b className="block">New trip assigned · {b.ref}</b><span className="text-[14px]">{b.service}, {when(b.pickup)}. Tap to accept.</span></span><ChevronRight size={18} className="shrink-0" />
        </button>
      ))}
      <h2 className="mt-[clamp(12px,2.4vh,24px)] font-sans text-[12px] font-bold uppercase tracking-wider text-mute">Next trip</h2>
      {next ? (
        <div className="anim-rise mt-2 overflow-hidden rounded-xl border border-line bg-paper shadow-pop">
        <Link to={`/app/driver/trips/${next.ref}`} data-testid="card-next-trip" className="tap block">
          <div className="bg-hero relative flex items-center justify-between gap-3 overflow-hidden px-4 py-3 text-white"><span className="bg-dots pointer-events-none absolute inset-0 opacity-50" />
            <div className="relative min-w-0"><p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-orange-soft"><Clock size={14} />{when(next.pickup)}</p><p className="font-display text-[clamp(19px,3vh,23px)] font-bold leading-tight">{next.service}</p></div>
            <div className="relative shrink-0 text-right"><p className="tnum font-display text-[26px] font-bold leading-none text-white">{money(next.payout)}</p><p className="mt-1 text-[12px] font-medium text-white/75">Your payout</p></div>
          </div>
          <div className="px-4 pt-3.5">
            <RouteBlock from={next.from} to={next.to} fromLabel="Pickup" toLabel="Drop-off" />
            <div className="mt-3 flex items-center gap-3 border-t border-line py-3">
              <Avatar name={next.passenger} size={38} tone="soft" />
              <div className="min-w-0 flex-1"><p className="text-[15px] font-semibold leading-tight">{next.passenger}</p><p className="text-[13px] leading-snug text-mute">{next.pax} pax{next.flight ? ` · Flight ${next.flight}` : ""} · {next.ref}</p></div>
              {next.status !== "assigned" ? <Pill dot tone="ok">{next.status === "on_the_way" ? "On my way" : next.status === "at_pickup" ? "At pickup" : "Onboard"}</Pill> : <Pill dot tone="info">Accepted</Pill>}
            </div>
          </div>
        </Link>
        <div className="grid grid-cols-2 gap-2.5 px-4 pb-4">
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(next.from + ", St Lucia")}`} target="_blank" rel="noreferrer" data-testid="button-navigate" className="tap inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-green px-2 font-semibold text-white shadow-[0_10px_20px_-12px_rgba(14,107,69,.9)] hover:bg-green-deep"><Navigation size={17} className="shrink-0" />Navigate</a>
          <a href={`tel:${(next.phone ?? "").replace(/[^\d+]/g, "")}`} data-testid="button-call-passenger" className="tap inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-line-strong bg-paper px-2 font-semibold text-ink shadow-e1 hover:border-green/60"><Phone size={17} className="shrink-0 text-green" />Call<span className="hidden min-[360px]:inline"> passenger</span></a>
        </div>
        </div>
      ) : <Card className="mt-2"><Empty icon={<Briefcase />} title="No trips right now" body="The dispatcher assigns every trip. New trips appear here with an SMS and WhatsApp alert." /></Card>}
      <div className="mt-4 flex items-center justify-between">
        <h2 className="font-sans text-[12px] font-bold uppercase tracking-wider text-mute">{later.length > 0 ? "Later this week" : ""}</h2>
        <Link to="/app/driver/trips" data-testid="link-all-trips" className="inline-flex min-h-12 items-center gap-1 text-[14px] font-semibold text-green">All trips<ChevronRight size={16} /></Link>
      </div>
      <div className="tablet-2col">
      {later.map((b) => (
        <Link key={b.ref} to={`/app/driver/trips/${b.ref}`} className="tap mt-2 flex items-center gap-3 rounded-lg border border-line bg-paper p-3.5 shadow-card">
          <span className="inline-flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md bg-ok text-green"><span className="text-[12px] font-bold uppercase leading-none">{dayLabel(b.pickup).slice(0, 3)}</span><span className="tnum font-display text-[16px] font-bold leading-tight">{b.pickup.slice(8, 10)}</span></span>
          <div className="min-w-0 flex-1"><p className="flex flex-wrap items-center gap-x-2 text-[15px] font-semibold leading-tight"><span className="tnum">{time(b.pickup)}</span><span>{b.service}</span></p><p className="mt-0.5 text-[13px] leading-snug text-mute">{b.to === "Island loop" ? "Island loop" : routeShort(b)}</p></div>
          <span className="tnum shrink-0 font-display text-[16px] font-bold">{money(b.payout)}</span>
        </Link>
      ))}
      </div>
      <div className="h-6" />
      </div>
    </Screen>
  );
}

export function NewTrip() {
  const { mine } = useDriver();
  const nav = useNavigate();
  const b = mine.find((x) => x.status === "assigned" && !x.accepted);
  return (
    <div className="bg-hero flex h-full flex-col px-5 text-white">
      {!b ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="inline-flex h-[84px] w-[84px] items-center justify-center rounded-full bg-white/15"><Bell size={36} /></span>
          <h1 className="mt-5 text-[28px] font-bold">No new trips</h1>
          <p className="mt-2 text-white/80">The dispatcher assigns trips. You get an SMS, WhatsApp and in-app alert.</p>
          <Btn variant="white" className="mt-6" onClick={() => nav("/app/driver/jobs")}>Back to jobs</Btn>
        </div>
      ) : (
        <>
          <div className="no-scrollbar flex-1 overflow-y-auto pt-[clamp(20px,6vh,60px)] text-center">
            <span className="anim-pop inline-flex h-[84px] w-[84px] items-center justify-center rounded-full bg-orange text-orange-ink shadow-[0_0_0_10px_rgba(245,144,43,.22)]"><Bell size={38} /></span>
            <h1 className="mt-4 text-[32px] font-bold">New trip assigned</h1>
            <p className="mt-1 text-[16px] text-white/85">Assigned by dispatcher · SMS and WhatsApp sent</p>
            <div className="anim-rise mt-6 rounded-xl bg-paper p-5 text-left text-ink shadow-float">
              <div className="flex items-start justify-between"><div><p className="font-display text-[20px] font-bold">{b.service}</p><p className="text-[14px] text-mute">Your payout</p></div><span className="font-display text-[28px] font-bold text-green">{money(b.payout)}</span></div>
              <RouteBlock className="mt-4" from={b.from} to={b.to} fromLabel="Pickup" toLabel="Drop-off" />
              <div className="mt-3 border-t border-line">
                <Row label="Date and time" value={`${dayLabel(b.pickup)} · ${time(b.pickup)}`} strong />
                <Row label="Passenger" value={b.passenger} strong />
                <Row label="Passengers / bags" value={`${b.pax} / ${b.bags}`} strong />
                {b.flight && <Row label="Flight" value={b.flight} strong />}
                {b.note && <Row label="Note" value={b.note} strong />}
              </div>
            </div>
          </div>
          <div className="shrink-0 pb-6 pt-3">
            <Btn variant="orange" className="min-h-14 w-full text-[17px]" data-testid="button-accept-trip" onClick={() => { actions.accept(b.ref); toast("Trip accepted. Dispatcher notified"); nav(`/app/driver/trips/${b.ref}`); }}>Accept trip</Btn>
            <p className="mt-3 text-center text-[13px] text-white/85">Reminder will arrive 1 hour 30 minutes before pickup.</p>
          </div>
        </>
      )}
    </div>
  );
}

export function DriverTrip() {
  const { id } = useParams();
  const { s, d } = useDriver();
  const nav = useNavigate();
  const b = s.bookings.find((x) => x.ref === id);
  if (!b) return <Screen className="p-6"><Empty icon={<Briefcase />} title="Trip not found" body="It may have been reassigned or removed by the dispatcher." action={<Link to="/app/driver/jobs" className="font-semibold text-green">Back to jobs</Link>} /></Screen>;
  const mine = b.driverId === d?.id;
  let cta: React.ReactNode = null;
  if (!mine) cta = <p className="text-center text-[14px] text-mute">This trip is assigned to another driver.</p>;
  else if (b.status === "assigned" && !b.accepted) cta = <Btn variant="orange" className="min-h-14 w-full text-[17px]" onClick={() => { actions.accept(b.ref); toast("Trip accepted"); }}>Accept trip</Btn>;
  else if (b.status === "assigned") cta = <Btn className="min-h-14 w-full text-[17px]" data-testid="button-on-my-way" onClick={() => { actions.advance(b.ref); toast(NOTIFIED); nav(`/app/driver/trips/${b.ref}/progress`); }}>On my way</Btn>;
  else if (["on_the_way", "at_pickup", "onboard"].includes(b.status)) cta = <Btn className="min-h-14 w-full text-[17px]" onClick={() => nav(`/app/driver/trips/${b.ref}/progress`)}>Continue trip</Btn>;
  else if (b.status === "completed") cta = <Btn variant="outline" className="min-h-[56px] w-full" onClick={() => nav(`/app/driver/trips/${b.ref}/done`)}>View summary</Btn>;
  return (
    <Screen className="px-5" footer={cta}>
      <div className="-mx-5 flex items-center gap-3 px-5 pb-3 pt-[clamp(18px,5vh,48px)]"><BackBtn to="/app/driver/jobs" /><div className="min-w-0"><h1 className="font-display text-[22px] font-bold leading-tight">Trip detail</h1><p className="text-[13px] text-mute">{b.ref} · {b.service}</p></div></div>
      {isToday(b.pickup) && b.status === "assigned" && <div className="flex items-center gap-3 rounded-2xl bg-warn p-4 text-[15px] font-semibold text-warn-ink"><Clock size={20} /> Reminder: pickup in 1 hour 30 minutes ({time(b.pickup)})</div>}
      <Card className="mt-3 p-4">
        <RouteBlock from={b.from} to={b.to} fromLabel={`Pickup · ${isToday(b.pickup) ? "Today" : dayLabel(b.pickup)} ${time(b.pickup)}`} toLabel="Drop-off" />
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.from + ", St Lucia")}`} target="_blank" rel="noreferrer" className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ok font-semibold text-green"><MapPin size={18} /> Open in Google Maps</a>
      </Card>
      <Card className="mt-3 p-4">
        <div className="flex items-center gap-3"><Avatar name={b.passenger} size={52} tone="soft" /><div><p className="text-[17px] font-semibold">{b.passenger}</p><p className="text-[14px] text-mute">{b.phone}</p></div></div>
        <div className="mt-4"><ContactButtons phone={b.phone} /></div>
      </Card>
      <Card className="mb-3 mt-3 px-4 py-1">
        {b.flight && <Row label="Flight" value={b.flight} />}
        <Row label="Passengers / bags" value={`${b.pax}/${b.bags}`} />
        {b.note && <Row label="Note" value={b.note} />}
        <Row label="Your payout" value={money(b.payout)} strong />
      </Card>
      <p className="mb-3 text-center text-[12px] text-mute">Trips are assigned by the dispatcher. To change a trip, call {s.settings.phones[0]}.</p>
    </Screen>
  );
}

const DAYS7 = ["2026-12-08", "2026-12-09", "2026-12-10", "2026-12-11", "2026-12-12", "2026-12-13", "2026-12-14"];
/** 7-day earnings: every bar is labelled with its payout and trip count, so the totals can be read off the chart. */
function EarningsChart({ days }: { days: { day: string; amount: number; trips: number }[] }) {
  const [sel, setSel] = useState<number | null>(null);
  const total = days.reduce((n, d) => n + d.amount, 0);
  const trips = days.reduce((n, d) => n + d.trips, 0);
  const top = Math.max(100, Math.ceil(Math.max(...days.map((d) => d.amount)) / 50) * 50);
  const ticks = [top, top / 2, 0];
  const wd = (iso: string) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(iso + "T12:00").getDay()];
  const pick = (e: React.PointerEvent<HTMLDivElement>) => { const r = e.currentTarget.getBoundingClientRect(); setSel(Math.max(0, Math.min(days.length - 1, Math.floor(((e.clientX - r.left) / r.width) * days.length)))); };
  const cur = sel === null ? null : days[sel];
  return (
    <Card className="mt-3 p-4" data-testid="chart-earnings">
      <div className="flex items-baseline justify-between gap-3"><h2 className="font-sans text-[15px] font-semibold">Last 7 days</h2><p className="tnum text-[13.5px] font-semibold text-neutral-ink" data-testid="text-earnings-summary">{trips} {trips === 1 ? "trip" : "trips"}, {money(total)}</p></div>
      <p className="tnum mt-0.5 min-h-[18px] text-[12.5px] text-mute" aria-live="polite">{cur ? `${wd(cur.day)} ${+cur.day.slice(8)} Dec: ${cur.trips} ${cur.trips === 1 ? "trip" : "trips"}, ${money(cur.amount)}` : "Tap a day for details"}</p>
      <div className="mt-2 flex gap-2" aria-hidden>
        <div className="tnum relative h-[150px] w-8 shrink-0 text-right text-[12px] text-mute">{ticks.map((t) => <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${24 + (1 - t / top) * 126}px` }}>${t}</span>)}</div>
        <div className="relative h-[150px] min-w-0 flex-1 cursor-pointer touch-pan-y" onPointerDown={pick} onPointerMove={(e) => { if (e.pointerType === "mouse") pick(e); }} onPointerLeave={(e) => { if (e.pointerType === "mouse") setSel(null); }}>
          {ticks.map((t) => <span key={t} className={cn("absolute inset-x-0 border-t", t === 0 ? "border-line-strong" : "border-dashed border-line")} style={{ top: `${24 + (1 - t / top) * 126}px` }} />)}
          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
            {days.map((d, i) => { const h = (d.amount / top) * 126; const today = i === days.length - 1; return (
              <div key={d.day} className={cn("relative rounded-md transition-colors", sel === i && "bg-ok/70")}>
                <div className="absolute inset-x-0 flex flex-col items-center" style={{ bottom: `${d.amount ? h : 0}px` }}>
                  <span className={cn("tnum whitespace-nowrap text-[12px] font-bold leading-tight", d.amount ? "text-ink" : "text-mute")}>{d.amount ? `$${Math.round(d.amount)}` : "0"}</span>
                </div>
                {d.amount ? <div className={cn("absolute bottom-0 left-1/2 w-[62%] max-w-[34px] -translate-x-1/2 rounded-t-md", today ? "bg-orange" : "bg-green")} style={{ height: `${Math.max(4, h)}px` }}>{d.trips > 0 && h > 22 && <span className={cn("tnum absolute inset-x-0 bottom-1 text-center text-[12px] font-bold leading-none", today ? "text-orange-ink" : "text-white")}>{d.trips}</span>}</div>
                  : <div className="absolute bottom-0 left-1/2 w-[62%] max-w-[34px] -translate-x-1/2 border-t-2 border-dotted border-mute/60" />}
              </div>); })}
          </div>
        </div>
      </div>
      <div className="mt-1.5 flex gap-2" aria-hidden><div className="w-8 shrink-0" /><div className="grid min-w-0 flex-1 text-center" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
        {days.map((d, i) => <div key={d.day} className={cn("leading-tight", i === days.length - 1 ? "font-bold text-ink" : "text-mute")}><span className="block whitespace-nowrap text-[12px] max-[379px]:tracking-[-0.04em]">{i === days.length - 1 ? "Today" : wd(d.day)}</span><span className="tnum block text-[12px] font-semibold">{+d.day.slice(8)}</span></div>)}
      </div></div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-[12px] font-medium text-neutral-ink" aria-hidden>
        <li className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[3px] bg-green" />Payout per day</li>
        <li className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[3px] bg-orange" />Today</li>
        <li className="flex items-center gap-1.5"><i className="w-3.5 border-t-2 border-dotted border-mute" />No trips</li>
        <li className="flex items-center gap-1.5"><i className="tnum inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-[3px] bg-green px-0.5 text-[12px] font-bold not-italic text-white">2</i>Trips that day</li>
      </ul>
      <table className="sr-only"><caption>Earnings for the last 7 days</caption><thead><tr><th>Day</th><th>Trips</th><th>Payout</th></tr></thead><tbody>{days.map((d) => <tr key={d.day}><td>{wd(d.day)} {+d.day.slice(8)} Dec</td><td>{d.trips}</td><td>{money(d.amount)}</td></tr>)}</tbody></table>
    </Card>
  );
}

export function Earnings() {
  const { d, mine } = useDriver();
  const [tab, setTab] = useState<"done" | "up">("done");
  const done = mine.filter((b) => b.status === "completed").sort((a, b) => b.pickup.localeCompare(a.pickup));
  const up = mine.filter((b) => b.accepted && !["completed", "cancelled"].includes(b.status));
  const today = done.filter((b) => isToday(b.pickup)).reduce((a, b) => a + b.payout, 0);
  const perDay = DAYS7.map((day) => done.filter((b) => b.pickup.startsWith(day)).reduce((a, b) => a + b.payout, 0));
  const week = perDay.reduce((a, b) => a + b, 0) + 0;
  const shown = week || 0;
  const trips = done.filter((b) => DAYS7.some((x) => b.pickup.startsWith(x))).length;
  if (!d) return null;
  return (
    <Screen tabs="driver" className="">
      <div className="px-5 pt-[clamp(18px,5vh,48px)]">
        <h1 className="font-display text-[clamp(24px,3.8vh,30px)] font-bold leading-tight">Earnings</h1>
        <p className="text-[13.5px] text-mute">Payouts for completed trips, in USD.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-hero relative overflow-hidden rounded-xl p-4 text-white shadow-pop"><span className="bg-dots pointer-events-none absolute inset-0 opacity-50" /><p className="relative flex items-center gap-1.5 text-[13px] font-medium text-white/80"><Wallet size={15} />Today</p><p className="tnum relative mt-1 font-display text-[clamp(22px,7vw,30px)] font-bold leading-none text-orange-soft" data-testid="text-earnings-today">{money(today)}</p></div>
          <div className="rounded-xl border border-line bg-paper p-4 shadow-card"><p className="flex items-center gap-1.5 text-[13px] font-medium text-mute"><TrendingUp size={15} className="text-green" />Last 7 days</p><p className="tnum mt-1 font-display text-[clamp(22px,7vw,30px)] font-bold leading-none">{money(shown)}</p></div>
        </div>
      </div>
      <div className="px-5">
      <EarningsChart days={DAYS7.map((day) => { const t = done.filter((x) => x.pickup.startsWith(day)); return { day, amount: t.reduce((n, x) => n + x.payout, 0), trips: t.length }; })} />
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-neutral p-1" role="tablist">
        {(["done", "up"] as const).map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("tap min-h-12 rounded-md text-[14.5px] font-semibold transition", tab === t ? "bg-paper text-green shadow-e2" : "text-neutral-ink")}>{t === "done" ? "Completed" : "Upcoming"}</button>)}
      </div>
      <Card className="mb-6 mt-3 px-4">
        {(tab === "done" ? done : up).slice(0, 8).map((b) => (
          <Link key={b.ref} to={tab === "done" ? `/app/driver/trips/${b.ref}/done` : `/app/driver/trips/${b.ref}`} className="flex min-h-14 items-center justify-between gap-3 border-b border-line py-3 last:border-0">
            <div className="min-w-0"><p className="font-semibold">{b.service}</p><p className="text-[13.5px] leading-snug text-mute">{isToday(b.pickup) ? "Today" : dayLabel(b.pickup)} · {b.to === "Island loop" ? "Island loop" : routeShort(b)}</p></div>
            <span className="tnum shrink-0 font-display font-bold">{money(b.payout)}</span>
          </Link>
        ))}
        {(tab === "done" ? done : up).length === 0 && <Empty icon={<Car />} title="Nothing here yet" body="Trips appear here after the dispatcher assigns them." />}
      </Card>
      </div>
    </Screen>
  );
}

export function DriverProfile() {
  const { s, d } = useDriver();
  const nav = useNavigate();
  const [logout, setLogout] = useState(false);
  if (!d) return null;
  const sent = s.ext.renewals[d.id]?.sent;
  return (
    <Screen tabs="driver" className="px-5 pt-[clamp(18px,5vh,48px)]">
      <Card className="flex items-center gap-4 p-4"><Face slot={driverFace(d.id)} size={64} /><div className="min-w-0"><h1 className="truncate font-display text-[21px] font-bold leading-tight">{d.name}</h1><p className="text-[13.5px] text-mute">{d.type} driver · {d.id}</p><p className="mt-1.5 flex flex-wrap gap-1.5 text-[12.5px] font-semibold"><span className="inline-flex items-center gap-1 rounded-full bg-neutral px-2 py-0.5 text-neutral-ink"><Star size={12} className="fill-orange text-orange" />{d.rating} rating</span><span className="rounded-full bg-neutral px-2 py-0.5 text-neutral-ink">{d.trips} trips</span></p><SampleNote className="mt-1.5" /></div></Card>
      <h2 className="mb-2 mt-5 font-sans text-[12px] font-bold uppercase tracking-wider text-mute">Vehicle</h2>
      <Card className="flex items-center gap-3 p-4"><span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-ok text-green"><Car size={22} /></span><div><p className="font-semibold">{d.vehicle} · {d.color} · {d.year}</p><p className="text-[14px] text-mute">Plate {d.plate} · {d.seats} seats</p></div></Card>
      <h2 className="mb-2 mt-5 font-sans text-[12px] font-bold uppercase tracking-wider text-mute">Documents</h2>
      <Card className="px-4">
        {driverDocs(d).map((doc) => doc.key === "insurance" ? (
          <button key={doc.key} data-testid="row-doc-insurance" onClick={() => nav("/app/driver/renew")} className="flex min-h-14 w-full items-center justify-between gap-3 border-b border-line py-3 text-left last:border-0">
            <div><p className="font-semibold">{doc.name}</p><p className="text-[14px] text-mute">Valid until {longDate(doc.exp)}</p></div>{sent ? <Pill tone="info">Sent to dispatcher</Pill> : <DocPill tone={doc.tone} label={doc.label} />}
          </button>
        ) : (
          <div key={doc.key} className="flex min-h-14 items-center justify-between gap-3 border-b border-line py-3 last:border-0">
            <div><p className="font-semibold">{doc.name}</p><p className="text-[14px] text-mute">Valid until {longDate(doc.exp)}</p></div><DocPill tone={doc.tone} label={doc.label} />
          </div>
        ))}
      </Card>
      <p className="mt-3 text-[13px] text-mute">We remind you and the dispatcher 30 days before any document expires. Send renewals to the dispatcher.</p>
      <p className="mt-2 rounded-md bg-info px-3 py-2.5 text-[13px] font-medium text-info-ink">Availability is managed by the dispatcher only.</p>
      <Card className="mt-4"><ThemeRow className="border-b border-line" /><a href={`tel:${s.settings.phones[0].replace(/[^\d+]/g, "")}`} className="flex min-h-[56px] items-center gap-3 px-4"><Phone size={20} className="text-green" /><span className="flex-1">Help: call dispatcher</span><span className="text-[14px] text-mute">{s.settings.phones[0]}</span></a></Card>
      {/* same way out of the driver app on a phone */}
      <Link to="/" data-testid="link-driver-start" className="tap mt-4 flex min-h-12 items-center justify-center gap-1.5 rounded-lg border border-line bg-paper text-[14px] font-semibold text-ink [@media(min-width:1000px)]:hidden"><ArrowLeft size={16} />Back to the start page</Link>
      <Btn variant="outline" className="mb-6 mt-3 w-full !border-err !text-err" data-testid="button-driver-logout" onClick={() => setLogout(true)}><LogOut size={18} /> Log out</Btn>
      <LogoutSheet open={logout} onClose={() => setLogout(false)} />
    </Screen>
  );
}

export function DriverAlerts() {
  const { s, d } = useDriver();
  const nav = useNavigate();
  const list = useMemo(() => s.alerts.filter((a) => a.audience === "driver" && a.driverId === d?.id), [s, d?.id]);
  return <AlertList list={list} back="/app/driver/jobs" onMarkAll={() => { actions.markRead("driver", d?.id); toast("All alerts marked as read"); }}
    onOpen={(a) => {
      if (a.kind === "change" && a.title === "Trip changed by dispatcher") return nav(`/app/driver/trips/${a.ref ?? "SLU-48318"}/changed`);
      if (a.kind === "shield" && /insurance/i.test(a.title)) return nav("/app/driver/renew");
      const b = a.ref && s.bookings.find((x) => x.ref === a.ref); if (b && b.status === "assigned" && !b.accepted) nav("/app/driver/new-trip"); else if (b) nav(`/app/driver/trips/${b.ref}`); }} />;
}
