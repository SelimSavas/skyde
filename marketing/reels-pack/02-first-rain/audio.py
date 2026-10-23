"""Soundtrack for reel 02 (first rain after a dry spell). Usage: python3 audio.py out.wav"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shared'))
from sfx import *  # noqa: E402,F403

DUR = 28.0
setup(DUR, [
    (0.0, [40, 47, 52, 55, 59]),     # Em7 — dark windshield
    (4.2, [45, 52, 55, 60, 64]),     # Am7 — first rain
    (10.9, [41, 48, 52, 57, 60]),    # Fmaj7 — the data
    (14.8, [43, 50, 55, 59, 62]),    # G — do this
    (19.5, [48, 55, 59, 62, 64]),    # Cmaj9 — Skyde
    (23.8, [48, 55, 60, 62, 64, 67]),  # Cadd9 — logo
])
END = 23.8
WIPES = [1.0, 2.3, 3.6, 7.2, 8.5, 9.8]
VO = [('vo/vo1.mp3', 0.2), ('vo/vo2.mp3', 4.3), ('vo/vo3.mp3', 11.0), ('vo/vo4.mp3', 14.9), ('vo/vo5.mp3', 19.6)]


def wipe():
    d = 0.7
    x = band_noise(d, 300, 2500) * np.sin(np.pi * tt(d) / d) ** 1.5
    place(x, thump(0.12, 120) * 0.4, 0.0)
    return x


def build():
    s = empty()
    r = rain(10.6)
    r *= np.minimum(1, tt(10.6) / 0.4) * np.clip((10.6 - tt(10.6)) / 0.8, 0, 1)
    put(s, r, 0.0, db(-22))
    hum = lowpass(np.sin(2 * np.pi * 55 * tt(10.6)) + 0.4 * band_noise(10.6, 40, 200), 300)
    hum *= np.minimum(1, tt(10.6) / 0.5) * np.clip((10.6 - tt(10.6)) / 0.8, 0, 1)
    put(s, hum / np.abs(hum).max(), 0.0, db(-28))
    for w in WIPES:
        put(s, wipe(), w, db(-20))
    for k in range(18):
        put(s, tick(2400), 4.8 + k * 0.09, db(-24))
    put(s, thump(0.4, 70), 6.6, db(-12))
    put(s, bell(mtof(81), 0.8, 0.5), 6.62, db(-20))
    put(s, shimmer(0.9, 79), 8.0, db(-24))
    put(s, pop(820, 0.1), 8.45, db(-18))
    put(s, whoosh(0.8, True, 300, 4000), 10.5, db(-16))
    put(s, whoosh(0.45, False, 4000, 700), 11.2, db(-16))
    put(s, pop(700, 0.1), 11.6, db(-17))
    put(s, whoosh(0.5, False, 5000, 600), 14.4, db(-17))
    for i, t0 in enumerate((15.3, 16.3, 17.3)):
        put(s, whoosh(0.4, False, 4000, 700), t0, db(-17))
        put(s, pop(700 + i * 160, 0.09), t0 + 0.4, db(-16))
    put(s, whoosh(0.5, False, 5000, 600), 19.0, db(-17))
    put(s, whoosh(0.9, True, 150, 1800), 19.25, db(-12))
    put(s, thump(0.4, 60), 20.0, db(-10))
    put(s, buzz(0.2), 20.8, db(-17))
    put(s, buzz(0.2), 21.08, db(-17))
    put(s, bell(mtof(88), 1.2, 0.7), 20.86, db(-15))
    put(s, bell(mtof(83), 1.4, 0.7), 21.0, db(-15))
    put(s, whoosh(0.7, True, 300, 4000), 23.35, db(-14))
    put(s, thump(0.6, 50), END + 0.12, db(-11))
    put(s, shimmer(1.2, 72), END + 0.05, db(-14))
    put(s, whoosh(0.4, True, 800, 6000), END + 0.3, db(-22))
    put(s, pop(700, 0.12), END + 1.8, db(-13))
    put(s, pop(1000, 0.1), END + 2.45, db(-18))
    return s


WARPED_VO = load_warp(os.path.dirname(os.path.abspath(__file__)))


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    mix(sys.argv[1], build(), WARPED_VO or VO)
