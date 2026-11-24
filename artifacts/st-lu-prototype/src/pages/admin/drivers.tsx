import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Car, FileImage, Plus, Search, Upload, KeyRound, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Avatar, Btn, Card, DocPill, Empty, Modal, Pill, StatusPill, Switch, inputCls } from "@/components/kit";
import { useOpenBooking } from "@/components/admin-shell";
import { useBoxWidth } from "@/components/mobile";
import { actions, toast, useAppState } from "@/lib/store";
import { dayLabel, driverDocs, longDate, money, routeShort, time, worstDoc } from "@/lib/format";
import type { Driver } from "@/lib/types";
import { Face, SampleNote } from "@/components/photo";
import { driverFace } from "@/assets/media";

const sel = "h-11 shrink-0 max-w-full rounded-md border border-line-strong bg-paper pl-3 text-[13.5px] font-semibold outline-none transition hover:border-mute/60 focus:border-green focus:ring-4 focus:ring-green/15";
const blank = (taken: string[] = []): Driver => {
  let id = "";
  do { id = "DRV-" + (200 + Math.floor(Math.random() * 700)); } while (taken.includes(id));
  return {
    id, name: "", type: "In-house", phone: "", email: "", tempPassword: "", vehicle: "", color: "", year: new Date().getFullYear() - 4, plate: "", seats: 7,
    rating: 5, trips: 0, tripsMonth: 0, licenceNo: "", licenceExp: "", insuranceNo: "", insuranceExp: "", regExp: "", reminderDays: 30, remindSms: true, remindWhatsApp: true,
  };
};

