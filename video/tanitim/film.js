/*
 * Bilişim Teknolojileri Yetkinliği — kurs tanıtım videosu (Udemy tanıtımı, yaklaşık iki dakika).
 * Tepeden tepeye ateşten iki simgeye; iki simgeden harfe, fotoğrafa, oyuna, yapay zekâya; on iki kapı;
 * kursun anlatım biçimi (gerçek bölüm görüntüleriyle); ders kitabı; kimler için; şu an açık olan kapı; kapanış.
 *
 * "Kurstan görüntüler" sahnesindeki ekran boş çizilir; bölüm videolarından seçilen parçalar
 * montaj.mjs ile ekranın üstüne bindirilir (MONTAGE: kaynak, kaynaktaki başlangıç, filmdeki aralık).
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { W, H, clamp, lerp, ease, progress, vis, hash, noise, rgba, text, measure, runs, glow, roundRect } = E;

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
    ok: '#7fe0a3',
  };
  const FIRE = [255, 150, 60];
  const COOL = [111, 128, 168];
  const DIGI = [124, 200, 255];
  const mixc = (a, b, p) => a.map((x, i) => Math.round(lerp(x, b[i], p)));

  const SCENES = [
    { id: 'fires', base: 14.6, title: 'Tepeden tepeye ateş', draw: sceneFires, fadeIn: 0.8 },
    { id: 'question', base: 10, title: 'İki simgeden her şey', draw: sceneQuestion },
    { id: 'title', base: 8, title: 'Kursun adı', draw: sceneTitle },
    { id: 'gates', base: 21, title: 'On iki kapı', draw: sceneGates },
    { id: 'screen', base: 18, title: 'Kurstan görüntüler', draw: sceneScreen },
    { id: 'book', base: 9, title: 'Ders kitabı', draw: sceneBook },
    { id: 'who', base: 11, title: 'Kimler için', draw: sceneWho },
    { id: 'now', base: 10, title: 'Açık olan kapı', draw: sceneNow },
    { id: 'close', base: 9, title: 'Kapanış', draw: sceneClose, fadeOut: 1.4 },
  ];

  // Seslendirme vuruşları: [sahne, başlangıç, bitiş, donma anı] (koreografi zamanı).
  const BEATS = {
    'fires.chain': ['fires', 0.3, 6.6, 5.9],
    'fires.bit': ['fires', 6.7, 14.6, 13.9],
    'question.ask': ['question', 0.3, 10.0, 9.3],
    'title.say': ['title', 0.3, 8.0, 7.3],
    'gates.intro': ['gates', 0.3, 4.0, 3.3],
    'gates.list': ['gates', 4.1, 21.0, 20.3],
    'screen.style': ['screen', 0.3, 8.0, 7.3],
    'screen.example': ['screen', 8.1, 18.0, 17.3],
    'book.say': ['book', 0.3, 9.0, 8.3],
    'who.say': ['who', 0.3, 11.0, 10.3],
    'now.say': ['now', 0.3, 10.0, 9.3],
    'close.say': ['close', 0.3, 9.0, 8.3],
  };
  const PACE = {};
  const PAUSE = {
    'fires.bit': 0.2,
    'question.ask': 0.4,
    'title.say': 0.5,
    'gates.list': 0.5,
    'screen.example': 0.2,
    'who.say': 0.3,
    'now.say': 0.4,
    'close.say': 1.3,
  };

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
  const after = (t, id, k = 0, d = 0.5, fn = ease.out) => progress(t, cue(id, k), cue(id, k) + d, fn);
  const sceneEnd = (id) => TL.scene(id).end;

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

  function nightSky(ctx, top = '#03050b', mid = '#0d1630', bottom = '#141c36') {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, top);
    sky.addColorStop(0.7, mid);
    sky.addColorStop(1, bottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
  }

  function kicker(ctx, str, a) {
    if (a <= 0) return;
    text(ctx, str, 120, 96, { size: 24, weight: 600, spacing: 8, color: C.muted, align: 'left', alpha: a });
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = C.fire;
    ctx.fillRect(120, 122, 44 * a, 3);
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

  function drawPyre(ctx, x, y, s = 1, ember = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    if (ember > 0.01) glow(ctx, 0, -6, 46, FIRE, 0.35 * ember);
    ctx.strokeStyle = '#140e0c';
    ctx.lineCap = 'round';
    ctx.lineWidth = 8;
    line(ctx, -38, 2, 26, -20);
    line(ctx, 38, 2, -26, -20);
    line(ctx, -32, -8, 32, -8);
    if (ember > 0.01) {
      ctx.fillStyle = rgba([255, 120, 40], 0.8 * ember);
      dot(ctx, -6, -9, 3);
      dot(ctx, 8, -11, 2.4);
    }
    ctx.restore();
  }

  function drawWatchman(ctx, x, y, s = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = '#04060b';
    ctx.strokeStyle = '#04060b';
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.lineTo(-7, -38);
    ctx.quadraticCurveTo(0, -46, 7, -38);
    ctx.lineTo(9, 0);
    ctx.closePath();
    ctx.fill();
    dot(ctx, 0, -52, 8);
    ctx.lineWidth = 2.5;
    line(ctx, 15, 4, 15, -80);
    ctx.restore();
  }

  function drawStars(ctx, t, alpha, maxY = 720, seed = 1) {
    for (let i = 0; i < 170; i++) {
      const x = hash(i, seed) * W;
      const y = hash(i, seed + 1) * maxY;
      const tw = 0.35 + 0.65 * noise(t * (0.6 + hash(i, seed + 3)) + i * 3.3, 5);
      ctx.fillStyle = rgba([235, 238, 255], alpha * tw * (0.35 + 0.65 * hash(i, seed + 5)));
      dot(ctx, x, y, 0.6 + hash(i, seed + 2) * 1.6);
    }
  }

  function drawMoon(ctx, x, y, r) {
    glow(ctx, x, y, r * 5, [200, 210, 240], 0.1);
    ctx.save();
    ctx.fillStyle = '#e9e4d4';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = '#060a16';
    dot(ctx, x + r * 0.45, y - r * 0.2, r * 0.92);
    ctx.restore();
  }

  function fillRidge(ctx, fn, color, x0 = -40, x1 = W + 40) {
    ctx.beginPath();
    ctx.moveTo(x0, H + 40);
    for (let x = x0; x <= x1; x += 6) ctx.lineTo(x, fn(x));
    ctx.lineTo(x1, H + 40);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  // Kıvılcım yayı: a → b, p ilerleme
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
      dot(ctx, px, py, r0 - j * 0.18);
    }
  }

  // ---- Kapı simgeleri (yaklaşık 100×100 kutu, merkez 0,0) ----------------------

  const GATES = [
    { name: 'Dünyayı Sayıya Çevirmek', topic: 'elektriğin sayıya dönüşmesi', icon: 'bit' },
    { name: 'Makinenin Bedeni', topic: 'bilgisayarın donanımı', icon: 'chip' },
    { name: 'Düşünceyi Adımlara Bölmek', topic: 'algoritmalar', icon: 'flow' },
    { name: 'Yapıyı Kurmak', topic: 'yazılımın yapısı', icon: 'blocks' },
    { name: 'Hatırlamanın Mimarisi', topic: 'veri tabanları', icon: 'db' },
    { name: 'Bağlanmak', topic: 'ağlar ve internet', icon: 'globe' },
    { name: 'Sur ve Emanet', topic: 'siber güvenlik', icon: 'shield' },
    { name: 'İnsanla Buluşan Yüz', topic: 'web ve mobil', icon: 'window' },
    { name: 'Bedene Kavuşan Yazılım', topic: 'robotlar ve sensörler', icon: 'robot' },
    { name: 'Öğrenen Makineler', topic: 'yapay zekâ', icon: 'neural' },
    { name: 'Atölyenin Kültürü', topic: 'atölye kültürü', icon: 'anvil' },
    { name: 'Mimar Olmak', topic: 'meslek seçimi', icon: 'compass' },
  ];
  const gateColor = (i) => mixc(FIRE, DIGI, i / 11);

  function drawGateIcon(ctx, kind, x, y, s, color, alpha = 1) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    switch (kind) {
      case 'bit':
        dot(ctx, -20, 0, 15);
        ctx.beginPath();
        ctx.arc(22, 0, 15, 0, Math.PI * 2);
        ctx.stroke();
        break;
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
      case 'flow':
        roundRect(ctx, -16, -42, 32, 18, 4);
        ctx.stroke();
        line(ctx, 0, -24, 0, -16);
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(16, 0);
        ctx.lineTo(0, 16);
        ctx.lineTo(-16, 0);
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
      case 'blocks': {
        const cube = (cx, cy, r) => {
          ctx.beginPath();
          ctx.moveTo(cx, cy - r);
          ctx.lineTo(cx + r * 0.87, cy - r * 0.5);
          ctx.lineTo(cx + r * 0.87, cy + r * 0.5);
          ctx.lineTo(cx, cy + r);
          ctx.lineTo(cx - r * 0.87, cy + r * 0.5);
          ctx.lineTo(cx - r * 0.87, cy - r * 0.5);
          ctx.closePath();
          ctx.stroke();
          line(ctx, cx - r * 0.87, cy - r * 0.5, cx, cy);
          line(ctx, cx + r * 0.87, cy - r * 0.5, cx, cy);
          line(ctx, cx, cy, cx, cy + r);
        };
        cube(-19, 14, 19);
        cube(19, 14, 19);
        cube(0, -18, 19);
        break;
      }
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
      case 'robot':
        roundRect(ctx, -30, -22, 60, 46, 10);
        ctx.stroke();
        dot(ctx, -12, -2, 6);
        dot(ctx, 12, -2, 6);
        line(ctx, -10, 13, 10, 13);
        line(ctx, 0, -22, 0, -34);
        dot(ctx, 0, -38, 5);
        line(ctx, -30, 0, -38, 0);
        line(ctx, 30, 0, 38, 0);
        line(ctx, -14, 24, -14, 36);
        line(ctx, 14, 24, 14, 36);
        break;
      case 'neural': {
        const L = [[-30, [-18, 18]], [0, [-30, 0, 30]], [30, [-18, 18]]];
        ctx.lineWidth = 2.2;
        for (let a = 0; a < 2; a++) {
          for (const y0 of L[a][1]) for (const y1 of L[a + 1][1]) line(ctx, L[a][0], y0, L[a + 1][0], y1);
        }
        for (const [x0, ys] of L) for (const y0 of ys) dot(ctx, x0, y0, 7);
        break;
      }
      case 'anvil':
        ctx.beginPath();
        ctx.moveTo(-40, -14);
        ctx.lineTo(28, -14);
        ctx.quadraticCurveTo(42, -14, 44, -24);
        ctx.lineTo(44, -6);
        ctx.quadraticCurveTo(30, 2, 16, 2);
        ctx.lineTo(12, 18);
        ctx.lineTo(24, 30);
        ctx.lineTo(-24, 30);
        ctx.lineTo(-12, 18);
        ctx.lineTo(-16, 2);
        ctx.quadraticCurveTo(-36, 0, -40, -14);
        ctx.closePath();
        ctx.stroke();
        ctx.save();
        ctx.translate(-6, -32);
        ctx.rotate(-0.5);
        roundRect(ctx, -16, -6, 32, 12, 3);
        ctx.fill();
        ctx.restore();
        line(ctx, -2, -34, 14, -6);
        break;
      case 'compass':
        ctx.beginPath();
        ctx.arc(0, -32, 7, 0, Math.PI * 2);
        ctx.stroke();
        line(ctx, -3, -26, -22, 34);
        line(ctx, 3, -26, 22, 34);
        line(ctx, -12, 4, 12, 4);
        ctx.beginPath();
        ctx.arc(0, -32, 72, Math.PI * 0.36, Math.PI * 0.64);
        ctx.setLineDash([4, 7]);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      default:
        break;
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 1 · Tepeden tepeye ateş → var ve yok → cebimizdeki telefon
  // ---------------------------------------------------------------------------

  const PEAKS = [
    { x: 150, h: 420 },
    { x: 500, h: 380 },
    { x: 860, h: 450 },
    { x: 1200, h: 390 },
    { x: 1520, h: 430 },
    { x: 1830, h: 370 },
  ];
  const ridge = (x) => {
    let y = 160;
    for (const p of PEAKS) {
      const d = (x - p.x) / 190;
      y = Math.max(y, p.h * Math.exp(-d * d));
    }
    return H - y - 22 * (noise(x / 140, 7) - 0.5);
  };
  const farRidge = (x) => H - 300 - 150 * noise(x / 420, 3) - 60 * noise(x / 130, 4);
  const ZOOM_PEAK = 5; // en sağdaki tepe: yakın planda sağ taraf telefona boş kalır
  const zoomCam = () => {
    const fx = PEAKS[ZOOM_PEAK].x;
    const fy = ridge(fx) - 14;
    const s = 2.1;
    return { x: fx + (W / 2 - 600) / s, y: fy - (720 - H / 2) / s, s };
  };
  // Ateşlerin yanma anı (gerçek zaman)
  const ignite = (i) => (i === 0 ? TL.at('fires', 0.9) : cue('fire-chain', 1) + 0.15 + (i - 1) * 0.55);

  // Yakın plandaki ateşin yanıp sönmesi: "ya yanar ya da yanmaz"
  function toggleK(t) {
    const t0 = cue('fire-bit', 0) + 0.35;
    const steps = [0, 0.5, 0.95, 1.4, 1.85, 2.3, 2.75].map((d) => t0 + d);
    let on = true;
    let last = -Infinity;
    for (const s of steps) if (t >= s) { on = !on; last = s; }
    const done = cue('fire-bit', 1) + 0.9;
    if (t >= done) return Math.min(1, 0.2 + (t - done) * 3);
    const p = clamp((t - last) / 0.12);
    return on ? lerp(0.1, 1, p) : lerp(1, 0.1, p);
  }

  function sceneFires(ctx, lt, t) {
    const zp = progress(lt, 6.7, 8.4);
    const wide = { x: W / 2, y: H / 2, s: 1 };
    const zc = zoomCam();
    const cam = { x: lerp(wide.x, zc.x, zp), y: lerp(wide.y, zc.y, zp), s: Math.exp(lerp(0, Math.log(zc.s), zp)) };

    nightSky(ctx);
    drawStars(ctx, t, 1 - 0.4 * zp);
    drawMoon(ctx, 1660 - 60 * zp, 170, 34);

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(Math.pow(cam.s, 0.4), Math.pow(cam.s, 0.4));
    ctx.translate(-W / 2 - (cam.x - W / 2) * 0.4, -H / 2 - (cam.y - H / 2) * 0.3);
    fillRidge(ctx, farRidge, '#0b1226', -400, W + 900);
    ctx.restore();

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(cam.s, cam.s);
    ctx.translate(-cam.x, -cam.y);
    fillRidge(ctx, ridge, '#05080f', -40, W + 900);
    for (let i = 1; i < PEAKS.length; i++) {
      const p = progress(t, ignite(i) - 0.55, ignite(i));
      const a = vis(t, ignite(i) - 0.55, ignite(i) + 0.15, 0.1, 0.15);
      sparkArc(ctx, PEAKS[i - 1].x, ridge(PEAKS[i - 1].x) - 90, PEAKS[i].x, ridge(PEAKS[i].x) - 40, p, a);
    }
    PEAKS.forEach((p, i) => {
      const gy = ridge(p.x);
      let k = progress(t, ignite(i), ignite(i) + 0.7, ease.out);
      if (i === ZOOM_PEAK && lt > 6.7) k = Math.min(k, toggleK(t));
      drawFire(ctx, p.x, gy - 14, 1, t, k, i + 1);
      drawPyre(ctx, p.x, gy - 4, 1);
      drawWatchman(ctx, p.x + 62, ridge(p.x + 62) + 2, 1);
    });
    ctx.restore();

    // "var ya da yok": yakın planda 1 / 0
    const lab = vis(t, cue('fire-bit', 0) + 0.3, sceneEnd('fires'), 0.3, 0.4) * (zp > 0.98 ? 1 : 0);
    if (lab > 0) {
      const k = toggleK(t);
      const on = k > 0.55;
      text(ctx, on ? '1' : '0', 840, 560, { size: 150, family: 'mono', weight: 700, color: on ? C.fire : C.off, alpha: lab, glow: on ? 'rgba(255,140,40,0.6)' : null, glowBlur: 30 });
      text(ctx, on ? 'VAR' : 'YOK', 840, 670, { size: 40, weight: 800, spacing: 10, color: on ? C.fire : C.off, alpha: lab });
    }

    // Cebimizdeki telefon aynı iki simgeyle konuşur
    const ph = after(t, 'fire-bit', 2, 0.7);
    if (ph > 0) {
      const px = 1450 + (1 - ph) * 140;
      const py = 540;
      ctx.save();
      ctx.globalAlpha *= ph;
      roundRect(ctx, px - 135, py - 250, 270, 500, 38);
      ctx.fillStyle = '#0a0f1c';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#3a4664';
      ctx.stroke();
      roundRect(ctx, px - 30, py - 232, 60, 10, 5);
      ctx.fillStyle = '#1f2840';
      ctx.fill();
      // ekranda dolan bitler
      const fill = progress(t, cue('fire-bit', 2) + 0.6, cue('fire-bit', 3) + 1.6, ease.linear);
      const cols = 6;
      const rows = 10;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          if (idx / (rows * cols) > fill) continue;
          const one = hash(idx, 41) > 0.5;
          text(ctx, one ? '1' : '0', px - 95 + c * 38, py - 175 + r * 38, { size: 30, family: 'mono', weight: 700, color: one ? C.fire : C.off });
        }
      }
      ctx.restore();
      // ateşten telefona akan bitler
      const flow = vis(t, cue('fire-bit', 2) + 0.4, sceneEnd('fires') - 0.3, 0.3, 0.3);
      if (flow > 0) {
        for (let j = 0; j < 14; j++) {
          const u = ((t * 0.55 + j / 14) % 1);
          const x0 = 690;
          const y0 = 470;
          const x1 = px - 150;
          const y1 = py - 40;
          const qx = (x0 + x1) / 2;
          const qy = 330;
          const x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * qx + u * u * x1;
          const y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * qy + u * u * y1;
          const one = hash(j, 9) > 0.45;
          ctx.save();
          ctx.globalAlpha *= flow * Math.sin(u * Math.PI);
          ctx.fillStyle = one ? C.flame : C.off;
          ctx.fillRect(x - 6, y - 6, 12, 12);
          ctx.restore();
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 2 · İki simgeden harf, fotoğraf, oyun, yapay zekâ
  // ---------------------------------------------------------------------------

  const HUB = [960, 540];
  const OUTS = [
    { x: 520, y: 300, label: 'harfler', k: 1, draw: drawLetter },
    { x: 1400, y: 300, label: 'fotoğraflar', k: 2, draw: drawPhoto },
    { x: 520, y: 790, label: 'oyunlar', k: 3, draw: drawPad },
    { x: 1400, y: 790, label: 'yapay zekâ', k: 4, draw: drawMind },
  ];

  function drawLetter(ctx, x, y, a) {
    text(ctx, 'A', x, y - 14, { size: 110, family: 'serif', weight: 700, color: C.cream, alpha: a });
    runs(ctx, [['0', { size: 22, family: 'mono', weight: 700, color: C.off }], ['1', { size: 22, family: 'mono', weight: 700, color: C.fire }], ['00000', { size: 22, family: 'mono', weight: 700, color: C.off }], ['1', { size: 22, family: 'mono', weight: 700, color: C.fire }]], x, y + 62, { alpha: a });
  }

  function drawPhoto(ctx, x, y, a) {
    ctx.save();
    ctx.globalAlpha *= a;
    roundRect(ctx, x - 70, y - 54, 140, 108, 8);
    ctx.fillStyle = '#16233f';
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = C.flame;
    dot(ctx, x + 34, y - 22, 14);
    ctx.fillStyle = '#3f5f8f';
    ctx.beginPath();
    ctx.moveTo(x - 80, y + 60);
    ctx.lineTo(x - 30, y - 6);
    ctx.lineTo(x + 6, y + 30);
    ctx.lineTo(x + 30, y + 8);
    ctx.lineTo(x + 80, y + 60);
    ctx.closePath();
    ctx.fill();
    // piksel ızgarası
    ctx.strokeStyle = 'rgba(5,8,16,0.55)';
    ctx.lineWidth = 2;
    for (let gx = x - 70; gx <= x + 70; gx += 14) line(ctx, gx, y - 54, gx, y + 54);
    for (let gy = y - 54; gy <= y + 54; gy += 14) line(ctx, x - 70, gy, x + 70, gy);
    ctx.restore();
    ctx.lineWidth = 4;
    ctx.strokeStyle = C.cream;
    roundRect(ctx, x - 70, y - 54, 140, 108, 8);
    ctx.stroke();
    ctx.restore();
  }

  function drawPad(ctx, x, y, a) {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.strokeStyle = C.cream;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-60, -26);
    ctx.quadraticCurveTo(0, -40, 60, -26);
    ctx.quadraticCurveTo(84, -20, 84, 16);
    ctx.quadraticCurveTo(84, 46, 62, 44);
    ctx.quadraticCurveTo(44, 42, 30, 20);
    ctx.lineTo(-30, 20);
    ctx.quadraticCurveTo(-44, 42, -62, 44);
    ctx.quadraticCurveTo(-84, 46, -84, 16);
    ctx.quadraticCurveTo(-84, -20, -60, -26);
    ctx.closePath();
    ctx.stroke();
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    line(ctx, -50, -2, -26, -2);
    line(ctx, -38, -14, -38, 10);
    ctx.fillStyle = C.fire;
    dot(ctx, 34, -10, 7);
    ctx.fillStyle = C.digital;
    dot(ctx, 50, 6, 7);
    ctx.restore();
  }

  function drawMind(ctx, x, y, a) {
    drawGateIcon(ctx, 'neural', x, y, 1.6, C.digital, a);
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = C.flame;
    const sx = x + 66;
    const sy = y - 50;
    ctx.beginPath();
    for (let k = 0; k < 8; k++) {
      const r = k % 2 ? 6 : 18;
      const ang = (k / 8) * Math.PI * 2 - Math.PI / 2;
      ctx.lineTo(sx + Math.cos(ang) * r, sy + Math.sin(ang) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function sceneQuestion(ctx, lt, t) {
    const a0 = vis(lt, 0, 10, 0.5, 0.3);
    // soldan akan iki simge
    const inflow = progress(lt, 0.2, 1.2);
    for (let j = 0; j < 26; j++) {
      const u = (t * 0.32 + j / 26) % 1;
      const x = lerp(-40, HUB[0] - 110, u);
      const y = HUB[1] + Math.sin(u * 9 + j) * 10 * (1 - u);
      const one = hash(j, 7) > 0.5;
      text(ctx, one ? '1' : '0', x, y, { size: 28, family: 'mono', weight: 700, color: one ? C.fire : C.off, alpha: inflow * a0 * Math.min(1, u * 4) * (1 - u * 0.4) });
    }
    // merkez
    const hub = progress(lt, 0.4, 1.2, ease.back);
    glow(ctx, HUB[0], HUB[1], 220, FIRE, 0.18 * hub);
    ctx.save();
    ctx.translate(HUB[0], HUB[1]);
    ctx.scale(hub, hub);
    ctx.beginPath();
    ctx.arc(0, 0, 92, 0, Math.PI * 2);
    ctx.fillStyle = '#0b1120';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = C.line;
    ctx.stroke();
    ctx.restore();
    runs(ctx, [['0', { size: 84, family: 'mono', weight: 700, color: C.off }], [' ', { size: 40 }], ['1', { size: 84, family: 'mono', weight: 700, color: C.fire }]], HUB[0], HUB[1] + 28, { alpha: hub });

    OUTS.forEach((o, i) => {
      const p = after(t, 'question', o.k, 0.6);
      if (p <= 0) return;
      // bağlantı
      const x0 = HUB[0] + Math.sign(o.x - HUB[0]) * 96;
      const y0 = HUB[1] + Math.sign(o.y - HUB[1]) * 30;
      const x1 = o.x + Math.sign(HUB[0] - o.x) * 110;
      const y1 = o.y;
      ctx.save();
      ctx.strokeStyle = rgba(DIGI, 0.4);
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 10]);
      line(ctx, x0, y0, lerp(x0, x1, p), lerp(y0, y1, p));
      ctx.restore();
      for (let j = 0; j < 4; j++) {
        const u = (t * 0.7 + j / 4 + i * 0.13) % 1;
        ctx.fillStyle = rgba(j % 2 ? FIRE : DIGI, 0.9 * p);
        ctx.fillRect(lerp(x0, x1, u) - 5, lerp(y0, y1, u) - 5, 10, 10);
      }
      const q = after(t, 'question', o.k, 0.5, ease.back);
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.scale(0.6 + 0.4 * q, 0.6 + 0.4 * q);
      roundRect(ctx, -120, -100, 240, 200, 22);
      ctx.fillStyle = 'rgba(12,18,34,0.92)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = C.line;
      ctx.stroke();
      ctx.restore();
      o.draw(ctx, o.x, o.y - 6, p);
      text(ctx, o.label, o.x, o.y + 140, { size: 38, family: 'serif', italic: true, color: i === 3 ? C.digital : C.cream, alpha: p });
    });
  }

  // ---------------------------------------------------------------------------
  // 3 · Kursun adı
  // ---------------------------------------------------------------------------

  function sceneTitle(ctx, lt, t) {
    const f = progress(lt, 0.2, 1.0, ease.out);
    drawFire(ctx, W / 2, 330, 0.75, t, f, 3);
    drawPyre(ctx, W / 2, 338, 0.75);
    const a1 = after(t, 'title', 0, 0.8);
    text(ctx, 'BİLİŞİM TEKNOLOJİLERİ', W / 2, 500 + (1 - a1) * 24, { size: 104, family: 'display', weight: 900, spacing: 4, color: C.cream, alpha: a1 });
    const a2 = progress(t, cue('title', 0) + 0.35, cue('title', 0) + 1.2, ease.out);
    text(ctx, 'Yetkinliği', W / 2, 628 + (1 - a2) * 20, { size: 120, family: 'serif', italic: true, color: C.fire, alpha: a2, glow: 'rgba(255,140,40,0.45)', glowBlur: 30 });
    const a3 = after(t, 'title', 1, 0.8);
    ctx.save();
    ctx.globalAlpha *= a3;
    ctx.fillStyle = C.dim;
    ctx.fillRect(W / 2 - 70, 730, 140, 2);
    ctx.restore();
    text(ctx, 'BİTTEN YAPAY ZEKÂYA, ON İKİ KAPILIK BİR YOLCULUK', W / 2, 790, { size: 28, weight: 600, spacing: 7, color: C.muted, alpha: a3 });
  }

  // ---------------------------------------------------------------------------
  // 4 · On iki kapı
  // ---------------------------------------------------------------------------

  const GX = (i) => 170 + i * 144.5;
  const GH = [88, 70, 96, 76, 92, 72, 98, 74, 90, 78, 94, 84];
  const gRidge = (x) => {
    let y = 0;
    for (let i = 0; i < 12; i++) y += GH[i] * Math.exp(-(((x - GX(i)) / 54) ** 2));
    return 810 - y - 16 * (noise(x / 90, 5) - 0.5);
  };
  const ICON_Y = 452;

  // Kapıların yanma anı (gerçek zaman): her öbekte iki kapı
  const gateOn = (i) => cue('gates-list', Math.floor(i / 2)) + 0.15 + (i % 2) * 0.55;

  function gatesBackdrop(ctx, t) {
    nightSky(ctx, '#03050b', '#0b1328', '#111a33');
    drawStars(ctx, t, 0.8, 600, 11);
    const far = (x) => 760 - 70 * noise(x / 360, 13) - 30 * noise(x / 110, 14);
    fillRidge(ctx, far, '#0a1124');
    fillRidge(ctx, gRidge, '#05080f');
  }

  function sceneGates(ctx, lt, t) {
    gatesBackdrop(ctx, t);
    kicker(ctx, 'ON İKİ KAPI', vis(lt, 0.3, 21, 0.6, 0.4));
    for (let i = 0; i < 12; i++) {
      const x = GX(i);
      const gy = gRidge(x);
      const appear = progress(lt, 0.6 + i * 0.12, 1.0 + i * 0.12, ease.out);
      const k = progress(t, gateOn(i), gateOn(i) + 0.6, ease.out);
      // önceki kapıdan gelen kıvılcım
      if (i > 0) {
        const p = progress(t, gateOn(i) - 0.45, gateOn(i));
        sparkArc(ctx, GX(i - 1), gRidge(GX(i - 1)) - 46, x, gy - 20, p, vis(t, gateOn(i) - 0.45, gateOn(i) + 0.1, 0.05, 0.1), 70, gateColor(i), 3.4);
      }
      drawFire(ctx, x, gy - 6, 0.42, t, k, 20 + i, false);
      drawPyre(ctx, x, gy - 2, 0.42);
      text(ctx, String(i + 1), x, gy + 56, { size: 26, family: 'mono', weight: 700, color: k > 0.5 ? rgba(gateColor(i)) : C.dim, alpha: appear });
      // simge
      const ia = progress(t, gateOn(i) + 0.1, gateOn(i) + 0.7, ease.out);
      if (ia < 1 && appear > 0) {
        ctx.save();
        ctx.globalAlpha *= appear * (1 - ia) * 0.8;
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 7]);
        ctx.beginPath();
        ctx.arc(x, ICON_Y, 56, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      if (ia > 0) {
        ctx.save();
        ctx.globalAlpha *= ia;
        ctx.strokeStyle = rgba(gateColor(i), 0.25);
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 7]);
        line(ctx, x, ICON_Y + 58, x, gy - 70);
        ctx.restore();
        glow(ctx, x, ICON_Y, 90, gateColor(i), 0.16 * ia);
        ctx.save();
        ctx.translate(x, ICON_Y + (1 - ia) * 18);
        ctx.beginPath();
        ctx.arc(0, 0, 56, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(10,15,30,0.9)';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = rgba(gateColor(i), 0.7 * ia);
        ctx.stroke();
        ctx.restore();
        drawGateIcon(ctx, GATES[i].icon, x, ICON_Y + (1 - ia) * 18, 0.78, rgba(gateColor(i)), ia);
      }
    }
    // alt yazı kartları: o an yanan iki kapı
    for (let k = 0; k < 6; k++) {
      const a = k < 5 ? vis(t, cue('gates-list', k), cue('gates-list', k + 1), 0.35, 0.25) : vis(t, cue('gates-list', 5), TL.at('gates', 20.6), 0.35, 0.4);
      if (a <= 0) continue;
      [0, 1].forEach((j) => {
        const i = k * 2 + j;
        const cx = j === 0 ? 640 : 1280;
        const ca = a * progress(t, gateOn(i), gateOn(i) + 0.4);
        if (ca <= 0) return;
        ctx.save();
        ctx.globalAlpha *= ca;
        roundRect(ctx, cx - 300, 880, 600, 120, 16);
        ctx.fillStyle = 'rgba(8,12,24,0.88)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = rgba(gateColor(i), 0.5);
        ctx.stroke();
        ctx.restore();
        text(ctx, String(i + 1), cx - 250, 940, { size: 64, family: 'display', weight: 900, color: rgba(gateColor(i)), alpha: ca });
        text(ctx, GATES[i].name, cx - 196, 920, { size: 34, weight: 700, color: C.cream, align: 'left', alpha: ca });
        text(ctx, GATES[i].topic, cx - 196, 964, { size: 28, family: 'serif', italic: true, color: C.muted, align: 'left', alpha: ca });
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 5 · Kurstan görüntüler (ekrana bölüm videoları bindirilir)
  // ---------------------------------------------------------------------------

  const SCREEN = { x: 400, y: 150, w: 1120, h: 630 };
  // Bölüm videolarından seçilen anlar: kaynak (video/out/<src>-seslendirme.mp4), kaynakta başlangıç (sn),
  // en fazla süre (aralık daha uzunsa son kare dondurulur), etiket
  const CLIPS = {
    ladder: { src: 'ch04-veri-bilgi-anlam', from: 289.5, max: 6, label: '4. bölüm · Veri, Bilgi, Anlam' },
    adder: { src: 'ch03-sayilardan-devreye', from: 165, max: 10, label: '3. bölüm · Sayılardan Devreye' },
    letters: { src: 'ch01-var-ve-yok', from: 280, max: 5.8, label: '1. bölüm · Var ve Yok' },
    chain: { src: 'ch03-sayilardan-devreye', from: 211.5, max: 9, label: '3. bölüm · Sayılardan Devreye' },
    thermo: { src: 'ch04-veri-bilgi-anlam', from: 65.5, max: 6.4, label: '4. bölüm · Veri, Bilgi, Anlam' },
  };
  // Ekrandaki parçaların filmdeki aralıkları (gerçek zaman)
  const montage = () => {
    const on = TL.at('screen', 1.0);
    const off = sceneEnd('screen'); // son parça sahnenin kararmasıyla birlikte söner (montaj.mjs)
    return [
      ['ladder', on, cue('style', 2)],
      ['adder', cue('style', 2), cue('example', 0)],
      ['letters', cue('example', 0), cue('example', 1)],
      ['chain', cue('example', 1), cue('example', 2)],
      ['thermo', cue('example', 2), off],
    ].map(([id, start, end]) => ({ id, ...CLIPS[id], start, end }));
  };
  const MONTAGE = montage();

  function sceneScreen(ctx, lt, t) {
    kicker(ctx, 'KURSTAN BİR AN', vis(lt, 0.3, 18, 0.6, 0.4));
    const f = progress(lt, 0.1, 0.9, ease.out);
    const S = SCREEN;
    ctx.save();
    ctx.globalAlpha *= f;
    ctx.translate(W / 2, S.y + S.h / 2);
    ctx.scale(0.94 + 0.06 * f, 0.94 + 0.06 * f);
    ctx.translate(-W / 2, -(S.y + S.h / 2));
    glow(ctx, W / 2, S.y + S.h / 2, 900, DIGI, 0.07);
    // ayak
    ctx.fillStyle = '#121a2e';
    ctx.beginPath();
    ctx.moveTo(W / 2 - 60, S.y + S.h + 22);
    ctx.lineTo(W / 2 + 60, S.y + S.h + 22);
    ctx.lineTo(W / 2 + 90, S.y + S.h + 76);
    ctx.lineTo(W / 2 - 90, S.y + S.h + 76);
    ctx.closePath();
    ctx.fill();
    roundRect(ctx, W / 2 - 170, S.y + S.h + 72, 340, 14, 7);
    ctx.fill();
    // çerçeve
    roundRect(ctx, S.x - 22, S.y - 22, S.w + 44, S.h + 44, 26);
    ctx.fillStyle = '#0e1424';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#2a3450';
    ctx.stroke();
    ctx.fillStyle = '#04060c';
    ctx.fillRect(S.x, S.y, S.w, S.h);
    ctx.restore();

    // Ekran altı etiketleri
    const chips = [
      ['adım adım', 'style', 1, 'style', 4],
      ['önce ön öğrenme', 'style', 2, 'style', 4],
      ['sonra asıl konu', 'style', 3, 'style', 4],
      ['harf → sayı', 'example', 0, 'example', 9],
      ['kapılar → toplama', 'example', 1, 'example', 9],
      ['bir sayı → üç anlam', 'example', 2, 'example', 9],
    ];
    const group = (id) => chips.filter((c) => c[1] === id);
    ['style', 'example'].forEach((gid) => {
      const items = group(gid);
      const widths = items.map(([s]) => measure(ctx, s, { size: 30, weight: 600 }) + 60);
      const total = widths.reduce((a, b) => a + b, 0) + 24 * (items.length - 1);
      let x = W / 2 - total / 2;
      const gEnd = gid === 'style' ? cue('example', 0) - 0.1 : sceneEnd('screen');
      items.forEach(([s, id, k], j) => {
        const a = after(t, id, k, 0.4) * vis(t, cue(id, 0) - 1, gEnd, 0, 0.3);
        if (a > 0) {
          const active = gid === 'example' ? (j === items.length - 1 ? t >= cue(id, k) : t >= cue(id, k) && t < cue(id, k + 1)) : true;
          ctx.save();
          ctx.globalAlpha *= a;
          roundRect(ctx, x, 892, widths[j], 58, 29);
          ctx.fillStyle = active && gid === 'example' ? 'rgba(255,165,71,0.16)' : 'rgba(12,18,34,0.9)';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = active ? C.fire : C.line;
          ctx.stroke();
          ctx.restore();
          text(ctx, s, x + widths[j] / 2, 922, { size: 30, weight: 600, color: active ? C.cream : C.muted, alpha: a });
        }
        x += widths[j] + 24;
      });
    });

    // Ekran başlığı: o an gösterilen bölüm
    for (const m of MONTAGE) {
      const a = vis(t, m.start, m.end, 0.25, 0.25);
      if (a > 0) text(ctx, m.label.toUpperCase(), S.x + S.w, S.y - 52, { size: 20, weight: 600, spacing: 5, color: C.muted, align: 'right', alpha: a * f });
    }
  }

  // ---------------------------------------------------------------------------
  // 6 · Ders kitabı ve etkinlikler
  // ---------------------------------------------------------------------------

  function bitCard(ctx, x, y, n, rot, a) {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    roundRect(ctx, -70, -96, 140, 192, 12);
    ctx.fillStyle = '#f6efe0';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#c9bea6';
    ctx.stroke();
    const cols = n >= 8 ? 4 : n >= 4 ? 2 : n;
    const rows = Math.ceil(n / cols);
    const gap = n >= 16 ? 24 : 34;
    ctx.fillStyle = '#1b1f2a';
    for (let k = 0; k < n; k++) {
      const c = k % cols;
      const r = Math.floor(k / cols);
      dot(ctx, (c - (cols - 1) / 2) * gap, (r - (rows - 1) / 2) * gap, n >= 16 ? 7 : 9);
    }
    ctx.restore();
  }

  function sceneBook(ctx, lt, t) {
    glow(ctx, 520, 160, 900, [255, 190, 120], 0.08);
    kicker(ctx, 'DERS KİTABI VE ETKİNLİKLER', vis(lt, 0.3, 9, 0.6, 0.4));
    const open = progress(lt, 0.2, 1.3, ease.out);
    const bx = 380;
    const by = 210;
    const pw = 520;
    const phh = 620;
    ctx.save();
    ctx.globalAlpha *= open;
    ctx.translate(0, (1 - open) * 30);
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 20;
    roundRect(ctx, bx - 14, by - 10, pw * 2 + 28, phh + 24, 14);
    ctx.fillStyle = '#3a2a1c';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = C.paper;
    ctx.fillRect(bx, by, pw, phh);
    ctx.fillRect(bx + pw, by, pw, phh);
    const spine = ctx.createLinearGradient(bx + pw - 40, 0, bx + pw + 40, 0);
    spine.addColorStop(0, 'rgba(0,0,0,0)');
    spine.addColorStop(0.5, 'rgba(60,40,20,0.35)');
    spine.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = spine;
    ctx.fillRect(bx + pw - 40, by, 80, phh);
    // sol sayfa: başlık, iki lamba, metin satırları
    text(ctx, 'BİRİNCİ KAPI · 1', bx + 60, by + 70, { size: 20, weight: 700, spacing: 4, color: '#b8400f', align: 'left' });
    text(ctx, 'Var ve Yok', bx + 60, by + 122, { size: 46, family: 'serif', italic: true, color: C.ink, align: 'left' });
    ctx.fillStyle = 'rgba(27,31,42,0.18)';
    for (let k = 0; k < 4; k++) ctx.fillRect(bx + 60, by + 170 + k * 30, pw - 120 - (k === 3 ? 140 : 0), 10);
    ctx.fillStyle = '#1b1f2a';
    dot(ctx, bx + 170, by + 380, 34);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#1b1f2a';
    ctx.beginPath();
    ctx.arc(bx + 330, by + 380, 34, 0, Math.PI * 2);
    ctx.stroke();
    text(ctx, '1', bx + 170, by + 450, { size: 30, family: 'mono', weight: 700, color: '#b8400f' });
    text(ctx, '0', bx + 330, by + 450, { size: 30, family: 'mono', weight: 700, color: C.inkSoft });
    ctx.fillStyle = 'rgba(27,31,42,0.18)';
    for (let k = 0; k < 3; k++) ctx.fillRect(bx + 60, by + 500 + k * 30, pw - 120 - (k === 2 ? 200 : 0), 10);
    // sağ sayfa: etkinlik kutusu
    const rx = bx + pw + 60;
    roundRect(ctx, rx, by + 50, pw - 120, 250, 10);
    ctx.fillStyle = 'rgba(232,84,26,0.08)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(184,64,15,0.5)';
    ctx.stroke();
    text(ctx, 'ETKİNLİK', rx + 26, by + 88, { size: 20, weight: 800, spacing: 4, color: '#b8400f', align: 'left' });
    for (let k = 0; k < 3; k++) {
      const y = by + 140 + k * 52;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#1b1f2a';
      ctx.strokeRect(rx + 26, y - 14, 28, 28);
      ctx.fillStyle = 'rgba(27,31,42,0.18)';
      ctx.fillRect(rx + 74, y - 5, 240 - k * 40, 10);
    }
    // çoktan seçmeli
    text(ctx, 'SORU', rx + 26, by + 350, { size: 20, weight: 800, spacing: 4, color: C.inkSoft, align: 'left' });
    ctx.fillStyle = 'rgba(27,31,42,0.18)';
    ctx.fillRect(rx + 26, by + 380, pw - 170, 10);
    ['A', 'B', 'C', 'D'].forEach((L, k) => {
      const y = by + 430 + k * 44;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#1b1f2a';
      ctx.beginPath();
      ctx.arc(rx + 40, y, 15, 0, Math.PI * 2);
      ctx.stroke();
      text(ctx, L, rx + 40, y + 1, { size: 18, weight: 700, color: C.ink });
      ctx.fillStyle = 'rgba(27,31,42,0.18)';
      ctx.fillRect(rx + 72, y - 5, 180 + ((k * 37) % 60), 10);
    });
    ctx.restore();

    // kalem: kutuları işaretler ve doğru şıkkı daire içine alır
    const marks = [0, 1, 2].map((k) => progress(t, cue('book', 1) + 0.2 + k * 0.45, cue('book', 1) + 0.5 + k * 0.45));
    marks.forEach((m, k) => {
      if (m <= 0) return;
      const y = by + 140 + k * 52;
      ctx.save();
      ctx.strokeStyle = '#b8400f';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rx + 30, y);
      const p1 = Math.min(1, m * 2);
      ctx.lineTo(rx + 30 + 10 * p1, y + 10 * p1);
      if (m > 0.5) ctx.lineTo(rx + 40 + 24 * (m - 0.5) * 2, y + 10 - 28 * (m - 0.5) * 2);
      ctx.stroke();
      ctx.restore();
    });
    const circ = progress(t, cue('book', 1) + 1.6, cue('book', 1) + 2.2);
    if (circ > 0) {
      ctx.save();
      ctx.strokeStyle = '#b8400f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(rx + 40, by + 430 + 44 * 2, 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * circ);
      ctx.stroke();
      ctx.restore();
    }
    const pen = vis(t, cue('book', 1) + 0.05, sceneEnd('book') - 0.2, 0.25, 0.3);
    if (pen > 0) {
      const k = clamp(Math.floor((t - cue('book', 1) - 0.2) / 0.45), 0, 3);
      const target = k < 3 ? [rx + 60, by + 140 + k * 52] : [rx + 60, by + 518];
      ctx.save();
      ctx.globalAlpha *= pen;
      ctx.translate(target[0] + 6, target[1] - 8);
      ctx.rotate(-0.7);
      ctx.fillStyle = '#e0a63a';
      ctx.fillRect(0, -9, 190, 18);
      ctx.fillStyle = '#f2d6a0';
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(-26, 0);
      ctx.lineTo(0, 9);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1b1f2a';
      ctx.beginPath();
      ctx.moveTo(-17, -3);
      ctx.lineTo(-26, 0);
      ctx.lineTo(-17, 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c96a6a';
      ctx.fillRect(190, -9, 22, 18);
      ctx.restore();
    }
    // kesip kullanılan bit kartları
    [16, 8, 4, 2, 1].forEach((n, k) => {
      const a = progress(t, cue('book', 0) + 0.8 + k * 0.18, cue('book', 0) + 1.3 + k * 0.18, ease.out);
      if (a <= 0) return;
      bitCard(ctx, 1290 + k * 112 + (1 - a) * 160, 900 - Math.abs(k - 2) * 8, n, (k - 2) * 0.06, a);
    });
  }

  // ---------------------------------------------------------------------------
  // 7 · Kimler için
  // ---------------------------------------------------------------------------

  function person(ctx, x, y, s, { pack = false, book = false, tall = 1 } = {}) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s * tall);
    ctx.fillStyle = '#04060b';
    // bacaklar ve gövde
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
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = '#04060b';
    dot(ctx, 0, -138 * tall, 15);
    if (pack) {
      roundRect(ctx, -34, -112 * tall, 18, 46, 6);
      ctx.fill();
    }
    if (book) {
      ctx.fillRect(14, -96 * tall, 22, 30);
    }
    ctx.restore();
  }

  function sceneWho(ctx, lt, t) {
    nightSky(ctx, '#03050b', '#0a1226', '#0f1830');
    drawStars(ctx, t, 0.7, 520, 21);
    const gy = 840;
    ctx.fillStyle = '#05080f';
    ctx.fillRect(0, gy, W, H - gy);
    const fire = progress(lt, 0.2, 1.0, ease.out);
    glow(ctx, W / 2, gy - 40, 760, FIRE, 0.16 * fire);
    drawFire(ctx, W / 2, gy - 6, 1.05, t, fire, 7);
    drawPyre(ctx, W / 2, gy + 2, 1.05);

    const badge = after(t, 'who', 0, 0.6, ease.back);
    if (badge > 0) {
      ctx.save();
      ctx.translate(W / 2, 200);
      ctx.scale(badge, badge);
      roundRect(ctx, -300, -46, 600, 92, 46);
      ctx.fillStyle = 'rgba(127,224,163,0.12)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = C.ok;
      ctx.stroke();
      ctx.strokeStyle = C.ok;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-246, 0);
      ctx.lineTo(-232, 14);
      ctx.lineTo(-206, -14);
      ctx.stroke();
      ctx.restore();
      text(ctx, 'ÖN BİLGİ GEREKMEZ', W / 2 + 30, 202, { size: 36, weight: 800, spacing: 6, color: C.cream, alpha: badge });
    }
    const people = [
      { x: 690, k: 1, label: 'öğrenci', opt: { pack: true, tall: 0.92 }, s: 1.35 },
      { x: 1240, k: 2, label: 'meraklı bir yetişkin', opt: { tall: 1.05 }, s: 1.4 },
      { x: 470, k: 3, label: 'öğretmen', opt: { book: true }, s: 1.25, d: 0 },
      { x: 1460, k: 3, label: 'veli', opt: { tall: 1.02 }, s: 1.3, d: 0.3 },
    ];
    people.forEach((p) => {
      const a = progress(t, cue('who', p.k) + (p.d ?? 0), cue('who', p.k) + (p.d ?? 0) + 0.7, ease.out);
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha *= a;
      glow(ctx, p.x, gy - 120, 160, FIRE, 0.12);
      person(ctx, p.x, gy + (1 - a) * 10, p.s, p.opt);
      ctx.restore();
      text(ctx, p.label, p.x, gy - 250 * p.s / 1.3, { size: 34, family: 'serif', italic: true, color: p.k === 3 ? C.muted : C.cream, alpha: a });
    });
  }

  // ---------------------------------------------------------------------------
  // 8 · Açık olan kapı
  // ---------------------------------------------------------------------------

  const CHAPTERS = ['Var ve Yok: İki Simgeli Bir Evren', 'Taşa Kazınan Mantık', 'Sayılardan Devreye', 'Veri, Bilgi, Anlam'];

  function sceneNow(ctx, lt, t) {
    gatesBackdrop(ctx, t);
    kicker(ctx, 'ŞİMDİ AÇIK', vis(lt, 0.3, 10, 0.6, 0.4));
    for (let i = 0; i < 12; i++) {
      const x = GX(i);
      const gy = gRidge(x);
      if (i === 0) {
        drawFire(ctx, x, gy - 6, 0.62, t, progress(lt, 0.2, 0.9, ease.out), 31);
        drawPyre(ctx, x, gy - 2, 0.62);
      } else {
        // "birer birer açılacak": közler soldan sağa kıpırdar
        const wave = progress(t, cue('now', 3) + (i - 1) * 0.12, cue('now', 3) + (i - 1) * 0.12 + 0.4);
        const ember = 0.25 + 0.45 * wave * (0.6 + 0.4 * Math.sin(t * 3 + i));
        drawPyre(ctx, x, gy - 2, 0.42, after(t, 'now', 2, 0.6) * ember);
      }
      text(ctx, String(i + 1), x, gy + 56, { size: 26, family: 'mono', weight: 700, color: i === 0 ? C.fire : C.dim, alpha: 1 });
    }
    // Birinci Kapı kartı
    const card = after(t, 'now', 0, 0.6);
    if (card > 0) {
      const x0 = 300;
      const y0 = 250;
      ctx.save();
      ctx.globalAlpha *= card;
      ctx.strokeStyle = rgba(FIRE, 0.4);
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 8]);
      line(ctx, GX(0) + 30, gRidge(GX(0)) - 90, x0, y0 + 300);
      ctx.setLineDash([]);
      roundRect(ctx, x0, y0, 720, 330, 20);
      ctx.fillStyle = 'rgba(8,12,24,0.92)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = rgba(FIRE, 0.6);
      ctx.stroke();
      ctx.restore();
      text(ctx, 'BİRİNCİ KAPI', x0 + 40, y0 + 52, { size: 24, weight: 700, spacing: 6, color: C.fire, align: 'left', alpha: card });
      text(ctx, 'Dünyayı Sayıya Çevirmek', x0 + 40, y0 + 100, { size: 40, family: 'serif', italic: true, color: C.cream, align: 'left', alpha: card });
      CHAPTERS.forEach((c, k) => {
        const a = progress(t, cue('now', 1) + k * 0.22, cue('now', 1) + k * 0.22 + 0.4, ease.out);
        const y = y0 + 158 + k * 42;
        ctx.save();
        ctx.globalAlpha *= a;
        ctx.fillStyle = C.fire;
        dot(ctx, x0 + 52, y, 7);
        ctx.restore();
        text(ctx, `${k + 1}. ${c}`, x0 + 76, y + 1, { size: 30, weight: 500, color: C.cream, align: 'left', alpha: a });
      });
    }
    const soon = after(t, 'now', 2, 0.6);
    text(ctx, 'diğer on bir kapı birer birer açılacak', 1300, 560, { size: 36, family: 'serif', italic: true, color: C.muted, alpha: soon });
  }

  // ---------------------------------------------------------------------------
  // 9 · Kapanış: yükselen ufuk, ilk ateş
  // ---------------------------------------------------------------------------

  function sceneClose(ctx, lt, t) {
    const dawn = progress(lt, 0.2, 8.5, ease.inOut);
    const sky = ctx.createLinearGradient(0, 0, 0, 760);
    sky.addColorStop(0, '#04060f');
    sky.addColorStop(0.55, rgba(mixc([10, 16, 36], [42, 32, 80], dawn)));
    sky.addColorStop(0.85, rgba(mixc([16, 24, 50], [150, 70, 80], dawn)));
    sky.addColorStop(1, rgba(mixc([20, 30, 58], [255, 170, 90], dawn)));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, 760);
    drawStars(ctx, t, 1 - 0.6 * dawn, 520, 31);
    glow(ctx, W / 2, 760, 900, [255, 170, 90], 0.35 * dawn);
    const far = (x) => 760 - 40 * noise(x / 300, 41) - 18 * noise(x / 90, 42);
    fillRidge(ctx, far, '#140f26');
    const near = (x) => 1080 - 250 * Math.exp(-(((x - W / 2) / 520) ** 2)) - 120;
    fillRidge(ctx, near, '#05070e');
    // ilk ateş
    const k = after(t, 'close', 0, 0.9);
    const fy = near(W / 2) - 6;
    drawFire(ctx, W / 2, fy, 1.25, t, Math.max(0.0, k), 51);
    drawPyre(ctx, W / 2, fy + 6, 1.25, 1 - k);
    const a1 = after(t, 'close', 1, 0.9);
    text(ctx, 'BİLİŞİM TEKNOLOJİLERİ', W / 2, 250 + (1 - a1) * 20, { size: 96, family: 'display', weight: 900, spacing: 4, color: C.cream, alpha: a1 });
    text(ctx, 'Yetkinliği', W / 2, 370 + (1 - a1) * 16, { size: 110, family: 'serif', italic: true, color: C.fire, alpha: a1, glow: 'rgba(255,140,40,0.45)', glowBlur: 30 });
    const a2 = progress(t, cue('close', 1) + 1.4, cue('close', 1) + 2.2, ease.out);
    text(ctx, 'Hoş geldiniz.', W / 2, 470, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: a2 });
  }

  // ---------------------------------------------------------------------------
  // Ses
  // ---------------------------------------------------------------------------

  function score(m, hz) {
    const { at, span } = TL;
    const untilEnd = (id, a, margin) => TL.scene(id).end - margin - at(id, a);
    const scenePad = (id, notes, opts = {}) => m.pad(at(id, 0), untilEnd(id, 0, 0.4), notes, { gain: 0.22, attack: 1.6, release: 2.6, ...opts });
    const ding = (tm, note, g = 0.1, pan = 0, decay = 2.4) => m.bell(tm, { freq: hz(note), gain: g, decay, pan });
    const pop = (tm, note, pan = 0, g = 0.08) => m.pop(tm, { freq: hz(note), gain: g, pan });
    const c = cue;

    // 1 · Ateşler
    m.pad(0, untilEnd('fires', 0, 0.3), ['D2', 'A2', 'D3', 'F3'], { gain: 0.26, attack: 3, release: 2.5, cutoff: 650 });
    m.wind(0.2, span('fires', 0, 6.6), { gain: 0.05 });
    PEAKS.forEach((p, i) => {
      const pan = (p.x - W / 2) / W;
      m.fireIgnite(ignite(i), { gain: i === 0 ? 0.5 : 0.26, pan });
      m.crackle(ignite(i), sceneEnd('fires') - ignite(i) - 0.3, { gain: i === ZOOM_PEAK ? 0.22 : 0.08, pan, density: 14, roar: 0.4 });
      if (i > 0) m.whoosh(ignite(i) - 0.55, { dur: 0.6, from: 600, to: 2400, gain: 0.03, panFrom: pan - 0.15, panTo: pan });
    });
    m.whoosh(at('fires', 6.7), { dur: 1.6, from: 300, to: 1200, gain: 0.05 });
    [0, 0.5, 0.95, 1.4, 1.85, 2.3, 2.75].forEach((d, i) => m.click(c('fire-bit', 0) + 0.35 + d, { gain: 0.1, tone: i % 2 ? 900 : 1500 }));
    ding(c('fire-bit', 1) + 0.9, 'D5', 0.1, 0, 3);
    m.whoosh(c('fire-bit', 2), { dur: 0.7, from: 2000, to: 600, gain: 0.05, panFrom: 0.8, panTo: 0.4 });
    for (let j = 0; j < 16; j++) m.blip(c('fire-bit', 2) + 0.7 + j * 0.16, { freq: hz(['D5', 'F5', 'A5', 'C6'][j % 4]), dur: 0.06, type: 'square', gain: 0.018, pan: 0.5 });

    // 2 · İki simgeden her şey
    scenePad('question', ['F2', 'C3', 'A3', 'E4']);
    for (let j = 0; j < 10; j++) m.tick(at('question', 0.3) + j * 0.2, { gain: 0.03, tone: 3000 + j * 80, pan: -0.6 + j * 0.06 });
    m.boom(at('question', 0.5), { gain: 0.14, freq: 70 });
    OUTS.forEach((o, i) => {
      pop(c('question', o.k), ['A4', 'C5', 'E5', 'A5'][i], (o.x - W / 2) / W);
      m.whoosh(c('question', o.k) - 0.05, { dur: 0.4, from: 900, to: 2600, gain: 0.03, panFrom: 0, panTo: (o.x - W / 2) / W });
    });
    m.riser(c('question', 4), 1.4, { gain: 0.05 });

    // 3 · Başlık
    m.pad(at('title', 0), untilEnd('title', 0, 0.3), ['D2', 'A2', 'F#3', 'A3'], { gain: 0.3, attack: 0.8, release: 2.4, cutoff: 900 });
    m.fireIgnite(at('title', 0.2), { gain: 0.3 });
    m.crackle(at('title', 0.2), span('title', 0.2, 7.6), { gain: 0.12, density: 14, roar: 0.4 });
    m.boom(c('title', 0), { gain: 0.36 });
    ding(c('title', 0) + 0.05, 'D5', 0.14, 0, 3.5);
    ding(c('title', 0) + 0.45, 'A5', 0.08, 0.2, 3.5);
    ding(c('title', 1) + 0.2, 'F#5', 0.07, -0.2, 3);

    // 4 · On iki kapı
    scenePad('gates', ['D2', 'A2', 'E3', 'B3'], { gain: 0.24 });
    for (let i = 0; i < 12; i++) m.tick(at('gates', 0.6 + i * 0.12), { gain: 0.03, tone: 2400 + i * 100, pan: (GX(i) - W / 2) / W });
    const scale = ['D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6'];
    for (let i = 0; i < 12; i++) {
      const pan = (GX(i) - W / 2) / W;
      m.fireIgnite(gateOn(i), { gain: 0.1, pan });
      ding(gateOn(i) + 0.05, scale[i], 0.07, pan, 2.2);
    }
    m.crackle(gateOn(0), at('gates', 20.6) - gateOn(0), { gain: 0.06, density: 18, roar: 0.3 });
    // hafif nabız: yolculuk duygusu
    for (let tm = c('gates-list', 0); tm < at('gates', 20.4); tm += 0.5) m.tick(tm, { gain: 0.02, tone: 1800 });

    // 5 · Kurstan görüntüler
    scenePad('screen', ['G2', 'D3', 'B3', 'F#4'], { gain: 0.22 });
    m.whoosh(at('screen', 0.1), { dur: 0.8, from: 400, to: 1600, gain: 0.04 });
    m.hum(at('screen', 0.5), span('screen', 0.5, 17.6), { gain: 0.02 });
    MONTAGE.forEach((cl, i) => {
      m.click(cl.start, { gain: 0.06, tone: 2200 });
      if (i) m.whoosh(cl.start - 0.1, { dur: 0.3, from: 1800, to: 900, gain: 0.025 });
    });
    [1, 2, 3].forEach((k, i) => pop(c('style', k), ['B4', 'D5', 'F#5'][i], -0.3 + i * 0.3, 0.06));
    [0, 1, 2].forEach((k, i) => pop(c('example', k), ['G4', 'B4', 'D5'][i], -0.3 + i * 0.3, 0.06));
    ding(c('example', 3) + 0.2, 'G5', 0.08, 0, 3);

    // 6 · Kitap
    scenePad('book', ['C3', 'G3', 'E4', 'B4'], { gain: 0.2 });
    m.whoosh(at('book', 0.2), { dur: 0.7, from: 2600, to: 900, gain: 0.05 });
    [0, 1, 2, 3, 4].forEach((k) => m.whoosh(c('book', 0) + 0.8 + k * 0.18, { dur: 0.25, from: 2400, to: 1400, gain: 0.02, panFrom: 0.3, panTo: 0.6 }));
    [0, 1, 2].forEach((k) => {
      m.tick(c('book', 1) + 0.25 + k * 0.45, { gain: 0.05, tone: 4200 });
      m.tick(c('book', 1) + 0.4 + k * 0.45, { gain: 0.05, tone: 4600 });
    });
    ding(c('book', 1) + 2.0, 'E5', 0.07, 0.3);

    // 7 · Kimler için
    m.pad(at('who', 0), untilEnd('who', 0, 0.3), ['F2', 'C3', 'A3', 'C4'], { gain: 0.24, attack: 1.4, release: 2.4, cutoff: 800 });
    m.fireIgnite(at('who', 0.2), { gain: 0.3 });
    m.crackle(at('who', 0.2), span('who', 0.2, 10.6), { gain: 0.16, density: 16, roar: 0.5 });
    ding(c('who', 0) + 0.2, 'C5', 0.1, 0, 3);
    pop(c('who', 1) + 0.1, 'F4', -0.3);
    pop(c('who', 2) + 0.1, 'A4', 0.3);
    pop(c('who', 3) + 0.1, 'C5', -0.5);
    pop(c('who', 3) + 0.4, 'F5', 0.5);

    // 8 · Açık kapı
    scenePad('now', ['D2', 'A2', 'D3', 'F#3'], { gain: 0.22 });
    m.fireIgnite(at('now', 0.2), { gain: 0.2, pan: -0.8 });
    m.crackle(at('now', 0.2), span('now', 0.2, 9.6), { gain: 0.07, pan: -0.8, density: 14, roar: 0.3 });
    ding(c('now', 0) + 0.1, 'D5', 0.1, -0.5);
    CHAPTERS.forEach((_, k) => pop(c('now', 1) + k * 0.22, ['D5', 'F#5', 'A5', 'D6'][k], -0.4, 0.05));
    for (let i = 1; i < 12; i++) m.tick(c('now', 3) + (i - 1) * 0.12, { gain: 0.03, tone: 1800 + i * 60, pan: (GX(i) - W / 2) / W });

    // 9 · Kapanış
    m.pad(at('close', 0), untilEnd('close', 0, 0.2), ['D2', 'A2', 'D3', 'F#3', 'A3'], { gain: 0.3, attack: 2, release: 2.6, cutoff: 900 });
    m.riser(at('close', 0.2), Math.max(0.8, c('close', 0) - at('close', 0.2)), { gain: 0.05 });
    m.fireIgnite(c('close', 0), { gain: 0.55 });
    m.crackle(c('close', 0), sceneEnd('close') - c('close', 0) - 0.4, { gain: 0.2, density: 18, roar: 0.6 });
    m.boom(c('close', 1), { gain: 0.36 });
    [0, 1, 2].forEach((k) => ding(c('close', 1) + 0.05 + k * 0.3, ['D5', 'F#5', 'A5'][k], 0.1, (k - 1) * 0.4, 3));
  }

  window.FILM = E.film({
    title: 'Bilişim Teknolojileri Yetkinliği — Tanıtım',
    timeline: TL,
    background,
    score,
    narration: VOICE,
    voice: VOICE.voice,
  });
  window.MONTAGE = MONTAGE;
  window.MONTAGE_SCREEN = SCREEN;
})();
