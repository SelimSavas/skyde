/*
 * Lup: YUP Akademi'nin yaşayan büyüteci. ChatGPT'de çizilen parçalardan (lup-gorsel.js) kodla oynatılan karakter.
 * Parçalar: camsız gövde, göz akı ve irisi, 8 kaş, 13 ağız, 12 el; göz kapakları, kollar ve cam kodla çizilir.
 *
 * YupLup.draw(ctx, x, y, h, st, t)   (x, y) ayağın yere bastığı nokta, h toplam boy (px). st alanları (hepsi isteğe bağlı):
 *   face    'notr' | 'merak' | 'hayret' | 'mutlu' | 'gulum' | 'supheli' | 'endise' | 'odak' | 'irkil' | 'kizgin'
 *           ya da { brow, open, low, happy, squeeze, mouth, iris, gx, gy }
 *   talk    konuşma ağzı (YupLup.say(api, satır, t) sesten bulur); verilirse yüzün ağzının yerine geçer
 *   gx, gy  bakış (−1…1);  browUp  kaşı kaldır (R birimi, ör. 0.08)
 *   arms    poz adı (POSES) ya da { l: {...}, r: {...} }; el: { x, y, el, d: [dx, dy] parmak yönü }
 *           birim mercek yarıçapı (R), mercek merkezine göre; YupLup.mix(a, b, k) iki poz arasında geçer
 *   hold    { l?: ctx => {}, r?: ctx => {} } elin arkasında çizilen eşya (bileğe göre, birim R, dünyaya göre dik)
 *   top     ctx => {} gövdenin üstüne, mercek merkezine göre (birim R) çizilen ek (gözlük gibi)
 *   inside  ctx => {} camın içine, yüzün arkasına (merkez 0,0, yarıçap 1);  noFace: true → yüz çizilmez
 *   squash  ezilme (+ basık, − uzun);  tilt  eğilme (rad, ayak çevresinde);  dy  zıplama (px, yukarı −)
 *   a       saydamlık;  shadow  ayak gölgesi (0…1);  blink  false → kendiliğinden göz kırpmaz;  seed  kırpma zamanlaması
 * Ayrıca: intro (Mercek Açılışı), lensWipe (mercek geçişi), ring (halka), glint (parıltı), say/mouth (dudak eşlemesi),
 * hop (zıplayarak giriş). Örnek: video/kisa-havaifisek/film.js
 */
