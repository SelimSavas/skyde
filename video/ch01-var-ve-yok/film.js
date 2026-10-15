/*
 * Birinci Kapı — Var ve Yok: İki Simgeli Bir Evren
 * "Gerçekliğin ölçülebilir hâle gelmesi" metninin seslendirmeli animasyonu.
 *
 * Görüntü ve ses aynı zaman sabitlerini (T, IGNITE, BIT_P …) paylaşır; böylece
 * bir sahneyi kaydırınca sesleri de birlikte kayar.
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
  };
  const FIRE = [255, 150, 60];
  const COOL = [111, 128, 168];
  const DIGI = [124, 200, 255];

  // Sahneler ve koreografi süreleri (saniye). Gerçek süreler seslendirme beklemeleriyle uzar.
  const SCENES = [
    { id: 'open', base: 8, title: 'Açılış', draw: sceneOpen, fadeIn: 0.6 },
    { id: 'fires', base: 22, title: 'Tepeden tepeye ateş', draw: sceneFires },
    { id: 'two', base: 23, title: 'Var ve yok', draw: sceneTwo },
    { id: 'why', base: 17, title: 'Neden sadece iki?', draw: sceneWhy },
    { id: 'lamps', base: 28, title: 'Yan yana dizmenin bereketi', draw: sceneLamps },
    { id: 'glossary', base: 9, title: 'Sözlük kenarı', draw: sceneGlossary },
    { id: 'letters', base: 17, title: 'Harf nasıl sayı olur?', draw: sceneLetters },
    { id: 'turkish', base: 26, title: 'Türkçenin kayıp harfleri', draw: sceneTurkish },
    { id: 'hex', base: 14, title: 'Sayıları on altılık yazmak', draw: sceneHex },
    { id: 'numbers', base: 24, title: 'Her şey sayıya dönüşebilir mi?', draw: sceneNumbers },
    { id: 'close', base: 3, title: 'Kapanış', draw: sceneClose, fadeOut: 1.4 },
  ];

  // Seslendirme vuruşları: [sahne, başlangıç, bitiş, donma anı] (koreografi zamanı).
  // Donma anı, anlatıcı için beklenecek karedir: öğeler (ve sahne etiketi) tam görünürken, vuruş
  // bitmeden önce. Donma anı olmayan vuruşta animasyon, konuşma sığana dek yavaşlar.
  const BEATS = {
    'open.title': ['open', 3.3, 7.6, 7.0],
    'fires.one': ['fires', 0.4, 4.1, 3.3],
    'fires.relay': ['fires', 4.1, 10.8],
    'fires.race': ['fires', 11.0, 16.0],
    'fires.question': ['fires', 16.6, 19.4],
    'fires.answer': ['fires', 19.5, 22.0, 21.4],
    'two.split': ['two', 0.3, 5.0, 4.8],
    'two.levels': ['two', 5.1, 9.0, 8.6],
    'two.weather': ['two', 9.1, 14.6, 14.0],
    'two.quote': ['two', 15.1, 18.9, 18.8],
    'two.icons': ['two', 19.1, 22.9, 22.2],
    'why.analog': ['why', 0.3, 6.0, 5.6],
    'why.digital': ['why', 6.2, 11.4, 11.0],
    'why.bit': ['why', 11.9, 17.0, 16.15],
    'lamps.one': ['lamps', 0.3, 3.8, 3.45],
    'lamps.two': ['lamps', 3.8, 7.6, 7.25],
    'lamps.three': ['lamps', 7.6, 11.2, 10.9],
    'lamps.four': ['lamps', 11.2, 14.6, 14.05],
    'lamps.table': ['lamps', 14.6, 19.9, 19.35],
    'lamps.byte': ['lamps', 19.9, 21.6, 21.2],
    'lamps.values': ['lamps', 21.7, 23.6, 23.2],
    'lamps.letters': ['lamps', 23.7, 28.0, 27.2],
    'glossary.rows': ['glossary', 0.3, 4.7, 4.6],
    'glossary.compare': ['glossary', 4.8, 9.0, 8.5],
    'letters.question': ['letters', 0.2, 1.6, 1.55],
    'letters.answer': ['letters', 1.6, 4.0, 3.5],
    'letters.encoding': ['letters', 4.1, 8.0, 7.5],
    'letters.merhaba': ['letters', 8.1, 13.7, 13.2],
    'letters.fonts': ['letters', 13.8, 17.0, 16.15],
    'turkish.grid': ['turkish', 0.2, 3.7, 3.65],
    'turkish.half': ['turkish', 3.75, 5.0, 4.8],
    'turkish.letters': ['turkish', 5.05, 7.5, 7.2],
    'turkish.place': ['turkish', 7.55, 9.2, 8.9],
    'turkish.mojibake': ['turkish', 9.3, 13.0, 12.9],
    'turkish.agreement': ['turkish', 13.1, 16.8, 16.3],
    'turkish.unicode': ['turkish', 16.9, 21.6, 21.1],
    'turkish.master': ['turkish', 21.7, 26.0, 25.15],
    'hex.blur': ['hex', 0.2, 2.8, 2.4],
    'hex.digits': ['hex', 2.9, 4.0, 3.6],
    'hex.split': ['hex', 4.1, 7.6, 7.2],
    'hex.colors': ['hex', 7.8, 10.8, 10.75],
    'hex.phone': ['hex', 10.8, 14.0, 13.15],
    'numbers.photo': ['numbers', 0.2, 5.6, 5.1],
    'numbers.sound': ['numbers', 5.7, 8.2, 7.9],
    'numbers.video': ['numbers', 8.2, 10.6, 10.2],
    'numbers.sensors': ['numbers', 10.7, 14.6, 14.1],
    'numbers.statement': ['numbers', 14.7, 18.6, 17.75],
    'numbers.watched': ['numbers', 18.7, 20.8, 20.4],
    'numbers.power': ['numbers', 20.8, 24.0, 23.5],
    'close.end': ['close', 0.3, 3.0, 2.2],
  };

  // Koreografiyle akan kalabalık animasyonları yavaşlatma (vuruş → kat)
  const PACE = { 'lamps.three': 1.4, 'lamps.four': 1.5, 'turkish.grid': 1.3 };
  // Anlatıcı sustuktan sonra görüntünün biraz daha durması: önemli bir sonucun yerine oturması için (sn)
  // Her sahnenin son vuruşunda da kısa bir nefes: sahne geçişi son sözcüğün hemen ardından gelmesin.
  const PAUSE = {
    'fires.one': 0.8,
    'fires.answer': 1.0,
    'two.quote': 1.0,
    'two.icons': 0.6,
    'why.bit': 0.6,
    'lamps.letters': 0.6,
    'glossary.compare': 0.6,
    'letters.fonts': 0.6,
    'hex.phone': 0.6,
    'why.digital': 1.2,
    'lamps.three': 0.6,
    'lamps.table': 0.8,
    'lamps.values': 0.6,
    'letters.question': 0.8,
    'letters.merhaba': 0.6,
    'turkish.place': 0.6,
    'hex.split': 0.8,
    'hex.colors': 0.6,
    'turkish.master': 0.8,
    'numbers.statement': 0.8,
    'numbers.power': 1.0,
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

  // narration.js: seslendirme metni; voice.js: narrate.mjs'in ürettiği ses ve ölçülmüş süreler
  const SCRIPT = window.NARRATION ?? { lines: [] };
  // Tempo kararlarıyla zaman çizelgesini kurar (anlatım planı bunu tekrar tekrar çağırır)
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
  // Anlatıcıya bağlı zamanlar (mutlak gerçek saniye): satırın k. öbeği başlarken
  const cue = VOICE.cue;
  // cue anından itibaren d saniyede 0 → 1
  const after = (t, id, k = 0, d = 0.5, fn = ease.out) => progress(t, cue(id, k), cue(id, k) + d, fn);
  // Bir sahnenin başından beri geçen gerçek süre (beklemelerde de akan saatler için)
  const clock = (id, t) => t - TL.scene(id).start;

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

  // Sol üstte bölüm etiketi
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

  // Alev: üç katmanlı titrek diller, ışıma ve kıvılcımlar. k: 0 (sönük) → 1 (tam)
  function drawFire(ctx, x, y, s, t, k, seed = 0) {
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
    ctx.restore();
  }

  // Çapraz kütüklerden ateş yığını
  function drawPyre(ctx, x, y, s = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.strokeStyle = '#140e0c';
    ctx.lineCap = 'round';
    ctx.lineWidth = 8;
    line(ctx, -38, 2, 26, -20);
    line(ctx, 38, 2, -26, -20);
    line(ctx, -32, -8, 32, -8);
    ctx.restore();
  }

  // Mızraklı nöbetçi silueti
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

  function drawStars(ctx, t, alpha, ox = 0, oy = 0) {
    for (let i = 0; i < 170; i++) {
      const span = W + 200;
      const x = ((((hash(i, 1) * span - ox) % span) + span) % span) - 100;
      const y = hash(i, 2) * 720 - oy;
      const tw = 0.35 + 0.65 * noise(t * (0.6 + hash(i, 4)) + i * 3.3, 5);
      ctx.fillStyle = rgba([235, 238, 255], alpha * tw * (0.35 + 0.65 * hash(i, 6)));
      dot(ctx, x, y, 0.6 + hash(i, 3) * 1.6);
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

  // Basit çizgi ikonlar (yaklaşık 90×90 kutu)
  function drawIcon(ctx, kind, x, y, s, color, alpha = 1) {
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
      case 'phone':
        roundRect(ctx, -24, -42, 48, 84, 9);
        ctx.stroke();
        line(ctx, -8, -32, 8, -32);
        dot(ctx, 0, 32, 3.5);
        break;
      case 'tv':
        roundRect(ctx, -44, -32, 88, 58, 6);
        ctx.stroke();
        line(ctx, -14, 26, -22, 40);
        line(ctx, 14, 26, 22, 40);
        line(ctx, -30, 40, 30, 40);
        break;
      case 'bank':
        ctx.beginPath();
        ctx.moveTo(-46, -14);
        ctx.lineTo(0, -40);
        ctx.lineTo(46, -14);
        ctx.closePath();
        ctx.stroke();
        for (const cx of [-30, -10, 10, 30]) line(ctx, cx, -6, cx, 26);
        line(ctx, -48, 34, 48, 34);
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
      case 'envelope':
        roundRect(ctx, -40, -27, 80, 54, 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-40, -25);
        ctx.lineTo(0, 6);
        ctx.lineTo(40, -25);
        ctx.stroke();
        break;
      case 'note':
        dot(ctx, -18, 24, 10);
        dot(ctx, 18, 16, 10);
        line(ctx, -9, 24, -9, -28);
        line(ctx, 27, 16, 27, -36);
        ctx.lineWidth = 9;
        line(ctx, -9, -28, 27, -36);
        break;
      case 'film':
        roundRect(ctx, -44, -30, 88, 60, 4);
        ctx.stroke();
        for (let j = -3; j <= 3; j++) {
          ctx.fillRect(j * 12 - 3, -25, 6, 6);
          ctx.fillRect(j * 12 - 3, 19, 6, 6);
        }
        ctx.lineWidth = 3;
        ctx.strokeRect(-30, -13, 60, 26);
        break;
      case 'books':
        ctx.strokeRect(-40, -34, 18, 68);
        ctx.strokeRect(-18, -26, 18, 60);
        ctx.save();
        ctx.translate(14, 34);
        ctx.rotate(-0.25);
        ctx.strokeRect(0, -66, 18, 66);
        ctx.restore();
        line(ctx, -48, 36, 46, 36);
        break;
      case 'bit':
        ctx.beginPath();
        ctx.arc(0, 0, 22, Math.PI / 2, Math.PI * 1.5);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'byte':
        text(ctx, 'A', 0, 2, { size: 58, family: 'display', weight: 900, color });
        break;
      case 'pin':
        ctx.beginPath();
        ctx.arc(0, -14, 24, Math.PI * 0.85, Math.PI * 2.15);
        ctx.lineTo(0, 38);
        ctx.closePath();
        ctx.stroke();
        dot(ctx, 0, -14, 8);
        break;
      case 'chat':
        roundRect(ctx, -42, -32, 84, 54, 14);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-20, 22);
        ctx.lineTo(-28, 38);
        ctx.lineTo(-4, 22);
        ctx.stroke();
        for (const cx of [-16, 0, 16]) dot(ctx, cx, -5, 4);
        break;
      case 'eye':
        ctx.beginPath();
        ctx.moveTo(-46, 0);
        ctx.quadraticCurveTo(0, -38, 46, 0);
        ctx.quadraticCurveTo(0, 38, -46, 0);
        ctx.closePath();
        ctx.stroke();
        dot(ctx, 0, 0, 13);
        break;
      case 'timer':
        ctx.beginPath();
        ctx.arc(0, 6, 34, 0, Math.PI * 2);
        ctx.stroke();
        line(ctx, 0, 6, 0, -16);
        line(ctx, 0, 6, 15, 14);
        line(ctx, -10, -38, 10, -38);
        break;
      case 'thermo':
        roundRect(ctx, -11, -46, 22, 66, 11);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 30, 17, 0, Math.PI * 2);
        ctx.stroke();
        dot(ctx, 0, 30, 10);
        ctx.fillRect(-4, -24, 8, 52);
        break;
      case 'drop':
        ctx.beginPath();
        ctx.moveTo(0, -44);
        ctx.bezierCurveTo(14, -20, 32, 0, 32, 16);
        ctx.arc(0, 16, 32, 0, Math.PI);
        ctx.bezierCurveTo(-32, 0, -14, -20, 0, -44);
        ctx.stroke();
        break;
      case 'ruler':
        line(ctx, -46, 0, 46, 0);
        ctx.beginPath();
        ctx.moveTo(-34, -12);
        ctx.lineTo(-46, 0);
        ctx.lineTo(-34, 12);
        ctx.moveTo(34, -12);
        ctx.lineTo(46, 0);
        ctx.lineTo(34, 12);
        ctx.stroke();
        line(ctx, -46, -26, -46, 26);
        line(ctx, 46, -26, 46, 26);
        break;
      case 'heart':
        ctx.beginPath();
        ctx.moveTo(0, 34);
        ctx.bezierCurveTo(-52, 0, -36, -44, 0, -18);
        ctx.bezierCurveTo(36, -44, 52, 0, 0, 34);
        ctx.fill();
        break;
      default:
        break;
    }
    ctx.restore();
  }

  // Ampul: açıkken sıcak ışıma, kapalıyken soğuk gri
  function drawLamp(ctx, x, y, r, on, alpha = 1) {
    if (alpha <= 0.002) return;
    if (on) glow(ctx, x, y, r * 3.4, FIRE, 0.38 * alpha);
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (on) {
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      g.addColorStop(0, '#fff3cf');
      g.addColorStop(0.5, '#ffc062');
      g.addColorStop(1, '#ff8a2a');
      ctx.fillStyle = g;
      ctx.fill();
    } else {
      ctx.fillStyle = '#111a2c';
      ctx.fill();
      ctx.lineWidth = Math.max(2, r * 0.08);
      ctx.strokeStyle = '#3c4862';
      ctx.stroke();
    }
    ctx.fillStyle = on ? '#7a5e45' : '#2a3246';
    roundRect(ctx, x - r * 0.4, y + r * 0.86, r * 0.8, r * 0.46, r * 0.1);
    ctx.fill();
    ctx.restore();
  }

  // Bir bit dizisini sıcak 1 / soğuk 0 olarak yazar
  function bitRuns(str, size) {
    return str.split('').map((b) => [b, { size, family: 'mono', weight: 700, color: b === '1' ? C.fire : C.off }]);
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

  // ---------------------------------------------------------------------------
  // 0 · Açılış
  // ---------------------------------------------------------------------------

  const BLINKS = [1.0, 1.5, 1.85, 2.15, 2.45];

  function sceneOpen(ctx, lt, t) {
    const cx = W / 2;
    let on = false;
    for (const b of BLINKS) if (lt >= b) on = !on;
    const appear = progress(lt, 0.4, 0.9, ease.out);
    const y = lerp(540, 300, progress(lt, 3.0, 4.2));
    const breathe = lt > 3 ? 0.85 + 0.15 * Math.sin(lt * 2.2) : 1;

    ctx.save();
    ctx.globalAlpha *= appear;
    if (on) {
      glow(ctx, cx, y, 200 * breathe, FIRE, 0.4);
      ctx.fillStyle = C.flame;
      dot(ctx, cx, y, 22);
    } else {
      ctx.fillStyle = '#0b1120';
      dot(ctx, cx, y, 22);
      ctx.strokeStyle = C.off;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
    text(ctx, on ? '1' : '0', cx, y + 70, { size: 36, family: 'mono', weight: 700, color: on ? C.fire : C.off, alpha: appear * (1 - progress(lt, 2.9, 3.3)) });

    const a1 = progress(lt, 3.3, 4.3, ease.out);
    text(ctx, 'BİRİNCİ KAPI', cx, 420, { size: 26, weight: 600, spacing: 12, color: C.muted, alpha: a1 });
    const a2 = progress(lt, 3.6, 4.8, ease.out);
    runs(ctx, [
      ['VAR', { size: 170, family: 'display', weight: 900, color: C.fire }],
      [' ve ', { size: 110, family: 'serif', italic: true, color: C.cream }],
      ['YOK', { size: 170, family: 'display', weight: 900, color: C.off }],
    ], cx, 600 + (1 - a2) * 30, { alpha: a2 });
    const a3 = progress(lt, 4.4, 5.4, ease.out);
    text(ctx, 'İki simgeli bir evren', cx, 690, { size: 56, family: 'serif', italic: true, color: C.cream, alpha: a3 });
    const a4 = progress(lt, 5.0, 6.0);
    ctx.save();
    ctx.globalAlpha *= a4;
    ctx.fillStyle = C.dim;
    ctx.fillRect(cx - 60, 776, 120, 2);
    ctx.restore();
    text(ctx, 'GERÇEKLİĞİN ÖLÇÜLEBİLİR HÂLE GELMESİ', cx, 830, { size: 24, weight: 500, spacing: 6, color: C.muted, alpha: a4 });
  }

  // ---------------------------------------------------------------------------
  // 1 · Tepeden tepeye ateş
  // ---------------------------------------------------------------------------

  const PEAKS = [
    { x: 0, h: 500 },
    { x: 740, h: 455 },
    { x: 1440, h: 520 },
    { x: 2100, h: 470 },
    { x: 2760, h: 510 },
    { x: 3380, h: 460 },
  ];
  const IGNITE = [1.6, 5.2, 6.7, 7.9, 8.9, 9.7];
  // Yarışta ateş hattı, anlatıcı "haber" derken dolar
  const raceFire = () => cue('fires-race', 0) + 0.2;

  const ridge = (x) => {
    let y = 130;
    for (const p of PEAKS) {
      const d = (x - p.x) / 330;
      y = Math.max(y, p.h * Math.exp(-d * d));
    }
    return 1080 - y - 26 * (noise(x / 150, 7) - 0.5);
  };
  const farRidge = (x) => 1080 - 330 - 140 * noise(x / 420, 3) - 60 * noise(x / 130, 4);

  function fireCam(lt) {
    const p1 = progress(lt, 3.4, 11.0);
    const p2 = progress(lt, 15.8, 19.0);
    const s = Math.exp(lerp(Math.log(1.18), Math.log(0.47), p1)) * (1 + 0.004 * lt);
    return { x: lerp(0, 1690, p1) + lt * 4, y: lerp(lerp(600, 650, p1), 360, p2), s };
  }

  function applyCam(ctx, cam) {
    ctx.translate(W / 2, H / 2);
    ctx.scale(cam.s, cam.s);
    ctx.translate(-cam.x, -cam.y);
  }

  function fillRidge(ctx, cam, fn, color) {
    const half = W / 2 / cam.s + 60;
    const step = 6 / cam.s;
    ctx.beginPath();
    ctx.moveTo(cam.x - half, cam.y + H / cam.s);
    for (let x = cam.x - half; x <= cam.x + half; x += step) ctx.lineTo(x, fn(x));
    ctx.lineTo(cam.x + half, cam.y + H / cam.s);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function sceneFires(ctx, lt, t) {
    const cam = fireCam(lt);
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#03050b');
    sky.addColorStop(0.7, '#0d1630');
    sky.addColorStop(1, '#141c36');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    drawStars(ctx, t, 1, cam.x * 0.03, (cam.y - 600) * 0.05);
    drawMoon(ctx, 1580 - cam.x * 0.02, 170 - (cam.y - 600) * 0.05, 34);

    const far = { x: cam.x * 0.45 + 300, y: cam.y + 40, s: Math.pow(cam.s, 0.55) };
    ctx.save();
    applyCam(ctx, far);
    fillRidge(ctx, far, farRidge, '#0b1226');
    ctx.restore();

    ctx.save();
    applyCam(ctx, cam);
    fillRidge(ctx, cam, ridge, '#05080f');

    // Haberin tepeden tepeye sekişi
    for (let i = 1; i < PEAKS.length; i++) {
      const a = vis(lt, IGNITE[i] - 0.6, IGNITE[i] + 0.15, 0.1, 0.15);
      if (a <= 0) continue;
      const p = progress(lt, IGNITE[i] - 0.6, IGNITE[i]);
      const x0 = PEAKS[i - 1].x;
      const y0 = ridge(x0) - 90;
      const x1 = PEAKS[i].x;
      const y1 = ridge(x1) - 40;
      const qx = (x0 + x1) / 2;
      const qy = Math.min(y0, y1) - 160;
      for (let j = 0; j < 18; j++) {
        const u = p - j * 0.014;
        if (u < 0) break;
        const px = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * qx + u * u * x1;
        const py = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * qy + u * u * y1;
        ctx.fillStyle = rgba([255, 200, 120], a * (1 - j / 18) * 0.9);
        dot(ctx, px, py, (4.5 - j * 0.18) / cam.s);
      }
    }

    PEAKS.forEach((p, i) => {
      const gy = ridge(p.x);
      drawFire(ctx, p.x, gy - 14, 1, t, progress(lt, IGNITE[i], IGNITE[i] + 0.7, ease.out), i + 1);
      drawPyre(ctx, p.x, gy - 4, 1);
      drawWatchman(ctx, p.x + 62, ridge(p.x + 62) + 2, 1);
    });
    ctx.restore();

    // Ateş ile atlının yarışı
    const race = vis(lt, 11.0, 16.2, 0.5, 0.5);
    if (race > 0) {
      ctx.save();
      ctx.globalAlpha *= race;
      roundRect(ctx, 250, 752, 1420, 176, 16);
      ctx.fillStyle = 'rgba(5,8,16,0.78)';
      ctx.fill();
      const x0 = 470;
      const x1 = 1430;
      ctx.lineCap = 'round';

      text(ctx, 'ATEŞ', 300, 804, { size: 26, weight: 700, spacing: 4, color: C.fire, align: 'left' });
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 4;
      line(ctx, x0, 804, x1, 804);
      const pf = progress(t, raceFire(), raceFire() + 1.4);
      ctx.strokeStyle = C.fire;
      ctx.lineWidth = 6;
      if (pf > 0) line(ctx, x0, 804, lerp(x0, x1, pf), 804);
      for (let j = 0; j < 6; j++) {
        const lit = pf >= j / 5 - 1e-6;
        if (lit) glow(ctx, lerp(x0, x1, j / 5), 804, 34, FIRE, 0.6);
        ctx.fillStyle = lit ? C.flame : C.dim;
        dot(ctx, lerp(x0, x1, j / 5), 804, 8);
      }
      const hours = VOICE.end('fires-race') - 1.1;
      text(ctx, 'birkaç saat', 1460, 804, { size: 32, family: 'serif', italic: true, color: C.fire, align: 'left', alpha: progress(t, hours, hours + 0.5) });

      text(ctx, 'ATLI', 300, 880, { size: 26, weight: 700, spacing: 4, color: C.muted, align: 'left' });
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 4;
      line(ctx, x0, 880, x1, 880);
      const ph = progress(lt, 11.4, 16.2, ease.linear);
      const hx = lerp(x0, x1, 0.13 * ph);
      ctx.strokeStyle = C.muted;
      line(ctx, x0, 880, hx, 880);
      ctx.save();
      ctx.translate(hx + 10, 868 - Math.abs(Math.sin(lt * 7)) * 5);
      ctx.scale(-1, 1);
      text(ctx, '🐎', 0, 0, { size: 46 });
      ctx.restore();
      const day = 1 + Math.min(2, Math.floor(ph * 3));
      text(ctx, `${day}. gün…`, 1460, 880, { size: 32, family: 'serif', italic: true, color: C.muted, align: 'left' });
      ctx.restore();
    }

    // Ateşin önceden kararlaştırılmış anlamı
    const tag = vis(lt, 0.4, 4.1, 0.3, 0.6) * after(t, 'fires-meaning', 1, 0.6);
    if (tag > 0) {
      ctx.save();
      ctx.globalAlpha *= tag;
      ctx.translate(1400, 330 + (1 - tag) * 16);
      ctx.rotate(-0.02);
      paperCard(ctx, -250, -80, 500, 160);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha *= tag * 0.6;
      ctx.strokeStyle = C.flame;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      line(ctx, 1150, 380, 1010, 430);
      ctx.restore();
      text(ctx, 'ATEŞ YANARSA', 1400, 294 + (1 - tag) * 16, { size: 26, weight: 800, spacing: 6, color: '#b8400f', alpha: tag });
      text(ctx, 'düşman sınırı geçti', 1400, 352 + (1 - tag) * 16, { size: 44, family: 'serif', italic: true, color: C.ink, alpha: tag });
    }

    const dark = progress(lt, 16.0, 17.2);
    if (dark > 0) {
      ctx.fillStyle = `rgba(3,5,10,${0.5 * dark})`;
      ctx.fillRect(0, 0, W, H);
    }
    const q = vis(lt, 16.6, 22.5, 0.7, 0.3);
    text(ctx, 'Ateş tam olarak ne söylüyordu?', W / 2, 220 + (1 - progress(lt, 16.6, 17.4, ease.out)) * 20, { size: 78, family: 'serif', color: C.cream, alpha: q });
    text(ctx, 'Aslında tek bir şey:', W / 2, 330, { size: 34, color: C.muted, alpha: vis(lt, 18.8, 22.5, 0.5, 0.3) });
    const sc = lerp(0.85, 1, progress(lt, 19.5, 20.1, ease.back));
    ctx.save();
    ctx.translate(W / 2, 450);
    ctx.scale(sc, sc);
    text(ctx, '“Oldu.”', 0, 0, { size: 140, family: 'serif', italic: true, color: C.flame, alpha: vis(lt, 19.5, 22.5, 0.4, 0.3), glow: 'rgba(255,140,40,0.7)', glowBlur: 40 });
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 2 · İki durum, elli durum
  // ---------------------------------------------------------------------------

  const GUESSES = ['27', '31', '24', '35', '29', '22', '33', '26'];
  // "Biraz / yarı / gürül gürül": two-levels satırının 1-3. öbeklerinde ateşin boyu ve anlamı
  const LEVELS = [[0.3, 'asker'], [0.62, 'gemi'], [0.97, 'savaş']];
  const TWO_S = 3.9; // two.levels eklenince kayan koreografi (hava, söz, simgeler)

  function drawWeather(ctx, t, a) {
    ctx.save();
    ctx.fillStyle = `rgba(70,80,104,${0.3 * a})`;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 8; i++) {
      const x = ((hash(i, 40) * W + t * (20 + 30 * hash(i, 41))) % (W + 800)) - 400;
      glow(ctx, x, 300 + hash(i, 42) * 500, 380 + 260 * hash(i, 43), [150, 162, 190], 0.24 * a);
    }
    ctx.strokeStyle = `rgba(175,195,235,${0.32 * a})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 260; i++) {
      const v = 1500 + 700 * hash(i, 51);
      const len = 26 + 36 * hash(i, 52);
      const y = ((hash(i, 53) * (H + 200) + t * v) % (H + 200)) - 100;
      const x = hash(i, 50) * (W + 300) - (y + 100) * 0.22;
      ctx.moveTo(x, y);
      ctx.lineTo(x - len * 0.22, y + len);
    }
    ctx.stroke();
    ctx.restore();
  }

  function sceneTwo(ctx, lt, t) {
    const L = 600;
    const R = 1320;
    const S = TWO_S;
    const multi = progress(lt, 5.2, 6.2);
    const fifty = after(t, 'two-levels', 0, 0.7, ease.inOut);
    const weather = after(t, 'two-weather', 0, 1.4, ease.inOut) * clamp((11.2 + S - lt) / 1.0);
    const guess = after(t, 'two-weather', 2, 0.8, ease.inOut);
    const gy = (x) => 720 - 95 * Math.exp(-(((x - L) / 210) ** 2)) - 95 * Math.exp(-(((x - R) / 210) ** 2));

    ctx.save();
    ctx.globalAlpha *= 1 - progress(lt, 10.6 + S, 11.6 + S);
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 12) ctx.lineTo(x, gy(x));
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = '#060912';
    ctx.fill();

    // Sağ ateş: önce anlatılan üç kademe, havada ise kestirilemeyen bir titreme
    let level = 0.14;
    let word = null;
    LEVELS.forEach(([k, w], i) => {
      const p = after(t, 'two-levels', i + 1, 0.7, ease.inOut);
      level = lerp(level, k, p);
      if (p > 0) word = w;
    });
    const kR = multi * lerp(level, 0.22 + 0.7 * noise(t * 1.6, 11), guess);
    drawFire(ctx, L, gy(L) - 14, 1.15, t, 1, 3);
    drawPyre(ctx, L, gy(L) - 4, 1.15);
    drawFire(ctx, R, gy(R) - 14, 1.15, t, kR, 5);
    drawPyre(ctx, R, gy(R) - 4, 1.15);

    const p1 = (1 - multi) * progress(lt, 0.2, 0.8);
    text(ctx, 'YANIYORSA', L, 250, { size: 28, weight: 600, spacing: 8, color: C.muted, alpha: p1 });
    text(ctx, 'YANMIYORSA', R, 250, { size: 28, weight: 600, spacing: 8, color: C.muted, alpha: p1 });
    text(ctx, 'OLDU', L, 830, { size: 100, family: 'display', weight: 900, color: C.fire, alpha: (1 - multi) * after(t, 'two-split', 0, 0.6), glow: 'rgba(255,120,30,0.5)', glowBlur: 30 });
    text(ctx, 'OLMADI', R, 830, { size: 100, family: 'display', weight: 900, color: C.off, alpha: (1 - multi) * after(t, 'two-split', 1, 0.6) });

    text(ctx, '2 DURUM', L, 250, { size: 28, weight: 700, spacing: 8, color: C.cream, alpha: multi });
    text(ctx, '50 DURUM', R, 250, { size: 28, weight: 700, spacing: 8, color: C.cream, alpha: multi * fifty });
    if (multi > 0) {
      // Sol: iki konumlu, net gösterge
      const lx = L - 230;
      ctx.save();
      ctx.globalAlpha *= multi;
      ctx.fillStyle = C.dim;
      ctx.fillRect(lx, 340, 26, 3);
      ctx.fillRect(lx, 620, 26, 3);
      text(ctx, 'var', lx - 16, 340, { size: 26, family: 'mono', color: C.fire, align: 'right' });
      text(ctx, 'yok', lx - 16, 620, { size: 26, family: 'mono', color: C.off, align: 'right' });
      ctx.fillStyle = C.fire;
      ctx.beginPath();
      ctx.moveTo(lx + 36, 341);
      ctx.lineTo(lx + 54, 331);
      ctx.lineTo(lx + 54, 351);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Sağ: elli konumlu gösterge; ateşin boyu bir haber demek
      const sx = R + 210;
      ctx.save();
      ctx.globalAlpha *= multi * fifty;
      for (let i = 0; i <= 50; i++) {
        const y = lerp(640, 330, i / 50);
        ctx.fillStyle = C.dim;
        ctx.fillRect(sx, y, i % 10 === 0 ? 26 : i % 5 === 0 ? 18 : 10, 2);
      }
      const py = lerp(640, 330, kR / multi || 0);
      ctx.fillStyle = C.cream;
      ctx.beginPath();
      ctx.moveTo(sx - 6, py + 1);
      ctx.lineTo(sx - 24, py - 9);
      ctx.lineTo(sx - 24, py + 11);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      if (word) text(ctx, `= ${word}`, sx + 44, py, { size: 36, family: 'serif', italic: true, color: C.flame, align: 'left', alpha: multi * fifty * (1 - guess) });
      text(ctx, `${GUESSES[Math.floor(t / 0.6) % GUESSES.length]}?`, sx + 44, py, { size: 34, family: 'mono', color: C.cream, align: 'left', alpha: multi * guess });
    }
    text(ctx, '✗ kolayca yanılırsınız', R, 830, { size: 42, family: 'serif', italic: true, color: C.error, alpha: after(t, 'two-weather', 4, 0.6) });
    text(ctx, '✓ ayırt etmesi kolay', L, 830, { size: 42, family: 'serif', italic: true, color: C.ok, alpha: after(t, 'two-weather', 7, 0.6) });
    ctx.restore();

    if (weather > 0) drawWeather(ctx, t, weather);

    const qa = vis(lt, 11.2 + S, 19 + S, 0.8, 0.45);
    if (qa > 0) {
      const lay = paragraph(ctx, 'İki durum arasında yanılmak,\nelli durum arasında yanılmaktan\nçok daha güçtür.', W / 2, 360, 1500, {
        size: 76, family: 'serif', color: C.cream, alpha: qa, lineHeight: 98, valign: 'middle',
      });
      const w = measure(ctx, 'çok daha güçtür.', { size: 76, family: 'serif' });
      ctx.save();
      ctx.globalAlpha *= qa;
      ctx.fillStyle = C.fire;
      ctx.fillRect(W / 2 - w / 2, lay.top + 2 * lay.lineHeight + 48, w * after(t, 'two-quote', 1, 1.6, ease.inOut), 5);
      ctx.restore();
      [['phone', 'telefon', 1, 0], ['tv', 'televizyon', 2, 0], ['bank', 'banka hesabı', 3, 0], ['book', 'bu kitap', 3, 0.45]].forEach(([kind, label, k, d], i) => {
        const a = qa * progress(t, cue('two-icons', k) + d, cue('two-icons', k) + d + 0.5, ease.out);
        const x = W / 2 + (i - 1.5) * 250;
        drawIcon(ctx, kind, x, 680 - (1 - a) * 12, 1, C.fire, a);
        text(ctx, label, x, 770, { size: 28, color: C.muted, alpha: a });
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 3 · Neden sadece iki?
  // ---------------------------------------------------------------------------

  const BITS = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1];
  const BIT_P = 0.4; // bir bitin süresi (sahne saatiyle, gerçek saniye)
  const bitAt = (k) => BITS[((k % BITS.length) + BITS.length) % BITS.length];
  const bitReadAt = (k) => (k + 0.5) * BIT_P;

  const analogV = (tau) => 3.74 + 0.16 * Math.sin(tau * 2.3) + 0.24 * (noise(tau * 7, 21) - 0.5) + 0.12 * (noise(tau * 45, 22) - 0.5);
  const digitalV = (tau) => {
    const k = Math.floor(tau / BIT_P);
    const f = tau / BIT_P - k;
    const level = lerp(bitAt(k - 1), bitAt(k), ease.inOut(clamp(f / 0.14)));
    return 0.4 + level * 4.1 + 0.4 * (noise(tau * 30, 23) - 0.5);
  };
  // Sinyal sahne saatiyle akar (beklemelerde de oynar); anlatıcı "elektrik var mı, yok mu?" deyince
  // iki düzeyli sinyale geçer. İlk okunan bit: anlatıcı eşiğin üstünü anlatırken.
  const whyTimes = () => {
    const s0 = TL.scene('why').start;
    const m0 = cue('why-threshold', 1) - s0;
    const first = Math.ceil((cue('why-threshold', 5) - s0) / BIT_P);
    return { m0, first };
  };

  function sceneWhy(ctx, lt, t) {
    kicker(ctx, 'NEDEN SADECE İKİ?', lt, 17);
    const clk = clock('why', t);
    const { m0, first } = whyTimes();
    const morphAt = (tau) => progress(tau, m0, m0 + 1.2);
    const signalV = (tau) => lerp(analogV(tau), digitalV(tau), morphAt(tau));
    const panel = vis(lt, 0.1, 11.9, 0.6, 0.5);
    const x0 = 180;
    const x1 = 1740;
    const y0 = 180;
    const y1 = 620;
    const vy = (v) => y1 - 30 - (v / 5) * (y1 - y0 - 60);

    if (panel > 0) {
      const th = after(t, 'why-threshold', 3, 0.7, ease.inOut);
      const up = after(t, 'why-threshold', 5, 0.6);
      const down = after(t, 'why-threshold', 6, 0.6);
      ctx.save();
      ctx.globalAlpha *= panel;
      roundRect(ctx, x0, y0, x1 - x0, y1 - y0, 16);
      ctx.fillStyle = '#081020';
      ctx.fill();
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(60,80,120,0.25)';
      ctx.lineWidth = 1;
      for (let x = x0 + 130; x < x1; x += 130) line(ctx, x, y0, x, y1);
      for (let v = 0; v <= 5; v++) line(ctx, x0, vy(v), x1, vy(v));

      if (th > 0) {
        ctx.fillStyle = rgba(FIRE, 0.1 * up);
        ctx.fillRect(x0, y0, x1 - x0, vy(2.5) - y0);
        ctx.fillStyle = rgba(COOL, 0.12 * down);
        ctx.fillRect(x0, vy(2.5), x1 - x0, y1 - vy(2.5));
        ctx.setLineDash([14, 10]);
        ctx.strokeStyle = rgba([243, 237, 225], 0.6 * th);
        ctx.lineWidth = 2.5;
        line(ctx, x0, vy(2.5), lerp(x0, x1, th), vy(2.5));
        ctx.setLineDash([]);
      }

      // Sinyal: sağ kenar "şimdi"; iki düzeye geçiş sağdan girer
      const WIN = 3.6;
      ctx.beginPath();
      for (let x = x0; x <= x1; x += 3) {
        const tau = clk - WIN + ((x - x0) / (x1 - x0)) * WIN;
        const y = vy(signalV(tau));
        if (x === x0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = C.digital;
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(124,200,255,0.6)';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();

      const axis = after(t, 'why-volt', 2, 0.6);
      text(ctx, '5 V', x0 - 16, vy(5), { size: 22, family: 'mono', color: C.dim, align: 'right' });
      text(ctx, '0 V', x0 - 16, vy(0), { size: 22, family: 'mono', color: C.dim, align: 'right' });
      text(ctx, 'volt', x0 - 16, vy(2.5), { size: 24, family: 'mono', weight: 700, color: C.cream, align: 'right', alpha: axis });
      text(ctx, 'zaman →', x1, y1 + 24, { size: 22, family: 'mono', color: C.muted, align: 'right', alpha: axis * (1 - th) });
      text(ctx, 'eşik', x0 + 20, vy(2.5) - 22, { size: 26, family: 'mono', weight: 700, color: C.cream, align: 'left', alpha: th * after(t, 'why-threshold', 4, 0.5) });
      runs(ctx, [
        ['VAR', { size: 30, family: 'mono', weight: 700, color: C.fire }],
        ['  →  1', { size: 30, family: 'mono', weight: 700, color: C.fire, alpha: after(t, 'why-code', 1, 0.4) }],
      ], x0 + 20, y0 + 44, { align: 'left', alpha: up });
      runs(ctx, [
        ['YOK', { size: 30, family: 'mono', weight: 700, color: C.off }],
        ['  →  0', { size: 30, family: 'mono', weight: 700, color: C.off, alpha: after(t, 'why-code', 3, 0.4) }],
      ], x0 + 20, y1 - 26, { align: 'left', alpha: down });

      // Ölçülen değer: sürekli titrer; "tam 3,74 volt" denince bir an durur, sonra kayıp kırmızılaşır
      const freeze = cue('why-wobble', 4);
      const drift = after(t, 'why-wobble', 5, 0.4);
      const shown = t >= freeze && drift === 0 ? 3.74 : analogV(Math.floor(clk / 0.12) * 0.12);
      const va = progress(t, cue('why-volt', 1), cue('why-volt', 1) + 0.6) * (1 - progress(clk, m0, m0 + 0.5));
      const vc = t >= freeze ? (drift > 0 ? C.error : C.flame) : C.cream;
      text(ctx, `${shown.toFixed(2).replace('.', ',')} V`, x1, 128, { size: 60, family: 'mono', weight: 700, color: vc, align: 'right', alpha: va });
      const nowBit = bitAt(Math.floor(clk / BIT_P));
      text(ctx, nowBit ? 'elektrik VAR' : 'elektrik YOK', x1, 128, { size: 52, family: 'mono', weight: 700, color: nowBit ? C.fire : C.off, align: 'right', alpha: up });
      ctx.restore();

      const chipsOut = 1 - progress(clk, m0 - 0.4, m0 + 0.2);
      ['sıcaklık değişir', 'kablonun direnci artar', 'komşu devreden parazit gelir'].forEach((str, i) => {
        const a = panel * chipsOut * after(t, 'why-wobble', i + 1, 0.5);
        if (a <= 0) return;
        const x = [470, 930, 1440][i];
        const w = measure(ctx, str, { size: 28 }) + 48;
        ctx.save();
        ctx.globalAlpha *= a;
        roundRect(ctx, x - w / 2, 676, w, 56, 28);
        ctx.fillStyle = 'rgba(255,84,104,0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,84,104,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        text(ctx, str, x, 705, { size: 28, color: C.cream, alpha: a });
      });

      // Okunan bitler
      const n = 16;
      const cw = 76;
      const gap = 12;
      const bx = W / 2 - (n * cw + (n - 1) * gap) / 2;
      const cells = panel * up;
      for (let j = 0; j < n; j++) {
        const k = first + j;
        const x = bx + j * (cw + gap);
        ctx.save();
        ctx.globalAlpha *= cells;
        roundRect(ctx, x, 670, cw, 92, 10);
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        const a = cells * progress(clk, bitReadAt(k), bitReadAt(k) + 0.15);
        if (a > 0) text(ctx, String(bitAt(k)), x + cw / 2, 718, { size: 56, family: 'mono', weight: 700, color: bitAt(k) ? C.fire : C.off, alpha: a });
      }
    }

    const cardsA = vis(lt, 11.9, 17, 0.5, 0.4);
    [['Elektrik var', '1', C.fire, FIRE], ['Elektrik yok', '0', C.off, COOL]].forEach(([label, digit, col, rgb], i) => {
      const a = cardsA * progress(lt, 11.9 + i * 0.3, 12.5 + i * 0.3, ease.out);
      if (a <= 0) return;
      const x = W / 2 + (i === 0 ? -300 : 300);
      const y = 290 + (1 - a) * 20;
      ctx.save();
      ctx.globalAlpha *= a;
      roundRect(ctx, x - 250, y - 85, 500, 170, 20);
      ctx.fillStyle = rgba(rgb, 0.08);
      ctx.fill();
      ctx.strokeStyle = rgba(rgb, 0.6);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      text(ctx, label, x - 215, y, { size: 40, weight: 600, color: C.cream, align: 'left', alpha: a });
      text(ctx, '→', x + 85, y, { size: 46, color: C.muted, alpha: a });
      text(ctx, digit, x + 165, y + 4, { size: 120, family: 'mono', weight: 700, color: col, alpha: a, glow: i === 0 ? 'rgba(255,140,40,0.6)' : undefined });
    });
    const bitA = cardsA * after(t, 'why-bit', 0, 0.6);
    text(ctx, 'BİT', W / 2, 530, { size: 150, family: 'display', weight: 900, color: C.cream, alpha: bitA, spacing: 12 });
    text(ctx, 'Bilişimin atomu: bölünemeyen en küçük bilgi parçası.', W / 2, 680, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: cardsA * after(t, 'why-bit', 2, 0.6) });
    const pairs = [['evet', 'hayır'], ['açık', 'kapalı']];
    pairs.forEach(([a, b], i) => {
      const s0 = cue('why-pairs', i + 1);
      const s1 = i < pairs.length - 1 ? cue('why-pairs', i + 2) : Infinity;
      const fa = cardsA * vis(t, s0, s1, 0.3, 0.25);
      if (fa <= 0) return;
      runs(ctx, [
        [a, { size: 48, weight: 700, color: C.fire }],
        ['  /  ', { size: 48, color: C.dim }],
        [b, { size: 48, weight: 700, color: C.off }],
      ], W / 2, 830, { alpha: fa });
    });
  }

  // ---------------------------------------------------------------------------
  // 4 · Yan yana dizmenin bereketi
  // ---------------------------------------------------------------------------

  const STAGES = [{ n: 1, at: 0.3 }, { n: 2, at: 3.8 }, { n: 3, at: 7.6 }, { n: 4, at: 11.2 }];
  const STAGE_END = 14.6;
  const LAYOUT = {
    1: { cols: 1, r: 46, lampGap: 0, rowGap: 150, colGap: 0, step: 0.6 },
    2: { cols: 1, r: 36, lampGap: 100, rowGap: 112, colGap: 0, step: 0.4 },
    3: { cols: 2, r: 28, lampGap: 76, rowGap: 104, colGap: 430, step: 0.24 },
    4: { cols: 4, r: 15, lampGap: 40, rowGap: 96, colGap: 270, step: 0.12 },
  };
  // Bir dizilişin belirdiği gerçek an: 1-2 lambada anlatıcı her birini söylerken, sonra koreografiyle
  const comboAt = (st, c) => {
    if (st.n === 1) return cue('lamps-one', 1 + c);
    if (st.n === 2) return cue('lamps-two', 2 + c);
    return TL.at('lamps', st.at + 0.35 + c * LAYOUT[st.n].step);
  };
  // Durum sayısının söylendiği an (o ana kadar sayaçta "?")
  const COUNT_CUE = { 1: ['lamps-one', 3], 2: ['lamps-two', 6], 3: ['lamps-three', 1], 4: ['lamps-four', 1] };
  const comboCenter = (st, c) => {
    const L = LAYOUT[st.n];
    const rows = Math.ceil(2 ** st.n / L.cols);
    const label = Math.round(L.r * 1.1 + 6);
    const shift = -(30 + st.n * label * 0.6) / 2;
    return {
      x: 600 + shift + (Math.floor(c / rows) - (L.cols - 1) / 2) * L.colGap,
      y: 540 + ((c % rows) - (rows - 1) / 2) * L.rowGap,
    };
  };
  const LADDER = ['2', '4', '8', '16', '32', '64', '128', '256'];
  const BIG = [[16, '65.536', ''], [32, '4.294.967.296', 'dört milyardan fazla'], [64, '18.446.744.073.709.551.616', 'on sekiz milyar milyardan fazla']];
  // Bayt sahnesinde harf döngüsü (yalnızca ilk anlaşmadaki karakterler)
  const CHARS = [['A', 65], ['B', 66], ['a', 97], ['7', 55], ['?', 63], ['Z', 90], ['k', 107]];
  const CHAR_P = 0.9;

  function sceneLamps(ctx, lt, t) {
    kicker(ctx, 'YAN YANA DİZMENİN BEREKETİ', lt, 28);

    STAGES.forEach((st, si) => {
      const next = si < STAGES.length - 1 ? STAGES[si + 1].at : STAGE_END;
      const sa = vis(lt, st.at, next, 0.3, 0.3);
      if (sa <= 0) return;
      const L = LAYOUT[st.n];
      const count = 2 ** st.n;
      const label = Math.round(L.r * 1.1 + 6);
      const half = ((st.n - 1) / 2) * L.lampGap + L.r;
      for (let c = 0; c < count; c++) {
        const a = sa * progress(t, comboAt(st, c), comboAt(st, c) + 0.25, ease.out);
        if (a <= 0) continue;
        const { x: cx, y: cy } = comboCenter(st, c);
        let bits = '';
        for (let j = 0; j < st.n; j++) {
          const on = (c >> (st.n - 1 - j)) & 1;
          bits += on;
          drawLamp(ctx, cx + (j - (st.n - 1) / 2) * L.lampGap, cy, L.r, on, a);
        }
        runs(ctx, bitRuns(bits, label), cx + half + 30, cy + L.r * 0.4 + 3, { align: 'left', alpha: a });
      }

      // Üç lambada katlamanın nedeni: yeni (en soldaki) lamba sönükken eski dört durum, yanarken aynısı
      if (st.n === 3) {
        [['yeni lamba sönük: 4 durum', 2, COOL], ['yeni lamba yanıyor: 4 durum', 4, FIRE]].forEach(([str, k, rgb], col) => {
          const a = sa * after(t, 'lamps-three', k, 0.6);
          if (a <= 0) return;
          const top = comboCenter(st, col * 4);
          const bot = comboCenter(st, col * 4 + 3);
          const lx = top.x - L.lampGap;
          ctx.save();
          ctx.globalAlpha *= a;
          ctx.setLineDash([8, 7]);
          ctx.strokeStyle = rgba(rgb, 0.9);
          ctx.lineWidth = 2.5;
          roundRect(ctx, lx - L.r - 12, top.y - L.r - 14, 2 * L.r + 24, bot.y - top.y + 2 * L.r + 28, 14);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
          text(ctx, str, top.x + 50, bot.y + 96, { size: 30, family: 'serif', italic: true, color: col ? C.flame : C.digital, alpha: a });
        });
      }
    });

    const counterA = vis(lt, 0.3, STAGE_END, 0.5, 0.5);
    if (counterA > 0) {
      const cur = STAGES.filter((s) => lt >= s.at).pop() ?? STAGES[0];
      const [cid, ck] = COUNT_CUE[cur.n];
      const known = after(t, cid, ck, 0.45);
      ctx.save();
      ctx.globalAlpha *= counterA * 0.6;
      ctx.fillStyle = C.line;
      ctx.fillRect(1180, 260, 2, 560);
      ctx.restore();
      text(ctx, `${cur.n} lamba`, 1490, 380, { size: 48, weight: 600, color: C.cream, alpha: counterA });
      text(ctx, '?', 1490, 545, { size: 200, family: 'display', weight: 900, color: C.dim, alpha: counterA * (1 - known) });
      const pop = 1 + 0.18 * (1 - known);
      ctx.save();
      ctx.translate(1490, 545);
      ctx.scale(pop, pop);
      text(ctx, String(2 ** cur.n), 0, 0, { size: 220, family: 'display', weight: 900, color: C.fire, alpha: counterA * known, glow: 'rgba(255,130,40,0.45)', glowBlur: 40 });
      ctx.restore();
      text(ctx, 'farklı durum', 1490, 690, { size: 40, color: C.muted, alpha: counterA });
      if (cur.n > 1) {
        const p = progress(t, cue(cid, ck), cue(cid, ck) + 1.0, ease.out);
        text(ctx, '×2', 1700, 440 - p * 60, { size: 56, weight: 800, color: C.flame, alpha: counterA * vis(t, cue(cid, ck), cue(cid, ck) + 1.2, 0.1, 0.5) });
      }
      if (cur.n === 3) text(ctx, '4 + 4 = 8', 1490, 790, { size: 54, family: 'mono', weight: 700, color: C.flame, alpha: counterA * after(t, 'lamps-three', 6, 0.5) });
      if (cur.n === 4) text(ctx, 'her lamba ×2', 1490, 790, { size: 40, family: 'serif', italic: true, color: C.flame, alpha: counterA * after(t, 'lamps-four', 3, 0.5) });
    }

    // Katlama merdiveni: 1-8 lamba; ardından büyük sayılar
    const tabA = vis(lt, 14.6, 19.9, 0.5, 0.5);
    if (tabA > 0) {
      text(ctx, 'LAMBA', 400, 200, { size: 24, weight: 600, spacing: 6, color: C.muted, align: 'right', alpha: tabA });
      text(ctx, 'FARKLI DURUM', 500, 200, { size: 24, weight: 600, spacing: 6, color: C.muted, align: 'left', alpha: tabA });
      ctx.save();
      ctx.globalAlpha *= tabA;
      ctx.fillStyle = C.line;
      ctx.fillRect(220, 226, 600, 2);
      ctx.fillRect(880, 240, 2, 600);
      ctx.restore();
      const hl = after(t, 'lamps-table', 5, 0.5);
      LADDER.forEach((val, i) => {
        const at = i < 4 ? TL.at('lamps', 14.8 + i * 0.25) : cue('lamps-table', i - 3);
        const a = tabA * progress(t, at, at + 0.35, ease.out);
        if (a <= 0) return;
        const y = 270 + i * 74;
        if (i === 7 && hl > 0) {
          ctx.save();
          ctx.globalAlpha *= a * hl;
          roundRect(ctx, 220, y - 32, 600, 64, 12);
          ctx.fillStyle = rgba(FIRE, 0.14);
          ctx.fill();
          ctx.restore();
        }
        text(ctx, String(i + 1), 400, y, { size: 44, family: 'mono', weight: 700, color: C.cream, align: 'right', alpha: a });
        text(ctx, val, 500, y, { size: 44, family: 'mono', weight: 700, color: i === 7 ? C.fire : C.cream, align: 'left', alpha: a });
        if (i > 0) text(ctx, '×2', 760, y - 37, { size: 24, weight: 800, color: C.flame, alpha: a * 0.8 });
      });
      BIG.forEach(([n, val, words], i) => {
        const a = tabA * progress(t, cue('lamps-big', 0) + i * 0.45, cue('lamps-big', 0) + i * 0.45 + 0.4, ease.out);
        if (a <= 0) return;
        const y = 330 + i * 190;
        text(ctx, `${n} lamba`, 940, y - 44, { size: 30, weight: 600, color: C.muted, align: 'left', alpha: a });
        text(ctx, val, 940, y + 8, { size: n === 64 ? 38 : 48, family: 'mono', weight: 700, color: C.cream, align: 'left', alpha: a });
        if (words) text(ctx, words, 940, y + 62, { size: 32, family: 'serif', italic: true, color: C.flame, align: 'left', alpha: a });
      });
    }

    // Bayt: sekiz lamba, değerleri ve tuttuğu sayı
    const byteA = vis(lt, 19.9, 28, 0.5, 0.45);
    if (byteA > 0) {
      const ci = Math.floor((t - cue('lamps-letters', 1)) / CHAR_P);
      let val = 0;
      let mode = 'none';
      if (t >= cue('lamps-values', 7)) [val, mode] = [5, 'five'];
      if (t >= cue('lamps-range', 0)) [val, mode] = [0, 'zero'];
      if (t >= cue('lamps-range', 1)) [val, mode] = [255, 'full'];
      if (t >= cue('lamps-range', 3)) mode = 'range';
      if (ci >= 0) [val, mode] = [CHARS[ci % CHARS.length][1], 'char'];
      const modeAt = { none: 0, five: cue('lamps-values', 7), zero: cue('lamps-range', 0), full: cue('lamps-range', 1), range: cue('lamps-range', 3), char: cue('lamps-letters', 1) }[mode];
      const fresh = progress(t, modeAt, modeAt + 0.35, ease.out);
      const VALUES_K = [6, 5, 5, 5, 4, 3, 2, 1]; // her lambanın değeri lamps-values'ın hangi öbeğinde söyleniyor
      for (let j = 0; j < 8; j++) {
        const x = W / 2 + (j - 3.5) * 120;
        const on = (val >> (7 - j)) & 1;
        drawLamp(ctx, x, 320, 36, on, byteA);
        const delay = j >= 1 && j <= 3 ? (3 - j) * 0.25 : 0;
        const la = byteA * progress(t, cue('lamps-values', VALUES_K[j]) + delay, cue('lamps-values', VALUES_K[j]) + delay + 0.4, ease.out);
        text(ctx, String(2 ** (7 - j)), x, 236, { size: 34, family: 'mono', weight: 700, color: on && mode !== 'char' ? C.flame : C.muted, alpha: la });
      }
      ctx.save();
      ctx.globalAlpha *= byteA * progress(lt, 20.1, 20.5);
      ctx.strokeStyle = C.dim;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 3.5 * 120, 392);
      ctx.lineTo(W / 2 - 3.5 * 120, 408);
      ctx.lineTo(W / 2 + 3.5 * 120, 408);
      ctx.lineTo(W / 2 + 3.5 * 120, 392);
      ctx.stroke();
      ctx.restore();
      runs(ctx, [
        ['8 bit', { size: 76, family: 'display', weight: 800, color: C.cream }],
        ['  =  ', { size: 76, family: 'display', weight: 300, color: C.muted }],
        ['1 BAYT', { size: 76, family: 'display', weight: 900, color: C.fire }],
      ], W / 2, 510, { alpha: byteA * progress(lt, 20.2, 20.7, ease.out) });

      const ra = byteA * fresh;
      const mono = (size, color = C.cream) => ({ size, family: 'mono', weight: 700, color });
      if (mode === 'five') runs(ctx, [['4 + 1', mono(72, C.flame)], [' = ', mono(72, C.muted)], ['5', mono(72)]], W / 2, 690, { alpha: ra });
      if (mode === 'zero') runs(ctx, [['hepsi sönük', { size: 48, family: 'serif', italic: true, color: C.muted }], ['  =  ', mono(72, C.muted)], ['0', mono(72)]], W / 2, 690, { alpha: ra });
      if (mode === 'full') runs(ctx, [['128 + 64 + 32 + 16 + 8 + 4 + 2 + 1', mono(46, C.flame)], ['  =  ', mono(46, C.muted)], ['255', mono(72)]], W / 2, 690, { alpha: ra });
      if (mode === 'range') {
        runs(ctx, [['1 bayt', mono(72, C.fire)], ['  :  ', mono(72, C.muted)], ['0 … 255', mono(72)]], W / 2, 690, { alpha: ra });
        text(ctx, 'sıfırla birlikte 256 ayrı sayı', W / 2, 790, { size: 40, family: 'serif', italic: true, color: C.muted, alpha: byteA * after(t, 'lamps-range', 4, 0.6) });
      }
      if (mode === 'char') {
        ctx.save();
        ctx.globalAlpha *= byteA * after(t, 'lamps-letters', 1, 0.4);
        roundRect(ctx, W / 2 - 80, 590, 160, 160, 22);
        ctx.strokeStyle = C.fire;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        text(ctx, CHARS[ci % CHARS.length][0], W / 2, 672, { size: 112, family: 'display', weight: 800, color: C.cream, alpha: byteA * after(t, 'lamps-letters', 1, 0.4) });
        text(ctx, '1 bayt ≈ 1 harf', W / 2, 850, { size: 52, family: 'serif', italic: true, color: C.cream, alpha: byteA * after(t, 'lamps-letters', 3, 0.6) });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 5 · Sözlük kenarı
  // ---------------------------------------------------------------------------

  const UNITS = [
    ['bit', 'Bit', '', '0 ya da 1', 'bilginin en küçük parçası'],
    ['byte', 'Bayt', '', '8 bit', 'kabaca bir harf'],
    ['envelope', 'Kilobayt', 'KB', '~1.000 bayt', 'kısa bir mektup'],
    ['note', 'Megabayt', 'MB', '~1 milyon bayt', 'bir şarkı, iyi bir fotoğraf'],
    ['film', 'Gigabayt', 'GB', '~1 milyar bayt', 'bir film'],
    ['books', 'Terabayt', 'TB', '~1.000 GB', 'küçük bir kütüphanenin tamamı'],
  ];
  // Bit ve bayt satırları kendiliğinden, kilo/mega/giga/tera anlatıcı adlarını söylerken
  const unitAt = (i) => (i < 2 ? TL.at('glossary', 0.6 + i * 0.7) : cue('glossary-rows', i + 1));

  function sceneGlossary(ctx, lt, t) {
    const enter = progress(lt, 0, 0.7, ease.out);
    ctx.save();
    ctx.translate(W / 2, H / 2 + (1 - enter) * 40);
    ctx.rotate(-0.006);
    paperCard(ctx, -720, -430, 1440, 860);
    ctx.fillStyle = 'rgba(200,70,50,0.35)';
    ctx.fillRect(-600, -430, 2, 860);
    text(ctx, 'SÖZLÜK KENARI', -560, -360, { size: 26, weight: 800, spacing: 10, color: C.ember, align: 'left' });

    UNITS.forEach(([icon, term, abbr, qty, desc], i) => {
      const a = progress(t, unitAt(i), unitAt(i) + 0.45, ease.out);
      if (a <= 0) return;
      const y = -260 + i * 86;
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.translate((1 - a) * -20, 0);
      ctx.fillStyle = 'rgba(27,31,42,0.1)';
      ctx.fillRect(-560, y + 42, 1200, 1.5);
      drawIcon(ctx, icon, -500, y, 0.62, C.ink);
      runs(ctx, [
        [term, { size: 42, family: 'display', weight: 800, color: C.ink }],
        [abbr ? `  ${abbr}` : '', { size: 26, weight: 600, color: C.inkSoft }],
      ], -430, y + 14, { align: 'left' });
      text(ctx, qty, -110, y, { size: 28, family: 'mono', color: C.inkSoft, align: 'left' });
      text(ctx, desc, 200, y, { size: 34, family: 'serif', italic: true, color: C.ink, align: 'left' });
      ctx.restore();
      // her basamak bir öncekinin bin katı
      if (i >= 2) text(ctx, '×1000', -612, y - 43, { size: 20, family: 'mono', weight: 700, color: C.ember, align: 'right', alpha: a });
    });

    const cmp = after(t, 'glossary-compare', 0, 0.5);
    if (cmp > 0) {
      ctx.save();
      ctx.globalAlpha *= cmp;
      ctx.fillStyle = C.ink;
      ctx.fillRect(-500, 325, 10, 10);
      text(ctx, '30.000 harflik bir metin ≈ 30 KB', -472, 330, { size: 28, color: C.inkSoft, align: 'left' });
      const big = 100 * after(t, 'glossary-compare', 2, 0.7);
      ctx.fillStyle = C.ember;
      ctx.fillRect(250, 380 - big, big, big);
      text(ctx, 'tek bir fotoğraf ≈ 3 MB', 380, 330, { size: 28, color: C.inkSoft, align: 'left', alpha: after(t, 'glossary-compare', 2, 0.5) });
      text(ctx, '× 100', 160, 340, { size: 40, family: 'display', weight: 800, color: C.ember, alpha: after(t, 'glossary-compare', 3, 0.5) });
      ctx.restore();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 6 · Harf nasıl sayı olur?
  // ---------------------------------------------------------------------------

  const WORD = 'MERHABA';
  const CODES = [77, 69, 82, 72, 65, 66, 65];

  function sceneLetters(ctx, lt, t) {
    kicker(ctx, 'HARF NASIL SAYI OLUR?', lt, 17);

    const qA = vis(lt, 0.2, 4.0, 0.5, 0.4);
    if (qA > 0) {
      text(ctx, 'Makine yalnızca 0 ile 1 biliyorsa, ekrandaki “A” nedir?', W / 2, 220, { size: 52, family: 'serif', color: C.cream, alpha: qA });
      const dis = progress(t, cue('letters-answer', 0) + 0.3, cue('letters-answer', 0) + 1.3);
      ctx.save();
      ctx.translate(W / 2, 560);
      ctx.scale(1 + dis * 0.25, 1 + dis * 0.25);
      text(ctx, 'A', 0, 0, { size: 380, family: 'serif', color: C.cream, alpha: qA * (1 - dis) });
      ctx.restore();
      if (dis > 0 && dis < 1) {
        for (let i = 0; i < 60; i++) {
          const ang = hash(i, 70) * Math.PI * 2;
          const r = 40 + dis * (200 + 300 * hash(i, 71));
          ctx.fillStyle = rgba(DIGI, (1 - dis) * qA);
          ctx.fillRect(W / 2 + Math.cos(ang) * r * 0.8, 560 + Math.sin(ang) * r * 0.6, 8, 8);
        }
      }
      const n65 = after(t, 'letters-answer', 1, 0.7, ease.back);
      ctx.save();
      ctx.translate(W / 2, 560);
      ctx.scale(lerp(0.6, 1, n65), lerp(0.6, 1, n65));
      text(ctx, '65', 0, 0, { size: 300, family: 'mono', weight: 700, color: C.digital, alpha: qA * clamp(n65 * 1.4), glow: 'rgba(124,200,255,0.45)', glowBlur: 50 });
      ctx.restore();
    }

    const cB = vis(lt, 4.1, 8.0, 0.5, 0.4);
    if (cB > 0) {
      text(ctx, 'KARAKTER KODLAMASI', W / 2, 250, { size: 30, weight: 700, spacing: 10, color: C.fire, alpha: cB * after(t, 'letters-encoding', 2, 0.5) });
      text(ctx, 'her harfe bir numara; herkes aynı numarayı kullanır', W / 2, 310, { size: 38, family: 'serif', italic: true, color: C.muted, alpha: cB * after(t, 'letters-encoding', 1, 0.5) });
      [['A', '65'], ['B', '66'], ['a', '97'], ['␣', '32', 'boşluk']].forEach(([ch, num, note], i) => {
        const a = cB * after(t, 'letters-cards', i, 0.5);
        if (a <= 0) return;
        const x = W / 2 + (i - 1.5) * 320;
        const y = 580 + (1 - a) * 30;
        ctx.save();
        ctx.globalAlpha *= a;
        roundRect(ctx, x - 125, y - 150, 250, 300, 18);
        ctx.fillStyle = '#0d1528';
        ctx.fill();
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = C.line;
        ctx.fillRect(x - 90, y + 30, 180, 2);
        ctx.restore();
        text(ctx, ch, x, note ? y - 92 : y - 62, { size: 120, family: 'display', weight: 800, color: C.cream, alpha: a });
        if (note) text(ctx, note, x, y + 4, { size: 24, color: C.muted, alpha: a });
        text(ctx, num, x, y + 92, { size: 72, family: 'mono', weight: 700, color: C.digital, alpha: a });
      });
    }

    const cC = vis(lt, 8.1, 13.7, 0.4, 0.4);
    if (cC > 0) {
      const cx = (i) => W / 2 + 40 + (i - 3) * 205;
      const bitsAt = cue('letters-bits', 1);
      text(ctx, 'harf', 120, 300, { size: 24, weight: 600, spacing: 4, color: C.muted, align: 'left', alpha: cC });
      text(ctx, 'sayı', 120, 480, { size: 24, weight: 600, spacing: 4, color: C.muted, align: 'left', alpha: cC * after(t, 'letters-merhaba', 2, 0.4) });
      text(ctx, 'bellekte', 120, 640, { size: 24, weight: 600, spacing: 4, color: C.muted, align: 'left', alpha: cC * progress(t, bitsAt, bitsAt + 0.4) });
      // A'nın sütunu: 65 = 64 + 1
      const hl = cC * after(t, 'letters-bits', 2, 0.5);
      if (hl > 0) {
        ctx.save();
        ctx.globalAlpha *= hl;
        roundRect(ctx, cx(4) - 96, 214, 192, 470, 18);
        ctx.strokeStyle = C.flame;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        text(ctx, '64 + 1', cx(4), 730, { size: 40, family: 'mono', weight: 700, color: C.flame, alpha: cC * after(t, 'letters-bits', 3, 0.5) });
      }
      for (let i = 0; i < 7; i++) {
        text(ctx, WORD[i], cx(i), 300, { size: 130, family: 'display', weight: 800, color: C.cream, alpha: cC * progress(lt, 8.3 + i * 0.2, 8.38 + i * 0.2) });
        const fa = after(t, 'letters-merhaba', 2 + i, 0.35);
        if (fa > 0) {
          text(ctx, '↓', cx(i), 392, { size: 30, color: C.dim, alpha: cC * fa });
          ctx.save();
          ctx.translate(cx(i), 480);
          ctx.scale(1, Math.max(0.001, fa));
          text(ctx, String(CODES[i]), 0, 0, { size: 84, family: 'mono', weight: 700, color: C.digital, alpha: cC });
          ctx.restore();
        }
        const ba = progress(t, bitsAt + i * 0.18, bitsAt + 0.3 + i * 0.18);
        if (ba > 0) {
          text(ctx, '↓', cx(i), 562, { size: 30, color: C.dim, alpha: cC * ba });
          runs(ctx, bitRuns(CODES[i].toString(2).padStart(8, '0'), 30), cx(i), 651, { alpha: cC * ba });
        }
      }
    }

    const cD = vis(lt, 13.8, 17, 0.4, 0.45);
    if (cD > 0) {
      text(ctx, 'yazı tipleri', W / 2, 200, { size: 30, weight: 700, spacing: 8, color: C.muted, alpha: cD * after(t, 'letters-fonts', 0, 0.5) });
      [['serif', 400, true], ['display', 900, false], ['mono', 400, false]].forEach(([fam, wt, it], i) => {
        const a = cD * progress(lt, 13.9 + i * 0.25, 14.4 + i * 0.25, ease.out);
        const x = W / 2 + (i - 1) * 360;
        text(ctx, 'A', x, 380, { size: 220, family: fam, weight: wt, italic: it, color: C.cream, alpha: a });
        ctx.save();
        ctx.globalAlpha *= cD * after(t, 'letters-fonts', 1, 0.6);
        ctx.strokeStyle = C.dim;
        ctx.lineWidth = 2;
        line(ctx, x, 520, W / 2, 640);
        ctx.restore();
      });
      text(ctx, '65', W / 2, 720, { size: 120, family: 'mono', weight: 700, color: C.digital, alpha: cD * after(t, 'letters-fonts', 1, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 7 · Türkçenin kayıp harfleri
  // ---------------------------------------------------------------------------

  // Türkçe harfler ve Türkçe sözlükteki (ISO-8859-9) yerleri; aynı yerde Batı Avrupa sözlüğünün (ISO-8859-1) harfi
  const TR = [['ç', 231, 'ç'], ['ğ', 240, 'ð'], ['ı', 253, 'ý'], ['İ', 221, 'Ý'], ['ö', 246, 'ö'], ['ş', 254, 'þ'], ['ü', 252, 'ü']];
  const trAt = (i) => cue('turkish-letters', i); // her harf, turkish-letters satırında adı söylenirken
  const TR_S = 2.0; // turkish.half/place eklenince kayan koreografi (sözlükler, Unicode, usta sözü)
  const GLITCH_PULSES = [11.2 + TR_S, 12.5 + TR_S, 13.8 + TR_S];
  const SCRIPTS = ['çğıİöşü', '中文', 'Ελληνικά', 'Русский', 'العربية', 'हिन्दी', '☥', '😊', 'ñ ß é å', '日本語'];
  const SCRIPT_CUE = { 0: 3, 1: 4, 7: 5 }; // anlatıcının adını andığı yazılar (turkish-unicode öbekleri)

  function drawMonitor(ctx, x, y, a) {
    ctx.save();
    ctx.globalAlpha *= a;
    roundRect(ctx, x - 320, y - 200, 640, 400, 22);
    ctx.fillStyle = '#161e31';
    ctx.fill();
    ctx.strokeStyle = '#2b3654';
    ctx.lineWidth = 3;
    ctx.stroke();
    roundRect(ctx, x - 290, y - 172, 580, 330, 10);
    ctx.fillStyle = '#0a1120';
    ctx.fill();
    ctx.fillStyle = '#161e31';
    ctx.fillRect(x - 30, y + 200, 60, 50);
    roundRect(ctx, x - 120, y + 246, 240, 16, 8);
    ctx.fill();
    ctx.restore();
  }

  function letterTile(ctx, ch, x, y, size, color, a) {
    ctx.save();
    ctx.globalAlpha *= a;
    roundRect(ctx, x - size / 2, y - size / 2, size, size, size * 0.15);
    ctx.fillStyle = rgba(color === C.error ? [255, 84, 104] : [255, 165, 71], 0.16);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
    text(ctx, ch, x, y + 2, { size: size * 0.6, family: 'display', weight: 700, color: C.cream, alpha: a });
  }

  function sceneTurkish(ctx, lt, t) {
    kicker(ctx, 'TÜRKÇENİN KAYIP HARFLERİ', lt, 26);
    const S = TR_S;

    const gA = vis(lt, 0.2, 9.3, 0.4, 0.4);
    if (gA > 0) {
      const cell = 50;
      const gy = 200;
      const slide = after(t, 'turkish-half', 0, 1.0, ease.inOut);
      const gx = lerp(W / 2 - 400, W / 2 - 830, slide);
      const gx2 = W / 2 + 30;
      const half = gA * after(t, 'turkish-half', 0, 0.8);
      text(ctx, 'İLK ANLAŞMA · 128 YER', gx + 400, gy - 40, { size: 24, weight: 700, spacing: 8, color: C.muted, alpha: gA });
      const filled = after(t, 'turkish-place', 1, 0.6);
      text(ctx, '128 – 255 · BOŞ', gx2 + 400, gy - 40, { size: 24, weight: 700, spacing: 8, color: C.muted, alpha: half * after(t, 'turkish-half', 1, 0.6) * (1 - filled) });
      text(ctx, '128 – 255 · HER ÜLKEYE AYRI', gx2 + 400, gy - 40, { size: 24, weight: 700, spacing: 8, color: C.muted, alpha: half * filled });
      for (let r = 0; r < 8; r++) {
        text(ctx, String(r * 16), gx - 10, gy + r * cell + cell / 2, { size: 17, family: 'mono', color: C.dim, align: 'right', alpha: gA * progress(lt, 0.4 + r * 0.29, 0.7 + r * 0.29) });
        text(ctx, String(128 + r * 16), gx2 - 10, gy + r * cell + cell / 2, { size: 17, family: 'mono', color: C.dim, align: 'right', alpha: half });
      }
      for (let c = 0; c < 128; c++) {
        const x = gx + (c % 16) * cell;
        const y = gy + Math.floor(c / 16) * cell;
        ctx.save();
        ctx.globalAlpha *= gA;
        roundRect(ctx, x + 3, y + 3, cell - 6, cell - 6, 6);
        ctx.strokeStyle = 'rgba(60,72,98,0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
        const a = gA * progress(lt, 0.4 + c * 0.018, 0.55 + c * 0.018);
        if (a <= 0) continue;
        const ch = String.fromCharCode(c);
        if (c < 32 || c === 127) {
          ctx.fillStyle = rgba([77, 86, 107], a);
          dot(ctx, x + cell / 2, y + cell / 2, 3);
        } else {
          text(ctx, c === 32 ? '␣' : ch, x + cell / 2, y + cell / 2 + 1, { size: 24, family: 'mono', color: /[A-Za-z]/.test(ch) ? C.cream : C.muted, alpha: a });
        }
      }
      if (half > 0) {
        ctx.save();
        ctx.globalAlpha *= half;
        ctx.setLineDash([5, 6]);
        ctx.strokeStyle = 'rgba(60,72,98,0.7)';
        ctx.lineWidth = 1.5;
        for (let c = 0; c < 128; c++) {
          roundRect(ctx, gx2 + (c % 16) * cell + 3, gy + Math.floor(c / 16) * cell + 3, cell - 6, cell - 6, 6);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Türkçe harfler: önce "listede yok", sonra boş yarıda kendi yerlerine; başka bir ülke aynı yerlere başka harf koyar
      let flash = 0;
      TR.forEach((_, i) => { flash = Math.max(flash, vis(t, trAt(i) + 0.45, trAt(i) + 0.75, 0.02, 0.28)); });
      if (flash > 0) {
        ctx.save();
        ctx.globalAlpha *= gA * flash;
        ctx.fillStyle = C.error;
        ctx.fillRect(gx, gy + 8 * cell + 4, 16 * cell, 4);
        ctx.restore();
      }
      const place = cue('turkish-place', 1);
      const ghost = gA * after(t, 'turkish-place', 3, 0.5);
      TR.forEach(([ch, code, other], i) => {
        const s0 = trAt(i);
        if (t < s0) return;
        let x = W / 2 + (i - 3) * 118;
        let y = lerp(lerp(1150, 692, progress(t, s0, s0 + 0.45, ease.out)), 760, progress(t, s0 + 0.45, s0 + 0.85, ease.out));
        let size = 92;
        const mv = progress(t, place + i * 0.15, place + i * 0.15 + 0.9, ease.inOut);
        const cx = gx2 + (code % 16) * cell + cell / 2;
        const cy = gy + Math.floor((code - 128) / 16) * cell + cell / 2;
        const clash = other !== ch;
        x = lerp(x, cx, mv);
        y = lerp(y, cy, mv);
        size = lerp(size, cell - 12, mv);
        // Aynı yere başka ülkenin harfi: hücrenin hemen altında, ikisi de okunur
        if (clash && ghost > 0) {
          ctx.save();
          ctx.globalAlpha *= ghost;
          ctx.strokeStyle = C.error;
          ctx.lineWidth = 2;
          line(ctx, cx, cy + cell / 2 - 6, cx, cy + cell * 0.55);
          ctx.restore();
          letterTile(ctx, other, cx, cy + cell * 0.55 + (cell - 12) / 2 + 4 * ghost, cell - 12, C.error, ghost);
        }
        letterTile(ctx, ch, x, y, size, C.fire, gA);
      });
      text(ctx, 'ilk listede yok', W / 2, 860, { size: 40, family: 'serif', italic: true, color: C.error, alpha: gA * after(t, 'turkish-letters', 7, 0.5) * (1 - progress(t, place, place + 0.5)) });
      const legend = gA * after(t, 'turkish-place', 3, 0.5);
      if (legend > 0) {
        runs(ctx, [
          ['■ ', { size: 30, color: C.fire }],
          ['Türkiye’nin sözlüğü', { size: 30, family: 'serif', italic: true, color: C.cream }],
          ['        ■ ', { size: 30, color: C.error }],
          ['Batı Avrupa’nın sözlüğü', { size: 30, family: 'serif', italic: true, color: C.cream }],
        ], gx2 + 400, 720, { alpha: legend });
        text(ctx, 'aynı numara, başka harf', gx2 + 400, 780, { size: 34, family: 'serif', italic: true, color: C.muted, alpha: legend });
        text(ctx, '240: ğ / ð    253: ı / ý    221: İ / Ý    254: ş / þ', gx2 + 400, 840, { size: 28, family: 'mono', color: C.cream, alpha: legend });
      }
    }

    const mB = vis(lt, 7.3 + S, 14.8 + S, 0.5, 0.4);
    if (mB > 0) {
      drawMonitor(ctx, 520, 400, mB);
      drawMonitor(ctx, 1400, 400, mB);
      text(ctx, 'ağaç', 520, 393, { size: 84, family: 'display', weight: 700, color: C.cream, alpha: mB * progress(lt, 7.6 + S, 8.1 + S) });
      // Yola çıkan yalnızca sayı: 11110000 = 240
      const go = cue('turkish-mojibake', 0);
      const land = go + 2.4;
      if (t > go && t < land + 0.3) {
        const pk = progress(t, go + 0.2, land);
        const px = lerp(700, 1220, pk);
        const py = 393 - Math.sin(pk * Math.PI) * 240;
        const pa = mB * vis(t, go, land + 0.3, 0.2, 0.3);
        ctx.save();
        ctx.globalAlpha *= pa;
        roundRect(ctx, px - 100, py - 30, 200, 60, 12);
        ctx.fillStyle = '#0d1a30';
        ctx.fill();
        ctx.strokeStyle = C.digital;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        text(ctx, '11110000', px, py + 1, { size: 30, family: 'mono', weight: 700, color: C.digital, alpha: pa });
        text(ctx, '= 240', px, py + 56, { size: 30, family: 'mono', weight: 700, color: C.cream, alpha: pa });
      }
      const wrong = cue('turkish-mojibake', 4);
      text(ctx, '240', 1400, 393, { size: 84, family: 'mono', weight: 700, color: C.digital, alpha: mB * vis(t, land, wrong + 0.3, 0.2, 0.3) });
      if (t >= wrong) {
        let g = vis(t, wrong, wrong + 1.1, 0.02, 0.3);
        for (const p of GLITCH_PULSES) g = Math.max(g, vis(lt, p, p + 0.15, 0.01, 0.05));
        const parts = [['a', C.cream], ['ð', C.error], ['aç', C.cream]];
        const style = (c) => ({ size: 84, family: 'display', weight: 700, color: c });
        const jitter = g > 0 ? (hash(Math.floor(t * 30), 81) - 0.5) * 18 * g : 0;
        if (g > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const off = 6 * g + 8 * g * (hash(Math.floor(t * 30), 80) - 0.5);
          runs(ctx, parts.map(([str]) => [str, style('#ff2050')]), 1400 - off, 420, { alpha: mB * 0.6 * g });
          runs(ctx, parts.map(([str]) => [str, style('#20e0ff')]), 1400 + off, 420, { alpha: mB * 0.6 * g });
          ctx.restore();
        }
        runs(ctx, parts.map(([str, c]) => [str, style(c)]), 1400 + jitter, 420, { alpha: mB * progress(t, wrong, wrong + 0.3) });
      }
      runs(ctx, [['sizin sözlüğünüz:  240 → ', { size: 30, family: 'mono', color: C.muted }], ['ğ', { size: 36, family: 'mono', weight: 700, color: C.ok }]], 520, 722, { alpha: mB * after(t, 'turkish-mojibake', 2, 0.5) });
      runs(ctx, [['karşıdaki sözlük:  240 → ', { size: 30, family: 'mono', color: C.muted }], ['ð', { size: 36, family: 'mono', weight: 700, color: C.error }]], 1400, 722, { alpha: mB * after(t, 'turkish-mojibake', 4, 0.5) });
    }

    const uC = vis(lt, 14.9 + S, 19.6 + S, 0.5, 0.4);
    if (uC > 0) {
      const cx = W / 2;
      const cy = 450;
      glow(ctx, cx, cy, 440, DIGI, 0.12 * uC);
      ctx.save();
      ctx.globalAlpha *= uC;
      ctx.strokeStyle = 'rgba(124,200,255,0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 420, 270, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      text(ctx, 'UNICODE', cx, cy - 20, { size: 110, family: 'display', weight: 900, spacing: 6, color: C.cream, alpha: uC * after(t, 'turkish-unicode', 2, 0.6) });
      text(ctx, 'dünyanın bütün yazıları · tek liste', cx, cy + 60, { size: 30, color: C.muted, alpha: uC * after(t, 'turkish-unicode', 1, 0.6) });
      const twoBytes = after(t, 'turkish-codepoint', 3, 0.6);
      runs(ctx, [
        ['ğ', { size: 44, family: 'mono', weight: 700, color: C.fire }],
        [' → 287', { size: 44, family: 'mono', weight: 700, color: C.digital }],
        // "her yerde aynı", anlatıcı tek baytın yetmediğini söyleyince "> 255 · 2 bayt" olur
        twoBytes < 0.5
          ? ['   her yerde aynı', { size: 30, family: 'serif', italic: true, color: C.muted, alpha: 1 - twoBytes * 2 }]
          : ['  > 255 · 2 bayt', { size: 28, family: 'mono', weight: 700, color: C.flame, alpha: twoBytes * 2 - 1 }],
      ], cx, cy + 132, { alpha: uC * after(t, 'turkish-codepoint', 2, 0.6) });
      SCRIPTS.forEach((str, i) => {
        const k = SCRIPT_CUE[i];
        const s0 = k != null ? cue('turkish-unicode', k) : cue('turkish-unicode', 2) + 0.3 + i * 0.12;
        const a = uC * progress(t, s0, s0 + 0.45, ease.out);
        if (a <= 0) return;
        const ang = -Math.PI / 2 + (i / SCRIPTS.length) * Math.PI * 2 + clock('turkish', t) * 0.03;
        const r = 1 + (1 - a) * 0.25;
        const x = cx + Math.cos(ang) * 420 * r;
        const y = cy + Math.sin(ang) * 270 * r;
        const w = measure(ctx, str, { size: 40 }) + 44;
        const named = k != null && t < cue('turkish-codepoint', 0);
        ctx.save();
        ctx.globalAlpha *= a;
        roundRect(ctx, x - w / 2, y - 32, w, 64, 32);
        ctx.fillStyle = '#0d1528';
        ctx.fill();
        ctx.strokeStyle = named ? 'rgba(255,165,71,0.8)' : 'rgba(124,200,255,0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        text(ctx, str, x, y + 2, { size: 40, color: i === 0 ? C.fire : C.cream, alpha: a });
      });
    }

    const uS = vis(lt, 19.7 + S, 24 + S, 0.6, 0.45);
    if (uS > 0) {
      ctx.save();
      ctx.globalAlpha *= uS;
      ctx.translate(W / 2, 500 + (1 - progress(lt, 19.7 + S, 20.4 + S, ease.out)) * 30);
      paperCard(ctx, -660, -200, 1320, 400);
      ctx.fillStyle = C.ember;
      ctx.fillRect(-660, -182, 8, 364);
      text(ctx, 'USTA SÖZÜ', -580, -128, { size: 26, weight: 800, spacing: 10, color: C.ember, align: 'left' });
      paragraph(ctx, 'Teknolojideki sorunların çoğu teknik değil, anlaşma sorunudur. İki taraf aynı sözlüğe bakmıyorsa, kabloların hiçbir suçu yoktur.', -580, -52, 1160, {
        size: 54, family: 'serif', color: C.ink, align: 'left', lineHeight: 72,
      });
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------------
  // 8 · Sayıları on altılık yazmak
  // ---------------------------------------------------------------------------

  const BIN = '11010110';
  const HEX = '0123456789ABCDEF';
  const HEX_S = 2.0; // hex.digits eklenince kayan koreografi (renkler, telefon)
  // hex-digits öbekleri: 0-9 "on tane", A "A on", B "be on bir", C-E "ve böyle", F "fe on beşe kadar"
  const hexAt = (i) => {
    if (i < 10) return cue('hex-digits', 2) + i * 0.07;
    if (i === 10) return cue('hex-digits', 5);
    if (i === 11) return cue('hex-digits', 6);
    if (i < 15) return cue('hex-digits', 7) + (i - 12) * 0.2;
    return cue('hex-digits', 8);
  };
  const SWATCHES = [
    { code: ['FF', '00', '00'], css: '#ff0000', name: 'katıksız kırmızı', show: ['hex-colors', 0], named: ['hex-red', 6] },
    { code: ['00', '00', '00'], css: '#000000', name: 'siyah', show: ['hex-red', 7], named: ['hex-red', 7] },
    { code: ['FF', 'FF', 'FF'], css: '#ffffff', name: 'beyaz', show: ['hex-red', 8], named: ['hex-red', 8] },
  ];
  const RGB = [[255, 80, 80], [90, 230, 120], [90, 140, 255]];

  function sceneHex(ctx, lt, t) {
    kicker(ctx, 'SAYILARI ON ALTILIK YAZMAK', lt, 14);
    const S = HEX_S;

    const hA = vis(lt, 0.2, 7.6, 0.4, 0.4);
    if (hA > 0) {
      const spread = 70 * after(t, 'hex-split', 0, 0.6, ease.inOut);
      const blur = vis(lt, 0.7, 2.2, 0.3, 0.4);
      const merge = after(t, 'hex-split', 12, 0.7, ease.inOut);
      const groups = [W / 2 - 208 - spread, W / 2 + 208 + spread];
      const WEIGHT_K = [1, 2, 3, 4]; // "sekiz, dört, iki, bir"
      const lit = [after(t, 'hex-split', 5, 0.4), after(t, 'hex-split', 9, 0.4)]; // öbeğin yanan lambaları vurgulanır
      for (let j = 0; j < 8; j++) {
        const x = W / 2 + (j - 3.5) * 104 + (j < 4 ? -spread : spread);
        const on = BIN[j] === '1';
        const o = { size: 160, family: 'mono', weight: 700, color: on ? C.fire : C.off };
        if (blur > 0) {
          for (const [dx, al] of [[-5, 0.22], [5, 0.22]]) {
            text(ctx, BIN[j], x + dx * blur * (1.2 + Math.sin(lt * 9 + j)), 330, { ...o, alpha: hA * al * blur });
          }
        }
        text(ctx, BIN[j], x, 330, { ...o, alpha: hA * (1 - 0.2 * blur) });
        const wa = hA * after(t, 'hex-split', WEIGHT_K[j % 4], 0.4) * (1 - merge);
        const hot = on ? lit[j < 4 ? 0 : 1] : 0;
        text(ctx, String(8 >> (j % 4)), x, 214, { size: 40, family: 'mono', weight: 700, color: hot > 0.5 ? C.flame : C.muted, alpha: wa });
      }
      const br = hA * after(t, 'hex-split', 0, 0.5) * (1 - merge);
      if (br > 0) {
        ctx.save();
        ctx.globalAlpha *= br;
        ctx.strokeStyle = C.dim;
        ctx.lineWidth = 3;
        for (const gx of groups) {
          ctx.beginPath();
          ctx.moveTo(gx - 190, 420);
          ctx.lineTo(gx - 190, 436);
          ctx.lineTo(gx + 190, 436);
          ctx.lineTo(gx + 190, 420);
          ctx.stroke();
        }
        ctx.restore();
      }
      const dPop = after(t, 'hex-split', 8, 0.5, ease.back);
      const sixPop = after(t, 'hex-split', 10, 0.5, ease.back);
      const hexO = (p) => ({ size: 180, family: 'display', weight: 900, color: C.flame, alpha: hA * clamp(p), glow: 'rgba(255,170,60,0.4)', glowBlur: 30 });
      text(ctx, 'D', lerp(groups[0], W / 2 - 62, merge), 560, hexO(dPop));
      text(ctx, '6', lerp(groups[1], W / 2 + 62, merge), 560, hexO(sixPop));
      const out = clamp(1 - merge * 2);
      text(ctx, '8 + 4 + 1 = 13', groups[0], 672, { size: 34, family: 'mono', weight: 700, color: C.cream, alpha: hA * after(t, 'hex-split', 7, 0.4) * out });
      text(ctx, '4 + 2 = 6', groups[1], 672, { size: 34, family: 'mono', weight: 700, color: C.cream, alpha: hA * after(t, 'hex-split', 9, 0.4) * out });
      text(ctx, '11010110 = D6', W / 2, 672, { size: 34, family: 'mono', weight: 700, color: C.muted, alpha: hA * clamp(merge * 2 - 1) });

      // On altı simge: bildiğimiz on rakam ve altı harf
      const lgA = hA * progress(lt, 2.9, 3.3);
      if (lgA > 0) {
        for (let i = 0; i < 16; i++) {
          const x = W / 2 + (i - 7.5) * 84;
          const a = lgA * progress(t, hexAt(i), hexAt(i) + 0.35, ease.out);
          const hl = (i === 13 && dPop > 0.01) || (i === 6 && sixPop > 0.01);
          if (hl) {
            ctx.save();
            ctx.globalAlpha *= a;
            ctx.strokeStyle = C.flame;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(x, 790, 32, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
          text(ctx, HEX[i], x, 791, { size: 48, family: 'mono', weight: 700, color: hl ? C.flame : i >= 10 ? C.cream : C.muted, alpha: a });
          if (i >= 10) text(ctx, String(i), x, 846, { size: 24, family: 'mono', color: C.muted, alpha: a });
        }
        const brace = (x0, x1, y, label, a) => {
          if (a <= 0) return;
          ctx.save();
          ctx.globalAlpha *= a;
          ctx.strokeStyle = C.dim;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x0, y - 10);
          ctx.lineTo(x0, y);
          ctx.lineTo(x1, y);
          ctx.lineTo(x1, y - 10);
          ctx.stroke();
          ctx.restore();
          text(ctx, label, (x0 + x1) / 2, y + 30, { size: 28, family: 'serif', italic: true, color: C.muted, alpha: a });
        };
        brace(W / 2 - 7.5 * 84 - 30, W / 2 + 1.5 * 84 + 30, 890, 'bildiğimiz on rakam', lgA * after(t, 'hex-digits', 3, 0.5));
        brace(W / 2 + 2.5 * 84 - 30, W / 2 + 7.5 * 84 + 30, 890, 'eklenen altı simge', lgA * after(t, 'hex-digits', 8, 0.5));
      }
    }

    const sA = vis(lt, 5.8 + S, 12 + S, 0.4, 0.45);
    if (sA > 0) {
      // Işık karışımı: kırmızı, yeşil, mavi
      const mixA = sA * (1 - progress(t, cue('hex-red', 7) - 0.4, cue('hex-red', 7) + 0.2));
      if (mixA > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        [[0, -46, 2], [-42, 26, 3], [42, 26, 3]].forEach(([dx, dy, k], i) => {
          const a = mixA * after(t, 'hex-colors', k, 0.6) * (i === 2 ? after(t, 'hex-colors', 3, 0.6) : 1);
          if (a <= 0) return;
          ctx.fillStyle = rgba(RGB[i], 0.85 * a);
          dot(ctx, W / 2 + 330 + dx, 300 + dy, 92);
        });
        ctx.restore();
        ['kırmızı', 'yeşil', 'mavi'].forEach((name, i) => {
          const a = mixA * after(t, 'hex-colors', i === 0 ? 2 : 3, 0.6);
          text(ctx, name, W / 2 + 330 + [0, -150, 150][i], [150, 440, 440][i], { size: 26, family: 'serif', italic: true, color: rgba(RGB[i]), alpha: a });
        });
      }
      SWATCHES.forEach(({ code, css, name, show, named }, i) => {
        const a = sA * after(t, show[0], show[1], 0.6);
        if (a <= 0) return;
        const x = W / 2 + (i - 1) * 440;
        const y = 300 + (1 - a) * 20;
        ctx.save();
        ctx.globalAlpha *= a;
        roundRect(ctx, x - 170, y - 120, 340, 240, 18);
        ctx.fillStyle = css;
        ctx.fill();
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        // Kod: üç çift, her biri bir ışığın miktarı (renklendirme "koddaki üç çift" denince)
        const tint = i === 0 ? after(t, 'hex-colors', 4, 0.5) : 1;
        const mono = (c) => ({ size: 54, family: 'mono', weight: 700, color: c });
        const pairCol = (k) => (tint > 0.5 ? rgba(RGB[k]) : C.cream);
        runs(ctx, [['#', mono(C.muted)], [code[0], mono(pairCol(0))], [code[1], mono(pairCol(1))], [code[2], mono(pairCol(2))]], x, y + 190, { alpha: a });
        const dec = code.map((c) => String(parseInt(c, 16)));
        const decA = i === 0 ? [after(t, 'hex-red', 1, 0.4), after(t, 'hex-red', 3, 0.4), after(t, 'hex-red', 3, 0.4)] : [1, 1, 1];
        dec.forEach((d, k) => text(ctx, d, x - 66 + k * 66 + 16, y + 240, { size: 26, family: 'mono', weight: 700, color: rgba(RGB[k]), alpha: a * decA[k] }));
        text(ctx, name, x, y + 296, { size: 32, family: 'serif', italic: true, color: C.muted, alpha: a * after(t, named[0], named[1], 0.5) });
      });

      const ph = vis(lt, 8.8 + S, 12 + S, 0.4, 0.45) * after(t, 'hex-phone', 2, 0.5);
      if (ph > 0) {
        const raw = '5xxxxxxxxx';
        const g = after(t, 'hex-phone', 2, 1.4, ease.inOut);
        const cw = 38.5;
        const gap = 30 * clamp((g - 0.4) / 0.6);
        const width = raw.length * cw + 3 * gap;
        for (let k = 0; k < raw.length; k++) {
          const gaps = (k >= 3) + (k >= 6) + (k >= 8);
          text(ctx, raw[k], W / 2 - width / 2 + k * cw + gaps * gap + cw / 2, 840, { size: 64, family: 'mono', color: k === 0 ? C.fire : C.cream, alpha: ph });
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 9 · Her şey sayıya dönüşebilir mi?
  // ---------------------------------------------------------------------------

  const PW = 384;
  const PH = 216;
  const FOCUS = [233.5, 137.5];
  let photoCache = null;

  // Yordamsal "fotoğraf": gün batımı, güneş, tepeler ve küçük bir ateş
  function photo() {
    if (photoCache) return photoCache;
    const canvas = document.createElement('canvas');
    canvas.width = PW;
    canvas.height = PH;
    const g = canvas.getContext('2d');
    const img = g.createImageData(PW, PH);
    for (let y = 0; y < PH; y++) {
      for (let x = 0; x < PW; x++) {
        const v = y / PH;
        let r = lerp(28, 252, v ** 1.6);
        let gg = lerp(34, 140, v ** 1.8);
        let b = lerp(84, 92, v);
        const ds = Math.hypot(x - 250, y - 120);
        if (ds < 26) {
          r = 255;
          gg = 226;
          b = 160;
        } else {
          const k = Math.exp(-(ds - 26) / 40);
          r += (255 - r) * 0.5 * k;
          gg += (200 - gg) * 0.4 * k;
          b += (150 - b) * 0.2 * k;
        }
        const farHill = 150 + 16 * Math.sin(x / 47) + 9 * Math.sin(x / 17 + 1);
        const nearHill = 172 + 20 * Math.sin(x / 61 + 2) + 7 * Math.sin(x / 11);
        if (y > nearHill) {
          r = 22 + 10 * v;
          gg = 18;
          b = 30;
        } else if (y > farHill) {
          r = r * 0.35 + 40;
          gg = gg * 0.3 + 26;
          b = b * 0.4 + 44;
        }
        const df = Math.hypot(x - 90, (y - 158) * 0.8);
        if (df < 9) {
          const k = 1 - df / 9;
          r += (255 - r) * k;
          gg += (170 - gg) * k;
          b += (60 - b) * k * 0.5;
        }
        const n = (hash(x + y * PW, 9) - 0.5) * 10;
        const o = (y * PW + x) * 4;
        img.data[o] = clamp(r + n, 0, 255);
        img.data[o + 1] = clamp(gg + n, 0, 255);
        img.data[o + 2] = clamp(b + n, 0, 255);
        img.data[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    photoCache = { canvas, data: img.data };
    return photoCache;
  }

  const SENSORS = [
    ['thermo', 'sıcaklık', (t) => `${(21.4 + 0.1 * Math.round(noise(t * 2, 31) * 2 - 1)).toFixed(1).replace('.', ',')} °C`],
    ['drop', 'nem', (t) => `%${48 + Math.round(noise(t * 1.5, 32) * 2 - 1)}`],
    ['ruler', 'mesafe', (t) => `${(3.2 + 0.1 * Math.round(noise(t * 3, 33) * 4 - 2)).toFixed(1).replace('.', ',')} m`],
    ['heart', 'kalp atışı', (t) => `${72 + Math.round(noise(t * 0.8, 34) * 2 - 1)} atım/dk`],
  ];
  const VERBS = ['işlenebilir,', 'saklanabilir,', 'iletilebilir.'];
  const WATCHED = [
    ['pin', 'nerede olduğunuz', '41,01° K · 28,97° D'],
    ['chat', 'kiminle konuştuğunuz', '14 mesaj'],
    ['eye', 'neye baktığınız', '3 kez'],
    ['timer', 'neyi kaç saniye izlediğiniz', '7,4 sn'],
  ];
  const BEAT = 60 / 72;
  const PIX_NAMES = [['kırmızı', '#ff7a6b'], ['yeşil', '#7fe0a3'], ['mavi', C.digital]];
  // Ses örneklerinin ve video şeridinin anlatıcıya bağlı zamanları
  const sampleAt = (k) => cue('numbers-sound', 2) + k * 1.4;
  const valueAt = (k) => cue('numbers-sound', 3) + k * 0.9;
  const playAt = () => cue('numbers-sound', 4);

  function sceneNumbers(ctx, lt, t) {
    kicker(ctx, 'HER ŞEY SAYIYA DÖNÜŞEBİLİR Mİ?', lt, 18.6);

    // Fotoğraf → piksel → sayı
    const pA = vis(lt, 0.2, 5.6, 0.5, 0.4);
    if (pA > 0) {
      const { canvas, data } = photo();
      const DX = 400;
      const DY = 130;
      const DW = 1120;
      const DH = 630;
      const z = after(t, 'numbers-photo', 2, 3.0, ease.inOut);
      const vw = Math.exp(lerp(Math.log(PW), Math.log(12), z));
      const vh = (vw * 9) / 16;
      const f = (vw - 12) / (PW - 12);
      const cxI = FOCUS[0] + (PW / 2 - FOCUS[0]) * f;
      const cyI = FOCUS[1] + (PH / 2 - FOCUS[1]) * f;
      const sx = cxI - vw / 2;
      const sy = cyI - vh / 2;
      ctx.save();
      ctx.globalAlpha *= pA;
      roundRect(ctx, DX, DY, DW, DH, 14);
      ctx.clip();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(canvas, sx, sy, vw, vh, DX, DY, DW, DH);
      const pix = clamp((60 - vw) / 35);
      if (pix > 0) {
        ctx.globalAlpha = pA * pix;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(canvas, sx, sy, vw, vh, DX, DY, DW, DH);
      }
      const gridA = clamp((30 - vw) / 12);
      const kx = DW / vw;
      if (gridA > 0) {
        ctx.globalAlpha = pA * gridA * 0.55;
        ctx.strokeStyle = '#05070c';
        ctx.lineWidth = 2;
        for (let i = Math.ceil(sx); i < sx + vw; i++) line(ctx, DX + (i - sx) * kx, DY, DX + (i - sx) * kx, DY + DH);
        for (let j = Math.ceil(sy); j < sy + vh; j++) line(ctx, DX, DY + (j - sy) * kx, DX + DW, DY + (j - sy) * kx);
      }
      const numA = after(t, 'numbers-pixel', 0, 0.6) * clamp((30 - vw) / 12);
      if (numA > 0) {
        ctx.globalAlpha = pA * numA;
        for (let j = Math.floor(sy); j < sy + vh; j++) {
          for (let i = Math.floor(sx); i < sx + vw; i++) {
            const o = (j * PW + i) * 4;
            const [r, g, b] = [data[o], data[o + 1], data[o + 2]];
            const px = DX + (i + 0.5 - sx) * kx;
            const py = DY + (j + 0.5 - sy) * kx;
            const ink = 0.299 * r + 0.587 * g + 0.114 * b > 140 ? 'rgba(10,12,20,0.85)' : 'rgba(255,255,255,0.85)';
            [r, g, b].forEach((v, k) => text(ctx, String(v), px, py + (k - 1) * 20, { size: 17, family: 'mono', weight: 700, color: ink }));
          }
        }
        const fx = DX + (Math.floor(FOCUS[0]) - sx) * kx;
        const fy = DY + (Math.floor(FOCUS[1]) - sy) * kx;
        ctx.strokeStyle = C.fire;
        ctx.lineWidth = 5;
        ctx.strokeRect(fx, fy, kx, kx);
      }
      ctx.restore();
      ctx.save();
      ctx.globalAlpha *= pA;
      roundRect(ctx, DX, DY, DW, DH, 14);
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
      const pl = pA * after(t, 'numbers-photo', 3, 0.5) * clamp((30 - vw) / 12);
      if (pl > 0) {
        ctx.save();
        ctx.globalAlpha *= pl;
        roundRect(ctx, DX + DW - 330, DY + 18, 306, 52, 26);
        ctx.fillStyle = 'rgba(5,8,16,0.82)';
        ctx.fill();
        ctx.restore();
        text(ctx, 'her kare: 1 piksel', DX + DW - 177, DY + 45, { size: 30, family: 'serif', italic: true, color: C.flame, alpha: pl });
      }
      // Turuncu çerçeveli pikselin üç sayısı: kırmızı, yeşil, mavi ışığın miktarı (0-255)
      const o = (Math.floor(FOCUS[1]) * PW + Math.floor(FOCUS[0])) * 4;
      PIX_NAMES.forEach(([name, col], k) => {
        const a = pA * after(t, 'numbers-pixel', k === 0 ? 1 : 2, 0.5);
        if (a <= 0) return;
        const x = W / 2 + (k - 1) * 380;
        const v = data[o + k];
        runs(ctx, [[`${name}  `, { size: 32, family: 'serif', italic: true, color: C.muted }], [String(v), { size: 42, family: 'mono', weight: 700, color: col }]], x, 830, { alpha: a });
        ctx.save();
        ctx.globalAlpha *= a;
        ctx.fillStyle = C.line;
        ctx.fillRect(x - 120, 856, 240, 10);
        ctx.fillStyle = col;
        ctx.fillRect(x - 120, 856, 240 * (v / 255) * a, 10);
        ctx.restore();
        text(ctx, '0', x - 120, 886, { size: 18, family: 'mono', color: C.dim, alpha: a });
        text(ctx, '255', x + 120, 886, { size: 18, family: 'mono', color: C.dim, alpha: a });
      });
    }

    // Ses dalgası → örnekler → sayılar; video → kareler
    const wA = vis(lt, 5.7, 10.6, 0.4, 0.4);
    if (wA > 0) {
      const x0 = 200;
      const x1 = 1720;
      const y0 = 360;
      const amp = 150;
      const wave = (x) => 0.62 * Math.sin((x / 260) * Math.PI * 2 + 9.2) + 0.26 * Math.sin((x / 97) * Math.PI * 2 + 0.7) + 0.12 * Math.sin((x / 41) * Math.PI * 2 + 14.5);
      ctx.save();
      ctx.globalAlpha *= wA;
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 2;
      line(ctx, x0, y0, x1, y0);
      const draw = after(t, 'numbers-sound', 0, 1.8, ease.inOut);
      ctx.beginPath();
      for (let x = x0; x <= x0 + draw * (x1 - x0); x += 3) {
        if (x === x0) ctx.moveTo(x, y0 - wave(x) * amp);
        else ctx.lineTo(x, y0 - wave(x) * amp);
      }
      ctx.strokeStyle = C.digital;
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(124,200,255,0.6)';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();
      text(ctx, 'basınç', x0 - 20, y0 - amp, { size: 24, family: 'mono', color: C.muted, align: 'right', alpha: wA * after(t, 'numbers-sound', 1, 0.5) });
      text(ctx, 'zaman →', x1, y0 + amp + 50, { size: 22, family: 'mono', color: C.muted, align: 'right', alpha: wA * after(t, 'numbers-sound', 1, 0.5) });
      const head = progress(t, playAt(), playAt() + 1.8, ease.linear);
      for (let x = x0 + 20; x < x1; x += 40) {
        const k = (x - x0) / (x1 - x0);
        const a = wA * progress(t, sampleAt(k), sampleAt(k) + 0.15);
        if (a <= 0) continue;
        const v = wave(x);
        const y = y0 - v * amp;
        const played = head > 0 && head < 1 && Math.abs(head - k) < 0.03;
        ctx.save();
        ctx.globalAlpha *= a;
        ctx.strokeStyle = C.fire;
        ctx.lineWidth = 2;
        line(ctx, x, y0, x, y);
        if (played) glow(ctx, x, y, 40, FIRE, 0.8);
        ctx.fillStyle = C.flame;
        dot(ctx, x, y, played ? 8 : 5);
        ctx.restore();
        text(ctx, String(Math.round(128 + v * 120)), x, v >= 0 ? y - 24 : y + 24, { size: 16, family: 'mono', color: C.cream, alpha: wA * progress(t, valueAt(k), valueAt(k) + 0.15) });
      }
      text(ctx, 'saniyede on binlerce ölçüm', x1, 160, { size: 28, family: 'mono', color: C.muted, align: 'right', alpha: wA * after(t, 'numbers-sound', 2, 0.5) });

      const fA = wA * progress(lt, 8.2, 8.7);
      if (fA > 0) {
        ctx.save();
        ctx.globalAlpha *= fA;
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 668, W, 156);
        // Önce duran kareler (top her karede biraz ilerde), sonra hızlanan şerit
        const d = Math.max(0, t - cue('numbers-video', 2));
        const travel = d < 1.2 ? 125 * d * d : 180 + 300 * (d - 1.2);
        const off = travel % 220;
        const base = Math.floor(travel / 220);
        for (let i = -1; i < 11; i++) {
          const fx = i * 220 - off;
          ctx.fillStyle = '#1e2638';
          for (let h = 0; h < 5; h++) {
            ctx.fillRect(fx + 14 + h * 44, 676, 22, 12);
            ctx.fillRect(fx + 14 + h * 44, 804, 22, 12);
          }
          ctx.fillStyle = '#16203a';
          ctx.fillRect(fx + 10, 694, 200, 104);
          const idx = i + base;
          const bx = fx + 30 + ((idx * 23) % 160);
          const by = 780 - Math.abs(Math.sin(idx * 0.5)) * 70;
          ctx.fillStyle = C.fire;
          dot(ctx, bx, by, 12);
        }
        ctx.restore();
        text(ctx, '25 fotoğraf / saniye', W - 140, 630, { size: 30, family: 'mono', weight: 700, color: C.cream, align: 'right', alpha: fA * after(t, 'numbers-video', 1, 0.5) });
      }
    }

    // Sensörler
    const sA = vis(lt, 10.7, 14.6, 0.4, 0.4);
    if (sA > 0) {
      SENSORS.forEach(([icon, label, value], i) => {
        const a = sA * after(t, 'numbers-sensors', i, 0.5);
        if (a <= 0) return;
        const x = W / 2 + (i - 1.5) * 400;
        const y = 470 + (1 - a) * 20;
        ctx.save();
        ctx.globalAlpha *= a;
        roundRect(ctx, x - 170, y - 180, 340, 360, 22);
        ctx.fillStyle = '#0d1528';
        ctx.fill();
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        const beat = icon === 'heart' ? Math.exp(-(((t - cue('numbers-sensors', 3)) % BEAT + BEAT) % BEAT) * 8) : 0;
        drawIcon(ctx, icon, x, y - 80, 1 + beat * 0.15, icon === 'heart' ? C.error : C.fire, a);
        text(ctx, value(t), x, y + 50, { size: 48, family: 'mono', weight: 700, color: C.cream, alpha: a });
        text(ctx, label, x, y + 118, { size: 30, color: C.muted, alpha: a });
      });
      text(ctx, 'sensör: ölçer, sayıya çevirir', W / 2, 800, { size: 36, family: 'serif', italic: true, color: C.cream, alpha: sA * after(t, 'numbers-sensors', 5, 0.6) });
    }

    // Büyük cümle
    const dA = vis(lt, 14.7, 18.6, 0.5, 0.4);
    if (dA > 0) {
      text(ctx, 'Ölçülebilen her şey sayıya çevrilebilir;', W / 2, 400, { size: 64, family: 'serif', color: C.cream, alpha: dA * after(t, 'numbers-statement', 1, 0.6) });
      text(ctx, 'sayıya çevrilen her şey', W / 2, 500, { size: 52, family: 'serif', italic: true, color: C.muted, alpha: dA * after(t, 'numbers-statement', 2, 0.6) });
      VERBS.forEach((v, i) => {
        const a = dA * after(t, 'numbers-statement', 3 + i, 0.5);
        text(ctx, v, W / 2 + (i - 1) * 440, 630 + (1 - a) * 20, { size: 66, family: 'display', weight: 800, color: C.digital, alpha: a });
      });
      runs(ctx, [
        ['bütün gücü', { size: 40, family: 'serif', italic: true, color: C.fire }],
        ['  ve  ', { size: 40, family: 'serif', italic: true, color: C.muted }],
        ['bütün tehlikesi', { size: 40, family: 'serif', italic: true, color: C.error }],
      ], W / 2, 790, { alpha: dA * after(t, 'numbers-danger', 1, 0.6) });
    }

    // Ölçmek, güçtür
    const pw = progress(lt, 18.6, 19.6);
    if (pw > 0) {
      const g = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, W * 0.7);
      g.addColorStop(0, 'rgba(120,20,34,0)');
      g.addColorStop(1, `rgba(120,20,34,${0.35 * pw})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    const iA = vis(lt, 18.7, 20.9, 0.4, 0.4);
    if (iA > 0) {
      text(ctx, 'Bu cümle insan için de geçerlidir:', W / 2, 250, { size: 46, family: 'serif', italic: true, color: C.cream, alpha: iA });
      WATCHED.forEach(([icon, label, data], i) => {
        const a = iA * after(t, 'numbers-watched', 2 + i, 0.5);
        const x = W / 2 + (i - 1.5) * 420;
        drawIcon(ctx, icon, x, 470, 1.3, C.error, a);
        text(ctx, label, x, 590, { size: 34, family: 'serif', italic: true, color: C.cream, alpha: a });
        text(ctx, data, x, 642, { size: 26, family: 'mono', color: C.muted, alpha: a });
      });
    }
    const fA = vis(lt, 20.8, 24, 0.5, 0.4);
    if (fA > 0) {
      const sc = lerp(0.9, 1, progress(lt, 20.8, 21.4, ease.out));
      ctx.save();
      ctx.translate(W / 2, 470);
      ctx.scale(sc, sc);
      text(ctx, 'Ölçmek, güçtür.', 0, 0, { size: 130, family: 'display', weight: 900, color: C.fire, alpha: fA, glow: 'rgba(255,120,40,0.5)', glowBlur: 40 });
      ctx.restore();
      text(ctx, 'Ve her güç gibi, kimin elinde olduğu sorusunu doğurur.', W / 2, 620, { size: 48, family: 'serif', italic: true, color: C.cream, alpha: fA * after(t, 'numbers-question', 0, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 10 · Kapanış
  // ---------------------------------------------------------------------------

  function sceneClose(ctx, lt, t) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#03050b');
    sky.addColorStop(1, '#0d1630');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    drawStars(ctx, t, 0.8);
    const gy = (x) => 760 - 150 * Math.exp(-(((x - W / 2) / 420) ** 2)) - 10 * (noise(x / 120, 2) - 0.5);
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 10) ctx.lineTo(x, gy(x));
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = '#05080f';
    ctx.fill();
    drawFire(ctx, W / 2, gy(W / 2) - 14, 1.1, t, 1, 9);
    drawPyre(ctx, W / 2, gy(W / 2) - 4, 1.1);
    runs(ctx, [
      ['Var', { size: 64, family: 'serif', italic: true, color: C.fire }],
      [' ve ', { size: 64, family: 'serif', italic: true, color: C.cream }],
      ['yok.', { size: 64, family: 'serif', italic: true, color: C.off }],
    ], W / 2, 300, { alpha: progress(lt, 0.3, 0.9) });
    text(ctx, 'BİRİNCİ KAPI · SON', W / 2, 900, { size: 22, weight: 600, spacing: 10, color: C.muted, alpha: progress(lt, 0.8, 1.3) });
  }

  // ---------------------------------------------------------------------------
  // Ses notasyonu: bütün efektler burada zamana yerleştirilir
  // ---------------------------------------------------------------------------

  function score(m, hz) {
    const { at, span } = TL;
    // Sahneyi kapatan sürekli sesler: sahnenin gerçek sonundan `margin` önce biter (beklemeler dahil)
    const untilEnd = (id, a, margin) => TL.scene(id).end - margin - at(id, a);
    // Gerçek zamanlı bir aralığı süreye çevirir
    const dur = (from, to) => Math.max(0.1, to - from);

    // 0 · Açılış
    m.pad(0, 6.5, ['D2', 'A2', 'D3'], { gain: 0.32, attack: 3, release: 2.5, cutoff: 600 });
    BLINKS.forEach((b, i) => {
      const on = i % 2 === 0;
      m.click(at('open', b), { gain: 0.18, tone: on ? 3600 : 2400 });
      if (on) m.blip(at('open', b), { freq: 660, dur: 0.25, gain: 0.12, wet: 0.4 });
    });
    m.boom(at('open', 3.3), { gain: 0.45 });
    m.bell(at('open', 3.3), { freq: hz('D5'), gain: 0.22, decay: 3 });
    m.bell(at('open', 3.62), { freq: hz('A5'), gain: 0.12, decay: 2.5 });
    m.bell(at('open', 4.4), { freq: hz('F5'), gain: 0.08 });

    // 1 · Ateşler
    m.wind(at('fires', -1), span('fires', -1, 22.5), { gain: 0.28 });
    m.pad(at('fires', 0), span('fires', 0, 20.5), ['D3', 'A3', 'E4', 'F4'], { gain: 0.32 });
    IGNITE.forEach((d, i) => {
      const t = at('fires', d);
      const pan = lerp(-0.7, 0.7, i / 5);
      const s0 = at('fires', d - 0.6);
      if (i > 0) m.whoosh(s0, { dur: t - s0, from: 900, to: 3200, gain: 0.07, panFrom: lerp(-0.7, 0.7, (i - 1) / 5), panTo: pan, q: 2 });
      m.fireIgnite(t, { gain: i === 0 ? 0.55 : 0.32, pan: i === 0 ? -0.2 : pan });
      m.crackle(t, at('two', 0) - t, { gain: i === 0 ? 0.32 : 0.16, pan: i === 0 ? -0.2 : pan, density: 18, roar: i === 0 ? 0.6 : 0.3 });
    });
    m.whoosh(cue('fires-meaning', 1) - 0.1, { dur: 0.6, from: 400, to: 1500, gain: 0.08, q: 0.6, panFrom: 0.2, panTo: 0.5 });
    m.bell(cue('fires-meaning', 1) + 0.1, { freq: hz('A4'), gain: 0.08, decay: 2.5, pan: 0.4 });
    ['D5', 'E5', 'F5', 'A5', 'C6', 'D6'].forEach((n, k) => m.blip(raceFire() + k * 0.28, { freq: hz(n), dur: 0.1, type: 'triangle', gain: 0.08, pan: lerp(-0.6, 0.6, k / 5) }));
    for (let s = 11.4; s < 16.1; s += 0.55) m.hoof(at('fires', s), { gain: 0.14, pan: -0.25 });
    m.boom(at('fires', 16.6), { gain: 0.3, freq: 55 });
    m.bell(at('fires', 19.5), { freq: hz('F5'), gain: 0.2, decay: 3 });
    m.bell(at('fires', 19.5), { freq: hz('A5'), gain: 0.12, decay: 3 });
    m.bell(at('fires', 19.52), { freq: hz('D6'), gain: 0.07 });

    // 2 · İki durum
    const S2 = TWO_S;
    m.crackle(at('two', 0), span('two', 0, 11.2 + S2), { gain: 0.2, pan: -0.35, roar: 0.5 });
    m.crackle(at('two', 5.4), span('two', 5.4, 11.2 + S2), { gain: 0.12, pan: 0.35, density: 12, roar: 0.4 });
    m.pad(at('two', 0), span('two', 0, 10.6 + S2), ['Bb2', 'F3', 'A3', 'D4'], { gain: 0.3 });
    m.pad(at('two', 10.8 + S2), untilEnd('two', 10.8 + S2, 1), ['F2', 'C3', 'A3', 'C4', 'E4'], { gain: 0.3, attack: 1.5 });
    for (let i = 0; i <= 10; i++) m.tick(cue('two-levels', 0) + i * 0.035, { gain: 0.03, pan: 0.45 });
    ['D4', 'F4', 'A4'].forEach((n, i) => {
      m.whoosh(cue('two-levels', i + 1), { dur: 0.6, from: 300, to: 900 + i * 500, gain: 0.06, panFrom: 0.35, panTo: 0.35 });
      m.blip(cue('two-levels', i + 1) + 0.3, { freq: hz(n), dur: 0.35, type: 'triangle', gain: 0.08, pan: 0.45 });
    });
    const rain0 = cue('two-weather', 0) - 0.3;
    m.rain(rain0, dur(rain0, at('two', 11.6 + S2)), { gain: 0.3 });
    m.wind(rain0, dur(rain0, at('two', 11.6 + S2)), { gain: 0.12 });
    for (let s = Math.ceil(cue('two-weather', 2) / 0.6) * 0.6; s < at('two', 10.6 + S2); s += 0.6) m.tick(s, { gain: 0.05, pan: 0.45 });
    m.blip(cue('two-weather', 4), { freq: 180, dur: 0.3, type: 'sawtooth', gain: 0.05, pan: 0.4 });
    m.bell(cue('two-weather', 7), { freq: hz('E5'), gain: 0.12, decay: 2, pan: -0.4 });
    m.boom(at('two', 11.3 + S2), { gain: 0.3 });
    m.bell(at('two', 11.3 + S2), { freq: hz('C5'), gain: 0.2, decay: 3.5 });
    m.bell(at('two', 11.32 + S2), { freq: hz('G5'), gain: 0.1, decay: 3 });
    m.whoosh(cue('two-quote', 1), { dur: 1.2, from: 2000, to: 6000, gain: 0.05 });
    [[1, 0, 'C5'], [2, 0, 'E5'], [3, 0, 'G5'], [3, 0.45, 'C6']].forEach(([k, d, n], i) => m.pop(cue('two-icons', k) + d, { freq: hz(n), gain: 0.12, pan: lerp(-0.4, 0.4, i / 3) }));

    // 3 · Neden iki?
    const why0 = TL.scene('why').start;
    const morph = cue('why-threshold', 1);
    m.hum(at('why', 0), dur(at('why', 0), morph + 0.6), { gain: 0.09 });
    m.staticNoise(at('why', 0), dur(at('why', 0), morph + 0.6), { gain: 0.05 });
    m.pad(at('why', 0), span('why', 0, 11), ['C3', 'G3', 'D4'], { gain: 0.24, cutoff: 700 });
    m.pad(at('why', 11.6), untilEnd('why', 11.6, 0.6), ['F3', 'A3', 'C4', 'E4'], { gain: 0.26 });
    for (let s = at('why', 0.3); s < morph; s += 0.24) m.tick(s, { gain: 0.03, pan: 0.6 });
    [1, 2, 3].forEach((k, i) => m.pop(cue('why-wobble', k), { freq: 500 + i * 100, gain: 0.1, pan: (i - 1) * 0.4 }));
    m.blip(cue('why-wobble', 4), { freq: 880, dur: 0.15, type: 'triangle', gain: 0.07 });
    m.glitch(cue('why-wobble', 5), 0.3, { gain: 0.08 });
    m.whoosh(morph - 0.1, { dur: 0.6, from: 300, to: 4000, gain: 0.14 });
    m.blip(morph, { freq: 220, dur: 0.3, slide: 4, type: 'sawtooth', gain: 0.08 });
    m.whoosh(cue('why-threshold', 3), { dur: 0.8, from: 600, to: 2400, gain: 0.06, panFrom: -0.6, panTo: 0.6 });
    m.click(cue('why-threshold', 5), { gain: 0.12 });
    m.click(cue('why-threshold', 6), { gain: 0.12, tone: 2000 });
    const { first } = whyTimes();
    for (let j = 0; j < 16; j++) {
      const k = first + j;
      m.blip(why0 + bitReadAt(k), { freq: bitAt(k) ? 880 : 440, dur: 0.07, type: 'square', gain: 0.06, pan: lerp(-0.6, 0.6, j / 15) });
    }
    m.click(at('why', 11.9), { gain: 0.15 });
    m.bell(at('why', 11.9), { freq: hz('A5'), gain: 0.12 });
    m.click(at('why', 12.2), { gain: 0.15 });
    m.bell(at('why', 12.2), { freq: hz('A4'), gain: 0.12 });
    m.boom(cue('why-bit', 0), { gain: 0.35 });
    m.bell(cue('why-bit', 0), { freq: hz('F5'), gain: 0.16, decay: 3 });
    [1, 2].forEach((k) => m.tick(cue('why-pairs', k), { gain: 0.08, tone: 3000 }));

    // 4 · Lambalar
    m.pad(at('lamps', 0), span('lamps', 0, 14.2), ['F2', 'C3', 'A3', 'E4'], { gain: 0.26 });
    m.pad(at('lamps', 14.6), span('lamps', 14.6, 19.6), ['C3', 'G3', 'E4', 'B4'], { gain: 0.24 });
    m.pad(at('lamps', 19.8), untilEnd('lamps', 19.8, 0.6), ['D3', 'A3', 'F4', 'C5'], { gain: 0.26 });
    STAGES.forEach((st, si) => {
      m.blip(at('lamps', st.at), { freq: 220 * 2 ** si, dur: 0.6, type: 'triangle', gain: 0.12, wet: 0.4 });
      for (let c = 0; c < 2 ** st.n; c++) m.click(comboAt(st, c), { gain: 0.1, tone: 3000 + c * 80 });
      const [cid, ck] = COUNT_CUE[st.n];
      m.bell(cue(cid, ck), { freq: hz(['A4', 'C5', 'E5', 'A5'][si]), gain: 0.12, decay: 2 });
    });
    m.whoosh(cue('lamps-three', 2), { dur: 0.5, from: 500, to: 1500, gain: 0.06, panFrom: -0.5, panTo: -0.5 });
    m.whoosh(cue('lamps-three', 4), { dur: 0.5, from: 700, to: 2200, gain: 0.06, panFrom: -0.2, panTo: -0.2 });
    ['C5', 'E5', 'G5'].forEach((n, i) => m.bell(cue('lamps-three', 6) + i * 0.08, { freq: hz(n), gain: 0.08, decay: 2 }));
    ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6'].forEach((n, i) => {
      const s0 = i < 4 ? at('lamps', 14.8 + i * 0.25) : cue('lamps-table', i - 3);
      m.tick(s0, { gain: 0.05 });
      m.bell(s0 + 0.05, { freq: hz(n), gain: i < 4 ? 0.05 : 0.1, decay: 1.6 });
    });
    BIG.forEach((_, i) => m.pop(cue('lamps-big', 0) + i * 0.45, { freq: 220 - i * 40, gain: 0.14 }));
    m.boom(at('lamps', 20.2), { gain: 0.35 });
    m.bell(at('lamps', 20.2), { freq: hz('D5'), gain: 0.15, decay: 3 });
    [1, 2, 3, 4, 5, 6].forEach((k, i) => m.blip(cue('lamps-values', k), { freq: hz(['C5', 'D5', 'E5', 'F5', 'G5', 'A5'][i]), dur: 0.12, type: 'triangle', gain: 0.06 }));
    m.click(cue('lamps-values', 7), { gain: 0.12 });
    m.click(cue('lamps-range', 0), { gain: 0.12, tone: 2000 });
    m.click(cue('lamps-range', 1), { gain: 0.14, tone: 3600 });
    m.bell(cue('lamps-range', 1) + 0.05, { freq: hz('D6'), gain: 0.08, decay: 1.5 });
    m.bell(cue('lamps-range', 3), { freq: hz('A5'), gain: 0.1, decay: 2 });
    const letterNotes = ['D5', 'F5', 'A5', 'C6', 'D6', 'A5', 'F5'];
    for (let i = 0, s = cue('lamps-letters', 1); s < TL.scene('lamps').end - 0.6; i++, s += CHAR_P) {
      m.click(s, { gain: 0.1 });
      m.blip(s, { freq: hz(letterNotes[i % letterNotes.length]), dur: 0.15, type: 'triangle', gain: 0.05 });
    }

    // 5 · Sözlük kenarı
    m.pad(at('glossary', 0), untilEnd('glossary', 0, 1), ['Bb2', 'F3', 'D4'], { gain: 0.24 });
    m.whoosh(at('glossary', 0.05), { dur: 0.6, from: 400, to: 1500, gain: 0.12, q: 0.6 });
    UNITS.forEach((_, i) => m.typeKey(unitAt(i), { gain: 0.12 }));
    m.pop(cue('glossary-compare', 0), { freq: 900, gain: 0.08 });
    m.pop(cue('glossary-compare', 2), { freq: 300, gain: 0.16 });
    m.bell(cue('glossary-compare', 3), { freq: hz('E5'), gain: 0.1, decay: 2 });

    // 6 · Harfler
    m.pad(at('letters', 0), span('letters', 0, 7.6), ['D3', 'F3', 'A3'], { gain: 0.24 });
    m.pad(at('letters', 8), span('letters', 8, 13.4), ['G2', 'D3', 'Bb3', 'F4'], { gain: 0.24 });
    m.pad(at('letters', 13.6), untilEnd('letters', 13.6, 0.8), ['A2', 'E3', 'A3', 'C4'], { gain: 0.24, attack: 1.2, release: 1.8 });
    m.glitch(cue('letters-answer', 0) + 0.3, 0.8, { gain: 0.12 });
    m.blip(cue('letters-answer', 1), { freq: 300, dur: 0.5, slide: 4, gain: 0.08, type: 'triangle' });
    m.bell(cue('letters-answer', 1) + 0.3, { freq: hz('E5'), gain: 0.16, decay: 2.5 });
    ['A4', 'B4', 'C5', 'E5'].forEach((n, i) => {
      m.click(cue('letters-cards', i), { gain: 0.1 });
      m.blip(cue('letters-cards', i), { freq: hz(n), dur: 0.12, gain: 0.06 });
    });
    for (let i = 0; i < 7; i++) m.typeKey(at('letters', 8.3 + i * 0.2), { gain: 0.22, pan: (i - 3) * 0.12 });
    for (let i = 0; i < 7; i++) m.whoosh(cue('letters-merhaba', 2 + i), { dur: 0.14, from: 2000, to: 5000, gain: 0.05, panFrom: (i - 3) * 0.12, panTo: (i - 3) * 0.12 });
    const bitsAt = cue('letters-bits', 1);
    CODES.forEach((code, i) => {
      const bits = code.toString(2).padStart(8, '0');
      for (let j = 0; j < 8; j++) {
        m.blip(bitsAt + i * 0.18 + j * 0.022, { freq: bits[j] === '1' ? 1320 : 660, dur: 0.03, type: 'square', gain: 0.025, pan: (i - 3) * 0.12, wet: 0.05 });
      }
    });
    m.bell(cue('letters-bits', 2), { freq: hz('A5'), gain: 0.1, decay: 2 });
    ['C5', 'E5', 'G5'].forEach((n, i) => m.bell(at('letters', 13.9 + i * 0.25), { freq: hz(n), gain: 0.1, decay: 1.5 }));
    m.bell(cue('letters-fonts', 1), { freq: hz('C6'), gain: 0.1, decay: 2 });

    // 7 · Türkçe
    const S7 = TR_S;
    m.pad(at('turkish', 0), span('turkish', 0, 9.2), ['C3', 'G3', 'E4'], { gain: 0.22 });
    m.pad(at('turkish', 9.2), span('turkish', 9.2, 14.8 + S7), ['Ab2', 'Eb3', 'C4'], { gain: 0.24, cutoff: 700 });
    m.pad(at('turkish', 14.8 + S7), span('turkish', 14.8 + S7, 19.6 + S7), ['F2', 'C3', 'A3', 'E4', 'G4'], { gain: 0.3, attack: 0.8, cutoff: 1300 });
    m.pad(at('turkish', 19.6 + S7), untilEnd('turkish', 19.6 + S7, 0.8), ['Bb2', 'F3', 'D4', 'A4'], { gain: 0.26 });
    for (let c = 0; c < 128; c++) m.tick(at('turkish', 0.4 + c * 0.018), { gain: 0.025, pan: (c % 16) / 15 - 0.5 });
    m.whoosh(cue('turkish-half', 0), { dur: 1.0, from: 300, to: 1200, gain: 0.08, panFrom: 0, panTo: -0.5 });
    for (let r = 0; r < 8; r++) m.tick(cue('turkish-half', 0) + 0.4 + r * 0.08, { gain: 0.03, pan: 0.5 });
    TR.forEach((_, i) => {
      m.boom(trAt(i) + 0.45, { gain: 0.1, freq: 120 });
      m.click(trAt(i) + 0.45, { gain: 0.06, tone: 1500, pan: (i - 3) * 0.15 });
      m.click(cue('turkish-place', 1) + i * 0.15 + 0.9, { gain: 0.07, tone: 2600, pan: 0.5 });
    });
    m.buzz(cue('turkish-letters', 7) + 0.3, { gain: 0.12 });
    m.whoosh(cue('turkish-place', 1), { dur: 1.6, from: 500, to: 1800, gain: 0.07, panFrom: 0, panTo: 0.5 });
    m.glitch(cue('turkish-place', 3), 0.25, { gain: 0.1 });
    const go = cue('turkish-mojibake', 0);
    m.whoosh(go + 0.2, { dur: 2.2, from: 600, to: 2500, gain: 0.12, panFrom: -0.6, panTo: 0.6 });
    '11110000'.split('').forEach((b, j) => m.blip(go + 0.25 + j * 0.25, { freq: b === '1' ? 1320 : 660, dur: 0.05, type: 'square', gain: 0.03, pan: lerp(-0.6, 0.6, j / 7) }));
    m.blip(cue('turkish-mojibake', 2), { freq: hz('E5'), dur: 0.2, type: 'triangle', gain: 0.07, pan: -0.4 });
    m.glitch(cue('turkish-mojibake', 4), 1.0, { gain: 0.22 });
    GLITCH_PULSES.forEach((p) => m.glitch(at('turkish', p), 0.15, { gain: 0.12 }));
    m.riser(at('turkish', 13.9 + S7), span('turkish', 13.9 + S7, 14.85 + S7), { gain: 0.12 });
    m.boom(at('turkish', 14.9 + S7), { gain: 0.35 });
    ['F5', 'A5', 'C6', 'E6'].forEach((n, i) => m.bell(at('turkish', 14.9 + S7) + i * 0.06, { freq: hz(n), gain: 0.1, decay: 3 }));
    [3, 4, 5].forEach((k, i) => m.bell(cue('turkish-unicode', k), { freq: hz(['C6', 'D6', 'F6'][i]), gain: 0.06, decay: 1.5 }));
    m.bell(cue('turkish-codepoint', 2), { freq: hz('A5'), gain: 0.12, decay: 2.5 });
    m.whoosh(at('turkish', 19.65 + S7), { dur: 0.6, from: 400, to: 1500, gain: 0.1, q: 0.6 });
    m.bell(at('turkish', 20.0 + S7), { freq: hz('F4'), gain: 0.14, decay: 3.5 });

    // 8 · Onaltılık
    const S8 = HEX_S;
    m.pad(at('hex', 0), span('hex', 0, 7.4), ['G2', 'D3', 'Bb3', 'F4'], { gain: 0.22 });
    m.pad(at('hex', 5.8 + S8), untilEnd('hex', 5.8 + S8, 0.8), ['C3', 'G3', 'E4', 'A4'], { gain: 0.22 });
    m.wobble(at('hex', 0.7), span('hex', 0.7, 2.2), { gain: 0.08 });
    for (let i = 0; i < 16; i++) {
      if (i < 10) m.tick(hexAt(i), { gain: 0.03 });
      else m.blip(hexAt(i), { freq: hz(['A4', 'B4', 'C5', 'D5', 'E5', 'F5'][i - 10]), dur: 0.12, type: 'triangle', gain: 0.07 });
    }
    m.click(cue('hex-split', 0), { gain: 0.14 });
    m.whoosh(cue('hex-split', 0), { dur: 0.5, from: 800, to: 3000, gain: 0.06 });
    [1, 2, 3, 4].forEach((k) => m.tick(cue('hex-split', k), { gain: 0.06, tone: 3200 }));
    m.blip(cue('hex-split', 8), { freq: hz('A5'), dur: 0.2, gain: 0.1, type: 'triangle' });
    m.blip(cue('hex-split', 10), { freq: hz('E5'), dur: 0.2, gain: 0.1, type: 'triangle' });
    m.bell(cue('hex-split', 12) + 0.6, { freq: hz('D6'), gain: 0.12, decay: 2 });
    m.blip(cue('hex-colors', 2), { freq: hz('C5'), dur: 0.4, gain: 0.05, wet: 0.4 });
    m.blip(cue('hex-colors', 3), { freq: hz('E5'), dur: 0.4, gain: 0.05, wet: 0.4 });
    SWATCHES.forEach(({ show }, i) => m.pop(cue(show[0], show[1]), { freq: [500, 250, 900][i], gain: 0.16 }));
    [0, 1, 2].forEach((i) => m.click(cue('hex-phone', 2) + 0.6 + i * 0.18, { gain: 0.1 }));

    // 9 · Sayılar
    m.pad(at('numbers', 0), span('numbers', 0, 5.2), ['D3', 'A3', 'F4'], { gain: 0.22 });
    m.pad(at('numbers', 5.6), span('numbers', 5.6, 10.2), ['Bb2', 'F3', 'D4'], { gain: 0.22 });
    m.pad(at('numbers', 10.6), span('numbers', 10.6, 14.2), ['C3', 'G3', 'E4'], { gain: 0.22 });
    m.pad(at('numbers', 14.6), span('numbers', 14.6, 18.2), ['F2', 'C3', 'A3', 'F4'], { gain: 0.26 });
    m.pad(at('numbers', 18.6), untilEnd('numbers', 18.6, 1), ['D2', 'Ab2', 'D3'], { gain: 0.26, cutoff: 500, release: 1.5 });
    m.riser(cue('numbers-photo', 2), 3.0, { gain: 0.1 });
    for (let i = 0; i < 14; i++) m.blip(cue('numbers-pixel', 0) + i * 0.04, { freq: 1200 + ((i * 7) % 5) * 220, dur: 0.03, type: 'square', gain: 0.025 });
    [1, 2].forEach((k) => m.blip(cue('numbers-pixel', k), { freq: hz(k === 1 ? 'C5' : 'G5'), dur: 0.2, type: 'triangle', gain: 0.06 }));
    m.blip(cue('numbers-sound', 0), { freq: 220, dur: 1.8, gain: 0.08, wet: 0.3 });
    for (let x = 220; x < 1720; x += 40) m.tick(sampleAt((x - 200) / 1520), { gain: 0.03, tone: 4000, pan: lerp(-0.6, 0.6, (x - 200) / 1520) });
    m.blip(playAt(), { freq: 330, dur: 1.8, slide: 1.5, gain: 0.06, wet: 0.3 });
    m.projector(cue('numbers-video', 2), dur(cue('numbers-video', 2), at('numbers', 10.5)), { gain: 0.05 });
    SENSORS.forEach((_, i) => m.pop(cue('numbers-sensors', i), { freq: 400 + i * 120, gain: 0.12 }));
    for (let b = cue('numbers-sensors', 3); b < at('numbers', 14.5); b += BEAT) m.heartbeat(b, { gain: 0.35 });
    m.bell(at('numbers', 14.7), { freq: hz('F5'), gain: 0.14, decay: 3 });
    ['A5', 'C6', 'F6'].forEach((n, i) => m.blip(cue('numbers-statement', 3 + i), { freq: hz(n), dur: 0.25, type: 'triangle', gain: 0.07, wet: 0.3 }));
    m.boom(at('numbers', 18.7), { gain: 0.3, freq: 50 });
    ['D4', 'F4', 'Ab4', 'B4'].forEach((n, i) => m.blip(cue('numbers-watched', 2 + i), { freq: hz(n), dur: 0.3, type: 'triangle', gain: 0.06 }));
    // final kalp atışı ekrandaki bir öğeye bağlı değil: beklemeler boyunca da düzenli atsın
    for (let t = at('numbers', 18.8); t < TL.scene('numbers').end - 0.4; t += 0.95) m.heartbeat(t, { gain: 0.3 });
    m.boom(at('numbers', 20.8), { gain: 0.5, freq: 45 });
    m.bell(at('numbers', 20.8), { freq: hz('D4'), gain: 0.16, decay: 4 });

    // 10 · Kapanış
    m.wind(at('close', -0.5), span('close', -0.5, 3), { gain: 0.2 });
    m.crackle(at('close', 0), span('close', 0, 3), { gain: 0.2, roar: 0.5 });
    m.pad(at('close', 0), span('close', 0, 1.2), ['D2', 'A2', 'D3', 'F#3', 'A3'], { gain: 0.3, attack: 0.8, release: 1.6 });
    m.bell(at('close', 0.3), { freq: hz('D5'), gain: 0.16, decay: 2.5 });
    m.bell(at('close', 0.32), { freq: hz('F#5'), gain: 0.08, decay: 2.5 });
  }

  window.FILM = E.film({
    title: 'Var ve Yok — Birinci Kapı',
    timeline: TL,
    background,
    score,
    narration: VOICE,
    voice: VOICE.voice,
  });
})();
