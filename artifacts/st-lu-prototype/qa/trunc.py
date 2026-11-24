import sys,json
sys.path.insert(0,"/home/claude/tools")
from serve import serve
from playwright.sync_api import sync_playwright
BUILD=sys.argv[1] if len(sys.argv)>1 else "after"
SIZES=[(344,882),(360,800),(375,667),(390,844),(393,852),(412,915),(430,932),(768,1024),(1009,700),(1280,800)]
ROUTES=["/app/book/route","/app/book/details","/app/book/fare","/app/book/payment","/app/book/round-trip","/app/book/tour","/app/account","/landing",]
OLD=["/landing","/app/book","/app/book?step=details","/app/book?step=payment"]
JS="""()=>{const out=[];const c=document.createElement('canvas').getContext('2d');
for(const el of document.querySelectorAll('select,input,button,a,span,p,div,h1,h2,h3,label')){
 const r=el.getBoundingClientRect(); if(r.width<4||r.height<4) continue; const cs=getComputedStyle(el); if(cs.visibility==='hidden'||cs.display==='none') continue;
 if(el.tagName==='SELECT'){const o=el.options[el.selectedIndex]; if(!o) continue; c.font=cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily; const w=c.measureText(o.text).width; const avail=r.width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-(parseFloat(cs.backgroundSize)||0); if(w>avail-1) out.push(['select',el.id,o.text,Math.round(w),Math.round(avail)]); continue}
 if(el.tagName==='INPUT'){ if(!el.value) continue; c.font=cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily; const w=c.measureText(el.value).width; const avail=r.width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight); if(w>avail+1) out.push(['input',el.id||el.name,el.value,Math.round(w),Math.round(avail)]); continue}
 if(el.scrollWidth>el.clientWidth+1 && (cs.textOverflow==='ellipsis'||cs.overflow!=='visible') && el.children.length===0 && el.textContent.trim()) out.push(['ellipsis',el.tagName,el.textContent.trim().slice(0,40),el.scrollWidth,el.clientWidth]);
}
return out}"""
O=serve("/home/claude/"+BUILD)
tot=0
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for tone in ("light","dark"):
      for w,h in SIZES:
        ctx=b.new_context(viewport={"width":w,"height":h},color_scheme=tone); pg=ctx.new_page()
        pg.add_init_script("sessionStorage.setItem('stlu-session','{\"role\":\"passenger\"}')")
        for r in ROUTES:
            pg.goto(O+"/index.html#"+r); pg.wait_for_timeout(900)
            res=pg.evaluate(JS)
            if res: tot+=len(res); print(tone,w,h,r,json.dumps(res)[:400])
        ctx.close()
    b.close()
print("TRUNC TOTAL",tot)
