import sys, json
from playwright.sync_api import sync_playwright
build = sys.argv[1]
widths = [int(w) for w in sys.argv[2].split(",")]
only = sys.argv[3].split(",") if len(sys.argv) > 3 else None
browser = sys.argv[4] if len(sys.argv) > 4 else "chromium"
P = '{"role":"passenger"}'; D = '{"role":"driver","driverId":"DRV-007"}'
R = [("/",None),("/landing",None),("/demo",None),("/demo?step=5",None),("/demo?step=7",None),("/lab",None),("/previews/messages",None),("/screens",None),("/job/job-slu-48298",None),
 ("/app/welcome",None),("/app/login",None),("/app/terms",None),("/app/home",P),("/app/book/route",P),("/app/book/tour",P),("/app/book/round-trip",P),
 ("/app/book/details",P),("/app/book/fare",P),("/app/book/payment",P),("/app/book/payment-failed",P),("/app/book/confirmed",P),("/app/quote/sent",P),
 ("/app/trips",P),("/app/trips/SLU-48213",P),("/app/trips/SLU-48213/cancel",P),("/app/trips/SLU-48213/live",P),("/app/trips/SLU-48213/receipt",P),
 ("/app/trips/SLU-48213/cancelled",P),("/app/trips/SLU-48213/complete",P),("/app/alerts",P),("/app/alerts/flight-delayed",P),("/app/account",P),("/app/account/cards/new",P),
 ("/app/driver/jobs",D),("/app/driver/new-trip",D),("/app/driver/trips",D),("/app/driver/trips/SLU-48290",D),("/app/driver/trips/SLU-48290/progress",D),
 ("/app/driver/trips/SLU-48290/done",D),("/app/driver/trips/SLU-48318/changed",D),("/app/driver/renew",D),("/app/driver/renew/upload",D),
 ("/app/driver/earnings",D),("/app/driver/profile",D),("/app/driver/alerts",D),
 ("/admin/login",None),("/admin/forgot-password",None),("/admin","A"),("/admin/bookings","A"),("/admin/live-map","A"),("/admin/drivers","A"),("/admin/drivers/DRV-007","A"),
 ("/admin/passengers","A"),("/admin/pricing","A"),("/admin/refunds","A"),("/admin/reports","A"),("/admin/settings","A"),("/nope",None)]
