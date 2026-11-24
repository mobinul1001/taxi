import sys
from playwright.sync_api import sync_playwright
build, out = sys.argv[1], sys.argv[2]
import os; os.makedirs(out, exist_ok=True)
P = '{"role":"passenger"}'; D = '{"role":"driver","driverId":"DRV-007"}'
def page(b, w, h, sess=None, admin=False, dark=False):
    c = b.new_context(viewport={"width": w, "height": h})
    init = "try{"
    if sess: init += f"sessionStorage.setItem('stlu-session','{sess}');"
    if admin: init += "sessionStorage.setItem('stlu-admin','1');"
    if dark: init += "localStorage.setItem('stlu-theme','dark');"
    c.add_init_script(init + "}catch(e){}"); return c.new_page()
U = f"file://{build}/index.html#"
with sync_playwright() as p:
    b = p.chromium.launch()
    def shot(name, route, w=390, h=844, sess=None, admin=False, dark=False, act=None):
        pg = page(b, w, h, sess, admin, dark); pg.goto(U + route); pg.wait_for_timeout(600)
        try:
            if act: act(pg); pg.wait_for_timeout(500)
        except Exception as e: print("ACT FAIL", name, str(e)[:120])
        pg.screenshot(path=f"{out}/{name}.png"); pg.context.close()
    t = lambda x: (lambda pg: pg.get_by_test_id(x).click())
    shot("m-quote", "/app/home", sess=P, act=t("card-service-chauffeur"))
    shot("m-logout", "/app/account", sess=P, act=t("button-logout"))
    shot("m-signup", "/app/login?signup=1")
    shot("m-cancel", "/app/trips/SLU-48315/cancel", sess=P)
    shot("m-receipt", "/app/trips/SLU-47102/receipt", sess=P)
    shot("m-rate", "/app/trips/SLU-47102/complete", sess=P)
    shot("m-confirmed", "/app/book/confirmed", sess=P)
    shot("m-roundtrip", "/app/book/round-trip", sess=P)
    shot("d-trip", "/app/driver/trips/SLU-48290", sess=D)
    shot("d-progress", "/app/driver/trips/SLU-48290/progress", sess=D)
    shot("d-done", "/app/driver/trips/SLU-48251/done", sess=D)
    shot("d-newtrip", "/app/driver/new-trip", sess=D)
    shot("job", "/job/job-slu-48298")
    shot("a-drawer", "/admin/bookings?booking=SLU-48213", 1440, 900, admin=True)
    shot("a-assign", "/admin/bookings", 1440, 900, admin=True, act=lambda pg: pg.locator('[data-testid^="button-assign-"]').first.click())
    shot("a-new", "/admin/bookings", 1440, 900, admin=True, act=t("button-new-booking"))
    shot("a-drawer-m", "/admin/bookings?booking=SLU-48213", 390, 844, admin=True)
    shot("a-assign-m", "/admin/bookings", 390, 844, admin=True, act=lambda pg: pg.locator('[data-testid^="button-assign-"]').first.click())
    shot("a-menu-m", "/admin", 390, 844, admin=True, act=lambda pg: pg.get_by_label("Menu").click())
    shot("a-driver", "/admin/drivers/DRV-007", 1440, 900, admin=True)
    shot("a-pricing", "/admin/pricing", 1440, 900, admin=True)
    shot("a-reports", "/admin/reports", 1440, 900, admin=True)
    for n, r, s_ in [("home","/app/home",P),("details","/app/book/details",P),("live","/app/trips/SLU-48213/live",P),("jobs","/app/driver/jobs",D),("account","/app/account",P),("trips","/app/trips",P)]:
        shot("dark-" + n, r, sess=s_, dark=True)
    shot("dark-landing", "/landing", 1440, 900, dark=True); shot("dark-hub", "/", 1440, 900, dark=True); shot("dark-landing-m", "/landing", 390, 844, dark=True)
    b.close()
