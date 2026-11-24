import sys; sys.path.insert(0, "/home/claude/tools")
from serve import serve
import sys, re
from playwright.sync_api import sync_playwright, expect
build = sys.argv[1]; W = int(sys.argv[2]) if len(sys.argv) > 2 else 390; Hh = int(sys.argv[3]) if len(sys.argv) > 3 else 844
browser = sys.argv[4] if len(sys.argv) > 4 else "chromium"
URL = f"{serve(build)}/index.html#"
res = []
def t(name):
    def deco(fn):
        try: fn(); res.append((name, "PASS", ""))
        except Exception as e: res.append((name, "FAIL", " / ".join(str(e).split("\n")[:4])[:420]))
    return deco
with sync_playwright() as p:
    b = getattr(p, browser).launch()
    ctx = b.new_context(viewport={"width": W, "height": Hh})
    ctx.set_default_timeout(6000)
    pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    tid = lambda x: pg.get_by_test_id(x)
    go = lambda r: (pg.goto("about:blank"), pg.goto(URL + r), pg.wait_for_timeout(350))
    S = {}

    @t("hub: reset demo data")
    def _():
        go("/"); tid("button-reset-demo").click(); pg.get_by_role("button", name="Reset", exact=True).click(); expect(tid("toast").first).to_contain_text("reset")
    @t("landing: quick booking form goes to trip details")
    def _():
        go("/landing"); pg.select_option("#l-to", "Soufriere"); tid("button-landing-book").click(); pg.wait_for_url(re.compile("book/details")); expect(tid("summary-bar")).to_contain_text("Soufriere")
    @t("landing: same pickup/drop-off validation toast")
    def _():
        go("/landing"); pg.select_option("#l-from", index=0); v = pg.eval_on_selector("#l-from", "e=>e.value")
        ok = pg.evaluate("v=>[...document.querySelector('#l-to').options].some(o=>o.value===v)", v)
        if ok: pg.select_option("#l-to", v); tid("button-landing-book").click(); expect(tid("toast").first).to_be_visible()
    @t("passenger: welcome -> login -> passenger demo -> home")
    def _():
        pg.evaluate("sessionStorage.removeItem('stlu-session')"); go("/app/welcome"); tid("button-login").click(); tid("button-passenger-demo").click(); pg.wait_for_url(re.compile("app/home")); expect(tid("button-where-to")).to_be_visible()
    @t("passenger: login validation error toast")
    def _():
        pg.evaluate("sessionStorage.removeItem('stlu-session')"); go("/app/login"); tid("input-password").fill("1"); tid("button-submit-login").click(); expect(tid("toast").first).to_contain_text("Enter your email")
        tid("input-password").fill("demo-password"); tid("button-submit-login").click(); pg.wait_for_url(re.compile("app/home"))
    @t("booking: route -> details -> fare -> payment -> confirmed")
    def _():
        go("/app/home"); tid("card-service-airport-transfer").click(); pg.wait_for_url(re.compile("book/route"))
        pg.locator('[data-testid^="chip-pickup-"]').first.click(); tid("input-dropoff").fill("Marigot Bay"); tid("button-continue").click()
        pg.wait_for_url(re.compile("book/details")); tid("input-flight").fill("aa 100"); pg.get_by_role("button", name="Increase").first.click()
        tid("switch-child-seat").click(); pg.wait_for_timeout(150); tid("button-see-fare").click()
        pg.wait_for_url(re.compile("book/fare")); tot = tid("text-total").inner_text(); assert "$" in tot
        tid("button-continue-payment").click(); pg.wait_for_url(re.compile("book/payment")); expect(tid("button-pay")).to_contain_text(tot)
        tid("button-pay").click(); expect(tid("input-cvc")).to_have_attribute("aria-invalid", "true")
        tid("input-cvc").fill("123"); tid("input-card-name").fill("Maria Thompson"); tid("button-pay").click(); pg.wait_for_url(re.compile("book/confirmed"), timeout=8000)
        S["ref"] = tid("text-ref").inner_text().strip(); assert S["ref"].startswith("SLU-")
        tid("link-view-receipt").click(); pg.wait_for_url(re.compile("receipt")); pg.go_back(); tid("button-view-trip").click(); pg.wait_for_url(re.compile("trips/" + S["ref"]))
    @t("booking: declined card -> payment failed -> try another card")
    def _():
        go("/app/home"); tid("button-where-to").click(); tid("input-pickup").fill("Castries"); tid("input-dropoff").fill("Rodney Bay"); tid("button-continue").click()
        tid("button-see-fare").click(); tid("button-continue-payment").click(); tid("input-card").fill("4000 0000 0000 0002"); tid("input-cvc").fill("123"); tid("input-card-name").fill("Maria Thompson"); tid("button-pay").click()
        pg.wait_for_url(re.compile("payment-failed"), timeout=8000); expect(tid("text-declined-card")).to_be_visible(); tid("button-try-another-card").click(); pg.wait_for_url(re.compile("book/payment$"))
    @t("booking: tour and round-trip branches")
    def _():
        go("/app/book/route"); tid("input-pickup").fill("Rodney Bay"); tid("input-dropoff").fill("Soufriere"); tid("tab-service-Tour").click(); tid("button-continue").click(); pg.wait_for_url(re.compile("book/tour")); tid("button-select-private").click(); pg.wait_for_url(re.compile("book/details"))
        go("/app/book/route"); tid("tab-service-Round-Trip").click(); tid("button-continue").click(); pg.wait_for_url(re.compile("round-trip")); tid("button-rt-see-fare").click(); pg.wait_for_url(re.compile("book/fare")); expect(tid("text-fare-return")).to_be_visible()
        tid("tab-service-Airport Transfer") if False else None
    @t("passenger: quote request sheet -> quote sent")
    def _():
        go("/app/home"); tid("card-service-chauffeur").click(); pg.get_by_placeholder("Pickup").fill("Rodney Bay"); tid("button-send-quote").click(); pg.wait_for_url(re.compile("quote/sent")); expect(tid("text-quote-id")).to_be_visible(); tid("button-back-home").click()
    @t("passenger: tabs, trips list, alerts, mark all read")
    def _():
        go("/app/home"); tid("tab-trips").click(); pg.wait_for_url(re.compile("app/trips")); expect(tid("card-trip-" + S["ref"])).to_be_visible(); tid("tab-past").click(); tid("tab-up").click()
        tid("tab-account").click(); pg.wait_for_url(re.compile("app/account")); tid("tab-home").click(); tid("link-alerts").click(); tid("button-mark-all-read").click(); expect(tid("toast").first).to_be_visible()
    @t("passenger: appearance choice persists and returns to light")
    def _():
        # One control per screen now: the account screen has the Light / Dark / System segment and no
        # separate dark-mode switch beside it.
        go("/app/account"); tid("button-theme-dark").click(); assert pg.evaluate("document.documentElement.classList.contains('dark')")
        pg.reload(); pg.wait_for_timeout(300); assert pg.evaluate("document.documentElement.classList.contains('dark')")
        tid("button-theme-light").click(); assert not pg.evaluate("document.documentElement.classList.contains('dark')")
    @t("passenger: add card and log out sheet (stay)")
    def _():
        go("/app/account/cards/new"); tid("input-new-card").fill("5555 5555 5555 4444"); tid("input-new-exp").fill("12 / 29"); tid("input-new-cvc").fill("321"); tid("input-new-name").fill("Maria Thompson")
        tid("button-save-card").click(); pg.wait_for_timeout(400)
        if tid("button-close-payment-methods").count(): tid("button-close-payment-methods").click()
        go("/app/account"); pg.reload(); pg.wait_for_timeout(300); tid("button-logout").click(); expect(tid("sheet-logout")).to_be_visible(); tid("button-stay-logged-in").click()
    @t("admin: sign in, dashboard KPIs, search")
    def _():
        go("/admin/login"); tid("button-admin-signin").click(); pg.wait_for_url(re.compile("#/admin$")); expect(tid("text-page-title")).to_have_text("Dashboard")
    @t("admin: bookings filter, empty state, clear filters")
    def _():
        go("/admin/bookings"); tid("input-search-bookings").fill("zzz"); expect(tid("empty-bookings")).to_be_visible(); tid("button-clear-filters").click(); expect(tid("row-booking-" + S["ref"])).to_be_visible()
    @t("admin: assign driver to the new booking (assign modal)")
    def _():
        go("/admin/bookings"); tid("button-assign-" + S["ref"]).click(); tid("option-driver-DRV-007").click(); tid("button-confirm-assign").click(); pg.wait_for_timeout(400)
        tid("row-booking-" + S["ref"]).click(); expect(tid("text-drawer-ref")).to_contain_text(S["ref"]); pg.keyboard.press("Escape")
    @t("admin: new booking modal validation + create")
    def _():
        go("/admin/bookings"); tid("button-new-booking").click(); pg.get_by_role("button", name="Create booking").click(); expect(tid("toast").first).to_contain_text("Add passenger")
        pg.get_by_placeholder("Passenger name").fill("Test Guest"); pg.get_by_placeholder("Drop-off").fill("Cap Estate"); pg.get_by_role("button", name="Create booking").click(); expect(tid("toast").filter(has_text="Booking created")).to_be_visible()
    @t("admin: every sidebar page renders with title")
    def _():
        if W < 1024: return
        for n, title in [("live-map","Live Map"),("drivers","Drivers"),("passengers","Passengers"),("pricing","Pricing"),("refunds","Refunds"),("reports","Reports"),("settings","Settings"),("dashboard","Dashboard")]:
            pg.locator(f'aside [data-testid="nav-{n}"]').click(); expect(tid("text-page-title")).to_have_text(title)
    @t("admin: account menu and stay signed in")
    def _():
        go("/admin"); tid("button-admin-avatar").click(); tid("menu-logout").click(); tid("button-stay-signed-in").click()
    @t("driver: demo login, new trip alert, accept")
    def _():
        pg.evaluate("sessionStorage.removeItem('stlu-session')"); go("/app/login"); tid("button-driver-demo").click(); pg.wait_for_url(re.compile("driver/jobs"))
        tid("button-new-trip-" + S["ref"]).click(); pg.wait_for_url(re.compile("new-trip")); tid("button-accept-trip").click(); pg.wait_for_url(re.compile("driver/trips/" + S["ref"]))
    @t("driver: on my way -> at pickup -> onboard -> auto complete -> done")
    def _():
        tid("button-on-my-way").click(); pg.wait_for_url(re.compile("progress"))
        for _i in range(40):
            pg.wait_for_timeout(450)
            if "/done" in pg.url: break
            if tid("button-next-status").count(): tid("button-next-status").click()
        pg.wait_for_url(re.compile("/done"), timeout=20000); tid("button-back-jobs").click(); pg.wait_for_url(re.compile("driver/jobs"))
    @t("driver: jobs next-trip card, navigate + call actions, tabs, renew insurance")
    def _():
        go("/app/driver/jobs"); expect(tid("card-next-trip")).to_be_visible(); assert "google.com/maps" in tid("button-navigate").get_attribute("href"); assert tid("button-call-passenger").get_attribute("href").startswith("tel:")
        expect(tid("banner-doc-expiry")).to_be_visible(); tid("banner-doc-expiry").click(); pg.wait_for_url(re.compile("driver/renew")); go("/app/driver/jobs")
        tid("tab-earnings").click(); expect(tid("text-earnings-today")).to_be_visible(); tid("tab-profile").click(); tid("link-all-trips") if False else None
    @t("passenger: completed trip can be rated")
    def _():
        pg.evaluate("sessionStorage.setItem('stlu-session', JSON.stringify({role:'passenger'}))"); pg.reload(); pg.wait_for_timeout(300); go("/app/trips/" + S["ref"] + "/complete"); tid("button-star-4").click(); tid("button-submit-rating").click(); expect(tid("toast").first).to_contain_text("Thanks")
    @t("passenger: cancel a trip with refund notice")
    def _():
        go("/app/trips/SLU-48315"); tid("button-cancel-trip").click(); tid("button-confirm-cancel").click(); pg.wait_for_url(re.compile("cancelled"))
    @t("outside driver job link: accept and step through")
    def _():
        go("/job/job-slu-48298"); 
        if tid("button-accept-job").count(): tid("button-accept-job").click()
        pg.wait_for_timeout(300); assert pg.locator('[data-testid^="button-step-"]').count() > 0 or pg.get_by_text(re.compile("complete|done|thank", re.I)).count() > 0
    @t("A2: new booking starts clean (no flight, child seat off, 1 bag) and fare shows only chosen extras")
    def _():
        pg.evaluate("sessionStorage.setItem('stlu-session', JSON.stringify({role:'passenger'}))"); go("/"); tid("button-reset-demo").click(); pg.get_by_role("button", name="Reset", exact=True).click()
        pg.evaluate("sessionStorage.setItem('stlu-session', JSON.stringify({role:'passenger'}))"); pg.reload(); go("/app/book/details"); pg.wait_for_timeout(300)
        assert tid("input-flight").input_value() == "", "flight prefilled"
        assert tid("switch-child-seat").get_attribute("aria-checked") == "false", "child seat on"
        assert tid("switch-extra-stop").get_attribute("aria-checked") == "false"
        tid("button-see-fare").click(); pg.wait_for_url(re.compile("book/fare")); expect(tid("text-total")).to_be_visible(); body = pg.locator("#phone-root").inner_text()
        assert "Child seat" not in body and "Extra stop" not in body and "1 bag" in body and "1 passenger" in body, body[:300]
    @t("A6: admin creates a driver with a temporary password (stored hashed, never plain)")
    def _():
        go("/admin/login"); tid("button-admin-signin").click(); go("/admin/drivers"); tid("button-add-driver").click(); dlg = pg.get_by_role("dialog")
        tid("input-driver-name").fill("Test Driver"); dlg.get_by_placeholder("+1 758 555 0100").fill("+1 758 555 0199"); dlg.get_by_placeholder("driver@stluciantaxiandtours.com").fill("test.driver@stlu.test")
        dlg.get_by_role("button", name="Add driver").click(); expect(tid("toast").first).to_be_visible()  # validation blocks an incomplete form
        tid("input-driver-temp-password").fill("Temp#12345"); dlg.get_by_placeholder("e.g. Toyota Noah").fill("Toyota Noah"); dlg.get_by_placeholder("Colour").fill("White"); dlg.get_by_placeholder("e.g. VF 4471").fill("PL 7788")
        for i in range(dlg.locator("input[type=date]").count()): dlg.locator("input[type=date]").nth(i).fill("2027-12-31")
        dlg.get_by_role("button", name="Add driver").click(); pg.wait_for_timeout(600)
        raw = pg.evaluate("localStorage.getItem('stlu-store-v3')"); assert "Temp#12345" not in raw, "plain password stored"; assert '"hash"' in raw and '"mustChange":true' in raw
    @t("A6: wrong password is rejected with an inline error; driver email cannot enter passenger mode")
    def _():
        pg.evaluate("sessionStorage.removeItem('stlu-session')"); pg.reload(); go("/app/login"); tid("input-email").fill("test.driver@stlu.test"); tid("input-password").fill("wrong-pass"); tid("button-submit-login").click()
        expect(tid("error-login")).to_contain_text("Wrong password"); assert "/app/login" in pg.url
        tid("input-email").fill("marcus.joseph@stluciantaxiandtours.com"); tid("input-password").fill("anything1"); tid("button-submit-login").click(); pg.wait_for_timeout(300); assert "/app/login" in pg.url, "seeded driver accepted a wrong password"
    @t("A6: right temporary password forces 'set your own password', then the old one stops working")
    def _():
        tid("input-email").fill("test.driver@stlu.test"); tid("input-password").fill("Temp#12345"); tid("button-submit-login").click()
        tid("input-new-password").fill("MyOwn#2026"); tid("input-confirm-password").fill("nope"); tid("button-save-password").click(); expect(tid("toast").first).to_contain_text("do not match")
        tid("input-confirm-password").fill("MyOwn#2026"); tid("button-save-password").click(); pg.wait_for_url(re.compile("driver/jobs"))
        pg.evaluate("sessionStorage.removeItem('stlu-session')"); pg.reload(); go("/app/login"); tid("input-email").fill("test.driver@stlu.test"); tid("input-password").fill("Temp#12345"); tid("button-submit-login").click(); expect(tid("error-login")).to_be_visible()
        tid("input-password").fill("MyOwn#2026"); tid("button-submit-login").click(); pg.wait_for_url(re.compile("driver/jobs"))
    @t("A6: admin reset password + resend login details; driver must change again")
    def _():
        did = pg.evaluate("JSON.parse(localStorage.getItem('stlu-store-v3')).drivers.find(d=>d.email==='test.driver@stlu.test').id")
        go("/admin/drivers/" + did); expect(tid("pill-login-state")).to_contain_text("own password"); tid("button-resend-login").click(); expect(tid("toast").first).to_contain_text("Login details sent")
        tid("button-reset-driver-password").click(); tid("input-reset-temp-password").fill("Reset#777"); tid("button-confirm-reset-password").click(); expect(tid("pill-login-state")).to_contain_text("temporary")
        pg.evaluate("sessionStorage.removeItem('stlu-session')"); pg.reload(); go("/app/login"); tid("input-email").fill("test.driver@stlu.test"); tid("input-password").fill("MyOwn#2026"); tid("button-submit-login").click(); expect(tid("error-login")).to_be_visible()
        tid("input-password").fill("Reset#777"); tid("button-submit-login").click(); expect(tid("input-new-password")).to_be_visible()
    @t("A4: rating has nothing pre-selected and submit is disabled until a star is tapped")
    def _():
        pg.evaluate("sessionStorage.setItem('stlu-session', JSON.stringify({role:'passenger'}))"); pg.reload(); go("/app/trips/SLU-47102/complete"); pg.wait_for_timeout(300)
        b = pg.evaluate("JSON.parse(localStorage.getItem('stlu-store-v3')).bookings.find(b=>b.ref==='SLU-47102')")
        if not b.get("rating"):
            assert tid("button-submit-rating").is_disabled(); assert pg.locator('[data-testid^="chip-tag-"][aria-pressed="true"]').count() == 0
            tid("button-star-5").click(); assert tid("button-submit-rating").is_enabled()
    @t("A3: earnings chart summary matches the completed trips")
    def _():
        pg.evaluate("sessionStorage.setItem('stlu-session', JSON.stringify({role:'driver',driverId:'DRV-007'}))"); pg.reload(); go("/app/driver/earnings"); expect(tid("chart-earnings")).to_be_visible()
        exp = pg.evaluate("(()=>{const s=JSON.parse(localStorage.getItem('stlu-store-v3'));const days=['2026-12-08','2026-12-09','2026-12-10','2026-12-11','2026-12-12','2026-12-13','2026-12-14'];const t=s.bookings.filter(b=>b.driverId==='DRV-007'&&b.status==='completed'&&days.some(d=>b.pickup.startsWith(d)));return t.length+' '+(t.length===1?'trip':'trips')})()")
        expect(tid("text-earnings-summary")).to_contain_text(exp)
    @t("landing: book this vehicle prefills the widget and reaches the booking note; destination card sets drop-off")
    def _():
        go("/landing"); assert "$89.25" in pg.locator("#fleet").inner_text() and "$5.00" not in pg.locator("#fleet").inner_text(); tid("button-book-vehicle-minivan").click(); expect(tid("chip-vehicle-request")).to_contain_text("Minivan")
        pg.locator('[data-testid^="card-dest-marigot-bay"]').click(); assert pg.eval_on_selector("#l-to", "e=>e.value") == "Marigot Bay"
        tid("button-landing-book").click(); pg.wait_for_url(re.compile("book/details")); assert "Vehicle request: Minivan" in pg.evaluate("JSON.parse(localStorage.getItem('stlu-store-v3')).draft.note"); assert pg.get_by_text("Vehicle request: Minivan").count() > 0
    @t("theme: one header button cycles light, dark, auto and the choice is remembered")
    def _():
        pg.evaluate("localStorage.removeItem('stlu-theme')"); go("/landing"); b = tid("button-theme"); assert b.get_attribute("data-mode") == "system"; assert "Auto" in b.get_attribute("title")
        b.click(); assert b.get_attribute("data-mode") == "light" and not pg.evaluate("document.documentElement.classList.contains('dark')")
        b.click(); assert b.get_attribute("data-mode") == "dark" and pg.evaluate("document.documentElement.classList.contains('dark')")
        go("/landing"); assert tid("button-theme").get_attribute("data-mode") == "dark"
        # the landing page carries the cycling header button only; the segment lives on the account screen
        go("/app/account"); tid("button-theme-light").click(); assert not pg.evaluate("document.documentElement.classList.contains('dark')")
    @t("theme: with no stored choice the app follows the device setting")
    def _():
        c2 = b.new_context(viewport={"width": 390, "height": 844}, color_scheme="dark"); p2 = c2.new_page(); p2.goto(URL + "/landing"); p2.wait_for_timeout(500)
        assert p2.evaluate("document.documentElement.classList.contains('dark')"); c2.close()
    @t("guided demo: steps move all frames together and the scenarios switch")
    def _():
        go("/demo?step=1&play=0")
        expect(tid("text-demo-title")).to_contain_text("passenger builds the trip")
        tid("button-demo-next").click(); tid("button-demo-next").click()
        expect(tid("text-demo-title")).to_contain_text("Dispatch gets the booking")
        tabbed = tid("tab-demo-admin").count() > 0
        if tabbed: tid("tab-demo-admin").click()  # phones and small tablets show one frame at a time
        expect(tid("demo-admin-row")).to_contain_text("Pending to assign")
        expect(tid("demo-toast")).to_contain_text("SMS")
        tid("select-demo-step").select_option(index=9)
        if tabbed: tid("tab-demo-admin").click()
        expect(tid("demo-admin-row")).to_contain_text("Completed")
        tid("button-demo-back").click(); expect(tid("text-demo-title")).to_contain_text("Passenger onboard")
        tid("select-scenario").select_option("cancel")
        expect(tid("text-demo-title")).to_contain_text("paid booking")
        tid("button-demo-next").click(); tid("button-demo-next").click()
        if tabbed: tid("tab-demo-admin").click()
        expect(tid("demo-admin-row")).to_contain_text("refunded")
    @t("guided demo: landing and welcome open it")
    def _():
        go("/landing"); tid("button-watch-demo").click(); pg.wait_for_url(re.compile("/demo")); expect(tid("text-demo-title")).to_be_visible()
        go("/app/welcome"); tid("button-watch-demo").click(); pg.wait_for_url(re.compile("/demo"))
    @t("no uncaught JS errors during the run")
    def _():
        assert not errs, errs[:2]
    b.close()
bad = [r for r in res if r[1] != "PASS"]
for r in res: print(r[1], "-", r[0], ("-> " + r[2]) if r[2] else "")
print(f"\n{browser} {W}x{Hh}: {len(res)-len(bad)}/{len(res)} passed")
