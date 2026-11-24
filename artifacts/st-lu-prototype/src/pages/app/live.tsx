import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, Check, Download, Star, CalendarDays, MapPin, CircleDot } from "lucide-react";
import { Avatar, BackBtn, Btn, Card, ProgressSteps, Empty } from "@/components/kit";
import { MapView } from "@/components/map";
import { placeFrom } from "@/lib/geo";
import { Screen , useWide } from "@/components/mobile";
import { ContactButtons } from "@/components/bits";
import { actions, toast, useAppState } from "@/lib/store";
import { dayLabel, money, time, pickupSpot, worstDoc } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Face, SampleNote } from "@/components/photo";
import { driverFace } from "@/assets/media";

const STEP = { pending: -1, assigned: -1, on_the_way: 0, at_pickup: 1, onboard: 2, completed: 3, cancelled: -1 } as const;

export function LiveTrip() {
  const { id } = useParams();
  const wide = useWide();
  const s = useAppState();
  const nav = useNavigate();
  const b = s.bookings.find((x) => x.ref === id);
  const d = s.drivers.find((x) => x.id === b?.driverId);
  useEffect(() => { if (b?.status === "completed") nav(`/app/trips/${b.ref}/complete`, { replace: true }); }, [b?.status, b?.ref, nav]);
  if (!b) return <Screen className="p-6"><Empty icon={<CalendarDays />} title="Trip not found" body="It may have been removed by the dispatcher." action={<Link to="/app/trips" className="font-semibold text-green">Back to trips</Link>} /></Screen>;
  const step = STEP[b.status];
  const head = {
    pending: ["Waiting for a driver", "The dispatcher is assigning your driver"],
    assigned: ["Your driver is assigned", `Pickup ${dayLabel(b.pickup)} at ${time(b.pickup)}, ${b.from}`],
    on_the_way: ["Your driver is on the way", `Pickup at ${pickupSpot(b.from)}`],
    at_pickup: ["Your driver is at pickup", `${d?.name.split(" ")[0] ?? "Driver"} is waiting at ${b.from}`],
    onboard: [b.heading ? `Heading to ${b.to}` : "You are onboard", b.heading ? "Arriving soon. Trip completes automatically." : `Next stop ${b.to}`],
    completed: ["You have arrived", ""], cancelled: ["Trip cancelled", ""],
  }[b.status];
  const pill = b.status === "on_the_way" ? "Arriving in 6 min" : b.status === "at_pickup" ? "Driver is here" : b.status === "onboard" ? "ETA 15:22" : b.status === "assigned" ? `Today ${time(b.pickup)}` : "Live";
  const progress = b.status === "on_the_way" ? 0.55 : b.status === "at_pickup" ? 1 : b.status === "onboard" ? (b.heading ? 0.75 : 0.25) : 0.1;
  // the map frames the leg the driver is actually on, not the whole island
  const mapLeg = b.status === "on_the_way" ? "to-pickup" as const : b.status === "at_pickup" ? "at-pickup" as const : b.status === "onboard" ? "onboard" as const : undefined;
  return (
    <div className="relative flex h-full flex-col bg-ground [@media(max-height:400px)]:overflow-y-auto">
      {/* One map per screen. On a desktop the map is the pane on the right, so this screen drops its own
          map and keeps a plain header with the same back button and status pill. */}
      {wide ? (
        <div className="flex shrink-0 items-center gap-3 border-b border-line bg-paper px-5 py-3">
          <BackBtn to={`/app/trips/${b.ref}`} className="" />
          <span className="ml-auto inline-flex min-h-12 items-center gap-2 rounded-full bg-green-night px-4 font-display text-[15px] font-bold text-white shadow-pop" data-testid="text-eta"><i className="relative flex h-2 w-2"><i className="pulse-ring absolute inset-0 rounded-full bg-orange" /><i className="relative h-2 w-2 rounded-full bg-orange" /></i>{pill}</span>
        </div>
      ) : (
        <div className="relative h-[40%] min-h-[200px] shrink-0 overflow-hidden md:h-[48%]">
          <MapView from={placeFrom(b.from)} to={placeFrom(b.to)} progress={progress} caption={null} labels zoom
            focus={mapLeg ? "leg" : "trip"} leg={mapLeg} showCar={!!b.driverId} insets={{ top: 76, bottom: 30, left: 16, right: 16 }} />
          <BackBtn to={`/app/trips/${b.ref}`} className="absolute left-5 top-[clamp(14px,5vh,48px)]" />
          <span className="absolute right-5 top-[clamp(14px,5vh,48px)] inline-flex min-h-12 items-center gap-2 rounded-full bg-green-night px-4 font-display text-[15px] font-bold text-white shadow-pop" data-testid="text-eta"><i className="relative flex h-2 w-2"><i className="pulse-ring absolute inset-0 rounded-full bg-orange" /><i className="relative h-2 w-2 rounded-full bg-orange" /></i>{pill}</span>
        </div>
      )}
      <div className={cn("no-scrollbar relative z-10 flex-1 overflow-y-auto bg-ground px-5 [@media(max-height:400px)]:flex-none [@media(max-height:400px)]:overflow-visible", wide ? "pt-4" : "-mt-6 rounded-t-3xl pt-3 shadow-[0_-16px_36px_-18px_rgba(15,31,24,.4)]")}>
        {!wide && <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-line-strong" />}
        <h1 className="font-display text-[clamp(22px,3.4vh,26px)] font-bold leading-tight" data-testid="text-live-status">{head[0]}</h1>
        <p className="text-[15px] text-mute">{head[1]}</p>
        <Card className="mt-4 px-2 py-3.5"><ProgressSteps labels={["On the way", "At pickup", "Onboard", "Dropped off"]} current={step} /></Card>
        <Card className="mt-3 p-4" data-testid="card-trip-summary">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center pt-1"><CircleDot size={14} className="text-green" /><span className="my-0.5 h-5 w-px bg-line" /><MapPin size={15} className="text-warn-ink" /></div>
            <div className="min-w-0 flex-1 text-[14px]"><p className="font-semibold leading-snug">{b.from}</p><p className="mt-2.5 font-semibold leading-snug">{b.to}</p></div>
            <div className="shrink-0 text-right"><p className="tnum font-display text-[18px] font-bold">{money(b.total)}</p><p className="text-[12px] text-mute">{dayLabel(b.pickup)} {time(b.pickup)}</p></div>
          </div>
        </Card>
        {d ? (
          <Card className="mt-3 p-4">
            <div className="flex items-center gap-3">
              <Face slot={driverFace(d.id)} size={56} />
              <div className="min-w-0 flex-1"><p className="flex items-center gap-1.5 text-[17px] font-semibold leading-tight"><span>{d.name}</span>{worstDoc(d).tone !== "err" && <BadgeCheck size={18} className="shrink-0 text-green" aria-label="Licence and insurance on file" />}</p><p className="text-[13.5px] leading-snug text-mute">{d.vehicle} · {d.color}</p><p className="mt-1 flex flex-wrap items-center gap-1.5 text-[12.5px] font-semibold">{worstDoc(d).tone !== "err" && <span className="rounded-full bg-ok px-2 py-0.5 text-green">Verified</span>}<span className="inline-flex items-center gap-1 rounded-full bg-neutral px-2 py-0.5 text-neutral-ink"><Star size={12} className="fill-orange text-orange" />{d.rating.toFixed(1)}</span></p></div>
              <span className="bg-plate shrink-0 rounded-md border-2 border-ink/80 bg-plate px-2 py-1 font-display text-[14px] font-bold tracking-wide text-ink">{d.plate}</span>
            </div>
            <div className="mt-4"><ContactButtons phone={d.phone} /></div>
            <SampleNote className="mt-2.5" />
          </Card>
        ) : (
          <Card className="mt-3 p-4">
            <p className="font-display text-[16px] font-bold">What happens next</p>
            {["The dispatcher assigns your driver.", "You get the driver, car and plate by SMS and WhatsApp.", "Follow your driver live on this screen."].map((t, i) => (
              <div key={t} className="mt-2.5 flex items-center gap-3 text-[14px]"><span className={cn("inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold", i === 0 ? "bg-green text-white" : "bg-ok text-green")}>{i + 1}</span>{t}</div>
            ))}
          </Card>
        )}
        <p className="mb-6 mt-4 text-center text-[13px] text-mute">SMS and WhatsApp alerts at every step. Next: {step < 0 ? "driver on the way" : step === 0 ? "driver at pickup" : step === 1 ? "onboard" : "trip complete"}</p>
      </div>
    </div>
  );
}

const TAGS = ["Friendly", "Clean car", "Safe driving", "On time"];
export function RateTrip() {
  const { id } = useParams();
  const s = useAppState();
  const nav = useNavigate();
  const b = s.bookings.find((x) => x.ref === id);
  const d = s.drivers.find((x) => x.id === b?.driverId);
  const [stars, setStars] = useState(b?.rating?.stars ?? 0);
  const [tags, setTags] = useState<string[]>(b?.rating?.tags ?? []);
  const [comment, setComment] = useState(b?.rating?.comment ?? "");
  if (!b) return <Screen className="p-6"><Empty icon={<CalendarDays />} title="Trip not found" body="It may have been removed by the dispatcher." action={<Link to="/app/trips" className="font-semibold text-green">Back to trips</Link>} /></Screen>;
  const receipt = () => {
    const txt = [`St Lu Taxi And Tours`, `Receipt ${b.ref}`, `${b.service}`, `${b.from} to ${b.to}`, `${dayLabel(b.pickup)} ${time(b.pickup)}`, `Fixed fare ${money(b.base)}`, b.childSeat ? `Child seat ${money(5)}` : "", `Paid with Stripe ${money(b.total)}`, `Stripe payment ${b.stripeId}`, `Morne Fortune, Castries, St. Lucia · +1 758-732-4553`].filter(Boolean).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain" })); a.download = `receipt-${b.ref}.txt`; a.click();
    toast("Receipt downloaded");
  };
  return (
    <Screen className="px-5 pt-[clamp(20px,6vh,60px)]" footer={
      <div className="flex flex-col gap-2">
        <Btn className="min-h-[52px] text-[16px]" data-testid="button-submit-rating" disabled={b.status !== "completed" || stars === 0} onClick={() => { actions.rate(b.ref, stars, tags, comment); toast(`Thanks. ${d?.name.split(" ")[0] ?? "Your driver"} gets your rating`); nav("/app/trips"); }}>{b.rating ? "Update rating" : stars === 0 ? "Tap a star to rate" : "Submit rating"}</Btn>
        <Btn variant="ghost" onClick={receipt}><Download size={18} /> Download receipt</Btn>
      </div>}>
      <div className="anim-pop mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-green text-white shadow-[0_0_0_10px_var(--color-ok)]"><Check size={36} strokeWidth={3} /></div>
      <h1 className="mt-4 text-center text-[28px] font-bold">{b.status === "completed" ? "You have arrived" : "Trip not finished yet"}</h1>
      <p className="text-center text-[15px] text-mute">{b.status === "completed" ? `Trip completed automatically at ${b.to}.` : "You can rate once the trip completes."}</p>
      <Card className="mt-5 p-4">
        <div className="flex justify-between font-semibold"><span>{b.ref}</span><span>{money(b.total)} paid</span></div>
        <p className="text-[14px] text-mute">{dayLabel(b.pickup).split(" ").slice(0, 3).join(" ")} · {time(b.pickup)} to {b.completedAt ?? "15:22"} · 27 km</p>
      </Card>
      {d && (
        <Card className="mt-3 p-4">
          <div className="flex items-center gap-3"><Face slot={driverFace(d.id)} size={52} /><div><p className="text-[17px] font-semibold">Rate {d.name}</p><p className="text-[14px] text-mute">How was your ride?</p></div></div>
          <div className="mt-4 flex justify-center gap-0.5" role="group" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((n) => <button key={n} aria-label={`${n} stars`} aria-pressed={stars === n} data-testid={`button-star-${n}`} onClick={() => setStars(n)} className="tap inline-flex h-12 w-12 items-center justify-center"><Star size={36} className={cn(n <= stars ? "fill-orange text-orange" : "text-line-strong")} /></button>)}
          </div>
          <p className="mt-1 text-center text-[13px] font-medium text-mute" aria-live="polite">{stars === 0 ? "No rating yet" : ["", "Poor", "Fair", "Good", "Very good", "Excellent"][stars]}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {TAGS.map((t) => { const on = tags.includes(t); return <button key={t} data-testid={`chip-tag-${t.toLowerCase().replace(/ /g, "-")}`} onClick={() => setTags(on ? tags.filter((x) => x !== t) : [...tags, t])} aria-pressed={on} className={cn("tap inline-flex min-h-12 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-2 text-[14px] font-semibold", on ? "border-green bg-ok text-green" : "border-line-strong bg-paper text-neutral-ink")}>{on && <Check size={15} className="shrink-0" />}<span className="truncate">{t}</span></button>; })}
          </div>
          <label htmlFor="rate-comment" className="mt-4 block text-[13px] font-semibold text-neutral-ink">Add a comment (optional)</label>
          <textarea id="rate-comment" className="mt-1 h-20 w-full rounded-md border border-line-strong bg-paper p-3 text-[15px] outline-none focus:border-green focus:ring-4 focus:ring-green/15" placeholder="Great driver, knew the best views on the way." value={comment} onChange={(e) => setComment(e.target.value)} />
        </Card>
      )}
      <div className="h-4" />
    </Screen>
  );
}
