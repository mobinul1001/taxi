import { useEffect, useRef, useState } from "react";

const DEVICES: [string, number, number][] = [["iPhone SE", 320, 568], ["iPhone 8", 375, 667], ["iPhone 13 mini", 375, 812], ["iPhone 14", 390, 844], ["iPhone 15 Pro Max", 430, 932], ["Galaxy S8", 360, 740], ["Galaxy S23", 412, 915], ["Pixel 7", 412, 915], ["Galaxy Fold", 344, 882], ["iPad Mini", 768, 1024], ["iPad Air", 820, 1180], ["iPad Pro 12.9", 1024, 1366], ["Galaxy Tab", 800, 1280]];
const ROUTES = ["/app/welcome", "/app/login", "/app/home", "/app/book/route", "/app/book/details", "/app/book/fare", "/app/book/payment", "/app/book/confirmed", "/app/trips", "/app/driver/jobs"];

/** Developer tool: shows the mobile app at many device sizes side by side. Open via #/lab. */
export function DeviceLab() {
  const [route, setRoute] = useState("/app/home");
  const [scale, setScale] = useState(0.6);
  const [report, setReport] = useState("");
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try { sessionStorage.setItem("stlu-session", JSON.stringify(/driver/.test(route) ? { role: "driver", driverId: "DRV-007" } : { role: "passenger" })); } catch { /* ignore */ }
  }, [route]);
  const base = location.href.split("#")[0];
  const measure = () => {
    const out: string[] = [];
    wrap.current?.querySelectorAll("iframe").forEach((f) => {
      try {
        const W = f.contentWindow!, D = W.document, root = D.querySelector("#phone-root");
        const name = f.dataset.name ?? "";
        if (!root) return void out.push(`${name}: no root`);
        const els = [...root.querySelectorAll("*")].filter((x) => x.scrollHeight > x.clientHeight + 2 && /auto|scroll/.test(W.getComputedStyle(x).overflowY));
        const sc = els.length ? Math.max(...els.map((x) => x.scrollHeight - x.clientHeight)) : 0;
        const hs = D.documentElement.scrollWidth - W.innerWidth;
        if (sc > 0 || hs > 0) out.push(`${name}: scroll ${sc}px${hs > 0 ? ` overflowX ${hs}px` : ""}`);
      } catch { out.push("blocked"); }
    });
    setReport(out.length ? out.join(" | ") : "ALL FIT");
  };
  return (
    <div className="bar-clear min-h-screen bg-aground text-ink">
      <header className="on-dark sticky top-0 z-10 flex flex-wrap items-center gap-2.5 bg-green-night px-4 py-2 text-white">
        <a href={`${base}#/`} className="tap inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-3.5 text-[13px] font-semibold">&larr; Start page</a>
        <h1 className="font-display text-[18px] font-bold">St Lu Device Lab</h1>
        <select id="lab-route" aria-label="Screen" value={route} onChange={(e) => setRoute(e.target.value)} className="h-11 max-w-full rounded-md bg-white pl-3 text-[14px] text-[#0F1F18]">{ROUTES.map((r) => <option key={r}>{r}</option>)}</select>
        <select aria-label="Zoom" value={scale} onChange={(e) => setScale(+e.target.value)} className="h-11 rounded-md bg-white pl-3 text-[14px] text-[#0F1F18]"><option value={1}>100%</option><option value={0.6}>60%</option><option value={0.45}>45%</option></select>
        <button id="lab-measure" onClick={measure} className="tap min-h-11 rounded-md bg-orange px-4 text-[14px] font-semibold text-orange-ink">Measure scroll</button>
        <span id="lab-report" className="text-[13px]">{report}</span>
      </header>
      <div ref={wrap} className="flex flex-wrap items-start gap-5 p-5">
        {DEVICES.map(([n, w, h]) => (
          <div key={n + route} className="flex max-w-full flex-col items-center">
            <b className="mb-1 text-[12px]">{n} {w}x{h}</b>
            <div className="thin-scroll max-w-full overflow-x-auto rounded-xl bg-[#0C1611] p-2 shadow-pop"><div className="overflow-hidden rounded-lg bg-white" style={{ width: w * scale, height: h * scale }}>
              <iframe title={n} data-name={n} src={`${base}#${route}`} style={{ width: w, height: h, border: 0, transform: `scale(${scale})`, transformOrigin: "0 0", display: "block" }} />
            </div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
