// Usage: node render_carousel.js <out_dir>   → slide-1.png … slide-7.png (1080×1350)
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const out = process.argv[2] || path.join(__dirname, 'carousel');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.goto('file://' + path.join(__dirname, 'carousel.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  for (let n = 1; n <= 7; n++) {
    await page.evaluate(n => show(n), n);
    await page.screenshot({ path: path.join(out, `slide-${n}.png`) });
  }
  await browser.close();
})();
