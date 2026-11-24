import { Media } from "@/components/art";
import { useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Bell, CalendarDays, Check, CreditCard, Info, Lock, Phone, X } from "lucide-react";
import { Btn, Card, Empty, Field, ScreenHead, StepBars, inputCls } from "@/components/kit";
import { Screen } from "@/components/mobile";
import { Counter, Row } from "@/components/bits";
import { actions, extActions, toast, useAppState } from "@/lib/store";
import { checkPickup, dayLabel, longDate, money, short, time } from "@/lib/format";
import { cardLabel } from "@/lib/ext";
import type { Booking, Service } from "@/lib/types";
import { useFare } from "./book";

const Steps = ({ items }: { items: string[] }) => (
  <>
    {items.map((t, i) => (
      <div key={i} className="mt-3 flex gap-3 text-[15px]"><span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ok text-[13px] font-bold text-green">{i + 1}</span><p>{t}</p></div>
    ))}
  </>
);

/* Page 1 */
export function QuoteSent() {
  const s = useAppState();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const q = s.quotes.find((x) => x.id === params.get("id")) ?? s.quotes.find((x) => x.email === s.identity.email);
  return (
    <Screen className="px-5 pt-[clamp(20px,6vh,60px)]" footer={<Btn className="min-h-14 w-full text-[17px]" data-testid="button-back-home" onClick={() => nav("/app/home")}>Back to home</Btn>}>
      <div className="anim-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green text-white shadow-[0_0_0_10px_var(--color-ok)]"><Check size={36} strokeWidth={3} /></div>
      <h1 className="mt-5 text-center text-[28px] font-bold">Quote request sent</h1>
      <p className="mt-1 text-center text-[16px] text-mute">We will reply by SMS and WhatsApp with your price.</p>
      {q ? (
        <Card className="mt-6 px-4 py-1" data-testid="card-quote-sent">
          <Row label="Request" value={<span data-testid="text-quote-id">{q.id}</span>} strong />
          <Row label="Service" value={q.service} strong />
          <Row label="When" value={`${dayLabel(q.date)} · ${time(q.date)}`} strong />
          <Row label="Route" value={q.to ? `${q.from} to ${q.to}` : q.from} strong />
          {q.details && <Row label="Details" value={q.details} />}
        </Card>
      ) : <Card className="mt-6 p-4 text-center text-mute">No quote request found.</Card>}
      <Card className="mt-3 p-4">
        <p className="font-display font-bold">What happens next</p>
        <Steps items={["The dispatcher reviews your request.", "You get a price and a payment link.", "Pay online with Stripe to confirm your booking."]} />
      </Card>
    </Screen>
  );
}

/* Page 2 */
export function ChooseTour() {
  const s = useAppState();
  const nav = useNavigate();
  const pick = (svc: Service) => { actions.setDraft({ service: svc }); nav("/app/book/details"); };
  const tours: { svc: Service; body: string }[] = [
    { svc: "Private Tour", body: "Soufriere, Pitons and Diamond Falls · up to 6 passengers · about 5 hours" },
    { svc: "Full-Day Tour", body: "Island loop with beach stop · up to 8 hours" },
  ];
  return (
    <Screen className="px-5">
      <div className="-mx-5"><ScreenHead title="Choose a tour" sub="Private driver, fixed price" back="/app/book/route" /></div>
      {tours.map(({ svc, body }) => (
        <div key={svc} className="anim-rise mt-[clamp(8px,1.8vh,16px)] overflow-hidden rounded-2xl border border-line/80 bg-white shadow-card" data-testid={`card-tour-${svc.split(" ")[0].toLowerCase()}`}>
          <div className="relative h-[clamp(84px,15vh,170px)]">
            <Media kind={svc === "Private Tour" ? "pitons" : "bay"} className="!h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-green-night/70 to-transparent" />
            <span className="keep-white tnum absolute right-3 top-3 rounded-full bg-white px-3.5 py-1.5 font-display text-[18px] font-bold text-green-dark shadow-e2">{money(s.prices[svc]).replace(".00", "")}</span>
            <p className="absolute bottom-3 left-4 font-display text-[24px] font-bold text-white">{svc}</p>
          </div>
          <div className="p-3.5">
            <p className="text-[14px] leading-snug text-mute">{body}</p>
            <Btn className="mt-2.5 min-h-[clamp(44px,6vh,52px)] w-full" variant={svc === "Private Tour" ? "primary" : "outline"} data-testid={`button-select-${svc.split(" ")[0].toLowerCase()}`} onClick={() => pick(svc)}>Select {svc}</Btn>
          </div>
        </div>
      ))}
      <p className="mt-2 text-center text-[12px] text-mute">Tour stops are examples. Your driver adapts the route to you.</p>
    </Screen>
  );
}

