#!/usr/bin/env node
/*
 * Seslendirme izini üretir: <bölüm>/narration.js'teki satırları bir TTS motoruyla okutur,
 * sürelerini ölçüp satırları vuruşlarına yerleştirir ve <bölüm>/voice.js dosyasını yazar.
 * Oynatıcı ve render.mjs sesi bu dosyadan alır; alt yazılar da aynı zamanlamayı izler.
 *
 *   node video/narrate.mjs ch01-var-ve-yok
 *       → varsayılan motor: espeak-ng + MBROLA tr2 (çevrimdışı, apt ile kurulur)
 *   node video/narrate.mjs ch01-var-ve-yok --engine piper:/yol/tr_TR-fahrettin-medium.onnx
 *       → Piper nöral sesi (pip install piper-tts; model Hugging Face'ten indirilir)
 *   node video/narrate.mjs ch01-var-ve-yok --engine files:/yol/kayitlar
 *       → insan kaydı: her satır için <id>.wav (ya da .mp3/.m4a/.ogg/.flac)
 *
 * Seçenekler:
 *   --rate 1.0          konuşma hızı çarpanı (MBROLA ve Piper)
 *   --gain 1.25         seslendirmenin miksteki seviyesi
 *   --allow-overflow    vuruşuna sığmayan satır olsa da dosyayı yaz
 */
import { spawnSync, execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const RATE = 24000; // seslendirme izinin örnekleme hızı
const TOLERANCE = 0.25; // bir satırın vuruşunu aşabileceği süre (sn)
// Vuruşunu biraz aşmak serbest; sahne geçişine (kararmaya) taşmak değil.
const overflows = (p) => p.at + p.dur > Math.min(p.deadline + TOLERANCE, p.sceneEnd - 0.4);
const CACHE_REV = 2; // sentez kuralları değişince önbelleği geçersiz kılmak için artırın

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require('playwright');
  } catch {
    return require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
  }
}

function parseArgs(argv) {
  const opts = { engine: 'mbrola:tr2', rate: 1, gain: 1.25 };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--allow-overflow') {
      opts.allowOverflow = true;
    } else if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      const key = a.slice(2, eq < 0 ? undefined : eq);
      if (!['engine', 'rate', 'gain'].includes(key)) throw new Error(`Bilinmeyen seçenek: ${a}`);
      opts[key] = eq < 0 ? argv[++i] : a.slice(eq + 1);
    } else {
      rest.push(a);
    }
  }
  opts.chapter = rest[0];
  for (const k of ['rate', 'gain']) {
    opts[k] = Number(opts[k]);
    if (!(opts[k] > 0 && Number.isFinite(opts[k]))) throw new Error(`--${k} pozitif bir sayı olmalı`);
  }
  return opts;
}

