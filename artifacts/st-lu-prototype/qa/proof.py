"""Proof sheets for the four v12 fixes: one image each, before-and-after style labels."""
import os
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
OUT="/home/claude/shots/sheets"; os.makedirs(OUT, exist_ok=True)
F=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",17)
P='{"role":"passenger"}'; D='{"role":"driver","driverId":"DRV-007"}'
SETS_ALL = {
 "f1-one-map": ("One map per screen (1000px and up)",
   [("Live trip 1440", "/app/trips/SLU-48213/live", P, 1440, 900, False),
    ("Plan a ride 1440", "/app/book/route", P, 1440, 900, False),
    ("Driver progress 1280", "/app/driver/trips/SLU-48213/progress", D, 1280, 720, False),
    ("Live trip 1009", "/app/trips/SLU-48213/live", P, 1009, 800, False)]),
 "f2-filter-row": ("Admin filters stay one row",
   [("320 phone", "/admin/bookings", "A", 320, 640, False),
    ("390 phone", "/admin/bookings", "A", 390, 844, False),
    ("768 tablet", "/admin/bookings", "A", 768, 1024, False),
    ("1440 desktop", "/admin/bookings", "A", 1440, 900, False)]),
 "f3-admin-dark": ("Admin dark mode is real",
   [("Dashboard dark", "/admin", "A", 1440, 900, True),
    ("Bookings dark", "/admin/bookings", "A", 1440, 900, True),
    ("Live map dark", "/admin/live-map", "A", 1440, 900, True),
    ("Drivers dark", "/admin/drivers", "A", 1440, 900, True)]),
 "f4-job-link": ("Job link: map under the job, then beside it",
   [("320 phone", "/job/job-slu-48298", None, 320, 640, False),
    ("768 tablet", "/job/job-slu-48298", None, 768, 1024, False),
    ("1009 laptop", "/job/job-slu-48298", None, 1009, 800, False),
    ("1920 desktop", "/job/job-slu-48298", None, 1920, 1080, False)]),
}
with sync_playwright() as pw:
    br = pw.chromium.launch()
    SETS = SETS_ALL
    for key, (title, items) in SETS.items():
        shots = []
        for idx, (name, route, sess, w, h, dark) in enumerate(items):
            ctx = br.new_context(viewport={"width": w, "height": h}); pg = ctx.new_page()
            init = "try{"
            if sess == "A": init += "sessionStorage.setItem('stlu-admin','1');localStorage.setItem('stlu-admin','1');"
            elif sess: init += "sessionStorage.setItem('stlu-session','%s');" % sess
            if dark: init += "localStorage.setItem('stlu-theme','dark');"
            init += "}catch(e){}"
            pg.goto("about:blank"); pg.add_init_script(init)
            pg.goto(f"file:///home/claude/after/index.html#{route}"); pg.wait_for_timeout(3600)
            f = f"/tmp/proof-{key}-{idx}-{w}-{int(dark)}.png"; pg.screenshot(path=f); shots.append((name, f))
            ctx.close()
        TH = 330; GAP, PAD, HEAD, CAP = 16, 24, 50, 24
        ims = []
        for name, f in shots:
            im = Image.open(f); k = TH / im.height
            ims.append((name, im.resize((max(1, int(im.width * k)), TH), Image.LANCZOS)))
        rw = sum(i.width for _, i in ims) + GAP * (len(ims) - 1)
        sh = Image.new("RGB", (rw + PAD * 2, HEAD + TH + CAP + PAD), "#F5F2EC"); d = ImageDraw.Draw(sh)
        d.text((PAD, 16), title, font=F, fill="#2A2420")
        x = PAD
        for name, im in ims:
            sh.paste(im, (x, HEAD)); d.rectangle([x, HEAD, x + im.width - 1, HEAD + im.height - 1], outline="#C9C1B5")
            d.text((x + 2, HEAD + im.height + 4), name, font=F, fill="#6B6257"); x += im.width + GAP
        p = f"{OUT}/v12-{key}.jpg"; sh.save(p, quality=92); print(p, sh.size)
    br.close()
