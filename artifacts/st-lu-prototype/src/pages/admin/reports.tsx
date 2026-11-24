import { useMemo } from "react";
import { Download } from "lucide-react";
import { Btn, Card } from "@/components/kit";
import { useBoxWidth } from "@/components/mobile";
import { toast, useAppState } from "@/lib/store";
import { money, moneyShort, STATUS_LABEL } from "@/lib/format";
import { Kpi, BarChart } from "./dashboard";

export function Reports() {
  const s = useAppState();
  const [box, w] = useBoxWidth();
  const r = useMemo(() => {
    const paid = s.bookings.filter((b) => b.status !== "cancelled");
    const revenue = paid.reduce((a, b) => a + b.total, 0);
    const by = <K extends string>(f: (b: (typeof s.bookings)[number]) => K) => s.bookings.reduce<Record<string, number>>((a, b) => { const k = f(b); a[k] = (a[k] ?? 0) + 1; return a; }, {});
    const cancelled = s.bookings.filter((b) => b.status === "cancelled");
    const perf = s.drivers.map((d) => { const t = s.bookings.filter((b) => b.driverId === d.id); const done = t.filter((b) => b.status === "completed"); return { d, total: t.length, done: done.length, payout: done.reduce((a, b) => a + b.payout, 0) }; }).sort((a, b) => b.done - a.done);
    return { revenue, service: by((b) => b.service), source: by((b) => b.source), cancelled, perf, refunds: s.refunds.filter((x) => x.status === "Refunded" || x.status === "Processing").reduce((a, x) => a + x.amount, 0) };
  }, [s]);
  const csv = () => {
    const head = ["Reference", "Passenger", "Email", "Service", "From", "To", "Pickup", "Pax", "Total USD", "Payment", "Driver", "Status", "Source", "Stripe ID"];
    const rows = s.bookings.map((b) => [b.ref, b.passenger, b.email, b.service, b.from, b.to, b.pickup.replace("T", " "), b.pax, b.total.toFixed(2), b.payment, s.drivers.find((d) => d.id === b.driverId)?.name ?? "Unassigned", STATUS_LABEL[b.status], b.source, b.stripeId]);
    const text = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = "st-lu-bookings-dec-2026.csv"; a.click();
    toast("CSV exported");
  };
  const bars = (obj: Record<string, number>) => { const max = Math.max(...Object.values(obj), 1); return Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
    <div key={k} className="mt-3"><div className="flex justify-between text-[14px]"><span>{k}</span><b>{v}</b></div><div className="mt-1 h-2.5 rounded-full bg-aground"><div className="h-full origin-left rounded-full bg-green" style={{ transform: `scaleX(${v / max})` }} /></div></div>)); };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between"><h2 className="font-display text-[20px] font-bold">December 2026</h2><Btn data-testid="button-export-csv" onClick={csv}><Download size={18} />Export CSV</Btn></div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi label="Revenue (paid)" value={moneyShort(Math.round(r.revenue))} sub="USD, Stripe only" />
        <Kpi label="Bookings" value={s.bookings.length} sub="Stored in this demo" />
        <Kpi label="Cancellations" value={r.cancelled.length} sub={`${((r.cancelled.length / s.bookings.length) * 100).toFixed(1)}% of bookings`} />
        <Kpi label="Refunded" value={moneyShort(Math.round(r.refunds))} sub="Auto and manual" />
      </div>
      <Card className="p-5 pb-10"><h3 className="font-bold">Bookings per day vs 500 / month target</h3><BarChart data={s.chart} target={500 / 30} labels={["15 Nov", "29 Nov", "14 Dec"]} /></Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5"><h3 className="font-bold">Bookings by service</h3>{bars(r.service)}</Card>
        <Card className="p-5"><h3 className="font-bold">Bookings by source</h3>{bars(r.source)}</Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div ref={box} className="min-w-0"><Card className="overflow-hidden p-5"><h3 className="font-bold">Driver performance</h3>
          {w < 600 ? (
            <ul className="mt-2 divide-y divide-line">{r.perf.slice(0, 10).map(({ d, total, done, payout }) => (
              <li key={d.id} className="py-3">
                <div className="flex items-baseline justify-between gap-3"><p className="text-[15px] font-semibold">{d.name}</p><p className="tnum shrink-0 text-[15px] font-bold">{money(payout)}</p></div>
                <p className="mt-0.5 flex flex-wrap gap-x-3 text-[13px] text-mute"><span>{d.type}</span><span>{total} assigned</span><span>{done} completed</span><span>{d.rating} &#9733;</span></p>
              </li>))}</ul>
          ) : (
          <table className="mt-2 w-full text-[14px]"><thead><tr className="text-left text-[12.5px] text-mute"><th className="py-2">Driver</th><th>Type</th><th>Assigned</th><th>Completed</th><th>Rating</th><th>Payouts</th></tr></thead>
            <tbody>{r.perf.slice(0, 10).map(({ d, total, done, payout }) => <tr key={d.id} className="border-t border-line"><td className="py-2.5 font-semibold">{d.name}</td><td>{d.type}</td><td>{total}</td><td>{done}</td><td>{d.rating}</td><td>{money(payout)}</td></tr>)}</tbody></table>
          )}</Card></div>
        <Card className="p-5"><h3 className="font-bold">Cancellations</h3>
          {r.cancelled.map((b) => <div key={b.ref} className="flex justify-between border-b border-line py-2.5 text-[14px] last:border-0"><span><b>{b.ref}</b> · {b.passenger}</span><span className="text-mute">{b.payment}</span></div>)}</Card>
      </div>
    </div>
  );
}
