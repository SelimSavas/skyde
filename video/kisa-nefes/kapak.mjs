// Kapak: filmin kış sabahı karesi (altyazısız, ?kapak) + başlık. node video/kisa-nefes/kapak.mjs [t]
// Çıktı: video/kisa-nefes/kapak.jpg (1080×1920)
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
const t = Number(process.argv[2] ?? 6.9);
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', (e) => console.error('Sayfa hatası:', e.message));
await page.goto(`${pathToFileURL(path.join(here, 'index.html')).href}?kayit&kapak`);
await page.waitForFunction(() => typeof window.__frame === 'function');
await page.evaluate(() => document.fonts.ready);
const url = await page.evaluate(async (tt) => {
  const src = window.__frame(tt, 'image/png');
  const im = new Image();
  im.src = src;
  await im.decode();
  const c = document.createElement('canvas');
  c.width = 1080;
  c.height = 1920;
  const x = c.getContext('2d');
  x.drawImage(im, 0, 0, 1080, 1920);
  // üstte yumuşak koyulaştırma: başlık her yerde okunsun
  const g = x.createLinearGradient(0, 120, 0, 900);
  g.addColorStop(0, 'rgba(10,25,45,0.45)');
  g.addColorStop(1, 'rgba(10,25,45,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 1080, 900);
  const line = (s, y, size, col, rot) => {
    x.save();
    x.translate(540, y);
    x.rotate(rot);
    x.font = `800 ${size}px "Baloo 2", Nunito, sans-serif`;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.lineJoin = 'round';
    x.shadowColor = 'rgba(0,0,0,0.5)';
    x.shadowBlur = 30;
    x.shadowOffsetY = 10;
    x.lineWidth = size * 0.16;
    x.strokeStyle = '#14202e';
    x.strokeText(s, 0, 0);
    x.shadowColor = col === '#ffffff' ? 'transparent' : col;
    x.shadowBlur = 30;
    x.shadowOffsetY = 0;
    x.fillStyle = col;
    x.fillText(s, 0, 0);
    x.restore();
  };
  line('BU DUMAN', 330, 168, '#ffffff', -0.03);
  line('DEĞİL!', 500, 196, '#ff9a76', -0.03);
  return c.toDataURL('image/jpeg', 0.92);
}, t);
const out = path.join(here, 'kapak.jpg');
fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
await browser.close();
console.log(out);
