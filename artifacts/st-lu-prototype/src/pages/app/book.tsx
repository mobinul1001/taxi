import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Baby, Check, CircleAlert, CircleDot, Compass, Repeat, CreditCard, LoaderCircle, Lock, Luggage, MapPin, Milestone, Plane, Ship, ShieldCheck, Users } from "lucide-react";
import { BackBtn, Btn, Card, Field, ScreenHead, StepBars, Switch, inputCls, invalidCls } from "@/components/kit";
import { Screen , useWide } from "@/components/mobile";
import { Counter, RouteBlock } from "@/components/bits";
import { MapView } from "@/components/map";
import { placeFrom } from "@/lib/geo";
import { actions, toast, useAppState } from "@/lib/store";
import { cardLabel, DECLINE_CARD } from "@/lib/ext";
import { TODAY_ISO, checkPickup, dayLabel, money, pickupLabel, routeShort, short } from "@/lib/format";
import { PLACES } from "@/lib/seed";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/types";

const POINTS = [
  { name: PLACES.UVF, short: "UVF Airport", area: "Vieux Fort", I: Plane }, { name: PLACES.SLU, short: "SLU Airport", area: "Castries", I: Plane },
  { name: PLACES.PC, short: "Port Castries", area: "Castries", I: Ship }, { name: PLACES.PS, short: "Seraphine", area: "Castries", I: Ship },
];
const SUGGEST = ["Rodney Bay", "Soufriere", "Marigot Bay", "Cap Estate", "Gros Islet", "Castries", "Anse Chastanet", "Sugar Beach", "Vieux Fort", ...POINTS.map((p) => p.name)];

export function useFare() {
  const wide = useWide();
  const s = useAppState();
  const d = s.draft;
  const night = Number(d.time.slice(0, 2)) >= 22 || Number(d.time.slice(0, 2)) < 5;
  const lines: [string, number][] = [[`${d.service} (fixed price)`, s.prices[d.service]]];
  if (d.childSeat) lines.push(["Child seat", s.prices.childSeat]);
  if (d.extraStop) lines.push(["Extra stop", s.prices.extraStop]);
  if (night) lines.push(["Night pickup (22:00 to 05:00)", s.prices.night]);
  return { d, lines, total: lines.reduce((a, [, v]) => a + v, 0), s };
}

const STEPS = ["Route", "Details", "Fare", "Pay"];
/** Step header: labelled progress so people always know where they are in the booking. */
function StepHead({ current }: { current: number }) {
  return (
    <div>
      <StepBars total={4} current={current} />
      <ol className="mt-1.5 grid grid-cols-4 gap-1.5 text-[12px] font-semibold [@media(max-height:740px)]:hidden" aria-hidden>
        {STEPS.map((l, i) => <li key={l} className={i + 1 === current ? "text-ink" : i + 1 < current ? "text-green" : "text-mute"}>{l}</li>)}
      </ol>
    </div>
  );
}
/** Sticky route + running price, shown on every step after the route is chosen. */
function BookSummary({ testid, className }: { testid?: string; className?: string }) {
  const { d, total } = useFare();
  return (
    <div className={cn("sticky top-0 z-10 -mx-5 bg-ground px-5 pb-2 pt-2", className)}>
      <div className="flex items-center gap-3 rounded-lg border border-green/15 bg-ok px-3.5 py-2.5" data-testid={testid}>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-paper text-green shadow-e1"><MapPin size={17} /></span>
        <div className="min-w-0 flex-1"><p className="text-[13.5px] font-semibold leading-tight">{routeShort(d)}</p><p className="text-[12px] leading-snug text-mute">{d.service} · {pickupLabel(`${d.date}T${d.time}`)}</p></div>
        <div className="shrink-0 text-right"><p className="tnum font-display text-[18px] font-bold leading-none text-green" aria-live="polite">{money(total)}</p><p className="mt-0.5 text-[12px] font-medium text-mute">Total</p></div>
      </div>
    </div>
  );
}

