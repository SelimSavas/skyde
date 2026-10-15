"""Birinci Kapı, 1. kısım ders kitabı: kitaba özel şekiller (açık zemin, baskıya uygun).
Çalıştırma: python3 video/kitap/kapi1-kisim1/sekiller.py
"""
import math
import os
import random

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, FancyBboxPatch, Rectangle, Circle, FancyArrowPatch

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gorseller')
os.makedirs(OUT, exist_ok=True)

NAVY = '#1B2338'
ORANGE = '#E8541A'
AMBER = '#FFA547'
YELLOW = '#FFD27A'
BLUE = '#2E6DB4'
LIGHT = '#7CC8FF'
GRAY = '#6B7280'
GRID = '#D7DBE3'
GREEN = '#2F9E62'

plt.rcParams.update({
    'font.family': 'DejaVu Sans',
    'font.size': 13,
    'axes.edgecolor': GRAY,
    'axes.labelcolor': NAVY,
    'xtick.color': GRAY,
    'ytick.color': GRAY,
    'savefig.dpi': 200,
    'savefig.bbox': 'tight',
    'savefig.pad_inches': 0.15,
})


def save(fig, name):
    fig.savefig(os.path.join(OUT, name), facecolor='white')
    plt.close(fig)
    print('yazıldı', name)


def flame(ax, x, y, s=1.0, z=5):
    outer = [(x - 0.32 * s, y), (x - 0.38 * s, y + 0.45 * s), (x - 0.1 * s, y + 0.95 * s), (x, y + 1.35 * s),
             (x + 0.12 * s, y + 0.9 * s), (x + 0.38 * s, y + 0.5 * s), (x + 0.32 * s, y)]
    inner = [(x - 0.17 * s, y), (x - 0.2 * s, y + 0.35 * s), (x, y + 0.85 * s), (x + 0.2 * s, y + 0.35 * s), (x + 0.17 * s, y)]
    ax.add_patch(Polygon(outer, closed=True, fc=ORANGE, ec='none', zorder=z))
    ax.add_patch(Polygon(inner, closed=True, fc=YELLOW, ec='none', zorder=z + 1))


# 1 · Tepeden tepeye haber zinciri ------------------------------------------------
def haber_zinciri():
    fig, ax = plt.subplots(figsize=(11, 3.6))
    ax.set_xlim(-0.5, 16.6)
    ax.set_ylim(-0.6, 4.2)
    ax.axis('off')
    xs = [0.5, 3.5, 6.5, 9.5, 12.5, 15]
    for i, x in enumerate(xs):
        h = 1.6 + 0.35 * math.sin(i * 1.7)
        ax.add_patch(Polygon([(x - 1.5, 0), (x, h), (x + 1.5, 0)], closed=True, fc='#3B4561', ec='none', zorder=2))
        if i < 4:
            flame(ax, x, h, 0.9, z=5)
        else:
            ax.add_patch(Polygon([(x - 0.25, h), (x, h + 0.25), (x + 0.25, h)], fc='#5c4033', ec='none', zorder=5))
        ax.text(x, -0.35, f'{i + 1}. tepe', ha='center', va='top', fontsize=11, color=NAVY)
    for a, b in zip(xs[:-1], xs[1:]):
        ax.add_patch(FancyArrowPatch((a + 0.45, 3.35), (b - 0.45, 3.35), arrowstyle='-|>', mutation_scale=16, color=GRAY, lw=1.6))
        ax.text((a + b) / 2, 3.55, '20 km', ha='center', fontsize=11, color=GRAY)
    ax.text(13.75, 2.35, 'sıradaki nöbetçi ateşi\ngörünce kendi ateşini yakar', ha='center', fontsize=10, color=ORANGE)
    ax.add_patch(Rectangle((-0.5, -0.06), 17.1, 0.06, fc='#3B4561', ec='none'))
    save(fig, 'haber_zinciri.png')


