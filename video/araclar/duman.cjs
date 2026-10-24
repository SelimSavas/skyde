// Duman testi: sahte tuvalle filmi baştan sona çizer, ses notasını sahte mikserle çalıştırır; JS hatalarını yakalar.
// node video/araclar/duman.cjs video/<bolum> [adım=0.1]  → süre, hata sayısı, sahne başlangıçları
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = path.resolve(process.argv[2]);
const step = +(process.argv[3] ?? 0.1);
require('./yukle.cjs')(dir);
const grad = { addColorStop() {} };
const ctx = new Proxy({}, {
  get(o, k) {
    if (k in o) return o[k];
    if (k === 'measureText') return (s) => ({ width: String(s).length * 18 });
    if (k.startsWith('create')) return () => grad;
    if (k === 'canvas') return { width: 1920, height: 1080 };
    return () => {};
  },
  set(o, k, v) { o[k] = v; return true; },
});
const F = window.FILM;
let errs = 0;
for (let t = 0; t < F.duration; t += step) {
  try { F.draw(ctx, t); } catch (e) { if (errs++ < 8) console.log('HATA t=' + t.toFixed(2), F.sceneAt(t).id, e.message, e.stack.split('\n')[1]); }
}
const calls = {};
const m = new Proxy({}, { get: (o, k) => (...a) => { calls[k] = (calls[k] || 0) + 1; for (const x of a) if (typeof x === 'number' && !Number.isFinite(x)) throw new Error('NaN arg in ' + k); } });
try { F.score(m, (n) => 440); } catch (e) { errs++; console.log('NOTA HATASI', e.message, e.stack.split('\n')[1]); }
console.log('süre', F.duration.toFixed(1), 'hata', errs, 'nota', JSON.stringify(calls));
for (const s of F.scenes) console.log(s.id.padEnd(6), s.start.toFixed(1), '→', s.end.toFixed(1));