export function BookRoute() {
  const { d } = useFare();
  const nav = useNavigate();
  const wide = useWide();
  // Which field the reader still has to fill. A toast alone was easy to miss: it shows away from the
  // field and fades, so the field itself now says what is wrong and stays red until it is fixed.
  const [miss, setMiss] = useState({ from: false, to: false });
  const tab = d.service === "Private Tour" || d.service === "Full-Day Tour" ? "Tour" : d.service;
  const setTab = (t: string) => actions.setDraft({ service: (t === "Tour" ? "Private Tour" : t) as Service });
  return (
    <div className="flex h-full flex-col bg-ground [@media(max-height:400px)]:overflow-y-auto">
      {/* the desktop pane has the map beside it, so this screen shows its own map only below 1000px */}
      {wide ? (
        <div className="flex shrink-0 items-center gap-3 border-b border-line bg-paper px-5 py-3">
          <BackBtn to="/app/home" className="" />
          <span className="ml-auto text-[13px] font-semibold text-mute">Fixed prices, no meter</span>
        </div>
      ) : (
        <div className="relative h-[42%] max-h-[340px] min-h-[180px] shrink-0 overflow-hidden">
          <MapView from={placeFrom(d.from)} to={placeFrom(d.to)} labels caption={null}
            focus={placeFrom(d.from) && placeFrom(d.to) ? "trip" : placeFrom(d.from) ? "pickup" : "island"}
            insets={{ top: 72, bottom: 16, left: 16, right: 16 }} />
          <BackBtn to="/app/home" className="absolute left-5 top-[clamp(8px,4vh,48px)]" />
        </div>
      )}
      <div className={cn("no-scrollbar relative flex-1 overflow-y-auto bg-ground px-5 [@media(max-height:400px)]:flex-none [@media(max-height:400px)]:overflow-visible", wide ? "pt-4" : "-mt-5 rounded-t-2xl pt-[clamp(10px,2.2vh,22px)] shadow-[0_-12px_30px_-18px_rgba(15,31,24,.35)]")}>
        <div className="flex items-end justify-between gap-3"><h1 className="text-[clamp(21px,3.4vh,26px)] font-bold leading-tight">Plan your ride</h1><p className="pb-0.5 text-[12.5px] font-semibold text-mute">Step 1 of 4</p></div>
        <StepBars total={4} current={1} className="mt-2" />
        <div className="mt-[clamp(8px,1.8vh,16px)] grid grid-cols-3 gap-1 rounded-lg bg-neutral p-1" role="tablist" aria-label="Service">
          {([["Airport Transfer", "Airport", Plane], ["Round-Trip", "Round-trip", Repeat], ["Tour", "Tour", Compass]] as const).map(([t, short, I]) => (
            <button key={t} role="tab" aria-selected={tab === t} aria-label={t} data-testid={`tab-service-${t}`} onClick={() => setTab(t)} className={cn("tap inline-flex min-h-[clamp(44px,5.6vh,48px)] min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-1 text-[13px] font-semibold leading-none transition-colors", tab === t ? "bg-paper text-green shadow-e2" : "text-neutral-ink hover:text-ink")}><I size={15} className="shrink-0" />{short}</button>
          ))}
        </div>
        <datalist id="places">{SUGGEST.map((p) => <option key={p} value={p} />)}</datalist>
        <div className="relative mt-[clamp(8px,1.8vh,16px)] rounded-lg border border-line-strong bg-paper shadow-e1 focus-within:border-green focus-within:ring-4 focus-within:ring-green/15">
          <span className="pointer-events-none absolute bottom-[26px] left-[21px] top-[26px] border-l-2 border-dotted border-line-strong" aria-hidden />
          <div className="relative flex items-center gap-3 px-3.5">
            <CircleDot size={16} className="shrink-0 bg-paper text-green" />
            <label htmlFor="pickup-input" className={cn("block min-w-0 flex-1 cursor-text border-b py-2", miss.from ? "border-err" : "border-line")}><span className={cn("block text-[12px] font-semibold uppercase tracking-wide", miss.from ? "text-err" : "text-mute")}>Pickup</span>
              <input list="places" id="pickup-input" data-testid="input-pickup" placeholder="Airport, port or hotel" aria-invalid={miss.from || undefined} aria-describedby={miss.from ? "route-error" : undefined} className="h-[clamp(26px,3.6vh,30px)] w-full min-w-0 bg-transparent text-[16px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-faint" value={d.from} onChange={(e) => { actions.setDraft({ from: e.target.value }); setMiss((m) => ({ ...m, from: false })); }} /></label>
          </div>
          <div className="relative flex items-center gap-3 px-3.5">
            <MapPin size={16} className="shrink-0 bg-paper text-orange" />
            <label htmlFor="dropoff-input" className="block min-w-0 flex-1 cursor-text py-2"><span className={cn("block text-[12px] font-semibold uppercase tracking-wide", miss.to ? "text-err" : "text-mute")}>Drop-off</span>
              <input list="places" id="dropoff-input" data-testid="input-dropoff" placeholder="Where are you going?" aria-invalid={miss.to || undefined} aria-describedby={miss.to ? "route-error" : undefined} className="h-[clamp(26px,3.6vh,30px)] w-full min-w-0 bg-transparent text-[16px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-faint" value={d.to} onChange={(e) => { actions.setDraft({ to: e.target.value }); setMiss((m) => ({ ...m, to: false })); }} /></label>
          </div>
        </div>
        <div>
          {/* on a short screen the heading goes, not the chips: the chips are the useful part */}
          <p className="mb-1.5 mt-[clamp(8px,1.8vh,16px)] text-[12.5px] font-semibold text-neutral-ink [@media(max-height:620px)]:hidden">Popular pickup points</p>
          <div className="mb-3 grid grid-cols-2 gap-2">
            {POINTS.map(({ name, short, I }) => (
              <button key={name} data-testid={`chip-pickup-${name}`} aria-pressed={d.from === name} onClick={() => actions.setDraft({ from: name })} className={cn("tap inline-flex min-h-12 min-w-0 items-center gap-2 rounded-md border px-3 text-[13px] font-semibold", d.from === name ? "border-green bg-ok text-green" : "border-line bg-paper hover:border-line-strong")}>
                <I size={15} className="shrink-0 text-green" /><span className="min-w-0 flex-1 text-left">{short}</span>
              </button>
            ))}
          </div>
        </div>
        
      </div>
      <div className="shrink-0 border-t border-line/70 bg-ground px-5 pb-[max(env(safe-area-inset-bottom),clamp(10px,2.2vh,22px))] pt-3">
        {(miss.from || miss.to) && <p id="route-error" role="alert" data-testid="error-route" className="mb-2 flex items-start gap-1.5 text-[13px] font-medium text-err"><CircleAlert size={15} className="mt-px shrink-0" />{miss.from && miss.to ? "Add a pickup and a drop-off to continue." : miss.from ? "Add a pickup point to continue." : "Add a drop-off to continue."}</p>}
        <Btn className="w-full min-h-[clamp(48px,6.4vh,56px)] text-[16.5px]" data-testid="button-continue" onClick={() => {
          if (!d.from || !d.to) { setMiss({ from: !d.from, to: !d.to }); document.getElementById(d.from ? "dropoff-input" : "pickup-input")?.focus(); return; }
          nav(tab === "Tour" ? "/app/book/tour" : tab === "Round-Trip" ? "/app/book/round-trip" : "/app/book/details");
        }}>Continue</Btn>
      </div>
    </div>
  );
}

