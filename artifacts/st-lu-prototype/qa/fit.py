import sys
from playwright.sync_api import sync_playwright
build = sys.argv[1]
P = '{"role":"passenger"}'; D = '{"role":"driver","driverId":"DRV-007"}'
ROUTES = [("/app/welcome",None),("/app/login",None),("/app/home",P),("/app/book/route",P),("/app/book/tour",P),("/app/book/details",P),("/app/book/fare",P),("/app/book/payment",P),("/app/book/confirmed",P),("/app/book/payment-failed",P),("/app/quote/sent",P),("/app/driver/new-trip",D),("/app/driver/renew",D)]
DEV = [("SE",320,568),("Fold",344,882),("S8",360,740),("iP8",375,667),("13mini",375,812),("iP14",390,844),("S23",412,915),("ProMax",430,932),("iPadMini",768,1024),("iPadAirL",1180,820),("Laptop",1280,720),("Desk",1440,900)]
JS = '''() => { const root = document.querySelector('#phone-root'); if (!root) return -1;
 const els = [...root.querySelectorAll('*')].filter(x => x.scrollHeight > x.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(x).overflowY));
 return els.length ? Math.max(...els.map(x => x.scrollHeight - x.clientHeight)) : 0; }'''
with sync_playwright() as p:
    b = p.chromium.launch()
    print("route".ljust(28), " ".join(d[0].rjust(8) for d in DEV))
    for route, sess in ROUTES:
        row = []
        for n, w, h in DEV:
            ctx = b.new_context(viewport={"width": w, "height": h})
            if sess: ctx.add_init_script(f"try{{sessionStorage.setItem('stlu-session','{sess}')}}catch(e){{}}")
            pg = ctx.new_page(); pg.goto(f"file://{build}/index.html#{route}"); pg.wait_for_timeout(650)
            v = pg.evaluate(JS); row.append(("fit" if v == 0 else str(v)).rjust(8)); ctx.close()
        print(route.ljust(28), " ".join(row))
    b.close()
