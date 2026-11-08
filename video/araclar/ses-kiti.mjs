// YUP ses kitini dinlenebilir dosyalara döker (efekt ve ortamlar tek tek tepe ayarlı, müzikler aynı yükseklikte): video/ses/kit/*.mp3, video/ses/ses-katalogu.mp3 (bütün efektler sırayla)
// ve video/ses/kit/olcum.json (her müzik yatağının ve ortamın ham LUFS değeri; seviye ayarı için).
//   node video/araclar/ses-kiti.mjs
// Sesler yup-marka/ses.js'te tanımlı; burada yalnızca video/ses/kit.html'deki listeye göre hesaplanır.
import { execFileSync, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = (() => {
  try {
    return require('playwright');
  } catch {
    return require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
  }
})();
const V = path.resolve(here, '..');
const out = path.join(V, 'ses', 'kit');
fs.mkdirSync(out, { recursive: true });
const tmp = fs.mkdtempSync(path.join(process.env.TMPDIR ?? '/tmp', 'seskiti-'));

const b = await chromium.launch({ args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage();
p.on('pageerror', (e) => console.log('pageerror:', e.message));
await p.goto('file://' + path.join(V, 'ses', 'kit.html'));
await p.waitForFunction(() => document.title === 'hazir');
const kit = await p.evaluate(() => window.KIT);
const olcum = {};
for (const grup of ['sfx', 'ortam', 'muzik']) {
  const raw = grup !== 'sfx' ? await p.evaluate((g) => window.renderGroup(g, true), grup) : null;
  if (raw) {
    for (const [ad, b64] of Object.entries(raw.files)) {
      const f = path.join(tmp, ad + '-ham.wav');
      fs.writeFileSync(f, Buffer.from(b64, 'base64'));
      const r = (() => {
        try {
          return execFileSync('bash', ['-c', `ffmpeg -hide_banner -nostats -i "${f}" -af ebur128 -f null - 2>&1 | grep -E "^ +I:" | tail -1`]).toString();
        } catch {
          return '';
        }
      })();
      const m = /I:\s+(-?[\d.]+)/.exec(r);
      olcum[ad] = m ? Number(m[1]) : null;
    }
  }
  const res = await p.evaluate((g) => window.renderGroup(g, false, g !== 'muzik'), grup);
  for (const [ad, b64] of Object.entries(res.files)) {
    const wav = path.join(tmp, ad + '.wav');
    fs.writeFileSync(wav, Buffer.from(b64, 'base64'));
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', wav, '-codec:a', 'libmp3lame', '-q:a', '2', path.join(out, ad + '.mp3')]);
  }
  console.log(grup, Object.keys(res.files).length, 'dosya');
}
await b.close();
fs.writeFileSync(path.join(out, 'olcum.json'), JSON.stringify(olcum, null, 2));
// katalog: bütün efektler sırayla, aralarında 0,7 sn sessizlik
const sfx = kit.filter((k) => k.grup === 'sfx').map((k) => path.join(out, k.ad + '.mp3'));
const list = path.join(tmp, 'liste.txt');
const sil = path.join(tmp, 'sessiz.mp3');
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', '0.7', '-codec:a', 'libmp3lame', '-q:a', '2', sil]);
fs.writeFileSync(list, sfx.flatMap((f) => [`file '${f}'`, `file '${sil}'`]).join('\n'));
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-codec:a', 'libmp3lame', '-q:a', '2', path.join(V, 'ses', 'ses-katalogu.mp3')]);
// katalogdaki zamanlar
let t = 0;
const zaman = [];
for (const k of kit.filter((k) => k.grup === 'sfx')) {
  zaman.push(`${t.toFixed(1).padStart(5)} sn  ${k.ad}`);
  t += k.sure + 0.7;
}
fs.writeFileSync(path.join(V, 'ses', 'ses-katalogu.txt'), zaman.join('\n') + '\n');
console.log('ölçüm (ham LUFS):', olcum);
fs.rmSync(tmp, { recursive: true, force: true });
