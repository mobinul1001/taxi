import { Photo } from "@/components/photo";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CarFront, LayoutGrid, Link2, Megaphone, MessageSquare, MonitorSmartphone, PlayCircle, RotateCcw, Smartphone, TabletSmartphone, User } from "lucide-react";
import { Btn, Card, Logo, Modal, ThemeButton } from "@/components/kit";
import { actions, safeStore, setSession, toast, useAppState } from "@/lib/store";

/** Set only for the copy of the prototype inside the agency site (VITE_AGENCY_BACK=1): the page it can return to. */
const AGENCY_BACK: string | null = import.meta.env.VITE_AGENCY_BACK ? "/portfolio/" : null;

export default function Hub() {
  const s = useAppState();
  const nav = useNavigate();
  const [reset, setReset] = useState(false);
  // Sign in as one of the three people in the sample data, straight from here.
  const TRY_AS = [
    { label: "Passenger", name: "Maria Thompson", I: User, go: () => { setSession({ role: "passenger" }); nav("/app/home"); } },
    { label: "Driver", name: "Marcus Joseph", I: CarFront, go: () => { setSession({ role: "driver", driverId: "DRV-007" }); nav("/app/driver/jobs"); } },
    { label: "Admin", name: "Samuel Green", I: MonitorSmartphone, go: () => { safeStore.set("session", "stlu-admin", "1"); nav("/admin"); } },
  ];
  // Each of these makes something real happen, then says where to go and look.
  const outside = s.bookings.find((b) => s.drivers.find((d) => d.id === b.driverId)?.type === "Outside" && !["completed", "cancelled"].includes(b.status));
  const cards = [
    { to: "/app", title: "Mobile App", body: "One app for passengers and for drivers. The login you use decides which one opens.", I: Smartphone, tag: "Passenger + driver" },
    { to: "/admin", title: "Admin Panel", body: "The office side: bookings, giving a trip to a driver, the live map, drivers, prices, refunds and reports. Opens signed in as Samuel Green \u2014 no password needed in the demo.", I: MonitorSmartphone, tag: "Office" },
    { to: "/demo", title: "Guided demo tour", body: "Watch passenger, office and driver side by side, moving through one trip step by step.", I: PlayCircle },
    { to: `/job/${outside?.token ?? "job-slu-48298"}`, title: "Outside driver link", body: "What a driver outside the company gets by SMS. No app, no login: they accept and tap each step.", I: Link2 },
    { to: "/landing", title: "Landing page", body: "The page people reach from a Google ad, with a short booking form.", I: Megaphone },
    { to: "/previews/messages", title: "Messages", body: "Every SMS and WhatsApp the system would send, written out.", I: MessageSquare },
    { to: "/screens", title: "All screens", body: "A list of every screen, grouped by who uses it.", I: LayoutGrid },
    { to: "/lab", title: "Phone and tablet sizes", body: "The same screen on every iPhone, Android and iPad size, side by side.", I: TabletSmartphone },
  ];
  const wrap = "mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10";
  return (
    <div className="bar-clear min-h-[100dvh] bg-ground">
      <header className="on-dark relative overflow-hidden bg-[#140C05] pb-24 text-white dark:bg-[#06120D]">
        <Photo slot="extra-taxi-pitons" fill priority sizes="100vw" scrim="left" />
        <span aria-hidden className="scrim-top pointer-events-none absolute inset-x-0 top-0 h-40" />
        <div className={`${wrap} relative flex min-h-[72px] flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-4`}>
          <Logo />
          <div className="flex flex-wrap items-center gap-3">{AGENCY_BACK && <a href={AGENCY_BACK} data-testid="link-back-agency" className="tap inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 text-[13px] font-semibold text-white hover:bg-white/20"><ArrowLeft size={15} aria-hidden />Back to TaxiAppDevelopment.org</a>}<span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[12.5px] font-semibold"><span className="h-2 w-2 shrink-0 rounded-full bg-orange" /><span className="whitespace-nowrap"><span className="min-[380px]:hidden">Dated Mon 14 Dec 2026</span><span className="max-[379px]:hidden">Everything is dated Mon 14 Dec 2026</span></span></span><ThemeButton className="glass-photo !border-white/30 !text-white !shadow-none" /></div>
        </div>
        <div className={`${wrap} relative mt-[clamp(28px,5vw,64px)]`}>
          <h1 className="t-display max-w-[780px] text-[clamp(32px,5.4vw,60px)]">St Lu Taxi And Tours, <i className="text-hl">the whole ride in one place.</i></h1>
          <p className="mt-4 max-w-[680px] text-[clamp(15px,1.4vw,18px)] leading-relaxed text-white/85">Welcome to the St Lu prototype. Choose who you want to be, then follow the guided tour or try any screen yourself. Nothing here is real: no payments are taken and no messages are sent.</p>
        </div>
      </header>
      <main className={`${wrap} relative -mt-14 pb-28`}>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.slice(0, 2).map(({ to, title, body, I, tag }, i) => (
            <Link key={title} to={to} data-testid={`card-hub-${title.toLowerCase().replace(/ /g, "-")}`} style={{ animationDelay: `${i * 60}ms` }}
              className="anim-rise lift group relative flex min-h-[200px] flex-col overflow-hidden rounded-2xl border border-line bg-paper p-6 shadow-pop">
              <div className="flex items-start justify-between"><span className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${i === 0 ? "bg-green text-white" : "bg-orange text-orange-ink"}`}><I size={26} /></span><span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-mute transition group-hover:border-green group-hover:bg-green group-hover:text-white"><ArrowUpRight size={18} /></span></div>
              <p className="mt-auto pt-6 text-[12px] font-bold uppercase tracking-[.14em] text-green">{tag}</p>
              <h2 className="mt-1 text-[26px] font-bold leading-tight">{title}</h2>
              <p className="mt-1.5 max-w-[46ch] text-[14.5px] leading-relaxed text-mute">{body}</p>
            </Link>
          ))}
        </div>
        <div className="mt-4 grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {cards.slice(2).map(({ to, title, body, I }, i) => (
            <Link key={title} to={to} data-testid={`card-hub-${title.toLowerCase().replace(/ /g, "-")}`} style={{ animationDelay: `${(i + 2) * 60}ms` }}
              className="anim-rise lift group flex flex-col rounded-xl border border-line bg-paper p-5 shadow-card">
              <div className="flex items-center justify-between"><span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-ok text-green"><I size={20} /></span><ArrowUpRight size={18} className="text-mute transition group-hover:text-green" /></div>
              <h2 className="mt-4 text-[17px] font-bold leading-tight">{title}</h2>
              <p className="mt-1 text-[13.5px] leading-snug text-mute">{body}</p>
            </Link>
          ))}
        </div>
        <Card className="mt-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
            <div className="min-w-0">
              <h3 className="font-display text-[20px] font-bold">Sample data</h3>
              <p className="mt-0.5 text-[14px] text-mute">Everything you see is sample data, saved only in this browser.</p>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2 min-[560px]:grid-cols-4">
            {[[s.bookings.length, "bookings"], [s.drivers.length, "drivers"], [s.refunds.length, "refunds"], [s.quotes.length, "quote requests"]].map(([n, l]) => <div key={l as string} className="rounded-lg bg-aground px-3 py-2.5"><dd className="tnum font-display text-[22px] font-bold leading-none">{n}</dd><dt className="mt-1 text-[12.5px] font-medium text-mute">{l}</dt></div>)}
          </dl>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2.5 max-[479px]:flex-col max-[479px]:items-stretch">
            <span className="text-[13.5px] font-semibold">Try as</span>
            {TRY_AS.map(({ label, name, I, go }) => (
              <button key={label} type="button" data-testid={`button-try-as-${label.toLowerCase()}`} onClick={go}
                className="tap inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-paper px-3.5 max-[479px]:w-full text-[13.5px] font-semibold hover:border-green hover:text-green">
                <I size={15} className="shrink-0" />{label}<span className="font-normal text-mute">{name}</span>
              </button>
            ))}
            <Btn variant="outline" className="!border-err/60 !text-err sm:ml-auto max-[479px]:w-full" data-testid="button-reset-demo" onClick={() => setReset(true)}><RotateCcw size={16} />Reset sample data</Btn>
          </div>
        </Card>
        <p className="mt-6 text-center text-[13.5px] text-mute">St Lu is a client project of <Link to="/taxi-app-development-company/" data-testid="link-hub-agency" className="inline-flex min-h-11 items-center font-semibold text-green underline-offset-2 hover:underline">TaxiAppDevelopment.org</Link>, the team that builds taxi apps.</p>
      </main>
      <Modal open={reset} onClose={() => setReset(false)} title="Reset">
        <h3 className="font-display text-[22px] font-bold">Reset sample data?</h3><p className="mt-2 text-[14px] text-mute">This browser goes back to the starting sample data, so anything added or changed here is undone. Anyone signed in here is signed out.</p>
        <div className="mt-4 flex justify-end gap-2"><Btn variant="outline" onClick={() => setReset(false)}>Cancel</Btn><Btn variant="danger" onClick={() => { actions.reset(); setReset(false); toast("Sample data reset"); }}>Reset</Btn></div>
      </Modal>
    </div>
  );
}
