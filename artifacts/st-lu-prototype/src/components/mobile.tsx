import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAppState, useSession } from "@/lib/store";
import { useBoxWidth } from "@/lib/box-width";
import { MapView } from "./map";
import { placeFrom } from "@/lib/geo";
import { STATUS_LABEL } from "@/lib/format";
import { ArrowLeft, Banknote, Briefcase, CalendarDays, Home, LayoutGrid, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { DriverReminderBanner } from "./driver-reminder";
import { OfflineBar } from "./kit";
import { Photo } from "./photo";

const OPEN = ["/app", "/app/welcome", "/app/login", "/app/terms"];
function Guard() {
  const s = useSession();
  const { pathname } = useLocation();
  const p = pathname.replace(/\/$/, "") || "/app";
  if (OPEN.includes(p)) return <Outlet />;
  if (!s) return <Navigate to="/app/welcome" replace />;
  const inDriver = p.startsWith("/app/driver");
  if (s.role === "passenger" && inDriver) return <Navigate to="/app/home" replace />;
  if (s.role === "driver" && !inDriver) return <Navigate to="/app/driver/jobs" replace />;
  return <Outlet />;
}

export function PhoneFrame() {
  // The welcome screen is a full-bleed marketing screen: it fills the window at every size, with no device frame.
  const path = useLocation().pathname.replace(/\/$/, "");
  const bare = path === "/app/welcome";
  // Sign-in and terms are single-purpose screens: they show a photograph beside the form, not a map, and
  // the page is exactly one screen tall.
  const photoSide = path === "/app/login" || path === "/app/terms";
  // Phones: full screen. Tablets (768-1023): full height app in a centred column. Desktop (1024+): phone mock-up.
  return (
    // two panes from 1000px, not 1024: with a visible scrollbar a "1024" window is 1009 wide
    <div className={bare
      ? "app-minvh relative bg-ground"
      : "app-shell app-minvh relative mx-auto w-full max-w-[var(--shell)] bg-aground [@media(min-width:1000px)]:grid [@media(min-width:1000px)]:grid-cols-[var(--pane)_minmax(0,1fr)]"}>
      {/* bottom left of the map pane, clear of the credits button and of the zoom stack on the right.
          Absolute, not fixed, so it stays with the shell once the shell centres on a very wide screen. */}
      <Link to="/" style={{ bottom: "calc(1.25rem + var(--demo-bar))" }}
        className={cn("tap absolute z-30 hidden min-h-12 items-center gap-1.5 rounded-full border border-line bg-paper px-4 text-[13px] font-semibold text-ink shadow-e1 hover:border-green/60 [@media(min-width:1000px)]:inline-flex",
        bare ? "left-5" : "left-[calc(var(--pane)+72px)]")}><ArrowLeft size={15} />Back to start</Link>
      <div className={bare
        ? "app-vh relative w-full overflow-hidden bg-ground"
        : "app-pane app-vh relative mx-auto w-full overflow-hidden bg-ground [@media(min-width:1000px)]:mx-0 [@media(min-width:1000px)]:w-full [@media(min-width:1000px)]:border-r [@media(min-width:1000px)]:border-line"}>
        <div id="phone-root" className="relative h-full w-full overflow-hidden [transform:translateZ(0)]">
          <OfflineBar />
          <Guard />
          <DriverReminderBanner />
        </div>
      </div>
      {/* 1024 and up: the screen keeps a column of its own and the map fills the rest */}
      {!bare && (photoSide
        ? <aside className="app-vh relative hidden overflow-hidden bg-ground [@media(min-width:1000px)]:block" aria-hidden><Photo slot="welcome-portrait" fill priority sizes="60vw" pos="50% 40%" /><span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" /></aside>
        : <aside className="app-vh hidden [@media(min-width:1000px)]:block" aria-label="Map"><SideMap /></aside>)}
    </div>
  );
}

/**
 * Screens are laid out at their own size and scroll when they do not fit.
 *
 * An earlier version shrank the content to avoid a scrollbar, which quietly pushed 12px labels down to
 * 11px on short phones. Readable text wins over a scroll-free screen, so the shrink is off: MIN_FIT is 1.
 */
export const MIN_FIT = 1; // no shrinking: 12px stays 12px on every device
function FitBody({ children, fit, fill }: { children: ReactNode; fit: boolean; fill?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const apply = useCallback(() => {
    const el = ref.current; const host = el?.parentElement;
    if (!el || !host) return;
    if (!fit) { el.style.zoom = ""; return; }
    el.style.zoom = "1";
    const cs = getComputedStyle(host);
    const avail = host.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const natural = el.scrollHeight;
    const z = natural > avail && avail > 0 ? Math.max(MIN_FIT, Math.floor((avail / natural) * 1000) / 1000) : 1;
    el.style.zoom = z < 1 ? String(z) : "";
  }, [fit]);
  useLayoutEffect(() => { apply(); });
  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    const ro = new ResizeObserver(() => apply());
    ro.observe(host);
    window.addEventListener("resize", apply);
    const t = window.setTimeout(apply, 250); // after images and fonts settle
    return () => { ro.disconnect(); window.removeEventListener("resize", apply); window.clearTimeout(t); };
  }, [apply]);
  return <div ref={ref} className={fill ? "flex min-h-full flex-col" : "flow-root"}>{children}</div>;
}

