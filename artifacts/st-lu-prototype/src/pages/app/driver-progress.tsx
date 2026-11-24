import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Info, Briefcase } from "lucide-react";
import { BackBtn, Btn, Card, ProgressSteps, Empty } from "@/components/kit";
import { cn } from "@/lib/utils";
import { MapView } from "@/components/map";
import { placeFrom } from "@/lib/geo";
import { Screen , useWide } from "@/components/mobile";
import { ContactButtons, NotifiedBanner, Row } from "@/components/bits";
import { actions, NOTIFIED, toast, useAppState } from "@/lib/store";
import { money, routeShort, time, pickupSpot } from "@/lib/format";
import type { Booking } from "@/lib/types";

export const LABELS = ["On my way", "At pickup", "Onboard", "Heading to destination"];
export const stepOf = (b: Booking) => (b.status === "on_the_way" ? 0 : b.status === "at_pickup" ? 1 : b.status === "onboard" ? (b.heading ? 3 : 2) : b.status === "completed" ? 4 : -1);
export const nextLabel = (b: Booking) =>
  b.status === "assigned" ? "On my way" : b.status === "on_the_way" ? "I have arrived at pickup" : b.status === "at_pickup" ? "Passenger onboard" : b.status === "onboard" && !b.heading ? "Heading to destination" : null;

export function useHeadingProgress(b?: Booking) {
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 500); return () => clearInterval(t); }, []);
  if (!b?.heading || !b.headingAt) return 0.62;
  return Math.min(0.99, 0.62 + ((Date.now() - b.headingAt) / 14000) * 0.38);
}

export function DriverProgress() {
  const { id } = useParams();
  const wide = useWide();
  const s = useAppState();
  const nav = useNavigate();
  const b = s.bookings.find((x) => x.ref === id);
  const [notified, setNotified] = useState(false);
  // Counting +1 a second drifts: a backgrounded tab is throttled to about one tick a minute, so coming
  // back showed a waiting time far short of the real one. Count from a fixed start instead.
  const [waitFrom] = useState(() => Date.now() - 192_000);
  const [wait, setWait] = useState(192);
  const pct = useHeadingProgress(b);
  useEffect(() => { if (b?.status === "completed") nav(`/app/driver/trips/${b.ref}/done`, { replace: true }); }, [b?.status, b?.ref, nav]);
  useEffect(() => {
    if (b?.status !== "at_pickup") return;
    const tick = () => setWait(Math.round((Date.now() - waitFrom) / 1000));
    tick();
    const t = setInterval(tick, 1000);
    const onShow = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onShow);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", onShow); };
  }, [b?.status, waitFrom]);
  if (!b) return <Screen className="p-6"><Empty icon={<Briefcase />} title="Trip not found" body="It may have been reassigned or removed by the dispatcher." action={<Link to="/app/driver/jobs" className="font-semibold text-green">Back to jobs</Link>} /></Screen>;
  const step = stepOf(b);
  const label = nextLabel(b);
  const tap = () => { actions.advance(b.ref); setNotified(true); toast(NOTIFIED); };
  const mapP = step <= 0 ? 0.55 : step === 1 ? 1 : pct;
  const mapLeg = step <= 0 ? "to-pickup" as const : step === 1 ? "at-pickup" as const : "onboard" as const;
  return (
    <div className="relative flex h-full flex-col bg-ground [@media(max-height:400px)]:overflow-y-auto">
      {/* one map per screen: on a desktop the pane on the right is the map, so this is a header */}
      {wide ? (
        <div className="flex shrink-0 items-center gap-3 border-b border-line bg-paper px-5 py-3">
          <BackBtn to={`/app/driver/trips/${b.ref}`} className="" />
          <span className="ml-auto rounded-full bg-ink px-4 py-2.5 text-[15px] font-bold text-white">{step <= 0 ? "Heading to pickup \u00b7 9 min" : step === 1 ? "At pickup" : `ETA 15:22 \u00b7 ${step === 3 ? Math.max(1, Math.round(14 * (1 - pct) * 2.6)) : 14} km left`}</span>
        </div>
      ) : (
        <div className="relative h-[42%] min-h-[180px] shrink-0 overflow-hidden">
          <MapView from={placeFrom(b.from)} to={placeFrom(b.to)} progress={mapP} caption={null} labels zoom
            focus={mapLeg ? "leg" : "trip"} leg={mapLeg} insets={{ top: 76, bottom: 24, left: 16, right: 16 }} />
          <span className="absolute left-[72px] top-14 rounded-full bg-white px-4 py-2.5 text-[16px] font-bold shadow">{step <= 0 ? "Heading to pickup \u00b7 9 min" : step === 1 ? "At pickup" : `ETA 15:22 \u00b7 ${step === 3 ? Math.max(1, Math.round(14 * (1 - pct) * 2.6)) : 14} km left`}</span>
          <BackBtn to={`/app/driver/trips/${b.ref}`} className="absolute left-5 top-14" />
        </div>
      )}
      <div className={cn("no-scrollbar relative flex-1 overflow-y-auto bg-ground px-5 [@media(max-height:400px)]:flex-none [@media(max-height:400px)]:overflow-visible", wide ? "pt-5" : "-mt-8 rounded-t-3xl pt-6 shadow-[0_-18px_40px_-18px_rgba(10,61,43,.45)]")}>
        <ProgressSteps labels={LABELS} current={step} />
        {step <= 0 && (
          <>
            <h1 className="mt-5 text-[26px] font-bold">Go to pickup</h1>
            <p className="text-[15px] text-mute">{pickupSpot(b.from)} · {time(b.pickup)}</p>
            <Card className="mt-4 p-4"><p className="text-[17px] font-semibold">{b.passenger}</p><p className="text-[14px] text-mute">{b.pax} passengers · {b.bags} bags{b.flight ? ` · ${b.flight}` : ""}</p><div className="mt-3"><ContactButtons phone={b.phone} maps={b.from} /></div></Card>
          </>
        )}
        {step === 1 && (
          <>
            <h1 className="mt-5 text-center text-[26px] font-bold">You are at pickup</h1>
            <p className="text-center text-[15px] text-mute">{pickupSpot(b.from)}</p>
            <p className="mt-4 text-center font-display text-[44px] font-bold text-green" data-testid="text-waiting">{String(Math.floor(wait / 60)).padStart(2, "0")}:{String(wait % 60).padStart(2, "0")}</p>
            <p className="text-center text-[14px] text-mute">Waiting time</p>
            <Card className="mt-4 p-4"><p className="text-[17px] font-semibold">{b.passenger}</p><p className="text-[14px] text-mute">{b.pax} passengers · {b.bags} bags{b.note ? ` · ${b.note}` : ""}</p><div className="mt-3"><ContactButtons phone={b.phone} /></div></Card>
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="mt-5 text-[26px] font-bold">Passenger onboard</h1>
            <p className="text-[15px] text-mute">{b.passenger} is onboard. Tap when you set off to {b.to}.</p>
            <Card className="mt-4 p-4"><Row label="Drop-off" value={b.to} /><Row label="Passengers" value={b.pax} /></Card>
          </>
        )}
        {step === 3 && (
          <>
            <h1 className="mt-5 text-[26px] font-bold">Heading to {b.to}</h1>
            <p className="text-[15px] text-mute">{b.passenger} is onboard</p>
            <Card className="mt-4 p-4">
              <div className="flex justify-between text-[15px]"><span className="font-semibold">Trip progress</span><span className="font-bold text-green">{Math.round(pct * 100)}%</span></div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-neutral"><div className="h-full origin-left rounded-full bg-green transition-transform duration-500" style={{ transform: `scaleX(${pct})` }} /></div>
              <div className="mt-2 flex justify-between text-[13px] text-mute"><span>{routeShort(b).split(" to ")[0]}</span><span>{b.to}</span></div>
            </Card>
            <div className="mt-3 flex gap-3 rounded-2xl bg-info p-4 text-[14px] text-info-ink"><Info size={20} className="shrink-0" /><p>No need to tap anything. The trip completes automatically when you reach the destination.</p></div>
          </>
        )}
        {notified && <div className="mt-3"><NotifiedBanner /></div>}
        <div className="h-4" />
      </div>
      <div className="shrink-0 px-5 pb-6 pt-2">
        {/* On the last leg the driver taps nothing: the trip completes itself at the destination, which is what
            the card above says. The old "Demo: simulate arrival" button contradicted that line, repeated the
            start page's "Passenger arrives" card, and put the word "simulate" inside the product. */}
        {label ? <Btn className="min-h-[64px] w-full text-[20px]" data-testid="button-next-status" onClick={tap}>{label}</Btn> : null}
      </div>
    </div>
  );
}

