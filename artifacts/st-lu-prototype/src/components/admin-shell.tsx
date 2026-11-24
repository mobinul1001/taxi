import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BarChart3, Bell, CalendarDays, Car, ChevronsUpDown, LayoutGrid, Map, Menu, RotateCcw, Search, Settings, Tag, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, Logo, ThemeSegment } from "./kit";
import { actions, useAppState } from "@/lib/store";
import { BookingDrawer } from "./booking-drawer";
import { AdminAccountMenu } from "./admin-modals";

export const NAV = [
  { to: "/admin", label: "Dashboard", I: LayoutGrid, end: true },
  { to: "/admin/bookings", label: "Bookings", I: CalendarDays },
  { to: "/admin/live-map", label: "Live Map", I: Map },
  { to: "/admin/drivers", label: "Drivers", I: Car },
  { to: "/admin/passengers", label: "Passengers", I: Users },
  { to: "/admin/pricing", label: "Pricing", I: Tag },
  { to: "/admin/refunds", label: "Refunds", I: RotateCcw },
  { to: "/admin/reports", label: "Reports", I: BarChart3 },
  { to: "/admin/settings", label: "Settings", I: Settings },
];

function Sidebar({ onNav, onAccount }: { onNav?: () => void; onAccount: () => void }) {
  const s = useAppState();
  const pending = s.bookings.filter((b) => b.status === "pending").length;
  return (
    <div className="on-dark flex h-full flex-col bg-green-night px-3 py-4 text-white">
      <Link to="/admin" onClick={onNav} className="mb-5 flex min-h-11 items-center px-2"><Logo /></Link>
      <p className="px-3 pb-1.5 text-[12px] font-bold uppercase tracking-[.14em] text-white/55">Dispatch</p>
      <nav aria-label="Admin" className="thin-scroll flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
        {NAV.map(({ to, label, I, end }, i) => (
          <NavLink key={to} to={to} end={end} onClick={onNav} data-testid={`nav-${label.toLowerCase().replace(" ", "-")}`}
            className={({ isActive }) => cn("tap group relative flex min-h-11 shrink-0 items-center gap-3 rounded-md px-3 text-[14px] font-medium transition-colors", i === 5 && "mt-3", isActive ? "bg-white/[.12] font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)] before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-orange" : "text-white/75 hover:bg-white/[.07] hover:text-white")}>
            {({ isActive }) => (<>
              <I size={18} className={isActive ? "text-orange-soft" : "text-white/70 group-hover:text-white"} /><span className="flex-1">{label}</span>
              {label === "Bookings" && pending > 0 && <span className="tnum rounded-full bg-orange px-1.5 py-0.5 text-[12px] font-bold leading-none text-orange-ink" aria-label={`${pending} pending`}>{pending}</span>}
            </>)}
          </NavLink>
        ))}
      </nav>
      {/* the way out of the admin panel: without this the only route back to the start page is the browser's
          back button, which is not something a client opening the link on their own will think to use */}
      <Link to="/" onClick={onNav} data-testid="link-admin-start"
        className="tap mt-3 flex min-h-11 shrink-0 items-center gap-2.5 rounded-md px-3 text-[14px] font-medium text-white/75 hover:bg-white/[.07] hover:text-white">
        <ArrowLeft size={18} className="shrink-0 text-white/70" /><span>Back to start</span>
      </Link>
      <button data-testid="button-sidebar-account" onClick={onAccount} className="tap mt-2 flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-white/[.06] p-2.5 text-left hover:bg-white/10">
        <Avatar name="Samuel Green" size={36} className="!bg-none !bg-white !text-green-dark" />
        <div className="min-w-0 flex-1 text-[13px] leading-tight"><p className="truncate font-semibold">Samuel Green</p><p className="text-white/70">Admin</p></div>
        <ChevronsUpDown size={16} className="shrink-0 text-white/60" />
      </button>
    </div>
  );
}

