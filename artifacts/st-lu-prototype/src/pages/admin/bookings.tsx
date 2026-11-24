import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Btn, Card, Empty, Modal, Pill, StatusPill, inputCls } from "@/components/kit";
import { useOpenBooking } from "@/components/admin-shell";
import { useBoxWidth, useMedia } from "@/components/mobile";
import { AssignModal } from "@/components/assign-modal";
import { payTone } from "@/components/booking-drawer";
import { actions, toast, useAppState } from "@/lib/store";
import { checkPickup, dayLabel, driverLabel, money, routeShort, STATUS_LABEL, time } from "@/lib/format";
import { PLACES } from "@/lib/seed";
import { cn } from "@/lib/utils";
import type { Booking, Service, Status } from "@/lib/types";

const PER = 10;
const sel = "h-11 w-full min-w-0 max-w-full rounded-md border border-line-strong bg-paper pl-3 text-[13.5px] font-semibold outline-none transition hover:border-mute/60 focus:border-green focus:ring-4 focus:ring-green/15";

export function Bookings() {
  const s = useAppState();
  const open = useOpenBooking();
  const [tab, setTab] = useState<"bookings" | "quotes">("bookings");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("all");
  const [svc, setSvc] = useState("all");
  const [drv, setDrv] = useState("all");
  const [page, setPage] = useState(1);
  // below 768 the table becomes a stacked list: one of the two is rendered, never both
  const phone = useMedia("(max-width: 767px)");
  const [assign, setAssign] = useState<Booking | null>(null);
  const [create, setCreate] = useState(false);
  const rows = useMemo(() => s.bookings.filter((b) =>
    (!q || (b.ref + b.passenger).toLowerCase().includes(q.toLowerCase())) && (status === "all" || b.status === status) && (svc === "all" || b.service === svc) &&
    (drv === "all" || (drv === "none" ? !b.driverId : b.driverId === drv)) &&
    (range === "all" || (range === "week" ? b.pickup >= "2026-12-14" && b.pickup <= "2026-12-20T23:59" : b.pickup.startsWith("2026-12-14")))
  ).sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending") || b.ref.localeCompare(a.ref)), [s, q, status, svc, drv, range]);
  const pages = Math.max(1, Math.ceil(rows.length / PER));
  const cur = Math.min(page, pages);
  const shown = rows.slice((cur - 1) * PER, cur * PER);
  const newQuotes = s.quotes.filter((x) => x.status === "New").length;

  return (
    <div>
      <div className="mb-4 inline-flex max-w-full gap-1 rounded-lg bg-neutral p-1" role="tablist">
        <button role="tab" aria-selected={tab === "bookings"} onClick={() => setTab("bookings")} className={cn("tap min-h-11 rounded-md px-4 text-[14px] font-semibold", tab === "bookings" ? "bg-paper text-green shadow-e2" : "text-neutral-ink hover:text-ink")}>Bookings</button>
        <button role="tab" aria-selected={tab === "quotes"} data-testid="tab-quotes" onClick={() => setTab("quotes")} className={cn("tap min-h-11 rounded-md px-4 text-[14px] font-semibold", tab === "quotes" ? "bg-paper text-green shadow-e2" : "text-neutral-ink hover:text-ink")}>Quote requests{newQuotes > 0 && <span className="tnum ml-2 rounded-full bg-orange px-2 py-0.5 text-[12px] text-orange-ink">{newQuotes}</span>}</button>
      </div>
      {tab === "quotes" ? <Quotes /> : <>
        {/* phone: search full width, then an even 2x2 grid of equal selects, then the button.
            tablet and up: one row. */}
        {/* One toolbar: search and the button share the top row from 768 up, the four filters sit in an
            even four-column row under it. On a phone: search, a 2x2 grid of filters, then the button. */}
        {/* 320px is too narrow for two of these side by side without cutting a label, so there the
            filters stack; from 360 they are a 2x2 grid; from 768 a single row of four. */}
        <div className="grid grid-cols-1 items-center gap-2.5 min-[360px]:grid-cols-2 md:grid-cols-4">
          <div className="relative w-full min-w-0 min-[360px]:col-span-2 md:col-span-3"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" /><input data-testid="input-search-bookings" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Search reference, passenger" placeholder="Search reference, passenger" className="h-11 w-full rounded-md border border-line-strong bg-paper pl-10 pr-3 text-[14px] outline-none transition placeholder:text-faint focus:border-green focus:ring-4 focus:ring-green/15" /></div>
          <Btn className="order-last w-full min-[360px]:col-span-2 md:order-none md:col-span-1" data-testid="button-new-booking" onClick={() => setCreate(true)}><Plus size={18} />New booking</Btn>
          <select className={sel} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status"><option value="all">Status: All</option>{(Object.keys(STATUS_LABEL) as Status[]).map((x) => <option key={x} value={x}>{STATUS_LABEL[x]}</option>)}</select>
          <select className={sel} value={range} onChange={(e) => { setRange(e.target.value); setPage(1); }} aria-label="Date"><option value="all">Date: All</option><option value="week">Date: 14 to 20 Dec</option><option value="today">Date: Today</option></select>
          <select className={sel} value={svc} onChange={(e) => { setSvc(e.target.value); setPage(1); }} aria-label="Service"><option value="all">Service: All</option>{["Airport Transfer", "Round-Trip", "Private Tour", "Full-Day Tour"].map((x) => <option key={x}>{x}</option>)}</select>
          <select className={sel} value={drv} onChange={(e) => { setDrv(e.target.value); setPage(1); }} aria-label="Driver"><option value="all">Driver: All</option><option value="none">Unassigned</option>{s.drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        </div>
        <Card className="mt-4 overflow-hidden">
          {/* A 700px table inside a 340px phone is a sideways-scrolling strip with words cut in half.
              Below 768 the same bookings are stacked cards instead; only one of the two is ever rendered,
              so every row keeps one id. */}
          {phone ? (
            <ul className="divide-y divide-line">
              {shown.map((b) => (
                <li key={b.ref}>
                  <div data-testid={`row-booking-${b.ref}`} role="button" tabIndex={0} onClick={() => open(b.ref)} onKeyDown={(e) => { if (e.key === "Enter") open(b.ref); }}
                    className={cn("tap block w-full cursor-pointer px-4 py-3.5 text-left", b.status === "pending" && "bg-warn-soft shadow-[inset_3px_0_0_var(--color-orange)]")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="tnum text-[12.5px] font-bold text-mute">{b.ref} &middot; {b.source}</p>
                        <p className="mt-0.5 text-[15px] font-semibold leading-tight">{b.passenger}</p>
                        <p className="mt-0.5 text-[13.5px] leading-snug text-mute">{b.to === "Island loop" ? "Island loop" : routeShort(b)}</p>
                      </div>
                      <StatusPill status={b.status} />
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-mute">
                      <span className="tnum font-semibold text-ink">{time(b.pickup)} &middot; {dayLabel(b.pickup)}</span>
                      <span className="tnum font-semibold text-ink">{money(b.total)}</span>
                      <span>{b.service} &middot; {b.pax} pax</span>
                      <span className={cn(!b.driverId && "text-mute")}>{driverLabel(s.drivers.find((d) => d.id === b.driverId))}</span>
                    </div>
                    {(b.status === "pending" || b.status === "assigned") && (
                      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                        <Btn size="sm" variant={b.status === "pending" ? "primary" : "outline"} className="w-full" data-testid={`button-assign-${b.ref}`} onClick={() => setAssign(b)}>{b.status === "pending" ? "Assign a driver" : "Reassign"}</Btn>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-[14px]">
              <thead><tr className="border-b border-line bg-aground text-left text-[12px] uppercase tracking-wider text-mute">{["Reference", "Trip", "Pickup", "Price", "Driver", "Status", ""].map((h, i) => <th key={h + i} className={cn("whitespace-nowrap px-3.5 py-3 font-semibold", (i === 3 || i === 4) && "hidden xl:table-cell", i === 6 && "sticky right-0 bg-aground")}>{h}</th>)}</tr></thead>
              <tbody>
                {shown.map((b) => (
                  <tr key={b.ref} data-testid={`row-booking-${b.ref}`} onClick={() => open(b.ref)} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") open(b.ref); }} className={cn("cursor-pointer border-b border-line align-middle transition-colors last:border-0 hover:bg-aground [&:hover_td]:bg-aground", b.status === "pending" && "bg-warn-soft")}>
                    <td className={cn("whitespace-nowrap px-3.5 py-3", b.status === "pending" && "shadow-[inset_3px_0_0_var(--color-orange)]")}><p className="tnum font-bold">{b.ref}</p><p className="text-[12px] text-mute">{b.source}</p></td>
                    <td className="min-w-[200px] px-3.5 py-3"><p className="font-semibold">{b.passenger} <span className="font-normal text-mute">· {b.service} · {b.pax} pax</span></p><p className="text-[13px] text-mute">{b.to === "Island loop" ? "Island loop" : routeShort(b)}</p></td>
                    <td className="whitespace-nowrap px-3.5 py-3"><p className="tnum font-semibold">{time(b.pickup)}</p><p className="text-[12px] text-mute">{dayLabel(b.pickup)}</p></td>
                    <td className="hidden whitespace-nowrap px-3.5 py-3 xl:table-cell"><p className="tnum font-semibold">{money(b.total)}</p><Pill tone={payTone(b.payment)} className="mt-1 !py-[3px] !text-[12px]">{b.payment}</Pill></td>
                    <td className={cn("hidden whitespace-nowrap px-3.5 py-3 xl:table-cell", !b.driverId && "text-mute")}>{driverLabel(s.drivers.find((d) => d.id === b.driverId))}</td>
                    <td className="whitespace-nowrap px-3.5 py-3"><StatusPill status={b.status} /></td>
                    <td className={cn("sticky right-0 px-3.5 py-2 text-right", b.status === "pending" ? "bg-warn-soft" : "bg-paper")} onClick={(e) => e.stopPropagation()}>
                      {(b.status === "pending" || b.status === "assigned") && <Btn size="sm" variant={b.status === "pending" ? "primary" : "outline"} data-testid={`button-assign-${b.ref}`} onClick={() => setAssign(b)}>{b.status === "pending" ? "Assign" : "Reassign"}</Btn>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
          {shown.length === 0 && (
              <div className="flex flex-col items-center px-6 py-14 text-center" data-testid="empty-bookings">
                <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ok text-green"><Search /></span>
                <p className="font-display text-[18px] font-bold">No bookings match your filters</p>
                <p className="mt-1 text-[14px] text-mute">Try another date range or clear the filters.</p>
                <Btn variant="outline" className="mt-4" data-testid="button-clear-filters" onClick={() => { setQ(""); setStatus("all"); setRange("all"); setSvc("all"); setDrv("all"); setPage(1); }}>Clear filters</Btn>
              </div>
            )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
            <span className="tnum text-[13.5px] text-mute">Showing {rows.length ? (cur - 1) * PER + 1 : 0} to {Math.min(cur * PER, rows.length)} of {rows.length} bookings</span>
            <nav aria-label="Pagination" className="flex flex-wrap gap-1.5">
              <button aria-label="Previous" disabled={cur === 1} onClick={() => setPage(cur - 1)} className="tap h-11 w-11 rounded-md border border-line bg-paper text-[18px] hover:border-line-strong disabled:opacity-40">‹</button>
              {Array.from({ length: pages }).map((_, i) => <button key={i} onClick={() => setPage(i + 1)} aria-current={cur === i + 1 ? "page" : undefined} className={cn("tap tnum h-11 w-11 rounded-md border text-[14px] font-semibold", cur === i + 1 ? "border-green bg-green text-white" : "border-line bg-paper hover:border-line-strong")}>{i + 1}</button>)}
              <button aria-label="Next" disabled={cur === pages} onClick={() => setPage(cur + 1)} className="tap h-11 w-11 rounded-md border border-line bg-paper text-[18px] hover:border-line-strong disabled:opacity-40">›</button>
            </nav>
          </div>
        </Card>
      </>}
      <AssignModal booking={assign} onClose={() => setAssign(null)} />
      <NewBookingModal open={create} onClose={() => setCreate(false)} />
    </div>
  );
}

function NewBookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useAppState();
  const [f, setF] = useState({ passenger: "", phone: "", service: "Airport Transfer" as Service, from: PLACES.UVF, to: "", pickup: "2026-12-15T10:00", pax: 2, flight: "", source: "WhatsApp" as Booking["source"] });
  return (
    <Modal open={open} onClose={onClose} title="New booking">
      <h3 className="font-display text-[22px] font-bold">New booking</h3>
      <p className="text-[14px] text-mute">For phone and WhatsApp requests. The passenger pays through a Stripe payment link. No cash.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input className={inputCls} placeholder="Passenger name" value={f.passenger} onChange={(e) => setF({ ...f, passenger: e.target.value })} />
        <input className={inputCls} placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <select className={inputCls} value={f.service} onChange={(e) => setF({ ...f, service: e.target.value as Service })}>{(["Airport Transfer", "Round-Trip", "Private Tour", "Full-Day Tour"] as Service[]).map((x) => <option key={x}>{x}</option>)}</select>
        <input type="datetime-local" className={inputCls} value={f.pickup} onChange={(e) => setF({ ...f, pickup: e.target.value })} />
        <input className={inputCls} placeholder="Pickup" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
        <input className={inputCls} placeholder="Drop-off" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
        <input type="number" min={1} max={6} aria-label="Passengers" className={inputCls} value={f.pax} onChange={(e) => setF({ ...f, pax: Number(e.target.value) })} />
        <select className={inputCls} value={f.source} onChange={(e) => setF({ ...f, source: e.target.value as Booking["source"] })}>{["WhatsApp", "Website", "App"].map((x) => <option key={x}>{x}</option>)}</select>
      </div>
      <p className="mt-3 text-[14px]">Fixed price: <b>{money(s.prices[f.service])}</b></p>
      <div className="mt-4 flex justify-end gap-2"><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn onClick={() => {
        if (f.passenger.trim().length < 2 || !f.to.trim()) return toast("Add passenger and drop-off", "err");
        if (f.from.trim().toLowerCase() === f.to.trim().toLowerCase()) return toast("Pickup and drop-off must be different", "err");
        const pe = checkPickup(f.pickup.slice(0, 10), f.pickup.slice(11, 16)); if (pe) return toast(pe, "err");
        if (f.phone && f.phone.replace(/\D/g, "").length < 7) return toast("Enter a valid phone number", "err");
        if (!Number.isInteger(f.pax) || f.pax < 1 || f.pax > 6) return toast("Passengers must be between 1 and 6", "err");
        actions.adminBooking({ ...f, phone: f.phone || "+1 758-555-0000", flight: f.flight || undefined }); toast("Booking created and payment link sent"); onClose();
      }}>Create booking</Btn></div>
    </Modal>
  );
}

function Quotes() {
  const s = useAppState();
  const [price, setPrice] = useState<Record<string, string>>({});
  const [box, w] = useBoxWidth();
  const act = (q: (typeof s.quotes)[number]) => q.status === "New" ? (
    <div className="flex flex-wrap gap-2"><input aria-label="Quote price" className="h-11 w-24 rounded-md border border-line-strong px-2" placeholder="USD" value={price[q.id] ?? ""} onChange={(e) => setPrice({ ...price, [q.id]: e.target.value })} />
      <Btn size="sm" onClick={() => { const n = Number(price[q.id]); if (!n) return toast("Enter a price", "err"); actions.updateQuote(q.id, { status: "Quoted", price: n }); toast("Quote sent by SMS and WhatsApp with Stripe link"); }}>Send</Btn>
      <Btn size="sm" variant="ghost" onClick={() => actions.updateQuote(q.id, { status: "Declined" })}>Decline</Btn></div>
  ) : q.price ? money(q.price) : "-";
  if (w < 1000) return (
    <div ref={box}><Card className="overflow-hidden">
      <ul className="divide-y divide-line">{s.quotes.map((q) => (
        <li key={q.id} className="px-4 py-3.5">
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[14px] font-bold">{q.id} <span className="font-normal text-mute">&middot; {q.source}</span></p><p className="text-[15px] font-semibold">{q.service}</p></div><Pill tone={q.status === "New" ? "warn" : q.status === "Quoted" ? "ok" : "err"}>{q.status}</Pill></div>
          <p className="mt-1 text-[13.5px] text-mute">{q.passenger} &middot; {q.phone}</p>
          <p className="text-[13.5px] text-mute">{q.from}{q.to && ` to ${q.to}`}</p>
          <p className="tnum text-[13px] text-mute">{dayLabel(q.date)} {time(q.date)}</p>
          {q.details && <p className="mt-1 text-[13.5px] text-mute">{q.details}</p>}
          <div className="mt-2.5 text-[14px] font-semibold">{act(q)}</div>
        </li>))}</ul>
      {s.quotes.length === 0 && <Empty icon={<Search />} title="No quote requests" body="Point-to-Point, Chauffeur and Delivery requests appear here." />}
    </Card></div>
  );
  return (
    <div ref={box}><Card className="overflow-hidden">
      <table className="w-full text-[14px]">
        <thead><tr className="border-b border-line bg-aground text-left text-[12px] uppercase tracking-wider text-mute">{["Request", "Service", "Customer", "Route", "Date", "Details", "Status", "Quote"].map((h) => <th key={h} className="px-3.5 py-3 font-semibold">{h}</th>)}</tr></thead>
        <tbody>
          {s.quotes.map((q) => (
            <tr key={q.id} className="border-b border-line align-top last:border-0">
              <td className="px-3.5 py-3 font-bold">{q.id}<p className="font-normal text-mute">{q.source}</p></td><td className="px-3.5 py-3">{q.service}</td>
              <td className="px-3.5 py-3">{q.passenger}<p className="text-mute">{q.phone}</p></td><td className="px-3.5 py-3">{q.from}{q.to && ` to ${q.to}`}</td>
              <td className="whitespace-nowrap px-3.5 py-3">{dayLabel(q.date)} {time(q.date)}</td><td className="max-w-[220px] px-3.5 py-3 text-mute">{q.details}</td>
              <td className="px-3.5 py-3"><Pill tone={q.status === "New" ? "warn" : q.status === "Quoted" ? "ok" : "err"}>{q.status}</Pill></td>
              <td className="px-3.5 py-3">{act(q)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {s.quotes.length === 0 && <Empty icon={<Search />} title="No quote requests" body="Point-to-Point, Chauffeur and Delivery requests appear here." />}
    </Card></div>
  );
}