# 2 · Gürültülü voltaj ve eşik ---------------------------------------------------------
def volt():
    random.seed(7)
    bits = [1, 0, 1, 1, 0, 0, 1, 0, 1, 0]
    n = len(bits)
    pts = 40
    ts, vs = [], []
    drift = 0.0
    for i, b in enumerate(bits):
        for k in range(pts):
            t = i + k / pts
            drift += random.uniform(-0.03, 0.03)
            drift = max(-0.25, min(0.25, drift))
            base = 3.2 if b else 0.45
            prev = bits[i - 1] if i else b
            if k < 4 and prev != b:  # geçiş
                base = (3.2 if prev else 0.45) + ((3.2 if b else 0.45) - (3.2 if prev else 0.45)) * (k + 1) / 5
            v = base + drift + random.gauss(0, 0.13)
            ts.append(t)
            vs.append(v)
    # iki yanıltıcı sıçrama (eşiği geçmeyen)
    vs[5 * pts + 20] += 0.7
    vs[3 * pts + 22] -= 0.75
    for solved in (False, True):
        fig, ax = plt.subplots(figsize=(11, 4.2))
        ax.plot(ts, vs, color=BLUE, lw=1.8)
        ax.axhline(1.65, color=ORANGE, ls='--', lw=1.8)
        ax.text(n + 0.05, 1.65, 'eşik', color=ORANGE, va='center', fontsize=12, fontweight='bold')
        ax.set_xlim(0, n)
        ax.set_ylim(-0.6, 4.2)
        ax.set_yticks([0, 1, 2, 3, 4])
        ax.set_ylabel('volt')
        ax.set_xticks(range(n + 1))
        ax.set_xticklabels([''] * (n + 1))
        for i in range(n + 1):
            ax.axvline(i, color=GRID, lw=1, zorder=0)
        ax.fill_between([0, n], 1.65, 4.2, color='#FFF1E6', zorder=-1)
        ax.fill_between([0, n], -0.6, 1.65, color='#EEF3FA', zorder=-1)
        ax.text(0.08, 3.95, 'VAR (1)', color=ORANGE, fontsize=11, fontweight='bold', va='top')
        ax.text(0.08, -0.45, 'YOK (0)', color=BLUE, fontsize=11, fontweight='bold', va='bottom')
        for i, b in enumerate(bits):
            box = FancyBboxPatch((i + 0.28, -1.55), 0.44, 0.62, boxstyle='round,pad=0.02', fc='white', ec=GRAY, lw=1.2, clip_on=False, transform=ax.transData)
            ax.add_patch(box)
            ax.text(i + 0.5, -1.75, f'{i + 1}.', ha='center', fontsize=9, color=GRAY, clip_on=False)
            if solved:
                ax.text(i + 0.5, -1.24, str(b), ha='center', va='center', fontsize=15, fontweight='bold', color=ORANGE if b else BLUE, clip_on=False)
        ax.text(n / 2, -2.2, 'zaman dilimleri  →', ha='center', fontsize=11, color=GRAY, clip_on=False)
        for s in ('top', 'right'):
            ax.spines[s].set_visible(False)
        save(fig, 'volt_esik_cozum.png' if solved else 'volt_esik.png')


# 3 · İkiye katlama ---------------------------------------------------------------------
def katlama():
    fig, ax = plt.subplots(figsize=(10, 4.2))
    n = list(range(1, 11))
    v = [2 ** k for k in n]
    bars = ax.bar(n, v, color=[ORANGE if k == 8 else AMBER for k in n], width=0.65)
    for k, val in zip(n, v):
        ax.text(k, val + 14, str(val), ha='center', fontsize=11, color=NAVY, fontweight='bold' if k == 8 else 'normal')
    ax.set_xticks(n)
    ax.set_xlabel('lamba (bit) sayısı')
    ax.set_ylabel('farklı durum sayısı')
    ax.set_ylim(0, 1130)
    ax.text(8, 330, 'bayt', ha='center', color=ORANGE, fontsize=11, fontweight='bold')
    for s in ('top', 'right'):
        ax.spines[s].set_visible(False)
    ax.text(1.2, 900, 'her yeni lamba durum sayısını ikiye katlar', fontsize=12, color=GRAY)
    save(fig, 'katlama.png')


