import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Copy, FileText, LogOut, ShieldCheck, TriangleAlert } from "lucide-react";
import { Btn, Modal, Pill, inputCls } from "./kit";
import { actions, safeStore, toast, useAppState } from "@/lib/store";
import { shareUrl } from "@/lib/config";
import { hoursUntil, money, STATUS_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Booking, Status } from "@/lib/types";

const Check2 = ({ on, onChange, label, testid }: { on: boolean; onChange: (v: boolean) => void; label: string; testid: string }) => (
  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
    <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} data-testid={testid} className="h-5 w-5 accent-[#0F6B3E]" />{label}
  </label>
);
const Head = ({ title, sub }: { title: string; sub: string }) => (
  <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-display text-[22px] font-bold">{title}</h3><p className="text-[13px] text-mute">{sub}</p></div>
);

/* Page 19 */
const REASONS = ["Passenger asked to cancel", "Flight cancelled", "Duplicate booking", "No driver available", "Other"];
export function CancelBookingModal({ b, open, onClose }: { b: Booking; open: boolean; onClose: () => void }) {
  const s = useAppState();
  const [reason, setReason] = useState(REASONS[0]);
  const [np, setNp] = useState(true);
  const [nd, setNd] = useState(true);
  const auto = hoursUntil(b.pickup) > s.settings.policyHours;
  const h = s.settings.policyHours;
  return (
    <Modal open={open} onClose={onClose} title="Cancel booking?" className="max-w-[460px]">
      <Head title="Cancel booking?" sub={`${b.ref} · ${b.passenger}`} />
      <label className="mt-4 block text-[13px] font-semibold text-mute">Reason</label>
      <select data-testid="select-cancel-reason" className={inputCls + " mt-1"} value={reason} onChange={(e) => setReason(e.target.value)}>{REASONS.map((r) => <option key={r}>{r}</option>)}</select>
      <p className={cn("mt-3 flex gap-2 rounded-xl p-3 text-[14px]", auto ? "bg-ok text-green" : "bg-warn text-warn-ink")} data-testid="text-cancel-notice">
        {auto ? <ShieldCheck size={16} className="mt-0.5 shrink-0" /> : <TriangleAlert size={16} className="mt-0.5 shrink-0" />}
        {auto ? `Pickup is more than ${h} hours away: automatic full refund of ${money(b.total)} through Stripe.` : `Pickup is within ${h} hours: no automatic refund. The cancellation goes to dispatcher review in Refunds.`}
      </p>
      <div className="mt-3">
        <Check2 on={np} onChange={setNp} label="Notify passenger by SMS and WhatsApp" testid="checkbox-notify-passenger" />
        <Check2 on={nd} onChange={setNd} label="Notify assigned driver" testid="checkbox-notify-driver" />
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Btn variant="outline" data-testid="button-keep-booking" onClick={onClose}>Keep booking</Btn>
        <Btn variant="danger" data-testid="button-confirm-admin-cancel" onClick={() => {
          actions.cancel(b.ref, reason, "dispatcher", { notifyPassenger: np, notifyDriver: nd });
          onClose();
          toast(auto ? `${b.ref} cancelled. Refund of ${money(b.total)} sent through Stripe` : `${b.ref} cancelled and sent to review in Refunds`);
        }}>{auto ? `Cancel and refund ${money(b.total)}` : "Cancel and send to review"}</Btn>
      </div>
    </Modal>
  );
}

/* Page 20 */
export function ChangeStatusModal({ b, initial, onClose, onCancelChosen }: { b: Booking; initial: Status | null; onClose: () => void; onCancelChosen: () => void }) {
  const [sel, setSel] = useState<Status>(initial ?? b.status);
  const [notify, setNotify] = useState(true);
  if (!initial) return null;
  return (
    <Modal open onClose={onClose} title="Change status" className="max-w-[440px]">
      <Head title="Change status" sub={`${b.ref} · ${b.passenger}`} />
      <div className="mt-4 flex flex-col gap-1.5">
        {(Object.keys(STATUS_LABEL) as Status[]).map((x) => (
          <label key={x} data-testid={`radio-status-${x}`} className={cn("flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 text-[15px]", sel === x ? "border-green bg-ok/50" : "border-line")}>
            <input type="radio" name="status" checked={sel === x} onChange={() => setSel(x)} className="h-4 w-4 accent-[#0F6B3E]" />{STATUS_LABEL[x]}{x === b.status && <span className="ml-auto text-[12px] text-mute">Current</span>}
          </label>
        ))}
      </div>
      <div className="mt-3"><Check2 on={notify} onChange={setNotify} label="Notify passenger and driver by SMS and WhatsApp" testid="checkbox-notify-status" /></div>
      <div className="mt-4 flex justify-end gap-2">
        <Btn variant="outline" data-testid="button-cancel-status" onClick={onClose}>Cancel</Btn>
        <Btn data-testid="button-update-status" onClick={() => {
          if (sel === b.status) return onClose();
          if (sel === "cancelled") { onClose(); return onCancelChosen(); }
          actions.setStatus(b.ref, sel, notify); onClose();
          toast(`Status changed to ${STATUS_LABEL[sel]}${notify ? ". Passenger and driver notified" : ""}`);
        }}>Update status</Btn>
      </div>
    </Modal>
  );
}

