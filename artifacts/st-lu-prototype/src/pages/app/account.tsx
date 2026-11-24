import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LogoutSheet } from "@/components/logout-sheet";
import { ArrowLeft, Bell, ChevronRight, CreditCard, FileText, HelpCircle, LogOut, MapPin, MessageCircle, Phone, User, X } from "lucide-react";
import { AlertIcon, Avatar, BackBtn, Btn, Card, ChannelTags, Empty, Switch, ThemeRow, inputCls } from "@/components/kit";
import { Screen } from "@/components/mobile";
import { Sheet } from "@/components/bits";
import { actions, toast, useAppState } from "@/lib/store";
import type { Alert } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AlertList({ list, onOpen, onMarkAll, back, emptyBody }: { list: Alert[]; onOpen: (a: Alert) => void; onMarkAll: () => void; back: string; emptyBody?: string }) {
  const today = list.filter((a) => /^\d\d:\d\d$/.test(a.at));
  const earlier = list.filter((a) => !/^\d\d:\d\d$/.test(a.at));
  const group = (title: string, items: Alert[]) => items.length > 0 && (
    <>
      <p className="px-5 pb-2 pt-4 text-[12px] font-bold uppercase tracking-wider text-mute">{title}</p>
      {items.map((a) => (
        <button key={a.id} onClick={() => onOpen(a)} data-testid={`alert-${a.id}`} className={cn("relative flex w-full gap-3 border-b border-line px-5 py-4 text-left", a.read ? "bg-paper" : "bg-ok/60")}>
          {!a.read && <span className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-green" aria-label="Unread" />}
          <AlertIcon kind={a.kind} />
          <div className="min-w-0 flex-1"><p className="text-[15.5px] font-semibold leading-snug">{a.title}</p><p className="mt-0.5 text-[14px] leading-snug text-mute">{a.body}</p><ChannelTags at={a.at} /></div>
        </button>
      ))}
    </>
  );
  return (
    <Screen fit={false}>
      <div className="flex items-center gap-3 px-5 pb-2 pt-[clamp(18px,5vh,48px)]">
        <BackBtn to={back} /><h1 className="min-w-0 flex-1 text-[clamp(20px,3vh,24px)] font-bold">Alerts</h1>
        <button onClick={onMarkAll} data-testid="button-mark-all-read" className="min-h-12 shrink-0 text-[14px] font-semibold text-green">Mark all read</button>
      </div>
      {list.length === 0 ? <div className="mt-16" data-testid="empty-alerts"><Empty icon={<Bell />} title="No alerts yet" body={emptyBody ?? "Booking, driver and trip alerts arrive here and by SMS and WhatsApp."} /></div> : <>{group("TODAY", today)}{group("EARLIER", earlier)}</>}
    </Screen>
  );
}

export function PassengerAlerts() {
  const s = useAppState();
  const nav = useNavigate();
  const list = useMemo(() => s.alerts.filter((a) => a.audience === "passenger" && a.email === s.identity.email), [s]);
  return <AlertList list={list} back="/app/home" emptyBody="Driver updates and reminders will appear here and arrive by SMS and WhatsApp." onMarkAll={() => { actions.markRead("passenger", s.identity.email); toast("All alerts marked as read"); }}
    onOpen={(a) => (a.id === "flight-delay" ? nav("/app/alerts/flight-delayed") : a.ref && nav(`/app/trips/${a.ref}`))} />;
}

type Panel = null | "details" | "payment" | "places" | "help" | "terms";
export function Account() {
  const s = useAppState();
  const nav = useNavigate();
  const id = s.identity;
  const [params] = useSearchParams();
  const [panel, setPanel] = useState<Panel>(params.get("panel") === "payment" ? "payment" : null);
  const [logout, setLogout] = useState(false);
  const [form, setForm] = useState({ name: id.name, phone: id.phone });
  const [place, setPlace] = useState("");
  const item = (I: typeof User, label: string, onClick: () => void, right?: string) => (
    <button onClick={onClick} className="flex min-h-[56px] w-full items-center gap-3 border-b border-line px-4 text-left last:border-0">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ok text-green"><I size={18} /></span><span className="min-w-0 flex-1 text-[15.5px] font-medium">{label}</span>{right && <span className="shrink-0 text-[13.5px] text-mute">{right}</span>}<ChevronRight size={18} className="shrink-0 text-mute" />
    </button>
  );
  const sw = (I: typeof User, label: string, on: boolean, k: "sms" | "whatsapp") => (
    <div className="flex min-h-[56px] items-center gap-3 border-b border-line px-4 last:border-0">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ok text-green"><I size={18} /></span><span className="min-w-0 flex-1 text-[15.5px] font-medium">{label}</span>
      <Switch label={label} on={on} onChange={(v) => { actions.setIdentity({ [k]: v }); toast(`${label} ${v ? "on" : "off"}`); }} />
    </div>
  );
  return (
    <Screen tabs="passenger" className="relative px-5 pt-[clamp(18px,5vh,48px)]">
      <Card className="p-4"><div className="flex items-center gap-4"><Avatar name={id.name} size={60} /><div className="min-w-0"><h1 className="font-display text-[20px] font-bold leading-tight [overflow-wrap:anywhere]">{id.name}</h1><p className="text-[13.5px] text-mute">{id.phone}</p></div></div><p className="mt-3 text-[clamp(12.5px,3.8vw,13.5px)] text-mute [overflow-wrap:anywhere]">{id.email}</p></Card>
      <p className="mb-2 mt-6 text-[12px] font-bold uppercase tracking-wider text-mute">ACCOUNT</p>
      <Card>{item(User, "Personal details", () => setPanel("details"))}{item(CreditCard, "Payment methods", () => setPanel("payment"), id.card)}{item(MapPin, "Saved places", () => setPanel("places"))}</Card>
      <p className="mb-2 mt-5 text-[12px] font-bold uppercase tracking-wider text-mute">TRIP ALERTS</p>
      <Card>{sw(MessageCircle, "SMS alerts", id.sms, "sms")}{sw(MessageCircle, "WhatsApp alerts", id.whatsapp, "whatsapp")}</Card>
      <p className="mb-2 mt-5 text-[12px] font-bold uppercase tracking-wider text-mute">APPEARANCE</p>
      <Card><ThemeRow /></Card>
      <p className="mb-2 mt-5 text-[12px] font-bold uppercase tracking-wider text-mute">SUPPORT</p>
      <Card>
        <a href={`tel:${s.settings.phones[0].replace(/[^\d+]/g, "")}`} className="flex min-h-[56px] flex-wrap items-center gap-x-3 border-b border-line px-4 max-[379px]:py-2"><span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ok text-green"><Phone size={18} /></span><span className="flex-1 whitespace-nowrap text-[15.5px] font-medium">Call dispatcher</span><span className="shrink-0 whitespace-nowrap text-[13.5px] text-mute max-[379px]:basis-full max-[379px]:pl-12">{s.settings.phones[0]}</span></a>
        {item(HelpCircle, "Help and FAQ", () => setPanel("help"))}{item(FileText, "Terms and privacy", () => nav("/app/terms"))}
      </Card>
      {/* a phone has no room for the desktop "Back to start" pill, so the way out of the app lives here */}
      <Link to="/" data-testid="link-account-start" className="tap mt-5 flex min-h-12 items-center justify-center gap-1.5 rounded-lg border border-line bg-paper text-[14px] font-semibold text-ink [@media(min-width:1000px)]:hidden"><ArrowLeft size={16} />Back to the start page</Link>
      <Btn variant="outline" className="mb-6 mt-3 w-full !border-err !text-err" data-testid="button-logout" onClick={() => setLogout(true)}><LogOut size={18} /> Log out</Btn>
      <LogoutSheet open={logout} onClose={() => setLogout(false)} />

      <Sheet open={panel === "details"} onClose={() => setPanel(null)} title="Personal details">
        <div className="flex flex-col gap-3">
          <input aria-label="Full name" autoComplete="name" className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input aria-label="Mobile number" autoComplete="tel" className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input aria-label="Email" className={inputCls + " !bg-aground text-mute"} value={id.email} readOnly />
          <Btn onClick={() => { actions.setIdentity(form); setPanel(null); toast("Details saved"); }}>Save</Btn>
        </div>
      </Sheet>
      <Sheet open={panel === "payment"} onClose={() => setPanel(null)} title="Payment methods">
        <Card className="flex items-center gap-3 p-4"><CreditCard className="text-green" /><span className="flex-1 font-semibold">{id.card}</span><span className="text-[13px] text-mute">Default</span></Card>
        {s.ext.cards.map((c) => <Card key={c} className="mt-2 flex items-center gap-3 p-4" data-testid={`card-saved-${c.replace(/ /g, "-")}`}><CreditCard className="text-green" /><span className="flex-1 font-semibold">{c}</span></Card>)}
        <Btn variant="outline" className="mt-3 w-full" data-testid="button-add-card" onClick={() => nav("/app/account/cards/new")}>Add card</Btn>
        <p className="mt-3 text-[14px] text-mute">Cards are saved by Stripe, never by St Lu Taxi And Tours. Online payment only, no cash.</p>
        <Btn variant="outline" className="mt-4 w-full" data-testid="button-close-payment-methods" onClick={() => setPanel(null)}>Done</Btn>
      </Sheet>
      <Sheet open={panel === "places"} onClose={() => setPanel(null)} title="Saved places">
        {id.places.map((p) => (
          <div key={p} className="flex min-h-12 items-center gap-3 border-b border-line"><MapPin size={18} className="text-green" /><span className="flex-1">{p}</span>
            <button aria-label="Remove" className="inline-flex h-12 w-12 items-center justify-center" onClick={() => actions.setIdentity({ places: id.places.filter((x) => x !== p) })}><X size={18} className="text-mute" /></button></div>
        ))}
        <div className="mt-3 flex gap-2"><input aria-label="Add a place" className={inputCls} placeholder="Add a place" value={place} onChange={(e) => setPlace(e.target.value)} />
          <Btn onClick={() => { if (place) { actions.setIdentity({ places: [...id.places, place] }); setPlace(""); } }}>Add</Btn></div>
      </Sheet>
      <Sheet open={panel === "help"} onClose={() => setPanel(null)} title="Help and FAQ">
        {[["Is the price fixed?", "Yes. Prices are in USD per vehicle, no surge and no hidden fees."], ["How do I pay?", "Online by card through Stripe. We do not accept cash."], ["Can I cancel?", "Free cancellation more than 24 hours before pickup with an automatic full refund. Inside 24 hours the dispatcher reviews."], ["My flight is late", "We track your flight number and adjust the pickup."]].map(([q, a]) => (
          <details key={q} className="border-b border-line py-1"><summary className="flex min-h-12 cursor-pointer items-center font-semibold">{q}</summary><p className="mt-2 text-[14px] text-mute">{a}</p></details>
        ))}
      </Sheet>
    </Screen>
  );
}
