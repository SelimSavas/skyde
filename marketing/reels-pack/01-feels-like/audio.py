"""Soundtrack for reel 01 (feels like). Usage: python3 audio.py out.wav"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shared'))
from sfx import *  # noqa: E402,F403

DUR = 25.0
setup(DUR, [
    (0.0, [45, 52, 55, 59, 60]),     # Am(add9) — why does it feel colder?
    (4.0, [41, 48, 52, 57, 60]),     # Fmaj7 — two things
    (11.2, [48, 55, 59, 62, 64]),    # Cmaj9 — the rule
    (15.9, [43, 50, 55, 59, 62]),    # G — Skyde
    (21.0, [48, 55, 60, 62, 64, 67]),  # Cadd9 — logo
])
END = 21.0
VO = [('vo/vo1.mp3', 0.2), ('vo/vo2.mp3', 4.1), ('vo/vo3.mp3', 11.2), ('vo/vo4.mp3', 15.9), ('vo/vo5.mp3', 21.2)]


def build():
    s = empty()
    place(s, whoosh(0.6, True, 300, 3000), 0.0, db(-18))
    place(s, thump(0.4, 80), 0.45, db(-12))
    gust = sweep_noise(2.6, 200, 900) * np.sin(np.pi * tt(2.6) / 2.6) ** 1.4
    place(s, gust, 1.3, db(-15))
    place(s, thump(0.5, 55), 1.55, db(-9))
    place(s, pop(620, 0.12), 1.6, db(-14))
    place(s, whoosh(0.5, True, 600, 6000), 3.7, db(-17))
    for t0 in (4.8, 7.6):
        place(s, whoosh(0.45, False, 4000, 700), t0, db(-16))
        place(s, pop(760, 0.09), t0 + 0.4, db(-17))
    place(s, sweep_noise(2.4, 250, 1100) * np.sin(np.pi * tt(2.4) / 2.4) ** 2, 4.8, db(-22))
    place(s, whoosh(0.5, False, 5000, 600), 10.6, db(-17))
    place(s, whoosh(0.5, True, 400, 3000), 11.35, db(-17))
    place(s, sweep_noise(0.4, 2000, 6000) * np.sin(np.pi * tt(0.4) / 0.4), 12.6, db(-22))
    place(s, bell(mtof(84), 1.0, 0.6), 13.2, db(-19))
    place(s, whoosh(0.5, False, 4000, 500), 15.3, db(-18))
    place(s, whoosh(0.9, True, 150, 1800), 15.65, db(-12))
    place(s, thump(0.4, 60), 16.4, db(-10))
    place(s, bell(mtof(84), 1.2, 0.8), 17.4, db(-17))
    place(s, bell(mtof(91), 1.0, 0.6), 17.5, db(-20))
    place(s, whoosh(0.7, True, 300, 4000), 20.55, db(-14))
    place(s, thump(0.6, 50), END + 0.12, db(-11))
    place(s, shimmer(1.2, 72), END + 0.05, db(-14))
    place(s, whoosh(0.4, True, 800, 6000), END + 0.3, db(-22))
    place(s, pop(700, 0.12), END + 1.8, db(-13))
    place(s, pop(1000, 0.1), END + 2.45, db(-18))
    return s


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    mix(sys.argv[1], build(), VO)
