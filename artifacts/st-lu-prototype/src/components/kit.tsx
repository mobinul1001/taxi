import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, WifiOff, TriangleAlert, Bell, Car, Check, CheckCircle2, ChevronLeft, CircleAlert, Clock, History, Info, RotateCcw, ShieldCheck, X, Monitor, SunMoon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useToasts } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { STATUS_LABEL, initials } from "@/lib/format";
import type { Alert, Status } from "@/lib/types";

/** St Lu mark: sun over a wave with a road line. Reads at 24px and in one colour. */
/** St Lu mark: sun rising over the bay. Works on photos, ivory and near-black. */
export function LogoMark({ size = 40, mono = false, className }: { size?: number; mono?: boolean; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="14" fill={mono ? "currentColor" : "#0E6B45"} />
      <circle cx="24" cy="19.5" r="7.5" fill={mono ? "#fff" : "#F5902B"} />
      <path d="M9.5 31.5c7-5.5 22-5.5 29 0" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M15 38c5-3.2 13-3.2 18 0" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

/** Logo lockup: mark + serif wordmark + small-caps descriptor. tone="light" for photos and dark bars, "dark" for ivory surfaces (follows the theme). */
/** `testId` keeps two lockups on one page (a header and a footer) from sharing an id. */
export function Logo({ className, tile = false, size = "md", tone = "light", compactXs = false, testId = "img-logo" }: { className?: string; tile?: boolean; size?: "sm" | "md" | "lg"; tone?: "light" | "dark"; compactXs?: boolean; testId?: string }) {
  const m = size === "sm" ? 32 : size === "lg" ? 48 : 38;
  const txt = size === "sm" ? "text-[19px]" : size === "lg" ? "text-[28px]" : "text-[23px]";
  const sub = size === "lg" ? "text-[12.5px]" : "text-[12px]";
  const showSub = size !== "sm"; // at the small size the descriptor could not reach 12px without crowding the mark
  const el = (
    <span className={cn("inline-flex items-center gap-2.5", className)} data-testid={testId} role="img" aria-label="St Lu Taxi And Tours">
      <LogoMark size={m} />
      <span className="flex flex-col leading-none">
        <span className={cn("whitespace-nowrap font-serif font-semibold tracking-[-0.02em]", txt, tone === "light" ? "text-white" : "text-ink")}>St Lu</span>
        {showSub && <span className={cn("mt-[3px] whitespace-nowrap font-semibold uppercase tracking-[0.16em]", sub, tone === "light" ? "text-white/80" : "text-mute", compactXs && "max-[359px]:hidden")}>Taxi &amp; Tours</span>}
      </span>
    </span>
  );
  if (!tile) return el;
  return <span className="inline-flex items-center rounded-lg bg-green-night px-2.5 py-1.5">{el}</span>;
}

type BtnVariant = "primary" | "orange" | "outline" | "ghost" | "white" | "danger" | "soft";
export function Btn({ variant = "primary", size = "md", className, children, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" | "lg" }) {
  const v: Record<BtnVariant, string> = {
    primary: "bg-brand text-brand-ink shadow-[0_1px_0_rgba(255,255,255,.18)_inset,0_10px_20px_-14px_var(--color-brand)] hover:bg-brand-hover",
    orange: "bg-cta text-cta-ink shadow-[0_1px_0_rgba(255,255,255,.35)_inset,0_12px_22px_-14px_var(--color-cta)] hover:brightness-[.97]",
    outline: "btn-outline border border-line-strong bg-paper text-ink shadow-e1 hover:border-green/60 hover:bg-ok/40",
    ghost: "text-green hover:bg-ok/70",
    white: "keep-white bg-white text-green-dark shadow-e1 hover:bg-ground",
    danger: "bg-err text-white hover:brightness-110",
    soft: "bg-ok text-green hover:brightness-[.97]",
  };
  const s = {
    sm: "relative min-h-10 min-w-11 px-3.5 text-[13.5px] rounded-md after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']",
    md: "min-h-12 px-5 text-[15px] rounded-lg",
    lg: "min-h-14 px-6 text-[16.5px] rounded-lg tracking-[-0.01em]",
  };
  return (
    <button {...p} className={cn("tap inline-flex min-w-0 items-center justify-center gap-2 whitespace-nowrap text-center font-semibold leading-tight disabled:pointer-events-none disabled:opacity-45", v[variant], s[size], className)}>
      {children}
    </button>
  );
}

export const Card = ({ className, children, ...p }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) => (
  <div {...p} className={cn("rounded-xl border border-line bg-paper shadow-card", className)}>{children}</div>
);

export type Tone = "ok" | "warn" | "err" | "info" | "neutral" | "orange" | "green";
export function Pill({ tone = "neutral", children, className, dot = false }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  const t: Record<Tone, string> = {
    ok: "bg-ok text-green", warn: "bg-warn text-warn-ink", err: "bg-err-tint text-err", info: "bg-info text-info-ink",
    neutral: "bg-neutral text-neutral-ink", orange: "bg-orange text-orange-ink", green: "bg-green text-white",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-[5px] text-[12px] font-semibold leading-none", t[tone], className)}>
      {dot && <i aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}

export const statusTone = (s: Status): Tone =>
  ({ pending: "warn", assigned: "info", on_the_way: "ok", at_pickup: "warn", onboard: "info", completed: "neutral", cancelled: "err" } as const)[s];
export function StatusPill({ status, label, className }: { status: Status; label?: string; className?: string }) {
  return <Pill dot tone={statusTone(status)} className={className}>{label ?? STATUS_LABEL[status]}</Pill>;
}
export function DocPill({ tone, label }: { tone: "ok" | "warn" | "err"; label: string }) {
  return <Pill dot tone={tone}>{label}</Pill>;
}

export function Avatar({ name, size = 44, className, tone = "green" }: { name: string; size?: number; className?: string; tone?: "green" | "soft" }) {
  return (
    <span style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold tracking-tight", tone === "green" ? "bg-[linear-gradient(140deg,#14925F,#0A5436)] text-white" : "bg-ok text-green", className)}>
      {initials(name)}
    </span>
  );
}

export function BackBtn({ to, className }: { to?: string; className?: string }) {
  const nav = useNavigate();
  return (
    <button aria-label="Back" data-testid="button-back" onClick={() => (to ? nav(to) : nav(-1))}
      className={cn("tap inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-ink shadow-card", className)}>
      <ChevronLeft size={22} />
    </button>
  );
}

/** `plain` renders the title as text when the screen body carries its own h1. */
export function ScreenHead({ title, sub, back, right, plain = false }: { title: string; sub?: string; back?: string; right?: ReactNode; plain?: boolean }) {
  const T = plain ? "p" : "h1";
  return (
    <div className="flex items-center gap-3 px-5 pb-[clamp(6px,1.4vh,14px)] pt-[clamp(18px,5vh,48px)]">
      <BackBtn to={back} />
      <div className="min-w-0 flex-1">
        <T className="font-display text-[clamp(20px,3vh,24px)] font-bold leading-tight">{title}</T>
        {sub && <p className="text-[13px] font-medium text-mute">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function StepBars({ total, current, className }: { total: number; current: number; className?: string }) {
  return (
    <div className={cn("flex gap-1.5", className)} role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current} aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={cn("h-1 flex-1 rounded-full transition-colors duration-300", i < current - 1 ? "bg-green" : i === current - 1 ? "bg-orange" : "bg-neutral")} />
      ))}
    </div>
  );
}

export function ProgressSteps({ labels, current }: { labels: string[]; current: number }) {
  return (
    <ol className="grid" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }} aria-label="Trip progress">
      {labels.map((l, i) => (
        <li key={l} className="relative text-center" aria-current={i === current ? "step" : undefined}>
          {i > 0 && <span className={cn("absolute right-1/2 top-3 h-[3px] w-full -translate-y-1/2 rounded-full", i <= current ? "bg-green" : "bg-neutral")} />}
          <span className={cn("relative mx-auto flex h-6 w-6 items-center justify-center rounded-full border-2 text-white transition-colors", i < current ? "border-green bg-green" : i === current ? "border-green bg-green ring-4 ring-green/20" : "border-line-strong bg-paper")}>
            {i < current && <Check size={13} strokeWidth={3.5} />}
          </span>
          <span className={cn("mt-1.5 block px-0.5 text-[12px] font-semibold leading-tight", i <= current ? "text-ink" : "text-mute")}>{l}</span>
        </li>
      ))}
    </ol>
  );
}

export function Toaster() {
  const list = useToasts();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} role="status" data-testid="toast"
          className={cn("anim-pop pointer-events-auto flex max-w-md items-center gap-2.5 rounded-lg px-4 py-3 text-[14px] font-medium shadow-float",
            t.tone === "err" ? "bg-err text-white" : t.tone === "info" ? "bg-info text-info-ink" : "bg-green-night text-white")}>
          {t.tone === "info" ? <Info size={18} className="shrink-0" /> : t.tone === "err" ? <TriangleAlert size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0 text-orange" />}
          <span className="min-w-0">{t.text}</span>
          {t.to && t.cta && <Link to={t.to} data-testid="link-toast" className="tap ml-1 inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-md bg-white/15 px-2.5 text-[13.5px] font-bold underline-offset-2 hover:underline">{t.cta}</Link>}
        </div>
      ))}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) { return <div aria-hidden className={cn("skeleton", className)} />; }

export function Empty({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-ok text-green ring-8 ring-ok/40">{icon}</span>
      <p className="font-display text-[18px] font-bold">{title}</p>
      <p className="mt-1 max-w-[300px] text-[14px] text-mute">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * `error` turns the field red and prints the reason under it, the same way the login screen does.
 * A toast alone was easy to miss: it appears away from the field and fades after three seconds.
 */
export function Field({ label, children, hint, error }: { label: string; children: ReactNode; hint?: string; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-semibold text-neutral-ink">{label}</span>
      {children}
      {error
        ? <span role="alert" className="mt-1 flex items-start gap-1.5 text-[12.5px] font-medium text-err"><CircleAlert size={14} className="mt-px shrink-0" />{error}</span>
        : hint && <span className="mt-1 block text-[12px] text-mute [@media(max-height:740px)]:hidden">{hint}</span>}
    </label>
  );
}

/** Extra classes for an input that failed validation: red border, red focus ring. */
export const invalidCls = "!border-err focus:!border-err focus:!ring-err/20";
export const inputCls = "h-[clamp(48px,6vh,52px)] w-full min-w-0 rounded-md border border-line-strong bg-paper px-3.5 text-[15px] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-faint hover:border-mute/60 focus:border-green focus:ring-4 focus:ring-green/15";

export function Modal({ open, onClose, children, className, title }: { open: boolean; onClose: () => void; children: ReactNode; className?: string; title?: string }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="anim-fade fixed inset-0 z-[80] flex items-end justify-center bg-green-night/55 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className={cn("anim-pop thin-scroll max-h-[92dvh] w-full max-w-[600px] overflow-auto rounded-t-2xl bg-paper p-5 shadow-float sm:rounded-2xl sm:p-6", className)}>
        {children}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, children, width = 520 }: { open: boolean; onClose: () => void; children: ReactNode; width?: number }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="anim-fade fixed inset-0 z-[70] bg-green-night/45" onClick={onClose}>
      <aside role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ maxWidth: width }} className="anim-slide thin-scroll absolute right-0 top-0 flex h-full w-full flex-col overflow-y-auto border-l border-line bg-ground shadow-float">
        <button aria-label="Close" onClick={onClose} className="tap absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper text-ink shadow-e1"><X size={18} /></button>
        {children}
      </aside>
    </div>
  );
}

