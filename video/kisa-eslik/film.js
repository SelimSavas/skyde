/*
 * YUP Akademi · Lup · Vücudun Gizli Ayarları kısa video (1080×1920) — Bilmediğin şarkıya eşlik etmek
 *
 * Video bu hissi izleyiciye yaşatır: özgün melodi (melodi.js, Re majör, 120 BPM) önce bir kez baştan sona çalar;
 * ikinci çalışta yalnız cevap cümlesi çalar, notalar çalınmadan bir an önce soluk belirir ("beynin biliyor") ve melodi
 * son notadan önce durur. İzleyici sonu içinden tamamlar; fısıltıdan sonra son nota altın gibi yuvasına oturur.
 * Ardından neden: tahmin eden beyin (beyindeki konser salonu), ödül ve birlikte söylemek (düğünde halay).
 *
 * Görüntü: düğün salonu ve beyindeki konser salonu (ChatGPT, assets.js); porte, notalar, zıplayan karaoke topu,
 * nota akışı, nakarat kartları ve parıltılar kodla çizilir. Tipografi "plak ve porte" (yazi.js): başlıklar
 * Abril Fatface, kâğıt şerit üstünde soluk bir portenin üstüne yazılır ve melodi çalarken harfler vuruşla zıplar;
 * notlar Kalam (Lup'un el yazısı). Ses: YUP ses kimliği (yup-marka/ses.js): mercek kancası, merak müziği
 * (melodi çalarken susar), düğünde davul ritmi, vurgular ve Lup motifiyle kapanış.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, lerp, ease, progress, hash } = E;
  const K = window.YupKisa;
  const L = window.YupEl;
  const LUP = window.YupLup;
  const Y = window.YupSes;
  const MEL = window.MELODI;
  const { P, ink, paper, tape, finish, swash } = L;
  const TAU = Math.PI * 2;
  const INK = P.ink;
  const AB = '"Abril Fatface", Georgia, serif';
  const KA = 'Kalam, "Patrick Hand", cursive';
  const GOLD = '#f2b632';

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
  window.FILM_READY = Promise.all([window.FILM_READY, window.EL_FONTS_READY, window.ESLIK_FONTS_READY, ...loads]);

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
  // yüksekliğe göre çiz
  const pich = (ctx, k, x, y, h, o = {}) => A[k] && pic(ctx, k, x, y, (h * A[k].w) / A[k].h, o);
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
      ctx.fillStyle = `rgba(10,8,14,${dim})`;
      ctx.fillRect(0, 0, 1080, 1920);
    }
  }

  // ---------------------------------------------------------------------------
  // Tipografi
  // ---------------------------------------------------------------------------
  // Yırtık kenarlı kâğıt şerit; arkasında soluk porte çizgileri
  function strip(ctx, y, rows, lead = 104, a = 1) {
    if (a <= 0.002) return;
    const h = 136 + (rows - 1) * lead;
    const y0 = y - 96;
    ctx.save();
    ctx.globalAlpha *= 0.97 * a;
    ctx.shadowColor = 'rgba(10,6,4,0.35)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#f6efe1';
    ctx.beginPath();
    ctx.moveTo(46, y0);
    for (let i = 1; i <= 32; i++) ctx.lineTo(46 + (988 * i) / 32, y0 + (hash(i, 21) - 0.5) * 10);
    for (let i = 1; i <= 8; i++) ctx.lineTo(1034 + (hash(i, 22) - 0.5) * 6, y0 + (h * i) / 8);
    for (let i = 31; i >= 0; i--) ctx.lineTo(46 + (988 * i) / 32, y0 + h + (hash(i, 23) - 0.5) * 10);
    for (let i = 7; i >= 1; i--) ctx.lineTo(46 + (hash(i, 24) - 0.5) * 6, y0 + (h * i) / 8);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = 'transparent';
    // porte çizgileri (her satırın altında beş ince çizgi)
    ctx.strokeStyle = 'rgba(42,28,20,0.13)';
    ctx.lineWidth = 2;
    for (let r = 0; r < rows; r++) {
      const base = y + r * lead + 14;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(70, base - i * 17);
        ctx.lineTo(1010, base - i * 17);
        ctx.stroke();
      }
    }
    ctx.restore();
    tape(ctx, 540, y0 + 2, 150, -0.03, a);
  }

  // Afiş başlığı: Abril Fatface; satırlar = [[{ s, c, mark }...]]; beat: { t0, b } verilirse harfler vuruşla zıplar
  function afis(ctx, rows, x, y, { size = 96, lead = 1.08, prog = 1, t = 0, beat = null, markProg = 1, maxW = 920, a = 1, seed = 7 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.font = `400 ${size}px ${AB}`;
    const widest = Math.max(...rows.map((r) => ctx.measureText(r.map((p) => p.s).join('')).width));
    if (widest > maxW) size *= maxW / widest;
    ctx.font = `400 ${size}px ${AB}`;
    ctx.textBaseline = 'alphabetic';
    const total = rows.reduce((q, r) => q + r.reduce((z, p) => z + [...p.s].length, 0), 0);
    let idx = 0;
    rows.forEach((parts, li) => {
      const yy = y + li * size * lead;
      let cx = x;
      for (const p of parts) {
        const pw = ctx.measureText(p.s.trimEnd()).width;
        if (p.mark) swash(ctx, cx - size * 0.05, yy - size * 0.36, pw + size * 0.1, size * 0.44, p.mark, markProg, seed + li * 3);
        cx += ctx.measureText(p.s).width;
      }
      cx = x;
      for (const p of parts) {
        let pre = '';
        for (const ch of [...p.s]) {
          const adv = ctx.measureText(pre + ch).width - ctx.measureText(pre).width;
          pre += ch;
          const ap = clamp((prog * (total + 6) - idx) / 6);
          if (ap > 0 && ch !== ' ') {
            let dy = (1 - ease.out(ap)) * 26;
            if (beat) {
              // vuruşla zıplama: her harf vuruşun biraz arkasından gelir (dalga)
              const ph = (t - beat.t0 - idx * 0.012) / beat.b;
              if (ph > 0 && ph < beat.n) dy -= Math.pow(Math.max(0, Math.cos(Math.PI * (ph % 1))), 6) * size * 0.08;
            }
            ctx.globalAlpha = a * clamp(ap * 1.6);
            ctx.fillStyle = p.c ?? INK;
            ctx.fillText(ch, cx, yy + dy);
          }
          cx += adv;
          idx++;
        }
      }
    });
    ctx.restore();
  }

  // Kalam el yazısı not
  function note(ctx, str, x, y, { size = 50, col = INK, rot = -0.03, a = 1, prog = 1, align = 'left', card = false } = {}) {
    if (a <= 0.002 || prog <= 0) return 0;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.font = `700 ${size}px ${KA}`;
    const w = ctx.measureText(str).width;
    const x0 = align === 'center' ? -w / 2 : align === 'right' ? -w : 0;
    if (card) {
      ctx.save();
      ctx.shadowColor = 'rgba(30,18,10,0.3)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = card === true ? '#fbf6ea' : card;
      ctx.fillRect(x0 - size * 0.35, -size * 0.95, w + size * 0.7, size * 1.4);
      ctx.restore();
    }
    if (prog < 1) {
      ctx.beginPath();
      ctx.rect(x0 - 10, -size * 1.3, (w + 20) * prog, size * 2);
      ctx.clip();
    }
    ctx.fillStyle = col;
    ctx.fillText(str, x0, 0);
    ctx.restore();
    return w;
  }

  // Plak etiketi gibi yuvarlak rozet: "1 · DİNLE"
  function badge(ctx, n, str, x, y, { a = 1, s = 1, col = P.teal } = {}) {
    if (a <= 0.002 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.font = `400 34px ${AB}`;
    ctx.letterSpacing = '2px';
    const w = ctx.measureText(str).width + 120;
    ctx.shadowColor = 'rgba(10,6,4,0.35)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#1b1512';
    ctx.beginPath();
    ctx.roundRect(0, -36, w, 72, 36);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(36, 0, 28, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#fff6e0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(n), 36, 2);
    ctx.textAlign = 'left';
    ctx.fillText(str, 80, 2);
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
    ctx.font = `400 25px ${AB}`;
    ctx.letterSpacing = '2px';
    ctx.fillText('VÜCUDUN GİZLİ AYARLARI', 152, 204);
    ctx.font = `700 22px ${KA}`;
    ctx.letterSpacing = '1px';
    ctx.fillStyle = 'rgba(42,28,20,0.7)';
    ctx.fillText('YUP Akademi · Lup', 152, 236);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Porte ve notalar
  // ---------------------------------------------------------------------------
  const B = MEL.B; // bir vuruş (sn)
  // [nota, vuruş, başlangıç vuruşu]; son nota 14. vuruşta
  const NOTES = [];
  {
    let b = 0;
    for (const [n, d] of [...MEL.A, ...MEL.A2]) {
      NOTES.push({ n, d, b });
      b += d;
    }
    NOTES.push({ n: 'D5', d: 2, b, son: true });
  }
  const STEP = { 'C#5': 5, D5: 6, E5: 7, 'F#5': 8, G5: 9, A5: 10 };
  const SX0 = 128;
  const BW = 52.5;
  const YB = 860; // alt çizgi
  const GAP = 28;
  const nx = (nt) => SX0 + nt.b * BW + 18;
  const ny = (nt) => YB - STEP[nt.n] * (GAP / 2);

  function staffCard(ctx, { a = 1, s = 1 } = {}) {
    if (a <= 0.002 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(540, 760);
    ctx.scale(s, s);
    ctx.translate(-540, -760);
    ctx.shadowColor = 'rgba(8,6,20,0.45)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#fbf5e6';
    ctx.beginPath();
    ctx.roundRect(60, YB - 250, 960, 300, 22);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(42,28,20,0.75)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(96, YB - i * GAP);
      ctx.lineTo(990, YB - i * GAP);
      ctx.stroke();
    }
    // ölçü çizgileri (her 4 vuruşta) ve başta kalın çizgi
    ctx.lineWidth = 3;
    for (const b of [4, 8, 12]) {
      const x = SX0 + b * BW + 2;
      ctx.beginPath();
      ctx.moveTo(x, YB);
      ctx.lineTo(x, YB - 4 * GAP);
      ctx.stroke();
    }
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(98, YB);
    ctx.lineTo(98, YB - 4 * GAP);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(986, YB);
    ctx.lineTo(986, YB - 4 * GAP);
    ctx.stroke();
    ctx.restore();
  }

  // Nota: st: { a, glow, ghost, gold, pop }
  function noteGlyph(ctx, nt, { a = 1, glow = 0, ghost = false, gold = false, pop = 1, col = '#1b1512' } = {}) {
    if (a <= 0.01) return;
    const x = nx(nt);
    const y = ny(nt);
    ctx.save();
    ctx.globalAlpha *= a;
    if (glow > 0.01) {
      ctx.save();
      ctx.globalAlpha *= glow;
      const g = ctx.createRadialGradient(x, y, 4, x, y, 64);
      g.addColorStop(0, gold ? 'rgba(255,214,110,0.95)' : 'rgba(255,190,80,0.85)');
      g.addColorStop(1, 'rgba(255,190,80,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 64, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    const c = gold ? '#c98a12' : ghost ? P.teal : col;
    ctx.strokeStyle = c;
    ctx.fillStyle = c;
    // A5 için yardımcı çizgi
    if (STEP[nt.n] >= 10) {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 28, YB - 5 * GAP);
      ctx.lineTo(x + 28, YB - 5 * GAP);
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pop, pop);
    ctx.rotate(-0.38);
    ctx.lineWidth = ghost ? 3 : 4;
    if (ghost) ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 12, 0, 0, TAU);
    if (nt.d >= 2 || ghost) ctx.stroke();
    else ctx.fill();
    if (gold && nt.d >= 2) {
      ctx.fillStyle = 'rgba(255,214,110,0.9)';
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    // sap (aşağı, solda)
    ctx.lineWidth = 3.5;
    ctx.setLineDash(ghost ? [6, 5] : []);
    ctx.beginPath();
    ctx.moveTo(x - 15 * pop, y + 4);
    ctx.lineTo(x - 15 * pop, y + 3.4 * GAP);
    ctx.stroke();
    ctx.setLineDash([]);
    if (nt.d === 0.5) {
      // sekizlik bayrağı
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - 15, y + 3.4 * GAP);
      ctx.quadraticCurveTo(x + 6, y + 2.6 * GAP, x + 4, y + 1.6 * GAP);
      ctx.stroke();
    }
    if (nt.d === 1.5) {
      ctx.beginPath();
      ctx.arc(x + 26, y - 4, 4.5, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // Karaoke topu: notadan notaya zıplar
  function ball(ctx, t, plays, { a = 1, waitAt = null } = {}) {
    if (a <= 0.01 || !plays.length) return;
    let x;
    let y;
    const top = (nt) => ny(nt) - 62;
    if (t <= plays[0].t) {
      const nt = plays[0].nt;
      x = nx(nt);
      y = top(nt) - Math.abs(Math.sin((t - plays[0].t) * 6)) * 18;
    } else {
      let k = plays.length - 1;
      for (let i = 0; i < plays.length - 1; i++) if (t < plays[i + 1].t) {
        k = i;
        break;
      }
      const p0 = plays[k];
      const p1 = plays[k + 1] ?? (waitAt ? { t: p0.t + p0.nt.d * B, nt: waitAt } : null);
      if (p1 && t < p1.t) {
        const u = clamp((t - p0.t) / (p1.t - p0.t));
        x = lerp(nx(p0.nt), nx(p1.nt), u);
        y = lerp(top(p0.nt), top(p1.nt), u) - Math.sin(Math.PI * u) * 56;
      } else {
        const nt = (p1 ?? p0).nt;
        x = nx(nt);
        const lt = t - (p1 ?? p0).t;
        y = top(nt) - (waitAt ? Math.abs(Math.sin(lt * 5)) * 22 : 0);
      }
    }
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(20,10,4,0.25)';
    ctx.beginPath();
    ctx.ellipse(x, YB - 4 * GAP - 18, 12, 4, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = GOLD;
    ctx.strokeStyle = '#1b1512';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(x - 5, y - 5, 4, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // Küçük nota simgesi (uçuşan notalar)
  function miniNote(ctx, x, y, s, rot, col = '#1b1512', a = 1) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 6.5, -0.4, 0, TAU);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, -2);
    ctx.lineTo(8, -32);
    ctx.quadraticCurveTo(14, -24, 20, -20);
    ctx.stroke();
    ctx.restore();
  }
  function sparks(ctx, x, y, t, t0, { n = 14, r = 160, col = [GOLD, '#ff7a59', '#5fd1c6'] } = {}) {
    const u = clamp((t - t0) / 0.9);
    if (u <= 0 || u >= 1) return;
    ctx.save();
    for (let i = 0; i < n; i++) {
      const th = (i / n) * TAU + hash(i, 9) * 0.5;
      const d = r * ease.out(u) * (0.7 + hash(i, 4) * 0.5);
      const px = x + Math.cos(th) * d;
      const py = y + Math.sin(th) * d;
      ctx.globalAlpha = 1 - u;
      ctx.fillStyle = col[i % col.length];
      ctx.beginPath();
      const rr = 9 * (1 - u) + 2;
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        const q = k % 2 ? rr * 0.4 : rr;
        ctx.lineTo(px + Math.cos(a) * q, py + Math.sin(a) * q);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Zamanlama
  // ---------------------------------------------------------------------------
  const W = (api, id, i) => api.cue(id, 0) + (window.DUDAK?.[id]?.[i]?.[0] ?? i * 0.4);
  const T1 = (api) => api.end('e-hook') + 0.55; // 1. dinleme (bütün melodi)
  const T2 = (api) => api.end('e-tekrar') + 0.5; // 2. çalış (cevap cümlesi, sonda durur)
  const T3 = (api) => api.end('e-tamam') + 0.35; // son nota
  const plays1 = (api) => NOTES.map((nt) => ({ t: T1(api) + nt.b * B, nt }));
  const plays2 = (api) => NOTES.filter((nt) => nt.b >= 8 && !nt.son).map((nt) => ({ t: T2(api) + (nt.b - 8) * B, nt }));
  const SON = NOTES[NOTES.length - 1];

  function lup(ctx, t, api, id, x, y, h, st = {}) {
    LUP.draw(ctx, x, y, h, { talk: LUP.say(api, id, t), ...st }, t);
  }

  // ---------------------------------------------------------------------------
  // Sahneler
  // ---------------------------------------------------------------------------
  const draw = {};

  // 1–3 · Düğün: kanca, 1. dinleme, 2. çalışta eşlik, durma ve son nota
  function wedding(ctx, t, api, id) {
    const s0 = api.S0('e-hook');
    const t1 = T1(api);
    const t2 = T2(api);
    const t3 = T3(api);
    const deneT = W(api, 'e-hook', 13); // "dene"
    const tek0 = api.S0('e-tekrar');
    const phase2 = t >= tek0;
    const done = t >= t3;
    const melody1 = t >= t1 - 0.1 && t < t1 + 8.6;
    const bob = (t0, n) => {
      const ph = (t - t0) / B;
      return ph > 0 && ph < n ? Math.pow(Math.max(0, Math.cos(Math.PI * (ph % 1))), 4) : 0;
    };
    const inner = (c) => {
      cover(c, 'dugun', { zoom: 1.04 });
      // Arkadaşın: halay, sonra "sözleri bilmeden" omuz silkerek söyler, sonda yine halay
      const ark = phase2 && !done ? 'ark_soyle' : 'ark_halay';
      const b1 = bob(t1, 16) + bob(t2, 6) + (done ? bob(t3, 4) : 0);
      pich(c, ark, 300, 1950 - b1 * 14, 690, { ax: 0.5, ay: 1, rot: Math.sin(t * 2.2) * 0.02 });
      // kancada ondan yükselen notalar
      if (t < t1) {
        for (let i = 0; i < 5; i++) {
          const u = (t * 0.45 + i / 5) % 1;
          miniNote(c, 440 + i * 30 + Math.sin(u * 6 + i) * 30, 1290 - u * 260, 1.4, Math.sin(u * 4) * 0.3, ['#c8332b', P.teal, '#c98a12'][i % 3], Math.sin(Math.PI * u));
        }
      }
    };
    const p = LUP.intro(ctx, t, s0, inner, { cx: 540, cy: 1250, r0: 420 });
    // porte kartı
    const ca = api.pop(t, deneT - 0.05, 0.45);
    if (ca > 0) {
      staffCard(ctx, { s: ca });
      if (ca > 0.9) {
        if (!phase2) {
          badge(ctx, 1, 'DİNLE', 70, YB - 300, { s: api.pop(t, deneT + 0.1, 0.35) });
          const pl = plays1(api);
          pl.forEach(({ t: nt0, nt }) => {
            if (t < nt0) return;
            const lt = t - nt0;
            const pop = 1 + 0.35 * Math.exp(-lt * 9);
            noteGlyph(ctx, nt, { pop, glow: Math.exp(-lt * 3) });
          });
          if (t > t1 - 0.6) ball(ctx, t, pl, { a: progress(t, t1 - 0.6, t1 - 0.3) * (1 - progress(t, t1 + 8.2, t1 + 8.6)) });
        } else {
          badge(ctx, 2, 'SEN DE EŞLİK ET', 70, YB - 300, { s: api.pop(t, tek0 + 0.05, 0.35), col: '#c8332b' });
          // ilk cümle: zaten duyuldu, soluk
          NOTES.filter((nt) => nt.b < 8).forEach((nt) => noteGlyph(ctx, nt, { a: 0.28 }));
          const pl = plays2(api);
          pl.forEach(({ t: nt0, nt }) => {
            const ga = progress(t, nt0 - 0.55, nt0 - 0.25);
            if (t < nt0) {
              noteGlyph(ctx, nt, { ghost: true, a: ga * 0.9 });
              return;
            }
            const lt = t - nt0;
            noteGlyph(ctx, nt, { pop: 1 + 0.35 * Math.exp(-lt * 9), glow: Math.exp(-lt * 3) });
          });
          // son notanın boş yuvası: durunca parlar
          const stopT = t2 + 3.0;
          if (t > stopT - 0.4 && !done) {
            const pulse = 0.55 + 0.45 * Math.sin((t - stopT) * 7);
            const x = nx(SON);
            const y = ny(SON);
            ctx.save();
            ctx.globalAlpha *= progress(t, stopT - 0.4, stopT);
            ctx.strokeStyle = GOLD;
            ctx.lineWidth = 5;
            ctx.setLineDash([8, 7]);
            ctx.beginPath();
            ctx.ellipse(x, y, 22 + pulse * 6, 16 + pulse * 4, -0.38, 0, TAU);
            ctx.stroke();
            ctx.setLineDash([]);
            const g = ctx.createRadialGradient(x, y, 4, x, y, 70);
            g.addColorStop(0, `rgba(255,214,110,${0.45 * pulse})`);
            g.addColorStop(1, 'rgba(255,214,110,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(x, y, 70, 0, TAU);
            ctx.fill();
            ctx.restore();
            note(ctx, '?', x + 38, y - 30, { size: 56, col: '#c98a12', rot: 0.1, a: progress(t, stopT, stopT + 0.3) });
          }
          if (t >= t3 - 0.3) {
            // altın nota yuvasına düşer
            const fall = progress(t, t3 - 0.3, t3, ease.in);
            const y0 = lerp(-120, 0, fall);
            ctx.save();
            ctx.translate(0, y0);
            noteGlyph(ctx, SON, { gold: true, pop: 1 + 0.4 * Math.exp(-Math.max(0, t - t3) * 6), glow: done ? 0.6 + 0.4 * Math.exp(-(t - t3) * 2) : 0 });
            ctx.restore();
            sparks(ctx, nx(SON), ny(SON), t, t3, { r: 200, n: 16 });
            // bütün notalar dalga gibi parlar
            if (done) NOTES.forEach((nt) => {
              const k = Math.exp(-Math.pow((t - t3) * 3 - nt.b / 5, 2));
              if (k > 0.05 && !nt.son) noteGlyph(ctx, nt, { glow: k, a: 0 });
            });
          }
          ball(ctx, t, pl, { waitAt: SON, a: progress(t, t2 - 0.6, t2 - 0.3) * (1 - progress(t, t3 - 0.1, t3 + 0.1)) });
        }
      }
    }
    // Lup: melodiyle birlikte gelir
    if (t > t1 - 0.4) {
      const hp = LUP.hop(t, t1 - 0.4, { from: 300 });
      let pose = 'poz_kulaklik';
      if (phase2) pose = t < t2 + 3.0 ? 'poz_islik' : t < t3 ? 'poz_dinle' : 'poz_coskulu';
      const sway = pose === 'poz_kulaklik' || pose === 'poz_islik' ? Math.sin(((t - t1) / B) * Math.PI) * 0.06 : 0;
      pich(ctx, pose, 865, 1900 + hp.dy, 560, { ax: 0.5, ay: 1, rot: sway, a: hp.a });
    }
    // başlık
    const ta = 1;
    strip(ctx, 390, 2, 104, ta);
    if (!phase2) {
      afis(ctx, [[{ s: 'Hiç duymadığın şarkıya' }], [{ s: 'eşlik edersin.', mark: P.marker }]], 84, 392, { size: 92, t, beat: melody1 ? { t0: t1, b: B, n: 16 } : null, markProg: progress(t, W(api, 'e-hook', 9), W(api, 'e-hook', 9) + 0.4) });
    } else if (!done) {
      afis(ctx, [[{ s: 'Şimdi sen de' }], [{ s: 'eşlik et.', mark: P.markerRed }]], 84, 392, { size: 96, t, prog: progress(t, tek0, tek0 + 0.5), beat: { t0: t2, b: B, n: 6 }, markProg: progress(t, W(api, 'e-tekrar', 8), W(api, 'e-tekrar', 8) + 0.4) });
    } else {
      const k = api.pop(t, t3 + 0.05, 0.4);
      afis(ctx, [[{ s: 'Sonunu sen' }], [{ s: 'tamamladın.', mark: 'rgba(242,182,50,0.6)' }]], 84, 392, { size: 96, t, prog: k, markProg: progress(t, t3 + 0.3, t3 + 0.7) });
    }
    tag(ctx, progress(t, s0 + 1.0, s0 + 1.3) * (p >= 1 ? 1 : 0));
    finish(ctx, t, { vig: 0.22 });
  }
  draw['e-hook'] = (ctx, t, api) => wedding(ctx, t, api, 'e-hook');
  draw['e-tekrar'] = (ctx, t, api) => wedding(ctx, t, api, 'e-tekrar');
  draw['e-tamam'] = (ctx, t, api) => wedding(ctx, t, api, 'e-tamam');

  // Beyindeki konser salonu: ortak zemin ve beyin
  const BRX = 540;
  const BRY = 840;
  function hall(ctx, t, { glow = 0 } = {}) {
    cover(ctx, 'konser');
    const breathe = 1 + Math.sin(t * 2.2) * 0.012;
    if (glow > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(BRX, BRY + 20, 10, BRX, BRY + 20, 420);
      g.addColorStop(0, `rgba(255,200,90,${0.55 * glow})`);
      g.addColorStop(0.5, `rgba(255,170,60,${0.2 * glow})`);
      g.addColorStop(1, 'rgba(255,170,60,0)');
      ctx.fillStyle = g;
      ctx.fillRect(BRX - 420, BRY - 400, 840, 840);
      ctx.restore();
    }
    pic(ctx, 'beyin', BRX, BRY, 500 * breathe, { a: 1 });
  }
  // Küçük porte kartı (tahmin, nakarat)
  function miniStaff(ctx, x, y, w, notes, t, { a = 1, s = 1, ghostFrom = 99, label = '', labelCol = INK, stamp = 0 } = {}) {
    if (a <= 0.01 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.shadowColor = 'rgba(30,10,10,0.35)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#fbf5e6';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -80, w, 160, 16);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(42,28,20,0.6)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 20, 40 - i * 14);
      ctx.lineTo(w / 2 - 20, 40 - i * 14);
      ctx.stroke();
    }
    notes.forEach((st, i) => {
      const nx2 = -w / 2 + 50 + i * ((w - 80) / notes.length);
      const ny2 = 40 - st * 7;
      const ghost = i >= ghostFrom;
      ctx.strokeStyle = ghost ? P.teal : '#1b1512';
      ctx.fillStyle = ghost ? P.teal : '#1b1512';
      ctx.lineWidth = 3;
      if (ghost) ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.ellipse(nx2, ny2, 10, 7, -0.38, 0, TAU);
      if (ghost) ctx.stroke();
      else ctx.fill();
      ctx.beginPath();
      ctx.moveTo(nx2 - 9, ny2 + 2);
      ctx.lineTo(nx2 - 9, ny2 + 40);
      ctx.stroke();
      ctx.setLineDash([]);
    });
    if (label) {
      ctx.font = `400 30px ${AB}`;
      ctx.letterSpacing = '2px';
      ctx.fillStyle = labelCol;
      ctx.fillText(label, -w / 2 + 20, -48);
    }
    ctx.restore();
    if (stamp > 0) note(ctx, 'kaydedildi ✓', x + 20, y + 120, { size: 44, col: P.teal, rot: -0.05, prog: stamp, card: true });
  }
  // Notalar ve plaklar beyne akar
  function stream(ctx, t, t0, t1, { n = 26 } = {}) {
    const k = progress(t, t0, t0 + 0.4) * (1 - progress(t, t1, t1 + 0.6));
    if (k <= 0.01) return;
    for (let i = 0; i < n; i++) {
      const per = 1.6 + hash(i, 3) * 1.2;
      const u = ((t - t0) / per + hash(i, 5)) % 1;
      const side = i % 3;
      const sx = side === 0 ? -60 : side === 1 ? 1140 : 200 + hash(i, 7) * 680;
      const sy = side === 2 ? 1990 : 300 + hash(i, 8) * 1300;
      const x = lerp(sx, BRX, ease.in(u));
      const y = lerp(sy, BRY, ease.in(u));
      const a = k * Math.sin(Math.PI * u);
      if (i % 5 === 0) pic(ctx, 'plak', x, y, 90 * (1 - 0.6 * u), { rot: t * 4 + i, a });
      else miniNote(ctx, x, y, 1.5 * (1 - 0.5 * u), Math.sin(t * 3 + i) * 0.4, ['#1b1512', '#c8332b', P.teal, '#c98a12'][i % 4], a);
    }
  }

  // 4 · Neden: beyin dinlemiyor, tahmin ediyor; binlerce şarkı; nakarat ikinci kez gelince kaydedildi
  draw['e-neden'] = function (ctx, t, api) {
    const id = 'e-neden';
    const s0 = api.S0(id);
    const predT = W(api, id, 5); // tahmin
    const thouT = W(api, id, 8); // binlerce
    const rulesT = W(api, id, 10); // kurallarını
    const nak1 = W(api, id, 15); // Nakarat
    const nak2 = W(api, id, 16); // ikinci
    const saveT = W(api, id, 21); // kaydetmiş
    hall(ctx, t, { glow: 0.35 * Math.exp(-Math.pow((t - saveT - 0.2) * 2, 2)) });
    stream(ctx, t, thouT - 0.3, rulesT + 1.2);
    pic(ctx, 'radyo', 860, 1585, 300, { ax: 0.5, ay: 1, rot: Math.sin(t * 9) * 0.015 * progress(t, thouT - 0.3, thouT) });
    // tahmin kartı: bilinen notalar ve önceden beliren soluk notalar
    const pa = api.pop(t, predT - 0.1, 0.4) * (1 - progress(t, nak1 - 0.4, nak1 - 0.1));
    if (pa > 0) {
      const g = Math.floor(clamp((t - predT) / 0.35, 0, 6));
      miniStaff(ctx, 540, 1150, 560, [6, 8, 10, 9, 8, 6], t, { s: pa, ghostFrom: 3 + Math.min(3, g) - 3 + 3, label: 'TAHMİN' });
      if (pa > 0.9) note(ctx, 'sıradaki nota', 700, 1290, { size: 40, col: P.teal, rot: -0.04, prog: progress(t, predT + 0.3, predT + 0.9) });
    }
    if (t > rulesT) note(ctx, 'binlerce şarkı → kurallar', 540, 596, { size: 46, col: '#fff3dd', rot: -0.03, align: 'center', prog: progress(t, rulesT, rulesT + 0.8), card: 'rgba(40,14,14,0.55)' });
    // nakarat kartları
    const n1 = api.pop(t, nak1 - 0.1, 0.4);
    const n2 = api.pop(t, nak2 - 0.05, 0.4);
    const chorus = [6, 8, 10, 9, 8, 7];
    if (n1 > 0) miniStaff(ctx, 300, 1150, 420, chorus, t, { s: n1, label: 'NAKARAT 1' });
    if (n2 > 0) miniStaff(ctx, 780, 1150, 420, chorus, t, { s: n2, label: 'NAKARAT 2', labelCol: '#c8332b', stamp: progress(t, saveT, saveT + 0.6) });
    if (n2 > 0.9 && t > saveT) {
      // karttan beyne ışık
      const k = progress(t, saveT, saveT + 0.5);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(255,210,120,${0.7 * (1 - progress(t, saveT + 1, saveT + 1.6))})`;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(780, 1070);
      ctx.lineTo(lerp(780, BRX + 60, k), lerp(1070, BRY + 120, k));
      ctx.stroke();
      ctx.restore();
    }
    lup(ctx, t, api, id, 175, 1880, 420, {
      face: t > saveT ? 'mutlu' : t > predT ? 'merak' : 'notr',
      arms: t > nak1 && t < saveT ? 'goster' : 'anlat',
      gx: 0.7,
      gy: -0.5,
    });
    strip(ctx, 390, 2, 104);
    afis(ctx, [[{ s: 'Beynin dinlemiyor,' }], [{ s: 'tahmin ediyor.', mark: P.markerTeal }]], 84, 392, { size: 94, t, prog: progress(t, s0 + 0.05, s0 + 0.6), markProg: progress(t, predT, predT + 0.4) });
    tag(ctx);
    finish(ctx, t, { vig: 0.22 });
  };

  // 5 · Keyif: ödül (beyin parlar), sonra düğünde birlikte söylemek
  draw['e-keyif'] = function (ctx, t, api) {
    const id = 'e-keyif';
    const s0 = api.S0(id);
    const rewT = W(api, id, 4); // ödüllendiriyor
    const togT = W(api, id, 5) - 0.1; // Birlikte
    const strT = W(api, id, 8); // yabancıları
    const wedT = W(api, id, 12); // Düğünde
    if (t < togT) {
      const gk = progress(t, rewT - 0.2, rewT + 0.3);
      hall(ctx, t, { glow: gk * (0.8 + 0.2 * Math.sin(t * 6)) });
      if (t > rewT) sparks(ctx, BRX, BRY, t, rewT, { r: 320, n: 22 });
      if (t > rewT + 0.4) sparks(ctx, BRX, BRY, t, rewT + 0.45, { r: 260, n: 16 });
      if (gk > 0) note(ctx, 'ödül!', 760, 600, { size: 64, col: '#c98a12', rot: -0.08, prog: progress(t, rewT, rewT + 0.4), card: true });
      lup(ctx, t, api, id, 175, 1880, 420, { face: t > rewT ? 'mutlu' : 'gulum', arms: 'anlat', gx: 0.7, gy: -0.5 });
      strip(ctx, 390, 2, 104);
      afis(ctx, [[{ s: 'Tahmin tutunca' }], [{ s: 'beyin ödüllendirir.', mark: 'rgba(242,182,50,0.6)' }]], 84, 392, { size: 92, t, prog: progress(t, s0 + 0.05, s0 + 0.6), markProg: progress(t, rewT, rewT + 0.4) });
    } else {
      cover(ctx, 'dugun', { zoom: 1.04 });
      // davul ritmine göre zıplama (merak müziğiyle aynı ızgara: 100 BPM)
      const db = 0.6;
      const ph = (t % db) / db;
      const kick = Math.exp(-ph * 7);
      pich(ctx, 'ark_halay', 300, 1950 - kick * 16, 690, { ax: 0.5, ay: 1, rot: Math.sin(t * 2.6) * 0.03 });
      pich(ctx, 'poz_coskulu', 865, 1900 - kick * 20, 560, { ax: 0.5, ay: 1, rot: Math.sin(t * 3) * 0.04 });
      // havada mendiller
      for (let i = 0; i < 4; i++) {
        const t0 = togT + 0.3 + i * 1.1;
        const u = (t - t0) / 1.6;
        if (u < 0 || u > 1) continue;
        const x = lerp(120 + i * 260, 300 + i * 200, u);
        const y = 1300 - Math.sin(Math.PI * u) * 420;
        pic(ctx, 'mendil', x, y, 150, { rot: u * 6 + i, a: Math.sin(Math.PI * u) * 1.2 });
      }
      // kalabalıktan yükselen notalar: herkes aynı şarkıda
      for (let i = 0; i < 14; i++) {
        const u = ((t - togT) * 0.32 + hash(i, 11)) % 1;
        const x = 120 + hash(i, 12) * 840 + Math.sin(u * 7 + i) * 40;
        const y = 1330 - u * 760;
        miniNote(ctx, x, y, 1.6 + hash(i, 13), Math.sin(u * 5 + i) * 0.35, ['#f6efe1', GOLD, '#ff9a8a', '#8fe0d6'][i % 4], Math.sin(Math.PI * u) * progress(t, togT, togT + 0.6));
      }
      if (t > strT) note(ctx, 'yabancılar bile!', 560, 1120, { size: 54, col: '#c8332b', rot: -0.05, prog: progress(t, strT, strT + 0.5), card: true });
      if (t > wedT) note(ctx, 'herkes aynı şarkıda', 540, 1250, { size: 46, col: P.teal, rot: 0.03, align: 'center', prog: progress(t, wedT, wedT + 0.7), card: true });
      strip(ctx, 390, 2, 104);
      afis(ctx, [[{ s: 'Birlikte söylemek' }], [{ s: 'yakınlaştırır.', mark: P.markerRed }]], 84, 392, { size: 94, t, prog: progress(t, togT, togT + 0.5), beat: { t0: Math.ceil(togT / db) * db, b: db, n: 30 }, markProg: progress(t, W(api, id, 11), W(api, id, 11) + 0.4) });
    }
    tag(ctx);
    finish(ctx, t, { vig: 0.22 });
  };

  // 6 · Arkadaşına gönder: plak fotoğrafa uçar; logo, "Lup'la bak", abone ol
  draw['e-cta'] = function (ctx, t, api) {
    const id = 'e-cta';
    const { S0, end, fadeIn, pop } = api;
    const s0 = S0(id);
    const c1 = api.cue(id, 1);
    paper(ctx, t, { stains: [[120, 1760, 110, 91]] });
    afis(ctx, [[{ s: 'Sözleri bilmeden' }], [{ s: 'eşlik eden' }], [{ s: 'arkadaşına' }], [{ s: 'gönder.', mark: P.marker }]], 70, 330, { size: 84, lead: 1.06, t, prog: progress(t, s0 + 0.05, s0 + 0.8), markProg: progress(t, s0 + 0.7, s0 + 1.1), maxW: 590 });
    const PX = 845;
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
      ctx.drawImage(IMG.dugun, 200, 700, 620, 740, -126, -176, 252, 300);
      pich(ctx, 'ark_halay', 0, 140, 250, { ax: 0.5, ay: 1 });
      ctx.restore();
      note(ctx, 'düğün', 0, 172, { size: 36, col: 'rgba(42,28,20,0.7)', align: 'center', rot: -0.02 });
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
    // plak fırlatılır, dönerek fotoğrafa uçar
    const fly = progress(t, s0 + 1.0, s0 + 1.55, ease.inOut);
    if (fly > 0 && fly < 1) {
      const x = lerp(930, PX, fly) + Math.sin(Math.PI * fly) * 160;
      const y = lerp(1180, PY + 40, fly) - Math.sin(Math.PI * fly) * 120;
      pic(ctx, 'plak', x, y, lerp(130, 70, fly), { rot: t * 14 });
      for (let i = 1; i < 4; i++) miniNote(ctx, x - i * 40, y + i * 25, 1.1, 0.2, [P.teal, '#c8332b', '#c98a12'][i - 1], 0.7 - i * 0.18);
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
      ctx.font = `400 44px ${AB}`;
      ctx.letterSpacing = '2px';
      const label = done ? 'Abone olundu ✓' : 'Abone ol';
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
      ctx.fillText(label, 0, 2);
      ctx.restore();
      if (done) sparks(ctx, 390, 1560, t, tap, { r: 280, n: 14 });
    }
    tag(ctx);
    finish(ctx, t);
  };

  // ---------------------------------------------------------------------------
  // Ses (müzik yatağı, kanca, geçişler ve kapanış def.ses ile ses.js'ten gelir)
  // ---------------------------------------------------------------------------
  function score(m, hz, api) {
    const t1 = T1(api);
    const t2 = T2(api);
    const t3 = T3(api);
    // düğün uğultusu: kanca konuşması boyunca, melodiden önce söner
    m.crowd(api.S0('e-hook') + 0.2, Math.max(1, t1 - 0.9), { gain: 0.012 });
    // porte kartı ve rozetler
    Y.vurgu(m, W(api, 'e-hook', 13) - 0.05, 'pop');
    Y.vurgu(m, api.S0('e-tekrar') + 0.05, 'tik');
    // melodi: 1. dinleme (bütün), 2. çalış (cevap cümlesi, sonda durur), son nota
    const MG = 1.5; // melodi, konuşmadan ~2 dB alçak (ölçüldü)
    MEL.cal(m, t1, { son: 'dogru', g: MG });
    MEL.cevap(m, t2, { g: MG });
    m.tick(t2 + 3.05, { gain: 0.03, tone: 3000 }); // durma anı: tek, kısık tik
    MEL.son(m, t3, { g: MG });
    m.sparkle(t3 + 0.05, { gain: 0.03, dur: 0.6, base: 2349 });
    m.swell(t3 - 0.35, 0.35, { gain: 0.05 });
    // neden: nota akışı, nakarat kartları, kaydedildi
    const nd = 'e-neden';
    Y.vurgu(m, W(api, nd, 5) - 0.1, 'soru');
    m.whoosh(W(api, nd, 8) - 0.3, { dur: 1.6, from: 500, to: 3000, gain: 0.04 });
    Y.vurgu(m, W(api, nd, 15) - 0.1, 'kagit');
    Y.vurgu(m, W(api, nd, 16) - 0.05, 'kagit');
    Y.vurgu(m, W(api, nd, 21), 'dogru');
    // keyif: ödül, sonra düğünde davul (müzikle aynı ızgarada, 100 BPM)
    const ky = 'e-keyif';
    Y.vurgu(m, W(api, ky, 4), 'sihir');
    Y.vurgu(m, W(api, ky, 4) + 0.1, 'aha');
    const togT = W(api, ky, 5) - 0.1;
    Y.gecis(m, togT, 'kesme');
    const db = 0.6;
    for (let tb = Math.ceil(togT / db) * db, i = 0; tb < api.S1(ky) - 0.2; tb += db / 2, i++) {
      if (i % 4 === 0) {
        m.kick(tb, { gain: 0.16 });
        m.boom(tb, { gain: 0.06, freq: 78 });
      } else if (i % 4 === 3) m.kick(tb, { gain: 0.08 });
      else m.click(tb, { gain: 0.05, tone: 1700 });
    }
    m.crowd(togT, api.S1(ky) - togT, { gain: 0.01 });
    // kapanış: plak uçuşu
    const s6 = api.S0('e-cta');
    m.whoosh(s6 + 0.95, { dur: 0.6, from: 700, to: 2600, gain: 0.05, panFrom: 0.3, panTo: -0.1 });
    m.pop(s6 + 1.55, { freq: 720, gain: 0.06 });
  }

  window.FILM = K.short({
    title: 'Bilmediğin şarkıya eşlik etmek · YUP Akademi',
    series: 'VÜCUDUN GİZLİ AYARLARI',
    share: true,
    gap: 0.12,
    breath: 0.2,
    wipe: 0.45,
    transition: LUP.lensWipe,
    cut: ['e-tekrar', 'e-tamam', 'e-keyif'],
    extra: { 'e-hook': 9.1, 'e-tekrar': 4.5, 'e-tamam': 1.7, 'e-neden': 0.4, 'e-keyif': 0.4, 'e-cta': 1.75 },
    lead: { 'e-hook': 0.1, 'e-tekrar': 0.25, 'e-tamam': 0.0, 'e-neden': 0.2, 'e-keyif': 0.15, 'e-cta': 0.3 },
    titles: {
      'e-hook': 'Bilmediğin şarkı',
      'e-tekrar': 'Şimdi sen eşlik et',
      'e-tamam': 'Sonunu sen tamamladın',
      'e-neden': 'Beynin tahmin ediyor',
      'e-keyif': 'Ödül ve birlikte söylemek',
      'e-cta': 'Arkadaşına gönder',
    },
    ses: {
      muzik: 'merak',
      kanca: 'mercek',
      sus: ['e-hook', 'e-tekrar', 'e-tamam'],
      gecisler: { 'e-tekrar': null, 'e-tamam': null, 'e-keyif': null },
    },
    draw,
    score,
  });
})();
