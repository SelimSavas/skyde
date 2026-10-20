# Skyde "Your app said no rain" — Reels + carousel

Gap #8 from `../research/content-gaps.html`, made for @skyde.app. Same visual system as `../promo-reel`.

- `skyde_no_rain_reel.mp4` — 1080×1920, 30 fps, 27 s, music bed + animation SFX (no voiceover yet).
- `carousel/slide-1.png … slide-7.png` — 1080×1350 (4:5) carousel.
- `post.txt` — voiceover script, captions, hashtags, pinned comment, alt text, posting tips.
- `promo.html` / `carousel.html` + `icons.js` — sources; `render(t)` draws a reel frame, `show(n)` a carousel slide.
- `audio.py` — soundtrack; voiceover lines are mixed in from `vo/vo1.mp3 … vo5.mp3` when present.

The phone in the opening is a generic, unbranded weather app (the one that said "no rain"); Skyde appears from the plan screen on.

```bash
NODE_PATH=/path/to/node_modules node render.js video silent.mp4
NODE_PATH=/path/to/node_modules node render_carousel.js carousel
python3 audio.py mix.wav
ffmpeg -i silent.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=9 \
  -ar 48000 -c:a aac -b:a 192k -movflags +faststart skyde_no_rain_reel.mp4
```
