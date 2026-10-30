/*
 * YUP Akademi · Lup · Vücudun Gizli Ayarları kısa video (1080×1920) — Kendini gıdıklayamamak
 *
 * Anlatıcı Lup: ağzı sese uyar (dudak.js), sahnelere tepki verir; doruk anlarında ChatGPT pozları (poz_*) girer.
 * Arka planlar ChatGPT'de çizildi (oturma odası, beynin kontrol odası, laboratuvar; assets.js). Kopya notu,
 * ses düğmesinin dönmesi, his dalgası, robotun dokunuşu, gecikme saati ve dürtme çizgileri kodla canlanır.
 * Kurgu: ilk karede Mercek Açılışı ve başlık; olaylar sözcüğüne oturur (W: sözcük zamanı); 4. satır dönüm noktası
 * (gecikme → kahkaha), 5. satır gündelik hayata bağlar (kardeş kavgası). Geçişler mercek halkasıyla.
 * Sahneler: tüyle kendini gıdıklamak · beynin kopyası ve ses düğmesi · robot deneyi · gecikme · kardeşler · gönder.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, lerp, ease, progress, hash } = E;
  const K = window.YupKisa;
  const L = window.YupEl;
  const LUP = window.YupLup;
  const { P, ink, arrow, serif, mono, hand, headline, paper, tape, rubber, finish } = L;
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

  function pic(ctx, k, x, y, w, { ax = 0.5, ay = 0.5, rot = 0, a = 1, flip = false, sx = 1, sy = 1 } = {}) {
    const g = A[k];
    if (!g || a <= 0.002 || w <= 0.5) return;
    const h = (w * g.h) / g.w;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.scale((flip ? -1 : 1) * sx, sy);
    ctx.drawImage(IMG[k], -ax * w, -ay * h, w, h);
    ctx.restore();
  }
  function cover(ctx, k, { dim = 0, zoom = 1, zx = 540, zy = 960 } = {}) {
    const g = A[k];
    const s = Math.max(1080 / g.w, 1920 / g.h);
    ctx.save();
    ctx.translate(zx, zy);
    ctx.scale(zoom, zoom);
    ctx.translate(-zx, -zy);
    ctx.drawImage(IMG[k], 540 - (g.w * s) / 2, 960 - (g.h * s) / 2, g.w * s, g.h * s);
    ctx.restore();
    if (dim) {
      ctx.fillStyle = `rgba(14,10,8,${dim})`;
      ctx.fillRect(0, 0, 1080, 1920);
    }
  }

  // ---------------------------------------------------------------------------
  // Yardımcılar
  // ---------------------------------------------------------------------------
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
  function tag(ctx, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(246,239,225,0.9)';
    ctx.beginPath();
    ctx.roundRect(60, 160, 470, 96, 16);
    ctx.fill();
    K.appIcon(ctx, 104, 206, 62);
    mono(ctx, 'VÜCUDUN GİZLİ AYARLARI', 152, 200, { size: 22, color: P.ink, spacing: 3 });
    mono(ctx, 'YUP AKADEMİ · LUP', 152, 230, { size: 19, weight: 500, spacing: 3, color: P.ink2 });
    ctx.restore();
  }
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
  // Gıdıklanma çizgileri: bir noktanın çevresinde titreyen kısa yaylar
  function giggle(ctx, x, y, t, { a = 1, r = 60, col = P.ink } = {}) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = col;
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;
    const f = Math.floor(t * 12);
    for (let i = 0; i < 4; i++) {
      const th = -0.9 + i * 0.6 + (hash(i, f) - 0.5) * 0.3;
      const rr = r + hash(i, f + 1) * 14;
      ctx.beginPath();
      ctx.arc(x, y, rr, th - 0.18, th + 0.18);
      ctx.stroke();
    }
    ctx.restore();
  }
  // His dalgası: genliği k ile küçülen dalgalı çizgi
  function wave(ctx, x, y, w, k, t, { col = P.red, a = 1 } = {}) {
    if (a <= 0.01) return;
    const pts = [];
    for (let i = 0; i <= 50; i++) {
      const u = i / 50;
      pts.push([x + u * w, y + Math.sin(u * 22 - t * 9) * 46 * k * Math.sin(Math.PI * u)]);
    }
    ctx.save();
    ctx.globalAlpha *= a;
    ink(ctx, pts, { close: false, width: 8, seed: 77, t, color: col });
    ctx.restore();
  }
  // Ölçek çubuğu (kardeşler): dolu oranı k
  function meter(ctx, x, y, k, label, col, t, a = 1) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    card(ctx, x, y, 300, 130, { rot: 0 });
    ink(ctx, dense([[x - 120, y + 10], [x + 120, y + 10], [x + 120, y + 42], [x - 120, y + 42]], 12, true), { fill: '#fffaf0', width: 4, seed: 501 + x, t, off: [2, 2] });
    ink(ctx, dense([[x - 118, y + 12], [x - 118 + 236 * k, y + 12], [x - 118 + 236 * k, y + 40], [x - 118, y + 40]], 12, true), { fill: col, width: 0, seed: 502 + x, t, off: [2, 2] });
    hand(ctx, label, x - 120, y - 16, { size: 38, color: P.ink, rot: -0.02 });
    ctx.restore();
  }
  // Damga: koyu zeminde de okunsun diye bantlı kâğıt kartın üstüne basılır
  function stamp(ctx, str, x, y, t0, t, { color = P.red, size = 70, w = 380, h = 150, rot = -0.1 } = {}) {
    if (t < t0 - 0.1) return;
    const a = progress(t, t0 - 0.1, t0 + 0.05);
    card(ctx, x, y, w, h, { rot: rot * 0.4, a });
    tape(ctx, x, y - h / 2 + 2, 110, 0.04, a);
    rubber(ctx, str, x, y, t0, t, { color, size, rot });
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
  // Lup'un elindeki tüy (bileğe göre, birim R); w: sallanma
  const feather = (wig) => (c) => {
    const g = A.tuy;
    const w = 1.25;
    const h = (w * g.h) / g.w;
    c.rotate(-0.5 + wig);
    c.drawImage(IMG.tuy, -w * 0.12, -h * 0.95, w, h);
  };

  // ---------------------------------------------------------------------------
  // Sahneler
  // ---------------------------------------------------------------------------
  const draw = {};

  // 1 · Kanca: Lup tüyle kendi kenarını gıdıklıyor, hiçbir şey olmuyor
  draw['g-hook'] = function (ctx, t, api) {
    const id = 'g-hook';
    const s0 = api.S0(id);
    const before = W(api, id, 5); // "senden önce"
    const inner = (c) => {
      cover(c, 'oda');
      // Lup kanepede; tüy kenarını gıdıklıyor
      const wig = Math.sin(t * 16) * 0.22;
      lup(c, t, api, id, 560, 1300, 640, {
        face: { brow: 'supheli', open: 0.55, low: 0.12, mouth: 'mbp' },
        gx: 0.6,
        gy: 0.1,
        arms: { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.15, y: 0.15, el: 'yumruk', d: [-0.2, -1] } },
        hold: { r: feather(wig) },
      });
      giggle(c, 560 + 150, 1300 - 640 * 0.72, t, { a: 0.0 });
    };
    const p = LUP.intro(ctx, t, s0, inner, { cx: 540, cy: 900, r0: 380 });
    // sıfır göstergesi: "gıdık ölçer" boş
    const ga = progress(t, W(api, id, 1) + 0.2, W(api, id, 1) + 0.5);
    if (ga > 0) {
      card(ctx, 250, 1560, 360, 150, { rot: -0.04, a: ga });
      mono(ctx, 'GIDIK ÖLÇER', 250, 1530, { size: 24, align: 'center', color: P.ink, alpha: ga });
      serif(ctx, '0', 250, 1615, { size: 72, align: 'center', color: P.red, alpha: ga });
    }
    stamp(ctx, 'BEYİN ÖNDE', 790, 1630, before, t, { color: P.teal, size: 56, w: 420 });
    strip(ctx, 380, 2, 100);
    headline(ctx, [[{ s: 'Kendini' }], [{ s: 'gıdıklayamazsın.', mark: P.marker }]], 80, 380, { size: 100, lead: 1.0, prog: 1, markProg: progress(t, W(api, id, 1), W(api, id, 1) + 0.5) });
    tag(ctx, progress(t, s0 + 1.0, s0 + 1.3) * (p >= 1 ? 1 : 0));
    finish(ctx, t, { vig: 0.24 });
  };

  // 2 · Beynin kopyası ve ses düğmesi
  draw['g-kopya'] = function (ctx, t, api) {
    const id = 'g-kopya';
    const s0 = api.S0(id);
    const brainT = W(api, id, 3) - 0.1; // "beynin"
    const copyT = W(api, id, 5); // "kopya"
    const sayT = W(api, id, 7); // "Birazdan"
    const knowT = W(api, id, 10); // "Bildiği"
    const downT = W(api, id, 12); // "sesini"
    cover(ctx, 'beyinodasi');
    // beyin kartı
    const ba = api.pop(t, brainT, 0.45);
    if (ba > 0) {
      card(ctx, 400, 640, 470, 400, { rot: -0.04, s: ba });
      pic(ctx, 'beyin', 400, 620, 400 * ba, { rot: -0.04 });
      if (ba > 0.9) {
        mono(ctx, 'beyincik', 470, 830, { size: 26, color: P.teal });
        arrow(ctx, 520, 812, 520, 740, { bend: -0.3, seed: 31, t, width: 4, color: P.teal, prog: progress(t, brainT + 0.3, brainT + 0.7) });
      }
      tape(ctx, 400, 448, 120, 0.05, ba);
    }
    // kopya notu: beyinden fırlar, kâğıda yazılır, sonra düğmeye uçar
    const na = progress(t, copyT - 0.1, copyT + 0.25);
    if (na > 0) {
      const fly = progress(t, knowT, knowT + 0.6, ease.inOut);
      const x = lerp(lerp(470, 760, ease.out(na)), 560, fly);
      const y = lerp(lerp(640, 560, ease.out(na)), 1430, fly);
      const s = lerp(1, 0.35, fly);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(0.06 - fly * 0.5);
      ctx.scale(s, s);
      card(ctx, 0, 0, 400, 210, { rot: 0 });
      mono(ctx, 'KOPYA', -170, -62, { size: 24, color: P.red });
      const wr = progress(t, sayT - 0.05, sayT + 0.9);
      if (wr > 0) {
        const str = 'birazdan şuraya';
        const str2 = 'dokunacağım';
        hand(ctx, str.slice(0, Math.ceil(str.length * clamp(wr * 1.6))), -170, -2, { size: 44, color: P.ink, rot: -0.02 });
        if (wr > 0.6) hand(ctx, str2.slice(0, Math.ceil(str2.length * clamp((wr - 0.6) * 2.5))), -170, 56, { size: 44, color: P.ink, rot: -0.02 });
      }
      ctx.restore();
      if (fly === 0) arrow(ctx, 560, 640, 640, 560, { bend: 0.3, seed: 33, t, width: 4, color: P.red, prog: na });
    }
    // ses düğmesi: masadaki düğmenin üstünde döner; his dalgası küçülür
    const turn = progress(t, downT - 0.1, downT + 0.7, ease.inOut);
    pic(ctx, 'dugme', 544, 1442, 200, { rot: lerp(0, -1.9, turn) });
    const wa = progress(t, knowT - 0.2, knowT + 0.2);
    if (wa > 0) {
      card(ctx, 540, 1060, 560, 190, { rot: 0.02, a: wa });
      mono(ctx, 'HİS', 290, 1000, { size: 24, color: P.ink, alpha: wa });
      wave(ctx, 290, 1080, 500, lerp(1, 0.12, turn), t, { a: wa });
    }
    if (turn > 0.5) hand(ctx, 'sesi kısıldı', 620, 1270, { size: 46, color: P.red, alpha: progress(t, downT + 0.3, downT + 0.6), rot: -0.03 });
    lup(ctx, t, api, id, 900, 1338, 400, {
      face: t > downT ? 'supheli' : t > copyT ? 'merak' : 'gulum',
      arms: t > copyT && t < knowT ? 'gosterSol' : 'anlat',
      gx: -0.8,
      gy: -0.4,
    });
    strip(ctx, 380, 1, 100);
    headline(ctx, [[{ s: 'Beynin ' }, { s: 'önceden', mark: P.marker }, { s: ' bilir.' }]], 80, 380, { size: 88, prog: progress(t, s0 + 0.05, s0 + 0.5), markProg: progress(t, W(api, id, 2), W(api, id, 2) + 0.4) });
    tag(ctx);
    finish(ctx, t, { vig: 0.24 });
  };

  // Laboratuvar düzeni (3 ve 4. sahne ortak): robot solda, Lup sağda, kumanda Lup'un sağ elinde
  const BENCH = 1185;
  function lab(ctx, t, api, id, { lag = 0, laugh = 0, bored = false, poke = 1 } = {}) {
    cover(ctx, 'lab');
    // kumanda kolu: Lup'un sağında
    pic(ctx, 'kumanda', 935, BENCH, 200, { ax: 0.5, ay: 1 });
    // robot: tüy ucu Lup'un sol avucuna dokunur; hareket elin hareketinden lag kadar geride
    const tr = t - lag;
    const dx = Math.sin(tr * 9) * 14 * poke;
    const dy = Math.cos(tr * 7) * 8 * poke;
    pic(ctx, 'robot', 300 + dx * 0.4, BENCH, 420, { ax: 0.4, ay: 1, rot: dy * 0.002 });
    ctx.save();
    ctx.globalAlpha *= 0.9;
    ctx.fillStyle = '#fffaf0';
    ctx.beginPath();
    ctx.arc(505 + dx, 893 + dy, 22, 0, TAU);
    ctx.fill();
    ctx.restore();
    // Lup
    const R = 470 / (LUP.foot() + LUP.TOP);
    const shake = laugh > 0 ? Math.sin(t * 30) * 0.06 * laugh : 0;
    if (laugh < 0.5) {
      lup(ctx, t, api, id, 760, BENCH, 470, {
        face: bored ? { brow: 'supheli', open: 0.55, low: 0.12, mouth: 'mbp' } : 'odak',
        gx: -0.7,
        gy: 0.1,
        tilt: shake,
        arms: {
          l: { x: (505 - 760) / R - 0.05, y: (893 - (BENCH - LUP.foot() * R)) / R + 0.25, el: 'acik', d: [-0.5, -1] },
          r: { x: 1.62 + Math.sin(t * 9) * 0.08, y: 1.05 + Math.cos(t * 7) * 0.05, el: 'yumruk', d: [0.15, -1] },
        },
      });
    } else {
      pic(ctx, 'poz_gulme', 760 + Math.sin(t * 34) * 8, BENCH + 8, 330, { ax: 0.5, ay: 1, rot: Math.sin(t * 22) * 0.06 });
      giggle(ctx, 760, BENCH - 360, t, { a: laugh, r: 200 });
    }
  }

  // 3 · Robot deneyi: kendi elinle oynatınca gıdıklanmazsın
  draw['g-robot'] = function (ctx, t, api) {
    const id = 'g-robot';
    const s0 = api.S0(id);
    const noT = W(api, id, 12); // "Gıdıklanmadılar"
    lab(ctx, t, api, id, { bored: t > noT - 0.1, poke: progress(t, W(api, id, 6) - 0.2, W(api, id, 6) + 0.3) });
    const la = progress(t, W(api, id, 7), W(api, id, 7) + 0.3);
    if (la > 0) {
      card(ctx, 790, 1420, 400, 120, { rot: 0.03, a: la });
      hand(ctx, 'kendi elinle oynatıyorsun', 610, 1435, { size: 36, color: P.ink, alpha: la, rot: 0.02 });
      arrow(ctx, 930, 1360, 940, 1230, { bend: 0.2, seed: 41, t, width: 4, prog: la });
    }
    stamp(ctx, 'HİÇ', 300, 1500, noT, t, { color: P.red, size: 90, w: 300, h: 170 });
    mono(ctx, 'Blakemore, Frith ve Wolpert · 1999', 540, 1760, { size: 22, align: 'center', color: '#f6efe1' });
    strip(ctx, 380, 2, 100);
    headline(ctx, [[{ s: 'Robotla deney:' }], [{ s: 'kumanda sende.', mark: P.markerTeal }]], 80, 380, { size: 92, lead: 1.02, prog: progress(t, s0 + 0.05, s0 + 0.5), markProg: progress(t, W(api, id, 6), W(api, id, 6) + 0.4) });
    tag(ctx);
    finish(ctx, t, { vig: 0.24 });
  };

  // 4 · Gecikme: robot bir an geç kalınca beyin şaşırır, kahkaha
  draw['g-gecikme'] = function (ctx, t, api) {
    const id = 'g-gecikme';
    const s0 = api.S0(id);
    const shortT = W(api, id, 2); // "çok kısa"
    const surp = W(api, id, 7); // "beyin şaşırdı"
    const again = W(api, id, 9); // "Yeniden"
    const lagK = progress(t, shortT, shortT + 0.6);
    lab(ctx, t, api, id, { lag: 0.35 * lagK, laugh: progress(t, again - 0.15, again + 0.1), poke: 1 });
    // kronometre
    const sa = api.pop(t, shortT - 0.1, 0.45);
    if (sa > 0) {
      pic(ctx, 'saat', 300, 640, 230 * sa, { rot: -0.08 });
      if (sa > 0.9) {
        const th = -Math.PI / 2 + progress(t, shortT, shortT + 1.2) * 1.2;
        ctx.save();
        ctx.strokeStyle = P.red;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(300, 660);
        ctx.lineTo(300 + Math.cos(th) * 70, 660 + Math.sin(th) * 70);
        ctx.stroke();
        ctx.restore();
        card(ctx, 640, 640, 420, 150, { rot: 0.03 });
        serif(ctx, '+ çok kısa', 470, 630, { size: 56, color: P.ink });
        hand(ctx, 'gecikme (saniyenin kesri)', 470, 685, { size: 34, color: P.red, rot: 0.01 });
      }
    }
    // beyin şaşırır: küçük beyin, soru işaretleri
    const qa = progress(t, surp - 0.1, surp + 0.2) * (1 - progress(t, again + 0.6, again + 1.0));
    if (qa > 0) {
      pic(ctx, 'beyin', 840, 520, 200, { a: qa, rot: Math.sin(t * 18) * 0.05 });
      for (let i = 0; i < 3; i++) serif(ctx, '?', 760 + i * 70, 410 - (i % 2) * 30 + Math.sin(t * 8 + i) * 8, { size: 64, color: P.red, alpha: qa });
    }
    mono(ctx, 'Blakemore, Frith ve Wolpert · 1999', 540, 1760, { size: 22, align: 'center', color: '#f6efe1' });
    strip(ctx, 380, 1, 100);
    headline(ctx, [[{ s: 'Ama bir ' }, { s: 'gecikme', mark: P.markerRed }, { s: ' ekle…' }]], 80, 380, { size: 88, prog: progress(t, s0 + 0.05, s0 + 0.5), markProg: progress(t, shortT, shortT + 0.4) });
    tag(ctx);
    finish(ctx, t, { vig: 0.24 });
  };

  // 5 · Kardeşler: herkes kendi vuruşunu hafif hisseder
  draw['g-kardes'] = function (ctx, t, api) {
    const id = 'g-kardes';
    const s0 = api.S0(id);
    const pokeA = W(api, id, 1); // "ben"
    const pokeB = W(api, id, 3); // "vurdum"
    const allT = W(api, id, 8); // "Herkes"
    const lightT = W(api, id, 12); // "hafif"
    // Yakın plan: aynı odanın duvarı (raf, çerçeveler) ve halısı; kanepe yalnız kardeşlerin kendi kanepesi
    const z = lerp(1.05, 1, progress(t, s0, s0 + 2, ease.out));
    ctx.save();
    ctx.translate(540, 1100);
    ctx.scale(z, z);
    ctx.translate(-540, -1100);
    ctx.drawImage(IMG.oda, 0, 0, 532, 755, -20, -20, 1120, 1590);
    ctx.fillStyle = '#5e4129';
    ctx.fillRect(-20, 1552, 1120, 24);
    // halı: odanın masa ayakları olmayan halı parçası, aynalanarak döşenir (dikiş görünmesin)
    const tw = 336 * 1.6;
    const th = 171 * 1.6;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        ctx.save();
        ctx.translate(-20 + col * tw + (col % 2 ? tw : 0), 1574 + row * th + (row % 2 ? th : 0));
        ctx.scale(col % 2 ? -1 : 1, row % 2 ? -1 : 1);
        ctx.drawImage(IMG.oda, 320, 1365, 336, 171, 0, 0, tw, th);
        ctx.restore();
      }
    }
    ctx.restore();
    const bump = (t0) => Math.exp(-(((t - t0) / 0.09) ** 2));
    const bA = bump(pokeA) + bump(pokeA + 1.6);
    const bB = bump(pokeB) + bump(pokeB + 1.6);
    pic(ctx, 'kardesler', 540, 1655, 1000, { ax: 0.5, ay: 1, sx: 1 + 0.02 * (bA + bB), sy: 1 - 0.02 * (bA + bB) });
    // dürtme kıvılcımları
    const spark = (x, y, k) => {
      if (k < 0.05) return;
      ctx.save();
      ctx.strokeStyle = P.red;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.globalAlpha *= k;
      for (let i = 0; i < 5; i++) {
        const th = (i / 5) * TAU + 0.3;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(th) * 30, y + Math.sin(th) * 30);
        ctx.lineTo(x + Math.cos(th) * 60, y + Math.sin(th) * 60);
        ctx.stroke();
      }
      ctx.restore();
    };
    spark(610, 1095, bA);
    spark(495, 1090, bB);
    // ölçekler: kendi vuruşum hafif, onunki sert (iki kardeş için aynı)
    const ma = progress(t, allT - 0.1, allT + 0.3);
    const fill = progress(t, allT, lightT + 0.3, ease.out);
    meter(ctx, 250, 540, 0.25 * fill, 'kendi vuruşum', '#8fc1a9', t, ma);
    meter(ctx, 830, 540, 0.9 * fill, 'onunki', P.red, t, ma);
    if (ma > 0) {
      hand(ctx, 'hafif', 330, 660, { size: 44, color: P.teal, alpha: progress(t, lightT, lightT + 0.3) });
      hand(ctx, 'sert!', 900, 660, { size: 44, color: P.red, alpha: progress(t, lightT, lightT + 0.3) });
      card(ctx, 470, 1770, 640, 60, { rot: 0, a: ma });
      mono(ctx, 'Science · 2003: her tur biraz daha sert', 470, 1778, { size: 22, align: 'center', color: P.ink });
    }
    strip(ctx, 380, 1, 100);
    headline(ctx, [[{ s: '"Ben ' }, { s: 'yavaş', mark: P.marker }, { s: ' vurdum!"' }]], 80, 380, { size: 92, prog: progress(t, s0 + 0.05, s0 + 0.5), markProg: progress(t, W(api, id, 2), W(api, id, 2) + 0.4) });
    lup(ctx, t, api, id, 965, 1880, 330, { face: t > allT ? 'gulum' : 'mutlu', arms: 'anlat', gx: -0.8, gy: -0.6 });
    tag(ctx);
    finish(ctx, t, { vig: 0.24 });
  };

  // 6 · Arkadaşına gönder ve "Lup'la bak"
  draw['g-cta'] = function (ctx, t, api) {
    const id = 'g-cta';
    const { S0, end, fadeIn, pop } = api;
    const s0 = S0(id);
    const c1 = api.cue(id, 1);
    paper(ctx, t, { stains: [[120, 1760, 110, 91]] });
    headline(ctx, [[{ s: 'Gıdıklanmaya' }], [{ s: 'dayanamayan' }], [{ s: 'arkadaşına' }], [{ s: 'gönder.', mark: P.marker }]], 80, 330, { size: 82, lead: 1.02, prog: progress(t, s0 + 0.05, s0 + 0.7), markProg: progress(t, s0 + 0.6, s0 + 1.0) });
    // fotoğraf: oturma odası; "bir tek kendi eli" sözünde içine tüy düşer
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
      ctx.drawImage(IMG.oda, 80, 560, 760, 870, -140, -190, 280, 320);
      ctx.restore();
      hand(ctx, 'gıdık savaşı', 0, 180, { size: 36, align: 'center', color: P.ink2, rot: -0.02 });
      tape(ctx, 0, -217, 140, -0.05);
      ctx.restore();
    }
    // Lup tüyü fırlatır, sonra abone ol düğmesine dokunur
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
      hold: throwK < 0.6 ? { r: feather(Math.sin(t * 10) * 0.1) } : undefined,
    });
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
        const [qx, qy] = path[Math.max(0, n - 3)];
        plane(ctx, px, py, 1, Math.atan2(py - qy, px - qx), t);
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
    const swish = (t, g = 0.03) => m.whoosh(t, { dur: 0.22, from: 2500, to: 5000, gain: g, q: 2 });
    // 1 kanca: cam tıngı, mercek; tüy hışırtıları; damga
    const s1 = S0('g-hook');
    bell(s1 + 0.15, 'E7', 0.07, 0.2);
    bell(s1 + 0.17, 'B7', 0.025, -0.2);
    m.whoosh(s1 + 0.45, { dur: 0.6, from: 700, to: 2600, gain: 0.05 });
    for (let i = 0; i < 6; i++) swish(s1 + 1.2 + i * 0.45, 0.025);
    m.blip(W(api, 'g-hook', 1) + 0.3, { freq: 300, dur: 0.4, slide: 0.6, gain: 0.04 });
    m.click(W(api, 'g-hook', 5), { gain: 0.2, tone: 1100 });
    // 2 kopya
    pop(W(api, 'g-kopya', 3) - 0.1, 'D5', 0.06);
    m.whoosh(W(api, 'g-kopya', 5), { dur: 0.35, from: 900, to: 3000, gain: 0.04 });
    for (let i = 0; i < 8; i++) m.tick(W(api, 'g-kopya', 7) + i * 0.1, { gain: 0.025, tone: 4000 });
    m.whoosh(W(api, 'g-kopya', 10), { dur: 0.6, from: 2400, to: 700, gain: 0.04 });
    for (let i = 0; i < 7; i++) m.click(W(api, 'g-kopya', 12) - 0.1 + i * 0.1, { gain: 0.06, tone: 2400 - i * 150 });
    m.blip(W(api, 'g-kopya', 12), { freq: 700, dur: 0.7, slide: 0.35, gain: 0.04 });
    // 3 robot: servo vızıltısı, "hiç" damgası
    m.buzz(W(api, 'g-robot', 6), { gain: 0.04, dur: 0.6 });
    m.buzz(W(api, 'g-robot', 9), { gain: 0.04, dur: 0.6 });
    m.click(W(api, 'g-robot', 12), { gain: 0.22, tone: 1000 });
    m.blip(W(api, 'g-robot', 12) + 0.05, { freq: 220, dur: 0.35, slide: 0.8, gain: 0.04 });
    // 4 gecikme: saat tikleri, şaşkınlık, kahkaha zilleri
    pop(W(api, 'g-gecikme', 2) - 0.1, 'A5', 0.06);
    for (let i = 0; i < 10; i++) m.tick(W(api, 'g-gecikme', 2) + i * 0.12, { gain: 0.035, tone: 3200 });
    m.wobble(W(api, 'g-gecikme', 7), 0.6, { gain: 0.08, freq: 260 });
    ['C6', 'E6', 'G6', 'E6', 'C7'].forEach((n, i) => bell(W(api, 'g-gecikme', 9) - 0.1 + i * 0.09, n, 0.04, -0.4 + i * 0.2));
    // 5 kardeşler: dürtmeler
    const k = (t, f) => m.pop(t, { freq: f, gain: 0.08 });
    k(W(api, 'g-kardes', 1), 420);
    k(W(api, 'g-kardes', 3), 380);
    k(W(api, 'g-kardes', 1) + 1.6, 460);
    k(W(api, 'g-kardes', 3) + 1.6, 520);
    m.riser(W(api, 'g-kardes', 8), 0.8, { gain: 0.03 });
    // 6 kapanış
    bell(api.cue('g-cta', 1) + 0.1, 'G7', 0.04, 0.3);
  }

  window.FILM = K.short({
    title: 'Kendini gıdıklayamamak · YUP Akademi',
    series: 'VÜCUDUN GİZLİ AYARLARI',
    share: true,
    gap: 0.12,
    breath: 0.2,
    wipe: 0.45,
    transition: LUP.lensWipe,
    cut: ['g-gecikme'],
    extra: { 'g-hook': 0.35, 'g-kopya': 0.35, 'g-robot': 0.35, 'g-gecikme': 0.45, 'g-kardes': 0.4, 'g-cta': 1.75 },
    lead: { 'g-hook': 0.1, 'g-kopya': 0.2, 'g-robot': 0.2, 'g-gecikme': 0.15, 'g-kardes': 0.2, 'g-cta': 0.3 },
    titles: {
      'g-hook': 'Kendini gıdıklayamazsın',
      'g-kopya': 'Beynin kopyası',
      'g-robot': 'Robot deneyi',
      'g-gecikme': 'Gecikme',
      'g-kardes': 'Ben yavaş vurdum',
      'g-cta': 'Arkadaşına gönder',
    },
    chords: {
      'g-hook': ['D3', 'A3', 'F#4', 'B4'],
      'g-kopya': ['B2', 'F#3', 'D4', 'A4'],
      'g-robot': ['G2', 'D3', 'B3', 'F#4'],
      'g-gecikme': ['A2', 'E3', 'C#4', 'G#4'],
      'g-kardes': ['E3', 'B3', 'G#4', 'D5'],
      'g-cta': ['D3', 'A3', 'F#4', 'A4'],
    },
    draw,
    score,
  });
})();
