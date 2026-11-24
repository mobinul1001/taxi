import type { CSSProperties, ReactNode } from "react";
import { BarChart3, Car, CheckCircle2, MapPin, Navigation, Star, Users } from "lucide-react";
import { useBoxWidth } from "@/lib/box-width";

/**
 * Product pictures for the TaxiAppDevelopment.org page. They are drawn in code (no stock photos) and are
 * decorative: every one is aria-hidden. They are authored at a fixed pixel size and scaled to fit by <Scaled>.
 */
export function Scaled({ w, h, children, className }: { w: number; h: number; children: ReactNode; className?: string }) {
  const [ref, bw] = useBoxWidth();
  const k = Math.min(1, (bw >= 4000 ? w : bw) / w);
  return (
    <div ref={ref} aria-hidden className={`scaled ${className ?? ""}`} style={{ height: h * k }}>
      <div className="scaled-in mk" style={{ width: w, height: h, transform: `scale(${k})` }}>{children}</div>
    </div>
  );
}

type Accent = { a: string; soft: string; ink?: string };
export const BLUE: Accent = { a: "#2b63ff", soft: "#eaf0ff" };
export const STLU: Accent = { a: "#ea6a12", soft: "#fff0e2" };

/** A stylised street map: roads, water and a route from pickup to destination. Not a real place. */
export function RouteMap({ w = 440, h = 300, accent = BLUE, route = true, style, vb = "0 0 440 300" }: { w?: number; h?: number; accent?: Accent; route?: boolean; style?: CSSProperties; vb?: string }) {
  return (
    <svg viewBox={vb} width={w} height={h} preserveAspectRatio="xMidYMid slice" style={style} role="presentation">
      <rect width="440" height="300" fill="#eaf0f7" />
      <path d="M-10 230 C70 200 120 270 200 250 S340 190 450 230 L450 310 L-10 310Z" fill="#cfe3f7" />
      <rect x="300" y="26" width="100" height="70" rx="14" fill="#dcebe0" />
      <g stroke="#fff" strokeWidth="9" strokeLinecap="round" fill="none">
        <path d="M-10 90 H450" /><path d="M-10 170 H450" /><path d="M110 -10 V310" /><path d="M250 -10 V310" /><path d="M370 -10 V200" />
        <path d="M-10 40 L150 120 L450 130" strokeWidth="6" />
      </g>
      <g stroke="#dfe6f1" strokeWidth="2" fill="none"><path d="M60 -10 V200" /><path d="M180 -10 V220" /><path d="M-10 130 H450" /><path d="M310 -10 V230" /></g>
      {route && (
        <>
          <path d="M92 220 V170 H250 V90 H372" fill="none" stroke={accent.a} strokeOpacity=".22" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M92 220 V170 H250 V90 H372" fill="none" stroke={accent.a} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 0" />
          <circle cx="92" cy="220" r="10" fill="#fff" stroke={accent.a} strokeWidth="4" />
          <g transform="translate(372 90)"><path d="M0 -26 C-13 -26 -20 -16 -20 -7 C-20 6 0 22 0 22 C0 22 20 6 20 -7 C20 -16 13 -26 0 -26Z" fill="#0a1330" /><circle cx="0" cy="-8" r="6" fill="#fff" /></g>
          <g transform="translate(250 128) rotate(-90)"><circle r="14" fill="#fff" stroke={accent.a} strokeWidth="3" /><path d="M-4 5 L0 -7 L4 5 L0 2Z" fill={accent.a} /></g>
        </>
      )}
    </svg>
  );
}

