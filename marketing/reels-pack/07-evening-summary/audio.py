"""Soundtrack for reel 07 (evening summary at 8 p.m.). Usage: python3 audio.py out.wav"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shared'))
from sfx import *  # noqa: E402,F403

DUR = 19.0
setup(DUR, [
    (0.0, [41, 48, 52, 57, 64]),     # Fmaj9 — soft night
    (3.4, [48, 55, 59, 62, 64]),     # Cmaj9 — the summary
    (9.0, [45, 52, 55, 59, 64]),     # Am9 — every night
    (12.8, [41, 48, 52, 57, 60]),    # Fmaj7 — sleep well
    (15.0, [48, 55, 60, 62, 64, 67]),  # Cadd9 — logo
])
FLIP, NOTIF, LAMP_OFF, END = 2.8, 3.1, 12.6, 15.0
VO = [('vo/vo1.mp3', 0.2), ('vo/vo2.mp3', 3.6), ('vo/vo3.mp3', 9.1), ('vo/vo4.mp3', 12.9), ('vo/vo5.mp3', 15.3)]


def clock_tick():
    t = tt(0.03)
    return np.sin(2 * np.pi * 3800 * t) * np.exp(-t / 0.004) + band_noise(0.03, 2000, 6000) * np.exp(-t / 0.003) * 0.3


def build():
    s = empty()
    room = band_noise(DUR, 80, 400) * 0.6 * np.minimum(1, tt(DUR) / 1.5) * np.clip((DUR - tt(DUR)) / 1.5, 0, 1)
    put(s, room, 0.0, db(-34))
    for k in range(int(FLIP)):
        put(s, clock_tick(), 0.4 + k, db(-22))
    put(s, clock_tick(), FLIP, db(-16))
    put(s, buzz(0.15), NOTIF, db(-24))
    put(s, bell(mtof(84), 2.0, 0.5), NOTIF + 0.05, db(-15))
    put(s, bell(mtof(79), 2.2, 0.5), NOTIF + 0.25, db(-17))
    put(s, shimmer(0.8, 84), 5.0, db(-26))
    put(s, click(0.04), LAMP_OFF, db(-14))
    put(s, thump(0.3, 70), LAMP_OFF, db(-20))
    put(s, whoosh(0.7, True, 300, 3000), 14.15, db(-18))
    put(s, thump(0.6, 50), END + 0.12, db(-14))
    put(s, shimmer(1.2, 72), END + 0.05, db(-17))
    put(s, pop(700, 0.12), END + 1.8, db(-16))
    put(s, pop(1000, 0.1), END + 2.45, db(-20))
    return s


WARPED_VO = load_warp(os.path.dirname(os.path.abspath(__file__)))


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    mix(sys.argv[1], build(), WARPED_VO or VO, music_db=-18)