export function BookDetails() {
  const { d } = useFare();
  const nav = useNavigate();
  const isTour = d.service === "Private Tour" || d.service === "Full-Day Tour";
  return (
    <Screen className="px-5" footer={<Btn className="w-full min-h-[clamp(48px,6.4vh,56px)] text-[16.5px]" data-testid="button-see-fare" onClick={() => { const e = checkPickup(d.date, d.time); if (e) return toast(e, "err"); nav("/app/book/fare"); }}>See fare</Btn>}>
      <div className="-mx-5"><ScreenHead title="Trip details" sub={`Step 2 of 4 · ${d.service}`} back={isTour ? "/app/book/tour" : "/app/book/route"} /></div>
      <StepHead current={2} />
      <BookSummary testid="summary-bar" />
      {/* The browser draws its own date and time fields and they have a minimum width of their own:
          side by side below 360px the year and the "PM" get cut off, so they stack there instead. */}
      <div className="mt-1 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
        <Field label="Date"><input type="date" min={TODAY_ISO} className={inputCls} value={d.date} onChange={(e) => actions.setDraft({ date: e.target.value })} /></Field>
        <Field label="Pickup time"><input type="time" className={inputCls} value={d.time} onChange={(e) => actions.setDraft({ time: e.target.value })} /></Field>
      </div>
      {(d.service === "Airport Transfer" || d.service === "Round-Trip") && (
        <div className="mt-3"><Field label="Flight number" hint="We track your flight and adjust the pickup if it is delayed.">
          <input data-testid="input-flight" className={inputCls} value={d.flight} onChange={(e) => actions.setDraft({ flight: e.target.value.toUpperCase() })} placeholder="BA 2155" /></Field></div>
      )}
      <Card className="mt-3 px-4">
        <div className="flex items-center justify-between border-b border-line py-2 [@media(max-height:740px)]:py-1"><div><p className="flex items-center gap-2 font-semibold"><Users size={17} className="text-green" />Passengers</p><p className="text-[13px] text-mute [@media(max-height:830px)]:hidden">Up to 6 in a standard car</p></div><Counter value={d.pax} min={1} max={6} onChange={(pax) => actions.setDraft({ pax })} /></div>
        <div className="flex items-center justify-between py-2 [@media(max-height:740px)]:py-1"><div><p className="flex items-center gap-2 font-semibold"><Luggage size={17} className="text-green" />Luggage</p><p className="text-[13px] text-mute [@media(max-height:830px)]:hidden">Large suitcases</p></div><Counter value={d.bags} min={0} onChange={(bags) => actions.setDraft({ bags })} /></div>
      </Card>
      <Card className="mt-2 px-4">
        <div className="flex items-center justify-between border-b border-line py-2 [@media(max-height:740px)]:py-1"><div><p className="flex items-center gap-2 font-semibold"><Baby size={17} className="text-green" />Child seat</p><p className="text-[13px] text-mute [@media(max-height:830px)]:hidden">+$5.00</p></div><Switch label="Child seat" on={d.childSeat} onChange={(childSeat) => actions.setDraft({ childSeat })} /></div>
        <div className="flex items-center justify-between py-2 [@media(max-height:740px)]:py-1"><div><p className="flex items-center gap-2 font-semibold"><Milestone size={17} className="text-green" />Extra stop</p><p className="text-[13px] text-mute [@media(max-height:830px)]:hidden">+$8.00</p></div><Switch label="Extra stop" on={d.extraStop} onChange={(extraStop) => actions.setDraft({ extraStop })} /></div>
      </Card>
      <div className="mb-2 mt-2"><Field label="Note for the driver (optional)"><textarea className={inputCls + " h-[clamp(38px,6.5vh,80px)] py-2"} value={d.note} onChange={(e) => actions.setDraft({ note: e.target.value })} /></Field></div>
    </Screen>
  );
}

