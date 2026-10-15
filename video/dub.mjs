#!/usr/bin/env node
/*
 * Hazır videoya insan sesiyle seslendirme ekler; görüntüyü yeniden dökmez.
 *
 *   node video/dub.mjs ch01-var-ve-yok --kayit video/seslendirme
 *       → video/out/ch01-var-ve-yok-seslendirme.mp4
 *
 * Her satır <kayıt klasörü>/<id>.(mp3|wav|m4a|ogg|flac) dosyasından okunur (id'ler narration.js'te).
 * Satırlar voice.js'teki yerlerine konur. Satır içindeki duraklar, görüntünün bağlı olduğu öbek
 * başlarına (cue) hizalanır: "kapalı kapalı, kapalı açık…" derken lambalar yine söylenen anda yanar.
 * Bir satır kendi yerine sığmazsa önce duraklar kısalır, gerekirse satır hafifçe hızlandırılır.
 * Ses (efektler, müzik, kayıt) baştan karıştırılır; videonun görüntü akışı olduğu gibi kopyalanır.
 * Kaydı olmayan ya da --atla ile dışarıda bırakılan satırlarda voice.js'teki TTS sesi kalır.
 *
 * Seçenekler:
 *   --video a.mp4,b.mp4   sesi eklenecek videolar (varsayılan video/out/<bölüm>.mp4)
 *   --atla id1,id2        bu satırların kaydını kullanma
 *   --gain 1.25           seslendirmenin miksteki seviyesi
 */
import { spawnSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const RATE = 48000;
const FRAME = RATE / 100; // 10 ms
const MIN_GAP = 0.12; // öbekler arasında en az bu kadar durak kalsın (sn)
const LINE_GAP = 0.2; // bir satır, sonrakinin başlangıcından en az bu kadar önce bitsin
const MAX_TEMPO = 1.25;

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require('playwright');
  } catch {
    return require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
  }
}

function parseArgs(argv) {
  const opts = { gain: 1.25, atla: '' };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      rest.push(a);
      continue;
    }
    const key = a.slice(2);
    if (!['kayit', 'video', 'atla', 'gain'].includes(key)) throw new Error(`Bilinmeyen seçenek: ${a}`);
    opts[key] = argv[++i];
  }
  opts.chapter = rest[0];
  opts.gain = Number(opts.gain);
  if (!opts.chapter || !opts.kayit) throw new Error('Kullanım: node video/dub.mjs <bölüm> --kayit <klasör> [--video a.mp4,b.mp4] [--atla id1,id2]');
  return opts;
}

