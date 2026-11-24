"""Cut-text detector: sideways-scrolling tables/boxes, cut selects, ellipsis, clipped text. Every page, chosen sizes, light+dark.
usage: cut.py build "WxH WxH ..." [pageFilter]"""
import sys,json
sys.path.insert(0,"/home/claude/tools")
from serve import serve
from playwright.sync_api import sync_playwright
BUILD=sys.argv[1]; SIZES=[tuple(map(int,s.split("x"))) for s in sys.argv[2].split()]; FILT=sys.argv[3] if len(sys.argv)>3 else ""
P='{"role":"passenger"}'; D='{"role":"driver","driverId":"DRV-007"}'
PAGES=[("/",None),("/landing",None),("/taxi-app-development-company/",None),("/taxi-app-development/",None),("/taxi-booking-app-development/",None),("/custom-taxi-app-development/",None),("/white-label-taxi-app/",None),("/uber-clone-app-development/",None),("/taxi-dispatch-software/",None),("/taxi-app-development-services/",None),("/taxi-app-development-cost/",None),("/taxi-app-developers/",None),("/taxi-app-solutions/",None),("/contact/",None),("/screens",None),("/previews/messages",None),("/app/welcome",None),("/app/login",None),
("/app/home",P),("/app/book/route",P),("/app/book/details",P),("/app/book/fare",P),("/app/book/payment",P),("/app/book/confirmed",P),("/app/book/tour",P),("/app/book/round-trip",P),
("/app/trips",P),("/app/trips/SLU-48213",P),("/app/trips/SLU-48213/live",P),("/app/account",P),("/app/alerts",P),("/app/terms",P),
("/app/driver/jobs",D),("/app/driver/earnings",D),("/app/driver/trips/SLU-48213/progress",D),("/app/driver/profile",D),("/app/driver/alerts",D),("/app/driver/trips",D),
("/job/job-slu-48298",None),("/nope",None),
("/admin","A"),("/admin/bookings","A"),("/admin/live-map","A"),("/admin/drivers","A"),("/admin/drivers/DRV-007","A"),("/admin/passengers","A"),
("/admin/passengers/maria.thompson%40example.com","A"),("/admin/pricing","A"),("/admin/refunds","A"),("/admin/reports","A"),("/admin/settings","A"),("/admin/nope","A")]
DEMO=[(f"/demo?step={n}&play=0",None) for n in (1,4,7,10)]
JS=r"""()=>{const out=[];const c=document.createElement('canvas').getContext('2d');
const vis=el=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);return r.width>3&&r.height>3&&cs.visibility!=='hidden'&&cs.display!=='none'&&!el.closest('.leaflet-container,.demo-screen')};
for(const el of document.querySelectorAll('select')){ if(!vis(el))continue; const o=el.options[el.selectedIndex]; if(!o)continue; const cs=getComputedStyle(el); c.font=cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
 const r=el.getBoundingClientRect(); const w=c.measureText(o.text).width; const avail=r.width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight); if(w>avail) out.push(['select',el.getAttribute('aria-label')||el.id,o.text,Math.round(w),Math.round(avail)]);
}
for(const el of document.querySelectorAll('body *')){ if(!vis(el))continue; const cs=getComputedStyle(el);
 const ox=cs.overflowX; 
 if((ox==='auto'||ox==='scroll')&&el.scrollWidth>el.clientWidth+1&&!el.classList.contains('no-scrollbar')) out.push(['scroller',el.tagName+'.'+String(el.className).slice(0,40),el.scrollWidth,el.clientWidth]);
 if(el.children.length===0&&el.textContent.trim().length>2&&el.scrollWidth>el.clientWidth+1&&(cs.textOverflow==='ellipsis'||ox!=='visible')) out.push(['ellipsis',el.tagName,el.textContent.trim().slice(0,40),el.scrollWidth,el.clientWidth]);
 if(el.children.length===0){const t=el.textContent.trim(); if(/(…|\.\.\.)$/.test(t)&&t.length>3&&!/^(Loading|Searching|Sending|Processing|Finding|Connecting)/.test(t)) out.push(['dots',el.tagName,t.slice(0,50)]);}}
for(const el of document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]):not([type=hidden]),textarea')){ if(!vis(el))continue; if(el.scrollWidth>el.clientWidth+1&&el.tagName==='INPUT'&&el.value) out.push(['cut-input',el.getAttribute('aria-label')||el.name||el.placeholder||'',el.value.slice(0,40),el.scrollWidth,el.clientWidth]);}
const lines=(el)=>{const tops=[];const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){if(!n.textContent.trim())continue;const rg=document.createRange();rg.selectNodeContents(n);for(const q of rg.getClientRects()){if(q.width<1)continue;if(!tops.some(t=>Math.abs(t-q.top)<5))tops.push(q.top)}}return tops.length};
for(const el of document.querySelectorAll('button,a,[role=button],[class*=rounded-full]')){ if(!vis(el))continue; const t=(el.innerText||'').trim(); if(!t||t.length>38||/\n/.test(t))continue; if(el.querySelector('p,h1,h2,h3,div'))continue; if(lines(el)>1) out.push(['wrapped-label',t,el.tagName,Math.round(el.getBoundingClientRect().width)]);}
const btns=[...document.querySelectorAll('button,a,[role=button]')].filter(e=>vis(e)&&e.getBoundingClientRect().height>=38&&(e.innerText||'').trim().length>0&&(e.innerText||'').length<40&&/rounded/.test(e.className)&&/border|bg-/.test(e.className));
const byP=new Map();for(const e of btns){const p=e.parentElement;if(!byP.has(p))byP.set(p,[]);byP.get(p).push(e)}
for(const [p,l] of byP){ if(l.length<2)continue; const r=l.map(e=>e.getBoundingClientRect()); const stacked=r.every((q,i)=>i==0||q.top>=r[i-1].bottom-2); if(stacked){const w=r.map(q=>Math.round(q.width)); if(Math.max(...w)-Math.min(...w)>2) out.push(['ragged-stack',l.map(e=>(e.innerText||'').trim().slice(0,14)).join('|'),w.join(',')]);}}
const tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let nd;
while((nd=tw.nextNode())){const el=nd.parentElement;if(!el||!vis(el)||/^(SCRIPT|STYLE|OPTION|TEXTAREA)$/.test(el.tagName))continue;const tx=nd.textContent;const re=/\S{2,}/g;let m;
 while((m=re.exec(tx))){const rg=document.createRange();rg.setStart(nd,m.index);rg.setEnd(nd,m.index+m[0].length);const rs=[...rg.getClientRects()].filter(q=>q.width>1);
  if(rs.length>1&&Math.abs(rs[0].top-rs[rs.length-1].top)>4&&!/[-/·–—]/.test(m[0])) out.push(['broken-word',m[0].slice(0,30),el.tagName]);}}
const dx=document.documentElement.scrollWidth-innerWidth; if(dx>0) out.push(['page-hscroll',dx]);
return out}"""
O=serve("/home/claude/"+BUILD); tot=0; n=0
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for tone in ("light","dark"):
      for w,h in SIZES:
        ctx=b.new_context(viewport={"width":w,"height":h}); pg=ctx.new_page()
        for route,sess in PAGES+DEMO:
            if FILT and FILT not in route: continue
            init="try{"
            if sess=="A": init+="sessionStorage.setItem('stlu-admin','1');localStorage.setItem('stlu-admin','1');"
            elif sess: init+="sessionStorage.setItem('stlu-session','%s');"%sess
            if tone=="dark": init+="localStorage.setItem('stlu-theme','dark');"
            init+="}catch(e){}"
            pg.goto("about:blank"); pg.add_init_script(init)
            pg.goto(O+"/index.html#"+route); pg.wait_for_timeout(1100)
            r=pg.evaluate(JS); n+=1
            if r: tot+=len(r); print(tone,f"{w}x{h}",route,json.dumps(r)[:330])
        ctx.close()
    b.close()
print("CUT TOTAL",tot,"states",n)