/* Page 3 */
export function RoundTripDetails() {
  const { d } = useFare();
  const nav = useNavigate();
  const ret = d.ret ?? { date: "2026-12-21", time: "11:00", flight: "", pickup: d.to };
  const setRet = (p: Partial<typeof ret>) => actions.setDraft({ ret: { ...ret, ...p } });
  const go = () => {
    if (!d.date || !d.time || !ret.date || !ret.time) return toast("Add outbound and return date and time", "err");
    const e1 = checkPickup(d.date, d.time, "Outbound pickup"); if (e1) return toast(e1, "err");
    const e2 = checkPickup(ret.date, ret.time, "Return pickup"); if (e2) return toast(e2, "err");
    if (`${ret.date}T${ret.time}` <= `${d.date}T${d.time}`) return toast("Return must be after the outbound pickup", "err");
    if (!d.ret) actions.setDraft({ ret });
    nav("/app/book/fare");
  };
  const label = "mb-2 mt-5 text-[12px] font-bold uppercase tracking-wider text-mute";
  return (
    <Screen className="px-5" footer={<Btn className="min-h-14 w-full text-[17px]" data-testid="button-rt-see-fare" onClick={go}>See fare</Btn>}>
      <div className="-mx-5"><ScreenHead title="Round-Trip details" sub="Step 2 of 4 · Round-Trip" back="/app/book/route" /></div>
      <StepBars total={4} current={2} />
      <p className={label}>OUTBOUND</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date"><input type="date" min="2026-12-14" data-testid="input-out-date" className={inputCls} value={d.date} onChange={(e) => actions.setDraft({ date: e.target.value })} /></Field>
        <Field label="Pickup time"><input type="time" data-testid="input-out-time" className={inputCls} value={d.time} onChange={(e) => actions.setDraft({ time: e.target.value })} /></Field>
      </div>
      <div className="mt-3"><Field label="Arrival flight"><input data-testid="input-out-flight" className={inputCls} placeholder="BA 2155" value={d.flight} onChange={(e) => actions.setDraft({ flight: e.target.value.toUpperCase() })} /></Field></div>
      <p className={label}>RETURN</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date"><input type="date" min={d.date || "2026-12-14"} data-testid="input-ret-date" className={inputCls} value={ret.date} onChange={(e) => setRet({ date: e.target.value })} /></Field>
        <Field label="Pickup time"><input type="time" data-testid="input-ret-time" className={inputCls} value={ret.time} onChange={(e) => setRet({ time: e.target.value })} /></Field>
      </div>
      <div className="mt-3"><Field label="Departure flight"><input data-testid="input-ret-flight" className={inputCls} placeholder="BA 2156" value={ret.flight} onChange={(e) => setRet({ flight: e.target.value.toUpperCase() })} /></Field></div>
      <div className="mt-3"><Field label="Return pickup"><input data-testid="input-ret-pickup" list="places" className={inputCls} value={ret.pickup} onChange={(e) => setRet({ pickup: e.target.value })} /></Field></div>
      <Card className="mb-4 mt-4 flex items-center justify-between px-4 py-3"><p className="font-semibold">Passengers</p><Counter value={d.pax} min={1} max={6} onChange={(pax) => actions.setDraft({ pax })} /></Card>
    </Screen>
  );
}

