"""Give every agency page its own <head> in static HTML, so crawlers that do not run JavaScript still see the right
title, description, canonical, robots, Open Graph tags and schema, plus a plain list of links to every page.

Usage:  python3 qa/prerender_agency.py dist/agency        (run after the VITE_SITE=agency build)
Needs:  Python 3 and Playwright with Chromium (pip install playwright && playwright install chromium).

It loads each route in a real browser, reads the head AND the body that the app itself produced, and writes both into
a copy of index.html at <route>/index.html (the homepage becomes index.html). The body sits inside <div id="root"
data-pre>, so crawlers and slow phones get real text at once; main-agency.tsx draws the live app next to it and
swaps it in when ready. The stylesheet link is made render-blocking here so the static body is never unstyled.
"""
import functools, html, http.server, json, re, socket, socketserver, sys, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

dist = Path(sys.argv[1]).resolve()
src = Path(__file__).resolve().parent.parent / "src/pages/company/routePaths.ts"
paths = re.findall(r':\s*"(/[^"]*)"', src.read_text())
routes = ["/"] + [p for p in paths if p != "/taxi-app-development-company/"]
template = (dist / "index.html").read_text()

class H(http.server.SimpleHTTPRequestHandler):
    """Static files, then the app shell for anything else (what the production rewrite does)."""
    def __init__(self, *a, **k): super().__init__(*a, directory=str(dist), **k)
    def log_message(self, *a): pass
    def send_head(self):
        p = Path(self.translate_path(self.path))
        if not p.exists(): self.path = "/index.html"
        return super().send_head()

s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
srv = socketserver.ThreadingTCPServer(("127.0.0.1", port), H); srv.daemon_threads = True
threading.Thread(target=srv.serve_forever, daemon=True).start()

JS = """() => {
  const g = (sel, a) => document.head.querySelector(sel)?.getAttribute(a) ?? null;
  const m = {};
  for (const el of document.head.querySelectorAll('meta[name^="twitter:"], meta[property^="og:"]')) m[(el.getAttribute('name') || el.getAttribute('property'))] = el.content;
  return { title: document.title, description: g('meta[name=description]', 'content'), robots: g('meta[name=robots]', 'content'),
           canonical: g('link[rel=canonical]', 'href'), meta: m,
           ld: [...document.head.querySelectorAll('script[type="application/ld+json"]')].map((x) => x.textContent),
           h1: document.querySelector('h1')?.innerText.trim() ?? '',
           body: (() => { const r = document.getElementById('root'); if (!r) return ''; const c = r.cloneNode(true);
             c.querySelectorAll('.sticky-q, [role=dialog], dialog').forEach((x) => x.remove());
             c.querySelectorAll('[style*="transform"]').forEach((x) => { if (x.classList.contains('scaled-in')) x.removeAttribute('style'); });
             return c.innerHTML; })() };
}"""

def collect(pg, route):
    pg.goto(f"http://127.0.0.1:{port}{route}"); pg.wait_for_selector("h1"); pg.wait_for_timeout(250)
    return pg.evaluate(JS)

data = {}
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 390, "height": 844})
    for r in routes: data[r] = collect(pg, r)
    data["/404.html"] = collect(pg, "/this-page-does-not-exist/")
    b.close(); srv.shutdown()

def esc(v): return html.escape(v, quote=True)
def put(doc, d):
    doc = re.sub(r"<title>.*?</title>", lambda _: f"<title>{esc(d['title'])}</title>", doc, flags=re.S)
    def meta(doc, attr, name, val):
        pat = rf'<meta {attr}="{re.escape(name)}" content="[^"]*" ?/?>'
        tag = f'<meta {attr}="{name}" content="{esc(val)}" />'
        return re.sub(pat, lambda _: tag, doc, count=1) if re.search(pat, doc) else doc.replace("</head>", f"    {tag}\n  </head>")
    doc = meta(doc, "name", "description", d["description"])
    doc = meta(doc, "name", "robots", d["robots"] or "index, follow")
    for k, v in d["meta"].items(): doc = meta(doc, "name" if k.startswith("twitter:") else "property", k, v)
    # A 404 page has no address of its own, so it carries no canonical.
    doc = re.sub(r'<link rel="canonical" href="[^"]*" ?/?>', lambda _: "" if d["canonical"] is None or d["canonical"].endswith("/404/") else f'<link rel="canonical" href="{esc(d["canonical"])}" />', doc, count=1)
    ld = "".join(f'    <script type="application/ld+json">{x}</script>\n' for x in d["ld"])
    return doc.replace("</head>", ld + "  </head>")

nav = "".join(f'<li><a href="{r}">{html.escape(data[r]["h1"] or r)}</a></li>' for r in routes if r != "/thank-you/")
noscript = f'<noscript><p style="font-family:sans-serif;padding:24px">TaxiAppDevelopment.org needs JavaScript to run. Pages: </p><ul style="font-family:sans-serif">{nav}</ul></noscript>'
for r, d in data.items():
    doc = put(template, d)
    # Static body: replaces the boot splash, and the app stylesheet becomes a normal (render-blocking) link.
    doc = re.sub(r'<link rel="stylesheet" data-app-css href="([^"]+)" media="print" onload="this.media=\'all\'">', lambda m: f'<link rel="stylesheet" data-app-css href="{m.group(1)}">', doc)
    if d["body"]:
        root = re.search(r'<div id="root">\s*<div id="boot">.*?</div>\s*</div>', doc, flags=re.S)
        assert root, "boot block not found in the template"
        doc = doc[:root.start()] + '<div id="root" data-pre>' + d["body"] + '</div>' + doc[root.end():]
    # With a static body the page already carries its links, so the old "needs JavaScript" list is dropped.
    doc = re.sub(r"<noscript>.*?</noscript>", "", doc, flags=re.S) if d["body"] else re.sub(r"<noscript>.*?</noscript>", lambda _: noscript, doc, count=1, flags=re.S)
    out = dist / "index.html" if r == "/" else dist / "404.html" if r == "/404.html" else dist / r.strip("/") / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True); out.write_text(doc)
print(f"prerendered {len(data)} heads into {dist}")
