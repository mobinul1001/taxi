import os,sys
from playwright.sync_api import sync_playwright
B=sys.argv[1] if len(sys.argv)>1 else "/home/claude/after"
OUT="/home/claude/shots/v13"; os.makedirs(OUT,exist_ok=True)
W=[320,390,768,1009,1440,1920]
with sync_playwright() as p:
    b=p.chromium.launch()
    for tone in ("light","dark"):
        for w in W:
            ctx=b.new_context(viewport={"width":w,"height":900},color_scheme=tone)
            pg=ctx.new_page()
            pg.add_init_script("try{localStorage.setItem('stlu-theme','system')}catch(e){}")
            pg.goto(f"file://{B}/index.html#/"); pg.wait_for_timeout(1600)
            pg.screenshot(path=f"{OUT}/hub-{w}{'-dark' if tone=='dark' else ''}.png", full_page=True)
            # with the tour bar on
            pg.click("[data-testid=switch-show-tour-bar]"); pg.wait_for_timeout(700)
            pg.screenshot(path=f"{OUT}/hubbar-{w}{'-dark' if tone=='dark' else ''}.png", full_page=True)
            ctx.close()
    b.close()
print("shots done")
