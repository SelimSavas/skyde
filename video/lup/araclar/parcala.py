#!/usr/bin/env python3
# Lup görsel sayfalarını (video/lup/gorseller/*.webp) parçalara ayırır ve tarayıcıya gömülü JS olarak yazar.
#   python3 video/lup/araclar/parcala.py                      → video/yup-marka/lup-gorsel.js (window.LUP_GORSEL)
#   python3 video/lup/araclar/parcala.py --bolum kisa-havaifisek → video/kisa-havaifisek/assets.js (window.ASSETS)
# Her parça: { src: data:image/webp, w, h } (+ gövde ve halkada mercek merkezi/yarıçapı).
# Sayfa düzeni değişirse (yeni ChatGPT görseli) SIRA listelerini güncelle; sıra okuma sırasıdır (satır satır, soldan sağa).
import base64, io, json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # video/
G = os.path.join(R, 'lup', 'gorseller')

def load(name):
    return Image.open(os.path.join(G, name + '.webp')).convert('RGBA')

def comps(im, dil=6, minarea=1500):
    # bileşenler: (x0, y0, x1, y1, maske); maske komşu parçaların taşan kenarlarını siler
    a = np.array(im)[:, :, 3] > 40
    lab, n = nd.label(nd.binary_dilation(a, iterations=dil) if dil else a)
    out = []
    for i, sl in enumerate(nd.find_objects(lab)):
        ys, xs = sl
        if (lab[sl] == i + 1).sum() < minarea:
            continue
        out.append((xs.start, ys.start, xs.stop, ys.stop, lab[sl] == i + 1))
    return out

def rows(boxes, tol=120):
    # okuma sırası: önce satır (merkez y), sonra x
    boxes = sorted(boxes, key=lambda b: (b[1] + b[3]) / 2)
    out, cur = [], []
    for b in boxes:
        if cur and (b[1] + b[3]) / 2 - (cur[0][1] + cur[0][3]) / 2 > tol:
            out += sorted(cur, key=lambda b: b[0]); cur = []
        cur.append(b)
    return out + sorted(cur, key=lambda b: b[0])

def tight(im, box, pad=6):
    c = im.crop(box[:4])
    if len(box) > 4:
        al = np.array(c.getchannel('A'))
        al[~box[4]] = 0
        c.putalpha(Image.fromarray(al))
    bb = c.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
    x0, y0, x1, y1 = bb
    return c.crop((max(0, x0 - pad), max(0, y0 - pad), min(c.width, x1 + pad), min(c.height, y1 + pad)))