/* Page 4 */
export function PaymentFailed() {
  const { d, total } = useFare();
  const nav = useNavigate();
  const loc = useLocation();
  const card = (loc.state as { card?: string } | null)?.card ?? "Visa 0002";
  return (
    <Screen className="px-5 pt-[clamp(20px,6vh,60px)]" footer={<div className="flex flex-col gap-2">
      <Btn className="min-h-14 text-[17px]" data-testid="button-try-another-card" onClick={() => nav("/app/book/payment", { state: { fresh: Date.now() } })}>Try another card</Btn>
      <Btn variant="ghost" className="min-h-[52px]" data-testid="button-back-to-fare" onClick={() => nav("/app/book/fare")}>Back to fare</Btn>
    </div>}>
      <div className="anim-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-err text-white shadow-[0_0_0_10px_var(--color-err-tint)]"><X size={36} strokeWidth={3} /></div>
      <h1 className="mt-5 text-center text-[28px] font-bold leading-tight">Payment did not go through</h1>
      <p className="mt-1 text-center text-[16px] text-mute">Your card was declined. You have not been charged.</p>
      <Card className="mt-6 px-4 py-1">
        <Row label="Trip" value={d.service} strong />
        <Row label="Total" value={money(total)} strong />
        <Row label="Card" value={<span data-testid="text-declined-card">{card}</span>} strong />
      </Card>
      <div className="mt-3 flex gap-3 rounded-2xl bg-warn p-4 text-[15px] text-warn-ink"><Info size={20} className="shrink-0" /><p>Your booking is not confirmed until payment succeeds.</p></div>
    </Screen>
  );
}

const paidAt = (b: Booking) => {
  const t = b.timeline[0]?.at ?? "";
  const [day, hm = "09:00"] = t.split(" ");
  return day ? `${longDate(day)}, ${hm}` : "-";
};
export const cardFor = (b: Booking, s: ReturnType<typeof useAppState>) => b.card ?? (b.email === s.identity.email ? s.identity.card : "Visa 4242");

/* Page 5 */
export function Receipt() {
  const { id } = useParams();
  const s = useAppState();
  const b = s.bookings.find((x) => x.ref === id);
  if (!b) return <Screen className="p-6"><Empty icon={<CalendarDays />} title="Receipt not found" body="This trip is not in your account." action={<Link to="/app/trips" className="font-semibold text-green">Back to trips</Link>} /></Screen>;
  const c = cardFor(b, s);
  return (
    <Screen className="px-5" footer={<div className="flex flex-col gap-2">
      <Btn className="min-h-[52px] text-[16px]" data-testid="button-download-pdf" onClick={() => toast("Receipt downloaded")}>Download PDF</Btn>
      <Btn variant="outline" className="min-h-[52px] text-[16px]" data-testid="button-email-receipt" onClick={() => toast("Receipt emailed")}>Email receipt</Btn>
    </div>}>
      <div className="-mx-5"><ScreenHead title="Receipt" sub={b.ref} back={`/app/trips/${b.ref}`} /></div>
      <Card className="p-4">
        <div className="flex items-start justify-between"><div><p className="font-display text-[18px] font-bold">St Lu Taxi &amp; Tours</p><p className="text-[13px] text-mute">{s.settings.address}</p></div>
          <span className="rounded-full bg-ok px-2.5 py-1 text-[12px] font-semibold text-green" data-testid="status-receipt">{b.payment}</span></div>
      </Card>
      <Card className="mt-3 px-4 py-1">
        <Row label="Date paid" value={paidAt(b)} />
        <Row label="Payment ID" value={<code className="text-[13px]">{b.stripeId.slice(0, 13)}</code>} />
        <Row label="Method" value={c.replace(" ", " ending ")} />
        <Row label="Trip" value={`${b.service} · ${dayLabel(b.pickup)}`} />
      </Card>
      <Card className="mt-3 px-4 py-1">
        <Row label="Fixed fare" value={money(b.base)} />
        {b.childSeat && <Row label="Child seat" value={money(s.prices.childSeat)} />}
        {b.extraStop && <Row label="Extra stop" value={money(s.prices.extraStop)} />}
        {b.night && <Row label="Night pickup" value={money(s.prices.night)} />}
        <Row label={<b className="text-ink">Total (USD)</b>} value={<span data-testid="text-receipt-total">{money(b.total)}</span>} strong />
      </Card>
    </Screen>
  );
}

