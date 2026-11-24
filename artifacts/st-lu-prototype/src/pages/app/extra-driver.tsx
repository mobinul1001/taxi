import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bell, Calendar, Car, Check, FileText, ShieldCheck, Upload } from "lucide-react";
import { Btn, Card, Empty, Pill, ScreenHead, inputCls } from "@/components/kit";
import { Screen } from "@/components/mobile";
import { Row } from "@/components/bits";
import { extActions, toast } from "@/lib/store";
import { dayLabel, docState, isToday, longDate, money, routeShort, time } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Booking } from "@/lib/types";
import { useDriver } from "./driver";

const FILE = { name: "insurance-2027.pdf", size: "1.2 MB" };

/* Page 13 */
export function TripChanged() {
  const { id } = useParams();
  const { s } = useDriver();
  const nav = useNavigate();
  const b = s.bookings.find((x) => x.ref === id);
  const ch = (id && s.ext.changes[id]) || (b && s.ext.jobUpdates[b.token] ? { oldTime: s.ext.jobUpdates[b.token].oldTime, oldPax: b.pax } : undefined);
  return (
    <div className="flex h-full flex-col bg-green px-5 text-white">
      <div className="no-scrollbar flex-1 overflow-y-auto pt-[clamp(20px,6vh,60px)] text-center">
        <span className="anim-pop inline-flex h-[84px] w-[84px] items-center justify-center rounded-full bg-orange text-orange-ink"><Bell size={38} /></span>
        <h1 className="mt-4 text-[32px] font-bold">Trip changed</h1>
        <p className="mt-1 text-[16px] text-white/85">Updated by the dispatcher · SMS and WhatsApp sent</p>
        {b ? (
          <div className="anim-rise mt-6 rounded-2xl bg-white p-5 text-left text-ink" data-testid="card-trip-changed">
            <p className="font-display text-[20px] font-bold">{b.service} · {b.ref}</p>
            <p className="text-[14px] text-mute">{dayLabel(b.pickup)}</p>
            <div className="mt-3 border-t border-line">
              <Row label="Pickup time" value={<span>{ch && ch.oldTime !== time(b.pickup) && <s className="mr-1.5 font-normal text-mute">{ch.oldTime}</s>}<span className="text-green" data-testid="text-changed-time">{time(b.pickup)}</span></span>} strong />
              <Row label="Pickup place" value={b.from} strong />
              <Row label="Passengers" value={<span>{ch && ch.oldPax !== b.pax && <s className="mr-1.5 font-normal text-mute">{ch.oldPax}</s>}<span className={ch && ch.oldPax !== b.pax ? "text-green" : ""}>{b.pax}</span></span>} strong />
              <Row label="Your payout" value={money(b.payout)} strong />
            </div>
          </div>
        ) : <p className="mt-6 text-white/85">This trip is no longer assigned to you.</p>}
      </div>
      <div className="shrink-0 pb-6 pt-3">
        <Btn variant="orange" className="min-h-14 w-full text-[17px]" data-testid="button-got-it" onClick={() => nav("/app/driver/alerts")}>Got it</Btn>
      </div>
    </div>
  );
}

/* Page 14 */
export function RenewInsurance() {
  const { s, d } = useDriver();
  const nav = useNavigate();
  if (!d) return null;
  const r = s.ext.renewals[d.id] ?? { policy: "", expiry: "", note: "", sent: false };
  const st = docState(d.insuranceExp);
  const send = () => {
    if (!r.policy || !r.expiry) return toast("Add the new policy number and expiry date", "err");
    if (!r.file) return toast("Upload the policy document", "err");
    extActions.sendRenewal(d.id);
    toast("Renewal sent to the dispatcher");
    nav("/app/driver/profile");
  };
  return (
    <Screen className="px-5" footer={<Btn className="min-h-14 w-full text-[17px]" data-testid="button-send-renewal" onClick={send}>Send to dispatcher</Btn>}>
      <div className="-mx-5"><ScreenHead title="Renew insurance" sub={st.tone === "err" ? "Expired" : `Expires in ${st.days} days`} back="/app/driver/profile" /></div>
      <div className="flex gap-3 rounded-2xl bg-warn p-4 text-[15px] text-warn-ink"><ShieldCheck size={20} className="shrink-0" /><p>Your insurance ends on {longDate(d.insuranceExp)}. Send the renewed policy to the dispatcher before then.</p></div>
      {r.sent && <p className="mt-3 rounded-2xl bg-ok p-3 text-[14px] text-green" data-testid="text-renewal-sent">Sent to dispatcher. You can send an update at any time.</p>}
      <label className="mt-4 block text-[14px] font-semibold text-mute">New policy number</label>
      <div className="relative mt-2"><FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink" />
        <input data-testid="input-policy" aria-label="New policy number" className={inputCls + " h-[52px] pl-11 text-[16px]"} placeholder="INS-2027-55812" value={r.policy} onChange={(e) => extActions.setRenewal(d.id, { policy: e.target.value })} /></div>
      <label className="mt-4 block text-[14px] font-semibold text-mute">New expiry date</label>
      <div className="relative mt-2"><Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink" />
        <input type="date" data-testid="input-policy-expiry" aria-label="New expiry date" className={inputCls + " h-[52px] pl-11 text-[16px]"} value={r.expiry} onChange={(e) => extActions.setRenewal(d.id, { expiry: e.target.value })} /></div>
      <label className="mt-4 block text-[14px] font-semibold text-mute">Policy document</label>
      <button data-testid="button-upload-policy" onClick={() => nav("/app/driver/renew/upload")} className="mb-4 mt-2 flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-line-strong bg-white/40 px-4 py-6 text-center">
        <Upload size={24} className="text-ink" />
        <span className="mt-2 font-semibold">Upload photo or PDF</span>
        <span className="text-[14px] text-mute" data-testid="text-policy-file">{r.file ? `${r.file} · ${FILE.size}` : "PDF, JPG or PNG, up to 10 MB"}</span>
      </button>
    </Screen>
  );
}

