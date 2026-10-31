/*
 * YUP Akademi · Lup · Vücudun Gizli Ayarları kısa video (1080×1920) — Ayağın uyuşması
 *
 * Benzetme baştan sona telefon hattı: sinir = hat, beyin = santral, karıncalanma = hattın cızırtısı.
 * Anlatıcı Lup (ağzı sese uyar, dudak.js); santralde kodla çizilen operatör kulaklığı takar.
 * Arka planlar ve karakterler ChatGPT'de çizildi (film akşamı, telefon santrali, Arkadaşın; assets.js).
 * Fiş, kablo, santral lambaları, karıncalar, uyuşan ayak, kıvılcımlar ve bütün yazılar kodla canlanır.
 *
 * Tipografi "sinir hattı" (yazi.js, şablon görünümü yok):
 *   Başlık   Shantell Sans 800, kâğıt şerit üstünde; harfler karıncalanmada titrer, uyuşmada soluk ve kesik çizgili olur,
 *            ezilmede basıklaşır (yazı konuyu oynar).
 *   Etiket   Dymo kabartma bant (Barlow Condensed 700); harf harf zımbalanır, her harfte tık sesi.
 *   Telgraf  Courier Prime 700, yırtık kenarlı telgraf bandı, harf harf yazılır.
 *   Not      Kalam 700, keçeli kalem el yazısı, yazılarak belirir.
 *   Logo     Nunito (marka, değişmez).
 * Kurgu: ilk karede Mercek Açılışı ve başlık; olaylar sözcüğüne oturur (W: sözcük zamanı).
 * Sahneler: uyuşan ayak · sıkışan sinir · hat kesik · hat açıldı, sinyal karışık · başka dillerde karınca · gönder.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, lerp, ease, progress, hash } = E;
  const K = window.YupKisa;
  const L = window.YupEl;
  const LUP = window.YupLup;
  const { P, ink, arrow, paper, tape, finish, swash } = L;
  const TAU = Math.PI * 2;
  const INK = P.ink;
  const CREAM = '#f4ecdd';
  const RED = '#c8332b';
  const TEALD = '#1f6f68';
  const BLACKD = '#222326';
  const BRASS = '#d8b25a';
  const SH = '"Shantell Sans", "Patrick Hand", sans-serif';
  const BC = '"Barlow Condensed", "Arial Narrow", sans-serif';
  const KA = 'Kalam, "Patrick Hand", cursive';
  const CP = '"Courier Prime", "Courier New", monospace';

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
  window.FILM_READY = Promise.all([window.FILM_READY, window.EL_FONTS_READY, window.HAT_FONTS_READY, ...loads]);

  // Uyuşan bölge: görselin bir kopyası grileşir, yumuşak kenarlı lekelerle maskelenir
  let OFF = null;
  let MASK = null;
  function numbLayer(img, w, h, spots) {
    if (!OFF) {
      OFF = document.createElement('canvas');
      MASK = document.createElement('canvas');
    }
    const W2 = Math.ceil(w);
    const H2 = Math.ceil(h);
    OFF.width = MASK.width = W2;
    OFF.height = MASK.height = H2;
    const m = MASK.getContext('2d');
    for (const [fx, fy, fr] of spots) {
      const g = m.createRadialGradient(fx * w, fy * h, 0, fx * w, fy * h, fr * w);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.65, 'rgba(255,255,255,0.9)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      m.fillStyle = g;
      m.fillRect(0, 0, W2, H2);
    }
    const o = OFF.getContext('2d');
    o.filter = 'grayscale(1) brightness(1.22) contrast(0.78)';
    o.drawImage(img, 0, 0, w, h);
    o.filter = 'none';
    o.globalCompositeOperation = 'destination-in';
    o.drawImage(MASK, 0, 0);
    o.globalCompositeOperation = 'source-over';
    return OFF;
  }

  function pic(ctx, k, x, y, w, { ax = 0.5, ay = 0.5, rot = 0, a = 1, flip = false, sx = 1, sy = 1, numb = null } = {}) {
    const g = A[k];
    if (!g || a <= 0.002 || w <= 0.5) return;
    const h = (w * g.h) / g.w;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.scale((flip ? -1 : 1) * sx, sy);
    ctx.drawImage(IMG[k], -ax * w, -ay * h, w, h);
    if (numb && numb.k > 0.01) {
      ctx.globalAlpha *= numb.k;
      ctx.drawImage(numbLayer(IMG[k], w, h, numb.spots), -ax * w, -ay * h, w, h);
    }
    ctx.restore();
  }
  // Görselin dünyadaki noktası (dönüşsüz yerleşim için)
  const at = (k, x, y, w, ax, ay, fx, fy) => {
    const g = A[k];
    const h = (w * g.h) / g.w;
    return [x - ax * w + fx * w, y - ay * h + fy * h];
  };
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
  // Tipografi
  // ---------------------------------------------------------------------------
  // Başlık: satırlar = [[{ s, k, numb, sq, mark, c }...]]
  //   k karıncalanma (harfler titrer), numb uyuşma (soluk dolgu, kesik çizgi), sq ezilme (basıklaşır), mark fosforlu kalem
  function title(ctx, rows, x, y, { size = 92, lead = 1.06, prog = 1, t = 0, markProg = 1, seed = 5, maxW = 920, a = 1 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.font = `800 ${size}px ${SH}`;
    const widest = Math.max(...rows.map((r) => ctx.measureText(r.map((p) => p.s).join('')).width));
    if (widest > maxW) size *= maxW / widest;
    ctx.font = `800 ${size}px ${SH}`;
    ctx.textBaseline = 'alphabetic';
    const total = rows.reduce((s, r) => s + r.reduce((q, p) => q + [...p.s].length, 0), 0);
    let idx = 0;
    rows.forEach((parts, li) => {
      const yy = y + li * size * lead;
      let cx = x;
      for (const p of parts) {
        const pw = ctx.measureText(p.s.trimEnd()).width;
        if (p.mark) swash(ctx, cx - size * 0.06, yy - size * 0.4, pw + size * 0.12, size * 0.46, p.mark, markProg, seed + li * 5);
        cx += ctx.measureText(p.s).width;
      }
      cx = x;
      for (const p of parts) {
        const chars = [...p.s];
        let pre = '';
        for (const ch of chars) {
          const adv = ctx.measureText(pre + ch).width - ctx.measureText(pre).width;
          pre += ch;
          const ap = clamp((prog * (total + 5) - idx) / 5);
          if (ap > 0 && ch !== ' ') {
            const k = p.k ?? 0;
            const fr = k > 0.05 ? Math.floor(t * 14) : 0;
            // el yapımı duruş (sabit) + karıncalanma (zamanla titrer)
            const bx = (hash(idx, seed) - 0.5) * size * 0.03;
            const by = (hash(idx, seed + 1) - 0.5) * size * 0.04;
            const br = (hash(idx, seed + 2) - 0.5) * 0.06;
            const jx = (hash(idx * 3 + 1, seed + fr) - 0.5) * size * 0.09 * k;
            const jy = (hash(idx * 3 + 2, seed + fr) - 0.5) * size * 0.12 * k;
            const jr = (hash(idx * 3 + 3, seed + fr) - 0.5) * 0.3 * k;
            const sq = p.sq ?? 0;
            const n = p.numb ?? 0;
            const pop = ap < 1 ? 0.6 + 0.4 * ease.back(ap) : 1;
            ctx.save();
            ctx.translate(cx + adv / 2 + bx + jx, yy + by + jy);
            ctx.rotate(br + jr);
            ctx.scale((1 + 0.2 * sq) * pop, (1 - 0.48 * sq) * pop);
            const base = ctx.globalAlpha;
            ctx.globalAlpha = base * clamp(ap * 2) * (1 - 0.85 * n);
            ctx.fillStyle = p.c ?? INK;
            ctx.fillText(ch, -adv / 2, 0);
            if (n > 0.01) {
              ctx.globalAlpha = base * clamp(ap * 2) * n * 0.9;
              ctx.setLineDash([size * 0.06, size * 0.07]);
              ctx.lineWidth = size * 0.026;
              ctx.strokeStyle = p.c ?? INK;
              ctx.strokeText(ch, -adv / 2, 0);
            }
            ctx.restore();
          }
          cx += adv;
          idx++;
        }
      }
    });
    ctx.restore();
  }

  // Yırtık kenarlı kâğıt şerit (başlığın zemini)
  function strip(ctx, y, rows, lead = 100, a = 1) {
    if (a <= 0.002) return;
    const h = 132 + (rows - 1) * lead;
    const y0 = y - 92;
    ctx.save();
    ctx.globalAlpha *= 0.97 * a;
    ctx.shadowColor = 'rgba(20,12,6,0.35)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = CREAM;
    ctx.beginPath();
    ctx.moveTo(46, y0);
    for (let i = 1; i <= 32; i++) ctx.lineTo(46 + (988 * i) / 32, y0 + (hash(i, 11) - 0.5) * 10);
    for (let i = 1; i <= 8; i++) ctx.lineTo(1034 + (hash(i, 12) - 0.5) * 6, y0 + (h * i) / 8);
    for (let i = 31; i >= 0; i--) ctx.lineTo(46 + (988 * i) / 32, y0 + h + (hash(i, 13) - 0.5) * 10);
    for (let i = 7; i >= 1; i--) ctx.lineTo(46 + (hash(i, 14) - 0.5) * 6, y0 + (h * i) / 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    tape(ctx, 540, y0 + 2, 150, -0.03, a);
  }

  // Dymo kabartma bant: prog ile harf harf zımbalanır (bant da harflerle uzar)
  function dymo(ctx, str, x, y, { col = RED, rot = 0, size = 56, prog = 1, a = 1, align = 'center', s = 1 } = {}) {
    if (a <= 0.002 || prog <= 0 || s <= 0.01) return 0;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.font = `700 ${size}px ${BC}`;
    const sp = size * 0.13;
    const chars = [...str];
    const ws = chars.map((ch) => ctx.measureText(ch).width);
    const pad = size * 0.42;
    const full = ws.reduce((q, w) => q + w + sp, 0) - sp + pad * 2;
    const n = Math.min(chars.length, Math.ceil(chars.length * prog - 1e-6));
    const w = pad * 2 + ws.slice(0, n).reduce((q, v) => q + v + sp, 0) - (n ? sp : 0);
    const h = size * 1.22;
    const x0 = align === 'center' ? -full / 2 : align === 'right' ? -full : 0;
    ctx.shadowColor = 'rgba(0,0,0,0.42)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.roundRect(x0, -h / 2, w, h, size * 0.1);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, 'rgba(255,255,255,0.24)');
    g.addColorStop(0.35, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.textBaseline = 'middle';
    let cx = x0 + pad;
    for (let i = 0; i < n; i++) {
      const dy = (hash(i, 71) - 0.5) * size * 0.06;
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.fillText(chars[i], cx + size * 0.03, dy + size * 0.06);
      ctx.fillStyle = 'rgba(255,255,255,0.94)';
      ctx.fillText(chars[i], cx, dy + size * 0.02);
      cx += ws[i] + sp;
    }
    ctx.restore();
    return full;
  }
  const PUNCH = 0.065; // Dymo'da bir harfin zımbalanma süresi (sn)
  const dymoProg = (t, t0, str) => clamp((t - t0) / (PUNCH * [...str].length));

  // Telgraf bandı: sağdan kayarak gelir, harf harf yazılır
  const TYPE = 0.032;
  function telex(ctx, str, y, t0, t, { x = 540, rot = 0.008, size = 36, a = 1, out = 1e9 } = {}) {
    if (t < t0 || a <= 0.002) return;
    const slide = progress(t, t0, t0 + 0.32, ease.out);
    const leave = progress(t, out, out + 0.3, ease.in);
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x + lerp(1150, 0, slide) - leave * 1200, y);
    ctx.rotate(rot);
    ctx.font = `700 ${size}px ${CP}`;
    const tw = ctx.measureText(str).width;
    const w = tw + 90;
    const hh = size * 0.95;
    ctx.shadowColor = 'rgba(0,0,0,0.32)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#efe6cf';
    ctx.beginPath();
    ctx.moveTo(-w / 2, -hh);
    ctx.lineTo(w / 2, -hh);
    for (let i = 0; i <= 8; i++) ctx.lineTo(w / 2 + (i % 2 ? 11 : 0), -hh + (i * 2 * hh) / 8);
    ctx.lineTo(-w / 2, hh);
    for (let i = 8; i >= 0; i--) ctx.lineTo(-w / 2 - (i % 2 ? 11 : 0), -hh + (i * 2 * hh) / 8);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = 'transparent';
    // delikli kenar şeridi (telgraf bandı)
    ctx.fillStyle = 'rgba(42,28,20,0.16)';
    for (let xx = -w / 2 + 14; xx < w / 2 - 8; xx += 22) {
      ctx.beginPath();
      ctx.arc(xx, -hh + 8, 3, 0, TAU);
      ctx.fill();
    }
    const n = clamp(Math.floor((t - t0 - 0.2) / TYPE), 0, [...str].length);
    ctx.fillStyle = INK;
    ctx.textBaseline = 'middle';
    ctx.fillText([...str].slice(0, n).join(''), -tw / 2, 4);
    ctx.restore();
  }

  // Kalam el yazısı not; card: arkasına kâğıt; prog: yazılarak belirir
  function note(ctx, str, x, y, { size = 50, col = INK, rot = -0.03, a = 1, prog = 1, align = 'left', card = false } = {}) {
    if (a <= 0.002 || prog <= 0) return 0;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.font = `700 ${size}px ${KA}`;
    const w = ctx.measureText(str).width;
    const x0 = align === 'center' ? -w / 2 : align === 'right' ? -w : 0;
    if (card) {
      ctx.save();
      ctx.shadowColor = 'rgba(30,18,10,0.3)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = card === true ? '#fbf6ea' : card;
      ctx.fillRect(x0 - size * 0.35, -size * 0.95, w + size * 0.7, size * 1.4);
      ctx.restore();
    }
    if (prog < 1) {
      ctx.beginPath();
      ctx.rect(x0 - 10, -size * 1.3, (w + 20) * prog, size * 2);
      ctx.clip();
    }
    ctx.fillStyle = col;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(str, x0, 0);
    ctx.restore();
    return w;
  }

  function tag(ctx, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(246,239,225,0.92)';
    ctx.beginPath();
    ctx.roundRect(60, 160, 470, 96, 16);
    ctx.fill();
    K.appIcon(ctx, 104, 206, 62);
    ctx.fillStyle = INK;
    ctx.textBaseline = 'alphabetic';
    ctx.font = `700 30px ${BC}`;
    ctx.letterSpacing = '3px';
    ctx.fillText('VÜCUDUN GİZLİ AYARLARI', 152, 202);
    ctx.font = `700 22px ${BC}`;
    ctx.fillStyle = 'rgba(42,28,20,0.66)';
    ctx.fillText('YUP AKADEMİ · LUP', 152, 233);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Çizim parçaları
  // ---------------------------------------------------------------------------
  const W = (api, id, i) => api.cue(id, 0) + (window.DUDAK?.[id]?.[i]?.[0] ?? i * 0.4);
  const lupR = (h) => h / (LUP.foot() + LUP.TOP);
  // Lup'un mercek merkezi (dünya) ve bir dünya noktasının kol birimi
  const lupC = (x, y, h, dy = 0) => [x, y + dy - LUP.foot() * lupR(h)];
  const armTo = (x, y, h, wx, wy, dy = 0) => {
    const [cx, cy] = lupC(x, y, h, dy);
    const R = lupR(h);
    return { x: (wx - cx) / R, y: (wy - cy) / R };
  };
  function lup(ctx, t, api, id, x, y, h, st = {}) {
    LUP.draw(ctx, x, y, h, { talk: LUP.say(api, id, t), ...st }, t);
  }
  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.roundRect(x, y, w, h, r);
  }
  // Operatör kulaklığı (Lup'un gövdesine, birim R)
  function headset(c) {
    c.lineCap = 'round';
    c.beginPath();
    c.arc(0, 0.06, 1.43, Math.PI + 0.3, TAU - 0.3);
    c.strokeStyle = '#1e130d';
    c.lineWidth = 0.21;
    c.stroke();
    c.strokeStyle = '#7d5a34';
    c.lineWidth = 0.12;
    c.stroke();
    c.beginPath();
    c.arc(0, 0.06, 1.45, Math.PI + 0.55, TAU - 1.0);
    c.strokeStyle = 'rgba(255,236,190,0.35)';
    c.lineWidth = 0.03;
    c.stroke();
    for (const s of [-1, 1]) {
      c.save();
      c.translate(s * 1.36, -0.08);
      c.fillStyle = '#1e130d';
      rr(c, -0.21, -0.37, 0.42, 0.74, 0.17);
      c.fill();
      c.fillStyle = TEALD;
      rr(c, -0.155, -0.315, 0.31, 0.63, 0.13);
      c.fill();
      c.fillStyle = BRASS;
      rr(c, -0.06, -0.2, 0.12, 0.4, 0.05);
      c.fill();
      c.restore();
    }
    c.beginPath();
    c.moveTo(1.32, 0.22);
    c.quadraticCurveTo(1.18, 0.82, 0.52, 0.88);
    c.strokeStyle = '#1e130d';
    c.lineWidth = 0.1;
    c.stroke();
    c.strokeStyle = BRASS;
    c.lineWidth = 0.05;
    c.stroke();
    c.fillStyle = '#1e130d';
    c.beginPath();
    c.arc(0.47, 0.88, 0.11, 0, TAU);
    c.fill();
  }
  // Elde fiş (bileğe göre, birim R; uç yukarı)
  function plugHold(c) {
    c.fillStyle = '#1e130d';
    c.fillRect(-0.1, -0.68, 0.2, 0.6);
    c.fillStyle = BRASS;
    c.fillRect(-0.065, -0.645, 0.13, 0.53);
    c.fillStyle = 'rgba(255,240,200,0.5)';
    c.fillRect(-0.04, -0.62, 0.03, 0.48);
    c.fillStyle = '#1e130d';
    c.fillRect(-0.045, -0.9, 0.09, 0.26);
    c.fillStyle = '#ecd28c';
    c.fillRect(-0.025, -0.88, 0.05, 0.22);
  }
  const PLUG_UP = 0.78; // fiş ucunun bilekten yüksekliği (R)

  // Kablo: (x1,y1)'den (x2,y2)'ye sarkan eğri; buzz: üstünde cızırtı kıvılcımları
  function cable(ctx, x1, y1, x2, y2, { sag = 140, col = RED, w = 12, prog = 1, buzz = 0, t = 0, seed = 1 } = {}) {
    const mx = (x1 + x2) / 2;
    const my = Math.max(y1, y2) + sag;
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const u = (i / 40) * prog;
      const a = (1 - u) * (1 - u);
      const b = 2 * u * (1 - u);
      const c = u * u;
      pts.push([a * x1 + b * mx + c * x2, a * y1 + b * my + c * y2]);
    }
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const path = () => {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    };
    path();
    ctx.strokeStyle = '#1e130d';
    ctx.lineWidth = w + 7;
    ctx.stroke();
    path();
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.stroke();
    path();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = w * 0.25;
    ctx.translate(-w * 0.2, -w * 0.2);
    ctx.stroke();
    ctx.restore();
    if (buzz > 0.01) {
      const f = Math.floor(t * 15);
      for (let i = 3; i < pts.length - 2; i += 3) {
        if (hash(i, f + seed) > 0.35 + 0.4 * (1 - buzz)) continue;
        const [x, y] = pts[i];
        const [qx, qy] = pts[i + 1];
        let nx = -(qy - y);
        let ny = qx - x;
        const nl = Math.hypot(nx, ny) || 1;
        nx /= nl;
        ny /= nl;
        const s = (hash(i, f + 7) > 0.5 ? 1 : -1) * (22 + hash(i, f + 3) * 26) * buzz;
        spark(ctx, [[x, y], [x + nx * s * 0.4 + 8, y + ny * s * 0.4 - 6], [x + nx * s * 0.6 - 6, y + ny * s * 0.6 + 6], [x + nx * s, y + ny * s]]);
      }
    }
    return pts;
  }
  function spark(ctx, pts, { col = P.amber, w = 5 } = {}) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = '#1e130d';
    ctx.lineWidth = w + 4;
    ctx.stroke();
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.stroke();
    ctx.restore();
  }
  // Karıncalanma işaretleri: bir noktanın çevresinde yanıp sönen zikzaklar
  function zap(ctx, x, y, r, t, { a = 1, n = 5, seed = 1, w = 5 } = {}) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const f = Math.floor(t * 12);
    for (let i = 0; i < n; i++) {
      if (hash(i, f + seed) < 0.28) continue;
      const th = (i / n) * TAU + hash(i, seed) * 1.1 + (hash(i, f + seed + 5) - 0.5) * 0.5;
      const dx = Math.cos(th);
      const dy = Math.sin(th);
      const r0 = r * (0.85 + hash(i, f + 3) * 0.35);
      const l = r * 0.6;
      const px = -dy;
      const py = dx;
      const bx = x + dx * r0;
      const by = y + dy * r0;
      spark(ctx, [[bx, by], [bx + dx * l * 0.4 + px * l * 0.22, by + dy * l * 0.4 + py * l * 0.22], [bx + dx * l * 0.6 - px * l * 0.16, by + dy * l * 0.6 - py * l * 0.16], [bx + dx * l, by + dy * l]], { w });
    }
    ctx.restore();
  }
  // Küçük karınca (kodla, yukarıdan): +x yönüne yürür
  function ant(ctx, x, y, s, ang, t, seed = 0, col = INK) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.scale(s, s);
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.lineCap = 'round';
    const ph = t * 24 + seed;
    ctx.lineWidth = 1.9;
    for (let i = 0; i < 3; i++) {
      const lx = -3 + i * 4.5;
      const sw = Math.sin(ph + i * 2.1) * 3;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx + sw - 2, 9);
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx - sw - 2, -9);
      ctx.stroke();
    }
    for (const [ex, rx, ry] of [[-10, 6.5, 4.6], [0, 4, 3], [8, 4.4, 3.8]]) {
      ctx.beginPath();
      ctx.ellipse(ex, 0, rx, ry, 0, 0, TAU);
      ctx.fill();
    }
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(11, -2);
    ctx.quadraticCurveTo(15, -9, 19, -8);
    ctx.moveTo(11, 2);
    ctx.quadraticCurveTo(15, 9, 19, 8);
    ctx.stroke();
    ctx.restore();
  }
  // Bir yol boyunca yürüyen karınca dizisi
  function march(ctx, path, t, t0, { n = 8, speed = 160, gap = 46, s = 1.4, a = 1, col = INK } = {}) {
    if (t < t0 || a <= 0.01) return;
    const seg = [];
    let len = 0;
    for (let i = 1; i < path.length; i++) {
      const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
      seg.push(l);
      len += l;
    }
    ctx.save();
    ctx.globalAlpha *= a;
    for (let k = 0; k < n; k++) {
      let d = (t - t0) * speed - k * gap;
      if (d < 0 || d > len) continue;
      let i = 0;
      while (i < seg.length - 1 && d > seg[i]) d -= seg[i++];
      const u = d / seg[i];
      const [x1, y1] = path[i];
      const [x2, y2] = path[i + 1];
      const wob = Math.sin(t * 20 + k * 1.7) * 1.2;
      ant(ctx, lerp(x1, x2, u), lerp(y1, y2, u) + wob, s, Math.atan2(y2 - y1, x2 - x1), t, k * 1.3, col);
    }
    ctx.restore();
  }
  // Büyük karıncalar (ChatGPT çizimi) bir yol boyunca
  function antSprites(ctx, path, t, t0, { n = 6, speed = 150, gap = 70, w = 74, exit = false, a = 1 } = {}) {
    if (t < t0) return;
    const seg = [];
    let len = 0;
    for (let i = 1; i < path.length; i++) {
      const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
      seg.push(l);
      len += l;
    }
    for (let k = 0; k < n; k++) {
      let d = (t - t0) * speed - k * gap;
      if (d < 0 || (exit && d > len)) continue;
      d = Math.min(d, len - k * gap * 0.6);
      if (d < 0) continue;
      let i = 0;
      while (i < seg.length - 1 && d > seg[i]) d -= seg[i++];
      const u = clamp(d / seg[i]);
      const [x1, y1] = path[i];
      const [x2, y2] = path[i + 1];
      const key = k % 3 === 2 ? 'karinca3' : 'karinca1';
      const bob = -Math.abs(Math.sin(t * 14 + k)) * 5;
      const th = Math.atan2(y2 - y1, x2 - x1);
      pic(ctx, key, lerp(x1, x2, u), lerp(y1, y2, u) + bob, w, { ax: 0.5, ay: 0.85, rot: th + Math.sin(t * 12 + k) * 0.05, a: a * clamp((t - t0 - k * gap / speed) * 6) });
    }
  }

  // Santral: lambalar (4 grup × kırmızı, sarı, turkuaz), "ayak" hattının jakı ve fişin kablosu
  const LAMPS = [];
  [[132, 190, 246], [376, 432, 488], [618, 674, 730], [858, 914, 970]].forEach((g) => g.forEach((x, j) => LAMPS.push([x, 732, ['#ff6a4a', '#ffd34a', '#45d3c6'][j]])));
  const JACK = [700, 880];
  const CABLE_FROM = [612, 1262];
  const HANG = [770, 1245];
  function lamp(ctx, i, k) {
    const [x, y, col] = LAMPS[i];
    if (k < 0) {
      ctx.save();
      ctx.globalAlpha *= -k;
      ctx.fillStyle = 'rgba(28,18,12,0.9)';
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, TAU);
      ctx.fill();
      ctx.restore();
      return;
    }
    if (k < 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha *= k;
    ctx.fillStyle = 'rgba(255,240,200,0.55)';
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, TAU);
    ctx.fill();
    const g2 = ctx.createRadialGradient(x, y, 4, x, y, 70);
    g2.addColorStop(0, hexA(col, 0.85));
    g2.addColorStop(0.3, hexA(col, 0.3));
    g2.addColorStop(1, hexA(col, 0));
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.arc(x, y, 70, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  function jack(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#1e130d';
    ctx.beginPath();
    ctx.arc(x, y, 19, 0, TAU);
    ctx.fill();
    ctx.fillStyle = BRASS;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#120b07';
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  // Serbest fiş (kablonun ucunda), ang: kablodan uca doğru
  function plugFree(ctx, x, y, ang) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang + Math.PI / 2);
    ctx.fillStyle = '#1e130d';
    ctx.fillRect(-12, -10, 24, 68);
    ctx.fillStyle = BRASS;
    ctx.fillRect(-8, -6, 16, 60);
    ctx.fillStyle = '#1e130d';
    ctx.fillRect(-6, -36, 12, 30);
    ctx.fillStyle = '#ecd28c';
    ctx.fillRect(-3.5, -34, 7, 27);
    ctx.restore();
  }
  // "Ayak" hattının etiketi ve lambası
  const AYAK_LAMP = 7; // 3. grubun sarı lambası
  function ayakLabel(ctx, t, a = 1) {
    dymo(ctx, 'AYAK', 674, 778, { col: BLACKD, size: 32, rot: -0.02, a });
    jack(ctx, ...JACK);
  }

  // ---------------------------------------------------------------------------
  // Sahneler
  // ---------------------------------------------------------------------------
  const draw = {};

  // 1 · Kanca: Lup'un ayağı uyuşmuş; "karıncalanma"da zıplar; telefon kablosu ayağına bağlanır, cızırdar
  draw['u-hook'] = function (ctx, t, api) {
    const id = 'u-hook';
    const s0 = api.S0(id);
    const tingT = W(api, id, 4); // karıncalanma
    const telT = W(api, id, 7); // telefon
    const czT = W(api, id, 12); // cızırtı
    const LX = 560;
    const LY = 1735;
    const inner = (c) => {
      cover(c, 'film');
      // Lup ve uyuşmuş ayağı
      if (t < tingT - 0.05) {
        const sway = Math.sin(t * 2.2) * 0.015;
        pic(c, 'poz_uyku', LX, LY, 470, { ax: 0.5, ay: 0.985, rot: sway });
        const [fx, fy] = at('poz_uyku', LX, LY, 470, 0.5, 0.985, 0.66, 0.9);
        for (let i = 0; i < 3; i++) {
          const u = ((t * 0.6 + i / 3) % 1);
          note(c, 'z', fx - 120 - u * 60 + i * 10, fy - 60 - u * 160, { size: 44 + i * 8, col: 'rgba(60,70,110,0.85)', a: Math.sin(Math.PI * u), rot: -0.2 });
        }
      }
    };
    const p = LUP.intro(ctx, t, s0, inner, { cx: 540, cy: 1180, r0: 420 });
    // "karıncalanma": zıplayan Lup (intro bitmiş olur)
    let foot = null;
    if (t >= tingT - 0.05) {
      const lt = t - tingT;
      const dy = -Math.abs(Math.sin(lt * 8.5)) * 46 * (0.6 + 0.4 * Math.exp(-lt));
      const w = 560;
      pic(ctx, 'poz_zipla', LX, LY + dy, w, { ax: 0.5, ay: 0.97, rot: Math.sin(lt * 9) * 0.05 });
      foot = at('poz_zipla', LX, LY + dy, w, 0.5, 0.97, 0.46, 0.8);
      zap(ctx, foot[0], foot[1], 70, t, { n: 6, seed: 3 });
    }
    // telefon ve kablosu: "telefon"da belirir, kablo ayağa uzanır; "cızırtı"da kıvılcımlanır
    const pa = api.pop(t, telT - 0.15, 0.45);
    if (pa > 0) {
      pic(ctx, 'telefon', 175, 1735, 250 * pa, { ax: 0.5, ay: 0.99, rot: -0.04 });
      const cp = progress(t, telT + 0.1, telT + 0.7, ease.inOut);
      if (cp > 0 && foot) {
        const buzz = progress(t, czT - 0.2, czT + 0.1) * (1 - 0.3 * progress(t, czT + 1.0, czT + 1.5));
        cable(ctx, 255, 1722, foot[0] - 6, foot[1] + 22, { sag: 70, col: '#3a2a20', w: 9, prog: cp, buzz, t, seed: 4 });
      }
    }
    // başlık
    strip(ctx, 380, 2, 100);
    const czK = lerp(0.35, 1.25, progress(t, czT - 0.25, czT + 0.1));
    title(ctx, [
      [{ s: 'Karıncalanma:', k: t > tingT ? 0.35 : 0 }],
      [{ s: 'hattın ' }, { s: 'cızırtısı.', k: czK, mark: P.marker }],
    ], 84, 382, { size: 96, lead: 1.04, t, markProg: progress(t, czT - 0.1, czT + 0.35) });
    // başlığın altında karınca izi
    antSprites(ctx, [[-60, 538], [1140, 530]], t, tingT, { n: 8, speed: 260, gap: 150, w: 62, exit: true });
    tag(ctx, progress(t, s0 + 1.0, s0 + 1.3) * (p >= 1 ? 1 : 0));
    finish(ctx, t, { vig: 0.24 });
  };

  // 2 · Bağdaş: bacaktaki sinir, üstüne basılmış kablo gibi ezilir (mandal)
  draw['u-sikis'] = function (ctx, t, api) {
    const id = 'u-sikis';
    const s0 = api.S0(id);
    const sitT = W(api, id, 4); // ayağının
    const legT = W(api, id, 7); // bacağındaki
    const nerveT = W(api, id, 8); // sinir
    const pressT = W(api, id, 10); // basılmış
    const crushT = W(api, id, 14); // eziliyor
    cover(ctx, 'film');
    // Arkadaşın minderde bağdaş kurmuş; ayakları gittikçe uyuşur
    const AX = 610;
    const AY = 1840;
    const AW = 640;
    const nk = 0.85 * progress(t, pressT, crushT + 0.6);
    pic(ctx, 'ark_bagdas', AX, AY, AW, { ax: 0.5, ay: 0.99, numb: { k: nk, spots: [[0.42, 0.74, 0.17], [0.79, 0.74, 0.12]] } });
    // "ayağının üstüne oturduğunda": altta kalan ayak işaretlenir
    const [fx, fy] = at('ark_bagdas', AX, AY, AW, 0.5, 0.99, 0.42, 0.745);
    const ra = progress(t, sitT, sitT + 0.5);
    if (ra > 0) {
      L.ring(ctx, fx, fy, 120, 55, { color: RED, width: 6, prog: ra, seed: 21, t });
      note(ctx, 'altta kalan ayak', fx - 40, fy + 125, { size: 42, col: RED, rot: -0.04, prog: progress(t, sitT + 0.2, sitT + 0.9), card: true });
    }
    if (nk > 0.3) {
      for (let i = 0; i < 3; i++) {
        const u = ((t * 0.5 + i / 3) % 1);
        note(ctx, 'z', fx + 60 + i * 26 + u * 40, fy - 40 - u * 130, { size: 38 + i * 6, col: 'rgba(70,80,120,0.9)', a: Math.sin(Math.PI * u) * clamp((nk - 0.3) * 3), rot: -0.2 });
      }
    }
    // bacak şeması kartı
    const ca = api.pop(t, legT - 0.1, 0.45);
    const CX = 285;
    const CY = 930;
    if (ca > 0) {
      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(-0.04);
      ctx.scale(ca, ca);
      ctx.shadowColor = 'rgba(30,18,10,0.35)';
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#fbf6ea';
      ctx.fillRect(-190, -300, 380, 600);
      ctx.shadowColor = 'transparent';
      ctx.restore();
      pic(ctx, 'bacak', CX, CY + 10, 300 * ca, { rot: -0.04 });
      tape(ctx, CX, CY - 298 * ca, 130, 0.05, ca);
    }
    // sinir: Dymo etiket ve ok
    const NX = CX - 300 * 0.2 + 300 * 0.0;
    const nervePt = [CX - 45, CY - 110];
    const dp = dymoProg(t, nerveT - 0.1, 'SİNİR');
    if (dp > 0) {
      dymo(ctx, 'SİNİR', 640, 760, { col: BLACKD, size: 58, rot: 0.04, prog: dp });
      arrow(ctx, 560, 790, nervePt[0] + 30, nervePt[1] + 6, { bend: 0.25, seed: 41, t, width: 6, color: RED, prog: progress(t, nerveT + 0.15, nerveT + 0.5) });
      note(ctx, 'peroneal sinir', 640, 850, { size: 36, col: INK, rot: 0.03, align: 'center', prog: progress(t, nerveT + 0.3, nerveT + 0.9), card: true });
    }
    // mandal: üstten düşer, sinire kapanır
    const drop = progress(t, pressT - 0.25, pressT + 0.05, ease.in);
    if (drop > 0) {
      const bump = Math.exp(-(((t - pressT - 0.06) / 0.08) ** 2));
      const y = lerp(-400, 0, drop);
      const sq = 1 - 0.12 * bump - 0.04 * progress(t, crushT - 0.1, crushT + 0.2);
      pic(ctx, 'mandal', nervePt[0] - 4, nervePt[1] + y, 230, { ax: 0.14, ay: 0.62, rot: -0.42, sx: 1, sy: sq });
      if (t > pressT) {
        const k = 1 - progress(t, pressT + 0.6, pressT + 1.0);
        for (let i = 0; i < 5; i++) {
          const th = -0.5 + (i / 4) * Math.PI * 1.0 + Math.PI * 0.5;
          const r1 = 48 + bump * 12;
          ctx.save();
          ctx.strokeStyle = RED;
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.globalAlpha *= Math.max(k, 0.35);
          ctx.beginPath();
          ctx.moveTo(nervePt[0] + Math.cos(th) * r1, nervePt[1] + Math.sin(th) * r1);
          ctx.lineTo(nervePt[0] + Math.cos(th) * (r1 + 22), nervePt[1] + Math.sin(th) * (r1 + 22));
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    const bp = dymoProg(t, crushT - 0.15, 'BASKI');
    if (bp > 0) dymo(ctx, 'BASKI', 300, 1290, { col: RED, size: 64, rot: -0.06, prog: bp });
    // Lup sol altta anlatır
    lup(ctx, t, api, id, 170, 1885, 330, { face: t > pressT ? 'endise' : 'merak', arms: 'anlat', gx: 0.8, gy: -0.5 });
    // başlık
    strip(ctx, 380, 2, 100);
    const sq = progress(t, pressT, pressT + 0.15) * (1 - 0.15 * Math.exp(-(((t - pressT - 0.1) / 0.1) ** 2)));
    title(ctx, [
      [{ s: 'Bacaktaki sinir,' }],
      [{ s: 'kablo gibi ' }, { s: 'ezilir.', sq, mark: P.markerRed }],
    ], 84, 382, { size: 96, lead: 1.04, t, prog: progress(t, s0 + 0.05, s0 + 0.6), markProg: progress(t, crushT - 0.1, crushT + 0.3) });
    tag(ctx);
    finish(ctx, t, { vig: 0.24 });
  };

  // Santral ortak düzeni: Lup masada, kulaklıkla; "ayak" hattının jakı ve lambası
  const LX = 420;
  const LY = 1505;
  const LH = 560;
  function santral(ctx, t, { lamps = () => 0 } = {}) {
    cover(ctx, 'santral');
    for (let i = 0; i < LAMPS.length; i++) lamp(ctx, i, lamps(i));
    ayakLabel(ctx, t);
  }

  // 3 · Hat kesik: fiş jaktan fırlar, lamba söner; beyin duymaz; "sendeliyorsun"da Arkadaşın sendeler
  draw['u-sessiz'] = function (ctx, t, api) {
    const id = 'u-sessiz';
    const s0 = api.S0(id);
    const cutT = W(api, id, 1); // kesiliyor
    const footT = W(api, id, 2); // Ayağın
    const brainT = W(api, id, 6); // beynin
    const deafT = W(api, id, 8); // duymuyor
    const stepT = W(api, id, 9) - 0.12; // O yüzden → kesme
    const wobT = W(api, id, 13); // sendeliyorsun
    if (t < stepT) {
      santral(ctx, t, { lamps: (i) => (i === AYAK_LAMP ? (t < cutT ? 1 : -progress(t, cutT, cutT + 0.15)) : 0) });
      // fiş: jaktan fırlar, sallanarak asılı kalır
      const u = t - cutT;
      let px = JACK[0];
      let py = JACK[1];
      let ang = -Math.PI / 2;
      if (u > 0) {
        const d = ease.out(clamp(u / 0.35));
        const sw = 0.5 * Math.exp(-2.6 * u) * Math.cos(8 * u);
        px = lerp(JACK[0], HANG[0], d) + sw * 110;
        py = lerp(JACK[1], HANG[1], d) - Math.abs(sw) * 20;
        ang = lerp(-Math.PI / 2, Math.PI / 2 - 0.3, d) + sw;
      }
      cable(ctx, CABLE_FROM[0], CABLE_FROM[1], px, py + (u > 0 ? -20 : 40), { sag: u > 0 ? 60 : 110, t });
      plugFree(ctx, px, py, ang);
      if (u > 0 && u < 0.35) zap(ctx, JACK[0], JACK[1], 40, t, { n: 6, seed: 9, a: 1 - u / 0.35 });
      // Lup: şaşırır, sonra kulak verir
      const listen = progress(t, brainT - 0.1, brainT + 0.3, ease.inOut);
      lup(ctx, t, api, id, LX, LY, LH, {
        top: headset,
        face: t < cutT ? 'odak' : t < footT ? 'hayret' : t < deafT ? 'endise' : { brow: 'odak', open: 0.8, mouth: 'mbp', gy: -0.4, gx: 0.6 },
        gx: t < footT ? 0.9 : 0.5,
        gy: -0.6,
        arms: listen > 0 ? LUP.mix('goster', 'kulak', listen) : t > footT ? 'goster' : 'anlat',
      });
      telex(ctx, '· · · HAT KESİK · · · BAĞLANTI YOK · · ·', 1335, cutT + 0.15, t, { size: 34 });
    } else {
      // kısa kesme: film akşamı, Arkadaşın kalkmaya çalışır, sendeler
      const lt = t - stepT;
      cover(ctx, 'film');
      const amp = lerp(0.05, 0.11, progress(t, wobT - 0.1, wobT + 0.3));
      const rot = Math.sin(lt * 7.5) * amp;
      const AX = 520;
      const AY = 1855;
      pic(ctx, 'ark_kalk', AX, AY, 660, { ax: 0.47, ay: 0.99, rot, numb: { k: 0.85, spots: [[0.87, 0.86, 0.16]] } });
      dymo(ctx, 'SİNYAL YOK', 790, 1430, { col: RED, size: 50, rot: -0.08, prog: dymoProg(t, stepT + 0.15, 'SİNYAL YOK') });
    }
    strip(ctx, 520, 2, 92);
    title(ctx, [
      [{ s: 'Hat kesik:' }],
      [{ s: 'beyin ' }, { s: 'duymuyor.', numb: progress(t, deafT - 0.05, deafT + 0.4) }],
    ], 84, 520, { size: 90, lead: 1.02, t, prog: progress(t, s0 + 0.05, s0 + 0.6) });
    tag(ctx);
    finish(ctx, t, { vig: 0.24 });
  };

  // 4 · Hat açıldı: Lup fişi takar, lamba yanar; sinyal karmakarışık; telefondan karıncalar çıkar
  draw['u-hat'] = function (ctx, t, api) {
    const id = 'u-hat';
    const s0 = api.S0(id);
    const liftT = W(api, id, 1); // kalkınca
    const openT = W(api, id, 4); // açılıyor
    const butT = W(api, id, 5); // Ama
    const messT = W(api, id, 9); // karma
    const brainT = W(api, id, 13); // Beynin
    const antT = W(api, id, 15); // karınca
    const mess = progress(t, messT - 0.1, messT + 0.3) * (1 - 0.6 * progress(t, brainT + 0.6, brainT + 1.4));
    const f = Math.floor(t * 12);
    santral(ctx, t, {
      lamps: (i) => {
        if (t < openT) return i === AYAK_LAMP ? -1 : 0;
        if (mess > 0.05) return hash(i, f) < 0.5 ? mess : -mess * 0.8;
        return i === AYAK_LAMP ? 1 : 0;
      },
    });
    // fiş: asılı → Lup'un eli → jak
    const grab = progress(t, s0 + 0.05, liftT, ease.inOut);
    const carry = progress(t, liftT + 0.1, openT, ease.inOut);
    const R = lupR(LH);
    let tip;
    if (carry <= 0) tip = [HANG[0] + Math.sin(t * 3) * 6, HANG[1] - 36];
    else tip = [lerp(HANG[0], JACK[0], carry), lerp(HANG[1] - 36, JACK[1], carry) - Math.sin(Math.PI * carry) * 60];
    const plugged = t >= openT;
    const shake = mess > 0.05 ? Math.sin(t * 40) * 0.025 * mess : 0;
    const hopK = progress(t, brainT, brainT + 0.2) * (1 - progress(t, antT + 1.0, antT + 1.4));
    const dy = -Math.abs(Math.sin((t - brainT) * 9)) * 40 * hopK;
    const wrist = [tip[0], tip[1] + PLUG_UP * R];
    const handAt = armTo(LX, LY, LH, wrist[0], wrist[1], dy);
    const reachArm = { x: handAt.x, y: handAt.y, el: 'yumruk', d: [0.1, -1] };
    const rest = LUP.pose('anlat').r;
    let armR = rest;
    if (grab < 1 && carry <= 0) armR = LUP.mix({ r: rest }, { r: reachArm }, grab).r;
    else if (!plugged || t < openT + 0.45) armR = reachArm;
    else armR = LUP.mix({ r: reachArm }, { r: rest }, progress(t, openT + 0.45, openT + 0.85, ease.inOut)).r;
    const holding = grab >= 1 && !plugged;
    // kablo jaktan / elden
    const end = plugged ? [JACK[0], JACK[1] + 34] : holding ? [wrist[0], wrist[1] + 10] : [tip[0], tip[1] + 36];
    cable(ctx, CABLE_FROM[0], CABLE_FROM[1], end[0], end[1], { sag: plugged ? 150 : 70, t, buzz: mess, seed: 6 });
    if (plugged) plugFree(ctx, JACK[0], JACK[1] + 6, -Math.PI / 2);
    else if (!holding) plugFree(ctx, tip[0], tip[1] + 36, Math.PI / 2 - 0.25 + Math.sin(t * 3) * 0.05);
    // takıldı: kıvılcım
    const sp = progress(t, openT, openT + 0.4);
    if (sp > 0 && sp < 1) zap(ctx, JACK[0], JACK[1], 46, t, { n: 7, seed: 13, a: 1 - sp });
    if (mess > 0.05) zap(ctx, JACK[0], JACK[1], 40, t, { n: 4, seed: 15, a: mess });
    // telefondan karıncalar: beyin bunu karınca diye duyar
    const antPath = [[200, 1092], [228, 1160], [214, 1300], [236, 1430], [300, 1528], [980, 1540]];
    antSprites(ctx, antPath, t, brainT + 0.05, { n: 7, speed: 330, gap: 105, w: 104 });
    lup(ctx, t, api, id, LX, LY, LH, {
      top: headset,
      dy,
      tilt: shake,
      squash: hopK > 0 ? 0.08 * Math.sin((t - brainT) * 18) * hopK : 0,
      face: hopK > 0.2 ? (Math.floor(t * 4) % 2 ? 'gulum' : 'irkil') : mess > 0.3 ? 'irkil' : plugged ? 'mutlu' : 'odak',
      gx: hopK > 0.2 ? -0.9 : 0.7,
      gy: hopK > 0.2 ? 0.2 : -0.6,
      arms: { l: LUP.mix('anlat', { l: { x: -1.7, y: -0.5, el: 'acik', d: [-0.5, -1] } }, progress(t, brainT - 0.1, brainT + 0.25, ease.inOut)).l, r: armR },
      hold: holding ? { r: plugHold } : undefined,
    });
    if (hopK > 0.05) zap(ctx, LX, LY - 10 + dy, 60, t, { n: 6, seed: 19, a: hopK });
    telex(ctx, 'HAT AÇILDI · SİNYAL KARIŞIK · ÇITIRTI', 1335, butT, t, { size: 34, out: brainT });
    const na = progress(t, antT - 0.1, antT + 0.4);
    if (na > 0) note(ctx, 'karınca?!', 620, 1415, { size: 58, col: RED, rot: -0.06, prog: na, card: true });
    // başlık
    strip(ctx, 520, 2, 92);
    const kk = lerp(0.15, 1.15, progress(t, messT - 0.1, messT + 0.3));
    const all = 0.5 * progress(t, brainT, brainT + 0.3);
    title(ctx, [
      [{ s: 'Hat açıldı:', k: all }],
      [{ s: 'sinyal ', k: all }, { s: 'karışık.', k: Math.max(kk * (t > messT - 0.1 ? 1 : 0), all), mark: P.marker }],
    ], 84, 520, { size: 90, lead: 1.02, t, prog: progress(t, s0 + 0.05, s0 + 0.6), markProg: progress(t, messT, messT + 0.4) });
    antSprites(ctx, [[-60, 668], [1140, 660]], t, brainT + 0.2, { n: 8, speed: 300, gap: 150, w: 62, exit: true });
    tag(ctx);
    finish(ctx, t, { vig: 0.24 });
  };

  // 5 · Başka dillerde de karınca: üç hat, aynı ses
  draw['u-karinca'] = function (ctx, t, api) {
    const id = 'u-karinca';
    const s0 = api.S0(id);
    const frT = W(api, id, 0);
    const deT = W(api, id, 1);
    const trT = W(api, id, 3);
    const allT = W(api, id, 7); // hepimiz
    const warm = progress(t, allT - 0.1, allT + 0.4);
    santral(ctx, t, {
      lamps: (i) => {
        if (warm > 0) return 0.55 + 0.45 * warm * (0.75 + 0.25 * Math.sin(t * 5 + i));
        if (i === AYAK_LAMP) return 1;
        const g = Math.floor(i / 3);
        if (g === 0 && t > frT) return 1;
        if (g === 1 && t > deT) return 1;
        if (g === 3 && t > trT) return 1;
        return 0;
      },
    });
    cable(ctx, CABLE_FROM[0], CABLE_FROM[1], JACK[0], JACK[1] + 34, { sag: 150, t });
    plugFree(ctx, JACK[0], JACK[1] + 6, -Math.PI / 2);
    // üç bant
    const rows = [
      ['FOURMIS', RED, 'Fransızca', frT, 850],
      ['AMEISEN', BLACKD, 'Almanca', deT, 975],
      ['KARINCA', TEALD, 'Türkçe', trT, 1100],
    ];
    for (const [w, col, lang, t0, y] of rows) {
      const dp = dymoProg(t, t0, w);
      if (dp <= 0) continue;
      const bw = dymo(ctx, w, 90, y, { col, size: 66, rot: (hash(y, 3) - 0.5) * 0.05, prog: dp, align: 'left' });
      note(ctx, lang, 90 + bw + 34, y + 14, { size: 40, col: INK, rot: -0.03, prog: progress(t, t0 + 0.3, t0 + 0.8), card: true });
      antSprites(ctx, [[60, y - 30], [90 + bw + 40, y - 34]], t, trT + 0.1 + (y - 850) / 600, { n: 3, speed: 170, gap: 95, w: 56, exit: true });
    }
    lup(ctx, t, api, id, 820, LY, 500, {
      top: headset,
      face: t > allT ? 'mutlu' : 'gulum',
      gx: -0.8,
      gy: -0.4,
      arms: t < trT + 0.6 ? 'gosterSol' : 'anlat',
    });
    strip(ctx, 520, 2, 92);
    title(ctx, [
      [{ s: 'Aynı hat,' }],
      [{ s: 'aynı ' }, { s: 'karınca.', k: t > trT ? 0.45 : 0, mark: P.markerTeal }],
    ], 84, 520, { size: 90, lead: 1.02, t, prog: progress(t, s0 + 0.05, s0 + 0.6), markProg: progress(t, allT, allT + 0.4) });
    tag(ctx);
    finish(ctx, t, { vig: 0.24 });
  };

  // 6 · Arkadaşına gönder: Lup fişi fotoğrafa takar ("bağlandı"), sonra abone ol bandına basar
  draw['u-cta'] = function (ctx, t, api) {
    const id = 'u-cta';
    const { S0, end, fadeIn, pop } = api;
    const s0 = S0(id);
    const c1 = api.cue(id, 1);
    paper(ctx, t, { stains: [[120, 1760, 110, 91]] });
    title(ctx, [
      [{ s: 'Film izlerken' }],
      [{ s: 'bağdaş kuran' }],
      [{ s: 'arkadaşına' }],
      [{ s: 'gönder.', mark: P.marker }],
    ], 80, 330, { size: 84, lead: 1.05, t, prog: progress(t, s0 + 0.05, s0 + 0.8), markProg: progress(t, s0 + 0.7, s0 + 1.1), maxW: 560 });
    // fotoğraf: film akşamı, Arkadaşın bağdaş kurmuş
    const PX = 800;
    const PY = 600;
    const pa = pop(t, s0 + 0.15, 0.5);
    const socket = [PX + 8, PY + 232];
    if (pa > 0) {
      ctx.save();
      ctx.translate(PX, PY);
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
      ctx.drawImage(IMG.film, 170, 760, 700, 800, -140, -190, 280, 320);
      pic(ctx, 'ark_bagdas', 0, 128, 250, { ax: 0.5, ay: 0.99 });
      ctx.restore();
      note(ctx, 'film gecesi', 0, 182, { size: 38, col: 'rgba(42,28,20,0.7)', align: 'center', rot: -0.02 });
      tape(ctx, 0, -217, 140, -0.05);
      ctx.restore();
      jack(ctx, socket[0], socket[1]);
    }
    // Lup fişi fırlatır: kablo elinden fotoğrafın jakına
    const tap = end(id) + 0.35;
    const throwK = progress(t, s0 + 0.6, s0 + 0.9, ease.inOut);
    const back = progress(t, s0 + 1.3, s0 + 1.7, ease.inOut);
    const reach = progress(t, tap - 0.7, tap - 0.08, ease.inOut);
    const throwPose = { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.2, y: -1.25, el: 'acik', d: [0.2, -1] } };
    const windUp = { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.9, y: 0.6, el: 'yumruk', d: [1, 0.3] } };
    const tapPose = { l: { x: -2.15, y: 0.95, el: 'isaret', d: [-1, 0.2] }, r: { x: 1.4, y: 1.62, el: 'acik', d: [0.3, 1] } };
    let arms = LUP.mix(windUp, throwPose, throwK);
    if (back > 0) arms = LUP.mix(throwPose, 'anlat', back);
    if (reach > 0) arms = LUP.mix('anlat', tapPose, reach);
    const done = t > tap;
    const lx = 860;
    const ly = 1830;
    const lh = 560;
    const hopSt = LUP.hop(t, s0 + 0.05, { from: 300 });
    const [ccx, ccy] = lupC(lx, ly, lh, hopSt.dy);
    const R = lupR(lh);
    const hand = [ccx + 1.9 * R, ccy + 0.6 * R];
    // kablo: Lup'un arkasından gelir; fırlatılınca uç fotoğrafa uçar
    const fly = progress(t, s0 + 0.85, s0 + 1.35, ease.inOut);
    const connected = fly >= 1;
    if (fly > 0) {
      const ux = lerp(hand[0], socket[0], fly);
      const uy = lerp(hand[1], socket[1] + 40, fly) - Math.sin(Math.PI * fly) * 260;
      const cy2 = connected ? socket[1] + 98 : uy + 60;
      cable(ctx, 1110, 1600, connected ? socket[0] : ux, cy2, { sag: 120, t });
      if (!connected) plugFree(ctx, ux, uy, -Math.PI / 2 + (1 - fly) * 0.8);
      else plugFree(ctx, socket[0], socket[1] + 40, -Math.PI / 2);
    } else {
      cable(ctx, 1110, 1600, hand[0], hand[1] + 8, { sag: 80, t });
    }
    lup(ctx, t, api, id, lx, ly, lh, {
      ...hopSt,
      top: headset,
      face: done ? 'mutlu' : t > c1 ? 'gulum' : 'merak',
      gx: reach > 0 ? -0.9 : -0.3,
      gy: reach > 0 ? 0.4 : -0.6,
      arms,
      hold: fly <= 0 ? { r: plugHold } : undefined,
    });
    if (connected) {
      const ka = fadeIn(t, s0 + 1.35, 0.25);
      if (t < s0 + 1.75) zap(ctx, socket[0], socket[1], 40, t, { n: 6, seed: 23, a: 1 - progress(t, s0 + 1.45, s0 + 1.75) });
      note(ctx, 'bağlandı ✓', 470, 935, { size: 48, col: P.teal, rot: -0.03, prog: progress(t, s0 + 1.4, s0 + 1.9) });
      void ka;
    }
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
    note(ctx, "Lup'la bak.", 258, 1276, { size: 52, col: INK, a: wa, rot: -0.02 });
    // abone ol: Dymo bant; Lup basınca "ABONE OLUNDU"
    const ba = fadeIn(t, s0 + 1.1, 0.35);
    if (ba > 0) {
      const press = Math.exp(-(((t - tap) / 0.09) ** 2));
      const s = 1 - 0.06 * press;
      const w = dymo(ctx, done ? 'ABONE OLUNDU' : 'ABONE OL', 390, 1560, { col: done ? TEALD : RED, size: 70, rot: -0.02, a: ba, s });
      if (done) {
        ctx.save();
        ctx.strokeStyle = P.teal;
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const cx = 390 + (w * s) / 2 + 40;
        const k = clamp((t - tap) / 0.25);
        ctx.beginPath();
        ctx.moveTo(cx - 20, 1560);
        ctx.lineTo(cx - 20 + 16 * Math.min(1, k * 2), 1560 + 16 * Math.min(1, k * 2));
        if (k > 0.5) ctx.lineTo(cx - 4 + 30 * (k - 0.5) * 2, 1576 - 40 * (k - 0.5) * 2);
        ctx.stroke();
        ctx.restore();
        for (let i = 0; i < 10; i++) {
          const q2 = clamp((t - tap) / 0.9);
          if (q2 >= 1) continue;
          const th = (i / 10) * TAU;
          const d = 240 + q2 * 120;
          note(ctx, '+', 390 + Math.cos(th) * d, 1575 + Math.sin(th) * d * 0.4, { size: 40 * (1 - q2) + 10, col: [P.amber, P.teal, P.red][i % 3], align: 'center', rot: 0 });
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
    const punch = (t0, str, g = 0.07) => [...str].forEach((ch, i) => ch !== ' ' && m.click(t0 + i * PUNCH, { gain: g, tone: 1500 + (i % 3) * 180 }));
    const type = (t0, str, g = 0.06) => [...str].forEach((ch, i) => i % 2 === 0 && ch !== ' ' && m.typeKey(t0 + 0.2 + i * TYPE, { gain: g, pan: 0.2 }));
    const tingle = (t0, dur, g = 0.03) => {
      for (let i = 0; i < dur * 22; i++) m.tick(t0 + i / 22 + (hash(i, 5) - 0.5) * 0.03, { gain: g * (0.5 + hash(i, 6)), tone: 3500 + hash(i, 7) * 3000, pan: hash(i, 8) - 0.5 });
    };
    // 1 kanca
    const h = 'u-hook';
    const s1 = S0(h);
    bell(s1 + 0.15, 'E7', 0.07, 0.2);
    bell(s1 + 0.17, 'B7', 0.025, -0.2);
    m.whoosh(s1 + 0.45, { dur: 0.6, from: 700, to: 2600, gain: 0.05 });
    m.blip(W(api, h, 1), { freq: 330, dur: 0.6, slide: 0.55, gain: 0.035 });
    tingle(W(api, h, 4), 1.4, 0.035);
    for (let i = 0; i < 4; i++) m.pop(W(api, h, 4) + i * 0.37, { freq: 300 + i * 40, gain: 0.05 });
    m.pop(W(api, h, 7) - 0.15, { freq: hz('A5'), gain: 0.06 });
    [0, 0.06, 0.12, 0.18, 0.24, 0.3].forEach((d, i) => m.blip(W(api, h, 7) + 0.1 + d, { freq: i % 2 ? 1320 : 1180, dur: 0.05, gain: 0.018 }));
    m.staticNoise(W(api, h, 12) - 0.1, 0.9, { gain: 0.05 });
    m.crackle(W(api, h, 12) - 0.1, 0.8, { gain: 0.12, density: 30, roar: 0.1 });
    // 2 sıkışma
    const k2 = 'u-sikis';
    m.pop(W(api, k2, 7) - 0.1, { freq: hz('D5'), gain: 0.06 });
    punch(W(api, k2, 8) - 0.1, 'SİNİR');
    m.whoosh(W(api, k2, 10) - 0.25, { dur: 0.3, from: 2500, to: 600, gain: 0.04 });
    m.click(W(api, k2, 10) + 0.05, { gain: 0.26, tone: 900 });
    m.boom(W(api, k2, 10) + 0.05, { gain: 0.14, freq: 90 });
    m.wobble(W(api, k2, 14), 0.5, { gain: 0.06, freq: 150 });
    punch(W(api, k2, 14) - 0.15, 'BASKI');
    // 3 hat kesik
    const k3 = 'u-sessiz';
    m.pop(W(api, k3, 1), { freq: 700, gain: 0.1 });
    m.blip(W(api, k3, 1) + 0.05, { freq: 900, dur: 0.5, slide: 0.3, gain: 0.04 });
    type(W(api, k3, 1) + 0.15, '· · · HAT KESİK · · · BAĞLANTI YOK · · ·');
    m.blip(W(api, k3, 8), { freq: 520, dur: 0.7, slide: 0.5, gain: 0.03 });
    m.whoosh(W(api, k3, 9) - 0.15, { dur: 0.35, from: 900, to: 2400, gain: 0.04 });
    punch(W(api, k3, 9) + 0.03, 'SİNYAL YOK', 0.05);
    m.wobble(W(api, k3, 13), 0.7, { gain: 0.07, freq: 200 });
    // 4 hat açıldı
    const k4 = 'u-hat';
    m.riser(W(api, k4, 1), W(api, k4, 4) - W(api, k4, 1), { gain: 0.03 });
    m.click(W(api, k4, 4), { gain: 0.25, tone: 1200 });
    bell(W(api, k4, 4) + 0.02, 'A6', 0.06, 0.2);
    type(W(api, k4, 5), 'HAT AÇILDI · SİNYAL KARIŞIK · ÇITIRTI');
    m.staticNoise(W(api, k4, 9) - 0.1, 1.5, { gain: 0.05 });
    m.crackle(W(api, k4, 9) - 0.1, 1.4, { gain: 0.1, density: 34, roar: 0.1 });
    m.glitch(W(api, k4, 10), 0.4, { gain: 0.05 });
    tingle(W(api, k4, 13), 1.6, 0.04);
    for (let i = 0; i < 4; i++) m.pop(W(api, k4, 13) + i * 0.35, { freq: 380 + i * 50, gain: 0.05 });
    ['C6', 'E6', 'G6'].forEach((n, i) => bell(W(api, k4, 15) + i * 0.08, n, 0.035, -0.3 + i * 0.3));
    // 5 başka diller
    const k5 = 'u-karinca';
    punch(W(api, k5, 0), 'FOURMIS');
    punch(W(api, k5, 1), 'AMEISEN');
    punch(W(api, k5, 3), 'KARINCA');
    ['G5', 'B5', 'D6', 'G6'].forEach((n, i) => bell(W(api, k5, 7) + i * 0.1, n, 0.04, -0.3 + i * 0.2));
    // 6 kapanış
    const k6 = 'u-cta';
    const s6 = S0(k6);
    m.whoosh(s6 + 0.85, { dur: 0.5, from: 600, to: 2400, gain: 0.05, panFrom: 0.3, panTo: -0.1 });
    m.click(s6 + 1.35, { gain: 0.24, tone: 1200 });
    bell(s6 + 1.4, 'D7', 0.05, -0.1);
  }

  window.FILM = K.short({
    title: 'Ayağın uyuşması · YUP Akademi',
    series: 'VÜCUDUN GİZLİ AYARLARI',
    share: true,
    gap: 0.12,
    breath: 0.2,
    wipe: 0.45,
    transition: LUP.lensWipe,
    cut: ['u-karinca'],
    extra: { 'u-hook': 0.35, 'u-sikis': 0.4, 'u-sessiz': 0.4, 'u-hat': 0.45, 'u-karinca': 0.4, 'u-cta': 1.75 },
    lead: { 'u-hook': 0.1, 'u-sikis': 0.2, 'u-sessiz': 0.2, 'u-hat': 0.2, 'u-karinca': 0.15, 'u-cta': 0.3 },
    titles: {
      'u-hook': 'Karıncalanma',
      'u-sikis': 'Sıkışan sinir',
      'u-sessiz': 'Hat kesik',
      'u-hat': 'Hat açıldı',
      'u-karinca': 'Aynı karınca',
      'u-cta': 'Arkadaşına gönder',
    },
    chords: {
      'u-hook': ['D3', 'A3', 'F#4', 'B4'],
      'u-sikis': ['B2', 'F#3', 'D4', 'A4'],
      'u-sessiz': ['G2', 'D3', 'A#3', 'F4'],
      'u-hat': ['A2', 'E3', 'C#4', 'G#4'],
      'u-karinca': ['E3', 'B3', 'G#4', 'D5'],
      'u-cta': ['D3', 'A3', 'F#4', 'A4'],
    },
    draw,
    score,
  });
})();
