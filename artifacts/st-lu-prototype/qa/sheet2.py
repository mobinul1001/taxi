import sys, os
from PIL import Image, ImageDraw, ImageFont
OUT="/home/claude/shots/sheets"; os.makedirs(OUT, exist_ok=True)
F=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",17)
W=[320,390,768,1009,1440,1920]
NAMES={"route":"Plan your ride","live":"Live trip","trips":"My trips","home":"App home","jobs":"Driver jobs","livemap":"Admin Live Map","admin":"Admin dashboard","bookings":"Admin bookings","drivers":"Admin drivers","job":"Job link (outside driver)","landing":"Landing page","welcome":"Welcome","demo":"Guided demo"}
GAP,PAD,HEAD,CAP,TH=18,26,54,26,300
for key,title in NAMES.items():
    rows=[]
    for tone,folder in (("light","v12L"),("dark","v12D")):
        ims=[]
        for w in W:
            p=f"/home/claude/shots/{folder}/{key}-{w}{"-dark" if tone=="dark" else ""}.png"
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
            sh.paste(im,(x,y)); d.rectangle([x,y,x+im.width-1,y+im.height-1],outline="#C9C1B5")
            d.text((x+2,y+im.height+4),f"{w}px  {tone}",font=F,fill="#6B6257"); x+=im.width+GAP
        y+=TH+CAP+GAP
    f=f"{OUT}/v12-{key}.jpg"; sh.save(f,quality=90); print(f, sh.size)
