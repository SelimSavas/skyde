# YUP Akademi marka varlıklarını marka.js'e gömer: logo sembolü (saydam, beyaz) ve yazı tipleri.
#   python3 video/yup-marka/build.py <fontsource-node_modules>
#   (yazı tipleri: npm i @fontsource/nunito@5 @fontsource/caveat@5 ile bir geçici klasöre kurulur)
# Görseller ve yazı tipleri data URI olarak gömülür: file:// ile açılan sayfada dış dosya tuvali kirletir.
import base64, io, json, os, re, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
NM = sys.argv[1]

# Logo: teal kare içindeki beyaz sembol → beyaz, saydamlığı parlaklıktan
im = np.asarray(Image.open(os.path.join(HERE, 'logo.jpg')).convert('RGB')).astype(np.float32)
teal = np.array([24, 118, 118], np.float32)
# beyaza uzaklığa göre saydamlık (R kanalı tealde 24, beyazda 255)
a = np.clip((im[..., 0] - teal[0] - 12) / (255 - teal[0] - 24), 0, 1)
# yalnız kare içi: köşelerdeki beyaz zemini at (sembol 400–1600 arasında)
mask = np.zeros_like(a)
mask[400:1600, 400:1600] = 1
a *= mask
ys, xs = np.where(a > 0.05)
x0, x1, y0, y1 = xs.min() - 8, xs.max() + 9, ys.min() - 8, ys.max() + 9
alpha = (a[y0:y1, x0:x1] * 255).astype(np.uint8)
rgba = np.dstack([np.full_like(alpha, 255)] * 3 + [alpha])
sym = Image.fromarray(rgba, 'RGBA')
buf = io.BytesIO()
sym.save(buf, 'WEBP', quality=92, method=6)
logo = {'src': 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode(), 'w': sym.width, 'h': sym.height,
        # sembolün logodaki yeri (2000 px kare içinde): yuvarlak kareyi aynı oranda çizmek için
        'box': [int(x0), int(y0), 2000]}

# Yazı tipleri: fontsource CSS'inden latin ve latin-ext yüzleri (Türkçe ğ ş ı İ latin-ext'te)
faces = []
for fam, pkg, weights in [('Nunito', 'nunito', [600, 700, 800, 900]), ('Caveat', 'caveat', [600, 700])]:
    for w in weights:
        css = open(os.path.join(NM, '@fontsource', pkg, f'{w}.css')).read()
        for block in re.findall(r'/\* [^*]+ \*/\s*@font-face \{[^}]+\}', css):
            sub = re.search(r'/\* \S+-(latin(?:-ext)?)-\d+-normal \*/', block)
            if not sub:
                continue
            rng = re.search(r'unicode-range: ([^;]+);', block).group(1)
            f = os.path.join(NM, '@fontsource', pkg, 'files', f'{pkg}-{sub.group(1)}-{w}-normal.woff2')
            data = base64.b64encode(open(f, 'rb').read()).decode()
            faces.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:block;"
                         f"src:url(data:font/woff2;base64,{data}) format('woff2');unicode-range:{rng};}}")

out = os.path.join(HERE, 'marka.js')
with open(out, 'w') as fh:
    fh.write('// Üretildi: python3 video/yup-marka/build.py — elle düzenlemeyin.\n')
    fh.write('// YUP Akademi marka varlıkları: logo sembolü (beyaz, saydam) ve gömülü yazı tipleri (Nunito, Caveat).\n')
    fh.write('window.YUP_LOGO = ' + json.dumps(logo) + ';\n')
    fh.write('(function () {\n  const s = document.createElement("style");\n  s.textContent = ' + json.dumps(''.join(faces)) + ';\n  document.head.appendChild(s);\n})();\n')
    fh.write('window.YUP_FONTS_READY = Promise.all([' + ','.join(
        f'document.fonts.load("{w} 40px {fam}", "ğşıİçöüĞŞÇÖÜ")' for fam, ws in [('Nunito', [600, 700, 800, 900]), ('Caveat', [600, 700])] for w in ws) + ']);\n')
print('marka.js', round(os.path.getsize(out) / 1024), 'KB; logo', sym.size, 'yüz', len(faces))
