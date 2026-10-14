/*
 * Birinci Kapı — Var ve Yok: İki Simgeli Bir Evren
 * "Gerçekliğin ölçülebilir hâle gelmesi" metninin 3 dakikalık animasyonu.
 *
 * Görüntü ve ses aynı zaman sabitlerini (T, IGNITE, BIT_P …) paylaşır; böylece
 * bir sahneyi kaydırınca sesleri de birlikte kayar.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { W, H, clamp, lerp, ease, progress, vis, hash, noise, rgba, text, measure, runs, paragraph, captions, glow, roundRect } = E;

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

  // Sahneler ve koreografi süreleri (saniye). Gerçek süreler seslendirme beklemeleriyle uzayabilir.
  const SCENES = [
    { id: 'open', base: 8, title: 'Açılış', draw: sceneOpen, fadeIn: 0.6 },
    { id: 'fires', base: 22, title: 'Tepeden tepeye ateş', draw: sceneFires },
    { id: 'two', base: 19, title: 'Var ve yok', draw: sceneTwo },
    { id: 'why', base: 17, title: 'Neden sadece iki?', draw: sceneWhy },
    { id: 'lamps', base: 25, title: 'Yan yana dizmenin bereketi', draw: sceneLamps },
    { id: 'glossary', base: 9, title: 'Sözlük kenarı', draw: sceneGlossary },
    { id: 'letters', base: 17, title: 'Harf nasıl sayı olur?', draw: sceneLetters },
    { id: 'turkish', base: 24, title: 'Türkçenin kayıp harfleri', draw: sceneTurkish },
    { id: 'hex', base: 12, title: 'Sayıları on altılık yazmak', draw: sceneHex },
    { id: 'numbers', base: 24, title: 'Her şey sayıya dönüşebilir mi?', draw: sceneNumbers },
    { id: 'close', base: 3, title: 'Kapanış', draw: sceneClose, fadeOut: 1.4 },
  ];

  // Seslendirme vuruşları: [sahne, başlangıç, bitiş, donma anı] (koreografi zamanı).
  // Donma anı, anlatıcı için beklenecekse görüntünün bekleyeceği karedir: öğeler (ve sahne etiketi)
  // tam görünürken, vuruş bitmeden önce; böylece bekleme vuruşun süresine sayılır.
  const BEATS = {
    'open.title': ['open', 3.3, 7.6, 7.0],
    'fires.one': ['fires', 0.4, 4.7],
    'fires.relay': ['fires', 4.9, 10.8],
    'fires.race': ['fires', 11.0, 16.0],
    'fires.question': ['fires', 16.6, 19.4],
    'fires.answer': ['fires', 19.5, 22.0, 21.4],
    'two.split': ['two', 0.3, 5.0, 4.8],
    'two.weather': ['two', 5.1, 10.7],
    'two.quote': ['two', 11.2, 15.0, 14.9],
    'two.icons': ['two', 15.2, 19.0, 18.3],
    'why.analog': ['why', 0.3, 6.0],
    'why.digital': ['why', 6.2, 11.4],
    'why.bit': ['why', 11.9, 17.0, 16.15],
    'lamps.one': ['lamps', 0.3, 3.8, 3.45],
    'lamps.two': ['lamps', 3.8, 7.6, 7.25],
    'lamps.three_four': ['lamps', 7.6, 14.6, 14.05],
    'lamps.table': ['lamps', 14.6, 19.9, 19.35],
    'lamps.byte': ['lamps', 19.9, 25.0, 24.15],
    'glossary.rows': ['glossary', 0.3, 4.7, 4.6],
    'glossary.compare': ['glossary', 4.8, 9.0, 8.5],
    'letters.question': ['letters', 0.2, 1.6, 1.55],
    'letters.answer': ['letters', 1.6, 4.0, 3.5],
    'letters.encoding': ['letters', 4.1, 8.0, 7.5],
    'letters.merhaba': ['letters', 8.1, 13.7, 13.2],
    'letters.fonts': ['letters', 13.8, 17.0, 16.15],
    'turkish.grid': ['turkish', 0.2, 3.7, 3.65],
    'turkish.letters': ['turkish', 3.8, 7.2, 6.8],
    'turkish.mojibake': ['turkish', 7.3, 11.0, 10.98],
    'turkish.agreement': ['turkish', 11.1, 14.8, 14.3],
    'turkish.unicode': ['turkish', 14.9, 19.6, 19.1],
    'turkish.master': ['turkish', 19.7, 24.0, 23.15],
    'hex.blur': ['hex', 0.2, 2.8, 2.25],
    'hex.split': ['hex', 2.8, 5.7, 5.2],
    'hex.colors': ['hex', 5.8, 8.8, 8.75],
    'hex.phone': ['hex', 8.8, 12.0, 11.15],
    'numbers.photo': ['numbers', 0.2, 5.6, 5.1],
    'numbers.sound': ['numbers', 5.7, 8.2],
    'numbers.video': ['numbers', 8.2, 10.6],
    'numbers.sensors': ['numbers', 10.7, 14.6, 14.1],
    'numbers.statement': ['numbers', 14.7, 18.6, 17.75],
    'numbers.watched': ['numbers', 18.7, 20.9, 20.4],
    'numbers.power': ['numbers', 20.8, 24.0, 23.5],
    'close.end': ['close', 0.3, 3.0, 2.0],
  };

  // narration.js: seslendirme metni ve gereken beklemeler; voice.js: narrate.mjs'in ürettiği ses
  const SCRIPT = window.NARRATION ?? { holds: {}, lines: [] };
  const sceneHolds = (id) => Object.entries(SCRIPT.holds)
    .filter(([beat]) => BEATS[beat][0] === id)
    .map(([beat, sec]) => {
      const [, start, end, freeze] = BEATS[beat];
      if (freeze == null) throw new Error(`${beat} vuruşunda görüntü bekletilemez`);
      if (!(freeze > start && freeze < end)) throw new Error(`${beat}: donma anı vuruşun içinde olmalı`);
      return [freeze, sec];
    });
  const TL = E.timeline(SCENES.map((s) => ({ ...s, holds: sceneHolds(s.id) })));
  const VOICE = E.narration({ timeline: TL, beats: BEATS, lines: SCRIPT.lines, voice: window.VOICE });

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
      const pf = progress(lt, 11.4, 12.6);
      ctx.strokeStyle = C.fire;
      ctx.lineWidth = 6;
      if (pf > 0) line(ctx, x0, 804, lerp(x0, x1, pf), 804);
      for (let j = 0; j < 6; j++) {
        const lit = pf >= j / 5 - 1e-6;
        if (lit) glow(ctx, lerp(x0, x1, j / 5), 804, 34, FIRE, 0.6);
        ctx.fillStyle = lit ? C.flame : C.dim;
        dot(ctx, lerp(x0, x1, j / 5), 804, 8);
      }
      text(ctx, 'birkaç saat', 1460, 804, { size: 32, family: 'serif', italic: true, color: C.fire, align: 'left', alpha: progress(lt, 12.4, 12.9) });

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

  function drawWeather(ctx, lt, a) {
    ctx.save();
    ctx.fillStyle = `rgba(70,80,104,${0.3 * a})`;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 8; i++) {
      const x = ((hash(i, 40) * W + lt * (20 + 30 * hash(i, 41))) % (W + 800)) - 400;
      glow(ctx, x, 300 + hash(i, 42) * 500, 380 + 260 * hash(i, 43), [150, 162, 190], 0.24 * a);
    }
    ctx.strokeStyle = `rgba(175,195,235,${0.32 * a})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 260; i++) {
      const v = 1500 + 700 * hash(i, 51);
      const len = 26 + 36 * hash(i, 52);
      const y = ((hash(i, 53) * (H + 200) + lt * v) % (H + 200)) - 100;
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
    const multi = progress(lt, 5.2, 6.2);
    const weather = vis(lt, 4.8, 11.2, 1.0, 1.4);
    const gy = (x) => 720 - 95 * Math.exp(-(((x - L) / 210) ** 2)) - 95 * Math.exp(-(((x - R) / 210) ** 2));

    ctx.save();
    ctx.globalAlpha *= 1 - progress(lt, 10.6, 11.6);
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 12) ctx.lineTo(x, gy(x));
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = '#060912';
    ctx.fill();

    const kR = multi * (0.22 + 0.7 * noise(lt * 1.6, 11));
    drawFire(ctx, L, gy(L) - 14, 1.15, t, 1, 3);
    drawPyre(ctx, L, gy(L) - 4, 1.15);
    drawFire(ctx, R, gy(R) - 14, 1.15, t, kR, 5);
    drawPyre(ctx, R, gy(R) - 4, 1.15);

    const p1 = (1 - multi) * progress(lt, 0.2, 0.8);
    text(ctx, 'YANIYORSA', L, 250, { size: 28, weight: 600, spacing: 8, color: C.muted, alpha: p1 });
    text(ctx, 'YANMIYORSA', R, 250, { size: 28, weight: 600, spacing: 8, color: C.muted, alpha: p1 });
    text(ctx, 'OLDU', L, 830, { size: 100, family: 'display', weight: 900, color: C.fire, alpha: (1 - multi) * progress(lt, 0.6, 1.2), glow: 'rgba(255,120,30,0.5)', glowBlur: 30 });
    text(ctx, 'OLMADI', R, 830, { size: 100, family: 'display', weight: 900, color: C.off, alpha: (1 - multi) * progress(lt, 0.9, 1.5) });

    text(ctx, '2 DURUM', L, 250, { size: 28, weight: 700, spacing: 8, color: C.cream, alpha: multi });
    text(ctx, '50 DURUM', R, 250, { size: 28, weight: 700, spacing: 8, color: C.cream, alpha: multi });
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

      // Sağ: elli konumlu, titrek gösterge
      const sx = R + 210;
      for (let i = 0; i <= 50; i++) {
        const y = lerp(640, 330, i / 50);
        ctx.fillStyle = C.dim;
        ctx.fillRect(sx, y, i % 10 === 0 ? 26 : i % 5 === 0 ? 18 : 10, 2);
      }
      const py = lerp(640, 330, kR);
      ctx.fillStyle = C.cream;
      ctx.beginPath();
      ctx.moveTo(sx - 6, py + 1);
      ctx.lineTo(sx - 24, py - 9);
      ctx.lineTo(sx - 24, py + 11);
      ctx.closePath();
      ctx.fill();
      text(ctx, `${GUESSES[Math.floor(lt / 0.33) % GUESSES.length]}?`, sx + 44, py, { size: 34, family: 'mono', color: C.cream, align: 'left' });
      ctx.restore();
    }
    text(ctx, '✓ ayırt etmesi kolay', L, 830, { size: 42, family: 'serif', italic: true, color: C.ok, alpha: progress(lt, 6.4, 7.0) });
    text(ctx, '✗ kolayca yanılırsınız', R, 830, { size: 42, family: 'serif', italic: true, color: C.error, alpha: progress(lt, 7.0, 7.6) });
    ctx.restore();

    if (weather > 0) drawWeather(ctx, lt, weather);

    const qa = vis(lt, 11.2, 19, 0.8, 0.45);
    if (qa > 0) {
      const lay = paragraph(ctx, 'İki durum arasında yanılmak,\nelli durum arasında yanılmaktan\nçok daha güçtür.', W / 2, 360, 1500, {
        size: 76, family: 'serif', color: C.cream, alpha: qa, lineHeight: 98, valign: 'middle',
      });
      const w = measure(ctx, 'çok daha güçtür.', { size: 76, family: 'serif' });
      ctx.save();
      ctx.globalAlpha *= qa;
      ctx.fillStyle = C.fire;
      ctx.fillRect(W / 2 - w / 2, lay.top + 2 * lay.lineHeight + 48, w * progress(lt, 12.3, 13.2, ease.out), 5);
      ctx.restore();
      [['phone', 'telefon'], ['tv', 'televizyon'], ['bank', 'banka hesabı'], ['book', 'bu kitap']].forEach(([kind, label], i) => {
        const a = qa * progress(lt, 15.2 + i * 0.25, 15.7 + i * 0.25, ease.out);
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
  const BIT_P = 0.28;
  const FIRST_BIT = 24; // sinyalin tamamen dijital olduğu ilk bit (6,7 sn sonrası)
  const bitAt = (k) => BITS[((k % BITS.length) + BITS.length) % BITS.length];
  const bitReadAt = (k) => (k + 0.5) * BIT_P;

  const analogV = (tau) => 3.74 + 0.16 * Math.sin(tau * 2.3) + 0.24 * (noise(tau * 7, 21) - 0.5) + 0.12 * (noise(tau * 45, 22) - 0.5);
  const digitalV = (tau) => {
    const k = Math.floor(tau / BIT_P);
    const f = tau / BIT_P - k;
    const level = lerp(bitAt(k - 1), bitAt(k), ease.inOut(clamp(f / 0.14)));
    return 0.4 + level * 4.1 + 0.4 * (noise(tau * 30, 23) - 0.5);
  };
  const signalV = (tau) => lerp(analogV(tau), digitalV(tau), progress(tau, 6.2, 6.7));

  function sceneWhy(ctx, lt) {
    kicker(ctx, 'NEDEN SADECE İKİ?', lt, 17);
    const panel = vis(lt, 0.1, 11.9, 0.6, 0.5);
    const x0 = 180;
    const x1 = 1740;
    const y0 = 180;
    const y1 = 620;
    const vy = (v) => y1 - 30 - (v / 5) * (y1 - y0 - 60);

    if (panel > 0) {
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

      const th = progress(lt, 6.3, 6.9);
      if (th > 0) {
        ctx.fillStyle = rgba(FIRE, 0.07 * th);
        ctx.fillRect(x0, y0, x1 - x0, vy(2.5) - y0);
        ctx.fillStyle = rgba(COOL, 0.08 * th);
        ctx.fillRect(x0, vy(2.5), x1 - x0, y1 - vy(2.5));
        ctx.setLineDash([14, 10]);
        ctx.strokeStyle = rgba([243, 237, 225], 0.5 * th);
        ctx.lineWidth = 2;
        line(ctx, x0, vy(2.5), x1, vy(2.5));
        ctx.setLineDash([]);
      }

      // Sinyal: sağ kenar "şimdi"; dijitale dönüşüm sağdan girer
      const WIN = 3.6;
      ctx.beginPath();
      for (let x = x0; x <= x1; x += 3) {
        const tau = lt - WIN + ((x - x0) / (x1 - x0)) * WIN;
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

      text(ctx, '5 V', x0 - 16, vy(5), { size: 22, family: 'mono', color: C.dim, align: 'right' });
      text(ctx, '0 V', x0 - 16, vy(0), { size: 22, family: 'mono', color: C.dim, align: 'right' });
      text(ctx, 'eşik', x0 + 20, vy(2.5) - 22, { size: 24, family: 'mono', color: C.cream, align: 'left', alpha: th });
      text(ctx, 'VAR → 1', x0 + 20, y0 + 34, { size: 28, family: 'mono', weight: 700, color: C.fire, align: 'left', alpha: th });
      text(ctx, 'YOK → 0', x0 + 20, y1 - 34, { size: 28, family: 'mono', weight: 700, color: C.off, align: 'left', alpha: th });

      const va = 1 - progress(lt, 6.0, 6.5);
      const vq = analogV(Math.floor(lt / 0.12) * 0.12);
      text(ctx, `${vq.toFixed(2).replace('.', ',')} V`, x1, 128, { size: 60, family: 'mono', weight: 700, color: C.cream, align: 'right', alpha: va });
      const nowBit = bitAt(Math.floor(lt / BIT_P));
      text(ctx, nowBit ? 'akım VAR' : 'akım YOK', x1, 128, { size: 52, family: 'mono', weight: 700, color: nowBit ? C.fire : C.off, align: 'right', alpha: progress(lt, 6.7, 7.1) });
      ctx.restore();

      ['sıcaklık değişir', 'kablo direnci artar', 'komşu devreden parazit gelir'].forEach((s, i) => {
        const a = panel * vis(lt, 1.4 + i * 0.8, 6.1, 0.4, 0.4);
        if (a <= 0) return;
        const x = [470, 930, 1440][i];
        const w = measure(ctx, s, { size: 28 }) + 48;
        ctx.save();
        ctx.globalAlpha *= a;
        roundRect(ctx, x - w / 2, 676, w, 56, 28);
        ctx.fillStyle = 'rgba(255,84,104,0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,84,104,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        text(ctx, s, x, 705, { size: 28, color: C.cream, alpha: a });
      });

      // Okunan bitler
      const n = 16;
      const cw = 76;
      const gap = 12;
      const bx = W / 2 - (n * cw + (n - 1) * gap) / 2;
      const cells = panel * progress(lt, 6.4, 6.9);
      for (let j = 0; j < n; j++) {
        const k = FIRST_BIT + j;
        const x = bx + j * (cw + gap);
        ctx.save();
        ctx.globalAlpha *= cells;
        roundRect(ctx, x, 670, cw, 92, 10);
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        const a = panel * progress(lt, bitReadAt(k), bitReadAt(k) + 0.15);
        if (a > 0) text(ctx, String(bitAt(k)), x + cw / 2, 718, { size: 56, family: 'mono', weight: 700, color: bitAt(k) ? C.fire : C.off, alpha: a });
      }
    }

    const cardsA = vis(lt, 11.9, 17, 0.5, 0.4);
    [['Akım var', '1', C.fire, FIRE], ['Akım yok', '0', C.off, COOL]].forEach(([label, digit, col, rgb], i) => {
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
      text(ctx, label, x - 200, y, { size: 46, weight: 600, color: C.cream, align: 'left', alpha: a });
      text(ctx, '→', x + 70, y, { size: 46, color: C.muted, alpha: a });
      text(ctx, digit, x + 165, y + 4, { size: 120, family: 'mono', weight: 700, color: col, alpha: a, glow: i === 0 ? 'rgba(255,140,40,0.6)' : undefined });
    });
    const bitA = vis(lt, 12.9, 17, 0.5, 0.4);
    text(ctx, 'BİT', W / 2, 530, { size: 150, family: 'display', weight: 900, color: C.cream, alpha: bitA, spacing: 12 });
    text(ctx, 'ikili basamak · binary digit', W / 2, 628, { size: 32, color: C.muted, alpha: bitA * progress(lt, 13.3, 13.9) });
    text(ctx, 'Bilişimin atomu: bölünemeyen en küçük bilgi parçası.', W / 2, 712, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: bitA * progress(lt, 13.7, 14.3) });
    const pairs = [['evet', 'hayır'], ['açık', 'kapalı'], ['doğru', 'yanlış'], ['var', 'yok']];
    const idx = Math.min(3, Math.floor((lt - 14.2) / 0.7));
    if (idx >= 0) {
      const [a, b] = pairs[idx];
      const fa = idx === 3 ? 1 : vis(lt - 14.2 - idx * 0.7, 0, 0.7, 0.12, 0.12);
      runs(ctx, [
        [a, { size: 44, weight: 700, color: C.fire }],
        ['  /  ', { size: 44, color: C.dim }],
        [b, { size: 44, weight: 700, color: C.off }],
      ], W / 2, 845, { alpha: vis(lt, 14.2, 17, 0.4, 0.4) * fa });
    }
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
  const comboTime = (st, c) => st.at + 0.35 + c * LAYOUT[st.n].step;
  const ROWS = [
    [1, '2'],
    [2, '4'],
    [4, '16'],
    [8, '256'],
    [16, '65.536'],
    [32, '4.294.967.296', '4 milyardan fazla'],
    [64, '18.446.744.073.709.551.616', '18 milyar milyardan fazla'],
  ];
  const rowTime = (i) => 14.9 + i * 0.5;
  const CHARS = [['A', 65], ['B', 66], ['Ç', 199], ['ğ', 240], ['ş', 254], ['İ', 221], ['7', 55], ['?', 63], ['ü', 252], ['Z', 90]];
  const charTime = (i) => 20.6 + i * 0.42;

  function sceneLamps(ctx, lt) {
    kicker(ctx, 'YAN YANA DİZMENİN BEREKETİ', lt, 25);

    STAGES.forEach((st, si) => {
      const next = si < STAGES.length - 1 ? STAGES[si + 1].at : STAGE_END;
      const sa = vis(lt, st.at, next, 0.3, 0.3);
      if (sa <= 0) return;
      const L = LAYOUT[st.n];
      const count = 2 ** st.n;
      const rows = Math.ceil(count / L.cols);
      for (let c = 0; c < count; c++) {
        const a = sa * progress(lt, comboTime(st, c), comboTime(st, c) + 0.2, ease.out);
        if (a <= 0) continue;
        const col = Math.floor(c / rows);
        const row = c % rows;
        // lambalar + ikili etiket birlikte ortalansın
        const label = Math.round(L.r * 1.1 + 6);
        const half = ((st.n - 1) / 2) * L.lampGap + L.r;
        const shift = -(30 + st.n * label * 0.6) / 2;
        const cx = 600 + shift + (col - (L.cols - 1) / 2) * L.colGap;
        const cy = 540 + (row - (rows - 1) / 2) * L.rowGap;
        let bits = '';
        for (let j = 0; j < st.n; j++) {
          const on = (c >> (st.n - 1 - j)) & 1;
          bits += on;
          drawLamp(ctx, cx + (j - (st.n - 1) / 2) * L.lampGap, cy, L.r, on, a);
        }
        runs(ctx, bitRuns(bits, label), cx + half + 30, cy + L.r * 0.4 + 3, { align: 'left', alpha: a });
      }
    });

    const counterA = vis(lt, 0.3, STAGE_END, 0.5, 0.5);
    if (counterA > 0) {
      const cur = STAGES.filter((s) => lt >= s.at).pop() ?? STAGES[0];
      ctx.save();
      ctx.globalAlpha *= counterA * 0.6;
      ctx.fillStyle = C.line;
      ctx.fillRect(1180, 260, 2, 560);
      ctx.restore();
      text(ctx, `${cur.n} lamba`, 1490, 380, { size: 48, weight: 600, color: C.cream, alpha: counterA });
      const pop = 1 + 0.18 * (1 - progress(lt, cur.at, cur.at + 0.45, ease.out));
      ctx.save();
      ctx.translate(1490, 545);
      ctx.scale(pop, pop);
      text(ctx, String(2 ** cur.n), 0, 0, { size: 220, family: 'display', weight: 900, color: C.fire, alpha: counterA, glow: 'rgba(255,130,40,0.45)', glowBlur: 40 });
      ctx.restore();
      text(ctx, 'farklı durum', 1490, 690, { size: 40, color: C.muted, alpha: counterA });
      if (cur.n > 1) {
        const p = progress(lt, cur.at, cur.at + 1.0, ease.out);
        text(ctx, '×2', 1700, 440 - p * 60, { size: 56, weight: 800, color: C.flame, alpha: counterA * vis(lt, cur.at, cur.at + 1.0, 0.1, 0.5) });
      }
    }

    const tabA = vis(lt, 14.6, 19.9, 0.5, 0.5);
    if (tabA > 0) {
      text(ctx, 'BİT', 520, 220, { size: 24, weight: 600, spacing: 6, color: C.muted, align: 'right', alpha: tabA });
      text(ctx, 'FARKLI DURUM', 640, 220, { size: 24, weight: 600, spacing: 6, color: C.muted, align: 'left', alpha: tabA });
      ctx.save();
      ctx.globalAlpha *= tabA;
      ctx.fillStyle = C.line;
      ctx.fillRect(300, 246, 1420, 2);
      ctx.restore();
      ROWS.forEach(([n, val, words], i) => {
        const at = rowTime(i);
        const a = tabA * progress(lt, at, at + 0.3, ease.out);
        if (a <= 0) return;
        const y = 300 + i * 84;
        if (i === 3) {
          ctx.save();
          ctx.globalAlpha *= a;
          roundRect(ctx, 300, y - 38, 1420, 76, 12);
          ctx.fillStyle = rgba(FIRE, 0.1);
          ctx.fill();
          ctx.restore();
        }
        text(ctx, String(n), 520, y, { size: 52, family: 'mono', weight: 700, color: C.cream, align: 'right', alpha: a });
        let shown = val;
        if (lt < at + 0.4) {
          const f = Math.floor(lt * 30);
          shown = val.replace(/\d/g, (_, k) => String(Math.floor(hash(f * 97 + k, i) * 10)));
        }
        text(ctx, shown, 640, y, { size: 48, family: 'mono', weight: 700, color: i === 3 ? C.fire : C.cream, align: 'left', alpha: a });
        if (words) {
          const w = measure(ctx, val, { size: 48, family: 'mono', weight: 700 });
          text(ctx, words, 640 + w + 30, y + 4, { size: 32, family: 'serif', italic: true, color: C.muted, align: 'left', alpha: a * progress(lt, at + 0.4, at + 0.8) });
        }
      });
    }

    const byteA = vis(lt, 19.9, 25, 0.5, 0.45);
    if (byteA > 0) {
      const ci = Math.floor((lt - charTime(0)) / 0.42);
      const cur = ci >= 0 ? CHARS[Math.min(ci, CHARS.length - 1)] : null;
      for (let j = 0; j < 8; j++) {
        const on = cur ? (cur[1] >> (7 - j)) & 1 : 0;
        drawLamp(ctx, W / 2 + (j - 3.5) * 120, 300, 36, on, byteA);
      }
      ctx.save();
      ctx.globalAlpha *= byteA * progress(lt, 20.1, 20.5);
      ctx.strokeStyle = C.dim;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 3.5 * 120, 372);
      ctx.lineTo(W / 2 - 3.5 * 120, 388);
      ctx.lineTo(W / 2 + 3.5 * 120, 388);
      ctx.lineTo(W / 2 + 3.5 * 120, 372);
      ctx.stroke();
      ctx.restore();
      runs(ctx, [
        ['8 bit', { size: 84, family: 'display', weight: 800, color: C.cream }],
        ['  =  ', { size: 84, family: 'display', weight: 300, color: C.muted }],
        ['1 BAYT', { size: 84, family: 'display', weight: 900, color: C.fire }],
      ], W / 2, 500, { alpha: byteA * progress(lt, 20.2, 20.7, ease.out) });
      if (cur) {
        ctx.save();
        ctx.globalAlpha *= byteA;
        roundRect(ctx, W / 2 - 90, 580, 180, 180, 22);
        ctx.strokeStyle = C.fire;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        text(ctx, cur[0], W / 2, 672, { size: 120, family: 'display', weight: 800, color: C.cream, alpha: byteA });
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
  const unitTime = (i) => 0.6 + i * 0.7;

  function sceneGlossary(ctx, lt) {
    const enter = progress(lt, 0, 0.7, ease.out);
    ctx.save();
    ctx.translate(W / 2, H / 2 + (1 - enter) * 40);
    ctx.rotate(-0.006);
    paperCard(ctx, -720, -430, 1440, 860);
    ctx.fillStyle = 'rgba(200,70,50,0.35)';
    ctx.fillRect(-600, -430, 2, 860);
    text(ctx, 'SÖZLÜK KENARI', -560, -360, { size: 26, weight: 800, spacing: 10, color: C.ember, align: 'left' });

    UNITS.forEach(([icon, term, abbr, qty, desc], i) => {
      const a = progress(lt, unitTime(i), unitTime(i) + 0.4, ease.out);
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
    });

    const cmp = progress(lt, 4.8, 5.3, ease.out);
    if (cmp > 0) {
      ctx.save();
      ctx.globalAlpha *= cmp;
      ctx.fillStyle = C.ink;
      ctx.fillRect(-500, 325, 10, 10);
      text(ctx, 'okuduğunuz metin ≈ 30.000 harf ≈ 30 KB', -472, 330, { size: 26, color: C.inkSoft, align: 'left' });
      const big = 100 * progress(lt, 5.2, 5.8, ease.out);
      ctx.fillStyle = C.ember;
      ctx.fillRect(160, 380 - big, big, big);
      text(ctx, 'tek bir fotoğraf ≈ 3 MB', 290, 330, { size: 26, color: C.inkSoft, align: 'left', alpha: progress(lt, 5.4, 5.9) });
      text(ctx, '— bir fotoğrafın yanında hiç kalır.', 290, 370, { size: 30, family: 'serif', italic: true, color: C.ink, align: 'left', alpha: progress(lt, 6.0, 6.5) });
      ctx.restore();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 6 · Harf nasıl sayı olur?
  // ---------------------------------------------------------------------------

  const WORD = 'MERHABA';
  const CODES = [77, 69, 82, 72, 65, 66, 65];

  function sceneLetters(ctx, lt) {
    kicker(ctx, 'HARF NASIL SAYI OLUR?', lt, 17);

    const qA = vis(lt, 0.2, 4.0, 0.5, 0.4);
    if (qA > 0) {
      text(ctx, 'Makine yalnızca 0 ile 1 biliyorsa, ekrandaki “A” nedir?', W / 2, 220, { size: 52, family: 'serif', color: C.cream, alpha: qA });
      const dis = progress(lt, 1.6, 2.4);
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
      const n65 = progress(lt, 2.0, 2.7, ease.back);
      ctx.save();
      ctx.translate(W / 2, 560);
      ctx.scale(lerp(0.6, 1, n65), lerp(0.6, 1, n65));
      text(ctx, '65', 0, 0, { size: 300, family: 'mono', weight: 700, color: C.digital, alpha: qA * clamp(n65 * 1.4), glow: 'rgba(124,200,255,0.45)', glowBlur: 50 });
      ctx.restore();
      text(ctx, '“A” harfi diye bir şey yoktur. 65 sayısı vardır.', W / 2, 830, { size: 46, family: 'serif', italic: true, color: C.cream, alpha: qA * progress(lt, 2.5, 3.0) });
    }

    const cB = vis(lt, 4.1, 8.0, 0.5, 0.4);
    if (cB > 0) {
      text(ctx, 'KARAKTER KODLAMASI', W / 2, 250, { size: 30, weight: 700, spacing: 10, color: C.fire, alpha: cB });
      text(ctx, 'her harfe bir numara; herkes aynı numarayı kullanır', W / 2, 310, { size: 38, family: 'serif', italic: true, color: C.muted, alpha: cB });
      [['A', '65'], ['B', '66'], ['a', '97'], ['␣', '32', 'boşluk']].forEach(([ch, num, note], i) => {
        const a = cB * progress(lt, 4.4 + i * 0.3, 4.9 + i * 0.3, ease.out);
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
      text(ctx, 'harf', 120, 300, { size: 24, weight: 600, spacing: 4, color: C.muted, align: 'left', alpha: cC });
      text(ctx, 'sayı', 120, 480, { size: 24, weight: 600, spacing: 4, color: C.muted, align: 'left', alpha: cC * progress(lt, 9.8, 10.2) });
      text(ctx, 'bellekte', 120, 640, { size: 24, weight: 600, spacing: 4, color: C.muted, align: 'left', alpha: cC * progress(lt, 11.2, 11.6) });
      for (let i = 0; i < 7; i++) {
        text(ctx, WORD[i], cx(i), 300, { size: 130, family: 'display', weight: 800, color: C.cream, alpha: cC * progress(lt, 8.3 + i * 0.2, 8.38 + i * 0.2) });
        const fa = progress(lt, 9.9 + i * 0.12, 10.25 + i * 0.12, ease.out);
        if (fa > 0) {
          text(ctx, '↓', cx(i), 392, { size: 30, color: C.dim, alpha: cC * fa });
          ctx.save();
          ctx.translate(cx(i), 480);
          ctx.scale(1, Math.max(0.001, fa));
          text(ctx, String(CODES[i]), 0, 0, { size: 84, family: 'mono', weight: 700, color: C.digital, alpha: cC });
          ctx.restore();
        }
        const ba = progress(lt, 11.3 + i * 0.18, 11.6 + i * 0.18);
        if (ba > 0) {
          text(ctx, '↓', cx(i), 562, { size: 30, color: C.dim, alpha: cC * ba });
          runs(ctx, bitRuns(CODES[i].toString(2).padStart(8, '0'), 30), cx(i), 651, { alpha: cC * ba });
        }
      }
    }

    const cD = vis(lt, 13.8, 17, 0.4, 0.45);
    if (cD > 0) {
      [['serif', 400, true], ['display', 900, false], ['mono', 400, false]].forEach(([fam, wt, it], i) => {
        const a = cD * progress(lt, 13.9 + i * 0.25, 14.4 + i * 0.25, ease.out);
        const x = W / 2 + (i - 1) * 360;
        text(ctx, 'A', x, 380, { size: 220, family: fam, weight: wt, italic: it, color: C.cream, alpha: a });
        ctx.save();
        ctx.globalAlpha *= cD * progress(lt, 14.6, 15.2);
        ctx.strokeStyle = C.dim;
        ctx.lineWidth = 2;
        line(ctx, x, 520, W / 2, 640);
        ctx.restore();
      });
      text(ctx, '65', W / 2, 720, { size: 120, family: 'mono', weight: 700, color: C.digital, alpha: cD * progress(lt, 14.8, 15.3) });
    }
  }

  // ---------------------------------------------------------------------------
  // 7 · Türkçenin kayıp harfleri
  // ---------------------------------------------------------------------------

  const TR = ['ç', 'ğ', 'ı', 'İ', 'ö', 'ş', 'ü'];
  const trHit = (i) => 3.8 + i * 0.12 + 0.45;
  const GLITCH_PULSES = [11.2, 12.5, 13.8];
  const SCRIPTS = ['çğıİöşü', '中文', 'Ελληνικά', 'Русский', 'العربية', 'हिन्दी', '☥', '😊', 'ñ ß é å', '日本語'];

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

  function sceneTurkish(ctx, lt) {
    kicker(ctx, 'TÜRKÇENİN KAYIP HARFLERİ', lt, 24);

    const gA = vis(lt, 0.2, 7.3, 0.4, 0.4);
    if (gA > 0) {
      const cell = 56;
      const gx = W / 2 - 8 * cell;
      const gy = 160;
      text(ctx, 'İLK ANLAŞMA · 128 YER', W / 2, 128, { size: 24, weight: 700, spacing: 8, color: C.muted, alpha: gA });
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
          text(ctx, c === 32 ? '␣' : ch, x + cell / 2, y + cell / 2 + 1, { size: 26, family: 'mono', color: /[A-Za-z]/.test(ch) ? C.cream : C.muted, alpha: a });
        }
      }
      let flash = 0;
      TR.forEach((_, i) => { flash = Math.max(flash, vis(lt, trHit(i), trHit(i) + 0.3, 0.02, 0.28)); });
      if (flash > 0) {
        ctx.save();
        ctx.globalAlpha *= gA * flash;
        ctx.fillStyle = C.error;
        ctx.fillRect(gx, gy + 8 * cell + 2, 16 * cell, 4);
        ctx.restore();
      }
      TR.forEach((ch, i) => {
        const s = 3.8 + i * 0.12;
        if (lt < s) return;
        const y = lerp(lerp(1150, 662, progress(lt, s, s + 0.45, ease.out)), 735, progress(lt, s + 0.45, s + 0.85, ease.out));
        const x = W / 2 + (i - 3) * 118;
        ctx.save();
        ctx.globalAlpha *= gA;
        roundRect(ctx, x - 46, y - 46, 92, 92, 14);
        ctx.fillStyle = 'rgba(255,84,104,0.14)';
        ctx.fill();
        ctx.strokeStyle = C.error;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
        text(ctx, ch, x, y + 2, { size: 56, family: 'display', weight: 700, color: C.cream, alpha: gA });
      });
      text(ctx, 'yer yok', W / 2, 830, { size: 40, family: 'serif', italic: true, color: C.error, alpha: gA * progress(lt, 5.0, 5.5) });
    }

    const mB = vis(lt, 7.3, 14.8, 0.5, 0.4);
    if (mB > 0) {
      drawMonitor(ctx, 520, 400, mB);
      drawMonitor(ctx, 1400, 400, mB);
      text(ctx, 'Türkçe ağaç', 520, 393, { size: 70, family: 'display', weight: 700, color: C.cream, alpha: mB * progress(lt, 7.6, 8.1) });
      if (lt > 8.5 && lt < 10.0) {
        const pk = progress(lt, 8.6, 9.9);
        const px = lerp(700, 1220, pk);
        const py = 393 - Math.sin(pk * Math.PI) * 260;
        ctx.save();
        ctx.globalAlpha *= mB * vis(lt, 8.5, 10.0, 0.1, 0.1);
        roundRect(ctx, px - 90, py - 27, 180, 54, 12);
        ctx.fillStyle = '#0d1a30';
        ctx.fill();
        ctx.strokeStyle = C.digital;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        text(ctx, '11110000', px, py + 1, { size: 26, family: 'mono', weight: 700, color: C.digital, alpha: mB });
      }
      if (lt >= 9.9) {
        let g = vis(lt, 9.9, 11.0, 0.02, 0.3);
        for (const p of GLITCH_PULSES) g = Math.max(g, vis(lt, p, p + 0.15, 0.01, 0.05));
        const parts = [['Türk', C.cream], ['�', C.error], ['e a', C.cream], ['ð', C.error], ['aç', C.cream]];
        const style = (c) => ({ size: 70, family: 'display', weight: 700, color: c });
        const jitter = g > 0 ? (hash(Math.floor(lt * 30), 81) - 0.5) * 18 * g : 0;
        if (g > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const off = 6 * g + 8 * g * (hash(Math.floor(lt * 30), 80) - 0.5);
          runs(ctx, parts.map(([s]) => [s, style('#ff2050')]), 1400 - off, 417, { alpha: mB * 0.6 * g });
          runs(ctx, parts.map(([s]) => [s, style('#20e0ff')]), 1400 + off, 417, { alpha: mB * 0.6 * g });
          ctx.restore();
        }
        runs(ctx, parts.map(([s, c]) => [s, style(c)]), 1400 + jitter, 417, { alpha: mB });
      }
      const dict = mB * progress(lt, 8.0, 8.5);
      runs(ctx, [['Sözlük A:  240 → ', { size: 30, family: 'mono', color: C.muted }], ['ğ', { size: 34, family: 'mono', weight: 700, color: C.ok }]], 520, 722, { alpha: dict });
      runs(ctx, [['Sözlük B:  240 → ', { size: 30, family: 'mono', color: C.muted }], ['ð', { size: 34, family: 'mono', weight: 700, color: C.error }]], 1400, 722, { alpha: dict });
    }

    const uC = vis(lt, 14.9, 19.6, 0.5, 0.4);
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
      text(ctx, 'UNICODE', cx, cy - 20, { size: 110, family: 'display', weight: 900, spacing: 6, color: C.cream, alpha: uC * progress(lt, 15.1, 15.7) });
      text(ctx, 'dünyanın bütün yazıları · tek liste', cx, cy + 60, { size: 30, color: C.muted, alpha: uC * progress(lt, 15.4, 15.9) });
      text(ctx, 'U+011F  →  ğ', cx, cy + 118, { size: 34, family: 'mono', color: C.digital, alpha: uC * progress(lt, 15.8, 16.3) });
      SCRIPTS.forEach((s, i) => {
        const a = uC * progress(lt, 15.3 + i * 0.15, 15.7 + i * 0.15, ease.out);
        if (a <= 0) return;
        const ang = -Math.PI / 2 + (i / SCRIPTS.length) * Math.PI * 2 + lt * 0.06;
        const r = 1 + (1 - a) * 0.25;
        const x = cx + Math.cos(ang) * 420 * r;
        const y = cy + Math.sin(ang) * 270 * r;
        const w = measure(ctx, s, { size: 40 }) + 44;
        ctx.save();
        ctx.globalAlpha *= a;
        roundRect(ctx, x - w / 2, y - 32, w, 64, 32);
        ctx.fillStyle = '#0d1528';
        ctx.fill();
        ctx.strokeStyle = 'rgba(124,200,255,0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        text(ctx, s, x, y + 2, { size: 40, color: i === 0 ? C.fire : C.cream, alpha: a });
      });
    }

    const uS = vis(lt, 19.7, 24, 0.6, 0.45);
    if (uS > 0) {
      ctx.save();
      ctx.globalAlpha *= uS;
      ctx.translate(W / 2, 500 + (1 - progress(lt, 19.7, 20.4, ease.out)) * 30);
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

  function sceneHex(ctx, lt) {
    kicker(ctx, 'SAYILARI ON ALTILIK YAZMAK', lt, 12);

    const hA = vis(lt, 0.2, 5.7, 0.4, 0.4);
    if (hA > 0) {
      const spread = 70 * progress(lt, 2.3, 2.9);
      const blur = vis(lt, 0.7, 2.2, 0.3, 0.4);
      for (let j = 0; j < 8; j++) {
        const x = W / 2 + (j - 3.5) * 104 + (j < 4 ? -spread : spread);
        const col = BIN[j] === '1' ? C.fire : C.off;
        const o = { size: 160, family: 'mono', weight: 700, color: col };
        if (blur > 0) {
          for (const [dx, al] of [[-5, 0.22], [5, 0.22]]) {
            text(ctx, BIN[j], x + dx * blur * (1.2 + Math.sin(lt * 9 + j)), 330, { ...o, alpha: hA * al * blur });
          }
        }
        text(ctx, BIN[j], x, 330, { ...o, alpha: hA * (1 - 0.2 * blur) });
      }
      const groups = [W / 2 - 208 - spread, W / 2 + 208 + spread];
      const br = hA * progress(lt, 2.9, 3.4);
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
      const hx = progress(lt, 3.1, 3.6, ease.back);
      const merge = progress(lt, 4.3, 5.0);
      const hexO = { size: 180, family: 'display', weight: 900, color: C.flame, alpha: hA * clamp(hx), glow: 'rgba(255,170,60,0.4)', glowBlur: 30 };
      text(ctx, 'D', lerp(groups[0], W / 2 - 62, merge), 560, hexO);
      text(ctx, '6', lerp(groups[1], W / 2 + 62, merge), 560, hexO);
      text(ctx, '1101 = 13 = D', groups[0], 668, { size: 26, family: 'mono', color: C.muted, alpha: hA * clamp(hx) * (1 - merge) });
      text(ctx, '0110 = 6', groups[1], 668, { size: 26, family: 'mono', color: C.muted, alpha: hA * clamp(hx) * (1 - merge) });
      const lg = hA * progress(lt, 3.3, 3.9);
      for (let i = 0; i < 16; i++) {
        const x = W / 2 + (i - 7.5) * 66;
        const hl = i === 13 || i === 6;
        if (hl && lg > 0) {
          ctx.save();
          ctx.globalAlpha *= lg;
          ctx.strokeStyle = C.flame;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, 780, 28, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        text(ctx, HEX[i], x, 781, { size: 40, family: 'mono', weight: 700, color: hl ? C.flame : C.muted, alpha: lg });
        if (i >= 10) text(ctx, String(i), x, 830, { size: 20, family: 'mono', color: C.dim, alpha: lg });
      }
    }

    const sA = vis(lt, 5.8, 12, 0.4, 0.45);
    if (sA > 0) {
      [['#FF0000', '#ff0000', 'katıksız kırmızı'], ['#000000', '#000000', 'siyah'], ['#FFFFFF', '#ffffff', 'beyaz']].forEach(([code, css, name], i) => {
        const a = sA * progress(lt, 5.9 + i * 0.3, 6.4 + i * 0.3, ease.out);
        if (a <= 0) return;
        const x = W / 2 + (i - 1) * 440;
        const y = 330 + (1 - a) * 20;
        ctx.save();
        ctx.globalAlpha *= a;
        roundRect(ctx, x - 170, y - 120, 340, 240, 18);
        ctx.fillStyle = css;
        ctx.fill();
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        text(ctx, code, x, y + 170, { size: 54, family: 'mono', weight: 700, color: C.cream, alpha: a });
        text(ctx, name, x, y + 228, { size: 32, family: 'serif', italic: true, color: C.muted, alpha: a });
      });
      runs(ctx, [
        ['R:FF  ', { size: 26, family: 'mono', weight: 700, color: '#ff6464' }],
        ['G:00  ', { size: 26, family: 'mono', color: '#4f6a5a' }],
        ['B:00', { size: 26, family: 'mono', color: '#4f5a80' }],
      ], W / 2 - 440, 632, { alpha: sA * progress(lt, 6.9, 7.4) });

      const ph = vis(lt, 8.8, 12, 0.4, 0.45);
      if (ph > 0) {
        const raw = '5xxxxxxxxx';
        const g = progress(lt, 9.3, 9.9);
        const cw = 38.5;
        const gap = 30 * g;
        const width = raw.length * cw + 3 * gap;
        for (let k = 0; k < raw.length; k++) {
          const gaps = (k >= 3) + (k >= 6) + (k >= 8);
          text(ctx, raw[k], W / 2 - width / 2 + k * cw + gaps * gap + cw / 2, 790, { size: 64, family: 'mono', color: k === 0 ? C.fire : C.cream, alpha: ph });
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
    ['thermo', 'sıcaklık', (lt) => `${(21.4 + 0.1 * Math.round(noise(lt * 2, 31) * 2 - 1)).toFixed(1).replace('.', ',')} °C`],
    ['drop', 'nem', (lt) => `%${48 + Math.round(noise(lt * 1.5, 32) * 2 - 1)}`],
    ['ruler', 'mesafe', (lt) => `${(3.2 + 0.1 * Math.round(noise(lt * 3, 33) * 4 - 2)).toFixed(1).replace('.', ',')} m`],
    ['heart', 'kalp atışı', (lt) => `${72 + Math.round(noise(lt * 0.8, 34) * 2 - 1)} atım/dk`],
  ];
  const VERBS = ['işlenebilir,', 'saklanabilir,', 'iletilebilir.'];
  const WATCHED = [
    ['pin', 'nerede olduğu', '41,01° K · 28,97° D'],
    ['chat', 'kiminle konuştuğu', '14 mesaj'],
    ['eye', 'neye baktığı', '3 kez'],
    ['timer', 'neyi kaç saniye izlediği', '7,4 sn'],
  ];
  const BEAT = 60 / 72;

  function sceneNumbers(ctx, lt) {
    kicker(ctx, 'HER ŞEY SAYIYA DÖNÜŞEBİLİR Mİ?', lt, 18.6);

    // Fotoğraf → piksel → sayı
    const pA = vis(lt, 0.2, 5.6, 0.5, 0.4);
    if (pA > 0) {
      const { canvas, data } = photo();
      const DX = 400;
      const DY = 150;
      const DW = 1120;
      const DH = 630;
      const z = progress(lt, 1.2, 3.6);
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
      const numA = progress(lt, 3.7, 4.3);
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
      const o = (Math.floor(FOCUS[1]) * PW + Math.floor(FOCUS[0])) * 4;
      runs(ctx, [
        [`R ${data[o]}`, { size: 40, family: 'mono', weight: 700, color: '#ff7a6b' }],
        ['   ', { size: 40, family: 'mono' }],
        [`G ${data[o + 1]}`, { size: 40, family: 'mono', weight: 700, color: '#7fe0a3' }],
        ['   ', { size: 40, family: 'mono' }],
        [`B ${data[o + 2]}`, { size: 40, family: 'mono', weight: 700, color: C.digital }],
      ], W / 2, 856, { alpha: pA * progress(lt, 4.0, 4.4) });
    }

    // Ses dalgası → örnekler → sayılar; video → kareler
    const wA = vis(lt, 5.7, 10.6, 0.4, 0.4);
    if (wA > 0) {
      const x0 = 200;
      const x1 = 1720;
      const y0 = 360;
      const amp = 150;
      const ph = Math.min(lt, 6.6);
      const wave = (x) => 0.62 * Math.sin((x / 260) * Math.PI * 2 + ph * 1.4) + 0.26 * Math.sin((x / 97) * Math.PI * 2 + 0.7) + 0.12 * Math.sin((x / 41) * Math.PI * 2 + ph * 2.2);
      ctx.save();
      ctx.globalAlpha *= wA;
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 2;
      line(ctx, x0, y0, x1, y0);
      const draw = progress(lt, 5.8, 6.6);
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
      for (let x = x0 + 20; x < x1; x += 40) {
        const k = (x - x0) / (x1 - x0);
        const a = wA * progress(lt, 6.6 + k * 0.8, 6.75 + k * 0.8);
        if (a <= 0) continue;
        const v = wave(x);
        const y = y0 - v * amp;
        ctx.save();
        ctx.globalAlpha *= a;
        ctx.strokeStyle = C.fire;
        ctx.lineWidth = 2;
        line(ctx, x, y0, x, y);
        ctx.fillStyle = C.flame;
        dot(ctx, x, y, 5);
        ctx.restore();
        text(ctx, String(Math.round(v * 100)), x, v >= 0 ? y - 24 : y + 24, { size: 16, family: 'mono', color: C.cream, alpha: wA * progress(lt, 7.4 + k * 0.6, 7.55 + k * 0.6) });
      }
      text(ctx, 'saniyede on binlerce ölçüm', x1, 160, { size: 28, family: 'mono', color: C.muted, align: 'right', alpha: wA * progress(lt, 6.8, 7.3) });

      const fA = wA * progress(lt, 8.2, 8.7);
      if (fA > 0) {
        ctx.save();
        ctx.globalAlpha *= fA;
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 668, W, 156);
        const speed = 300;
        const off = (lt * speed) % 220;
        const base = Math.floor((lt * speed) / 220);
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
        text(ctx, '25 kare / saniye', W - 140, 630, { size: 30, family: 'mono', weight: 700, color: C.cream, align: 'right', alpha: fA });
      }
    }

    // Sensörler
    const sA = vis(lt, 10.7, 14.6, 0.4, 0.4);
    if (sA > 0) {
      SENSORS.forEach(([icon, label, value], i) => {
        const a = sA * progress(lt, 10.8 + i * 0.25, 11.3 + i * 0.25, ease.out);
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
        const beat = icon === 'heart' ? Math.exp(-(((lt - 11.0) % BEAT + BEAT) % BEAT) * 8) : 0;
        drawIcon(ctx, icon, x, y - 80, 1 + beat * 0.15, icon === 'heart' ? C.error : C.fire, a);
        text(ctx, value(lt), x, y + 50, { size: 48, family: 'mono', weight: 700, color: C.cream, alpha: a });
        text(ctx, label, x, y + 118, { size: 30, color: C.muted, alpha: a });
      });
    }

    // Büyük cümle
    const dA = vis(lt, 14.7, 18.6, 0.5, 0.4);
    if (dA > 0) {
      text(ctx, 'Ölçülebilen her şey sayıya çevrilebilir;', W / 2, 400, { size: 64, family: 'serif', color: C.cream, alpha: dA });
      text(ctx, 'sayıya çevrilen her şey', W / 2, 500, { size: 52, family: 'serif', italic: true, color: C.muted, alpha: dA * progress(lt, 15.3, 15.8) });
      VERBS.forEach((v, i) => {
        const a = dA * progress(lt, 15.9 + i * 0.5, 16.3 + i * 0.5, ease.out);
        text(ctx, v, W / 2 + (i - 1) * 440, 630 + (1 - a) * 20, { size: 66, family: 'display', weight: 800, color: C.digital, alpha: a });
      });
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
        const a = iA * progress(lt, 18.9 + i * 0.3, 19.3 + i * 0.3, ease.out);
        const x = W / 2 + (i - 1.5) * 400;
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
      text(ctx, 'Ve her güç gibi, kimin elinde olduğu sorusunu doğurur.', W / 2, 620, { size: 48, family: 'serif', italic: true, color: C.cream, alpha: fA * progress(lt, 21.5, 22.1) });
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
    // 0 · Açılış
    m.pad(0, 6.5, ['D2', 'A2', 'D3'], { gain: 0.32, attack: 3, release: 2.5, cutoff: 600 });
    BLINKS.forEach((b, i) => {
      const on = i % 2 === 0;
      m.click(b, { gain: 0.18, tone: on ? 3600 : 2400 });
      if (on) m.blip(b, { freq: 660, dur: 0.25, gain: 0.12, wet: 0.4 });
    });
    m.boom(3.3, { gain: 0.45 });
    m.bell(3.3, { freq: hz('D5'), gain: 0.22, decay: 3 });
    m.bell(3.62, { freq: hz('A5'), gain: 0.12, decay: 2.5 });
    m.bell(4.4, { freq: hz('F5'), gain: 0.08 });

    // 1 · Ateşler
    m.wind(at('fires', -1), span('fires', -1, 22.5), { gain: 0.28 });
    m.pad(at('fires', 0), span('fires', 0, 20.5), ['D3', 'A3', 'E4', 'F4'], { gain: 0.32 });
    IGNITE.forEach((d, i) => {
      const t = at('fires', d);
      const pan = lerp(-0.7, 0.7, i / 5);
      if (i > 0) m.whoosh(t - 0.55, { dur: 0.55, from: 900, to: 3200, gain: 0.07, panFrom: lerp(-0.7, 0.7, (i - 1) / 5), panTo: pan, q: 2 });
      m.fireIgnite(t, { gain: i === 0 ? 0.55 : 0.32, pan: i === 0 ? -0.2 : pan });
      m.crackle(t, at('two', 0) - t, { gain: i === 0 ? 0.32 : 0.16, pan: i === 0 ? -0.2 : pan, density: 18, roar: i === 0 ? 0.6 : 0.3 });
    });
    ['D5', 'E5', 'F5', 'A5', 'C6', 'D6'].forEach((n, k) => m.blip(at('fires', 11.4 + k * 0.24), { freq: hz(n), dur: 0.1, type: 'triangle', gain: 0.08, pan: lerp(-0.6, 0.6, k / 5) }));
    for (let s = 11.4; s < 16.1; s += 0.55) m.hoof(at('fires', s), { gain: 0.14, pan: -0.25 });
    m.boom(at('fires', 16.6), { gain: 0.3, freq: 55 });
    m.bell(at('fires', 19.5), { freq: hz('F5'), gain: 0.2, decay: 3 });
    m.bell(at('fires', 19.5), { freq: hz('A5'), gain: 0.12, decay: 3 });
    m.bell(at('fires', 19.52), { freq: hz('D6'), gain: 0.07 });

    // 2 · İki durum
    m.crackle(at('two', 0), span('two', 0, 11.2), { gain: 0.2, pan: -0.35, roar: 0.5 });
    m.crackle(at('two', 5.4), span('two', 5.4, 11.2), { gain: 0.12, pan: 0.35, density: 12, roar: 0.4 });
    m.pad(at('two', 0), span('two', 0, 10.6), ['Bb2', 'F3', 'A3', 'D4'], { gain: 0.3 });
    m.pad(at('two', 10.8), untilEnd('two', 10.8, 1), ['F2', 'C3', 'A3', 'C4', 'E4'], { gain: 0.3, attack: 1.5 });
    m.rain(at('two', 4.8), span('two', 4.8, 11.6), { gain: 0.3 });
    m.wind(at('two', 4.8), span('two', 4.8, 11.6), { gain: 0.12 });
    for (let s = 5.6; s < 10.6; s += 0.33) m.tick(at('two', s), { gain: 0.05, pan: 0.45 });
    m.boom(at('two', 11.3), { gain: 0.3 });
    m.bell(at('two', 11.3), { freq: hz('C5'), gain: 0.2, decay: 3.5 });
    m.bell(at('two', 11.32), { freq: hz('G5'), gain: 0.1, decay: 3 });
    m.whoosh(at('two', 12.2), { dur: 1.0, from: 2000, to: 6000, gain: 0.05 });
    ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => m.pop(at('two', 15.2 + i * 0.25), { freq: hz(n), gain: 0.12, pan: lerp(-0.4, 0.4, i / 3) }));

    // 3 · Neden iki?
    m.hum(at('why', 0), span('why', 0, 6.4), { gain: 0.09 });
    m.staticNoise(at('why', 0), span('why', 0, 6.4), { gain: 0.05 });
    m.pad(at('why', 0), span('why', 0, 11), ['C3', 'G3', 'D4'], { gain: 0.24, cutoff: 700 });
    m.pad(at('why', 11.6), untilEnd('why', 11.6, 0.6), ['F3', 'A3', 'C4', 'E4'], { gain: 0.26 });
    for (let s = 0.3; s < 6.0; s += 0.24) m.tick(at('why', s), { gain: 0.03, pan: 0.6 });
    [1.4, 2.2, 3.0].forEach((s, i) => m.pop(at('why', s), { freq: 500 + i * 100, gain: 0.1, pan: (i - 1) * 0.4 }));
    m.whoosh(at('why', 5.9), { dur: 0.5, from: 300, to: 4000, gain: 0.14 });
    m.blip(at('why', 6.2), { freq: 220, dur: 0.3, slide: 4, type: 'sawtooth', gain: 0.08 });
    for (let j = 0; j < 16; j++) {
      const k = FIRST_BIT + j;
      m.blip(at('why', bitReadAt(k)), { freq: bitAt(k) ? 880 : 440, dur: 0.07, type: 'square', gain: 0.06, pan: lerp(-0.6, 0.6, j / 15) });
    }
    m.click(at('why', 11.9), { gain: 0.15 });
    m.bell(at('why', 11.9), { freq: hz('A5'), gain: 0.12 });
    m.click(at('why', 12.2), { gain: 0.15 });
    m.bell(at('why', 12.2), { freq: hz('A4'), gain: 0.12 });
    m.boom(at('why', 12.9), { gain: 0.35 });
    m.bell(at('why', 12.9), { freq: hz('F5'), gain: 0.16, decay: 3 });
    for (let i = 0; i < 4; i++) m.tick(at('why', 14.2 + i * 0.7), { gain: 0.08, tone: 3000 });

    // 4 · Lambalar
    m.pad(at('lamps', 0), span('lamps', 0, 14.2), ['F2', 'C3', 'A3', 'E4'], { gain: 0.26 });
    m.pad(at('lamps', 14.6), span('lamps', 14.6, 19.6), ['C3', 'G3', 'E4', 'B4'], { gain: 0.24 });
    m.pad(at('lamps', 19.8), untilEnd('lamps', 19.8, 0.6), ['D3', 'A3', 'F4', 'C5'], { gain: 0.26 });
    STAGES.forEach((st, si) => {
      m.blip(at('lamps', st.at), { freq: 220 * 2 ** si, dur: 0.6, type: 'triangle', gain: 0.12, wet: 0.4 });
      for (let c = 0; c < 2 ** st.n; c++) m.click(at('lamps', comboTime(st, c)), { gain: 0.1, tone: 3000 + c * 80 });
    });
    ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6'].forEach((n, i) => {
      for (let k = 0; k < 3; k++) m.tick(at('lamps', rowTime(i) + k * 0.12), { gain: 0.05 });
      m.bell(at('lamps', rowTime(i) + 0.4), { freq: hz(n), gain: 0.1, decay: 1.6 });
    });
    m.boom(at('lamps', 20.2), { gain: 0.35 });
    m.bell(at('lamps', 20.2), { freq: hz('D5'), gain: 0.15, decay: 3 });
    ['D5', 'F5', 'A5', 'C6', 'D6', 'A5', 'F5', 'E5', 'D5', 'A4'].forEach((n, i) => {
      m.click(at('lamps', charTime(i)), { gain: 0.1 });
      m.blip(at('lamps', charTime(i)), { freq: hz(n), dur: 0.15, type: 'triangle', gain: 0.06 });
    });

    // 5 · Sözlük kenarı
    m.pad(at('glossary', 0), untilEnd('glossary', 0, 1), ['Bb2', 'F3', 'D4'], { gain: 0.24 });
    m.whoosh(at('glossary', 0.05), { dur: 0.6, from: 400, to: 1500, gain: 0.12, q: 0.6 });
    UNITS.forEach((_, i) => m.typeKey(at('glossary', unitTime(i)), { gain: 0.12 }));
    m.pop(at('glossary', 4.85), { freq: 900, gain: 0.08 });
    m.pop(at('glossary', 5.25), { freq: 300, gain: 0.16 });

    // 6 · Harfler
    m.pad(at('letters', 0), span('letters', 0, 7.6), ['D3', 'F3', 'A3'], { gain: 0.24 });
    m.pad(at('letters', 8), span('letters', 8, 13.4), ['G2', 'D3', 'Bb3', 'F4'], { gain: 0.24 });
    m.pad(at('letters', 13.6), untilEnd('letters', 13.6, 0.8), ['A2', 'E3', 'A3', 'C4'], { gain: 0.24, attack: 1.2, release: 1.8 });
    m.glitch(at('letters', 1.6), span('letters', 1.6, 2.2), { gain: 0.12 });
    m.blip(at('letters', 2.0), { freq: 300, dur: 0.5, slide: 4, gain: 0.08, type: 'triangle' });
    m.bell(at('letters', 2.4), { freq: hz('E5'), gain: 0.16, decay: 2.5 });
    ['A4', 'B4', 'C5', 'E5'].forEach((n, i) => {
      m.click(at('letters', 4.4 + i * 0.3), { gain: 0.1 });
      m.blip(at('letters', 4.4 + i * 0.3), { freq: hz(n), dur: 0.12, gain: 0.06 });
    });
    for (let i = 0; i < 7; i++) m.typeKey(at('letters', 8.3 + i * 0.2), { gain: 0.22, pan: (i - 3) * 0.12 });
    m.bell(at('letters', 9.75), { freq: 2400, gain: 0.07, decay: 1.2, wet: 0.2 });
    for (let i = 0; i < 7; i++) m.whoosh(at('letters', 9.9 + i * 0.12), { dur: 0.14, from: 2000, to: 5000, gain: 0.05, panFrom: (i - 3) * 0.12, panTo: (i - 3) * 0.12 });
    CODES.forEach((code, i) => {
      const bits = code.toString(2).padStart(8, '0');
      for (let j = 0; j < 8; j++) {
        m.blip(at('letters', 11.3 + i * 0.18 + j * 0.022), { freq: bits[j] === '1' ? 1320 : 660, dur: 0.03, type: 'square', gain: 0.025, pan: (i - 3) * 0.12, wet: 0.05 });
      }
    });
    ['C5', 'E5', 'G5'].forEach((n, i) => m.bell(at('letters', 13.9 + i * 0.25), { freq: hz(n), gain: 0.1, decay: 1.5 }));
    m.bell(at('letters', 14.8), { freq: hz('C6'), gain: 0.1, decay: 2 });

    // 7 · Türkçe
    m.pad(at('turkish', 0), span('turkish', 0, 7.2), ['C3', 'G3', 'E4'], { gain: 0.22 });
    m.pad(at('turkish', 7.2), span('turkish', 7.2, 14.8), ['Ab2', 'Eb3', 'C4'], { gain: 0.24, cutoff: 700 });
    m.pad(at('turkish', 14.8), span('turkish', 14.8, 19.6), ['F2', 'C3', 'A3', 'E4', 'G4'], { gain: 0.3, attack: 0.8, cutoff: 1300 });
    m.pad(at('turkish', 19.6), untilEnd('turkish', 19.6, 0.8), ['Bb2', 'F3', 'D4', 'A4'], { gain: 0.26 });
    for (let c = 0; c < 128; c++) m.tick(at('turkish', 0.4 + c * 0.018), { gain: 0.025, pan: (c % 16) / 15 - 0.5 });
    TR.forEach((_, i) => {
      m.boom(at('turkish', trHit(i)), { gain: 0.1, freq: 120 });
      m.click(at('turkish', trHit(i)), { gain: 0.06, tone: 1500, pan: (i - 3) * 0.15 });
    });
    m.buzz(at('turkish', 5.0), { gain: 0.14 });
    m.whoosh(at('turkish', 8.6), { dur: 1.3, from: 600, to: 2500, gain: 0.12, panFrom: -0.6, panTo: 0.6 });
    '11110000'.split('').forEach((b, j) => m.blip(at('turkish', 8.65 + j * 0.15), { freq: b === '1' ? 1320 : 660, dur: 0.05, type: 'square', gain: 0.03, pan: lerp(-0.6, 0.6, j / 7) }));
    m.glitch(at('turkish', 9.9), span('turkish', 9.9, 10.9), { gain: 0.22 });
    GLITCH_PULSES.forEach((p) => m.glitch(at('turkish', p), 0.15, { gain: 0.12 }));
    m.riser(at('turkish', 13.9), span('turkish', 13.9, 14.85), { gain: 0.12 });
    m.boom(at('turkish', 14.9), { gain: 0.35 });
    ['F5', 'A5', 'C6', 'E6'].forEach((n, i) => m.bell(at('turkish', 14.9 + i * 0.06), { freq: hz(n), gain: 0.1, decay: 3 }));
    ['C5', 'D5', 'F5', 'G5', 'A5', 'C6', 'D6', 'F6', 'G6', 'A6'].forEach((n, i) => m.bell(at('turkish', 15.3 + i * 0.15), { freq: hz(n), gain: 0.04, decay: 1.2 }));
    m.whoosh(at('turkish', 19.65), { dur: 0.6, from: 400, to: 1500, gain: 0.1, q: 0.6 });
    m.bell(at('turkish', 20.0), { freq: hz('F4'), gain: 0.14, decay: 3.5 });

    // 8 · Onaltılık
    m.pad(at('hex', 0), span('hex', 0, 5.4), ['G2', 'D3', 'Bb3', 'F4'], { gain: 0.22 });
    m.pad(at('hex', 5.8), untilEnd('hex', 5.8, 0.8), ['C3', 'G3', 'E4', 'A4'], { gain: 0.22 });
    m.wobble(at('hex', 0.7), span('hex', 0.7, 2.2), { gain: 0.08 });
    m.click(at('hex', 2.3), { gain: 0.14 });
    m.whoosh(at('hex', 2.3), { dur: 0.5, from: 800, to: 3000, gain: 0.06 });
    m.blip(at('hex', 3.1), { freq: hz('A5'), dur: 0.2, gain: 0.1, type: 'triangle' });
    m.blip(at('hex', 3.25), { freq: hz('E5'), dur: 0.2, gain: 0.1, type: 'triangle' });
    for (let i = 0; i < 16; i++) m.tick(at('hex', 3.3 + i * 0.03), { gain: 0.03 });
    m.bell(at('hex', 4.95), { freq: hz('D6'), gain: 0.12, decay: 2 });
    [500, 250, 900].forEach((f, i) => m.pop(at('hex', 5.9 + i * 0.3), { freq: f, gain: 0.16 }));
    [0, 1, 2].forEach((i) => m.click(at('hex', 9.4 + i * 0.18), { gain: 0.1 }));

    // 9 · Sayılar
    m.pad(at('numbers', 0), span('numbers', 0, 5.2), ['D3', 'A3', 'F4'], { gain: 0.22 });
    m.pad(at('numbers', 5.6), span('numbers', 5.6, 10.2), ['Bb2', 'F3', 'D4'], { gain: 0.22 });
    m.pad(at('numbers', 10.6), span('numbers', 10.6, 14.2), ['C3', 'G3', 'E4'], { gain: 0.22 });
    m.pad(at('numbers', 14.6), span('numbers', 14.6, 18.2), ['F2', 'C3', 'A3', 'F4'], { gain: 0.26 });
    m.pad(at('numbers', 18.6), untilEnd('numbers', 18.6, 1), ['D2', 'Ab2', 'D3'], { gain: 0.26, cutoff: 500, release: 1.5 });
    m.riser(at('numbers', 1.2), span('numbers', 1.2, 3.6), { gain: 0.1 });
    for (let i = 0; i < 14; i++) m.blip(at('numbers', 3.7 + i * 0.04), { freq: 1200 + ((i * 7) % 5) * 220, dur: 0.03, type: 'square', gain: 0.025 });
    m.blip(at('numbers', 5.8), { freq: 220, dur: 1.4, gain: 0.08, wet: 0.3 });
    for (let k = 0; k < 38; k++) m.tick(at('numbers', 6.6 + (k / 38) * 0.8), { gain: 0.03, tone: 4000 });
    m.projector(at('numbers', 8.2), span('numbers', 8.2, 10.5), { gain: 0.05 });
    SENSORS.forEach((_, i) => m.pop(at('numbers', 10.8 + i * 0.25), { freq: 400 + i * 120, gain: 0.12 }));
    for (let b = 11.0; b < 14.5; b += BEAT) m.heartbeat(at('numbers', b), { gain: 0.35 });
    m.bell(at('numbers', 14.7), { freq: hz('F5'), gain: 0.14, decay: 3 });
    ['A5', 'C6', 'F6'].forEach((n, i) => m.blip(at('numbers', 15.9 + i * 0.5), { freq: hz(n), dur: 0.25, type: 'triangle', gain: 0.07, wet: 0.3 }));
    m.boom(at('numbers', 18.7), { gain: 0.3, freq: 50 });
    ['D4', 'F4', 'Ab4', 'B4'].forEach((n, i) => m.blip(at('numbers', 18.9 + i * 0.3), { freq: hz(n), dur: 0.3, type: 'triangle', gain: 0.06 }));
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
    overlay: (ctx, t) => captions(ctx, t, VOICE.captions),
  });
})();
