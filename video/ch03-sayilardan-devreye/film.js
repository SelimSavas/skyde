/*
 * Birinci Kapı, 3. bölüm — Sayılardan Devreye: Elektriğin Hesap Yapması
 * Kapılardan toplayıcıya, toplamadan bütün aritmetiğe; saat darbesi ve kendini tutan devre.
 *
 * Sahneler koreografi zamanıyla çizilir; anlatılan öğeler cue('satır', öbek) ile anlatıcının
 * söylediği anda belirir. Akım, kablolarda gerçek zamanla akar (beklemelerde de durmaz).
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
    stone: '#6c6a66',
    violet: '#b49cff',
  };
  const FIRE = [255, 150, 60];
  const COOL = [111, 128, 168];
  const DIGI = [124, 200, 255];

  // Sahneler ve koreografi süreleri (saniye). Gerçek süreler seslendirme beklemeleriyle uzar.
  const SCENES = [
    { id: 'open', base: 8, title: 'Açılış', draw: sceneOpen, fadeIn: 0.6 },
    { id: 'recap', base: 10, title: 'Elimizdeki kapılar', draw: sceneRecap },
    { id: 'count', base: 14, title: 'Saymak', draw: sceneCount },
    { id: 'add', base: 34, title: 'Yarım toplayıcı', draw: sceneAdd },
    { id: 'full', base: 22, title: 'Tam toplayıcı', draw: sceneFull },
    { id: 'chain', base: 18, title: 'Toplayıcı zinciri', draw: sceneChain },
    { id: 'mean', base: 20, title: 'Toplamayı bilmeyen makine', draw: sceneMean },
    { id: 'rest', base: 8, title: 'Geri kalan her şey', draw: sceneRest },
    { id: 'sub', base: 30, title: 'Çıkarma', draw: sceneSub },
    { id: 'mul', base: 28, title: 'Çarpma', draw: sceneMul },
    { id: 'div', base: 26, title: 'Bölme ve kök', draw: sceneDiv },
    { id: 'all', base: 24, title: 'Her şey toplamadır', draw: sceneAll },
    { id: 'clock', base: 40, title: 'Zamanı bölen metronom', draw: sceneClock },
    { id: 'myth', base: 24, title: 'Yaygın yanılgı', draw: sceneMyth },
    { id: 'mem', base: 40, title: 'Kendini tutan devre', draw: sceneMem },
    { id: 'ram', base: 34, title: 'Bellek ve elektrik', draw: sceneRam },
    { id: 'sum', base: 10, title: 'Özet', draw: sceneSum },
    { id: 'close', base: 4, title: 'Kapanış', draw: sceneClose, fadeOut: 1.4 },
  ];

  // Seslendirme vuruşları: [sahne, başlangıç, bitiş, donma anı] (koreografi zamanı).
  const BEATS = {
    'open.title': ['open', 3.3, 7.6, 7.0],
    'recap.gates': ['recap', 0.3, 5.0, 4.5],
    'recap.task': ['recap', 5.1, 10.0, 9.3],
    'count.decimal': ['count', 0.3, 7.0, 6.5],
    'count.binary': ['count', 7.1, 14.0, 13.3],
    'add.cases': ['add', 0.3, 6.0, 5.5],
    'add.carry': ['add', 6.1, 12.0, 11.3],
    'add.table': ['add', 12.1, 16.0, 15.3],
    'add.recognize': ['add', 16.1, 22.0, 21.3],
    'add.half': ['add', 22.1, 28.0, 27.3],
    'add.demo': ['add', 28.1, 34.0, 33.3],
    'full.why': ['full', 0.3, 6.0, 5.5],
    'full.example': ['full', 6.1, 14.0, 13.3],
    'full.build': ['full', 14.1, 22.0, 21.3],
    'chain.eight': ['chain', 0.3, 5.0, 4.5],
    'chain.demo': ['chain', 5.1, 12.0, 11.3],
    'chain.wide': ['chain', 12.1, 18.0, 17.3],
    'mean.quote': ['mean', 0.3, 6.0, 5.3],
    'mean.nomind': ['mean', 6.1, 13.0, 12.3],
    'mean.reader': ['mean', 13.1, 20.0, 19.3],
    'rest.question': ['rest', 0.3, 8.0, 7.3],
    'sub.idea': ['sub', 0.3, 5.0, 4.5],
    'sub.odometer': ['sub', 5.1, 13.0, 12.3],
    'sub.trick': ['sub', 13.1, 23.0, 22.3],
    'sub.binary': ['sub', 23.1, 30.0, 29.3],
    'mul.repeat': ['mul', 0.3, 6.0, 5.3],
    'mul.shift': ['mul', 6.1, 13.0, 12.3],
    'mul.example': ['mul', 13.1, 23.0, 22.3],
    'mul.fast': ['mul', 23.1, 28.0, 27.3],
    'div.repeat': ['div', 0.3, 9.0, 8.3],
    'div.root': ['div', 9.1, 14.0, 13.3],
    'div.sqrt': ['div', 14.1, 26.0, 25.3],
    'all.list': ['all', 0.3, 8.0, 7.3],
    'all.pixels': ['all', 8.1, 16.0, 15.3],
    'all.dome': ['all', 16.1, 24.0, 23.3],
    'clock.problem': ['clock', 0.3, 5.0, 4.5],
    'clock.delay': ['clock', 5.1, 13.0, 12.3],
    'clock.orchestra': ['clock', 13.1, 19.0, 18.3],
    'clock.crystal': ['clock', 19.1, 27.0, 26.3],
    'clock.settle': ['clock', 27.1, 32.0, 31.3],
    'clock.ghz': ['clock', 32.1, 37.0, 36.3],
    'clock.light': ['clock', 37.1, 40.0, 39.3],
    'myth.intro': ['myth', 0.3, 5.0, 4.5],
    'myth.work': ['myth', 5.1, 12.0, 11.3],
    'myth.example': ['myth', 12.1, 19.0, 18.3],
    'myth.end': ['myth', 19.1, 24.0, 23.3],
    'mem.question': ['mem', 0.3, 5.0, 4.5],
    'mem.forget': ['mem', 5.1, 12.0, 11.3],
    'mem.loop': ['mem', 12.1, 17.0, 16.3],
    'mem.hold': ['mem', 17.1, 26.0, 25.3],
    'mem.reset': ['mem', 26.1, 33.0, 32.3],
    'mem.bit': ['mem', 33.1, 40.0, 39.3],
    'ram.register': ['ram', 0.3, 8.0, 7.3],
    'ram.memory': ['ram', 8.1, 15.0, 14.3],
    'ram.volatile': ['ram', 15.1, 21.0, 20.3],
    'ram.homework': ['ram', 21.1, 27.0, 26.3],
    'ram.save': ['ram', 27.1, 34.0, 33.3],
    'sum.three': ['sum', 0.3, 10.0, 9.3],
    'close.end': ['close', 0.3, 4.0, 3.2],
  };

  // Kalabalık animasyonları yavaşlatma (vuruş → kat)
  const PACE = {};
  // Anlatıcı sustuktan sonra görüntünün biraz daha durması (sn): önemli sonuçlar ve sahne sonları
  const PAUSE = {
    'recap.task': 0.6,
    'count.binary': 0.8,
    'add.carry': 0.6,
    'add.half': 0.8,
    'add.demo': 0.8,
    'full.build': 1.0,
    'chain.demo': 0.8,
    'chain.wide': 0.8,
    'mean.quote': 1.4,
    'mean.reader': 1.0,
    'rest.question': 0.8,
    'sub.trick': 0.8,
    'sub.binary': 1.0,
    'mul.example': 0.8,
    'mul.fast': 0.8,
    'div.repeat': 0.6,
    'div.sqrt': 1.0,
    'all.pixels': 0.6,
    'all.dome': 1.2,
    'clock.delay': 0.6,
    'clock.orchestra': 0.8,
    'clock.crystal': 0.6,
    'clock.ghz': 0.8,
    'clock.light': 1.0,
    'myth.example': 0.6,
    'myth.end': 1.0,
    'mem.hold': 0.8,
    'mem.reset': 0.6,
    'mem.bit': 1.0,
    'ram.volatile': 0.6,
    'ram.homework': 0.8,
    'ram.save': 1.0,
    'sum.three': 1.4,
  };

  // Anlatıcı sustuktan sonra, beklemenin ardından vuruşun kalanı (donma → bitiş) bu nefes payında oynar
  const BREATH = 0.9;
  for (const [id, [scene, a, b, f]] of Object.entries(BEATS)) {
    if (f != null && !(f > a && f < b)) throw new Error(`${id}: donma anı vuruşun içinde olmalı`);
    if (f != null && (b - f) * (PACE[id] ?? 1) > BREATH + 1e-9) throw new Error(`${id}: donma anından sonrası nefes payından (${BREATH} sn) uzun`);
    for (const [other, [s2, a2, b2]] of Object.entries(BEATS)) {
      if (other !== id && s2 === scene && a < b2 && a2 < b) throw new Error(`${id} ile ${other} örtüşüyor`);
    }
  }

  const SCRIPT = window.NARRATION ?? { lines: [] };
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
  // cue anından itibaren d saniyede 0 → 1
  const after = (t, id, k = 0, d = 0.5, fn = ease.out) => progress(t, cue(id, k), cue(id, k) + d, fn);
  // İki cue arasında görünür (girişte ve çıkışta yumuşak)
  const between = (t, a, b, fi = 0.4, fo = 0.4) => vis(t, a, b, fi, fo);
  const clock = (id, t) => t - TL.scene(id).start;
  // Bir vuruşun görünürlüğü (koreografi zamanında, başında ve sonunda yumuşak)
  const beatVis = (lt, id, fi = 0.5, fo = 0.4) => {
    const [, a, b] = BEATS[id];
    return vis(lt, a, b, fi, fo);
  };
  // Birden çok ardışık vuruşa yayılan görünürlük
  const spanVis = (lt, first, last, fi = 0.5, fo = 0.4) => vis(lt, BEATS[first][1], BEATS[last][2], fi, fo);

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

  function kicker(ctx, str, lt, d) {
    const a = vis(lt, 0.2, d - 0.3, 0.6, 0.5);
    if (a <= 0) return;
    text(ctx, str, 120, 96, { size: 24, weight: 600, spacing: 8, color: C.muted, align: 'left', alpha: a });
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = C.fire;
    ctx.fillRect(120, 122, 44 * progress(lt, 0.3, 1.0, ease.out), 3);
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

  function paperCard(ctx, x, y, w, h) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    roundRect(ctx, x, y, w, h, 18);
    ctx.fillStyle = C.paper;
    ctx.fill();
    ctx.restore();
  }

  // Bir bit dizisini sıcak 1 / soğuk 0 olarak yazar
  function bitRuns(str, size) {
    return str.split('').map((b) => [b, { size, family: 'mono', weight: 700, color: b === '1' ? C.fire : C.off }]);
  }

  // Ampul: k = 0 (sönük) → 1 (tam yanık)
  function drawBulb(ctx, x, y, r, k, alpha = 1) {
    if (alpha <= 0.002) return;
    if (k > 0.01) glow(ctx, x, y, r * 3.6, FIRE, 0.42 * k * alpha);
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#111a2c';
    ctx.fill();
    ctx.lineWidth = Math.max(2, r * 0.08);
    ctx.strokeStyle = '#3c4862';
    ctx.stroke();
    if (k > 0.01) {
      ctx.globalAlpha *= k;
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      g.addColorStop(0, '#fff3cf');
      g.addColorStop(0.5, '#ffc062');
      g.addColorStop(1, '#ff8a2a');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha /= k;
    }
    ctx.fillStyle = k > 0.5 ? '#7a5e45' : '#2a3246';
    roundRect(ctx, x - r * 0.4, y + r * 0.86, r * 0.8, r * 0.46, r * 0.1);
    ctx.fill();
    ctx.restore();
  }

  // ---- Devre parçaları -------------------------------------------------------

  function pathLength(pts) {
    let n = 0;
    for (let i = 1; i < pts.length; i++) n += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return n;
  }

  function pointAt(pts, s) {
    for (let i = 1; i < pts.length; i++) {
      const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (s <= seg || i === pts.length - 1) {
        const p = seg ? clamp(s / seg) : 0;
        return [lerp(pts[i - 1][0], pts[i][0], p), lerp(pts[i - 1][1], pts[i][1], p)];
      }
      s -= seg;
    }
    return pts[pts.length - 1];
  }

  // Kablo: live = 0..1 akım (parlaklık ve akan noktalar), t gerçek zaman
  function drawWire(ctx, pts, live, t, alpha = 1, width = 6) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.strokeStyle = C.wire;
    ctx.lineWidth = width;
    ctx.stroke();
    if (live > 0.01) {
      ctx.strokeStyle = rgba(FIRE, 0.55 * live);
      ctx.lineWidth = width;
      ctx.stroke();
      const L = pathLength(pts);
      const gap = 44;
      ctx.fillStyle = rgba([255, 226, 150], live);
      for (let s = (t * 150) % gap; s < L; s += gap) {
        const [x, y] = pointAt(pts, s);
        dot(ctx, x, y, width * 0.6);
      }
    }
    ctx.restore();
  }

  // Anahtar: x1'deki menteşeden x2'deki kontağa uzanan kol. on: 0 (kalkık, yol açık) → 1 (temas)
  function drawSwitch(ctx, x1, x2, y, on, alpha = 1, opts = {}) {
    if (alpha <= 0.002) return;
    const len = x2 - x1;
    const ang = lerp(-0.6, 0, ease.inOut(clamp(on)));
    const col = on > 0.5 ? C.fire : C.off;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.lineCap = 'round';
    ctx.strokeStyle = col;
    ctx.lineWidth = 7;
    line(ctx, x1, y, x1 + Math.cos(ang) * len, y + Math.sin(ang) * len);
    ctx.fillStyle = C.cream;
    dot(ctx, x1, y, 9);
    ctx.fillStyle = on > 0.5 ? C.flame : C.dim;
    dot(ctx, x2, y, 9);
    ctx.restore();
    if (opts.label) text(ctx, opts.label, (x1 + x2) / 2, y - 70, { size: opts.size ?? 40, family: 'display', weight: 800, color: C.cream, alpha });
    if (opts.state) {
      const s = on > 0.5;
      text(ctx, s ? 'açık · 1' : 'kapalı · 0', (x1 + x2) / 2, y + 48, { size: 26, family: 'mono', weight: 700, color: s ? C.fire : C.off, alpha });
    }
  }

  // Pil (dikey): üst uç +, alt uç −
  function drawBattery(ctx, x, y, alpha = 1) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    roundRect(ctx, x - 34, y - 70, 68, 140, 12);
    ctx.fillStyle = '#1b2438';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#4a5878';
    ctx.stroke();
    roundRect(ctx, x - 34, y - 70, 68, 44, 12);
    ctx.fillStyle = 'rgba(255,165,71,0.75)';
    ctx.fill();
    ctx.fillStyle = '#4a5878';
    ctx.fillRect(x - 14, y - 82, 28, 12);
    ctx.restore();
    text(ctx, '+', x, y - 48, { size: 30, weight: 800, color: '#1b1f2a', alpha });
    text(ctx, '−', x, y + 40, { size: 30, weight: 800, color: C.muted, alpha });
    text(ctx, 'pil', x - 64, y, { size: 26, color: C.muted, align: 'right', alpha });
  }

  // Mantık kapısı simgeleri (genişlik ~170, yükseklik ~120, merkez x,y)
  function drawGate(ctx, kind, x, y, s, alpha = 1, col = C.cream, out = 0) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.lineWidth = 5 / Math.max(s, 0.4);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = col;
    ctx.fillStyle = 'rgba(13,21,40,0.9)';
    const ins = kind === 'not' ? [0] : [-28, 28];
    ctx.beginPath();
    if (kind === 'and') {
      ctx.moveTo(-60, -55);
      ctx.lineTo(0, -55);
      ctx.arc(0, 0, 55, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(-60, 55);
      ctx.closePath();
    } else if (kind === 'or' || kind === 'xor') {
      ctx.moveTo(-60, -55);
      ctx.quadraticCurveTo(10, -55, 60, 0);
      ctx.quadraticCurveTo(10, 55, -60, 55);
      ctx.quadraticCurveTo(-30, 0, -60, -55);
      ctx.closePath();
    } else {
      ctx.moveTo(-50, -48);
      ctx.lineTo(38, 0);
      ctx.lineTo(-50, 48);
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();
    if (kind === 'xor') {
      ctx.beginPath();
      ctx.moveTo(-76, -55);
      ctx.quadraticCurveTo(-46, 0, -76, 55);
      ctx.stroke();
    }
    if (kind === 'not') {
      ctx.beginPath();
      ctx.arc(48, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    // giriş ve çıkış uçları
    const leftX = kind === 'or' || kind === 'xor' ? -48 : -60;
    for (const iy of ins) line(ctx, -105, iy, kind === 'not' ? -50 : leftX + (kind === 'or' || kind === 'xor' ? 6 : 0), iy);
    const ox = kind === 'and' ? 55 : kind === 'not' ? 58 : 60;
    ctx.strokeStyle = out > 0.5 ? C.fire : col;
    line(ctx, ox, 0, 105, 0);
    ctx.restore();
  }

  const GATE_NAMES = { and: 'VE', or: 'VEYA', not: 'DEĞİL', xor: 'ÖZEL VEYA' };

  // Basit çizgi ikonlar
  function drawIcon(ctx, kind, x, y, s, color, alpha = 1, k = 0) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    switch (kind) {
      case 'bell': {
        const sw = Math.sin(k * 30) * 0.25 * k;
        ctx.rotate(sw);
        ctx.beginPath();
        ctx.moveTo(-36, 24);
        ctx.quadraticCurveTo(-30, -38, 0, -40);
        ctx.quadraticCurveTo(30, -38, 36, 24);
        ctx.closePath();
        ctx.stroke();
        line(ctx, -44, 24, 44, 24);
        dot(ctx, 0, 34, 7);
        line(ctx, 0, -40, 0, -50);
        break;
      }
      case 'button':
        roundRect(ctx, -34, -34, 68, 68, 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 16 - 4 * k, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'siren': {
        ctx.beginPath();
        ctx.moveTo(-30, 26);
        ctx.lineTo(-24, -14);
        ctx.quadraticCurveTo(0, -42, 24, -14);
        ctx.lineTo(30, 26);
        ctx.closePath();
        ctx.stroke();
        line(ctx, -40, 34, 40, 34);
        if (k > 0) {
          ctx.globalAlpha *= k;
          for (const d of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(0, -6, 52, d < 0 ? Math.PI * 1.05 : -Math.PI * 0.35, d < 0 ? Math.PI * 1.35 : -Math.PI * 0.05);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, -6, 66, d < 0 ? Math.PI * 1.05 : -Math.PI * 0.35, d < 0 ? Math.PI * 1.35 : -Math.PI * 0.05);
            ctx.stroke();
          }
        }
        break;
      }
      case 'door': {
        // iki kanatlı kapı; k: 0 kapalı → 1 açık
        roundRect(ctx, -46, -56, 92, 112, 4);
        ctx.stroke();
        const o = 40 * k;
        ctx.strokeRect(-44 - 0, -54, 44 - o, 108);
        ctx.strokeRect(0 + o, -54, 44 - o, 108);
        break;
      }
      case 'flame':
        ctx.beginPath();
        ctx.moveTo(0, -44);
        ctx.bezierCurveTo(30, -10, 34, 10, 22, 30);
        ctx.quadraticCurveTo(0, 46, -22, 30);
        ctx.bezierCurveTo(-34, 10, -14, -4, 0, -44);
        ctx.stroke();
        break;
      case 'lock':
        roundRect(ctx, -30, -6, 60, 46, 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -6, 20, Math.PI, 0);
        ctx.stroke();
        dot(ctx, 0, 16, 6);
        break;
      case 'calc':
        roundRect(ctx, -32, -46, 64, 92, 8);
        ctx.stroke();
        ctx.strokeRect(-22, -36, 44, 20);
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) ctx.fillRect(-20 + c * 15, -6 + r * 15, 9, 9);
        break;
      case 'person':
        dot(ctx, 0, -34, 11);
        ctx.beginPath();
        ctx.moveTo(-16, 30);
        ctx.lineTo(-12, -14);
        ctx.quadraticCurveTo(0, -24, 12, -14);
        ctx.lineTo(16, 30);
        ctx.closePath();
        ctx.fill();
        break;
      default:
        break;
    }
    ctx.restore();
  }

  // Kısmi çizgi: yolun ilk s pikseli
  function partialPath(ctx, pts, s) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length && s > 0; i++) {
      const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      const p = clamp(s / seg);
      ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], p), lerp(pts[i - 1][1], pts[i][1], p));
      s -= seg;
    }
    ctx.stroke();
  }

  // Durum dizisi: [[zaman, [değerler]], ...] → t anında i. değer (geçişler d saniyede yumuşak)
  function stateAt(list, t, i, d = 0.25, init = 0) {
    let prev = init;
    let cur = init;
    let at = -Infinity;
    for (const [tm, vals] of list) {
      if (t < tm) break;
      if (vals[i] !== cur) {
        prev = cur;
        cur = vals[i];
        at = tm;
      }
    }
    return lerp(prev, cur, ease.inOut(clamp((t - at) / d)));
  }
  // Bir durum dizisindeki değişim anları (ses için)
  function changes(list, n, init = 0) {
    const out = [];
    const cur = new Array(n).fill(init);
    for (const [tm, vals] of list) {
      for (let i = 0; i < n; i++) {
        if (vals[i] !== cur[i]) {
          out.push([tm, i, vals[i]]);
          cur[i] = vals[i];
        }
      }
    }
    return out;
  }

  // Küçük sonuç tablosu (sağ kenarda): satırlar sırayla eklenir
  function miniTable(ctx, x, y, heads, rows, alpha, rowAlpha) {
    if (alpha <= 0.002) return;
    const cw = 120;
    heads.forEach((h, i) => text(ctx, h, x + i * cw, y, { size: 26, weight: 700, spacing: 3, color: C.muted, alpha }));
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = C.line;
    ctx.fillRect(x - cw / 2, y + 26, cw * heads.length, 2);
    ctx.restore();
    rows.forEach((r, j) => {
      const a = alpha * rowAlpha(j);
      if (a <= 0) return;
      r.forEach((v, i) => {
        const last = i === r.length - 1;
        text(ctx, String(v), x + i * cw, y + 70 + j * 62, { size: 44, family: 'mono', weight: 700, color: v ? (last ? C.flame : C.fire) : C.off, alpha: a });
      });
    });
  }

  // ---- Taş ve kazınmış devre izleri (açılış, kubbe, kapanış) ----------------

  const TRACES = Array.from({ length: 9 }, (_, i) => {
    const y0 = 300 + i * 62;
    const pts = [[430, y0]];
    let x = 430;
    let y = y0;
    while (x < 1490) {
      x = Math.min(1490, x + 90 + hash(i * 13 + pts.length, 3) * 170);
      pts.push([x, y]);
      if (x < 1490 && hash(i * 7 + pts.length, 5) > 0.5) {
        const dy = (hash(i * 11 + pts.length, 6) > 0.5 ? 1 : -1) * 31;
        if (y + dy > 280 && y + dy < 820) {
          x += 31;
          y += dy;
          pts.push([x, y]);
        }
      }
    }
    return pts;
  });

  function drawStone(ctx, cx, cy, w, h, alpha = 1, seed = 1) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.beginPath();
    const n = 48;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rx = w / 2 * (1 + 0.03 * (noise(i * 0.7, seed) - 0.5));
      const ry = h / 2 * (1 + 0.04 * (noise(i * 0.9, seed + 1) - 0.5));
      const sx = Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 0.25);
      const sy = Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 0.25);
      const x = cx + sx * rx;
      const y = cy + sy * ry;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    const g = ctx.createLinearGradient(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2);
    g.addColorStop(0, '#3a3836');
    g.addColorStop(1, '#1d1c1b');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.02 + 0.05 * hash(i, seed + 7)})`;
      ctx.fillRect(cx - w / 2 + hash(i, seed + 8) * w, cy - h / 2 + hash(i, seed + 9) * h, 2, 2);
    }
    ctx.restore();
  }

  function drawTraces(ctx, lt, a0, a1, alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    TRACES.forEach((pts, i) => {
      const L = pathLength(pts);
      const p = progress(lt, a0 + i * 0.12, a1 + i * 0.12, ease.inOut);
      if (p <= 0) return;
      ctx.strokeStyle = 'rgba(10,8,6,0.85)';
      ctx.lineWidth = 9;
      partialPath(ctx, pts, L * p);
      ctx.strokeStyle = 'rgba(255,150,60,0.75)';
      ctx.lineWidth = 3;
      partialPath(ctx, pts, L * p);
      const [hx, hy] = pointAt(pts, L * p);
      if (p < 1) glow(ctx, hx, hy, 40, FIRE, 0.9);
      ctx.fillStyle = 'rgba(255,190,110,0.9)';
      for (let k = 1; k < pts.length - 1; k += 2) {
        if (pathLength(pts.slice(0, k + 1)) <= L * p) dot(ctx, pts[k][0], pts[k][1], 5);
      }
    });
    ctx.restore();
  }


  // ---- Bu bölüme özel yardımcılar -------------------------------------------

  // Adım adım değişen sürekli değer: list = [[zaman, değer], ...]; her geçiş d saniye sürer
  function steps(t, list, d = 0.5, init = 0, fn = ease.inOut) {
    let v = init;
    for (const [tm, val] of list) {
      if (t < tm) break;
      v = lerp(v, val, fn(clamp((t - tm) / d)));
    }
    return v;
  }

  // Sayaç tekerlekleri: vals sürekli değerler (6.4 → 6'dan 7'ye dönüyor); base rakam sayısı
  function drawWheels(ctx, x, y, vals, o = {}) {
    const w = o.w ?? 110;
    const h = o.h ?? 150;
    const gap = o.gap ?? 14;
    const base = o.base ?? 10;
    const alpha = o.alpha ?? 1;
    if (alpha <= 0.002) return;
    const n = vals.length;
    const total = n * w + (n - 1) * gap;
    const x0 = x - total / 2;
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (o.frame !== false) {
      roundRect(ctx, x0 - 22, y - h / 2 - 22, total + 44, h + 44, 22);
      ctx.fillStyle = '#0a0f1c';
      ctx.fill();
      ctx.strokeStyle = o.frameColor ?? '#3a4664';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    vals.forEach((v, i) => {
      const cx = x0 + i * (w + gap);
      ctx.save();
      roundRect(ctx, cx, y - h / 2, w, h, 12);
      const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2);
      g.addColorStop(0, '#04070d');
      g.addColorStop(0.5, '#1c2539');
      g.addColorStop(1, '#04070d');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.clip();
      const m = ((v % base) + base) % base;
      const d0 = Math.floor(m + 1e-6);
      const f = Math.max(0, m - d0);
      const step = h * 0.8;
      for (let k = -1; k <= 2; k++) {
        const d = (((d0 + k) % base) + base) % base;
        const a = clamp(1 - Math.abs(k - f) * 0.85);
        if (a <= 0.01) continue;
        const col = typeof o.color === 'function' ? o.color(i, d) : (o.color ?? C.cream);
        text(ctx, String(d), cx + w / 2, y + (k - f) * step, { size: h * 0.6, family: 'mono', weight: 700, color: col, alpha: a });
      }
      ctx.restore();
    });
    ctx.restore();
  }

  // Ortası (x, y) olan yuvarlak köşeli kutu
  function panel(ctx, x, y, w, h, alpha = 1, o = {}) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    roundRect(ctx, x - w / 2, y - h / 2, w, h, o.r ?? 16);
    ctx.fillStyle = o.fill ?? '#121a2c';
    ctx.fill();
    if (o.dash) ctx.setLineDash(o.dash);
    ctx.lineWidth = o.lw ?? 3;
    ctx.strokeStyle = o.stroke ?? C.line;
    ctx.stroke();
    ctx.restore();
  }

  // Vurgulama çerçevesi (renk dizisi [r, g, b])
  function hlBox(ctx, x, y, w, h, col, alpha) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    roundRect(ctx, x - w / 2, y - h / 2, w, h, 12);
    ctx.fillStyle = rgba(col, 0.12);
    ctx.fill();
    ctx.strokeStyle = rgba(col, 0.85);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  function arrow(ctx, x1, y1, x2, y2, col, alpha = 1, w = 4, head = 16) {
    if (alpha <= 0.002) return;
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    line(ctx, x1, y1, x2 - Math.cos(ang) * head * 0.8, y2 - Math.sin(ang) * head * 0.8);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(ang - 0.45) * head, y2 - Math.sin(ang - 0.45) * head);
    ctx.lineTo(x2 - Math.cos(ang + 0.45) * head, y2 - Math.sin(ang + 0.45) * head);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Sağa yaslı sütun yazısı: str'nin her karakteri bir sütunda (xr en sağ sütunun ortası)
  function colText(ctx, str, xr, y, cw, o = {}) {
    const n = str.length;
    for (let i = 0; i < n; i++) {
      const ch = str[i];
      if (ch === ' ') continue;
      const a = (o.alpha ?? 1) * (o.alphaFn ? o.alphaFn(i, ch) : 1);
      if (a <= 0.002) continue;
      const col = o.colorFn ? o.colorFn(i, ch) : (o.color ?? (ch === '1' ? C.fire : ch === '0' ? C.off : C.cream));
      text(ctx, ch, xr - (n - 1 - i) * cw, y + (o.dyFn ? o.dyFn(i, ch) : 0), { size: o.size ?? 64, family: 'mono', weight: 700, color: col, alpha: a });
    }
  }

  // Lamba sırası: vals 0..1 (sürekli)
  function lampRow(ctx, x, y, vals, r, gap, alpha = 1) {
    const n = vals.length;
    vals.forEach((v, i) => drawBulb(ctx, x + (i - (n - 1) / 2) * gap, y, r, v, alpha));
  }

  // Basma düğmesi: down 0..1
  function drawButton(ctx, x, y, down, alpha = 1, label = '', col = C.fire) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    roundRect(ctx, x - 46, y - 18, 92, 46, 10);
    ctx.fillStyle = '#1b2438';
    ctx.fill();
    ctx.strokeStyle = '#4a5878';
    ctx.lineWidth = 3;
    ctx.stroke();
    const dy = 12 * down;
    roundRect(ctx, x - 30, y - 40 + dy, 60, 30, 10);
    ctx.fillStyle = down > 0.5 ? col : '#3a4664';
    ctx.fill();
    ctx.restore();
    if (label) text(ctx, label, x, y + 58, { size: 28, weight: 700, color: C.cream, alpha });
  }

  // Bitleri sayıya çevir (soldan sağa en anlamlıdan)
  const bitsOf = (n, w) => n.toString(2).padStart(w, '0');

  // ---------------------------------------------------------------------------
  // 0 · Açılış
  // ---------------------------------------------------------------------------

  function sceneOpen(ctx, lt) {
    const cx = W / 2;
    // sekiz lamba ikilik düzende sayar, giderek hızlanır
    const la = progress(lt, 0.2, 0.9) * (1 - 0.6 * progress(lt, 3.0, 4.0));
    const n = Math.min(255, Math.floor(256 * ease.in(progress(lt, 0.5, 3.1, ease.linear))));
    lampRow(ctx, cx, 230, bitsOf(n, 8).split('').map(Number), 32, 118, la);
    text(ctx, String(n), cx, 320, { size: 38, family: 'mono', weight: 700, color: C.muted, alpha: la });
    const a1 = progress(lt, 3.3, 4.3, ease.out);
    text(ctx, 'BİRİNCİ KAPI · DÜNYAYI SAYIYA ÇEVİRMEK', cx, 460, { size: 26, weight: 600, spacing: 10, color: C.muted, alpha: a1 });
    const a2 = progress(lt, 3.6, 4.8, ease.out);
    text(ctx, '3', cx, 550 + (1 - a2) * 20, { size: 90, family: 'display', weight: 900, color: C.fire, alpha: a2 });
    text(ctx, 'SAYILARDAN DEVREYE', cx, 675 + (1 - a2) * 30, { size: 118, family: 'display', weight: 900, color: C.cream, alpha: a2, glow: 'rgba(0,0,0,0.6)', glowBlur: 20 });
    const a3 = progress(lt, 4.6, 5.6, ease.out);
    text(ctx, 'Elektriğin hesap yapması', cx, 800, { size: 54, family: 'serif', italic: true, color: C.flame, alpha: a3 });
  }

  // ---------------------------------------------------------------------------
  // 1 · Elimizdeki kapılar → toplama
  // ---------------------------------------------------------------------------

  const GATE_ROW = ['and', 'or', 'not', 'xor'];

  function sceneRecap(ctx, lt, t) {
    kicker(ctx, 'ELİMİZDEKİLER', lt, 10);
    const a = spanVis(lt, 'recap.gates', 'recap.task');
    if (a <= 0) return;
    const c1 = cue('recap-task', 2);
    const merge = progress(t, c1 - 0.2, c1 + 0.8, ease.inOut);
    text(ctx, 'mantık kapıları', W / 2, 250, { size: 46, family: 'serif', italic: true, color: C.cream, alpha: a * after(t, 'recap-gates', 0, 0.6) * (1 - after(t, 'recap-task', 1, 0.5)) });
    text(ctx, 'şimdi adım adım', W / 2, 250, { size: 46, family: 'serif', italic: true, color: C.flame, alpha: a * after(t, 'recap-task', 1, 0.6) });
    GATE_ROW.forEach((g, i) => {
      const x0 = W / 2 + (i - 1.5) * 380;
      const ga = a * after(t, 'recap-gates', i + 1, 0.5);
      const x = lerp(x0, W / 2, merge);
      const y = lerp(500, 540, merge);
      const s = lerp(1.25, 0.35, merge);
      drawGate(ctx, g, x, y, s, ga * (1 - 0.9 * merge), C.cream);
      text(ctx, GATE_NAMES[g], x0, 650, { size: 40, family: 'display', weight: 800, color: g === 'not' ? C.off : C.fire, alpha: ga * (1 - merge) });
    });
    const pa = a * progress(t, c1 + 0.4, c1 + 1.2, ease.out);
    if (pa > 0) {
      const s = lerp(0.7, 1, pa);
      glow(ctx, W / 2, 540, 300, FIRE, 0.22 * pa);
      panel(ctx, W / 2, 540, 360 * s, 270 * s, pa, { fill: '#17213a', stroke: C.fire, lw: 4, r: 26 });
      text(ctx, '+', W / 2, 530, { size: 210 * s, family: 'display', weight: 800, color: C.fire, alpha: pa });
      text(ctx, 'TOPLAMA', W / 2, 760, { size: 58, family: 'display', weight: 900, spacing: 8, color: C.cream, alpha: pa });
    }
  }

  // ---------------------------------------------------------------------------
  // 2 · Ön bilgi: onluk ve ikilik düzende saymak (sayaç tekerlekleri)
  // ---------------------------------------------------------------------------

  function countBinary() {
    const k = (i) => cue('count-binary', i);
    return {
      R: [[k(1), 1], [k(3), 2], [k(8), 3], [k(10), 4]],
      M: [[k(4), 1], [k(10) + 0.25, 2]],
      L: [[k(10) + 0.5, 1]],
    };
  }

  function sceneCount(ctx, lt, t) {
    kicker(ctx, 'ÖNCE: SAYMAK', lt, 14);
    // A · onluk düzen
    const da = beatVis(lt, 'count.decimal');
    if (da > 0) {
      const k = (i) => cue('count-decimal', i);
      text(ctx, 'saymayı hatırlayalım', W / 2, 200, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: da * after(t, 'count-decimal', 0, 0.6) });
      const sa = da * after(t, 'count-decimal', 2, 0.6);
      text(ctx, 'onluk düzen: on rakam', W / 2, 290, { size: 30, weight: 600, spacing: 3, color: C.muted, alpha: sa });
      const spin = Array.from({ length: 9 }, (_, j) => [k(3) + j * 0.2, j + 1]);
      const R = steps(t, [...spin, [k(5), 10]], 0.16);
      const L = steps(t, [[k(6), 1]], 0.55);
      const cur = t < k(5) ? Math.round(R) : -1;
      for (let j = 0; j < 10; j++) {
        const hot = j === cur && t > k(3);
        text(ctx, String(j), W / 2 + (j - 4.5) * 84, 370, { size: 56, family: 'mono', weight: 700, color: hot ? C.fire : C.cream, alpha: sa * (hot ? 1 : 0.75) });
        if (hot) glow(ctx, W / 2 + (j - 4.5) * 84, 370, 60, FIRE, 0.35 * sa);
      }
      text(ctx, '?', W / 2 + 5.5 * 84, 370, { size: 56, family: 'mono', weight: 700, color: C.error, alpha: da * after(t, 'count-decimal', 4, 0.4) });
      const wa = da * progress(lt, 0.4, 1.2);
      drawWheels(ctx, W / 2, 640, [L, R], { w: 150, h: 200, gap: 18, alpha: wa, color: (i, d) => (d ? C.fire : C.cream) });
      // elde oku: sağ tekerlekten sola
      const ca = da * after(t, 'count-decimal', 6, 0.4) * (1 - after(t, 'count-decimal', 7, 0.8));
      if (ca > 0) {
        ctx.save();
        ctx.globalAlpha *= ca;
        ctx.strokeStyle = C.digital;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(W / 2 + 84, 500);
        ctx.quadraticCurveTo(W / 2, 430, W / 2 - 74, 496);
        ctx.stroke();
        ctx.restore();
        arrow(ctx, W / 2 - 64, 488, W / 2 - 84, 506, C.digital, ca, 4, 18);
        text(ctx, '+1', W / 2, 440, { size: 30, family: 'mono', weight: 700, color: C.digital, alpha: ca });
      }
      text(ctx, '= on', W / 2 + 290, 640, { size: 56, family: 'serif', italic: true, color: C.flame, align: 'left', alpha: da * after(t, 'count-decimal', 7, 0.6) });
    }
    // B · ikilik düzen
    const ba = beatVis(lt, 'count.binary');
    if (ba > 0) {
      const k = (i) => cue('count-binary', i);
      const sa = ba * after(t, 'count-binary', 0, 0.6);
      text(ctx, 'ikilik düzen: iki rakam', W / 2 - 120, 290, { size: 30, weight: 600, spacing: 3, color: C.muted, alpha: sa });
      ['0', '1'].forEach((d, j) => text(ctx, d, W / 2 - 120 + (j - 0.5) * 84, 370, { size: 56, family: 'mono', weight: 700, color: d === '1' ? C.fire : C.off, alpha: sa * after(t, 'count-binary', 1, 0.4) }));
      text(ctx, '?', W / 2 - 120 + 1.5 * 84, 370, { size: 56, family: 'mono', weight: 700, color: C.error, alpha: ba * after(t, 'count-binary', 2, 0.4) });
      const S = countBinary();
      const R = steps(t, S.R, 0.5);
      const M = steps(t, S.M, 0.5);
      const L = steps(t, S.L, 0.5);
      const wx = W / 2 - 120;
      drawWheels(ctx, wx, 640, [L, M, R], { w: 140, h: 190, gap: 16, base: 2, alpha: ba * progress(lt, 7.2, 8.0), color: (i, d) => (d ? C.fire : C.off) });
      // elde okları
      for (const [ki, from, to] of [[4, 2, 1], [10, 2, 1], [10, 1, 0]]) {
        const st = k(ki) + (from === 1 ? 0.25 : 0);
        const ca = ba * progress(t, st, st + 0.3) * (1 - progress(t, st + 0.9, st + 1.4));
        if (ca <= 0) continue;
        const xf = wx + (from - 1) * 156;
        const xt = wx + (to - 1) * 156;
        ctx.save();
        ctx.globalAlpha *= ca;
        ctx.strokeStyle = C.digital;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(xf, 506);
        ctx.quadraticCurveTo((xf + xt) / 2, 440, xt + 10, 504);
        ctx.stroke();
        ctx.restore();
        arrow(ctx, xt + 20, 494, xt + 4, 512, C.digital, ca, 4, 18);
      }
      // okunuş
      const labels = [[7, 9, '= iki'], [9, 11, '= üç'], [11, 99, '= dört']];
      for (const [from, to, s] of labels) {
        const la = ba * after(t, 'count-binary', from, 0.4) * (to < 99 ? 1 - after(t, 'count-binary', to, 0.3) : 1);
        text(ctx, s, wx + 300, 640, { size: 56, family: 'serif', italic: true, color: C.flame, align: 'left', alpha: la });
      }
      hlBox(ctx, wx + 78, 640, 310, 236, DIGI, ba * after(t, 'count-binary', 5, 0.4) * (1 - after(t, 'count-binary', 8, 0.4)));
      // karşılık tablosu
      const tx = 1500;
      text(ctx, 'onluk', tx, 300, { size: 26, weight: 700, spacing: 3, color: C.muted, alpha: sa });
      text(ctx, 'ikilik', tx + 170, 300, { size: 26, weight: 700, spacing: 3, color: C.muted, alpha: sa });
      [[0, null], [1, 1], [2, 7], [3, 9], [4, 11]].forEach(([n, ki], j) => {
        const ra = ba * (ki == null ? progress(lt, 7.4, 8.2) : after(t, 'count-binary', ki, 0.5));
        text(ctx, String(n), tx, 370 + j * 72, { size: 46, family: 'mono', weight: 700, color: C.cream, alpha: ra });
        runs(ctx, bitRuns(n.toString(2), 46), tx + 170, 386 + j * 72, { alpha: ra });
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 3 · En basit toplama: iki bit, tablo, yarım toplayıcı
  // ---------------------------------------------------------------------------

  const SUMS2 = [[0, 0, '0'], [0, 1, '1'], [1, 0, '1'], [1, 1, '10']];
  // Yarım toplayıcı yerleşimi
  const HA = { ax: 300, ay: 430, by: 650, gx: 900, s: 1.1, lx: 1300, splitA: 560, splitB: 640 };

  function halfAdderWires() {
    const { ax, ay, by, gx, s, lx, splitA, splitB } = HA;
    const inX = gx - 105 * s;
    const outX = gx + 105 * s;
    const d = 28 * s;
    return {
      aX: [[ax + 30, ay], [splitA, ay], [splitA, ay - d], [inX, ay - d]],
      aA: [[splitA, ay], [splitA, by - d], [inX, by - d]],
      bX: [[ax + 30, by], [splitB, by], [splitB, ay + d], [inX, ay + d]],
      bA: [[splitB, by], [splitB, by + d], [inX, by + d]],
      xS: [[outX, ay], [lx - 40, ay]],
      aC: [[outX, by], [lx - 40, by]],
    };
  }

  // A, B: 0..1 (sürekli); draw: kablo çizimi 0..1; ga: kapıların görünürlüğü
  function drawHalfAdder(ctx, t, alpha, A, B, draw, ga, opts = {}) {
    const { ax, ay, by, gx, s, lx, splitA, splitB } = HA;
    const w = halfAdderWires();
    const a1 = A > 0.5 ? 1 : 0;
    const b1 = B > 0.5 ? 1 : 0;
    const S = a1 ^ b1;
    const Cc = a1 & b1;
    const live = { aX: a1, aA: a1, bX: b1, bA: b1, xS: S, aC: Cc };
    for (const [key, pts] of Object.entries(w)) {
      if (draw < 1) {
        ctx.save();
        ctx.globalAlpha *= alpha;
        ctx.strokeStyle = C.wire;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        partialPath(ctx, pts, pathLength(pts) * draw);
        ctx.restore();
      } else {
        drawWire(ctx, pts, live[key], t, alpha);
      }
    }
    if (draw > 0.2) {
      ctx.save();
      ctx.globalAlpha *= alpha * clamp((draw - 0.2) / 0.3);
      ctx.fillStyle = C.cream;
      dot(ctx, splitA, ay, 8);
      dot(ctx, splitB, by, 8);
      ctx.restore();
    }
    drawGate(ctx, 'xor', gx, ay, s, alpha * ga[0], opts.hlX ? C.fire : C.cream, S);
    drawGate(ctx, 'and', gx, by, s, alpha * ga[1], opts.hlA ? C.digital : C.cream, Cc);
    text(ctx, 'ÖZEL VEYA', gx, ay + 90, { size: 26, weight: 700, spacing: 3, color: C.fire, alpha: alpha * ga[0] });
    text(ctx, 'VE', gx, by + 90, { size: 26, weight: 700, spacing: 3, color: C.digital, alpha: alpha * ga[1] });
    // girişler
    for (const [lab, y, v] of [['A', ay, A], ['B', by, B]]) {
      drawBulb(ctx, ax, y, 26, v, alpha);
      text(ctx, lab, ax - 60, y, { size: 44, family: 'display', weight: 800, color: C.cream, alpha });
      text(ctx, v > 0.5 ? '1' : '0', ax, y - 56, { size: 30, family: 'mono', weight: 700, color: v > 0.5 ? C.fire : C.off, alpha });
    }
    // çıkışlar
    drawBulb(ctx, lx, ay, 34, S, alpha);
    drawBulb(ctx, lx, by, 34, Cc, alpha);
    text(ctx, 'basamak', lx + 56, ay, { size: 30, color: C.fire, align: 'left', alpha });
    text(ctx, 'elde', lx + 56, by, { size: 30, color: C.digital, align: 'left', alpha });
    return { S, C: Cc };
  }

  function sceneAdd(ctx, lt, t) {
    kicker(ctx, 'EN BASİT TOPLAMA', lt, 34);
    // A · dört olasılık ve 1 + 1
    const pa = spanVis(lt, 'add.cases', 'add.carry');
    if (pa > 0) {
      text(ctx, 'iki biti toplamak: dört olasılık', 520, 210, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: pa * after(t, 'add-cases', 0, 0.6) });
      SUMS2.forEach(([p, q, r], i) => {
        const y = 340 + i * 120;
        const la = pa * after(t, 'add-cases', 2 + 2 * i, 0.5);
        const ra = pa * after(t, 'add-cases', 3 + 2 * i, 0.5);
        const dimK = i < 3 ? 1 - 0.55 * after(t, 'add-carry', 0, 0.6) : 1;
        text(ctx, `${p} + ${q} =`, 560, y, { size: 72, family: 'mono', weight: 700, color: C.cream, align: 'right', alpha: la * dimK });
        runs(ctx, bitRuns(r, 72), 600, y + 21, { align: 'left', alpha: ra * dimK });
      });
      hlBox(ctx, 505, 700, 500, 104, FIRE, pa * after(t, 'add-carry', 0, 0.5));
      // sağda: ikilik 1 + 1 ve onluk 9 + 1 yan yana
      const cols = [[1150, 'ikilik', '1', 'add-carry', 1], [1560, 'onluk', '9', 'add-carry', 2]];
      for (const [x, lab, top, id, k] of cols) {
        const ca = pa * after(t, id, k, 0.6);
        if (ca <= 0) continue;
        const xr = x + 50;
        text(ctx, lab, x, 300, { size: 30, weight: 700, spacing: 4, color: C.muted, alpha: ca });
        colText(ctx, top, xr, 390, 76, { size: 76, alpha: ca, color: C.cream });
        text(ctx, '+', xr - 120, 480, { size: 70, family: 'mono', weight: 700, color: C.muted, alpha: ca });
        colText(ctx, '1', xr, 480, 76, { size: 76, alpha: ca, color: C.cream });
        ctx.save();
        ctx.globalAlpha *= ca;
        ctx.fillStyle = C.dim;
        ctx.fillRect(xr - 170, 530, 220, 4);
        ctx.restore();
        const zero = pa * after(t, 'add-carry', 3, 0.5);
        const one = pa * after(t, 'add-carry', 4, 0.5);
        if (zero > 0) glow(ctx, xr, 600, 70, FIRE, 0.4 * zero);
        text(ctx, '0', xr, 600, { size: 84, family: 'mono', weight: 700, color: C.fire, alpha: zero });
        text(ctx, '1', xr - 76, 600 - 30 * (1 - one), { size: 84, family: 'mono', weight: 700, color: C.digital, alpha: one });
        text(ctx, 'yaz', xr, 680, { size: 28, family: 'serif', italic: true, color: C.fire, alpha: zero });
        text(ctx, 'elde', xr - 76, 680, { size: 28, family: 'serif', italic: true, color: C.digital, alpha: one });
        const br = pa * after(t, 'add-carry', 6, 0.5);
        if (br > 0) {
          ctx.save();
          ctx.globalAlpha *= br;
          ctx.strokeStyle = C.flame;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(xr - 112, 722);
          ctx.lineTo(xr - 112, 736);
          ctx.lineTo(xr + 36, 736);
          ctx.lineTo(xr + 36, 722);
          ctx.stroke();
          ctx.restore();
          text(ctx, 'iki basamak', xr - 38, 776, { size: 28, color: C.flame, alpha: br });
        }
      }
      text(ctx, 'sıfır yaz, elde var bir', 1355, 860, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: pa * after(t, 'add-carry', 4, 0.6) });
    }
    // B · tablo ve tanıdık sütunlar
    const ta = spanVis(lt, 'add.table', 'add.recognize');
    if (ta > 0) {
      const X = { A: 330, B: 450, S: 650, C: 840 };
      const hy = 330;
      const rowY = (j) => 420 + j * 74;
      const inA = ta * after(t, 'add-table', 1, 0.5);
      const sA = ta * after(t, 'add-table', 3, 0.5);
      const cA = ta * after(t, 'add-table', 4, 0.5);
      text(ctx, 'A', X.A, hy, { size: 34, weight: 700, color: C.muted, alpha: inA });
      text(ctx, 'B', X.B, hy, { size: 34, weight: 700, color: C.muted, alpha: inA });
      text(ctx, 'sonuç basamağı', X.S, hy, { size: 26, weight: 700, color: C.fire, alpha: sA });
      text(ctx, 'elde', X.C, hy, { size: 30, weight: 700, color: C.digital, alpha: cA });
      ctx.save();
      ctx.globalAlpha *= ta * after(t, 'add-table', 0, 0.5);
      ctx.fillStyle = C.line;
      ctx.fillRect(260, hy + 34, 660, 3);
      ctx.fillRect(546, hy - 30, 3, 340);
      ctx.restore();
      SUMS2.forEach(([p, q, r], j) => {
        const s = r === '10' ? 0 : +r;
        const c = r === '10' ? 1 : 0;
        const y = rowY(j);
        text(ctx, String(p), X.A, y, { size: 50, family: 'mono', weight: 700, color: p ? C.fire : C.off, alpha: inA });
        text(ctx, String(q), X.B, y, { size: 50, family: 'mono', weight: 700, color: q ? C.fire : C.off, alpha: inA });
        text(ctx, String(s), X.S, y, { size: 50, family: 'mono', weight: 700, color: s ? C.fire : C.off, alpha: sA });
        text(ctx, String(c), X.C, y, { size: 50, family: 'mono', weight: 700, color: c ? C.digital : C.off, alpha: cA });
      });
      // sütunları tanımak
      const q0 = ta * after(t, 'add-recognize', 0, 0.5);
      const pulse = 0.6 + 0.4 * Math.sin(clock('add', t) * 5);
      hlBox(ctx, X.S, rowY(1.5), 140, 300, FIRE, q0 * (after(t, 'add-recognize', 2, 0.3) > 0 ? 1 : pulse));
      hlBox(ctx, X.C, rowY(1.5), 120, 300, DIGI, q0 * (after(t, 'add-recognize', 4, 0.3) > 0 ? 1 : pulse));
      text(ctx, '?', 745, 250, { size: 70, family: 'display', weight: 900, color: C.flame, alpha: q0 * (1 - after(t, 'add-recognize', 1, 0.4)) });
      const tables = [
        { x: 1130, k: 1, name: 'ÖZEL VEYA', col: C.fire, rgb: FIRE, f: (p, q) => p ^ q, hx: X.S },
        { x: 1500, k: 3, name: 'VE', col: C.digital, rgb: DIGI, f: (p, q) => p & q, hx: X.C },
      ];
      tables.forEach(({ x, k, name, col, rgb, f, hx }, ti) => {
        const ma = ta * after(t, 'add-recognize', k, 0.6);
        if (ma <= 0) return;
        text(ctx, name, x + 100, 250, { size: 34, family: 'display', weight: 800, color: col, alpha: ma });
        ['A', 'B', 'çıkış'].forEach((h, i) => text(ctx, h, x + i * 100, hy, { size: 28, weight: 700, color: C.muted, alpha: ma }));
        ctx.save();
        ctx.globalAlpha *= ma;
        ctx.fillStyle = C.line;
        ctx.fillRect(x - 50, hy + 34, 300, 3);
        ctx.restore();
        SUMS2.forEach(([p, q], j) => {
          const v = f(p, q);
          [p, q, v].forEach((d, i) => text(ctx, String(d), x + i * 100, rowY(j), { size: 46, family: 'mono', weight: 700, color: d ? (i === 2 ? col : C.fire) : C.off, alpha: ma }));
        });
        const same = ta * after(t, 'add-recognize', k + 1, 0.6);
        hlBox(ctx, x + 200, rowY(1.5), 110, 300, rgb, same);
        if (same > 0) {
          const y0 = rowY(3) + 50;
          const dip = ti ? 160 : 50;
          ctx.save();
          ctx.globalAlpha *= same;
          ctx.strokeStyle = col;
          ctx.lineWidth = 3;
          ctx.setLineDash([10, 8]);
          ctx.beginPath();
          ctx.moveTo(hx, y0);
          ctx.quadraticCurveTo((hx + x + 200) / 2, y0 + dip * 2, x + 200, y0);
          ctx.stroke();
          ctx.restore();
          text(ctx, 'aynısı', (hx + x + 200) / 2, ti ? y0 + dip + 30 : y0 + 18, { size: 32, family: 'serif', italic: true, color: col, alpha: same });
        }
      });
    }
    // C · yarım toplayıcı ve deneme
    const ha = spanVis(lt, 'add.half', 'add.demo');
    if (ha > 0) {
      const c0 = cue('add-half', 0);
      const ga = [progress(t, c0, c0 + 0.6), progress(t, c0 + 0.4, c0 + 1.0)];
      const draw = after(t, 'add-half', 1, 1.2, ease.inOut);
      const A = steps(t, [[cue('add-demo', 1), 1]], 0.3);
      const B = steps(t, [[cue('add-demo', 2), 1]], 0.3);
      drawHalfAdder(ctx, t, ha, A, B, draw, ga, { hlX: after(t, 'add-demo', 3, 0.3) > 0 && t < cue('add-demo', 4), hlA: after(t, 'add-demo', 4, 0.3) > 0 });
      const bx = ha * after(t, 'add-half', 2, 0.6);
      panel(ctx, HA.gx, 540, 440, 450, bx, { fill: 'rgba(0,0,0,0)', stroke: C.flame, dash: [14, 10], lw: 3, r: 22 });
      text(ctx, 'YARIM TOPLAYICI', HA.gx, 270, { size: 46, family: 'display', weight: 900, spacing: 4, color: C.flame, alpha: bx });
      text(ctx, '0', HA.gx + 150, HA.ay - 36, { size: 34, family: 'mono', weight: 700, color: C.off, alpha: ha * after(t, 'add-demo', 3, 0.4) });
      text(ctx, '1', HA.gx + 150, HA.by - 36, { size: 34, family: 'mono', weight: 700, color: C.digital, alpha: ha * after(t, 'add-demo', 4, 0.4) });
      const ra = ha * after(t, 'add-demo', 6, 0.6);
      if (ra > 0) {
        text(ctx, 'elde · basamak', 1640, 470, { size: 26, weight: 600, spacing: 2, color: C.muted, alpha: ra });
        runs(ctx, [['1', { size: 96, family: 'mono', weight: 700, color: C.digital }], [' ', { size: 40 }], ['0', { size: 96, family: 'mono', weight: 700, color: C.fire }]], 1640, 580, { alpha: ra });
      }
      text(ctx, '= iki', 1640, 660, { size: 50, family: 'serif', italic: true, color: C.flame, alpha: ha * after(t, 'add-demo', 7, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 4 · Tam toplayıcı: üç bit
  // ---------------------------------------------------------------------------

  const FA = {
    A: [300, 400], B: [300, 480], Ci: [300, 760],
    ha1: [650, 440], ha2: [1030, 640], or: [1340, 425], so: [1600, 680], co: [1600, 425],
  };
  const FA_WIRES = {
    a: [[322, 400], [540, 400]],
    b: [[322, 480], [540, 480]],
    s1: [[760, 480], [860, 480], [860, 600], [920, 600]],
    c1: [[760, 400], [1245, 400]],
    ci: [[322, 760], [880, 760], [880, 680], [920, 680]],
    c2: [[1140, 600], [1200, 600], [1200, 450], [1245, 450]],
    s: [[1140, 680], [1566, 680]],
    co: [[1435, 425], [1566, 425]],
  };

  function haBox(ctx, x, y, alpha, hot = 0) {
    if (alpha <= 0.002) return;
    panel(ctx, x, y, 220, 160, alpha, { fill: '#141d33', stroke: hot > 0.5 ? C.fire : '#4a5878', lw: 3, r: 16 });
    text(ctx, 'yarım', x, y - 16, { size: 28, weight: 700, color: C.cream, alpha });
    text(ctx, 'toplayıcı', x, y + 20, { size: 28, weight: 700, color: C.cream, alpha });
  }

  function sceneFull(ctx, lt, t) {
    kicker(ctx, 'TAM TOPLAYICI', lt, 22);
    // A · neden yarım? üç bitlik sütun
    const wa = beatVis(lt, 'full.why');
    if (wa > 0) {
      text(ctx, 'Peki neden “yarım”?', W / 2, 220, { size: 62, family: 'display', weight: 800, color: C.cream, alpha: wa * after(t, 'full-why', 0, 0.6) });
      const xr = 1180;
      const cw = 110;
      const inA = wa * progress(lt, 0.6, 1.4);
      const col = 1;
      const hot = wa * after(t, 'full-why', 3, 0.5);
      hlBox(ctx, xr - (3 - col) * cw, 490, 100, 300, FIRE, hot);
      text(ctx, 'üç bit', xr - (3 - col) * cw, 320, { size: 32, family: 'serif', italic: true, color: C.fire, alpha: hot });
      const ab = after(t, 'full-why', 4, 0.4);
      const cc = after(t, 'full-why', 5, 0.4);
      const glowCol = (i, ch) => (i === col && ab > 0 ? C.flame : ch === '1' ? C.fire : C.off);
      colText(ctx, '11  ', xr, 400, cw, { size: 44, alpha: wa * progress(lt, 1.2, 2.0), colorFn: (i) => (i === col && cc > 0 ? C.flame : C.digital) });
      colText(ctx, '0110', xr, 490, cw, { size: 76, alpha: inA, colorFn: glowCol });
      colText(ctx, '0011', xr, 580, cw, { size: 76, alpha: inA, colorFn: glowCol });
      text(ctx, '+', xr - 4 * cw - 20, 580, { size: 70, family: 'mono', weight: 700, color: C.muted, alpha: inA });
      ctx.save();
      ctx.globalAlpha *= inA;
      ctx.fillStyle = C.dim;
      ctx.fillRect(xr - 4 * cw - 50, 630, 4 * cw + 100, 4);
      ctx.restore();
      if (ab > 0) glow(ctx, xr - (3 - col) * cw, 535, 120, FIRE, 0.25 * ab * wa);
      if (cc > 0) {
        glow(ctx, xr - (3 - col) * cw, 400, 60, DIGI, 0.5 * cc * wa);
        arrow(ctx, xr - (2 - col) * cw + 10, 455, xr - (3 - col) * cw + 26, 412, C.digital, wa * cc, 4, 16);
      }
      text(ctx, 'iki sayının bitleri + sağdan gelen elde', W / 2, 760, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: wa * after(t, 'full-why', 5, 0.6) });
    }
    // B · 3 + 1 adım adım
    const ea = beatVis(lt, 'full.example');
    if (ea > 0) {
      const k = (i) => after(t, 'full-example', i, 0.5);
      const xr = 1060;
      const cw = 120;
      text(ctx, 'üç artı bir, ikilik düzende', W / 2, 220, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: ea * k(0) });
      const right = ea * k(3) * (1 - k(6));
      const left = ea * k(6) * (1 - k(11));
      hlBox(ctx, xr, 520, 104, 330, FIRE, right);
      hlBox(ctx, xr - cw, 520, 104, 330, FIRE, left);
      const lit = (i) => (i === 2 && right > 0.3) || (i === 1 && left > 0.3);
      colText(ctx, ' 11', xr, 470, cw, { size: 80, alpha: ea * k(1), colorFn: (i, ch) => (lit(i) ? C.flame : ch === '1' ? C.fire : C.off) });
      colText(ctx, ' 01', xr, 570, cw, { size: 80, alpha: ea * k(2), colorFn: (i, ch) => (lit(i) && (i === 2 || k(7) > 0) ? C.flame : ch === '1' ? C.fire : C.off) });
      text(ctx, '+', xr - 3 * cw - 10, 570, { size: 70, family: 'mono', weight: 700, color: C.muted, alpha: ea * k(2) });
      text(ctx, '= 3', xr + 160, 470, { size: 40, family: 'mono', color: C.muted, align: 'left', alpha: ea * k(1) });
      text(ctx, '= 1', xr + 160, 570, { size: 40, family: 'mono', color: C.muted, align: 'left', alpha: ea * k(2) });
      ctx.save();
      ctx.globalAlpha *= ea * k(2);
      ctx.fillStyle = C.dim;
      ctx.fillRect(xr - 3 * cw - 40, 625, 3 * cw + 90, 4);
      ctx.restore();
      // sonuç basamakları ve elde
      text(ctx, '0', xr, 690, { size: 84, family: 'mono', weight: 700, color: C.off, alpha: ea * k(4) });
      const fly1 = after(t, 'full-example', 5, 0.7, ease.inOut);
      if (fly1 > 0) text(ctx, '1', lerp(xr, xr - cw, fly1), lerp(690, 380, fly1), { size: lerp(84, 46, fly1), family: 'mono', weight: 700, color: C.digital, alpha: ea * (k(8) > 0 ? 1 : 0.9) });
      if (k(8) > 0) glow(ctx, xr - cw, 380, 50, DIGI, 0.5 * ea * k(8) * (1 - k(11)));
      text(ctx, '0', xr - cw, 690, { size: 84, family: 'mono', weight: 700, color: C.off, alpha: ea * k(9) });
      const fly2 = after(t, 'full-example', 10, 0.7, ease.inOut);
      if (fly2 > 0) {
        const drop = after(t, 'full-example', 12, 0.6, ease.inOut);
        const x = lerp(xr - cw, xr - 2 * cw, fly2);
        const y = lerp(lerp(690, 380, fly2), 690, drop);
        const sz = lerp(lerp(84, 46, fly2), 84, drop);
        text(ctx, '1', x, y, { size: sz, family: 'mono', weight: 700, color: drop > 0.5 ? C.fire : C.digital, alpha: ea });
      }
      text(ctx, 'elde', xr - cw, 330, { size: 26, family: 'serif', italic: true, color: C.digital, alpha: ea * k(5) });
      text(ctx, '= dört', xr + 160, 690, { size: 52, family: 'serif', italic: true, color: C.flame, align: 'left', alpha: ea * k(13) });
    }
    // C · tam toplayıcının yapısı
    const ba = beatVis(lt, 'full.build');
    if (ba > 0) {
      const c1 = cue('full-build', 1);
      const h1 = progress(t, c1, c1 + 0.6);
      const h2 = progress(t, c1 + 0.4, c1 + 1.0);
      const og = after(t, 'full-build', 2, 0.6);
      const draw = after(t, 'full-build', 2, 1.2, ease.inOut);
      const go = cue('full-build', 4);
      const A = steps(t, [[go, 1]], 0.3);
      const B = steps(t, [[go + 0.3, 1]], 0.3);
      const Ci = steps(t, [[go + 0.6, 1]], 0.3);
      const a1 = A > 0.5 ? 1 : 0;
      const b1 = B > 0.5 ? 1 : 0;
      const ci = Ci > 0.5 ? 1 : 0;
      const s1 = a1 ^ b1;
      const cr1 = a1 & b1;
      const s = s1 ^ ci;
      const cr2 = s1 & ci;
      const co = cr1 | cr2;
      const live = { a: a1, b: b1, s1, c1: cr1, ci, c2: cr2, s, co };
      for (const [key, pts] of Object.entries(FA_WIRES)) {
        const wa = ba * (key === 'a' || key === 'b' || key === 'ci' ? Math.max(h1, draw) : draw);
        if (draw < 1) {
          ctx.save();
          ctx.globalAlpha *= ba;
          ctx.strokeStyle = C.wire;
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          partialPath(ctx, pts, pathLength(pts) * draw);
          ctx.restore();
        } else {
          drawWire(ctx, pts, live[key], t, wa);
        }
      }
      haBox(ctx, ...FA.ha1, ba * h1, s1 || cr1);
      haBox(ctx, ...FA.ha2, ba * h2, s || cr2);
      drawGate(ctx, 'or', FA.or[0], FA.or[1], 0.9, ba * og, C.cream, co);
      text(ctx, 'VEYA', FA.or[0], FA.or[1] + 74, { size: 24, weight: 700, spacing: 3, color: C.muted, alpha: ba * og });
      const ins = after(t, 'full-build', 4, 0.4);
      const pulse = ins > 0 && t < cue('full-build', 5) ? 0.5 + 0.5 * Math.sin(t * 8) : 0;
      for (const [lab, [x, y], v] of [['A', FA.A, A], ['B', FA.B, B], ['elde girişi', FA.Ci, Ci]]) {
        drawBulb(ctx, x, y, 22, v, ba * h1);
        if (pulse > 0) glow(ctx, x, y, 60, DIGI, 0.4 * pulse * ba);
        text(ctx, lab, x - 44, y, { size: lab.length > 2 ? 28 : 40, family: lab.length > 2 ? 'sans' : 'display', weight: 800, color: lab.length > 2 ? C.digital : C.cream, align: 'right', alpha: ba * h1 });
      }
      drawBulb(ctx, FA.so[0], FA.so[1], 32, s, ba * draw);
      drawBulb(ctx, FA.co[0], FA.co[1], 32, co, ba * draw);
      text(ctx, 'basamak', FA.so[0] + 50, FA.so[1], { size: 30, color: C.fire, align: 'left', alpha: ba * draw });
      text(ctx, 'elde çıkışı', FA.co[0] + 50, FA.co[1], { size: 30, color: C.digital, align: 'left', alpha: ba * draw });
      const bx = ba * after(t, 'full-build', 3, 0.6);
      panel(ctx, 990, 570, 1000, 520, bx, { fill: 'rgba(0,0,0,0)', stroke: C.flame, dash: [14, 10], lw: 3, r: 22 });
      text(ctx, 'TAM TOPLAYICI', 990, 260, { size: 48, family: 'display', weight: 900, spacing: 4, color: C.flame, alpha: bx });
      const ra = ba * after(t, 'full-build', 5, 0.6);
      text(ctx, '1 + 1 + 1 = 11 · yani üç', 990, 890, { size: 36, family: 'mono', weight: 700, color: C.flame, alpha: ra });
    }
  }

  // ---------------------------------------------------------------------------
  // 5 · Sekiz tam toplayıcı: elde zinciri
  // ---------------------------------------------------------------------------

  const N91 = [1, 1, 0, 1, 1, 0, 1, 0]; // bit 0 → 7
  const N53 = [1, 0, 1, 0, 1, 1, 0, 0];
  const CARRY = (() => {
    const c = [0];
    for (let i = 0; i < 8; i++) c.push((N91[i] + N53[i] + c[i]) >> 1);
    return c;
  })();
  const SUM = N91.map((a, i) => (a + N53[i] + CARRY[i]) & 1);
  const chainX = (i) => 900 + (3.5 - i) * 190;

  function rippleTimes() {
    const c1 = cue('chain-demo', 1);
    const step = clamp((cue('chain-demo', 4) - c1) / 8.5, 0.25, 0.6);
    return { c1, step, at: (i) => c1 + i * step };
  }

  function sceneChain(ctx, lt, t) {
    kicker(ctx, 'SEKİZ TOPLAYICI, İKİ BAYT', lt, 18);
    const da = spanVis(lt, 'chain.eight', 'chain.demo');
    if (da > 0) {
      const R = rippleTimes();
      const bitsA = da * after(t, 'chain-demo', 0, 0.6);
      text(ctx, 'sekiz tam toplayıcı', W / 2, 210, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: da * progress(lt, 0.6, 1.4) * (1 - after(t, 'chain-eight', 3, 0.4)) });
      text(ctx, 'iki baytı toplayan devre', W / 2, 210, { size: 40, family: 'serif', italic: true, color: C.flame, alpha: da * after(t, 'chain-eight', 3, 0.6) });
      text(ctx, 'A', 110, 330, { size: 40, family: 'display', weight: 800, color: C.cream, alpha: bitsA });
      text(ctx, 'B', 110, 410, { size: 40, family: 'display', weight: 800, color: C.cream, alpha: bitsA });
      text(ctx, 'toplam', 110, 770, { size: 28, weight: 700, color: C.muted, alpha: da * after(t, 'chain-demo', 1, 0.5) });
      for (let i = 0; i < 8; i++) {
        const x = chainX(i);
        const ba = da * progress(lt, 0.5 + i * 0.12, 0.9 + i * 0.12);
        const done = t >= R.at(i);
        const flash = progress(t, R.at(i), R.at(i) + 0.15) * (1 - progress(t, R.at(i) + 0.3, R.at(i) + 0.9));
        if (flash > 0) glow(ctx, x, 560, 130, FIRE, 0.35 * flash * da);
        panel(ctx, x, 560, 150, 110, ba, { fill: done ? '#1d2742' : '#121a2c', stroke: done ? C.fire : '#4a5878', lw: 3, r: 14 });
        text(ctx, 'tam', x, 545, { size: 22, weight: 700, color: C.muted, alpha: ba });
        text(ctx, 'toplayıcı', x, 575, { size: 22, weight: 700, color: C.muted, alpha: ba });
        // giriş bitleri
        text(ctx, String(N91[i]), x - 30, 330, { size: 52, family: 'mono', weight: 700, color: N91[i] ? C.fire : C.off, alpha: bitsA });
        text(ctx, String(N53[i]), x + 30, 410, { size: 52, family: 'mono', weight: 700, color: N53[i] ? C.fire : C.off, alpha: bitsA });
        ctx.save();
        ctx.globalAlpha *= ba;
        ctx.strokeStyle = C.wire;
        ctx.lineWidth = 4;
        line(ctx, x, 615, x, 670);
        ctx.globalAlpha *= bitsA / Math.max(da, 1e-6);
        line(ctx, x - 30, 360, x - 30, 505);
        line(ctx, x + 30, 440, x + 30, 505);
        ctx.restore();
        // toplam
        drawBulb(ctx, x, 700, 24, done ? SUM[i] : 0, ba);
        text(ctx, String(SUM[i]), x, 770, { size: 52, family: 'mono', weight: 700, color: SUM[i] ? C.fire : C.off, alpha: da * progress(t, R.at(i), R.at(i) + 0.25) });
        // elde kablosu: bu kutudan soldakine
        const cw = ba * after(t, 'chain-eight', 1, 0.6);
        if (i < 7) {
          const pts = [[x - 75, 560], [x - 115, 560]];
          const live = t >= R.at(i) + R.step * 0.6 && CARRY[i + 1] ? 1 : 0;
          drawWire(ctx, pts, live, t, cw, 6);
          arrow(ctx, x - 100, 560, x - 116, 560, live ? C.flame : C.wire, cw, 4, 14);
          text(ctx, String(CARRY[i + 1]), x - 95, 528, { size: 22, family: 'mono', weight: 700, color: C.digital, alpha: da * progress(t, R.at(i) + R.step * 0.5, R.at(i) + R.step * 0.8) });
        }
      }
      text(ctx, '91', 1700, 330, { size: 46, family: 'mono', weight: 700, color: C.cream, align: 'left', alpha: bitsA });
      text(ctx, '+ 53', 1700, 410, { size: 46, family: 'mono', weight: 700, color: C.cream, align: 'left', alpha: bitsA });
      const fin = da * after(t, 'chain-demo', 5, 0.6);
      text(ctx, '= 144', 1690, 770, { size: 50, family: 'mono', weight: 700, color: C.flame, align: 'left', alpha: fin });
      hlBox(ctx, 900, 770, 1420, 80, FIRE, fin * 0.8);
      // koşan elde: parıltı
      const run = (t - R.c1) / R.step;
      if (run > 0 && run < 8) glow(ctx, chainX(run), 560, 90, DIGI, 0.5 * da);
    }
    // otuz iki toplayıcı
    const wa = beatVis(lt, 'chain.wide');
    if (wa > 0) {
      const gx = (i) => W / 2 + (15.5 - i) * 50 + (1.5 - Math.floor(i / 8)) * 18;
      for (let i = 0; i < 32; i++) {
        const ba = wa * progress(lt, 12.3 + (31 - i) * 0.03, 12.6 + (31 - i) * 0.03);
        panel(ctx, gx(i), 470, 40, 56, ba, { fill: '#141d33', stroke: '#4a5878', lw: 2, r: 6 });
      }
      for (let g = 0; g < 4; g++) {
        const x = (gx(g * 8) + gx(g * 8 + 7)) / 2;
        text(ctx, `${4 - g}. bayt`, x, 540, { size: 24, color: C.muted, alpha: wa * progress(lt, 13, 13.6) });
      }
      text(ctx, 'otuz iki toplayıcı', W / 2, 220, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: wa * after(t, 'chain-32', 0, 0.6) });
      text(ctx, 'milyarlara varan sayılar', W / 2, 330, { size: 50, family: 'display', weight: 800, color: C.flame, alpha: wa * after(t, 'chain-32', 1, 0.6) });
      text(ctx, 'en büyüğü: 4.294.967.295', W / 2, 390, { size: 32, family: 'mono', color: C.muted, alpha: wa * after(t, 'chain-32', 1, 0.8) });
      const la = wa * after(t, 'chain-32', 2, 0.6);
      for (let i = 0; i < 32; i++) {
        const on = progress(t, cue('chain-32', 2) + 0.2 + i * 0.04, cue('chain-32', 2) + 0.4 + i * 0.04);
        drawBulb(ctx, gx(i), 700, 16, on, la);
      }
      text(ctx, 'ilk bölümdeki 32 lamba: dört milyardan fazla durum', W / 2, 800, { size: 36, family: 'serif', italic: true, color: C.cream, alpha: wa * after(t, 'chain-32', 3, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 6 · Toplamayı bilmeyen makine
  // ---------------------------------------------------------------------------

  function cloud(ctx, x, y, s, alpha) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = '#1a2338';
    ctx.strokeStyle = '#5a6788';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (const [cx, cy, r] of [[-70, 10, 50], [-20, -30, 60], [45, -20, 55], [80, 20, 45], [10, 35, 55], [-50, 40, 40]]) {
      ctx.moveTo(cx + r, cy);
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }

  function sceneMean(ctx, lt, t) {
    kicker(ctx, 'BİR AN DURALIM', lt, 20);
    // A · alıntı
    const qa = beatVis(lt, 'mean.quote');
    if (qa > 0) {
      text(ctx, 'bütün hikâyenin en önemli anlarından biri', W / 2, 260, { size: 38, family: 'serif', italic: true, color: C.muted, alpha: qa * after(t, 'mean-quote', 1, 0.6) });
      const ca = qa * after(t, 'mean-quote', 3, 0.7);
      if (ca > 0) {
        ctx.save();
        ctx.globalAlpha *= ca;
        ctx.translate(0, (1 - ca) * 20);
        paperCard(ctx, 260, 380, 1400, 320);
        ctx.fillStyle = C.ember;
        ctx.fillRect(260, 398, 8, 284);
        ctx.restore();
        text(ctx, 'Toplama işlemi,', W / 2, 480, { size: 66, family: 'serif', color: C.ink, alpha: ca });
        text(ctx, 'elektriğin akıp akmamasından ibarettir.', W / 2, 590, { size: 66, family: 'serif', color: C.ink, alpha: qa * after(t, 'mean-quote', 4, 0.6) });
        const border = [[240, 360], [1680, 360], [1680, 720], [240, 720], [240, 360]];
        drawWire(ctx, border, after(t, 'mean-quote', 4, 1.0), t, qa * after(t, 'mean-quote', 4, 0.6), 4);
      }
    }
    // B · zekâ yok, yalnızca düzenek
    const na = beatVis(lt, 'mean.nomind');
    if (na > 0) {
      const open = after(t, 'mean-nomind', 0, 0.9, ease.inOut);
      const on = t > cue('mean-nomind', 3) ? 1 : 0;
      const out = t > cue('mean-nomind', 4) ? 1 : 0;
      const bx = 820;
      const by = 560;
      // girişler ve çıkışlar
      for (const [y, lab] of [[500, 'A'], [620, 'B']]) {
        drawBulb(ctx, 450, y, 24, on, na);
        text(ctx, lab, 400, y, { size: 36, family: 'display', weight: 800, color: C.cream, align: 'right', alpha: na });
        drawWire(ctx, [[476, y], [590, y]], on, t, na);
      }
      drawWire(ctx, [[1050, 500], [1150, 500]], 0, t, na);
      drawWire(ctx, [[1050, 620], [1150, 620]], out, t, na);
      drawBulb(ctx, 1180, 500, 26, 0, na);
      drawBulb(ctx, 1180, 620, 26, out, na);
      text(ctx, 'basamak', 1220, 500, { size: 26, color: C.fire, align: 'left', alpha: na });
      text(ctx, 'elde', 1220, 620, { size: 26, color: C.digital, align: 'left', alpha: na });
      // kutu ve içi
      panel(ctx, bx, by, 460, 300, na, { fill: '#0f1628', stroke: '#4a5878', lw: 3, r: 18 });
      if (open > 0) {
        drawGate(ctx, 'xor', bx - 20, 500, 0.6, na * open, C.cream, 0);
        drawGate(ctx, 'and', bx - 20, 620, 0.6, na * open, C.cream, out);
        ctx.save();
        ctx.globalAlpha *= na * open;
        ctx.strokeStyle = on ? 'rgba(255,165,71,0.8)' : C.wire;
        ctx.lineWidth = 4;
        line(ctx, 590, 500, bx - 83, 483);
        line(ctx, 590, 500, bx - 83, 603);
        line(ctx, 590, 620, bx - 83, 517);
        line(ctx, 590, 620, bx - 83, 637);
        ctx.strokeStyle = out ? 'rgba(255,165,71,0.8)' : C.wire;
        line(ctx, bx + 43, 620, 1050, 620);
        ctx.strokeStyle = C.wire;
        line(ctx, bx + 43, 500, 1050, 500);
        ctx.restore();
      }
      // kapak
      ctx.save();
      ctx.globalAlpha *= na * (1 - open);
      ctx.translate(bx, by - 150);
      ctx.rotate(-1.2 * open);
      roundRect(ctx, -230, 0, 460, 300, 18);
      ctx.fillStyle = '#1a2440';
      ctx.fill();
      ctx.strokeStyle = '#4a5878';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
      text(ctx, '+', bx, by - 10, { size: 140, family: 'display', weight: 800, color: C.fire, alpha: na * (1 - open) });
      text(ctx, 'Makine toplamayı bilmez', W / 2, 220, { size: 50, family: 'display', weight: 800, color: C.cream, alpha: na * after(t, 'mean-nomind', 0, 0.6) });
      const za = na * after(t, 'mean-nomind', 1, 0.6);
      cloud(ctx, 1560, 470, 1.1, za);
      if (za > 0) {
        ctx.save();
        ctx.globalAlpha *= za;
        ctx.strokeStyle = C.muted;
        ctx.lineWidth = 3;
        for (let r = 0; r < 3; r++) {
          ctx.beginPath();
          ctx.ellipse(1560, 470, 50 - r * 14, 34 - r * 9, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.strokeStyle = C.error;
        ctx.lineWidth = 7;
        line(ctx, 1490, 400, 1630, 540);
        ctx.restore();
        text(ctx, 'içinde zekâ yok', 1560, 610, { size: 34, family: 'serif', italic: true, color: C.error, alpha: za });
      }
      text(ctx, 'yalnızca bir düzenek: akım girer, akım çıkar', W / 2, 800, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: na * after(t, 'mean-nomind', 2, 0.6) });
      text(ctx, '1 + 1  →  elde 1 · basamak 0', W / 2, 870, { size: 36, family: 'mono', weight: 700, color: C.flame, alpha: na * after(t, 'mean-nomind', 4, 0.6) });
    }
    // C · anlam okuyanın zihninde
    const ra = beatVis(lt, 'mean.reader');
    if (ra > 0) {
      const bits = '01000001';
      const blink = after(t, 'mean-reader', 5, 0.3) > 0 ? (Math.sin((t - cue('mean-reader', 5)) * 6) > 0 ? 1 : 0.15) : 1;
      lampRow(ctx, W / 2, 400, bits.split('').map((b) => (b === '1' ? blink : 0)), 34, 116, ra * progress(lt, 13.2, 13.9));
      runs(ctx, bitRuns(bits, 46), W / 2, 500, { alpha: ra * progress(lt, 13.4, 14.1) });
      text(ctx, 'ANLAM', W / 2, 220, { size: 62, family: 'display', weight: 900, spacing: 8, color: C.flame, alpha: ra * after(t, 'mean-reader', 0, 0.6) });
      const nd = ra * after(t, 'mean-reader', 1, 0.5);
      text(ctx, 'düzenekte değil', W / 2, 580, { size: 34, family: 'serif', italic: true, color: C.muted, alpha: nd });
      if (nd > 0) {
        ctx.save();
        ctx.globalAlpha *= nd * after(t, 'mean-reader', 1, 0.8);
        ctx.strokeStyle = C.error;
        ctx.lineWidth = 3;
        line(ctx, W / 2 - 130, 582, W / 2 + 130, 582);
        ctx.restore();
      }
      const za = ra * after(t, 'mean-reader', 2, 0.6);
      arrow(ctx, 760, 540, 520, 690, C.dim, za, 4, 18);
      arrow(ctx, 1160, 540, 1400, 690, C.dim, za, 4, 18);
      for (const [x, k, s] of [[430, 3, '65'], [1490, 4, 'A']]) {
        drawIcon(ctx, 'person', x, 880, 2.2, C.cream, za);
        const ba = ra * after(t, 'mean-reader', k, 0.5);
        cloud(ctx, x, 720, 0.8, ba);
        text(ctx, s, x, 715, { size: 70, family: s === 'A' ? 'serif' : 'mono', weight: 700, color: C.flame, alpha: ba });
      }
      text(ctx, 'okuyanın zihninde', W / 2, 760, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: za });
      text(ctx, 'lambalar yalnızca yanar ve söner', W / 2, 940, { size: 34, family: 'serif', italic: true, color: C.muted, alpha: ra * after(t, 'mean-reader', 5, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 7 · Geri kalan her şey toplamaya indirgenir
  // ---------------------------------------------------------------------------

  function sceneRest(ctx, lt, t) {
    kicker(ctx, 'GERİ KALAN HER ŞEY', lt, 8);
    const a = beatVis(lt, 'rest.question');
    if (a <= 0) return;
    const merge = after(t, 'rest-question', 5, 1.0, ease.inOut);
    ['−', '×', '÷', '√'].forEach((s, i) => {
      const x0 = W / 2 + (i - 1.5) * 330;
      const sa = a * after(t, 'rest-question', i, 0.4);
      const x = lerp(x0, W / 2, merge);
      text(ctx, s, x, 500 - Math.sin(merge * Math.PI) * 80, { size: 170, family: 'display', weight: 700, color: C.cream, alpha: sa * (1 - merge) });
      text(ctx, ['çıkarma', 'çarpma', 'bölme', 'kök'][i], x0, 650, { size: 36, family: 'serif', italic: true, color: C.muted, alpha: sa * (1 - merge) });
    });
    text(ctx, 'şaşırtıcı yanıt:', W / 2, 250, { size: 40, family: 'serif', italic: true, color: C.muted, alpha: a * after(t, 'rest-question', 4, 0.5) });
    const pa = a * after(t, 'rest-question', 6, 0.6);
    if (merge > 0.6) glow(ctx, W / 2, 500, 320, FIRE, 0.3 * a * clamp((merge - 0.6) / 0.4));
    text(ctx, '+', W / 2, 490, { size: 260 * lerp(0.6, 1, merge), family: 'display', weight: 800, color: C.fire, alpha: a * clamp((merge - 0.5) / 0.5) });
    text(ctx, 'hepsi toplamaya indirgenir', W / 2, 760, { size: 54, family: 'display', weight: 800, color: C.cream, alpha: pa });
  }

  // ---------------------------------------------------------------------------
  // 8 · Çıkarma: kilometre sayacı ve ikiye tümleyen
  // ---------------------------------------------------------------------------

  function odoValues(t) {
    const o = (i) => cue('sub-odometer', i);
    const k = (i) => cue('sub-trick', i);
    const R = steps(t, [[o(2), -1], [k(0), -2], [k(0) + 0.5, -3], [k(3), 4]], 0.6);
    const M = steps(t, [[o(2) + 0.15, -1], [k(3) + 0.15, 0]], 0.6);
    const L = steps(t, [[o(2) + 0.3, -1], [k(3) + 0.3, 0]], 0.6);
    return [L, M, R];
  }

  function sceneSub(ctx, lt, t) {
    kicker(ctx, 'ÇIKARMA', lt, 30);
    // A · çıkarma = negatif sayıyla toplama
    const ia = beatVis(lt, 'sub.idea');
    if (ia > 0) {
      const s1 = ia * after(t, 'sub-idea', 2, 0.5) * (1 - after(t, 'sub-idea', 3, 0.5));
      const s2 = ia * after(t, 'sub-idea', 3, 0.6);
      text(ctx, '7 − 3', W / 2, 470 - 20 * s2, { size: 150, family: 'mono', weight: 700, color: C.cream, alpha: s1 });
      runs(ctx, [['7 ', { size: 150, family: 'mono', weight: 700, color: C.cream }], ['+', { size: 150, family: 'mono', weight: 700, color: C.fire }], [' (−3)', { size: 150, family: 'mono', weight: 700, color: C.digital }]], W / 2, 520 + 20 * (1 - s2), { alpha: s2 });
      text(ctx, 'çıkarma = negatif bir sayıyı eklemek', W / 2, 700, { size: 44, family: 'serif', italic: true, color: C.flame, alpha: ia * after(t, 'sub-idea', 1, 0.6) });
    }
    // B, C · sayaç
    const oa = spanVis(lt, 'sub.odometer', 'sub.trick');
    if (oa > 0) {
      const move = progress(lt, 13.1, 14.0, ease.inOut);
      const ox = lerp(W / 2, 520, move);
      const oy = lerp(600, 560, move);
      const sc = lerp(1, 0.8, move);
      const vals = odoValues(t);
      // gösterge kadranı
      const da = oa * progress(lt, 5.2, 6.0) * (1 - move);
      if (da > 0) {
        ctx.save();
        ctx.globalAlpha *= da;
        ctx.strokeStyle = '#3a4664';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(W / 2, 660, 360, Math.PI * 1.08, Math.PI * 1.92);
        ctx.stroke();
        for (let i = 0; i <= 12; i++) {
          const ang = Math.PI * (1.08 + 0.84 * (i / 12));
          ctx.lineWidth = i % 3 === 0 ? 5 : 3;
          line(ctx, W / 2 + Math.cos(ang) * 330, 660 + Math.sin(ang) * 330, W / 2 + Math.cos(ang) * 360, 660 + Math.sin(ang) * 360);
        }
        ctx.strokeStyle = C.ember;
        ctx.lineWidth = 6;
        line(ctx, W / 2 + Math.cos(Math.PI * 1.2) * 150, 660 + Math.sin(Math.PI * 1.2) * 150, W / 2 + Math.cos(Math.PI * 1.2) * 300, 660 + Math.sin(Math.PI * 1.2) * 300);
        ctx.restore();
        text(ctx, 'kilometre sayacı', W / 2, 220, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: oa * after(t, 'sub-odometer', 1, 0.6) * (1 - move) });
      }
      drawWheels(ctx, ox, oy + 60 * (1 - move), vals, { w: 130 * sc, h: 170 * sc, gap: 14 * sc, alpha: oa * after(t, 'sub-odometer', 1, 0.6), color: C.cream });
      text(ctx, 'km', ox + 270 * sc, oy + 60 * (1 - move), { size: 34 * sc, color: C.muted, align: 'left', alpha: oa * after(t, 'sub-odometer', 1, 0.6) });
      const nine = oa * after(t, 'sub-odometer', 3, 0.4) * (1 - after(t, 'sub-trick', 0, 0.4));
      hlBox(ctx, ox, oy + 60 * (1 - move), 500 * sc, 250 * sc, FIRE, nine);
      const eq = oa * after(t, 'sub-odometer', 4, 0.6) * (1 - move);
      runs(ctx, [['999', { size: 64, family: 'mono', weight: 700, color: C.fire }], ['  ≈  ', { size: 56, color: C.muted }], ['−1', { size: 64, family: 'mono', weight: 700, color: C.digital }]], W / 2, 860, { alpha: eq });
      text(ctx, 'eksi bir gibi davranır', W / 2, 930, { size: 34, family: 'serif', italic: true, color: C.cream, alpha: oa * after(t, 'sub-odometer', 5, 0.6) * (1 - move) });
      // C · 7 + 997
      const ta = beatVis(lt, 'sub.trick');
      if (ta > 0) {
        const k = (i) => after(t, 'sub-trick', i, 0.5);
        text(ctx, '−3  →  997', ox, 800, { size: 46, family: 'mono', weight: 700, color: C.digital, alpha: ta * k(1) });
        const xr = 1500;
        const cw = 96;
        colText(ctx, '007', xr, 330, cw, { size: 84, alpha: ta * k(2), color: C.cream });
        colText(ctx, '997', xr, 430, cw, { size: 84, alpha: ta * k(2), color: C.digital });
        text(ctx, '+', xr - 3 * cw - 10, 430, { size: 76, family: 'mono', weight: 700, color: C.muted, alpha: ta * k(2) });
        ctx.save();
        ctx.globalAlpha *= ta * k(2);
        ctx.fillStyle = C.dim;
        ctx.fillRect(xr - 3 * cw - 50, 485, 3 * cw + 100, 4);
        ctx.restore();
        const fall = after(t, 'sub-trick', 5, 1.0, ease.in);
        colText(ctx, '004', xr, 560, cw, { size: 84, alpha: ta * k(3), colorFn: (i) => (i === 2 && k(6) > 0 ? C.fire : C.cream) });
        if (k(6) > 0) glow(ctx, xr - cw, 560, 170, FIRE, 0.18 * ta * k(6));
        ctx.save();
        ctx.translate(xr - 3 * cw, 560 + 320 * fall);
        ctx.rotate(1.2 * fall);
        text(ctx, '1', 0, 0, { size: 84, family: 'mono', weight: 700, color: C.error, alpha: ta * k(3) * (1 - fall) });
        ctx.restore();
        const fr = ta * k(4);
        panel(ctx, xr - cw, 560, 3 * cw + 30, 120, fr, { fill: 'rgba(0,0,0,0)', stroke: C.flame, dash: [10, 8], lw: 3, r: 14 });
        text(ctx, 'üç basamak', xr - cw, 650, { size: 28, color: C.flame, alpha: fr });
        text(ctx, 'bin dört', xr + 90, 560, { size: 30, family: 'serif', italic: true, color: C.muted, align: 'left', alpha: ta * k(3) * (1 - k(5)) });
        runs(ctx, [['7 − 3 = ', { size: 76, family: 'mono', weight: 700, color: C.cream }], ['4', { size: 76, family: 'mono', weight: 700, color: C.fire }]], 1350, 820, { alpha: ta * k(7) });
        text(ctx, 'hiç çıkarma yapmadan ✓', 1350, 900, { size: 38, family: 'serif', italic: true, color: C.ok, alpha: ta * k(9) });
      }
    }
    // D · ikilik düzende aynı hile
    const ba = beatVis(lt, 'sub.binary');
    if (ba > 0) {
      const k = (i) => after(t, 'sub-binary', i, 0.5);
      text(ctx, 'ikilik düzende aynı hile', W / 2, 210, { size: 44, family: 'serif', italic: true, color: C.flame, alpha: ba * k(1) });
      // eksi üçü bulmak: ters çevir, bir ekle
      const lx = 560;
      const row = (label, bits, y, a, col, extra) => {
        text(ctx, label, lx - 190, y, { size: 34, family: 'mono', weight: 700, color: C.muted, align: 'right', alpha: a });
        runs(ctx, bits.split('').map((b) => [b, { size: 54, family: 'mono', weight: 700, color: col ?? (b === '1' ? C.fire : C.off) }]), lx + 60, y + 18, { alpha: a });
        if (extra) text(ctx, extra, lx + 270, y, { size: 32, family: 'mono', weight: 700, color: C.digital, align: 'left', alpha: a });
      };
      row('3', '00000011', 340, ba * k(2));
      row('DEĞİL', '11111100', 440, ba * k(3));
      row('+1', '11111101', 540, ba * k(4), null, '= −3');
      // 7 + (−3)
      const add = ba * k(5);
      const xr = 1640;
      const cw = 40;
      colText(ctx, '00000111', xr, 340, cw, { size: 60, alpha: add });
      colText(ctx, '11111101', xr, 430, cw, { size: 60, alpha: add });
      text(ctx, '+', xr - 9 * cw, 430, { size: 54, family: 'mono', weight: 700, color: C.muted, alpha: add });
      text(ctx, '7', xr + 60, 340, { size: 36, family: 'mono', color: C.muted, align: 'left', alpha: add });
      text(ctx, '−3', xr + 60, 430, { size: 36, family: 'mono', color: C.digital, align: 'left', alpha: add });
      ctx.save();
      ctx.globalAlpha *= add;
      ctx.fillStyle = C.dim;
      ctx.fillRect(xr - 9 * cw, 470, 10 * cw, 4);
      ctx.restore();
      const c5 = cue('sub-binary', 5);
      const res = ba * progress(t, c5 + 0.6, c5 + 1.1);
      const fall = progress(t, c5 + 1.4, c5 + 2.4, ease.in);
      colText(ctx, '00000100', xr, 530, cw, { size: 60, alpha: res });
      text(ctx, '4', xr + 60, 530, { size: 36, family: 'mono', color: C.fire, align: 'left', alpha: res * fall });
      ctx.save();
      ctx.translate(xr - 8 * cw, 530 + 300 * fall);
      ctx.rotate(1.2 * fall);
      text(ctx, '1', 0, 0, { size: 60, family: 'mono', weight: 700, color: C.error, alpha: res * (1 - fall) });
      ctx.restore();
      // aynı toplayıcı, iki iş
      const sa = ba * k(6);
      for (let i = 0; i < 8; i++) panel(ctx, W / 2 + (3.5 - i) * 80, 790, 64, 64, sa, { fill: '#141d33', stroke: '#4a5878', lw: 2, r: 8 });
      text(ctx, 'aynı toplayıcı', W / 2, 700, { size: 36, family: 'serif', italic: true, color: C.cream, alpha: sa });
      text(ctx, '+  toplama', W / 2 - 520, 790, { size: 42, family: 'mono', weight: 700, color: C.fire, align: 'right', alpha: ba * k(7) });
      text(ctx, 'çıkarma  −', W / 2 + 520, 790, { size: 42, family: 'mono', weight: 700, color: C.digital, align: 'left', alpha: ba * k(7) });
    }
  }

  // ---------------------------------------------------------------------------
  // 9 · Çarpma: tekrarlı toplama, kaydır ve topla
  // ---------------------------------------------------------------------------

  // Kayan sayı: str sağa yaslı yazılır; shift (0..n, sürekli) kadar sola kayar, sağdan sıfırlar girer
  function shiftRow(ctx, str, xr, y, cw, shift, alpha, size = 80) {
    const n = str.length;
    for (let i = 0; i < n; i++) {
      const ch = str[i];
      text(ctx, ch, xr - (n - 1 - i) * cw - shift * cw, y, { size, family: 'mono', weight: 700, color: ch === '1' ? C.fire : ch === '0' ? C.off : C.cream, alpha });
    }
    for (let z = 0; z < Math.ceil(shift - 1e-6); z++) {
      const p = clamp(shift - z);
      text(ctx, '0', xr - (shift - z - 1) * cw, y, { size, family: 'mono', weight: 700, color: C.flame, alpha: alpha * p });
    }
  }

  function sceneMul(ctx, lt, t) {
    kicker(ctx, 'ÇARPMA', lt, 28);
    // A · 5 × 4 = 5 + 5 + 5 + 5
    const ra = beatVis(lt, 'mul.repeat');
    if (ra > 0) {
      text(ctx, 'tekrarlı toplama', W / 2, 210, { size: 40, family: 'serif', italic: true, color: C.muted, alpha: ra * after(t, 'mul-repeat', 1, 0.6) });
      text(ctx, '5 × 4', W / 2, 310, { size: 96, family: 'mono', weight: 700, color: C.cream, alpha: ra * after(t, 'mul-repeat', 2, 0.5) });
      const c3 = cue('mul-repeat', 3);
      for (let g = 0; g < 4; g++) {
        const ga = ra * progress(t, c3 + g * 0.35, c3 + g * 0.35 + 0.4);
        const x = W / 2 + (g - 1.5) * 300;
        for (let d = 0; d < 5; d++) {
          ctx.save();
          ctx.globalAlpha *= ga;
          ctx.fillStyle = C.fire;
          dot(ctx, x + (d % 2 ? 26 : -26) * (d === 4 ? 0 : 1), 450 + Math.floor(d / 2) * 56, 20);
          ctx.restore();
        }
        text(ctx, '5', x, 650, { size: 64, family: 'mono', weight: 700, color: C.cream, alpha: ga });
        if (g < 3) text(ctx, '+', x + 150, 650, { size: 64, family: 'mono', weight: 700, color: C.muted, alpha: ra * progress(t, c3 + g * 0.35 + 0.3, c3 + g * 0.35 + 0.6) });
      }
      text(ctx, '= 20', W / 2, 790, { size: 80, family: 'mono', weight: 700, color: C.flame, alpha: ra * progress(t, c3 + 1.6, c3 + 2.1) });
    }
    // B · kaydırma: onlukta ×10, ikilikte ×2
    const sa = beatVis(lt, 'mul.shift');
    if (sa > 0) {
      const xr = 1100;
      const cw = 96;
      const d1 = after(t, 'mul-shift', 1, 0.8, ease.inOut);
      const b1 = after(t, 'mul-shift', 3, 0.8, ease.inOut);
      text(ctx, 'onluk', 420, 380, { size: 34, weight: 700, spacing: 3, color: C.muted, alpha: sa * after(t, 'mul-shift', 1, 0.4) });
      shiftRow(ctx, '37', xr, 380, cw, d1, sa * after(t, 'mul-shift', 1, 0.4));
      text(ctx, '× 10', xr + 160, 380, { size: 56, family: 'mono', weight: 700, color: C.flame, align: 'left', alpha: sa * after(t, 'mul-shift', 2, 0.5) });
      text(ctx, '37 → 370', xr + 360, 380, { size: 34, family: 'mono', color: C.muted, align: 'left', alpha: sa * after(t, 'mul-shift', 2, 0.5) });
      text(ctx, 'ikilik', 420, 600, { size: 34, weight: 700, spacing: 3, color: C.muted, alpha: sa * after(t, 'mul-shift', 3, 0.4) });
      shiftRow(ctx, '101', xr, 600, cw, b1, sa * after(t, 'mul-shift', 3, 0.4));
      text(ctx, '× 2', xr + 160, 600, { size: 56, family: 'mono', weight: 700, color: C.flame, align: 'left', alpha: sa * after(t, 'mul-shift', 4, 0.5) });
      text(ctx, '5 → 10', xr + 360, 600, { size: 34, family: 'mono', color: C.muted, align: 'left', alpha: sa * after(t, 'mul-shift', 4, 0.5) });
      const ka = sa * after(t, 'mul-shift', 5, 0.6);
      text(ctx, 'KAYDIRMA', W / 2, 800, { size: 60, family: 'display', weight: 900, spacing: 8, color: C.cream, alpha: ka });
      arrow(ctx, W / 2 + 200, 870, W / 2 - 200, 870, C.fire, ka, 5, 22);
      text(ctx, 'rakamlar sola kayar', W / 2, 920, { size: 30, family: 'serif', italic: true, color: C.muted, alpha: ka });
    }
    // C · 5 × 4 ve 5 × 6
    const ea = beatVis(lt, 'mul.example');
    if (ea > 0) {
      const k = (i) => after(t, 'mul-example', i, 0.5);
      const lx = 560;
      runs(ctx, [['5 = ', { size: 64, family: 'mono', weight: 700, color: C.cream }], ...bitRuns('101', 64)], lx, 300, { alpha: ea * k(1) });
      const c2 = cue('mul-example', 2);
      const sh = steps(t, [[c2 + 0.3, 1], [c2 + 1.1, 2]], 0.6);
      text(ctx, '× 4: iki kez kaydır', lx, 400, { size: 34, family: 'serif', italic: true, color: C.muted, alpha: ea * k(2) });
      shiftRow(ctx, '101', lx + 140, 500, 70, sh, ea * k(2), 70);
      hlBox(ctx, lx, 500, 420, 100, FIRE, ea * k(3) * 0.8);
      text(ctx, '= 20', lx, 610, { size: 64, family: 'mono', weight: 700, color: C.flame, alpha: ea * k(4) });
      text(ctx, '5 × 4 = 20', lx, 740, { size: 50, family: 'mono', weight: 700, color: C.cream, alpha: ea * k(5) });
      text(ctx, 'tek bir toplama bile yok', lx, 810, { size: 34, family: 'serif', italic: true, color: C.ok, alpha: ea * k(6) });
      // sağ: 5 × 6
      const rx = 1380;
      const xr = rx + 170;
      const cw = 64;
      text(ctx, '5 × 6 = ?', rx, 300, { size: 60, family: 'mono', weight: 700, color: C.cream, alpha: ea * k(7) });
      text(ctx, '6 = 4 + 2', rx, 380, { size: 44, family: 'mono', weight: 700, color: C.digital, alpha: ea * k(8) });
      colText(ctx, '10100', xr, 480, cw, { size: 64, alpha: ea * k(9) });
      colText(ctx, '1010', xr, 560, cw, { size: 64, alpha: ea * k(9) });
      text(ctx, '+', xr - 5 * cw - 10, 560, { size: 60, family: 'mono', weight: 700, color: C.muted, alpha: ea * k(9) });
      text(ctx, '5 × 4', xr + 60, 480, { size: 28, family: 'mono', color: C.muted, align: 'left', alpha: ea * k(10) });
      text(ctx, '5 × 2', xr + 60, 560, { size: 28, family: 'mono', color: C.muted, align: 'left', alpha: ea * k(10) });
      ctx.save();
      ctx.globalAlpha *= ea * k(9);
      ctx.fillStyle = C.dim;
      ctx.fillRect(xr - 5 * cw - 30, 605, 6 * cw + 40, 4);
      ctx.restore();
      colText(ctx, '11110', xr, 660, cw, { size: 64, alpha: ea * k(11) });
      text(ctx, '20 + 10', xr + 60, 660, { size: 28, family: 'mono', color: C.muted, align: 'left', alpha: ea * k(11) });
      text(ctx, '= 30', rx, 770, { size: 64, family: 'mono', weight: 700, color: C.flame, alpha: ea * k(12) });
    }
    // D · makinenin hızı: 13 × 11
    const fa = beatVis(lt, 'mul.fast');
    if (fa > 0) {
      const c1 = cue('mul-fast', 1);
      const xr = 1120;
      const cw = 52;
      const rows = [['1101', 270, C.cream], ['1011', 340, C.cream], ['1101', 440], ['11010', 500], ['000000', 560], ['1101000', 620], ['10001111', 720]];
      rows.forEach(([str, y], i) => {
        const at = i < 2 ? 0 : i < 6 ? c1 + (i - 2) * 0.25 : c1 + 1.3;
        const a = fa * (i < 2 ? progress(lt, 23.2, 23.8) : progress(t, at, at + 0.2));
        colText(ctx, str, xr, y, cw, { size: 54, alpha: a, colorFn: (j, ch) => (i === 4 ? C.dim : ch === '1' ? C.fire : C.off) });
      });
      text(ctx, '×', xr - 5 * cw, 340, { size: 50, family: 'mono', weight: 700, color: C.muted, alpha: fa * progress(lt, 23.2, 23.8) });
      ctx.save();
      ctx.globalAlpha *= fa * progress(lt, 23.2, 23.8);
      ctx.fillStyle = C.dim;
      ctx.fillRect(xr - 8 * cw, 385, 9 * cw, 3);
      ctx.globalAlpha *= progress(t, c1 + 1.1, c1 + 1.3);
      ctx.fillRect(xr - 8 * cw, 670, 9 * cw, 3);
      ctx.restore();
      text(ctx, '13 × 11 = 143', 1420, 720, { size: 50, family: 'mono', weight: 700, color: C.flame, alpha: fa * progress(t, c1 + 1.4, c1 + 1.9) });
      text(ctx, 'kaydır · topla · kaydır · topla', 1420, 500, { size: 32, family: 'serif', italic: true, color: C.muted, alpha: fa * after(t, 'mul-fast', 1, 0.6) });
      const ea2 = fa * after(t, 'mul-fast', 2, 0.6);
      text(ctx, 'birkaç nanosaniye', 1420, 800, { size: 38, family: 'serif', italic: true, color: C.cream, alpha: ea2 });
      text(ctx, '(saniyenin milyarda biri birkaç kez)', 1420, 850, { size: 26, color: C.muted, alpha: ea2 });
    }
  }

  // ---------------------------------------------------------------------------
  // 10 · Bölme ve karekök
  // ---------------------------------------------------------------------------

  function sceneDiv(ctx, lt, t) {
    kicker(ctx, 'BÖLME VE KÖK', lt, 26);
    // A · 20 ÷ 4: dörder dörder çıkar
    const da = beatVis(lt, 'div.repeat');
    if (da > 0) {
      const k = (i) => after(t, 'div-repeat', i, 0.5);
      text(ctx, 'tekrarlı çıkarma', W / 2, 190, { size: 38, family: 'serif', italic: true, color: C.muted, alpha: da * k(1) });
      runs(ctx, [['20 ÷ 4 = ', { size: 76, family: 'mono', weight: 700, color: C.cream }], ['?', { size: 76, family: 'mono', weight: 700, color: C.muted, alpha: 1 - k(11) }]], W / 2, 300, { alpha: da * k(2) });
      text(ctx, '5', W / 2 + 216, 274, { size: 76, family: 'mono', weight: 700, color: C.fire, alpha: da * k(11) });
      const bar = da * progress(lt, 0.6, 1.4);
      const bx = (i) => W / 2 + (i - 9.5) * 64;
      for (let i = 0; i < 20; i++) {
        const g = Math.floor((19 - i) / 4);
        const cg = cue('div-repeat', 4 + g);
        const p = progress(t, cg, cg + 0.7, ease.inOut);
        const slot = (19 - i) % 4;
        const tx = W / 2 + (g - 2) * 250 + (slot % 2 ? 30 : -30);
        const ty = 700 + (slot < 2 ? -30 : 30);
        const x = lerp(bx(i), tx, p);
        const y = lerp(450, ty, p) - Math.sin(p * Math.PI) * 80;
        const s = lerp(56, 52, p);
        ctx.save();
        ctx.globalAlpha *= bar;
        roundRect(ctx, x - s / 2, y - s / 2, s, s, 8);
        ctx.fillStyle = p > 0.5 ? '#c27a30' : C.fire;
        ctx.fill();
        ctx.restore();
      }
      const left = [20, 16, 12, 8, 4, 0];
      let n = 20;
      for (let j = 0; j < 5; j++) if (t >= cue('div-repeat', 4 + j)) n = left[j + 1];
      text(ctx, 'kalan', W / 2 + 10.5 * 64 + 40, 395, { size: 26, color: C.muted, align: 'left', alpha: bar * k(3) });
      text(ctx, String(n), W / 2 + 10.5 * 64 + 40, 450, { size: 56, family: 'mono', weight: 700, color: C.cream, align: 'left', alpha: bar * k(3) });
      for (let j = 0; j < 5; j++) {
        const ca = da * after(t, 'div-repeat', 4 + j, 0.4);
        text(ctx, `${j + 1}`, W / 2 + (j - 2) * 250, 800, { size: 40, family: 'mono', weight: 700, color: t > cue('div-repeat', 9) ? C.flame : C.muted, alpha: ca });
      }
      text(ctx, 'beş kez', W / 2, 870, { size: 44, family: 'serif', italic: true, color: C.flame, alpha: da * k(9) });
    }
    // B · karekök, logaritma, sinüs
    const ra = beatVis(lt, 'div.root');
    if (ra > 0) {
      const items = [['√x', 'karekök'], ['log x', 'logaritma'], ['sin x', 'sinüs']];
      items.forEach(([sym, name], i) => {
        const a = ra * after(t, 'root-intro', i, 0.5);
        const x = W / 2 + (i - 1) * 420;
        text(ctx, sym, x, 380, { size: 90, family: 'serif', italic: true, color: C.cream, alpha: a });
        text(ctx, name, x, 480, { size: 34, color: C.muted, alpha: a });
      });
      const la = ra * after(t, 'root-intro', 4, 0.6);
      if (la > 0) {
        const cx = W / 2;
        const cy = 720;
        const rot = clock('div', t) * 2.2;
        ctx.save();
        ctx.globalAlpha *= la;
        ctx.strokeStyle = C.fire;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy, 90, rot, rot + Math.PI * 1.6);
        ctx.stroke();
        ctx.restore();
        arrow(ctx, cx + Math.cos(rot + Math.PI * 1.55) * 90, cy + Math.sin(rot + Math.PI * 1.55) * 90, cx + Math.cos(rot + Math.PI * 1.65) * 90, cy + Math.sin(rot + Math.PI * 1.65) * 90, C.fire, la, 6, 22);
        text(ctx, 'tekrarla', cx, cy, { size: 32, weight: 700, color: C.cream, alpha: la });
        text(ctx, 'topla · çarp', cx - 330, cy, { size: 40, family: 'mono', weight: 700, color: C.fire, alpha: la });
        text(ctx, '≈ yaklaş', cx + 330, cy, { size: 40, family: 'mono', weight: 700, color: C.digital, alpha: ra * after(t, 'root-intro', 5, 0.6) });
      }
    }
    // C · ikinin karekökü
    const qa = beatVis(lt, 'div.sqrt');
    if (qa > 0) {
      const k = (i) => after(t, 'root-example', i, 0.5);
      text(ctx, '√2 = ?', 430, 220, { size: 76, family: 'serif', italic: true, color: C.cream, alpha: qa * k(0) });
      text(ctx, 'x × x = 2', 430, 310, { size: 44, family: 'mono', weight: 700, color: C.muted, alpha: qa * k(1) });
      const rows = [
        ['1,4 × 1,4', '1,96', 2, 3, 4, 'ikiden az', C.digital],
        ['1,41 × 1,41', '1,9881', 5, 6, 7, 'hâlâ az', C.digital],
        ['1,414 × 1,414', '1,999396', 8, 8, 9, 'çok yakın', C.ok],
      ];
      rows.forEach(([lhs, rhs, kl, kr, kt, tag, col], j) => {
        const y = 430 + j * 90;
        text(ctx, lhs + ' =', 880, y, { size: 46, family: 'mono', weight: 700, color: C.cream, align: 'right', alpha: qa * k(kl) });
        text(ctx, rhs, 910, y, { size: 46, family: 'mono', weight: 700, color: C.flame, align: 'left', alpha: qa * k(kr) });
        text(ctx, tag, 1200, y, { size: 36, family: 'serif', italic: true, color: col, align: 'left', alpha: qa * k(kt) });
      });
      text(ctx, '(1,42 × 1,42 = 2,0164: fazla)', 1360, 520, { size: 26, family: 'mono', color: C.error, align: 'left', alpha: qa * k(7) * 0.85 });
      // sayı doğrusu: 1,90 → 2,05
      const nx = (v) => 300 + ((v - 1.9) / 0.15) * 1320;
      const la = qa * progress(lt, 14.4, 15.2);
      ctx.save();
      ctx.globalAlpha *= la;
      ctx.strokeStyle = C.dim;
      ctx.lineWidth = 3;
      line(ctx, nx(1.9), 820, nx(2.05), 820);
      for (const v of [1.9, 1.95, 2.0, 2.05]) line(ctx, nx(v), 808, nx(v), 832);
      ctx.strokeStyle = C.ok;
      ctx.lineWidth = 4;
      line(ctx, nx(2), 760, nx(2), 860);
      ctx.restore();
      for (const v of [1.9, 1.95, 2.05]) text(ctx, String(v).replace('.', ','), nx(v), 870, { size: 24, family: 'mono', color: C.muted, alpha: la });
      text(ctx, 'hedef: 2', nx(2), 740, { size: 28, weight: 700, color: C.ok, alpha: la });
      for (const [v, kk, col] of [[1.96, 3, C.digital], [1.9881, 6, C.digital], [2.0164, 7, C.error], [1.999396, 9, C.flame]]) {
        const a = qa * k(kk);
        if (a <= 0) continue;
        ctx.save();
        ctx.globalAlpha *= a;
        ctx.fillStyle = col;
        dot(ctx, nx(v), 820, 12);
        ctx.restore();
      }
      // basamak basamak doğru
      const digits = '1,41421356…';
      const shown = t < cue('root-example', 10) ? 0 : Math.min(digits.length, 3 + Math.floor((t - cue('root-example', 10)) / 0.35));
      text(ctx, '√2 =', 1260, 220, { size: 50, family: 'serif', italic: true, color: C.cream, align: 'right', alpha: qa * k(10) });
      for (let i = 0; i < shown; i++) {
        text(ctx, digits[i], 1290 + i * 34, 222, { size: 50, family: 'mono', weight: 700, color: i < 5 ? C.fire : C.flame, align: 'left', alpha: qa * k(10) });
      }
      text(ctx, 'her adımda bir basamak daha', 1460, 300, { size: 32, family: 'serif', italic: true, color: C.muted, alpha: qa * k(12) });
    }
  }

  // ---------------------------------------------------------------------------
  // 11 · Her şey, en dipte toplamadır
  // ---------------------------------------------------------------------------

  function drawThing(ctx, kind, x, y, s, alpha, t) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = C.cream;
    ctx.fillStyle = C.cream;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    switch (kind) {
      case 'video':
        roundRect(ctx, -70, -48, 140, 96, 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-16, -24);
        ctx.lineTo(26, 0);
        ctx.lineTo(-16, 24);
        ctx.closePath();
        ctx.fillStyle = C.fire;
        ctx.fill();
        break;
      case 'face':
        ctx.beginPath();
        ctx.arc(0, 0, 44, 0, Math.PI * 2);
        ctx.stroke();
        dot(ctx, -16, -10, 5);
        dot(ctx, 16, -10, 5);
        ctx.beginPath();
        ctx.arc(0, 8, 20, 0.2, Math.PI - 0.2);
        ctx.stroke();
        ctx.strokeStyle = C.digital;
        for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          line(ctx, sx * 64, sy * 64, sx * 64, sy * 44);
          line(ctx, sx * 64, sy * 64, sx * 44, sy * 64);
        }
        break;
      case 'translate':
        roundRect(ctx, -76, -46, 90, 56, 10);
        ctx.stroke();
        roundRect(ctx, -14, -6, 90, 56, 10);
        ctx.fillStyle = '#1a2338';
        ctx.fill();
        ctx.stroke();
        text(ctx, 'Aa', -31, -18, { size: 28, weight: 700, color: C.cream });
        text(ctx, 'あ', 31, 22, { size: 28, weight: 700, color: C.fire });
        break;
      case 'building':
        ctx.strokeRect(-40, -56, 80, 112);
        for (let i = 1; i < 4; i++) line(ctx, -40, -56 + i * 28, 40, -56 + i * 28);
        line(ctx, 0, -56, 0, 56);
        ctx.strokeStyle = C.fire;
        line(ctx, -40, -56, 40, 56);
        line(ctx, 40, -56, -40, 56);
        break;
      case 'net': {
        const L = [[-60, [-36, 0, 36]], [0, [-48, -16, 16, 48]], [60, [-20, 20]]];
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(243,237,225,0.45)';
        for (let a = 0; a < L.length - 1; a++) for (const y1 of L[a][1]) for (const y2 of L[a + 1][1]) line(ctx, L[a][0], y1, L[a + 1][0], y2);
        for (const [lx, ys] of L) for (const yy of ys) {
          ctx.fillStyle = hash(lx * 3 + yy, Math.floor((t ?? 0) * 3)) > 0.5 ? C.fire : C.cream;
          dot(ctx, lx, yy, 9);
        }
        break;
      }
      default:
        break;
    }
    ctx.restore();
  }

  // Basit piksel resmi: gökyüzü, güneş, tepeler, göl (renk 0..255)
  function pixelColor(c, r) {
    const u = c / 31;
    const v = r / 17;
    const hill = 0.62 + 0.12 * Math.sin(u * 7 + 1) + 0.06 * Math.sin(u * 17);
    let col;
    if (v > 0.84) col = [40, 70, 110];
    else if (v > hill) col = [50 + 30 * u, 90 + 20 * Math.sin(u * 9), 50];
    else col = [70 + 80 * v, 90 + 70 * v, 150 + 40 * v];
    const sd = Math.hypot(u - 0.72, (v - 0.28) * 1.8);
    if (sd < 0.09 && v <= hill) col = [250, 200, 110];
    return col;
  }

  // Kubbe taşları: yığındaki ve kubbedeki yerleri
  const DOME = (() => {
    const out = [];
    const cx = 1250;
    const base = 700;
    const r1 = 240;
    const r2 = 312;
    // duvarlar (iki yanda üçer taş)
    for (const side of [-1, 1]) {
      for (let j = 0; j < 3; j++) out.push({ kind: 'wall', x: cx + side * (r1 + r2) / 2, y: base + 30 + j * 60, a: 0, w: r2 - r1, h: 58 });
    }
    // kemer taşları (dıştan içe, iki yandan tepeye)
    const n = 15;
    const order = [];
    for (let i = 0; i < 7; i++) order.push(i, n - 1 - i);
    order.push(7);
    for (const i of order) {
      const a0 = Math.PI + (i / n) * Math.PI;
      const a1 = Math.PI + ((i + 1) / n) * Math.PI;
      const am = (a0 + a1) / 2;
      out.push({ kind: 'arch', x: cx + Math.cos(am) * (r1 + r2) / 2, y: base + Math.sin(am) * (r1 + r2) / 2, a: am + Math.PI / 2, da: (a1 - a0), r1, r2, key: i === 7 });
    }
    // yığın yerleri
    const rows = [7, 6, 5, 3];
    let k = 0;
    rows.forEach((cnt, r) => {
      for (let j = 0; j < cnt && k < out.length; j++, k++) {
        out[k].hx = 470 + (j - (cnt - 1) / 2) * 76 + (hash(k, 3) - 0.5) * 16;
        out[k].hy = 880 - r * 52 + (hash(k, 4) - 0.5) * 10;
        out[k].ha = (hash(k, 5) - 0.5) * 1.2;
      }
    });
    for (; k < out.length; k++) {
      out[k].hx = 470 + (hash(k, 6) - 0.5) * 120;
      out[k].hy = 670;
      out[k].ha = hash(k, 7) * 2;
    }
    return out;
  })();

  function drawDomeStone(ctx, st, x, y, a, alpha) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.beginPath();
    if (st.kind === 'arch') {
      const rm = (st.r1 + st.r2) / 2;
      const h = (st.r2 - st.r1) / 2;
      const wIn = Math.tan(st.da / 2) * st.r1 * 0.96;
      const wOut = Math.tan(st.da / 2) * st.r2 * 0.96;
      ctx.moveTo(-wOut, -h);
      ctx.lineTo(wOut, -h);
      ctx.lineTo(wIn, h);
      ctx.lineTo(-wIn, h);
      ctx.closePath();
      void rm;
    } else {
      ctx.rect(-st.w / 2 + 2, -st.h / 2 + 2, st.w - 4, st.h - 4);
    }
    const g = ctx.createLinearGradient(-40, -30, 40, 30);
    g.addColorStop(0, st.key ? '#c9a26a' : '#9a8a72');
    g.addColorStop(1, st.key ? '#8a6a3a' : '#5e5446');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,16,10,0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function sceneAll(ctx, lt, t) {
    kicker(ctx, 'HER ŞEY TOPLAMADIR', lt, 24);
    // A · beş iş, tek işlem
    const la = beatVis(lt, 'all.list');
    if (la > 0) {
      const kinds = [['video', 'video oynatmak'], ['face', 'yüz tanımak'], ['translate', 'çeviri'], ['building', 'statik hesabı'], ['net', 'yapay zekâ']];
      const rain = la * after(t, 'all-list', 6, 0.8);
      kinds.forEach(([kind, name], i) => {
        const x = W / 2 + (i - 2) * 340;
        const a = la * after(t, 'all-list', i + 1, 0.5);
        drawThing(ctx, kind, x, 340, 1.15, a, t);
        text(ctx, name, x, 450, { size: 30, color: C.muted, alpha: a });
        if (rain > 0) {
          for (let n = 0; n < 9; n++) {
            const ph = (clock('all', t) * 0.45 + hash(i * 31 + n, 2)) % 1;
            const px = x + (hash(i * 17 + n, 3) - 0.5) * 160;
            const py = 500 + ph * 360;
            text(ctx, '+', px, py, { size: 34 + 14 * hash(n, i), family: 'mono', weight: 700, color: C.fire, alpha: rain * Math.sin(ph * Math.PI) });
          }
        }
      });
      const ba = la * after(t, 'all-list', 8, 0.6);
      glow(ctx, W / 2, 900, 420, FIRE, 0.18 * ba);
      text(ctx, 'en dipte: milyarlarca toplama', W / 2, 910, { size: 56, family: 'display', weight: 800, color: C.flame, alpha: ba });
    }
    // B · bir videoyu aydınlatmak
    const pa = beatVis(lt, 'all.pixels');
    if (pa > 0) {
      const c2 = cue('all-pixels', 2);
      const cs = 22;
      const x0 = 160;
      const y0 = 300;
      const ia = pa * progress(lt, 8.2, 8.9);
      ctx.save();
      ctx.globalAlpha *= ia;
      for (let r = 0; r < 18; r++) {
        const add = 45 * progress(t, c2 + r * 0.05, c2 + r * 0.05 + 0.3);
        for (let c = 0; c < 32; c++) {
          const col = pixelColor(c, r).map((v) => Math.min(255, Math.round(v + add)));
          ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
          ctx.fillRect(x0 + c * cs, y0 + r * cs, cs - 1, cs - 1);
        }
      }
      // tarama çizgisi
      const sp = (t - c2) / (18 * 0.05 + 0.3);
      if (sp > 0 && sp < 1) {
        ctx.fillStyle = 'rgba(255,230,160,0.5)';
        ctx.fillRect(x0 - 6, y0 + sp * 18 * cs, 32 * cs + 12, 3);
      }
      ctx.strokeStyle = C.flame;
      ctx.lineWidth = 3;
      ctx.strokeRect(x0 + 20 * cs - 2, y0 + 9 * cs - 2, cs + 3, cs + 3);
      ctx.restore();
      // büyütülmüş nokta
      const za = pa * after(t, 'all-pixels', 1, 0.6);
      if (za > 0) {
        const base = pixelColor(20, 9);
        const add = Math.round(45 * progress(t, c2 + 9 * 0.05, c2 + 9 * 0.05 + 0.3));
        ctx.save();
        ctx.globalAlpha *= za;
        ctx.strokeStyle = 'rgba(255,210,122,0.6)';
        ctx.lineWidth = 2;
        line(ctx, x0 + 21 * cs, y0 + 9 * cs, 1000, 300);
        line(ctx, x0 + 21 * cs, y0 + 10 * cs, 1000, 500);
        const col = base.map((v) => Math.min(255, Math.round(v + add)));
        ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
        ctx.fillRect(1000, 300, 200, 200);
        ctx.restore();
        const names = ['kırmızı', 'yeşil', 'mavi'];
        base.forEach((v, i) => {
          const b = Math.round(v);
          const y = 330 + i * 70;
          const rgb = [[255, 120, 110], [130, 220, 140], [120, 170, 255]][i];
          text(ctx, names[i], 1240, y, { size: 30, color: rgba(rgb, 1), align: 'left', alpha: za });
          text(ctx, `${b}`, 1440, y, { size: 38, family: 'mono', weight: 700, color: C.cream, align: 'right', alpha: za });
          text(ctx, `+ 45 = ${Math.min(255, b + 45)}`, 1460, y, { size: 38, family: 'mono', weight: 700, color: C.fire, align: 'left', alpha: pa * after(t, 'all-pixels', 2, 0.6) });
        });
      }
      const fx = 1400;
      text(ctx, '3840 × 2160 ≈ 8,3 milyon nokta', fx, 620, { size: 38, family: 'mono', weight: 700, color: C.cream, alpha: pa * after(t, 'all-pixels', 3, 0.6) });
      text(ctx, '× 3 renk', fx, 685, { size: 38, family: 'mono', weight: 700, color: C.cream, alpha: pa * after(t, 'all-pixels', 4, 0.6) });
      text(ctx, '× 60 kare / saniye', fx, 750, { size: 38, family: 'mono', weight: 700, color: C.cream, alpha: pa * after(t, 'all-pixels', 5, 0.6) });
      const big = pa * after(t, 'all-pixels', 7, 0.7);
      if (big > 0) glow(ctx, fx, 860, 320, FIRE, 0.16 * big);
      text(ctx, '≈ 1.500.000.000 toplama / saniye', fx, 860, { size: 46, family: 'mono', weight: 700, color: C.fire, alpha: big });
      text(ctx, '4K görüntü', x0 + 16 * cs, y0 + 18 * cs + 50, { size: 30, color: C.muted, alpha: ia });
    }
    // C · taşlar ve kubbe
    const ka = beatVis(lt, 'all.dome');
    if (ka > 0) {
      text(ctx, 'farklı olan: işlemlerin sıralaması', W / 2, 220, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: ka * after(t, 'all-dome', 1, 0.6) });
      const c2 = cue('all-dome', 2);
      DOME.forEach((st, i) => {
        const p = progress(t, c2 + i * 0.07, c2 + i * 0.07 + 0.9, ease.inOut);
        const x = lerp(st.hx, st.x, p);
        const y = lerp(st.hy, st.y, p) - Math.sin(p * Math.PI) * 160;
        const a = lerp(st.ha, st.a, p);
        drawDomeStone(ctx, st, x, y, a, ka * progress(lt, 16.2, 16.9));
      });
      ctx.save();
      ctx.globalAlpha *= ka;
      ctx.fillStyle = '#2a2622';
      ctx.fillRect(160, 906, 1600, 6);
      ctx.restore();
      text(ctx, 'taş yığını', 470, 960, { size: 32, color: C.muted, alpha: ka * after(t, 'all-dome', 3, 0.5) });
      text(ctx, 'taşın kendisi değil', 470, 520, { size: 38, family: 'serif', italic: true, color: C.muted, alpha: ka * after(t, 'all-dome', 3, 0.6) });
      text(ctx, 'taşların dizilişi', 1250, 310, { size: 44, family: 'serif', italic: true, color: C.flame, alpha: ka * after(t, 'all-dome', 4, 0.6) });
      text(ctx, 'kubbe', 1250, 960, { size: 32, color: C.muted, alpha: ka * after(t, 'all-dome', 4, 0.5) });
    }
  }

  // ---------------------------------------------------------------------------
  // 12 · Zamanı bölen metronom: gecikme, şef, kristal, durulma, gigahertz
  // ---------------------------------------------------------------------------

  // Elde koşarken çıkışın gösterdiği ara sonuçlar (s: kaç elde ulaştı)
  const RIPPLE = Array.from({ length: 8 }, (_, s) => N91.reduce((acc, a, i) => acc + ((a ^ N53[i] ^ (i <= s ? CARRY[i] : 0)) << i), 0));

  function rippleShow() {
    const c5 = cue('clock-delay', 5);
    const step = clamp((cue('clock-delay', 8) - c5) / 8, 0.25, 0.5);
    return { c5, step, idx: (t) => (t < c5 ? -1 : Math.min(7, Math.floor((t - c5) / step))) };
  }

  const NET = {
    w: [
      [[200, 470], [454, 470], [454, 492], [497, 492]],
      [[200, 570], [454, 570], [454, 548], [497, 548]],
      [[623, 520], [760, 520], [760, 392], [855, 392]],
      [[760, 520], [760, 632], [855, 632]],
      [[200, 360], [800, 360], [800, 448], [855, 448]],
      [[200, 760], [800, 760], [800, 688], [855, 688]],
      [[1065, 420], [1180, 420], [1180, 512], [1255, 512]],
      [[1065, 660], [1180, 660], [1180, 568], [1255, 568]],
      [[1423, 540], [1560, 540]],
    ],
  };

  function sceneClock(ctx, lt, t) {
    kicker(ctx, 'ZAMANI BÖLEN METRONOM', lt, 40);
    // A · elektrik sürekli akar: işlem ne zaman bitti?
    const pa = beatVis(lt, 'clock.problem');
    if (pa > 0) {
      const live = after(t, 'clock-problem', 1, 0.6);
      NET.w.forEach((pts, i) => drawWire(ctx, pts, live * (0.5 + 0.5 * Math.sin(t * 3 + i)), t, pa, 5));
      drawGate(ctx, 'and', 560, 520, 0.6, pa, C.cream);
      drawGate(ctx, 'or', 960, 420, 1.0, pa, C.cream);
      drawGate(ctx, 'xor', 960, 660, 1.0, pa, C.cream);
      drawGate(ctx, 'and', 1340, 540, 0.8, pa, C.cream);
      drawBulb(ctx, 1600, 540, 34, live * (0.5 + 0.5 * Math.sin(t * 7)), pa);
      text(ctx, 'elektrik durmadan akar', W / 2, 220, { size: 42, family: 'serif', italic: true, color: C.cream, alpha: pa * after(t, 'clock-problem', 1, 0.6) });
      const qa = pa * after(t, 'clock-problem', 3, 0.6);
      text(ctx, 'işlem ne zaman bitti?', W / 2, 880, { size: 52, family: 'display', weight: 800, color: C.flame, alpha: qa });
      text(ctx, '?', 1600, 420, { size: 90, family: 'display', weight: 900, color: C.flame, alpha: qa * (0.6 + 0.4 * Math.sin(t * 4)) });
    }
    // B · gecikme ve yanlış ara sonuçlar
    const da = beatVis(lt, 'clock.delay');
    if (da > 0) {
      const c1 = cue('clock-delay', 1);
      const D = 0.9;
      const inp = t > c1 ? 1 : 0;
      const outp = t > c1 + D ? 1 : 0;
      const busy = progress(t, c1, c1 + 0.1) * (1 - progress(t, c1 + D, c1 + D + 0.2));
      drawSwitch(ctx, 200, 300, 380, steps(t, [[c1, 1]], 0.25), da, { label: 'giriş', size: 30 });
      drawWire(ctx, [[300, 380], [440, 380]], inp, t, da);
      if (busy > 0) glow(ctx, 520, 380, 120, FIRE, 0.4 * busy * da);
      panel(ctx, 520, 380, 160, 110, da, { fill: '#141d33', stroke: busy > 0.3 ? C.fire : '#4a5878', r: 14 });
      text(ctx, 'kapı', 520, 380, { size: 32, weight: 700, color: C.cream, alpha: da });
      drawWire(ctx, [[600, 380], [740, 380]], outp, t, da);
      drawBulb(ctx, 790, 380, 30, outp, da);
      // zaman çizelgesi
      const ta = da * after(t, 'clock-delay', 0, 0.6);
      const tx = (tm) => 240 + (tm - (c1 - 1.2)) * 190;
      const now = Math.min(t, c1 + 2.4);
      ctx.save();
      ctx.globalAlpha *= ta;
      ctx.lineWidth = 4;
      for (const [y, edge, col] of [[580, c1, C.fire], [700, c1 + D, C.flame]]) {
        ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.moveTo(tx(c1 - 1.2), y + 30);
        if (now > edge) {
          ctx.lineTo(tx(edge), y + 30);
          ctx.lineTo(tx(edge), y - 30);
          ctx.lineTo(tx(now), y - 30);
        } else {
          ctx.lineTo(tx(now), y + 30);
        }
        ctx.stroke();
      }
      ctx.restore();
      text(ctx, 'giriş', 200, 580, { size: 28, color: C.fire, align: 'right', alpha: ta });
      text(ctx, 'çıkış', 200, 700, { size: 28, color: C.flame, align: 'right', alpha: ta });
      const ga = da * after(t, 'clock-delay', 4, 0.5);
      if (ga > 0) {
        ctx.save();
        ctx.globalAlpha *= ga;
        ctx.strokeStyle = C.digital;
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 2;
        line(ctx, tx(c1), 540, tx(c1), 780);
        line(ctx, tx(c1 + D), 640, tx(c1 + D), 780);
        ctx.restore();
        arrow(ctx, tx(c1) + 4, 770, tx(c1 + D) - 2, 770, C.digital, ga, 3, 12);
        text(ctx, 'gecikme', (tx(c1) + tx(c1 + D)) / 2, 805, { size: 28, family: 'serif', italic: true, color: C.digital, alpha: ga });
      }
      // sağ: sekiz bitlik toplayıcının çıkışı
      const R = rippleShow();
      const ra = da * after(t, 'clock-delay', 5, 0.6);
      if (ra > 0) {
        const i = R.idx(t);
        const val = i < 0 ? 0 : RIPPLE[i];
        const settled = i === 7 && t > R.c5 + 8 * R.step;
        text(ctx, '91 + 53', 1400, 250, { size: 44, family: 'mono', weight: 700, color: C.muted, alpha: ra });
        panel(ctx, 1400, 380, 420, 150, ra, { fill: '#05080f', stroke: settled ? C.ok : '#4a5878', lw: 3, r: 14 });
        text(ctx, String(val), 1400, 384, { size: 100, family: 'mono', weight: 700, color: settled ? C.ok : i >= 0 ? C.error : C.dim, alpha: ra });
        lampRow(ctx, 1400, 520, bitsOf(val, 8).split('').map(Number), 18, 50, ra);
        const wa = da * after(t, 'clock-delay', 7, 0.4);
        text(ctx, settled ? '✓ durulunca: 144' : '✗ henüz yanlış', 1400, 610, { size: 34, family: 'serif', italic: true, color: settled ? C.ok : C.error, alpha: wa });
        const ea = da * after(t, 'clock-delay', 8, 0.6);
        if (ea > 0) {
          text(ctx, 'erken okuyan:', 1240, 730, { size: 30, color: C.muted, align: 'right', alpha: ea });
          text(ctx, '110 ✗', 1260, 730, { size: 36, family: 'mono', weight: 700, color: C.error, align: 'left', alpha: ea });
          text(ctx, 'beklerse:', 1240, 790, { size: 30, color: C.muted, align: 'right', alpha: da * after(t, 'clock-delay', 9, 0.6) });
          text(ctx, '144 ✓', 1260, 790, { size: 36, family: 'mono', weight: 700, color: C.ok, align: 'left', alpha: da * after(t, 'clock-delay', 9, 0.6) });
        }
      }
    }
    // C · orkestra ve şef
    const oa = beatVis(lt, 'clock.orchestra');
    if (oa > 0) {
      const c5 = cue('clock-orchestra', 5);
      const P = 0.8;
      const ems = (i, upto) => {
        const out = [];
        if (upto < c5) {
          for (let n = Math.floor((upto - 1.6) / 0.7); n <= Math.floor(upto / 0.7); n++) {
            const e = n * 0.7 + hash(i * 97 + n, 11) * 0.7;
            if (e <= upto && e < c5) out.push(e);
          }
        } else {
          for (let n = Math.floor((c5 - 1.6) / 0.7); n <= Math.floor(c5 / 0.7); n++) {
            const e = n * 0.7 + hash(i * 97 + n, 11) * 0.7;
            if (e < c5 && e <= upto) out.push(e);
          }
          for (let n = Math.ceil((c5 + 0.4) / P); n * P <= upto; n++) out.push(n * P);
        }
        return out.filter((e) => upto - e < 1.6);
      };
      for (let i = 0; i < 5; i++) {
        const x = W / 2 + (i - 2) * 260;
        drawIcon(ctx, 'person', x, 560, 1.8, C.cream, oa);
        for (const e of ems(i, t)) {
          const age = t - e;
          text(ctx, '♪', x + 20 + age * 30, 430 - age * 110, { size: 44, color: t > c5 && e > c5 ? C.flame : C.muted, alpha: oa * clamp(1 - age / 1.6) });
        }
      }
      // ses dalgası
      const wa = oa * progress(lt, 13.3, 14.0);
      ctx.save();
      ctx.globalAlpha *= wa;
      ctx.strokeStyle = t > c5 + 0.6 ? C.flame : C.muted;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 360; x <= 1560; x += 4) {
        const tm = t - (1560 - x) / 400;
        let amp = 0;
        for (let i = 0; i < 5; i++) for (const e of ems(i, tm)) amp += Math.exp(-Math.pow((tm - e) / 0.04, 2)) * (0.6 + 0.4 * hash(i, Math.round(e * 10)));
        const y = 945 - amp * 24 * Math.sin(x * 0.7);
        if (x === 360) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
      // şef
      const ca = oa * after(t, 'clock-orchestra', 5, 0.6);
      if (ca > 0) {
        drawIcon(ctx, 'person', W / 2, 800, 2.4, C.flame, ca);
        const sw = Math.sin(((t - c5) / P) * Math.PI) * 0.7;
        ctx.save();
        ctx.globalAlpha *= ca;
        ctx.strokeStyle = C.flame;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        line(ctx, W / 2 + 30, 740, W / 2 + 30 + Math.sin(sw) * 110, 740 - Math.cos(sw) * 110);
        ctx.restore();
      }
      text(ctx, 'tempo yoksa: gürültü', W / 2, 220, { size: 44, family: 'serif', italic: true, color: C.error, alpha: oa * after(t, 'clock-orchestra', 3, 0.5) * (1 - ca) });
      text(ctx, 'bilgisayarın şefi: saat darbesi', W / 2, 220, { size: 46, family: 'display', weight: 800, color: C.flame, alpha: oa * after(t, 'clock-orchestra', 6, 0.6) });
    }
    // D · kristal ve dört adım
    const ka = beatVis(lt, 'clock.crystal');
    if (ka > 0) {
      const P = 1.4;
      const t0 = cue('clock-crystal', 0);
      const ph = (tm) => ((tm - t0) % P + P) % P;
      // kristal
      const jx = Math.sin(t * 70) * 2.5;
      ctx.save();
      ctx.globalAlpha *= ka;
      ctx.translate(300 + jx, 430);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 6 + (i * Math.PI) / 3;
        ctx.lineTo(Math.cos(a) * 70, Math.sin(a) * 110);
      }
      ctx.closePath();
      const g = ctx.createLinearGradient(-70, -110, 70, 110);
      g.addColorStop(0, 'rgba(210,230,255,0.85)');
      g.addColorStop(1, 'rgba(120,150,200,0.55)');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = '#e8f0ff';
      ctx.lineWidth = 3;
      ctx.stroke();
      line(ctx, 0, -110, 0, 110);
      ctx.restore();
      text(ctx, 'kuvars kristali', 300, 590, { size: 30, color: C.cream, alpha: ka * after(t, 'clock-crystal', 0, 0.5) });
      // kare dalga
      const wa = ka * after(t, 'clock-crystal', 1, 0.6);
      ctx.save();
      ctx.globalAlpha *= wa;
      ctx.strokeStyle = C.fire;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let x = 400; x <= 1100; x += 3) {
        const tm = t - (x - 400) / 500;
        const hi = ph(tm) < P / 2;
        const y = hi ? 390 : 470;
        if (x === 400) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
      // dağıtım ağacı
      const ends = [230, 330, 430, 530, 630, 730];
      const tree = ends.map((y) => [[1100, 430], [1200, 430], [1200, (y + (y < 430 ? 0 : 0))], [1380, y]]);
      const da = ka * after(t, 'clock-crystal', 2, 0.6);
      const sinceEdge = ph(t);
      tree.forEach((pts) => {
        drawWire(ctx, pts, 0, t, da, 4);
        if (sinceEdge < 0.5 && da > 0) {
          const [x, y] = pointAt(pts, pathLength(pts) * (sinceEdge / 0.5));
          glow(ctx, x, y, 34, FIRE, 0.9 * da);
        }
      });
      ends.forEach((y) => {
        const flash = sinceEdge >= 0.5 && sinceEdge < 0.8 ? 1 : 0;
        panel(ctx, 1460, y, 150, 64, da, { fill: flash ? '#3a2a18' : '#141d33', stroke: flash ? C.fire : '#4a5878', r: 10 });
        text(ctx, 'kapılar', 1460, y, { size: 22, color: C.muted, alpha: da });
      });
      // oku → hesapla → aktar → don
      const stepsTxt = ['oku', 'hesapla', 'aktar', 'don'];
      const cyc = t > cue('clock-crystal', 6) + 0.4 ? Math.floor((sinceEdge / P) * 4) : -1;
      stepsTxt.forEach((s, i) => {
        const a = ka * after(t, 'clock-crystal', 3 + i, 0.5);
        const x = 480 + i * 260;
        const on = cyc === i || (cyc < 0 && t > cue('clock-crystal', 3 + i) && t < cue('clock-crystal', 3 + i) + 1.2);
        panel(ctx, x, 830, 200, 80, a, { fill: on ? '#3a2a18' : '#121a2c', stroke: on ? C.fire : '#4a5878', r: 14 });
        text(ctx, s, x, 830, { size: 36, weight: 700, color: on ? C.flame : C.cream, alpha: a });
        if (i < 3) arrow(ctx, x + 105, 830, x + 152, 830, C.dim, a, 3, 12);
      });
      const ra = ka * after(t, 'clock-crystal', 7, 0.6);
      if (ra > 0) {
        ctx.save();
        ctx.globalAlpha *= ra;
        ctx.strokeStyle = C.dim;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(1260, 860);
        ctx.quadraticCurveTo(1300, 940, 870, 940);
        ctx.quadraticCurveTo(440, 940, 400, 870);
        ctx.stroke();
        ctx.restore();
        arrow(ctx, 410, 890, 400, 872, C.dim, ra, 3, 12);
        text(ctx, 'her darbede yeniden', 870, 970, { size: 28, family: 'serif', italic: true, color: C.muted, alpha: ra });
      }
    }
    // E · durulma: sonuç hazır olunca okunur
    const sa = beatVis(lt, 'clock.settle');
    if (sa > 0) {
      const rev = progress(lt, 27.2, 28.8, ease.linear);
      const xr = 300 + rev * 1360;
      const edges = [340, 780, 1220];
      ctx.save();
      ctx.globalAlpha *= sa;
      ctx.beginPath();
      ctx.rect(0, 0, xr, H);
      ctx.clip();
      // bölgeler
      edges.forEach((e) => {
        ctx.fillStyle = 'rgba(255,84,104,0.10)';
        ctx.fillRect(e, 520, 200, 200);
        ctx.fillStyle = 'rgba(127,224,163,0.10)';
        ctx.fillRect(e + 200, 520, 240, 200);
      });
      // saat
      ctx.strokeStyle = C.fire;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(300, 420);
      edges.forEach((e) => {
        ctx.lineTo(e, 420);
        ctx.lineTo(e, 340);
        ctx.lineTo(e + 220, 340);
        ctx.lineTo(e + 220, 420);
      });
      ctx.lineTo(1660, 420);
      ctx.stroke();
      // sonuç: titrer, sonra durulur
      ctx.strokeStyle = C.flame;
      ctx.beginPath();
      ctx.moveTo(300, 620);
      edges.forEach((e, j) => {
        ctx.lineTo(e, 620 + (j % 2 ? -30 : 30) * 0);
        for (let k = 0; k < 7; k++) ctx.lineTo(e + 10 + k * 26, 620 + (hash(j * 13 + k, 4) > 0.5 ? -40 : 40));
        const v = hash(j, 9) > 0.5 ? -40 : 40;
        ctx.lineTo(e + 200, 620 + v);
        ctx.lineTo(e + 440, 620 + v);
      });
      ctx.stroke();
      ctx.restore();
      text(ctx, 'saat', 260, 380, { size: 30, color: C.fire, align: 'right', alpha: sa });
      text(ctx, 'sonuç', 260, 620, { size: 30, color: C.flame, align: 'right', alpha: sa });
      text(ctx, 'durulma', edges[0] + 100, 750, { size: 26, color: C.error, alpha: sa * progress(lt, 27.6, 28.2) });
      text(ctx, 'hazır', edges[0] + 320, 750, { size: 26, color: C.ok, alpha: sa * progress(lt, 27.8, 28.4) });
      const ba = sa * after(t, 'clock-settle', 1, 0.6);
      if (ba > 0) {
        ctx.save();
        ctx.globalAlpha *= ba;
        ctx.strokeStyle = C.digital;
        ctx.lineWidth = 3;
        line(ctx, edges[0], 300, edges[1], 300);
        line(ctx, edges[0], 290, edges[0], 310);
        line(ctx, edges[1], 290, edges[1], 310);
        ctx.restore();
        text(ctx, 'darbe aralığı ≥ en uzun elde yolu', (edges[0] + edges[1]) / 2 + 120, 260, { size: 32, family: 'serif', italic: true, color: C.digital, alpha: ba });
      }
      const oa2 = sa * after(t, 'clock-settle', 3, 0.6);
      [edges[1], edges[2]].forEach((e) => {
        arrow(ctx, e, 440, e, 560, C.ok, oa2, 4, 16);
        text(ctx, '✓', e + 30, 500, { size: 40, weight: 800, color: C.ok, alpha: oa2 });
      });
      text(ctx, 'sonuç, hazırken okunur', W / 2, 880, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: oa2 });
    }
    // F · 3,2 GHz
    const ga = beatVis(lt, 'clock.ghz');
    if (ga > 0) {
      text(ctx, '3,2 GHz', W / 2, 320, { size: 150, family: 'display', weight: 900, color: C.cream, alpha: ga * after(t, 'clock-ghz', 0, 0.6) });
      text(ctx, 'saniyede 3.200.000.000 darbe', W / 2, 480, { size: 50, family: 'mono', weight: 700, color: C.fire, alpha: ga * after(t, 'clock-ghz', 2, 0.6) });
      const na = ga * after(t, 'clock-ghz', 4, 0.2);
      if (na > 0) {
        const strobe = Math.floor((t - cue('clock-ghz', 4)) * 10) % 2 ? 0.35 : 1;
        glow(ctx, W / 2, 650, 300, FIRE, 0.25 * na * strobe);
        text(ctx, 'ŞİMDİ!', W / 2, 650, { size: 110, family: 'display', weight: 900, color: C.flame, alpha: na * strobe });
      }
      const wa = ga * after(t, 'clock-ghz', 3, 0.6);
      ctx.save();
      ctx.globalAlpha *= wa;
      ctx.strokeStyle = C.fire;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 200; x <= 1720; x += 2) {
        const hi = Math.floor((x + t * 600) / 12) % 2 === 0;
        const y = hi ? 830 : 870;
        if (x === 200) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }
    // G · bir darbede ışık: ~9 cm
    const la = beatVis(lt, 'clock.light');
    if (la > 0) {
      const x0 = 460;
      const cm = 100;
      ctx.save();
      ctx.globalAlpha *= la;
      ctx.fillStyle = '#c9b48a';
      roundRect(ctx, x0 - 30, 620, 10 * cm + 60, 80, 8);
      ctx.fill();
      ctx.strokeStyle = '#3a2f1d';
      ctx.lineWidth = 2;
      for (let i = 0; i <= 100; i++) {
        const x = x0 + i * (cm / 10);
        line(ctx, x, 620, x, 620 + (i % 10 === 0 ? 34 : i % 5 === 0 ? 24 : 14));
      }
      ctx.restore();
      for (let i = 0; i <= 10; i++) text(ctx, String(i), x0 + i * cm, 678, { size: 22, weight: 700, color: '#3a2f1d', alpha: la });
      text(ctx, 'cm', x0 + 10 * cm + 50, 660, { size: 26, color: C.muted, align: 'left', alpha: la });
      // ışık atımı
      const per = 1.5;
      const p = clamp(((t - TL.scene('clock').start) % per) / (per * 0.75));
      const lx = x0 + 9.4 * cm * p;
      const grad = ctx.createLinearGradient(lx - 220, 0, lx, 0);
      grad.addColorStop(0, 'rgba(255,240,200,0)');
      grad.addColorStop(1, 'rgba(255,240,200,0.9)');
      ctx.save();
      ctx.globalAlpha *= la;
      ctx.fillStyle = grad;
      ctx.fillRect(Math.max(x0, lx - 220), 576, Math.min(220, lx - x0), 8);
      ctx.restore();
      glow(ctx, lx, 580, 50, [255, 240, 200], 0.9 * la);
      const ma = la * after(t, 'clock-light', 2, 0.5);
      ctx.save();
      ctx.globalAlpha *= ma;
      ctx.strokeStyle = C.flame;
      ctx.lineWidth = 3;
      line(ctx, x0 + 9.4 * cm, 540, x0 + 9.4 * cm, 620);
      ctx.restore();
      text(ctx, '≈ 9,4 cm', x0 + 9.4 * cm + 20, 540, { size: 34, family: 'mono', weight: 700, color: C.flame, align: 'left', alpha: ma });
      text(ctx, 'iki darbe arasında ışığın aldığı yol', W / 2, 800, { size: 42, family: 'serif', italic: true, color: C.cream, alpha: la * after(t, 'clock-light', 1, 0.6) });
      // avuç
      const ha = la * after(t, 'clock-light', 3, 0.6);
      if (ha > 0) {
        // üstten görülen el: avuç, dört parmak, başparmak
        const px = x0 + 50;
        const pw = 8.5 * cm;
        ctx.save();
        ctx.globalAlpha *= ha * 0.92;
        ctx.fillStyle = '#c99a78';
        ctx.strokeStyle = '#8a6248';
        ctx.lineWidth = 3;
        const fw = pw / 4 - 50;
        [270, 330, 310, 240].forEach((fh, i) => {
          const fx = px + 25 + i * (pw / 4);
          roundRect(ctx, fx, 420 - fh, fw, fh + 40, fw / 2);
          ctx.fill();
          ctx.stroke();
        });
        ctx.save();
        ctx.translate(px + 20, 520);
        ctx.rotate(-2.3);
        roundRect(ctx, 0, -45, 260, 90, 45);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        roundRect(ctx, px, 400, pw, 160, 50);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        text(ctx, 'bir avuç içi', px + pw / 2, 485, { size: 38, family: 'serif', italic: true, color: C.ink, alpha: ha });
      }
      text(ctx, 'bir darbe ≈ 0,31 nanosaniye', W / 2, 875, { size: 36, family: 'mono', weight: 700, color: C.muted, alpha: la * after(t, 'clock-light', 2, 0.8) });
    }
  }

  // ---------------------------------------------------------------------------
  // 13 · Yaygın yanılgı: tempo ≠ iş
  // ---------------------------------------------------------------------------

  function drawMetronome(ctx, x, y, period, t, alpha, col = C.cream) {
    if (alpha <= 0.002) return;
    const sw = Math.sin((t / period) * Math.PI) * 0.45;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.beginPath();
    ctx.moveTo(x - 46, y + 60);
    ctx.lineTo(x - 20, y - 70);
    ctx.lineTo(x + 20, y - 70);
    ctx.lineTo(x + 46, y + 60);
    ctx.closePath();
    ctx.fillStyle = '#1a2338';
    ctx.fill();
    ctx.strokeStyle = '#5a6788';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = col;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    line(ctx, x, y + 40, x + Math.sin(sw) * 100, y + 40 - Math.cos(sw) * 100);
    ctx.fillStyle = col;
    dot(ctx, x + Math.sin(sw) * 70, y + 40 - Math.cos(sw) * 70, 9);
    ctx.restore();
  }

  function sceneMyth(ctx, lt, t) {
    kicker(ctx, 'YAYGIN BİR YANILGI', lt, 24);
    // A · yüksek saat hızı ≠ her zaman hızlı
    const ia = beatVis(lt, 'myth.intro');
    if (ia > 0) {
      const l = ia * after(t, 'myth-intro', 2, 0.5);
      const r = ia * after(t, 'myth-intro', 3, 0.5);
      panel(ctx, 520, 480, 560, 160, l, { fill: '#141d33', stroke: '#4a5878' });
      text(ctx, 'daha yüksek', 520, 455, { size: 40, weight: 700, color: C.cream, alpha: l });
      text(ctx, 'saat hızı', 520, 510, { size: 40, weight: 700, color: C.fire, alpha: l });
      panel(ctx, 1400, 480, 560, 160, r, { fill: '#141d33', stroke: '#4a5878' });
      text(ctx, 'daha hızlı', 1400, 455, { size: 40, weight: 700, color: C.cream, alpha: r });
      text(ctx, 'bilgisayar', 1400, 510, { size: 40, weight: 700, color: C.flame, alpha: r });
      text(ctx, '=', 960, 470, { size: 120, weight: 700, color: C.cream, alpha: l });
      const no = ia * progress(t, cue('myth-intro', 3) + 0.5, cue('myth-intro', 3) + 0.9);
      ctx.save();
      ctx.globalAlpha *= no;
      ctx.strokeStyle = C.error;
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      line(ctx, 920, 540, 1000, 400);
      ctx.restore();
      text(ctx, 'her zaman değil', 960, 680, { size: 52, family: 'serif', italic: true, color: C.error, alpha: no });
    }
    // B · iki işçi: hızlı tempo, az iş / yavaş tempo, çok iş
    const wa = beatVis(lt, 'myth.work');
    if (wa > 0) {
      const lanes = [
        { y: 400, P: 0.5, per: 1, k: 0, lab: '4 GHz · darbe başına 1 iş', col: C.fire },
        { y: 740, P: 0.667, per: 4, k: 2, lab: '3 GHz · darbe başına 4 iş', col: C.digital },
      ];
      lanes.forEach(({ y, P, per, k, lab, col }) => {
        const a = wa * after(t, 'myth-work', k, 0.6);
        if (a <= 0) return;
        const s0 = cue('myth-work', k) + 0.5;
        const el = Math.max(0, t - s0);
        drawMetronome(ctx, 230, y, P, el, a, col);
        text(ctx, lab, 380, y - 135, { size: 32, weight: 700, color: col, align: 'left', alpha: a });
        // kaynak yığın ve kutu
        panel(ctx, 520, y + 20, 160, 110, a, { fill: '#121a2c', stroke: '#4a5878', r: 10 });
        ctx.save();
        ctx.globalAlpha *= a * 0.7;
        ctx.fillStyle = col;
        for (let q = 0; q < 9; q++) ctx.fillRect(470 + (q % 3) * 36, y - 10 + Math.floor(q / 3) * 26, 26, 20);
        ctx.restore();
        panel(ctx, 1450, y + 20, 220, 130, a, { fill: '#121a2c', stroke: col, r: 12 });
        const n = t > s0 ? Math.floor(el / P) : 0;
        const ph = t > s0 ? (el % P) / P : 1;
        for (let j = 0; j < per; j++) {
          const x = lerp(540, 1430, ease.inOut(ph)) + (j - (per - 1) / 2) * 34;
          const yy = y + 20 - Math.sin(ph * Math.PI) * 95 + (j % 2) * 8;
          ctx.save();
          ctx.globalAlpha *= a * (t > s0 ? 1 - clamp((ph - 0.8) / 0.15) : 0);
          ctx.fillStyle = col;
          ctx.fillRect(x - 14, yy - 14, 28, 28);
          ctx.restore();
        }
        text(ctx, `${n * per}`, 1450, y + 20, { size: 60, family: 'mono', weight: 700, color: C.cream, alpha: a });
        text(ctx, 'iş', 1600, y + 20, { size: 30, color: C.muted, align: 'left', alpha: a });
      });
      text(ctx, 'tempo bir şey, darbe başına iş başka şey', W / 2, 960, { size: 36, family: 'serif', italic: true, color: C.cream, alpha: wa * after(t, 'myth-work', 3, 0.6) });
    }
    // C · çubuklar: 4 milyar ve 12 milyar
    const ea = beatVis(lt, 'myth.example');
    if (ea > 0) {
      const x0 = 520;
      const unit = 75;
      const bars = [[420, 4, '4 GHz × 1', 0, 1, C.fire], [640, 12, '3 GHz × 4', 2, 3, C.digital]];
      bars.forEach(([y, v, lab, kl, kb, col]) => {
        const la = ea * after(t, 'myth-example', kl, 0.5);
        const g = after(t, 'myth-example', kb, 1.0, ease.out);
        text(ctx, lab, x0 - 30, y, { size: 40, family: 'mono', weight: 700, color: C.cream, align: 'right', alpha: la });
        ctx.save();
        ctx.globalAlpha *= la;
        ctx.fillStyle = col;
        ctx.fillRect(x0, y - 40, v * unit * g, 80);
        ctx.restore();
        text(ctx, `${v} milyar iş / sn`, x0 + v * unit * g + 24, y, { size: 36, family: 'mono', weight: 700, color: col, align: 'left', alpha: ea * after(t, 'myth-example', kb, 0.8) * g });
      });
      const ba = ea * after(t, 'myth-example', 5, 0.6);
      text(ctx, '3 katı', x0 + 6 * unit, 790, { size: 70, family: 'display', weight: 900, color: C.flame, alpha: ba });
      text(ctx, 'yavaş tempolu olan', x0 + 6 * unit, 860, { size: 34, family: 'serif', italic: true, color: C.cream, alpha: ea * after(t, 'myth-example', 4, 0.6) });
    }
    // D · tempo değil düzen; ikinci kapı
    const da = beatVis(lt, 'myth.end');
    if (da > 0) {
      text(ctx, 'Tempoyu hızlandırmak,', W / 2, 330, { size: 58, family: 'serif', color: C.cream, alpha: da * after(t, 'myth-end', 0, 0.6) });
      text(ctx, 'orkestranın daha iyi çalmasını sağlamaz.', W / 2, 420, { size: 58, family: 'serif', color: C.cream, alpha: da * after(t, 'myth-end', 1, 0.6) });
      const ka = da * after(t, 'myth-end', 2, 0.7);
      if (ka > 0) {
        glow(ctx, W / 2, 680, 220, FIRE, 0.25 * ka);
        drawIcon(ctx, 'door', W / 2, 680, 1.6, C.flame, ka, 0.25 + 0.1 * Math.sin(t * 2));
      }
      text(ctx, 'İKİNCİ KAPI', W / 2, 830, { size: 44, family: 'display', weight: 900, spacing: 8, color: C.flame, alpha: ka });
      text(ctx, 'işlemcinin iç düzeni', W / 2, 890, { size: 34, family: 'serif', italic: true, color: C.muted, alpha: da * after(t, 'myth-end', 3, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 14 · Hatırlamak: çıkışı girişine bağlanan VEYA kapısı
  // ---------------------------------------------------------------------------

  const MEM = { bx: 300, by: 620, gx: 820, gy: 560, s: 1.2, split: 1080, lamp: 1250, top: 330, loopX: 600, sw1: 820, sw2: 940 };

  function memTimes() {
    const f3 = cue('mem-forget', 3);
    const f4 = Math.max(cue('mem-forget', 4), f3 + 0.8);
    const h2 = cue('mem-hold', 2);
    const r1 = cue('mem-reset', 1);
    const r3 = Math.max(cue('mem-reset', 3), r1 + 1.0);
    return { f3, f4, h2, r1, r3 };
  }

  function memState(t) {
    const T = memTimes();
    const press = (t >= T.f3 && t < T.f4) || (t >= T.h2 && t < T.h2 + 0.8) ? 1 : 0;
    let Q = 0;
    if (t < T.h2) Q = t >= T.f3 && t < T.f4 ? 1 : 0;
    else Q = t < T.r1 + 0.25 ? 1 : 0;
    const silOpen = t >= T.r1 && t < T.r3 ? 1 : 0;
    const loop = Q && t >= T.h2 + 0.3 && !silOpen ? 1 : 0;
    return { press, Q, silOpen, loop, T };
  }

  function drawToggle(ctx, x, y, on, alpha) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    roundRect(ctx, x - 40, y - 64, 80, 128, 14);
    ctx.fillStyle = '#e9e2d4';
    ctx.fill();
    roundRect(ctx, x - 22, y - 46, 44, 92, 10);
    ctx.fillStyle = '#c9c0ae';
    ctx.fill();
    const k = ease.inOut(clamp(on));
    roundRect(ctx, x - 22, lerp(y - 4, y - 46, k), 44, 50, 10);
    ctx.fillStyle = k > 0.5 ? C.fire : '#8a8272';
    ctx.fill();
    ctx.restore();
  }

  function sceneMem(ctx, lt, t) {
    kicker(ctx, 'HATIRLAMAK', lt, 40);
    // A · sonuç nerede saklanır?
    const qa = beatVis(lt, 'mem.question');
    if (qa > 0) {
      const cx = W / 2;
      panel(ctx, cx, 560, 380, 500, qa, { fill: '#1a2338', stroke: '#5a6788', r: 28 });
      panel(ctx, cx, 400, 300, 110, qa, { fill: '#0a1a14', stroke: '#2d4a3c', r: 10 });
      const gone = after(t, 'mem-question', 2, 1.0);
      const flick = gone > 0 && gone < 1 ? (hash(Math.floor(t * 14), 3) > 0.5 ? 1 : 0.2) : 1;
      text(ctx, '144', cx + 110, 404, { size: 76, family: 'mono', weight: 700, color: '#9df0c0', align: 'right', alpha: qa * (1 - gone) * flick });
      text(ctx, '?', cx, 404, { size: 76, family: 'display', weight: 900, color: C.flame, alpha: qa * gone });
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) panel(ctx, cx - 105 + c * 70, 510 + r * 70, 54, 50, qa, { fill: '#2a3550', stroke: '#3a4664', r: 8 });
      }
      text(ctx, 'hesap ✓', cx - 400, 400, { size: 40, family: 'serif', italic: true, color: C.ok, alpha: qa * after(t, 'mem-question', 1, 0.6) });
      text(ctx, 'peki sonuç nerede saklanır?', W / 2, 900, { size: 46, family: 'serif', italic: true, color: C.flame, alpha: qa * after(t, 'mem-question', 2, 0.6) });
    }
    // B–E · devre
    const ca = spanVis(lt, 'mem.forget', 'mem.reset');
    if (ca > 0) {
      const S = memState(t);
      const { gx, gy, s, split, lamp, top, loopX, sw1, sw2, bx, by } = MEM;
      const in1 = gy - 28 * s;
      const in2 = gy + 28 * s;
      const inX = gx - 105 * s;
      const outX = gx + 105 * s;
      // düğme ve kablosu
      drawButton(ctx, bx, by, S.press, ca, 'kur');
      drawWire(ctx, [[bx + 46, by], [640, by], [640, in2], [inX, in2]], S.press, t, ca);
      drawGate(ctx, 'or', gx, gy, s, ca, C.cream, S.Q);
      text(ctx, 'VEYA', gx, gy + 100, { size: 28, weight: 700, spacing: 3, color: C.muted, alpha: ca });
      drawWire(ctx, [[outX, gy], [lamp - 40, gy]], S.Q, t, ca);
      drawBulb(ctx, lamp, gy, 38, S.Q, ca);
      text(ctx, 'çıkış', lamp + 60, gy, { size: 30, color: C.cream, align: 'left', alpha: ca });
      // geri besleme döngüsü
      const draw = after(t, 'mem-loop', 1, 1.4, ease.inOut);
      if (draw > 0) {
        const full = [[split, gy], [split, top], [loopX, top], [loopX, in1], [inX, in1]];
        if (draw < 1) {
          ctx.save();
          ctx.globalAlpha *= ca;
          ctx.strokeStyle = C.flame;
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          partialPath(ctx, full, pathLength(full) * draw);
          ctx.restore();
        } else {
          const swA = after(t, 'mem-reset', 0, 0.5);
          drawWire(ctx, [[split, gy], [split, top], [sw2, top]], S.Q ? 1 : 0, t, ca);
          drawWire(ctx, [[sw1, top], [loopX, top], [loopX, in1], [inX, in1]], S.loop, t, ca);
          drawWire(ctx, [[sw2, top], [sw1, top]], S.loop, t, ca * (1 - swA));
          if (swA > 0) {
            drawSwitch(ctx, sw1, sw2, top, 1 - steps(t, [[S.T.r1, 1], [S.T.r3, 0]], 0.2), ca * swA);
            drawButton(ctx, (sw1 + sw2) / 2, top - 110, S.silOpen, ca * swA, '', C.error);
            text(ctx, 'sil', (sw1 + sw2) / 2 + 80, top - 110, { size: 30, weight: 700, color: C.error, align: 'left', alpha: ca * swA });
          }
        }
        ctx.save();
        ctx.globalAlpha *= ca * clamp(draw * 3);
        ctx.fillStyle = C.cream;
        dot(ctx, split, gy, 8);
        ctx.restore();
        text(ctx, 'geri besleme', (split + loopX) / 2 - 140, top - 40, { size: 30, family: 'serif', italic: true, color: C.flame, alpha: ca * after(t, 'mem-loop', 1, 0.6) * (1 - after(t, 'mem-reset', 0, 0.4)) });
      }
      // B · unutkan kapı ve kapı zili
      const fa = beatVis(lt, 'mem.forget');
      text(ctx, 'unutkan: çıkış = şimdiki giriş', W / 2, 210, { size: 42, family: 'serif', italic: true, color: C.cream, alpha: fa * after(t, 'mem-forget', 0, 0.6) });
      if (fa > 0) {
        const ring = S.Q ? 1 : 0;
        drawIcon(ctx, 'bell', 1480, gy - 10, 1.4, ring ? C.flame : C.cream, fa * after(t, 'mem-forget', 3, 0.5), ring ? 0.6 + 0.4 * Math.sin(t * 30) : 0);
        text(ctx, t > S.T.f4 ? 'bıraktın: sustu' : 'basılıyken çalar', 1480, gy + 110, { size: 30, family: 'serif', italic: true, color: C.muted, alpha: fa * after(t, 'mem-forget', 3, 0.5) });
      }
      // D · kendini tutar
      const ha = beatVis(lt, 'mem.hold');
      text(ctx, 'çıkış girişe döner', W / 2, 210, { size: 42, family: 'serif', italic: true, color: C.cream, alpha: ha * after(t, 'mem-hold', 4, 0.6) });
      const keep = ha * after(t, 'mem-hold', 5, 0.6);
      text(ctx, 'düğme bırakıldı, çıkış hâlâ 1', W / 2, 880, { size: 44, family: 'display', weight: 800, color: C.flame, alpha: keep });
      if (keep > 0) glow(ctx, lamp, gy, 140, FIRE, 0.2 * keep);
      // E · sil
      const ra = beatVis(lt, 'mem.reset');
      text(ctx, 'döngü koptu: çıkış 0', W / 2, 880, { size: 44, family: 'display', weight: 800, color: C.off, alpha: ra * after(t, 'mem-reset', 2, 0.5) * (1 - after(t, 'mem-reset', 3, 0.4)) });
      text(ctx, 've 0’da kalır', W / 2, 880, { size: 44, family: 'display', weight: 800, color: C.cream, alpha: ra * after(t, 'mem-reset', 3, 0.5) * (1 - after(t, 'mem-reset', 4, 0.4)) });
      text(ctx, 'yeni bir değer gelmedikçe değişmez', W / 2, 880, { size: 42, family: 'serif', italic: true, color: C.flame, alpha: ra * after(t, 'mem-reset', 4, 0.6) });
    }
    // F · bir bit; zil ve anahtar
    const ba = beatVis(lt, 'mem.bit');
    if (ba > 0) {
      const ca2 = ba * after(t, 'mem-bit', 0, 0.6);
      panel(ctx, W / 2, 380, 260, 220, ca2, { fill: '#141d33', stroke: C.flame, lw: 4, r: 22 });
      drawGate(ctx, 'or', W / 2 - 30, 400, 0.5, ca2, C.cream, 1);
      ctx.save();
      ctx.globalAlpha *= ca2;
      ctx.strokeStyle = rgba(FIRE, 0.8);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(W / 2 + 22, 400);
      ctx.lineTo(W / 2 + 40, 400);
      ctx.lineTo(W / 2 + 40, 320);
      ctx.lineTo(W / 2 - 100, 320);
      ctx.lineTo(W / 2 - 100, 386);
      ctx.lineTo(W / 2 - 82, 386);
      ctx.stroke();
      ctx.restore();
      drawBulb(ctx, W / 2 + 90, 400, 20, 1, ca2);
      text(ctx, '1 BİT', W / 2, 530, { size: 46, family: 'display', weight: 900, spacing: 6, color: C.flame, alpha: ba * after(t, 'mem-bit', 2, 0.5) });
      text(ctx, 'hafızanın en küçük birimi', W / 2, 590, { size: 34, family: 'serif', italic: true, color: C.cream, alpha: ba * after(t, 'mem-bit', 1, 0.5) });
      const za = ba * after(t, 'mem-bit', 3, 0.6);
      if (za > 0) {
        const c4 = cue('mem-bit', 4);
        const down = t >= c4 - 0.2 && t < c4 + 0.8 ? 1 : 0;
        drawButton(ctx, 470, 800, down, za);
        drawIcon(ctx, 'bell', 660, 790, 1.2, down ? C.flame : C.cream, za, down ? 0.6 + 0.4 * Math.sin(t * 30) : 0);
        text(ctx, 'zil: bırakınca susar', 570, 920, { size: 34, family: 'serif', italic: true, color: C.muted, alpha: ba * after(t, 'mem-bit', 4, 0.5) });
        const on = steps(t, [[cue('mem-bit', 5), 1]], 0.3);
        drawToggle(ctx, 1260, 800, on, za);
        drawBulb(ctx, 1440, 790, 40, on > 0.5 ? 1 : 0, za);
        text(ctx, 'anahtar: konumunu hatırlar', 1350, 920, { size: 34, family: 'serif', italic: true, color: C.flame, alpha: ba * after(t, 'mem-bit', 5, 0.5) });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 15 · Bayt, yazmaç, bellek; elektrik kesilince
  // ---------------------------------------------------------------------------

  function drawCell(ctx, x, y, s, bit, alpha) {
    if (alpha <= 0.002) return;
    panel(ctx, x, y, s, s, alpha, { fill: '#141d33', stroke: bit ? rgba(FIRE, 0.8) : '#3a4664', lw: 2, r: s * 0.16 });
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = bit ? rgba(FIRE, 0.7) : '#3a4664';
    ctx.lineWidth = Math.max(1.5, s * 0.035);
    ctx.beginPath();
    ctx.arc(x, y, s * 0.32, Math.PI * 0.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.restore();
    drawBulb(ctx, x, y, s * 0.17, bit, alpha);
  }

  function drawLaptop(ctx, x, y, alpha, screen, doc, saveK = 0) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    roundRect(ctx, x - 400, y - 250, 800, 480, 22);
    ctx.fillStyle = '#20283a';
    ctx.fill();
    ctx.fillStyle = '#05070c';
    ctx.fillRect(x - 370, y - 222, 740, 424);
    ctx.beginPath();
    ctx.moveTo(x - 470, y + 250);
    ctx.lineTo(x + 470, y + 250);
    ctx.lineTo(x + 430, y + 230);
    ctx.lineTo(x - 430, y + 230);
    ctx.closePath();
    ctx.fillStyle = '#2c3548';
    ctx.fill();
    if (screen > 0.01) {
      ctx.globalAlpha *= screen;
      ctx.fillStyle = '#e9edf5';
      ctx.fillRect(x - 370, y - 222, 740, 424);
      ctx.fillStyle = '#c9d1e2';
      ctx.fillRect(x - 370, y - 222, 740, 40);
      ctx.fillStyle = saveK > 0.5 ? C.ok : '#8090b0';
      roundRect(ctx, x + 230, y - 214, 126, 26, 6);
      ctx.fill();
      ctx.fillStyle = '#1b1f2a';
      ctx.font = '700 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('KAYDET', x + 293, y - 200);
      ctx.textAlign = 'left';
      ctx.font = '700 30px Inter, sans-serif';
      ctx.fillText('Ödev: toplayan devreler', x - 330, y - 140);
      const n = Math.floor(doc * 9);
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = '#9aa3b8';
        ctx.fillRect(x - 330, y - 92 + i * 30, (i === n - 1 ? 0.5 : 0.85 + 0.15 * hash(i, 4)) * 640, 12);
      }
    }
    ctx.restore();
  }

  function sceneRam(ctx, lt, t) {
    kicker(ctx, 'BELLEK', lt, 34);
    // A · bayt ve yazmaçlar
    const ra = beatVis(lt, 'ram.register');
    if (ra > 0) {
      const bits = '10010000';
      const rowA = ra * after(t, 'ram-register', 0, 0.6) * (1 - 0.5 * after(t, 'ram-register', 2, 0.6));
      for (let i = 0; i < 8; i++) drawCell(ctx, W / 2 + (i - 3.5) * 110, 270, 90, +bits[i], rowA);
      const ba = ra * after(t, 'ram-register', 1, 0.5);
      if (ba > 0) {
        ctx.save();
        ctx.globalAlpha *= ba;
        ctx.strokeStyle = C.flame;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(W / 2 - 430, 330);
        ctx.lineTo(W / 2 - 430, 342);
        ctx.lineTo(W / 2 + 430, 342);
        ctx.lineTo(W / 2 + 430, 330);
        ctx.stroke();
        ctx.restore();
        text(ctx, '8 hücre = 1 bayt  (144)', W / 2, 380, { size: 32, color: C.flame, alpha: ba });
      }
      const pa = ra * after(t, 'ram-register', 2, 0.7);
      if (pa > 0) {
        panel(ctx, W / 2, 680, 1300, 380, pa, { fill: '#0f1628', stroke: '#5a6788', lw: 3, r: 24 });
        ctx.save();
        ctx.globalAlpha *= pa;
        ctx.fillStyle = '#5a6788';
        for (let i = 0; i < 30; i++) {
          ctx.fillRect(W / 2 - 620 + i * 43, 480, 14, 16);
          ctx.fillRect(W / 2 - 620 + i * 43, 864, 14, 16);
        }
        ctx.restore();
        text(ctx, 'İŞLEMCİ', W / 2 + 470, 540, { size: 26, weight: 700, spacing: 6, color: C.muted, alpha: pa });
        for (let r = 0; r < 4; r++) {
          const y = 570 + r * 64;
          text(ctx, `Y${r + 1}`, 400, y, { size: 28, family: 'mono', weight: 700, color: C.muted, alpha: pa });
          for (let b = 0; b < 8; b++) {
            const bx0 = 450 + b * 86;
            panel(ctx, bx0 + 38, y, 78, 40, pa, { fill: '#141d33', stroke: '#3a4664', lw: 2, r: 6 });
            for (let c = 0; c < 8; c++) {
              const on = r === 0 && b === 7 ? +bits[c] : hash(r * 97 + b * 13 + c, 2) > 0.55 ? 1 : 0;
              ctx.save();
              ctx.globalAlpha *= pa;
              ctx.fillStyle = on ? C.fire : '#26304a';
              ctx.fillRect(bx0 + 5 + c * 9, y - 6, 7, 12);
              ctx.restore();
            }
          }
        }
        panel(ctx, 1380, 670, 200, 200, pa, { fill: '#1a2338', stroke: C.fire, lw: 3, r: 16 });
        text(ctx, '+', 1380, 660, { size: 110, family: 'display', weight: 800, color: C.fire, alpha: pa });
        text(ctx, 'toplayıcı', 1380, 745, { size: 24, color: C.muted, alpha: pa });
        arrow(ctx, 1150, 600, 1270, 630, C.dim, pa, 3, 12);
        arrow(ctx, 1270, 720, 1150, 750, C.dim, pa, 3, 12);
      }
      text(ctx, 'yazmaçlar: sekizer baytlık öbekler', 780, 530, { size: 30, weight: 700, color: C.cream, alpha: ra * after(t, 'ram-register', 3, 0.6) });
      text(ctx, 'işlemcinin küçük not defterleri', W / 2, 950, { size: 40, family: 'serif', italic: true, color: C.flame, alpha: ra * after(t, 'ram-register', 5, 0.6) });
    }
    // B · çalışma belleği
    const ma = beatVis(lt, 'ram.memory');
    if (ma > 0) {
      const sa = ma * after(t, 'ram-memory', 0, 0.7);
      ctx.save();
      ctx.globalAlpha *= sa;
      roundRect(ctx, W / 2 - 620, 360, 1240, 230, 14);
      ctx.fillStyle = '#16462e';
      ctx.fill();
      ctx.fillStyle = '#d8b25a';
      for (let i = 0; i < 60; i++) ctx.fillRect(W / 2 - 590 + i * 19.6, 560, 12, 26);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = '#121418';
        ctx.fillRect(W / 2 - 560 + i * 142, 395, 112, 140);
        ctx.fillStyle = '#2a2e36';
        ctx.fillRect(W / 2 - 552 + i * 142, 403, 96, 4);
      }
      ctx.restore();
      text(ctx, 'çalışma belleği', W / 2, 230, { size: 46, family: 'display', weight: 800, color: C.cream, alpha: ma * after(t, 'ram-memory', 1, 0.6) });
      const za = ma * after(t, 'ram-memory', 1, 0.8);
      if (za > 0) {
        const chipX = W / 2 - 560 + 3 * 142;
        ctx.save();
        ctx.globalAlpha *= za;
        ctx.strokeStyle = 'rgba(255,210,122,0.5)';
        ctx.lineWidth = 2;
        line(ctx, chipX, 535, 310, 680);
        line(ctx, chipX + 112, 535, 1610, 680);
        ctx.restore();
        panel(ctx, W / 2, 790, 1300, 220, za, { fill: '#070b14', stroke: '#3a4664', lw: 2, r: 10 });
        ctx.save();
        ctx.globalAlpha *= za;
        for (let r = 0; r < 18; r++) {
          for (let c = 0; c < 126; c++) {
            const i = r * 126 + c;
            const on = hash(i, Math.floor(t * 1.5 + hash(i, 1) * 5)) > 0.5;
            ctx.fillStyle = on ? 'rgba(255,165,71,0.85)' : '#1a2236';
            ctx.fillRect(W / 2 - 630 + c * 10, 700 + r * 10, 8, 8);
          }
        }
        ctx.restore();
      }
      text(ctx, '8 gigabayt: altmış milyardan fazla bit', W / 2, 300, { size: 36, family: 'mono', weight: 700, color: C.flame, alpha: ma * after(t, 'ram-memory', 3, 0.6) });
    }
    // C · elektrik kesilince
    const va = beatVis(lt, 'ram.volatile');
    if (va > 0) {
      const cut = cue('ram-volatile', 2);
      const gx0 = 380;
      const cs = 20;
      ctx.save();
      ctx.globalAlpha *= va;
      for (let c = 0; c < 64; c++) {
        const off = progress(t, cut + c * 0.012, cut + c * 0.012 + 0.25);
        for (let r = 0; r < 21; r++) {
          const on = hash(r * 64 + c, 8) > 0.5 ? 1 - off : 0;
          ctx.fillStyle = on > 0.02 ? rgba(FIRE, 0.25 + 0.65 * on * (0.85 + 0.15 * Math.sin(t * 4 + c * 0.3 + r))) : '#161d2e';
          ctx.fillRect(gx0 + c * cs, 310 + r * cs, cs - 4, cs - 4);
        }
      }
      ctx.restore();
      const pull = progress(t, cut - 0.1, cut + 0.25, ease.out);
      ctx.save();
      ctx.globalAlpha *= va;
      ctx.strokeStyle = '#3a4664';
      ctx.lineWidth = 8;
      line(ctx, 80, 520, 200 - 90 * pull, 520);
      line(ctx, 280, 520, gx0 - 6, 520);
      ctx.fillStyle = '#5a6788';
      roundRect(ctx, 180 - 90 * pull, 495, 50, 50, 8);
      ctx.fill();
      ctx.fillRect(228 - 90 * pull, 505, 24, 8);
      ctx.fillRect(228 - 90 * pull, 527, 24, 8);
      roundRect(ctx, 250, 490, 40, 60, 8);
      ctx.fill();
      ctx.restore();
      const spark = progress(t, cut, cut + 0.08) * (1 - progress(t, cut + 0.1, cut + 0.4));
      if (spark > 0) glow(ctx, 240, 520, 90, [255, 240, 200], spark * va);
      text(ctx, 'elektrik kesildi', 220, 420, { size: 30, color: C.error, alpha: va * after(t, 'ram-volatile', 2, 0.4) });
      text(ctx, 'her şeyi unutur', W / 2 + 100, 230, { size: 50, family: 'display', weight: 800, color: C.cream, alpha: va * after(t, 'ram-volatile', 2, 0.6) });
      text(ctx, 'durumu tutan: akan elektriğin kendisi', W / 2 + 100, 820, { size: 40, family: 'serif', italic: true, color: C.flame, alpha: va * after(t, 'ram-volatile', 3, 0.6) });
    }
    // D · kaydedilmeyen ödev
    const ha = beatVis(lt, 'ram.homework');
    if (ha > 0) {
      const off = cue('ram-homework', 1) + 1.2;
      const scr = 1 - progress(t, off, off + 0.3);
      drawLaptop(ctx, W / 2, 460, ha, scr, progress(lt, 21.2, 23.5, ease.linear));
      for (let i = 0; i < 32; i++) drawBulb(ctx, W / 2 + (i - 15.5) * 40, 800, 12, hash(i, 3) > 0.5 ? scr : 0, ha);
      text(ctx, 'bellekte', W / 2 - 700, 800, { size: 28, color: C.muted, align: 'right', alpha: ha });
      text(ctx, 'kaydedilmemiş ödev: yok oldu', W / 2, 900, { size: 44, family: 'display', weight: 800, color: C.error, alpha: ha * progress(t, off + 0.4, off + 1.0) });
    }
    // E · kaydet: kalıcı depo
    const sa = beatVis(lt, 'ram.save');
    if (sa > 0) {
      const c0 = cue('ram-save', 0);
      const off = cue('ram-save', 1) + 1.2;
      const scr = 1 - progress(t, off, off + 0.3);
      const saved = progress(t, c0 + 0.3, c0 + 1.8, ease.linear);
      drawLaptop(ctx, 820, 430, sa, scr, 1, saved > 0 ? 1 : 0);
      for (let i = 0; i < 24; i++) drawBulb(ctx, 820 + (i - 11.5) * 38, 770, 11, hash(i, 3) > 0.5 ? scr : 0, sa);
      text(ctx, 'bellek', 820 - 500, 770, { size: 26, color: C.muted, align: 'right', alpha: sa });
      // kalıcı depo
      const dx = 1560;
      const dy = 560;
      const done = saved >= 1 ? 1 : 0;
      panel(ctx, dx, dy, 260, 170, sa, { fill: '#1a2338', stroke: done ? C.ok : '#5a6788', lw: 3, r: 16 });
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 8; c++) {
          ctx.save();
          ctx.globalAlpha *= sa;
          ctx.fillStyle = done && hash(r * 8 + c, 3) > 0.5 ? C.ok : '#2a3550';
          ctx.fillRect(dx - 104 + c * 27, dy - 54 + r * 27, 20, 20);
          ctx.restore();
        }
      }
      text(ctx, 'kalıcı depo', dx, dy + 125, { size: 32, weight: 700, color: C.cream, alpha: sa * after(t, 'ram-save', 1, 0.5) });
      text(ctx, 'elektriksiz de durur', dx, dy + 170, { size: 28, family: 'serif', italic: true, color: C.ok, alpha: sa * progress(t, off + 0.4, off + 1.0) });
      if (saved > 0 && saved < 1) {
        for (let n = 0; n < 6; n++) {
          const p = (saved * 3 + n / 6) % 1;
          const x = lerp(1000, dx - 130, p);
          const y = lerp(760, dy, p) - Math.sin(p * Math.PI) * 80;
          glow(ctx, x, y, 22, FIRE, 0.9 * sa);
        }
      }
      text(ctx, 'Ders çıkarmak için, başka bir açıklamaya gerek yok.', W / 2, 950, { size: 42, family: 'serif', italic: true, color: C.cream, alpha: sa * after(t, 'ram-save', 2, 0.7) });
    }
  }

  // ---------------------------------------------------------------------------
  // 16 · Özet ve kapanış
  // ---------------------------------------------------------------------------

  function sceneSum(ctx, lt, t) {
    const a = beatVis(lt, 'sum.three');
    if (a <= 0) return;
    const pull = after(t, 'sum-three', 4, 1.0, ease.inOut);
    const xs = [560, 960, 1360].map((x) => lerp(x, W / 2 + (x - W / 2) * 0.82, pull));
    const y = 460;
    text(ctx, 'elektriğe öğrettiğimiz üç şey', W / 2, 200, { size: 42, family: 'serif', italic: true, color: C.cream, alpha: a * after(t, 'sum-three', 0, 0.6) * (1 - pull) });
    // 1 · toplamak
    const a1 = a * after(t, 'sum-three', 1, 0.5);
    panel(ctx, xs[0], y, 220, 180, a1, { fill: '#17213a', stroke: C.fire, lw: 3, r: 18 });
    text(ctx, '+', xs[0], y - 8, { size: 120, family: 'display', weight: 800, color: C.fire, alpha: a1 });
    text(ctx, 'toplamak', xs[0], y + 140, { size: 38, weight: 700, color: C.cream, alpha: a1 });
    // 2 · tempo tutmak
    const a2 = a * after(t, 'sum-three', 2, 0.5);
    panel(ctx, xs[1], y, 220, 180, a2, { fill: '#17213a', stroke: C.fire, lw: 3, r: 18 });
    ctx.save();
    ctx.globalAlpha *= a2;
    ctx.strokeStyle = C.fire;
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let x = -80; x <= 80; x += 2) {
      const hi = Math.floor((x + 80 + t * 80) / 40) % 2 === 0;
      const yy = y + (hi ? -30 : 30);
      if (x === -80) ctx.moveTo(xs[1] + x, yy);
      else ctx.lineTo(xs[1] + x, yy);
    }
    ctx.stroke();
    ctx.restore();
    text(ctx, 'tempo tutmak', xs[1], y + 140, { size: 38, weight: 700, color: C.cream, alpha: a2 });
    // 3 · hatırlamak
    const a3 = a * after(t, 'sum-three', 3, 0.5);
    panel(ctx, xs[2], y, 220, 180, a3, { fill: '#17213a', stroke: C.fire, lw: 3, r: 18 });
    drawGate(ctx, 'or', xs[2] - 10, y + 20, 0.45, a3, C.cream, 1);
    ctx.save();
    ctx.globalAlpha *= a3;
    ctx.strokeStyle = rgba(FIRE, 0.85);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(xs[2] + 37, y + 20);
    ctx.lineTo(xs[2] + 60, y + 20);
    ctx.lineTo(xs[2] + 60, y - 50);
    ctx.lineTo(xs[2] - 80, y - 50);
    ctx.lineTo(xs[2] - 80, y + 7);
    ctx.lineTo(xs[2] - 57, y + 7);
    ctx.stroke();
    ctx.restore();
    text(ctx, 'hatırlamak', xs[2], y + 140, { size: 38, weight: 700, color: C.cream, alpha: a3 });
    // bilgisayar
    const ca = a * pull;
    if (ca > 0) {
      panel(ctx, W / 2, y + 40, 1180 * lerp(1.2, 1, pull), 420 * lerp(1.2, 1, pull), ca, { fill: 'rgba(0,0,0,0)', stroke: C.flame, lw: 4, r: 30 });
      ctx.save();
      ctx.globalAlpha *= ca;
      ctx.fillStyle = C.flame;
      for (let i = 0; i < 24; i++) {
        ctx.fillRect(W / 2 - 560 + i * 48, y - 190, 14, 18);
        ctx.fillRect(W / 2 - 560 + i * 48, y + 262, 14, 18);
      }
      ctx.restore();
      text(ctx, 'BİLGİSAYAR', W / 2, 220, { size: 52, family: 'display', weight: 900, spacing: 10, color: C.flame, alpha: ca });
    }
    text(ctx, 'bu üçünün ustaca dizilişi', W / 2, 860, { size: 46, family: 'serif', italic: true, color: C.cream, alpha: a * after(t, 'sum-three', 5, 0.6) });
  }

  function sceneClose(ctx, lt) {
    drawStone(ctx, W / 2, 540, 1200, 560, 1, 4);
    drawTraces(ctx, lt + 3, 0, 0.01, 0.35);
    text(ctx, 'Sayılardan devreye.', W / 2, 520, { size: 92, family: 'serif', italic: true, color: C.cream, alpha: progress(lt, 0.3, 1.0), glow: 'rgba(0,0,0,0.6)', glowBlur: 20 });
    text(ctx, 'BİRİNCİ KAPI · 3. BÖLÜM · SON', W / 2, 900, { size: 22, weight: 600, spacing: 10, color: C.muted, alpha: progress(lt, 0.8, 1.3) });
  }

  // ---------------------------------------------------------------------------
  // Ses: müzik ve efektler (anlatım sonradan eklenir)
  // ---------------------------------------------------------------------------

  function score(m, hz) {
    const { at, span } = TL;
    const untilEnd = (id, a, margin) => TL.scene(id).end - margin - at(id, a);
    const dur = (from, to) => Math.max(0.1, to - from);
    const scenePad = (id, notes, opts = {}) => m.pad(at(id, 0), untilEnd(id, 0, 0.4), notes, { gain: 0.25, attack: 1.6, release: 2.6, ...opts });
    const ding = (tm, note, g = 0.1, pan = 0, decay = 2.4) => m.bell(tm, { freq: hz(note), gain: g, decay, pan });
    const pops = (list) => list.forEach(([tm, note, pan = 0, g = 0.08]) => m.pop(tm, { freq: hz(note), gain: g, pan }));

    // 0 · Açılış: sayan lambalar, başlık
    m.pad(0, 7.4, ['D2', 'A2', 'D3'], { gain: 0.3, attack: 3, release: 2.5, cutoff: 600 });
    for (let k = 0; k < 40; k++) {
      const p = Math.cbrt(k / 40);
      m.tick(at('open', lerp(0.5, 3.1, p)), { gain: 0.035, pan: Math.sin(k) * 0.5, tone: 3600 + k * 40 });
    }
    m.riser(at('open', 1.4), span('open', 1.4, 3.3), { gain: 0.07 });
    m.boom(at('open', 3.3), { gain: 0.42 });
    ding(at('open', 3.6), 'D5', 0.2, 0, 3);
    ding(at('open', 3.9), 'A5', 0.1, 0, 2.5);
    ding(at('open', 4.6), 'F5', 0.07, 0.2, 2.5);

    // 1 · Kapılar → toplama
    scenePad('recap', ['F2', 'C3', 'A3', 'E4']);
    pops([1, 2, 3, 4].map((k, i) => [cue('recap-gates', k), ['D5', 'F5', 'A4', 'C5'][i], (i - 1.5) * 0.4]));
    const rt = cue('recap-task', 2);
    m.whoosh(rt - 0.2, { dur: 1.0, from: 2400, to: 400, gain: 0.07 });
    m.boom(rt + 0.5, { gain: 0.25, freq: 60 });
    ding(rt + 0.55, 'D5', 0.14, 0, 3);
    ding(rt + 0.58, 'A5', 0.07, 0, 3);

    // 2 · Saymak: tekerlekler
    scenePad('count', ['D3', 'A3', 'E4', 'F4']);
    const cd = (i) => cue('count-decimal', i);
    for (let j = 0; j < 9; j++) m.click(cd(3) + j * 0.2 + 0.08, { gain: 0.08, tone: 2400 + j * 120, pan: 0.15 });
    m.blip(cd(4), { freq: 300, dur: 0.25, slide: 0.6, type: 'triangle', gain: 0.04, pan: 0.5 });
    m.click(cd(5) + 0.1, { gain: 0.12, tone: 2000, pan: 0.15 });
    m.click(cd(6) + 0.1, { gain: 0.12, tone: 3000, pan: -0.15 });
    ding(cd(7) + 0.1, 'A5', 0.1, 0.3);
    const cb = (i) => cue('count-binary', i);
    for (const [tm, pan] of [[cb(1), 0.2], [cb(3), 0.2], [cb(4), 0], [cb(8), 0.2], [cb(10), 0.2], [cb(10) + 0.25, 0], [cb(10) + 0.5, -0.2]]) m.click(tm + 0.1, { gain: 0.11, tone: 2800, pan });
    [[7, 'E5'], [9, 'G5'], [11, 'C6']].forEach(([k, n]) => ding(cb(k) + 0.1, n, 0.08, 0.3, 2));
    m.blip(cb(2), { freq: 300, dur: 0.25, slide: 0.6, type: 'triangle', gain: 0.04, pan: 0 });

    // 3 · Yarım toplayıcı
    scenePad('add', ['Bb2', 'F3', 'A3', 'D4']);
    [2, 3, 4, 5, 6, 7, 8, 9].forEach((k, i) => m.pop(cue('add-cases', k), { freq: hz(['C5', 'C5', 'D5', 'E5', 'D5', 'E5', 'F5', 'A5'][i]), gain: i % 2 ? 0.08 : 0.05, pan: -0.4 }));
    m.whoosh(cue('add-carry', 1) - 0.1, { dur: 0.6, from: 500, to: 1800, gain: 0.05, panFrom: 0.1, panTo: 0.3 });
    m.whoosh(cue('add-carry', 2) - 0.1, { dur: 0.6, from: 500, to: 1800, gain: 0.05, panFrom: 0.3, panTo: 0.6 });
    m.pop(cue('add-carry', 3), { freq: hz('F5'), gain: 0.09, pan: 0.4 });
    m.blip(cue('add-carry', 4), { freq: hz('A5'), dur: 0.2, type: 'triangle', gain: 0.07, pan: 0.4 });
    ding(cue('add-carry', 6) + 0.1, 'D5', 0.09, 0.3);
    m.whoosh(cue('add-table', 0) - 0.1, { dur: 0.6, from: 400, to: 1600, gain: 0.05, panFrom: -0.4, panTo: -0.2 });
    [1, 3, 4].forEach((k, i) => {
      for (let r = 0; r < 4; r++) m.tick(cue('add-table', k) + r * 0.07, { gain: 0.04, pan: -0.4 + i * 0.15 });
    });
    ding(cue('add-recognize', 2) + 0.2, 'F5', 0.1, 0.2);
    ding(cue('add-recognize', 4) + 0.2, 'A5', 0.1, 0.5);
    m.pop(cue('add-half', 0), { freq: hz('D5'), gain: 0.08 });
    m.pop(cue('add-half', 0) + 0.4, { freq: hz('F5'), gain: 0.08 });
    m.whoosh(cue('add-half', 1), { dur: 1.2, from: 300, to: 1400, gain: 0.05, panFrom: -0.5, panTo: 0.4 });
    ding(cue('add-half', 2) + 0.2, 'D5', 0.12, 0, 3);
    m.click(cue('add-demo', 1), { gain: 0.15, pan: -0.5 });
    ding(cue('add-demo', 1) + 0.1, 'E6', 0.06, 0.3, 1.4);
    m.click(cue('add-demo', 2), { gain: 0.15, pan: -0.5, tone: 2600 });
    m.blip(cue('add-demo', 2) + 0.08, { freq: 240, dur: 0.2, slide: 0.6, type: 'triangle', gain: 0.05, pan: 0.3 });
    ding(cue('add-demo', 2) + 0.12, 'A5', 0.08, 0.3, 1.8);
    ding(cue('add-demo', 7) + 0.15, 'D5', 0.12, 0.5, 3);
    ding(cue('add-demo', 7) + 0.18, 'A5', 0.06, 0.5, 3);

    // 4 · Tam toplayıcı
    scenePad('full', ['G2', 'D3', 'Bb3', 'F4']);
    m.pop(cue('full-why', 0) + 0.1, { freq: hz('G4'), gain: 0.08 });
    m.blip(cue('full-why', 3), { freq: hz('D5'), dur: 0.18, type: 'triangle', gain: 0.06 });
    m.blip(cue('full-why', 5), { freq: hz('A5'), dur: 0.2, type: 'triangle', gain: 0.06, pan: 0.2 });
    pops([[cue('full-example', 1), 'G4'], [cue('full-example', 2), 'Bb4'], [cue('full-example', 4), 'D5', 0.2], [cue('full-example', 9), 'D5', 0]]);
    for (const k of [5, 10]) m.whoosh(cue('full-example', k), { dur: 0.7, from: 600, to: 2200, gain: 0.05, panFrom: 0.2, panTo: -0.1 });
    m.pop(cue('full-example', 12) + 0.3, { freq: hz('G5'), gain: 0.09, pan: -0.2 });
    ding(cue('full-example', 13) + 0.1, 'G5', 0.1, 0.3);
    m.pop(cue('full-build', 1), { freq: hz('D5'), gain: 0.08, pan: -0.3 });
    m.pop(cue('full-build', 1) + 0.4, { freq: hz('F5'), gain: 0.08, pan: 0.1 });
    m.pop(cue('full-build', 2), { freq: hz('A5'), gain: 0.08, pan: 0.4 });
    m.whoosh(cue('full-build', 2), { dur: 1.2, from: 300, to: 1500, gain: 0.05, panFrom: -0.6, panTo: 0.6 });
    ding(cue('full-build', 3) + 0.2, 'D5', 0.12, 0, 3);
    [0, 0.3, 0.6].forEach((d, i) => m.click(cue('full-build', 4) + d, { gain: 0.12, tone: 2600 + i * 300, pan: -0.6 }));
    ding(cue('full-build', 4) + 0.75, 'F5', 0.08, 0.6, 2);
    ding(cue('full-build', 5) + 0.1, 'A5', 0.1, 0.6, 2.6);

    // 5 · Zincir
    scenePad('chain', ['D3', 'F3', 'A3', 'C4']);
    for (let i = 0; i < 8; i++) m.tick(at('chain', 0.5 + i * 0.12), { gain: 0.04, pan: lerp(0.7, -0.7, i / 7) });
    m.whoosh(cue('chain-eight', 1), { dur: 0.9, from: 600, to: 1800, gain: 0.05, panFrom: 0.6, panTo: -0.6 });
    for (let i = 0; i < 16; i++) m.tick(cue('chain-demo', 0) + i * 0.03, { gain: 0.03, pan: lerp(-0.6, 0.6, (i % 8) / 7) });
    const RT = rippleTimes();
    ['D5', 'E5', 'F5', 'G5', 'A5', 'Bb5', 'C6', 'D6'].forEach((n, i) => {
      m.click(RT.at(i), { gain: 0.08, tone: 2600, pan: lerp(0.7, -0.7, i / 7) });
      m.blip(RT.at(i) + 0.05, { freq: hz(n), dur: 0.12, type: 'triangle', gain: 0.06, pan: lerp(0.7, -0.7, i / 7) });
    });
    ding(cue('chain-demo', 5) + 0.1, 'D5', 0.14, 0, 3);
    ding(cue('chain-demo', 5) + 0.13, 'A5', 0.07, 0, 3);
    for (let i = 0; i < 32; i++) m.tick(at('chain', 12.3 + (31 - i) * 0.03), { gain: 0.025, pan: lerp(0.8, -0.8, (31 - i) / 31) });
    m.whoosh(cue('chain-32', 1), { dur: 1.0, from: 400, to: 3000, gain: 0.05 });
    for (let i = 0; i < 32; i++) m.blip(cue('chain-32', 2) + 0.2 + i * 0.04, { freq: 440 * Math.pow(2, i / 16), dur: 0.05, type: 'square', gain: 0.02, pan: lerp(0.8, -0.8, i / 31) });
    ding(cue('chain-32', 3) + 0.1, 'F5', 0.1, 0, 2.6);

    // 6 · Anlam
    scenePad('mean', ['Bb2', 'F3', 'D4', 'A4'], { gain: 0.24, cutoff: 800 });
    m.boom(cue('mean-quote', 3), { gain: 0.22, freq: 60 });
    ding(cue('mean-quote', 3) + 0.05, 'D5', 0.12, 0, 3.5);
    m.whoosh(cue('mean-quote', 4), { dur: 1.2, from: 300, to: 1600, gain: 0.05, panFrom: -0.6, panTo: 0.6 });
    ding(cue('mean-quote', 4) + 0.6, 'A5', 0.1, 0, 3.5);
    m.whoosh(cue('mean-nomind', 0), { dur: 0.9, from: 900, to: 300, gain: 0.07, panFrom: -0.1, panTo: 0.1, q: 0.8 });
    m.buzz(cue('mean-nomind', 1) + 0.2, { gain: 0.05, dur: 0.3 });
    m.click(cue('mean-nomind', 3), { gain: 0.14, pan: -0.5 });
    m.blip(cue('mean-nomind', 4) + 0.1, { freq: hz('A5'), dur: 0.25, type: 'triangle', gain: 0.07, pan: 0.2 });
    pops([[cue('mean-reader', 3), 'D5', -0.6, 0.09], [cue('mean-reader', 4), 'A5', 0.6, 0.09]]);
    for (let j = 0; j < 6; j++) m.tick(cue('mean-reader', 5) + j * (Math.PI / 6), { gain: 0.05, tone: 2600 });

    // 7 · Geri kalan her şey
    scenePad('rest', ['G2', 'D3', 'G3', 'Bb3']);
    pops([0, 1, 2, 3].map((k, i) => [cue('rest-question', k), ['G4', 'Bb4', 'D5', 'F5'][i], (i - 1.5) * 0.4, 0.09]));
    m.whoosh(cue('rest-question', 5), { dur: 1.0, from: 3000, to: 400, gain: 0.08 });
    m.boom(cue('rest-question', 5) + 0.9, { gain: 0.3, freq: 55 });
    ding(cue('rest-question', 5) + 0.95, 'G5', 0.14, 0, 3);
    ding(cue('rest-question', 5) + 0.98, 'D6', 0.07, 0, 3);

    // 8 · Çıkarma
    scenePad('sub', ['C3', 'G3', 'Eb4', 'Bb4'], { gain: 0.24 });
    m.whoosh(cue('sub-idea', 3) - 0.1, { dur: 0.6, from: 500, to: 1800, gain: 0.05 });
    ding(cue('sub-idea', 3) + 0.4, 'G5', 0.08);
    const so = (i) => cue('sub-odometer', i);
    [0, 0.15, 0.3].forEach((d) => m.click(so(2) + d + 0.2, { gain: 0.12, tone: 1800 }));
    m.blip(so(3), { freq: hz('Eb5'), dur: 0.25, type: 'triangle', gain: 0.06 });
    const st = (i) => cue('sub-trick', i);
    m.click(st(0) + 0.2, { gain: 0.1, tone: 1800, pan: -0.4 });
    m.click(st(0) + 0.7, { gain: 0.1, tone: 1800, pan: -0.4 });
    m.typeKey(st(2), { gain: 0.08, pan: 0.4 });
    m.typeKey(st(2) + 0.12, { gain: 0.08, pan: 0.4 });
    [0, 0.15, 0.3].forEach((d) => m.click(st(3) + d + 0.2, { gain: 0.1, tone: 2600, pan: -0.4 }));
    m.pop(st(3), { freq: hz('G5'), gain: 0.08, pan: 0.4 });
    m.whoosh(st(5), { dur: 1.0, from: 2000, to: 200, gain: 0.07, panFrom: 0.2, panTo: 0.3 });
    m.boom(st(5) + 0.95, { gain: 0.15, freq: 90 });
    ding(st(6) + 0.1, 'C6', 0.08, 0.4, 2);
    ding(st(8) + 0.1, 'G5', 0.12, 0.3, 3);
    ding(st(9) + 0.2, 'C6', 0.06, 0.3, 2.5);
    const sb = (i) => cue('sub-binary', i);
    for (const k of [2, 3, 4]) for (let j = 0; j < 8; j++) m.typeKey(sb(k) + j * 0.05, { gain: 0.05, pan: -0.4 });
    for (let j = 0; j < 16; j++) m.typeKey(sb(5) + j * 0.04, { gain: 0.04, pan: 0.5 });
    m.whoosh(sb(5) + 1.4, { dur: 1.0, from: 2000, to: 200, gain: 0.06, panFrom: 0.4, panTo: 0.5 });
    ding(sb(6) + 0.2, 'Eb5', 0.1, 0, 2.6);
    ding(sb(7) + 0.2, 'Bb5', 0.1, 0, 3);

    // 9 · Çarpma
    scenePad('mul', ['F2', 'C3', 'A3', 'E4']);
    const mr3 = cue('mul-repeat', 3);
    for (let g = 0; g < 4; g++) m.pop(mr3 + g * 0.35, { freq: hz(['C5', 'E5', 'G5', 'C6'][g]), gain: 0.08, pan: (g - 1.5) * 0.4 });
    ding(mr3 + 1.7, 'A5', 0.1, 0, 2.5);
    m.whoosh(cue('mul-shift', 1), { dur: 0.8, from: 2400, to: 600, gain: 0.06, panFrom: 0.4, panTo: -0.2 });
    m.whoosh(cue('mul-shift', 3), { dur: 0.8, from: 2400, to: 600, gain: 0.06, panFrom: 0.4, panTo: -0.2 });
    m.pop(cue('mul-shift', 2), { freq: hz('F5'), gain: 0.07 });
    m.pop(cue('mul-shift', 4), { freq: hz('A5'), gain: 0.07 });
    ding(cue('mul-shift', 5) + 0.1, 'C5', 0.1, 0, 2.6);
    const me2 = cue('mul-example', 2);
    m.whoosh(me2 + 0.3, { dur: 0.6, from: 2400, to: 600, gain: 0.05, panFrom: -0.2, panTo: -0.5 });
    m.whoosh(me2 + 1.1, { dur: 0.6, from: 2400, to: 600, gain: 0.05, panFrom: -0.2, panTo: -0.5 });
    ding(cue('mul-example', 4) + 0.1, 'A5', 0.09, -0.4);
    ding(cue('mul-example', 6) + 0.1, 'E6', 0.06, -0.4, 2);
    for (let j = 0; j < 9; j++) m.typeKey(cue('mul-example', 9) + j * 0.05, { gain: 0.05, pan: 0.5 });
    m.pop(cue('mul-example', 11), { freq: hz('E5'), gain: 0.08, pan: 0.5 });
    ding(cue('mul-example', 12) + 0.1, 'C6', 0.1, 0.5, 2.6);
    const mf1 = cue('mul-fast', 1);
    for (let i = 0; i < 4; i++) m.click(mf1 + i * 0.25, { gain: 0.07, tone: 3200 });
    ding(mf1 + 1.4, 'F5', 0.1, 0.3);
    m.whoosh(cue('mul-fast', 2), { dur: 0.4, from: 3000, to: 8000, gain: 0.04 });

    // 10 · Bölme ve kök
    scenePad('div', ['D3', 'A3', 'D4', 'F4']);
    for (let j = 0; j < 5; j++) {
      const tm = cue('div-repeat', 4 + j);
      m.whoosh(tm, { dur: 0.6, from: 1600, to: 500, gain: 0.04, panFrom: 0.5, panTo: (j - 2) * 0.3 });
      m.pop(tm + 0.6, { freq: hz(['A4', 'G4', 'F4', 'E4', 'D4'][j]), gain: 0.08, pan: (j - 2) * 0.3 });
    }
    ding(cue('div-repeat', 9) + 0.1, 'D5', 0.08);
    ding(cue('div-repeat', 11) + 0.1, 'A5', 0.12, 0, 3);
    pops([0, 1, 2].map((k, i) => [cue('root-intro', k), ['D5', 'F5', 'A5'][i], (i - 1) * 0.5]));
    m.hum(cue('root-intro', 4), dur(cue('root-intro', 4), at('div', 14.0)), { gain: 0.03 });
    [[3, 'C5'], [6, 'E5'], [7, 'Bb5'], [9, 'D5']].forEach(([k, n]) => m.blip(cue('root-example', k), { freq: hz(n), dur: 0.2, type: 'triangle', gain: 0.06, pan: 0.2 }));
    ding(cue('root-example', 9) + 0.15, 'A5', 0.1, 0.2, 2.6);
    for (let i = 0; i < 8; i++) m.tick(cue('root-example', 10) + i * 0.35, { gain: 0.04, tone: 3000 + i * 150, pan: 0.5 });

    // 11 · Her şey toplamadır
    scenePad('all', ['Bb2', 'F3', 'C4', 'D4'], { gain: 0.24 });
    pops([1, 2, 3, 4, 5].map((k, i) => [cue('all-list', k), ['Bb4', 'C5', 'D5', 'F5', 'G5'][i], (i - 2) * 0.35]));
    const rain0 = cue('all-list', 6);
    for (let j = 0; j < 24; j++) m.tick(rain0 + j * 0.13 + hash(j, 4) * 0.06, { gain: 0.03, tone: 3400 + 800 * hash(j, 5), pan: (hash(j, 6) - 0.5) * 1.2 });
    m.boom(cue('all-list', 8), { gain: 0.2, freq: 60 });
    ding(cue('all-list', 8) + 0.05, 'F5', 0.1, 0, 3);
    m.whoosh(cue('all-pixels', 2), { dur: 1.2, from: 400, to: 3000, gain: 0.05, panFrom: -0.6, panTo: -0.4 });
    [3, 4, 5].forEach((k, i) => m.pop(cue('all-pixels', k), { freq: hz(['D5', 'F5', 'A5'][i]), gain: 0.07, pan: 0.5 }));
    m.riser(cue('all-pixels', 6), 1.0, { gain: 0.05 });
    ding(cue('all-pixels', 7) + 0.1, 'Bb5', 0.12, 0.5, 3);
    const dc2 = cue('all-dome', 2);
    DOME.forEach((st2, i) => m.hoof(dc2 + i * 0.07 + 0.9, { gain: 0.07, pan: lerp(-0.6, 0.4, i / DOME.length) }));
    m.boom(dc2 + DOME.length * 0.07 + 1.0, { gain: 0.25, freq: 55 });
    ding(cue('all-dome', 4) + 0.1, 'D5', 0.12, 0.3, 3.5);
    ding(cue('all-dome', 4) + 0.13, 'A5', 0.06, 0.3, 3.5);

    // 12 · Saat
    scenePad('clock', ['A2', 'E3', 'C4', 'G4'], { gain: 0.22, cutoff: 800 });
    const cp = cue('clock-problem', 1);
    m.hum(cp, dur(cp, at('clock', 5.0)), { gain: 0.04 });
    m.staticNoise(cp, dur(cp, at('clock', 5.0)), { gain: 0.015 });
    m.blip(cue('clock-problem', 3), { freq: hz('E5'), dur: 0.3, slide: 1.2, type: 'triangle', gain: 0.05 });
    const dl1 = cue('clock-delay', 1);
    m.click(dl1, { gain: 0.15, pan: -0.6 });
    m.buzz(dl1 + 0.1, { gain: 0.03, dur: 0.7 });
    ding(dl1 + 0.9, 'E6', 0.06, -0.3, 1.4);
    const RS = rippleShow();
    for (let i = 0; i < 8; i++) {
      const tm = RS.c5 + i * RS.step;
      m.blip(tm, { freq: i < 7 ? 300 + 140 * hash(i, 2) : hz('A5'), dur: 0.1, type: 'square', gain: 0.03, pan: 0.5 });
    }
    ding(RS.c5 + 8 * RS.step + 0.05, 'A5', 0.1, 0.5, 2.5);
    const oc5 = cue('clock-orchestra', 5);
    const o0 = cue('clock-orchestra', 0);
    for (let n = 0; o0 + n * 0.17 < oc5; n++) {
      const tm = o0 + n * 0.17 + hash(n, 7) * 0.12;
      m.blip(tm, { freq: hz(['C5', 'D5', 'E5', 'G5', 'A5', 'B4'][Math.floor(hash(n, 8) * 6)]) * (hash(n, 9) > 0.5 ? 1.03 : 0.97), dur: 0.12, type: 'triangle', gain: 0.03, pan: (hash(n, 10) - 0.5) * 1.4 });
    }
    for (let b = 0; oc5 + 0.4 + b * 0.8 < at('clock', 19.0); b++) {
      const tm = oc5 + 0.4 + b * 0.8;
      m.tick(tm, { gain: 0.06, tone: 2400 });
      ['A4', 'C5', 'E5'].forEach((n, i) => m.blip(tm + 0.01, { freq: hz(n), dur: 0.18, type: 'triangle', gain: 0.03, pan: (i - 1) * 0.5 }));
    }
    const cr0 = cue('clock-crystal', 0);
    m.blip(cr0, { freq: 3200, dur: 0.6, type: 'sine', gain: 0.012, pan: -0.6 });
    for (let k = 0; cr0 + k * 1.4 < at('clock', 27.0); k++) {
      m.tick(cr0 + k * 1.4, { gain: 0.07, tone: 4200, pan: -0.3 });
      m.click(cr0 + k * 1.4 + 0.5, { gain: 0.04, tone: 3000, pan: 0.5 });
    }
    [3, 4, 5, 6].forEach((k, i) => m.pop(cue('clock-crystal', k), { freq: hz(['A4', 'C5', 'E5', 'G5'][i]), gain: 0.07, pan: (i - 1.5) * 0.3 }));
    m.whoosh(at('clock', 27.2), { dur: 1.6, from: 400, to: 1800, gain: 0.04, panFrom: -0.6, panTo: 0.6 });
    ding(cue('clock-settle', 3) + 0.1, 'E5', 0.1, 0, 2.6);
    m.riser(cue('clock-ghz', 0) - 0.6, 0.8, { gain: 0.06 });
    m.boom(cue('clock-ghz', 0) + 0.2, { gain: 0.2, freq: 60 });
    m.projector(cue('clock-ghz', 3), dur(cue('clock-ghz', 3), at('clock', 37.0)), { gain: 0.012, rate: 40 });
    for (let j = 0; j < 8; j++) m.click(cue('clock-ghz', 4) + j * 0.1, { gain: 0.05, tone: 4000 });
    for (let k = 0; at('clock', 37.1) + k * 1.5 < at('clock', 40.0); k++) {
      const tm = TL.scene('clock').start + Math.ceil((at('clock', 37.1) - TL.scene('clock').start) / 1.5 + k) * 1.5;
      m.whoosh(tm, { dur: 1.1, from: 2000, to: 7000, gain: 0.025, panFrom: -0.5, panTo: 0.5, q: 2 });
    }
    ding(cue('clock-light', 2) + 0.1, 'G5', 0.1, 0.3, 2.6);

    // 13 · Yanılgı
    scenePad('myth', ['D3', 'F3', 'A3', 'E4'], { gain: 0.24 });
    pops([[cue('myth-intro', 2), 'D5', -0.4], [cue('myth-intro', 3), 'A5', 0.4]]);
    m.buzz(cue('myth-intro', 3) + 0.5, { gain: 0.06, dur: 0.35 });
    for (const [k, P, pan, tone] of [[0, 0.5, -0.4, 3600], [2, 0.667, 0.4, 2600]]) {
      const s0 = cue('myth-work', k) + 0.5;
      for (let n = 1; s0 + n * P < at('myth', 12.0); n++) m.tick(s0 + n * P, { gain: 0.06, tone, pan });
    }
    m.whoosh(cue('myth-example', 1), { dur: 1.0, from: 300, to: 1200, gain: 0.05, panFrom: -0.6, panTo: -0.2 });
    m.whoosh(cue('myth-example', 3), { dur: 1.0, from: 300, to: 2400, gain: 0.06, panFrom: -0.6, panTo: 0.6 });
    ding(cue('myth-example', 5) + 0.1, 'A5', 0.12, 0, 3);
    m.whoosh(cue('myth-end', 2), { dur: 1.0, from: 300, to: 1200, gain: 0.06, q: 0.8 });
    ding(cue('myth-end', 2) + 0.4, 'D5', 0.12, 0, 3.5);
    ding(cue('myth-end', 2) + 0.43, 'F5', 0.06, 0, 3.5);

    // 14 · Hatırlamak
    scenePad('mem', ['F2', 'C3', 'A3', 'D4'], { gain: 0.24 });
    m.glitch(cue('mem-question', 2), 0.6, { gain: 0.06 });
    const MT = memTimes();
    m.click(MT.f3, { gain: 0.15, pan: -0.6 });
    m.click(MT.f4, { gain: 0.1, pan: -0.6, tone: 2000 });
    for (let tm = MT.f3 + 0.05; tm < MT.f4; tm += 0.5) ding(tm, 'E5', 0.08, 0.5, 0.6);
    m.whoosh(cue('mem-loop', 1), { dur: 1.4, from: 300, to: 1600, gain: 0.06, panFrom: 0.4, panTo: -0.4 });
    m.click(MT.h2, { gain: 0.15, pan: -0.6 });
    m.click(MT.h2 + 0.8, { gain: 0.1, pan: -0.6, tone: 2000 });
    ding(MT.h2 + 0.1, 'A5', 0.08, 0.3, 2);
    m.hum(MT.h2 + 0.3, dur(MT.h2 + 0.3, MT.r1), { gain: 0.035 });
    ding(cue('mem-hold', 5) + 0.2, 'D6', 0.07, 0.3, 2.5);
    m.pop(cue('mem-reset', 0), { freq: hz('C5'), gain: 0.07 });
    m.click(MT.r1, { gain: 0.15, tone: 1800 });
    m.blip(MT.r1 + 0.25, { freq: 260, dur: 0.3, slide: 0.5, type: 'triangle', gain: 0.06, pan: 0.3 });
    m.click(MT.r3, { gain: 0.1, tone: 2400 });
    ding(cue('mem-reset', 4) + 0.2, 'F5', 0.08);
    pops([[cue('mem-bit', 0), 'A4'], [cue('mem-bit', 2), 'D5']]);
    const mb4 = cue('mem-bit', 4);
    m.click(mb4 - 0.2, { gain: 0.12, pan: -0.5 });
    ding(mb4 - 0.15, 'E5', 0.09, -0.4, 0.6);
    ding(mb4 + 0.35, 'C5', 0.09, -0.4, 0.6);
    m.click(cue('mem-bit', 5), { gain: 0.14, pan: 0.5, tone: 2600 });
    ding(cue('mem-bit', 5) + 0.1, 'A5', 0.1, 0.5, 3);

    // 15 · Bellek
    scenePad('ram', ['D3', 'A3', 'C4', 'F4'], { gain: 0.24 });
    for (let i = 0; i < 8; i++) m.tick(cue('ram-register', 0) + i * 0.05, { gain: 0.04, pan: lerp(-0.6, 0.6, i / 7) });
    m.whoosh(cue('ram-register', 2), { dur: 0.9, from: 300, to: 1400, gain: 0.06 });
    ding(cue('ram-register', 5) + 0.1, 'F5', 0.08);
    m.whoosh(cue('ram-memory', 0), { dur: 0.8, from: 400, to: 1800, gain: 0.05 });
    m.projector(cue('ram-memory', 1), dur(cue('ram-memory', 1), at('ram', 15.0)), { gain: 0.01, rate: 12 });
    ding(cue('ram-memory', 3) + 0.1, 'A5', 0.09);
    const cut = cue('ram-volatile', 2);
    m.hum(at('ram', 15.2), dur(at('ram', 15.2), cut), { gain: 0.04 });
    m.click(cut - 0.05, { gain: 0.18, tone: 1500, pan: -0.7 });
    m.glitch(cut, 0.2, { gain: 0.08 });
    m.blip(cut + 0.05, { freq: 600, dur: 0.9, slide: 0.15, type: 'sawtooth', gain: 0.05 });
    m.boom(cut + 0.1, { gain: 0.18, freq: 70 });
    ding(cue('ram-volatile', 3) + 0.2, 'D5', 0.08, 0, 3);
    for (let tm = at('ram', 21.3); tm < at('ram', 23.5); tm += 0.13) m.typeKey(tm + hash(Math.round(tm * 100), 3) * 0.04, { gain: 0.06, pan: (hash(Math.round(tm * 10), 2) - 0.5) * 0.4 });
    const hoff = cue('ram-homework', 1) + 1.2;
    m.blip(hoff, { freq: 600, dur: 0.6, slide: 0.2, type: 'sawtooth', gain: 0.05 });
    m.boom(hoff + 0.05, { gain: 0.15, freq: 70 });
    m.blip(hoff + 0.5, { freq: hz('D4'), dur: 0.5, slide: 0.7, type: 'triangle', gain: 0.05 });
    const sc0 = cue('ram-save', 0);
    m.click(sc0, { gain: 0.14, pan: 0.2 });
    m.whoosh(sc0 + 0.3, { dur: 1.5, from: 500, to: 2500, gain: 0.05, panFrom: -0.2, panTo: 0.7 });
    ding(sc0 + 1.85, 'A5', 0.1, 0.7, 2.4);
    const soff = cue('ram-save', 1) + 1.2;
    m.blip(soff, { freq: 600, dur: 0.6, slide: 0.2, type: 'sawtooth', gain: 0.045 });
    ding(soff + 0.5, 'E6', 0.06, 0.7, 2);
    ding(cue('ram-save', 2) + 0.3, 'D5', 0.1, 0, 3.5);

    // 16 · Özet ve kapanış
    scenePad('sum', ['Bb2', 'F3', 'A3', 'D4'], { gain: 0.28, attack: 2 });
    pops([1, 2, 3].map((k, i) => [cue('sum-three', k), ['D5', 'F5', 'A5'][i], (i - 1) * 0.5, 0.09]));
    m.riser(cue('sum-three', 4) - 0.6, 1.4, { gain: 0.07 });
    m.boom(cue('sum-three', 4) + 0.8, { gain: 0.3 });
    ding(cue('sum-three', 4) + 0.85, 'D5', 0.14, 0, 3.5);
    ding(cue('sum-three', 5) + 0.2, 'A5', 0.1, 0, 3.5);
    m.pad(at('close', 0), untilEnd('close', 0, 0.2), ['D2', 'A2', 'D3', 'F3'], { gain: 0.26, attack: 1, release: 1.4, cutoff: 600 });
    m.boom(at('close', 0.3), { gain: 0.3 });
    ding(at('close', 0.3), 'D5', 0.16, 0, 2.5);
    ding(at('close', 0.32), 'F5', 0.08, 0, 2.5);
  }

  window.FILM = E.film({
    title: 'Sayılardan Devreye — Birinci Kapı, 3. Bölüm',
    timeline: TL,
    background,
    score,
    narration: VOICE,
    voice: VOICE.voice,
  });
})();