export function PassengerScreen({ accent = BLUE, brand = "" }: { accent?: Accent; brand?: string }) {
  return (
    <div className="screen">
      <div style={{ position: "absolute", inset: 0 }}><RouteMap w={204} h={440} accent={accent} style={{ position: "absolute", left: -120, top: 0, width: 440, height: 300 }} /></div>
      <div className="st" style={{ position: "relative" }}><span>9:41</span><span>5G</span></div>
      <div className="m-card" style={{ position: "absolute", left: 10, right: 10, top: 40, padding: "9px 11px" }}>
        <div className="m-row"><span className="m-dot" style={{ background: accent.a }} /><span style={{ fontWeight: 650 }}>{brand || "Pickup point"}</span></div>
        <div className="m-row" style={{ marginTop: 7 }}><span className="m-dot" style={{ background: "#0a1330", borderRadius: 2 }} /><span style={{ color: "#64708f" }}>Where to?</span></div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "#fff", borderRadius: "20px 20px 0 0", padding: "12px 12px 14px", boxShadow: "0 -10px 30px rgba(10,19,48,.12)" }}>
        <div style={{ width: 34, height: 4, background: "#dde3f1", borderRadius: 3, margin: "0 auto 10px" }} />
        {[["Economy", "4 min", true], ["Comfort", "6 min", false], ["Van, 6 seats", "9 min", false]].map(([n, t, on]) => (
          <div key={n as string} className="m-row" style={{ padding: "8px 9px", borderRadius: 11, marginBottom: 5, background: on ? accent.soft : "#f6f8fc", boxShadow: on ? `inset 0 0 0 1.5px ${accent.a}` : "none" }}>
            <Car size={17} color={on ? accent.a : "#64708f"} /><div style={{ flex: 1 }}><b style={{ fontWeight: 650 }}>{n}</b><div style={{ color: "#64708f", fontSize: 11 }}>{t} away</div></div><b>Fare est.</b>
          </div>
        ))}
        <span className="m-btn" style={{ background: accent.a, marginTop: 8 }}>Confirm ride</span>
      </div>
    </div>
  );
}

export function DriverScreen({ accent = BLUE }: { accent?: Accent }) {
  return (
    <div className="screen" style={{ background: "#f4f6fb" }}>
      <div className="st"><span>9:41</span><span>5G</span></div>
      <div style={{ padding: "14px 12px 0" }}>
        <div className="m-row" style={{ justifyContent: "space-between" }}>
          <div><div style={{ color: "#64708f", fontSize: 11 }}>Today</div><b style={{ fontSize: 22, letterSpacing: "-.02em" }}>$186.50</b></div>
          <span className="m-chip" style={{ background: "#d9f7ea", color: "#0a7a4f" }}><span className="m-dot" style={{ background: "#12b76a", width: 7, height: 7 }} />Online</span>
        </div>
        <div className="m-card" style={{ marginTop: 12, overflow: "hidden" }}><RouteMap w={196} h={116} accent={accent} style={{ display: "block", width: 196, height: 116 }} /></div>
        <div className="m-card" style={{ marginTop: 10, padding: 11 }}>
          <div className="m-row" style={{ justifyContent: "space-between" }}><b>New ride request</b><span style={{ color: accent.a, fontWeight: 700 }}>0:12</span></div>
          <div className="m-row" style={{ marginTop: 8 }}><span className="m-dot" style={{ background: accent.a }} /><span>Airport, Arrivals</span></div>
          <div className="m-row" style={{ marginTop: 5 }}><span className="m-dot" style={{ background: "#0a1330", borderRadius: 2 }} /><span>Harbour Hotel</span></div>
          <div className="m-row" style={{ marginTop: 10, gap: 6 }}><span className="m-btn" style={{ flex: 1, background: accent.a }}>Accept</span></div>
        </div>
        <div className="m-row" style={{ marginTop: 10, justifyContent: "space-around", color: "#64708f", fontSize: 11 }}><span>Trips</span><span>Earnings</span><span>Profile</span></div>
      </div>
    </div>
  );
}