/* Page 16 */
export function RenewUpload() {
  const { s, d } = useDriver();
  const nav = useNavigate();
  const saved = d ? s.ext.renewals[d.id] : undefined;
  const [file, setFile] = useState<string | undefined>(saved?.file);
  const [note, setNote] = useState(saved?.note ?? "");
  if (!d) return null;
  const st = docState(d.insuranceExp);
  return (
    <Screen className="px-5" footer={<Btn className="min-h-14 w-full text-[17px]" data-testid="button-send-upload" onClick={() => {
      if (!file) return toast("Choose a file first", "err");
      extActions.setRenewal(d.id, { file, note });
      toast("File attached");
      nav("/app/driver/renew");
    }}>Send to dispatcher</Btn>}>
      <div className="-mx-5"><ScreenHead title="Send renewal" sub={`Insurance · ${d.plate}`} back="/app/driver/renew" /></div>
      <p className="rounded-2xl bg-warn p-3 text-center text-[14px] text-warn-ink">Insurance expires in {st.days} days ({longDate(d.insuranceExp)}).</p>
      <button data-testid="button-choose-file" onClick={() => setFile(FILE.name)} className="mt-4 flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-line-strong bg-white/40 px-4 py-8 text-center">
        <Upload size={26} />
        <span className="mt-2 font-semibold">Take a photo or choose a file</span>
        <span className="text-[14px] text-mute">PDF, JPG or PNG, up to 10 MB</span>
      </button>
      {file && (
        <Card className="anim-rise mt-3 flex items-center gap-3 p-3" data-testid="chip-file">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-ok text-green"><FileText size={20} /></span>
          <div className="flex-1"><p className="font-semibold">{file}</p><p className="text-[13px] text-mute">{FILE.size}</p></div>
          <Pill tone="ok"><Check size={12} className="mr-1" />Ready</Pill>
        </Card>
      )}
      <label className="mt-4 block text-[14px] font-semibold text-mute">Note for dispatcher</label>
      <textarea data-testid="input-renewal-note" aria-label="Note for dispatcher" className={inputCls + " mb-4 mt-2 h-24 py-3"} placeholder="Renewed with the same insurer for 12 months." value={note} onChange={(e) => setNote(e.target.value)} />
    </Screen>
  );
}

/* Page 15 */
export function DriverAllTrips() {
  const { mine } = useDriver();
  const [tab, setTab] = useState<"up" | "done">("up");
  const up = mine.filter((b) => !["completed", "cancelled"].includes(b.status));
  const done = mine.filter((b) => b.status === "completed").sort((a, b) => b.pickup.localeCompare(a.pickup));
  const list = tab === "up" ? up : done;
  const groups = list.reduce<Record<string, Booking[]>>((acc, b) => { const k = b.pickup.slice(0, 10); (acc[k] ||= []).push(b); return acc; }, {});
  return (
    <Screen tabs="driver" className="px-5">
      <div className="-mx-5"><ScreenHead title="My trips" back="/app/driver/jobs" /></div>
      <div className="grid grid-cols-2 rounded-lg bg-neutral p-1">
        {(["up", "done"] as const).map((t) => <button key={t} data-testid={`tab-driver-${t}`} onClick={() => setTab(t)} className={cn("min-h-12 rounded-md text-[15px] font-semibold", tab === t ? "bg-white shadow-e1" : "text-mute")}>{t === "up" ? "Upcoming" : "Completed"}</button>)}
      </div>
      {list.length === 0 && <Empty icon={<Car />} title={tab === "up" ? "No upcoming trips" : "No completed trips yet"} body="Trips appear here after the dispatcher assigns them." />}
      {Object.entries(groups).map(([day, items]) => (
        <div key={day}>
          <p className="mb-2 mt-5 text-[13px] font-semibold uppercase tracking-wider text-mute">{isToday(day) ? `Today · ${dayLabel(day)}` : dayLabel(day)}</p>
          {items.map((b) => {
            const label = b.status === "completed" ? "Completed" : b.accepted ? "Accepted" : "Pending accept";
            return (
              <Link key={b.ref} to={b.status === "completed" ? `/app/driver/trips/${b.ref}/done` : `/app/driver/trips/${b.ref}`} data-testid={`row-driver-trip-${b.ref}`} className="mt-2 block rounded-xl border border-line/80 bg-white shadow-card p-4">
                <div className="flex items-center justify-between"><b className="font-display text-[18px]">{time(b.pickup)}</b><Pill tone={label === "Pending accept" ? "warn" : label === "Completed" ? "neutral" : "ok"}>{label}</Pill></div>
                <p className="mt-1 text-[15px]">{b.service} · {b.to === "Island loop" ? "Island loop" : routeShort(b)}</p>
                <div className="mt-2 flex justify-between border-t border-line pt-2 text-[14px]"><span className="text-mute">Payout</span><span className="font-bold">{money(b.payout)}</span></div>
              </Link>
            );
          })}
        </div>
      ))}
      <div className="h-6" />
    </Screen>
  );
}