export function ChannelTags({ at }: { at?: string }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className="rounded-sm bg-neutral px-2 py-0.5 text-[12px] font-semibold text-neutral-ink">SMS</span>
      <span className="rounded-sm bg-neutral px-2 py-0.5 text-[12px] font-semibold text-neutral-ink">WhatsApp</span>
      {at && <span className="text-[13px] text-mute">{at}</span>}
    </div>
  );
}

export function AlertIcon({ kind }: { kind: Alert["kind"] }) {
  const map = {
    bell: [Bell, "bg-warn text-warn-ink"], clock: [Clock, "bg-ok text-green"], shield: [ShieldCheck, "bg-warn text-warn-ink"],
    refund: [RotateCcw, "bg-info text-info-ink"], car: [Car, "bg-ok text-green"], check: [Check, "bg-ok text-green"], change: [History, "bg-ok text-green"],
  } as const;
  const [I, c] = map[kind];
  return <span className={cn("inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", c)}><I size={20} /></span>;
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} data-testid={`switch-${label.toLowerCase().replace(/\s/g, "-")}`} onClick={() => onChange(!on)}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 after:absolute after:-inset-x-1 after:-inset-y-3 after:content-['']", on ? "bg-green" : "bg-line-strong")}>
      <span className={cn("absolute left-0 top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.3)] transition-transform duration-200", on ? "translate-x-[23px]" : "translate-x-[3px]")} />
    </button>
  );
}

