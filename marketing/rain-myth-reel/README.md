# Skyde "30% rain" reel

Myth-buster / quiz format built for reach: a hook ("What does 30% rain mean?"), an A/B/C quiz with a
countdown and a "Comment A, B or C" prompt, the reveal (PoP = confidence × area), then Skyde
("Or just skip the math") and the end card with a save prompt. Same visual system as `../promo-reel`.

- `skyde_rain_myth_reel.mp4` — 1080×1920, 30 fps, 31.5 s, voiceover + music bed + animation SFX, −14 LUFS.
- `voiceover.txt` — timed English voiceover script, caption and the fact source.
- `promo.html` + `icons.js` — the animation; `render(t)` draws the frame for time `t`.
- `audio.py` — soundtrack; mixes the voiceover with ducked music and SFX. `vo/voiceover_full.mp3` is the original single take; `vo/vo1–5.mp3` are its five lines, cut at the pauses. The quiz highlights, countdown and reveal are timed to the spoken words.

```bash
NODE_PATH=/path/to/node_modules node render.js video silent.mp4
python3 audio.py mix.wav
ffmpeg -i silent.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=9 \
  -ar 48000 -c:a aac -b:a 192k -movflags +faststart skyde_rain_myth_reel.mp4
```
