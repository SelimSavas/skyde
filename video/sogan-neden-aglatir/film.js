/*
 * Tabağındaki Bilim · Bölüm 1 — Soğan Neden Ağlatır?
 *
 * Bölümler: soğuk açılış · selam · küçük deney · büyüteç (hücre, iki enzim, ağlatan gaz) · göz ·
 * soğan bunu neden yapıyor · her soğan aynı değil · en taze araştırma (Cornell 2025) · bu akşam dene ·
 * efsane mi gerçek mi · kapanış.
 * Karakter, mutfak, büyüteç, mikro dünya ve soğan kareleri Gemini görselleridir (assets.js, build_assets.py);
 * moleküller, hücreler, göz kesiti, grafikler ve kartlar burada kodla çizilir. Karakterin başı ağız ve göz
 * sayfalarından kurulur: konuşurken ağız şekli metindeki seslerden, göz kırpma tohumlu zamanlardan gelir.
 * Kayıt yokken zamanlama metinden tahmin edilir; kayıt gelince (voice.js) zamanlama sese oturur.
 * Videoda altyazı yoktur (YouTube altyazısı ayrı dosyadır). Kaynaklar: kaynaklar.md.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { W, H, clamp, lerp, ease, progress, vis, hash, noise, rgba, text, measure, paragraph, glow, roundRect } = E;

  const C = {
    navy: '#1b2440',
    deep: '#121a30',
    gold: '#ffb547',
    cream: '#f3ede1',
    paper: '#fbf6ec',
    terra: '#d9653b',
    sage: '#8db596',
    tomato: '#e5484d',
    copper: '#c27c4e',
    ink: '#2b1f1a',
    muted: '#7d7468',
    skinOn: '#f0e6d2',
    onion: '#c9763f',
    onionDark: '#8f4a22',
    flesh: '#fbf3df',
    fleshRing: '#e9dcb8',
    tear: '#5aa9ff',
    gas: '#f2d675',
    sulfur: '#ffd34d',
    enzyme: '#7c6cf0',
    catcher: '#4fb38a',
  };
  const NAVY = [27, 36, 64];
  const GOLD = [255, 181, 71];
  const TEAR = [90, 169, 255];
  const GAS = [242, 214, 117];
  const RED = [229, 72, 77];
  const SAGE = [141, 181, 150];

  // ---------------------------------------------------------------------------
  // Görseller
  // ---------------------------------------------------------------------------
  const A = window.ASSETS ?? {};
  const IMG = {};
  const loads = [];
  for (const [k, v] of Object.entries(A)) {
    const im = new Image();
    im.src = v.src;
    IMG[k] = im;
    loads.push(im.decode ? im.decode().catch(() => {}) : Promise.resolve());
  }
  window.FILM_READY = Promise.all(loads);

  function pic(ctx, k, x, y, w, h, a = 1) {
    if (a <= 0.002 || !IMG[k]) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.drawImage(IMG[k], x, y, w ?? A[k].w, h ?? A[k].h);
    ctx.restore();
  }
  // Görseli merkezi (cx, cy) olacak biçimde, yüksekliği h olarak çizer
  function picC(ctx, k, cx, cy, h, a = 1, rot = 0) {
    if (a <= 0.002 || !IMG[k]) return;
    const w = (A[k].w * h) / A[k].h;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(cx, cy);
    if (rot) ctx.rotate(rot);
    ctx.drawImage(IMG[k], -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  // Tuvali kaplayan görsel: zoom ≥ 1, (fx, fy) 0..1 odak noktası
  function cover(ctx, k, zoom = 1, fx = 0.5, fy = 0.5, a = 1) {
    if (a <= 0.002 || !IMG[k]) return;
    const s = Math.max(W / A[k].w, H / A[k].h) * zoom;
    const w = A[k].w * s;
    const h = A[k].h * s;
    pic(ctx, k, (W - w) * fx, (H - h) * fy, w, h, a);
  }

  // ---------------------------------------------------------------------------
  // Sahneler ve vuruşlar (vuruş uzunluğu satırın okuma süresinden çıkar)
  // ---------------------------------------------------------------------------
  const SCRIPT = window.NARRATION ?? { lines: [] };
  const sayOf = Object.fromEntries(SCRIPT.lines.map((l) => [l.id, l.say]));
  // Kayıt varsa (voice.js) satırın gerçek süresi, yoksa harf sayısından tahmin (anlatıcının ölçülmüş hızına yakın)
  const CPS = 18;
  const recorded = Object.fromEntries((window.VOICE?.lines ?? []).filter((v) => v.say === sayOf[v.id]).map((v) => [v.id, v.dur]));
  const estimate = (id) => {
    if (recorded[id]) return recorded[id] + 0.5;
    const ph = E.phrases(sayOf[id] ?? '');
    return ph.reduce((n, p, k) => n + p.length / CPS + (k < ph.length - 1 ? E.PAUSES[p.slice(-1)] ?? 0.3 : 0), 0) + 0.5;
  };
  // animasyon payı (satırdan sonra görüntünün kalacağı ek süre)
  const EXTRA = {
    'a-cut': 0.6, 'a-tears': 0.8, 'a-question': 2.4,
    's-hello': 0.6, 's-promise': 1.0,
    'd-whole': 0.6, 'd-knife': 1.2,
    'b-zoom': 1.6, 'b-cells': 1.0, 'b-rooms': 1.0, 'b-wall': 1.4, 'b-chain': 1.2, 'b-second': 1.6, 'b-name': 1.2, 'b-nobel': 1.2,
    'g-rise': 1.2, 'g-cornea': 1.0, 'g-signal': 1.0, 'g-reflex': 1.4,
    'n-why': 1.0, 'n-defense': 1.4, 'n-garlic': 1.2, 'n-flavor': 1.2,
    'k-measure': 1.0, 'k-vary': 1.4,
    'c-study': 0.8, 'c-press': 1.4, 'c-burst': 1.4, 'c-result': 1.4, 'c-irony': 1.4,
    'p-intro': 0.6, 'p-knife': 1.0, 'p-slow': 1.0, 'p-air': 1.0, 'p-goggles': 1.4, 'p-cook': 1.4,
    'e-intro': 1.0, 'e-fridge': 1.2, 'e-bread': 1.2, 'e-tearless': 1.4,
    'z-sum': 1.2, 'z-tonight': 1.0, 'z-next': 1.2, 'z-end': 12,
  };
  // satır, vuruşun başından bu kadar sonra başlar (sahne girişleri için)
  const LEAD = {
    'a-cut': 1.6, 's-hello': 1.4, 'd-whole': 0.8, 'b-zoom': 0.4, 'b-cells': 0.6, 'g-rise': 0.8, 'n-why': 0.8, 'k-measure': 0.8,
    'c-study': 0.8, 'p-intro': 0.8, 'e-intro': 0.8, 'z-sum': 0.8,
  };
  const PLAN = [
    { id: 'open', title: 'Soğuk açılış', beats: ['a-cut', 'a-tears', 'a-question'], fadeIn: 0.8 },
    { id: 'hello', title: 'Selam', beats: ['s-hello', 's-promise'] },
    { id: 'test', title: 'Küçük bir deney', beats: ['d-whole', 'd-knife'] },
    { id: 'zoom', title: 'Büyüteç', beats: ['b-zoom', 'b-cells', 'b-rooms', 'b-wall', 'b-chain', 'b-second', 'b-name', 'b-nobel'] },
    { id: 'eye', title: 'Göz', beats: ['g-rise', 'g-cornea', 'g-signal', 'g-reflex'] },
    { id: 'why', title: 'Soğan bunu neden yapıyor?', beats: ['n-why', 'n-defense', 'n-garlic', 'n-flavor'] },
    { id: 'vary', title: 'Her soğan aynı değil', beats: ['k-measure', 'k-vary'] },
    { id: 'study', title: 'En taze araştırma', beats: ['c-study', 'c-press', 'c-burst', 'c-result', 'c-irony'] },
    { id: 'tips', title: 'Bu akşam dene', beats: ['p-intro', 'p-knife', 'p-slow', 'p-air', 'p-goggles', 'p-cook'] },
    { id: 'myth', title: 'Efsane mi, gerçek mi?', beats: ['e-intro', 'e-fridge', 'e-bread', 'e-tearless'] },
    { id: 'close', title: 'Kapanış', beats: ['z-sum', 'z-tonight', 'z-next', 'z-end'], fadeOut: 2.0 },
  ];
  const BEATS = {};
  const DRAW = {};
  const SCENES = PLAN.map((p) => {
    let a = 0.3;
    for (const id of p.beats) {
      const len = (LEAD[id] ?? 0) + estimate(id) + (EXTRA[id] ?? 0.6);
      BEATS[id] = [p.id, a, a + len, a + len - 0.5];
      a += len + 0.1;
    }
    return { id: p.id, title: p.title, base: a + 0.3, fadeIn: p.fadeIn, fadeOut: p.fadeOut, draw: (ctx, lt, t) => DRAW[p.id](ctx, lt, t) };
  });
  for (const l of SCRIPT.lines) if (LEAD[l.id]) l.offset = LEAD[l.id];
  const PAUSE = {
    'a-tears': 0.4, 'a-question': 0.6, 's-promise': 0.6, 'd-knife': 0.6, 'b-zoom': 0.4, 'b-wall': 0.4, 'b-second': 0.4,
    'b-name': 0.6, 'b-nobel': 0.8, 'g-signal': 0.4, 'g-reflex': 0.8, 'n-defense': 0.4, 'n-flavor': 0.8, 'k-vary': 0.8,
    'c-press': 0.4, 'c-burst': 0.6, 'c-result': 0.6, 'c-irony': 0.8, 'p-goggles': 0.6, 'p-cook': 0.8,
    'e-fridge': 0.6, 'e-bread': 0.6, 'e-tearless': 0.8, 'z-sum': 0.6, 'z-next': 0.6, 'z-end': 1.6,
  };
  const BREATH = 0.6;
  const build = (holds, slow) => E.timeline(SCENES.map((sc) => {
    const mine = Object.entries(BEATS).filter(([, b]) => b[0] === sc.id);
    return {
      ...sc,
      stretch: mine.map(([id, [, a, b]]) => [a, b, slow[id] ?? 1]).filter(([, , k]) => k !== 1),
      holds: mine.filter(([id]) => holds[id] > 0).map(([id, [, , , f]]) => [f, holds[id]]),
    };
  }));
  const VOICE = E.narration({ build, beats: BEATS, lines: SCRIPT.lines, voice: window.VOICE, pauses: PAUSE, breath: BREATH, cps: CPS });
  const TL = VOICE.timeline;
  const cue = VOICE.cue;
  const lineEnd = VOICE.end;
  const after = (t, id, k = 0, d = 0.6, fn = ease.out) => progress(t, cue(id, k), cue(id, k) + d, fn);
  const afterEnd = (t, id, dt = 0, d = 0.6, fn = ease.out) => progress(t, lineEnd(id) + dt, lineEnd(id) + dt + d, fn);
  const sceneStart = (id) => TL.scene(id).start;
  const sceneEnd = (id) => TL.scene(id).end;
  // bir satırın k. öbeğinden, (son) satırın j. öbeğine kadar görünürlük
  const span = (t, id, k, id2, j, fi = 0.5, fo = 0.5) => vis(t, cue(id, k) - 0.2, id2 ? cue(id2, j) - 0.15 : Infinity, fi, fo);
  // bir satırın başından bir sonrakinin başına kadar
  const during = (t, first, last, fi = 0.5, fo = 0.5) => vis(t, cue(first, 0) - 0.3, last ? cue(last, 0) - 0.2 : Infinity, fi, fo);
  // tam kare katmanlar arası geçiş: giden katman, gelen tamamen görünene dek opak kalır
  const layer = (t, a, b, fi = 0.6) => vis(t, a, b + fi + 0.05, fi, 0.05);
  // küçük zıplama ile giriş: 0 → hafif taşma → 1
  const pop = (t, at, d = 0.45) => ease.back(clamp((t - at) / d));

  // ---------------------------------------------------------------------------
  // Ortak çizimler
  // ---------------------------------------------------------------------------
  function background(ctx) {
    ctx.fillStyle = C.navy;
    ctx.fillRect(0, 0, W, H);
  }

  // Açık "defter" zemini: diyagram sahneleri için
  function paperBg(ctx, t, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = C.paper;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(43,31,26,0.07)';
    for (let y = 40; y < H; y += 48) for (let x = 40; x < W; x += 48) ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.75);
    g.addColorStop(0, 'rgba(194,124,78,0)');
    g.addColorStop(1, 'rgba(194,124,78,0.16)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // Mikro dünya: lacivert, altın ışıklı; hafifçe süzülen kabarcıklar
  function microBg(ctx, t, a = 1, zoom = 1.04) {
    if (a <= 0.002) return;
    cover(ctx, 'micro', zoom + 0.02 * Math.sin(t * 0.15), 0.5 + 0.03 * Math.sin(t * 0.11), 0.5, a);
    ctx.save();
    ctx.globalAlpha *= a;
    for (let i = 0; i < 26; i++) {
      const x = ((hash(i, 5) * W + t * (8 + hash(i, 6) * 14)) % (W + 80)) - 40;
      const y = (hash(i, 7) * H - t * (6 + hash(i, 8) * 10) + H * 4) % H;
      const r = 2 + hash(i, 9) * 5;
      ctx.fillStyle = `rgba(255,236,200,${0.12 + hash(i, 10) * 0.2})`;
      dot(ctx, x, y, r);
    }
    ctx.restore();
  }

  // Mutfak: hafif kayan kamera, ön katman daha hızlı kayar (derinlik)
  function kitchen(ctx, t, { zoom = 1.08, fx = 0.5, fy = 0.5, fg = 1, dim = 0, a = 1 } = {}) {
    if (a <= 0.002) return;
    const dx = 0.04 * Math.sin(t * 0.05);
    cover(ctx, 'kitchen', zoom, clamp(fx + dx), fy, a);
    if (dim > 0) {
      ctx.save();
      ctx.globalAlpha *= a * dim;
      ctx.fillStyle = C.navy;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    if (fg > 0 && IMG.fg) {
      // kameraya çok yakın fesleğen yaprakları; arka plandan hızlı kayar
      pic(ctx, 'fg', -70 - 40 * Math.sin(t * 0.05), H - A.fg.h + 60, A.fg.w, A.fg.h, a * fg);
    }
  }

  function line(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function dot(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
    ctx.fill();
  }

  function shadowed(ctx, blur, oy, fn, color = 'rgba(43,31,26,0.25)') {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetY = oy;
    fn();
    ctx.restore();
  }

  // Başlık şeridi: sol üstte küçük büyük harf etiket ve altın çizgi
  function kicker(ctx, str, a, { x = 110, y = 92, dark = false } = {}) {
    if (a <= 0.002) return;
    const col = dark ? C.cream : C.navy;
    text(ctx, str, x, y, { size: 26, weight: 800, spacing: 6, color: col, align: 'left', alpha: a, family: 'display' });
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = C.gold;
    ctx.fillRect(x, y + 28, 64 * a, 5);
    ctx.restore();
  }

  // Hap biçimli etiket
  function chip(ctx, str, x, y, a, { color = C.navy, fill = C.cream, border = null, size = 30, weight = 700, align = 'center', scale = 1 } = {}) {
    if (a <= 0.002) return;
    const w = measure(ctx, str, { size, weight }) + size * 1.3;
    const h = size * 1.8;
    const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x0 + w / 2, y);
    ctx.scale(scale, scale);
    shadowed(ctx, 18, 6, () => {
      roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
      ctx.fillStyle = fill;
      ctx.fill();
    });
    if (border) {
      roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = border;
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.translate(x0 + w / 2, y);
    ctx.scale(scale, scale);
    text(ctx, str, 0, 2, { size, weight, color, alpha: a });
    ctx.restore();
    return w;
  }

  // Kart: krem zemin, yumuşak gölge
  function card(ctx, x, y, w, h, a = 1, { fill = '#fffaf0', r = 28, border = null, lw = 4 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    shadowed(ctx, 30, 10, () => {
      roundRect(ctx, x, y, w, h, r);
      ctx.fillStyle = fill;
      ctx.fill();
    });
    if (border) {
      roundRect(ctx, x, y, w, h, r);
      ctx.lineWidth = lw;
      ctx.strokeStyle = border;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Büyük cümle (ekranın ortasında)
  function statement(ctx, str, y, a, { size = 64, color = C.navy, maxW = 1500, weight = 800 } = {}) {
    if (a <= 0.002) return;
    paragraph(ctx, str, W / 2, y + (1 - a) * 18, maxW, { size, weight, color, alpha: a, family: 'display', valign: 'middle', lineHeight: size * 1.18 });
  }

  // Damga: hafif dönük, çerçeveli büyük yazı
  function stamp(ctx, str, color, x, y, t0, t, { size = 92, rot = -0.12 } = {}) {
    const p = clamp((t - t0) / 0.35);
    if (p <= 0) return;
    const sc = lerp(2.2, 1, ease.out(p));
    const w = measure(ctx, str, { size, weight: 900, family: 'display', spacing: 4 }) + size * 0.9;
    const h = size * 1.45;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(sc, sc);
    ctx.globalAlpha *= Math.min(1, p * 1.6);
    roundRect(ctx, -w / 2, -h / 2, w, h, 18);
    ctx.fillStyle = 'rgba(255,250,240,0.92)';
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = color;
    ctx.stroke();
    roundRect(ctx, -w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 10);
    ctx.lineWidth = 3;
    ctx.stroke();
    text(ctx, str, 0, 4, { size, weight: 900, family: 'display', spacing: 4, color });
    ctx.restore();
  }

  // Tepki baloncuğu: yuvarlak çerçevede karakterin ifade portresi
  function bubble(ctx, k, cx, cy, r, a, sc = 1, { ring = C.gold, fill = C.cream, dy = 0.12 } = {}) {
    if (a <= 0.002 || sc <= 0.01 || !IMG[k]) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(cx, cy);
    ctx.scale(sc, sc);
    shadowed(ctx, 30, 10, () => {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
    });
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r - 2, 0, Math.PI * 2);
    ctx.clip();
    const h = r * 2.15;
    const w = (A[k].w * h) / A[k].h;
    ctx.drawImage(IMG[k], -w / 2, -h / 2 + r * dy, w, h);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.lineWidth = 9;
    ctx.strokeStyle = ring;
    ctx.stroke();
    ctx.restore();
  }

  // Ok
  function arrow(ctx, x1, y1, x2, y2, { color = C.navy, lw = 6, head = 22, p = 1, dash = null } = {}) {
    if (p <= 0.002) return;
    const x = lerp(x1, x2, p);
    const y = lerp(y1, y2, p);
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    if (dash) ctx.setLineDash(dash);
    line(ctx, x1, y1, x - Math.cos(ang) * head * 0.6, y - Math.sin(ang) * head * 0.6);
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(ang - 0.45) * head, y - Math.sin(ang - 0.45) * head);
    ctx.lineTo(x - Math.cos(ang + 0.45) * head, y - Math.sin(ang + 0.45) * head);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Karakter: gövde + konuşan baş (ağız sayfası) + göz şeridi (göz sayfası)
  // ---------------------------------------------------------------------------
  // Harf → ağız şekli. Ünlüler şekli belirler; dudak ünsüzleri ağzı kapatır, ıslıklılar dişleri gösterir.
  // 0 dinlenme, 1 a, 2 e, 3 o, 4 u, 5 m/b/p, 7 f/v, 9 s/z/ı/i
  const VOWEL = { a: 1, â: 1, e: 2, i: 9, î: 9, ı: 9, o: 3, ö: 3, u: 4, û: 4, ü: 4 };
  const CONS = { m: 5, b: 5, p: 5, f: 7, v: 7, s: 9, z: 9, ş: 9, ç: 9, c: 9, j: 9 };
  const TRACK = [];
  for (const l of SCRIPT.lines) {
    const ph = E.phrases(l.say);
    ph.forEach((p, k) => {
      const t0 = cue(l.id, k);
      const next = k + 1 < ph.length ? cue(l.id, k + 1) : lineEnd(l.id);
      const gapAfter = k + 1 < ph.length ? E.PAUSES[p.slice(-1)] ?? 0.3 : 0.05;
      const speak = Math.max(0.15, next - t0 - gapAfter);
      const letters = [...p.toLocaleLowerCase('tr')].filter((ch) => /\p{L}/u.test(ch));
      if (!letters.length) return;
      const dt = speak / letters.length;
      let prev = 6;
      const seq = letters.map((ch) => {
        const m = VOWEL[ch] ?? CONS[ch] ?? prev;
        if (VOWEL[ch] != null) prev = VOWEL[ch];
        return m;
      });
      // aynı şekilleri birleştir, çok kısa olanları bir öncekine kat
      const segs = [];
      seq.forEach((m, i) => {
        const a = t0 + i * dt;
        const last = segs[segs.length - 1];
        if (last && (last[2] === m || a + dt - last[0] < 0.06)) last[1] = a + dt;
        else segs.push([a, a + dt, m]);
      });
      TRACK.push(...segs);
    });
  }
  TRACK.sort((x, y) => x[0] - y[0]);
  function mouthAt(t, rest = 0) {
    let lo = 0;
    let hi = TRACK.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (TRACK[mid][0] <= t) lo = mid;
      else hi = mid - 1;
    }
    const s = TRACK[lo];
    return s && t >= s[0] && t < s[1] ? s[2] : rest;
  }
  const speaking = (t) => mouthAt(t, -1) >= 0;
  // Göz: tohumlu aralıklarla kırpma (yarı → kapalı → yarı)
  function eyesAt(t, base = 0) {
    if (base === 2 || base === 9 || base === 8) return base;
    const n = Math.floor(t / 3.6);
    const bt = n * 3.6 + 0.4 + hash(n, 77) * 2.6;
    const d = t - bt;
    if (d >= 0 && d < 0.05) return 1;
    if (d >= 0.05 && d < 0.11) return 2;
    if (d >= 0.11 && d < 0.16) return 1;
    return base;
  }

  // Gözlüğü indirince alında kalan boşluğu saç perçemi kapatır (baş koordinatlarında)
  function fringe(ctx, a) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.beginPath();
    ctx.moveTo(118, 175);
    ctx.bezierCurveTo(130, 95, 300, 70, 438, 120);
    ctx.lineTo(440, 240);
    const tips = 9;
    for (let i = 0; i <= tips; i++) {
      const x = lerp(440, 120, i / tips);
      const y = i % 2 ? 262 + 10 * hash(i, 3) : 236 + 8 * hash(i, 4);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = '#6e3c20';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#2b1a12';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.strokeStyle = 'rgba(43,26,18,0.55)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      const x = 170 + i * 46;
      ctx.beginPath();
      ctx.moveTo(x, 140 + 6 * hash(i, 8));
      ctx.quadraticCurveTo(x - 10, 190, x - 4, 228);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Mutfakta sunucu çerçevesi: uyluk hizasından kesilir, ayaklar kadraj dışında kalır
  const presenter = (ctx, t, x, o = {}, lift = 0) => host(ctx, t, x, 1560 - lift, 1400, o);

  function host(ctx, t, x, y, h, o = {}) {
    const key = o.pose ?? 'body';
    const P = A[key];
    const a = o.alpha ?? 1;
    if (!P || a <= 0.002) return;
    const s = h / P.h;
    const talking = o.talk !== false && speaking(t);
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate((noise(t * 0.35, 3) - 0.5) * 0.012 + (o.lean ?? 0));
    ctx.scale(s * (o.flip ? -1 : 1), s * (1 + 0.006 * Math.sin(t * 2.2)));
    ctx.translate(-P.w / 2, -P.h);
    ctx.drawImage(IMG[key], 0, 0);
    const hs = P.hs;
    const px = P.hx + 240 * hs;
    const py = P.hy + 545 * hs;
    ctx.translate(px, py);
    ctx.rotate((noise(t * 0.6, 11) - 0.5) * 0.07 + (talking ? Math.sin(t * 5.3) * 0.014 : 0) + (o.tilt ?? 0));
    ctx.translate(-px, -py);
    const m = o.mouth ?? (o.talk === false ? o.rest ?? 0 : mouthAt(t, o.rest ?? 0));
    ctx.drawImage(IMG['mouth' + m], P.hx, P.hy, 480 * hs, 575 * hs);
    const e = eyesAt(t, o.eyes ?? 0);
    if (e) ctx.drawImage(IMG['eyes' + e], P.hx, P.hy + 250 * hs, 480 * hs, 135 * hs);
    const g = o.goggles ?? 0;
    if (g > 0) {
      ctx.translate(P.hx, P.hy);
      ctx.scale(hs, hs);
      fringe(ctx, clamp(g * 4));
      const G = A.goggles;
      ctx.drawImage(IMG.goggles, G.x, G.y + 172 * ease.inOut(g), G.w, G.h);
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Çizilen nesneler (karakter görselleriyle uyumlu: koyu kontur, düz renk, hafif gölge)
  // ---------------------------------------------------------------------------
  const INK = C.ink;

  function outline(ctx, lw = 5, color = INK) {
    ctx.lineWidth = lw;
    ctx.strokeStyle = color;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Bütün soğan: (x, y) ampul merkezi, r yarıçap
  function onionWhole(ctx, x, y, r, { rot = 0, a = 1, squash = 1 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(1, squash);
    // kök püskülü
    ctx.strokeStyle = '#d9c39a';
    ctx.lineWidth = r * 0.025;
    for (let i = 0; i < 9; i++) {
      const ang = Math.PI / 2 + (i - 4) * 0.16;
      ctx.beginPath();
      ctx.moveTo(0, r * 0.9);
      ctx.quadraticCurveTo(Math.cos(ang) * r * 0.2, r * 1.05, Math.cos(ang) * r * 0.32, r * (1.08 + 0.05 * hash(i, 2)));
      ctx.stroke();
    }
    const body = () => {
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.32);
      ctx.bezierCurveTo(r * 0.2, -r * 1.05, r * 1.05, -r * 0.75, r * 1.0, 0.05 * r);
      ctx.bezierCurveTo(r * 0.95, r * 0.7, r * 0.45, r * 0.95, 0, r * 0.95);
      ctx.bezierCurveTo(-r * 0.45, r * 0.95, -r * 0.95, r * 0.7, -r * 1.0, 0.05 * r);
      ctx.bezierCurveTo(-r * 1.05, -r * 0.75, -r * 0.2, -r * 1.05, 0, -r * 1.32);
      ctx.closePath();
    };
    shadowed(ctx, r * 0.25, r * 0.08, () => {
      body();
      const g = ctx.createLinearGradient(-r, -r, r, r);
      g.addColorStop(0, '#e0914f');
      g.addColorStop(0.55, C.onion);
      g.addColorStop(1, '#9c5326');
      ctx.fillStyle = g;
      ctx.fill();
    });
    // boylamasına çizgiler
    ctx.save();
    body();
    ctx.clip();
    ctx.strokeStyle = 'rgba(110,52,20,0.45)';
    ctx.lineWidth = r * 0.03;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.3);
      ctx.bezierCurveTo(i * r * 0.32, -r * 0.6, i * r * 0.36, r * 0.4, 0, r * 0.95);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,230,190,0.35)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.42, -r * 0.35, r * 0.16, r * 0.42, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    body();
    outline(ctx, Math.max(3, r * 0.045));
    // kuru tepe
    ctx.beginPath();
    ctx.moveTo(-r * 0.05, -r * 1.3);
    ctx.quadraticCurveTo(r * 0.05, -r * 1.55, r * 0.2, -r * 1.62);
    ctx.lineWidth = r * 0.07;
    ctx.strokeStyle = '#b8803f';
    ctx.stroke();
    ctx.restore();
  }

  // Kesik soğan yüzü (halkalar): (x, y) merkez, r yarıçap
  function onionFace(ctx, x, y, r, { a = 1, glow: gl = 0 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    shadowed(ctx, r * 0.2, r * 0.06, () => {
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.96, 0, 0, Math.PI * 2);
      ctx.fillStyle = C.onion;
      ctx.fill();
    });
    for (let i = 0; i < 7; i++) {
      const k = 1 - i * 0.13 - 0.06;
      ctx.beginPath();
      ctx.ellipse(r * 0.03 * i, r * 0.02 * i, r * k, r * k * 0.96, 0, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 ? C.fleshRing : C.flesh;
      ctx.fill();
      ctx.lineWidth = Math.max(1.5, r * 0.012);
      ctx.strokeStyle = 'rgba(190,170,110,0.7)';
      ctx.stroke();
    }
    if (gl > 0) glow(ctx, 0, 0, r * 1.3, GAS, 0.35 * gl);
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.96, 0, 0, Math.PI * 2);
    outline(ctx, Math.max(3, r * 0.04));
    ctx.restore();
  }

  // Bıçak: (x, y) sap ile ağız birleşimi, len ağız boyu, ang yön
  function knife(ctx, x, y, len, ang = 0, { a = 1, gleam = 0, dull = false } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(ang);
    const hw = len * 0.2;
    // sap
    roundRect(ctx, -len * 0.48, -hw * 0.42, len * 0.46, hw * 0.84, hw * 0.3);
    ctx.fillStyle = C.navy;
    ctx.fill();
    outline(ctx, 4);
    ctx.fillStyle = '#d8d2c4';
    for (const k of [0.36, 0.22, 0.08]) dot(ctx, -len * k, 0, hw * 0.1);
    // ağız
    ctx.beginPath();
    ctx.moveTo(0, -hw * 0.5);
    ctx.lineTo(len * 0.86, -hw * 0.38);
    ctx.quadraticCurveTo(len, -hw * 0.3, len, hw * 0.05);
    ctx.quadraticCurveTo(len * 0.7, hw * 0.55, 0, hw * 0.55);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, -hw * 0.5, 0, hw * 0.55);
    g.addColorStop(0, '#9aa3ad');
    g.addColorStop(0.5, '#e8ecef');
    g.addColorStop(1, dull ? '#a7a39a' : '#ffffff');
    ctx.fillStyle = g;
    ctx.fill();
    outline(ctx, 4);
    if (gleam > 0) {
      const gx = lerp(0, len, gleam);
      glow(ctx, gx, hw * 0.4, hw * 0.9, [255, 255, 255], 0.9 * Math.sin(Math.PI * gleam));
    }
    ctx.restore();
  }

  // Gözyaşı damlası
  function drop(ctx, x, y, r, { color = C.tear, a = 1, rot = 0 } = {}) {
    if (a <= 0.002 || r <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.6);
    ctx.bezierCurveTo(r * 0.5, -r * 0.6, r, -r * 0.2, r, r * 0.25);
    ctx.arc(0, r * 0.25, r, 0, Math.PI);
    ctx.bezierCurveTo(-r, -r * 0.2, -r * 0.5, -r * 0.6, 0, -r * 1.6);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    outline(ctx, Math.max(2, r * 0.18), '#1f4f8f');
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    dot(ctx, -r * 0.35, r * 0.05, r * 0.22);
    ctx.restore();
  }

  // Sarımsak başı
  function garlic(ctx, x, y, r, { a = 1 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.strokeStyle = '#d9c39a';
    ctx.lineWidth = r * 0.025;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo((i - 3) * r * 0.06, r * 0.82);
      ctx.lineTo((i - 3) * r * 0.1, r * 1.02);
      ctx.stroke();
    }
    const lobes = [-0.62, -0.22, 0.22, 0.62];
    shadowed(ctx, r * 0.2, r * 0.06, () => {
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.25);
      ctx.bezierCurveTo(r * 0.3, -r * 0.8, r * 1.05, -r * 0.55, r * 0.98, r * 0.2);
      ctx.bezierCurveTo(r * 0.9, r * 0.75, r * 0.4, r * 0.88, 0, r * 0.86);
      ctx.bezierCurveTo(-r * 0.4, r * 0.88, -r * 0.9, r * 0.75, -r * 0.98, r * 0.2);
      ctx.bezierCurveTo(-r * 1.05, -r * 0.55, -r * 0.3, -r * 0.8, 0, -r * 1.25);
      ctx.closePath();
      const g = ctx.createLinearGradient(-r, 0, r, 0);
      g.addColorStop(0, '#f6efe4');
      g.addColorStop(0.7, '#efe2d4');
      g.addColorStop(1, '#d9c2c9');
      ctx.fillStyle = g;
      ctx.fill();
    });
    outline(ctx, Math.max(3, r * 0.045));
    ctx.strokeStyle = 'rgba(150,110,120,0.55)';
    ctx.lineWidth = r * 0.03;
    for (const k of lobes) {
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.1);
      ctx.quadraticCurveTo(k * r * 1.1, -r * 0.1, k * r * 0.55, r * 0.85);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Atom ve bağ çizimi (top-çubuk)
  const ATOM = {
    C: { r: 26, fill: '#4a4f5c', label: 'C', fg: '#fff' },
    H: { r: 15, fill: '#f4f1ea', label: 'H', fg: '#555' },
    S: { r: 32, fill: '#f2c230', label: 'S', fg: '#3a2a00' },
    O: { r: 27, fill: '#e5484d', label: 'O', fg: '#fff' },
    N: { r: 26, fill: '#5b7be0', label: 'N', fg: '#fff' },
  };
  function ballStick(ctx, atoms, bonds, cx, cy, s, a = 1, { labels = true, spin = 0 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    if (spin) ctx.rotate(spin);
    ctx.strokeStyle = '#3b3530';
    ctx.lineCap = 'round';
    for (const [i, j, order = 1] of bonds) {
      const [x1, y1] = atoms[i].p;
      const [x2, y2] = atoms[j].p;
      const nx = -(y2 - y1);
      const ny = x2 - x1;
      const nl = Math.hypot(nx, ny) || 1;
      const off = order === 2 ? [-5, 5] : [0];
      ctx.lineWidth = order === 2 ? 6 : 9;
      for (const o of off) line(ctx, x1 + (nx / nl) * o, y1 + (ny / nl) * o, x2 + (nx / nl) * o, y2 + (ny / nl) * o);
    }
    for (const at of atoms) {
      const d = ATOM[at.e];
      const [x, y] = at.p;
      const g = ctx.createRadialGradient(x - d.r * 0.35, y - d.r * 0.35, d.r * 0.1, x, y, d.r);
      g.addColorStop(0, 'rgba(255,255,255,0.75)');
      g.addColorStop(0.3, d.fill);
      g.addColorStop(1, d.fill);
      ctx.beginPath();
      ctx.arc(x, y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(40,30,25,0.7)';
      ctx.stroke();
      if (labels && at.e !== 'H') {
        ctx.save();
        if (spin) {
          ctx.translate(x, y);
          ctx.rotate(-spin);
          ctx.translate(-x, -y);
        }
        text(ctx, d.label, x, y + 1, { size: d.r * 0.95, weight: 800, color: d.fg });
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // sin-propantiyal-S-oksit, C3H6OS: CH3–CH2–CH=S=O (bir sülfin; O, C=S bağının etil grubuyla aynı tarafında: "sin")
  const LF = (() => {
    const c1 = [-210, 40];
    const c2 = [-90, -30];
    const c3 = [30, 40];
    const s = [150, -30];
    const o = [80, -140];
    const atoms = [
      { e: 'C', p: c1 }, { e: 'C', p: c2 }, { e: 'C', p: c3 }, { e: 'S', p: s }, { e: 'O', p: o },
      { e: 'H', p: [-270, -15] }, { e: 'H', p: [-255, 105] }, { e: 'H', p: [-175, 110] },
      { e: 'H', p: [-120, -100] }, { e: 'H', p: [-40, -95] },
      { e: 'H', p: [35, 120] },
    ];
    const bonds = [[0, 1], [1, 2], [2, 3, 2], [3, 4, 2], [0, 5], [0, 6], [0, 7], [1, 8], [1, 9], [2, 10]];
    return { atoms, bonds };
  })();
  const lfMolecule = (ctx, cx, cy, s, a, o) => ballStick(ctx, LF.atoms, LF.bonds, cx, cy, s, a, o);

  // Küçük gaz molekülü (parçacık akışları için; LF'nin sadeleştirilmiş simgesi)
  function gasMol(ctx, x, y, s, a = 1, rot = 0) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.strokeStyle = '#3b3530';
    ctx.lineWidth = 3;
    line(ctx, -14, 4, 0, -4);
    line(ctx, 0, -4, 14, 4);
    line(ctx, 14, 4, 18, -12);
    ctx.fillStyle = '#4a4f5c';
    dot(ctx, -14, 4, 7);
    ctx.fillStyle = '#f2c230';
    dot(ctx, 14, 4, 8);
    ctx.fillStyle = '#e5484d';
    dot(ctx, 18, -12, 6);
    ctx.fillStyle = '#4a4f5c';
    dot(ctx, 0, -4, 7);
    ctx.restore();
  }

  // Kükürtlü madde (izoalliin, sadeleştirilmiş): sarı S topu taşıyan küçük zincir
  function sulfurMol(ctx, x, y, s, a = 1, rot = 0) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.strokeStyle = '#3b3530';
    ctx.lineWidth = 4;
    line(ctx, -30, 8, -12, -6);
    line(ctx, -12, -6, 6, 6);
    line(ctx, 6, 6, 26, -4);
    line(ctx, 26, -4, 30, -24);
    ctx.fillStyle = '#4a4f5c';
    dot(ctx, -30, 8, 8);
    dot(ctx, -12, -6, 8);
    ctx.fillStyle = '#5b7be0';
    dot(ctx, 6, 6, 8);
    ctx.fillStyle = '#f2c230';
    dot(ctx, 26, -4, 11);
    ctx.fillStyle = '#e5484d';
    dot(ctx, 30, -24, 7);
    ctx.restore();
  }

  // Alliinaz: "soğanın makası" — mor gövdeli makas enzimi
  function scissorEnzyme(ctx, x, y, s, open = 0.5, a = 1, rot = 0) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    const ang = 0.12 + 0.45 * open;
    for (const sgn of [-1, 1]) {
      ctx.save();
      ctx.rotate(sgn * ang);
      // ağız
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(70, -sgn * 6);
      ctx.lineTo(74, sgn * 2);
      ctx.lineTo(0, sgn * 10);
      ctx.closePath();
      ctx.fillStyle = '#dfe3ea';
      ctx.fill();
      outline(ctx, 3.5);
      // halka sap
      ctx.beginPath();
      ctx.ellipse(-34, sgn * 4, 22, 15, 0, 0, Math.PI * 2);
      ctx.fillStyle = C.enzyme;
      ctx.fill();
      outline(ctx, 3.5);
      ctx.beginPath();
      ctx.ellipse(-34, sgn * 4, 10, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#ffd34d';
    dot(ctx, 0, 0, 6);
    ctx.restore();
  }

  // İkinci enzim (LF sentazı): ara ürünü yakalayan yeşil kıskaç
  function catcherEnzyme(ctx, x, y, s, grab = 0, a = 1, rot = 0) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    const m = lerp(0.75, 0.12, grab);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 52, m, Math.PI * 2 - m);
    ctx.closePath();
    const g = ctx.createRadialGradient(-14, -18, 6, 0, 0, 52);
    g.addColorStop(0, '#9be3bf');
    g.addColorStop(1, C.catcher);
    ctx.fillStyle = g;
    ctx.fill();
    outline(ctx, 4);
    ctx.fillStyle = '#fff';
    dot(ctx, -6, -26, 9);
    ctx.fillStyle = INK;
    dot(ctx, -4, -25, 4.5);
    ctx.restore();
  }

  // Kararsız ara ürün: titreyen, yarı saydam molekül
  function wobblyMol(ctx, x, y, s, t, a = 1, seed = 0) {
    if (a <= 0.002) return;
    const j = (k) => (noise(t * 9 + k * 3.1, seed + k) - 0.5) * 8;
    ctx.save();
    ctx.globalAlpha *= a * (0.8 + 0.2 * Math.sin(t * 13 + seed));
    ctx.translate(x + j(1), y + j(2));
    ctx.scale(s, s);
    ctx.strokeStyle = '#3b3530';
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 6]);
    line(ctx, -20, 6, 0, -6);
    line(ctx, 0, -6, 20, 4);
    ctx.setLineDash([]);
    ctx.fillStyle = '#4a4f5c';
    dot(ctx, -20, 6, 8);
    dot(ctx, 0, -6, 8);
    ctx.fillStyle = '#f2c230';
    dot(ctx, 20, 4, 10);
    glow(ctx, 0, 0, 46, GAS, 0.4);
    ctx.restore();
  }

  // Kıvrımlı koku/buhar çizgisi
  function wisp(ctx, x, y, h, t, a = 1, { color = 'rgba(242,214,117,0.9)', lw = 8, seed = 0 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) {
      const k = i / 20;
      const px = x + Math.sin(k * 6 + t * 2 + seed) * 18 * k;
      const py = y - k * h;
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 1 · Soğuk açılış: tahta, bıçak, soğan… ve gözyaşları
  // ---------------------------------------------------------------------------
  const knifeTimes = () => [cue('a-cut', 3), cue('a-cut', 4)];

  DRAW.open = function sceneOpen(ctx, lt, t) {
    const t0 = sceneStart('open');
    const [k1, k2] = knifeTimes();
    const burn = cue('a-cut', 5);
    const cry = cue('a-tears', 0);
    const q = cue('a-question', 0);
    const zoom = 1.02 + 0.05 * progress(t, t0, q, ease.linear);
    // soğan kareleri: bütün → ikiye → buhar → gözyaşı
    const frames = [['onion1', t0, k1], ['onion2', k1, burn], ['onion3', burn, cry], ['onion4', cry, Infinity]];
    for (const [k, a, b] of frames) {
      const al = layer(t, a, b, a === t0 ? 0 : 0.25);
      if (al > 0) cover(ctx, k, zoom, 0.5, 0.55, al);
    }
    // bıçak darbesi: kısa beyaz parıltı ve sarsıntı
    for (const k of [k1, k2]) {
      const d = t - k;
      if (d >= 0 && d < 0.35) {
        ctx.save();
        ctx.globalAlpha = 0.55 * (1 - d / 0.35);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }
    }
    // yükselen ağlatan gaz (3. karede)
    const ga = vis(t, burn - 0.2, cry + 0.6, 0.8, 0.6);
    for (let i = 0; i < 18 && ga > 0; i++) {
      const life = (t * 0.35 + hash(i, 4)) % 1;
      const x = W * (0.36 + 0.3 * hash(i, 5)) + Math.sin(t * 1.3 + i) * 30;
      const y = H * 0.7 - life * H * 0.6;
      gasMol(ctx, x, y, 1.2 + hash(i, 6), ga * Math.sin(Math.PI * life) * 0.9, t * 0.5 + i);
    }
    // gözyaşı: üstten süzülen damlalar
    const ta = vis(t, cry, q + 0.5, 0.5, 0.6);
    for (let i = 0; i < 12 && ta > 0; i++) {
      const life = (t * 0.45 + hash(i, 8)) % 1;
      drop(ctx, W * (0.08 + 0.84 * hash(i, 9)), H * 0.12 + life * H * 0.5, 12 + 8 * hash(i, 10), { a: ta * Math.sin(Math.PI * life) });
    }
    // tepki: ağlayan karakter
    const ba = vis(t, cue('a-tears', 1) - 0.1, q - 0.1, 0.01, 0.4);
    const bs = pop(t, cue('a-tears', 1) - 0.1) * (1 + 0.12 * after(t, 'a-tears', 3, 0.4));
    bubble(ctx, 'xCry', 1570, 700, 230, ba, bs);
    // soru ve başlık
    const qa = vis(t, q - 0.2, Infinity, 0.6, 0);
    if (qa > 0) {
      ctx.save();
      ctx.globalAlpha = 0.82 * qa;
      ctx.fillStyle = C.navy;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    const title = lineEnd('a-question') + 0.1;
    const sa = vis(t, q, title, 0.5, 0.4);
    statement(ctx, 'Avucuna sığan bir sebze, koca bir insanı nasıl ağlatabiliyor?', 520, sa, { color: C.cream, size: 66, maxW: 1400 });
    const ta2 = progress(t, title, title + 0.8, ease.out);
    if (ta2 > 0) {
      onionWhole(ctx, W / 2, 400 - 20 * (1 - ta2), 110 * ta2, { a: ta2, rot: Math.sin(t * 1.4) * 0.05 });
      drop(ctx, W / 2 + 150, 330 + 60 * ((t - title) % 1.2), 16, { a: ta2 * 0.9 });
      text(ctx, 'TABAĞINDAKİ BİLİM · BÖLÜM 1', W / 2, 620, { size: 30, weight: 800, spacing: 8, color: C.gold, alpha: ta2, family: 'display' });
      text(ctx, 'Soğan Neden Ağlatır?', W / 2, 720, { size: 104, weight: 900, color: C.cream, alpha: ta2, family: 'display' });
      ctx.save();
      ctx.globalAlpha *= ta2;
      ctx.fillStyle = C.gold;
      ctx.fillRect(W / 2 - 160 * ta2, 800, 320 * ta2, 7);
      ctx.restore();
    }
  };

  // ---------------------------------------------------------------------------
  // 2 · Selam: mutfakta karakter
  // ---------------------------------------------------------------------------
  // Dizi rozeti: büyüteç simgesi ve dizi adı
  function badge(ctx, a, x = 96, y = 70) {
    if (a <= 0.002) return;
    const w = 470;
    ctx.save();
    ctx.globalAlpha *= a;
    shadowed(ctx, 20, 6, () => {
      roundRect(ctx, x, y, w, 84, 42);
      ctx.fillStyle = C.navy;
      ctx.fill();
    });
    ctx.lineWidth = 7;
    ctx.strokeStyle = C.gold;
    ctx.beginPath();
    ctx.arc(x + 46, y + 38, 18, 0, Math.PI * 2);
    ctx.stroke();
    line(ctx, x + 59, y + 51, x + 72, y + 64);
    ctx.restore();
    text(ctx, 'TABAĞINDAKİ BİLİM', x + 92, y + 43, { size: 30, weight: 900, spacing: 3, color: C.cream, align: 'left', alpha: a, family: 'display' });
  }

  // Basit simgeler (kartlarda)
  function flaskIcon(ctx, x, y, s, t, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(-14, -50);
    ctx.lineTo(-14, -14);
    ctx.lineTo(-46, 40);
    ctx.quadraticCurveTo(-50, 52, -36, 52);
    ctx.lineTo(36, 52);
    ctx.quadraticCurveTo(50, 52, 46, 40);
    ctx.lineTo(14, -14);
    ctx.lineTo(14, -50);
    ctx.closePath();
    ctx.fillStyle = '#e9f4f1';
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = C.sage;
    ctx.fillRect(-60, 14 + 3 * Math.sin(t * 3), 120, 60);
    ctx.restore();
    outline(ctx, 5);
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 3; i++) dot(ctx, -10 + i * 12, 30 - ((t * 30 + i * 13) % 40), 4);
    ctx.restore();
  }

  DRAW.hello = function sceneHello(ctx, lt, t) {
    const t0 = sceneStart('hello');
    kitchen(ctx, t, { zoom: 1.1, fx: 0.4, fy: 0.45 });
    // karakter sağdan zıplayarak girer
    const enter = progress(t, t0 + 0.2, t0 + 1.4, ease.out);
    const hop = enter < 1 ? Math.abs(Math.sin((t - t0) * 9)) * 26 * (1 - enter) : 0;
    const surprised = vis(t, cue('s-promise', 3) - 0.1, lineEnd('s-promise') + 0.6, 0.05, 0.2);
    presenter(ctx, t, lerp(W + 420, 1480, enter), { pose: 'poseTools', eyes: surprised > 0.5 ? 7 : 0 }, hop);
    badge(ctx, after(t, 's-hello', 0, 0.6));
    // "büyüteçle bakıyoruz"
    const ma = span(t, 's-hello', 1, 's-promise', 0);
    chip(ctx, 'mutfaktaki küçük olaylar + büyüteç', 560, 300, ma, { size: 32, scale: lerp(0.8, 1, pop(t, cue('s-hello', 1))) });
    // vaat kartları
    const c1 = span(t, 's-promise', 0, null, 0, 0.5, 0.5) * vis(t, 0, lineEnd('s-promise') + 0.9, 0, 0.5);
    if (c1 > 0) {
      const s1 = pop(t, cue('s-promise', 0));
      card(ctx, 140, 230 + 40 * (1 - s1), 900, 230, c1);
      onionWhole(ctx, 260, 350 + 40 * (1 - s1), 62, { a: c1 });
      arrow(ctx, 350, 345 + 40 * (1 - s1), 450, 345 + 40 * (1 - s1), { color: C.terra, p: after(t, 's-promise', 0, 0.6) * c1 });
      flaskIcon(ctx, 530, 345 + 40 * (1 - s1), 1.1, t, c1 * after(t, 's-promise', 1, 0.5));
      text(ctx, 'soğanın içindeki', 610, 320 + 40 * (1 - s1), { size: 30, weight: 600, color: C.muted, align: 'left', alpha: c1 });
      text(ctx, 'kimya laboratuvarı', 610, 370 + 40 * (1 - s1), { size: 40, weight: 800, color: C.navy, align: 'left', alpha: c1 * after(t, 's-promise', 1, 0.5) });
      const c2 = c1 * after(t, 's-promise', 2, 0.5);
      const s2 = pop(t, cue('s-promise', 2));
      card(ctx, 140, 500 + 40 * (1 - s2), 900, 200, c2);
      knife(ctx, 210, 600 + 40 * (1 - s2), 150, -0.1, { a: c2, gleam: progress(t, cue('s-promise', 2) + 0.3, cue('s-promise', 2) + 1.3) });
      text(ctx, 'daha az gözyaşıyla', 420, 575 + 40 * (1 - s2), { size: 30, weight: 600, color: C.muted, align: 'left', alpha: c2 });
      text(ctx, 'soğan doğramanın yolları', 420, 625 + 40 * (1 - s2), { size: 40, weight: 800, color: C.navy, align: 'left', alpha: c2 });
      const c3 = c1 * after(t, 's-promise', 4, 0.4);
      chip(ctx, 'biri, çoğumuzun yaptığının tam tersi!', 520, 790, c3, { fill: C.gold, size: 34, scale: lerp(0.7, 1, pop(t, cue('s-promise', 4))) });
    }
  };

  // ---------------------------------------------------------------------------
  // 3 · Küçük bir deney: bütün soğan kokmaz, kesince her şey değişir
  // ---------------------------------------------------------------------------
  // Boyuna ikiye ayrılan soğan: sep 0 → bütün, 1 → iki yarım ve iç halkalar
  function onionSplit(ctx, x, y, r, sep, t) {
    if (sep <= 0.001) {
      onionWhole(ctx, x, y, r);
      return;
    }
    for (const sgn of [-1, 1]) {
      ctx.save();
      ctx.translate(x + sgn * sep * r * 0.55, y);
      ctx.rotate(sgn * sep * 0.18);
      ctx.beginPath();
      ctx.rect(sgn < 0 ? -r * 2 : 0, -r * 2, r * 2, r * 4);
      ctx.clip();
      onionWhole(ctx, 0, 0, r);
      // kesik yüz: iç içe kemerler
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.28);
      ctx.bezierCurveTo(sgn * r * 0.18, -r * 1.02, sgn * r * 0.95, -r * 0.72, sgn * r * 0.93, 0.05 * r);
      ctx.bezierCurveTo(sgn * r * 0.88, r * 0.66, sgn * r * 0.42, r * 0.9, 0, r * 0.9);
      ctx.closePath();
      ctx.fillStyle = C.flesh;
      ctx.globalAlpha *= clamp(sep * 3);
      ctx.fill();
      ctx.strokeStyle = 'rgba(190,170,110,0.9)';
      ctx.lineWidth = r * 0.025;
      for (let i = 1; i < 6; i++) {
        const k = 1 - i * 0.16;
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.2 * k);
        ctx.quadraticCurveTo(sgn * r * 0.95 * k, -r * 0.2 * k, 0, r * 0.88 * k + r * 0.02);
        ctx.stroke();
      }
      ctx.restore();
      ctx.restore();
    }
  }

  // Kadranlı ölçer: v 0..1
  function gauge(ctx, x, y, r, v, label, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    card(ctx, x - r - 40, y - r - 40, 2 * r + 80, r + 150, 1, { r: 30 });
    const segs = [[C.sage, 0, 0.45], [C.gold, 0.45, 0.75], [C.tomato, 0.75, 1]];
    ctx.lineWidth = 26;
    for (const [col, a0, a1] of segs) {
      ctx.strokeStyle = col;
      ctx.beginPath();
      ctx.arc(x, y + 40, r, Math.PI + a0 * Math.PI, Math.PI + a1 * Math.PI);
      ctx.stroke();
    }
    const ang = Math.PI + clamp(v) * Math.PI;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    line(ctx, x, y + 40, x + Math.cos(ang) * (r - 30), y + 40 + Math.sin(ang) * (r - 30));
    ctx.fillStyle = INK;
    dot(ctx, x, y + 40, 14);
    ctx.restore();
    text(ctx, label, x, y + 105, { size: 34, weight: 800, color: C.navy, alpha: a, family: 'display' });
  }

  DRAW.test = function sceneTest(ctx, lt, t) {
    paperBg(ctx, t);
    kicker(ctx, 'KÜÇÜK BİR DENEY', after(t, 'd-whole', 0, 0.6));
    const cut = cue('d-knife', 0) + 0.5;
    const sep = progress(t, cut, cut + 0.9, ease.back);
    const ox = 640;
    const oy = 600;
    // karakter koklar
    const sniff = span(t, 'd-whole', 1, 'd-knife', 0, 0.4, 0.4);
    bubble(ctx, 'xCurious', 330, 330, 150, sniff, pop(t, cue('d-whole', 1) - 0.2));
    for (let i = 0; i < 3; i++) {
      const p = ((t * 0.6 + i / 3) % 1);
      wisp(ctx, ox - 30 + i * 30, oy - 280, 60 * p, t, sniff * 0.25 * Math.sin(Math.PI * p), { color: 'rgba(120,110,90,0.8)', lw: 4, seed: i });
    }
    onionSplit(ctx, ox, oy, 210, sep, t);
    // bıçak iner
    const kd = progress(t, cut - 0.5, cut, ease.in);
    const kup = progress(t, cut + 0.1, cut + 0.6, ease.out);
    const ka = vis(t, cut - 0.7, cut + 0.9, 0.2, 0.3);
    knife(ctx, ox - 30, lerp(170, 500, kd) - kup * 330, 300, Math.PI / 2 - 0.05, { a: ka });
    // kesilince yükselen gaz
    const ga = clamp((t - cut) / 0.6);
    for (let i = 0; i < 16 && ga > 0; i++) {
      const life = ((t - cut) * 0.45 + hash(i, 21)) % 1;
      const x = ox + (hash(i, 22) - 0.5) * 260 + Math.sin(t * 2 + i) * 20;
      const y = oy - 120 - life * 420;
      gasMol(ctx, x, y, 1.4, ga * Math.sin(Math.PI * life), t + i);
    }
    // ölçerler
    const v = 0.06 + 0.02 * Math.sin(t * 3) + progress(t, cut, cut + 1.0, ease.back) * 0.86 + (t > cut ? 0.03 * Math.sin(t * 17) : 0);
    gauge(ctx, 1230, 420, 150, v, 'Keskin koku', after(t, 'd-whole', 1, 0.6));
    gauge(ctx, 1640, 420, 150, v * 0.96, 'Göz yanması', after(t, 'd-whole', 3, 0.6));
    const la = after(t, 'd-knife', 2, 0.5);
    chip(ctx, 'Kestiğin anda, oracıkta üretiliyor', 1430, 780, la, { fill: C.navy, color: C.cream, size: 36, scale: lerp(0.8, 1, pop(t, cue('d-knife', 2))) });
  };

  // ---------------------------------------------------------------------------
  // 4 · Büyüteç: hücreler, iki odalı ev, makas, ikinci enzim ve ağlatan gaz
  // ---------------------------------------------------------------------------
  const LENS = { cx: 667, cy: 664, r: 508 };

  // Soğan zarı hücreleri: tuğla dizilişli uzun hücreler, her birinde çekirdek
  function cells(ctx, t, z, a, cx = W / 2, cy = H / 2) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(cx, cy);
    ctx.rotate(-0.12);
    ctx.scale(z, z);
    const cw = 270;
    const ch = 112;
    for (let r = -7; r <= 7; r++) {
      for (let c = -6; c <= 6; c++) {
        const x = c * cw + (r % 2 ? cw / 2 : 0) + (hash(r * 31 + c, 3) - 0.5) * 16;
        const y = r * ch;
        const wob = Math.sin(t * 0.9 + r * 0.7 + c) * 2;
        roundRect(ctx, x - cw / 2 + 5, y - ch / 2 + 5 + wob, cw - 10, ch - 10, 26);
        ctx.fillStyle = 'rgba(255,238,200,0.16)';
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(255,212,130,0.78)';
        ctx.stroke();
        ctx.fillStyle = 'rgba(205,150,90,0.75)';
        ctx.beginPath();
        ctx.ellipse(x + (hash(r * 7 + c, 9) - 0.5) * 120, y + wob + (hash(r + c * 5, 4) - 0.5) * 30, 17, 13, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // İki odalı ev (hücre kesiti) — sol: kükürtlü madde, sağ: makaslar
  const HOUSE = { x: 230, y: 250, w: 1460, h: 640 };
  const MOLS = [[420, 420], [600, 560], [380, 700], [760, 380], [560, 790], [800, 680]];
  const SCIS = [[1180, 400], [1450, 520], [1250, 700], [1560, 760], [1100, 560], [1500, 360]];
  const snipAt = (i) => cue('b-chain', 1) + i * 0.28;
  const grabAt = (i) => cue('b-second', 1) + i * 0.22;
  const breakAt = () => cue('b-wall', 2) + 0.3;

  function molPos(i, t) {
    const [x, y] = MOLS[i];
    return [x + (noise(t * 0.5, i) - 0.5) * 50, y + (noise(t * 0.5, i + 40) - 0.5) * 40];
  }
  function scisPos(i, t) {
    const [x, y] = SCIS[i];
    const home = [x + (noise(t * 0.5, i + 80) - 0.5) * 50, y + (noise(t * 0.5, i + 90) - 0.5) * 40];
    // duvar yıkılınca kendi molekülüne doğru yüzer
    const go = progress(t, breakAt() + 0.2 + i * 0.12, snipAt(i) - 0.05, ease.inOut);
    const [mx, my] = molPos(i, t);
    return [lerp(home[0], mx + 64, go), lerp(home[1], my - 6, go)];
  }

  function membrane(ctx, t, x, y0, y1, gap = 0, glowA = 0) {
    const mid = (y0 + y1) / 2;
    const segs = gap > 0 ? [[y0, mid - gap], [mid + gap, y1]] : [[y0, y1]];
    if (glowA > 0) glow(ctx, x, mid, 340, GOLD, 0.4 * glowA);
    for (const [a, b] of segs) {
      if (b <= a) continue;
      const shift = gap > 0 ? (a < mid ? -gap * 0.25 : gap * 0.25) : 0;
      for (const off of [-11, 11]) {
        ctx.beginPath();
        for (let y = a; y <= b; y += 8) {
          const xx = x + off + Math.sin(y * 0.03 + t * 1.5) * 10 + shift * 0.2;
          if (y === a) ctx.moveTo(xx, y + shift);
          else ctx.lineTo(xx, y + shift);
        }
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#d8c7ff';
        ctx.stroke();
      }
      ctx.fillStyle = '#efe6ff';
      for (let y = a + 6; y <= b - 6; y += 18) {
        const xx = x + Math.sin(y * 0.03 + t * 1.5) * 10 + shift * 0.2;
        dot(ctx, xx - 11, y + shift, 5);
        dot(ctx, xx + 11, y + shift, 5);
      }
    }
  }

  function house(ctx, t, a) {
    if (a <= 0.002) return;
    const { x, y, w, h } = HOUSE;
    ctx.save();
    ctx.globalAlpha *= a;
    roundRect(ctx, x, y, w, h, 80);
    ctx.fillStyle = 'rgba(255,230,180,0.14)';
    ctx.fill();
    ctx.save();
    roundRect(ctx, x, y, w, h, 80);
    ctx.clip();
    ctx.fillStyle = 'rgba(255,200,90,0.10)';
    ctx.fillRect(x, y, w / 2, h);
    ctx.fillStyle = 'rgba(150,120,255,0.16)';
    ctx.fillRect(x + w / 2, y, w / 2, h);
    ctx.restore();
    roundRect(ctx, x, y, w, h, 80);
    ctx.lineWidth = 12;
    ctx.strokeStyle = 'rgba(255,212,130,0.9)';
    ctx.stroke();
    // ara duvar
    const brk = progress(t, breakAt(), breakAt() + 0.6, ease.out);
    const pulse = span(t, 'b-wall', 0, 'b-wall', 2, 0.3, 0.3) * (0.6 + 0.4 * Math.sin(t * 6));
    membrane(ctx, t, x + w / 2, y + 14, y + h - 14, brk * 150, pulse);
    ctx.restore();
  }

  DRAW.zoom = function sceneZoom(ctx, lt, t) {
    const tin = cue('b-zoom', 0) - 0.3;
    const grow0 = lineEnd('b-zoom') + 0.2;
    const grow = progress(t, grow0, grow0 + 1.3, ease.in);
    const full = grow >= 1;
    // içerideki dünya: hücreler → tek hücre (ev) → moleküller
    const inner = () => {
      microBg(ctx, t);
      const zr = progress(t, cue('b-rooms', 0) - 0.4, cue('b-rooms', 0) + 1.1, ease.inOut);
      cells(ctx, t, lerp(0.75 + 0.25 * grow, 5.5, zr), 1 - zr);
      house(ctx, t, zr);
      if (zr > 0) molecules(ctx, t, zr);
    };
    if (!full) {
      // dış: kesilmiş soğanın yüzü
      paperBg(ctx, t);
      onionFace(ctx, W / 2, H / 2 + 20, 360, { glow: 0.4 });
      const enter = progress(t, tin, tin + 1.0, ease.out);
      const s = lerp(0.42, 6.2, grow);
      const cx = lerp(W + 500, W / 2, enter);
      const cy = lerp(H + 400, H / 2, enter);
      const r = LENS.r * s;
      if (enter > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.save();
        ctx.translate(cx - W / 2, cy - H / 2);
        inner();
        ctx.restore();
        ctx.restore();
        pic(ctx, 'lens', cx - LENS.cx * s, cy - LENS.cy * s, A.lens.w * s, A.lens.h * s);
      }
    } else {
      inner();
    }
    // etiketler
    kicker(ctx, 'HÜCRENİN İÇİ', span(t, 'b-cells', 0, 'b-name', 0), { dark: true });
    chip(ctx, 'soğan zarı hücreleri', W / 2, 980, span(t, 'b-cells', 3, 'b-rooms', 0), { fill: C.gold, size: 34, scale: lerp(0.8, 1, pop(t, cue('b-cells', 3))) });
    const mic = span(t, 'b-cells', 1, 'b-cells', 3);
    if (mic > 0) {
      card(ctx, 1460, 700, 330, 250, mic);
      microscope(ctx, 1625, 830, 0.9, mic);
    }
    const ra = vis(t, cue('b-rooms', 1) - 0.2, cue('b-name', 0) - 0.3, 0.4, 0.4);
    chip(ctx, 'kükürtlü madde', 595, 215, ra, { size: 32 });
    const sa = vis(t, cue('b-rooms', 2) - 0.2, cue('b-name', 0) - 0.3, 0.4, 0.4);
    chip(ctx, after(t, 'b-rooms', 4, 0.01) > 0 ? 'alliinaz = soğanın makası' : 'alliinaz', 1325, 215, sa, { size: 32, fill: '#e3dcff' });
    chip(ctx, 'duvar', 960, 950, span(t, 'b-wall', 1, 'b-chain', 0), { size: 32, fill: '#efe6ff' });
    chip(ctx, 'kararsız ara ürün · ömrü çok kısa', 600, 950, span(t, 'b-chain', 2, 'b-second', 0), { size: 32, fill: C.gold });
    chip(ctx, 'ikinci enzim', 1320, 950, span(t, 'b-second', 0, 'b-name', 0), { size: 32, fill: '#c9f0dc' });
    nameCard(ctx, t);
    nobelCard(ctx, t);
  };

  function molecules(ctx, t, a) {
    // bıçak duvarı yarar
    const bt = breakAt();
    const slash = progress(t, bt - 0.45, bt, ease.in);
    const sa = vis(t, bt - 0.5, bt + 0.5, 0.1, 0.3);
    if (sa > 0) knife(ctx, 960, lerp(-260, 560, slash), 520, Math.PI / 2, { a: sa * a });
    ctx.save();
    ctx.globalAlpha *= a;
    for (let i = 0; i < MOLS.length; i++) {
      const [x, y] = molPos(i, t);
      const sn = snipAt(i);
      const gr = grabAt(i);
      if (t < sn) sulfurMol(ctx, x, y, 2.0, 1, Math.sin(t + i) * 0.3);
      else if (t < gr) {
        wobblyMol(ctx, x, y, 1.9, t, 1, i);
        // yan ürün (pirüvik asit) küçük gri boncuklar
        const d = t - sn;
        ctx.fillStyle = 'rgba(200,205,215,0.8)';
        dot(ctx, x - 20 - d * 10, y + 40 + d * 30, 7);
      } else {
        const d = t - gr;
        const gy = Math.max(HOUSE.y + 90 + i * 22, y - d * 120);
        glow(ctx, x, gy, 70, GAS, 0.4);
        gasMol(ctx, x + Math.sin(t * 1.6 + i) * 26, gy + Math.sin(t * 2.1 + i * 2) * 10, 2.2, 1, t * 0.4 + i);
      }
      // kesme anı: parıltı
      const ds = t - sn;
      if (ds >= 0 && ds < 0.3) glow(ctx, x + 30, y, 90, [255, 255, 255], 0.8 * (1 - ds / 0.3));
    }
    // makaslar
    for (let i = 0; i < SCIS.length; i++) {
      const [x, y] = scisPos(i, t);
      const ds = t - snipAt(i);
      const open = ds > -0.4 && ds < 0.2 ? clamp(Math.abs(ds) * 4) : 0.5 + 0.3 * Math.sin(t * 3 + i);
      const leave = progress(t, snipAt(i) + 0.4, snipAt(i) + 1.6, ease.inOut);
      scissorEnzyme(ctx, x + leave * 900, y - leave * 80, 1.25, open, 1 - leave, Math.PI + Math.sin(t + i) * 0.2);
    }
    // ikinci enzim (yakalayıcılar)
    for (let i = 0; i < MOLS.length; i++) {
      const g0 = cue('b-second', 0) + i * 0.15;
      const gr = grabAt(i);
      const ca = vis(t, g0, gr + 1.4, 0.4, 0.6);
      if (ca <= 0) continue;
      const [mx, my] = molPos(i, t);
      const come = progress(t, g0, gr, ease.out);
      const x = lerp(mx - 40, mx - 70, come);
      const y = lerp(H + 120, my + 10, come);
      const grab = t > gr - 0.15 ? clamp((t - gr + 0.15) / 0.2) : 0.3 + 0.3 * Math.sin(t * 5 + i);
      catcherEnzyme(ctx, x - progress(t, gr + 0.3, gr + 1.4) * 200, y + progress(t, gr + 0.3, gr + 1.4) * 300, 1.0, grab, ca);
    }
    ctx.restore();
  }

  function microscope(ctx, x, y, s, a) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = C.navy;
    roundRect(ctx, -90, 80, 180, 26, 10);
    ctx.fill();
    ctx.lineWidth = 22;
    ctx.strokeStyle = C.navy;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(10, 20, 70, -Math.PI * 0.5, Math.PI * 0.45);
    ctx.stroke();
    ctx.save();
    ctx.rotate(-0.5);
    roundRect(ctx, -40, -110, 40, 120, 10);
    ctx.fillStyle = C.copper;
    ctx.fill();
    outline(ctx, 4);
    ctx.restore();
    ctx.fillStyle = C.gold;
    roundRect(ctx, -60, 30, 90, 12, 4);
    ctx.fill();
    ctx.restore();
  }

  function nameCard(ctx, t) {
    const a = vis(t, cue('b-name', 0) - 0.4, cue('b-nobel', 0) - 0.2, 0.5, 0.5);
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha = 0.72 * a;
    ctx.fillStyle = C.deep;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    const ma = a * after(t, 'b-name', 0, 0.8);
    glow(ctx, W / 2, 420, 420, GAS, 0.35 * ma);
    lfMolecule(ctx, W / 2 - 40, 450 + Math.sin(t * 1.3) * 8, 1.25, ma);
    const n1 = after(t, 'b-name', 1, 0.5);
    text(ctx, 'sin-propantiyal-S-oksit', W / 2, 720, { size: 70, weight: 800, color: C.cream, alpha: a * n1, family: 'display' });
    text(ctx, 'C₃H₆OS', W / 2, 800, { size: 38, weight: 600, color: 'rgba(243,237,225,0.75)', alpha: a * n1 });
    const n2 = after(t, 'b-name', 2, 0.5);
    chip(ctx, '= ağlatan gaz', W / 2, 900, a * n2, { fill: C.gold, size: 44, scale: lerp(0.7, 1, pop(t, cue('b-name', 2))) });
    drop(ctx, W / 2 + 230, 880 + 10 * Math.sin(t * 3), 16, { a: a * n2 });
    bubble(ctx, 'xLaugh', 1640, 300, 150, a * after(t, 'b-name', 0, 0.3), pop(t, cue('b-name', 0)));
  }

  function medal(ctx, x, y, r, a) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = C.tomato;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.7, y - r * 1.9);
    ctx.lineTo(x - r * 0.15, y - r * 0.6);
    ctx.lineTo(x + r * 0.15, y - r * 0.6);
    ctx.lineTo(x + r * 0.7, y - r * 1.9);
    ctx.closePath();
    ctx.fill();
    outline(ctx, 4);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = C.gold;
    ctx.fill();
    outline(ctx, 5);
    ctx.beginPath();
    ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(140,90,20,0.6)';
    ctx.stroke();
    ctx.restore();
    text(ctx, 'Ig', x, y + 3, { size: r * 0.8, weight: 900, color: '#7a4a10', alpha: a, family: 'display' });
  }

  function nobelCard(ctx, t) {
    const a = vis(t, cue('b-nobel', 0) - 0.3, Infinity, 0.5, 0);
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha = 0.72 * a;
    ctx.fillStyle = C.deep;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // keşif kartı
    card(ctx, 170, 220, 760, 560, a);
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = '#fff';
    roundRect(ctx, 230, 280, 150, 100, 8);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#d6cfc2';
    ctx.stroke();
    ctx.fillStyle = '#bc002d';
    dot(ctx, 305, 330, 30);
    ctx.restore();
    text(ctx, '2002', 420, 330, { size: 96, weight: 900, color: C.navy, align: 'left', alpha: a, family: 'display' });
    text(ctx, 'Japonya · Nature dergisi', 230, 440, { size: 36, weight: 700, color: C.navy, align: 'left', alpha: a });
    text(ctx, 'İkinci enzim bulundu:', 230, 510, { size: 32, weight: 500, color: C.muted, align: 'left', alpha: a });
    text(ctx, 'göz yaşartıcı faktör sentazı', 230, 560, { size: 34, weight: 800, color: C.catcher, align: 'left', alpha: a });
    const old = a * after(t, 'b-nobel', 1, 0.5);
    text(ctx, 'Önceki fikir: "gaz kendiliğinden oluşur"', 230, 660, { size: 30, weight: 600, color: C.muted, align: 'left', alpha: old });
    if (old > 0) {
      const w = measure(ctx, 'Önceki fikir: "gaz kendiliğinden oluşur"', { size: 30, weight: 600 });
      ctx.save();
      ctx.globalAlpha *= old;
      ctx.strokeStyle = C.tomato;
      ctx.lineWidth = 5;
      line(ctx, 225, 662, 225 + (w + 10) * after(t, 'b-nobel', 1, 1.2, ease.inOut), 662);
      ctx.restore();
    }
    // ödül kartı
    const b = a * after(t, 'b-nobel', 2, 0.6);
    const s = pop(t, cue('b-nobel', 2));
    card(ctx, 1000, 220 + 30 * (1 - s), 760, 560, b);
    medal(ctx, 1380, 430 + 30 * (1 - s), 90, b);
    text(ctx, 'İg Nobel · Kimya · 2013', 1380, 600 + 30 * (1 - s), { size: 44, weight: 900, color: C.navy, alpha: b, family: 'display' });
    text(ctx, 'önce güldüren, sonra düşündüren', 1380, 670 + 30 * (1 - s), { size: 32, weight: 600, color: C.muted, alpha: b });
    bubble(ctx, 'xLaugh', 1640, 900, 120, a * span(t, 'b-nobel', 3, 'b-nobel', 4, 0.2, 0.2), pop(t, cue('b-nobel', 3)));
    bubble(ctx, 'xThink', 1640, 900, 120, a * after(t, 'b-nobel', 4, 0.2), pop(t, cue('b-nobel', 4)));
  }

  // ---------------------------------------------------------------------------
  // 5 · Göz: gaz yükselir, korneadaki sinirler alarm verir, gözyaşı itfaiyesi gelir
  // ---------------------------------------------------------------------------
  // Karakterin baş görüntüsündeki (ağız sayfası koordinatları) bir noktanın tuvaldeki yeri
  function headPoint(x, y, h, mx, my, pose = 'body') {
    const P = A[pose];
    const s = h / P.h;
    return [x + (P.hx + mx * P.hs - P.w / 2) * s, y - h + (P.hy + my * P.hs) * s];
  }

  function brain(ctx, x, y, s, a, lit = 0) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    if (lit > 0) glow(ctx, 0, 0, 220, RED, 0.5 * lit);
    ctx.beginPath();
    ctx.moveTo(-120, 20);
    ctx.bezierCurveTo(-150, -60, -80, -120, -10, -105);
    ctx.bezierCurveTo(50, -135, 140, -95, 130, -20);
    ctx.bezierCurveTo(165, 30, 110, 90, 50, 70);
    ctx.bezierCurveTo(20, 110, -60, 100, -70, 70);
    ctx.bezierCurveTo(-130, 80, -150, 50, -120, 20);
    ctx.closePath();
    ctx.fillStyle = '#f6b8b8';
    ctx.fill();
    outline(ctx, 6);
    ctx.strokeStyle = 'rgba(160,70,80,0.7)';
    ctx.lineWidth = 5;
    for (const [a1, b1, c1, d1] of [[-90, -60, -40, 0], [-20, -80, 20, -20], [40, -70, 90, -10], [-60, 20, 0, 50], [30, 10, 80, 40]]) {
      ctx.beginPath();
      ctx.moveTo(a1, b1);
      ctx.quadraticCurveTo((a1 + c1) / 2 + 20, (b1 + d1) / 2 - 20, c1, d1);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Göz kesiti (yandan, sola bakan): kornea solda
  const EYE = { x: 1180, y: 560, r: 280 };
  const NERVE = [[EYE.x - EYE.r - 60, EYE.y - 40], [EYE.x - 120, EYE.y - 330], [EYE.x + 200, EYE.y - 380], [1560, 260]];
  function nervePoint(p) {
    // NERVE çoklu çizgisi boyunca 0..1
    const seg = NERVE.length - 1;
    const k = Math.min(seg - 1, Math.floor(p * seg));
    const f = p * seg - k;
    return [lerp(NERVE[k][0], NERVE[k + 1][0], f), lerp(NERVE[k][1], NERVE[k + 1][1], f)];
  }
  function eyeSection(ctx, t, a, { lit = 0, wash = 0 } = {}) {
    if (a <= 0.002) return;
    const { x, y, r } = EYE;
    ctx.save();
    ctx.globalAlpha *= a;
    // sinir yolu
    ctx.strokeStyle = lit > 0 ? `rgba(255,181,71,${0.5 + 0.5 * lit})` : 'rgba(194,124,78,0.6)';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    NERVE.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.stroke();
    // göz küresi
    shadowed(ctx, 30, 10, () => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#fffdf8';
      ctx.fill();
    });
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    outline(ctx, 7);
    // görme siniri
    ctx.fillStyle = '#f2d39a';
    roundRect(ctx, x + r - 20, y - 34, 170, 68, 30);
    ctx.fill();
    outline(ctx, 5);
    // mercek ve iris
    ctx.beginPath();
    ctx.ellipse(x - r * 0.62, y, 52, 110, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200,225,255,0.85)';
    ctx.fill();
    outline(ctx, 5);
    ctx.fillStyle = '#7a4b2a';
    roundRect(ctx, x - r * 0.84, y - 140, 26, 92, 10);
    ctx.fill();
    roundRect(ctx, x - r * 0.84, y + 48, 26, 92, 10);
    ctx.fill();
    // kornea: öne doğru şişkin şeffaf kubbe
    ctx.beginPath();
    ctx.ellipse(x - r * 0.9, y, 95, 175, 0, Math.PI * 0.5, Math.PI * 1.5);
    ctx.fillStyle = wash > 0 ? `rgba(90,169,255,${0.25 + 0.35 * wash})` : 'rgba(190,225,255,0.55)';
    ctx.fill();
    outline(ctx, 6);
    // korneadaki sinir uçları
    const nl = 0.35 + 0.65 * lit;
    ctx.strokeStyle = `rgba(255,170,40,${nl})`;
    ctx.lineWidth = 4;
    for (let i = 0; i < 9; i++) {
      const ang = Math.PI * (0.62 + i * 0.095);
      const px = x - r * 0.9 + Math.cos(ang) * 82;
      const py = y + Math.sin(ang) * 160;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + 26, py - 10 + (i - 4) * 4);
      ctx.lineTo(px + 52, py - 4 + (i - 4) * 7);
      ctx.stroke();
      if (lit > 0) glow(ctx, px, py, 34, GOLD, 0.7 * lit);
    }
    ctx.restore();
  }

  // Gözyaşı bezi: gözün üst-ön tarafında badem biçimli
  function gland(ctx, x, y, a, squeeze = 0) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(1 + 0.08 * squeeze, 1 - 0.1 * squeeze);
    ctx.beginPath();
    ctx.ellipse(0, 0, 90, 46, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#f4a6b4';
    ctx.fill();
    outline(ctx, 5);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(-24, -12, 30, 10, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Kask takmış itfaiyeci damla
  function fireDrop(ctx, x, y, r, a, helmet) {
    drop(ctx, x, y, r, { a });
    if (helmet <= 0.002 || a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a * helmet;
    ctx.fillStyle = C.tomato;
    ctx.beginPath();
    ctx.arc(x, y - r * 0.5, r * 0.85, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    outline(ctx, 3);
    ctx.fillStyle = C.gold;
    roundRect(ctx, x - r * 1.05, y - r * 0.6, r * 2.1, r * 0.3, r * 0.1);
    ctx.fill();
    ctx.fillStyle = INK;
    dot(ctx, x - r * 0.3, y + r * 0.2, r * 0.13);
    dot(ctx, x + r * 0.3, y + r * 0.2, r * 0.13);
    ctx.restore();
  }

  DRAW.eye = function sceneEye(ctx, lt, t) {
    paperBg(ctx, t);
    const sw = cue('g-cornea', 0) - 0.4;
    // a) gaz yüze yükselir
    const fa = layer(t, sceneStart('eye'), sw, 0);
    if (fa > 0) {
      ctx.save();
      ctx.globalAlpha *= fa;
      kicker(ctx, 'GAZIN YOLCULUĞU', after(t, 'g-rise', 0, 0.6));
      // tahta ve soğan
      ctx.fillStyle = '#b77a45';
      roundRect(ctx, 1150, 880, 560, 70, 20);
      ctx.fill();
      outline(ctx, 5);
      onionFace(ctx, 1330, 830, 95, { glow: 0.5 });
      onionFace(ctx, 1530, 840, 85);
      const hit = cue('g-rise', 1) + 1.6;
      const squint = t > hit + 0.4 ? 2 : t > hit ? 1 : 4;
      const hx = 560;
      const hy = 2650;
      const hh = 2500;
      host(ctx, t, hx, hy, hh, { eyes: squint, talk: true });
      const [ex, ey] = headPoint(hx, hy, hh, 330, 315);
      // akan gaz
      for (let i = 0; i < 22; i++) {
        const life = (t * 0.32 + hash(i, 31)) % 1;
        const p = ease.inOut(life);
        const sx = 1330 + (hash(i, 32) - 0.5) * 180;
        const sy = 760;
        const cx = lerp(sx, ex, 0.5) + 120;
        const cy = lerp(sy, ey, 0.5) - 160;
        const x = (1 - p) * (1 - p) * sx + 2 * (1 - p) * p * cx + p * p * ex + Math.sin(t * 2 + i) * 20;
        const y = (1 - p) * (1 - p) * sy + 2 * (1 - p) * p * cy + p * p * ey;
        gasMol(ctx, x, y, 1.5, Math.sin(Math.PI * life) * after(t, 'g-rise', 0, 1.0), t + i);
      }
      const ta = clamp((t - hit - 0.5) / 0.5);
      for (let i = 0; i < 3 && ta > 0; i++) {
        const life = ((t - hit) * 0.6 + i / 3) % 1;
        drop(ctx, ex + 40 + i * 20, ey + 40 + life * 160, 14, { a: ta * (1 - life) });
      }
      chip(ctx, 'çok uçucu: hemen havaya karışır', 1430, 420, after(t, 'g-rise', 1, 0.5), { size: 34 });
      ctx.restore();
    }
    // b) göz kesiti
    const ea = progress(t, sw, sw + 0.6);
    if (ea <= 0) return;
    ctx.save();
    ctx.globalAlpha *= ea;
    paperBg(ctx, t);
    kicker(ctx, 'GÖZÜN ÖN YÜZEYİ', 1);
    const hitT = cue('g-signal', 0) + 0.5;
    const lit = clamp((t - hitT) / 0.3) * (0.7 + 0.3 * Math.sin(t * 9)) + (t > cue('g-cornea', 3) && t < cue('g-cornea', 3) + 0.8 ? 0.8 : 0);
    const wash = progress(t, cue('g-reflex', 0) + 0.6, cue('g-reflex', 0) + 2.0);
    eyeSection(ctx, t, 1, { lit: clamp(lit) * (1 - wash * 0.8), wash });
    brain(ctx, 1600, 230, 0.95, 1, span(t, 'g-signal', 2, null, 0) * (0.6 + 0.4 * Math.sin(t * 8)));
    // kornea etiketi
    const ka = span(t, 'g-cornea', 1, 'g-reflex', 0);
    ctx.save();
    ctx.globalAlpha *= ka;
    ctx.strokeStyle = C.navy;
    ctx.lineWidth = 4;
    line(ctx, EYE.x - EYE.r - 70, EYE.y + 120, EYE.x - EYE.r - 220, EYE.y + 260);
    ctx.restore();
    chip(ctx, 'kornea', EYE.x - EYE.r - 260, EYE.y + 290, ka, { size: 36, fill: C.navy, color: C.cream });
    chip(ctx, 'vücudun en yoğun sinirli dokularından biri', 760, 950, span(t, 'g-cornea', 2, 'g-signal', 0), { size: 34, fill: C.gold });
    // toz zerresi
    const da = span(t, 'g-cornea', 3, 'g-signal', 0, 0.2, 0.3);
    if (da > 0) {
      const p = after(t, 'g-cornea', 3, 0.8, ease.in);
      ctx.save();
      ctx.globalAlpha *= da;
      ctx.fillStyle = '#8a7a66';
      dot(ctx, lerp(200, EYE.x - EYE.r * 0.9 - 92, p), EYE.y - 40, 9);
      ctx.restore();
    }
    // gaz molekülleri korneaya çarpar
    const gA = span(t, 'g-signal', 0, 'g-reflex', 1);
    for (let i = 0; i < 10 && gA > 0; i++) {
      const life = (t * 0.5 + hash(i, 41)) % 1;
      const x = lerp(120, EYE.x - EYE.r * 0.9 - 96, life);
      const y = EYE.y + (hash(i, 42) - 0.5) * 300 * (1 - life * 0.6);
      gasMol(ctx, x, y, 1.6, gA * Math.min(1, (1 - life) * 4), i + t);
    }
    // sinyal beyne koşar
    const sp = progress(t, cue('g-signal', 1), cue('g-signal', 1) + 1.2, ease.inOut);
    const sigA = span(t, 'g-signal', 1, 'g-signal', 2, 0.1, 0.3);
    if (sigA > 0) {
      const [px, py] = nervePoint(sp);
      glow(ctx, px, py, 80, RED, 0.8 * sigA);
      chip(ctx, 'yanıyor!', px, py - 60, sigA, { fill: C.tomato, color: '#fff', size: 32 });
    }
    // beynin emri
    const ya = span(t, 'g-signal', 3, 'g-reflex', 1, 0.1, 0.4);
    if (ya > 0) {
      ctx.save();
      ctx.globalAlpha *= ya;
      stamp(ctx, 'YIKA!', C.tomato, 1560, 470, cue('g-signal', 3) - 0.1, t, { size: 90, rot: 0.08 });
      ctx.restore();
    }
    // gözyaşı bezi ve damlalar
    const gx = EYE.x - EYE.r * 0.55;
    const gy = EYE.y - EYE.r - 30;
    const glA = after(t, 'g-reflex', 0, 0.5);
    gland(ctx, gx, gy, glA, 0.5 + 0.5 * Math.sin(t * 6));
    chip(ctx, 'gözyaşı bezi', gx - 40, gy - 90, span(t, 'g-reflex', 0, 'g-reflex', 2), { size: 30, fill: '#fde1e6' });
    const helmet = after(t, 'g-reflex', 3, 0.4);
    for (let i = 0; i < 9 && glA > 0; i++) {
      const life = (t * 0.55 + hash(i, 51)) % 1;
      const x = gx - 60 - life * 140 + Math.sin(life * 4 + i) * 10;
      const y = gy + 40 + life * 520;
      fireDrop(ctx, x, y, 18 + 4 * hash(i, 52), glA * Math.sin(Math.PI * life), helmet);
    }
    chip(ctx, 'duygusal değil', 600, 880, span(t, 'g-reflex', 1, 'g-reflex', 2, 0.3, 0.3), { size: 34 });
    chip(ctx, 'koruyucu bir refleks', 600, 880, after(t, 'g-reflex', 2, 0.4), { size: 38, fill: C.navy, color: C.cream, scale: lerp(0.8, 1, pop(t, cue('g-reflex', 2))) });
    bubble(ctx, 'xCry', 300, 330, 140, span(t, 'g-reflex', 1, null, 0), pop(t, cue('g-reflex', 1)));
    ctx.restore();
  };

  // ---------------------------------------------------------------------------
  // 6 · Soğan bunu neden yapıyor? Kaçamayan bitkinin kimyasal alarmı; sarımsakla fark; lezzetin bedeli
  // ---------------------------------------------------------------------------
  function rabbit(ctx, x, y, s, t, { a = 1, lunge = 0, cry = 0, run = 0 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    const hop = run > 0 ? Math.abs(Math.sin(t * 14)) * 20 : Math.abs(Math.sin(t * 3)) * 4;
    ctx.translate(0, -hop);
    const fur = '#cdbfae';
    // kuyruk ve gövde (sola bakar)
    ctx.fillStyle = '#fff';
    dot(ctx, 120, -40, 26);
    ctx.beginPath();
    ctx.ellipse(40, -70, 110, 80, 0, 0, Math.PI * 2);
    ctx.fillStyle = fur;
    ctx.fill();
    outline(ctx, 5);
    // arka bacak
    ctx.beginPath();
    ctx.ellipse(70, -8, 60, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    outline(ctx, 5);
    // baş
    ctx.save();
    ctx.translate(-70 - lunge * 60, -120 + lunge * 20);
    ctx.save();
    ctx.rotate(-0.2);
    for (const dx of [10, 40]) {
      ctx.beginPath();
      ctx.ellipse(dx, -90, 18, 60, 0.15, 0, Math.PI * 2);
      ctx.fillStyle = fur;
      ctx.fill();
      outline(ctx, 5);
      ctx.beginPath();
      ctx.ellipse(dx, -90, 8, 42, 0.15, 0, Math.PI * 2);
      ctx.fillStyle = '#f2b7c0';
      ctx.fill();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.ellipse(0, 0, 62, 52, 0, 0, Math.PI * 2);
    ctx.fillStyle = fur;
    ctx.fill();
    outline(ctx, 5);
    ctx.fillStyle = INK;
    if (cry > 0.5) {
      ctx.lineWidth = 5;
      ctx.strokeStyle = INK;
      line(ctx, -32, -14, -12, -8);
    } else dot(ctx, -22, -10, 8);
    ctx.fillStyle = '#e88a9a';
    dot(ctx, -58, 6, 8);
    ctx.restore();
    // ön bacak
    ctx.beginPath();
    ctx.ellipse(-40, -10, 22, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = fur;
    ctx.fill();
    outline(ctx, 4);
    ctx.restore();
    if (cry > 0) {
      for (let i = 0; i < 2; i++) {
        const life = (t * 1.2 + i / 2) % 1;
        drop(ctx, x + (-90 - lunge * 60) * s - 10, y + (-130 + life * 90) * s, 10 * s * 1.6, { a: a * cry * (1 - life) });
      }
    }
  }

  function check(ctx, x, y, ok, a, s = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.fillStyle = ok ? C.sage : C.tomato;
    ctx.fill();
    outline(ctx, 4);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (ok) {
      ctx.moveTo(-16, 2);
      ctx.lineTo(-4, 15);
      ctx.lineTo(18, -12);
    } else {
      ctx.moveTo(-14, -14);
      ctx.lineTo(14, 14);
      ctx.moveTo(14, -14);
      ctx.lineTo(-14, 14);
    }
    ctx.stroke();
    ctx.restore();
  }

  function flameIcon(ctx, x, y, s, t, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s * (1 + 0.06 * Math.sin(t * 12)));
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.bezierCurveTo(40, -20, 44, 20, 0, 40);
    ctx.bezierCurveTo(-44, 20, -40, -20, 0, -60);
    ctx.fillStyle = C.terra;
    ctx.fill();
    outline(ctx, 4);
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.bezierCurveTo(20, 0, 20, 20, 0, 32);
    ctx.bezierCurveTo(-20, 20, -20, 0, 0, -20);
    ctx.fillStyle = C.gold;
    ctx.fill();
    ctx.restore();
  }

  function pan(ctx, x, y, s, t, a = 1, brown = 0) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = '#2f3440';
    roundRect(ctx, 150, -16, 190, 32, 14);
    ctx.fill();
    outline(ctx, 4);
    ctx.beginPath();
    ctx.ellipse(0, 0, 170, 60, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#3c4250';
    ctx.fill();
    outline(ctx, 5);
    ctx.beginPath();
    ctx.ellipse(0, -6, 145, 46, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#20242d';
    ctx.fill();
    // doğranmış soğan
    for (let i = 0; i < 26; i++) {
      const px = (hash(i, 61) - 0.5) * 230;
      const py = (hash(i, 62) - 0.5) * 60 - 6;
      const col = [lerp(250, 196, brown), lerp(240, 120, brown), lerp(215, 50, brown)].map(Math.round);
      ctx.fillStyle = `rgb(${col})`;
      ctx.beginPath();
      ctx.ellipse(px, py + Math.sin(t * 8 + i) * 1.5, 16, 7, hash(i, 63) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    for (let i = 0; i < 3; i++) wisp(ctx, x - 80 * s + i * 80 * s, y - 50 * s, 160 * s, t + i, a * 0.7, { color: 'rgba(255,200,110,0.85)', lw: 7, seed: i });
  }

  DRAW.why = function sceneWhy(ctx, lt, t) {
    paperBg(ctx, t);
    const sw = cue('n-garlic', 0) - 0.4;
    // a) tarla: kaçamayan soğan ve tavşan
    const fa = layer(t, sceneStart('why'), sw, 0);
    if (fa > 0) {
      ctx.save();
      ctx.globalAlpha *= fa;
      kicker(ctx, 'BİTKİ KAÇAMAZ', after(t, 'n-why', 0, 0.6));
      ctx.fillStyle = '#9c6b45';
      ctx.fillRect(0, 760, W, H - 760);
      ctx.fillStyle = '#7fa86a';
      ctx.fillRect(0, 740, W, 30);
      // kökler
      ctx.strokeStyle = '#d9c39a';
      ctx.lineWidth = 5;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(700 + (i - 4) * 8, 790);
        ctx.quadraticCurveTo(700 + (i - 4) * 30, 880, 700 + (i - 4) * 40, 960);
        ctx.stroke();
      }
      // yapraklar
      ctx.strokeStyle = '#5f9a55';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      for (const [dx, h] of [[-30, 300], [0, 360], [30, 280]]) {
        ctx.beginPath();
        ctx.moveTo(700, 560);
        ctx.quadraticCurveTo(700 + dx, 560 - h * 0.6, 700 + dx * 2 + Math.sin(t + dx) * 10, 560 - h);
        ctx.stroke();
      }
      // kaçmaya çalışan bacaklar
      const legs = span(t, 'n-why', 1, 'n-defense', 0, 0.3, 0.3);
      if (legs > 0) {
        ctx.save();
        ctx.globalAlpha *= legs;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 9;
        for (const sgn of [-1, 1]) {
          const ph = Math.sin(t * 16 + (sgn > 0 ? Math.PI : 0));
          ctx.beginPath();
          ctx.moveTo(700 + sgn * 50, 740);
          ctx.lineTo(700 + sgn * 60 + ph * 30, 790);
          ctx.stroke();
          ctx.fillStyle = C.tomato;
          ctx.beginPath();
          ctx.ellipse(700 + sgn * 60 + ph * 30 + 14, 794, 24, 12, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        for (let i = 0; i < 2; i++) drop(ctx, 830 + i * 30, 560 + ((t * 2 + i * 0.5) % 1) * 40, 10, { a: legs, color: '#bfe3ff' });
      }
      onionWhole(ctx, 700, 660, 120, { rot: legs > 0 ? Math.sin(t * 16) * 0.05 : 0 });
      chip(ctx, 'bitkiler kaçamaz', 700, 300, span(t, 'n-why', 1, 'n-defense', 0), { size: 36 });
      // tavşan
      const come = progress(t, cue('n-why', 2) - 0.2, cue('n-why', 2) + 1.4, ease.out);
      const bite = cue('n-defense', 0) + 0.3;
      const lunge = vis(t, bite - 0.3, bite + 0.5, 0.25, 0.3);
      const runP = progress(t, cue('n-defense', 2) + 0.4, cue('n-defense', 2) + 2.2, ease.in);
      rabbit(ctx, lerp(W + 250, 1010, come) + runP * 1200, 760, 1.25, t, { lunge, cry: after(t, 'n-defense', 2, 0.3), run: runP });
      // alarm halkaları
      const al = vis(t, bite, lineEnd('n-defense') + 0.6, 0.1, 0.4);
      for (let i = 0; i < 4 && al > 0; i++) {
        const p = ((t - bite) * 0.8 + i / 4) % 1;
        ctx.save();
        ctx.globalAlpha *= al * (1 - p);
        ctx.strokeStyle = C.tomato;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(700, 640, 140 + p * 380, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      chip(ctx, 'kimyasal savunma', 700, 300, span(t, 'n-defense', 0, null, 0), { size: 36, fill: C.tomato, color: '#fff', scale: lerp(0.8, 1, pop(t, cue('n-defense', 0))) });
      chip(ctx, 'ısıranın ağzını ve gözünü yakan alarm', 1180, 400, after(t, 'n-defense', 2, 0.5), { size: 32, fill: C.navy, color: C.cream });
      ctx.restore();
    }
    // b) soğan ve sarımsak; c) lezzet çatalı
    const fl = cue('n-flavor', 0) - 0.3;
    const ga = layer(t, sw, fl, 0.5) * progress(t, sw, sw + 0.5);
    if (ga > 0) {
      ctx.save();
      ctx.globalAlpha *= ga;
      paperBg(ctx, t);
      kicker(ctx, 'SOĞAN VE SARIMSAK', 1);
      onionWhole(ctx, 1080, 300, 90);
      garlic(ctx, 1480, 300, 90);
      text(ctx, 'Soğan', 1080, 450, { size: 40, weight: 800, color: C.navy, family: 'display' });
      text(ctx, 'Sarımsak', 1480, 450, { size: 40, weight: 800, color: C.navy, family: 'display' });
      const rows = [
        ['makas (alliinaz)', true, true, cue('n-garlic', 0) + 0.6],
        ['ikinci enzim', true, false, cue('n-garlic', 1)],
      ];
      rows.forEach(([lab, a1, a2, at], i) => {
        const ra = progress(t, at - 0.2, at + 0.3);
        const y = 560 + i * 120;
        text(ctx, lab, 820, y, { size: 38, weight: 700, color: C.navy, align: 'right', alpha: ra });
        check(ctx, 1080, y, a1, ra, pop(t, at));
        check(ctx, 1480, y, a2, ra, pop(t, at + 0.15));
      });
      const r3 = after(t, 'n-garlic', 2, 0.5);
      text(ctx, 'sonuç', 820, 800, { size: 38, weight: 700, color: C.navy, align: 'right', alpha: r3 });
      drop(ctx, 1080, 800, 26, { a: r3 });
      text(ctx, 'ağlatır', 1080, 870, { size: 32, weight: 700, color: C.muted, alpha: r3 });
      flameIcon(ctx, 1480, 795, 0.8, t, r3);
      text(ctx, 'ağzı yakar', 1480, 870, { size: 32, weight: 700, color: C.muted, alpha: r3 });
      ctx.restore();
    }
    const fa2 = progress(t, fl, fl + 0.6);
    if (fa2 > 0) {
      ctx.save();
      ctx.globalAlpha *= fa2;
      paperBg(ctx, t);
      kicker(ctx, 'AYNI YERDEN BAŞLAR', 1);
      card(ctx, W / 2 - 330, 170, 660, 150, after(t, 'n-flavor', 1, 0.5));
      sulfurMol(ctx, W / 2 - 200, 245, 1.6, after(t, 'n-flavor', 1, 0.5));
      scissorEnzyme(ctx, W / 2 - 60, 245, 0.8, 0.5 + 0.4 * Math.sin(t * 4), after(t, 'n-flavor', 1, 0.5), Math.PI);
      text(ctx, 'kesilen hücre', W / 2 + 140, 245, { size: 38, weight: 800, color: C.navy, alpha: after(t, 'n-flavor', 1, 0.5) });
      const b1 = after(t, 'n-flavor', 1, 0.8);
      arrow(ctx, W / 2 - 120, 330, 560, 470, { color: C.terra, p: b1 });
      arrow(ctx, W / 2 + 120, 330, 1360, 470, { color: C.terra, p: after(t, 'n-flavor', 2, 0.8) });
      drop(ctx, 520, 560, 40, { a: b1 });
      text(ctx, 'gözü yakan gaz', 520, 680, { size: 40, weight: 800, color: C.navy, alpha: b1 });
      pan(ctx, 1380, 600, 0.9, t, after(t, 'n-flavor', 3, 0.6), 0.5);
      text(ctx, 'keskin, iştah açan tat', 1380, 700, { size: 40, weight: 800, color: C.navy, alpha: after(t, 'n-flavor', 3, 0.6) });
      // fiyat etiketi
      const pa = after(t, 'n-flavor', 4, 0.6);
      if (pa > 0) {
        const sw2 = Math.sin(t * 2) * 0.06;
        ctx.save();
        ctx.globalAlpha *= pa;
        ctx.translate(W / 2, 760);
        ctx.rotate(sw2);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        line(ctx, 0, -40, 0, 10);
        card(ctx, -240, 10, 480, 150, 1, { fill: C.gold, r: 20, border: INK, lw: 4 });
        text(ctx, 'lezzetin bedeli:', 0, 55, { size: 32, weight: 700, color: C.navy });
        text(ctx, 'biraz gözyaşı', 0, 110, { size: 46, weight: 900, color: C.navy, family: 'display' });
        ctx.restore();
      }
      ctx.restore();
    }
  };

  // ---------------------------------------------------------------------------
  // 7 · Her soğan aynı değil: keskinlik pirüvik asitle ölçülür
  // ---------------------------------------------------------------------------
  function beaker(ctx, x, y, s, level, t, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(-90, -150);
    ctx.lineTo(-80, 120);
    ctx.quadraticCurveTo(-78, 140, -58, 140);
    ctx.lineTo(58, 140);
    ctx.quadraticCurveTo(78, 140, 80, 120);
    ctx.lineTo(90, -150);
    ctx.fillStyle = 'rgba(235,245,250,0.9)';
    ctx.fill();
    ctx.save();
    ctx.clip();
    const top = lerp(130, -60, level);
    ctx.fillStyle = 'rgba(240,226,160,0.9)';
    ctx.beginPath();
    ctx.moveTo(-100, top);
    for (let x2 = -100; x2 <= 100; x2 += 10) ctx.lineTo(x2, top + Math.sin(x2 * 0.08 + t * 3) * 4);
    ctx.lineTo(100, 160);
    ctx.lineTo(-100, 160);
    ctx.fill();
    ctx.restore();
    outline(ctx, 6);
    ctx.strokeStyle = 'rgba(43,31,26,0.5)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) line(ctx, -78, 90 - i * 50, -50, 90 - i * 50);
    ctx.restore();
  }

  DRAW.vary = function sceneVary(ctx, lt, t) {
    paperBg(ctx, t);
    const sw = cue('k-vary', 0) - 0.3;
    const fa = layer(t, sceneStart('vary'), sw, 0);
    if (fa > 0) {
      ctx.save();
      ctx.globalAlpha *= fa;
      kicker(ctx, 'KESKİNLİK NASIL ÖLÇÜLÜR?', after(t, 'k-measure', 0, 0.6));
      // üç farklı soğan
      [[360, 0.8], [560, 1], [760, 1.15]].forEach(([x, sc], i) => onionWhole(ctx, x, 470, 80 * sc, { a: after(t, 'k-measure', 0, 0.5 + i * 0.2), rot: Math.sin(t + i) * 0.05 }));
      // makas çalışır, gri boncuklar (pirüvik asit) behere düşer
      const ma = after(t, 'k-measure', 1, 0.6);
      scissorEnzyme(ctx, 1080, 360, 1.3, 0.5 + 0.45 * Math.sin(t * 6), ma, Math.PI);
      sulfurMol(ctx, 1240, 360, 1.8, ma * (0.6 + 0.4 * Math.sin(t * 6)));
      for (let i = 0; i < 10 && ma > 0; i++) {
        const life = (t * 0.6 + hash(i, 71)) % 1;
        ctx.save();
        ctx.globalAlpha *= ma * Math.min(1, (1 - life) * 3);
        ctx.fillStyle = '#9aa0ab';
        dot(ctx, 1160 + (hash(i, 72) - 0.5) * 100, 420 + life * 300, 11);
        ctx.restore();
      }
      beaker(ctx, 1160, 700, 1.0, 0.25 + 0.35 * after(t, 'k-measure', 1, 6, ease.linear), t, ma);
      chip(ctx, 'yan ürün: pirüvik asit', 1450, 520, ma, { size: 34, fill: '#e6e8ec' });
      chip(ctx, 'ne kadar çoksa, soğan o kadar keskin', 560, 760, after(t, 'k-measure', 2, 0.5), { size: 36, fill: C.navy, color: C.cream });
      ctx.restore();
    }
    const va = progress(t, sw, sw + 0.6);
    if (va <= 0) return;
    ctx.save();
    ctx.globalAlpha *= va;
    paperBg(ctx, t);
    kicker(ctx, 'AYNI SOĞAN, FARKLI KESKİNLİK', 1);
    // çubuk grafik (örnek değerler; birim µmol/g)
    const x0 = 260;
    const y0 = 740;
    const hMax = 470;
    const vmax = 15;
    ctx.save();
    ctx.strokeStyle = 'rgba(43,31,26,0.35)';
    ctx.lineWidth = 2;
    for (let v = 0; v <= vmax; v += 5) {
      const y = y0 - (v / vmax) * hMax;
      line(ctx, x0, y, x0 + 900, y);
      text(ctx, String(v), x0 - 24, y, { size: 26, weight: 600, color: C.muted, align: 'right' });
    }
    ctx.restore();
    text(ctx, 'µmol/g pirüvik asit', x0 - 20, y0 - hMax - 50, { size: 28, weight: 700, color: C.muted, align: 'left' });
    const hot = after(t, 'k-vary', 1, 1.2, ease.inOut);
    const bars = [['tatlı', 3.5], ['orta', 7], ['keskin', 11]];
    bars.forEach(([lab, v], i) => {
      const grow = after(t, 'k-vary', 0, 0.8 + i * 0.2, ease.out);
      const val = v * grow + (i === 1 ? 3.2 * hot : 0);
      const bx = x0 + 110 + i * 280;
      const bh = (val / vmax) * hMax;
      ctx.save();
      shadowed(ctx, 12, 4, () => {
        roundRect(ctx, bx, y0 - bh, 150, bh, 14);
        ctx.fillStyle = [C.sage, C.gold, C.terra][i];
        ctx.fill();
      });
      ctx.restore();
      onionWhole(ctx, bx + 75, y0 + 60, 30);
      text(ctx, lab, bx + 75, y0 + 120, { size: 32, weight: 700, color: C.navy });
    });
    text(ctx, 'örnek değerler', x0 + 900, y0 - hMax - 50, { size: 24, weight: 500, color: C.muted, align: 'right', italic: true });
    // sıcak ve kurak yıl
    const sa = after(t, 'k-vary', 1, 0.6);
    if (sa > 0) {
      ctx.save();
      ctx.globalAlpha *= sa;
      glow(ctx, 1530, 300, 200, GOLD, 0.6);
      ctx.fillStyle = C.gold;
      dot(ctx, 1530, 300, 70);
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2 + t * 0.3;
        line(ctx, 1530 + Math.cos(ang) * 95, 300 + Math.sin(ang) * 95, 1530 + Math.cos(ang) * 130, 300 + Math.sin(ang) * 130);
      }
      ctx.fillStyle = '#c89a6a';
      roundRect(ctx, 1380, 480, 300, 60, 14);
      ctx.fill();
      ctx.strokeStyle = '#7a5434';
      ctx.lineWidth = 4;
      for (const [a1, b1, c1, d1] of [[1420, 485, 1440, 535], [1480, 485, 1500, 515], [1500, 515, 1530, 535], [1580, 485, 1600, 535], [1630, 490, 1645, 520]]) line(ctx, a1, b1, c1, d1);
      ctx.restore();
      chip(ctx, 'sıcak, kurak bir yıl', 1530, 610, sa, { size: 32 });
    }
    const wa = after(t, 'k-vary', 3, 0.6);
    if (wa > 0) {
      card(ctx, 1270, 680, 520, 230, wa);
      text(ctx, 'geçen hafta', 1400, 730, { size: 28, weight: 600, color: C.muted, alpha: wa });
      text(ctx, 'bugün', 1660, 730, { size: 28, weight: 600, color: C.muted, alpha: wa });
      onionWhole(ctx, 1400, 820, 48, { a: wa });
      onionWhole(ctx, 1660, 820, 48, { a: wa });
      flameIcon(ctx, 1730, 780, 0.45, t, wa * after(t, 'k-vary', 4, 0.4));
      drop(ctx, 1600, 780 + ((t * 1.3) % 1) * 30, 12, { a: wa * after(t, 'k-vary', 4, 0.4) });
    }
    ctx.restore();
  };

  // ---------------------------------------------------------------------------
  // 8 · En taze araştırma (Cornell, 2025): kör bıçak zarı esnetir, basınç birikir, damlacıklar fışkırır
  // ---------------------------------------------------------------------------
  function hud(ctx, t, a, rightText = 'yüksek hızlı kamera') {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 6;
    const m = 60;
    const L = 80;
    for (const [x, y, dx, dy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
      line(ctx, x, y, x + dx * L, y);
      line(ctx, x, y, x, y + dy * L);
    }
    ctx.fillStyle = Math.sin(t * 6) > 0 ? C.tomato : 'rgba(229,72,77,0.3)';
    dot(ctx, 130, 130, 14);
    ctx.restore();
    text(ctx, 'KAYIT · AĞIR ÇEKİM', 160, 131, { size: 28, weight: 800, spacing: 3, color: '#fff', align: 'left', alpha: a });
    text(ctx, rightText, W - 130, 131, { size: 28, weight: 700, color: '#fff', align: 'right', alpha: a });
  }

  // Kesit: sert dış zar + yumuşak doku; bıçak basar (press 0..1), zar yırtılır (burst ≥ 0)
  function tissue(ctx, t, press, burstT, a, { blunt = true } = {}) {
    if (a <= 0.002) return;
    const top = 520;
    const cx = W / 2;
    const dent = press * 120;
    const prof = (x) => top + dent * Math.exp(-Math.pow((x - cx) / (blunt ? 210 : 120), 2));
    ctx.save();
    ctx.globalAlpha *= a;
    // yumuşak doku hücreleri
    for (let r = 0; r < 5; r++) {
      for (let c = -9; c <= 9; c++) {
        const x = cx + c * 110 + (r % 2 ? 55 : 0);
        const base = prof(x);
        const squeeze = Math.exp(-Math.pow((x - cx) / 260, 2)) * press;
        const y = base + 70 + r * 100 * (1 - 0.35 * squeeze);
        ctx.beginPath();
        ctx.ellipse(x, y, 50 * (1 + 0.25 * squeeze), 44 * (1 - 0.35 * squeeze), 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250,240,210,0.95)';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(190,170,110,0.9)';
        ctx.stroke();
      }
    }
    // basınç
    const pr = press * (burstT == null ? 1 : clamp(1 - (t - burstT) * 2));
    if (pr > 0) glow(ctx, cx, top + dent + 140, 320, RED, 0.55 * pr);
    // dış zar (yırtılınca ortası açılır)
    const torn = burstT != null && t >= burstT;
    const gap = torn ? clamp((t - burstT) * 3) * 70 : 0;
    ctx.lineWidth = 26;
    ctx.strokeStyle = '#d7c27a';
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      for (let x = side < 0 ? 0 : cx + gap; side < 0 ? x <= cx - gap : x <= W; x += 10) {
        const y = prof(x) - (torn ? clamp((t - burstT) * 2) * dent * 0.6 * Math.exp(-Math.pow((x - cx) / 200, 2)) : 0);
        if ((side < 0 && x === 0) || (side > 0 && x === cx + gap)) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // Fışkıran damlacıklar: n adet, hız çarpanı
  function spray(ctx, t, t0, x, y, n, speed, a = 1, seed = 0) {
    if (a <= 0.002 || t < t0) return;
    const d = t - t0;
    ctx.save();
    ctx.globalAlpha *= a;
    for (let i = 0; i < n; i++) {
      const ang = -Math.PI / 2 + (hash(i, 81 + seed) - 0.5) * 2.2;
      const v = speed * (0.4 + hash(i, 82 + seed) * 0.8);
      const life = (d * 0.5 + hash(i, 83 + seed) * 0.4) % 1.2;
      const px = x + Math.cos(ang) * v * life;
      const py = y + Math.sin(ang) * v * life + 260 * life * life;
      const r = 5 + hash(i, 84 + seed) * 9;
      ctx.strokeStyle = 'rgba(160,210,255,0.5)';
      ctx.lineWidth = r * 0.8;
      line(ctx, px, py, px - Math.cos(ang) * v * 0.06, py - Math.sin(ang) * v * 0.06);
      ctx.fillStyle = '#cfe8ff';
      dot(ctx, px, py, r);
      ctx.strokeStyle = '#3d6ea8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function car(ctx, x, y, s, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    roundRect(ctx, -110, -40, 220, 50, 18);
    ctx.fillStyle = C.terra;
    ctx.fill();
    outline(ctx, 5);
    ctx.beginPath();
    ctx.moveTo(-60, -40);
    ctx.lineTo(-30, -80);
    ctx.lineTo(50, -80);
    ctx.lineTo(80, -40);
    ctx.fillStyle = C.terra;
    ctx.fill();
    outline(ctx, 5);
    ctx.fillStyle = '#cfe8ff';
    roundRect(ctx, -22, -72, 60, 28, 6);
    ctx.fill();
    for (const wx of [-62, 62]) {
      ctx.fillStyle = INK;
      dot(ctx, wx, 12, 24);
      ctx.fillStyle = '#c9c4ba';
      dot(ctx, wx, 12, 9);
    }
    ctx.restore();
  }

  DRAW.study = function sceneStudy(ctx, lt, t) {
    ctx.fillStyle = C.deep;
    ctx.fillRect(0, 0, W, H);
    const pressT = cue('c-press', 1);
    const burstT = cue('c-burst', 0) + 0.2;
    const resT = cue('c-result', 0) - 0.3;
    const ironT = cue('c-irony', 0) - 0.3;
    // a) çalışma kartı ve kamera
    const sa = layer(t, sceneStart('study'), pressT - 0.4, 0);
    if (sa > 0) {
      ctx.save();
      ctx.globalAlpha *= sa;
      hud(ctx, t, after(t, 'c-study', 3, 0.6));
      kicker(ctx, 'EN TAZE ARAŞTIRMA', after(t, 'c-study', 0, 0.6), { dark: true, y: 200 });
      const ca = after(t, 'c-study', 1, 0.6);
      card(ctx, 260, 300, 820, 420, ca);
      text(ctx, '2025', 330, 390, { size: 96, weight: 900, color: C.navy, align: 'left', alpha: ca, family: 'display' });
      text(ctx, 'Cornell Üniversitesi · ABD', 330, 490, { size: 42, weight: 800, color: C.navy, align: 'left', alpha: after(t, 'c-study', 2, 0.5) });
      text(ctx, 'PNAS dergisi', 330, 550, { size: 34, weight: 600, color: C.muted, align: 'left', alpha: after(t, 'c-study', 2, 0.5) });
      text(ctx, 'yüksek hızlı kamerayla soğan kesimi', 330, 630, { size: 34, weight: 700, color: C.terra, align: 'left', alpha: after(t, 'c-study', 3, 0.5) });
      // kamera simgesi
      const ka = after(t, 'c-study', 3, 0.6);
      if (ka > 0) {
        ctx.save();
        ctx.globalAlpha *= ka;
        roundRect(ctx, 1260, 380, 360, 220, 30);
        ctx.fillStyle = '#39415a';
        ctx.fill();
        outline(ctx, 6, '#0b0f1c');
        ctx.fillStyle = '#0b0f1c';
        dot(ctx, 1440, 490, 85);
        ctx.fillStyle = '#5aa9ff';
        dot(ctx, 1440, 490, 52);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        dot(ctx, 1420, 470, 14);
        ctx.fillStyle = C.tomato;
        dot(ctx, 1580, 410, 12);
        ctx.restore();
        onionFace(ctx, 1440, 800, 80);
      }
      ctx.restore();
    }
    // b, c) zar esner, basınç birikir, yırtılır
    const ta = layer(t, pressT - 0.4, resT, 0.5);
    if (ta > 0) {
      ctx.save();
      ctx.globalAlpha *= ta;
      ctx.fillStyle = '#2a2219';
      ctx.fillRect(0, 0, W, H);
      const press = t < burstT ? progress(t, pressT, burstT, ease.inOut) : 1;
      tissue(ctx, t, press, burstT, 1);
      // bıçak ucu
      const by = 520 + press * 120 - (t > burstT ? -clamp((t - burstT) * 2) * 80 : 0);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(W / 2 - 150, -40);
      ctx.lineTo(W / 2 + 150, -40);
      ctx.lineTo(W / 2 + 26, by - 30);
      ctx.quadraticCurveTo(W / 2, by, W / 2 - 26, by - 30);
      ctx.closePath();
      const g = ctx.createLinearGradient(W / 2 - 150, 0, W / 2 + 150, 0);
      g.addColorStop(0, '#9aa3ad');
      g.addColorStop(0.5, '#eef1f3');
      g.addColorStop(1, '#9aa3ad');
      ctx.fillStyle = g;
      ctx.fill();
      outline(ctx, 5);
      ctx.restore();
      spray(ctx, t, burstT, W / 2, 560, 38, 1300, 1, 0);
      hud(ctx, t, 1);
      chip(ctx, 'sert dış zar', 330, 420, span(t, 'c-press', 1, 'c-burst', 0), { size: 32 });
      chip(ctx, 'önce esniyor', W / 2 + 420, 300, span(t, 'c-press', 2, 'c-burst', 0), { size: 32, fill: C.gold });
      chip(ctx, 'basınç birikiyor', W / 2, 960, span(t, 'c-press', 3, 'c-burst', 0), { size: 34, fill: C.tomato, color: '#fff' });
      // hız
      const va = after(t, 'c-burst', 1, 0.5);
      if (va > 0) {
        card(ctx, 1240, 620, 560, 330, va, { fill: 'rgba(255,250,240,0.95)' });
        text(ctx, 'saniyede', 1520, 670, { size: 30, weight: 600, color: C.muted, alpha: va });
        text(ctx, '40 metre', 1520, 735, { size: 72, weight: 900, color: C.navy, alpha: va, family: 'display' });
        const kmh = after(t, 'c-burst', 3, 0.5);
        text(ctx, '≈ saatte 144 km', 1520, 815, { size: 44, weight: 800, color: C.terra, alpha: va * kmh });
        const ra = after(t, 'c-burst', 4, 0.5);
        const cp = ((t - cue('c-burst', 4)) * 0.35) % 1;
        car(ctx, 1300 + cp * 320, 905, 0.42, va * ra);
        // damlacık arabayı geçer
        ctx.save();
        ctx.globalAlpha *= va * ra;
        ctx.strokeStyle = 'rgba(90,169,255,0.5)';
        ctx.lineWidth = 10;
        line(ctx, 1300 + cp * 470 - 90, 870, 1300 + cp * 470 - 14, 870);
        ctx.fillStyle = '#cfe8ff';
        dot(ctx, 1300 + cp * 470, 870, 14);
        ctx.strokeStyle = '#3d6ea8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(1300 + cp * 470, 870, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }
    // d) karşılaştırma
    const ra = layer(t, resT, ironT, 0.5) * progress(t, resT, resT + 0.5);
    if (ra > 0) {
      ctx.save();
      ctx.globalAlpha *= ra;
      paperBg(ctx, t);
      kicker(ctx, 'NE GÖSTERDİLER?', 1);
      const panels = [
        ['kör bıçak', 60, 1700, true, cue('c-result', 1)],
        ['keskin bıçak', 960, 1700, false, cue('c-result', 1) + 0.6],
        ['hızlı kesiş', 60, 1700, true, cue('c-result', 3)],
        ['yavaş kesiş', 960, 1700, false, cue('c-result', 3) + 0.6],
      ];
      const second = t >= cue('c-result', 3) - 0.3;
      panels.slice(second ? 2 : 0, second ? 4 : 2).forEach(([lab, x, , many, at], i) => {
        const pa = second ? progress(t, at - 0.2, at + 0.3) : progress(t, cue('c-result', 0) + i * 0.3, cue('c-result', 0) + i * 0.3 + 0.5);
        card(ctx, x + 100, 170, 700, 600, pa, { fill: '#2a2219' });
        if (pa <= 0) return;
        ctx.save();
        ctx.beginPath();
        roundRect(ctx, x + 100, 170, 700, 600, 28);
        ctx.clip();
        ctx.globalAlpha *= pa;
        onionFace(ctx, x + 450, 720, 190);
        knife(ctx, x + 330, 470, 260, 0.08, { dull: lab === 'kör bıçak' });
        if (lab.includes('hızlı')) {
          ctx.strokeStyle = 'rgba(255,255,255,0.6)';
          ctx.lineWidth = 6;
          for (let k = 0; k < 4; k++) line(ctx, x + 180, 390 + k * 30, x + 290, 390 + k * 30);
        }
        spray(ctx, t, at, x + 450, 550, many ? 34 : 6, many ? 900 : 500, 1, i * 7);
        ctx.restore();
        text(ctx, lab, x + 450, 820, { size: 44, weight: 900, color: C.navy, alpha: pa, family: 'display' });
        text(ctx, many ? 'çok damlacık' : 'az damlacık', x + 450, 875, { size: 32, weight: 700, color: many ? C.tomato : C.catcher, alpha: pa });
      });
      ctx.restore();
    }
    // e) hızlı hızlı doğrayan karakter
    const ia = progress(t, ironT, ironT + 0.6);
    if (ia > 0) {
      ctx.save();
      ctx.globalAlpha *= ia;
      kitchen(ctx, t, { zoom: 1.25, fx: 0.55, fy: 0.75, fg: 0 });
      const chop = Math.abs(Math.sin(t * 14));
      const hit = cue('c-irony', 1);
      const cry = t > hit + 0.4;
      host(ctx, t, 1200, 1250, 1300, { eyes: cry ? 2 : 7, talk: true });
      ctx.fillStyle = '#b77a45';
      roundRect(ctx, 720, 860, 760, 90, 24);
      ctx.fill();
      outline(ctx, 5);
      onionFace(ctx, 1000, 830, 70);
      knife(ctx, 1180, 700 + chop * 120, 230, Math.PI * 0.95);
      spray(ctx, t, ironT + 0.4, 1000, 820, 30, 1000, 1, 3);
      const [ex, ey] = headPoint(1200, 1250, 1300, 330, 315);
      for (let i = 0; i < 8 && cry; i++) {
        const life = (t * 0.7 + i / 8) % 1;
        gasMol(ctx, lerp(1000, ex, life), lerp(800, ey, life) + Math.sin(life * 6 + i) * 30, 1.4, Math.sin(Math.PI * life), t + i);
      }
      chip(ctx, 'hızlı doğramak = daha çok damlacık', 560, 300, after(t, 'c-irony', 1, 0.5), { size: 36, fill: C.navy, color: C.cream });
      chip(ctx, 'ağlatan madde damlacıklarla da taşınır', 560, 400, after(t, 'c-irony', 2, 0.5), { size: 32 });
      bubble(ctx, 'xCry', 1660, 330, 140, after(t, 'c-irony', 2, 0.3), pop(t, cue('c-irony', 2)));
      ctx.restore();
    }
  };

  // ---------------------------------------------------------------------------
  // 9 · Bu akşam dene: dört öneri ve kavrulan soğan
  // ---------------------------------------------------------------------------
  function snail(ctx, x, y, s, t, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x + Math.sin(t * 0.8) * 6, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(-70, 30);
    ctx.quadraticCurveTo(-80, 0, -60, -10);
    ctx.lineTo(60, 10);
    ctx.quadraticCurveTo(80, 30, 60, 36);
    ctx.closePath();
    ctx.fillStyle = '#b9d9a6';
    ctx.fill();
    outline(ctx, 4);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    line(ctx, -62, -8, -74, -40);
    line(ctx, -54, -6, -56, -42);
    ctx.fillStyle = INK;
    dot(ctx, -74, -42, 5);
    dot(ctx, -56, -44, 5);
    ctx.beginPath();
    ctx.arc(10, -14, 44, 0, Math.PI * 2);
    ctx.fillStyle = C.copper;
    ctx.fill();
    outline(ctx, 4);
    ctx.strokeStyle = 'rgba(43,31,26,0.6)';
    ctx.beginPath();
    for (let k = 0; k < 40; k++) {
      const ang = k * 0.4;
      const r = 4 + k * 0.9;
      const px = 10 + Math.cos(ang) * r;
      const py = -14 + Math.sin(ang) * r;
      if (k) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  function fan(ctx, x, y, s, t, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    line(ctx, 0, 0, 0, 80);
    ctx.fillStyle = C.navy;
    roundRect(ctx, -40, 76, 80, 16, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, Math.PI * 2);
    ctx.fillStyle = '#e9f1f4';
    ctx.fill();
    outline(ctx, 5);
    ctx.save();
    ctx.rotate(t * 9);
    ctx.fillStyle = C.sage;
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.ellipse(0, -26, 14, 26, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = INK;
    dot(ctx, 0, 0, 7);
    ctx.restore();
    // hava akışı
    ctx.save();
    ctx.globalAlpha *= a * 0.7;
    ctx.strokeStyle = C.tear;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const p = (t * 0.9 + i / 3) % 1;
      const xx = x + 70 * s + p * 120 * s;
      ctx.beginPath();
      ctx.moveTo(xx, y - 30 * s + i * 30 * s);
      ctx.quadraticCurveTo(xx + 20 * s, y - 40 * s + i * 30 * s, xx + 40 * s, y - 30 * s + i * 30 * s);
      ctx.stroke();
    }
    ctx.restore();
  }

  const TIPS = [
    ['p-knife', 'Bıçağını bile', 'zarı ezmeden keser'],
    ['p-slow', 'Acele etme', 'sakin kesiş, az damlacık'],
    ['p-air', 'Havalandır', 'gaz yüzüne ulaşmadan dağılsın'],
    ['p-goggles', 'Gözlük', 'gazın ulaşamadığı göz ağlamaz'],
  ];

  DRAW.tips = function sceneTips(ctx, lt, t) {
    const cookT = cue('p-cook', 0) - 0.3;
    const ka = layer(t, sceneStart('tips'), cookT, 0);
    if (ka > 0) {
      ctx.save();
      ctx.globalAlpha *= ka;
      kitchen(ctx, t, { zoom: 1.12, fx: 0.62, fy: 0.45, dim: 0.12 });
      const gg = progress(t, cue('p-goggles', 2) - 0.3, cue('p-goggles', 2) + 0.5, ease.inOut);
      presenter(ctx, t, 1500, { goggles: gg });
      kicker(ctx, 'BU AKŞAM DENE', after(t, 'p-intro', 0, 0.6), { y: 110 });
      TIPS.forEach(([id, title, sub], i) => {
        const at = cue(id, 0);
        const a = progress(t, at - 0.2, at + 0.3);
        if (a <= 0) return;
        const s = pop(t, at - 0.2);
        const y = 190 + i * 205;
        ctx.save();
        ctx.translate(140 + (1 - s) * -60, y);
        card(ctx, 0, 0, 840, 180, a);
        ctx.save();
        ctx.globalAlpha *= a;
        ctx.fillStyle = C.gold;
        dot(ctx, 70, 90, 42);
        ctx.restore();
        text(ctx, String(i + 1), 70, 92, { size: 48, weight: 900, color: C.navy, alpha: a, family: 'display' });
        text(ctx, title, 140, 70, { size: 50, weight: 900, color: C.navy, align: 'left', alpha: a, family: 'display' });
        text(ctx, sub, 140, 128, { size: 32, weight: 600, color: C.muted, align: 'left', alpha: a });
        if (i === 0) knife(ctx, 640, 95, 150, -0.15, { a, gleam: ((t - at) * 0.7) % 1 });
        if (i === 1) snail(ctx, 720, 105, 0.9, t, a);
        if (i === 2) fan(ctx, 690, 80, 0.75, t, a);
        if (i === 3) picC(ctx, 'goggles', 720, 92, 90, a);
        ctx.restore();
      });
      chip(ctx, 'kenarları oturan yüzücü gözlüğü de olur', 560, 1010, after(t, 'p-goggles', 4, 0.5), { size: 32, fill: C.gold });
      bubble(ctx, 'xLaugh', 1180, 260, 110, span(t, 'p-goggles', 1, 'p-goggles', 2, 0.2, 0.2), pop(t, cue('p-goggles', 1)));
      ctx.restore();
    }
    // kavrulan soğan
    const ca = progress(t, cookT, cookT + 0.6);
    if (ca <= 0) return;
    ctx.save();
    ctx.globalAlpha *= ca;
    paperBg(ctx, t);
    kicker(ctx, 'TAVADA KAVRULAN SOĞAN', 1);
    const brown = after(t, 'p-cook', 1, 5, ease.inOut);
    // ocak alevi
    for (let i = 0; i < 7; i++) flameIcon(ctx, 420 + i * 45, 790, 0.45 + 0.08 * Math.sin(t * 9 + i), t + i, 0.9);
    pan(ctx, 560, 700, 1.6, t, 1, brown);
    // ısı → makas çalışmaz
    const ha = after(t, 'p-cook', 2, 0.5);
    if (ha > 0) {
      card(ctx, 1150, 260, 600, 300, ha);
      text(ctx, 'ısı enzimleri bozar', 1450, 320, { size: 40, weight: 800, color: C.navy, alpha: ha });
      scissorEnzyme(ctx, 1450, 440, 1.3, 0.3, ha * after(t, 'p-cook', 3, 0.4), Math.PI);
      const xa = ha * after(t, 'p-cook', 3, 0.4);
      ctx.save();
      ctx.globalAlpha *= xa;
      ctx.strokeStyle = C.tomato;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      line(ctx, 1380, 380, 1520, 500);
      line(ctx, 1520, 380, 1380, 500);
      ctx.restore();
    }
    const qa = after(t, 'p-cook', 4, 0.5);
    chip(ctx, 'Kavrulan soğan neden tatlanır?', 1450, 700, qa, { size: 38, fill: C.navy, color: C.cream, scale: lerp(0.8, 1, pop(t, cue('p-cook', 4))) });
    chip(ctx, 'başka bir bölümde', 1450, 800, after(t, 'p-cook', 5, 0.5), { size: 32, fill: C.gold });
    ctx.restore();
  };

  // ---------------------------------------------------------------------------
  // 10 · Efsane mi, gerçek mi?
  // ---------------------------------------------------------------------------
  function fridge(ctx, x, y, s, t, a = 1, open = 0) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    roundRect(ctx, -150, -260, 300, 520, 40);
    ctx.fillStyle = '#eef6f7';
    ctx.fill();
    outline(ctx, 6);
    ctx.fillStyle = '#d9eef5';
    roundRect(ctx, -125, -230, 250, 460, 26);
    ctx.fill();
    // raf ve soğan
    ctx.strokeStyle = 'rgba(43,31,26,0.4)';
    ctx.lineWidth = 4;
    line(ctx, -120, 40, 120, 40);
    ctx.restore();
    onionWhole(ctx, x, y - 20 * s, 70 * s, { a });
    // buz
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = '#9fd3ff';
    ctx.lineWidth = 5;
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + t * 0.5;
      const fx = x + Math.cos(ang) * 120 * s;
      const fy = y - 20 * s + Math.sin(ang) * 120 * s;
      for (let k = 0; k < 3; k++) {
        const aa = (k / 3) * Math.PI;
        line(ctx, fx - Math.cos(aa) * 12, fy - Math.sin(aa) * 12, fx + Math.cos(aa) * 12, fy + Math.sin(aa) * 12);
      }
    }
    // kapak
    ctx.translate(x - 150 * s, y);
    ctx.scale(Math.max(0.05, 1 - open), 1);
    roundRect(ctx, 0, -260 * s, 300 * s, 520 * s, 40 * s);
    ctx.fillStyle = '#f7fbfb';
    ctx.fill();
    outline(ctx, 6);
    ctx.restore();
  }

  function bread(ctx, x, y, s, a = 1, rot = 0) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(-70, 60);
    ctx.lineTo(-70, -20);
    ctx.bezierCurveTo(-90, -80, 90, -80, 70, -20);
    ctx.lineTo(70, 60);
    ctx.closePath();
    ctx.fillStyle = '#c98b4a';
    ctx.fill();
    outline(ctx, 5);
    ctx.beginPath();
    ctx.moveTo(-56, 48);
    ctx.lineTo(-56, -14);
    ctx.bezierCurveTo(-70, -60, 70, -60, 56, -14);
    ctx.lineTo(56, 48);
    ctx.closePath();
    ctx.fillStyle = '#f7e6c4';
    ctx.fill();
    ctx.fillStyle = 'rgba(200,160,110,0.5)';
    for (let i = 0; i < 8; i++) dot(ctx, -40 + hash(i, 91) * 80, -30 + hash(i, 92) * 70, 4);
    ctx.restore();
  }

  function candle(ctx, x, y, s, t, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    roundRect(ctx, -30, -120, 60, 160, 10);
    ctx.fillStyle = '#fff3d6';
    ctx.fill();
    outline(ctx, 5);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    line(ctx, 0, -120, 0, -140);
    ctx.restore();
    flameIcon(ctx, x, y - 165 * s, 0.45 * s, t, a);
    glow(ctx, x, y - 170 * s, 120 * s, GOLD, 0.4 * a);
  }

  function smileOnion(ctx, x, y, r, t, a = 1) {
    onionWhole(ctx, x, y, r, { a, rot: Math.sin(t * 2 + x) * 0.05 });
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = INK;
    dot(ctx, x - r * 0.3, y - r * 0.1, r * 0.08);
    dot(ctx, x + r * 0.3, y - r * 0.1, r * 0.08);
    ctx.strokeStyle = INK;
    ctx.lineWidth = r * 0.06;
    ctx.beginPath();
    ctx.arc(x, y + r * 0.1, r * 0.3, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.restore();
  }

  DRAW.myth = function sceneMyth(ctx, lt, t) {
    const f0 = cue('e-fridge', 0) - 0.3;
    const b0 = cue('e-bread', 0) - 0.3;
    const g0 = cue('e-tearless', 0) - 0.3;
    // başlık kartı
    const ia = layer(t, sceneStart('myth'), f0, 0);
    if (ia > 0) {
      ctx.save();
      ctx.globalAlpha *= ia;
      ctx.fillStyle = C.navy;
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 14; i++) {
        ctx.fillStyle = `rgba(255,181,71,${0.05 + 0.05 * hash(i, 3)})`;
        dot(ctx, hash(i, 1) * W, hash(i, 2) * H, 30 + hash(i, 4) * 90);
      }
      const p = after(t, 'e-intro', 0, 0.6);
      text(ctx, 'EFSANE Mİ,', W / 2, 430, { size: 130, weight: 900, color: C.cream, alpha: p, family: 'display' });
      text(ctx, 'GERÇEK Mİ?', W / 2, 590, { size: 130, weight: 900, color: C.gold, alpha: after(t, 'e-intro', 1, 0.5), family: 'display' });
      ctx.restore();
    }
    // buzdolabı
    const fa = layer(t, f0, b0, 0.5) * progress(t, f0, f0 + 0.5);
    if (fa > 0) {
      ctx.save();
      ctx.globalAlpha *= fa;
      paperBg(ctx, t);
      kicker(ctx, 'EFSANE Mİ, GERÇEK Mİ?', 1);
      text(ctx, '"Soğanı kesmeden önce buzdolabına koy."', W / 2, 200, { size: 52, weight: 800, color: C.navy, family: 'display' });
      fridge(ctx, 420, 600, 0.95, t, 1, after(t, 'e-fridge', 0, 0.8));
      const ca = after(t, 'e-fridge', 2, 0.6);
      if (ca > 0) {
        card(ctx, 800, 330, 980, 520, ca, { fill: '#2a2219' });
        ctx.save();
        ctx.globalAlpha *= ca;
        ctx.beginPath();
        roundRect(ctx, 800, 330, 980, 520, 28);
        ctx.clip();
        onionFace(ctx, 1040, 790, 110);
        onionFace(ctx, 1540, 790, 110);
        spray(ctx, t, cue('e-fridge', 3), 1040, 720, 10, 600, 1, 21);
        spray(ctx, t, cue('e-fridge', 3), 1540, 720, 24, 800, after(t, 'e-fridge', 4, 0.4), 22);
        ctx.restore();
        text(ctx, 'oda sıcaklığı', 1040, 400, { size: 34, weight: 800, color: C.cream, alpha: ca });
        text(ctx, 'soğutulmuş', 1540, 400, { size: 34, weight: 800, color: '#9fd3ff', alpha: ca });
      }
      chip(ctx, 'daha fazla çalışma gerekiyor', 1290, 920, after(t, 'e-fridge', 5, 0.5), { size: 32 });
      stamp(ctx, 'ŞÜPHELİ', '#d39a12', 1290, 600, cue('e-fridge', 7) - 0.1, t);
      ctx.restore();
    }
    // ağızda ekmek, mum
    const ba = layer(t, b0, g0, 0.5) * progress(t, b0, b0 + 0.5);
    if (ba > 0) {
      ctx.save();
      ctx.globalAlpha *= ba;
      paperBg(ctx, t);
      kicker(ctx, 'EFSANE Mİ, GERÇEK Mİ?', 1);
      text(ctx, '"Ağzında ekmek tut, yanına mum yak."', W / 2, 200, { size: 52, weight: 800, color: C.navy, family: 'display' });
      const hx = 760;
      const hy = 2350;
      const hh = 2100;
      host(ctx, t, hx, hy, hh, { mouth: 5, talk: false, eyes: 1 });
      const [mx, my] = headPoint(hx, hy, hh, 270, 440);
      bread(ctx, mx, my + 20, 1.0, 1, 0.1);
      candle(ctx, 1180, 880, 1.1, t, after(t, 'e-bread', 0, 0.6));
      onionFace(ctx, 1450, 880, 90);
      // gaz havadan gözlere gider
      const [ex, ey] = headPoint(hx, hy, hh, 330, 315);
      const ga = after(t, 'e-bread', 2, 0.6);
      arrow(ctx, 1450, 760, ex + 90, ey + 10, { color: C.terra, lw: 8, p: ga, dash: [18, 14] });
      for (let i = 0; i < 6 && ga > 0; i++) {
        const life = (t * 0.5 + i / 6) % 1;
        gasMol(ctx, lerp(1450, ex + 100, life), lerp(760, ey + 10, life) - Math.sin(Math.PI * life) * 80, 1.4, ga * Math.sin(Math.PI * life), t + i);
      }
      chip(ctx, 'gaz havadan gelir', 1400, 470, ga, { size: 34, fill: C.gold });
      chip(ctx, 'ölçen ciddi bir çalışma bulamadık', 1400, 560, after(t, 'e-bread', 1, 0.5), { size: 30 });
      stamp(ctx, 'KANITI YOK', '#7d7468', 1400, 700, cue('e-bread', 5) - 0.1, t, { size: 84 });
      ctx.restore();
    }
    // ağlatmayan soğanlar
    const ta = progress(t, g0, g0 + 0.5);
    if (ta > 0) {
      ctx.save();
      ctx.globalAlpha *= ta;
      paperBg(ctx, t);
      kicker(ctx, 'EFSANE Mİ, GERÇEK Mİ?', 1);
      text(ctx, '"Hiç ağlatmayan soğan var mı?"', 800, 200, { size: 52, weight: 800, color: C.navy, family: 'display' });
      const ja = after(t, 'e-tearless', 3, 0.6);
      const jc = after(t, 'e-tearless', 1, 0.6);
      card(ctx, 180, 330, 700, 560, jc);
      smileOnion(ctx, 530, 520, 110, t, jc);
      text(ctx, 'Japonya', 530, 720, { size: 46, weight: 900, color: C.navy, alpha: ja, family: 'display' });
      text(ctx, 'makası neredeyse çalışmayan soğan', 530, 790, { size: 30, weight: 600, color: C.muted, alpha: ja });
      const ua = after(t, 'e-tearless', 4, 0.6);
      const uc = after(t, 'e-tearless', 1, 0.6, ease.out) * progress(t, cue('e-tearless', 1) + 0.25, cue('e-tearless', 1) + 0.85);
      card(ctx, 1040, 330, 700, 560, uc);
      smileOnion(ctx, 1390, 520, 110, t + 1, uc);
      text(ctx, 'ABD', 1390, 720, { size: 46, weight: 900, color: C.navy, alpha: ua, family: 'display' });
      text(ctx, '30 yıllık klasik ıslah', 1390, 790, { size: 30, weight: 600, color: C.muted, alpha: ua });
      text(ctx, 'depoda bekledikçe yumuşar', 1390, 840, { size: 30, weight: 600, color: C.muted, alpha: after(t, 'e-tearless', 5, 0.5) });
      stamp(ctx, 'GERÇEK', C.catcher, 1640, 230, cue('e-tearless', 2) - 0.1, t, { size: 80, rot: 0.1 });
      ctx.restore();
    }
  };

  // ---------------------------------------------------------------------------
  // 11 · Kapanış: özet zinciri, bu akşam, sıradaki bölüm, bitiş ekranı
  // ---------------------------------------------------------------------------
  function eyeIcon(ctx, x, y, s, t, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(-90, 0);
    ctx.quadraticCurveTo(0, -80, 90, 0);
    ctx.quadraticCurveTo(0, 80, -90, 0);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
    outline(ctx, 6);
    ctx.fillStyle = '#7a4b2a';
    dot(ctx, 0, 0, 34);
    ctx.fillStyle = INK;
    dot(ctx, 0, 0, 16);
    ctx.fillStyle = '#fff';
    dot(ctx, -10, -10, 7);
    ctx.restore();
    drop(ctx, x + 70 * s, y + (60 + ((t * 40) % 50)) * s, 16 * s, { a });
  }

  function chili(ctx, x, y, s, t, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 1.5) * 0.05);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(-120, -40);
    ctx.bezierCurveTo(-40, -90, 80, -60, 150, 60);
    ctx.bezierCurveTo(160, 80, 140, 90, 120, 70);
    ctx.bezierCurveTo(60, 0, -40, -10, -110, 10);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, -80, 0, 60);
    g.addColorStop(0, '#ff6a5a');
    g.addColorStop(1, '#c42a2e');
    ctx.fillStyle = g;
    ctx.fill();
    outline(ctx, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.ellipse(-30, -40, 50, 9, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-120, -40);
    ctx.quadraticCurveTo(-150, -30, -140, 5);
    ctx.quadraticCurveTo(-130, 15, -110, 10);
    ctx.closePath();
    ctx.fillStyle = '#5f9a55';
    ctx.fill();
    outline(ctx, 5);
    ctx.strokeStyle = '#5f9a55';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-138, -14);
    ctx.quadraticCurveTo(-170, -40, -160, -80);
    ctx.stroke();
    ctx.restore();
  }

  function milk(ctx, x, y, s, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(-60, -110);
    ctx.lineTo(-48, 110);
    ctx.lineTo(48, 110);
    ctx.lineTo(60, -110);
    ctx.closePath();
    ctx.fillStyle = 'rgba(230,240,248,0.6)';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-56, -60);
    ctx.lineTo(-48, 110);
    ctx.lineTo(48, 110);
    ctx.lineTo(56, -60);
    ctx.closePath();
    ctx.fillStyle = '#fffdf6';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-60, -110);
    ctx.lineTo(-48, 110);
    ctx.lineTo(48, 110);
    ctx.lineTo(60, -110);
    outline(ctx, 6);
    ctx.restore();
  }

  DRAW.close = function sceneClose(ctx, lt, t) {
    const t1 = cue('z-tonight', 0) - 0.3;
    const t2 = cue('z-next', 0) - 0.3;
    const t3 = cue('z-end', 0) - 0.3;
    // özet zinciri
    const sa = layer(t, sceneStart('close'), t1, 0);
    if (sa > 0) {
      ctx.save();
      ctx.globalAlpha *= sa;
      paperBg(ctx, t);
      kicker(ctx, 'ÖZETLEYELİM', after(t, 'z-sum', 0, 0.6));
      const xs = [300, 740, 1180, 1620];
      const labels = ['bıçak duvarı yıkar', 'iki enzim çalışır', 'ağlatan gaz oluşur', 'göz yıkanır'];
      xs.forEach((x, i) => {
        const at = cue('z-sum', i + 1);
        const a = progress(t, at - 0.2, at + 0.3);
        const s = pop(t, at - 0.2);
        if (a <= 0) return;
        ctx.save();
        ctx.translate(x, 520);
        ctx.scale(s, s);
        ctx.translate(-x, -520);
        card(ctx, x - 190, 340, 380, 360, a);
        if (i === 0) {
          ctx.save();
          ctx.globalAlpha *= a;
          membrane(ctx, t, x, 400, 640, 40);
          ctx.restore();
          knife(ctx, x - 120, 470, 200, -0.3, { a });
        }
        if (i === 1) {
          scissorEnzyme(ctx, x - 50, 480, 1.0, 0.5 + 0.4 * Math.sin(t * 5), a, Math.PI);
          catcherEnzyme(ctx, x + 70, 560, 0.9, 0.5 + 0.5 * Math.sin(t * 4), a);
        }
        if (i === 2) {
          glow(ctx, x, 520, 150, GAS, 0.4 * a);
          lfMolecule(ctx, x + 10, 540, 0.55, a, { labels: false });
        }
        if (i === 3) eyeIcon(ctx, x, 500, 1.2, t, a);
        text(ctx, labels[i], x, 760, { size: 32, weight: 800, color: C.navy, alpha: a });
        ctx.restore();
        if (i) arrow(ctx, xs[i - 1] + 200, 520, x - 200, 520, { color: C.terra, lw: 7, head: 20, p: a });
      });
      ctx.restore();
    }
    // bu akşam
    const ta = layer(t, t1, t2, 0.5) * progress(t, t1, t1 + 0.5);
    if (ta > 0) {
      ctx.save();
      ctx.globalAlpha *= ta;
      kitchen(ctx, t, { zoom: 1.1, fx: 0.3, fy: 0.45, dim: 0.1 });
      presenter(ctx, t, 1480, { pose: 'poseTools', eyes: t > cue('z-tonight', 3) ? 9 : 0 });
      card(ctx, 150, 220, 760, 520, 1);
      text(ctx, 'Bu akşam', 230, 300, { size: 54, weight: 900, color: C.navy, align: 'left', family: 'display' });
      ['Bıçağını bile', 'Acele etme', 'Aspiratörü aç'].forEach((s2, i) => {
        const at = cue('z-tonight', i);
        const a = progress(t, at - 0.1, at + 0.3);
        check(ctx, 260, 420 + i * 100, true, a, pop(t, at - 0.1));
        text(ctx, s2, 320, 422 + i * 100, { size: 44, weight: 800, color: C.navy, align: 'left', alpha: a });
      });
      chip(ctx, 'gözyaşı = gözünün kalkanı', 530, 820, after(t, 'z-tonight', 4, 0.5), { size: 36, fill: C.gold });
      ctx.restore();
    }
    // sıradaki bölüm
    const na = layer(t, t2, t3, 0.5) * progress(t, t2, t2 + 0.5);
    if (na > 0) {
      ctx.save();
      ctx.globalAlpha *= na;
      ctx.fillStyle = C.navy;
      ctx.fillRect(0, 0, W, H);
      glow(ctx, 760, 520, 420, RED, 0.25);
      text(ctx, 'SIRADAKİ BÖLÜM', W / 2, 180, { size: 34, weight: 800, spacing: 8, color: C.gold, family: 'display' });
      chili(ctx, 760, 520, 1.6, t, after(t, 'z-next', 0, 0.6));
      milk(ctx, 1240, 540, 1.2, after(t, 'z-next', 2, 0.6));
      text(ctx, '?', 1400, 380, { size: 120, weight: 900, color: C.gold, alpha: after(t, 'z-next', 2, 0.6), family: 'display' });
      text(ctx, 'Acı Biber Ağzını Neden Yakar?', W / 2, 860, { size: 80, weight: 900, color: C.cream, alpha: after(t, 'z-next', 1, 0.6), family: 'display' });
      ctx.restore();
    }
    // bitiş ekranı (son saniyeler: YouTube öğeleri için sol taraf boş)
    const ea = progress(t, t3, t3 + 0.8);
    if (ea > 0) {
      ctx.save();
      ctx.globalAlpha *= ea;
      kitchen(ctx, t, { zoom: 1.1, fx: 0.5, fy: 0.45, dim: 0.62, fg: 0 });
      presenter(ctx, t, 1500, { pose: 'poseTools', eyes: 9, tilt: Math.sin(t * 3) * 0.03 });
      badge(ctx, 1, 96, 70);
      text(ctx, 'Bir sonraki tabakta görüşmek üzere!', 96, 210, { size: 46, weight: 800, color: C.cream, align: 'left', alpha: after(t, 'z-end', 1, 0.6) });
      text(ctx, 'YUP AKADEMİ', 96, 1000, { size: 34, weight: 900, spacing: 6, color: C.cream, align: 'left', alpha: 0.85, family: 'display' });
      ctx.restore();
    }
  };

  // ---------------------------------------------------------------------------
  // Ses: neşeli, yumuşak alt müzik ve mutfak efektleri
  // ---------------------------------------------------------------------------
  function score(m, hz) {
    const { at } = TL;
    const untilEnd = (id, margin) => TL.scene(id).end - margin - at(id, 0);
    const pad = (id, notes, gain = 0.06) => m.pad(at(id, 0), untilEnd(id, 0.3), notes, { gain, attack: 1.6, release: 2.2, cutoff: 700 });
    const bell = (tm, note, g = 0.05, pan = 0) => m.bell(tm, { freq: hz(note), gain: g, decay: 2.2, pan });
    const popS = (tm, note, g = 0.05, pan = 0) => m.pop(tm, { freq: hz(note), gain: g, pan });
    const c = cue;
    // 1 · açılış
    pad('open', ['A2', 'E3', 'C4', 'G4'], 0.05);
    for (const k of knifeTimes()) {
      m.click(k, { gain: 0.16, tone: 900 });
      m.tick(k + 0.01, { gain: 0.06, tone: 3000 });
    }
    m.click(c('a-cut', 0) + 0.3, { gain: 0.06, tone: 600 });
    m.whoosh(lineEnd('a-question') - 0.3, { dur: 0.8, from: 200, to: 2400, gain: 0.08 });
    bell(lineEnd('a-question') + 0.1, 'C5', 0.07);
    bell(lineEnd('a-question') + 0.35, 'G5', 0.05);
    // 2 · selam
    pad('hello', ['C3', 'G3', 'E4', 'A4'], 0.06);
    [0, 1].forEach((k, i) => popS(c('s-hello', k), ['C5', 'E5'][i], 0.05));
    [0, 2, 4].forEach((k, i) => popS(c('s-promise', k), ['E5', 'G5', 'C6'][i], 0.05));
    // 3 · deney
    pad('test', ['F2', 'C3', 'A3', 'E4'], 0.05);
    m.whoosh(c('d-knife', 0) + 0.1, { dur: 0.4, from: 900, to: 3000, gain: 0.08 });
    m.click(c('d-knife', 0) + 0.5, { gain: 0.15, tone: 900 });
    m.riser(c('d-knife', 0) + 0.5, 1.0, { gain: 0.06 });
    // 4 · büyüteç
    pad('zoom', ['D2', 'A2', 'F3', 'C4'], 0.06);
    m.whoosh(c('b-zoom', 0) - 0.2, { dur: 1.0, from: 300, to: 1800, gain: 0.08 });
    m.whoosh(lineEnd('b-zoom') + 0.2, { dur: 1.3, from: 200, to: 4000, gain: 0.1 });
    bell(lineEnd('b-zoom') + 1.4, 'A5', 0.05);
    m.crackle(breakAt() - 0.05, 0.5, { gain: 0.12, density: 40, roar: 0.1 });
    for (let i = 0; i < MOLS.length; i++) {
      m.tick(snipAt(i), { gain: 0.06, tone: 4200, pan: -0.3 + i * 0.1 });
      popS(grabAt(i), ['C5', 'D5', 'E5', 'G5', 'A5', 'C6'][i], 0.035, -0.3 + i * 0.1);
    }
    bell(c('b-name', 2), 'E5', 0.06);
    bell(c('b-nobel', 2), 'G5', 0.06);
    // 5 · göz
    pad('eye', ['E2', 'B2', 'G3', 'D4'], 0.05);
    m.blip(c('g-signal', 1), { freq: 660, dur: 0.6, slide: 600, gain: 0.05 });
    m.buzz(c('g-signal', 3), { gain: 0.08, dur: 0.3 });
    for (let i = 0; i < 4; i++) popS(c('g-reflex', 0) + 0.6 + i * 0.35, ['G5', 'E5', 'C5', 'E5'][i], 0.03);
    // 6 · neden
    pad('why', ['G2', 'D3', 'B3', 'E4'], 0.05);
    m.click(c('n-defense', 0) + 0.3, { gain: 0.1, tone: 500 });
    m.wobble(c('n-defense', 0) + 0.35, 1.6, { gain: 0.05, freq: 520 });
    [0, 1, 2].forEach((k, i) => popS(c('n-garlic', k) + 0.4, ['C5', 'E5', 'G5'][i], 0.04));
    // 7 · ölçü
    pad('vary', ['A2', 'E3', 'C#4', 'F#4'], 0.05);
    [0, 1, 2].forEach((i) => popS(c('k-vary', 0) + 0.3 + i * 0.25, ['C5', 'E5', 'G5'][i], 0.04));
    // 8 · araştırma
    pad('study', ['D2', 'A2', 'F3', 'C4'], 0.05);
    m.riser(c('c-press', 1), Math.max(0.5, c('c-burst', 0) + 0.2 - c('c-press', 1)), { gain: 0.07 });
    m.boom(c('c-burst', 0) + 0.2, { gain: 0.25, freq: 60 });
    m.crackle(c('c-burst', 0) + 0.2, 1.2, { gain: 0.08, density: 30, roar: 0.05 });
    m.whoosh(c('c-burst', 4), { dur: 1.0, from: 400, to: 2000, gain: 0.06, panFrom: -0.5, panTo: 0.5 });
    // 9 · öneriler
    pad('tips', ['C3', 'G3', 'E4', 'B4'], 0.06);
    TIPS.forEach(([id], i) => popS(c(id, 0), ['C5', 'D5', 'E5', 'G5'][i], 0.05));
    m.click(c('p-goggles', 2), { gain: 0.1, tone: 1400 });
    m.crackle(c('p-cook', 0), Math.max(1, lineEnd('p-cook') - c('p-cook', 0)), { gain: 0.07, density: 18, roar: 0.2 });
    // 10 · efsaneler
    pad('myth', ['F2', 'C3', 'A3', 'D4'], 0.05);
    bell(c('e-intro', 1), 'C5', 0.06);
    for (const [id, k] of [['e-fridge', 7], ['e-bread', 5], ['e-tearless', 2]]) m.boom(c(id, k), { gain: 0.18, freq: 90 });
    // 11 · kapanış
    pad('close', ['C3', 'G3', 'E4', 'A4'], 0.07);
    [1, 2, 3, 4].forEach((k, i) => popS(c('z-sum', k), ['C5', 'E5', 'G5', 'C6'][i], 0.04));
    [0, 1, 2].forEach((k, i) => popS(c('z-tonight', k), ['E5', 'G5', 'C6'][i], 0.04));
    bell(c('z-end', 0), 'C5', 0.07);
    bell(c('z-end', 0) + 0.4, 'G5', 0.05);
  }

  const film = E.film({
    title: 'Tabağındaki Bilim — Soğan Neden Ağlatır?',
    timeline: TL,
    background,
    score,
    narration: VOICE,
    voice: VOICE.voice,
    fade: 0.4,
  });
  window.FILM = film;
})();
