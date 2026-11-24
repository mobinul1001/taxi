import sys, os; sys.path.insert(0,"/home/claude/tools")
from serve import serve
from playwright.sync_api import sync_playwright
# usage: one.py build route w h tone out [session]
build,route,w,h,tone,out=sys.argv[1:7]; sess=sys.argv[7] if len(sys.argv)>7 else "-"
O=serve(build)
with sync_playwright() as pw:
    b=pw.chromium.launch(); ctx=b.new_context(viewport={"width":int(w),"height":int(h)},color_scheme=tone); pg=ctx.new_page()
    if sess=="p": pg.add_init_script("try{sessionStorage.setItem('stlu-session','{\"role\":\"passenger\"}')}catch(e){}")
    if sess=="d": pg.add_init_script("try{sessionStorage.setItem('stlu-session','{\"role\":\"driver\",\"driverId\":\"DRV-007\"}')}catch(e){}")
    if sess=="A": pg.add_init_script("try{sessionStorage.setItem('stlu-admin','1');localStorage.setItem('stlu-admin','1')}catch(e){}")
    pg.goto(O+"/index.html#"+route); pg.wait_for_timeout(2600)
    print(pg.evaluate("()=>[document.documentElement.scrollHeight,innerHeight,document.documentElement.scrollWidth,innerWidth]"))
    pg.screenshot(path=out); b.close()