export function Fare() {
  const { d, lines, total } = useFare();
  const nav = useNavigate();
  return (
    <Screen className="px-5" footer={<Btn className="w-full min-h-[clamp(48px,6.4vh,56px)] text-[16.5px]" data-testid="button-continue-payment" onClick={() => nav("/app/book/payment")}>Continue to payment · {money(total)}</Btn>}>
      <div className="-mx-5"><ScreenHead title="Fare summary" sub="Step 3 of 4" back={d.service === "Round-Trip" ? "/app/book/round-trip" : "/app/book/details"} /></div>
      <StepHead current={3} />
      {/* on short screens the route card below already carries the route, and the total sits in the pinned button */}
      <BookSummary className="[@media(max-height:740px)]:hidden" />
      <Card className="mt-1 p-4 [@media(max-height:740px)]:p-3">
        <RouteBlock from={d.from} to={d.to} fromLabel={`Pickup · ${pickupLabel(`${d.date}T${d.time}`)}`} toLabel="Drop-off" />
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3 text-[14px] font-medium"><span className="flex items-center gap-1.5"><Users size={15} className="text-green" />{d.pax} {d.pax === 1 ? "passenger" : "passengers"}</span><span className="flex items-center gap-1.5"><Luggage size={15} className="text-green" />{d.bags} {d.bags === 1 ? "bag" : "bags"}</span>{d.flight && <span className="flex items-center gap-1.5"><Plane size={15} className="text-green" />Flight {d.flight}</span>}</div>
        {d.service === "Round-Trip" && d.ret && <p className="mt-2 text-[14px] text-mute" data-testid="text-fare-return">Return · {pickupLabel(`${d.ret.date}T${d.ret.time}`)} from {d.ret.pickup}{d.ret.flight ? ` · Flight ${d.ret.flight}` : ""}</p>}
      </Card>
      <Card className="mt-2.5 p-4">
        <p className="mb-1 text-[12px] font-bold uppercase tracking-wide text-mute [@media(max-height:740px)]:hidden">Price breakdown</p>
        {lines.map(([l, v], i) => <div key={l} className={cn("flex justify-between gap-3 py-1 text-[15px]", i === 0 && "")}><span className="min-w-0 text-neutral-ink">{l}</span><span className="tnum shrink-0 font-semibold">{money(v)}</span></div>)}
        <div className="mt-2 flex items-end justify-between border-t border-dashed border-line-strong pt-3"><span className="font-display text-[18px] font-bold">Total</span><span className="tnum font-display text-[32px] font-bold leading-none text-green" data-testid="text-total">{money(total)}</span></div>
        <p className="mt-1 text-[13px] text-mute">Prices in US dollars. No surge, no hidden fees.</p>
      </Card>
      <div className="mb-2 mt-2.5 flex gap-3 rounded-lg border border-green/15 bg-ok p-3 text-[13.5px] leading-snug text-ink [@media(max-height:620px)]:hidden">
        <ShieldCheck className="shrink-0 text-green" size={22} />
        <p><b>Free cancellation</b> up to 24 hours before pickup. You get a full refund automatically.</p>
      </div>
    </Screen>
  );
}