function run(cmd, args, { input, stdout = 'ignore' } = {}) {
  const r = spawnSync(cmd, args, { input, stdio: [input == null ? 'ignore' : 'pipe', stdout, 'pipe'], maxBuffer: 1 << 30 });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${cmd} başarısız (${r.status}):\n${r.stderr.toString().slice(-1500)}`);
  return r;
}

const decode = (file, filters = 'highpass=f=70') => {
  const raw = run('ffmpeg', ['-loglevel', 'error', '-i', file, ...(filters ? ['-af', filters] : []), '-ar', String(RATE), '-ac', '1', '-f', 'f32le', '-'], { stdout: 'pipe' }).stdout;
  return new Float32Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.length));
};

function peakOf(x) {
  let p = 0;
  for (let i = 0; i < x.length; i++) p = Math.max(p, Math.abs(x[i]));
  return p;
}

// Sessiz uçları kırpar (eşik: kaydın tepesinin −40 dB'i)
function trim(x, lead = 0.015, tail = 0.04) {
  const thr = peakOf(x) * 0.01;
  let a = 0;
  let b = x.length;
  while (a < b && Math.abs(x[a]) <= thr) a++;
  while (b > a && Math.abs(x[b - 1]) <= thr) b--;
  return x.slice(Math.max(0, a - RATE * lead), Math.min(x.length, b + RATE * tail));
}

// narrate.mjs ile aynı seviye: konuşan pencerelerin RMS'i −20 dBFS, tepe −1 dBFS'i aşmaz
function normalize(x) {
  let sum = 0;
  let n = 0;
  const win = RATE / 50;
  for (let i = 0; i + win <= x.length; i += win) {
    let e = 0;
    for (let k = i; k < i + win; k++) e += x[k] * x[k];
    if (e / win > 1e-5) {
      sum += e;
      n += win;
    }
  }
  const rms = n ? Math.sqrt(sum / n) : 1;
  const k = Math.min(0.1 / rms, 0.89 / Math.max(peakOf(x), 1e-6));
  for (let i = 0; i < x.length; i++) x[i] *= k;
  return x;
}

// Satırın içindeki sessiz aralıklar (en az 120 ms): öbek sınırı adayları
function pauses(x) {
  const frames = Math.floor(x.length / FRAME);
  const rms = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let e = 0;
    for (let k = f * FRAME; k < (f + 1) * FRAME; k++) e += x[k] * x[k];
    rms[f] = Math.sqrt(e / FRAME);
  }
  const sorted = Array.from(rms).sort((a, b) => a - b);
  const thr = sorted[Math.floor(frames * 0.95)] * 0.05;
  const out = [];
  let s = -1;
  for (let f = 0; f <= frames; f++) {
    const quiet = f < frames && rms[f] < thr;
    if (quiet && s < 0) s = f;
    if (!quiet && s >= 0) {
      if (f - s >= 12 && s > 0 && f < frames) out.push({ start: s / 100, end: f / 100, mid: (s + f) / 200, len: (f - s) / 100 });
      s = -1;
    }
  }
  return out;
}

// Kayıttaki durakları TTS'teki öbek sınırlarıyla eşleştirir (sıra korunarak, en yakın ve uzun duraklar)
function matchPauses(cands, expected, len) {
  const N = expected.length;
  const M = cands.length;
  if (!N) return [];
  if (M < N) return null;
  const cost = (j, k) => Math.abs(cands[j].mid / len - expected[k]) + 0.15 * (1 - Math.min(cands[j].len, 0.5) / 0.5);
  const dp = Array.from({ length: N }, () => new Float64Array(M).fill(Infinity));
  const from = Array.from({ length: N }, () => new Int32Array(M).fill(-1));
  for (let j = 0; j < M; j++) dp[0][j] = cost(j, 0);
  for (let k = 1; k < N; k++) {
    let best = Infinity;
    let arg = -1;
    for (let j = k; j < M; j++) {
      if (dp[k - 1][j - 1] < best) {
        best = dp[k - 1][j - 1];
        arg = j - 1;
      }
      dp[k][j] = best + cost(j, k);
      from[k][j] = arg;
    }
  }
  let j = -1;
  let best = Infinity;
  for (let i = N - 1; i < M; i++) if (dp[N - 1][i] < best) [best, j] = [dp[N - 1][i], i];
  const pick = [];
  for (let k = N - 1; k >= 0; k--) {
    pick.unshift(cands[j]);
    j = from[k][j];
  }
  // TTS'teki yerinden çok uzak bir durak eşleştiyse güvenme
  return pick.every((c, k) => Math.abs(c.mid / len - expected[k]) < 0.22) ? pick : null;
}

function atempo(x, factor) {
  const tmp = path.join(os.tmpdir(), `dub-${process.pid}.f32`);
  try {
    fs.writeFileSync(tmp, Buffer.from(x.buffer, x.byteOffset, x.byteLength));
    const raw = run('ffmpeg', ['-loglevel', 'error', '-f', 'f32le', '-ar', String(RATE), '-ac', '1', '-i', tmp, '-af', `atempo=${factor.toFixed(4)}`, '-f', 'f32le', '-'], { stdout: 'pipe' }).stdout;
    return new Float32Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.length));
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

// Bir satırı yerine koyar → [{ at, clip }] parçaları ve kullanılan yöntem
function placeLine(x, line, limit, PAUSES) {
  const lenH = x.length / RATE;
  const room = limit - line.at;
  const n = line.phrases.length;
  // TTS'te öbekler arası durağın ortası, satır süresine oranla
  const expected = [];
  for (let k = 1; k < n; k++) expected.push((line.marks[k] - (PAUSES[line.phrases[k - 1].slice(-1)] ?? 0.3) / 2) / line.dur);
  const cuts = n > 1 ? matchPauses(pauses(x), expected, lenH) : [];
  if (cuts) {
    const bounds = [0, ...cuts.map((c) => c.mid), lenH];
    const segs = [];
    for (let k = 0; k < n; k++) segs.push(trim(x.slice(Math.round(bounds[k] * RATE), Math.round(bounds[k + 1] * RATE)), 0.02, 0.06));
    // her öbek, TTS'te başladığı ana (görüntünün bağlı olduğu cue); önceki bitmeden başlamaz
    let cursor = -Infinity;
    const parts = segs.map((clip, k) => {
      const at = Math.max(line.at + line.marks[k], cursor + MIN_GAP);
      cursor = at + clip.length / RATE;
      return { at, clip };
    });
    if (cursor <= limit) {
      const drift = parts.reduce((s, p, k) => s + (p.at - (line.at + line.marks[k])), 0) / n;
      return { parts, how: `öbek (${n}), ort. kayma ${drift.toFixed(2)} sn` };
    }
  }
  // Öbek hizası olmadı ya da sığmadı: satır bütün olarak başlar; gerekirse hızlanır
  if (lenH <= room) return { parts: [{ at: line.at, clip: x }], how: cuts ? 'bütün (öbekler sığmadı)' : 'bütün' };
  const f = lenH / room;
  if (f > MAX_TEMPO) console.warn(`  ! ${line.id}: kayıt yerine çok uzun (${lenH.toFixed(2)} sn > ${room.toFixed(2)} sn); ×${f.toFixed(2)} hızlandırılıyor`);
  return { parts: [{ at: line.at, clip: atempo(x, f) }], how: `bütün, ×${f.toFixed(2)} hızlı` };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const dir = path.join(here, opts.chapter);
  const skip = new Set(opts.atla.split(',').map((s) => s.trim()).filter(Boolean));
  const videos = (opts.video ?? path.join(here, 'out', `${opts.chapter}.mp4`)).split(',').map((v) => path.resolve(v));
  for (const v of videos) if (!fs.existsSync(v)) throw new Error(`Video yok: ${v}`);

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    page.on('pageerror', (e) => console.error('Sayfa hatası:', e.message));
    await page.goto(`${pathToFileURL(path.join(dir, 'index.html')).href}?kayit`);
    await page.waitForFunction(() => window.FILM && window.FILM.narration);
    const info = await page.evaluate(() => {
      const n = window.FILM.narration;
      if (!n.fresh) return { stale: true };
      return {
        duration: window.FILM.duration,
        PAUSES: window.Engine.PAUSES,
        lines: n.placed.map((l, i) => ({ id: l.id, at: l.at, dur: l.dur, phrases: l.phrases, marks: n.voice.lines[i].marks ?? null })),
        tts: n.voice.audio,
      };
    });
    if (info.stale) throw new Error(`voice.js güncel değil; video da onunla dökülmüş olmalı. Önce: node video/narrate.mjs ${opts.chapter}`);

    // TTS izi: kaydı olmayan satırlar için
    const ttsFile = path.join(os.tmpdir(), `dub-tts-${process.pid}.mp3`);
    fs.writeFileSync(ttsFile, Buffer.from(info.tts, 'base64'));
    const tts = decode(ttsFile, null);
    fs.rmSync(ttsFile, { force: true });

    const track = new Float32Array(Math.ceil(info.duration * RATE));
    const duck = [];
    const kept = [];
    console.log(`${info.lines.length} satır → ${path.relative(process.cwd(), path.resolve(opts.kayit))}`);
    info.lines.forEach((line, i) => {
      const limit = i < info.lines.length - 1 ? info.lines[i + 1].at - LINE_GAP : info.duration - 0.3;
      const src = ['mp3', 'wav', 'm4a', 'ogg', 'flac'].map((e) => path.join(opts.kayit, `${line.id}.${e}`)).find((f) => fs.existsSync(f));
      let parts;
      let how;
      if (!src || skip.has(line.id) || !line.marks) {
        const a = Math.round(line.at * RATE);
        parts = [{ at: line.at, clip: tts.slice(a, a + Math.round(line.dur * RATE)) }];
        how = src ? 'TTS (atlandı)' : 'TTS (kayıt yok)';
        kept.push(line.id);
      } else {
        ({ parts, how } = placeLine(normalize(trim(decode(src))), line, limit, info.PAUSES));
      }
      for (const p of parts) {
        const o = Math.round(p.at * RATE);
        track.set(p.clip.subarray(0, Math.max(0, track.length - o)), o);
      }
      const end = parts[parts.length - 1].at + parts[parts.length - 1].clip.length / RATE;
      duck.push({ at: parts[0].at, dur: end - parts[0].at });
      console.log(`  ${line.id.padEnd(20)} ${line.at.toFixed(2).padStart(7)}  ${how}`);
    });

    // İzi MP3'e çevirip filmin miksine ver (efektler konuşma sırasında kısılır)
    const tmpMp3 = path.join(os.tmpdir(), `dub-${process.pid}.mp3`);
    const wavOut = path.join(here, 'out', `${opts.chapter}-seslendirme.wav`);
    try {
      run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'f32le', '-ar', String(RATE), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-q:a', '2', tmpMp3], { input: Buffer.from(track.buffer) });
      const voice = { gain: opts.gain, lines: duck, audio: fs.readFileSync(tmpMp3).toString('base64') };
      const chunk = 4 << 20;
      const parts = await page.evaluate(async ([v, c]) => {
        window.__dubWav = Synth.toWav(await Synth.render(window.FILM.score, window.FILM.duration, 48000, v));
        return Math.ceil(window.__dubWav.length / c);
      }, [voice, chunk]);
      const fd = fs.openSync(wavOut, 'w');
      for (let k = 0; k < parts; k++) {
        const b64 = await page.evaluate(([i, c]) => {
          const part = window.__dubWav.subarray(i * c, (i + 1) * c);
          let bin = '';
          for (let j = 0; j < part.length; j += 0x8000) bin += String.fromCharCode.apply(null, part.subarray(j, j + 0x8000));
          return btoa(bin);
        }, [k, chunk]);
        fs.writeSync(fd, Buffer.from(b64, 'base64'));
      }
      fs.closeSync(fd);
    } finally {
      fs.rmSync(tmpMp3, { force: true });
    }

    // Görüntü akışı kopyalanır, yalnızca ses değişir
    for (const v of videos) {
      const out = v.replace(/\.mp4$/i, '-seslendirme.mp4');
      run('ffmpeg', ['-y', '-loglevel', 'error', '-i', v, '-i', wavOut, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
      console.log(`\n${out} yazıldı`);
    }
    if (kept.length) console.log(`\nTTS sesi kalan satırlar: ${kept.join(', ')}`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
