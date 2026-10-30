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
   * Zaman çizelgesi. Her sahne { id, base, stretch, holds } ile tanımlanır:
   *   base     koreografi süresi; sahne çizimi hep bu zamanı görür
   *   stretch  [[a, b, k], ...]  koreografinin [a, b] aralığı k kat yavaş oynar
   *   holds    [[f, e], ...]     koreografi f anında e saniye durur
   * at(sahne, x) koreografi anını mutlak gerçek zamana çevirir (o kareye ilk varış); ses notası bunu kullanır.
   */
  function pieces({ base, stretch = [], holds = [] }) {
    const segs = stretch.filter(([a, b, k]) => b > a && k > 0).sort((x, y) => x[0] - y[0]);
    for (let i = 1; i < segs.length; i++) {
      if (segs[i][0] < segs[i - 1][1] - 1e-9) throw new Error('Yavaşlatma aralıkları çakışıyor');
    }
    for (const [f, e] of holds) if (!Number.isFinite(f) || !Number.isFinite(e)) throw new Error(`Geçersiz bekleme: [${f}, ${e}]`);
    const hs = holds.filter((h) => h[1] > 0).map(([f, e]) => ({ c: clamp(f, 0, base), e }));
    const cuts = [...new Set([0, base, ...segs.flatMap(([a, b]) => [clamp(a, 0, base), clamp(b, 0, base)]), ...hs.map((h) => h.c)])].sort((x, y) => x - y);
    const factor = (c) => (segs.find(([a, b]) => c >= a && c < b) ?? [0, 0, 1])[2];
    const out = [];
    cuts.forEach((c, i) => {
      const e = hs.filter((h) => h.c === c).reduce((n, h) => n + h.e, 0);
      if (e > 0) out.push({ type: 'hold', c, len: e });
      if (i < cuts.length - 1) {
        const k = factor((c + cuts[i + 1]) / 2);
        out.push({ type: 'run', c0: c, c1: cuts[i + 1], k, len: (cuts[i + 1] - c) * k });
      }
    });
    return out;
  }

  function timeline(defs) {
    let cursor = 0;
    const scenes = defs.map((d) => {
      const ps = pieces(d);
      const s = { ...d, pieces: ps, start: cursor, end: cursor + ps.reduce((n, p) => n + p.len, 0) };
      cursor = s.end;
      return s;
    });
    const byId = Object.fromEntries(scenes.map((s) => [s.id, s]));
    const scene = (id) => {
      if (!byId[id]) throw new Error(`Bilinmeyen sahne: ${id}`);
      return byId[id];
    };
    // gerçek yerel zaman → koreografi zamanı
    const warp = (s, r) => {
      for (const p of s.pieces) {
        if (r < p.len) return p.type === 'hold' ? p.c : p.c0 + r / p.k;
        r -= p.len;
      }
      return s.base;
    };
    // koreografi anı → mutlak gerçek zaman. inclusive: o andaki bekleme de sayılır (vuruş sonu için)
    const at = (id, x, inclusive = false) => {
      const s = scene(id);
      if (x < 0) return s.start + x;
      let r = 0;
      for (const p of s.pieces) {
        if (p.type === 'hold') {
          if (p.c < x || (inclusive && p.c === x)) r += p.len;
          else if (p.c > x) break;
        } else {
          if (p.c0 >= x) {
            if (!inclusive || p.c0 > x) break;
            continue;
          }
          r += (Math.min(x, p.c1) - p.c0) * p.k;
        }
      }
      if (x > s.base) r += x - s.base;
      return s.start + r;
    };
    const span = (id, a, b) => at(id, b) - at(id, a);
    return { scenes, duration: cursor, scene, warp, at, span };
  }

  // Seslendirme öbekleri: TTS her cümleyi noktalama işaretlerinden böler, araya bu durakları (sn) koyar.
  // narrate.mjs de aynı bölmeyi kullanır; böylece görüntü, cümlenin içindeki bir sözcüğe (cue) bağlanabilir.
  const PAUSES = { ',': 0.35, ';': 0.45, ':': 0.45, '—': 0.4, '.': 0.6, '!': 0.6, '?': 0.65, '…': 0.65 };
  const pauseAfter = (ph) => PAUSES[ph.slice(-1)] ?? 0.3;
  function phrases(str) {
    return (str.match(/[^,;:.!?…—]+(?:[,;:.!?…—]+|$)/g) ?? []).map((p) => p.trim()).filter((p) => /[\p{L}\p{N}]/u.test(p));
  }

  /*
   * Seslendirme planı: anlatıcı tempoyu belirler.
   * beats = { id: [sahne, başlangıç, bitiş, donma] } koreografi zamanında, oynatma sırasıyla.
   * Her satır kendi vuruşunun başından itibaren sırayla okunur. Bir vuruş, satırları ve ardından
   * kısa bir nefes payı bitmeden bitmez: donma anı olan vuruşta görüntü o karede bekler, olmayanda
   * animasyon yavaşlar. pauses[vuruş], anlatıcı sustuktan sonra o vuruşta eklenen durak (sn).
   * build(holds, slow) bu kararlarla zaman çizelgesini kurar.
   * voice (narrate.mjs'in ürettiği voice.js) ölçülmüş süreleri verir; yoksa süreler tahmin edilir.
   * cue(satır, k) o satırın k. öbeğinin başladığı mutlak gerçek zamandır.
   */
  function narration({ build, beats, lines: raw, voice, pauses = {}, cps = 12, gap = 0.45, breath = 0.9 }) {
    const lines = raw.map((l) => ({ ...l, say: l.say ?? l.text })).map((l) => ({ ...l, phrases: phrases(l.say) }));
    const order = Object.keys(beats);
    const ids = new Set();
    for (const l of lines) {
      if (!beats[l.beat]) throw new Error(`Bilinmeyen vuruş: ${l.beat}`);
      if (ids.has(l.id)) throw new Error(`Aynı satır kimliği iki kez: ${l.id}`);
      ids.add(l.id);
    }
    lines.forEach((l, i) => {
      if (i && order.indexOf(l.beat) < order.indexOf(lines[i - 1].beat)) throw new Error(`${l.id} satırı vuruş sırasının dışında`);
    });
    // Ses yokken öbek süreleri harf sayısından tahmin edilir
    const estimate = (l) => {
      const marks = [];
      let t = 0;
      l.phrases.forEach((ph, k) => {
        marks.push(t);
        t += ph.length / cps + (k < l.phrases.length - 1 ? pauseAfter(ph) : 0);
      });
      return { dur: t, marks };
    };
    const spanOf = (tl, id) => {
      const [scene, a, b] = beats[id];
      return { start: tl.at(scene, a), end: tl.at(scene, b, true) };
    };
    const placeAll = (tl, durations) => {
      let cursor = -Infinity;
      return lines.map((l, i) => {
        const at = Math.max(cursor + gap, spanOf(tl, l.beat).start + (l.offset > 0 ? l.offset : 0));
        cursor = at + durations[i];
        return { ...l, at, dur: durations[i] };
      });
    };
    const plan = (durations) => {
      const holds = {};
      const slow = {};
      // satırı olmayan vuruşta ek durak doğrudan donma anında beklemedir
      for (const id of order) {
        if (!(pauses[id] > 0) || lines.some((l) => l.beat === id)) continue;
        if (beats[id][3] == null) throw new Error(`${id}: satırı olmayan vuruşta durak için donma anı gerekir`);
        holds[id] = pauses[id];
      }
      let tl = build(holds, slow);
      for (const id of order) {
        const mine = lines.map((l, i) => (l.beat === id ? i : -1)).filter((i) => i >= 0);
        if (!mine.length) continue;
        const placed = placeAll(tl, durations);
        const need = Math.max(...mine.map((i) => placed[i].at + placed[i].dur)) + breath + (pauses[id] ?? 0);
        const b = spanOf(tl, id);
        if (need <= b.end + 1e-6) continue;
        if (beats[id][3] != null) {
          holds[id] = (holds[id] ?? 0) + (need - b.end);
        } else {
          const len = b.end - b.start;
          slow[id] = (slow[id] ?? 1) * ((len + need - b.end) / len);
        }
        tl = build(holds, slow);
      }
      return { timeline: tl, holds, slow, placed: placeAll(tl, durations) };
    };
    // voice.js yalnızca aynı metinle ve aynı planla üretildiyse kullanılır
    const matches = voice && voice.lines.length === lines.length && voice.lines.every((v, i) => v.id === lines[i].id && v.say === lines[i].say);
    let result = matches ? plan(voice.lines.map((v) => v.dur)) : null;
    const fresh = Boolean(result) && result.placed.every((p, i) => Math.abs(p.at - voice.lines[i].at) < 0.005);
    if (voice && !fresh) console.warn('voice.js seslendirme metniyle ya da zamanlamasıyla uyuşmuyor; narrate.mjs ile yeniden üretin.');
    if (!fresh) result = plan(lines.map((l) => estimate(l).dur));

    // Öbek başları: ölçülmüşse voice.js'ten, değilse tahminin satır süresine ölçeklenmiş hâli
    const byId = {};
    result.placed.forEach((p, i) => {
      const v = fresh ? voice.lines[i].marks : null;
      const est = estimate(p);
      const marks = v && v.length === p.phrases.length ? v : est.marks.map((m) => (m * p.dur) / (est.dur || 1));
      byId[p.id] = { ...p, marks };
    });
    const warned = new Set();
    const cue = (id, k = 0) => {
      const l = byId[id];
      if (!l) throw new Error(`Bilinmeyen seslendirme satırı: ${id}`);
      if (k < 0 || k >= l.marks.length) {
        if (!warned.has(`${id}/${k}`)) console.warn(`${id} satırında ${k}. öbek yok (${l.marks.length} öbek)`);
        warned.add(`${id}/${k}`);
        k = clamp(k, 0, l.marks.length - 1);
      }
      return l.at + l.marks[k];
    };
    const end = (id) => {
      if (!byId[id]) throw new Error(`Bilinmeyen seslendirme satırı: ${id}`);
      return byId[id].at + byId[id].dur;
    };
    return { lines, beats, plan, ...result, fresh, stale: Boolean(voice) && !fresh, voice: fresh ? voice : null, cue, end };
  }

  /*
   * Film: zaman çizelgesindeki sahneleri çizer. Her sahne { id, title, draw(ctx, koreografiZamanı, t) } biçimindedir.
   * Sahne geçişleri arka plana kararak yapılır (fade through dark).
   */
  function film(def) {
    const fade = def.fade ?? 0.45;
    const tl = def.timeline;
    return {
      ...def,
      scenes: tl.scenes,
      duration: tl.duration,
      sceneAt(t) {
        return tl.scenes.find((s) => t >= s.start && t < s.end) ?? tl.scenes[tl.scenes.length - 1];
      },
      draw(ctx, t) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        def.background(ctx, t);
        for (const s of tl.scenes) {
          if (t < s.start || t >= s.end) continue;
          ctx.save();
          s.draw(ctx, tl.warp(s, t - s.start), t);
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
    text, measure, runs, wrap, paragraph, glow, roundRect, timeline, PAUSES, phrases, narration, film,
  };
})(typeof window !== 'undefined' ? window : globalThis);