/* Page 6 */
export function TripCancelled() {
  const { id } = useParams();
  const s = useAppState();
  const nav = useNavigate();
  const b = s.bookings.find((x) => x.ref === id);
  if (!b) return <Screen className="p-6"><Empty icon={<CalendarDays />} title="Trip not found" body="It may have been removed by the dispatcher." action={<Link to="/app/trips" className="font-semibold text-green">Back to trips</Link>} /></Screen>;
  const review = b.payment === "Review";
  const c = cardFor(b, s);
  return (
    <Screen className="px-5 pt-[clamp(20px,6vh,60px)]" footer={<div className="flex flex-col gap-2">
      <Btn className="min-h-14 text-[17px]" data-testid="button-view-my-trips" onClick={() => nav("/app/trips")}>View my trips</Btn>
      <Btn variant="ghost" className="min-h-[52px]" data-testid="button-cancelled-home" onClick={() => nav("/app/home")}>Back to home</Btn>
    </div>}>
      <div className="anim-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green text-white shadow-[0_0_0_10px_var(--color-ok)]"><Check size={36} strokeWidth={3} /></div>
      <h1 className="mt-5 text-center text-[28px] font-bold">Trip cancelled</h1>
      <p className="mt-1 text-center text-[16px] text-mute" data-testid="text-refund-line">
        {review ? `Pickup was within ${s.settings.policyHours} hours. The dispatcher reviews a refund of ${money(b.total)} to ${c}.` : `Your refund of ${money(b.total)} is on its way to ${c}.`}
      </p>
      <Card className="mt-6 px-4 py-1">
        <Row label="Booking" value={b.ref} strong />
        <Row label="Refund" value={<span data-testid="text-refund-amount">{money(b.total)}</span>} strong />
        <Row label={review || b.payment === "Refunded" ? "Status" : "Arrives in"} value={review ? "Dispatcher review" : b.payment === "Refunded" ? "Refunded" : "5 to 10 business days"} strong />
      </Card>
      <p className="mt-4 rounded-2xl bg-ok p-3 text-center text-[14px] text-green">Confirmation sent by SMS and WhatsApp.</p>
    </Screen>
  );
}

/* Page 10 */
export function AddCard() {
  const nav = useNavigate();
  const s = useAppState();
  // Card details live only in this component; only the masked brand and last 4 are saved.
  const [f, setF] = useState({ no: "", exp: "", cvc: "", name: s.identity.name });
  const save = () => {
    const digits = f.no.replace(/\D/g, "");
    if (digits.length < 12 || f.exp.length < 4 || f.cvc.length < 3) return toast("Check the card details", "err");
    const label = cardLabel(digits);
    extActions.addCard(label);
    toast(`${label} saved`);
    nav("/app/account?panel=payment");
  };
  return (
    <Screen className="px-5" footer={<Btn className="min-h-14 w-full text-[17px]" data-testid="button-save-card" onClick={save}>Save card</Btn>}>
      <div className="-mx-5"><ScreenHead title="Add a card" back="/app/account?panel=payment" /></div>
      <div className="flex flex-col gap-3">
        <Field label="Card number"><div className="relative"><CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
          <input inputMode="numeric" autoComplete="off" placeholder="1234 1234 1234 1234" data-testid="input-new-card" className={inputCls + " pl-11"} value={f.no} onChange={(e) => setF({ ...f, no: e.target.value })} /></div></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Expiry"><input autoComplete="off" placeholder="MM / YY" data-testid="input-new-exp" className={inputCls} value={f.exp} onChange={(e) => setF({ ...f, exp: e.target.value })} /></Field>
          <Field label="CVC"><input autoComplete="off" inputMode="numeric" maxLength={4} placeholder="123" data-testid="input-new-cvc" className={inputCls} value={f.cvc} onChange={(e) => setF({ ...f, cvc: e.target.value })} /></Field>
        </div>
        <Field label="Name on card"><input autoComplete="off" data-testid="input-new-name" className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
      </div>
      <div className="mt-4 flex gap-3 rounded-2xl bg-info p-4 text-[14px] text-info-ink"><Lock size={20} className="shrink-0" /><p>Cards are saved by Stripe, never by St Lu Taxi And Tours. Online payment only, no cash.</p></div>
    </Screen>
  );
}

