#!/usr/bin/env python3
"""AnneKolay short #01 builder.

audio/01.mp3 ... audio/08.mp3 (ElevenLabs) varsa: sesleri temizler, birleştirir,
videoyu her bölümün gerçek süresine göre kurgular ve sesi ekler.
Ses yoksa tahmini sürelerle sessiz önizleme üretir.
Opsiyonel: audio/muzik.mp3 -> alçak seviyede fon müziği.

  python3 build.py            # video
  python3 build.py --stills   # sadece kontrol karelerini üret
"""
import json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
AUDIO, OUT, WORK = ROOT / "audio", ROOT / "out", ROOT / "out" / "_work"
FPS = 30
LEAD = 0.15        # ilk sesten önce
GAP = 0.32         # bölümler arası nefes payı
TAIL = 1.6         # kapanıştan sonra bekleme
VOWELS = re.compile(r"[aeıioöuüâîûAEIİOÖUÜÂÎÛ]")


def run(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


def duration(p):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]).stdout)


def find_audio(seg_id):
    for ext in ("wav", "mp3", "m4a", "ogg", "flac"):
        p = AUDIO / f"{seg_id}.{ext}"
        if p.exists():
            return p
    return None


def clean(src, dst):
    # mono 48k, baştaki/sondaki sessizliği kırp (60 ms pay bırak)
    trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06"
    af = f"{trim},areverse,{trim},areverse,highpass=f=70"
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", af, "-ac", "1", "-ar", "48000", str(dst)])


def take_file(script):
    return json.loads((ROOT / "alignment.json").read_text())["file"]


def full_take(script):
    """Tek dosya seslendirme + alignment.json -> bölümler, toplam süre, ses filtresi."""
    al_path = ROOT / "alignment.json"
    if not al_path.exists() or all(find_audio(s["id"]) for s in script["segments"]):
        return None
    al = json.loads(al_path.read_text())
    src = ROOT / al["file"]
    if not src.exists():
        return None
    segs = []
    for s in script["segments"]:
        ph = al["segments"][s["id"]]
        a, b = ph[0][1], ph[-1][2]
        segs.append({**s, "start": round(LEAD + a, 3), "dur": round(b - a, 3), "speechStart": 0.0,
                     "speechEnd": round(b - a, 3), "wav": str(src),
                     "phrases": [{"text": t, "s": round(x - a, 3), "e": round(y - a, 3)} for t, x, y in ph]})
    total = round(LEAD + duration(src) + TAIL - 0.2, 3)
    ms = int(LEAD * 1000)
    vf = f"[0:a]aresample=48000,adelay={ms}|{ms},highpass=f=70,afade=t=in:d=0.02,apad=whole_dur={total}[vo]"
    return segs, total, vf


def main():
    stills = "--stills" in sys.argv
    script = json.loads((ROOT / "script.json").read_text())
    WORK.mkdir(parents=True, exist_ok=True)
    segs, have_audio = [], True
    take = full_take(script)
    if take:
        segs, total, voice_filter = take
        have_audio = True
    t = LEAD
    for s in ([] if take else script["segments"]):
        src = find_audio(s["id"])
        if src:
            wav = WORK / f"{s['id']}.wav"
            clean(src, wav)
            dur = duration(wav)
        else:
            have_audio, wav = False, None
            dur = len(VOWELS.findall(s["tts"])) / 5.4 + 0.2
        segs.append({**s, "start": round(t, 3), "dur": round(dur, 3), "speechStart": 0.0,
                     "speechEnd": round(dur, 3), "wav": str(wav) if wav else None})
        t += dur + GAP
    if not take:
        total = round(t - GAP + TAIL, 3)
    tl = {"total": total, "segments": segs}
    (WORK / "timeline.json").write_text(json.dumps(tl, ensure_ascii=False, indent=1))
    print(f"Toplam süre: {total:.1f} sn ({'gerçek ses' if have_audio else 'tahmini süreler'})")
    for s in segs:
        print(f"  {s['id']} {s['scene']:<7} {s['start']:6.2f}s  {s['dur']:5.2f}s")

    if stills:
        times = []
        for s in segs:
            times += [s["start"] + 0.05, s["start"] + s["dur"] * 0.55, s["start"] + s["dur"] - 0.1]
        run(["node", str(ROOT / "src/render.mjs"), str(WORK / "timeline.json"),
             ",".join(f"{x:.2f}" for x in times), "30", "--still", str(OUT / "stills")])
        return

    silent = WORK / "video.mp4"
    subprocess.run(["node", str(ROOT / "src/render.mjs"), str(WORK / "timeline.json"), str(silent), str(FPS)], check=True)

    if not have_audio:
        missing = [s["id"] for s in segs if not s["wav"]]
        dst = OUT / "onizleme_sessiz.mp4"
        silent.replace(dst)
        print(f"Ses dosyası eksik ({', '.join(missing)}): sessiz önizleme -> {dst}")
        return

    inputs, filt = [], []
    if take:
        inputs, n = ["-i", str(ROOT / take_file(script))], 1
        filt.append(voice_filter)
    else:
        for i, s in enumerate(segs):
            inputs += ["-i", s["wav"]]
            ms = int(s["start"] * 1000)
            filt.append(f"[{i}:a]adelay={ms}|{ms},highpass=f=70[a{i}]")
        n = len(segs)
        filt.append("".join(f"[a{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0,apad=whole_dur={total}[vo]")
    music = next((p for p in AUDIO.glob("muzik.*")), None)
    if music:
        inputs += ["-stream_loop", "-1", "-i", str(music)]
        filt.append(f"[{n}:a]atrim=0:{total},volume=0.10,afade=t=in:d=1,afade=t=out:st={total - 2}:d=2[m]")
        filt.append("[vo]asplit[vo1][sc];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[md];[vo1][md]amix=inputs=2:normalize=0[pre]")
    else:
        filt.append("[vo]anull[pre]")
    filt.append("[pre]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[out]")
    voice = WORK / "voice.m4a"
    run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(filt), "-map", "[out]",
         "-t", str(total), "-c:a", "aac", "-b:a", "192k", str(voice)])
    final = OUT / "annekolay_short01_yenidogan.mp4"
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(silent), "-i", str(voice), "-map", "0:v", "-map", "1:a",
         "-c:v", "copy", "-c:a", "copy", "-shortest", "-movflags", "+faststart", str(final)])
    print(f"Hazır: {final}")


if __name__ == "__main__":
    main()
