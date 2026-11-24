import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarCheck, CircleDollarSign, Clock3, Navigation, ReceiptText, UserRoundCheck, type LucideIcon } from "lucide-react";
import { Btn, Card, DocPill, Logo, Skeleton, StatusPill, inputCls } from "@/components/kit";
import { useOpenBooking } from "@/components/admin-shell";
import { toast, useAppState, safeStore } from "@/lib/store";
import { ACTIVE, driverDocs, isToday, longDate, moneyShort, routeShort, time, dayLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("samuel@stluciantaxiandtours.com");
  const [pw, setPw] = useState("demo-password");
  return (
    <div className="grid min-h-[100dvh] bg-ground md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <section className="bg-hero on-dark relative flex flex-col overflow-hidden p-6 text-white sm:p-8 md:p-12">
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative"><Logo /></div>
        <div className="relative my-auto py-10 md:py-12">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12.5px] font-semibold"><span className="h-2 w-2 rounded-full bg-orange" />Dispatch console</p>
          <h1 className="mt-5 text-[clamp(32px,4.6vw,56px)] font-bold leading-[1.04] tracking-[-0.03em]">Dispatch every ride<br />from one screen.</h1>
          <p className="mt-4 max-w-[460px] text-[17px] leading-relaxed text-white/85">Assign drivers, follow live trips, manage fixed prices and refunds for St. Lucia.</p>
          <ul className="mt-7 hidden max-w-[460px] grid-cols-3 gap-3 text-[13px] md:grid">
            {[[CalendarCheck, "Bookings"], [Navigation, "Live trips"], [ReceiptText, "Refunds"]].map(([I, t]) => { const Icon = I as LucideIcon; return <li key={t as string} className="rounded-lg border border-white/12 bg-white/[.07] p-3 font-semibold"><Icon size={18} className="mb-2 text-orange-soft" />{t as string}</li>; })}
          </ul>
        </div>
        <p className="relative text-[13px] text-white/80">Morne Fortune, Castries, St. Lucia</p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-8">
        <form className="w-full max-w-[420px] rounded-2xl border border-line bg-paper p-6 shadow-pop sm:p-8" onSubmit={(e) => { e.preventDefault(); if (!email.includes("@") || !pw) return toast("Enter email and password", "err"); safeStore.set("session", "stlu-admin", "1"); nav("/admin"); }}>
          <h2 className="text-[26px] font-bold leading-tight">Admin sign in</h2>
          <p className="mt-1 text-[14px] text-mute">Dispatcher and admin accounts only.</p>
          <label htmlFor="admin-email" className="mt-6 block text-[13px] font-semibold text-neutral-ink">Email</label>
          <input id="admin-email" type="email" autoComplete="username" data-testid="input-admin-email" className={inputCls + " mt-1.5"} value={email} onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="admin-password" className="mt-4 block text-[13px] font-semibold text-neutral-ink">Password</label>
          <input id="admin-password" autoComplete="current-password" data-testid="input-admin-password" type="password" className={inputCls + " mt-1.5"} value={pw} onChange={(e) => setPw(e.target.value)} />
          <div className="flex justify-end"><button type="button" data-testid="link-forgot-password" onClick={() => nav("/admin/forgot-password")} className="min-h-11 text-[14px] font-semibold text-green">Forgot password?</button></div>
          <Btn type="submit" className="mt-1 w-full" data-testid="button-admin-signin">Sign in</Btn>
          <p className="mt-4 rounded-md bg-aground px-3 py-2 text-center text-[12.5px] text-mute">Prototype: any password works and nothing is stored.</p>
        </form>
      </section>
    </div>
  );
}

