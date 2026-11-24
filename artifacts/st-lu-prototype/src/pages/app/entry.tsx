import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { BadgeCheck, CarFront, CircleAlert, Lock, Mail, Phone as PhoneIcon, Play, RotateCcw, User } from "lucide-react";
import { api, MIN_PASSWORD } from "@/lib/api";
import { Photo } from "@/components/photo";
import { BackBtn, Btn, Field, Logo, inputCls } from "@/components/kit";
import { Screen } from "@/components/mobile";
import { Sheet } from "@/components/bits";
import { actions, getState, setSession, toast, useSession } from "@/lib/store";

export function AppIndex() {
  const s = useSession();
  if (!s) return <Navigate to="/app/welcome" replace />;
  return <Navigate to={s.role === "driver" ? "/app/driver/jobs" : "/app/home"} replace />;
}

export function Welcome() {
  const nav = useNavigate();
  return (
    // Phone: full-bleed photo with the content over its foot. Tablet and up: photo left, content panel right.
    <div className="welcome-root">
      <div className="welcome-photo">
        <Photo slot="welcome-portrait" fill priority sizes="(min-width: 768px) 60vw, 100vw" pos="50% 28%" className="anim-fade" />
        <span aria-hidden className="scrim-top pointer-events-none absolute inset-x-0 top-0 h-36 md:hidden" />
      </div>
      <div className="welcome-panel">
        <div className="welcome-head">
          <Logo size="md" className="md:hidden" />
          <button type="button" data-testid="button-skip" onClick={() => { setSession({ role: "passenger" }); nav("/app/home"); }} className="tap btn-welcome-skip inline-flex min-h-11 items-center rounded-full px-4 text-[14px] font-semibold">Skip</button>
        </div>
        <div className="photo-foot welcome-foot">
          <div className="welcome-inner">
            <div className="cq anim-rise relative px-6 pt-2 md:px-0">
              <Logo size="lg" tone="dark" className="mb-5 hidden md:flex" />
              <h1 className="t-display welcome-h1"><span className="nowrap block">Your island,</span><i className="nowrap block welcome-hl">already waiting.</i></h1>
              <p className="welcome-sub mt-[clamp(8px,1.6vh,14px)] max-w-[40ch] text-[clamp(14px,2.1vh,17px)] leading-snug md:mt-4 md:text-[16.5px] md:leading-relaxed">Fixed-price airport transfers and private tours across St. Lucia. Pay by card, track your driver live.</p>
              <ul className="mt-[clamp(10px,2vh,18px)] grid grid-cols-3 gap-2 md:mt-6 md:gap-2.5 [@media(max-height:560px)]:max-md:hidden" aria-label="Why St Lu">
                {([[BadgeCheck, "Verified drivers", "Verified"], [RotateCcw, "24h free cancel", "Free cancel"], [Lock, "Secure card pay", "Card pay"]] as const).map(([I, t, short]) => (
                  <li key={t} aria-label={t} className="chip-trust flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-center"><I size={17} className="chip-trust-icon shrink-0" /><span className="whitespace-nowrap text-[12px] font-semibold leading-none md:text-[12px]"><span className="chip-short">{short}</span><span className="chip-long">{t}</span></span></li>
                ))}
              </ul>
            </div>
            <div className="relative grid shrink-0 grid-cols-1 gap-[clamp(8px,1.4vh,12px)] px-6 pb-[max(env(safe-area-inset-bottom),clamp(16px,3.6vh,32px))] pt-[clamp(12px,2.4vh,22px)] md:gap-3 md:px-0 md:pb-0 md:pt-7">
              <Btn variant="orange" className="min-h-[clamp(50px,6.6vh,56px)] text-[16.5px] md:min-h-[52px]" data-testid="button-create-account" onClick={() => nav("/app/login?signup=1")}>Create account</Btn>
              <button type="button" data-testid="button-login" onClick={() => nav("/app/login")} className="tap btn-welcome-login inline-flex min-h-[clamp(50px,6.6vh,56px)] items-center justify-center whitespace-nowrap rounded-lg text-[16.5px] font-semibold md:min-h-[52px]">Log in</button>
              <Link to="/demo" data-testid="button-watch-demo" className="tap mt-1 inline-flex min-h-11 items-center justify-center gap-1.5 self-center rounded-lg px-3 text-[14px] font-semibold underline underline-offset-4 welcome-sub md:mt-0"><Play size={14} className="shrink-0 fill-current" />Watch the demo</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("maria.thompson@email.com");
  const [pw, setPw] = useState("demo-password");
  // The static build runs on a hash router, so the query lives in the hash and location.search is empty:
  // reading it directly left "Create account" opening nothing at all. useSearchParams reads either shape.
  const [params] = useSearchParams();
  const [signup, setSignup] = useState(() => params.has("signup"));
  const [forgot, setForgot] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [pwNew, setPwNew] = useState("");

  const asPassenger = () => { setSession({ role: "passenger" }); nav("/app/home"); };
  const asDriver = (id = "DRV-007") => { setSession({ role: "driver", driverId: id }); nav("/app/driver/jobs"); };
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [first, setFirst] = useState<string | null>(null); // driver id that must set its own password
  const [np, setNp] = useState({ a: "", b: "" });
  const login = async () => {
    setErr("");
    if (!email.includes("@") || pw.length < 4) { setErr("Enter your email and password."); return toast("Enter your email and password", "err"); }
    // Driver emails are checked against the stored credential. A driver email can never fall through to passenger mode.
    if (api.auth.isDriverEmail(email)) {
      setBusy(true);
      const r = await api.auth.verifyDriver(email, pw);
      setBusy(false);
      if (!r.ok) return setErr("Wrong password for this driver account. Ask the dispatcher to reset it.");
      if (r.mustChange) return setFirst(r.driverId);
      return asDriver(r.driverId);
    }
    if (email.trim().toLowerCase() !== getState().identity.email) actions.setIdentity({ email: email.trim().toLowerCase() });
    asPassenger();
  };
  const saveOwn = async () => {
    if (!first) return;
    if (np.a.length < MIN_PASSWORD) return toast(`Use at least ${MIN_PASSWORD} characters`, "err");
    if (np.a !== np.b) return toast("The two passwords do not match", "err");
    if (np.a === pw) return toast("Choose a password different from the temporary one", "err");
    await api.auth.setDriverPassword(first, np.a, false);
    toast("Password saved. You are logged in"); const id = first; setFirst(null); asDriver(id);
  };

  return (
    <Screen className="relative px-5 pt-[clamp(16px,5vh,48px)]">
      <div className="flex items-center justify-between"><BackBtn to="/app/welcome" /><Logo tone="dark" size="sm" /></div>
      <h1 className="mt-[clamp(12px,3vh,28px)] font-display text-[clamp(26px,4.2vh,34px)] font-bold leading-tight tracking-[-0.03em]">Welcome back</h1>
      <p className="mt-1 text-[14.5px] leading-snug text-mute [@media(max-height:600px)]:hidden">Log in to book rides and manage your trips. Drivers use the same login.</p>
      <div className="mt-[clamp(12px,2.4vh,22px)]">
      <label htmlFor="login-email" className="block text-[13px] font-semibold text-neutral-ink">Email</label>
      <div className="relative mt-1.5"><Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" size={19} />
        <input id="login-email" type="email" autoComplete="username" data-testid="input-email" className={inputCls + " h-[52px] pl-11 text-[16px]"} aria-invalid={!!err} value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} /></div>
      <label htmlFor="login-password" className="mt-3 block text-[13px] font-semibold text-neutral-ink">Password</label>
      <div className="relative mt-1.5"><Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" size={19} />
        <input id="login-password" autoComplete="current-password" data-testid="input-password" type="password" className={inputCls + " h-[52px] pl-11 text-[16px]"} aria-invalid={!!err} aria-describedby={err ? "login-error" : undefined} value={pw} onChange={(e) => { setPw(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") login(); }} /></div>
      {err && <p id="login-error" role="alert" data-testid="error-login" className="mt-2 flex items-start gap-2 rounded-md bg-err-tint px-3 py-2 text-[13.5px] font-medium text-err"><CircleAlert size={16} className="mt-px shrink-0" />{err}</p>}
      <div className="flex justify-end"><button onClick={() => setForgot(true)} className="min-h-12 text-[14px] font-semibold text-green">Forgot password?</button></div>
      <Btn className="w-full min-h-[52px] text-[16.5px]" data-testid="button-submit-login" disabled={busy} onClick={login}>{busy ? "Checking..." : "Log in"}</Btn>
      {/* Without this the first thing a client tries is a wrong password, sees it work, and concludes
          the login is broken. It is deliberate: only driver accounts check a password here. */}
      <p className="text-center text-[13px] text-mute">Demo: any email opens the passenger app. Driver accounts use their own password.</p>
      <p className="text-center text-[14.5px] text-mute">New here? <button onClick={() => setSignup(true)} className="inline-flex min-h-12 items-center font-semibold text-green">Create passenger account</button></p>
      </div>

      <div className="mb-4 mt-[clamp(6px,1.6vh,18px)] rounded-xl border border-dashed border-line-strong bg-aground p-[clamp(12px,2vh,16px)]">
        <p className="flex items-center gap-2 font-display text-[15px] font-bold"><span className="rounded-sm bg-ink px-1.5 py-0.5 font-sans text-[12px] font-bold uppercase tracking-wider text-white">Demo</span>Demo accounts</p>
        <p className="mt-1 text-[13px] text-mute [@media(max-height:740px)]:hidden">One app, two experiences. Your login decides which one opens.</p>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          <button data-testid="button-passenger-demo" onClick={asPassenger} className="tap inline-flex min-h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-green/20 bg-ok px-1 text-[13px] font-semibold text-green"><User size={16} className="hidden shrink-0 min-[360px]:block" />Passenger demo</button>
          <button data-testid="button-driver-demo" onClick={() => asDriver()} className="tap inline-flex min-h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-orange/30 bg-warn px-1 text-[13px] font-semibold text-warn-ink"><CarFront size={16} className="hidden shrink-0 min-[360px]:block" />Driver demo</button>
        </div>
        <p className="mt-2 text-[12px] text-mute [@media(max-height:780px)]:hidden">Driver accounts are created by the dispatcher. There is no driver sign-up.</p>
      </div>

      <Sheet open={signup} onClose={() => setSignup(false)} title="Create passenger account">
        <div className="flex flex-col gap-3">
          {([["name", "Full name", User], ["email", "Email", Mail], ["phone", "Mobile for SMS and WhatsApp", PhoneIcon]] as const).map(([k, l, I]) => (
            <div key={k} className="relative"><I className="absolute left-4 top-1/2 -translate-y-1/2 text-mute" size={18} />
              <input data-testid={`input-signup-${k}`} aria-label={l} placeholder={l} className={inputCls + " pl-11"} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
          ))}
          <input type="password" data-testid="input-signup-password" autoComplete="new-password" aria-label="Password" placeholder="Choose a password (6+ characters)" className={inputCls} value={pwNew} onChange={(e) => setPwNew(e.target.value)} />
          <p className="text-[12px] text-mute">Prototype only: passwords are never stored.</p>
          <Btn data-testid="button-signup" onClick={() => {
            const digits = form.phone.replace(/\D/g, "");
            if (form.name.trim().length < 2) return toast("Enter your full name", "err");
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return toast("Enter a valid email address", "err");
            // Required, not optional: every trip in this product is confirmed by SMS and WhatsApp.
            if (digits.length < 7 || !/^[\d\s+()-]+$/.test(form.phone)) return toast("Enter a valid mobile number, e.g. +1 758 555 0100", "err");
            if (pwNew.length < 6) return toast("Choose a password of at least 6 characters", "err");
            actions.setIdentity({ name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim() });
            toast("Account created. Welcome to St Lu Taxi And Tours");
            asPassenger();
          }}>Create account</Btn>
          <p className="text-center text-[13px] text-mute">Drivers: your account is created by the dispatcher.</p>
        </div>
      </Sheet>
      <Sheet open={!!first} onClose={() => setFirst(null)} title="Set your own password">
        <p className="mb-4 text-[14.5px] text-mute">You logged in with the temporary password from the dispatcher. Choose your own to continue. The temporary one stops working.</p>
        <div className="flex flex-col gap-3">
          <Field label="New password"><input type="password" autoComplete="new-password" data-testid="input-new-password" className={inputCls} value={np.a} onChange={(e) => setNp({ ...np, a: e.target.value })} /></Field>
          <Field label="Repeat new password"><input type="password" autoComplete="new-password" data-testid="input-confirm-password" className={inputCls} value={np.b} onChange={(e) => setNp({ ...np, b: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") saveOwn(); }} /></Field>
          <Btn data-testid="button-save-password" onClick={saveOwn}>Save and continue</Btn>
        </div>
      </Sheet>
      <Sheet open={forgot} onClose={() => setForgot(false)} title="Reset password">
        <p className="mb-4 text-[15px] text-mute">In the real app we send a reset link to {email || "your email"}. Nothing is sent in this demo.</p>
        <Btn className="w-full" onClick={() => { setForgot(false); toast("In the real app a reset link is emailed. Nothing is sent in this demo."); }}>Send reset link</Btn>
      </Sheet>
    </Screen>
  );
}
