import sys; sys.path.insert(0, "/home/claude/tools")
from serve import serve
import sys
from playwright.sync_api import sync_playwright
BUILD = sys.argv[1] if len(sys.argv) > 1 else "/home/claude/after"
ORIGIN = serve(BUILD)
SIZES = [(320,568),(320,640),(390,780),(820,1180),(1024,768),(1440,900)]
JS = """() => {
  const out = {clip: [], overlap: [], tiny: []};
  for (const f of document.querySelectorAll('.demo-frame')) {
    const box = f.querySelector('[data-frame-box]') || f.lastElementChild;
    if (!box) continue;
    const label = (f.getAttribute('aria-label') || '?');
    // the screen inside the frame
    const inner = box.querySelector('[data-frame-screen]') || box.firstElementChild;
    const bh = box.getBoundingClientRect().height;
    if (inner) {
      const need = inner.scrollHeight, have = inner.clientHeight;
      if (need > have + 2) out.clip.push(label + ' content ' + need + ' > box ' + have);
    }
    const r = f.getBoundingClientRect();
    if (r.bottom > innerHeight + 1 || r.top < -1) out.clip.push(label + ' frame off-screen ' + Math.round(r.top) + '..' + Math.round(r.bottom));
    if (bh < 120) out.clip.push(label + ' box only ' + Math.round(bh) + 'px tall');
  }
  // every control must be the top element where it is: nothing may sit over it
  for (const sel of ['button-demo-next','button-demo-back','button-demo-play','button-demo-restart','select-demo-step']) {
    const e = document.querySelector('[data-testid=' + sel + ']');
    if (!e) continue;
    const r = e.getBoundingClientRect();
    if (r.width < 1) continue;
    const hit = document.elementFromPoint(r.x + r.width/2, r.y + r.height/2);
    if (!hit || !(e === hit || e.contains(hit) || hit.contains(e))) out.overlap.push(sel + ' covered by ' + (hit ? (hit.getAttribute('data-testid') || hit.className.toString().slice(0,26) || hit.tagName) : 'nothing'));
    if (r.bottom > innerHeight + 1) out.overlap.push(sel + ' below the fold');
  }
  for (const e of document.querySelectorAll('.demo-frame *')) {
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || !e.textContent.trim() || e.children.length) continue;
    const fs = parseFloat(cs.fontSize) * (parseFloat(f_scale(e)) || 1);
    const r = e.getBoundingClientRect();
    if (r.width > 0 && fs < 11.9) out.tiny.push(e.textContent.trim().slice(0,14) + ' ' + fs.toFixed(1) + 'px');
    if (r.width > 0 && r.width < 26 && r.height > 60) out.tiny.push('tall-thin: ' + e.textContent.trim().slice(0,14));
  }
  function f_scale(e) { const m = getComputedStyle(e.closest('[style*=scale]') || document.body).transform;
    if (!m || m === 'none') return 1; const p = m.match(/matrix\\(([^,]+)/); return p ? p[1] : 1; }
  return out;
}"""
bad = 0
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in SIZES:
        ctx = b.new_context(viewport={"width": w, "height": h}); pg = ctx.new_page()
        for step in range(1, 11):
            pg.goto("about:blank")
            pg.goto(f"{ORIGIN}/index.html#/demo?step={step}&play=0")
            pg.wait_for_timeout(1300)
            r = pg.evaluate(JS)
            msgs = r["clip"] + r["overlap"] + r["tiny"]
            if msgs:
                bad += 1
                print(f"{w}x{h} step {step}: " + " | ".join(msgs[:3]))
        ctx.close()
    b.close()
print("FRAME CHECK:", "FAIL" if bad else "PASS", f"({bad} bad states of {len(SIZES)*10})")
