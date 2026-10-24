/*
 * YUP Akademi · Uykunun Bilimi kısa video (1080×1920) — Saatler geri alınmıyor: vücudun buna ne diyor?
 *
 * Yeni marka dili: krem zemin, köşelerde organik lekeler, yuvarlak kartlar; palet #0F766E #2E7D5B #6EC1C9
 * #F59E0B #1E3A8A; yazı Nunito (başlık) ve Caveat (el yazısı vurgu); sonda logo ve abone çağrısı.
 * Her seslendirme satırı bir sahnedir. Öğeler anlatıcının söylediği öbekte belirir (cue). Videoda altyazı yok;
 * ekranda yalnız sayı, ad ve etiket durur. Kayıt yokken süreler harf sayısından tahmin edilir; kayıt gelince
 * (voice.js) sahneler satır sürelerine göre yeniden kurulur (narrate.mjs iki kez çalıştırılır).
 * Kaynaklar: kaynaklar.md.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, lerp, ease, progress, hash, noise } = E;
  const SW = 1080;
  const SH = 1920;

  const C = {
    teal: '#0f766e',
    tealDeep: '#0b5a54',
    tealSoft: '#d7ece8',
    green: '#2e7d5b',
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
    line: '#d9d2c3',
  };
  const AMBER = [245, 158, 11];
  const CYAN = [110, 193, 201];
  const WHITE = [255, 255, 255];
  const NUN = 'Nunito, "Inter", sans-serif';
  const HAND = 'Caveat, Nunito, cursive';

  // Yazı: Nunito (o.hand → Caveat)
  const T = (ctx, str, x, y, o = {}) => E.text(ctx, str, x, y, { family: o.hand ? HAND : NUN, weight: o.weight ?? 800, color: C.ink, ...o });
  const M = (ctx, str, o = {}) => E.measure(ctx, str, { family: o.hand ? HAND : NUN, weight: o.weight ?? 800, ...o });

  // ---------------------------------------------------------------------------
  // Logo ve yazı tipleri hazır olmadan oynatıcı başlamaz
  // ---------------------------------------------------------------------------
  const L = window.YUP_LOGO;
  const LOGO = new Image();
  LOGO.src = L.src;
  window.FILM_READY = Promise.all([LOGO.decode().catch(() => {}), window.YUP_FONTS_READY ?? Promise.resolve()]);

  // ---------------------------------------------------------------------------
  // Zamanlama: her satır bir sahne
  // ---------------------------------------------------------------------------
  const SCRIPT = window.NARRATION;
  const sayOf = Object.fromEntries(SCRIPT.lines.map((l) => [l.id, l.say]));
  const CPS = 17;
  const recorded = Object.fromEntries((window.VOICE?.lines ?? []).filter((v) => v.say === sayOf[v.id]).map((v) => [v.id, v.dur]));
  const estimate = (id) => {
    if (recorded[id]) return recorded[id];
    const ph = E.phrases(sayOf[id] ?? '');
    return ph.reduce((n, p, k) => n + p.length / CPS + (k < ph.length - 1 ? E.PAUSES[p.slice(-1)] ?? 0.3 : 0), 0);
  };
  // satırdan sonra görüntünün kalacağı süre ve satırın sahne başından gecikmesi
  const EXTRA = { 'k-hook': 0.9, 'k-ask': 0.6, 'k-clock': 1.3, 'k-late': 2.0, 'k-dark': 1.2, 'k-science': 1.3, 'k-tip': 1.0, 'k-cta': 3.4 };
  const LEAD = { 'k-hook': 0.45, 'k-ask': 0.3, 'k-clock': 0.3, 'k-late': 0.45, 'k-dark': 0.3, 'k-science': 0.45, 'k-tip': 0.45, 'k-cta': 0.55 };
  const TITLES = {
    'k-hook': 'Avrupa saatleri geri alıyor',
    'k-ask': 'Vücudun ne diyor?',
    'k-clock': 'İç saat ve sabah ışığı',
    'k-late': 'Aralıkta gün doğumu',
    'k-dark': 'Karanlık sabahlar',
    'k-science': 'Uyku bilimi ne öneriyor?',
    'k-tip': 'Bu kış dene',
    'k-cta': 'YUP Akademi',
  };
  const BEATS = {};
  const DRAW = {};
  const ORDER = SCRIPT.lines.map((l) => l.id);
  const SCENES = SCRIPT.lines.map((l) => {
    l.beat = l.id;
    l.offset = LEAD[l.id];
    const len = LEAD[l.id] + estimate(l.id) + EXTRA[l.id];
    BEATS[l.id] = [l.id, 0, len, len - 0.3];
    return { id: l.id, title: TITLES[l.id], base: len + 0.1, fadeIn: 0, fadeOut: l.id === 'k-cta' ? 0.6 : 0, draw: (ctx, lt, t) => DRAW[l.id](ctx, t) };
  });
  const build = (holds, slow) => E.timeline(SCENES.map((sc) => ({
    ...sc,
    stretch: slow[sc.id] ? [[0, BEATS[sc.id][2], slow[sc.id]]] : [],
    holds: holds[sc.id] > 0 ? [[BEATS[sc.id][3], holds[sc.id]]] : [],
  })));
  const VOICE = E.narration({ build, beats: BEATS, lines: SCRIPT.lines, voice: window.VOICE, breath: 0.35, gap: 0.25, cps: CPS });
  const TL = VOICE.timeline;
  const cue = VOICE.cue;
  const lineEnd = VOICE.end;
  const S0 = (id) => TL.scene(id).start;
  const S1 = (id) => TL.scene(id).end;
  const after = (t, id, k = 0, d = 0.5, fn = ease.out) => progress(t, cue(id, k), cue(id, k) + d, fn);
  const pop = (t, at, d = 0.5) => (t < at ? 0 : ease.back(clamp((t - at) / d)));
  const fadeIn = (t, at, d = 0.35) => progress(t, at, at + d, ease.out);

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

  // Seri etiketi (sol üst)
  function seriesTag(ctx, a = 1) {
    if (a <= 0.002) return;
    appIcon(ctx, 104, 214, 72, { a });
    T(ctx, 'UYKUNUN BİLİMİ', 160, 204, { size: 30, weight: 900, color: C.teal, align: 'left', spacing: 3, alpha: a });
    T(ctx, 'YUP Akademi', 160, 238, { size: 24, weight: 700, color: C.muted, align: 'left', alpha: a });
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

  // Takvim yaprağı
  function calendar(ctx, cx, cy, s, { a = 1, day = '25', month = 'EKİM', dow = 'PAZAR', flip = 1 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(cx, cy);
    ctx.scale(s, s * flip);
    const w = 250;
    const h = 236;
    card(ctx, -w / 2, -h / 2, w, h, { r: 34 });
    ctx.save();
    rr(ctx, -w / 2, -h / 2, w, h, 34);
    ctx.clip();
    ctx.fillStyle = C.amber;
    ctx.fillRect(-w / 2, -h / 2, w, 66);
    ctx.restore();
    ctx.fillStyle = C.cream;
    dot(ctx, -62, -h / 2 + 4, 11);
    dot(ctx, 62, -h / 2 + 4, 11);
    T(ctx, month, 0, -h / 2 + 36, { size: 34, weight: 900, color: '#fff', spacing: 4 });
    T(ctx, day, 0, 22, { size: 104, weight: 900, color: C.teal });
    T(ctx, dow, 0, 92, { size: 26, weight: 800, color: C.muted, spacing: 3 });
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
  // kafanın kutusu: (x, y) sol üst, h yükseklik
  const headPt = (hx, hy, hh, ux, uy) => [hx + (ux * hh) / 120, hy + (uy * hh) / 120];
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

  // Kurma anahtarı (saat tepesinde)
  function windKey(ctx, x, y, s, rot, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(Math.cos(rot) * s, s);
    ctx.fillStyle = C.amber;
    ctx.strokeStyle = C.tealDeep;
    ctx.lineWidth = 3;
    rr(ctx, -5, -26, 10, 26, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-16, -34, 14, 11, 0, 0, Math.PI * 2);
    ctx.ellipse(16, -34, 14, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // İstanbul silueti (panelin altına): kubbe, minareler, Galata Kulesi, binalar
  function skyline(ctx, x0, yb, w, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x0, yb);
    const b = [[0, 60], [50, 90], [95, 70], [140, 110], [170, 80]];
    for (const [dx, hh] of b) {
      ctx.lineTo(x0 + dx, yb - hh);
      ctx.lineTo(x0 + dx + 44, yb - hh);
    }
    ctx.lineTo(x0 + 214, yb);
    ctx.closePath();
    ctx.fill();
    // cami: ana kubbe, yarım kubbeler, iki minare
    const mx = x0 + w * 0.42;
    ctx.fillRect(mx - 110, yb - 70, 220, 70);
    ctx.beginPath();
    ctx.arc(mx, yb - 70, 74, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(mx - 92, yb - 60, 40, Math.PI, 0);
    ctx.arc(mx + 92, yb - 60, 40, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(mx - 4, yb - 168, 8, 30);
    for (const sx of [-170, 170]) {
      ctx.fillRect(mx + sx - 8, yb - 250, 16, 250);
      ctx.beginPath();
      ctx.moveTo(mx + sx - 10, yb - 248);
      ctx.lineTo(mx + sx, yb - 300);
      ctx.lineTo(mx + sx + 10, yb - 248);
      ctx.fill();
      ctx.fillRect(mx + sx - 13, yb - 190, 26, 8);
    }
    // Galata Kulesi
    const gx = x0 + w * 0.82;
    ctx.fillRect(gx - 34, yb - 210, 68, 210);
    ctx.fillRect(gx - 42, yb - 222, 84, 14);
    ctx.beginPath();
    ctx.moveTo(gx - 40, yb - 222);
    ctx.lineTo(gx, yb - 300);
    ctx.lineTo(gx + 40, yb - 222);
    ctx.fill();
    // sağ binalar
    ctx.beginPath();
    ctx.moveTo(gx + 40, yb);
    for (const [dx, hh] of [[40, 90], [90, 60], [130, 100]]) {
      ctx.lineTo(gx + dx, yb - hh);
      ctx.lineTo(gx + dx + 46, yb - hh);
    }
    ctx.lineTo(x0 + w, yb - 60);
    ctx.lineTo(x0 + w, yb);
    ctx.closePath();
    ctx.fill();
    // su
    ctx.fillRect(x0, yb, w, 60);
    ctx.restore();
  }

  // Gökyüzü rengi: τ saat (06.0–10.0), gün doğumu RISE
  const RISE = 8 + 25 / 60;
  function skyColors(tau) {
    const d = clamp((tau - (RISE - 0.75)) / 1.2); // şafaktan güne
    const top = mix([11, 22, 56], [110, 193, 201], d);
    const bot = mix([30, 48, 104], [253, 214, 150], clamp(d * 1.6) * (1 - clamp((d - 0.7) / 0.3) * 0.6));
    return [top, bot, d];
  }
  function mix(a, b, p) {
    return [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * p));
  }
  const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const hhmm = (tau) => {
    const m = Math.round(tau * 60);
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  };

  // Daire açılışlı sahne geçişi: önceki sahne altta, yeni sahne büyüyen dairenin içinde
  const WIPE = 0.6;
  function withWipe(id, ctx, t, ox, oy, drawSelf) {
    const s0 = S0(id);
    const i = ORDER.indexOf(id);
    const p = progress(t, s0, s0 + WIPE, ease.inOut);
    if (p >= 1 || i === 0) return drawSelf();
    DRAW[ORDER[i - 1]](ctx, t, true);
    const R = p * 2300;
    ctx.save();
    ctx.beginPath();
    ctx.arc(ox, oy, R, 0, Math.PI * 2);
    ctx.clip();
    drawSelf();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = C.teal;
    ctx.lineWidth = 26 * (1 - p);
    ctx.beginPath();
    ctx.arc(ox, oy, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 8 * (1 - p);
    ctx.beginPath();
    ctx.arc(ox, oy, R + 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 1 · Avrupa saatleri geri alıyor, Türkiye almıyor
  // ---------------------------------------------------------------------------
  const EU = [290, 950];
  const TR = [790, 950];
  const CR = 175;
  DRAW['k-hook'] = function (ctx, t) {
    dayBg(ctx, t);
    seriesTag(ctx, fadeIn(t, 0.05));
    const t0 = S0('k-hook');
    // takvim: tepeden çevrilerek gelir
    const ca = progress(t, t0, t0 + 0.45, ease.out);
    calendar(ctx, 540, 480, lerp(0.85, 1, pop(t, t0, 0.55)), { a: ca, flip: Math.max(0.05, ca) });
    T(ctx, 'bu pazar', 750, 408, { hand: true, size: 64, weight: 700, color: C.amber, alpha: fadeIn(t, t0 + 0.3), align: 'left' });
    // saatler
    const back0 = cue('k-hook', 0) + 0.9;
    const bp = progress(t, back0, back0 + 1.5, ease.inOut);
    const tmEU = 180 - 60 * bp;
    const spin = bp > 0 && bp < 1 ? 1.1 : 0;
    const sEU = pop(t, t0 + 0.15, 0.55);
    const sTR = pop(t, t0 + 0.3, 0.55);
    ctx.save();
    ctx.translate(EU[0], EU[1]);
    ctx.scale(sEU, sEU);
    clockFace(ctx, 0, 0, CR, tmEU, { a: clamp(sEU * 2), ring: C.navy, trail: spin });
    ctx.restore();
    // geri dönüş oku
    const arA = after(t, 'k-hook', 0, 0.4) * (1 - progress(t, back0 + 1.9, back0 + 2.3));
    if (arA > 0) {
      ctx.save();
      ctx.globalAlpha *= arA;
      ctx.strokeStyle = C.amber;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      const a1 = -Math.PI * 0.15;
      const a2 = a1 - Math.PI * 1.1 * clamp(bp * 1.2 + 0.25);
      ctx.beginPath();
      ctx.arc(EU[0], EU[1], CR + 34, a1, a2, true);
      ctx.stroke();
      const hx = EU[0] + Math.cos(a2) * (CR + 34);
      const hy = EU[1] + Math.sin(a2) * (CR + 34);
      ctx.translate(hx, hy);
      ctx.rotate(a2 - Math.PI / 2);
      ctx.fillStyle = C.amber;
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(20, 10);
      ctx.lineTo(-20, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(TR[0], TR[1]);
    ctx.scale(sTR, sTR);
    // Türkiye saati yerinde sayar ama kımıldamaz; kilit kapanınca hafifçe titrer
    const lockT = cue('k-hook', 1) + 0.2;
    const shake = t > lockT && t < lockT + 0.35 ? Math.sin((t - lockT) * 60) * 4 * (1 - (t - lockT) / 0.35) : 0;
    clockFace(ctx, shake, 0, CR, 180, { a: clamp(sTR * 2), ring: C.teal });
    ctx.restore();
    lockIcon(ctx, TR[0] + CR * 0.72, TR[1] - CR * 0.72, 92 * pop(t, lockT, 0.45), { a: fadeIn(t, lockT, 0.15) });
    // etiketler
    pill(ctx, 'AVRUPA', EU[0], EU[1] + CR + 78, { size: 32, fill: C.navy, a: fadeIn(t, t0 + 0.35) });
    pill(ctx, 'TÜRKİYE', TR[0], TR[1] + CR + 78, { size: 32, fill: C.teal, a: fadeIn(t, t0 + 0.45) });
    // Avrupa: saat göstergesi 03:00 → 02:00
    const eA = after(t, 'k-hook', 0, 0.4);
    T(ctx, hhmm(Math.ceil(tmEU) / 60), EU[0], EU[1] + CR + 168, { size: 64, weight: 900, color: C.navy, alpha: eA });
    pill(ctx, '−1 SAAT', EU[0], EU[1] - CR - 90, { size: 34, fill: C.amber, color: C.ink, a: progress(t, back0 + 0.2, back0 + 0.6), scale: lerp(0.6, 1, pop(t, back0 + 0.2)) });
    // Türkiye: değişmiyor
    const tA = after(t, 'k-hook', 1, 0.4);
    T(ctx, '03:00', TR[0], TR[1] + CR + 168, { size: 64, weight: 900, color: C.teal, alpha: tA });
    pill(ctx, 'DEĞİŞMİYOR', TR[0], TR[1] - CR - 90, { size: 30, fill: C.tealSoft, color: C.teal, a: tA, scale: lerp(0.6, 1, pop(t, cue('k-hook', 1))) });
    // alt bilgi
    T(ctx, '25 Ekim · Avrupa kış saatine geçiyor', 540, 1440, { size: 34, weight: 700, color: C.muted, alpha: fadeIn(t, back0 + 0.8) });
  };

  // ---------------------------------------------------------------------------
  // 2 · Vücudun ne diyor?  3 · İç saat ve sabah ışığı (aynı kafa, kesintisiz)
  // ---------------------------------------------------------------------------
  function headLayout(t) {
    // 2. sahnede ortada; 3. sahnede sola kayar ve büyür
    const k = progress(t, cue('k-clock', 0) - 0.5, cue('k-clock', 0) + 0.4, ease.inOut);
    return { hx: lerp(260, 110, k), hy: lerp(470, 440, k), hh: lerp(720, 800, k) };
  }
  function innerClock(ctx, t, hx, hy, hh, { a = 1, set = 0, size = 1 } = {}) {
    const [bx, by] = headPt(hx, hy, hh, 46, 40);
    const r = hh * 0.13 * size;
    const pulse = 1 + 0.05 * Math.sin(t * 4);
    ctx.save();
    ctx.globalAlpha *= a;
    E.glow(ctx, bx, by, r * 3, AMBER, 0.5);
    // kurulmamış saat: akrep yelkovan rastgele; kurulunca 07:00'a oturur
    const loose = 60 * 3 + 37 + Math.sin(t * 0.7) * 40;
    const tm = lerp(loose, 7 * 60, set);
    clockFace(ctx, bx, by, r * pulse, tm, { ring: C.amber, num: false });
    ctx.restore();
    return [bx, by, r];
  }

  DRAW['k-ask'] = function (ctx, t) {
    withWipe('k-ask', ctx, t, 540, 960, () => {
      dayBg(ctx, t);
      seriesTag(ctx);
      const { hx, hy, hh } = headLayout(t);
      const s0 = S0('k-ask');
      const ha = fadeIn(t, s0 + 0.1, 0.5);
      ctx.save();
      const sc = lerp(0.92, 1, ease.out(clamp((t - s0) / 0.8)));
      ctx.translate(540, 900);
      ctx.scale(sc, sc);
      ctx.translate(-540, -900);
      head(ctx, hx, hy, hh, t, { a: ha, glow: after(t, 'k-ask', 0, 0.6) });
      innerClock(ctx, t, hx, hy, hh, { a: after(t, 'k-ask', 0, 0.5) * ha });
      ctx.restore();
      // soru işaretleri
      const qa = after(t, 'k-ask', 0, 0.5);
      [[860, 520, 120, 0.1], [930, 760, 80, -0.15], [800, 380, 70, 0.2]].forEach(([x, y, s, r], i) => {
        const p = pop(t, cue('k-ask', 0) + 0.15 + i * 0.18);
        ctx.save();
        ctx.translate(x, y + Math.sin(t * 2 + i) * 8);
        ctx.rotate(r);
        ctx.scale(p, p);
        T(ctx, '?', 0, 0, { hand: true, size: s, weight: 700, color: i === 0 ? C.amber : C.teal, alpha: qa });
        ctx.restore();
      });
      // başlık kartı (videonun sorusu)
      const ta = fadeIn(t, s0 + 0.25, 0.5);
      T(ctx, 'Saatler geri alınmıyor:', 540, 1330, { size: 50, weight: 800, color: C.muted, alpha: ta });
      T(ctx, 'vücudun ne diyor?', 540, 1410, { size: 84, weight: 900, color: C.teal, alpha: ta });
      ctx.save();
      ctx.globalAlpha *= ta;
      ctx.strokeStyle = C.amber;
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      const w = 640 * progress(t, s0 + 0.5, s0 + 1.1, ease.inOut);
      ctx.beginPath();
      ctx.moveTo(220, 1470);
      ctx.quadraticCurveTo(220 + w / 2, 1490, 220 + w, 1462);
      ctx.stroke();
      ctx.restore();
    });
  };

  DRAW['k-clock'] = function (ctx, t) {
    dayBg(ctx, t);
    seriesTag(ctx);
    const { hx, hy, hh } = headLayout(t);
    // sabah ışığı: arka plan ısınır
    const sunA = after(t, 'k-clock', 1, 0.8);
    if (sunA > 0) {
      const g = ctx.createRadialGradient(900, 420, 0, 900, 420, 1100);
      g.addColorStop(0, `rgba(253,231,184,${0.85 * sunA})`);
      g.addColorStop(1, 'rgba(253,231,184,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, SW, SH);
    }
    const sunY = lerp(560, 400, ease.out(sunA));
    // gözün yeri
    const [ex, ey] = headPt(hx, hy, hh, 81, 44);
    const beam = after(t, 'k-clock', 2, 0.6);
    if (beam > 0) {
      ctx.save();
      ctx.globalAlpha *= beam * 0.85;
      const g = ctx.createLinearGradient(900, sunY, ex, ey);
      g.addColorStop(0, 'rgba(245,158,11,0.75)');
      g.addColorStop(1, 'rgba(245,158,11,0.15)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(900, sunY - 70);
      ctx.lineTo(ex + 6, ey - 8);
      ctx.lineTo(ex + 6, ey + 8);
      ctx.lineTo(900, sunY + 70);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    sunIcon(ctx, 900, sunY, 70, t, { a: sunA });
    const setP = progress(t, cue('k-clock', 2) + 0.9, cue('k-clock', 2) + 1.8, ease.inOut);
    head(ctx, hx, hy, hh, t, { glow: 0.6 + 0.4 * setP, eyeOpen: 1 });
    const [bx, by, r] = innerClock(ctx, t, hx, hy, hh, { set: setP, size: lerp(1, 1.25, after(t, 'k-clock', 0, 0.6)) });
    // gözden saate giden sinyal
    if (beam > 0 && setP < 1) {
      const n = 7;
      for (let i = 0; i < n; i++) {
        const u = ((t - cue('k-clock', 2)) * 1.4 + i / n) % 1;
        if (t - cue('k-clock', 2) < 0.4) continue;
        ctx.fillStyle = `rgba(245,158,11,${0.9 * (1 - setP)})`;
        const x = lerp(ex - 10, bx + r, u);
        const y = lerp(ey, by, u) - Math.sin(u * Math.PI) * 30;
        dot(ctx, x, y, 7);
      }
    }
    windKey(ctx, bx, by - r * 1.25, 1.4, (t - cue('k-clock', 2)) * 7 * (setP > 0 && setP < 1 ? 1 : 0), after(t, 'k-clock', 1, 0.4));
    // etiketler
    const la = after(t, 'k-clock', 0, 0.4);
    pill(ctx, 'İÇ SAAT', bx, by + r + 78, { size: 40, fill: C.amber, color: C.ink, a: la, scale: lerp(0.6, 1, pop(t, cue('k-clock', 0))) });
    T(ctx, 'beyindeki ana saat', bx, by + r + 150, { size: 32, weight: 700, color: 'rgba(255,255,255,0.85)', alpha: la });
    const ka = progress(t, cue('k-clock', 2) + 1.0, cue('k-clock', 2) + 1.5);
    card(ctx, 110, 1300, 860, 150, { r: 75, fill: C.paper, a: ka });
    sunIcon(ctx, 200, 1375, 30, t, { a: ka, rays: 0.6 });
    T(ctx, 'Sabah ışığı = kurma anahtarı', 560, 1376, { size: 46, weight: 900, color: C.teal, alpha: ka });
  };

  // ---------------------------------------------------------------------------
  // 4 · Yıl boyu yaz saati; İstanbul'da aralıkta gün doğumu  5 · Karanlık sabahlar, geç gelen uyku
  // ---------------------------------------------------------------------------
  const MONTHS = ['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A'];
  const EU_SUMMER = [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0];
  function monthStrip(ctx, t, y, { a = 1, fill0 = 0, fillTR = 0, hl = 0 } = {}) {
    if (a <= 0.002) return;
    const cw = 58;
    const gap = 7;
    const x0 = 540 - (12 * cw + 11 * gap) / 2 + 60;
    ctx.save();
    ctx.globalAlpha *= a;
    T(ctx, 'Avrupa', x0 - 22, y + 31, { size: 30, weight: 800, color: C.navy, align: 'right' });
    T(ctx, 'Türkiye', x0 - 22, y + 115, { size: 30, weight: 900, color: C.teal, align: 'right' });
    for (let i = 0; i < 12; i++) {
      const x = x0 + i * (cw + gap);
      const f1 = clamp((fill0 * 13 - i) / 1.5);
      const f2 = clamp((fillTR * 13 - i) / 1.5);
      // Avrupa satırı
      rr(ctx, x, y, cw, 62, 16);
      ctx.fillStyle = f1 > 0 ? (EU_SUMMER[i] ? C.amber : C.cyan) : '#ece6d8';
      ctx.globalAlpha = a * (f1 > 0 ? lerp(0.4, 1, f1) : 1);
      ctx.fill();
      ctx.globalAlpha = a;
      T(ctx, MONTHS[i], x + cw / 2, y + 33, { size: 26, weight: 900, color: f1 > 0.5 ? '#fff' : C.muted });
      // Türkiye satırı
      rr(ctx, x, y + 84, cw, 62, 16);
      ctx.fillStyle = f2 > 0 ? C.amber : '#ece6d8';
      ctx.globalAlpha = a * (f2 > 0 ? lerp(0.4, 1, f2) : 1);
      ctx.fill();
      ctx.globalAlpha = a;
      T(ctx, MONTHS[i], x + cw / 2, y + 117, { size: 26, weight: 900, color: f2 > 0.5 ? '#fff' : C.muted });
    }
    // aralık vurgusu
    if (hl > 0) {
      const x = x0 + 11 * (cw + gap);
      ctx.strokeStyle = C.navy;
      ctx.lineWidth = 6;
      ctx.globalAlpha = a * hl;
      rr(ctx, x - 7, y + 77, cw + 14, 76, 20);
      ctx.stroke();
    }
    ctx.restore();
    // açıklama
    const ly = y + 196;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = C.amber;
    rr(ctx, 270, ly - 14, 28, 28, 8);
    ctx.fill();
    ctx.fillStyle = C.cyan;
    rr(ctx, 560, ly - 14, 28, 28, 8);
    ctx.fill();
    ctx.restore();
    T(ctx, 'yaz saati', 312, ly + 1, { size: 30, weight: 700, color: C.ink, align: 'left', alpha: a });
    T(ctx, 'kış saati', 602, ly + 1, { size: 30, weight: 700, color: C.ink, align: 'left', alpha: a });
  }

  // Gökyüzü paneli: İstanbul, saat τ
  const P = { x: 70, y: 820, w: 940, h: 470 };
  function skyPanel(ctx, t, tau, { a = 1, y = P.y, h = P.h, walkers = 0 } = {}) {
    if (a <= 0.002) return;
    const [top, bot, d] = skyColors(tau);
    ctx.save();
    ctx.globalAlpha *= a;
    shadowed(ctx, () => {
      rr(ctx, P.x, y, P.w, h, 44);
      ctx.fillStyle = rgb(top);
      ctx.fill();
    });
    rr(ctx, P.x, y, P.w, h, 44);
    ctx.clip();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, rgb(top));
    g.addColorStop(1, rgb(bot));
    ctx.fillStyle = g;
    ctx.fillRect(P.x, y, P.w, h);
    // yıldızlar (gece)
    for (let i = 0; i < 26; i++) {
      const sa = (1 - d) * (0.5 + 0.5 * Math.sin(t * 2 + i * 1.7));
      star(ctx, P.x + 40 + hash(i, 5) * (P.w - 80), y + 30 + hash(i, 6) * h * 0.45, 4 + hash(i, 7) * 5, sa);
    }
    // ay batar, güneş doğar
    moonIcon(ctx, P.x + P.w - 300, y + 80 + d * 60, 34, { a: 1 - d });
    const yb = y + h - 70;
    const sunP = clamp((tau - RISE + 0.12) / 1.3);
    const sy = lerp(yb + 40, y + h * 0.3, ease.out(sunP));
    if (tau > RISE - 0.15) sunIcon(ctx, P.x + P.w * 0.66, sy, 46, t, { a: clamp((tau - RISE + 0.15) / 0.2) });
    // sokak lambaları ve yürüyenler (karanlık sabah)
    if (walkers > 0) {
      for (let i = 0; i < 3; i++) {
        const lx = P.x + 120 + i * 330;
        ctx.fillStyle = 'rgba(11,22,56,0.9)';
        ctx.fillRect(lx - 4, yb - 120, 8, 120);
        E.glow(ctx, lx, yb - 124, 90, [253, 214, 150], 0.55 * walkers * (1 - d));
        ctx.fillStyle = '#fde7b8';
        dot(ctx, lx, yb - 124, 9);
      }
    }
    // Panel silueti zaten panele kırpılı
    skyline(ctx, P.x, yb, P.w, `rgba(11,22,56,${lerp(0.92, 0.75, d)})`);
    if (walkers > 0) {
      const wx = P.x + 80 + ((t * 40) % 760);
      for (let i = 0; i < 2; i++) person(ctx, wx + i * 70, yb + 2, 0.9 - i * 0.1, t + i, walkers, i === 0);
    }
    ctx.restore();
    // saat göstergesi
    T(ctx, hhmm(tau), P.x + 50, y + 70, { size: 76, weight: 900, color: d > 0.6 ? C.ink : '#fff', align: 'left', alpha: a });
    T(ctx, 'İstanbul · 21 Aralık', P.x + 52, y + 130, { size: 30, weight: 800, color: d > 0.6 ? C.ink : 'rgba(255,255,255,0.8)', align: 'left', alpha: a });
  }
  // Yürüyen kişi silueti (çanta ile)
  function person(ctx, x, yb, s, t, a = 1, bag = true) {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, yb);
    ctx.scale(s, s);
    ctx.fillStyle = '#081129';
    ctx.strokeStyle = '#081129';
    ctx.lineCap = 'round';
    const sw = Math.sin(t * 6);
    dot(ctx, 0, -92, 13);
    ctx.lineWidth = 16;
    line(ctx, 0, -76, 0, -40);
    ctx.lineWidth = 10;
    line(ctx, 0, -40, 12 * sw, 0);
    line(ctx, 0, -40, -12 * sw, 0);
    line(ctx, 0, -70, 14 * -sw, -44);
    if (bag) {
      rr(ctx, -24, -78, 16, 30, 5);
      ctx.fill();
    }
    ctx.restore();
  }
  // Zaman ekseni 06–10, gün doğumu işareti
  const AX = { x0: 120, x1: 960 };
  const ax = (tau) => lerp(AX.x0, AX.x1, (tau - 6) / 4);
  function axis(ctx, t, y, { a = 1, mark = 0 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    // gece / gündüz şeridi
    rr(ctx, AX.x0, y - 10, AX.x1 - AX.x0, 20, 10);
    ctx.save();
    ctx.clip();
    const xr = ax(RISE);
    ctx.fillStyle = C.night;
    ctx.fillRect(AX.x0, y - 10, xr - AX.x0, 20);
    const g = ctx.createLinearGradient(xr - 40, 0, xr + 120, 0);
    g.addColorStop(0, C.amber);
    g.addColorStop(1, C.cyan);
    ctx.fillStyle = g;
    ctx.fillRect(xr, y - 10, AX.x1 - xr, 20);
    ctx.restore();
    for (let h = 6; h <= 10; h++) {
      T(ctx, `${String(h).padStart(2, '0')}:00`, ax(h), y + 46, { size: 26, weight: 800, color: C.muted });
      ctx.fillStyle = C.muted;
      dot(ctx, ax(h), y, 4);
    }
    if (mark > 0) {
      const xr2 = ax(RISE);
      ctx.save();
      ctx.translate(xr2, y);
      ctx.scale(mark, mark);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = C.amber;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 5;
      rr(ctx, -16, -16, 32, 32, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  // Eksen üstündeki simge: çalar saat, okul çantası, çanta
  function axisIcon(ctx, kind, tau, y, a, s) {
    if (a <= 0.002) return;
    const x = ax(tau);
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = C.night;
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 8]);
    line(ctx, x, y - 14, x, y - 64);
    ctx.setLineDash([]);
    ctx.translate(x, y - 112);
    ctx.scale(s, s);
    ctx.fillStyle = C.night;
    dot(ctx, 0, 0, 46);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    if (kind === 'alarm') {
      ctx.beginPath();
      ctx.arc(0, 4, 20, 0, Math.PI * 2);
      ctx.stroke();
      line(ctx, 0, 4, 0, -8);
      line(ctx, 0, 4, 8, 8);
      dot(ctx, -16, -16, 7);
      dot(ctx, 16, -16, 7);
    } else if (kind === 'bus') {
      rr(ctx, -24, -20, 48, 38, 8);
      ctx.fill();
      ctx.fillStyle = C.night;
      rr(ctx, -18, -14, 16, 12, 3);
      ctx.fill();
      rr(ctx, 2, -14, 16, 12, 3);
      ctx.fill();
      ctx.fillStyle = '#fff';
      dot(ctx, -13, 22, 6);
      dot(ctx, 13, 22, 6);
    } else {
      rr(ctx, -22, -8, 44, 30, 6);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-8, -8);
      ctx.lineTo(-8, -16);
      ctx.lineTo(8, -16);
      ctx.lineTo(8, -8);
      ctx.stroke();
    }
    ctx.restore();
  }

  DRAW['k-late'] = function (ctx, t) {
    withWipe('k-late', ctx, t, 540, 960, () => {
      dayBg(ctx, t);
      seriesTag(ctx);
      const s0 = S0('k-late');
      // yıl boyu yaz saati
      const ha = fadeIn(t, s0 + 0.2, 0.4);
      pill(ctx, "2016'DAN BERİ", 540, 340, { size: 30, fill: C.amber, color: C.ink, a: ha, scale: lerp(0.7, 1, pop(t, s0 + 0.2)) });
      T(ctx, 'Yıl boyu yaz saati', 540, 430, { size: 70, weight: 900, color: C.ink, alpha: ha });
      monthStrip(ctx, t, 500, {
        a: fadeIn(t, s0 + 0.35),
        fill0: progress(t, s0 + 0.4, s0 + 1.3, ease.linear),
        fillTR: progress(t, cue('k-late', 0) + 0.6, cue('k-late', 0) + 1.6, ease.linear),
        hl: after(t, 'k-late', 1, 0.4),
      });
      // İstanbul paneli
      const pa = after(t, 'k-late', 1, 0.5);
      const rise0 = cue('k-late', 2) - 0.2;
      const tau = lerp(6.5, RISE, progress(t, rise0, rise0 + 2.4, ease.inOut)) + Math.max(0, t - rise0 - 2.4) * 0.03;
      ctx.save();
      ctx.translate(0, (1 - ease.out(pa)) * 60);
      skyPanel(ctx, t, Math.min(tau, RISE + 0.05), { a: pa });
      axis(ctx, t, 1360, { a: pa, mark: pop(t, rise0 + 2.4) });
      ctx.restore();
      // 08:25 vurgusu
      const ma = progress(t, rise0 + 2.4, rise0 + 2.8);
      if (ma > 0) {
        const s = lerp(0.6, 1, pop(t, rise0 + 2.4));
        ctx.save();
        ctx.translate(ax(RISE), 1250);
        ctx.scale(s, s);
        pill(ctx, '08:25 gün doğumu', 0, 0, { size: 32, fill: C.amber, color: C.ink, a: ma });
        ctx.restore();
        T(ctx, 'Edirne 08:36 · İzmir 08:24 · Ankara 08:06', 540, 1460, { size: 30, weight: 700, color: C.muted, alpha: progress(t, rise0 + 2.9, rise0 + 3.3) });
      }
    });
  };

  DRAW['k-dark'] = function (ctx, t) {
    dayBg(ctx, t);
    seriesTag(ctx);
    const s0 = S0('k-dark');
    // üst blok (aylar) kaybolur; panel yukarı kayar
    const up = progress(t, s0, s0 + 0.7, ease.inOut);
    const out = 1 - up;
    pill(ctx, "2016'DAN BERİ", 540, 340 - up * 200, { size: 30, fill: C.amber, color: C.ink, a: out });
    T(ctx, 'Yıl boyu yaz saati', 540, 430 - up * 200, { size: 70, weight: 900, color: C.ink, alpha: out });
    monthStrip(ctx, t, 500 - up * 200, { a: out, fill0: 1, fillTR: 1, hl: 1 });
    // sabah: karanlıkta yola çıkış
    const tau = lerp(RISE + 0.05, 7.6, progress(t, s0, s0 + 0.9, ease.inOut));
    const py = lerp(P.y, 330, up);
    ctx.save();
    skyPanel(ctx, t, tau, { y: py, h: lerp(P.h, 370, up), walkers: after(t, 'k-dark', 0, 0.5) });
    ctx.restore();
    const ay = lerp(1360, 880, up);
    axis(ctx, t, ay, { mark: 1 });
    [['alarm', 7.0], ['bus', 7.55], ['work', 8.05]].forEach(([k, tt], i) => {
      const at = cue('k-dark', 0) + 0.25 + i * 0.28;
      axisIcon(ctx, k, tt, ay, fadeIn(t, at, 0.2), pop(t, at));
    });
    pill(ctx, 'güneşten önce yoldayız', 540, ay + 112, { size: 32, fill: C.night, a: after(t, 'k-dark', 0, 0.5, ease.out) * fadeIn(t, cue('k-dark', 0) + 1.0) });
    // gece: uyku geç geliyor
    const na = after(t, 'k-dark', 1, 0.5);
    const ny = 1060;
    ctx.save();
    ctx.translate(0, (1 - ease.out(na)) * 80);
    card(ctx, 70, ny, 940, 420, { r: 44, fill: C.night, a: na });
    ctx.save();
    ctx.globalAlpha *= na;
    rr(ctx, 70, ny, 940, 420, 44);
    ctx.clip();
    for (let i = 0; i < 18; i++) star(ctx, 100 + hash(i, 21) * 880, ny + 20 + hash(i, 22) * 160, 3 + hash(i, 23) * 5, 0.4 + 0.4 * Math.sin(t * 2 + i));
    moonIcon(ctx, 930, ny + 80, 40, {});
    ctx.restore();
    // iç saat geride: duvar saati 23:00, iç saat 22:00
    clockFace(ctx, 200, ny + 150, 78, 23 * 60, { a: na, ring: C.cyan, num: false });
    T(ctx, 'saat 23:00', 200, ny + 268, { size: 28, weight: 800, color: '#fff', alpha: na });
    const lag = after(t, 'k-dark', 1, 1.0, ease.inOut);
    clockFace(ctx, 400, ny + 150, 78, lerp(23 * 60, 22 * 60, lag), { a: na, ring: C.amber, num: false });
    T(ctx, 'iç saat', 400, ny + 268, { size: 28, weight: 800, color: C.amberSoft, alpha: na });
    // uykuya dalış çizelgesi 22–02
    const bx0 = 540;
    const bx1 = 960;
    const by = ny + 150;
    const bxv = (h) => lerp(bx0, bx1, (h - 22) / 4);
    ctx.save();
    ctx.globalAlpha *= na;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    line(ctx, bx0, by, bx1, by);
    for (const h of [22, 24, 26]) {
      T(ctx, `${String(h % 24).padStart(2, '0')}:00`, bxv(h), by + 44, { size: 24, weight: 800, color: 'rgba(255,255,255,0.7)' });
    }
    const sl = after(t, 'k-dark', 2, 1.0, ease.inOut);
    const sx = bxv(lerp(23, 24.5, sl));
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 6;
    if (sl > 0.05) {
      ctx.setLineDash([6, 10]);
      line(ctx, bxv(23), by, sx - 20, by);
      ctx.setLineDash([]);
    }
    ctx.restore();
    // yatak ve uyanık kişi
    bed(ctx, bxv(lerp(23, 24.5, sl)), by - 60, 0.9, t, na, sl);
    T(ctx, 'uykuya dalış', sx, by + 96, { size: 28, weight: 800, color: C.amberSoft, alpha: na });
    pill(ctx, 'uyku geç geliyor', 540, ny + 360, { size: 34, fill: C.amber, color: C.ink, a: after(t, 'k-dark', 2, 0.4), scale: lerp(0.7, 1, pop(t, cue('k-dark', 2) + 0.2)) });
    ctx.restore();
  };
  // Yatak simgesi; awake 1'den küçüldükçe göz kapanır, Zzz gelir
  function bed(ctx, x, y, s, t, a, sleepy) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = '#fff';
    rr(ctx, -60, 0, 120, 34, 10);
    ctx.fill();
    ctx.fillStyle = C.cyan;
    rr(ctx, -66, -6, 20, 50, 8);
    ctx.fill();
    ctx.fillStyle = C.cyanSoft;
    rr(ctx, -44, -16, 34, 20, 9);
    ctx.fill();
    ctx.fillStyle = C.amber;
    dot(ctx, -28, -26, 16);
    // göz: açık (uyanık) → kapanır
    ctx.fillStyle = C.night;
    const open = 1 - clamp((sleepy - 0.75) / 0.25);
    ctx.beginPath();
    ctx.ellipse(-22, -28, 3, 3 * Math.max(0.15, open), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d7ece8';
    rr(ctx, -8, -4, 64, 18, 8);
    ctx.fill();
    ctx.restore();
    const z = clamp((sleepy - 0.85) / 0.15);
    if (z > 0) {
      for (let i = 0; i < 3; i++) {
        const u = (t * 0.6 + i / 3) % 1;
        T(ctx, 'z', x + 10 + u * 50, y - 40 - u * 60, { size: 22 + i * 6, weight: 900, color: '#fff', alpha: z * (1 - u) });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 6 · Uyku bilimi ne öneriyor?
  // ---------------------------------------------------------------------------
  function sunriseIcon(ctx, x, y, s, t, a, late) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.save();
    ctx.beginPath();
    ctx.rect(-80, -90, 160, 90);
    ctx.clip();
    sunIcon(ctx, 0, late ? 12 : -10, 34, t, { rays: 0.8 });
    ctx.restore();
    ctx.strokeStyle = late ? 'rgba(255,255,255,0.8)' : C.ink;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    line(ctx, -70, 0, 70, 0);
    ctx.restore();
  }
  DRAW['k-science'] = function (ctx, t) {
    withWipe('k-science', ctx, t, 540, 960, () => {
      dayBg(ctx, t);
      seriesTag(ctx);
      const s0 = S0('k-science');
      const ha = fadeIn(t, s0 + 0.15, 0.4);
      T(ctx, 'uyku bilimcilerinin önerisi', 540, 345, { hand: true, size: 64, weight: 700, color: C.amber, alpha: ha });
      T(ctx, 'Hangi saat kalıcı olmalı?', 540, 425, { size: 58, weight: 900, color: C.ink, alpha: ha });
      // kart A: kalıcı yaz saati (bugün)
      const aA = after(t, 'k-science', 1, 0.45);
      const dim = after(t, 'k-science', 2, 0.5);
      ctx.save();
      ctx.translate(0, (1 - ease.out(aA)) * 50);
      ctx.globalAlpha *= lerp(1, 0.55, dim);
      card(ctx, 90, 520, 900, 330, { r: 44, fill: C.night, a: aA });
      sunriseIcon(ctx, 230, 690, 1.25, t, aA, true);
      T(ctx, 'Kalıcı yaz saati', 360, 610, { size: 52, weight: 900, color: '#fff', align: 'left', alpha: aA });
      T(ctx, 'bugün Türkiye', 360, 668, { size: 32, weight: 700, color: 'rgba(255,255,255,0.75)', align: 'left', alpha: aA });
      T(ctx, 'gün doğumu 08:25', 360, 750, { size: 40, weight: 900, color: C.amberSoft, align: 'left', alpha: aA });
      ctx.restore();
      checkBadge(ctx, 930, 560, 46, { a: dim, s: pop(t, cue('k-science', 2) - 0.1), fill: '#8a96b0', cross: true });
      // kart B: kalıcı kış saati (önerilen)
      const aB = after(t, 'k-science', 2, 0.45);
      ctx.save();
      ctx.translate(0, (1 - ease.out(aB)) * 50);
      card(ctx, 90, 900, 900, 360, { r: 44, fill: C.teal, a: aB });
      sunriseIcon(ctx, 230, 1085, 1.25, t, aB, false);
      T(ctx, 'Kalıcı kış saati', 360, 990, { size: 52, weight: 900, color: '#fff', align: 'left', alpha: aB });
      T(ctx, 'sabah ışığı bir saat erken', 360, 1048, { size: 32, weight: 700, color: 'rgba(255,255,255,0.85)', align: 'left', alpha: aB });
      T(ctx, 'gün doğumu 07:25', 360, 1130, { size: 40, weight: 900, color: C.amberSoft, align: 'left', alpha: aB });
      ctx.restore();
      const okT = cue('k-science', 2) + 0.9;
      checkBadge(ctx, 930, 940, 56, { a: fadeIn(t, okT, 0.1), s: pop(t, okT) });
      pill(ctx, 'ÖNERİLEN', 790, 1222, { size: 28, fill: C.amber, color: C.ink, a: fadeIn(t, okT + 0.2), scale: lerp(0.6, 1, pop(t, okT + 0.2)) });
      // sparkle
      for (let i = 0; i < 6; i++) {
        const u = clamp((t - okT) / 0.8);
        if (u <= 0 || u >= 1) continue;
        const th = (i / 6) * Math.PI * 2;
        star(ctx, 930 + Math.cos(th) * (60 + u * 70), 940 + Math.sin(th) * (60 + u * 70), 12 * (1 - u), 1, i % 2 ? C.amber : C.cyan);
      }
      T(ctx, 'AASM · SRBR · Sleep Research Society', 540, 1340, { size: 28, weight: 700, color: C.muted, alpha: fadeIn(t, okT + 0.5) });
      T(ctx, '(İstanbul, 21 Aralık)', 540, 1385, { size: 26, weight: 700, color: C.muted, alpha: fadeIn(t, okT + 0.5) });
    });
  };

  // ---------------------------------------------------------------------------
  // 7 · Bu kış dene
  // ---------------------------------------------------------------------------
  function windowIcon(ctx, x, y, s, t, a) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    rr(ctx, -60, -70, 120, 140, 14);
    ctx.save();
    ctx.clip();
    const g = ctx.createLinearGradient(0, -70, 0, 70);
    g.addColorStop(0, '#9fd6dc');
    g.addColorStop(1, '#fde7b8');
    ctx.fillStyle = g;
    ctx.fillRect(-60, -70, 120, 140);
    sunIcon(ctx, 18, 10 - Math.sin(t) * 4, 20, t, { rays: 0.7 });
    ctx.restore();
    ctx.strokeStyle = C.tealDeep;
    ctx.lineWidth = 10;
    rr(ctx, -60, -70, 120, 140, 14);
    ctx.stroke();
    ctx.lineWidth = 7;
    line(ctx, 0, -70, 0, 70);
    line(ctx, -60, 0, 60, 0);
    ctx.restore();
  }
  function lampIcon(ctx, x, y, s, t, a, level) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    E.glow(ctx, x, y + 10 * s, 150 * s * (0.4 + 0.6 * level), [253, 214, 150], 0.7 * level);
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = C.amber;
    ctx.beginPath();
    ctx.moveTo(-46, 0);
    ctx.lineTo(-26, -56);
    ctx.lineTo(26, -56);
    ctx.lineTo(46, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255,243,214,${0.4 + 0.6 * level})`;
    dot(ctx, 0, 10, 12);
    ctx.fillStyle = '#e3dccd';
    ctx.fillRect(-5, 0, 10, 64);
    rr(ctx, -34, 60, 68, 14, 7);
    ctx.fill();
    ctx.restore();
  }
  DRAW['k-tip'] = function (ctx, t) {
    withWipe('k-tip', ctx, t, 540, 960, () => {
      dayBg(ctx, t);
      seriesTag(ctx);
      const s0 = S0('k-tip');
      // kilitli saat → güneş
      const ca = fadeIn(t, s0 + 0.15) * (1 - after(t, 'k-tip', 1, 0.5));
      clockFace(ctx, 540, 450, 120, 180, { a: ca, ring: C.teal });
      lockIcon(ctx, 620, 370, 70, { a: ca });
      const sa = after(t, 'k-tip', 1, 0.5);
      sunIcon(ctx, 540, 450, 70 * lerp(0.4, 1, pop(t, cue('k-tip', 1))), t, { a: sa });
      T(ctx, 'ışık senin elinde', 540, 640, { hand: true, size: 76, weight: 700, color: C.amber, alpha: sa });
      // kartlar
      const a1 = after(t, 'k-tip', 2, 0.45);
      ctx.save();
      ctx.translate((1 - ease.out(a1)) * -80, 0);
      card(ctx, 90, 730, 900, 270, { r: 44, fill: C.amberSoft, a: a1 });
      windowIcon(ctx, 220, 865, 0.95, t, a1);
      T(ctx, 'SABAH', 350, 800, { size: 30, weight: 900, color: C.teal, align: 'left', spacing: 3, alpha: a1 });
      T(ctx, 'ilk 30 dk gün ışığı', 350, 862, { size: 52, weight: 900, color: C.ink, align: 'left', alpha: a1 });
      T(ctx, 'balkon, pencere, kısa bir yürüyüş', 350, 922, { size: 30, weight: 700, color: C.muted, align: 'left', alpha: a1 });
      ctx.restore();
      const a2 = after(t, 'k-tip', 3, 0.45);
      const dimL = progress(t, cue('k-tip', 3) + 0.4, cue('k-tip', 3) + 1.6, ease.inOut);
      ctx.save();
      ctx.translate((1 - ease.out(a2)) * 80, 0);
      card(ctx, 90, 1040, 900, 270, { r: 44, fill: C.night, a: a2 });
      lampIcon(ctx, 220, 1160, 1.05, t, a2, 1 - 0.75 * dimL);
      moonIcon(ctx, 930, 1090, 26, { a: a2 * dimL });
      T(ctx, 'AKŞAM', 350, 1110, { size: 30, weight: 900, color: C.cyan, align: 'left', spacing: 3, alpha: a2 });
      T(ctx, 'ışıkları kıs', 350, 1172, { size: 52, weight: 900, color: '#fff', align: 'left', alpha: a2 });
      T(ctx, 'ekranın parlaklığı da dahil', 350, 1232, { size: 30, weight: 700, color: 'rgba(255,255,255,0.75)', align: 'left', alpha: a2 });
      ctx.restore();
      T(ctx, 'Bu kış dene', 540, 1400, { hand: true, size: 70, weight: 700, color: C.teal, alpha: fadeIn(t, cue('k-tip', 3) + 0.8) });
    });
  };

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
  DRAW['k-cta'] = function (ctx, t) {
    withWipe('k-cta', ctx, t, 540, 960, () => {
      dayBg(ctx, t);
      const s0 = S0('k-cta');
      // simge: yuvarlak kare zıplar, sembol sapından yukarı büyür, üstünden ışık geçer
      const ip = pop(t, s0 + 0.2, 0.7);
      const rev = progress(t, s0 + 0.5, s0 + 1.4, ease.inOut);
      const shine = progress(t, s0 + 1.5, s0 + 2.2, ease.inOut);
      ctx.save();
      ctx.translate(540, 620);
      ctx.scale(ip, ip);
      ctx.rotate((1 - clamp((t - s0 - 0.2) / 0.7)) * -0.2);
      appIcon(ctx, 0, 0, 380, { a: clamp(ip * 3), reveal: rev, shine: shine > 0 && shine < 1 ? shine : -1 });
      ctx.restore();
      // halka dalgaları
      for (let i = 0; i < 2; i++) {
        const u = clamp((t - s0 - 0.35 - i * 0.25) / 1.2);
        if (u <= 0 || u >= 1) continue;
        ctx.save();
        ctx.strokeStyle = i ? C.amber : C.teal;
        ctx.globalAlpha = 0.5 * (1 - u);
        ctx.lineWidth = 8;
        rr(ctx, 540 - 190 - u * 120, 620 - 190 - u * 120, 380 + u * 240, 380 + u * 240, 60 + u * 40);
        ctx.stroke();
        ctx.restore();
      }
      // yazı markası
      const wa = progress(t, cue('k-cta', 0) + 0.6, cue('k-cta', 0) + 1.1, ease.out);
      ctx.save();
      ctx.translate(0, (1 - wa) * 30);
      T(ctx, 'YUP', 540, 930, { size: 150, weight: 900, color: C.teal, alpha: wa, spacing: 4 });
      T(ctx, 'Akademi', 540, 1045, { size: 84, weight: 600, color: C.tealDeep, alpha: wa });
      ctx.restore();
      const ga = progress(t, cue('k-cta', 0) + 1.0, cue('k-cta', 0) + 1.5);
      T(ctx, 'Merak et  •  Keşfet  •  Öğren', 540, 1130, { size: 36, weight: 700, color: C.ink, alpha: ga });
      // el yazısı slogan ve altı çizgi
      const sa = progress(t, cue('k-cta', 1) - 0.1, cue('k-cta', 1) + 0.4);
      ctx.save();
      ctx.translate(540, 1215);
      ctx.rotate(-0.04);
      T(ctx, 'Küçük bir merak, büyük bir keşif.', 0, 0, { hand: true, size: 64, weight: 700, color: C.teal, alpha: sa });
      ctx.strokeStyle = C.amber;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.globalAlpha *= sa;
      const uw = 420 * progress(t, cue('k-cta', 1) + 0.2, cue('k-cta', 1) + 0.8, ease.inOut);
      if (uw > 1) {
        ctx.beginPath();
        ctx.moveTo(-60, 44);
        ctx.quadraticCurveTo(-60 + uw / 2, 56, -60 + uw, 36);
        ctx.stroke();
      }
      ctx.restore();
      // abone ol düğmesi: el gelir, basar, düğme "abone olundu"ya döner, zil çalar
      const ba = progress(t, cue('k-cta', 1) + 0.1, cue('k-cta', 1) + 0.5, ease.out);
      const tap = lineEnd('k-cta') + 0.35;
      const done = t > tap;
      const press = Math.exp(-(((t - tap) / 0.09) ** 2));
      const bs = lerp(0.7, 1, pop(t, cue('k-cta', 1) + 0.1)) * (1 - 0.06 * press);
      const label = done ? 'ABONE OLUNDU' : 'ABONE OL';
      const fs = done ? 46 : 54;
      const tw = M(ctx, label, { size: fs, weight: 900, spacing: 3 });
      const bw = tw + 190;
      ctx.save();
      ctx.translate(540, 1370);
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
      // el imleci
      const hp = progress(t, tap - 0.7, tap - 0.05, ease.inOut);
      const ha = fadeIn(t, tap - 0.7, 0.2) * (1 - progress(t, tap + 0.7, tap + 1.0));
      if (ha > 0) {
        ctx.save();
        ctx.globalAlpha *= ha;
        hand(ctx, lerp(900, 640, hp), lerp(1640, 1400, hp), 1.6, press);
        ctx.restore();
      }
      // kutlama parıltıları
      for (let i = 0; i < 14; i++) {
        const u = clamp((t - tap) / 1.1);
        if (u <= 0 || u >= 1) continue;
        const th = (i / 14) * Math.PI * 2 + hash(i, 4);
        const d = 330 + u * (200 + hash(i, 5) * 160);
        const col = [C.amber, C.teal, C.cyan, C.green][i % 4];
        star(ctx, 540 + Math.cos(th) * d * 1.3, 1370 + Math.sin(th) * d * 0.7, 16 * (1 - u), 1, col);
      }
    });
  };

  // ---------------------------------------------------------------------------
  // Ses notası
  // ---------------------------------------------------------------------------
  function score(m, hz) {
    hz = hz ?? window.Synth.hz;
    const c = cue;
    const bell = (t, note, gain = 0.06, pan = 0) => m.bell(t, { freq: hz(note), gain, decay: 2.4, pan });
    const popS = (t, note, gain = 0.04, pan = 0) => m.pop(t, { freq: hz(note), gain, pan });
    const dur = TL.duration;
    // sıcak, sakin yatak: sahneye göre akor
    const chords = {
      'k-hook': ['D3', 'A3', 'F#4', 'C#5'],
      'k-ask': ['B2', 'F#3', 'D4', 'A4'],
      'k-clock': ['G2', 'D3', 'B3', 'F#4'],
      'k-late': ['E3', 'B3', 'G4', 'D5'],
      'k-dark': ['C3', 'G3', 'E4', 'B4'],
      'k-science': ['A2', 'E3', 'C#4', 'G#4'],
      'k-tip': ['D3', 'A3', 'F#4', 'B4'],
      'k-cta': ['D3', 'A3', 'F#4', 'A4'],
    };
    for (const id of ORDER) {
      const a = S0(id);
      const b = id === 'k-cta' ? dur : S1(id);
      m.pad(Math.max(0, a - 0.2), b - a + 0.4, chords[id], { gain: 0.11, attack: 0.5, release: 1.2, cutoff: 1100 });
    }
    // 1 · saat tıkırtısı, geri sarma, kilit
    const back0 = c('k-hook', 0) + 0.9;
    for (let x = 0.1; x < back0; x += 0.5) m.tick(x, { gain: 0.05, tone: x % 1 < 0.5 ? 5200 : 4200, pan: -0.3 });
    m.whoosh(back0, { dur: 1.5, from: 3200, to: 300, gain: 0.07, panFrom: -0.5, panTo: -0.2 });
    for (let i = 0; i < 10; i++) m.tick(back0 + i * 0.15, { gain: 0.04, tone: 6000, pan: -0.4 });
    popS(back0 + 0.25, 'A5', 0.05, -0.3);
    m.click(c('k-hook', 1) + 0.2, { gain: 0.16, tone: 1400, pan: 0.3 });
    popS(c('k-hook', 1) + 0.25, 'D5', 0.05, 0.3);
    // 2 · soru
    bell(c('k-ask', 0) + 0.1, 'F#5', 0.05);
    [0, 1, 2].forEach((i) => popS(c('k-ask', 0) + 0.15 + i * 0.18, ['B4', 'D5', 'F#5'][i], 0.03));
    // 3 · güneş, sinyal, kurma
    m.riser(c('k-clock', 1), 0.9, { gain: 0.05 });
    m.whoosh(c('k-clock', 2), { dur: 0.8, from: 500, to: 2500, gain: 0.05 });
    for (let i = 0; i < 8; i++) m.tick(c('k-clock', 2) + 0.9 + i * 0.11, { gain: 0.05, tone: 3800 });
    bell(c('k-clock', 2) + 1.8, 'B5', 0.07);
    popS(c('k-clock', 0) + 0.05, 'D5');
    // 4 · aylar, gün doğumu
    const s4 = S0('k-late');
    for (let i = 0; i < 12; i++) m.blip(s4 + 0.4 + i * 0.075, { freq: hz(['E5', 'G5', 'B5'][i % 3]), dur: 0.06, gain: 0.015 });
    for (let i = 0; i < 12; i++) m.blip(c('k-late', 0) + 0.6 + i * 0.083, { freq: hz(['B4', 'D5', 'E5'][i % 3]), dur: 0.06, gain: 0.015 });
    const rise0 = c('k-late', 2) - 0.2;
    m.riser(rise0, 2.4, { gain: 0.05 });
    for (let i = 0; i < 16; i++) m.tick(rise0 + i * 0.15, { gain: 0.03, tone: 5000 });
    bell(rise0 + 2.4, 'E5', 0.08);
    bell(rise0 + 2.55, 'B5', 0.05);
    // 5 · karanlık sabah, gece
    ['alarm', 'school', 'work'].forEach((_, i) => popS(c('k-dark', 0) + 0.25 + i * 0.28, ['C5', 'E5', 'G5'][i], 0.04));
    m.whoosh(c('k-dark', 1), { dur: 0.8, from: 1800, to: 400, gain: 0.04 });
    m.hum(c('k-dark', 1), 2.5, { gain: 0.03 });
    popS(c('k-dark', 2) + 0.2, 'E5');
    // 6 · öneri kartları
    popS(c('k-science', 1), 'A4');
    m.blip(c('k-science', 2) - 0.1, { freq: 220, dur: 0.25, gain: 0.03 });
    popS(c('k-science', 2), 'C#5');
    bell(c('k-science', 2) + 0.9, 'E5', 0.08);
    bell(c('k-science', 2) + 1.05, 'A5', 0.06);
    // 7 · öneriler
    bell(c('k-tip', 1) + 0.1, 'F#5', 0.05);
    popS(c('k-tip', 2), 'D5', 0.05, -0.2);
    popS(c('k-tip', 3), 'A4', 0.05, 0.2);
    // 8 · logo ve abone
    const s8 = S0('k-cta');
    m.whoosh(s8 - 0.1, { dur: 0.7, from: 300, to: 2200, gain: 0.06 });
    m.boom(s8 + 0.25, { gain: 0.16, freq: 70 });
    ['D5', 'F#5', 'A5', 'D6'].forEach((n, i) => bell(s8 + 0.5 + i * 0.16, n, 0.06, -0.3 + i * 0.2));
    const tap = lineEnd('k-cta') + 0.35;
    m.click(tap, { gain: 0.25, tone: 2600 });
    bell(tap + 0.05, 'A5', 0.08, 0.2);
    bell(tap + 0.2, 'D6', 0.06, -0.2);
  }

  window.FILM = E.film({
    title: 'Saatler geri alınmıyor: vücudun buna ne diyor? · YUP Akademi',
    width: SW,
    height: SH,
    fade: 0,
    timeline: TL,
    background,
    score,
    narration: VOICE,
    voice: VOICE.voice,
  });
})();
