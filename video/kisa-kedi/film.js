/*
 * YUP Akademi · Lup · Vücudun Gizli Ayarları kısa video (1080×1920) — Kediler insanların psikoloğu.
 *
 * Altyazı kisa-nefes'teki biçimde (ortanın biraz altında, kutusuz, en fazla 3 sözcük, sola akar), bu videoda biraz
 * daha küçük ve biraz daha aşağıda. Önemli sözcükler renkli; gelişlerinde parıltı ve hafif punch yakınlaşması.
 * Sahneler: terapi odasında gözlüklü kedi terapist (randevu yok ✗, yargı yok ✓, ölçüm göstergesi) · 10 dakikalık
 * okşama ve düşen stres hormonu · Kyoto 2026: yaklaşan kedi, yakınlık halkaları, birlikte inip çıkan oksitosin
 * dalgaları · kedi yüz ve sesten duyguyu okur, yorum yapmaz, başını sürter · izleyiciyle yavaş göz kırpma (iki poz
 * yalnız göz bölgesinde karışır) · seans ücreti bir kap mama · gönder. Ses: mırıltı (synth.purr), mama tıkırtısı
 * (synth.kibble), YUP ses kimliği. Görseller ChatGPT (assets.js); göstergeler, kartlar, dalgalar kodla.
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
  const BUZ = '#8fe0ff';
  const BUZ_D = '#1f78b4';
  const AMBER = '#ffc93c';
  const AMB_D = '#c47a0a';
  const MERCAN = '#ff9a76';
  const KIRMIZI = '#d2452f';
  const YESIL = '#2e9d6a';

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
  window.FILM_READY = Promise.all([window.FILM_READY, window.EL_FONTS_READY, window.KEDI_FONTS_READY, ...loads]);

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
      ctx.fillStyle = `rgba(30,20,14,${dim})`;
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
  function big(ctx, str, x, y, { size = 120, col = AMBER, a = 1, s = 1, rot = 0 } = {}) {
    if (a <= 0.01 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.font = `800 ${size}px ${BA}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.lineWidth = size * 0.16;
    ctx.strokeStyle = '#14202e';
    ctx.strokeText(str, 0, 0);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = col;
    ctx.fillText(str, 0, 0);
    ctx.restore();
  }
  // Kâğıt kart (gölgeli, hafif eğik)
  function cardBox(ctx, x, y, w, h, { a = 1, s = 1, rot = 0, fill = '#fbf6ea' } = {}) {
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.globalAlpha *= a;
    ctx.save();
    ctx.shadowColor = 'rgba(30,18,10,0.32)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 18);
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 4;
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 18);
    ctx.stroke();
  }

  // ---------------------------------------------------------------------------
  // Altyazı: ortanın biraz altında, kutusuz, en fazla 3 sözcük, sola akar
  // ---------------------------------------------------------------------------
  const LINES = window.NARRATION.lines;
  const norm = (s) => s.toLocaleLowerCase('tr').replace(/[^a-zçğıöşü0-9]/g, '');
  const BIR = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
  const ON = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
  const sayi = (n) => (n === 0 ? 'sıfır' : n < 100 ? ON[Math.floor(n / 10)] + BIR[n % 10] : String(n));
  const wnorm = (w) => norm(w.replace(/,5/g, 'buçuk').replace(/\d+/g, (d) => sayi(Number(d))));
  const REL = {};
  for (const l of LINES) {
    const ws = window.DUDAK?.[l.id] ?? [];
    const toks = l.say.split(/\s+/);
    const tl = [];
    for (const [t0, t1, w] of ws) {
      const n = wnorm(w).length || 1;
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
  const COL = { buz: BUZ, amber: AMBER, mercan: MERCAN };
  const VURGU = {
    'k-hook': { psikoloğun: 'buz', yargılamıyor: 'mercan', ölçülebiliyor: 'amber' },
    'k-stres': { on: 'amber', dakika: 'amber', stres: 'mercan', hormonu: 'mercan', düştü: 'buz' },
    'k-japon': { japonyada: 'amber', keyfi: 'buz', oksitosin: 'buz', birlikte: 'buz' },
    'k-okur': { okuyabiliyor: 'buz', mutlu: 'amber', kızgın: 'mercan', yanında: 'buz' },
    'k-goz': { yavaşça: 'buz', kırp: 'amber', gülümsedi: 'buz' },
    'k-kapanis': { psikoloğun: 'buz', bir: 'amber', kap: 'amber', mama: 'amber' },
    'k-cta': { arkadaşına: 'amber', gönder: 'amber' },
  };
  const CAP_Y = 1215;
  const FS = 94;
  const MAXW = 880;
  const LAY = {};
  let MCTX = null;
  function lay(id) {
    if (LAY[id]) return LAY[id];
    MCTX ??= document.createElement('canvas').getContext('2d');
    MCTX.font = `800 ${FS}px ${BA}`;
    const toks = LINES.find((l) => l.id === id).say.split(/\s+/);
    const sp = FS * 0.42;
    let x = 0;
    const ws = toks.map((raw, i) => {
      const s = raw.replace(/[,;:.]+$/, '');
      const w = MCTX.measureText(s).width;
      const o = { s, w, x, i, col: COL[VURGU[id]?.[norm(raw)]] ?? null };
      x += w + sp;
      return o;
    });
    const n = ws.length;
    const w0 = [];
    const T = [];
    const S = [];
    for (let k = 0; k < n; k++) {
      let a = Math.max(0, k - 2, k ? w0[k - 1] : 0);
      while (a < k && ws[k].x + ws[k].w - ws[a].x > MAXW) a++;
      w0.push(a);
      const wid = ws[k].x + ws[k].w - ws[a].x;
      T.push(ws[a].x + wid / 2);
      S.push(Math.min(1, MAXW / wid));
    }
    const leave = ws.map((_, j) => {
      for (let k = j; k < n; k++) if (w0[k] > j) return k;
      return -1;
    });
    return (LAY[id] = { ws, w0, T, S, leave });
  }
  let KEYS = null;
  function keyTimes(api) {
    if (KEYS) return KEYS;
    KEYS = [];
    for (const l of LINES) lay(l.id).ws.forEach((q) => q.col && KEYS.push(api.cue(l.id, 0) + REL[l.id][q.i]));
    return KEYS;
  }
  function punch(t, api) {
    let z = 0;
    for (const k of keyTimes(api)) {
      const u = (t - k) / 0.32;
      if (u > 0 && u < 1) z += Math.sin(Math.PI * u) * (1 - u) * 1.6;
    }
    return 1 + 0.026 * Math.min(1, z);
  }
  function star(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const rr = i % 2 ? r * 0.3 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }
  function altyazi(ctx, t, api) {
    let cur = null;
    for (const l of LINES) if (t >= api.cue(l.id, 0) + REL[l.id][0] - 0.06) cur = l;
    if (!cur) return;
    const id = cur.id;
    const c0 = api.cue(id, 0);
    const rel = REL[id];
    const st = (k) => c0 + rel[k];
    const { ws, T, S, w0, leave } = lay(id);
    let ci = -1;
    for (let k = 0; k < ws.length; k++) if (t >= st(k) - 0.04) ci = k;
    if (ci < 0) return;
    const endT = api.end(id);
    const outA = 1 - progress(t, endT + 0.3, endT + 0.55);
    if (outA <= 0) return;
    const D = 0.26;
    let cx = T[0];
    let sc = S[0];
    for (let k = 1; k < ws.length; k++) {
      const u = ease.out(clamp((t - st(k) + 0.04) / D));
      cx += (T[k] - T[k - 1]) * u;
      sc += (S[k] - S[k - 1]) * u;
    }
    ctx.save();
    ctx.globalAlpha *= outA;
    ctx.translate(540, CAP_Y);
    ctx.scale(sc, sc);
    ctx.font = `800 ${FS}px ${BA}`;
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    for (let j = Math.max(0, w0[ci] - 1); j <= ci; j++) {
      const q = ws[j];
      const ain = clamp((t - st(j) + 0.04) / 0.1);
      const lo = leave[j] >= 0 ? clamp((t - st(leave[j]) + 0.07) / 0.14) : 0;
      const al = ain * (1 - lo);
      if (al <= 0.01) continue;
      const pp = clamp((t - st(j) + 0.04) / 0.22);
      const relax = j < ci ? progress(t, st(j + 1) - 0.04, st(j + 1) + 0.14) : 0;
      const s = (0.72 + 0.28 * ease.back(pp)) * (1 + 0.05 * (1 - relax));
      const x = q.x - cx + q.w / 2 - 50 * lo;
      ctx.save();
      ctx.globalAlpha *= al;
      ctx.translate(x, -FS * 0.32);
      ctx.scale(s, s);
      ctx.translate(0, FS * 0.32);
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = 7;
      ctx.lineWidth = 16;
      ctx.strokeStyle = '#14202e';
      ctx.strokeText(q.s, -q.w / 2, 0);
      if (q.col) {
        ctx.shadowColor = q.col;
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 0;
      } else ctx.shadowColor = 'transparent';
      ctx.fillStyle = q.col ?? '#ffffff';
      ctx.fillText(q.s, -q.w / 2, 0);
      ctx.restore();
      if (q.col) {
        const u = (t - st(j)) / 0.7;
        if (u > 0 && u < 1) {
          ctx.save();
          ctx.globalAlpha *= al * (1 - u);
          ctx.fillStyle = '#ffffff';
          for (let i = 0; i < 6; i++) {
            const an = hash(i, j * 7 + 3) * TAU;
            const rr = (q.w / 2 + 28) * (0.7 + 0.5 * hash(i, j * 7 + 4)) * ease.out(u);
            star(ctx, x + Math.cos(an) * rr, -FS * 0.32 + Math.sin(an) * rr * 0.55, 11 * (1 - u * 0.6));
          }
          ctx.restore();
        }
      }
    }
    ctx.restore();
  }

  function tag(ctx) {
    ctx.save();
    ctx.font = `800 25px ${BA}`;
    const w = Math.max(ctx.measureText('VÜCUDUN GİZLİ AYARLARI').width, 230) + 110;
    ctx.fillStyle = 'rgba(246,239,225,0.92)';
    ctx.beginPath();
    ctx.roundRect(60, 128, w, 84, 16);
    ctx.fill();
    K.appIcon(ctx, 100, 170, 54);
    ctx.fillStyle = INK;
    ctx.fillText('VÜCUDUN GİZLİ AYARLARI', 140, 166);
    ctx.font = `700 22px ${KA}`;
    ctx.fillStyle = 'rgba(42,28,20,0.7)';
    ctx.fillText('YUP Akademi · Lup', 140, 196);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Çizim parçaları
  // ---------------------------------------------------------------------------
  // Yavaş göz kırpan kedi: iki poz yalnız göz bölgesinde karışır (k 0 açık → 1 yarı kapalı)
  let EYE = null;
  function blinkCat(ctx, x, y, h, k, { a = 1, rot = 0 } = {}) {
    const g = A.kedi_otur;
    const w = (h * g.w) / g.h;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.drawImage(IMG.kedi_otur, -w / 2, -h, w, h);
    if (k > 0.01) {
      const W2 = Math.ceil(w);
      const H2 = Math.ceil(h * 0.34);
      if (!EYE) EYE = document.createElement('canvas');
      EYE.width = W2;
      EYE.height = H2;
      const e = EYE.getContext('2d');
      e.clearRect(0, 0, W2, H2);
      e.drawImage(IMG.kedi_kirp, 0, 0, w, h);
      e.globalCompositeOperation = 'destination-in';
      const gr = e.createRadialGradient(w * 0.5, h * 0.2, 0, w * 0.5, h * 0.2, w * 0.4);
      gr.addColorStop(0, 'rgba(0,0,0,1)');
      gr.addColorStop(0.75, 'rgba(0,0,0,1)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      e.save();
      e.translate(w * 0.5, h * 0.2);
      e.scale(1, 0.32);
      e.translate(-w * 0.5, -h * 0.2);
      e.fillStyle = gr;
      e.fillRect(0, 0, W2, H2 / 0.32);
      e.restore();
      e.globalCompositeOperation = 'source-over';
      ctx.globalAlpha *= clamp(k);
      ctx.drawImage(EYE, -w / 2, -h);
    }
    ctx.restore();
  }
  // Yavaş göz kırpma eğrisi: t0'da kapanmaya başlar
  const blink = (t, t0) => {
    const u = t - t0;
    if (u < 0 || u > 1.4) return 0;
    if (u < 0.4) return ease.inOut(u / 0.4);
    if (u < 0.8) return 1;
    return 1 - ease.inOut((u - 0.8) / 0.6);
  };
  function heart(ctx, x, y, s, col = '#e2566b') {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = col;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3 / s;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.bezierCurveTo(-26, -8, -14, -30, 0, -16);
    ctx.bezierCurveTo(14, -30, 26, -8, 0, 10);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  function hearts(ctx, x, y, t, t0, { n = 6, spread = 160, a = 1 } = {}) {
    const u0 = t - t0;
    if (u0 < 0 || u0 > 2.4) return;
    for (let i = 0; i < n; i++) {
      const u = clamp((u0 - i * 0.12) / 1.6);
      if (u <= 0 || u >= 1) continue;
      const hx = x + (hash(i, 31) - 0.5) * spread + Math.sin(u * 6 + i) * 14;
      const hy = y - u * 220;
      ctx.save();
      ctx.globalAlpha = a * Math.sin(Math.PI * u);
      heart(ctx, hx, hy, 0.9 + hash(i, 32) * 0.6);
      ctx.restore();
    }
  }
  // Mırıltı titreşimi: kedinin çevresinde açılan yaylar
  function purrLines(ctx, x, y, r, t, a = 1) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const u = ((t * 1.1 + i / 3) % 1);
      ctx.strokeStyle = `rgba(255,248,230,${0.85 * a * (1 - u)})`;
      ctx.lineWidth = 5;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(x, y, r + u * 70, s < 0 ? Math.PI * 0.85 : -Math.PI * 0.15, s < 0 ? Math.PI * 1.15 : Math.PI * 0.15);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  // Kadranlı ölçüm göstergesi (k 0..1)
  function dial(ctx, x, y, r, k, { a = 1, s = 1 } = {}) {
    if (a <= 0.01 || s <= 0.01) return;
    ctx.save();
    cardBox(ctx, x, y, r * 2.4, r * 1.6, { a, s, rot: -0.02 });
    const cy = r * 0.45;
    const segs = [[YESIL, 0, 0.34], [AMBER, 0.34, 0.67], [KIRMIZI, 0.67, 1]];
    ctx.lineWidth = r * 0.2;
    for (const [c, a0, a1] of segs) {
      ctx.strokeStyle = c;
      ctx.beginPath();
      ctx.arc(0, cy, r * 0.85, Math.PI + a0 * Math.PI, Math.PI + a1 * Math.PI);
      ctx.stroke();
    }
    const an = Math.PI + clamp(k) * Math.PI;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(Math.cos(an) * r * 0.78, cy + Math.sin(an) * r * 0.78);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(0, cy, 12, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  // Dikey stres tüpü: k 1 yüksek (kırmızı) → 0 düşük (yeşil)
  function tube(ctx, x, y, h, k, { a = 1 } = {}) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const w = 86;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = 'rgba(251,246,234,0.95)';
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h, w, h, 43);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x - w / 2 + 10, y - h + 10, w - 20, h - 20, 33);
    ctx.clip();
    const fh = (h - 20) * clamp(k);
    const c = k > 0.6 ? KIRMIZI : k > 0.35 ? AMBER : YESIL;
    ctx.fillStyle = c;
    ctx.fillRect(x - w / 2, y - 10 - fh, w, fh + 2);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(x - w / 2 + 16, y - 10 - fh, 8, fh);
    ctx.restore();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h, w, h, 43);
    ctx.stroke();
    ctx.restore();
  }
  // Basit yüz kartı: mood 1 mutlu → -1 kızgın
  function faceCard(ctx, x, y, mood, { a = 1, s = 1, rot = 0 } = {}) {
    if (a <= 0.01 || s <= 0.01) return;
    ctx.save();
    cardBox(ctx, x, y, 230, 230, { a, s, rot });
    const happy = mood > 0;
    ctx.fillStyle = happy ? '#ffd76a' : '#ff9a76';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 82, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(sx * 28, -14, 8, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.beginPath();
      if (happy) ctx.arc(sx * 28, -34, 14, Math.PI * 1.15, Math.PI * 1.85);
      else {
        ctx.moveTo(sx * 44, -44);
        ctx.lineTo(sx * 14, -30);
      }
      ctx.stroke();
    }
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (happy) ctx.arc(0, 8, 36, Math.PI * 0.15, Math.PI * 0.85);
    else ctx.arc(0, 54, 30, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
    ctx.restore();
  }
  // Ses dalgası kartı: mood 1 yumuşak → -1 sert
  function voiceCard(ctx, x, y, mood, t, { a = 1, s = 1, rot = 0 } = {}) {
    if (a <= 0.01 || s <= 0.01) return;
    ctx.save();
    cardBox(ctx, x, y, 300, 230, { a, s, rot });
    ctx.strokeStyle = mood > 0 ? TEAL : KIRMIZI;
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const xx = -120 + i * 4;
      const env = Math.sin((Math.PI * i) / 60);
      const yy = mood > 0 ? Math.sin(i * 0.35 + t * 6) * 46 * env : (hash(i, Math.floor(t * 12)) - 0.5) * 150 * env;
      if (i) ctx.lineTo(xx, yy);
      else ctx.moveTo(xx, yy);
    }
    ctx.stroke();
    ctx.restore();
  }
  // Oksitosin grafiği: insan ve kedi eğrileri birlikte inip çıkar
  function wavePanel(ctx, x, y, t, sync, { a = 1, s = 1 } = {}) {
    if (a <= 0.01 || s <= 0.01) return;
    ctx.save();
    cardBox(ctx, x, y, 900, 420, { a, s, rot: -0.01 });
    ctx.save();
    ctx.beginPath();
    ctx.rect(-410, -150, 820, 280);
    ctx.clip();
    ctx.strokeStyle = 'rgba(42,28,20,0.12)';
    ctx.lineWidth = 2;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-410, i * 40);
      ctx.lineTo(410, i * 40);
      ctx.stroke();
    }
    const f = (u) => Math.sin(u * 0.018 + t * 2.2) * 70 + Math.sin(u * 0.041 + t * 1.3) * 26;
    const curve = (col, off, ph) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let u = -410; u <= 410; u += 8) {
        const yy = f(u + ph) * 0.9 + off;
        if (u > -410) ctx.lineTo(u, yy);
        else ctx.moveTo(u, yy);
      }
      ctx.stroke();
    };
    const lag = lerp(120, 0, sync);
    curve(AMB_D, lerp(28, 6, sync), lag);
    curve(TEAL, lerp(-28, -6, sync), 0);
    ctx.restore();
    ctx.font = `700 34px ${KA}`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = TEAL;
    ctx.fillRect(-400, 168, 30, 10);
    ctx.fillText('sen', -360, 172);
    ctx.fillStyle = AMB_D;
    ctx.fillRect(-250, 168, 30, 10);
    ctx.fillText('kedin', -210, 172);
    ctx.fillStyle = INK;
    ctx.font = `800 36px ${BA}`;
    ctx.textAlign = 'right';
    ctx.fillText('oksitosin', 400, -176);
    ctx.restore();
  }
  // Takvim kartı (randevu)
  function calCard(ctx, x, y, { a = 1, s = 1, rot = 0, cross = 0 } = {}) {
    if (a <= 0.01 || s <= 0.01) return;
    ctx.save();
    cardBox(ctx, x, y, 240, 240, { a, s, rot });
    ctx.fillStyle = KIRMIZI;
    ctx.fillRect(-118, -118, 236, 60);
    ctx.fillStyle = '#5a4030';
    for (const rx of [-60, 60]) {
      ctx.beginPath();
      ctx.arc(rx, -120, 10, 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(42,28,20,0.35)';
    ctx.lineWidth = 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.strokeRect(-96 + c * 50, -38 + r * 50, 36, 36);
      }
    }
    if (cross > 0) {
      ctx.strokeStyle = KIRMIZI;
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      const k1 = clamp(cross * 2);
      const k2 = clamp(cross * 2 - 1);
      ctx.beginPath();
      ctx.moveTo(-90, -70);
      ctx.lineTo(-90 + 180 * k1, -70 + 170 * k1);
      if (k2 > 0) {
        ctx.moveTo(90, -70);
        ctx.lineTo(90 - 180 * k2, -70 + 170 * k2);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  // Japonya kartı
  function japanCard(ctx, x, y, { a = 1, s = 1 } = {}) {
    if (a <= 0.01 || s <= 0.01) return;
    ctx.save();
    cardBox(ctx, x, y, 300, 200, { a, s, rot: -0.04, fill: '#ffffff' });
    ctx.fillStyle = '#bc002d';
    ctx.beginPath();
    ctx.arc(0, -10, 58, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  // Seans fişi
  function receipt(ctx, x, y, k, t, { a = 1, mama = 0 } = {}) {
    if (a <= 0.01 || k <= 0.01) return;
    const H = 330 * ease.out(clamp(k));
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(-0.04);
    ctx.shadowColor = 'rgba(30,18,10,0.3)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#fffdf6';
    ctx.beginPath();
    ctx.moveTo(-190, 0);
    ctx.lineTo(190, 0);
    ctx.lineTo(190, H);
    for (let i = 0; i <= 19; i++) ctx.lineTo(190 - i * 20, H + (i % 2 ? 0 : 14));
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.save();
    ctx.beginPath();
    ctx.rect(-190, 0, 380, H);
    ctx.clip();
    ctx.fillStyle = INK;
    ctx.font = `700 44px ${KA}`;
    ctx.textAlign = 'center';
    ctx.fillText('Seans ücreti', 0, 66);
    ctx.strokeStyle = 'rgba(42,28,20,0.4)';
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-150, 96);
    ctx.lineTo(150, 96);
    ctx.stroke();
    ctx.setLineDash([]);
    if (mama > 0) {
      ctx.globalAlpha *= mama;
      ctx.fillStyle = TEAL;
      ctx.font = `700 48px ${KA}`;
      ctx.fillText('1 kap mama', 0, 300);
    }
    ctx.restore();
    ctx.restore();
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
  // Toz zerreleri: sıcak oda ışığında süzülen parıltılar
  function motes(ctx, t, k = 1) {
    ctx.save();
    for (let i = 0; i < 22; i++) {
      const x = (hash(i, 41) * 1080 + Math.sin(t * 0.3 + i) * 40 + t * 8) % 1080;
      const y = (hash(i, 42) * 1300 + 200 - t * (6 + hash(i, 43) * 8) + 1300) % 1300 + 200;
      const tw = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.3);
      ctx.globalAlpha = k * 0.45 * tw;
      ctx.fillStyle = '#fff4d6';
      ctx.beginPath();
      ctx.arc(x, y, 2 + hash(i, 44) * 2.5, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Sahne çerçevesi
  // ---------------------------------------------------------------------------
  const W = (api, id, i) => api.cue(id, 0) + (REL[id]?.[i] ?? i * 0.4);
  const KAPAK = typeof location !== 'undefined' && /[?&]kapak/.test(location.search);
  let IN_WIPE = false;
  let NOW = { t: 0, api: null };
  function overlay(ctx, t, api) {
    if (KAPAK) return;
    tag(ctx);
    altyazi(ctx, t, api);
  }
  function frame(ctx, t, api, body) {
    NOW = { t, api };
    const z = punch(t, api);
    ctx.save();
    if (z > 1.0005) {
      ctx.translate(540, 900);
      ctx.scale(z, z);
      ctx.translate(-540, -900);
    }
    body();
    ctx.restore();
    if (!IN_WIPE) overlay(ctx, t, api);
  }
  function transition(ctx, p, prev, self) {
    IN_WIPE = true;
    LUP.lensWipe(ctx, p, prev, self);
    IN_WIPE = false;
    if (NOW.api) overlay(ctx, NOW.t, NOW.api);
  }
  function fig(ctx, k, x, y, h, t, t0, { a = 1, flip = false, from = 260, rot = 0 } = {}) {
    const hp = LUP.hop(t, t0, { from });
    pich(ctx, k, x, y + hp.dy, h, { ax: 0.5, ay: 1, a: hp.a * a, flip, rot, sy: 1 + hp.squash * 0.5, sx: 1 - hp.squash * 0.3 });
    return hp;
  }
  // İki poz arasında yumuşak geçiş (aynı yerde)
  function swap(ctx, k1, k2, x, y, h, u, o = {}) {
    if (u < 1) pich(ctx, k1, x, y, h, { ax: 0.5, ay: 1, ...o, a: (o.a ?? 1) * (1 - u) });
    if (u > 0) {
      const s = 1 + 0.06 * Math.sin(Math.PI * clamp(u * 1.2));
      pich(ctx, k2, x, y, h, { ax: 0.5, ay: 1, ...o, a: (o.a ?? 1) * u, sx: s, sy: s });
    }
  }

  // ---------------------------------------------------------------------------
  // Sahneler
  // ---------------------------------------------------------------------------
  const draw = {};

  // 1 · Terapi odası: gözlüklü kedi terapist, randevu yok, yargı yok, etkisi ölçülebilir
  draw['k-hook'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 'k-hook';
      const s0 = api.S0(id);
      const ranT = W(api, id, 3);
      const istT = W(api, id, 4);
      const yarT = W(api, id, 6);
      const olcT = W(api, id, 9);
      const inner = (c) => {
        cover(c, 'terapi');
        motes(c, t);
        pich(c, 'ark_anlat', 285, 1960 + Math.sin(t * 2) * 4, 780, { ax: 0.5, ay: 1 });
        // kedi terapist: not alırken hafifçe başını sallar
        const nod = Math.sin(t * 3.2) * 0.012;
        pich(c, 'kedi_terapist', 835, 1790, 540, { ax: 0.5, ay: 1, rot: nod });
      };
      const p = LUP.intro(ctx, t, s0, inner, { cx: 820, cy: 1500, r0: 330 });
      if (p >= 1 || KAPAK) {
        calCard(ctx, 280, 560, { s: api.pop(t, ranT - 0.1, 0.45), rot: -0.08, cross: progress(t, istT, istT + 0.4) });
        if (t > istT + 0.2) note(ctx, 'randevu yok', 280, 760, { size: 42, col: KIRMIZI, align: 'center', rot: -0.05, prog: progress(t, istT + 0.2, istT + 0.6), card: true });
        const ya = api.pop(t, yarT - 0.1, 0.45);
        if (ya > 0) {
          ctx.save();
          ctx.translate(780, 520);
          ctx.rotate(0.05);
          ctx.scale(ya, ya);
          pic(ctx, 'defter', 0, 0, 230);
          ctx.restore();
          note(ctx, 'yargı yok ✓', 780, 740, { size: 42, col: TEAL, align: 'center', rot: 0.04, prog: progress(t, yarT + 0.1, yarT + 0.5), card: true });
        }
        const da = api.pop(t, olcT - 0.15, 0.45);
        const needle = lerp(0.88, 0.16, progress(t, olcT + 0.1, olcT + 1.1, ease.inOut)) + Math.sin(t * 9) * 0.012 * da;
        dial(ctx, 540, 930, 120, needle, { s: da });
        fig(ctx, 'poz_psiko', 560, 2050, 420, t, s0 + 1.25);
      }
      finish(ctx, t, { vig: 0.22 });
    });

  // 2 · On dakika okşamak: stres hormonu düşer
  draw['k-stres'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 'k-stres';
      const s0 = api.S0(id);
      const kopT = W(api, id, 4);
      const sadT = W(api, id, 5);
      const onT = W(api, id, 6);
      const okT = W(api, id, 8);
      const strT = W(api, id, 10);
      const dusT = W(api, id, 12);
      cover(ctx, 'ev');
      motes(ctx, t);
      // kronometre: on dakika hızla geçer
      const ka = api.pop(t, sadT - 0.15, 0.45);
      if (ka > 0) {
        const spin = progress(t, onT, okT + 0.6, ease.inOut);
        ctx.save();
        ctx.translate(260, 560);
        ctx.scale(ka, ka);
        pic(ctx, 'kronometre', 0, 0, 260);
        const g = A.kronometre;
        const hh = (260 * g.h) / g.w;
        ctx.strokeStyle = KIRMIZI;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        const an = -Math.PI / 2 + spin * TAU;
        const cy = hh * 0.1;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(Math.cos(an) * 78, cy + Math.sin(an) * 78);
        ctx.stroke();
        ctx.restore();
        big(ctx, '10 dk', 260, 790, { size: 84, col: AMBER, s: api.pop(t, onT + 0.1, 0.4), rot: -0.05 });
      }
      // stres hormonu tüpü
      const ta = progress(t, s0 + 0.3, s0 + 0.7);
      const lvl = lerp(0.9, 0.22, progress(t, okT + 0.2, dusT + 0.5, ease.inOut));
      tube(ctx, 820, 880, 440, lvl + Math.sin(t * 7) * 0.01, { a: ta });
      note(ctx, 'stres hormonu', 820, 395, { size: 38, col: INK, align: 'center', rot: 0, a: ta, card: true });
      if (t > dusT) big(ctx, '↓', 930, 700, { size: 120, col: '#7be0a4', s: api.pop(t, dusT, 0.4) });
      if (t > kopT) note(ctx, 'kedi + köpek · 249 öğrenci', 540, 1045, { size: 36, col: INK, align: 'center', rot: -0.02, prog: progress(t, kopT, kopT + 0.6), card: true });
      // Arkadaşın: önce stresli, sonra kediye sarılır
      const hug = progress(t, okT - 0.15, okT + 0.3);
      const bx = lerp(0, -260, hug);
      pic(ctx, 'kitaplar', 640 + bx, 1880, 290, { ax: 0.5, ay: 1, a: 1 - hug });
      const shake = hug < 1 ? Math.sin(t * 30) * 2.5 * (1 - hug) : 0;
      swap(ctx, 'ark_stres', 'ark_saril', 300 + shake, 1960, 780, hug);
      if (hug > 0.5) hearts(ctx, 380, 1360, t, okT + 0.3, { n: 5 });
      fig(ctx, 'poz_tup', 905, 1915, 400, t, W(api, id, 1));
      finish(ctx, t, { vig: 0.2 });
    });

  // 3 · Kyoto 2026: kedi yaklaştıkça keyif artar; oksitosin birlikte inip çıkar
  draw['k-japon'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 'k-japon';
      const s0 = api.S0(id);
      const kedT = W(api, id, 6);
      const gecT = W(api, id, 11);
      const keyT = W(api, id, 13);
      const bagT = W(api, id, 16);
      const birT = W(api, id, 22);
      cover(ctx, 'ev');
      motes(ctx, t);
      const panel = progress(t, bagT - 0.3, bagT + 0.2);
      // Japonya kartı ve keyif çubuğu
      const ja = api.pop(t, s0 + 0.15, 0.5) * (1 - panel);
      japanCard(ctx, 270, 470, { s: ja });
      if (ja > 0.05) note(ctx, 'Kyoto · Ekim 2026', 270, 650, { size: 40, col: INK, align: 'center', rot: -0.03, a: ja, card: true });
      const near = progress(t, kedT, gecT + 0.3, ease.inOut);
      const mood = 0.25 + 0.65 * progress(t, kedT + 0.3, keyT + 0.5, ease.inOut);
      const ma = progress(t, kedT - 0.2, kedT + 0.2) * (1 - panel);
      if (ma > 0.01) {
        ctx.save();
        cardBox(ctx, 760, 470, 380, 150, { a: ma, rot: 0.03 });
        ctx.font = `700 40px ${KA}`;
        ctx.fillStyle = INK;
        ctx.fillText('keyif', -160, -18);
        ctx.fillStyle = 'rgba(42,28,20,0.12)';
        ctx.beginPath();
        ctx.roundRect(-160, 10, 320, 40, 20);
        ctx.fill();
        ctx.fillStyle = mood > 0.6 ? YESIL : AMBER;
        ctx.beginPath();
        ctx.roundRect(-160, 10, 320 * mood, 40, 20);
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = INK;
        ctx.beginPath();
        ctx.roundRect(-160, 10, 320, 40, 20);
        ctx.stroke();
        ctx.restore();
      }
      // oksitosin dalgaları
      wavePanel(ctx, 540, 640, t, progress(t, birT - 0.3, birT + 0.6, ease.inOut), { s: api.pop(t, bagT - 0.2, 0.5) });
      if (t > birT + 0.2) hearts(ctx, 540, 600, t, birT + 0.2, { n: 7, spread: 600 });
      // Arkadaşın ve yaklaşan kedi
      pich(ctx, 'ark_kirp', 280, 1960 + Math.sin(t * 2) * 4, 760, { ax: 0.5, ay: 1 });
      const cx = lerp(910, 640, near);
      const walk = near > 0 && near < 1 ? Math.sin(t * 14) * 4 : 0;
      pich(ctx, 'kedi_otur', cx, 1860 + walk, 440, { ax: 0.5, ay: 1, a: progress(t, s0 + 0.2, s0 + 0.6) });
      // tasmadaki işaretçiden yakınlık halkaları
      const ra = progress(t, kedT - 0.1, kedT + 0.3) * (1 - progress(t, keyT + 0.8, keyT + 1.3));
      if (ra > 0.01) {
        const nx = cx;
        const ny = 1860 - 440 * 0.6;
        for (let i = 0; i < 3; i++) {
          const u = ((t * 0.9 + i / 3) % 1);
          ctx.save();
          ctx.globalAlpha = ra * (1 - u);
          ctx.strokeStyle = TEAL;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(nx, ny, 30 + u * 220, 0, TAU);
          ctx.stroke();
          ctx.restore();
        }
        pic(ctx, 'tasma', nx, ny - 10, 120, { a: ra });
      }
      finish(ctx, t, { vig: 0.2 });
    });

  // 4 · Kedin seni okur: yüz ve ses kartları, yorum yok, başını sürter
  draw['k-okur'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 'k-okur';
      const s0 = api.S0(id);
      const okT = W(api, id, 2);
      const yuzT = W(api, id, 4);
      const sesT = W(api, id, 6);
      const mutT = W(api, id, 7);
      const kizT = W(api, id, 9);
      const yorT = W(api, id, 14);
      const yanT = W(api, id, 16);
      cover(ctx, 'terapi');
      motes(ctx, t);
      const flip = progress(t, kizT - 0.1, kizT + 0.2);
      const mood = flip < 0.5 ? 1 : -1;
      const fs = Math.abs(Math.cos(Math.PI * flip));
      const cardsOut = progress(t, yorT - 0.3, yorT);
      faceCard(ctx, 290, 560, mood, { s: api.pop(t, yuzT - 0.1, 0.45) * (0.15 + 0.85 * fs) * (1 - cardsOut), rot: -0.05 });
      voiceCard(ctx, 760, 560, mood, t, { s: api.pop(t, sesT - 0.1, 0.45) * (0.15 + 0.85 * fs) * (1 - cardsOut), rot: 0.04 });
      if (t > mutT && t < kizT) note(ctx, 'mutlu', 540, 780, { size: 48, col: AMB_D, align: 'center', rot: -0.03, prog: progress(t, mutT, mutT + 0.3), card: true });
      if (t > kizT && t < yorT) note(ctx, 'kızgın', 540, 780, { size: 48, col: KIRMIZI, align: 'center', rot: 0.03, prog: progress(t, kizT, kizT + 0.3), card: true });
      // yorum balonu: boş kalır
      const ba = api.pop(t, yorT - 0.1, 0.45) * (1 - progress(t, yanT + 0.6, yanT + 1.0));
      if (ba > 0.01) {
        ctx.save();
        ctx.translate(770, 640);
        ctx.scale(ba, ba);
        ctx.fillStyle = '#fffdf6';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 170, 110, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(40, 100);
        ctx.lineTo(90, 190);
        ctx.lineTo(-10, 106);
        ctx.fill();
        ctx.stroke();
        ctx.font = `800 80px ${BA}`;
        ctx.fillStyle = 'rgba(42,28,20,0.35)';
        ctx.textAlign = 'center';
        ctx.fillText('…', 0, 20);
        ctx.restore();
        if (t > yorT + 0.2) note(ctx, 'yorum yok', 770, 450, { size: 42, col: TEAL, align: 'center', rot: 0.04, prog: progress(t, yorT + 0.2, yorT + 0.6), a: ba, card: true });
      }
      pich(ctx, 'ark_anlat', 285, 1960 + Math.sin(t * 2) * 4, 780, { ax: 0.5, ay: 1 });
      // kedi: dinler, okurken başını eğer; sonunda gelip başını sürter
      const rub = progress(t, yanT - 0.1, yanT + 0.5, ease.inOut);
      const tilt = Math.sin(progress(t, okT, okT + 0.6) * Math.PI) * 0.05 + (t > yuzT && t < yorT ? Math.sin(t * 2.4) * 0.03 : 0);
      if (rub < 1) pich(ctx, 'kedi_otur', 840, 1820, 470, { ax: 0.5, ay: 1, rot: tilt, a: 1 - rub });
      if (rub > 0) {
        const x = lerp(840, 560, rub);
        pich(ctx, 'kedi_surt', x, 1840 + Math.sin(t * 5) * 3, 480, { ax: 0.5, ay: 1, flip: true, a: rub });
        hearts(ctx, x - 80, 1420, t, yanT + 0.3, { n: 6 });
      }
      finish(ctx, t, { vig: 0.22 });
    });

  // 5 · Yavaş göz kırpma: kedi izleyiciyle göz göze
  draw['k-goz'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 'k-goz';
      const s0 = api.S0(id);
      const yavT = W(api, id, 6);
      const kirpT = W(api, id, 7);
      const oT = W(api, id, 8);
      const kirparsaT = W(api, id, 11);
      const gulT = W(api, id, 15);
      cover(ctx, 'ev', { zoom: 1.2, zy: 1300, dim: 0.28 });
      // yakın plan kedi: hafif nefes alır
      const br = 1 + Math.sin(t * 1.8) * 0.006;
      const k = Math.max(blink(t, kirpT - 0.05), blink(t, kirparsaT), blink(t, gulT + 0.1));
      ctx.save();
      ctx.translate(540, 1390);
      ctx.scale(br, br);
      ctx.translate(-540, -1390);
      blinkCat(ctx, 540, 1390, 1060, k, { a: progress(t, s0, s0 + 0.35) });
      ctx.restore();
      if (t > yavT) note(ctx, 'yavaşça…', 860, 420, { size: 48, col: '#fff4d6', align: 'center', rot: 0.05, prog: progress(t, yavT, yavT + 0.5), a: 1 - progress(t, oT + 0.6, oT + 1.0) });
      if (t > gulT) {
        hearts(ctx, 540, 560, t, gulT + 0.2, { n: 8, spread: 520 });
        note(ctx, 'kedi gülümsemesi', 540, 260, { size: 50, col: TEAL, align: 'center', rot: -0.03, prog: progress(t, gulT + 0.1, gulT + 0.6), card: true });
      }
      // sen de kırp: Arkadaşın ve Lup karşılık verir
      const ra = progress(t, oT - 0.1, oT + 0.3);
      const kb = blink(t, kirparsaT + 0.15) > 0.3 || blink(t, gulT + 0.25) > 0.3;
      pich(ctx, kb ? 'ark_kirp' : 'ark_kirp', 190, 1960, 620, { ax: 0.5, ay: 1, a: ra });
      fig(ctx, 'poz_kirp', 930, 1915, 380, t, oT - 0.1);
      finish(ctx, t, { vig: 0.3 });
    });

  // 6 · Seans ücreti: bir kap mama
  draw['k-kapanis'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 'k-kapanis';
      const s0 = api.S0(id);
      const seansT = W(api, id, 4);
      const kapT = W(api, id, 8);
      const mamaT = W(api, id, 9);
      cover(ctx, 'ev');
      motes(ctx, t);
      receipt(ctx, 540, 300, progress(t, seansT - 0.1, seansT + 0.6), t, { mama: progress(t, kapT, kapT + 0.4) });
      const ma = api.pop(t, mamaT - 0.05, 0.5);
      if (ma > 0) {
        pic(ctx, 'mama', 540, 900, 340 * ma);
        ctx.save();
        ctx.fillStyle = '#fff4c2';
        const u = clamp((t - mamaT) / 0.7);
        ctx.globalAlpha = 1 - u;
        for (let i = 0; i < 8; i++) {
          const an = (i / 8) * TAU;
          star(ctx, 540 + Math.cos(an) * (120 + u * 140), 880 + Math.sin(an) * (70 + u * 90), 14);
        }
        ctx.restore();
      }
      // uyuyan kedi pencere kenarında mırlar
      const sx = 420;
      const sy = 1770;
      const br = 1 + Math.sin(t * 3.4) * 0.012;
      pich(ctx, 'kedi_uyku', sx, sy, 360, { ax: 0.5, ay: 1, sy: br });
      purrLines(ctx, sx, sy - 170, 190, t, 1);
      if (t > s0 + 0.4) note(ctx, 'mırr…', sx + 150, sy - 330, { size: 46, col: '#fff4d6', rot: -0.06, prog: progress(t, s0 + 0.4, s0 + 0.9) });
      fig(ctx, 'poz_gul', 905, 1915, 420, t, s0 + 0.1);
      finish(ctx, t, { vig: 0.2 });
    });

  // 7 · Arkadaşına gönder
  draw['k-cta'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 'k-cta';
      const { S0, end, fadeIn, pop } = api;
      const s0 = S0(id);
      paper(ctx, t, { stains: [[120, 1760, 110, 91]] });
      const PX = 720;
      const PY = 640;
      const pa = pop(t, s0 + 0.1, 0.5);
      if (pa > 0) {
        ctx.save();
        ctx.translate(PX, PY);
        ctx.rotate(0.05);
        ctx.scale(pa, pa);
        ctx.shadowColor = 'rgba(60,40,20,0.28)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 12;
        ctx.fillStyle = '#fffdf7';
        ctx.fillRect(-240, -290, 480, 580);
        ctx.shadowColor = 'transparent';
        ctx.save();
        ctx.beginPath();
        ctx.rect(-216, -266, 432, 470);
        ctx.clip();
        ctx.drawImage(IMG.ev, 260, 520, 740, 800, -216, -266, 432, 470);
        pich(ctx, 'ark_saril', -10, 214, 420, { ax: 0.5, ay: 1 });
        hearts(ctx, -10, -40, t, s0 + 0.5, { n: 5, spread: 220 });
        ctx.restore();
        note(ctx, 'seans saati', 0, 262, { size: 42, col: 'rgba(42,28,20,0.75)', align: 'center', rot: -0.02 });
        tape(ctx, 0, -292, 150, -0.05);
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
      LUP.draw(ctx, 860, 1830, 560, {
        talk: LUP.say(api, id, t),
        ...LUP.hop(t, s0 + 0.05, { from: 300 }),
        face: done ? 'mutlu' : t > W(api, id, 3) ? 'gulum' : 'merak',
        gx: reach > 0 ? -0.9 : -0.3,
        gy: reach > 0 ? 0.4 : -0.6,
        arms,
      }, t);
      // balık ödül kâğıt uçakla fotoğrafa uçar
      const fly = progress(t, s0 + 1.0, s0 + 1.6, ease.inOut);
      if (fly > 0 && fly < 1) {
        const x = lerp(930, PX + 60, fly) + Math.sin(Math.PI * fly) * 160;
        const y = lerp(1180, PY + 80, fly) - Math.sin(Math.PI * fly) * 140;
        plane(ctx, x, y, 1.1, -0.3, t);
        pic(ctx, 'balik', x + 4, y - 26, 110, { rot: -0.2 });
      }
      if (t >= s0 + 1.6) pic(ctx, 'balik', PX + 170, PY + 250, 120 * (0.8 + 0.2 * pop(t, s0 + 1.6, 0.4)), { rot: 0.1 });
      if (t > s0 + 1.65) note(ctx, 'gönderildi ✓', 470, 1000, { size: 46, col: TEAL, a: fadeIn(t, s0 + 1.65, 0.25), rot: -0.03 });
      const la = pop(t, s0 + 0.25, 0.6);
      if (la > 0) {
        ctx.save();
        ctx.translate(160, 1355);
        ctx.scale(la, la);
        K.appIcon(ctx, 0, 0, 140, { reveal: progress(t, s0 + 0.5, s0 + 1.3, ease.inOut), shine: progress(t, s0 + 1.4, s0 + 2.1) });
        ctx.restore();
      }
      const wa = fadeIn(t, s0 + 0.7, 0.4);
      K.T(ctx, 'YUP Akademi', 255, 1335, { size: 60, weight: 900, color: P.teal, align: 'left', alpha: wa });
      note(ctx, "Lup'la bak.", 258, 1406, { size: 52, col: INK, a: wa, rot: -0.02 });
      const ba = fadeIn(t, s0 + 1.1, 0.35);
      if (ba > 0) {
        const press = Math.exp(-(((t - tap) / 0.09) ** 2));
        ctx.save();
        ctx.globalAlpha *= ba;
        ctx.translate(390, 1620);
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
  // Ses
  // ---------------------------------------------------------------------------
  function score(m, hz, api) {
    const V = (t, tur, g) => Y.vurgu(m, t, tur, { gain: g ?? 1 });
    const h = 'k-hook';
    const s1 = api.S0(h);
    // kanca: ilk karede mercek sesiyle birlikte kedi mırıltısı
    m.purr(s1 + 0.02, api.S1(h) - s1 - 0.2, { gain: 0.05 });
    V(W(api, h, 3) - 0.1, 'pop', 0.8);
    V(W(api, h, 4), 'damga', 0.7);
    V(W(api, h, 6) - 0.1, 'pop', 0.7);
    V(W(api, h, 6) + 0.15, 'dogru', 0.7);
    V(W(api, h, 9) - 0.15, 'yukselis', 0.8);
    V(s1 + 1.25, 'boing', 0.5);
    const st = 'k-stres';
    V(W(api, st, 5) - 0.15, 'pop', 0.7);
    const on = W(api, st, 6);
    const ok = W(api, st, 8);
    for (let x = on; x < ok + 0.6; x += 0.11) m.tick(x, { gain: 0.035, tone: 4800 });
    V(ok + 0.65, 'saat', 0.6);
    m.whoosh(ok - 0.2, { dur: 0.5, from: 600, to: 2400, gain: 0.035 });
    m.purr(ok, api.S1(st) - ok, { gain: 0.06 });
    V(W(api, st, 12), 'sihir');
    V(W(api, st, 12) + 0.3, 'dogru', 0.8);
    const j = 'k-japon';
    V(api.S0(j) + 0.15, 'pop', 0.7);
    for (let x = W(api, j, 6); x < W(api, j, 14); x += 0.9) m.blip(x, { freq: 1760, dur: 0.07, gain: 0.018, wet: 0.4 });
    V(W(api, j, 13), 'yukselis', 0.6);
    V(W(api, j, 16) - 0.2, 'pop', 0.8);
    V(W(api, j, 18), 'sihir', 0.8);
    m.swell(W(api, j, 22) - 0.3, 1.2, { gain: 0.05 });
    const o = 'k-okur';
    V(W(api, o, 4) - 0.1, 'pop', 0.7);
    V(W(api, o, 6) - 0.1, 'pop', 0.75);
    V(W(api, o, 7), 'tik', 0.7);
    V(W(api, o, 9) - 0.1, 'kagit', 0.6);
    V(W(api, o, 14) - 0.1, 'pop', 0.6);
    m.purr(W(api, o, 16), api.S1(o) - W(api, o, 16), { gain: 0.06 });
    V(W(api, o, 17), 'sihir', 0.6);
    const g = 'k-goz';
    for (const x of [W(api, g, 7) - 0.05, W(api, g, 11), W(api, g, 15) + 0.1]) m.pop(x + 0.4, { freq: 420, gain: 0.03 });
    m.purr(W(api, g, 15), api.S1(g) - W(api, g, 15), { gain: 0.06 });
    V(W(api, g, 15) + 0.1, 'sihir');
    const k = 'k-kapanis';
    m.purr(api.S0(k) + 0.1, api.S1(k) - api.S0(k), { gain: 0.08 });
    V(api.S0(k) + 0.1, 'boing', 0.5);
    V(W(api, k, 4) - 0.1, 'kagit', 0.8);
    m.kibble(W(api, k, 9) - 0.05, { gain: 0.09, n: 16, dur: 0.55 });
    V(W(api, k, 9) + 0.1, 'sihir', 0.7);
    const c = api.S0('k-cta');
    V(c + 0.1, 'pop', 0.7);
    m.whoosh(c + 0.95, { dur: 0.65, from: 700, to: 2600, gain: 0.05, panFrom: 0.3, panTo: -0.1 });
    V(c + 1.6, 'pop');
  }

  window.FILM = K.short({
    title: 'Kediler insanların psikoloğu · YUP Akademi',
    series: 'VÜCUDUN GİZLİ AYARLARI',
    share: true,
    gap: 0.12,
    breath: 0.2,
    wipe: 0.45,
    transition,
    extra: { 'k-hook': 0.35, 'k-stres': 0.55, 'k-japon': 0.6, 'k-okur': 0.55, 'k-goz': 0.6, 'k-kapanis': 0.5, 'k-cta': 1.75 },
    lead: { 'k-hook': 0.1, 'k-stres': 0.2, 'k-japon': 0.2, 'k-okur': 0.2, 'k-goz': 0.2, 'k-kapanis': 0.2, 'k-cta': 0.3 },
    titles: {
      'k-hook': 'Evdeki psikolog',
      'k-stres': '10 dakika ve stres hormonu',
      'k-japon': 'Kyoto: birlikte inip çıkan oksitosin',
      'k-okur': 'Kedin seni okur',
      'k-goz': 'Yavaş göz kırpma',
      'k-kapanis': 'Seans ücreti',
      'k-cta': 'Arkadaşına gönder',
    },
    ses: {
      muzik: 'sicak',
      kanca: 'mercek',
      sus: ['k-goz'],
      ortam: { 'k-hook': 'oda', 'k-stres': 'oda', 'k-japon': 'oda', 'k-okur': 'oda', 'k-goz': 'oda', 'k-kapanis': 'oda' },
    },
    draw,
    score,
  });
})();
