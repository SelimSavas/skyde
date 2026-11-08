/*
 * YUP Akademi · Lup · Vücudun Gizli Ayarları kısa video (1080×1920) — Soğukta ağzımızdan neden duman çıkar?
 *
 * Altyazı (yeni biçim): ekranın ortasının biraz altında, kutusuz, ortalı; ekranda en fazla 3 sözcük. Her yeni
 * sözcük sağdan girer, öbek yumuşakça sola kayar, en eski sözcük solda söner. Önemli sözcükler renkli (buz mavisi,
 * amber, mercan) ve gelişlerinde küçük bir parıltı ile sahnede hafif bir "punch" yakınlaşması alır. Metin
 * narration.js'ten (-yor yazımı), zamanlar dudak.js'ten: Whisper sözcükleri harf harf zamanlanır, rakamlar Türkçe
 * okunuşa çevrilir (0 → sıfır, 1,5 → bir buçuk), metin harf oranıyla eşlenir.
 *
 * Buğu bulutları görsellerde yok: ağızdan çıkan nefes kodla çizilir (yumuşak parçacıklar çıkar, büyür, yükselir,
 * dağılır). Sahneler: kış sabahı durak (minicik bulut) · ciğer ve iki cam küp (35 °C nefes / 0 °C hava, 1/8) · mercek
 * altında buhar noktaları sıkışıp damlacığa dönüşür, kamera göğe çıkar · bulut dağılır, damlacıklar yeniden buhar ·
 * yazdan kışa silme geçiş, günde 1,5–2 bardak · ejderha modu ve gönder. Görseller ChatGPT (assets.js).
 * Ses: YUP ses kimliği (ses.js): mercek kancası, sıcak müzik, kış ortamı (rüzgâr, uzak kuşlar), her nefeste hışırtı.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, lerp, ease, progress, hash } = E;
  const K = window.YupKisa;
  const L = window.YupEl;
  const LUP = window.YupLup;
  const Y = window.YupSes;
  const { P, paper, tape, finish } = L;
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
  const ATES = '#ff7a45';

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
  window.FILM_READY = Promise.all([window.FILM_READY, window.EL_FONTS_READY, window.NEFES_FONTS_READY, ...loads]);

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
  // Ağız noktaları (görselin genişlik/yükseklik oranı)
  const MOUTH = { poz_nefes: [0.5, 0.5], poz_ejder: [0.49, 0.5], ark_nefes: [0.62, 0.28], ark_ejder: [0.62, 0.34] };
  function mouth(k, x, y, h, { ax = 0.5, ay = 1, flip = false } = {}) {
    const g = A[k];
    const w = (h * g.w) / g.h;
    const [mx, my] = MOUTH[k];
    return [x - ax * w + (flip ? 1 - mx : mx) * w, y - ay * h + my * h];
  }
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
  // Kalın, konturlu Baloo yazı (sayılar, 1/8)
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

  // ---------------------------------------------------------------------------
  // Altyazı: ortanın biraz altında, kutusuz, en fazla 3 sözcük, sola akar
  // ---------------------------------------------------------------------------
  const LINES = window.NARRATION.lines;
  const norm = (s) => s.toLocaleLowerCase('tr').replace(/[^a-zçğıöşü0-9]/g, '');
  const SAYI = { 0: 'sıfır', 1: 'bir', 2: 'iki', 3: 'üç', 4: 'dört', 5: 'beş', 6: 'altı', 7: 'yedi', 8: 'sekiz', 9: 'dokuz' };
  const wnorm = (w) => norm(w.replace(/,5/g, 'buçuk').replace(/\d/g, (d) => SAYI[d]));
  // Satırdaki her sözcüğün başlangıcı (satır başına göre sn)
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
  const COL = { buz: BUZ, amber: AMBER, mercan: MERCAN, ates: ATES };
  const VURGU = {
    'n-hook': { duman: 'mercan', bulut: 'buz' },
    'n-buhar': { su: 'buz', buharıyla: 'buz', sıfır: 'amber', sekizde: 'amber', biri: 'amber' },
    'n-damla': { soğuk: 'buz', damlacıklara: 'buz', bulutlar: 'buz' },
    'n-kayip': { kuru: 'amber', görünmez: 'buz', buhara: 'buz' },
    'n-bardak': { yaz: 'amber', kış: 'buz', bir: 'amber', buçuk: 'amber', iki: 'amber', bardağı: 'buz', görünür: 'buz' },
    'n-cta': { ejderha: 'ates', arkadaşına: 'amber', gönder: 'amber' },
  };
  const CAP_Y = 1150;
  const FS = 104;
  const MAXW = 900;
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
  // Vurgulu sözcüklerin anları (punch yakınlaşması ve parıltı için)
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
    return 1 + 0.028 * Math.min(1, z);
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
    // öbeğin merkezi ve ölçeği: her yeni sözcükte yumuşakça sola kayar
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
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 8;
      ctx.lineWidth = 17;
      ctx.strokeStyle = '#14202e';
      ctx.strokeText(q.s, -q.w / 2, 0);
      if (q.col) {
        ctx.shadowColor = q.col;
        ctx.shadowBlur = 26;
        ctx.shadowOffsetY = 0;
      } else ctx.shadowColor = 'transparent';
      ctx.fillStyle = q.col ?? '#ffffff';
      ctx.fillText(q.s, -q.w / 2, 0);
      ctx.restore();
      // vurgulu sözcüğe gelişte buz parıltısı
      if (q.col) {
        const u = (t - st(j)) / 0.7;
        if (u > 0 && u < 1) {
          ctx.save();
          ctx.globalAlpha *= al * (1 - u);
          ctx.fillStyle = '#ffffff';
          for (let i = 0; i < 6; i++) {
            const an = hash(i, j * 7 + 3) * TAU;
            const rr = (q.w / 2 + 30) * (0.7 + 0.5 * hash(i, j * 7 + 4)) * ease.out(u);
            star(ctx, x + Math.cos(an) * rr, -FS * 0.32 + Math.sin(an) * rr * 0.55, 12 * (1 - u * 0.6));
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
  // Buğu, kırağı, buhar noktaları, bardak
  // ---------------------------------------------------------------------------
  let BLOB = null;
  let SHADE = null;
  function blobs() {
    if (BLOB) return;
    const mk = (rgb) => {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const g = c.getContext('2d');
      const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, `rgba(${rgb},1)`);
      gr.addColorStop(0.35, `rgba(${rgb},0.72)`);
      gr.addColorStop(0.7, `rgba(${rgb},0.22)`);
      gr.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = gr;
      g.fillRect(0, 0, 128, 128);
      return c;
    };
    BLOB = mk('255,255,255');
    SHADE = mk('70,95,130');
  }
  // Ağızdan çıkan nefes bulutu: t0 nefesin başı, ang yön (rad), size ölçek. Ağızda ince ve yoğun bir akış, sonra
  // genişleyip kıvrılarak yükselir ve incelip dağılır.
  function bugu(ctx, x, y, t, t0, { ang = -1.1, size = 1, a = 1, dur = 0.9, life = 2.6, seed = 1, n = 72, spread = 0.3, speed = 1, rise = 1 } = {}) {
    const u0 = t - t0;
    if (u0 < 0 || u0 > dur + life * 1.3 || a <= 0.01) return;
    blobs();
    ctx.save();
    const pts = [];
    for (let i = 0; i < n; i++) {
      const tb = t0 + (i / n) * dur;
      const age = t - tb;
      const lf = life * (0.6 + 0.6 * hash(i, seed));
      if (age < 0 || age > lf) continue;
      const h1 = hash(i, seed + 1);
      const h2 = hash(i, seed + 2);
      const h3 = hash(i, seed + 3);
      // nefesin gücü ortada en yüksek (başta ve sonda zayıf)
      const pw = Math.sin(Math.PI * (0.15 + 0.7 * (i / n)));
      const an = ang + (h1 - 0.5) * 2 * spread * (0.25 + 0.75 * Math.min(1, age * 1.5));
      const v0 = 620 * speed * size * (0.55 + 0.6 * h2) * (0.5 + 0.5 * pw);
      const kd = 2.1;
      const d = (v0 * (1 - Math.exp(-age * kd))) / kd;
      const sw = Math.sin(age * 2.2 + h3 * 6.3) * 26 * age * size;
      const px = x + Math.cos(an) * d - Math.sin(an) * sw;
      const py = y + Math.sin(an) * d + Math.cos(an) * sw - 52 * rise * Math.pow(age, 1.35) * size;
      const r = (11 + 56 * Math.pow(age, 0.7)) * size * (0.55 + 0.8 * h3);
      const al = a * 0.72 * clamp(age / 0.06) * Math.pow(1 - age / lf, 1.25) * (0.6 + 0.4 * pw);
      if (al > 0.004) pts.push([px, py, r, al]);
    }
    for (const [px, py, r, al] of pts) {
      ctx.globalAlpha = al * 0.32;
      ctx.drawImage(SHADE, px - r + r * 0.1, py - r + r * 0.18, r * 2, r * 2);
    }
    for (const [px, py, r, al] of pts) {
      ctx.globalAlpha = al;
      ctx.drawImage(BLOB, px - r, py - r, r * 2, r * 2);
    }
    ctx.restore();
  }
  // Havada süzülen buz zerreleri
  function kiragi(ctx, t, k = 1, { n = 30 } = {}) {
    if (k <= 0.01) return;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < n; i++) {
      const y = (hash(i, 52) * 2000 + t * (30 + hash(i, 53) * 40)) % 2000 - 40;
      const x = hash(i, 51) * 1080 + Math.sin(t * 0.7 + i) * 30;
      const tw = 0.5 + 0.5 * Math.sin(t * 4 + i * 1.7);
      ctx.globalAlpha = k * (0.35 + 0.5 * tw);
      if (i % 3 === 0) star(ctx, x, y, 5 + 4 * tw);
      else {
        ctx.beginPath();
        ctx.arc(x, y, 2 + 2 * hash(i, 54), 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  // Kenarlara kırağı (soğuk çerçeve)
  function frost(ctx, k = 1) {
    if (k <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = k;
    const g = ctx.createRadialGradient(540, 960, 560, 540, 960, 1150);
    g.addColorStop(0, 'rgba(220,240,255,0)');
    g.addColorStop(1, 'rgba(220,240,255,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.restore();
  }
  const tri = (u) => {
    const f = ((u % 2) + 2) % 2;
    return f < 1 ? f : 2 - f;
  };
  function dot(ctx, x, y, r, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.32, 0, TAU);
    ctx.fill();
  }
  // Kutuda zıplayan buhar noktaları; ph hareket evresi
  function dots(ctx, x, y, w, h, n, ph, { a = 1, col = '#3fa9e6', r = 9, seed = 60, sc = () => 1 } = {}) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    for (let i = 0; i < n; i++) {
      const s = sc(i);
      if (s <= 0.01) continue;
      const px = x + r + tri(hash(i, seed) * 2 + ph * (0.5 + 0.6 * hash(i, seed + 1))) * (w - 2 * r);
      const py = y + r + tri(hash(i, seed + 2) * 2 + ph * (0.4 + 0.6 * hash(i, seed + 3))) * (h - 2 * r);
      dot(ctx, px, py, r * s, col);
    }
    ctx.restore();
  }
  // Su bardağı: x orta, y dip, fill 0..1
  function bardak(ctx, x, y, h, fill, { a = 1, s = 1 } = {}) {
    if (a <= 0.01 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    const wt = h * 0.64;
    const wb = h * 0.5;
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(-wt / 2, -h);
      ctx.lineTo(wt / 2, -h);
      ctx.lineTo(wb / 2, 0);
      ctx.quadraticCurveTo(0, 8, -wb / 2, 0);
      ctx.closePath();
    };
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    path();
    ctx.fillStyle = 'rgba(235,248,255,0.7)';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.save();
    path();
    ctx.clip();
    const lv = -h * 0.92 * clamp(fill);
    if (fill > 0.005) {
      const g = ctx.createLinearGradient(0, lv, 0, 0);
      g.addColorStop(0, '#a6dcf7');
      g.addColorStop(1, '#3d9fd6');
      ctx.fillStyle = g;
      ctx.fillRect(-wt, lv, wt * 2, -lv + 10);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.ellipse(0, lv, wt / 2, 9, 0, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(-wt * 0.36, -h * 0.9, 10, h * 0.78);
    ctx.restore();
    path();
    ctx.lineWidth = 6;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.restore();
  }
  // Mercek: içinde yakın plan, dışında pirinç halka
  function lens(ctx, cx, cy, r, inner, { a = 1, rot = 0 } = {}) {
    if (a <= 0.01 || r <= 1) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#20384f';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.clip();
    inner();
    // camın parlaması
    const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, 'rgba(255,255,255,0.22)');
    g.addColorStop(0.4, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
    LUP.ring(ctx, cx, cy, r, { a, rot });
  }
  // Mercekten kaynağa giden iki ince çizgi
  function tether(ctx, cx, cy, r, sx, sy, a = 1) {
    if (a <= 0.01) return;
    const d = Math.hypot(sx - cx, sy - cy);
    const base = Math.atan2(sy - cy, sx - cx);
    const off = Math.acos(clamp(r / d, -1, 1));
    ctx.save();
    ctx.globalAlpha *= a * 0.7;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(base + s * off) * r, cy + Math.sin(base + s * off) * r);
      ctx.lineTo(sx, sy);
      ctx.stroke();
    }
    ctx.restore();
  }
  // Kronometre halkası
  function watch(ctx, x, y, r, k, label, { a = 1 } = {}) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#fbf6ea';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = INK;
    ctx.fillRect(x - 12, y - r - 22, 24, 20);
    ctx.lineWidth = 12;
    ctx.strokeStyle = 'rgba(31,120,180,0.18)';
    ctx.beginPath();
    ctx.arc(x, y, r - 16, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = BUZ_D;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y, r - 16, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(k));
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.stroke();
    ctx.font = `800 ${r * 0.62}px ${BA}`;
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y + 4);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Sahne çerçevesi: punch yakınlaşması, altyazı en üstte (geçişte bir kez)
  // ---------------------------------------------------------------------------
  const W = (api, id, i) => api.cue(id, 0) + (REL[id]?.[i] ?? i * 0.4);
  // Kapak modu (?kapak, kapak.mjs): altyazı ve etiket yok, kancada taze bir nefes
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
  // Pozlu figür: hop ile girer; titreme isteğe bağlı
  function fig(ctx, k, x, y, h, t, t0, { a = 1, flip = false, shake = 0, from = 260 } = {}) {
    const hp = LUP.hop(t, t0, { from });
    const sx = shake ? Math.sin(t * 38) * 4 * shake : 0;
    pich(ctx, k, x + sx, y + hp.dy, h, { ax: 0.5, ay: 1, a: hp.a * a, flip, sy: 1 + hp.squash * 0.5, sx: 1 - hp.squash * 0.3 });
    return hp;
  }

  // ---------------------------------------------------------------------------
  // Sahneler
  // ---------------------------------------------------------------------------
  const draw = {};

  // 1 · Kış sabahı durak: "duman" aslında minicik bir bulut
  draw['n-hook'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 'n-hook';
      const s0 = api.S0(id);
      const dumanT = W(api, id, 4);
      const degilT = W(api, id, 7);
      const azT = W(api, id, 8);
      const miniT = W(api, id, 12);
      const bulutT = W(api, id, 14);
      const AX = 290;
      const AY = 1960;
      const AH = 820;
      const [mx, my] = mouth('ark_nefes', AX, AY, AH);
      const inner = (c) => {
        cover(c, 'durak');
        kiragi(c, t, 1);
        bugu(c, mx, my, t, s0 + 0.12, { ang: -0.45, size: 1.15, dur: 1.0, seed: 11 });
        bugu(c, mx, my, t, dumanT - 0.15, { ang: -0.5, size: 1.4, dur: 1.1, seed: 21, n: 84, life: 2.8 });
        bugu(c, mx, my, t, azT - 0.55, { ang: -0.5, size: 1.25, dur: 1.0, seed: 31, life: 2.8 });
        bugu(c, mx, my, t, miniT - 0.6, { ang: -0.55, size: 1.35, dur: 1.1, seed: 36, n: 84, life: 3.0 });
        if (KAPAK) bugu(c, mx, my, t, t - 1.5, { ang: -0.5, size: 1.25, dur: 1.2, seed: 44, n: 84, life: 3.2 });
        // nefesten kopan minicik bulut göğe yükselir
        const ck = progress(t, miniT - 0.1, bulutT + 0.25, ease.inOut);
        if (ck > 0) {
          const x = lerp(mx + 170, 610, ck);
          const y = lerp(my - 200, 560, ck);
          const s = lerp(0.35, 1.0, ck) + 0.12 * api.pop(t, bulutT, 0.5) - 0.12 * progress(t, bulutT, bulutT + 0.5);
          const bob = Math.sin(t * 2) * 8 * ck;
          pic(c, 'bulut', x, y + bob, 360 * s, { a: progress(t, miniT - 0.1, miniT + 0.25) });
          if (t > bulutT) note(c, 'minicik bir bulut!', 610, 760, { size: 50, col: BUZ_D, align: 'center', rot: -0.04, prog: progress(t, bulutT + 0.1, bulutT + 0.6), card: true });
        }
        if (t > degilT && t < azT + 0.6) note(c, 'duman değil!', 640, 900, { size: 54, col: '#c8332b', align: 'center', rot: 0.04, prog: progress(t, degilT, degilT + 0.45), a: 1 - progress(t, azT + 0.3, azT + 0.6), card: true });
        pich(c, 'ark_nefes', AX, AY + Math.sin(t * 2.2) * 5, AH, { ax: 0.5, ay: 1 });
      };
      const p = LUP.intro(ctx, t, s0, inner, { cx: 540, cy: 1150, r0: 430 });
      if (p >= 1) fig(ctx, 'poz_titre', 880, 1915, 470, t, s0 + 1.15, { shake: t > s0 + 1.7 ? 1 : 0 });
      frost(ctx, 0.6);
      finish(ctx, t, { vig: 0.2 });
    });

  // 2 · Ciğer ve iki cam küp: nefes 35 °C, hava 0 °C, sekizde biri
  draw['n-buhar'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 'n-buhar';
      const s0 = api.S0(id);
      const nefesT = W(api, id, 2);
      const ilikT = W(api, id, 3);
      const suT = W(api, id, 5);
      const sifirT = W(api, id, 8);
      const sekizT = W(api, id, 14);
      const biriT = W(api, id, 15);
      cover(ctx, 'gok', { zoom: 1.08, zy: 1920 });
      kiragi(ctx, t, 0.8);
      // ciğer: nefes alır verir, nefes borusundan buhar yükselir
      const out = progress(t, sifirT - 0.45, sifirT + 0.05, ease.inOut);
      if (out < 1) {
        const br = 1 + 0.045 * Math.sin(((t - s0) / 1.5) * TAU);
        const a = api.pop(t, s0 + 0.1, 0.45) * (1 - out);
        const cy = lerp(640, 420, out);
        pich(ctx, 'akciger', 540, cy, 440 * br, { a });
        // nefes borusundan çıkan buhar noktaları
        const vk = progress(t, nefesT - 0.2, nefesT + 0.3) * (1 - out);
        const blue = progress(t, suT - 0.1, suT + 0.4);
        for (let i = 0; i < 26; i++) {
          const u = (t * 0.45 + hash(i, 71)) % 1;
          const x = 540 + (hash(i, 72) - 0.5) * 220 * u + Math.sin(t * 3 + i) * 10;
          const y = cy - 230 - u * 300;
          ctx.save();
          ctx.globalAlpha = vk * Math.sin(Math.PI * u);
          dot(ctx, x, y, 9 + 4 * blue, blue > 0.5 ? '#3fa9e6' : '#f2a65a');
          ctx.restore();
        }
        if (t > ilikT) note(ctx, 'ılık · ~35 °C', 200, 930, { size: 50, col: AMB_D, rot: -0.04, prog: progress(t, ilikT, ilikT + 0.45), a: 1 - out, card: true });
        if (t > suT) note(ctx, 'su buharı', 640, 960, { size: 50, col: BUZ_D, rot: 0.04, prog: progress(t, suT + 0.1, suT + 0.5), a: 1 - out, card: true });
      }
      // iki küp
      if (out > 0) {
        const ph = t * 1.1;
        const k1 = api.pop(t, sifirT - 0.35, 0.5);
        const k2 = api.pop(t, sifirT + 0.05, 0.5);
        const C1 = [255, 770];
        const C2 = [680, 770];
        const CW = 340;
        const cube = (k, [cx, cy], s, body, tint) => {
          if (s <= 0.01) return;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.scale(s, s);
          ctx.translate(-cx, -cy);
          if (tint) {
            ctx.fillStyle = tint;
            ctx.fillRect(cx - CW * 0.48, cy - CW * 0.3, CW * 0.78, CW * 0.76);
          }
          pic(ctx, k, cx, cy, CW);
          body();
          pic(ctx, k, cx, cy, CW, { a: 0.35 });
          ctx.restore();
        };
        // küpün ön yüzü (görselde)
        const box = ([cx, cy]) => [cx - CW * 0.47, cy - CW * 0.28, CW * 0.76, CW * 0.72];
        cube('kup1', C1, k1, () => {
          const [x, y, w, h] = box(C1);
          dots(ctx, x, y, w, h, 48, ph, { r: 9, seed: 60 });
        }, 'rgba(255,200,140,0.18)');
        cube('kup2', C2, k2, () => {
          const [x, y, w, h] = box(C2);
          dots(ctx, x, y, w, h, 6, ph * 0.5, { r: 9, seed: 90, sc: (i) => api.pop(t, sekizT + i * 0.12, 0.3) });
        }, 'rgba(160,215,255,0.22)');
        note(ctx, 'nefes ~35 °C', C1[0], 545, { size: 46, col: AMB_D, align: 'center', rot: -0.03, a: k1 > 0 ? 1 : 0, prog: progress(t, sifirT - 0.3, sifirT + 0.15), card: true });
        note(ctx, 'hava 0 °C', C2[0], 545, { size: 46, col: BUZ_D, align: 'center', rot: 0.03, a: k2 > 0 ? 1 : 0, prog: progress(t, sifirT + 0.1, sifirT + 0.5), card: true });
        pich(ctx, 'termometre', 960, 790, 250, { a: progress(t, sifirT + 0.2, sifirT + 0.5), rot: 0.08 });
        const fa = api.pop(t, biriT, 0.5);
        big(ctx, '1/8', C2[0], 985, { size: 120, col: AMBER, s: fa, rot: -0.05 });
      }
      // Lup nefes verir
      const lx = 165;
      const hp = fig(ctx, 'poz_nefes', lx, 1915, 430, t, s0 + 0.15);
      if (hp.a >= 1) {
        const [mx, my] = mouth('poz_nefes', lx, 1915, 430);
        bugu(ctx, mx, my, t, nefesT - 0.1, { ang: -0.6, size: 0.95, dur: 0.9, seed: 41 });
        bugu(ctx, mx, my, t, W(api, id, 10) - 0.2, { ang: -0.6, size: 0.95, dur: 0.9, seed: 46 });
      }
      frost(ctx, 0.45);
      finish(ctx, t, { vig: 0.18 });
    });

  // 3 · Mercek altında: buhar noktaları soğur, sıkışır, damlacığa dönüşür; kamera göğe çıkar
  const CL = [[-0.42, -0.3], [0.1, -0.5], [0.48, -0.12], [-0.36, 0.32], [0.18, 0.18], [0.04, 0.58]];
  draw['n-damla'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 'n-damla';
      const s0 = api.S0(id);
      const carpT = W(api, id, 3);
      const sigT = W(api, id, 6);
      const damT = W(api, id, 11);
      const gokT = W(api, id, 13);
      const bulT = W(api, id, 14);
      const pan = progress(t, gokT - 0.2, bulT + 0.5, ease.inOut);
      cover(ctx, 'gok', { zoom: 1.4, zy: lerp(1920, 0, pan) });
      kiragi(ctx, t, 1);
      // Lup nefes verir (kamera kalkınca aşağıda kalır)
      const LX = 230;
      const LY = 1915 + pan * 1100;
      const hp = fig(ctx, 'poz_nefes', LX, LY, 470, t, s0 + 0.05);
      const [mx, my] = mouth('poz_nefes', LX, LY, 470);
      if (hp.a > 0.9) {
        bugu(ctx, mx, my, t, s0 + 0.2, { ang: -0.7, size: 1.05, dur: 1.0, seed: 51, life: 3.0 });
        bugu(ctx, mx, my, t, carpT - 0.3, { ang: -0.75, size: 1.1, dur: 1.0, seed: 61, life: 3.0 });
      }
      // mercek: buğunun içi yakından
      const CX = 590;
      const CY = 600 + pan * 260;
      const la = api.pop(t, s0 + 0.35, 0.5);
      const lfade = 1 - progress(t, gokT + 0.05, gokT + 0.45);
      const R = 300 * la;
      if (la > 0.01 && lfade > 0.01) {
        ctx.save();
        ctx.globalAlpha *= lfade;
        tether(ctx, CX, CY, R, mx + 120, my - 170, (1 - pan) * clamp(la));
        const cold = progress(t, carpT - 0.2, carpT + 0.6);
        const merge = progress(t, sigT - 0.1, damT - 0.15);
        const drop = progress(t, damT - 0.15, damT + 0.15);
        // yavaşlama: hareket evresi soğumayla azalır
        const tc = carpT - 0.2;
        const lin = t < tc ? 0 : t < tc + 0.8 ? ((t - tc) ** 2) / 1.6 : 0.4 + (t - tc - 0.8);
        const ph = t * 1.4 - 0.9 * lin;
        lens(ctx, CX, CY, R, () => {
          const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R);
          g.addColorStop(0, cold > 0.5 ? '#2e5f86' : '#5a4a3e');
          g.addColorStop(1, cold > 0.5 ? '#173048' : '#2e2622');
          ctx.globalAlpha = 1;
          ctx.fillStyle = g;
          ctx.fillRect(CX - R, CY - R, R * 2, R * 2);
          if (cold > 0 && cold < 1) {
            ctx.fillStyle = `rgba(120,190,240,${0.5 * Math.sin(Math.PI * cold)})`;
            ctx.fillRect(CX - R, CY - R, R * 2, R * 2);
          }
          // kenardan gelen buz kristalleri
          for (let i = 0; i < 8; i++) {
            const an = (i / 8) * TAU + 0.3;
            const rr = R * (1.05 - 0.2 * cold);
            pic(ctx, 'kar', CX + Math.cos(an) * rr, CY + Math.sin(an) * rr, 70 * la, { a: cold, rot: t * 0.3 + i });
          }
          // 36 nokta, 6 öbek
          for (let i = 0; i < 36; i++) {
            const gi = i % 6;
            const fx = CX + (tri(hash(i, 81) * 2 + ph * (0.5 + 0.6 * hash(i, 82))) * 2 - 1) * R * 0.66;
            const fy = CY + (tri(hash(i, 83) * 2 + ph * (0.4 + 0.6 * hash(i, 84))) * 2 - 1) * R * 0.66;
            const [ox, oy] = CL[gi];
            const an = (i / 36) * TAU * 6 + t * 3;
            const jit = 16 * (1 - drop);
            const tx = CX + ox * R + Math.cos(an) * (24 + jit) * (1 - drop) + Math.sin(t * 17 + i) * 3 * merge;
            const ty = CY + oy * R + Math.sin(an) * (24 + jit) * (1 - drop) + Math.cos(t * 19 + i) * 3 * merge;
            const x = lerp(fx, tx, ease.inOut(merge));
            const y = lerp(fy, ty, ease.inOut(merge));
            const col = cold > 0.5 ? '#7fd3ff' : '#f2a65a';
            ctx.globalAlpha = 1 - drop;
            dot(ctx, x, y, 10 * la, col);
          }
          ctx.globalAlpha = 1;
          // damlacıklar
          CL.forEach(([ox, oy], i) => {
            const s = api.pop(t, damT - 0.1 + i * 0.06, 0.4);
            if (s > 0) pic(ctx, 'damla', CX + ox * R, CY + oy * R, 66 * s * la, { a: 1 });
          });
          if (merge > 0.25 && drop < 1) {
            ctx.font = `700 40px ${KA}`;
            ctx.fillStyle = AMBER;
            ctx.textAlign = 'center';
            ctx.fillText('sığmıyor!', CX + Math.sin(t * 25) * 3 * (1 - drop), CY + R * 0.88);
          }
        });
        if (t > damT + 0.2 && t < gokT + 0.3) note(ctx, 'minicik damlacık', CX, CY + R + 72, { size: 44, col: BUZ_D, align: 'center', rot: -0.03, prog: progress(t, damT + 0.2, damT + 0.7), a: 1 - progress(t, gokT, gokT + 0.3), card: true });
        ctx.restore();
      }
      // gökte: damlacıklar yukarı akar, bulutlar belirir
      if (t > gokT - 0.1) {
        const fl = progress(t, gokT, bulT + 0.3, ease.inOut);
        CL.forEach(([ox, oy], i) => {
          const x0 = CX + ox * 300;
          const y0 = CY + oy * 300;
          const tx = [300, 760, 560][i % 3];
          const ty = [560, 420, 820][i % 3];
          if (fl < 1) pic(ctx, 'damla', lerp(x0, tx, fl), lerp(y0, ty, fl) - Math.sin(Math.PI * fl) * 120, 50, { a: 1 - fl * 0.8 });
        });
        [[300, 560, 380], [760, 420, 320], [560, 820, 300]].forEach(([x, y, w], i) => {
          const s = api.pop(t, bulT - 0.1 + i * 0.18, 0.55);
          pic(ctx, 'bulut', x + Math.sin(t * 0.8 + i) * 10, y, w * s, { a: clamp(s) });
        });
        if (t > bulT + 0.6) note(ctx, 'bulut = milyarlarca damlacık', 540, 1000, { size: 46, col: BUZ_D, align: 'center', rot: -0.03, prog: progress(t, bulT + 0.6, bulT + 1.3), card: true });
      }
      frost(ctx, 0.35);
      finish(ctx, t, { vig: 0.18 });
    });

  // 4 · Bulut dağılır: damlacıklar küçülür, yeniden görünmez buhar olur
  const DR = [[-0.38, -0.25], [0.2, -0.42], [0.45, 0.05], [-0.3, 0.3], [0.12, 0.3], [-0.05, -0.02]];
  draw['n-kayip'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 'n-kayip';
      const s0 = api.S0(id);
      const kayT = W(api, id, 3);
      const damT = W(api, id, 6);
      const kuruT = W(api, id, 8);
      const karT = W(api, id, 10);
      const gorT = W(api, id, 12);
      const buhT = W(api, id, 13);
      cover(ctx, 'durak');
      kiragi(ctx, t, 1);
      // Lup bir nefes verir; bulut dağılır
      const LX = 820;
      const LY = 1915;
      const hp = fig(ctx, 'poz_nefes', LX, LY, 480, t, s0 + 0.05, { flip: true });
      const [mx, my] = mouth('poz_nefes', LX, LY, 480, { flip: true });
      if (hp.a > 0.9) bugu(ctx, mx, my, t, s0 + 0.25, { ang: -2.3, size: 1.3, dur: 1.1, seed: 71, life: 2.9, n: 84 });
      // kronometre: 1… 2… 3 sn
      const wk = progress(t, s0 + 0.3, s0 + 0.3 + 2.4);
      const wa = progress(t, s0 + 0.2, s0 + 0.5) * (1 - progress(t, damT - 0.3, damT));
      watch(ctx, 230, 760, 90, wk, `${Math.min(3, Math.floor(wk * 3 + 1e-6) + (wk > 0 ? 1 : 0))} sn`, { a: wa });
      if (t > kayT && t < damT) note(ctx, 'kayboldu!', 230, 930, { size: 46, col: BUZ_D, align: 'center', rot: -0.04, prog: progress(t, kayT, kayT + 0.4), a: 1 - progress(t, damT - 0.3, damT), card: true });
      // mercek: damlacıklar küçülür, buhar noktaları kaçar
      const CX = 540;
      const CY = 600;
      const la = api.pop(t, damT - 0.2, 0.5);
      const R = 290 * la;
      if (la > 0.01) {
        const shrink = progress(t, kuruT - 0.2, gorT);
        const flee = progress(t, karT - 0.3, buhT + 0.2);
        const fade = 1 - progress(t, gorT, buhT + 0.3);
        lens(ctx, CX, CY, R, () => {
          const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R);
          g.addColorStop(0, '#3a6a8e');
          g.addColorStop(1, '#1b3550');
          ctx.fillStyle = g;
          ctx.fillRect(CX - R, CY - R, R * 2, R * 2);
          // kuru hava: sıcak tonlu sis
          const dk = progress(t, kuruT - 0.1, kuruT + 0.5);
          ctx.fillStyle = `rgba(255,205,140,${0.18 * dk})`;
          ctx.fillRect(CX - R, CY - R, R * 2, R * 2);
          DR.forEach(([ox, oy], i) => {
            const s = 1 - shrink;
            const x = CX + ox * R;
            const y = CY + oy * R;
            if (s > 0.02) pic(ctx, 'damla', x, y, 70 * s * la);
            // buhar noktaları dışarı kaçar
            if (shrink > 0) {
              for (let k = 0; k < 6; k++) {
                const an = hash(i * 6 + k, 91) * TAU;
                const sp = (0.4 + 0.6 * hash(i * 6 + k, 92)) * R * 0.9;
                const born = hash(i * 6 + k, 93) * 0.6;
                const u = clamp((shrink - born) / (1 - born));
                if (u <= 0) continue;
                const d = sp * (0.15 + flee * 0.85) * u + Math.sin(t * 8 + k) * 5;
                ctx.globalAlpha = (0.2 + 0.8 * fade) * clamp(u * 3);
                dot(ctx, x + Math.cos(an) * d, y + Math.sin(an) * d, 9 * la, '#7fd3ff');
              }
              ctx.globalAlpha = 1;
            }
          });
        }, { rot: t * 0.1 });
        tether(ctx, CX, CY, R, mx - 130, my - 200, clamp(la) * 0.8);
        if (t > kuruT) note(ctx, 'kuru hava', CX, CY - R * 0.62, { size: 44, col: AMB_D, align: 'center', rot: -0.04, prog: progress(t, kuruT, kuruT + 0.4), card: true });
        if (t > buhT - 0.05) note(ctx, 'yeniden buhar', CX, CY + R + 70, { size: 50, col: BUZ_D, align: 'center', rot: -0.03, prog: progress(t, buhT - 0.05, buhT + 0.5), card: true });
      }
      frost(ctx, 0.5);
      finish(ctx, t, { vig: 0.2 });
    });

  // 5 · Yazdan kışa: aynı nefes, kışın görünür; günde 1,5–2 bardak
  draw['n-bardak'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 'n-bardak';
      const s0 = api.S0(id);
      const senT = W(api, id, 1);
      const yazT = W(api, id, 4);
      const kisT = W(api, id, 5);
      const gunT = W(api, id, 7);
      const birT = W(api, id, 8);
      const bucT = W(api, id, 9);
      const ikiT = W(api, id, 10);
      const barT = W(api, id, 12);
      const gorT = W(api, id, 17);
      const AX = 270;
      const AY = 1960;
      const AH = 800;
      const [mx, my] = mouth('ark_nefes', AX, AY, AH);
      const wipe = progress(t, kisT - 0.15, kisT + 0.45, ease.inOut);
      const WX = lerp(-200, 1300, wipe);
      const scene = (winter) => {
        cover(ctx, winter ? 'durak' : 'yaz');
        if (winter) kiragi(ctx, t, 1);
        else {
          // sıcak havada görünmez buhar: yalnız minik noktalar
          for (let i = 0; i < 18; i++) {
            const u = ((t - senT) * 0.6 + hash(i, 61)) % 1;
            if (t < senT) break;
            ctx.save();
            ctx.globalAlpha = 0.55 * Math.sin(Math.PI * u);
            dot(ctx, mx + 30 + u * 300 + (hash(i, 62) - 0.5) * 120 * u, my - u * 260 + (hash(i, 63) - 0.5) * 80, 6, '#3fa9e6');
            ctx.restore();
          }
          if (t > yazT - 0.1) note(ctx, 'görünmez', mx + 230, my - 330, { size: 44, col: AMB_D, rot: -0.05, prog: progress(t, yazT - 0.1, yazT + 0.3), card: true });
        }
      };
      ctx.save();
      scene(false);
      ctx.restore();
      if (wipe > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(-400, 0);
        ctx.lineTo(WX + 300, 0);
        ctx.lineTo(WX - 300, 1920);
        ctx.lineTo(-400, 1920);
        ctx.closePath();
        ctx.clip();
        scene(true);
        bugu(ctx, mx, my, t, kisT - 0.1, { ang: -0.7, size: 1.2, dur: 1.1, seed: 81, n: 80, life: 2.6 });
        bugu(ctx, mx, my, t, gunT + 0.6, { ang: -0.65, size: 1.1, dur: 1.0, seed: 86, life: 2.6 });
        bugu(ctx, mx, my, t, gorT - 0.3, { ang: -0.75, size: 1.25, dur: 1.1, seed: 91, n: 80 });
        ctx.restore();
        if (wipe < 1) {
          // silme çizgisi: kırağılı kenar
          ctx.save();
          ctx.strokeStyle = 'rgba(235,248,255,0.95)';
          ctx.lineWidth = 16;
          ctx.shadowColor = '#8fe0ff';
          ctx.shadowBlur = 30;
          ctx.beginPath();
          ctx.moveTo(WX + 300, 0);
          ctx.lineTo(WX - 300, 1920);
          ctx.stroke();
          ctx.restore();
        }
      }
      // mevsim etiketi
      const season = t < kisT - 0.05 ? 'YAZ' : 'KIŞ';
      big(ctx, season, 880, 330, { size: 92, col: season === 'YAZ' ? AMBER : BUZ, a: progress(t, s0 + 0.2, s0 + 0.5), s: season === 'KIŞ' ? 0.7 + 0.3 * api.pop(t, kisT, 0.4) : 1, rot: 0.05 });
      // bardaklar: nefesten damla damla dolar
      const ga = api.pop(t, gunT - 0.1, 0.45);
      if (ga > 0) {
        const f1 = progress(t, gunT, birT + 0.35, ease.out);
        const f2 = 0.5 * progress(t, birT + 0.25, bucT + 0.35, ease.out) + 0.5 * progress(t, ikiT, ikiT + 0.5, ease.out);
        const B1 = [440, 900];
        const B2 = [700, 900];
        bardak(ctx, B1[0], B1[1], 280, f1, { s: ga });
        bardak(ctx, B2[0], B2[1], 280, f2, { s: api.pop(t, gunT + 0.1, 0.45) });
        // nefesten bardağa uçan damlalar
        for (let i = 0; i < 10; i++) {
          const born = gunT + i * ((ikiT + 0.4 - gunT) / 10);
          const u = clamp((t - born) / 0.55);
          if (u <= 0 || u >= 1) continue;
          const tgt = born < birT + 0.3 ? B1 : B2;
          const x = lerp(mx + 120, tgt[0], u);
          const y = lerp(my - 180, tgt[1] - 300, u) - Math.sin(Math.PI * u) * 180;
          pic(ctx, 'damla', x, y, 34, { a: 1 - u * 0.3 });
        }
        big(ctx, '1,5–2', 570, 520, { size: 104, col: AMBER, s: api.pop(t, ikiT, 0.5), rot: -0.04 });
        if (t > ikiT + 0.3) note(ctx, 'bardak · her gün', 570, 990, { size: 44, col: BUZ_D, align: 'center', rot: -0.02, prog: progress(t, ikiT + 0.3, ikiT + 0.8), card: true });
      }
      pich(ctx, 'ark_nefes', AX, AY + Math.sin(t * 2.2) * 5, AH, { ax: 0.5, ay: 1 });
      fig(ctx, 'poz_bardak', 870, 1915, 470, t, barT - 0.2);
      frost(ctx, 0.5 * wipe);
      finish(ctx, t, { vig: 0.2 });
    });

  // 6 · Ejderha modu: arkadaşına gönder
  draw['n-cta'] = (ctx, t, api) =>
    frame(ctx, t, api, () => {
      const id = 'n-cta';
      const { S0, end, fadeIn, pop } = api;
      const s0 = S0(id);
      const ejT = W(api, id, 1);
      paper(ctx, t, { stains: [[120, 1760, 110, 91]] });
      const PX = 700;
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
        ctx.fillRect(-250, -290, 500, 580);
        ctx.shadowColor = 'transparent';
        ctx.save();
        ctx.beginPath();
        ctx.rect(-226, -266, 452, 470);
        ctx.clip();
        ctx.drawImage(IMG.durak, 80, 560, 760, 790, -226, -266, 452, 470);
        const ax = -95;
        const ay = 204;
        pich(ctx, 'ark_ejder', ax, ay, 330, { ax: 0.5, ay: 1 });
        const [m1x, m1y] = mouth('ark_ejder', ax, ay, 330);
        pich(ctx, 'poz_ejder', 120, ay + 4, 270, { ax: 0.5, ay: 1, flip: true });
        const [m2x, m2y] = mouth('poz_ejder', 120, ay + 4, 270, { flip: true });
        // her 1,4 sn'de bir ejderha nefesi
        for (let k = 0; k < 4; k++) {
          const tk = ejT - 0.2 + k * 1.4;
          bugu(ctx, m1x, m1y, t, tk, { ang: -0.5, size: 0.55, dur: 0.6, seed: 100 + k, life: 1.8 });
          bugu(ctx, m2x, m2y, t, tk + 0.35, { ang: -2.4, size: 0.5, dur: 0.6, seed: 120 + k, life: 1.8 });
        }
        ctx.restore();
        note(ctx, 'ejderha modu', 0, 262, { size: 42, col: 'rgba(42,28,20,0.75)', align: 'center', rot: -0.02 });
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
        face: done ? 'mutlu' : t > ejT ? 'gulum' : 'merak',
        gx: reach > 0 ? -0.9 : -0.3,
        gy: reach > 0 ? 0.4 : -0.6,
        arms,
      }, t);
      // oyuncak ejderha fotoğrafa uçar
      const fly = progress(t, s0 + 1.0, s0 + 1.7, ease.inOut);
      if (fly > 0 && fly < 1) {
        const x = lerp(930, PX + 215, fly) + Math.sin(Math.PI * fly) * 120;
        const y = lerp(1180, PY + 110, fly) - Math.sin(Math.PI * fly) * 160;
        pic(ctx, 'ejder', x, y, 150, { rot: -0.2 + Math.sin(t * 20) * 0.08 });
        bugu(ctx, x + 40, y - 30, t, s0 + 1.05, { ang: -0.3, size: 0.4, dur: 0.5, seed: 140, life: 1.2 });
      }
      if (t >= s0 + 1.7) pic(ctx, 'ejder', PX + 215, PY + 110, 140 * (0.8 + 0.2 * pop(t, s0 + 1.7, 0.4)), { rot: 0.08 });
      if (t > s0 + 1.75) note(ctx, 'gönderildi ✓', 470, 1000, { size: 46, col: TEAL, a: fadeIn(t, s0 + 1.75, 0.25), rot: -0.03 });
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
  // Ses (müzik yatağı, kanca, geçişler, ortam ve kapanış def.ses ile ses.js'ten)
  // ---------------------------------------------------------------------------
  function score(m, hz, api) {
    const V = (t, tur, g) => Y.vurgu(m, t, tur, { gain: g ?? 1 });
    // nefes hışırtısı: yumuşak, alçak bir "hhh"
    const NF = (t, g = 1, pan = 0) => m.whoosh(t, { dur: 0.9, from: 260, to: 1300, gain: 0.035 * g, panFrom: pan, panTo: pan * 0.3, q: 0.7 });
    const h = 'n-hook';
    const s1 = api.S0(h);
    NF(s1 + 0.15, 1, -0.3);
    NF(W(api, h, 4) - 0.15, 1.2, -0.3);
    V(W(api, h, 7), 'yanlis', 0.4);
    NF(W(api, h, 8) - 0.1, 1.1, -0.3);
    V(s1 + 1.15, 'boing', 0.6);
    V(W(api, h, 12), 'yukselis', 0.6);
    V(W(api, h, 14), 'sihir');
    const b = 'n-buhar';
    V(api.S0(b) + 0.1, 'pop', 0.7);
    NF(W(api, b, 2) - 0.1, 0.9, -0.5);
    V(W(api, b, 3), 'kalem', 0.8);
    V(W(api, b, 5), 'sihir', 0.6);
    V(W(api, b, 8) - 0.35, 'pop', 0.7);
    V(W(api, b, 8) + 0.05, 'pop', 0.8);
    m.wind(W(api, b, 8), 1.6, { gain: 0.03 });
    for (let i = 0; i < 6; i++) m.pop(W(api, b, 14) + i * 0.12, { freq: 700 + i * 90, gain: 0.05, pan: 0.3 });
    V(W(api, b, 15), 'damga', 0.8);
    const d = 'n-damla';
    NF(api.S0(d) + 0.2, 1, -0.5);
    V(api.S0(d) + 0.35, 'pop', 0.6);
    V(W(api, d, 3) - 0.1, 'citla', 0.9);
    m.bubbles(W(api, d, 6), 1.2, { gain: 0.03, rate: 9 });
    V(W(api, d, 11) - 0.1, 'sihir');
    for (let i = 0; i < 6; i++) m.pop(W(api, d, 11) - 0.1 + i * 0.06, { freq: 900 + i * 70, gain: 0.04, pan: (i - 2.5) * 0.15 });
    V(W(api, d, 13) - 0.2, 'yukselis', 0.9);
    V(W(api, d, 14), 'aha', 0.7);
    const k = 'n-kayip';
    NF(api.S0(k) + 0.25, 1.2, 0.4);
    for (let i = 0; i < 3; i++) V(api.S0(k) + 0.3 + i * 0.8, 'tik', 0.6);
    V(W(api, k, 6) - 0.2, 'pop', 0.6);
    m.whoosh(W(api, k, 10) - 0.2, { dur: 1.4, from: 800, to: 4000, gain: 0.025 });
    V(W(api, k, 13), 'sihir', 0.7);
    const br = 'n-bardak';
    m.whoosh(W(api, br, 5) - 0.15, { dur: 0.6, from: 500, to: 2600, gain: 0.05, panFrom: -0.4, panTo: 0.4 });
    V(W(api, br, 5), 'citla', 0.7);
    NF(W(api, br, 5) - 0.1, 1.2, -0.3);
    for (let i = 0; i < 10; i++) {
      const gunT = W(api, br, 7);
      const born = gunT + i * ((W(api, br, 10) + 0.4 - gunT) / 10);
      m.pop(born + 0.55, { freq: 1100 + (i % 4) * 120, gain: 0.03, pan: 0.1 });
    }
    V(W(api, br, 10), 'dogru', 0.8);
    V(W(api, br, 12) - 0.2, 'boing', 0.6);
    NF(W(api, br, 17) - 0.25, 1.1, -0.3);
    V(W(api, br, 17), 'sihir', 0.6);
    const c = api.S0('n-cta');
    V(c + 0.1, 'pop', 0.7);
    V(W(api, 'n-cta', 1), 'boing', 0.8);
    m.whoosh(c + 1.0, { dur: 0.7, from: 700, to: 2600, gain: 0.05, panFrom: 0.3, panTo: -0.1 });
    V(c + 1.7, 'pop');
  }

  window.FILM = K.short({
    title: 'Soğukta ağzımızdan neden duman çıkar? · YUP Akademi',
    series: 'VÜCUDUN GİZLİ AYARLARI',
    share: true,
    gap: 0.12,
    breath: 0.2,
    wipe: 0.45,
    transition,
    extra: { 'n-hook': 0.35, 'n-buhar': 0.55, 'n-damla': 0.75, 'n-kayip': 0.5, 'n-bardak': 0.45, 'n-cta': 1.75 },
    lead: { 'n-hook': 0.1, 'n-buhar': 0.2, 'n-damla': 0.2, 'n-kayip': 0.2, 'n-bardak': 0.2, 'n-cta': 0.3 },
    titles: {
      'n-hook': 'Duman değil, bulut',
      'n-buhar': 'Nefes ve soğuk hava',
      'n-damla': 'Damlacıklar ve gökteki bulutlar',
      'n-kayip': 'Neden kaybolur?',
      'n-bardak': 'Günde 1,5–2 bardak',
      'n-cta': 'Arkadaşına gönder',
    },
    ses: {
      muzik: 'sicak',
      kanca: 'mercek',
      ortam: { 'n-hook': 'kis', 'n-buhar': 'kis', 'n-damla': 'kis', 'n-kayip': 'kis', 'n-bardak': 'kis' },
    },
    draw,
    score,
  });
})();
