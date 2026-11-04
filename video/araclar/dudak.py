#!/usr/bin/env python3
# Dudak eşlemesi için sözcük zamanları: kaydi-bol.sh'nin çalışma klasöründeki sözcük zamanlı dökümden
# (kelimeler.json) ve satır sınırlarından (out/segments.json) her satırın sözcüklerini satır başına göre yazar.
#   python3 video/araclar/dudak.py <bolum> [calisma=/tmp/kayit-<bolum>]  → video/<bolum>/dudak.js (window.DUDAK)
# Lup'un ağzı bu zamanlara göre ünlüden ünlüye geçer (yup-marka/lup.js, YupLup.mouth).
import json, os, sys
b = sys.argv[1]
w = sys.argv[2] if len(sys.argv) > 2 else '/tmp/kayit-' + b
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
words = json.load(open(os.path.join(w, 'kelimeler.json')))
segs = json.load(open(os.path.join(w, 'out', 'segments.json')))
out = {}
for g in segs:
    L = []
    for x in words:
        t0, t1 = x['timestamp'] if 'timestamp' in x else (x['start'], x['end'])
        if t0 is None or t0 < g['start'] - 0.08 or t0 >= g['end']:
            continue
        t1 = t1 if t1 is not None else t0 + 0.3
        txt = (x.get('text') or x.get('word') or '').strip()
        L.append([round(max(0, t0 - g['start']), 3), round(min(g['end'], t1) - g['start'], 3), txt])
    out[g['id']] = L
with open(os.path.join(R, b, 'dudak.js'), 'w') as f:
    f.write('/* %s dudak eşlemesi: video/araclar/dudak.py üretir (sözcük başı, sonu, sözcük; satır başına göre sn). */\nwindow.DUDAK = %s;\n' % (b, json.dumps(out, ensure_ascii=False)))
print({k: len(v) for k, v in out.items()})
