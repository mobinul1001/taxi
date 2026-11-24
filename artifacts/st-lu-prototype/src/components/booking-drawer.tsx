import { useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Mail, MessageCircle, Phone, UserPlus } from "lucide-react";
import { Btn, Card, Drawer, Modal, Pill, StatusPill, inputCls } from "./kit";
import { Row, RouteBlock } from "./bits";
import { AssignModal } from "./assign-modal";
import { CancelBookingModal, ChangeStatusModal } from "./admin-modals";
import { actions, toast, useAppState } from "@/lib/store";
import { driverLabel, money, pickupLabel, STATUS_LABEL } from "@/lib/format";
import type { Status } from "@/lib/types";

export const payTone = (p: string) => (p === "Paid" ? "ok" : p === "Refunded" ? "err" : p === "Review" ? "warn" : "info") as "ok" | "err" | "warn" | "info";

export function BookingDrawer({ refId, onClose }: { refId: string | null; onClose: () => void }) {
  const s = useAppState();
  const b = s.bookings.find((x) => x.ref === refId);
  const [assign, setAssign] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [refund, setRefund] = useState(false);
  const [msg, setMsg] = useState(false);
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState<Status | null>(null);
  if (!b) return null;
  const d = s.drivers.find((x) => x.id === b.driverId);
  const terminal = b.status === "completed" || b.status === "cancelled";
  return (
    <Drawer open onClose={onClose} width={560}>
      <div className="border-b border-line bg-paper px-6 pb-5 pt-6">
        <p className="text-[13px] text-mute">Booking</p>
        <div className="flex flex-wrap items-center gap-3"><h2 className="text-[26px] font-bold" data-testid="text-drawer-ref">{b.ref}</h2><StatusPill status={b.status} /><Pill tone={payTone(b.payment)}>{b.payment}</Pill></div>
        <p className="text-[14px] text-mute">Source: {b.source}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn size="sm" disabled={terminal} data-testid="button-drawer-assign" onClick={() => setAssign(true)}><UserPlus size={15} />{b.driverId ? "Reassign driver" : "Assign driver"}</Btn>
          <select aria-label="Change status" data-testid="select-status" value={b.status} onChange={(e) => setPending(e.target.value as Status)} className="h-9 rounded-md border border-line-strong bg-paper px-2 text-[13px] font-semibold">
            {(Object.keys(STATUS_LABEL) as Status[]).filter((x) => x !== "cancelled").map((x) => <option key={x} value={x}>{STATUS_LABEL[x]}</option>)}
          </select>
          <Btn size="sm" variant="outline" disabled={terminal} data-testid="button-drawer-cancel" onClick={() => setCancel(true)}>Cancel</Btn>
          <Btn size="sm" variant="outline" disabled={b.payment === "Refunded" || b.payment === "Refund processing"} onClick={() => { setAmount(String(b.total)); setRefund(true); }}><CreditCard size={15} />Refund</Btn>
          <Btn size="sm" variant="soft" onClick={() => setMsg(true)}><MessageCircle size={15} />Message passenger</Btn>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-6">
        <Card className="p-4">
          <p className="mb-2 font-display font-bold">Trip</p>
          <p className="font-semibold">{b.service} · {pickupLabel(b.pickup)}</p>
          <RouteBlock className="mt-3" from={b.from} to={b.to} />
          <div className="mt-3 border-t border-line">
            <Row label="Passengers / bags" value={`${b.pax} / ${b.bags}`} />{b.flight && <Row label="Flight" value={b.flight} />}{b.returnTrip && <Row label="Return" value={`${pickupLabel(`${b.returnTrip.date}T${b.returnTrip.time}`)} · ${b.returnTrip.pickup}${b.returnTrip.flight ? ` · ${b.returnTrip.flight}` : ""}`} />}{b.note && <Row label="Note" value={b.note} />}
            <Row label="Driver" value={d ? <Link className="text-green underline" to={`/admin/drivers/${d.id}`}>{driverLabel(d)}{b.accepted ? " · accepted" : " · awaiting accept"}</Link> : "Unassigned"} />
            {d?.type === "Outside" && <Row label="Job link" value={<a className="text-green underline" href={`${import.meta.env.BASE_URL}job/${b.token}`} target="_blank" rel="noreferrer">/job/{b.token}</a>} />}
          </div>
        </Card>
        <Card className="p-4">
          <p className="mb-2 font-display font-bold">Passenger</p>
          <p className="font-semibold">{b.passenger}</p>
          <p className="flex items-center gap-2 text-[14px] text-mute"><Phone size={14} />{b.phone}</p>
          <p className="flex items-center gap-2 text-[14px] text-mute"><Mail size={14} />{b.email}</p>
        </Card>
        <Card className="px-4 py-2">
          <p className="pt-2 font-display font-bold">Payment</p>
          <Row label="Fixed fare" value={money(b.base)} />{b.childSeat && <Row label="Child seat" value={money(5)} />}{b.extraStop && <Row label="Extra stop" value={money(8)} />}{b.night && <Row label="Night pickup" value={money(10)} />}
          <Row label="Total (Stripe)" value={money(b.total)} strong /><Row label="Stripe payment ID" value={<code className="text-[12px]">{b.stripeId}</code>} /><Row label="Driver payout" value={money(b.payout)} />
        </Card>
        <Card className="p-4">
          <p className="mb-3 font-display font-bold">Status timeline</p>
          <ol className="relative ml-2 border-l-2 border-line">
            {b.timeline.map((t, i) => <li key={i} className="mb-3 ml-4"><span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full bg-green" /><p className="text-[14px] font-semibold">{t.text}</p><p className="text-[12px] text-mute">{t.at}</p></li>)}
          </ol>
        </Card>
        <Card className="p-4">
          <p className="mb-2 font-display font-bold">Notification log</p>
          {b.log.length === 0 && <p className="text-[14px] text-mute">No messages sent yet.</p>}
          {b.log.map((l, i) => (
            <div key={i} className="flex items-start justify-between gap-3 border-b border-line py-2 last:border-0">
              <div><p className="text-[14px]">{l.text}</p><p className="text-[12px] text-mute">To {l.to} · {l.at}</p></div>
              <div className="flex gap-1">{(l.channels ?? []).map((c) => <Pill key={c} tone="neutral">{c}</Pill>)}</div>
            </div>
          ))}
        </Card>
        {b.rating && <Card className="p-4"><p className="font-display font-bold">Passenger rating</p><p className="text-[14px]">{b.rating.stars} stars · {b.rating.tags.join(", ")}</p>{b.rating.comment && <p className="text-[14px] text-mute">"{b.rating.comment}"</p>}</Card>}
      </div>

      <AssignModal booking={assign ? b : null} onClose={() => setAssign(false)} />
      <CancelBookingModal key={`c-${b.ref}-${cancel}`} b={b} open={cancel} onClose={() => setCancel(false)} />
      {pending && <ChangeStatusModal key={pending} b={b} initial={pending} onClose={() => setPending(null)} onCancelChosen={() => setCancel(true)} />}
      <Modal open={refund} onClose={() => setRefund(false)} title="Refund">
        <h3 className="font-display text-[22px] font-bold">Refund through Stripe</h3>
        <label className="mt-3 block text-[13px] font-semibold">Amount (USD)</label>
        <input className={inputCls} type="number" step="0.01" max={b.total} value={amount} onChange={(e) => setAmount(e.target.value)} />
        <input className={inputCls + " mt-3"} placeholder="Reason, for example flight cancelled" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="mt-4 flex justify-end gap-2"><Btn variant="outline" onClick={() => setRefund(false)}>Close</Btn><Btn onClick={() => { const n = Math.min(Number(amount) || 0, b.total); if (n <= 0) return toast("Enter an amount", "err"); actions.refund(b.ref, n, reason); setRefund(false); toast(`Refund of ${money(n)} issued`); }}>Issue refund</Btn></div>
      </Modal>
      <Modal open={msg} onClose={() => setMsg(false)} title="Message passenger">
        <h3 className="font-display text-[22px] font-bold">Message {b.passenger}</h3>
        <p className="text-[14px] text-mute">In the real app this goes to {b.phone} by SMS and WhatsApp. Nothing is sent in this demo.</p>
        <textarea className={inputCls + " mt-3 h-28 py-3"} value={text} onChange={(e) => setText(e.target.value)} placeholder="Your driver will meet you at Arrivals with a name sign." />
        <div className="mt-4 flex justify-end gap-2"><Btn variant="outline" onClick={() => setMsg(false)}>Close</Btn><Btn onClick={() => { if (!text.trim()) return; actions.message(b.ref, text.trim()); setText(""); setMsg(false); toast("Message sent by SMS and WhatsApp"); }}>Send</Btn></div>
      </Modal>
    </Drawer>
  );
}
