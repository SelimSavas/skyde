# Skyde reels pack — 7 Instagram Reels

| # | Reel | Length | Hook |
|---|------|--------|------|
| 01 | `01-feels-like` | 27.9 s | "Why does 10°C feel like 4°C?" |
| 02 | `02-first-rain` | 31.8 s | "The most dangerous rain isn't the heaviest." |
| 03 | `03-lightning-count` | 29.0 s | "See the flash? Count." |
| 04 | `04-mom-heat` | 27.7 s | "If your mom texts you this every summer…" |
| 05 | `05-frost-3c` | 31.7 s | "3°C tonight. Your blossoms are safe… right?" |
| 06 | `06-plan-week` | 25.4 s | "Plan your whole week in 15 seconds." |
| 07 | `07-evening-summary` | 19.2 s | "It's almost 8 p.m." (loops) |

Each folder holds `skyde-<reel>.mp4` (1080×1920, 30 fps, voiceover + music bed + SFX, about −14 LUFS), the animation
(`index.html`, `render(t)` draws a frame) and `audio.py` (soundtrack; mixes `vo/vo1–5.mp3` when present).
`SCRIPTS.txt` has the voiceover script with timings, caption, hashtags and pinned comment for every reel.

`shared/` is the common toolkit: `base.css`, `base.js` (sky, captions, phone, notification, end card),
`icons.js`, `sfx.py` (synth SFX, music bed, voiceover ducking, mix) and `render.js`.

```bash
NODE_PATH=/path/to/node_modules ./build.sh 03-lightning-count 26 -14   # render + soundtrack + mux
node shared/render.js 03-lightning-count stills 1,5,9 /tmp                # preview frames
```

## Voiceover

`voiceover_take.mp3` is the single ElevenLabs take for all seven reels (the narrator also read the
headers, e.g. "Oh one, Feels like"; those are cut out). `fit_vo.py` cuts it into `<reel>/vo/vo1–5.mp3`
and writes `<reel>/warp.json`: every scene is stretched just enough for its line, so each line starts
on its scene. The animation applies the warp via `applyWarp()`, the soundtrack via `load_warp()`.

```bash
python3 fit_vo.py voiceover_take.mp3     # cut lines + fit scenes (line times come from a pocketsphinx pass)
NODE_PATH=/path/to/node_modules ./build_all.sh
```
