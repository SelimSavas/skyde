// Kullanım: node shot.mjs <html> <çıktı.png> <genişlik> <yükseklik> [hash]
import { createRequire } from 'module';
import { execSync } from 'child_process';
import path from 'path';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); }
const [html, out, w, h, hash = ''] = process.argv.slice(2);
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
page.on('console', m => console.log('[page]', m.text()));
page.on('pageerror', e => console.log('[err]', e.message));
await page.goto('file://' + path.resolve(html) + (hash ? '#' + hash : ''));
await page.waitForFunction(() => window.__done === true, null, { timeout: 30000 });
await page.screenshot({ path: out, clip: { x: 0, y: 0, width: +w, height: +h } });
await browser.close();
