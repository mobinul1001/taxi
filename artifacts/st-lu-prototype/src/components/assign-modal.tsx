import { useMemo, useState } from "react";
import { Check, MessageCircle, Search } from "lucide-react";
import { Avatar, Btn, Modal, Pill } from "./kit";
import { JobLinkSentModal } from "./admin-modals";
import { actions, toast, useAppState } from "@/lib/store";
import { dayLabel, routeShort, time, worstDoc } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Booking } from "@/lib/types";
import { Face, SampleNote } from "@/components/photo";
import { driverFace } from "@/assets/media";

export function AssignModal({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  const s = useAppState();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [sent, setSent] = useState<{ ref: string; driverId: string } | null>(null);
  const day = booking?.pickup.slice(0, 10);
  const rows = useMemo(() => {
    if (!booking) return [];
    const pt = Number(booking.pickup.slice(11, 13)) * 60 + Number(booking.pickup.slice(14, 16));
    return s.drivers.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()) || d.vehicle.toLowerCase().includes(q.toLowerCase())).map((d) => {
      const same = s.bookings.filter((b) => b.driverId === d.id && b.pickup.startsWith(day!) && b.ref !== booking.ref && b.status !== "cancelled");
      const clash = same.find((b) => { const t = Number(b.pickup.slice(11, 13)) * 60 + Number(b.pickup.slice(14, 16)); return Math.abs(t - pt) < 90; });
      const small = d.seats < booking.pax;
      const expired = worstDoc(d)?.tone === "err";
      return { d, count: same.length, clash, small, expired };
    }).sort((a, b) => Number(!!a.d.unavailable || a.small || a.expired) - Number(!!b.d.unavailable || b.small || b.expired));
  }, [s, q, booking, day]);
  if (!booking) return null;
  if (sent) return <JobLinkSentModal sent={sent} onDone={() => { setSent(null); setSel(null); onClose(); }} />;
  const chosen = s.drivers.find((d) => d.id === sel);
  return (
    <Modal open onClose={onClose} title="Assign driver" className="max-w-[620px]">
      <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-display text-[22px] font-bold">Assign driver</h3><p className="text-[14px] text-mute">{booking.ref} · {routeShort(booking)} · {dayLabel(booking.pickup)} {time(booking.pickup)}</p></div>
      <div className="relative mt-4"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
        <input autoFocus data-testid="input-search-drivers" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${s.drivers.length} drivers`} className="h-12 w-full rounded-md border border-line-strong pl-10 text-[15px] outline-none focus:border-green" /></div>
      <SampleNote className="mt-2" />
      <div className="mt-2 flex max-h-[380px] flex-col gap-2 overflow-y-auto pr-1">
        {rows.map(({ d, count, clash, small, expired }) => (
          <button key={d.id} disabled={!!d.unavailable || small || expired} data-testid={`option-driver-${d.id}`} onClick={() => setSel(d.id)}
            className={cn("flex items-center gap-3 rounded-lg border p-3 text-left transition", sel === d.id ? "border-2 border-green bg-ok/40" : "border-line hover:border-green/40", (d.unavailable || small || expired) && "cursor-not-allowed opacity-55")}>
            <Face slot={driverFace(d.id)} size={40} />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 font-semibold">{d.name}<Pill tone={d.type === "Outside" ? "info" : "ok"}>{d.type}</Pill>{d.unavailable && <Pill tone="err">Unavailable</Pill>}{small && <Pill tone="warn">Too small</Pill>}{expired && <Pill tone="err">Document expired</Pill>}</p>
              <p className="text-[13px] text-mute">{d.vehicle} · {d.seats} seats · {count} {count === 1 ? "trip" : "trips"} today</p>
              {clash && <p className="text-[13px] font-semibold text-err">Already has a trip at {time(clash.pickup)}</p>}
              {d.unavailable && <p className="text-[13px] text-err">{d.unavailable}</p>}
              {small && <p className="text-[13px] text-warn-ink">{d.seats} seats, this booking has {booking.pax} passengers</p>}
              {expired && <p className="text-[13px] text-err">A licence or insurance document has expired</p>}
            </div>
            {sel === d.id && <Check className="text-green" />}
          </button>
        ))}
      </div>
      {chosen?.type === "Outside" && <p className="mt-3 flex items-center gap-2 rounded-md bg-info p-3 text-[14px] text-info-ink"><MessageCircle size={16} />Outside driver selected: a job link will be sent by SMS and WhatsApp.</p>}
      {chosen?.type === "In-house" && <p className="mt-3 rounded-md bg-ok p-3 text-[14px] text-green">The driver gets a new trip alert in the app plus SMS and WhatsApp. Drivers cannot decline.</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn variant="orange" disabled={!chosen || !!chosen.unavailable} data-testid="button-confirm-assign" onClick={() => {
          if (!chosen) return; actions.assign(booking.ref, chosen.id);
          if (chosen.type === "Outside") return setSent({ ref: booking.ref, driverId: chosen.id });
          toast(`${chosen.name} assigned. Alert sent`); onClose();
        }}>{chosen ? `Assign ${chosen.name}` : "Choose a driver"}</Btn>
      </div>
    </Modal>
  );
}
