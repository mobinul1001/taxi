import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Boxes, Check, ChevronDown, Clock, Facebook, Instagram, LayoutDashboard, Linkedin, Menu, Navigation, Palette, Plus, Puzzle, Smartphone, Twitter, Users, X, Youtube, Zap } from "lucide-react";
import "./company.css";
import "./pages.css";
import { ROUTES } from "./routes";
import { submitEnquiry, thanksState } from "./formFlow";

/** Smooth-scroll to a section id (instant when the visitor asks for reduced motion). */
export const go = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
};

export type Say = (m: string) => void;

type AskOpts = { notes?: string; kind?: string };
type Ctx = { ask: (topic: string, o?: AskOpts) => void; say: Say };
const ShellCtx = createContext<Ctx>({ ask: () => {}, say: () => {} });
export const useShell = () => useContext(ShellCtx);

/** A product picture with a text alternative. The drawing inside is decorative. */
export function Pic({ label, children, className, style }: { label: string; children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div role="img" aria-label={label} className={className} style={style}>{children}</div>;
}

/* ---------------- dialog ---------------- */
type Dlg = { topic: string; notes: string; kind: string; n: number };
const KINDS = ["Taxi booking app", "Custom taxi app", "White label taxi app", "Uber-like app", "Not sure yet"];

function ContactDialog({ dlg, onClose }: { dlg: Dlg | null; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState("");
  const first = useRef<HTMLInputElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const id = useId();
  const open = dlg !== null;
  useEffect(() => {
    if (!open) return;
    setSent(false); setFail(""); setBusy(false);
    const prev = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => first.current?.focus(), 30);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && back.current) {
        const f = [...back.current.querySelectorAll<HTMLElement>("input,select,textarea,button,a[href]")].filter((x) => !x.hasAttribute("disabled"));
        if (!f.length) return;
        const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener("keydown", key);
    document.body.style.overflow = "hidden";
    return () => { clearTimeout(t); document.removeEventListener("keydown", key); document.body.style.overflow = ""; prev?.focus?.(); };
  }, [open, onClose, dlg?.n]);
  if (!dlg) return null;
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true); setFail("");
    const r = await submitEnquiry(data);
    setBusy(false);
    if (r.ok) { onClose(); nav(ROUTES.thankYou, { state: thanksState(data.kind) }); }
    else setFail(r.error);
  };
  return (
    <div ref={back} className="tad-dlg-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tad-dlg" role="dialog" aria-modal="true" aria-labelledby={`${id}-t`}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <h2 id={`${id}-t`}>{sent ? "Thanks, we have your note" : dlg.topic}</h2>
          <button type="button" onClick={onClose} aria-label="Close" style={{ width: 44, height: 44, borderRadius: 10, border: "1px solid #dde3f1", background: "#fff", display: "grid", placeItems: "center", cursor: "pointer", flex: "none" }}><X size={18} /></button>
        </div>
        {sent ? (
          <>
            <p style={{ marginTop: 12, color: "#4b5878", fontSize: 16, lineHeight: 1.55 }}>This is a design prototype, so nothing was sent anywhere. In the live site this form goes to the TaxiAppDevelopment.org team.</p>
            <button type="button" className="btn btn-primary" style={{ marginTop: 20, width: "100%" }} onClick={onClose}>Close</button>
          </>
        ) : (
          <form onSubmit={submit} key={dlg.n}>
            <p style={{ marginTop: 8, color: "#4b5878", fontSize: 15 }}>Tell us a little about your transportation business and what you would like to launch.</p>
            <div className="field"><label htmlFor={`${id}-n`}>Your name</label><input ref={first} id={`${id}-n`} name="name" autoComplete="name" required /></div>
            <div className="field"><label htmlFor={`${id}-e`}>Work email</label><input id={`${id}-e`} name="email" type="email" autoComplete="email" required /></div>
            <div className="field"><label htmlFor={`${id}-k`}>What do you want to build?</label>
              <select id={`${id}-k`} name="kind" defaultValue={dlg.kind}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select></div>
            <div className="field"><label htmlFor={`${id}-m`}>Project notes (optional)</label><textarea id={`${id}-m`} name="notes" defaultValue={dlg.notes} /></div>
            {fail && <p role="alert" style={{ marginTop: 12, color: "#a31d1d", fontWeight: 600, fontSize: 14.5 }}>{fail}</p>}
            <button type="submit" className="btn btn-primary" disabled={busy} style={{ marginTop: 20, width: "100%" }}>{busy ? "Sending…" : "Send request"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------------- header ---------------- */
type NavItem = { t: string; s: string; I: (p: { size?: number }) => ReactNode; page?: string; id?: string };
function Car2(p: { size?: number }) { return <Navigation size={p.size ?? 18} />; }
const SERVICES: NavItem[] = [
  { t: "Taxi App Development", s: "The full picture: apps, backend, process.", I: Smartphone, page: ROUTES.dev },
  { t: "Taxi Booking App Development", s: "Booking flow, dispatch and payments.", I: Car2, page: ROUTES.booking },
  { t: "Custom Taxi App Development", s: "Built around your operation.", I: Puzzle, page: ROUTES.custom },
  { t: "White Label Taxi App Development", s: "A finished platform, branded as yours.", I: Palette, page: ROUTES.whiteLabel },
  { t: "Uber-Like App Development", s: "Your own on-demand ride-hailing app.", I: Zap, page: ROUTES.uber },
  { t: "Taxi App Development Services", s: "Every service, with its deliverables.", I: Boxes, page: ROUTES.services },
  { t: "Taxi App Developers", s: "The team and how we work together.", I: Users, page: ROUTES.developers },
];
const SOLUTIONS: NavItem[] = [
  { t: "All Taxi App Solutions", s: "By business model, operation and fleet.", I: Puzzle, page: ROUTES.solutions },
  { t: "Passenger App", s: "Booking, fares, live tracking, payments.", I: Smartphone, page: ROUTES.home, id: "ecosystem" },
  { t: "Driver App", s: "Requests, navigation, earnings.", I: Navigation, page: ROUTES.home, id: "ecosystem" },
  { t: "Admin Dashboard", s: "Dispatch, analytics and pricing.", I: LayoutDashboard, page: ROUTES.home, id: "ecosystem" },
  { t: "Taxi Dispatch Software", s: "Assign jobs and run the fleet.", I: Boxes, page: ROUTES.dispatch },
];

export function useToSection() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  return useCallback((page: string, id?: string) => {
    const here = pathname.replace(/\/$/, "") === page.replace(/\/$/, "");
    if (here) { if (id) setTimeout(() => go(id), 0); else window.scrollTo({ top: 0 }); return; }
    nav(page);
    if (id) {
      let tries = 0;
      const t = setInterval(() => { tries += 1; if (document.getElementById(id) || tries > 40) { clearInterval(t); setTimeout(() => go(id), 60); } }, 50);
    }
  }, [nav, pathname]);
}

function Header({ onQuote, say }: { onQuote: () => void; say: Say }) {
  const [open, setOpen] = useState<null | "s" | "o">(null);
  const [mob, setMob] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const toSection = useToSection();
  const { pathname } = useLocation();
  useEffect(() => { setOpen(null); setMob(false); }, [pathname]);
  useEffect(() => {
    const out = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("mousedown", out); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", out); document.removeEventListener("keydown", esc); };
  }, []);
  const close = () => { setOpen(null); setMob(false); };
  const item = ({ t, s, I, page, id }: NavItem, mobile?: boolean) => {
    const body = mobile ? t : <><span className="ic"><I size={17} /></span><span><strong>{t}</strong><span className="s">{s}</span></span></>;
    if (page && !id) return <Link key={t} to={page} role={mobile ? undefined : "menuitem"} onClick={close}>{body}</Link>;
    return <button key={t} type="button" role={mobile ? undefined : "menuitem"} onClick={() => { close(); toSection(page ?? ROUTES.home, id); }}>{body}</button>;
  };
  const Drop = ({ k, label, items }: { k: "s" | "o"; label: string; items: NavItem[] }) => (
    <div className="nav-i">
      <button type="button" className="nav-b" aria-expanded={open === k} aria-haspopup="true" onClick={() => setOpen(open === k ? null : k)}>{label}<ChevronDown size={15} /></button>
      {open === k && <div className="dd" role="menu" aria-label={label}>{items.map((i) => item(i))}</div>}
    </div>
  );
  return (
    <header ref={ref} className="hdr">
      <div className="wrap">
        <div className="hdr-in">
          <Link className="logo" to={ROUTES.home} onClick={() => { close(); window.scrollTo({ top: 0 }); }} aria-label="TaxiAppDevelopment, homepage">
            <span className="logo-mark" aria-hidden><Navigation size={17} color="#fff" /></span><span>TaxiApp<b>Development</b></span>
          </Link>
          <nav className="nav" aria-label="Main">
            <Drop k="s" label="Services" items={SERVICES} />
            <Drop k="o" label="Solutions" items={SOLUTIONS} />
            {([["Features", ROUTES.features], ["Portfolio", ROUTES.portfolio], ["Pricing", ROUTES.pricing], ["About", ROUTES.about], ["Contact", ROUTES.contact]] as const).map(([t, to]) => <div className="nav-i" key={t}><Link className="nav-b" to={to} onClick={close}>{t}</Link></div>)}
          </nav>
          <div className="hdr-cta">
            <button type="button" className="btn btn-primary btn-sm" onClick={onQuote}>Get a Quote</button>
            <button type="button" className="burger" aria-label={mob ? "Close menu" : "Open menu"} aria-expanded={mob} onClick={() => setMob(!mob)}>{mob ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </div>
        {mob && (
          <nav className="mnav" aria-label="Main mobile">
            <button type="button" onClick={() => { close(); toSection(ROUTES.home, "services"); }}>Services</button>
            <div className="sub">{SERVICES.map((s) => item(s, true))}</div>
            <button type="button" onClick={() => { close(); toSection(ROUTES.home, "ecosystem"); }}>Solutions</button>
            <div className="sub">{item(SOLUTIONS[0], true)}</div>
            <Link to={ROUTES.features} onClick={close}>Features</Link>
            <Link to={ROUTES.portfolio} onClick={close}>Portfolio</Link>
            <Link to={ROUTES.pricing} onClick={close}>Pricing</Link>
            <Link to={ROUTES.about} onClick={close}>About</Link>
            <Link to={ROUTES.demo} onClick={close}>Book a demo</Link>
            <Link to={ROUTES.contact} onClick={close}>Contact</Link>
            <button type="button" className="btn btn-primary" style={{ width: "100%", marginTop: 14, borderBottom: 0 }} onClick={() => { setMob(false); onQuote(); }}>Get a Quote</button>
          </nav>
        )}
      </div>
    </header>
  );
}

/* ---------------- shared sections ---------------- */
export const Tick = ({ items }: { items: string[] }) => <ul className="tick">{items.map((x) => <li key={x}><CheckI />{x}</li>)}</ul>;
const CheckI = () => <Check size={17} />;

export function Faq({ items, onAsk, heading = "Questions taxi business owners ask us", lede = "Can’t find your answer? Tell us about your project and we will reply with a clear next step.", eyebrow = "FAQ", sid = "faq" }: {
  items: [string, string][]; onAsk: () => void; heading?: string; lede?: string; eyebrow?: string; sid?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <section className="sec sec-white" id={sid} aria-labelledby={`h-${sid}`}>
      <div className="wrap faq-grid">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="h2 wide" id={`h-${sid}`}>{heading}</h2>
          <p className="lede">{lede}</p>
          <button type="button" className="btn btn-outline" style={{ marginTop: 22 }} onClick={onAsk}>Ask us a question</button>
        </div>
        <div className="faq">
          {items.map(([q, a], i) => (
            <div className="faq-item" key={q}>
              <h3><button type="button" className="faq-q" id={`${base}-q${i}`} aria-expanded={open === i} aria-controls={`${base}-a${i}`} onClick={() => setOpen(open === i ? null : i)}>{q}<span className="pm" aria-hidden><Plus size={17} /></span></button></h3>
              <div id={`${base}-a${i}`} role="region" aria-labelledby={`${base}-q${i}`} hidden={open !== i}><p className="faq-a">{a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta({ onConsult, onStart, title = "Ready to Build Your Taxi Booking Platform?", text = "Let’s turn your transportation business idea into a scalable digital platform.", startLabel = "Start Your Project", consultLabel = "Request a Consultation" }: {
  onConsult: () => void; onStart: () => void; title?: string; text?: string; startLabel?: string; consultLabel?: string;
}) {
  return (
    <section className="sec cta-sec" id="contact" aria-labelledby="h-cta">
      <div className="wrap">
        <h2 id="h-cta">{title}</h2>
        <p>{text}</p>
        <div className="hero-btns">
          <button type="button" className="btn btn-primary" onClick={onStart}>{startLabel}</button>
          <button type="button" className="btn btn-ghost-dark" onClick={onConsult}>{consultLabel}</button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- footer ---------------- */
const SOCIALS = [["LinkedIn", Linkedin], ["Facebook", Facebook], ["X", Twitter], ["Instagram", Instagram], ["YouTube", Youtube]] as const;

function Footer({ onContact }: { say: Say; onContact: () => void }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "fail">("idle");
  const page = (t: string, to: string) => <li key={t}><Link to={to} onClick={() => window.scrollTo({ top: 0 })}>{t}</Link></li>;
  const subscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const fd = new FormData(f);
    if (fd.get("_gotcha")) { setState("done"); return; } // a bot filled the hidden field: pretend, send nothing
    setState("busy");
    const r = await submitEnquiry({ email: String(fd.get("email") ?? ""), form: "Newsletter sign-up", _subject: "New newsletter sign-up from TaxiAppDevelopment.org" });
    if (r.ok) { f.reset(); setState("done"); } else setState("fail");
  };
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-grid">
          <div>
            <h4>TaxiAppDevelopment.org</h4>
            <p style={{ fontSize: 15 }}>Taxi app, ride-hailing and dispatch software for taxi operators, fleets and start-ups.</p>
            <ul className="soc" aria-label="Social media (links coming soon)">{SOCIALS.map(([n, I]) => <li key={n}><span className="soc-i" role="img" aria-label={n}><I size={18} aria-hidden /></span></li>)}</ul>
            <p style={{ fontSize: 14, marginTop: 14, color: "var(--on-navy-mute)" }}>Serving the USA, UK, Canada, Australia, Europe and the Caribbean.</p>
          </div>
          <div>
            <h4>Services</h4>
            <ul>{page("Taxi App Development", ROUTES.dev)}{page("Taxi Booking App Development", ROUTES.booking)}{page("Custom Taxi App Development", ROUTES.custom)}{page("White Label Taxi App", ROUTES.whiteLabel)}{page("Uber-Like App Development", ROUTES.uber)}{page("Taxi Dispatch Software", ROUTES.dispatch)}{page("Taxi App Development Services", ROUTES.services)}{page("Taxi App Features", ROUTES.features)}</ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>{page("About Us", ROUTES.about)}{page("Portfolio", ROUTES.portfolio)}{page("Pricing", ROUTES.pricing)}{page("Book a Demo", ROUTES.demo)}{page("Taxi App Developers", ROUTES.developers)}{page("Taxi App Solutions", ROUTES.solutions)}{page("Taxi App Development Cost", ROUTES.cost)}{page("FAQ", ROUTES.faq)}{page("Contact", ROUTES.contact)}</ul>
          </div>
          <div>
            <h4>Contact</h4>
            <p style={{ fontSize: 15 }}><button type="button" onClick={onContact} style={{ background: "none", border: 0, color: "#6c9bff", fontWeight: 650, padding: 0, minHeight: 36, textDecoration: "underline" }}>Send us a message</button> through the contact form.</p>
            <p style={{ fontSize: 15, display: "flex", gap: 8, alignItems: "flex-start" }}><Clock size={16} aria-hidden style={{ marginTop: 4, flex: "none" }} /><span>Monday to Friday, 9:00 AM to 5:00 PM<br />Eastern Time (ET), USA</span></p>
            <h4 style={{ marginTop: 20 }}>Stay in the loop</h4>
            <form className="news" onSubmit={subscribe}>
              <label className="sr" htmlFor="tad-news">Email address</label>
              <input id="tad-news" name="email" type="email" required placeholder="Your email" autoComplete="email" />
              <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
              <button type="submit" className="btn btn-primary btn-sm" disabled={state === "busy"}>{state === "busy" ? "Sending…" : "Subscribe"}</button>
            </form>
            <p style={{ fontSize: 13, marginTop: 8, color: "var(--on-navy-mute)" }}>Taxi software ideas now and then. By subscribing you agree to our <Link to={ROUTES.privacy} style={{ textDecoration: "underline" }}>Privacy Policy</Link>.</p>
            {state === "done" && <p className="ok-msg" role="status">Thanks, you are subscribed.</p>}
            {state === "fail" && <p className="ok-msg" role="alert" style={{ color: "#ffb4a8" }}>We could not subscribe you. Please try again.</p>}
          </div>
        </div>
        <div className="ftr-bot">
          <span>&copy; {new Date().getFullYear()} Taxi App Development (TaxiAppDevelopment.org). All rights reserved.</span>
          <nav className="ftr-legal" aria-label="Legal"><Link to={ROUTES.privacy}>Privacy Policy</Link><Link to={ROUTES.terms}>Terms and Conditions</Link><Link to={ROUTES.cookies}>Cookie Policy</Link><Link to={ROUTES.disclaimer}>Disclaimer</Link><Link to={ROUTES.sitemap}>Sitemap</Link></nav>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- shell ---------------- */
export function Shell({ children, testId }: { children: ReactNode; testId: string }) {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [dlg] = useState<Dlg | null>(null); // the quote dialog is no longer opened: every quote/contact button goes to the contact page
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const say: Say = useCallback((m) => { setMsg(m); clearTimeout(timer.current); timer.current = setTimeout(() => setMsg(null), 3200); }, []);
  const ask = useCallback((_topic: string, o?: AskOpts) => {
    // "Get a Quote" and "Contact" are one page. Any topic or kind a button carries is passed on to pre-fill the form.
    if (pathname === ROUTES.contact) { const f = document.getElementById("form"); f?.scrollIntoView({ behavior: "smooth", block: "start" }); f?.querySelector<HTMLElement>("input")?.focus({ preventScroll: true }); return; }
    nav(ROUTES.contact, { state: { kind: o?.kind, notes: o?.notes } });
  }, [nav, pathname]);
  useEffect(() => { window.scrollTo(0, 0); return () => clearTimeout(timer.current); }, []);
  const close = useCallback(() => undefined, []);
  return (
    <ShellCtx.Provider value={{ ask, say }}>
      <div className="tad" data-testid={testId}>
        <Header onQuote={() => ask("Get a quote")} say={say} />
        <main>{children}</main>
        <Footer say={say} onContact={() => ask("Contact us")} />
        <ContactDialog dlg={dlg} onClose={close} />
        {msg && <div className="tad-live" role="status">{msg}</div>}
      </div>
    </ShellCtx.Provider>
  );
}
