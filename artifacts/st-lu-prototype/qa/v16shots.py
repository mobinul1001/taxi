import sys, os; sys.path.insert(0,"/home/claude/tools")
from serve import serve
from playwright.sync_api import sync_playwright
O=serve("/home/claude/after"); OUT="/home/claude/shots/v16"; os.makedirs(OUT,exist_ok=True)
DEV=[("iPhoneSE",375,667),("iPhone14",390,844),("iPadMini",768,1024),("iPadPro",1024,1366),("w1280",1280,800),("w1920",1920,1080)]
PAGES=[("start","/","-"),("landing","/landing","-"),("home","/app/home","p"),("details","/app/book/details","p"),
       ("payment","/app/book/payment","p"),("admin","/admin","A"),("bookings","/admin/bookings","A"),
       ("driver","/app/driver/jobs","d"),("screens","/screens","-")]
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for tone in ("light","dark"):
        for dn,w,h in DEV:
            for pn,route,sess in PAGES:
                ctx=b.new_context(viewport={"width":w,"height":h},color_scheme=tone); pg=ctx.new_page()
                pg.add_init_script("try{localStorage.setItem('stlu-theme','system')}catch(e){}")
                if sess=="A": pg.add_init_script("try{sessionStorage.setItem('stlu-admin','1');localStorage.setItem('stlu-admin','1')}catch(e){}")
                elif sess=="p": pg.add_init_script("try{sessionStorage.setItem('stlu-session','{\"role\":\"passenger\"}')}catch(e){}")
                elif sess=="d": pg.add_init_script("try{sessionStorage.setItem('stlu-session','{\"role\":\"driver\",\"driverId\":\"DRV-007\"}')}catch(e){}")
                pg.goto(O+"/index.html#"+route); pg.wait_for_timeout(2300)
                pg.screenshot(path=f"{OUT}/{tone}-{dn}-{pn}.png")
                ctx.close()
    b.close()
print("done")
