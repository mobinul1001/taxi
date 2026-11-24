"""Generate per-page Open Graph images (1200x630) and favicon files for the agency site.

Usage: python3 -I qa/gen_og.py /path/to/built/agency
Reads each indexable page's own title from the built site, so no text is invented, and writes
public-agency/og/<slug>.jpg plus favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png.
"""
import glob, html, io, os, re, sys, http.server, socketserver, threading, functools
from playwright.sync_api import sync_playwright
from PIL import Image

root = sys.argv[1]
pub = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public-agency")
os.makedirs(os.path.join(pub, "og"), exist_ok=True)
font = [f for f in glob.glob(root + "/assets/inter-latin-wght-normal-*.woff2")][0]
fontb = open(font, "rb").read()
import base64; fontcss = "@font-face{font-family:I;src:url(data:font/woff2;base64,%s) format('woff2');font-weight:100 900}" % base64.b64encode(fontb).decode()

H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=root)
H.log_message = lambda *a, **k: None
srv = socketserver.TCPServer(("127.0.0.1", 0), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
base = "http://127.0.0.1:%d" % srv.server_address[1]

paths = []
for f in glob.glob(root + "/**/index.html", recursive=True):
    rel = os.path.relpath(os.path.dirname(f), root)
    if rel.startswith("st-lucia-taxi-app") or rel.startswith("assets") or rel == ".": continue
    paths.append("/" + rel + "/")

CARD = """<html><head><style>%s
*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;font-family:I,sans-serif;color:#fff;background:linear-gradient(135deg,#0a1330 0%%,#14246b 100%%);position:relative;overflow:hidden}
.glow{position:absolute;right:-120px;top:-160px;width:640px;height:640px;border-radius:50%%;background:radial-gradient(closest-side,rgba(43,99,255,.55),transparent)}
.brand{position:absolute;left:72px;top:60px;display:flex;align-items:center;gap:16px;font-size:30px;font-weight:700}.brand b{color:#8fb2ff}
.mark{width:52px;height:52px}
h1{position:absolute;left:72px;right:96px;top:190px;font-size:%dpx;line-height:1.12;letter-spacing:-.03em;font-weight:780}
.foot{position:absolute;left:72px;bottom:56px;font-size:26px;color:#b8c4e6}
.bar{position:absolute;left:0;bottom:0;height:10px;width:100%%;background:linear-gradient(90deg,#2b63ff,#22d3ee)}
</style></head><body><div class="glow"></div>
<div class="brand"><svg class="mark" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b63ff"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><polygon points="14,30 50,14 34,50 29,35" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg><span>TaxiApp<b>Development</b></span></div>
<h1>%s</h1><div class="foot">taxiappdevelopment.org</div><div class="bar"></div></body></html>"""

with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(viewport={"width": 1200, "height": 630})
    for path in sorted(paths):
        pg.goto(base + path); pg.wait_for_selector("h1"); 
        robots = pg.evaluate("(document.querySelector('meta[name=robots]')||{}).content||''")
        if "noindex" in robots: continue
        title = pg.evaluate("document.title").split(" | ")[0].strip()
        slug = path.strip("/").replace("/", "-")
        size = 66 if len(title) <= 40 else 56 if len(title) <= 60 else 48
        pg2 = br.new_page(viewport={"width": 1200, "height": 630})
        pg2.set_content(CARD % (fontcss, size, html.escape(title))); pg2.wait_for_timeout(250)
        png = pg2.screenshot(type="png"); pg2.close()
        Image.open(io.BytesIO(png)).convert("RGB").save(os.path.join(pub, "og", slug + ".jpg"), quality=86, optimize=True)
        print("og", slug)
    svg = open(os.path.join(pub, "favicon.svg")).read()
    def icon(n):
        q = br.new_page(viewport={"width": n, "height": n}); q.set_content("<body style='margin:0'><img width=%d height=%d src='data:image/svg+xml;base64,%s'>" % (n, n, base64.b64encode(svg.encode()).decode()))
        q.wait_for_timeout(150); b = q.screenshot(type="png", omit_background=True); q.close(); return Image.open(io.BytesIO(b)).convert("RGBA")
    bg = Image.new("RGBA", (180, 180), "#ffffff"); bg.alpha_composite(icon(180)); bg.convert("RGB").save(os.path.join(pub, "apple-touch-icon.png")); icon(192).save(os.path.join(pub, "icon-192.png")); icon(512).save(os.path.join(pub, "icon-512.png"))
    icon(48).save(os.path.join(pub, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
srv.shutdown()