/** Stylised island map used on live screens and the admin live map. */
const THEME_OPTS = [["light", "Light", Sun], ["dark", "Dark", Moon], ["system", "System", Monitor]] as const;
/** Light / Dark / System segmented control. `compact` shows icons only (labels stay for screen readers). */
export function ThemeSegment({ className, compact = false, onPhoto = false }: { className?: string; compact?: boolean; onPhoto?: boolean }) {
  const { pref, setPref } = useTheme();
  return (
    <div role="radiogroup" aria-label="Theme" data-testid="segment-theme" className={cn("inline-grid grid-cols-3 gap-0.5 rounded-full p-0.5", onPhoto ? "glass-photo" : "bg-neutral", className)}>
      {THEME_OPTS.map(([v, label, I]) => (
        <button key={v} type="button" role="radio" aria-checked={pref === v} aria-label={`${label} theme`} data-testid={`button-theme-${v}`} onClick={() => setPref(v)}
          className={cn("tap inline-flex min-h-12 min-w-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[13px] font-semibold transition-colors",
            pref === v ? (onPhoto ? "keep-white bg-white !text-[#1C1A16]" : "bg-paper text-ink shadow-e2") : onPhoto ? "text-white/85 hover:text-white" : "text-neutral-ink hover:text-ink")}>
          <I size={16} className="shrink-0" />{!compact && label}
        </button>
      ))}
    </div>
  );
}

