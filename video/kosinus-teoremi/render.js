#!/usr/bin/env node
/*
 * Kullanım:
 *   node render.js                 → SENARYO.md + altyazı + video (cikti/kosinus-teoremi.mp4)
 *   node render.js --docs          → yalnızca SENARYO.md, altyazı ve kayıt listesi
 *   node render.js --snap 12,95.5  → verilen saniyelerden PNG kareler (cikti/kareler/)
 *   node render.js --from 60 --to 120   → yalnızca bir aralığı işle (hızlı deneme)
 *   Seçenekler: --fps 30  --workers 4  --nosubs (altyazısız)  --out dosya.mp4
 *
 * Ses: ses/ klasörüne 01-01.mp3, 01-02.mp3 ... (replik kodlarıyla) konursa süreler
 * otomatik ölçülür, zamanlama sese göre yeniden hesaplanır ve ses videoya eklenir.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const { chromium } = require('playwright');

const DIR = __dirname;
const OUT = path.join(DIR, 'cikti');
const SES = path.join(DIR, 'ses');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : args[i + 1]; };
const flag = k => args.includes('--' + k);
const FPS = +opt('fps', 30);
const WORKERS = +opt('workers', 4);
fs.mkdirSync(OUT, { recursive: true });

/* ---------- 1. ses dosyalarını ölç ---------- */
function buildManifest() {
  const files = fs.existsSync(SES) ? fs.readdirSync(SES).filter(f => /^\d\d-\d\d\.(mp3|wav|m4a|ogg|aac|flac|opus)$/i.test(f)) : [];
  const dur = {}, map = {};
  for (const f of files.sort()) {
    const d = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(SES, f)]).toString().trim();
    const id = f.slice(0, 5);
    dur[id] = Math.round(d * 1000) / 1000; map[id] = f;
  }
  fs.writeFileSync(path.join(SES, 'manifest.js'),
    `// render.js tarafından otomatik üretildi\nwindow.AUDIO_MANIFEST = ${JSON.stringify(dur, null, 1)};\nwindow.AUDIO_FILES = ${JSON.stringify(map, null, 1)};\n`);
  return { dur, map };
}

/* ---------- 2. dokümanlar ---------- */
const mmss = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const srtT = t => {
  const ms = Math.max(0, Math.round(t * 1000));
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
};

