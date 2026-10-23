"""Soundtrack for reel 05 (frost at 3°C). Usage: python3 audio.py out.wav"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shared'))
from sfx import *  # noqa: E402,F403

DUR = 28.0
setup(DUR, [
    (0.0, [45, 52, 57, 59, 64]),     # Asus — still night
    (4.2, [41, 48, 53, 57, 64]),     # F(add9) — the ground cools
    (11.3, [43, 50, 55, 59, 62]),    # G — 3 signs
    (16.8, [40, 47, 52, 55, 59]),    # Em7 — one night, one season
    (19.8, [48, 55, 59, 62, 64]),    # Cmaj9 — Skyde
    (24.0, [48, 55, 60, 62, 64, 67]),  # Cadd9 — logo
])
END = 24.0
VO = [('vo/vo1.mp3', 0.2), ('vo/vo2.mp3', 4.4), ('vo/vo3.mp3', 11.4), ('vo/vo4.mp3', 16.9), ('vo/vo5.mp3', 19.9)]


def cricket(at, buf):
    for k in range(3):
        t = tt(0.05)
        place(buf, np.sin(2 * np.pi * 4300 * t) * np.sin(np.pi * t / 0.05), at + k * 0.07, db(-34))


def build():
    s = empty()
    air = band_noise(11.0, 100, 600) * np.minimum(1, tt(11.0) / 1.0) * np.clip((11.0 - tt(11.0)) / 1.0, 0, 1)
    place(s, air, 0.0, db(-30))
    for at in np.arange(0.8, 10.5, 1.3):
        cricket(at, s)
    place(s, pop(640, 0.12), 0.85, db(-17))
    place(s, pop(560, 0.12), 5.05, db(-17))
    for k in range(3):
        place(s, tick(1600), 5.4 + k * 0.6, db(-20))
    for k in range(12):
        place(s, bell(mtof(96 + (k % 4) * 2), 0.5, 0.3), 7.0 + k * 0.18, db(-30))
    place(s, whoosh(0.6, False, 3000, 300), 10.8, db(-17))
    for i, t0 in enumerate((11.9, 12.9, 13.9)):
        place(s, whoosh(0.45, False, 4000, 700), t0, db(-16))
        place(s, pop(640 + i * 140, 0.09), t0 + 0.4, db(-16))
    place(s, whoosh(0.5, False, 5000, 600), 16.3, db(-17))
    place(s, thump(0.6, 45), 17.15, db(-12))
    place(s, whoosh(0.9, True, 150, 1800), 19.65, db(-12))
    place(s, thump(0.4, 60), 20.4, db(-10))
    place(s, buzz(0.2), 21.1, db(-17))
    place(s, buzz(0.2), 21.38, db(-17))
    place(s, bell(mtof(88), 1.2, 0.7), 21.16, db(-15))
    place(s, bell(mtof(83), 1.4, 0.7), 21.3, db(-15))
    place(s, whoosh(0.7, True, 300, 4000), 23.45, db(-14))
    place(s, thump(0.6, 50), END + 0.12, db(-11))
    place(s, shimmer(1.2, 72), END + 0.05, db(-14))
    place(s, whoosh(0.4, True, 800, 6000), END + 0.3, db(-22))
    place(s, pop(700, 0.12), END + 1.8, db(-13))
    place(s, pop(1000, 0.1), END + 2.45, db(-18))
    return s


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    mix(sys.argv[1], build(), VO)
