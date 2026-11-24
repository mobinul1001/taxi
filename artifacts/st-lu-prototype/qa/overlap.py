"""Button-on-button overlap check: any two clickable boxes that cover each other."""
import sys
from playwright.sync_api import sync_playwright
BUILD = sys.argv[1] if len(sys.argv) > 1 else "/home/claude/after"
P = '{"role":"passenger"}'; D = '{"role":"driver","driverId":"DRV-007"}'
ROUTES = [("/", None), ("/landing", None), ("/app/welcome", None), ("/app/login", None),
          ("/app/home", P), ("/app/book/route", P), ("/app/book/details", P), ("/app/book/fare", P),
          ("/app/book/payment", P), ("/app/trips", P), ("/app/trips/SLU-48213/live", P), ("/app/account", P),
          ("/app/driver/jobs", D), ("/app/driver/earnings", D), ("/app/driver/trips/SLU-48213/progress", D),
          ("/admin", "A"), ("/admin/bookings", "A"), ("/admin/live-map", "A"), ("/admin/drivers", "A"),
          ("/admin/passengers", "A"), ("/admin/pricing", "A"), ("/admin/reports", "A"),
          ("/job/job-slu-48298", None), ("/nope", None), ("/app/nope", P), ("/admin/nope", "A"),
          ("/demo?step=3&play=0", None), ("/demo?step=8&play=0", None)]
SIZES = [(320,568),(375,667),(390,844),(412,839),(768,1024),(820,1180),(1009,1366),(1280,720),(1440,900),(1920,1080),(2560,1440)]
JS = """() => {
  // the box you can actually see: clipped by every scrolling or hidden ancestor, then by the window
  const vis = e => { let r = e.getBoundingClientRect();
    let x1 = r.left, y1 = r.top, x2 = r.right, y2 = r.bottom;
    for (let p = e.parentElement; p; p = p.parentElement) { const cs = getComputedStyle(p);
      if (cs.overflow === 'visible' && cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      const pr = p.getBoundingClientRect();
      x1 = Math.max(x1, pr.left); y1 = Math.max(y1, pr.top); x2 = Math.min(x2, pr.right); y2 = Math.min(y2, pr.bottom); }
    x1 = Math.max(x1, 0); y1 = Math.max(y1, 0); x2 = Math.min(x2, innerWidth); y2 = Math.min(y2, innerHeight);
    return { left: x1, top: y1, right: x2, bottom: y2, width: x2 - x1, height: y2 - y1 }; };
  const els = [...document.querySelectorAll('button,a[href],select,input,[role=tab],[role=button]')]
    .filter(e => { const cs = getComputedStyle(e); if (cs.display==='none'||cs.visibility==='hidden'||cs.pointerEvents==='none') return false;
      const r = vis(e); return r.width > 2 && r.height > 2; });
  const id = e => e.getAttribute('data-testid') || e.getAttribute('aria-label') || (e.textContent||'').trim().slice(0,14) || e.tagName;
  const out = [];
  for (let i = 0; i < els.length; i++) for (let j = i+1; j < els.length; j++) {
    const a = els[i], b = els[j];
    if (a.contains(b) || b.contains(a)) continue;
    const ra = vis(a), rb = vis(b);
    const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
    const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
    if (ox > 3 && oy > 3) out.push(id(a) + ' x ' + id(b) + ' ' + Math.round(ox) + 'x' + Math.round(oy));
  }
  return [...new Set(out)];
}"""
bad = 0
with sync_playwright() as pw:
    br = pw.chromium.launch()
    for w, h in SIZES:
        ctx = br.new_context(viewport={"width": w, "height": h}); pg = ctx.new_page()
        for route, sess in ROUTES:
            init = "try{"
            if sess == "A": init += "sessionStorage.setItem('stlu-admin','1');localStorage.setItem('stlu-admin','1');"
            elif sess: init += "sessionStorage.setItem('stlu-session','%s');" % sess
            init += "}catch(e){}"
            pg.goto("about:blank"); pg.add_init_script(init)
            pg.goto(f"file://{BUILD}/index.html#{route}"); pg.wait_for_timeout(1500)
            hits = pg.evaluate(JS)
            if hits: bad += len(hits); print(f"{w}x{h} {route}: " + " | ".join(hits[:3]))
        ctx.close()
    br.close()
print("OVERLAP:", "FAIL" if bad else "PASS", bad)