# 4 · Satranç tahtası ve pirinç ------------------------------------------------------------
def satranc():
    fig, ax = plt.subplots(figsize=(6.2, 6.2))
    ax.set_xlim(0, 8)
    ax.set_ylim(0, 8)
    ax.set_aspect('equal')
    ax.axis('off')
    for r in range(8):
        for c in range(8):
            ax.add_patch(Rectangle((c, 7 - r), 1, 1, fc='#E9DCC3' if (r + c) % 2 == 0 else '#B9946A', ec='none'))
    labels = {0: '1', 1: '2', 2: '4', 3: '8', 4: '16', 5: '32', 6: '64', 7: '128', 8: '256', 9: '512', 10: '1024'}
    for i, s in labels.items():
        r, c = divmod(i, 8)
        ax.text(c + 0.5, 7 - r + 0.5, s, ha='center', va='center', fontsize=12 if len(s) < 4 else 10, color=NAVY, fontweight='bold')
    ax.text(7.5, 0.5, '?', ha='center', va='center', fontsize=22, color=ORANGE, fontweight='bold')
    save(fig, 'satranc.png')


# 5 · Bit kartları (kesip kullanmak için) ------------------------------------------------------
def bit_kartlari():
    fig, ax = plt.subplots(figsize=(11, 3.2))
    ax.set_xlim(0, 5)
    ax.set_ylim(0, 1.05)
    ax.set_aspect('equal')
    ax.axis('off')
    vals = [16, 8, 4, 2, 1]
    for i, v in enumerate(vals):
        x0 = i + 0.06
        ax.add_patch(FancyBboxPatch((x0, 0.06), 0.88, 0.93, boxstyle='round,pad=0.0,rounding_size=0.06', fc='white', ec=GRAY, lw=1.3, ls='--'))
        cols = {16: 4, 8: 4, 4: 2, 2: 2, 1: 1}[v]
        rows = math.ceil(v / cols)
        sp = 0.17 if v >= 8 else 0.22
        cx = x0 + 0.44
        cy = 0.6
        for k in range(v):
            r, c = divmod(k, cols)
            ax.add_patch(Circle((cx + (c - (cols - 1) / 2) * sp, cy + ((rows - 1) / 2 - r) * sp * 0.95), 0.055, fc=ORANGE, ec='none'))
        ax.text(cx, 0.14, str(v), ha='center', va='center', fontsize=16, color=NAVY, fontweight='bold')
    save(fig, 'bit_kartlari.png')


# 6 · Piksel boyama bulmacası: kamp ateşi --------------------------------------------------------
FLAME = [
    '0000000000000000',
    '0000000010000000',
    '0000000110000000',
    '0000001110000000',
    '0000011121000000',
    '0000111221100000',
    '0001112221110000',
    '0011122322111000',
    '0011223332211000',
    '0011223332211000',
    '0001122322110000',
    '0000112221100000',
    '0004411111440000',
    '0000044444400000',
    '0004440000444000',
    '0000000000000000',
]
PAL = {'0': '#FFFFFF', '1': '#C0392B', '2': '#F28C28', '3': '#FFD54F', '4': '#6D4C41'}


def piksel():
    n = len(FLAME)
    for solved in (False, True):
        fig, ax = plt.subplots(figsize=(6.4, 6.4))
        ax.set_xlim(0, n)
        ax.set_ylim(0, n)
        ax.set_aspect('equal')
        ax.axis('off')
        for r, row in enumerate(FLAME):
            for c, ch in enumerate(row):
                ax.add_patch(Rectangle((c, n - 1 - r), 1, 1, fc=PAL[ch] if solved else 'white', ec='#9AA3B8', lw=0.6))
                if not solved and ch != '0':
                    ax.text(c + 0.5, n - 1 - r + 0.5, ch, ha='center', va='center', fontsize=8.5, color=NAVY)
        save(fig, 'piksel_cozum.png' if solved else 'piksel_bulmaca.png')
    # renk anahtarı
    fig, ax = plt.subplots(figsize=(7.5, 0.9))
    ax.set_xlim(0, 4)
    ax.set_ylim(0, 1)
    ax.axis('off')
    for i, (k, name) in enumerate([('1', 'kırmızı'), ('2', 'turuncu'), ('3', 'sarı'), ('4', 'kahverengi')]):
        ax.add_patch(Rectangle((i + 0.05, 0.25), 0.28, 0.5, fc=PAL[k], ec=GRAY))
        ax.text(i + 0.19, 0.5, k, ha='center', va='center', fontsize=11, color='white' if k in '14' else NAVY, fontweight='bold')
        ax.text(i + 0.38, 0.5, name, va='center', fontsize=10, color=NAVY)
    save(fig, 'piksel_anahtar.png')


