# Skyde promo reel

- `skyde_promo_reel.mp4` — 1080×1920, 30 fps, 22 s, H.264 + AAC (voiceover + music bed + SFX, −14 LUFS). Ready for Reels / Shorts / TikTok.
- `voiceover.txt` — timed English voiceover script + caption.
- `vo/vo1–5.mp3` — recorded voiceover lines.
- `audio.py` — builds the soundtrack (synthesized music + animation SFX + ducked voiceover), timed to the animation.
- `promo.html` — the animation; `render(t)` draws the frame for time `t` (seconds). Open `promo.html?t=9.7` to preview a frame.
- `render.js` — renders the video with Playwright + ffmpeg:

```bash
node render.js video skyde_promo_reel.mp4     # full video
node render.js stills 1.6,9.7,15.6            # preview PNGs
```

Rebuild the final video:

```bash
node render.js video silent.mp4                 # needs NODE_PATH pointing at a playwright install
python3 audio.py mix.wav                        # needs numpy + ffmpeg
ffmpeg -i silent.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=9 \
  -ar 48000 -c:a aac -b:a 192k -movflags +faststart skyde_promo_reel.mp4
```
