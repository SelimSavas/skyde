// Bir bölümün filmini Node içinde yükler (altyazı, bölüm zamanları, duman testi için).
// Betikleri bölümün index.html'indeki sırayla yükler (oynatıcı ve ses motoru hariç); index.html yoksa eski sabit liste.
// Tarayıcıya özgü nesneler (Image, document.fonts) için küçük taklitler kurar.
const fs = require('fs'), vm = require('vm'), path = require('path');

module.exports = function yukle(dir) {
  global.window = global;
  global.Image ??= class { constructor() { this.width = 10; this.height = 10; } decode() { return Promise.resolve(); } };
  global.document ??= { createElement: () => ({}), head: { appendChild() {} }, fonts: { load: () => Promise.resolve() } };
  const html = path.join(dir, 'index.html');
  let list = ['../shared/engine.js', 'assets.js', 'narration.js', 'voice.js', 'film.js'];
  if (fs.existsSync(html)) {
    list = [...fs.readFileSync(html, 'utf8').matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((f) => !/player\.js|synth\.js/.test(f));
  }
  for (const f of list) {
    const p = path.join(dir, f);
    if (fs.existsSync(p)) vm.runInThisContext(fs.readFileSync(p, 'utf8'), { filename: f });
  }
  return window.FILM;
};