/** Screen scaffold: body that fits the screen when it can, optional pinned footer and tab bar. */
export function Screen({ children, footer, tabs, className, bg = "bg-ground", fit = true, fill = false }: { children: ReactNode; footer?: ReactNode; tabs?: "passenger" | "driver"; className?: string; bg?: string; fit?: boolean; fill?: boolean }) {
  return (
    // Under 400px of height nothing is pinned: the body, the footer button and the tab bar scroll together, so
    // a field is never left hidden behind a button that stays put.
    <div className={cn("flex h-full flex-col [@media(max-height:400px)]:overflow-y-auto", bg)}>
      {/* a real landmark, so a screen reader can jump straight to the screen's content */}
      <main className={cn("no-scrollbar min-h-0 flex-1 overflow-y-auto [@media(max-height:400px)]:min-h-fit [@media(max-height:400px)]:flex-none [@media(max-height:400px)]:overflow-visible", className)}><FitBody fit={fit} fill={fill}>{children}</FitBody></main>
      {footer && <div className="relative z-10 shrink-0 border-t border-line/70 bg-ground px-5 pb-[max(env(safe-area-inset-bottom),clamp(10px,2.2vh,22px))] pt-3">{footer}</div>}
      {tabs && <TabBar role={tabs} />}
    </div>
  );
}

