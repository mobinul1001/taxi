import { useState } from "react";
import { CheckCircle2, Trash2 } from "lucide-react";
import { AutoTextarea, Btn, Card, inputCls, Pill } from "@/components/kit";
import { actions, toast, useAppState } from "@/lib/store";
import { DisconnectStripeModal } from "@/components/admin-modals";
import type { Settings as S, TeamUser } from "@/lib/types";

const VARS = ["{passenger}", "{ref}", "{service}", "{date}", "{time}", "{pickup}", "{dropoff}", "{driver}", "{vehicle}", "{plate}", "{amount}", "{payout}", "{link}", "{flight}"];

export function Settings() {
  const s = useAppState();
  const [f, setF] = useState<S>(s.settings);
  const [user, setUser] = useState<{ name: string; email: string; role: TeamUser["role"] }>({ name: "", email: "", role: "Dispatcher" });
  const [disc, setDisc] = useState(false);
  const save = () => { actions.setSettings(f); toast("Settings saved"); };
  const tpl = (id: string, k: "sms" | "whatsapp", v: string) => setF({ ...f, templates: f.templates.map((t) => (t.id === id ? { ...t, [k]: v } : t)) });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between"><h2 className="font-display text-[20px] font-bold">Company and messaging</h2><Btn data-testid="button-save-settings" onClick={save}>Save changes</Btn></div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-2">
        <Card className="p-5 max-[339px]:p-4"><h3 className="font-bold">Company profile</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label><span className="text-[13px] font-semibold text-mute">Company</span><input className={inputCls} value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} /></label>
            <label><span className="text-[13px] font-semibold text-mute">Manager</span><input className={inputCls} value={f.manager} onChange={(e) => setF({ ...f, manager: e.target.value })} /></label>
            <label className="sm:col-span-2"><span className="text-[13px] font-semibold text-mute">Address</span><AutoTextarea rows={1} aria-label="Address" className={inputCls + " h-auto min-h-[48px] !resize-none py-3 leading-snug"} value={f.address} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} onChange={(v) => setF({ ...f, address: v.replace(/\n/g, " ") })} /></label>
            {f.phones.map((p, i) => <label key={i}><span className="text-[13px] font-semibold text-mute">Phone {i + 1}</span><input className={inputCls} value={p} onChange={(e) => setF({ ...f, phones: f.phones.map((x, j) => (j === i ? e.target.value : x)) })} /></label>)}
            <label><span className="text-[13px] font-semibold text-mute">Website</span><input className={inputCls + " max-[339px]:px-2.5"} value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></label>
          </div>
        </Card>
        <div className="flex flex-col gap-4">
          <Card className="p-5"><h3 className="font-bold">Reminder timing</h3>
            <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-3 max-[319px]:grid-cols-1">
              <label><span className="text-[13px] font-semibold text-mute">Passenger reminder</span><select className={inputCls} value={f.passengerReminderHours} onChange={(e) => setF({ ...f, passengerReminderHours: Number(e.target.value) })}>{[12, 24, 48].map((n) => <option key={n} value={n}>{n} hours before</option>)}</select></label>
              <label><span className="text-[13px] font-semibold text-mute">Driver reminder</span><select className={inputCls} value={f.driverReminderMinutes} onChange={(e) => setF({ ...f, driverReminderMinutes: Number(e.target.value) })}>{[60, 90, 120].map((n) => <option key={n} value={n}>{n === 90 ? "1 hour 30 minutes" : `${n / 60} hours`} before</option>)}</select></label>
              <label><span className="text-[13px] font-semibold text-mute">Document expiry</span><select className={inputCls} value={f.docReminderDays} onChange={(e) => setF({ ...f, docReminderDays: Number(e.target.value) })}>{[14, 30, 60].map((n) => <option key={n} value={n}>{n} days before</option>)}</select></label>
            </div></Card>
          <Card className="p-5"><h3 className="font-bold">Stripe</h3>
            <div className="mt-3 flex flex-wrap items-center gap-3">{f.stripeConnected ? <Pill tone="ok"><CheckCircle2 size={14} className="mr-1" />Connected</Pill> : <Pill tone="err">Not connected</Pill>}<span className="text-[14px] text-mute">{f.stripeAccount} · USD · card payments only, no cash</span>
              <Btn size="sm" variant="outline" className="ml-auto" data-testid="button-stripe-toggle" onClick={() => { if (f.stripeConnected) return setDisc(true); setF({ ...f, stripeConnected: true }); toast("Stripe connected (demo)"); }}>{f.stripeConnected ? "Disconnect" : "Connect Stripe"}</Btn></div>
            <DisconnectStripeModal open={disc} onClose={() => setDisc(false)} onConfirm={() => { setF({ ...f, stripeConnected: false }); actions.setSettings({ stripeConnected: false }); toast("Stripe disconnected"); }} /></Card>
        </div>
      </div>
      <Card className="p-5">
        <h3 className="font-bold">SMS and WhatsApp templates</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">{VARS.map((v) => <code key={v} className="rounded-md bg-aground px-2 py-1 text-[12px] text-green">{v}</code>)}</div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {f.templates.map((t) => (
            <div key={t.id} className="rounded-lg border border-line p-3">
              <p className="text-[14px] font-semibold">{t.name} <span className="font-normal text-mute">· {t.group}</span></p>
              <label className="mt-2 block text-[12px] font-semibold text-mute">SMS</label><AutoTextarea aria-label={`${t.name} SMS`} className={inputCls + " h-auto min-h-16 py-2 text-[13px] leading-snug"} value={t.sms} onChange={(v) => tpl(t.id, "sms", v)} />
              <label className="mt-2 block text-[12px] font-semibold text-mute">WhatsApp</label><AutoTextarea aria-label={`${t.name} WhatsApp`} className={inputCls + " h-auto min-h-16 py-2 text-[13px] leading-snug"} value={t.whatsapp} onChange={(v) => tpl(t.id, "whatsapp", v)} />
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <h3 className="font-bold">Team users</h3>
        {f.team.map((u) => (
          // On a narrow phone the name, the role picker and the remove button cannot share one line:
          // the name column collapsed to about 47px and broke a word per line. Below 480 the name takes
          // the full width and the controls sit under it.
          <div key={u.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line py-3 last:border-0">
            <div className="min-w-full flex-1 min-[480px]:min-w-0"><p className="font-semibold">{u.name}</p><p className="truncate text-[13px] text-mute">{u.email}</p></div>
            <select aria-label="Role" className="h-11 min-w-0 flex-1 rounded-md border border-line-strong bg-paper pl-3 text-[13px] font-semibold min-[480px]:flex-none min-[480px]:shrink-0" value={u.role} onChange={(e) => setF({ ...f, team: f.team.map((x) => (x.id === u.id ? { ...x, role: e.target.value as TeamUser["role"] } : x)) })}><option>Admin</option><option>Dispatcher</option></select>
            <button aria-label="Remove user" disabled={f.team.length === 1} onClick={() => setF({ ...f, team: f.team.filter((x) => x.id !== u.id) })} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-err hover:bg-err-tint disabled:opacity-30"><Trash2 size={18} /></button>
          </div>
        ))}
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_160px_auto]">
          <input aria-label="New user name" className={inputCls} placeholder="Name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
          <input aria-label="New user email" type="email" className={inputCls} placeholder="Email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
          <select aria-label="New user role" className={inputCls} value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value as TeamUser["role"] })}><option>Dispatcher</option><option>Admin</option></select>
          <Btn onClick={() => { if (!user.name || !user.email.includes("@")) return toast("Add name and email", "err"); setF({ ...f, team: [...f.team, { ...user, id: "u" + Date.now() }] }); setUser({ name: "", email: "", role: "Dispatcher" }); toast("Invite ready. Save changes to send"); }}>Add user</Btn>
        </div>
      </Card>
    </div>
  );
}
