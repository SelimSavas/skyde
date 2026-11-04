#!/usr/bin/env node
/*
 * Tanıtım videosundaki boş ekrana bölüm videolarından seçilen parçaları bindirir.
 * Parçalar ve filmdeki aralıkları film.js'teki MONTAGE'dan okunur (voice.js'e göre zamanlanmış).
 *
 *   node video/render.mjs tanitim --anlatimsiz         → video/out/tanitim.mp4 (ekran boş)
 *   node video/tanitim/montaj.mjs                       → video/out/tanitim-montaj.mp4
 *   node video/dub.mjs tanitim --kayit <kayıt klasörü> --video video/out/tanitim-montaj.mp4
 *                                                       → video/out/tanitim-montaj-seslendirme.mp4
 *
 * Kaynaklar: video/out/<bölüm>-seslendirme.mp4 (yalnızca görüntüleri kullanılır; ses tanıtımın kendi sesidir).
 * Seçenekler: --video <girdi.mp4>  --cikti <çıktı.mp4>  --crf 18
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(`--${k}`) ? args[args.indexOf(`--${k}`) + 1] : d);
const input = path.resolve(opt('video', path.join(root, 'out', 'tanitim.mp4')));
const output = path.resolve(opt('cikti', path.join(root, 'out', 'tanitim-montaj.mp4')));
const crf = opt('crf', '18');

// film.js'i tarayıcısız yükle: yalnızca zaman çizelgesi ve MONTAGE gerekir
const sandbox = { console };
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const f of ['../shared/engine.js', 'narration.js', 'voice.js', 'film.js']) {
  const file = path.join(here, f);
  if (fs.existsSync(file)) vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}
const clips = sandbox.MONTAGE;
const S = sandbox.MONTAGE_SCREEN;
if (!clips?.length) throw new Error('film.js MONTAGE tanımlamıyor');

const inputs = ['-i', input];
const chains = [];
let last = '[0:v]';
clips.forEach((c, i) => {
  const src = path.join(root, 'out', `${c.src}-seslendirme.mp4`);
  if (!fs.existsSync(src)) throw new Error(`Kaynak yok: ${src}`);
  const dur = c.end - c.start;
  const take = Math.min(dur, c.max);
  const from = c.until != null ? Math.max(c.from, c.until - take) : c.from;
  inputs.push('-ss', from.toFixed(3), '-t', take.toFixed(3), '-i', src);
  const fades = [];
  if (i === 0) fades.push('fade=t=in:st=0:d=0.3:alpha=1');
  // son parça, sahne kararırken (film.js'te sahne geçişi 0,45 sn) onunla birlikte söner
  if (i === clips.length - 1) fades.push(`fade=t=out:st=${(dur - 0.45).toFixed(3)}:d=0.45:alpha=1`);
  const pad = dur > take + 0.01 ? [`tpad=stop_mode=clone:stop_duration=${(dur - take + 0.1).toFixed(3)}`] : [];
  chains.push(`[${i + 1}:v]${['setpts=PTS-STARTPTS', ...pad, `scale=${S.w}:${S.h}:flags=lanczos`, 'format=yuva420p', ...fades, `setpts=PTS+${c.start.toFixed(3)}/TB`].join(',')}[c${i}]`);
  chains.push(`${last}[c${i}]overlay=${S.x}:${S.y}:eof_action=pass:enable='between(t,${c.start.toFixed(3)},${c.end.toFixed(3)})'[v${i}]`);
  last = `[v${i}]`;
  console.log(`${c.id.padEnd(8)} ${c.src} ${from.toFixed(2)}+${take.toFixed(2)} sn → ${c.start.toFixed(2)}–${c.end.toFixed(2)}${pad.length ? ' (son kare dondurulur)' : ''}`);
});

const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', chains.join(';'), '-map', last, '-map', '0:a?', '-c:v', 'libx264', '-preset', 'medium', '-crf', crf, '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', output], { stdio: ['ignore', 'inherit', 'inherit'] });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`${output} yazıldı`);
