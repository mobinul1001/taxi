"""Text over photos: hides the text, screenshots the pixels behind each text box, and checks white (or the
element's own colour) against the LIGHTEST 2% of those pixels. Reports anything under AA."""
import sys, io
from playwright.sync_api import sync_playwright
from PIL import Image
build = sys.argv[1]
CASES = [("/app/welcome", 390, 844, "#phone-root h1, #phone-root p, #phone-root li span, #phone-root button"), ("/app/welcome", 320, 568, "#phone-root h1, #phone-root p, #phone-root button"),
         ("/landing", 1440, 900, "main section:first-of-type h1, main section:first-of-type h1 i, main section:first-of-type > div p, main section:first-of-type a, header a, main section:first-of-type span.flex"),
         ("/landing", 390, 844, "main section:first-of-type h1, main section:first-of-type h1 i, main section:first-of-type > div > div > p, main section:first-of-type a"),
         ("/landing", 768, 1024, "main section:first-of-type h1, main section:first-of-type h1 i, main section:first-of-type > div p, main section:first-of-type a, main section:first-of-type span.whitespace-nowrap"), ("/app/welcome", 768, 1024, "#phone-root h1 span, #phone-root h1 i, #phone-root p, #phone-root li span, #phone-root button"), ("/landing#fleet", 1440, 900, "#fleet .t-eyebrow.text-hl, #fleet p.t-display, #fleet p.mt-2"),
         ("/landing#destinations", 1440, 900, "#destinations button span.t-title, #destinations button span.mt-1"), ("/", 1440, 900, "header h1, header h1 i, header p")]
def lum(c):
    f = lambda v: (v / 255) / 12.92 if v / 255 <= .03928 else (((v / 255) + .055) / 1.055) ** 2.4
    return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2])
bad = 0; n = 0
with sync_playwright() as p:
    b = p.chromium.launch()
    for theme in ("light", "dark"):
        for route, w, h, sel in CASES:
            ctx = b.new_context(viewport={"width": w, "height": h}); ctx.add_init_script(f"try{{localStorage.setItem('stlu-theme','{theme}')}}catch(e){{}}")
            pg = ctx.new_page(); anchor = None
            if "#" in route: route, anchor = route.split("#")
            pg.goto(f"file://{build}/index.html#{route}"); pg.wait_for_timeout(1300)
            if anchor: pg.evaluate(f"document.getElementById('{anchor}').scrollIntoView()"); pg.wait_for_timeout(1200)
            els = pg.evaluate("""(sel)=>[...document.querySelectorAll(sel)].map(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return {x:r.x,y:r.y,w:r.width,h:r.height,c:cs.color,fs:parseFloat(cs.fontSize),fw:+cs.fontWeight,t:(e.textContent||'').trim().slice(0,26)}}).filter(e=>e.w>4&&e.h>4&&e.y<innerHeight&&e.y>=0&&e.t)""", sel)
            pg.add_style_tag(content="*{color:transparent !important;-webkit-text-fill-color:transparent !important} svg{opacity:0 !important}")
            pg.wait_for_timeout(200); shot = Image.open(io.BytesIO(pg.screenshot())).convert("RGB")
            for e in els:
                box = (max(0, int(e["x"]) + 3), max(0, int(e["y"]) + 3), min(w, int(e["x"] + e["w"]) - 3), min(h, int(e["y"] + e["h"]) - 3))  # inset: ignore 1px control borders
                if box[2] - box[0] < 3 or box[3] - box[1] < 3: continue
                px = sorted((lum(c) for c in shot.crop(box).get_flattened_data()), reverse=True); bgL = px[max(0, len(px) // 50)]
                import re; m = re.findall(r"[\d.]+", e["c"].replace("srgb", "")); fg = [float(m[0]), float(m[1]), float(m[2])]; a = float(m[3]) if len(m) > 3 else 1
                if "color(" in e["c"]: fg = [v * 255 for v in fg]
                if "oklab" in e["c"] or "oklch" in e["c"]: fg = [min(255, float(m[0]) ** 3 * 255)] * 3  # only near-neutral tints are used over photos
                # composite translucent text over the measured background luminance (approx via grey)
                fL = lum(fg) * a + bgL * (1 - a); ratio = (max(fL, bgL) + .05) / (min(fL, bgL) + .05)
                large = e["fs"] >= 24 or (e["fs"] >= 18.66 and e["fw"] >= 700); n += 1
                if ratio < (3 if large else 4.5): bad += 1; print(theme, route, w, f"{ratio:.2f}", f'{e["fs"]:.0f}px', repr(e["t"]))
            ctx.close()
    b.close()
print("text-over-photo elements checked:", n, "below AA:", bad)
