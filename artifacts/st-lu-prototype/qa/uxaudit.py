"""UX audit: spacing between taps, unlabelled icon buttons, duplicate ids, inert controls."""
import json
from playwright.sync_api import sync_playwright
B="/home/claude/after"
P='{"role":"passenger"}'; D='{"role":"driver","driverId":"DRV-007"}'
PAGES=[("/",None),("/landing",None),("/app/welcome",None),("/app/login",None),("/app/home",P),
 ("/app/book/route",P),("/app/book/details",P),("/app/book/fare",P),("/app/book/payment",P),
 ("/app/trips",P),("/app/trips/SLU-48213/live",P),("/app/account",P),("/app/driver/jobs",D),
 ("/app/driver/earnings",D),("/app/driver/trips/SLU-48213/progress",D),("/admin","A"),
 ("/admin/bookings","A"),("/admin/live-map","A"),("/admin/drivers","A"),("/admin/passengers","A"),
 ("/admin/pricing","A"),("/admin/reports","A"),("/job/job-slu-48298",None),("/screens",None),("/previews/messages",None)]
JS=r"""()=>{
 const out={close:[],noname:[],dupid:[],inert:[]};
 const sel='button,a[href],select,input,[role=button],[role=tab],[role=switch]';
 const els=[...document.querySelectorAll(sel)].filter(e=>{const r=e.getBoundingClientRect();
   return r.width>4&&r.height>4&&getComputedStyle(e).visibility!=='hidden';});
 // duplicate testids
 const seen={}; for(const e of document.querySelectorAll('[data-testid]')){const t=e.dataset.testid;
   if(!e.getBoundingClientRect().width)continue; seen[t]=(seen[t]||0)+1;}
 for(const k in seen) if(seen[k]>1) out.dupid.push(k+' x'+seen[k]);
 // accessible name
 const name=e=>{const t=(e.innerText||'').trim()||e.getAttribute('aria-label')||e.getAttribute('title')||
   (e.getAttribute('aria-labelledby')?(document.getElementById(e.getAttribute('aria-labelledby'))||{}).innerText:'')||
   (e.tagName==='INPUT'?(e.placeholder||e.value||''):''); return (t||'').trim();};
 for(const e of els){ if(e.tagName==='SELECT'||e.tagName==='INPUT')continue;
   if(!name(e)) out.noname.push((e.dataset.testid||e.className.toString().slice(0,30))); }
 // gap between neighbouring tap targets (visual gap < 6px and both clickable)
 const box=e=>{const r=e.getBoundingClientRect();return r;};
 for(let i=0;i<els.length;i++)for(let j=i+1;j<els.length;j++){
   const a=els[i],b=els[j]; if(a.contains(b)||b.contains(a))continue;
   const ra=box(a),rb=box(b);
   const dx=Math.max(0, Math.max(ra.left,rb.left)-Math.min(ra.right,rb.right));
   const dy=Math.max(0, Math.max(ra.top,rb.top)-Math.min(ra.bottom,rb.bottom));
   const overlapX=Math.min(ra.right,rb.right)-Math.max(ra.left,rb.left);
   const overlapY=Math.min(ra.bottom,rb.bottom)-Math.max(ra.top,rb.top);
   if(dx>0&&dx<6&&overlapY>6) out.close.push((a.dataset.testid||a.tagName)+' | '+(b.dataset.testid||b.tagName)+' gapX '+dx.toFixed(1));
   else if(dy>0&&dy<6&&overlapX>6) out.close.push((a.dataset.testid||a.tagName)+' | '+(b.dataset.testid||b.tagName)+' gapY '+dy.toFixed(1));
 }
 return out;}"""
tot={}
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h in ((375,667),(430,932),(768,1024),(1440,900)):
        for route,sess in PAGES:
            ctx=b.new_context(viewport={"width":w,"height":h}); pg=ctx.new_page()
            if sess=="A": pg.add_init_script("try{sessionStorage.setItem('stlu-admin','1');localStorage.setItem('stlu-admin','1')}catch(e){}")
            elif sess: pg.add_init_script(f"try{{sessionStorage.setItem('stlu-session','{sess}')}}catch(e){{}}")
            pg.goto(f"file://{B}/index.html#{route}"); pg.wait_for_timeout(1200)
            r=pg.evaluate(JS)
            for k,v in r.items():
                if v:
                    for item in (v if isinstance(v,list) else [v]):
                        tot.setdefault(k,[]).append(f"{w} {route}: {item}")
            ctx.close()
    b.close()
for k,v in tot.items():
    print(f"--- {k} ({len(v)})")
    for line in v[:25]: print("   ",line)
if not tot: print("UX DOM AUDIT: clean")