function writeDocs(d, audio) {
  const nAudio = Object.keys(audio.dur).length;
  const beats = d.scenes.flatMap(s => s.beats);
  const spoken = beats.filter(b => !b.wait);
  const L = [];
  L.push('# Kosinüs Teoremini Sıfırdan Öğreniyorum — Video Senaryosu', '');
  L.push('> Bu dosya `script.js` içinden otomatik üretilir (`node render.js --docs`). Metni değiştirmek için `script.js` düzenlenir.', '');
  L.push('## Genel bilgiler', '');
  L.push(`- **Hedef kitle:** Meslek lisesi 10. sınıf, matematikte temel eksikleri olabilecek öğrenciler`);
  L.push(`- **Toplam süre:** ${mmss(d.total)} ${nAudio ? `(${nAudio} gerçek ses kaydına göre)` : '(seslendirme süresi tahmini: sakin anlatım ≈ 117 kelime/dk)'}`);
  L.push(`- **Format:** 1920×1080 (16:9), 30 fps, Türkçe seslendirme, sade 2D dijital tahta`);
  L.push(`- **Replik sayısı:** ${spoken.length} seslendirme + ${beats.length - spoken.length} sessiz düşünme beklemesi (5'er sn)`);
  L.push(`- **Renk dili (her sahnede aynı):** 1. kenar / a → mavi · 2. kenar / b → pembe · açı → turuncu · aranan kenar ve sonuç → yeşil · vurgu → sarı · yanlış/uyarı → kırmızı`);
  L.push(`- **Kurallar:** Formüller aşamalı yazılır; yeni işlem satırı gelince öncekiler soluklaşır; açı daima iki kenarın birleştiği köşede; tüm üçgenler verilen ölçülere göre ölçekli çizilir; ondalıklar virgülle (6,24).`, '');
  L.push('## Ses kaydı nasıl yapılacak?', '');
  L.push('- Her replik ayrı dosya olarak kaydedilir; dosya adı tablodaki **Kod** olur: `01-01.mp3`, `01-02.mp3`, … (wav/m4a/ogg da olur).');
  L.push('- Dosyalar `video/kosinus-teoremi/ses/` klasörüne konur. Video, her repliği kendi sesinin uzunluğuna göre yeniden zamanlar; görseller otomatik kayar.');
  L.push('- Tek parça uzun kayıt da olur: `seslendirme_metni.txt` içindeki her `[pause]` bir replik sonudur; o noktalarda ~1 sn sessizlik bırakılırsa kayıt sessizliklerden replik replik bölünür.');
  L.push('- Okuma tonu: sakin, samimi, acele etmeden. Formüller robot gibi değil, cümle gibi okunur ("ce kare eşittir a kare artı be kare…").');
  L.push('- Düşünme beklemeleri (⏸) için kayıt **yapılmaz**; video o 5 saniyeyi kendisi bekler.', '');
  L.push('## Akış', '', '| Bölüm | Başlık | Başlangıç | Süre | Hedef |', '|---|---|---|---|---|');
  for (const s of d.scenes) L.push(`| ${s.label} | ${s.title} | ${mmss(s.start)} | ${mmss(s.end - s.start)} | ${s.target || ''} |`);
  L.push('');
  for (const s of d.scenes) {
    L.push(`## ${s.label} — ${s.title}`, '', `**Zaman:** ${mmss(s.start)} – ${mmss(s.end)} (${mmss(s.end - s.start)})`, '');
    if (s.notes.length) { L.push('### Görsel yönergeler', ''); s.notes.forEach(n => L.push('- ' + n)); L.push(''); }
    const fm = [...new Set(s.formulas)];
    if (fm.length) { L.push('### Ekrandaki formüller (sırasıyla)', ''); fm.forEach(f => L.push('- `' + f + '`')); L.push(''); }
    L.push('### Seslendirme ve zamanlama', '', '| Kod | Zaman | Seslendirme | Ekranda |', '|---|---|---|---|');
    for (const b of s.beats) {
      if (b.wait) L.push(`| — | ${mmss(b.start)} | *⏸ ${b.speak} sn sessiz bekleme — öğrenci düşünür* | ${b.cue} |`);
      else L.push(`| **${b.id}** | ${mmss(b.start)} | ${b.text.replace(/\|/g, '\\|')} | ${b.cue.replace(/\|/g, '\\|')} |`);
    }
    L.push('');
  }
  L.push('## Matematiksel doğruluk kontrolü', '', 'Aşağıdaki değerler video üretilirken `script.js` içinde yeniden hesaplanır:', '');
  L.push('| Soru | Veriler (kenar, kenar, aradaki açı) | x² (hesap) | Sonuç (hesap) | Ekranda | Üçgen eşitsizliği | Durum |', '|---|---|---|---|---|---|---|');
  for (const c of d.checks) L.push(`| ${c.ad} | ${c.veri} | ${c.kare} | ${c.sonuc} | ${c.gosterilen} | ${c.ucgen ? 'sağlanıyor' : '**SAĞLANMIYOR**'} | ${c.pass ? '✅' : '❌'} |`);
  L.push('', '- Kosinüs teoremi her üçgende geçerlidir; formüldeki açı her örnekte, kullanılan iki kenarın **arasındaki** açıdır.');
  L.push('- Kenar uzunlukları karekök alınarak bulunur; yalnızca pozitif kök (uzunluk) alınır.');
  L.push('- Açı bulmada ters kosinüs (cos⁻¹ / arccos) kullanılır; cos⁻¹, 1/cos anlamına gelmez.');
  L.push('- Hesap makinesi derece (DEG) modunda olmalıdır.', '');
  fs.writeFileSync(path.join(DIR, 'SENARYO.md'), L.join('\n'));

  // seslendirme metni (okuyucu / TTS için): yalnızca konuşulacak metin, replikler arası [pause]
  const R = [];
  for (const b of beats) {
    if (b.wait) continue;
    if (R.length) R.push('[pause]');
    R.push(b.text.replace(/^\.\.\.\s*/, '').replace(/\s*\.\.\.$/, '.'));
  }
  fs.writeFileSync(path.join(DIR, 'seslendirme_metni.txt'), R.join('\n\n') + '\n');

  const S = d.subs.map((x, i) => `${i + 1}\n${srtT(x.t0)} --> ${srtT(x.t1)}\n${x.text}\n`);
  fs.writeFileSync(path.join(OUT, 'kosinus-teoremi.srt'), S.join('\n'));
  fs.writeFileSync(path.join(OUT, 'zamanlama.json'), JSON.stringify(d, null, 1));
}

/* ---------- 3. kare kare çizim ---------- */
async function openPage(browser, nosubs) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') console.log('[sayfa]', m.text()); });
  page.on('pageerror', e => console.log('[sayfa hatası]', e.message));
  await page.goto('file://' + path.join(DIR, 'index.html') + '?export' + (nosubs ? '&nosubs' : ''));
  await page.waitForFunction(() => typeof VIDEO !== 'undefined' && VIDEO.ready, null, { timeout: 60000 });
  return page;
}

function ffmpeg(argv) {
  const p = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...argv], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => p.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
  return { p, done };
}

