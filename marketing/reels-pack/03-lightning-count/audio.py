"""Soundtrack for reel 03 (count the seconds to the thunder). Usage: python3 audio.py out.wav"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shared'))
from sfx import *  # noqa: E402,F403

DUR = 26.0
setup(DUR, [
    (0.0, [40, 47, 50, 55, 59]),     # Em — the flash
    (7.1, [41, 48, 52, 57, 60]),     # Fmaj7 — the rule
    (11.6, [43, 50, 55, 59, 62]),    # G — safety
    (17.2, [48, 55, 59, 62, 64]),    # Cmaj9 — Skyde
    (21.8, [48, 55, 60, 62, 64, 67]),  # Cadd9 — logo
])
FLASH, COUNT0, STEP, THUNDER, END = 0.5, 1.3, 0.6, 6.8, 21.8
VO = [('vo/vo1.mp3', 0.15), ('vo/vo2.mp3', 7.3), ('vo/vo3.mp3', 11.8), ('vo/vo4.mp3', 17.4), ('vo/vo5.mp3', 22.6)]


def crack(d=0.5):
    t = tt(d)
    x = band_noise(d, 1500, 12000) * np.exp(-t / 0.05) + band_noise(d, 200, 2000) * np.exp(-t / 0.15) * 0.6
    return x / np.abs(x).max()


def build():
    s = empty()
    r = rain(11.2)
    r *= np.minimum(1, tt(11.2) / 0.3) * np.clip((11.2 - tt(11.2)) / 0.8, 0, 1)
    place(s, r, 0.0, db(-25))
    place(s, crack(), FLASH, db(-12))
    for k in range(9):
        place(s, tick(1800), COUNT0 + k * STEP, db(-14))
        place(s, thump(0.15, 140), COUNT0 + k * STEP, db(-20))
    place(s, rumble(3.2), THUNDER, db(-5))
    place(s, thump(0.9, 38), THUNDER, db(-6))
    place(s, pop(700, 0.12), 7.65, db(-15))
    place(s, whoosh(0.5, True, 400, 3000), 8.35, db(-18))
    place(s, sweep_noise(0.6, 800, 3000) * np.sin(np.pi * tt(0.6) / 0.6), 8.9, db(-24))
    place(s, bell(mtof(84), 0.8, 0.5), 9.55, db(-20))
    place(s, whoosh(0.8, True, 300, 4000), 10.8, db(-17))
    for i, t0 in enumerate((13.4, 14.6)):
        place(s, whoosh(0.45, False, 4000, 700), t0, db(-16))
        place(s, pop(700 + i * 160, 0.09), t0 + 0.4, db(-16))
    place(s, whoosh(0.5, False, 5000, 600), 16.9, db(-17))
    place(s, whoosh(0.9, True, 150, 1800), 16.95, db(-12))
    place(s, thump(0.4, 60), 17.7, db(-10))
    place(s, buzz(0.2), 18.5, db(-17))
    place(s, buzz(0.2), 18.78, db(-17))
    place(s, bell(mtof(88), 1.2, 0.7), 18.56, db(-15))
    place(s, bell(mtof(83), 1.4, 0.7), 18.7, db(-15))
    place(s, whoosh(0.7, True, 300, 4000), 21.25, db(-14))
    place(s, thump(0.6, 50), END + 0.12, db(-11))
    place(s, shimmer(1.2, 72), END + 0.05, db(-14))
    place(s, whoosh(0.4, True, 800, 6000), END + 0.3, db(-22))
    place(s, pop(700, 0.12), END + 1.8, db(-13))
    place(s, pop(1000, 0.1), END + 2.45, db(-18))
    return s


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    mix(sys.argv[1], build(), VO)
