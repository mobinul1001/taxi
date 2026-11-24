import type { CSSProperties } from "react";

/** Tiny illustrative visuals for the home feature grid. Decorative: aria-hidden, no real data. */
const box: CSSProperties = { marginTop: "auto", paddingTop: 12 };
const row: CSSProperties = { display: "flex", alignItems: "center", gap: 8 };
const pill = (c: string, bg: string): CSSProperties => ({ fontSize: 11, fontWeight: 700, color: c, background: bg, padding: "2px 8px", borderRadius: 999 });

export const SchedVis = () => (
  <div aria-hidden style={box}><div style={{ ...row, flexWrap: "wrap" }}>{["Mon", "Tue", "Wed", "Thu"].map((d, i) => <span key={d} style={{ ...pill(i === 2 ? "#fff" : "#1b3fb8", i === 2 ? "#2b63ff" : "#eaf0ff"), padding: "6px 10px" }}>{d}</span>)}</div><div style={{ ...row, marginTop: 8, fontSize: 12, color: "#64708f" }}>Airport pickup · 06:30</div></div>
);
export const PayVis = () => (
  <div aria-hidden style={box}><div style={{ ...row, justifyContent: "space-between", padding: "8px 10px", borderRadius: 10, background: "#f1f5ff", fontSize: 12, fontWeight: 650 }}><span>Card ···· 4242</span><span style={pill("#0a7a4f", "#d9f7ea")}>Paid</span></div></div>
);
export const FareVis = () => (
  <div aria-hidden style={{ ...box, fontSize: 12, color: "#26324f" }}>{[["Base fare", "$3.00"], ["Distance", "$8.40"], ["Total", "$11.40"]].map(([a, b], i) => <div key={a} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontWeight: i === 2 ? 750 : 500, borderTop: i === 2 ? "1px solid #dbe3f5" : 0 }}><span>{a}</span><span>{b}</span></div>)}</div>
);
export const NotifVis = () => (
  <div aria-hidden style={box}><div style={{ padding: "8px 10px", borderRadius: 10, background: "#f1f5ff", fontSize: 12, borderLeft: "3px solid #2b63ff" }}><b>Driver arriving</b><div style={{ color: "#64708f" }}>Your taxi is 2 min away</div></div></div>
);
export const StarVis = () => (
  <div aria-hidden style={{ ...box, ...row, gap: 3 }}>{[1, 2, 3, 4, 5].map((i) => <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={i <= 4 ? "#f5a524" : "#e3eafb"}><path d="M12 2l3 6.9 7.4.7-5.6 4.9 1.7 7.3L12 17.8 5.5 21.8l1.7-7.3L1.6 9.6 9 8.9z" /></svg>)}</div>
);
export const HistVis = () => (
  <div aria-hidden style={{ ...box, fontSize: 12, color: "#26324f" }}>{["Airport · $42.00", "Harbour · $11.40"].map((t) => <div key={t} style={{ padding: "4px 0", borderTop: "1px solid #e3eafb" }}>{t}</div>)}</div>
);
export const PromoVis = () => (
  <div aria-hidden style={box}><span style={{ display: "inline-block", padding: "6px 12px", borderRadius: 8, border: "1.5px dashed #2b63ff", color: "#1b3fb8", fontWeight: 750, fontSize: 13, letterSpacing: ".06em" }}>WELCOME10</span></div>
);
export const BarsVis = () => (
  <div aria-hidden style={{ ...box, display: "flex", alignItems: "flex-end", gap: 5, height: 56 }}>{[30, 44, 36, 52, 40, 60, 48].map((h, i) => <span key={i} style={{ flex: 1, height: h, borderRadius: 4, background: i === 5 ? "#2b63ff" : "#c7d6ff" }} />)}</div>
);
