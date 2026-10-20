"""Builds the reel's soundtrack: synthesized music bed + animation SFX + voiceover.

Usage: python3 audio.py out.wav
Timings mirror the animation in promo.html (seconds).
"""
import os
import subprocess
import sys
import wave

import numpy as np

SR = 48000
DUR = 31.5
N = int(SR * DUR)
rng = np.random.default_rng(7)


# ---------------------------------------------------------------- helpers
def tt(d):
    return np.arange(int(SR * d)) / SR


def band_noise(d, lo, hi):
    n = int(SR * d)
    spec = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    spec *= ((f >= lo) & (f <= hi)) * 1.0
    x = np.fft.irfft(spec, n)
    return x / (np.abs(x).max() + 1e-9)


def lowpass(x, cutoff):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    spec *= 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(spec, len(x))


def sweep_noise(d, f0, f1, width=1.2):
    """Noise whose band centre glides from f0 to f1 (STFT overlap-add)."""
    n = int(SR * d)
    src = rng.standard_normal(n + 2048)
    out = np.zeros(n + 2048)
    win = np.hanning(2048)
    for i, s in enumerate(range(0, n, 512)):
        k = s / max(1, n - 1)
        fc = f0 * (f1 / f0) ** k
        seg = src[s:s + 2048] * win
        spec = np.fft.rfft(seg)
        f = np.fft.rfftfreq(2048, 1 / SR)
        spec *= np.exp(-0.5 * (np.log2((f + 1) / fc) / width) ** 2)
        out[s:s + 2048] += np.fft.irfft(spec, 2048) * win
    out = out[:n]
    return out / (np.abs(out).max() + 1e-9)


def env_ad(d, a, shape=2.0):
    t = tt(d)
    e = np.minimum(1, t / max(a, 1e-4)) * np.clip(1 - (t - a) / max(d - a, 1e-4), 0, 1) ** shape
    return e


def place(buf, x, at, gain=1.0):
    i = int(at * SR)
    j = min(len(buf), i + len(x))
    if j > i:
        buf[i:j] += x[: j - i] * gain


def db(v):
    return 10 ** (v / 20)


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------------------------------------------------------------- SFX
def whoosh(d, up=True, f0=300, f1=4000):
    a, b = (f0, f1) if up else (f1, f0)
    t = tt(d)
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** (1.5 if up else 1.0)
    if up:
        e *= (t / d) ** 0.6
    return sweep_noise(d, a, b) * e


def pop(freq, d=0.12):
    t = tt(d)
    ph = 2 * np.pi * np.cumsum(freq * (1 + 1.6 * np.exp(-t / 0.012))) / SR
    return np.sin(ph) * np.exp(-t / 0.035) * np.minimum(1, t / 0.002)


def click(d=0.05):
    t = tt(d)
    x = band_noise(d, 2500, 9000) * np.exp(-t / 0.004) * 0.6
    x += np.sin(2 * np.pi * 1800 * t) * np.exp(-t / 0.008) * 0.5
    return x


def tick(freq=3200):
    t = tt(0.025)
    return np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.004)


def bell(freq, d=1.6, bright=1.0):
    t = tt(d)
    x = np.zeros_like(t)
    for k, (r, a, dec) in enumerate([(1, 1, 0.9), (2.0, .45 * bright, .5), (3.01, .22 * bright, .3), (4.2, .12 * bright, .18), (5.4, .06 * bright, .12)]):
        x += a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t / dec)
    return x * np.minimum(1, t / 0.003)


def thump(d=0.35, f=70):
    t = tt(d)
    ph = 2 * np.pi * np.cumsum(f * (1 + 1.2 * np.exp(-t / 0.03))) / SR
    return np.sin(ph) * np.exp(-t / 0.09) * np.minimum(1, t / 0.003)


def buzz(d):
    t = tt(d)
    x = np.sign(np.sin(2 * np.pi * 172 * t)) * 0.5 + np.sin(2 * np.pi * 172 * t)
    x = lowpass(x, 900)
    e = np.minimum(1, t / 0.01) * np.minimum(1, (d - t) / 0.02)
    return x / np.abs(x).max() * e


def shimmer(d=1.4, base=72):
    out = np.zeros(int(SR * d))
    notes = [base, base + 4, base + 7, base + 11, base + 12, base + 16, base + 19, base + 24]
    for i, m in enumerate(notes):
        place(out, bell(mtof(m), 0.9, 0.6) * 0.5, i * 0.06)
    return out


