/*
 * Birinci Kapı, 2. bölüm — Taşa Kazınan Mantık
 * Anahtarlardan mantık kapılarına, kapılardan transistöre ve çipe: seslendirmeli animasyon.
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
  };
  const FIRE = [255, 150, 60];
  const COOL = [111, 128, 168];
  const DIGI = [124, 200, 255];

  // Sahneler ve koreografi süreleri (saniye). Gerçek süreler seslendirme beklemeleriyle uzar.
  const SCENES = [
    { id: 'open', base: 8, title: 'Açılış', draw: sceneOpen, fadeIn: 0.6 },
    { id: 'recap', base: 12, title: 'Elektrik nasıl düşünür?', draw: sceneRecap },
    { id: 'circuit', base: 16, title: 'Devre ve anahtar', draw: sceneCircuit },
    { id: 'and', base: 18, title: 'VE kapısı', draw: sceneAnd },
    { id: 'or', base: 12, title: 'VEYA kapısı', draw: sceneOr },
    { id: 'not', base: 16, title: 'DEĞİL kapısı', draw: sceneNot },
    { id: 'why', base: 18, title: 'Cümleden devreye', draw: sceneWhy },
    { id: 'boole', base: 16, title: 'Boole ve Shannon', draw: sceneBoole },
    { id: 'table', base: 20, title: 'Doğruluk tablosu', draw: sceneTable },
    { id: 'xor', base: 14, title: 'Özel veya', draw: sceneXor },
    { id: 'adder', base: 18, title: 'Kapılar toplama yapar', draw: sceneAdder },
    { id: 'turn', base: 16, title: 'Anahtarı kim çevirir?', draw: sceneTurn },
    { id: 'tubes', base: 12, title: 'Tüpten transistöre', draw: sceneTubes },
    { id: 'chip', base: 14, title: 'Kum tanesindeki şehir', draw: sceneChip },
    { id: 'growth', base: 12, title: 'En hızlı büyüme', draw: sceneGrowth },
    { id: 'scale', base: 16, title: 'Sayılamayan', draw: sceneScale },
    { id: 'end', base: 6, title: 'Hayranlık', draw: sceneEnd },
    { id: 'close', base: 4, title: 'Kapanış', draw: sceneClose, fadeOut: 1.4 },
  ];

  // Seslendirme vuruşları: [sahne, başlangıç, bitiş, donma anı] (koreografi zamanı).
  const BEATS = {
    'open.title': ['open', 3.3, 7.6, 7.0],
    'recap.numbers': ['recap', 0.3, 4.0, 3.6],
    'recap.question': ['recap', 4.1, 8.0, 7.6],
    'recap.bell': ['recap', 8.1, 12.0, 11.4],
    'circuit.loop': ['circuit', 0.3, 4.0, 3.6],
    'circuit.break': ['circuit', 4.1, 7.0, 6.6],
    'circuit.switch': ['circuit', 7.1, 11.5, 11.0],
    'circuit.bits': ['circuit', 11.6, 16.0, 15.3],
    'and.setup': ['and', 0.3, 4.0, 3.6],
    'and.cases': ['and', 4.1, 9.0, 8.6],
    'and.why': ['and', 9.1, 12.5, 12.1],
    'and.name': ['and', 12.6, 18.0, 17.3],
    'or.setup': ['or', 0.3, 4.0, 3.6],
    'or.cases': ['or', 4.1, 8.0, 7.6],
    'or.name': ['or', 8.1, 12.0, 11.3],
    'not.fridge': ['not', 0.3, 5.5, 5.1],
    'not.name': ['not', 5.6, 10.0, 9.6],
    'not.three': ['not', 10.1, 16.0, 15.3],
    'why.pause': ['why', 0.3, 3.5, 3.1],
    'why.alarm': ['why', 3.6, 8.5, 8.1],
    'why.fire': ['why', 8.6, 13.0, 12.6],
    'why.bridge': ['why', 13.1, 18.0, 17.3],
    'boole.who': ['boole', 0.3, 4.0, 3.6],
    'boole.algebra': ['boole', 4.1, 8.0, 7.6],
    'boole.shannon': ['boole', 8.1, 12.0, 11.6],
    'boole.lesson': ['boole', 12.1, 16.0, 15.3],
    'table.intro': ['table', 0.3, 3.5, 3.1],
    'table.read': ['table', 3.6, 7.0, 6.6],
    'table.and': ['table', 7.1, 10.0, 9.6],
    'table.or': ['table', 10.1, 13.0, 12.6],
    'table.not': ['table', 13.1, 15.5, 15.1],
    'table.mult': ['table', 15.6, 20.0, 19.3],
    'xor.intro': ['xor', 0.3, 3.5, 3.1],
    'xor.stairs': ['xor', 3.6, 9.0, 8.6],
    'xor.rule': ['xor', 9.1, 14.0, 13.3],
    'adder.intro': ['adder', 0.3, 3.5, 3.1],
    'adder.cases': ['adder', 3.6, 8.5, 8.1],
    'adder.gates': ['adder', 8.6, 13.0, 12.6],
    'adder.chain': ['adder', 13.1, 18.0, 17.3],
    'turn.hand': ['turn', 0.3, 3.5, 3.1],
    'turn.chain': ['turn', 3.6, 8.0, 7.6],
    'turn.transistor': ['turn', 8.1, 12.0, 11.6],
    'turn.faucet': ['turn', 12.1, 16.0, 15.3],
    'tubes.before': ['tubes', 0.3, 4.0, 3.6],
    'tubes.eniac': ['tubes', 4.1, 8.0, 7.6],
    'tubes.small': ['tubes', 8.1, 12.0, 11.3],
    'chip.print': ['chip', 0.3, 4.0, 3.6],
    'chip.silicon': ['chip', 4.1, 9.0, 8.6],
    'chip.name': ['chip', 9.1, 14.0, 13.3],
    'growth.intro': ['growth', 0.3, 3.0, 2.6],
    'growth.list': ['growth', 3.1, 7.5, 7.1],
    'growth.doubling': ['growth', 7.6, 12.0, 11.3],
    'scale.people': ['scale', 0.3, 4.0, 3.6],
    'scale.phone': ['scale', 4.1, 8.0, 7.6],
    'scale.speed': ['scale', 8.1, 12.0, 11.6],
    'scale.mosque': ['scale', 12.1, 16.0, 15.3],
    'end.quote': ['end', 0.3, 6.0, 5.3],
    'close.end': ['close', 0.3, 4.0, 3.2],
  };

  // Kalabalık animasyonları yavaşlatma (vuruş → kat)
  const PACE = {};
  // Anlatıcı sustuktan sonra görüntünün biraz daha durması (sn): önemli sonuçlar ve sahne sonları
  const PAUSE = {
    'recap.bell': 0.8,
    'circuit.bits': 0.6,
    'and.name': 0.8,
    'or.name': 0.8,
    'not.three': 1.0,
    'why.bridge': 1.0,
    'boole.lesson': 0.8,
    'table.mult': 1.0,
    'xor.rule': 0.8,
    'adder.chain': 1.0,
    'turn.faucet': 0.8,
    'tubes.small': 0.8,
    'chip.name': 1.0,
    'growth.doubling': 0.8,
    'scale.mosque': 1.0,
    'end.quote': 1.4,
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

  // ---------------------------------------------------------------------------
  // 0 · Açılış: taşa kazınan devre izleri
  // ---------------------------------------------------------------------------

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

  function sceneOpen(ctx, lt) {
    const cx = W / 2;
    drawStone(ctx, cx, 560, 1260, 640, progress(lt, 0.2, 1.0), 2);
    const dimT = 1 - 0.6 * progress(lt, 3.0, 4.0);
    drawTraces(ctx, lt, 0.6, 2.6, dimT);
    const a1 = progress(lt, 3.3, 4.3, ease.out);
    text(ctx, 'BİRİNCİ KAPI · DÜNYAYI SAYIYA ÇEVİRMEK', cx, 380, { size: 26, weight: 600, spacing: 10, color: C.muted, alpha: a1 });
    const a2 = progress(lt, 3.6, 4.8, ease.out);
    text(ctx, '2', cx, 470 + (1 - a2) * 20, { size: 90, family: 'display', weight: 900, color: C.fire, alpha: a2 });
    text(ctx, 'TAŞA KAZINAN MANTIK', cx, 600 + (1 - a2) * 30, { size: 120, family: 'display', weight: 900, color: C.cream, alpha: a2, glow: 'rgba(0,0,0,0.6)', glowBlur: 20 });
    const a3 = progress(lt, 4.6, 5.6, ease.out);
    runs(ctx, [
      ['VE', { size: 44, family: 'mono', weight: 700, color: C.fire }],
      ['  ·  ', { size: 44, family: 'mono', color: C.dim }],
      ['VEYA', { size: 44, family: 'mono', weight: 700, color: C.fire }],
      ['  ·  ', { size: 44, family: 'mono', color: C.dim }],
      ['DEĞİL', { size: 44, family: 'mono', weight: 700, color: C.off }],
    ], cx, 730, { alpha: a3 });
  }

  // ---------------------------------------------------------------------------
  // 1 · Hatırlatma ve soru
  // ---------------------------------------------------------------------------

  function sceneRecap(ctx, lt, t) {
    kicker(ctx, 'BİR ÖNCEKİ BÖLÜMDE', lt, 8.0);
    const nA = vis(lt, 0.2, 4.0, 0.5, 0.4);
    if (nA > 0) {
      const bits = '01000001';
      const lit = after(t, 'recap-numbers', 3, 0.5);
      for (let j = 0; j < 8; j++) {
        const x = W / 2 + (j - 3.5) * 130;
        drawBulb(ctx, x, 420, 42, bits[j] === '1' ? lit : 0, nA * progress(lt, 0.4 + j * 0.06, 0.8 + j * 0.06));
      }
      runs(ctx, bitRuns(bits, 72), W / 2, 600, { alpha: nA * after(t, 'recap-numbers', 4, 0.6) });
      runs(ctx, [['= 65 = ', { size: 54, family: 'mono', weight: 700, color: C.muted }], ['A', { size: 64, family: 'display', weight: 900, color: C.cream }]], W / 2, 720, { alpha: nA * after(t, 'recap-numbers', 4, 0.6) });
      text(ctx, 'var · yok', W / 2, 300, { size: 34, family: 'serif', italic: true, color: C.muted, alpha: nA * lit });
    }
    const qA = vis(lt, 4.1, 12.0, 0.5, 0.5);
    if (qA > 0) {
      text(ctx, 'Şimdi çok daha şaşırtıcı bir soru:', W / 2, 300, { size: 38, color: C.muted, alpha: qA * after(t, 'recap-question', 0, 0.6) });
      const qq = after(t, 'recap-question', 1, 0.8);
      text(ctx, 'Elektrik nasıl olur da düşünür?', W / 2, 420 - (1 - qq) * 16, { size: 96, family: 'serif', color: C.cream, alpha: qA * qq });
      // kapı zili: düğme ve zil
      const bA = qA * after(t, 'recap-bell', 0, 0.6);
      if (bA > 0) {
        const ring = progress(t, cue('recap-bell', 1), cue('recap-bell', 1) + 1.6, ease.linear);
        const k = ring > 0 && ring < 1 ? Math.sin(ring * Math.PI) : 0;
        drawIcon(ctx, 'button', W / 2 - 260, 690, 1.2, C.cream, bA, k);
        drawWire(ctx, [[W / 2 - 210, 690], [W / 2 + 200, 690]], k, t, bA, 5);
        drawIcon(ctx, 'bell', W / 2 + 260, 680, 1.5, k > 0 ? C.flame : C.cream, bA, k);
        text(ctx, 'bir kapı zilinden bile basit', W / 2, 830, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: bA * after(t, 'recap-bell', 1, 0.6) });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 2 · Devre ve anahtar (ön bilgi)
  // ---------------------------------------------------------------------------

  const CIR = { bx: 560, top: 330, right: 1380, bottom: 800, mid: 565, gapL: 900, gapR: 1010 };

  function circuitStates() {
    return [
      [cue('circuit-switch', 3), [1]],
      [cue('circuit-bits', 2), [0]],
      [cue('circuit-bits', 4), [1]],
      [cue('circuit-bits', 5), [0]],
    ];
  }

  function sceneCircuit(ctx, lt, t) {
    kicker(ctx, 'DEVRE NEDİR?', lt, 16);
    const a = vis(lt, 0.2, 16, 0.5, 0.5);
    if (a <= 0) return;
    const { bx, top, right, bottom, mid, gapL, gapR } = CIR;
    const draw = after(t, 'circuit-loop', 1, 2.4, ease.inOut);
    const flowing = after(t, 'circuit-loop', 3, 0.5);
    const gap = after(t, 'circuit-break', 0, 0.7, ease.inOut);
    const sw = after(t, 'circuit-switch', 0, 0.6);
    const on = stateAt(circuitStates(), t, 0);
    // akım: yol tamamken; yol koptuysa yalnızca anahtar kapatınca
    const live = gap < 0.05 ? flowing : (sw > 0.5 ? on : 0) * flowing;
    const half = 55 * gap;
    const cx = (gapL + gapR) / 2;
    const segA = [[bx, mid - 75], [bx, top], [cx - half, top]];
    const segB = [[cx + half, top], [right, top], [right, mid - 46]];
    const segC = [[right, mid + 46], [right, bottom], [bx, bottom], [bx, mid + 75]];
    drawBattery(ctx, bx, mid, a * progress(lt, 0.3, 0.9));
    for (const seg of [segA, segB, segC]) {
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.strokeStyle = C.wire;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      partialPath(ctx, seg, pathLength(seg) * draw);
      ctx.restore();
      if (draw >= 1) drawWire(ctx, seg, live, t, a);
    }
    drawBulb(ctx, right, mid, 46, live, a * progress(lt, 0.5, 1.1));
    text(ctx, 'lamba', right + 80, mid, { size: 28, color: C.muted, align: 'left', alpha: a });
    // kopukluk ve anahtar
    if (gap > 0.05 && sw < 1) {
      text(ctx, 'yol koptu', cx, top - 60, { size: 34, family: 'serif', italic: true, color: C.error, alpha: a * gap * (1 - sw) });
    }
    drawSwitch(ctx, gapL, gapR, top, on, a * sw);
    text(ctx, 'anahtar', cx, top - 70, { size: 32, weight: 600, color: C.cream, alpha: a * sw });
    // devre etiketi: dolaşan ok
    const lab = a * after(t, 'circuit-loop', 4, 0.6) * (1 - gap);
    text(ctx, 'DEVRE: kesintisiz bir yol', (bx + right) / 2, (top + bottom) / 2, { size: 46, family: 'display', weight: 800, color: C.cream, alpha: lab });
    // açık / kapalı tanımı
    const def = a * after(t, 'circuit-switch', 3, 0.6);
    if (def > 0) {
      const s = on > 0.5;
      text(ctx, s ? 'AÇIK: akım geçer' : 'KAPALI: akım geçmez', cx, (top + bottom) / 2 - 20, { size: 44, family: 'display', weight: 800, color: s ? C.fire : C.off, alpha: def });
    }
    const bits = a * after(t, 'circuit-bits', 0, 0.5);
    if (bits > 0) {
      const s = on > 0.5;
      text(ctx, s ? '1' : '0', cx, top + 90, { size: 90, family: 'mono', weight: 700, color: s ? C.fire : C.off, alpha: bits });
      text(ctx, live > 0.5 ? '1' : '0', right - 120, mid, { size: 90, family: 'mono', weight: 700, color: live > 0.5 ? C.flame : C.off, alpha: a * after(t, 'circuit-bits', 4, 0.5) });
    }
  }

  // ---------------------------------------------------------------------------
  // 3 · VE kapısı: arka arkaya iki anahtar
  // ---------------------------------------------------------------------------

  const AND = { bx: 330, top: 360, right: 1130, bottom: 820, mid: 590, a1: 520, a2: 640, b1: 790, b2: 910 };

  function andStates() {
    return [
      [cue('and-cases', 0), [0, 0]],
      [cue('and-cases', 2), [1, 0]],
      [cue('and-cases', 4), [0, 1]],
      [cue('and-cases', 6), [1, 1]],
      [cue('and-why', 2), [1, 0]],
      [cue('and-name', 1), [1, 1]],
    ];
  }

  function seriesCircuit(ctx, t, alpha, A, B, L, opts = {}) {
    const { bx, top, right, bottom, mid, a1, a2, b1, b2 } = L;
    const closed = Math.min(A, B);
    const live = closed > 0.5 ? closed : 0;
    drawBattery(ctx, bx, mid, alpha);
    drawWire(ctx, [[bx, mid - 75], [bx, top], [a1, top]], live, t, alpha);
    drawWire(ctx, [[a2, top], [b1, top]], live, t, alpha);
    drawWire(ctx, [[b2, top], [right, top], [right, mid - 46]], live, t, alpha);
    drawWire(ctx, [[right, mid + 46], [right, bottom], [bx, bottom], [bx, mid + 75]], live, t, alpha);
    drawSwitch(ctx, a1, a2, top, A, alpha, { label: opts.labels ? opts.labels[0] : 'A', state: opts.state !== false, size: opts.labelSize });
    drawSwitch(ctx, b1, b2, top, B, alpha, { label: opts.labels ? opts.labels[1] : 'B', state: opts.state !== false, size: opts.labelSize });
    if (opts.load) opts.load(right, mid, live);
    else drawBulb(ctx, right, mid, 46, live, alpha);
    return live;
  }

  function sceneAnd(ctx, lt, t) {
    kicker(ctx, 'İKİ ANAHTARLI KAPI', lt, 18);
    const a = vis(lt, 0.2, 18, 0.5, 0.5);
    if (a <= 0) return;
    const S = andStates();
    const A = stateAt(S, t, 0);
    const B = stateAt(S, t, 1);
    const alpha = a * progress(lt, 0.3, 1.0);
    const live = seriesCircuit(ctx, t, alpha, A, B, AND);
    text(ctx, 'arka arkaya: tek yol', (AND.bx + AND.right) / 2, AND.top + 110, { size: 34, family: 'serif', italic: true, color: C.muted, alpha: a * after(t, 'and-setup', 2, 0.6) * (1 - after(t, 'and-cases', 0, 0.4)) });
    // tek yol vurgusu ve kopukluk işareti
    const why = a * between(t, cue('and-why', 0), cue('and-name', 0), 0.4, 0.4);
    if (why > 0) {
      ctx.save();
      ctx.globalAlpha *= why * 0.5;
      ctx.strokeStyle = C.flame;
      ctx.lineWidth = 16;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const { bx, top, right, bottom, mid } = AND;
      ctx.moveTo(bx, mid - 75);
      ctx.lineTo(bx, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, bottom);
      ctx.lineTo(bx, bottom);
      ctx.lineTo(bx, mid + 75);
      ctx.stroke();
      ctx.restore();
      if (B < 0.5 && t > cue('and-why', 2)) text(ctx, '✗', (AND.b1 + AND.b2) / 2, AND.top - 120, { size: 64, weight: 800, color: C.error, alpha: why });
      text(ctx, 'yol kopar', (AND.b1 + AND.b2) / 2, AND.top + 110, { size: 34, family: 'serif', italic: true, color: C.error, alpha: why * after(t, 'and-why', 3, 0.5) });
    }
    // sonuç tablosu: söylenen sırayla
    const rows = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 1]];
    miniTable(ctx, 1400, 300, ['A', 'B', 'lamba'], rows, a * after(t, 'and-cases', 0, 0.5), (j) => after(t, 'and-cases', 2 * j + 1, 0.4));
    // VE kapısı adı ve simgesi
    const nm = a * after(t, 'and-name', 1, 0.6);
    if (nm > 0) {
      text(ctx, 'VE kapısı', (AND.bx + AND.right) / 2, 960, { size: 64, family: 'display', weight: 900, color: C.fire, alpha: nm });
      drawGate(ctx, 'and', 1520, 820, 1.1, a * after(t, 'and-gate', 2, 0.6), C.cream, live);
      text(ctx, 'A', 1390, 790, { size: 28, family: 'mono', weight: 700, color: C.muted, alpha: a * after(t, 'and-gate', 2, 0.6) });
      text(ctx, 'B', 1390, 850, { size: 28, family: 'mono', weight: 700, color: C.muted, alpha: a * after(t, 'and-gate', 2, 0.6) });
      const door = after(t, 'and-gate', 3, 1.2, ease.inOut);
      drawIcon(ctx, 'door', 1730, 820, 0.9, C.flame, a * after(t, 'and-gate', 3, 0.5), live > 0.5 ? door : 0);
    }
  }

  // ---------------------------------------------------------------------------
  // 4 · VEYA kapısı: yan yana iki anahtar
  // ---------------------------------------------------------------------------

  const OR = { bx: 330, top: 330, low: 520, right: 1130, bottom: 820, mid: 600, split: 470, join: 990, s1: 660, s2: 780 };

  function orStates() {
    return [
      [cue('or-cases', 0), [0, 0]],
      [cue('or-cases', 1), [1, 0]],
      [cue('or-cases', 2), [0, 1]],
      [cue('or-cases', 3), [1, 1]],
      [cue('or-name', 0), [1, 0]],
    ];
  }

  function parallelCircuit(ctx, t, alpha, A, B, L, opts = {}) {
    const { bx, top, low, right, bottom, mid, split, join, s1, s2 } = L;
    const la = A > 0.5 ? A : 0;
    const lb = B > 0.5 ? B : 0;
    const live = Math.max(la, lb);
    drawBattery(ctx, bx, mid, alpha);
    drawWire(ctx, [[bx, mid - 75], [bx, top], [split, top]], live, t, alpha);
    drawWire(ctx, [[split, top], [s1, top]], la, t, alpha);
    drawWire(ctx, [[s2, top], [join, top]], la, t, alpha);
    drawWire(ctx, [[split, top], [split, low], [s1, low]], lb, t, alpha);
    drawWire(ctx, [[s2, low], [join, low], [join, top]], lb, t, alpha);
    drawWire(ctx, [[join, top], [right, top], [right, mid - 46]], live, t, alpha);
    drawWire(ctx, [[right, mid + 46], [right, bottom], [bx, bottom], [bx, mid + 75]], live, t, alpha);
    drawSwitch(ctx, s1, s2, top, A, alpha, { label: opts.labels ? opts.labels[0] : 'A', state: opts.state !== false, size: opts.labelSize });
    drawSwitch(ctx, s1, s2, low, B, alpha, { label: opts.labels ? opts.labels[1] : 'B', state: opts.state !== false, size: opts.labelSize });
    if (opts.load) opts.load(right, mid, live);
    else drawBulb(ctx, right, mid, 46, live, alpha);
    return live;
  }

  function sceneOr(ctx, lt, t) {
    kicker(ctx, 'VEYA KAPISI', lt, 12);
    const a = vis(lt, 0.2, 12, 0.5, 0.5);
    if (a <= 0) return;
    const S = orStates();
    const A = stateAt(S, t, 0);
    const B = stateAt(S, t, 1);
    const live = parallelCircuit(ctx, t, a * progress(lt, 0.3, 1.0), A, B, OR);
    const two = a * after(t, 'or-setup', 2, 0.6) * (1 - after(t, 'or-cases', 1, 0.4));
    if (two > 0) {
      text(ctx, '1. yol', OR.join + 60, OR.top - 40, { size: 30, family: 'serif', italic: true, color: C.flame, alpha: two });
      text(ctx, '2. yol', OR.join + 60, OR.low + 40, { size: 30, family: 'serif', italic: true, color: C.flame, alpha: two });
    }
    const rows = [[0, 0, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
    miniTable(ctx, 1400, 300, ['A', 'B', 'lamba'], rows, a * after(t, 'or-cases', 0, 0.5), (j) => after(t, 'or-cases', j, 0.4));
    const nm = a * after(t, 'or-name', 2, 0.6);
    if (nm > 0) {
      text(ctx, 'VEYA kapısı', (OR.bx + OR.right) / 2, 960, { size: 64, family: 'display', weight: 900, color: C.fire, alpha: nm });
      drawGate(ctx, 'or', 1520, 820, 1.1, nm, C.cream, live);
    }
    text(ctx, 'herhangi biri açıksa: yanar', (OR.bx + OR.right) / 2, 960, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: a * after(t, 'or-name', 0, 0.5) * (1 - nm) });
  }

  // ---------------------------------------------------------------------------
  // 5 · DEĞİL kapısı: buzdolabı ışığı
  // ---------------------------------------------------------------------------

  function fridgeDoor(t) {
    // kapı: açık (1) → kapanır (0) → yeniden açılır
    return [[0, [1]], [cue('not-fridge', 3), [0]], [cue('not-fridge', 5), [1]]];
  }

  function drawFridge(ctx, x, y, open, alpha) {
    if (alpha <= 0.002) return;
    const w = 300;
    const h = 560;
    const lightK = clamp((open - 0.15) / 0.3);
    ctx.save();
    ctx.globalAlpha *= alpha;
    // gövde ve iç
    roundRect(ctx, x, y, w, h, 18);
    ctx.fillStyle = '#d7dde6';
    ctx.fill();
    roundRect(ctx, x + 16, y + 16, w - 32, h - 32, 10);
    ctx.fillStyle = lightK > 0 ? `rgba(255,236,190,${0.25 + 0.6 * lightK})` : '#1a2030';
    ctx.fill();
    ctx.fillStyle = 'rgba(120,130,150,0.6)';
    for (const sy of [0.36, 0.58, 0.8]) ctx.fillRect(x + 22, y + h * sy, w - 44, 5);
    ctx.restore();
    drawBulb(ctx, x + w / 2, y + 60, 20, lightK, alpha);
    // düğme (kapı kapanınca basılır)
    ctx.save();
    ctx.globalAlpha *= alpha;
    const press = 1 - clamp(open / 0.15);
    ctx.fillStyle = C.ember;
    ctx.fillRect(x + w - 30 + 8 * press, y + 120, 16 - 8 * press, 26);
    // kapı: menteşe solda; açıldıkça genişliği daralır ve sola kayar
    const dw = w * (1 - 0.82 * open);
    const dx = x - (w - dw) * 0.15 * open;
    roundRect(ctx, dx - 6 * open * 10, y - 4, dw, h + 8, 18);
    ctx.fillStyle = `rgb(${Math.round(200 + 30 * (1 - open))},${Math.round(206 + 26 * (1 - open))},${Math.round(216 + 24 * (1 - open))})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,50,70,0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#8b95a8';
    roundRect(ctx, dx - 60 * open + dw - 34, y + 160, 10, 140, 5);
    ctx.fill();
    ctx.restore();
  }

  const NOT = { bx: 1000, top: 360, right: 1620, bottom: 820, mid: 590, s1: 1250, s2: 1370 };

  function notStates() {
    return [
      [cue('not-name', 0), [1]],
      [cue('not-name', 1), [0]],
      [cue('not-name', 3), [1]],
      [cue('not-name', 4), [0]],
    ];
  }

  function sceneNot(ctx, lt, t) {
    kicker(ctx, 'DEĞİL KAPISI', lt, 16);
    const a = vis(lt, 0.2, 10.1, 0.5, 0.5);
    if (a > 0) {
      const open = stateAt(fridgeDoor(t), t, 0, 0.9, 1);
      const fa = a * after(t, 'not-fridge', 2, 0.6);
      drawFridge(ctx, 330, 270, open, fa);
      text(ctx, open > 0.5 ? 'kapı açık → ışık yanar' : 'kapı düğmeye basar → ışık söner', 480, 900, { size: 32, family: 'serif', italic: true, color: open > 0.5 ? C.flame : C.off, alpha: fa * after(t, 'not-fridge', 3, 0.5) });
      text(ctx, 'girişi tersine çeviren düzenek', W / 2, 200, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: a * after(t, 'not-fridge', 1, 0.6) });
      // ters anahtarlı devre: giriş 1 iken kol kalkar
      const ca = a * after(t, 'not-name', 0, 0.6);
      if (ca > 0) {
        const In = stateAt(notStates(), t, 0);
        const on = 1 - In;
        const live = on > 0.5 ? on : 0;
        const { bx, top, right, bottom, mid, s1, s2 } = NOT;
        drawBattery(ctx, bx, mid, ca);
        drawWire(ctx, [[bx, mid - 75], [bx, top], [s1, top]], live, t, ca);
        drawWire(ctx, [[s2, top], [right, top], [right, mid - 46]], live, t, ca);
        drawWire(ctx, [[right, mid + 46], [right, bottom], [bx, bottom], [bx, mid + 75]], live, t, ca);
        drawSwitch(ctx, s1, s2, top, on, ca);
        // basıldıkça kolu kaldıran düğme (giriş)
        ctx.save();
        ctx.globalAlpha *= ca;
        ctx.fillStyle = C.ember;
        const py = top + 60 - 40 * In;
        ctx.fillRect((s1 + s2) / 2 + 20, py, 18, 60);
        ctx.restore();
        text(ctx, `giriş A = ${In > 0.5 ? 1 : 0}`, (s1 + s2) / 2, top - 80, { size: 36, family: 'mono', weight: 700, color: In > 0.5 ? C.fire : C.off, alpha: ca });
        drawBulb(ctx, right, mid, 46, live, ca);
        text(ctx, `çıkış = ${live > 0.5 ? 1 : 0}`, right - 70, mid + 110, { size: 36, family: 'mono', weight: 700, color: live > 0.5 ? C.flame : C.off, align: 'right', alpha: ca });
        const nm = a * after(t, 'not-name', 2, 0.6);
        text(ctx, 'DEĞİL kapısı', (bx + right) / 2, 960, { size: 64, family: 'display', weight: 900, color: C.fire, alpha: nm });
      }
    }
    // Üç kapı
    const tA = vis(lt, 10.1, 16, 0.5, 0.5);
    if (tA > 0) {
      text(ctx, 'Hepsi bu kadar.', W / 2, 220, { size: 44, family: 'serif', italic: true, color: C.muted, alpha: tA * after(t, 'not-three', 0, 0.5) });
      ['and', 'or', 'not'].forEach((k, i) => {
        const ga = tA * after(t, 'not-three', i + 1, 0.6);
        const x = W / 2 + (i - 1) * 460;
        text(ctx, GATE_NAMES[k], x, 380, { size: 72, family: 'display', weight: 900, color: k === 'not' ? C.off : C.fire, alpha: ga });
        drawGate(ctx, k, x, 560, 1.2, tA * after(t, 'not-three', 6, 0.6) * ga, C.cream, 0);
      });
      text(ctx, 'bilişimin bütün mantığı bu üç düzenekten kurulur', W / 2, 760, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: tA * after(t, 'not-three', 4, 0.6) });
      text(ctx, 'devre şemalarındaki simgeleri', W / 2, 840, { size: 30, color: C.muted, alpha: tA * after(t, 'not-three', 6, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 6 · Cümleden devreye
  // ---------------------------------------------------------------------------

  const WHY_S = { bx: 420, top: 460, right: 1400, bottom: 880, mid: 670, a1: 640, a2: 780, b1: 980, b2: 1120 };
  const WHY_P = { bx: 420, top: 440, low: 640, right: 1400, bottom: 900, mid: 700, split: 560, join: 1180, s1: 800, s2: 920 };

  function alarmStates() {
    return [[cue('why-alarm', 4), [0, 0]], [cue('why-alarm', 5), [1, 0]], [cue('why-alarm', 6), [1, 1]]];
  }
  function fireStates() {
    return [[cue('why-fire', 3), [0, 0]], [cue('why-fire', 4), [1, 0]], [cue('why-fire', 5), [0, 1]]];
  }

  function sentence(ctx, parts, y, alpha) {
    runs(ctx, parts.map(([s, c, w]) => [s, { size: 50, family: 'serif', italic: !w, weight: w ? 700 : 400, color: c }]), W / 2, y, { alpha });
  }

  function sceneWhy(ctx, lt, t) {
    kicker(ctx, 'BUNUN NEDEN DEVRİMSEL OLDUĞU', lt, 18);
    const pA = vis(lt, 0.2, 3.6, 0.5, 0.4);
    if (pA > 0) {
      text(ctx, 'Bir an durup düşünelim.', W / 2, 360, { size: 44, family: 'serif', italic: true, color: C.muted, alpha: pA * after(t, 'why-pause', 0, 0.5) });
      runs(ctx, [
        ['cümle', { size: 96, family: 'display', weight: 900, color: C.cream }],
        ['  →  ', { size: 96, family: 'display', weight: 300, color: C.muted }],
        ['elektrik', { size: 96, family: 'display', weight: 900, color: C.fire }],
      ], W / 2, 560, { alpha: pA * after(t, 'why-pause', 3, 0.7) });
    }
    const aA = vis(lt, 3.6, 8.6, 0.5, 0.4);
    if (aA > 0) {
      const S = alarmStates();
      const A = stateAt(S, t, 0);
      const B = stateAt(S, t, 1);
      sentence(ctx, [['“Kapı açıksa ', C.cream], ['VE', C.fire, true], [' alarm kuruluysa, sireni çal.”', C.cream]], 220, aA * after(t, 'why-alarm', 0, 0.6));
      text(ctx, 'bir insan cümlesi', W / 2, 290, { size: 30, color: C.muted, alpha: aA * after(t, 'why-alarm', 2, 0.5) });
      const ca = aA * after(t, 'why-alarm', 3, 0.6);
      if (ca > 0) {
        seriesCircuit(ctx, t, ca, A, B, WHY_S, {
          labels: ['kapı açık', 'alarm kurulu'],
          labelSize: 34,
          load: (x, y, live) => {
            const ring = live > 0.5 ? 0.6 + 0.4 * Math.sin(clock('why', t) * 12) : 0;
            drawIcon(ctx, 'siren', x, y, 1.3, live > 0.5 ? C.error : C.cream, ca, ring);
            if (live > 0.5) glow(ctx, x, y - 10, 160, [255, 84, 104], 0.3 * ca);
            text(ctx, 'siren', x + 90, y + 10, { size: 30, color: C.muted, align: 'left', alpha: ca });
          },
        });
      }
    }
    const fA = vis(lt, 8.6, 13.1, 0.5, 0.4);
    if (fA > 0) {
      const S = fireStates();
      const A = stateAt(S, t, 0);
      const B = stateAt(S, t, 1);
      sentence(ctx, [['“Yangın algılandıysa ', C.cream], ['VEYA', C.fire, true], [' düğmeye basıldıysa, kapıları aç.”', C.cream]], 220, fA * after(t, 'why-fire', 0, 0.6));
      text(ctx, 'bu da bir insan cümlesi', W / 2, 290, { size: 30, color: C.muted, alpha: fA * after(t, 'why-fire', 2, 0.5) });
      const ca = fA * after(t, 'why-fire', 3, 0.6);
      if (ca > 0) {
        parallelCircuit(ctx, t, ca, A, B, WHY_P, {
          labels: ['yangın', 'düğme'],
          labelSize: 34,
          load: (x, y, live) => {
            const open = live > 0.5 ? clamp((t - cue('why-fire', 4)) / 1.0) : 0;
            drawIcon(ctx, 'door', x, y, 1.3, live > 0.5 ? C.ok : C.cream, ca, open);
            text(ctx, 'kapılar', x + 90, y + 10, { size: 30, color: C.muted, align: 'left', alpha: ca });
          },
        });
      }
    }
    const bA = vis(lt, 13.1, 18, 0.5, 0.5);
    if (bA > 0) {
      const L = 520;
      const R = 1400;
      text(ctx, 'MANTIK', L, 260, { size: 44, family: 'display', weight: 900, spacing: 6, color: C.cream, alpha: bA * after(t, 'why-bridge', 1, 0.5) });
      text(ctx, 'ELEKTRİK', R, 260, { size: 44, family: 'display', weight: 900, spacing: 6, color: C.fire, alpha: bA * after(t, 'why-bridge', 1, 0.5) });
      // köprü
      const br = after(t, 'why-bridge', 1, 1.4, ease.inOut);
      if (br > 0) {
        ctx.save();
        ctx.globalAlpha *= bA;
        ctx.strokeStyle = C.flame;
        ctx.lineWidth = 6;
        ctx.beginPath();
        const steps = 60;
        for (let i = 0; i <= steps * br; i++) {
          const u = i / steps;
          const x = lerp(L + 140, R - 160, u);
          const y = 260 - Math.sin(u * Math.PI) * 120;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }
      [['VE', 'arka arkaya'], ['VEYA', 'yan yana'], ['DEĞİL', 'ters anahtar']].forEach(([l, r], i) => {
        const ra = bA * after(t, 'why-bridge', 2, 0.5 + i * 0.4);
        const y = 420 + i * 120;
        text(ctx, l, L, y, { size: 56, family: 'mono', weight: 700, color: C.fire, alpha: ra });
        text(ctx, r, R, y, { size: 46, family: 'serif', italic: true, color: C.cream, alpha: ra });
        ctx.save();
        ctx.globalAlpha *= ra;
        ctx.strokeStyle = C.dim;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        line(ctx, L + 120, y, R - 180, y);
        ctx.restore();
        text(ctx, '⟷', W / 2, y, { size: 40, color: C.muted, alpha: ra });
      });
      text(ctx, 'her mantıklı cümle → elektrikle çalışan bir düzenek', W / 2, 860, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: bA * after(t, 'why-bridge', 4, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 7 · Boole ve Shannon
  // ---------------------------------------------------------------------------

  function sceneBoole(ctx, lt, t) {
    kicker(ctx, 'KÂĞIT ÜZERİNDE BİR KÖPRÜ', lt, 16);
    const pa = vis(lt, 0.2, 12.1, 0.5, 0.5);
    if (pa > 0) {
      const ca = pa * after(t, 'boole-who', 1, 0.7);
      ctx.save();
      ctx.globalAlpha *= ca;
      ctx.translate(560, 560 + (1 - ca) * 20);
      ctx.rotate(-0.02);
      paperCard(ctx, -380, -330, 760, 660);
      ctx.restore();
      if (ca > 0) {
        ctx.save();
        ctx.translate(560, 560 + (1 - ca) * 20);
        ctx.rotate(-0.02);
        text(ctx, 'GEORGE BOOLE', -320, -270, { size: 30, weight: 800, spacing: 8, color: C.ember, align: 'left', alpha: ca });
        text(ctx, '1815 – 1864 · İngiliz matematikçi', -320, -225, { size: 26, color: C.inkSoft, align: 'left', alpha: ca });
        text(ctx, 'Düşüncenin Yasaları, 1854', -320, -170, { size: 34, family: 'serif', italic: true, color: C.ink, align: 'left', alpha: ca * after(t, 'boole-who', 3, 0.6) });
        // el yazısı satırları: kâğıt üzerinde hesap
        const hand = after(t, 'boole-who', 3, 2.2, ease.linear);
        ctx.strokeStyle = 'rgba(27,31,42,0.35)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const w = 560 * clamp(hand * 3 - i);
          if (w <= 0) continue;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 6) {
            const y = -120 + i * 34 + Math.sin(x / 9 + i) * 3;
            if (x === 0) ctx.moveTo(-320 + x, y);
            else ctx.lineTo(-320 + x, y);
          }
          ctx.stroke();
        }
        const ab = after(t, 'boole-algebra', 1, 0.6);
        text(ctx, 'cebir: harflerle hesap', -320, 10, { size: 32, family: 'serif', italic: true, color: C.inkSoft, align: 'left', alpha: ca * ab });
        runs(ctx, [['doğru = ', { size: 40, family: 'serif', color: C.ink }], ['1', { size: 44, family: 'mono', weight: 700, color: C.ember }], ['     yanlış = ', { size: 40, family: 'serif', color: C.ink }], ['0', { size: 44, family: 'mono', weight: 700, color: '#4b5a80' }]], -320, 90, { align: 'left', alpha: ca * after(t, 'boole-algebra', 4, 0.6) });
        runs(ctx, [['VE:  ', { size: 40, family: 'display', weight: 800, color: C.ember }], ['x · y', { size: 46, family: 'serif', italic: true, color: C.ink }], ['   (çarpma)', { size: 30, color: C.inkSoft }]], -320, 180, { align: 'left', alpha: ca * after(t, 'boole-algebra', 6, 0.6) });
        runs(ctx, [['DEĞİL:  ', { size: 40, family: 'display', weight: 800, color: '#4b5a80' }], ['1 − x', { size: 46, family: 'serif', italic: true, color: C.ink }], ['   (birden çıkarmak)', { size: 30, color: C.inkSoft }]], -320, 260, { align: 'left', alpha: ca * after(t, 'boole-algebra', 8, 0.6) });
        ctx.restore();
      }
      // sağda: harfler yerine anahtarlar
      const sa = pa * after(t, 'boole-shannon', 2, 0.7);
      if (sa > 0) {
        text(ctx, 'CLAUDE SHANNON · 1937', 1420, 300, { size: 30, weight: 800, spacing: 6, color: C.fire, alpha: sa });
        text(ctx, 'anahtarlar = Boole cebri', 1420, 350, { size: 34, family: 'serif', italic: true, color: C.cream, alpha: sa });
        const L = { bx: 1180, top: 470, right: 1660, bottom: 760, mid: 615, a1: 1270, a2: 1360, b1: 1450, b2: 1540 };
        const k = clamp((clock('boole', t) % 4) / 4);
        const A = k > 0.25 ? 1 : 0;
        const B = k > 0.5 ? 1 : 0;
        ctx.save();
        ctx.globalAlpha *= sa;
        seriesCircuit(ctx, t, 1, A, B, L, { labels: ['x', 'y'], labelSize: 36, state: false, load: (x, y, live) => drawBulb(ctx, x, y, 36, live, 1) });
        ctx.restore();
        text(ctx, 'x · y', 1420, 840, { size: 52, family: 'serif', italic: true, color: C.flame, alpha: sa * after(t, 'boole-shannon', 3, 0.6) });
      }
      // zaman çizgisi: yaklaşık bir asır
      const ta = pa * after(t, 'boole-shannon', 0, 0.6);
      if (ta > 0) {
        const x0 = 560;
        const x1 = 1420;
        const y = 960;
        const p = after(t, 'boole-shannon', 0, 1.4, ease.inOut);
        ctx.save();
        ctx.globalAlpha *= ta;
        ctx.strokeStyle = C.dim;
        ctx.lineWidth = 3;
        line(ctx, x0, y, lerp(x0, x1, p), y);
        ctx.restore();
        text(ctx, '1854', x0, y + 40, { size: 30, family: 'mono', weight: 700, color: C.cream, alpha: ta });
        text(ctx, '1937', x1, y + 40, { size: 30, family: 'mono', weight: 700, color: C.fire, alpha: ta * p });
        text(ctx, 'yaklaşık bir asır', (x0 + x1) / 2, y - 26, { size: 30, family: 'serif', italic: true, color: C.muted, alpha: ta * p });
      }
    }
    const lA = vis(lt, 12.1, 16, 0.5, 0.5);
    if (lA > 0) {
      const q = lA * after(t, 'boole-lesson', 2, 0.6);
      ctx.save();
      ctx.globalAlpha *= q;
      roundRect(ctx, 420, 360, 760, 150, 40);
      ctx.fillStyle = '#16203a';
      ctx.fill();
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(520, 505);
      ctx.lineTo(480, 580);
      ctx.lineTo(600, 505);
      ctx.fill();
      ctx.restore();
      text(ctx, '“Bunu ne zaman kullanacağım?”', 800, 435, { size: 48, family: 'serif', italic: true, color: C.cream, alpha: q });
      drawIcon(ctx, 'person', 460, 680, 1.6, C.muted, q);
      text(ctx, 'kuram, uygulamayı bir asır bekledi', 1240, 700, { size: 44, family: 'serif', italic: true, color: C.flame, alpha: lA * after(t, 'boole-lesson', 1, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 8 · Doğruluk tabloları
  // ---------------------------------------------------------------------------

  const TT = {
    and: { ins: [[0, 0], [0, 1], [1, 0], [1, 1]], out: [0, 0, 0, 1] },
    or: { ins: [[0, 0], [0, 1], [1, 0], [1, 1]], out: [0, 1, 1, 1] },
    not: { ins: [[0], [1]], out: [1, 0] },
    xor: { ins: [[0, 0], [0, 1], [1, 0], [1, 1]], out: [0, 1, 1, 0] },
  };

  // Doğruluk tablosu: x merkez; o = { alpha, title, outA(j), hl(j), head, mult }
  function drawTruth(ctx, kind, x, y, s, o) {
    const a = o.alpha;
    if (a <= 0.002) return;
    const T = TT[kind];
    const n = T.ins[0].length;
    const cw = 110 * s;
    const rh = 76 * s;
    const cols = n + 1;
    const x0 = x - (cols * cw) / 2;
    const heads = n === 2 ? ['A', 'B', 'Sonuç'] : ['A', 'Sonuç'];
    if (o.title) text(ctx, o.title, x, y - 70 * s, { size: 44 * s, family: 'display', weight: 900, color: o.titleColor ?? C.fire, alpha: a });
    heads.forEach((h, i) => text(ctx, h, x0 + (i + 0.5) * cw, y, { size: 28 * s, weight: 700, color: o.headHl && o.headHl(i) > 0 ? C.flame : C.muted, alpha: a }));
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = C.line;
    ctx.fillRect(x0, y + 28 * s, cols * cw, 2);
    ctx.fillRect(x0 + n * cw, y - 22 * s, 2, rh * T.ins.length + 50 * s);
    ctx.restore();
    T.ins.forEach((row, j) => {
      const ry = y + 70 * s + j * rh;
      const hl = o.hl ? o.hl(j) : 0;
      if (hl > 0) {
        ctx.save();
        ctx.globalAlpha *= a * hl;
        roundRect(ctx, x0 - 10, ry - rh / 2 + 4, cols * cw + 20, rh - 8, 10);
        ctx.fillStyle = rgba(FIRE, 0.14);
        ctx.fill();
        ctx.restore();
      }
      const ra = a * (o.rowA ? o.rowA(j) : 1);
      row.forEach((v, i) => text(ctx, String(v), x0 + (i + 0.5) * cw, ry, { size: 46 * s, family: 'mono', weight: 700, color: v ? C.fire : C.off, alpha: ra }));
      const oa = a * (o.outA ? o.outA(j) : 1);
      const ov = T.out[j];
      text(ctx, o.unknown ? '?' : String(ov), x0 + (n + 0.5) * cw, ry, { size: 50 * s, family: 'mono', weight: 700, color: o.unknown ? C.dim : ov ? C.flame : C.off, alpha: oa });
      if (o.mult) text(ctx, `${row[0]} × ${row[1]} = ${ov}`, x0 + cols * cw + 40 * s, ry, { size: 34 * s, family: 'mono', color: C.muted, align: 'left', alpha: a * o.mult });
    });
  }

  function sceneTable(ctx, lt, t) {
    kicker(ctx, 'DOĞRULUK TABLOSU', lt, 20);
    const a = vis(lt, 0.2, 20, 0.5, 0.5);
    if (a <= 0) return;
    // tanıtım: ortada büyük, sonuçları bilinmeyen bir tablo; sonra VE'ye dönüşüp sola kayar
    const move = after(t, 'table-and', 0, 0.9, ease.inOut);
    const ax = lerp(W / 2, 400, move);
    const as = lerp(1.25, 0.95, move);
    const introA = a * after(t, 'table-intro', 1, 0.6);
    const read = (k) => between(t, cue('table-read', k), cue('table-read', k + 2 > 5 ? 5 : k + 2), 0.3, 0.3);
    drawTruth(ctx, 'and', ax, 330, as, {
      alpha: introA,
      title: move > 0.5 ? 'VE' : null,
      unknown: move < 0.5,
      outA: (j) => (move < 0.5 ? 1 : after(t, 'table-and', 0, 0.3 + j * 0.25)),
      headHl: (i) => (move < 0.5 ? (i < 2 ? read(0) : read(1)) : 0),
      hl: (j) => (move < 0.5 ? (j === 1 ? read(2) : 0) : j === 3 ? after(t, 'table-and', 2, 0.5) : 0),
      mult: after(t, 'table-mult', 1, 0.6),
    });
    text(ctx, 'Doğruluk tablosu: bütün olasılıklar', W / 2, 220, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: a * after(t, 'table-intro', 2, 0.6) * (1 - move) });
    // iki giriş → dört satır: iki lamba
    const two = a * between(t, cue('table-read', 4), cue('table-and', 0), 0.4, 0.4);
    if (two > 0) {
      [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(([p, q], j) => {
        const y = 400 + j * 95;
        drawBulb(ctx, 1520, y, 22, p, two);
        drawBulb(ctx, 1590, y, 22, q, two);
      });
      text(ctx, 'iki lamba: dört durum', 1555, 820, { size: 30, family: 'serif', italic: true, color: C.muted, alpha: two });
    }
    drawTruth(ctx, 'or', 960, 330, 0.95, {
      alpha: a * after(t, 'table-or', 0, 0.6),
      title: 'VEYA',
      outA: (j) => after(t, 'table-or', 0, 0.3 + j * 0.25),
      hl: (j) => (j === 0 ? after(t, 'table-or', 2, 0.5) : 0),
    });
    drawTruth(ctx, 'not', 1480, 330, 0.95, {
      alpha: a * after(t, 'table-not', 0, 0.6),
      title: 'DEĞİL',
      titleColor: C.off,
      outA: (j) => after(t, 'table-not', 2, 0.3 + j * 0.25),
    });
    text(ctx, 'mantığın çarpım tablosu', W / 2, 900, { size: 46, family: 'serif', italic: true, color: C.flame, alpha: a * after(t, 'table-mult', 0, 0.6) });
  }

  // ---------------------------------------------------------------------------
  // 9 · Özel veya: merdiven lambası
  // ---------------------------------------------------------------------------

  function stairStates() {
    const up = cue('xor-stairs', 5);
    return [[cue('xor-stairs', 3), [1, 0]], [up + 1.6, [1, 1]]];
  }

  function drawRocker(ctx, x, y, on, alpha, label) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    roundRect(ctx, x - 34, y - 50, 68, 100, 10);
    ctx.fillStyle = '#d7dde6';
    ctx.fill();
    roundRect(ctx, x - 20, y - 36 + (on > 0.5 ? 0 : 36), 40, 36, 6);
    ctx.fillStyle = on > 0.5 ? C.ember : '#6c7890';
    ctx.fill();
    ctx.restore();
    text(ctx, label, x, y + 84, { size: 28, color: C.muted, alpha });
    text(ctx, on > 0.5 ? '1' : '0', x + 64, y, { size: 44, family: 'mono', weight: 700, color: on > 0.5 ? C.fire : C.off, alpha, align: 'left' });
  }

  function sceneXor(ctx, lt, t) {
    kicker(ctx, 'ÖZEL VEYA', lt, 14);
    const a = vis(lt, 0.2, 14, 0.5, 0.5);
    if (a <= 0) return;
    const ia = a * vis(lt, 0.2, 3.7, 0.5, 0.4);
    if (ia > 0) {
      text(ctx, 'ÖZEL VEYA', W / 2, 380, { size: 110, family: 'display', weight: 900, color: C.fire, alpha: ia * after(t, 'xor-intro', 2, 0.6) });
      text(ctx, 'ikisinden biri, ama ikisi birden değil', W / 2, 520, { size: 48, family: 'serif', italic: true, color: C.cream, alpha: ia * after(t, 'xor-intro', 3, 0.6) });
      drawGate(ctx, 'xor', W / 2, 720, 1.2, ia * after(t, 'xor-intro', 4, 0.6), C.cream, 0);
    }
    const sa = a * vis(lt, 3.6, 14, 0.5, 0.5);
    if (sa > 0) {
      const S = stairStates();
      const L = stateAt(S, t, 0);
      const U = stateAt(S, t, 1);
      const lamp = Math.abs(L - U);
      // merdiven: soldan sağa yükselir
      const x0 = 260;
      const y0 = 900;
      const steps = 9;
      const sw = 74;
      const sh = 52;
      ctx.save();
      ctx.globalAlpha *= sa;
      ctx.fillStyle = '#121a2c';
      ctx.beginPath();
      ctx.moveTo(x0 - 60, y0);
      for (let i = 0; i < steps; i++) {
        ctx.lineTo(x0 + i * sw, y0 - i * sh);
        ctx.lineTo(x0 + i * sw, y0 - (i + 1) * sh);
      }
      ctx.lineTo(x0 + steps * sw + 220, y0 - steps * sh);
      ctx.lineTo(x0 + steps * sw + 220, y0 + 40);
      ctx.lineTo(x0 - 60, y0 + 40);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#2f3b58';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.strokeStyle = C.dim;
      ctx.lineWidth = 2;
      line(ctx, x0 + 180, 170, x0 + 180, 230);
      ctx.restore();
      drawBulb(ctx, x0 + 180 + 0, 260, 34, lamp, sa);
      if (lamp > 0.1) glow(ctx, x0 + 300, 560, 520, FIRE, 0.12 * lamp * sa);
      drawRocker(ctx, x0 - 20, y0 - 180, L, sa, 'aşağıdaki');
      drawRocker(ctx, x0 + steps * sw + 120, y0 - steps * sh - 180, U, sa, 'yukarıdaki');
      // merdiveni çıkan kişi
      const climb = progress(t, cue('xor-stairs', 5), cue('xor-stairs', 5) + 1.6, ease.inOut);
      const px = lerp(x0 + 40, x0 + steps * sw + 40, climb);
      const py = lerp(y0 - 40, y0 - steps * sh - 40, climb);
      drawIcon(ctx, 'person', px, py, 1.1, C.muted, sa * after(t, 'xor-stairs', 0, 0.6));
      // kural ve tablo
      drawTruth(ctx, 'xor', 1480, 360, 0.95, {
        alpha: sa * after(t, 'xor-rule', 0, 0.6),
        title: 'ÖZEL VEYA',
        hl: (j) => ((j === 1 || j === 2) ? between(t, cue('xor-rule', 0), cue('xor-rule', 1), 0.3, 0.3) : between(t, cue('xor-rule', 1), cue('xor-rule', 2), 0.3, 0.3)),
      });
      text(ctx, lamp > 0.5 ? 'farklı → yanar' : 'aynı → söner', 1480, 860, { size: 40, family: 'serif', italic: true, color: lamp > 0.5 ? C.flame : C.off, alpha: sa * after(t, 'xor-stairs', 4, 0.5) });
    }
  }

  // ---------------------------------------------------------------------------
  // 10 · Kapılar toplama yapar
  // ---------------------------------------------------------------------------

  const SUMS = [[0, 0, '0'], [0, 1, '1'], [1, 0, '1'], [1, 1, '10']];

  function sceneAdder(ctx, lt, t) {
    kicker(ctx, 'KAPILAR TOPLAMA YAPAR', lt, 18);
    const a = vis(lt, 0.2, 18, 0.5, 0.5);
    if (a <= 0) return;
    const ca = a * vis(lt, 0.2, 8.6, 0.5, 0.4);
    if (ca > 0) {
      text(ctx, 'iki biti toplamak', W / 2, 230, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: ca * after(t, 'adder-intro', 3, 0.6) });
      SUMS.forEach(([p, q, r], i) => {
        const k0 = i * 2;
        const sa = ca * after(t, 'adder-cases', k0, 0.5);
        const ra = ca * after(t, 'adder-cases', i === 3 ? 8 : k0 + 1, 0.5);
        const x = W / 2 + (i - 1.5) * 380;
        text(ctx, `${p} + ${q}`, x, 420, { size: 80, family: 'mono', weight: 700, color: C.cream, alpha: sa });
        ctx.save();
        ctx.globalAlpha *= sa;
        ctx.fillStyle = C.dim;
        ctx.fillRect(x - 110, 480, 220, 4);
        ctx.restore();
        if (r.length === 2) {
          const carry = after(t, 'adder-carry', 1, 0.5);
          text(ctx, '1', x - 24, 560, { size: 84, family: 'mono', weight: 700, color: carry > 0 ? C.digital : C.flame, alpha: ra });
          text(ctx, '0', x + 26, 560, { size: 84, family: 'mono', weight: 700, color: C.flame, alpha: ra });
          text(ctx, '= iki', x, 650, { size: 34, family: 'serif', italic: true, color: C.muted, alpha: ra });
          const pa = ca * after(t, 'adder-carry', 0, 0.5);
          text(ctx, '↑', x - 24, 700, { size: 30, color: C.digital, alpha: ca * carry });
          text(ctx, 'elde', x - 34, 745, { size: 30, family: 'serif', italic: true, color: C.digital, align: 'right', alpha: ca * carry });
          text(ctx, '↑', x + 26, 700, { size: 30, color: C.flame, alpha: pa });
          text(ctx, 'basamak', x + 36, 745, { size: 30, family: 'serif', italic: true, color: C.flame, align: 'left', alpha: pa });
        } else {
          text(ctx, r, x, 560, { size: 84, family: 'mono', weight: 700, color: r === '1' ? C.flame : C.off, alpha: ra });
        }
      });
      const dec = ca * after(t, 'adder-carry', 2, 0.6);
      runs(ctx, [['onlukta da öyle:  ', { size: 34, family: 'serif', italic: true, color: C.muted }], ['9 + 1 = ', { size: 44, family: 'mono', weight: 700, color: C.cream }], ['1', { size: 44, family: 'mono', weight: 700, color: C.digital }], ['0', { size: 44, family: 'mono', weight: 700, color: C.flame }]], W / 2, 860, { alpha: dec });
    }
    const ga = a * vis(lt, 8.6, 13.1, 0.5, 0.4);
    if (ga > 0) {
      // tablo: A B | toplam | elde
      const x0 = 300;
      const heads = ['A', 'B', 'basamak', 'elde'];
      const cw = [110, 110, 190, 150];
      const xs = cw.reduce((acc, w, i) => [...acc, (acc[i - 1] ?? x0) + (i ? cw[i - 1] / 2 + w / 2 : 0)], []);
      const sumHl = after(t, 'adder-gates', 1, 0.5);
      const carHl = after(t, 'adder-gates', 3, 0.5);
      heads.forEach((h, i) => text(ctx, h, xs[i], 300, { size: 30, weight: 700, color: (i === 2 && sumHl > 0) ? C.flame : (i === 3 && carHl > 0) ? C.digital : C.muted, alpha: ga }));
      SUMS.forEach(([p, q], j) => {
        const y = 370 + j * 80;
        const s = p ^ q;
        const c = p & q;
        [p, q, s, c].forEach((v, i) => text(ctx, String(v), xs[i], y, { size: 48, family: 'mono', weight: 700, color: i === 2 ? (v ? C.flame : C.off) : i === 3 ? (v ? C.digital : C.off) : v ? C.fire : C.off, alpha: ga }));
      });
      for (const [i, hl, col, name] of [[2, sumHl, FIRE, 'ÖZEL VEYA'], [3, carHl, DIGI, 'VE']]) {
        if (hl <= 0) continue;
        ctx.save();
        ctx.globalAlpha *= ga * hl;
        roundRect(ctx, xs[i] - cw[i] / 2 + 6, 330, cw[i] - 12, 330, 14);
        ctx.strokeStyle = rgba(col, 0.9);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        text(ctx, name, xs[i], 710, { size: 36, family: 'display', weight: 900, color: rgba(col), alpha: ga * hl });
      }
      // yarım toplayıcı: iki kapı
      const ha = ga * after(t, 'adder-gates', 5, 0.6);
      if (ha > 0) {
        drawGate(ctx, 'xor', 1380, 400, 1.0, ha, C.flame, 0);
        drawGate(ctx, 'and', 1380, 680, 1.0, ha, C.digital, 0);
        ctx.save();
        ctx.globalAlpha *= ha;
        ctx.strokeStyle = C.wire;
        ctx.lineWidth = 4;
        line(ctx, 1180, 372, 1275, 372);
        line(ctx, 1150, 428, 1275, 428);
        line(ctx, 1180, 372, 1180, 652);
        line(ctx, 1180, 652, 1275, 652);
        line(ctx, 1150, 428, 1150, 708);
        line(ctx, 1150, 708, 1275, 708);
        line(ctx, 1100, 372, 1180, 372);
        line(ctx, 1100, 428, 1150, 428);
        ctx.restore();
        text(ctx, 'A', 1080, 372, { size: 30, family: 'mono', weight: 700, color: C.cream, align: 'right', alpha: ha });
        text(ctx, 'B', 1080, 428, { size: 30, family: 'mono', weight: 700, color: C.cream, align: 'right', alpha: ha });
        text(ctx, 'basamak', 1500, 400, { size: 30, family: 'serif', italic: true, color: C.flame, align: 'left', alpha: ha });
        text(ctx, 'elde', 1500, 680, { size: 30, family: 'serif', italic: true, color: C.digital, align: 'left', alpha: ha });
        text(ctx, 'iki biti toplayan makine', 1380, 860, { size: 38, family: 'serif', italic: true, color: C.cream, alpha: ga * after(t, 'adder-gates', 6, 0.6) });
      }
    }
    const za = a * vis(lt, 13.1, 18, 0.5, 0.5);
    if (za > 0) {
      // 0110 + 0111 = 1101: sağdan sola toplayıcılar, elde zinciri
      const A4 = [0, 1, 1, 0];
      const B4 = [0, 1, 1, 1];
      const start = cue('adder-chain', 0) + 0.6;
      let carry = 0;
      const res = [];
      const carries = [];
      for (let i = 3; i >= 0; i--) {
        const s = A4[i] + B4[i] + carry;
        res[i] = s & 1;
        carries[i] = carry;
        carry = s >> 1;
      }
      for (let i = 0; i < 4; i++) {
        const x = W / 2 + (i - 1.5) * 260;
        const step = 3 - i;
        const done = progress(t, start + step * 0.7, start + step * 0.7 + 0.4);
        text(ctx, String(A4[i]), x, 270, { size: 60, family: 'mono', weight: 700, color: A4[i] ? C.fire : C.off, alpha: za });
        text(ctx, String(B4[i]), x, 340, { size: 60, family: 'mono', weight: 700, color: B4[i] ? C.fire : C.off, alpha: za });
        ctx.save();
        ctx.globalAlpha *= za;
        roundRect(ctx, x - 90, 400, 180, 130, 16);
        ctx.fillStyle = done > 0.5 ? '#1c2742' : '#121a2c';
        ctx.fill();
        ctx.strokeStyle = done > 0.5 ? C.flame : C.line;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        text(ctx, 'toplayıcı', x, 465, { size: 26, color: C.muted, alpha: za });
        text(ctx, String(res[i]), x, 600, { size: 72, family: 'mono', weight: 700, color: res[i] ? C.flame : C.off, alpha: za * done });
        if (i < 3 && carries[i] && done > 0) {
          text(ctx, 'elde 1 ←', x + 130, 380, { size: 26, family: 'mono', weight: 700, color: C.digital, alpha: za * done });
        }
      }
      text(ctx, '+', W / 2 - 1.5 * 260 - 110, 340, { size: 60, family: 'mono', weight: 700, color: C.muted, alpha: za });
      runs(ctx, [['6 + 7 = ', { size: 64, family: 'mono', weight: 700, color: C.cream }], ['13', { size: 72, family: 'mono', weight: 700, color: C.flame }]], W / 2, 740, { alpha: za * after(t, 'adder-chain', 2, 0.6) });
      drawIcon(ctx, 'calc', W / 2 - 330, 880, 1.0, C.muted, za * after(t, 'adder-chain', 4, 0.6));
      text(ctx, 'her hesap makinesinin kalbinde', W / 2 + 40, 880, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: za * after(t, 'adder-chain', 4, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 11 · Anahtarı kim çevirir?
  // ---------------------------------------------------------------------------

  const CHAIN_X = [430, 900, 1370];
  const chainAt = (i) => (i === 0 ? cue('turn-chain', 2) : cue('turn-chain', 3) + 0.2 + (i - 1) * 0.9);

  function drawTransistor(ctx, x, y, s, alpha, ctrl, t) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.scale(s, s);
    // bacaklar
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#b8bfcc';
    ctx.lineWidth = 8;
    for (const lx of [-50, 0, 50]) line(ctx, lx, 60, lx, 230);
    // gövde
    ctx.beginPath();
    ctx.moveTo(-90, 60);
    ctx.lineTo(-90, -40);
    ctx.arc(0, -40, 90, Math.PI, 0);
    ctx.lineTo(90, 60);
    ctx.closePath();
    ctx.fillStyle = '#16181d';
    ctx.fill();
    ctx.strokeStyle = '#3a3f4b';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
    // akım: kontrol bacağında ince, ana bacaklarda kalın
    drawWire(ctx, [[x, y + 230 * s + 120], [x, y + 60 * s]], ctrl, t, alpha, 4);
    drawWire(ctx, [[x - 50 * s, y + 230 * s + 120], [x - 50 * s, y + 60 * s]], ctrl > 0.5 ? 1 : 0, t, alpha, 12);
    drawWire(ctx, [[x + 50 * s, y + 60 * s], [x + 50 * s, y + 230 * s + 120]], ctrl > 0.5 ? 1 : 0, t, alpha, 12);
  }

  function drawFaucet(ctx, x, y, open, alpha, t) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = '#9aa6bb';
    ctx.fillRect(x - 420, y - 26, 360, 52);
    roundRect(ctx, x - 70, y - 60, 140, 120, 20);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 60, y - 26);
    ctx.lineTo(x + 170, y - 26);
    ctx.quadraticCurveTo(x + 220, y - 26, x + 220, y + 30);
    ctx.lineTo(x + 220, y + 70);
    ctx.lineTo(x + 170, y + 70);
    ctx.lineTo(x + 170, y + 30);
    ctx.lineTo(x + 60, y + 26);
    ctx.closePath();
    ctx.fill();
    // kol
    ctx.save();
    ctx.translate(x, y - 60);
    ctx.rotate(lerp(0, -0.9, open));
    ctx.fillStyle = C.ember;
    roundRect(ctx, -12, -140, 24, 140, 12);
    ctx.fill();
    ctx.restore();
    ctx.restore();
    // su
    if (open > 0.05) {
      ctx.save();
      ctx.globalAlpha *= alpha * open;
      ctx.fillStyle = 'rgba(124,200,255,0.85)';
      for (let i = 0; i < 40; i++) {
        const ph = ((t * 2.2 + hash(i, 4)) % 1);
        const px = x + 195 + (hash(i, 5) - 0.5) * 30 * open;
        const py = y + 75 + ph * 360;
        dot(ctx, px, py, 5 + 3 * hash(i, 6));
      }
      ctx.restore();
    }
  }

  function sceneTurn(ctx, lt, t) {
    kicker(ctx, 'ANAHTARI KİM ÇEVİRİR?', lt, 16);
    const clk = clock('turn', t);
    const ha = vis(lt, 0.2, 3.7, 0.5, 0.4);
    if (ha > 0) {
      const on = Math.floor(clk / 0.45) % 2;
      drawSwitch(ctx, W / 2 - 120, W / 2 + 120, 480, on, ha);
      text(ctx, 'el ile: saniyede birkaç kez', W / 2, 640, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: ha * after(t, 'turn-hand', 0, 0.6) });
      text(ctx, 'gereken: saniyede milyarlarca kez', W / 2, 730, { size: 52, family: 'display', weight: 800, color: C.fire, alpha: ha * after(t, 'turn-hand', 2, 0.6) });
    }
    const ca = vis(lt, 3.6, 8.1, 0.5, 0.4);
    if (ca > 0) {
      text(ctx, 'elektrikle çevrilen anahtar', W / 2, 220, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: ca * after(t, 'turn-chain', 2, 0.6) });
      // güç hattı
      ctx.save();
      ctx.globalAlpha *= ca;
      ctx.strokeStyle = C.wire;
      ctx.lineWidth = 6;
      line(ctx, 250, 340, 1700, 340);
      ctx.restore();
      text(ctx, '+', 220, 340, { size: 40, weight: 800, color: C.fire, alpha: ca });
      CHAIN_X.forEach((x, i) => {
        const on = progress(t, chainAt(i), chainAt(i) + 0.3);
        const live = on > 0.5 ? 1 : 0;
        drawWire(ctx, [[x - 70, 340], [x - 70, 520]], 1, t, ca);
        drawSwitch(ctx, x - 70, x + 50, 520, on, ca);
        // çıkış: bir sonraki kapının bobinine
        const nx = i < 2 ? CHAIN_X[i + 1] : null;
        if (nx) {
          drawWire(ctx, [[x + 50, 520], [x + 110, 520], [x + 110, 720], [nx - 130, 720]], live, t, ca);
          ctx.save();
          ctx.globalAlpha *= ca;
          roundRect(ctx, nx - 130, 690, 90, 60, 10);
          ctx.fillStyle = live ? '#3a2a18' : '#151d30';
          ctx.fill();
          ctx.strokeStyle = live ? C.fire : C.line;
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.setLineDash([6, 8]);
          ctx.strokeStyle = live ? C.flame : C.dim;
          line(ctx, nx - 85, 690, nx - 30, 540);
          ctx.restore();
          text(ctx, 'mıknatıs', nx - 85, 780, { size: 22, color: C.muted, alpha: ca });
        } else {
          drawWire(ctx, [[x + 50, 520], [x + 200, 520], [x + 200, 560]], live, t, ca);
          drawBulb(ctx, x + 200, 600, 36, live, ca);
        }
        text(ctx, i === 0 ? 'el' : `${i + 1}. kapı`, x + 40, 590, { size: 26, color: C.muted, alpha: ca });
      });
      text(ctx, 'bir kapının çıkışı → sonrakinin anahtarı', W / 2, 880, { size: 40, family: 'serif', italic: true, color: C.flame, alpha: ca * after(t, 'turn-chain', 4, 0.6) });
    }
    const ta = vis(lt, 8.1, 12.1, 0.5, 0.4);
    if (ta > 0) {
      const ctrl = t > cue('turn-transistor', 3) ? (Math.floor((t - cue('turn-transistor', 3)) / 1.3) % 2 === 0 ? 1 : 0) : 0;
      drawTransistor(ctx, 760, 380, 1.0, ta * after(t, 'turn-transistor', 0, 0.6), ctrl, t);
      text(ctx, 'TRANSİSTÖR', 1260, 330, { size: 72, family: 'display', weight: 900, color: C.cream, alpha: ta * after(t, 'turn-transistor', 0, 0.6) });
      text(ctx, '20. yüzyılın belki de en önemli icadı', 1260, 410, { size: 34, family: 'serif', italic: true, color: C.muted, alpha: ta * after(t, 'turn-transistor', 1, 0.6) });
      text(ctx, 'küçük akım (kontrol)', 760, 820, { size: 30, color: C.digital, alpha: ta * after(t, 'turn-transistor', 3, 0.5) });
      text(ctx, 'büyük akım', 640, 880, { size: 30, color: C.fire, alpha: ta * after(t, 'turn-transistor', 4, 0.5) });
      text(ctx, 'büyük akım', 880, 880, { size: 30, color: C.fire, alpha: ta * after(t, 'turn-transistor', 4, 0.5) });
      text(ctx, ctrl ? 'kontrol var → büyük akım geçer' : 'kontrol yok → geçmez', 1260, 600, { size: 40, family: 'serif', italic: true, color: ctrl ? C.flame : C.off, alpha: ta * after(t, 'turn-transistor', 4, 0.6) });
    }
    const fa = vis(lt, 12.1, 16, 0.5, 0.5);
    if (fa > 0) {
      const open = t > cue('turn-faucet', 1) ? (Math.floor((t - cue('turn-faucet', 1)) / 1.6) % 2 === 0 ? 1 : 0) : 0;
      const o = clamp(open);
      drawFaucet(ctx, 820, 460, o, fa * after(t, 'turn-faucet', 0, 0.6), t);
      // kolu çeviren ince kablo
      drawWire(ctx, [[820, 160], [820, 260]], o, t, fa * after(t, 'turn-faucet', 1, 0.6), 4);
      text(ctx, 'kolu çeviren: elektrik', 1300, 300, { size: 46, family: 'serif', italic: true, color: C.digital, alpha: fa * after(t, 'turn-faucet', 2, 0.6) });
      text(ctx, 'akan su: büyük akım', 1300, 700, { size: 40, family: 'serif', italic: true, color: C.fire, alpha: fa * after(t, 'turn-faucet', 1, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 12 · Tüpten transistöre
  // ---------------------------------------------------------------------------

  function drawTube(ctx, x, y, s, alpha, heat, crack, t) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.scale(s, s);
    glow(ctx, 0, -40, 180, FIRE, 0.25 + 0.2 * heat);
    // cam
    ctx.beginPath();
    ctx.moveTo(-70, 120);
    ctx.lineTo(-70, -80);
    ctx.quadraticCurveTo(-70, -200, 0, -200);
    ctx.quadraticCurveTo(70, -200, 70, -80);
    ctx.lineTo(70, 120);
    ctx.closePath();
    ctx.fillStyle = 'rgba(160,190,230,0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,220,255,0.6)';
    ctx.lineWidth = 4;
    ctx.stroke();
    // elektrotlar ve flaman
    ctx.strokeStyle = '#8b95a8';
    ctx.lineWidth = 6;
    ctx.strokeRect(-36, -110, 72, 170);
    ctx.strokeStyle = `rgba(255,${150 + 60 * heat},60,0.95)`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) ctx.lineTo(-10 + (i % 2) * 20, -90 + i * 12);
    ctx.stroke();
    // taban
    ctx.fillStyle = '#2a2f3a';
    ctx.fillRect(-80, 120, 160, 50);
    ctx.fillStyle = '#b8bfcc';
    for (const px of [-50, -17, 17, 50]) ctx.fillRect(px - 4, 170, 8, 40);
    // çatlak
    if (crack > 0) {
      ctx.strokeStyle = `rgba(255,255,255,${0.8 * crack})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, -150);
      ctx.lineTo(18, -110);
      ctx.lineTo(34, -80);
      ctx.lineTo(10, -40);
      ctx.moveTo(18, -110);
      ctx.lineTo(-6, -120);
      ctx.stroke();
    }
    ctx.restore();
    // ısı dalgası
    if (heat > 0) {
      ctx.save();
      ctx.globalAlpha *= alpha * heat * 0.6;
      ctx.strokeStyle = 'rgba(255,140,80,0.6)';
      ctx.lineWidth = 3;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        for (let yy = 0; yy < 140; yy += 6) {
          const xx = x - 40 + k * 40 + Math.sin(yy / 14 + t * 6 + k) * 8;
          if (yy === 0) ctx.moveTo(xx, y - 220 * s - yy);
          else ctx.lineTo(xx, y - 220 * s - yy);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function sceneTubes(ctx, lt, t) {
    kicker(ctx, 'TÜPTEN TRANSİSTÖRE', lt, 12);
    const ba = vis(lt, 0.2, 4.1, 0.5, 0.4);
    if (ba > 0) {
      const heat = after(t, 'tubes-before', 2, 0.6);
      const crack = after(t, 'tubes-before', 3, 0.3);
      drawTube(ctx, 620, 560, 1.4, ba, heat, crack, t);
      text(ctx, 'VAKUMLU TÜP', 620, 920, { size: 40, family: 'display', weight: 900, spacing: 4, color: C.cream, alpha: ba * after(t, 'tubes-before', 0, 0.6) });
      [['ampul boyutunda', 1, C.cream], ['sıcak', 2, C.ember], ['kırılgan', 3, C.cream], ['çok elektrik yer', 4, C.flame]].forEach(([s, k, col], i) => {
        text(ctx, s, 1180, 360 + i * 110, { size: 52, family: 'serif', italic: true, color: col, align: 'left', alpha: ba * after(t, 'tubes-before', k, 0.5) });
      });
    }
    const ea = vis(lt, 4.1, 8.1, 0.5, 0.4);
    if (ea > 0) {
      // ENIAC odası: dolap sıraları, binlerce küçük ışık
      ctx.save();
      ctx.globalAlpha *= ea;
      ctx.fillStyle = '#0d1424';
      ctx.fillRect(160, 260, 1600, 520);
      for (let r = 0; r < 8; r++) {
        const x = 200 + r * 195;
        ctx.fillStyle = '#1a2337';
        ctx.fillRect(x, 300, 170, 440);
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 22; j++) {
            const on = hash(r * 1000 + i * 30 + j, Math.floor(t * 6)) > 0.35;
            ctx.fillStyle = on ? 'rgba(255,170,80,0.9)' : 'rgba(80,60,40,0.6)';
            ctx.fillRect(x + 14 + i * 17, 318 + j * 19, 7, 7);
          }
        }
      }
      ctx.restore();
      drawIcon(ctx, 'person', 1700, 700, 2.0, C.muted, ea);
      text(ctx, 'ENIAC · 1946', W / 2, 200, { size: 56, family: 'display', weight: 900, color: C.cream, alpha: ea * after(t, 'tubes-eniac', 0, 0.6) });
      text(ctx, '≈ 17.500 tüp · bir oda', 600, 850, { size: 40, family: 'mono', weight: 700, color: C.fire, alpha: ea * after(t, 'tubes-eniac', 1, 0.6) });
      text(ctx, '≈ 27 ton', 1150, 850, { size: 40, family: 'mono', weight: 700, color: C.fire, alpha: ea * after(t, 'tubes-eniac', 2, 0.6) });
      const ca = ea * after(t, 'tubes-eniac', 4, 0.6);
      if (ca > 0) {
        ctx.save();
        ctx.globalAlpha *= ca * 0.85;
        ctx.fillStyle = '#04060c';
        ctx.fillRect(1380, 330, 380, 420);
        ctx.restore();
        drawIcon(ctx, 'calc', 1570, 480, 2.2, C.flame, ca);
        text(ctx, 'cep hesap makinesi', 1570, 650, { size: 30, color: C.cream, alpha: ca });
        text(ctx, 'daha güçlü', 1570, 700, { size: 34, family: 'serif', italic: true, color: C.flame, alpha: ca });
      }
    }
    const sa = vis(lt, 8.1, 12, 0.5, 0.5);
    if (sa > 0) {
      const morph = after(t, 'tubes-small', 0, 1.0, ease.inOut);
      drawTube(ctx, 600, 560, lerp(1.2, 0.3, morph), sa * (1 - morph), 0.5, 0, t);
      const shrink = after(t, 'tubes-small', 4, 2.4, ease.inOut);
      const s = lerp(1, 0.18, shrink);
      drawTransistor(ctx, 600, 470 - 60 * (1 - s), s, sa * morph, 0, t);
      [['küçük', 0], ['ısınmaz', 1], ['kırılmaz', 2]].forEach(([w, k], i) => {
        runs(ctx, [['✓ ', { size: 46, weight: 800, color: C.ok }], [w, { size: 52, family: 'serif', italic: true, color: C.cream }]], 1180, 380 + i * 100, { align: 'left', alpha: sa * after(t, 'tubes-small', k, 0.5) });
      });
      text(ctx, 've küçültülebilir', 1180, 720, { size: 64, family: 'display', weight: 900, color: C.fire, align: 'left', alpha: sa * after(t, 'tubes-small', 4, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 13 · Kum tanesindeki şehir
  // ---------------------------------------------------------------------------

  function drawChipDie(ctx, x, y, size, alpha, t, pattern = 1) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    // bacaklar
    ctx.fillStyle = '#b8a26a';
    const n = 10;
    for (let i = 0; i < n; i++) {
      const p = -size / 2 + (i + 0.5) * (size / n);
      ctx.fillRect(x + p - 4, y - size / 2 - 22, 8, 22);
      ctx.fillRect(x + p - 4, y + size / 2, 8, 22);
      ctx.fillRect(x - size / 2 - 22, y + p - 4, 22, 8);
      ctx.fillRect(x + size / 2, y + p - 4, 22, 8);
    }
    roundRect(ctx, x - size / 2, y - size / 2, size, size, 10);
    ctx.fillStyle = '#20232a';
    ctx.fill();
    // kalıp: devre deseni
    const d = size * 0.62;
    ctx.fillStyle = '#3a4a6a';
    ctx.fillRect(x - d / 2, y - d / 2, d, d);
    ctx.globalAlpha *= pattern;
    for (let i = 0; i < 26; i++) {
      for (let j = 0; j < 26; j++) {
        const on = hash(i * 31 + j, 77) > 0.45;
        if (!on) continue;
        ctx.fillStyle = hash(i * 31 + j, Math.floor(t * 8)) > 0.5 ? 'rgba(255,190,110,0.85)' : 'rgba(124,200,255,0.55)';
        ctx.fillRect(x - d / 2 + 4 + i * (d - 8) / 26, y - d / 2 + 4 + j * (d - 8) / 26, (d - 8) / 26 - 2, (d - 8) / 26 - 2);
      }
    }
    ctx.restore();
  }

  function sceneChip(ctx, lt, t) {
    kicker(ctx, 'KUM TANESİNDEKİ ŞEHİR', lt, 14);
    const pa = vis(lt, 0.2, 4.1, 0.5, 0.4);
    if (pa > 0) {
      // solda: tek tek lehimlenen parçalar
      const la = pa * after(t, 'chip-print', 1, 0.6);
      ctx.save();
      ctx.globalAlpha *= la;
      ctx.fillStyle = '#123022';
      ctx.fillRect(220, 330, 620, 420);
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 4; j++) {
          const x = 280 + i * 100;
          const y = 380 + j * 95;
          ctx.fillStyle = '#16181d';
          ctx.fillRect(x, y, 34, 44);
          ctx.strokeStyle = '#b8bfcc';
          ctx.lineWidth = 3;
          line(ctx, x + 6, y + 44, x + 6, y + 64);
          line(ctx, x + 28, y + 44, x + 28, y + 64);
        }
      }
      const sp = Math.floor(t * 5) % 24;
      glow(ctx, 286 + (sp % 6) * 100, 444 + Math.floor(sp / 6) * 95, 30, [255, 230, 160], 0.9);
      ctx.restore();
      text(ctx, 'tek tek, lehimle', 530, 800, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: la });
      const ra = pa * after(t, 'chip-print', 2, 0.6);
      drawChipDie(ctx, 1380, 540, 300, ra, t);
      text(ctx, 'hepsi birlikte, tek parçada', 1380, 800, { size: 40, family: 'serif', italic: true, color: C.flame, alpha: ra });
    }
    const sa = vis(lt, 4.1, 9.1, 0.5, 0.4);
    if (sa > 0) {
      const xs = [300, 640, 980, 1320, 1640];
      // kum
      const s0 = sa * after(t, 'chip-silicon', 1, 0.5);
      ctx.save();
      ctx.globalAlpha *= s0;
      for (let i = 0; i < 140; i++) {
        ctx.fillStyle = `rgba(${200 + 40 * hash(i, 2)},${170 + 40 * hash(i, 3)},${110 + 30 * hash(i, 4)},0.9)`;
        dot(ctx, xs[0] + (hash(i, 5) - 0.5) * 180, 560 + (hash(i, 6) - 0.5) * 60 + Math.abs(hash(i, 5) - 0.5) * 80, 4 + 3 * hash(i, 7));
      }
      ctx.restore();
      text(ctx, 'kum', xs[0], 700, { size: 32, color: C.muted, alpha: s0 });
      // külçe
      const s1 = sa * after(t, 'chip-silicon', 2, 0.5);
      ctx.save();
      ctx.globalAlpha *= s1;
      const g = ctx.createLinearGradient(xs[1] - 70, 0, xs[1] + 70, 0);
      g.addColorStop(0, '#4b5568');
      g.addColorStop(0.5, '#aab4c8');
      g.addColorStop(1, '#4b5568');
      ctx.fillStyle = g;
      ctx.fillRect(xs[1] - 70, 430, 140, 260);
      ctx.restore();
      text(ctx, 'arıtılmış silisyum', xs[1], 740, { size: 30, color: C.muted, alpha: s1 });
      // dilim
      const s2 = sa * after(t, 'chip-silicon', 3, 0.5);
      ctx.save();
      ctx.globalAlpha *= s2;
      ctx.fillStyle = '#8f9ab0';
      ctx.beginPath();
      ctx.ellipse(xs[2], 560, 130, 130, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      text(ctx, 'ince dilim', xs[2], 740, { size: 30, color: C.muted, alpha: s2 });
      // ışık ve şablon
      const s3 = sa * after(t, 'chip-silicon', 5, 0.5);
      if (s3 > 0) {
        ctx.save();
        ctx.globalAlpha *= s3;
        ctx.fillStyle = 'rgba(180,140,255,0.18)';
        ctx.beginPath();
        ctx.moveTo(xs[3] - 30, 290);
        ctx.lineTo(xs[3] + 30, 290);
        ctx.lineTo(xs[3] + 130, 560);
        ctx.lineTo(xs[3] - 130, 560);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(xs[3] - 110, 380, 220, 14);
        ctx.fillStyle = 'rgba(200,180,255,0.9)';
        for (let i = 0; i < 9; i++) ctx.fillRect(xs[3] - 100 + i * 24, 380, 10, 14);
        ctx.fillStyle = '#8f9ab0';
        ctx.beginPath();
        ctx.ellipse(xs[3], 600, 130, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        text(ctx, 'ışık + şablon', xs[3], 740, { size: 30, color: C.muted, alpha: s3 });
      }
      // basılmış dilim
      const s4 = sa * after(t, 'chip-silicon', 6, 0.7);
      if (s4 > 0) {
        ctx.save();
        ctx.globalAlpha *= s4;
        ctx.fillStyle = '#8f9ab0';
        ctx.beginPath();
        ctx.ellipse(xs[4], 560, 130, 130, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.clip();
        for (let i = -6; i <= 6; i++) {
          for (let j = -6; j <= 6; j++) {
            ctx.fillStyle = hash(i * 13 + j, 9) > 0.5 ? '#c08a3a' : '#6a7fae';
            ctx.fillRect(xs[4] + i * 22 - 9, 560 + j * 22 - 9, 18, 18);
          }
        }
        ctx.restore();
        text(ctx, 'fotoğraf basar gibi', xs[4], 740, { size: 30, color: C.flame, alpha: s4 });
      }
      for (let i = 0; i < 4; i++) {
        const ar = sa * after(t, 'chip-silicon', [2, 3, 5, 6][i], 0.5);
        text(ctx, '→', (xs[i] + xs[i + 1]) / 2, 560, { size: 40, color: C.dim, alpha: ar });
      }
      text(ctx, 'silisyum: kumda ve taşta bol bulunan bir element', W / 2, 220, { size: 38, family: 'serif', italic: true, color: C.cream, alpha: sa * after(t, 'chip-silicon', 1, 0.6) });
    }
    const na = vis(lt, 9.1, 14, 0.5, 0.5);
    if (na > 0) {
      const name = after(t, 'chip-name', 0, 0.6);
      drawChipDie(ctx, 560, 560, 380, na * name, t);
      text(ctx, 'TÜMLEŞİK DEVRE', 1260, 420, { size: 64, family: 'display', weight: 900, color: C.cream, alpha: na * name });
      text(ctx, 'halk arasında: çip', 1260, 500, { size: 42, family: 'serif', italic: true, color: C.muted, alpha: na * after(t, 'chip-name', 1, 0.6) });
      const tA = na * after(t, 'chip-name', 3, 0.8);
      if (tA > 0) {
        drawStone(ctx, 1260, 720, 700, 200, tA, 5);
        text(ctx, 'taşa kazınan mantık', 1260, 722, { size: 60, family: 'display', weight: 900, color: C.flame, alpha: tA, glow: 'rgba(255,130,40,0.5)', glowBlur: 24 });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 14 · En hızlı büyüme
  // ---------------------------------------------------------------------------

  const ERAS = [['1970’ler', 'birkaç bin', 2300], ['2000’ler', 'birkaç yüz milyon', 3e8], ['bugün, bir telefon', 'on milyarlarca', 2e10]];

  function sceneGrowth(ctx, lt, t) {
    kicker(ctx, 'EN HIZLI BÜYÜME', lt, 12);
    const a = vis(lt, 0.2, 12, 0.5, 0.5);
    if (a <= 0) return;
    const la = a * vis(lt, 0.2, 7.6, 0.5, 0.4);
    if (la > 0) {
      text(ctx, 'bir işlemcideki transistör sayısı', W / 2, 220, { size: 40, family: 'serif', italic: true, color: C.cream, alpha: la * after(t, 'growth-intro', 1, 0.6) });
      const base = 860;
      const maxH = 560;
      ERAS.forEach(([era, words, v], i) => {
        const k = [0, 2, 4][i];
        const ea = la * after(t, 'growth-list', k, 0.6);
        const x = W / 2 + (i - 1) * 440;
        const h = Math.max(2, (v / 2e10) * maxH * after(t, 'growth-list', k + 1, 1.0, ease.out));
        ctx.save();
        ctx.globalAlpha *= ea;
        ctx.fillStyle = i === 2 ? C.fire : C.flame;
        ctx.fillRect(x - 80, base - h, 160, h);
        ctx.fillStyle = C.line;
        ctx.fillRect(x - 140, base, 280, 3);
        ctx.restore();
        text(ctx, era, x, base + 50, { size: 36, weight: 700, color: C.cream, alpha: ea });
        text(ctx, words, x, base - h - 50, { size: 40, family: 'serif', italic: true, color: i === 2 ? C.fire : C.cream, alpha: la * after(t, 'growth-list', k + 1, 0.6) });
        if (i < 2) text(ctx, '(neredeyse görünmez)', x, base - 110, { size: 26, color: C.muted, alpha: la * after(t, 'growth-list', 5, 0.6) });
      });
    }
    const da = a * vis(lt, 7.6, 12, 0.5, 0.5);
    if (da > 0) {
      const x0 = 260;
      const x1 = 1660;
      const y0 = 860;
      const y1 = 300;
      ctx.save();
      ctx.globalAlpha *= da;
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 3;
      line(ctx, x0, y0, x1, y0);
      ctx.restore();
      text(ctx, '1971', x0, y0 + 40, { size: 30, family: 'mono', color: C.muted, alpha: da });
      text(ctx, 'bugün', x1, y0 + 40, { size: 30, family: 'mono', color: C.muted, alpha: da });
      const N = 26;
      const p = after(t, 'growth-doubling', 1, 3.2, ease.linear);
      const shown = Math.floor(p * N + 1e-6);
      for (let i = 0; i < N; i++) {
        const x = lerp(x0, x1, (i + 1) / N);
        const on = i < shown;
        text(ctx, '×2', x, y0 - 30, { size: 18, family: 'mono', weight: 700, color: on ? C.flame : C.dim, alpha: da });
      }
      // üstel eğri (doğrusal eksende)
      ctx.save();
      ctx.globalAlpha *= da;
      ctx.strokeStyle = C.fire;
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let i = 0; i <= 200 * p; i++) {
        const u = i / 200;
        const x = lerp(x0, x1, u);
        const y = y0 - (Math.pow(2, u * N) / Math.pow(2, N)) * (y0 - y1);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
      text(ctx, 'kabaca her iki yılda bir: ×2', W / 2, 220, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: da * after(t, 'growth-doubling', 1, 0.6) });
      text(ctx, 'katlamalar birikince sezgimiz yanılır', W / 2, 960, { size: 40, family: 'serif', italic: true, color: C.flame, alpha: da * after(t, 'growth-doubling', 4, 0.6) });
    }
  }

  // ---------------------------------------------------------------------------
  // 15 · Sayılamayan
  // ---------------------------------------------------------------------------

  function crowd(ctx, x, y, w, h, alpha, cols, rows, color = C.muted) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = color;
    const dx = w / cols;
    const dy = h / rows;
    const r = Math.max(0.8, Math.min(dx, dy) * 0.28);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        dot(ctx, x + (i + 0.5) * dx, y + (j + 0.5) * dy - r * 0.8, r);
        if (r > 2) ctx.fillRect(x + (i + 0.5) * dx - r * 0.8, y + (j + 0.5) * dy, r * 1.6, r * 1.6);
      }
    }
    ctx.restore();
  }

  function drawMosque(ctx, x, y, alpha, count) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.beginPath();
    ctx.rect(x - 330, y - 120, 660, 220);
    ctx.moveTo(x + 170, y - 120);
    ctx.arc(x, y - 120, 170, 0, Math.PI, true);
    ctx.moveTo(x - 140, y - 120);
    ctx.arc(x - 230, y - 120, 90, 0, Math.PI, true);
    ctx.moveTo(x + 320, y - 120);
    ctx.arc(x + 230, y - 120, 90, 0, Math.PI, true);
    for (const [mx, mh] of [[-400, 470], [-470, 380], [400, 470], [470, 380]]) {
      ctx.rect(x + mx - 10, y + 100 - mh, 20, mh);
      ctx.moveTo(x + mx - 12, y + 100 - mh);
      ctx.lineTo(x + mx, y + 100 - mh - 70);
      ctx.lineTo(x + mx + 12, y + 100 - mh);
    }
    ctx.fillStyle = '#1e2638';
    ctx.fill();
    ctx.clip();
    // taşlar: sayılabilir
    let n = 0;
    for (let row = 0; row < 40; row++) {
      for (let c = 0; c < 70; c++) {
        const bx = x - 500 + c * 15 + (row % 2) * 7;
        const by = y + 100 - (row + 1) * 14;
        n++;
        ctx.fillStyle = n <= count ? 'rgba(255,190,110,0.55)' : 'rgba(120,130,150,0.25)';
        ctx.fillRect(bx, by, 13, 12);
      }
    }
    ctx.restore();
  }

  function sceneScale(ctx, lt, t) {
    kicker(ctx, 'SAYILAMAYAN', lt, 16);
    const a = vis(lt, 0.2, 16, 0.5, 0.5);
    if (a <= 0) return;
    const pa = a * vis(lt, 0.2, 8.1, 0.5, 0.4);
    if (pa > 0) {
      const one = pa * after(t, 'scale-people', 2, 0.6);
      const many = after(t, 'scale-phone', 1, 1.6, ease.inOut);
      const shrink = after(t, 'scale-phone', 3, 1.2, ease.inOut);
      // tek blok: Türkiye
      const bw = lerp(520, 120, many);
      const bx = lerp(W / 2 - 260, 330, many);
      const by = lerp(330, 300, many);
      crowd(ctx, bx, by, bw, bw * 0.75, one * (1 - shrink), 26, 20, C.cream);
      text(ctx, 'Türkiye ≈ 85 milyon kişi', W / 2, 820, { size: 48, family: 'display', weight: 800, color: C.cream, alpha: one * (1 - many) });
      // yüzden fazla blok
      if (many > 0) {
        for (let i = 0; i < 120; i++) {
          const c = i % 12;
          const r = Math.floor(i / 12);
          const x = 330 + c * 108;
          const y = 300 + r * 58;
          const ba = pa * clamp(many * 120 - i) * (1 - shrink);
          ctx.save();
          ctx.globalAlpha *= ba;
          ctx.fillStyle = i === 0 ? 'rgba(243,237,225,0.9)' : 'rgba(255,165,71,0.75)';
          ctx.fillRect(x, y, 96, 50);
          ctx.restore();
        }
        text(ctx, 'telefon işlemcisi: Türkiye nüfusunun yüzden fazla katı anahtar', W / 2, 920, { size: 40, family: 'serif', italic: true, color: C.flame, alpha: pa * many * (1 - shrink) });
      }
      // tırnak büyüklüğünde
      const nail = pa * shrink;
      if (nail > 0) {
        ctx.save();
        ctx.globalAlpha *= nail;
        ctx.fillStyle = '#c69a7e';
        roundRect(ctx, W / 2 - 150, 380, 300, 520, 150);
        ctx.fill();
        ctx.fillStyle = '#e8c6b2';
        roundRect(ctx, W / 2 - 100, 420, 200, 230, 90);
        ctx.fill();
        ctx.restore();
        drawChipDie(ctx, W / 2, 540, 110, nail, t);
        text(ctx, 'bir tırnak büyüklüğünde', W / 2, 960, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: nail });
      }
    }
    const sa = a * vis(lt, 8.1, 12.1, 0.5, 0.4);
    if (sa > 0) {
      // yakın çekim: titreşen anahtarlar
      const cell = 18;
      const fr = Math.floor(clock('scale', t) * 30);
      ctx.save();
      ctx.globalAlpha *= sa;
      for (let i = 0; i < 70; i++) {
        for (let j = 0; j < 34; j++) {
          const on = hash(i * 97 + j * 13, fr) > 0.5;
          ctx.fillStyle = on ? 'rgba(255,190,110,0.85)' : 'rgba(60,80,120,0.6)';
          ctx.fillRect(330 + i * cell, 260 + j * cell, cell - 4, cell - 4);
        }
      }
      ctx.restore();
      text(ctx, 'her biri: saniyede milyarlarca kez', W / 2, 920, { size: 44, family: 'serif', italic: true, color: C.cream, alpha: sa * after(t, 'scale-speed', 1, 0.6) });
      text(ctx, 'insan elinin yaptığı en yoğun yapı', W / 2, 200, { size: 46, family: 'display', weight: 800, color: C.fire, alpha: sa * after(t, 'scale-speed', 3, 0.6) });
    }
    const ma = a * vis(lt, 12.1, 16, 0.5, 0.5);
    if (ma > 0) {
      const counting = progress(t, cue('scale-mosque', 0), cue('scale-mosque', 0) + 2.4, ease.linear);
      drawMosque(ctx, 560, 700, ma, Math.floor(counting * 2800));
      text(ctx, 'SÜLEYMANİYE', 560, 860, { size: 34, weight: 800, spacing: 8, color: C.cream, alpha: ma });
      text(ctx, `taş: ${Math.floor(counting * 2800).toLocaleString('tr-TR')} … sayılabilir`, 560, 930, { size: 32, family: 'mono', color: C.flame, alpha: ma * after(t, 'scale-mosque', 0, 0.5) });
      const ca = ma * after(t, 'scale-mosque', 1, 0.6);
      drawChipDie(ctx, 1400, 560, 380, ca, t);
      text(ctx, 'transistör: sayılamaz', 1400, 930, { size: 32, family: 'mono', color: C.digital, alpha: ca });
    }
  }

  // ---------------------------------------------------------------------------
  // 16 · Hayranlık ve kapanış
  // ---------------------------------------------------------------------------

  function sceneEnd(ctx, lt, t) {
    const a = vis(lt, 0.2, 6, 0.6, 0.5);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(W / 2, 520 + (1 - progress(lt, 0.2, 0.9, ease.out)) * 30);
    paperCard(ctx, -680, -200, 1360, 400);
    ctx.fillStyle = C.ember;
    ctx.fillRect(-680, -182, 8, 364);
    paragraph(ctx, 'Bir şeyin nasıl çalıştığını bilmek, ona duyulan hayranlığı azaltmaz; hak edilmiş kılar.', -600, -60, 1200, {
      size: 58, family: 'serif', color: C.ink, align: 'left', lineHeight: 78,
    });
    ctx.restore();
    const hl = after(t, 'end-quote', 2, 0.8);
    text(ctx, 'hak edilmiş kılar.', W / 2, 820, { size: 40, family: 'serif', italic: true, color: C.flame, alpha: a * hl });
  }

  function sceneClose(ctx, lt) {
    drawStone(ctx, W / 2, 540, 1200, 560, 1, 3);
    drawTraces(ctx, lt + 3, 0, 0.01, 0.35);
    text(ctx, 'Taşa kazınan mantık.', W / 2, 520, { size: 92, family: 'serif', italic: true, color: C.cream, alpha: progress(lt, 0.3, 1.0), glow: 'rgba(0,0,0,0.6)', glowBlur: 20 });
    text(ctx, 'BİRİNCİ KAPI · 2. BÖLÜM · SON', W / 2, 900, { size: 22, weight: 600, spacing: 10, color: C.muted, alpha: progress(lt, 0.8, 1.3) });
  }


  // ---------------------------------------------------------------------------
  // Ses: müzik ve efektler (anlatım sonradan eklenir)
  // ---------------------------------------------------------------------------

  function score(m, hz) {
    const { at, span } = TL;
    const untilEnd = (id, a, margin) => TL.scene(id).end - margin - at(id, a);
    const dur = (from, to) => Math.max(0.1, to - from);
    const scenePad = (id, notes, opts = {}) => m.pad(at(id, 0), untilEnd(id, 0, 0.4), notes, { gain: 0.26, attack: 1.6, release: 2.6, ...opts });

    // Anahtarlı devre: her anahtar değişiminde tık, lamba yanınca küçük çan, sönünce alçak "tın"
    function circuitSound(list, n, lampFn, { pans = [-0.3, 0.3], note = 'A5', pan = 0 } = {}) {
      const cur = new Array(n).fill(0);
      let lit = lampFn(cur);
      for (const [tm, vals] of list) {
        vals.forEach((v, i) => {
          if (v === cur[i]) return;
          m.click(tm, { gain: 0.16, pan: pans[i] ?? 0, tone: v ? 3400 : 2300 });
          cur[i] = v;
        });
        const now = lampFn(cur);
        if (now && !lit) {
          m.bell(tm + 0.12, { freq: hz(note), gain: 0.09, decay: 1.8, pan });
          m.blip(tm + 0.1, { freq: hz(note) / 2, dur: 0.22, type: 'triangle', gain: 0.05, pan });
        }
        if (!now && lit) m.blip(tm + 0.08, { freq: 240, dur: 0.2, slide: 0.6, type: 'triangle', gain: 0.05, pan });
        lit = now;
      }
    }

    // 0 · Açılış: taş, kazınan izler, başlık
    m.pad(0, 7.4, ['D2', 'A2', 'D3'], { gain: 0.3, attack: 3, release: 2.5, cutoff: 600 });
    m.boom(at('open', 0.3), { gain: 0.25, freq: 55 });
    for (let s = 0.6; s < 2.6; s += 0.09) m.tick(at('open', s), { gain: 0.035, pan: Math.sin(s * 5) * 0.5, tone: 4200 });
    m.riser(at('open', 1.2), span('open', 1.2, 3.3), { gain: 0.08 });
    m.boom(at('open', 3.3), { gain: 0.42 });
    m.bell(at('open', 3.6), { freq: hz('D5'), gain: 0.2, decay: 3 });
    m.bell(at('open', 3.9), { freq: hz('A5'), gain: 0.1, decay: 2.5 });
    ['D5', 'F5', 'A5'].forEach((n, i) => m.pop(at('open', 4.6 + i * 0.2), { freq: hz(n), gain: 0.08, pan: (i - 1) * 0.4 }));

    // 1 · Hatırlatma: bitler, soru, kapı zili
    scenePad('recap', ['F2', 'C3', 'A3', 'E4']);
    for (let j = 0; j < 8; j++) m.tick(at('recap', 0.4 + j * 0.06), { gain: 0.04, pan: lerp(-0.6, 0.6, j / 7) });
    m.blip(cue('recap-numbers', 3), { freq: hz('A5'), dur: 0.18, type: 'triangle', gain: 0.07, pan: -0.35 });
    m.blip(cue('recap-numbers', 3) + 0.08, { freq: hz('E6'), dur: 0.18, type: 'triangle', gain: 0.06, pan: 0.6 });
    m.whoosh(cue('recap-question', 1) - 0.2, { dur: 0.9, from: 300, to: 1800, gain: 0.07 });
    m.bell(cue('recap-question', 1) + 0.3, { freq: hz('F5'), gain: 0.1, decay: 3 });
    m.click(cue('recap-bell', 1) - 0.04, { gain: 0.18, pan: -0.3 });
    m.bell(cue('recap-bell', 1) + 0.05, { freq: hz('E5'), gain: 0.16, decay: 1.6, pan: 0.3 });
    m.bell(cue('recap-bell', 1) + 0.7, { freq: hz('C5'), gain: 0.16, decay: 2.4, pan: 0.3 });

    // 2 · Devre
    scenePad('circuit', ['D3', 'A3', 'E4', 'F4']);
    m.whoosh(cue('circuit-loop', 1), { dur: 2.4, from: 200, to: 1200, gain: 0.05, panFrom: -0.5, panTo: 0.5, q: 2 });
    m.hum(cue('circuit-loop', 1), dur(cue('circuit-loop', 1), cue('circuit-break', 0)), { gain: 0.04 });
    m.click(cue('circuit-break', 0), { gain: 0.14, tone: 2000 });
    m.blip(cue('circuit-break', 0) + 0.05, { freq: 300, dur: 0.25, slide: 0.5, type: 'triangle', gain: 0.05 });
    circuitSound(circuitStates(), 1, (v) => v[0], { pans: [0], note: 'A5' });
    ['C5', 'A4', 'E5', 'C5'].forEach((n, i) => m.pop(cue('circuit-bits', i) + 0.15, { freq: hz(n), gain: 0.07, pan: i % 2 ? 0.4 : -0.4 }));

    // 3 · VE
    scenePad('and', ['Bb2', 'F3', 'A3', 'D4']);
    circuitSound(andStates(), 2, (v) => v[0] && v[1], { pans: [-0.35, 0.05], note: 'D6', pan: 0.25 });
    m.whoosh(cue('and-name', 1) - 0.1, { dur: 0.6, from: 600, to: 2600, gain: 0.06 });
    m.bell(cue('and-name', 1) + 0.25, { freq: hz('F5'), gain: 0.12, decay: 2.6 });
    m.whoosh(cue('and-gate', 2) - 0.1, { dur: 0.7, from: 300, to: 1500, gain: 0.06, panFrom: 0.2, panTo: 0.6 });
    m.click(cue('and-gate', 3) + 0.2, { gain: 0.12, tone: 1800, pan: 0.4 });
    m.click(cue('and-gate', 3) + 0.9, { gain: 0.1, tone: 2600, pan: 0.4 });

    // 4 · VEYA
    scenePad('or', ['G2', 'D3', 'Bb3', 'F4']);
    circuitSound(orStates(), 2, (v) => v[0] || v[1], { pans: [-0.2, -0.05], note: 'G5', pan: 0.25 });
    m.whoosh(cue('or-name', 2) - 0.1, { dur: 0.6, from: 600, to: 2600, gain: 0.06 });
    m.bell(cue('or-name', 2) + 0.25, { freq: hz('D5'), gain: 0.12, decay: 2.6 });

    // 5 · DEĞİL: buzdolabı
    scenePad('not', ['A2', 'E3', 'G3', 'C4']);
    for (const [tm, [open]] of fridgeDoor().slice(1)) {
      m.whoosh(tm - 0.25, { dur: 0.5, from: open ? 400 : 1200, to: open ? 1400 : 300, gain: 0.07, panFrom: -0.4, panTo: -0.3 });
      if (!open) m.boom(tm + 0.05, { gain: 0.12, freq: 95 });
      m.click(tm + 0.05, { gain: 0.14, tone: open ? 3000 : 2000, pan: -0.3 });
      if (open) m.bell(tm + 0.15, { freq: hz('E6'), gain: 0.06, decay: 1.4, pan: -0.3 });
      else m.blip(tm + 0.1, { freq: 240, dur: 0.2, slide: 0.6, type: 'triangle', gain: 0.05, pan: -0.3 });
    }
    circuitSound(notStates(), 1, (v) => !v[0], { pans: [0.3], note: 'C6', pan: 0.45 });
    m.bell(cue('not-name', 2) + 0.2, { freq: hz('A4'), gain: 0.12, decay: 2.6 });
    [1, 2, 3].forEach((k, i) => m.pop(cue('not-three', k), { freq: hz(['A4', 'C5', 'E5'][i]), gain: 0.1, pan: (i - 1) * 0.5 }));
    m.bell(cue('not-three', 4) + 0.1, { freq: hz('A5'), gain: 0.1, decay: 3 });
    m.whoosh(cue('not-three', 7) - 0.1, { dur: 0.6, from: 500, to: 2000, gain: 0.05 });

    // 6 · Neden önemli: cümleden devreye
    scenePad('why', ['D3', 'F3', 'A3', 'C4']);
    m.bell(cue('why-pause', 3) + 0.1, { freq: hz('D5'), gain: 0.1, decay: 2.5 });
    m.typeKey(cue('why-alarm', 0), { gain: 0.08 });
    m.whoosh(cue('why-alarm', 3) - 0.1, { dur: 0.7, from: 300, to: 1400, gain: 0.05 });
    circuitSound(alarmStates(), 2, () => 0, { pans: [-0.2, 0.05] });
    const sirenOn = cue('why-alarm', 6);
    const sirenOff = Math.min(sirenOn + 3, at('why', 8.4));
    for (let s = sirenOn, k = 0; s < sirenOff; s += 0.42, k++) {
      m.blip(s, { freq: k % 2 ? 620 : 830, dur: 0.38, type: 'triangle', gain: 0.045, pan: 0.45 });
    }
    m.typeKey(cue('why-fire', 0), { gain: 0.08 });
    m.whoosh(cue('why-fire', 3) - 0.1, { dur: 0.7, from: 300, to: 1400, gain: 0.05 });
    circuitSound(fireStates(), 2, () => 0, { pans: [-0.2, -0.05] });
    const doorOpen = cue('why-fire', 4);
    m.whoosh(doorOpen + 0.05, { dur: 1.0, from: 300, to: 900, gain: 0.07, panFrom: 0.3, panTo: 0.6, q: 0.8 });
    m.bell(doorOpen + 0.15, { freq: hz('A5'), gain: 0.08, decay: 1.8, pan: 0.45 });
    m.whoosh(cue('why-bridge', 1) - 0.2, { dur: 1.4, from: 300, to: 2400, gain: 0.07, panFrom: -0.6, panTo: 0.6 });
    m.bell(cue('why-bridge', 2) + 0.1, { freq: hz('F5'), gain: 0.12, decay: 3 });
    m.bell(cue('why-bridge', 4) + 0.1, { freq: hz('A5'), gain: 0.1, decay: 3 });

    // 7 · Boole ve Shannon
    scenePad('boole', ['Bb2', 'F3', 'D4', 'A4'], { gain: 0.24, cutoff: 800 });
    m.projector(at('boole', 0.2), span('boole', 0.2, 7.9), { gain: 0.012, rate: 18 });
    m.bell(cue('boole-who', 1) + 0.2, { freq: hz('D5'), gain: 0.1, decay: 3 });
    for (let s = cue('boole-who', 3); s < cue('boole-who', 3) + 2.2; s += 0.11) m.tick(s, { gain: 0.03, tone: 2600 + 1600 * hash(s * 7, 3), pan: -0.2 });
    [1, 4, 6, 8].forEach((k, i) => {
      for (let j = 0; j < 5; j++) m.typeKey(cue('boole-algebra', k) + j * 0.07, { gain: 0.05, pan: lerp(-0.3, 0.3, i / 3) });
    });
    m.whoosh(cue('boole-shannon', 0) - 0.2, { dur: 1.2, from: 2000, to: 300, gain: 0.06 });
    m.bell(cue('boole-shannon', 2) + 0.2, { freq: hz('F5'), gain: 0.1, decay: 2.5, pan: 0.3 });
    m.whoosh(cue('boole-shannon', 3), { dur: 0.8, from: 500, to: 2500, gain: 0.06, panFrom: -0.5, panTo: 0.5 });
    m.bell(cue('boole-shannon', 3) + 0.6, { freq: hz('A5'), gain: 0.1, decay: 2.5 });
    m.bell(cue('boole-lesson', 2) + 0.1, { freq: hz('D5'), gain: 0.12, decay: 3 });
    m.bell(cue('boole-lesson', 2) + 0.12, { freq: hz('A5'), gain: 0.06, decay: 3 });

    // 8 · Doğruluk tabloları
    scenePad('table', ['C3', 'G3', 'E4', 'A4'], { gain: 0.24 });
    m.whoosh(cue('table-intro', 1) - 0.1, { dur: 0.6, from: 600, to: 2200, gain: 0.05 });
    [0, 1, 2, 4].forEach((k, i) => m.pop(cue('table-read', k), { freq: hz(['C5', 'E5', 'G5', 'C6'][i]), gain: 0.07, pan: (i - 1.5) * 0.3 }));
    for (const [id, notes] of [['table-and', ['C5', 'C5', 'C5', 'G5']], ['table-or', ['C5', 'G5', 'G5', 'G5']], ['table-not', ['G5', 'C5']]]) {
      m.whoosh(cue(id, 0) - 0.1, { dur: 0.5, from: 500, to: 1800, gain: 0.05 });
      notes.forEach((n, r) => m.blip(cue(id, 0) + 0.3 + r * 0.12, { freq: hz(n), dur: 0.1, type: 'triangle', gain: 0.06 }));
      m.bell(cue(id, 2) + 0.1, { freq: hz(notes[notes.length - 1]), gain: 0.07, decay: 1.8 });
    }
    m.whoosh(cue('table-mult', 1) - 0.1, { dur: 0.8, from: 400, to: 2400, gain: 0.06 });
    m.bell(cue('table-mult', 1) + 0.3, { freq: hz('E5'), gain: 0.12, decay: 3 });
    m.bell(cue('table-mult', 1) + 0.32, { freq: hz('A5'), gain: 0.06, decay: 3 });

    // 9 · ÖZEL VEYA: merdiven lambası
    scenePad('xor', ['F2', 'C3', 'A3', 'E4']);
    m.bell(cue('xor-intro', 2) + 0.2, { freq: hz('C5'), gain: 0.1, decay: 2.6 });
    const stairs = stairStates();
    circuitSound(stairs, 2, (v) => v[0] !== v[1], { pans: [-0.5, 0.5], note: 'E6' });
    const climb = cue('xor-stairs', 5);
    for (let k = 0; k < 6; k++) m.hoof(climb + 0.1 + k * 0.26, { gain: 0.08, pan: lerp(-0.5, 0.5, k / 5) });
    m.bell(cue('xor-rule', 0) + 0.1, { freq: hz('A5'), gain: 0.08, decay: 2 });
    m.blip(cue('xor-rule', 1) + 0.1, { freq: 220, dur: 0.25, slide: 0.7, type: 'triangle', gain: 0.05 });
    m.bell(cue('xor-rule', 2) + 0.1, { freq: hz('C5'), gain: 0.12, decay: 3 });

    // 10 · Toplama
    scenePad('adder', ['G2', 'D3', 'Bb3', 'F4']);
    m.whoosh(cue('adder-intro', 3) - 0.1, { dur: 0.6, from: 500, to: 2000, gain: 0.05 });
    [1, 3, 5].forEach((k, i) => m.pop(cue('adder-cases', k), { freq: hz(['C5', 'E5', 'E5'][i]), gain: 0.08, pan: (i - 1) * 0.3 }));
    m.blip(cue('adder-cases', 6), { freq: hz('G4'), dur: 0.2, type: 'triangle', gain: 0.06 });
    m.pop(cue('adder-cases', 8), { freq: hz('G5'), gain: 0.1, pan: -0.2 });
    m.pop(cue('adder-cases', 8) + 0.14, { freq: hz('C5'), gain: 0.08, pan: 0.2 });
    m.whoosh(cue('adder-carry', 1) - 0.1, { dur: 0.6, from: 1800, to: 500, gain: 0.06, panFrom: 0.3, panTo: -0.3 });
    m.bell(cue('adder-carry', 2) + 0.2, { freq: hz('D5'), gain: 0.08, decay: 2 });
    m.pop(cue('adder-gates', 1), { freq: hz('Bb4'), gain: 0.08, pan: 0.3 });
    m.pop(cue('adder-gates', 3), { freq: hz('D5'), gain: 0.08, pan: 0.3 });
    m.whoosh(cue('adder-gates', 5) - 0.1, { dur: 0.7, from: 400, to: 2200, gain: 0.06 });
    m.bell(cue('adder-gates', 6) + 0.1, { freq: hz('F5'), gain: 0.12, decay: 2.8 });
    const chain0 = cue('adder-chain', 0) + 0.6;
    ['G5', 'Bb5', 'D6', 'F6'].forEach((n, step) => {
      m.click(chain0 + step * 0.7, { gain: 0.1, tone: 2800 });
      m.blip(chain0 + step * 0.7 + 0.2, { freq: hz(n), dur: 0.14, type: 'triangle', gain: 0.07, pan: lerp(0.5, -0.5, step / 3) });
    });
    m.bell(chain0 + 3.2, { freq: hz('G5'), gain: 0.12, decay: 3 });
    m.bell(cue('adder-chain', 4) + 0.2, { freq: hz('D5'), gain: 0.12, decay: 3 });
    m.bell(cue('adder-chain', 4) + 0.22, { freq: hz('Bb5'), gain: 0.06, decay: 3 });

    // 11 · Anahtarı elektrik çevirsin: transistör, musluk
    scenePad('turn', ['D3', 'A3', 'E4', 'F4'], { gain: 0.24, cutoff: 800 });
    m.click(cue('turn-hand', 0) + 0.2, { gain: 0.16, pan: -0.3 });
    for (let k = 0; k < 24; k++) m.tick(cue('turn-hand', 2) + k * 0.05, { gain: 0.035, pan: Math.sin(k) * 0.5 });
    [0, 1, 2].forEach((i) => {
      m.click(chainAt(i), { gain: 0.14, tone: 2200 + i * 500, pan: lerp(-0.5, 0.5, i / 2) });
      m.blip(chainAt(i) + 0.08, { freq: hz(['A4', 'D5', 'F5'][i]), dur: 0.16, type: 'triangle', gain: 0.06, pan: lerp(-0.5, 0.5, i / 2) });
    });
    m.bell(cue('turn-chain', 4) + 0.2, { freq: hz('A5'), gain: 0.1, decay: 2.5 });
    const tr0 = cue('turn-transistor', 3);
    const tr1 = at('turn', 12.0);
    for (let s = tr0, k = 0; s < tr1; s += 1.3, k++) {
      m.click(s, { gain: 0.1, tone: k % 2 ? 2000 : 3200, pan: -0.2 });
      if (k % 2 === 0) m.blip(s + 0.05, { freq: hz('E5'), dur: 0.16, type: 'triangle', gain: 0.045, pan: 0.2 });
    }
    const fa0 = cue('turn-faucet', 1);
    const fa1 = TL.scene('turn').end - 0.3;
    for (let s = fa0, k = 0; s < fa1; s += 1.6, k++) {
      m.click(s, { gain: 0.08, tone: 1600, pan: -0.3 });
      if (k % 2 === 0) m.rain(s + 0.05, Math.min(1.5, fa1 - s), { gain: 0.08 });
    }

    // 12 · Vakumlu tüpten transistöre
    scenePad('tubes', ['A2', 'E3', 'C4'], { gain: 0.24, cutoff: 650 });
    const heat = cue('tubes-before', 2);
    m.hum(heat, dur(heat, at('tubes', 4.0)), { gain: 0.07 });
    m.staticNoise(heat, dur(heat, at('tubes', 4.0)), { gain: 0.03 });
    m.glitch(cue('tubes-before', 3), 0.25, { gain: 0.1 });
    m.click(cue('tubes-before', 3), { gain: 0.16, tone: 4200 });
    m.buzz(cue('tubes-before', 4), { gain: 0.06, dur: 0.4 });
    const eniac = cue('tubes-eniac', 0);
    m.hum(eniac, dur(eniac, at('tubes', 8.0)), { gain: 0.06 });
    m.projector(eniac, dur(eniac, at('tubes', 8.0)), { gain: 0.02, rate: 6 });
    m.boom(cue('tubes-eniac', 2) + 0.1, { gain: 0.22, freq: 50 });
    m.pop(cue('tubes-eniac', 4) + 0.1, { freq: hz('A5'), gain: 0.08, pan: 0.5 });
    m.whoosh(cue('tubes-small', 0) - 0.1, { dur: 1.0, from: 1600, to: 400, gain: 0.06 });
    [0, 1, 2].forEach((k, i) => m.pop(cue('tubes-small', k) + 0.1, { freq: hz(['C5', 'E5', 'G5'][i]), gain: 0.08, pan: 0.4 }));
    m.whoosh(cue('tubes-small', 4), { dur: 2.4, from: 300, to: 5000, gain: 0.06, q: 1.6 });
    m.bell(cue('tubes-small', 4) + 0.3, { freq: hz('A5'), gain: 0.1, decay: 3 });

    // 13 · Tümleşik devre
    scenePad('chip', ['Bb2', 'F3', 'C4', 'D4'], { gain: 0.24 });
    const solder = cue('chip-print', 1);
    for (let s = solder; s < Math.min(solder + 3, at('chip', 4.0)); s += 0.2) {
      m.tick(s, { gain: 0.035, tone: 6000, pan: -0.45 });
      m.staticNoise(s, 0.08, { gain: 0.02 });
    }
    m.boom(cue('chip-print', 2) + 0.05, { gain: 0.16, freq: 80 });
    m.bell(cue('chip-print', 2) + 0.1, { freq: hz('F5'), gain: 0.08, decay: 2, pan: 0.45 });
    m.wind(cue('chip-silicon', 1) - 0.3, 2.4, { gain: 0.06 });
    [2, 3, 5, 6].forEach((k, i) => m.pop(cue('chip-silicon', k), { freq: hz(['D5', 'F5', 'A5', 'C6'][i]), gain: 0.07, pan: lerp(-0.6, 0.6, (i + 1) / 4) }));
    m.whoosh(cue('chip-silicon', 5), { dur: 0.6, from: 3000, to: 8000, gain: 0.05, panFrom: 0.2, panTo: 0.3 });
    m.click(cue('chip-silicon', 6) + 0.1, { gain: 0.14, tone: 4600, pan: 0.6 });
    m.boom(cue('chip-name', 0), { gain: 0.3 });
    m.bell(cue('chip-name', 0) + 0.05, { freq: hz('D5'), gain: 0.14, decay: 3 });
    m.riser(cue('chip-name', 3) - 1.4, 1.4, { gain: 0.08 });
    m.bell(cue('chip-name', 3) + 0.05, { freq: hz('F5'), gain: 0.16, decay: 3.5 });
    m.bell(cue('chip-name', 3) + 0.08, { freq: hz('C6'), gain: 0.08, decay: 3 });

    // 14 · Büyüme
    scenePad('growth', ['F3', 'A3', 'C4', 'E4'], { gain: 0.24 });
    [1, 3, 5].forEach((k, i) => {
      m.whoosh(cue('growth-list', k) - 0.05, { dur: 0.9, from: 300, to: 900 + i * 1200, gain: 0.05 + i * 0.015, panFrom: (i - 1) * 0.5, panTo: (i - 1) * 0.5 });
      m.blip(cue('growth-list', k) + 0.6, { freq: hz(['C5', 'F5', 'C6'][i]), dur: 0.25, type: 'triangle', gain: 0.06, pan: (i - 1) * 0.5 });
    });
    const dbl = cue('growth-doubling', 1);
    for (let k = 0; k < 26; k++) m.blip(dbl + (k / 26) * 3.2, { freq: 220 * Math.pow(2, k / 8), dur: 0.06, type: 'square', gain: 0.03, pan: lerp(-0.5, 0.5, k / 25) });
    m.bell(dbl + 3.3, { freq: hz('A5'), gain: 0.12, decay: 3 });
    m.whoosh(cue('growth-doubling', 4), { dur: 1.0, from: 500, to: 3000, gain: 0.05 });

    // 15 · Ölçek: Türkiye, telefon, Süleymaniye
    scenePad('scale', ['D3', 'A3', 'D4', 'F4'], { gain: 0.24 });
    m.wind(cue('scale-people', 2), dur(cue('scale-people', 2), at('scale', 8.0)), { gain: 0.05 });
    m.pop(cue('scale-people', 2) + 0.2, { freq: hz('D5'), gain: 0.08 });
    m.whoosh(cue('scale-phone', 1), { dur: 1.6, from: 300, to: 2400, gain: 0.06 });
    m.whoosh(cue('scale-phone', 3), { dur: 1.2, from: 3000, to: 600, gain: 0.06 });
    m.pop(cue('scale-phone', 3) + 1.2, { freq: hz('A5'), gain: 0.08 });
    m.projector(cue('scale-speed', 1), dur(cue('scale-speed', 1), at('scale', 12.0)), { gain: 0.015, rate: 30 });
    m.bell(cue('scale-speed', 3) + 0.1, { freq: hz('F5'), gain: 0.1, decay: 2.6 });
    const count = cue('scale-mosque', 0);
    for (let k = 0; k < 24; k++) m.tick(count + k * 0.1, { gain: 0.035, tone: 3000 + k * 60, pan: -0.4 });
    m.bell(cue('scale-mosque', 1) + 0.3, { freq: hz('D5'), gain: 0.14, decay: 3.5 });
    m.bell(cue('scale-mosque', 1) + 0.33, { freq: hz('A5'), gain: 0.07, decay: 3.5 });

    // 16 · Son söz ve kapanış
    scenePad('end', ['Bb2', 'F3', 'A3', 'D4'], { gain: 0.28, attack: 2 });
    m.bell(at('end', 0.3), { freq: hz('F5'), gain: 0.12, decay: 3 });
    m.bell(cue('end-quote', 2) + 0.2, { freq: hz('D5'), gain: 0.14, decay: 3.5 });
    m.bell(cue('end-quote', 2) + 0.23, { freq: hz('A5'), gain: 0.07, decay: 3.5 });
    m.pad(at('close', 0), untilEnd('close', 0, 0.2), ['D2', 'A2', 'D3', 'F3'], { gain: 0.26, attack: 1, release: 1.4, cutoff: 600 });
    m.boom(at('close', 0.3), { gain: 0.3 });
    m.bell(at('close', 0.3), { freq: hz('D5'), gain: 0.16, decay: 2.5 });
    m.bell(at('close', 0.32), { freq: hz('F5'), gain: 0.08, decay: 2.5 });
  }

  window.FILM = E.film({
    title: 'Taşa Kazınan Mantık — Birinci Kapı, 2. Bölüm',
    timeline: TL,
    background,
    score,
    narration: VOICE,
    voice: VOICE.voice,
  });
})();
