/*
 * YUP Akademi · "Bu sensin" kısa video (1080×1920) — Kahvesini içmeden konuşulamayan arkadaşın abartmıyor
 *
 * Görsel dil: el yapımı defter (video/yup-marka/el.js). Kâğıt dokusu, kahve lekesi halkaları, saniyede 12 kez
 * titreyen mürekkep çizgileri, kaymış baskı dolguları, tarama gölgeler; başlıklar Fraunces (cümle düzeni, sola
 * yaslı, fosforlu kalem vurgusu), şekil notları IBM Plex Mono, kenar notları Patrick Hand ve el çizimi oklar.
 * Kurgu izleyiciyi kaybetmemek için kuruldu:
 *   - ilk karede başlık ve asık suratlı arkadaş hazır, 0,3. saniyede ilk olay ("Günaydın!");
 *   - her öbekte görüntü değişir (kilitler dolar, belirtiler tek tek işaretlenir);
 *   - 2. sahneden itibaren köşedeki yapışkan not "Birazdan: sabah kahvesinin sırrı" der, 5. sahnede ödenir;
 *   - sabah sahnesi kancadaki asık surata döner; kapanışta aynı arkadaşın fotoğrafına kahve gelir.
 * Sahneler: vaka · kilit · yoksunluk · tam sabah · sabah kahvesinin sırrı (Rogers 2010) · arkadaşına gönder.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, lerp, ease, progress, hash } = E;
  const K = window.YupKisa;
  const L = window.YupEl;
  const { P, ink, blob, hatch, arrow, ring, scratch, tally, serif, mono, hand, headline, paper, sticky, tape, rubber, speech, finish } = L;
  // Yazı tipleri de hazır olmadan oynatıcı başlamasın
  window.FILM_READY = Promise.all([window.FILM_READY, window.EL_FONTS_READY]);

  // ---------------------------------------------------------------------------
  // Yardımcılar
  // ---------------------------------------------------------------------------
  // Ölçekli çizimlerde çizgi kalınlığı ve titreşim ekranda sabit kalsın
  const inkS = (ctx, pts, s, o = {}) => ink(ctx, pts, { ...o, width: (o.width ?? 5) / s, amp: (o.amp ?? 1.3) / s, off: [(o.off?.[0] ?? 6) / s, (o.off?.[1] ?? 5) / s] });
  // Köşe noktaları arasına ara noktalar (titreşim için yeterince sık)
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

  // Marka etiketi: küçük logo ve daktilo yazısı
  function tag(ctx) {
    K.appIcon(ctx, 104, 206, 62);
    mono(ctx, 'BU SENSİN', 152, 200, { size: 24, color: P.ink, spacing: 4 });
    mono(ctx, 'YUP AKADEMİ', 152, 230, { size: 19, weight: 500, spacing: 3 });
  }

  // ---------------------------------------------------------------------------
  // Arkadaş: mürekkeple çizilmiş, asimetrik, saçı dağınık. Birim: baş yarıçapı 100.
  // mood: open (göz açıklığı), mouth (−1 asık … 1 gülen, 'wave' homurtu), brow (1 kızgın … −1 dertli),
  //       bags (göz altı), blush (yanak), mug (elinde kupa: 0 boş, 1 dolu, null yok)
  // ---------------------------------------------------------------------------
  function friend(ctx, x, y, r, t, m = {}) {
    const { open = 1, mouth = 0, brow = 0, bags = 0, blush = 0, tilt = 0, a = 1, mug = null } = m;
    if (a <= 0.002) return;
    const s = r / 100;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(s, s);
    // kapüşonlu gövde
    const body = dense([[-178, 340], [-172, 205], [-128, 138], [-62, 116], [0, 124], [62, 114], [126, 136], [174, 200], [180, 340]], 16);
    inkS(ctx, body, s, { fill: P.hood, close: false, seed: 2, t });
    hatch(ctx, [[60, 130], [130, 140], [176, 205], [180, 340], [96, 340]], { angle: -0.9, gap: 13 / s, width: 2.2 / s, seed: 3, t, color: 'rgba(20,20,40,0.35)' });
    inkS(ctx, dense([[-36, 140], [-44, 196], [-38, 232]], 10), s, { close: false, width: 3.5, seed: 4, t });
    inkS(ctx, dense([[34, 140], [40, 194], [46, 226]], 10), s, { close: false, width: 3.5, seed: 5, t });
    // boyun
    inkS(ctx, dense([[-28, 70], [-30, 128], [30, 128], [28, 70]], 12, true), s, { fill: P.skin2, width: 0, seed: 6, t });
    hatch(ctx, [[-30, 84], [30, 84], [30, 126], [-30, 126]], { angle: -0.6, gap: 9 / s, width: 2 / s, seed: 7, t, color: 'rgba(90,50,30,0.35)' });
    // kulaklar ve yüz
    inkS(ctx, blob(-94, 14, 18, 24, { n: 18, seed: 6 }), s, { fill: P.skin, seed: 8, t, width: 4 });
    inkS(ctx, blob(95, 10, 17, 23, { n: 18, seed: 7 }), s, { fill: P.skin, seed: 9, t, width: 4 });
    inkS(ctx, blob(0, 12, 90, 100, { n: 44, irr: 0.03, seed: 8, rot: 0.3 }), s, { fill: P.skin, seed: 10, t, width: 5.5 });
    hatch(ctx, blob(10, 92, 70, 22, { n: 20, seed: 9 }), { angle: -0.7, gap: 10 / s, width: 2 / s, seed: 11, t, color: 'rgba(120,60,30,0.28)' });
    // yataktan yeni kalkmış saç: sivri tepeli dolu kütle, alına düşen perçem, birkaç iç tel
    const w = Math.sin(t * 2.3) * 4;
    const hairM = [[-98, 30], [-108, -18], [-132, -36 + w], [-102, -60], [-124, -102 - w], [-72, -104], [-66, -150 + w], [-28, -120], [-6, -164 - w], [22, -122], [56, -152 + w], [68, -110], [114, -112 - w], [100, -72], [130, -46 + w], [102, -22], [98, 26], [84, -8], [62, -40], [40, -18], [16, -46], [-10, -22], [-36, -48], [-62, -26], [-80, -48], [-92, -4]];
    inkS(ctx, hairM, s, { fill: P.hair, seed: 12, t, width: 5 });
    [[[-60, -96], [-40, -60], [-36, -48]], [[-6, -150], [6, -90], [-10, -24]], [[52, -140], [44, -80], [40, -20]], [[100, -100], [80, -70], [62, -40]]].forEach((st, i) => inkS(ctx, dense(st, 8), s, { close: false, width: 3, seed: 13 + i, t, color: '#6a4a38' }));
    // göz altı
    if (bags > 0) {
      for (const sx of [-1, 1]) {
        ctx.save();
        ctx.globalAlpha *= bags;
        inkS(ctx, dense([[sx * 36 - 20, 18], [sx * 36, 30], [sx * 36 + 20, 18]], 6), s, { close: false, width: 3, seed: 20 + sx, t, color: 'rgba(110,70,120,0.7)' });
        inkS(ctx, dense([[sx * 36 - 16, 26], [sx * 36, 36], [sx * 36 + 16, 26]], 6), s, { close: false, width: 2.5, seed: 23 + sx, t, color: 'rgba(110,70,120,0.45)' });
        ctx.restore();
      }
    }
    // gözler: göz kapağı çizgisi ve yarısı görünen göz bebeği
    for (const sx of [-1, 1]) {
      const ex = sx * 36 + (sx > 0 ? 2 : 0);
      const lidY = -8 + 16 * (1 - open);
      ctx.save();
      ctx.beginPath();
      ctx.rect(ex - 24, lidY, 48, 40);
      ctx.clip();
      ctx.fillStyle = '#fffaf2';
      ctx.beginPath();
      ctx.ellipse(ex, 6, 17, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = P.ink;
      ctx.beginPath();
      ctx.arc(ex + 2, 7, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      inkS(ctx, dense([[ex - 22, lidY + 2], [ex, lidY - 2 - 4 * open], [ex + 22, lidY + 2]], 6), s, { close: false, width: 5, seed: 30 + sx, t });
      if (open > 0.3) inkS(ctx, dense([[ex - 15, 18], [ex, 20], [ex + 15, 17]], 6), s, { close: false, width: 2.5, seed: 33 + sx, t, color: 'rgba(42,28,20,0.5)' });
    }
    // kaşlar (kalın, biri ötekinden biraz yüksek)
    inkS(ctx, dense([[-58, -32 - brow * 4], [-34, -36], [-14, -28 + brow * 10]], 6), s, { close: false, width: 8, seed: 40, t, color: P.hair });
    inkS(ctx, dense([[14, -30 + brow * 10], [36, -40], [60, -36 - brow * 5]], 6), s, { close: false, width: 8, seed: 41, t, color: P.hair });
    // burun
    inkS(ctx, dense([[-2, 4], [8, 30], [-6, 38]], 5), s, { close: false, width: 4, seed: 42, t, color: 'rgba(42,28,20,0.75)' });
    // yanaklar
    if (blush > 0) {
      ctx.save();
      ctx.globalAlpha *= blush;
      ctx.fillStyle = 'rgba(226,100,80,0.32)';
      ctx.beginPath();
      ctx.ellipse(-56, 42, 16, 10, 0, 0, Math.PI * 2);
      ctx.ellipse(58, 40, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // ağız
    if (mouth === 'wave') {
      const pts = [];
      for (let i = 0; i <= 8; i++) pts.push([-26 + i * 6.5, 64 + (i % 2 ? -5 : 5)]);
      inkS(ctx, pts, s, { close: false, width: 5, seed: 43, t, amp: 2 });
    } else {
      inkS(ctx, dense([[-26, 64 + mouth * 2], [0, 62 + mouth * 20], [24, 66 - mouth * 2]], 5), s, { close: false, width: 5.5, seed: 44, t });
    }
    // elinde kupa
    if (mug !== null) {
      mugInk(ctx, 112, 272, 104, t, { fill: mug, steam: mug, tilt: mug ? 0 : -0.12, scale: s });
      inkS(ctx, blob(46, 240, 28, 24, { n: 18, seed: 50 }), s, { fill: P.skin, seed: 50, t, width: 4.5 });
      inkS(ctx, dense([[32, 230], [54, 228]], 6), s, { close: false, width: 3, seed: 51, t });
      inkS(ctx, dense([[30, 243], [56, 242]], 6), s, { close: false, width: 3, seed: 52, t });
    }
    ctx.restore();
  }

  // Kupa (mürekkep): (x, y) alt orta, w genişlik. scale: dıştaki ölçek (çizgi kalınlığını korumak için)
  function mugInk(ctx, x, y, w, t, { fill = 1, steam = 0, tilt = 0, scale = 1, a = 1 } = {}) {
    if (a <= 0.002 || w <= 0.5) return;
    const s = (w / 100) * scale;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(w / 100, w / 100);
    inkS(ctx, blob(58, -46, 22, 25, { n: 24, seed: 61, from: -0.26, to: 0.26 }), s, { close: false, width: 10, seed: 61, t });
    inkS(ctx, dense([[-52, -90], [52, -90], [47, -10], [38, 0], [-38, 0], [-47, -10]], 12, true), s, { fill: '#fbf5ea', seed: 62, t, width: 5.5 });
    inkS(ctx, dense([[-50.5, -62], [50.5, -62], [49.4, -46], [-49.4, -46]], 12, true), s, { fill: P.teal, width: 0, seed: 63, t, off: [4, 3] });
    hatch(ctx, [[20, -88], [52, -88], [47, -10], [38, 0], [18, 0]], { angle: -1.1, gap: 9 / s, width: 2 / s, seed: 64, t, color: 'rgba(42,28,20,0.22)' });
    inkS(ctx, blob(0, -90, 52, 10, { n: 30, seed: 65, irr: 0.01 }), s, { fill: fill > 0 ? P.coffee : '#d9cdb8', seed: 65, t, width: 5, off: [0, 0] });
    if (fill > 0) inkS(ctx, blob(-4, -89, 36, 5.5, { n: 24, seed: 66, irr: 0.03 }), s, { close: true, width: 3, color: P.crema, seed: 66, t });
    else inkS(ctx, blob(10, -88, 13, 3, { n: 12, seed: 67 }), s, { fill: 'rgba(107,63,34,0.6)', width: 0, seed: 67, t, off: [0, 0] });
    if (steam > 0) {
      for (let i = 0; i < 3; i++) {
        const pts = [];
        const ph = t * 2.2 + i * 1.7;
        for (let k = 0; k <= 9; k++) pts.push([-20 + i * 20 + Math.sin(ph + k * 0.7) * 8, -106 - k * 10]);
        ctx.save();
        ctx.globalAlpha *= steam * 0.7;
        inkS(ctx, pts, s, { close: false, width: 4, seed: 68 + i, t, color: 'rgba(42,28,20,0.55)' });
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // Karalama bulut (asık suratın üstünde) ve ara ara şimşek
  function grumpCloud(ctx, x, y, s, t, a = 1) {
    if (a <= 0.002 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x + Math.sin(t * 1.4) * 5, y);
    ctx.scale(s, s);
    const bumps = [[-90, 10, 40], [-50, -24, 46], [8, -36, 52], [62, -18, 42], [94, 12, 32], [40, 30, 40], [-30, 30, 40]];
    const pts = [];
    for (let i = 0; i < 70; i++) {
      const th = (i / 70) * Math.PI * 2;
      const dx = Math.cos(th);
      const dy = Math.sin(th);
      let best = 0;
      for (const [bx, by, br] of bumps) {
        const b = bx * dx + by * dy;
        const disc = b * b - (bx * bx + by * by - br * br);
        if (disc >= 0) best = Math.max(best, b + Math.sqrt(disc));
      }
      pts.push([dx * best, dy * best]);
    }
    inkS(ctx, pts, s, { fill: '#b9bdc8', seed: 70, t, width: 5 });
    const scr = [];
    for (let i = 0; i < 26; i++) scr.push([-70 + hash(i, 71) * 140, -20 + hash(i, 72) * 50]);
    ctx.save();
    ctx.globalAlpha *= 0.5;
    inkS(ctx, scr, s, { close: false, width: 3, seed: 73, t, amp: 3 });
    ctx.restore();
    if ((t * 1.3) % 1 < 0.22) inkS(ctx, dense([[6, 34], [-16, 80], [6, 78], [-10, 124]], 8), s, { close: false, width: 7, color: P.amber, seed: 74, t });
    ctx.restore();
  }

  // Sinir hücresi yüzeyi, kilitler (adenozin alıcıları), kafein çekirdeği, adenozin anahtarı
  const SLOTS = Array.from({ length: 8 }, (_, i) => 130 + i * 117);
  const OLD = [1, 3, 5, 7];
  const NEW = [0, 2, 4, 6];
  const MY = 1250;
  const surf = (x, t) => MY + Math.sin(x * 0.012 + t * 0.8) * 8;
  function membrane(ctx, t, tint = 0) {
    const top = [];
    for (let x = -20; x <= 1100; x += 18) top.push([x, surf(x, t)]);
    const shape = [...top, [1100, 2000], [-20, 2000]];
    const fill = `rgb(${Math.round(lerp(240, 214, tint))},${Math.round(lerp(214, 226, tint))},${Math.round(lerp(222, 244, tint))})`;
    ink(ctx, shape, { fill, width: 0, off: [0, 0], seed: 80, t });
    for (let x = -10; x <= 1100; x += 28) {
      ink(ctx, blob(x, surf(x, t) + 4, 11, 11, { n: 12, seed: 81 + x }), { fill: '#e8b7c8', width: 3, seed: 81 + x, t, off: [3, 2] });
      ink(ctx, [[x - 3, surf(x, t) + 16], [x - 5, surf(x, t) + 44]], { close: false, width: 2.5, seed: 200 + x, t, color: 'rgba(42,28,20,0.45)' });
      ink(ctx, [[x + 4, surf(x, t) + 16], [x + 6, surf(x, t) + 44]], { close: false, width: 2.5, seed: 300 + x, t, color: 'rgba(42,28,20,0.45)' });
    }
    mono(ctx, 'SİNİR HÜCRESİ', 540, MY + 96, { size: 24, align: 'center', color: 'rgba(120,60,80,0.55)', spacing: 6 });
  }
  function lock(ctx, x, y, s, t, i) {
    if (s <= 0.01) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    inkS(ctx, dense([[-52, 14], [-52, -54], [-30, -54], [-30, -20], [30, -20], [30, -54], [52, -54], [52, 14]], 9, true), s, { fill: P.teal, seed: 90 + i, t, width: 5 });
    inkS(ctx, dense([[-12, 14], [-12, 52], [12, 52], [12, 14]], 9, true), s, { fill: '#0b5a54', seed: 100 + i, t, width: 4 });
    ctx.restore();
  }
  function bean(ctx, x, y, s, rot, t, i, a = 1) {
    if (a <= 0.002 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    inkS(ctx, blob(0, 0, 31, 23, { n: 24, seed: 110 + i }), s, { fill: P.coffee, seed: 110 + i, t, width: 5 });
    inkS(ctx, dense([[-22, -5], [-8, 8], [8, -8], [22, 5]], 5), s, { close: false, width: 4, seed: 120 + i, t, color: '#1e120a' });
    ctx.restore();
  }
  function aden(ctx, x, y, s, t, i, a = 1) {
    if (a <= 0.002 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    inkS(ctx, dense([[-28, -24], [28, -24], [30, 22], [-30, 24]], 9, true), s, { fill: P.blue, seed: 130 + i, t, width: 5 });
    hand(ctx, 'Zz', -2, 12, { size: 38, color: '#fffaf0', align: 'center', rot: -0.08 });
    ctx.restore();
  }

  // Kilit sahnesi (2. ve 3. sahnede ortak)
  const KS = 1.2;
  function lockScene(ctx, t, api, { s0, c0, c1, c2, flood = -1, beansOut = -1 }) {
    paper(ctx, t, { stains: [[920, 1640, 120, 5]] });
    membrane(ctx, t, flood > 0 ? progress(t, flood, flood + 1.2) : 0);
    const grow = (i) => (OLD.includes(i) ? 1 : c2 > 0 ? api.pop(t, c2 + 0.5 + NEW.indexOf(i) * 0.12, 0.45) : 0);
    SLOTS.forEach((x, i) => lock(ctx, x, surf(x, t) - 16, grow(i) * 1.05, t, i));
    const beanIn = (i) => (OLD.includes(i) ? (i === 1 ? c0 + 0.45 : c1 + 0.15 + OLD.indexOf(i) * 0.22) : c2 > 0 ? c2 + 1.25 + NEW.indexOf(i) * 0.14 : Infinity);
    SLOTS.forEach((x, i) => {
      const ti = beanIn(i);
      if (t < ti - 0.45) return;
      const p = progress(t, ti - 0.45, ti, ease.in);
      const sy = surf(x, t) - 52;
      let by = lerp(i === 1 ? 600 : 800, sy, p);
      let a = 1;
      if (beansOut > 0) {
        const q = progress(t, beansOut + i * 0.05, beansOut + 0.5 + i * 0.05, ease.in);
        by -= q * 700;
        a = 1 - q;
      }
      bean(ctx, lerp(i === 1 ? 960 : x + 40, x, p), by, KS, (1 - p) * 3, t, i, a);
    });
    const keys = [[210, 1010], [440, 930], [660, 1015], [880, 925], [330, 820], [780, 805]];
    keys.forEach(([kx, ky], i) => {
      let x = kx + Math.sin(t * 1.3 + i * 2) * 18;
      let y = ky + Math.cos(t * 1.7 + i) * 14;
      if (flood > 0) {
        const target = SLOTS[i];
        const p = progress(t, flood + 0.1 + i * 0.07, flood + 0.6 + i * 0.07, ease.inOut);
        aden(ctx, lerp(x, target, p), lerp(y, surf(target, t) - 52, p), KS, t, i);
        return;
      }
      if (c1 > 0 && t > c1 + 0.2) {
        const q = ((t - c1 - 0.2 - i * 0.37) % 2.2) / 0.7;
        if (q > 0 && q < 1) {
          const target = SLOTS[OLD[i % 4]];
          const d = Math.sin(Math.PI * q);
          x = lerp(x, target, d * 0.8);
          y = lerp(y, surf(target, t) - 150, d);
          if (q > 0.35 && q < 0.75) scratch(ctx, target + 56, surf(target, t) - 180, 30, 24, { width: 6, seed: 140 + i, t });
        }
      }
      aden(ctx, x, y, KS, t, i, api.fadeIn(t, s0 + 0.15 + i * 0.06, 0.3));
    });
    if (flood > 0) {
      [6, 7].forEach((i) => {
        const x = SLOTS[i];
        const p = progress(t, flood + 0.55 + i * 0.07, flood + 0.95 + i * 0.07, ease.inOut);
        if (p > 0) aden(ctx, x, lerp(640, surf(x, t) - 52, p), KS, t, i + 10);
      });
    }
  }

  // Yapışkan not: sabah kahvesinin sırrı birazdan
  function teaser(ctx, t, a) {
    if (a <= 0.002) return;
    const k = ease.back(clamp(a));
    ctx.save();
    ctx.translate(855, 238);
    ctx.scale(k, k);
    ctx.rotate(Math.sin(t * 1.1) * 0.01);
    sticky(ctx, -165, -70, 330, 150, { rot: 0.05 });
    ctx.rotate(0.05);
    hand(ctx, 'Birazdan:', -140, -18, { size: 40, rot: 0 });
    hand(ctx, 'sabah kahvesinin sırrı', -140, 30, { size: 38, rot: 0 });
    ctx.restore();
  }

  const draw = {};

  // ---------------------------------------------------------------------------
  // 1 · Vaka: asık surat, "Günaydın!", homurtu, tanı fişi ve damga
  // ---------------------------------------------------------------------------
  draw['k-hook'] = function (ctx, t, api) {
    const { S0, cue, pop, after } = api;
    const s0 = S0('k-hook');
    const u = t - s0;
    paper(ctx, t, { stains: [[870, 1520, 140, 3], [150, 760, 90, 7]] });
    const z = 1 + 0.05 * progress(u, 0, 5, ease.inOut);
    ctx.save();
    ctx.translate(540, 1150);
    ctx.scale(z, z);
    ctx.translate(-540, -1150);
    grumpCloud(ctx, 640, 790, 1.15, t);
    const grr = pop(t, s0 + 1.0, 0.3);
    friend(ctx, 520, 1170, 205, t, { open: 0.3, mouth: grr > 0.5 && u < 2.6 ? 'wave' : -0.9, brow: 0.9, bags: 1, tilt: Math.sin(t * 1.4) * 0.02, mug: 0 });
    ctx.restore();
    // "Günaydın!" ve homurtu
    const b1 = pop(t, s0 + 0.3, 0.4) * (1 - progress(u, 2.3, 2.6));
    if (b1 > 0.01) {
      speech(ctx, 205, 950, 290, 120, { s: b1, tail: [-0.8, 0.9], t, seed: 9 });
      ctx.save();
      ctx.translate(205, 950);
      ctx.scale(b1, b1);
      hand(ctx, 'Günaydın!', 0, 16, { size: 54, align: 'center', rot: -0.04 });
      ctx.restore();
    }
    const b2 = grr * (1 - progress(u, 2.4, 2.7));
    if (b2 > 0.01) {
      const sh = Math.sin(t * 60) * 5 * Math.exp(-(u - 1.0) * 3);
      speech(ctx, 855 + sh, 1010, 250, 150, { s: b2, jag: true, fill: '#f6d7cf', t, seed: 10 });
      ctx.save();
      ctx.translate(855 + sh, 1010);
      ctx.scale(b2, b2);
      hand(ctx, '#@%!', 0, 18, { size: 66, align: 'center', color: P.red, rot: 0.05 });
      ctx.restore();
    }
    // tanı fişi
    const ca = after(t, 'k-hook', 1, 0.45);
    if (ca > 0) {
      ctx.save();
      ctx.translate(540, 1470 + (1 - ca) * 420);
      ctx.rotate(-0.03);
      ctx.shadowColor = 'rgba(60,40,20,0.25)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#fbf7ee';
      ctx.fillRect(-440, -150, 880, 300);
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(210,69,47,0.3)';
      ctx.lineWidth = 2;
      for (let yy = -82; yy < 140; yy += 44) {
        ctx.beginPath();
        ctx.moveTo(-440, yy);
        ctx.lineTo(440, yy);
        ctx.stroke();
      }
      mono(ctx, 'HASTA: EN YAKIN ARKADAŞIN', -400, -100, { size: 22 });
      mono(ctx, 'TANI', -400, -46, { size: 22, color: P.red });
      serif(ctx, 'Kafein yoksunluğu', -402, 30, { size: 72 });
      mono(ctx, 'KAYNAK: DSM-5 · PSİKİYATRİ TANI KİTABI', -400, 100, { size: 21 });
      tape(ctx, -380, -150, 150, -0.2);
      tape(ctx, 380, -148, 150, 0.18);
      ctx.restore();
    }
    rubber(ctx, 'GERÇEK', 800, 1590, cue('k-hook', 2) + 0.15, t, { size: 56, rot: -0.14 });
    // başlık ilk kareden
    mono(ctx, 'VAKA 01 · SABAH 07.42', 86, 318, { size: 24 });
    headline(ctx, [[{ s: 'Kahvesiz' }], [{ s: '= ' }, { s: 'yoksunluk.', c: P.red, mark: P.marker }]], 82, 438, { size: 122, markProg: progress(u, 0.1, 0.6) });
    tag(ctx);
    finish(ctx, t);
  };

  // ---------------------------------------------------------------------------
  // 2 · Kafein kilide oturur; yorgunluk sinyali giremez; her gün içersen beyin kilit ekler
  // ---------------------------------------------------------------------------
  draw['k-lock'] = function (ctx, t, api) {
    const { S0, cue, fadeIn } = api;
    const s0 = S0('k-lock');
    const c0 = cue('k-lock', 0);
    const c1 = cue('k-lock', 1);
    const c2 = cue('k-lock', 2);
    lockScene(ctx, t, api, { s0, c0, c1, c2 });
    const ka = progress(t, c0, c0 + 0.5);
    hand(ctx, 'kafein', 760, 640, { size: 56, color: P.coffee, alpha: ka, rot: -0.06 });
    arrow(ctx, 860, 660, 950, 720, { prog: ka, seed: 31, t, color: P.coffee });
    const ya = progress(t, c1, c1 + 0.5);
    hand(ctx, 'yorgunluk sinyali', 92, 700, { size: 54, color: P.blue, alpha: ya, rot: -0.04 });
    mono(ctx, '(ADENOZİN)', 96, 744, { size: 20, color: P.blue, alpha: ya });
    arrow(ctx, 260, 760, 310, 800, { prog: ya, seed: 32, t, color: P.blue, bend: -0.3 });
    const na = progress(t, c1 + 0.4, c1 + 0.9) * (1 - fadeIn(t, c2, 0.3));
    hand(ctx, 'kilit dolu, giremez!', 300, 1470, { size: 54, color: P.red, alpha: na, rot: -0.03 });
    if (c2 > 0 && t > c2) {
      const n = Math.min(30, Math.floor(progress(t, c2, c2 + 1.1, ease.linear) * 30));
      tally(ctx, 96, 1420, n, { h: 56, gap: 15, t });
      mono(ctx, `${n} GÜN`, 96, 1530, { size: 26, color: P.ink });
      const pa = progress(t, c2 + 0.55, c2 + 0.95);
      hand(ctx, '+4 kilit', 770, 1505, { size: 64, color: P.teal, alpha: pa, rot: -0.05 });
      ring(ctx, 850, 1485, 120, 52, { prog: progress(t, c2 + 0.75, c2 + 1.2), color: P.teal, seed: 33, t });
    }
    mono(ctx, 'ŞEKİL 1 · BEYNİNDEKİ KİLİT', 86, 318, { size: 24, alpha: fadeIn(t, s0, 0.3) });
    headline(ctx, [[{ s: 'Kafein ' }, { s: 'kilide', mark: P.markerTeal }], [{ s: 'oturur.' }]], 82, 438, { size: 112, prog: progress(t, s0, s0 + 0.5), markProg: progress(t, c1, c1 + 0.5) });
    teaser(ctx, t, fadeIn(t, s0 + 0.6, 0.45));
    tag(ctx);
    finish(ctx, t);
  };

  // ---------------------------------------------------------------------------
  // 3 · Kahve kesilince kilitler yorgunlukla dolar; belirtiler doktor çizimi gibi işaretlenir
  // ---------------------------------------------------------------------------
  draw['k-crash'] = function (ctx, t, api) {
    const { S0, cue, fadeIn, pop } = api;
    const s0 = S0('k-crash');
    const c1 = cue('k-crash', 1);
    const c2 = cue('k-crash', 2);
    const c3 = cue('k-crash', 3);
    const sw = progress(t, c1 - 0.25, c1 + 0.15, ease.inOut);
    if (sw < 1) {
      lockScene(ctx, t, api, { s0, c0: -9, c1: -9, c2: s0 - 5, flood: s0 + 0.55, beansOut: s0 + 0.1 });
      const na = pop(t, s0 + 0.05, 0.4);
      ctx.save();
      ctx.translate(540, 760);
      ctx.scale(Math.max(0.01, na), Math.max(0.01, na));
      mugInk(ctx, 0, 70, 120, t, { fill: 0 });
      const xp = progress(t, s0 + 0.2, s0 + 0.5);
      ink(ctx, L.partial([[-80, -70], [-30, -20], [20, 30], [80, 80]], xp * 1.01), { close: false, width: 12, color: P.red, seed: 150, t });
      ink(ctx, L.partial([[80, -70], [30, -20], [-20, 30], [-80, 80]], clamp(xp * 2 - 1)), { close: false, width: 12, color: P.red, seed: 151, t });
      ctx.restore();
      hand(ctx, 'hepsi yorgunlukla doldu', 170, 1480, { size: 58, color: P.blue, alpha: progress(t, s0 + 1.3, s0 + 1.7), rot: -0.03 });
    }
    if (sw > 0) {
      ctx.save();
      ctx.globalAlpha = sw;
      paper(ctx, t, { stains: [[160, 1650, 130, 11]] });
      const st = t < c2 ? 1 : t < c3 ? 2 : 3;
      const face = st === 1 ? { open: 0.15, mouth: -0.7, brow: -0.8, bags: 1, tilt: Math.sin(t * 9) * 0.012 } : st === 2 ? { open: 0.5, mouth: 'wave', brow: 1, bags: 1, tilt: Math.sin(t * 30) * 0.008 } : { open: 0.05, mouth: -0.3, brow: -0.3, bags: 1, tilt: 0.1 * progress(t, c3, c3 + 0.6) };
      friend(ctx, 540, 1190, 210, t, face);
      const ha = fadeIn(t, c1, 0.2);
      if (ha > 0) {
        for (const sx of [-1, 1]) {
          const q = (t * 2) % 1;
          for (let k = 0; k < 3; k++) {
            const rr2 = 40 + k * 22 + q * 10;
            const pts = blob(540 + sx * 200, 1150, rr2, rr2 * 1.2, { n: 20, seed: 160 + k, from: sx > 0 ? -0.12 : 0.38, to: sx > 0 ? 0.12 : 0.62 });
            ink(ctx, pts, { close: false, width: 6, color: P.red, seed: 160 + k + sx, t, amp: 2, a: ha * (1 - k * 0.25) });
          }
        }
        hand(ctx, 'baş ağrısı', 70, 870, { size: 60, color: P.red, alpha: ha, rot: -0.05 });
        arrow(ctx, 210, 900, 320, 1090, { prog: progress(t, c1 + 0.1, c1 + 0.5), seed: 161, t, color: P.red });
      }
      if (t > c2) {
        const ia = fadeIn(t, c2, 0.2);
        hand(ctx, 'sinirlilik', 690, 820, { size: 60, color: P.caramel, alpha: ia, rot: 0.04 });
        arrow(ctx, 760, 850, 640, 1010, { prog: progress(t, c2 + 0.1, c2 + 0.5), seed: 162, t, color: P.caramel, bend: -0.25 });
        for (let i = 0; i < 4; i++) {
          ctx.save();
          ctx.translate(690, 930);
          ctx.rotate((i * Math.PI) / 2 + Math.sin(t * 14) * 0.05);
          ink(ctx, [[8, -28], [10, -10], [28, -8]], { close: false, width: 7, color: P.red, seed: 170 + i, t, a: ia * (1 - fadeIn(t, c3 + 0.3, 0.3)) });
          ctx.restore();
        }
      }
      if (t > c3) {
        const za = fadeIn(t, c3, 0.25);
        hand(ctx, 'uyuşukluk', 640, 1505, { size: 60, color: P.blue, alpha: za, rot: -0.03 });
        for (let k = 0; k < 3; k++) {
          const q = (t * 0.8 + k / 3) % 1;
          hand(ctx, 'Z', 760 + q * 140 + k * 10, 1000 - q * 260, { size: 70 + k * 20, color: P.blue, alpha: za * Math.sin(Math.PI * q), rot: -0.2 });
        }
      }
      mono(ctx, 'DENEYLERDE HER 2 KİŞİDEN 1\'İNDE BAŞ AĞRISI', 86, 690, { size: 22, alpha: fadeIn(t, c1 + 0.6, 0.4) });
      ctx.restore();
    }
    mono(ctx, 'ŞEKİL 2 · KAHVE KESİLİNCE', 86, 318, { size: 24 });
    headline(ctx, [[{ s: 'Kahveyi' }], [{ s: 'kesince.', mark: P.markerBlue }]], 82, 438, { size: 112, prog: progress(t, s0, s0 + 0.5), markProg: progress(t, s0 + 0.5, s0 + 1.0) });
    teaser(ctx, t, 1);
    tag(ctx);
    finish(ctx, t);
  };

  // ---------------------------------------------------------------------------
  // 4 · Son fincandan 12 saat sonra: pencerede akşam → gece → şafak; tam sabah
  // ---------------------------------------------------------------------------
  // Suluboya: üst üste binen yumuşak lekeler
  function wash(ctx, x, y, w, h, cols) {
    cols.forEach(([c, cx, cy, r]) => {
      const g = ctx.createRadialGradient(x + cx * w, y + cy * h, 0, x + cx * w, y + cy * h, r * w);
      g.addColorStop(0, c);
      g.addColorStop(1, c.replace(/[\d.]+\)$/, '0)'));
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
    });
  }
  function clockInk(ctx, cx, cy, r, tm, t) {
    ink(ctx, blob(cx, cy, r, r, { n: 64, irr: 0.012, seed: 180 }), { fill: '#fbf7ee', seed: 180, t, width: 8, off: [8, 7] });
    for (let i = 0; i < 12; i++) {
      const th = (i / 12) * Math.PI * 2;
      const r1 = r * (i % 3 ? 0.84 : 0.76);
      ink(ctx, [[cx + Math.cos(th) * r1, cy + Math.sin(th) * r1], [cx + Math.cos(th) * r * 0.92, cy + Math.sin(th) * r * 0.92]], { close: false, width: i % 3 ? 4 : 7, seed: 181 + i, t, amp: 0.8 });
    }
    [['12', 0], ['3', 3], ['6', 6], ['9', 9]].forEach(([s, h]) => {
      const th = (h / 12) * Math.PI * 2 - Math.PI / 2;
      serif(ctx, s, cx + Math.cos(th) * r * 0.58, cy + Math.sin(th) * r * 0.58 + r * 0.09, { size: r * 0.26, align: 'center', weight: 600 });
    });
    const ha = (((tm / 60) % 12) / 12) * Math.PI * 2 - Math.PI / 2;
    const ma = ((((tm % 60) + 60) % 60) / 60) * Math.PI * 2 - Math.PI / 2;
    ink(ctx, [[cx, cy], [cx + Math.cos(ha) * r * 0.45, cy + Math.sin(ha) * r * 0.45]], { close: false, width: 13, seed: 195, t, amp: 0.8 });
    ink(ctx, [[cx, cy], [cx + Math.cos(ma) * r * 0.7, cy + Math.sin(ma) * r * 0.7]], { close: false, width: 8, seed: 196, t, amp: 0.8 });
    ctx.fillStyle = P.red;
    ctx.beginPath();
    ctx.arc(cx, cy, 11, 0, Math.PI * 2);
    ctx.fill();
  }

  draw['k-morning'] = function (ctx, t, api) {
    const { S0, cue, fadeIn, pop } = api;
    const s0 = S0('k-morning');
    const c0 = cue('k-morning', 0);
    const c1 = cue('k-morning', 1);
    paper(ctx, t, { stains: [[930, 1620, 110, 13]] });
    const spin = progress(t, c0 + 0.2, c1 - 0.05, ease.inOut);
    const night = clamp(spin * 3.5);
    const dawn = progress(t, c1 - 0.3, c1 + 0.35);
    const WX = 96;
    const WY = 600;
    const WW = 888;
    const WH = 800;
    ctx.save();
    ctx.beginPath();
    ctx.rect(WX, WY, WW, WH);
    ctx.clip();
    ctx.fillStyle = '#f2c38e';
    ctx.fillRect(WX, WY, WW, WH);
    wash(ctx, WX, WY, WW, WH, [['rgba(242,170,90,0.9)', 0.3, 0.2, 1.0], ['rgba(250,215,160,0.9)', 0.7, 0.9, 0.9], ['rgba(230,140,110,0.6)', 0.9, 0.1, 0.6]]);
    ctx.globalAlpha = night * (1 - dawn);
    ctx.fillStyle = '#16255c';
    ctx.fillRect(WX, WY, WW, WH);
    wash(ctx, WX, WY, WW, WH, [['rgba(14,24,62,1)', 0.5, 0.3, 1.4], ['rgba(40,64,140,0.9)', 0.2, 0.9, 0.9], ['rgba(20,34,90,0.9)', 0.9, 0.7, 0.8]]);
    ctx.globalAlpha = dawn;
    ctx.fillStyle = '#d9ecf0';
    ctx.fillRect(WX, WY, WW, WH);
    wash(ctx, WX, WY, WW, WH, [['rgba(165,214,235,1)', 0.4, 0.15, 1.2], ['rgba(253,226,170,1)', 0.6, 0.95, 1.0], ['rgba(250,190,120,0.7)', 0.9, 0.8, 0.6]]);
    ctx.globalAlpha = 1;
    const na = night * (1 - dawn);
    if (na > 0.01) {
      ctx.save();
      ctx.globalAlpha = na;
      ctx.fillStyle = '#f4e7c3';
      ctx.beginPath();
      ctx.arc(230, 720, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(16,28,72,1)';
      ctx.beginPath();
      ctx.arc(254, 706, 40, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 9; i++) hand(ctx, '+', 160 + hash(i, 3) * 760, 680 + hash(i, 4) * 640, { size: 30 + hash(i, 5) * 20, color: `rgba(244,231,195,${0.5 + 0.5 * Math.sin(t * 3 + i)})`, rot: 0 });
      ctx.restore();
    }
    const sunA = pop(t, c1, 0.5);
    if (sunA > 0) {
      const sx = 860;
      const sy = 760 - 60 * clamp(sunA);
      ink(ctx, blob(sx, sy, 46, 46, { n: 30, seed: 201 }), { fill: P.amber, seed: 201, t, width: 5, off: [4, 3] });
      for (let i = 0; i < 10; i++) {
        const th = (i / 10) * Math.PI * 2 + t * 0.3;
        ink(ctx, [[sx + Math.cos(th) * 62, sy + Math.sin(th) * 62], [sx + Math.cos(th) * 84, sy + Math.sin(th) * 84]], { close: false, width: 5, seed: 202 + i, t });
      }
    }
    ctx.restore();
    ink(ctx, dense([[WX, WY], [WX + WW, WY], [WX + WW, WY + WH], [WX, WY + WH]], 20, true), { width: 10, seed: 210, t, amp: 1.2 });
    ink(ctx, dense([[WX + 14, WY + 14], [WX + WW - 14, WY + 14], [WX + WW - 14, WY + WH - 14], [WX + 14, WY + WH - 14]], 20, true), { width: 3, seed: 211, t, amp: 1, color: 'rgba(42,28,20,0.5)' });
    const wob = t > c1 ? Math.sin((t - c1) * 40) * 0.035 * Math.exp(-(t - c1) * 1.5) : 0;
    ctx.save();
    ctx.translate(540, 1000);
    ctx.rotate(wob);
    if (spin > 0.01) {
      ctx.save();
      ctx.strokeStyle = 'rgba(245,170,40,0.85)';
      ctx.lineWidth = 34;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, 300, Math.PI / 2, Math.PI / 2 + spin * Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    clockInk(ctx, 0, 0, 250, 18 * 60 + spin * 12 * 60, t);
    ctx.restore();
    if (t > c1) {
      for (const sx of [-1, 1]) hand(ctx, sx < 0 ? '((' : '))', 540 + sx * 330, 1010, { size: 100, color: P.red, align: 'center', rot: Math.sin((t - c1) * 30) * 0.2 });
    }
    hand(ctx, 'son fincan: 18.00', 110, 1475, { size: 54, color: P.coffee, alpha: fadeIn(t, s0 + 0.1, 0.3) * (1 - fadeIn(t, c1, 0.2)), rot: -0.03 });
    hand(ctx, `+${Math.round(spin * 12)} saat`, 640, 1480, { size: 76, color: P.ink, alpha: fadeIn(t, c0 + 0.25, 0.3), rot: -0.05 });
    const fa = pop(t, c1 + 0.1, 0.45);
    if (fa > 0) {
      ctx.save();
      ctx.translate(230, 1330);
      ctx.scale(fa, fa);
      friend(ctx, 0, 0, 84, t, { open: 0.25, mouth: -0.9, brow: 0.9, bags: 1 });
      ctx.restore();
      grumpCloud(ctx, 240, 1165, 0.5 * fa, t);
    }
    mono(ctx, 'ŞEKİL 3 · SON FİNCANDAN SONRA', 86, 318, { size: 24 });
    headline(ctx, [[{ s: '12 saat' }], [{ s: 'sonra.' }]], 82, 438, { size: 112, a: fadeIn(t, s0, 0.3) * (1 - fadeIn(t, c1, 0.2)) });
    headline(ctx, [[{ s: 'Tam ' }, { s: 'sabah.', mark: P.marker }]], 82, 438, { size: 132, a: fadeIn(t, c1, 0.25), markProg: progress(t, c1 + 0.1, c1 + 0.5) });
    teaser(ctx, t, 1);
    tag(ctx);
    finish(ctx, t);
  };

  // ---------------------------------------------------------------------------
  // 5 · Vaadin ödendiği yer: sabah kahvesi süper yapmaz, normale döndürür (Rogers ve ark. 2010)
  // ---------------------------------------------------------------------------
  const X0 = 190;
  const XC = 610;
  const X1 = 930;
  const YB = 1010;
  const YD = 1215;
  const YS = 790;
  const sm = (u) => {
    const v = clamp(u);
    return v * v * (3 - 2 * v);
  };
  const drinker = (x) => (x <= XC ? YB + (YD - YB) * sm((x - X0) / (490 - X0)) : lerp(YD - 5, YB, sm((x - XC) / 110)));
  const myth = (x) => lerp(YD - 5, YS, sm((x - XC) / 140));
  const curvePts = (f, xa, xb) => {
    const out = [];
    for (let x = xa; x < xb; x += 12) out.push([x, f(x)]);
    out.push([xb, f(xb)]);
    return out;
  };

  draw['k-twist'] = function (ctx, t, api) {
    const { S0, cue, fadeIn, pop } = api;
    const s0 = S0('k-twist');
    const c0 = cue('k-twist', 0);
    const c1 = cue('k-twist', 1);
    const c2 = cue('k-twist', 2);
    const c3 = cue('k-twist', 3);
    paper(ctx, t, { stains: [[140, 1640, 120, 17]] });
    // kareli kâğıt kartı
    const ca = fadeIn(t, s0 + 0.05, 0.35);
    ctx.save();
    ctx.globalAlpha *= ca;
    ctx.translate(540, 1050);
    ctx.rotate(-0.015);
    ctx.shadowColor = 'rgba(60,40,20,0.22)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#fdfaf3';
    ctx.fillRect(-470, -410, 940, 800);
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(74,115,184,0.13)';
    ctx.lineWidth = 2;
    for (let x = -470; x <= 470; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, -410);
      ctx.lineTo(x, 390);
      ctx.stroke();
    }
    for (let y = -410; y <= 390; y += 40) {
      ctx.beginPath();
      ctx.moveTo(-470, y);
      ctx.lineTo(470, y);
      ctx.stroke();
    }
    tape(ctx, -420, -410, 150, -0.25);
    tape(ctx, 420, -405, 150, 0.2);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha *= ca;
    arrow(ctx, X0 - 40, 1320, X1 + 40, 1320, { bend: 0, seed: 220, t, width: 5, head: 20 });
    arrow(ctx, X0 - 40, 1320, X0 - 40, 740, { bend: 0, seed: 221, t, width: 5, head: 20 });
    mono(ctx, 'UYANIKLIK', X0 - 20, 760, { size: 22 });
    [['akşam', X0], ['gece', 400], ['sabah', XC], ['öğle', 860]].forEach(([s, x]) => hand(ctx, s, x, 1372, { size: 40, align: 'center', color: P.ink2, rot: 0 }));
    const bp = progress(t, s0 + 0.2, s0 + 0.8);
    if (bp > 0) {
      const pts = curvePts(() => YB, X0, lerp(X0, X1, bp));
      for (let i = 0; i < pts.length - 1; i += 2) ink(ctx, [pts[i], pts[i + 1]], { close: false, width: 5, color: 'rgba(42,28,20,0.45)', seed: 230 + i, t });
      hand(ctx, 'kahve içmeyen', X1 - 10, YB - 24, { size: 40, align: 'right', color: P.ink2, alpha: bp, rot: 0 });
    }
    ctx.restore();
    const dp = progress(t, c1, c1 + 1.1, ease.inOut);
    if (dp > 0) {
      const xe = lerp(X0, XC, dp);
      const pts = curvePts(drinker, X0, xe);
      hatch(ctx, [...pts, [xe, YB], [X0, YB]], { angle: -0.9, gap: 12, width: 2.4, color: 'rgba(74,115,184,0.55)', seed: 240, t });
      ink(ctx, pts, { close: false, width: 9, color: P.teal, seed: 241, t, amp: 1 });
      hand(ctx, 'her gün içen', 250, YD + 50, { size: 44, color: P.teal, alpha: fadeIn(t, c1 + 0.3, 0.3), rot: -0.02 });
      hand(ctx, 'yoksunluk', 380, YB + 100, { size: 50, color: P.blue, alpha: fadeIn(t, c1 + 0.7, 0.3), rot: -0.04 });
    }
    const cp = pop(t, c2 - 0.1, 0.4);
    if (cp > 0) mugInk(ctx, XC, 1305, 64 * cp, t, { fill: 1, steam: 1 });
    const mp = progress(t, c2 + 0.1, c2 + 0.8, ease.inOut);
    const mx = progress(t, c3 - 0.2, c3 + 0.15);
    if (mp > 0) {
      const pts = curvePts(myth, XC, lerp(XC, X1, mp));
      for (let i = 0; i < pts.length - 1; i += 2) ink(ctx, [pts[i], pts[i + 1]], { close: false, width: 7, color: `rgba(196,122,53,${1 - 0.5 * mx})`, seed: 250 + i, t });
      hand(ctx, 'sandığın: süper', 640, YS - 30, { size: 46, color: P.caramel, alpha: mp * (1 - 0.4 * mx), rot: -0.03 });
      scratch(ctx, 790, YS - 44, 300, 50, { prog: mx, seed: 251, t, width: 8 });
    }
    const np = progress(t, c3, c3 + 0.6, ease.inOut);
    if (np > 0) {
      ink(ctx, curvePts(drinker, XC, lerp(XC, X1, np)), { close: false, width: 9, color: P.teal, seed: 260, t, amp: 1 });
      ring(ctx, 740, YB, 80, 44, { prog: progress(t, c3 + 0.35, c3 + 0.8), color: P.red, seed: 261, t });
      hand(ctx, 'normal!', 790, YB + 92, { size: 58, color: P.red, alpha: fadeIn(t, c3 + 0.5, 0.3), rot: -0.05 });
    }
    mono(ctx, 'ŞEKİL 4 · ROGERS VE ARK. 2010 · 379 KİŞİ', 86, 1520, { size: 22, alpha: fadeIn(t, c1, 0.4) });
    mono(ctx, 'SABAH KAHVESİNİN SIRRI', 86, 318, { size: 24 });
    headline(ctx, [[{ s: 'Süper mi' }], [{ s: 'yapıyor?', italic: true }]], 82, 438, { size: 112, a: fadeIn(t, c0 - 0.05, 0.3) * (1 - fadeIn(t, c3, 0.2)), prog: progress(t, c0 - 0.05, c0 + 0.45) });
    headline(ctx, [[{ s: 'Hayır. Sadece' }], [{ s: 'normale', mark: P.markerTeal }, { s: ' döndürüyor.' }]], 82, 438, { size: 84, a: fadeIn(t, c3, 0.25), prog: progress(t, c3, c3 + 0.45), markProg: progress(t, c3 + 0.3, c3 + 0.8) });
    tag(ctx);
    finish(ctx, t);
  };

  // ---------------------------------------------------------------------------
  // 6 · Kapanış: arkadaşına gönder (kâğıt uçak fotoğrafa uçar), fotoğraftaki arkadaşa kahve gelir; logo ve abone
  // Zamanlar ortak motorun kapanış sesleriyle aynı: logo s0+0.25, uçak s0+1.0–1.55, abone dokunuşu end+0.35
  // ---------------------------------------------------------------------------
  function plane(ctx, x, y, s, rot, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ink(ctx, [[-50, 0], [50, -26], [14, 30]], { fill: '#fffaf0', seed: 270, t, width: 5, off: [3, 3] });
    ink(ctx, [[50, -26], [-6, 14], [0, 40]], { fill: '#e9e0cf', seed: 271, t, width: 5, off: [2, 2] });
    ctx.restore();
  }

  draw['k-cta'] = function (ctx, t, api) {
    const { S0, cue, end, fadeIn, pop } = api;
    const s0 = S0('k-cta');
    const c1 = cue('k-cta', 1);
    paper(ctx, t, { stains: [[880, 1580, 120, 21]] });
    // fotoğraf (polaroid): arkadaşın
    const pa = pop(t, s0 + 0.15, 0.5);
    const coffee = progress(t, c1 + 0.1, c1 + 0.5);
    if (pa > 0) {
      ctx.save();
      ctx.translate(735, 870);
      ctx.rotate(0.07);
      ctx.scale(pa, pa);
      ctx.shadowColor = 'rgba(60,40,20,0.28)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = '#fffdf7';
      ctx.fillRect(-190, -230, 380, 460);
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = coffee > 0.5 ? '#f7e3c4' : '#d9dbe2';
      ctx.fillRect(-160, -200, 320, 330);
      ctx.save();
      ctx.beginPath();
      ctx.rect(-160, -200, 320, 330);
      ctx.clip();
      if (coffee < 0.5) grumpCloud(ctx, 10, -150, 0.5, t);
      friend(ctx, -10, 0, 95, t, coffee > 0.5 ? { open: 1, mouth: 0.9, brow: -0.2, blush: 1, mug: 1 } : { open: 0.25, mouth: -0.9, brow: 0.9, bags: 1, mug: 0 });
      ctx.restore();
      hand(ctx, coffee > 0.5 ? 'kahveden sonra' : 'kahveden önce', 0, 190, { size: 38, align: 'center', color: P.ink2, rot: -0.02 });
      tape(ctx, 0, -232, 140, -0.05);
      ctx.restore();
    }
    // kâğıt uçak: soldan fotoğrafa
    const fly = progress(t, s0 + 1.0, s0 + 1.55, ease.inOut);
    if (fly > 0) {
      const path = [];
      for (let i = 0; i <= 30; i++) {
        const u = i / 30;
        path.push([lerp(120, 600, u) - Math.sin(Math.PI * u) * 40, lerp(1130, 760, u) - Math.sin(Math.PI * u) * 220]);
      }
      const n = Math.max(2, Math.floor(path.length * fly));
      for (let i = 0; i < n - 1; i += 2) ink(ctx, [path[i], path[i + 1]], { close: false, width: 4, color: 'rgba(42,28,20,0.5)', seed: 280 + i, t });
      if (fly < 1) {
        const [px, py] = path[n - 1];
        const [qx, qy] = path[Math.max(0, n - 3)];
        plane(ctx, px, py, 1, Math.atan2(py - qy, px - qx), t);
      }
    }
    if (t > s0 + 1.55) hand(ctx, 'gönderildi ✓', 640, 1175, { size: 46, color: P.teal, alpha: fadeIn(t, s0 + 1.55, 0.25), rot: -0.03 });
    mono(ctx, 'SON NOT', 86, 318, { size: 24 });
    headline(ctx, [[{ s: 'Kahvesiz' }], [{ s: 'yapamayan' }], [{ s: 'arkadaşına' }], [{ s: 'gönder.', mark: P.marker }]], 82, 430, { size: 88, lead: 1.02, prog: progress(t, s0 + 0.05, s0 + 0.7), markProg: progress(t, s0 + 0.6, s0 + 1.0) });
    hand(ctx, 'ama önce kahvesini içsin', 86, 820, { size: 46, color: P.coffee, alpha: fadeIn(t, c1, 0.3), rot: -0.03 });
    // marka: logo, sözcük işareti, slogan, abone ol
    const la = pop(t, s0 + 0.25, 0.6);
    if (la > 0) {
      ctx.save();
      ctx.translate(170, 1305);
      ctx.scale(la, la);
      K.appIcon(ctx, 0, 0, 150, { reveal: progress(t, s0 + 0.5, s0 + 1.3, ease.inOut), shine: progress(t, s0 + 1.4, s0 + 2.1) });
      ctx.restore();
    }
    const wa = fadeIn(t, s0 + 0.7, 0.4);
    K.T(ctx, 'YUP Akademi', 270, 1282, { size: 64, weight: 900, color: P.teal, align: 'left', alpha: wa });
    hand(ctx, 'Küçük bir merak, büyük bir keşif.', 272, 1352, { size: 40, color: P.ink, alpha: wa, rot: -0.02 });
    const tap = end('k-cta') + 0.35;
    const done = t > tap;
    const ba = fadeIn(t, s0 + 1.1, 0.35);
    if (ba > 0) {
      const press = Math.exp(-(((t - tap) / 0.09) ** 2));
      ctx.save();
      ctx.globalAlpha *= ba;
      ctx.translate(540, 1470);
      ctx.scale(1 - 0.06 * press, 1 - 0.06 * press);
      const w = 440;
      ink(ctx, dense([[-w / 2, -50], [w / 2, -50], [w / 2, 50], [-w / 2, 50]], 16, true), { fill: done ? '#fffaf0' : P.teal, seed: 290, t, width: 6, off: [7, 6] });
      serif(ctx, done ? 'Abone olundu ✓' : 'Abone ol', 0, 16, { size: 48, align: 'center', color: done ? P.teal : '#fffaf0', weight: 800 });
      ctx.restore();
      const hp = progress(t, tap - 0.7, tap - 0.05, ease.inOut);
      const hA = fadeIn(t, tap - 0.7, 0.2) * (1 - progress(t, tap + 0.7, tap + 1.0));
      if (hA > 0) {
        ctx.save();
        ctx.globalAlpha *= hA;
        ctx.translate(lerp(900, 600, hp), lerp(1760, 1500, hp));
        ctx.scale(1.4, 1.4);
        ink(ctx, dense([[0, 0], [0, -46], [18, -46], [18, -20], [44, -16], [52, 0], [48, 32], [30, 44], [6, 44], [-18, 14], [-14, 0]], 10, true), { fill: '#fffaf0', seed: 295, t, width: 4.5, off: [3, 3] });
        ctx.restore();
      }
      if (done) {
        for (let i = 0; i < 10; i++) {
          const q = clamp((t - tap) / 0.9);
          if (q >= 1) continue;
          const th = (i / 10) * Math.PI * 2;
          const d = 240 + q * 120;
          hand(ctx, '+', 540 + Math.cos(th) * d, 1470 + Math.sin(th) * d * 0.4, { size: 40 * (1 - q) + 10, color: [P.amber, P.teal, P.red][i % 3], align: 'center', rot: 0 });
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
    const { cue, S0 } = api;
    const pop = (t, n, g = 0.05, pan = 0) => m.pop(t, { freq: hz(n), gain: g, pan });
    const bell = (t, n, g = 0.06, pan = 0) => m.bell(t, { freq: hz(n), gain: g, decay: 2.2, pan });
    const s1 = S0('k-hook');
    pop(s1 + 0.3, 'E5', 0.06, -0.4);
    m.wobble(s1 + 1.0, 0.7, { gain: 0.1, freq: 120 });
    m.buzz(s1 + 1.0, { gain: 0.05, dur: 0.25 });
    m.whoosh(cue('k-hook', 1), { dur: 0.5, from: 500, to: 1600, gain: 0.04 });
    m.boom(cue('k-hook', 2) + 0.15, { gain: 0.22, freq: 80 });
    m.click(cue('k-hook', 2) + 0.15, { gain: 0.2, tone: 1500 });
    m.whoosh(cue('k-lock', 0), { dur: 0.5, from: 2400, to: 700, gain: 0.05, panFrom: 0.5, panTo: -0.1 });
    pop(cue('k-lock', 0) + 0.45, 'A4', 0.07);
    ['C#5', 'E5', 'A5'].forEach((n, i) => pop(cue('k-lock', 1) + 0.37 + i * 0.22, n, 0.05, -0.3 + i * 0.3));
    for (let i = 0; i < 10; i++) m.tick(cue('k-lock', 2) + i * 0.11, { gain: 0.03, tone: 4200 });
    ['D5', 'F#5', 'A5', 'D6'].forEach((n, i) => m.blip(cue('k-lock', 2) + 0.5 + i * 0.12, { freq: hz(n), dur: 0.12, gain: 0.03 }));
    const s3 = S0('k-crash');
    m.whoosh(s3 + 0.1, { dur: 0.6, from: 600, to: 3000, gain: 0.05 });
    m.riser(s3 + 0.4, 1.0, { gain: 0.05 });
    for (let i = 0; i < 8; i++) m.blip(s3 + 0.7 + i * 0.07, { freq: 300 - i * 18, dur: 0.1, gain: 0.025 });
    m.heartbeat(cue('k-crash', 1), { gain: 0.45 });
    m.heartbeat(cue('k-crash', 1) + 0.55, { gain: 0.35 });
    m.buzz(cue('k-crash', 2), { gain: 0.05, dur: 0.3 });
    m.blip(cue('k-crash', 3), { freq: 520, dur: 0.6, slide: 0.45, gain: 0.04 });
    const c40 = cue('k-morning', 0);
    const c41 = cue('k-morning', 1);
    for (let x = c40 + 0.2; x < c41; x += 0.12) m.tick(x, { gain: 0.03, tone: 3000 });
    for (let i = 0; i < 6; i++) bell(c41 + i * 0.13, i % 2 ? 'E6' : 'C#6', 0.045, i % 2 ? 0.3 : -0.3);
    m.whoosh(S0('k-twist') + 0.05, { dur: 0.5, from: 700, to: 2000, gain: 0.04 });
    m.riser(cue('k-twist', 2), 0.7, { gain: 0.04 });
    m.buzz(cue('k-twist', 3) - 0.15, { gain: 0.05, dur: 0.2 });
    bell(cue('k-twist', 3) + 0.45, 'A5', 0.07);
    pop(cue('k-cta', 1) + 0.1, 'F#5', 0.06, 0.3);
    bell(cue('k-cta', 1) + 0.25, 'B5', 0.04, 0.3);
  }

  window.FILM = K.short({
    title: 'Kahvesiz yapamayan arkadaşın · YUP Akademi',
    series: 'BU SENSİN',
    share: true,
    gap: 0.12,
    breath: 0.2,
    wipe: 0.35,
    extra: { 'k-hook': 0.35, 'k-lock': 0.45, 'k-crash': 0.4, 'k-morning': 0.45, 'k-twist': 0.8, 'k-cta': 2.0 },
    lead: { 'k-hook': 0.1, 'k-lock': 0.15, 'k-crash': 0.2, 'k-morning': 0.15, 'k-twist': 0.15, 'k-cta': 0.3 },
    titles: {
      'k-hook': 'Vaka',
      'k-lock': 'Kilit',
      'k-crash': 'Yoksunluk',
      'k-morning': 'Tam sabah',
      'k-twist': 'Sabah kahvesinin sırrı',
      'k-cta': 'Arkadaşına gönder',
    },
    chords: {
      'k-hook': ['D3', 'A3', 'F#4', 'B4'],
      'k-lock': ['B2', 'F#3', 'D4', 'A4'],
      'k-crash': ['G2', 'D3', 'A#3', 'F4'],
      'k-morning': ['E3', 'B3', 'G#4', 'D5'],
      'k-twist': ['A2', 'E3', 'C#4', 'G#4'],
      'k-cta': ['D3', 'A3', 'F#4', 'A4'],
    },
    draw,
    score,
  });
})();