H = {320:568,344:882,360:740,375:667,390:844,412:915,430:932,768:1024,820:1180,1024:768,1280:720,1366:768,1440:900,1920:1080,2560:1440}
JS = r'''() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false;
    if (r.bottom < 0 || r.right < 0 || r.top > innerHeight * 4) return false; let p = e; while (p) { const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden') return false; p = p.parentElement; } return true; };
  const out = { ovx: document.documentElement.scrollWidth - innerWidth, h1: [...document.querySelectorAll('h1')].filter(vis).length, small: [], nolabel: [], clip: [], offscreen: [], tiny: [], empty: [], trunc: [], tall: [] };
  const name = (e) => (e.getAttribute('data-testid') || e.getAttribute('aria-label') || (e.textContent || '').trim().slice(0, 28) || e.tagName);
  for (const e of document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,[role=switch],[role=tab],summary')) {
    if (!vis(e)) continue; if (e.closest('[data-testid=demo-bar]')) continue;
    let r = e.getBoundingClientRect();
    // include pseudo-element hit area extension
    const a = getComputedStyle(e, '::after'); let w = r.width, h = r.height;
    if (a && a.content !== 'none' && a.position === 'absolute') { const t = parseFloat(a.top) || 0, b = parseFloat(a.bottom) || 0, l = parseFloat(a.left) || 0, rr = parseFloat(a.right) || 0; h = Math.max(h, r.height - t - b); w = Math.max(w, r.width - l - rr); }
    if (r.width <= 2) continue; if (e.matches('input,textarea,select') && e.closest('label')) { const lab = e.closest('label'); if (lab) { const lr = lab.getBoundingClientRect(); w = lr.width; h = lr.height; } }
    const inline = e.tagName === 'A' && getComputedStyle(e).display === 'inline';
    if (!inline && (h < 43.5 || w < 43.5)) out.small.push(name(e) + ' ' + Math.round(w) + 'x' + Math.round(h));
    if (r.right > innerWidth + 1 && !e.closest('.overflow-x-auto,.overflow-auto')) out.offscreen.push(name(e));
    if (e.matches('input,select,textarea')) { const ok = e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || e.closest('label') || (e.id && document.querySelector('label[for="' + e.id + '"]')); if (!ok) out.nolabel.push(name(e) + '|' + (e.getAttribute('placeholder') || e.type)); }
  }
  for (const e of document.querySelectorAll('h1,h2,h3,p,span,b,button,a,td,th,label')) {
    if (!vis(e) || !e.childNodes.length) continue; if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    const cs = getComputedStyle(e); if (cs.overflow === 'visible' && cs.overflowX === 'visible') continue;
    if (e.closest('.sr-only') || e.classList.contains('sr-only')) continue;
    if (e.closest('.leaflet-container')) continue;  // a map viewport is not a clipped label
    if (e.scrollWidth > e.clientWidth + 1 && cs.textOverflow !== 'ellipsis') out.clip.push(name(e));
    if (cs.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth + 1) out.trunc.push(name(e));
    if (parseFloat(cs.fontSize) < 11.99 && !e.closest('.sr-only') && !e.classList.contains('sr-only')) out.tiny.push(name(e) + '@' + cs.fontSize);
    // a text box squeezed to a sliver: letters stack one per line
    if (e.children.length === 0 && e.textContent.trim().length > 3) { const r = e.getBoundingClientRect(); if (r.width > 0 && r.width < 26 && r.height > 60) out.tall.push(name(e) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
  }
  // no dead field larger than 40% of the viewport on tablet and desktop
  if (innerWidth >= 768) {
    const cells = 12, cw = innerWidth / cells, ch = Math.min(innerHeight, document.documentElement.scrollHeight) / cells;
    const filled = Array.from({ length: cells * cells }, () => false);
    for (const e of document.querySelectorAll('body *')) {
      if (!vis(e)) continue;
      const cs = getComputedStyle(e);
      const paints = (e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
        || ['IMG','SVG','VIDEO','CANVAS','INPUT','SELECT','TEXTAREA','BUTTON','HR'].includes(e.tagName)
        || (cs.backgroundImage !== 'none') || (cs.borderTopWidth !== '0px') || (cs.boxShadow !== 'none');
      if (!paints) continue;
      const r = e.getBoundingClientRect();
      const x0 = Math.max(0, Math.floor(r.left / cw)), x1 = Math.min(cells - 1, Math.floor((r.right - 1) / cw));
      const y0 = Math.max(0, Math.floor(r.top / ch)), y1 = Math.min(cells - 1, Math.floor((r.bottom - 1) / ch));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) filled[y * cells + x] = true;
    }
    // biggest empty rectangle, as a share of the viewport
    let best = 0;
    for (let y0 = 0; y0 < cells; y0++) for (let x0 = 0; x0 < cells; x0++) {
      if (filled[y0 * cells + x0]) continue;
      for (let y1 = y0; y1 < cells; y1++) {
        let okRow = true;
        for (let x = x0; x <= x0 && okRow; x++) okRow = !filled[y1 * cells + x];
        if (!okRow) break;
        let x1 = x0;
        while (x1 + 1 < cells) { let ok = true; for (let y = y0; y <= y1; y++) if (filled[y * cells + x1 + 1]) { ok = false; break; } if (!ok) break; x1++; }
        best = Math.max(best, ((x1 - x0 + 1) * (y1 - y0 + 1)) / (cells * cells));
      }
    }
    if (best > 0.4) out.empty.push(Math.round(best * 100) + '% of the viewport');
  }
  return out; }'''
tot = {"ovx":0,"h1":0,"small":0,"nolabel":0,"clip":0,"offscreen":0,"tiny":0,"empty":0,"trunc":0,"tall":0,"err":0}
with sync_playwright() as p:
    b = getattr(p, browser).launch()
    for w in widths:
        for route, sess in R:
            if only and not any(o in route for o in only): continue
            ctx = b.new_context(viewport={"width": w, "height": H.get(w, 900)})
            init = "try{"
            if sess in (P, D): init += f"sessionStorage.setItem('stlu-session', '{sess}');"
            if sess == "A": init += "sessionStorage.setItem('stlu-admin','1');"
            ctx.add_init_script(init + "}catch(e){}")
            pg = ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.goto(f"file://{build}/index.html#{route}"); pg.wait_for_timeout(700)
            r = pg.evaluate(JS)
            msgs = []
            if r["ovx"] > 0: msgs.append(f"OVERFLOW-X {r['ovx']}"); tot["ovx"] += 1
            if r["h1"] != 1: msgs.append(f"H1={r['h1']}"); tot["h1"] += 1
            for k in ("small","nolabel","clip","offscreen","tiny","empty","trunc","tall"):
                if r[k]: msgs.append(f"{k}: " + "; ".join(sorted(set(r[k]))[:8])); tot[k] += len(set(r[k]))
            if errs: msgs.append("JSERR " + errs[0][:100]); tot["err"] += 1
            if msgs: print(w, route, "|", " | ".join(msgs))
            ctx.close()
    b.close()
print("TOTAL", tot)
