"""Soundtrack for reel 04 (mom, heat and the one button). Usage: python3 audio.py out.wav"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shared'))
from sfx import *  # noqa: E402,F403

DUR = 26.0
setup(DUR, [
    (0.0, [48, 55, 59, 62, 64]),     # Cmaj9 — warm, personal
    (5.4, [45, 52, 55, 60, 64]),     # Am7 — numbers
    (10.5, [41, 48, 52, 57, 60]),    # Fmaj7 — one button
    (17.4, [43, 50, 55, 59, 62]),    # G — stay safe
    (22.0, [48, 55, 60, 62, 64, 67]),  # Cadd9 — logo
])
BUB, TAP, END = [0.6, 1.7, 2.8, 3.9], 12.0, 22.0
VO = [('vo/vo1.mp3', 0.2), ('vo/vo2.mp3', 5.5), ('vo/vo3.mp3', 10.6), ('vo/vo4.mp3', 17.5), ('vo/vo5.mp3', 22.6)]


def blip(freq):
    t = tt(0.14)
    return (np.sin(2 * np.pi * freq * t) + 0.5 * np.sin(2 * np.pi * freq * 1.5 * t)) * np.exp(-t / 0.04) * np.minimum(1, t / 0.003)


def build():
    s = empty()
    place(s, whoosh(0.6, True, 200, 2500), 0.0, db(-18))
    for i, b in enumerate(BUB):
        place(s, blip(1200 + i * 90), b, db(-13))
        place(s, buzz(0.12), b, db(-24))
    place(s, whoosh(0.6, False, 3000, 300), 5.0, db(-15))
    for i in range(8):
        place(s, pop(rng.uniform(480, 760)), 5.6 + i * 0.14 + 0.05, db(-14))
    place(s, whoosh(0.8, True, 400, 6000), 9.4, db(-14))
    place(s, thump(0.3, 90), 10.1, db(-13))
    place(s, whoosh(0.9, True, 150, 1800), 10.35, db(-12))
    place(s, thump(0.4, 60), 11.1, db(-10))
    place(s, click(), TAP, db(-12))
    place(s, shimmer(0.7, 84), TAP + 0.15, db(-22))
    place(s, pop(900, 0.12), TAP + 0.4, db(-17))
    place(s, whoosh(0.5, False, 4000, 500), 16.7, db(-17))
    for i, t0 in enumerate((17.8, 19.0)):
        place(s, whoosh(0.45, False, 4000, 700), t0, db(-16))
        place(s, pop(700 + i * 160, 0.09), t0 + 0.4, db(-16))
    place(s, whoosh(0.7, True, 300, 4000), 21.5, db(-14))
    place(s, thump(0.6, 50), END + 0.12, db(-11))
    place(s, shimmer(1.2, 72), END + 0.05, db(-14))
    place(s, whoosh(0.4, True, 800, 6000), END + 0.3, db(-22))
    place(s, pop(700, 0.12), END + 1.8, db(-13))
    place(s, pop(1000, 0.1), END + 2.45, db(-18))
    return s


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    mix(sys.argv[1], build(), VO)
