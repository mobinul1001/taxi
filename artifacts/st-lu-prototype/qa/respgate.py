"""Responsive gate: every page, every device, light and dark."""
import sys; sys.path.insert(0, "/home/claude/tools")
from serve import serve
import sys, json
from playwright.sync_api import sync_playwright
BUILD = "/home/claude/after"
ORIGIN = serve(BUILD)
P = '{"role":"passenger"}'; D = '{"role":"driver","driverId":"DRV-007"}'
DEVS = """4500x3000 4480x2520 3840x2160 3840x2400 2560x1600 2048x1536 1920x1200 1920x1080 1680x1050 1680x945 1600x1200 1600x900 1440x900 1400x1050 1366x768 1280x1024 1280x720 1024x768 960x540 800x600 768x576 640x480 320x240 2496x1664 1800x1440 430x932 412x915 393x852 390x844 375x667 360x800 1600x2560 1024x1366 900x1200 834x1194 820x1180 810x1080 800x1400 800x1280 800x1200 768x1024 1009x768 344x882 673x841"""
DEV = [(d, int(d.split("x")[0]), int(d.split("x")[1])) for d in DEVS.split()]
PAGES = [("/", None),("/landing", None),("/app/welcome", None),("/app/login", None),
         ("/app/home", P),("/app/book/route", P),("/app/book/details", P),("/app/book/fare", P),
         ("/app/book/payment", P),("/app/trips", P),("/app/trips/SLU-48213/live", P),("/app/account", P),
         ("/app/driver/jobs", D),("/app/driver/earnings", D),("/app/driver/trips/SLU-48213/progress", D),
         ("/admin", "A"),("/admin/bookings", "A"),("/admin/live-map", "A"),("/admin/drivers", "A"),
         ("/admin/passengers", "A"),("/admin/pricing", "A"),("/admin/reports", "A"),
         ("/job/job-slu-48298", None),("/nope", None),("/app/nope", P),("/admin/nope", "A")]
