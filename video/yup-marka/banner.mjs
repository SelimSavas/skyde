// YouTube banner'ını PNG olarak üretir: node video/yup-marka/banner.mjs → video/yup-marka/youtube-banner.png
// ve güvenli alan önizlemeleri (masaüstü şeridi, telefon) video/out/preview altına.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
// playwright: render.mjs gibi önce yerel, yoksa global kurulum
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); }
const { chromium } = pw;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(pathToFileURL(path.join(here, 'banner.html')).href);
const url = await page.evaluate(() => window.BANNER_READY);
const end = await page.evaluate(() => window.__chipsEnd);
await browser.close();
const out = path.join(here, 'youtube-banner.png');
fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
console.log(out, 'seri etiketlerinin bittiği x =', Math.round(end), '(güvenli alan sonu 2053)');
