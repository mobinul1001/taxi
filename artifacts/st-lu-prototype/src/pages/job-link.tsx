import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, MapPin, MessageCircle, Phone } from "lucide-react";
import { MapView } from "@/components/map";
import { placeFrom } from "@/lib/geo";
import { Btn, Card, Logo, ProgressSteps, StartLink } from "@/components/kit";
import { NotifiedBanner, Row, RouteBlock } from "@/components/bits";
import { actions, extActions, NOTIFIED, toast, useAppState } from "@/lib/store";
import { dayLabel, money, routeShort, short, time, pickupSpot } from "@/lib/format";
import { LABELS, nextLabel, stepOf } from "./app/driver-progress";
import { cn } from "@/lib/utils";

const JOB_WRAP = "mx-auto w-full max-w-[520px] px-5";

/** Every job-link state gets the same shape: the job itself, and the road it is about. */
function JobLayout({ from, to, progress = 0.3, refName, className, children }: {
  from: string; to: string; progress?: number; refName: string; className?: string; children: ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-0 [@media(min-width:1000px)]:grid-cols-[minmax(0,520px)_minmax(420px,1fr)] [@media(min-width:1000px)]:px-6 [@media(min-width:1000px)]:py-6">
      <div className={cn(JOB_WRAP, "py-6 [@media(min-width:1000px)]:mx-0 [@media(min-width:1000px)]:px-0", className)}>{children}</div>
      <div className="job-map mx-5 mb-6 overflow-hidden rounded-2xl border border-line [@media(min-width:1000px)]:mx-0 [@media(min-width:1000px)]:mb-0">
        <MapView from={placeFrom(from)} to={placeFrom(to)} progress={progress} focus="trip" fitAll labels zoom
          caption={null} insets={{ top: 24, bottom: 24, left: 24, right: 24 }} ariaLabel={`Map of job ${refName}`} />
      </div>
    </div>
  );
}

