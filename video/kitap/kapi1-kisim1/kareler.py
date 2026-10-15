"""Birinci Kapı, 1. kısım ders kitabı: videodan kareler (render.mjs ile döker, içeriğe göre kırpar).
Çalıştırma (depo kökünden): python3 video/kitap/kapi1-kisim1/kareler.py
"""
import glob
import os
import subprocess

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.normpath(os.path.join(HERE, '..', '..'))
DST = os.path.join(HERE, 'gorseller')

# video zamanı (sn) → dosya adı; tam kare olanlar kırpılmaz
KARE = {
    '8.08': 'video_kapak', '17.48': 'video_ates', '39.81': 'video_oldu', '68.31': 'video_yagmur', '128.23': 'video_esik',
    '177.75': 'video_uc_lamba', '201.35': 'video_katlama_tablo', '228.46': 'video_bayt', '251.29': 'video_sozluk',
    '306.32': 'video_merhaba', '323.98': 'video_ascii', '357.10': 'video_bozuk_harf', '381.13': 'video_unicode',
    '436.04': 'video_onaltilik', '462.89': 'video_renk', '489.20': 'video_piksel', '502.85': 'video_ses', '547.19': 'video_izler',
}
TAM = {'video_kapak', 'video_ates', 'video_oldu', 'video_yagmur', 'video_izler'}

subprocess.run(['node', os.path.join(VIDEO, 'render.mjs'), 'ch01-var-ve-yok', '--frames', ','.join(KARE)], check=True, cwd=os.path.dirname(VIDEO))
for t, name in KARE.items():
    src = os.path.join(VIDEO, 'out', 'preview', f'ch01-var-ve-yok-{float(t):.2f}.png')
    im = Image.open(src).convert('RGB')
    if name not in TAM:
        a = np.asarray(im).astype(int)
        mask = (a.mean(axis=2) > 75) | ((a.max(axis=2) - a.min(axis=2)) > 90)
        mask[:150, :] = False  # sahne başlığını alma
        ys, xs = np.where(mask)
        m = 44
        im = im.crop((max(0, xs.min() - m), max(140, ys.min() - m), min(1920, xs.max() + m), min(1080, ys.max() + m)))
    if im.width > 1600:
        im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
    im.save(os.path.join(DST, f'{name}.jpg'), quality=88, optimize=True)
    print('yazıldı', name)
