/*
 * YUP Akademi · "El yapımı" görsel dil (kısa videolar için editoryal katman).
 *
 * Şablon görüntüsünden (yuvarlak haplar, ortalanmış büyük harf başlıklar, kusursuz vektörler) kaçmak için:
 *   - kâğıt: sıcak kırık beyaz, ince gren, lif, noktalı defter ızgarası, kahve lekesi halkaları;
 *   - mürekkep: çizgiler saniyede 12 kez hafifçe titrer (elle çizilmiş canlı çizgi), dolgular baskı hatası gibi
 *     çizgiden birkaç piksel kayar, gölgeler tarama çizgileriyle yapılır;
 *   - yazı: başlık Fraunces (serif, cümle düzeni, sola yaslı), şekil notları IBM Plex Mono, kenar notları
 *     Patrick Hand (keçeli kalem); vurgu fosforlu kalem darbesi, el çizimi daire ve ok, lastik damga.
 * Yazı tipleri el-yazi.js'te gömülü (EL_FONTS_READY). Marka logosu ve kapanıştaki sözcük işareti Nunito kalır.
 */
(function (root) {
  'use strict';

  const E = root.Engine;
  const { clamp, lerp, ease, hash } = E;

  const P = {
    paper: '#f2eadc',
    paper2: '#e9dfcd',
    ink: '#2a1c14',
    ink2: 'rgba(42,28,20,0.62)',
    caramel: '#c47a35',
    coffee: '#6b3f22',
    crema: '#d9a066',
    red: '#d2452f',
    blue: '#4a73b8',
    blueWash: 'rgba(74,115,184,0.18)',
    teal: '#0f766e',
    tealWash: 'rgba(15,118,110,0.16)',
    amber: '#f2a516',
    marker: 'rgba(245,170,40,0.55)',
    markerRed: 'rgba(226,92,64,0.45)',
    markerBlue: 'rgba(90,140,220,0.38)',
    markerTeal: 'rgba(40,160,150,0.38)',
    skin: '#efc29b',
    skin2: '#d99d73',
    hair: '#2f2019',
    hood: '#3b5aa6',
  };
  const F = {
    serif: 'Fraunces, Georgia, "Times New Roman", serif',
    mono: '"IBM Plex Mono", "DejaVu Sans Mono", monospace',
    hand: '"Patrick Hand", "Comic Sans MS", cursive',
  };

  // Mürekkep titreşimi: saniyede 12 kare (çizgiler "on twos" kıpırdar)
  const boil = (t) => Math.floor(t * 12);

  // Noktalara titreşim ver (seed: şeklin kimliği, fr: titreşim karesi)
  function jitter(pts, seed, fr, amp) {
    return pts.map(([x, y], i) => [x + (hash(i * 13 + seed * 977, fr) - 0.5) * 2 * amp, y + (hash(i * 13 + seed * 977, fr + 5003) - 0.5) * 2 * amp]);
  }

  // Noktalardan yumuşak eğri
  function curvePath(ctx, pts, close = false) {
    const n = pts.length;
    if (n < 2) return;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    ctx.beginPath();
    if (close) {
      const m0 = mid(pts[n - 1], pts[0]);
      ctx.moveTo(m0[0], m0[1]);
      for (let i = 0; i < n; i++) {
        const m = mid(pts[i], pts[(i + 1) % n]);
        ctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
      }
      ctx.closePath();
    } else {
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < n - 1; i++) {
        const m = mid(pts[i], pts[i + 1]);
        ctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
      }
      ctx.lineTo(pts[n - 1][0], pts[n - 1][1]);
    }
  }

  // Mürekkep şekli: dolgu (kaymış baskı) + titreyen çizgi
  function ink(ctx, pts, o = {}) {
    const { close = true, width = 5, color = P.ink, fill = null, off = [6, 5], seed = 1, t = 0, amp = 1.3, a = 1, fillA = 1 } = o;
    if (a <= 0.002 || pts.length < 2) return;
    ctx.save();
    ctx.globalAlpha *= a;
    if (fill) {
      ctx.save();
      ctx.globalAlpha *= fillA;
      ctx.translate(off[0], off[1]);
      curvePath(ctx, pts, true);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.restore();
    }
    if (width > 0) {
      curvePath(ctx, jitter(pts, seed, boil(t), amp), close);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    ctx.restore();
  }

  // Düzensiz elips noktaları (elle çizilmiş daire)
  function blob(cx, cy, rx, ry, { n = 40, irr = 0.035, seed = 3, rot = 0, from = 0, to = 1 } = {}) {
    const pts = [];
    const m = Math.max(2, Math.round(n * (to - from)));
    for (let i = 0; i <= m; i++) {
      const th = (from + ((to - from) * i) / m) * Math.PI * 2 + rot;
      const k = 1 + irr * (Math.sin(th * 3 + seed) + 0.6 * Math.sin(th * 5 - seed * 2));
      pts.push([cx + Math.cos(th) * rx * k, cy + Math.sin(th) * ry * k]);
    }
    if (to - from >= 1) pts.pop();
    return pts;
  }

  // Bir yolu ilerlemeye göre kes (çizilerek belirsin)
  function partial(pts, prog) {
    if (prog >= 1) return pts;
    const n = Math.max(2, Math.ceil(pts.length * clamp(prog)));
    return pts.slice(0, n);
  }

  // Tarama (gölge): şeklin içine paralel çizgiler
  function hatch(ctx, pts, { angle = -0.8, gap = 11, width = 2.2, color = P.ink2, seed = 1, t = 0, a = 1 } = {}) {
    if (a <= 0.002) return;
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    const y0 = Math.min(...ys);
    const y1 = Math.max(...ys);
    const d = Math.hypot(x1 - x0, y1 - y0);
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    ctx.save();
    ctx.globalAlpha *= a;
    curvePath(ctx, pts, true);
    ctx.clip();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    const fr = boil(t);
    for (let k = -d; k <= d; k += gap) {
      const j = (hash(k + seed * 31, fr) - 0.5) * 2;
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);
      const px = cx - sa * k;
      const py = cy + ca * k;
      ctx.beginPath();
      ctx.moveTo(px - ca * d + j, py - sa * d);
      ctx.lineTo(px + ca * d, py + sa * d + j);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Fosforlu kalem darbesi (yazının arkasına)
  function swash(ctx, x, y, w, h, color, prog = 1, seed = 1) {
    if (prog <= 0.002) return;
    const ww = w * clamp(prog);
    const top = [];
    const bot = [];
    const n = Math.max(3, Math.round(ww / 40));
    for (let i = 0; i <= n; i++) {
      const px = x + (ww * i) / n;
      top.push([px, y + (hash(i, seed) - 0.5) * h * 0.22 - Math.sin((i / n) * Math.PI) * h * 0.06]);
      bot.push([px, y + h + (hash(i, seed + 7) - 0.5) * h * 0.22]);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = color;
    ctx.beginPath();
    top.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.quadraticCurveTo(x + ww + h * 0.25, y + h * 0.5, bot[bot.length - 1][0], bot[bot.length - 1][1]);
    for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1]);
    ctx.quadraticCurveTo(x - h * 0.2, y + h * 0.5, top[0][0], top[0][1]);
    ctx.fill();
    ctx.restore();
  }

  // El çizimi ok (çizilerek belirir)
  function arrow(ctx, x1, y1, x2, y2, { bend = 0.25, color = P.ink, width = 4.5, prog = 1, seed = 2, t = 0, head = 22 } = {}) {
    if (prog <= 0.002) return;
    const mx = (x1 + x2) / 2 - (y2 - y1) * bend;
    const my = (y1 + y2) / 2 + (x2 - x1) * bend;
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24;
      pts.push([(1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * mx + u * u * x2, (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * my + u * u * y2]);
    }
    const sub = partial(pts, prog);
    ink(ctx, sub, { close: false, width, color, seed, t, amp: 1.1 });
    if (prog >= 0.98) {
      const [ex, ey] = pts[pts.length - 1];
      const [px, py] = pts[pts.length - 3];
      const ang = Math.atan2(ey - py, ex - px);
      const h1 = [ex - Math.cos(ang - 0.5) * head, ey - Math.sin(ang - 0.5) * head];
      const h2 = [ex - Math.cos(ang + 0.5) * head, ey - Math.sin(ang + 0.5) * head];
      ink(ctx, [h1, [ex, ey], h2], { close: false, width, color, seed: seed + 9, t, amp: 0.8 });
    }
  }

  // El çizimi daire (bir sözcüğü ya da noktayı işaretler); iki tur, uçları taşar
  function ring(ctx, cx, cy, rx, ry, { color = P.red, width = 5, prog = 1, seed = 4, t = 0 } = {}) {
    if (prog <= 0.002) return;
    const pts = blob(cx, cy, rx, ry, { n: 60, irr: 0.05, seed, rot: -1.2, from: 0, to: 1.12 });
    ink(ctx, partial(pts, prog), { close: false, width, color, seed, t, amp: 1 });
  }

  // Karalayarak üstünü çiz
  function scratch(ctx, cx, cy, w, h, { color = P.red, width = 7, prog = 1, seed = 5, t = 0 } = {}) {
    if (prog <= 0.002) return;
    const pts = [];
    for (let i = 0; i <= 7; i++) pts.push([cx - w / 2 + (w * i) / 7, cy + (i % 2 ? -h / 2 : h / 2) + (hash(i, seed) - 0.5) * 10]);
    ink(ctx, partial(pts, prog), { close: false, width, color, seed, t, amp: 1.5 });
  }

  // Çetele: n çizgi, beşte bir çapraz
  function tally(ctx, x, y, n, { h = 64, gap = 18, color = P.ink, width = 5, t = 0 } = {}) {
    let cx = x;
    for (let i = 0; i < n; i++) {
      const g = Math.floor(i / 5);
      const k = i % 5;
      if (k === 4) {
        const x0 = cx - 4 * gap - 10;
        ink(ctx, [[x0, y + h * 0.75], [cx + 6, y + h * 0.15]], { close: false, width, color, seed: 700 + i, t, amp: 1 });
        cx += gap * 1.6;
      } else {
        ink(ctx, [[cx, y], [cx + 3, y + h]], { close: false, width, color, seed: 600 + i + g, t, amp: 1 });
        cx += gap;
      }
    }
    return cx;
  }

  // Yazılar
  function serif(ctx, str, x, y, o = {}) {
    return E.text(ctx, str, x, y, { family: F.serif, weight: o.weight ?? 800, size: o.size ?? 96, color: o.color ?? P.ink, align: o.align ?? 'left', baseline: o.baseline ?? 'alphabetic', italic: o.italic, alpha: o.alpha, spacing: o.spacing ?? -1 });
  }
  function mono(ctx, str, x, y, o = {}) {
    return E.text(ctx, str, x, y, { family: F.mono, weight: o.weight ?? 600, size: o.size ?? 26, color: o.color ?? P.ink2, align: o.align ?? 'left', baseline: o.baseline ?? 'alphabetic', alpha: o.alpha, spacing: o.spacing ?? 3 });
  }
  function hand(ctx, str, x, y, o = {}) {
    if ((o.alpha ?? 1) <= 0.002) return 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(o.rot ?? -0.03);
    const w = E.text(ctx, str, 0, 0, { family: F.hand, weight: 400, size: o.size ?? 54, color: o.color ?? P.ink, align: o.align ?? 'left', baseline: 'alphabetic', alpha: o.alpha });
    ctx.restore();
    return w;
  }
  const measureSerif = (ctx, str, size, o = {}) => E.measure(ctx, str, { family: F.serif, weight: o.weight ?? 800, size, italic: o.italic, spacing: o.spacing ?? -1 });

  // Başlık: satırlar = [[{ s, c, mark, italic }...], ...]; sola yaslı, satır satır yukarı kayarak gelir.
  // mark: fosforlu kalem rengi (yazının arkasında, markProg ile çizilir)
  function headline(ctx, lines, x, y, { size = 112, lead = 1.0, prog = 1, markProg = 1, a = 1, seed = 11 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    lines.forEach((parts, li) => {
      const lp = clamp(prog * lines.length * 1.4 - li * 0.9);
      if (lp <= 0) return;
      const yy = y + li * size * lead + (1 - ease.out(lp)) * size * 0.35;
      let cx = x;
      const ws = parts.map((p) => measureSerif(ctx, p.s, size, { italic: p.italic }));
      parts.forEach((p, i) => {
        if (p.mark) swash(ctx, cx - size * 0.06, yy - size * 0.36, ws[i] + size * 0.12, size * 0.42, p.mark, markProg, seed + li * 5 + i);
        cx += ws[i];
      });
      cx = x;
      parts.forEach((p, i) => {
        serif(ctx, p.s, cx, yy, { size, color: p.c ?? P.ink, italic: p.italic, weight: p.italic ? 700 : 800, alpha: ease.out(lp) });
        cx += ws[i];
      });
    });
    ctx.restore();
  }

  // Kâğıt dokusu (bir kez üretilir)
  let TILE = null;
  function paperTile() {
    if (TILE) return TILE;
    const n = 512;
    const cv = document.createElement('canvas');
    cv.width = cv.height = n;
    const g = cv.getContext('2d');
    const im = g.createImageData(n, n);
    const base = [242, 234, 220];
    for (let i = 0; i < n * n; i++) {
      const v = (hash(i, 17) - 0.5) * 9 + (hash(i >> 3, 18) - 0.5) * 5;
      im.data[i * 4] = base[0] + v;
      im.data[i * 4 + 1] = base[1] + v;
      im.data[i * 4 + 2] = base[2] + v * 1.1;
      im.data[i * 4 + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    // lifler
    g.lineCap = 'round';
    for (let i = 0; i < 260; i++) {
      const x = hash(i, 21) * n;
      const y = hash(i, 22) * n;
      const a = hash(i, 23) * Math.PI;
      const l = 6 + hash(i, 24) * 22;
      g.strokeStyle = `rgba(${hash(i, 25) > 0.5 ? '120,95,70' : '255,255,255'},${0.08 + hash(i, 26) * 0.08})`;
      g.lineWidth = 0.8 + hash(i, 27);
      for (const ox of [-n, 0, n]) {
        for (const oy of [-n, 0, n]) {
          g.beginPath();
          g.moveTo(x + ox, y + oy);
          g.quadraticCurveTo(x + ox + Math.cos(a) * l * 0.5 + 3, y + oy + Math.sin(a) * l * 0.5, x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l);
          g.stroke();
        }
      }
    }
    TILE = cv;
    return cv;
  }

  // Kahve lekesi halkası (önceden çizilip saklanır)
  const STAIN = {};
  function stainCanvas(seed, r) {
    const key = seed + ':' + r;
    if (STAIN[key]) return STAIN[key];
    const s = Math.ceil(r * 2.6);
    const cv = document.createElement('canvas');
    cv.width = cv.height = s;
    const g = cv.getContext('2d');
    const c = s / 2;
    // iç yıkama
    const gr = g.createRadialGradient(c, c, r * 0.2, c, c, r);
    gr.addColorStop(0, 'rgba(160,100,50,0.03)');
    gr.addColorStop(0.85, 'rgba(160,100,50,0.07)');
    gr.addColorStop(1, 'rgba(160,100,50,0)');
    g.fillStyle = gr;
    g.beginPath();
    g.arc(c, c, r, 0, Math.PI * 2);
    g.fill();
    // kenar halkaları (kahve kuruyunca kenarda toplanır)
    for (let k = 0; k < 5; k++) {
      const pts = blob(c, c, r * (0.97 + k * 0.012), r * (0.95 + k * 0.014), { n: 90, irr: 0.02 + k * 0.004, seed: seed * 7 + k });
      g.strokeStyle = `rgba(140,85,40,${0.07 + 0.03 * (k === 1)})`;
      g.lineWidth = 3 + k * 1.6;
      curvePath(g, pts, k < 4 || hash(seed, 9) > 0.4);
      g.stroke();
    }
    // birkaç damla
    for (let i = 0; i < 6; i++) {
      const th = hash(i, seed + 40) * Math.PI * 2;
      const d = r * (1.08 + hash(i, seed + 41) * 0.2);
      g.fillStyle = 'rgba(150,90,45,0.10)';
      g.beginPath();
      g.arc(c + Math.cos(th) * d, c + Math.sin(th) * d, 2 + hash(i, seed + 42) * 6, 0, Math.PI * 2);
      g.fill();
    }
    STAIN[key] = cv;
    return cv;
  }

  // Zemin: kâğıt + noktalı defter ızgarası + kahve lekeleri
  function paper(ctx, t, { stains = [], grid = true, tone = 0 } = {}) {
    ctx.save();
    ctx.fillStyle = ctx.createPattern(paperTile(), 'repeat');
    ctx.fillRect(0, 0, 1080, 1920);
    if (tone) {
      ctx.fillStyle = `rgba(120,80,40,${tone})`;
      ctx.fillRect(0, 0, 1080, 1920);
    }
    if (grid) {
      ctx.fillStyle = 'rgba(42,28,20,0.09)';
      for (let y = 36; y < 1920; y += 54) for (let x = 27; x < 1080; x += 54) ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }
    for (const [x, y, r, seed] of stains) {
      const cv = stainCanvas(seed, r);
      ctx.drawImage(cv, x - cv.width / 2, y - cv.height / 2);
    }
    ctx.restore();
  }

  // Yapışkan not (köşesi hafif kalkık, gölgeli)
  function sticky(ctx, x, y, w, h, { rot = 0.04, color = '#f7d46b', a = 1 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.shadowColor = 'rgba(60,40,20,0.25)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, h - 26);
    ctx.quadraticCurveTo(w - 6, h - 4, w - 30, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = 'transparent';
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0.18)');
    g.addColorStop(1, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  // Yarı saydam bant parçası
  function tape(ctx, x, y, w, rot = 0, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = 'rgba(245,238,215,0.62)';
    ctx.beginPath();
    ctx.moveTo(-w / 2, -18);
    for (let i = 0; i <= 6; i++) ctx.lineTo(-w / 2 + (w * i) / 6, -18 + (i % 2 ? -2 : 2));
    ctx.lineTo(w / 2, 18);
    for (let i = 6; i >= 0; i--) ctx.lineTo(-w / 2 + (w * i) / 6, 18 + (i % 2 ? 2 : -2));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(160,140,100,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  // Lastik damga: aşınmış mürekkep (önceden çizilir), basılırken büyükten küçülür
  const STAMP = {};
  function stampCanvas(str, color, size) {
    const key = str + color + size;
    if (STAMP[key]) return STAMP[key];
    const g0 = document.createElement('canvas').getContext('2d');
    g0.font = `600 ${size}px ${F.mono}`;
    const tw = g0.measureText(str).width + str.length * size * 0.12;
    const w = Math.ceil(tw + size * 1.4);
    const h = Math.ceil(size * 1.9);
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const g = cv.getContext('2d');
    g.strokeStyle = color;
    g.fillStyle = color;
    g.lineWidth = size * 0.11;
    g.strokeRect(size * 0.12, size * 0.12, w - size * 0.24, h - size * 0.24);
    g.lineWidth = size * 0.04;
    g.strokeRect(size * 0.3, size * 0.3, w - size * 0.6, h - size * 0.6);
    E.text(g, str, w / 2, h / 2 + size * 0.04, { family: F.mono, weight: 600, size, color, spacing: size * 0.12 });
    // aşınma: rastgele lekeler sil
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < (w * h) / 90; i++) {
      const r = hash(i, 51) < 0.92 ? 0.6 + hash(i, 52) * 1.4 : 2 + hash(i, 53) * 4;
      g.fillStyle = `rgba(0,0,0,${0.5 + hash(i, 54) * 0.5})`;
      g.beginPath();
      g.arc(hash(i, 55) * w, hash(i, 56) * h, r, 0, Math.PI * 2);
      g.fill();
    }
    STAMP[key] = cv;
    return cv;
  }
  function rubber(ctx, str, x, y, t0, t, { color = P.red, size = 46, rot = -0.12 } = {}) {
    if (t < t0) return;
    const p = clamp((t - t0) / 0.22);
    const s = lerp(1.7, 1, ease.out(p));
    const cv = stampCanvas(str, color, size);
    ctx.save();
    ctx.globalAlpha *= clamp(p * 2) * 0.88;
    ctx.globalCompositeOperation = 'multiply';
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.drawImage(cv, -cv.width / 2, -cv.height / 2);
    ctx.restore();
  }

  // El çizimi konuşma balonu. jag: tırtıklı (öfke) balon
  function speech(ctx, x, y, w, h, { s = 1, tail = [-0.3, 1], jag = false, fill = '#fffaf0', t = 0, seed = 8 } = {}) {
    if (s <= 0.01) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    let pts;
    if (jag) {
      pts = [];
      const n = 22;
      for (let i = 0; i < n; i++) {
        const th = (i / n) * Math.PI * 2;
        const k = i % 2 ? 0.78 : 1.08;
        pts.push([Math.cos(th) * (w / 2) * k, Math.sin(th) * (h / 2) * k]);
      }
    } else {
      pts = blob(0, 0, w / 2, h / 2, { n: 40, irr: 0.03, seed });
      // kuyruk
      const tx = tail[0] * w * 0.5;
      const ty = tail[1] * h * 0.5;
      const idx = pts.reduce((bi, p, i) => (Math.hypot(p[0] - tx, p[1] - ty) < Math.hypot(pts[bi][0] - tx, pts[bi][1] - ty) ? i : bi), 0);
      pts.splice(idx, 1, [pts[idx][0] - 14, pts[idx][1]], [tx * 1.35, ty * 1.45], [pts[idx][0] + 14, pts[idx][1]]);
    }
    ink(ctx, pts, { fill, off: [0, 0], width: 5, seed, t, amp: 1 });
    ctx.restore();
  }

  // Son dokunuş: sıcak vinyet ve film greni
  let GR = null;
  function finish(ctx, t, { vig = 0.28, grain = 0.06 } = {}) {
    const g = ctx.createRadialGradient(540, 900, 420, 540, 960, 1250);
    g.addColorStop(0, 'rgba(60,35,15,0)');
    g.addColorStop(1, `rgba(60,35,15,${vig})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1920);
    if (!GR) {
      GR = document.createElement('canvas');
      GR.width = GR.height = 256;
      const gg = GR.getContext('2d');
      const im = gg.createImageData(256, 256);
      for (let i = 0; i < 256 * 256; i++) {
        const v = (hash(i, 991) * 255) | 0;
        im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v;
        im.data[i * 4 + 3] = 255;
      }
      gg.putImageData(im, 0, 0);
    }
    ctx.save();
    ctx.globalAlpha = grain;
    ctx.globalCompositeOperation = 'overlay';
    const f = boil(t * 2);
    ctx.translate(-((hash(f, 3) * 256) | 0), -((hash(f, 4) * 256) | 0));
    ctx.fillStyle = ctx.createPattern(GR, 'repeat');
    ctx.fillRect(0, 0, 1080 + 256, 1920 + 256);
    ctx.restore();
  }

  root.YupEl = {
    P, F, boil, jitter, curvePath, ink, blob, partial, hatch, swash, arrow, ring, scratch, tally,
    serif, mono, hand, measureSerif, headline, paper, sticky, tape, rubber, speech, finish,
  };
})(window);
