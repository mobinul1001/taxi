import sys; sys.path.insert(0, "/home/claude/tools")
from serve import serve
import sys, collections
from playwright.sync_api import sync_playwright
build = sys.argv[1]; dark = len(sys.argv) > 2 and sys.argv[2] == "dark"
ORIGIN = serve(build)
P = '{"role":"passenger"}'; D = '{"role":"driver","driverId":"DRV-007"}'
R = [("/",None,1440),("/landing",None,1440),("/demo",None,1440),("/demo?step=5",None,1440),("/demo?step=7",None,1440),("/demo",None,390),("/landing",None,390),("/previews/messages",None,1440),("/screens",None,1440),("/job/job-slu-48298",None,390),("/app/welcome",None,390),("/app/login",None,390),("/app/home",P,390),("/app/book/route",P,390),("/app/book/tour",P,390),("/app/book/details",P,390),("/app/book/fare",P,390),("/app/book/payment",P,390),("/app/trips",P,390),("/app/trips/SLU-48213",P,390),("/app/trips/SLU-48213/live",P,390),("/app/trips/SLU-47102/receipt",P,390),("/app/trips/SLU-47102/complete",P,390),("/app/alerts",P,390),("/app/account",P,390),("/app/driver/jobs",D,390),("/app/driver/trips",D,390),("/app/driver/trips/SLU-48290",D,390),("/app/driver/trips/SLU-48290/progress",D,390),("/app/driver/earnings",D,390),("/app/driver/profile",D,390),("/app/driver/renew",D,390),("/app/driver/alerts",D,390),
 ("/admin/login",None,1440),("/admin","A",1440),("/admin/bookings","A",1440),("/admin/live-map","A",1440),("/admin/drivers","A",1440),("/admin/drivers/DRV-007","A",1440),("/admin/passengers","A",1440),("/admin/pricing","A",1440),("/admin/refunds","A",1440),("/admin/reports","A",1440),("/admin/settings","A",1440)]
JS = r'''() => {
 const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) { const o = c.match(/oklab|oklch|color\(/); return null; } const p = m[1].split(/[ ,\/]+/).map(parseFloat); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
 const lum = (r, g, b) => { const f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
 const over = (fg, bg) => [0, 1, 2].map(i => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat(1);
 const bgOf = (e) => { let stack = []; let p = e; while (p) { const cs = getComputedStyle(p); if (cs.backgroundImage !== 'none') return null; const c = parse(cs.backgroundColor); if (c === null && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') return null; if (c && c[3] > 0) { stack.push(c); if (c[3] >= 1) break; } if (cs.position === 'absolute' || cs.position === 'fixed') { if (!(c && c[3] >= 1)) return null; } p = p.parentElement; }
   let base = [255, 255, 255, 1]; if (!stack.length || stack[stack.length - 1][3] < 1) { const b = parse(getComputedStyle(document.body).backgroundColor); if (b) base = b; }
   for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base); return base; };
 const out = [];
 for (const e of document.querySelectorAll('body *')) {
   if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1)) continue;
   const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); if (!r.width || !r.height || cs.visibility === 'hidden' || +cs.opacity < .5) continue;
   if (e.closest('[disabled],[aria-hidden=true],svg,.sr-only,option')) continue; let hid = false; let q = e; while (q) { const c = getComputedStyle(q); if (c.display === 'none' || +c.opacity < .5) { hid = true; break; } q = q.parentElement; } if (hid) continue;
   const fg0 = parse(cs.color); const bg = bgOf(e); if (!fg0 || !bg) { window.__skip = (window.__skip||0)+1; continue; } window.__ok = (window.__ok||0)+1; const fg = over(fg0, bg);
   const L1 = lum(fg[0], fg[1], fg[2]), L2 = lum(bg[0], bg[1], bg[2]); const ratio = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
   const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700; const large = size >= 24 || (size >= 18.66 && bold);
   if (ratio < (large ? 3 : 4.5)) out.push([cs.color, 'rgb(' + bg.slice(0, 3).map(Math.round).join(',') + ')', ratio.toFixed(2), Math.round(size), (e.textContent || '').trim().slice(0, 30)]);
 } return out; }'''
agg = collections.defaultdict(list); tot = [0, 0]
with sync_playwright() as p:
    b = p.chromium.launch()
    for route, sess, w in R:
        if dark and route.startswith("/admin"): continue
        c = b.new_context(viewport={"width": w, "height": 900})
        init = "try{"
        if sess in (P, D): init += f"sessionStorage.setItem('stlu-session','{sess}');"
        if sess == "A": init += "sessionStorage.setItem('stlu-admin','1');"
        if dark: init += "localStorage.setItem('stlu-theme','dark');"
        c.add_init_script(init + "}catch(e){}"); pg = c.new_page(); pg.goto(f"{ORIGIN}/index.html#{route}"); pg.wait_for_timeout(900)
        for fg, bg, ratio, size, txt in pg.evaluate(JS): agg[(fg, bg, ratio)].append((route, size, txt))
        k = pg.evaluate("[window.__ok||0, window.__skip||0]"); tot[0] += k[0]; tot[1] += k[1]
        c.close()
    b.close()
for (fg, bg, ratio), v in sorted(agg.items(), key=lambda x: float(x[0][2])):
    print(ratio, fg, "on", bg, f"x{len(v)}", "|", v[0][0], f"{v[0][1]}px", repr(v[0][2]))
print("checked", tot[0], "skipped (gradient/unknown bg)", tot[1]); print("FAILING PAIRS:", len(agg), "ELEMENTS:", sum(len(v) for v in agg.values()))