def columns(im, n):
    # yan yana n poz: en büyük n bileşenin arasından kes, her sütunu (efekt çizgileriyle) sıkıştır
    big = sorted(comps(im, dil=4, minarea=20000), key=lambda b: -(b[2] - b[0]) * (b[3] - b[1]))[:n]
    big.sort(key=lambda b: b[0])
    cuts = [0] + [(big[i][2] + big[i + 1][0]) // 2 for i in range(n - 1)] + [im.width]
    return [tight(im, (cuts[i], 0, cuts[i + 1], im.height)) for i in range(n)]

def enc(img, scale=1.0, q=90):
    if scale != 1.0:
        img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    b = io.BytesIO()
    img.save(b, 'WEBP', quality=q, method=6)
    return {'src': 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode(), 'w': img.width, 'h': img.height}

def hole(im):
    a = np.array(im)[:, :, 3] > 40
    h = nd.binary_fill_holes(a) & ~a
    lab, n = nd.label(h)
    k = np.argmax(nd.sum(h, lab, range(1, n + 1))) + 1
    ys, xs = np.nonzero(lab == k)
    return float(xs.mean()), float(ys.mean()), float(np.sqrt(len(xs) / np.pi))

def ortak():
    P = {}
    # gövde (camsız, yüzsüz): mercek deliğinin merkezi ve yarıçapı ölçeklenmiş olarak saklanır
    g = load('lup-2a-govde')
    g = g.crop(g.getchannel('A').getbbox())
    s = 0.72
    cx, cy, r = hole(g)
    P['govde'] = {**enc(g, s), 'cx': cx * s, 'cy': cy * s, 'r': r * s}
    # göz: akı ve irisi ayrı (göz kapakları kodla çizilir)
    goz = load('lup-2b-goz')
    b = rows(comps(goz))
    P['goz_ak'] = enc(tight(goz, b[0]))
    P['goz_iris'] = enc(tight(goz, b[1]))
    # kaşlar
    KAS = ['notr', 'kalk', 'cokkalk', 'kizgin', 'dertli', 'supheli', 'odak', 'mutlu']
    k = load('lup-2c-kas')
    for name, box in zip(KAS, rows(comps(k))):
        P['kas_' + name] = enc(tight(k, box))
    # ağızlar (konuşma)
    AGIZ = ['dinlen', 'mbp', 'a', 'e', 'i', 'o', 'u', 'fv', 'l', 'gulus', 'asik', 'dalga', 'hayret']
    m = load('lup-2d-agiz')
    for name, box in zip(AGIZ, rows(comps(m), tol=110)):
        P['agiz_' + name] = enc(tight(m, box))
    # eller (sallama çizgileri küçük bileşen olarak elenir)
    EL = ['acik', 'isaret', 'bas', 'yumruk', 'salla', 'bir', 'iki', 'uc', 'kalem', 'damga', 'cene', 'tamam']
    e = load('lup-2e-el')
    for name, box in zip(EL, rows(comps(e, minarea=15000))):
        P['el_' + name] = enc(tight(e, box))
    # mercek halkası (geçiş ve giriş)
    h = load('lup-6a-mercek-halka')
    cx, cy, r = hole(h)
    s = 0.8
    P['halka'] = {**enc(h, s), 'cx': cx * s, 'cy': cy * s, 'r': r * s}
    # parıltılar: büyük yıldız ve uzun cam yansıması
    p = load('lup-6d-parilti')
    pb = sorted(comps(p, dil=30), key=lambda b: -(b[2] - b[0]) * (b[3] - b[1]))
    P['parilti'] = enc(tight(p, pb[0]), 0.5)
    # Lup'un masası (Mercek Açılışı'nda merceğin dışı)
    P['masa'] = enc(load('lup-7a-masa').convert('RGB'), 0.75, q=84)
    # aksiyon pozları: kâğıt uçak (kapanış)
    P['poz_ucak'] = enc(columns(load('lup-4c-aksiyon'), 4)[2], 0.8)
    return P

def havaifisek():
    P = {}
    es = load('lup-esya-havaifisek')
    bx = comps(es, dil=1, minarea=2000)
    bx.sort(key=lambda b: (b[1] > 580, b[0]))
    names = ['bek', 'tel', 'kavanoz1', 'kavanoz2', 'kavanoz3', 'kavanoz4', 'maytap', 'termometre', 'gozluk']
    for name, box in zip(names, bx):
        P[name] = enc(tight(es, box))
    for name, img in zip(['poz_kulak', 'poz_hayran', 'poz_bilim', 'poz_maytap'], columns(load('lup-4e-havaifisek'), 4)):
        P[name] = enc(img, 0.8)
    P['gece'] = enc(load('lup-7e-bayram-gecesi').convert('RGB'), 1.0, q=88)
    return P

if __name__ == '__main__':
    if '--bolum' in sys.argv:
        b = sys.argv[sys.argv.index('--bolum') + 1]
        P = {'kisa-havaifisek': havaifisek}[b]()
        out = os.path.join(R, b, 'assets.js')
        head = '/* %s görselleri: video/lup/araclar/parcala.py --bolum %s üretir (kaynak video/lup/gorseller). Elle düzenlemeyin. */\nwindow.ASSETS = ' % (b, b)
    else:
        P = ortak()
        out = os.path.join(R, 'yup-marka', 'lup-gorsel.js')
        head = '/* Lup parçaları: video/lup/araclar/parcala.py üretir (kaynak video/lup/gorseller). Elle düzenlemeyin. */\nwindow.LUP_GORSEL = '
    with open(out, 'w') as f:
        f.write(head + json.dumps(P, separators=(',', ':')) + ';\n')
    print(out, len(P), 'parça', round(os.path.getsize(out) / 1e6, 2), 'MB')
    for k, v in P.items():
        print('  %-14s %4d×%-4d' % (k, v['w'], v['h']), {kk: round(vv, 1) for kk, vv in v.items() if kk in ('cx', 'cy', 'r')} or '')