export function AdminShell() {
  const s = useAppState();
  const loc = useLocation();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const [menu, setMenu] = useState<null | "top" | "sidebar">(null);
  const [q, setQ] = useState("");
  // an unknown admin path keeps the shell but says so in the title, instead of claiming to be the dashboard
  const title = [...NAV].reverse().find((n) => (n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to)))?.label ?? "Page not found";
  const adminAlerts = s.alerts.filter((a) => a.audience === "admin");
  const unread = adminAlerts.filter((a) => !a.read).length;
  const results = useMemo(() => {
    const t = q.trim().toLowerCase(); if (t.length < 2) return [];
    const b = s.bookings.filter((x) => x.ref.toLowerCase().includes(t) || x.passenger.toLowerCase().includes(t)).slice(0, 5).map((x) => ({ k: x.ref, label: `${x.ref} · ${x.passenger}`, go: () => setParams({ booking: x.ref }) }));
    const d = s.drivers.filter((x) => x.name.toLowerCase().includes(t)).slice(0, 4).map((x) => ({ k: x.id, label: `Driver · ${x.name}`, go: () => nav(`/admin/drivers/${x.id}`) }));
    return [...b, ...d];
  }, [q, s, nav, setParams]);
  const ref = params.get("booking");

  return (
    <div className="bar-clear app-minvh bg-ground">
      <aside style={{ bottom: "var(--demo-bar)" }} className="fixed left-0 top-0 z-30 hidden w-[240px] lg:block"><Sidebar onAccount={() => setMenu("sidebar")} /></aside>
      {open && <div className="anim-fade fixed inset-0 z-50 bg-green-night/55 lg:hidden" onClick={() => setOpen(false)}><div className="anim-slide-left h-full w-[min(280px,84vw)] shadow-float" onClick={(e) => e.stopPropagation()}><Sidebar onNav={() => setOpen(false)} onAccount={() => { setOpen(false); setMenu("sidebar"); }} /></div></div>}
      <div className="lg:pl-[240px]">
        <header className="blur-bar sticky top-0 z-20 flex h-16 items-center gap-2.5 border-b border-line bg-paper/90 px-4 md:px-6 xl:px-8">
          <button className="tap -ml-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line bg-paper lg:hidden" aria-label="Menu" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <div className="min-w-0 flex-1"><p className="hidden text-[12px] font-medium leading-none text-mute sm:block">St Lu Admin · Mon 14 Dec 2026</p>{/* never cut: the title shrinks a step on a narrow phone and wraps rather than losing a word */}
            <h1 className="font-display text-[17px] font-bold leading-tight min-[380px]:text-[20px] sm:mt-0.5 sm:text-[21px]" data-testid="text-page-title">{title}</h1></div>
          <div className="relative hidden md:block">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
            <input data-testid="input-global-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search bookings, drivers, passengers" aria-label="Search bookings, drivers, passengers" className="h-11 w-[clamp(220px,26vw,340px)] rounded-md border border-line bg-ground pl-10 pr-3 text-[14px] outline-none transition placeholder:text-faint focus:border-green focus:bg-paper focus:ring-4 focus:ring-green/15" />
            {results.length > 0 && (
              <div className="anim-pop absolute right-0 top-12 z-40 w-full rounded-lg border border-line bg-paper p-1.5 shadow-float">
                {results.map((r) => <button key={r.k} onClick={() => { r.go(); setQ(""); }} className="block min-h-10 w-full rounded-sm px-3 py-2 text-left text-[14px] hover:bg-aground">{r.label}</button>)}
              </div>
            )}
          </div>
          <div className="relative">
            {/* the console follows the same Light / Dark / System choice as the rest of the app */}
            <ThemeSegment compact className="hidden sm:inline-grid" />
            <button aria-label="Notifications" data-testid="button-admin-alerts" onClick={() => setBell(!bell)} aria-expanded={bell} className="tap relative inline-flex h-11 w-11 items-center justify-center rounded-md border border-line bg-paper hover:border-line-strong">
              <Bell size={19} />{unread > 0 && <span className="tnum absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full border-2 border-paper bg-orange px-1 text-[12px] font-bold leading-4 text-orange-ink">{unread > 9 ? "9+" : unread}</span>}
            </button>
            {bell && (
              <div className="anim-pop absolute right-[-52px] top-12 z-40 mt-1 w-[380px] max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-line bg-paper shadow-float sm:right-0">
                <div className="flex items-center justify-between border-b border-line px-4 py-3"><b>Dispatcher alerts</b><button className="min-h-9 px-1 text-[13px] font-semibold text-green" onClick={() => actions.markRead("admin")}>Mark all read</button></div>
                <div className="thin-scroll max-h-[min(420px,60vh)] overflow-y-auto">
                  {adminAlerts.length === 0 && <p className="p-4 text-[14px] text-mute">No alerts.</p>}
                  {adminAlerts.slice(0, 30).map((a) => (
                    <button key={a.id} onClick={() => { setBell(false); if (a.ref) setParams({ booking: a.ref }); }} className={cn("block w-full border-b border-line px-4 py-3 text-left", !a.read && "bg-ok/50")}>
                      <p className="text-[14px] font-semibold">{a.title}</p><p className="text-[13px] text-mute">{a.body}</p><p className="mt-1 text-[12px] text-mute">SMS · WhatsApp · {a.at}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button aria-label="Account" data-testid="button-admin-avatar" className="tap inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full" onClick={() => setMenu("top")}><Avatar name="Samuel Green" size={40} /></button>
        </header>
        {/* capped so a list row is never a name on the far left and a badge on the far right of a 27" screen */}
        <main className="admin-main mx-auto w-full max-w-[1480px] p-4 md:p-6 xl:p-8"><Outlet /></main>
      </div>
      <AdminAccountMenu open={!!menu} placement={menu ?? "top"} onClose={() => setMenu(null)} />
      <BookingDrawer refId={ref} onClose={() => { params.delete("booking"); setParams(params); }} />
    </div>
  );
}

export function useOpenBooking() {
  const [params, setParams] = useSearchParams();
  return (ref: string) => { params.set("booking", ref); setParams(params); };
}

export const X_ICON = X;