export function Payment() {
  const { d, total } = useFare();
  const nav = useNavigate();
  const loc = useLocation();
  const fresh = !!(loc.state as { fresh?: number } | null)?.fresh;
  const [busy, setBusy] = useState(false);
  // Card fields are local only. Only the masked brand and last 4 are kept on the booking.
  const [card, setCard] = useState(fresh ? { no: "", exp: "", cvc: "", name: "" } : { no: "4242 4242 4242 4242", exp: "08 / 28", cvc: "", name: "" });
  const [bad, setBad] = useState<{ no?: string; exp?: string; cvc?: string; name?: string }>({});
  // Typing help, so the reader never has to guess the shape: digits in fours, expiry as MM / YY.
  const typeCard = (v: string) => setCard({ ...card, no: v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})(?=.)/g, "$1 ") });
  const typeExp = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 4);
    setCard({ ...card, exp: n.length > 2 ? `${n.slice(0, 2)} / ${n.slice(2)}` : n });
  };
  const check = () => {
    const digits = card.no.replace(/\D/g, "");
    const [mm, yy] = card.exp.split("/").map((x) => x.trim());
    const e: typeof bad = {};
    if (digits.length < 12) e.no = "Enter the long number on the front of the card.";
    if (!/^\d{2}$/.test(mm ?? "") || Number(mm) < 1 || Number(mm) > 12 || !/^\d{2}$/.test(yy ?? "")) e.exp = "Use MM / YY, with a month from 01 to 12.";
    if (!/^\d{3,4}$/.test(card.cvc)) e.cvc = "3 or 4 digits, on the back of the card.";
    if (!card.name.trim()) e.name = "Add the name printed on the card.";
    return e;
  };
  const pay = () => {
    if (busy || d.paid) return;
    const digits = card.no.replace(/\D/g, "");
    const e = check();
    if (Object.keys(e).length) { setBad(e); return; }
    setBad({});
    setBusy(true);
    const label = cardLabel(digits);
    setTimeout(() => {
      setBusy(false);
      if (digits === DECLINE_CARD) return nav("/app/book/payment-failed", { state: { card: label } });
      actions.createBooking("App", { card: label, ...(d.service === "Round-Trip" && d.ret ? { returnTrip: d.ret } : {}) });
      nav("/app/book/confirmed", { replace: true });
    }, 1100);
  };
  if (d.paid) return <Navigate to="/app/book/confirmed" replace />;
  return (
    <Screen className="px-5" footer={<><Btn className="w-full min-h-[clamp(48px,6.4vh,56px)] text-[16.5px]" disabled={busy} data-testid="button-pay" onClick={pay}>{busy ? <LoaderCircle size={18} className="anim-spin" /> : <Lock size={18} />}{busy ? "Processing with Stripe..." : `Pay ${money(total)}`}</Btn>
      <p className="mt-1 flex items-center justify-center gap-1.5 text-center text-[12.5px] font-medium text-mute [@media(max-height:600px)]:hidden" data-testid="text-trust"><ShieldCheck size={14} className="text-green" />Secure payment · Free cancellation up to 24h</p>
      <p className="mt-1 text-center text-[12px] text-mute [@media(max-height:620px)]:hidden" data-testid="text-decline-hint">Demo: card 4000 0000 0000 0002 is declined</p></>}>
      <div className="-mx-5"><ScreenHead title="Payment" sub="Step 4 of 4" back="/app/book/fare" /></div>
      <StepHead current={4} />
      <BookSummary />
      <div className="mt-1 flex items-center justify-between gap-2"><h2 className="font-display text-[17px] font-bold">Pay by card</h2><span className="flex gap-1 [@media(max-height:640px)]:hidden" aria-label="Visa, Mastercard, Amex">{["Visa", "Mastercard", "Amex"].map((c) => <span key={c} className="rounded-sm border border-line bg-paper px-1.5 py-0.5 text-[12px] font-bold uppercase tracking-wide text-neutral-ink">{c}</span>)}</span></div>
      <div className="mt-2 flex flex-col gap-2">
        <Field label="Card number" error={bad.no}><div className="relative"><CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
          <input inputMode="numeric" autoComplete="off" data-testid="input-card" aria-invalid={!!bad.no || undefined} className={cn(inputCls, "pl-11", bad.no && invalidCls)} value={card.no} onChange={(e) => { typeCard(e.target.value); setBad({ ...bad, no: undefined }); }} /></div></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Expiry" error={bad.exp}><input autoComplete="off" inputMode="numeric" placeholder="MM / YY" data-testid="input-expiry" aria-invalid={!!bad.exp || undefined} className={cn(inputCls, bad.exp && invalidCls)} value={card.exp} onChange={(e) => { typeExp(e.target.value); setBad({ ...bad, exp: undefined }); }} /></Field>
          <Field label="CVC" error={bad.cvc}><input autoComplete="off" inputMode="numeric" maxLength={4} placeholder="123" data-testid="input-cvc" aria-invalid={!!bad.cvc || undefined} className={cn(inputCls, bad.cvc && invalidCls)} value={card.cvc} onChange={(e) => { setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }); setBad({ ...bad, cvc: undefined }); }} /></Field>
        </div>
        <Field label="Name on card" error={bad.name}><input autoComplete="off" data-testid="input-card-name" aria-invalid={!!bad.name || undefined} className={cn(inputCls, bad.name && invalidCls)} placeholder="Maria Thompson" value={card.name} onChange={(e) => { setCard({ ...card, name: e.target.value }); setBad({ ...bad, name: undefined }); }} /></Field>
      </div>
      <div className="mb-2 mt-3 flex gap-3 rounded-lg bg-info p-3 text-[13px] text-info-ink [@media(max-height:620px)]:hidden">
        <Lock className="shrink-0" size={20} />
        <p>Secure payment by Stripe. Online payment only, no cash. Free cancellation up to 24 hours before pickup.</p>
      </div>
      <p className="mb-2 text-center text-[12px] text-mute [@media(max-height:740px)]:hidden">Prototype: no real charge. Card details are never saved.</p>
    </Screen>
  );
}

