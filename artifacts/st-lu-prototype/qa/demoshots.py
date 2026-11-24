import sys; sys.path.insert(0, "/home/claude/tools")
from serve import serve
import sys, os
from playwright.sync_api import sync_playwright
build, out = sys.argv[1], sys.argv[2]
ORIGIN = serve(build)
os.makedirs(out, exist_ok=True)
sizes = [(1920, 1080), (1440, 900), (1180, 820), (1024, 768), (768, 1024), (390, 844), (320, 568)]
steps = [1, 3, 5, 7, 10]
problems = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for dark in (False, True):
        for w, h in sizes:
            ctx = b.new_context(viewport={"width": w, "height": h})
            if dark:
                ctx.add_init_script("try{localStorage.setItem('stlu-theme','dark')}catch(e){}")
            pg = ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            for st in steps:
                pg.goto("about:blank")  # hash-only navigation would not remount the page
                pg.goto(f"{ORIGIN}/index.html#/demo?step={st}&play=0")
                pg.wait_for_timeout(700)
                ov = pg.evaluate("document.documentElement.scrollWidth - window.innerWidth")
                oy = pg.evaluate("document.documentElement.scrollHeight - window.innerHeight")
                small = pg.evaluate("""() => [...document.querySelectorAll('body *')].filter(e => {
                    const t=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
                    if(!t) return false; const cs=getComputedStyle(e);
                    if(cs.display==='none'||cs.visibility==='hidden'||e.closest('.sr-only')) return false;
                    return parseFloat(cs.fontSize) < 12 - 0.01;
                }).map(e=>e.tagName+'.'+e.className+':'+getComputedStyle(e).fontSize+':'+e.textContent.trim().slice(0,22)).slice(0,6)""")
                clipped = pg.evaluate("""() => [...document.querySelectorAll('body *')].filter(e=>{
                    const cs=getComputedStyle(e);
                    if(cs.textOverflow!=='ellipsis'&&cs.overflow!=='hidden') return false;
                    if(!e.textContent.trim()||e.closest('.sr-only')||e.classList.contains('sr-only')||e.closest('.leaflet-container')) return false;
                    return e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0;
                }).map(e=>e.tagName+'.'+String(e.className).slice(0,40)+':'+e.textContent.trim().slice(0,24)).slice(0,6)""")
                tag = f"{w}{'-dark' if dark else ''}-s{st}"
                if errs or ov or oy or small or clipped:
                    problems.append((tag, "errs" if errs else "", f"ovX={ov}" if ov else "", f"ovY={oy}" if oy else "", small, clipped, errs[:1]))
                if st in (3, 5, 7, 10) and w in (1920, 1440, 1024, 390):
                    pg.screenshot(path=f"{out}/demo-{tag}.png")
            ctx.close()
    b.close()
for x in problems:
    print(x)
print("PROBLEMS" if problems else "demo: no overflow, no clipped text, nothing under 12px, no page errors")