def rain(d):
    x = band_noise(d, 900, 9000) * 0.35 + band_noise(d, 200, 900) * 0.2
    n = int(SR * d)
    drops = np.zeros(n)
    for _ in range(int(d * 35)):
        place(drops, tick(rng.uniform(2500, 6000)) * rng.uniform(.1, .35), rng.uniform(0, d - .05))
    return x + drops


def rumble(d=2.5):
    t = tt(d)
    x = lowpass(rng.standard_normal(len(t)), 120)
    x /= np.abs(x).max()
    return x * np.sin(np.pi * t / d) ** 2


# ---------------------------------------------------------------- music bed
CHORDS = [  # (start, midi notes)
    (0.0, [45, 52, 55, 59, 60]),    # Am(add9) — what does 30% mean?
    (4.0, [41, 48, 52, 57, 60]),    # Fmaj7 — quiz
    (13.5, [48, 55, 59, 62, 64]),   # Cmaj9 — reveal
    (18.8, [43, 50, 55, 59, 62]),   # G — skip the math
    (25.4, [48, 55, 60, 62, 64, 67]),  # Cadd9 — logo
]


def pad_note(freq, d):
    t = tt(d)
    x = np.zeros_like(t)
    for det in (-0.004, 0.004):
        f = freq * (1 + det)
        for k in range(1, 10):
            x += np.sin(2 * np.pi * f * k * t + k) / k * np.exp(-k / 2.5)
    a, r = 0.9, 1.2
    e = np.minimum(1, t / a) * np.clip((d - t) / r, 0, 1)
    return x * e


def pluck(freq, d=0.9):
    t = tt(d)
    x = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-t / .12)
    return x * np.exp(-t / 0.28) * np.minimum(1, t / 0.004)


def music():
    out = np.zeros(N)
    bounds = [c[0] for c in CHORDS] + [DUR]
    for (start, notes), end in zip(CHORDS, bounds[1:]):
        d = end - start + 1.0
        for m in notes:
            place(out, pad_note(mtof(m), min(d, DUR - start)) * 0.09, start)
    # gentle arpeggio
    pattern = [0, 2, 1, 3, 2, 4, 3, 2]
    step, i = 0.3, 0
    t0 = 0.9
    while t0 < DUR - 1.5:
        notes = [n for s, n in CHORDS if s <= t0 + 1e-6][-1]
        m = notes[1:][pattern[i % len(pattern)] % (len(notes) - 1)] + 12
        vel = 0.10 if t0 > 17.5 else 0.065
        place(out, pluck(mtof(m)) * vel, t0)
        t0 += step
        i += 1
    out = lowpass(out, 5000)
    t = np.arange(N) / SR
    out *= np.minimum(1, t / 1.0) * np.clip((DUR - t) / 1.4, 0, 1)
    return out


