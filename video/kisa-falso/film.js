/*
 * YUP Akademi · Derbi özel kısa video (1080×1920) — Falsonun fiziği: Top havada neden kıvrılır?
 *
 * Gerçekçi kalıp: gece stadyumu kodla çizilir. Çim, saha çizgileri, reklam panoları, tribün ve seyirci piksel
 * piksel ışın izlemeyle hesaplanır (renderWorld); kale ağı, baraj, kaleci ve top üstüne 3B izdüşümle çizilir.
 * Topun yolu elle çizilmez: yer çekimi, hava direnci ve Magnus kuvvetiyle adım adım hesaplanır (flight).
 * Top klasik siyah-beyaz kesik ikosahedron deseniyle piksel piksel gölgelenir ve gerçek dönüş ekseninde döner.
 * Kulüp renkleri ve logoları yok: video tarafsız. Hızlı kalıp: ilk saniyede vuruş; 30–40 sn; tek çağrı sonda.
 * Sahneler: 4 metre kıvrılan frikik · duman tünelinde dönen top (potansiyel akış + girdap) · basınç farkı ve
 * Magnus etkisi · yavaşladıkça artan kıvrılma ve sarmal · derbide topun dönüşüne bak · yorum çağrılı kapanış.
 * Kaynaklar: kaynaklar.md.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, lerp, ease, progress, hash } = E;
  const K = window.YupKisa;
  const { SW, SH, C, T, M, rr, dot, appIcon, star } = K;
  const DEG = Math.PI / 180;
  const LIME = '#b9e62f';
  const AMBER = [245, 158, 11];
  const CYAN = [120, 226, 236];
  const WHITE = [240, 244, 248];

  // ---------------------------------------------------------------------------
  // Vektörler ve küçük yardımcılar
  // ---------------------------------------------------------------------------
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => mul(a, 1 / Math.hypot(a[0], a[1], a[2]));
  const mix3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
  const smooth = (a, b, x) => {
    const u = clamp((x - a) / (b - a));
    return u * u * (3 - 2 * u);
  };
  const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const canvas = (w, h) => {
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.ceil(w));
    cv.height = Math.max(1, Math.ceil(h));
    return cv;
  };

  // Eksen-açı dönme matrisi (satırlar)
  function rotM(k, th) {
    const [x, y, z] = norm(k);
    const c = Math.cos(th);
    const s = Math.sin(th);
    const q = 1 - c;
    return [
      [c + x * x * q, x * y * q - z * s, x * z * q + y * s],
      [y * x * q + z * s, c + y * y * q, y * z * q - x * s],
      [z * x * q - y * s, z * y * q + x * s, c + z * z * q],
    ];
  }
  const mulM = (A, B) => A.map((r) => [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
  const transp = (A) => [0, 1, 2].map((i) => [A[0][i], A[1][i], A[2][i]]);

  // Değer gürültüsü (2B)
  const h2 = (x, z, s) => {
    let h = Math.imul(x, 374761393) ^ Math.imul(z, 668265263) ^ Math.imul(s, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  function vnoise(x, z, s) {
    const ix = Math.floor(x);
    const iz = Math.floor(z);
    const fx = x - ix;
    const fz = z - iz;
    const ux = fx * fx * (3 - 2 * fx);
    const uz = fz * fz * (3 - 2 * fz);
    const a = h2(ix, iz, s);
    const b = h2(ix + 1, iz, s);
    const c = h2(ix, iz + 1, s);
    const d = h2(ix + 1, iz + 1, s);
    return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
  }

  function glow(g, x, y, r, c, a) {
    if (r <= 0.5 || a <= 0.002) return;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, rgb(c, a));
    gr.addColorStop(0.35, rgb(c, a * 0.35));
    gr.addColorStop(1, rgb(c, 0));
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Koyu zeminde okunur yazı (yumuşak gölgeli)
  function TS(ctx, str, x, y, o = {}) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = o.blur ?? 22;
    ctx.shadowOffsetY = 4;
    T(ctx, str, x, y, { color: '#fff', ...o });
    ctx.restore();
  }

  // Koyu sahneler için seri etiketi
  function darkTag(ctx, a = 1) {
    if (a <= 0.002) return;
    appIcon(ctx, 104, 214, 72, { a });
    TS(ctx, 'DERBİ ÖZEL', 160, 204, { size: 30, weight: 900, align: 'left', spacing: 3, alpha: a, blur: 10 });
    TS(ctx, 'YUP Akademi · Falsonun fiziği', 160, 238, { size: 24, weight: 700, color: 'rgba(255,255,255,0.78)', align: 'left', alpha: a, blur: 10 });
  }

  // Üst ve alt kenarı karartan bant (yazılar okunsun), vinyet ve film greni
  function topShade(ctx, h = 620, a = 0.62) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, `rgba(2,6,16,${a})`);
    g.addColorStop(1, 'rgba(2,6,16,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SW, h);
  }
  let GRAIN = null;
  function finish(ctx, t, { vig = 0.5, grain = 0.07 } = {}) {
    const g = ctx.createRadialGradient(540, 900, 380, 540, 960, 1250);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${vig})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SW, SH);
    if (!GRAIN) {
      GRAIN = canvas(256, 256);
      const gg = GRAIN.getContext('2d');
      const im = gg.createImageData(256, 256);
      for (let i = 0; i < 256 * 256; i++) {
        const v = (hash(i, 991) * 255) | 0;
        im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v;
        im.data[i * 4 + 3] = 255;
      }
      gg.putImageData(im, 0, 0);
    }
    ctx.save();
    ctx.globalAlpha = grain;
    ctx.globalCompositeOperation = 'overlay';
    const f = Math.floor(t * 30);
    ctx.translate(-((hash(f, 3) * 256) | 0), -((hash(f, 4) * 256) | 0));
    ctx.fillStyle = ctx.createPattern(GRAIN, 'repeat');
    ctx.fillRect(0, 0, SW + 256, SH + 256);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Fizik: topun yolu adım adım hesaplanır (yer çekimi + hava direnci + Magnus)
  // Eksenler: x sağ, y yukarı, z kaleye doğru (m). Top 0,43 kg, yarıçap 0,11 m; hava 1,2 kg/m³.
  // ---------------------------------------------------------------------------
  const BALL_R = 0.11;
  const BALL_M = 0.43;
  const RHO = 1.2;
  const CD = 0.25; // bu hızda sınır tabakası türbülanslı
  const G = 9.81;
  const KA = (0.5 * RHO * Math.PI * BALL_R * BALL_R) / BALL_M;

  function flight({ p0, speed, yaw, pitch, rps, axis = [0, -1, 0], until, gravity = true, dt = 1 / 480, every = 4 }) {
    let p = [...p0];
    const v = [speed * Math.sin(yaw) * Math.cos(pitch), speed * Math.sin(pitch), speed * Math.cos(yaw) * Math.cos(pitch)];
    const w = norm(axis);
    const om = rps * 2 * Math.PI;
    const out = [{ t: 0, p: [...p], v: [...v] }];
    let t = 0;
    for (let i = 1; i < 400000; i++) {
      const s = Math.hypot(v[0], v[1], v[2]);
      const CL = (1.1 * BALL_R * om) / s; // kaldırma katsayısı dönüş oranıyla (rω/v) artar
      const c = cross(w, v);
      const cn = Math.hypot(c[0], c[1], c[2]) || 1;
      for (let k = 0; k < 3; k++) v[k] += (-KA * CD * s * v[k] + (KA * CL * s * s * c[k]) / cn - (gravity && k === 1 ? G : 0)) * dt;
      p = add(p, mul(v, dt));
      t += dt;
      const stop = until(p, v, t);
      if (i % every === 0 || stop) out.push({ t, p: [...p], v: [...v] });
      if (stop) break;
    }
    return out;
  }

  function at(path, t) {
    if (t <= 0) return path[0];
    const n = path.length;
    if (t >= path[n - 1].t) return path[n - 1];
    let lo = 0;
    let hi = n - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (path[mid].t <= t) lo = mid;
      else hi = mid;
    }
    const a = path[lo];
    const b = path[hi];
    const u = (t - a.t) / (b.t - a.t || 1);
    return { t, p: mix3(a.p, b.p, u), v: mix3(a.v, b.v, u) };
  }

  // Frikik: kale çizgisi z = 25 m'de; top sağ çaprazdan, barajın dışından gider, kıvrılıp üst köşeye girer
  const D = 25;
  const GW = 7.32 / 2;
  const GH = 2.44;
  const SHOT = { p0: [4, BALL_R, 0], speed: 28, yaw: 7.5 * DEG, pitch: 18.5 * DEG, rps: 7.6, axis: [0.15, -1, 0] };
  // Ağ profili: üst ağ üst direkten 1 m geriye hafifçe iner, arka ağ yere 2 m geride değer
  const netZ = (y) => (y >= 2.25 ? D + (GH - Math.min(GH, y)) / 0.19 : D + 1 + (2.25 - Math.max(0, y)) / 2.25);

  const HOOK = (() => {
    const path = flight({ ...SHOT, until: (p) => (p[2] > D && p[2] >= netZ(p[1]) - BALL_R) || (p[1] < 0 && p[2] > 2) });
    const ghost = flight({ ...SHOT, rps: 0, until: (p) => p[2] >= D });
    const hit = path[path.length - 1];
    const line = path.find((s) => s.p[2] >= D) ?? hit;
    const gEnd = ghost[ghost.length - 1];
    return { path, ghost, hit, line, gEnd, dev: gEnd.p[0] - line.p[0] };
  })();

  // Topun durumu (gerçek uçuş zamanı): uçuş, ağa çarpma, ağın içinde düşme
  function hookBall(tt) {
    if (tt <= 0) return { p: SHOT.p0, v: [0, 0, 0] };
    if (tt <= HOOK.hit.t) return at(HOOK.path, tt);
    const u = tt - HOOK.hit.t;
    const h = HOOK.hit.p;
    const fall = Math.max(0, u - 0.1);
    return {
      p: [h[0] - 0.25 * (1 - Math.exp(-u * 6)), Math.max(BALL_R, h[1] - 0.5 * G * 0.8 * fall * fall), h[2] + 0.36 * (1 - Math.exp(-u * 16)) - 0.12 * clamp((u - 0.2) / 0.6)],
      v: [0, 0, 0],
    };
  }

  // ---------------------------------------------------------------------------
  // Kamera
  // ---------------------------------------------------------------------------
  function camera(pos, target, fovDeg = 55) {
    const fwd = norm(sub(target, pos));
    const right = norm(cross([0, 1, 0], fwd));
    const up = cross(fwd, right);
    const fl = SH / 2 / Math.tan((fovDeg * DEG) / 2);
    const proj = (p) => {
      const d = sub(p, pos);
      const z = dot3(d, fwd);
      if (z < 0.05) return null;
      return [SW / 2 + (dot3(d, right) / z) * fl, SH / 2 - (dot3(d, up) / z) * fl, z, fl / z];
    };
    return { pos, fwd, right, up, fl, proj, key: [...pos, ...target, fovDeg].map((v) => v.toFixed(3)).join(',') };
  }

  // ---------------------------------------------------------------------------
  // Çim dokusu: binlerce kısa yaprak çizgisi, dikişsiz; uzaklığa göre mip seviyeleri
  // ---------------------------------------------------------------------------
  const TEX = 512; // 512 doku pikseli = 1,6 m (piksel başına ≈ 3 mm)
  const TEX_M = 1.6;
  let GRASS = null;
  function grass() {
    if (GRASS) return GRASS;
    const cv = canvas(TEX, TEX);
    const g = cv.getContext('2d');
    g.fillStyle = 'rgb(40,92,36)';
    g.fillRect(0, 0, TEX, TEX);
    g.lineCap = 'round';
    for (let i = 0; i < 32000; i++) {
      const x = hash(i, 71) * TEX;
      const y = hash(i, 72) * TEX;
      const a = Math.PI / 2 + (hash(i, 73) - 0.5) * 1.7;
      const len = 3 + hash(i, 74) * 10;
      const l = 0.58 + hash(i, 75) * 0.8;
      const ex = Math.cos(a) * len;
      const ey = Math.sin(a) * len;
      g.strokeStyle = `rgb(${(52 * l) | 0},${(120 * l) | 0},${(44 * l) | 0})`;
      g.lineWidth = 0.8 + hash(i, 76) * 1.4;
      for (const ox of [-TEX, 0, TEX]) {
        for (const oy of [-TEX, 0, TEX]) {
          const x0 = x + ox;
          const y0 = y + oy;
          if (x0 < -16 || x0 > TEX + 16 || y0 < -16 || y0 > TEX + 16) continue;
          g.beginPath();
          g.moveTo(x0, y0);
          g.lineTo(x0 + ex, y0 + ey);
          g.stroke();
        }
      }
    }
    const levels = [g.getImageData(0, 0, TEX, TEX).data];
    for (let n = TEX / 2; n >= 1; n /= 2) {
      const src = levels[levels.length - 1];
      const m = n * 2;
      const dst = new Uint8ClampedArray(n * n * 4);
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          for (let c = 0; c < 3; c++) {
            const i0 = (2 * y * m + 2 * x) * 4 + c;
            dst[(y * n + x) * 4 + c] = (src[i0] + src[i0 + 4] + src[i0 + m * 4] + src[i0 + m * 4 + 4]) / 4;
          }
        }
      }
      levels.push(dst);
    }
    GRASS = { cv, levels };
    return GRASS;
  }

  function grassAt(X, Z, fp, out) {
    const lv = GRASS.levels;
    const L = Math.min(lv.length - 1, Math.max(0, Math.ceil(Math.log2(Math.max(1, (fp / TEX_M) * TEX)))));
    const n = TEX >> L;
    let u = X / TEX_M;
    u -= Math.floor(u);
    let v = Z / TEX_M;
    v -= Math.floor(v);
    const i = (((v * n) | 0) * n + ((u * n) | 0)) * 4;
    const d = lv[L];
    out[0] = d[i];
    out[1] = d[i + 1];
    out[2] = d[i + 2];
  }

  // Saha çizgileri (FIFA ölçüleri). Uzak kale z = D, yakın kale z = D − 105; orta x = 0
  const PITCH = (() => {
    const segs = [];
    const arcs = []; // [cx, cz, r, zmin, zmax, xmin, xmax]
    const spots = [];
    for (const [g0, dir] of [[D, -1], [D - 105, 1]]) {
      const b = g0 + dir * 16.5;
      const s = g0 + dir * 5.5;
      const lo = (a, c) => Math.min(a, c);
      const hi = (a, c) => Math.max(a, c);
      segs.push([-34, g0, 34, g0]);
      segs.push([-20.16, b, 20.16, b], [-20.16, lo(g0, b), -20.16, hi(g0, b)], [20.16, lo(g0, b), 20.16, hi(g0, b)]);
      segs.push([-9.16, s, 9.16, s], [-9.16, lo(g0, s), -9.16, hi(g0, s)], [9.16, lo(g0, s), 9.16, hi(g0, s)]);
      const pz = g0 + dir * 11;
      spots.push([0, pz, 0.11]);
      arcs.push(dir < 0 ? [0, pz, 9.15, -1e9, b, -1e9, 1e9] : [0, pz, 9.15, b, 1e9, -1e9, 1e9]);
      arcs.push([-34, g0, 1, lo(g0, g0 + dir), hi(g0, g0 + dir), -34, -33]);
      arcs.push([34, g0, 1, lo(g0, g0 + dir), hi(g0, g0 + dir), 33, 34]);
    }
    segs.push([-34, D - 105, -34, D], [34, D - 105, 34, D], [-34, D - 52.5, 34, D - 52.5]);
    arcs.push([0, D - 52.5, 9.15, -1e9, 1e9, -1e9, 1e9]);
    spots.push([0, D - 52.5, 0.15]);
    return { segs, arcs, spots };
  })();

  // Bir pikselin çizgiyle örtülme oranı (piksel genişliği fp metre)
  const cover1 = (d, hw, fp) => Math.max(0, Math.min(d + fp / 2, hw) - Math.max(d - fp / 2, -hw)) / fp;
  function marks(X, Z, fp) {
    if (X < -34.6 || X > 34.6 || Z > D + 0.6 || Z < D - 105.6) return 0;
    const hw = 0.06;
    let best = 0;
    for (const [x1, z1, x2, z2] of PITCH.segs) {
      let d;
      if (z1 === z2) {
        if (Math.abs(Z - z1) > hw + fp) continue;
        const dx = X < x1 ? x1 - X : X > x2 ? X - x2 : 0;
        d = Math.hypot(dx, Z - z1);
      } else {
        if (Math.abs(X - x1) > hw + fp) continue;
        const dz = Z < z1 ? z1 - Z : Z > z2 ? Z - z2 : 0;
        d = Math.hypot(X - x1, dz);
      }
      best = Math.max(best, cover1(d, hw, fp));
    }
    for (const [cx, cz, r, z0, z1, x0, x1] of PITCH.arcs) {
      if (Z < z0 || Z > z1 || X < x0 || X > x1) continue;
      const d = Math.abs(Math.hypot(X - cx, Z - cz) - r);
      if (d < hw + fp) best = Math.max(best, cover1(d, hw, fp));
    }
    for (const [cx, cz, r] of PITCH.spots) {
      const d = Math.hypot(X - cx, Z - cz);
      if (d < r + fp) best = Math.max(best, clamp((r - d) / fp + 0.5));
    }
    return Math.min(1, best);
  }

  // Zemin rengi: çim dokusu + biçilmiş şeritler + büyük ölçekli renk dalgası + kale ağzında aşınma + çizgiler
  function groundColor(X, Z, fp, out) {
    grassAt(X, Z, fp, out);
    const q = (D - Z) / 5.25;
    const band = Math.floor(q);
    const f = q - band;
    const edge = Math.min(f, 1 - f) * 5.25;
    const sgn = band & 1 ? -1 : 1;
    let k = 0.95 + 0.085 * sgn * clamp(edge / Math.max(fp * 1.5, 0.01));
    k *= 0.9 + 0.2 * vnoise(X * 0.31, Z * 0.31, 5);
    k *= 0.95 + 0.1 * vnoise(X * 2.3, Z * 2.3, 7);
    let r = out[0] * k * 1.18;
    let g = out[1] * k * 1.16;
    let b = out[2] * k * 1.12;
    const wear = smooth(0.5, 0.9, vnoise(X * 2.3, Z * 2.3, 9)) * Math.exp(-((X * X) / 9 + ((Z - (D - 2.5)) ** 2) / 5)) * 0.38;
    if (wear > 0.01) {
      r = lerp(r, 96, wear);
      g = lerp(g, 82, wear);
      b = lerp(b, 56, wear);
    }
    const m = marks(X, Z, fp) * 0.92;
    out[0] = lerp(r, 230, m);
    out[1] = lerp(g, 236, m);
    out[2] = lerp(b, 228, m);
  }

  // Reklam panosu dokusu: 120 m × 0,9 m, marka yazıları
  let BOARD = null;
  function board() {
    if (BOARD) return BOARD;
    const W = 7200;
    const H = 54;
    const cv = canvas(W, H);
    const g = cv.getContext('2d');
    g.fillStyle = '#04101a';
    g.fillRect(0, 0, W, H);
    const items = [
      ['YUP AKADEMİ', '#ffffff', '#0f766e'],
      ['MERAK ET • KEŞFET • ÖĞREN', C.amber, null],
      ['Küçük bir merak, büyük bir keşif.', '#dff1f2', null],
    ];
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (let k = 0, x = 0; x < W; k++, x += 600) {
      const [s, col, bg] = items[k % 3];
      if (bg) {
        g.fillStyle = bg;
        g.fillRect(x + 6, 4, 588, H - 8);
      }
      g.font = '900 28px Nunito, sans-serif';
      g.fillStyle = col;
      g.shadowColor = col;
      g.shadowBlur = 8;
      g.fillText(s, x + 300, H / 2 + 1);
      g.shadowBlur = 0;
    }
    BOARD = { W, H, d: g.getImageData(0, 0, W, H).data };
    return BOARD;
  }

  const SHIRTS = [[196, 44, 44], [32, 44, 92], [228, 230, 232], [26, 26, 30], [58, 92, 160], [206, 166, 44], [58, 116, 70], [124, 40, 60], [92, 92, 98], [214, 116, 40], [180, 186, 196]];
  const SKINS = [[226, 180, 142], [196, 138, 96], [140, 92, 62], [238, 198, 166]];
  const HAIRS = [[28, 22, 18], [58, 40, 28], [14, 14, 16], [96, 70, 44]];

  // Stadyum geometrisi
  const ZB = D + 4.5; // reklam panoları
  const ZS = D + 7.5; // tribünün ön duvarı
  const H0 = 1.8; // ön duvar yüksekliği
  const TA = Math.tan(32 * DEG); // tribün eğimi
  const COSA = Math.cos(32 * DEG);
  const YR = 26; // çatı alt yüzü
  const ZR = ZS + 4; // çatının ön kenarı (projektörler)

  // ---------------------------------------------------------------------------
  // Dünya (piksel piksel ışın izleme): çim, panolar, tribün ve seyirci, çatı, gökyüzü, projektörler
  // ---------------------------------------------------------------------------
  const WORLD = {};
  function renderWorld(cam, scale = 1) {
    const key = cam.key + '@' + scale;
    if (WORLD[key]) return WORLD[key];
    grass();
    const bd = board();
    const w = Math.round(SW * scale);
    const h = Math.round(SH * scale);
    const cv = canvas(w, h);
    const g = cv.getContext('2d');
    const img = g.createImageData(w, h);
    const out = img.data;
    const fl = cam.fl * scale;
    const cx = w / 2;
    const cy = h / 2;
    const [ox, oy, oz] = cam.pos;
    const R = cam.right;
    const U = cam.up;
    const F = cam.fwd;
    const col = [0, 0, 0];
    for (let j = 0; j < h; j++) {
      const vy = -(j + 0.5 - cy) / fl;
      for (let i = 0; i < w; i++) {
        const vx = (i + 0.5 - cx) / fl;
        const dx = F[0] + vx * R[0] + vy * U[0];
        const dy = F[1] + vx * R[1] + vy * U[1];
        const dz = F[2] + vx * R[2] + vy * U[2];
        const dl = Math.hypot(dx, dy, dz);
        const pix = dl / fl; // 1 m uzaklıkta bir pikselin boyu
        let r;
        let gg;
        let b;
        let dist;
        const tg = dy < 0 ? -oy / dy : Infinity;
        const zg = oz + tg * dz;
        const tb = dz > 0 ? (ZB - oz) / dz : Infinity;
        const yb = oy + tb * dy;
        if (tg < Infinity && zg < ZB) {
          // çim
          const X = ox + tg * dx;
          const sinG = -dy / dl;
          const fp = (tg * pix) / Math.sqrt(Math.max(0.02, sinG));
          groundColor(X, zg, fp, col);
          [r, gg, b] = col;
          dist = tg * dl;
        } else if (tb < Infinity && yb >= 0 && yb <= 0.9) {
          // reklam panosu (kendi ışığı var)
          const X = ox + tb * dx;
          const u = clamp((X + 60) / 120) * (bd.W - 1);
          const v = clamp((0.9 - yb) / 0.9) * (bd.H - 1);
          const k = ((v | 0) * bd.W + (u | 0)) * 4;
          r = bd.d[k] * 1.25;
          gg = bd.d[k + 1] * 1.25;
          b = bd.d[k + 2] * 1.25;
          dist = tb * dl;
        } else if (tg < Infinity && zg < ZS) {
          // pano arkası beton
          r = 26;
          gg = 30;
          b = 38;
          dist = tg * dl;
        } else {
          const ts = (H0 + (oz - ZS) * TA - oy) / (dy - dz * TA);
          const zs = oz + ts * dz;
          const ys = oy + ts * dy;
          const tw = dz > 0 ? (ZS - oz) / dz : Infinity;
          const yw = oy + tw * dy;
          if (tw < Infinity && yw >= 0 && yw <= H0) {
            r = 22;
            gg = 27;
            b = 36;
            dist = tw * dl;
          } else if (ts > 0 && zs >= ZS && ys <= YR) {
            // seyirci: eğik düzlemde sıra (0,85 m) ve koltuk (0,55 m) hücreleri
            const Xs = ox + ts * dx;
            const sl = (zs - ZS) / COSA;
            const rf = sl / 0.85;
            const row = Math.floor(rf);
            const v = rf - row;
            const cf = Xs / 0.55 + (row & 1) * 0.5 + 1000;
            const seat = Math.floor(cf);
            const u = cf - seat;
            const px = Math.max(0.04, (ts * pix) / 0.55);
            r = 34;
            gg = 38;
            b = 46;
            if (seat % 17 === 0) {
              const st = smooth(0.4, 0.5, Math.abs(v - 0.5)) * 0.4;
              r = 66 - 30 * st;
              gg = 68 - 30 * st;
              b = 74 - 30 * st;
            } else if (hash(seat, row) < 0.07) {
              const sc = smooth(0.2, 0.2 + px, v) * (1 - smooth(0.8 - px, 0.8, v));
              r = lerp(r, 92, sc);
              gg = lerp(gg, 28, sc);
              b = lerp(b, 34, sc);
            } else {
              const shirt = SHIRTS[(hash(seat, row + 500) * SHIRTS.length) | 0];
              const skin = SKINS[(hash(seat, row + 700) * SKINS.length) | 0];
              const hair = HAIRS[(hash(seat, row + 800) * HAIRS.length) | 0];
              const jit = (hash(seat, row + 900) - 0.5) * 0.22;
              const bx = Math.abs(u - 0.5 - jit * 0.5);
              const cb = (1 - smooth(0.34, 0.34 + px, bx)) * smooth(0.12, 0.12 + px, v) * (1 - smooth(0.72, 0.72 + px, v));
              const lum = (shirt[0] + shirt[1] + shirt[2]) / 3;
              const lb = 0.75 + 0.35 * hash(seat, row + 600);
              r = lerp(r, lerp(shirt[0], lum, 0.3) * lb, cb);
              gg = lerp(gg, lerp(shirt[1], lum, 0.3) * lb, cb);
              b = lerp(b, lerp(shirt[2], lum, 0.3) * lb, cb);
              const hd = Math.hypot(u - 0.5 - jit, (v - 0.86) * 1.3);
              const ch = 1 - smooth(0.17, 0.17 + px, hd);
              const top = smooth(0.84, 0.95, v);
              r = lerp(r, lerp(skin[0], hair[0], top), ch);
              gg = lerp(gg, lerp(skin[1], hair[1], top), ch);
              b = lerp(b, lerp(skin[2], hair[2], top), ch);
            }
            const lit = (0.3 + 0.24 * (1 - clamp(row / 34))) * (1 - 0.5 * smooth(16, 26, ys));
            r *= lit;
            gg *= lit;
            b *= lit;
            dist = ts * dl;
          } else {
            const tr = dy > 0 ? (YR - oy) / dy : Infinity;
            const zr = oz + tr * dz;
            const tf = dz > 0 ? (ZR - oz) / dz : Infinity;
            const yf = oy + tf * dy;
            if (tf < Infinity && yf >= YR && yf <= YR + 1.6) {
              r = 30;
              gg = 34;
              b = 44;
            } else if (tr < Infinity && zr >= ZR) {
              r = 13;
              gg = 16;
              b = 24;
            } else {
              const e = clamp(dy / dl);
              r = lerp(14, 4, e * 2);
              gg = lerp(22, 8, e * 2);
              b = lerp(44, 20, e * 2);
            }
            dist = 200;
          }
        }
        // uzaklık pusu
        const hz = clamp((dist - 35) / 140) * 0.28;
        r = lerp(r, 30, hz);
        gg = lerp(gg, 40, hz);
        b = lerp(b, 58, hz);
        const o = (j * w + i) * 4;
        out[o] = r;
        out[o + 1] = gg;
        out[o + 2] = b;
        out[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    // projektörler: çatının ön kenarında sıra sıra ışık, ışık pusu
    g.globalCompositeOperation = 'lighter';
    const lights = [];
    for (let i = -40; i <= 40; i++) {
      if ((i + 100) % 7 === 0) continue;
      const P = cam.proj([i * 1.5, YR - 0.5, ZR + 0.3]);
      if (P) lights.push(P);
    }
    for (const P of lights) {
      const x = P[0] * scale;
      const y = P[1] * scale;
      const core = Math.max(1.6, 0.3 * P[3] * scale);
      glow(g, x, y, core * 14, [150, 175, 235], 0.07);
      glow(g, x, y, core * 3, [230, 238, 255], 0.5);
      g.fillStyle = 'rgba(255,255,255,0.95)';
      g.beginPath();
      g.arc(x, y, core * 0.9, 0, Math.PI * 2);
      g.fill();
    }
    if (lights.length) {
      const ly = (lights[0][1] + lights[lights.length - 1][1]) / 2 * scale;
      const hz = g.createLinearGradient(0, ly - 260 * scale, 0, ly + 420 * scale);
      hz.addColorStop(0, 'rgba(120,150,220,0)');
      hz.addColorStop(0.4, 'rgba(120,150,220,0.10)');
      hz.addColorStop(1, 'rgba(120,150,220,0)');
      g.fillStyle = hz;
      g.fillRect(0, ly - 260 * scale, w, 680 * scale);
    }
    g.globalCompositeOperation = 'source-over';
    WORLD[key] = cv;
    return cv;
  }

  // ---------------------------------------------------------------------------
  // Top: kesik ikosahedron (12 siyah beşgen, 20 beyaz altıgen), piksel piksel gölgelenir
  // ---------------------------------------------------------------------------
  const BALL = (() => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const ico = [[0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi], [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0], [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1]];
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const faces = [];
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) for (let k = j + 1; k < 12; k++) {
      if (Math.abs(dist(ico[i], ico[j]) - 2) < 1e-6 && Math.abs(dist(ico[j], ico[k]) - 2) < 1e-6 && Math.abs(dist(ico[i], ico[k]) - 2) < 1e-6) faces.push([i, j, k]);
    }
    // kesik ikosahedronun köşeleri: ikosahedron kenarlarının 1/3 ve 2/3 noktaları
    const verts = [];
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
      if (Math.abs(dist(ico[i], ico[j]) - 2) > 1e-6) continue;
      verts.push(mix3(ico[i], ico[j], 1 / 3), mix3(ico[i], ico[j], 2 / 3));
    }
    const pent = ico.map(norm);
    const hex = faces.map(([i, j, k]) => norm(add(add(ico[i], ico[j]), ico[k])));
    const d5 = Math.max(...verts.map((v) => dot3(v, pent[0])));
    const d6 = Math.max(...verts.map((v) => dot3(v, hex[0])));
    const c = [];
    pent.forEach((p) => c.push([p[0] / d5, p[1] / d5, p[2] / d5, 1]));
    hex.forEach((p) => c.push([p[0] / d6, p[1] / d6, p[2] / d6, 0]));
    return c;
  })();
  const BALL_LIGHTS = [
    { d: norm([-0.45, 0.75, 0.5]), c: 1.0 },
    { d: norm([0.6, 0.55, 0.3]), c: 0.45 },
    { d: norm([0.1, 0.9, -0.2]), c: 0.35 },
  ];
  const BALL_CV = {};

  // m: görünüm uzayındaki normali (x sağ, y yukarı, z bize doğru) topun kendi eksenine çeviren matris
  function ballSprite(rPx, m, { lights = BALL_LIGHTS, ground = [70, 150, 70] } = {}) {
    const n = Math.ceil(rPx * 2 + 4);
    const key = n;
    if (!BALL_CV[key]) {
      const cv = canvas(n, n);
      BALL_CV[key] = { cv, g: cv.getContext('2d'), img: cv.getContext('2d').createImageData(n, n) };
    }
    const { cv, g, img } = BALL_CV[key];
    const out = img.data;
    const c0 = n / 2;
    const seamW = 0.0085;
    const aa = 0.75 / rPx;
    const halves = lights.map((L) => norm(add(L.d, [0, 0, 1])));
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const o = (j * n + i) * 4;
        const x = (i + 0.5 - c0) / rPx;
        const y = -(j + 0.5 - c0) / rPx;
        const r2 = x * x + y * y;
        const edge = clamp((1 - Math.sqrt(r2)) * rPx + 0.5);
        if (edge <= 0) {
          out[o + 3] = 0;
          continue;
        }
        const z = Math.sqrt(Math.max(0, 1 - r2));
        const lx = m[0][0] * x + m[0][1] * y + m[0][2] * z;
        const ly = m[1][0] * x + m[1][1] * y + m[1][2] * z;
        const lz = m[2][0] * x + m[2][1] * y + m[2][2] * z;
        let s1 = -9;
        let s2 = -9;
        let pent = 0;
        let fi = 0;
        for (let k = 0; k < 32; k++) {
          const f = BALL[k];
          const s = f[0] * lx + f[1] * ly + f[2] * lz;
          if (s > s1) {
            s2 = s1;
            s1 = s;
            pent = f[3];
            fi = k;
          } else if (s > s2) s2 = s;
        }
        const e = s1 - s2;
        const seam = clamp((seamW - e) / (aa * (1 + 3 * (1 - z))) + 0.5);
        const ao = 1 - 0.28 * Math.exp(-e / 0.035);
        const base = pent ? 0.07 : 0.9 + 0.04 * hash(fi, 5);
        let alb = lerp(base * ao, 0.32, seam);
        let diff = 0.2;
        let spec = 0;
        for (let k = 0; k < lights.length; k++) {
          const L = lights[k];
          diff += Math.max(0, x * L.d[0] + y * L.d[1] + z * L.d[2]) * L.c;
          const hh = halves[k];
          const nh = Math.max(0, x * hh[0] + y * hh[1] + z * hh[2]);
          spec += Math.pow(nh, pent ? 70 : 40) * L.c * (pent ? 0.55 : 0.35);
        }
        const bounce = Math.max(0, -y) * 0.22;
        const rim = Math.pow(1 - z, 3) * 0.18;
        const v = alb * diff;
        out[o] = Math.min(255, (v + alb * bounce * (ground[0] / 255) + spec + rim * 0.7) * 255);
        out[o + 1] = Math.min(255, (v + alb * bounce * (ground[1] / 255) + spec + rim * 0.8) * 255);
        out[o + 2] = Math.min(255, (v + alb * bounce * (ground[2] / 255) + spec + rim) * 255);
        out[o + 3] = edge * 255;
        alb = 0;
      }
    }
    g.putImageData(img, 0, 0);
    return cv;
  }

  // Topu ekrana çizer; vel: kare başına ekran hızı (hareket bulanıklığı için)
  function drawBall(ctx, x, y, rPx, m, { a = 1, vel = [0, 0], lights, ground } = {}) {
    if (a <= 0.002) return;
    if (rPx < 2.5) {
      ctx.fillStyle = `rgba(235,238,240,${a})`;
      dot(ctx, x, y, Math.max(1.2, rPx));
      return;
    }
    const sp = ballSprite(rPx, m, { lights, ground });
    const len = Math.hypot(vel[0], vel[1]);
    const N = clamp(Math.ceil(len / (rPx * 0.35)), 1, 9);
    ctx.save();
    for (let k = 0; k < N; k++) {
      const u = N === 1 ? 0 : k / (N - 1) - 0.5;
      ctx.globalAlpha = a * (N === 1 ? 1 : Math.min(1, 1.9 / N));
      ctx.drawImage(sp, x - sp.width / 2 - vel[0] * u, y - sp.height / 2 - vel[1] * u);
    }
    ctx.restore();
  }

  // Görünüm uzayından dünya uzayına (kamera eksenleri) ve oradan topun dönüş eksenine
  function viewToBall(cam, axis, th) {
    const Rc = [
      [cam.right[0], cam.up[0], -cam.fwd[0]],
      [cam.right[1], cam.up[1], -cam.fwd[1]],
      [cam.right[2], cam.up[2], -cam.fwd[2]],
    ];
    return mulM(transp(rotM(axis, th)), Rc);
  }

  // ---------------------------------------------------------------------------
  // Oyuncular: önden görünüş, metre biriminde çizilip sprite olarak saklanır
  // ---------------------------------------------------------------------------
  const KITS = {
    wall: { shirt: '#0f766e', trim: '#0a4e49', shorts: '#0d1a33', sock: '#0f766e' },
    gk: { shirt: LIME, trim: '#7da11a', shorts: '#16181c', sock: '#16181c' },
  };
  const FIG = {};
  function figSprite(st, ppm) {
    const key = `${st.id}:${st.pose}:${Math.round(ppm * 4)}`;
    if (FIG[key]) return FIG[key];
    const kit = KITS[st.kit];
    const cv = canvas(ppm * 1.4, ppm * 2.25);
    const g = cv.getContext('2d');
    const ox = cv.width / 2;
    const oy = cv.height - ppm * 0.04;
    g.translate(ox, oy);
    g.scale(ppm, -ppm);
    const limb = (x1, y1, x2, y2, w, c) => {
      g.strokeStyle = c;
      g.lineWidth = w;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke();
    };
    const poly = (pts, c) => {
      g.fillStyle = c;
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.fill();
    };
    const ell = (x, y, rx, ry, c) => {
      g.fillStyle = c;
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      g.fill();
    };
    const skin = st.skin;
    const wide = st.pose === 'wall' ? 0.11 : 0.15;
    // bacaklar
    for (const sx of [-1, 1]) {
      ell(sx * wide, 0.045, 0.08, 0.045, '#0c0c0e');
      limb(sx * wide, 0.07, sx * (wide + 0.005), 0.46, 0.105, kit.sock);
      limb(sx * (wide + 0.005), 0.45, sx * (wide * 0.6 + 0.06), 0.66, 0.135, skin);
    }
    poly([[-0.245, 0.6], [-0.02, 0.63], [0.02, 0.63], [0.245, 0.6], [0.212, 0.95], [-0.212, 0.95]], kit.shorts);
    // gövde ve boyun
    poly([[-0.2, 0.92], [0.2, 0.92], [0.235, 1.25], [0.258, 1.42], [0.2, 1.49], [-0.2, 1.49], [-0.258, 1.42], [-0.235, 1.25]], kit.shirt);
    limb(0, 1.46, 0, 1.57, 0.11, skin);
    g.strokeStyle = kit.trim;
    g.lineWidth = 0.025;
    g.beginPath();
    g.moveTo(-0.07, 1.49);
    g.lineTo(0, 1.42);
    g.lineTo(0.07, 1.49);
    g.stroke();
    // baş
    ell(-0.098, 1.665, 0.022, 0.03, skin);
    ell(0.098, 1.665, 0.022, 0.03, skin);
    ell(0, 1.665, 0.098, 0.118, skin);
    g.save();
    g.beginPath();
    g.ellipse(0, 1.668, 0.1, 0.12, 0, 0, Math.PI * 2);
    g.clip();
    g.fillStyle = st.hair;
    g.fillRect(-0.12, 1.71, 0.24, 0.12);
    g.restore();
    ell(-0.035, 1.66, 0.012, 0.008, 'rgba(20,14,10,0.7)');
    ell(0.035, 1.66, 0.012, 0.008, 'rgba(20,14,10,0.7)');
    // kollar
    for (const sx of [-1, 1]) {
      if (st.pose === 'wall') {
        limb(sx * 0.235, 1.4, sx * 0.226, 1.25, 0.11, kit.shirt);
        limb(sx * 0.226, 1.25, sx * 0.215, 1.12, 0.085, skin);
        limb(sx * 0.215, 1.12, sx * 0.06, 0.86, 0.08, skin);
        ell(sx * 0.05, 0.84, 0.05, 0.056, skin);
      } else if (st.pose === 'gk') {
        limb(sx * 0.235, 1.4, sx * 0.37, 1.2, 0.1, kit.shirt);
        limb(sx * 0.37, 1.2, sx * 0.44, 1.36, 0.09, kit.shirt);
        ell(sx * 0.45, 1.41, 0.062, 0.07, '#f2f4f6');
      } else {
        limb(sx * 0.21, 1.42, sx * 0.23, 1.72, 0.1, kit.shirt);
        limb(sx * 0.23, 1.72, sx * 0.19, 1.98, 0.09, kit.shirt);
        ell(sx * 0.18, 2.04, 0.062, 0.07, '#f2f4f6');
      }
    }
    // ışık: sol üstten projektör, sağ kenar gölgede; ayaklar koyu
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    const gh = g.createLinearGradient(ox - ppm * 0.3, 0, ox + ppm * 0.3, 0);
    gh.addColorStop(0, 'rgba(255,255,255,0.16)');
    gh.addColorStop(0.5, 'rgba(0,0,0,0)');
    gh.addColorStop(1, 'rgba(0,0,0,0.4)');
    g.fillStyle = gh;
    g.fillRect(0, 0, cv.width, cv.height);
    const gv = g.createLinearGradient(0, oy - ppm * 1.6, 0, oy);
    gv.addColorStop(0, 'rgba(255,255,255,0.06)');
    gv.addColorStop(1, 'rgba(0,0,0,0.32)');
    g.fillStyle = gv;
    g.fillRect(0, 0, cv.width, cv.height);
    FIG[key] = { cv, ox, oy };
    return FIG[key];
  }

  const LIGHTS = [[-55, 32, D + 30], [55, 32, D + 30], [-55, 32, D - 70], [55, 32, D - 70]];

  // Yere düşen dört projektör gölgesi (stadyumlarda her oyuncunun dört soluk gölgesi olur)
  function shadows(ctx, cam, x, z, hgt, wid, alpha) {
    for (const L of LIGHTS) {
      const dx = x - L[0];
      const dz = z - L[2];
      const dl = Math.hypot(dx, dz);
      const len = (hgt * dl) / (L[1] - hgt);
      const ux = dx / dl;
      const uz = dz / dl;
      const q = [
        [x - uz * wid * 0.5, z + ux * wid * 0.5],
        [x + ux * len - uz * wid * 0.25, z + uz * len + ux * wid * 0.25],
        [x + ux * len + uz * wid * 0.25, z + uz * len - ux * wid * 0.25],
        [x + uz * wid * 0.5, z - ux * wid * 0.5],
      ].map(([a, b]) => cam.proj([a, 0, b]));
      if (q.some((p) => !p)) continue;
      const gr = ctx.createLinearGradient(q[0][0], q[0][1], (q[1][0] + q[2][0]) / 2, (q[1][1] + q[2][1]) / 2);
      gr.addColorStop(0, `rgba(0,8,0,${alpha})`);
      gr.addColorStop(1, 'rgba(0,8,0,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      q.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawFig(ctx, cam, st, x, z, { lift = 0, rot = 0, pose } = {}) {
    const P = cam.proj([x, lift, z]);
    if (!P) return;
    const s = { ...st, pose: pose ?? st.pose };
    const sp = figSprite(s, (P[3] * st.h) / 1.85);
    ctx.save();
    ctx.translate(P[0], P[1]);
    ctx.rotate(rot);
    ctx.drawImage(sp.cv, -sp.ox, -sp.oy);
    ctx.restore();
  }

  const WALL = [
    { id: 'w1', kit: 'wall', pose: 'wall', h: 1.84, skin: '#e0b090', hair: '#1c1410', x: 2.55 },
    { id: 'w2', kit: 'wall', pose: 'wall', h: 1.9, skin: '#8d5a3b', hair: '#0e0e0e', x: 3.1 },
    { id: 'w3', kit: 'wall', pose: 'wall', h: 1.81, skin: '#c68a5e', hair: '#3b2a20', x: 3.65 },
    { id: 'w4', kit: 'wall', pose: 'wall', h: 1.88, skin: '#efc6a4', hair: '#5a3e26', x: 4.2 },
  ];
  const WALL_Z = 9.15;
  const KEEPER = { id: 'gk', kit: 'gk', pose: 'gk', h: 1.9, skin: '#d9a77c', hair: '#141414' };

  // Kale direkleri: gölgeli silindir
  function drawPosts(ctx, cam) {
    const bar = (a, b) => {
      const p = cam.proj(a);
      const q = cam.proj(b);
      if (!p || !q) return;
      const w = (0.12 * (p[3] + q[3])) / 2;
      const nx = -(q[1] - p[1]);
      const ny = q[0] - p[0];
      const L = Math.hypot(nx, ny) || 1;
      const ux = ((nx / L) * w) / 2;
      const uy = ((ny / L) * w) / 2;
      const gr = ctx.createLinearGradient(p[0] - ux, p[1] - uy, p[0] + ux, p[1] + uy);
      gr.addColorStop(0, '#8b929a');
      gr.addColorStop(0.42, '#ffffff');
      gr.addColorStop(0.75, '#d6dbe1');
      gr.addColorStop(1, '#727880');
      ctx.strokeStyle = gr;
      ctx.lineWidth = w;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(q[0], q[1]);
      ctx.stroke();
    };
    bar([-GW, 0, D], [-GW, GH, D]);
    bar([GW, 0, D], [GW, GH, D]);
    bar([-GW, GH, D], [GW, GH, D]);
  }

  // Ağ: üst, arka ve yan ağlar; top çarptığı yerde şişer
  function drawNet(ctx, cam, bulge) {
    const P = (x, y, z) => {
      if (bulge && bulge.a > 0.001) {
        const k = bulge.a * Math.exp(-((x - bulge.x) ** 2 + (y - bulge.y) ** 2) / 0.45);
        z += k;
        x += (x - bulge.x) * k * 0.2;
      }
      return cam.proj([x, y, z]);
    };
    const prof = (w) => (w < 0.29 ? [GH - 0.19 * (w / 0.29), D + w / 0.29] : [2.25 * (1 - (w - 0.29) / 0.71), D + 1 + (w - 0.29) / 0.71]);
    const path = (pts) => {
      let first = true;
      for (const q of pts) {
        if (!q) continue;
        if (first) ctx.moveTo(q[0], q[1]);
        else ctx.lineTo(q[0], q[1]);
        first = false;
      }
    };
    ctx.save();
    ctx.strokeStyle = 'rgba(232,238,245,0.28)';
    ctx.lineWidth = 1.1;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 61; i++) {
      const x = -GW + (i / 61) * 2 * GW;
      const pts = [];
      for (let k = 0; k <= 18; k++) {
        const [y, z] = prof(k / 18);
        pts.push(P(x, y, z));
      }
      path(pts);
    }
    for (let k = 1; k <= 29; k++) {
      const [y, z] = prof(k / 29);
      const pts = [];
      for (let i = 0; i <= 24; i++) pts.push(P(-GW + (i / 24) * 2 * GW, y, z));
      path(pts);
    }
    for (const sx of [-GW, GW]) {
      for (let z = D + 0.12; z < D + 2; z += 0.12) {
        const top = z <= D + 1 ? GH - 0.19 * (z - D) : 2.25 * (1 - (z - D - 1));
        path([P(sx, 0, z), P(sx, top, z)]);
      }
      for (let y = 0.12; y < GH; y += 0.12) path([P(sx, y, D), P(sx, y, netZ(y))]);
    }
    ctx.stroke();
    // ağın arka alt borusu
    ctx.strokeStyle = 'rgba(200,206,214,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    path([P(-GW, 0, D + 2), P(GW, 0, D + 2)]);
    ctx.stroke();
    ctx.restore();
  }

  // Hakemin sprey köpüğü: barajın önündeki çizgi ve topun çevresindeki yay
  function spray(ctx, cam) {
    ctx.save();
    ctx.fillStyle = 'rgba(246,248,250,0.85)';
    const blob = (x, z, r) => {
      const P = cam.proj([x, 0.004, z]);
      if (!P) return;
      ctx.beginPath();
      ctx.ellipse(P[0], P[1], r * P[3], r * P[3] * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    for (let i = 0; i < 70; i++) blob(2.15 + i * 0.038, WALL_Z - 0.4 + (hash(i, 31) - 0.5) * 0.05, 0.026 + hash(i, 32) * 0.018);
    for (let i = 0; i < 28; i++) {
      const a = Math.PI * (0.1 + (0.8 * i) / 27);
      blob(SHOT.p0[0] + Math.cos(a) * 0.24, Math.sin(a) * 0.24, 0.018 + hash(i, 33) * 0.01);
    }
    ctx.restore();
  }

  // Topun dibindeki çim yaprakları (önde kalanlar topun üstüne çizilir)
  function blades(ctx, cam, cx, cz, t, front, { n = 150, rad = 0.28, hgt = 0.035 } = {}) {
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const a = hash(i, 41) * Math.PI * 2;
      const rr2 = 0.06 + Math.sqrt(hash(i, 42)) * rad;
      const x = cx + Math.cos(a) * rr2;
      const z = cz + Math.sin(a) * rr2;
      if (front !== z < cz) continue;
      const hh = hgt * (0.6 + hash(i, 43) * 0.8);
      const sway = Math.sin(t * 2.2 + i) * 0.003;
      const lean = (hash(i, 44) - 0.5) * 0.02 + sway;
      const p = cam.proj([x, 0, z]);
      const q = cam.proj([x + lean, hh, z + (hash(i, 45) - 0.5) * 0.01]);
      if (!p || !q) continue;
      const l = 0.6 + hash(i, 46) * 0.7;
      ctx.strokeStyle = `rgb(${(46 * l) | 0},${(116 * l) | 0},${(40 * l) | 0})`;
      ctx.lineWidth = Math.max(1, 0.0035 * p[3]);
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.quadraticCurveTo(p[0], (p[1] + q[1]) / 2, q[0], q[1]);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Tribünde telefon flaşları (gol anında çoğalır)
  const FLASH = Array.from({ length: 220 }, (_, i) => {
    const sl = 1 + hash(i, 61) * 26;
    return { p: [(hash(i, 62) - 0.5) * 90, H0 + sl * Math.sin(32 * DEG) + 1, ZS + sl * COSA], ph: hash(i, 63), rate: 0.7 + hash(i, 64) * 1.6 };
  });
  function flashes(ctx, cam, t, burst) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < FLASH.length; i++) {
      const f = FLASH[i];
      const dens = 0.012 + 0.35 * burst;
      const q = t * f.rate + f.ph;
      const cyc = Math.floor(q);
      if (hash(cyc, i + 77) > dens) continue;
      const u = q - cyc;
      if (u > 0.12) continue;
      const P = cam.proj(f.p);
      if (!P) continue;
      const a = 1 - u / 0.12;
      glow(ctx, P[0], P[1], 16, [235, 240, 255], 0.55 * a);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      dot(ctx, P[0], P[1], 1.8);
    }
    ctx.restore();
  }

  // Yerdeki top gölgeleri
  function ballShadow(ctx, cam, p, a = 1) {
    for (const L of LIGHTS) {
      const k = L[1] / (L[1] - p[1]);
      const sx = L[0] + (p[0] - L[0]) * k;
      const sz = L[2] + (p[2] - L[2]) * k;
      const P = cam.proj([sx, 0.003, sz]);
      if (!P) continue;
      const rr2 = BALL_R * k * 1.1 * P[3];
      const al = (0.2 * a) / (1 + p[1] * 0.8);
      ctx.fillStyle = `rgba(0,10,0,${al})`;
      ctx.beginPath();
      ctx.ellipse(P[0], P[1], rr2, rr2 * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Stadyumu ve sahadakileri bir kamerayla çizer
  function stadium(ctx, cam, t, o = {}) {
    ctx.drawImage(renderWorld(cam, o.scale ?? 1), 0, 0, SW, SH);
    flashes(ctx, cam, t, o.burst ?? 0);
    if (o.spray !== false) spray(ctx, cam);
    for (const pl of WALL) shadows(ctx, cam, pl.x, WALL_Z, pl.h, 0.45, 0.13);
    shadows(ctx, cam, o.gkX ?? 0.4, D - 0.7, 1.9, 0.45, 0.1);
    if (o.ball) ballShadow(ctx, cam, o.ball.p);
    const items = [
      { z: D + 1, f: () => drawNet(ctx, cam, o.bulge) },
      { z: D - 0.7, f: () => drawFig(ctx, cam, KEEPER, o.gkX ?? 0.4, D - 0.7, { lift: o.gkLift ?? 0, rot: o.gkRot ?? 0, pose: o.gkPose }) },
      { z: D - 0.01, f: () => drawPosts(ctx, cam) },
      ...WALL.map((pl, i) => ({ z: WALL_Z + i * 0.001, f: () => drawFig(ctx, cam, pl, pl.x, WALL_Z, { lift: o.jump?.[i] ?? 0 }) })),
    ];
    if (o.ball) items.push({ z: o.ball.p[2], f: o.ball.draw });
    items.sort((a, b) => b.z - a.z).forEach((it) => it.f());
  }

  // ---------------------------------------------------------------------------
  // 1 · Kanca: vurucunun gözünden frikik; top 4 metre kıvrılıp ağlara gider
  // ---------------------------------------------------------------------------
  const draw = {};
  const CAM_HOOK = camera([4.9, 1.55, -3.4], [1.6, -1.5, D], 55);
  const KICK = 0.22; // sahne başından vuruşa (sn)
  const SLOW = 0.62; // ağır çekim
  const hookT = (u) => Math.max(0, (u - KICK) * SLOW);

  // Vuruş: sağ alttan topa savrulan bacağın hareket bulanıklığı (gerçek kamerada da bacak böyle görünür)
  function boot(ctx, u, bp) {
    const t0 = KICK - 0.09;
    const t1 = KICK + 0.07;
    if (u < t0 || u > t1) return;
    const p = (u - t0) / (t1 - t0);
    const head = (q) => [lerp(1250, bp[0] - 60, ease.out(q)), lerp(2150, bp[1] - 10, ease.out(q))];
    const [hx, hy] = head(p);
    const [tx, ty] = head(Math.max(0, p - 0.45));
    const a = Math.sin(Math.PI * p);
    ctx.save();
    ctx.filter = 'blur(14px)';
    ctx.globalAlpha = 0.55 * a;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0c1424';
    ctx.lineWidth = 120;
    ctx.beginPath();
    ctx.moveTo(tx + 260, ty + 380);
    ctx.quadraticCurveTo((tx + hx) / 2 + 60, (ty + hy) / 2 + 40, hx + 40, hy + 10);
    ctx.stroke();
    ctx.fillStyle = '#05070b';
    ctx.globalAlpha = 0.7 * a;
    ctx.beginPath();
    ctx.ellipse(hx, hy, 80, 34, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Vuruşta sıçrayan çim parçaları
  function divots(ctx, bp, u) {
    const p = (u - KICK) / 0.7;
    if (p <= 0 || p >= 1) return;
    ctx.save();
    for (let i = 0; i < 26; i++) {
      const a = -Math.PI * (0.15 + hash(i, 51) * 0.7);
      const sp = 300 + hash(i, 52) * 500;
      const x = bp[0] + Math.cos(a) * sp * p;
      const y = bp[1] + 20 + Math.sin(a) * sp * p + 900 * p * p;
      ctx.fillStyle = `rgba(${60 + hash(i, 53) * 40},${110 + hash(i, 54) * 50},50,${1 - p})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 4 + hash(i, 55) * 5, 2 + hash(i, 56) * 2, a, 0, Math.PI * 2);
      ctx.fill();
    }
    glow(ctx, bp[0], bp[1] + 10, 120 * (0.4 + p), [230, 235, 225], 0.18 * (1 - p));
    ctx.restore();
  }

  // Projeksiyonlu iz çizgisi (yayın grafiği gibi parlak)
  function tracer(ctx, cam, path, t1, { t0 = 0, color = AMBER, w = 7, a = 1 } = {}) {
    const pts = [];
    for (const s of path) {
      if (s.t < t0) continue;
      if (s.t > t1) break;
      const P = cam.proj(s.p);
      if (P) pts.push(P);
    }
    const end = at(path, t1);
    const Pe = cam.proj(end.p);
    if (Pe) pts.push(Pe);
    if (pts.length < 2) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const [lw, al, c] of [[w * 3.2, 0.16, color], [w * 1.6, 0.4, color], [w * 0.55, 0.95, [255, 248, 235]]]) {
      ctx.strokeStyle = rgb(c, al * a);
      ctx.lineWidth = lw;
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.stroke();
    }
    ctx.restore();
  }

  function hookWorld(ctx, t, u, cam) {
    const tt = hookT(u);
    const st = hookBall(tt);
    const P = cam.proj(st.p);
    const P2 = cam.proj(hookBall(Math.max(0, tt - SLOW / 30)).p);
    const th = tt * SHOT.rps * 2 * Math.PI * 0.9;
    const goalU = KICK + HOOK.line.t / SLOW;
    const hitU = KICK + HOOK.hit.t / SLOW;
    const ub = u - hitU;
    const bulge = ub > 0 ? { x: HOOK.hit.p[0], y: HOOK.hit.p[1], a: 0.55 * Math.sin(Math.min(Math.PI / 2, ub * 14)) * Math.exp(-Math.max(0, ub - 0.12) * 2.6) } : null;
    const jt = u - KICK - 0.08;
    const jump = WALL.map((_, i) => {
      const q = (jt - i * 0.03) / 0.62;
      return q > 0 && q < 1 ? 0.36 * Math.sin(Math.PI * q) : 0;
    });
    const dive = progress(u, KICK + 0.75, goalU + 0.1, ease.out);
    const ballDraw = () => {
      if (!P) return;
      if (tt <= 0) blades(ctx, cam, SHOT.p0[0], SHOT.p0[2], t, false);
      const m = viewToBall(cam, SHOT.axis, th);
      drawBall(ctx, P[0], P[1], BALL_R * P[3], m, { vel: P2 ? [(P[0] - P2[0]) * 0.8, (P[1] - P2[1]) * 0.8] : [0, 0] });
      if (tt <= 0) blades(ctx, cam, SHOT.p0[0], SHOT.p0[2], t, true);
    };
    stadium(ctx, cam, t, {
      ball: { p: st.p, draw: ballDraw },
      bulge,
      jump,
      gkX: lerp(0.4, 2.1, dive),
      gkLift: 0.5 * Math.sin(Math.PI * clamp(dive * 1.1)),
      gkRot: lerp(0, 1.1, dive),
      gkPose: dive > 0.15 ? 'dive' : 'gk',
      burst: clamp((u - goalU) / 0.2) * (1 - clamp((u - goalU - 1.8) / 1.2)),
    });
    return { P, tt, goalU };
  }

  // Tekrar kamerası: yüksekten, vurucunun arkasından (yayınlardaki tekrar açısı); kıvrılma buradan görünür
  const CAM_REPLAY = camera([7, 13, -9], [2.2, 2.3, 14], 46);
  const CUT = KICK + 0.3;

  draw['f-hook'] = function (ctx, t, api) {
    const s0 = api.S0('f-hook');
    const u = t - s0;
    const goalU = KICK + HOOK.line.t / SLOW;
    const tt = hookT(u);
    if (u < CUT) {
      // 1. çekim: vurucunun gözünden
      const cam = CAM_HOOK;
      const shake = u > KICK ? Math.exp(-(u - KICK) * 10) * 7 : 0;
      ctx.save();
      ctx.translate(Math.sin(u * 90) * shake, Math.cos(u * 77) * shake * 0.6);
      hookWorld(ctx, t, u, cam);
      if (tt > 0) tracer(ctx, cam, HOOK.path, tt, { t0: Math.max(0, tt - 0.3) });
      boot(ctx, u, cam.proj(SHOT.p0));
      divots(ctx, cam.proj(SHOT.p0), u);
      ctx.restore();
      topShade(ctx, 520, 0.7);
      darkTag(ctx);
      finish(ctx, t);
      return;
    }
    // 2. çekim: tekrar kamerası, kaleye doğru hafif yaklaşma
    const cam = CAM_REPLAY;
    const zoom = 1 + 0.06 * progress(u, CUT, goalU + 1.2, ease.inOut);
    ctx.save();
    ctx.translate(600, 700);
    ctx.scale(zoom, zoom);
    ctx.translate(-600, -700);
    hookWorld(ctx, t, u, cam);
    // topun yerdeki izi: kıvrılma çimin üstünde de görünsün
    if (tt > 0) {
      const tg = Math.min(tt, HOOK.line.t);
      ctx.save();
      ctx.setLineDash([2, 12]);
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      let first = true;
      for (const q of HOOK.path) {
        if (q.t > tg) break;
        const P = cam.proj([q.p[0], 0.01, q.p[2]]);
        if (!P) continue;
        if (first) ctx.moveTo(P[0], P[1]);
        else ctx.lineTo(P[0], P[1]);
        first = false;
      }
      ctx.stroke();
      ctx.restore();
      tracer(ctx, cam, HOOK.path, Math.min(tt, HOOK.hit.t), { t0: 0, a: 1 });
    }
    const ga = progress(u, goalU + 0.2, goalU + 0.8, ease.out);
    if (ga > 0) {
      // dönmeseydi: aynı vuruş, dönüşsüz
      const gEnd = HOOK.ghost[HOOK.ghost.length - 1].t * ga;
      const pts = HOOK.ghost.filter((q) => q.t <= gEnd).map((q) => cam.proj(q.p)).filter(Boolean);
      ctx.save();
      ctx.setLineDash([16, 14]);
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.stroke();
      ctx.restore();
      const gp = cam.proj(HOOK.gEnd.p);
      if (gp && ga > 0.9) TS(ctx, 'dönmeseydi', gp[0] - 6, gp[1] - 42, { hand: true, size: 46, weight: 700, align: 'right', alpha: (ga - 0.9) * 10 });
    }
    // 4 metre: kale çizgisi üstünde gerçek geçiş ile dönüşsüz geçiş arası
    const ma = progress(u, goalU + 0.65, goalU + 1.15, ease.out);
    if (ma > 0) {
      const A0 = cam.proj(HOOK.line.p);
      const B0 = cam.proj(HOOK.gEnd.p);
      const A = cam.proj([HOOK.line.p[0], 0, D]);
      const B = cam.proj([lerp(HOOK.line.p[0], HOOK.gEnd.p[0], ma), 0, D]);
      const Bf = cam.proj([HOOK.gEnd.p[0], 0, D]);
      ctx.save();
      ctx.strokeStyle = rgb(AMBER, 0.95);
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.setLineDash([3, 9]);
      ctx.beginPath();
      ctx.moveTo(A0[0], A0[1]);
      ctx.lineTo(A[0], A[1]);
      ctx.moveTo(B0[0], B0[1]);
      ctx.lineTo(Bf[0], Bf[1]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 7;
      ctx.shadowColor = 'rgba(245,158,11,0.8)';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(A[0], A[1] - 16);
      ctx.lineTo(A[0], A[1] + 16);
      ctx.moveTo(A[0], A[1]);
      ctx.lineTo(B[0], B[1]);
      if (ma > 0.97) {
        ctx.moveTo(B[0], B[1] - 16);
        ctx.lineTo(B[0], B[1] + 16);
      }
      ctx.stroke();
      ctx.restore();
      const lab = `≈ ${HOOK.dev.toFixed(0)} m`;
      const cx = (A[0] + Bf[0]) / 2;
      const s = ease.back(clamp(ma * 1.2));
      ctx.save();
      ctx.translate(cx, A[1] + 62);
      ctx.scale(s, s);
      ctx.fillStyle = C.amber;
      const lw = M(ctx, lab, { size: 48, weight: 900 }) + 46;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 18;
      rr(ctx, -lw / 2, -34, lw, 68, 34);
      ctx.fill();
      ctx.shadowBlur = 0;
      T(ctx, lab, 0, 2, { size: 48, weight: 900, color: '#1b1204' });
      ctx.restore();
    }
    ctx.restore();
    // kesme anında kısa parlama
    const fl = 1 - clamp((u - CUT) / 0.14);
    if (fl > 0) {
      ctx.fillStyle = `rgba(255,255,255,${0.45 * fl})`;
      ctx.fillRect(0, 0, SW, SH);
    }
    topShade(ctx, 600, 0.72);
    darkTag(ctx);
    const ha = Math.max(api.fadeIn(t, api.cue('f-hook', 1) + 0.25, 0.35), progress(u, goalU + 0.6, goalU + 0.95));
    if (ha > 0) {
      const pp = ease.back(clamp(ha * 1.4));
      TS(ctx, 'FALSOLU FRİKİK HAVADA', 540, 330, { size: 44, weight: 900, spacing: 3, alpha: ha });
      ctx.save();
      ctx.translate(540, 435);
      ctx.scale(pp, pp);
      TS(ctx, '4 METRE', 0, 0, { size: 140, weight: 900, color: C.amber, alpha: ha, spacing: 2 });
      ctx.restore();
      TS(ctx, 'yana kayabilir', 540, 530, { hand: true, size: 62, weight: 700, alpha: ha });
    }
    finish(ctx, t);
  };

  // ---------------------------------------------------------------------------
  // 2–3 · Duman tüneli: yukarıdan bakış; top yukarı gidiyor, hava aşağı akıyor.
  // Potansiyel akış (silindir + girdap): solda hava hızlanır, sağda yavaşlar; iz sağa savrulur
  // ---------------------------------------------------------------------------
  const GAM = 0.7; // Γ/(2πaU): sol yanda hız 2,7U, sağ yanda 1,3U
  function flowAt(x, y) {
    const r2 = x * x + y * y;
    if (r2 < 1) return [0, 0];
    const vd = -y; // V∞ = (0, −1)
    const u = (-2 * vd * x) / (r2 * r2) - (GAM * y) / r2;
    const v = -(1 + 1 / r2) - (2 * vd * y) / (r2 * r2) + (GAM * x) / r2;
    return [u, v];
  }
  let STREAMS = null;
  function streams() {
    if (STREAMS) return STREAMS;
    STREAMS = [];
    for (let i = 0; i < 33; i++) {
      let x = -2.72 + i * 0.17;
      let y = 5.3;
      const pts = [[x, y, 0, 1]];
      let tau = 0;
      for (let k = 0; k < 4000 && y > -5.4; k++) {
        const [u1, v1] = flowAt(x, y);
        const s1 = Math.hypot(u1, v1);
        const dtt = 0.03 / Math.max(s1, 0.06);
        const [u2, v2] = flowAt(x + (u1 * dtt) / 2, y + (v1 * dtt) / 2);
        x += u2 * dtt;
        y += v2 * dtt;
        const r = Math.hypot(x, y);
        if (r < 1.015) {
          x = (x / r) * 1.015;
          y = (y / r) * 1.015;
        }
        tau += dtt;
        pts.push([x, y, tau, Math.hypot(u2, v2)]);
      }
      STREAMS.push(pts);
    }
    return STREAMS;
  }
  // İz: topun arkasındaki hava sağa savrulur (top sola itilir), hafif dalgalanır
  function wake(x, y, t) {
    if (y >= 0) return x;
    const w = Math.exp(-(x * x) / 1.3) * smooth(0, 2.5, -y);
    return x + 0.5 * w * smooth(0, 4.5, -y) + 0.07 * Math.sin(y * 5 + t * 7 + x * 3) * w;
  }
  const speedCol = (s) => (s < 1 ? mix3(AMBER, WHITE, smooth(0.35, 1, s)) : mix3(WHITE, CYAN, smooth(1.05, 2.3, s)));

  let PRESS = null;
  function pressure() {
    if (PRESS) return PRESS;
    const w = 216;
    const h = 384;
    const cv = canvas(w, h);
    const g = cv.getContext('2d');
    const im = g.createImageData(w, h);
    const AR = 210 / 5;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const x = (i + 0.5 - w / 2) / AR;
        const y = -(j + 0.5 - (980 / 1920) * h) / AR;
        const r = Math.hypot(x, y);
        const o = (j * w + i) * 4;
        if (r < 1) continue;
        const [u, v] = flowAt(x, y);
        const cp = 1 - (u * u + v * v);
        const fall = Math.exp(-(r - 1) / 1.4);
        if (cp < 0) {
          im.data[o] = 59;
          im.data[o + 1] = 130;
          im.data[o + 2] = 246;
          im.data[o + 3] = Math.min(150, -cp * 34) * fall;
        } else {
          im.data[o] = 245;
          im.data[o + 1] = 158;
          im.data[o + 2] = 11;
          im.data[o + 3] = Math.min(150, cp * 150) * fall;
        }
      }
    }
    g.putImageData(im, 0, 0);
    PRESS = cv;
    return cv;
  }

  // Yukarıdan bakışta hızla akan çim (hareket bulanıklığı)
  function grassFly(ctx, t, dim = 0.74) {
    const { cv } = grass();
    ctx.save();
    const pat = ctx.createPattern(cv, 'repeat');
    for (let k = 0; k < 5; k++) {
      ctx.globalAlpha = k ? 0.22 : 1;
      ctx.save();
      ctx.translate(0, ((t * 900 + k * 9) % TEX) - TEX);
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, SW, SH + TEX);
      ctx.restore();
    }
    ctx.restore();
    ctx.fillStyle = `rgba(4,10,24,${dim})`;
    ctx.fillRect(0, 0, SW, SH);
  }

  function tunnel(ctx, t, o) {
    const AR = 210;
    const bx = o.bx ?? 540;
    const by = 980;
    grassFly(ctx, t);
    // topun yere düşen gölgesi (top yerden 2 m yukarıda)
    glow(ctx, bx + 70, by + 120, 330, [0, 0, 0], 0.35);
    if (o.press > 0) {
      ctx.save();
      ctx.globalAlpha = o.press;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(pressure(), bx - 540, 0, SW, SH);
      ctx.restore();
    }
    const S = streams();
    const map = (x, y) => [bx + wake(x, y, t) * AR, by - y * AR];
    // soluk akım çizgileri
    ctx.save();
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    S.forEach((pts, i) => {
      const left = pts[0][0] < -0.3;
      ctx.strokeStyle = `rgba(255,255,255,${0.12 * (o.focus && !left ? 1 - 0.6 * o.focus : 1)})`;
      ctx.beginPath();
      for (let k = 0; k < pts.length; k += 3) {
        const [sx, sy] = map(pts[k][0], pts[k][1]);
        if (k) ctx.lineTo(sx, sy);
        else ctx.moveTo(sx, sy);
      }
      ctx.stroke();
    });
    // duman parçacıkları: akım çizgisi boyunca, hızla orantılı ilerler
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    S.forEach((pts, i) => {
      const total = pts[pts.length - 1][2];
      const left = pts[0][0] < -0.3;
      const dimR = o.focus && !left ? 1 - 0.65 * o.focus : 1;
      for (let k = 0; k * 0.42 < total; k++) {
        const tau = (k * 0.42 + t * 1.45 + i * 0.13) % total;
        let lo = 0;
        let hi = pts.length - 1;
        while (hi - lo > 1) {
          const mid = (lo + hi) >> 1;
          if (pts[mid][2] <= tau) lo = mid;
          else hi = mid;
        }
        const head = pts[lo];
        if (Math.abs(head[0]) > 2.7 || Math.abs(head[1]) > 5) continue;
        const c = speedCol(head[3]);
        ctx.strokeStyle = rgb(c, 0.85 * dimR);
        ctx.lineWidth = 4;
        ctx.beginPath();
        let j = lo;
        const [hx, hy] = map(head[0], head[1]);
        ctx.moveTo(hx, hy);
        while (j > 0 && head[2] - pts[j][2] < 0.16) {
          j--;
          const [sx, sy] = map(pts[j][0], pts[j][1]);
          ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }
    });
    ctx.restore();
    // top: kendi ekseninde saat yönünün tersine döner (sol yüzü geriye gider)
    const th = t * 2.4;
    const m = rotM([0, 0, 1], -th);
    const L = [{ d: norm([-0.35, 0.45, 0.82]), c: 1.0 }, { d: norm([0.5, -0.2, 0.6]), c: 0.35 }];
    drawBall(ctx, bx, by, AR, m, { lights: L, ground: [40, 90, 50] });
    // sınır tabakası: topla birlikte dönen ince hava halkası
    if (o.ring > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 3; k++) {
        const a0 = -th * 1.0 + (k * Math.PI * 2) / 3;
        ctx.strokeStyle = rgb(CYAN, 0.55 * o.ring);
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(bx, by, AR * 1.07, a0, a0 - 1.2, true);
        ctx.stroke();
      }
      ctx.restore();
      // dönüş okları
      ctx.save();
      ctx.strokeStyle = rgb(AMBER, o.ring);
      ctx.fillStyle = rgb(AMBER, o.ring);
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      for (const a0 of [Math.PI * 0.15, Math.PI * 1.15]) {
        const a1 = a0 - 1.15;
        ctx.beginPath();
        ctx.arc(bx, by, AR * 1.28, a0, a1, true);
        ctx.stroke();
        const ex = bx + Math.cos(a1) * AR * 1.28;
        const ey = by + Math.sin(a1) * AR * 1.28;
        const tx = Math.sin(a1);
        const ty = -Math.cos(a1);
        ctx.beginPath();
        ctx.moveTo(ex + tx * 26, ey + ty * 26);
        ctx.lineTo(ex - ty * 18, ey + tx * 18);
        ctx.lineTo(ex + ty * 18, ey - tx * 18);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    return { bx, by, AR };
  }

  function arrowDown(ctx, x, y, len, a) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + len);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 16, y + len - 6);
    ctx.lineTo(x, y + len + 16);
    ctx.lineTo(x + 16, y + len - 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function label(ctx, str, x, y, fill, color, a, size = 38) {
    if (a <= 0.002) return;
    const s = ease.back(clamp(a * 1.3));
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha *= clamp(a * 2);
    const w = M(ctx, str, { size, weight: 900, spacing: 2 }) + 52;
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = fill;
    rr(ctx, -w / 2, -size * 0.95, w, size * 1.9, size * 0.95);
    ctx.fill();
    ctx.shadowBlur = 0;
    T(ctx, str, 0, 2, { size, weight: 900, color, spacing: 2 });
    ctx.restore();
  }

  draw['f-spin'] = function (ctx, t, api) {
    const { cue, fadeIn } = api;
    const ring = fadeIn(t, cue('f-spin', 1), 0.5);
    const focus = progress(t, cue('f-spin', 2), cue('f-spin', 2) + 0.5) * (1 - progress(t, cue('f-spin', 3), cue('f-spin', 3) + 0.4));
    tunnel(ctx, t, { ring, focus });
    topShade(ctx, 560, 0.55);
    darkTag(ctx);
    const ha = fadeIn(t, cue('f-spin', 0) - 0.05, 0.3);
    TS(ctx, 'SIRRI DÖNÜŞTE', 540, 360, { size: 84, weight: 900, alpha: ha, spacing: 2 });
    TS(ctx, 'yukarıdan bakış · top yukarı gidiyor, hava aşağı akıyor', 540, 438, { size: 28, weight: 700, color: 'rgba(255,255,255,0.8)', alpha: ha });
    arrowDown(ctx, 975, 520, 120, ha * 0.9);
    TS(ctx, 'hava', 975, 500, { hand: true, size: 40, weight: 700, alpha: ha });
    label(ctx, 'HIZLI', 175, 700, rgb(CYAN), '#04202a', fadeIn(t, cue('f-spin', 2) + 0.1, 0.5));
    label(ctx, 'YAVAŞ', 880, 1330, C.amber, '#1b1204', fadeIn(t, cue('f-spin', 3) + 0.1, 0.5));
    finish(ctx, t, { vig: 0.45, grain: 0.05 });
  };

  draw['f-push'] = function (ctx, t, api) {
    const { cue, fadeIn, S0 } = api;
    const s0 = S0('f-push');
    const press = fadeIn(t, s0, 0.6);
    const fa = progress(t, cue('f-push', 0) + 0.7, cue('f-push', 0) + 1.5, ease.out);
    const bx = 540 - 70 * fa;
    tunnel(ctx, t, { ring: 1, press, bx });
    // itme oku
    if (fa > 0) {
      ctx.save();
      const x1 = bx - 235;
      const x2 = bx - 235 - 200 * fa;
      const y = 980;
      ctx.shadowColor = 'rgba(245,158,11,0.8)';
      ctx.shadowBlur = 30;
      const g = ctx.createLinearGradient(x1, 0, x2, 0);
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(1, C.amber);
      ctx.strokeStyle = g;
      ctx.fillStyle = C.amber;
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2 + 30, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2 - 20, y);
      ctx.lineTo(x2 + 50, y - 50);
      ctx.lineTo(x2 + 50, y + 50);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      TS(ctx, 'itme', x2 + 90, y + 88, { hand: true, size: 54, weight: 700, alpha: fa });
    }
    topShade(ctx, 560, 0.55);
    darkTag(ctx);
    label(ctx, 'DÜŞÜK BASINÇ', 230, 700, '#3b82f6', '#ffffff', press, 34);
    label(ctx, 'YÜKSEK BASINÇ', 820, 1330, C.amber, '#1b1204', fadeIn(t, s0 + 0.35, 0.5), 34);
    // başlık: Magnus etkisi
    const ma = fadeIn(t, cue('f-push', 1) - 0.05, 0.4);
    const old = 1 - fadeIn(t, s0, 0.3);
    TS(ctx, 'SIRRI DÖNÜŞTE', 540, 360, { size: 84, weight: 900, alpha: old, spacing: 2 });
    TS(ctx, 'HIZLI YAN = DÜŞÜK BASINÇ', 540, 360, { size: 56, weight: 900, alpha: (1 - old) * (1 - ma), spacing: 1 });
    if (ma > 0) {
      const s = ease.back(clamp(ma * 1.2));
      ctx.save();
      ctx.translate(540, 360);
      ctx.scale(s, s);
      TS(ctx, 'MAGNUS ETKİSİ', 0, 0, { size: 92, weight: 900, color: C.amber, alpha: ma, spacing: 2 });
      ctx.restore();
      TS(ctx, 'Heinrich Gustav Magnus, 1852', 540, 445, { hand: true, size: 50, weight: 700, alpha: ma });
    }
    finish(ctx, t, { vig: 0.45, grain: 0.05 });
  };

  // ---------------------------------------------------------------------------
  // 4 · Yavaşladıkça daha çok kıvrılır: yukarıdan saha, 35 m frikik (Roberto Carlos canlandırması),
  // sonra saha bitmeseydi topun çizeceği sarmal (Dupeux ve ark., 2010)
  // ---------------------------------------------------------------------------
  const RC = (() => {
    // yatay düzlemde: x sağ, z ileri; top sola kıvrılır. Kaldırma katsayısı rω/v ile orantılı (sınırsız)
    const z0 = D - 35;
    let p = [3, z0];
    const sp0 = 32;
    const yaw = 12 * DEG;
    let v = [sp0 * Math.sin(yaw), sp0 * Math.cos(yaw)];
    const om = 8.6 * 2 * Math.PI;
    const dt = 1 / 480;
    const pts = [{ t: 0, p: [...p], s: sp0 }];
    let t = 0;
    for (let i = 1; i < 400000; i++) {
      const s = Math.hypot(v[0], v[1]);
      if (s < 2.2) break;
      const CL = (1.1 * BALL_R * om) / s;
      const n = [-v[1] / s, v[0] / s];
      v = [v[0] + (-KA * CD * s * v[0] + KA * CL * s * s * n[0]) * dt, v[1] + (-KA * CD * s * v[1] + KA * CL * s * s * n[1]) * dt];
      p = [p[0] + v[0] * dt, p[1] + v[1] * dt];
      t += dt;
      if (i % 8 === 0) pts.push({ t, p: [...p], s });
    }
    const gi = pts.findIndex((q) => q.p[1] >= D);
    return { pts, gi, goal: pts[gi], z0, sp0, om };
  })();
  const kappa = (s) => (KA * 1.1 * BALL_R * RC.om) / s; // eğrilik (1/m) = F⊥ / (m v²)

  // Yukarıdan saha (ortografik), her karede piksel piksel; sch: şemaya geçiş
  function renderTop(view, sch, scale = 0.5) {
    grass();
    const w = Math.round(SW * scale);
    const h = Math.round(SH * scale);
    const cv = renderTop.cv ?? (renderTop.cv = canvas(w, h));
    const g = cv.getContext('2d');
    const img = renderTop.img ?? (renderTop.img = g.createImageData(w, h));
    const out = img.data;
    const s = view.s * scale;
    const fp = 1 / s;
    const col = [0, 0, 0];
    for (let j = 0; j < h; j++) {
      const Z = view.Z0 - (j + 0.5 - h / 2) / s;
      for (let i = 0; i < w; i++) {
        const X = view.X0 + (i + 0.5 - w / 2) / s;
        let r;
        let gg;
        let b;
        if (Math.abs(X) < 38 && Z < D + 5 && Z > D - 110) {
          groundColor(X, Z, fp, col);
          [r, gg, b] = col;
        } else {
          const st = Math.abs(X) > 44 || Z > D + 9 || Z < D - 114;
          const rowv = st ? (Math.abs(X) > 44 ? Math.abs(X) : Math.abs(Z)) % 0.85 : 0;
          const k = st ? 0.7 + 0.3 * smooth(0.6, 0.7, rowv) * hash(Math.floor(X / 0.55), Math.floor(Z / 0.85)) : 1;
          r = 28 * k;
          gg = 32 * k;
          b = 40 * k;
        }
        if (sch > 0) {
          const m = marks(X, Z, fp);
          r = lerp(r, 10, sch * 0.82);
          gg = lerp(gg, 24, sch * 0.82);
          b = lerp(b, 52, sch * 0.82);
          const gx = Math.min(Math.abs(X - Math.round(X / 5) * 5), Math.abs(Z - Math.round(Z / 5) * 5));
          const grid = cover1(gx, 0.04, fp) * 0.22 * sch;
          r = lerp(r, 110, grid);
          gg = lerp(gg, 193, grid);
          b = lerp(b, 201, grid);
          r = lerp(r, 220, m * sch * 0.6);
          gg = lerp(gg, 230, m * sch * 0.6);
          b = lerp(b, 240, m * sch * 0.6);
        }
        const o = (j * w + i) * 4;
        out[o] = r;
        out[o + 1] = gg;
        out[o + 2] = b;
        out[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return cv;
  }

  draw['f-spiral'] = function (ctx, t, api) {
    const { S0, cue, fadeIn } = api;
    const s0 = S0('f-spiral');
    const u = t - s0;
    const SL = 0.72; // ağır çekim
    const tt = Math.max(0, (u - 0.25) * SL);
    const goalU = 0.25 + RC.goal.t / SL;
    const zp = progress(u, goalU + 0.25, goalU + 1.7, ease.inOut);
    const A = { X0: 3.5, Z0: D - 16, s: 1080 / 27 };
    const B = { X0: -24, Z0: D - 2, s: 1080 / 80 };
    const view = { X0: lerp(A.X0, B.X0, zp), Z0: lerp(A.Z0, B.Z0, zp), s: A.s * Math.pow(B.s / A.s, zp) };
    const sch = zp * 0.9;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(renderTop(view, sch), 0, 0, SW, SH);
    const X = (x) => 540 + (x - view.X0) * view.s;
    const Y = (z) => 960 - (z - view.Z0) * view.s;
    // kale (üstten): direkler, üst direk, ağ
    ctx.save();
    ctx.strokeStyle = 'rgba(235,240,245,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -GW; x <= GW + 1e-6; x += 0.25) {
      ctx.moveTo(X(x), Y(D));
      ctx.lineTo(X(x), Y(D + 2));
    }
    for (let z = D; z <= D + 2 + 1e-6; z += 0.25) {
      ctx.moveTo(X(-GW), Y(z));
      ctx.lineTo(X(GW), Y(z));
    }
    ctx.stroke();
    ctx.strokeStyle = '#f4f6f8';
    ctx.lineWidth = Math.max(3, 0.12 * view.s);
    ctx.beginPath();
    ctx.moveTo(X(-GW), Y(D));
    ctx.lineTo(X(GW), Y(D));
    ctx.stroke();
    ctx.restore();
    // baraj ve kaleci (üstten: omuzlar ve baş)
    const top = (x, z, kit, hair) => {
      const sx = X(x);
      const sy = Y(z);
      const k = view.s;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(sx + 0.25 * k, sy + 0.35 * k, 0.27 * k, 0.16 * k, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = kit;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 0.26 * k, 0.14 * k, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hair;
      dot(ctx, sx, sy + 0.01 * k, 0.1 * k);
    };
    const wx = [1.1, 1.65, 2.2, 2.75];
    wx.forEach((x, i) => top(x - 0.4, RC.z0 + 9.15, C.teal, WALL[i].hair));
    top(-0.6, D - 0.8, LIME, '#141414');
    // top yolu
    const ttc = Math.min(tt, RC.goal.t);
    const idx = RC.pts.findIndex((q) => q.t >= ttc);
    const n1 = idx < 0 ? RC.gi : Math.min(idx, RC.gi);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let k = 1; k <= n1; k++) {
      const a = RC.pts[k - 1];
      const b = RC.pts[k];
      const c = mix3(WHITE, AMBER, smooth(RC.sp0, RC.goal.s, b.s));
      ctx.strokeStyle = rgb(c, 0.95);
      ctx.lineWidth = lerp(5, 11, smooth(RC.sp0, RC.goal.s, b.s));
      ctx.beginPath();
      ctx.moveTo(X(a.p[0]), Y(a.p[1]));
      ctx.lineTo(X(b.p[0]), Y(b.p[1]));
      ctx.stroke();
    }
    // saha bitmeseydi: aynı fizikle sarmal (kesikli)
    const sa = progress(u, goalU + 0.45, goalU + 2.6, ease.inOut);
    if (sa > 0) {
      const last = Math.floor(RC.gi + (RC.pts.length - 1 - RC.gi) * sa);
      ctx.setLineDash([14, 12]);
      ctx.strokeStyle = rgb(AMBER, 0.95);
      ctx.lineWidth = 6;
      ctx.beginPath();
      for (let k = RC.gi; k <= last; k++) {
        const q = RC.pts[k];
        if (k === RC.gi) ctx.moveTo(X(q.p[0]), Y(q.p[1]));
        else ctx.lineTo(X(q.p[0]), Y(q.p[1]));
      }
      ctx.stroke();
      ctx.setLineDash([]);
      const q = RC.pts[last];
      glow(ctx, X(q.p[0]), Y(q.p[1]), 40, AMBER, 0.6);
    }
    ctx.restore();
    // top
    const cur = tt <= RC.goal.t ? RC.pts[Math.max(0, n1)] : RC.goal;
    const bp = tt <= RC.goal.t ? cur.p : [RC.goal.p[0] - 0.3 * clamp((tt - RC.goal.t) * 4), D + 1.4 * clamp((tt - RC.goal.t) * 4)];
    const hgt = tt <= RC.goal.t ? 2.6 * Math.sin(Math.PI * clamp(tt / (RC.goal.t * 1.12))) : 1.2;
    const rPx = Math.max(10, BALL_R * view.s * 1.9) * (1 + hgt * 0.06);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(X(bp[0]) + hgt * 0.25 * view.s, Y(bp[1]) + hgt * 0.35 * view.s, rPx * 0.9, rPx * 0.6, 0.4, 0, Math.PI * 2);
    ctx.fill();
    drawBall(ctx, X(bp[0]), Y(bp[1]), rPx, rotM([0, 0, 1], -t * 6), { lights: [{ d: norm([-0.3, 0.4, 0.86]), c: 1.1 }], ground: [60, 120, 60] });
    // ölçü göstergeleri: hız düşer, kıvrılma artar
    topShade(ctx, 640, 0.66);
    darkTag(ctx);
    const ga = fadeIn(t, s0 + 0.3, 0.4) * (1 - progress(u, goalU + 0.4, goalU + 0.9));
    const sNow = tt <= RC.goal.t ? cur.s : RC.goal.s;
    if (ga > 0) {
      const bar = (y, lab, val, frac, c) => {
        TS(ctx, lab, 110, y, { size: 30, weight: 900, align: 'left', alpha: ga, spacing: 2, blur: 8 });
        TS(ctx, val, 970, y, { size: 34, weight: 900, align: 'right', alpha: ga, color: rgb(c), blur: 8 });
        ctx.save();
        ctx.globalAlpha = ga;
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        rr(ctx, 110, y + 26, 860, 16, 8);
        ctx.fill();
        ctx.fillStyle = rgb(c);
        rr(ctx, 110, y + 26, Math.max(16, 860 * frac), 16, 8);
        ctx.fill();
        ctx.restore();
      };
      bar(345, 'HIZ', `${Math.round(sNow * 3.6)} km/sa`, sNow / RC.sp0, CYAN);
      const k0 = kappa(RC.sp0);
      const kg = kappa(RC.goal.s);
      bar(440, 'KIVRILMA', `×${(kappa(sNow) / k0).toFixed(1)}`, kappa(sNow) / kg, AMBER);
    }
    const ha = fadeIn(t, Math.max(cue('f-spiral', 1), s0 + goalU + 0.3), 0.4);
    if (ha > 0) {
      TS(ctx, 'YAVAŞLADIKÇA', 540, 340, { size: 70, weight: 900, alpha: ha, spacing: 2 });
      TS(ctx, 'DAHA ÇOK KIVRILIR', 540, 425, { size: 70, weight: 900, color: C.amber, alpha: ha, spacing: 2 });
    }
    const sl = progress(u, goalU + 1.4, goalU + 2.0);
    if (sl > 0) {
      const q = RC.pts[Math.floor(RC.gi + (RC.pts.length - 1 - RC.gi) * 0.55)];
      TS(ctx, 'saha bitmeseydi…', clamp(X(q.p[0]) + 40, 260, 820), Y(q.p[1]) + 70, { hand: true, size: 54, weight: 700, alpha: sl });
    }
    const ra = fadeIn(t, cue('f-spiral', 2) + 0.1, 0.4);
    label(ctx, 'ROBERTO CARLOS · 1997', 540, 1160, '#ffffff', '#0b1638', ra, 36);
    TS(ctx, 'Fransa–Brezilya · 35 m · canlandırma', 540, 1232, { size: 28, weight: 700, color: 'rgba(255,255,255,0.85)', alpha: ra });
    finish(ctx, t, { vig: 0.42, grain: 0.05 });
  };

  // ---------------------------------------------------------------------------
  // 5 · Derbide topun dönüşüne bak: yerden, topun yanından; arkada bulanık stadyum
  // ---------------------------------------------------------------------------
  const CAM_DERBY = camera([4.05, 0.3, -0.92], [1.8, 0.75, D], 48);
  let DERBY_BG = null;
  function derbyBg(t) {
    if (DERBY_BG) return DERBY_BG;
    const cam = CAM_DERBY;
    const sharp = canvas(SW, SH);
    const g = sharp.getContext('2d');
    stadium(g, cam, 0, { spray: false, scale: 0.5 });
    const blur = canvas(SW, SH);
    const b = blur.getContext('2d');
    b.filter = 'blur(16px)';
    b.drawImage(sharp, 0, 0);
    b.filter = 'none';
    // projektörlerden büyük bokeh daireleri
    b.globalCompositeOperation = 'lighter';
    for (let i = -40; i <= 40; i += 3) {
      const P = cam.proj([i * 1.5, YR - 0.5, ZR + 0.3]);
      if (!P) continue;
      const gr = b.createRadialGradient(P[0], P[1], 0, P[0], P[1], 46);
      gr.addColorStop(0, 'rgba(220,230,255,0.22)');
      gr.addColorStop(0.8, 'rgba(220,230,255,0.16)');
      gr.addColorStop(1, 'rgba(220,230,255,0)');
      b.fillStyle = gr;
      b.fillRect(P[0] - 46, P[1] - 46, 92, 92);
    }
    // alan derinliği: yakındaki çim keskin, gerisi bulanık
    const ground = cam.proj([SHOT.p0[0], 0, 0.6]);
    const out = canvas(SW, SH);
    const o = out.getContext('2d');
    o.drawImage(sharp, 0, 0);
    const mask = canvas(SW, SH);
    const mg = mask.getContext('2d');
    mg.drawImage(blur, 0, 0);
    mg.globalCompositeOperation = 'destination-in';
    const gr = mg.createLinearGradient(0, ground[1] - 160, 0, ground[1] + 120);
    gr.addColorStop(0, 'rgba(0,0,0,1)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    mg.fillStyle = gr;
    mg.fillRect(0, 0, SW, SH);
    o.drawImage(mask, 0, 0);
    DERBY_BG = out;
    return out;
  }

  draw['f-derby'] = function (ctx, t, api) {
    const { S0, cue, fadeIn } = api;
    const s0 = S0('f-derby');
    const u = t - s0;
    const cam = CAM_DERBY;
    const z = 1 + 0.05 * progress(u, 0, 4.5, ease.inOut);
    const bp = cam.proj(SHOT.p0);
    ctx.save();
    ctx.translate(bp[0], bp[1]);
    ctx.scale(z, z);
    ctx.translate(-bp[0], -bp[1]);
    ctx.drawImage(derbyBg(t), 0, 0);
    // tribünde bulanık flaşlar
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 60; i++) {
      const q = t * (0.5 + hash(i, 81)) + hash(i, 82);
      const cyc = Math.floor(q);
      if (hash(cyc, i + 5) > 0.3) continue;
      const a = 1 - (q - cyc) / 0.2;
      if (a <= 0) continue;
      const x = hash(i * 7 + cyc, 83) * SW;
      const y = 120 + hash(i * 7 + cyc, 84) * 560;
      glow(ctx, x, y, 34, [235, 240, 255], 0.4 * a);
    }
    ctx.restore();
    // top ve çim yaprakları
    const spin = progress(t, cue('f-derby', 2), cue('f-derby', 2) + 0.6);
    const th = spin > 0 ? (t - cue('f-derby', 2)) * 4.2 * spin : 0;
    const m = viewToBall(cam, [0, 1, 0], th + 0.6);
    const rPx = BALL_R * bp[3];
    blades(ctx, cam, SHOT.p0[0], SHOT.p0[2], t, false, { n: 260, rad: 0.35, hgt: 0.04 });
    // dönüş halkası (arka yarısı topun arkasında)
    const ring = (front) => {
      if (spin <= 0) return;
      ctx.save();
      ctx.strokeStyle = rgb(AMBER, 0.95 * spin);
      ctx.fillStyle = rgb(AMBER, 0.95 * spin);
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(245,158,11,0.7)';
      ctx.shadowBlur = 24;
      const rx = rPx * 1.45;
      const ry = rPx * 0.34;
      const a0 = front ? 0.15 : Math.PI + 0.15;
      ctx.beginPath();
      ctx.ellipse(bp[0], bp[1], rx, ry, 0, a0, a0 + Math.PI - 0.3);
      ctx.stroke();
      if (front) {
        // önden geçen ok sağa gider (yukarıdan bakınca saat yönünün tersi)
        const ph = ((t * 0.7) % 1) * (Math.PI - 0.6) + 0.3;
        const ax = bp[0] + Math.cos(ph) * rx;
        const ay = bp[1] + Math.sin(ph) * ry;
        const dx = -Math.sin(ph) * rx;
        const dy = Math.cos(ph) * ry;
        const L = Math.hypot(dx, dy);
        const tx = -dx / L;
        const ty = -dy / L;
        ctx.beginPath();
        ctx.moveTo(ax + tx * 30, ay + ty * 30);
        ctx.lineTo(ax - ty * 18, ay + tx * 18);
        ctx.lineTo(ax + ty * 18, ay - tx * 18);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    };
    ring(false);
    const L = [{ d: norm([-0.4, 0.75, 0.5]), c: 1.0 }, { d: norm([0.7, 0.4, -0.2]), c: 0.5 }, { d: norm([0.2, 0.9, 0.3]), c: 0.3 }];
    drawBall(ctx, bp[0], bp[1], rPx, m, { lights: L });
    blades(ctx, cam, SHOT.p0[0], SHOT.p0[2], t, true, { n: 260, rad: 0.35, hgt: 0.04 });
    ring(true);
    ctx.restore();
    topShade(ctx, 700, 0.62);
    darkTag(ctx);
    const a0 = fadeIn(t, cue('f-derby', 0) - 0.05, 0.3);
    const a1 = fadeIn(t, cue('f-derby', 1), 0.3);
    const a2 = fadeIn(t, cue('f-derby', 2), 0.35);
    TS(ctx, 'DERBİDE FRİKİK GÖRÜRSEN', 540, 340, { size: 48, weight: 900, alpha: a0, spacing: 2 });
    TS(ctx, 'KALEYE DEĞİL,', 540, 440, { size: 76, weight: 900, alpha: a1 * (1 - 0.5 * a2), spacing: 1 });
    if (a2 > 0) {
      const w = M(ctx, 'KALEYE DEĞİL,', { size: 76, weight: 900, spacing: 1 });
      ctx.save();
      ctx.strokeStyle = C.amber;
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(540 - w / 2 - 10, 440);
      ctx.lineTo(540 - w / 2 - 10 + (w + 20) * a2, 440);
      ctx.stroke();
      ctx.restore();
    }
    const pp = ease.back(clamp(a2 * 1.2));
    ctx.save();
    ctx.translate(540, 560);
    ctx.scale(pp, pp);
    TS(ctx, 'TOPUN DÖNÜŞÜNE BAK', 0, 0, { size: 76, weight: 900, color: C.amber, alpha: a2, spacing: 1 });
    ctx.restore();
    finish(ctx, t, { vig: 0.5, grain: 0.06 });
  };

  draw['f-cta'] = function (ctx, t, api) {
    api.cta(ctx, t, { invite: 'En güzel falso golü?' });
  };

  // ---------------------------------------------------------------------------
  // Ses: stadyum uğultusu, düdük, vuruş, ağ, gol coşkusu; tünelde rüzgâr
  // ---------------------------------------------------------------------------
  function score(m, hz, api) {
    const { cue, S0, S1 } = api;
    const s1 = S0('f-hook');
    const goal = s1 + KICK + HOOK.hit.t / SLOW;
    m.crowd(0, S1('f-hook') + 0.4, { gain: 0.2, swells: [[goal, 3.2, 2.2]] });
    m.whistle(s1 + 0.0);
    m.boom(s1 + KICK, { gain: 0.32, freq: 95 });
    m.click(s1 + KICK, { gain: 0.28, tone: 900 });
    m.whoosh(s1 + KICK + 0.03, { dur: 1.7, from: 1600, to: 420, gain: 0.06, panFrom: 0.2, panTo: -0.3 });
    m.whoosh(goal, { dur: 0.35, from: 5200, to: 2400, gain: 0.07 });
    m.click(goal, { gain: 0.1, tone: 1400 });
    m.boom(goal + 0.05, { gain: 0.2, freq: 60 });
    // tünel: hava akışı, dönüş tıkırtıları
    m.wind(S0('f-spin'), S1('f-push') - S0('f-spin'), { gain: 0.16 });
    for (let x = cue('f-spin', 1); x < cue('f-spin', 1) + 1.6; x += 0.21) m.tick(x, { gain: 0.03, tone: 3800 });
    m.blip(cue('f-spin', 2) + 0.1, { freq: 660, dur: 0.25, slide: 1.6, gain: 0.03 });
    m.blip(cue('f-spin', 3) + 0.1, { freq: 660, dur: 0.3, slide: 0.6, gain: 0.03 });
    m.riser(cue('f-push', 0) + 0.3, 1.2, { gain: 0.06 });
    m.boom(cue('f-push', 0) + 1.5, { gain: 0.18, freq: 70 });
    m.bell(cue('f-push', 1), { freq: hz('A5'), gain: 0.06, decay: 2.4 });
    // sarmal
    const sp = S0('f-spiral');
    m.boom(sp + 0.25, { gain: 0.2, freq: 95 });
    m.whoosh(sp + 0.28, { dur: 2.0, from: 1400, to: 380, gain: 0.05, panFrom: 0.3, panTo: -0.2 });
    m.whoosh(sp + 2.6, { dur: 2.2, from: 300, to: 2600, gain: 0.05, panFrom: -0.4, panTo: 0.4 });
    // derbi
    m.crowd(S0('f-derby') - 0.2, S1('f-derby') - S0('f-derby') + 0.4, { gain: 0.16 });
    m.heartbeat(S0('f-derby') + 0.3, { gain: 0.35 });
    m.heartbeat(S0('f-derby') + 1.25, { gain: 0.3 });
    m.whoosh(cue('f-derby', 2), { dur: 0.9, from: 700, to: 2600, gain: 0.05 });
  }

  window.FILM = K.short({
    title: 'Falsonun fiziği: Top havada neden kıvrılır? · YUP Akademi',
    series: 'DERBİ ÖZEL',
    gap: 0.15,
    breath: 0.25,
    wipe: 0.4,
    cut: ['f-push'],
    extra: { 'f-hook': 0.55, 'f-spin': 0.4, 'f-push': 0.5, 'f-spiral': 0.8, 'f-derby': 0.6, 'f-cta': 1.9 },
    lead: { 'f-hook': 0.1, 'f-spin': 0.2, 'f-push': 0.15, 'f-spiral': 0.2, 'f-derby': 0.2, 'f-cta': 0.3 },
    titles: {
      'f-hook': '4 metre',
      'f-spin': 'Dönen top',
      'f-push': 'Magnus etkisi',
      'f-spiral': 'Sarmal',
      'f-derby': 'Derbi',
      'f-cta': 'YUP Akademi',
    },
    chords: {
      'f-hook': ['D3', 'A3', 'F#4', 'C#5'],
      'f-spin': ['B2', 'F#3', 'D4', 'A4'],
      'f-push': ['G2', 'D3', 'B3', 'F#4'],
      'f-spiral': ['E3', 'B3', 'G4', 'D5'],
      'f-derby': ['A2', 'E3', 'C#4', 'G#4'],
      'f-cta': ['D3', 'A3', 'F#4', 'A4'],
    },
    draw,
    score,
  });
})();
