import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, CalendarClock, ChevronDown, ChevronLeft, CircleAlert, Clock, CreditCard, Lock, MapPin, MessageCircle, Navigation, Phone, Plane, Play, RotateCcw, ShieldCheck, Star, Users } from "lucide-react";
import { Btn, Logo, StartLink, ThemeButton, inputCls, invalidCls } from "@/components/kit";
import { Photo } from "@/components/photo";
import type { Slot } from "@/assets/media";
import { actions, setSession, toast, useAppState } from "@/lib/store";
import { PLACES } from "@/lib/seed";
import { checkPickup, dayLabel, money, parse } from "@/lib/format";
import type { Service } from "@/lib/types";
import { cn } from "@/lib/utils";

const DEST = ["Rodney Bay", "Castries", "Soufriere", "Marigot Bay", "Gros Islet", "Vieux Fort"];
const wrap = "mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-10"; // 1280 content + gutters
const eyebrow = "t-eyebrow text-green";
const h2 = "t-display mt-2 text-[clamp(30px,4.4vw,48px)]";
const sec = "py-[var(--space-section)]";

/** The next two months of dates and every quarter hour, written the way the rest of the product writes them. */
const DATE_CHOICES = Array.from({ length: 60 }, (_, i) => {
  const d = new Date(2026, 11, 14 + i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
});
const TIME_CHOICES: [string, string][] = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4), m = (i % 4) * 15;
  const v = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return [v, `${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`];
});