export function Kpi({ label, value, sub, tone, I }: { label: string; value: string | number; sub: string; tone?: "warn"; I?: LucideIcon }) {
  return (
    <Card className={cn("anim-rise relative min-w-0 overflow-hidden p-4", tone === "warn" && "border-orange/60 bg-warn-soft")}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium leading-snug text-mute">{label}</p>
        {I && <span className={cn("inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md", tone === "warn" ? "bg-orange text-orange-ink" : "bg-ok text-green")}><I size={17} /></span>}
      </div>
      <p className={cn("tnum mt-1 font-display text-[clamp(26px,2.4vw,32px)] font-bold leading-none tracking-[-0.03em]", tone === "warn" && "text-warn-ink")}>{value}</p>
      <p className="mt-2 text-[12.5px] font-medium text-mute">{sub}</p>
    </Card>
  );
}

export function BarChart({ data, target, labels }: { data: number[]; target: number; labels: string[] }) {
  const max = 24;
  const ticks = [0, 6, 12, 18, 24];
  return (
    <figure>
    <figcaption className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] font-medium text-neutral-ink">
      <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[3px] bg-green" />At or above daily target ({Math.round(target)})</span>
      <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[3px] bg-[#8CCBAA]" />Below target</span>
      <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[3px] bg-orange" />Today</span>
      <span className="inline-flex items-center gap-1.5"><i className="w-4 border-t-2 border-dashed border-ink" />Target</span>
    </figcaption>
    <div className="relative mt-5 h-[clamp(180px,24vw,240px)] pl-8" role="img" aria-label={`Bookings per day for the last ${data.length} days. Daily target ${Math.round(target)}.`}>
      {ticks.map((v) => <span key={v} className="tnum absolute left-0 w-6 text-right text-[12px] text-mute" style={{ bottom: `${(v / max) * 100}%`, transform: "translateY(50%)" }}>{v}</span>)}
      <div className="absolute inset-y-0 left-8 right-0">
        {ticks.map((v) => <span key={v} className={cn("absolute inset-x-0 border-t", v === 0 ? "border-line-strong" : "border-line")} style={{ bottom: `${(v / max) * 100}%` }} />)}
        <div className="absolute inset-0 flex items-end gap-[3px] sm:gap-[5px]">
          {data.map((v, i) => <div key={i} title={`${v} bookings`} className={cn("min-w-0 flex-1 rounded-t-[4px] transition-opacity hover:opacity-80", i === data.length - 1 ? "bg-orange" : v >= target ? "bg-green" : "bg-[#8CCBAA]")} style={{ height: `${(v / max) * 100}%` }} />)}
        </div>
        <div className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-ink/70" style={{ bottom: `${(target / max) * 100}%` }} />
      </div>
      <div className="absolute -bottom-6 left-8 right-0 flex justify-between text-[12px] font-medium text-mute">{labels.map((l) => <span key={l}>{l}</span>)}</div>
    </div>
    </figure>
  );
}

