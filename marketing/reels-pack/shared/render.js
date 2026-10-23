// Usage:
//   node shared/render.js <reel-dir> stills <t1,t2,...> [out-dir]
//   node shared/render.js <reel-dir> video <out.mp4> <duration-seconds>
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const FPS = 30;
(async () => {
  const [dir, mode, arg, extra] = process.argv.slice(2);
  const reel = path.resolve(dir);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(reel, 'index.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  if (mode === 'stills') {
    const out = extra || reel;
    for (const t of arg.split(',').map(Number)) {
      await page.evaluate(t => render(t), t);
      await page.screenshot({ path: path.join(out, `still_${t}.png`) });
    }
  } else {
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', arg],
      { stdio: ['pipe', 'inherit', 'inherit'] });
    const N = Math.round(FPS * Number(extra));
    for (let f = 0; f < N; f++) {
      await page.evaluate(t => render(t), f / FPS);
      const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
