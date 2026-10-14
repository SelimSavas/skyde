/*
 * Ortak animasyon motoru.
 *
 * Her kare yalnızca zamana (t, saniye) bağlı saf bir çizimdir: aynı t → aynı görüntü.
 * Oynatıcıda ileri-geri sarmak da, render.mjs ile kare kare video dökmek de bu sayede
 * aynı kodla çalışır. Rastgelelik gereken her yerde tohumlu hash kullanılır.
 */
(function (root) {
  'use strict';

  const W = 1920;
  const H = 1080;

  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, p) => a + (b - a) * p;

  const ease = {
    linear: (p) => p,
    inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    out: (p) => 1 - Math.pow(1 - p, 3),
    in: (p) => p * p * p,
    back: (p) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
    },
    expo: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  };

  // a→b aralığında 0→1 ilerleme
  const progress = (t, a, b, fn = ease.inOut) => fn(clamp((t - a) / (b - a)));

  // [a, b] penceresinde görünen bir öğenin opaklığı (giriş/çıkış süreleriyle)
  const vis = (t, a, b, fadeIn = 0.4, fadeOut = 0.4) => {
    if (t < a || t > b) return 0;
    const i = fadeIn > 0 ? clamp((t - a) / fadeIn) : 1;
    const o = fadeOut > 0 ? clamp((b - t) / fadeOut) : 1;
    return Math.min(i, o);
  };

  // Tohumlu tamsayı hash → [0, 1)
  const hash = (i, seed = 0) => {
    let h = Math.imul((i | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((seed | 0) + 0x632be5ab, 0xc2b2ae35);
    h ^= h >>> 15;
    h = Math.imul(h, 0x2c1b3c6d);
    h ^= h >>> 12;
    h = Math.imul(h, 0x297a2d39);
    h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  };

  // Yumuşak 1B değer gürültüsü → [0, 1)
  const noise = (x, seed = 0) => {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return lerp(hash(i, seed), hash(i + 1, seed), u);
  };

  const rgba = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  // Kurulu değilse tarayıcı sıradaki yazı tipine düşer; hepsi Türkçe harfleri destekler.
  const FONTS = {
    display: '"Inter Display", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    sans: '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    serif: '"Caladea", Georgia, Cambria, "DejaVu Serif", serif',
    mono: '"DejaVu Sans Mono", Menlo, Consolas, monospace',
  };

  const font = (size, family = 'sans', weight = 400, italic = false) =>
    `${italic ? 'italic ' : ''}${weight} ${size}px ${FONTS[family] || family}`;

  function applyText(ctx, o) {
    ctx.font = font(o.size ?? 48, o.family ?? 'sans', o.weight ?? 400, o.italic);
    ctx.letterSpacing = `${o.spacing ?? 0}px`;
  }

  // Tek satır yazı; çizilen genişliği döndürür.
  function text(ctx, str, x, y, o = {}) {
    const alpha = o.alpha ?? 1;
    if (alpha <= 0.002) return 0;
    ctx.save();
    ctx.globalAlpha *= alpha;
    applyText(ctx, o);
    ctx.textAlign = o.align ?? 'center';
    ctx.textBaseline = o.baseline ?? 'middle';
    if (o.glow) {
      ctx.shadowColor = o.glow;
      ctx.shadowBlur = o.glowBlur ?? 24;
    }
    ctx.fillStyle = o.color ?? '#fff';
    // harf aralığı sonda da boşluk bırakır; ortalarken telafi et
    const dx = o.spacing && (o.align ?? 'center') === 'center' ? o.spacing / 2 : 0;
    ctx.fillText(str, x + dx, y);
    const w = ctx.measureText(str).width;
    ctx.restore();
    return w;
  }

  function measure(ctx, str, o = {}) {
    ctx.save();
    applyText(ctx, o);
    const w = ctx.measureText(str).width;
    ctx.restore();
    return w;
  }

  // Farklı biçimli parçaları ortak taban çizgisinde yan yana yazar.
  function runs(ctx, parts, x, y, o = {}) {
    const widths = parts.map(([s, po]) => measure(ctx, s, po));
    const total = widths.reduce((a, b) => a + b, 0);
    let cx = o.align === 'left' ? x : o.align === 'right' ? x - total : x - total / 2;
    parts.forEach(([s, po], i) => {
      text(ctx, s, cx, y, { ...po, align: 'left', baseline: 'alphabetic', alpha: (po.alpha ?? 1) * (o.alpha ?? 1) });
      cx += widths[i];
    });
    return total;
  }

  function wrap(ctx, str, maxWidth, o) {
    ctx.save();
    applyText(ctx, o);
    const lines = [];
    for (const para of str.split('\n')) {
      let line = '';
      for (const word of para.split(' ')) {
        const test = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(test).width > maxWidth) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      lines.push(line);
    }
    ctx.restore();
    return lines;
  }

  // Çok satırlı paragraf. valign: 'top' | 'middle' | 'bottom' (y'ye göre)
  function paragraph(ctx, str, x, y, maxWidth, o = {}) {
    const lines = wrap(ctx, str, maxWidth, o);
    const lh = o.lineHeight ?? (o.size ?? 48) * 1.3;
    const span = (lines.length - 1) * lh;
    const top = o.valign === 'middle' ? y - span / 2 : o.valign === 'bottom' ? y - span : y;
    lines.forEach((l, i) => text(ctx, l, x, top + i * lh, o));
    return { lines, top, lineHeight: lh };
  }

  // Alt yazılar: [[başlangıç, bitiş, metin], ...]
  function captions(ctx, t, list, o = {}) {
    for (const [a, b, str] of list) {
      const al = vis(t, a, b, 0.35, 0.35);
      if (al <= 0) continue;
      // okunurluk için alttan hafif karartma
      ctx.save();
      ctx.globalAlpha *= al;
      const g = ctx.createLinearGradient(0, H - 260, 0, H);
      g.addColorStop(0, 'rgba(3,5,10,0)');
      g.addColorStop(1, 'rgba(3,5,10,0.72)');
      ctx.fillStyle = g;
      ctx.fillRect(0, H - 260, W, 260);
      ctx.restore();
      const rise = (1 - ease.out(clamp((t - a) / 0.5))) * 14;
      paragraph(ctx, str, W / 2, (o.y ?? 990) + rise, o.width ?? 1500, {
        size: o.size ?? 40,
        family: 'serif',
        color: o.color ?? '#efe8da',
        alpha: al,
        lineHeight: 54,
        valign: 'bottom',
      });
    }
  }

  // Işıma: renkten saydama radyal geçiş
  function glow(ctx, x, y, r, color, alpha = 1) {
    if (alpha <= 0.002 || r <= 0) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(0.35, rgba(color, alpha * 0.35));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  /*
   * Film: sahneleri zaman çizelgesine yerleştirir.
   * Her sahne { start, end, title, draw(ctx, yerelZaman, t) } biçimindedir.
   * Sahne geçişleri arka plana kararak yapılır (fade through dark).
   */
  function film(def) {
    const fade = def.fade ?? 0.45;
    return {
      ...def,
      sceneAt(t) {
        return def.scenes.find((s) => t >= s.start && t < s.end) ?? def.scenes[def.scenes.length - 1];
      },
      draw(ctx, t) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        def.background(ctx, t);
        for (const s of def.scenes) {
          if (t < s.start || t >= s.end) continue;
          ctx.save();
          s.draw(ctx, t - s.start, t);
          ctx.restore();
          const a = vis(t, s.start, s.end, s.fadeIn ?? fade, s.fadeOut ?? fade);
          if (a < 1) {
            ctx.save();
            ctx.globalAlpha = 1 - a;
            def.background(ctx, t);
            ctx.restore();
          }
        }
        ctx.restore();
      },
    };
  }

  root.Engine = {
    W, H, clamp, lerp, ease, progress, vis, hash, noise, rgba, FONTS, font,
    text, measure, runs, wrap, paragraph, captions, glow, roundRect, film,
  };
})(typeof window !== 'undefined' ? window : globalThis);