async function renderRange(browser, f0, f1, file, nosubs, tag) {
  const page = await openPage(browser, nosubs);
  const ff = ffmpeg(['-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), file]);
  let prevSig = null, prevBuf = null, shots = 0;
  const write = buf => new Promise(r => (ff.p.stdin.write(buf) ? r() : ff.p.stdin.once('drain', r)));
  for (let f = f0; f < f1; f++) {
    const sig = await page.evaluate(t => VIDEO.renderAt(t), f / FPS);
    if (sig !== prevSig || !prevBuf) { prevBuf = await page.screenshot({ type: 'jpeg', quality: 93 }); prevSig = sig; shots++; }
    await write(prevBuf);
    if ((f - f0) % 900 === 0) console.log(`  [${tag}] ${Math.round((100 * (f - f0)) / (f1 - f0))}%`);
  }
  ff.p.stdin.end();
  await ff.done;
  await page.close();
  return shots;
}

function mixAudio(d, audio, from, to, file) {
  const beats = d.scenes.flatMap(s => s.beats).filter(b => !b.wait && audio.map[b.id] && b.start + b.speak > from && b.start < to);
  if (!beats.length) return false;
  const inputs = [], filt = [];
  beats.forEach((b, i) => {
    inputs.push('-i', path.join(SES, audio.map[b.id]));
    const delay = Math.max(0, Math.round((b.start - from) * 1000));
    const trim = Math.max(0, from - b.start);
    filt.push(`[${i}:a]aresample=48000,aformat=channel_layouts=mono,atrim=start=${trim.toFixed(3)},asetpts=PTS-STARTPTS,adelay=${delay}[a${i}]`);
  });
  filt.push(beats.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${beats.length}:normalize=0:dropout_transition=0,apad,atrim=0:${(to - from).toFixed(3)},loudnorm=I=-16:TP=-1.5:LRA=11[out]`);
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...inputs, '-filter_complex', filt.join(';'), '-map', '[out]', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', file]);
  return true;
}

(async () => {
  const audio = buildManifest();
  const browser = await chromium.launch();
  const page = await openPage(browser, flag('nosubs'));
  const d = await page.evaluate(() => VIDEO.docs());
  await page.close();
  writeDocs(d, audio);
  console.log(`Toplam süre: ${mmss(d.total)} · ${d.scenes.length} bölüm · ses kaydı: ${Object.keys(audio.dur).length}`);
  d.scenes.forEach(s => console.log(`  ${s.label.padEnd(8)} ${mmss(s.start)}  (${mmss(s.end - s.start)})  ${s.title}`));
  const bad = d.checks.filter(c => !c.pass);
  console.log(bad.length ? `MATEMATİK KONTROLÜ BAŞARISIZ: ${bad.map(c => c.ad).join(', ')}` : 'Matematik kontrolü: hepsi doğru ✓');
  if (flag('docs')) { await browser.close(); return; }

  if (opt('snap')) {
    const dir = path.join(OUT, 'kareler'); fs.mkdirSync(dir, { recursive: true });
    const p = await openPage(browser, flag('nosubs'));
    for (const t of opt('snap').split(',').map(Number)) {
      await p.evaluate(x => VIDEO.renderAt(x), t);
      await p.screenshot({ path: path.join(dir, `t${String(t.toFixed(1)).padStart(6, '0')}.png`) });
    }
    await browser.close(); console.log('Kareler:', dir); return;
  }

  const from = +opt('from', 0), to = Math.min(+opt('to', d.total), d.total);
  const F0 = Math.floor(from * FPS), F1 = Math.ceil(to * FPS);
  const n = Math.max(1, Math.min(WORKERS, Math.ceil((F1 - F0) / 300)));
  const tmp = path.join(OUT, 'parca'); fs.mkdirSync(tmp, { recursive: true });
  const t0 = Date.now();
  const parts = [];
  for (let i = 0; i < n; i++) {
    const a = F0 + Math.floor(((F1 - F0) * i) / n), b = F0 + Math.floor(((F1 - F0) * (i + 1)) / n);
    parts.push({ a, b, file: path.join(tmp, `p${i}.mp4`) });
  }
  const shots = await Promise.all(parts.map((p, i) => renderRange(browser, p.a, p.b, p.file, flag('nosubs'), i + 1)));
  await browser.close();
  console.log(`Kareler bitti: ${F1 - F0} kare, ${shots.reduce((x, y) => x + y, 0)} ekran görüntüsü, ${Math.round((Date.now() - t0) / 1000)} sn`);

  fs.writeFileSync(path.join(tmp, 'liste.txt'), parts.map(p => `file '${p.file}'`).join('\n'));
  const silent = path.join(tmp, 'sessiz.mp4');
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'liste.txt'), '-c', 'copy', silent]);
  const out = opt('out', path.join(OUT, 'kosinus-teoremi' + (flag('nosubs') ? '' : '-altyazili') + (F0 > 0 || to < d.total ? `-${Math.round(from)}-${Math.round(to)}` : '') + '.mp4'));
  const aud = path.join(tmp, 'ses.m4a');
  if (mixAudio(d, audio, from, to, aud)) {
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', silent, '-i', aud, '-c:v', 'copy', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', out]);
  } else {
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', silent, '-c', 'copy', '-movflags', '+faststart', out]);
  }
  console.log('Video:', out);
})().catch(e => { console.error(e); process.exit(1); });
