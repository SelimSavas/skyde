/*
 * YUP Akademi — Gecenin Mavi Işığı: Ekran Işığı Beynimizdeki Saati Nasıl Kandırır?
 *
 * Bölümler: gece yarısı · iç saat · orkestra şefi (SCN) · melatonin · gizli dedektif (ipRGC) ·
 * ışık günlüğü · kamp deneyi · ekran ve deneyler · dürüst olalım · gündüz bol ışık · akşam az ışık ·
 * uykuda karanlık · bir hafta dene · kapanış.
 * Günlük hayat sahneleri aynı ışık modeliyle çizilir (ambient): tavan lambası, sarı lamba, pencere ve
 * ekran, odanın duvarını ve insanı gerçekten aydınlatır; ışık ölçer de aynı değerleri gösterir.
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
  const OK = [127, 224, 163];

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
    'h-night': 1.2, 'h-off': 1.4, 'h-awake': 1.2, 'h-know': 1.2, 'h-plan': 2.6,
    'c-earth': 0.8, 'c-period': 1.2, 'c-reset': 1.6, 'c-jetlag': 1.6,
    's-size': 0.8, 's-conductor': 1.4,
    'm-call': 1.8, 'm-curve': 1.4, 'm-effect': 1.2,
    'e-rods': 0.6, 'e-blue': 1.0, 'e-wire': 0.8, 'e-blind': 1.2, 'e-every': 1.4,
    'd-meter': 0.8, 'd-out': 1.4, 'd-in': 1.0, 'd-evening': 2.0,
    'd-camp': 1.2, 'd-sunset': 1.4, 'd-weekend': 1.6,
    'x-stop': 1.0, 'x-result': 1.6, 'x-tablet': 0.8, 'x-dim': 1.0, 'x-vary': 1.2, 'x-friend': 1.6,
    'n-filter': 1.0, 'n-amount': 1.4,
    'r-rules': 1.2, 'r-day': 1.0, 'p-morning': 1.4, 'p-desk': 1.6,
    'r-evening': 1.2, 'p-lamp': 1.4, 'p-distance': 1.8,
    'r-night': 1.0, 'p-sleeplight': 1.4, 'p-dark': 1.6, 'r-phone': 1.6, 'p-alarm': 1.4,
    'p-weekend': 1.2, 'p-days': 2.4, 'p-doctor': 1.6,
    'z-fire': 1.0, 'z-tonight': 1.2, 'z-end': 3.0,
  };
  // satır, vuruşun başından bu kadar sonra başlar (sahne girişleri için)
  const LEAD = {
    'h-night': 2.2, 'c-earth': 1.0, 's-where': 1.0, 'm-call': 0.8, 'e-how': 0.8, 'd-meter': 1.0, 'd-camp': 1.2,
    'x-back': 0.8, 'n-honest': 0.8, 'r-rules': 0.8, 'r-evening': 1.0, 'r-night': 1.0, 'p-weekend': 0.8,
    'z-fire': 1.0, 'h-plan': 0.6,
  };
  const PLAN = [
    { id: 'night', title: 'Gece yarısı', beats: ['h-night', 'h-off', 'h-awake', 'h-know', 'h-plan'], fadeIn: 1.0 },
    { id: 'clock', title: 'İç saat', beats: ['c-earth', 'c-body', 'c-name', 'c-period', 'c-reset', 'c-jetlag'] },
    { id: 'scn', title: 'Orkestra şefi', beats: ['s-where', 's-size', 's-conductor'] },
    { id: 'mel', title: 'Melatonin', beats: ['m-call', 'm-curve', 'm-signal', 'm-effect'] },
    { id: 'eye', title: 'Gizli dedektif', beats: ['e-how', 'e-rods', 'e-discovery', 'e-measure', 'e-blue', 'e-wire', 'e-blind', 'e-every'] },
    { id: 'day', title: 'Işık günlüğü', beats: ['d-meter', 'd-out', 'd-in', 'd-evening'] },
    { id: 'camp', title: 'Kamp deneyi', beats: ['d-camp', 'd-sunset', 'd-weekend'] },
    { id: 'screen', title: 'Ekran ve deneyler', beats: ['x-back', 'x-report', 'x-stop', 'x-study', 'x-result', 'x-tablet', 'x-dim', 'x-vary', 'x-friend'] },
    { id: 'honest', title: 'Dürüst olalım', beats: ['n-honest', 'n-content', 'n-filter', 'n-amount'] },
    { id: 'morning', title: 'Gündüz bol ışık', beats: ['r-rules', 'r-day', 'p-morning', 'p-desk'] },
    { id: 'evening', title: 'Akşam az ışık', beats: ['r-evening', 'p-lamp', 'p-distance'] },
    { id: 'sleep', title: 'Uykuda karanlık', beats: ['r-night', 'p-sleeplight', 'p-dark', 'r-phone', 'p-alarm'] },
    { id: 'habit', title: 'Bir hafta dene', beats: ['p-weekend', 'p-days', 'p-doctor'] },
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
    'h-off': 0.8, 'h-awake': 0.6, 'h-know': 0.6, 'h-plan': 1.0, 'c-period': 0.6, 'c-reset': 0.8, 'c-jetlag': 0.8,
    's-conductor': 0.8, 'm-curve': 0.8, 'm-signal': 0.6, 'm-effect': 1.0, 'e-blue': 0.6, 'e-blind': 0.6, 'e-every': 1.0,
    'd-out': 0.6, 'd-in': 0.6, 'd-evening': 1.0, 'd-sunset': 0.6, 'd-weekend': 1.0,
    'x-stop': 0.6, 'x-result': 1.0, 'x-tablet': 0.6, 'x-vary': 0.4, 'x-friend': 1.2, 'n-amount': 1.0,
    'r-day': 0.6, 'p-morning': 0.6, 'p-desk': 1.0, 'p-lamp': 0.6, 'p-distance': 1.0,
    'p-sleeplight': 0.8, 'p-dark': 0.8, 'r-phone': 0.6, 'p-alarm': 1.0, 'p-days': 0.8, 'p-doctor': 1.2,
    'z-remember': 0.6, 'z-end': 2.0,
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
  // bir satırın k. öbeğinden, (son) satırın j. öbeğine kadar
  const span = (t, id, k, id2, j, fi = 0.5, fo = 0.5) => vis(t, cue(id, k) - 0.2, id2 ? cue(id2, j) - 0.15 : Infinity, fi, fo);
  // Tam ekran katman: [a, b) aralığında görünür; b'den sonra gelen katman üstüne binene kadar opak kalır
  const layer = (t, a, b, fi = 0.7) => vis(t, a, b + 0.8, fi, 0.05);

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
    const kw = measure(ctx, str, { size: 24, weight: 600, spacing: 8 }) + 48;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(6,9,20,0.6)';
    roundRect(ctx, x - 24, y - 26, kw, 72, 18);
    ctx.fill();
    ctx.restore();
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
  // Günlük hayat çizim takımı: gökyüzü, ışık modeli, oda, insan, ışık ölçer, uyku çizelgesi
  // ---------------------------------------------------------------------------
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
  const css = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
  const logLerp = (a, b, k) => Math.pow(10, lerp(Math.log10(a), Math.log10(b), clamp(k)));

  // Gökyüzü: saat → [üst, alt] renk
  const SKY = [
    [0, '#04070f', '#0a1228'], [4.6, '#060a18', '#141a36'], [5.7, '#1c2552', '#5c3c60'], [6.7, '#3f5e9e', '#f2a46c'],
    [8, '#5c9ad8', '#cfe2f0'], [12, '#4a8fdb', '#c2e1f6'], [16.6, '#5486c8', '#f0cf98'], [18.7, '#3a4486', '#f2875a'],
    [19.7, '#1a2050', '#6a3a5e'], [21, '#070b1c', '#141a36'], [24, '#04070f', '#0a1228'],
  ].map(([h, a, b]) => [h, hex(a), hex(b)]);
  const hr24 = (h) => ((h % 24) + 24) % 24;
  function skyAt(hour) {
    const h = hr24(hour);
    for (let i = 1; i < SKY.length; i++) {
      if (h <= SKY[i][0]) {
        const k = (h - SKY[i - 1][0]) / (SKY[i][0] - SKY[i - 1][0]);
        return [mix(SKY[i - 1][1], SKY[i][1], k), mix(SKY[i - 1][2], SKY[i][2], k)];
      }
    }
    return [SKY[0][1], SKY[0][2]];
  }
  // gün ışığı payı: 0 gece – 1 gündüz
  const daylight = (hour) => {
    const h = hr24(hour);
    return clamp((h - 5.7) / 2.0) * clamp((19.9 - h) / 2.0);
  };

  function cloudBlob(ctx, x, y, w, col, a) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.5, w * 0.16, 0, 0, Math.PI * 2);
    ctx.ellipse(x - w * 0.18, y - w * 0.1, w * 0.2, w * 0.17, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.12, y - w * 0.13, w * 0.24, w * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Gökyüzü dikdörtgeni: güneş/ay, yıldızlar, bulutlar, uzak şehir
  function sky(ctx, x, y, w, h, hour, t, { cloud = 0, city = 0, sunScale = 1, drift = 0 } = {}) {
    const [top, bot] = skyAt(hour);
    const grey = [150, 158, 172];
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, css(mix(top, mix(grey, top, 0.5), cloud * daylight(hour))));
    g.addColorStop(1, css(mix(bot, grey, cloud * 0.75 * daylight(hour))));
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    const dl = daylight(hour);
    drawStars(ctx, t, clamp(1 - dl * 2.5) * 0.9, y + h * 0.75, 17, Math.round(w / 9), x, x + w);
    const hh = hr24(hour);
    if (hh > 5.6 && hh < 20) {
      const u = (hh - 5.8) / 13.8;
      const sx = x + w * (0.08 + 0.84 * u);
      const sy = y + h * (0.92 - 0.72 * Math.sin(Math.PI * clamp(u)));
      const low = clamp(1 - Math.sin(Math.PI * clamp(u)) * 2.2);
      const col = mix([255, 214, 120], [255, 140, 70], low);
      glow(ctx, sx, sy, Math.min(w, h) * 0.6 * sunScale, col, 0.5 * (1 - cloud * 0.7));
      ctx.fillStyle = css(mix(col, [255, 248, 225], 0.5), 1 - cloud * 0.75);
      dot(ctx, sx, sy, Math.min(w, h) * 0.07 * sunScale);
    } else {
      drawMoon(ctx, x + w * 0.72, y + h * 0.24, Math.min(w, h) * 0.07, 1, css(top));
    }
    if (cloud > 0) {
      for (let i = 0; i < 6; i++) {
        const cx = x + ((hash(i, 5) * w + t * (8 + hash(i, 6) * 10) + drift) % (w + 300)) - 150;
        const cy = y + h * (0.12 + hash(i, 7) * 0.45);
        const shade = mix([236, 238, 242], [120, 128, 145], 1 - dl);
        cloudBlob(ctx, cx, cy, w * (0.22 + hash(i, 8) * 0.18), css(shade), cloud * (0.75 + 0.25 * hash(i, 9)));
      }
    }
    if (city > 0) {
      ctx.save();
      ctx.globalAlpha *= city;
      const base = y + h;
      const night = 1 - dl;
      for (let i = 0; i < 9; i++) {
        const bw = w * (0.09 + hash(i, 31) * 0.08);
        const bx = x + (i / 9) * w + (hash(i, 32) - 0.5) * 30;
        const bh = h * (0.18 + hash(i, 33) * 0.32);
        ctx.fillStyle = css(mix(mix(bot, [40, 46, 66], 0.55), [10, 14, 28], night));
        ctx.fillRect(bx, base - bh, bw, bh);
        for (let r = 0; r < Math.floor(bh / 26); r++) {
          for (let c = 0; c < Math.floor(bw / 22); c++) {
            if (hash(i * 97 + r * 13 + c, 34) < 0.62) continue;
            const on = night * (0.55 + 0.45 * noise(t * 0.08 + i + r * 3 + c, 35));
            ctx.fillStyle = `rgba(255,214,150,${on * 0.85})`;
            ctx.fillRect(bx + 6 + c * 22, base - bh + 8 + r * 26, 9, 12);
          }
        }
      }
      ctx.restore();
    }
  }

  // Işık modeli: kaynaklar odadaki her yüzeyi aynı oranda aydınlatır
  function ambient({ day = 0, ceil = 0, lamp = 0, screen = 0, moon = 0, night = 0 } = {}) {
    const a = [0.075, 0.09, 0.155];
    const add = (k, c) => { for (let i = 0; i < 3; i++) a[i] += k * c[i]; };
    add(day, [0.92, 0.9, 0.84]);
    add(ceil, [0.8, 0.84, 0.92]);
    add(lamp, [0.52, 0.35, 0.17]);
    add(screen, [0.05, 0.09, 0.19]);
    add(moon, [0.03, 0.045, 0.08]);
    add(night, [0.12, 0.075, 0.03]);
    return a.map((v) => Math.min(1.04, v));
  }
  const lit = (col, amb, a = 1) => css(col.map((v, i) => v * amb[i]), a);
  const M = {
    wall: hex('#d9d1c3'), wallTop: hex('#c9bfae'), floor: hex('#a07656'), plank: hex('#86603f'), base: hex('#efe8dc'),
    wood: hex('#7c5b40'), woodDark: hex('#5c412d'), sofa: hex('#3f7590'), sofaDark: hex('#2f5c73'), cushion: hex('#e5b85c'),
    sheet: hex('#ebe6dc'), blanket: hex('#5a79ad'), blanketDark: hex('#476293'), pillow: hex('#f3eee4'),
    rug: hex('#b8735a'), rugIn: hex('#d39a72'), leaf: hex('#4b8a5f'), leafDark: hex('#356b49'), pot: hex('#c26f4f'),
    curtain: hex('#d6a160'), curtainDark: hex('#b8854b'), blackout: hex('#2d3448'),
    skin: hex('#d9a27c'), skinDark: hex('#bf8763'), hair: hex('#2e231d'), shirt: hex('#e07a5f'), shirtDark: hex('#c6654c'),
    pants: hex('#34466a'), shoe: hex('#20232c'), metal: hex('#c9ccd4'), dark: hex('#262a33'), paper: hex('#f4efe4'),
    door: hex('#8a6a50'), art1: hex('#e9a65a'), art2: hex('#3f6f8a'),
  };

  // Telefonu yandan tutan el için küçük telefon (ekran parlaklığı b)
  function handPhone(ctx, x, y, s, b, rot = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    roundRect(ctx, -11, -24, 22, 48, 5);
    ctx.fillStyle = '#14171f';
    ctx.fill();
    if (b > 0.02) {
      roundRect(ctx, -8, -20, 16, 40, 3);
      ctx.fillStyle = `rgba(190,220,255,${0.25 + 0.75 * b})`;
      ctx.fill();
    }
    ctx.restore();
  }

  // İnsan (yandan). x, y: ayakların bastığı yer; f: yüzün yönü (1 sağ, −1 sol).
  // pose: stand | walk | sit | desk; o.phone: telefon parlaklığı (null: telefon yok); o.eyes; o.phase (yürüyüş);
  // o.slump (yorgunluk 0–1); o.cup; o.meter (ışık ölçer tutar)
  function person(ctx, x, y, s, amb, o = {}) {
    const f = o.f ?? 1;
    const pose = o.pose ?? 'stand';
    const sit = pose === 'sit' || pose === 'desk';
    const L = (c) => lit(c, amb);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s * f, s);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const hipY = sit ? -112 : -158;
    const slump = o.slump ?? 0;
    const ph = o.phase ?? 0;
    const sw = pose === 'walk' ? Math.sin(ph) * 0.42 : 0;
    // bacaklar (arkadaki önce)
    const legPts = (side) => {
      if (sit) return [[0, hipY], [74, hipY - 2], [78 + side * 6, 0]];
      const an = side * sw;
      const knee = [Math.sin(an) * 78, hipY + Math.cos(an) * 78];
      const an2 = an + (pose === 'walk' ? Math.max(0, -side * Math.cos(ph)) * 0.5 : 0);
      return [[0, hipY], knee, [knee[0] + Math.sin(an2 - 0.05) * 80, 0]];
    };
    for (const side of [-1, 1]) {
      const [hp, kn, ft] = legPts(side);
      ctx.strokeStyle = L(side < 0 ? mix(M.pants, [0, 0, 0], 0.25) : M.pants);
      ctx.lineWidth = 27;
      ctx.beginPath();
      ctx.moveTo(...hp);
      ctx.lineTo(...kn);
      ctx.lineTo(...ft);
      ctx.stroke();
      ctx.fillStyle = L(M.shoe);
      roundRect(ctx, ft[0] - 14, ft[1] - 16, 46, 18, 9);
      ctx.fill();
    }
    // gövde (yorgunlukta öne eğilir)
    ctx.save();
    ctx.translate(0, hipY);
    ctx.rotate(slump * 0.42);
    const sh = [6, -118];
    const arm = (back) => {
      let el;
      let hd;
      if (o.phone != null && !back) {
        el = [38, -60];
        hd = [60, -128];
      } else if (o.cup && !back) {
        el = [40, -50];
        hd = [62, -112];
      } else if (o.meter && !back) {
        el = [52, -66];
        hd = [104, -84];
      } else if (pose === 'desk') {
        el = [42, -52];
        hd = [104, -60];
      } else if (sit) {
        el = [22, -58];
        hd = [62, -6];
      } else {
        const an = (back ? 1 : -1) * sw;
        el = [sh[0] + Math.sin(an) * 62, sh[1] + Math.cos(an) * 62];
        hd = [el[0] + Math.sin(an + 0.25) * 58, el[1] + Math.cos(an + 0.25) * 58];
      }
      ctx.strokeStyle = L(back ? M.shirtDark : M.shirt);
      ctx.lineWidth = 22;
      ctx.beginPath();
      ctx.moveTo(...sh);
      ctx.lineTo(...el);
      ctx.stroke();
      ctx.strokeStyle = L(back ? M.skinDark : M.skin);
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(...el);
      ctx.lineTo(...hd);
      ctx.stroke();
      return hd;
    };
    arm(true);
    roundRect(ctx, -34, -136, 70, 146, 30);
    ctx.fillStyle = L(M.shirt);
    ctx.fill();
    // boyun ve baş
    const hc = [12, -186];
    ctx.strokeStyle = L(M.skinDark);
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(4, -130);
    ctx.lineTo(hc[0] - 2, hc[1] + 26);
    ctx.stroke();
    ctx.fillStyle = L(M.skin);
    dot(ctx, hc[0], hc[1], 37);
    // burun
    ctx.beginPath();
    ctx.moveTo(hc[0] + 33, hc[1] - 8);
    ctx.lineTo(hc[0] + 46, hc[1] + 6);
    ctx.lineTo(hc[0] + 33, hc[1] + 10);
    ctx.fill();
    // saç
    ctx.fillStyle = L(M.hair);
    ctx.beginPath();
    ctx.arc(hc[0], hc[1], 40, Math.PI * 0.82, Math.PI * 1.93);
    ctx.quadraticCurveTo(hc[0] + 14, hc[1] - 18, hc[0] - 6, hc[1] - 6);
    ctx.quadraticCurveTo(hc[0] - 22, hc[1] + 12, hc[0] - 30, hc[1] + 26);
    ctx.closePath();
    ctx.fill();
    // kulak
    ctx.fillStyle = L(M.skinDark);
    ctx.beginPath();
    ctx.ellipse(hc[0] - 4, hc[1] + 4, 7, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // göz
    const eyes = o.eyes ?? 1;
    if (eyes > 0.5) {
      ctx.fillStyle = '#1c1714';
      dot(ctx, hc[0] + 22, hc[1] - 4, 4.5);
    } else {
      ctx.strokeStyle = '#3a2a22';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(hc[0] + 16, hc[1] - 2);
      ctx.quadraticCurveTo(hc[0] + 22, hc[1] + 2, hc[0] + 28, hc[1] - 2);
      ctx.stroke();
    }
    const hd = arm(false);
    if (o.phone != null) {
      handPhone(ctx, hd[0] + 8, hd[1] - 14, 1.2, o.phone, -0.35);
      if (o.phone > 0.02) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        glow(ctx, hc[0] + 30, hc[1], 120, BLUE, 0.32 * o.phone);
        ctx.restore();
      }
    }
    if (o.cup) {
      ctx.fillStyle = L(hex('#f2efe8'));
      roundRect(ctx, hd[0] - 4, hd[1] - 30, 30, 34, 6);
      ctx.fill();
    }
    if (o.meter) {
      roundRect(ctx, hd[0] - 6, hd[1] - 46, 34, 58, 6);
      ctx.fillStyle = '#1d222c';
      ctx.fill();
      ctx.fillStyle = '#e9eef6';
      dot(ctx, hd[0] + 11, hd[1] - 46, 10);
      ctx.fillStyle = '#9fd3b0';
      ctx.fillRect(hd[0], hd[1] - 30, 22, 14);
    }
    ctx.restore();
    ctx.restore();
  }

  // Oda: kind 'bed' | 'living' | 'desk' | 'table'. Işık kaynakları ve perde ambient'i belirler; döndürür.
  // o: hour, ceil, lamp, screen, curtain (0 açık–1 kapalı), blackout, deskX, nightLight, led, tape, clock,
  //    sleeper { eyes, phone, zz }, who(amb) (insanı çizen işlev), city
  function room(ctx, t, o = {}) {
    const hour = o.hour ?? 22;
    const curtain = o.curtain ?? 0;
    const dl = daylight(hour);
    const day = (o.day ?? dl) * (1 - (o.blackout ? 0.98 : 0.85) * curtain);
    const amb = ambient({ day, ceil: o.ceil ?? 0, lamp: o.lamp ?? 0, screen: o.screen ?? 0, moon: (1 - dl) * (1 - curtain), night: o.nightLight ?? 0 });
    const L = (c, a) => lit(c, amb, a);
    ctx.save();
    // duvar
    ctx.fillStyle = L(M.wall);
    ctx.fillRect(0, 0, W, 790);
    const wg = ctx.createLinearGradient(0, 0, 0, 790);
    wg.addColorStop(0, 'rgba(0,0,0,0.22)');
    wg.addColorStop(0.3, 'rgba(0,0,0,0)');
    wg.addColorStop(1, 'rgba(0,0,0,0.08)');
    ctx.fillStyle = wg;
    ctx.fillRect(0, 0, W, 790);
    // pencere
    const wx = 170;
    const wy = 150;
    const ww = 440;
    const wh = 450;
    ctx.save();
    roundRect(ctx, wx, wy, ww, wh, 6);
    ctx.clip();
    sky(ctx, wx, wy, ww, wh, hour, t, { cloud: o.cloud ?? 0, city: o.city ?? 1 });
    ctx.restore();
    // pencereden duvara yayılan ışık
    if (day > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, wx + ww / 2, wy + wh / 2, 620, [255, 236, 200], 0.18 * day);
      ctx.restore();
    }
    ctx.strokeStyle = L(M.base);
    ctx.lineWidth = 16;
    roundRect(ctx, wx, wy, ww, wh, 6);
    ctx.stroke();
    ctx.lineWidth = 9;
    line(ctx, wx + ww / 2, wy, wx + ww / 2, wy + wh);
    line(ctx, wx, wy + wh * 0.42, wx + ww, wy + wh * 0.42);
    ctx.fillStyle = L(M.base);
    roundRect(ctx, wx - 24, wy + wh + 2, ww + 48, 20, 6);
    ctx.fill();
    // perdeler
    const cw = lerp(62, ww / 2 + 24, curtain);
    const cc = o.blackout ? M.blackout : M.curtain;
    const ccd = o.blackout ? mix(M.blackout, [0, 0, 0], 0.3) : M.curtainDark;
    ctx.fillStyle = L(M.woodDark);
    ctx.fillRect(wx - 70, wy - 44, ww + 140, 12);
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? wx - 50 : wx + ww + 50 - cw;
      ctx.fillStyle = L(cc);
      ctx.beginPath();
      ctx.moveTo(x0, wy - 36);
      ctx.lineTo(x0 + cw, wy - 36);
      ctx.lineTo(x0 + cw + side * -8, wy + wh + 60);
      ctx.lineTo(x0, wy + wh + 60);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = L(ccd);
      ctx.lineWidth = 6;
      const folds = Math.max(2, Math.round(cw / 34));
      for (let k = 1; k < folds; k++) line(ctx, x0 + (k / folds) * cw, wy - 30, x0 + (k / folds) * cw + side * -4, wy + wh + 56);
    }
    // duvardaki tablo
    if (o.kind === 'living' || o.kind === 'bed') {
      const fx = o.kind === 'bed' ? 980 : 1180;
      const fy = o.kind === 'bed' ? 250 : 240;
      ctx.fillStyle = L(M.dark);
      ctx.fillRect(fx, fy, 230, 160);
      ctx.fillStyle = L(M.paper);
      ctx.fillRect(fx + 12, fy + 12, 206, 136);
      ctx.fillStyle = L(M.art1);
      dot(ctx, fx + 150, fy + 62, 24);
      ctx.fillStyle = L(M.art2);
      ctx.beginPath();
      ctx.moveTo(fx + 12, fy + 148);
      ctx.lineTo(fx + 80, fy + 78);
      ctx.lineTo(fx + 130, fy + 120);
      ctx.lineTo(fx + 170, fy + 92);
      ctx.lineTo(fx + 218, fy + 148);
      ctx.closePath();
      ctx.fill();
    }
    // tavan lambası
    const px = 1040;
    ctx.strokeStyle = L(M.dark);
    ctx.lineWidth = 4;
    line(ctx, px, 0, px, 120);
    ctx.fillStyle = L(M.dark);
    ctx.beginPath();
    ctx.moveTo(px - 28, 120);
    ctx.lineTo(px + 28, 120);
    ctx.lineTo(px + 70, 182);
    ctx.lineTo(px - 70, 182);
    ctx.closePath();
    ctx.fill();
    const ceil = o.ceil ?? 0;
    if (ceil > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(235,242,255,${ceil})`;
      ctx.beginPath();
      ctx.ellipse(px, 184, 40, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      glow(ctx, px, 200, 760, [210, 225, 255], 0.22 * ceil);
      const cg = ctx.createLinearGradient(0, 182, 0, 1000);
      cg.addColorStop(0, `rgba(220,232,255,${0.16 * ceil})`);
      cg.addColorStop(1, 'rgba(220,232,255,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.moveTo(px - 66, 182);
      ctx.lineTo(px + 66, 182);
      ctx.lineTo(px + 520, 1000);
      ctx.lineTo(px - 520, 1000);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // zemin
    ctx.fillStyle = L(M.floor);
    ctx.fillRect(0, 790, W, H - 790);
    ctx.strokeStyle = L(M.plank, 0.7);
    ctx.lineWidth = 3;
    for (let k = 0; k < 5; k++) line(ctx, 0, 820 + k * 56, W, 820 + k * 56);
    const fg = ctx.createLinearGradient(0, 790, 0, H);
    fg.addColorStop(0, 'rgba(0,0,0,0)');
    fg.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = fg;
    ctx.fillRect(0, 790, W, H - 790);
    ctx.fillStyle = L(M.base);
    ctx.fillRect(0, 772, W, 20);
    // pencereden yere düşen gün ışığı
    if (day > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const sg = ctx.createLinearGradient(wx, 600, wx + 500, 1080);
      sg.addColorStop(0, `rgba(255,238,205,${0.22 * day})`);
      sg.addColorStop(1, 'rgba(255,238,205,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(wx + 10, wy + wh);
      ctx.lineTo(wx + ww - 10, wy + wh);
      ctx.lineTo(wx + ww + 560, 1080);
      ctx.lineTo(wx + 180, 1080);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // mobilya
    const kind = o.kind ?? 'living';
    if (kind === 'living') {
      ctx.fillStyle = L(M.rug);
      ctx.beginPath();
      ctx.ellipse(1140, 905, 560, 64, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = L(M.rugIn);
      ctx.beginPath();
      ctx.ellipse(1140, 905, 430, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      plant(ctx, 700, 790, 1, amb);
      // kanepe
      ctx.fillStyle = L(M.sofaDark);
      roundRect(ctx, 820, 500, 660, 200, 40);
      ctx.fill();
      ctx.fillStyle = L(M.sofa);
      roundRect(ctx, 800, 640, 700, 130, 30);
      ctx.fill();
      roundRect(ctx, 780, 590, 70, 190, 30);
      ctx.fill();
      roundRect(ctx, 1450, 590, 70, 190, 30);
      ctx.fill();
      ctx.fillStyle = L(M.cushion);
      roundRect(ctx, 1320, 548, 110, 100, 26);
      ctx.fill();
      ctx.fillStyle = L(M.woodDark);
      ctx.fillRect(850, 770, 14, 26);
      ctx.fillRect(1436, 770, 14, 26);
      // yan sehpa ve lamba
      sideLamp(ctx, 1640, 640, o.lamp ?? 0, amb);
    } else if (kind === 'bed') {
      bedFurniture(ctx, t, o, amb);
    } else if (kind === 'desk') {
      plant(ctx, 1760, 790, 1.1, amb);
      const dx = o.deskX ?? 1240;
      deskSet(ctx, dx, amb);
    } else if (kind === 'table') {
      plant(ctx, 1640, 790, 1.2, amb);
      ctx.fillStyle = L(M.woodDark);
      ctx.fillRect(770, 650, 18, 140);
      ctx.fillStyle = L(M.wood);
      ctx.beginPath();
      ctx.ellipse(780, 650, 160, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = L(M.paper);
      ctx.beginPath();
      ctx.ellipse(740, 636, 54, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = L(hex('#e8a25a'));
      dot(ctx, 740, 628, 14);
      // sandalye
      ctx.fillStyle = L(M.woodDark);
      ctx.fillRect(960, 520, 16, 270);
      ctx.fillRect(900, 650, 90, 14);
      ctx.fillRect(904, 660, 12, 130);
    }
    if (o.who) o.who(amb);
    ctx.restore();
    return amb;
  }

  function plant(ctx, x, y, s, amb) {
    const L = (c) => lit(c, amb);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    for (let i = 0; i < 9; i++) {
      const an = -Math.PI / 2 + (i - 4) * 0.28;
      ctx.fillStyle = L(i % 2 ? M.leaf : M.leafDark);
      ctx.save();
      ctx.translate(0, -110);
      ctx.rotate(an + Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, -80, 22, 80, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = L(M.pot);
    ctx.beginPath();
    ctx.moveTo(-50, -120);
    ctx.lineTo(50, -120);
    ctx.lineTo(38, 0);
    ctx.lineTo(-38, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Sehpa üstünde sıcak ışıklı lamba (on 0–1)
  function sideLamp(ctx, x, y, on, amb) {
    const L = (c) => lit(c, amb);
    ctx.fillStyle = L(M.wood);
    ctx.fillRect(x - 90, y, 180, 16);
    ctx.fillStyle = L(M.woodDark);
    ctx.fillRect(x - 80, y + 16, 12, 140);
    ctx.fillRect(x + 68, y + 16, 12, 140);
    ctx.fillStyle = L(M.dark);
    roundRect(ctx, x - 30, y - 18, 60, 18, 6);
    ctx.fill();
    ctx.fillRect(x - 5, y - 110, 10, 94);
    const shade = mix(mix([238, 226, 200], [0, 0, 0], 0), [255, 196, 110], on);
    ctx.fillStyle = on > 0.05 ? css(mix(shade.map((v, i) => v * amb[i]), shade, on)) : L([238, 226, 200]);
    ctx.beginPath();
    ctx.moveTo(x - 52, y - 190);
    ctx.lineTo(x + 52, y - 190);
    ctx.lineTo(x + 78, y - 104);
    ctx.lineTo(x - 78, y - 104);
    ctx.closePath();
    ctx.fill();
    if (on > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, x, y - 120, 560, [255, 170, 80], 0.32 * on);
      glow(ctx, x, y - 90, 160, [255, 210, 140], 0.35 * on);
      ctx.restore();
    }
  }

  function deskSet(ctx, dx, amb) {
    const L = (c) => lit(c, amb);
    ctx.fillStyle = L(M.woodDark);
    ctx.fillRect(dx - 240, 630, 16, 160);
    ctx.fillRect(dx + 224, 630, 16, 160);
    ctx.fillStyle = L(M.wood);
    ctx.fillRect(dx - 260, 610, 520, 24);
    // dizüstü (arkadan)
    ctx.fillStyle = L(M.metal);
    ctx.beginPath();
    ctx.moveTo(dx - 40, 606);
    ctx.lineTo(dx + 20, 606);
    ctx.lineTo(dx + 6, 500);
    ctx.lineTo(dx - 54, 500);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = L(M.dark);
    ctx.fillRect(dx - 60, 604, 110, 8);
    // kupa
    ctx.fillStyle = L(M.paper);
    roundRect(ctx, dx - 200, 572, 34, 38, 6);
    ctx.fill();
    // sandalye
    ctx.fillStyle = L(M.dark);
    ctx.fillRect(dx + 200, 690, 120, 14);
    ctx.fillRect(dx + 304, 520, 14, 180);
    ctx.fillRect(dx + 254, 700, 12, 90);
  }

  // Yatak, komodin, saat, şarj ışığı; yatan insan (o.sleeper)
  function bedFurniture(ctx, t, o, amb) {
    const L = (c) => lit(c, amb);
    // başlık
    ctx.fillStyle = L(M.woodDark);
    roundRect(ctx, 640, 470, 46, 320, 12);
    ctx.fill();
    ctx.fillStyle = L(M.wood);
    ctx.fillRect(640, 700, 940, 70);
    ctx.fillStyle = L(M.woodDark);
    ctx.fillRect(1550, 600, 34, 190);
    ctx.fillStyle = L(M.sheet);
    roundRect(ctx, 680, 640, 880, 70, 18);
    ctx.fill();
    ctx.fillStyle = L(M.pillow);
    ctx.beginPath();
    ctx.ellipse(780, 628, 110, 34, -0.05, 0, Math.PI * 2);
    ctx.fill();
    const sl = o.sleeper ?? { eyes: 0 };
    // baş (yüzü yukarı)
    const hx = 806;
    const hy = 596;
    ctx.fillStyle = L(M.skin);
    dot(ctx, hx, hy, 40);
    ctx.fillStyle = L(M.hair);
    ctx.beginPath();
    ctx.arc(hx, hy, 43, Math.PI * 0.55, Math.PI * 1.45);
    ctx.quadraticCurveTo(hx - 6, hy - 10, hx - 10, hy + 40);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = L(M.skin);
    ctx.beginPath();
    ctx.moveTo(hx + 4, hy - 38);
    ctx.lineTo(hx + 14, hy - 52);
    ctx.lineTo(hx + 24, hy - 36);
    ctx.fill();
    if ((sl.eyes ?? 0) > 0.5) {
      ctx.fillStyle = '#f4f6fb';
      dot(ctx, hx + 26, hy - 18, 6);
      ctx.fillStyle = '#1c1714';
      dot(ctx, hx + 27, hy - 19, 3);
    } else {
      ctx.strokeStyle = '#3a2a22';
      ctx.lineWidth = 3;
      line(ctx, hx + 20, hy - 18, hx + 32, hy - 16);
    }
    // yorgan
    ctx.fillStyle = L(M.blanket);
    ctx.beginPath();
    ctx.moveTo(838, 650);
    ctx.bezierCurveTo(880, 580, 980, 572, 1060, 596);
    ctx.bezierCurveTo(1180, 630, 1320, 590, 1440, 610);
    ctx.bezierCurveTo(1520, 622, 1560, 650, 1566, 720);
    ctx.lineTo(838, 730);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = L(M.blanketDark);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(860, 640);
    ctx.bezierCurveTo(900, 600, 980, 596, 1050, 612);
    ctx.stroke();
    // telefon tutan kol
    if (sl.phone != null) {
      const ph = [826, 452];
      ctx.strokeStyle = L(M.skin);
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(900, 612);
      ctx.quadraticCurveTo(920, 520, ph[0] + 16, ph[1] + 30);
      ctx.stroke();
      ctx.save();
      ctx.translate(ph[0], ph[1]);
      ctx.rotate(0.15);
      roundRect(ctx, -46, -12, 92, 22, 6);
      ctx.fillStyle = '#14171f';
      ctx.fill();
      if (sl.phone > 0.02) {
        ctx.fillStyle = `rgba(190,220,255,${0.4 + 0.6 * sl.phone})`;
        ctx.fillRect(-40, 8, 80, 3);
      }
      ctx.restore();
      if (sl.phone > 0.02) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(0, ph[1], 0, hy);
        g.addColorStop(0, rgba(BLUE, 0.2 * sl.phone));
        g.addColorStop(0.6, rgba(BLUE, 0.07 * sl.phone));
        g.addColorStop(1, rgba(BLUE, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(ph[0] - 44, ph[1] + 10);
        ctx.lineTo(ph[0] + 44, ph[1] + 10);
        ctx.lineTo(hx + 90, hy + 20);
        ctx.lineTo(hx - 70, hy + 20);
        ctx.closePath();
        ctx.fill();
        glow(ctx, hx + 10, hy - 20, 230, BLUE, 0.5 * sl.phone);
        glow(ctx, ph[0], ph[1] - 120, 420, BLUE, 0.1 * sl.phone);
        ctx.restore();
      }
    }
    if (sl.zz) text(ctx, 'z z z', hx + 70, hy - 110, { size: 40, family: 'serif', italic: true, color: C.mel, alpha: sl.zz * (0.6 + 0.4 * Math.sin(t * 2)) });
    // komodin
    ctx.fillStyle = L(M.wood);
    ctx.fillRect(1610, 610, 210, 180);
    ctx.fillStyle = L(M.woodDark);
    ctx.fillRect(1626, 680, 178, 6);
    ctx.fillStyle = L(M.metal);
    dot(ctx, 1715, 650, 6);
    // dijital saat
    if (o.clock) {
      roundRect(ctx, 1640, 548, 130, 60, 10);
      ctx.fillStyle = '#07090f';
      ctx.fill();
      glow(ctx, 1705, 578, 120, [255, 90, 80], 0.18);
      text(ctx, o.clock, 1705, 579, { size: 34, family: 'mono', weight: 700, color: '#ff6a5a' });
    }
    // şarj aleti ve küçük ışığı
    if (o.led != null) {
      ctx.fillStyle = L(M.metal);
      roundRect(ctx, 1784, 584, 28, 26, 5);
      ctx.fill();
      const blink = o.led * (0.55 + 0.45 * Math.sin(t * 3));
      const covered = o.tape ?? 0;
      glow(ctx, 1798, 596, 70, [80, 170, 255], 0.6 * blink * (1 - covered));
      ctx.fillStyle = `rgba(110,190,255,${blink * (1 - covered)})`;
      dot(ctx, 1798, 596, 4);
      if (covered > 0) {
        ctx.save();
        ctx.globalAlpha *= covered;
        ctx.translate(1798, 596);
        ctx.rotate(-0.2);
        ctx.fillStyle = '#e8dcb8';
        ctx.fillRect(-16, -9, 32, 18);
        ctx.restore();
      }
    }
    // gece lambası (prize takılı, yere yakın)
    if (o.nightLight != null) {
      const on = o.nightLight;
      ctx.fillStyle = L(M.base);
      roundRect(ctx, 1838, 720, 34, 46, 8);
      ctx.fill();
      ctx.fillStyle = on > 0.05 ? `rgba(255,190,110,${0.4 + 0.6 * on})` : L([230, 222, 205]);
      dot(ctx, 1855, 743, 12);
      if (on > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        glow(ctx, 1855, 760, 300, [255, 160, 80], 0.3 * on);
        ctx.restore();
      }
    }
    if (o.lamp > 0 || o.bedLamp) sideLampSmall(ctx, 1760, 610, o.lamp ?? 0, amb);
  }

  function sideLampSmall(ctx, x, y, on, amb) {
    ctx.fillStyle = lit(M.dark, amb);
    ctx.fillRect(x - 4, y - 70, 8, 70);
    ctx.fillStyle = on > 0.05 ? `rgba(255,200,120,${0.5 + 0.5 * on})` : lit([238, 226, 200], amb);
    ctx.beginPath();
    ctx.moveTo(x - 30, y - 120);
    ctx.lineTo(x + 30, y - 120);
    ctx.lineTo(x + 44, y - 66);
    ctx.lineTo(x - 44, y - 66);
    ctx.closePath();
    ctx.fill();
    if (on > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, x, y - 80, 360, [255, 170, 80], 0.28 * on);
      ctx.restore();
    }
  }

  // Eski çağrılar için: yatak odası (gece), telefon parlaklığı ve gözler
  function drawBedroom(ctx, t, a, { phoneB = 1, eyes = 1, dark = 0, hand = true, clock = '01:30', day = null, hour = 1.5, ceil = 0, zz = 0, curtain = 0, led = null, tape = 0, nightLight = null, blackout = false } = {}) {
    if (a <= 0.002) return null;
    ctx.save();
    ctx.globalAlpha *= a;
    const amb = room(ctx, t, {
      kind: 'bed', hour, day: day ?? undefined, ceil, screen: hand ? phoneB : 0, clock, curtain, led, tape, nightLight, blackout,
      sleeper: { eyes, phone: hand ? phoneB : null, zz },
    });
    if (dark > 0) {
      ctx.fillStyle = `rgba(2,3,8,${0.45 * dark})`;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
    return amb;
  }

  // Lüks biçimi: 3.000 · 450 · 25 · 0,5
  function fmtLux(v) {
    let n;
    if (v >= 10000) n = Math.round(v / 1000) * 1000;
    else if (v >= 1000) n = Math.round(v / 100) * 100;
    else if (v >= 100) n = Math.round(v / 10) * 10;
    else if (v >= 10) n = Math.round(v);
    else return (Math.round(v * 10) / 10).toFixed(1).replace('.', ',').replace(',0', '');
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // El tipi ışık ölçer
  function luxDevice(ctx, x, y, s, lux, a, { label = '' } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    roundRect(ctx, -146, -96, 300, 230, 30);
    ctx.fill();
    const g = ctx.createLinearGradient(0, -110, 0, 120);
    g.addColorStop(0, '#2a303d');
    g.addColorStop(1, '#171b24');
    ctx.fillStyle = g;
    roundRect(ctx, -150, -110, 300, 230, 30);
    ctx.fill();
    ctx.strokeStyle = '#4a5368';
    ctx.lineWidth = 3;
    ctx.stroke();
    // sensör kubbesi
    ctx.fillStyle = '#eef2f8';
    ctx.beginPath();
    ctx.arc(0, -110, 34, Math.PI, 0);
    ctx.fill();
    glow(ctx, 0, -120, 70, [255, 255, 255], 0.25);
    // ekran
    roundRect(ctx, -122, -74, 244, 118, 14);
    ctx.fillStyle = '#a9cdb5';
    ctx.fill();
    const ls = fmtLux(lux);
    text(ctx, ls, 92, -14, { size: ls.length > 5 ? 52 : ls.length > 4 ? 58 : 66, family: 'mono', weight: 700, color: '#15241b', align: 'right' });
    text(ctx, 'lx', 106, 14, { size: 26, family: 'mono', weight: 700, color: '#2f4a39', align: 'left' });
    if (label) text(ctx, label, 0, 84, { size: 26, weight: 600, color: C.cream });
    ctx.restore();
  }

  // Logaritmik lüks şeridi (0,1 – 100.000)
  const LS = { lo: -1, hi: 5 };
  function luxBar(ctx, x, y, w, lux, a, { marks = [], h = 22, ticks = true, band = null } = {}) {
    if (a <= 0.002) return;
    const X = (v) => x + ((Math.log10(Math.max(v, 0.1)) - LS.lo) / (LS.hi - LS.lo)) * w;
    ctx.save();
    ctx.globalAlpha *= a;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, '#0d1428');
    g.addColorStop(0.45, '#4a4560');
    g.addColorStop(0.75, '#d9a45a');
    g.addColorStop(1, '#fff1c4');
    ctx.fillStyle = g;
    roundRect(ctx, x, y - h / 2, w, h, h / 2);
    ctx.fill();
    if (band) {
      ctx.strokeStyle = rgba(band[2], 0.95);
      ctx.lineWidth = 4;
      roundRect(ctx, X(band[0]), y - h / 2 - 8, X(band[1]) - X(band[0]), h + 16, 10);
      ctx.stroke();
    }
    ctx.restore();
    if (ticks) {
      [[0.1, '0,1'], [1, '1'], [10, '10'], [100, '100'], [1000, '1.000'], [10000, '10.000'], [100000, '100.000']].forEach(([v, s]) => text(ctx, s, X(v), y + h / 2 + 30, { size: 22, family: 'mono', color: C.muted, alpha: a }));
    }
    for (const [v, s, col = C.cream, up = true] of marks) text(ctx, s, X(v), up ? y - h / 2 - 34 : y + h / 2 + 64, { size: 24, weight: 600, color: col, alpha: a });
    if (lux != null) {
      const mx = X(lux);
      ctx.save();
      ctx.globalAlpha *= a;
      glow(ctx, mx, y, 60, [255, 255, 255], 0.35);
      ctx.fillStyle = C.cream;
      ctx.beginPath();
      ctx.moveTo(mx, y - h / 2 - 4);
      ctx.lineTo(mx - 14, y - h / 2 - 24);
      ctx.lineTo(mx + 14, y - h / 2 - 24);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = C.cream;
      ctx.lineWidth = 4;
      line(ctx, mx, y - h / 2 - 2, mx, y + h / 2 + 2);
      ctx.restore();
    }
    return X;
  }

  // Bir sahneyi küçük bir pencereye (kart) çizer: draw(ctx) 1920×1080 dünyasında çizer
  function vignette(ctx, x, y, w, a, draw, caption, { capColor = C.cream, border = 'rgba(255,255,255,0.12)', sub = '' } = {}) {
    if (a <= 0.002) return;
    const h = (w * 1080) / 1920;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    roundRect(ctx, x + 8, y + 14, w, h, 26);
    ctx.fill();
    ctx.save();
    roundRect(ctx, x, y, w, h, 26);
    ctx.clip();
    ctx.translate(x, y);
    ctx.scale(w / 1920, w / 1920);
    draw(ctx);
    ctx.restore();
    roundRect(ctx, x, y, w, h, 26);
    ctx.strokeStyle = border;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
    if (caption) text(ctx, caption, x + w / 2, y + h + 48, { size: 34, family: 'display', weight: 700, color: capColor, alpha: a });
    if (sub) text(ctx, sub, x + w / 2, y + h + 92, { size: 26, family: 'serif', italic: true, color: C.muted, alpha: a });
  }

  // Haftalık uyku çizelgesi: rows [{ d, a, b, col }] (saat; 24 üstü ertesi gün), h0–h1 ekseni
  function sleepWeek(ctx, x, y, w, rowH, rows, a, { h0 = 20, h1 = 36, alarm = null, labelW = 120 } = {}) {
    const X = (h) => x + labelW + ((h - h0) / (h1 - h0)) * (w - labelW);
    if (a <= 0.002) return X;
    ctx.save();
    ctx.globalAlpha *= a;
    for (let hh = h0; hh <= h1; hh += 2) {
      ctx.strokeStyle = 'rgba(120,135,170,0.18)';
      ctx.lineWidth = 2;
      line(ctx, X(hh), y - 20, X(hh), y + rows.length * rowH);
    }
    ctx.restore();
    for (let hh = h0; hh <= h1; hh += 4) text(ctx, `${String(hh % 24).padStart(2, '0')}:00`, X(hh), y + rows.length * rowH + 34, { size: 22, family: 'mono', color: C.muted, alpha: a });
    rows.forEach((r, i) => {
      const ry = y + i * rowH + rowH / 2;
      const ra = a * (r.alpha ?? 1);
      text(ctx, r.d, x + labelW - 24, ry, { size: 28, weight: 700, color: r.col ? r.labelCol ?? C.cream : C.cream, align: 'right', alpha: ra });
      if (ra <= 0.002) return;
      const col = r.col ?? MEL;
      ctx.save();
      ctx.globalAlpha *= ra;
      const g = ctx.createLinearGradient(X(r.a), 0, X(r.b), 0);
      g.addColorStop(0, rgba(col, 0.95));
      g.addColorStop(1, rgba(col.map((c) => c * 0.7), 0.95));
      ctx.fillStyle = g;
      roundRect(ctx, X(r.a), ry - rowH * 0.3, Math.max(4, X(r.b) - X(r.a)), rowH * 0.6, rowH * 0.3);
      ctx.fill();
      ctx.restore();
      if (r.tag) text(ctx, r.tag, X(r.b) + 16, ry, { size: 24, weight: 700, color: rgba(col, 1), align: 'left', alpha: ra });
    });
    if (alarm != null) {
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.strokeStyle = C.error;
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 8]);
      line(ctx, X(alarm), y - 30, X(alarm), y + rows.length * rowH);
      ctx.restore();
    }
    return X;
  }

  // Basit simgeler
  function iconBulb(ctx, x, y, s, col, a = 1, on = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    if (on > 0) glow(ctx, 0, -10, 110, col, 0.5 * on);
    ctx.fillStyle = rgba(col, 0.35 + 0.65 * on);
    ctx.beginPath();
    ctx.arc(0, -14, 40, Math.PI * 0.8, Math.PI * 2.2);
    ctx.lineTo(16, 34);
    ctx.lineTo(-16, 34);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#9aa0ad';
    roundRect(ctx, -18, 36, 36, 24, 6);
    ctx.fill();
    ctx.restore();
  }

  function checkMark(ctx, x, y, s, p, col = C.ok) {
    if (p <= 0) return;
    ctx.save();
    ctx.strokeStyle = col;
    ctx.lineWidth = 7 * s;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const pts = [[-14, 0], [-4, 11], [16, -12]];
    ctx.moveTo(x + pts[0][0] * s, y + pts[0][1] * s);
    const k = clamp(p * 2);
    ctx.lineTo(x + lerp(pts[0][0], pts[1][0], k) * s, y + lerp(pts[0][1], pts[1][1], k) * s);
    if (p > 0.5) {
      const k2 = clamp(p * 2 - 1);
      ctx.lineTo(x + lerp(pts[1][0], pts[2][0], k2) * s, y + lerp(pts[1][1], pts[2][1], k2) * s);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Büyük alt yazı bandı (önemli cümleler için, ekranın altında)
  function banner(ctx, str, a, { y = 960, color = C.cream, size = 46 } = {}) {
    if (a <= 0.002) return;
    const w = measure(ctx, str, { size, family: 'display', weight: 700 }) + 90;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(6,9,20,0.78)';
    roundRect(ctx, W / 2 - w / 2, y - 46, w, 92, 46);
    ctx.fill();
    ctx.restore();
    text(ctx, str, W / 2, y + 2 + (1 - a) * 8, { size, family: 'display', weight: 700, color, alpha: a });
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

  // ---------------------------------------------------------------------------
  // 0 · Gece yarısı
  // ---------------------------------------------------------------------------
  const phoneOffAt = () => cue('h-off', 0) + 0.25;

  // Üç tanıdık an: pazar gecesi, ertelenen alarm, öğleden sonra
  function knowCards(ctx, t, a) {
    if (a <= 0.002) return;
    const w = 570;
    const y = 330;
    const xs = [60, 675, 1290];
    const k1 = a * after(t, 'h-know', 1, 0.7);
    vignette(ctx, xs[0], y, w, k1, (c) => {
      room(c, t, { kind: 'bed', hour: 1.8, clock: '01:47', sleeper: { eyes: 1 } });
    }, 'pazar gecesi', { sub: 'uyku bir türlü gelmiyor' });
    const k2 = a * after(t, 'h-know', 2, 0.7);
    const snooze = Math.min(5, 1 + Math.floor(Math.max(0, t - cue('h-know', 2)) / 0.45));
    vignette(ctx, xs[1], y, w, k2, (c) => {
      room(c, t, { kind: 'bed', hour: 6.9, clock: '07:00', curtain: 0.85, sleeper: { eyes: 0 } });
      const ring = 0.5 + 0.5 * Math.sin(t * 18);
      c.save();
      c.globalAlpha *= 0.6 + 0.4 * ring;
      c.strokeStyle = '#ff6a5a';
      c.lineWidth = 8;
      for (let i = 1; i <= 2; i++) {
        c.beginPath();
        c.arc(1705, 578, 90 + i * 34, -0.9, 0.9);
        c.stroke();
      }
      c.restore();
      roundRect(c, 1180, 300, 520, 150, 40);
      c.fillStyle = 'rgba(10,14,26,0.9)';
      c.fill();
      text(c, `ertele ×${snooze}`, 1440, 377, { size: 76, family: 'display', weight: 800, color: '#ffb0a6' });
    }, 'sabah alarmı', { sub: 'beş kez ertelendi' });
    const k3 = a * after(t, 'h-know', 3, 0.7);
    vignette(ctx, xs[2], y, w, k3, (c) => {
      room(c, t, {
        kind: 'desk', hour: 15, deskX: 1100, ceil: 0.5, day: 0.5,
        who: (amb) => person(c, 1360, 874, 1.55, amb, { pose: 'desk', f: -1, slump: 0.9, eyes: 0 }),
      });
      // boşalan pil
      const lv = lerp(0.6, 0.12, progress(t, cue('h-know', 3), cue('h-know', 3) + 2.0));
      c.save();
      c.translate(1500, 240);
      roundRect(c, -110, -50, 220, 100, 18);
      c.fillStyle = 'rgba(10,14,26,0.85)';
      c.fill();
      c.strokeStyle = '#f3ede1';
      c.lineWidth = 8;
      c.stroke();
      c.fillStyle = '#f3ede1';
      c.fillRect(110, -18, 16, 36);
      c.fillStyle = lv < 0.25 ? '#ff5468' : '#ffb547';
      roundRect(c, -96, -36, 192 * lv, 72, 10);
      c.fill();
      c.restore();
    }, 'öğleden sonra', { sub: 'enerji çöküyor' });
    text(ctx, 'Belki sen de tanıyorsun…', W / 2, 220, { size: 50, family: 'serif', italic: true, color: C.ice, alpha: a * after(t, 'h-know', 0, 0.6) });
  }

  DRAW.night = function sceneNight(ctx, lt, t) {
    const off = progress(t, phoneOffAt(), phoneOffAt() + 0.5);
    const toBrain = progress(t, cue('h-awake', 1) - 0.3, cue('h-awake', 1) + 0.9, ease.inOut);
    const toCards = progress(t, cue('h-know', 0) - 0.5, cue('h-know', 0) + 0.4, ease.inOut);
    const toTitle = progress(t, cue('h-plan', 0) - 0.3, cue('h-plan', 0) + 0.7, ease.inOut);
    const mins = 30 + Math.floor(clamp((t - sceneStart('night')) / 6, 0, 29));
    drawBedroom(ctx, t, 1 - toBrain, { phoneB: 1 - off, eyes: t < cue('h-off', 2) ? 1 : t < cue('h-awake', 0) ? 0 : 1, dark: off * 0.6, clock: `01:${String(mins).padStart(2, '0')}` });
    // "sadece beş dakika daha"
    chip(ctx, 'sadece 5 dakika daha…', 1180, 330, during(t, 'h-night', 'h-off') * after(t, 'h-night', 3, 0.5), { size: 36, color: C.ice, border: rgba(BLUE, 0.5) });
    drawAwakeBrain(ctx, t, toBrain * (1 - toCards));
    knowCards(ctx, t, toCards * (1 - toTitle));
    // başlık ve yol haritası
    if (toTitle > 0) {
      const a = toTitle;
      glow(ctx, W / 2, 400, 620, BLUE, 0.2 * a);
      text(ctx, 'GECENİN MAVİ IŞIĞI', W / 2, 360, { size: 112, family: 'display', weight: 800, spacing: 6, color: C.cream, alpha: a });
      text(ctx, 'Ekran ışığı beynimizdeki saati nasıl kandırır?', W / 2, 470, { size: 42, family: 'serif', italic: true, color: C.ice, alpha: a * after(t, 'h-plan', 0, 1.0) });
      const steps = [['1', 'saat nasıl çalışır?', SUN, 0], ['2', 'ışık onu nasıl kandırır?', BLUE, 1], ['3', 'bu akşam ne yapmalı?', OK, 2]];
      steps.forEach(([n, s, col, k], i) => {
        const sa = a * after(t, 'h-plan', k, 0.6);
        const x = 380 + i * 580;
        panel(ctx, x - 250, 600, 500, 150, sa, { border: rgba(col, 0.6), fill: 'rgba(10,15,30,0.85)' });
        text(ctx, n, x - 190, 676, { size: 72, family: 'display', weight: 800, color: rgba(col, 1), alpha: sa });
        text(ctx, s, x - 140, 676, { size: 34, weight: 700, color: C.cream, align: 'left', alpha: sa });
      });
      text(ctx, 'YUP AKADEMİ', W / 2, 860, { size: 26, weight: 700, spacing: 10, color: C.muted, alpha: a * after(t, 'h-plan', 2, 1.0) });
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
    const ra = vis(t, cue('c-reset', 0) - 0.3, cue('c-jetlag', 0) - 0.2, 0.5, 0.6);
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

    // c-jetlag: hafta sonu kayması ve sosyal jet lag
    const ja = vis(t, cue('c-jetlag', 0) - 0.3, sceneEnd('clock'), 0.6, 0.6);
    if (ja > 0) {
      const shift = after(t, 'c-jetlag', 1, 1.8, ease.inOut);
      const mon = after(t, 'c-jetlag', 3, 0.8);
      const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz', 'Pzt'];
      const rows = days.map((d, i) => {
        const wk = i === 5 || i === 6;
        if (i === 7) return { d, a: 25.5, b: 31, col: RED, alpha: mon, tag: 'alarm!' };
        return { d, a: wk ? lerp(23.5, 26.5, shift) : 23.5, b: wk ? lerp(31, 35, shift) : 31, col: wk ? WARM : MEL };
      });
      const X = sleepWeek(ctx, 300, 200, 1340, 72, rows, ja * after(t, 'c-jetlag', 0, 0.6), { h0: 20, h1: 38, alarm: mon > 0 ? 31 : null });
      // pazartesi: vücudun hâlâ uyumak istediği saatler (hayalet çubuk)
      if (mon > 0) {
        const ry = 200 + 7 * 72 + 36;
        ctx.save();
        ctx.globalAlpha *= ja * mon;
        ctx.setLineDash([10, 8]);
        ctx.strokeStyle = rgba(WARM, 0.9);
        ctx.lineWidth = 3;
        roundRect(ctx, X(26.5), ry - 22, X(35) - X(26.5), 44, 22);
        ctx.stroke();
        ctx.restore();
        text(ctx, 'vücut hâlâ uyumak istiyor', X(33), ry + 50, { size: 24, family: 'serif', italic: true, color: C.sun, alpha: ja * mon });
      }
      text(ctx, 'hafta sonu: geç yat, geç kalk', X(30), 200 + 6.5 * 72 - 150, { size: 28, weight: 700, color: C.sun, alpha: ja * shift * (1 - mon) });
      // başka bir saat diliminden dönüş: uçak
      const fly = progress(t, cue('c-jetlag', 4), cue('c-jetlag', 4) + 2.6, ease.inOut);
      if (fly > 0 && fly < 1) {
        const px = lerp(1700, 260, fly);
        const py = 140 - Math.sin(fly * Math.PI) * 40;
        ctx.save();
        ctx.globalAlpha *= ja * Math.sin(fly * Math.PI);
        ctx.translate(px, py);
        ctx.scale(-1.3, 1.3);
        ctx.fillStyle = C.cream;
        ctx.beginPath();
        ctx.ellipse(0, 0, 46, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-22, 34);
        ctx.lineTo(-6, 34);
        ctx.lineTo(14, 0);
        ctx.lineTo(-6, -34);
        ctx.lineTo(-22, -34);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-34, 0);
        ctx.lineTo(-48, -18);
        ctx.lineTo(-40, 0);
        ctx.lineTo(-48, 18);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      chip(ctx, 'SOSYAL JET LAG', W / 2, 950, ja * after(t, 'c-jetlag', 5, 0.6), { size: 44, color: C.cream, border: rgba(WARM, 0.8), weight: 800 });
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
    // şefin çağrısı: SCN → epifiz
    const route = [P('scn'), P('pvn'), [P('pineal')[0] + 40, P('pineal')[1] + 10], P('pineal')];
    const rp = progress(t, cue('m-call', 1) + 0.2, cue('m-call', 2) + 0.4, ease.inOut);
    travel(ctx, route, rp, SUN, ha * (1 - progress(t, cue('m-call', 2) + 0.6, cue('m-call', 2) + 1.2)), 8);
    // epifizden kana melatonin
    const relA = ha * progress(t, cue('m-call', 2) + 0.5, cue('m-call', 2) + 1.1);
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
    const wa = vis(t, cue('e-wire', 0) - 0.3, cue('e-every', 0) - 0.2, 0.6, 0.6);
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
      // e-every: dedektifin gece defteri
    const va = vis(t, cue('e-every', 0) - 0.3, sceneEnd('eye'), 0.6, 0.6);
    if (va > 0) {
      const b1 = after(t, 'e-every', 1, 0.7);
      vignette(ctx, 130, 170, 760, va * b1, (c) => bathroom(c, t, progress(t, cue('e-every', 1) + 0.3, cue('e-every', 1) + 0.5)), '02:14 · banyo', { sub: 'parlak tavan lambası' });
      const b2 = after(t, 'e-every', 2, 0.7);
      vignette(ctx, 1030, 170, 760, va * b2, (c) => {
        room(c, t, { kind: 'bed', hour: 0.7, screen: 1, clock: '00:40', sleeper: { eyes: 1, phone: 1 } });
      }, '00:40 · yatak', { sub: 'yüze tutulan ekran' });
      // defter
      const na = va * after(t, 'e-every', 0, 0.6);
      panel(ctx, 460, 760, 1000, 240, na, { fill: 'rgba(244,239,228,0.96)', border: 'rgba(0,0,0,0)', r: 18 });
      text(ctx, 'dedektifin defteri', 520, 806, { size: 28, family: 'serif', italic: true, color: '#6a5a48', align: 'left', alpha: na });
      [['00:40 · ekran', 2], ['02:14 · banyo lambası', 1]].forEach(([s2, k], i) => {
        const ea = va * after(t, 'e-every', k, 0.6);
        const y = 870 + i * 64;
        text(ctx, s2, 520, y, { size: 34, weight: 700, color: '#1d2433', align: 'left', alpha: ea });
        text(ctx, '→ hâlâ gündüz!', 1400, y, { size: 34, weight: 800, color: '#c4572d', align: 'right', alpha: ea * progress(t, cue('e-every', k) + 0.5, cue('e-every', k) + 1.0) });
      });
    }
  };

  // Banyo: fayans, ayna, lavabo, tavan lambası (on 0–1), aynadaki kişi
  function bathroom(ctx, t, on) {
    const amb = ambient({ ceil: on * 1.1 });
    const L = (c) => lit(c, amb);
    ctx.fillStyle = L(hex('#d7e3e6'));
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = L(hex('#b9c9cd'));
    ctx.lineWidth = 4;
    for (let x = 0; x < W; x += 120) line(ctx, x, 0, x, 800);
    for (let y = 0; y < 800; y += 120) line(ctx, 0, y, W, y);
    ctx.fillStyle = L(hex('#8f9ea6'));
    ctx.fillRect(0, 800, W, 280);
    // ayna ve lavabo
    ctx.fillStyle = L(hex('#aac3cf'));
    roundRect(ctx, 700, 200, 520, 380, 30);
    ctx.fill();
    ctx.strokeStyle = L(hex('#eef2f4'));
    ctx.lineWidth = 14;
    ctx.stroke();
    ctx.fillStyle = L(hex('#f2f4f5'));
    roundRect(ctx, 660, 640, 600, 70, 30);
    ctx.fill();
    ctx.fillRect(900, 700, 120, 100);
    // tavan lambası
    ctx.fillStyle = on > 0.05 ? `rgba(240,246,255,${0.4 + 0.6 * on})` : L(hex('#e8ecef'));
    ctx.beginPath();
    ctx.ellipse(960, 30, 220, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    if (on > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, 960, 60, 900, [220, 232, 255], 0.3 * on);
      ctx.restore();
    }
    person(ctx, 1400, 1000, 1.9, amb, { pose: 'stand', f: -1, eyes: on > 0.5 ? 0 : 1 });
  }

  // ---------------------------------------------------------------------------
  // 5 · Işık günlüğü: aynı günün ışığını ölçmek
  // ---------------------------------------------------------------------------
  const FACADES = ['#e9c9a4', '#c9d6df', '#d9a98f', '#b8c9b0', '#e4d6bf', '#a9b9cf'].map(hex);

  // Sokak: hour, cloud, scroll (yürürken arka plan kayar), busStop, who(amb)
  function street(ctx, t, o = {}) {
    const hour = o.hour ?? 12;
    const cloud = o.cloud ?? 0;
    const dl = daylight(hour);
    const amb = ambient({ day: dl * lerp(1.1, 0.9, cloud) });
    const L = (c, a) => lit(c, amb, a);
    sky(ctx, 0, 0, W, 800, hour, t, { cloud, sunScale: 1.8 });
    const sc = o.scroll ?? 0;
    // uzak binalar
    for (let i = -2; i < 16; i++) {
      const bw = 170 + hash(i + 40, 51) * 120;
      const raw = i * 160 - (sc * 0.35) % 160;
      const bx = raw;
      const k = Math.floor((i * 160 + sc * 0.35) / 160);
      const bh = 260 + hash(k, 52) * 280;
      const col = FACADES[Math.abs(k) % FACADES.length];
      ctx.fillStyle = L(mix(col, [150, 165, 190], 0.45));
      ctx.fillRect(bx, 790 - bh, bw, bh);
      ctx.fillStyle = L(mix(col, [70, 85, 110], 0.6), 0.8);
      for (let r = 0; r < Math.floor(bh / 70); r++) for (let c = 0; c < 3; c++) ctx.fillRect(bx + 24 + c * (bw / 3.2), 790 - bh + 30 + r * 70, 26, 34);
    }
    // ağaçlar
    for (let i = -1; i < 7; i++) {
      const tx = i * 340 - (sc % 340) + 120;
      ctx.fillStyle = L(M.woodDark);
      ctx.fillRect(tx - 10, 640, 20, 150);
      ctx.fillStyle = L(M.leafDark);
      dot(ctx, tx, 600, 90);
      ctx.fillStyle = L(M.leaf);
      dot(ctx, tx - 30, 580, 60);
      dot(ctx, tx + 34, 610, 56);
    }
    // otobüs durağı
    if (o.busStop != null) {
      const bx = o.busStop - sc;
      ctx.fillStyle = L(M.metal);
      ctx.fillRect(bx, 520, 10, 270);
      roundRect(ctx, bx - 50, 470, 110, 70, 10);
      ctx.fillStyle = L(hex('#2f7a5a'));
      ctx.fill();
      text(ctx, 'DURAK', bx + 5, 506, { size: 26, weight: 800, color: L([240, 240, 240]) });
    }
    // kaldırım ve yol
    ctx.fillStyle = L(hex('#bdb6ab'));
    ctx.fillRect(0, 790, W, 120);
    ctx.strokeStyle = L(hex('#a49c90'));
    ctx.lineWidth = 3;
    for (let i = -1; i < 14; i++) line(ctx, i * 160 - (sc % 160), 790, i * 160 - (sc % 160) - 40, 910);
    ctx.fillStyle = L(hex('#55585f'));
    ctx.fillRect(0, 910, W, 170);
    ctx.fillStyle = L(hex('#e8e2d2'));
    for (let i = -1; i < 12; i++) ctx.fillRect(i * 220 - ((sc * 1.0) % 220), 990, 120, 12);
    if (o.who) o.who(amb);
    // bulutlu günde yumuşak gri pus
    if (cloud > 0) {
      ctx.fillStyle = `rgba(150,158,172,${0.12 * cloud})`;
      ctx.fillRect(0, 0, W, H);
    }
    return amb;
  }

  // Ölçüm katmanı: sağ üstte ölçer, altta şerit; when: "08:30 · sokak"
  function measureOverlay(ctx, t, lux, a, { when = '', barA = 1, marks = [], band = null } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const g = ctx.createLinearGradient(0, H - 230, 0, H);
    g.addColorStop(0, 'rgba(4,6,14,0)');
    g.addColorStop(0.45, 'rgba(4,6,14,0.78)');
    g.addColorStop(1, 'rgba(4,6,14,0.9)');
    ctx.fillStyle = g;
    ctx.fillRect(0, H - 230, W, 230);
    ctx.restore();
    luxDevice(ctx, 1640, 250, 0.95, lux, a, { label: when });
    luxBar(ctx, 260, 980, 1400, lux, a * barA, { marks, band });
  }

  const DAYLUX = {
    meter: 250,
    cloudy: 3000,
    sunny: 50000,
    window: 600,
    deep: 150,
    evening: 180,
  };

  DRAW.day = function sceneDay(ctx, lt, t) {
    // d-meter: sabah, evde ölçer
    const ma = layer(t, cue('d-meter', 0) - 0.3, cue('d-out', 0) - 0.2);
    if (ma > 0) {
      ctx.save();
      ctx.globalAlpha *= ma;
      room(ctx, t, {
        kind: 'table', hour: 7.6, curtain: 0, ceil: 0,
        who: (amb) => person(ctx, 1180, 790, 1.7, amb, { pose: 'stand', f: -1, meter: after(t, 'd-meter', 1, 0.4) > 0.5 }),
      });
      ctx.restore();
    }
    // d-out: sokak (bulutlu → güneşli)
    const oa = layer(t, cue('d-out', 0) - 0.3, cue('d-in', 0) - 0.2);
    if (oa > 0) {
      const sunny = after(t, 'd-out', 1, 1.6, ease.inOut);
      ctx.save();
      ctx.globalAlpha *= oa;
      const walkT = t - cue('d-out', 0);
      street(ctx, t, {
        hour: lerp(9, 12.5, sunny), cloud: 1 - sunny, scroll: walkT * 70,
        who: (amb) => person(ctx, 900, 870, 1.7, amb, { pose: 'walk', phase: walkT * 4.2, meter: true }),
      });
      ctx.restore();
    }
    // d-in: ofis — pencere kenarından odanın içine
    const ia = layer(t, cue('d-in', 0) - 0.3, cue('d-evening', 0) - 0.2);
    const deep = after(t, 'd-in', 1, 1.8, ease.inOut);
    if (ia > 0) {
      ctx.save();
      ctx.globalAlpha *= ia;
      const dx = lerp(820, 1360, deep);
      room(ctx, t, {
        kind: 'desk', hour: 13.5, deskX: dx, ceil: 0,
        who: (amb) => person(ctx, dx + 260, 879, 1.6, amb, { pose: 'desk', f: -1 }),
      });
      ctx.restore();
    }
    // d-evening: salon, tavan lambası ve ekran
    const ea = vis(t, cue('d-evening', 0) - 0.3, sceneEnd('day'), 0.7, 0.7);
    const sum = after(t, 'd-evening', 3, 0.9, ease.inOut);
    if (ea > 0) {
      ctx.save();
      ctx.globalAlpha *= ea * (1 - sum);
      room(ctx, t, {
        kind: 'living', hour: 21.2, ceil: after(t, 'd-evening', 1, 0.6), lamp: 0, screen: 0.8,
        who: (amb) => person(ctx, 1020, 845, 1.7, amb, { pose: 'sit', phone: 0.9 }),
      });
      ctx.restore();
    }
    // ölçer: değer sahneyle akar (logaritmik geçiş)
    let lux = DAYLUX.meter;
    let when = '07:30 · ev';
    if (t > cue('d-out', 0) - 0.3) {
      lux = logLerp(DAYLUX.meter, DAYLUX.cloudy, after(t, 'd-out', 0, 1.6, ease.inOut));
      lux = logLerp(lux, DAYLUX.sunny, after(t, 'd-out', 1, 1.8, ease.inOut));
      when = t < cue('d-out', 1) ? '09:00 · sokak, bulutlu' : '12:30 · sokak, güneşli';
    }
    if (t > cue('d-in', 0) - 0.3) {
      lux = logLerp(DAYLUX.sunny, DAYLUX.window, after(t, 'd-in', 0, 1.2, ease.inOut));
      lux = logLerp(lux, DAYLUX.deep, deep);
      when = deep < 0.5 ? '14:00 · pencere kenarı' : '14:30 · odanın içi';
    }
    if (t > cue('d-evening', 0) - 0.3) {
      lux = logLerp(DAYLUX.deep, 60, after(t, 'd-evening', 0, 0.8));
      lux = logLerp(lux, DAYLUX.evening, after(t, 'd-evening', 1, 1.0));
      when = '21:00 · salon';
    }
    const devA = vis(t, cue('d-meter', 1) - 0.2, sceneEnd('day'), 0.6, 0.6) * (1 - sum);
    const bandIn = after(t, 'd-in', 2, 0.8);
    measureOverlay(ctx, t, lux, devA, {
      when,
      barA: after(t, 'd-meter', 3, 0.8),
      band: bandIn > 0.5 && t < cue('d-evening', 0) ? [100, 600, SUN] : null,
      marks: bandIn > 0.5 && t < cue('d-evening', 0) ? [[250, 'içeride', C.sun], [10000, 'dışarıda', C.cream]] : [],
    });
    chip(ctx, 'lüks (lx) · göze ulaşan ışığın miktarı', W / 2, 860, ma * after(t, 'd-meter', 3, 0.6), { size: 32, color: C.cream, border: 'rgba(255,255,255,0.3)' });
    banner(ctx, 'İçeride gündüz, beyin için loş.', ia * after(t, 'd-in', 2, 0.7), { y: 160, color: C.sun });
    kicker(ctx, 'IŞIK GÜNLÜĞÜ', vis(t, sceneStart('day'), sceneEnd('day'), 0.6, 0.5) * (1 - sum));
    // özet: doğada ve bugün
    if (sum > 0) {
      const a = ea * sum;
      const x0 = 420;
      const w = 1180;
      const X = (v) => x0 + ((Math.log10(v) + 1) / 6) * w;
      const rows = [
        ['Doğada', 15000, 0.3, 0],
        ['Bugün', 300, 150, 1],
      ];
      text(ctx, 'gözümüze ulaşan ışık (lüks, logaritmik)', W / 2, 250, { size: 28, weight: 600, color: C.muted, alpha: a });
      rows.forEach(([name, dayV, nightV, i]) => {
        const y = 400 + i * 230;
        const ra = a * after(t, 'd-evening', 4 + i, 0.7);
        text(ctx, name, x0 - 40, y, { size: 40, family: 'display', weight: 800, color: C.cream, align: 'right', alpha: a });
        ctx.save();
        ctx.globalAlpha *= a;
        ctx.strokeStyle = 'rgba(150,165,200,0.3)';
        ctx.lineWidth = 3;
        line(ctx, x0, y, x0 + w, y);
        ctx.restore();
        // gece ile gündüz arasındaki aralık
        ctx.save();
        ctx.globalAlpha *= ra;
        const g = ctx.createLinearGradient(X(nightV), 0, X(dayV), 0);
        g.addColorStop(0, 'rgba(120,110,200,0.9)');
        g.addColorStop(1, 'rgba(255,190,90,0.95)');
        ctx.fillStyle = g;
        roundRect(ctx, X(nightV), y - 16, X(dayV) - X(nightV), 32, 16);
        ctx.fill();
        ctx.restore();
        drawMoon(ctx, X(nightV) - 20, y - 70, 26, ra);
        drawSun(ctx, X(dayV) + 20, y - 70, 22, ra, t);
        text(ctx, `${fmtLux(nightV)} lx`, X(nightV) - 14, y + 50, { size: 28, family: 'mono', weight: 700, color: C.mel, align: 'right', alpha: ra });
        text(ctx, `${fmtLux(dayV)} lx`, X(dayV) + 14, y + 50, { size: 28, family: 'mono', weight: 700, color: C.sun, align: 'left', alpha: ra });
      });
      text(ctx, '≈ değerler · tipik ölçümler', W / 2, 760, { size: 24, family: 'serif', italic: true, color: C.muted, alpha: a });
      statement(ctx, 'Gündüzlerimiz fazla karanlık, gecelerimiz fazla aydınlık.', 880, a * after(t, 'd-evening', 4, 0.8), { size: 54, maxW: 1700 });
    }
  };

  // ---------------------------------------------------------------------------
  // 6 · Kamp deneyi
  // ---------------------------------------------------------------------------
  function landscape(ctx, t, hour, fireA) {
    sky(ctx, 0, 0, W, 820, hour, t, { sunScale: 2.0 });
    const dl = daylight(hour);
    const amb = ambient({ day: dl, night: fireA * 0.8, moon: 1 - dl });
    const L = (c) => lit(c, amb);
    const ridge = (y0, amp, seed, col) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 24) ctx.lineTo(x, y0 - amp * noise(x * 0.0022 + seed, seed) - amp * 0.4 * Math.sin(x * 0.004 + seed));
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    };
    ridge(640, 260, 3, L(hex('#6f7fa6')));
    ridge(740, 180, 7, L(hex('#4f6b7c')));
    ridge(860, 80, 11, L(hex('#3c5a46')));
    ctx.fillStyle = L(hex('#2f4a39'));
    ctx.fillRect(0, 900, W, 180);
    // çadır
    ctx.fillStyle = L(hex('#e0844f'));
    ctx.beginPath();
    ctx.moveTo(1240, 920);
    ctx.lineTo(1420, 700);
    ctx.lineTo(1600, 920);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = L(hex('#a85a33'));
    ctx.beginPath();
    ctx.moveTo(1390, 920);
    ctx.lineTo(1420, 760);
    ctx.lineTo(1450, 920);
    ctx.closePath();
    ctx.fill();
    // ateşin başında iki kişi
    ctx.fillStyle = L(hex('#5c412d'));
    roundRect(ctx, 560, 930 - 112 * 1.35, 150, 40, 18);
    ctx.fill();
    roundRect(ctx, 970, 930 - 112 * 1.35, 150, 40, 18);
    ctx.fill();
    person(ctx, 640, 930, 1.35, mix(amb, [0.9, 0.55, 0.3], fireA * 0.5), { pose: 'sit', f: 1 });
    person(ctx, 1040, 930, 1.35, mix(amb, [0.9, 0.55, 0.3], fireA * 0.5), { pose: 'sit', f: -1 });
    campfire(ctx, 840, 930, 0.9, t, fireA);
    return amb;
  }

  // Melatonin tümseği: on/off saatleri (24 üstü ertesi gün)
  const hump = (h, on, off) => (1 / (1 + Math.exp(-(h - on) * 2.4))) * (1 / (1 + Math.exp((h - off) * 2.4)));

  DRAW.camp = function sceneCamp(ctx, lt, t) {
    kicker(ctx, 'KAMP DENEYİ', vis(t, sceneStart('camp'), sceneEnd('camp'), 0.6, 0.5));
    const chart = after(t, 'd-camp', 3, 1.0, ease.inOut);
    const la = vis(t, sceneStart('camp'), sceneEnd('camp'), 1.0, 0.6) * (1 - chart);
    if (la > 0) {
      ctx.save();
      ctx.globalAlpha *= la;
      const hour = lerp(18.4, 20.6, progress(t, cue('d-camp', 0), cue('d-camp', 3), ease.inOut));
      landscape(ctx, t, hour, after(t, 'd-camp', 2, 1.2));
      ctx.restore();
      chip(ctx, '1 hafta · elektrik ışığı yok', W / 2, 160, la * after(t, 'd-camp', 1, 0.6) * (1 - chart), { size: 36, color: C.cream, border: 'rgba(255,255,255,0.35)' });
      chip(ctx, 'yalnızca güneş, ay ve kamp ateşi', W / 2, 250, la * after(t, 'd-camp', 2, 0.6) * (1 - chart), { size: 32, color: C.sun, border: rgba(SUN, 0.5) });
    }
    // iki satır: evde ve kampta (şema)
    const ca = chart * vis(t, sceneStart('camp'), sceneEnd('camp'), 0.6, 0.6);
    if (ca > 0) {
      const x0 = 380;
      const w = 1340;
      const h0 = 18;
      const h1 = 34;
      const X = (h) => x0 + ((h - h0) / (h1 - h0)) * w;
      for (let hh = h0; hh <= h1; hh += 2) text(ctx, `${String(hh % 24).padStart(2, '0')}:00`, X(hh), 820, { size: 22, family: 'mono', color: C.muted, alpha: ca });
      // gün batımı ve doğumu
      const sunset = after(t, 'd-sunset', 0, 0.8);
      const wake = after(t, 'd-sunset', 1, 0.8);
      ctx.save();
      ctx.globalAlpha *= ca;
      ctx.fillStyle = 'rgba(80,100,180,0.10)';
      ctx.fillRect(X(19.6), 260, X(30.2) - X(19.6), 520);
      ctx.restore();
      drawSun(ctx, X(19.6), 230, 18, ca, t);
      drawSun(ctx, X(30.2), 230, 18, ca, t);
      text(ctx, 'gün batımı', X(19.6), 180, { size: 24, color: C.sun, alpha: ca });
      text(ctx, 'gün doğumu', X(30.2), 180, { size: 24, color: C.sun, alpha: ca });
      const rows = [['evde', 22.1, 32.4, 0], ['kampta', 20.1, 30.6, 1]];
      rows.forEach(([name, on, off, i]) => {
        const y = 520 + i * 220;
        const ra = ca * (i === 0 ? 1 : after(t, 'd-camp', 3, 0.8));
        text(ctx, name, x0 - 30, y - 50, { size: 36, family: 'display', weight: 800, color: i ? C.ok : C.cream, align: 'right', alpha: ra });
        ctx.save();
        ctx.globalAlpha *= ra;
        ctx.beginPath();
        ctx.moveTo(X(h0), y);
        for (let k = 0; k <= 160; k++) {
          const hh = h0 + (k / 160) * (h1 - h0);
          ctx.lineTo(X(hh), y - hump(hh, on, off) * 150);
        }
        ctx.lineTo(X(h1), y);
        ctx.closePath();
        ctx.fillStyle = rgba(MEL, 0.35);
        ctx.fill();
        ctx.strokeStyle = C.mel;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(150,165,200,0.3)';
        ctx.lineWidth = 2;
        line(ctx, X(h0), y, X(h1), y);
        ctx.restore();
      });
      // ≈ 2 saat kayma oku
      const sh = ca * after(t, 'd-camp', 3, 0.8);
      if (sh > 0) {
        ctx.save();
        ctx.globalAlpha *= sh;
        ctx.strokeStyle = C.ok;
        ctx.lineWidth = 5;
        ctx.setLineDash([10, 8]);
        line(ctx, X(22.1), 420, X(22.1), 680);
        ctx.setLineDash([]);
        line(ctx, X(22.1), 600, X(20.3), 600);
        ctx.fillStyle = C.ok;
        ctx.beginPath();
        ctx.moveTo(X(20.1), 600);
        ctx.lineTo(X(20.1) + 22, 588);
        ctx.lineTo(X(20.1) + 22, 612);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        chip(ctx, '≈ 2 saat erken', X(21.1), 560, sh, { size: 30, color: C.ok, border: rgba(OK, 0.6), weight: 800 });
      }
      chip(ctx, 'melatonin gün batımıyla yükselir', X(20.1), 900, ca * sunset, { size: 28, color: C.mel, border: rgba(MEL, 0.6) });
      // uyanma: 07:00
      if (wake > 0) {
        const wx = X(31);
        ctx.save();
        ctx.globalAlpha *= ca * wake;
        ctx.strokeStyle = C.error;
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 8]);
        line(ctx, wx, 300, wx, 780);
        ctx.restore();
        text(ctx, 'uyanış 07:00', wx, 280, { size: 26, weight: 700, color: C.error, alpha: ca * wake });
        chip(ctx, 'biyolojik gecenin ortası', wx + 10, 440, ca * wake * (1 - after(t, 'd-sunset', 2, 0.6) * 0.4), { size: 26, color: C.cream, border: rgba(RED, 0.6) });
        chip(ctx, 'gecenin sonu', wx + 10, 660, ca * after(t, 'd-sunset', 2, 0.6), { size: 26, color: C.ok, border: rgba(OK, 0.6) });
      }
      text(ctx, 'şema · Wright ve ark., 2013 · 8 gönüllü, 1 hafta kamp', W / 2, 1010, { size: 24, family: 'serif', italic: true, color: C.muted, alpha: ca });
      // hafta sonu kampı
      const wa = ca * after(t, 'd-weekend', 0, 0.7);
      if (wa > 0) {
        ctx.save();
        ctx.globalAlpha *= wa;
        ctx.fillStyle = 'rgba(4,6,14,0.72)';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
        panel(ctx, 560, 280, 800, 460, wa, { border: rgba(OK, 0.6), fill: 'rgba(10,15,30,0.95)' });
        // küçük çadır
        ctx.save();
        ctx.globalAlpha *= wa;
        ctx.fillStyle = '#e0844f';
        ctx.beginPath();
        ctx.moveTo(760, 520);
        ctx.lineTo(850, 400);
        ctx.lineTo(940, 520);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        drawMoon(ctx, 980, 380, 22, wa, '#0a0f1e');
        text(ctx, 'Cumartesi + Pazar', 1150, 420, { size: 34, weight: 700, color: C.cream, alpha: wa });
        text(ctx, 'hafta sonu kampı', 1150, 470, { size: 28, family: 'serif', italic: true, color: C.muted, alpha: wa });
        statement(ctx, '≈ 1,4 saat erken', 640, wa * after(t, 'd-weekend', 1, 0.7), { size: 76, color: C.ok });
        text(ctx, 'Stothard ve ark., 2017 · 9 kişi, 2 gün', W / 2, 800, { size: 24, family: 'serif', italic: true, color: C.muted, alpha: wa });
      }
    }
  };
  // ---------------------------------------------------------------------------
  // 7 · Ekran ve deneyler
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
    const la = vis(t, cue('x-dim', 0) - 0.3, cue('x-friend', 0) - 0.2, 0.6, 0.6);
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
      // x-friend: aynı ekran, farklı beyin
    const fa = vis(t, cue('x-friend', 0) - 0.3, sceneEnd('screen'), 0.6, 0.6);
    if (fa > 0) {
      const settle = after(t, 'x-friend', 0, 2.4, ease.inOut);
      const mins = Math.floor(clamp((t - cue('x-friend', 0)) * 4, 0, 59));
      vignette(ctx, 130, 220, 780, fa * after(t, 'x-friend', 0, 0.6), (c) => {
        room(c, t, { kind: 'bed', hour: 0.5, screen: 1 - settle, clock: '00:30', sleeper: { eyes: settle > 0.6 ? 0 : 1, phone: settle > 0.6 ? null : 1 - settle, zz: settle > 0.6 ? 1 : 0 } });
      }, 'arkadaşın', { sub: 'az hassas · rahatça uyuyor' });
      vignette(ctx, 1010, 220, 780, fa * after(t, 'x-friend', 1, 0.6), (c) => {
        room(c, t, { kind: 'bed', hour: 1.5, clock: `01:${String(mins).padStart(2, '0')}`, sleeper: { eyes: 1 } });
      }, 'sen', { sub: 'çok hassas · uyku gelmiyor', capColor: C.mel });
      banner(ctx, 'Aynı ekran, farklı beyin.', fa * after(t, 'x-friend', 1, 0.8), { y: 960, color: C.ice });
    }
  };

  // ---------------------------------------------------------------------------
  // 8 · Dürüst olalım
  // ---------------------------------------------------------------------------
  // Büyük telefon: ekranında akan içerik; t0'dan beri kaydırılıyor
  function feedPhone(ctx, x, y, s, t, a, { b = 1, warm = 0, notes = [] } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    glow(ctx, 0, 0, 300, mix([150, 200, 255], [255, 170, 110], warm), 0.3 * b);
    roundRect(ctx, -120, -240, 240, 480, 36);
    ctx.fillStyle = '#0b0f1a';
    ctx.fill();
    ctx.strokeStyle = '#3a4664';
    ctx.lineWidth = 5;
    ctx.stroke();
    roundRect(ctx, -106, -222, 212, 444, 24);
    ctx.save();
    ctx.clip();
    const base = mix([28, 36, 58], [58, 40, 30], warm);
    ctx.fillStyle = css(base.map((v) => v * (0.4 + 0.6 * b)));
    ctx.fillRect(-106, -222, 212, 444);
    const scroll = (t * 60) % 150;
    for (let i = -1; i < 5; i++) {
      const cy = -210 + i * 150 - scroll;
      const k = Math.floor((t * 60) / 150) + i;
      const col = [[90, 169, 255], [255, 181, 71], [127, 224, 163], [180, 156, 255], [255, 120, 110]][((k % 5) + 5) % 5];
      ctx.fillStyle = css(mix(col, [255, 170, 110], warm).map((v) => v * (0.35 + 0.65 * b)), 0.9);
      roundRect(ctx, -92, cy, 184, 92, 12);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${0.5 * b})`;
      roundRect(ctx, -92, cy + 102, 140, 12, 6);
      ctx.fill();
      roundRect(ctx, -92, cy + 122, 100, 12, 6);
      ctx.fill();
    }
    ctx.restore();
    ctx.restore();
    // bildirimler (telefonun üstüne kayar)
    notes.forEach(([str, p, col], i) => {
      if (p <= 0.002) return;
      const ny = y - 200 * s + i * 96 + (1 - p) * -40;
      ctx.save();
      ctx.globalAlpha *= a * p;
      roundRect(ctx, x - 150 * s, ny - 38, 300 * s, 76, 22);
      ctx.fillStyle = 'rgba(240,244,252,0.96)';
      ctx.fill();
      ctx.fillStyle = col;
      dot(ctx, x - 150 * s + 40, ny, 18);
      ctx.restore();
      text(ctx, str, x - 150 * s + 74, ny + 1, { size: 28, weight: 700, color: '#1a2030', align: 'left', alpha: a * p });
    });
  }

  DRAW.honest = function sceneHonest(ctx, lt, t) {
    kicker(ctx, 'DÜRÜST OLALIM', vis(t, sceneStart('honest'), sceneEnd('honest'), 0.6, 0.5));
    // n-honest: uykusuzluğun birçok sebebi var; ışık onlardan biri
    const ha = during(t, 'n-honest', 'n-content');
    if (ha > 0) {
      const cx = 700;
      const cy = 560;
      const segs = [['ışık', BLUE], ['içerik ve bildirimler', SUN], ['stres ve kaygı', MEL], ['kafein', WARM], ['düzensiz uyku saatleri', OK]];
      const grow = after(t, 'n-honest', 1, 1.4, ease.inOut);
      segs.forEach(([name, col], i) => {
        const a0 = -Math.PI / 2 + (i / segs.length) * Math.PI * 2 + 0.03;
        const a1 = a0 + (Math.PI * 2 / segs.length) * grow - 0.06;
        if (a1 <= a0) return;
        const pop = i === 0 ? 14 * after(t, 'n-honest', 1, 0.8) : 0;
        const mid = (a0 + a1) / 2;
        ctx.save();
        ctx.globalAlpha *= ha;
        ctx.translate(Math.cos(mid) * pop, Math.sin(mid) * pop);
        ctx.strokeStyle = rgba(col, i === 0 ? 1 : 0.55);
        ctx.lineWidth = 92;
        ctx.beginPath();
        ctx.arc(cx, cy, 240, a0, a1);
        ctx.stroke();
        ctx.restore();
        const lr = 380;
        const lx = cx + Math.cos(mid) * lr;
        const ly = cy + Math.sin(mid) * lr;
        text(ctx, name, lx, ly, { size: i === 0 ? 38 : 30, weight: i === 0 ? 800 : 600, color: i === 0 ? C.ice : C.cream, alpha: ha * clamp(grow * segs.length - i), align: Math.cos(mid) > 0.2 ? 'left' : Math.cos(mid) < -0.2 ? 'right' : 'center' });
      });
      text(ctx, 'örnek etkenler', cx, cy, { size: 28, family: 'serif', italic: true, color: C.muted, alpha: ha * grow });
      paragraph(ctx, 'Uykusuzluğun tek sebebi ışık değil.', 1480, 560, 560, { size: 58, family: 'display', weight: 800, color: C.cream, alpha: ha * after(t, 'n-honest', 1, 0.8), valign: 'middle', lineHeight: 70 });
    }
    // n-content: akan içerik, bildirimler, sıradaki video
    const ca = during(t, 'n-content', 'n-filter');
    if (ca > 0) {
      const notes = [
        ['1 yeni bildirim', after(t, 'n-content', 1, 0.5), C.error],
        ['grupta tartışma: 48 mesaj', after(t, 'n-content', 2, 0.5), C.ok],
      ];
      feedPhone(ctx, 700, 560, 1.55, t, ca, { notes });
      // sıradaki video geri sayımı
      const nv = ca * after(t, 'n-content', 3, 0.5);
      if (nv > 0) {
        const left = Math.max(1, 5 - Math.floor((t - cue('n-content', 3)) / 0.8));
        ctx.save();
        ctx.globalAlpha *= nv;
        ctx.fillStyle = 'rgba(4,6,14,0.82)';
        roundRect(ctx, 700 - 170, 640, 340, 150, 24);
        ctx.fill();
        ctx.strokeStyle = C.cream;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(700 - 90, 715, 40, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (((t - cue('n-content', 3)) / 0.8) % 1));
        ctx.stroke();
        ctx.restore();
        text(ctx, String(left), 700 - 90, 717, { size: 40, weight: 800, color: C.cream, alpha: nv });
        text(ctx, 'sıradaki', 700 + 40, 696, { size: 26, color: C.muted, alpha: nv });
        text(ctx, 'video', 700 + 40, 734, { size: 30, weight: 700, color: C.cream, alpha: nv });
      }
      // uyanık beyin
      const hx = 1420;
      const hy = 620;
      drawHead(ctx, hx, hy, 1.15, ca * after(t, 'n-content', 0, 0.6), { brain: 1, xray: true, glowScn: 0.6, scnColor: SUN });
      for (let i = 0; i < 22; i++) {
        const p = ((t * 0.7 + hash(i, 71)) % 1);
        const an = hash(i, 72) * Math.PI * 2;
        ctx.fillStyle = rgba(SUN, ca * (1 - p) * after(t, 'n-content', 0, 0.6));
        dot(ctx, hx + Math.cos(an) * (40 + 150 * p), hy - 160 + Math.sin(an) * (30 + 110 * p), 4);
      }
      text(ctx, 'içerik beyni uyanık tutar', hx, 940, { size: 36, family: 'serif', italic: true, color: C.sun, alpha: ca * after(t, 'n-content', 0, 0.6) });
    }
    // n-filter: gece modu deneyi
    const fa = during(t, 'n-filter', 'n-amount');
    if (fa > 0) {
      const warm = after(t, 'n-filter', 0, 1.2, ease.inOut);
      feedPhone(ctx, 440, 560, 1.25, t, fa, { b: 0.85, warm });
      // gece modu düğmesi
      ctx.save();
      ctx.globalAlpha *= fa;
      roundRect(ctx, 440 - 60, 880, 120, 56, 28);
      ctx.fillStyle = warm > 0.5 ? '#ffb547' : '#3a4664';
      ctx.fill();
      ctx.fillStyle = '#f3ede1';
      dot(ctx, lerp(440 - 32, 440 + 32, warm), 908, 22);
      ctx.restore();
      text(ctx, 'gece modu', 440, 980, { size: 32, weight: 700, color: C.sun, alpha: fa });
      const groups = [['gece modu açık', C.sun], ['gece modu kapalı', C.ice], ['telefonsuz', C.cream]];
      const ga = fa * after(t, 'n-filter', 1, 0.6);
      groups.forEach(([name, col], i) => {
        const x = 960 + i * 300;
        const h = 330 * after(t, 'n-filter', 2, 1.0, ease.out) * (1 + (hash(i, 81) - 0.5) * 0.05);
        ctx.save();
        ctx.globalAlpha *= ga * 0.8;
        ctx.fillStyle = col;
        roundRect(ctx, x - 90, 780 - h, 180, h, 12);
        ctx.fill();
        ctx.restore();
        text(ctx, name, x, 830, { size: 28, weight: 700, color: col, alpha: ga });
      });
      text(ctx, 'uyku süresi ve kalitesi', 1260, 330, { size: 30, weight: 600, color: C.muted, alpha: ga });
      chip(ctx, 'anlamlı fark yok', 1260, 260, fa * after(t, 'n-filter', 2, 1.2), { size: 36, color: C.cream, border: rgba(SUN, 0.6), weight: 800 });
      text(ctx, 'Duraccio ve ark., 2021 · 167 genç yetişkin · 7 gece', 1260, 920, { size: 24, family: 'serif', italic: true, color: C.muted, alpha: ga });
    }
    // n-amount: asıl önemli olan miktar
    const aa = vis(t, cue('n-amount', 0) - 0.3, sceneEnd('honest'), 0.6, 0.6);
    if (aa > 0) {
      const dimP = after(t, 'n-amount', 0, 1.8, ease.inOut);
      const b = lerp(1, 0.22, dimP);
      feedPhone(ctx, 560, 520, 1.3, t, aa, { b });
      ctx.save();
      ctx.globalAlpha *= aa;
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      line(ctx, 360, 900, 760, 900);
      ctx.strokeStyle = C.ice;
      line(ctx, 360, 900, 360 + 400 * b, 900);
      ctx.fillStyle = C.cream;
      dot(ctx, 360 + 400 * b, 900, 20);
      ctx.restore();
      iconBulb(ctx, 310, 900, 0.32, [200, 220, 255], aa, 0.2);
      iconBulb(ctx, 820, 900, 0.42, [200, 220, 255], aa, 1);
      text(ctx, 'gözü uyaran ışık', 560, 970, { size: 28, color: C.muted, alpha: aa });
      chip(ctx, 'uykuya dalmak kolaylaşır', 1340, 380, aa * after(t, 'n-amount', 1, 0.6), { size: 36, color: C.ok, border: rgba(OK, 0.5), weight: 800 });
      paragraph(ctx, 'Renk tonu değil, ışığın miktarı.', 1340, 620, 760, { size: 60, family: 'display', weight: 800, color: C.cream, alpha: aa * after(t, 'n-amount', 2, 0.8), valign: 'middle', lineHeight: 72 });
      text(ctx, 'Schöllhorn ve ark., 2023', 1340, 820, { size: 24, family: 'serif', italic: true, color: C.muted, alpha: aa * after(t, 'n-amount', 1, 0.6) });
    }
  };

  // ---------------------------------------------------------------------------
  // 9–12 · Ne yapabiliriz? Üç kural ve günlük hayatta uygulanışı
  // ---------------------------------------------------------------------------
  const RULES = [
    { n: '1', title: 'Gündüz bol ışık', sub: 'sabah ve gün içinde dışarı', col: SUN },
    { n: '2', title: 'Akşam az ışık', sub: 'yatmadan önceki 3 saat', col: WARM },
    { n: '3', title: 'Uykuda karanlık', sub: 'karanlık yatak odası', col: MEL },
  ];
  function ruleIcon(ctx, i, x, y, s, a, t) {
    if (i === 0) drawSun(ctx, x, y, 46 * s, a, t);
    else if (i === 1) {
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.translate(x, y);
      ctx.scale(s, s);
      glow(ctx, 0, 0, 150, [255, 170, 80], 0.45);
      ctx.fillStyle = '#ffc47a';
      ctx.beginPath();
      ctx.moveTo(-40, -50);
      ctx.lineTo(40, -50);
      ctx.lineTo(62, 14);
      ctx.lineTo(-62, 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c9ccd4';
      ctx.fillRect(-5, 14, 10, 50);
      roundRect(ctx, -32, 60, 64, 14, 6);
      ctx.fill();
      ctx.restore();
    } else drawMoon(ctx, x, y, 44 * s, a, '#0d1222');
  }
  // Üç kural kartı; active: vurgulanan kural (−1 hiçbiri)
  function ruleCards(ctx, t, a, shown, active = -1) {
    RULES.forEach((r, i) => {
      const ca = a * shown[i];
      if (ca <= 0.002) return;
      const dimK = active >= 0 && active !== i ? 0.35 : 1;
      const x = 420 + i * 540;
      const lift = active === i ? 16 : 0;
      panel(ctx, x - 230, 280 - lift, 460, 470, ca * dimK, { border: rgba(r.col, 0.7), fill: 'rgba(10,15,30,0.9)', r: 30 });
      ruleIcon(ctx, i, x, 420 - lift, 1.25, ca * dimK, t);
      text(ctx, r.n, x, 560 - lift, { size: 64, family: 'display', weight: 800, color: rgba(r.col, 1), alpha: ca * dimK });
      text(ctx, r.title, x, 640 - lift, { size: 42, family: 'display', weight: 800, color: C.cream, alpha: ca * dimK });
      text(ctx, r.sub, x, 698 - lift, { size: 28, color: C.muted, alpha: ca * dimK });
    });
  }
  // Köşede küçük kural rozeti
  function ruleBadge(ctx, i, a) {
    if (a <= 0.002) return;
    const r = RULES[i];
    chip(ctx, `${r.n} · ${r.title}`, 120, 160, a, { size: 32, color: rgba(r.col, 1), border: rgba(r.col, 0.6), align: 'left', weight: 800 });
  }

  // İç saat ayar simgesi: kol doğru saate döner
  function clockFix(ctx, x, y, r, p, a) {
    clockFace(ctx, x, y, r, lerp(9.2, 7, p), a, { dial: 12, color: p > 0.9 ? C.ok : C.mel });
    if (p > 0.9) checkMark(ctx, x + r * 0.95, y - r * 0.95, 1.4, (p - 0.9) * 10);
  }

  DRAW.morning = function sceneMorning(ctx, lt, t) {
    kicker(ctx, 'NE YAPABİLİRİZ?', vis(t, sceneStart('morning'), cue('r-day', 2) - 0.2, 0.6, 0.5));
    // r-rules ve r-day: üç kural, ilki öne çıkar
    const ra = vis(t, cue('r-rules', 0) - 0.3, cue('r-day', 2) - 0.2, 0.6, 0.6);
    if (ra > 0) {
      const shown = [after(t, 'r-rules', 2, 0.6), progress(t, cue('r-rules', 2) + 0.4, cue('r-rules', 2) + 1.0), progress(t, cue('r-rules', 2) + 0.8, cue('r-rules', 2) + 1.4)];
      statement(ctx, 'Peki ne yapabiliriz?', 520, ra * after(t, 'r-rules', 0, 0.7) * (1 - shown[0]), { size: 84, weight: 800 });
      ruleCards(ctx, t, ra, shown, t > cue('r-day', 0) ? 0 : -1);
      text(ctx, 'Brown ve ark., 2022 · ışık bilimcilerinin ortak önerileri', W / 2, 900, { size: 26, family: 'serif', italic: true, color: C.muted, alpha: ra * after(t, 'r-rules', 1, 0.6) });
    }
    // r-day (2–3): sabah yürüyüşü ve iç saat ayarı
    const wa = layer(t, cue('r-day', 2) - 0.3, cue('p-morning', 1) - 0.4);
    if (wa > 0) {
      ctx.save();
      ctx.globalAlpha *= wa;
      const wt = t - cue('r-day', 2);
      street(ctx, t, { hour: 8, scroll: wt * 70, who: (amb) => person(ctx, 900, 870, 1.7, amb, { pose: 'walk', phase: wt * 4.2 }) });
      ctx.restore();
      panel(ctx, 1420, 120, 400, 380, wa * after(t, 'r-day', 3, 0.6), { fill: 'rgba(8,12,26,0.85)', border: rgba(OK, 0.5) });
      clockFix(ctx, 1620, 290, 110, after(t, 'r-day', 3, 1.6, ease.inOut), wa * after(t, 'r-day', 3, 0.6));
      text(ctx, 'iç saat ayarlandı', 1620, 455, { size: 30, weight: 700, color: C.ok, alpha: wa * after(t, 'r-day', 3, 1.0) });
    }
    ruleBadge(ctx, 0, vis(t, cue('r-day', 2) - 0.2, sceneEnd('morning'), 0.6, 0.6));
    // p-morning: perdeyi aç → pencere önünde kahvaltı → bir durak önce in
    const pa = layer(t, cue('p-morning', 1) - 0.4, cue('p-morning', 2) - 0.3);
    if (pa > 0) {
      const open = after(t, 'p-morning', 1, 2.0, ease.inOut);
      ctx.save();
      ctx.globalAlpha *= pa;
      room(ctx, t, { kind: 'bed', hour: 7.4, curtain: 1 - open, clock: '07:15', sleeper: { eyes: 1 } });
      ctx.restore();
      banner(ctx, 'Uyanınca perdeyi sonuna kadar aç', pa * after(t, 'p-morning', 1, 0.6), { y: 960 });
    }
    const ba = layer(t, cue('p-morning', 2) - 0.3, cue('p-morning', 3) - 0.3);
    if (ba > 0) {
      ctx.save();
      ctx.globalAlpha *= ba;
      room(ctx, t, { kind: 'table', hour: 8, who: (amb) => person(ctx, 950, 850, 1.7, amb, { pose: 'sit', f: -1, cup: true }) });
      ctx.restore();
      banner(ctx, 'Kahvaltıyı pencerenin önünde yap', ba * after(t, 'p-morning', 2, 0.6), { y: 960 });
    }
    const sa = layer(t, cue('p-morning', 3) - 0.3, cue('p-desk', 0) - 0.3);
    if (sa > 0) {
      const wt = t - cue('p-morning', 3);
      ctx.save();
      ctx.globalAlpha *= sa;
      street(ctx, t, { hour: 8.4, scroll: 200 + wt * 80, busStop: 700, who: (amb) => person(ctx, 900, 870, 1.7, amb, { pose: 'walk', phase: wt * 4.4 }) });
      ctx.restore();
      banner(ctx, 'Bir durak önce in, yürü', sa * after(t, 'p-morning', 3, 0.6), { y: 160 });
    }
    // p-desk: masayı pencereye yaklaştır → öğle arası dışarı → kat kat aydınlık
    const da = layer(t, cue('p-desk', 0) - 0.3, cue('p-desk', 1) - 0.3);
    const move = after(t, 'p-desk', 0, 2.2, ease.inOut);
    if (da > 0) {
      const dx = lerp(1360, 820, move);
      ctx.save();
      ctx.globalAlpha *= da;
      room(ctx, t, { kind: 'desk', hour: 11, deskX: dx, who: (amb) => person(ctx, dx + 260, 879, 1.6, amb, { pose: 'desk', f: -1 }) });
      ctx.restore();
      luxDevice(ctx, 1640, 250, 0.9, logLerp(150, 800, move), da, { label: 'masada' });
      banner(ctx, 'Masanı pencereye yaklaştır', da * after(t, 'p-desk', 0, 0.6), { y: 960 });
    }
    const la = vis(t, cue('p-desk', 1) - 0.3, cue('p-desk', 2) - 0.2, 0.7, 0.6);
    if (la > 0) {
      const wt = t - cue('p-desk', 1);
      ctx.save();
      ctx.globalAlpha *= la;
      street(ctx, t, { hour: 12.8, cloud: 0.8, scroll: wt * 60, who: (amb) => person(ctx, 900, 870, 1.7, amb, { pose: 'walk', phase: wt * 4.0 }) });
      ctx.restore();
      luxDevice(ctx, 1640, 250, 0.9, 3000, la, { label: 'bulutlu öğle' });
      banner(ctx, 'Öğle arasında birkaç dakika dışarı çık', la * after(t, 'p-desk', 1, 0.6), { y: 960 });
    }
    const ka = vis(t, cue('p-desk', 2) - 0.3, sceneEnd('morning'), 0.7, 0.6);
    if (ka > 0) {
      const g1 = after(t, 'p-desk', 2, 1.0, ease.out);
      const g2 = after(t, 'p-desk', 3, 1.0, ease.out);
      const X = (v) => 360 + (Math.log10(v) / 4) * 1200;
      const bars = [['dışarıda, bulutlu', 3000, SUN, g1, 420], ['evin içinde', 300, MEL, g2, 600]];
      bars.forEach(([name, v, col, g, y]) => {
        text(ctx, name, 330, y, { size: 36, weight: 700, color: C.cream, align: 'right', alpha: ka });
        ctx.save();
        ctx.globalAlpha *= ka;
        ctx.fillStyle = rgba(col, 0.9);
        roundRect(ctx, 360, y - 40, Math.max(10, (X(v) - 360) * g), 80, 20);
        ctx.fill();
        ctx.restore();
        text(ctx, `≈ ${fmtLux(v)} lx`, 360 + (X(v) - 360) * g + 24, y + 2, { size: 40, family: 'mono', weight: 700, color: rgba(col, 1), align: 'left', alpha: ka * g });
      });
      [[1, '1'], [10, '10'], [100, '100'], [1000, '1.000'], [10000, '10.000']].forEach(([v, s]) => text(ctx, s, X(v), 720, { size: 22, family: 'mono', color: C.muted, alpha: ka }));
      statement(ctx, 'Bulutlu bir gün bile, içeriden kat kat aydınlık.', 860, ka * after(t, 'p-desk', 3, 0.8), { size: 54, maxW: 1700 });
    }
  };

  // Kelvin şeridi: sıcak (2.000 K) → soğuk (6.500 K)
  function kelvinBar(ctx, x, y, w, a, mark) {
    if (a <= 0.002) return;
    const K = (k) => x + ((k - 2000) / 4500) * w;
    ctx.save();
    ctx.globalAlpha *= a;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, '#ff9a3c');
    g.addColorStop(0.18, '#ffc77a');
    g.addColorStop(0.5, '#fff1d8');
    g.addColorStop(1, '#cfe2ff');
    ctx.fillStyle = g;
    roundRect(ctx, x, y - 26, w, 52, 26);
    ctx.fill();
    ctx.restore();
    [[2000, '2.000 K'], [2700, '2.700 K'], [4000, '4.000 K'], [6500, '6.500 K']].forEach(([k, s]) => text(ctx, s, K(k), y + 64, { size: 26, family: 'mono', weight: 700, color: k === 2700 ? C.sun : C.muted, alpha: a }));
    iconBulb(ctx, K(2000) - 70, y - 4, 0.55, [255, 170, 80], a, 1);
    iconBulb(ctx, K(6500) + 70, y - 4, 0.55, [200, 225, 255], a, 1);
    text(ctx, 'sıcak · sarı', K(2300), y - 70, { size: 30, weight: 700, color: C.sun, alpha: a });
    text(ctx, 'soğuk · beyaz-mavi', K(6000), y - 70, { size: 30, weight: 700, color: C.ice, alpha: a });
    if (mark > 0) {
      const mx = K(2700);
      ctx.save();
      ctx.globalAlpha *= a * mark;
      ctx.strokeStyle = C.cream;
      ctx.lineWidth = 6;
      roundRect(ctx, mx - 40, y - 40, 80, 80, 20);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Yakın plan: yüz ve telefon; d: telefonun uzaklığı (1 yakın, 2 iki kat)
  function faceAndPhone(ctx, t, d, a) {
    if (a <= 0.002) return;
    const amb = ambient({ lamp: 0.95, screen: 0.3 });
    const s = 2.7;
    const y0 = 1190;
    const x0 = 210;
    const ex = x0 + 34 * s;
    const ey = y0 - 302 * s;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = lit(M.wall, amb);
    ctx.fillRect(0, 0, 1000, H);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, 60, 260, 760, [255, 170, 80], 0.22);
    ctx.restore();
    person(ctx, x0, y0, s, amb, { pose: 'sit', f: 1 });
    const px = ex + 190 * d;
    const py = ey + 6;
    // telefondan göze yayılan ışık
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(px, 0, ex, 0);
    g.addColorStop(0, rgba(BLUE, 0.3));
    g.addColorStop(1, rgba(BLUE, 0.3 / (d * d)));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(px - 12, py - 92);
    ctx.lineTo(px - 12, py + 92);
    ctx.lineTo(ex + 6, py + 60 + 50 * d);
    ctx.lineTo(ex + 6, py - 60 - 50 * d);
    ctx.closePath();
    ctx.fill();
    glow(ctx, ex, ey, 170, BLUE, 0.75 / (d * d));
    ctx.restore();
    // telefon (yandan)
    roundRect(ctx, px - 14, py - 100, 30, 200, 10);
    ctx.fillStyle = '#14171f';
    ctx.fill();
    ctx.fillStyle = 'rgba(205,228,255,0.95)';
    ctx.fillRect(px - 17, py - 88, 5, 176);
    ctx.restore();
    // uzaklık ölçüsü
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = C.cream;
    ctx.lineWidth = 3;
    const my = py + 170;
    line(ctx, ex, my, px, my);
    line(ctx, ex, my - 14, ex, my + 14);
    line(ctx, px, my - 14, px, my + 14);
    ctx.restore();
    chip(ctx, d > 1.5 ? 'iki kat uzak' : 'yakın', (ex + px) / 2, my + 56, a, { size: 30, color: C.cream, weight: 700 });
  }

  // Ters kare: aynı ışık iki kat uzakta dört kat alana yayılır
  function inverseSquare(ctx, x, y, a, p) {
    if (a <= 0.002) return;
    const cell = 120;
    const d1 = x + 280;
    const d2 = x + 560;
    glow(ctx, x, y, 120, BLUE, 0.7 * a);
    ctx.fillStyle = rgba(BLUE, a);
    dot(ctx, x, y, 16);
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = rgba(BLUE, 0.12);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(d2, y - cell);
    ctx.lineTo(d2, y + cell);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = rgba(BLUE, 0.85);
    ctx.fillRect(d1 - 8, y - cell / 2, 16, cell);
    ctx.restore();
    text(ctx, '1 birim alan', d1, y - cell / 2 - 36, { size: 26, weight: 700, color: C.ice, alpha: a });
    const qa = a * p;
    ctx.save();
    ctx.globalAlpha *= qa;
    for (let r = 0; r < 2; r++) {
      ctx.fillStyle = rgba(BLUE, 0.3);
      ctx.fillRect(d2 - 8, y - cell + r * cell + 3, 16, cell - 6);
    }
    ctx.restore();
    text(ctx, '4 kat alan', d2, y + cell + 40, { size: 26, weight: 700, color: C.ice, alpha: qa });
    text(ctx, '¼', d2 + 120, y + 6, { size: 130, family: 'display', weight: 800, color: C.ice, alpha: qa });
  }

  DRAW.evening = function sceneEvening(ctx, lt, t) {
    // r-evening ve p-lamp: salon; tavan → sarı lamba; ekran kısılır
    const swap = after(t, 'r-evening', 3, 1.4, ease.inOut);
    const dimPhone = after(t, 'r-evening', 4, 1.4, ease.inOut);
    const kel = after(t, 'p-lamp', 3, 0.9, ease.inOut);
    const ra = layer(t, sceneStart('evening'), cue('p-distance', 0) - 0.3, 0.8);
    if (ra > 0) {
      const flick = after(t, 'p-lamp', 1, 0.8);
      ctx.save();
      ctx.globalAlpha *= ra * (1 - 0.85 * kel);
      room(ctx, t, {
        kind: 'living', hour: 20.6, ceil: 1 - swap, lamp: swap, screen: lerp(0.9, 0.25, dimPhone),
        who: (amb) => person(ctx, 1020, 845, 1.7, amb, { pose: 'sit', phone: lerp(1, 0.25, dimPhone) }),
      });
      ctx.restore();
      const lux = logLerp(logLerp(250, 30, swap), 18, dimPhone);
      luxDevice(ctx, 1640, 250, 0.9, lux, ra * (1 - kel) * after(t, 'r-evening', 1, 0.6), { label: '20:30 · salon' });
      banner(ctx, 'Tavan lambası yerine sarı, loş bir lamba', ra * after(t, 'r-evening', 3, 0.6) * (1 - after(t, 'r-evening', 4, 0.4)) * (1 - kel), { y: 960 });
      banner(ctx, 'Ekran parlaklığı en aza', ra * after(t, 'r-evening', 4, 0.6) * (1 - after(t, 'p-lamp', 0, 0.4)) * (1 - kel), { y: 960 });
      banner(ctx, 'Akşam yemeğinden sonra: tavan kapalı, lamba açık', ra * after(t, 'p-lamp', 1, 0.6) * (1 - kel), { y: 960, color: C.sun });
      // duvar düğmesi
      const sw = ra * after(t, 'p-lamp', 0, 0.5) * (1 - kel);
      if (sw > 0) {
        ctx.save();
        ctx.globalAlpha *= sw;
        roundRect(ctx, 700, 380, 70, 110, 12);
        ctx.fillStyle = '#efe8dc';
        ctx.fill();
        roundRect(ctx, 716, 400 + 40 * flick, 38, 30, 6);
        ctx.fillStyle = '#9aa3b8';
        ctx.fill();
        ctx.restore();
        text(ctx, flick > 0.5 ? 'kapalı' : 'açık', 735, 530, { size: 24, weight: 700, color: C.cream, alpha: sw });
      }
      // kelvin
      if (kel > 0) {
        const ka = ra * kel;
        // ampul kutusu
        ctx.save();
        ctx.globalAlpha *= ka;
        ctx.translate(380, 420);
        ctx.fillStyle = '#f2e6cc';
        roundRect(ctx, -130, -170, 260, 340, 18);
        ctx.fill();
        ctx.fillStyle = '#e0844f';
        ctx.fillRect(-130, -170, 260, 70);
        ctx.restore();
        iconBulb(ctx, 380, 410, 0.8, [255, 170, 80], ka, 0.8);
        text(ctx, 'LED', 380, 285, { size: 34, weight: 800, color: '#fff6e6', alpha: ka });
        text(ctx, '2700 K', 380, 540, { size: 40, family: 'mono', weight: 800, color: '#3a2a1a', alpha: ka * after(t, 'p-lamp', 4, 0.5) });
        kelvinBar(ctx, 780, 470, 960, ka, after(t, 'p-lamp', 4, 0.6));
        statement(ctx, 'Düşük kelvin = sıcak, sarı ışık', 800, ka * after(t, 'p-lamp', 5, 0.7), { size: 52 });
      }
    }
    ruleBadge(ctx, 1, vis(t, cue('r-evening', 0) - 0.2, sceneEnd('evening'), 0.6, 0.6));
    // p-distance: yakın plan + ters kare
    const da = vis(t, cue('p-distance', 0) - 0.3, sceneEnd('evening'), 0.7, 0.6);
    if (da > 0) {
      const far = after(t, 'p-distance', 2, 1.6, ease.inOut);
      ctx.save();
      ctx.globalAlpha *= da;
      ctx.fillStyle = '#0a0f1e';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      faceAndPhone(ctx, t, lerp(1, 2, far), da);
      inverseSquare(ctx, 1110, 540, da * after(t, 'p-distance', 2, 0.6), after(t, 'p-distance', 3, 0.8));
      text(ctx, 'Ekranı yüzüne yaklaştırma', 1440, 240, { size: 44, family: 'display', weight: 800, color: C.cream, alpha: da * after(t, 'p-distance', 1, 0.6) });
      chip(ctx, 'gözüne ulaşan ışık ≈ dörtte bir', 1440, 860, da * after(t, 'p-distance', 3, 0.8), { size: 34, color: C.ice, border: rgba(BLUE, 0.6), weight: 800 });
    }
  };

  // EKG benzeri kalp izi; hızlı: 0–1
  function heartTrace(ctx, x, y, w, h, t, fast, a) {
    if (a <= 0.002) return;
    panel(ctx, x, y, w, h, a, { fill: 'rgba(6,10,20,0.92)', border: rgba(RED, 0.5) });
    const rate = lerp(1.0, 1.35, fast);
    const beat = (u) => {
      const p = u % 1;
      if (p < 0.08) return Math.sin((p / 0.08) * Math.PI) * 0.15;
      if (p < 0.14) return -0.2;
      if (p < 0.18) return 1;
      if (p < 0.22) return -0.35;
      if (p > 0.4 && p < 0.55) return Math.sin(((p - 0.4) / 0.15) * Math.PI) * 0.25;
      return 0;
    };
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.beginPath();
    roundRect(ctx, x, y, w, h, 22);
    ctx.clip();
    ctx.strokeStyle = C.error;
    ctx.lineWidth = 4;
    ctx.shadowColor = C.error;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    for (let k = 0; k <= 220; k++) {
      const px = x + 20 + (k / 220) * (w - 40);
      const u = (k / 220) * 3.2 * rate + t * rate * 1.1;
      const py = y + h * 0.58 - beat(u) * h * 0.38;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
    const pulse = 1 + 0.12 * Math.max(0, Math.sin(t * rate * 1.1 * Math.PI * 2));
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x + w - 60, y + 50);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = C.error;
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.bezierCurveTo(-30, -6, -16, -30, 0, -14);
    ctx.bezierCurveTo(16, -30, 30, -6, 0, 14);
    ctx.fill();
    ctx.restore();
  }

  DRAW.sleep = function sceneSleep(ctx, lt, t) {
    ruleBadge(ctx, 2, vis(t, cue('r-night', 0) - 0.2, cue('r-phone', 0) - 0.2, 0.6, 0.6));
    // r-night ve p-sleeplight: karanlık oda; sonra tavan açıkken uyku
    const na = layer(t, sceneStart('sleep'), cue('p-dark', 0) - 0.3, 0.8);
    if (na > 0) {
      const lightOn = after(t, 'p-sleeplight', 2, 0.6) * (1 - after(t, 'p-sleeplight', 4, 0.8) * 0);
      ctx.save();
      ctx.globalAlpha *= na;
      room(ctx, t, { kind: 'bed', hour: 2, ceil: lightOn, clock: '02:00', sleeper: { eyes: 0, zz: 1 - lightOn * 0.7 } });
      ctx.restore();
      luxDevice(ctx, 1640, 250, 0.9, lightOn > 0.5 ? 100 : 0.5, na * after(t, 'r-night', 2, 0.6) * (1 - after(t, 'p-sleeplight', 0, 0.4)) + na * lightOn, { label: lightOn > 0.5 ? 'tavan lambası açık' : 'karanlık oda' });
      banner(ctx, 'Yatak odan ne kadar karanlıksa, o kadar iyi', na * after(t, 'r-night', 2, 0.6) * (1 - after(t, 'p-sleeplight', 0, 0.4)), { y: 960 });
      const ha = na * after(t, 'p-sleeplight', 3, 0.6);
      panel(ctx, 90, 110, 660, 440, ha, { fill: 'rgba(6,10,20,0.94)', border: rgba(RED, 0.4), r: 26 });
      heartTrace(ctx, 120, 140, 600, 220, t, after(t, 'p-sleeplight', 3, 1.4), ha);
      text(ctx, 'uyku boyunca kalp atışı ↑', 420, 410, { size: 34, weight: 800, color: '#ff8a96', alpha: ha });
      chip(ctx, 'ertesi sabah: insüline yanıt ↓', 420, 490, na * after(t, 'p-sleeplight', 4, 0.6), { size: 32, color: C.sun, border: rgba(SUN, 0.6), weight: 700 });
      text(ctx, 'Mason ve ark., 2022 · 20 sağlıklı genç · bir gece 100 lüks tavan ışığı', W / 2, 1010, { size: 24, family: 'serif', italic: true, color: C.muted, alpha: na * after(t, 'p-sleeplight', 2, 0.6) });
    }
    // p-dark: karartma perde, LED'e bant, gece lambası
    const da = layer(t, cue('p-dark', 0) - 0.3, cue('r-phone', 0) - 0.3);
    if (da > 0) {
      const close = after(t, 'p-dark', 0, 1.6, ease.inOut);
      const tape = after(t, 'p-dark', 1, 1.0, ease.inOut);
      const ceilFlash = progress(t, cue('p-dark', 2) + 0.1, cue('p-dark', 2) + 0.4) * (1 - progress(t, cue('p-dark', 2) + 1.2, cue('p-dark', 2) + 1.6));
      const nl = after(t, 'p-dark', 3, 1.0);
      ctx.save();
      ctx.globalAlpha *= da;
      room(ctx, t, { kind: 'bed', hour: 2.2, curtain: close, blackout: true, ceil: ceilFlash * 0.8, led: 1, tape, nightLight: nl, clock: '02:20', sleeper: { eyes: nl > 0.3 ? 1 : 0, zz: nl > 0.3 ? 0 : 1 } });
      ctx.restore();
      const items = [
        ['karartma perde · uyku bandı', after(t, 'p-dark', 0, 0.6)],
        ['şarj ışığına bant', after(t, 'p-dark', 1, 0.6)],
        ['tavan lambası değil', after(t, 'p-dark', 2, 0.6)],
        ['yere yakın, kısık, sarı gece lambası', after(t, 'p-dark', 3, 0.6)],
      ];
      panel(ctx, 1160, 110, 660, 300, da * items[0][1], { fill: 'rgba(8,12,26,0.88)', border: rgba(MEL, 0.5) });
      items.forEach(([s, p], i) => {
        const y = 170 + i * 64;
        if (i === 2) {
          ctx.save();
          ctx.globalAlpha *= da * p;
          ctx.strokeStyle = C.error;
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          line(ctx, 1200, y - 14, 1226, y + 12);
          line(ctx, 1226, y - 14, 1200, y + 12);
          ctx.restore();
        } else checkMark(ctx, 1213, y, 1.1, p);
        text(ctx, s, 1250, y, { size: 30, weight: 600, color: C.cream, align: 'left', alpha: da * p });
      });
      // uyku bandı simgesi
      const mask = da * after(t, 'p-dark', 0, 0.6) * (1 - after(t, 'p-dark', 1, 0.5));
      if (mask > 0) {
        ctx.save();
        ctx.globalAlpha *= mask;
        ctx.translate(1000, 300);
        ctx.fillStyle = '#2d3448';
        ctx.beginPath();
        ctx.ellipse(-50, 0, 60, 36, 0, 0, Math.PI * 2);
        ctx.ellipse(50, 0, 60, 36, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2d3448';
        ctx.lineWidth = 10;
        line(ctx, -110, -6, -170, -20);
        line(ctx, 110, -6, 170, -20);
        ctx.restore();
      }
    }
    // r-phone: telefon odanın dışında şarjda
    const pa = layer(t, cue('r-phone', 0) - 0.3, cue('p-alarm', 0) - 0.3);
    if (pa > 0) {
      const move = after(t, 'r-phone', 2, 1.8, ease.inOut);
      const shut = progress(t, cue('r-phone', 2) + 1.7, cue('r-phone', 2) + 2.6, ease.inOut);
      const amb = ambient({ lamp: 0.6 });
      const hall = ambient({ ceil: 0.3 });
      ctx.save();
      ctx.globalAlpha *= pa;
      // koridor (sol) ve yatak odası (sağ)
      ctx.fillStyle = lit(hex('#c9d3d8'), hall);
      ctx.fillRect(0, 0, 940, H);
      ctx.fillStyle = lit(M.floor, hall);
      ctx.fillRect(0, 800, 940, H - 800);
      ctx.fillStyle = lit(M.wall, amb);
      ctx.fillRect(940, 0, W - 940, H);
      ctx.fillStyle = lit(M.floor, amb);
      ctx.fillRect(940, 800, W - 940, H - 800);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, 1640, 520, 700, [255, 170, 80], 0.2);
      ctx.restore();
      // yatağın ucu ve sehpa lambası
      ctx.fillStyle = lit(M.blanket, amb);
      roundRect(ctx, 1240, 640, 700, 110, 30);
      ctx.fill();
      ctx.fillStyle = lit(M.wood, amb);
      ctx.fillRect(1240, 740, 700, 60);
      sideLamp(ctx, 1110, 660, 0.7, amb);
      // koridorda konsol ve şarj
      ctx.fillStyle = lit(M.wood, hall);
      ctx.fillRect(220, 600, 400, 24);
      ctx.fillStyle = lit(M.woodDark, hall);
      ctx.fillRect(240, 624, 16, 176);
      ctx.fillRect(584, 624, 16, 176);
      ctx.fillStyle = lit(M.metal, hall);
      roundRect(ctx, 470, 560, 40, 40, 8);
      ctx.fill();
      ctx.strokeStyle = lit(M.dark, hall);
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(470, 590);
      ctx.quadraticCurveTo(420, 600, 400, 584);
      ctx.stroke();
      // kapı kasası ve kanadı
      ctx.fillStyle = lit(M.base, amb);
      ctx.fillRect(900, 190, 44, 610);
      ctx.fillRect(900, 170, 360, 34);
      ctx.fillRect(1216, 190, 44, 610);
      ctx.fillStyle = lit(M.door, amb);
      const dw = lerp(46, 272, shut);
      ctx.fillRect(1216 - dw, 204, dw, 596);
      ctx.restore();
      const px = lerp(1560, 360, move);
      const py = lerp(560, 572, move) - Math.sin(move * Math.PI) * 160;
      handPhone(ctx, px, py, 2.8, lerp(1, 0.15, move) * pa, lerp(0, Math.PI / 2, move));
      const charged = pa * progress(t, cue('r-phone', 2) + 1.6, cue('r-phone', 2) + 2.2);
      if (charged > 0) {
        glow(ctx, 360, 560, 90, OK, 0.5 * charged);
        text(ctx, '⚡', 360, 500, { size: 46, color: C.ok, alpha: charged });
      }
      chip(ctx, 'yatmadan 1 saat önce', W / 2, 110, pa * after(t, 'r-phone', 1, 0.6), { size: 38, color: C.mel, border: rgba(MEL, 0.6), weight: 800 });
      banner(ctx, 'Telefon şarjda, odanın dışında', charged, { y: 960 });
    }
    // p-alarm: masa saati, kitap, müzik, kâğıt
    const aa = vis(t, cue('p-alarm', 0) - 0.3, sceneEnd('sleep'), 0.7, 0.6);
    if (aa > 0) {
      const amb = ambient({ lamp: 0.7 });
      ctx.save();
      ctx.globalAlpha *= aa;
      ctx.fillStyle = lit(M.wall, amb);
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = lit(M.wood, amb);
      ctx.fillRect(0, 760, W, 320);
      ctx.fillStyle = lit(M.woodDark, amb);
      ctx.fillRect(0, 760, W, 14);
      ctx.restore();
      sideLampSmall(ctx, 1700, 760, 0.9, amb);
      // analog masa saati
      const c1 = aa * after(t, 'p-alarm', 0, 0.6);
      clockFace(ctx, 400, 590, 150, 7 + (t % 60) / 600, c1, { dial: 12, color: C.cream, ring: '#c9a35f', hand2: 0.5 });
      if (c1 > 0) {
        ctx.save();
        ctx.globalAlpha *= c1;
        ctx.fillStyle = '#c9a35f';
        dot(ctx, 300, 450, 34);
        dot(ctx, 500, 450, 34);
        ctx.restore();
      }
      text(ctx, 'basit bir masa saati', 400, 860, { size: 30, weight: 700, color: C.cream, alpha: c1 });
      // kitap
      const c2 = aa * after(t, 'p-alarm', 1, 0.6);
      if (c2 > 0) {
        ctx.save();
        ctx.globalAlpha *= c2;
        ctx.fillStyle = '#3f6f8a';
        ctx.fillRect(760, 650, 300, 60);
        ctx.fillStyle = '#e07a5f';
        ctx.fillRect(780, 600, 270, 50);
        ctx.fillStyle = '#f4efe4';
        ctx.fillRect(1050, 604, 6, 42);
        ctx.fillRect(1060, 654, 6, 52);
        ctx.restore();
        text(ctx, 'kitap', 910, 860, { size: 30, weight: 700, color: C.cream, alpha: c2 });
      }
      // müzik ve kâğıt
      const c3 = aa * after(t, 'p-alarm', 2, 0.6);
      if (c3 > 0) {
        ctx.save();
        ctx.globalAlpha *= c3;
        ctx.fillStyle = '#f4efe4';
        ctx.translate(1300, 640);
        ctx.rotate(-0.08);
        ctx.fillRect(-120, -150, 240, 300);
        ctx.strokeStyle = '#9aa3b8';
        ctx.lineWidth = 3;
        const wr = progress(t, cue('p-alarm', 2), cue('p-alarm', 2) + 2.5);
        for (let i = 0; i < 6; i++) {
          const l = clamp(wr * 6 - i);
          if (l > 0) line(ctx, -90, -100 + i * 40, -90 + 170 * l * (0.6 + 0.4 * hash(i, 3)), -100 + i * 40);
        }
        ctx.restore();
        text(ctx, '♪', 1560, 520 - Math.sin(t * 2) * 10, { size: 90, color: C.sun, alpha: c3 });
        text(ctx, 'müzik · yarının listesi', 1360, 860, { size: 30, weight: 700, color: C.cream, alpha: c3 });
      }
    }
  };

  DRAW.habit = function sceneHabit(ctx, lt, t) {
    kicker(ctx, 'BİR HAFTA DENE', vis(t, sceneStart('habit'), sceneEnd('habit'), 0.6, 0.5));
    // p-weekend: hafta sonu kayması küçülür
    const wa = during(t, 'p-weekend', 'p-days');
    if (wa > 0) {
      const fix = after(t, 'p-weekend', 1, 1.6, ease.inOut);
      const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
      const rows = days.map((d, i) => {
        const wk = i >= 5;
        const sh = wk ? lerp(3, 1, fix) : 0;
        return { d, a: 23.5 + sh, b: 31 + sh, col: wk ? mix(WARM, OK, fix) : MEL, tag: wk ? `+${sh.toFixed(sh % 1 ? 1 : 0).replace('.', ',')} sa` : '' };
      });
      sleepWeek(ctx, 260, 220, 1400, 82, rows, wa * after(t, 'p-weekend', 0, 0.6), { h0: 20, h1: 38 });
      chip(ctx, 'farkı ≈ 1 saatte tut', W / 2, 920, wa * after(t, 'p-weekend', 1, 0.8), { size: 36, color: C.ok, border: rgba(OK, 0.6), weight: 800 });
    }
    // p-days: her gün biraz; bir haftalık plan
    const da = during(t, 'p-days', 'p-doctor');
    if (da > 0) {
      const x0 = 160;
      const w = 760;
      const y0 = 300;
      const hgt = 480;
      const Y = (h) => y0 + ((h - 22.5) / 3) * hgt; // 22:30 – 01:30
      ctx.save();
      ctx.globalAlpha *= da;
      ctx.strokeStyle = 'rgba(150,165,200,0.25)';
      ctx.lineWidth = 2;
      for (let h = 23; h <= 25; h += 1) line(ctx, x0, Y(h), x0 + w, Y(h));
      ctx.restore();
      [[23, '23:00'], [24, '00:00'], [25, '01:00']].forEach(([h, s]) => text(ctx, s, x0 - 20, Y(h), { size: 22, family: 'mono', color: C.muted, align: 'right', alpha: da }));
      text(ctx, 'uykunun geldiği saat', x0 + w / 2, y0 - 50, { size: 30, weight: 700, color: C.cream, alpha: da });
      const pts = [];
      for (let i = 0; i < 7; i++) {
        const p = progress(t, cue('p-days', 1) + i * 0.35, cue('p-days', 1) + i * 0.35 + 0.4);
        const x = x0 + 40 + (i / 6) * (w - 80);
        const y = Y(lerp(25.2, 23.3, i / 6) + Math.sin(i * 2.1) * 0.08);
        pts.push([x, y, p]);
        text(ctx, `${i + 1}. gün`, x, y0 + hgt + 40, { size: 22, color: C.muted, alpha: da });
      }
      ctx.save();
      ctx.globalAlpha *= da;
      ctx.strokeStyle = C.mel;
      ctx.lineWidth = 4;
      ctx.beginPath();
      pts.forEach(([x, y, p], i) => { if (p > 0) (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); });
      ctx.stroke();
      ctx.restore();
      pts.forEach(([x, y, p]) => melDot(ctx, x, y, 16, da * p));
      chip(ctx, 'her gün biraz daha erken', x0 + w / 2, y0 + hgt + 110, da * after(t, 'p-days', 1, 0.6), { size: 30, color: C.mel, border: rgba(MEL, 0.6) });
      // bu akşamın listesi
      const la = da * after(t, 'p-days', 2, 0.7);
      panel(ctx, 1040, 150, 760, 780, la, { fill: 'rgba(10,15,30,0.92)', border: rgba(OK, 0.5), r: 30 });
      text(ctx, 'Bu haftanın listesi', 1420, 220, { size: 42, family: 'display', weight: 800, color: C.cream, alpha: la });
      const items = [
        [SUN, 'sabah perdeyi aç, biraz yürü'],
        [SUN, 'masa pencereye yakın'],
        [WARM, 'akşam tavan kapalı, sarı lamba'],
        [WARM, 'ekran kısık ve uzakta'],
        [MEL, 'telefon odanın dışında'],
        [MEL, 'karanlık yatak odası'],
        [OK, 'hafta sonu farkı ≈ 1 saat'],
      ];
      items.forEach(([col, s], i) => {
        const p = progress(t, cue('p-days', 2) + 0.5 + i * 0.45, cue('p-days', 2) + 0.9 + i * 0.45);
        const y = 310 + i * 86;
        ctx.save();
        ctx.globalAlpha *= la * p;
        ctx.fillStyle = rgba(col, 0.18);
        roundRect(ctx, 1090, y - 32, 660, 64, 18);
        ctx.fill();
        ctx.restore();
        checkMark(ctx, 1130, y, 1.2, p, rgba(col, 1));
        text(ctx, s, 1170, y + 1, { size: 32, weight: 600, color: C.cream, align: 'left', alpha: la * p });
      });
    }
    // p-doctor
    const ka = vis(t, cue('p-doctor', 0) - 0.3, sceneEnd('habit'), 0.7, 0.6);
    if (ka > 0) {
      panel(ctx, 460, 300, 1000, 440, ka, { fill: 'rgba(10,15,30,0.95)', border: 'rgba(255,255,255,0.25)', r: 34 });
      // stetoskop
      ctx.save();
      ctx.globalAlpha *= ka;
      ctx.strokeStyle = C.ice;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(610, 400);
      ctx.quadraticCurveTo(600, 520, 680, 540);
      ctx.quadraticCurveTo(760, 520, 750, 400);
      ctx.moveTo(680, 540);
      ctx.quadraticCurveTo(690, 620, 770, 620);
      ctx.stroke();
      ctx.fillStyle = C.ice;
      dot(ctx, 790, 620, 24);
      ctx.restore();
      paragraph(ctx, 'Haftalardır uyuyamıyorsan ya da gün boyu yorgunsan:', 1130, 450, 560, { size: 34, weight: 600, color: C.muted, alpha: ka, valign: 'middle', lineHeight: 44 });
      text(ctx, 'bir hekime danış.', 1130, 590, { size: 56, family: 'display', weight: 800, color: C.cream, alpha: ka * after(t, 'p-doctor', 2, 0.6) });
    }
  };
  // ---------------------------------------------------------------------------
  // 13 · Kapanış
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
    // z-fire ve z-remember: ay ve ateş
    const fa = vis(t, sceneStart('close'), cue('z-tonight', 0) - 0.1, 1.0, 0.8);
    if (fa > 0) {
      ctx.save();
      ctx.globalAlpha *= fa;
      landscape(ctx, t, 21.6, after(t, 'z-fire', 0, 1.6));
      ctx.restore();
      const sa = fa * after(t, 'z-remember', 2, 0.9);
      if (sa > 0) {
        ctx.save();
        ctx.globalAlpha *= sa * 0.6;
        ctx.fillStyle = '#03050c';
        ctx.fillRect(0, 180, W, 220);
        ctx.restore();
      }
      statement(ctx, 'Saatin kaç olduğunu beynine ışık söyler.', 290, sa, { size: 62, maxW: 1700 });
    }
    // z-tonight: akşam erken bırakılan telefon, sabah güneşi
    const na = vis(t, cue('z-tonight', 0) - 0.3, cue('z-end', 0) - 0.1, 0.8, 0.8);
    if (na > 0) {
      const morning = after(t, 'z-tonight', 1, 2.0, ease.inOut);
      ctx.save();
      ctx.globalAlpha *= na;
      room(ctx, t, { kind: 'bed', hour: lerp(23.4, 31.3, morning), curtain: 0, lamp: 0.5 * (1 - morning), clock: morning > 0.5 ? '07:00' : '23:00', sleeper: { eyes: morning > 0.85 ? 1 : 0, zz: 1 - morning } });
      ctx.restore();
      banner(ctx, 'İç saatin sana teşekkür edecek.', na * after(t, 'z-tonight', 2, 0.8), { y: 960, color: C.sun });
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
    [1, 2, 3].forEach((k, i) => pop(c('h-know', k), ['D5', 'F5', 'A5'][i], 0.04, -0.4 + i * 0.4));
    bell(c('h-plan', 0) + 0.1, 'D5', 0.07);
    bell(c('h-plan', 0) + 0.5, 'A5', 0.05);
    pad('clock', ['E2', 'B2', 'G#3', 'D#4']);
    [1, 2, 3, 4].forEach((k, i) => pop(c('c-body', k), ['E4', 'G#4', 'B4', 'E5'][i]));
    bell(c('c-period', 3), 'B5', 0.05);
    bell(c('c-reset', 1) + 0.6, 'E5', 0.06);
    bell(c('c-jetlag', 5), 'G#5', 0.05);
    pad('scn', ['C2', 'G2', 'E3', 'B3']);
    bell(c('s-where', 3), 'G5', 0.05);
    bell(c('s-conductor', 1) + 1.4, 'C5', 0.06);
    pad('mel', ['A1', 'E2', 'C3', 'G3']);
    bell(c('m-call', 2), 'E5', 0.05);
    bell(c('m-signal', 2), 'C6', 0.04);
    pad('eye', ['F2', 'C3', 'A3', 'E4']);
    bell(c('e-discovery', 0), 'A5', 0.05);
    bell(c('e-blue', 1), 'E6', 0.04);
    [1, 2].forEach((k, i) => pop(c('e-every', k), ['C5', 'E5'][i], 0.04));
    pad('day', ['G2', 'D3', 'B3', 'F#4']);
    bell(c('d-out', 1), 'D6', 0.04);
    bell(c('d-evening', 4), 'B5', 0.05);
    pad('camp', ['D2', 'A2', 'F#3', 'E4']);
    bell(c('d-camp', 3), 'A5', 0.05);
    bell(c('d-weekend', 1), 'D6', 0.04);
    pad('screen', ['D2', 'A2', 'F3', 'C4']);
    pop(c('x-result', 1), 'D5');
    pop(c('x-result', 2), 'A4');
    bell(c('x-dim', 2), 'F5', 0.05);
    pad('honest', ['G1', 'D2', 'B2', 'F#3']);
    [1, 2, 3].forEach((k, i) => pop(c('n-content', k), ['G4', 'B4', 'D5'][i], 0.05, -0.3 + i * 0.3));
    pad('morning', ['C2', 'G2', 'E3', 'A3']);
    bell(c('r-rules', 2), 'C5', 0.05);
    bell(c('r-day', 0), 'E5', 0.05);
    pad('evening', ['A1', 'E2', 'C#3', 'G#3']);
    bell(c('r-evening', 0), 'E5', 0.05);
    m.click(c('p-lamp', 1) + 0.2, { gain: 0.05, tone: 900 });
    pad('sleep', ['F1', 'C2', 'A2', 'E3']);
    bell(c('r-night', 0), 'A5', 0.05);
    m.click(c('r-phone', 2) + 2.0, { gain: 0.05, tone: 700 });
    pad('habit', ['C2', 'G2', 'E3', 'B3']);
    for (let i = 0; i < 7; i++) pop(c('p-days', 2) + 0.6 + i * 0.45, ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6'][i], 0.03);
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
