"""Cut the single-take voiceover into lines and stretch each reel's scenes to fit them.

Writes <reel>/vo/vo1–5.mp3, <reel>/warp.json and the applyWarp() hook in <reel>/index.html.
Line boundaries come from a pocketsphinx pass over the take (the reel/line headers the narrator
read aloud, e.g. "Oh one, Feels like", are skipped).
"""
import json
import os
import re
import subprocess
import sys

TAKE = sys.argv[1]
# (reel, old VO starts, old duration, [(line start, line end) in the take])
REELS = [
    ('01-feels-like', [0.2, 4.1, 11.2, 15.9, 21.2], 25.0,
     [(2.49, 6.39), (7.11, 15.12), (15.65, 19.72), (20.21, 22.30), (22.77, 25.81)]),
    ('02-first-rain', [0.2, 4.3, 11.0, 14.9, 19.6], 28.0,
     [(28.91, 31.63), (32.08, 39.69), (40.13, 43.68), (44.11, 49.38), (49.75, 53.59)]),
    ('03-lightning-count', [0.15, 7.3, 11.8, 17.4, 22.6], 26.0,
     [(56.62, 59.59), (60.03, 64.50), (64.97, 71.40), (71.78, 76.53), (76.92, 77.97)]),
    ('04-mom-heat', [0.2, 5.5, 10.6, 17.5, 22.6], 26.0,
     [(81.20, 84.81), (85.17, 90.86), (91.21, 95.88), (96.20, 100.68), (101.02, 102.51)]),
    ('05-frost-3c', [0.2, 4.4, 11.4, 16.9, 19.9], 28.0,
     [(106.72, 110.24), (110.67, 118.69), (119.02, 125.06), (125.41, 127.73), (128.06, 133.15)]),
    ('06-plan-week', [0.2, 4.0, 7.7, 11.1, 15.7], 25.0,
     [(135.87, 139.12), (139.43, 140.27), (140.54, 143.12), (143.42, 146.84), (147.16, 152.28)]),
    ('07-evening-summary', [0.2, 3.6, 9.1, 12.9, 15.3], 19.0,
     [(155.24, 156.68), (157.32, 161.53), (162.06, 165.15), (165.58, 166.24), (166.69, 169.72)]),
]
LEAD, TAIL, PAD_IN, PAD_OUT = 0.2, 0.5, 0.06, 0.12

for reel, old_vo, old_dur, lines in REELS:
    os.makedirs(f'{reel}/vo', exist_ok=True)
    old_starts = [max(0.0, v - LEAD) for v in old_vo]
    old_ends = old_starts[1:] + [old_dur]
    knots, vo, t_new = [], [], 0.0
    for k, ((a, b), os_, oe) in enumerate(zip(lines, old_starts, old_ends)):
        clip = (b - a) + PAD_IN + PAD_OUT
        need = LEAD + clip + TAIL
        new_len = max(oe - os_, need)
        knots.append([round(t_new, 3), round(os_, 3)])
        vo.append({'file': f'vo/vo{k + 1}.mp3', 'at': round(t_new + LEAD, 3)})
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', TAKE, '-ss', f'{a - PAD_IN:.3f}', '-to', f'{b + PAD_OUT:.3f}',
                        '-af', 'afade=t=in:d=0.03,areverse,afade=t=in:d=0.06,areverse', '-c:a', 'libmp3lame', '-q:a', '2',
                        f'{reel}/vo/vo{k + 1}.mp3'], check=True)
        t_new += new_len
    knots.append([round(t_new, 3), old_dur])
    json.dump({'duration': round(t_new, 3), 'knots': knots, 'vo': vo}, open(f'{reel}/warp.json', 'w'), indent=1)
    html = open(f'{reel}/index.html').read()
    hook = f'<script id="warp">applyWarp({json.dumps(knots)});</script>'
    html = re.sub(r'<script id="warp">.*?</script>\n?', '', html)
    html = html.replace('</body></html>', hook + '\n</body></html>')
    open(f'{reel}/index.html', 'w').write(html)
    print(f'{reel}: {old_dur:.1f}s -> {t_new:.1f}s  knots={knots}')