export function DriverDone() {
  const { id } = useParams();
  const s = useAppState();
  const nav = useNavigate();
  const b = s.bookings.find((x) => x.ref === id);
  if (!b) return <Screen className="p-6"><Empty icon={<Briefcase />} title="Trip not found" body="It may have been reassigned or removed by the dispatcher." action={<Link to="/app/driver/jobs" className="font-semibold text-green">Back to jobs</Link>} /></Screen>;
  return (
    <Screen className="px-5 pt-[clamp(20px,6vh,60px)]" footer={<Btn className="min-h-[56px] w-full" data-testid="button-back-jobs" onClick={() => nav("/app/driver/jobs")}>Back to jobs</Btn>}>
      <div className="anim-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green text-white shadow-[0_0_0_10px_var(--color-ok)]"><Check size={36} strokeWidth={3} /></div>
      <h1 className="mt-4 text-center text-[28px] font-bold">You have arrived</h1>
      <p className="text-center text-mute">{b.status === "completed" ? "Trip completed automatically." : "Trip still in progress."}</p>
      <Card className="mt-5 p-5 text-center"><p className="text-mute">You earned</p><p className="font-display text-[44px] font-bold text-green">{money(b.payout)}</p></Card>
      <Card className="mt-3 px-4 py-1">
        <Row label="Trip" value={`${b.ref} · ${b.service}`} /><Row label="Route" value={routeShort(b)} /><Row label="Duration" value="52 min · 27 km" /><Row label="Passenger" value={b.passenger} />
      </Card>
      <div className="mt-3"><NotifiedBanner text="Passenger and dispatcher notified by SMS and WhatsApp: trip dropped off." /></div>
    </Screen>
  );
}
