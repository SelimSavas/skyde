// Tek parça kaydı (ElevenLabs, satırlar arası [pause]) senaryo satırlarına hizalar.
// node video/araclar/hizala.cjs <kelimeler.json> <kayit16k.f32> <bolum>/narration.js <ids.txt> <cikti-klasoru>
// → cikti/segments.json (her satırın kesim aralığı, satır aralarındaki en uzun sessizliğin içinden) ve
//   cikti/marks.json (her öbeğin satır içindeki başlangıcı, sn). Rapor: kapsama oranı, satır arası sessizlik,
//   "fazla sözcük" (iki satır arasında eşleşmeyen, kayıtta fazladan okunmuş ya da Whisper'ın tekrar ettiği sözcükler).
const fs = require('fs');
const vm = require('vm');
const [wordsPath, f32Path, narrPath, idsPath, outDir] = process.argv.slice(2);
global.window = global;
vm.runInThisContext(fs.readFileSync(narrPath, 'utf8'));
const want = new Set(fs.readFileSync(idsPath, 'utf8').split(/\s+/).filter(Boolean));
const LINES = window.NARRATION.lines.filter((l) => want.has(l.id));
const norm = (s) => s.toLocaleLowerCase('tr-TR').replace(/[’'`]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const exp = [];
LINES.forEach((l, li) => norm(l.say).split(' ').filter(Boolean).forEach((w) => exp.push({ w, li })));
const asr = [];
for (const c of JSON.parse(fs.readFileSync(wordsPath, 'utf8'))) {
  const ws = norm(c.text).split(' ').filter(Boolean);
  const [s, e0] = c.timestamp;
  const e = e0 ?? s + 0.3;
  ws.forEach((w, i) => asr.push({ w, s: s + ((e - s) * i) / ws.length, e: s + ((e - s) * (i + 1)) / ws.length }));
}
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const sim = (a, b) => 1 - lev(a, b) / Math.max(a.length, b.length);
const n = exp.length, m = asr.length, G = -0.6;
const sc = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
const bk = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1));
for (let i = 1; i <= n; i++) { sc[i][0] = i * G; bk[i][0] = 1; }
for (let j = 1; j <= m; j++) { sc[0][j] = j * G; bk[0][j] = 2; }
for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
  const s = sim(exp[i - 1].w, asr[j - 1].w);
  const d = sc[i - 1][j - 1] + (s > 0.5 ? s : s - 1), u = sc[i - 1][j] + G, l = sc[i][j - 1] + G;
  if (d >= u && d >= l) { sc[i][j] = d; bk[i][j] = 0; } else if (u >= l) { sc[i][j] = u; bk[i][j] = 1; } else { sc[i][j] = l; bk[i][j] = 2; }
}
let i = n, j = m;
const match = new Array(n).fill(-1);
while (i > 0 || j > 0) {
  const b = bk[i][j];
  if (i > 0 && j > 0 && b === 0) { match[i - 1] = j - 1; i--; j--; } else if (i > 0 && (j === 0 || b === 1)) i--; else j--;
}
const used = new Set(match.filter((k) => k >= 0));
const est = LINES.map((l, li) => {
  const idx = exp.map((e, k) => (e.li === li && match[k] >= 0 ? match[k] : -1)).filter((k) => k >= 0);
  const total = exp.filter((e) => e.li === li).length;
  if (!idx.length) { console.log('EŞLEŞME YOK:', l.id, l.say); return null; }
  return { a: idx[0], b: idx[idx.length - 1], s: asr[idx[0]].s, e: asr[idx[idx.length - 1]].e, cover: idx.length / total };
});
if (est.some((x) => !x)) process.exit(1);
// enerji zarfı (10 ms) — temizlenmiş sesten
const buf = fs.readFileSync(f32Path);
const x = new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
const SR = 16000, F = 160;
const env = new Float32Array(Math.floor(x.length / F));
for (let k = 0; k < env.length; k++) { let s = 0; for (let q = 0; q < F; q++) s += x[k * F + q] ** 2; env[k] = Math.sqrt(s / F); }
const dur = x.length / SR;
const THR = 0.006;
// pencere içindeki konuşma adaları [başlangıç, bitiş] (sn); 40 ms'den kısa sessizlikler ada içinde sayılır
function islands(t0, t1) {
  const lo = Math.max(0, Math.floor(t0 * 100)), hi = Math.min(env.length - 1, Math.ceil(t1 * 100));
  const out = [];
  let cur = null, quiet = 0;
  for (let k = lo; k <= hi; k++) {
    if (env[k] >= THR) {
      if (!cur) cur = [k, k];
      cur[1] = k;
      quiet = 0;
    } else if (cur && ++quiet > 4) { out.push(cur); cur = null; }
  }
  if (cur) out.push(cur);
  // 120 ms'den kısa adalar soluk/tıkırtıdır; at
  return out.map(([a, b]) => [a / 100, (b + 1) / 100]).filter(([a, b]) => b - a >= 0.12);
}
const segs = LINES.map((l) => ({ id: l.id, start: null, end: null }));
const report = [];
for (let li = 0; li < LINES.length; li++) {
  const A = est[li];
  if (li === 0) {
    const isl = islands(Math.max(0, A.s - 1), A.s + 0.5);
    segs[0].start = Math.max(0, (isl.length ? isl[0][0] : A.s) - 0.08);
  }
  if (li === LINES.length - 1) {
    const isl = islands(A.e - 0.5, Math.min(dur, A.e + 1.5));
    segs[li].end = Math.min(dur, (isl.length ? isl[isl.length - 1][1] : A.e) + 0.2);
    continue;
  }
  const B = est[li + 1];
  // satırlar arası: penceredeki en uzun sessizliğin içinden kes
  const lo = Math.max(0, Math.floor((Math.min(A.e, B.s) - 0.5) * 100)), hi = Math.min(env.length - 1, Math.ceil((Math.max(A.e, B.s) + 0.5) * 100));
  let best = null, run = null;
  for (let k = lo; k <= hi + 1; k++) {
    const q = k <= hi && env[k] < THR * 0.6;
    if (q && run === null) run = k;
    if (!q && run !== null) { if (!best || k - run > best[1] - best[0]) best = [run, k]; run = null; }
  }
  let endT, startT, pauseIsl = null;
  if (best) {
    const g0 = best[0] / 100, g1 = best[1] / 100, gl = g1 - g0;
    endT = g0 + Math.min(0.2, gl / 2);
    startT = g1 - Math.min(0.1, gl / 2);
  } else {
    endT = A.e + 0.1;
    startT = B.s - 0.05;
  }
  const extra = [];
  for (let k = A.b + 1; k < B.a; k++) if (!used.has(k)) extra.push(asr[k]);
  const ps = best ? best[0] / 100 : null, pe = best ? best[1] / 100 : null;
  segs[li].end = endT;
  segs[li + 1].start = startT;
  report.push({ after: LINES[li].id, pause: extra.map((w) => w.w).join(' '), ps, pe });
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outDir + '/segments.json', JSON.stringify(segs, null, 1));
segs.forEach((g, k) => console.log(g.id.padEnd(14), g.start.toFixed(2), g.end.toFixed(2), (g.end - g.start).toFixed(2), 'kapsama', est[k].cover.toFixed(2)));
report.forEach((r) => console.log('  ', r.after.padEnd(12), 'sessizlik', r.ps?.toFixed(2), '–', r.pe?.toFixed(2), r.pause ? 'fazla sözcük: ' + r.pause : ''));
// öbek başları
const PH = (str) => (str.match(/[^,;:.!?…—]+(?:[,;:.!?…—]+|$)/g) ?? []).map((p) => p.trim()).filter((p) => /[\p{L}\p{N}]/u.test(p));
const marks = {};
LINES.forEach((l, li) => {
  const idxs = exp.map((e, k) => k).filter((k) => exp[k].li === li);
  const t0 = asr[match[idxs.find((k) => match[k] >= 0)]].s;
  const out = [];
  let w = 0;
  for (const ph of PH(l.say)) {
    const cnt = norm(ph).split(' ').filter(Boolean).length;
    const ks = idxs.slice(w, w + cnt).filter((k) => match[k] >= 0);
    out.push(ks.length ? +(asr[match[ks[0]]].s - t0).toFixed(3) : null);
    w += cnt;
  }
  out[0] = 0;
  marks[l.id] = out;
});
fs.writeFileSync(outDir + '/marks.json', JSON.stringify(marks, null, 1));
