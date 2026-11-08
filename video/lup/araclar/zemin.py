#!/usr/bin/env python3
# ChatGPT'nin düz beyaz (ya da dama desenli sahte saydam) zeminle verdiği karakter ve eşya sayfalarını saydamlaştırır.
#   python3 video/lup/araclar/zemin.py <girdi.png> <cikti.webp> [--dama] [--delik]
#   --dama: zemin dama desenli sahte saydamlıksa (büyük nötr adalar da silinir; Lup'un camı gibi beyazımsı iç yüzeyleri
#           de silebileceği için yalnız gerektiğinde kullan).  --delik: figürün içinde kalan saf beyaz boşlukları
#           (kolla gövde arası gibi) da siler; göz akı gibi küçük beyazlar 1500 pikselden küçükse korunur.
#   --doldur: dar beyaz çizgilerin (ıslık, hareket çizgisi) dışarıya bağladığı iç yüzeyleri (Lup'un camı) geri getirir:
#           figür kapatılıp delikleri doldurulur; saf beyaz olmayan iç pikseller ve içlerindeki küçük parlamalar korunur.
# Kenara değen açık, renksiz bölgeler zemin sayılır; dama desenindeki büyük nötr adalar ve figürün çevresinde kalan
# beyaz "çıkartma" kenarı da silinir. Figür içindeki beyazlar (göz akı, eldiven) kenara bağlı olmadığı için korunur.
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd


def saydam(src, dama=False, delik=False, doldur=False):
    im = np.array(Image.open(src).convert('RGB')).astype(int)
    mx, mn, lum = im.max(2), im.min(2), im.mean(2)
    # 1) kenara bağlı açık ve renksiz bölgeler
    acik = (lum > 222) & ((mx - mn) < 20)
    lab, _ = nd.label(acik)
    kenar = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(kenar))
    # 2) dama desenindeki büyük nötr adalar
    notr = (lum >= 234) & ((mx - mn) <= 5)
    lab2, n2 = nd.label(notr)
    if dama and n2:
        boy = nd.sum(notr, lab2, range(1, n2 + 1))
        bg |= np.isin(lab2, np.nonzero(boy > 250)[0] + 1)
    if delik:
        saf = (lum > 247) & ((mx - mn) < 8) & ~bg
        lab4, n4 = nd.label(saf)
        if n4:
            boy4 = nd.sum(saf, lab4, range(1, n4 + 1))
            bg |= np.isin(lab4, np.nonzero(boy4 > 1500)[0] + 1)
    # 3) zemine bağlı biraz daha koyu açıklar (gölgeli kâğıt beyazı)
    acik2 = (lum > 196) & ((mx - mn) < 16)
    lab3, _ = nd.label(acik2 | bg)
    bg = np.isin(lab3, list(set(np.unique(lab3[bg])) - {0}))
    # 4) figürü saran beyaz çıkartma kenarı
    yakin = nd.binary_dilation(bg, iterations=14)
    bg |= yakin & (lum > 196) & ((mx - mn) < 24)
    if doldur:
        ic = nd.binary_fill_holes(nd.binary_closing(~bg, iterations=8)) & bg
        geri = ic & ~((lum > 249) & ((mx - mn) < 5))
        lab5, n5 = nd.label(geri)
        if n5:
            boy5 = nd.sum(geri, lab5, range(1, n5 + 1))
            geri = np.isin(lab5, np.nonzero(boy5 > 3000)[0] + 1)
            # yalnız küçük boşlukları doldur (camdaki parlamalar); büyük kapalı beyazlar (şemsiye sapıyla kol arası) zemin kalır
            kap = nd.binary_closing(geri, iterations=3)
            del_ = nd.binary_fill_holes(kap) & ~kap
            lab6, n6 = nd.label(del_)
            if n6:
                boy6 = nd.sum(del_, lab6, range(1, n6 + 1))
                kap |= np.isin(lab6, np.nonzero(boy6 < 2500)[0] + 1)
            geri = kap
        bg &= ~geri
    bg = ~nd.binary_opening(~bg, iterations=1)
    bg = nd.binary_dilation(bg, iterations=1)
    a = np.where(bg, 0, 255).astype(np.uint8)
    a = np.array(Image.fromarray(a).filter(ImageFilter.GaussianBlur(0.7)))
    return Image.fromarray(np.dstack([im.astype(np.uint8), a]), 'RGBA')


if __name__ == '__main__':
    saydam(sys.argv[1], dama='--dama' in sys.argv, delik='--delik' in sys.argv, doldur='--doldur' in sys.argv).save(sys.argv[2], 'WEBP', quality=92, method=6)
    print(sys.argv[2])