# ---------------------------------------------------------------- timeline
def smooth(x, k):
    c = np.cumsum(np.concatenate([np.zeros(1), x]))
    y = (c[k:] - c[:-k]) / k
    return np.pad(y, (k // 2, len(x) - len(y) - k // 2), mode='edge')


def ease_io(x):
    x = np.clip(x, 0, 1)
    return np.where(x < .5, 4 * x ** 3, 1 - (-2 * x + 2) ** 3 / 2)




def beep(freq, d=0.13):
    t = tt(d)
    return np.sin(2 * np.pi * freq * t) * np.minimum(1, t / 0.004) * np.clip((d - t) / 0.03, 0, 1)


def buzzer(d=0.28):
    t = tt(d)
    x = np.sign(np.sin(2 * np.pi * 150 * t)) * 0.6 + np.sin(2 * np.pi * 225 * t) * 0.4
    return lowpass(x, 1400) * np.minimum(1, t / 0.005) * np.clip((d - t) / 0.05, 0, 1)


# timeline (matches promo.html)
Q_IN, Q_HL, CMT, CD, REVEAL, Q_OUT = 4.1, [4.9, 6.9, 8.9], 10.4, [11.7, 12.3, 12.9], 13.5, 14.6
EQ, EQ_OUT = [15.0, 15.8, 16.1, 16.9, 17.2], 18.4
PHONE_IN, ANSWER, NOTIF, EXIT, END = 18.8, 21.6, 23.3, 25.0, 25.4


def sfx():
    s = np.zeros(N)
    # hook: giant 30% in the rain
    place(s, whoosh(0.5, True, 300, 4000), 0.0, db(-16))
    place(s, thump(0.6, 50), 0.38, db(-9))
    place(s, pop(620, 0.14), 0.62, db(-16))
    r = rain(4.3)
    r *= np.minimum(1, tt(4.3) / 0.5) * np.clip((4.3 - tt(4.3)) / 0.7, 0, 1)
    place(s, r, 0.2, db(-25))
    place(s, rumble(2.4), 0.6, db(-20))
    place(s, whoosh(0.6, True, 600, 7000), 3.8, db(-16))
    # quiz
    for i in range(3):
        place(s, whoosh(0.4, False, 4000, 700), Q_IN + i * 0.22, db(-17))
        place(s, pop(700 + i * 120, 0.08), Q_IN + 0.4 + i * 0.22, db(-20))
        place(s, tick(3000), Q_HL[i] - 0.1, db(-22))
    place(s, pop(900, 0.12), CMT + 0.05, db(-16))
    for i, t0 in enumerate(CD):
        place(s, beep(880), t0, db(-15))
    place(s, beep(1320, 0.2), REVEAL - 0.02, db(-17))
    place(s, buzzer(), REVEAL + 0.02, db(-17))
    place(s, buzzer(), REVEAL + 0.2, db(-17))
    for i, m in enumerate([76, 79, 84]):
        place(s, bell(mtof(m), 1.2), REVEAL + 0.38 + i * 0.07, db(-16))
    place(s, whoosh(0.5, False, 5000, 600), Q_OUT, db(-17))
    # equation
    for i, t0 in enumerate(EQ):
        place(s, pop(600 + i * 110, 0.1), t0 + 0.15, db(-15))
    place(s, thump(0.5, 60), EQ[4] + 0.2, db(-10))
    place(s, shimmer(0.8, 79), EQ[4] + 0.2, db(-20))
    place(s, whoosh(0.6, False, 3000, 300), EQ_OUT, db(-15))
    # Skyde
    place(s, whoosh(0.9, True, 150, 1800), PHONE_IN - 0.05, db(-12))
    place(s, thump(0.4, 60), PHONE_IN + 0.7, db(-10))
    r = rain(6.0)
    r *= np.minimum(1, tt(6.0) / 0.8) * np.clip((6.0 - tt(6.0)) / 0.8, 0, 1)
    place(s, r, PHONE_IN + 0.2, db(-29))
    place(s, bell(mtof(84), 1.2, 0.8), ANSWER - 0.05, db(-17))
    place(s, bell(mtof(91), 1.0, 0.6), ANSWER + 0.05, db(-20))
    place(s, buzz(0.2), NOTIF, db(-17))
    place(s, buzz(0.2), NOTIF + 0.28, db(-17))
    place(s, bell(mtof(88), 1.2, 0.7), NOTIF + 0.06, db(-15))
    place(s, bell(mtof(83), 1.4, 0.7), NOTIF + 0.2, db(-15))
    # end card
    place(s, whoosh(0.7, True, 300, 4000), EXIT - 0.05, db(-14))
    place(s, thump(0.6, 50), END + 0.12, db(-11))
    place(s, shimmer(1.2, 72), END + 0.05, db(-14))
    place(s, whoosh(0.4, True, 800, 6000), END + 0.3, db(-22))
    place(s, pop(700, 0.12), END + 2.2, db(-13))
    place(s, pop(1000, 0.1), END + 3.2, db(-18))
    return s


def load_vo(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


# clip starts, placed so each line's first word lands on its cue
VO = [('vo/vo1.mp3', 0.15), ('vo/vo2.mp3', 4.46), ('vo/vo3.mp3', 13.42), ('vo/vo4.mp3', 18.76), ('vo/vo5.mp3', 25.52)]


def main(out_path):
    vo = np.zeros(N)
    for p, at in VO:
        if not os.path.exists(p):  # voiceover not recorded yet
            continue
        x = load_vo(p)
        place(vo, x / np.abs(x).max() * db(-3), at)

    # duck the music under the voice
    k = int(0.05 * SR)
    envl = np.sqrt(smooth(vo ** 2, k))
    envl = smooth((envl > 0.02).astype(float), int(0.25 * SR))
    duck = 1 - 0.55 * np.clip(envl, 0, 1)

    mus = music()
    mus = mus / np.abs(mus).max() * db(-16) * duck
    fx = sfx() * (1 - 0.25 * np.clip(envl, 0, 1))

    mix = vo + mus + fx
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)  # soft safety limiter
    stereo = np.stack([mix, mix], 1)
    pcm = (np.clip(stereo, -1, 1) * 32767).astype('<i2')
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    main(sys.argv[1])