DEMO = [f"/demo?step={n}&play=0" for n in range(1, 11)]
JS = r"""() => {
  const out = {ovx: 0, gutter: 0, overlap: [], clip: [], tiny: [], tall: [], small: [], maps: [], rowsplit: [], lightpatch: []};
  // one map per screen, and a map big enough to read
  // demo frames are mock phone screens shown side by side: each may hold its own small map
  const shown = [...document.querySelectorAll('.leaflet-container')].filter(e => !e.closest('.demo-screen')).filter(e => {
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && r.bottom > 0 && r.top < innerHeight * 3; });
  if (shown.length > 1) out.maps.push('two maps on one screen: ' + shown.map(e => Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)).join(' + '));
  const minW = Math.min(300, innerWidth - 48);
  for (const m of shown) { if (m.closest('.demo-screen')) continue;  // mock screens: framecheck covers those
    const r = m.getBoundingClientRect();
    if (r.width < minW || r.height < 160) out.maps.push('map too small ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
  // a filter row stays a row: from 768 up, selects in one container share a top edge
  if (innerWidth >= 768) {
    const groups = new Map();
    for (const el of document.querySelectorAll('select')) { if (!el.offsetParent) continue;
      const k = el.parentElement; if (!k) continue;
      if (!groups.has(k)) groups.set(k, []); groups.get(k).push(el); }
    for (const [, els] of groups) { if (els.length < 3) continue;
      const tops = [...new Set(els.map(e => Math.round(e.getBoundingClientRect().top / 4)))];
      if (tops.length > 1) out.rowsplit.push(els.length + ' filters over ' + tops.length + ' rows'); }
  }
  // dark mode: no light card sitting on a dark page
  if (document.documentElement.classList.contains('dark')) {
    const lum = c => { const m = (c || '').match(/[\d.]+/g); if (!m || m.length < 3) return null;
      const a = m.length > 3 ? parseFloat(m[3]) : 1; if (a < 0.6) return null;
      const [r, g, b] = m.map(Number); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
    for (const e of document.querySelectorAll('body *')) {
      const r = e.getBoundingClientRect();
      if (r.width < 80 || r.height < 40 || r.bottom < 0 || r.top > innerHeight) continue;
      // a white or mint primary button is the dark theme's CTA, by design; cards and panels are not
      if (e.closest('.leaflet-pane, .keep-white, [data-photo], picture, img, svg, canvas')) continue;
      if (e.matches('button, a, [role=button], [role=radio], [role=tab], label, input, select') || e.closest('button, a, [role=button], [role=radio], [role=tab]')) continue;
      if (e.closest('.demo-screen')) continue;  // a mock screen inside a demo frame draws its own theme
      const L = lum(getComputedStyle(e).backgroundColor);
      if (L !== null && L > 0.55) out.lightpatch.push((e.getAttribute('data-testid') || e.className.toString().slice(0, 22) || e.tagName) + ' ' + L.toFixed(2));
    }
  }
  out.ovx = Math.max(0, document.documentElement.scrollWidth - innerWidth);
  const pane = document.querySelector('.app-pane');
  if (pane && innerWidth >= 768 && innerWidth < 1000) {
    const r = pane.getBoundingClientRect();
    out.gutter = Math.round(Math.max(r.left, innerWidth - r.right));
  }
  // the real tap area: many controls carry an invisible ::after that extends the hit box
  const tap = e => { const r = e.getBoundingClientRect();
    const a = getComputedStyle(e, '::after');
    if (!a || a.content === 'none' || a.position !== 'absolute') return r;
    const n = v => { const f = parseFloat(v); return Number.isFinite(f) ? f : 0; };
    return { left: r.left + n(a.left), top: r.top + n(a.top), right: r.right - n(a.right), bottom: r.bottom - n(a.bottom),
      width: r.width - n(a.left) - n(a.right), height: r.height - n(a.top) - n(a.bottom) }; };
  const vis = e => { let r = e.getBoundingClientRect();
    let x1=r.left,y1=r.top,x2=r.right,y2=r.bottom;
    for (let p = e.parentElement; p; p = p.parentElement) { const cs = getComputedStyle(p);
      if (cs.overflow==='visible'&&cs.overflowX==='visible'&&cs.overflowY==='visible') continue;
      const pr = p.getBoundingClientRect();
      x1=Math.max(x1,pr.left); y1=Math.max(y1,pr.top); x2=Math.min(x2,pr.right); y2=Math.min(y2,pr.bottom); }
    x1=Math.max(x1,0); y1=Math.max(y1,0); x2=Math.min(x2,innerWidth); y2=Math.min(y2,innerHeight);
    return {left:x1,top:y1,right:x2,bottom:y2,width:x2-x1,height:y2-y1}; };
  const id = e => e.getAttribute('data-testid') || e.getAttribute('aria-label') || (e.textContent||'').trim().slice(0,14) || e.tagName;
  const hit = [...document.querySelectorAll('button,a[href],select,input,[role=tab],[role=button]')]
    .filter(e => { const cs = getComputedStyle(e);
      if (cs.display==='none'||cs.visibility==='hidden'||cs.pointerEvents==='none') return false;
      if (e.closest('.leaflet-pane')) return false;              // map pins are data, not controls
      const r = vis(e); return r.width > 2 && r.height > 2; });
  for (let i=0;i<hit.length;i++) for (let j=i+1;j<hit.length;j++) {
    const a=hit[i],b=hit[j]; if (a.contains(b)||b.contains(a)) continue;
    const ra=vis(a), rb=vis(b);
    const ox=Math.min(ra.right,rb.right)-Math.max(ra.left,rb.left);
    const oy=Math.min(ra.bottom,rb.bottom)-Math.max(ra.top,rb.top);
    if (ox>3&&oy>3) out.overlap.push(id(a)+' x '+id(b));
  }
  for (const e of hit) {
    if (e.closest('nav,[role=tablist]')) continue;
    const r = tap(e);
    // an input inside a tall label is tapped through the label
    const lab = e.closest('label');
    const h = lab ? Math.max(r.height, lab.getBoundingClientRect().height) : r.height;
    const w = lab ? Math.max(r.width, lab.getBoundingClientRect().width) : r.width;
    if (h>2 && (w<43.5||h<43.5) && !e.matches('a:not([class*=tap])'))
      out.small.push(id(e)+' '+Math.round(w)+'x'+Math.round(h)); }
  const zoomOf = e => { let z = 1; for (let p=e; p; p=p.parentElement) { const v=parseFloat(getComputedStyle(p).zoom||'1'); if (v&&v!==1) z*=v;
      const t=getComputedStyle(p).transform; if (t&&t!=='none'){ const m=t.match(/matrix\((-?[\d.]+)/); if (m) z*=parseFloat(m[1]); } } return z; };
  for (const e of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(e);
    if (cs.display==='none'||cs.visibility==='hidden') continue;
    if (e.children.length || !(e.textContent||'').trim()) continue;
    if (e.closest('.sr-only')||e.classList.contains('sr-only')) continue;
    const r = e.getBoundingClientRect(); if (r.width<1||r.bottom<0||r.top>innerHeight) continue;
    const eff = parseFloat(cs.fontSize) * zoomOf(e);
    if (eff < 11.9) out.tiny.push((e.textContent||'').trim().slice(0,14)+' '+eff.toFixed(1));
    if (r.width<26 && r.height>60 && (e.textContent||'').trim().length>3) out.tall.push((e.textContent||'').trim().slice(0,14));
    if (e.scrollWidth > e.clientWidth + 2 && cs.overflow !== 'visible' && (e.textContent||'').trim().length > 4
        && !e.closest('table,.no-scrollbar,.leaflet-container')) out.clip.push((e.textContent||'').trim().slice(0,14));
  }
  for (const k of ['overlap','clip','tiny','tall','small','maps','rowsplit','lightpatch']) out[k] = [...new Set(out[k])].slice(0,3);
  return out;
}"""
total = {"ovx":0,"gutter":0,"overlap":0,"clip":0,"tiny":0,"tall":0,"small":0,"maps":0,"rowsplit":0,"lightpatch":0,"err":0}
lines = []
with sync_playwright() as pw:
    br = pw.chromium.launch()
    for name, w, h in DEV:
        for dark in (False, True):
            ctx = br.new_context(viewport={"width": w, "height": h}); pg = ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:70]))
            for route, sess in PAGES + [(d, None) for d in DEMO]:
                init = "try{"
                if sess == "A": init += "sessionStorage.setItem('stlu-admin','1');localStorage.setItem('stlu-admin','1');"
                elif sess: init += "sessionStorage.setItem('stlu-session','%s');" % sess
                if dark: init += "localStorage.setItem('stlu-theme','dark');"
                init += "}catch(e){}"
                pg.goto("about:blank"); pg.add_init_script(init)
                before = len(errs)
                pg.goto(f"{ORIGIN}/index.html#{route}"); pg.wait_for_timeout(1250)
                r = pg.evaluate(JS)
                r["err"] = errs[before:]
                bad = {k: v for k, v in r.items() if (isinstance(v, list) and v) or (isinstance(v, int) and v)}
                for k in total:
                    v = r.get(k, 0)
                    total[k] += len(v) if isinstance(v, list) else (1 if v else 0)
                if bad:
                    lines.append(f"{name} {w}x{h} {'dark' if dark else 'light'} {route}: " + json.dumps(bad)[:200])
            ctx.close()
    br.close()
for l in lines: print(l)
print("RESPONSIVE TOTAL", json.dumps(total))