# 7 · Ses örnekleme -------------------------------------------------------------------------------
SAMPLES = [128, 186, 222, 214, 168, 108, 62, 46, 70, 120, 176, 210, 200]


def ses():
    import numpy as np
    t = np.linspace(0, 12, 600)
    wave = 128 + 70 * np.sin(2 * math.pi * t / 9.0) + 28 * np.sin(2 * math.pi * t / 3.2 + 0.6)
    fig, ax = plt.subplots(figsize=(10.5, 3.8))
    ax.plot(t, wave, color=BLUE, lw=2.2, label='gerçek ses dalgası')
    ks = np.arange(0, 13)
    sv = 128 + 70 * np.sin(2 * math.pi * ks / 9.0) + 28 * np.sin(2 * math.pi * ks / 3.2 + 0.6)
    ax.vlines(ks, 0, sv, color=AMBER, lw=1.6)
    ax.plot(ks, sv, 'o', color=ORANGE, ms=7, label='ölçüm (örnek)')
    for k, v in zip(ks, sv):
        ax.text(k, v + 9, str(int(round(v))), ha='center', fontsize=9, color=NAVY)
    ax.set_xlim(-0.4, 12.4)
    ax.set_ylim(0, 260)
    ax.set_xlabel('zaman (ölçüm sırası)')
    ax.set_ylabel('basınç değeri')
    ax.legend(loc='lower right', frameon=False, fontsize=10)
    for s in ('top', 'right'):
        ax.spines[s].set_visible(False)
    save(fig, 'ses_ornekleme.png')
    # öğrenci ızgarası ve çözümü
    for solved in (False, True):
        fig, ax = plt.subplots(figsize=(10.5, 4.6))
        ax.set_xlim(-0.5, 12.5)
        ax.set_ylim(0, 256)
        ax.set_xticks(range(13))
        ax.set_yticks(range(0, 257, 32))
        ax.grid(True, color=GRID, lw=0.9)
        ax.set_xlabel('ölçüm sırası')
        ax.set_ylabel('değer (0–255)')
        if solved:
            ax.plot(range(13), SAMPLES, '-', color=BLUE, lw=1.6)
            ax.plot(range(13), SAMPLES, 'o', color=ORANGE, ms=7)
        for s in ('top', 'right'):
            ax.spines[s].set_visible(False)
        save(fig, 'ses_izgara_cozum.png' if solved else 'ses_izgara.png')


# 8 · Renk kodları ---------------------------------------------------------------------------------
HEX = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#FFA500']


def renkler():
    for solved in (False, True):
        fig, ax = plt.subplots(figsize=(10.5, 2.6))
        ax.set_xlim(0, 8)
        ax.set_ylim(0, 1.4)
        ax.axis('off')
        for i, h in enumerate(HEX):
            ax.add_patch(FancyBboxPatch((i + 0.1, 0.38), 0.8, 0.8, boxstyle='round,pad=0,rounding_size=0.08', fc=h if solved else 'white', ec=GRAY, lw=1.3))
            ax.text(i + 0.5, 0.18, h, ha='center', fontsize=11, family='DejaVu Sans Mono', color=NAVY, fontweight='bold')
            ax.text(i + 0.5, 1.26, chr(65 + i), ha='center', fontsize=10, color=GRAY)
        save(fig, 'renkler_cozum.png' if solved else 'renkler.png')


if __name__ == '__main__':
    haber_zinciri()
    volt()
    katlama()
    satranc()
    bit_kartlari()
    piksel()
    ses()
    renkler()