export default function JobLink() {
  const { token } = useParams();
  const s = useAppState();
  const b = s.bookings.find((x) => x.token === token || x.ref.toLowerCase() === token?.toLowerCase());
  const d = s.drivers.find((x) => x.id === b?.driverId);
  const [notified, setNotified] = useState(false);
  const head = (sub: string) => (
    <header className="bg-hero flex flex-wrap items-center gap-x-3 gap-y-2 rounded-b-2xl px-5 py-5 text-white">
      <Logo size="sm" /><div className="min-w-0 flex-1"><p className="font-display font-bold">St Lu Taxi &amp; Tours</p><p className="text-[13px] text-white/80">{sub}</p></div>
      {/* this page stands in for an SMS a driver taps: it has no app navigation, so it needs its own way back */}
      <StartLink tone="dark" label="Start" className="ml-auto" />
    </header>
  );
  const upd = b && token ? s.ext.jobUpdates[b.token] : undefined;
  if (b && upd && !upd.accepted && b.status !== "cancelled" && b.status !== "completed") return (
    <div className="bar-clear flex min-h-[100dvh] flex-col bg-ground">{head("Job link · updated by dispatcher")}
      <JobLayout from={b.from} to={b.to} refName={b.ref}>
        <h1 className="text-[28px] font-bold">Your job was updated</h1>
        <Card className="mt-4 px-4 py-1" data-testid="card-job-updated">
          <Row label="Reference" value={b.ref} strong />
          <Row label="Pickup time" value={<span><s className="mr-1.5 font-normal text-mute" data-testid="text-old-time">{upd.oldTime}</s><span className="text-green" data-testid="text-new-time">{upd.newTime}</span></span>} strong />
          <Row label="Reason" value={upd.reason} strong />
          <Row label="Pickup" value={short(b.from) === "UVF" ? "Hewanorra (UVF)" : b.from} strong />
          <Row label="Drop-off" value={b.to} strong />
          <Row label="Payout" value={<span className="text-green">{money(b.payout)}</span>} strong />
        </Card>
        <Btn variant="orange" className="mt-5 min-h-14 w-full text-[17px]" data-testid="button-accept-updated-job" onClick={() => { extActions.acceptJobUpdate(b.token); toast("Updated job accepted. Dispatcher notified"); }}>Accept updated job</Btn>
      </JobLayout>
    </div>
  );
  if (!b || !d) return (
    <div className="bar-clear min-h-[100dvh] bg-ground">{head("Job link · no login, no app needed")}
      <div className="mx-auto max-w-md p-6 text-center"><h1 className="mt-10 text-[24px] font-bold">This job link is not active</h1><p className="mt-2 text-mute">The job may have been reassigned or closed. Call the dispatcher on {s.settings.phones[0]}.</p>
        <p className="mt-6 text-[13px] text-mute">Demo link: <Link className="font-semibold text-green" to="/job/job-slu-48298">/job/job-slu-48298</Link></p></div></div>
  );
  const step = stepOf(b);
  const label = nextLabel(b);
  const tel = b.phone.replace(/[^\d+]/g, "");
  const wrap = "mx-auto w-full max-w-[520px] px-5";
  if (b.status === "completed") return (
    <div className="bar-clear min-h-[100dvh] bg-ground">{head(`Job ${b.ref} · completed`)}
      <JobLayout from={b.from} to={b.to} progress={1} refName={b.ref} className="text-center">
        <div className="anim-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green text-white shadow-[0_0_0_10px_var(--color-ok)]"><Check size={36} strokeWidth={3} /></div>
        <h1 className="mt-4 text-[28px] font-bold">Job completed</h1><p className="text-mute">You arrived at {b.to}. The job closed automatically.</p>
        <Card className="mt-5 p-5"><p className="text-mute">Payout</p><p className="font-display text-[44px] font-bold text-green">{money(b.payout)}</p></Card>
        <Card className="mt-3 px-4 py-1 text-left"><Row label="Route" value={routeShort(b)} /><Row label="Duration" value="52 min · 27 km" /><Row label="Passenger" value={b.passenger} /></Card>
        <p className="mt-4 text-[14px] text-mute">Thank you. This link is now closed. Dispatcher will confirm payment.</p>
      </JobLayout>
    </div>
  );
  if (b.status === "cancelled") return <div className="bar-clear min-h-[100dvh] bg-ground">{head(`Job ${b.ref}`)}<p className={wrap + " py-10 text-center"}>This job was cancelled by the dispatcher.</p></div>;
  if (!b.accepted) return (
    <div className="bar-clear min-h-[100dvh] bg-ground">{head("Job link · no login, no app needed")}
      <JobLayout from={b.from} to={b.to} refName={b.ref}>
        <p className="text-[14px] text-mute">Hi {d.name.split(" ")[0]},</p>
        <h1 className="text-[28px] font-bold">New job assigned to you</h1>
        <Card className="mt-4 p-4">
          <div className="mb-3 flex justify-between border-b border-line pb-3"><span className="text-mute">Reference</span><b>{b.ref}</b></div>
          <RouteBlock from={pickupSpot(b.from)} to={b.to} fromLabel={`Pickup · ${dayLabel(b.pickup)}, ${time(b.pickup)}`} toLabel="Drop-off" />
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.from + ", St Lucia")}`} target="_blank" rel="noreferrer" className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ok font-semibold text-green"><MapPin size={18} /> Open in Google Maps</a>
        </Card>
        <Card className="mt-3 px-4 py-1">
          <Row label="Passenger" value={b.passenger} /><Row label="Phone" value={b.phone} />{b.flight && <Row label="Flight" value={b.flight} />}
          <Row label="Passengers / bags" value={`${b.pax}/${b.bags}`} />{b.note && <Row label="Note" value={b.note} />}<Row label="Your payout" value={money(b.payout)} strong />
        </Card>
        <Btn variant="orange" className="mt-5 min-h-14 w-full text-[17px]" data-testid="button-accept-job" onClick={() => { actions.accept(b.ref); toast("Job accepted. Dispatcher notified"); }}>Accept job</Btn>
        <p className="mt-3 text-center text-[13px] text-mute">Sent to you by SMS and WhatsApp by the dispatcher.</p>
      </JobLayout>
    </div>
  );
  const buttons = ["On my way", "I have arrived at pickup", "Passenger onboard", "Heading to destination"];
  const legNow = step === 0 ? "to-pickup" as const : step === 1 ? "at-pickup" as const : "onboard" as const;
  return (
    <div className="bar-clear min-h-[100dvh] bg-ground">{head(`Job ${b.ref} · accepted`)}
      {/* wide screens: the job on the left, the road on the right, so no empty desk */}
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-0 [@media(min-width:1000px)]:grid-cols-[minmax(0,520px)_minmax(420px,1fr)] [@media(min-width:1000px)]:px-6 [@media(min-width:1000px)]:py-6">
      <div className={wrap + " py-6 [@media(min-width:1000px)]:mx-0 [@media(min-width:1000px)]:px-0"}>
        <ProgressSteps labels={LABELS} current={step} />
        <h1 className="mt-5 text-[24px] font-bold">{step === 3 ? `Heading to ${b.to}` : step === 2 ? "Passenger onboard" : step === 1 ? "Next: passenger onboard" : step === 0 ? "Next: arrive at pickup" : "Next: head to pickup"}</h1>
        <p className="text-mute">{pickupSpot(b.from)} · {dayLabel(b.pickup)}, {time(b.pickup)}</p>
        <Card className="mt-4 p-4">
          <div className="flex justify-between"><b>{b.passenger}</b><span className="text-mute">{b.pax} pax · {b.bags} bags</span></div>
          {/* under 400px: Call and WhatsApp share a row and Maps takes its own, so no label is squeezed */}
          <div className="mt-3 grid grid-cols-2 gap-2 min-[400px]:grid-cols-3">
            <a href={`tel:${tel}`} className="tap flex min-h-14 items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-green text-[14px] font-semibold"><Phone size={16} className="shrink-0" />Call</a>
            <a href={`https://wa.me/${tel.replace("+", "")}`} target="_blank" rel="noreferrer" className="tap flex min-h-14 items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-green text-[14px] font-semibold"><MessageCircle size={16} className="shrink-0" />WhatsApp</a>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((step >= 2 ? b.to : b.from) + ", St Lucia")}`} target="_blank" rel="noreferrer" className="tap col-span-2 flex min-h-14 items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-green text-[14px] font-semibold min-[400px]:col-span-1"><MapPin size={16} className="shrink-0" />Maps</a>
          </div>
        </Card>
        <div className="mt-4 flex flex-col gap-2">
          {buttons.map((t, i) => {
            const isNext = t === label;
            const done = i <= step;
            return (
              <Btn key={t} variant={isNext ? "primary" : "outline"} disabled={!isNext} data-testid={`button-step-${i}`}
                className={cn("min-h-[52px] w-full text-[16px]", done && "!opacity-60")} onClick={() => { actions.advance(b.ref); setNotified(true); toast(NOTIFIED); }}>
                {done && <Check size={18} />}{t}
              </Btn>
            );
          })}
        </div>
        {step === 3 && <p className="mt-3 rounded-2xl bg-info p-3 text-[14px] text-info-ink">The job closes automatically when you reach {b.to}. No complete button needed.</p>}
        {(notified || step >= 0) && <div className="mt-3"><NotifiedBanner text={NOTIFIED} /></div>}
      </div>
      {/* below 1000px the map is a full-width 16:10 picture under the content; above, a tall column beside it */}
      <div className="job-map mx-5 mb-6 overflow-hidden rounded-2xl border border-line [@media(min-width:1000px)]:mx-0 [@media(min-width:1000px)]:mb-0">
        <MapView from={placeFrom(b.from)} to={placeFrom(b.to)} progress={step >= 2 ? 0.6 : step === 1 ? 1 : 0.3}
          focus="trip" fitAll labels zoom caption={null} insets={{ top: 24, bottom: 24, left: 24, right: 24 }}
          ariaLabel={`Map of job ${b.ref}`} />
      </div>
      </div>
    </div>
  );
}
