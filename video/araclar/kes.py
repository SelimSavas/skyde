# Kaydı segments.json'a göre satırlara böler: işleme YOK (gürültü azaltma, EQ, sıkıştırma kullanıcının sesini bozdu),
# yalnızca uçlarda 6 ms yumuşatma (tık sesi olmasın). Sonunda uçlarında ses kalan parçaları raporlar.
# python3 video/araclar/kes.py <kayit.mp3> <segments.json> <cikti-klasoru>
import json, subprocess, sys, os, numpy as np
src, segs, out = sys.argv[1], sys.argv[2], sys.argv[3]
SR = 44100
raw = subprocess.run(['ffmpeg','-loglevel','error','-i',src,'-f','f32le','-ac','1','-ar',str(SR),'-'],capture_output=True,check=True).stdout
x = np.frombuffer(raw, dtype=np.float32)
os.makedirs(out, exist_ok=True)
F = int(0.006*SR)
for g in json.load(open(segs)):
    a, b = int(g['start']*SR), int(g['end']*SR)
    y = x[a:b].copy()
    y[:F] *= np.linspace(0,1,F); y[-F:] *= np.linspace(1,0,F)
    p = subprocess.run(['ffmpeg','-loglevel','error','-y','-f','f32le','-ar',str(SR),'-ac','1','-i','-','-c:a','libmp3lame','-b:a','192k',os.path.join(out,g['id']+'.mp3')],input=y.tobytes(),check=True)
print('kesildi', len(json.load(open(segs))))
bad = []
for g in json.load(open(segs)):
    r = subprocess.run(['ffmpeg','-loglevel','error','-i',os.path.join(out,g['id']+'.mp3'),'-f','f32le','-ac','1','-ar','16000','-'],capture_output=True).stdout
    y = np.frombuffer(r, dtype=np.float32)
    h = 20*np.log10(np.sqrt((y[:480]**2).mean())+1e-9); t = 20*np.log10(np.sqrt((y[-480:]**2).mean())+1e-9)
    if h > -40 or t > -40: bad.append((g['id'], round(h,1), round(t,1)))
print('uçlarında ses olan parçalar (sözcük ortadan kesilmiş olabilir):', bad or 'yok')