export function TabBar({ role }: { role: "passenger" | "driver" }) {
  const items = role === "passenger"
    ? [{ to: "/app/home", label: "Home", I: Home }, { to: "/app/trips", label: "Trips", I: CalendarDays }, { to: "/app/account", label: "Account", I: User }]
    : [{ to: "/app/driver/jobs", label: "Jobs", I: Briefcase }, { to: "/app/driver/earnings", label: "Earnings", I: Banknote }, { to: "/app/driver/profile", label: "Profile", I: User }];
  return (
    <nav aria-label="Main" className="relative z-10 shrink-0 border-t border-line bg-paper px-3 pb-[max(env(safe-area-inset-bottom),clamp(4px,1.2vh,12px))] pt-1.5">
      <div className="mx-auto grid max-w-[520px] grid-cols-3 gap-1">
        {items.map(({ to, label, I }) => (
          <NavLink key={to} to={to} data-testid={`tab-${label.toLowerCase()}`}
            className={({ isActive }) => cn("tap group flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-lg text-[12px] font-semibold transition-colors", isActive ? "text-green" : "text-mute hover:text-ink")}>
            {({ isActive }) => (<>
              <span className={cn("inline-flex h-7 w-14 items-center justify-center rounded-full transition-colors", isActive ? "bg-ok" : "bg-transparent")}><I size={20} strokeWidth={isActive ? 2.4 : 2} /></span>
              {label}
            </>)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export const GridIcon = LayoutGrid;

/**
 * Desktop companion pane (1024 and up).
 *
 * On a wide screen the app is not a phone floating in the middle of an empty desk: the screen keeps
 * its own column on the left and the map it is talking about fills the space on the right, the way a
 * real web app for dispatch would. It follows whatever the person is doing: the open trip when there
 * is one, otherwise the island.
 */
/** true while the given media query matches; re-renders when it changes */
export function useMedia(query: string) {
  const [on, setOn] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const h = () => setOn(mq.matches);
    h(); mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [query]);
  return on;
}

/**
 * Width of the box a table sits in (not the screen: the admin sidebar takes 260px of a 1024 screen).
 * A table is shown only when its box is at least as wide as the table needs; below that the same rows
 * are drawn as cards, so a column is never cut. Only one of the two is ever rendered, so test ids stay unique.
 * Starts wide, measures before the first paint.
 */
export { useBoxWidth };

/** true when the app is in its two-pane desktop layout */
export function useWide() {
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1000px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1000px)");
    const on = () => setWide(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

export function SideMap() {
  const s = useAppState();
  const session = useSession();
  const { pathname } = useLocation();

  // Named places for the island view. Short labels, far enough apart not to collide at island zoom.
  const MARKS = [
    { id: "uvf" as const, label: "UVF", dir: "bottom" as const },
    { id: "slu" as const, label: "SLU", dir: "top" as const },
    { id: "castries" as const, label: "Castries", dir: "left" as const },
    { id: "rodney-bay" as const, label: "Rodney Bay", dir: "right" as const },
    { id: "soufriere" as const, label: "Soufriere", dir: "left" as const },
    { id: "pitons" as const, label: "Pitons", dir: "right" as const },
  ];

  const mine = session?.role === "driver"
    ? s.bookings.filter((b) => b.driverId === session.driverId)
    : s.bookings.filter((b) => b.email === s.identity.email);

  // The map shows what the page is about, and nothing else. It never picks a trip of its own:
  //  - a trip page shows that trip;
  //  - Plan your ride shows the two places as they are chosen;
  //  - everything else shows the island with its named places.
  const refInPath = pathname.match(/SLU-\d+/)?.[0];
  const onTrip = refInPath ? mine.find((x) => x.ref === refInPath) : undefined;
  const booking = pathname.startsWith("/app/book");
  const draftFrom = booking ? placeFrom(s.draft.from) : undefined;
  const draftTo = booking ? placeFrom(s.draft.to) : undefined;

  const from = onTrip ? placeFrom(onTrip.from) : draftFrom;
  const to = onTrip ? placeFrom(onTrip.to) : draftTo;
  const hasRoute = !!(from && to);
  const island = !hasRoute;

  const leg = onTrip?.status === "on_the_way" ? "to-pickup" as const
    : onTrip?.status === "at_pickup" ? "at-pickup" as const
      : onTrip?.status === "onboard" ? "onboard" as const : undefined;
  const progress = onTrip?.status === "on_the_way" ? 0.55 : onTrip?.status === "at_pickup" ? 1 : onTrip?.status === "onboard" ? (onTrip.heading ? 0.75 : 0.25) : 0.1;

  return (
    <div className="relative h-full w-full">
      <MapView
        from={from} to={to}
        progress={progress} focus={island ? "island" : "trip"} leg={undefined} showCar={!!onTrip?.driverId && !!leg}
        labels zoom fitAll caption={null} marks={island ? MARKS : undefined}
        insets={{ top: 64, bottom: 20, left: 20, right: 20 }}
        ariaLabel={onTrip ? `Map of trip ${onTrip.ref}` : hasRoute ? "Map of the trip being planned" : "Map of St. Lucia"} />
      <div className="pointer-events-none absolute inset-x-5 top-5 flex flex-wrap items-center gap-2">
        {onTrip ? (
          <>
            <span className="rounded-full bg-paper/92 px-3 py-1.5 text-[13px] font-bold text-ink shadow-e1">{onTrip.from} &rarr; {onTrip.to}</span>
            <span className="rounded-full bg-green-night px-3 py-1.5 text-[13px] font-bold text-white shadow-e1">{STATUS_LABEL[onTrip.status]}</span>
          </>
        ) : hasRoute ? (
          <span className="rounded-full bg-paper/92 px-3 py-1.5 text-[13px] font-bold text-ink shadow-e1">{s.draft.from} &rarr; {s.draft.to}</span>
        ) : (
          <span className="rounded-full bg-paper/92 px-3 py-1.5 text-[13px] font-bold text-ink shadow-e1">St. Lucia &middot; fixed-price transfers island-wide</span>
        )}
      </div>
    </div>
  );
}