function run(cmd, args, { input, stdout = 'ignore' } = {}) {
  const r = spawnSync(cmd, args, { input, stdio: [input == null ? 'ignore' : 'pipe', stdout, 'pipe'], maxBuffer: 1 << 30 });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${cmd} başarısız (${r.status}):\n${r.stderr.toString().slice(-1500)}`);
  return r;
}

// ---------- TTS motorları: (metin, hız, hedef wav) → uyarı listesi ----------

const engines = {
  // espeak-ng Türkçe kurallarıyla fonem + prozodi üretir, MBROLA difon sesiyle okur.
  // MBROLA tr seslerinde espeak'in açık "e" (&) ve hece sonu l çeşitleri (l/, L/) yok;
  // bunlar en yakın fonemle (e, l, L) değiştirilmezse o difonlar sessiz kalır.
  mbrola(voice) {
    const db = `/usr/share/mbrola/${voice}/${voice}`;
    if (!fs.existsSync(db)) throw new Error(`MBROLA sesi yok: ${db}\nKurulum: sudo apt-get install espeak-ng mbrola mbrola-${voice}`);
    return {
      key: `mbrola-${voice}`,
      synth(text, rate, out) {
        const pho = run('espeak-ng', ['-v', `mb-${voice}`, '-s', String(Math.round(150 * rate)), '-q', '--pho', text], { stdout: 'pipe' }).stdout.toString();
        const fixed = pho.split('\n').map((l) => l.replace(/^&(\s)/, 'e$1').replace(/^([^\s;]+)\/(\s)/, '$1$2')).join('\n');
        const r = run('mbrola', ['-e', db, '-', out], { input: fixed });
        return r.stderr.toString().split('\n').filter((l) => /unknown/.test(l));
      },
    };
  },
  piper(model) {
    if (!fs.existsSync(model)) throw new Error(`Piper modeli bulunamadı: ${model}`);
    return {
      key: `piper-${path.basename(model, '.onnx')}`,
      synth(text, rate, out) {
        run('python3', ['-m', 'piper', '-m', model, '-f', out, '--length-scale', String(1 / rate)], { input: text });
        return [];
      },
    };
  },
  // İnsan kaydı: hız ayarlanamaz, sığmayan satır raporlanır
  files(dir) {
    return {
      key: null,
      fixedRate: true,
      synth(text, rate, out, line) {
        const src = ['wav', 'mp3', 'm4a', 'ogg', 'flac'].map((e) => path.join(dir, `${line.id}.${e}`)).find((f) => fs.existsSync(f));
        if (!src) throw new Error(`Kayıt yok: ${path.join(dir, `${line.id}.wav`)}`);
        run('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, out]);
        return [];
      },
    };
  },
};

function makeEngine(spec) {
  const i = spec.indexOf(':');
  const name = i < 0 ? spec : spec.slice(0, i);
  const arg = i < 0 ? '' : spec.slice(i + 1);
  if (!engines[name]) throw new Error(`Bilinmeyen motor: ${name} (mbrola:<ses> | piper:<model.onnx> | files:<klasör>)`);
  return { name: spec, ...engines[name](arg) };
}

// 24 kHz mono float'a çevirir, sessiz uçları kırpar, seviyeyi eşitler.
function loadClip(file) {
  const raw = run('ffmpeg', [
    '-loglevel', 'error', '-i', file,
    '-af', 'highpass=f=70', '-ar', String(RATE), '-ac', '1', '-f', 'f32le', '-',
  ], { stdout: 'pipe' }).stdout;
  const all = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  // Kırpma eşiği kaydın kendi tepesine göre (−40 dB): sessiz bir insan kaydı da doğru kırpılır
  let top = 0;
  for (let i = 0; i < all.length; i++) top = Math.max(top, Math.abs(all[i]));
  const thr = top * 0.01;
  let a = 0;
  let b = all.length;
  while (a < b && Math.abs(all[a]) <= thr) a++;
  while (b > a && Math.abs(all[b - 1]) <= thr) b--;
  const x = all.slice(Math.max(0, a - RATE * 0.015), Math.min(all.length, b + RATE * 0.04));
  if (x.length < RATE * 0.2) throw new Error(`${file}: kırpıldıktan sonra ses neredeyse yok (${(x.length / RATE).toFixed(2)} sn). Kayıt boş ya da bozuk mu?`);
  // ses içeren 20 ms pencerelerin RMS'i −20 dBFS'e, tepe −1 dBFS'i aşmayacak biçimde
  let sum = 0;
  let n = 0;
  let peak = 0;
  const win = RATE / 50;
  for (let i = 0; i + win <= x.length; i += win) {
    let e = 0;
    for (let k = i; k < i + win; k++) {
      e += x[k] * x[k];
      peak = Math.max(peak, Math.abs(x[k]));
    }
    if (e / win > 1e-5) {
      sum += e;
      n += win;
    }
  }
  const rms = n ? Math.sqrt(sum / n) : 1;
  const k = Math.min(0.1 / rms, 0.89 / Math.max(peak, 1e-6));
  for (let i = 0; i < x.length; i++) x[i] *= k;
  return x;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.chapter) {
    console.error('Kullanım: node video/narrate.mjs <bölüm-klasörü> [--engine mbrola:tr2|piper:<model>|files:<klasör>] [--rate 1.0]');
    process.exit(1);
  }
  const dir = path.join(here, opts.chapter);
  const engine = makeEngine(opts.engine);
  const cache = path.join(here, 'out', 'voice-cache', engine.key ?? 'files');
  fs.mkdirSync(cache, { recursive: true });

  // Satırları ve yerleştirme kuralını filmin kendisinden al (tek kaynak: narration.js + film.js)
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('Sayfa hatası:', e.message));
  page.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') console.error('Sayfa:', m.text()); });
  await page.goto(`${pathToFileURL(path.join(dir, 'index.html')).href}?kayit`);
  await page.waitForFunction(() => window.FILM && window.FILM.narration);
  const { lines, duration } = await page.evaluate(() => ({
    lines: window.FILM.narration.lines.map(({ id, beat, say }) => ({ id, beat, say })),
    duration: window.FILM.duration,
  }));
  if (!lines.length) throw new Error('narration.js içinde satır yok.');

  const rates = lines.map(() => opts.rate);
  const clips = [];
  const synth = (i) => {
    const l = lines[i];
    const key = crypto.createHash('sha1').update(`${CACHE_REV}|${engine.name}|${rates[i]}|${l.say}`).digest('hex').slice(0, 16);
    const file = path.join(cache, engine.key ? `${key}.wav` : `${l.id}.wav`);
    if (!engine.key || !fs.existsSync(file)) {
      // Önce geçici dosyaya: yarıda kesilen bir sentez önbellekte bozuk klip bırakmasın
      const tmp = `${file}.${process.pid}.tmp.wav`;
      try {
        const warnings = engine.synth(l.say, rates[i], tmp, l);
        if (warnings.length) console.warn(`  ! ${l.id}: ${[...new Set(warnings)].join('; ')}`);
        fs.renameSync(tmp, file);
      } finally {
        fs.rmSync(tmp, { force: true });
      }
    }
    clips[i] = loadClip(file);
  };
  console.log(`${lines.length} satır, motor: ${engine.name}`);
  lines.forEach((_, i) => synth(i));

  // Yerleştir; sığmayan satırları (motor izin veriyorsa) biraz hızlandırarak yeniden okut
  let placed;
  for (let round = 0; ; round++) {
    placed = await page.evaluate((d) => window.FILM.narration.place(d), clips.map((c) => c.length / RATE));
    const late = placed.map((p, i) => [p, i]).filter(([p]) => overflows(p));
    if (!late.length || engine.fixedRate || round >= 3) break;
    for (const [, i] of late) {
      if (rates[i] >= opts.rate * 1.2) continue;
      rates[i] = Math.min(opts.rate * 1.2, rates[i] * 1.07);
      synth(i);
    }
  }
  await browser.close();

  let overflow = 0;
  console.log('\n  satır                     vuruş               başla    süre   pay');
  placed.forEach((p, i) => {
    // pay: satırın bitebileceği son ana (vuruş sonu + tolerans, en geç sahne kararmadan önce) kalan süre
    const slack = Math.min(p.deadline + TOLERANCE, p.sceneEnd - 0.4) - (p.at + p.dur);
    const bad = overflows(p);
    if (bad) overflow++;
    const speed = rates[i] !== opts.rate ? ` hız×${(rates[i] / opts.rate).toFixed(2)}` : '';
    console.log(`  ${bad ? '✗' : ' '} ${p.id.padEnd(24)} ${p.beat.padEnd(19)} ${p.at.toFixed(2).padStart(6)}  ${p.dur.toFixed(2).padStart(5)}  ${slack.toFixed(2).padStart(5)}${speed}`);
  });
  const last = placed[placed.length - 1];
  console.log(`\n  toplam konuşma ${placed.reduce((s, p) => s + p.dur, 0).toFixed(1)} sn, film ${duration.toFixed(1)} sn`);
  if (last.at + last.dur > duration) throw new Error('Son satır film bitmeden tamamlanmıyor.');
  if (overflow && !opts.allowOverflow) {
    throw new Error(`${overflow} satır vuruşuna sığmıyor. narration.js'te metni kısaltın ya da o vuruşa bekleme (holds) ekleyin; yine de yazmak için --allow-overflow.`);
  }

  // Tek iz: her satır kendi anına
  const track = new Float32Array(Math.ceil(duration * RATE));
  placed.forEach((p, i) => track.set(clips[i].subarray(0, Math.max(0, track.length - Math.round(p.at * RATE))), Math.round(p.at * RATE)));
  // Aranabilir bir dosyaya kodla: ffmpeg kodlayıcı gecikmesini (LAME etiketi) yalnızca o zaman yazar,
  // tarayıcı da bu etiketle konuşmayı tam yerinde başlatır (borudan kodlanınca ~46 ms geç kalır).
  const tmpMp3 = path.join(os.tmpdir(), `voice-${process.pid}.mp3`);
  let mp3;
  try {
    run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'f32le', '-ar', String(RATE), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-q:a', '6', tmpMp3], { input: Buffer.from(track.buffer) });
    mp3 = fs.readFileSync(tmpMp3);
  } finally {
    fs.rmSync(tmpMp3, { force: true });
  }

  const voice = {
    engine: engine.name,
    gain: opts.gain,
    lines: placed.map((p) => ({ id: p.id, say: p.say, at: +p.at.toFixed(3), dur: +p.dur.toFixed(3) })),
    audio: mp3.toString('base64'),
  };
  const out = path.join(dir, 'voice.js');
  fs.writeFileSync(out, `// narrate.mjs tarafından üretildi; elle düzenlemeyin. Motor: ${engine.name}\nwindow.VOICE = ${JSON.stringify(voice)};\n`);
  console.log(`\n${out} yazıldı (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
