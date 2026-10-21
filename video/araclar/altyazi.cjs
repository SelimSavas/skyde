// YouTube altyazısı: node video/araclar/altyazi.cjs video/<bolum> video/<bolum>/youtube/altyazi-tr.srt
// Filmin seslendirme planından (cue/end) yazar; dub.mjs öbek başlarını cue'lara hizaladığı için zamanlar sesle örtüşür.
// voice.js taze olmalı (narrate.mjs kayıtla çalıştırılmış). Ekrandaki yazım (ör. "sin-propantiyal-S-oksit") korunur.
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = path.resolve(process.argv[2]);
global.window = global;
global.Image = class { decode() { return Promise.resolve(); } };
for (const f of ['../shared/engine.js', 'assets.js', 'narration.js', 'voice.js', 'film.js']) if (fs.existsSync(path.join(dir, f))) vm.runInThisContext(fs.readFileSync(path.join(dir, f), 'utf8'));
const F = window.FILM, N = F.narration;
if (!N.voice) throw new Error('voice.js taze değil');
const MAX = 84, LINE = 42;
const fmt = (s) => { const ms = Math.round(s * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
// iki satıra dengeli böl
const twoLines = (s) => {
  if (s.length <= LINE) return s;
  const ws = s.split(' ');
  let best = null;
  for (let i = 1; i < ws.length; i++) {
    const a = ws.slice(0, i).join(' '), b = ws.slice(i).join(' ');
    const sc = Math.max(a.length, b.length);
    if (!best || sc < best[0]) best = [sc, `${a}\n${b}`];
  }
  return best[1];
};
const cues = [];
for (const l of window.NARRATION.lines) {
  const ph = window.Engine.phrases(l.say);
  const st = ph.map((_, k) => N.cue(l.id, k));
  const end = N.end(l.id);
  let cur = null;
  const flush = () => { if (cur) cues.push(cur); cur = null; };
  ph.forEach((p, k) => {
    const pe = k + 1 < ph.length ? st[k + 1] - 0.05 : end;
    if (p.length > MAX) {
      // tek öbek çok uzunsa sözcüklerden ikiye böl, süreyi harf payına göre dağıt
      flush();
      const ws = p.split(' ');
      const half = Math.ceil(ws.length / 2);
      const a = ws.slice(0, half).join(' '), b = ws.slice(half).join(' ');
      const mid = st[k] + ((pe - st[k]) * a.length) / p.length;
      cues.push({ s: st[k], e: mid, t: a }, { s: mid, e: pe, t: b });
      return;
    }
    if (cur && (cur.t + ' ' + p).length <= MAX) { cur.t += ' ' + p; cur.e = pe; }
    else { flush(); cur = { s: st[k], e: pe, t: p }; }
  });
  flush();
}
for (let i = 0; i + 1 < cues.length; i++) cues[i].e = Math.min(cues[i].e, cues[i + 1].s - 0.04);
const out = cues.map((c, i) => `${i + 1}\n${fmt(c.s)} --> ${fmt(Math.max(c.e, c.s + 0.8))}\n${twoLines(c.t)}\n`).join('\n');
fs.writeFileSync(process.argv[3], out);
console.log('altyazı', cues.length, 'parça; son', fmt(cues[cues.length - 1].e));
