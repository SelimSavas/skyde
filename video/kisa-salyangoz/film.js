/*
 * YUP Akademi · Lup · Yakın Plan kısa video (1080×1920) — Salyangozlar neden yağmurda ortaya çıkar?
 *
 * Bu videoda üstte başlık yok: seslendirme sözcük sözcük akar (akis). Metin narration.js'ten, zamanlar dudak.js'ten
 * (Whisper sözcükleri harf oranıyla metne eşlenir; yazım farkı olsa da sözcük sözcük oturur). Buğulu ıslak cam panelde
 * en fazla 3 satır görünür, satır dolunca metin yukarı kayar; söylenen sözcük teal, önemli sözcükler amber; altında
 * söylenen yere kadar parlak bir salyangoz izi uzar ve izin ucunda minik bir salyangoz sürünür.
 *
 * Sahneler: yağmurdan sonra kaldırım (salyangozlar belirir) · ayağın altı camdan (dalgalar, %97–99 su) · kuru bahçe
 * (su kaybı, kabuk kapısı) · yağmur (kapı açılır, "gişesiz otoyol") · eski müze (1846 → 1850, suya konunca uyanır) ·
 * gönder. Görseller ChatGPT (assets.js); yağmur, su birikintisi halkaları, iz, dalgalar, su göstergesi, gişe
 * bariyeri ve takvim kodla. Yazı tipleri (yazi.js): Baloo 2 ExtraBold (akan metin), Kalam (Lup'un notları).
 * Ses: YUP ses kimliği (ses.js): mercek kancası, sıcak müzik, yağmur ortamı, vurgular, kapanışta Lup motifi.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, lerp, ease, progress, hash } = E;
  const K = window.YupKisa;
  const L = window.YupEl;
  const LUP = window.YupLup;
  const Y = window.YupSes;
  const { P, paper, tape, finish, ink } = L;
  const TAU = Math.PI * 2;
  const INK = P.ink;
  const BA = '"Baloo 2", Nunito, sans-serif';
  const KA = 'Kalam, "Patrick Hand", cursive';
  const TEAL = '#0f766e';
  const AMB = '#c47a0a';

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
  window.FILM_READY = Promise.all([window.FILM_READY, window.EL_FONTS_READY, window.SALYANGOZ_FONTS_READY, ...loads]);

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
      ctx.fillStyle = `rgba(14,12,20,${dim})`;
      ctx.fillRect(0, 0, 1080, 1920);
    }
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

  // ---------------------------------------------------------------------------
  // Akan seslendirme
  // ---------------------------------------------------------------------------
  const LINES = window.NARRATION.lines;
  const norm = (s) => s.toLocaleLowerCase('tr').replace(/[^a-zçğıöşü0-9]/g, '');
  const AMBER = new Set(['su', 'jölenin', 'jöleden', 'kapıyla', 'otoyol', 'dört', 'yıl', 'uyanıp']);
  // Satırdaki her sözcüğün başlangıcı (satır başına göre sn): Whisper sözcükleri harf harf zamanlanır, metin harf oranıyla eşlenir
  const REL = {};
  for (const l of LINES) {
    const ws = window.DUDAK?.[l.id] ?? [];
    const toks = l.say.split(/\s+/);
    const tl = [];
    for (const [t0, t1, w] of ws) {
      const n = norm(w).length || 1;
      for (let i = 0; i < n; i++) tl.push(t0 + ((t1 - t0) * i) / n);
    }
    const tot = toks.reduce((q, x) => q + norm(x).length, 0) || 1;
    let c = 0;
    REL[l.id] = toks.map((tok) => {
      const i = Math.round((c * tl.length) / tot);
      c += norm(tok).length;
      return tl.length ? tl[Math.min(tl.length - 1, i)] : c * 0.06;
    });
  }
  const PANEL = { x: 40, y: 236, w: 1000, h: 330 };
  const FS = 58;
  const LH = 84;
  const MAXW = 920;
  const LAYOUT = {};
  let MCTX = null;
  function layout(id) {
    if (LAYOUT[id]) return LAYOUT[id];
    MCTX ??= document.createElement('canvas').getContext('2d');
    MCTX.font = `800 ${FS}px ${BA}`;
    const toks = LINES.find((l) => l.id === id).say.split(/\s+/);
    const sp = MCTX.measureText(' ').width;
    const rows = [[]];
    let x = 0;
    toks.forEach((s, i) => {
      const w = MCTX.measureText(s).width;
      if (x > 0 && x + w > MAXW) {
        rows.push([]);
        x = 0;
      }
      rows[rows.length - 1].push({ s, i, x, w, amber: AMBER.has(norm(s)) });
      x += w + sp;
    });
    LAYOUT[id] = rows;
    return rows;
  }
  // Panelin buğulu cam zemini (arkasındaki görüntü bulanıklaşır)
  function glassPanel(ctx, t) {
    const { x, y, w, h } = PANEL;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 28);
    ctx.clip();
    ctx.filter = 'blur(14px)';
    ctx.drawImage(ctx.canvas, x - 20, y - 20, w + 40, h + 40, x - 20, y - 20, w + 40, h + 40);
    ctx.filter = 'none';
    ctx.fillStyle = 'rgba(250,247,238,0.8)';
    ctx.fillRect(x, y, w, h);
    // süzülen damlalar
    for (let i = 0; i < 6; i++) {
      const per = 3 + hash(i, 3) * 3;
      const u = ((t / per + hash(i, 4)) % 1);
      const dx = x + 40 + hash(i, 5) * (w - 80);
      const dy = y - 20 + u * (h + 40);
      ctx.strokeStyle = 'rgba(160,190,210,0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(dx, dy - 50);
      ctx.lineTo(dx, dy);
      ctx.stroke();
      ctx.fillStyle = 'rgba(170,200,220,0.6)';
      ctx.beginPath();
      ctx.ellipse(dx, dy, 6, 8, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(dx - 2, dy - 3, 2, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 28);
    ctx.stroke();
    ctx.restore();
  }
  let TIP = null; // salyangozun ucu (yumuşak takip)
  function akis(ctx, t, api) {
    let cur = null;
    for (const l of LINES) if (t >= api.cue(l.id, 0) - 0.05) cur = l;
    tag(ctx);
    if (!cur) return;
    const id = cur.id;
    const c0 = api.cue(id, 0);
    const rel = REL[id];
    const end = api.end(id);
    const rows = layout(id);
    const fade = progress(t, c0 - 0.05, c0 + 0.15);
    glassPanel(ctx, t);
    // şu anki sözcük
    let ci = -1;
    for (let i = 0; i < rel.length; i++) if (t >= c0 + rel[i] - 0.02) ci = i;
    const wordEnd = (i) => (i + 1 < rel.length ? c0 + rel[i + 1] : end);
    // satır kaydırma
    let scroll = 0;
    rows.forEach((r, k) => {
      if (k >= 3) scroll += ease.inOut(progress(t, c0 + rel[r[0].i] - 0.12, c0 + rel[r[0].i] + 0.18));
    });
    const { x: px, y: py, w: pw, h: ph } = PANEL;
    const X0 = px + (pw - MAXW) / 2;
    const B0 = py + 86;
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py + 6, pw, ph - 12);
    ctx.clip();
    ctx.globalAlpha *= fade;
    ctx.font = `800 ${FS}px ${BA}`;
    ctx.textBaseline = 'alphabetic';
    let tip = null;
    rows.forEach((r, k) => {
      const d = k - scroll;
      const by = B0 + d * LH;
      if (d <= -1 || by > py + ph + 60) return;
      const ra = clamp(d + 1);
      ctx.save();
      ctx.globalAlpha *= ra * ra;
      // salyangoz izi: söylenen yere kadar
      const first = r[0];
      const last = r[r.length - 1];
      let tx = null;
      if (ci >= last.i) tx = X0 + last.x + last.w;
      else if (ci >= first.i) {
        const tk = r.find((q) => q.i === ci);
        const u = clamp((t - (c0 + rel[ci])) / Math.max(0.12, wordEnd(ci) - (c0 + rel[ci])));
        tx = X0 + tk.x + tk.w * u;
        tip = [tx, by + 18];
      }
      if (tx != null && tx > X0 + first.x + 4) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(120,175,190,0.45)';
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(X0 + first.x, by + 18);
        ctx.lineTo(tx, by + 18);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(X0 + first.x + 6, by + 15);
        ctx.lineTo(tx - 6, by + 15);
        ctx.stroke();
        ctx.restore();
      }
      for (const q of r) {
        if (q.i > ci) continue;
        const ap = progress(t, c0 + rel[q.i] - 0.04, c0 + rel[q.i] + 0.1);
        const now = q.i === ci;
        const col = q.amber ? AMB : now ? TEAL : INK;
        ctx.save();
        ctx.globalAlpha *= ap;
        const s = 0.86 + 0.14 * ease.back(ap);
        ctx.translate(X0 + q.x + q.w / 2, by);
        ctx.scale(s, s);
        ctx.fillStyle = col;
        ctx.fillText(q.s, -q.w / 2, 0);
        ctx.restore();
      }
      ctx.restore();
    });
    // izin ucunda minik salyangoz
    if (tip) {
      TIP = TIP && Math.abs(TIP[1] - tip[1]) < 4 ? [lerp(TIP[0], tip[0], 0.35), tip[1]] : tip;
      pic(ctx, 'sal_yuru', TIP[0] + 4, TIP[1] + 8, 62, { ax: 0.88, ay: 0.9 });
    } else TIP = null;
    ctx.restore();
  }

  function tag(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(246,239,225,0.92)';
    ctx.beginPath();
    ctx.roundRect(60, 128, 420, 84, 16);
    ctx.fill();
    K.appIcon(ctx, 100, 170, 54);
    ctx.fillStyle = INK;
    ctx.font = `800 26px ${BA}`;
    ctx.fillText('YAKIN PLAN', 140, 166);
    ctx.font = `700 22px ${KA}`;
    ctx.fillStyle = 'rgba(42,28,20,0.7)';
    ctx.fillText('YUP Akademi · Lup', 140, 196);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Çizim parçaları
  // ---------------------------------------------------------------------------
  const W = (api, id, i) => api.cue(id, 0) + (REL[id]?.[i] ?? i * 0.4);
  function lup(ctx, t, api, id, x, y, h, st = {}) {
    LUP.draw(ctx, x, y, h, { talk: LUP.say(api, id, t), ...st }, t);
  }
  // Yağmur çizgileri ve su birikintisi halkaları
  function rain(ctx, t, k = 1, { ripples = true, top = 0 } = {}) {
    if (k <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = `rgba(210,225,245,${0.42 * k})`;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    const n = Math.floor(90 * k);
    for (let i = 0; i < n; i++) {
      const sp = 1500 + hash(i, 2) * 500;
      const y = ((t * sp + hash(i, 3) * 2200) % 2200) - 140 + top;
      const x = hash(i, 4) * 1180 - 50 - (y - top) * 0.12;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 6, y + 46);
      ctx.stroke();
    }
    ctx.restore();
    if (!ripples) return;
    ctx.save();
    for (let i = 0; i < 14; i++) {
      const per = 0.9 + hash(i, 6) * 0.6;
      const u = ((t / per + hash(i, 7)) % 1);
      const x = 60 + hash(i, 8) * 960;
      const y = 1350 + hash(i, 9) * 520;
      ctx.strokeStyle = `rgba(230,240,255,${0.5 * k * (1 - u)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y, 6 + u * 34, (6 + u * 34) * 0.32, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }
  // Salyangoz (sağa sürünür) ve parlak izi; x0 izin başladığı yer
  function snail(ctx, x, y, w, x0, t, { a = 1, flip = false, bob = true } = {}) {
    if (a <= 0.01) return;
    const tail = x - (flip ? -0.48 : 0.48) * w;
    if (Math.abs(tail - x0) > 4) {
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.lineCap = 'round';
      const yy = y - w * 0.03;
      ctx.strokeStyle = 'rgba(200,225,240,0.32)';
      ctx.lineWidth = w * 0.13;
      ctx.beginPath();
      ctx.moveTo(x0, yy);
      ctx.lineTo(tail, yy);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x0, yy - w * 0.03);
      ctx.lineTo(tail, yy - w * 0.03);
      ctx.stroke();
      ctx.restore();
    }
    const sq = bob ? 1 + Math.sin(t * 4 + x * 0.01) * 0.025 : 1;
    pic(ctx, 'sal_yuru', x, y, w, { ax: 0.5, ay: 0.92, a, flip, sx: sq });
  }
  function plane(ctx, x, y, s, rot, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ink(ctx, [[-50, 0], [50, -26], [14, 30]], { fill: '#fffaf0', seed: 270, t, width: 5, off: [3, 3] });
    ink(ctx, [[50, -26], [-6, 14], [0, 40]], { fill: '#e9e0cf', seed: 271, t, width: 5, off: [2, 2] });
    ctx.restore();
  }
  // Su göstergesi (dikey tüp, damla simgeli)
  function gauge(ctx, x, y, h, k, { a = 1, low = false } = {}) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const w = 70;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = 'rgba(250,247,238,0.9)';
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h, w, h, 34);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x - w / 2 + 9, y - h + 9, w - 18, h - 18, 26);
    ctx.clip();
    const fh = (h - 18) * clamp(k);
    const g = ctx.createLinearGradient(0, y - fh, 0, y);
    g.addColorStop(0, low ? '#e8a25a' : '#7cc6e4');
    g.addColorStop(1, low ? '#c8642a' : '#2e86b8');
    ctx.fillStyle = g;
    ctx.fillRect(x - w / 2, y - 9 - fh, w, fh + 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(x - w / 2 + 14, y - 9 - fh, 6, fh);
    ctx.restore();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h, w, h, 34);
    ctx.stroke();
    ctx.restore();
    pic(ctx, 'damla_tek', x, y - h - 50, 46, { a });
  }
  // Gişe bariyeri: k 0 kapalı (yatay) → 1 açık (dik)
  function barrier(ctx, x, y, k, { a = 1 } = {}) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x - 22, y - 150, 44, 150);
    ctx.fillStyle = '#f2a516';
    ctx.fillRect(x - 22, y - 150, 44, 22);
    ctx.translate(x, y - 120);
    ctx.rotate(-k * Math.PI * 0.47);
    const L2 = 330;
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#fdfbf4' : '#d2452f';
      ctx.fillRect((i * L2) / 6, -13, L2 / 6 + 1, 26);
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, -13, L2, 26);
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  // Duvar takvimi (yıl)
  function calendar(ctx, x, y, year, flip, { a = 1 } = {}) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#fbf5e6';
    ctx.fillRect(-130, -110, 260, 230);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#b8342a';
    ctx.fillRect(-130, -110, 260, 56);
    ctx.fillStyle = '#5a4030';
    for (const rx of [-80, 80]) {
      ctx.beginPath();
      ctx.arc(rx, -110, 9, 0, TAU);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(0, 40);
    ctx.scale(1, Math.max(0.05, Math.abs(Math.cos(Math.PI * flip))));
    ctx.font = `800 96px ${BA}`;
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(year), 0, 6);
    ctx.restore();
    ctx.restore();
  }

  // Akan metin geçişlerde bir kez çizilsin diye: sahneler akis'i yalnız geçiş dışında çizer
  let IN_WIPE = false;
  let NOW = { t: 0, api: null };
  function frame(ctx, t, api, body) {
    NOW = { t, api };
    body();
    if (!IN_WIPE) akis(ctx, t, api);
  }
  function transition(ctx, p, prev, self) {
    IN_WIPE = true;
    LUP.lensWipe(ctx, p, prev, self);
    IN_WIPE = false;
    if (NOW.api) akis(ctx, NOW.t, NOW.api);
  }

  // ---------------------------------------------------------------------------
  // Sahneler
  // ---------------------------------------------------------------------------
  const draw = {};

  // 1 · Yağmurdan sonra kaldırım: salyangozlar birer birer belirir
  const SNAILS = [[590, 1560, 220, 0.15], [570, 1830, 260, 0.45], [800, 1390, 160, 0.75], [640, 1700, 190, 1.0]];
  draw['s-hook'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 's-hook';
      const s0 = api.S0(id);
      const snT = W(api, id, 4); // salyangozlar
      const inner = (c) => {
        cover(c, 'kaldirim');
        rain(c, t, 0.55);
        SNAILS.forEach(([x, y, w, d], i) => {
          const t0 = snT - 0.25 + d;
          const a = progress(t, t0, t0 + 0.4);
          if (a <= 0) return;
          const dx = (t - t0) * 9;
          snail(c, x + dx, y, w, x - 0.48 * w - 10, t, { a });
        });
        const AX = 250;
        const bob = Math.sin(t * 3) * 6;
        pich(c, 'ark_parmak', AX, 1950 + bob, 920, { ax: 0.5, ay: 1 });
      };
      const p = LUP.intro(ctx, t, s0, inner, { cx: 540, cy: 1250, r0: 420 });
      if (p >= 1) {
        const hp = LUP.hop(t, s0 + 1.2, { from: 260 });
        pich(ctx, 'poz_semsiye', 900, 1905 + hp.dy, 500, { ax: 0.5, ay: 1, a: hp.a });
      }
      finish(ctx, t, { vig: 0.22 });
    });

  // 2 · Ayağın altı: dalgalar, kaygan jöle, %97–99 su
  let FOOT = null;
  draw['s-sumuk'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 's-sumuk';
      const s0 = api.S0(id);
      const walkT = W(api, id, 2); // yürümüyor
      const slideT = W(api, id, 9); // kayıyor
      const jelT = W(api, id, 7); // jölenin
      const waterT = W(api, id, 13); // neredeyse
      cover(ctx, 'kaldirim', { zoom: 1.35, zy: 1500 });
      rain(ctx, t, 0.3, { ripples: false });
      // cam: ıslak, damlalı
      ctx.fillStyle = 'rgba(210,230,240,0.18)';
      ctx.fillRect(0, 0, 1080, 1920);
      // ayağın altı, dalgalar (offscreen: dalgalar yalnız salyangozun üstüne)
      const g = A.sal_alt;
      const w = 660;
      const h = (w * g.h) / g.w;
      const cx = 520;
      const cy = 1130;
      if (!FOOT) FOOT = document.createElement('canvas');
      FOOT.width = Math.ceil(w);
      FOOT.height = Math.ceil(h);
      const f = FOOT.getContext('2d');
      f.clearRect(0, 0, w, h);
      f.drawImage(IMG.sal_alt, 0, 0, w, h);
      f.globalCompositeOperation = 'source-atop';
      // ayak ekseni: kuyruk (sol alt) → baş (sağ üst)
      const ax0 = [0.06 * w, 0.95 * h];
      const ax1 = [0.74 * w, 0.2 * h];
      const len = Math.hypot(ax1[0] - ax0[0], ax1[1] - ax0[1]);
      const ux = (ax1[0] - ax0[0]) / len;
      const uy = (ax1[1] - ax0[1]) / len;
      const wk = progress(t, s0, s0 + 0.5);
      for (let i = 0; i < 7; i++) {
        const d = (((t * 120) + i * (len / 6)) % len);
        const px = ax0[0] + ux * d;
        const py = ax0[1] + uy * d;
        const gr = f.createLinearGradient(px - ux * 40, py - uy * 40, px + ux * 40, py + uy * 40);
        gr.addColorStop(0, 'rgba(60,40,25,0)');
        gr.addColorStop(0.5, `rgba(60,40,25,${0.32 * wk})`);
        gr.addColorStop(1, 'rgba(60,40,25,0)');
        f.fillStyle = gr;
        f.fillRect(0, 0, w, h);
      }
      f.globalCompositeOperation = 'source-over';
      // jöle tabakası (parlak)
      const jk = progress(t, jelT - 0.2, jelT + 0.4);
      ctx.save();
      ctx.globalAlpha = 0.5 * jk;
      ctx.fillStyle = 'rgba(190,225,240,0.6)';
      ctx.beginPath();
      ctx.ellipse(cx - 30, cy + 40, 360, 120, -0.72, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.drawImage(FOOT, cx - w / 2, cy - h / 2);
      // camdaki damlalar
      for (let i = 0; i < 12; i++) {
        const x = hash(i, 21) * 1080;
        const y = 640 + hash(i, 22) * 1200;
        const r = 8 + hash(i, 23) * 14;
        ctx.fillStyle = 'rgba(200,225,240,0.35)';
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 1.2, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(x - r * 0.35, y - r * 0.4, r * 0.25, 0, TAU);
        ctx.fill();
      }
      if (t > walkT) note(ctx, 'yürümez ✗', 120, 760, { size: 56, col: '#c8332b', rot: -0.05, prog: progress(t, walkT, walkT + 0.5), card: true });
      if (t > slideT) note(ctx, 'kayar ✓', 700, 790, { size: 56, col: TEAL, rot: 0.04, prog: progress(t, slideT, slideT + 0.5), card: true });
      if (t > jelT) note(ctx, 'kaygan jöle', 420, 1520, { size: 48, col: '#2e86b8', rot: -0.04, prog: progress(t, jelT, jelT + 0.6), card: true });
      // %97–99 su: damla dolar
      const wa = api.pop(t, waterT - 0.2, 0.4);
      if (wa > 0) {
        ctx.save();
        ctx.translate(200, 1560);
        ctx.scale(wa, wa);
        const fill = progress(t, waterT, waterT + 1.2, ease.out) * 0.98;
        ctx.beginPath();
        ctx.moveTo(0, -150);
        ctx.bezierCurveTo(70, -60, 100, -10, 100, 30);
        ctx.arc(0, 30, 100, 0, Math.PI, false);
        ctx.bezierCurveTo(-100, -10, -70, -60, 0, -150);
        ctx.closePath();
        ctx.fillStyle = 'rgba(250,247,238,0.92)';
        ctx.fill();
        ctx.save();
        ctx.clip();
        const fy = 130 - fill * 280;
        ctx.fillStyle = '#3a9bd0';
        ctx.fillRect(-110, fy, 220, 300);
        ctx.restore();
        ctx.lineWidth = 6;
        ctx.strokeStyle = INK;
        ctx.stroke();
        ctx.font = `800 54px ${BA}`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 6;
        const pct = `%${Math.round(fill * 100)}`;
        ctx.strokeText(pct, 0, 60);
        ctx.fillText(pct, 0, 60);
        ctx.restore();
        if (fill > 0.9) note(ctx, '%97–99 su', 330, 1650, { size: 50, col: '#2e86b8', rot: -0.04, prog: progress(t, waterT + 1.0, waterT + 1.5), card: true });
      }
      const hp = LUP.hop(t, s0 + 0.3, { from: 260 });
      pich(ctx, 'poz_goster', 900, 1905 + hp.dy, 480, { ax: 0.5, ay: 1, a: hp.a, flip: true });
      finish(ctx, t, { vig: 0.22 });
    });

  // 3 · Kuru bahçe: su kaybı, kabuk kapısı
  draw['s-kapi'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 's-kapi';
      const s0 = api.S0(id);
      const waterT = W(api, id, 6); // su
      const shellT = W(api, id, 10); // kabuğunun
      const doorT = W(api, id, 15); // kapıyla
      cover(ctx, 'bahce');
      // sıcak ışık ve ısı titreşimi
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const g = ctx.createRadialGradient(900, 650, 20, 900, 650, 900);
      g.addColorStop(0, 'rgba(255,230,160,0.55)');
      g.addColorStop(1, 'rgba(255,230,160,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 1080, 1920);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = 'rgba(255,250,235,0.35)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 9; i++) {
        const x = 80 + i * 115;
        const y0 = 1700 - ((t * 120 + i * 90) % 500);
        ctx.beginPath();
        for (let k = 0; k <= 20; k++) {
          const yy = y0 - k * 9;
          const xx = x + Math.sin(k * 0.6 + t * 4 + i) * 7;
          if (k) ctx.lineTo(xx, yy);
          else ctx.moveTo(xx, yy);
        }
        ctx.stroke();
      }
      ctx.restore();
      // salyangoz: önce sürünür, su buharlaşır; sonra kabuğa çekilir ve kapıyı mühürler
      const SX = 470;
      const SY = 1620;
      const sealed = progress(t, shellT - 0.1, shellT + 0.4);
      if (sealed < 1) {
        snail(ctx, SX + (t - s0) * 6, SY, 340 * (1 - 0.25 * sealed), SX - 200, t, { a: 1 - sealed });
        // buharlaşan damlacıklar
        const ek = progress(t, s0 + 0.3, s0 + 0.8) * (1 - sealed);
        for (let i = 0; i < 8; i++) {
          const u = ((t * 0.7 + i / 8) % 1);
          pic(ctx, 'damla_tek', SX + (hash(i, 31) - 0.3) * 260, SY - 120 - u * 260, 26, { a: ek * Math.sin(Math.PI * u) * 0.9 });
        }
      }
      if (sealed > 0) {
        pic(ctx, 'sal_kapi', SX + 40, SY + 6, 250, { ax: 0.5, ay: 0.95, a: sealed });
        const dk = progress(t, doorT - 0.1, doorT + 0.5);
        if (dk > 0 && dk < 1) {
          // kapının üstünden geçen parıltı
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = `rgba(255,255,255,${0.6 * Math.sin(Math.PI * dk)})`;
          ctx.beginPath();
          ctx.ellipse(SX + 85, SY - 60, 60, 70, 0, 0, TAU);
          ctx.fill();
          ctx.restore();
        }
        if (t > doorT) note(ctx, 'kapı: kuruyan jöle', 420, 1340, { size: 46, col: AMB, rot: -0.04, prog: progress(t, doorT, doorT + 0.7), card: true });
      }
      // vücut suyu göstergesi: azalır
      const k = lerp(0.85, 0.3, progress(t, s0 + 0.3, waterT + 1.2)) + 0.12 * progress(t, doorT, doorT + 0.6);
      gauge(ctx, 960, 1350, 380, k, { a: progress(t, s0 + 0.2, s0 + 0.5), low: k < 0.45 });
      note(ctx, 'vücut suyu', 960, 1420, { size: 36, col: INK, align: 'center', rot: 0, a: progress(t, s0 + 0.4, s0 + 0.7), card: true });
      lup(ctx, t, api, id, 140, 1890, 340, { face: t > doorT ? 'gulum' : 'endise', arms: 'anlat', gx: 0.8, gy: -0.3 });
      finish(ctx, t, { vig: 0.2 });
    });

  // 4 · Yağmur: kapı açılır, gişesiz otoyol
  draw['s-yagmur'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 's-yagmur';
      const s0 = api.S0(id);
      const wetT = W(api, id, 3); // nemli
      const lessT = W(api, id, 8); // azalıyor
      const roadT = W(api, id, 9); // Salyangoz için
      const tollT = W(api, id, 12); // gişesiz
      cover(ctx, 'kaldirim');
      const rk = progress(t, s0, s0 + 0.6);
      rain(ctx, t, rk);
      // sıçrayan damlalar
      for (let i = 0; i < 5; i++) {
        const per = 0.8 + hash(i, 41) * 0.5;
        const u = ((t / per + hash(i, 42)) % 1);
        pic(ctx, 'damla', 120 + hash(i, 43) * 840, 1420 + hash(i, 44) * 420, 120 * (0.6 + 0.4 * u), { a: rk * (1 - u), ax: 0.5, ay: 0.9 });
      }
      // otoyol: parlak geniş iz, kesik orta çizgi
      const ok = progress(t, roadT - 0.1, roadT + 0.6, ease.out);
      const LY2 = 1660;
      if (ok > 0) {
        ctx.save();
        ctx.globalAlpha = ok;
        ctx.fillStyle = 'rgba(200,228,242,0.42)';
        ctx.beginPath();
        ctx.roundRect(-20, LY2 - 60, 1120 * ok, 120, 60);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 6;
        ctx.setLineDash([46, 34]);
        ctx.lineDashOffset = -t * 60;
        ctx.beginPath();
        ctx.moveTo(0, LY2);
        ctx.lineTo(1080 * ok, LY2);
        ctx.stroke();
        ctx.restore();
      }
      // gişe bariyeri
      if (ok > 0.5) barrier(ctx, 520, LY2 + 40, progress(t, tollT, tollT + 0.5, ease.out), { a: progress(t, roadT + 0.2, roadT + 0.5) });
      // salyangoz: kapı yumuşar, çıkar, otoyolda sürünür
      const out = progress(t, wetT - 0.1, wetT + 0.6);
      const SX = 300;
      if (out < 1) pic(ctx, 'sal_kapi', SX + 40, LY2 + 26, 250, { ax: 0.5, ay: 0.95, a: 1 - out });
      if (out > 0) {
        const dx = Math.max(0, t - wetT) * (t > roadT ? 70 : 14);
        snail(ctx, SX + dx, LY2 + 30, 300, SX - 150, t, { a: out });
      }
      // vücut suyu: yeniden dolar
      const k = lerp(0.42, 0.95, progress(t, wetT, lessT + 0.4));
      gauge(ctx, 960, 1210, 330, k, { a: 1 - progress(t, roadT, roadT + 0.4) });
      if (t > tollT) note(ctx, 'gişesiz!', 640, 1440, { size: 56, col: TEAL, rot: -0.05, prog: progress(t, tollT + 0.1, tollT + 0.6), card: true });
      pich(ctx, 'ark_comel', 150, 1960, 560, { ax: 0.5, ay: 1, a: progress(t, s0 + 0.2, s0 + 0.6) });
      const hp = LUP.hop(t, roadT - 0.3, { from: 280 });
      if (t > roadT - 0.3) pich(ctx, 'poz_yagmur', 940, 1910 + hp.dy, 420, { ax: 0.5, ay: 1, a: hp.a });
      finish(ctx, t, { vig: 0.22 });
    });

  // 5 · Müze: 1846'da kartona yapıştırılan çöl salyangozu, 1850'de suya konunca uyanır
  draw['s-muze'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 's-muze';
      const s0 = api.S0(id);
      const cardT = W(api, id, 8); // kartona
      const yearT = W(api, id, 13); // dört
      const waterT = W(api, id, 16); // suya
      const wakeT = W(api, id, 18); // uyanıp
      cover(ctx, 'muze');
      // lamba ışığı
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const g = ctx.createRadialGradient(330, 1250, 20, 330, 1250, 700);
      g.addColorStop(0, 'rgba(255,220,150,0.35)');
      g.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 1080, 1920);
      ctx.restore();
      // takvim: 1846 → 1850
      const yk = progress(t, yearT - 0.1, yearT + 1.0);
      const yi = Math.min(4, Math.floor(yk * 5));
      const flip = (yk * 5) % 1;
      calendar(ctx, 800, 820, 1846 + yi, yk > 0 && yk < 1 ? flip : 0, { a: progress(t, s0 + 0.3, s0 + 0.7) });
      if (yk >= 1) note(ctx, '4 yıl!', 700, 1000, { size: 56, col: '#c8332b', rot: -0.06, prog: progress(t, yearT + 1.0, yearT + 1.4), card: true });
      // kart ve su kabı
      const CX = 470;
      const CY = 1560;
      const ca = api.pop(t, cardT - 0.2, 0.45);
      const wa = progress(t, waterT - 0.1, waterT + 0.4, ease.out);
      if (wa > 0) pic(ctx, 'kap_su', lerp(1300, 760, wa), 1700, 330, { ax: 0.5, ay: 0.6 });
      const gone = 1 - 0.85 * progress(t, wakeT + 0.3, wakeT + 1.0);
      if (ca > 0) {
        pic(ctx, 'kart', CX, CY, 300 * ca, { rot: -0.06, a: gone });
        if (t > cardT + 0.4 && t < wakeT) note(ctx, '1846', CX - 40, CY + 230, { size: 44, col: INK, rot: -0.05, a: progress(t, cardT + 0.4, cardT + 0.7) });
      }
      // uyanış: salyangoz karttan su kabına yürür
      const wk = progress(t, wakeT - 0.1, wakeT + 1.0);
      if (wk > 0) {
        const x = lerp(CX, 820, ease.inOut(wk));
        snail(ctx, x, lerp(CY + 10, 1660, wk), 210, CX - 60, t, { a: progress(t, wakeT - 0.1, wakeT + 0.2) });
        if (wk < 0.5) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = `rgba(255,240,190,${0.5 * Math.sin(Math.PI * wk / 0.5)})`;
          ctx.beginPath();
          ctx.arc(CX, CY, 160, 0, TAU);
          ctx.fill();
          ctx.restore();
        }
        note(ctx, 'günaydın!', 560, 1380, { size: 52, col: TEAL, rot: -0.05, prog: progress(t, wakeT + 0.2, wakeT + 0.7), card: true });
      }
      const hp = LUP.hop(t, s0 + 0.3, { from: 260 });
      pich(ctx, 'poz_goster', 160, 1905 + hp.dy, 460, { ax: 0.5, ay: 1, a: hp.a });
      finish(ctx, t, { vig: 0.26 });
    });

  // 6 · Arkadaşına gönder
  draw['s-cta'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 's-cta';
      const { S0, end, fadeIn, pop } = api;
      const s0 = S0(id);
      const c1 = api.cue(id, 1);
      paper(ctx, t, { stains: [[120, 1760, 110, 91]] });
      const PX = 760;
      const PY = 850;
      const pa = pop(t, s0 + 0.15, 0.5);
      if (pa > 0) {
        ctx.save();
        ctx.translate(PX, PY);
        ctx.rotate(0.06);
        ctx.scale(pa, pa);
        ctx.shadowColor = 'rgba(60,40,20,0.28)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 12;
        ctx.fillStyle = '#fffdf7';
        ctx.fillRect(-170, -210, 340, 420);
        ctx.shadowColor = 'transparent';
        ctx.save();
        ctx.beginPath();
        ctx.rect(-146, -186, 292, 320);
        ctx.clip();
        ctx.drawImage(IMG.kaldirim, 120, 820, 760, 834, -146, -186, 292, 320);
        pich(ctx, 'ark_parmak', -30, 150, 300, { ax: 0.5, ay: 1 });
        pic(ctx, 'sal_yuru', 80, 120, 90, { ax: 0.5, ay: 0.9 });
        ctx.restore();
        note(ctx, 'parmak ucunda', 0, 186, { size: 36, col: 'rgba(42,28,20,0.7)', align: 'center', rot: -0.02 });
        tape(ctx, 0, -212, 130, -0.05);
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
      // salyangoz kâğıt uçağa biner, fotoğrafa uçar
      const fly = progress(t, s0 + 1.0, s0 + 1.6, ease.inOut);
      if (fly > 0 && fly < 1) {
        const x = lerp(930, PX, fly) + Math.sin(Math.PI * fly) * 160;
        const y = lerp(1180, PY + 60, fly) - Math.sin(Math.PI * fly) * 140;
        plane(ctx, x, y, 1.1, -0.3, t);
        pic(ctx, 'sal_yuru', x + 4, y - 18, 70, { ax: 0.5, ay: 0.9 });
      }
      if (t > s0 + 1.6) note(ctx, 'gönderildi ✓', 560, 1120, { size: 46, col: TEAL, a: fadeIn(t, s0 + 1.6, 0.25), rot: -0.03 });
      const la = pop(t, s0 + 0.25, 0.6);
      if (la > 0) {
        ctx.save();
        ctx.translate(160, 1285);
        ctx.scale(la, la);
        K.appIcon(ctx, 0, 0, 140, { reveal: progress(t, s0 + 0.5, s0 + 1.3, ease.inOut), shine: progress(t, s0 + 1.4, s0 + 2.1) });
        ctx.restore();
      }
      const wa = fadeIn(t, s0 + 0.7, 0.4);
      K.T(ctx, 'YUP Akademi', 255, 1265, { size: 60, weight: 900, color: P.teal, align: 'left', alpha: wa });
      note(ctx, "Lup'la bak.", 258, 1336, { size: 52, col: INK, a: wa, rot: -0.02 });
      const ba = fadeIn(t, s0 + 1.1, 0.35);
      if (ba > 0) {
        const press = Math.exp(-(((t - tap) / 0.09) ** 2));
        ctx.save();
        ctx.globalAlpha *= ba;
        ctx.translate(390, 1580);
        ctx.scale(1 - 0.06 * press, 1 - 0.06 * press);
        ctx.font = `800 46px ${BA}`;
        const label = done ? 'Abone olundu ✓' : 'Abone ol';
        const w = Math.max(400, ctx.measureText(label).width + 90);
        ctx.shadowColor = 'rgba(40,25,15,0.3)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 6;
        ctx.fillStyle = done ? '#fffaf0' : TEAL;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -50, w, 100, 50);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.lineWidth = 5;
        ctx.strokeStyle = TEAL;
        ctx.stroke();
        ctx.fillStyle = done ? TEAL : '#fffaf0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 4);
        ctx.restore();
      }
      finish(ctx, t);
    });

  // ---------------------------------------------------------------------------
  // Ses (müzik yatağı, kanca, geçişler, ortam ve kapanış def.ses ile ses.js'ten)
  // ---------------------------------------------------------------------------
  function score(m, hz, api) {
    const V = (t, tur, g) => Y.vurgu(m, t, tur, { gain: g ?? 1 });
    const h = 's-hook';
    SNAILS.forEach(([, , , d], i) => V(W(api, h, 4) - 0.25 + d, 'pop', 0.6 + i * 0.05));
    const sm = 's-sumuk';
    V(W(api, sm, 2), 'yanlis', 0.5);
    V(W(api, sm, 9), 'dogru', 0.8);
    m.bubbles(W(api, sm, 7), 1.0, { gain: 0.03, rate: 6 });
    V(W(api, sm, 13), 'sihir');
    const kp = 's-kapi';
    m.whoosh(W(api, kp, 6) - 0.2, { dur: 1.2, from: 400, to: 3000, gain: 0.03 });
    V(W(api, kp, 10), 'kagit');
    V(W(api, kp, 15), 'damga', 0.7);
    const yg = 's-yagmur';
    m.swell(api.S0(yg) - 0.4, 0.4, { gain: 0.06 });
    m.rain(api.S0(yg), api.S1(yg) - api.S0(yg), { gain: 0.03 });
    V(W(api, yg, 3), 'aha', 0.7);
    V(W(api, yg, 9), 'yukselis', 0.8);
    V(W(api, yg, 12), 'tik');
    V(W(api, yg, 12) + 0.15, 'dogru');
    const mz = 's-muze';
    V(api.S0(mz) + 0.2, 'saat', 0.8);
    V(W(api, mz, 8), 'pop', 0.7);
    for (let i = 0; i < 4; i++) V(W(api, mz, 13) + i * 0.22, 'kagit', 0.6);
    V(W(api, mz, 16), 'pop');
    m.bubbles(W(api, mz, 16) + 0.1, 0.6, { gain: 0.04, rate: 8 });
    V(W(api, mz, 18), 'sihir');
    const s6 = api.S0('s-cta');
    m.whoosh(s6 + 0.95, { dur: 0.65, from: 700, to: 2600, gain: 0.05, panFrom: 0.3, panTo: -0.1 });
    V(s6 + 1.6, 'pop');
  }

  window.FILM = K.short({
    title: 'Salyangozlar neden yağmurda ortaya çıkar? · YUP Akademi',
    series: 'YAKIN PLAN',
    share: true,
    gap: 0.12,
    breath: 0.2,
    wipe: 0.45,
    transition,
    extra: { 's-hook': 0.35, 's-sumuk': 0.5, 's-kapi': 0.45, 's-yagmur': 0.45, 's-muze': 1.0, 's-cta': 1.75 },
    lead: { 's-hook': 0.1, 's-sumuk': 0.2, 's-kapi': 0.2, 's-yagmur': 0.2, 's-muze': 0.2, 's-cta': 0.3 },
    titles: {
      's-hook': 'Yağmurdan sonra kaldırım',
      's-sumuk': 'Kaygan jöle',
      's-kapi': 'Kabuk kapısı',
      's-yagmur': 'Gişesiz otoyol',
      's-muze': 'Müzede uyanan salyangoz',
      's-cta': 'Arkadaşına gönder',
    },
    ses: {
      muzik: 'sicak',
      kanca: 'mercek',
      ortam: { 's-hook': 'yagmur', 's-sumuk': 'yagmur', 's-muze': 'oda' },
    },
    draw,
    score,
  });
})();