/* Page 22 */
export function JobLinkSentModal({ sent, onDone }: { sent: { ref: string; driverId: string } | null; onDone: () => void }) {
  const s = useAppState();
  const b = s.bookings.find((x) => x.ref === sent?.ref);
  const d = s.drivers.find((x) => x.id === sent?.driverId);
  if (!sent || !b || !d) return null;
  const path = `/job/${b.token}`;
  // The build serves a hash router, so a link without the "#" lands on the host's 404 instead of the job.
  const full = shareUrl(path);
  const copy = async () => { try { await navigator.clipboard.writeText(full); toast("Job link copied"); } catch { toast("Copy failed: " + full, "info"); } };
  return (
    <Modal open onClose={onDone} title="Job link sent" className="max-w-[460px]">
      <Head title="Job link sent" sub={`${b.ref} · ${d.name} (outside)`} />
      <p className="mt-4 flex items-center gap-2 rounded-xl bg-ok p-3 text-[14px] text-green"><Check size={16} />In the real app this goes to {d.phone} by SMS and WhatsApp. Nothing is sent in this demo — no app or login needed to open it.</p>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-line p-3">
        <div className="min-w-0 flex-1"><p className="text-[12px] text-mute">Job link</p><a href={full} target="_blank" rel="noreferrer" data-testid="link-job-sent" className="block truncate font-semibold text-ink underline-offset-2 hover:underline">{path}</a></div>
        <button aria-label="Copy job link" data-testid="button-copy-job-link" onClick={copy} className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line"><Copy size={16} /></button>
      </div>
      <div className="mt-3 rounded-lg border border-line p-3"><p className="text-[12px] text-mute">Status</p>
        <Pill tone={b.accepted ? "ok" : "warn"} className="mt-1">{b.accepted ? "Accepted by the driver" : "Waiting for the driver to accept"}</Pill></div>
      <p className="mt-3 text-[13px] text-mute">A reminder goes out 1 hour 30 minutes before pickup. The link expires after the trip.</p>
      <div className="mt-4 flex justify-end gap-2">
        <Btn variant="outline" data-testid="button-resend-link" onClick={() => toast(`Job link resent to ${d.name} by SMS and WhatsApp`)}>Resend link</Btn>
        <Btn variant="orange" data-testid="button-job-link-done" onClick={onDone}>Done</Btn>
      </div>
    </Modal>
  );
}

/* Page 21 */
export function DisconnectStripeModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  const [text, setText] = useState("");
  const close = () => { setText(""); onClose(); };
  return (
    <Modal open={open} onClose={close} title="Disconnect Stripe?" className="max-w-[480px]">
      <Head title="Disconnect Stripe?" sub="Settings" />
      <p className="mt-3 text-[14px] text-mute">Passengers will not be able to pay or receive automatic refunds until Stripe is connected again. Existing bookings are not affected.</p>
      <label className="mt-4 block text-[13px] font-semibold text-mute">Type DISCONNECT to confirm</label>
      <input data-testid="input-disconnect-confirm" autoComplete="off" className={inputCls + " mt-1"} value={text} onChange={(e) => setText(e.target.value)} placeholder="DISCONNECT" />
      <div className="mt-4 flex justify-end gap-2">
        <Btn variant="outline" data-testid="button-keep-connected" onClick={close}>Keep connected</Btn>
        <Btn variant="danger" disabled={text !== "DISCONNECT"} data-testid="button-confirm-disconnect" onClick={() => { onConfirm(); setText(""); onClose(); }}>Disconnect Stripe</Btn>
      </div>
    </Modal>
  );
}

/* Page 23 */
export const ADMIN_USER = { name: "Samuel Green", role: "Admin", email: "samuel@stluciantaxiandtours.com" };
export function AdminAccountMenu({ open, onClose, placement }: { open: boolean; onClose: () => void; placement: "top" | "sidebar" }) {
  const nav = useNavigate();
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      {open && (
        <>
          <div className="fixed inset-0 z-[45]" onClick={onClose} />
          <div data-testid={`menu-account-${placement}`} className={cn("anim-pop fixed z-[46] w-[290px] rounded-xl border border-line/80 bg-paper p-1.5 text-ink shadow-e4", placement === "top" ? "right-4 top-[72px] md:right-7" : "bottom-20 left-3")}>
            <div className="border-b border-line px-3 py-2.5"><p className="font-semibold">{ADMIN_USER.name}</p><p className="text-[13px] text-mute">{ADMIN_USER.role} · {ADMIN_USER.email}</p></div>
            <button data-testid="menu-settings" onClick={() => { onClose(); nav("/admin/settings"); }} className="flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 text-[14px] hover:bg-aground"><FileText size={16} />Settings</button>
            <button data-testid="menu-logout" onClick={() => { onClose(); setConfirm(true); }} className="flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 text-[14px] font-semibold text-err hover:bg-err-tint/50"><LogOut size={16} />Log out</button>
          </div>
        </>
      )}
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Log out of the admin panel?" className="max-w-[440px]">
        <Head title="Log out of the admin panel?" sub={ADMIN_USER.name} />
        <p className="mt-3 text-[14px] text-mute">You will need to sign in again to manage bookings, drivers and refunds. Trips already assigned are not affected.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="outline" data-testid="button-stay-signed-in" onClick={() => setConfirm(false)}>Stay signed in</Btn>
          <Btn variant="danger" data-testid="button-confirm-admin-logout" onClick={() => { safeStore.remove("session", "stlu-admin"); setConfirm(false); nav("/admin/login"); }}>Log out</Btn>
        </div>
      </Modal>
    </>
  );
}
