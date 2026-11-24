import sys, json, os
from playwright.sync_api import sync_playwright
build, out = sys.argv[1], sys.argv[2]
sel = sys.argv[3].split(",") if len(sys.argv) > 3 and sys.argv[3] != "all" else None
widths = [int(w) for w in sys.argv[4].split(",")] if len(sys.argv) > 4 else [375, 1440]
dark = len(sys.argv) > 5 and sys.argv[5] == "dark"
os.makedirs(out, exist_ok=True)
P = '{"role":"passenger"}'; D = '{"role":"driver","driverId":"DRV-007"}'; A = None
R = {
 "hub": ("/", None), "landing": ("/landing", None), "demo": ("/demo", None), "welcome": ("/app/welcome", None), "login": ("/app/login", None),
 "home": ("/app/home", P), "route": ("/app/book/route", P), "tour": ("/app/book/tour", P), "details": ("/app/book/details", P),
 "fare": ("/app/book/fare", P), "payment": ("/app/book/payment", P), "trips": ("/app/trips", P), "account": ("/app/account", P),
 "alerts": ("/app/alerts", P), "trip": ("/app/trips/SLU-48213", P), "live": ("/app/trips/SLU-48213/live", P),
 "jobs": ("/app/driver/jobs", D), "earnings": ("/app/driver/earnings", D), "profile": ("/app/driver/profile", D), "dalerts": ("/app/driver/alerts", D),
 "renew": ("/app/driver/renew", D), "dall": ("/app/driver/trips", D),
 "adminlogin": ("/admin/login", None), "admin": ("/admin", "ADMIN"), "bookings": ("/admin/bookings", "ADMIN"), "livemap": ("/admin/live-map", "ADMIN"),
 "drivers": ("/admin/drivers", "ADMIN"), "passengers": ("/admin/passengers", "ADMIN"), "pricing": ("/admin/pricing", "ADMIN"),
 "refunds": ("/admin/refunds", "ADMIN"), "reports": ("/admin/reports", "ADMIN"), "settings": ("/admin/settings", "ADMIN"),
 "messages": ("/previews/messages", None), "screens": ("/screens", None), "lab": ("/lab", None), "job": ("/job/job-slu-48298", None),
}
H = {320: 568, 344: 882, 375: 667, 390: 844, 768: 1024, 820: 1180, 1024: 768, 1180: 820, 1280: 720, 1440: 900, 1920: 1080, 2560: 1440}
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, (route, sess) in R.items():
        if sel and name not in sel: continue
        for w in widths:
            ctx = b.new_context(viewport={"width": w, "height": H.get(w, 900)})
            init = "try{"
            if sess and sess != "ADMIN": init += f"sessionStorage.setItem('stlu-session', '{sess}');"
            if sess == "ADMIN": init += "sessionStorage.setItem('stlu-admin','1');localStorage.setItem('stlu-admin','1');"
            if dark: init += "localStorage.setItem('stlu-theme','dark');"
            init += "}catch(e){}"
            ctx.add_init_script(init)
            pg = ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.goto(f"file://{build}/index.html#{route}")
            pg.wait_for_timeout(900)
            ov = pg.evaluate("document.documentElement.scrollWidth - window.innerWidth")
            full = name in ("landing", "hub") and w in (375, 1440)
            if full:
                pg.evaluate("""async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,90))}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,400))}""")
            pg.screenshot(path=f"{out}/{name}-{w}{'-dark' if dark else ''}.png", full_page=full)
            print(name, w, "overflowX=", ov, "ERR" if errs else "", errs[:1], pg.url.split('#')[1])
            ctx.close()
    b.close()
