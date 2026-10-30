// YouTube bölüm (chapter) zamanları: node video/araclar/bolumler.cjs video/<bolum> [--satir]
// Sahne başlarını sahne adlarıyla yazar; --satir her seslendirme satırının başını da yazar (daha ince bölümler için).
// İlk bölüm 0:00 olur; 10 saniyeden kısa bölümleri YouTube kabul etmez, onlar "(kısa)" diye işaretlenir.
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = path.resolve(process.argv[2]);
const lines = process.argv.includes('--satir');
require('./yukle.cjs')(dir);
const F = window.FILM, N = F.narration;
if (N && !N.voice) console.error('uyarı: voice.js taze değil, zamanlar tahminî');
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const sc = F.scenes;
sc.forEach((s, i) => {
  const st = i ? s.start : 0;
  const len = (sc[i + 1]?.start ?? F.duration) - st;
  console.log(`${mmss(st)} ${s.title ?? s.id}${len < 10 ? '  (kısa)' : ''}`);
  if (lines && N) for (const l of window.NARRATION.lines) if (N.beats[l.beat ?? l.id]?.[0] === s.id) console.log(`    ${mmss(N.cue(l.id, 0))}  ${l.id}  ${l.say.slice(0, 60)}`);
});
console.log(`süre ${mmss(F.duration)}`);
