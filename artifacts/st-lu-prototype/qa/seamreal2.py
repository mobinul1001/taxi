"""Seam check in a headful Chrome (xvfb), at device pixel ratio 1 and 2."""
import sys
from playwright.sync_api import sync_playwright
from PIL import Image
B = "file:///home/claude/after/index.html#"
SC = [("live", "/app/trips/SLU-48213/live", '{"role":"passenger"}'),
      ("route", "/app/book/route", '{"role":"passenger"}'),
      ("progress", "/app/driver/trips/SLU-48213/progress", '{"role":"driver","driverId":"DRV-007"}'),
      ("livemap", "/admin/live-map", "ADMIN")]
def seams(path, box, dpr):
    im = Image.open(path).convert("RGB")
    box = tuple(int(v * dpr) for v in box)
    im = im.crop(box); w, h = im.size; px = im.load(); out = []
    for y in range(3, h - 3):
        run = 0; best = 0
        for x in range(0, w, 2):
            a, up, dn = px[x, y], px[x, y - 2], px[x, y + 2]
            if all(a[c] > up[c] + 5 and a[c] > dn[c] + 5 for c in range(3)): run += 1; best = max(best, run)
            else: run = 0
        if best > w // 8: out.append(y)
    for x in range(3, w - 3):
        run = 0; best = 0
        for y in range(0, h, 2):
            a, lf, rt = px[x, y], px[x - 2, y], px[x + 2, y]
            if all(a[c] > lf[c] + 5 and a[c] > rt[c] + 5 for c in range(3)): run += 1; best = max(best, run)
            else: run = 0
        if best > h // 8: out.append(-x)
    return out
found = 0
with sync_playwright() as p:
    br = p.chromium.launch(headless=False, args=["--force-device-scale-factor=1"])
    for dpr in (2,):
        for w, h in ((1367, 800), (390, 844)):
            ctx = br.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr)
            pg = ctx.new_page()
            for dark in (False, True):
                for name, route, sess in SC:
                    init = "try{"
                    init += "sessionStorage.setItem('stlu-admin','1');localStorage.setItem('stlu-admin','1');" if sess == "ADMIN" else "sessionStorage.setItem('stlu-session','%s');" % sess
                    if dark: init += "localStorage.setItem('stlu-theme','dark');"
                    init += "}catch(e){}"
                    pg.goto("about:blank"); pg.add_init_script(init)
                    pg.goto(B + route); pg.wait_for_timeout(2600)
                    r = pg.evaluate("()=>{const e=document.querySelector('.leaflet-container');if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.x)+4,Math.round(b.y)+4,Math.round(b.right)-4,Math.round(b.bottom)-4];}")
                    if not r: continue
                    f = f"/tmp/sr-{name}-{w}-{dpr}-{int(dark)}.png"; pg.screenshot(path=f)
                    s = seams(f, r, dpr)
                    tag = f"{name} {w}w dpr{dpr} {'dark' if dark else 'light'}"
                    if s: found += 1; print("SEAM", tag, s[:4])
            ctx.close()
    br.close()
print("REAL-CHROME SEAM ROWS:", found)
