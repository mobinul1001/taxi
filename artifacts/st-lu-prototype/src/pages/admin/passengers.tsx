import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Search, Users } from "lucide-react";
import { Avatar, Card, Empty, Pill, StatusPill } from "@/components/kit";
import { useOpenBooking } from "@/components/admin-shell";
import { useBoxWidth } from "@/components/mobile";
import { payTone } from "@/components/booking-drawer";
import { useAppState } from "@/lib/store";
import { dayLabel, money, routeShort, time } from "@/lib/format";
import type { Booking } from "@/lib/types";

export function usePassengers() {
  const s = useAppState();
  return useMemo(() => {
    const map = new Map<string, { name: string; email: string; phone: string; trips: Booking[] }>();
    s.bookings.forEach((b) => { const p = map.get(b.email) ?? { name: b.passenger, email: b.email, phone: b.phone, trips: [] }; p.trips.push(b); map.set(b.email, p); });
    return [...map.values()].map((p) => ({ ...p, spent: p.trips.filter((t) => t.payment === "Paid").reduce((a, t) => a + t.total, 0), last: p.trips.map((t) => t.pickup).sort().pop()!, sources: [...new Set(p.trips.map((t) => t.source))] }))
      .sort((a, b) => b.last.localeCompare(a.last));
  }, [s]);
}

