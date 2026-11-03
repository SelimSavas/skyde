// node shot.mjs <page.html> <outdir> : her [data-shot] öğesini PNG olarak kaydeder
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
const { chromium } = createRequire(import.meta.url)("playwright");
const [page_, outdir, only] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1400 }, deviceScaleFactor: 1 });
page.on("pageerror", e => console.error("PAGE ERROR", e.message));
await page.goto(pathToFileURL(path.resolve(page_)).href);
await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.fonts].map(f => f.load().catch(() => {}))); });
await page.waitForTimeout(300);
for (const el of await page.$$("[data-shot]")) {
  const name = await el.getAttribute("data-shot");
  if (only && !name.includes(only)) continue;
  await el.screenshot({ path: path.join(outdir, name + ".png"), omitBackground: name.startsWith("t_") });
  console.log("saved", name);
}
await browser.close();
