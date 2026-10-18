# Skyde farmer reel

Farmer mode — "Is it safe to spray?" Same style as `../promo-reel`.

- `skyde_farmer_reel.mp4` — 1080×1920, 30 fps, 22 s, voiceover + music bed + animation SFX, −14 LUFS.
- `voiceover.txt` — timed English voiceover script + caption.
- `promo.html` + `icons.js` — the animation; `render(t)` draws the frame for time `t`.
- `audio.py` — soundtrack; mixes the voiceover with ducked music and SFX. `vo/voiceover_full.mp3` is the original single-take recording; `vo/vo1–5.mp3` are the five lines cut from it at the pauses.

```bash
NODE_PATH=/path/to/node_modules node render.js video silent.mp4
python3 audio.py mix.wav
ffmpeg -i silent.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=9 \
  -ar 48000 -c:a aac -b:a 192k -movflags +faststart skyde_farmer_reel.mp4
```