export function Passengers() {
  const list = usePassengers();
  const [q, setQ] = useState("");
  const rows = list.filter((p) => (p.name + p.email + p.phone).toLowerCase().includes(q.toLowerCase()));
  const [box, w] = useBoxWidth();
  const table = w >= 700;   // Passenger, Email, Trips, Paid total, Last pickup need about 680px
  return (
    <div>
      <div className="relative max-w-[320px]"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" /><input aria-label="Search passengers" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${list.length} passengers`} className="h-11 w-full rounded-md border border-line-strong bg-paper pl-10 pr-3 text-[14px] outline-none transition placeholder:text-faint focus:border-green focus:ring-4 focus:ring-green/15" /></div>
      <div ref={box} className="mt-4">
      <Card className="overflow-hidden">
        {!table ? (
          <ul className="divide-y divide-line">{rows.map((p) => (
            <li key={p.email}>
              <Link to={`/admin/passengers/${encodeURIComponent(p.email)}`} data-testid={`link-passenger-${p.email}`} className="tap block px-4 py-3.5 hover:bg-aground">
                <div className="flex items-center gap-3"><Avatar name={p.name} size={40} tone="soft" />
                  <div className="min-w-0 flex-1"><p className="text-[15px] font-bold leading-tight">{p.name}</p></div>
                  <div className="shrink-0 text-right"><p className="tnum text-[15px] font-bold">{money(p.spent)}</p><p className="text-[12.5px] text-mute">paid total</p></div></div>
                <p className="mt-1.5 text-[13.5px] text-mute [overflow-wrap:anywhere]">{p.email}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-mute">
                  <span className="whitespace-nowrap">{p.phone}</span><span className="whitespace-nowrap">{p.trips.length} {p.trips.length === 1 ? "trip" : "trips"}</span><span className="whitespace-nowrap">Last pickup {dayLabel(p.last)}</span>
                  <span className="flex flex-wrap gap-1">{p.sources.map((x) => <Pill key={x}>{x}</Pill>)}</span></div>
              </Link>
            </li>))}</ul>
        ) : (
        <table className="w-full text-[14px]">
          <thead><tr className="border-b border-line bg-aground text-left text-[12px] uppercase tracking-wider text-mute">{["Passenger", "Email", ...(w >= 940 ? ["Phone"] : []), "Trips", "Paid total", "Last pickup", ...(w >= 1040 ? ["Source"] : [])].map((h) => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>{rows.map((p) => (
            <tr key={p.email} className="border-b border-line last:border-0 hover:bg-aground">
              <td className="px-4 py-3"><Link to={`/admin/passengers/${encodeURIComponent(p.email)}`} data-testid={`link-passenger-${p.email}`} className="flex min-h-11 min-w-0 items-center gap-3 font-bold hover:text-green"><Avatar name={p.name} size={36} tone="soft" />{p.name}</Link></td>
              <td className="px-4">{p.email}</td>{w >= 940 && <td className="whitespace-nowrap px-4">{p.phone}</td>}<td className="px-4">{p.trips.length}</td><td className="px-4">{money(p.spent)}</td><td className="whitespace-nowrap px-4">{dayLabel(p.last)}</td>
              {w >= 1040 && <td className="px-4"><div className="flex gap-1">{p.sources.map((x) => <Pill key={x}>{x}</Pill>)}</div></td>}
            </tr>
          ))}</tbody>
        </table>
        )}
        {rows.length === 0 && <Empty icon={<Users />} title="No passengers found" body="Try another name, email or phone." />}
      </Card>
      </div>
    </div>
  );
}

export function PassengerDetail() {
  const { email } = useParams();
  const list = usePassengers();
  const open = useOpenBooking();
  const p = list.find((x) => x.email === decodeURIComponent(email ?? ""));
  const [box, w] = useBoxWidth();
  const table = w >= 760;
  const trips = p ? [...p.trips].sort((a, b) => b.pickup.localeCompare(a.pickup)) : [];
  if (!p) return <Card><Empty icon={<Users />} title="Passenger not found" body="" action={<Link to="/admin/passengers" className="font-semibold text-green">Back to passengers</Link>} /></Card>;
  return (
    <div>
      <Link to="/admin/passengers" className="mb-4 inline-flex items-center gap-2 text-[14px] font-semibold text-green"><ArrowLeft size={16} />All passengers</Link>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="p-5">
          <Avatar name={p.name} size={64} /><h2 className="mt-3 text-[22px] font-bold">{p.name}</h2>
          <p className="text-[14px] text-mute">{p.email}</p><p className="text-[14px] text-mute">{p.phone}</p>
          <div className="mt-4 grid grid-cols-2 gap-3"><div><p className="font-display text-[24px] font-bold">{p.trips.length}</p><p className="text-[12px] text-mute">Bookings</p></div><div><p className="font-display text-[24px] font-bold">{money(p.spent)}</p><p className="text-[12px] text-mute">Paid via Stripe</p></div></div>
          <div className="mt-4 flex gap-2"><a className="font-semibold text-green" href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}>Call</a><span className="text-mute">·</span><a className="font-semibold text-green" target="_blank" rel="noreferrer" href={`https://wa.me/${p.phone.replace(/\D/g, "")}`}>WhatsApp</a></div>
        </Card>
        <div ref={box} className="min-w-0">
        <Card className="overflow-hidden">
          <p className="px-5 pt-4 font-display font-bold">Booking history</p>
          {!table ? (
            <ul className="mt-2 divide-y divide-line border-t border-line">{trips.map((b) => (
              <li key={b.ref} onClick={() => open(b.ref)} className="cursor-pointer px-4 py-3.5 hover:bg-aground">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="tnum text-[14px] font-bold">{b.ref}</p><p className="text-[13.5px] text-mute">{routeShort(b)}</p></div><StatusPill status={b.status} /></div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-mute"><span>{b.service}</span><span className="tnum whitespace-nowrap">{dayLabel(b.pickup)} {time(b.pickup)}</span><span className="tnum font-semibold text-ink">{money(b.total)}</span><Pill tone={payTone(b.payment)}>{b.payment}</Pill></div>
              </li>))}</ul>
          ) : (
          <table className="w-full text-[14px]"><tbody>
            {trips.map((b) => (
              <tr key={b.ref} onClick={() => open(b.ref)} className="cursor-pointer border-b border-line last:border-0 hover:bg-aground">
                <td className="px-5 py-3 font-bold">{b.ref}</td><td className="px-2">{b.service}</td><td className="px-2">{routeShort(b)}</td><td className="whitespace-nowrap px-2">{dayLabel(b.pickup)} {time(b.pickup)}</td><td className="px-2">{money(b.total)}</td><td className="px-2"><Pill tone={payTone(b.payment)}>{b.payment}</Pill></td><td className="pr-5"><StatusPill status={b.status} /></td>
              </tr>
            ))}
          </tbody></table>
          )}
        </Card>
        </div>
      </div>
    </div>
  );
}
