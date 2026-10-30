/*
 * Önsöz — Gece Yarısı Dokunulan Cam (kursa hoş geldiniz videosu)
 * Elif'in gece yarısı gönderdiği mesaj ve görünmez yolculuğu; Malabadi Köprüsü ve görünmeyen denge;
 * insanlığın ikinci kez kurduğu görünmez köprü; teknoloji kullanılan değil kurulan bir şeydir;
 * bütüncül bakış; bu yolculuk kimin için; çırak, kalfa, usta; kendi taşını yontmak.
 *
 * Sahneler koreografi zamanıyla çizilir; anlatılan öğeler cue('satır', öbek) ile anlatıcının
 * söylediği anda belirir. Vuruş kimliği satır kimliğiyle aynıdır.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { W, H, clamp, lerp, ease, progress, vis, hash, noise, rgba, text, measure, runs, paragraph, glow, roundRect } = E;

  const C = {
    cream: '#f3ede1',
    muted: '#9aa3b8',
    dim: '#4d566b',
    line: '#2a3450',
    wire: '#3a4664',
    ink: '#1b1f2a',
    inkSoft: '#6b6252',
    paper: '#efe6d2',
    fire: '#ffa547',
    ember: '#e8541a',
    flame: '#ffd27a',
    off: '#6f80a8',
    digital: '#7cc8ff',
    error: '#ff5468',
    ok: '#7fe0a3',
    stone: '#b9a27c',
    stoneDark: '#7d6a4d',
    violet: '#b49cff',
  };
  const FIRE = [255, 150, 60];
  const COOL = [111, 128, 168];
  const DIGI = [124, 200, 255];
  const WARM = [255, 190, 120];
  const mixc = (a, b, p) => a.map((x, i) => Math.round(lerp(x, b[i], p)));

  // ---------------------------------------------------------------------------
  // Sahneler ve vuruşlar. Vuruşların uzunluğu satırın tahmini okuma süresinden çıkar (EXTRA: animasyon payı).
  // ---------------------------------------------------------------------------
  const SCRIPT = window.NARRATION ?? { lines: [] };
  const sayOf = Object.fromEntries(SCRIPT.lines.map((l) => [l.id, l.say]));
  const estimate = (id) => {
    const ph = E.phrases(sayOf[id] ?? '');
    return ph.reduce((n, p) => n + p.length / 13, 0) + 0.42 * Math.max(0, ph.length - 1) + 1.1;
  };
  const EXTRA = {
    'open-title': 0.6,
    'night-elif': 1.2,
    'night-type': 1.2,
    'night-send': 0.8,
    'night-hidden': 1.4,
    'jr-switch': 1.2,
    'jr-wifi': 0.8,
    'jr-fiber': 1.6,
    'jr-routers': 0.8,
    'jr-lock': 0.6,
    'jr-arrive': 1.2,
    'jr-course': 1.2,
    'br-intro': 3.0,
    'br-see': 0.6,
    'br-master': 1.2,
    'br-harmony': 1.0,
    'br-cross': 2.0,
    'inv-second': 1.6,
    'inv-life': 0.8,
    'bd-claim': 0.8,
    'bd-decide': 1.0,
    'ch-real': 0.8,
    'ch-revisit': 1.2,
    'ch-whole': 1.2,
    'who-everyone': 0.8,
    'who-two': 0.8,
    'cr-old': 1.0,
    'cr-today': 0.8,
    'cr-motto': 1.6,
    'st-masons': 1.6,
    'st-bridge': 1.2,
    'st-welcome': 1.6,
    'st-next': 2.0,
  };
  // Satırların başlamadan önce bıraktığı pay (kamera geçişleri için), vuruş başından itibaren saniye
  const LEAD = {
    'open-title': 2.6,
    'night-elif': 1.4,
    'jr-switch': 1.6,
    'jr-program': 1.3,
    'jr-memory': 1.3,
    'jr-wifi': 1.3,
    'jr-fiber': 1.3,
    'jr-routers': 1.3,
    'jr-db': 1.3,
    'jr-lock': 1.3,
    'jr-arrive': 1.3,
    'br-intro': 1.2,
    'inv-second': 0.6,
    'bd-surface': 0.6,
    'ch-split': 0.6,
    'who-everyone': 0.6,
    'cr-old': 1.0,
    'st-masons': 1.0,
  };
  const PLAN = [
    { id: 'open', title: 'Açılış', beats: ['open-title'], fadeIn: 0.8 },
    { id: 'night', title: 'Gece yarısı', beats: ['night-elif', 'night-berk', 'night-type', 'night-send', 'night-simple', 'night-hidden'] },
    { id: 'journey', title: 'Görünmez yolculuk', beats: ['jr-switch', 'jr-program', 'jr-memory', 'jr-wifi', 'jr-fiber', 'jr-routers', 'jr-db', 'jr-lock', 'jr-arrive', 'jr-left', 'jr-course'], fadeIn: 0.2 },
    { id: 'bridge', title: 'Malabadi Köprüsü', beats: ['br-intro', 'br-see', 'br-forces', 'br-master', 'br-team', 'br-harmony', 'br-cross'] },
    { id: 'web', title: 'Görünmez köprü', beats: ['inv-second', 'inv-parts', 'inv-unseen', 'inv-life'] },
    { id: 'build', title: 'Kullanılan değil, kurulan', beats: ['bd-surface', 'bd-belief', 'bd-claim', 'bd-decide'] },
    { id: 'chain', title: 'Bütüncül bakış', beats: ['ch-split', 'ch-real', 'ch-links', 'ch-links2', 'ch-revisit', 'ch-whole'] },
    { id: 'who', title: 'Kimin için', beats: ['who-everyone', 'who-learner', 'who-thinking', 'who-side', 'who-parent', 'who-two', 'who-all'] },
    { id: 'craft', title: 'Çırak, kalfa, usta', beats: ['cr-old', 'cr-cirak', 'cr-kalfa', 'cr-usta', 'cr-ahi', 'cr-today', 'cr-ethics', 'cr-motto'] },
    { id: 'stone', title: 'Kendi taşını yontmak', beats: ['st-masons', 'st-today', 'st-bridge', 'st-welcome', 'st-next'], fadeOut: 1.6 },
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
  // Satır, vuruşun başından LEAD kadar sonra başlar
  for (const l of SCRIPT.lines) if (LEAD[l.id]) l.offset = LEAD[l.id];

  const PACE = {};
  const PAUSE = {
    'open-title': 0.6,
    'night-send': 0.4,
    'night-simple': 1.0,
    'night-hidden': 0.6,
    'jr-switch': 0.4,
    'jr-fiber': 0.4,
    'jr-routers': 0.4,
    'jr-lock': 0.4,
    'jr-arrive': 0.6,
    'jr-left': 1.2,
    'jr-course': 1.4,
    'br-intro': 0.6,
    'br-forces': 0.8,
    'br-master': 0.6,
    'br-harmony': 1.0,
    'br-cross': 1.2,
    'inv-parts': 0.4,
    'inv-unseen': 0.8,
    'inv-life': 1.0,
    'bd-belief': 0.6,
    'bd-claim': 1.2,
    'bd-decide': 1.0,
    'ch-real': 0.6,
    'ch-links': 0.4,
    'ch-links2': 0.8,
    'ch-revisit': 0.6,
    'ch-whole': 1.4,
    'who-learner': 0.6,
    'who-thinking': 0.8,
    'who-side': 0.6,
    'who-two': 0.8,
    'who-all': 1.0,
    'cr-usta': 0.6,
    'cr-ahi': 1.0,
    'cr-today': 0.6,
    'cr-ethics': 0.6,
    'cr-motto': 1.8,
    'st-masons': 0.8,
    'st-today': 0.4,
    'st-bridge': 1.2,
    'st-welcome': 1.6,
  };
  const BREATH = 0.9;
  for (const [id, [scene, a, b, f]] of Object.entries(BEATS)) {
    if (f != null && !(f > a && f < b)) throw new Error(`${id}: donma anı vuruşun içinde olmalı`);
    if (f != null && (b - f) * (PACE[id] ?? 1) > BREATH + 1e-9) throw new Error(`${id}: donma anından sonrası nefes payından uzun`);
  }

  const build = (holds, slow) => E.timeline(SCENES.map((sc) => {
    const mine = Object.entries(BEATS).filter(([, b]) => b[0] === sc.id);
    return {
      ...sc,
      stretch: mine.map(([id, [, a, b]]) => [a, b, (PACE[id] ?? 1) * (slow[id] ?? 1)]).filter(([, , k]) => k !== 1),
      holds: mine.filter(([id]) => holds[id] > 0).map(([id, [, , , f]]) => [f, holds[id]]),
    };
  }));
  const VOICE = E.narration({ build, beats: BEATS, lines: SCRIPT.lines, voice: window.VOICE, pauses: PAUSE, breath: BREATH });
  const TL = VOICE.timeline;
  const cue = VOICE.cue;
  const lineEnd = VOICE.end;
  // cue anından itibaren d saniyede 0 → 1
  const after = (t, id, k = 0, d = 0.5, fn = ease.out) => progress(t, cue(id, k), cue(id, k) + d, fn);
  // satır bittikten sonra
  const afterEnd = (t, id, dt = 0, d = 0.5, fn = ease.out) => progress(t, lineEnd(id) + dt, lineEnd(id) + dt + d, fn);
  // vuruş başından itibaren koreografi zamanında a → b
  const B = (id) => BEATS[id][1];
  const BE = (id) => BEATS[id][2];
  const bp = (lt, id, a, b, fn = ease.inOut) => progress(lt, B(id) + a, B(id) + b, fn);
  // vuruştan vuruşa görünürlük (koreografi zamanında)
  const spanVis = (lt, first, last, fi = 0.5, fo = 0.4) => vis(lt, B(first), BE(last), fi, fo);
  const sceneEnd = (id) => TL.scene(id).end;
  const sceneStart = (id) => TL.scene(id).start;

  // ---------------------------------------------------------------------------
  // Ortak çizimler
  // ---------------------------------------------------------------------------

  function background(ctx) {
    const g = ctx.createRadialGradient(W / 2, H * 0.42, 80, W / 2, H * 0.5, W * 0.72);
    g.addColorStop(0, '#111a2e');
    g.addColorStop(1, '#04060c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function kicker(ctx, str, a, x = 120, y = 96) {
    if (a <= 0) return;
    text(ctx, str, x, y, { size: 24, weight: 600, spacing: 8, color: C.muted, align: 'left', alpha: a });
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = C.fire;
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
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function poly(ctx, pts) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  }

  function paperCard(ctx, x, y, w, h, r = 18, color = C.paper) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  // koyu kart (cam panel)
  function panel(ctx, x, y, w, h, a = 1, border = C.line, fill = 'rgba(10,15,30,0.9)', r = 18) {
    if (a <= 0) return;
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

  function chip(ctx, str, x, y, a, { color = C.cream, border = C.line, size = 28, fill = 'rgba(12,18,34,0.92)', align = 'center' } = {}) {
    if (a <= 0) return 0;
    const w = measure(ctx, str, { size, weight: 600 }) + size * 1.8;
    const h = size * 1.9;
    const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.save();
    ctx.globalAlpha *= a;
    roundRect(ctx, x0, y - h / 2, w, h, h / 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = border;
    ctx.stroke();
    ctx.restore();
    text(ctx, str, x0 + w / 2, y + 1, { size, weight: 600, color, alpha: a });
    return w;
  }

  function bitRuns(str, size) {
    return str.split('').map((b) => [b, { size, family: 'mono', weight: 700, color: b === '1' ? C.fire : C.off }]);
  }

  function drawStars(ctx, t, alpha, maxY = 720, seed = 1, n = 170, x0 = 0, x1 = W) {
    for (let i = 0; i < n; i++) {
      const x = x0 + hash(i, seed) * (x1 - x0);
      const y = hash(i, seed + 1) * maxY;
      const tw = 0.35 + 0.65 * noise(t * (0.6 + hash(i, seed + 3)) + i * 3.3, 5);
      ctx.fillStyle = rgba([235, 238, 255], alpha * tw * (0.35 + 0.65 * hash(i, seed + 5)));
      dot(ctx, x, y, 0.6 + hash(i, seed + 2) * 1.6);
    }
  }

  function drawMoon(ctx, x, y, r, bg = '#060a16') {
    glow(ctx, x, y, r * 5, [200, 210, 240], 0.1);
    ctx.save();
    ctx.fillStyle = '#e9e4d4';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = bg;
    dot(ctx, x + r * 0.45, y - r * 0.2, r * 0.92);
    ctx.restore();
  }

  function fillRidge(ctx, fn, color, x0 = -40, x1 = W + 40, step = 6) {
    ctx.beginPath();
    ctx.moveTo(x0, H + 40);
    for (let x = x0; x <= x1; x += step) ctx.lineTo(x, fn(x));
    ctx.lineTo(x1, H + 40);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  // Alev: üç katmanlı titrek diller, ışıma ve kıvılcımlar. k: 0 (sönük) → 1 (tam)
  function drawFire(ctx, x, y, s, t, k, seed = 0, sparks = true) {
    if (k <= 0.002) return;
    ctx.save();
    glow(ctx, x, y - 40 * s, 260 * s * (0.6 + 0.4 * k), FIRE, 0.45 * k);
    ctx.globalCompositeOperation = 'lighter';
    const layers = [
      { c: [255, 80, 20], a: 0.75, w: 1, h: 1 },
      { c: [255, 160, 50], a: 0.85, w: 0.68, h: 0.74 },
      { c: [255, 236, 170], a: 0.9, w: 0.36, h: 0.44 },
    ];
    layers.forEach((L, j) => {
      for (let i = 0; i < 3; i++) {
        const side = i - 1;
        const fl = noise(t * 5.5 + i * 3.1 + j * 7.3 + seed * 13.7, seed + i);
        const h = (95 + 55 * fl) * s * L.h * k * (side === 0 ? 1 : 0.72);
        const w = 30 * s * L.w * (0.5 + 0.5 * k);
        const ox = side * 15 * s * L.w;
        const sway = (noise(t * 2.6 + i * 1.7 + seed * 5, 99 + seed) - 0.5) * 30 * s * k;
        ctx.beginPath();
        ctx.moveTo(x + ox - w, y);
        ctx.bezierCurveTo(x + ox - w, y - h * 0.45, x + ox + sway * 0.4 - w * 0.35, y - h * 0.72, x + ox + sway, y - h);
        ctx.bezierCurveTo(x + ox + sway * 0.4 + w * 0.35, y - h * 0.72, x + ox + w, y - h * 0.45, x + ox + w, y);
        ctx.closePath();
        ctx.fillStyle = rgba(L.c, L.a);
        ctx.fill();
      }
    });
    if (sparks) {
      for (let i = 0; i < 9; i++) {
        const life = 1.1 + hash(i, seed + 3) * 0.9;
        const ph = (t + hash(i, seed) * life) / life;
        const cyc = Math.floor(ph);
        const p = ph - cyc;
        const sx = x + (hash(i * 31 + cyc, seed + 1) - 0.5) * 50 * s + Math.sin(p * 6 + i) * 10 * s;
        const sy = y - 50 * s - p * 230 * s * k;
        ctx.fillStyle = rgba([255, Math.round(200 - 90 * p), 90], (1 - p) * k * 0.9);
        dot(ctx, sx, sy, 2.6 * s * (1 - p * 0.5));
      }
    }
    ctx.restore();
  }

  // Ayakta insan silueti (yaklaşık 140 px boy, s ölçek). opt: pack (sırt çantası), book, apron, cane, child, facing (-1 sola)
  function person(ctx, x, y, s, opt = {}) {
    const tall = opt.child ? 0.78 : opt.tall ?? 1;
    const col = opt.color ?? '#04060b';
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s * (opt.facing ?? 1), s);
    ctx.fillStyle = col;
    ctx.save();
    ctx.scale(1, tall);
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-13, -60);
    ctx.lineTo(-20, -64);
    ctx.quadraticCurveTo(-22, -118, 0, -122);
    ctx.quadraticCurveTo(22, -118, 20, -64);
    ctx.lineTo(13, -60);
    ctx.lineTo(16, 0);
    ctx.lineTo(4, 0);
    ctx.lineTo(0, -52);
    ctx.lineTo(-4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    dot(ctx, 0, -138 * tall, 15);
    if (opt.pack) {
      roundRect(ctx, -34, -112 * tall, 18, 46, 6);
      ctx.fill();
    }
    if (opt.book) ctx.fillRect(14, -96 * tall, 22, 30);
    if (opt.apron) {
      ctx.fillStyle = opt.apronColor ?? '#2a1a10';
      ctx.fillRect(-14, -92 * tall, 28, 70 * tall);
    }
    if (opt.tool === 'broom') {
      ctx.strokeStyle = col;
      ctx.lineWidth = 4;
      line(ctx, 26, -110 * tall, 40, 0);
      ctx.beginPath();
      ctx.moveTo(30, -4);
      ctx.lineTo(54, -4);
      ctx.lineTo(48, 6);
      ctx.lineTo(34, 6);
      ctx.closePath();
      ctx.fill();
    }
    if (opt.tool === 'staff') {
      ctx.strokeStyle = col;
      ctx.lineWidth = 4;
      line(ctx, 26, 4, 26, -150 * tall);
    }
    ctx.restore();
  }

  // Basit çizgi simgeler (yaklaşık 100×100 kutu, merkez 0,0)
  function icon(ctx, kind, x, y, s, color, alpha = 1, lw = 4.5) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    switch (kind) {
      case 'chip':
        roundRect(ctx, -26, -26, 52, 52, 6);
        ctx.stroke();
        roundRect(ctx, -11, -11, 22, 22, 3);
        ctx.fill();
        for (let k = -1; k <= 1; k++) {
          line(ctx, k * 13, -26, k * 13, -38);
          line(ctx, k * 13, 26, k * 13, 38);
          line(ctx, -26, k * 13, -38, k * 13);
          line(ctx, 26, k * 13, 38, k * 13);
        }
        break;
      case 'code':
        ctx.beginPath();
        ctx.moveTo(-14, -26);
        ctx.lineTo(-38, 0);
        ctx.lineTo(-14, 26);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(14, -26);
        ctx.lineTo(38, 0);
        ctx.lineTo(14, 26);
        ctx.stroke();
        line(ctx, 6, -34, -6, 34);
        break;
      case 'db':
        ctx.beginPath();
        ctx.ellipse(0, -26, 30, 10, 0, 0, Math.PI * 2);
        ctx.stroke();
        line(ctx, -30, -26, -30, 26);
        line(ctx, 30, -26, 30, 26);
        ctx.beginPath();
        ctx.ellipse(0, 26, 30, 10, 0, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 10, 0, 0, Math.PI);
        ctx.stroke();
        break;
      case 'globe':
        ctx.beginPath();
        ctx.arc(0, 0, 34, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 34, 0, 0, Math.PI * 2);
        ctx.stroke();
        line(ctx, -34, 0, 34, 0);
        line(ctx, -29, -17, 29, -17);
        line(ctx, -29, 17, 29, 17);
        break;
      case 'shield':
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.lineTo(32, -28);
        ctx.quadraticCurveTo(32, 18, 0, 40);
        ctx.quadraticCurveTo(-32, 18, -32, -28);
        ctx.closePath();
        ctx.stroke();
        dot(ctx, 0, -6, 7);
        ctx.beginPath();
        ctx.moveTo(-5, -2);
        ctx.lineTo(5, -2);
        ctx.lineTo(3, 16);
        ctx.lineTo(-3, 16);
        ctx.closePath();
        ctx.fill();
        break;
      case 'window':
        roundRect(ctx, -40, -32, 80, 64, 7);
        ctx.stroke();
        line(ctx, -40, -18, 40, -18);
        [-30, -21, -12].forEach((dx) => dot(ctx, dx, -25, 2.6));
        roundRect(ctx, -30, -8, 26, 30, 3);
        ctx.stroke();
        line(ctx, 4, -6, 30, -6);
        line(ctx, 4, 6, 30, 6);
        line(ctx, 4, 18, 22, 18);
        break;
      case 'flow':
        roundRect(ctx, -16, -42, 32, 18, 4);
        ctx.stroke();
        line(ctx, 0, -24, 0, -16);
        poly(ctx, [[0, -16], [16, 0], [0, 16], [-16, 0]]);
        ctx.closePath();
        ctx.stroke();
        line(ctx, -16, 0, -34, 0);
        line(ctx, -34, 0, -34, 24);
        line(ctx, 16, 0, 34, 0);
        line(ctx, 34, 0, 34, 24);
        roundRect(ctx, -44, 24, 20, 16, 3);
        ctx.stroke();
        roundRect(ctx, 24, 24, 20, 16, 3);
        ctx.stroke();
        break;
      case 'alarm':
        ctx.beginPath();
        ctx.arc(0, 4, 30, 0, Math.PI * 2);
        ctx.stroke();
        line(ctx, 0, 4, 0, -14);
        line(ctx, 0, 4, 13, 12);
        line(ctx, -30, -22, -18, -32);
        line(ctx, 30, -22, 18, -32);
        line(ctx, -20, 34, -26, 42);
        line(ctx, 20, 34, 26, 42);
        break;
      case 'hospital':
        roundRect(ctx, -34, -30, 68, 64, 6);
        ctx.stroke();
        ctx.fillRect(-6, -18, 12, 36);
        ctx.fillRect(-18, -6, 36, 12);
        break;
      case 'card':
        roundRect(ctx, -40, -26, 80, 52, 7);
        ctx.stroke();
        ctx.fillRect(-40, -14, 80, 10);
        roundRect(ctx, -30, 6, 18, 12, 2);
        ctx.fill();
        line(ctx, 4, 12, 28, 12);
        break;
      case 'plant':
        line(ctx, 0, 36, 0, -6);
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.quadraticCurveTo(-30, 4, -28, -22);
        ctx.quadraticCurveTo(-4, -16, 0, 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -2);
        ctx.quadraticCurveTo(28, -6, 26, -32);
        ctx.quadraticCurveTo(2, -26, 0, -2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(24, 6);
        ctx.quadraticCurveTo(32, 18, 24, 24);
        ctx.quadraticCurveTo(16, 18, 24, 6);
        ctx.fill();
        line(ctx, -30, 36, 30, 36);
        break;
      case 'plane':
        ctx.beginPath();
        ctx.moveTo(-36, 4);
        ctx.lineTo(30, -4);
        ctx.quadraticCurveTo(42, -4, 40, 2);
        ctx.quadraticCurveTo(38, 8, 26, 8);
        ctx.lineTo(-36, 10);
        ctx.closePath();
        ctx.stroke();
        poly(ctx, [[4, 2], [-12, 30], [-2, 30], [18, 4]]);
        ctx.stroke();
        poly(ctx, [[4, 0], [-10, -24], [-2, -24], [16, -2]]);
        ctx.stroke();
        poly(ctx, [[-30, 4], [-38, -14], [-32, -14], [-22, 2]]);
        ctx.stroke();
        break;
      case 'bulb':
        ctx.beginPath();
        ctx.arc(0, -8, 24, Math.PI * 0.8, Math.PI * 2.2);
        ctx.quadraticCurveTo(14, 16, 10, 22);
        ctx.lineTo(-10, 22);
        ctx.quadraticCurveTo(-14, 16, -19, 6);
        ctx.stroke();
        line(ctx, -9, 30, 9, 30);
        line(ctx, -6, 37, 6, 37);
        break;
      case 'lock':
        roundRect(ctx, -26, -6, 52, 42, 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -6, 17, Math.PI, 0);
        ctx.stroke();
        dot(ctx, 0, 12, 5);
        line(ctx, 0, 12, 0, 24);
        break;
      case 'eye':
        ctx.beginPath();
        ctx.moveTo(-40, 0);
        ctx.quadraticCurveTo(0, -34, 40, 0);
        ctx.quadraticCurveTo(0, 34, -40, 0);
        ctx.closePath();
        ctx.stroke();
        dot(ctx, 0, 0, 10);
        break;
      case 'factory':
        poly(ctx, [[-40, 34], [-40, -6], [-20, 6], [-20, -6], [0, 6], [0, -6], [20, 6], [20, -36], [34, -36], [34, 34]]);
        ctx.closePath();
        ctx.stroke();
        ctx.fillRect(-30, 16, 10, 10);
        ctx.fillRect(-10, 16, 10, 10);
        ctx.fillRect(10, 16, 10, 10);
        break;
      case 'wheat':
        line(ctx, 0, 38, 0, -34);
        for (let k = 0; k < 4; k++) {
          const yy = -26 + k * 14;
          ctx.beginPath();
          ctx.ellipse(-9, yy, 9, 5, -0.6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(9, yy, 9, 5, 0.6, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      case 'scales':
        line(ctx, 0, -34, 0, 34);
        line(ctx, -26, 34, 26, 34);
        line(ctx, -34, -22, 34, -22);
        ctx.beginPath();
        ctx.moveTo(-34, -22);
        ctx.lineTo(-44, 6);
        ctx.lineTo(-24, 6);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(34, -22);
        ctx.lineTo(24, 6);
        ctx.lineTo(44, 6);
        ctx.closePath();
        ctx.stroke();
        break;
      case 'heart':
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.bezierCurveTo(-46, 0, -26, -38, 0, -16);
        ctx.bezierCurveTo(26, -38, 46, 0, 0, 30);
        ctx.closePath();
        ctx.stroke();
        break;
      case 'person':
        ctx.beginPath();
        ctx.arc(0, -16, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-26, 30);
        ctx.quadraticCurveTo(-24, 4, 0, 4);
        ctx.quadraticCurveTo(24, 4, 26, 30);
        ctx.stroke();
        break;
      default:
        break;
    }
    ctx.restore();
  }

  // Kıvılcım yayı a → b
  function sparkArc(ctx, x0, y0, x1, y1, p, a, lift = 150, color = [255, 200, 120], r0 = 4.5) {
    if (a <= 0 || p <= 0) return;
    const qx = (x0 + x1) / 2;
    const qy = Math.min(y0, y1) - lift;
    for (let j = 0; j < 18; j++) {
      const u = p - j * 0.014;
      if (u < 0) break;
      const px = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * qx + u * u * x1;
      const py = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * qy + u * u * y1;
      ctx.fillStyle = rgba(color, a * (1 - j / 18) * 0.9);
      dot(ctx, px, py, Math.max(0.5, r0 - j * 0.18));
    }
  }

  // Bir metni harf harf yazar (p 0 → 1)
  const typed = (str, p) => str.slice(0, Math.round(str.length * clamp(p)));

  // ---------------------------------------------------------------------------
  // 0 · Açılış
  // ---------------------------------------------------------------------------

  DRAW.open = function sceneOpen(ctx, lt, t) {
    const cx = W / 2;
    // karanlıkta beliren cam ve parmak dokunuşu
    const glass = progress(lt, 0.3, 1.6);
    ctx.save();
    ctx.globalAlpha *= glass * (1 - progress(t, cue('open-title', 0) - 0.2, cue('open-title', 0) + 0.6));
    roundRect(ctx, cx - 150, 240, 300, 600, 40);
    const g = ctx.createLinearGradient(0, 240, 0, 840);
    g.addColorStop(0, 'rgba(124,200,255,0.10)');
    g.addColorStop(1, 'rgba(124,200,255,0.02)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(124,200,255,0.35)';
    ctx.stroke();
    ctx.restore();
    const tap = progress(lt, 1.6, 2.6, ease.out);
    if (tap > 0 && tap < 1) {
      ctx.save();
      ctx.strokeStyle = rgba(DIGI, 0.6 * (1 - tap));
      ctx.lineWidth = 3;
      for (let k = 0; k < 3; k++) {
        const r = 10 + (tap * 160 - k * 30);
        if (r <= 0) continue;
        ctx.beginPath();
        ctx.arc(cx, 560, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      glow(ctx, cx, 560, 120, DIGI, 0.5 * (1 - tap));
    }
    const a1 = after(t, 'open-title', 0, 0.8);
    text(ctx, 'ÖNSÖZ', cx, 420, { size: 30, weight: 700, spacing: 16, color: C.fire, alpha: a1 });
    const a2 = after(t, 'open-title', 1, 1.0);
    text(ctx, 'Gece Yarısı Dokunulan Cam', cx, 540 + (1 - a2) * 20, { size: 104, family: 'serif', italic: true, color: C.cream, alpha: a2 });
    const a3 = progress(t, cue('open-title', 1) + 0.6, cue('open-title', 1) + 1.6);
    ctx.save();
    ctx.globalAlpha *= a3;
    ctx.fillStyle = C.dim;
    ctx.fillRect(cx - 70, 640, 140, 2);
    ctx.restore();
    text(ctx, 'BİLİŞİM TEKNOLOJİLERİ YETKİNLİĞİ', cx, 694, { size: 26, weight: 600, spacing: 8, color: C.muted, alpha: a3 });
  };

  // ---------------------------------------------------------------------------
  // 1 · Gece yarısı: Elif'in mesajı
  // ---------------------------------------------------------------------------

  const PH = { x: 1190, y: 520, rot: -0.035, w: 380, h: 780 }; // telefonun ekranı (yerel 0..w × 0..h)
  const phonePt = (x, y) => {
    const lx = x - PH.w / 2;
    const ly = y - PH.h / 2;
    const c = Math.cos(PH.rot);
    const s = Math.sin(PH.rot);
    return [PH.x + lx * c - ly * s, PH.y + lx * s + ly * c];
  };
  const MSG = 'Yarın birlikte çalışalım.';
  const KEYROWS = ['qwertyuıopğü', 'asdfghjklşi', 'zxcvbnmöç.'];
  const KB = { y: 500, h: 270, kw: PH.w / 12 };
  function keyPos(ch) {
    const c = ch.toLocaleLowerCase('tr-TR');
    if (c === ' ') return [PH.w / 2, KB.y + 34 + 3 * 60 + 4];
    for (let r = 0; r < 3; r++) {
      const i = KEYROWS[r].indexOf(c);
      if (i >= 0) return [KB.kw * (i + 0.5 + r * 0.5 + (r === 2 ? 0.5 : 0)), KB.y + 34 + r * 60];
    }
    return [PH.w / 2, KB.y + 100];
  }
  const typeStart = () => cue('night-type', 1) + 0.15;
  const TYPE_D = 2.2;
  const sendAt = () => cue('night-send', 0) + 0.35;

  function drawRoom(ctx, t, a) {
    // duvar
    const wall = ctx.createLinearGradient(0, 0, 0, H);
    wall.addColorStop(0, '#0a0f1d');
    wall.addColorStop(1, '#05070e');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, W, H);
    // pencere
    const wx = 130;
    const wy = 140;
    const ww = 500;
    const wh = 500;
    ctx.save();
    ctx.beginPath();
    ctx.rect(wx, wy, ww, wh);
    ctx.clip();
    const sky = ctx.createLinearGradient(0, wy, 0, wy + wh);
    sky.addColorStop(0, '#040812');
    sky.addColorStop(1, '#14223f');
    ctx.fillStyle = sky;
    ctx.fillRect(wx, wy, ww, wh);
    drawStars(ctx, t, 0.9, wy + 300, 3, 60, wx, wx + ww);
    drawMoon(ctx, wx + 360, wy + 110, 32, '#050913');
    // şehir silueti, birkaç yanık pencere
    let x = wx - 10;
    let i = 0;
    while (x < wx + ww) {
      const bw = 40 + hash(i, 4) * 60;
      const bh = 90 + hash(i, 5) * 180;
      const top = wy + wh - bh;
      ctx.fillStyle = '#070b16';
      ctx.fillRect(x, top, bw - 4, bh);
      for (let r = 0; r < Math.floor(bh / 22); r++) {
        for (let c = 0; c < Math.floor((bw - 12) / 14); c++) {
          const on = hash(i * 97 + r * 13 + c, 8) > 0.86;
          if (!on) continue;
          const flick = noise(t * 0.3 + i + r, 3) > 0.15 ? 1 : 0.3;
          ctx.fillStyle = `rgba(255,200,120,${0.55 * flick})`;
          ctx.fillRect(x + 6 + c * 14, top + 10 + r * 22, 6, 9);
        }
      }
      x += bw;
      i++;
    }
    ctx.restore();
    // çerçeve ve perde
    ctx.strokeStyle = '#1c2438';
    ctx.lineWidth = 14;
    ctx.strokeRect(wx, wy, ww, wh);
    ctx.lineWidth = 8;
    line(ctx, wx + ww / 2, wy, wx + ww / 2, wy + wh);
    line(ctx, wx, wy + wh * 0.45, wx + ww, wy + wh * 0.45);
    ctx.fillStyle = '#141b2e';
    ctx.fillRect(wx - 30, wy + wh + 6, ww + 60, 16);
    for (let k = 0; k < 6; k++) {
      ctx.fillStyle = k % 2 ? '#0c1222' : '#101830';
      ctx.fillRect(wx - 70 + k * 18, wy - 30, 20, wh + 60);
    }
    // masa
    const desk = ctx.createLinearGradient(0, 860, 0, H);
    desk.addColorStop(0, '#1b130d');
    desk.addColorStop(1, '#0d0906');
    ctx.fillStyle = desk;
    ctx.fillRect(0, 860, W, H - 860);
    ctx.fillStyle = 'rgba(255,190,120,0.06)';
    ctx.fillRect(0, 860, W, 3);
  }

  function drawNotebook(ctx, t, a) {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(430, 960);
    ctx.rotate(-0.06);
    ctx.fillStyle = '#d9d0bd';
    roundRect(ctx, -260, -110, 520, 230, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(80,100,140,0.25)';
    ctx.lineWidth = 1.5;
    for (let k = 0; k < 7; k++) line(ctx, -250, -80 + k * 30, 250, -80 + k * 30);
    ctx.fillStyle = '#2a2f40';
    text(ctx, 'x² − 5x + 6 = 0', -220, -68, { size: 30, family: 'serif', italic: true, color: '#2a3550', align: 'left' });
    text(ctx, '(x − 2)(x − 3) = 0  ?', -220, -6, { size: 30, family: 'serif', italic: true, color: '#2a3550', align: 'left' });
    ctx.restore();
    // kalem
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(760, 990);
    ctx.rotate(-0.4);
    ctx.fillStyle = '#c99a3a';
    ctx.fillRect(0, -7, 200, 14);
    ctx.fillStyle = '#e9d2a2';
    poly(ctx, [[0, -7], [-22, 0], [0, 7]]);
    ctx.fill();
    ctx.restore();
  }

  // telefon gövdesi ve ekranın yerel koordinat sistemi
  function withPhone(ctx, fn) {
    ctx.save();
    ctx.translate(PH.x, PH.y);
    ctx.rotate(PH.rot);
    ctx.translate(-PH.w / 2, -PH.h / 2);
    fn();
    ctx.restore();
  }

  function bubble(ctx, str, x, y, side, a, { bg = '#1d2940', fg = C.cream, size = 22, maxW = 250 } = {}) {
    if (a <= 0) return 0;
    const lines = E.wrap(ctx, str, maxW, { size });
    const w = Math.max(...lines.map((l) => measure(ctx, l, { size }))) + 32;
    const h = lines.length * size * 1.3 + 22;
    const x0 = side === 'left' ? x : x - w;
    ctx.save();
    ctx.globalAlpha *= a;
    roundRect(ctx, x0, y, w, h, 18);
    ctx.fillStyle = bg;
    ctx.fill();
    lines.forEach((l, i) => text(ctx, l, x0 + 16, y + 11 + size * 0.65 + i * size * 1.3, { size, color: fg, align: 'left' }));
    ctx.restore();
    return h;
  }

  function drawPhoneUI(ctx, t, lt, a, uiAlpha) {
    withPhone(ctx, () => {
      // gövde
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 60;
      roundRect(ctx, -18, -18, PH.w + 36, PH.h + 36, 52);
      ctx.fillStyle = '#0b0e16';
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#2a3247';
      ctx.stroke();
      roundRect(ctx, 0, 0, PH.w, PH.h, 36);
      ctx.save();
      ctx.clip();
      ctx.fillStyle = '#0d1424';
      ctx.fillRect(0, 0, PH.w, PH.h);
      drawCircuit(ctx, t, 1 - uiAlpha);
      ctx.globalAlpha *= uiAlpha;
      // durum çubuğu ve başlık
      text(ctx, '00:12', 30, 30, { size: 18, weight: 600, color: C.cream, align: 'left' });
      ctx.fillStyle = C.cream;
      for (let k = 0; k < 4; k++) ctx.fillRect(PH.w - 78 + k * 7, 34 - k * 4, 5, 6 + k * 4);
      roundRect(ctx, PH.w - 44, 22, 28, 14, 3);
      ctx.fill();
      ctx.fillStyle = '#131c30';
      ctx.fillRect(0, 56, PH.w, 76);
      const bA = after(t, 'night-berk', 2, 0.5);
      ctx.fillStyle = rgba(DIGI, 0.25 + 0.75 * bA);
      dot(ctx, 50, 94, 24);
      text(ctx, 'B', 50, 95, { size: 24, weight: 800, color: '#0d1424' });
      text(ctx, 'Berk', 88, 84, { size: 24, weight: 700, color: C.cream, align: 'left' });
      text(ctx, 'çevrimiçi', 88, 110, { size: 16, color: C.ok, align: 'left', alpha: 0.9 });
      // mesajlar
      const kbUp = progress(t, cue('night-type', 0), cue('night-type', 0) + 0.5) * (1 - progress(t, sendAt() + 0.9, sendAt() + 1.4));
      const shift = -kbUp * 210; // klavye açılınca sohbet yukarı kayar
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 134, PH.w, PH.h - 134);
      ctx.clip();
      let y = 170 + shift;
      y += bubble(ctx, 'yarın sınav var...', 20, y, 'left', after(t, 'night-berk', 0, 0.4)) + 10;
      y += bubble(ctx, 'hiçbir şey anlamadım', 20, y, 'left', after(t, 'night-berk', 2, 0.4)) + 14;
      const sent = progress(t, sendAt(), sendAt() + 0.45, ease.out);
      if (sent > 0) {
        const fromY = PH.h - 64 - kbUp * KB.h;
        const by = lerp(fromY, y, sent);
        const h = bubble(ctx, MSG, PH.w - 20, by, 'right', 1, { bg: '#ffb05e', fg: '#1b1f2a' });
        const ok = after(t, 'night-send', 1, 0.3);
        text(ctx, '✓✓', PH.w - 30, by + h + 16, { size: 16, weight: 700, color: C.digital, align: 'right', alpha: ok });
        text(ctx, 'iletildi', PH.w - 64, by + h + 16, { size: 15, color: C.muted, align: 'right', alpha: ok });
      }
      ctx.restore();
      // giriş alanı
      const iy = PH.h - 64 - kbUp * KB.h;
      roundRect(ctx, 16, iy, PH.w - 84, 46, 23);
      ctx.fillStyle = '#18233a';
      ctx.fill();
      const tp = progress(t, typeStart(), typeStart() + TYPE_D, ease.linear);
      const shown = sent > 0 ? '' : typed(MSG, tp);
      if (shown) text(ctx, shown, 34, iy + 24, { size: 20, color: C.cream, align: 'left' });
      else if (sent <= 0) text(ctx, 'Mesaj', 34, iy + 24, { size: 20, color: C.dim, align: 'left' });
      if (tp > 0 && sent <= 0 && Math.floor(t * 2.4) % 2 === 0) {
        const cw = measure(ctx, shown, { size: 20 });
        ctx.fillStyle = C.digital;
        ctx.fillRect(36 + cw, iy + 12, 2, 24);
      }
      const press = vis(t, sendAt() - 0.12, sendAt() + 0.2, 0.05, 0.15);
      ctx.fillStyle = shown.length === MSG.length || press > 0 ? C.fire : '#2a3550';
      dot(ctx, PH.w - 40, iy + 23, 22 + press * 3);
      ctx.strokeStyle = '#0d1424';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(PH.w - 50, iy + 23);
      ctx.lineTo(PH.w - 30, iy + 23);
      ctx.moveTo(PH.w - 38, iy + 15);
      ctx.lineTo(PH.w - 30, iy + 23);
      ctx.lineTo(PH.w - 38, iy + 31);
      ctx.stroke();
      // klavye
      if (kbUp > 0) {
        const ky = PH.h - kbUp * KB.h;
        ctx.fillStyle = '#121a2c';
        ctx.fillRect(0, ky, PH.w, KB.h);
        const cur = tp > 0 && tp < 1 ? MSG[Math.min(MSG.length - 1, Math.floor(tp * MSG.length))] : null;
        KEYROWS.forEach((row, r) => {
          [...row].forEach((ch, i) => {
            const [kx, kyy] = keyPos(ch);
            const yy = ky + (kyy - KB.y);
            const hot = cur && cur.toLocaleLowerCase('tr-TR') === ch;
            roundRect(ctx, kx - KB.kw / 2 + 2, yy - 24, KB.kw - 4, 48, 6);
            ctx.fillStyle = hot ? '#3d5a88' : '#1e2a42';
            ctx.fill();
            text(ctx, ch, kx, yy + 1, { size: 18, color: C.cream });
          });
        });
        const [sx, sy] = keyPos(' ');
        roundRect(ctx, sx - 110, ky + (sy - KB.y) - 22, 220, 44, 6);
        ctx.fillStyle = cur === ' ' ? '#3d5a88' : '#1e2a42';
        ctx.fill();
      }
      ctx.restore();
      ctx.restore();
    });
  }

  // camın altındaki devre: önce silik, sonra ışıyan izler ve anahtarlar
  function drawCircuit(ctx, t, k) {
    if (k <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= k;
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, PH.w, PH.h);
    ctx.strokeStyle = rgba(DIGI, 0.35);
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 40; i++) {
      const y = 20 + i * 19;
      const x0 = hash(i, 3) * 120;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + 80 + hash(i, 4) * 120, y);
      ctx.lineTo(x0 + 100 + hash(i, 4) * 120, y + 10);
      ctx.lineTo(PH.w, y + 10);
      ctx.stroke();
    }
    const n = 18;
    for (let r = 0; r < 38; r++) {
      for (let c = 0; c < n; c++) {
        const on = noise(t * 6 + r * 0.7 + c * 1.3, r * 31 + c) > 0.5;
        ctx.fillStyle = on ? rgba(FIRE, 0.85) : rgba(COOL, 0.35);
        ctx.fillRect(12 + c * 20, 14 + r * 20, 8, 8);
      }
    }
    ctx.restore();
  }

  // Başparmak: kökü sağ alttan, ucu hedef noktada
  function drawThumb(ctx, tip, a) {
    if (a <= 0) return;
    const base = [1640, 1230];
    const ang = Math.atan2(tip[1] - base[1], tip[0] - base[0]);
    const len = Math.hypot(tip[0] - base[0], tip[1] - base[1]);
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(base[0], base[1]);
    ctx.rotate(ang);
    const g = ctx.createLinearGradient(0, -50, 0, 50);
    g.addColorStop(0, '#9a7560');
    g.addColorStop(1, '#5a3f31');
    ctx.fillStyle = g;
    roundRect(ctx, -40, -46, len + 40, 92, 46);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,225,205,0.35)';
    roundRect(ctx, len - 52, -30, 36, 54, 16);
    ctx.fill();
    ctx.restore();
  }

  DRAW.night = function sceneNight(ctx, lt, t) {
    const room = progress(lt, 0, 1.2);
    drawRoom(ctx, t, room);
    drawNotebook(ctx, t, room);
    const hid = bp(lt, 'night-hidden', 0.3, BE('night-hidden') - B('night-hidden') - 0.2, ease.in);
    const zoom = Math.exp(lerp(0, Math.log(7), hid));
    ctx.save();
    // gizli yapıya dalış: telefonun ekranına doğru yakınlaşma
    const [zx, zy] = phonePt(PH.w / 2, PH.h * 0.42);
    ctx.translate(zx, zy);
    ctx.scale(zoom, zoom);
    ctx.translate(-zx, -zy);
    // ekran ışığı
    const on = progress(lt, 0.4, 1.4);
    glow(ctx, PH.x, PH.y + 120, 900, [120, 170, 255], 0.16 * on);
    drawPhoneUI(ctx, t, lt, progress(lt, 0.1, 0.9), 1 - progress(hid, 0.1, 0.6));
    // başparmak: yazarken harflere, sonra gönder tuşuna
    const tA = vis(t, typeStart() - 0.6, sendAt() + 0.8, 0.5, 0.6);
    if (tA > 0) {
      let tip;
      const tp = progress(t, typeStart(), typeStart() + TYPE_D, ease.linear);
      const kbUp = progress(t, cue('night-type', 0), cue('night-type', 0) + 0.5);
      if (t < sendAt() - 0.3) {
        const i = Math.min(MSG.length - 1, Math.floor(tp * MSG.length));
        const [kx, ky] = keyPos(MSG[i]);
        const press = (tp * MSG.length) % 1;
        tip = phonePt(kx + 10, PH.h - kbUp * KB.h + (ky - KB.y) + 8 - Math.sin(press * Math.PI) * 6);
      } else {
        const iy = PH.h - 64 - KB.h;
        tip = phonePt(PH.w - 34, iy + 30);
      }
      drawThumb(ctx, tip, tA);
    }
    ctx.restore();

    // sınav notu (pencere çerçevesinde)
    const note = after(t, 'night-berk', 0, 0.5);
    if (note > 0) {
      ctx.save();
      ctx.globalAlpha *= note * (1 - hid);
      ctx.translate(560, 690);
      ctx.rotate(0.05);
      ctx.fillStyle = '#f1d36b';
      ctx.fillRect(-90, -50, 180, 100);
      text(ctx, 'YARIN', 0, -18, { size: 20, weight: 800, spacing: 3, color: '#3a2f10' });
      text(ctx, 'matematik sınavı', 0, 16, { size: 22, family: 'serif', italic: true, color: '#3a2f10' });
      ctx.restore();
    }
    const tagA = after(t, 'night-elif', 1, 0.5) * (1 - hid);
    chip(ctx, 'Elif · 16 yaşında', 820, 960, tagA, { size: 24, color: C.cream });
    const timer = after(t, 'night-send', 1, 0.4) * (1 - progress(t, cue('night-simple', 0), cue('night-simple', 0) + 0.5)) * (1 - hid);
    if (timer > 0) {
      text(ctx, '0,1 sn', 840, 420, { size: 64, family: 'mono', weight: 700, color: C.digital, alpha: timer });
      text(ctx, 'saniyenin onda biri', 840, 480, { size: 26, family: 'serif', italic: true, color: C.muted, alpha: timer });
    }
    const simple = after(t, 'night-simple', 1, 0.8) * (1 - after(t, 'night-hidden', 0, 0.5));
    text(ctx, 'dokundu ve gitti.', 380, 760, { size: 70, family: 'serif', italic: true, color: C.cream, alpha: simple });
    const hiddenTxt = after(t, 'night-hidden', 1, 0.8) * (1 - progress(hid, 0.5, 0.8));
    text(ctx, 'insanlığın en büyük ortak yapıtlarından biri', 380, 760, { size: 40, family: 'serif', italic: true, color: C.flame, alpha: hiddenTxt });
    // dalışın sonunda beyaz-mavi parlama
    const flash = progress(hid, 0.85, 1);
    if (flash > 0) {
      ctx.fillStyle = `rgba(6,10,20,${flash})`;
      ctx.fillRect(0, 0, W, H);
    }
  };

  // ---------------------------------------------------------------------------
  // 2 · Mesajın görünmez yolculuğu: dokuz durak, kamera duraktan durağa kayar
  // ---------------------------------------------------------------------------

  const JR = [
    ['jr-switch', 0], ['jr-program', 1], ['jr-memory', 2], ['jr-wifi', 3], ['jr-fiber', 4],
    ['jr-routers', 5], ['jr-db', 6], ['jr-lock', 7], ['jr-arrive', 8], ['jr-left', 8], ['jr-course', 8],
  ];
  const STOPS = [
    { title: 'ANAHTARLAR', icon: 'chip' },
    { title: 'PROGRAM', icon: 'code' },
    { title: 'BELLEK', icon: 'mem' },
    { title: 'DALGALAR', icon: 'wifi' },
    { title: 'CAM LİFLER', icon: 'fiber' },
    { title: 'YÖNLENDİRİCİLER', icon: 'router' },
    { title: 'VERİ TABANI', icon: 'db' },
    { title: 'ŞİFRELEME', icon: 'lock' },
    { title: 'VARIŞ', icon: 'phone' },
  ];
  function camX(lt) {
    let cur = 0;
    for (const [id, s] of JR) {
      if (lt < B(id)) break;
      cur = lerp(cur, s * W, bp(lt, id, 0, 1.3));
    }
    return cur;
  }

  function stopIcon(ctx, kind, x, y, s, color, a) {
    if (a <= 0) return;
    if (['chip', 'code', 'db', 'lock'].includes(kind)) return icon(ctx, kind, x, y, s, color, a);
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    if (kind === 'mem') {
      roundRect(ctx, -38, -18, 76, 36, 4);
      ctx.stroke();
      for (let k = 0; k < 4; k++) ctx.fillRect(-30 + k * 17, -10, 10, 20);
      for (let k = 0; k < 7; k++) line(ctx, -32 + k * 10.5, 18, -32 + k * 10.5, 28);
    } else if (kind === 'wifi') {
      for (let k = 1; k <= 3; k++) {
        ctx.beginPath();
        ctx.arc(0, 22, k * 14, -Math.PI * 0.78, -Math.PI * 0.22);
        ctx.stroke();
      }
      dot(ctx, 0, 22, 5);
    } else if (kind === 'fiber') {
      for (let k = -1; k <= 1; k++) {
        ctx.beginPath();
        ctx.moveTo(-40, k * 12);
        ctx.bezierCurveTo(-10, k * 12 - 14, 10, k * 12 + 14, 40, k * 12);
        ctx.stroke();
      }
    } else if (kind === 'router') {
      roundRect(ctx, -38, -4, 76, 30, 6);
      ctx.stroke();
      line(ctx, -22, -4, -30, -34);
      line(ctx, 22, -4, 30, -34);
      [-18, -6, 6].forEach((dx) => dot(ctx, dx, 11, 3.5));
    } else if (kind === 'phone') {
      roundRect(ctx, -20, -36, 40, 72, 8);
      ctx.stroke();
      line(ctx, -6, -28, 6, -28);
    }
    ctx.restore();
  }

  // Üstteki yol haritası: durakların sırası ve iletinin bıraktığı iz
  function drawTrailMap(ctx, lt, t, cam) {
    const x0 = 760;
    const x1 = 1640;
    const y = 78;
    const cur = cam / W;
    const erase = (i) => progress(t, cue('jr-arrive', 1) + i * 0.12, cue('jr-arrive', 1) + i * 0.12 + 0.4);
    const ghost = after(t, 'jr-course', 1, 0.9);
    const a0 = progress(lt, 0.4, 1.2);
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < STOPS.length; i++) {
      const x = lerp(x0, x1, i / (STOPS.length - 1));
      const reached = cur >= i - 0.5;
      const e = i < STOPS.length - 1 ? erase(i) : 0;
      const live = reached ? 1 - e : 0;
      if (i > 0) {
        const xp = lerp(x0, x1, (i - 1) / (STOPS.length - 1));
        ctx.strokeStyle = rgba(COOL, 0.25 * a0);
        ctx.lineWidth = 2;
        line(ctx, xp + 18, y, x - 18, y);
        const seg = clamp(cur - (i - 1));
        if (seg > 0 && live > 0) {
          ctx.strokeStyle = rgba(FIRE, 0.8 * live * a0);
          ctx.lineWidth = 3;
          line(ctx, xp + 18, y, lerp(xp + 18, x - 18, seg), y);
        }
        if (ghost > 0) {
          ctx.save();
          ctx.setLineDash([3, 7]);
          ctx.strokeStyle = rgba(WARM, 0.7 * ghost);
          ctx.lineWidth = 2;
          line(ctx, xp + 18, y, x - 18, y);
          ctx.restore();
        }
      }
      const col = live > 0.5 ? (Math.abs(cur - i) < 0.5 ? C.flame : C.fire) : C.dim;
      stopIcon(ctx, STOPS[i].icon, x, y, 0.32, col, a0 * Math.max(0.35, live, ghost));
      // silinirken kalan küçük kıvılcımlar
      if (e > 0 && e < 1) {
        for (let k = 0; k < 6; k++) {
          ctx.fillStyle = rgba(FIRE, (1 - e) * 0.8);
          dot(ctx, x + (hash(i * 7 + k, 2) - 0.5) * 40 * e, y - 10 - e * 30 * hash(k, i), 2);
        }
      }
    }
    ctx.restore();
  }

  const BYTES = [['Y', '01011001'], ['a', '01100001'], ['r', '01110010']];

  function stopSwitch(ctx, lt, t) {
    // anahtar dizisi
    const gx = 860;
    const gy = 250;
    const cols = 26;
    const rows = 15;
    const sz = 30;
    const fast = 0.6 + 0.4 * after(t, 'jr-switch', 1, 0.6);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const on = noise(t * 9 * fast + r * 0.9 + c * 1.7, r * 41 + c) > 0.5;
        const x = gx + c * sz;
        const y = gy + r * sz;
        if (on) glow(ctx, x + 10, y + 10, 18, FIRE, 0.12);
        ctx.fillStyle = on ? rgba(FIRE, 0.95) : '#1a2236';
        roundRect(ctx, x, y, 20, 20, 4);
        ctx.fill();
      }
    }
    text(ctx, 'saniyede milyarlarca kez', gx + (cols * sz) / 2, gy + rows * sz + 50, { size: 30, family: 'serif', italic: true, color: C.muted, alpha: after(t, 'jr-switch', 1, 0.6) });
    // harfler bitlere
    BYTES.forEach(([ch, bits], i) => {
      const a = progress(t, cue('jr-switch', 2) + i * 0.35, cue('jr-switch', 2) + i * 0.35 + 0.5, ease.out);
      const y = 360 + i * 130;
      text(ctx, ch, 200, y, { size: 84, family: 'serif', weight: 700, color: C.cream, alpha: a });
      const b = progress(t, cue('jr-switch', 3) + i * 0.3, cue('jr-switch', 3) + i * 0.3 + 0.6);
      ctx.save();
      ctx.globalAlpha *= b;
      ctx.strokeStyle = C.dim;
      ctx.lineWidth = 2;
      line(ctx, 262, y, 320, y);
      ctx.restore();
      runs(ctx, bitRuns(bits, 46), 340, y + 16, { align: 'left', alpha: b });
    });
    const vy = after(t, 'jr-switch', 4, 0.6);
    chip(ctx, '1 = var', 330, 790, vy, { color: C.fire, border: C.fire, size: 30 });
    chip(ctx, '0 = yok', 560, 790, vy, { color: C.off, border: C.off, size: 30 });
  }

  const CODE = ['metni_al()', 'harfleri_sayıya_çevir()', 'paketle(alıcı = "Berk")', 'şifrele()', 'gönder()'];
  function stopProgram(ctx, lt, t) {
    panel(ctx, 600, 240, 900, 520, 1, C.line, 'rgba(8,12,24,0.95)');
    [0, 1, 2].forEach((k) => {
      ctx.fillStyle = ['#ff5f57', '#febc2e', '#28c840'][k];
      dot(ctx, 640 + k * 26, 272, 7);
    });
    text(ctx, 'mesaj_gönder.kod', 1050, 272, { size: 20, family: 'mono', color: C.muted });
    const run0 = cue('jr-program', 1) + 0.2;
    const cur = Math.floor((t - run0) / 0.55);
    CODE.forEach((s, i) => {
      const y = 350 + i * 76;
      const a = progress(lt, B('jr-program') + 0.3 + i * 0.12, B('jr-program') + 0.7 + i * 0.12);
      const active = cur === i;
      const done = cur > i;
      if (active) {
        ctx.fillStyle = 'rgba(255,165,71,0.14)';
        ctx.fillRect(612, y - 30, 876, 60);
        ctx.fillStyle = C.fire;
        ctx.fillRect(612, y - 30, 5, 60);
      }
      text(ctx, String(i + 1), 650, y, { size: 26, family: 'mono', color: C.dim, alpha: a });
      text(ctx, s, 700, y, { size: 34, family: 'mono', weight: 600, color: active ? C.flame : done ? C.cream : C.muted, align: 'left', alpha: a });
      if (done) text(ctx, '✓', 1440, y, { size: 28, weight: 700, color: C.ok, alpha: a });
    });
    // programı yazan insan
    const p = after(t, 'jr-program', 0, 0.6);
    person(ctx, 360, 760, 1.6, { color: '#1c2846' });
    ctx.save();
    ctx.globalAlpha *= p;
    glow(ctx, 360, 600, 200, DIGI, 0.12);
    ctx.restore();
    text(ctx, 'bir insan,', 360, 820, { size: 30, family: 'serif', italic: true, color: C.cream, alpha: p });
    text(ctx, 'önceden yazdı', 360, 862, { size: 30, family: 'serif', italic: true, color: C.cream, alpha: p });
  }

  function stopMemory(ctx, lt, t) {
    const cols = 13;
    const x0 = 520;
    const y0 = 300;
    const cw = 68;
    const fill = progress(t, cue('jr-memory', 1), cue('jr-memory', 1) + 2.2, ease.linear);
    text(ctx, 'telefonun belleği', W / 2, 220, { size: 30, family: 'serif', italic: true, color: C.muted, alpha: progress(lt, B('jr-memory') + 1, B('jr-memory') + 1.8) });
    for (let r = 0; r < 5; r++) {
      text(ctx, `${(0x2a40 + r * 16).toString(16).toUpperCase()}`, x0 - 30, y0 + r * (cw + 10) + cw / 2, { size: 18, family: 'mono', color: C.dim, align: 'right' });
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const x = x0 + c * (cw + 8);
        const y = y0 + r * (cw + 10);
        const has = idx < MSG.length && idx / MSG.length < fill;
        roundRect(ctx, x, y, cw, cw, 8);
        ctx.fillStyle = has ? 'rgba(255,165,71,0.16)' : '#111a2c';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = has ? rgba(FIRE, 0.7) : C.line;
        ctx.stroke();
        if (has) text(ctx, MSG[idx] === ' ' ? '␣' : MSG[idx], x + cw / 2, y + cw / 2 + 2, { size: 34, family: 'serif', color: C.cream });
      }
    }
  }

  function drawRouterBox(ctx, x, y, s, t, a) {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.strokeStyle = '#3a4664';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    line(ctx, -60, -30, -80, -120);
    line(ctx, 60, -30, 80, -120);
    roundRect(ctx, -110, -40, 220, 70, 14);
    ctx.fillStyle = '#141c2e';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.stroke();
    for (let k = 0; k < 4; k++) {
      const on = noise(t * 5 + k * 2, k) > 0.35;
      ctx.fillStyle = on ? (k === 0 ? C.ok : C.digital) : '#1f2a40';
      dot(ctx, -70 + k * 30, -5, 6);
    }
    ctx.restore();
  }

  function stopWifi(ctx, lt, t) {
    // oda köşesi
    ctx.strokeStyle = '#18213a';
    ctx.lineWidth = 3;
    line(ctx, 0, 820, 1300, 820);
    line(ctx, 1300, 820, 1920, 1000);
    line(ctx, 1300, 820, 1300, 0);
    ctx.fillStyle = '#121a2e';
    ctx.fillRect(1180, 600, 380, 16);
    drawRouterBox(ctx, 1380, 560, 1, t, 1);
    text(ctx, 'evdeki küçük kutu', 1380, 680, { size: 28, family: 'serif', italic: true, color: C.muted, alpha: after(t, 'jr-wifi', 1, 0.5) });
    // telefon
    ctx.save();
    ctx.translate(420, 560);
    roundRect(ctx, -60, -120, 120, 240, 20);
    ctx.fillStyle = '#0b0e16';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2a3247';
    ctx.stroke();
    ctx.fillStyle = '#16233c';
    roundRect(ctx, -50, -108, 100, 216, 14);
    ctx.fill();
    ctx.restore();
    // dalgalar
    const wa = after(t, 'jr-wifi', 0, 0.4);
    if (wa > 0) {
      ctx.save();
      ctx.lineWidth = 4;
      for (let k = 0; k < 7; k++) {
        const u = (t * 0.55 + k / 7) % 1;
        const r = 80 + u * 900;
        ctx.strokeStyle = rgba(DIGI, wa * 0.55 * (1 - u));
        ctx.beginPath();
        ctx.arc(420, 560, r, -0.35, 0.35);
        ctx.stroke();
      }
      ctx.restore();
      // ileti paketi dalgaya biner
      const p = progress(t, cue('jr-wifi', 0) + 0.3, cue('jr-wifi', 1) + 0.6, ease.inOut);
      const px = lerp(500, 1280, p);
      const py = 560 - Math.sin(p * Math.PI) * 60;
      glow(ctx, px, py, 70, FIRE, 0.5);
      ctx.fillStyle = C.flame;
      dot(ctx, px, py, 12);
    }
  }

  function scenery(ctx, kind, x0, ybase, t) {
    if (kind === 0) {
      for (let i = 0; i < 26; i++) {
        const bw = 50 + hash(i, 21) * 50;
        const bh = 70 + hash(i, 22) * 170;
        const x = x0 + i * 74;
        ctx.fillStyle = '#0b1222';
        ctx.fillRect(x, ybase - bh, bw, bh);
        for (let k = 0; k < 4; k++) if (hash(i * 9 + k, 23) > 0.6) {
          ctx.fillStyle = 'rgba(255,200,120,0.5)';
          ctx.fillRect(x + 8 + (k % 2) * 20, ybase - bh + 14 + Math.floor(k / 2) * 24, 7, 10);
        }
      }
    } else if (kind === 1) {
      ctx.fillStyle = '#0d1a1a';
      ctx.beginPath();
      ctx.moveTo(x0, ybase);
      for (let x = 0; x <= W; x += 20) ctx.lineTo(x0 + x, ybase - 60 - 40 * noise(x / 300, 5));
      ctx.lineTo(x0 + W, ybase);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(127,224,163,0.12)';
      ctx.lineWidth = 2;
      for (let k = 0; k < 10; k++) line(ctx, x0 + k * 190, ybase, x0 + k * 190 + 120, ybase - 40);
    } else {
      ctx.fillStyle = '#0a1830';
      ctx.fillRect(x0, ybase - 70, W, 70);
      ctx.strokeStyle = 'rgba(124,200,255,0.3)';
      ctx.lineWidth = 2.5;
      for (let r = 0; r < 3; r++) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 12) ctx.lineTo(x0 + x, ybase - 55 + r * 20 + Math.sin(x / 40 + t * 2 + r) * 5);
        ctx.stroke();
      }
    }
  }

  function stopFiber(ctx, lt, t) {
    const ground = 470;
    // yüzeydeki manzara kayar: şehir → ova → deniz
    const s1 = progress(t, cue('jr-fiber', 2) + 0.2, cue('jr-fiber', 3) + 0.2);
    const s2 = progress(t, cue('jr-fiber', 3) + 0.2, cue('jr-fiber', 4) + 0.3);
    const off = (s1 + s2) * W;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, ground);
    ctx.clip();
    for (let k = 0; k < 3; k++) scenery(ctx, k, k * W - off, ground, t);
    ctx.restore();
    const lab = [['şehirler', 2], ['ovalar', 3], ['denizler', 4]];
    lab.forEach(([s, k], i) => {
      const a = after(t, 'jr-fiber', k, 0.4) * (i < 2 ? 1 - after(t, 'jr-fiber', k + 1, 0.3) : 1);
      text(ctx, s, W / 2, 150, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: a });
    });
    // toprak kesiti
    const soil = ctx.createLinearGradient(0, ground, 0, H);
    soil.addColorStop(0, '#1a1410');
    soil.addColorStop(1, '#0b0805');
    ctx.fillStyle = soil;
    ctx.fillRect(0, ground, W, H - ground);
    ctx.fillStyle = '#2a2a30';
    ctx.fillRect(0, ground - 6, W, 10);
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = 'rgba(80,60,40,0.4)';
      dot(ctx, hash(i, 31) * W, ground + 40 + hash(i, 32) * 500, 2 + hash(i, 33) * 4);
    }
    // boru ve cam lif
    const fy = 720;
    ctx.fillStyle = '#10151f';
    roundRect(ctx, -20, fy - 44, W + 40, 88, 44);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#2a3450';
    ctx.stroke();
    const enter = after(t, 'jr-fiber', 0, 0.8);
    for (let k = -2; k <= 2; k++) {
      ctx.strokeStyle = rgba(DIGI, 0.18 + 0.1 * enter);
      ctx.lineWidth = 3;
      line(ctx, 0, fy + k * 12, W, fy + k * 12);
    }
    if (enter > 0) {
      for (let j = 0; j < 14; j++) {
        const u = (t * (0.9 + 0.3 * after(t, 'jr-fiber', 1, 0.5)) + j / 14) % 1;
        const x = u * W;
        const k = (j % 5) - 2;
        glow(ctx, x, fy + k * 12, 60, [200, 235, 255], 0.5 * enter);
        ctx.fillStyle = rgba([235, 248, 255], enter);
        ctx.fillRect(x - 30, fy + k * 12 - 2, 60, 4);
      }
    }
    text(ctx, 'sokağın altındaki ince cam lifler', W / 2, 860, { size: 32, family: 'serif', italic: true, color: C.muted, alpha: enter });
    chip(ctx, 'ışık olup', W / 2, 940, after(t, 'jr-fiber', 1, 0.4), { color: C.digital, border: C.digital, size: 28 });
  }

  const NODES = [
    [300, 540], [520, 360], [540, 720], [760, 260], [800, 540], [780, 820], [1020, 380],
    [1060, 680], [1260, 260], [1280, 540], [1270, 820], [1480, 400], [1500, 700], [1660, 540],
  ];
  const EDGES = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 6], [4, 6], [4, 7], [5, 7], [6, 8], [6, 9], [7, 9], [7, 10], [8, 11], [9, 11], [9, 12], [10, 12], [11, 13], [12, 13], [3, 8], [5, 10]];
  const PATH = [0, 1, 4, 6, 9, 12, 13];
  function stopRouters(ctx, lt, t) {
    const hop0 = cue('jr-routers', 1);
    const hop = 0.42;
    const pos = clamp((t - hop0) / hop, 0, PATH.length - 1);
    const hi = new Set();
    for (let i = 0; i < Math.floor(pos); i++) hi.add(`${PATH[i]}-${PATH[i + 1]}`);
    EDGES.forEach(([a, b]) => {
      const lit = hi.has(`${a}-${b}`) || hi.has(`${b}-${a}`);
      ctx.strokeStyle = lit ? rgba(FIRE, 0.9) : rgba(COOL, 0.25);
      ctx.lineWidth = lit ? 5 : 2.5;
      line(ctx, NODES[a][0], NODES[a][1], NODES[b][0], NODES[b][1]);
    });
    NODES.forEach(([x, y], i) => {
      const onPath = PATH.indexOf(i);
      const reached = onPath >= 0 && pos >= onPath;
      if (reached) glow(ctx, x, y, 70, FIRE, 0.3);
      ctx.fillStyle = '#141c2e';
      dot(ctx, x, y, 26);
      ctx.lineWidth = 3;
      ctx.strokeStyle = reached ? C.fire : '#3a4664';
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.stroke();
      stopIcon(ctx, 'router', x, y + 2, 0.32, reached ? C.flame : C.muted, 1);
      // tabela: bir sonraki yönü gösteren ok
      if (onPath >= 0 && onPath < PATH.length - 1) {
        const k = progress(t, hop0 + onPath * hop - 0.15, hop0 + onPath * hop + 0.1);
        if (k > 0) {
          const [nx, ny] = NODES[PATH[onPath + 1]];
          const ang = Math.atan2(ny - y, nx - x);
          ctx.save();
          ctx.globalAlpha *= k;
          ctx.translate(x, y - 50);
          ctx.rotate(ang);
          ctx.fillStyle = C.flame;
          poly(ctx, [[-16, -7], [6, -7], [6, -13], [18, 0], [6, 13], [6, 7], [-16, 7]]);
          ctx.fill();
          ctx.restore();
        }
      }
    });
    // ileti
    if (t > hop0 - 0.2) {
      const i = Math.min(PATH.length - 2, Math.floor(pos));
      const f = ease.inOut(pos - i);
      const [ax, ay] = NODES[PATH[i]];
      const [bx, by] = NODES[PATH[i + 1]];
      const x = lerp(ax, bx, pos >= PATH.length - 1 ? 1 : f);
      const y = lerp(ay, by, pos >= PATH.length - 1 ? 1 : f);
      glow(ctx, x, y, 70, FIRE, 0.6);
      ctx.fillStyle = C.flame;
      dot(ctx, x, y, 11);
    }
    text(ctx, 'haritaya bakan bir yolcu gibi', W / 2, 960, { size: 32, family: 'serif', italic: true, color: C.muted, alpha: after(t, 'jr-routers', 1, 0.5) });
    chip(ctx, 'her durakta: saniyenin binde biri', W / 2, 160, after(t, 'jr-routers', 2, 0.5), { color: C.digital, border: C.digital, size: 28 });
  }

  function stopDb(ctx, lt, t) {
    // silindir
    const cx = 470;
    const cy = 540;
    const glowA = after(t, 'jr-db', 1, 0.5);
    glow(ctx, cx, cy, 300, DIGI, 0.12 + 0.12 * glowA);
    for (let k = 3; k >= 0; k--) {
      const y = cy - 150 + k * 90;
      ctx.fillStyle = '#121b2e';
      ctx.fillRect(cx - 160, y, 320, 90);
      ctx.beginPath();
      ctx.ellipse(cx, y + 90, 160, 40, 0, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = rgba(DIGI, 0.5);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(cx, y + 90, 160, 40, 0, 0, Math.PI);
      ctx.stroke();
    }
    ctx.fillStyle = '#18243c';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 150, 160, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(DIGI, 0.6);
    ctx.stroke();
    line(ctx, cx - 160, cy - 150, cx - 160, cy + 210);
    line(ctx, cx + 160, cy - 150, cx + 160, cy + 210);
    // tablo
    const tx = 800;
    const ty = 320;
    const cols = [['zaman', 130], ['gönderen', 170], ['alıcı', 150], ['ileti', 520]];
    panel(ctx, tx, ty, 1000, 400, 1, C.line, 'rgba(8,12,24,0.95)', 14);
    let x = tx + 30;
    cols.forEach(([h, w]) => {
      text(ctx, h.toLocaleUpperCase('tr-TR'), x, ty + 44, { size: 20, weight: 700, spacing: 3, color: C.muted, align: 'left' });
      x += w;
    });
    const rowsData = [
      ['23:41', 'Berk', 'Elif', 'yarın sınav var...'],
      ['23:42', 'Berk', 'Elif', 'hiçbir şey anlamadım'],
      ['00:12', 'Elif', 'Berk', MSG],
    ];
    rowsData.forEach((row, r) => {
      const y = ty + 110 + r * 80;
      const isNew = r === 2;
      const a = isNew ? after(t, 'jr-db', 1, 0.5) : 1;
      if (isNew && a > 0) {
        ctx.fillStyle = `rgba(255,165,71,${0.16 * a})`;
        ctx.fillRect(tx + 10, y - 32, 980, 64);
        // iletiden tabloya akan ışık
        const p = progress(t, cue('jr-db', 1) - 0.3, cue('jr-db', 1) + 0.3);
        if (p > 0 && p < 1) {
          glow(ctx, lerp(cx + 160, tx + 20, p), lerp(cy, y, p), 60, FIRE, 0.6);
        }
      }
      let xx = tx + 30;
      row.forEach((v, i) => {
        text(ctx, v, xx, y, { size: 26, family: i === 3 ? 'serif' : 'mono', italic: i === 3, color: isNew ? C.cream : C.muted, align: 'left', alpha: a });
        xx += cols[i][1];
      });
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      line(ctx, tx + 20, y + 40, tx + 980, y + 40);
    });
    text(ctx, 'kaydedildi', tx + 500, ty + 460, { size: 30, family: 'serif', italic: true, color: C.ok, alpha: after(t, 'jr-db', 1, 0.6) });
  }

  const CIPH = '#Q7x!kZ9@pL2$wR8%nV4&mT1*';
  function stopLock(ctx, lt, t) {
    const enc = progress(t, cue('jr-lock', 0) + 0.2, cue('jr-lock', 0) + 1.6, ease.linear);
    const shown = [...MSG].map((ch, i) => (i / MSG.length < enc ? CIPH[(i * 7 + Math.floor(t * 6)) % CIPH.length] : ch)).join('');
    panel(ctx, 360, 440, 1200, 160, 1, enc > 0.99 ? C.error : C.line, 'rgba(8,12,24,0.95)', 18);
    text(ctx, shown, W / 2, 522, { size: 56, family: enc > 0 ? 'mono' : 'serif', color: enc > 0.5 ? C.muted : C.cream });
    // kilit
    const lk = after(t, 'jr-lock', 0, 0.5);
    ctx.save();
    ctx.translate(W / 2, 300);
    const shut = progress(t, cue('jr-lock', 0) + 1.4, cue('jr-lock', 0) + 1.8, ease.back);
    ctx.globalAlpha *= lk;
    glow(ctx, 0, 0, 140, FIRE, 0.25 * shut);
    roundRect(ctx, -60, -10, 120, 96, 14);
    ctx.fillStyle = '#1a2236';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = C.fire;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -10 - (1 - shut) * 30, 40, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = C.fire;
    dot(ctx, 0, 30, 10);
    ctx.restore();
    // yoldaki göz
    const eye = after(t, 'jr-lock', 1, 0.5);
    icon(ctx, 'eye', 1560, 780, 1.4, C.error, eye);
    text(ctx, 'yoldaki biri', 1560, 860, { size: 28, family: 'serif', italic: true, color: C.muted, alpha: eye });
    text(ctx, 'anlamsız bir karmaşa', W / 2, 680, { size: 36, family: 'serif', italic: true, color: C.error, alpha: after(t, 'jr-lock', 2, 0.5) });
  }

  function stopArrive(ctx, lt, t) {
    // Berk'in telefonu
    const zoom = 1 + 0.55 * bp(lt, 'jr-left', 0.2, 2.2);
    const out = 1 - after(t, 'jr-course', 0, 0.6) * 0.45;
    ctx.save();
    ctx.translate(1200, 560);
    ctx.scale(zoom * out, zoom * out);
    const bx = 0;
    roundRect(ctx, bx - 190, -380, 380, 760, 40);
    ctx.fillStyle = '#0b0e16';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2a3247';
    ctx.stroke();
    roundRect(ctx, bx - 172, -362, 344, 724, 30);
    ctx.fillStyle = '#0d1424';
    ctx.fill();
    ctx.fillStyle = '#131c30';
    ctx.fillRect(bx - 172, -310, 344, 70);
    ctx.fillStyle = C.fire;
    dot(ctx, bx - 124, -275, 22);
    text(ctx, 'E', bx - 124, -274, { size: 22, weight: 800, color: '#0d1424' });
    text(ctx, 'Elif', bx - 90, -275, { size: 24, weight: 700, color: C.cream, align: 'left' });
    const arr = after(t, 'jr-arrive', 0, 0.5);
    if (arr > 0) {
      const warm = after(t, 'jr-left', 1, 0.8);
      glow(ctx, bx - 40, -120, 260, WARM, 0.25 * warm);
      bubble(ctx, MSG, bx - 150, -190 + (1 - arr) * 30, 'left', arr, { bg: warm > 0 ? '#2a2a3a' : '#1d2940', size: 24, maxW: 260 });
    }
    ctx.restore();
    // yol izi: dokuz durağın küçük simgeleri, sonra silinir
    const x0 = 160;
    const x1 = 860;
    const ghost = after(t, 'jr-course', 1, 0.8);
    STOPS.slice(0, 8).forEach((s, i) => {
      const x = lerp(x0, x1, i / 7);
      const y = 560 + Math.sin(i * 1.3) * 120;
      const e = progress(t, cue('jr-arrive', 1) + i * 0.12, cue('jr-arrive', 1) + i * 0.12 + 0.5);
      const a = (1 - e) * after(t, 'jr-arrive', 0, 0.6) + ghost * 0.6;
      if (i > 0) {
        const xp = lerp(x0, x1, (i - 1) / 7);
        const yp = 560 + Math.sin((i - 1) * 1.3) * 120;
        ctx.save();
        ctx.setLineDash(ghost > 0 ? [4, 8] : []);
        ctx.strokeStyle = rgba(ghost > 0 ? WARM : FIRE, 0.6 * a);
        ctx.lineWidth = 3;
        line(ctx, xp, yp, x, y);
        ctx.restore();
      }
      stopIcon(ctx, s.icon, x, y, 0.55, ghost > 0 ? C.flame : C.fire, a);
      if (e > 0 && e < 1) {
        for (let k = 0; k < 8; k++) {
          ctx.fillStyle = rgba(FIRE, (1 - e) * 0.7);
          dot(ctx, x + (hash(i * 11 + k, 5) - 0.5) * 80 * e, y - e * 60 * hash(k, i + 3), 2.4);
        }
      }
    });
    const pathEnd = [x1 + 40, 560];
    if (ghost > 0) {
      ctx.save();
      ctx.setLineDash([4, 8]);
      ctx.strokeStyle = rgba(WARM, 0.5 * ghost);
      ctx.lineWidth = 3;
      line(ctx, pathEnd[0] - 40, 560 + Math.sin(7 * 1.3) * 120, 1010, 440);
      ctx.restore();
      text(ctx, 'o silinen iz', 510, 860, { size: 44, family: 'serif', italic: true, color: C.flame, alpha: ghost });
    }
    text(ctx, 'küçük, sıcak bir cümle', 1200, 960, { size: 34, family: 'serif', italic: true, color: C.cream, alpha: after(t, 'jr-left', 1, 0.6) * (1 - after(t, 'jr-course', 0, 0.4)) });
  }

  const STOP_DRAW = [stopSwitch, stopProgram, stopMemory, stopWifi, stopFiber, stopRouters, stopDb, stopLock, stopArrive];

  DRAW.journey = function sceneJourney(ctx, lt, t) {
    const cam = camX(lt);
    // arka plan: hafif ızgara kayar
    ctx.save();
    ctx.strokeStyle = 'rgba(124,200,255,0.04)';
    ctx.lineWidth = 1;
    const off = -(cam * 0.3) % 80;
    for (let x = off; x < W; x += 80) line(ctx, x, 0, x, H);
    for (let y = 0; y < H; y += 80) line(ctx, 0, y, W, y);
    ctx.restore();
    STOP_DRAW.forEach((fn, k) => {
      const dx = k * W - cam;
      if (Math.abs(dx) >= W) return;
      ctx.save();
      ctx.translate(dx, 0);
      ctx.globalAlpha *= 1 - Math.abs(dx) / W * 0.6;
      fn(ctx, lt, t);
      // durak başlığı
      text(ctx, `${k + 1} · ${STOPS[k].title}`, 120, 170, { size: 22, weight: 700, spacing: 6, color: C.muted, align: 'left' });
      ctx.restore();
    });
    kicker(ctx, 'İLETİNİN YOLCULUĞU', progress(lt, 0.3, 1.2), 120, 66);
    drawTrailMap(ctx, lt, t, cam);
  };

  // ---------------------------------------------------------------------------
  // 3 · Malabadi Köprüsü: görünen kemer, görünmeyen denge
  // ---------------------------------------------------------------------------

  const BR = { cx: 960, water: 830, span: 740, rise: 430, ring: 74, n: 31 };
  // sivri kemer: iki daire yayı. u: -1 (sol ayak) → 0 (tepe) → 1 (sağ ayak); r: içten (0) dışa (1)
  function archPt(u, r) {
    const half = BR.span / 2 + r * BR.ring;
    const rise = BR.rise + r * BR.ring * 1.15;
    const side = u < 0 ? -1 : 1;
    const a = Math.abs(u);
    // her yarım yay: karşı taraftaki bir merkezden çizilen daire parçası
    const R = (half * half + rise * rise) / (2 * half);
    const ccx = BR.cx - side * (R - half);
    const top = Math.atan2(rise, BR.cx - ccx);
    const ang = lerp(side < 0 ? Math.PI : 0, top, 1 - a);
    return [ccx + Math.cos(ang) * R, BR.water - Math.sin(ang) * R];
  }
  // köprü sırtı (yol): kıyılardan tepeye yükselen eğim
  const deckY = (x) => {
    const d = Math.abs(x - BR.cx) / 860;
    return lerp(BR.water - BR.rise - BR.ring * 1.15 - 70, 600, Math.min(1, d * d * 1.1));
  };

  function drawBridge(ctx, t, opt = {}) {
    const build = opt.build ?? 1;
    const stoneCol = opt.color ?? [185, 162, 124];
    const ghost = opt.ghost ?? 0;
    const alpha = opt.alpha ?? 1;
    ctx.save();
    ctx.globalAlpha *= alpha;
    // gövde (kemer dışındaki duvar): kıyıdan kıyıya
    const body = progress(build, 0.6, 1);
    if (body > 0) {
      ctx.save();
      ctx.globalAlpha *= body;
      ctx.beginPath();
      ctx.moveTo(60, BR.water + 10);
      ctx.lineTo(60, deckY(60));
      for (let x = 60; x <= 1860; x += 10) ctx.lineTo(x, deckY(x));
      ctx.lineTo(1860, BR.water + 10);
      // kemer boşluğunu çıkar
      const [lx] = archPt(-1, 0);
      ctx.lineTo(BR.cx + (BR.cx - lx), BR.water + 10);
      for (let i = 0; i <= 40; i++) {
        const [x, y] = archPt(1 - (i / 40) * 2, 0);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(lx, BR.water + 10);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, 300, 0, BR.water);
      g.addColorStop(0, rgba(stoneCol.map((c) => c * 0.82)));
      g.addColorStop(1, rgba(stoneCol.map((c) => c * 0.55)));
      ctx.fillStyle = ghost > 0 ? `rgba(124,200,255,${0.06 * ghost})` : g;
      ctx.fill('evenodd');
      if (ghost > 0) {
        ctx.strokeStyle = rgba(DIGI, 0.5 * ghost);
        ctx.setLineDash([6, 10]);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
      }
      // taş sıraları
      if (!ghost) {
        ctx.save();
        ctx.clip('evenodd');
        ctx.strokeStyle = 'rgba(40,28,18,0.35)';
        ctx.lineWidth = 1.5;
        for (let y = 320; y < BR.water; y += 34) line(ctx, 0, y, W, y);
        for (let y = 320, r = 0; y < BR.water; y += 34, r++) {
          for (let x = (r % 2) * 40; x < W; x += 80) line(ctx, x, y, x, y + 34);
        }
        ctx.restore();
        // yan odacıklar (iki yandaki küçük açıklıklar)
        [-1, 1].forEach((s) => {
          const x = BR.cx + s * 560;
          ctx.fillStyle = 'rgba(15,10,6,0.85)';
          roundRect(ctx, x - 26, deckY(x) + 90, 52, 80, [26, 26, 0, 0]);
          ctx.fill();
        });
      }
      ctx.restore();
    }
    // kemer taşları (voussoir): ayaklardan tepeye sırayla yerleşir
    const n = BR.n;
    for (let i = 0; i < n; i++) {
      const u0 = -1 + (2 * i) / n;
      const u1 = -1 + (2 * (i + 1)) / n;
      const mid = (i + 0.5) / n;
      const order = Math.min(mid, 1 - mid) * 2; // 0 ayakta, 1 tepede
      const placed = progress(build, order * 0.55, order * 0.55 + 0.08);
      if (placed <= 0) continue;
      const isKey = i === (n - 1) / 2;
      const lift = opt.keyLift && isKey ? opt.keyLift : 0;
      const p = [archPt(u0, 0), archPt(u1, 0), archPt(u1, 1), archPt(u0, 1)].map(([x, y]) => [x, y - (1 - placed) * 40 - lift]);
      poly(ctx, p);
      ctx.closePath();
      if (ghost) {
        ctx.strokeStyle = rgba(isKey ? WARM : DIGI, 0.8 * ghost);
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        const shade = 0.88 + 0.12 * hash(i, 4);
        ctx.fillStyle = rgba(stoneCol.map((c) => c * shade));
        ctx.globalAlpha *= placed;
        ctx.fill();
        ctx.strokeStyle = 'rgba(40,28,18,0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha /= placed;
      }
      if (isKey && opt.keyGlow) {
        ctx.save();
        ctx.globalAlpha *= opt.keyGlow;
        ctx.fillStyle = 'rgba(255,190,110,0.55)';
        poly(ctx, p);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  function drawRiver(ctx, t, opt = {}) {
    const y = BR.water;
    const g = ctx.createLinearGradient(0, y, 0, H);
    g.addColorStop(0, opt.top ?? '#1d3a4a');
    g.addColorStop(1, opt.bottom ?? '#081620');
    ctx.fillStyle = g;
    ctx.fillRect(0, y, W, H - y);
    ctx.strokeStyle = 'rgba(255,220,170,0.12)';
    ctx.lineWidth = 2;
    for (let k = 0; k < 18; k++) {
      const yy = y + 14 + k * 14;
      const x = ((hash(k, 3) * W + t * (20 + k * 2)) % (W + 300)) - 150;
      line(ctx, x, yy, x + 80 + hash(k, 4) * 120, yy);
    }
  }

  function nearBank(ctx, a = 1) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const g = ctx.createLinearGradient(0, 900, 0, H);
    g.addColorStop(0, '#1f1810');
    g.addColorStop(1, '#0c0906');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 896);
    for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 900 + 8 * Math.sin(x / 90) + 6 * noise(x / 60, 9));
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function duskSky(ctx, t, warmth = 1) {
    const sky = ctx.createLinearGradient(0, 0, 0, BR.water);
    sky.addColorStop(0, '#0d1430');
    sky.addColorStop(0.55, rgba(mixc([30, 30, 60], [92, 52, 72], warmth)));
    sky.addColorStop(1, rgba(mixc([40, 44, 70], [214, 128, 84], warmth)));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, BR.water);
    glow(ctx, 1500, BR.water - 40, 700, [255, 170, 100], 0.25 * warmth);
    drawStars(ctx, t, 0.5 * (1 - warmth * 0.6), 360, 41, 80);
    const hill = (x) => BR.water - 120 - 90 * noise(x / 380, 12) - 30 * noise(x / 120, 13);
    fillRidge(ctx, hill, '#1c1a2a');
  }

  // Zanaatkâr silueti ve aleti
  function craftsman(ctx, x, y, s, kind, a, col = '#140e0a') {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    person(ctx, x, y, s, { color: col, apron: kind !== 'iskele', apronColor: '#2a1d14' });
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    if (kind === 'taşçı') {
      line(ctx, 18, -90, 46, -120);
      ctx.fillRect(40, -132, 22, 14);
    } else if (kind === 'kalıpçı') {
      ctx.fillRect(18, -110, 70, 10);
      line(ctx, 20, -100, 20, -60);
    } else if (kind === 'harççı') {
      poly(ctx, [[22, -80], [54, -80], [48, -50], [28, -50]]);
      ctx.closePath();
      ctx.fill();
      line(ctx, -20, -90, -44, -64);
    } else if (kind === 'dülger') {
      line(ctx, 18, -96, 44, -138);
      ctx.fillRect(36, -146, 26, 10);
    } else if (kind === 'iskele') {
      line(ctx, 34, 0, 50, -180);
      line(ctx, 70, 0, 86, -180);
      for (let k = 0; k < 6; k++) line(ctx, 37 + k * 2.6, -k * 30 - 10, 73 + k * 2.6, -k * 30 - 10);
    }
    ctx.restore();
  }

  const MASONS = [
    { kind: 'taşçı', x: 330, k: 1 },
    { kind: 'kalıpçı', x: 560, k: 2 },
    { kind: 'harççı', x: 1360, k: 3 },
    { kind: 'dülger', x: 1590, k: 4 },
    { kind: 'iskele', x: 1780, k: 5 },
  ];
  const masonY = 905;

  DRAW.bridge = function sceneBridge(ctx, lt, t) {
    duskSky(ctx, t, 1);
    const build = bp(lt, 'br-intro', 0.3, 4.2, ease.inOut);
    drawRiver(ctx, t);
    // temel: su altındaki ayaklar (forces 3. öbekte görünür)
    const found = after(t, 'br-forces', 3, 0.6) * (1 - after(t, 'br-master', 0, 0.6));
    [-1, 1].forEach((s) => {
      const [x] = archPt(s, 0.5);
      ctx.fillStyle = `rgba(150,120,90,${0.25 + 0.6 * found})`;
      ctx.fillRect(x - 70, BR.water - 4, 140, 130);
      if (found > 0) {
        ctx.strokeStyle = rgba(WARM, 0.8 * found);
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 70, BR.water - 4, 140, 130);
      }
    });
    const keyGlow = Math.max(after(t, 'br-forces', 2, 0.5) * (1 - after(t, 'br-forces', 3, 0.5)), bp(lt, 'br-master', 0.5, 1.2) * (1 - after(t, 'br-team', 0, 0.5)));
    const keyLift = 120 * Math.sin(Math.PI * bp(lt, 'br-master', 0.6, 3.2));
    drawBridge(ctx, t, { build, keyGlow, keyLift });
    // yansıma
    ctx.save();
    ctx.globalAlpha *= 0.12 * build;
    ctx.translate(0, BR.water * 2);
    ctx.scale(1, -1);
    ctx.beginPath();
    ctx.rect(0, 0, W, BR.water);
    ctx.clip();
    drawBridge(ctx, t, { build, color: [120, 140, 160] });
    ctx.restore();

    nearBank(ctx, 1);
    text(ctx, 'MALABADİ KÖPRÜSÜ', 120, 96, { size: 24, weight: 700, spacing: 8, color: C.cream, align: 'left', alpha: after(t, 'br-intro', 3, 0.6) });
    text(ctx, 'Silvan · Batman Çayı · 1147', 120, 136, { size: 26, family: 'serif', italic: true, color: C.cream, align: 'left', alpha: after(t, 'br-intro', 0, 0.6) * 0.9 });

    // uzaktan bakan biri
    const see = bp(lt, 'br-see', 0, 1) * (1 - after(t, 'br-forces', 0, 0.5));
    if (see > 0) {
      person(ctx, 150, 980, 1.2, { color: '#090709', tool: 'staff' });
      ctx.save();
      ctx.globalAlpha *= see;
      ctx.fillStyle = 'rgba(255,230,190,0.07)';
      poly(ctx, [[175, 820], [1700, 300], [1700, 900]]);
      ctx.fill();
      ctx.restore();
      text(ctx, 'yalnızca bir taş kemer', 640, 230, { size: 42, family: 'serif', italic: true, color: C.cream, alpha: after(t, 'br-see', 1, 0.6) * (1 - after(t, 'br-forces', 0, 0.5)) });
    }
    // görünmeyen kuvvetler
    const f1 = after(t, 'br-forces', 1, 0.6) * (1 - after(t, 'br-master', 0, 0.6));
    if (f1 > 0) {
      for (let side = -1; side <= 1; side += 2) {
        for (let j = 0; j < 6; j++) {
          const u = side * (0.05 + j * 0.16);
          const [x0, y0] = archPt(u, 0.5);
          const [x1, y1] = archPt(u + side * 0.12, 0.5);
          const flow = (t * 0.8 + j / 6) % 1;
          ctx.save();
          ctx.globalAlpha *= f1;
          ctx.strokeStyle = 'rgba(255,200,120,0.9)';
          ctx.lineWidth = 4;
          line(ctx, x0, y0, x1, y1);
          const ang = Math.atan2(y1 - y0, x1 - x0);
          ctx.translate(x1, y1);
          ctx.rotate(ang);
          ctx.fillStyle = 'rgba(255,200,120,0.9)';
          poly(ctx, [[0, 0], [-14, -7], [-14, 7]]);
          ctx.fill();
          ctx.restore();
          glow(ctx, lerp(x0, x1, flow), lerp(y0, y1, flow), 24, FIRE, 0.5 * f1);
        }
      }
      chip(ctx, 'basınç', 560, 360, f1, { color: C.flame, border: C.fire, size: 26 });
    }
    const f2 = after(t, 'br-forces', 2, 0.6) * (1 - after(t, 'br-master', 0, 0.6));
    if (f2 > 0) {
      const [kx, ky] = archPt(0, 0.5);
      for (let k = 0; k < 8; k++) {
        const ang = Math.PI * (0.15 + 0.7 * (k / 7));
        const r0 = 50;
        const r1 = 90 + 20 * Math.sin(t * 3 + k);
        ctx.strokeStyle = rgba(WARM, 0.7 * f2);
        ctx.lineWidth = 3;
        line(ctx, kx + Math.cos(ang) * r0, ky + Math.sin(ang) * r0, kx + Math.cos(ang) * r1, ky + Math.sin(ang) * r1);
      }
      chip(ctx, 'kilit taşı', kx, ky - 130, f2, { color: C.flame, border: C.fire, size: 26 });
    }
    chip(ctx, 'temel', BR.cx - BR.span / 2 - 160, BR.water + 160, found, { color: C.flame, border: C.fire, size: 26 });
    // usta: hangi taş hangi yükü
    const m = bp(lt, 'br-master', 0, 0.6) * (1 - after(t, 'br-team', 0, 0.5));
    text(ctx, 'hangi taş, hangi yükü taşıyacak?', W / 2, 200, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: m * after(t, 'br-master', 1, 0.6) });
    // ustalar ve kalıp
    const team = after(t, 'br-team', 0, 0.8) * (1 - after(t, 'br-cross', 0, 0.8));
    if (team > 0) {
      // ahşap kalıp (kemer iskeleti)
      ctx.save();
      ctx.globalAlpha *= team * 0.8;
      ctx.strokeStyle = '#5a3e26';
      ctx.lineWidth = 6;
      for (let i = 0; i <= 12; i++) {
        const [x, y] = archPt(-1 + (2 * i) / 12, -0.05);
        line(ctx, x, y, x, BR.water);
      }
      line(ctx, BR.cx - BR.span / 2, BR.water - 120, BR.cx + BR.span / 2, BR.water - 120);
      ctx.restore();
    }
    MASONS.forEach((mm, i) => {
      const a = after(t, 'br-team', mm.k, 0.5) * (1 - after(t, 'br-cross', 0, 0.8));
      craftsman(ctx, mm.x, masonY, 1.25, mm.kind, a);
      text(ctx, mm.kind === 'iskele' ? 'iskele kurucusu' : mm.kind, mm.x, masonY + 50, { size: 28, family: 'serif', italic: true, color: C.cream, alpha: a });
    });
    // uyum: ustalar arasında bağlar
    const har = after(t, 'br-harmony', 1, 0.8) * (1 - after(t, 'br-cross', 0, 0.8));
    if (har > 0) {
      ctx.save();
      ctx.strokeStyle = rgba(WARM, 0.7 * har);
      ctx.lineWidth = 2.5;
      for (let i = 0; i < MASONS.length; i++) {
        for (let j = i + 1; j < MASONS.length; j++) {
          const pulse = 0.5 + 0.5 * Math.sin(t * 2 + i + j);
          ctx.globalAlpha = har * (0.35 + 0.4 * pulse);
          ctx.beginPath();
          ctx.moveTo(MASONS[i].x, masonY - 160);
          ctx.quadraticCurveTo((MASONS[i].x + MASONS[j].x) / 2, masonY - 300 - 40 * (j - i), MASONS[j].x, masonY - 160);
          ctx.stroke();
        }
      }
      ctx.restore();
      text(ctx, 'toplam değil, uyum', W / 2, 200, { size: 48, family: 'serif', italic: true, color: C.flame, alpha: after(t, 'br-harmony', 2, 0.6) * (1 - after(t, 'br-cross', 0, 0.6)) });
    }
    // karşıya geçiren köprü: bir yolcu yürür
    const walk = bp(lt, 'br-cross', 0.5, BE('br-cross') - B('br-cross') - 0.3, ease.linear);
    const ca = vis(lt, B('br-cross'), BE('br-cross') + 2, 0.6, 0.3);
    if (ca > 0) {
      const x = lerp(140, 1780, walk);
      ctx.save();
      ctx.globalAlpha *= ca;
      glow(ctx, x, deckY(x) - 60, 120, WARM, 0.35);
      person(ctx, x, deckY(x) + 2 + Math.abs(Math.sin(walk * 60)) * -3, 0.9, { color: '#0a0706', tool: 'staff' });
      ctx.restore();
      const banks = after(t, 'br-cross', 2, 0.6);
      chip(ctx, 'bir yaka', 170, 520, banks, { color: C.cream, border: C.fire, size: 26 });
      chip(ctx, 'öbür yaka', 1750, 520, banks, { color: C.cream, border: C.fire, size: 26 });
      text(ctx, 'karşıya geçirmek', W / 2, 200, { size: 48, family: 'serif', italic: true, color: C.flame, alpha: after(t, 'br-cross', 1, 0.6) });
    }
  };

  // ---------------------------------------------------------------------------
  // 4 · Görünmez köprü: cam lifler, uydular, veri merkezleri, yazılım
  // ---------------------------------------------------------------------------

  const GLOBE = { x: 960, y: 600, r: 330 };
  // kıtalar: küre üzerinde enlem/boylam lekeleri
  function globePt(lat, lon, rot) {
    const l = lon + rot;
    const x = Math.cos(lat) * Math.sin(l);
    const z = Math.cos(lat) * Math.cos(l);
    return { x: GLOBE.x + x * GLOBE.r, y: GLOBE.y - Math.sin(lat) * GLOBE.r, z };
  }
  const LANDS = [];
  for (let i = 0; i < 2600; i++) {
    const lat = (hash(i, 61) - 0.5) * 2.6;
    const lon = (hash(i, 62) - 0.5) * Math.PI * 2;
    const land = noise(lon * 1.6 + 4, 7) * 0.6 + noise(lat * 2.2 + 3, 8) * 0.4 > 0.56;
    if (land) LANDS.push([lat, lon]);
  }
  const HUBS = [[0.7, -0.9], [0.6, -0.1], [0.2, 0.6], [-0.4, 1.1], [0.3, -1.2], [-0.5, -0.4], [0.75, 0.7]];
  const CABLES = [[0, 1], [1, 2], [2, 3], [4, 0], [5, 1], [5, 2], [1, 6], [4, 5]].map(([a, b]) => [HUBS[a], HUBS[b]]);

  function drawGlobe(ctx, t, rot, a) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    glow(ctx, GLOBE.x, GLOBE.y, GLOBE.r * 1.7, DIGI, 0.12);
    const g = ctx.createRadialGradient(GLOBE.x - 120, GLOBE.y - 140, 40, GLOBE.x, GLOBE.y, GLOBE.r);
    g.addColorStop(0, '#16284a');
    g.addColorStop(1, '#070d1c');
    ctx.fillStyle = g;
    dot(ctx, GLOBE.x, GLOBE.y, GLOBE.r);
    ctx.strokeStyle = 'rgba(124,200,255,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(GLOBE.x, GLOBE.y, GLOBE.r, 0, Math.PI * 2);
    ctx.stroke();
    for (const [lat, lon] of LANDS) {
      const p = globePt(lat, lon, rot);
      if (p.z < 0) continue;
      ctx.fillStyle = `rgba(150,170,200,${0.18 + 0.3 * p.z})`;
      dot(ctx, p.x, p.y, 3.2);
    }
    ctx.restore();
  }

  function drawCables(ctx, t, rot, a) {
    if (a <= 0) return;
    CABLES.forEach(([[la0, lo0], [la1, lo1]], i) => {
      const pts = [];
      for (let k = 0; k <= 30; k++) {
        const u = k / 30;
        pts.push(globePt(lerp(la0, la1, u) - Math.sin(u * Math.PI) * 0.08, lerp(lo0, lo1, u), rot));
      }
      ctx.save();
      ctx.lineWidth = 3;
      for (let k = 1; k < pts.length; k++) {
        if (pts[k].z < 0 || pts[k - 1].z < 0) continue;
        const draw = clamp(a * 1.6 - (k / 30) * 0.6);
        if (draw <= 0) continue;
        ctx.strokeStyle = rgba(DIGI, 0.8 * draw * pts[k].z);
        line(ctx, pts[k - 1].x, pts[k - 1].y, pts[k].x, pts[k].y);
      }
      const u = (t * 0.4 + i * 0.17) % 1;
      const p = pts[Math.floor(u * 30)];
      if (p.z > 0) glow(ctx, p.x, p.y, 20, [220, 245, 255], 0.8 * a * p.z);
      ctx.restore();
    });
  }

  function drawSatellites(ctx, t, a) {
    if (a <= 0) return;
    for (let k = 0; k < 3; k++) {
      const tilt = -0.35 + k * 0.32;
      const rx = GLOBE.r * (1.35 + k * 0.12);
      const ry = GLOBE.r * 0.32;
      ctx.save();
      ctx.translate(GLOBE.x, GLOBE.y);
      ctx.rotate(tilt);
      ctx.strokeStyle = rgba(COOL, 0.25 * a);
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      const ang = t * (0.35 + k * 0.1) + k * 2;
      const x = Math.cos(ang) * rx;
      const y = Math.sin(ang) * ry;
      ctx.translate(x, y);
      ctx.rotate(-tilt);
      ctx.globalAlpha *= a;
      ctx.fillStyle = '#c9d3e6';
      ctx.fillRect(-7, -7, 14, 14);
      ctx.fillStyle = C.digital;
      ctx.fillRect(-30, -4, 18, 8);
      ctx.fillRect(12, -4, 18, 8);
      glow(ctx, 0, 0, 24, DIGI, 0.4);
      ctx.restore();
    }
  }

  function drawDataCenters(ctx, t, a) {
    if (a <= 0) return;
    [[230, 1010], [1690, 1010]].forEach(([x, y], i) => {
      ctx.save();
      ctx.globalAlpha *= a;
      for (let b = 0; b < 3; b++) {
        const bx = x - 90 + b * 64;
        ctx.fillStyle = '#121a2c';
        ctx.fillRect(bx, y - 120, 56, 120);
        ctx.strokeStyle = '#2a3450';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, y - 120, 56, 120);
        for (let r = 0; r < 8; r++) {
          const on = noise(t * 4 + i * 5 + b * 3 + r, r) > 0.4;
          ctx.fillStyle = on ? (r % 3 === 0 ? C.ok : C.digital) : '#1e2a42';
          ctx.fillRect(bx + 8, y - 112 + r * 14, 6, 4);
          ctx.fillRect(bx + 20, y - 112 + r * 14, 28, 2);
        }
      }
      ctx.restore();
    });
  }

  function drawCodeRain(ctx, t, a) {
    if (a <= 0) return;
    const glyphs = 'if(x){a=b+1;}for(i<n)return 01 10';
    for (let c = 0; c < 28; c++) {
      const x = 40 + c * 68;
      const speed = 40 + hash(c, 9) * 60;
      for (let r = 0; r < 10; r++) {
        const y = ((t * speed + r * 34 + hash(c, 8) * 900) % 1200) - 60;
        const ch = glyphs[(c * 7 + r * 3 + Math.floor(t * 3)) % glyphs.length];
        ctx.fillStyle = rgba(DIGI, a * 0.18 * (1 - r / 10));
        ctx.font = E.font(18, 'mono', 600);
        ctx.fillText(ch, x, y);
      }
    }
  }

  const LIFE = [
    { icon: 'alarm', x: 330, y: 300, label: 'sabah alarmı', k: 1 },
    { icon: 'hospital', x: 1590, y: 300, label: 'hastane kaydı', k: 2 },
    { icon: 'card', x: 300, y: 640, label: 'kartla ödeme', k: 3 },
    { icon: 'plant', x: 1620, y: 640, label: 'tarlada sulama', k: 4 },
    { icon: 'plane', x: 960, y: 170, label: 'uçağın rotası', k: 5 },
  ];

  DRAW.web = function sceneWeb(ctx, lt, t) {
    // önceki sahnenin taş köprüsü, hayalete dönüşür
    const morph = bp(lt, 'inv-second', 0.2, 2.6);
    const stoneA = 1 - progress(t, cue('inv-second', 2), cue('inv-second', 2) + 0.8);
    if (stoneA > 0) {
      ctx.save();
      ctx.globalAlpha *= stoneA * (1 - morph * 0.4);
      drawBridge(ctx, t, { build: 1, color: [120, 110, 100] });
      ctx.restore();
    }
    const rot = 0.25 * Math.sin(t * 0.05);
    const ga = progress(t, cue('inv-second', 2), cue('inv-second', 2) + 1.0);
    drawCodeRain(ctx, t, after(t, 'inv-parts', 3, 1.0));
    drawGlobe(ctx, t, rot, ga);
    drawCables(ctx, t, rot, after(t, 'inv-parts', 0, 1.2));
    drawSatellites(ctx, t, after(t, 'inv-parts', 1, 0.6));
    drawDataCenters(ctx, t, after(t, 'inv-parts', 2, 0.6));
    const labs = [['cam lifler', 0, 960, 990], ['uydular', 1, 1420, 240], ['veri merkezleri', 2, 230, 850], ['milyarlarca satır yazılım', 3, 960, 1040]];
    labs.forEach(([s, k, x, y]) => text(ctx, s, x, y, { size: 30, family: 'serif', italic: true, color: C.cream, alpha: after(t, 'inv-parts', k, 0.5) * (1 - after(t, 'inv-unseen', 0, 0.5)) }));
    text(ctx, 'bu kez taştan değil', W / 2, 140, { size: 44, family: 'serif', italic: true, color: C.flame, alpha: after(t, 'inv-second', 2, 0.6) * (1 - after(t, 'inv-parts', 0, 0.5)) });
    // görünmez kemer
    const un = after(t, 'inv-unseen', 0, 1.0);
    if (un > 0) {
      ctx.save();
      ctx.translate(0, -120);
      drawBridge(ctx, t, { build: 1, ghost: un * (0.6 + 0.4 * Math.sin(t * 2) * 0.5) });
      ctx.restore();
      text(ctx, 'ne ayağı görünüyor, ne kemeri', W / 2, 1010, { size: 36, family: 'serif', italic: true, color: C.cream, alpha: un * (1 - after(t, 'inv-life', 0, 0.5)) });
    }
    // günlük hayat
    LIFE.forEach((L) => {
      const a = after(t, 'inv-life', L.k, 0.5);
      if (a <= 0) return;
      const pulse = after(t, 'inv-life', 6, 0.5);
      ctx.save();
      ctx.strokeStyle = rgba(DIGI, 0.35 * a + 0.4 * pulse * (0.5 + 0.5 * Math.sin(t * 5 + L.k)));
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 8]);
      line(ctx, L.x, L.y, GLOBE.x + (L.x - GLOBE.x) * 0.35, GLOBE.y + (L.y - GLOBE.y) * 0.35);
      ctx.restore();
      panel(ctx, L.x - 80, L.y - 70, 160, 140, a, rgba(DIGI, 0.5), 'rgba(8,12,24,0.92)', 20);
      icon(ctx, L.icon, L.x, L.y - 8, 0.95, C.cream, a);
      text(ctx, L.label, L.x, L.y + 100, { size: 26, family: 'serif', italic: true, color: C.cream, alpha: a });
    });
    text(ctx, 'hepsi onun içinden geçiyor', W / 2, 1010, { size: 36, family: 'serif', italic: true, color: C.flame, alpha: after(t, 'inv-life', 6, 0.6) });
  };

  // ---------------------------------------------------------------------------
  // 5 · Kullanılan değil, kurulan: yüzey ve derinlik
  // ---------------------------------------------------------------------------

  const GLASS = 520;

  function gear(ctx, x, y, r, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.beginPath();
    const teeth = 10;
    for (let k = 0; k < teeth * 2; k++) {
      const ang = (k / (teeth * 2)) * Math.PI * 2;
      const rr = k % 2 ? r : r * 1.22;
      ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#05070e';
    dot(ctx, 0, 0, r * 0.35);
    ctx.restore();
  }

  DRAW.build = function sceneBuild(ctx, lt, t) {
    // derinlik: ışığı kurucuların iddiasıyla açılır
    const deep = 0.18 + 0.82 * after(t, 'bd-claim', 3, 1.0);
    const under = ctx.createLinearGradient(0, GLASS, 0, H);
    under.addColorStop(0, '#0a1222');
    under.addColorStop(1, '#05080f');
    ctx.fillStyle = under;
    ctx.fillRect(0, GLASS, W, H - GLASS);
    ctx.save();
    ctx.globalAlpha *= deep;
    gear(ctx, 420, 770, 54, t * 0.8, '#2a3858');
    gear(ctx, 520, 850, 36, -t * 1.2, '#2a3858');
    icon(ctx, 'factory', 260, 920, 1.1, C.muted, 1);
    icon(ctx, 'code', 860, 700, 1.0, C.digital, 1);
    for (let k = 0; k < 5; k++) {
      ctx.fillStyle = rgba(DIGI, 0.35);
      ctx.fillRect(930, 660 + k * 22, 120 + hash(k, 3) * 160, 8);
    }
    icon(ctx, 'db', 1180, 820, 1.1, C.digital, 1);
    icon(ctx, 'globe', 1420, 720, 0.9, C.digital, 1);
    icon(ctx, 'shield', 1620, 860, 0.9, C.ok, 1);
    ctx.restore();
    // kurucular
    const builders = after(t, 'bd-claim', 3, 1.0);
    [[700, 1040], [1020, 1040], [1520, 1040]].forEach(([x, y], i) => {
      ctx.save();
      ctx.globalAlpha *= builders;
      glow(ctx, x, y - 90, 140, FIRE, 0.18);
      person(ctx, x, y, 1.2, { color: '#0d1220', apron: i === 1 });
      ctx.restore();
    });
    // yüzey
    const top = ctx.createLinearGradient(0, 0, 0, GLASS);
    top.addColorStop(0, '#0f1730');
    top.addColorStop(1, '#16213e');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, W, GLASS);
    // cam
    ctx.fillStyle = 'rgba(124,200,255,0.18)';
    ctx.fillRect(0, GLASS - 4, W, 10);
    glow(ctx, W / 2, GLASS, 900, DIGI, 0.06);
    text(ctx, 'YÜZEY', 60, GLASS - 40, { size: 22, weight: 700, spacing: 6, color: C.muted, align: 'left', alpha: after(t, 'bd-surface', 1, 0.5) });
    text(ctx, 'DERİNLİK', 60, GLASS + 44, { size: 22, weight: 700, spacing: 6, color: C.muted, align: 'left', alpha: after(t, 'bd-surface', 1, 0.5) });
    // düğme ve ampul
    const press = after(t, 'bd-surface', 2, 0.3);
    const lit = after(t, 'bd-surface', 3, 0.3);
    person(ctx, 290, 500, 1.3, { color: '#05070d' });
    roundRect(ctx, 360, 300, 40, 64, 6);
    ctx.fillStyle = '#d9d2c4';
    ctx.fill();
    ctx.fillStyle = '#8f877a';
    ctx.fillRect(372, 312 + press * 22, 16, 18);
    if (lit > 0) glow(ctx, 640, 250, 260, [255, 220, 140], 0.6 * lit);
    icon(ctx, 'bulb', 640, 260, 1.4, lit > 0.5 ? C.flame : C.dim, 1, 5);
    // derinlikte koşan akım
    if (press > 0) {
      const p = progress(t, cue('bd-surface', 2) + 0.1, cue('bd-surface', 3) + 0.1);
      const pts = [[380, 364], [380, 600], [260, 880], [560, 640], [640, 300]];
      ctx.save();
      ctx.strokeStyle = rgba(FIRE, 0.25 + 0.4 * lit);
      ctx.lineWidth = 3;
      poly(ctx, pts);
      ctx.stroke();
      const seg = Math.min(pts.length - 2, Math.floor(p * (pts.length - 1)));
      const f = p * (pts.length - 1) - seg;
      if (p < 1) glow(ctx, lerp(pts[seg][0], pts[seg + 1][0], f), lerp(pts[seg][1], pts[seg + 1][1], f), 40, FIRE, 0.8);
      ctx.restore();
    }
    // uygulama ve kapıya gelen yemek
    const app = after(t, 'bd-surface', 4, 0.4);
    roundRect(ctx, 1110, 250, 130, 230, 20);
    ctx.fillStyle = '#0b0e16';
    ctx.fill();
    ctx.strokeStyle = '#2a3247';
    ctx.lineWidth = 3;
    ctx.stroke();
    roundRect(ctx, 1140, 300, 70, 70, 16);
    ctx.fillStyle = app > 0.5 ? C.fire : '#2a3550';
    ctx.fill();
    text(ctx, 'yemek', 1175, 400, { size: 18, color: C.muted });
    // kapı
    ctx.fillStyle = '#2a1d14';
    ctx.fillRect(1600, 230, 150, 270);
    ctx.fillStyle = '#c9a36a';
    dot(ctx, 1730, 370, 6);
    const bag = after(t, 'bd-surface', 5, 0.8);
    if (bag > 0) {
      const x = lerp(1900, 1530, bag);
      ctx.save();
      ctx.translate(x, 470);
      ctx.fillStyle = '#c98a4a';
      roundRect(ctx, -34, -60, 68, 60, 6);
      ctx.fill();
      ctx.strokeStyle = '#8a5a2a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -60, 16, Math.PI, 0);
      ctx.stroke();
      ctx.restore();
      // derinlikte sipariş yolu
      ctx.save();
      ctx.strokeStyle = rgba(FIRE, 0.4 + 0.3 * lit);
      ctx.setLineDash([6, 8]);
      ctx.lineWidth = 3;
      poly(ctx, [[1175, 480], [1180, 780], [1420, 700], [1620, 820], [1580, 470]]);
      ctx.stroke();
      ctx.restore();
    }
    // inanç kartı
    const bel = after(t, 'bd-belief', 1, 0.6);
    const strike = after(t, 'bd-claim', 2, 0.6);
    const fix = after(t, 'bd-claim', 3, 0.7);
    if (bel > 0) {
      panel(ctx, 560, 70, 800, 130, bel, C.line, 'rgba(8,12,24,0.94)', 20);
      const pre = 'teknoloji, ';
      const word = 'kullanılan';
      const post = ' bir şeydir';
      const wPre = measure(ctx, pre, { size: 46, family: 'serif', italic: true });
      const wWord = measure(ctx, word, { size: 46, family: 'serif', italic: true });
      const wPost = measure(ctx, post, { size: 46, family: 'serif', italic: true });
      const x0 = W / 2 - (wPre + wWord + wPost) / 2;
      runs(ctx, [[pre, { size: 46, family: 'serif', italic: true, color: C.cream }], [word, { size: 46, family: 'serif', italic: true, color: strike > 0 ? C.muted : C.cream }], [post, { size: 46, family: 'serif', italic: true, color: C.cream }]], W / 2, 150, { alpha: bel });
      if (strike > 0) {
        ctx.strokeStyle = C.error;
        ctx.lineWidth = 5;
        line(ctx, x0 + wPre - 6, 136, x0 + wPre + (wWord + 12) * strike, 136);
      }
      text(ctx, 'kurulan', x0 + wPre + wWord / 2, 62 + (1 - fix) * 14, { size: 54, family: 'serif', italic: true, weight: 700, color: C.fire, alpha: fix, glow: 'rgba(255,140,40,0.5)', glowBlur: 24 });
    }
    // kuran karar verir: plan çizgisi
    const dec = after(t, 'bd-decide', 0, 1.2);
    if (dec > 0) {
      const pts = [[1020, 960], [1100, 760], [1175, 560], [1175, 400]];
      ctx.save();
      ctx.strokeStyle = rgba(WARM, 0.9);
      ctx.setLineDash([10, 10]);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      const n = Math.max(1, Math.floor(dec * (pts.length - 1) * 10));
      for (let k = 1; k <= n; k++) {
        const u = k / ((pts.length - 1) * 10);
        const s = Math.min(pts.length - 2, Math.floor(u * (pts.length - 1)));
        const f = u * (pts.length - 1) - s;
        ctx.lineTo(lerp(pts[s][0], pts[s + 1][0], f), lerp(pts[s][1], pts[s + 1][1], f));
      }
      ctx.stroke();
      ctx.restore();
      text(ctx, 'nasıl kullanılacağına, kuran karar verir', W / 2, 1050, { size: 34, family: 'serif', italic: true, color: C.flame, alpha: after(t, 'bd-decide', 1, 0.6) });
    }
  };

  // ---------------------------------------------------------------------------
  // 6 · Bütüncül bakış
  // ---------------------------------------------------------------------------

  const BOXES = [['Donanım', 'chip'], ['Programlama', 'code'], ['Ağlar', 'globe'], ['Tasarım', 'window']];
  const RING = [
    ['Uygulama', 'window'], ['Veri tabanı', 'db'], ['Ağ', 'globe'], ['Güvenlik', 'shield'],
    ['Algoritma', 'flow'], ['Donanım', 'chip'], ['Tasarım', 'person'],
  ];
  // her benzetme: bağın iki ucu, satır ve öbek, çizim
  const LINKS = [
    { a: 0, b: 1, line: 'ch-links', k: 0, say: 'hafızasız bir zihin', art: 'mind' },
    { a: 1, b: 2, line: 'ch-links', k: 2, say: 'kapısı örülmüş bir kütüphane', art: 'library' },
    { a: 2, b: 3, line: 'ch-links', k: 4, say: 'kapısı açık bir ev', art: 'house' },
    { a: 3, b: 4, line: 'ch-links2', k: 0, say: 'düşünmeyen bir bekçi', art: 'guard' },
    { a: 4, b: 5, line: 'ch-links2', k: 2, say: 'kâğıtta kalmış bir niyet', art: 'paper' },
    { a: 6, b: 0, line: 'ch-links2', k: 4, say: 'insana ulaşamayan güç', art: 'reach' },
  ];
  const ringPos = (i, r = 330) => {
    const ang = -Math.PI / 2 + (i / RING.length) * Math.PI * 2;
    return [W / 2 + Math.cos(ang) * r, 560 + Math.sin(ang) * r];
  };

  function metaphorArt(ctx, kind, x, y, a, t) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.strokeStyle = C.cream;
    ctx.fillStyle = C.cream;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (kind === 'mind') {
      ctx.beginPath();
      ctx.moveTo(-40, 60);
      ctx.lineTo(-40, 20);
      ctx.bezierCurveTo(-70, 0, -60, -70, 0, -70);
      ctx.bezierCurveTo(60, -70, 70, -20, 50, 10);
      ctx.lineTo(60, 30);
      ctx.lineTo(44, 34);
      ctx.lineTo(40, 60);
      ctx.stroke();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = C.muted;
      ctx.beginPath();
      ctx.arc(2, -24, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, '?', 2, -22, { size: 30, weight: 700, color: C.muted });
    } else if (kind === 'library') {
      for (let s = 0; s < 3; s++) {
        line(ctx, -70, -50 + s * 40, -10, -50 + s * 40);
        for (let b = 0; b < 5; b++) ctx.fillRect(-66 + b * 11, -80 + s * 40, 8, 28);
      }
      ctx.strokeRect(10, -70, 60, 120);
      ctx.fillStyle = '#8a4a3a';
      for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) ctx.fillRect(13 + c * 19 + (r % 2) * 9, -67 + r * 20, 16, 17);
    } else if (kind === 'house') {
      poly(ctx, [[-60, -10], [0, -70], [60, -10], [60, 60], [-60, 60]]);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeRect(-18, 10, 36, 50);
      ctx.fillStyle = 'rgba(255,220,150,0.35)';
      ctx.fillRect(-18, 10, 36, 50);
      ctx.strokeStyle = C.cream;
      poly(ctx, [[-18, 10], [-44, 18], [-44, 66], [-18, 60]]);
      ctx.stroke();
    } else if (kind === 'guard') {
      person(ctx, 0, 70, 1, { color: C.cream, tool: 'staff' });
      const z = (t * 0.8) % 1;
      text(ctx, 'z', 30 + z * 30, -100 - z * 40, { size: 26 + z * 10, family: 'serif', italic: true, color: C.muted, alpha: 1 - z });
      text(ctx, 'z', 20, -96, { size: 22, family: 'serif', italic: true, color: C.muted });
    } else if (kind === 'paper') {
      ctx.fillStyle = C.paper;
      ctx.save();
      ctx.rotate(-0.08);
      ctx.fillRect(-56, -70, 112, 140);
      ctx.strokeStyle = '#6b6252';
      ctx.lineWidth = 2.5;
      for (let k = 0; k < 6; k++) line(ctx, -40, -46 + k * 20, 40 - (k % 3) * 14, -46 + k * 20);
      ctx.restore();
    } else if (kind === 'reach') {
      ctx.fillStyle = C.flame;
      poly(ctx, [[-70, -50], [-90, 0], [-74, 0], [-86, 50], [-50, -10], [-66, -10]]);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3a4664';
      ctx.fillRect(-20, -70, 16, 140);
      icon(ctx, 'person', 60, 0, 1.2, C.cream, 1);
    }
    ctx.restore();
  }

  DRAW.chain = function sceneChain(ctx, lt, t) {
    // ayrı kutular
    const boxOut = after(t, 'ch-links', 0, 0.6);
    const fall = after(t, 'ch-real', 1, 1.2, ease.in);
    BOXES.forEach(([name, ic], i) => {
      const a = after(t, 'ch-split', i + 1, 0.5) * (1 - boxOut);
      if (a <= 0) return;
      const x = 330 + i * 420;
      const y = 560 + fall * (60 + i * 25);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(fall * (i % 2 ? 0.22 : -0.18));
      panel(ctx, -170, -150, 340, 300, a, C.line, 'rgba(10,15,30,0.92)', 22);
      icon(ctx, ic, 0, -30, 1.4, C.digital, a);
      text(ctx, name, 0, 90, { size: 38, family: 'serif', italic: true, color: C.cream, alpha: a });
      ctx.restore();
      if (i > 0) {
        ctx.fillStyle = `rgba(42,52,80,${a})`;
        ctx.fillRect(x - 214, 380, 8, 360);
      }
    });
    text(ctx, 'ayrı kutular', W / 2, 220, { size: 44, family: 'serif', italic: true, color: C.muted, alpha: after(t, 'ch-split', 0, 0.5) * (1 - after(t, 'ch-real', 1, 0.5)) });
    text(ctx, 'hiçbiri tek başına ayakta durmaz', W / 2, 220, { size: 44, family: 'serif', italic: true, color: C.flame, alpha: after(t, 'ch-real', 1, 0.5) * (1 - boxOut) });

    // halka
    const ringA = boxOut * (1 - after(t, 'ch-revisit', 0, 0.8));
    if (ringA > 0) {
      LINKS.forEach((L) => {
        const [ax, ay] = ringPos(L.a);
        const [bx, by] = ringPos(L.b);
        const broken = after(t, L.line, L.k, 0.4);
        const fixed = after(t, L.line, L.k + 1, 0.8);
        ctx.save();
        ctx.globalAlpha *= ringA;
        if (fixed > 0) {
          ctx.strokeStyle = rgba(FIRE, 0.4 + 0.6 * fixed);
          ctx.lineWidth = 6;
          line(ctx, ax, ay, lerp(ax, bx, fixed), lerp(ay, by, fixed));
          const u = (t * 0.6) % 1;
          glow(ctx, lerp(ax, bx, u), lerp(ay, by, u), 26, FIRE, 0.6 * fixed);
        } else if (broken > 0) {
          ctx.strokeStyle = rgba([255, 84, 104], 0.8 * broken);
          ctx.setLineDash([8, 10]);
          ctx.lineWidth = 3;
          line(ctx, ax, ay, lerp(ax, bx, 0.42), lerp(ay, by, 0.42));
          line(ctx, lerp(ax, bx, 0.58), lerp(ay, by, 0.58), bx, by);
        } else {
          ctx.strokeStyle = rgba(COOL, 0.2);
          ctx.lineWidth = 2;
          line(ctx, ax, ay, bx, by);
        }
        ctx.restore();
      });
      // eksik son bağ (Donanım → Tasarım) da halkayı tamamlasın
      {
        const [ax, ay] = ringPos(5);
        const [bx, by] = ringPos(6);
        const fixed = after(t, 'ch-links2', 5, 0.8);
        ctx.save();
        ctx.globalAlpha *= ringA;
        ctx.strokeStyle = fixed > 0 ? rgba(FIRE, 0.4 + 0.6 * fixed) : rgba(COOL, 0.2);
        ctx.lineWidth = fixed > 0 ? 6 : 2;
        line(ctx, ax, ay, bx, by);
        ctx.restore();
      }
      RING.forEach(([name, ic], i) => {
        const [x, y] = ringPos(i);
        const a = ringA * progress(t, cue('ch-links', 0) - 0.3 + i * 0.08, cue('ch-links', 0) + 0.2 + i * 0.08);
        const hot = LINKS.some((L) => (L.a === i || L.b === i) && t >= cue(L.line, L.k) && t < cue(L.line, L.k + 1) + 0.8);
        if (hot) glow(ctx, x, y, 110, FIRE, 0.3 * a);
        ctx.save();
        ctx.globalAlpha *= a;
        ctx.fillStyle = '#0e1528';
        dot(ctx, x, y, 62);
        ctx.lineWidth = 3;
        ctx.strokeStyle = hot ? C.fire : C.line;
        ctx.beginPath();
        ctx.arc(x, y, 62, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        icon(ctx, ic, x, y - 4, 0.8, hot ? C.flame : C.digital, a);
        text(ctx, name, x, y + (y > 560 ? 96 : -92), { size: 28, family: 'serif', italic: true, color: C.cream, alpha: a });
      });
      // ortadaki benzetme
      LINKS.forEach((L) => {
        const a = vis(t, cue(L.line, L.k), cue(L.line, L.k + 1) + 1.2, 0.4, 0.4) * ringA;
        if (a <= 0) return;
        metaphorArt(ctx, L.art, W / 2, 530, a, t);
        text(ctx, L.say, W / 2, 660, { size: 32, family: 'serif', italic: true, color: C.flame, alpha: a * after(t, L.line, L.k + 1, 0.4) });
      });
    }

    // her kapıda yeniden: iç içe halkalar, ortada Elif'in iletisi
    const rv = after(t, 'ch-revisit', 0, 0.8) * (1 - after(t, 'ch-whole', 0, 0.8));
    if (rv > 0) {
      for (let k = 12; k >= 1; k--) {
        const r = 60 + k * 34;
        const a = rv * progress(t, cue('ch-revisit', 3) + (12 - k) * 0.06, cue('ch-revisit', 3) + (12 - k) * 0.06 + 0.4);
        ctx.strokeStyle = rgba(mixc(FIRE, DIGI, (k - 1) / 11), 0.5 * a);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W / 2, 560, r, 0, Math.PI * 2);
        ctx.stroke();
        text(ctx, String(k), W / 2 + r, 560, { size: 18, family: 'mono', weight: 700, color: rgba(mixc(FIRE, DIGI, (k - 1) / 11)), alpha: a });
      }
      // içe doğru dolanan iz
      const sp = progress(t, cue('ch-revisit', 4), cue('ch-revisit', 4) + 2.6, ease.inOut);
      if (sp > 0) {
        ctx.save();
        ctx.strokeStyle = rgba(WARM, 0.8 * rv);
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let u = 0; u <= sp; u += 0.005) {
          const r = lerp(470, 70, u);
          const ang = u * Math.PI * 7;
          const x = W / 2 + Math.cos(ang) * r;
          const y = 560 + Math.sin(ang) * r;
          if (u === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }
      const bub = after(t, 'ch-revisit', 2, 0.6) * rv;
      if (bub > 0) {
        glow(ctx, W / 2, 560, 120, WARM, 0.4 * bub);
        const w = measure(ctx, MSG, { size: 26 }) + 36;
        panel(ctx, W / 2 - w / 2, 532, w, 56, bub, 'rgba(0,0,0,0)', '#ffb05e', 20);
        text(ctx, MSG, W / 2, 561, { size: 26, color: '#1b1f2a', alpha: bub });
      }
      text(ctx, 'kopuk adalar değil', W / 2, 120, { size: 40, family: 'serif', italic: true, color: C.muted, alpha: rv * after(t, 'ch-revisit', 1, 0.5) });
    }

    // bütün katmanlar aynı anda
    const wh = after(t, 'ch-whole', 0, 1.0);
    if (wh > 0) {
      const LAY = ['Ekran', 'Uygulama', 'İşletim sistemi', 'Bellek ve işlemci', 'Ağ', 'Veri tabanı', 'Güvenlik'];
      const cx = W / 2 + 120;
      LAY.forEach((s, i) => {
        const y = 250 + i * 100;
        const a = wh * progress(t, cue('ch-whole', 0) + i * 0.12, cue('ch-whole', 0) + i * 0.12 + 0.5);
        ctx.save();
        ctx.globalAlpha *= a;
        poly(ctx, [[cx - 360, y], [cx + 200, y], [cx + 360, y - 60], [cx - 200, y - 60]]);
        ctx.closePath();
        ctx.fillStyle = rgba(mixc([20, 30, 56], [40, 60, 100], i / 6), 0.85);
        ctx.fill();
        ctx.strokeStyle = rgba(mixc(FIRE, DIGI, i / 6), 0.7);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        text(ctx, s, cx - 400, y - 26, { size: 28, family: 'serif', italic: true, color: C.cream, align: 'right', alpha: a });
      });
      // görünmez bağlar
      const bonds = after(t, 'ch-whole', 2, 0.8);
      if (bonds > 0) {
        [[-120, -30], [40, -30], [180, -30]].forEach(([dx], j) => {
          ctx.strokeStyle = rgba(WARM, 0.7 * bonds);
          ctx.lineWidth = 3;
          line(ctx, cx + dx, 190, cx + dx + 40, 850);
          const u = (t * 0.5 + j * 0.3) % 1;
          glow(ctx, cx + dx + 40 * u, lerp(190, 850, u), 30, WARM, 0.8 * bonds);
        });
      }
      text(ctx, 'bütüncül bakış', W / 2, 120, { size: 52, family: 'serif', italic: true, color: C.flame, alpha: after(t, 'ch-whole', 2, 0.6) });
      text(ctx, 'parçalar arasındaki görünmez bağlar', W / 2, 990, { size: 36, family: 'serif', italic: true, color: C.cream, alpha: after(t, 'ch-whole', 4, 0.6) });
    }
  };

  // ---------------------------------------------------------------------------
  // 7 · Bu yolculuk kimin için?
  // ---------------------------------------------------------------------------

  const CROWD = [
    { x: 420, s: 1.25, o: { pack: true, child: true } }, { x: 560, s: 1.35, o: {} }, { x: 700, s: 1.3, o: { book: true } },
    { x: 840, s: 1.2, o: { child: true } }, { x: 1080, s: 1.35, o: { tool: 'staff' } }, { x: 1220, s: 1.3, o: { pack: true } },
    { x: 1360, s: 1.4, o: {} }, { x: 1500, s: 1.25, o: { book: true } }, { x: 960, s: 1.4, o: { apron: true } },
  ];

  function thinkIcon(ctx, kind, x, y, a, t) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.strokeStyle = C.cream;
    ctx.fillStyle = C.cream;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    if (kind === 'split') {
      const g = 10 * a;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => ctx.strokeRect(sx * g + (sx < 0 ? -40 : 0), sy * g + (sy < 0 ? -40 : 0), 40, 40));
    } else if (kind === 'pattern') {
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        const hot = (r + c) % 2 === 0;
        ctx.fillStyle = hot ? C.fire : C.dim;
        dot(ctx, -36 + c * 24, -36 + r * 24, 7);
      }
    } else if (kind === 'stairs') {
      poly(ctx, [[-48, 40], [-48, 16], [-16, 16], [-16, -8], [16, -8], [16, -32], [48, -32]]);
      ctx.stroke();
      ctx.fillStyle = C.fire;
      dot(ctx, 32, -46, 8);
    } else if (kind === 'speak') {
      roundRect(ctx, -46, -36, 92, 60, 16);
      ctx.stroke();
      poly(ctx, [[-20, 24], [-30, 44], [0, 24]]);
      ctx.stroke();
      for (let k = 0; k < 3; k++) dot(ctx, -20 + k * 20, -6, 5);
    } else if (kind === 'hourglass') {
      poly(ctx, [[-30, -46], [30, -46], [4, 0], [30, 46], [-30, 46], [-4, 0]]);
      ctx.closePath();
      ctx.stroke();
      const sand = (t * 0.3) % 1;
      ctx.fillStyle = C.flame;
      poly(ctx, [[-22 * (1 - sand), -40 + 34 * sand], [22 * (1 - sand), -40 + 34 * sand], [0, -4]]);
      ctx.fill();
      poly(ctx, [[0, 40 - 30 * sand], [-24 * sand, 40], [24 * sand, 40]]);
      ctx.fill();
    }
    ctx.restore();
  }

  DRAW.who = function sceneWho(ctx, lt, t) {
    // herkes
    const ev = spanVis(lt, 'who-everyone', 'who-everyone', 0.5, 0.5);
    if (ev > 0) {
      const q = after(t, 'who-everyone', 0, 0.6);
      glow(ctx, W / 2, 420, 420, WARM, 0.25 * q * ev);
      text(ctx, '?', W / 2, 400, { size: 220, family: 'serif', weight: 700, color: C.flame, alpha: q * ev, glow: 'rgba(255,140,40,0.5)', glowBlur: 40 });
      CROWD.forEach((p, i) => {
        const a = ev * progress(t, cue('who-everyone', 1) + i * 0.08, cue('who-everyone', 1) + i * 0.08 + 0.5);
        if (i === 8) return;
        ctx.save();
        ctx.globalAlpha *= Math.max(0.25, a);
        person(ctx, p.x, 900, p.s * 1.25, { ...p.o, color: '#1a2440' });
        ctx.restore();
        if (a > 0) glow(ctx, p.x, 760, 100, WARM, 0.12 * a);
      });
      text(ctx, 'merak eden herkes', W / 2, 990, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: ev * after(t, 'who-everyone', 1, 0.6) });
    }
    // araçlar eskir
    const le = spanVis(lt, 'who-learner', 'who-learner', 0.5, 0.5);
    if (le > 0) {
      const age = after(t, 'who-learner', 3, 1.4);
      ctx.save();
      ctx.globalAlpha *= le;
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 3;
      line(ctx, 260, 700, 1660, 700);
      ['bugün', '+ 5 yıl', '+ 10 yıl'].forEach((s, i) => {
        const x = 420 + i * 540;
        ctx.fillStyle = i === 0 || age > i * 0.45 ? C.fire : C.dim;
        dot(ctx, x, 700, 9);
        text(ctx, s, x, 750, { size: 28, family: 'mono', weight: 600, color: C.muted });
      });
      ctx.restore();
      [['window', 640], ['code', 960], ['chip', 1280]].forEach(([ic, x], i) => {
        const a = le * after(t, 'who-learner', 2, 0.5);
        const crack = clamp(age * 1.4 - i * 0.2);
        ctx.save();
        ctx.translate(x, 470 + crack * 40);
        ctx.rotate(crack * (i - 1) * 0.15);
        panel(ctx, -100, -100, 200, 200, a * (1 - crack * 0.7), C.line, 'rgba(10,15,30,0.92)', 18);
        icon(ctx, ic, 0, -10, 1.3, crack > 0.5 ? C.dim : C.digital, a * (1 - crack * 0.6));
        text(ctx, 'araç', 0, 70, { size: 26, family: 'serif', italic: true, color: C.muted, alpha: a * (1 - crack) });
        ctx.restore();
      });
      text(ctx, 'sevinilecek bir haber', W / 2, 200, { size: 48, family: 'serif', italic: true, color: C.flame, alpha: le * after(t, 'who-learner', 5, 0.6) });
    }
    // düşünme biçimi
    const th = spanVis(lt, 'who-thinking', 'who-thinking', 0.5, 0.5);
    if (th > 0) {
      text(ctx, 'bir düşünme biçimi', W / 2, 200, { size: 52, family: 'serif', italic: true, color: C.flame, alpha: th * after(t, 'who-thinking', 1, 0.6) });
      const STEPS = [['split', 'parçalara ayır', 2], ['pattern', 'kalıbı gör', 3], ['stairs', 'adım adım kur', 4], ['speak', 'anlat', 5]];
      STEPS.forEach(([ic, s, k], i) => {
        const a = th * after(t, 'who-thinking', k, 0.5);
        const x = 390 + i * 380;
        panel(ctx, x - 150, 380, 300, 300, a, C.line, 'rgba(10,15,30,0.92)', 22);
        thinkIcon(ctx, ic, x, 500, a, t);
        text(ctx, s, x, 620, { size: 32, family: 'serif', italic: true, color: C.cream, alpha: a });
        if (i > 0) {
          ctx.save();
          ctx.globalAlpha *= a;
          ctx.fillStyle = C.dim;
          poly(ctx, [[x - 205, 520], [x - 185, 530], [x - 205, 540]]);
          ctx.fill();
          ctx.restore();
        }
      });
      const ag = th * after(t, 'who-thinking', 6, 0.6);
      thinkIcon(ctx, 'hourglass', W / 2 - 170, 850, ag, t);
      text(ctx, 'hiç eskimez', W / 2 + 40, 852, { size: 46, family: 'serif', italic: true, color: C.flame, alpha: ag });
    }
    // ekranın iki tarafı
    const sd = spanVis(lt, 'who-side', 'who-parent', 0.5, 0.5);
    if (sd > 0) {
      ctx.save();
      ctx.globalAlpha *= sd;
      // ekran (yandan)
      glow(ctx, 930, 560, 420, [120, 170, 255], 0.22);
      ctx.fillStyle = '#d7e6ff';
      ctx.fillRect(940, 300, 6, 480);
      ctx.fillStyle = '#141c2e';
      ctx.fillRect(946, 300, 26, 480);
      ctx.restore();
      // karşısında
      ctx.save();
      ctx.globalAlpha *= sd;
      person(ctx, 640, 900, 1.7, { color: '#1c2846' });
      glow(ctx, 680, 640, 160, [120, 170, 255], 0.25);
      // arkasında: kod satırları ve kurucu
      person(ctx, 1300, 900, 1.7, { color: '#2a2030', apron: true, apronColor: '#4a2e18', facing: -1 });
      for (let k = 0; k < 7; k++) {
        ctx.fillStyle = rgba(FIRE, 0.25 + 0.2 * Math.sin(t * 2 + k));
        ctx.fillRect(1020 + (k % 2) * 30, 340 + k * 50, 160 + hash(k, 4) * 120, 10);
      }
      ctx.restore();
      text(ctx, 'ekranın karşısı', 640, 980, { size: 34, family: 'serif', italic: true, color: C.digital, alpha: sd * Math.max(after(t, 'who-side', 2, 0.5), after(t, 'who-parent', 1, 0.5)) });
      text(ctx, 'ekranın arkası', 1300, 980, { size: 34, family: 'serif', italic: true, color: C.flame, alpha: sd * Math.max(after(t, 'who-side', 2, 0.5), after(t, 'who-parent', 2, 0.5)) });
      text(ctx, 'bir konum: hangi tarafta duracağınız', W / 2, 200, { size: 46, family: 'serif', italic: true, color: C.cream, alpha: sd * after(t, 'who-side', 1, 0.6) * (1 - after(t, 'who-parent', 0, 0.5)) });
      // veli
      const par = after(t, 'who-parent', 0, 0.6) * sd;
      if (par > 0) {
        ctx.save();
        ctx.globalAlpha *= par;
        person(ctx, 360, 900, 1.8, { color: '#1c2846' });
        ctx.restore();
        text(ctx, 'veli', 360, 980, { size: 34, family: 'serif', italic: true, color: C.cream, alpha: par });
        text(ctx, 'bambaşka şeyler', W / 2, 200, { size: 52, family: 'serif', italic: true, color: C.flame, alpha: sd * after(t, 'who-parent', 3, 0.6) });
      }
    }
    // iki çocuk
    const tw = spanVis(lt, 'who-two', 'who-two', 0.5, 0.5);
    if (tw > 0) {
      // birinci çocuk: dokunur, dokunur
      ctx.save();
      ctx.globalAlpha *= tw;
      person(ctx, 520, 920, 2.0, { child: true, color: '#1c2846' });
      roundRect(ctx, 566, 640, 70, 120, 12);
      ctx.fillStyle = '#16233c';
      ctx.fill();
      const tap = (t * 1.6) % 1;
      glow(ctx, 601, 700, 70 * tap + 24, DIGI, 0.6 * (1 - tap));
      ctx.restore();
      text(ctx, 'kullanır', 520, 1000, { size: 32, family: 'serif', italic: true, color: C.digital, alpha: tw * after(t, 'who-two', 1, 0.5) });
      // ikinci çocuk: sorar
      ctx.save();
      ctx.globalAlpha *= tw * after(t, 'who-two', 2, 0.5);
      person(ctx, 1380, 920, 2.0, { child: true, color: '#2a2030' });
      ctx.restore();
      const Q = [['neden böyle çalışıyor?', 3, 1180, 520], ['verim nereye gidiyor?', 4, 1590, 470], ['kim tasarladı?', 5, 1240, 360], ['ne amaçla?', 6, 1580, 300]];
      Q.forEach(([s, k, x, y]) => {
        const a = tw * after(t, 'who-two', k, 0.4);
        const w = measure(ctx, s, { size: 28, family: 'serif', italic: true }) + 44;
        panel(ctx, x - w / 2, y - 34, w, 68, a, C.fire, 'rgba(20,16,10,0.9)', 30);
        text(ctx, s, x, y + 1, { size: 28, family: 'serif', italic: true, color: C.flame, alpha: a });
      });
      // ikinci çocuk, birincinin dünyasını kurar
      const bld = tw * after(t, 'who-two', 8, 1.0);
      if (bld > 0) {
        for (let k = 0; k < 6; k++) {
          const p = clamp(bld * 1.6 - k * 0.12);
          const x = lerp(1300, 720 + (k % 3) * 70, p);
          const y = lerp(820, 660 - Math.floor(k / 3) * 60, p);
          ctx.fillStyle = rgba(FIRE, 0.85 * p);
          roundRect(ctx, x - 30, y - 26, 60, 52, 8);
          ctx.fill();
        }
        text(ctx, 'birincinin dünyasını kuran', 1380, 1000, { size: 32, family: 'serif', italic: true, color: C.flame, alpha: bld });
      }
    }
    // her alan yazılımla yeniden kuruluyor
    const al = spanVis(lt, 'who-all', 'who-all', 0.5, 0.5);
    if (al > 0) {
      const ROLES = [['öğretmen', 0], ['yönetici', 0], ['meraklı bir yetişkin', 0]];
      ROLES.forEach(([s], i) => chip(ctx, s, 560 + i * 400, 200, al * after(t, 'who-all', 0, 0.4 + i * 0.2), { size: 30 }));
      const FIELDS = [['factory', 'üretim', 1], ['hospital', 'sağlık', 1], ['wheat', 'tarım', 2], ['scales', 'hukuk', 2]];
      FIELDS.forEach(([ic, s, k], i) => {
        const a = al * after(t, 'who-all', k, 0.5);
        const x = 420 + i * 360;
        const code = al * after(t, 'who-all', 3, 0.8);
        panel(ctx, x - 140, 380, 280, 300, a, code > 0 ? rgba(DIGI, 0.6) : C.line, 'rgba(10,15,30,0.92)', 22);
        if (code > 0) {
          ctx.save();
          ctx.globalAlpha *= code * a;
          ctx.strokeStyle = rgba(DIGI, 0.25);
          ctx.lineWidth = 1.5;
          for (let r = 0; r < 6; r++) line(ctx, x - 120, 410 + r * 44, x - 40 + hash(r + i * 7, 3) * 150, 410 + r * 44);
          text(ctx, '{ }', x + 96, 410, { size: 28, family: 'mono', weight: 700, color: C.digital });
          ctx.restore();
        }
        icon(ctx, ic, x, 510, 1.4, C.cream, a);
        text(ctx, s, x, 630, { size: 32, family: 'serif', italic: true, color: C.cream, alpha: a });
      });
      text(ctx, 'hepimizin işi', W / 2, 860, { size: 56, family: 'serif', italic: true, color: C.flame, alpha: al * after(t, 'who-all', 5, 0.6) });
    }
  };

  // ---------------------------------------------------------------------------
  // 8 · Çırak, kalfa, usta
  // ---------------------------------------------------------------------------

  const ROLES3 = [
    { name: 'ÇIRAK', verb: 'izler', x: 420, line: 'cr-cirak', items: ['bakmayı', 'tezgâhı temiz bırakmayı', 'sabretmeyi'], o: { child: true, tool: 'broom' } },
    { name: 'KALFA', verb: 'yapar', x: 960, line: 'cr-kalfa', items: ['üretir', 'hata yapar', 'hatasından döner'], o: { apron: true } },
    { name: 'USTA', verb: 'öğretir', x: 1500, line: 'cr-usta', items: ['öğretir', 'sorumluluk taşır', 'işinin arkasında durur'], o: { apron: true, tall: 1.05 } },
  ];

  function workshop(ctx, t, a) {
    const wall = ctx.createLinearGradient(0, 0, 0, H);
    wall.addColorStop(0, '#1a120c');
    wall.addColorStop(1, '#0c0806');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 120) line(ctx, x, 0, x, 760);
    glow(ctx, W / 2, 120, 900, [255, 190, 120], 0.16 * a);
    // duvardaki aletler
    ctx.save();
    ctx.globalAlpha *= a * 0.7;
    ctx.fillStyle = '#2a1e14';
    ctx.fillRect(160, 250, 1600, 10);
    const tools = [[250, 'hammer'], [420, 'saw'], [600, 'file'], [1320, 'hammer'], [1500, 'file'], [1680, 'saw']];
    tools.forEach(([x, k]) => {
      ctx.fillStyle = '#3a2a1c';
      if (k === 'hammer') {
        ctx.fillRect(x - 4, 260, 8, 110);
        ctx.fillRect(x - 26, 260, 52, 22);
      } else if (k === 'saw') {
        poly(ctx, [[x - 50, 270], [x + 50, 270], [x + 50, 300], [x - 40, 330]]);
        ctx.fill();
      } else {
        ctx.fillRect(x - 5, 260, 10, 130);
        ctx.fillRect(x - 9, 260, 18, 36);
      }
    });
    ctx.restore();
    // tezgâh
    ctx.fillStyle = '#3b2716';
    ctx.fillRect(0, 760, W, 40);
    ctx.fillStyle = '#24170d';
    ctx.fillRect(0, 800, W, 280);
  }

  DRAW.craft = function sceneCraft(ctx, lt, t) {
    workshop(ctx, t, progress(lt, 0, 1.2));
    const today = after(t, 'cr-today', 0, 1.0);
    const ethics = after(t, 'cr-ethics', 0, 0.8);
    const motto = after(t, 'cr-motto', 0, 0.8);
    const stage = (1 - today) * (1 - ethics);
    text(ctx, 'çok eski, bilge bir düzen', W / 2, 160, { size: 46, family: 'serif', italic: true, color: C.flame, alpha: after(t, 'cr-old', 1, 0.6) * (1 - after(t, 'cr-cirak', 0, 0.5)) });
    ROLES3.forEach((R, i) => {
      const a = after(t, R.line, 0, 0.6) * stage;
      ctx.save();
      ctx.globalAlpha *= Math.max(0.15 * stage, a);
      person(ctx, R.x, 760, 1.6, { ...R.o, color: '#0a0604' });
      ctx.restore();
      if (a <= 0) return;
      glow(ctx, R.x, 560, 200, FIRE, 0.14 * a);
      text(ctx, R.name, R.x, 380, { size: 34, weight: 800, spacing: 10, color: C.flame, alpha: a });
      text(ctx, R.verb, R.x, 432, { size: 36, family: 'serif', italic: true, color: C.cream, alpha: a });
      R.items.forEach((s, j) => chip(ctx, s, R.x, 860 + j * 66, a * after(t, R.line, j + 1, 0.4), { size: 24 }));
      // kalfanın eğesi ve kıvılcımlar
      if (i === 1) {
        const sp = (t * 3) % 1;
        for (let k = 0; k < 5; k++) {
          ctx.fillStyle = rgba(FIRE, a * (1 - sp));
          dot(ctx, R.x + 50 + sp * 40 * Math.cos(k), 700 - sp * 50 * Math.sin(k + 1), 2.4);
        }
        const err = after(t, 'cr-kalfa', 2, 0.3) * (1 - after(t, 'cr-kalfa', 3, 0.3));
        text(ctx, '✗', R.x + 110, 560, { size: 60, weight: 800, color: C.error, alpha: err * a });
        text(ctx, '✓', R.x + 110, 560, { size: 60, weight: 800, color: C.ok, alpha: after(t, 'cr-kalfa', 3, 0.4) * a });
      }
    });
    // Ahilik: önce ahlak, sonra sanat
    const ahi = after(t, 'cr-ahi', 0, 0.8) * (1 - today);
    if (ahi > 0) {
      ctx.fillStyle = `rgba(12,8,5,${0.93 * ahi})`;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.globalAlpha *= ahi;
      ctx.translate(W / 2, 330);
      ctx.strokeStyle = C.flame;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 130, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 112, 0, Math.PI * 2);
      ctx.stroke();
      for (let k = 0; k < 8; k++) {
        ctx.save();
        ctx.rotate((k / 8) * Math.PI * 2 + t * 0.05);
        ctx.beginPath();
        ctx.ellipse(0, -96, 8, 14, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      text(ctx, 'AHİLİK', W / 2, 332, { size: 32, weight: 800, spacing: 6, color: C.flame, alpha: ahi });
      // terazi
      const tilt = 0.18 * after(t, 'cr-ahi', 4, 0.8);
      const sx = W / 2;
      const sy = 650;
      ctx.save();
      ctx.globalAlpha *= ahi * after(t, 'cr-ahi', 2, 0.5);
      ctx.strokeStyle = C.cream;
      ctx.lineWidth = 4;
      line(ctx, sx, sy - 40, sx, sy + 200);
      line(ctx, sx - 80, sy + 200, sx + 80, sy + 200);
      ctx.translate(sx, sy - 40);
      ctx.rotate(-tilt);
      line(ctx, -260, 0, 260, 0);
      [[-260, 'ahlak', C.ok], [260, 'sanat', C.fire]].forEach(([x, s, col]) => {
        ctx.save();
        ctx.translate(x, 0);
        ctx.rotate(tilt);
        line(ctx, 0, 0, -50, 90);
        line(ctx, 0, 0, 50, 90);
        ctx.beginPath();
        ctx.ellipse(0, 92, 70, 14, 0, 0, Math.PI);
        ctx.stroke();
        text(ctx, s, 0, 140, { size: 38, family: 'serif', italic: true, color: col });
        ctx.restore();
      });
      ctx.restore();
      text(ctx, 'önce ahlak, sonra sanat', W / 2, 1000, { size: 46, family: 'serif', italic: true, color: C.cream, alpha: ahi * after(t, 'cr-ahi', 4, 0.6) });
    }
    // bugünün atölyesi
    const td = today * (1 - ethics);
    if (td > 0) {
      ctx.fillStyle = `rgba(6,8,16,${0.85 * td})`;
      ctx.fillRect(0, 0, W, H);
      chip(ctx, 'tezgâh → bilgisayar', 620, 160, td * after(t, 'cr-today', 0, 0.5), { size: 30, border: C.fire });
      chip(ctx, 'eğe → kod düzenleyici', 1300, 160, td * after(t, 'cr-today', 1, 0.5), { size: 30, border: C.fire });
      const P3 = [['ÇIRAK', 'başkasının kodunu okur', 3], ['KALFA', 'küçük bir parçasını yazar', 4], ['USTA', 'bütünün sorumluluğunu taşır', 5]];
      P3.forEach(([nm, s, k], i) => {
        const a = td * after(t, 'cr-today', k, 0.5);
        const x = 380 + i * 580;
        panel(ctx, x - 230, 330, 460, 420, a, i === 2 ? C.fire : C.line, 'rgba(10,15,30,0.95)', 22);
        text(ctx, nm, x, 380, { size: 26, weight: 800, spacing: 8, color: C.flame, alpha: a });
        ctx.save();
        ctx.globalAlpha *= a;
        for (let r = 0; r < 7; r++) {
          const w = 120 + hash(r + i * 9, 5) * 220;
          const mine = i === 1 && r >= 3 && r <= 4;
          ctx.fillStyle = mine ? rgba(FIRE, 0.9) : rgba(DIGI, i === 2 ? 0.55 : 0.3);
          ctx.fillRect(x - 190 + (r % 3) * 20, 430 + r * 34, w, 10);
        }
        if (i === 0) icon(ctx, 'eye', x + 140, 650, 0.8, C.cream, 1);
        if (i === 1 && Math.floor(t * 2.5) % 2 === 0) {
          ctx.fillStyle = C.flame;
          ctx.fillRect(x + 80, 534, 4, 30);
        }
        if (i === 2) icon(ctx, 'shield', x + 150, 660, 0.9, C.fire, 1);
        ctx.restore();
        text(ctx, s, x, 712, { size: 28, family: 'serif', italic: true, color: C.cream, alpha: a });
      });
      text(ctx, 'düzen aynı', W / 2, 860, { size: 52, family: 'serif', italic: true, color: C.flame, alpha: td * after(t, 'cr-today', 2, 0.6) });
    }
    // etik: her konunun içinde
    const et = ethics * (1 - motto);
    if (et > 0) {
      ctx.fillStyle = `rgba(6,8,16,${0.9 * et})`;
      ctx.fillRect(0, 0, W, H);
      chip(ctx, 'nasıl kurulur?', 640, 260, et * after(t, 'cr-ethics', 2, 0.5), { size: 32, border: C.digital, color: C.digital });
      chip(ctx, 'neden böyle kurulmalı?', 1260, 260, et * after(t, 'cr-ethics', 3, 0.5), { size: 32, border: C.fire, color: C.flame });
      const card = et * after(t, 'cr-ethics', 4, 0.6);
      if (card > 0) {
        ctx.save();
        ctx.globalAlpha *= card;
        paperCard(ctx, 660, 400, 600, 340, 20);
        ctx.fillStyle = '#c9bea6';
        ctx.fillRect(700, 440, 160, 200);
        icon(ctx, 'person', 780, 540, 1.6, '#6b6252', 1);
        ['ad soyad', 'doğum tarihi', 'adres', 'sağlık kaydı'].forEach((s, i) => {
          text(ctx, s, 900, 470 + i * 44, { size: 22, weight: 700, color: C.inkSoft, align: 'left' });
          ctx.fillStyle = 'rgba(27,31,42,0.25)';
          ctx.fillRect(1070, 462 + i * 44, 140, 12);
        });
        ctx.restore();
        icon(ctx, 'heart', 1200, 700, 0.8, C.error, card);
      }
      text(ctx, 'bu veri, bir insana ait', W / 2, 840, { size: 48, family: 'serif', italic: true, color: C.cream, alpha: et * after(t, 'cr-ethics', 5, 0.6) });
    }
    // yetenek ve karakter
    if (motto > 0) {
      ctx.fillStyle = `rgba(6,8,16,${0.92 * motto})`;
      ctx.fillRect(0, 0, W, H);
      const g = progress(t, cue('cr-motto', 0), cue('cr-motto', 0) + 2.4, ease.inOut);
      const bars = [['yetenek', C.fire, 0.95], ['karakter', C.ok, 0.42]];
      bars.forEach(([s, col, k], i) => {
        const y = 330 + i * 120;
        text(ctx, s, 520, y, { size: 36, family: 'serif', italic: true, color: C.cream, align: 'right', alpha: motto });
        ctx.save();
        ctx.globalAlpha *= motto;
        ctx.fillStyle = '#141c2e';
        roundRect(ctx, 560, y - 26, 900, 52, 26);
        ctx.fill();
        ctx.fillStyle = col;
        roundRect(ctx, 560, y - 26, Math.max(52, 900 * k * g), 52, 26);
        ctx.fill();
        ctx.restore();
      });
      const gap = g * motto;
      if (gap > 0.3) {
        const x0 = 560 + 900 * 0.42 * g;
        const x1 = 560 + 900 * 0.95 * g;
        ctx.save();
        ctx.globalAlpha *= gap;
        ctx.fillStyle = 'rgba(255,84,104,0.18)';
        ctx.fillRect(x0, 270, x1 - x0, 210);
        ctx.restore();
        text(ctx, 'tehlike', (x0 + x1) / 2, 520, { size: 34, weight: 800, spacing: 6, color: C.error, alpha: after(t, 'cr-motto', 1, 0.5) });
      }
      text(ctx, 'Yeteneğin karakterden hızlı büyüdüğü', W / 2, 720, { size: 58, family: 'serif', italic: true, color: C.cream, alpha: after(t, 'cr-motto', 0, 0.8) });
      text(ctx, 'her yerde tehlike vardır.', W / 2, 800, { size: 58, family: 'serif', italic: true, color: C.cream, alpha: after(t, 'cr-motto', 1, 0.8) });
    }
  };

  // ---------------------------------------------------------------------------
  // 9 · Kendi taşını yontmak
  // ---------------------------------------------------------------------------

  const MODERN = [['birkaç satır kod', 2, 'code'], ['tek bir ekran', 3, 'window'], ['küçük bir ağ', 4, 'globe']];

  function miniPhone(ctx, x, y, s, label, a, warm) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    glow(ctx, 0, 0, 160, warm ? WARM : DIGI, 0.3);
    roundRect(ctx, -50, -95, 100, 190, 18);
    ctx.fillStyle = '#0b0e16';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2a3247';
    ctx.stroke();
    roundRect(ctx, -40, -84, 80, 168, 12);
    ctx.fillStyle = '#16233c';
    ctx.fill();
    roundRect(ctx, -32, -20, 64, 30, 10);
    ctx.fillStyle = '#ffb05e';
    ctx.fill();
    ctx.restore();
    text(ctx, label, x, y + 130 * s, { size: 30, family: 'serif', italic: true, color: C.cream, alpha: a });
  }

  DRAW.stone = function sceneStone(ctx, lt, t) {
    // taş ustaları: alacakaranlıkta yükselen köprü
    const night = after(t, 'st-today', 0, 1.2);
    duskSky(ctx, t, 1 - night);
    if (night > 0) {
      ctx.fillStyle = `rgba(4,6,12,${0.85 * night})`;
      ctx.fillRect(0, 0, W, H);
      drawStars(ctx, t, night, 700, 71);
    }
    drawRiver(ctx, t, night > 0.5 ? { top: '#0a1424', bottom: '#04080e' } : {});
    const build = bp(lt, 'st-masons', 0.3, BE('st-masons') - B('st-masons') - 1.2, ease.inOut);
    const realA = 1 - night;
    if (realA > 0) {
      ctx.save();
      ctx.globalAlpha *= realA;
      drawBridge(ctx, t, { build: lerp(0.25, 1, build) });
      ctx.restore();
    }
    nearBank(ctx, realA);
    // ustalar yontar, sonra hayalete döner
    const gone = after(t, 'st-masons', 1, 1.2);
    [[260, 0], [430, 1], [1500, 2], [1680, 3]].forEach(([x, i]) => {
      const a = realA * (1 - 0.8 * gone);
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha *= a;
      craftsman(ctx, x, 905, 1.2, 'taşçı', 1, gone > 0.5 ? 'rgba(200,190,170,0.5)' : '#140e0a');
      ctx.restore();
      const strike = (t * 1.4 + i * 0.3) % 1;
      if (strike < 0.15 && gone < 0.5) {
        for (let k = 0; k < 5; k++) {
          ctx.fillStyle = rgba(FIRE, (0.15 - strike) * 6 * a);
          dot(ctx, x + 60 + k * 6, 760 - k * 8 - strike * 80, 2.4);
        }
      }
    });
    // ilk yolcu: ustalar göremedi
    const walk = progress(t, cue('st-masons', 2), lineEnd('st-masons') + 0.6, ease.linear);
    if (walk > 0 && realA > 0) {
      const x = lerp(140, 1780, walk);
      ctx.save();
      ctx.globalAlpha *= realA * vis(walk, 0, 1, 0.05, 0.05);
      glow(ctx, x, deckY(x) - 60, 110, WARM, 0.35);
      person(ctx, x, deckY(x) + 2, 0.9, { color: '#0a0706', tool: 'staff' });
      ctx.restore();
    }
    text(ctx, 'kendi taşını, bütünün bir parçası olacağını bilerek', W / 2, 160, { size: 42, family: 'serif', italic: true, color: C.cream, alpha: realA * after(t, 'st-masons', 3, 0.8) });

    // bugünün taşları
    const today = night;
    if (today > 0) {
      const fly = after(t, 'st-bridge', 1, 1.6, ease.inOut);
      MODERN.forEach(([s, k, ic], i) => {
        const a = today * after(t, 'st-today', k, 0.5);
        if (a <= 0) return;
        const x0 = 520 + i * 440;
        const y0 = 820;
        const [tx, ty] = archPt(-0.5 + i * 0.5, 0.5);
        const x = lerp(x0, tx, fly);
        const y = lerp(y0, ty - 120, fly);
        const sc = lerp(1, 0.45, fly);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(sc, sc);
        glow(ctx, 0, 0, 150, FIRE, 0.3 * a);
        panel(ctx, -150, -70, 300, 140, a, C.fire, 'rgba(40,24,10,0.92)', 14);
        icon(ctx, ic, -90, 0, 0.7, C.flame, a);
        text(ctx, s, 30, 2, { size: 30, family: 'serif', italic: true, color: C.cream, alpha: a * (1 - fly) });
        ctx.restore();
      });
      text(ctx, 'tek başına küçük', W / 2, 980, { size: 40, family: 'serif', italic: true, color: C.muted, alpha: today * after(t, 'st-today', 5, 0.6) * (1 - after(t, 'st-bridge', 0, 0.5)) });
      // görünmez köprü: Elif'ten Berk'e
      const arch = after(t, 'st-bridge', 1, 1.6);
      if (arch > 0) {
        ctx.save();
        ctx.translate(0, -120);
        drawBridge(ctx, t, { build: 1, ghost: arch });
        // köprünün taşları minik ışıklar
        for (let i = 0; i < BR.n; i++) {
          const [x, y] = archPt(-1 + (2 * (i + 0.5)) / BR.n, 0.5);
          const tw = 0.5 + 0.5 * Math.sin(t * 3 + i * 0.7);
          glow(ctx, x, y, 22, i % 3 ? DIGI : FIRE, 0.5 * arch * tw);
        }
        ctx.restore();
        miniPhone(ctx, 150, 640, 1, 'Elif', arch, true);
        miniPhone(ctx, 1770, 640, 1, 'Berk', arch, false);
        text(ctx, 'o görünmez köprünün birer taşı', W / 2, 960, { size: 42, family: 'serif', italic: true, color: C.flame, alpha: after(t, 'st-bridge', 2, 0.8) * (1 - after(t, 'st-welcome', 0, 0.6)) });
      }
      const wel = after(t, 'st-welcome', 3, 1.0) * (1 - after(t, 'st-next', 0, 0.8));
      text(ctx, 'Hoş geldiniz.', W / 2, 860, { size: 110, family: 'serif', italic: true, color: C.cream, alpha: wel, glow: 'rgba(255,170,90,0.45)', glowBlur: 40 });
      text(ctx, 'BİLİŞİM TEKNOLOJİLERİ YETKİNLİĞİ', W / 2, 980, { size: 28, weight: 600, spacing: 10, color: C.muted, alpha: wel });
      text(ctx, 'bütünü bir kez olsun görmek isteyenler için', W / 2, 160, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: after(t, 'st-welcome', 2, 0.6) * (1 - after(t, 'st-next', 0, 0.6)) });
    }
    // ilk kapıya geçiş: tek bir lamba, var ve yok
    const nx = after(t, 'st-next', 0, 0.8);
    if (nx > 0) {
      ctx.fillStyle = `rgba(4,6,12,${0.95 * nx})`;
      ctx.fillRect(0, 0, W, H);
      const blink = t > cue('st-next', 2) ? Math.floor((t - cue('st-next', 2)) * 2.2) % 2 === 0 : false;
      const on = t < cue('st-next', 2) ? false : blink;
      if (on) glow(ctx, W / 2, 500, 220, FIRE, 0.45 * nx);
      ctx.fillStyle = on ? C.flame : '#0b1120';
      dot(ctx, W / 2, 500, 34);
      if (!on) {
        ctx.strokeStyle = C.off;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(W / 2, 500, 34, 0, Math.PI * 2);
        ctx.stroke();
      }
      text(ctx, on ? '1' : '0', W / 2, 590, { size: 40, family: 'mono', weight: 700, color: on ? C.fire : C.off, alpha: nx * after(t, 'st-next', 2, 0.4) });
      text(ctx, 'BİRİNCİ KAPI', W / 2, 700, { size: 28, weight: 700, spacing: 12, color: C.muted, alpha: after(t, 'st-next', 1, 0.6) });
      text(ctx, 'Var ve Yok', W / 2, 770, { size: 64, family: 'serif', italic: true, color: C.cream, alpha: after(t, 'st-next', 2, 0.8) });
    }
  };

  // ---------------------------------------------------------------------------
  // Ses
  // ---------------------------------------------------------------------------

  function score(m, hz) {
    const { at, span } = TL;
    const untilEnd = (id, a, margin) => TL.scene(id).end - margin - at(id, a);
    const scenePad = (id, notes, opts = {}) => m.pad(at(id, 0), untilEnd(id, 0, 0.4), notes, { gain: 0.22, attack: 1.8, release: 2.6, ...opts });
    const ding = (tm, note, g = 0.1, pan = 0, decay = 2.4) => m.bell(tm, { freq: hz(note), gain: g, decay, pan });
    const pop = (tm, note, pan = 0, g = 0.07) => m.pop(tm, { freq: hz(note), gain: g, pan });
    const c = cue;

    // 0 · Açılış
    m.pad(0, untilEnd('open', 0, 0.3), ['D2', 'A2', 'D3'], { gain: 0.28, attack: 3, release: 2.5, cutoff: 600 });
    m.click(at('open', 1.6), { gain: 0.16, tone: 2600 });
    m.blip(at('open', 1.6), { freq: hz('A5'), dur: 0.5, slide: 0.5, type: 'sine', gain: 0.04 });
    m.boom(c('open-title', 1), { gain: 0.32 });
    ding(c('open-title', 1) + 0.05, 'D5', 0.14, 0, 3.5);
    ding(c('open-title', 1) + 0.4, 'A5', 0.07, 0.3, 3.5);

    // 1 · Gece yarısı
    scenePad('night', ['F2', 'C3', 'A3', 'E4'], { gain: 0.2, cutoff: 700 });
    m.hum(at('night', 0.4), span('night', 0.4, 6), { gain: 0.015 });
    pop(c('night-berk', 0) + 0.3, 'E5', 0.2);
    pop(c('night-berk', 2) + 0.1, 'C5', 0.2);
    const n = MSG.length;
    for (let i = 0; i < n; i++) m.typeKey(typeStart() + (i * TYPE_D) / n, { gain: 0.07, pan: 0.3 });
    m.whoosh(sendAt(), { dur: 0.35, from: 900, to: 3200, gain: 0.07, panFrom: 0.2, panTo: 0.5 });
    m.blip(sendAt() + 0.05, { freq: hz('E6'), dur: 0.08, type: 'sine', gain: 0.06 });
    m.blip(sendAt() + 0.14, { freq: hz('A6'), dur: 0.1, type: 'sine', gain: 0.05 });
    ding(c('night-simple', 1) + 0.3, 'C6', 0.06, -0.4, 3);
    m.riser(c('night-hidden', 0), Math.max(1, sceneEnd('night') - c('night-hidden', 0)), { gain: 0.06 });

    // 2 · Yolculuk
    scenePad('journey', ['D2', 'A2', 'E3', 'B3'], { gain: 0.2, attack: 1 });
    for (let tm = at('journey', 0.6); tm < sceneEnd('journey') - 1; tm += 0.5) m.tick(tm, { gain: 0.012, tone: 1800 });
    JR.forEach(([id, s], i) => {
      if (i && JR[i - 1][1] !== s) m.whoosh(at('journey', B(id)), { dur: 1.1, from: 300, to: 1500, gain: 0.05, panFrom: 0.6, panTo: -0.6 });
    });
    for (let k = 0; k < 24; k++) m.tick(c('jr-switch', 1) + k * 0.06, { gain: 0.03, tone: 3200 + (k % 5) * 300 });
    [0, 1, 2].forEach((i) => ding(c('jr-switch', 3) + i * 0.3, ['D5', 'F5', 'A5'][i], 0.06, -0.5));
    ding(c('jr-switch', 4) + 0.1, 'D6', 0.08);
    CODE.forEach((_, i) => m.blip(c('jr-program', 1) + 0.2 + i * 0.55, { freq: hz(['A4', 'C5', 'E5', 'G5', 'A5'][i]), dur: 0.1, type: 'square', gain: 0.025 }));
    for (let i = 0; i < MSG.length; i++) m.tick(c('jr-memory', 1) + (i / MSG.length) * 2.2, { gain: 0.035, tone: 2600 });
    for (let k = 0; k < 4; k++) m.blip(c('jr-wifi', 0) + k * 0.35, { freq: 1200 + k * 200, dur: 0.25, slide: 1.5, type: 'sine', gain: 0.025, pan: -0.4 + k * 0.25 });
    m.whoosh(c('jr-fiber', 1), { dur: 2.4, from: 2000, to: 9000, gain: 0.04, q: 2 });
    [2, 3, 4].forEach((k, i) => pop(c('jr-fiber', k), ['E5', 'G5', 'B5'][i], -0.3 + i * 0.3, 0.05));
    PATH.forEach((_, i) => m.click(c('jr-routers', 1) + i * 0.42, { gain: 0.08, tone: 1800 + i * 150, pan: -0.7 + i * 0.23 }));
    ding(c('jr-db', 1) + 0.1, 'G5', 0.08, 0.3);
    m.glitch(c('jr-lock', 0) + 0.2, 1.4, { gain: 0.03 });
    m.click(c('jr-lock', 0) + 1.5, { gain: 0.2, tone: 900 });
    m.buzz(c('jr-lock', 2) + 0.2, { gain: 0.03, dur: 0.3 });
    pop(c('jr-arrive', 0) + 0.2, 'A5', 0.3, 0.08);
    for (let i = 0; i < 8; i++) m.tick(c('jr-arrive', 1) + i * 0.12, { gain: 0.03, tone: 4000 - i * 200, pan: -0.6 + i * 0.1 });
    ding(c('jr-left', 1) + 0.2, 'D5', 0.1, 0, 3.5);
    ding(c('jr-left', 1) + 0.24, 'F#5', 0.06, 0, 3.5);
    m.riser(c('jr-course', 0) - 0.4, 1.2, { gain: 0.04 });
    ding(c('jr-course', 1) + 0.2, 'A5', 0.09, 0, 3);

    // 3 · Köprü
    m.pad(at('bridge', 0), untilEnd('bridge', 0, 0.4), ['D2', 'A2', 'F3', 'C4'], { gain: 0.26, attack: 2.4, release: 3, cutoff: 650 });
    m.wind(at('bridge', 0.2), span('bridge', 0.2, B('br-see') + 2), { gain: 0.03 });
    m.rain(at('bridge', 0.2), span('bridge', 0.2, BE('br-cross')), { gain: 0.006 });
    for (let k = 0; k < 16; k++) m.click(at('bridge', B('br-intro') + 0.4 + k * 0.22), { gain: 0.05, tone: 700 + hash(k, 3) * 400, pan: (k % 2 ? 0.3 : -0.3) });
    m.boom(c('br-intro', 3), { gain: 0.26, freq: 55 });
    ding(c('br-intro', 3) + 0.05, 'D5', 0.1, 0, 3.5);
    [1, 2, 3].forEach((k, i) => m.boom(c('br-forces', k), { gain: 0.1 + i * 0.03, freq: 60 - i * 5 }));
    m.click(at('bridge', B('br-master') + 3.1), { gain: 0.22, tone: 600 });
    MASONS.forEach((mm) => pop(c('br-team', mm.k), 'D5', (mm.x - W / 2) / W, 0.05));
    ['D5', 'F5', 'A5', 'C6'].forEach((nn, i) => ding(c('br-harmony', 2) + i * 0.18, nn, 0.06, -0.4 + i * 0.25, 3));
    for (let k = 0; k < 12; k++) m.hoof(at('bridge', B('br-cross') + 0.6 + k * 0.45), { gain: 0.02, pan: -0.8 + k * 0.14 });

    // 4 · Görünmez köprü
    scenePad('web', ['A2', 'E3', 'B3', 'F#4'], { gain: 0.22 });
    m.whoosh(c('inv-second', 2), { dur: 1.6, from: 300, to: 2400, gain: 0.05 });
    m.hum(c('inv-parts', 2), Math.max(1, sceneEnd('web') - c('inv-parts', 2) - 0.5), { gain: 0.02 });
    [0, 1, 2, 3].forEach((k, i) => pop(c('inv-parts', k), ['A4', 'C#5', 'E5', 'A5'][i], -0.3 + i * 0.2, 0.06));
    ding(c('inv-unseen', 1) + 0.2, 'F#5', 0.07, 0, 3);
    LIFE.forEach((L) => pop(c('inv-life', L.k), 'E5', (L.x - W / 2) / W, 0.06));
    ['A4', 'C#5', 'E5', 'A5'].forEach((nn, i) => ding(c('inv-life', 6) + i * 0.12, nn, 0.06, 0, 2.6));

    // 5 · Kurulan
    scenePad('build', ['C3', 'G3', 'E4', 'B4'], { gain: 0.2 });
    m.click(c('bd-surface', 2) + 0.1, { gain: 0.18, tone: 1400 });
    ding(c('bd-surface', 3) + 0.1, 'E5', 0.07);
    m.click(c('bd-surface', 4) + 0.1, { gain: 0.1, tone: 2600 });
    m.whoosh(c('bd-surface', 5), { dur: 0.8, from: 600, to: 1800, gain: 0.04, panFrom: 0.8, panTo: 0.5 });
    m.buzz(c('bd-claim', 2) + 0.2, { gain: 0.03, dur: 0.25 });
    m.boom(c('bd-claim', 3), { gain: 0.26 });
    ding(c('bd-claim', 3) + 0.05, 'C5', 0.12, 0, 3.5);
    ding(c('bd-claim', 3) + 0.3, 'G5', 0.07, 0, 3.5);
    m.riser(c('bd-decide', 0), 1.4, { gain: 0.04 });

    // 6 · Bütüncül bakış
    scenePad('chain', ['D2', 'A2', 'F#3', 'C#4'], { gain: 0.22 });
    BOXES.forEach((_, i) => pop(c('ch-split', i + 1), ['D5', 'E5', 'F#5', 'A5'][i], -0.6 + i * 0.4, 0.06));
    [0, 1, 2, 3].forEach((i) => m.boom(c('ch-real', 1) + 0.3 + i * 0.2, { gain: 0.06, freq: 80 - i * 6 }));
    LINKS.forEach((L, i) => {
      m.buzz(c(L.line, L.k) + 0.2, { gain: 0.02, dur: 0.2 });
      ding(c(L.line, L.k + 1) + 0.3, ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6'][i], 0.07, -0.5 + i * 0.2, 2.6);
    });
    for (let k = 0; k < 12; k++) m.tick(c('ch-revisit', 3) + k * 0.06, { gain: 0.03, tone: 2000 + k * 150 });
    m.whoosh(c('ch-revisit', 4), { dur: 2.6, from: 1600, to: 300, gain: 0.04 });
    m.boom(c('ch-whole', 2), { gain: 0.2 });
    ['D5', 'F#5', 'A5', 'D6'].forEach((nn, i) => ding(c('ch-whole', 2) + 0.05 + i * 0.16, nn, 0.06, -0.3 + i * 0.2, 3));

    // 7 · Kimin için
    scenePad('who', ['G2', 'D3', 'B3', 'E4'], { gain: 0.22 });
    ding(c('who-everyone', 0) + 0.2, 'B4', 0.08);
    for (let i = 0; i < 8; i++) pop(c('who-everyone', 1) + i * 0.08, ['G4', 'B4', 'D5', 'E5'][i % 4], -0.7 + i * 0.2, 0.04);
    m.glitch(c('who-learner', 3) + 0.4, 0.6, { gain: 0.03 });
    ding(c('who-learner', 5) + 0.2, 'D6', 0.08);
    [2, 3, 4, 5].forEach((k, i) => pop(c('who-thinking', k), ['G4', 'B4', 'D5', 'G5'][i], -0.6 + i * 0.4, 0.06));
    ding(c('who-thinking', 6) + 0.2, 'G5', 0.09, 0, 3);
    m.whoosh(c('who-side', 1), { dur: 1, from: 500, to: 1500, gain: 0.04 });
    [3, 4, 5, 6].forEach((k, i) => pop(c('who-two', k), ['E5', 'G5', 'B5', 'D6'][i], 0.4, 0.05));
    for (let k = 0; k < 6; k++) m.click(c('who-two', 8) + k * 0.12, { gain: 0.05, tone: 1400 + k * 100, pan: -0.2 });
    ding(c('who-all', 5) + 0.2, 'G5', 0.09, 0, 3);

    // 8 · Atölye
    m.pad(at('craft', 0), untilEnd('craft', 0, 0.4), ['C2', 'G2', 'E3', 'A3'], { gain: 0.24, attack: 2, release: 2.6, cutoff: 700 });
    for (let k = 0; k < 6; k++) m.click(at('craft', 0.8) + k * 0.7, { gain: 0.04, tone: 500 + k * 40, pan: -0.5 + k * 0.2 });
    pop(c('cr-cirak', 0), 'C5', -0.6);
    pop(c('cr-kalfa', 0), 'E5', 0);
    for (let k = 0; k < 8; k++) m.staticNoise(c('cr-kalfa', 1) + k * 0.3, 0.12, { gain: 0.02 });
    m.buzz(c('cr-kalfa', 2) + 0.1, { gain: 0.03, dur: 0.2 });
    ding(c('cr-kalfa', 3) + 0.1, 'G5', 0.07);
    pop(c('cr-usta', 0), 'G5', 0.6);
    m.boom(c('cr-ahi', 0), { gain: 0.24, freq: 55 });
    ding(c('cr-ahi', 0) + 0.05, 'C5', 0.1, 0, 3.5);
    ding(c('cr-ahi', 4) + 0.2, 'E5', 0.08, 0, 3);
    [3, 4, 5].forEach((k, i) => pop(c('cr-today', k), ['C5', 'E5', 'G5'][i], -0.5 + i * 0.5, 0.06));
    [2, 3].forEach((k, i) => pop(c('cr-ethics', k), ['A4', 'C5'][i], -0.3 + i * 0.6, 0.06));
    m.heartbeat(c('cr-ethics', 4) + 0.4, { gain: 0.18 });
    m.riser(c('cr-motto', 0), 2.4, { gain: 0.05 });
    m.boom(c('cr-motto', 1), { gain: 0.28, freq: 50 });
    ding(c('cr-motto', 1) + 0.05, 'C5', 0.1, 0, 4);

    // 9 · Taş
    m.pad(at('stone', 0), untilEnd('stone', 0, 0.2), ['D2', 'A2', 'D3', 'F#3', 'A3'], { gain: 0.28, attack: 2.4, release: 3, cutoff: 800 });
    for (let k = 0; k < 14; k++) m.click(at('stone', 0.6) + k * 0.71, { gain: 0.05, tone: 900 + hash(k, 2) * 300, pan: k % 2 ? 0.6 : -0.6 });
    m.wind(c('st-masons', 1), 2.4, { gain: 0.03 });
    [2, 3, 4].forEach((k, i) => pop(c('st-today', k), ['D5', 'F#5', 'A5'][i], -0.4 + i * 0.4, 0.07));
    m.whoosh(c('st-bridge', 1), { dur: 1.6, from: 400, to: 2400, gain: 0.05 });
    ['D5', 'F#5', 'A5', 'D6'].forEach((nn, i) => ding(c('st-bridge', 2) + i * 0.2, nn, 0.07, -0.4 + i * 0.25, 3));
    m.boom(c('st-welcome', 3), { gain: 0.32 });
    ding(c('st-welcome', 3) + 0.05, 'D5', 0.14, 0, 4);
    ding(c('st-welcome', 3) + 0.5, 'A5', 0.08, 0, 4);
    const nx = c('st-next', 2);
    for (let k = 0; k < 6; k++) m.click(nx + k / 2.2, { gain: 0.12, tone: k % 2 ? 900 : 1600 });
  }

  window.FILM = E.film({
    title: 'Önsöz — Gece Yarısı Dokunulan Cam',
    timeline: TL,
    background,
    score,
    narration: VOICE,
    voice: VOICE.voice,
  });
})();
