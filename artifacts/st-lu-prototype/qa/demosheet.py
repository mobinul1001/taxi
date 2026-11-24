import os, sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
SRC = "file:///home/claude/after/index.html"
OUT = "/home/claude/shots/sheets"; os.makedirs(OUT, exist_ok=True)
W = [(320,568),(390,844),(768,1024),(1009,1366),(1440,900),(1920,1080)]
STEPS = [(3,"Request sent"),(5,"Driver assigned"),(8,"At pickup"),(9,"On the way")]
F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 17)
def grab(pg, step, w, h, dark):
    pg.goto("about:blank")
    pg.goto(f"{SRC}#/demo?step={step}&play=0")
    pg.wait_for_timeout(1500)
    pg.evaluate("d=>document.documentElement.classList.toggle('dark', d)", dark)
    pg.wait_for_timeout(900)
    p = f"/tmp/ds-{step}-{w}-{int(dark)}.png"; pg.screenshot(path=p); return p
with sync_playwright() as pw:
    b = pw.chromium.launch()
    shots = {}
    for w, h in W:
        ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
        pg = ctx.new_page()
        for st, _ in STEPS:
            for dark in (False, True):
                shots[(st, w, dark)] = grab(pg, st, w, h, dark)
        ctx.close()
    b.close()
GAP, PAD, HEAD, CAP = 18, 26, 54, 26
for st, name in STEPS:
    cols = [Image.open(shots[(st, w, False)]) for w, _ in W]
    dks  = [Image.open(shots[(st, w, True)])  for w, _ in W]
    TH = 300
    def fit(im):
        k = TH / im.height
        return im.resize((max(1, int(im.width * k)), TH), Image.LANCZOS)
    rows = [[fit(i) for i in cols], [fit(i) for i in dks]]
    rw = max(sum(i.width for i in r) + GAP * (len(r) - 1) for r in rows)
    sheet = Image.new("RGB", (rw + PAD * 2, HEAD + (TH + CAP + GAP) * 2 + PAD), "#F5F2EC")
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 18), f"Guided demo — step {st}: {name}   ·   light row, then dark row", font=F, fill="#2A2420")
    y = HEAD
    for ri, r in enumerate(rows):
        x = PAD
        for (w, _), im in zip(W, r):
            sheet.paste(im, (x, y))
            d.rectangle([x, y, x + im.width - 1, y + im.height - 1], outline="#C9C1B5")
            d.text((x + 2, y + im.height + 4), f"{w}px  {'dark' if ri else 'light'}", font=F, fill="#6B6257")
            x += im.width + GAP
        y += TH + CAP + GAP
    f = f"{OUT}/v11-demo-step{st}.jpg"; sheet.save(f, quality=90); print(f, sheet.size)
