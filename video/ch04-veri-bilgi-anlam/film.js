/*
 * Birinci Kapı, 4. bölüm — Veri, Bilgi, Anlam: Üç Basamaklı Merdiven
 * Aynı sayının üç dünyası; veri, bilgi ve anlam basamakları; makinenin ve insanın payı;
 * veriyi kimin konuşturduğu; verinin türleri; düzenli ve düzensiz veri.
 *
 * Sahneler koreografi zamanıyla çizilir; anlatılan öğeler cue('satır', öbek) ile anlatıcının
 * söylediği anda belirir.
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
    { id: 'recap', base: 16, title: 'Buraya kadar', draw: sceneRecap },
    { id: 'thermo', base: 36, title: 'Aynı sayı, üç dünya', draw: sceneThermo },
    { id: 'data', base: 40, title: 'Basamak bir: veri', draw: sceneData },
    { id: 'info', base: 46, title: 'Basamak iki: bilgi', draw: sceneInfo },
    { id: 'judge', base: 30, title: 'Basamak üç: anlam ve karar', draw: sceneJudge },
    { id: 'ladder', base: 34, title: 'Makine ve insan', draw: sceneLadder },
    { id: 'motto', base: 10, title: 'Usta sözü', draw: sceneMotto },
    { id: 'hidden', base: 16, title: 'Gizli yorumlar', draw: sceneHidden },
    { id: 'survey', base: 22, title: 'Toplanan ve ölçülmeyen', draw: sceneSurvey },
    { id: 'charts', base: 24, title: 'Zaman aralığı ve eksen', draw: sceneCharts },
    { id: 'speak', base: 12, title: 'Veriyi kim konuşturur', draw: sceneSpeak },
    { id: 'kind', base: 34, title: '5 ile “5”', draw: sceneKind },
    { id: 'types', base: 42, title: 'Temel türler', draw: sceneTypes },
    { id: 'phone', base: 30, title: 'Baştaki sıfır', draw: scenePhone },
    { id: 'struct', base: 26, title: 'Düzenli veri', draw: sceneStruct },
    { id: 'messy', base: 18, title: 'Düzensiz veri', draw: sceneMessy },
    { id: 'ask', base: 12, title: 'Aynı soru, iki veri', draw: sceneAsk },
    { id: 'iceberg', base: 18, title: 'Buzdağı', draw: sceneIceberg },
    { id: 'sum', base: 14, title: 'Özet', draw: sceneSum },
    { id: 'close', base: 5, title: 'Kapanış', draw: sceneClose, fadeOut: 1.4 },
  ];

  // Seslendirme vuruşları: [sahne, başlangıç, bitiş, donma anı] (koreografi zamanı).
  const BEATS = {
    'open.title': ['open', 3.3, 7.6, 7.0],
    'recap.path': ['recap', 0.3, 6.0, 5.3],
    'recap.step': ['recap', 6.1, 11.0, 10.3],
    'recap.question': ['recap', 11.1, 16.0, 15.3],
    'thermo.alone': ['thermo', 0.3, 6.0, 5.3],
    'thermo.room': ['thermo', 6.1, 11.0, 10.3],
    'thermo.child': ['thermo', 11.1, 16.0, 15.3],
    'thermo.oven': ['thermo', 16.1, 22.0, 21.3],
    'thermo.three': ['thermo', 22.1, 27.0, 26.3],
    'thermo.rule': ['thermo', 27.1, 36.0, 35.3],
    'data.def': ['data', 0.3, 6.0, 5.3],
    'data.examples': ['data', 6.1, 14.0, 13.3],
    'data.source': ['data', 14.1, 24.0, 23.3],
    'data.innocent': ['data', 24.1, 31.0, 30.3],
    'data.broken': ['data', 31.1, 40.0, 39.3],
    'info.def': ['info', 0.3, 5.0, 4.3],
    'info.context': ['info', 5.1, 19.0, 18.3],
    'info.questions': ['info', 19.1, 30.0, 29.3],
    'info.sentence': ['info', 30.1, 36.0, 35.3],
    'info.compare': ['info', 36.1, 46.0, 45.3],
    'judge.def': ['judge', 0.3, 7.0, 6.3],
    'judge.days': ['judge', 7.1, 20.0, 19.3],
    'judge.verdict': ['judge', 20.1, 30.0, 29.3],
    'ladder.three': ['ladder', 0.3, 9.0, 8.3],
    'ladder.machine': ['ladder', 9.1, 17.0, 16.3],
    'ladder.help': ['ladder', 17.1, 26.0, 25.3],
    'ladder.gray': ['ladder', 26.1, 34.0, 33.3],
    'motto.say': ['motto', 0.3, 10.0, 9.3],
    'hidden.report': ['hidden', 0.3, 7.0, 6.3],
    'hidden.four': ['hidden', 7.1, 16.0, 15.3],
    'hidden.survey': ['survey', 0.3, 14.0, 13.3],
    'hidden.missing': ['survey', 14.1, 22.0, 21.3],
    'hidden.window': ['charts', 0.3, 12.0, 11.3],
    'hidden.axis': ['charts', 12.1, 24.0, 23.3],
    'hidden.myth': ['speak', 0.3, 6.0, 5.3],
    'hidden.end': ['speak', 6.1, 12.0, 11.3],
    'types.why': ['kind', 0.3, 9.0, 8.3],
    'types.bits': ['kind', 9.1, 24.0, 23.3],
    'types.plus': ['kind', 24.1, 34.0, 33.3],
    'types.intro': ['types', 0.3, 5.0, 4.3],
    'types.int': ['types', 5.1, 12.0, 11.3],
    'types.float': ['types', 12.1, 19.0, 18.3],
    'types.text': ['types', 19.1, 26.0, 25.3],
    'types.bool': ['types', 26.1, 34.0, 33.3],
    'types.date': ['types', 34.1, 42.0, 41.3],
    'types.phone': ['phone', 0.3, 12.0, 11.3],
    'types.plate': ['phone', 12.1, 19.0, 18.3],
    'types.rule': ['phone', 19.1, 30.0, 29.3],
    'struct.list': ['struct', 0.3, 8.0, 7.3],
    'struct.name': ['struct', 8.1, 15.0, 14.3],
    'struct.query': ['struct', 15.1, 26.0, 25.3],
    'messy.notes': ['messy', 0.3, 9.0, 8.3],
    'messy.name': ['messy', 9.1, 18.0, 17.3],
    'messy.ask': ['ask', 0.3, 12.0, 11.3],
    'messy.iceberg': ['iceberg', 0.3, 9.0, 8.3],
    'messy.ai': ['iceberg', 9.1, 18.0, 17.3],
    'sum.ladder': ['sum', 0.3, 14.0, 13.3],
    'close.end': ['close', 0.3, 5.0, 4.2],
  };

  // Kalabalık animasyonları yavaşlatma (vuruş → kat)
  const PACE = {};
  // Anlatıcı sustuktan sonra görüntünün biraz daha durması (sn): önemli sonuçlar ve sahne sonları
  const PAUSE = {
    'recap.question': 1.2,
    'thermo.three': 1.0,
    'thermo.rule': 1.0,
    'data.examples': 0.4,
    'data.innocent': 0.6,
    'data.broken': 1.6,
    'info.context': 0.8,
    'info.questions': 0.6,
    'info.sentence': 0.6,
    'info.compare': 0.8,
    'judge.days': 0.8,
    'judge.verdict': 1.2,
    'ladder.three': 0.4,
    'ladder.help': 0.6,
    'ladder.gray': 1.0,
    'motto.say': 1.8,
    'hidden.four': 0.8,
    'hidden.survey': 1.0,
    'hidden.missing': 1.0,
    'hidden.window': 0.8,
    'hidden.axis': 0.8,
    'hidden.myth': 0.6,
    'hidden.end': 1.6,
    'types.why': 0.4,
    'types.bits': 1.0,
    'types.plus': 0.8,
    'types.bool': 0.4,
    'types.date': 0.8,
    'types.phone': 0.6,
    'types.plate': 0.6,
    'types.rule': 1.0,
    'struct.name': 1.0,
    'struct.query': 0.8,
    'messy.notes': 0.4,
    'messy.name': 0.8,
    'messy.ask': 0.8,
    'messy.iceberg': 0.6,
    'messy.ai': 1.4,
    'sum.ladder': 1.6,
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

  // ---- Devre parçaları ve ortak yardımcılar (önceki bölümlerden) -----------

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


  // Adım adım değişen sürekli değer: list = [[zaman, değer], ...]; her geçiş d saniye sürer
  function steps(t, list, d = 0.5, init = 0, fn = ease.inOut) {
    let v = init;
    for (const [tm, val] of list) {
      if (t < tm) break;
      v = lerp(v, val, fn(clamp((t - tm) / d)));
    }
    return v;
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

  // ---- Bu bölüme özel çizimler -------------------------------------------------

  // Merdivenin üç basamağı: veri (soğuk mavi), bilgi (amber), anlam (mor)
  const VIO = [180, 156, 255];
  const STEP = [
    { name: 'VERİ', col: C.digital, rgb: DIGI },
    { name: 'BİLGİ', col: C.fire, rgb: FIRE },
    { name: 'ANLAM', col: C.violet, rgb: VIO },
  ];

  // Üç basamaklı merdiven. x0: ilk basamağın sol kenarı, yb: zemin.
  // o.rise[i] 0..1 basamağın yükselişi, o.hi[i] 0..1 vurgusu, o.labels[i] 0..1 yazı görünürlüğü.
  // Basamakların üst yüzlerinin ortalarını döndürür (üstlerine bir şey koymak için).
  function drawLadder(ctx, x0, yb, o = {}) {
    const sw = o.sw ?? 360;
    const sh = o.sh ?? 120;
    const d = o.d ?? 44;
    const alpha = o.alpha ?? 1;
    const rise = o.rise ?? [1, 1, 1];
    const hi = o.hi ?? [0, 0, 0];
    const labels = o.labels ?? [1, 1, 1];
    const names = o.names ?? STEP.map((s) => s.name);
    const tops = [];
    for (let i = 0; i < 3; i++) {
      const x = x0 + i * sw;
      const h = (i + 1) * sh * rise[i];
      const y = yb - h;
      tops.push({ x: x + sw / 2 + d / 2, y: y - d / 2, left: x, w: sw });
      if (alpha <= 0.002 || rise[i] <= 0.001) continue;
      const st = STEP[i];
      if (hi[i] > 0) glow(ctx, x + sw / 2, y - 10, sw * 0.9, st.rgb, 0.22 * hi[i] * alpha);
      ctx.save();
      ctx.globalAlpha *= alpha;
      // ön yüz
      const g = ctx.createLinearGradient(0, y, 0, yb);
      g.addColorStop(0, rgba(st.rgb, 0.16 + 0.12 * hi[i]));
      g.addColorStop(1, 'rgba(10,14,26,0.95)');
      ctx.fillStyle = '#0d1424';
      ctx.fillRect(x, y, sw, h);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, sw, h);
      // üst yüz
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + sw, y);
      ctx.lineTo(x + sw + d, y - d);
      ctx.lineTo(x + d, y - d);
      ctx.closePath();
      ctx.fillStyle = rgba(st.rgb, 0.3 + 0.45 * hi[i]);
      ctx.fill();
      // yan yüz (yalnızca en sağdaki basamakta görünür)
      if (i === 2) {
        ctx.beginPath();
        ctx.moveTo(x + sw, y);
        ctx.lineTo(x + sw + d, y - d);
        ctx.lineTo(x + sw + d, yb - d);
        ctx.lineTo(x + sw, yb);
        ctx.closePath();
        ctx.fillStyle = 'rgba(8,11,20,0.95)';
        ctx.fill();
      }
      ctx.strokeStyle = rgba(st.rgb, 0.55 + 0.4 * hi[i]);
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, sw, h);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + d, y - d);
      ctx.lineTo(x + sw + d, y - d);
      ctx.lineTo(x + sw, y);
      ctx.stroke();
      ctx.restore();
      const la = alpha * labels[i] * clamp(rise[i] * 2 - 1);
      if (la > 0 && h > 70) {
        text(ctx, names[i], x + sw / 2, y + 46, { size: o.labelSize ?? 36, family: 'display', weight: 900, spacing: 6, color: st.col, alpha: la });
        if (o.sub && h > 120) text(ctx, o.sub[i], x + sw / 2, y + 92, { size: 24, color: C.muted, alpha: la });
      }
    }
    return tops;
  }

  // Sağ üstte küçük merdiven: hangi basamakta olduğumuzu gösterir
  function miniLadder(ctx, active, alpha) {
    if (alpha <= 0.002) return;
    const x0 = W - 330;
    const yb = 128;
    for (let i = 0; i < 3; i++) {
      const on = i === active;
      ctx.save();
      ctx.globalAlpha *= alpha;
      ctx.fillStyle = on ? rgba(STEP[i].rgb, 0.85) : 'rgba(77,86,107,0.5)';
      ctx.fillRect(x0 + i * 40, yb - (i + 1) * 16, 38, (i + 1) * 16);
      ctx.restore();
    }
    text(ctx, active >= 0 ? `${active + 1} · ${STEP[active].name}` : '', x0 + 136, yb - 22, { size: 24, weight: 800, spacing: 4, color: active >= 0 ? STEP[active].col : C.muted, align: 'left', alpha });
  }

  // Yuvarlak köşeli etiket (hap). Genişliği döndürür.
  function pill(ctx, str, x, y, o = {}) {
    const alpha = o.alpha ?? 1;
    if (alpha <= 0.002) return 0;
    const size = o.size ?? 30;
    const tw = measure(ctx, str, { size, family: o.family ?? 'sans', weight: o.weight ?? 700 });
    const w = tw + size * 1.2;
    const h = size * 1.7;
    const cx = o.align === 'left' ? x + w / 2 : x;
    ctx.save();
    ctx.globalAlpha *= alpha;
    roundRect(ctx, cx - w / 2, y - h / 2, w, h, h / 2);
    ctx.fillStyle = o.fill ?? 'rgba(18,26,44,0.95)';
    ctx.fill();
    ctx.lineWidth = o.lw ?? 2.5;
    ctx.strokeStyle = o.stroke ?? o.color ?? C.cream;
    ctx.stroke();
    ctx.restore();
    text(ctx, str, cx, y + 1, { size, family: o.family ?? 'sans', weight: o.weight ?? 700, color: o.color ?? C.cream, alpha });
    return w;
  }

  // Veri kartı: ham bir değeri taşıyan küçük kart
  function dataCard(ctx, str, x, y, o = {}) {
    const alpha = o.alpha ?? 1;
    if (alpha <= 0.002) return;
    const size = o.size ?? 54;
    const tw = measure(ctx, str, { size, family: o.family ?? 'mono', weight: 700 });
    const w = Math.max(o.minW ?? 0, tw + 70);
    const h = size * 1.9;
    const s = o.scale ?? 1;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(o.rot ?? 0);
    ctx.scale(s, s);
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    roundRect(ctx, -w / 2, -h / 2, w, h, 14);
    ctx.fillStyle = o.fill ?? '#101a30';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 3;
    ctx.strokeStyle = o.stroke ?? rgba(DIGI, 0.8);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(o.rot ?? 0);
    ctx.scale(s, s);
    text(ctx, str, 0, 2, { size, family: o.family ?? 'mono', weight: 700, color: o.color ?? C.cream, alpha });
    ctx.restore();
  }

  // Damga: eğik, çerçeveli büyük harfler (k: 0 → 1 vuruş)
  function stamp(ctx, str, x, y, col, k, o = {}) {
    if (k <= 0.002) return;
    const s = lerp(1.8, 1, ease.out(clamp(k * 1.4)));
    const a = clamp(k * 3) * (o.alpha ?? 1);
    const size = o.size ?? 34;
    const tw = measure(ctx, str, { size, family: 'display', weight: 900, spacing: 5 });
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(o.rot ?? -0.12);
    ctx.scale(s, s);
    roundRect(ctx, -tw / 2 - 18, -size * 0.75, tw + 36, size * 1.5, 8);
    ctx.lineWidth = 4;
    ctx.strokeStyle = col;
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(o.rot ?? -0.12);
    ctx.scale(s, s);
    text(ctx, str, 0, 2, { size, family: 'display', weight: 900, spacing: 5, color: col, alpha: a });
    ctx.restore();
  }

  function tick(ctx, x, y, s, col, alpha = 1, k = 1) {
    if (alpha <= 0.002 || k <= 0) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = col;
    ctx.lineWidth = 7 * s;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    partialPath(ctx, [[x - 22 * s, y], [x - 6 * s, y + 16 * s], [x + 24 * s, y - 18 * s]], 75 * s * k);
    ctx.restore();
  }

  function cross(ctx, x, y, s, col, alpha = 1, k = 1) {
    if (alpha <= 0.002 || k <= 0) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = col;
    ctx.lineWidth = 7 * s;
    ctx.lineCap = 'round';
    const a = clamp(k * 2);
    const b = clamp(k * 2 - 1);
    line(ctx, x - 20 * s, y - 20 * s, lerp(x - 20 * s, x + 20 * s, a), lerp(y - 20 * s, y + 20 * s, a));
    if (b > 0) line(ctx, x + 20 * s, y - 20 * s, lerp(x + 20 * s, x - 20 * s, b), lerp(y - 20 * s, y + 20 * s, b));
    ctx.restore();
  }

  // Üstü çizili yazı çizgisi (k: 0 → 1 soldan sağa)
  function strike(ctx, x1, x2, y, col, alpha, k) {
    if (alpha <= 0.002 || k <= 0) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = col;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    line(ctx, x1, y, lerp(x1, x2, k), y);
    ctx.restore();
  }

  // Cam termometre: (x, y) borunun ortası; level 0..1 sıvı yüksekliği
  function drawThermo(ctx, x, y, s, level, alpha = 1, o = {}) {
    if (alpha <= 0.002) return;
    const th = 380 * s;
    const tw = 46 * s;
    const br = 44 * s;
    const top = y - th / 2;
    const bot = y + th / 2;
    ctx.save();
    ctx.globalAlpha *= alpha;
    // cam
    roundRect(ctx, x - tw / 2, top, tw, th + br * 0.6, tw / 2);
    ctx.fillStyle = 'rgba(200,220,255,0.08)';
    ctx.fill();
    ctx.lineWidth = 4 * Math.max(s, 0.5);
    ctx.strokeStyle = 'rgba(220,230,255,0.7)';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, bot + br * 0.6, br, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(14,20,36,1)';
    ctx.fill();
    ctx.stroke();
    // sıvı
    const red = o.color ?? '#ff4d5e';
    ctx.fillStyle = red;
    ctx.beginPath();
    ctx.arc(x, bot + br * 0.6, br * 0.72, 0, Math.PI * 2);
    ctx.fill();
    const lh = (th - 30 * s) * clamp(level);
    roundRect(ctx, x - tw * 0.22, bot + br * 0.2 - lh, tw * 0.44, lh + 10 * s, tw * 0.2);
    ctx.fill();
    // ölçek çizgileri
    ctx.strokeStyle = 'rgba(220,230,255,0.55)';
    ctx.lineWidth = 2.5 * Math.max(s, 0.5);
    for (let k = 0; k <= 10; k++) {
      const yy = bot - 10 * s - (k / 10) * (th - 40 * s);
      line(ctx, x + tw / 2 + 6 * s, yy, x + tw / 2 + (k % 5 === 0 ? 26 : 16) * s, yy);
    }
    // parlaklık
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 5 * s;
    line(ctx, x - tw * 0.3, top + 24 * s, x - tw * 0.3, bot - 20 * s);
    if (o.cracked) {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.moveTo(x - tw / 2, y - 60 * s);
      ctx.lineTo(x - 4 * s, y - 40 * s);
      ctx.lineTo(x + 8 * s, y - 70 * s);
      ctx.lineTo(x + tw / 2, y - 52 * s);
      ctx.moveTo(x - 4 * s, y - 40 * s);
      ctx.lineTo(x - 2 * s, y - 10 * s);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Dijital gösterge kutusu
  function readout(ctx, str, x, y, o = {}) {
    const alpha = o.alpha ?? 1;
    if (alpha <= 0.002) return;
    const size = o.size ?? 72;
    const tw = measure(ctx, str, { size, family: 'mono', weight: 700 });
    const w = tw + size * 0.9;
    const h = size * 1.5;
    panel(ctx, x, y, w, h, alpha, { fill: '#08101e', stroke: o.stroke ?? '#3a4664', lw: 3, r: 14 });
    if (o.glow) glow(ctx, x, y, w * 0.8, o.glow, 0.25 * alpha);
    text(ctx, str, x, y + 3, { size, family: 'mono', weight: 700, color: o.color ?? C.cream, alpha });
  }

  function drawSun(ctx, x, y, r, alpha, t) {
    if (alpha <= 0.002) return;
    glow(ctx, x, y, r * 3.2, [255, 200, 90], 0.45 * alpha);
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(t * 0.25);
    ctx.strokeStyle = '#ffd27a';
    ctx.lineWidth = r * 0.16;
    ctx.lineCap = 'round';
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      line(ctx, Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3, Math.cos(a) * r * 1.7, Math.sin(a) * r * 1.7);
    }
    ctx.fillStyle = '#ffc04d';
    dot(ctx, 0, 0, r);
    ctx.restore();
  }

  // Hilal ay: arka plan rengiyle kesilir
  function drawMoon(ctx, x, y, r, alpha, bg) {
    if (alpha <= 0.002) return;
    glow(ctx, x, y, r * 3, [230, 230, 255], 0.2 * alpha);
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = '#f3ede1';
    dot(ctx, x, y, r);
    ctx.fillStyle = bg;
    dot(ctx, x + r * 0.45, y - r * 0.25, r * 0.85);
    ctx.restore();
  }

  // Basit insan figürü. o.child: daha küçük ve iri başlı; o.arm: el kaldırma (0..1)
  function drawPerson(ctx, x, y, s, col, alpha = 1, o = {}) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = col;
    const hr = o.child ? 15 : 13;
    dot(ctx, 0, o.child ? -38 : -44, hr);
    ctx.beginPath();
    ctx.moveTo(-17, 30);
    ctx.lineTo(-13, -16);
    ctx.quadraticCurveTo(0, -27, 13, -16);
    ctx.lineTo(17, 30);
    ctx.closePath();
    ctx.fill();
    if (o.arm) {
      ctx.strokeStyle = col;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      line(ctx, 11, -12, 11 + 20 * o.arm, -12 - 30 * o.arm);
    }
    if (o.hair) {
      ctx.strokeStyle = col;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      line(ctx, -hr, -40, -hr - 8, -26);
      line(ctx, hr, -40, hr + 8, -26);
    }
    ctx.restore();
  }

  // Makine: ayaklı bir çip ve iki ışık göz
  function drawBot(ctx, x, y, s, alpha, t, o = {}) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = '#9aa3b8';
    for (let k = -2; k <= 2; k++) {
      ctx.fillRect(k * 16 - 4, -62, 8, 14);
      ctx.fillRect(k * 16 - 4, 48, 8, 14);
      ctx.fillRect(-62, k * 16 - 4, 14, 8);
      ctx.fillRect(48, k * 16 - 4, 14, 8);
    }
    roundRect(ctx, -50, -50, 100, 100, 12);
    ctx.fillStyle = '#1c2640';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = o.col ?? C.digital;
    ctx.stroke();
    const blink = Math.abs(Math.sin(t * 0.9 + (o.seed ?? 0))) > 0.97 ? 0.15 : 1;
    ctx.fillStyle = o.col ?? C.digital;
    roundRect(ctx, -28, -16, 18, 22 * blink + 2, 6);
    ctx.fill();
    roundRect(ctx, 10, -16, 18, 22 * blink + 2, 6);
    ctx.fill();
    ctx.restore();
    glow(ctx, x, y, 90 * s, DIGI, 0.12 * alpha);
  }

  // Konuşma / bildirim balonu. tail: [tx, ty] kuyruğun ucu
  function bubble(ctx, x, y, w, h, alpha, o = {}) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    roundRect(ctx, x - w / 2, y - h / 2, w, h, o.r ?? 22);
    ctx.fillStyle = o.fill ?? '#f3ede1';
    ctx.fill();
    if (o.tail) {
      const [tx, ty] = o.tail;
      const bx = clamp(tx, x - w / 2 + 40, x + w / 2 - 40);
      const by = ty > y ? y + h / 2 - 2 : y - h / 2 + 2;
      ctx.beginPath();
      ctx.moveTo(bx - 18, by);
      ctx.lineTo(tx, ty);
      ctx.lineTo(bx + 18, by);
      ctx.closePath();
      ctx.fill();
    }
    if (o.stroke) {
      roundRect(ctx, x - w / 2, y - h / 2, w, h, o.r ?? 22);
      ctx.lineWidth = 3;
      ctx.strokeStyle = o.stroke;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Düşünce bulutu (ch03'ten)
  function cloud(ctx, x, y, s, alpha, fill = '#1a2338', stroke = '#5a6788') {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (const [cx, cy, r] of [[-70, 10, 50], [-20, -30, 60], [45, -20, 55], [80, 20, 45], [10, 35, 55], [-50, 40, 40]]) {
      ctx.moveTo(cx + r, cy);
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }

  // Çizgi ikonlar (ch01 ve ch03'ten seçilmiş + yeniler)
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
      case 'thermo':
        roundRect(ctx, -11, -46, 22, 66, 11);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 30, 17, 0, Math.PI * 2);
        ctx.stroke();
        dot(ctx, 0, 30, 10);
        ctx.fillRect(-4, -24, 8, 52);
        break;
      case 'clock':
        ctx.beginPath();
        ctx.arc(0, 0, 38, 0, Math.PI * 2);
        ctx.stroke();
        line(ctx, 0, 0, 0, -24);
        line(ctx, 0, 0, 18, 8);
        break;
      case 'camera':
        roundRect(ctx, -44, -26, 88, 60, 10);
        ctx.stroke();
        ctx.strokeRect(-18, -38, 36, 12);
        ctx.beginPath();
        ctx.arc(0, 4, 19, 0, Math.PI * 2);
        ctx.stroke();
        dot(ctx, 30, -14, 4);
        break;
      case 'book':
        for (const d of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(0, -26);
          ctx.quadraticCurveTo(22 * d, -38, 46 * d, -30);
          ctx.lineTo(46 * d, 30);
          ctx.quadraticCurveTo(22 * d, 22, 0, 34);
          ctx.closePath();
          ctx.stroke();
        }
        break;
      case 'scale': {
        // terazi; k: eğim (-1..1)
        line(ctx, 0, -40, 0, 36);
        line(ctx, -22, 36, 22, 36);
        ctx.save();
        ctx.translate(0, -34);
        ctx.rotate(0.18 * k);
        line(ctx, -46, 0, 46, 0);
        for (const d of [-1, 1]) {
          line(ctx, 46 * d, 0, 46 * d - 14, 30);
          line(ctx, 46 * d, 0, 46 * d + 14, 30);
          ctx.beginPath();
          ctx.moveTo(46 * d - 20, 30);
          ctx.quadraticCurveTo(46 * d, 46, 46 * d + 20, 30);
          ctx.closePath();
          ctx.stroke();
        }
        ctx.restore();
        break;
      }
      case 'heart':
        ctx.beginPath();
        ctx.moveTo(0, 34);
        ctx.bezierCurveTo(-52, 0, -36, -44, 0, -18);
        ctx.bezierCurveTo(36, -44, 52, 0, 0, 34);
        ctx.fill();
        break;
      case 'cross':
        roundRect(ctx, -40, -40, 80, 80, 14);
        ctx.stroke();
        ctx.fillRect(-9, -26, 18, 52);
        ctx.fillRect(-26, -9, 52, 18);
        break;
      case 'door': {
        roundRect(ctx, -46, -56, 92, 112, 4);
        ctx.stroke();
        const o = 40 * k;
        ctx.strokeRect(-44, -54, 44 - o, 108);
        ctx.strokeRect(o, -54, 44 - o, 108);
        break;
      }
      case 'photo':
        roundRect(ctx, -46, -36, 92, 72, 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-38, 26);
        ctx.lineTo(-12, -6);
        ctx.lineTo(6, 12);
        ctx.lineTo(18, 0);
        ctx.lineTo(38, 26);
        ctx.closePath();
        ctx.fill();
        dot(ctx, 22, -18, 8);
        break;
      case 'sound':
        for (let j = -4; j <= 4; j++) {
          const h = 10 + 32 * Math.abs(Math.sin(j * 1.7 + 0.6));
          line(ctx, j * 10, -h / 2, j * 10, h / 2);
        }
        break;
      case 'video':
        roundRect(ctx, -46, -32, 92, 64, 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-12, -16);
        ctx.lineTo(18, 0);
        ctx.lineTo(-12, 16);
        ctx.closePath();
        ctx.fill();
        break;
      case 'text':
        roundRect(ctx, -34, -44, 68, 88, 6);
        ctx.stroke();
        for (let j = 0; j < 5; j++) line(ctx, -22, -28 + j * 14, j === 4 ? 4 : 22, -28 + j * 14);
        break;
      case 'table':
        roundRect(ctx, -44, -34, 88, 68, 6);
        ctx.stroke();
        line(ctx, -44, -14, 44, -14);
        line(ctx, -44, 8, 44, 8);
        line(ctx, -14, -34, -14, 34);
        line(ctx, 14, -34, 14, 34);
        break;
      case 'pencil':
        ctx.save();
        ctx.rotate(-0.7);
        ctx.strokeRect(-10, -44, 20, 70);
        ctx.beginPath();
        ctx.moveTo(-10, 26);
        ctx.lineTo(0, 46);
        ctx.lineTo(10, 26);
        ctx.stroke();
        ctx.restore();
        break;
      case 'calendar':
        roundRect(ctx, -40, -34, 80, 72, 6);
        ctx.stroke();
        line(ctx, -40, -16, 40, -16);
        line(ctx, -20, -44, -20, -26);
        line(ctx, 20, -44, 20, -26);
        for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) ctx.fillRect(-28 + c * 16, -6 + r * 13, 8, 7);
        break;
      case 'chart':
        line(ctx, -40, -38, -40, 36);
        line(ctx, -40, 36, 42, 36);
        ctx.fillRect(-30, 6, 14, 30);
        ctx.fillRect(-8, -12, 14, 48);
        ctx.fillRect(14, -28, 14, 64);
        break;
      case 'basket':
        ctx.beginPath();
        ctx.moveTo(-42, -8);
        ctx.lineTo(42, -8);
        ctx.lineTo(32, 36);
        ctx.lineTo(-32, 36);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -8, 30, Math.PI, 0);
        ctx.stroke();
        line(ctx, -14, 4, -10, 28);
        line(ctx, 14, 4, 10, 28);
        break;
      case 'ruler':
        ctx.strokeRect(-46, -14, 92, 28);
        for (let j = 0; j < 9; j++) line(ctx, -38 + j * 10, -14, -38 + j * 10, j % 2 ? -4 : 2);
        break;
      case 'phone':
        roundRect(ctx, -24, -42, 48, 84, 9);
        ctx.stroke();
        line(ctx, -8, -32, 8, -32);
        dot(ctx, 0, 32, 3.5);
        break;
      case 'brain':
        ctx.beginPath();
        ctx.arc(-14, -6, 26, Math.PI * 0.6, Math.PI * 1.9);
        ctx.arc(14, -6, 26, Math.PI * 1.1, Math.PI * 0.4);
        ctx.closePath();
        ctx.stroke();
        line(ctx, 0, -30, 0, 18);
        ctx.beginPath();
        ctx.arc(-14, -4, 10, Math.PI * 1.2, Math.PI * 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(14, -4, 10, Math.PI * 0.8, Math.PI * 1.8, true);
        ctx.stroke();
        break;
      default:
        break;
    }
    ctx.restore();
  }

  // Çizgi grafiği: pts [[x, y]] veri koordinatında; box {x, y, w, h}, aralıklar xr, yr
  function plotLine(ctx, box, pts, xr, yr, o = {}) {
    const alpha = o.alpha ?? 1;
    if (alpha <= 0.002 || pts.length < 2) return [];
    const px = (v) => box.x + ((v - xr[0]) / (xr[1] - xr[0])) * box.w;
    const py = (v) => box.y + box.h - ((v - yr[0]) / (yr[1] - yr[0])) * box.h;
    const sp = pts.map(([a, b]) => [px(a), py(b)]);
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = o.color ?? C.digital;
    ctx.lineWidth = o.lw ?? 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const L = pathLength(sp);
    partialPath(ctx, sp, L * (o.draw ?? 1));
    if (o.dots) {
      ctx.fillStyle = o.dotColor ?? o.color ?? C.digital;
      sp.forEach(([x, y], i) => {
        if (pathLength(sp.slice(0, i + 1)) <= L * (o.draw ?? 1) + 1) dot(ctx, x, y, o.dots);
      });
    }
    ctx.restore();
    return sp;
  }

  function axes(ctx, box, alpha, o = {}) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = o.color ?? C.dim;
    ctx.lineWidth = o.lw ?? 3;
    ctx.lineCap = 'round';
    line(ctx, box.x, box.y - 10, box.x, box.y + box.h);
    line(ctx, box.x, box.y + box.h, box.x + box.w + 10, box.y + box.h);
    ctx.restore();
  }

  // Tablo: cols [{w, head, align}], rows [[hücre, ...]].
  // o.rowAlpha(j), o.rowY(j) (satır sırası, kesirli olabilir), o.rowHi(j) 0..1, o.cellColor(j, i)
  function drawTable(ctx, x, y, cols, rows, o = {}) {
    const alpha = o.alpha ?? 1;
    if (alpha <= 0.002) return;
    const rh = o.rowH ?? 64;
    const hh = o.headH ?? 62;
    const size = o.size ?? 32;
    const W0 = cols.reduce((n, c) => n + c.w, 0);
    ctx.save();
    ctx.globalAlpha *= alpha;
    roundRect(ctx, x, y, W0, hh, [12, 12, 0, 0]);
    ctx.fillStyle = o.headFill ?? '#1f2a46';
    ctx.fill();
    ctx.restore();
    let cx = x;
    cols.forEach((c) => {
      const ha = alpha * (c.headAlpha ?? 1);
      text(ctx, c.head, c.align === 'left' ? cx + 22 : cx + c.w / 2, y + hh / 2 + 1, { size: o.headSize ?? 26, weight: 800, spacing: 2, color: c.headColor ?? C.muted, align: c.align === 'left' ? 'left' : 'center', alpha: ha });
      cx += c.w;
    });
    rows.forEach((r, j) => {
      const ra = alpha * (o.rowAlpha ? o.rowAlpha(j) : 1);
      if (ra <= 0.002) return;
      const yy = y + hh + (o.rowY ? o.rowY(j) : j) * rh;
      const xo = o.rowX ? o.rowX(j) : 0;
      const hi = o.rowHi ? o.rowHi(j) : 0;
      ctx.save();
      ctx.globalAlpha *= ra;
      ctx.translate(xo, 0);
      ctx.fillStyle = j % 2 ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(x, yy, W0, rh);
      if (hi > 0) {
        ctx.fillStyle = rgba(o.hiRgb ?? FIRE, 0.18 * hi);
        ctx.fillRect(x, yy, W0, rh);
        ctx.fillStyle = rgba(o.hiRgb ?? FIRE, 0.9 * hi);
        ctx.fillRect(x, yy, 6, rh);
      }
      ctx.restore();
      let ccx = x + xo;
      r.forEach((v, i) => {
        const c = cols[i];
        const col = o.cellColor ? o.cellColor(j, i, v) : (c.color ?? C.cream);
        const ca = ra * (o.cellAlpha ? o.cellAlpha(j, i) : 1);
        text(ctx, String(v), c.align === 'left' ? ccx + 22 : ccx + c.w / 2, yy + rh / 2 + 1, { size: c.size ?? size, family: c.family ?? 'sans', weight: c.weight ?? 500, color: col, align: c.align === 'left' ? 'left' : 'center', alpha: ca });
        ccx += c.w;
      });
    });
    if (o.grid !== false) {
      ctx.save();
      ctx.globalAlpha *= alpha * (o.gridAlpha ?? 1);
      ctx.strokeStyle = o.gridColor ?? 'rgba(90,103,136,0.5)';
      ctx.lineWidth = 2;
      let gx = x;
      const n = o.gridRows ?? rows.length;
      for (let i = 0; i < cols.length - 1; i++) {
        gx += cols[i].w;
        line(ctx, gx, y + 8, gx, y + hh + n * rh - 8);
      }
      ctx.restore();
    }
  }

  // Türk plakası: beyaz zemin, solda mavi TR şeridi
  function drawPlate(ctx, str, x, y, s, alpha, o = {}) {
    if (alpha <= 0.002) return;
    const w = 520 * s;
    const h = 120 * s;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    roundRect(ctx, -w / 2, -h / 2, w, h, 12 * s);
    ctx.fillStyle = '#f5f5f0';
    ctx.fill();
    ctx.lineWidth = 6 * s;
    ctx.strokeStyle = '#1b1f2a';
    ctx.stroke();
    roundRect(ctx, -w / 2 + 8 * s, -h / 2 + 8 * s, 56 * s, h - 16 * s, 6 * s);
    ctx.fillStyle = '#1f4fb5';
    ctx.fill();
    ctx.restore();
    text(ctx, 'TR', x - w / 2 + 36 * s, y + 30 * s, { size: 26 * s, weight: 800, color: '#ffffff', alpha });
    text(ctx, str, x + 33 * s + (o.dx ?? 0), y + 4 * s, { size: (o.size ?? 70) * s, family: 'mono', weight: 700, color: o.color ?? '#1b1f2a', alpha });
  }

  // Bina (kütüphane ya da okul)
  function drawBuilding(ctx, x, y, w, h, label, alpha, o = {}) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = o.fill ?? '#1a2440';
    ctx.strokeStyle = o.stroke ?? '#5a6788';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - w / 2 - 20, y - h);
    ctx.lineTo(x, y - h - h * 0.35);
    ctx.lineTo(x + w / 2 + 20, y - h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(x - w / 2, y - h, w, h);
    ctx.strokeRect(x - w / 2, y - h, w, h);
    if (o.columns) {
      ctx.fillStyle = '#2c3a5e';
      const n = o.columns;
      for (let k = 0; k < n; k++) ctx.fillRect(x - w / 2 + 20 + k * ((w - 60) / (n - 1)), y - h + 40, 20, h - 40);
    } else {
      ctx.fillStyle = 'rgba(255,210,122,0.5)';
      for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) ctx.fillRect(x - w / 2 + 24 + c * ((w - 48) / 4), y - h + 30 + r * 70, (w - 48) / 4 - 24, 40);
    }
    ctx.fillStyle = '#0b1120';
    roundRect(ctx, x - 34, y - 90, 68, 90, [30, 30, 0, 0]);
    ctx.fill();
    ctx.restore();
    if (label) text(ctx, label, x, y - h - h * 0.12, { size: o.labelSize ?? 26, weight: 800, spacing: 4, color: o.labelColor ?? C.cream, alpha });
  }

  // Not kâğıdı (yapışkan not): rot radyan
  function stickyNote(ctx, x, y, w, h, rot, fill, alpha) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = fill;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(-w / 2, -h / 2, w, 16);
    ctx.restore();
  }

  // Büyüteç
  function magnifier(ctx, x, y, r, alpha) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#c9b48a';
    ctx.lineWidth = r * 0.22;
    line(ctx, x + r * 0.72, y + r * 0.72, x + r * 1.5, y + r * 1.5);
    ctx.strokeStyle = '#e8e2d4';
    ctx.lineWidth = r * 0.12;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(180,210,255,0.12)';
    ctx.fill();
    ctx.restore();
  }

  // Kukla çıtası ve ipler: (x, y) çıtanın ortası; ends: ipin bağlandığı noktalar
  function puppetBar(ctx, x, y, w, ends, alpha, t) {
    if (alpha <= 0.002) return;
    const sway = Math.sin(t * 1.3) * 0.06;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(sway);
    ctx.fillStyle = '#8a6a48';
    roundRect(ctx, -w / 2, -9, w, 18, 6);
    ctx.fill();
    roundRect(ctx, -9, -w * 0.18, 18, w * 0.36, 6);
    ctx.fill();
    // el
    ctx.fillStyle = '#d9b48f';
    roundRect(ctx, -46, -84, 92, 64, 24);
    ctx.fill();
    for (let k = 0; k < 4; k++) {
      roundRect(ctx, -42 + k * 22, -30, 18, 40, 9);
      ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.globalAlpha *= alpha * 0.8;
    ctx.strokeStyle = '#e8e2d4';
    ctx.lineWidth = 1.6;
    ends.forEach(([ex, ey], i) => {
      const bx = x + Math.cos(sway) * lerp(-w / 2, w / 2, ends.length > 1 ? i / (ends.length - 1) : 0.5);
      const by = y + Math.sin(sway) * lerp(-w / 2, w / 2, ends.length > 1 ? i / (ends.length - 1) : 0.5);
      line(ctx, bx, by, ex, ey);
    });
    ctx.restore();
  }

  // Ana sahnelerdeki büyük başlık + alt başlık
  function heading(ctx, str, y, col, alpha, o = {}) {
    text(ctx, str, o.x ?? W / 2, y, { size: o.size ?? 60, family: 'display', weight: 900, spacing: o.spacing ?? 6, color: col, alpha, align: o.align ?? 'center' });
  }
  function caption(ctx, str, y, alpha, o = {}) {
    text(ctx, str, o.x ?? W / 2, y, { size: o.size ?? 40, family: 'serif', italic: true, color: o.color ?? C.cream, alpha, align: o.align ?? 'center' });
  }

  // Hareket: a → b noktası arasında k ile (yumuşak) ve hafif kavisli
  function travel(a, b, k, lift = 0) {
    const p = ease.inOut(clamp(k));
    return [lerp(a[0], b[0], p), lerp(a[1], b[1], p) - Math.sin(p * Math.PI) * lift];
  }

  // ---------------------------------------------------------------------------
  // 0 · Açılış
  // ---------------------------------------------------------------------------

  const DRIFT = ['38,5', '0532…', '2026-08-15', 'kırmızı', '12', '07', '65', '01000001', '37,2', '06', '180', '72', '75', '“5”', 'A', '14:30'];

  // Arka planda süzülen ham veri parçaları
  function drawDrift(ctx, t, alpha) {
    if (alpha <= 0.002) return;
    DRIFT.forEach((s, i) => {
      const x = 120 + hash(i, 11) * (W - 240);
      const sp = 14 + hash(i, 12) * 16;
      const y = H + 40 - ((t * sp + hash(i, 13) * (H + 120)) % (H + 120));
      const a = alpha * (0.1 + 0.16 * hash(i, 14)) * clamp(Math.min(y / 200, (H - y) / 200));
      text(ctx, s, x, y, { size: 26 + 18 * hash(i, 15), family: 'mono', weight: 600, color: C.digital, alpha: a });
    });
  }

  function sceneOpen(ctx, lt, t) {
    drawDrift(ctx, t, progress(lt, 0, 1.2) * (1 - 0.75 * progress(lt, 3.0, 4.0)));
    const k = (i) => progress(lt, 0.4 + i * 0.5, 1.3 + i * 0.5, ease.out);
    const hi = [0, 1, 2].map((i) => after(t, 'open-title', 2 + i, 0.5) * (1 - 0.4 * progress(lt, 7.0, 7.6)));
    drawLadder(ctx, W / 2 - 540 - 22, 1000, { sw: 360, sh: 86, d: 40, rise: [k(0), k(1), k(2)], hi, labels: [0, 0, 0], alpha: 1 - 0.25 * progress(lt, 3.2, 4.0) });
    const a1 = progress(lt, 3.3, 4.3, ease.out);
    text(ctx, 'BİRİNCİ KAPI · DÜNYAYI SAYIYA ÇEVİRMEK', W / 2, 200, { size: 26, weight: 600, spacing: 10, color: C.muted, alpha: a1 });
    const a2 = progress(lt, 3.6, 4.6, ease.out);
    text(ctx, '4', W / 2, 300 + (1 - a2) * 20, { size: 90, family: 'display', weight: 900, color: C.fire, alpha: a2 });
    const wa = (i) => after(t, 'open-title', 2 + i, 0.6);
    const sz = 112;
    runs(ctx, [
      ['VERİ', { size: sz, family: 'display', weight: 900, color: C.digital, alpha: wa(0) }],
      ['  ·  ', { size: sz * 0.6, family: 'display', weight: 900, color: C.dim, alpha: wa(1) }],
      ['BİLGİ', { size: sz, family: 'display', weight: 900, color: C.fire, alpha: wa(1) }],
      ['  ·  ', { size: sz * 0.6, family: 'display', weight: 900, color: C.dim, alpha: wa(2) }],
      ['ANLAM', { size: sz, family: 'display', weight: 900, color: C.violet, alpha: wa(2) }],
    ], W / 2, 470);
    text(ctx, 'Üç basamaklı merdiven', W / 2, 570, { size: 56, family: 'serif', italic: true, color: C.flame, alpha: after(t, 'open-title', 5, 0.8) });
  }

  // ---------------------------------------------------------------------------
  // 1 · Buraya kadar: elektrik → sayı → mantık → hesap
  // ---------------------------------------------------------------------------

  const PATH_X = [420, 780, 1140, 1500];
  const PATH_NAMES = ['elektrik', 'sayı', 'mantık', 'hesap'];

  function scenePathNode(ctx, i, x, y, s, a, t) {
    if (a <= 0.002) return;
    if (i === 0) drawBulb(ctx, x, y, 46 * s, 0.85 + 0.15 * Math.sin(t * 3), a);
    if (i === 1) {
      panel(ctx, x, y, 150 * s, 110 * s, a, { fill: '#121a2c', stroke: C.line, r: 16 });
      runs(ctx, bitRuns('01', 62 * s), x, y + 22 * s, { alpha: a });
    }
    if (i === 2) drawGate(ctx, 'and', x, y, 0.62 * s, a, C.cream, 1);
    if (i === 3) {
      panel(ctx, x, y, 150 * s, 120 * s, a, { fill: '#17213a', stroke: C.fire, r: 18 });
      text(ctx, '+', x, y - 4 * s, { size: 110 * s, family: 'display', weight: 800, color: C.fire, alpha: a });
    }
  }

  function sceneRecap(ctx, lt, t) {
    kicker(ctx, 'BURAYA KADAR', lt, 16);
    const pa = spanVis(lt, 'recap.path', 'recap.step');
    if (pa > 0) {
      const back = after(t, 'recap-step', 0, 1.2, ease.inOut);
      const s = lerp(1, 0.55, back);
      const cy = lerp(470, 250, back);
      const xs = PATH_X.map((x) => W / 2 + (x - W / 2) * s);
      PATH_X.forEach((_, i) => {
        const na = pa * (i === 0 ? after(t, 'recap-path', 0, 0.6) : after(t, 'recap-path', i, 0.6));
        scenePathNode(ctx, i, xs[i], cy, s, na, t);
        text(ctx, PATH_NAMES[i], xs[i], cy + 120 * s, { size: 36 * s, weight: 700, color: C.cream, alpha: na });
        if (i < 3) {
          const aa = pa * after(t, 'recap-path', i + 1, 0.6);
          arrow(ctx, xs[i] + 95 * s, cy, xs[i + 1] - 95 * s, cy, C.fire, aa, 4, 16 * s);
          text(ctx, `${i + 1}. BÖLÜM`, (xs[i] + xs[i + 1]) / 2, cy - 44 * s, { size: 20 * s, weight: 700, spacing: 3, color: C.muted, alpha: aa });
        }
      });
      // "fizik" ayracı
      const fa = pa * after(t, 'recap-path', 0, 0.8) * (1 - back * 0.4);
      if (fa > 0) {
        ctx.save();
        ctx.globalAlpha *= fa;
        ctx.strokeStyle = C.dim;
        ctx.lineWidth = 3;
        const yb = cy + 180 * s;
        line(ctx, xs[0] - 60 * s, yb - 16 * s, xs[0] - 60 * s, yb);
        line(ctx, xs[0] - 60 * s, yb, xs[3] + 60 * s, yb);
        line(ctx, xs[3] + 60 * s, yb - 16 * s, xs[3] + 60 * s, yb);
        ctx.restore();
        text(ctx, 'FİZİK', W / 2, cy + 220 * s, { size: 28 * s, weight: 800, spacing: 10, color: C.muted, alpha: fa });
      }
      // yeni soru ve onun taşıyacağı kapılar
      const qa = pa * after(t, 'recap-step', 1, 0.6);
      if (qa > 0) {
        glow(ctx, W / 2, 610, 220, FIRE, 0.2 * qa);
        text(ctx, '?', W / 2, 610, { size: 200, family: 'display', weight: 900, color: C.flame, alpha: qa });
      }
      for (let g = 2; g <= 10; g++) {
        const x = W / 2 + (g - 6) * 170;
        const da = pa * after(t, 'recap-step', 3, 0.5 + 0.1 * (g - 2)) * progress(t, cue('recap-step', 3) + (g - 2) * 0.12, cue('recap-step', 3) + (g - 2) * 0.12 + 0.4);
        if (da <= 0) continue;
        ctx.save();
        ctx.globalAlpha *= da * 0.6;
        ctx.strokeStyle = C.flame;
        ctx.lineWidth = 2;
        line(ctx, W / 2, 720, x, 840);
        ctx.restore();
        drawIcon(ctx, 'door', x, 900, 0.62, C.cream, da, 0);
        text(ctx, String(g), x, 978, { size: 24, weight: 800, color: C.muted, alpha: da });
      }
      text(ctx, 'bundan sonra anlatacağımız her şey', W / 2, 1030, { size: 30, family: 'serif', italic: true, color: C.muted, alpha: pa * after(t, 'recap-step', 3, 0.8) });
    }
    // asıl soru
    const qa = beatVis(lt, 'recap.question');
    if (qa > 0) {
      const FLOAT = [['38,5', 330, 300], ['0532…', 1560, 290], ['15.08.2026', 420, 820], ['65', 1500, 810], ['01000001', 960, 210], ['12', 240, 560], ['kırmızı', 1690, 560]];
      FLOAT.forEach(([s, x, y], i) => {
        const a = qa * after(t, 'recap-question', 0, 0.8) * 0.5;
        text(ctx, s, x + Math.sin(t * 0.6 + i) * 10, y + Math.cos(t * 0.5 + i * 2) * 8, { size: 40, family: 'mono', weight: 700, color: C.digital, alpha: a });
      });
      text(ctx, 'Elimizdeki bu sayılar', W / 2, 470, { size: 84, family: 'serif', color: C.cream, alpha: qa * after(t, 'recap-question', 0, 0.7) });
      text(ctx, 'ne anlama geliyor?', W / 2, 590, { size: 92, family: 'serif', italic: true, color: C.flame, alpha: qa * after(t, 'recap-question', 1, 0.7), glow: 'rgba(255,150,60,0.35)', glowBlur: 30 });
    }
  }

  // ---------------------------------------------------------------------------
  // 2 · Aynı sayı, üç dünya
  // ---------------------------------------------------------------------------

  const WORLD_X = [380, 960, 1540];
  const WORLD_Y = 600;

  function drawRoom(ctx, x, y, a, t) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    // pencere
    roundRect(ctx, x - 170, y - 160, 220, 190, 8);
    ctx.fillStyle = '#3b6fa8';
    ctx.fill();
    ctx.save();
    roundRect(ctx, x - 170, y - 160, 220, 190, 8);
    ctx.clip();
    drawSun(ctx, x - 60, y - 70, 38, 1, t);
    ctx.restore();
    ctx.strokeStyle = '#e8e2d4';
    ctx.lineWidth = 6;
    roundRect(ctx, x - 170, y - 160, 220, 190, 8);
    ctx.stroke();
    line(ctx, x - 60, y - 160, x - 60, y + 30);
    line(ctx, x - 170, y - 65, x + 50, y - 65);
    // sıcak hava dalgaları
    ctx.strokeStyle = 'rgba(255,165,71,0.7)';
    ctx.lineWidth = 4;
    for (let k = 0; k < 3; k++) {
      const bx = x + 100 + k * 34;
      ctx.beginPath();
      for (let s = 0; s <= 120; s += 4) {
        const yy = y + 60 - s - ((t * 30) % 20);
        const xx = bx + Math.sin(s * 0.08 + t * 3 + k) * 8;
        if (s === 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
    }
    ctx.restore();
    drawPerson(ctx, x + 120, y + 130, 1.2, C.cream, a);
    // ter damlası
    const dy = (t * 40) % 40;
    ctx.save();
    ctx.globalAlpha *= a * (1 - dy / 40);
    ctx.fillStyle = C.digital;
    ctx.beginPath();
    ctx.arc(x + 146, y + 66 + dy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBedChild(ctx, x, y, a, t) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    // pencere ve ay
    roundRect(ctx, x + 40, y - 170, 150, 130, 8);
    ctx.fillStyle = '#0a1226';
    ctx.fill();
    ctx.restore();
    drawMoon(ctx, x + 110, y - 108, 30, a, '#0a1226');
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = '#f3ede1';
    for (let k = 0; k < 5; k++) dot(ctx, x + 55 + hash(k, 3) * 125, y - 160 + hash(k, 4) * 110, 2);
    ctx.strokeStyle = '#e8e2d4';
    ctx.lineWidth = 5;
    roundRect(ctx, x + 40, y - 170, 150, 130, 8);
    ctx.stroke();
    // yatak
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(x - 200, y - 40, 22, 150);
    ctx.fillRect(x + 170, y + 20, 18, 90);
    ctx.fillStyle = '#e8e2d4';
    roundRect(ctx, x - 180, y + 10, 350, 40, 10);
    ctx.fill();
    ctx.fillStyle = '#f3ede1';
    roundRect(ctx, x - 172, y - 22, 90, 40, 16);
    ctx.fill();
    // yorgan
    ctx.fillStyle = '#7b5ea8';
    ctx.beginPath();
    ctx.moveTo(x - 120, y + 12);
    ctx.quadraticCurveTo(x - 60, y - 34, x + 40, y - 18);
    ctx.quadraticCurveTo(x + 150, y - 10, x + 170, y + 12);
    ctx.closePath();
    ctx.fill();
    // baş ve açık gözler
    ctx.fillStyle = '#e0b48c';
    dot(ctx, x - 128, y - 22, 24);
    ctx.fillStyle = '#1b1f2a';
    dot(ctx, x - 136, y - 26, 3.2);
    dot(ctx, x - 120, y - 26, 3.2);
    // alnındaki ıslak bez
    ctx.fillStyle = '#9fd4ff';
    roundRect(ctx, x - 150, y - 46, 42, 12, 4);
    ctx.fill();
    ctx.restore();
    // saat 03:00
    panel(ctx, x - 120, y + 120, 110, 50, a, { fill: '#08101e', stroke: '#3a4664', r: 10 });
    text(ctx, '03:00', x - 120, y + 122, { size: 28, family: 'mono', weight: 700, color: C.error, alpha: a * (0.6 + 0.4 * Math.abs(Math.sin(t * 2))) });
  }

  function drawOven(ctx, x, y, a, t) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    roundRect(ctx, x - 170, y - 170, 340, 300, 14);
    ctx.fillStyle = '#2a3247';
    ctx.fill();
    ctx.strokeStyle = '#6b7896';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = '#1b2235';
    ctx.fillRect(x - 170, y - 170, 340, 50);
    ctx.fillStyle = '#9aa3b8';
    for (let k = 0; k < 3; k++) dot(ctx, x - 100 + k * 50, y - 145, 11);
    // cam kapak
    roundRect(ctx, x - 130, y - 100, 260, 170, 12);
    ctx.fillStyle = '#0e1a2c';
    ctx.fill();
    ctx.strokeStyle = '#7cc8ff';
    ctx.globalAlpha *= 0.6;
    ctx.stroke();
    ctx.globalAlpha /= 0.6;
    // pişmemiş kek
    ctx.fillStyle = '#4a4f5c';
    ctx.fillRect(x - 70, y + 10, 140, 34);
    ctx.fillStyle = '#efe0a8';
    ctx.beginPath();
    ctx.moveTo(x - 70, y + 12);
    ctx.quadraticCurveTo(x, y - 6, x + 70, y + 12);
    ctx.closePath();
    ctx.fill();
    // soğuk: kar tanesi
    ctx.strokeStyle = 'rgba(124,200,255,0.9)';
    ctx.lineWidth = 3;
    const sx = x + 92;
    const sy = y - 60;
    for (let k = 0; k < 3; k++) {
      const ang = (k / 3) * Math.PI + t * 0.3;
      line(ctx, sx - Math.cos(ang) * 18, sy - Math.sin(ang) * 18, sx + Math.cos(ang) * 18, sy + Math.sin(ang) * 18);
    }
    ctx.restore();
  }

  function sceneThermo(ctx, lt, t) {
    kicker(ctx, 'AYNI SAYI', lt, 36);
    // A · tek başına bir sayı
    const aa = beatVis(lt, 'thermo.alone');
    if (aa > 0) {
      const fill = after(t, 'thermo-alone', 0, 1.6, ease.inOut);
      drawThermo(ctx, 700, 500, 1.15, 0.12 + 0.5 * fill, aa);
      readout(ctx, '38,5', 1180, 470, { size: 130, alpha: aa * after(t, 'thermo-alone', 1, 0.6), glow: FIRE, color: C.flame });
      const qa = aa * after(t, 'thermo-alone', 3, 0.6);
      [[1440, 330, -0.2], [1480, 600, 0.25], [940, 330, 0.15]].forEach(([x, y, r], i) => {
        ctx.save();
        ctx.translate(x, y + Math.sin(t * 2 + i) * 6);
        ctx.rotate(r);
        text(ctx, '?', 0, 0, { size: 90, family: 'display', weight: 900, color: C.muted, alpha: qa * after(t, 'thermo-alone', 3, 0.4 + i * 0.2) });
        ctx.restore();
      });
      caption(ctx, 'tek başına hiçbir şey söylemez', 860, qa);
    }
    // B · üç dünya
    const wa = spanVis(lt, 'thermo.room', 'thermo.three');
    if (wa > 0) {
      readout(ctx, '38,5', W / 2, 205, { size: 64, alpha: wa, color: C.flame });
      const lines = ['thermo-room', 'thermo-child', 'thermo-oven'];
      const caps = [['oda', 'boğucu bir yaz günü', C.fire], ['çocuk', 'uykusuz bir gece', C.violet], ['fırın', 'çok soğuk: 180° gerekir', C.digital]];
      const same = after(t, 'thermo-three', 0, 0.6);
      const diff = after(t, 'thermo-three', 1, 0.6);
      WORLD_X.forEach((x, i) => {
        const pa = wa * after(t, lines[i], 0, 0.7);
        if (pa <= 0) return;
        const st = [FIRE, VIO, DIGI][i];
        panel(ctx, x, WORLD_Y, 500, 470, pa, { fill: '#0f1628', stroke: diff > 0 ? rgba(st, 0.4 + 0.5 * diff) : C.line, lw: 3, r: 22 });
        if (i === 0) drawRoom(ctx, x - 20, WORLD_Y - 10, pa, t);
        if (i === 1) drawBedChild(ctx, x, WORLD_Y - 10, pa, t);
        if (i === 2) drawOven(ctx, x, WORLD_Y - 10, pa, t);
        // sayı kopyası üstten panele uçar
        const fly = after(t, lines[i], 0, 0.9, ease.inOut);
        const [bx, by] = travel([W / 2, 205], [x + 150, WORLD_Y - 190], fly, 40);
        readout(ctx, '38,5', bx, by, { size: lerp(64, 40, fly), alpha: pa, color: C.flame, glow: same > 0 ? FIRE : null });
        text(ctx, caps[i][0].toUpperCase(), x - 200, WORLD_Y - 192, { size: 24, weight: 800, spacing: 5, color: C.muted, align: 'left', alpha: pa });
        text(ctx, caps[i][1], x, WORLD_Y + 200, { size: 34, family: 'serif', italic: true, color: caps[i][2], alpha: wa * after(t, lines[i], 1, 0.6) });
        if (same > 0) {
          ctx.save();
          ctx.globalAlpha *= wa * same * 0.7;
          ctx.strokeStyle = C.flame;
          ctx.setLineDash([8, 10]);
          ctx.lineWidth = 2.5;
          line(ctx, W / 2, 255, x + 150, WORLD_Y - 220);
          ctx.restore();
        }
      });
      const ta = wa * after(t, 'thermo-three', 0, 0.6);
      runs(ctx, [
        ['Aynı sayı.', { size: 50, family: 'serif', color: C.cream, alpha: ta }],
        ['   Üç farklı dünya.', { size: 50, family: 'serif', italic: true, color: C.flame, alpha: wa * diff }],
      ], W / 2, 1000);
    }
    // C · veri, bilgi, anlam aynı şey değil
    const ra = beatVis(lt, 'thermo.rule');
    if (ra > 0) {
      text(ctx, 'bilişimin en temel ama en çok atlanan ayrımı', W / 2, 250, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: ra * after(t, 'thermo-rule', 1, 0.7) });
      const rise = [after(t, 'thermo-rule', 2, 0.8), after(t, 'thermo-rule', 3, 0.8), progress(t, cue('thermo-rule', 3) + 0.6, cue('thermo-rule', 3) + 1.4, ease.out)];
      const tops = drawLadder(ctx, W / 2 - 3 * 360 / 2 - 22, 900, { sw: 360, sh: 130, rise, hi: rise.map((r) => r * 0.6), alpha: ra });
      const na = ra * after(t, 'thermo-rule', 4, 0.6);
      for (let i = 0; i < 2; i++) {
        const x = tops[i].left + tops[i].w * 0.72;
        const y = tops[i].y - 70;
        text(ctx, '≠', x, y, { size: 96, family: 'display', weight: 900, color: C.error, alpha: na * after(t, 'thermo-rule', 4, 0.4 + 0.3 * i) });
      }
      text(ctx, 'asla aynı şey değildir', W / 2, 990, { size: 40, family: 'serif', italic: true, color: C.flame, alpha: na });
    }
  }

  // ---------------------------------------------------------------------------
  // 3 · Basamak bir: veri
  // ---------------------------------------------------------------------------

  const RAW = ['38,5', '0532…', '2026-08-15', 'kırmızı'];
  const RAW_X = [300, 700, 1180, 1630];

  // Bloklardan kule (yanlış veri üzerine kurulanlar); fall 0 → 1 devrilme
  function drawTower(ctx, x, yb, labels, alpha, fall, t, appear) {
    labels.forEach((lab, i) => {
      const a = alpha * appear(i);
      if (a <= 0.002) return;
      const bw = 300 - i * 24;
      const bh = 70;
      const f = clamp(fall * 1.25 - i * 0.08);
      const ang = f * (0.35 + i * 0.12);
      const dx = f * (60 + i * 90);
      const dy = f * f * (i * 60);
      const cy = yb - bh / 2 - i * bh;
      ctx.save();
      ctx.globalAlpha *= a * (1 - 0.6 * f);
      ctx.translate(x + dx, cy + dy);
      ctx.rotate(ang);
      roundRect(ctx, -bw / 2, -bh / 2 + 3, bw, bh - 6, 8);
      ctx.fillStyle = '#1d2740';
      ctx.fill();
      ctx.strokeStyle = C.error;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.translate(x + dx, cy + dy);
      ctx.rotate(ang);
      text(ctx, lab, 0, 2, { size: 28, weight: 700, color: C.cream, alpha: a * (1 - 0.6 * f) });
      ctx.restore();
    });
  }

  function sceneData(ctx, lt, t) {
    kicker(ctx, 'BASAMAK BİR', lt, 40);
    miniLadder(ctx, 0, vis(lt, 0.5, 39.6, 0.6, 0.5));
    // A · tanım
    const da = beatVis(lt, 'data.def');
    if (da > 0) {
      const tops = drawLadder(ctx, W / 2 - 3 * 220 / 2 - 14, 980, { sw: 220, sh: 60, d: 28, labels: [0, 0, 0], hi: [after(t, 'data-def', 1, 0.6), 0, 0], alpha: da * 0.8 });
      glow(ctx, tops[0].x, tops[0].y, 120, DIGI, 0.3 * da * after(t, 'data-def', 1, 0.6));
      text(ctx, 'VERİ', W / 2, 330, { size: 150, family: 'display', weight: 900, spacing: 10, color: C.digital, alpha: da * after(t, 'data-def', 1, 0.6), glow: 'rgba(124,200,255,0.35)', glowBlur: 30 });
      caption(ctx, 'işlenmemiş, ham ölçüm', 480, da * after(t, 'data-def', 3, 0.6), { size: 52 });
      caption(ctx, 'tek başına bir yargı taşımaz', 570, da * after(t, 'data-def', 4, 0.6), { size: 40, color: C.muted });
      caption(ctx, 'yani bize ne yapmamız gerektiğini söylemez', 630, da * after(t, 'data-def', 5, 0.6), { size: 32, color: C.muted });
      const sa = da * after(t, 'data-def', 3, 1.0);
      ['38,5', '07:45', '0532…', '12', '65', 'kırmızı', '180', '2026-08-15'].forEach((s, i) => {
        const x = 260 + i * 200 + ((t * 30) % 200) - 100;
        text(ctx, s, x, 760, { size: 34, family: 'mono', weight: 600, color: C.digital, alpha: sa * 0.55 * clamp(Math.min((x - 120) / 160, (W - 120 - x) / 160)) });
      });
    }
    // B · örnekler
    const ea = beatVis(lt, 'data.examples');
    if (ea > 0) {
      RAW.forEach((s, i) => {
        const k = after(t, 'data-examples', i * 2, 0.6, ease.back);
        const a = ea * clamp(k * 2);
        dataCard(ctx, s, RAW_X[i], 470, { size: 54, alpha: a, scale: lerp(0.6, 1, clamp(k)), color: i === 3 ? '#ff7a6b' : C.cream });
        const sk = progress(t, cue('data-examples', [1, 3, 5, 8][i]), cue('data-examples', [1, 3, 5, 8][i]) + 0.5, ease.out);
        stamp(ctx, 'VERİ', RAW_X[i], 620, C.digital, sk, { alpha: ea });
      });
      caption(ctx, 'hiçbiri tek başına bir şey söylemiyor', 860, ea * after(t, 'data-examples', 8, 0.8), { color: C.muted, size: 38 });
    }
    // C · veri nereden gelir?
    const sa = beatVis(lt, 'data.source');
    if (sa > 0) {
      text(ctx, 'veriyi çoğu zaman bir ölçüm aracı üretir', W / 2, 220, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: sa * after(t, 'data-source', 0, 0.6) });
      const SRC = [['thermo', '38,5'], ['clock', '07:45'], ['camera', '1920 × 1080']];
      SRC.forEach(([ic, out], i) => {
        const y = 360 + i * 150;
        const a = sa * after(t, 'data-source', 1 + i, 0.6);
        panel(ctx, 330, y, 120, 120, a, { fill: '#121a2c', stroke: C.line, r: 20 });
        drawIcon(ctx, ic, 330, y, 0.9, C.cream, a);
        const fk = after(t, 'data-source', 1 + i, 1.2, ease.inOut);
        arrow(ctx, 410, y, lerp(410, 600, fk), y, C.digital, a, 4, 14);
        dataCard(ctx, out, 760, y, { size: 38, alpha: a * clamp(fk * 2 - 0.6) });
      });
      // insan bir forma yazar
      const pa = sa * after(t, 'data-source', 4, 0.6);
      if (pa > 0) {
        drawPerson(ctx, 1220, 560, 2.0, C.cream, pa, { arm: 0.5 });
        paperCard(ctx, 1330, 380, 420, 300);
        const typed = 'Ayşe';
        const n = Math.floor(clamp((t - cue('data-source', 4) - 0.6) / 0.9) * typed.length + 0.0001);
        ctx.save();
        ctx.globalAlpha *= pa;
        ctx.restore();
        text(ctx, 'FORM', 1540, 420, { size: 24, weight: 800, spacing: 6, color: C.inkSoft, alpha: pa });
        text(ctx, 'Ad:', 1370, 490, { size: 34, color: C.ink, align: 'left', alpha: pa });
        text(ctx, typed.slice(0, n), 1440, 490, { size: 40, family: 'serif', italic: true, color: '#1f4fb5', align: 'left', alpha: pa });
        text(ctx, 'Sınıf:', 1370, 570, { size: 34, color: C.ink, align: 'left', alpha: pa });
        text(ctx, n >= typed.length ? '7-A' : '', 1470, 570, { size: 40, family: 'serif', italic: true, color: '#1f4fb5', align: 'left', alpha: pa * progress(t, cue('data-source', 4) + 1.6, cue('data-source', 4) + 1.9) });
        ctx.save();
        ctx.globalAlpha *= pa * 0.4;
        ctx.fillStyle = C.ink;
        ctx.fillRect(1430, 510, 280, 2);
        ctx.fillRect(1460, 590, 250, 2);
        ctx.restore();
      }
      // ilk bölümden hatırlatma
      const qa = sa * after(t, 'data-source', 5, 0.6);
      pill(ctx, '1. BÖLÜM', W / 2, 860, { size: 22, color: C.muted, alpha: qa });
      runs(ctx, [
        ['Ölçülebilen her şey ', { size: 46, family: 'serif', color: C.cream, alpha: sa * after(t, 'data-source', 6, 0.6) }],
        ['sayıya çevrilebilir.', { size: 46, family: 'serif', italic: true, color: C.flame, alpha: sa * progress(t, cue('data-source', 6) + 0.9, cue('data-source', 6) + 1.5) }],
      ], W / 2, 950);
    }
    // D · masumiyet
    const ia = beatVis(lt, 'data.innocent');
    if (ia > 0) {
      dataCard(ctx, '38,5', W / 2, 400, { size: 80, alpha: ia * after(t, 'data-innocent', 0, 0.6) });
      const ha = ia * after(t, 'data-innocent', 1, 0.8);
      if (ha > 0) {
        glow(ctx, W / 2, 268, 120, [255, 230, 160], 0.3 * ha);
        ctx.save();
        ctx.globalAlpha *= ha;
        ctx.strokeStyle = '#ffe3a0';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(W / 2, 266 + Math.sin(t * 2) * 4, 86, 20, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        text(ctx, 'masum', W / 2, 196, { size: 34, family: 'serif', italic: true, color: '#ffe3a0', alpha: ha });
      }
      const la = ia * after(t, 'data-innocent', 3, 0.6);
      panel(ctx, 600, 700, 520, 190, la, { fill: '#121a2c', stroke: C.line, r: 20 });
      runs(ctx, [['iyi', { size: 50, weight: 800, color: C.ok, alpha: la }], ['   ya da   ', { size: 34, family: 'serif', italic: true, color: C.muted, alpha: la }], ['kötü', { size: 50, weight: 800, color: C.error, alpha: la }]], 600, 718);
      cross(ctx, 600, 700, 2.6, C.error, la * 0.9, after(t, 'data-innocent', 3, 0.7, ease.inOut));
      text(ctx, 'veri bunlardan biri değildir', 600, 840, { size: 30, family: 'serif', italic: true, color: C.muted, alpha: la });
      const ra = ia * after(t, 'data-innocent', 4, 0.6);
      panel(ctx, 1320, 700, 560, 190, ra, { fill: '#121a2c', stroke: C.digital, r: 20 });
      runs(ctx, [['doğru', { size: 50, weight: 800, color: C.cream, alpha: ra }], ['   ya da   ', { size: 34, family: 'serif', italic: true, color: C.muted, alpha: ra }], ['yanlış', { size: 50, weight: 800, color: C.cream, alpha: ra }]], 1320, 718);
      tick(ctx, 1620, 610, 1.4, C.ok, ra, after(t, 'data-innocent', 4, 0.8, ease.inOut));
      text(ctx, 'ama bunlardan biri olabilir', 1320, 840, { size: 30, family: 'serif', italic: true, color: C.muted, alpha: ra });
    }
    // E · bozuk termometre
    const ba = beatVis(lt, 'data.broken');
    if (ba > 0) {
      const crack = t > cue('data-broken', 1) + 0.2;
      const tha = ba * after(t, 'data-broken', 0, 0.6);
      drawThermo(ctx, 300, 520, 0.95, crack ? 0.62 : 0.4, tha, { cracked: crack });
      tick(ctx, 420, 300, 1.1, C.ok, tha * (crack ? 0 : 1), after(t, 'data-broken', 0, 0.6));
      text(ctx, crack ? 'bozuk' : 'doğru ölçüm', 300, 830, { size: 34, weight: 800, color: crack ? C.error : C.ok, alpha: tha });
      // sağlıklı çocuk top oynuyor
      const ca = ba * after(t, 'data-broken', 3, 0.6);
      if (ca > 0) {
        const jump = Math.abs(Math.sin(t * 3.2)) * 26;
        drawPerson(ctx, 760, 700 - jump, 1.9, C.cream, ca, { child: true, arm: 0.8 });
        ctx.save();
        ctx.globalAlpha *= ca;
        ctx.fillStyle = C.ember;
        dot(ctx, 860, 560 + Math.abs(Math.cos(t * 3.2)) * 120, 26);
        ctx.restore();
        text(ctx, 'tamamen sağlıklı', 780, 860, { size: 32, family: 'serif', italic: true, color: C.ok, alpha: ca });
      }
      const ra = ba * after(t, 'data-broken', 4, 0.6);
      bubble(ctx, 560, 300, 230, 110, ra, { fill: '#2a1218', stroke: C.error, tail: [380, 380] });
      text(ctx, '38,5!', 560, 302, { size: 54, family: 'mono', weight: 700, color: C.error, alpha: ra });
      // yanlış veri üzerine kurulanlar
      const wa = ba * after(t, 'data-broken', 5, 0.6);
      dataCard(ctx, '38,5 ✗', 1420, 900, { size: 44, alpha: wa, stroke: rgba([255, 84, 104], 0.9), color: C.error });
      const tw = cue('data-broken', 5) + 0.3;
      const fall = progress(t, cue('data-broken', 6) + 1.4, cue('data-broken', 6) + 2.6, ease.in);
      drawTower(ctx, 1420, 846, ['ateşi var', 'ilaç verelim', 'okula gitmesin', 'telaş'], ba, fall, t, (i) => progress(t, tw + i * 0.35, tw + i * 0.35 + 0.4, ease.out));
      text(ctx, 'üzerine kurulan her şey de yanlış', 1420, 330, { size: 34, family: 'serif', italic: true, color: C.cream, alpha: ba * after(t, 'data-broken', 6, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 4 · Basamak iki: bilgi
  // ---------------------------------------------------------------------------

  function drawClockFace(ctx, x, y, r, alpha) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#f3ede1';
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#5a4a3a';
    ctx.stroke();
    ctx.strokeStyle = C.ink;
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      ctx.lineWidth = k % 3 === 0 ? 5 : 2.5;
      line(ctx, x + Math.sin(a) * r * 0.78, y - Math.cos(a) * r * 0.78, x + Math.sin(a) * r * 0.9, y - Math.cos(a) * r * 0.9);
    }
    ctx.lineCap = 'round';
    ctx.lineWidth = 9;
    line(ctx, x, y, x, y - r * 0.45);
    ctx.lineWidth = 5;
    line(ctx, x, y, x, y - r * 0.68);
    ctx.fillStyle = C.ember;
    dot(ctx, x, y, 8);
    ctx.restore();
  }

  function drawCake(ctx, x, y, alpha, t) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = '#c96b8a';
    roundRect(ctx, x - 130, y - 20, 260, 110, 12);
    ctx.fill();
    ctx.fillStyle = '#f7e6ee';
    roundRect(ctx, x - 130, y - 28, 260, 30, 12);
    ctx.fill();
    for (let k = 0; k < 7; k++) {
      ctx.beginPath();
      ctx.arc(x - 110 + k * 37, y, 12, 0, Math.PI);
      ctx.fill();
    }
    ctx.fillStyle = '#e8e2d4';
    roundRect(ctx, x - 160, y + 88, 320, 14, 7);
    ctx.fill();
    ctx.restore();
    for (const dx of [-30, 30]) {
      const f = 1 + 0.15 * Math.sin(t * 12 + dx);
      glow(ctx, x + dx, y - 116, 40, FIRE, 0.5 * alpha);
      ctx.save();
      ctx.globalAlpha *= alpha;
      ctx.fillStyle = '#ffd27a';
      ctx.beginPath();
      ctx.ellipse(x + dx, y - 116, 7, 14 * f, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawJersey(ctx, x, y, alpha) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(-60, -130);
    ctx.quadraticCurveTo(0, -100, 60, -130);
    ctx.lineTo(150, -90);
    ctx.lineTo(120, -20);
    ctx.lineTo(90, -40);
    ctx.lineTo(90, 120);
    ctx.lineTo(-90, 120);
    ctx.lineTo(-90, -40);
    ctx.lineTo(-120, -20);
    ctx.lineTo(-150, -90);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7a1f15';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  const CTX_X = [420, 960, 1500];

  function sceneInfo(ctx, lt, t) {
    kicker(ctx, 'BASAMAK İKİ', lt, 46);
    miniLadder(ctx, 1, vis(lt, 0.5, 45.6, 0.6, 0.5));
    // A · tanım: veri bir çerçeveye oturur
    const da = beatVis(lt, 'info.def');
    if (da > 0) {
      text(ctx, 'BİLGİ', W / 2, 300, { size: 150, family: 'display', weight: 900, spacing: 10, color: C.fire, alpha: da * after(t, 'info-def', 1, 0.6), glow: 'rgba(255,150,60,0.35)', glowBlur: 30 });
      caption(ctx, 'verinin bağlamına oturtulmuş hâli', 450, da * after(t, 'info-def', 3, 0.6), { size: 48 });
      const fa = da * after(t, 'info-def', 2, 0.6);
      panel(ctx, W / 2, 700, 560, 220, fa, { fill: 'rgba(255,165,71,0.06)', stroke: C.fire, lw: 4, r: 20, dash: [14, 10] });
      [['neyin?', -190, 620], ['kimin?', 190, 620], ['ne zaman?', 0, 790]].forEach(([s, dx, y]) => text(ctx, s, W / 2 + dx, y, { size: 24, weight: 700, color: C.fire, alpha: fa * 0.7 }));
      const seat = after(t, 'info-def', 3, 1.0, ease.inOut);
      const [cx, cy] = travel([W / 2, 1000], [W / 2, 705], seat, 60);
      dataCard(ctx, '38,5', cx, cy, { size: 60, alpha: da * clamp(seat * 3), stroke: seat > 0.95 ? rgba(FIRE, 0.9) : rgba(DIGI, 0.8) });
    }
    // B · ön bilgi: bağlam ve 12
    const ca = beatVis(lt, 'info.context');
    if (ca > 0) {
      pill(ctx, 'ÖN BİLGİ', 230, 200, { size: 22, color: C.flame, alpha: ca * after(t, 'info-context', 0, 0.5) });
      runs(ctx, [
        ['Bağlam: ', { size: 46, family: 'display', weight: 800, color: C.fire, alpha: ca * after(t, 'info-context', 0, 0.6) }],
        ['bir şeyin içinde durduğu çevre', { size: 46, family: 'serif', italic: true, color: C.cream, alpha: ca * after(t, 'info-context', 1, 0.6) }],
      ], W / 2, 220);
      const na = ca * after(t, 'info-context', 2, 0.6, ease.back);
      const pulse = after(t, 'info-context', 9, 0.8);
      if (pulse > 0) glow(ctx, W / 2, 380, 200, FIRE, 0.25 * ca * pulse);
      text(ctx, '12', W / 2, 380, { size: 150, family: 'mono', weight: 700, color: C.cream, alpha: na });
      const ctxLines = [[3, 4], [5, 6], [7, 8]];
      const caps = ['öğle vakti', 'bir yaş', 'bir oyuncu'];
      CTX_X.forEach((x, i) => {
        const [k0, k1] = ctxLines[i];
        const a = ca * after(t, 'info-context', k0, 0.6);
        if (a <= 0) return;
        const y = 720;
        const ring = after(t, 'info-context', 10, 0.8);
        panel(ctx, x, y, 400, 380, a, { fill: '#0f1628', stroke: ring > 0 ? rgba(FIRE, 0.3 + 0.6 * ring) : C.line, lw: 3, r: 22 });
        const fly = after(t, 'info-context', k0, 1.0, ease.inOut);
        let target;
        if (i === 0) {
          drawClockFace(ctx, x, y - 20, 130, a);
          target = [x, y - 112];
        } else if (i === 1) {
          drawCake(ctx, x, y + 30, a, t);
          target = [x, y - 46];
        } else {
          drawJersey(ctx, x, y + 10, a);
          target = [x, y + 10];
        }
        const [px, py] = travel([W / 2, 380], target, fly, 60);
        const size = i === 0 ? lerp(150, 44, fly) : i === 1 ? lerp(150, 70, fly) : lerp(150, 110, fly);
        const col = i === 0 ? C.ink : i === 1 ? '#ffd27a' : '#ffffff';
        text(ctx, '12', px, py, { size, family: i === 0 ? 'sans' : 'display', weight: 800, color: fly > 0.6 ? col : C.cream, alpha: a });
        if (i === 1 && fly > 0.9) {
          // mum gövdeleri rakamın altında
          ctx.save();
          ctx.globalAlpha *= a;
          ctx.fillStyle = '#7cc8ff';
          ctx.fillRect(x - 36, y - 20, 12, 8);
          ctx.fillRect(x + 24, y - 20, 12, 8);
          ctx.restore();
        }
        caption(ctx, caps[i], y + 240, ca * after(t, 'info-context', k1, 0.6), { size: 36, color: C.flame, x });
      });
      runs(ctx, [
        ['Sayı hiç değişmedi; ', { size: 40, family: 'serif', color: C.cream, alpha: ca * after(t, 'info-context', 9, 0.6) }],
        ['değişen, çevresiydi.', { size: 40, family: 'serif', italic: true, color: C.fire, alpha: ca * after(t, 'info-context', 10, 0.6) }],
      ], W / 2, 1035);
    }
    // C · neyin, kimin, ne zaman
    const qa = spanVis(lt, 'info.questions', 'info.sentence');
    if (qa > 0) {
      const merge = after(t, 'info-sentence', 0, 1.0, ease.inOut);
      const Q = [['neyin?', 420, 330, 'vücut sıcaklığı', 3], ['kimin?', W / 2, 250, 'Ayşe’nin', 5], ['ne zaman?', 1500, 330, 'bu sabah · 07:30', 7]];
      const glowK = after(t, 'info-questions', 1, 0.8) * (0.5 + 0.5 * after(t, 'info-questions', 7, 0.8));
      const card = [W / 2, 640];
      if (merge < 1) {
        const ma = qa * (1 - merge);
        if (glowK > 0) glow(ctx, card[0], card[1], 260, FIRE, 0.25 * ma * glowK);
        dataCard(ctx, '38,5', card[0], card[1], { size: 90, alpha: ma, stroke: glowK > 0.5 ? rgba(FIRE, 0.9) : rgba(DIGI, 0.8) });
        Q.forEach(([q, x, y, ans, k], i) => {
          const a = ma * progress(t, cue('info-questions', 0) + 0.3 * i, cue('info-questions', 0) + 0.3 * i + 0.6, ease.out);
          if (a <= 0) return;
          ctx.save();
          ctx.globalAlpha *= a * 0.6;
          ctx.strokeStyle = C.fire;
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 8]);
          line(ctx, x, y + 30, card[0] + (x - card[0]) * 0.25, card[1] - 70);
          ctx.restore();
          const hi = after(t, 'info-questions', k - 1, 0.4);
          pill(ctx, q, x, y, { size: 36, color: C.fire, fill: hi > 0 ? rgba(FIRE, 0.15 * hi) : 'rgba(18,26,44,0.95)', alpha: a });
          const aa = ma * after(t, 'info-questions', k, 0.6);
          if (i === 0) drawIcon(ctx, 'thermo', x - 150, y + 100, 0.6, C.cream, aa);
          if (i === 1) drawPerson(ctx, x - 130, y + 110, 0.9, C.cream, aa, { child: true, hair: true });
          if (i === 2) drawSun(ctx, x - 160, y + 100, 18, aa, t);
          text(ctx, ans, x - 100, y + 100, { size: 38, family: 'serif', italic: true, color: C.cream, align: 'left', alpha: aa });
        });
        caption(ctx, 'bilgi doğar', 860, ma * after(t, 'info-questions', 1, 0.6), { color: C.fire, size: 44 });
      }
      // D · cümle
      const sa = qa * merge;
      if (sa > 0) {
        ctx.save();
        ctx.globalAlpha *= sa;
        ctx.translate(0, (1 - merge) * 30);
        paperCard(ctx, 330, 380, 1260, 260);
        ctx.fillStyle = C.fire;
        ctx.fillRect(330, 398, 8, 224);
        ctx.restore();
        runs(ctx, [
          ['Ayşe’nin bu sabahki ateşi: ', { size: 58, family: 'serif', color: C.ink, alpha: sa }],
          ['38,5 °C', { size: 62, family: 'mono', weight: 700, color: C.ember, alpha: sa * after(t, 'info-sentence', 1, 0.5) }],
        ], W / 2, 530);
        stamp(ctx, 'BİLGİ', 1460, 650, C.fire, after(t, 'info-sentence', 3, 0.5), { alpha: qa, size: 40 });
        caption(ctx, 'artık bir şey söylüyor', 820, qa * after(t, 'info-sentence', 4, 0.6), { size: 44 });
      }
    }
    // E · karşılaştırma ve eşik
    const ka = beatVis(lt, 'info.compare');
    if (ka > 0) {
      const box = { x: 380, y: 300, w: 1160, h: 520 };
      const yr = [36, 39.5];
      axes(ctx, box, ka * after(t, 'info-compare', 0, 0.6));
      const py = (v) => box.y + box.h - ((v - yr[0]) / (yr[1] - yr[0])) * box.h;
      [36, 37, 38, 39].forEach((v) => text(ctx, `${v}`, box.x - 30, py(v), { size: 26, family: 'mono', color: C.muted, align: 'right', alpha: ka * after(t, 'info-compare', 0, 0.6) }));
      text(ctx, '°C', box.x - 30, box.y - 30, { size: 24, color: C.muted, align: 'right', alpha: ka * after(t, 'info-compare', 0, 0.6) });
      const P = [[0.3, 38.2, 'dün sabah'], [0.72, 38.5, 'bu sabah']];
      const x = (f) => box.x + f * box.w;
      const p1 = after(t, 'info-compare', 1, 0.6);
      const p2 = after(t, 'info-compare', 2, 0.6);
      const dr = after(t, 'info-compare', 2, 1.0, ease.inOut);
      if (dr > 0) plotLine(ctx, box, [[0.3, 38.2], [0.72, 38.5]], [0, 1], yr, { color: C.fire, lw: 5, draw: dr, alpha: ka });
      P.forEach(([f, v, lab], i) => {
        const a = ka * (i === 0 ? p1 : p2);
        if (a <= 0) return;
        ctx.save();
        ctx.globalAlpha *= a;
        ctx.fillStyle = i === 0 ? C.cream : C.fire;
        dot(ctx, x(f), py(v), 13);
        ctx.restore();
        text(ctx, String(v).replace('.', ','), x(f), py(v) - 44, { size: 40, family: 'mono', weight: 700, color: i === 0 ? C.cream : C.flame, alpha: a });
        text(ctx, lab, x(f), box.y + box.h + 40, { size: 30, color: C.muted, alpha: a });
      });
      const ua = ka * after(t, 'info-compare', 2, 0.8);
      arrow(ctx, x(0.51) - 90, py(38.35) - 60, x(0.51) - 90, py(38.35) - 110, C.fire, ua, 4, 14);
      text(ctx, 'yükseliyor', x(0.51) - 70, py(38.35) - 84, { size: 36, family: 'serif', italic: true, color: C.fire, align: 'left', alpha: ua });
      // eşik
      const ea = ka * after(t, 'info-compare', 3, 0.6);
      if (ea > 0) {
        const ey = py(38);
        const ew = after(t, 'info-compare', 3, 1.0, ease.inOut);
        ctx.save();
        ctx.globalAlpha *= ea;
        ctx.fillStyle = rgba([255, 84, 104], 0.1 * after(t, 'info-compare', 5, 0.8));
        ctx.fillRect(box.x, box.y, box.w, ey - box.y);
        ctx.strokeStyle = C.error;
        ctx.lineWidth = 4;
        ctx.setLineDash([16, 12]);
        line(ctx, box.x, ey, box.x + box.w * ew, ey);
        ctx.restore();
        text(ctx, 'eşik: 38 °C', box.x + box.w + 20, ey, { size: 30, weight: 800, color: C.error, align: 'left', alpha: ea });
        text(ctx, 'ATEŞ', box.x + box.w - 110, box.y + 50, { size: 40, family: 'display', weight: 900, spacing: 8, color: C.error, alpha: ka * after(t, 'info-compare', 5, 0.6) });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 5 · Basamak üç: anlam ve karar
  // ---------------------------------------------------------------------------

  const DAYS = [38.2, 38.5, 38.6];

  function sceneJudge(ctx, lt, t) {
    kicker(ctx, 'BASAMAK ÜÇ', lt, 30);
    miniLadder(ctx, 2, vis(lt, 0.5, 29.6, 0.6, 0.5));
    // A · tanım: bilgi + deneyim + yargı = anlam
    const da = beatVis(lt, 'judge.def');
    if (da > 0) {
      runs(ctx, [
        ['ANLAM', { size: 130, family: 'display', weight: 900, spacing: 8, color: C.violet, alpha: da * after(t, 'judge-def', 1, 0.6) }],
        [' ve ', { size: 70, family: 'serif', italic: true, color: C.cream, alpha: da * after(t, 'judge-def', 1, 0.6) }],
        ['KARAR', { size: 130, family: 'display', weight: 900, spacing: 8, color: C.violet, alpha: da * after(t, 'judge-def', 1, 0.6) }],
      ], W / 2, 350);
      const c3 = cue('judge-def', 3);
      const el = (k) => da * progress(t, c3 + k * 0.9, c3 + k * 0.9 + 0.5, ease.out);
      const y = 640;
      panel(ctx, 330, y, 380, 150, el(0), { fill: 'rgba(255,165,71,0.08)', stroke: C.fire, r: 18 });
      text(ctx, 'bilgi', 330, y - 30, { size: 26, weight: 800, spacing: 4, color: C.fire, alpha: el(0) });
      text(ctx, 'Ayşe’nin ateşi 38,5', 330, y + 20, { size: 32, family: 'serif', color: C.cream, alpha: el(0) });
      text(ctx, '+', 600, y, { size: 80, weight: 800, color: C.muted, alpha: el(1) });
      drawIcon(ctx, 'book', 800, y - 20, 1.3, C.cream, el(1));
      text(ctx, 'deneyim', 800, y + 70, { size: 32, weight: 700, color: C.cream, alpha: el(1) });
      text(ctx, '+', 1000, y, { size: 80, weight: 800, color: C.muted, alpha: el(2) });
      drawIcon(ctx, 'scale', 1200, y - 10, 1.3, C.cream, el(2), Math.sin(t * 1.5));
      text(ctx, 'yargı', 1200, y + 70, { size: 32, weight: 700, color: C.cream, alpha: el(2) });
      text(ctx, '=', 1390, y, { size: 80, weight: 800, color: C.muted, alpha: el(3) });
      if (el(3) > 0) glow(ctx, 1600, y, 200, VIO, 0.3 * el(3));
      text(ctx, 'anlam', 1600, y, { size: 70, family: 'serif', italic: true, weight: 700, color: C.violet, alpha: el(3) });
    }
    // B · üç gün ve aile
    const ya = beatVis(lt, 'judge.days');
    if (ya > 0) {
      const box = { x: 220, y: 300, w: 760, h: 380 };
      const yr = [37, 39.5];
      const py = (v) => box.y + box.h - ((v - yr[0]) / (yr[1] - yr[0])) * box.h;
      const ca = ya * after(t, 'judge-days', 0, 0.6);
      axes(ctx, box, ca);
      ctx.save();
      ctx.globalAlpha *= ca;
      ctx.strokeStyle = C.error;
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 10]);
      line(ctx, box.x, py(38), box.x + box.w, py(38));
      ctx.restore();
      text(ctx, 'eşik 38', box.x - 12, py(38), { size: 24, weight: 700, color: C.error, align: 'right', alpha: ca });
      DAYS.forEach((v, i) => {
        const x = box.x + 140 + i * 240;
        const a = ya * (i < 2 ? ca : progress(t, cue('judge-days', 0) + 0.9, cue('judge-days', 0) + 1.4, ease.out));
        if (a <= 0) return;
        ctx.save();
        ctx.globalAlpha *= a;
        ctx.fillStyle = rgba(FIRE, 0.85);
        const top = py(v);
        roundRect(ctx, x - 50, top, 100, box.y + box.h - top, [10, 10, 0, 0]);
        ctx.fill();
        ctx.restore();
        text(ctx, String(v).replace('.', ','), x, top - 30, { size: 34, family: 'mono', weight: 700, color: C.flame, alpha: a });
        text(ctx, `${i + 1}. gün`, x, box.y + box.h + 36, { size: 28, color: C.muted, alpha: a });
      });
      // aile ve düşünce bulutu
      const fa = ya * after(t, 'judge-days', 1, 0.6);
      drawPerson(ctx, 1430, 690, 2.1, C.cream, fa);
      drawPerson(ctx, 1580, 700, 1.9, C.cream, fa, { hair: true });
      text(ctx, 'Ayşe’nin ailesi', 1505, 800, { size: 30, color: C.muted, alpha: fa });
      const ba = ya * after(t, 'judge-days', 3, 0.8);
      cloud(ctx, 1500, 400, 1.3, ba, '#1c1830', rgba(VIO, 0.7));
      drawIcon(ctx, 'book', 1440, 395, 0.7, C.cream, ba);
      drawIcon(ctx, 'scale', 1570, 395, 0.7, C.cream, ba, Math.sin(t * 1.5));
      ctx.save();
      ctx.globalAlpha *= ba * 0.6;
      ctx.fillStyle = '#1c1830';
      dot(ctx, 1470, 560, 14);
      dot(ctx, 1455, 600, 9);
      ctx.restore();
      // yargı cümlesi
      const sa = ya * after(t, 'judge-days', 5, 0.7);
      if (sa > 0) {
        ctx.save();
        ctx.globalAlpha *= sa;
        ctx.translate(0, (1 - sa) * 20);
        paperCard(ctx, 230, 860, 1460, 170);
        ctx.fillStyle = C.violet;
        ctx.fillRect(230, 876, 8, 138);
        ctx.restore();
        runs(ctx, [
          ['“Ayşe’nin ateşi üçüncü gün de düşmedi; ', { size: 44, family: 'serif', color: C.ink, alpha: sa }],
          ['onu doktora götürmeliyiz.”', { size: 44, family: 'serif', italic: true, weight: 700, color: '#5b3fa8', alpha: ya * after(t, 'judge-days', 6, 0.6) }],
        ], W / 2 - 40, 960);
        drawIcon(ctx, 'cross', 1610, 944, 0.7, C.error, ya * after(t, 'judge-days', 6, 0.6));
      }
    }
    // C · bu bir yargıdır; sahibi bir insandır
    const va = beatVis(lt, 'judge.verdict');
    if (va > 0) {
      const R = [['veri değil', 0, false], ['bilgi bile değil', 1, false], ['bir yargı', 2, true]];
      R.forEach(([s, k, ok], i) => {
        const a = va * after(t, 'judge-verdict', k, 0.6);
        const y = 300 + i * 130;
        text(ctx, s, 760, y, { size: ok ? 64 : 54, family: ok ? 'serif' : 'sans', italic: ok, weight: ok ? 700 : 600, color: ok ? C.violet : C.muted, align: 'left', alpha: a });
        if (ok) tick(ctx, 680, y, 1.3, C.violet, a, after(t, 'judge-verdict', k, 0.8, ease.inOut));
        else cross(ctx, 680, y, 1.1, C.error, a, after(t, 'judge-verdict', k, 0.8, ease.inOut));
      });
      const pa = va * after(t, 'judge-verdict', 3, 0.7);
      if (pa > 0) {
        glow(ctx, W / 2, 790, 240, VIO, 0.35 * pa * (0.8 + 0.2 * Math.sin(t * 2)));
        drawPerson(ctx, W / 2, 800, 2.4, C.cream, pa);
      }
      text(ctx, 'sorumluluk taşıyan bir insana aittir', W / 2, 980, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: va * after(t, 'judge-verdict', 5, 0.6) });
      pill(ctx, 'SORUMLULUK', W / 2, 655, { size: 26, color: C.violet, alpha: va * after(t, 'judge-verdict', 5, 0.5) });
    }
  }

  // ---------------------------------------------------------------------------
  // 6 · Merdiven ve makine
  // ---------------------------------------------------------------------------

  const LAD = { x0: 300, yb: 930, sw: 440, sh: 165, d: 50 };

  // Uyarı üçgeni
  function warnSign(ctx, x, y, s, alpha) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = '#ffb02e';
    ctx.beginPath();
    ctx.moveTo(x, y - 22 * s);
    ctx.lineTo(x + 24 * s, y + 18 * s);
    ctx.lineTo(x - 24 * s, y + 18 * s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    text(ctx, '!', x, y + 4 * s, { size: 28 * s, weight: 900, color: C.ink, alpha });
  }

  function sceneLadder(ctx, lt, t) {
    kicker(ctx, 'MERDİVEN', lt, 34);
    const a = spanVis(lt, 'ladder.three', 'ladder.gray');
    if (a <= 0) return;
    const rise = [0, 1, 2].map((i) => progress(lt, 0.3 + i * 0.3, 1.2 + i * 0.3, ease.out));
    const hiK = [2, 4, 6].map((k) => after(t, 'ladder-three', k, 0.5));
    const mach = after(t, 'ladder-machine', 0, 0.6);
    const help = after(t, 'ladder-help', 0, 0.6);
    const hi = [hiK[0] * (1 - 0.5 * help) + 0.5 * mach, hiK[1] * (1 - 0.5 * help) + 0.5 * mach, hiK[2]];
    const tops = drawLadder(ctx, LAD.x0, LAD.yb, { sw: LAD.sw, sh: LAD.sh, d: LAD.d, rise, hi: hi.map((v) => clamp(v)), alpha: a, names: ['VERİ', 'BİLGİ', 'ANLAM VE KARAR'], labelSize: 34 });
    // basamakların örnekleri
    const dim = 1 - mach;
    dataCard(ctx, '38,5', tops[0].x, tops[0].y - 60, { size: 44, alpha: a * after(t, 'ladder-three', 1, 0.6) * dim });
    dataCard(ctx, 'Ayşe’nin bu sabahki ateşi: 38,5', tops[1].x, tops[1].y - 60, { size: 24, family: 'sans', alpha: a * after(t, 'ladder-three', 3, 0.6) * dim, stroke: rgba(FIRE, 0.8) });
    dataCard(ctx, '“Doktora götürmeliyiz.”', tops[2].x, tops[2].y - 60, { size: 28, family: 'serif', alpha: a * after(t, 'ladder-three', 5, 0.6) * (1 - help), stroke: rgba(VIO, 0.9), color: '#d9ccff' });
    // makine ilk iki basamakta
    if (mach > 0) {
      const hop = after(t, 'ladder-machine', 1, 1.4, ease.inOut);
      const p0 = [140, 860];
      const p1 = [tops[0].x - 60, tops[0].y - 70];
      const p2 = [tops[1].x - 40, tops[1].y - 70];
      const [bx, by] = hop < 0.5 ? travel(p0, p1, hop * 2, 80) : travel(p1, p2, hop * 2 - 1, 80);
      drawBot(ctx, bx, by, 0.8, a * mach, t);
      const VERBS = ['ölçer', 'kaydeder', 'etiketler', 'karşılaştırır'];
      const VP = [[400, 560], [570, 440], [780, 360], [1000, 300]];
      VERBS.forEach((v, i) => {
        const va = a * after(t, 'ladder-machine', 2 + i, 0.5) * (1 - help);
        pill(ctx, v, VP[i][0], VP[i][1], { size: 32, color: C.digital, alpha: va });
      });
      pill(ctx, 'milyonlarca kat hızlı', 640, 200, { size: 28, color: C.cream, alpha: a * after(t, 'ladder-machine', 6, 0.6) * (1 - help) });
    }
    // üçüncü basamak: insan karar verir, makine yardımcı
    if (help > 0) {
      const hx = tops[2].x + 60;
      const hy = tops[2].y - 50;
      if (help > 0) glow(ctx, hx, hy - 40, 180, VIO, 0.3 * a * help);
      drawPerson(ctx, hx, hy, 1.9, C.cream, a * help, { arm: after(t, 'ladder-help', 4, 0.6) });
      text(ctx, 'aile', hx, hy + 80, { size: 26, color: C.muted, alpha: a * help });
      // sınır
      const ba = a * after(t, 'ladder-help', 1, 0.6);
      const bx = tops[2].left + 10;
      ctx.save();
      ctx.globalAlpha *= ba;
      ctx.strokeStyle = C.violet;
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 10]);
      line(ctx, bx, 260, bx, tops[2].y + 40);
      ctx.restore();
      text(ctx, 'kesin karar: yalnızca insan', bx, 225, { size: 28, weight: 700, color: C.violet, alpha: ba });
      // akıllı termometre uyarısı
      const na = a * after(t, 'ladder-help', 3, 0.6) * (1 - after(t, 'ladder-gray', 0, 0.6));
      if (na > 0) {
        bubble(ctx, 720, 230, 560, 110, na, { fill: '#f3ede1', tail: [tops[1].x - 60, tops[1].y - 140] });
        warnSign(ctx, 490, 230, 1.1, na);
        text(ctx, 'Ateş 3 gündür yüksek.', 750, 232, { size: 38, weight: 700, color: C.ink, alpha: na });
        text(ctx, 'yardımcı', 560, 330, { size: 30, family: 'serif', italic: true, color: C.digital, alpha: na });
      }
      pill(ctx, 'KARAR: AİLENİN', hx, hy - 170, { size: 26, color: C.violet, alpha: a * after(t, 'ladder-help', 5, 0.6) });
    }
    // gri bölge
    const ga = a * after(t, 'ladder-gray', 0, 1.2);
    if (ga > 0) {
      for (let k = 0; k < 7; k++) {
        const fx = tops[2].left - 120 + k * 70 + Math.sin(t * 0.4 + k) * 30;
        const fy = tops[2].y - 160 + Math.cos(t * 0.3 + k * 1.7) * 40 + (k % 3) * 60;
        glow(ctx, fx, fy, 170, [150, 156, 170], 0.22 * ga);
      }
      pill(ctx, 'GRİ BÖLGE', tops[2].left + 10, 310, { size: 30, color: '#c8ccd6', alpha: ga });
      pill(ctx, 'yapay zekâ', tops[2].left + 10, 380, { size: 26, color: C.digital, alpha: a * after(t, 'ladder-gray', 1, 0.6) });
      text(ctx, 'makinenin yardımı nerede biter,', 640, 200, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: a * after(t, 'ladder-gray', 2, 0.6) });
      text(ctx, 'insanın kararı nerede başlar?', 640, 260, { size: 40, family: 'serif', italic: true, color: C.violet, alpha: a * after(t, 'ladder-gray', 3, 0.6) });
      const da = a * after(t, 'ladder-gray', 4, 0.7);
      drawIcon(ctx, 'door', 1760, 300, 1.1, C.flame, da, 0.15 + 0.1 * Math.sin(t));
      text(ctx, '10. KAPI', 1760, 400, { size: 28, weight: 800, spacing: 4, color: C.flame, alpha: da });
      text(ctx, 'uzun uzun döneceğiz', 1760, 440, { size: 24, family: 'serif', italic: true, color: C.muted, alpha: a * after(t, 'ladder-gray', 5, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 7 · Usta sözü
  // ---------------------------------------------------------------------------

  function sceneMotto(ctx, lt, t) {
    const a = beatVis(lt, 'motto.say');
    if (a <= 0) return;
    caption(ctx, 'şimdilik akılda kalması gereken tek şey', 230, a * after(t, 'motto-say', 0, 0.6), { color: C.muted, size: 38 });
    const ca = a * after(t, 'motto-say', 1, 0.7);
    if (ca > 0) {
      ctx.save();
      ctx.globalAlpha *= ca;
      ctx.translate(0, (1 - ca) * 20);
      paperCard(ctx, 360, 330, 1200, 440);
      ctx.fillStyle = C.ember;
      ctx.fillRect(360, 350, 8, 400);
      ctx.restore();
      text(ctx, 'USTA SÖZÜ', W / 2, 410, { size: 26, weight: 800, spacing: 12, color: C.ember, alpha: ca });
      text(ctx, 'Veri masumdur.', W / 2, 530, { size: 92, family: 'serif', color: C.ink, alpha: a * after(t, 'motto-say', 2, 0.6) });
      runs(ctx, [
        ['Yorum ', { size: 92, family: 'serif', italic: true, color: C.ink, alpha: a * after(t, 'motto-say', 3, 0.6) }],
        ['sorumluluktur.', { size: 92, family: 'serif', italic: true, weight: 700, color: '#5b3fa8', alpha: a * progress(t, cue('motto-say', 3) + 0.4, cue('motto-say', 3) + 1.0) }],
      ], W / 2, 680);
      const border = [[340, 310], [1580, 310], [1580, 790], [340, 790], [340, 310]];
      drawWire(ctx, border, progress(t, cue('motto-say', 3) + 0.6, cue('motto-say', 3) + 1.8), t, a * progress(t, cue('motto-say', 3) + 0.6, cue('motto-say', 3) + 1.2), 4);
    }
  }

  // ---------------------------------------------------------------------------
  // 8 · Veriyi kim konuşturur?
  // ---------------------------------------------------------------------------

  const FOUR = [
    ['basket', 'hangi veri toplandı?', '#ffe8a3'],
    ['ruler', 'ne ölçülmedi?', '#ffc9d4'],
    ['calendar', 'hangi zaman aralığı?', '#c9e6ff'],
    ['chart', 'nasıl çizildi?', '#c9f2d6'],
  ];

  function drawReport(ctx, x, y, s, alpha, hl) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.scale(s, s);
    paperCard(ctx, -340, -260, 680, 520);
    ctx.fillStyle = 'rgba(27,31,42,0.18)';
    for (let k = 0; k < 6; k++) {
      if (k === 2) continue;
      ctx.fillRect(-280, -100 + k * 52, k === 5 ? 300 : 560, 14);
    }
    if (hl > 0) {
      ctx.fillStyle = `rgba(255,210,122,${0.5 * hl})`;
      ctx.fillRect(-290, -8, 580, 40);
    }
    ctx.restore();
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    text(ctx, 'RAPOR', 0, -190, { size: 44, family: 'display', weight: 900, spacing: 12, color: C.ink, alpha });
    text(ctx, 'Verilere göre, …', -280, 12, { size: 36, family: 'serif', italic: true, color: C.ink, align: 'left', alpha });
    ctx.restore();
  }

  function sceneHidden(ctx, lt, t) {
    kicker(ctx, 'VERİYİ KİM KONUŞTURUR?', lt, 16);
    const a = spanVis(lt, 'hidden.report', 'hidden.four');
    if (a <= 0) return;
    const move = after(t, 'hidden-four', 0, 1.0, ease.inOut);
    const rx = lerp(W / 2, 520, move);
    const rs = lerp(1, 0.78, move);
    drawReport(ctx, rx, 560, rs, a * after(t, 'hidden-report', 0, 0.6), after(t, 'hidden-report', 1, 0.6));
    // büyüteç gizli yorumu bulur
    const mg = after(t, 'hidden-report', 2, 1.2, ease.inOut);
    const ma = a * after(t, 'hidden-report', 2, 0.5) * (1 - move);
    if (ma > 0) {
      const mx = lerp(rx - 300, rx + 80, mg);
      magnifier(ctx, mx, 570, 90, ma);
      const ra = ma * clamp(mg * 2 - 0.6);
      text(ctx, '← birinin yorumu', rx + 200, 640, { size: 34, family: 'serif', italic: true, weight: 700, color: C.ember, alpha: ra });
    }
    // dört gizli karar
    FOUR.forEach(([ic, lab, col], i) => {
      const na = a * after(t, 'hidden-four', i, 0.6, ease.back);
      if (na <= 0) return;
      const x = 1120 + (i % 2) * 400;
      const y = 380 + Math.floor(i / 2) * 330;
      const rot = [-0.04, 0.03, 0.025, -0.03][i];
      const [sx, sy] = travel([rx, 560], [x, y], clamp(na), 40);
      stickyNote(ctx, sx, sy, 340, 270, rot, col, clamp(na));
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(rot);
      drawIcon(ctx, ic, 0, -40, 1.0, C.ink, clamp(na));
      if (ic === 'ruler') cross(ctx, 0, -40, 1.3, C.error, clamp(na) * 0.8, 1);
      text(ctx, lab, 0, 60, { size: 30, weight: 700, color: C.ink, alpha: clamp(na) });
      ctx.restore();
      const pa = a * after(t, 'hidden-four', 5, 0.4 + i * 0.15);
      drawPerson(ctx, sx + 130, sy + 90, 0.6, '#5b3fa8', pa);
    });
    caption(ctx, 'hepsi birer insan kararı', 1000, a * after(t, 'hidden-four', 5, 0.6), { color: C.flame, size: 44 });
  }

  // 8b · Örnekler: hangi veri toplandı, ne ölçülmedi
  function sceneSurvey(ctx, lt, t) {
    const sa = beatVis(lt, 'hidden.survey');
    if (sa > 0) {
      pill(ctx, '1 · HANGİ VERİ TOPLANDI?', 120, 100, { size: 26, color: C.ink, fill: '#ffe8a3', stroke: '#ffe8a3', align: 'left', alpha: sa });
      drawBuilding(ctx, 420, 900, 380, 300, 'KÜTÜPHANE', sa * after(t, 'hidden-survey', 2, 0.6), { columns: 5 });
      // çıkan öğrenciler
      for (let k = 0; k < 10; k++) {
        const start = cue('hidden-survey', 3) + 0.2 + k * 0.18;
        const p = progress(t, start, start + 1.4, ease.out);
        if (p <= 0) continue;
        const x = lerp(420, 700 + (k % 5) * 70, p);
        const y = 860 - Math.floor(k / 5) * 110 - (k % 2) * 10;
        drawPerson(ctx, x, y, 0.9, k === 9 ? C.muted : C.cream, sa * clamp(p * 3), { child: true });
      }
      // soru ve sayım
      const qa = sa * after(t, 'hidden-survey', 4, 0.6);
      bubble(ctx, 840, 300, 560, 100, qa, { fill: '#f3ede1', tail: [800, 420] });
      text(ctx, 'Kitap okumayı seviyor musun?', 840, 302, { size: 34, weight: 700, color: C.ink, alpha: qa });
      const ta = sa * after(t, 'hidden-survey', 5, 0.6);
      const n = Math.round(9 * progress(t, cue('hidden-survey', 5), cue('hidden-survey', 5) + 1.4, ease.linear));
      text(ctx, `evet: ${n}   hayır: ${n >= 9 ? 1 : 0}`, 840, 480, { size: 36, family: 'mono', weight: 700, color: C.ok, alpha: ta });
      // manşet
      const ha = sa * after(t, 'hidden-survey', 6, 0.7);
      if (ha > 0) {
        ctx.save();
        ctx.globalAlpha *= ha;
        ctx.translate(1460, 420);
        ctx.rotate(0.02);
        paperCard(ctx, -330, -210, 660, 420);
        ctx.restore();
        text(ctx, 'OKUL GAZETESİ', 1460, 260, { size: 24, weight: 800, spacing: 8, color: C.inkSoft, alpha: ha });
        text(ctx, '%90', 1460, 390, { size: 150, family: 'display', weight: 900, color: C.ember, alpha: sa * after(t, 'hidden-survey', 7, 0.5) });
        text(ctx, 'okumayı seviyor!', 1460, 510, { size: 50, family: 'serif', italic: true, weight: 700, color: C.ink, alpha: sa * after(t, 'hidden-survey', 7, 0.6) });
      }
      // okulun tamamı
      const wa = sa * after(t, 'hidden-survey', 8, 0.8);
      if (wa > 0) {
        panel(ctx, 1460, 840, 660, 260, wa, { fill: '#0f1628', stroke: C.line, r: 18 });
        text(ctx, 'OKULUN TAMAMI', 1160, 735, { size: 22, weight: 800, spacing: 5, color: C.muted, align: 'left', alpha: wa });
        for (let k = 0; k < 100; k++) {
          const asked = k % 10 === 3;
          ctx.save();
          ctx.globalAlpha *= wa * (asked ? 1 : 0.35);
          ctx.fillStyle = asked ? C.flame : C.dim;
          dot(ctx, 1180 + (k % 20) * 29, 790 + Math.floor(k / 20) * 34, asked ? 9 : 7);
          ctx.restore();
        }
        stamp(ctx, 'YANILTICI', 1640, 590, C.error, after(t, 'hidden-survey', 8, 0.6, ease.out), { alpha: sa, size: 36, rot: -0.18 });
        text(ctx, 'yalnızca kütüphaneye gelenlere sorduk', 960, 1030, { size: 38, family: 'serif', italic: true, color: C.flame, alpha: wa });
      }
    }
    // ölçülmeyen şey yok sayılır
    const ma = beatVis(lt, 'hidden.missing');
    if (ma > 0) {
      pill(ctx, '2 · NE ÖLÇÜLMEDİ?', 120, 100, { size: 26, color: C.ink, fill: '#ffc9d4', stroke: '#ffc9d4', align: 'left', alpha: ma });
      const ghost = after(t, 'hidden-missing', 3, 0.6);
      const erase = after(t, 'hidden-missing', 5, 1.0, ease.inOut);
      const cols = [
        { w: 260, head: 'Öğrenci', align: 'left' },
        { w: 240, head: 'Matematik' },
        { w: 240, head: 'Türkçe' },
        { w: 240, head: 'Fen' },
        { w: 280, head: 'Mutluluk?', headColor: C.violet, headAlpha: ghost * (1 - erase) },
      ];
      const rows = [['Ayşe', 85, 92, 88, '?'], ['Ali', 60, 78, 71, '?'], ['Can', 74, 70, 83, '?'], ['Elif', 91, 87, 95, '?']];
      drawTable(ctx, 330, 300, cols, rows, { alpha: ma * after(t, 'hidden-missing', 2, 0.6), rowH: 86, size: 40, cellColor: (j, i) => (i === 0 ? C.cream : i === 4 ? C.violet : C.flame), cellAlpha: (j, i) => (i === 4 ? ghost * (1 - erase) : 1) });
      // hayalet sütun çerçevesi
      const ga = ma * ghost * (1 - erase);
      if (ga > 0) {
        ctx.save();
        ctx.globalAlpha *= ga;
        ctx.strokeStyle = C.violet;
        ctx.lineWidth = 3;
        ctx.setLineDash([12, 10]);
        roundRect(ctx, 330 + 980 + 6, 306, 268, 62 + 4 * 86 - 12, 12);
        ctx.stroke();
        ctx.restore();
        text(ctx, 'raporda yok', 330 + 980 + 140, 760, { size: 30, family: 'serif', italic: true, color: C.violet, alpha: ga });
      }
      text(ctx, 'Ölçülmeyen şey, yok sayılır.', W / 2, 920, { size: 58, family: 'serif', italic: true, color: C.cream, alpha: ma * after(t, 'hidden-missing', 4, 0.6) });
    }
  }

  // 8c · Örnekler: zaman penceresi, eksen
  const TEMP = Array.from({ length: 365 }, (_, d) => 15 - 11 * Math.cos((2 * Math.PI * (d - 18)) / 365) + (noise(d * 0.35, 7) - 0.5) * 3.6);
  const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const MSTART = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];

  function sceneCharts(ctx, lt, t) {
    const wa = beatVis(lt, 'hidden.window');
    if (wa > 0) {
      pill(ctx, '3 · HANGİ ZAMAN ARALIĞI?', 120, 100, { size: 26, color: C.ink, fill: '#c9e6ff', stroke: '#c9e6ff', align: 'left', alpha: wa });
      const box = { x: 260, y: 220, w: 1400, h: 340 };
      const yr = [-2, 32];
      const ca = wa * after(t, 'hidden-window', 2, 0.6);
      axes(ctx, box, ca);
      MONTHS.forEach((m, i) => text(ctx, m, box.x + ((MSTART[i] + 15) / 365) * box.w, box.y + box.h + 30, { size: 22, color: C.muted, alpha: ca }));
      text(ctx, 'günlük sıcaklık (°C)', box.x, box.y - 30, { size: 24, color: C.muted, align: 'left', alpha: ca });
      plotLine(ctx, box, TEMP.map((v, d) => [d, v]), [0, 365], yr, { color: C.digital, lw: 2.5, draw: after(t, 'hidden-window', 2, 1.6, ease.inOut), alpha: wa });
      const WIN = [[3, MSTART[2], MSTART[3], 'Hava ısınıyor!', C.fire, 300], [5, MSTART[9], MSTART[10], 'Hava soğuyor!', C.digital, 1060]];
      WIN.forEach(([k, d0, d1, head, col, ix]) => {
        const sa = wa * after(t, 'hidden-window', k, 0.6);
        if (sa <= 0) return;
        const x0 = box.x + (d0 / 365) * box.w;
        const x1 = box.x + (d1 / 365) * box.w;
        hlBox(ctx, (x0 + x1) / 2, box.y + box.h / 2, x1 - x0 + 10, box.h + 20, col === C.fire ? FIRE : DIGI, sa);
        // yakın plan
        const ib = { x: ix, y: 700, w: 560, h: 220 };
        panel(ctx, ib.x + ib.w / 2, ib.y + ib.h / 2 - 10, ib.w + 60, ib.h + 120, sa, { fill: '#0f1628', stroke: col, r: 18 });
        const seg = TEMP.slice(d0, d1).map((v, i) => [i, v]);
        const lo = Math.min(...seg.map((p) => p[1])) - 1;
        const hi2 = Math.max(...seg.map((p) => p[1])) + 1;
        plotLine(ctx, ib, seg, [0, seg.length - 1], [lo, hi2], { color: col, lw: 4, draw: after(t, 'hidden-window', k, 1.2, ease.inOut), alpha: sa });
        ctx.save();
        ctx.globalAlpha *= sa * 0.5;
        ctx.strokeStyle = col;
        ctx.setLineDash([6, 8]);
        ctx.lineWidth = 2;
        line(ctx, x0, box.y + box.h + 10, ib.x, ib.y - 60);
        line(ctx, x1, box.y + box.h + 10, ib.x + ib.w, ib.y - 60);
        ctx.restore();
        text(ctx, head, ib.x + ib.w / 2, ib.y - 30, { size: 40, family: 'display', weight: 900, color: col, alpha: wa * after(t, 'hidden-window', k + 1, 0.6) });
      });
      runs(ctx, [
        ['Veri aynı; ', { size: 44, family: 'serif', color: C.cream, alpha: wa * after(t, 'hidden-window', 7, 0.6) }],
        ['seçilen zaman aralığı farklı.', { size: 44, family: 'serif', italic: true, color: C.flame, alpha: wa * after(t, 'hidden-window', 8, 0.6) }],
      ], W / 2, 1040);
    }
    const xa = beatVis(lt, 'hidden.axis');
    if (xa > 0) {
      pill(ctx, '4 · NASIL ÇİZİLDİ?', 120, 100, { size: 26, color: C.ink, fill: '#c9f2d6', stroke: '#c9f2d6', align: 'left', alpha: xa });
      const da = xa * after(t, 'hidden-axis', 2, 0.6);
      pill(ctx, '7-A: 72', 800, 200, { size: 34, color: C.digital, alpha: da });
      pill(ctx, '7-B: 75', 1120, 200, { size: 34, color: C.fire, alpha: xa * after(t, 'hidden-axis', 3, 0.6) });
      const CH = [[300, 0, 100, [0, 25, 50, 75, 100], 5, 'eksen 0’dan başlıyor'], [1120, 70, 76, [70, 72, 74, 76], 7, 'eksen 70’ten başlıyor']];
      CH.forEach(([bx, lo, hi2, ticks, k, lab], ci) => {
        const ca = xa * after(t, 'hidden-axis', ci === 0 ? 4 : k, 0.6);
        if (ca <= 0) return;
        const box = { x: bx, y: 330, w: 500, h: 500 };
        const axHi = ci === 0 ? after(t, 'hidden-axis', 4, 0.6) * (1 - after(t, 'hidden-axis', 6, 0.6)) : 0;
        axes(ctx, box, ca, { color: axHi > 0 ? C.flame : C.dim, lw: 3 + 3 * axHi });
        const py = (v) => box.y + box.h - ((v - lo) / (hi2 - lo)) * box.h;
        ticks.forEach((v) => text(ctx, String(v), box.x - 20, py(v), { size: 26, family: 'mono', color: C.muted, align: 'right', alpha: ca }));
        const grow = after(t, 'hidden-axis', k + 1, 1.0, ease.out);
        [[72, C.digital, 'A'], [75, C.fire, 'B']].forEach(([v, col, lab2], j) => {
          const x = box.x + 130 + j * 220;
          const top = lerp(py(lo), py(v), grow);
          ctx.save();
          ctx.globalAlpha *= ca;
          ctx.fillStyle = col;
          roundRect(ctx, x - 60, top, 120, py(lo) - top, [10, 10, 0, 0]);
          ctx.fill();
          ctx.restore();
          text(ctx, `7-${lab2}`, x, box.y + box.h + 36, { size: 28, weight: 700, color: C.muted, alpha: ca });
          text(ctx, String(v), x, top - 28, { size: 32, family: 'mono', weight: 700, color: col, alpha: ca * grow });
        });
        text(ctx, lab, box.x + box.w / 2, box.y + box.h + 90, { size: 32, family: 'serif', italic: true, color: C.cream, alpha: ca });
      });
      if (xa * after(t, 'hidden-axis', 4, 0.6) > 0) {
        const ea = xa * after(t, 'hidden-axis', 4, 0.6) * (1 - after(t, 'hidden-axis', 6, 0.6));
        arrow(ctx, 200, 520, 290, 560, C.flame, ea, 4, 16);
        text(ctx, 'eksen', 190, 500, { size: 36, family: 'serif', italic: true, weight: 700, color: C.flame, align: 'right', alpha: ea });
      }
      const ka = xa * after(t, 'hidden-axis', 8, 0.6);
      if (ka > 0) {
        text(ctx, '2,5 kat!', 1750, 470, { size: 50, family: 'display', weight: 900, color: C.error, alpha: ka });
        arrow(ctx, 1700, 500, 1600, 560, C.error, ka, 4, 16);
      }
      runs(ctx, [
        ['Fark aynı; ', { size: 44, family: 'serif', color: C.cream, alpha: xa * after(t, 'hidden-axis', 9, 0.6) }],
        ['çizim onu büyütür.', { size: 44, family: 'serif', italic: true, color: C.flame, alpha: xa * after(t, 'hidden-axis', 10, 0.6) }],
      ], W / 2, 1035);
      magnifier(ctx, 1122, 830, 64, xa * after(t, 'hidden-axis', 10, 0.6) * 0.85);
    }
  }

  // 8d · Rakamlar yalan söylemez; veriyi birileri konuşturur
  function sceneSpeak(ctx, lt, t) {
    const ma = beatVis(lt, 'hidden.myth');
    if (ma > 0) {
      text(ctx, 'sık duyulan bir söz', W / 2, 220, { size: 36, family: 'serif', italic: true, color: C.muted, alpha: ma * after(t, 'hidden-myth', 0, 0.6) });
      const qa = ma * after(t, 'hidden-myth', 1, 0.6);
      panel(ctx, W / 2, 380, 1100, 170, qa, { fill: '#17213a', stroke: C.flame, lw: 3, r: 24 });
      text(ctx, '“Rakamlar yalan söylemez.”', W / 2, 382, { size: 68, family: 'serif', italic: true, color: C.cream, alpha: qa });
      tick(ctx, 1560, 320, 1.4, C.ok, ma * after(t, 'hidden-myth', 2, 0.6), after(t, 'hidden-myth', 2, 0.8, ease.inOut));
      text(ctx, 'gerçekten de söylemez', 1560, 490, { size: 28, family: 'serif', italic: true, color: C.ok, alpha: ma * after(t, 'hidden-myth', 2, 0.6) });
      const ha = ma * after(t, 'hidden-myth', 3, 0.6);
      if (ha > 0) {
        const box = { x: 700, y: 600, w: 520, h: 280 };
        axes(ctx, box, ha);
        const pk = after(t, 'hidden-myth', 3, 1.6, ease.inOut);
        const pts = [[0, 1], [1, 1.3], [2, 1.2], [3, 2.8], [4, 3.6]];
        const sp = plotLine(ctx, box, pts, [0, 4], [0, 4], { color: C.fire, lw: 5, draw: pk, alpha: ha });
        if (sp.length) {
          const L = pathLength(sp);
          const [px, py] = pointAt(sp, L * pk);
          drawIcon(ctx, 'pencil', px + 26, py - 26, 0.8, C.cream, ha);
        }
        text(ctx, 'ama onları seçen ve çizen insan, yanıltabilir', W / 2, 960, { size: 44, family: 'serif', italic: true, color: C.flame, alpha: ma * after(t, 'hidden-myth', 4, 0.6) });
      }
    }
    const ea = beatVis(lt, 'hidden.end');
    if (ea > 0) {
      const box = { x: 700, y: 460, w: 520, h: 300 };
      const pull = after(t, 'hidden-end', 1, 1.0, ease.inOut);
      const bars = [0.45, 0.7, 0.55].map((v, i) => v + 0.18 * pull * Math.sin(t * 2.2 + i * 1.8));
      axes(ctx, box, ea);
      const ends = [];
      bars.forEach((v, i) => {
        const x = box.x + 90 + i * 170;
        const top = box.y + box.h - v * box.h;
        ctx.save();
        ctx.globalAlpha *= ea;
        ctx.fillStyle = [C.digital, C.fire, C.violet][i];
        roundRect(ctx, x - 50, top, 100, box.y + box.h - top, [8, 8, 0, 0]);
        ctx.fill();
        ctx.restore();
        ends.push([x, top]);
      });
      const sa = ea * after(t, 'hidden-end', 0, 0.6);
      bubble(ctx, 1450, 400, 440, 110, sa, { fill: '#f3ede1', tail: [1200, 500] });
      text(ctx, 'Veriler konuşuyor!', 1450, 402, { size: 40, weight: 800, color: C.ink, alpha: sa });
      strike(ctx, 1260, 1640, 402, C.error, sa, after(t, 'hidden-end', 0, 1.2, ease.inOut) * clamp((t - cue('hidden-end', 0) - 0.6) * 2));
      puppetBar(ctx, 960, 200, 420, ends, ea * pull, t);
      runs(ctx, [
        ['Veriyi ', { size: 64, family: 'serif', color: C.cream, alpha: ea * after(t, 'hidden-end', 1, 0.6) }],
        ['birileri konuşturur.', { size: 64, family: 'serif', italic: true, weight: 700, color: C.flame, alpha: ea * progress(t, cue('hidden-end', 1) + 0.5, cue('hidden-end', 1) + 1.1) }],
      ], W / 2, 920);
    }
  }

  // ---------------------------------------------------------------------------
  // 9 · Verinin türleri: 5 ile "5"
  // ---------------------------------------------------------------------------

  const ROWS_BITS = [
    ['5', 'sayı', '00000101', 'ikilik: 101', 'types-bits', 1, 2],
    ['“5”', 'yazı', '00110101', 'karakter kodu: 53', 'types-bits', 3, 6],
    ['53', 'sayı', '00110101', 'ikilik: 110101', 'types-bits', 7, 8],
  ];

  function sceneKind(ctx, lt, t) {
    kicker(ctx, 'VERİNİN TÜRLERİ', lt, 34);
    // A · makineye türünü söylemek
    const wa = beatVis(lt, 'types.why');
    if (wa > 0) {
      const ba = wa * after(t, 'types-why', 0, 0.6);
      panel(ctx, 1240, 330, 420, 200, ba, { fill: '#0f1628', stroke: '#4a5878', r: 20 });
      text(ctx, 'BELLEK', 1240, 255, { size: 22, weight: 800, spacing: 6, color: C.muted, alpha: ba });
      const fly = after(t, 'types-why', 0, 1.2, ease.inOut);
      const [cx, cy] = travel([520, 330], [1190, 345], fly, 60);
      dataCard(ctx, '5', cx, cy, { size: 64, alpha: ba });
      pill(ctx, 'TÜR: ?', 1340, 345, { size: 28, color: C.fire, alpha: wa * after(t, 'types-why', 1, 0.6) });
      text(ctx, 'ne tür bir şey verdiğimizi söylemeliyiz', 700, 450, { size: 34, family: 'serif', italic: true, color: C.cream, alpha: wa * after(t, 'types-why', 1, 0.6) });
      const fa = wa * after(t, 'types-why', 3, 0.6, ease.back);
      const fb = wa * progress(t, cue('types-why', 3) + 0.8, cue('types-why', 3) + 1.4, ease.back);
      text(ctx, '5', 620, 690, { size: 230, family: 'mono', weight: 700, color: C.digital, alpha: clamp(fa) });
      text(ctx, 'beş sayısı', 620, 850, { size: 36, family: 'serif', italic: true, color: C.cream, alpha: clamp(fa) });
      text(ctx, '“5”', 1300, 690, { size: 230, family: 'mono', weight: 700, color: C.fire, alpha: clamp(fb) });
      text(ctx, 'beş yazısı', 1300, 850, { size: 36, family: 'serif', italic: true, color: C.cream, alpha: clamp(fb) });
      const na = wa * progress(t, cue('types-why', 3) + 1.4, cue('types-why', 3) + 2.0);
      text(ctx, '≠', 960, 680, { size: 150, family: 'display', weight: 900, color: C.error, alpha: na });
      text(ctx, 'makine bu farkı kendiliğinden anlamaz', W / 2, 980, { size: 40, family: 'serif', italic: true, color: C.flame, alpha: wa * after(t, 'types-why', 4, 0.6) });
    }
    // B · bellekte ikisi de bit; "5" ile 53 tıpatıp aynı
    const ba = beatVis(lt, 'types.bits');
    if (ba > 0) {
      text(ctx, 'bellekte ikisi de yalnızca bitlerdir', W / 2, 190, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: ba * after(t, 'types-bits', 0, 0.6) });
      const unk = after(t, 'types-bits', 9, 0.6);
      const typ = after(t, 'types-bits', 12, 0.6);
      ROWS_BITS.forEach(([lab, kind, bits, note, id, k0, k1], r) => {
        const y = 340 + r * 230;
        const ra = ba * after(t, id, k0, 0.6);
        if (ra <= 0) return;
        const on = after(t, id, k1, 0.8);
        panel(ctx, W / 2 + 40, y, 900, 150, ra, { fill: '#0f1628', stroke: C.line, r: 22 });
        lampRow(ctx, W / 2 + 40, y, bits.split('').map((b) => (b === '1' ? on : 0)), 30, 104, ra);
        // soldaki ad: sonra soru işaretine döner
        text(ctx, lab, 330, y - 10, { size: 74, family: 'mono', weight: 700, color: r === 1 ? C.fire : C.digital, alpha: ra * (1 - unk) });
        text(ctx, kind, 330, y + 50, { size: 26, color: C.muted, alpha: ra * (1 - unk) });
        text(ctx, '?', 330, y, { size: 90, family: 'display', weight: 900, color: C.muted, alpha: ra * unk * (1 - typ) });
        text(ctx, note, 1600, y, { size: 28, family: 'mono', weight: 700, color: C.muted, alpha: ba * after(t, id, k1, 0.6) * (1 - unk) });
        if (r > 0) {
          pill(ctx, r === 1 ? 'TÜR: metin' : 'TÜR: tam sayı', 1620, y, { size: 30, color: r === 1 ? C.fire : C.digital, alpha: ra * typ });
          if (typ > 0) text(ctx, r === 1 ? '“5”' : '53', 330, y, { size: 70, family: 'mono', weight: 700, color: r === 1 ? C.fire : C.digital, alpha: ra * typ });
        } else if (typ > 0) {
          text(ctx, '5', 330, y, { size: 70, family: 'mono', weight: 700, color: C.digital, alpha: ra * typ });
          pill(ctx, 'TÜR: tam sayı', 1620, y, { size: 30, color: C.digital, alpha: ra * typ });
        }
      });
      // "5" yazısı ile 53 sayısı: aynı lambalar
      const same = ba * after(t, 'types-bits', 8, 0.6);
      if (same > 0) {
        hlBox(ctx, W / 2 + 40, 340 + 345, 960, 420, FIRE, same * (0.7 + 0.3 * Math.sin(t * 4)));
        pill(ctx, 'tıpatıp aynı', W / 2 + 40, 685, { size: 30, color: C.flame, fill: '#2a1d10', alpha: same * (1 - typ) });
      }
      text(ctx, 'lambalar söylemez: bunu verinin türü söyler', W / 2, 1010, { size: 38, family: 'serif', italic: true, color: C.flame, alpha: ba * after(t, 'types-bits', 10, 0.6) });
    }
    // C · toplama farkı gösterir
    const pa = beatVis(lt, 'types.plus');
    if (pa > 0) {
      text(ctx, 'sayı', 300, 380, { size: 30, weight: 800, spacing: 4, color: C.digital, alpha: pa * after(t, 'types-plus', 1, 0.6) });
      runs(ctx, [
        ['5 + 5', { size: 120, family: 'mono', weight: 700, color: C.digital, alpha: pa * after(t, 'types-plus', 1, 0.6) }],
        ['  =  10', { size: 120, family: 'mono', weight: 700, color: C.cream, alpha: pa * after(t, 'types-plus', 2, 0.6) }],
      ], W / 2 + 40, 430);
      text(ctx, 'yazı', 300, 680, { size: 30, weight: 800, spacing: 4, color: C.fire, alpha: pa * after(t, 'types-plus', 3, 0.6) });
      const ya = pa * after(t, 'types-plus', 3, 0.6);
      const m = after(t, 'types-plus', 4, 1.0, ease.inOut);
      if (ya > 0) {
        if (m < 1) {
          text(ctx, '“5”', lerp(760, 905, m), 700, { size: 120, family: 'mono', weight: 700, color: C.fire, alpha: ya * (1 - clamp((m - 0.9) * 10)) });
          text(ctx, '+', 990, 700, { size: 110, family: 'mono', weight: 700, color: C.cream, alpha: ya * (1 - m) });
          text(ctx, '“5”', lerp(1220, 1075, m), 700, { size: 120, family: 'mono', weight: 700, color: C.fire, alpha: ya * (1 - clamp((m - 0.9) * 10)) });
        }
        if (m > 0.9) {
          if (m >= 1) glow(ctx, 990, 700, 220, FIRE, 0.25 * ya);
          text(ctx, '“55”', 990, 700, { size: 130, family: 'mono', weight: 700, color: C.flame, alpha: ya * clamp((m - 0.9) * 10) });
        }
      }
      text(ctx, 'yan yana konur: birleştirme', 990, 820, { size: 34, family: 'serif', italic: true, color: C.muted, alpha: pa * after(t, 'types-plus', 4, 0.8) });
      pill(ctx, 'sonuç yine bir yazı: “55”', W / 2, 960, { size: 32, color: C.fire, alpha: pa * after(t, 'types-plus', 5, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 10 · Temel türler tablosu
  // ---------------------------------------------------------------------------

  const TYPES = [
    { id: 'types-int', beat: 'types.int', name: 'Tam sayı', code: 'int', col: C.digital, holds: 'kesirsiz sayı', ex: ['42', '42, −7'], ops: ['toplanır', 'toplanır, çarpılır'], demo: '42 + (−7) = 35', k: { name: 0, ex: [1, 2], holds: 2, ops: [3, 4], demo: 3 } },
    { id: 'types-float', beat: 'types.float', name: 'Ondalıklı sayı', code: 'float', col: C.digital, holds: 'kesirli sayı', ex: ['38,5'], ops: ['toplanır', 'toplanır, çarpılır'], demo: '38,5 × 2 = 77,0', k: { name: 0, ex: [1], holds: 1, ops: [2, 3], demo: 2 } },
    { id: 'types-text', beat: 'types.text', name: 'Metin', code: 'string', col: C.fire, holds: 'harf dizisi', ex: ['“Ayşe”', '“Ayşe”, “5”'], ops: ['birleştirilir', 'birleştirilir, aranır'], demo: '“Ay” + “şe” = “Ayşe”', k: { name: 0, ex: [1, 2], holds: 1, ops: [3, 4], demo: 3 } },
    { id: 'types-bool', beat: 'types.bool', name: 'Mantıksal', code: 'bool', col: C.violet, holds: 'iki durumdan biri', ex: ['doğru / yanlış'], ops: ['karar verdirir'], demo: '38,5 > 38  →  doğru', k: { name: 0, ex: [2], holds: 1, ops: [4], demo: 5 } },
    { id: 'types-date', beat: 'types.date', name: 'Tarih-saat', code: 'date', col: C.ok, holds: 'zaman noktası', ex: ['15.08.2026'], ops: ['çıkarılır', 'çıkarılır, karşılaştırılır'], demo: '15.08 − 01.08 = 14 gün', k: { name: 0, ex: [2], holds: 1, ops: [3, 4], demo: 5 } },
  ];
  const TCOLS = [{ w: 340, head: 'Tür', align: 'left' }, { w: 330, head: 'Ne tutar?' }, { w: 340, head: 'Örnek' }, { w: 590, head: 'Ne yapılabilir?' }];
  const TX = (W - 1600) / 2;
  const TY = 230;
  const TRH = 128;

  // k listesinden: en son geçilmiş öbeğin değeri
  const pickBy = (t, id, ks, vals) => {
    let v = null;
    ks.forEach((k, i) => {
      if (t >= cue(id, k)) v = vals[i];
    });
    return v;
  };

  function sceneTypes(ctx, lt, t) {
    kicker(ctx, 'TEMEL TÜRLER', lt, 42);
    const a = spanVis(lt, 'types.intro', 'types.date');
    if (a <= 0) return;
    text(ctx, 'her programlama dilinde şaşırtıcı ölçüde benzer', W / 2, 168, { size: 34, family: 'serif', italic: true, color: C.cream, alpha: a * after(t, 'types-intro', 1, 0.6) });
    drawTable(ctx, TX, TY, TCOLS, TYPES.map(() => ['', '', '', '']), {
      alpha: a * after(t, 'types-intro', 0, 0.6),
      rowH: TRH,
      rowAlpha: (j) => after(t, TYPES[j].id, 0, 0.5),
      rowHi: (j) => beatVis(lt, TYPES[j].beat, 0.4, 0.4),
      hiRgb: [243, 237, 225],
      gridRows: TYPES.length,
    });
    TYPES.forEach((r, j) => {
      const ya = a * after(t, r.id, 0, 0.5);
      if (ya <= 0) return;
      const cy = TY + 62 + j * TRH + TRH / 2;
      const x0 = TX;
      text(ctx, r.name, x0 + 24, cy - 14, { size: 38, weight: 800, color: r.col, align: 'left', alpha: ya * after(t, r.id, r.k.name, 0.5) });
      text(ctx, r.code, x0 + 24, cy + 30, { size: 22, family: 'mono', color: C.muted, align: 'left', alpha: ya * after(t, r.id, r.k.name, 0.8) });
      text(ctx, r.holds, x0 + 340 + 165, r.id === 'types-bool' ? cy - 14 : cy, { size: 30, color: C.cream, alpha: ya * after(t, r.id, r.k.holds, 0.5) });
      const ex = pickBy(t, r.id, r.k.ex, r.ex);
      if (ex) text(ctx, ex, x0 + 670 + 170, cy, { size: 36, family: 'mono', weight: 700, color: C.flame, alpha: ya * after(t, r.id, r.k.ex[0], 0.5) });
      const ops = pickBy(t, r.id, r.k.ops, r.ops);
      if (ops) text(ctx, ops, x0 + 1010 + 295, cy - 20, { size: 30, color: C.cream, alpha: ya * after(t, r.id, r.k.ops[0], 0.5) });
      text(ctx, r.demo, x0 + 1010 + 295, cy + 26, { size: 28, family: 'mono', weight: 700, color: r.col, alpha: ya * after(t, r.id, r.k.demo, 0.6) });
      if (r.id === 'types-bool') pill(ctx, '2. BÖLÜM · Boole', x0 + 340 + 165, cy + 38, { size: 18, color: C.violet, alpha: ya * after(t, r.id, 3, 0.5) * beatVis(lt, r.beat, 0.4, 0.4) });
      if (r.id === 'types-bool') {
        const da = a * after(t, r.id, 6, 0.5);
        if (da > 0) hlBox(ctx, x0 + 1010 + 295 + 160, cy + 26, 160, 50, VIO, da);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 11 · Baştaki sıfır: telefon numarası ve plaka
  // ---------------------------------------------------------------------------

  const PHONE = '0532 123 45 67';
  const BOX_N = [620, 720];
  const BOX_T = [1300, 720];

  function storeBox(ctx, xy, label, col, alpha, content, o = {}) {
    panel(ctx, xy[0], xy[1], 540, 190, alpha, { fill: '#0f1628', stroke: col, lw: 3, r: 22 });
    text(ctx, label, xy[0], xy[1] - 130, { size: 26, weight: 800, spacing: 6, color: col, alpha });
    if (content) text(ctx, content, xy[0] + (o.dx ?? 0), xy[1] + 4, { size: o.size ?? 54, family: 'mono', weight: 700, color: o.color ?? C.cream, alpha: alpha * (o.alpha ?? 1) });
  }

  function scenePhone(ctx, lt, t) {
    kicker(ctx, 'BAŞTAKİ SIFIR', lt, 30);
    const a = spanVis(lt, 'types.phone', 'types.rule');
    if (a <= 0) return;
    const boxA = a * after(t, 'types-phone', 1, 0.6);
    // A · telefon numarası sayı olarak
    const pa = beatVis(lt, 'types.phone');
    const pl = beatVis(lt, 'types.plate');
    const ru = beatVis(lt, 'types.rule');
    let numContent = null;
    let numCol = C.cream;
    if (pa > 0) {
      const ta = pa * after(t, 'types-phone', 0, 0.6);
      drawIcon(ctx, 'phone', 420, 330, 1.0, C.cream, ta);
      text(ctx, PHONE, 1000, 330, { size: 88, family: 'mono', weight: 700, color: C.cream, alpha: ta });
      const fly = after(t, 'types-phone', 1, 1.0, ease.inOut);
      const drop = progress(t, cue('types-phone', 2), cue('types-phone', 2) + 1.2, ease.in);
      if (fly > 0 && fly < 1) {
        const [x, y] = travel([1000, 330], BOX_N, fly, 30);
        text(ctx, PHONE, x, y, { size: lerp(88, 50, fly), family: 'mono', weight: 700, color: C.cream, alpha: pa });
      }
      if (fly >= 1) {
        if (drop <= 0) numContent = PHONE;
        else {
          numContent = '5321234567';
          numCol = C.flame;
          // düşen sıfır
          text(ctx, '0', BOX_N[0] - 230, BOX_N[1] + drop * 340, { size: 60, family: 'mono', weight: 700, color: C.error, alpha: pa * (1 - drop) });
        }
      }
      text(ctx, 'sıfır kayboldu!', BOX_N[0], BOX_N[1] + 140, { size: 34, family: 'serif', italic: true, color: C.error, alpha: pa * progress(t, cue('types-phone', 2) + 0.6, cue('types-phone', 2) + 1.2) });
      runs(ctx, [
        ['07', { size: 84, family: 'mono', weight: 700, color: C.cream, alpha: pa * after(t, 'types-phone', 4, 0.6) }],
        ['  =  ', { size: 84, family: 'mono', weight: 700, color: C.muted, alpha: pa * after(t, 'types-phone', 5, 0.6) }],
        ['7', { size: 84, family: 'mono', weight: 700, color: C.cream, alpha: pa * after(t, 'types-phone', 5, 0.6) }],
      ], 1300, 750);
      text(ctx, 'sayılarda baştaki sıfırın anlamı yok', 1300, 860, { size: 32, family: 'serif', italic: true, color: C.muted, alpha: pa * after(t, 'types-phone', 3, 0.6) });
    }
    // B · plaka kodu
    if (pl > 0) {
      drawPlate(ctx, '06 ABC 123', W / 2, 330, 1.1, pl * after(t, 'types-plate', 0, 0.6));
      const ha = pl * after(t, 'types-plate', 1, 0.5);
      const pw = measure(ctx, '06 ABC 123', { size: 77, family: 'mono', weight: 700 });
      const p06 = W / 2 + 33 * 1.1 - pw / 2 + measure(ctx, '06', { size: 77, family: 'mono', weight: 700 }) / 2;
      hlBox(ctx, p06, 334, 120, 110, FIRE, ha);
      const fly = after(t, 'types-plate', 2, 0.9, ease.inOut);
      if (fly > 0 && fly < 1) {
        const [x, y] = travel([p06, 334], BOX_N, fly, 30);
        text(ctx, '06', x, y, { size: 80, family: 'mono', weight: 700, color: C.flame, alpha: pl });
      }
      if (fly >= 1) {
        const turn = after(t, 'types-plate', 3, 0.5);
        numContent = turn > 0 ? '6' : '06';
        numCol = turn > 0 ? C.error : C.flame;
      }
      const ba = pl * after(t, 'types-plate', 3, 0.6);
      drawPlate(ctx, '6 ABC 123', 1300, 720, 0.8, ba, { color: C.error });
      cross(ctx, 1560, 640, 1.2, C.error, ba, after(t, 'types-plate', 3, 0.8, ease.inOut));
      text(ctx, 'Ankara’nın plaka kodu', 1300, 860, { size: 32, family: 'serif', italic: true, color: C.muted, alpha: ba });
    }
    if (ru > 0 && !numContent) {
      numContent = '5321234567';
      numCol = C.error;
    }
    storeBox(ctx, BOX_N, 'SAYI OLARAK', C.digital, boxA * (1 - ru * 0.4), numContent, { color: numCol, size: numContent && numContent.length > 8 ? 46 : 70 });
    // C · kural: metin olarak sakla
    if (ru > 0) {
      const ta = ru * after(t, 'types-rule', 0, 0.6);
      storeBox(ctx, BOX_T, 'METİN OLARAK', C.fire, ta, PHONE, { size: 46 });
      tick(ctx, BOX_T[0] + 230, BOX_T[1] - 70, 1.0, C.ok, ta, after(t, 'types-rule', 1, 0.8, ease.inOut));
      const sa = ru * after(t, 'types-rule', 2, 0.6);
      text(ctx, '0532… + 0505… = ?', W / 2, 330, { size: 70, family: 'mono', weight: 700, color: C.muted, alpha: sa });
      strike(ctx, W / 2 - 360, W / 2 + 360, 334, C.error, sa, after(t, 'types-rule', 2, 1.0, ease.inOut));
      const ia = ru * after(t, 'types-rule', 3, 0.6);
      drawIcon(ctx, 'pencil', 1660, 560, 0.7, C.cream, ia);
      text(ctx, 'yazarız', 1660, 625, { size: 24, color: C.muted, alpha: ia });
      drawIcon(ctx, 'phone', 1760, 560, 0.7, C.cream, ia);
      text(ctx, 'ararız', 1760, 625, { size: 24, color: C.muted, alpha: ia });
      const ca = ru * after(t, 'types-rule', 4, 0.7);
      if (ca > 0) {
        ctx.save();
        ctx.globalAlpha *= ca;
        ctx.translate(0, (1 - ca) * 20);
        paperCard(ctx, 330, 870, 1260, 150);
        ctx.fillStyle = C.fire;
        ctx.fillRect(330, 884, 8, 122);
        ctx.restore();
        runs(ctx, [
          ['Üzerinde hesap yapmayacaksanız  ', { size: 42, family: 'serif', color: C.ink, alpha: ru * after(t, 'types-rule', 5, 0.6) }],
          ['→  METİN', { size: 46, family: 'display', weight: 900, color: C.ember, alpha: ru * after(t, 'types-rule', 7, 0.6) }],
        ], W / 2, 958);
        text(ctx, 'telefon · plaka kodu · posta kodu', W / 2, 1050, { size: 28, color: C.muted, alpha: ru * after(t, 'types-rule', 6, 0.6) });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 12 · Düzenli veri
  // ---------------------------------------------------------------------------

  const STUDENTS = [
    ['Ayşe', 'Yılmaz', '112', '7-A'],
    ['Ali', 'Demir', '87', '7-B'],
    ['Zeynep', 'Kaya', '145', '7-B'],
    ['Can', 'Aydın', '63', '7-A'],
    ['Elif', 'Şahin', '129', '7-C'],
    ['Mert', 'Çelik', '94', '7-B'],
  ];
  const SORTED = STUDENTS.map((r, j) => [Number(r[2]), j]).sort((p, q) => p[0] - q[0]).map(([, j]) => j);
  const SORT_POS = STUDENTS.map((_, j) => SORTED.indexOf(j));

  function sceneStruct(ctx, lt, t) {
    kicker(ctx, 'DÜZENLİ VERİ', lt, 26);
    const a = spanVis(lt, 'struct.list', 'struct.query');
    if (a <= 0) return;
    const hk = [1, 2, 3, 3].map((k) => after(t, 'struct-list', k, 0.5) * (1 - after(t, 'struct-name', 0, 0.6)));
    const sortK = after(t, 'struct-name', 4, 1.2, ease.inOut);
    const q = after(t, 'struct-query', 0, 0.6);
    const cols = [
      { w: 260, head: 'Ad', align: 'left', headColor: hk[0] > 0.5 ? C.flame : C.muted },
      { w: 260, head: 'Soyad', align: 'left', headColor: hk[1] > 0.5 ? C.flame : C.muted },
      { w: 230, head: sortK > 0.5 ? 'Numara ↑' : 'Numara', headColor: hk[2] > 0.5 || sortK > 0 ? C.flame : C.muted },
      { w: 200, head: 'Sınıf', headColor: hk[3] > 0.5 || q > 0 ? C.flame : C.muted },
    ];
    const grid = after(t, 'struct-list', 4, 0.6) * (1 - after(t, 'struct-name', 0, 0.8));
    drawTable(ctx, 300, 250, cols, STUDENTS, {
      alpha: a * after(t, 'struct-list', 0, 0.6),
      rowH: 74,
      size: 34,
      rowAlpha: (j) => progress(t, cue('struct-list', 0) + 0.2 + j * 0.15, cue('struct-list', 0) + 0.6 + j * 0.15) * (STUDENTS[j][3] === '7-B' ? 1 : 1 - 0.65 * q) * (SORT_POS[j] === j ? 1 : 1 - 0.35 * Math.sin(Math.PI * sortK)),
      rowY: (j) => lerp(j, SORT_POS[j], sortK),
      rowX: (j) => Math.sin(Math.PI * sortK) * 140 * Math.sign(SORT_POS[j] - j),
      rowHi: (j) => (STUDENTS[j][3] === '7-B' ? q : 0),
      cellColor: (j, i) => (i === 2 ? C.flame : i === 3 ? C.digital : C.cream),
      gridColor: grid > 0 ? rgba(FIRE, 0.4 + 0.5 * grid) : 'rgba(90,103,136,0.5)',
    });
    caption(ctx, 'her satır aynı biçimde', 830, a * after(t, 'struct-list', 4, 0.6) * (1 - after(t, 'struct-name', 0, 0.6)), { color: C.flame });
    // adı ve yetenekleri
    const na = a * after(t, 'struct-name', 0, 0.6);
    pill(ctx, 'YAPILANDIRILMIŞ VERİ', 1550, 300, { size: 28, color: C.fire, alpha: na });
    text(ctx, '= düzenli veri', 1550, 370, { size: 36, family: 'serif', italic: true, color: C.cream, alpha: a * after(t, 'struct-name', 1, 0.6) });
    ['tabloya yerleşir', 'sorgulanır', 'sıralanır'].forEach((s, i) => {
      const ia = a * after(t, 'struct-name', 2 + i, 0.6);
      tick(ctx, 1400, 470 + i * 80, 0.8, C.ok, ia, after(t, 'struct-name', 2 + i, 0.6, ease.inOut));
      text(ctx, s, 1440, 470 + i * 80, { size: 34, color: C.cream, align: 'left', alpha: ia });
    });
    // sorgu
    if (q > 0) {
      pill(ctx, 'SORGU:  Sınıf = 7-B', 775, 180, { size: 30, family: 'mono', color: C.digital, alpha: a * q });
      const ca = a * after(t, 'struct-query', 2, 0.6);
      const n = Math.round(10000 * progress(t, cue('struct-query', 2), cue('struct-query', 2) + 1.0, ease.out));
      text(ctx, `${n.toLocaleString('tr-TR')} satır`, 775, 820, { size: 40, family: 'mono', weight: 700, color: C.cream, alpha: ca });
      pill(ctx, '⏱  0,001 sn', 775, 890, { size: 30, color: C.ok, alpha: a * after(t, 'struct-query', 3, 0.6) });
      const da = a * after(t, 'struct-query', 4, 0.7);
      drawIcon(ctx, 'door', 1550, 820, 1.0, C.flame, da, 0.15 + 0.1 * Math.sin(t));
      text(ctx, '5. KAPI', 1550, 915, { size: 28, weight: 800, spacing: 4, color: C.flame, alpha: da });
      text(ctx, 'ana konusu', 1550, 955, { size: 24, family: 'serif', italic: true, color: C.muted, alpha: a * after(t, 'struct-query', 5, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 13 · Düzensiz veri
  // ---------------------------------------------------------------------------

  const INK = '#2b3a67';
  const NOTE_LINES = [
    [1, 'Ali matematikte biraz zorlanıyor, son sınavda', -0.01],
    [1, '60 civarı almış galiba… ödevlerini de', 0.008],
    [1, 'Ayşe çok meraklı ama derste sık sık dalıyor,', -0.006],
    [1, 'annesiyle konuşuldu, kitap önerildi', 0.01],
  ];

  function drawNotebook(ctx, x, y, s, rot, alpha, t, k) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = '#f6f0e2';
    ctx.fillRect(-400, -360, 800, 720);
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(80,130,200,0.25)';
    ctx.lineWidth = 2;
    for (let yy = -280; yy < 360; yy += 56) line(ctx, -400, yy, 400, yy);
    ctx.strokeStyle = 'rgba(220,80,80,0.45)';
    line(ctx, -320, -360, -320, 360);
    ctx.restore();
    const at = (dx, dy) => {
      const c = Math.cos(rot);
      const sn = Math.sin(rot);
      return [x + (dx * c - dy * sn) * s, y + (dx * sn + dy * c) * s];
    };
    const T = (str, dx, dy, o) => {
      const [px, py] = at(dx, dy);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rot + (o.rot ?? 0));
      text(ctx, str, 0, 0, { size: (o.size ?? 30) * s, family: 'serif', italic: true, color: o.color ?? INK, align: o.align ?? 'left', alpha: alpha * (o.alpha ?? 1) });
      ctx.restore();
    };
    T('Veli toplantısı — 7-B', -290, -310, { size: 38, alpha: k.title });
    NOTE_LINES.forEach(([, str, r], i) => T(str, -290, -230 + i * 56, { rot: r, alpha: k.lines * clamp(k.linesP * 4 - i) }));
    // oklar ve halka
    if (k.arrows > 0) {
      ctx.save();
      ctx.globalAlpha *= alpha * k.arrows;
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 3 * s;
      ctx.lineCap = 'round';
      const [ax, ay] = at(-300, -175);
      ctx.beginPath();
      ctx.ellipse(ax + 70 * s, ay, 95 * s, 30 * s, rot, 0, Math.PI * 2);
      ctx.stroke();
      const p0 = at(280, -170);
      const p1 = at(340, -80);
      const p2 = at(250, 30);
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]);
      ctx.stroke();
      ctx.restore();
      T('haftaya kontrol!', 120, 70, { size: 28, color: '#c0392b', rot: -0.08, alpha: k.arrows });
      T('?!', 330, -250, { size: 40, color: '#c0392b', rot: 0.2, alpha: k.arrows });
    }
    T('Yapılacaklar:', -290, 160, { size: 32, alpha: k.list });
    T('1) kitap listesi', -260, 216, { size: 30, alpha: k.list });
    T('2) ödev takibi', -260, 272, { size: 30, alpha: k.list * clamp(k.listP * 3 - 1) });
    T('3)', -260, 328, { size: 30, alpha: k.list * clamp(k.listP * 3 - 2) });
  }

  const MEDIA = [['photo', 1260, 400, -0.12, 2], ['sound', 1560, 450, 0.08, 3], ['video', 1380, 600, 0.1, 4], ['text', 1660, 640, -0.08, 4], ['photo', 1520, 760, 0.15, 4], ['note', 1230, 720, -0.05, 4]];

  function sceneMessy(ctx, lt, t) {
    kicker(ctx, 'DÜZENSİZ VERİ', lt, 18);
    const a = spanVis(lt, 'messy.notes', 'messy.name');
    if (a <= 0) return;
    const side = after(t, 'messy-name', 0, 1.0, ease.inOut);
    const k = {
      title: after(t, 'messy-notes', 0, 0.6),
      lines: after(t, 'messy-notes', 1, 0.4),
      linesP: progress(t, cue('messy-notes', 1), cue('messy-notes', 1) + 2.0, ease.linear),
      arrows: after(t, 'messy-notes', 2, 0.6),
      list: after(t, 'messy-notes', 3, 0.4),
      listP: progress(t, cue('messy-notes', 3), cue('messy-notes', 3) + 1.2, ease.linear),
    };
    drawNotebook(ctx, lerp(W / 2, 560, side), lerp(580, 560, side), lerp(1, 0.86, side), lerp(-0.025, -0.04, side), a * after(t, 'messy-notes', 0, 0.6), t, k);
    // adı ve karmaşık küme
    const na = a * after(t, 'messy-name', 0, 0.6);
    pill(ctx, 'YAPILANDIRILMAMIŞ VERİ', 1470, 220, { size: 28, color: C.violet, alpha: na });
    text(ctx, '= düzensiz veri', 1470, 285, { size: 36, family: 'serif', italic: true, color: C.cream, alpha: a * after(t, 'messy-name', 1, 0.6) });
    MEDIA.forEach(([ic, x, y, r, kk], i) => {
      const ma = a * after(t, 'messy-name', kk, 0.6, ease.back);
      if (ma <= 0) return;
      ctx.save();
      ctx.translate(x + Math.sin(t * 0.8 + i) * 8, y + Math.cos(t * 0.7 + i * 2) * 6);
      ctx.rotate(r);
      panel(ctx, 0, 0, 150, 120, clamp(ma), { fill: '#1a2440', stroke: rgba(VIO, 0.6), r: 16 });
      if (ic === 'note') stickyNote(ctx, 0, 0, 80, 70, 0.1, '#ffe8a3', clamp(ma));
      else drawIcon(ctx, ic, 0, 0, 0.9, C.cream, clamp(ma));
      ctx.restore();
    });
    const ba = a * after(t, 'messy-name', 5, 0.8);
    if (ba > 0) {
      ctx.save();
      ctx.globalAlpha *= ba;
      ctx.strokeStyle = rgba(VIO, 0.7);
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      for (let k2 = 0; k2 <= 40; k2++) {
        const ang = (k2 / 40) * Math.PI * 2;
        const r = 330 + 30 * Math.sin(ang * 5 + t * 0.6);
        const px = 1450 + Math.cos(ang) * r * 1.0;
        const py = 580 + Math.sin(ang) * r * 0.75;
        if (k2 === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    // fotoğraf da sayılardan oluşur, ama "kim" sütunu yok
    const pa = a * after(t, 'messy-name', 6, 0.6);
    if (pa > 0) {
      const grid = ['128  64 200  31', ' 90 210  17 155', '240  12  88 176'];
      grid.forEach((g, i) => text(ctx, g, 1450, 900 + i * 34, { size: 26, family: 'mono', weight: 600, color: C.digital, alpha: pa }));
      arrow(ctx, 1260, 760, 1300, 860, C.digital, pa, 3, 12);
      const ka = a * after(t, 'messy-name', 7, 0.6);
      pill(ctx, 'kim?', 1740, 930, { size: 30, color: C.error, alpha: ka });
      cross(ctx, 1740, 990, 0.7, C.error, ka, after(t, 'messy-name', 8, 0.6, ease.inOut));
      text(ctx, 'hiçbir sütun söylemez', 1000, 1030, { size: 32, family: 'serif', italic: true, color: C.muted, alpha: a * after(t, 'messy-name', 8, 0.6) });
    }
  }

  // Aynı soru: tabloda bir adım, toplantı kâğıdında saklı
  const GRADES = [['Ayşe', '85', '92'], ['Ali', '60', '78'], ['Can', '74', '70'], ['Elif', '91', '87']];

  function sceneAsk(ctx, lt, t) {
    const a = beatVis(lt, 'messy.ask');
    if (a <= 0) return;
    text(ctx, 'farkı bir soruyla görelim', W / 2, 120, { size: 34, family: 'serif', italic: true, color: C.muted, alpha: a * after(t, 'messy-ask', 0, 0.6) });
    pill(ctx, 'Ali’nin matematik notu kaç?', W / 2, 200, { size: 40, color: C.flame, alpha: a * after(t, 'messy-ask', 1, 0.6) });
    // tablo
    const ta = a * after(t, 'messy-ask', 0, 0.6);
    text(ctx, 'TABLO', 485, 300, { size: 24, weight: 800, spacing: 6, color: C.muted, alpha: ta });
    const rowK = after(t, 'messy-ask', 2, 0.5);
    const colK = after(t, 'messy-ask', 3, 0.5);
    drawTable(ctx, 160, 340, [{ w: 230, head: 'Öğrenci', align: 'left' }, { w: 230, head: 'Matematik', headColor: colK > 0.5 ? C.flame : C.muted }, { w: 190, head: 'Türkçe' }], GRADES, {
      alpha: ta,
      rowH: 84,
      size: 38,
      rowHi: (j) => (j === 1 ? rowK : 0),
      cellColor: (j, i) => (j === 1 && i === 1 && colK > 0.5 ? C.flame : i === 0 ? C.cream : C.muted),
    });
    if (colK > 0) {
      ctx.save();
      ctx.globalAlpha *= a * colK;
      ctx.fillStyle = rgba(FIRE, 0.12);
      ctx.fillRect(390, 340, 230, 62 + 4 * 84);
      ctx.restore();
      glow(ctx, 505, 340 + 62 + 84 + 42, 110, FIRE, 0.4 * a * colK);
      tick(ctx, 580, 486, 0.9, C.ok, a * colK, after(t, 'messy-ask', 3, 0.8, ease.inOut));
      text(ctx, 'satır × sütun: tek adım', 485, 820, { size: 32, family: 'serif', italic: true, color: C.ok, alpha: a * colK });
    }
    // toplantı kâğıdı
    const pa = a * after(t, 'messy-ask', 4, 0.6);
    text(ctx, 'TOPLANTI KÂĞIDI', 1390, 300, { size: 24, weight: 800, spacing: 6, color: C.muted, alpha: pa });
    if (pa > 0) {
      ctx.save();
      ctx.globalAlpha *= pa;
      ctx.translate(1390, 520);
      ctx.rotate(0.02);
      ctx.fillStyle = '#f6f0e2';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 30;
      ctx.fillRect(-380, -170, 760, 340);
      ctx.restore();
      const hl = after(t, 'messy-ask', 6, 0.6);
      if (hl > 0) {
        ctx.save();
        ctx.globalAlpha *= a * hl;
        ctx.fillStyle = 'rgba(255,215,90,0.55)';
        ctx.fillRect(1030, 520, 250, 46);
        ctx.restore();
      }
      [['Ali matematikte biraz zorlanıyor,', 5], ['son sınavda 60 civarı almış', 6], ['galiba… ödevlerini de…', 6]].forEach(([s, kk], i) => {
        text(ctx, s, 1040, 450 + i * 70, { size: 38, family: 'serif', italic: true, color: INK, align: 'left', alpha: a * after(t, 'messy-ask', kk, 0.6) });
      });
    }
    const ba = a * after(t, 'messy-ask', 7, 0.6);
    drawBot(ctx, 1390, 860, 0.9, ba, t);
    bubble(ctx, 1520, 780, 90, 80, ba, { fill: '#1c2640', stroke: C.digital });
    text(ctx, '?', 1520, 782, { size: 56, family: 'display', weight: 900, color: C.digital, alpha: ba });
    cross(ctx, 1250, 860, 1.3, C.error, a * after(t, 'messy-ask', 8, 0.6), after(t, 'messy-ask', 8, 0.8, ease.inOut));
    text(ctx, 'kendiliğinden bulamaz', 1390, 980, { size: 32, family: 'serif', italic: true, color: C.error, alpha: a * after(t, 'messy-ask', 8, 0.6) });
  }

  // ---------------------------------------------------------------------------
  // 14 · Buzdağı ve yapay zekâ
  // ---------------------------------------------------------------------------

  const BERG = [['photo', 640, 560, 'kedi · kanepe'], ['sound', 860, 640, '“merhaba”'], ['text', 1080, 560, 'konu: sınav'], ['video', 1300, 650, 'gol anı'], ['photo', 760, 800, 'deniz · tekne'], ['note', 1000, 780, 'Ali · mat · 60'], ['sound', 1220, 840, '“yarın ara”'], ['text', 1420, 520, 'şikâyet'], ['video', 560, 700, 'doğum günü']];

  function sceneIceberg(ctx, lt, t) {
    const a = spanVis(lt, 'messy.iceberg', 'messy.ai');
    if (a <= 0) return;
    const WL = 420;
    const ia = a * after(t, 'messy-iceberg', 0, 0.8);
    // su
    ctx.save();
    ctx.globalAlpha *= ia;
    const g = ctx.createLinearGradient(0, WL, 0, H);
    g.addColorStop(0, '#0d2c4a');
    g.addColorStop(1, '#030a16');
    ctx.fillStyle = g;
    ctx.fillRect(0, WL, W, H - WL);
    ctx.strokeStyle = 'rgba(124,200,255,0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 20) {
      const y = WL + Math.sin(x * 0.02 + t * 1.5) * 4;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // su altındaki kütle
    ctx.fillStyle = 'rgba(160,210,255,0.16)';
    ctx.strokeStyle = 'rgba(124,200,255,0.45)';
    ctx.beginPath();
    const under = [[780, WL], [560, 500], [430, 680], [480, 900], [700, 1040], [1000, 1060], [1300, 1000], [1500, 850], [1560, 640], [1430, 480], [1160, WL]];
    under.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // görünen uç
    ctx.fillStyle = 'rgba(230,242,255,0.9)';
    ctx.beginPath();
    [[800, WL], [870, 330], [960, 270], [1050, 320], [1140, WL]].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    text(ctx, 'verinin ezici çoğunluğu düzensizdir', W / 2, 130, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: a * after(t, 'messy-iceberg', 1, 0.6) * (1 - after(t, 'messy-ai', 0, 0.6)) });
    const tipA = a * after(t, 'messy-iceberg', 3, 0.6);
    drawIcon(ctx, 'table', 960, 360, 0.8, C.ink, tipA);
    pill(ctx, 'düzenli tablolar', 1260, 300, { size: 30, color: C.fire, alpha: tipA });
    const ua = a * after(t, 'messy-iceberg', 4, 0.6);
    const beam = progress(t, cue('messy-ai', 0), cue('messy-ai', 2) + 1.5, ease.inOut);
    const beamX = lerp(380, 1600, beam);
    BERG.forEach(([ic, x, y, lab], i) => {
      const ba = ua * progress(t, cue('messy-iceberg', 4) + i * 0.12, cue('messy-iceberg', 4) + i * 0.12 + 0.5);
      if (ba <= 0) return;
      const yy = y + Math.sin(t * 0.7 + i) * 6;
      if (ic === 'note') stickyNote(ctx, x, yy, 70, 60, 0.1, '#ffe8a3', ba * 0.9);
      else drawIcon(ctx, ic, x, yy, 0.75, '#cfe6ff', ba * 0.85);
      const la = a * clamp((beamX - x) / 60) * (beam > 0 ? 1 : 0) * (1 - after(t, 'messy-ai', 3, 0.8) * 0.5);
      pill(ctx, lab, x, yy - 62, { size: 22, color: C.violet, fill: '#1c1830', alpha: la });
    });
    text(ctx, 'düzensiz yığın', 1000, 1000, { size: 40, family: 'serif', italic: true, color: '#cfe6ff', alpha: a * after(t, 'messy-iceberg', 5, 0.6) * (1 - beam) });
    // yapay zekâ taraması
    if (beam > 0 && beam < 1) {
      const gr = ctx.createLinearGradient(beamX - 80, 0, beamX + 80, 0);
      gr.addColorStop(0, 'rgba(180,156,255,0)');
      gr.addColorStop(0.5, `rgba(180,156,255,${0.35 * a})`);
      gr.addColorStop(1, 'rgba(180,156,255,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(beamX - 80, WL, 160, H - WL);
    }
    text(ctx, 'yapay zekâ: düzensiz yığından anlam çıkarmak', W / 2, 130, { size: 44, family: 'serif', italic: true, color: C.violet, alpha: a * after(t, 'messy-ai', 1, 0.6) * (1 - after(t, 'messy-ai', 3, 0.6)) });
    text(ctx, 'ama sırası gelince…', W / 2, 150, { size: 52, family: 'serif', italic: true, color: C.flame, alpha: a * after(t, 'messy-ai', 4, 0.8) });
  }

  // ---------------------------------------------------------------------------
  // 15 · Özet ve kapanış
  // ---------------------------------------------------------------------------

  function sceneSum(ctx, lt, t) {
    const a = beatVis(lt, 'sum.ladder');
    if (a <= 0) return;
    text(ctx, 'özetleyelim', W / 2, 150, { size: 40, family: 'serif', italic: true, color: C.muted, alpha: a * after(t, 'sum-ladder', 0, 0.6) });
    const lab = [after(t, 'sum-ladder', 1, 0.6), after(t, 'sum-ladder', 3, 0.6), after(t, 'sum-ladder', 5, 0.6)];
    const hi = [after(t, 'sum-ladder', 2, 0.6), after(t, 'sum-ladder', 4, 0.6), after(t, 'sum-ladder', 6, 0.6)];
    const rise = [0, 1, 2].map((i) => progress(lt, 0.3 + i * 0.25, 1.1 + i * 0.25, ease.out));
    const tops = drawLadder(ctx, LAD.x0, LAD.yb, { sw: LAD.sw, sh: LAD.sh, d: LAD.d, rise, hi, labels: lab, alpha: a, sub: ['ham ölçüm', 'bağlamına oturtulmuş veri', 'insanın yargısı'] });
    const ma = a * after(t, 'sum-ladder', 7, 0.6);
    drawBot(ctx, tops[0].x, tops[0].y - 70, 0.75, ma, t);
    drawBot(ctx, tops[1].x, tops[1].y - 70, 0.75, ma, t, { seed: 2 });
    pill(ctx, 'makinelerin ustalığı', (tops[0].x + tops[1].x) / 2, tops[1].y - 190, { size: 28, color: C.digital, alpha: ma });
    const ha = a * after(t, 'sum-ladder', 8, 0.6);
    if (ha > 0) glow(ctx, tops[2].x, tops[2].y - 70, 200, VIO, 0.35 * ha);
    drawPerson(ctx, tops[2].x, tops[2].y - 50, 2.0, C.cream, ha);
    pill(ctx, 'SORUMLULUK BİZDE', tops[2].x, tops[2].y - 200, { size: 28, color: C.violet, alpha: a * after(t, 'sum-ladder', 9, 0.6) });
  }

  function sceneClose(ctx, lt, t) {
    drawStone(ctx, W / 2, 540, 1200, 560, 1, 5);
    drawTraces(ctx, lt + 3, 0, 0.01, 0.35);
    const w = (k) => after(t, 'close-end', k, 0.6);
    runs(ctx, [
      ['Veri, ', { size: 92, family: 'serif', italic: true, color: C.digital, alpha: w(0) }],
      ['bilgi, ', { size: 92, family: 'serif', italic: true, color: C.fire, alpha: w(1) }],
      ['anlam.', { size: 92, family: 'serif', italic: true, color: C.violet, alpha: w(2) }],
    ], W / 2, 540);
    text(ctx, 'Veri masumdur. Yorum sorumluluktur.', W / 2, 650, { size: 40, family: 'serif', color: C.cream, alpha: progress(t, cue('close-end', 2) + 0.6, cue('close-end', 2) + 1.4) });
    text(ctx, 'BİRİNCİ KAPI · 4. BÖLÜM · SON', W / 2, 900, { size: 22, weight: 600, spacing: 10, color: C.muted, alpha: progress(lt, 0.8, 1.3) });
  }

  // ---------------------------------------------------------------------------
  // Ses: müzik ve efektler (anlatım sonradan eklenir)
  // ---------------------------------------------------------------------------

  function score(m, hz) {
    const { at, span } = TL;
    const untilEnd = (id, a, margin) => TL.scene(id).end - margin - at(id, a);
    const scenePad = (id, notes, opts = {}) => m.pad(at(id, 0), untilEnd(id, 0, 0.4), notes, { gain: 0.24, attack: 1.6, release: 2.6, ...opts });
    const ding = (tm, note, g = 0.1, pan = 0, decay = 2.4) => m.bell(tm, { freq: hz(note), gain: g, decay, pan });
    const pop = (tm, note, pan = 0, g = 0.08) => m.pop(tm, { freq: hz(note), gain: g, pan });
    const c = cue;

    // 0 · Açılış: basamaklar yükselir, başlık
    m.pad(0, 7.4, ['D2', 'A2', 'D3'], { gain: 0.3, attack: 3, release: 2.5, cutoff: 600 });
    [0, 1, 2].forEach((i) => {
      m.boom(at('open', 0.5 + i * 0.5), { gain: 0.12 + i * 0.04, freq: 50 + i * 12 });
      m.click(at('open', 0.6 + i * 0.5), { gain: 0.06, tone: 1800 + i * 400, pan: (i - 1) * 0.5 });
    });
    m.riser(at('open', 1.6), span('open', 1.6, 3.3), { gain: 0.06 });
    m.boom(at('open', 3.3), { gain: 0.38 });
    ding(at('open', 3.6), 'D5', 0.18, 0, 3);
    [['F#5', -0.5], ['A5', 0], ['D6', 0.5]].forEach(([n, pan], i) => ding(c('open-title', 2 + i) + 0.05, n, 0.08, pan, 2.4));

    // 1 · Buraya kadar
    scenePad('recap', ['F2', 'C3', 'A3', 'E4']);
    pop(c('recap-path', 0) + 0.2, 'C5', -0.6);
    [1, 2, 3].forEach((k, i) => {
      m.whoosh(c('recap-path', k), { dur: 0.6, from: 500, to: 1800, gain: 0.04, panFrom: -0.6 + i * 0.4, panTo: -0.2 + i * 0.4 });
      pop(c('recap-path', k) + 0.3, ['E5', 'G5', 'C6'][i], -0.2 + i * 0.4);
    });
    m.whoosh(c('recap-step', 0), { dur: 1.2, from: 2400, to: 400, gain: 0.06 });
    m.boom(c('recap-step', 1) + 0.2, { gain: 0.2, freq: 60 });
    ding(c('recap-step', 1) + 0.25, 'A5', 0.1, 0, 3);
    for (let g = 0; g < 9; g++) m.tick(c('recap-step', 3) + g * 0.12, { gain: 0.04, tone: 3000 + g * 120, pan: (g - 4) * 0.15 });
    m.riser(c('recap-question', 0) - 0.4, 1.0, { gain: 0.05 });
    ding(c('recap-question', 1) + 0.1, 'E5', 0.12, 0, 3.5);
    ding(c('recap-question', 1) + 0.14, 'B5', 0.06, 0, 3.5);

    // 2 · Aynı sayı, üç dünya
    scenePad('thermo', ['A2', 'E3', 'C4', 'G4'], { gain: 0.22 });
    m.blip(c('thermo-alone', 0), { freq: 300, dur: 1.4, slide: 2.2, type: 'sine', gain: 0.04 });
    m.blip(c('thermo-alone', 1), { freq: hz('A5'), dur: 0.12, type: 'square', gain: 0.03 });
    m.blip(c('thermo-alone', 1) + 0.14, { freq: hz('A5'), dur: 0.12, type: 'square', gain: 0.03 });
    [0, 0.2, 0.4].forEach((d, i) => pop(c('thermo-alone', 3) + d, ['D5', 'C5', 'Bb4'][i], (i - 1) * 0.5, 0.06));
    m.whoosh(c('thermo-room', 0), { dur: 0.9, from: 600, to: 2400, gain: 0.05, panFrom: 0, panTo: -0.6 });
    m.wind(c('thermo-room', 0) + 0.3, 2.4, { gain: 0.03 });
    ding(c('thermo-room', 1), 'E5', 0.07, -0.6);
    m.whoosh(c('thermo-child', 0), { dur: 0.9, from: 600, to: 2400, gain: 0.05 });
    for (let k = 0; k < 6; k++) m.tick(c('thermo-child', 1) + k * 0.5, { gain: 0.04, tone: 2400 });
    ding(c('thermo-child', 1) + 0.1, 'C5', 0.06, 0, 3);
    m.whoosh(c('thermo-oven', 0), { dur: 0.9, from: 600, to: 2400, gain: 0.05, panFrom: 0, panTo: 0.6 });
    m.blip(c('thermo-oven', 1), { freq: 600, dur: 0.6, slide: 0.4, type: 'triangle', gain: 0.05, pan: 0.6 });
    ding(c('thermo-oven', 3), 'G5', 0.06, 0.6);
    m.boom(c('thermo-three', 0), { gain: 0.18, freq: 60 });
    [-0.6, 0, 0.6].forEach((pan, i) => ding(c('thermo-three', 1) + i * 0.15, ['A4', 'C5', 'E5'][i], 0.08, pan, 3));
    m.riser(c('thermo-rule', 1), 1.2, { gain: 0.05 });
    [2, 3].forEach((k, i) => m.boom(c('thermo-rule', k), { gain: 0.14, freq: 55 + i * 10 }));
    m.boom(c('thermo-rule', 3) + 0.6, { gain: 0.14, freq: 75 });
    [['D5', -0.5], ['F#5', 0], ['A5', 0.5]].forEach(([n, pan], i) => ding([c('thermo-rule', 2), c('thermo-rule', 3), c('thermo-rule', 3) + 0.6][i] + 0.1, n, 0.08, pan, 2.6));
    m.buzz(c('thermo-rule', 4) + 0.2, { gain: 0.04, dur: 0.25 });

    // 3 · Veri
    scenePad('data', ['D3', 'A3', 'E4', 'F#4'], { gain: 0.22, cutoff: 1100 });
    m.boom(c('data-def', 1), { gain: 0.2, freq: 60 });
    ding(c('data-def', 1) + 0.05, 'F#5', 0.1, 0, 3);
    for (let k = 0; k < 4; k++) {
      pop(c('data-examples', k * 2), ['D5', 'E5', 'F#5', 'A5'][k], (k - 1.5) * 0.4, 0.08);
      m.click(c('data-examples', [1, 3, 5, 8][k]), { gain: 0.12, tone: 1600, pan: (k - 1.5) * 0.4 });
    }
    [1, 2, 3].forEach((k, i) => m.whoosh(c('data-source', k) + 0.2, { dur: 0.7, from: 500, to: 2000, gain: 0.04, panFrom: -0.6, panTo: -0.2 }));
    m.tick(c('data-source', 2) + 0.1, { gain: 0.06, tone: 3000 });
    m.click(c('data-source', 3) + 0.1, { gain: 0.12, tone: 4200 });
    for (let j = 0; j < 7; j++) m.typeKey(c('data-source', 4) + 0.6 + j * 0.16, { gain: 0.05, pan: 0.5 });
    ding(c('data-source', 6) + 0.1, 'A5', 0.09, 0, 3);
    m.riser(c('data-innocent', 1) - 0.3, 0.8, { gain: 0.04 });
    ding(c('data-innocent', 1) + 0.3, 'D6', 0.07, 0, 3.5);
    m.buzz(c('data-innocent', 3) + 0.3, { gain: 0.04, dur: 0.3 });
    ding(c('data-innocent', 4) + 0.3, 'A5', 0.08, 0.4);
    m.click(c('data-broken', 1) + 0.2, { gain: 0.16, tone: 5200, pan: -0.6 });
    m.glitch(c('data-broken', 1) + 0.25, 0.25, { gain: 0.05 });
    for (let k = 0; k < 4; k++) m.hoof(c('data-broken', 3) + k * 0.5, { gain: 0.04, pan: -0.1 });
    m.buzz(c('data-broken', 4), { gain: 0.05, dur: 0.3 });
    for (let i = 0; i < 4; i++) m.pop(c('data-broken', 5) + 0.3 + i * 0.35, { freq: hz(['C5', 'D5', 'E5', 'F5'][i]), gain: 0.06, pan: 0.5 });
    const tf = c('data-broken', 6) + 1.4;
    m.whoosh(tf, { dur: 1.0, from: 1800, to: 200, gain: 0.06, panFrom: 0.4, panTo: 0.7 });
    [0.6, 0.85, 1.05, 1.2].forEach((d, i) => m.hoof(tf + d, { gain: 0.08, pan: 0.5 + i * 0.1 }));
    m.boom(tf + 1.2, { gain: 0.14, freq: 80 });

    // 4 · Bilgi
    scenePad('info', ['F2', 'C3', 'A3', 'D4'], { gain: 0.22 });
    m.boom(c('info-def', 1), { gain: 0.2, freq: 60 });
    ding(c('info-def', 1) + 0.05, 'A5', 0.1, 0, 3);
    m.whoosh(c('info-def', 3), { dur: 1.0, from: 300, to: 1200, gain: 0.05 });
    m.click(c('info-def', 3) + 1.0, { gain: 0.14, tone: 1800 });
    pop(c('info-context', 2) + 0.1, 'C5', 0, 0.1);
    [3, 5, 7].forEach((k, i) => {
      m.whoosh(c('info-context', k), { dur: 1.0, from: 400, to: 1800, gain: 0.04, panFrom: 0, panTo: (i - 1) * 0.7 });
      pop(c('info-context', k) + 1.0, ['F5', 'A5', 'C6'][i], (i - 1) * 0.7, 0.08);
    });
    m.tick(c('info-context', 4), { gain: 0.06, tone: 2600, pan: -0.7 });
    ding(c('info-context', 10) + 0.2, 'F5', 0.1, 0, 3);
    [0, 0.3, 0.6].forEach((d, i) => pop(c('info-questions', 0) + d, ['C5', 'E5', 'G5'][i], (i - 1) * 0.6, 0.06));
    [3, 5, 7].forEach((k, i) => m.blip(c('info-questions', k), { freq: hz(['A5', 'C6', 'E6'][i]), dur: 0.18, type: 'triangle', gain: 0.05, pan: (i - 1) * 0.6 }));
    ding(c('info-questions', 1) + 0.2, 'F5', 0.08);
    m.whoosh(c('info-sentence', 0), { dur: 1.0, from: 2000, to: 500, gain: 0.05 });
    m.click(c('info-sentence', 3) + 0.05, { gain: 0.18, tone: 1400 });
    m.boom(c('info-sentence', 3) + 0.05, { gain: 0.12, freq: 90 });
    pop(c('info-compare', 1) + 0.1, 'C5', -0.3);
    pop(c('info-compare', 2) + 0.1, 'F5', 0.3);
    m.blip(c('info-compare', 2), { freq: 400, dur: 0.9, slide: 1.6, type: 'triangle', gain: 0.04 });
    m.whoosh(c('info-compare', 3), { dur: 1.0, from: 800, to: 3000, gain: 0.04, panFrom: -0.6, panTo: 0.6 });
    m.buzz(c('info-compare', 5) + 0.1, { gain: 0.05, dur: 0.4 });

    // 5 · Anlam ve karar
    scenePad('judge', ['Bb2', 'F3', 'D4', 'A4'], { gain: 0.24, cutoff: 800 });
    m.boom(c('judge-def', 1), { gain: 0.24, freq: 55 });
    ding(c('judge-def', 1) + 0.05, 'D5', 0.12, 0, 3.5);
    [0, 0.9, 1.8, 2.7].forEach((d, i) => pop(c('judge-def', 3) + d, ['Bb4', 'D5', 'F5', 'A5'][i], (i - 1.5) * 0.4, 0.08));
    ding(c('judge-def', 3) + 2.8, 'D6', 0.08, 0.4, 3);
    pop(c('judge-days', 0) + 0.3, 'F4', -0.5);
    pop(c('judge-days', 0) + 1.0, 'G4', -0.3);
    m.riser(c('judge-days', 3), 1.2, { gain: 0.04 });
    m.whoosh(c('judge-days', 5), { dur: 1.2, from: 300, to: 1400, gain: 0.05 });
    ding(c('judge-days', 6) + 0.2, 'F5', 0.12, 0, 3.5);
    ding(c('judge-days', 6) + 0.24, 'A5', 0.06, 0, 3.5);
    m.buzz(c('judge-verdict', 0) + 0.3, { gain: 0.035, dur: 0.25 });
    m.buzz(c('judge-verdict', 1) + 0.3, { gain: 0.035, dur: 0.25 });
    ding(c('judge-verdict', 2) + 0.2, 'D5', 0.1, 0, 3);
    m.riser(c('judge-verdict', 3) - 0.2, 1.0, { gain: 0.05 });
    ding(c('judge-verdict', 5) + 0.2, 'Bb5', 0.1, 0, 3.5);
    m.heartbeat(c('judge-verdict', 3) + 0.4, { gain: 0.25 });

    // 6 · Merdiven ve makine
    scenePad('ladder', ['D3', 'A3', 'C4', 'F4'], { gain: 0.22 });
    [0, 1, 2].forEach((i) => m.boom(at('ladder', 0.3 + i * 0.3), { gain: 0.1, freq: 55 + i * 10 }));
    [2, 4, 6].forEach((k, i) => pop(c('ladder-three', k), ['D5', 'F5', 'A5'][i], (i - 1) * 0.5, 0.08));
    m.blip(c('ladder-machine', 0), { freq: hz('E5'), dur: 0.15, type: 'square', gain: 0.03 });
    m.blip(c('ladder-machine', 0) + 0.15, { freq: hz('A5'), dur: 0.15, type: 'square', gain: 0.03 });
    [0.5, 1.2].forEach((d) => m.hoof(c('ladder-machine', 1) + d, { gain: 0.06, pan: -0.3 }));
    [2, 3, 4, 5].forEach((k, i) => m.blip(c('ladder-machine', k), { freq: hz(['C5', 'E5', 'G5', 'C6'][i]), dur: 0.12, type: 'triangle', gain: 0.05, pan: -0.5 + i * 0.3 }));
    m.whoosh(c('ladder-machine', 6), { dur: 0.5, from: 2000, to: 8000, gain: 0.04 });
    m.click(c('ladder-help', 1) + 0.1, { gain: 0.12, tone: 1600, pan: 0.4 });
    [0, 0.14, 0.28].forEach((d) => m.blip(c('ladder-help', 3) + d, { freq: 1320, dur: 0.08, type: 'sine', gain: 0.04, pan: 0.1 }));
    ding(c('ladder-help', 5) + 0.1, 'A5', 0.1, 0.5, 3);
    m.wind(c('ladder-gray', 0), Math.max(0.5, at('ladder', 34) - c('ladder-gray', 0)), { gain: 0.03 });
    ding(c('ladder-gray', 4) + 0.2, 'E5', 0.08, 0.7, 3);
    ding(c('ladder-gray', 4) + 0.5, 'B5', 0.05, 0.7, 3);

    // 7 · Usta sözü
    m.pad(at('motto', 0), untilEnd('motto', 0, 0.3), ['D2', 'A2', 'F3', 'C4'], { gain: 0.26, attack: 1.5, release: 2.4, cutoff: 700 });
    m.boom(c('motto-say', 2), { gain: 0.24, freq: 55 });
    ding(c('motto-say', 2) + 0.05, 'D5', 0.12, 0, 3.5);
    m.boom(c('motto-say', 3) + 0.4, { gain: 0.2, freq: 50 });
    ding(c('motto-say', 3) + 0.45, 'A5', 0.12, 0, 4);
    ding(c('motto-say', 3) + 0.5, 'F5', 0.06, 0, 4);

    // 8 · Gizli yorumlar ve örnekler
    scenePad('hidden', ['C3', 'G3', 'Eb4', 'Bb4'], { gain: 0.22 });
    m.whoosh(c('hidden-report', 0), { dur: 0.8, from: 2000, to: 600, gain: 0.05 });
    m.whoosh(c('hidden-report', 2), { dur: 1.2, from: 300, to: 900, gain: 0.04, panFrom: -0.4, panTo: 0.2, q: 0.8 });
    ding(c('hidden-report', 2) + 1.0, 'Eb5', 0.08, 0.2);
    [0, 1, 2, 3].forEach((k) => pop(c('hidden-four', k), ['C5', 'Eb5', 'G5', 'Bb5'][k], 0.2 + (k % 2) * 0.4, 0.08));
    [0, 0.15, 0.3, 0.45].forEach((d) => m.tick(c('hidden-four', 5) + d, { gain: 0.05, pan: 0.4 }));
    scenePad('survey', ['F2', 'C3', 'Ab3', 'Eb4'], { gain: 0.22 });
    pop(c('hidden-survey', 0), 'C5', -0.7);
    for (let k = 0; k < 10; k++) m.hoof(c('hidden-survey', 3) + 0.2 + k * 0.18, { gain: 0.03, pan: -0.4 + k * 0.03 });
    for (let k = 0; k < 9; k++) m.tick(c('hidden-survey', 5) + k * 0.15, { gain: 0.05, tone: 3200 });
    m.typeKey(c('hidden-survey', 6) + 0.1, { gain: 0.08, pan: 0.5 });
    m.boom(c('hidden-survey', 7), { gain: 0.14, freq: 80 });
    ding(c('hidden-survey', 7) + 0.05, 'C6', 0.07, 0.5);
    m.whoosh(c('hidden-survey', 8), { dur: 1.0, from: 2400, to: 400, gain: 0.05 });
    m.click(c('hidden-survey', 8) + 0.1, { gain: 0.18, tone: 1300, pan: 0.5 });
    m.buzz(c('hidden-survey', 8) + 0.2, { gain: 0.04, dur: 0.3 });
    pop(c('hidden-missing', 0), 'Eb5', -0.7);
    m.blip(c('hidden-missing', 3), { freq: hz('G5'), dur: 0.5, slide: 0.6, type: 'sine', gain: 0.04, pan: 0.6 });
    m.whoosh(c('hidden-missing', 5), { dur: 1.0, from: 1600, to: 300, gain: 0.05, panFrom: 0.5, panTo: 0.7 });
    scenePad('charts', ['Bb2', 'F3', 'D4', 'G4'], { gain: 0.22 });
    pop(c('hidden-window', 0), 'G5', -0.7);
    m.whoosh(c('hidden-window', 2), { dur: 1.6, from: 400, to: 2000, gain: 0.04, panFrom: -0.6, panTo: 0.6 });
    m.blip(c('hidden-window', 3), { freq: 300, dur: 1.0, slide: 2, type: 'triangle', gain: 0.04, pan: -0.5 });
    ding(c('hidden-window', 4) + 0.1, 'D6', 0.07, -0.5);
    m.blip(c('hidden-window', 5), { freq: 600, dur: 1.0, slide: 0.5, type: 'triangle', gain: 0.04, pan: 0.5 });
    ding(c('hidden-window', 6) + 0.1, 'G4', 0.07, 0.5);
    ding(c('hidden-window', 8) + 0.1, 'Bb5', 0.09, 0, 3);
    pop(c('hidden-axis', 0), 'D5', -0.7);
    pop(c('hidden-axis', 2) + 0.1, 'F5', -0.2);
    pop(c('hidden-axis', 3) + 0.1, 'A5', 0.2);
    m.riser(c('hidden-axis', 6), 1.0, { gain: 0.03 });
    m.riser(c('hidden-axis', 8), 1.0, { gain: 0.05 });
    m.boom(c('hidden-axis', 8) + 0.9, { gain: 0.12, freq: 90 });
    m.buzz(c('hidden-axis', 8) + 1.0, { gain: 0.04, dur: 0.3 });
    ding(c('hidden-axis', 10) + 0.1, 'F5', 0.09, 0, 3);
    scenePad('speak', ['G2', 'D3', 'Bb3', 'F4'], { gain: 0.24 });
    ding(c('hidden-myth', 1) + 0.1, 'G5', 0.08);
    ding(c('hidden-myth', 2) + 0.5, 'D6', 0.06, 0.6);
    m.whoosh(c('hidden-myth', 3), { dur: 1.6, from: 300, to: 1600, gain: 0.04 });
    m.buzz(c('hidden-end', 0) + 0.8, { gain: 0.05, dur: 0.35 });
    m.wobble(c('hidden-end', 1), 2.4, { gain: 0.05, freq: 160 });
    m.boom(c('hidden-end', 1) + 0.5, { gain: 0.24, freq: 55 });
    ding(c('hidden-end', 1) + 0.55, 'G5', 0.12, 0, 3.5);
    ding(c('hidden-end', 1) + 0.6, 'D5', 0.07, 0, 3.5);

    // 9 · Verinin türleri
    scenePad('kind', ['E2', 'B2', 'G3', 'D4'], { gain: 0.22 });
    m.whoosh(c('types-why', 0), { dur: 1.2, from: 500, to: 1500, gain: 0.04, panFrom: -0.6, panTo: 0.4 });
    pop(c('types-why', 1) + 0.1, 'G5', 0.4);
    m.boom(c('types-why', 3) + 0.1, { gain: 0.14, freq: 70 });
    m.boom(c('types-why', 3) + 0.9, { gain: 0.14, freq: 70 });
    m.buzz(c('types-why', 3) + 1.5, { gain: 0.04, dur: 0.3 });
    const lampClicks = (tm, bits, pan) => bits.split('').forEach((b, i) => { if (b === '1') m.click(tm + i * 0.06, { gain: 0.07, tone: 2600, pan: pan + (i - 3.5) * 0.08 }); });
    lampClicks(c('types-bits', 2), '00000101', 0);
    lampClicks(c('types-bits', 6), '00110101', 0);
    lampClicks(c('types-bits', 8), '00110101', 0);
    ding(c('types-bits', 8) + 0.5, 'E5', 0.1, 0, 3);
    ding(c('types-bits', 8) + 0.55, 'B5', 0.06, 0, 3);
    [0, 0.2, 0.4].forEach((d, i) => pop(c('types-bits', 9) + d, ['B4', 'A4', 'G4'][i], -0.6, 0.05));
    m.click(c('types-bits', 12) + 0.1, { gain: 0.14, tone: 1500, pan: 0.6 });
    ding(c('types-bits', 12) + 0.15, 'G5', 0.1, 0.6, 3);
    pop(c('types-plus', 1), 'E5', -0.2);
    ding(c('types-plus', 2) + 0.1, 'B5', 0.08, 0.2);
    pop(c('types-plus', 3), 'G5', -0.2);
    m.whoosh(c('types-plus', 4), { dur: 1.0, from: 600, to: 1600, gain: 0.04 });
    m.click(c('types-plus', 4) + 0.95, { gain: 0.14, tone: 1800 });
    ding(c('types-plus', 5) + 0.1, 'D6', 0.08);

    scenePad('types', ['A2', 'E3', 'C#4', 'F#4'], { gain: 0.2 });
    m.whoosh(c('types-intro', 0), { dur: 0.8, from: 1500, to: 500, gain: 0.04 });
    TYPES.forEach((r, j) => {
      const notes = ['A4', 'C#5', 'E5', 'F#5', 'A5'];
      pop(c(r.id, 0), notes[j], -0.6, 0.08);
      for (let k = 0; k < 6; k++) m.typeKey(c(r.id, r.k.demo) + 0.1 + k * 0.05, { gain: 0.04, pan: 0.5 });
    });
    ding(c('types-bool', 6) + 0.1, 'C#6', 0.08, 0.5);
    m.blip(c('types-date', 5) + 0.2, { freq: hz('E5'), dur: 0.2, type: 'triangle', gain: 0.05, pan: 0.5 });

    scenePad('phone', ['D3', 'A3', 'F4', 'C5'], { gain: 0.2 });
    for (let k = 0; k < 11; k++) m.typeKey(c('types-phone', 0) + 0.1 + k * 0.06, { gain: 0.05 });
    m.whoosh(c('types-phone', 1), { dur: 1.0, from: 1600, to: 400, gain: 0.05, panFrom: 0.2, panTo: -0.4 });
    m.blip(c('types-phone', 2) + 0.1, { freq: 700, dur: 1.0, slide: 0.2, type: 'triangle', gain: 0.05, pan: -0.5 });
    m.click(c('types-phone', 2) + 1.1, { gain: 0.1, tone: 3000, pan: -0.6 });
    pop(c('types-phone', 4), 'F5', 0.4);
    pop(c('types-phone', 5), 'F5', 0.4);
    m.click(c('types-plate', 0) + 0.1, { gain: 0.12, tone: 1200 });
    m.whoosh(c('types-plate', 2), { dur: 0.9, from: 1600, to: 400, gain: 0.05, panFrom: 0, panTo: -0.4 });
    m.glitch(c('types-plate', 3), 0.2, { gain: 0.05 });
    m.buzz(c('types-plate', 3) + 0.2, { gain: 0.04, dur: 0.3 });
    m.whoosh(c('types-rule', 0), { dur: 0.9, from: 400, to: 1600, gain: 0.05, panFrom: 0, panTo: 0.4 });
    ding(c('types-rule', 1) + 0.2, 'A5', 0.09, 0.4);
    m.buzz(c('types-rule', 2) + 0.5, { gain: 0.035, dur: 0.25 });
    m.boom(c('types-rule', 7), { gain: 0.16, freq: 60 });
    ding(c('types-rule', 7) + 0.05, 'D5', 0.1, 0, 3);

    // 10 · Düzenli ve düzensiz veri
    scenePad('struct', ['G2', 'D3', 'B3', 'E4'], { gain: 0.2 });
    for (let j = 0; j < 6; j++) m.tick(c('struct-list', 0) + 0.2 + j * 0.15, { gain: 0.04, pan: -0.3 });
    [1, 2, 3].forEach((k, i) => pop(c('struct-list', k), ['G4', 'B4', 'D5'][i], -0.4 + i * 0.3, 0.06));
    m.whoosh(c('struct-list', 4), { dur: 1.2, from: 400, to: 1400, gain: 0.03 });
    ding(c('struct-name', 0) + 0.1, 'G5', 0.08, 0.5);
    [2, 3, 4].forEach((k, i) => m.blip(c('struct-name', k), { freq: hz(['D5', 'G5', 'B5'][i]), dur: 0.15, type: 'triangle', gain: 0.05, pan: 0.5 }));
    for (let j = 0; j < 6; j++) m.click(c('struct-name', 4) + 0.2 + j * 0.12, { gain: 0.05, tone: 2400 + j * 100, pan: -0.2 });
    for (let j = 0; j < 8; j++) m.typeKey(c('struct-query', 0) + 0.05 + j * 0.05, { gain: 0.05 });
    m.whoosh(c('struct-query', 2), { dur: 0.8, from: 3000, to: 9000, gain: 0.03 });
    ding(c('struct-query', 3) + 0.1, 'B5', 0.08);
    ding(c('struct-query', 4) + 0.2, 'E5', 0.08, 0.5, 3);
    scenePad('messy', ['C3', 'G3', 'D4', 'Eb4'], { gain: 0.22 });
    m.wind(c('messy-notes', 0), 1.2, { gain: 0.02 });
    for (let j = 0; j < 14; j++) m.tick(c('messy-notes', 1) + j * 0.14 + hash(j, 9) * 0.05, { gain: 0.025, tone: 1800 + 600 * hash(j, 3) });
    m.whoosh(c('messy-notes', 2), { dur: 0.5, from: 1200, to: 2600, gain: 0.03 });
    m.whoosh(c('messy-notes', 2) + 0.4, { dur: 0.5, from: 1200, to: 2600, gain: 0.03 });
    [2, 3, 4].forEach((k, i) => pop(c('messy-name', k), ['D5', 'Eb5', 'G5'][i], 0.4 + i * 0.1, 0.07));
    m.glitch(c('messy-name', 5), 0.3, { gain: 0.03 });
    m.buzz(c('messy-name', 8) + 0.1, { gain: 0.035, dur: 0.25 });
    scenePad('ask', ['F2', 'C3', 'A3', 'E4'], { gain: 0.2 });
    pop(c('messy-ask', 1), 'A5');
    m.click(c('messy-ask', 2) + 0.1, { gain: 0.1, tone: 2400, pan: -0.5 });
    m.click(c('messy-ask', 3) + 0.1, { gain: 0.1, tone: 2800, pan: -0.5 });
    ding(c('messy-ask', 3) + 0.3, 'E6', 0.08, -0.5, 2);
    m.whoosh(c('messy-ask', 4), { dur: 1.0, from: 400, to: 1200, gain: 0.04, panFrom: 0.2, panTo: 0.5 });
    m.blip(c('messy-ask', 7) + 0.1, { freq: 500, dur: 0.4, slide: 1.4, type: 'square', gain: 0.025, pan: 0.4 });
    m.buzz(c('messy-ask', 8) + 0.1, { gain: 0.05, dur: 0.35 });

    // 11 · Buzdağı ve yapay zekâ
    m.pad(at('iceberg', 0), untilEnd('iceberg', 0, 0.4), ['D2', 'A2', 'E3', 'F#3'], { gain: 0.26, attack: 2, release: 2.6, cutoff: 600 });
    m.rain(c('messy-iceberg', 0), Math.max(0.5, c('messy-ai', 0) - c('messy-iceberg', 0)), { gain: 0.012 });
    m.boom(c('messy-iceberg', 2) + 0.2, { gain: 0.16, freq: 50 });
    ding(c('messy-iceberg', 3) + 0.1, 'A5', 0.07);
    for (let j = 0; j < 9; j++) m.pop(c('messy-iceberg', 4) + j * 0.12, { freq: hz(['D4', 'E4', 'F#4', 'A4'][j % 4]), gain: 0.04, pan: (j - 4) * 0.15 });
    const b0 = c('messy-ai', 0);
    const b1 = c('messy-ai', 2) + 1.5;
    m.whoosh(b0, { dur: Math.max(0.6, b1 - b0), from: 300, to: 2400, gain: 0.05, panFrom: -0.8, panTo: 0.8, q: 2 });
    BERG.forEach(([, x], i) => {
      const tm = b0 + ((x - 380) / 1220) * (b1 - b0);
      m.blip(tm + 0.1, { freq: hz(['D5', 'F#5', 'A5', 'D6'][i % 4]), dur: 0.1, type: 'triangle', gain: 0.04, pan: (x - 960) / 960 });
    });
    ding(c('messy-ai', 4) + 0.2, 'F#5', 0.1, 0, 3.5);

    // 12 · Özet ve kapanış
    scenePad('sum', ['D3', 'A3', 'F#4', 'B4'], { gain: 0.26, attack: 2 });
    [1, 3, 5].forEach((k, i) => {
      m.boom(c('sum-ladder', k), { gain: 0.12, freq: 55 + i * 10 });
      ding(c('sum-ladder', k) + 0.05, ['D5', 'F#5', 'A5'][i], 0.09, (i - 1) * 0.5, 3);
    });
    m.blip(c('sum-ladder', 7), { freq: hz('A5'), dur: 0.12, type: 'square', gain: 0.03, pan: -0.3 });
    m.heartbeat(c('sum-ladder', 8) + 0.2, { gain: 0.2 });
    ding(c('sum-ladder', 9) + 0.2, 'D6', 0.1, 0.4, 3.5);
    m.pad(at('close', 0), untilEnd('close', 0, 0.2), ['D2', 'A2', 'D3', 'F#3'], { gain: 0.26, attack: 1, release: 1.4, cutoff: 600 });
    m.boom(at('close', 0.3), { gain: 0.3 });
    [0, 1, 2].forEach((k) => ding(c('close-end', k) + 0.05, ['D5', 'F#5', 'A5'][k], 0.1, (k - 1) * 0.4, 2.5));
  }

  window.FILM = E.film({
    title: 'Veri, Bilgi, Anlam — Birinci Kapı, 4. Bölüm',
    timeline: TL,
    background,
    score,
    narration: VOICE,
    voice: VOICE.voice,
  });
})();
