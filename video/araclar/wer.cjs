// Kesilen satırların dökümünü senaryoyla karşılaştırır (sözcük hata oranı).
// node video/araclar/wer.cjs video/<bolum>/narration.js <dokum.json> [eşik=12]
// %5–10 toplam normaldir: Whisper sayıları rakamla yazar ("2025"), yabancı adları farklı duyar ("Kork Bull").
// Asıl aranan: satır başında/sonunda eksik ya da komşu satırdan gelmiş sözcük (ör. "İki:" önceki satırda kalmış).
const fs = require('fs'), vm = require('vm');
const [narr, chkPath, thr = '12'] = process.argv.slice(2);
global.window = {};
vm.runInThisContext(fs.readFileSync(narr, 'utf8'));
const chk = JSON.parse(fs.readFileSync(chkPath, 'utf8'));
const norm = (s) => s.toLocaleLowerCase('tr-TR').replace(/[’'`]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(' ').filter(Boolean);
function lev(a, b) { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }
let E = 0, N = 0;
const rows = [];
for (const l of window.NARRATION.lines) {
  const r = norm(l.say ?? l.text), h = norm(chk[l.id] ?? '');
  const e = lev(r, h);
  E += e; N += r.length;
  rows.push([l.id, Math.round((e / r.length) * 100), chk[l.id] ?? '(DÖKÜM YOK)']);
}
console.log('satır', Object.keys(chk).length, '· toplam sözcük hata oranı', ((E / N) * 100).toFixed(1) + '%');
for (const [id, p, t] of rows) if (p >= +thr) console.log(`${id} | %${p} | ${t}`);
