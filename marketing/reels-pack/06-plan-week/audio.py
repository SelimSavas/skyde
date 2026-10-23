"""Soundtrack for reel 06 (plan your week in 15 seconds). Usage: python3 audio.py out.wav"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shared'))
from sfx import *  # noqa: E402,F403

DUR = 25.0
setup(DUR, [
    (0.0, [48, 55, 59, 62, 64]),     # Cmaj9 — let's go
    (3.9, [45, 52, 55, 60, 64]),     # Am7 — picks
    (7.6, [41, 48, 52, 57, 60]),     # Fmaj7 — days + time
    (11.0, [43, 50, 55, 59, 62]),    # G — every plan
    (15.6, [40, 47, 52, 55, 59]),    # Em7 — Thursday rain
    (20.6, [48, 55, 60, 62, 64, 67]),  # Cadd9 — logo
])
T0, SAVE, NOTIF, END = 1.8, 9.6, 16.4, 20.6
PICK = [3.0, 3.55, 4.1, 4.65, 5.2]
DAYT = [6.8, 7.1, 7.4, 7.7, 8.0]
VO = [('vo/vo1.mp3', 0.2), ('vo/vo2.mp3', 4.0), ('vo/vo3.mp3', 7.7), ('vo/vo4.mp3', 11.1), ('vo/vo5.mp3', 15.7)]


def build():
    s = empty()
    place(s, whoosh(0.9, True, 150, 1800), 0.15, db(-13))
    place(s, thump(0.4, 60), 0.85, db(-11))
    place(s, pop(900, 0.1), 1.45, db(-16))
    k = 0
    while T0 + k * 0.5 < SAVE:  # stopwatch ticking
        place(s, tick(2200 if k % 2 else 2700), T0 + k * 0.5, db(-24))
        k += 1
    place(s, click(), 1.6, db(-14))
    place(s, click(), 2.1, db(-14))
    place(s, whoosh(0.5, False, 4000, 500), 2.25, db(-15))
    for i, p in enumerate(PICK):
        place(s, click(), p, db(-14))
        place(s, pop(700 + i * 110, 0.08), p + 0.1, db(-14))
    place(s, click(), 5.9, db(-14))
    place(s, whoosh(0.45, False, 5000, 800), 5.95, db(-16))
    for i, d in enumerate(DAYT):
        place(s, pop(880 + i * 90, 0.07), d + 0.05, db(-15))
    for k2 in range(4):
        place(s, tick(2600), 8.45 + k2 * 0.14, db(-20))
    place(s, click(), SAVE, db(-12))
    for i, m in enumerate([76, 79, 84]):
        place(s, bell(mtof(m), 1.2), SAVE + 0.1 + i * 0.08, db(-17))
    place(s, whoosh(0.5, False, 4000, 600), 10.0, db(-16))
    for i in range(6):
        place(s, pop(600 + i * 70, 0.07), 10.45 + i * 0.12, db(-21))
    place(s, bell(mtof(81), 0.8, 0.5), 12.65, db(-20))
    place(s, buzz(0.2), NOTIF, db(-17))
    place(s, buzz(0.2), NOTIF + 0.28, db(-17))
    place(s, bell(mtof(88), 1.2, 0.7), NOTIF + 0.06, db(-15))
    place(s, bell(mtof(83), 1.4, 0.7), NOTIF + 0.2, db(-15))
    place(s, whoosh(0.7, True, 300, 4000), 20.05, db(-14))
    place(s, thump(0.6, 50), END + 0.12, db(-11))
    place(s, shimmer(1.2, 72), END + 0.05, db(-14))
    place(s, whoosh(0.4, True, 800, 6000), END + 0.3, db(-22))
    place(s, pop(700, 0.12), END + 1.8, db(-13))
    place(s, pop(1000, 0.1), END + 2.45, db(-18))
    return s


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    mix(sys.argv[1], build(), VO)