/** Theme rows for settings screens: quick dark switch plus the Light / Dark / System choice. */
export function ThemeRow({ className }: { className?: string }) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  return (
    // One control, not two: a "Dark mode" switch above an Appearance segment set the same thing and
    // left the reader guessing which one was in charge. The segment wins because it also offers System.
    <div className={className}>
      <div className="flex min-h-[56px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ok text-green">{dark ? <Moon size={18} /> : <Sun size={18} />}</span>
        <span className="flex-1 text-[15.5px] font-medium">Appearance</span>
        <ThemeSegment />
      </div>
    </div>
  );
}

/** One icon button that cycles Light, Dark, System (sun, moon, auto). The label and tooltip always say the current mode. */
export function ThemeButton({ className }: { className?: string }) {
  const { pref, setPref } = useTheme();
  const next = pref === "light" ? "dark" : pref === "dark" ? "system" : "light";
  const name = { light: "Light", dark: "Dark", system: "Auto (follows your device)" }[pref];
  const I = pref === "light" ? Sun : pref === "dark" ? Moon : SunMoon;
  return (
    <button type="button" onClick={() => setPref(next)} data-testid="button-theme" data-mode={pref} title={`Theme: ${name}`} aria-label={`Theme: ${name}. Tap to switch to ${next === "system" ? "auto" : next}`}
      className={cn("tap inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-green shadow-e1", className)}>
      <I size={19} />
    </button>
  );
}

/** Error state with a retry action. */
export function ErrorState({ title = "Something went wrong", body = "We could not load this. Check your connection and try again.", onRetry }: { title?: string; body?: string; onRetry?: () => void }) {
  return (
    <div role="alert" data-testid="state-error" className="flex flex-col items-center rounded-2xl border border-line bg-paper px-6 py-8 text-center shadow-card">
      <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-err-tint text-err ring-8 ring-err-tint/40"><TriangleAlert size={26} /></span>
      <h2 className="font-display text-[19px] font-bold">{title}</h2>
      <p className="mt-1 max-w-[30ch] text-[14.5px] text-mute">{body}</p>
      {onRetry && <Btn className="mt-4 min-w-[140px]" onClick={onRetry} data-testid="button-retry">Try again</Btn>}
    </div>
  );
}

/** Shows a bar when the browser goes offline. */
export function OfflineBar() {
  const [off, setOff] = useState(typeof navigator !== "undefined" && navigator.onLine === false);
  useEffect(() => {
    const a = () => setOff(true), b = () => setOff(false);
    window.addEventListener("offline", a); window.addEventListener("online", b);
    return () => { window.removeEventListener("offline", a); window.removeEventListener("online", b); };
  }, []);
  if (!off) return null;
  return <div role="status" data-testid="bar-offline" className="absolute inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-ink px-3 py-2 text-center text-[13px] font-semibold text-white"><WifiOff size={15} className="shrink-0" />You are offline. Changes save when you reconnect.</div>;
}

/**
 * The way back to the prototype start page, for a page that is not inside the app shell
 * (landing page, outside-driver link). It sits in the page's own chrome rather than floating over the
 * content: a floating chip covered cards and buttons at phone sizes.
 */
export function StartLink({ className, label = "Back to start", tone = "light" }: { className?: string; label?: string; tone?: "light" | "dark" }) {
  return (
    <Link to="/" data-testid="link-start-chip"
      className={cn("tap inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-semibold",
        tone === "dark" ? "border-white/30 bg-white/10 text-white hover:bg-white/20" : "border-line bg-paper text-ink hover:border-green/60", className)}>
      <ChevronLeft size={16} className="shrink-0" />{label}
    </Link>
  );
}

/**
 * A textarea that is always as tall as its text. The message templates used a fixed 64px box, which on
 * a narrow phone cut the second line of every template in half - the one thing a reader of this screen
 * is here to read.
 */
export function AutoTextarea({ value, onChange, className, ...rest }: { value: string; onChange: (v: string) => void; className?: string } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  const el = useRef<HTMLTextAreaElement>(null);
  const grow = () => {
    const t = el.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = `${t.scrollHeight}px`;
  };
  useEffect(() => {
    grow();
    const ro = new ResizeObserver(grow);
    if (el.current) ro.observe(el.current);
    return () => ro.disconnect();
  }, [value]);
  return <textarea ref={el} rows={2} value={value} onChange={(e) => { onChange(e.target.value); grow(); }} className={cn("resize-none overflow-hidden", className)} {...rest} />;
}
