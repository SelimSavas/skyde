// Usage: node render.mjs <timeline.json> <out.mp4> [fps] [--still t1,t2,... outdir]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const [tlPath, out, fpsArg, stillArg, stillDir] = process.argv.slice(2);
const tl = JSON.parse(readFileSync(tlPath, "utf8"));
const fps = Number(fpsArg || 30);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(here, "index.html")).href);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(async () => { await Promise.all([...document.fonts].map(f => f.load())); });
await page.evaluate(tl => window.setup(tl), tl);

if (stillArg === "--still") {
  for (const t of out.split(",").map(Number)) {
    await page.evaluate(t => window.render(t), t);
    await page.screenshot({ path: path.join(stillDir, `still_${t.toFixed(2)}.png`) });
  }
  await browser.close();
  process.exit(0);
}

const frames = Math.ceil(tl.total * fps);
const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-i", "-",
  "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
const t0 = Date.now();
for (let i = 0; i < frames; i++) {
  await page.evaluate(t => window.render(t), i / fps);
  const buf = await page.screenshot({ type: "png" });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
  if (i % 150 === 0) console.error(`frame ${i}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
ff.stdin.end();
await new Promise(r => ff.on("close", r));
await browser.close();
