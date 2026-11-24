import os
from PIL import Image, ImageDraw, ImageFont
S="/home/claude/shots/v13"; OUT="/home/claude/shots/sheets"; os.makedirs(OUT,exist_ok=True)
F=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",17)
Fs=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",14)
W=[320,390,768,1009,1440,1920]; TH=520; GAP,PAD,HEAD,CAP=18,26,56,24
for key,title in (("hub","Start page (tour bar off)"),("hubbar","Start page (tour bar on)")):
    rows=[]
    for tone in ("light","dark"):
        ims=[]
        for w in W:
            p=f"{S}/{key}-{w}{'-dark' if tone=='dark' else ''}.png"
            if not os.path.exists(p): continue
            im=Image.open(p); k=TH/im.height
            ims.append((w,im.resize((max(1,int(im.width*k)),TH), Image.LANCZOS)))
        rows.append((tone,ims))
    rw=max(sum(i.width for _,i in r)+GAP*(len(r)-1) for _,r in rows)
    sh=Image.new("RGB",(rw+PAD*2, HEAD+(TH+CAP+GAP)*2+PAD),"#F5F2EC"); d=ImageDraw.Draw(sh)
    d.text((PAD,18),f"{title}  ·  light row, then dark row  ·  320 / 390 / 768 / 1009 / 1440 / 1920",font=F,fill="#2A2420")
    y=HEAD
    for tone,ims in rows:
        x=PAD
        for w,im in ims:
            sh.paste(im,(x,y)); d.text((x,y+TH+5),f"{w}px · {tone}",font=Fs,fill="#5A5048"); x+=im.width+GAP
        y+=TH+CAP+GAP
    sh.save(f"{OUT}/v13-{key}.png"); print(f"{OUT}/v13-{key}.png", sh.size)