export function Drivers() {
  const s = useAppState();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [docs, setDocs] = useState("all");
  const [edit, setEdit] = useState<Driver | null>(null);
  const [del, setDel] = useState<Driver | null>(null);
  const [box, w] = useBoxWidth();
  const table = w >= 720;   // Driver, Type, Plate, Documents, Actions need about 700px
  const rows = useMemo(() => s.drivers.filter((d) => (!q || (d.name + d.plate + d.vehicle).toLowerCase().includes(q.toLowerCase())) && (type === "all" || d.type === type) && (docs === "all" || worstDoc(d).tone === docs)), [s, q, type, docs]);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1 md:max-w-[300px]"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" /><input aria-label="Search drivers" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${s.drivers.length} drivers`} className="h-11 w-full rounded-md border border-line-strong bg-paper pl-10 pr-3 text-[14px] outline-none transition placeholder:text-faint focus:border-green focus:ring-4 focus:ring-green/15" /></div>
        <select className={sel} value={type} onChange={(e) => setType(e.target.value)} aria-label="Type"><option value="all">Type: All</option><option>In-house</option><option>Outside</option></select>
        <select className={sel} value={docs} onChange={(e) => setDocs(e.target.value)} aria-label="Documents"><option value="all">Documents: All</option><option value="ok">Valid</option><option value="warn">Expires within 30 days</option><option value="err">Expired</option></select>
        <Btn className="ml-auto" data-testid="button-add-driver" onClick={() => setEdit(blank(s.drivers.map((x) => x.id)))}><Plus size={18} />Add driver</Btn>
      </div>
      <SampleNote className="mt-2.5" />
      <div ref={box} className="mt-2">
      <Card className="overflow-hidden">
        {!table ? (
          <ul className="divide-y divide-line">
            {rows.map((d) => {
              const w2 = worstDoc(d);
              return (
                <li key={d.id}>
                  <div data-testid={`row-driver-${d.id}`} role="button" tabIndex={0} onClick={() => nav(`/admin/drivers/${d.id}`)} onKeyDown={(e) => { if (e.key === "Enter") nav(`/admin/drivers/${d.id}`); }} className="tap block cursor-pointer px-4 py-3.5 hover:bg-aground">
                    <div className="flex items-start gap-3">
                      <Face slot={driverFace(d.id)} size={40} />
                      <div className="min-w-0 flex-1"><p className="text-[15px] font-bold leading-tight">{d.name}</p>{d.unavailable && <p className="text-[12.5px] font-semibold text-err">Unavailable</p>}<p className="mt-0.5 text-[13.5px] leading-snug text-mute">{d.vehicle} &middot; {d.plate}</p></div>
                      <Pill tone={d.type === "Outside" ? "info" : "ok"}>{d.type}</Pill>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-mute">
                      <DocPill tone={w2.tone} label={w2.label} /><span className="whitespace-nowrap">{d.rating} &#9733;</span><span className="whitespace-nowrap">{d.tripsMonth} trips this month</span><span className="whitespace-nowrap">{d.seats} seats</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                      <button className="tap min-h-11 rounded-md border border-line bg-paper px-3 text-[13.5px] font-semibold text-ink hover:border-green/60" onClick={() => setEdit(d)}>Edit</button>
                      <button className="tap min-h-11 rounded-md border border-line bg-paper px-3 text-[13.5px] font-semibold text-err hover:bg-err-tint" onClick={() => setDel(d)}>Delete</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
        <table className="w-full text-[14px]">
          <thead><tr className="border-b border-line bg-aground text-left text-[12px] uppercase tracking-wider text-mute">{["Driver", "Type", ...(w >= 1240 ? ["Phone"] : []), ...(w >= 860 ? ["Vehicle"] : []), "Plate", ...(w >= 1080 ? ["Seats", "Rating", "Trips this month"] : []), "Documents", "Actions"].map((h) => <th key={h} className="whitespace-nowrap px-3.5 py-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((d) => {
              const w2 = worstDoc(d);
              return (
                <tr key={d.id} data-testid={`row-driver-${d.id}`} onClick={() => nav(`/admin/drivers/${d.id}`)} className="cursor-pointer border-b border-line last:border-0 hover:bg-aground">
                  <td className="px-3.5 py-3"><div className="flex items-center gap-3"><Face slot={driverFace(d.id)} size={36} /><div><b>{d.name}</b>{d.unavailable && <p className="text-[12px] font-semibold text-err">Unavailable</p>}</div></div></td>
                  <td className="px-3.5"><Pill tone={d.type === "Outside" ? "info" : "ok"}>{d.type}</Pill></td>{w >= 1240 && <td className="whitespace-nowrap px-3.5">{d.phone}</td>}{w >= 860 && <td className="px-3.5">{d.vehicle}</td>}<td className="whitespace-nowrap px-3.5">{d.plate}</td>
                  {w >= 1080 && <><td className="px-3.5">{d.seats}</td><td className="whitespace-nowrap px-3.5">{d.rating} &#9733;</td><td className="px-3.5">{d.tripsMonth}</td></>}<td className="px-3.5"><DocPill tone={w2.tone} label={w2.label} /></td>
                  <td className="whitespace-nowrap px-3.5" onClick={(e) => e.stopPropagation()}><span className="inline-flex gap-1.5"><button className="tap min-h-11 min-w-11 rounded-md border border-line bg-paper px-3 text-[13px] font-semibold text-ink hover:border-green/60" onClick={() => setEdit(d)}>Edit</button><button className="tap min-h-11 min-w-11 rounded-md px-3 text-[13px] font-semibold text-err hover:bg-err-tint" onClick={() => setDel(d)}>Delete</button></span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
        {rows.length === 0 && <Empty icon={<Car />} title="No drivers match" body="Change the filters or add a driver." />}
      </Card>
      </div>
      <p className="mt-3 text-[13px] text-mute">Document reminders go to the admin and the driver 30 days before expiry. Only admin can mark a driver unavailable.</p>
      {edit && <DriverForm driver={edit} onClose={() => setEdit(null)} />}
      <Modal open={!!del} onClose={() => setDel(null)} title="Delete driver">
        <h3 className="font-display text-[22px] font-bold">Delete {del?.name}?</h3>
        <p className="mt-2 text-[14px] text-mute">Upcoming trips that are not yet accepted go back to Pending to assign.</p>
        <div className="mt-4 flex justify-end gap-2"><Btn variant="outline" onClick={() => setDel(null)}>Keep</Btn><Btn variant="danger" onClick={() => { actions.deleteDriver(del!.id); toast(`${del!.name} deleted`); setDel(null); }}>Delete driver</Btn></div>
      </Modal>
    </div>
  );
}

function F({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={wide ? "sm:col-span-2" : ""}><span className="mb-1 block text-[13px] font-semibold text-mute">{label}</span>{children}</label>;
}

export function DriverForm({ driver, onClose }: { driver: Driver; onClose: () => void }) {
  const s = useAppState();
  const isNew = !s.drivers.some((d) => d.id === driver.id);
  const [d, setD] = useState<Driver>(driver);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const set = <K extends keyof Driver>(k: K, v: Driver[K]) => setD({ ...d, [k]: v });
  const upload = (key: "licence" | "insurance" | "registration", file?: File) => {
    if (!file) return;
    setPreviews({ ...previews, [key]: URL.createObjectURL(file) });
    setD({ ...d, uploads: { ...d.uploads, [key]: file.name } });
  };
  return (
    <Modal open onClose={onClose} title="Driver" className="max-w-[760px]">
      <h3 className="font-display text-[22px] font-bold">{isNew ? "Add driver" : `Edit ${driver.name}`}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <F label="Full name"><input data-testid="input-driver-name" placeholder="e.g. Marcus Joseph" className={inputCls} value={d.name} onChange={(e) => set("name", e.target.value)} /></F>
        <F label="Type"><select className={inputCls} value={d.type} onChange={(e) => set("type", e.target.value as Driver["type"])}><option>In-house</option><option>Outside</option></select></F>
        <F label="Phone (SMS and WhatsApp)"><input type="tel" placeholder="+1 758 555 0100" className={inputCls} value={d.phone} onChange={(e) => set("phone", e.target.value)} /></F>
        <F label="Email (driver login)"><input type="email" placeholder="driver@stluciantaxiandtours.com" className={inputCls} value={d.email} onChange={(e) => set("email", e.target.value)} /></F>
        {isNew && <F label="Temporary password" wide><input className={inputCls} type="password" autoComplete="new-password" data-testid="input-driver-temp-password" placeholder="At least 6 characters. Sent once by SMS, stored only as a hash" value={d.tempPassword ?? ""} onChange={(e) => set("tempPassword", e.target.value)} /></F>}
        <F label="Vehicle"><input placeholder="e.g. Toyota Noah" className={inputCls} value={d.vehicle} onChange={(e) => set("vehicle", e.target.value)} /></F>
        <F label="Colour and year"><div className="flex gap-2"><input placeholder="Colour" className={inputCls} value={d.color} onChange={(e) => set("color", e.target.value)} /><input type="number" className={inputCls} value={d.year} onChange={(e) => set("year", Number(e.target.value))} /></div></F>
        <F label="Plate"><input placeholder="e.g. VF 4471" className={inputCls} value={d.plate} onChange={(e) => set("plate", e.target.value)} /></F>
        <F label="Seats"><input type="number" min={1} max={20} className={inputCls} value={d.seats} onChange={(e) => set("seats", Number(e.target.value))} /></F>
        <F label="Licence number"><input placeholder="e.g. LC-40211" className={inputCls} value={d.licenceNo} onChange={(e) => set("licenceNo", e.target.value)} /></F>
        <F label="Licence expiry"><input type="date" className={inputCls} value={d.licenceExp} onChange={(e) => set("licenceExp", e.target.value)} /></F>
        <F label="Insurance number"><input placeholder="e.g. INS-7720" className={inputCls} value={d.insuranceNo} onChange={(e) => set("insuranceNo", e.target.value)} /></F>
        <F label="Insurance expiry"><input type="date" className={inputCls} value={d.insuranceExp} onChange={(e) => set("insuranceExp", e.target.value)} /></F>
        <F label="Vehicle registration expiry"><input type="date" className={inputCls} value={d.regExp} onChange={(e) => set("regExp", e.target.value)} /></F>
        <F label="Reminder before expiry"><select className={inputCls} value={d.reminderDays} onChange={(e) => set("reminderDays", Number(e.target.value))}>{[14, 30, 45, 60].map((n) => <option key={n} value={n}>{n} days</option>)}</select></F>
      </div>
      <div className="mt-3 flex flex-wrap gap-6 text-[14px]">
        <span className="flex items-center gap-2"><Switch label="Reminder SMS" on={d.remindSms} onChange={(v) => set("remindSms", v)} /> Reminder by SMS</span>
        <span className="flex items-center gap-2"><Switch label="Reminder WhatsApp" on={d.remindWhatsApp} onChange={(v) => set("remindWhatsApp", v)} /> Reminder by WhatsApp</span>
      </div>
      <p className="mb-2 mt-4 text-[13px] font-semibold text-mute">Document uploads</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {(["licence", "insurance", "registration"] as const).map((k) => (
          <label key={k} className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line-strong p-3 text-center text-[13px] hover:border-green">
            {previews[k] ? <img src={previews[k]} alt={`${k} preview`} className="h-20 w-full rounded-sm object-cover" /> : <Upload size={20} className="text-green" />}
            <span className="font-semibold capitalize">{k}</span><span className="text-mute">{d.uploads?.[k] ?? "Upload photo or PDF"}</span>
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => upload(k, e.target.files?.[0])} />
          </label>
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-2"><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn data-testid="button-save-driver" onClick={() => {
        const email = d.email.trim().toLowerCase();
        if (d.name.trim().length < 2 || !d.vehicle.trim() || !d.plate.trim()) return toast("Name, vehicle and plate are required", "err");
        if (d.phone.replace(/\D/g, "").length < 7 || !/^[\d\s+()-]+$/.test(d.phone)) return toast("Enter a valid phone number for SMS and WhatsApp", "err");
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return toast("Enter a valid login email", "err");
        if (email && s.drivers.some((x) => x.id !== d.id && x.email.toLowerCase() === email)) return toast("Another driver already uses this email", "err");
        if (!(d.seats >= 1 && d.seats <= 20)) return toast("Seats must be between 1 and 20", "err");
        if (!d.licenceExp || !d.insuranceExp || !d.regExp) return toast("Add the licence, insurance and registration expiry dates", "err");
        if (isNew && (d.tempPassword ?? "").length < 6) return toast("Set a temporary password of at least 6 characters", "err");
        const temp = d.tempPassword ?? "";
        // the plain temporary password is hashed by the auth layer and never written to the store
        actions.saveDriver({ ...d, email: d.email || d.name.toLowerCase().replace(/ /g, ".") + "@stluciantaxiandtours.com", tempPassword: undefined });
        if (isNew) void api.auth.setDriverPassword(d.id, temp, true);
        toast(isNew ? `${d.name} added. Login details sent by SMS` : "Driver saved"); onClose();
      }}>{isNew ? "Add driver" : "Save changes"}</Btn></div>
    </Modal>
  );
}

export function DriverDetail() {
  const { id } = useParams();
  const s = useAppState();
  const open = useOpenBooking();
  const d = s.drivers.find((x) => x.id === id);
  const [edit, setEdit] = useState(false);
  const [un, setUn] = useState(false);
  const [reason, setReason] = useState("Vehicle in for service");
  const [preview, setPreview] = useState<string | null>(null);
  const [resetPw, setResetPw] = useState<string | null>(null);
  const [tbox, tw] = useBoxWidth();
  if (!d) return <Card><Empty icon={<Car />} title="Driver not found" body="The driver may have been deleted." action={<Link to="/admin/drivers" className="font-semibold text-green">Back to drivers</Link>} /></Card>;
  const trips = s.bookings.filter((b) => b.driverId === d.id).sort((a, b) => b.pickup.localeCompare(a.pickup));
  const earned = trips.filter((b) => b.status === "completed").reduce((a, b) => a + b.payout, 0);
  return (
    <div>
      <Link to="/admin/drivers" className="mb-3 inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-green hover:underline"><ArrowLeft size={16} />All drivers</Link>
      <Card className="flex flex-wrap items-center gap-4 p-5 max-[479px]:flex-col max-[479px]:items-start max-[479px]:p-4">
        <Face slot={driverFace(d.id)} size={64} />
        <div className="min-w-0 max-[479px]:w-full flex-1"><h2 className="font-display text-[24px] font-bold">{d.name}</h2><p className="text-[14px] text-mute">{d.id} · {d.phone}</p><p className="text-[clamp(12px,3.4vw,14px)] text-mute [overflow-wrap:anywhere]">{d.email}</p>
          <div className="mt-1 flex flex-wrap gap-2"><Pill tone={d.type === "Outside" ? "info" : "ok"}>{d.type}</Pill>{d.unavailable ? <Pill tone="err">Unavailable: {d.unavailable}</Pill> : <Pill tone="ok">Available for dispatch</Pill>}<span data-testid="pill-login-state">{{ demo: <Pill tone="neutral">Login: demo password</Pill>, temporary: <Pill tone="warn">Login: temporary password, not changed yet</Pill>, own: <Pill tone="ok">Login: own password set</Pill> }[api.auth.credentialState(d.id)]}</span></div></div>
        <SampleNote className="w-full" />
        <div className="grid w-full grid-cols-1 gap-2 min-[480px]:grid-cols-2 min-[1500px]:grid-cols-4 [&>button]:w-full [&>button]:justify-center">
          <Btn variant="outline" onClick={() => setEdit(true)}>Edit driver</Btn>
          <Btn variant="outline" data-testid="button-reset-driver-password" onClick={() => setResetPw("")}><KeyRound size={16} />Reset password</Btn>
          <Btn variant="outline" data-testid="button-resend-login" onClick={() => toast(`Login details sent to ${d.phone} by SMS and WhatsApp`)}><Send size={16} />Resend login details</Btn>
          {d.unavailable ? <Btn variant="soft" onClick={() => { actions.setUnavailable(d.id, undefined); toast(`${d.name} is available again`); }}>Mark available</Btn>
            : <Btn variant="danger" data-testid="button-mark-unavailable" onClick={() => setUn(true)}>Mark unavailable</Btn>}
        </div>
      </Card>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="p-5"><p className="font-display font-bold">Vehicle</p><p className="mt-2">{d.vehicle} · {d.color} · {d.year}</p><p className="text-[14px] text-mute">Plate {d.plate} · {d.seats} seats</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center"><div><p className="whitespace-nowrap font-display text-[clamp(17px,5.6vw,22px)] font-bold">{d.rating}</p><p className="text-[12px] text-mute">Rating</p></div><div><p className="whitespace-nowrap font-display text-[clamp(17px,5.6vw,22px)] font-bold">{d.tripsMonth}</p><p className="text-[12px] text-mute">Trips this month</p></div><div><p className="whitespace-nowrap font-display text-[clamp(17px,5.6vw,22px)] font-bold">{money(earned)}</p><p className="text-[12px] text-mute">Payouts</p></div></div></Card>
        <Card className="p-5 xl:col-span-2">
          <p className="font-display font-bold">Documents</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {driverDocs(d).map((doc) => (
              <button key={doc.key} onClick={() => setPreview(doc.key)} className="rounded-lg border border-line p-3 text-left hover:border-green">
                <div className="flex h-24 items-center justify-center rounded-md bg-aground"><FileImage className="text-green" /></div>
                <p className="mt-2 font-semibold">{doc.name}</p><p className="text-[13px] text-mute">No. {doc.no} · until {longDate(doc.exp)}</p>
                <div className="mt-2"><DocPill tone={doc.tone} label={doc.label} /></div>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[13px] text-mute">Reminder {d.reminderDays} days before expiry by {[d.remindSms && "SMS", d.remindWhatsApp && "WhatsApp"].filter(Boolean).join(" and ") || "in-app only"} to the driver and the admin.</p>
        </Card>
      </div>
      <div ref={tbox} className="mt-4">
      <Card className="overflow-hidden">
        <p className="px-5 pt-4 font-display font-bold">Trips</p>
        {tw < 760 ? (
          <ul className="mt-2 divide-y divide-line border-t border-line">{trips.map((b) => (
            <li key={b.ref} onClick={() => open(b.ref)} className="cursor-pointer px-4 py-3.5 hover:bg-aground">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="tnum text-[14px] font-bold">{b.ref}</p><p className="text-[13.5px] text-mute">{routeShort(b)}</p></div><StatusPill status={b.status} /></div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-mute"><span>{b.service}</span><span className="tnum whitespace-nowrap">{dayLabel(b.pickup)} {time(b.pickup)}</span><span className="tnum font-semibold text-ink">{money(b.payout)} payout</span></div>
            </li>))}</ul>
        ) : (
        <table className="w-full text-[14px]"><tbody>
          {trips.map((b) => <tr key={b.ref} onClick={() => open(b.ref)} className="cursor-pointer border-b border-line last:border-0 hover:bg-aground"><td className="px-5 py-3 font-bold">{b.ref}</td><td className="px-2">{b.service}</td><td className="px-2">{routeShort(b)}</td><td className="whitespace-nowrap px-2">{dayLabel(b.pickup)} {time(b.pickup)}</td><td className="px-2">{money(b.payout)}</td><td className="pr-5"><StatusPill status={b.status} /></td></tr>)}
        </tbody></table>
        )}
        {trips.length === 0 && <p className="p-5 text-[14px] text-mute">No trips yet.</p>}
      </Card>
      </div>
      <Modal open={resetPw !== null} onClose={() => setResetPw(null)} title="Reset password" className="max-w-[440px]">
        <h3 className="font-display text-[20px] font-bold">Reset password for {d.name}</h3>
        <p className="mt-1 text-[14px] text-mute">Set a new temporary password. The driver must choose their own at the next login. The old password stops working now.</p>
        <label className="mt-4 block"><span className="mb-1 block text-[13px] font-semibold text-neutral-ink">New temporary password</span>
          <input type="password" autoComplete="new-password" data-testid="input-reset-temp-password" className={inputCls} value={resetPw ?? ""} onChange={(e) => setResetPw(e.target.value)} placeholder="At least 6 characters" /></label>
        <div className="mt-5 flex justify-end gap-2"><Btn variant="outline" onClick={() => setResetPw(null)}>Cancel</Btn>
          <Btn data-testid="button-confirm-reset-password" onClick={async () => { if ((resetPw ?? "").length < 6) return toast("Use at least 6 characters", "err"); await api.auth.setDriverPassword(d.id, resetPw!, true); setResetPw(null); toast(`Temporary password set. Sent to ${d.phone} by SMS`); }}>Set temporary password</Btn></div>
      </Modal>
      {edit && <DriverForm driver={d} onClose={() => setEdit(false)} />}
      <Modal open={un} onClose={() => setUn(false)} title="Mark unavailable">
        <h3 className="font-display text-[22px] font-bold">Mark {d.name} unavailable</h3>
        <p className="text-[14px] text-mute">The driver cannot be assigned until you mark them available. Drivers cannot change this themselves.</p>
        <input className={inputCls + " mt-3"} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" />
        <div className="mt-4 flex justify-end gap-2"><Btn variant="outline" onClick={() => setUn(false)}>Cancel</Btn><Btn variant="danger" onClick={() => { if (!reason.trim()) return toast("Add a reason", "err"); actions.setUnavailable(d.id, reason.trim()); setUn(false); toast(`${d.name} marked unavailable`); }}>Mark unavailable</Btn></div>
      </Modal>
      <Modal open={!!preview} onClose={() => setPreview(null)} title="Document preview">
        {preview && (() => { const doc = driverDocs(d).find((x) => x.key === preview)!; return (
          <div>
            <h3 className="font-display text-[20px] font-bold">{doc.name} · {d.name}</h3>
            <div className="mt-3 rounded-lg border-2 border-green/30 bg-gradient-to-br from-ok to-white p-6">
              <p className="text-[12px] font-bold tracking-widest text-green">SAINT LUCIA · {doc.name.toUpperCase()}</p>
              <div className="mt-4 flex gap-4"><Face slot={driverFace(d.id)} size={64} /><div className="text-[14px]"><p><b>{d.name}</b></p><p>No. {doc.no}</p><p>Expires {longDate(doc.exp)}</p><p>{d.uploads?.[doc.key] ?? "Scanned copy on file"}</p></div></div>
            </div>
            <div className="mt-3 flex items-center justify-between"><DocPill tone={doc.tone} label={doc.label} /><Btn variant="outline" onClick={() => setPreview(null)}>Close</Btn></div>
          </div>); })()}
      </Modal>
    </div>
  );
}
