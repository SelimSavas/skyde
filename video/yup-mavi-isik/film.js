/*
 * YUP Akademi — Gecenin Mavi Işığı: Ekran Işığı Beynimizdeki Saati Nasıl Kandırır?
 *
 * Bölümler: gece yarısı · iç saat · orkestra şefi (SCN) · melatonin · gizli dedektif (ipRGC) ·
 * ekran ve deneyler · dürüst olalım · üç kural · kapanış.
 * Sahneler koreografi zamanıyla çizilir; anlatılan öğeler cue('satır', öbek) ile anlatıcının söylediği
 * anda belirir. Vuruş kimliği satır kimliğiyle aynıdır. Kaynaklar: kaynaklar.md.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { W, H, clamp, lerp, ease, progress, vis, hash, noise, rgba, text, measure, paragraph, glow, roundRect } = E;

  const C = {
    cream: '#f3ede1',
    muted: '#9aa3b8',
    dim: '#4d566b',
    line: '#2a3450',
    wire: '#3a4664',
    night: '#060a16',
    sun: '#ffb547',
    warm: '#ff8a3d',
    blue: '#5aa9ff',
    ice: '#bfe0ff',
    mel: '#b49cff',
    ok: '#7fe0a3',
    error: '#ff5468',
    skin: '#2a3348',
    brain: '#24304a',
  };
  const BLUE = [90, 169, 255];
  const SUN = [255, 181, 71];
  const WARM = [255, 138, 61];
  const MEL = [180, 156, 255];
  const RED = [255, 84, 104];

  // ---------------------------------------------------------------------------
  // Sahneler ve vuruşlar (vuruş uzunluğu satırın tahmini okuma süresinden çıkar)
  // ---------------------------------------------------------------------------
  const SCRIPT = window.NARRATION ?? { lines: [] };
  const sayOf = Object.fromEntries(SCRIPT.lines.map((l) => [l.id, l.say]));
  // Kayıt varsa (voice.js) satırın gerçek süresi, yoksa harf sayısından tahmin; ardından küçük bir pay
  const recorded = Object.fromEntries((window.VOICE?.lines ?? []).filter((v) => v.say === sayOf[v.id]).map((v) => [v.id, v.dur]));
  const estimate = (id) => {
    if (recorded[id]) return recorded[id] + 0.6;
    const ph = E.phrases(sayOf[id] ?? '');
    return ph.reduce((n, p) => n + p.length / 13, 0) + 0.42 * Math.max(0, ph.length - 1) + 1.1;
  };
  // animasyon payı (satırdan sonra görüntünün kalacağı ek süre)
  const EXTRA = {
    'h-night': 1.2, 'h-off': 1.4, 'h-awake': 1.2, 'h-promise': 2.4,
    'c-earth': 0.8, 'c-period': 1.2, 'c-reset': 1.6,
    's-size': 0.8, 's-conductor': 1.4,
    'm-path': 1.2, 'm-curve': 1.4, 'm-effect': 1.2,
    'e-rods': 0.6, 'e-blue': 1.0, 'e-wire': 0.8, 'e-blind': 1.4,
    'x-stop': 1.0, 'x-result': 1.6, 'x-tablet': 0.8, 'x-dim': 1.0, 'x-vary': 1.6,
    'n-filter': 1.0, 'n-amount': 1.4,
    'r-night': 0.8, 'r-phone': 1.6,
    'z-fire': 1.0, 'z-tonight': 1.2, 'z-end': 3.0,
  };
  // satır, vuruşun başından bu kadar sonra başlar (sahne girişleri için)
  const LEAD = {
    'h-night': 2.2, 'c-earth': 1.0, 's-where': 1.0, 'm-call': 0.8, 'e-how': 0.8,
    'x-back': 0.8, 'n-honest': 0.8, 'r-rules': 0.8, 'z-fire': 1.0, 'h-promise': 0.6,
  };
  const PLAN = [
    { id: 'night', title: 'Gece yarısı', beats: ['h-night', 'h-off', 'h-awake', 'h-promise'], fadeIn: 1.0 },
    { id: 'clock', title: 'İç saat', beats: ['c-earth', 'c-body', 'c-name', 'c-period', 'c-reset'] },
    { id: 'scn', title: 'Orkestra şefi', beats: ['s-where', 's-size', 's-conductor'] },
    { id: 'mel', title: 'Melatonin', beats: ['m-call', 'm-path', 'm-curve', 'm-signal', 'm-effect'] },
    { id: 'eye', title: 'Gizli dedektif', beats: ['e-how', 'e-rods', 'e-discovery', 'e-measure', 'e-blue', 'e-wire', 'e-blind'] },
    { id: 'screen', title: 'Ekran ve deneyler', beats: ['x-back', 'x-report', 'x-stop', 'x-study', 'x-result', 'x-tablet', 'x-dim', 'x-vary'] },
    { id: 'honest', title: 'Dürüst olalım', beats: ['n-honest', 'n-content', 'n-filter', 'n-amount'] },
    { id: 'rules', title: 'Üç kural', beats: ['r-rules', 'r-day', 'r-evening', 'r-night', 'r-phone'] },
    { id: 'close', title: 'Kapanış', beats: ['z-fire', 'z-remember', 'z-tonight', 'z-end'], fadeOut: 2.0 },
  ];
  const BEATS = {};
  const DRAW = {};
  const SCENES = PLAN.map((p) => {
    let a = 0.3;
    for (const id of p.beats) {
      const len = (LEAD[id] ?? 0) + estimate(id) + (EXTRA[id] ?? 0);
      BEATS[id] = [p.id, a, a + len, a + len - 0.7];
      a += len + 0.1;
    }
    return { id: p.id, title: p.title, base: a + 0.3, fadeIn: p.fadeIn, fadeOut: p.fadeOut, draw: (ctx, lt, t) => DRAW[p.id](ctx, lt, t) };
  });
  for (const l of SCRIPT.lines) if (LEAD[l.id]) l.offset = LEAD[l.id];
  const PAUSE = {
    'h-off': 0.8, 'h-awake': 0.6, 'h-promise': 1.0, 'c-period': 0.6, 'c-reset': 0.8, 's-conductor': 0.8,
    'm-curve': 0.8, 'm-signal': 0.6, 'm-effect': 1.0, 'e-blue': 0.6, 'e-blind': 1.0, 'x-stop': 0.6,
    'x-result': 1.0, 'x-tablet': 0.6, 'x-vary': 1.2, 'n-amount': 1.0, 'r-phone': 1.2, 'z-remember': 0.6, 'z-end': 2.0,
  };
  const BREATH = 0.9;
  const build = (holds, slow) => E.timeline(SCENES.map((sc) => {
    const mine = Object.entries(BEATS).filter(([, b]) => b[0] === sc.id);
    return {
      ...sc,
      stretch: mine.map(([id, [, a, b]]) => [a, b, slow[id] ?? 1]).filter(([, , k]) => k !== 1),
      holds: mine.filter(([id]) => holds[id] > 0).map(([id, [, , , f]]) => [f, holds[id]]),
    };
  }));
  const VOICE = E.narration({ build, beats: BEATS, lines: SCRIPT.lines, voice: window.VOICE, pauses: PAUSE, breath: BREATH });
  const TL = VOICE.timeline;
  const cue = VOICE.cue;
  const lineEnd = VOICE.end;
  const after = (t, id, k = 0, d = 0.6, fn = ease.out) => progress(t, cue(id, k), cue(id, k) + d, fn);
  const afterEnd = (t, id, dt = 0, d = 0.6, fn = ease.out) => progress(t, lineEnd(id) + dt, lineEnd(id) + dt + d, fn);
  const sceneStart = (id) => TL.scene(id).start;
  const sceneEnd = (id) => TL.scene(id).end;
  // bir satırın başından (cue 0) bir sonrakinin başına kadar görünürlük
  const during = (t, first, last, fi = 0.5, fo = 0.5) => vis(t, cue(first, 0) - 0.3, last ? cue(last, 0) - 0.2 : Infinity, fi, fo);

  // ---------------------------------------------------------------------------
  // Ortak çizimler
  // ---------------------------------------------------------------------------
  function background(ctx) {
    const g = ctx.createRadialGradient(W / 2, H * 0.45, 60, W / 2, H * 0.5, W * 0.75);
    g.addColorStop(0, '#0f1730');
    g.addColorStop(1, '#03050c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function kicker(ctx, str, a, x = 120, y = 96) {
    if (a <= 0) return;
    text(ctx, str, x, y, { size: 24, weight: 600, spacing: 8, color: C.muted, align: 'left', alpha: a });
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = C.blue;
    ctx.fillRect(x, y + 26, 44 * a, 3);
    ctx.restore();
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

  function chip(ctx, str, x, y, a, { color = C.cream, border = C.line, size = 28, fill = 'rgba(10,15,30,0.92)', align = 'center', weight = 600 } = {}) {
    if (a <= 0.002) return;
    const w = measure(ctx, str, { size, weight }) + size * 1.4;
    const h = size * 1.9;
    const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
    ctx.save();
    ctx.globalAlpha *= a;
    roundRect(ctx, x0, y - h / 2, w, h, h / 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = border;
    ctx.stroke();
    ctx.restore();
    text(ctx, str, x0 + w / 2, y + 1, { size, weight, color, alpha: a });
  }

  function panel(ctx, x, y, w, h, a = 1, { border = C.line, fill = 'rgba(10,15,30,0.9)', r = 22 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = border;
    ctx.stroke();
    ctx.restore();
  }

  // Ekranın ortasında büyük, sakin bir cümle (bölüm vurguları)
  function statement(ctx, str, y, a, { size = 64, color = C.cream, family = 'display', weight = 700, maxW = 1400 } = {}) {
    if (a <= 0.002) return;
    paragraph(ctx, str, W / 2, y + (1 - a) * 16, maxW, { size, family, weight, color, alpha: a, valign: 'middle', lineHeight: size * 1.18 });
  }

  function drawStars(ctx, t, alpha, maxY = 720, seed = 1, n = 160, x0 = 0, x1 = W) {
    if (alpha <= 0.002) return;
    for (let i = 0; i < n; i++) {
      const x = x0 + hash(i, seed) * (x1 - x0);
      const y = hash(i, seed + 1) * maxY;
      const tw = 0.35 + 0.65 * noise(t * (0.6 + hash(i, seed + 3)) + i * 3.3, 5);
      ctx.fillStyle = rgba([235, 238, 255], alpha * tw * (0.35 + 0.65 * hash(i, seed + 5)));
      dot(ctx, x, y, 0.6 + hash(i, seed + 2) * 1.6);
    }
  }

  function drawMoon(ctx, x, y, r, a = 1, bg = '#060a16') {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    glow(ctx, x, y, r * 5, [200, 210, 240], 0.12);
    ctx.fillStyle = '#e9e4d4';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = bg;
    dot(ctx, x + r * 0.45, y - r * 0.2, r * 0.92);
    ctx.restore();
  }

  function drawSun(ctx, x, y, r, a = 1, t = 0) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    glow(ctx, x, y, r * 4, SUN, 0.35);
    ctx.strokeStyle = C.sun;
    ctx.lineWidth = r * 0.12;
    ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const an = (i / 12) * Math.PI * 2 + t * 0.15;
      line(ctx, x + Math.cos(an) * r * 1.35, y + Math.sin(an) * r * 1.35, x + Math.cos(an) * r * 1.7, y + Math.sin(an) * r * 1.7);
    }
    ctx.fillStyle = C.sun;
    dot(ctx, x, y, r);
    ctx.restore();
  }

  // Kadranlı saat: h saat (0–24 kadranlı ise 24'lük), kol açısı saatten
  function clockFace(ctx, x, y, r, hours, a = 1, { dial = 12, color = C.cream, ring = C.wire, hand2 = null, label = '' } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(10,15,30,0.92)';
    dot(ctx, x, y, r);
    ctx.strokeStyle = ring;
    ctx.lineWidth = r * 0.06;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = C.muted;
    for (let i = 0; i < dial; i++) {
      const an = (i / dial) * Math.PI * 2 - Math.PI / 2;
      ctx.lineWidth = i % (dial / 4) === 0 ? r * 0.045 : r * 0.02;
      line(ctx, x + Math.cos(an) * r * 0.78, y + Math.sin(an) * r * 0.78, x + Math.cos(an) * r * 0.9, y + Math.sin(an) * r * 0.9);
    }
    const hand = (h, len, w, col) => {
      const an = (h / dial) * Math.PI * 2 - Math.PI / 2;
      ctx.strokeStyle = col;
      ctx.lineWidth = w;
      ctx.lineCap = 'round';
      line(ctx, x, y, x + Math.cos(an) * len, y + Math.sin(an) * len);
    };
    if (hand2 != null) hand(hand2, r * 0.72, r * 0.05, C.muted);
    hand(hours, r * 0.7, r * 0.07, color);
    ctx.fillStyle = color;
    dot(ctx, x, y, r * 0.07);
    ctx.restore();
    if (label) text(ctx, label, x, y + r + 40, { size: 26, weight: 600, color: C.muted, alpha: a });
  }

  // Yan profilden kafa: yüz sağa bakar. Yerel koordinatlar (birim ≈ px, s ölçek)
  const HEAD = {
    eye: [128, -34],
    chiasm: [26, -6],
    scn: [26, -26],
    pvn: [18, -50],
    pineal: [-62, -66],
    stem: [-38, 40],
    cordLow: [-40, 300],
    ganglion: [24, 236],
  };
  function headPath(ctx) {
    ctx.beginPath();
    ctx.moveTo(-110, 320);
    ctx.bezierCurveTo(-118, 230, -150, 190, -186, 120);
    ctx.bezierCurveTo(-232, 30, -230, -150, -150, -222);
    ctx.bezierCurveTo(-80, -280, 80, -282, 140, -200);
    ctx.bezierCurveTo(178, -150, 172, -96, 168, -64);
    ctx.bezierCurveTo(176, -40, 190, -10, 210, 30);
    ctx.bezierCurveTo(214, 44, 196, 50, 176, 54);
    ctx.bezierCurveTo(180, 80, 176, 100, 160, 112);
    ctx.bezierCurveTo(168, 130, 160, 150, 150, 160);
    ctx.bezierCurveTo(150, 196, 120, 214, 80, 214);
    ctx.bezierCurveTo(70, 250, 66, 290, 66, 320);
    ctx.closePath();
  }
  function brainPath(ctx) {
    ctx.beginPath();
    ctx.moveTo(-170, -40);
    ctx.bezierCurveTo(-190, -150, -110, -232, -10, -236);
    ctx.bezierCurveTo(90, -238, 150, -170, 146, -90);
    ctx.bezierCurveTo(144, -50, 110, -20, 70, -12);
    ctx.bezierCurveTo(40, 0, 0, 4, -30, 30);
    ctx.bezierCurveTo(-60, 60, -110, 60, -140, 40);
    ctx.bezierCurveTo(-170, 20, -172, -10, -170, -40);
    ctx.closePath();
  }
  // opt: brain (beyin görünürlüğü), xray, glowScn, glowPineal, eyeOpen (0 kapalı, 1 açık)
  function drawHead(ctx, x, y, s, a = 1, opt = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha *= a;
    headPath(ctx);
    ctx.fillStyle = opt.xray ? 'rgba(20,28,48,0.75)' : C.skin;
    ctx.fill();
    ctx.lineWidth = 3 / s;
    ctx.strokeStyle = opt.xray ? 'rgba(124,180,255,0.55)' : 'rgba(120,140,180,0.35)';
    ctx.stroke();
    const br = opt.brain ?? 0;
    if (br > 0) {
      ctx.save();
      ctx.globalAlpha *= br;
      brainPath(ctx);
      ctx.fillStyle = C.brain;
      ctx.fill();
      ctx.strokeStyle = 'rgba(150,170,220,0.45)';
      ctx.lineWidth = 2.5 / s;
      ctx.stroke();
      ctx.clip();
      // kıvrımlar
      ctx.strokeStyle = 'rgba(150,170,220,0.18)';
      ctx.lineWidth = 3 / s;
      for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        for (let k = 0; k <= 30; k++) {
          const u = k / 30;
          const px = -180 + u * 340;
          const py = -210 + i * 26 + Math.sin(u * 14 + i * 1.7) * 9;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();
      // beyin sapı ve omurilik
      ctx.save();
      ctx.globalAlpha *= br;
      ctx.strokeStyle = 'rgba(150,170,220,0.4)';
      ctx.lineWidth = 26 / s;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-40, 20);
      ctx.bezierCurveTo(-46, 120, -44, 220, -40, 330);
      ctx.stroke();
      ctx.restore();
    }
    // göz
    const [ex, ey] = HEAD.eye;
    const open = opt.eyeOpen ?? 1;
    ctx.fillStyle = '#dfe6f5';
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(ex + 16, ey, 14, 12 * Math.max(0.08, open), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a2236';
    if (open > 0.2) dot(ctx, ex + 22, ey, 6 * open);
    ctx.restore();
    if (open < 0.95) {
      ctx.strokeStyle = 'rgba(200,210,235,0.8)';
      ctx.lineWidth = 2.5 / s;
      ctx.beginPath();
      ctx.moveTo(ex + 2, ey + 1);
      ctx.quadraticCurveTo(ex + 16, ey + 7, ex + 30, ey + 1);
      ctx.stroke();
    }
    if (br > 0) {
      ctx.save();
      ctx.globalAlpha *= br;
      // görme siniri ve çaprazlaşma
      ctx.strokeStyle = 'rgba(190,210,255,0.45)';
      ctx.lineWidth = 7 / s;
      ctx.lineCap = 'round';
      line(ctx, ex - 6, ey + 4, HEAD.chiasm[0], HEAD.chiasm[1]);
      line(ctx, HEAD.chiasm[0], HEAD.chiasm[1], -60, 10);
      ctx.restore();
      const scnG = opt.glowScn ?? 0;
      if (scnG > 0) {
        glow(ctx, HEAD.scn[0], HEAD.scn[1], 60, opt.scnColor ?? SUN, 0.7 * scnG * br);
        ctx.fillStyle = rgba(opt.scnColor ?? SUN, br * scnG);
        dot(ctx, HEAD.scn[0] - 6, HEAD.scn[1], 6);
        dot(ctx, HEAD.scn[0] + 6, HEAD.scn[1], 6);
      }
      const pg = opt.glowPineal ?? 0;
      if (pg > 0) {
        glow(ctx, HEAD.pineal[0], HEAD.pineal[1], 56, MEL, 0.7 * pg * br);
        ctx.save();
        ctx.translate(HEAD.pineal[0], HEAD.pineal[1]);
        ctx.rotate(-0.5);
        ctx.fillStyle = rgba(MEL, br * pg);
        ctx.beginPath();
        ctx.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }
  // kafa yerel noktasını ekran noktasına çevir
  const headPt = (x, y, s, [px, py]) => [x + px * s, y + py * s];

  // Kıvrık bir yol üzerinde ilerleyen ışık (pts: ekran noktaları; p: 0–1)
  function travel(ctx, pts, p, color, a = 1, r = 8, trail = 0.18) {
    if (a <= 0.002 || p <= 0) return;
    const segs = [];
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      segs.push(l);
      total += l;
    }
    const at = (u) => {
      let d = clamp(u) * total;
      for (let i = 0; i < segs.length; i++) {
        if (d <= segs[i]) {
          const k = d / segs[i];
          return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
        }
        d -= segs[i];
      }
      return pts[pts.length - 1];
    };
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = rgba(color, 0.5);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let k = 0; k <= 40; k++) {
      const [x, y] = at(p * (k / 40));
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    const [hx, hy] = at(p);
    glow(ctx, hx, hy, r * 5, color, 0.8);
    ctx.fillStyle = rgba(color, 1);
    dot(ctx, hx, hy, r);
    ctx.restore();
    return at;
  }

  // Melatonin parçacığı (küçük ay)
  function melDot(ctx, x, y, r, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    glow(ctx, x, y, r * 3, MEL, 0.35);
    ctx.fillStyle = C.mel;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(6,10,22,0.9)';
    dot(ctx, x + r * 0.45, y - r * 0.25, r * 0.8);
    ctx.restore();
  }

  // Telefon (önden): ekran parlaklığı b 0–1, renk mavi→sıcak w 0–1
  function phone(ctx, x, y, s, a = 1, { b = 1, warm = 0, rot = 0, content = true } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.globalAlpha *= a;
    const col = [lerp(150, 255, warm), lerp(200, 170, warm), lerp(255, 110, warm)];
    if (b > 0) glow(ctx, 0, 0, 260, col, 0.35 * b);
    roundRect(ctx, -60, -120, 120, 240, 20);
    ctx.fillStyle = '#0b0f1a';
    ctx.fill();
    ctx.strokeStyle = '#3a4664';
    ctx.lineWidth = 4;
    ctx.stroke();
    roundRect(ctx, -52, -108, 104, 216, 12);
    const g = ctx.createLinearGradient(0, -108, 0, 108);
    g.addColorStop(0, rgba(col, 0.25 + 0.65 * b));
    g.addColorStop(1, rgba(col.map((c) => c * 0.6), 0.2 + 0.55 * b));
    ctx.fillStyle = b > 0.02 ? g : '#05070d';
    ctx.fill();
    if (content && b > 0.05) {
      ctx.fillStyle = rgba([255, 255, 255], 0.55 * b);
      for (let i = 0; i < 5; i++) {
        roundRect(ctx, -40, -88 + i * 40, 80 - (i % 2) * 22, 24, 8);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 0 · Gece yarısı
  // ---------------------------------------------------------------------------
  const phoneOffAt = () => cue('h-off', 0) + 0.25;

  function drawBedroom(ctx, t, a, { phoneB = 1, eyes = 1, dark = 0, hand = true, clock = null, day = 0 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = '#0a1020';
    ctx.fillRect(0, 0, W, H);
    // oda biraz yakından
    ctx.translate(960, 560);
    ctx.scale(1.18, 1.18);
    ctx.translate(-960, -520);
    // duvar ve zemin
    ctx.fillStyle = '#0a1020';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#070b16';
    ctx.fillRect(0, 780, W, H - 780);
    // pencere: ay ve yıldızlar
    const wx = 220;
    const wy = 170;
    ctx.save();
    roundRect(ctx, wx, wy, 330, 290, 10);
    ctx.clip();
    ctx.fillStyle = '#060a16';
    ctx.fillRect(wx, wy, 330, 290);
    drawStars(ctx, t, 0.9 * (1 - day), wy + 290, 7, 50, wx, wx + 330);
    drawMoon(ctx, wx + 230, wy + 90, 32, 1 - day);
    if (day > 0) {
      const sky = ctx.createLinearGradient(0, wy, 0, wy + 290);
      sky.addColorStop(0, `rgba(120,170,230,${day})`);
      sky.addColorStop(1, `rgba(255,200,140,${day})`);
      ctx.fillStyle = sky;
      ctx.fillRect(wx, wy, 330, 290);
      drawSun(ctx, wx + 90, wy + 220, 30, day, t);
    }
    ctx.restore();
    ctx.strokeStyle = '#1c2640';
    ctx.lineWidth = 10;
    roundRect(ctx, wx, wy, 330, 290, 10);
    ctx.stroke();
    line(ctx, wx + 165, wy, wx + 165, wy + 290);
    line(ctx, wx, wy + 145, wx + 330, wy + 145);
    // yatak
    ctx.fillStyle = '#141c30';
    roundRect(ctx, 520, 650, 1000, 120, 18);
    ctx.fill();
    ctx.fillStyle = '#1a2440';
    roundRect(ctx, 490, 520, 40, 260, 10);
    ctx.fill();
    // yastık
    ctx.fillStyle = '#26324e';
    ctx.beginPath();
    ctx.ellipse(650, 640, 120, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    // yorgan altında beden
    ctx.fillStyle = '#2c3a5c';
    ctx.beginPath();
    ctx.moveTo(700, 660);
    ctx.bezierCurveTo(760, 560, 900, 570, 1000, 600);
    ctx.bezierCurveTo(1150, 640, 1300, 600, 1420, 620);
    ctx.bezierCurveTo(1480, 628, 1500, 650, 1500, 680);
    ctx.lineTo(700, 690);
    ctx.closePath();
    ctx.fill();
    // baş (yandan, yukarı bakıyor)
    ctx.fillStyle = '#3a3346';
    dot(ctx, 650, 590, 52);
    ctx.fillStyle = '#1b1622';
    ctx.beginPath();
    ctx.arc(650, 590, 54, Math.PI * 0.95, Math.PI * 1.95);
    ctx.fill();
    // göz
    if (eyes > 0.5) {
      ctx.fillStyle = '#e9eef9';
      dot(ctx, 668, 574, 6);
    } else {
      ctx.strokeStyle = '#e9eef9';
      ctx.lineWidth = 3;
      line(ctx, 660, 576, 676, 576);
    }
    // kol ve telefon
    const ph = [700, 420];
    if (hand) {
    ctx.strokeStyle = '#3a3346';
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(760, 620);
    ctx.quadraticCurveTo(800, 500, ph[0] + 10, ph[1] + 40);
    ctx.stroke();
    if (phoneB > 0.01) {
      // yüze vuran mavi ışık konisi
      ctx.save();
      const g = ctx.createLinearGradient(ph[0], ph[1], 650, 590);
      g.addColorStop(0, rgba(BLUE, 0.4 * phoneB));
      g.addColorStop(1, rgba(BLUE, 0.05 * phoneB));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(ph[0] - 40, ph[1] + 40);
      ctx.lineTo(ph[0] + 40, ph[1] + 40);
      ctx.lineTo(720, 640);
      ctx.lineTo(580, 600);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      glow(ctx, 650, 585, 140, BLUE, 0.35 * phoneB);
    }
    phone(ctx, ph[0], ph[1], 0.42, 1, { b: phoneB, rot: Math.PI * 0.94, content: false });
    }
    // komodin ve dijital saat
    ctx.fillStyle = '#121a2c';
    ctx.fillRect(1560, 640, 200, 140);
    roundRect(ctx, 1580, 590, 160, 56, 10);
    ctx.fillStyle = '#05070d';
    ctx.fill();
    const mins = 30 + Math.floor(clamp((t - sceneStart('night')) / 7, 0, 29));
    text(ctx, clock ?? `01:${String(mins).padStart(2, '0')}`, 1660, 619, { size: 34, family: 'mono', weight: 700, color: '#ff6a5a' });
    ctx.restore();
    if (dark > 0) {
      ctx.fillStyle = `rgba(2,3,8,${0.55 * dark * a})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // Uyanık beyin: kafanın içinde "gündüz" sanan saat
  function drawAwakeBrain(ctx, t, a) {
    if (a <= 0.002) return;
    const x = 820;
    const y = 560;
    const s = 1.55;
    const alarm = 0.5 + 0.5 * Math.sin(t * 7);
    drawHead(ctx, x, y, s, a, { brain: 1, xray: true, eyeOpen: 0, glowScn: 0.6 + 0.4 * alarm, scnColor: SUN });
    const [sx, sy] = headPt(x, y, s, HEAD.scn);
    // içerideki saat: güneş gösteriyor
    const cx = 1420;
    const cy = 420;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = rgba(SUN, 0.5);
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    line(ctx, sx + 10, sy - 6, cx - 130, cy + 40);
    ctx.setLineDash([]);
    ctx.restore();
    panel(ctx, cx - 180, cy - 170, 360, 340, a, { border: rgba(SUN, 0.6) });
    drawSun(ctx, cx, cy - 30, 54, a, t);
    text(ctx, 'GÜNDÜZ', cx, cy + 110, { size: 44, weight: 800, spacing: 6, color: C.sun, alpha: a * (0.6 + 0.4 * alarm) });
    // alarm halkaları
    for (let k = 0; k < 3; k++) {
      const p = ((t * 0.9 + k / 3) % 1);
      ctx.save();
      ctx.globalAlpha *= a * (1 - p) * 0.6;
      ctx.strokeStyle = C.sun;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sx, sy, 20 + p * 90, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  DRAW.night = function sceneNight(ctx, lt, t) {
    const off = progress(t, phoneOffAt(), phoneOffAt() + 0.4);
    const toBrain = progress(t, cue('h-awake', 1) - 0.3, cue('h-awake', 1) + 0.9, ease.inOut);
    const toTitle = progress(t, cue('h-promise', 0) - 0.2, cue('h-promise', 0) + 0.8, ease.inOut);
    drawBedroom(ctx, t, 1 - toBrain, { phoneB: 1 - off, eyes: t < cue('h-off', 2) ? 1 : 0, dark: off });
    // "sadece beş dakika daha"
    chip(ctx, 'sadece 5 dakika daha…', 980, 400, during(t, 'h-night', 'h-off') * after(t, 'h-night', 3, 0.5), { size: 30, color: C.ice, border: rgba(BLUE, 0.5) });
    drawAwakeBrain(ctx, t, toBrain * (1 - toTitle));
    // başlık
    if (toTitle > 0) {
      const a = toTitle;
      glow(ctx, W / 2, 470, 520, BLUE, 0.18 * a);
      text(ctx, 'GECENİN MAVİ IŞIĞI', W / 2, 470, { size: 104, family: 'display', weight: 800, spacing: 6, color: C.cream, alpha: a });
      text(ctx, 'Ekran ışığı beynimizdeki saati nasıl kandırır?', W / 2, 580, { size: 40, family: 'serif', italic: true, color: C.ice, alpha: a * after(t, 'h-promise', 0, 1.0) });
      text(ctx, 'YUP AKADEMİ', W / 2, 700, { size: 24, weight: 700, spacing: 10, color: C.muted, alpha: a * after(t, 'h-promise', 1, 1.0) });
    }
  };

  // ---------------------------------------------------------------------------
  // 1 · İç saat
  // ---------------------------------------------------------------------------
  function drawEarth(ctx, x, y, r, t, a) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    glow(ctx, x, y, r * 1.6, [90, 140, 255], 0.18);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#16305a';
    ctx.fill();
    ctx.clip();
    // dönen kıtalar
    const spin = t * 0.25;
    ctx.fillStyle = '#2f6b5a';
    for (let i = 0; i < 7; i++) {
      const lon = ((hash(i, 3) * 2 * Math.PI + spin) % (2 * Math.PI));
      const cx = x + Math.sin(lon) * r * 0.85;
      const vis1 = Math.cos(lon);
      if (vis1 < -0.1) continue;
      const cy = y + (hash(i, 4) - 0.5) * r * 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * (0.12 + hash(i, 5) * 0.2) * (0.3 + 0.7 * vis1), r * (0.1 + hash(i, 6) * 0.18), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // gece yarısı (sağ taraf karanlık, güneş solda)
    const g = ctx.createLinearGradient(x - r, 0, x + r, 0);
    g.addColorStop(0, 'rgba(255,200,120,0.12)');
    g.addColorStop(0.48, 'rgba(0,0,0,0)');
    g.addColorStop(0.56, 'rgba(2,4,12,0.75)');
    g.addColorStop(1, 'rgba(2,4,12,0.85)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }

  // 24 saatlik küçük grafik: fn(h) 0–1
  function miniWave(ctx, x, y, w, h, fn, color, a, cursor) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = 'rgba(58,70,100,0.6)';
    ctx.lineWidth = 2;
    line(ctx, x, y + h, x + w, y + h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let k = 0; k <= 96; k++) {
      const hr = (k / 96) * 24;
      const px = x + (k / 96) * w;
      const py = y + h - fn(hr) * h;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    if (cursor != null) {
      const px = x + (cursor / 24) * w;
      ctx.fillStyle = color;
      dot(ctx, px, y + h - fn(cursor) * h, 7);
    }
    ctx.restore();
  }
  const wave = (peak, width = 6) => (h) => {
    let d = Math.abs(h - peak);
    d = Math.min(d, 24 - d);
    return Math.exp(-((d / width) ** 2));
  };

  DRAW.clock = function sceneClock(ctx, lt, t) {
    kicker(ctx, 'İÇ SAAT', vis(t, sceneStart('clock'), sceneEnd('clock'), 0.6, 0.5));
    // c-earth: dönen dünya ve güneş
    const ea = during(t, 'c-earth', 'c-body');
    drawSun(ctx, 260, 540, 70, ea, t);
    drawEarth(ctx, 960, 540, 230, t, ea);
    text(ctx, '24 saat', 960, 860, { size: 44, family: 'display', weight: 700, color: C.cream, alpha: ea * after(t, 'c-earth', 0, 0.6) });
    drawMoon(ctx, 1620, 380, 40, ea * after(t, 'c-earth', 1, 0.8));
    drawStars(ctx, t, ea * 0.6 * after(t, 'c-earth', 1, 0.8), 1080, 4, 70, 1250, 1900);

    // c-body: dört ritim
    const ba = during(t, 'c-body', 'c-name');
    const cur = (t * 2.2) % 24;
    const rows = [
      ['vücut ısısı', wave(17, 7), C.warm, 1],
      ['hormonlar', wave(3, 5), C.mel, 2],
      ['uyanıklık', wave(14, 8), C.sun, 3],
      ['acıkma', (h) => 0.5 * wave(8, 2.5)(h) + 0.6 * wave(13, 2.5)(h) + 0.55 * wave(19.5, 2.5)(h), C.ok, 4],
    ];
    rows.forEach(([label, fn, col, k], i) => {
      const ra = ba * after(t, 'c-body', k, 0.6);
      const y = 250 + i * 170;
      text(ctx, label, 420, y + 60, { size: 34, weight: 600, color: col, align: 'right', alpha: ra });
      miniWave(ctx, 470, y, 1100, 110, fn, col, ra, cur);
    });
    if (ba > 0) {
      ['00', '06', '12', '18', '24'].forEach((s, i) => text(ctx, s, 470 + i * 275, 940, { size: 24, family: 'mono', color: C.dim, alpha: ba }));
    }

    // c-name: sirkadiyen
    const na = during(t, 'c-name', 'c-period');
    statement(ctx, 'SİRKADİYEN RİTİM', 420, na * after(t, 'c-name', 0, 0.7), { size: 96, weight: 800 });
    const la = na * after(t, 'c-name', 1, 0.6);
    chip(ctx, 'circa = yaklaşık', 760, 600, la, { size: 36, color: C.ice });
    chip(ctx, 'diēs = gün', 1170, 600, la * after(t, 'c-name', 2, 0.5), { size: 36, color: C.sun });

    // c-period: dünya 24:00, iç saat 24:11
    const pa = during(t, 'c-period', 'c-reset');
    const pIn = after(t, 'c-period', 1, 0.6);
    clockFace(ctx, 660, 520, 190, 0, pa * after(t, 'c-period', 0, 0.6), { dial: 60, color: C.cream, label: 'DÜNYA · bir tur' });
    clockFace(ctx, 1260, 520, 190, 11 * after(t, 'c-period', 3, 1.4, ease.inOut), pa * pIn, { dial: 60, color: C.mel, label: 'İÇ SAAT · bir tur + 11 dk' });
    text(ctx, '24 sa 00 dk', 660, 820, { size: 42, family: 'mono', weight: 700, color: C.cream, alpha: pa * after(t, 'c-period', 0, 0.6) });
    text(ctx, '24 sa 11 dk', 1260, 820, { size: 42, family: 'mono', weight: 700, color: C.mel, alpha: pa * after(t, 'c-period', 3, 0.6) });
    text(ctx, 'ortalama · kontrollü deneyler', 1260, 880, { size: 26, family: 'serif', italic: true, color: C.muted, alpha: pa * after(t, 'c-period', 3, 0.8) });

    // c-reset: günler boyunca kayma, sabah ışığı geri ayarlar
    const ra = vis(t, cue('c-reset', 0) - 0.3, sceneEnd('clock'), 0.5, 0.6);
    if (ra > 0) {
      const reset = after(t, 'c-reset', 1, 1.2, ease.inOut);
      for (let d = 0; d < 5; d++) {
        const x = 480 + d * 240;
        const drift = (d + 1) * 11; // dakika
        const shown = drift * (1 - reset);
        const dA = ra * after(t, 'c-reset', 0, 0.3 + d * 0.18);
        clockFace(ctx, x, 470, 90, shown, dA, { dial: 60, color: reset > 0.5 ? C.sun : C.mel });
        text(ctx, `${d + 1}. gün`, x, 600, { size: 26, weight: 600, color: C.muted, alpha: dA });
        text(ctx, reset > 0.5 ? '±0 dk' : `+${drift} dk`, x, 650, { size: 28, family: 'mono', weight: 700, color: reset > 0.5 ? C.ok : C.mel, alpha: dA });
        if (reset > 0) {
          // her sabah gelen ışık
          ctx.save();
          ctx.globalAlpha *= ra * reset * (1 - progress(t, cue('c-reset', 1) + 1.4, cue('c-reset', 1) + 2.4)) ;
          glow(ctx, x, 470, 140, SUN, 0.35);
          ctx.restore();
        }
      }
      drawSun(ctx, 960, 830, 46, ra * reset, t);
      text(ctx, 'sabah ışığı', 960, 920, { size: 30, family: 'serif', italic: true, color: C.sun, alpha: ra * reset });
    }
  };

  // ---------------------------------------------------------------------------
  // 2 · Orkestra şefi: SCN
  // ---------------------------------------------------------------------------
  function conductor(ctx, x, y, s, t, a) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha *= a;
    glow(ctx, 0, -40, 160, SUN, 0.35);
    ctx.fillStyle = '#1b2236';
    ctx.strokeStyle = C.sun;
    ctx.lineWidth = 3;
    // gövde
    ctx.beginPath();
    ctx.moveTo(-40, 60);
    ctx.quadraticCurveTo(-46, -20, 0, -30);
    ctx.quadraticCurveTo(46, -20, 40, 60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    dot(ctx, 0, -60, 24);
    ctx.beginPath();
    ctx.arc(0, -60, 24, 0, Math.PI * 2);
    ctx.stroke();
    // baton sallanır
    const sw = Math.sin(t * 3.2) * 0.5;
    ctx.save();
    ctx.translate(30, -16);
    ctx.rotate(-0.9 + sw);
    ctx.strokeStyle = C.cream;
    ctx.lineWidth = 4;
    line(ctx, 0, 0, 70, 0);
    ctx.restore();
    ctx.restore();
  }

  const ORGANS = [
    ['kalp', -1], ['karaciğer', 2.5], ['mide', 5], ['kaslar', 7.5], ['böbrek', 10], ['deri', 13],
  ];

  DRAW.scn = function sceneScn(ctx, lt, t) {
    kicker(ctx, 'ORKESTRA ŞEFİ', vis(t, sceneStart('scn'), sceneEnd('scn'), 0.6, 0.5));
    // kafa: SCN'nin yeri
    const ha = vis(t, sceneStart('scn'), cue('s-conductor', 0) - 0.2, 0.8, 0.6);
    const hx = 700;
    const hy = 600;
    const hs = 1.6;
    const sizeIn = after(t, 's-size', 0, 0.8);
    drawHead(ctx, hx, hy, hs, ha, { brain: after(t, 's-where', 1, 0.8), xray: true, glowScn: after(t, 's-where', 3, 0.6), scnColor: SUN });
    const [sx, sy] = headPt(hx, hy, hs, HEAD.scn);
    chip(ctx, 'hipotalamus', sx - 40, sy - 150, ha * after(t, 's-where', 2, 0.5) * (1 - sizeIn), { size: 26, color: C.muted });
    if (ha > 0 && sizeIn < 1) {
      ctx.save();
      ctx.globalAlpha *= ha * after(t, 's-where', 2, 0.5) * (1 - sizeIn);
      ctx.strokeStyle = C.muted;
      ctx.lineWidth = 2;
      line(ctx, sx - 40, sy - 128, sx - 6, sy - 20);
      ctx.restore();
    }
    chip(ctx, 'SCN · suprakiyazmatik çekirdek', sx - 40, sy + 160, ha * after(t, 's-where', 4, 0.5), { size: 28, color: C.sun, border: rgba(SUN, 0.6) });
    // büyüteç: görme sinirleri çaprazında iki küme
    const ma = ha * sizeIn;
    if (ma > 0) {
      const mx = 1430;
      const my = 470;
      const mr = 250;
      ctx.save();
      ctx.globalAlpha *= ma;
      ctx.strokeStyle = rgba(SUN, 0.5);
      ctx.lineWidth = 3;
      line(ctx, sx + 20, sy, mx - mr * 0.9, my + 60);
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(8,12,24,0.96)';
      ctx.fill();
      ctx.stroke();
      ctx.clip();
      // görme sinirleri: X
      ctx.strokeStyle = 'rgba(190,210,255,0.55)';
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      line(ctx, mx - 230, my - 10, mx + 230, my + 170);
      line(ctx, mx - 230, my + 170, mx + 230, my - 10);
      text(ctx, 'görme sinirleri', mx, my + 200, { size: 24, family: 'serif', italic: true, color: C.muted });
      // iki küme
      const ca = after(t, 's-size', 1, 0.6);
      for (const side of [-1, 1]) {
        for (let i = 0; i < 70; i++) {
          const r = Math.sqrt(hash(i, side + 5)) * 46;
          const an = hash(i, side + 9) * Math.PI * 2;
          const px = mx + side * 52 + Math.cos(an) * r;
          const py = my + 2 + Math.sin(an) * r * 0.7;
          const tw = 0.6 + 0.4 * Math.sin(t * 3 + i);
          ctx.fillStyle = rgba(SUN, ca * tw);
          dot(ctx, px, py, 5);
        }
      }
      ctx.restore();
      text(ctx, '≈ 20.000 nöron', mx, my + mr + 56, { size: 40, family: 'display', weight: 700, color: C.sun, alpha: ma * after(t, 's-size', 2, 0.6) });
    }
    // orkestra şefi ve organ saatleri
    const ca = vis(t, cue('s-conductor', 0) - 0.3, sceneEnd('scn'), 0.7, 0.6);
    if (ca > 0) {
      const sync = after(t, 's-conductor', 1, 1.6, ease.inOut);
      conductor(ctx, W / 2, 580, 1.9, t, ca);
      ORGANS.forEach(([name, ph], i) => {
        const an = (i / ORGANS.length) * Math.PI * 2 - Math.PI / 2;
        const ox = W / 2 + Math.cos(an) * 520;
        const oy = 540 + Math.sin(an) * 330;
        const base = (t * 1.5) % 24;
        const hrs = lerp(base + ph * 3, base, sync);
        // şeften organa giden nabız
        if (sync > 0) {
          const p = ((t * 0.8 + i / 6) % 1);
          ctx.save();
          ctx.globalAlpha *= ca * sync * (1 - p);
          ctx.fillStyle = C.sun;
          dot(ctx, lerp(W / 2, ox, p), lerp(520, oy, p), 6);
          ctx.restore();
        }
        clockFace(ctx, ox, oy, 80, hrs, ca * after(t, 's-conductor', 0, 0.4 + i * 0.12), { dial: 24, color: sync > 0.6 ? C.sun : C.cream });
        text(ctx, name, ox, oy + 104, { size: 26, weight: 600, color: C.muted, alpha: ca });
      });
    }
  };

  // ---------------------------------------------------------------------------
  // 3 · Melatonin
  // ---------------------------------------------------------------------------
  // Gece doruğu ≈ 03:00; gündüz neredeyse sıfır (saat 0–24 → 0–1)
  const melLevel = (h) => {
    const x = ((h - 3 + 36) % 24) - 12; // 03:00'e göre −12…+12
    const rise = 1 / (1 + Math.exp(-(x + 5.2) * 1.4)); // ~21:50'de yükselir
    const fall = 1 / (1 + Math.exp((x - 4.2) * 1.6)); // ~07:10'da düşer
    return 0.03 + 0.97 * rise * fall;
  };

  DRAW.mel = function sceneMel(ctx, lt, t) {
    kicker(ctx, 'MELATONİN', vis(t, sceneStart('mel'), sceneEnd('mel'), 0.6, 0.5));
    // kafa: SCN → epifiz yolculuğu
    const ha = vis(t, sceneStart('mel'), cue('m-curve', 0) - 0.2, 0.7, 0.6);
    const hx = 760;
    const hy = 520;
    const hs = 1.45;
    const pinG = after(t, 'm-call', 2, 0.6);
    drawHead(ctx, hx, hy, hs, ha, { brain: 1, xray: true, glowScn: 1, scnColor: SUN, glowPineal: pinG });
    const P = (k) => headPt(hx, hy, hs, HEAD[k]);
    chip(ctx, 'epifiz bezi', P('pineal')[0] - 120, P('pineal')[1] - 120, ha * pinG, { size: 28, color: C.mel, border: rgba(MEL, 0.6) });
    if (ha > 0) {
      ctx.save();
      ctx.globalAlpha *= ha * pinG;
      ctx.strokeStyle = rgba(MEL, 0.7);
      ctx.lineWidth = 2;
      line(ctx, P('pineal')[0] - 100, P('pineal')[1] - 96, P('pineal')[0] - 10, P('pineal')[1] - 8);
      ctx.restore();
      // ay doğar (hava kararınca)
      drawMoon(ctx, 1560, 260, 54, ha * after(t, 'm-call', 0, 0.8));
      drawStars(ctx, t, ha * 0.6 * after(t, 'm-call', 0, 0.8), 600, 12, 60, 1250, 1900);
    }
    // dolambaçlı yol: SCN → PVN → omurilik → boyun düğümü → epifiz
    const route = [P('scn'), P('pvn'), P('stem'), P('cordLow'), P('ganglion'), [P('ganglion')[0] + 30, P('ganglion')[1] - 160], [P('pineal')[0] + 60, P('pineal')[1] + 40], P('pineal')];
    const rp = progress(t, cue('m-path', 0) + 0.2, cue('m-path', 2) + 0.8, ease.inOut);
    travel(ctx, route, rp, SUN, ha, 8);
    chip(ctx, 'omurilik', P('cordLow')[0] - 140, P('cordLow')[1] - 60, ha * after(t, 'm-path', 1, 0.5) * (1 - after(t, 'm-curve', 0, 0.3)), { size: 24, color: C.muted });
    chip(ctx, 'boyundaki sinir düğümü', P('ganglion')[0] + 200, P('ganglion')[1], ha * after(t, 'm-path', 2, 0.5), { size: 24, color: C.muted });
    // epifizden kana melatonin (yol bittikten sonra)
    const relA = ha * progress(t, cue('m-path', 2) + 1.0, cue('m-path', 2) + 1.6);
    if (relA > 0) {
      for (let i = 0; i < 14; i++) {
        const p = ((t * 0.35 + hash(i, 21)) % 1);
        const [px, py] = P('pineal');
        melDot(ctx, px + (hash(i, 22) - 0.5) * 60 + p * 240, py + p * 260 + Math.sin(t + i) * 10, 9, relA * (1 - p));
      }
    }

    // 24 saatlik melatonin eğrisi
    const ga = vis(t, cue('m-curve', 0) - 0.3, cue('m-signal', 0) - 0.1, 0.6, 0.5);
    if (ga > 0) {
      const gx = 260;
      const gy = 260;
      const gw = 1400;
      const gh = 520;
      // gece / gündüz zemini (12:00 → 12:00)
      const hx2 = (h) => gx + (((h - 12 + 24) % 24) / 24) * gw;
      ctx.save();
      ctx.globalAlpha *= ga;
      ctx.fillStyle = 'rgba(255,181,71,0.06)';
      ctx.fillRect(gx, gy, hx2(20) - gx, gh);
      ctx.fillRect(hx2(7), gy, gx + gw - hx2(7), gh);
      ctx.fillStyle = 'rgba(90,110,200,0.08)';
      ctx.fillRect(hx2(20), gy, hx2(7) - hx2(20), gh);
      ctx.strokeStyle = C.wire;
      ctx.lineWidth = 2;
      line(ctx, gx, gy + gh, gx + gw, gy + gh);
      ctx.restore();
      ['12:00', '18:00', '00:00', '06:00', '12:00'].forEach((s, i) => text(ctx, s, gx + (i / 4) * gw, gy + gh + 40, { size: 24, family: 'mono', color: C.dim, alpha: ga }));
      drawSun(ctx, gx + 120, gy - 40, 22, ga, t);
      drawMoon(ctx, gx + gw / 2, gy - 40, 24, ga);
      drawSun(ctx, gx + gw - 120, gy - 40, 22, ga, t);
      // eğri: söylendikçe çizilir
      const draw = progress(t, cue('m-curve', 1), cue('m-curve', 4) + 0.6, ease.inOut);
      ctx.save();
      ctx.globalAlpha *= ga;
      ctx.strokeStyle = C.mel;
      ctx.lineWidth = 6;
      ctx.shadowColor = C.mel;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      const N = 200;
      for (let k = 0; k <= N * draw; k++) {
        const h = (12 + (k / N) * 24) % 24;
        const px = gx + (k / N) * gw;
        const py = gy + gh - melLevel(h) * (gh - 40);
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
      text(ctx, 'kandaki melatonin', gx, gy - 90, { size: 28, weight: 600, color: C.mel, align: 'left', alpha: ga });
      chip(ctx, 'gündüz: neredeyse yok', gx + gw * 0.13, gy + gh - 80, ga * after(t, 'm-curve', 1, 0.5), { size: 24, color: C.muted });
      chip(ctx, 'gece doruk', hx2(3), gy + 10, ga * after(t, 'm-curve', 3, 0.5), { size: 24, color: C.mel, border: rgba(MEL, 0.6) });
    }

    // m-signal: uyku hapı değil, gece sinyali
    const sa = vis(t, cue('m-signal', 0) - 0.3, cue('m-effect', 0) - 0.1, 0.6, 0.5);
    if (sa > 0) {
      const pill = after(t, 'm-signal', 0, 0.5);
      panel(ctx, 380, 330, 520, 360, sa * pill, { border: rgba(RED, 0.6) });
      // hap
      ctx.save();
      ctx.globalAlpha *= sa * pill;
      ctx.translate(640, 470);
      ctx.rotate(-0.5);
      roundRect(ctx, -90, -34, 180, 68, 34);
      ctx.fillStyle = '#d8dbe6';
      ctx.fill();
      ctx.fillStyle = '#9aa3b8';
      ctx.fillRect(0, -34, 90, 68);
      ctx.restore();
      text(ctx, 'uyku hapı', 640, 620, { size: 40, family: 'display', weight: 700, color: C.cream, alpha: sa * pill });
      ctx.save();
      ctx.globalAlpha *= sa * after(t, 'm-signal', 0, 0.9);
      ctx.strokeStyle = C.error;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      line(ctx, 470, 380, 810, 640);
      ctx.restore();
      const sig = after(t, 'm-signal', 1, 0.6);
      panel(ctx, 1020, 330, 520, 360, sa * sig, { border: rgba(MEL, 0.7) });
      melDot(ctx, 1280, 450, 54, sa * sig);
      text(ctx, '“dışarıda gece var”', 1280, 610, { size: 40, family: 'serif', italic: true, color: C.mel, alpha: sa * after(t, 'm-signal', 2, 0.6) });
    }

    // m-effect: vücut ısısı düşer, kapı aralanır
    const fa = vis(t, cue('m-effect', 0) - 0.3, sceneEnd('mel'), 0.6, 0.6);
    if (fa > 0) {
      // termometre
      const drop = after(t, 'm-effect', 0, 1.4, ease.inOut);
      const tx = 620;
      ctx.save();
      ctx.globalAlpha *= fa;
      roundRect(ctx, tx - 26, 300, 52, 380, 26);
      ctx.fillStyle = 'rgba(10,15,30,0.95)';
      ctx.fill();
      ctx.strokeStyle = C.wire;
      ctx.lineWidth = 3;
      ctx.stroke();
      const level = lerp(0.72, 0.58, drop);
      ctx.fillStyle = C.warm;
      roundRect(ctx, tx - 12, 300 + 380 * (1 - level), 24, 380 * level, 12);
      ctx.fill();
      dot(ctx, tx, 700, 44);
      ctx.restore();
      text(ctx, 'vücut ısısı biraz düşer', tx, 790, { size: 30, weight: 600, color: C.muted, alpha: fa * after(t, 'm-effect', 0, 0.6) });
      // kapı aralanır
      const door = after(t, 'm-effect', 2, 1.6, ease.inOut);
      const dx = 1220;
      const dy = 300;
      ctx.save();
      ctx.globalAlpha *= fa;
      ctx.fillStyle = '#080c18';
      ctx.fillRect(dx, dy, 300, 440);
      // kapı aralığından gece ışığı
      const gap = 300 * door * 0.6;
      const g = ctx.createLinearGradient(dx, 0, dx + gap, 0);
      g.addColorStop(0, rgba(MEL, 0.5));
      g.addColorStop(1, rgba(MEL, 0.1));
      ctx.fillStyle = g;
      ctx.fillRect(dx, dy, gap, 440);
      drawStars(ctx, t, door, dy + 440, 31, 30, dx, dx + gap);
      // kapı kanadı (perspektifle daralır)
      ctx.fillStyle = '#26324e';
      ctx.beginPath();
      ctx.moveTo(dx + gap, dy);
      ctx.lineTo(dx + 300, dy - 20 * door);
      ctx.lineTo(dx + 300, dy + 440 + 20 * door);
      ctx.lineTo(dx + gap, dy + 440);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = C.wire;
      ctx.lineWidth = 6;
      ctx.strokeRect(dx, dy, 300, 440);
      ctx.restore();
      text(ctx, 'uykunun kapısı aralanır', dx + 150, 790, { size: 30, weight: 600, color: C.mel, alpha: fa * after(t, 'm-effect', 2, 0.6) });
    }
  };

  // ---------------------------------------------------------------------------
  // 4 · Gizli dedektif: ipRGC
  // ---------------------------------------------------------------------------
  // Görünür tayf rengi (nm → rgb)
  function nmColor(nm) {
    const stops = [[380, [120, 60, 200]], [440, [60, 90, 255]], [480, [40, 170, 255]], [510, [60, 220, 120]], [560, [200, 230, 60]], [590, [255, 190, 40]], [630, [255, 90, 40]], [700, [200, 30, 30]]];
    for (let i = 1; i < stops.length; i++) {
      if (nm <= stops[i][0]) {
        const k = (nm - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
        return stops[i - 1][1].map((c, j) => Math.round(lerp(c, stops[i][1][j], k)));
      }
    }
    return stops[stops.length - 1][1];
  }
  // melanopsin duyarlılığı: ≈ 480 nm tepe
  const melanopsin = (nm) => Math.exp(-(((nm - 480) / 42) ** 2));

  function eyeball(ctx, x, y, r, a, { rays = 0 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = '#e8edf8';
    dot(ctx, x, y, r);
    ctx.fillStyle = '#d4dbea';
    dot(ctx, x - r * 0.05, y, r * 0.93);
    // retina (arka yüz, solda)
    ctx.strokeStyle = '#e8546b';
    ctx.lineWidth = r * 0.06;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.9, Math.PI * 0.62, Math.PI * 1.38);
    ctx.stroke();
    // iris ve mercek (ön, sağda)
    ctx.fillStyle = '#3b6fb0';
    ctx.beginPath();
    ctx.ellipse(x + r * 0.9, y, r * 0.08, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,220,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(x + r * 0.74, y, r * 0.12, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    // görme siniri
    ctx.strokeStyle = '#c9b48a';
    ctx.lineWidth = r * 0.16;
    line(ctx, x - r * 0.95, y + r * 0.1, x - r * 1.45, y + r * 0.2);
    ctx.restore();
    if (rays > 0) {
      ctx.save();
      ctx.globalAlpha *= a * rays;
      for (let i = -2; i <= 2; i++) {
        const g = ctx.createLinearGradient(x + r * 2, y + i * 30, x - r * 0.85, y - i * 50);
        g.addColorStop(0, rgba(BLUE, 0));
        g.addColorStop(0.4, rgba(BLUE, 0.5));
        g.addColorStop(1, rgba(BLUE, 0.8));
        ctx.strokeStyle = g;
        ctx.lineWidth = 6;
        line(ctx, x + r * 2.2, y + i * 34, x - r * 0.85, y - i * 60);
      }
      ctx.restore();
    }
  }

  // Retina kesiti paneli: üstten ışık gelir; üstte ganglion hücreleri, altta çubuk ve koniler
  function retina(ctx, x, y, w, h, t, a, { labels = 0, shapes = 0, iprgc = 0, dim = 0 } = {}) {
    if (a <= 0.002) return;
    panel(ctx, x, y, w, h, a);
    ctx.save();
    ctx.globalAlpha *= a;
    roundRect(ctx, x, y, w, h, 22);
    ctx.clip();
    // ışık okları
    for (let i = 0; i < 5; i++) {
      const px = x + w * (0.15 + i * 0.17);
      const p = ((t * 0.6 + i * 0.21) % 1);
      ctx.fillStyle = rgba(BLUE, 0.6 * (1 - p));
      dot(ctx, px, y + 40 + p * 120, 6);
    }
    text(ctx, 'ışık ↓', x + w - 70, y + 50, { size: 24, weight: 600, color: C.ice });
    const gy = y + 200;
    const n = 9;
    for (let i = 0; i < n; i++) {
      const cx = x + w * ((i + 0.5) / n);
      const special = iprgc > 0 && (i === 2 || i === 6);
      // dendritler
      ctx.strokeStyle = special ? rgba(BLUE, 0.4 + 0.5 * iprgc) : 'rgba(150,160,190,0.45)';
      ctx.lineWidth = special ? 3 : 2;
      for (let k = 0; k < (special ? 6 : 3); k++) {
        const an = -Math.PI / 2 + (k - 2.5) * 0.5;
        const L = special ? 70 : 34;
        line(ctx, cx, gy, cx + Math.cos(an) * L, gy + Math.sin(an) * L * 0.6);
      }
      if (special) glow(ctx, cx, gy, 90, BLUE, 0.5 * iprgc * (0.7 + 0.3 * Math.sin(t * 4 + i)));
      ctx.fillStyle = special ? rgba(BLUE, 0.6 + 0.4 * iprgc) : '#5b6684';
      dot(ctx, cx, gy, special ? 22 : 18);
      // aksonu aşağı-yana (görme siniri yönüne)
      ctx.strokeStyle = special ? rgba(BLUE, 0.6 * iprgc + 0.2) : 'rgba(150,160,190,0.35)';
      line(ctx, cx, gy + 18, cx + 10, gy + 70);
    }
    // fotoreseptörler
    const py = y + h - 60;
    const cones = [[255, 90, 90], [90, 220, 120], [90, 140, 255]];
    for (let i = 0; i < 26; i++) {
      const cx = x + 30 + i * ((w - 60) / 25);
      const isCone = i % 3 === 1;
      ctx.fillStyle = isCone ? rgba(cones[i % 9 < 3 ? 0 : i % 9 < 6 ? 1 : 2], 0.9 - dim * 0.6) : `rgba(170,180,210,${0.85 - dim * 0.5})`;
      if (isCone) {
        ctx.beginPath();
        ctx.moveTo(cx - 9, py);
        ctx.lineTo(cx + 9, py);
        ctx.lineTo(cx + 3, py - 70);
        ctx.lineTo(cx - 3, py - 70);
        ctx.closePath();
        ctx.fill();
      } else {
        roundRect(ctx, cx - 6, py - 120, 12, 120, 6);
        ctx.fill();
      }
    }
    ctx.restore();
    text(ctx, 'ganglion hücreleri', x + 24, y + 120, { size: 24, weight: 600, color: C.muted, align: 'left', alpha: a * labels });
    text(ctx, 'çubuk ve koni hücreleri', x + 24, y + h - 200, { size: 24, weight: 600, color: C.muted, align: 'left', alpha: a * labels });
    chip(ctx, 'şekiller · renkler', x + w / 2, y + h + 50, a * shapes, { size: 26, color: C.cream });
  }

  // ışık ölçer: değer 0–1
  function luxMeter(ctx, x, y, r, v, a) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.strokeStyle = C.line;
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI, Math.PI * 2);
    ctx.stroke();
    const g = ctx.createLinearGradient(x - r, 0, x + r, 0);
    g.addColorStop(0, '#2a3a6a');
    g.addColorStop(1, C.ice);
    ctx.strokeStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI, Math.PI * (1 + clamp(v)));
    ctx.stroke();
    const an = Math.PI * (1 + clamp(v));
    ctx.strokeStyle = C.cream;
    ctx.lineWidth = 6;
    line(ctx, x, y, x + Math.cos(an) * r * 0.8, y + Math.sin(an) * r * 0.8);
    ctx.fillStyle = C.cream;
    dot(ctx, x, y, 10);
    ctx.restore();
    text(ctx, 'karanlık', x - r, y + 40, { size: 22, color: C.dim, alpha: a });
    text(ctx, 'aydınlık', x + r, y + 40, { size: 22, color: C.dim, alpha: a });
  }

  DRAW.eye = function sceneEye(ctx, lt, t) {
    kicker(ctx, 'GİZLİ DEDEKTİF', vis(t, sceneStart('eye'), sceneEnd('eye'), 0.6, 0.5));
    // e-how: kafa, SCN ile göz arasında soru
    const qa = during(t, 'e-how', 'e-rods');
    const hx = 760;
    const hy = 560;
    const hs = 1.4;
    drawHead(ctx, hx, hy, hs, qa, { brain: 1, xray: true, glowScn: 1, scnColor: SUN });
    if (qa > 0) {
      const [sx, sy] = headPt(hx, hy, hs, HEAD.scn);
      const [ex, ey] = headPt(hx, hy, hs, HEAD.eye);
      ctx.save();
      ctx.globalAlpha *= qa * after(t, 'e-how', 1, 0.5);
      ctx.strokeStyle = C.muted;
      ctx.setLineDash([8, 10]);
      ctx.lineWidth = 3;
      line(ctx, sx, sy - 10, ex + 20, ey - 10);
      ctx.restore();
      text(ctx, '?', (sx + ex) / 2 + 10, sy - 80, { size: 90, family: 'display', weight: 800, color: C.sun, alpha: qa * after(t, 'e-how', 1, 0.5) * (1 - after(t, 'e-how', 2, 0.4)) });
      glow(ctx, ex + 24, ey, 90, BLUE, 0.7 * qa * after(t, 'e-how', 2, 0.4));
    }
    // e-rods → e-measure: göz ve retina kesiti
    const ra = vis(t, cue('e-rods', 0) - 0.3, cue('e-blue', 0) - 0.1, 0.6, 0.5);
    if (ra > 0) {
      eyeball(ctx, 470, 560, 230, ra, { rays: 0.7 });
      // büyüteç bağlantısı
      ctx.save();
      ctx.globalAlpha *= ra;
      ctx.strokeStyle = rgba(BLUE, 0.4);
      ctx.lineWidth = 3;
      line(ctx, 470 - 210, 520, 900, 260);
      line(ctx, 470 - 210, 600, 900, 860);
      ctx.restore();
      const ipr = after(t, 'e-discovery', 1, 0.9);
      const meas = vis(t, cue('e-measure', 0) - 0.3, Infinity, 0.6, 0.5);
      retina(ctx, 900, 230, 820, 640, t, ra * (1 - 0.75 * meas), { labels: after(t, 'e-rods', 1, 0.5), shapes: after(t, 'e-rods', 2, 0.5) * (1 - after(t, 'e-discovery', 0, 0.4)), iprgc: ipr });
      chip(ctx, '2002', 1310, 190, ra * after(t, 'e-discovery', 0, 0.5) * (1 - meas), { size: 34, color: C.sun, border: rgba(SUN, 0.6), weight: 800 });
      chip(ctx, 'ipRGC · ışığa duyarlı ganglion hücreleri', 1310, 910, ra * after(t, 'e-discovery', 2, 0.5) * (1 - meas), { size: 28, color: C.ice, border: rgba(BLUE, 0.6) });
      // e-measure: şekil görmez, yalnızca ölçer
      if (meas > 0) {
        const mx = 1310;
        // büyük ipRGC hücresi
        glow(ctx, mx - 200, 520, 200, BLUE, 0.5 * ra * meas);
        ctx.save();
        ctx.globalAlpha *= ra * meas;
        ctx.strokeStyle = rgba(BLUE, 0.8);
        ctx.lineWidth = 5;
        for (let k = 0; k < 8; k++) {
          const an = (k / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(mx - 200, 520);
          ctx.quadraticCurveTo(mx - 200 + Math.cos(an + 0.4) * 80, 520 + Math.sin(an + 0.4) * 80, mx - 200 + Math.cos(an) * 150, 520 + Math.sin(an) * 150);
          ctx.stroke();
        }
        ctx.fillStyle = C.blue;
        dot(ctx, mx - 200, 520, 46);
        ctx.fillStyle = C.ice;
        for (let k = 0; k < 10; k++) dot(ctx, mx - 200 + Math.cos(k * 2.4) * 24 * hash(k, 3), 520 + Math.sin(k * 2.4) * 24 * hash(k, 4), 4);
        ctx.restore();
        text(ctx, 'melanopsin', mx - 200, 700, { size: 28, family: 'serif', italic: true, color: C.ice, alpha: ra * meas * after(t, 'e-measure', 1, 0.5) });
        // şekil görmez
        const noShape = after(t, 'e-measure', 0, 0.5);
        ctx.save();
        ctx.globalAlpha *= ra * meas * noShape;
        ctx.strokeStyle = C.cream;
        ctx.lineWidth = 4;
        ctx.strokeRect(mx + 80, 300, 180, 130);
        ctx.beginPath();
        ctx.moveTo(mx + 90, 420);
        ctx.lineTo(mx + 150, 350);
        ctx.lineTo(mx + 190, 395);
        ctx.lineTo(mx + 215, 370);
        ctx.lineTo(mx + 250, 420);
        ctx.stroke();
        ctx.strokeStyle = C.error;
        ctx.lineWidth = 8;
        line(ctx, mx + 70, 290, mx + 270, 440);
        ctx.restore();
        // yalnızca ölçer
        const lv = 0.5 + 0.45 * Math.sin(t * 1.3);
        luxMeter(ctx, mx + 170, 640, 110, lv, ra * meas * after(t, 'e-measure', 2, 0.6));
      }
    }
    // e-blue: tayf ve duyarlılık
    const ba = during(t, 'e-blue', 'e-wire');
    if (ba > 0) {
      const sx = 300;
      const sw = 1320;
      const sy = 700;
      const nmX = (nm) => sx + ((nm - 380) / 320) * sw;
      for (let nm = 380; nm < 700; nm += 2) {
        ctx.fillStyle = rgba(nmColor(nm), ba);
        ctx.fillRect(nmX(nm), sy, sw / 160 + 1, 50);
      }
      const draw = after(t, 'e-blue', 0, 1.4, ease.inOut);
      ctx.save();
      ctx.globalAlpha *= ba;
      ctx.strokeStyle = C.cream;
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let nm = 380; nm <= 380 + 320 * draw; nm += 2) {
        const px = nmX(nm);
        const py = sy - 30 - melanopsin(nm) * 380;
        if (nm === 380) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
      [400, 450, 500, 550, 600, 650, 700].forEach((nm) => text(ctx, String(nm), nmX(nm), sy + 90, { size: 24, family: 'mono', color: C.dim, alpha: ba }));
      text(ctx, 'dalga boyu (nm)', W / 2, sy + 140, { size: 26, color: C.muted, alpha: ba });
      text(ctx, 'melanopsin duyarlılığı', sx, 230, { size: 28, weight: 600, color: C.cream, align: 'left', alpha: ba });
      const pk = after(t, 'e-blue', 1, 0.6);
      glow(ctx, nmX(480), sy - 30 - 380, 120, BLUE, 0.6 * ba * pk);
      chip(ctx, '≈ 480 nm', nmX(480), sy - 470, ba * pk, { size: 34, color: C.ice, border: rgba(BLUE, 0.7), weight: 800 });
    }
    // e-wire & e-blind: gözden SCN'ye özel yol
    const wa = vis(t, cue('e-wire', 0) - 0.3, sceneEnd('eye'), 0.6, 0.6);
    if (wa > 0) {
      const blind = after(t, 'e-blind', 1, 0.6);
      drawHead(ctx, hx, hy, hs, wa, { brain: 1, xray: true, glowScn: after(t, 'e-wire', 1, 0.6), scnColor: BLUE, eyeOpen: 1, glowPineal: blind });
      const route = [headPt(hx, hy, hs, [HEAD.eye[0] + 6, HEAD.eye[1] + 4]), headPt(hx, hy, hs, HEAD.chiasm), headPt(hx, hy, hs, HEAD.scn)];
      for (let k = 0; k < 3; k++) {
        const p = ((t * 0.7 + k / 3) % 1);
        travel(ctx, route, p, BLUE, wa * after(t, 'e-wire', 1, 0.5) * (p < 0.95 ? 1 : 0), 7);
      }
      chip(ctx, 'retinohipotalamik yol', hx + 330, hy - 230, wa * after(t, 'e-wire', 1, 0.6), { size: 26, color: C.ice, border: rgba(BLUE, 0.5) });
      if (blind > 0) {
        // görme yok işareti
        const [ex, ey] = headPt(hx, hy, hs, HEAD.eye);
        ctx.save();
        ctx.globalAlpha *= wa * blind;
        ctx.strokeStyle = C.error;
        ctx.lineWidth = 8;
        line(ctx, ex - 10, ey - 50, ex + 70, ey + 50);
        ctx.restore();
        chip(ctx, 'bilinçli görme yok', ex + 190, ey + 110, wa * blind, { size: 26, color: C.error, border: rgba(RED, 0.6) });
        // ama melatonin yine bastırılır
        const sup = after(t, 'e-blind', 2, 0.6);
        panel(ctx, 1340, 560, 420, 300, wa * sup, { border: rgba(MEL, 0.6) });
        melDot(ctx, 1450, 690, 40, wa * sup * 0.6);
        text(ctx, '↓', 1560, 690, { size: 90, weight: 800, color: C.mel, alpha: wa * sup });
        text(ctx, 'melatonin bastırılır', 1550, 800, { size: 28, weight: 600, color: C.cream, alpha: wa * sup });
        text(ctx, '11 kişiden 3’ünde · 1995', 1550, 900, { size: 24, family: 'serif', italic: true, color: C.muted, alpha: wa * sup });
      }
    }
  };

  // ---------------------------------------------------------------------------
  // 5 · Ekran ve deneyler
  // ---------------------------------------------------------------------------
  // Beyaz LED / ekran tayfı: mavi tepe (~450 nm) + geniş sarı-yeşil tümsek
  const ledSpectrum = (nm) => 0.95 * Math.exp(-(((nm - 452) / 12) ** 2)) + 0.62 * Math.exp(-(((nm - 565) / 55) ** 2));

  function node(ctx, x, y, label, a, color, inner) {
    if (a <= 0.002) return;
    panel(ctx, x - 170, y - 150, 340, 300, a, { border: rgba(color, 0.6) });
    if (inner) inner(x, y - 20);
    text(ctx, label, x, y + 110, { size: 30, weight: 700, color: rgba(color, 1), alpha: a });
  }

  // Logaritmik lüks ekseni
  const LUX = { x0: 220, x1: 1700, y: 640 };
  const luxX = (lx) => LUX.x0 + (Math.log10(lx) / 4) * (LUX.x1 - LUX.x0); // 1 → 10.000

  DRAW.screen = function sceneScreen(ctx, lt, t) {
    kicker(ctx, 'EKRAN VE DENEYLER', vis(t, sceneStart('screen'), sceneEnd('screen'), 0.6, 0.5));
    // x-back: yatak odası ve ekranın tayfı
    const ba = during(t, 'x-back', 'x-report');
    drawBedroom(ctx, t, ba * (1 - 0.7 * after(t, 'x-back', 1, 0.6)), { phoneB: 1, eyes: 1 });
    const sa = ba * after(t, 'x-back', 1, 0.6);
    if (sa > 0) {
      panel(ctx, 1060, 230, 740, 520, sa);
      const sx = 1110;
      const sw = 640;
      const sy = 640;
      const nmX = (nm) => sx + ((nm - 380) / 320) * sw;
      for (let nm = 380; nm < 700; nm += 2) {
        const v = ledSpectrum(nm);
        ctx.fillStyle = rgba(nmColor(nm), sa * 0.85);
        ctx.fillRect(nmX(nm), sy - v * 320, sw / 160 + 1, v * 320);
      }
      ctx.save();
      ctx.globalAlpha *= sa * after(t, 'x-back', 2, 0.6);
      ctx.strokeStyle = C.cream;
      ctx.setLineDash([10, 8]);
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let nm = 380; nm <= 700; nm += 3) {
        const px = nmX(nm);
        const py = sy - melanopsin(nm) * 320;
        if (nm === 380) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
      text(ctx, 'ekran / beyaz LED ışığı', sx, 280, { size: 26, weight: 600, color: C.cream, align: 'left', alpha: sa });
      text(ctx, '- - - dedektifin duyarlılığı', sx, 320, { size: 22, color: C.muted, align: 'left', alpha: sa * after(t, 'x-back', 2, 0.6) });
      [400, 500, 600, 700].forEach((nm) => text(ctx, String(nm), nmX(nm), sy + 34, { size: 20, family: 'mono', color: C.dim, alpha: sa }));
      chip(ctx, 'mavi bakımından zengin', nmX(452), 400, sa * after(t, 'x-back', 2, 0.6), { size: 26, color: C.ice, border: rgba(BLUE, 0.6) });
    }
    // x-report / x-stop: göz → SCN → epifiz
    const ca = during(t, 'x-report', 'x-study');
    if (ca > 0) {
      const stop = after(t, 'x-stop', 1, 1.2, ease.inOut);
      node(ctx, 380, 520, 'gözdeki dedektif', ca * after(t, 'x-report', 0, 0.5), BLUE, (x, y) => {
        glow(ctx, x, y, 110, BLUE, 0.55 * ca);
        ctx.fillStyle = rgba(BLUE, ca);
        dot(ctx, x, y, 34);
        phone(ctx, x - 110, y - 40, 0.28, ca, { b: 1, content: false });
      });
      node(ctx, 960, 520, 'SCN', ca * after(t, 'x-report', 0, 0.9), SUN, (x, y) => {
        drawSun(ctx, x, y - 10, 40, ca * after(t, 'x-report', 1, 0.5), t);
        text(ctx, '“hâlâ gündüz”', x, y + 60, { size: 26, family: 'serif', italic: true, color: C.sun, alpha: ca * after(t, 'x-report', 1, 0.5) });
      });
      node(ctx, 1540, 520, 'epifiz', ca * after(t, 'x-stop', 0, 0.5), MEL, (x, y) => {
        for (let i = 0; i < 10; i++) {
          const p = ((t * 0.5 + hash(i, 41)) % 1);
          melDot(ctx, x - 60 + hash(i, 42) * 120, y - 60 + p * 140, 8, ca * (1 - p) * (1 - stop));
        }
        ctx.save();
        ctx.globalAlpha *= ca * stop;
        ctx.strokeStyle = C.error;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(x, y, 60, 0, Math.PI * 2);
        ctx.stroke();
        line(ctx, x - 42, y + 42, x + 42, y - 42);
        ctx.restore();
      });
      for (const [x0, x1, k, id] of [[550, 790, 0, 'x-report'], [1130, 1370, 0, 'x-stop']]) {
        const p = after(t, id, k, 0.8);
        ctx.save();
        ctx.globalAlpha *= ca * p;
        ctx.strokeStyle = C.muted;
        ctx.lineWidth = 4;
        line(ctx, x0, 520, x0 + (x1 - x0) * p, 520);
        ctx.restore();
        const q = ((t * 0.9) % 1);
        ctx.fillStyle = rgba(id === 'x-report' ? BLUE : SUN, ca * p);
        dot(ctx, lerp(x0, x1, q), 520, 7);
      }
      text(ctx, 'melatonin durur', 1540, 790, { size: 30, weight: 700, color: C.error, alpha: ca * stop });
    }
    // x-study ve x-result: mavi ve kırmızı LED
    const da = during(t, 'x-study', 'x-tablet');
    if (da > 0) {
      const res = after(t, 'x-result', 0, 0.6);
      const roomA = da * after(t, 'x-study', 2, 0.6) * (1 - res);
      for (const [x, col, name] of [[520, BLUE, 'mavi LED · 464 nm'], [1400, RED, 'kırmızı LED · 631 nm']]) {
        panel(ctx, x - 340, 260, 680, 420, roomA, { border: rgba(col, 0.6), fill: rgba(col.map((c) => c * 0.12), 0.95) });
        glow(ctx, x, 300, 300, col, 0.35 * roomA);
        for (let i = 0; i < 12; i++) {
          const px = x - 270 + (i % 6) * 108;
          const py = 470 + Math.floor(i / 6) * 120;
          ctx.save();
          ctx.globalAlpha *= roomA;
          ctx.fillStyle = '#0a0e18';
          dot(ctx, px, py - 30, 16);
          roundRect(ctx, px - 20, py - 10, 40, 50, 12);
          ctx.fill();
          ctx.restore();
        }
        text(ctx, name, x, 720, { size: 30, weight: 700, color: rgba(col, 1), alpha: roomA });
      }
      chip(ctx, '2025 · 12 kişi · 21:00 → 24:00 · tükürükte melatonin', W / 2, 820, da * after(t, 'x-study', 1, 0.6) * (1 - res), { size: 28 });
      // sonuç: 2. saat sütunları
      if (res > 0) {
        const a = da * res;
        const base = 800;
        const k = 18; // px / (pg/mL)
        const grow = after(t, 'x-result', 1, 1.2, ease.out);
        const grow2 = after(t, 'x-result', 2, 1.2, ease.out);
        text(ctx, 'İKİNCİ SAATİN SONUNDA · melatonin (pg/mL)', W / 2, 220, { size: 26, weight: 700, spacing: 4, color: C.muted, alpha: a });
        for (const [x, v, col, g, name] of [[720, 7.5, BLUE, grow, 'mavi ışık'], [1200, 26.0, RED, grow2, 'kırmızı ışık']]) {
          const h = v * k * g;
          ctx.save();
          ctx.globalAlpha *= a;
          ctx.fillStyle = rgba(col, 0.85);
          roundRect(ctx, x - 90, base - h, 180, h, 10);
          ctx.fill();
          ctx.restore();
          text(ctx, (v * g).toFixed(1).replace('.', ','), x, base - h - 40, { size: 52, family: 'mono', weight: 700, color: C.cream, alpha: a * g });
          text(ctx, name, x, base + 46, { size: 30, weight: 600, color: rgba(col, 1), alpha: a });
        }
        chip(ctx, 'üçte birinden az', 960, 470, a * after(t, 'x-result', 2, 0.9), { size: 32, color: C.ice, border: rgba(BLUE, 0.6), weight: 700 });
        text(ctx, '3. saatte de fark sürdü: 8,3 – 16,6 pg/mL · Sanchez-Cano ve ark., 2025', W / 2, 960, { size: 24, family: 'serif', italic: true, color: C.muted, alpha: a * after(t, 'x-result', 2, 1.2) });
      }
    }
    // x-tablet: tablet ve kitap
    const ta = during(t, 'x-tablet', 'x-dim');
    if (ta > 0) {
      // iki okur
      for (const [x, isTab] of [[560, true], [1360, false]]) {
        const a = ta * after(t, 'x-tablet', 1, 0.6);
        ctx.save();
        ctx.globalAlpha *= a;
        ctx.fillStyle = '#1b2236';
        dot(ctx, x, 330, 46);
        roundRect(ctx, x - 70, 380, 140, 150, 40);
        ctx.fill();
        ctx.restore();
        if (isTab) phone(ctx, x, 470, 0.55, a, { b: 1, rot: -0.1 });
        else {
          ctx.save();
          ctx.globalAlpha *= a;
          ctx.fillStyle = '#e9e1cc';
          ctx.beginPath();
          ctx.moveTo(x - 90, 440);
          ctx.lineTo(x, 460);
          ctx.lineTo(x + 90, 440);
          ctx.lineTo(x + 90, 520);
          ctx.lineTo(x, 540);
          ctx.lineTo(x - 90, 520);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        text(ctx, isTab ? 'tablet' : 'basılı kitap', x, 600, { size: 32, weight: 700, color: isTab ? C.ice : C.sun, alpha: a });
      }
      const rows = [['uykuya dalma', '≈ 10 dk daha geç', 2], ['iç saat', 'ileri kaydı', 3], ['sabah', 'daha az dinç', 4]];
      rows.forEach(([k, v, cue_], i) => {
        const a = ta * after(t, 'x-tablet', cue_, 0.6);
        chip(ctx, `${k}: ${v}`, 560, 690 + i * 86, a, { size: 28, color: C.ice, border: rgba(BLUE, 0.5) });
      });
      text(ctx, 'Chang ve ark., 2015 · 12 kişi · yatmadan önce 4 saat okuma', W / 2, 980, { size: 24, family: 'serif', italic: true, color: C.muted, alpha: ta * after(t, 'x-tablet', 0, 0.6) });
    }
    // x-dim ve x-vary: lüks ekseni
    const la = vis(t, cue('x-dim', 0) - 0.3, sceneEnd('screen'), 0.6, 0.6);
    if (la > 0) {
      ctx.save();
      ctx.globalAlpha *= la;
      const g = ctx.createLinearGradient(LUX.x0, 0, LUX.x1, 0);
      g.addColorStop(0, '#101a33');
      g.addColorStop(1, '#ffd27a');
      ctx.fillStyle = g;
      roundRect(ctx, LUX.x0, LUX.y - 14, LUX.x1 - LUX.x0, 28, 14);
      ctx.fill();
      ctx.restore();
      [[1, '1'], [10, '10'], [100, '100'], [1000, '1.000'], [10000, '10.000']].forEach(([lx, s]) => text(ctx, s, luxX(lx), LUX.y + 52, { size: 24, family: 'mono', color: C.muted, alpha: la }));
      text(ctx, 'lüks (ışık miktarı)', W / 2, LUX.y + 100, { size: 26, color: C.muted, alpha: la });
      const ic = la * after(t, 'x-dim', 4, 0.6);
      [[100, 'gece oda ışığı'], [500, 'ofis'], [10000, 'gün ışığı']].forEach(([lx, s], i) => chip(ctx, s, luxX(lx), LUX.y - 110 - (i % 2) * 70, ic, { size: 24, color: C.cream }));
      const mk = la * after(t, 'x-dim', 2, 0.6) * (1 - after(t, 'x-vary', 0, 0.5));
      if (mk > 0) {
        const x = luxX(25);
        glow(ctx, x, LUX.y, 80, MEL, 0.6 * mk);
        ctx.save();
        ctx.globalAlpha *= mk;
        ctx.strokeStyle = C.mel;
        ctx.lineWidth = 5;
        line(ctx, x, LUX.y - 40, x, LUX.y - 230);
        ctx.restore();
        chip(ctx, '< 30 lüks: melatonin yarıya iner', x, LUX.y - 270, mk, { size: 30, color: C.mel, border: rgba(MEL, 0.6), weight: 700 });
      }
      text(ctx, 'Phillips ve ark., 2019 · 55 kişi', W / 2, 980, { size: 24, family: 'serif', italic: true, color: C.muted, alpha: la * after(t, 'x-dim', 1, 0.6) });
      // x-vary: kişiler arası fark
      const va = la * after(t, 'x-vary', 1, 0.8);
      if (va > 0) {
        for (let i = 0; i < 55; i++) {
          const u = (hash(i, 61) + hash(i, 62) + hash(i, 63)) / 3; // ortalamaya yığılan dağılım
          const lx = Math.pow(10, lerp(Math.log10(6), Math.log10(350), u));
          const appear = progress(t, cue('x-vary', 1) + i * 0.02, cue('x-vary', 1) + i * 0.02 + 0.4);
          ctx.fillStyle = rgba(MEL, va * appear * 0.9);
          dot(ctx, luxX(lx), LUX.y + 170 + (hash(i, 64) - 0.5) * 50, 7);
        }
        const ends = la * after(t, 'x-vary', 2, 0.6);
        chip(ctx, 'en hassas: 6 lüks', luxX(6), LUX.y + 260, ends, { size: 24, color: C.mel });
        chip(ctx, 'en dayanıklı: 350 lüks', luxX(350), LUX.y + 260, ends, { size: 24, color: C.mel });
        statement(ctx, '50 kattan fazla fark', 330, ends, { size: 60, color: C.cream });
      }
    }
  };

  // ---------------------------------------------------------------------------
  // 6 · Dürüst olalım
  // ---------------------------------------------------------------------------
  DRAW.honest = function sceneHonest(ctx, lt, t) {
    kicker(ctx, 'DÜRÜST OLALIM', vis(t, sceneStart('honest'), sceneEnd('honest'), 0.6, 0.5));
    // n-honest
    const ha = during(t, 'n-honest', 'n-content');
    statement(ctx, 'Uykusuzluğun tek sebebi ışık değil.', 540, ha * after(t, 'n-honest', 1, 0.7), { size: 66 });
    // n-content: bildirimler
    const ca = during(t, 'n-content', 'n-filter');
    if (ca > 0) {
      phone(ctx, 760, 560, 1.5, ca, { b: 0.8 });
      const items = [['🔔  yeni bildirim', 1], ['💬  bir tartışma', 2], ['▶  sıradaki video', 3]];
      items.forEach(([s, k], i) => {
        const a = ca * after(t, 'n-content', k, 0.5);
        chip(ctx, s.replace(/^[^ ]+\s+/, ''), 1260, 380 + i * 130, a, { size: 32, color: C.cream, border: rgba(BLUE, 0.5) });
      });
      // uyanık beyin kıvılcımları
      for (let i = 0; i < 16; i++) {
        const p = ((t * 0.8 + hash(i, 71)) % 1);
        ctx.fillStyle = rgba(SUN, ca * (1 - p) * after(t, 'n-content', 0, 0.6));
        dot(ctx, 1500 + Math.cos(i) * 140 * p + 100, 700 + Math.sin(i * 1.7) * 90 * p, 4);
      }
      text(ctx, 'içerik beyni uyanık tutar', 1340, 840, { size: 30, family: 'serif', italic: true, color: C.sun, alpha: ca * after(t, 'n-content', 0, 0.6) });
    }
    // n-filter: gece modu deneyi
    const fa = during(t, 'n-filter', 'n-amount');
    if (fa > 0) {
      const warm = 0.5 + 0.5 * Math.sin(t * 1.4);
      phone(ctx, 420, 560, 1.2, fa, { b: 0.8, warm: after(t, 'n-filter', 0, 0.8) * warm });
      text(ctx, 'gece modu', 420, 790, { size: 30, weight: 700, color: C.sun, alpha: fa });
      const groups = [['gece modu açık', C.sun], ['gece modu kapalı', C.ice], ['telefonsuz', C.cream]];
      const ga = fa * after(t, 'n-filter', 1, 0.6);
      groups.forEach(([name, col], i) => {
        const x = 900 + i * 300;
        const h = 330 * after(t, 'n-filter', 2, 1.0, ease.out) * (1 + (hash(i, 81) - 0.5) * 0.04);
        ctx.save();
        ctx.globalAlpha *= ga;
        ctx.fillStyle = col;
        ctx.globalAlpha *= 0.75;
        roundRect(ctx, x - 80, 760 - h, 160, h, 10);
        ctx.fill();
        ctx.restore();
        text(ctx, name, x, 810, { size: 26, weight: 600, color: col, alpha: ga });
      });
      text(ctx, 'uyku süresi ve kalitesi', 1200, 360, { size: 28, weight: 600, color: C.muted, alpha: ga });
      chip(ctx, 'anlamlı fark yok', 1200, 300, fa * after(t, 'n-filter', 2, 1.2), { size: 32, color: C.cream, border: rgba(SUN, 0.6), weight: 700 });
      text(ctx, 'Duraccio ve ark., 2021 · 167 genç yetişkin · 7 gece', W / 2, 960, { size: 24, family: 'serif', italic: true, color: C.muted, alpha: ga });
    }
    // n-amount: ışığın miktarı
    const aa = vis(t, cue('n-amount', 0) - 0.3, sceneEnd('honest'), 0.6, 0.6);
    if (aa > 0) {
      const dimP = after(t, 'n-amount', 0, 1.6, ease.inOut);
      const b = lerp(1, 0.25, dimP);
      phone(ctx, 620, 540, 1.4, aa, { b });
      // parlaklık sürgüsü
      ctx.save();
      ctx.globalAlpha *= aa;
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      line(ctx, 420, 860, 820, 860);
      ctx.strokeStyle = C.ice;
      line(ctx, 420, 860, 420 + 400 * b, 860);
      ctx.fillStyle = C.cream;
      dot(ctx, 420 + 400 * b, 860, 18);
      ctx.restore();
      text(ctx, 'gözü uyaran ışık', 620, 920, { size: 26, color: C.muted, alpha: aa });
      chip(ctx, 'uykuya dalmak kolaylaşır', 1340, 420, aa * after(t, 'n-amount', 1, 0.6), { size: 32, color: C.ok, border: 'rgba(127,224,163,0.5)', weight: 700 });
      paragraph(ctx, 'Renk tonu değil, ışığın miktarı.', 1340, 640, 760, { size: 54, family: 'display', weight: 700, color: C.cream, alpha: aa * after(t, 'n-amount', 2, 0.8), valign: 'middle', lineHeight: 64 });
      text(ctx, 'Schöllhorn ve ark., 2023', W / 2, 1000, { size: 24, family: 'serif', italic: true, color: C.muted, alpha: aa * after(t, 'n-amount', 1, 0.6) });
    }
  };

  // ---------------------------------------------------------------------------
  // 7 · Üç kural
  // ---------------------------------------------------------------------------
  // 06:00'dan ertesi 06:00'ya şerit; yatma 23:00
  const RIB = { x0: 160, x1: 1760, y: 470, h: 120 };
  const ribX = (h) => RIB.x0 + (((h - 6 + 24) % 24) / 24) * (RIB.x1 - RIB.x0);

  DRAW.rules = function sceneRules(ctx, lt, t) {
    kicker(ctx, 'NE YAPABİLİRİZ?', vis(t, sceneStart('rules'), sceneEnd('rules'), 0.6, 0.5));
    const ra = vis(t, cue('r-rules', 0) - 0.3, cue('r-phone', 0) - 0.1, 0.6, 0.5);
    if (ra > 0) {
      const z1 = after(t, 'r-day', 1, 0.6);
      const z2 = after(t, 'r-evening', 1, 0.6);
      const z3 = after(t, 'r-night', 1, 0.6);
      const ribA = ra * after(t, 'r-rules', 1, 0.8);
      // bölgeler
      const zone = (h0, h1, fill, a) => {
        ctx.save();
        ctx.globalAlpha *= ribA * (0.35 + 0.65 * a);
        ctx.fillStyle = fill;
        ctx.fillRect(ribX(h0), RIB.y, ribX(h1 === 6 ? 5.999 : h1) - ribX(h0), RIB.h);
        ctx.restore();
      };
      const day = ctx.createLinearGradient(ribX(6), 0, ribX(20), 0);
      day.addColorStop(0, '#ffd27a');
      day.addColorStop(1, '#ff9f45');
      zone(6, 20, day, z1);
      zone(20, 23, '#5a3a20', z2);
      zone(23, 6, '#0a0e1c', z3);
      ctx.save();
      ctx.globalAlpha *= ribA;
      ctx.strokeStyle = C.wire;
      ctx.lineWidth = 3;
      ctx.strokeRect(RIB.x0, RIB.y, RIB.x1 - RIB.x0, RIB.h);
      ctx.restore();
      [6, 12, 18, 23].forEach((h) => text(ctx, `${String(h).padStart(2, '0')}:00`, ribX(h), RIB.y + RIB.h + 36, { size: 22, family: 'mono', color: h === 23 ? C.mel : C.dim, alpha: ribA }));
      text(ctx, 'yatma', ribX(23), RIB.y - 28, { size: 22, weight: 700, color: C.mel, alpha: ribA });
      drawSun(ctx, ribX(13), RIB.y + RIB.h / 2, 30, ribA * z1, t);
      drawMoon(ctx, ribX(2.5), RIB.y + RIB.h / 2, 28, ribA * z3, '#0a0e1c');
      // kurallar
      const rule = (n, title, sub, x, a, col) => {
        if (a <= 0.002) return;
        panel(ctx, x - 230, 690, 460, 250, a, { border: rgba(col, 0.6) });
        text(ctx, String(n), x - 170, 760, { size: 64, family: 'display', weight: 800, color: rgba(col, 1), alpha: a });
        text(ctx, title, x - 120, 760, { size: 36, weight: 700, color: C.cream, align: 'left', alpha: a });
        paragraph(ctx, sub, x - 190, 840, 390, { size: 24, color: C.muted, align: 'left', alpha: a, lineHeight: 32 });
      };
      rule(1, 'gündüz bol ışık', 'sabah dışarıda kısa bir zaman · ≥ 250 melanopik lüks', 420, ra * z1, SUN);
      rule(2, 'akşam az ışık', 'yatmadan önceki 3 saat · loş, sıcak lambalar · ≤ 10 lüks', 960, ra * z2, WARM);
      rule(3, 'uykuda karanlık', 'karanlık yatak odası · ≤ 1 lüks', 1500, ra * z3, MEL);
      text(ctx, 'Brown ve ark., 2022 · uzman uzlaşı önerileri (melanopik EDI)', W / 2, 1010, { size: 24, family: 'serif', italic: true, color: C.muted, alpha: ra * after(t, 'r-rules', 1, 0.8) });
      // sabah ışığı vurgusu
      if (z1 > 0 && z2 < 1) {
        const p = ((t * 0.5) % 1);
        ctx.fillStyle = rgba(SUN, ra * z1 * (1 - z2) * (1 - p) * 0.8);
        dot(ctx, ribX(7) + p * 60, RIB.y - 40 - p * 60, 6);
      }
    }
    // r-phone: telefon kapının dışında
    const pa = vis(t, cue('r-phone', 0) - 0.3, sceneEnd('rules'), 0.6, 0.6);
    if (pa > 0) {
      const move = after(t, 'r-phone', 2, 1.2, ease.inOut);
      const close = progress(t, cue('r-phone', 2) + 1.1, cue('r-phone', 2) + 2.0, ease.inOut);
      const dx = 1000;
      ctx.save();
      ctx.globalAlpha *= pa;
      // oda içi (sağ) ve koridor (sol)
      ctx.fillStyle = '#080c18';
      ctx.fillRect(dx, 240, 700, 620);
      ctx.fillStyle = '#121a2e';
      ctx.fillRect(220, 240, dx - 220, 620);
      // kapı boşluğu ve kanadı
      ctx.fillStyle = '#05070d';
      ctx.fillRect(dx - 20, 300, 40, 560);
      const doorW = 260 * (1 - close);
      ctx.fillStyle = '#2a3654';
      ctx.fillRect(dx, 300, Math.max(6, doorW), 560);
      ctx.restore();
      phone(ctx, lerp(1300, 700, move), lerp(650, 780, move), 0.45, pa, { b: lerp(1, 0, progress(t, cue('r-phone', 2) + 0.4, cue('r-phone', 2) + 1.0)), content: false, rot: lerp(0, -0.2, move) });
      chip(ctx, 'yatmadan 1 saat önce', 1350, 300, pa * after(t, 'r-phone', 1, 0.6), { size: 30, color: C.mel, border: rgba(MEL, 0.6) });
      text(ctx, 'en etkilisi, en basiti', 600, 300, { size: 36, family: 'serif', italic: true, color: C.cream, alpha: pa * after(t, 'r-phone', 0, 0.6) });
    }
  };

  // ---------------------------------------------------------------------------
  // 8 · Kapanış
  // ---------------------------------------------------------------------------
  function campfire(ctx, x, y, s, t, a) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    glow(ctx, x, y - 40 * s, 420 * s, WARM, 0.5);
    ctx.strokeStyle = '#3a2516';
    ctx.lineWidth = 16 * s;
    ctx.lineCap = 'round';
    line(ctx, x - 70 * s, y + 10 * s, x + 70 * s, y - 14 * s);
    line(ctx, x - 70 * s, y - 14 * s, x + 70 * s, y + 10 * s);
    for (const [col, k] of [[[255, 120, 40], 1], [[255, 180, 70], 0.7], [[255, 235, 170], 0.4]]) {
      ctx.fillStyle = rgba(col, 0.95);
      ctx.beginPath();
      const hgt = 150 * s * k * (0.85 + 0.15 * noise(t * 3 + k * 7, 2));
      const sway = (noise(t * 2 + k, 4) - 0.5) * 30 * s;
      ctx.moveTo(x - 60 * s * k, y);
      ctx.quadraticCurveTo(x - 50 * s * k, y - hgt * 0.6, x + sway, y - hgt);
      ctx.quadraticCurveTo(x + 50 * s * k, y - hgt * 0.6, x + 60 * s * k, y);
      ctx.closePath();
      ctx.fill();
    }
    for (let i = 0; i < 12; i++) {
      const p = ((t * 0.5 + hash(i, 91)) % 1);
      ctx.fillStyle = rgba([255, 200, 120], (1 - p) * 0.9);
      dot(ctx, x + (hash(i, 92) - 0.5) * 120 * s + Math.sin(t * 2 + i) * 10, y - 120 * s - p * 260 * s, 3);
    }
    ctx.restore();
  }

  DRAW.close = function sceneClose(ctx, lt, t) {
    // z-fire: ay ve ateş
    const fa = vis(t, sceneStart('close'), cue('z-tonight', 0) - 0.1, 1.0, 0.8);
    if (fa > 0) {
      ctx.fillStyle = rgba([4, 6, 14], fa);
      ctx.fillRect(0, 0, W, H);
      drawStars(ctx, t, fa, 700, 101, 220);
      drawMoon(ctx, 1500, 240, 60, fa);
      ctx.save();
      ctx.globalAlpha *= fa;
      ctx.fillStyle = '#05070c';
      ctx.beginPath();
      ctx.moveTo(0, 840);
      for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 820 + Math.sin(x * 0.004) * 30 + noise(x * 0.01, 3) * 30);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      campfire(ctx, 760, 850, 1.1, t, fa * after(t, 'z-fire', 0, 1.2));
      statement(ctx, 'Saati söyleyen, ışıktır.', 300, fa * after(t, 'z-remember', 2, 0.9), { size: 60 });
    }
    // z-tonight: telefon dışarıda, uyku, sonra sabah güneşi
    const na = vis(t, cue('z-tonight', 0) - 0.3, cue('z-end', 0) - 0.1, 0.8, 0.8);
    if (na > 0) {
      const morning = after(t, 'z-tonight', 1, 1.6, ease.inOut);
      drawBedroom(ctx, t, na, { phoneB: 0, eyes: 0, dark: 0.6 * (1 - morning), hand: false, clock: morning > 0.5 ? '07:00' : '23:30', day: morning });
      if (morning > 0) {
        // pencereden giren sabah ışığı
        ctx.save();
        ctx.globalAlpha *= na * morning;
        const g = ctx.createLinearGradient(380, 300, 900, 700);
        g.addColorStop(0, 'rgba(255,200,120,0.45)');
        g.addColorStop(1, 'rgba(255,200,120,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(220, 170);
        ctx.lineTo(550, 170);
        ctx.lineTo(1100, 760);
        ctx.lineTo(500, 760);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      text(ctx, 'z z z', 760, 470, { size: 40, family: 'serif', italic: true, color: C.mel, alpha: na * (1 - morning) * (0.6 + 0.4 * Math.sin(t * 2)) });
      text(ctx, 'İç saatin sana teşekkür edecek.', W / 2, 980, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: na * after(t, 'z-tonight', 2, 0.8) });
    }
    // z-end: YUP Akademi
    const ea = vis(t, cue('z-end', 0) - 0.4, Infinity, 0.9, 0);
    if (ea > 0) {
      glow(ctx, W / 2, 480, 420, BLUE, 0.16 * ea);
      text(ctx, 'YUP AKADEMİ', W / 2, 470, { size: 110, family: 'display', weight: 800, spacing: 10, color: C.cream, alpha: ea });
      text(ctx, 'Yükselen Ufuklar Platformu', W / 2, 570, { size: 36, family: 'serif', italic: true, color: C.muted, alpha: ea * after(t, 'z-end', 0, 1.0) });
      chip(ctx, 'Abone ol · bir sonraki merakta görüşelim', W / 2, 700, ea * afterEnd(t, 'z-end', 0, 0.8), { size: 30, color: C.ice, border: rgba(BLUE, 0.6) });
    }
  };

  // ---------------------------------------------------------------------------
  // Ses: sakin alt müzik ve az sayıda yumuşak işaret
  // ---------------------------------------------------------------------------
  function score(m, hz) {
    const { at } = TL;
    const untilEnd = (id, a, margin) => TL.scene(id).end - margin - at(id, a);
    const pad = (id, notes, gain = 0.07) => m.pad(at(id, 0), untilEnd(id, 0, 0.3), notes, { gain, attack: 2, release: 2.6, cutoff: 520 });
    const bell = (tm, note, g = 0.05, pan = 0) => m.bell(tm, { freq: hz(note), gain: g, decay: 2.6, pan });
    const pop = (tm, note, g = 0.05, pan = 0) => m.pop(tm, { freq: hz(note), gain: g, pan });
    const c = cue;
    pad('night', ['D2', 'A2', 'F3', 'C4']);
    for (let k = 0; k < 4; k++) m.tick(c('h-night', 0) + k * 1.0, { gain: 0.03, tone: 2400 });
    m.click(phoneOffAt(), { gain: 0.08, tone: 1800 });
    bell(c('h-awake', 1) + 0.2, 'A5', 0.05);
    bell(c('h-promise', 0) + 0.1, 'D5', 0.07);
    bell(c('h-promise', 0) + 0.5, 'A5', 0.05);
    pad('clock', ['E2', 'B2', 'G#3', 'D#4']);
    [1, 2, 3, 4].forEach((k, i) => pop(c('c-body', k), ['E4', 'G#4', 'B4', 'E5'][i]));
    bell(c('c-period', 3), 'B5', 0.05);
    bell(c('c-reset', 1) + 0.6, 'E5', 0.06);
    pad('scn', ['C2', 'G2', 'E3', 'B3']);
    bell(c('s-where', 3), 'G5', 0.05);
    bell(c('s-conductor', 1) + 1.4, 'C5', 0.06);
    pad('mel', ['A1', 'E2', 'C3', 'G3']);
    bell(c('m-call', 2), 'E5', 0.05);
    bell(c('m-signal', 2), 'C6', 0.04);
    pad('eye', ['F2', 'C3', 'A3', 'E4']);
    bell(c('e-discovery', 0), 'A5', 0.05);
    bell(c('e-blue', 1), 'E6', 0.04);
    pad('screen', ['D2', 'A2', 'F3', 'C4']);
    pop(c('x-result', 1), 'D5');
    pop(c('x-result', 2), 'A4');
    bell(c('x-dim', 2), 'F5', 0.05);
    pad('honest', ['G1', 'D2', 'B2', 'F#3']);
    [1, 2, 3].forEach((k, i) => pop(c('n-content', k), ['G4', 'B4', 'D5'][i], 0.05, -0.3 + i * 0.3));
    pad('rules', ['C2', 'G2', 'E3', 'A3']);
    [['r-day', 'C5'], ['r-evening', 'E5'], ['r-night', 'G5']].forEach(([id, n]) => bell(c(id, 1), n, 0.05));
    m.click(c('r-phone', 2) + 1.6, { gain: 0.06, tone: 700 });
    pad('close', ['D2', 'A2', 'F#3', 'A3'], 0.08);
    bell(c('z-end', 0), 'D5', 0.07);
    bell(c('z-end', 0) + 0.4, 'A5', 0.05);
  }

  window.FILM = E.film({
    title: 'YUP Akademi — Gecenin Mavi Işığı',
    timeline: TL,
    background,
    score,
    narration: VOICE,
    voice: VOICE.voice,
  });
})();