export function Dashboard() {
  const s = useAppState();
  const open = useOpenBooking();
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 350); return () => clearTimeout(t); }, []);
  const k = useMemo(() => {
    const today = s.bookings.filter((b) => isToday(b.pickup));
    const refundsMonth = s.refunds.filter((r) => r.date.startsWith("2026-12") && r.status !== "Declined" && r.status !== "Dispatcher review");
    return {
      today: today.length, pending: s.bookings.filter((b) => b.status === "pending").length,
      active: s.bookings.filter((b) => ACTIVE.includes(b.status)).length, onway: s.bookings.filter((b) => b.status === "on_the_way").length,
      completed: today.filter((b) => b.status === "completed").length,
      revenue: today.filter((b) => b.status !== "cancelled").reduce((a, b) => a + b.total, 0),
      refunds: refundsMonth.reduce((a, r) => a + r.amount, 0), refundCount: refundsMonth.length,
    };
  }, [s]);
  const fresh = s.bookings.filter((b) => b.status === "pending" || b.status === "assigned").slice(0, 4);
  const docAlerts = s.drivers.flatMap((d) => driverDocs(d).filter((x) => x.tone !== "ok").map((x) => ({ d, x }))).sort((a, b) => a.x.days - b.x.days);
  const month = s.chart.slice(-14).reduce((a, b) => a + b, 0);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6">
        {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[118px] !rounded-xl" />) : <>
          <Kpi I={CalendarCheck} label="Bookings today" value={k.today} sub="+3 vs yesterday" />
          <Kpi I={Clock3} label="Pending to assign" value={k.pending} sub="Assign before 12:00" tone={k.pending ? "warn" : undefined} />
          <Kpi I={Navigation} label="Active trips" value={k.active} sub={`${k.onway} on the way`} />
          <Kpi I={UserRoundCheck} label="Completed today" value={k.completed} sub="All on time" />
          <Kpi I={CircleDollarSign} label="Revenue today" value={moneyShort(Math.round(k.revenue))} sub="USD" />
          <Kpi I={ReceiptText} label="Refunds this month" value={moneyShort(Math.round(k.refunds))} sub={`${k.refundCount} refunds`} />
        </>}
      </div>
      {/* items-stretch plus a column layout inside: the two cards used to end at different heights,
          which left a ragged edge across the middle of the dashboard on a wide screen. */}
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] items-stretch gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <Card className="flex min-w-0 flex-col p-5 pb-10">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-[17px] font-bold">Bookings, last 30 days</h2><span className="tnum rounded-full bg-ok px-2.5 py-1 text-[12.5px] font-semibold text-green">{month} this month</span></div>
          <BarChart data={s.chart} target={500 / 30} labels={["15 Nov", "29 Nov", "14 Dec"]} />
        </Card>
        <Card className="flex flex-col p-5">
          <div className="flex items-center justify-between"><h2 className="text-[17px] font-bold">New bookings</h2><Link to="/admin/bookings" className="inline-flex min-h-11 items-center px-2 text-[14px] font-semibold text-green hover:underline">View all</Link></div>
          <div className="mt-2 flex-1">
            {fresh.map((b) => (
              <button key={b.ref} onClick={() => open(b.ref)} className="-mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-md border-b border-line px-2 py-3 text-left last:border-0 hover:bg-aground">
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", b.status === "pending" ? "bg-orange shadow-[0_0_0_3px_rgba(245,144,43,.25)]" : "bg-line-strong")} />
                <div className="min-w-0 flex-1"><p className="text-[14px] leading-snug"><b>{b.passenger}</b> <span className="text-mute">· {b.ref}</span></p><p className="text-[13px] leading-snug text-mute">{routeShort(b)} · {isToday(b.pickup) ? time(b.pickup) : `${time(b.pickup)} ${dayLabel(b.pickup).slice(0, 3)}`}</p></div>
                <StatusPill status={b.status} />
              </button>
            ))}
            {fresh.length === 0 && <p className="py-6 text-center text-[14px] text-mute">All bookings have a driver.</p>}
          </div>
        </Card>
      </div>
      <Card className="p-5">
        <h2 className="text-[17px] font-bold">Document alerts <span className="text-[13px] font-normal text-mute">· most urgent first</span></h2>
        {docAlerts.map(({ d, x }) => (
          <Link key={d.id + x.key} to={`/admin/drivers/${d.id}`} className="-mx-2 flex min-h-14 items-center justify-between gap-3 rounded-md border-b border-line px-2 py-3 last:border-0 hover:bg-aground">
            <div className="min-w-0"><p className="text-[14px] font-semibold">{x.name === "Driver licence" ? "Licence" : x.name}: {d.name}{d.type === "Outside" ? " (outside)" : ""}</p><p className="text-[13px] text-mute">{x.tone === "err" ? "Expired" : "Expires"} {longDate(x.exp)}</p></div>
            <DocPill tone={x.days <= 14 ? "err" : x.tone} label={x.label} />
          </Link>
        ))}
      </Card>
    </div>
  );
}