(function (root) {
  'use strict';

  const E = root.Engine;
  const { clamp, lerp, ease, progress, hash } = E;
  const TAU = Math.PI * 2;
  const G = root.LUP_GORSEL ?? {};
  const IMG = {};
  const loads = [];
  for (const k of Object.keys(G)) {
    const im = new Image();
    im.src = G[k].src;
    IMG[k] = im;
    loads.push(im.decode ? im.decode().catch(() => {}) : Promise.resolve());
  }
  root.FILM_READY = Promise.all([root.FILM_READY ?? Promise.resolve(), ...loads]);

  const INK = '#2a1c14';
  // Yüz yerleşimi (birim R, mercek merkezine göre): lup-ana.png'den ölçüldü
  const EX = 0.03;
  const EY = 0.02;
  const ER = 0.5;
  const TOP = 1.27; // halkanın tepesi
  const foot = () => (G.govde ? (G.govde.h - 3 - G.govde.cy) / G.govde.r : 3.2);

  const FACES = {
    notr: { brow: 'notr', open: 1, mouth: 'dinlen' },
    merak: { brow: 'kalk', open: 1.04, mouth: 'dinlen', gy: -0.25 },
    hayret: { brow: 'cokkalk', open: 1.1, mouth: 'hayret', iris: 0.82 },
    mutlu: { brow: 'mutlu', happy: true, mouth: 'gulus' },
    gulum: { brow: 'mutlu', open: 1, mouth: 'gulus' },
    supheli: { brow: 'supheli', open: 0.58, low: 0.12, mouth: 'dalga' },
    endise: { brow: 'dertli', open: 0.92, mouth: 'dalga' },
    odak: { brow: 'odak', open: 0.72, low: 0.1, mouth: 'mbp' },
    irkil: { brow: 'kizgin', open: 0, squeeze: true, mouth: 'dalga' },
    kizgin: { brow: 'kizgin', open: 0.78, mouth: 'asik' },
  };

  // El parçaları: bilek noktası (oran) ve parmakların çizimdeki yönü (rad)
  const HANDS = {
    acik: { ax: 0.55, ay: 0.95, dir: -Math.PI / 2 },
    isaret: { ax: 0.1, ay: 0.74, dir: -0.3 },
    bas: { ax: 0.42, ay: 0.95, dir: -Math.PI / 2 },
    yumruk: { ax: 0.42, ay: 0.93, dir: -Math.PI / 2 },
    salla: { ax: 0.55, ay: 0.96, dir: -Math.PI / 2 },
    bir: { ax: 0.5, ay: 0.96, dir: -Math.PI / 2 },
    iki: { ax: 0.5, ay: 0.96, dir: -Math.PI / 2 },
    uc: { ax: 0.5, ay: 0.96, dir: -Math.PI / 2 },
    kalem: { ax: 0.6, ay: 0.9, dir: -Math.PI / 2 },
    damga: { ax: 0.55, ay: 0.45, dir: -Math.PI / 2 },
    cene: { ax: 0.5, ay: 0.95, dir: -Math.PI / 2 },
    tamam: { ax: 0.5, ay: 0.96, dir: -Math.PI / 2 },
  };

  // Kol pozları (r: izleyicinin sağındaki el; l verilmezse r'nin aynası)
  const POSES = {
    dur: { r: { x: 1.4, y: 1.62, el: 'acik', d: [0.3, 1] } },
    anlat: { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.72, y: 0.45, el: 'acik', d: [0.45, -1] } },
    goster: { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 2.05, y: 0.5, el: 'isaret', d: [1, -0.2] } },
    gosterSol: { l: { x: -2.05, y: 0.5, el: 'isaret', d: [-1, -0.2] }, r: { x: 1.4, y: 1.62, el: 'acik', d: [0.3, 1] } },
    yukari: { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.5, y: -0.45, el: 'bir', d: [0.12, -1] } },
    kulak: { r: { x: 1.13, y: -0.02, el: 'acik', d: [-0.25, -1] } },
    kenet: { r: { x: 0.2, y: 1.45, el: 'yumruk', d: [-0.4, -1] } },
    tut: { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.62, y: 1.05, el: 'yumruk', d: [0.15, -1] } },
    bas: { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.62, y: 0.55, el: 'bas', d: [0.15, -1] } },
    salla: { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.62, y: -0.5, el: 'salla', d: [0.3, -1] } },
    cene: { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 0.55, y: 1.2, el: 'cene', d: [-0.6, -1] } },
  };
  const mirror = (h) => h && { ...h, x: -h.x, d: [-h.d[0], h.d[1]] };
  function pose(p) {
    const o = typeof p === 'string' ? POSES[p] ?? POSES.dur : p ?? POSES.dur;
    return { l: o.l ?? mirror(o.r), r: o.r ?? mirror(o.l) };
  }
  // İki poz arasında yumuşak geçiş (el parçası yarıda değişir)
  function mix(a, b, k) {
    const A = pose(a);
    const B = pose(b);
    if (k <= 0) return A;
    if (k >= 1) return B;
    const m = (p, q) => ({ x: lerp(p.x, q.x, k), y: lerp(p.y, q.y, k), d: [lerp(p.d[0], q.d[0], k), lerp(p.d[1], q.d[1], k)], el: k < 0.5 ? p.el : q.el });
    return { l: m(A.l, B.l), r: m(A.r, B.r) };
  }

  // Kendiliğinden göz kırpma: 2,6–4,6 sn arayla 0,14 sn
  function blinkAt(t, seed) {
    const n = Math.floor((t + seed * 1.7) / 3.6);
    const at = n * 3.6 + 0.6 + hash(n, 31 + seed) * 2.4 - seed * 1.7;
    const u = (t - at) / 0.14;
    return u > 0 && u < 1 ? 1 - Math.sin(Math.PI * u) : 1;
  }

  function sprite(ctx, k, x, y, w) {
    const g = G[k];
    if (!g) return;
    const h = (w * g.h) / g.w;
    ctx.drawImage(IMG[k], x - w / 2, y - h / 2, w, h);
  }

  // ---------------------------------------------------------------------------
  // Yüz
  // ---------------------------------------------------------------------------
  function eye(ctx, f, st, t) {
    const ak = G.goz_ak;
    if (!ak) return;
    let open = f.open ?? 1;
    const big = Math.max(1, open);
    open = Math.min(1, open);
    if (st.blink !== false && !f.happy && !f.squeeze) open *= blinkAt(t, st.seed ?? 0);
    ctx.save();
    ctx.translate(EX, EY);
    ctx.scale(big, big);
    if (f.happy || f.squeeze) {
      ctx.strokeStyle = INK;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 0.075;
      ctx.beginPath();
      if (f.happy) {
        ctx.moveTo(-ER * 0.72, ER * 0.18);
        ctx.quadraticCurveTo(0, -ER * 0.62, ER * 0.72, ER * 0.18);
      } else {
        ctx.moveTo(-ER * 0.7, -ER * 0.32);
        ctx.lineTo(ER * 0.25, 0);
        ctx.lineTo(-ER * 0.7, ER * 0.32);
      }
      ctx.stroke();
      ctx.lineWidth = 0.03;
      for (const [x1, y1, x2, y2] of f.happy ? [[-ER * 0.78, -ER * 0.02, -ER * 0.98, -ER * 0.16], [ER * 0.78, -ER * 0.02, ER * 0.98, -ER * 0.16]] : [[ER * 0.45, -ER * 0.3, ER * 0.7, -ER * 0.42], [ER * 0.45, ER * 0.3, ER * 0.7, ER * 0.42]]) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    sprite(ctx, 'goz_ak', 0, 0, ER * 2);
    const r0 = ER * 0.92;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r0, 0, TAU);
    ctx.clip();
    const ri = ER * 0.55 * (f.iris ?? 1);
    const gx = clamp(st.gx ?? f.gx ?? 0, -1, 1);
    const gy = clamp(st.gy ?? f.gy ?? 0, -1, 1);
    const m = (r0 - ri) * 0.82;
    sprite(ctx, 'goz_iris', gx * m, gy * m, ri * 2);
    // göz kapakları: üst kapak yukarıdan iner, alt kapak aşağıdan çıkar
    const low = clamp(Math.max(f.low ?? 0, (1 - open) * 0.45));
    const closed = f.happy || f.squeeze || open < 0.06;
    const yu = closed ? ER * 0.2 : lerp(-ER * 1.08, ER * 0.2, 1 - open);
    const yl = closed ? ER * 0.2 : lerp(ER * 1.08, ER * 0.2, low);
    ctx.fillStyle = '#f1e4cd';
    if (closed || open < 0.999) {
      ctx.beginPath();
      ctx.moveTo(-ER, -ER * 1.2);
      ctx.lineTo(ER, -ER * 1.2);
      ctx.lineTo(ER, yu);
      ctx.quadraticCurveTo(0, yu + ER * 0.28, -ER, yu);
      ctx.closePath();
      ctx.fill();
    }
    if (closed || low > 0.001) {
      ctx.beginPath();
      ctx.moveTo(-ER, ER * 1.2);
      ctx.lineTo(ER, ER * 1.2);
      ctx.lineTo(ER, yl);
      ctx.quadraticCurveTo(0, yl + ER * 0.1, -ER, yl);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineWidth = 0.045;
    if (f.happy) {
      ctx.beginPath();
      ctx.moveTo(-ER * 0.68, ER * 0.22);
      ctx.quadraticCurveTo(0, -ER * 0.45, ER * 0.68, ER * 0.22);
      ctx.stroke();
    } else if (f.squeeze) {
      ctx.lineWidth = 0.055;
      ctx.beginPath();
      ctx.moveTo(-ER * 0.7, -ER * 0.12);
      ctx.lineTo(ER * 0.05, ER * 0.14);
      ctx.lineTo(ER * 0.7, -ER * 0.2);
      ctx.stroke();
    } else if (closed) {
      ctx.beginPath();
      ctx.moveTo(-ER * 0.75, ER * 0.12);
      ctx.quadraticCurveTo(0, ER * 0.52, ER * 0.75, ER * 0.12);
      ctx.stroke();
    } else if (open < 0.999) {
      // üst kapağın kenar çizgisi (dairenin içinde kalan kısmı)
      const half = Math.sqrt(Math.max(0, r0 * r0 - yu * yu));
      ctx.beginPath();
      ctx.moveTo(-half, yu + 0.004);
      ctx.quadraticCurveTo(0, yu + ER * 0.28 - (1 - (half / r0) ** 2) * ER * 0.1, half, yu + 0.004);
      ctx.stroke();
    }
    ctx.restore();
  }

  function face(ctx, st, t) {
    const base = typeof st.face === 'object' ? st.face : FACES[st.face ?? 'notr'] ?? FACES.notr;
    eye(ctx, base, st, t);
    const bw = 0.8;
    const kb = G['kas_' + (base.brow ?? 'notr')] ? 'kas_' + (base.brow ?? 'notr') : 'kas_notr';
    const k = bw / (G.kas_notr?.w ?? 386);
    if (G[kb]) {
      const w = G[kb].w * k;
      const h = G[kb].h * k;
      ctx.drawImage(IMG[kb], 0.06 - w / 2, -0.63 - (st.browUp ?? 0) - h / 2 - (h - (G.kas_notr.h * k)) * 0.35, w, h);
    }
    const mk = 'agiz_' + (st.talk ?? base.mouth ?? 'dinlen');
    if (G[mk]) {
      const km = 0.46 / (G.agiz_dinlen?.w ?? 308);
      const w = G[mk].w * km;
      const h = G[mk].h * km;
      ctx.drawImage(IMG[mk], -0.01 - w / 2, 0.57, w, h);
    }
  }

  function glass(ctx, st, t) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 1.01, 0, TAU);
    ctx.clip();
    const gr = ctx.createRadialGradient(-0.22, -0.28, 0.05, 0, 0, 1.05);
    gr.addColorStop(0, '#f4f6ee');
    gr.addColorStop(0.62, '#e1ebe7');
    gr.addColorStop(1, '#b7cfd3');
    ctx.fillStyle = gr;
    ctx.fillRect(-1.1, -1.1, 2.2, 2.2);
    if (st.inside) {
      ctx.save();
      st.inside(ctx);
      ctx.restore();
    }
    if (!st.noFace) face(ctx, st, t);
    // çizikler ve iç kenar gölgesi
    ctx.strokeStyle = 'rgba(70,95,100,0.25)';
    ctx.lineWidth = 0.008;
    for (const [x1, y1, x2, y2] of [[-0.62, 0.2, -0.48, -0.02], [-0.57, 0.26, -0.47, 0.1], [0.55, 0.42, 0.68, 0.25], [0.2, -0.82, 0.32, -0.9]]) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(30,55,65,0.16)';
    ctx.lineWidth = 0.09;
    ctx.beginPath();
    ctx.arc(0, 0, 1.0, 0, TAU);
    ctx.stroke();
    glare(ctx, 1);
    ctx.restore();
  }

  // Camın sol üstündeki iki beyaz yansıma (birim yarıçap)
  function glare(ctx, a = 1) {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = 'rgba(255,255,255,0.86)';
    ctx.lineCap = 'round';
    ctx.lineWidth = 0.075;
    ctx.beginPath();
    ctx.moveTo(-0.84, -0.3);
    ctx.lineTo(-0.52, -0.76);
    ctx.stroke();
    ctx.lineWidth = 0.04;
    ctx.beginPath();
    ctx.moveTo(-0.66, -0.16);
    ctx.lineTo(-0.4, -0.54);
    ctx.stroke();
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Kollar ve eller
  // ---------------------------------------------------------------------------
  function arm(ctx, side, h, hold, t) {
    if (!h) return;
    const sx = side * 1.01;
    const sy = 0.76;
    let [dx, dy] = h.d ?? [0, 1];
    const dl = Math.hypot(dx, dy) || 1;
    dx /= dl;
    dy /= dl;
    const c1 = [sx + side * 0.32, sy + 0.18];
    const c2 = [h.x - dx * 0.5, h.y - dy * 0.5];
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], h.x - dx * 0.06, h.y - dy * 0.06);
    };
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    path();
    ctx.strokeStyle = '#1e130d';
    ctx.lineWidth = 0.125;
    ctx.stroke();
    path();
    ctx.strokeStyle = '#5c3a27';
    ctx.lineWidth = 0.075;
    ctx.stroke();
    ctx.save();
    ctx.translate(h.x, h.y);
    if (hold) {
      ctx.save();
      hold(ctx, t);
      ctx.restore();
    }
    const H = HANDS[h.el ?? 'acik'] ?? HANDS.acik;
    const g = G['el_' + (h.el ?? 'acik')];
    if (g) {
      const k = 0.0019;
      const flip = h.flip ?? side < 0;
      const want = Math.atan2(dy, dx);
      const th = want - (flip ? Math.PI - H.dir : H.dir);
      ctx.rotate(th);
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(IMG['el_' + (h.el ?? 'acik')], -H.ax * g.w * k, -H.ay * g.h * k, g.w * k, g.h * k);
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Lup
  // ---------------------------------------------------------------------------
  function draw(ctx, x, y, h, st = {}, t = 0) {
    const g = G.govde;
    const a = st.a ?? 1;
    if (!g || a <= 0.002 || h <= 1) return;
    const F = foot();
    const R = h / (F + TOP);
    ctx.save();
    ctx.globalAlpha *= a;
    const sh = (st.shadow ?? 1) * clamp(1 + (st.dy ?? 0) / (R * 3));
    if (sh > 0.01) {
      ctx.fillStyle = `rgba(35,22,14,${0.24 * sh})`;
      ctx.beginPath();
      ctx.ellipse(x, y + R * 0.02, R * 0.62 * (0.7 + 0.3 * sh), R * 0.13, 0, 0, TAU);
      ctx.fill();
    }
    ctx.translate(x, y + (st.dy ?? 0));
    ctx.rotate(st.tilt ?? 0);
    const breathe = st.still ? 0 : Math.sin(t * 2.4 + (st.seed ?? 0)) * 0.012;
    const sq = (st.squash ?? 0) + breathe;
    ctx.scale(1 + sq * 0.8, 1 - sq);
    ctx.translate(0, -F * R);
    ctx.scale(R, R);
    glass(ctx, st, t);
    ctx.drawImage(IMG.govde, -g.cx / g.r, -g.cy / g.r, g.w / g.r, g.h / g.r);
    if (st.top) {
      ctx.save();
      st.top(ctx, t);
      ctx.restore();
    }
    const P = pose(st.arms);
    arm(ctx, -1, P.l, st.hold?.l, t);
    arm(ctx, 1, P.r, st.hold?.r, t);
    ctx.restore();
  }

  // Zıplayarak giriş: t0'da kadrajın altından ya da yandan gelir, iner, ezilir, oturur
  function hop(t, t0, { from = 420, dur = 0.55 } = {}) {
    const u = (t - t0) / dur;
    if (u < 0) return { a: 0, dy: from, squash: 0 };
    if (u < 1) {
      const k = ease.out(u);
      return { a: clamp(u * 4), dy: lerp(from, 0, k) - Math.sin(Math.PI * u) * from * 0.35, squash: -0.12 * Math.sin(Math.PI * u) };
    }
    const v = (t - t0 - dur) / 0.35;
    return { a: 1, dy: 0, squash: v < 1 ? 0.14 * Math.sin(Math.PI * v) * (1 - v) : 0 };
  }

  // ---------------------------------------------------------------------------
  // Mercek halkası, parıltı, giriş ve geçiş
  // ---------------------------------------------------------------------------
  // Halkayı, iç deliği (cx, cy, r) olacak biçimde çizer
  function ring(ctx, cx, cy, r, { a = 1, rot = 0 } = {}) {
    const g = G.halka;
    if (!g || a <= 0.002) return;
    const s = r / g.r;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.drawImage(IMG.halka, -g.cx * s, -g.cy * s, g.w * s, g.h * s);
    ctx.restore();
  }

  function glint(ctx, x, y, s, { a = 1, rot = 0 } = {}) {
    const g = G.parilti;
    if (!g || a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.drawImage(IMG.parilti, -g.w / 2, -g.h / 2);
    ctx.restore();
  }

  // Masa (merceğin dışı): ekranı kaplar, karartılır
  function desk(ctx, dim = 0.35) {
    const g = G.masa;
    if (g) {
      const s = Math.max(1080 / g.w, 1920 / g.h);
      ctx.drawImage(IMG.masa, 540 - (g.w * s) / 2, 960 - (g.h * s) / 2, g.w * s, g.h * s);
    } else {
      ctx.fillStyle = '#6b4a2e';
      ctx.fillRect(0, 0, 1080, 1920);
    }
    ctx.fillStyle = `rgba(22,14,9,${dim})`;
    ctx.fillRect(0, 0, 1080, 1920);
  }

  // Mercek Açılışı (0–1,1 sn): ilk karede merceğin içinde kanca sahnesi büyütülmüş, dışında Lup'un masası;
  // 0,15'te camdan parıltı geçer, bir el halkayı çevirir; 0,45–1,1 arası mercek büyüyüp kadrajı aşar.
  // inner(ctx) kanca sahnesini tam kare çizer. Kancayı geciktirmez: ses 0,1'de başlar, sahne baştan oynar.
  function intro(ctx, t, t0, inner, { cx = 540, cy = 900, r0 = 360 } = {}) {
    const lt = t - t0;
    const p = progress(lt, 0.45, 1.1, ease.in);
    if (p >= 1) {
      inner(ctx);
      return 1;
    }
    desk(ctx, 0.38);
    const r = lerp(r0, 1650, p);
    const m = lerp(1.32, 1, ease.inOut(clamp(lt / 1.1)));
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.clip();
    ctx.translate(cx, cy);
    ctx.scale(m, m);
    ctx.translate(-cx, -cy);
    inner(ctx);
    ctx.restore();
    // camın yansıması ve parıltı
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.clip();
    ctx.translate(cx, cy);
    ctx.scale(r, r);
    ctx.fillStyle = 'rgba(220,235,239,0.08)';
    ctx.fillRect(-1, -1, 2, 2);
    glare(ctx, 0.75 * (1 - p));
    ctx.restore();
    const gp = progress(lt, 0.12, 0.5, ease.inOut);
    if (gp > 0 && gp < 1) glint(ctx, cx + lerp(-0.7, 0.75, gp) * r, cy + lerp(-0.55, 0.45, gp) * r, 0.7 * Math.sin(Math.PI * gp), { rot: gp * 1.2 });
    ring(ctx, cx, cy, r, { rot: lerp(0, 0.35, ease.out(clamp(lt / 1.1))) });
    // Lup'un eli halkanın kenarını çevirir
    const ha = progress(lt, 0.05, 0.2) * (1 - progress(lt, 0.42, 0.55));
    if (ha > 0 && G.el_yumruk) {
      ctx.save();
      ctx.globalAlpha *= ha;
      const ang = 0.35 + lerp(0, 0.3, progress(lt, 0.12, 0.45, ease.inOut));
      ctx.translate(cx + Math.cos(ang) * r * 1.13, cy + Math.sin(ang) * r * 1.13);
      ctx.rotate(ang - Math.PI / 2);
      const g = G.el_yumruk;
      const w = r * 0.42;
      ctx.drawImage(IMG.el_yumruk, -w / 2, (-w * g.h) / g.w / 2, w, (w * g.h) / g.w);
      ctx.restore();
    }
    return p;
  }

  // Mercek geçişi (kisa.js def.transition): halka ortadan büyür, içinde yeni sahne
  function lensWipe(ctx, p, prev, self, { cx = 540, cy = 960 } = {}) {
    prev();
    const k = ease.inOut(p);
    const r = lerp(30, 1500, k);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.clip();
    self();
    ctx.restore();
    ring(ctx, cx, cy, r, { rot: k * 0.6 });
  }

  // ---------------------------------------------------------------------------
  // Dudak eşlemesi: DUDAK (video/araclar/dudak.py) sözcük zamanlarından, saniyede 15 kez ağız şekli
  // ---------------------------------------------------------------------------
  const VOW = { a: 'a', e: 'e', 'ı': 'i', i: 'i', o: 'o', 'ö': 'o', u: 'u', 'ü': 'u' };
  function mouth(id, lt) {
    const W = root.DUDAK?.[id];
    if (!W || !W.length || lt < 0 || lt > W[W.length - 1][1] + 0.06) return null;
    const q = Math.floor(lt * 15) / 15;
    for (const [a, b, w] of W) {
      if (q < a - 0.02) break;
      if (q > b) continue;
      const s = String(w).toLocaleLowerCase('tr').replace(/[^a-zçğıöşü]/g, '');
      if (!s) return 'dinlen';
      const u = clamp((q - a) / Math.max(0.05, b - a), 0, 0.999);
      const c = s[Math.floor(u * s.length)];
      if ('mbp'.includes(c)) return 'mbp';
      if ('fv'.includes(c)) return 'fv';
      if (VOW[c]) return VOW[c];
      if (c === 'l') return 'l';
      let best = 'i';
      let bd = 0.3;
      for (let i = 0; i < s.length; i++) {
        if (!VOW[s[i]]) continue;
        const d = Math.abs((i + 0.5) / s.length - u);
        if (d < bd) {
          bd = d;
          best = VOW[s[i]];
        }
      }
      return best;
    }
    return 'dinlen';
  }
  // Film zamanında: satırın sesi cue(id, 0)'da başlar
  const say = (api, id, t) => mouth(id, t - api.cue(id, 0)) ?? undefined;

  root.YupLup = { IMG, G, FACES, HANDS, POSES, pose, mix, draw, hop, ring, glint, glare, desk, intro, lensWipe, mouth, say, foot, TOP };
})(window);