export default function Landing() {
  const s = useAppState();
  const nav = useNavigate();
  const [f, setF] = useState({ service: "Airport Transfer" as Service, from: PLACES.UVF, to: "Rodney Bay", date: "2026-12-18", time: "15:00", pax: 1 });
  const [stuck, setStuck] = useState(false);
  const [vehicle, setVehicle] = useState<string | null>(null);
  const [err, setErr] = useState<{ to?: string; date?: string; time?: string }>({}); // a request passed to dispatch in the booking note
  useEffect(() => { const on = () => setStuck(window.scrollY > 24); on(); window.addEventListener("scroll", on, { passive: true }); return () => window.removeEventListener("scroll", on); }, []);
  // While someone is filling the quote form the sticky bar steps out of the way: on a phone it sits
  // right where the on-screen keyboard pushes the field, and a bar over the field you are typing in is
  // the worst place for it. It comes straight back when focus leaves the form.
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const check = () => {
      const a = document.activeElement as HTMLElement | null;
      setTyping(!!a && !!a.closest("[data-testid=card-quote]") && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName));
    };
    document.addEventListener("focusin", check);
    document.addEventListener("focusout", () => setTimeout(check, 0));
    return () => { document.removeEventListener("focusin", check); document.removeEventListener("focusout", check); };
  }, []);
  const go = () => {
    // Inline, next to the field: a toast here was away from the form and gone in three seconds.
    if (!f.to) return setErr({ to: "Choose a drop-off." });
    if (f.from === f.to) return setErr({ to: "Pickup and drop-off have to be different places." });
    const pe = checkPickup(f.date, f.time); if (pe) return setErr({ time: pe });
    setErr({});
    actions.setDraft({ service: f.service, from: f.from, to: f.to, date: f.date, time: f.time, pax: f.pax, bags: 1, flight: "", note: vehicle ? `Vehicle request: ${vehicle}` : "", childSeat: false, extraStop: false });
    setSession({ role: "passenger" });
    nav("/app/book/details");
  };
  const toBook = () => document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "center" });
  const phone = s.settings.phones[0] ?? "+1 758-000-0000";
  const tel = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const lbl = "mb-1.5 block text-[12.5px] font-semibold text-neutral-ink";

  const trust: [typeof Star, string, string][] = [
    [BadgeCheck, "Verified drivers", "Licence and insurance checked"],
    [RotateCcw, "24h free cancellation", `Free up to ${s.settings.policyHours} hours before pickup`],
    [Lock, "Secure payment", "Card checkout by Stripe"],
    [Navigation, "Live tracking", "Follow your driver on the map"],
  ];
  const dests: { slot: Slot; name: string; line: string; to: string }[] = [
    { slot: "dest-pitons-dusk", name: "The Pitons", line: "The view the island is known for", to: "Soufriere" },
    { slot: "dest-marigot", name: "Marigot Bay", line: "A sheltered bay of yachts and palms", to: "Marigot Bay" },
    { slot: "dest-rodney-bay", name: "Rodney Bay", line: "Beach, marina and restaurants", to: "Rodney Bay" },
    { slot: "dest-castries", name: "Castries", line: "The capital and the cruise port", to: "Castries" },
    { slot: "dest-soufriere", name: "Soufriere", line: "Fishing town below the peaks", to: "Soufriere" },
    { slot: "dest-airport-uvf", name: "Hewanorra Airport", line: "Meet and greet at arrivals", to: "Vieux Fort" },
  ];
  const fleet: { slot: Slot; name: string; line: string; pos?: string }[] = [
    { slot: "fleet-suv", name: "SUV", line: "Couples and small families" },
    { slot: "fleet-minivan", name: "Minivan", line: "Groups and extra luggage" },
    { slot: "fleet-sedan", name: "Executive sedan", line: "Chauffeur service", pos: "88% 62%" },
  ];
  const fromPrice = Math.min(...(["Airport Transfer", "Round-Trip", "Private Tour", "Full-Day Tour"] as Service[]).map((k) => s.prices[k])); // lowest fixed service fare; the data has no per-vehicle prices
  const bookVehicle = (name: string) => { setVehicle(name); toast(`${name} requested. Dispatch confirms the vehicle`, "info"); toBook(); };
  const priced: { k: Service; slot: Slot; note: string; feat?: boolean; pos?: string }[] = [
    { k: "Airport Transfer", slot: "svc-airport", note: "Hewanorra to Rodney Bay. Meet and greet with a name sign and flight tracking.", feat: true, pos: "74% 38%" },
    { k: "Round-Trip", slot: "svc-roundtrip", note: "There and back with the same driver. Fixed price." },
    { k: "Private Tour", slot: "dest-soufriere", note: "Soufriere, Pitons and Diamond Falls. Up to 6 passengers, about 5 hours." },
    { k: "Full-Day Tour", slot: "svc-fullday", note: "Island loop with a beach stop. Up to 8 hours." },
  ];
  const steps: [typeof Plane, string, string][] = [
    [Plane, "We watch your flight", "Delays are on us. Your driver adjusts to the real landing time."],
    [CreditCard, "Pay once, by card", "Stripe checkout. Your card is never stored by us."],
    [CalendarClock, "Reminders that help", "SMS and WhatsApp the day before and on the day."],
    [BadgeCheck, "Meet your driver", "Name, car and plate sent ahead. Follow the trip live."],
  ];
  const faq: [string, string][] = [
    ["What if my flight is delayed?", "We track your flight. Your driver adjusts to the real landing time at no extra cost."],
    ["Can I cancel?", `Yes. Free cancellation up to ${s.settings.policyHours} hours before pickup, with an automatic refund.`],
    ["How do I pay?", "By card when you book, through Stripe. No cash, and your card details are never stored by us."],
    ["Do you provide child seats?", "Yes, add one for $5.00 when you book, and it is fitted before you arrive."],
  ];

  return (
    <div className="bar-clear min-h-[100dvh] overflow-x-clip bg-ground pb-[76px] md:pb-0">
      <a href="#book" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-paper focus:px-4 focus:py-3 focus:font-semibold focus:text-ink">Skip to booking</a>

      <header className={`on-dark fixed inset-x-0 top-0 z-30 text-white transition-[background-color,box-shadow] duration-300 ${stuck ? "blur-bar bg-[#150d06] shadow-e3 dark:bg-[#06120d]" : "bg-transparent"}`}>
        <div className={`${wrap} flex h-[68px] items-center justify-between gap-3`}>
          <Logo size="sm" compactXs />
          <StartLink tone="dark" label="Start" className="hidden md:inline-flex" />
          <nav className="hidden items-center gap-0.5 text-[14.5px] font-medium text-white/90 lg:flex" aria-label="Sections">
            {[["#destinations", "Destinations"], ["#fleet", "Fleet"], ["#prices", "Prices"], ["#how", "How it works"], ["#faq", "Help"]].map(([h, t]) => <a key={h} href={h} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-3 hover:bg-white/15 hover:text-white">{t}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            {/* the number is the first thing a phone visitor wants: full on a desktop, a call button on a phone */}
            <a href={tel} className="hidden min-h-11 items-center gap-2 whitespace-nowrap rounded-md px-3 text-[14px] font-semibold hover:bg-white/15 xl:flex"><Phone size={16} />{phone}</a>
            <a href={tel} aria-label={`Call ${phone}`} data-testid="link-header-call" className="glass-photo tap inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white xl:hidden"><Phone size={17} /></a>
            <ThemeButton className="glass-photo !border-white/30 !text-white !shadow-none" />
            {/* Two identical Book now buttons on screen at once is a choice the reader should not have
                to make: once the sticky price bar is up, the header hands the job over to it. */}
            <Btn variant="orange" className={cn("!min-h-11 !rounded-full !px-4 text-[14px]", stuck && "max-md:hidden", "max-[339px]:hidden")} onClick={toBook}>Book now</Btn>
          </div>
        </div>
      </header>

      <main>
        {/* hero: full-bleed photo, headline, live booking widget */}
        <section className="relative overflow-hidden bg-[#140C05] text-white dark:bg-[#06120D]">
          <div className="absolute inset-x-0 top-0 h-[600px] md:h-full">
            <Photo slot="hero-landing" fill priority sizes="100vw" className="md:max-lg:[object-position:72%_55%]" />
            <span aria-hidden className="scrim-left absolute inset-0 hidden md:block" />
            <span aria-hidden className="scrim-top absolute inset-x-0 top-0 h-44" />
            <span aria-hidden className="scrim-full absolute inset-0 md:hidden" />
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#140C05] to-transparent md:hidden dark:from-[#06120D]" />
          </div>
          <div className={`${wrap} relative grid items-center gap-8 pb-10 pt-[100px] md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-7 md:pb-14 md:pt-[112px] lg:min-h-[clamp(700px,94vh,1000px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-12 lg:pb-24 lg:pt-[128px] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,500px)]`}>
            <div className="anim-rise min-w-0">
              <p className="glass-photo inline-flex max-w-full items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-[12.5px] font-semibold"><span className="h-2 w-2 shrink-0 rounded-full bg-orange" /><span className="inline min-[480px]:max-md:hidden lg:hidden">UVF and SLU airports</span><span className="hidden min-[480px]:max-md:inline lg:inline">Hewanorra (UVF) and George Charles (SLU)</span></p>
              <h1 className="t-display hero-h1 mt-5"><span className="block whitespace-nowrap md:max-lg:whitespace-normal">Land in St. Lucia.</span><i className="block text-hl">Your driver is already there.</i></h1>
              <p className="mt-5 max-w-[560px] text-[clamp(16px,1.35vw,21px)] leading-relaxed text-white/90">Fixed-price airport transfers and island tours. Pay by card when you book, track your driver live. No cash, no haggling.</p>
              <div className="mt-7 grid max-w-[480px] grid-cols-1 gap-2 min-[360px]:grid-cols-2 min-[360px]:gap-3">
                <Btn variant="orange" size="lg" onClick={toBook}>Book a transfer</Btn>
                <Link to="/demo" data-testid="button-watch-demo" className="tap glass-photo inline-flex min-h-14 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 text-[16px] font-semibold text-white hover:bg-white/25 max-[359px]:min-h-12 max-[359px]:!border-transparent max-[359px]:!bg-transparent max-[359px]:text-[15.5px] max-[359px]:underline max-[359px]:underline-offset-4 max-[359px]:[-webkit-backdrop-filter:none] max-[359px]:[backdrop-filter:none]"><Play size={16} className="shrink-0 fill-current" />Watch the demo</Link>
              </div>
              {/* What the company promises, right under the two buttons: the three things a visitor
                  wants settled before they tap anything. */}
              <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] font-semibold" data-testid="list-guarantees">
                <li className="flex items-center gap-2"><BadgeCheck size={18} className="shrink-0 text-hl" /><span className="whitespace-nowrap">Fixed price</span></li>
                <li className="flex items-center gap-2"><CreditCard size={18} className="shrink-0 text-hl" /><span className="whitespace-nowrap">No cash</span></li>
                <li className="flex items-center gap-2"><RotateCcw size={18} className="shrink-0 text-hl" /><span className="whitespace-nowrap">Free cancellation 24h</span></li>
              </ul>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] font-semibold">
                <span className="flex items-center gap-2"><span className="flex text-orange" aria-hidden>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={17} className="fill-current" />)}</span><span className="whitespace-nowrap">4.9 from 1,284 rides<span className="ml-0.5 align-super text-[12px] font-normal">*</span></span></span>
                <span className="flex items-center gap-2"><ShieldCheck size={18} className="shrink-0 text-hl" /><span className="whitespace-nowrap">Licensed and insured</span></span>
              </div>
              {/* The disclosure stays, but out of the trust line: inside it, it undercut the one number
                  a visitor reads first. */}
              <p className="mt-2 text-[12.5px] font-normal text-white/70">* Ratings shown are sample data.</p>
            </div>

            <form id="book" data-testid="card-quote" onSubmit={(e) => { e.preventDefault(); go(); }} className="anim-pop min-w-0 rounded-3xl bg-paper p-5 text-ink shadow-float sm:p-7 md:max-lg:p-5">
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="t-title text-[24px]">Get your fixed price</h2><p className="mt-0.5 text-[13.5px] text-mute">Per vehicle, not per person.</p></div>
                <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-ok px-2.5 py-1.5 text-[12px] font-semibold text-green"><Clock size={13} />1 minute</span>
              </div>
              {vehicle && <p className="mt-4 flex items-center justify-between gap-2 rounded-md bg-info px-3 py-2 text-[13px] font-medium text-info-ink" data-testid="chip-vehicle-request"><span className="min-w-0 truncate">Vehicle request: <b>{vehicle}</b></span><button type="button" onClick={() => setVehicle(null)} className="-my-2 -mr-2 inline-flex h-11 shrink-0 items-center px-2 font-semibold underline underline-offset-4">Remove</button></p>}
              <div className="mt-5 grid gap-3.5 md:max-lg:mt-4 md:max-lg:gap-3">
                <div><label htmlFor="l-service" className={lbl}>Service</label><select id="l-service" className={inputCls} value={f.service} onChange={(e) => setF({ ...f, service: e.target.value as Service })}>{(["Airport Transfer", "Round-Trip", "Private Tour", "Full-Day Tour"] as Service[]).map((x) => <option key={x}>{x}</option>)}</select></div>
                <div className="grid gap-3.5">
                  <div className="min-w-0"><label htmlFor="l-from" className={lbl}>Pickup</label><select id="l-from" className={inputCls} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })}>{Object.values(PLACES).map((p) => <option key={p} value={p}>{p.replace("George F. L. Charles Airport", "Charles Airport").replace(" cruise terminal", "")}</option>)}</select></div>
                  <div className="min-w-0"><label htmlFor="l-to" className={lbl}>Drop-off</label><select id="l-to" className={inputCls} value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })}>{DEST.map((p) => <option key={p}>{p}</option>)}</select></div>
                </div>
                {/* Native date and time controls draw themselves differently in every browser and show
                    the date US-style, which fights the "Mon 14 Dec 2026" the rest of the product uses.
                    These are plain selects: same look everywhere, and the wording the reader expects. */}
                <div className="grid grid-cols-2 gap-3.5 max-[389px]:grid-cols-1 md:max-lg:grid-cols-1 md:max-lg:gap-3">
                  <div className="min-w-0"><label htmlFor="l-date" className={lbl}>Date</label>
                    <select id="l-date" className={cn(inputCls, err.date && invalidCls)} aria-invalid={!!err.date || undefined} value={f.date} onChange={(e) => { setF({ ...f, date: e.target.value }); setErr({}); }}>
                      {DATE_CHOICES.map((iso) => <option key={iso} value={iso}>{dayLabel(iso)}</option>)}
                    </select></div>
                  <div className="min-w-0"><label htmlFor="l-time" className={lbl}>Time</label>
                    <select id="l-time" className={cn(inputCls, err.time && invalidCls)} aria-invalid={!!err.time || undefined} value={f.time} onChange={(e) => { setF({ ...f, time: e.target.value }); setErr({}); }}>
                      {TIME_CHOICES.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                    </select></div>
                </div>
                {(err.date || err.time || err.to) && <p role="alert" data-testid="error-landing-form" className="flex items-start gap-1.5 text-[13px] font-medium text-err"><CircleAlert size={15} className="mt-px shrink-0" />{err.to ?? err.date ?? err.time}</p>}
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-ok px-4 py-3.5">
                <div className="min-w-0"><p className="text-[13px] font-semibold text-green">Fixed price per vehicle</p><p className="text-[12.5px] text-mute">No surge, no hidden fees</p></div>
                <span className="t-display tnum shrink-0 text-[36px] text-green md:max-lg:text-[30px]" aria-live="polite">{money(s.prices[f.service])}</span>
              </div>
              <Btn type="submit" variant="orange" size="lg" className="mt-4 w-full" data-testid="button-landing-book">Continue booking<ArrowRight size={19} /></Btn>
              <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-[12.5px] text-mute"><Lock size={13} className="mt-[2px] shrink-0" />Secure card payment with Stripe. Free cancellation up to {s.settings.policyHours} hours before.</p>
            </form>
          </div>
        </section>

        {/* trust bar */}
        <section aria-label="Why book with St Lu" className="border-b border-line bg-paper">
          <ul className={`${wrap} grid grid-cols-1 gap-x-6 gap-y-5 py-7 min-[440px]:grid-cols-2 lg:grid-cols-4`}>
            {trust.map(([I, t, b]) => (
              <li key={t} className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ok text-green"><I size={20} /></span>
                <div className="min-w-0"><p className="text-[15px] font-semibold leading-tight">{t}</p><p className="mt-0.5 text-[13px] leading-snug text-mute">{b}</p></div>
              </li>
            ))}
          </ul>
        </section>

        {/* On a phone the full "How it works" section is four screens down, past the destinations, the
            fleet and the prices. These three lines answer "how does this work?" while the hero is still
            in mind; the full section stays where it is for wider screens. */}
        <section aria-label="How it works" className="border-b border-line bg-ground md:hidden">
          <ol className={`${wrap} flex flex-col gap-3 py-6`} data-testid="list-how-mobile">
            {steps.slice(0, 3).map(([Icon, ti], n) => (
              <li key={ti} className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ok text-green"><Icon size={19} /></span>
                <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug">{ti}</span>
                <span className="t-display tnum shrink-0 text-[17px] text-mute">0{n + 1}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* destinations */}
        <section id="destinations" className={`${wrap} ${sec}`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-[640px]"><p className={eyebrow}>Destinations</p><h2 className={h2}>Where can we take you?</h2></div>
            <Btn variant="outline" onClick={toBook}>Check your route<ArrowRight size={17} /></Btn>
          </div>
          <div className="mt-8 grid auto-rows-[220px] grid-cols-2 gap-3 sm:auto-rows-[250px] sm:gap-4 lg:auto-rows-[280px] lg:grid-cols-4">
            {dests.map((d, i) => (
              <button key={d.name} type="button" data-testid={`card-dest-${d.to.toLowerCase().replace(/ /g, "-")}-${i}`} onClick={() => { setF((x) => ({ ...x, to: d.to })); toBook(); }}
                className={`tap group relative min-w-0 overflow-hidden rounded-2xl text-left text-white shadow-card ${i === 0 ? "col-span-2 lg:row-span-2" : ""} ${i === 5 ? "col-span-2 lg:col-span-4" : ""}`}>
                <span className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"><Photo slot={d.slot} fill sizes={i === 0 || i === 5 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"} /></span>
                <span aria-hidden className="scrim-card absolute inset-0" />
                <span className="absolute inset-x-4 bottom-4 block sm:inset-x-5 sm:bottom-5">
                  <span className={`t-title block ${i === 0 ? "text-[clamp(24px,3vw,34px)]" : "text-[clamp(18px,2vw,23px)]"}`}>{d.name}</span>
                  <span className="mt-1 block text-[13px] leading-snug text-white/90">{d.line}</span>
                </span>
                <span className="glass-photo absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><ArrowRight size={17} /></span>
              </button>
            ))}
          </div>
        </section>

        {/* fleet */}
        <section id="fleet" className="border-y border-line bg-paper">
          <div className={`${wrap} ${sec}`}>
            <div className="max-w-[640px]"><p className={eyebrow}>Fleet</p><h2 className={h2}>Clean, licensed, air-conditioned</h2><p className="mt-3 text-[17px] text-mute">Every vehicle is licensed for hire and insured. Dispatch matches the vehicle to your group and luggage.</p></div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {fleet.map((v) => (
                <article key={v.name} className="lift flex flex-col overflow-hidden rounded-2xl border border-line bg-ground shadow-card">
                  <div className="relative aspect-[3/2] overflow-hidden md:aspect-[4/3] xl:aspect-[3/2]"><Photo slot={v.slot} fill pos={v.pos} sizes="(min-width: 768px) 33vw, 100vw" /></div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
                      <div className="min-w-0"><h3 className="t-title text-[24px]">{v.name}</h3><p className="mt-0.5 text-[14px] text-mute">{v.line}</p></div>
                      <p className="whitespace-nowrap text-right text-[12.5px] text-mute">Transfers from<span className="t-display tnum ml-1.5 text-[24px] text-green">{money(fromPrice)}</span></p>
                    </div>
                    <Btn variant="outline" className="mt-4 w-full" data-testid={`button-book-vehicle-${v.name.toLowerCase().replace(/ /g, "-")}`} onClick={() => bookVehicle(v.name)}>Book this vehicle<ArrowRight size={17} /></Btn>
                  </div>
                </article>
              ))}
            </div>
            <div className="relative mt-5 overflow-hidden rounded-2xl bg-[#140C05] text-white dark:bg-[#06120D]">
              <div className="relative h-[220px] sm:h-[260px] lg:h-[320px]"><Photo slot="fleet-interior" fill sizes="(min-width: 1360px) 1280px, 100vw" /><span aria-hidden className="scrim-left absolute inset-0" />
                <div className="absolute inset-y-0 left-0 flex max-w-[520px] flex-col justify-center p-6 sm:p-10"><p className="t-eyebrow text-hl">Inside every ride</p><p className="t-display mt-2 text-[clamp(24px,3vw,38px)]">Clean, cool and quiet.</p><p className="mt-2 text-[15px] text-white/90">Air-conditioned, with room for your luggage. Child seats on request.</p></div>
              </div>
            </div>
            <p className="mt-3 text-[12.5px] text-mute">"From" is the lowest fixed fare. Your exact price depends on the route and is shown before you pay. Dispatch confirms the vehicle.</p>
          </div>
        </section>

        {/* prices */}
        <section id="prices" className={`${wrap} ${sec}`}>
          <div className="max-w-[640px]"><p className={eyebrow}>Fixed prices in USD</p><h2 className={h2}>Prices you see before you fly</h2><p className="mt-3 text-[17px] text-mute">Fixed per vehicle. No surge, no hidden fees.</p></div>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {priced.map(({ k, slot, note, feat, pos }) => (
              <article key={k} className={`lift flex min-w-0 overflow-hidden rounded-2xl border bg-paper shadow-card ${feat ? "border-green ring-4 ring-green/10" : "border-line"}`}>
                <div className="relative w-[34%] max-w-[190px] shrink-0 overflow-hidden"><Photo slot={slot} fill pos={pos} sizes="(min-width: 1024px) 190px, 34vw" /></div>
                <div className="min-w-0 flex-1 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                    <h3 className="text-[17px] font-bold">{k}</h3>
                    {feat && <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-orange px-2.5 py-1 text-[12px] font-bold text-orange-ink"><Star size={11} className="fill-current" />Most booked</span>}
                  </div>
                  <p className="t-display tnum mt-1 text-[34px] text-green">{money(s.prices[k])}<span className="ml-1.5 whitespace-nowrap font-sans text-[13px] font-medium tracking-normal text-mute max-[379px]:ml-0 max-[379px]:block">per vehicle</span></p>
                  <p className="mt-2 text-[14px] leading-relaxed text-mute">{note}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* how it works */}
        <section id="how" className="border-y border-line bg-paper">
          <div className={`${wrap} ${sec}`}>
            <div className="max-w-[640px]"><p className={eyebrow}>How it works</p><h2 className={h2}>From the runway to your hotel, sorted</h2></div>
            <ol className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map(([Icon, ti, b], n) => (
                <li key={ti}>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ok text-green"><Icon size={22} /></span>
                    <span className="h-px flex-1 bg-line" aria-hidden />
                    <span className="t-display tnum text-[22px] text-mute">0{n + 1}</span>
                  </div>
                  <h3 className="mt-4 text-[18px] font-bold">{ti}</h3><p className="mt-1.5 text-[14.5px] leading-relaxed text-mute">{b}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* No reviews section. Invented names and quotes on a real company's page are not something a
            prototype should carry, however clearly they are labelled: the client would have to delete
            them before launch, and anyone seeing the page in between reads them as real guests. What
            earns the space instead is what the company can actually stand behind. */}
        <section aria-label="Why book with St Lu" className="border-t border-line bg-paper">
          <div className={`${wrap} ${sec}`}>
            <div className="max-w-[640px]"><p className={eyebrow}>Why book with us</p><h2 className={h2}>Every ride, on the same terms</h2></div>
            <ul className="mt-9 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4" data-testid="list-trust">
              {[[BadgeCheck, "Fixed price, per vehicle", "The price you see when you book is the price you pay. No surge, no per-person maths, no haggling at the kerb."],
                [RotateCcw, "Free cancellation for 24h", "Plans change. Cancel up to 24 hours before pickup and the card is refunded in full."],
                [ShieldCheck, "Licensed and insured drivers", "Every driver on the platform holds a current taxi licence and insurance, checked by the office."],
                [CreditCard, "Card payment, no cash", "Pay by card through Stripe when you book. Nothing to settle with the driver."]].map(([Icon, ti, b]) => {
                  const I = Icon as typeof BadgeCheck;
                  return (
                    <li key={ti as string}>
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ok text-green"><I size={22} /></span>
                      <h3 className="t-title mt-4 text-[18px]">{ti as string}</h3>
                      <p className="mt-2 text-[14.5px] leading-relaxed text-mute">{b as string}</p>
                    </li>
                  );
                })}
            </ul>
          </div>
        </section>

        {/* faq */}
        <section id="faq" className="border-t border-line bg-paper">
          <div className={`${wrap} ${sec} grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]`}>
            <div><p className={eyebrow}>Help</p><h2 className={h2}>Questions</h2><p className="mt-3 max-w-[360px] text-[16px] text-mute">Still unsure? Our dispatchers answer on phone and WhatsApp.</p>
              <a href={tel} className="tap mt-5 inline-flex min-h-12 items-center gap-2 whitespace-nowrap rounded-lg border border-line-strong bg-paper px-4 text-[15px] font-semibold shadow-e1 hover:border-green/60"><Phone size={17} className="text-green" />{phone}</a></div>
            <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-ground">
              {faq.map(([q, a]) => (
                <details key={q} className="group px-5 open:bg-paper"><summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-3 py-2 text-[16px] font-semibold [&::-webkit-details-marker]:hidden">{q}<span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ok text-green transition-transform group-open:rotate-180"><ChevronDown size={18} /></span></summary><p className="pb-5 pr-10 text-[15px] leading-relaxed text-mute">{a}</p></details>
              ))}
            </div>
          </div>
        </section>

        {/* closing call to action over photography */}
        <section className={`${wrap} py-[clamp(40px,6vw,80px)]`}>
          <div className="relative overflow-hidden rounded-3xl bg-[#140C05] px-6 py-12 text-white sm:px-12 sm:py-16 dark:bg-[#06120D]">
            <Photo slot="extra-taxi-pitons" fill sizes="(min-width: 1360px) 1280px, 100vw" />
            <span aria-hidden className="scrim-left absolute inset-0" /><span aria-hidden className="scrim-full absolute inset-0 opacity-60 md:hidden" />
            <div className="relative flex flex-wrap items-center justify-between gap-8">
              <div className="min-w-0 max-w-[560px]"><h2 className="t-display text-[clamp(30px,4.2vw,46px)]">Rather talk to someone?</h2><p className="mt-3 text-[16px] text-white/90">{s.settings.phones.join(" · ")}</p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] font-semibold text-white"><li className="flex items-center gap-1.5"><Users size={15} className="text-hl" />Local dispatch team</li><li className="flex items-center gap-1.5"><MapPin size={15} className="text-hl" />Castries, St. Lucia</li></ul></div>
              <div className="grid w-full grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:w-auto">
                <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="tap inline-flex min-h-[54px] items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-cta px-5 text-[16px] font-semibold text-cta-ink"><MessageCircle size={19} />WhatsApp us</a>
                <Link to="/app" className="tap glass-photo inline-flex min-h-[54px] items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 text-[16px] font-semibold hover:bg-white/25">Open the app<ArrowRight size={18} /></Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="on-dark bg-green-night text-white/75">
        <div className={`${wrap} grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]`}>
          <div><Logo size="sm" testId="img-logo-footer" /><p className="mt-4 max-w-[300px] text-[14px] leading-relaxed">Licensed and insured airport and tour transport across St. Lucia.</p><p className="mt-3 text-[13px]">{s.settings.address}</p></div>
          <div className="text-[14px]"><p className="t-eyebrow !text-[12px] text-white">Services</p><ul className="mt-3 flex flex-col">{priced.map((p) => <li key={p.k}><a href="#prices" className="inline-flex min-h-11 items-center hover:text-white">{p.k}</a></li>)}</ul></div>
          <div className="text-[14px]"><p className="t-eyebrow !text-[12px] text-white">Company</p><p className="mt-3">{s.settings.company}</p><p className="mt-1">Licensed and insured airport and tour transport.</p></div>
          <div className="text-[14px]"><p className="t-eyebrow !text-[12px] text-white">Help</p><ul className="mt-3 flex flex-col"><li><a href="#faq" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-white">Questions</a></li><li><Link to="/app/terms" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-white">Terms and privacy</Link></li><li><a href={tel} className="inline-flex min-h-11 items-center hover:text-white">{phone}</a></li></ul></div>
        </div>
        <div className="border-t border-white/10"><div className={`${wrap} flex flex-wrap items-center justify-between gap-2 py-5 text-[12.5px]`}><p>&copy; 2026 {s.settings.company}</p><p className="flex items-center gap-1.5"><Lock size={13} />Payments secured by Stripe · Prices in USD · Photos are AI-generated sample imagery</p></div></div>
      </footer>

      {/* sticky mobile call to action */}
      <div data-testid="sticky-book" aria-hidden={typing} style={{ bottom: "var(--demo-bar)" }} className={`blur-bar fixed inset-x-0 z-30 border-t border-line bg-paper px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 transition-transform duration-300 md:hidden ${stuck && !typing ? "translate-y-0" : "translate-y-full"}`}>
        <div className="flex items-center gap-2.5">
          {/* the only chrome a phone visitor always has: the route back to the prototype lives here */}
          <Link to="/" aria-label="Back to the prototype start page" data-testid="link-start-sticky" tabIndex={stuck && !typing ? 0 : -1}
            className="tap inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-ground text-ink"><ChevronLeft size={19} /></Link>
          <div className="min-w-0 flex-1"><p className="text-[12px] font-medium leading-snug text-mute">{f.service} · fixed price</p><p className="tnum text-[19px] font-bold leading-tight text-ink">{money(s.prices[f.service])}</p></div>
          <Btn variant="orange" className="shrink-0 px-5" onClick={toBook} tabIndex={stuck && !typing ? 0 : -1}>Book now</Btn>
        </div>
      </div>
    </div>
  );
}