/* Page 11 */
export function FlightDelayed() {
  const s = useAppState();
  const nav = useNavigate();
  const b = s.bookings.find((x) => x.ref === "SLU-48213");
  const u = b && s.ext.jobUpdates[b.token];
  const d = s.drivers.find((x) => x.id === b?.driverId);
  const tel = s.settings.phones[0].replace(/[^\d+]/g, "");
  if (!b || !u) return (
    <Screen className="px-5" footer={<Btn className="min-h-14 text-[17px]" onClick={() => nav("/app/alerts")}>Back to alerts</Btn>}>
      <div className="-mx-5"><ScreenHead plain title="Alerts" back="/app/alerts" /></div>
      <div className="mt-10 text-center"><span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-ok text-green"><Check size={36} /></span>
        <h1 className="mt-4 text-[24px] font-bold">No flight changes</h1>
        <p className="mt-1 text-[16px] text-mute">Your flight is on time. We keep tracking it and will message you if the landing time changes.</p></div>
    </Screen>
  );
  return (
    <Screen className="px-5" footer={<div className="flex flex-col gap-2">
      <Btn className="min-h-14 text-[17px]" data-testid="button-view-delayed-trip" onClick={() => nav(`/app/trips/${b.ref}`)}>View trip</Btn>
      <a href={`tel:${tel}`} data-testid="button-call-dispatcher" className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-lg border-[1.5px] border-green bg-white text-[17px] font-semibold text-green"><Phone size={18} />Call dispatcher</a>
    </div>}>
      <div className="-mx-5"><ScreenHead plain title="Alerts" back="/app/alerts" /></div>
      <div className="mt-4 text-center">
        <span className="anim-pop inline-flex h-20 w-20 items-center justify-center rounded-full bg-warn text-warn-ink"><Bell size={36} /></span>
        <h1 className="mt-4 text-[26px] font-bold">Your flight is late</h1>
        <p className="mt-1 text-[16px] text-mute">{b.flight ?? "BA 2155"} now lands at {time(b.pickup)} (was {u.oldTime}).</p>
      </div>
      <Card className="mt-6 px-4 py-1">
        <Row label="Booking" value={b.ref} strong />
        <Row label="New pickup time" value={<span className="text-green" data-testid="text-new-pickup">{time(b.pickup)}</span>} strong />
        <Row label="Driver" value={d?.name ?? "Awaiting driver"} strong />
      </Card>
      <div className="mt-3 rounded-2xl bg-ok p-4 text-[15px] text-ink">No change fee. Your driver adjusts to the real landing time and was told by SMS and WhatsApp.</div>
    </Screen>
  );
}

/* Terms */
export function Terms() {
  const s = useAppState();
  const sections: [string, string][] = [
    ["Booking and fixed prices", "Every ride has a fixed price in US dollars per vehicle, shown before you pay. No surge, no hidden fees. Chauffeur, Delivery and Point-to-Point rides are priced by quote."],
    ["Cancellation and refunds", `Free cancellation more than ${s.settings.policyHours} hours before pickup, with an automatic full refund to your card. Inside ${s.settings.policyHours} hours the dispatcher reviews the cancellation and confirms by SMS and WhatsApp.`],
    ["Payments", "Payments are processed online by Stripe only. We do not accept cash and we never store your card number."],
    ["Privacy", "Your phone number is used only for trip alerts by SMS and WhatsApp. We do not share it for marketing."],
  ];
  return (
    <Screen className="px-5">
      <div className="-mx-5"><ScreenHead title="Terms and privacy" sub={`${s.settings.company} · ${short(s.settings.address)}`} back="/app/account" /></div>
      {sections.map(([h, t], i) => (
        <Card key={h} className="anim-rise mt-3 p-4" data-testid={`card-terms-${i}`}>
          <p className="font-display text-[17px] font-bold">{h}</p>
          <p className="mt-1.5 text-[15px] text-mute">{t}</p>
        </Card>
      ))}
      <p className="mb-6 mt-4 text-center text-[13px] text-mute">Full terms at {s.settings.website}</p>
    </Screen>
  );
}
