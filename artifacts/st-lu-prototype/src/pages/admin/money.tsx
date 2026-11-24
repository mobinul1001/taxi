import { useState } from "react";
import { Btn, Card, Pill, inputCls } from "@/components/kit";
import { useOpenBooking } from "@/components/admin-shell";
import { useBoxWidth } from "@/components/mobile";
import { actions, toast, useAppState } from "@/lib/store";
import { money, moneyShort } from "@/lib/format";
import type { Prices, Service } from "@/lib/types";

const FIXED: [Service, string][] = [["Airport Transfer", "Per vehicle, one way"], ["Round-Trip", "Per vehicle"], ["Private Tour", "Up to 6 passengers"], ["Full-Day Tour", "Up to 8 hours"]];

export function Pricing() {
  const s = useAppState();
  const [p, setP] = useState<Record<keyof Prices, string>>(() => Object.fromEntries(Object.entries(s.prices).map(([k, v]) => [k, v.toFixed(2)])) as Record<keyof Prices, string>);
  const save = () => {
    let next = Object.fromEntries(Object.entries(p).map(([k, v]) => [k, Number(v)])) as unknown as Prices;
    const blank = Object.values(p).some((v) => String(v).trim() === "");
    if (blank || Object.values(next).some((v) => !Number.isFinite(v) || v < 0)) return toast("Enter a valid price in every field", "err");
    if (FIXED.some(([k]) => next[k] <= 0)) return toast("Fixed prices must be more than $0", "err");
    if (Object.values(next).some((v) => v > 5000)) return toast("A price cannot be more than $5,000", "err");
    next = Object.fromEntries(Object.entries(next).map(([k, v]) => [k, Math.round(v * 100) / 100])) as unknown as Prices;
    actions.setPrices(next); toast("Prices saved. The app and website use them now");
  };
  const extra = (k: "night" | "childSeat" | "extraStop", l: string) => (
    <div className="flex items-center justify-between border-b border-line py-3 last:border-0"><b className="text-[14px]">{l}</b>
      <div className="flex items-center gap-1 text-mute">+$<input aria-label={l} inputMode="decimal" className="tnum h-11 w-20 rounded-md border border-line-strong bg-paper px-2 text-right text-ink outline-none focus:border-green focus:ring-4 focus:ring-green/15" value={p[k]} onChange={(e) => setP({ ...p, [k]: e.target.value })} /></div></div>
  );
  return (
    <div>
      <div className="flex items-center justify-between"><h2 className="font-display text-[20px] font-bold">Fixed prices (USD)</h2><Btn data-testid="button-save-prices" onClick={save}>Save changes</Btn></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {FIXED.map(([k, sub]) => (
          <Card key={k} className="p-4"><p className="text-[14px] font-semibold text-mute">{k}</p><p className="font-display text-[32px] font-bold text-green">{money(Number(p[k]) || 0)}</p><p className="text-[13px] text-mute">{sub}</p>
            <input data-testid={`input-price-${k}`} inputMode="decimal" aria-label={`${k} price`} className={inputCls + " mt-3"} value={p[k]} onChange={(e) => setP({ ...p, [k]: e.target.value })} /></Card>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <Card className="p-4"><h3 className="mb-1 font-bold">Get-quote services</h3>{["Point-to-Point", "Chauffeur", "Delivery"].map((x) => <div key={x} className="flex justify-between border-b border-line py-3 text-[14px] last:border-0"><b>{x}</b><span className="text-mute">Quote by dispatcher</span></div>)}</Card>
        <Card className="p-4"><h3 className="mb-1 font-bold">Extra charges</h3>{extra("night", "Night pickup (22:00 to 05:00)")}{extra("childSeat", "Child seat")}{extra("extraStop", "Extra stop")}</Card>
        <Card className="p-4">
          <h3 className="mb-1 font-bold">Where these prices show</h3>
          {[["Passenger app", "Explore St Lucia cards and the fare screen"],
            ["Website", "www.stluciantaxiandtours.com service list"],
            ["Payment", "The Stripe amount a passenger is charged"],
            ["Driver payout", "Worked out from the trip price"]].map(([a, b]) => (
            <div key={a} className="border-b border-line py-3 last:border-0"><b className="text-[14px]">{a}</b><p className="text-[13px] text-mute">{b}</p></div>
          ))}
          <p className="mt-3 text-[13px] text-mute">A saved price applies to new bookings. Trips already paid keep the price they were booked at.</p>
        </Card>
      </div>
      <Card className="mt-4 p-4">
        <h3 className="mb-1 font-bold">Questions about a price?</h3>
        <p className="text-[14px] text-mute">Samuel Green, Morne Fortune, Castries, St. Lucia</p>
        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[14px] font-semibold text-green">
          <a className="tap inline-flex min-h-11 items-center" href="tel:+17587324553">+1 758-732-4553</a>
          <a className="tap inline-flex min-h-11 items-center" href="tel:+13026896001">+1 302-689-6001</a>
          <a className="tap inline-flex min-h-11 items-center" href="tel:+17584890041">+1 758-489-0041</a>
        </p>
      </Card>
    </div>
  );
}

export function Refunds() {
  const s = useAppState();
  const open = useOpenBooking();
  const [hours, setHours] = useState(String(s.settings.policyHours));
  const [box, w] = useBoxWidth();
  const month = s.refunds.filter((r) => r.date.startsWith("2026-12") && (r.status === "Refunded" || r.status === "Processing"));
  const processing = s.refunds.filter((r) => r.status === "Processing");
  const review = s.refunds.filter((r) => r.status === "Dispatcher review");
  const tone = (st: string) => (st === "Refunded" ? "ok" : st === "Processing" ? "info" : st === "Declined" ? "err" : "warn") as "ok" | "info" | "err" | "warn";
  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
        <Card className="p-5"><h3 className="font-bold">Cancellation policy</h3><p className="mt-1 text-[14px] text-mute">Passengers who cancel earlier than this window get a full automatic refund through Stripe. Inside the window the dispatcher reviews.</p>
          <div className="mt-3 flex items-center gap-3"><input aria-label="Policy hours" data-testid="input-policy-hours" className="h-12 w-20 rounded-md border border-line-strong text-center font-display text-[20px] font-bold" value={hours} onChange={(e) => setHours(e.target.value)} /><span className="text-[14px]">hours before pickup</span></div>
          <Btn size="sm" className="mt-3" onClick={() => { const n = Number(hours); if (!(n > 0)) return toast("Enter hours", "err"); actions.setSettings({ policyHours: n }); toast("Policy saved"); }}>Save policy</Btn></Card>
        <Card className="p-5"><p className="text-[14px] text-mute">Refunds this month</p><p className="font-display text-[32px] font-bold">{moneyShort(Math.round(month.reduce((a, r) => a + r.amount, 0)))}</p><p className="text-[13px] text-mute">{month.length} refunds</p></Card>
        <Card className="p-5"><p className="text-[14px] text-mute">Processing</p><p className="font-display text-[32px] font-bold">{money(processing.reduce((a, r) => a + r.amount, 0))}</p><p className="text-[13px] text-mute">{processing.length} refund{processing.length === 1 ? "" : "s"}</p></Card>
      </div>
      {review.length > 0 && (
        <Card className="mt-4 border-orange/50 p-5">
          <h3 className="font-bold">Dispatcher review ({review.length})</h3><p className="text-[14px] text-mute">Cancelled within {s.settings.policyHours} hours of pickup. No automatic refund.</p>
          {review.map((r) => (
            <div key={r.id} className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3">
              <button className="min-h-11 font-bold text-green underline underline-offset-4" onClick={() => open(r.ref)}>{r.ref}</button><span>{r.passenger}</span><span className="font-semibold">{money(r.amount)}</span>
              <div className="ml-auto flex gap-2"><Btn size="sm" data-testid={`button-approve-${r.id}`} onClick={() => { actions.resolveRefund(r.id, true); toast("Refund approved and sent to Stripe"); }}>Approve refund</Btn><Btn size="sm" variant="outline" onClick={() => { actions.resolveRefund(r.id, false); toast("Refund declined. Passenger notified"); }}>Decline</Btn></div>
            </div>
          ))}
        </Card>
      )}
      <div ref={box} className="mt-4">
      <Card className="overflow-hidden">
        {w < 860 ? (
          <ul className="divide-y divide-line">{s.refunds.map((r) => (
            <li key={r.id} className="px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><button onClick={() => open(r.ref)} className="tnum min-h-11 text-[15px] font-bold text-green underline-offset-4 hover:underline">{r.ref}</button><p className="-mt-1 text-[14px]">{r.passenger}</p></div>
                <div className="shrink-0 text-right"><p className="tnum text-[15px] font-bold">{money(r.amount)}</p><Pill tone={tone(r.status)} className="mt-1">{r.status}</Pill></div>
              </div>
              <p className="mt-1 text-[13.5px] text-mute">{r.reason}</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2"><span className="tnum text-[13px] text-mute">{r.date}</span>
                {r.status === "Processing" && <button className="tap min-h-11 rounded-md border border-line bg-paper px-3 text-[13px] font-semibold text-green hover:border-green/60" onClick={() => { actions.settleRefund(r.id); toast("Marked as refunded by Stripe"); }}>Mark settled</button>}</div>
            </li>))}</ul>
        ) : (
        <table className="w-full text-[14px]">
          <thead><tr className="border-b border-line bg-aground text-left text-[12px] uppercase tracking-wider text-mute">{["Booking", "Passenger", "Amount", "Reason", "Date", "Stripe status", ""].map((h) => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>{s.refunds.map((r) => (
            <tr key={r.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3 font-bold"><button onClick={() => open(r.ref)} className="tnum min-h-11 text-green hover:underline">{r.ref}</button></td><td className="px-4">{r.passenger}</td><td className="px-4">{money(r.amount)}</td><td className="px-4 text-mute">{r.reason}</td><td className="whitespace-nowrap px-4">{r.date}</td>
              <td className="px-4"><Pill tone={tone(r.status)}>{r.status}</Pill></td>
              <td className="px-4">{r.status === "Processing" && <button className="tap min-h-11 whitespace-nowrap rounded-md border border-line bg-paper px-3 text-[13px] font-semibold text-green hover:border-green/60" onClick={() => { actions.settleRefund(r.id); toast("Marked as refunded by Stripe"); }}>Mark settled</button>}</td>
            </tr>
          ))}</tbody>
        </table>
        )}
      </Card>
      </div>
    </div>
  );
}
