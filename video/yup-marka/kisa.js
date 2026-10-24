/*
 * YUP Akademi markalı dikey kısa videolar (YouTube Shorts, 1080×1920) için ortak motor.
 * Marka dili: krem zemin, köşelerde organik lekeler, yuvarlak kartlar; palet #0F766E #2E7D5B #6EC1C9 #F59E0B
 * #1E3A8A; yazı Nunito (başlık) ve Caveat (el yazısı). Logo ve yazı tipleri marka.js'ten gelir.
 *
 * YupKisa.short(def) bir film kurar: her seslendirme satırı bir sahnedir. Kayıt yokken süreler harf sayısından
 * tahmin edilir; kayıt gelince (voice.js) sahneler satır sürelerine göre kurulur (narrate.mjs iki kez).
 *   def.series   sol üstteki seri etiketi (ör. 'EFSANE Mİ, GERÇEK Mİ?')
 *   def.extra    { satır: sn }  satırdan sonra görüntünün kalacağı süre
 *   def.lead     { satır: sn }  satırın sahne başından gecikmesi
 *   def.titles   { satır: ad }  sahne adı (bölüm zamanları için)
 *   def.draw     { satır: (ctx, t, api) => {} }  sahne çizimi (zemin dahil)
 *   def.cut      [satır, ...]   bu satırlara daire açılışla değil, kesintisiz geçilir (önceki sahne devam eder)
 *   def.chords   { satır: [nota, ...] }  sahnenin yatak akoru
 *   def.score    (m, hz, api) => {}  sahneye özgü efektler
 * Son satır her zaman kapanıştır: api.cta(ctx, t, { invite }) logo, el yazısı slogan ve "abone ol" düğmesini çizer;
 * invite verilirse üstte yorum çağrısı kartı çıkar. Kapanışın sesleri otomatik eklenir.
 * Örnek: video/kisa-islak-sac/film.js
 */
