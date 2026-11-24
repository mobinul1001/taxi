import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Car, ChevronRight, Compass, Package, Plane, Repeat, Search, Sun } from "lucide-react";
import { Avatar, Btn, Card, StatusPill, inputCls } from "@/components/kit";
import { Screen } from "@/components/mobile";
import { Media, type SceneKind } from "@/components/art";
import { Sheet } from "@/components/bits";
import { actions, toast, useAppState } from "@/lib/store";
import { moneyShort, pickupLabel, routeShort, TODAY_ISO } from "@/lib/format";
import type { QuoteService, Service } from "@/lib/types";

export const myBookings = (s: ReturnType<typeof useAppState>) => s.bookings.filter((b) => b.email === s.identity.email);
export const upcoming = (list: ReturnType<typeof myBookings>) =>
  list.filter((b) => !["completed", "cancelled"].includes(b.status)).sort((a, b) => a.pickup.localeCompare(b.pickup));

export function QuoteSheet({ service, onClose }: { service: QuoteService | null; onClose: () => void }) {
  const s = useAppState();
  const nav = useNavigate();
  const [svc, setSvc] = useState<QuoteService>(service ?? "Chauffeur");
  const [f, setF] = useState({ from: "", to: "", date: `${TODAY_ISO}T10:00`, details: "" });
  return (
    <Sheet open={!!service} onClose={onClose} title="Get a quote">
      <div className="mb-3 grid grid-cols-3 gap-2">
        {(["Point-to-Point", "Chauffeur", "Delivery"] as QuoteService[]).map((q) => (
          <button key={q} onClick={() => setSvc(q)} aria-pressed={svc === q} className={`tap min-h-12 rounded-md border px-1 text-[13px] font-semibold ${svc === q ? "border-green bg-green text-white" : "border-line-strong bg-paper"}`}>{q}</button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <input aria-label={svc === "Delivery" ? "Collect from" : "Pickup"} className={inputCls} placeholder={svc === "Delivery" ? "Collect from" : "Pickup"} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
        <input aria-label={svc === "Chauffeur" ? "Hours or itinerary" : "Drop-off"} className={inputCls} placeholder={svc === "Chauffeur" ? "Hours or itinerary" : "Drop-off"} value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
        <input type="datetime-local" aria-label="Date and time" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <textarea aria-label="Details for the dispatcher" className={inputCls + " h-24 py-3"} placeholder="Details for the dispatcher" value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} />
        <p className="text-[13px] text-mute">No payment now. The dispatcher sends a fixed quote by SMS and WhatsApp, then a secure Stripe payment link.</p>
        <Btn data-testid="button-send-quote" onClick={() => {
          if (!f.from) return toast("Add a pickup point", "err");
          const qid = actions.createQuote({ service: svc, passenger: s.identity.name, email: s.identity.email, phone: s.identity.phone, from: f.from, to: f.to, date: f.date, details: f.details, source: "App" });
          onClose();
          nav(`/app/quote/sent?id=${qid}`);
        }}>Request quote</Btn>
      </div>
    </Sheet>
  );
}

export function PassengerHome() {
  const s = useAppState();
  const nav = useNavigate();
  const [quote, setQuote] = useState<QuoteService | null>(null);
  const next = useMemo(() => upcoming(myBookings(s))[0], [s]);
  const unread = s.alerts.some((a) => a.audience === "passenger" && a.email === s.identity.email && !a.read);
  const first = s.identity.name.split(" ")[0];
  const book = (svc: Service) => { actions.setDraft({ service: svc }); nav("/app/book/route"); };

  const cards: { label: string; I: typeof Plane; svc?: Service; q?: QuoteService; scene: SceneKind; tall?: boolean }[] = [
    { label: "Airport Transfer", I: Plane, svc: "Airport Transfer", scene: "road", tall: true }, { label: "Private Tour", I: Compass, svc: "Private Tour", scene: "pitons", tall: true },
    { label: "Full-Day Tour", I: Sun, svc: "Full-Day Tour", scene: "bay" }, { label: "Round-Trip", I: Repeat, svc: "Round-Trip", scene: "marigot" },
    { label: "Chauffeur", I: Car, q: "Chauffeur", scene: "forest" }, { label: "Delivery", I: Package, q: "Delivery", scene: "road" },
  ];
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Screen tabs="passenger" fill fit={false} className="relative">
      <div className="shrink-0 px-5 pt-[clamp(18px,5vh,48px)]">
        <div className="flex items-center gap-3">
          <Avatar name={s.identity.name} size={44} />
          <div className="min-w-0 flex-1"><p className="text-[13px] font-medium text-mute">{greet}</p><h1 className="whitespace-nowrap font-display text-[clamp(21px,3.4vh,26px)] font-bold leading-tight">Hi, {first}</h1></div>
          <Link to="/app/alerts" aria-label="Alerts" data-testid="link-alerts" className="tap relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-ink shadow-e1">
            <Bell size={20} />{unread && <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-orange" />}
          </Link>
        </div>
        <button data-testid="button-where-to" onClick={() => nav("/app/book/route")} className="tap bg-hero relative mt-[clamp(10px,2vh,18px)] flex w-full items-center gap-3 overflow-hidden rounded-xl p-2 pl-4 text-left text-white shadow-pop">
          <span className="bg-dots pointer-events-none absolute inset-0 opacity-50" />
          <Search size={20} className="relative shrink-0 text-orange-soft" />
          <span className="relative min-w-0 flex-1 py-[clamp(4px,1vh,10px)]"><span className="block font-display text-[clamp(17px,2.6vh,20px)] font-bold leading-tight">Where to?</span><span className="block text-[12.5px] leading-snug text-white/75 [@media(max-height:620px)]:hidden">Airport, hotel, beach or tour</span></span>
          <span className="relative inline-flex min-h-12 shrink-0 items-center rounded-lg bg-orange px-4 text-[14px] font-bold text-orange-ink">Book now</span>
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-5 pt-[clamp(10px,2vh,20px)]">
        <div className="flex shrink-0 items-baseline justify-between gap-2"><h2 className="whitespace-nowrap font-display text-[18px] font-bold">Explore St Lucia</h2><span className="hidden text-[12.5px] font-medium text-mute min-[360px]:inline">Fixed prices in USD</span></div>
        {/* two columns on a phone; once the app column is wide enough (1400px up) the six cards
            sit three across, which fills the pane instead of leaving a tall thin strip */}
        <div className="explore-grid stagger mt-2 grid min-h-[150px] flex-1 auto-rows-[minmax(140px,1fr)] grid-cols-2 gap-2.5 [@media(min-width:1400px)]:grid-cols-3 [@media(min-width:1400px)]:flex-none [@media(min-width:1400px)]:auto-rows-auto">
          {cards.map(({ label, I, svc, q, scene }) => (
            <button key={label} data-testid={`card-service-${label.toLowerCase().replace(/ /g, "-")}`} onClick={() => (svc ? book(svc) : setQuote(q!))}
              className="tap group relative min-h-11 overflow-hidden rounded-lg text-left shadow-card ring-1 ring-black/5 [@media(min-width:1400px)]:h-[180px]">
              <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"><Media kind={scene} /></div>
              <div className="absolute inset-0 bg-gradient-to-t from-green-night/90 via-green-night/25 to-transparent" />
              <span className="absolute left-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-green-dark shadow-e1 [@media(max-height:700px)]:hidden"><I size={16} /></span>
              <div className="absolute inset-x-3 bottom-2 text-white">
                <p className="text-[16px] font-semibold leading-tight">{label}</p>
                <p className="tnum font-display text-[18.5px] font-bold leading-tight text-orange-soft">{svc ? moneyShort(s.prices[svc]) : "Get quote"}</p>
              </div>
            </button>
          ))}
        </div>
        {/* one honest line for the whole grid; the per-photo chip is gone, so this is the disclosure */}
        <p className="shrink-0 pt-1.5 text-center text-[12px] text-mute [@media(max-height:620px)]:hidden">Photos are AI-generated samples.</p>
        <button onClick={() => setQuote("Point-to-Point")} className="min-h-12 shrink-0 text-center text-[14px] font-semibold text-green [@media(max-height:600px)]:hidden">Point-to-Point ride? Get a quote</button>
        {next ? (
          <Link to={`/app/trips/${next.ref}`} data-testid="card-upcoming-trip" className="tap relative mb-3 flex shrink-0 items-center gap-3 overflow-hidden rounded-lg border border-line bg-paper px-3.5 py-3 shadow-card">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ok text-green"><Car size={20} /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="text-[12px] font-bold uppercase tracking-wide text-mute">Upcoming</span><StatusPill status={next.status} label={next.status === "pending" ? "Awaiting driver" : undefined} /></div>
              <p className="mt-0.5 font-display text-[16px] font-bold">{next.service}</p>
              <p className="text-[13px] leading-snug text-mute">{pickupLabel(next.pickup)} · {routeShort(next)}</p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-mute" />
          </Link>
        ) : (
          <Card className="mb-3 shrink-0 px-4 py-3 text-center"><p className="font-semibold">No upcoming trips</p><p className="text-[13px] text-mute">Book a fixed price ride in under a minute.</p></Card>
        )}
      </div>
      <QuoteSheet key={quote ?? "none"} service={quote} onClose={() => setQuote(null)} />
    </Screen>
  );
}