export function Confirmed() {
  const s = useAppState();
  const nav = useNavigate();
  const b = s.bookings.find((x) => x.ref === s.draft.lastRef) ?? s.bookings.find((x) => x.email === s.identity.email);
  if (!b) return <Screen className="p-8"><p>No booking yet.</p><Link to="/app/home" className="text-green">Back to home</Link></Screen>;
  return (
    <Screen className="px-5 pt-[clamp(14px,4vh,64px)]" footer={<div className="flex flex-col gap-1"><Btn className="min-h-[clamp(46px,6.4vh,56px)]" data-testid="button-view-trip" onClick={() => nav(`/app/trips/${b.ref}`)}>View my trip</Btn><Btn variant="ghost" onClick={() => nav("/app/home")}>Back to home</Btn></div>}>
      <div className="anim-pop mx-auto flex h-[clamp(52px,9vh,80px)] w-[clamp(52px,9vh,80px)] items-center justify-center rounded-full bg-green text-white shadow-[0_0_0_10px_var(--color-ok)]"><Check size={36} strokeWidth={3} /></div>
      <h1 className="mt-[clamp(8px,2vh,20px)] text-center text-[clamp(22px,3.6vh,28px)] font-bold">Booking confirmed</h1>
      <p className="mt-1 flex flex-wrap items-center justify-center gap-x-1.5 text-center text-[15px] text-mute">Payment received. In the real app a receipt is emailed — nothing is sent in this demo. <Link to={`/app/trips/${b.ref}/receipt`} data-testid="link-view-receipt" className="inline-flex min-h-12 items-center font-semibold text-green underline">View receipt</Link></p>
      <Card className="mt-[clamp(8px,2vh,24px)] p-3.5">
        <div className="flex items-center justify-between gap-3 border-b border-dashed border-line-strong pb-3"><span className="text-[13px] font-medium text-mute">Booking reference</span><span className="tnum rounded-md bg-ok px-2.5 py-1 font-display font-bold text-green" data-testid="text-ref">{b.ref}</span></div>
        <p className="mt-3 font-semibold">{b.service}</p>
        <p className="text-[14px] text-mute">{dayLabel(b.pickup)}, {b.pickup.slice(11)} · {short(b.from) === "UVF" ? "Hewanorra (UVF)" : b.from} to {b.to}</p>
        <div className="mt-3 flex justify-between"><span className="text-mute">Paid with Stripe</span><span className="font-bold">{money(b.total)}</span></div>
      </Card>
      <Card className="mt-2.5 p-3.5 [@media(max-height:740px)]:hidden">
        <p className="font-display font-bold">What happens next</p>
        {["Dispatch assigns your driver. You get driver and car details by SMS and WhatsApp.", "You get a reminder one day before pickup.", "On the day, follow your driver live with alerts at every step."].map((t, i) => (
          <div key={i} className={`mt-2 flex gap-3 text-[13.5px] leading-snug ${i > 0 ? "[@media(max-height:660px)]:hidden" : ""}`}><span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ok font-bold text-green">{i + 1}</span><p>{t}</p></div>
        ))}
      </Card>
    </Screen>
  );
}
