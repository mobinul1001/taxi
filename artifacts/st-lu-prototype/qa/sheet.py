import sys
from PIL import Image
out = sys.argv[1]; h = int(sys.argv[2]); files = sys.argv[3:]
ims = []
for f in files:
    im = Image.open(f).convert("RGB")
    if im.height > im.width * 3: im = im.crop((0, 0, im.width, im.width * 3))
    r = h / im.height; ims.append(im.resize((max(1, int(im.width * r)), h)))
W = sum(i.width for i in ims) + 8 * (len(ims) + 1)
s = Image.new("RGB", (W, h + 16), "#888")
x = 8
for i in ims: s.paste(i, (x, 8)); x += i.width + 8
s.save(out, quality=80)
