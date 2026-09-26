import sys, os, glob
from PIL import Image, ImageDraw, ImageFont
src, out, lo, hi = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
os.makedirs(out, exist_ok=True)
files = [f for f in sorted(glob.glob(os.path.join(src, 'p*.png'))) if lo <= int(os.path.basename(f)[1:4]) <= hi]
cols, tw, th, per = 4, 480, 270, 16
for i in range(0, len(files), per):
    chunk = files[i:i+per]; rows = (len(chunk)+cols-1)//cols
    sh = Image.new('RGB', (cols*tw, rows*th), 'white'); d = ImageDraw.Draw(sh)
    for j, f in enumerate(chunk):
        im = Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS); x, y = (j % cols)*tw, (j//cols)*th
        sh.paste(im, (x, y)); d.rectangle([x, y, x+tw-1, y+th-1], outline='black', width=2)
        d.rectangle([x, y, x+64, y+26], fill='black'); d.text((x+6, y+3), os.path.basename(f)[1:4], fill='yellow', font=ImageFont.load_default(size=20))
    sh.save(os.path.join(out, 's%03d.png' % (i//per)))
print(len(files))
