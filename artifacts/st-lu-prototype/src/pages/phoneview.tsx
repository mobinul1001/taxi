import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, MonitorSmartphone } from "lucide-react";

/** The mobile app drawn inside a phone, whole, on a laptop or tablet. A real phone skips this and opens the app itself. */
const W = 390, H = 844, BEZEL = 10, HEAD = 76, PAD = 20;

export default function PhoneView() {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  // On a real phone the app already fills the screen, so there is nothing to frame.
  if (vp.w < 560) return <Navigate to="/app/welcome" replace />;
  const fullW = W + BEZEL * 2, fullH = H + BEZEL * 2;
  const k = Math.max(0.4, Math.min(1, (vp.h - HEAD - PAD * 2) / fullH, (vp.w - PAD * 2) / fullW));
  // The frame loads the app by its own address: hash form in the portable build, plain path otherwise.
  const src = import.meta.env.VITE_HASH_ROUTER
    ? `${location.href.split("#")[0]}#/app/welcome`
    : `${import.meta.env.BASE_URL.replace(/\/$/, "")}/app/welcome`;
  return (
    <div className="bar-clear flex min-h-[100dvh] flex-col bg-aground" data-testid="phone-view">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3" style={{ minHeight: HEAD }}>
        <div className="flex items-center gap-3">
          <Link to="/" className="tap inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-paper px-4 text-[13px] font-semibold text-ink hover:border-green/60"><ArrowLeft size={15} />Back to start</Link>
          <div><h1 className="font-display text-[18px] font-bold leading-tight">Mobile app</h1><p className="text-[13px] text-mute">Passenger and driver, shown as on a phone</p></div>
        </div>
        <Link to="/app" className="tap inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-paper px-4 text-[13px] font-semibold text-ink hover:border-green/60"><MonitorSmartphone size={15} />Open the web app</Link>
      </header>
      <main className="flex flex-1 items-start justify-center" style={{ padding: `0 ${PAD}px ${PAD}px` }}>
        <div style={{ width: fullW * k, height: fullH * k }}>
          <div style={{ width: fullW, height: fullH, transform: `scale(${k})`, transformOrigin: "0 0", padding: BEZEL, borderRadius: 52, background: "#0B0F0D", boxShadow: "0 30px 60px -24px rgba(0,0,0,.55), inset 0 0 0 2px #2a312d" }}>
            <iframe title="St Lu mobile app" src={src} style={{ width: W, height: H, border: 0, borderRadius: 42, background: "#fff", display: "block" }} />
          </div>
        </div>
      </main>
    </div>
  );
}
