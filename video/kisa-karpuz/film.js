/*
 * YUP Akademi · Lup · Tabağındaki Bilim kısa video (1080×1920) — Karpuz çekirdeğinin proteini
 *
 * Maç ya da dizi gecesi: Arkadaşın televizyon karşısında çekirdek çitliyor (her kırılışta "çıt"). Çekirdeğin içi gram gram
 * kıymadan fazla protein taşır (skorbord: ÇEKİRDEK 28 – 19 KIYMA, terazide 100 g'a 100 g); çünkü çekirdek filizin
 * beslenme çantası. Ters köşe: 100 g kıymanın proteini için binden fazla çekirdek (sayaç), neredeyse bir maç (90').
 * Kabuk bir fren; proteinin bir yapı taşı (lizin) az, etin yerini tek başına tutmaz (eksik parçalı yapboz).
 *
 * Görüntü: maç gecesi (film akşamı odası, televizyon ışığı kodla titrer), mutfak tezgâhı, Lup'un merceğinden toprak;
 * Lup ve Arkadaşın pozları, eşyalar (ChatGPT, assets.js). Skorbord LED nokta rakamlarla, sayaç, kabuk yağmuru,
 * hız göstergesi ve yapboz kodla. Tipografi "skorbord" (yazi.js): başlıklar Bungee (stadyum tabelası, harfler
 * skorbord gibi çevrilerek gelir), notlar Kalam. Ses: YUP ses kimliği (ses.js): mercek kancası, komik müzik,
 * televizyonda maç uğultusu, çıt sesleri, skorborda sayı darbesi, kapanışta Lup motifi.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, lerp, ease, progress, hash } = E;
  const K = window.YupKisa;
  const L = window.YupEl;
  const LUP = window.YupLup;
  const Y = window.YupSes;
  const { P, paper, tape, finish, swash } = L;
  const TAU = Math.PI * 2;
  const INK = P.ink;
  const BG = 'Bungee, Impact, "Arial Black", sans-serif';
  const KA = 'Kalam, "Patrick Hand", cursive';
  const LED = '#ffb02e';

  // ---------------------------------------------------------------------------
  // Görseller
  // ---------------------------------------------------------------------------
  const A = window.ASSETS ?? {};
  const IMG = {};
  const loads = [];
  for (const [k, v] of Object.entries(A)) {
    const im = new Image();
    im.src = v.src;
    IMG[k] = im;
    loads.push(im.decode ? im.decode().catch(() => {}) : Promise.resolve());
  }
  window.FILM_READY = Promise.all([window.FILM_READY, window.EL_FONTS_READY, window.KARPUZ_FONTS_READY, ...loads]);

  function pic(ctx, k, x, y, w, { ax = 0.5, ay = 0.5, rot = 0, a = 1, flip = false, sx = 1, sy = 1 } = {}) {
    const g = A[k];
    if (!g || a <= 0.002 || w <= 0.5) return;
    const h = (w * g.h) / g.w;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.scale((flip ? -1 : 1) * sx, sy);
    ctx.drawImage(IMG[k], -ax * w, -ay * h, w, h);
    ctx.restore();
  }
  const pich = (ctx, k, x, y, h, o = {}) => A[k] && pic(ctx, k, x, y, (h * A[k].w) / A[k].h, o);
  // Görseldeki (fx, fy) noktasının dünyadaki yeri (dönüşsüz yerleşim)
  const at = (k, x, y, h, ax, ay, fx, fy) => {
    const g = A[k];
    const w = (h * g.w) / g.h;
    return [x - ax * w + fx * w, y - ay * h + fy * h];
  };
  function cover(ctx, k, { dim = 0, zoom = 1, zx = 540, zy = 960 } = {}) {
    const g = A[k];
    const s = Math.max(1080 / g.w, 1920 / g.h);
    ctx.save();
    ctx.translate(zx, zy);
    ctx.scale(zoom, zoom);
    ctx.translate(-zx, -zy);
    ctx.drawImage(IMG[k], 540 - (g.w * s) / 2, 960 - (g.h * s) / 2, g.w * s, g.h * s);
    ctx.restore();
    if (dim) {
      ctx.fillStyle = `rgba(12,10,20,${dim})`;
      ctx.fillRect(0, 0, 1080, 1920);
    }
  }
  // Televizyonun titreşen ışığı (sol kenardaki ekrandan)
  function tvGlow(ctx, t, k = 1, { zoom = 1 } = {}) {
    const f = 0.55 + 0.22 * Math.sin(t * 13) * Math.sin(t * 3.1) + 0.18 * hash(Math.floor(t * 7), 5);
    const cx = 540 + (-60 - 540) * zoom;
    const cy = 960 + (820 - 960) * zoom;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 1150);
    g.addColorStop(0, `rgba(150,200,255,${0.55 * f * k})`);
    g.addColorStop(0.45, `rgba(90,140,230,${0.22 * f * k})`);
    g.addColorStop(1, 'rgba(60,90,200,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Tipografi
  // ---------------------------------------------------------------------------
  function strip(ctx, y, rows, lead = 100, a = 1) {
    if (a <= 0.002) return;
    const h = 130 + (rows - 1) * lead;
    const y0 = y - 92;
    ctx.save();
    ctx.globalAlpha *= 0.97 * a;
    ctx.shadowColor = 'rgba(10,6,4,0.35)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#f6efe1';
    ctx.beginPath();
    ctx.moveTo(46, y0);
    for (let i = 1; i <= 32; i++) ctx.lineTo(46 + (988 * i) / 32, y0 + (hash(i, 31) - 0.5) * 10);
    for (let i = 1; i <= 8; i++) ctx.lineTo(1034 + (hash(i, 32) - 0.5) * 6, y0 + (h * i) / 8);
    for (let i = 31; i >= 0; i--) ctx.lineTo(46 + (988 * i) / 32, y0 + h + (hash(i, 33) - 0.5) * 10);
    for (let i = 7; i >= 1; i--) ctx.lineTo(46 + (hash(i, 34) - 0.5) * 6, y0 + (h * i) / 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    tape(ctx, 540, y0 + 2, 150, -0.03, a);
  }

  // Tabela başlığı: Bungee; harfler skorbord paletleri gibi dikey çevrilerek gelir. rows = [[{ s, c, mark }...]]
  function tabela(ctx, rows, x, y, { size = 84, lead = 1.12, prog = 1, markProg = 1, maxW = 930, a = 1, seed = 3 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.font = `400 ${size}px ${BG}`;
    const widest = Math.max(...rows.map((r) => ctx.measureText(r.map((p) => p.s).join('')).width));
    if (widest > maxW) size *= maxW / widest;
    ctx.font = `400 ${size}px ${BG}`;
    ctx.textBaseline = 'alphabetic';
    const total = rows.reduce((q, r) => q + r.reduce((z, p) => z + [...p.s].length, 0), 0);
    let idx = 0;
    rows.forEach((parts, li) => {
      const yy = y + li * size * lead;
      let cx = x;
      for (const p of parts) {
        const pw = ctx.measureText(p.s.trimEnd()).width;
        if (p.mark) swash(ctx, cx - size * 0.05, yy - size * 0.42, pw + size * 0.1, size * 0.5, p.mark, markProg, seed + li * 3);
        cx += ctx.measureText(p.s).width;
      }
      cx = x;
      for (const p of parts) {
        let pre = '';
        for (const ch of [...p.s]) {
          const adv = ctx.measureText(pre + ch).width - ctx.measureText(pre).width;
          pre += ch;
          const ap = clamp((prog * (total + 5) - idx) / 5);
          if (ap > 0 && ch !== ' ') {
            const fl = ap < 1 ? Math.abs(Math.cos(Math.PI * (1 - ap) * 1.5)) : 1;
            ctx.save();
            ctx.translate(cx, yy - size * 0.36);
            ctx.scale(1, Math.max(0.05, fl));
            ctx.globalAlpha = a * clamp(ap * 3);
            ctx.fillStyle = p.c ?? INK;
            ctx.fillText(ch, 0, size * 0.36);
            ctx.restore();
          }
          cx += adv;
          idx++;
        }
      }
    });
    ctx.restore();
  }

  function note(ctx, str, x, y, { size = 50, col = INK, rot = -0.03, a = 1, prog = 1, align = 'left', card = false } = {}) {
    if (a <= 0.002 || prog <= 0) return 0;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.font = `700 ${size}px ${KA}`;
    const w = ctx.measureText(str).width;
    const x0 = align === 'center' ? -w / 2 : align === 'right' ? -w : 0;
    // yazılırken kart da yazıyla birlikte açılır (boş kart görünmesin)
    if (prog < 1) {
      ctx.beginPath();
      ctx.rect(x0 - size * 0.5, -size * 1.4, (w + size) * prog, size * 2.2);
      ctx.clip();
    }
    if (card) {
      ctx.save();
      ctx.shadowColor = 'rgba(30,18,10,0.3)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = card === true ? '#fbf6ea' : card;
      ctx.fillRect(x0 - size * 0.35, -size * 0.95, w + size * 0.7, size * 1.4);
      ctx.restore();
    }
    ctx.fillStyle = col;
    ctx.fillText(str, x0, 0);
    ctx.restore();
    return w;
  }

  // Bungee hap etiketi ("PROTEİN", "YAĞ")
  function pill(ctx, str, x, y, { col = P.teal, size = 44, a = 1, s = 1, rot = 0 } = {}) {
    if (a <= 0.002 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.font = `400 ${size}px ${BG}`;
    const w = ctx.measureText(str).width + size * 1.1;
    const h = size * 1.5;
    ctx.shadowColor = 'rgba(10,6,4,0.4)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#fff7e6';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, 0, size * 0.08);
    ctx.restore();
  }

  function tag(ctx, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(246,239,225,0.93)';
    ctx.beginPath();
    ctx.roundRect(60, 160, 470, 96, 16);
    ctx.fill();
    K.appIcon(ctx, 104, 206, 62);
    ctx.fillStyle = INK;
    ctx.font = `400 23px ${BG}`;
    ctx.fillText('TABAĞINDAKİ BİLİM', 152, 204);
    ctx.font = `700 22px ${KA}`;
    ctx.fillStyle = 'rgba(42,28,20,0.7)';
    ctx.fillText('YUP Akademi · Lup', 152, 236);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Skorbord: 5×7 LED nokta rakamları
  // ---------------------------------------------------------------------------
  const GLYPH = {
    0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    3: ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
    4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
    6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
    7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    9: ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
    '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
    '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
    '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
    "'": ['00110', '00110', '00100', '01000', '00000', '00000', '00000'],
    ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  };
  // Tek bir karakter; flip: 0…1 (1 = yerine oturdu), çevrilirken dikey ezilir
  function ledChar(ctx, ch, x, y, d, { flip = 1, col = LED } = {}) {
    const gph = GLYPH[ch] ?? GLYPH[' '];
    const sy = flip < 1 ? Math.max(0.08, Math.abs(Math.cos(Math.PI * (1 - flip)))) : 1;
    ctx.save();
    ctx.translate(x, y + 3.5 * d);
    ctx.scale(1, sy);
    ctx.translate(0, -3.5 * d);
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 5; c++) {
        const on = gph[r][c] === '1';
        ctx.fillStyle = on ? col : 'rgba(255,176,46,0.09)';
        ctx.beginPath();
        ctx.arc(c * d + d / 2, r * d + d / 2, d * 0.36, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  function ledText(ctx, str, x, y, d, { flips = [], col = LED, glow = 1 } = {}) {
    const chars = [...str];
    const w = chars.length * 6 * d - d;
    ctx.save();
    if (glow > 0) {
      ctx.shadowColor = 'rgba(255,170,40,0.85)';
      ctx.shadowBlur = d * 1.4 * glow;
    }
    chars.forEach((ch, i) => ledChar(ctx, ch, x + i * 6 * d, y, d, { flip: flips[i] ?? 1, col }));
    ctx.restore();
    return w;
  }
  // Çevrilen rakam: t0'dan önce boş, t0…t0+dur arasında rastgele rakamlar döner, sonra hedefte durur
  function rolling(t, t0, target, dur = 0.55) {
    if (t < t0) return { s: target.replace(/./g, ' '), f: [] };
    if (t >= t0 + dur) return { s: target, f: [] };
    const k = Math.floor((t - t0) / 0.06);
    const s = [...target].map((c, i) => (/\d/.test(c) ? String(Math.floor(hash(k + i * 7, 13) * 10)) : c)).join('');
    const f = [...target].map(() => ((t - t0) % 0.06) / 0.06);
    return { s, f };
  }
  function board(ctx, x, y, w, h, { a = 1, s = 1 } = {}) {
    if (a <= 0.002 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 14;
    ctx.fillStyle = '#211c18';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 18);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#4a3f33';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.fillStyle = '#8a7a63';
    for (const [bx, by] of [[-w / 2 + 18, -h / 2 + 18], [w / 2 - 18, -h / 2 + 18], [-w / 2 + 18, h / 2 - 18], [w / 2 - 18, h / 2 - 18]]) {
      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
  function boardLabel(ctx, str, x, y, { size = 34, a = 1, col = LED, align = 'center' } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.font = `400 ${size}px ${BG}`;
    ctx.textAlign = align;
    ctx.fillStyle = col;
    ctx.shadowColor = 'rgba(255,170,40,0.6)';
    ctx.shadowBlur = 8;
    ctx.fillText(str, x, y);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Çizim parçaları
  // ---------------------------------------------------------------------------
  const W = (api, id, i) => api.cue(id, 0) + (window.DUDAK?.[id]?.[i]?.[0] ?? i * 0.4);
  function lup(ctx, t, api, id, x, y, h, st = {}) {
    LUP.draw(ctx, x, y, h, { talk: LUP.say(api, id, t), ...st }, t);
  }
  // Kırık kabuk yarısı (kodla): siyah, krem kenarlı badem biçimi
  function shell(ctx, x, y, s, rot, a = 1) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.fillStyle = '#1f1a17';
    ctx.strokeStyle = '#e9dcc0';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.quadraticCurveTo(-4, -9, 14, -3);
    ctx.quadraticCurveTo(6, 7, -14, 0);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  // Çıt: ağızdan iki kabuk yarısı fırlar ve düşer, küçük çatırtı çizgileri
  function crack(ctx, x, y, t, t0, { dir = 1, s = 1.6 } = {}) {
    const u = t - t0;
    if (u < 0 || u > 1.3) return;
    if (u < 0.18) {
      ctx.save();
      ctx.strokeStyle = LED;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 1 - u / 0.18;
      for (let i = 0; i < 4; i++) {
        const th = -Math.PI / 2 + (i - 1.5) * 0.55;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(th) * 16, y + Math.sin(th) * 16);
        ctx.lineTo(x + Math.cos(th) * 34, y + Math.sin(th) * 34);
        ctx.stroke();
      }
      ctx.restore();
    }
    for (const side of [-1, 1]) {
      const vx = (40 + 70 * hash(t0 * 10, side + 3)) * side * dir;
      const vy = -120 - 80 * hash(t0 * 10, side + 5);
      shell(ctx, x + vx * u, y + vy * u + 520 * u * u, s, u * 9 * side, 1 - progress(u, 1.0, 1.3));
    }
  }
  // Hız göstergesi (kabuk = fren): k 0…1 ibrenin yeri
  function gauge(ctx, x, y, r, k, { a = 1 } = {}) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#fbf5e6';
    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI, TAU);
    ctx.lineTo(r, r * 0.22);
    ctx.lineTo(-r, r * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = 'transparent';
    const segs = [['#3d9b6b', 0, 0.33], ['#f2a516', 0.33, 0.66], ['#d2452f', 0.66, 1]];
    for (const [c, a0, a1] of segs) {
      ctx.strokeStyle = c;
      ctx.lineWidth = r * 0.16;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.78, Math.PI + a0 * Math.PI, Math.PI + a1 * Math.PI);
      ctx.stroke();
    }
    const th = Math.PI + k * Math.PI;
    ctx.strokeStyle = '#1b1512';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(th) * r * 0.7, Math.sin(th) * r * 0.7);
    ctx.stroke();
    ctx.fillStyle = '#1b1512';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, TAU);
    ctx.fill();
    ctx.font = `400 34px ${BG}`;
    ctx.textAlign = 'center';
    ctx.fillText('HIZ', 0, r * 0.15 + 4);
    ctx.restore();
  }
  // Yapboz parçası (kodla): kare ve iki çıkıntı; missing → kesik çizgili boşluk
  function piece(ctx, x, y, s, col, { missing = false, a = 1, pulse = 0 } = {}) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    const h = s / 2;
    const k = s * 0.17;
    ctx.beginPath();
    ctx.moveTo(-h, -h);
    ctx.lineTo(-k, -h);
    ctx.arc(0, -h, k, Math.PI, 0, false);
    ctx.lineTo(h, -h);
    ctx.lineTo(h, -k);
    ctx.arc(h, 0, k, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(h, h);
    ctx.lineTo(-h, h);
    ctx.closePath();
    if (missing) {
      ctx.fillStyle = `rgba(210,69,47,${0.1 + 0.15 * pulse})`;
      ctx.fill();
      ctx.setLineDash([12, 10]);
      ctx.strokeStyle = '#d2452f';
      ctx.lineWidth = 5;
      ctx.stroke();
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = col;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#2a1c14';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    ctx.restore();
  }
  function plane(ctx, x, y, s, rot) {
    pic(ctx, 'kulah', x, y, 120 * s, { rot: rot + 0.6 });
  }

  // Arkadaşın'ın ağzı (ark_citla görselinde)
  const MOUTH = [0.63, 0.335];
  const CRACKS = (t0, t1, step) => {
    const out = [];
    for (let x = t0; x < t1; x += step) out.push(x);
    return out;
  };

  // ---------------------------------------------------------------------------
  // Sahneler
  // ---------------------------------------------------------------------------
  const draw = {};

  // 1 · Maç ya da dizi gecesi: Arkadaşın çekirdek çitliyor
  draw['k-hook'] = function (ctx, t, api) {
    const id = 'k-hook';
    const s0 = api.S0(id);
    const meatT = W(api, id, 11); // kıymadan
    const AX = 430;
    const AY = 1960;
    const AH = 1080;
    const [mx, my] = at('ark_citla', AX, AY, AH, 0.5, 1, MOUTH[0], MOUTH[1]);
    const cracks = CRACKS(s0 + 0.5, api.S1(id) + 0.2, 0.78);
    const inner = (c) => {
      cover(c, 'ekran', { zoom: 1.05 });
      tvGlow(c, t, 1, { zoom: 1.05 });
      const bob = cracks.reduce((q, c0) => q + Math.exp(-Math.pow((t - c0) / 0.07, 2)), 0);
      pich(c, 'ark_citla', AX, AY + bob * 6, AH, { ax: 0.5, ay: 1 });
      for (const c0 of cracks) crack(c, mx, my + bob * 6, t, c0, { dir: 1 });
    };
    const p = LUP.intro(ctx, t, s0, inner, { cx: 540, cy: 1200, r0: 420 });
    // yere birikmiş kabuklar
    const nShell = cracks.filter((c0) => t > c0 + 1).length;
    for (let i = 0; i < nShell * 2; i++) shell(ctx, 120 + hash(i, 3) * 840, 1880 + hash(i, 4) * 30, 1.7, hash(i, 5) * 6);
    // Lup tezahürat (merceğin dışına çıkınca)
    if (p >= 1) {
      const hp = LUP.hop(t, s0 + 1.15, { from: 280 });
      pich(ctx, 'poz_tezahurat', 860, 1900 + hp.dy, 520, { ax: 0.5, ay: 1, a: hp.a, rot: Math.sin(t * 5) * 0.03 });
    }
    strip(ctx, 384, 2, 100);
    tabela(ctx, [[{ s: 'GRAM GRAM KIYMADAN' }], [{ s: 'FAZLA PROTEİN', mark: P.marker }]], 80, 384, { size: 84, lead: 1.15, markProg: progress(t, meatT, meatT + 0.45) });
    tag(ctx, progress(t, s0 + 1.0, s0 + 1.3) * (p >= 1 ? 1 : 0));
    finish(ctx, t, { vig: 0.22 });
  };

  // 2 · Skorbord ve terazi: 100 g'da 28 g'a 19 g
  // terazi görselinde kefelerin üst orta noktaları
  const PAN_L = [0.155, 0.1];
  const PAN_R = [0.855, 0.1];
  draw['k-sayi'] = function (ctx, t, api) {
    const id = 'k-sayi';
    const s0 = api.S0(id);
    const gT = W(api, id, 0); // 100
    const cT = W(api, id, 2); // çekirdekte
    const n28 = W(api, id, 3);
    const mT = W(api, id, 9); // kıymada
    const n19 = W(api, id, 10);
    cover(ctx, 'mutfak');
    // terazi
    const TX = 560;
    const TY = 1560;
    const TH = 330;
    pich(ctx, 'terazi', TX, TY, TH, { ax: 0.5, ay: 1 });
    const [lx, ly] = at('terazi', TX, TY, TH, 0.5, 1, PAN_L[0], PAN_L[1]);
    const [rx, ry] = at('terazi', TX, TY, TH, 0.5, 1, PAN_R[0], PAN_R[1]);
    const ka = api.pop(t, cT - 0.1, 0.45);
    const kma = api.pop(t, mT - 0.1, 0.45);
    if (ka > 0) pich(ctx, 'kase', lx, ly + 38, 170 * ka, { ax: 0.5, ay: 1 });
    if (kma > 0) pich(ctx, 'kiyma', rx + 10, ry + 62, 170 * kma, { ax: 0.5, ay: 1 });
    if (t > gT) {
      note(ctx, '100 g', lx + 50, TY + 80, { size: 46, align: 'center', rot: -0.03, prog: progress(t, gT, gT + 0.4), card: true });
      note(ctx, '100 g', rx, TY + 80, { size: 46, align: 'center', rot: 0.03, prog: progress(t, gT + 0.2, gT + 0.6), card: true });
    }
    if (t > cT) note(ctx, 'çekirdek içi', lx - 30, ly - 220, { size: 40, col: P.teal, align: 'center', rot: -0.05, prog: progress(t, cT, cT + 0.5) });
    if (t > mT) note(ctx, 'çiğ kıyma', rx + 20, ry - 220, { size: 40, col: '#c8332b', align: 'center', rot: 0.04, prog: progress(t, mT, mT + 0.5) });
    // skorbord
    const ba = api.pop(t, s0 + 0.15, 0.45);
    if (ba > 0) {
      const BX = 540;
      const BY = 760;
      board(ctx, BX, BY, 940, 330, { s: ba });
      if (ba > 0.95) {
        boardLabel(ctx, 'ÇEKİRDEK', 290, 660, { size: 36 });
        boardLabel(ctx, 'KIYMA', 790, 660, { size: 36 });
        const d = 22;
        const a28 = rolling(t, n28 - 0.35, '28');
        const a19 = rolling(t, n19 - 0.35, '19');
        ledText(ctx, a28.s, 290 - (2 * 6 * d - d) / 2, 700, d, { flips: a28.f });
        ledText(ctx, a19.s, 790 - (2 * 6 * d - d) / 2, 700, d, { flips: a19.f });
        ledText(ctx, '-', 540 - (5 * d) / 2, 700, d, { glow: 0.6 });
        boardLabel(ctx, 'GRAM PROTEİN / 100 G', 540, 900, { size: 24, col: 'rgba(255,190,90,0.75)' });
      }
      if (t > n19 + 0.4) note(ctx, 'USDA verisi', 900, 970, { size: 34, col: '#fbf5e6', align: 'center', rot: -0.03, a: progress(t, n19 + 0.4, n19 + 0.7), card: 'rgba(30,20,12,0.6)' });
    }
    lup(ctx, t, api, id, 130, 1890, 360, { face: t > n28 ? 'hayret' : 'merak', arms: t > n28 ? 'yukari' : 'anlat', gx: 0.7, gy: -0.6 });
    strip(ctx, 384, 1, 100);
    tabela(ctx, [[{ s: 'PROTEİN SKORU', mark: P.marker }]], 80, 384, { size: 92, prog: progress(t, s0 + 0.05, s0 + 0.5), markProg: progress(t, n28, n28 + 0.4) });
    tag(ctx);
    finish(ctx, t, { vig: 0.2 });
  };

  // 3 · Filizin beslenme çantası (Lup'un merceğinden toprak)
  draw['k-canta'] = function (ctx, t, api) {
    const id = 'k-canta';
    const s0 = api.S0(id);
    const tinyT = W(api, id, 2); // minicik
    const boxT = W(api, id, 7); // beslenme
    const sproutT = W(api, id, 9); // Filiz
    const protT = W(api, id, 13);
    const fatT = W(api, id, 15);
    cover(ctx, 'toprak');
    ctx.fillStyle = 'rgba(20,10,4,0.18)';
    ctx.fillRect(0, 0, 1080, 1920);
    // çekirdek → filiz
    const sa = api.pop(t, tinyT - 0.1, 0.45);
    const grow = progress(t, sproutT - 0.1, sproutT + 0.9, ease.out);
    if (sa > 0 && grow < 1) pic(ctx, 'kirik', 540, 760, 360 * sa * (1 - 0.3 * grow), { a: 1 - grow, rot: Math.sin(t * 3) * 0.03 });
    if (grow > 0) pic(ctx, 'filiz', 540, 900, 560, { ax: 0.5, ay: 1, sy: grow, sx: 0.7 + 0.3 * grow });
    if (grow > 0.3) note(ctx, 'filiz', 760, 610, { size: 48, col: '#2e7d5b', rot: -0.06, prog: progress(t, sproutT + 0.3, sproutT + 0.8), card: true });
    // beslenme çantası
    const ca = api.pop(t, boxT - 0.1, 0.5);
    if (ca > 0) {
      pic(ctx, 'canta', 540, 1240, 380 * ca, { rot: Math.sin(t * 2.5) * 0.02 });
      const pp = api.pop(t, protT - 0.1, 0.4);
      const fp = api.pop(t, fatT - 0.1, 0.4);
      const rise = (t0) => progress(t, t0 - 0.1, t0 + 0.6, ease.out);
      if (pp > 0) pill(ctx, 'PROTEİN', lerp(540, 300, rise(protT)), lerp(1200, 1010, rise(protT)), { col: P.teal, s: pp, rot: -0.08 });
      if (fp > 0) pill(ctx, 'YAĞ', lerp(540, 790, rise(fatT)), lerp(1200, 1010, rise(fatT)), { col: '#c98a12', s: fp, rot: 0.08 });
      if (t > boxT + 0.3) note(ctx, 'beslenme çantası', 540, 1460, { size: 46, col: '#fbf5e6', align: 'center', rot: -0.02, a: progress(t, boxT + 0.3, boxT + 0.6), card: 'rgba(30,20,12,0.6)' });
    }
    if (t > tinyT - 0.2) {
      const hp = LUP.hop(t, tinyT - 0.2, { from: 280 });
      pich(ctx, 'poz_ic', 880, 1900 + hp.dy, 500, { ax: 0.5, ay: 1, a: hp.a });
    }
    strip(ctx, 384, 2, 100);
    tabela(ctx, [[{ s: 'FİLİZİN' }], [{ s: 'BESLENME ÇANTASI', mark: P.markerTeal }]], 80, 384, { size: 84, lead: 1.15, prog: progress(t, s0 + 0.05, s0 + 0.6), markProg: progress(t, boxT, boxT + 0.45) });
    tag(ctx);
    finish(ctx, t, { vig: 0.24 });
  };

  // 4 · Ama: binden fazla çekirdek, neredeyse bir maç
  draw['k-ama'] = function (ctx, t, api) {
    const id = 'k-ama';
    const s0 = api.S0(id);
    const amaT = W(api, id, 0);
    const cnt0 = W(api, id, 4); // 100
    const cnt1 = W(api, id, 12); // çitlemen
    const thouT = W(api, id, 9); // binden
    const nearT = W(api, id, 14); // neredeyse
    const matchT = W(api, id, 16); // maç
    const diziT = W(api, id, 20); // dizi
    const shake = Math.exp(-Math.pow((t - amaT) / 0.12, 2)) * 10;
    ctx.save();
    ctx.translate(Math.sin(t * 60) * shake, 0);
    cover(ctx, 'ekran', { zoom: 1.12, zy: 1100 });
    tvGlow(ctx, t, 0.9, { zoom: 1.12 });
    ctx.fillStyle = 'rgba(12,10,20,0.18)';
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.restore();
    // kabuk yağmuru: sayaç hızlandıkça yoğunlaşır
    const rain = progress(t, cnt0 - 0.2, cnt0 + 0.6) * (1 - 0.6 * progress(t, matchT + 1.0, matchT + 2.0));
    if (rain > 0) {
      const n = Math.floor(70 * rain);
      for (let i = 0; i < n; i++) {
        const per = 1.4 + hash(i, 7);
        const u = ((t - cnt0) / per + hash(i, 8)) % 1;
        shell(ctx, hash(i, 9) * 1080, lerp(-40, 1960, u), 1.6 + hash(i, 10), u * 12 + i, 0.95);
      }
    }
    // büyüyen kabuk yığını (önde)
    const heap = progress(t, cnt0, matchT + 0.5, ease.out);
    if (heap > 0) {
      for (let i = 0; i < 4; i++) pic(ctx, 'yigin', 140 + i * 270, 1960 + (1 - heap) * 260 - i * 6, 560 * (0.6 + 0.4 * heap), { ax: 0.5, ay: 0.85, rot: (hash(i, 2) - 0.5) * 0.2 });
    }
    // Arkadaşın ve Lup
    pich(ctx, 'ark_ic', 330, 1830 + (1 - heap) * 40, 900, { ax: 0.5, ay: 1 });
    if (t > thouT - 0.2) {
      const hp = LUP.hop(t, thouT - 0.2, { from: 300 });
      pich(ctx, 'poz_dag', 800, 1915 + hp.dy, 520, { ax: 0.5, ay: 1, a: hp.a });
    }
    // sayaç skorbordu
    const ba = api.pop(t, cnt0 - 0.3, 0.4);
    if (ba > 0) {
      board(ctx, 540, 720, 940, 300, { s: ba });
      if (ba > 0.95) {
        boardLabel(ctx, 'ÇEKİRDEK', 300, 625, { size: 32 });
        boardLabel(ctx, 'DAKİKA', 800, 625, { size: 32 });
        const k = ease.in(progress(t, cnt0, cnt1 + 0.2));
        const n = Math.round(k * 1100);
        const sN = t > cnt1 + 0.2 ? '1100+' : String(n).padStart(4, '0') + ' ';
        const d = 15;
        ledText(ctx, sN, 300 - (5 * 6 * d - d) / 2, 670, d);
        const mk = progress(t, nearT - 0.1, matchT + 0.2);
        const mins = Math.round(mk * 90);
        const sM = String(mins).padStart(2, '0') + "'";
        ledText(ctx, sM, 800 - (3 * 6 * d - d) / 2, 670, d, { col: mins >= 90 ? '#ff5a3a' : LED });
        boardLabel(ctx, '100 G KIYMANIN PROTEİNİ İÇİN', 540, 840, { size: 22, col: 'rgba(255,190,90,0.75)' });
      }
    }
    if (t > diziT) note(ctx, 'ya da yarım dizi bölümü', 640, 990, { size: 44, col: '#c8332b', align: 'center', rot: -0.04, prog: progress(t, diziT, diziT + 0.7), card: true });
    strip(ctx, 384, 1, 100);
    tabela(ctx, [[{ s: 'AMA BİR SORUN VAR', mark: P.markerRed }]], 80, 384, { size: 84, prog: progress(t, s0 + 0.05, s0 + 0.5), markProg: progress(t, thouT, thouT + 0.4) });
    tag(ctx);
    finish(ctx, t, { vig: 0.24 });
  };

  // 5 · Kabuk bir fren; bir de proteinin bir yapı taşı az
  draw['k-kabuk'] = function (ctx, t, api) {
    const id = 'k-kabuk';
    const s0 = api.S0(id);
    const brakeT = W(api, id, 3); // fren
    const one = W(api, id, 5); // tek
    const two = W(api, id, 6); // tek
    const screenT = W(api, id, 7); // ekrandan
    const partT = W(api, id, 11) - 0.12; // Bir de
    const blocksT = W(api, id, 17); // yapı taşları
    const fewT = W(api, id, 18); // az
    const meatT = W(api, id, 20); // etin
    if (t < partT) {
      cover(ctx, 'ekran', { zoom: 1.05 });
      tvGlow(ctx, t, 1, { zoom: 1.05 });
      const AX = 360;
      const AY = 1960;
      const AH = 1000;
      const [mx, my] = at('ark_citla', AX, AY, AH, 0.5, 1, MOUTH[0], MOUTH[1]);
      pich(ctx, 'ark_citla', AX, AY, AH, { ax: 0.5, ay: 1 });
      for (const c0 of [one, two, screenT + 0.4, screenT + 1.4]) crack(ctx, mx, my, t, c0);
      // hız göstergesi: ibre kırmızıdan yeşile düşer
      const ga = api.pop(t, s0 + 0.2, 0.45);
      const k = lerp(0.88, 0.12, progress(t, brakeT - 0.2, brakeT + 0.6, ease.inOut)) + Math.sin(t * 9) * 0.015;
      if (ga > 0) {
        ctx.save();
        ctx.translate(780, 760);
        ctx.scale(ga, ga);
        gauge(ctx, 0, 0, 210, k);
        ctx.restore();
        if (t > brakeT) note(ctx, 'fren!', 900, 880, { size: 58, col: '#c8332b', rot: -0.08, prog: progress(t, brakeT, brakeT + 0.4), card: true });
      }
      if (t > one) note(ctx, '1', 640, 1040, { size: 70, col: '#fbf5e6', a: 1 - progress(t, one + 0.7, one + 1.0) });
      if (t > two) note(ctx, '2', 720, 1040, { size: 70, col: '#fbf5e6', a: 1 - progress(t, two + 0.7, two + 1.0) });
      if (t > screenT) note(ctx, 'gözler ekranda', 700, 1160, { size: 46, col: '#fbf5e6', rot: -0.03, a: progress(t, screenT, screenT + 0.3), card: 'rgba(30,20,12,0.6)' });
      if (t > s0 + 0.3) {
        const hp = LUP.hop(t, s0 + 0.3, { from: 260 });
        pich(ctx, 'poz_citla', 880, 1905 + hp.dy, 500, { ax: 0.5, ay: 1, a: hp.a });
      }
      strip(ctx, 384, 1, 100);
      tabela(ctx, [[{ s: 'KABUK BİR FREN', mark: P.marker }]], 80, 384, { size: 90, prog: progress(t, s0 + 0.05, s0 + 0.5), markProg: progress(t, brakeT, brakeT + 0.4) });
    } else {
      paper(ctx, t, { stains: [[930, 1650, 90, 41]] });
      // yapboz: 3×2, bir parça eksik
      const cols = [P.teal, '#c98a12', '#d2452f', '#4a73b8', '#2e7d5b', '#8c5a9e'];
      const S = 190;
      const X0 = 540 - S * 1.05;
      const Y0 = 860;
      const miss = 4;
      for (let i = 0; i < 6; i++) {
        const cx = X0 + (i % 3) * S * 1.05;
        const cy = Y0 + Math.floor(i / 3) * S * 1.05;
        const pa = api.pop(t, partT + 0.1 + i * 0.12, 0.35);
        if (i === miss) {
          const pulse = t > fewT ? 0.5 + 0.5 * Math.sin((t - fewT) * 8) : 0;
          piece(ctx, cx, cy, S, cols[i], { missing: true, a: pa, pulse });
        } else if (pa > 0) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.scale(pa, pa);
          ctx.translate(-cx, -cy);
          piece(ctx, cx, cy, S, cols[i]);
          ctx.restore();
        }
      }
      if (t > blocksT) note(ctx, 'proteinin yapı taşları', 540, 700, { size: 48, align: 'center', rot: -0.02, prog: progress(t, blocksT, blocksT + 0.6) });
      if (t > fewT) {
        const mx = X0 + 1 * S * 1.05;
        const my = Y0 + S * 1.05;
        note(ctx, 'lizin az', mx + 40, my + 200, { size: 52, col: '#c8332b', rot: -0.04, prog: progress(t, fewT, fewT + 0.5), card: true });
      }
      if (t > meatT) {
        pic(ctx, 'kase', 300, 1390, 220, { a: progress(t, meatT, meatT + 0.3) });
        pic(ctx, 'kiyma', 760, 1390, 230, { a: progress(t, meatT + 0.1, meatT + 0.4) });
        note(ctx, '≠', 530, 1420, { size: 110, col: '#c8332b', align: 'center', rot: 0, a: progress(t, meatT + 0.2, meatT + 0.5) });
        note(ctx, 'etin yerini tek başına tutmaz', 520, 1580, { size: 46, col: INK, align: 'center', rot: -0.02, prog: progress(t, meatT + 0.3, meatT + 1.2) });
      }
      lup(ctx, t, api, id, 950, 1900, 340, { face: t > fewT ? 'endise' : 'odak', arms: t > blocksT && t < meatT ? 'gosterSol' : 'anlat', gx: -0.8, gy: -0.5 });
      strip(ctx, 384, 1, 100);
      tabela(ctx, [[{ s: 'BİR PARÇA EKSİK', mark: P.markerRed }]], 80, 384, { size: 90, prog: progress(t, partT, partT + 0.5), markProg: progress(t, fewT, fewT + 0.4) });
    }
    tag(ctx);
    finish(ctx, t, { vig: 0.22 });
  };

  // 6 · Arkadaşına gönder
  draw['k-cta'] = function (ctx, t, api) {
    const id = 'k-cta';
    const { S0, end, fadeIn, pop } = api;
    const s0 = S0(id);
    const c1 = api.cue(id, 1);
    paper(ctx, t, { stains: [[120, 1760, 110, 91]] });
    tabela(ctx, [[{ s: 'ÇEKİRDEKSİZ' }], [{ s: 'MAÇ DA DİZİ DE' }], [{ s: 'İZLEYEMEYEN' }], [{ s: 'ARKADAŞINA' }], [{ s: 'GÖNDER.', mark: P.marker }]], 64, 300, { size: 64, lead: 1.18, prog: progress(t, s0 + 0.05, s0 + 0.9), markProg: progress(t, s0 + 0.8, s0 + 1.2), maxW: 560 });
    const PX = 830;
    const PY = 640;
    const pa = pop(t, s0 + 0.15, 0.5);
    if (pa > 0) {
      ctx.save();
      ctx.translate(PX, PY);
      ctx.rotate(0.07);
      ctx.scale(pa, pa);
      ctx.shadowColor = 'rgba(60,40,20,0.28)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = '#fffdf7';
      ctx.fillRect(-150, -200, 300, 400);
      ctx.shadowColor = 'transparent';
      ctx.save();
      ctx.beginPath();
      ctx.rect(-126, -176, 252, 300);
      ctx.clip();
      ctx.drawImage(IMG.ekran, 0, 500, 640, 760, -126, -176, 252, 300);
      tvGlow(ctx, t, 0.6, { zoom: 0.25 });
      pich(ctx, 'ark_citla', 0, 140, 300, { ax: 0.5, ay: 1 });
      ctx.restore();
      note(ctx, 'maç gecesi', 0, 172, { size: 36, col: 'rgba(42,28,20,0.7)', align: 'center', rot: -0.02 });
      tape(ctx, 0, -202, 130, -0.05);
      ctx.restore();
    }
    const tap = end(id) + 0.35;
    const throwK = progress(t, s0 + 0.7, s0 + 1.0, ease.inOut);
    const back = progress(t, s0 + 1.3, s0 + 1.7, ease.inOut);
    const reach = progress(t, tap - 0.7, tap - 0.08, ease.inOut);
    const throwPose = { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.2, y: -1.25, el: 'acik', d: [0.2, -1] } };
    const windUp = { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.9, y: 0.6, el: 'yumruk', d: [1, 0.3] } };
    const tapPose = { l: { x: -2.15, y: 0.95, el: 'isaret', d: [-1, 0.2] }, r: { x: 1.4, y: 1.62, el: 'acik', d: [0.3, 1] } };
    let arms = LUP.mix(windUp, throwPose, throwK);
    if (back > 0) arms = LUP.mix(throwPose, 'anlat', back);
    if (reach > 0) arms = LUP.mix('anlat', tapPose, reach);
    const done = t > tap;
    lup(ctx, t, api, id, 860, 1830, 560, {
      ...LUP.hop(t, s0 + 0.05, { from: 300 }),
      face: done ? 'mutlu' : t > c1 ? 'gulum' : 'merak',
      gx: reach > 0 ? -0.9 : -0.3,
      gy: reach > 0 ? 0.4 : -0.6,
      arms,
    });
    // çekirdek külahı fırlatılır, fotoğrafa uçar; arkasında kabuklar
    const fly = progress(t, s0 + 1.0, s0 + 1.55, ease.inOut);
    if (fly > 0 && fly < 1) {
      const x = lerp(930, PX, fly) + Math.sin(Math.PI * fly) * 160;
      const y = lerp(1180, PY + 40, fly) - Math.sin(Math.PI * fly) * 120;
      plane(ctx, x, y, lerp(1.3, 0.7, fly), fly * 6);
      for (let i = 1; i < 5; i++) shell(ctx, x - i * 36, y + i * 22, 1.5, i + t * 6, 0.8 - i * 0.15);
    }
    if (t > s0 + 1.55) note(ctx, 'gönderildi ✓', 640, 935, { size: 46, col: P.teal, a: fadeIn(t, s0 + 1.55, 0.25), rot: -0.03 });
    const la = pop(t, s0 + 0.25, 0.6);
    if (la > 0) {
      ctx.save();
      ctx.translate(160, 1225);
      ctx.scale(la, la);
      K.appIcon(ctx, 0, 0, 140, { reveal: progress(t, s0 + 0.5, s0 + 1.3, ease.inOut), shine: progress(t, s0 + 1.4, s0 + 2.1) });
      ctx.restore();
    }
    const wa = fadeIn(t, s0 + 0.7, 0.4);
    K.T(ctx, 'YUP Akademi', 255, 1205, { size: 60, weight: 900, color: P.teal, align: 'left', alpha: wa });
    note(ctx, "Lup'la bak.", 258, 1276, { size: 52, col: INK, a: wa, rot: -0.02 });
    const ba = fadeIn(t, s0 + 1.1, 0.35);
    if (ba > 0) {
      const press = Math.exp(-(((t - tap) / 0.09) ** 2));
      ctx.save();
      ctx.globalAlpha *= ba;
      ctx.translate(390, 1560);
      ctx.scale(1 - 0.06 * press, 1 - 0.06 * press);
      ctx.font = `400 40px ${BG}`;
      const label = done ? 'ABONE OLUNDU ✓' : 'ABONE OL';
      const w = Math.max(400, ctx.measureText(label).width + 90);
      ctx.shadowColor = 'rgba(40,25,15,0.3)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = done ? '#fffaf0' : '#c8332b';
      ctx.beginPath();
      ctx.roundRect(-w / 2, -50, w, 100, 50);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = 5;
      ctx.strokeStyle = done ? P.teal : '#8f1f19';
      ctx.stroke();
      ctx.fillStyle = done ? P.teal : '#fffaf0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 0, 4);
      ctx.restore();
    }
    tag(ctx);
    finish(ctx, t);
  };

  // ---------------------------------------------------------------------------
  // Ses (müzik yatağı, kanca, geçişler, ortam ve kapanış def.ses ile ses.js'ten)
  // ---------------------------------------------------------------------------
  function score(m, hz, api) {
    const V = (t, tur, g) => Y.vurgu(m, t, tur, { gain: g ?? 1 });
    // 1 kanca: her çitlemede çıt
    for (const c0 of CRACKS(api.S0('k-hook') + 0.5, api.S1('k-hook') + 0.2, 0.78)) V(c0, 'citla');
    // 2 skor
    const sy = 'k-sayi';
    V(W(api, sy, 2) - 0.1, 'pop');
    V(W(api, sy, 9) - 0.1, 'pop');
    for (const n of [3, 10]) {
      const t0 = W(api, sy, n) - 0.35;
      for (let i = 0; i < 8; i++) m.tick(t0 + i * 0.06, { gain: 0.05, tone: 3800 });
      V(t0 + 0.55, 'sayi');
    }
    // 3 çanta
    const ca = 'k-canta';
    V(W(api, ca, 2) - 0.1, 'pop');
    V(W(api, ca, 7) - 0.1, 'tik');
    V(W(api, ca, 9) - 0.1, 'sihir');
    V(W(api, ca, 13) - 0.1, 'pop', 0.8);
    V(W(api, ca, 15) - 0.1, 'pop', 0.8);
    // 4 ama: sayaç tıkırtısı, kabuk yağmuru, maç düdüğü
    const am = 'k-ama';
    V(W(api, am, 0), 'soru');
    const c0 = W(api, am, 4);
    const c1 = W(api, am, 12) + 0.2;
    for (let x = c0, step = 0.12; x < c1; x += step, step = Math.max(0.035, step * 0.93)) m.tick(x, { gain: 0.04, tone: 3600 });
    V(c1, 'sayi');
    for (let i = 0; i < 14; i++) V(c0 + 0.3 + i * 0.32 + hash(i, 4) * 0.1, 'citla', 0.45);
    m.whistle(W(api, am, 16) + 0.2, { dur: 0.5, gain: 0.03 });
    V(W(api, am, 22), 'boing');
    // 5 kabuk: yavaş çıtlar, fren, yapboz
    const kb = 'k-kabuk';
    m.whoosh(W(api, kb, 3) - 0.2, { dur: 0.8, from: 2600, to: 260, gain: 0.05 });
    for (const n of [5, 6]) V(W(api, kb, n), 'citla');
    V(W(api, kb, 7) + 0.4, 'citla', 0.7);
    V(W(api, kb, 7) + 1.4, 'citla', 0.7);
    for (let i = 0; i < 5; i++) V(W(api, kb, 11) + i * 0.12, 'tik', 0.6);
    V(W(api, kb, 18), 'yanlis', 0.7);
    V(W(api, kb, 20), 'kagit');
    // 6 kapanış: külah uçuşu
    const s6 = api.S0('k-cta');
    m.whoosh(s6 + 0.95, { dur: 0.6, from: 700, to: 2600, gain: 0.05, panFrom: 0.3, panTo: -0.1 });
    V(s6 + 1.55, 'pop');
  }

  window.FILM = K.short({
    title: 'Karpuz çekirdeğinin proteini · YUP Akademi',
    series: 'TABAĞINDAKİ BİLİM',
    share: true,
    gap: 0.12,
    breath: 0.2,
    wipe: 0.45,
    transition: LUP.lensWipe,
    cut: ['k-ama'],
    extra: { 'k-hook': 0.4, 'k-sayi': 0.6, 'k-canta': 0.45, 'k-ama': 0.5, 'k-kabuk': 0.45, 'k-cta': 1.75 },
    lead: { 'k-hook': 0.1, 'k-sayi': 0.2, 'k-canta': 0.2, 'k-ama': 0.15, 'k-kabuk': 0.2, 'k-cta': 0.3 },
    titles: {
      'k-hook': 'Kıymadan fazla protein',
      'k-sayi': 'Protein skoru',
      'k-canta': 'Filizin beslenme çantası',
      'k-ama': 'Binden fazla çekirdek',
      'k-kabuk': 'Kabuk bir fren',
      'k-cta': 'Arkadaşına gönder',
    },
    ses: {
      muzik: 'komik',
      kanca: 'mercek',
      ortam: { 'k-hook': 'mac', 'k-ama': 'mac', 'k-sayi': 'mutfak' },
      gecisler: { 'k-ama': 'kesme' },
    },
    draw,
    score,
  });
})();
