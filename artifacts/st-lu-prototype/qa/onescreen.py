import sys,re; sys.path.insert(0,"/home/claude/tools")
from serve import serve
from playwright.sync_api import sync_playwright
src=open("/home/claude/tools/respgate.py").read()
devs=re.search(r'DEVS = """(.*?)"""',src,re.S).group(1).split()
O=serve("/home/claude/after"); bad=0
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for d in devs:
        w,h=map(int,d.split("x")); ctx=b.new_context(viewport={"width":w,"height":h}); pg=ctx.new_page()
        for r in ("/app/welcome","/app/login","/nope"):
            pg.goto("about:blank"); pg.goto(O+"/index.html#"+r); pg.wait_for_timeout(900)
            v=pg.evaluate("()=>[document.documentElement.scrollHeight, innerHeight, document.querySelectorAll('.leaflet-container').length]")
            # at <400 high a screen scrolls by design; above that it must be one screen
            if h>=400 and (v[0]>v[1]+1 or v[2]): bad+=1; print("BAD",d,r,v)
        ctx.close()
    b.close()
print("ONE-SCREEN BAD:",bad)
