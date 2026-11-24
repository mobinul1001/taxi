import sys
from playwright.sync_api import sync_playwright
from PIL import Image
B="file:///home/claude/after/index.html#"
P='{"role":"passenger"}'
SC=[("live","/app/trips/SLU-48213/live",P),("route","/app/book/route",P),
    ("progress","/app/driver/trips/SLU-48213/progress",'{"role":"driver","driverId":"DRV-007"}'),
    ("livemap","/admin/live-map","ADMIN")]
def seams(path, box):
    im=Image.open(path).convert("RGB").crop(box); w,h=im.size; px=im.load(); out=[]
    for y in range(3,h-3):
        run=0; best=0
        for x in range(0,w,2):
            a=px[x,y]; up=px[x,y-2]; dn=px[x,y+2]
            if all(a[c]>up[c]+5 and a[c]>dn[c]+5 for c in range(3)): run+=1; best=max(best,run)
            else: run=0
        if best>w//8: out.append((y+box[1], best))
    return out
with sync_playwright() as p:
    b=p.chromium.launch(); found=[]
    for dark in (False,True):
        for w,h in ((390,844),(1024,768)):
            ctx=b.new_context(viewport={"width":w,"height":h}); pg=ctx.new_page()
            for name,route,sess in SC:
                pg.goto("about:blank")
                init = "try{sessionStorage.setItem('stlu-admin','1');localStorage.setItem('stlu-admin','1');" if sess=="ADMIN" else "try{sessionStorage.setItem('stlu-session', '%s');"%sess
                if dark: init+="localStorage.setItem('stlu-theme','dark');"
                init+="}catch(e){}"
                pg.add_init_script(init)
                pg.goto(B+route); pg.wait_for_timeout(2600)
                r=pg.evaluate("()=>{const e=document.querySelector('.leaflet-container');if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.x)+4,Math.round(b.y)+4,Math.round(b.right)-4,Math.round(b.bottom)-4];}")
                if not r: print("no map", name, w, "dark" if dark else "light"); continue
                f=f"/tmp/seam-{name}-{w}-{int(dark)}.png"; pg.screenshot(path=f)
                s=seams(f, tuple(r))
                tag=f"{name} {w} {'dark' if dark else 'light'}"
                if s: found.append(tag); print("SEAM", tag, s[:4])
            ctx.close()
    b.close()
    print("SEAM ROWS:", len(found))