export function Phone({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div className="phone" style={style}>{children}</div>;
}

export function RideCard({ accent = BLUE, style }: { accent?: Accent; style?: CSSProperties }) {
  return (
    <div className="m-card" style={{ width: 252, padding: 13, ...style }}>
      <div className="m-row" style={{ justifyContent: "space-between" }}>
        <span className="m-chip" style={{ background: "#d9f7ea", color: "#0a7a4f", whiteSpace: "nowrap" }}><CheckCircle2 size={13} />Ride confirmed</span>
        <b style={{ fontSize: 12, whiteSpace: "nowrap" }}>4 min away</b>
      </div>
      <div className="m-row" style={{ marginTop: 11 }}>
        <span style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${accent.a}, #22d3ee)`, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700 }}>MJ</span>
        <div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>Marcus J.</b><div className="m-row" style={{ gap: 3, color: "#64708f", fontSize: 11.5 }}><Star size={11} fill="#f5b301" color="#f5b301" />4.9 · Toyota Noah</div></div>
      </div>
      <div className="m-bar" style={{ marginTop: 11 }}><div style={{ width: "64%", height: "100%", borderRadius: 4, background: accent.a }} /></div>
    </div>
  );
}

export function LiveWidget({ style }: { style?: CSSProperties }) {
  return (
    <div className="m-card" style={{ padding: "9px 13px 9px 10px", display: "flex", alignItems: "center", gap: 9, ...style }}>
      <span className="pulse" style={{ width: 30, height: 30, borderRadius: "50%", background: "#0a1330", display: "grid", placeItems: "center", color: "#22d3ee" }}><Navigation size={14} /></span>
      <div><b style={{ fontSize: 12.5 }}>Live tracking</b><div style={{ color: "#64708f", fontSize: 11.5 }}>Driver is 1.2 km away</div></div>
    </div>
  );
}

export function AdminDash({ w = 560, accent = BLUE, title = "Operations" }: { w?: number; accent?: Accent; title?: string }) {
  const bars = [38, 52, 44, 66, 58, 80, 72, 90, 70, 96, 84, 62];
  const rows = [["Pickup: Airport", "Assigned", "#d9f7ea", "#0a7a4f"], ["Pickup: Harbour", "Pending", "#fff1d6", "#9a5b00"], ["Pickup: Old Town", "On trip", accent.soft, accent.a]];
  return (
    <div className="browser" style={{ width: w }}>
      <div className="tb"><i /><i /><i /><span style={{ marginLeft: 10, background: "#fff", borderRadius: 8, padding: "3px 12px", color: "#64708f", fontSize: 11 }}>admin.example.com</span></div>
      <div style={{ display: "flex", height: 292 }}>
        <div style={{ width: 118, background: "#0a1330", color: "#c7d2ef", padding: "14px 10px", display: "grid", gap: 4, alignContent: "start", fontSize: 11.5 }}>
          <b style={{ color: "#fff", marginBottom: 8 }}>Dispatch</b>
          {["Dashboard", "Bookings", "Live map", "Drivers", "Pricing", "Reports"].map((n, i) => <span key={n} style={{ padding: "6px 8px", borderRadius: 7, background: i === 0 ? "rgba(43,99,255,.4)" : "none", color: i === 0 ? "#fff" : undefined }}>{n}</span>)}
        </div>
        <div style={{ flex: 1, padding: 12, background: "#f4f6fb", minWidth: 0 }}>
          <b style={{ fontSize: 13 }}>{title}</b>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, marginTop: 8 }}>
            {[[Users, "Drivers"], [Car, "Active trips"], [BarChart3, "Bookings"]].map(([I, l]) => { const Ic = I as typeof Users; return <div key={l as string} className="m-card" style={{ padding: 8, boxShadow: "0 0 0 1px #e2e8f4" }}><Ic size={13} color={accent.a} /><div style={{ color: "#64708f", fontSize: 10.5, marginTop: 3 }}>{l as string}</div><div className="m-bar" style={{ width: "58%", marginTop: 5, background: accent.soft }} /></div>; })}
          </div>
          <div className="m-card" style={{ marginTop: 8, padding: "8px 10px", boxShadow: "0 0 0 1px #e2e8f4", display: "flex", alignItems: "flex-end", gap: 5, height: 64, flex: "none" }}>
            {bars.map((b, i) => <span key={i} style={{ flex: 1, height: `${b}%`, borderRadius: 3, background: i === 9 ? accent.a : accent.soft === "#eaf0ff" ? "#c7d6ff" : "#ffd2ad" }} />)}
          </div>
          <div style={{ marginTop: 8, display: "grid", gap: 5 }}>
            {rows.map(([a, b, bg, fg]) => <div key={a} className="m-card" style={{ padding: "6px 9px", boxShadow: "0 0 0 1px #e2e8f4", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>{a}</span><span className="m-chip" style={{ background: bg, color: fg, padding: "1px 7px" }}>{b}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* small pictures for service and feature cards */
export function BookingVis() {
  return (
    <div aria-hidden className="mk" style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
      <div className="m-card" style={{ flex: 1, padding: 12, fontSize: 13 }}>
        <div className="m-row"><span className="m-dot" style={{ background: "#2b63ff" }} /><b>Passenger</b></div>
        <div className="m-skel" style={{ height: 30, marginTop: 9 }} /><div className="m-row" style={{ marginTop: 8 }}><span className="m-btn" style={{ flex: 1, padding: 7 }}>Book</span></div>
      </div>
      <div style={{ alignSelf: "center", color: "#2b63ff" }}><Navigation size={22} /></div>
      <div className="m-card" style={{ flex: 1, padding: 12, fontSize: 13 }}>
        <div className="m-row"><span className="m-dot" style={{ background: "#12b76a" }} /><b>Driver</b></div>
        <div className="m-skel" style={{ height: 30, marginTop: 9 }} /><div className="m-row" style={{ marginTop: 8 }}><span className="m-btn" style={{ flex: 1, padding: 7, background: "#0a1330" }}>Accept</span></div>
      </div>
    </div>
  );
}
export function WorkflowVis() {
  const steps = ["Request", "Quote", "Dispatch", "Trip"];
  return (
    <div aria-hidden className="mk" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {steps.map((s, i) => <span key={s} className="m-row" style={{ gap: 6 }}><span style={{ padding: "6px 11px", borderRadius: 9, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)", color: "#fff", fontSize: 13, fontWeight: 600 }}>{s}</span>{i < 3 && <span style={{ color: "#6c9bff", fontSize: 15 }}>→</span>}</span>)}
    </div>
  );
}
export function BrandVis() {
  return (
    <div aria-hidden className="mk" style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {["#2b63ff", "#12b76a", "#ea6a12", "#7a3cf0"].map((c, i) => <span key={c} style={{ width: 40, height: 40, borderRadius: 12, background: c, boxShadow: i === 0 ? "0 0 0 3px #fff, 0 0 0 5px #2b63ff" : "none" }} />)}
      <span style={{ marginLeft: 6, fontSize: 13, color: "#4b5878", fontWeight: 600 }}>Your brand, your colours</span>
    </div>
  );
}
export function FlowVis() {
  return (
    <div aria-hidden className="mk m-card" style={{ padding: 10, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 104, height: 70, borderRadius: 10, overflow: "hidden", flex: "none" }}><RouteMap w={104} h={70} style={{ width: 104, height: 70 }} /></div>
      <div style={{ fontSize: 13, display: "grid", gap: 5 }}>
        <span className="m-row"><MapPin size={14} color="#2b63ff" />Pickup to destination</span>
        <span className="m-row"><Star size={14} color="#f5b301" fill="#f5b301" />Rate your driver</span>
      </div>
    </div>
  );
}
export function GpsVis() {
  return <div aria-hidden className="mk" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f4", marginTop: "auto" }}><RouteMap vb="0 50 440 200" w={440} h={200} style={{ display: "block", width: "100%", height: "auto" }} /></div>;
}
export function MatchVis() {
  return (
    <div aria-hidden className="mk" style={{ marginTop: "auto", display: "grid", gap: 7 }}>
      {[["Nearest driver", "1.1 km", true], ["Driver 2", "2.4 km", false], ["Driver 3", "3.0 km", false]].map(([n, d, on]) => (
        <div key={n as string} className="m-row" style={{ padding: "8px 12px", borderRadius: 10, background: on ? "#eaf0ff" : "#f6f8fc", boxShadow: on ? "inset 0 0 0 1.5px #2b63ff" : "none", fontSize: 13.5, fontWeight: 600 }}>
          <Car size={15} color={on ? "#2b63ff" : "#64708f"} /><span style={{ flex: 1 }}>{n}</span><span style={{ color: "#4b5878" }}>{d}</span>
        </div>
      ))}
    </div>
  );
}
