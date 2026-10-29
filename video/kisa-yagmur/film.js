/*
 * YUP Akademi · Lup · Vücudun Gizli Ayarları kısa video (1080×1920) — Yağmur kokusu (jeosmin)
 *
 * Anlatıcı Lup: köşede durur, ağzı sese uyar (dudak.js), sahnelere tepki verir. Arka planlar ChatGPT'de çizildi
 * (havuz, yağmurlu pencere, toprağın içi; assets.js); damla, kabarcıklar, koku kıvrımları, halkalar ve jeosmin
 * molekülü kodla çizilir (el yapımı defter dili, yup-marka/el.js). Geçişler mercek halkasıyla.
 * Kurgu: ilk karede Mercek Açılışı ve başlık; olaylar sözcüğüne oturur (W: sözcük zamanı); 5. satır duygusal
 * merkezdir (pencerede derin nefes, koku kıvrımları ve davetiye); kapanış davetiyeye döner.
 * Sahneler: havuz ve pirinç tanesi · jeosmin ve toprağın içi · damla ağır çekim (çisenti/sağanak) · kollemlere
 * davetiye · pencerede derin nefes · arkadaşına gönder ve "Lup'la bak".
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, lerp, ease, progress, hash } = E;
  const K = window.YupKisa;
  const L = window.YupEl;
  const LUP = window.YupLup;
  const { P, ink, arrow, serif, mono, hand, headline, paper, tape, speech, finish } = L;
  const TAU = Math.PI * 2;

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
  window.FILM_READY = Promise.all([window.FILM_READY, window.EL_FONTS_READY, ...loads]);

  function pic(ctx, k, x, y, w, { ax = 0.5, ay = 0.5, rot = 0, a = 1, flip = false } = {}) {
    const g = A[k];
    if (!g || a <= 0.002 || w <= 0.5) return;
    const h = (w * g.h) / g.w;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(IMG[k], -ax * w, -ay * h, w, h);
    ctx.restore();
  }
  // Arka plan: ekranı kaplar; zoom ve (zx, zy) yakınlaşma merkezi
  function cover(ctx, k, { dim = 0, zoom = 1, zx = 540, zy = 960, tint = null } = {}) {
    const g = A[k];
    const s = Math.max(1080 / g.w, 1920 / g.h);
    ctx.save();
    ctx.translate(zx, zy);
    ctx.scale(zoom, zoom);
    ctx.translate(-zx, -zy);
    ctx.drawImage(IMG[k], 540 - (g.w * s) / 2, 960 - (g.h * s) / 2, g.w * s, g.h * s);
    ctx.restore();
    if (tint) {
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, 1080, 1920);
    }
    if (dim) {
      ctx.fillStyle = `rgba(14,10,8,${dim})`;
      ctx.fillRect(0, 0, 1080, 1920);
    }
  }

  // ---------------------------------------------------------------------------
  // Yardımcılar
  // ---------------------------------------------------------------------------
  const WIN = [190, 0, 960, 1300];
  // Fotoğraf üstünde okunur başlık için kâğıt şerit
  function strip(ctx, y, rows, lead = 100, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= 0.94 * a;
    ctx.fillStyle = '#f6efe1';
    ctx.beginPath();
    ctx.roundRect(46, y - 90, 988, 130 + (rows - 1) * lead, 18);
    ctx.fill();
    ctx.restore();
    tape(ctx, 540, y - 88, 150, -0.03, a);
  }
  const W = (api, id, i) => api.cue(id, 0) + (window.DUDAK?.[id]?.[i]?.[0] ?? i * 0.4);
  function lup(ctx, t, api, id, x, y, h, st = {}) {
    LUP.draw(ctx, x, y, h, { talk: LUP.say(api, id, t), ...st }, t);
  }
  function dense(pts, step = 14, close = false) {
    const out = [];
    const n = pts.length;
    for (let i = 0; i < (close ? n : n - 1); i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % n];
      const k = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / step));
      for (let j = 0; j < k; j++) out.push([x1 + ((x2 - x1) * j) / k, y1 + ((y2 - y1) * j) / k]);
    }
    if (!close) out.push(pts[n - 1]);
    return out;
  }
  const circle = (x, y, r, n = 26) => Array.from({ length: n }, (_, i) => [x + Math.cos((i / n) * TAU) * r, y + Math.sin((i / n) * TAU) * r]);

  function tag(ctx, dark = false, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    K.appIcon(ctx, 104, 206, 62);
    mono(ctx, 'VÜCUDUN GİZLİ AYARLARI', 152, 200, { size: 22, color: dark ? '#f2eadc' : P.ink, spacing: 3 });
    mono(ctx, 'YUP AKADEMİ · LUP', 152, 230, { size: 19, weight: 500, spacing: 3, color: dark ? 'rgba(242,234,220,0.75)' : P.ink2 });
    ctx.restore();
  }

  // Yağmur çizgileri (ön plan)
  function rain(ctx, t, { a = 1, n = 70, speed = 1500, len = 60, col = '220,232,240', slant = 0.12, clip = null } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    if (clip) {
      ctx.beginPath();
      ctx.rect(...clip);
      ctx.clip();
    }
    ctx.globalAlpha *= a;
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const sp = speed * (0.75 + 0.5 * hash(i, 2));
      const y = ((t * sp + hash(i, 3) * 2200) % 2200) - 140;
      const x = hash(i, 1) * 1180 - 50 + y * slant;
      const l = len * (0.6 + 0.8 * hash(i, 4));
      ctx.strokeStyle = `rgba(${col},${0.18 + 0.22 * hash(i, 5)})`;
      ctx.lineWidth = 2 + 2 * hash(i, 6);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - l * slant, y - l);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Suda halkalar (kuşbakışı)
  function ripples(ctx, x, y, t0, t, { n = 4, R = 340, life = 2.4, col = '255,255,255', sy = 1 } = {}) {
    const lt = t - t0;
    if (lt < 0) return;
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const u = (lt - i * 0.28) / life;
      if (u <= 0 || u >= 1) continue;
      const r = R * ease.out(u);
      ctx.strokeStyle = `rgba(${col},${0.75 * (1 - u)})`;
      ctx.lineWidth = 6 * (1 - u) + 1.5;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * sy, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Koku kıvrımları: (x1, y1)'den (x2, y2)'ye akan dalgalı çizgiler
  function scent(ctx, t, x1, y1, x2, y2, { a = 1, n = 3, col = 'rgba(122,84,52,0.75)', width = 6, amp = 34, k = 1, seed = 0 } = {}) {
    if (a <= 0.002 || k <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = col;
    ctx.lineCap = 'round';
    ctx.lineWidth = width;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const nx = -dy / len;
    const ny = dx / len;
    for (let j = 0; j < n; j++) {
      const off = (j - (n - 1) / 2) * amp * 0.9;
      ctx.beginPath();
      const m = Math.max(2, Math.floor(40 * k));
      for (let i = 0; i <= m; i++) {
        const u = i / 40;
        const w = Math.sin(u * 9 - t * 4 + j * 1.7 + seed) * amp * Math.sin(Math.PI * Math.min(1, u * 1.2));
        const x = x1 + dx * u + nx * (w + off * (1 - u));
        const y = y1 + dy * u + ny * (w + off * (1 - u));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // Jeosmin: iki kaynaşık altıgen halka, bir OH, iki metil (iskelet çizimi)
  function geosmin(ctx, x, y, s, t, a = 1) {
    if (a <= 0.002 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    const r = 70;
    const hex = (cx) => Array.from({ length: 6 }, (_, i) => [cx + Math.cos(Math.PI / 6 + (i * TAU) / 6) * r, Math.sin(Math.PI / 6 + (i * TAU) / 6) * r]);
    const h1 = hex(-r * 0.866);
    const h2 = hex(r * 0.866);
    ink(ctx, dense(h1, 10, true), { width: 6, seed: 301, t, color: P.ink });
    ink(ctx, dense(h2, 10, true), { width: 6, seed: 302, t, color: P.ink });
    // ortak bağın üst ucunda OH, alt ucunda metil
    const top = [0, -r];
    const bot = [0, r];
    ink(ctx, dense([top, [0, -r - 55]], 8), { close: false, width: 6, seed: 303, t });
    serif(ctx, 'OH', 0, -r - 66, { size: 40, align: 'center', color: P.red });
    ink(ctx, dense([bot, [0, r + 55]], 8), { close: false, width: 6, seed: 304, t });
    const hc = h2[0];
    ink(ctx, dense([hc, [hc[0] + 48, hc[1] - 28]], 8), { close: false, width: 6, seed: 305, t });
    ctx.restore();
  }

  // Kâğıt kart (bantlı)
  function card(ctx, x, y, w, h, { rot = -0.03, a = 1, s = 1, fill = '#fbf6ea' } = {}) {
    if (a <= 0.002 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.shadowColor = 'rgba(40,25,15,0.3)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = fill;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Sahneler
  // ---------------------------------------------------------------------------
  const draw = {};

  // 1 · Kanca: Mercek Açılışı; havuza bir pirinç tanesi düşer
  draw['y-hook'] = function (ctx, t, api) {
    const id = 'y-hook';
    const s0 = api.S0(id);
    const gIn = W(api, id, 4) - 0.1; // "pirinç"
    const fall0 = W(api, id, 6); // "kadar"
    const land = W(api, id, 9) + 0.12; // "atsan"
    const sniff = W(api, id, 10); // "burnun"
    const wow = W(api, id, 13); // "fark"
    const inner = (c) => {
      cover(c, 'havuz');
      ripples(c, 540, 930, land, t, { n: 4, R: 420, life: 2.6 });
      // pirinç tanesi: önce yukarıda belirir, sonra kuşbakışı düşer (küçülür), suya değer
      const ga = progress(t, gIn, gIn + 0.3);
      if (ga > 0 && t < land + 0.05) {
        const u = progress(t, fall0, land, ease.in);
        const w = lerp(300, 46, u);
        const x = lerp(560, 540, u);
        const y = lerp(760, 930, u);
        c.save();
        c.globalAlpha *= 0.35 * (1 - u);
        c.fillStyle = 'rgba(10,40,50,0.6)';
        c.beginPath();
        c.ellipse(540 + (1 - u) * 60, 940 + (1 - u) * 50, w * 0.42, w * 0.2, 0.3, 0, TAU);
        c.fill();
        c.restore();
        pic(c, 'pirinc', x, y, w, { a: ga, rot: 0.35 + u * 1.2 });
        if (u < 0.05) {
          mono(c, '≈ 25 mg', 740, 700, { size: 38, color: P.ink, alpha: ga, weight: 600 });
          arrow(c, 750, 690, 700, 735, { bend: 0.2, seed: 11, t, width: 4, prog: ga });
        }
      }
      // sıçrayan damlacıklar
      const sp = progress(t, land, land + 0.5);
      if (sp > 0 && sp < 1) {
        c.fillStyle = `rgba(255,255,255,${0.8 * (1 - sp)})`;
        for (let i = 0; i < 10; i++) {
          const th = (i / 10) * TAU;
          const d = 30 + sp * 90;
          c.beginPath();
          c.arc(540 + Math.cos(th) * d, 930 + Math.sin(th) * d * 0.9 - Math.sin(Math.PI * sp) * 30, 5, 0, TAU);
          c.fill();
        }
      }
    };
    const p = LUP.intro(ctx, t, s0, inner, { cx: 540, cy: 930, r0: 360 });
    // seyreltme notu
    const na = progress(t, land + 0.25, land + 0.6);
    if (na > 0) {
      card(ctx, 300, 1290, 420, 150, { rot: -0.04, a: na });
      mono(ctx, '2.500.000 litre suda', 300, 1270, { size: 26, align: 'center', color: P.ink, alpha: na });
      serif(ctx, 'trilyonda 10', 300, 1330, { size: 52, align: 'center', color: P.teal, alpha: na });
    }
    // Lup: bloklardan zıplar, "burnun"da derin nefes alır, "fark"ta gözleri açılır
    const hp = LUP.hop(t, s0 + 1.15);
    const inhale = progress(t, sniff - 0.05, sniff + 0.45, ease.inOut) * (1 - progress(t, wow, wow + 0.3));
    lup(ctx, t, api, id, 860, 1830, 520, {
      ...hp,
      squash: hp.squash - 0.1 * inhale,
      face: t > wow ? 'hayret' : inhale > 0.3 ? 'mutlu' : 'merak',
      browUp: t > wow ? 0.06 : 0,
      arms: t > wow ? 'kenet' : 'anlat',
      gx: -0.6,
      gy: -0.4,
    });
    if (inhale > 0.2) {
      ctx.save();
      ctx.strokeStyle = 'rgba(42,28,20,0.7)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const k = (t * 2.2 + i / 3) % 1;
        ctx.globalAlpha = inhale * (1 - k);
        ctx.beginPath();
        ctx.arc(860 - 140 - k * 40, 1450 - 40 + i * 32, 22, -0.8, 0.8);
        ctx.stroke();
      }
      ctx.restore();
    }
    // başlık: ilk karede hazır, kâğıt şerit üstünde
    const hl = [[{ s: 'Koca bir havuzda' }]];
    if (t >= gIn) hl.push([{ s: 'bir ' }, { s: 'pirinç tanesi.', mark: P.marker }]);
    strip(ctx, 380, hl.length, 100);
    headline(ctx, hl, 80, 380, { size: 92, lead: 1.08, prog: 1, markProg: progress(t, gIn + 0.2, gIn + 0.6) });
    tag(ctx, false, progress(t, s0 + 1.0, s0 + 1.3) * (p >= 1 ? 1 : 0));
    finish(ctx, t, { vig: 0.22 });
  };

  // 2 · Yağmur kokusu = jeosmin; toprakta yaşayan bakteriler yapıyor
  draw['y-ad'] = function (ctx, t, api) {
    const id = 'y-ad';
    const s0 = api.S0(id);
    const jT = W(api, id, 5); // "jeosmin"
    const soil = W(api, id, 6) - 0.15; // "toprakta"
    const win = (c) => {
      cover(c, 'pencere', { zoom: lerp(1, 1.06, progress(t, s0, soil)) });
      rain(c, t, { a: 0.9, clip: WIN });
      strip(c, 380, 2, 98);
      headline(c, [[{ s: 'O madde:' }], [{ s: 'yağmur kokusu.', mark: P.markerBlue }]], 80, 380, { size: 96, lead: 1.02, prog: progress(t, s0 + 0.05, s0 + 0.5), markProg: progress(t, W(api, id, 2), W(api, id, 2) + 0.4) });
      // jeosmin kartı
      const ca = api.pop(t, jT - 0.1, 0.45);
      if (ca > 0) {
        card(c, 380, 960, 520, 440, { rot: -0.05, s: ca });
        c.save();
        c.translate(380, 960);
        c.rotate(-0.05);
        c.scale(ca, ca);
        geosmin(c, 0, 30, 0.85, t);
        serif(c, 'jeosmin', -220, -168, { size: 56 });
        mono(c, 'C₁₂H₂₂O', 120, 190, { size: 28, color: P.ink });
        hand(c, '"toprak kokusu"', -210, 195, { size: 38, color: P.coffee });
        c.restore();
        tape(c, 380, 745, 130, 0.06);
      }
      lup(c, t, api, id, 860, 1840, 470, { face: t > jT ? 'gulum' : 'merak', arms: t > jT ? 'gosterSol' : 'anlat', gx: -0.8, gy: -0.3 });
      tag(c, true);
      finish(c, t, { vig: 0.3 });
    };
    const ground = (c) => {
      const z = lerp(1.12, 1.0, progress(t, soil, soil + 1.2, ease.out));
      cover(c, 'makro', { zoom: z, zx: 560, zy: 820 });
      const la = progress(t, W(api, id, 9) - 0.1, W(api, id, 9) + 0.3);
      if (la > 0) {
        card(c, 300, 1500, 440, 120, { rot: -0.03, a: la });
        hand(c, 'bakteri: Streptomyces', 110, 1515, { size: 42, color: P.ink, alpha: la });
        arrow(c, 380, 1440, 470, 1200, { bend: -0.2, seed: 41, t, color: '#fff6e8', width: 5, prog: la });
        mono(c, 'sporlar', 820, 360, { size: 30, color: '#fff6e8', alpha: la });
        arrow(c, 860, 380, 820, 470, { bend: 0.2, seed: 42, t, color: '#fff6e8', width: 4, prog: la });
      }
      headline(c, [[{ s: 'Toprakta yaşayan', c: '#fff6e8' }], [{ s: 'minik bakteriler.', c: '#fff6e8', mark: P.marker }]], 70, 1690, { size: 72, lead: 1.05, prog: progress(t, soil + 0.2, soil + 0.6), markProg: progress(t, W(api, id, 8), W(api, id, 8) + 0.4) });
      lup(c, t, api, id, 900, 1880, 380, { face: 'hayret', arms: 'kenet', gx: -0.7, gy: -0.8 });
      tag(c, true);
      finish(c, t, { vig: 0.3 });
    };
    const p = progress(t, soil, soil + 0.55);
    if (p <= 0) win(ctx);
    else if (p >= 1) ground(ctx);
    else LUP.lensWipe(ctx, p, () => win(ctx), () => ground(ctx));
  };

  // 3 · Damla ağır çekim: kabarcıklar patlar, koku havaya savrulur; çisenti > sağanak
  draw['y-damla'] = function (ctx, t, api) {
    const id = 'y-damla';
    const s0 = api.S0(id);
    const hit = W(api, id, 3); // "çarpınca"
    const bub = W(api, id, 4); // "minicik"
    const pop = W(api, id, 6); // "patlar"
    const fly = W(api, id, 8); // "kokuyu"
    const two = W(api, id, 11) - 0.1; // "En güzel"
    paper(ctx, t, { stains: [[980, 330, 80, 71]] });
    tag(ctx);
    const swap = progress(t, two, two + 0.4);
    const part1 = 1 - swap;
    if (part1 > 0) {
      ctx.save();
      ctx.globalAlpha *= part1;
      headline(ctx, [[{ s: 'Bir damla,' }], [{ s: 'küçük bir ' }, { s: 'patlama.', mark: P.marker }]], 80, 370, { size: 96, lead: 1.02, prog: progress(t, s0 + 0.05, s0 + 0.5), markProg: progress(t, pop, pop + 0.35) });
      mono(ctx, 'AĞIR ÇEKİM · ×1000', 82, 560, { size: 24 });
      // toprak kesiti
      const surf = 1300;
      const soilPts = [[60, surf]];
      for (let x = 60; x <= 1020; x += 30) soilPts.push([x, surf + Math.sin(x * 0.02) * 10]);
      soilPts.push([1020, 1620], [60, 1620]);
      ink(ctx, soilPts, { fill: '#8a5a3a', seed: 401, t, width: 6, off: [6, 5] });
      for (let i = 0; i < 46; i++) {
        const x = 90 + hash(i, 1) * 900;
        const y = surf + 40 + hash(i, 2) * 260;
        ink(ctx, circle(x, y, 8 + hash(i, 3) * 16, 12), { fill: hash(i, 4) > 0.5 ? '#6d4329' : '#f2eadc', seed: 410 + i, t, width: 3, off: [2, 2] });
      }
      hand(ctx, 'toprak (gözenekli)', 80, 1680, { size: 40, color: P.ink2 });
      // damla düşer
      const fu = progress(t, s0 + 0.15, hit, ease.in);
      if (t < hit) {
        const y = lerp(620, surf - 60, fu);
        ink(ctx, dense([[540, y - 70], [575, y - 5], [570, y + 30], [540, y + 50], [510, y + 30], [505, y - 5]], 8, true), { fill: '#7fb0d8', seed: 420, t, width: 5, off: [4, 3] });
      } else {
        // yayılan su ince bir tabaka olur
        const sp = progress(t, hit, hit + 0.4, ease.out);
        const wdt = lerp(70, 260, sp);
        ink(ctx, dense([[540 - wdt, surf + 2], [540 - wdt * 0.6, surf - 26], [540 + wdt * 0.6, surf - 26], [540 + wdt, surf + 2]], 10, true), { fill: '#a9cbe6', seed: 421, t, width: 5, off: [3, 3] });
        // taç sıçraması
        if (sp < 1) {
          for (let i = 0; i < 8; i++) {
            const th = Math.PI + (i / 7) * Math.PI;
            const d = 60 + sp * 120;
            ink(ctx, circle(540 + Math.cos(th) * d, surf - 30 + Math.sin(th) * d * 0.8, 9 * (1 - sp) + 2, 8), { fill: '#a9cbe6', seed: 430 + i, t, width: 3, off: [1, 1] });
          }
        }
      }
      // kabarcıklar: gözeneklerden yükselir, yüzeyde patlar
      for (let i = 0; i < 7; i++) {
        const t0 = bub + i * 0.12;
        const x = 420 + i * 40;
        const u = progress(t, t0, pop + i * 0.05, ease.out);
        if (u <= 0) continue;
        const popped = t > pop + i * 0.05;
        if (!popped) {
          const y = lerp(surf + 50, surf - 20, u);
          ink(ctx, circle(x, y, 10 + 4 * hash(i, 9), 12), { fill: 'rgba(255,255,255,0.85)', seed: 440 + i, t, width: 3, off: [1, 1] });
        }
      }
      if (t > bub + 0.2 && t < pop + 0.4) hand(ctx, 'hava kabarcıkları', 700, surf - 70, { size: 40, color: P.blue, alpha: progress(t, bub + 0.2, bub + 0.5) * (1 - progress(t, pop + 0.2, pop + 0.4)) });
      // koku tanecikleri havaya savrulur
      const ua = progress(t, pop, pop + 0.2);
      if (ua > 0) {
        for (let i = 0; i < 26; i++) {
          const lt = t - pop - hash(i, 11) * 0.3;
          if (lt < 0) continue;
          const x = 400 + hash(i, 12) * 280 + Math.sin(lt * 3 + i) * 30 * lt;
          const y = surf - 40 - lt * (160 + hash(i, 13) * 140);
          if (y < 640) continue;
          ink(ctx, circle(x, y, 5 + hash(i, 14) * 4, 8), { fill: '#b07a4e', seed: 460 + i, t, width: 2, off: [1, 1] });
        }
        scent(ctx, t, 560, surf - 60, 620, 700, { a: progress(t, fly, fly + 0.4), k: progress(t, fly, fly + 0.8), n: 3, amp: 40 });
        hand(ctx, 'koku tanecikleri', 690, 860, { size: 44, color: P.coffee, alpha: progress(t, fly, fly + 0.3) });
      }
      ctx.restore();
    }
    // çisenti ve sağanak
    if (swap > 0) {
      ctx.save();
      ctx.globalAlpha *= swap;
      headline(ctx, [[{ s: 'En güzeli:' }], [{ s: 'çisenti.', mark: P.markerTeal }]], 80, 370, { size: 104, lead: 1.0, prog: progress(t, two, two + 0.4), markProg: progress(t, W(api, id, 16), W(api, id, 16) + 0.4) });
      const panel = (x, label, drops, big, many, ok) => {
        const pts = dense([[x - 210, 640], [x + 210, 640], [x + 210, 1280], [x - 210, 1280]], 16, true);
        ink(ctx, pts, { fill: '#fbf6ea', seed: 480 + x, t, width: 5, off: [5, 4] });
        ink(ctx, dense([[x - 200, 1180], [x + 200, 1180]], 12), { close: false, width: 6, seed: 482 + x, t, color: '#6d4329' });
        for (let i = 0; i < drops; i++) {
          const sp = big ? 1400 : 520;
          const y = ((t * sp + hash(i, x) * 600) % 560) + 640;
          const xx = x - 180 + hash(i, x + 1) * 360;
          const r = big ? 14 : 6;
          ink(ctx, dense([[xx, y - r * 2.2], [xx + r, y], [xx, y + r], [xx - r, y]], 6, true), { fill: '#7fb0d8', seed: 490 + i, t, width: 2.5, off: [1, 1] });
        }
        for (let i = 0; i < many; i++) {
          const ph = (t * 0.6 + hash(i, x + 2)) % 1;
          const xx = x - 170 + hash(i, x + 3) * 340 + Math.sin(ph * 6 + i) * 12;
          const y = 1170 - ph * 420;
          ctx.fillStyle = `rgba(150,96,56,${0.9 * (1 - ph)})`;
          ctx.beginPath();
          ctx.arc(xx, y, 8, 0, TAU);
          ctx.fill();
        }
        serif(ctx, label, x, 1350, { size: 56, align: 'center' });
        hand(ctx, ok ? 'çok koku' : 'az koku', x, 1410, { size: 44, align: 'center', color: ok ? P.teal : P.red, rot: -0.02 });
      };
      panel(290, 'çisenti', 16, false, 22, true);
      panel(790, 'sağanak', 9, true, 4, false);
      mono(ctx, 'MIT · 2015 · 28 yüzeyde 600 deney', 540, 1490, { size: 22, align: 'center' });
      ctx.restore();
    }
    lup(ctx, t, api, id, 900, 1880, 400, {
      face: t > pop && t < pop + 0.5 ? 'hayret' : 'gulum',
      arms: swap > 0.5 ? 'gosterSol' : 'anlat',
      gx: -0.8,
      gy: swap > 0.5 ? -0.6 : -0.3,
    });
    finish(ctx, t);
  };

  // 4 · Davetiye: bakteriler kollembolleri çağırır, sporlar taşınır
  draw['y-davet'] = function (ctx, t, api) {
    const id = 'y-davet';
    const s0 = api.S0(id);
    const bug = W(api, id, 3); // "böcekleri"
    const send = W(api, id, 4); // "çağırmak"
    const call = W(api, id, 7); // "Gelin"
    const spore = W(api, id, 8); // "sporlarımı"
    const go = W(api, id, 9) + 0.15; // "taşıyın"
    cover(ctx, 'makro', { zoom: 1.04, zx: 560, zy: 900, dim: 0.28 });
    headline(ctx, [[{ s: 'Koku bir', c: '#fff6e8' }], [{ s: 'davetiye.', c: '#fff6e8', mark: P.marker }]], 70, 370, { size: 100, lead: 1.0, prog: progress(t, s0 + 0.05, s0 + 0.5), markProg: progress(t, send, send + 0.4) });
    // kollembol: sağdan yürüyerek gelir, sporları yüklenir, zıplayıp gider
    const walk = progress(t, bug - 0.15, bug + 0.7, ease.out);
    const jump = progress(t, go, go + 0.7, ease.in);
    const kx = lerp(1250, 720, walk) + jump * 520;
    const ky = 1380 - Math.sin(Math.PI * Math.min(1, jump * 1.2)) * 260 - jump * 300;
    const key = jump > 0 ? 'kol_zipla' : t > spore ? 'kol_spor' : 'kol_yuru';
    const bob = jump > 0 ? 0 : Math.abs(Math.sin(t * 14)) * 6 * (walk < 1 ? 1 : 0);
    pic(ctx, key, kx, ky - bob, 330, { flip: true });
    if (walk > 0.3 && jump === 0) {
      mono(ctx, 'kollembol', kx, ky + 140, { size: 30, align: 'center', color: '#fff6e8', alpha: walk });
      mono(ctx, '(toprak eklembacaklısı)', kx, ky + 176, { size: 20, align: 'center', color: 'rgba(255,246,232,0.8)', alpha: walk });
    }
    // davetiye: bakteri ipliğinden kollemble uçar
    const fz = progress(t, send, send + 0.75, ease.inOut);
    if (fz > 0 && t < spore) {
      const x = lerp(330, kx - 90, fz);
      const y = lerp(1050, ky - 120, fz) - Math.sin(Math.PI * fz) * 220;
      pic(ctx, fz < 1 ? 'zarf' : 'zarf_acik', x, y, fz < 1 ? 170 : 190, { rot: fz < 1 ? lerp(-0.4, 0.2, fz) : 0.05 });
      scent(ctx, t, 330, 1050, x, y, { a: 0.7 * (fz < 1 ? 1 : 0.6), n: 2, amp: 24, width: 4, col: 'rgba(255,240,220,0.7)', k: fz });
    }
    // konuşma balonu: bakteriden
    const ba = api.pop(t, call - 0.05, 0.4);
    if (ba > 0) {
      speech(ctx, 360, 820, 560, 220, { s: ba, tail: [-0.2, 1], t, seed: 51 });
      if (ba > 0.6) {
        hand(ctx, 'Gelin, sporlarımı', 150, 800, { size: 54, color: P.ink, rot: -0.03 });
        hand(ctx, 'taşıyın!', 220, 862, { size: 54, color: P.red, rot: -0.03 });
      }
    }
    lup(ctx, t, api, id, 150, 1880, 380, { face: t > call ? 'mutlu' : 'gulum', arms: 'anlat', gx: 0.8, gy: -0.4 });
    tag(ctx, true);
    finish(ctx, t, { vig: 0.3 });
  };

  // 5 · Pencerede derin nefes: toprağın davetiyesi
  draw['y-nefes'] = function (ctx, t, api) {
    const id = 'y-nefes';
    const s0 = api.S0(id);
    const open = W(api, id, 3); // "açıp"
    const deep = W(api, id, 4); // "derin"
    const earth = W(api, id, 8); // "toprağın"
    const inv = W(api, id, 12); // "davetiyeyi"
    cover(ctx, 'pencere', { zoom: lerp(1.08, 1.0, progress(t, s0, s0 + 2.5, ease.out)) });
    rain(ctx, t, { a: 0.75, n: 40, clip: WIN });
    // dışarıdan içeri akan koku
    const k = progress(t, deep - 0.1, deep + 1.4, ease.out);
    scent(ctx, t, 1040, 700, 700, 1050, { a: 0.95, k, n: 4, amp: 46, width: 9, col: 'rgba(120,78,44,0.85)' });
    scent(ctx, t, 1060, 520, 720, 1000, { a: 0.6, k: progress(t, deep + 0.3, deep + 1.8, ease.out), n: 2, amp: 30, width: 5, col: 'rgba(240,226,200,0.85)', seed: 2 });
    // Lup pencere pervazında
    const breath = progress(t, deep, deep + 0.9, ease.inOut) * (1 - progress(t, earth + 0.4, earth + 1.0, ease.inOut));
    const hasEnv = t > earth + 0.6;
    lup(ctx, t, api, id, 700, 1395, 500, {
      squash: -0.11 * breath,
      browUp: 0.05 * breath,
      face: breath > 0.3 ? 'mutlu' : t > inv ? 'gulum' : 'merak',
      gx: t < open ? -0.2 : 0.9,
      gy: -0.2,
      arms: hasEnv ? 'tut' : t > open && t < deep ? 'goster' : 'dur',
      hold: hasEnv ? { r: (c) => {
        const g = A[t > inv ? 'zarf_acik' : 'zarf'];
        const w = 1.0;
        const h = (w * g.h) / g.w;
        c.drawImage(IMG[t > inv ? 'zarf_acik' : 'zarf'], -w * 0.3, -h * 0.85, w, h);
      } } : undefined,
    });
    // davetiye: koku kıvrımıyla süzülür, Lup'un eline konar
    const fz = progress(t, earth - 0.4, earth + 0.6, ease.inOut);
    if (fz > 0 && !hasEnv) {
      pic(ctx, 'zarf', lerp(1050, 880, fz), lerp(560, 1180, fz) + Math.sin(fz * 9) * 20, 150, { rot: Math.sin(fz * 7) * 0.4 });
    }
    if (t > inv) LUP.glint(ctx, 920, 1170, 0.35 * Math.sin(Math.PI * progress(t, inv, inv + 0.6)), { rot: t });
    const ta = progress(t, deep, deep + 0.4);
    if (ta > 0) {
      ctx.save();
      ctx.globalAlpha *= 0.86 * ta;
      ctx.fillStyle = '#f6efe1';
      ctx.beginPath();
      ctx.roundRect(300, 300, 620, t > earth ? 200 : 115, 22);
      ctx.fill();
      ctx.restore();
    }
    hand(ctx, 'derin bir nefes…', 335, 380, { size: 64, color: P.ink, alpha: ta, rot: -0.03 });
    hand(ctx, 'toprağın davetiyesi', 335, 462, { size: 64, color: '#8a3d16', alpha: progress(t, earth, earth + 0.4), rot: -0.04 });
    tag(ctx, true);
    finish(ctx, t, { vig: 0.34 });
  };

  // 6 · Arkadaşına gönder ve "Lup'la bak"
  draw['y-cta'] = function (ctx, t, api) {
    const id = 'y-cta';
    const { S0, end, fadeIn, pop } = api;
    const s0 = S0(id);
    const c1 = api.cue(id, 1);
    paper(ctx, t, { stains: [[120, 1760, 110, 81]] });
    headline(ctx, [[{ s: 'Yağmur kokusuna' }], [{ s: 'bayılan' }], [{ s: 'arkadaşına' }], [{ s: 'gönder.', mark: P.marker }]], 80, 330, { size: 82, lead: 1.02, prog: progress(t, s0 + 0.05, s0 + 0.7), markProg: progress(t, s0 + 0.6, s0 + 1.0) });
    // fotoğraf: yağmurlu pencere; "bir sonraki yağmurda" sözünde fotoğrafa yağmur yağar
    const pa = pop(t, s0 + 0.15, 0.5);
    if (pa > 0) {
      ctx.save();
      ctx.translate(790, 600);
      ctx.rotate(0.07);
      ctx.scale(pa, pa);
      ctx.shadowColor = 'rgba(60,40,20,0.28)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = '#fffdf7';
      ctx.fillRect(-165, -215, 330, 430);
      ctx.shadowColor = 'transparent';
      ctx.save();
      ctx.beginPath();
      ctx.rect(-140, -190, 280, 320);
      ctx.clip();
      ctx.drawImage(IMG.pencere, 230, 120, 600, 690, -140, -190, 280, 320);
      ctx.translate(-140, -190);
      ctx.scale(280 / 1080, 320 / 1240);
      rain(ctx, t, { a: progress(t, c1, c1 + 0.4), n: 40, speed: 1200 });
      ctx.restore();
      hand(ctx, 'bir sonraki yağmur', 0, 180, { size: 36, align: 'center', color: P.ink2, rot: -0.02 });
      tape(ctx, 0, -217, 140, -0.05);
      ctx.restore();
    }
    // Lup davetiyeyi fırlatır (s0 + 0,9), sonra abone ol düğmesine dokunur
    const tap = end(id) + 0.35;
    const throwK = progress(t, s0 + 0.7, s0 + 1.0, ease.inOut);
    const back = progress(t, s0 + 1.3, s0 + 1.7, ease.inOut);
    const reach = progress(t, tap - 0.7, tap - 0.08, ease.inOut);
    const throwPose = { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.2, y: -1.25, el: 'acik', d: [0.2, -1] } };
    const windUp = { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.9, y: 0.6, el: 'yumruk', d: [1, 0.3] } };
    const tapPose = { l: { x: -2.15, y: 0.95, el: 'isaret', d: [-1, 0.2] }, r: { x: 1.4, y: 1.62, el: 'acik', d: [0.3, 1] } };
    let arms = LUP.mix(windUp, throwPose, throwK);
    if (back > 0) arms = LUP.mix(throwPose, 'anlat', back);
    if (reach > 0) arms = LUP.mix('anlat', tapPose, reach);
    const done = t > tap;
    lup(ctx, t, api, id, 860, 1830, 560, {
      ...LUP.hop(t, s0 + 0.05, { from: 300 }),
      face: done ? 'mutlu' : t > c1 ? 'gulum' : 'merak',
      gx: reach > 0 ? -0.9 : -0.3,
      gy: reach > 0 ? 0.4 : -0.6,
      arms,
    });
    // davetiye uçuşu: Lup'un elinden fotoğrafa
    const fly = progress(t, s0 + 1.0, s0 + 1.55, ease.inOut);
    if (fly > 0) {
      const path = [];
      for (let i = 0; i <= 30; i++) {
        const u = i / 30;
        path.push([lerp(930, 790, u) + Math.sin(Math.PI * u) * 150, lerp(1180, 660, u) - Math.sin(Math.PI * u) * 80]);
      }
      const n = Math.max(2, Math.floor(path.length * fly));
      for (let i = 0; i < n - 1; i += 2) ink(ctx, [path[i], path[i + 1]], { close: false, width: 4, color: 'rgba(42,28,20,0.5)', seed: 280 + i, t });
      if (fly < 1) {
        const [px, py] = path[n - 1];
        pic(ctx, 'zarf', px, py, 130, { rot: -0.3 + fly * 0.6 });
      }
    }
    if (t > s0 + 1.55) hand(ctx, 'gönderildi ✓', 650, 900, { size: 46, color: P.teal, alpha: fadeIn(t, s0 + 1.55, 0.25), rot: -0.03 });
    // marka
    const la = pop(t, s0 + 0.25, 0.6);
    if (la > 0) {
      ctx.save();
      ctx.translate(160, 1225);
      ctx.scale(la, la);
      K.appIcon(ctx, 0, 0, 140, { reveal: progress(t, s0 + 0.5, s0 + 1.3, ease.inOut), shine: progress(t, s0 + 1.4, s0 + 2.1) });
      ctx.restore();
    }
    const wa = fadeIn(t, s0 + 0.7, 0.4);
    K.T(ctx, 'YUP Akademi', 255, 1205, { size: 60, weight: 900, color: P.teal, align: 'left', alpha: wa });
    hand(ctx, "Lup'la bak.", 258, 1272, { size: 48, color: P.ink, alpha: wa, rot: -0.02 });
    const ba = fadeIn(t, s0 + 1.1, 0.35);
    if (ba > 0) {
      const press = Math.exp(-(((t - tap) / 0.09) ** 2));
      ctx.save();
      ctx.globalAlpha *= ba;
      ctx.translate(390, 1560);
      ctx.scale(1 - 0.06 * press, 1 - 0.06 * press);
      const w = 420;
      ink(ctx, dense([[-w / 2, -50], [w / 2, -50], [w / 2, 50], [-w / 2, 50]], 16, true), { fill: done ? '#fffaf0' : P.teal, seed: 290, t, width: 6, off: [7, 6] });
      serif(ctx, done ? 'Abone olundu ✓' : 'Abone ol', 0, 16, { size: 46, align: 'center', color: done ? P.teal : '#fffaf0', weight: 800 });
      ctx.restore();
      if (done) {
        for (let i = 0; i < 10; i++) {
          const q2 = clamp((t - tap) / 0.9);
          if (q2 >= 1) continue;
          const th = (i / 10) * TAU;
          const d = 230 + q2 * 120;
          hand(ctx, '+', 390 + Math.cos(th) * d, 1560 + Math.sin(th) * d * 0.4, { size: 40 * (1 - q2) + 10, color: [P.amber, P.teal, P.blue][i % 3], align: 'center', rot: 0 });
        }
      }
    }
    tag(ctx);
    finish(ctx, t);
  };

  // ---------------------------------------------------------------------------
  // Ses
  // ---------------------------------------------------------------------------
  function score(m, hz, api) {
    const { S0, S1 } = api;
    const bell = (t, n, g = 0.06, pan = 0) => m.bell(t, { freq: hz(n), gain: g, decay: 2.4, pan });
    const pop = (t, n, g = 0.05, pan = 0) => m.pop(t, { freq: hz(n), gain: g, pan });
    // yağmur dokusu: pencere sahnelerinde belirgin, arada hafif
    m.rain(S0('y-ad'), W(api, 'y-ad', 6) - S0('y-ad'), { gain: 0.14 });
    m.rain(S0('y-nefes'), S1('y-nefes') - S0('y-nefes') + 0.3, { gain: 0.2 });
    m.rain(api.cue('y-cta', 1), S1('y-cta') - api.cue('y-cta', 1), { gain: 0.07 });
    // 1 kanca: cam tıngı, mercek, pirinç düşer, suya değer; derin nefes
    const s1 = S0('y-hook');
    bell(s1 + 0.15, 'E7', 0.07, 0.2);
    bell(s1 + 0.17, 'B7', 0.025, -0.2);
    m.whoosh(s1 + 0.45, { dur: 0.6, from: 700, to: 2600, gain: 0.05 });
    pop(W(api, 'y-hook', 4) - 0.1, 'A5', 0.05);
    m.whoosh(W(api, 'y-hook', 6), { dur: 0.6, from: 2400, to: 500, gain: 0.035 });
    const land = W(api, 'y-hook', 9) + 0.12;
    m.pop(land, { freq: 260, gain: 0.14 });
    m.blip(land + 0.01, { freq: 1200, dur: 0.16, slide: 0.45, gain: 0.05 });
    m.click(W(api, 'y-hook', 9) + 0.4, { gain: 0.08, tone: 1400 });
    m.whoosh(W(api, 'y-hook', 10) - 0.05, { dur: 0.45, from: 600, to: 2200, gain: 0.04, q: 2 });
    bell(W(api, 'y-hook', 13), 'D6', 0.05);
    // 2 jeosmin ve toprak
    pop(W(api, 'y-ad', 5) - 0.1, 'F#5', 0.06);
    m.whoosh(W(api, 'y-ad', 6) - 0.15, { dur: 0.6, from: 700, to: 2400, gain: 0.045 });
    pop(W(api, 'y-ad', 9), 'B4', 0.04);
    // 3 damla
    const s3 = S0('y-damla');
    m.whoosh(s3 + 0.15, { dur: 0.9, from: 2600, to: 900, gain: 0.03 });
    m.pop(W(api, 'y-damla', 3), { freq: 320, gain: 0.12 });
    for (let i = 0; i < 7; i++) m.pop(W(api, 'y-damla', 6) + i * 0.05, { freq: 1400 + i * 120, gain: 0.03, pan: -0.3 + i * 0.1 });
    m.riser(W(api, 'y-damla', 8), 0.9, { gain: 0.03 });
    m.whoosh(W(api, 'y-damla', 11) - 0.1, { dur: 0.4, from: 600, to: 1800, gain: 0.035 });
    bell(W(api, 'y-damla', 16), 'A5', 0.05);
    // 4 davetiye
    m.whoosh(W(api, 'y-davet', 4), { dur: 0.75, from: 900, to: 2600, gain: 0.04, panFrom: -0.4, panTo: 0.3 });
    m.click(W(api, 'y-davet', 4) + 0.75, { gain: 0.1, tone: 2200 });
    pop(W(api, 'y-davet', 7) - 0.05, 'C#6', 0.05);
    m.blip(W(api, 'y-davet', 9) + 0.15, { freq: 400, dur: 0.35, slide: 2.6, gain: 0.05 });
    // 5 derin nefes
    m.whoosh(W(api, 'y-nefes', 4) - 0.1, { dur: 1.3, from: 300, to: 1100, gain: 0.05, q: 0.7 });
    bell(W(api, 'y-nefes', 8), 'E5', 0.04, 0.3);
    bell(W(api, 'y-nefes', 12), 'B5', 0.05, -0.2);
    bell(W(api, 'y-nefes', 12) + 0.15, 'E6', 0.035, 0.2);
    // 6 kapanış
    bell(api.cue('y-cta', 1) + 0.1, 'G7', 0.04, 0.3);
  }

  window.FILM = K.short({
    title: 'Yağmur kokusu · YUP Akademi',
    series: 'VÜCUDUN GİZLİ AYARLARI',
    share: true,
    gap: 0.12,
    breath: 0.2,
    wipe: 0.45,
    transition: LUP.lensWipe,
    extra: { 'y-hook': 0.35, 'y-ad': 0.35, 'y-damla': 0.4, 'y-davet': 0.4, 'y-nefes': 0.6, 'y-cta': 1.75 },
    lead: { 'y-hook': 0.1, 'y-ad': 0.2, 'y-damla': 0.2, 'y-davet': 0.2, 'y-nefes': 0.25, 'y-cta': 0.3 },
    titles: {
      'y-hook': 'Havuzda bir pirinç tanesi',
      'y-ad': 'Jeosmin ve toprak bakterileri',
      'y-damla': 'Damla ve kabarcıklar',
      'y-davet': 'Kollembollere davetiye',
      'y-nefes': 'Pencerede derin nefes',
      'y-cta': 'Arkadaşına gönder',
    },
    chords: {
      'y-hook': ['D3', 'A3', 'F#4', 'B4'],
      'y-ad': ['B2', 'F#3', 'D4', 'A4'],
      'y-damla': ['G2', 'D3', 'B3', 'F#4'],
      'y-davet': ['E3', 'B3', 'G#4', 'D5'],
      'y-nefes': ['C3', 'G3', 'E4', 'B4'],
      'y-cta': ['D3', 'A3', 'F#4', 'A4'],
    },
    draw,
    score,
  });
})();
