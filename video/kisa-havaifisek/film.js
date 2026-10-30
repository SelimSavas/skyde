/*
 * YUP Akademi · Lup · Yakın Plan kısa video (1080×1920) — Havai fişeğin renkleri
 *
 * Lup'un ilk filmi. Anlatıcı Lup'tur: köşede durur, ağzı sese uyar (dudak.js sözcük zamanları), sahnelere tepki verir.
 * Görsel dil: gece sahneleri ChatGPT'de çizilen balkondan şehir görseli (assets.js) üstünde kodla patlayan havai
 * fişekler; açıklama sahneleri el yapımı defter (yup-marka/el.js). Geçişler mercek halkasıyla (YupLup.lensWipe).
 * Kurgu: ilk karede Mercek Açılışı ve başlık; her öbekte görüntü değişir; olaylar sözcüğüne oturur (W: sözcük zamanı).
 * Sahneler: kanca (kırmızı patlama) · stronsiyum ve enerji basamakları · alev deneyi (Sr Ba Na Cu) · maytap (kor) ·
 * en zoru mavi (bakır klorür dağılır, usta işi) · arkadaşına gönder ve "Lup'la bak".
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, lerp, ease, progress, hash } = E;
  const K = window.YupKisa;
  const L = window.YupEl;
  const LUP = window.YupLup;
  const { P, ink, arrow, ring, serif, mono, hand, headline, paper, sticky, tape, rubber, finish } = L;
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

  // Görseli (x, y) noktası parçanın (ax, ay) oranına gelecek biçimde, w genişliğinde çizer
  function pic(ctx, k, x, y, w, { ax = 0.5, ay = 0.5, rot = 0, a = 1 } = {}) {
    const g = A[k];
    if (!g || a <= 0.002) return;
    const h = (w * g.h) / g.w;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.drawImage(IMG[k], -ax * w, -ay * h, w, h);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Yardımcılar
  // ---------------------------------------------------------------------------
  // Satırın i. sözcüğünün başladığı film zamanı
  const W = (api, id, i) => api.cue(id, 0) + (window.DUDAK?.[id]?.[i]?.[0] ?? i * 0.4);
  // Lup'u konuşturarak çizer (satırın sesi sürerken ağzı sese uyar)
  function lup(ctx, t, api, id, x, y, h, st = {}) {
    LUP.draw(ctx, x, y, h, { talk: LUP.say(api, id, t), ...st }, t);
  }
  const RED = '255,64,48';
  const GREEN = '96,232,110';
  const YELLOW = '255,206,64';
  const BLUE = '72,124,255';
  const GOLD = '255,186,92';

  function night(ctx, dim = 0) {
    const g = A.gece;
    const s = Math.max(1080 / g.w, 1920 / g.h);
    ctx.drawImage(IMG.gece, 540 - (g.w * s) / 2, 1920 - g.h * s, g.w * s, g.h * s);
    if (dim) {
      ctx.fillStyle = `rgba(6,10,24,${dim})`;
      ctx.fillRect(0, 0, 1080, 1920);
    }
  }

  // Gece etiketi (krem) ya da defter etiketi (mürekkep)
  function tag(ctx, dark = false, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    K.appIcon(ctx, 104, 206, 62);
    mono(ctx, 'YAKIN PLAN · LUP', 152, 200, { size: 24, color: dark ? '#f2eadc' : P.ink, spacing: 4 });
    mono(ctx, 'YUP AKADEMİ', 152, 230, { size: 19, weight: 500, spacing: 3, color: dark ? 'rgba(242,234,220,0.7)' : P.ink2 });
    ctx.restore();
  }

  // Havai fişek: (x0, y0)'dan fırlar, t0'da (x, y)'de patlar; col 'r,g,b'
  function firework(ctx, t, f) {
    const { x, y, t0, col, R = 320, n = 90, seed = 1, launch = 0.5, life = 1.9 } = f;
    const x0 = f.x0 ?? x + (hash(seed, 1) - 0.5) * 120;
    const y0 = f.y0 ?? 1960;
    const lt = t - t0;
    if (lt < -launch || lt > life + 0.3) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    if (lt < 0) {
      const u = 1 + lt / launch;
      for (let i = 0; i < 12; i++) {
        const k = ease.out(clamp(u - i * 0.022));
        const px = lerp(x0, x, k) + (hash(i, seed + Math.floor(t * 30)) - 0.5) * 6;
        const py = lerp(y0, y, k);
        ctx.fillStyle = `rgba(${GOLD},${0.85 * (1 - i / 12)})`;
        ctx.beginPath();
        ctx.arc(px, py, 4.2 - i * 0.28, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,248,230,0.95)';
      ctx.beginPath();
      ctx.arc(lerp(x0, x, ease.out(u)), lerp(y0, y, ease.out(u)), 4.5, 0, TAU);
      ctx.fill();
    } else {
      const fl = Math.exp(-lt * 7);
      const g = ctx.createRadialGradient(x, y, 0, x, y, R * 1.1);
      g.addColorStop(0, `rgba(${col},${0.5 * fl})`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - R * 1.2, y - R * 1.2, R * 2.4, R * 2.4);
      for (const [ring2, nn, sc] of [[0, n, 1], [1, Math.round(n * 0.5), 0.55]]) {
        for (let i = 0; i < nn; i++) {
          const th = (i / nn) * TAU + hash(i, seed + ring2 * 9) * 0.14 + ring2 * 0.2;
          const sp = R * sc * (0.74 + 0.26 * hash(i, seed + 7 + ring2));
          const pos = (tau) => {
            const d = sp * (1 - Math.exp(-3.1 * tau));
            return [x + Math.cos(th) * d, y + Math.sin(th) * d + 80 * tau * tau];
          };
          const fade = clamp(1 - lt / (life * (0.7 + 0.3 * hash(i, seed + 3 + ring2))));
          if (fade <= 0) continue;
          const [x1, y1] = pos(Math.max(0, lt - 0.17));
          const [x2, y2] = pos(lt);
          ctx.lineCap = 'round';
          ctx.strokeStyle = `rgba(${col},${0.35 * fade})`;
          ctx.lineWidth = 16 * (0.45 + 0.55 * fade);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.strokeStyle = `rgba(${col},${0.95 * fade})`;
          ctx.lineWidth = 6.5 * (0.45 + 0.55 * fade);
          ctx.stroke();
          if (hash(i, seed + Math.floor(t * 18)) > 0.3) {
            ctx.fillStyle = `rgba(255,236,214,${0.7 * fade})`;
            ctx.beginPath();
            ctx.arc(x2, y2, 3.2, 0, TAU);
            ctx.fill();
          }
        }
      }
    }
    ctx.restore();
  }
  // Patlamanın sahneyi aydınlatması
  function flashes(ctx, t, list) {
    for (const f of list) {
      const lt = t - f.t0;
      if (lt < 0 || lt > 0.8) continue;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(${f.col},${0.13 * Math.exp(-lt * 5)})`;
      ctx.fillRect(0, 0, 1080, 1920);
      ctx.restore();
    }
  }

  // Alev: (x, y) tabanı, h boyu; col 'r,g,b'; bunsen: içte mavi koni
  // Alev çizgisi: iki kübik eğriden örneklenmiş noktalar (mürekkep kenarı için)
  function flamePts(x, y, ww, hh, sway) {
    const cb = (p0, p1, p2, p3, u) => (1 - u) ** 3 * p0 + 3 * (1 - u) ** 2 * u * p1 + 3 * (1 - u) * u * u * p2 + u ** 3 * p3;
    const pts = [];
    for (let i = 0; i <= 14; i++) {
      const u = i / 14;
      pts.push([cb(x - ww / 2, x - ww * 0.62, x - ww * 0.15 + sway, x + sway * 1.6, u), cb(y, y - hh * 0.45, y - hh * 0.75, y - hh, u)]);
    }
    for (let i = 1; i <= 14; i++) {
      const u = i / 14;
      pts.push([cb(x + sway * 1.6, x + ww * 0.15 + sway, x + ww * 0.62, x + ww / 2, u), cb(y - hh, y - hh * 0.75, y - hh * 0.45, y, u)]);
    }
    return pts;
  }
  // Kâğıt üstünde alev: düz renkler, mürekkep kenarı, çarpma karışımlı ışık
  function paperFlame(ctx, x, y, h, t, col, { w = null, a = 1, seed = 0, bunsen = true } = {}) {
    if (a <= 0.002 || h <= 2) return;
    w = w ?? h * 0.36;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    const g = ctx.createRadialGradient(x, y - h * 0.45, 0, x, y - h * 0.45, h * 0.95);
    g.addColorStop(0, `rgba(${col},0.32)`);
    g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - h, y - h * 1.5, h * 2, h * 2);
    ctx.restore();
    const [r, gg, b] = col.split(',').map(Number);
    const tint = (k) => `rgb(${Math.round(lerp(r, 255, k))},${Math.round(lerp(gg, 250, k))},${Math.round(lerp(b, 225, k))})`;
    [[1, 0, true], [0.7, 0.4, false], [0.42, 0.8, false]].forEach(([s, k, edge], li) => {
      const hh = h * s * (1 + 0.07 * Math.sin(t * 23 + seed + li));
      const ww = w * s;
      const sway = (Math.sin(t * 9 + seed + li) * 0.16 + Math.sin(t * 17 + seed) * 0.06) * ww;
      ink(ctx, flamePts(x, y, ww, hh, sway), { fill: tint(k), width: edge ? 4.5 : 0, seed: 150 + li + seed, t, off: [3, 3], amp: 1 });
    });
    if (bunsen) {
      ctx.fillStyle = 'rgba(70,110,230,0.85)';
      ctx.beginPath();
      ctx.moveTo(x - w * 0.2, y);
      ctx.quadraticCurveTo(x, y - h * 0.42, x + w * 0.2, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function flame(ctx, x, y, h, t, col, { w = null, a = 1, seed = 0, bunsen = true } = {}) {
    if (a <= 0.002 || h <= 2) return;
    w = w ?? h * 0.34;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y - h * 0.45, 0, x, y - h * 0.45, h * 1.0);
    g.addColorStop(0, `rgba(${col},0.32)`);
    g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - h, y - h * 1.5, h * 2, h * 2);
    const layers = [[1, 0.42, col], [0.74, 0.55, col], [0.46, 0.75, '255,246,226']];
    layers.forEach(([s, al, c], li) => {
      const hh = h * s * (1 + 0.07 * Math.sin(t * 23 + seed + li));
      const ww = w * s;
      const sway = (Math.sin(t * 9 + seed + li) * 0.16 + Math.sin(t * 17 + seed) * 0.06) * ww;
      ctx.fillStyle = `rgba(${c},${al})`;
      ctx.beginPath();
      ctx.moveTo(x - ww / 2, y);
      ctx.bezierCurveTo(x - ww * 0.62, y - hh * 0.45, x - ww * 0.15 + sway, y - hh * 0.75, x + sway * 1.6, y - hh);
      ctx.bezierCurveTo(x + ww * 0.15 + sway, y - hh * 0.75, x + ww * 0.62, y - hh * 0.45, x + ww / 2, y);
      ctx.closePath();
      ctx.fill();
    });
    if (bunsen) {
      ctx.fillStyle = 'rgba(90,140,255,0.55)';
      ctx.beginPath();
      ctx.moveTo(x - w * 0.22, y);
      ctx.quadraticCurveTo(x, y - h * 0.5, x + w * 0.22, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Maytap kıvılcımları: dallanan altın çizgiler (akkor demir tozu)
  function sparks(ctx, x, y, t, k = 1) {
    if (k <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, 260 * k);
    g.addColorStop(0, `rgba(255,214,140,${0.55 * k})`);
    g.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 300, y - 300, 600, 600);
    const fr = Math.floor(t * 24);
    for (let i = 0; i < 46 * k; i++) {
      const th = hash(i, fr) * TAU;
      const len = (40 + hash(i, fr + 1) * 150) * k;
      const x2 = x + Math.cos(th) * len;
      const y2 = y + Math.sin(th) * len;
      ctx.strokeStyle = `rgba(255,${170 + ((hash(i, fr + 2) * 50) | 0)},70,0.6)`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(th) * 8, y + Math.sin(th) * 8);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      if (hash(i, fr + 3) > 0.55) {
        // dal
        const th2 = th + (hash(i, fr + 4) - 0.5) * 1.6;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 + Math.cos(th2) * len * 0.35, y2 + Math.sin(th2) * len * 0.35);
        ctx.stroke();
      }
    }
    ctx.fillStyle = 'rgba(255,255,240,0.95)';
    ctx.beginPath();
    ctx.arc(x, y, 9 * k, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // Periyodik tablo kartı (el çizimi)
  function tile(ctx, x, y, s, { num, sym, name, wash, a = 1, rot = -0.04, t = 0, seed = 60 } = {}) {
    if (a <= 0.002 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    const q = [[-120, -120], [120, -120], [120, 120], [-120, 120]];
    const pts = [];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 8; j++) pts.push([lerp(q[i][0], q[(i + 1) % 4][0], j / 8), lerp(q[i][1], q[(i + 1) % 4][1], j / 8)]);
    ink(ctx, pts, { fill: wash, seed, t, width: 6, off: [7, 6] });
    mono(ctx, String(num), -98, -78, { size: 30, color: P.ink });
    serif(ctx, sym, 0, 40, { size: 130, align: 'center' });
    mono(ctx, name, 0, 96, { size: 22, align: 'center', color: P.ink, spacing: 2 });
    ctx.restore();
  }

  // El çizimi top (atom, molekül)
  function ball(ctx, x, y, r, fill, t, { seed = 70, label = null, glow = 0, glowCol = BLUE } = {}) {
    if (glow > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 2.6);
      g.addColorStop(0, `rgba(${glowCol},${0.55 * glow})`);
      g.addColorStop(1, `rgba(${glowCol},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
      ctx.restore();
    }
    const pts = [];
    for (let i = 0; i < 28; i++) pts.push([x + Math.cos((i / 28) * TAU) * r, y + Math.sin((i / 28) * TAU) * r]);
    ink(ctx, pts, { fill, seed, t, width: 5, off: [5, 4] });
    if (label) serif(ctx, label, x, y + r * 0.3, { size: r * 0.85, align: 'center', color: P.ink });
  }

  function plane(ctx, x, y, s, rot, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ink(ctx, [[-50, 0], [50, -26], [14, 30]], { fill: '#fffaf0', seed: 270, t, width: 5, off: [3, 3] });
    ink(ctx, [[50, -26], [-6, 14], [0, 40]], { fill: '#e9e0cf', seed: 271, t, width: 5, off: [2, 2] });
    ctx.restore();
  }

  // Elde tutulan eşyalar (bileğe göre, birim mercek yarıçapı R)
  const holdSparkler = (lit) => (ctx) => {
    const g = A.maytap;
    const w = 0.14;
    const h = (w * g.h) / g.w;
    ctx.drawImage(IMG.maytap, -w / 2, -h * 0.82, w, h);
    if (lit) lit(ctx, 0, -h * 0.8);
  };
  const goggles = (ctx) => {
    const g = A.gozluk;
    const w = 1.5;
    const h = (w * g.h) / g.w;
    ctx.save();
    ctx.translate(0.04, -1.2);
    ctx.rotate(-0.05);
    ctx.drawImage(IMG.gozluk, -w / 2, -h / 2, w, h);
    ctx.restore();
  };

  // ---------------------------------------------------------------------------
  // Sahneler
  // ---------------------------------------------------------------------------
  const draw = {};

  // 1 · Kanca: Mercek Açılışı; merceğin içinde gece, kırmızı patlamalar
  draw['h-hook'] = function (ctx, t, api) {
    const { S0 } = api;
    const s0 = S0('h-hook');
    const id = 'h-hook';
    const w3 = W(api, id, 3);
    const FW = [
      { x: 420, y: 760, t0: s0 - 0.22, col: RED, R: 340, seed: 3, launch: 0.42 },
      { x: 720, y: 560, t0: w3 - 0.05, col: RED, R: 380, seed: 5, n: 76 },
      { x: 300, y: 900, t0: W(api, id, 4) + 0.25, col: RED, R: 260, seed: 8 },
      { x: 760, y: 980, t0: W(api, id, 6) + 0.1, col: '255,90,70', R: 240, seed: 11 },
    ];
    const inner = (c) => {
      night(c);
      for (const f of FW) firework(c, t, f);
      flashes(c, t, FW);
    };
    const p = LUP.intro(ctx, t, s0, inner);
    // Lup: mercek geçince köşeden zıplar; büyük patlamada irkilir
    const hp = LUP.hop(t, s0 + 1.15);
    const flinch = t > w3 && t < w3 + 0.55;
    const gaze = t < W(api, id, 4) ? [-0.35, -0.85] : [-0.1, -0.1];
    lup(ctx, t, api, id, 830, 1850, 560, {
      ...hp,
      face: flinch ? 'irkil' : t < W(api, id, 4) ? 'hayret' : 'gulum',
      arms: flinch ? 'kulak' : t < W(api, id, 4) ? 'kenet' : 'anlat',
      gx: gaze[0],
      gy: gaze[1],
      talk: flinch ? 'dalga' : LUP.say(api, id, t),
    });
    // "metalin": yapışkan not
    const nt = W(api, id, 6);
    const na = api.pop(t, nt, 0.35);
    if (na > 0) {
      ctx.save();
      ctx.translate(640, 760);
      ctx.scale(na, na);
      sticky(ctx, -120, -70, 240, 150, { rot: 0.06 });
      hand(ctx, 'bir metal!', -95, 10, { size: 50, color: P.red, rot: 0.04 });
      ctx.restore();
      arrow(ctx, 600, 690, 700, 600, { color: '#f2eadc', prog: progress(t, nt + 0.15, nt + 0.45), seed: 21, t, width: 5 });
    }
    // Başlık ilk karede hazır (merceğin dışında, en üstte)
    const hl = [[{ s: 'Gökteki ', c: '#f2eadc' }, { s: 'kırmızı,', c: '#f2eadc', mark: P.markerRed }]];
    if (t >= W(api, id, 4) - 0.1) hl.push([{ s: 'bir ', c: '#f2eadc' }, { s: 'metalin', c: '#f2eadc', mark: P.marker }, { s: ' ışığı.', c: '#f2eadc' }]);
    if (p < 1) {
      ctx.save();
      ctx.globalAlpha *= 1 - p;
      ctx.fillStyle = 'rgba(16,10,6,0.62)';
      ctx.beginPath();
      ctx.roundRect(40, 290, 1000, 130 + (hl.length - 1) * 103, 26);
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 18;
    headline(ctx, hl, 70, 380, { size: 98, lead: 1.05, prog: 1, markProg: progress(t, w3 - 0.2, w3 + 0.3) });
    ctx.restore();
    tag(ctx, true, progress(t, s0 + 1.0, s0 + 1.3));
    finish(ctx, t, { vig: 0.35, grain: 0.05 });
  };

  // 2 · Stronsiyum ve enerji basamakları
  draw['h-atom'] = function (ctx, t, api) {
    const id = 'h-atom';
    const s0 = api.S0(id);
    paper(ctx, t, { stains: [[950, 1650, 110, 31]] });
    tag(ctx);
    headline(ctx, [[{ s: 'Adı:' }], [{ s: 'stronsiyum.', mark: P.markerRed }]], 80, 370, { size: 104, lead: 0.98, prog: progress(t, s0 + 0.05, s0 + 0.6), markProg: progress(t, W(api, id, 1), W(api, id, 1) + 0.5) });
    tile(ctx, 840, 650, api.pop(t, s0 + 0.35, 0.45), { num: 38, sym: 'Sr', name: 'STRONSİYUM', wash: '#f2b9ad', t, rot: 0.05 });
    if (t > s0 + 0.55) tape(ctx, 840, 526, 120, 0.04);
    // basamaklar
    const sA = progress(t, W(api, id, 2) - 0.6, W(api, id, 2) + 0.2);
    const stairs = [[[140, 1420], [470, 1420]], [[470, 1420], [470, 1170], [760, 1170]], [[760, 1170], [760, 930], [980, 930]]];
    if (sA > 0) {
      ctx.save();
      ctx.globalAlpha *= sA;
      stairs.forEach((s, i) => {
        const dense = [];
        for (let k = 0; k < s.length - 1; k++) for (let j = 0; j < 10; j++) dense.push([lerp(s[k][0], s[k + 1][0], j / 10), lerp(s[k][1], s[k + 1][1], j / 10)]);
        dense.push(s[s.length - 1]);
        ink(ctx, dense, { close: false, width: 7, seed: 80 + i, t, color: i === 2 ? P.ink2 : P.ink });
      });
      arrow(ctx, 110, 1460, 110, 900, { bend: 0, prog: sA, seed: 85, t, width: 4, color: P.ink2 });
      mono(ctx, 'ENERJİ', 128, 905, { size: 22 });
      hand(ctx, '1. basamak', 200, 1480, { size: 40, color: P.ink2 });
      hand(ctx, '2. basamak', 530, 1235, { size: 40, color: P.ink2 });
      ctx.restore();
    }
    // ateş: basamağın altında
    const fireA = progress(t, W(api, id, 2) - 0.1, W(api, id, 2) + 0.3);
    paperFlame(ctx, 300, 1560, 130 * fireA, t, '255,140,50', { bunsen: false, seed: 2, a: fireA });
    if (fireA > 0.5) hand(ctx, 'ısı', 370, 1555, { size: 44, color: P.red, alpha: fireA });
    // elektron: sıçrar (sıçrar), düşer (düşerken) ve kırmızı ışık saçar
    const jT = W(api, id, 9);
    const fT = W(api, id, 11);
    const up = progress(t, jT - 0.05, jT + 0.4, ease.inOut);
    const dn = progress(t, fT, fT + 0.35, ease.in);
    const k = up * (1 - dn);
    const ex = lerp(310, 610, k);
    const ey = lerp(1388, 1138, k) - Math.sin(Math.PI * (dn > 0 ? dn : up)) * 120;
    const eA = progress(t, W(api, id, 5) - 0.1, W(api, id, 5) + 0.2);
    if (eA > 0) {
      const excited = up > 0.9 && dn === 0;
      ball(ctx, ex, ey, 30 * api.pop(t, W(api, id, 5) - 0.1, 0.35), excited ? '#ffd27a' : P.teal, t, { seed: 90, glow: excited ? 0.8 : 0, glowCol: '255,180,60' });
      mono(ctx, 'elektron', ex + 40, ey - 30, { size: 22, alpha: eA * (1 - progress(t, jT - 0.2, jT)) });
    }
    // foton: dalgalı kırmızı ok
    const ph = progress(t, fT + 0.3, fT + 1.2, ease.out);
    if (ph > 0) {
      const pts = [];
      const n = Math.max(2, Math.floor(60 * ph));
      for (let i = 0; i <= n; i++) {
        const u = i / 60;
        pts.push([lerp(350, 960, u), lerp(1330, 1250, u) + Math.sin(u * 26 - t * 10) * 22]);
      }
      ink(ctx, pts, { close: false, width: 8, seed: 95, t, color: P.red });
      if (ph >= 1) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        const g = ctx.createRadialGradient(965, 1250, 0, 965, 1250, 150);
        g.addColorStop(0, `rgba(${RED},0.6)`);
        g.addColorStop(1, `rgba(${RED},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(800, 1090, 330, 330);
        ctx.restore();
      }
    }
    const kt = W(api, id, 14);
    hand(ctx, 'kırmızı ışık', 610, 1440, { size: 52, color: P.red, alpha: progress(t, kt - 0.1, kt + 0.25) });
    mono(ctx, 'dalga boyu ≈ 640 nm', 612, 1488, { size: 22, alpha: progress(t, kt + 0.2, kt + 0.5) });
    // Lup: alt köşe
    const jumped = t > jT && t < fT;
    lup(ctx, t, api, id, 900, 1880, 430, {
      face: jumped ? 'hayret' : t > fT + 0.3 ? 'gulum' : 'merak',
      arms: t < W(api, id, 5) ? 'anlat' : t < fT + 0.3 ? 'gosterSol' : 'bas',
      gx: -0.9,
      gy: t < W(api, id, 5) ? -0.4 : -0.6,
    });
    finish(ctx, t);
  };

  // 3 · Alev deneyi: her metalin rengi
  draw['h-renk'] = function (ctx, t, api) {
    const id = 'h-renk';
    const s0 = api.S0(id);
    paper(ctx, t, { stains: [[120, 360, 90, 41]] });
    tag(ctx);
    headline(ctx, [[{ s: 'Her metalin' }], [{ s: 'kendi rengi.', mark: P.marker }]], 80, 370, { size: 96, lead: 1.0, prog: progress(t, s0 + 0.05, s0 + 0.6), markProg: progress(t, W(api, id, 4), W(api, id, 4) + 0.4) });
    // renk sırası: Sr kırmızı · Ba yeşil · Na sarı · Cu mavi
    const steps = [
      [W(api, id, 4), RED, 'Sr', 'kırmızı', 0],
      [W(api, id, 6), GREEN, 'Ba', 'yeşil', 1],
      [W(api, id, 8), YELLOW, 'Na', 'sarı', 2],
      [W(api, id, 10), BLUE, 'Cu', 'mavi', 3],
    ];
    let cur = -1;
    steps.forEach((s, i) => {
      if (t >= s[0] - 0.12) cur = i;
    });
    // kenar notu: basamak farkı büyüdükçe ışık maviye kayar
    const nA = progress(t, W(api, id, 1) - 0.1, W(api, id, 1) + 0.3) * (1 - progress(t, W(api, id, 4) - 0.2, W(api, id, 4) + 0.1));
    if (nA > 0) {
      ctx.save();
      ctx.globalAlpha *= nA;
      [[RED, 70, P.red], [GREEN, 115, '#2e8b46'], [BLUE, 165, P.blue]].forEach(([c, gap, ic], i) => {
        const x = 610 + i * 140;
        ink(ctx, [[x - 40, 760], [x + 40, 760]], { close: false, width: 6, seed: 101 + i, t });
        ink(ctx, [[x - 40, 760 - gap], [x + 40, 760 - gap]], { close: false, width: 6, seed: 104 + i, t });
        arrow(ctx, x, 760 - gap + 8, x, 752, { bend: 0, seed: 107 + i, t, width: 5, color: ic, head: 16 });
      });
      hand(ctx, 'basamak büyüdükçe', 590, 590, { size: 40, color: P.ink2 });
      hand(ctx, 'ışık maviye kayar', 590, 636, { size: 40, color: P.ink2 });
      ctx.restore();
    }
    // bek ve alev
    const bx = 430;
    const by = 1640;
    const bw = 250;
    const bh = (bw * A.bek.h) / A.bek.w;
    pic(ctx, 'bek', bx, by, bw, { ax: 0.5, ay: 1 });
    const tipX = bx + bw * 0.03;
    const tipY = by - bh + 6;
    const col = cur >= 0 ? steps[cur][1] : '120,160,255';
    const flare = cur >= 0 ? Math.exp(-(t - steps[cur][0] + 0.12) * 4) : 0;
    paperFlame(ctx, tipX, tipY, (cur >= 0 ? 300 : 190) * (1 + 0.25 * flare), t, col, { seed: 3, bunsen: true });
    // kavanozlar ve etiketleri
    steps.forEach((s, i) => {
      const x = 130 + i * 175;
      const lift = cur === i ? -40 * ease.out(clamp((t - s[0] + 0.12) / 0.3)) : 0;
      pic(ctx, 'kavanoz' + (i + 1), x, 1850 + lift, 120, { ax: 0.5, ay: 1 });
      mono(ctx, s[2], x, 1900, { size: 28, align: 'center', color: cur === i ? `rgb(${s[1]})` : P.ink });
    });
    // renk etiketi (damga)
    if (cur >= 0) {
      const s = steps[cur];
      rubber(ctx, `${s[2]} · ${s[3]}`, 730, 660, s[0], t, { color: cur === 2 ? '#c88a00' : cur === 1 ? '#2e8b46' : cur === 3 ? P.blue : P.red, size: 54, rot: -0.1 });
    }
    // Lup: gözlüklü, tel halkayı aleve tutar (halka her renkte bir çıkıp girer)
    const dip = cur >= 0 ? 1 - Math.exp(-(((t - steps[cur][0] + 0.12) / 0.12) ** 2)) * 0.9 : 0.4;
    const R = 600 / (LUP.foot() + LUP.TOP);
    const lx = 830;
    const ly = 1660;
    const cy = ly - LUP.foot() * R;
    const tx = (tipX - lx) / R;
    const ty = (tipY - 230 * dip - cy) / R;
    const hx = -2.05;
    const hy = 0.55 + (1 - dip) * 0.4;
    lup(ctx, t, api, id, lx, ly, 600, {
      face: cur >= 0 && t - steps[cur][0] < 0.6 ? 'hayret' : 'odak',
      gx: -0.95,
      gy: -0.1,
      top: goggles,
      arms: { l: { x: hx, y: hy, el: 'yumruk', d: [-0.25, -1] }, r: { x: 1.4, y: 1.62, el: 'acik', d: [0.3, 1] } },
      hold: {
        l: (c) => {
          const dx = tx - hx;
          const dy = ty - hy;
          const len = Math.hypot(dx, dy);
          const g = A.tel;
          const h = len / 0.9;
          const w = (h * g.w) / g.h;
          c.rotate(Math.atan2(dy, dx) + Math.PI / 2);
          c.drawImage(IMG.tel, -w / 2, -h * 0.93, w, h);
        },
      },
    });
    finish(ctx, t);
  };

  // 4 · Maytap: kor gibi parlayan demir tozu
  draw['h-maytap'] = function (ctx, t, api) {
    const id = 'h-maytap';
    const s0 = api.S0(id);
    night(ctx, 0.45);
    const lit = progress(t, s0 + 0.15, s0 + 0.45);
    const lx = 420;
    const ly = 1800;
    const h = 860;
    const R = h / (LUP.foot() + LUP.TOP);
    // sıcak ışık
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(lx + 1.65 * R, ly - (LUP.foot() - 0.2) * R, 0, lx + 1.65 * R, ly - (LUP.foot() - 0.2) * R, 700);
    g.addColorStop(0, `rgba(255,170,70,${0.22 * lit})`);
    g.addColorStop(1, 'rgba(255,170,70,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.restore();
    const odd = t > W(api, id, 3) && t < W(api, id, 7);
    lup(ctx, t, api, id, lx, ly, h, {
      face: odd ? 'supheli' : 'gulum',
      gx: odd ? 0.15 : 0.6,
      gy: odd ? 0 : -0.7,
      arms: { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.65, y: 0.3, el: 'yumruk', d: [0.1, -1] } },
      hold: { r: holdSparkler((c, x, y) => {
        c.save();
        c.translate(x, y);
        c.scale(1 / R, 1 / R);
        sparks(c, 0, 0, t, lit);
        c.restore();
      }) },
    });
    headline(ctx, [[{ s: 'Altın kıvılcım:', c: '#f2eadc' }], [{ s: 'kor gibi ', c: '#f2eadc' }, { s: 'demir.', c: '#f2eadc', mark: P.marker }]], 70, 380, { size: 92, lead: 1.05, prog: progress(t, s0 + 0.05, s0 + 0.5) + (t > W(api, id, 7) ? 1 : 0) * 0, markProg: progress(t, W(api, id, 10), W(api, id, 10) + 0.4) });
    // büyüteç: akkor demir tanesi
    const ia = api.pop(t, W(api, id, 7) - 0.1, 0.45);
    if (ia > 0) {
      const cx = 830;
      const cy = 650;
      const r = 165 * ia;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.clip();
      ctx.fillStyle = '#1a0d08';
      ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      const glow = 0.85 + 0.15 * Math.sin(t * 20);
      const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.75);
      gg.addColorStop(0, `rgba(255,248,220,${glow})`);
      gg.addColorStop(0.35, `rgba(255,190,80,${glow})`);
      gg.addColorStop(0.7, 'rgba(210,80,20,0.9)');
      gg.addColorStop(1, 'rgba(60,20,8,0)');
      ctx.fillStyle = gg;
      ctx.beginPath();
      for (let i = 0; i < 20; i++) {
        const th = (i / 20) * TAU;
        const rr = r * 0.62 * (0.85 + 0.15 * hash(i, 5));
        ctx.lineTo(cx + Math.cos(th) * rr, cy + Math.sin(th) * rr);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(90,30,10,0.6)';
      ctx.lineWidth = 4;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + (hash(i, 8) - 0.5) * r, cy + (hash(i, 9) - 0.5) * r);
        ctx.lineTo(cx + (hash(i, 10) - 0.5) * r * 0.8, cy + (hash(i, 11) - 0.5) * r * 0.8);
        ctx.stroke();
      }
      ctx.restore();
      mono(ctx, 'Fe', cx - r * 0.6, cy - r * 0.42, { size: 34, color: '#f2eadc', alpha: ia });
      mono(ctx, 'demir tozu', cx, cy + r * 0.82, { size: 20, align: 'center', color: '#f2eadc', alpha: ia });
      LUP.ring(ctx, cx, cy, r);
    }
    hand(ctx, 'rengini atom değil,', 690, 1460, { size: 46, color: '#ffd28a', alpha: progress(t, W(api, id, 9), W(api, id, 9) + 0.3) });
    hand(ctx, 'sıcaklık veriyor', 690, 1512, { size: 46, color: '#ffd28a', alpha: progress(t, W(api, id, 9) + 0.25, W(api, id, 9) + 0.55) });
    tag(ctx, true);
    finish(ctx, t, { vig: 0.32, grain: 0.05 });
  };

  // 5 · En zoru mavi: bakır klorür fazla ısıda dağılır → gökte mavi = usta işi
  draw['h-mavi'] = function (ctx, t, api) {
    const id = 'h-mavi';
    const s0 = api.S0(id);
    const swap = W(api, id, 12) - 0.15;
    const part = (c) => {
      paper(c, t, { stains: [[980, 360, 80, 51]] });
      tag(c);
      headline(c, [[{ s: 'En zoru:' }], [{ s: 'mavi.', mark: P.markerBlue }]], 80, 370, { size: 112, lead: 1.0, prog: progress(t, s0 + 0.05, s0 + 0.5), markProg: progress(t, W(api, id, 2), W(api, id, 2) + 0.35) });
      // termometre ve eşik
      const heat = progress(t, W(api, id, 8) - 0.1, W(api, id, 11) + 0.1, ease.inOut);
      const thx = 930;
      const thTop = 760;
      const thH = 760;
      pic(c, 'termometre', thx, thTop, (thH * A.termometre.w) / A.termometre.h, { ax: 0.5, ay: 0 });
      const tube = (y0, y1, col) => {
        c.fillStyle = col;
        c.fillRect(thx - 6, y0, 12, y1 - y0);
      };
      tube(thTop + thH * 0.06, thTop + thH * 0.86, '#eef3f2');
      const lvl = lerp(thTop + thH * 0.62, thTop + thH * 0.16, heat);
      tube(lvl, thTop + thH * 0.88, '#d2452f');
      const thr = thTop + thH * 0.26;
      c.save();
      c.setLineDash([10, 8]);
      c.strokeStyle = P.ink2;
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(thx - 160, thr);
      c.lineTo(thx - 20, thr);
      c.stroke();
      c.restore();
      mono(c, '≈ 1200 °C', thx - 290, thr - 14, { size: 24, color: P.ink, alpha: progress(t, W(api, id, 8), W(api, id, 8) + 0.3) });
      // alev (molekülün altında): ısındıkça büyür, beyazlaşır
      const fa = progress(t, W(api, id, 3) - 0.2, W(api, id, 3) + 0.2);
      const hot = heat;
      paperFlame(c, 500, 1560, (170 + 150 * hot) * fa, t, `255,${Math.round(lerp(140, 230, hot))},${Math.round(lerp(50, 170, hot))}`, { bunsen: false, seed: 7, a: fa });
      // molekül: Cu–Cl, mavi ışık; eşik geçilince dağılır
      const brk = progress(t, W(api, id, 11) - 0.05, W(api, id, 11) + 0.45, ease.out);
      const ma = api.pop(t, W(api, id, 3) - 0.1, 0.45);
      if (ma > 0) {
        const shake = hot * (1 - brk) * 6 * Math.sin(t * 70);
        const glow = progress(t, W(api, id, 4), W(api, id, 4) + 0.3) * (1 - brk);
        const cx = 500 + shake;
        const cy = 1150;
        const sep = brk * 220;
        if (brk < 0.3) ink(c, [[cx - 70, cy], [cx + 70, cy]], { close: false, width: 10, seed: 120, t });
        ball(c, cx - 80 - sep, cy - sep * 0.3, 86 * ma, '#d9905a', t, { seed: 121, label: 'Cu', glow: glow * 1.2 });
        ball(c, cx + 85 + sep, cy + sep * 0.2, 64 * ma, '#a8d08d', t, { seed: 122, label: 'Cl' });
        hand(c, 'bakır klorür', cx - 150, cy - 140, { size: 44, color: P.blue, alpha: glow });
        if (brk > 0.2) {
          for (let i = 0; i < 6; i++) {
            const th = -0.6 + i * 0.25;
            ink(c, [[cx + Math.cos(th) * 60, cy + Math.sin(th) * 60], [cx + Math.cos(th) * (90 + 50 * brk), cy + Math.sin(th) * (90 + 50 * brk)]], { close: false, width: 5, seed: 130 + i, t, color: P.red });
          }
          hand(c, 'mavi gitti!', cx - 120, cy + 190, { size: 50, color: P.red, alpha: brk });
        }
      }
      lup(c, t, api, id, 190, 1880, 470, {
        face: brk > 0.1 && brk < 0.9 ? 'irkil' : t > W(api, id, 8) ? 'endise' : 'merak',
        arms: brk > 0.1 && brk < 0.9 ? 'kulak' : t > W(api, id, 8) ? 'cene' : 'anlat',
        gx: 0.8,
        gy: -0.5,
      });
      finish(c, t);
    };
    const sky = (c) => {
      night(c, 0.1);
      const FW = [
        { x: 380, y: 720, t0: W(api, id, 14) - 0.05, col: BLUE, R: 360, seed: 21, n: 72 },
        { x: 760, y: 520, t0: W(api, id, 15) + 0.35, col: '120,150,255', R: 300, seed: 23 },
        { x: 640, y: 980, t0: W(api, id, 18) + 0.1, col: BLUE, R: 280, seed: 27 },
      ];
      for (const f of FW) firework(c, t, f);
      flashes(c, t, FW);
      const ok = t > W(api, id, 18);
      lup(c, t, api, id, 860, 1850, 560, {
        face: ok ? 'mutlu' : 'hayret',
        arms: ok ? 'bas' : 'kenet',
        gx: -0.4,
        gy: -0.9,
      });
      headline(c, [[{ s: 'Gökte mavi', c: '#f2eadc', mark: P.markerBlue }], [{ s: 'görürsen…', c: '#f2eadc' }]], 70, 380, { size: 92, lead: 1.05, prog: progress(t, swap + 0.2, swap + 0.6) });
      rubber(c, 'USTA İŞİ', 330, 1300, W(api, id, 18), t, { color: '#6f9bff', size: 70, rot: -0.12 });
      tag(c, true);
      finish(c, t, { vig: 0.35, grain: 0.05 });
    };
    const p = progress(t, swap, swap + 0.55);
    if (p <= 0) part(ctx);
    else if (p >= 1) sky(ctx);
    else LUP.lensWipe(ctx, p, () => part(ctx), () => sky(ctx));
  };

  // 6 · Arkadaşına gönder ve "Lup'la bak"
  draw['h-cta'] = function (ctx, t, api) {
    const id = 'h-cta';
    const { S0, end, fadeIn, pop } = api;
    const s0 = S0(id);
    const c1 = api.cue(id, 1);
    paper(ctx, t, { stains: [[120, 1760, 110, 61]] });
    headline(ctx, [[{ s: 'Havai fişek' }], [{ s: 'izleyecek' }], [{ s: 'arkadaşına' }], [{ s: 'gönder.', mark: P.marker }]], 80, 330, { size: 86, lead: 1.02, prog: progress(t, s0 + 0.05, s0 + 0.7), markProg: progress(t, s0 + 0.6, s0 + 1.0) });
    // fotoğraf: dört renkli gökyüzü; "hangi metal" sözünde etiketler
    const pa = pop(t, s0 + 0.15, 0.5);
    if (pa > 0) {
      ctx.save();
      ctx.translate(780, 560);
      ctx.rotate(0.07);
      ctx.scale(pa, pa);
      ctx.shadowColor = 'rgba(60,40,20,0.28)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = '#fffdf7';
      ctx.fillRect(-175, -215, 350, 430);
      ctx.shadowColor = 'transparent';
      ctx.save();
      ctx.beginPath();
      ctx.rect(-150, -190, 300, 320);
      ctx.clip();
      ctx.translate(-150, -190);
      ctx.scale(300 / 1080, 320 / 1100);
      ctx.translate(0, -650);
      night(ctx, 0.05);
      const pt = s0 + 0.6;
      [[260, 900, RED, 1], [780, 820, GREEN, 2], [330, 1300, YELLOW, 3], [800, 1260, BLUE, 4]].forEach(([x, y, col, k]) => firework(ctx, Math.min(t, pt + 0.5), { x, y, t0: pt, col, R: 220, seed: 40 + k, life: 9 }));
      ctx.restore();
      const la = progress(t, c1, c1 + 0.3);
      [[-80, -95, 'Sr', P.red], [70, -115, 'Ba', '#2e8b46'], [-60, 45, 'Na', '#c88a00'], [80, 40, 'Cu', P.blue]].forEach(([x, y, s, c], i) => {
        const a = progress(t, c1 + i * 0.18, c1 + i * 0.18 + 0.25);
        if (a > 0) {
          ctx.fillStyle = `rgba(255,250,240,${0.92 * a})`;
          ctx.fillRect(x - 34, y - 26, 68, 44);
          mono(ctx, s, x, y + 8, { size: 28, align: 'center', color: c, alpha: a * la + (1 - la) * a });
        }
      });
      hand(ctx, 'kutlama gecesi', 0, 180, { size: 38, align: 'center', color: P.ink2, rot: -0.02 });
      tape(ctx, 0, -217, 140, -0.05);
      ctx.restore();
    }
    // Lup kâğıt uçağı atar (s0 + 0,9), sonra abone ol düğmesine dokunur
    const tap = end(id) + 0.35;
    const throwK = progress(t, s0 + 0.7, s0 + 1.0, ease.inOut);
    const back = progress(t, s0 + 1.3, s0 + 1.7, ease.inOut);
    const reach = progress(t, tap - 0.7, tap - 0.08, ease.inOut);
    const throwPose = { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.2, y: -1.25, el: 'acik', d: [0.2, -1] } };
    const wind = { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.9, y: 0.6, el: 'acik', d: [1, 0.3] } };
    const tapPose = { l: { x: -2.15, y: 0.95, el: 'isaret', d: [-1, 0.2] }, r: { x: 1.4, y: 1.62, el: 'acik', d: [0.3, 1] } };
    let arms = LUP.mix(wind, throwPose, throwK);
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
    // uçak: Lup'un elinden fotoğrafa
    const fly = progress(t, s0 + 1.0, s0 + 1.55, ease.inOut);
    if (fly > 0) {
      const path = [];
      for (let i = 0; i <= 30; i++) {
        const u = i / 30;
        path.push([lerp(930, 760, u) + Math.sin(Math.PI * u) * 160, lerp(1180, 640, u) - Math.sin(Math.PI * u) * 80]);
      }
      const n = Math.max(2, Math.floor(path.length * fly));
      for (let i = 0; i < n - 1; i += 2) ink(ctx, [path[i], path[i + 1]], { close: false, width: 4, color: 'rgba(42,28,20,0.5)', seed: 280 + i, t });
      if (fly < 1) {
        const [px, py] = path[n - 1];
        const [qx, qy] = path[Math.max(0, n - 3)];
        plane(ctx, px, py, 1, Math.atan2(py - qy, px - qx), t);
      }
    }
    if (t > s0 + 1.55) hand(ctx, 'gönderildi ✓', 640, 870, { size: 46, color: P.teal, alpha: fadeIn(t, s0 + 1.55, 0.25), rot: -0.03 });
    hand(ctx, 'hangi renk hangi metal, o da bilsin', 80, 760, { size: 40, color: P.coffee, alpha: fadeIn(t, c1, 0.3), rot: -0.02 });
    // marka: logo, sözcük işareti, "Lup'la bak.", abone ol
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
      const pts = [];
      const q = [[-w / 2, -50], [w / 2, -50], [w / 2, 50], [-w / 2, 50]];
      for (let i = 0; i < 4; i++) for (let j = 0; j < 10; j++) pts.push([lerp(q[i][0], q[(i + 1) % 4][0], j / 10), lerp(q[i][1], q[(i + 1) % 4][1], j / 10)]);
      ink(ctx, pts, { fill: done ? '#fffaf0' : P.teal, seed: 290, t, width: 6, off: [7, 6] });
      serif(ctx, done ? 'Abone olundu ✓' : 'Abone ol', 0, 16, { size: 46, align: 'center', color: done ? P.teal : '#fffaf0', weight: 800 });
      ctx.restore();
      if (done) {
        for (let i = 0; i < 10; i++) {
          const q2 = clamp((t - tap) / 0.9);
          if (q2 >= 1) continue;
          const th = (i / 10) * TAU;
          const d = 230 + q2 * 120;
          hand(ctx, '+', 390 + Math.cos(th) * d, 1560 + Math.sin(th) * d * 0.4, { size: 40 * (1 - q2) + 10, color: [P.amber, P.teal, P.red][i % 3], align: 'center', rot: 0 });
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
    const { S0 } = api;
    const bell = (t, n, g = 0.06, pan = 0) => m.bell(t, { freq: hz(n), gain: g, decay: 2.2, pan });
    const pop = (t, n, g = 0.05, pan = 0) => m.pop(t, { freq: hz(n), gain: g, pan });
    const fw = (t0, pan = 0, g = 1, launch = 0.5) => {
      if (t0 - launch > 0.02) m.whoosh(t0 - launch, { dur: launch, from: 500, to: 2600, gain: 0.035 * g, panFrom: pan * 0.5, panTo: pan, q: 3 });
      m.boom(t0, { gain: 0.28 * g, freq: 52 });
      m.click(t0, { gain: 0.12 * g, tone: 900 });
      m.crackle(t0 + 0.2, 0.9, { gain: 0.07 * g, pan, density: 70, roar: 0.15 });
    };
    // 1 kanca: cam tıngı, mercek vuuşu, kırmızı patlamalar
    const s1 = S0('h-hook');
    bell(s1 + 0.15, 'E7', 0.07, 0.2);
    bell(s1 + 0.17, 'B7', 0.025, -0.2);
    m.whoosh(s1 + 0.45, { dur: 0.6, from: 700, to: 2600, gain: 0.05 });
    fw(s1 + 0.03, -0.3, 0.9, 0.42);
    fw(W(api, 'h-hook', 3) - 0.05, 0.25, 1.1);
    fw(W(api, 'h-hook', 4) + 0.25, -0.4, 0.7);
    fw(W(api, 'h-hook', 6) + 0.1, 0.4, 0.6);
    pop(W(api, 'h-hook', 6), 'A5', 0.05);
    // 2 atom
    pop(W(api, 'h-atom', 1), 'D5', 0.07);
    m.click(W(api, 'h-atom', 1) + 0.05, { gain: 0.15, tone: 1400 });
    m.fireIgnite(W(api, 'h-atom', 2) - 0.1, { gain: 0.12 });
    pop(W(api, 'h-atom', 5) - 0.1, 'A4', 0.05);
    m.blip(W(api, 'h-atom', 9) - 0.05, { freq: 330, dur: 0.4, slide: 2.2, gain: 0.05 });
    m.blip(W(api, 'h-atom', 11), { freq: 700, dur: 0.35, slide: 0.45, gain: 0.05 });
    bell(W(api, 'h-atom', 11) + 0.35, 'A5', 0.07);
    m.whoosh(W(api, 'h-atom', 11) + 0.3, { dur: 0.8, from: 1200, to: 3000, gain: 0.03, panFrom: -0.4, panTo: 0.5 });
    // 3 renkler
    m.fireIgnite(S0('h-renk') + 0.2, { gain: 0.1 });
    ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => {
      const t = W(api, 'h-renk', 4 + i * 2) - 0.12;
      m.whoosh(t, { dur: 0.35, from: 300, to: 1500, gain: 0.04 });
      pop(t + 0.05, n, 0.06, -0.3 + i * 0.2);
      m.click(t + 0.08, { gain: 0.1, tone: 1200 });
    });
    // 4 maytap
    const s4 = S0('h-maytap');
    m.fireIgnite(s4 + 0.15, { gain: 0.14 });
    m.crackle(s4 + 0.2, 5.4, { gain: 0.06, density: 90, roar: 0.08 });
    pop(W(api, 'h-maytap', 7) - 0.1, 'E5', 0.05);
    // 5 mavi
    pop(W(api, 'h-mavi', 3) - 0.1, 'G4', 0.05);
    m.riser(W(api, 'h-mavi', 8) - 0.1, W(api, 'h-mavi', 11) - W(api, 'h-mavi', 8) + 0.1, { gain: 0.05 });
    m.glitch(W(api, 'h-mavi', 11), 0.25, { gain: 0.08 });
    m.boom(W(api, 'h-mavi', 11) + 0.02, { gain: 0.12, freq: 90 });
    m.whoosh(W(api, 'h-mavi', 12) - 0.15, { dur: 0.6, from: 700, to: 2600, gain: 0.045 });
    fw(W(api, 'h-mavi', 14) - 0.05, -0.2, 1);
    fw(W(api, 'h-mavi', 15) + 0.35, 0.3, 0.7);
    fw(W(api, 'h-mavi', 18) + 0.1, 0.1, 0.6);
    m.click(W(api, 'h-mavi', 18), { gain: 0.22, tone: 1100 });
    bell(W(api, 'h-mavi', 18) + 0.1, 'B5', 0.06);
    // 6 kapanış: cam tıngı (iki nota yukarı)
    bell(api.cue('h-cta', 1) + 0.1, 'G7', 0.04, 0.3);
  }

  window.FILM = K.short({
    title: 'Havai fişeğin renkleri · YUP Akademi',
    series: 'YAKIN PLAN · LUP',
    share: true,
    gap: 0.12,
    breath: 0.2,
    wipe: 0.45,
    transition: LUP.lensWipe,
    extra: { 'h-hook': 0.35, 'h-atom': 0.45, 'h-renk': 0.45, 'h-maytap': 0.4, 'h-mavi': 0.6, 'h-cta': 1.75 },
    lead: { 'h-hook': 0.1, 'h-atom': 0.25, 'h-renk': 0.2, 'h-maytap': 0.2, 'h-mavi': 0.2, 'h-cta': 0.3 },
    titles: {
      'h-hook': 'Gökteki kırmızı',
      'h-atom': 'Stronsiyum ve basamaklar',
      'h-renk': 'Her metalin rengi',
      'h-maytap': 'Maytap: kor gibi demir',
      'h-mavi': 'En zoru mavi',
      'h-cta': 'Arkadaşına gönder',
    },
    chords: {
      'h-hook': ['D3', 'A3', 'F#4', 'B4'],
      'h-atom': ['B2', 'F#3', 'D4', 'A4'],
      'h-renk': ['G2', 'D3', 'B3', 'F#4'],
      'h-maytap': ['E3', 'B3', 'G#4', 'D5'],
      'h-mavi': ['A2', 'E3', 'C#4', 'G#4'],
      'h-cta': ['D3', 'A3', 'F#4', 'A4'],
    },
    draw,
    score,
  });
})();
