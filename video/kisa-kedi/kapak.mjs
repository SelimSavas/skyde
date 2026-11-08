// Kapak: ChatGPT kapak görseli (lup-10a-kapak-kedi) + başlık (Baloo 2). node video/kisa-kedi/kapak.mjs
// Çıktı: video/kisa-kedi/kapak.jpg (1080×1620)
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { execSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let pw;
try {
  pw = require('playwright');
} catch {
  pw = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
}
const browser = await pw.chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1620 } });
page.on('pageerror', (e) => console.error('Sayfa hatası:', e.message));
await page.goto(`${pathToFileURL(path.join(here, 'index.html')).href}?kayit&kapak`);
await page.waitForFunction(() => typeof window.__frame === 'function');
await page.evaluate(() => document.fonts.ready);
const url = await page.evaluate(async () => {
  const im = new Image();
  im.src = '../lup/gorseller/lup-10a-kapak-kedi.webp';
  await im.decode();
  const c = document.createElement('canvas');
  c.width = 1080;
  c.height = 1620;
  const x = c.getContext('2d');
  x.drawImage(im, 0, 0, 1080, 1620);
  const line = (s, y, size, col, rot) => {
    x.save();
    x.translate(540, y);
    x.rotate(rot);
    x.font = `800 ${size}px "Baloo 2", Nunito, sans-serif`;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.lineJoin = 'round';
    x.shadowColor = 'rgba(60,35,15,0.35)';
    x.shadowBlur = 24;
    x.shadowOffsetY = 8;
    x.lineWidth = size * 0.26;
    x.strokeStyle = '#fbf3e2';
    x.strokeText(s, 0, 0);
    x.shadowColor = 'transparent';
    x.lineWidth = size * 0.05;
    x.strokeStyle = '#2a1c14';
    x.strokeText(s, 0, 0);
    x.fillStyle = col;
    x.fillText(s, 0, 0);
    x.restore();
  };
  line('Kedin,', 230, 170, '#0f766e', -0.04);
  line('psikoloğun!', 420, 168, '#d2452f', -0.04);
  // amber kalem çizgisi
  x.save();
  x.strokeStyle = '#f2a516';
  x.lineWidth = 14;
  x.lineCap = 'round';
  x.beginPath();
  x.moveTo(300, 540);
  x.quadraticCurveTo(560, 515, 800, 530);
  x.stroke();
  x.restore();
  return c.toDataURL('image/jpeg', 0.92);
});
const out = path.join(here, 'kapak.jpg');
fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
await browser.close();
console.log(out);
