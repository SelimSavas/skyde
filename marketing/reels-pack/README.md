# Skyde reels pack — 7 Instagram Reels

| # | Reel | Length | Hook |
|---|------|--------|------|
| 01 | `01-feels-like` | 25 s | "Why does 10°C feel like 4°C?" |
| 02 | `02-first-rain` | 28 s | "The most dangerous rain isn't the heaviest." |
| 03 | `03-lightning-count` | 26 s | "See the flash? Count." |
| 04 | `04-mom-heat` | 26 s | "If your mom texts you this every summer…" |
| 05 | `05-frost-3c` | 28 s | "3°C tonight. Your blossoms are safe… right?" |
| 06 | `06-plan-week` | 25 s | "Plan your whole week in 15 seconds." |
| 07 | `07-evening-summary` | 19 s | "It's almost 8 p.m." (loops) |

Each folder holds `skyde-<reel>.mp4` (1080×1920, 30 fps, music bed + SFX, no voiceover yet), the animation
(`index.html`, `render(t)` draws a frame) and `audio.py` (soundtrack; mixes `vo/vo1–5.mp3` when present).
`SCRIPTS.txt` has the voiceover script with timings, caption, hashtags and pinned comment for every reel.

`shared/` is the common toolkit: `base.css`, `base.js` (sky, captions, phone, notification, end card),
`icons.js`, `sfx.py` (synth SFX, music bed, voiceover ducking, mix) and `render.js`.

```bash
NODE_PATH=/path/to/node_modules ./build.sh 03-lightning-count 26 -14   # render + soundtrack + mux
node shared/render.js 03-lightning-count stills 1,5,9 /tmp                # preview frames
```
