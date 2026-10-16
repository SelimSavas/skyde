# Skyde promo reel

- `skyde_promo_reel.mp4` — 1080×1920, 30 fps, 20 s, H.264 + silent AAC track (ready for Reels / Shorts / TikTok).
- `voiceover.txt` — timed English voiceover script + caption.
- `promo.html` — the animation; `render(t)` draws the frame for time `t` (seconds). Open `promo.html?t=9.7` to preview a frame.
- `render.js` — renders the video with Playwright + ffmpeg:

```bash
node render.js video skyde_promo_reel.mp4     # full video
node render.js stills 1.6,9.7,15.6            # preview PNGs
```

Adding the voiceover afterwards:

```bash
ffmpeg -i skyde_promo_reel.mp4 -i voice.m4a -map 0:v -map 1:a -c:v copy -c:a aac -shortest skyde_promo_reel_vo.mp4
```
