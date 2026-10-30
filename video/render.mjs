#!/usr/bin/env node
/*
 * Bir bölüm animasyonunu MP4'e döker (Playwright ile Chromium + ffmpeg gerekir).
 *
 *   node video/render.mjs ch01-var-ve-yok
 *       → video/out/ch01-var-ve-yok.mp4
 *   node video/render.mjs ch01-var-ve-yok --frames 12,45.5,100
 *       → yalnızca bu saniyelerin PNG önizlemeleri (video/out/preview/)
 *
 * Seçenekler:
 *   --fps 30          kare hızı
 *   --workers 3       paralel tarayıcı sayısı (her biri ayrı bir parça kodlar)
 *   --crf 18          x264 kalite (düşük = daha iyi)
 *   --from 0 --to 180 yalnızca bir aralığı dök
 *   --out yol.mp4     çıktı dosyası
 *   --anlatimsiz      seslendirmeyi miksin dışında bırak (yalnızca efekt ve müzik; insan sesi sonradan
 *                     dub.mjs ile eklenecekse)
 */
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require('playwright');
  } catch {
    // yerelde kurulu değilse global kurulumu dene
    const globalRoot = execSync('npm root -g').toString().trim();
    return require(path.join(globalRoot, 'playwright'));
  }
}

function parseArgs(argv) {
  const opts = { fps: 30, workers: 3, crf: 18 };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--anlatimsiz') opts.anlatimsiz = true;
    else if (a.startsWith('--')) opts[a.slice(2)] = argv[++i];
    else rest.push(a);
  }
  opts.chapter = rest[0];
  for (const k of ['fps', 'workers', 'crf']) opts[k] = Number(opts[k]);
  return opts;
}

function run(cmd, args, input) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: [input ? 'pipe' : 'ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => { err += d; });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${code}\n${err.slice(-2000)}`))));
    if (input) input(p.stdin);
  });
}

async function openPage(browser, url) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', (e) => console.error('Sayfa hatası:', e.message));
  await page.goto(url);
  await page.waitForFunction(() => typeof window.__frame === 'function');
  await page.evaluate(() => document.fonts.ready);
  return page;
}

const writeAsync = (stream, buf) => new Promise((resolve, reject) => {
  if (stream.write(buf)) return resolve();
  const onDrain = () => { stream.off('error', onError); resolve(); };
  const onError = (e) => { stream.off('drain', onDrain); reject(e); };
  stream.once('drain', onDrain).once('error', onError);
});

// Bir tarayıcı, [first, last) karelerini PNG olarak ffmpeg'e akıtır.
async function renderSegment(chromium, url, { first, last, fps, from, crf, file, onFrame }) {
  const browser = await chromium.launch();
  try {
    const page = await openPage(browser, url);
    await run('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
      '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', String(crf), '-tune', 'animation',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
      '-r', String(fps), file,
    ], async (stdin) => {
      try {
        for (let f = first; f < last; f++) {
          const dataUrl = await page.evaluate((t) => window.__frame(t, 'image/png'), from + f / fps);
          await writeAsync(stdin, Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64'));
          onFrame();
        }
      } finally {
        stdin.end();
      }
    });
  } finally {
    await browser.close();
  }
}

async function renderAudio(chromium, url, file) {
  const browser = await chromium.launch();
  try {
    const page = await openPage(browser, url);
    const chunk = 4 << 20;
    const parts = await page.evaluate((c) => window.__audio(c), chunk);
    const fd = fs.openSync(file, 'w');
    for (let i = 0; i < parts; i++) {
      const b64 = await page.evaluate(([k, c]) => window.__audioChunk(k, c), [i, chunk]);
      fs.writeSync(fd, Buffer.from(b64, 'base64'));
    }
    fs.closeSync(fd);
  } finally {
    await browser.close();
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.chapter) {
    console.error('Kullanım: node video/render.mjs <bölüm-klasörü> [--frames 1,2,3] [--fps 30] [--workers 3]');
    process.exit(1);
  }
  const page = path.join(here, opts.chapter, 'index.html');
  if (!fs.existsSync(page)) throw new Error(`Bulunamadı: ${page}`);
  const url = `${pathToFileURL(page).href}?kayit${opts.anlatimsiz ? '&anlatimsiz' : ''}`;
  const outDir = path.join(here, 'out');
  fs.mkdirSync(outDir, { recursive: true });
  const { chromium } = loadPlaywright();

  if (opts.frames) {
    const dir = path.join(outDir, 'preview');
    fs.mkdirSync(dir, { recursive: true });
    const browser = await chromium.launch();
    const p = await openPage(browser, url);
    for (const t of String(opts.frames).split(',').map(Number)) {
      const dataUrl = await p.evaluate((s) => window.__frame(s, 'image/png'), t);
      const file = path.join(dir, `${opts.chapter}-${t.toFixed(2)}.png`);
      fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
      console.log(file);
    }
    await browser.close();
    return;
  }

  const probe = await chromium.launch();
  const info = await (await openPage(probe, url)).evaluate(() => window.__info());
  await probe.close();
  if (info.voice === 'stale') {
    throw new Error(`voice.js seslendirme metniyle ya da zamanlamasıyla uyuşmuyor. Önce: node video/narrate.mjs ${opts.chapter}`);
  }
  if (opts.anlatimsiz) console.log('Seslendirme miksin dışında: yalnızca efekt ve müzik.');
  else if (info.voice === 'none') console.warn('Uyarı: seslendirme yok (voice.js bulunamadı); video yalnızca efekt ve müzikle dökülecek.');

  const from = Number(opts.from ?? 0);
  const to = Number(opts.to ?? info.duration);
  const total = Math.round((to - from) * opts.fps);
  const out = path.resolve(opts.out ?? path.join(outDir, `${opts.chapter}.mp4`));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'render-'));
  const workers = Math.max(1, Math.min(opts.workers, total));
  const per = Math.ceil(total / workers);
  console.log(`${info.title}: ${total} kare, ${opts.fps} fps, ${workers} işçi → ${out}`);

  let done = 0;
  const started = Date.now();
  const timer = setInterval(() => {
    const s = (Date.now() - started) / 1000;
    const eta = done ? ((total - done) * s) / done : 0;
    console.log(`  ${done}/${total} kare  (${(done / s).toFixed(1)} kare/sn, kalan ~${Math.round(eta)} sn)`);
  }, 10000);

  const segments = [];
  const jobs = [];
  for (let w = 0; w < workers; w++) {
    const first = w * per;
    const last = Math.min(total, first + per);
    if (first >= last) break;
    const file = path.join(tmp, `part${w}.mp4`);
    segments.push(file);
    jobs.push(renderSegment(chromium, url, { first, last, fps: opts.fps, from, crf: opts.crf, file, onFrame: () => { done++; } }));
  }
  const audio = path.join(tmp, 'audio.wav');
  jobs.push(renderAudio(chromium, url, audio).then(() => console.log('  ses sentezlendi')));
  try {
    await Promise.all(jobs);
  } finally {
    clearInterval(timer);
  }

  const list = path.join(tmp, 'list.txt');
  fs.writeFileSync(list, segments.map((s) => `file '${s}'`).join('\n'));
  await run('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0', '-i', list,
    '-ss', String(from), '-t', String(to - from), '-i', audio,
    '-map', '0:v', '-map', '1:a',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
    '-movflags', '+faststart', '-shortest', out,
  ]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`Bitti (${Math.round((Date.now() - started) / 1000)} sn): ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