(function (root) {
  'use strict';

  const E = root.Engine;
  const { clamp, lerp, ease, progress, hash } = E;
  const SW = 1080;
  const SH = 1920;

  const C = {
    teal: '#0f766e',
    tealDeep: '#0b5a54',
    tealSoft: '#d7ece8',
    green: '#2e7d5b',
    greenSoft: '#dcefe4',
    cyan: '#6ec1c9',
    cyanSoft: '#dff1f2',
    amber: '#f59e0b',
    amberSoft: '#fde7b8',
    navy: '#1e3a8a',
    night: '#13245a',
    nightDeep: '#0b1638',
    cream: '#f7f3ea',
    paper: '#fffdf8',
    ink: '#123b3a',
    muted: '#5f7471',
    grey: '#8a96b0',
    skin: '#f2c6a0',
    blush: '#ef9a8a',
    line: '#d9d2c3',
  };
  const AMBER = [245, 158, 11];
  const CYAN = [110, 193, 201];
  const NUN = 'Nunito, "Inter", sans-serif';
  const HAND = 'Caveat, Nunito, cursive';

  // Yazı: Nunito (o.hand → Caveat)
  const T = (ctx, str, x, y, o = {}) => E.text(ctx, str, x, y, { family: o.hand ? HAND : NUN, weight: o.weight ?? 800, color: C.ink, ...o });
  const M = (ctx, str, o = {}) => E.measure(ctx, str, { family: o.hand ? HAND : NUN, weight: o.weight ?? 800, ...o });

  // Logo ve yazı tipleri hazır olmadan oynatıcı başlamaz (araçlar marka.js olmadan da yükleyebilir)
  const L = root.YUP_LOGO ?? { src: '', w: 1, h: 1, box: [0, 0, 2000] };
  const LOGO = new Image();
  if (L.src) LOGO.src = L.src;
  root.FILM_READY = Promise.all([LOGO.decode ? LOGO.decode().catch(() => {}) : Promise.resolve(), root.YUP_FONTS_READY ?? Promise.resolve()]);

  // ---------------------------------------------------------------------------
  // Çizim yardımcıları
  // ---------------------------------------------------------------------------
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  function shadowed(ctx, fn, { blur = 30, oy = 12, color = 'rgba(18,59,58,0.16)' } = {}) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetY = oy;
    fn();
    ctx.restore();
  }

  function card(ctx, x, y, w, h, { r = 40, fill = C.paper, a = 1, shadow = true, stroke = null } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const paint = () => {
      rr(ctx, x, y, w, h, r);
      ctx.fillStyle = fill;
      ctx.fill();
    };
    if (shadow) shadowed(ctx, paint);
    else paint();
    if (stroke) {
      rr(ctx, x, y, w, h, r);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
  }

  function pill(ctx, str, cx, cy, { size = 30, fill = C.teal, color = '#fff', a = 1, padX = 28, h = null, weight = 900, spacing = 2, scale = 1, icon = null } = {}) {
    if (a <= 0.002) return;
    const iw = icon ? size * 1.15 : 0;
    const w = M(ctx, str, { size, weight, spacing }) + padX * 2 + iw;
    const hh = h ?? size * 1.9;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    rr(ctx, -w / 2, -hh / 2, w, hh, hh / 2);
    ctx.fillStyle = fill;
    ctx.fill();
    if (icon) icon(ctx, -w / 2 + padX + iw / 2 - 4, 0, size * 0.9, color);
    T(ctx, str, iw / 2, 2, { size, weight, color, spacing });
    ctx.restore();
    return w;
  }

  function line(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function dot(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Organik leke (marka köşeleri): gürültüyle bükülmüş daire
  function blob(ctx, cx, cy, r, color, t, seed = 0, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = color;
    ctx.beginPath();
    const N = 40;
    const pts = [];
    for (let i = 0; i < N; i++) {
      const th = (i / N) * Math.PI * 2;
      const k = 1 + 0.07 * Math.sin(3 * th + seed + t * 0.35) + 0.05 * Math.sin(5 * th - seed * 2 + t * 0.22);
      pts.push([cx + Math.cos(th) * r * k, cy + Math.sin(th) * r * k]);
    }
    for (let i = 0; i <= N; i++) {
      const p = pts[i % N];
      const q = pts[(i + 1) % N];
      const mx = (p[0] + q[0]) / 2;
      const my = (p[1] + q[1]) / 2;
      if (i === 0) ctx.moveTo(mx, my);
      else ctx.quadraticCurveTo(p[0], p[1], mx, my);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function background(ctx) {
    ctx.fillStyle = C.cream;
    ctx.fillRect(0, 0, SW, SH);
  }

  function dayBg(ctx, t) {
    background(ctx);
    // kâğıt dokusu: çok hafif noktalar
    ctx.fillStyle = 'rgba(18,59,58,0.025)';
    for (let i = 0; i < 140; i++) dot(ctx, hash(i, 11) * SW, hash(i, 12) * SH, 1.5 + hash(i, 13) * 2.5);
    blob(ctx, SW + 30, 40, 250, C.teal, t, 1);
    blob(ctx, SW + 20, 420, 105, C.amber, t, 2);
    blob(ctx, -110, SH - 60, 290, C.teal, t, 3);
    ctx.save();
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-110, SH - 60, 370, -Math.PI * 0.42, -Math.PI * 0.05);
    ctx.stroke();
    ctx.restore();
    blob(ctx, -30, 300, 60, C.green, t, 4, 0.9);
  }

  // Uygulama simgesi: teal yuvarlak kare + beyaz sembol. reveal: sembol alttan (sapından) yukarı büyür
  function appIcon(ctx, cx, cy, size, { a = 1, reveal = 1, shine = -1 } = {}) {
    if (a <= 0.002) return;
    const k = size / 2000;
    ctx.save();
    ctx.globalAlpha *= a;
    const x = cx - size / 2;
    const y = cy - size / 2;
    shadowed(ctx, () => {
      rr(ctx, x, y, size, size, size * 0.16);
      ctx.fillStyle = C.teal;
      ctx.fill();
    }, { blur: size * 0.12, oy: size * 0.05, color: 'rgba(11,90,84,0.28)' });
    if (reveal > 0) {
      ctx.save();
      const sy = y + L.box[1] * k;
      const sh = L.h * k;
      rr(ctx, x, y, size, size, size * 0.16);
      ctx.clip();
      ctx.beginPath();
      ctx.rect(x, sy + sh * (1 - reveal) - 2, size, sh * reveal + 4);
      ctx.clip();
      ctx.drawImage(LOGO, x + L.box[0] * k, sy, L.w * k, sh);
      ctx.restore();
    }
    if (shine >= 0 && shine <= 1) {
      ctx.save();
      rr(ctx, x, y, size, size, size * 0.16);
      ctx.clip();
      const sx = x - size * 0.6 + shine * size * 2.2;
      const g = ctx.createLinearGradient(sx - size * 0.25, 0, sx + size * 0.25, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, 'rgba(255,255,255,0.35)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.transform(1, 0, -0.35, 1, 0, 0);
      ctx.fillRect(sx - size * 0.25 + size * 0.35, y, size * 0.5, size);
      ctx.restore();
    }
    ctx.restore();
  }

  // ---- Simgeler ----
  function sunIcon(ctx, x, y, r, t, { a = 1, rays = 1, color = C.amber } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    E.glow(ctx, x, y, r * 2.6, AMBER, 0.35);
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineWidth = r * 0.16;
    for (let i = 0; i < 12; i++) {
      const th = (i / 12) * Math.PI * 2 + t * 0.25;
      const l1 = r * 1.3;
      const l2 = r * (1.3 + 0.38 * rays * (i % 2 ? 0.7 : 1));
      line(ctx, x + Math.cos(th) * l1, y + Math.sin(th) * l1, x + Math.cos(th) * l2, y + Math.sin(th) * l2);
    }
    ctx.fillStyle = color;
    dot(ctx, x, y, r);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    dot(ctx, x - r * 0.3, y - r * 0.3, r * 0.35);
    ctx.restore();
  }

  function moonIcon(ctx, x, y, r, { a = 1, color = '#fdf3d7' } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.moveTo(x + r * 0.45 + r * 0.85, y - r * 0.3);
    ctx.arc(x + r * 0.45, y - r * 0.3, r * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill('evenodd');
    ctx.restore();
  }

  function star(ctx, x, y, r, a = 1, color = '#fdf3d7') {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const th = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const rr2 = i % 2 ? r * 0.38 : r;
      ctx.lineTo(x + Math.cos(th) * rr2, y + Math.sin(th) * rr2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function lockIcon(ctx, x, y, s, { a = 1, color = '#fff', bg = C.teal } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s / 100, s / 100);
    ctx.fillStyle = bg;
    dot(ctx, 0, 0, 50);
    ctx.strokeStyle = color;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(0, -8, 16, Math.PI, 0);
    ctx.lineTo(16, 2);
    ctx.moveTo(-16, 2);
    ctx.lineTo(-16, -8);
    ctx.stroke();
    ctx.fillStyle = color;
    rr(ctx, -24, 0, 48, 34, 8);
    ctx.fill();
    ctx.fillStyle = bg;
    dot(ctx, 0, 14, 5);
    ctx.restore();
  }

  function checkBadge(ctx, x, y, r, { a = 1, s = 1, fill = C.amber, color = '#fff', cross = false } = {}) {
    if (a <= 0.002 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    shadowed(ctx, () => {
      ctx.fillStyle = fill;
      dot(ctx, 0, 0, r);
    }, { blur: 16, oy: 6 });
    ctx.strokeStyle = color;
    ctx.lineWidth = r * 0.22;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (cross) {
      ctx.moveTo(-r * 0.36, -r * 0.36);
      ctx.lineTo(r * 0.36, r * 0.36);
      ctx.moveTo(r * 0.36, -r * 0.36);
      ctx.lineTo(-r * 0.36, r * 0.36);
    } else {
      ctx.moveTo(-r * 0.45, 0);
      ctx.lineTo(-r * 0.12, r * 0.33);
      ctx.lineTo(r * 0.48, -r * 0.35);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Analog saat. tm: dakika cinsinden saat (ör. 180 = 03:00)
  function clockFace(ctx, cx, cy, r, tm, { a = 1, ring = C.teal, face = '#fff', hourC = C.navy, minC = C.teal, trail = 0, num = true } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    shadowed(ctx, () => {
      ctx.fillStyle = face;
      dot(ctx, cx, cy, r);
    }, { blur: r * 0.25, oy: r * 0.06 });
    ctx.strokeStyle = ring;
    ctx.lineWidth = r * 0.09;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.955, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineCap = 'round';
    for (let i = 0; i < 60; i++) {
      const th = (i / 60) * Math.PI * 2;
      const big = i % 5 === 0;
      ctx.strokeStyle = big ? C.ink : 'rgba(18,59,58,0.25)';
      ctx.lineWidth = big ? r * 0.035 : r * 0.015;
      const r1 = r * (big ? 0.72 : 0.78);
      line(ctx, cx + Math.cos(th) * r1, cy + Math.sin(th) * r1, cx + Math.cos(th) * r * 0.83, cy + Math.sin(th) * r * 0.83);
    }
    if (num) {
      [['12', 0], ['3', 3], ['6', 6], ['9', 9]].forEach(([s, h]) => {
        const th = (h / 12) * Math.PI * 2 - Math.PI / 2;
        T(ctx, s, cx + Math.cos(th) * r * 0.56, cy + Math.sin(th) * r * 0.56 + r * 0.02, { size: r * 0.19, weight: 900, color: C.ink });
      });
    }
    const ha = ((tm / 60) % 12) / 12 * Math.PI * 2 - Math.PI / 2;
    const ma = ((tm % 60 + 60) % 60) / 60 * Math.PI * 2 - Math.PI / 2;
    if (trail) {
      ctx.fillStyle = `rgba(245,158,11,${0.28 * Math.min(1, Math.abs(trail))})`;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r * 0.74, ma, ma - trail, trail > 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = hourC;
    ctx.lineWidth = r * 0.075;
    line(ctx, cx, cy, cx + Math.cos(ha) * r * 0.42, cy + Math.sin(ha) * r * 0.42);
    ctx.strokeStyle = minC;
    ctx.lineWidth = r * 0.05;
    line(ctx, cx, cy, cx + Math.cos(ma) * r * 0.66, cy + Math.sin(ma) * r * 0.66);
    ctx.fillStyle = C.amber;
    dot(ctx, cx, cy, r * 0.07);
    ctx.restore();
  }

  // Yan profil kafa (sağa bakar). Birim: 100×120 kutu
  function headPath(ctx) {
    ctx.beginPath();
    ctx.moveTo(34, 120);
    ctx.bezierCurveTo(34, 108, 30, 100, 24, 92);
    ctx.bezierCurveTo(10, 76, 6, 52, 14, 34);
    ctx.bezierCurveTo(24, 12, 48, 2, 66, 6);
    ctx.bezierCurveTo(82, 10, 92, 22, 92, 38);
    ctx.bezierCurveTo(92, 44, 94, 48, 100, 58);
    ctx.bezierCurveTo(101, 61, 98, 63, 94, 63);
    ctx.bezierCurveTo(95, 66, 96, 68, 94, 70);
    ctx.bezierCurveTo(96, 72, 96, 75, 93, 77);
    ctx.bezierCurveTo(93, 82, 92, 86, 88, 88);
    ctx.bezierCurveTo(82, 90, 78, 92, 76, 98);
    ctx.bezierCurveTo(74, 106, 74, 114, 76, 120);
    ctx.closePath();
  }

  function head(ctx, hx, hy, hh, t, { a = 1, eyeOpen = 1, glow = 0 } = {}) {
    if (a <= 0.002) return;
    const s = hh / 120;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.save();
    ctx.translate(hx, hy);
    ctx.scale(s, s);
    headPath(ctx);
    const g = ctx.createLinearGradient(0, 0, 100, 120);
    g.addColorStop(0, '#2747a0');
    g.addColorStop(1, C.navy);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
    // saç çizgisi (marka kartındaki gibi açık bir kıvrım)
    ctx.save();
    ctx.translate(hx, hy);
    ctx.scale(s, s);
    ctx.strokeStyle = 'rgba(110,193,201,0.55)';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(30, 16);
    ctx.bezierCurveTo(18, 34, 16, 60, 26, 82);
    ctx.stroke();
    // göz
    ctx.fillStyle = C.cream;
    ctx.beginPath();
    ctx.ellipse(81, 44, 3.6, 3.6 * Math.max(0.12, eyeOpen), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (glow > 0) {
      const [bx, by] = headPt(hx, hy, hh, 46, 40);
      E.glow(ctx, bx, by, hh * 0.32, AMBER, 0.45 * glow);
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 8 · Logo ve abone çağrısı
  // ---------------------------------------------------------------------------
  function bellIcon(ctx, x, y, s, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-18, 10);
    ctx.bezierCurveTo(-18, -22, -10, -28, 0, -28);
    ctx.bezierCurveTo(10, -28, 18, -22, 18, 10);
    ctx.lineTo(24, 16);
    ctx.lineTo(-24, 16);
    ctx.closePath();
    ctx.fill();
    dot(ctx, 0, 22, 6);
    dot(ctx, 0, -30, 4);
    ctx.restore();
  }

  function hand(ctx, x, y, s, press) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s * (1 - 0.08 * press), s * (1 - 0.08 * press));
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -46);
    ctx.quadraticCurveTo(0, -56, 9, -56);
    ctx.quadraticCurveTo(18, -56, 18, -46);
    ctx.lineTo(18, -20);
    ctx.lineTo(42, -16);
    ctx.quadraticCurveTo(54, -14, 54, -2);
    ctx.lineTo(50, 30);
    ctx.quadraticCurveTo(48, 44, 34, 44);
    ctx.lineTo(10, 44);
    ctx.quadraticCurveTo(0, 44, -6, 36);
    ctx.lineTo(-20, 12);
    ctx.quadraticCurveTo(-24, 2, -14, 0);
    ctx.quadraticCurveTo(-6, -1, 0, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  const headPt = (hx, hy, hh, ux, uy) => [hx + (ux * hh) / 120, hy + (uy * hh) / 120];

  // Sol üstteki seri etiketi
  function seriesTag(ctx, label, a = 1) {
    if (a <= 0.002) return;
    appIcon(ctx, 104, 214, 72, { a });
    T(ctx, label, 160, 204, { size: 30, weight: 900, color: C.teal, align: 'left', spacing: 3, alpha: a });
    T(ctx, 'YUP Akademi', 160, 238, { size: 24, weight: 700, color: C.muted, align: 'left', alpha: a });
  }

  // Yorum balonu simgesi
  function commentIcon(ctx, x, y, s, { a = 1, fill = C.teal, dots = 0 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = fill;
    rr(ctx, -50, -40, 100, 70, 26);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-22, 26);
    ctx.lineTo(-30, 50);
    ctx.lineTo(2, 28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 3; i++) {
      const b = dots ? Math.max(0, Math.sin(dots * 6 - i * 0.9)) * 6 : 0;
      dot(ctx, -24 + i * 24, -5 - b, 8);
    }
    ctx.restore();
  }

  // Hüküm damgası: büyükten küçülerek basılır
  function stamp(ctx, str, color, x, y, t0, t, { size = 96, rot = -0.1 } = {}) {
    if (t < t0) return;
    const p = clamp((t - t0) / 0.35);
    const s = lerp(2.2, 1, ease.out(p));
    ctx.save();
    ctx.globalAlpha *= clamp(p * 2.5);
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    const w = M(ctx, str, { size, weight: 900, spacing: 4 }) + 70;
    const h = size * 1.45;
    ctx.fillStyle = 'rgba(255,253,248,0.92)';
    rr(ctx, -w / 2, -h / 2, w, h, 26);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 12;
    rr(ctx, -w / 2, -h / 2, w, h, 26);
    ctx.stroke();
    ctx.lineWidth = 4;
    rr(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 16);
    ctx.stroke();
    T(ctx, str, 0, 4, { size, weight: 900, color, spacing: 4 });
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Kısa video kurucusu
  // ---------------------------------------------------------------------------
  function short(def) {
    const SCRIPT = root.NARRATION;
    const sayOf = Object.fromEntries(SCRIPT.lines.map((l) => [l.id, l.say]));
    const CPS = def.cps ?? 17;
    const recorded = Object.fromEntries((root.VOICE?.lines ?? []).filter((v) => v.say === sayOf[v.id]).map((v) => [v.id, v.dur]));
    const estimate = (id) => {
      if (recorded[id]) return recorded[id];
      const ph = E.phrases(sayOf[id] ?? '');
      return ph.reduce((n, p, k) => n + p.length / CPS + (k < ph.length - 1 ? E.PAUSES[p.slice(-1)] ?? 0.3 : 0), 0);
    };
    const ORDER = SCRIPT.lines.map((l) => l.id);
    const CTA = ORDER[ORDER.length - 1];
    const BEATS = {};
    const SCENES = SCRIPT.lines.map((l) => {
      l.beat = l.id;
      l.offset = def.lead?.[l.id] ?? 0.35;
      const len = l.offset + estimate(l.id) + (def.extra?.[l.id] ?? 0.8);
      BEATS[l.id] = [l.id, 0, len, len - 0.3];
      return { id: l.id, title: def.titles?.[l.id] ?? l.id, base: len + 0.1, fadeIn: 0, fadeOut: l.id === CTA ? 0.6 : 0, draw: (ctx, lt, t) => drawScene(l.id, ctx, t) };
    });
    const build = (holds, slow) => E.timeline(SCENES.map((sc) => ({
      ...sc,
      stretch: slow[sc.id] ? [[0, BEATS[sc.id][2], slow[sc.id]]] : [],
      holds: holds[sc.id] > 0 ? [[BEATS[sc.id][3], holds[sc.id]]] : [],
    })));
    const VOICE = E.narration({ build, beats: BEATS, lines: SCRIPT.lines, voice: root.VOICE, breath: 0.35, gap: 0.25, cps: CPS });
    const TL = VOICE.timeline;
    const cue = VOICE.cue;
    const end = VOICE.end;
    const S0 = (id) => TL.scene(id).start;
    const S1 = (id) => TL.scene(id).end;
    const api = {
      cue,
      end,
      S0,
      S1,
      ORDER,
      after: (t, id, k = 0, d = 0.5, fn = ease.out) => progress(t, cue(id, k), cue(id, k) + d, fn),
      pop: (t, at, d = 0.5) => (t < at ? 0 : ease.back(clamp((t - at) / d))),
      fadeIn: (t, at, d = 0.35) => progress(t, at, at + d, ease.out),
      tag: (ctx, a = 1) => seriesTag(ctx, def.series, a),
      cta: (ctx, t, o = {}) => cta(ctx, t, o),
    };
    const cut = new Set(def.cut ?? []);
    const WIPE = 0.6;

    // Daire açılışlı geçiş: önceki sahne altta, yeni sahne büyüyen dairenin içinde
    function drawScene(id, ctx, t) {
      const i = ORDER.indexOf(id);
      const self = () => def.draw[id](ctx, t, api);
      const p = progress(t, S0(id), S0(id) + WIPE, ease.inOut);
      if (i === 0 || cut.has(id) || p >= 1) return self();
      drawScene(ORDER[i - 1], ctx, t);
      const R = p * 2300;
      ctx.save();
      ctx.beginPath();
      ctx.arc(540, 960, R, 0, Math.PI * 2);
      ctx.clip();
      self();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = C.teal;
      ctx.lineWidth = 26 * (1 - p);
      ctx.beginPath();
      ctx.arc(540, 960, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = C.amber;
      ctx.lineWidth = 8 * (1 - p);
      ctx.beginPath();
      ctx.arc(540, 960, R + 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Kapanış: (yorum çağrısı) + logo + slogan + abone ol
    function cta(ctx, t, { invite = null } = {}) {
      dayBg(ctx, t);
      const s0 = S0(CTA);
      const { fadeIn, pop } = api;
      const dy = invite ? 120 : 0;
      if (invite) {
        const ia = fadeIn(t, s0 + 0.15, 0.4);
        ctx.save();
        ctx.translate(0, (1 - ease.out(ia)) * -40);
        card(ctx, 90, 250, 900, 270, { r: 44, a: ia });
        commentIcon(ctx, 200, 365, 1.15, { a: ia, dots: t });
        T(ctx, invite, 300, 330, { size: 46, weight: 900, color: C.ink, align: 'left', alpha: ia });
        // yorum kutusu: yanıp sönen imleç
        ctx.globalAlpha *= ia;
        rr(ctx, 300, 380, 620, 84, 42);
        ctx.fillStyle = C.cream;
        ctx.fill();
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 3;
        ctx.stroke();
        T(ctx, 'Yorum ekle…', 340, 424, { size: 32, weight: 700, color: C.muted, align: 'left' });
        if (Math.floor(t * 2) % 2 === 0) {
          ctx.fillStyle = C.teal;
          ctx.fillRect(334, 400, 4, 46);
        }
        ctx.restore();
      }
      // simge: zıplar, sembol sapından yukarı büyür, üstünden ışık geçer
      const iy = 620 + dy;
      const size = invite ? 320 : 380;
      const ip = pop(t, s0 + 0.2, 0.7);
      const rev = progress(t, s0 + 0.5, s0 + 1.4, ease.inOut);
      const shine = progress(t, s0 + 1.5, s0 + 2.2, ease.inOut);
      ctx.save();
      ctx.translate(540, iy);
      ctx.scale(ip, ip);
      ctx.rotate((1 - clamp((t - s0 - 0.2) / 0.7)) * -0.2);
      appIcon(ctx, 0, 0, size, { a: clamp(ip * 3), reveal: rev, shine: shine > 0 && shine < 1 ? shine : -1 });
      ctx.restore();
      for (let i = 0; i < 2; i++) {
        const u = clamp((t - s0 - 0.35 - i * 0.25) / 1.2);
        if (u <= 0 || u >= 1) continue;
        ctx.save();
        ctx.strokeStyle = i ? C.amber : C.teal;
        ctx.globalAlpha = 0.5 * (1 - u);
        ctx.lineWidth = 8;
        rr(ctx, 540 - size / 2 - u * 120, iy - size / 2 - u * 120, size + u * 240, size + u * 240, 60 + u * 40);
        ctx.stroke();
        ctx.restore();
      }
      const c0 = cue(CTA, 0);
      const c1 = cue(CTA, Math.min(1, E.phrases(sayOf[CTA]).length - 1));
      const wa = progress(t, c0 + 0.6, c0 + 1.1, ease.out);
      ctx.save();
      ctx.translate(0, (1 - wa) * 30);
      T(ctx, 'YUP', 540, iy + size / 2 + 120, { size: 140, weight: 900, color: C.teal, alpha: wa, spacing: 4 });
      T(ctx, 'Akademi', 540, iy + size / 2 + 228, { size: 80, weight: 600, color: C.tealDeep, alpha: wa });
      ctx.restore();
      const sa = progress(t, c1 - 0.1, c1 + 0.4);
      ctx.save();
      ctx.translate(540, iy + size / 2 + 325);
      ctx.rotate(-0.04);
      T(ctx, 'Küçük bir merak, büyük bir keşif.', 0, 0, { hand: true, size: 62, weight: 700, color: C.teal, alpha: sa });
      ctx.strokeStyle = C.amber;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.globalAlpha *= sa;
      const uw = 420 * progress(t, c1 + 0.2, c1 + 0.8, ease.inOut);
      if (uw > 1) {
        ctx.beginPath();
        ctx.moveTo(-60, 44);
        ctx.quadraticCurveTo(-60 + uw / 2, 56, -60 + uw, 36);
        ctx.stroke();
      }
      ctx.restore();
      // abone ol: el gelir, basar, düğme "abone olundu"ya döner, zil çalar
      const by = iy + size / 2 + 470;
      const ba = progress(t, c1 + 0.1, c1 + 0.5, ease.out);
      const tap = end(CTA) + 0.35;
      const done = t > tap;
      const press = Math.exp(-(((t - tap) / 0.09) ** 2));
      const bs = lerp(0.7, 1, pop(t, c1 + 0.1)) * (1 - 0.06 * press);
      const label = done ? 'ABONE OLUNDU' : 'ABONE OL';
      const fs = done ? 46 : 54;
      const tw = M(ctx, label, { size: fs, weight: 900, spacing: 3 });
      const bw = tw + 190;
      ctx.save();
      ctx.translate(540, by);
      ctx.scale(bs, bs);
      ctx.globalAlpha *= ba;
      shadowed(ctx, () => {
        rr(ctx, -bw / 2, -64, bw, 128, 64);
        ctx.fillStyle = done ? C.paper : C.teal;
        ctx.fill();
      }, { blur: 30, oy: 12, color: 'rgba(11,90,84,0.3)' });
      if (done) {
        ctx.strokeStyle = C.teal;
        ctx.lineWidth = 5;
        rr(ctx, -bw / 2, -64, bw, 128, 64);
        ctx.stroke();
      }
      const ring = done ? Math.sin((t - tap) * 30) * 0.35 * Math.exp(-(t - tap) * 3) : 0;
      bellIcon(ctx, -bw / 2 + 72, 2, 1.25, ring, done ? C.teal : '#fff');
      T(ctx, label, -bw / 2 + 125, 4, { size: fs, weight: 900, color: done ? C.teal : '#fff', spacing: 3, align: 'left' });
      ctx.restore();
      const hp = progress(t, tap - 0.7, tap - 0.05, ease.inOut);
      const ha = fadeIn(t, tap - 0.7, 0.2) * (1 - progress(t, tap + 0.7, tap + 1.0));
      if (ha > 0) {
        ctx.save();
        ctx.globalAlpha *= ha;
        hand(ctx, lerp(900, 640, hp), lerp(by + 270, by + 30, hp), 1.6, press);
        ctx.restore();
      }
      for (let i = 0; i < 14; i++) {
        const u = clamp((t - tap) / 1.1);
        if (u <= 0 || u >= 1) continue;
        const th = (i / 14) * Math.PI * 2 + hash(i, 4);
        const d = 330 + u * (200 + hash(i, 5) * 160);
        const col = [C.amber, C.teal, C.cyan, C.green][i % 4];
        star(ctx, 540 + Math.cos(th) * d * 1.3, by + Math.sin(th) * d * 0.7, 16 * (1 - u), 1, col);
      }
    }

    function score(m, hz) {
      hz = hz ?? root.Synth.hz;
      const dur = TL.duration;
      for (const id of ORDER) {
        const a = S0(id);
        const b = id === CTA ? dur : S1(id);
        const notes = def.chords?.[id] ?? ['D3', 'A3', 'F#4', 'A4'];
        m.pad(Math.max(0, a - 0.2), b - a + 0.4, notes, { gain: 0.11, attack: 0.5, release: 1.2, cutoff: 1100 });
      }
      for (const id of ORDER.slice(1)) if (!cut.has(id)) m.whoosh(S0(id) - 0.05, { dur: 0.6, from: 400, to: 1800, gain: 0.035 });
      if (def.score) def.score(m, hz, api);
      // kapanış
      const s8 = S0(CTA);
      const bell = (t, n, g, pan = 0) => m.bell(t, { freq: hz(n), gain: g, decay: 2.4, pan });
      m.boom(s8 + 0.25, { gain: 0.16, freq: 70 });
      ['D5', 'F#5', 'A5', 'D6'].forEach((n, i) => bell(s8 + 0.5 + i * 0.16, n, 0.06, -0.3 + i * 0.2));
      const tap = end(CTA) + 0.35;
      m.click(tap, { gain: 0.25, tone: 2600 });
      bell(tap + 0.05, 'A5', 0.08, 0.2);
      bell(tap + 0.2, 'D6', 0.06, -0.2);
    }

    return E.film({
      title: def.title,
      width: SW,
      height: SH,
      fade: 0,
      timeline: TL,
      background,
      score,
      narration: VOICE,
      voice: VOICE.voice,
    });
  }

  root.YupKisa = {
    SW, SH, C, AMBER, CYAN, T, M,
    rr, shadowed, card, pill, line, dot, blob, dayBg, appIcon, seriesTag, commentIcon, stamp,
    sunIcon, moonIcon, star, lockIcon, checkBadge, clockFace, headPath, head, headPt, bellIcon, hand,
    short,
  };
})(window);
