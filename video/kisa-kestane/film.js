/*
 * YUP Akademi · Tabağındaki Bilim kısa video (1080×1920) — Kestane ateşte neden patlar?
 *
 * Hızlı kalıp: ilk karede başlık ve ateşteki kestane; ilk cümlede patlama. 30–40 sn, kısa geçişler,
 * yorum çağrısı yalnızca sonda. Ortak marka motoru: video/yup-marka/kisa.js. Kaynaklar: kaynaklar.md.
 * Sahneler: buhar bombası · içinin yarısı su, buhar 1700 kat · basınç ve patlama · çarpı buhara kapı açar ·
 * cevize değil patatese benzer (yağ ve karbonhidrat) · yorum çağrılı kapanış.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, lerp, ease, progress, hash, noise } = E;
  const K = window.YupKisa;
  const { C, T, M, rr, shadowed, card, pill, line, dot, dayBg, checkBadge, star } = K;
  const SHELL = '#7b3f1e';
  const SHELL_HI = '#a9582b';
  const BASE = '#d9b38a';
  const KERNEL = '#f3ddb0';
  const PELLICLE = '#a5552f';
  const WATER = 'rgba(91,184,214,0.55)';
  const TOMATO = '#e5484d';

  // ---------------------------------------------------------------------------
  // Çizimler
  // ---------------------------------------------------------------------------
  // Kestane kabuğu (birim r = 100): sivri tepe, yuvarlak gövde
  function shellPath(ctx) {
    ctx.beginPath();
    ctx.moveTo(0, -104);
    ctx.bezierCurveTo(26, -98, 106, -56, 108, 12);
    ctx.bezierCurveTo(110, 62, 84, 88, 40, 90);
    ctx.lineTo(-40, 90);
    ctx.bezierCurveTo(-84, 88, -110, 62, -108, 12);
    ctx.bezierCurveTo(-106, -56, -26, -98, 0, -104);
    ctx.closePath();
  }
  function chestnut(ctx, x, y, r, t, { a = 1, rot = 0, cross = 0, open = 0, roast = 0 } = {}) {
    if (a <= 0.002) return;
    const s = r / 100;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    shadowed(ctx, () => {
      shellPath(ctx);
      ctx.fillStyle = SHELL;
      ctx.fill();
    }, { blur: 30 / s, oy: 12 / s, color: 'rgba(43,31,26,0.3)' });
    ctx.save();
    shellPath(ctx);
    ctx.clip();
    const g = ctx.createRadialGradient(-30, -40, 10, 0, 0, 120);
    g.addColorStop(0, SHELL_HI);
    g.addColorStop(1, roast > 0 ? mixHex(SHELL, '#3d1d0c', roast) : SHELL);
    ctx.fillStyle = g;
    ctx.fillRect(-120, -120, 240, 240);
    // açık renkli taban
    ctx.fillStyle = BASE;
    ctx.beginPath();
    ctx.moveTo(-120, 58);
    ctx.quadraticCurveTo(0, 74, 120, 58);
    ctx.lineTo(120, 120);
    ctx.lineTo(-120, 120);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(150,100,60,0.35)';
    for (let i = 0; i < 22; i++) dot(ctx, -80 + hash(i, 61) * 160, 70 + hash(i, 62) * 18, 2 + hash(i, 63) * 2.5);
    // hafif çizgiler
    ctx.strokeStyle = 'rgba(43,20,8,0.12)';
    ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i += 2) {
      ctx.beginPath();
      ctx.moveTo(i * 20, -90);
      ctx.quadraticCurveTo(i * 52, -20, i * 46, 50);
      ctx.stroke();
    }
    // parlak kabuk
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath();
    ctx.ellipse(-38, -30, 22, 44, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    dot(ctx, -24, -62, 7);
    // çarpı ve açılan kabuk
    if (cross > 0) {
      const cx = 0;
      const cy = -40;
      const L = 46;
      ctx.strokeStyle = '#2a1408';
      ctx.lineWidth = 8;
      const p1 = clamp(cross * 2);
      const p2 = clamp(cross * 2 - 1);
      line(ctx, cx - L, cy - L * 0.6, cx - L + 2 * L * p1, cy - L * 0.6 + 1.2 * L * p1);
      if (p2 > 0) line(ctx, cx + L, cy - L * 0.6, cx + L - 2 * L * p2, cy - L * 0.6 + 1.2 * L * p2);
      if (open > 0) {
        ctx.fillStyle = KERNEL;
        ctx.beginPath();
        for (let k = 0; k < 4; k++) {
          const th = -Math.PI / 2 + (k * Math.PI) / 2 + Math.PI / 4;
          const rr2 = 30 * open;
          ctx.lineTo(cx + Math.cos(th) * rr2, cy + Math.sin(th) * rr2 * 0.8);
          ctx.lineTo(cx + Math.cos(th + Math.PI / 4) * rr2 * 0.45, cy + Math.sin(th + Math.PI / 4) * rr2 * 0.4);
        }
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
    // tepe püskülü
    ctx.strokeStyle = '#e8cfa6';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = -2; i <= 2; i++) line(ctx, 0, -106, i * 5, -122 - Math.abs(i) * -2);
    ctx.restore();
  }
  function mixHex(a, b, p) {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * p)).join(',')})`;
  }
  // Kesit: kalın kabuk, ince zar, krem iç; su seviyesi ve içerde dolaşan buhar
  function section(ctx, x, y, r, t, { a = 1, water = 0, steam = 0, speed = 1, wall = 0 } = {}) {
    if (a <= 0.002) return;
    const s = r / 100;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    shadowed(ctx, () => {
      shellPath(ctx);
      ctx.fillStyle = SHELL;
      ctx.fill();
    }, { blur: 30 / s, oy: 12 / s, color: 'rgba(43,31,26,0.3)' });
    if (wall > 0) {
      ctx.strokeStyle = `rgba(245,158,11,${0.9 * wall})`;
      ctx.lineWidth = 7;
      shellPath(ctx);
      ctx.stroke();
    }
    ctx.save();
    ctx.scale(0.86, 0.86);
    shellPath(ctx);
    ctx.fillStyle = PELLICLE;
    ctx.fill();
    ctx.scale(0.95, 0.95);
    shellPath(ctx);
    ctx.fillStyle = KERNEL;
    ctx.fill();
    ctx.clip();
    // dokular
    ctx.fillStyle = 'rgba(214,170,110,0.35)';
    for (let i = 0; i < 26; i++) dot(ctx, -80 + hash(i, 31) * 160, -90 + hash(i, 32) * 170, 3 + hash(i, 33) * 5);
    // su
    if (water > 0) {
      const wy = 94 - 200 * 0.5 * water;
      ctx.fillStyle = WATER;
      ctx.beginPath();
      ctx.moveTo(-120, 120);
      ctx.lineTo(-120, wy);
      for (let xx = -120; xx <= 120; xx += 10) ctx.lineTo(xx, wy + Math.sin(xx * 0.08 + t * 4) * 4);
      ctx.lineTo(120, 120);
      ctx.closePath();
      ctx.fill();
    }
    // buhar molekülleri sekiyor
    if (steam > 0) {
      const n = Math.round(6 + 26 * steam);
      for (let i = 0; i < n; i++) {
        const px = Math.sin(t * (1.3 + hash(i, 1)) * speed + i * 1.7) * 70;
        const py = Math.cos(t * (1.1 + hash(i, 2)) * speed + i * 2.3) * 70 - 6;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.strokeStyle = 'rgba(110,193,201,0.9)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
    ctx.restore();
  }
  // Patlama: kabuk parçaları savrulur, parlama, "PAT!"
  function burst(ctx, x, y, r, t, tb) {
    const u = t - tb;
    if (u < 0 || u > 1.6) return;
    E.glow(ctx, x, y, r * (1.5 + u * 3), [255, 196, 90], 0.9 * Math.max(0, 1 - u * 1.8));
    for (let i = 0; i < 14; i++) {
      const th = (i / 14) * Math.PI * 2 + hash(i, 9);
      const v = r * (4 + hash(i, 10) * 3);
      const px = x + Math.cos(th) * v * u;
      const py = y + Math.sin(th) * v * u + 900 * u * u;
      ctx.save();
      ctx.globalAlpha *= clamp(1.4 - u);
      ctx.translate(px, py);
      ctx.rotate(u * (6 + i));
      ctx.fillStyle = i % 3 ? SHELL : BASE;
      const w = r * (0.18 + hash(i, 11) * 0.2);
      ctx.beginPath();
      ctx.moveTo(-w, -w * 0.4);
      ctx.lineTo(w * 0.8, -w * 0.6);
      ctx.lineTo(w * 0.5, w * 0.5);
      ctx.lineTo(-w * 0.6, w * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // buhar halkası
    ctx.save();
    ctx.globalAlpha *= clamp(1 - u * 1.2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 14 * (1 - clamp(u));
    ctx.beginPath();
    ctx.arc(x, y, r * (1 + u * 2.4), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    const ps = ease.back(clamp(u / 0.3));
    ctx.save();
    ctx.translate(x + r * 0.9, y - r * 1.1);
    ctx.rotate(-0.15);
    ctx.scale(ps, ps);
    ctx.globalAlpha *= clamp((1.5 - u) * 2);
    T(ctx, 'PAT!', 0, 0, { size: 150, weight: 900, color: C.amber, spacing: 4 });
    ctx.restore();
  }
  const shake = (t, tb) => (t > tb && t < tb + 0.35 ? Math.sin((t - tb) * 90) * 14 * (1 - (t - tb) / 0.35) : 0);
  // Ateş: köz ve dalgalanan alevler
  function fire(ctx, x0, x1, yb, t, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    E.glow(ctx, (x0 + x1) / 2, yb - 40, (x1 - x0) * 0.6, [245, 120, 30], 0.55);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const fx = lerp(x0 + 30, x1 - 30, i / (n - 1));
      const h = 150 + 70 * noise(t * 3 + i * 1.3, i) + (i % 2 ? 0 : 40);
      const w = (x1 - x0) / n * 0.9;
      for (const [col, k] of [['#e8541a', 1], [C.amber, 0.72], ['#ffd27a', 0.42]]) {
        ctx.fillStyle = col;
        ctx.beginPath();
        const sway = (noise(t * 2.2 + i, 7) - 0.5) * 40 * k;
        ctx.moveTo(fx - (w / 2) * k, yb);
        ctx.quadraticCurveTo(fx - (w / 2) * k, yb - h * k * 0.5, fx + sway, yb - h * k);
        ctx.quadraticCurveTo(fx + (w / 2) * k, yb - h * k * 0.5, fx + (w / 2) * k, yb);
        ctx.closePath();
        ctx.fill();
      }
    }
    // közler
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = i % 2 ? '#3a1a0c' : '#5a2410';
      dot(ctx, lerp(x0, x1, hash(i, 41)), yb + 6 + hash(i, 42) * 20, 18 + hash(i, 43) * 14);
      ctx.fillStyle = `rgba(255,140,40,${0.4 + 0.4 * noise(t * 4 + i, 3)})`;
      dot(ctx, lerp(x0, x1, hash(i, 41)), yb + 6 + hash(i, 42) * 20, 8);
    }
    // kıvılcımlar
    for (let i = 0; i < 10; i++) {
      const u = (t * (0.6 + hash(i, 44) * 0.5) + hash(i, 45)) % 1;
      ctx.fillStyle = `rgba(255,210,122,${1 - u})`;
      dot(ctx, lerp(x0, x1, hash(i, 46)) + Math.sin(t * 3 + i) * 20, yb - 60 - u * 360, 4);
    }
    ctx.restore();
  }
  function grill(ctx, x0, x1, y, a = 1) {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = '#2b2b33';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    line(ctx, x0, y, x1, y);
    for (let x = x0 + 40; x < x1; x += 70) line(ctx, x, y - 16, x, y + 16);
    ctx.restore();
  }
  function wisps(ctx, x, y, t, a, n = 3, spread = 60) {
    if (a <= 0.002) return;
    ctx.save();
    for (let i = 0; i < n; i++) {
      const u = (t * 0.8 + i / n) % 1;
      ctx.globalAlpha = a * (1 - u) * 0.8;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      const sx = x + (i - (n - 1) / 2) * spread;
      ctx.beginPath();
      ctx.moveTo(sx, y - u * 160);
      ctx.bezierCurveTo(sx + 26, y - 40 - u * 160, sx - 26, y - 80 - u * 160, sx, y - 120 - u * 160);
      ctx.stroke();
    }
    ctx.restore();
  }
  // Basınç göstergesi
  function gauge(ctx, x, y, r, v, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    shadowed(ctx, () => {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, y, r, Math.PI, 0);
      ctx.lineTo(x + r, y + 30);
      ctx.lineTo(x - r, y + 30);
      ctx.closePath();
      ctx.fill();
    });
    const segs = [[C.cyan, 0, 0.45], [C.amber, 0.45, 0.78], [TOMATO, 0.78, 1]];
    for (const [col, a0, a1] of segs) {
      ctx.strokeStyle = col;
      ctx.lineWidth = r * 0.16;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.8, Math.PI + a0 * Math.PI, Math.PI + a1 * Math.PI);
      ctx.stroke();
    }
    const ang = Math.PI + clamp(v) * Math.PI;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    line(ctx, x, y, x + Math.cos(ang) * r * 0.72, y + Math.sin(ang) * r * 0.72);
    ctx.fillStyle = C.ink;
    dot(ctx, x, y, 14);
    ctx.restore();
  }
  function knife(ctx, x, y, ang, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.fillStyle = '#d7dde4';
    ctx.strokeStyle = '#8a96a3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(160, -10);
    ctx.quadraticCurveTo(200, -14, 210, -40);
    ctx.lineTo(160, -44);
    ctx.lineTo(0, -40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = C.navy;
    rr(ctx, -130, -44, 130, 46, 16);
    ctx.fill();
    ctx.restore();
  }
  function cloud(ctx, x, y, s, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth = 4 / s;
    const parts = [[-40, 10, 40], [0, -10, 52], [44, 8, 40], [-70, 26, 28], [76, 26, 28], [0, 30, 44]];
    ctx.beginPath();
    for (const [px, py, pr] of parts) {
      ctx.moveTo(px + pr, py);
      ctx.arc(px, py, pr, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }
  function waterDrop(ctx, x, y, r, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = '#5bb8d6';
    ctx.beginPath();
    ctx.moveTo(x, y - r * 1.8);
    ctx.quadraticCurveTo(x + r, y - r * 0.4, x + r, y + r * 0.2);
    ctx.arc(x, y + r * 0.2, r, 0, Math.PI);
    ctx.quadraticCurveTo(x - r, y - r * 0.4, x, y - r * 1.8);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    dot(ctx, x - r * 0.35, y, r * 0.25);
    ctx.restore();
  }
  function walnut(ctx, x, y, r, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = '#c8955a';
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.86, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = r * 0.06;
    ctx.lineCap = 'round';
    line(ctx, x, y - r * 0.86, x, y + r * 0.86);
    for (let i = 0; i < 6; i++) {
      const yy = y - r * 0.6 + i * r * 0.24;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.8, yy);
      ctx.quadraticCurveTo(x - r * 0.4, yy - r * 0.15, x - r * 0.1, yy + r * 0.05);
      ctx.moveTo(x + r * 0.1, yy + r * 0.05);
      ctx.quadraticCurveTo(x + r * 0.4, yy - r * 0.15, x + r * 0.8, yy);
      ctx.stroke();
    }
    ctx.restore();
  }
  function potato(ctx, x, y, r, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = '#c99a5b';
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.15, r * 0.82, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(120,80,40,0.45)';
    for (let i = 0; i < 6; i++) dot(ctx, x + (hash(i, 51) - 0.5) * r * 1.6, y + (hash(i, 52) - 0.5) * r * 1.0, r * 0.06);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(x - r * 0.4, y - r * 0.35, r * 0.4, r * 0.16, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Sahneler
  // ---------------------------------------------------------------------------
  const draw = {};
  const FP = { x: 90, y: 640, w: 900, h: 780 };

  draw['c-hook'] = function (ctx, t, api) {
    const { cue, end } = api;
    dayBg(ctx, t);
    api.tag(ctx);
    // başlık ilk karede hazır
    T(ctx, 'Kestane', 540, 370, { size: 120, weight: 900, color: C.ink });
    T(ctx, 'neden patlar?', 540, 495, { size: 100, weight: 900, color: C.amber });
    // ateş paneli
    const tb = Math.max(1.2, end('c-hook') - 0.35);
    const sh = shake(t, tb);
    ctx.save();
    ctx.translate(sh, sh * 0.4);
    shadowed(ctx, () => {
      rr(ctx, FP.x, FP.y, FP.w, FP.h, 48);
      ctx.fillStyle = C.nightDeep;
      ctx.fill();
    });
    ctx.save();
    rr(ctx, FP.x, FP.y, FP.w, FP.h, 48);
    ctx.clip();
    const g = ctx.createLinearGradient(0, FP.y, 0, FP.y + FP.h);
    g.addColorStop(0, '#16224f');
    g.addColorStop(1, '#3a1d1a');
    ctx.fillStyle = g;
    ctx.fillRect(FP.x, FP.y, FP.w, FP.h);
    fire(ctx, FP.x + 40, FP.x + FP.w - 40, FP.y + FP.h - 30, t);
    grill(ctx, FP.x + 60, FP.x + FP.w - 60, FP.y + FP.h - 250);
    // kestane titrer, buhar çıkar; patlar
    const cx = 540;
    const cy = FP.y + FP.h - 400;
    const jig = clamp(t / tb);
    if (t < tb) {
      const j = Math.sin(t * 38) * 6 * jig * jig;
      chestnut(ctx, cx + j, cy - Math.abs(j) * 0.6, 160, t, { rot: j * 0.01, roast: jig * 0.5 });
      wisps(ctx, cx, cy - 170, t, 0.4 + 0.6 * jig, 3, 50);
    } else {
      // patlamış kestane: iki yarım ve görünen iç
      const u = clamp((t - tb) / 0.4);
      ctx.save();
      ctx.translate(cx, cy + 40);
      ctx.fillStyle = KERNEL;
      ctx.beginPath();
      ctx.ellipse(0, 0, 120, 80, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      chestnut(ctx, cx - 110 * u, cy + 30 * u, 120, t, { rot: -0.9 * u, roast: 0.5 });
      chestnut(ctx, cx + 110 * u, cy + 30 * u, 120, t, { rot: 0.9 * u, roast: 0.5 });
      wisps(ctx, cx, cy - 20, t, 1, 4, 60);
    }
    burst(ctx, cx, cy, 160, t, tb);
    ctx.restore();
    ctx.restore();
  };

  draw['c-water'] = function (ctx, t, api) {
    const { cue, S0, after, pop, fadeIn } = api;
    dayBg(ctx, t);
    api.tag(ctx);
    const s0 = S0('c-water');
    // kesit ve su
    const wa = after(t, 'c-water', 0, 0.8, ease.inOut);
    section(ctx, 540, 720, 250, t, { a: fadeIn(t, s0, 0.25), water: wa });
    const pa = after(t, 'c-water', 0, 0.4);
    ctx.save();
    ctx.translate(880, 470);
    const ps = lerp(0.6, 1, pop(t, cue('c-water', 0) + 0.2));
    ctx.scale(ps, ps);
    pill(ctx, '%50 SU', 0, 0, { size: 52, fill: C.cyan, color: C.ink, a: pa });
    ctx.restore();
    // damla → buhar bulutu
    const b0 = cue('c-water', 1);
    const da = progress(t, b0 - 0.1, b0 + 0.3);
    card(ctx, 90, 1080, 900, 360, { r: 44, a: da, fill: C.cyanSoft });
    waterDrop(ctx, 230, 1270, 38, da);
    T(ctx, '1', 230, 1380, { size: 40, weight: 900, color: C.ink, alpha: da });
    ctx.save();
    ctx.globalAlpha *= da;
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    line(ctx, 310, 1260, 400, 1260);
    ctx.fillStyle = C.amber;
    ctx.beginPath();
    ctx.moveTo(420, 1260);
    ctx.lineTo(396, 1242);
    ctx.lineTo(396, 1278);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    const cg = progress(t, b0 + 0.6, b0 + 2.4, ease.out);
    ctx.save();
    rr(ctx, 90, 1080, 900, 360, 44);
    ctx.clip();
    cloud(ctx, 690, 1260, lerp(0.2, 2.6, cg), da);
    ctx.restore();
    const xa = progress(t, b0 + 1.4, b0 + 1.8);
    ctx.save();
    ctx.translate(700, 1260);
    const xs = lerp(0.5, 1, pop(t, b0 + 1.4));
    ctx.scale(xs, xs);
    T(ctx, '×1700', 0, 0, { size: 120, weight: 900, color: C.amber, alpha: xa, glow: 'rgba(255,255,255,0.9)', glowBlur: 30 });
    ctx.restore();
    T(ctx, 'buhar olunca hacim', 700, 1360, { size: 32, weight: 800, color: C.muted, alpha: xa });
  };

  draw['c-press'] = function (ctx, t, api) {
    const { cue, end, S0, after, pop, fadeIn } = api;
    dayBg(ctx, t);
    api.tag(ctx);
    const s0 = S0('c-press');
    const tb = end('c-press') - 0.3;
    const sh = shake(t, tb);
    ctx.save();
    ctx.translate(sh, sh * 0.4);
    const v = clamp(0.15 + 0.35 * after(t, 'c-press', 1, 0.8) + 0.35 * after(t, 'c-press', 2, 0.6) + 0.15 * progress(t, cue('c-press', 3), tb));
    if (t < tb) {
      const j = Math.sin(t * 40) * 6 * v * v;
      section(ctx, 540 + j, 720, 250, t, { a: fadeIn(t, s0, 0.25), steam: v, speed: 0.8 + v * 3, wall: after(t, 'c-press', 0, 0.4) });
    } else {
      const u = clamp((t - tb) / 0.4);
      section(ctx, 540, 760, 200, t, { a: 1 - u * 0.2, steam: 0.2, speed: 1 });
      wisps(ctx, 540, 600, t, 1, 4, 70);
    }
    burst(ctx, 540, 720, 230, t, tb);
    ctx.restore();
    pill(ctx, 'SERT KABUK', 540, 400, { size: 38, fill: SHELL, a: after(t, 'c-press', 0, 0.4) * (t < tb ? 1 : 0), scale: lerp(0.7, 1, pop(t, cue('c-press', 0))) });
    // gösterge
    gauge(ctx, 540, 1260, 190, t < tb ? v : Math.max(0, 1 - (t - tb) * 1.5), fadeIn(t, s0 + 0.1));
    T(ctx, 'BASINÇ', 540, 1340, { size: 38, weight: 900, color: C.ink, spacing: 3, alpha: fadeIn(t, s0 + 0.1) });
  };

  draw['c-cross'] = function (ctx, t, api) {
    const { cue, S0, after, pop, fadeIn } = api;
    dayBg(ctx, t);
    api.tag(ctx);
    const s0 = S0('c-cross');
    const cr = after(t, 'c-cross', 0, 0.9, ease.inOut);
    const op = after(t, 'c-cross', 1, 0.8, ease.inOut);
    chestnut(ctx, 540, 780, 230, t, { a: fadeIn(t, s0, 0.25), cross: cr, open: op, roast: op * 0.4 });
    // bıçak çarpıyı çizer
    if (cr > 0 && cr < 1) {
      const p1 = clamp(cr * 2);
      const p2 = clamp(cr * 2 - 1);
      const k = 230 / 100;
      const L = 46 * k;
      const x = cr < 0.5 ? 540 - L + 2 * L * p1 : 540 + L - 2 * L * p2;
      const y = 780 - 40 * k - L * 0.6 + 1.2 * L * (cr < 0.5 ? p1 : p2);
      knife(ctx, x, y, cr < 0.5 ? 0.5 : 2.6, 1);
    }
    // çarpıdan buhar fışkırır
    if (op > 0) {
      for (let i = 0; i < 4; i++) {
        const u = (t * 1.4 + i / 4) % 1;
        cloud(ctx, 540 + Math.sin(i * 2 + t) * 30, 780 - 92 * 2.3 - u * 260, 0.35 + u * 0.5, op * (1 - u));
      }
    }
    pill(ctx, 'çıkış kapısı', 820, 470, { size: 34, fill: C.paper, color: C.ink, weight: 800, a: op, scale: lerp(0.7, 1, pop(t, cue('c-cross', 1) + 0.3)) });
    const a1 = after(t, 'c-cross', 2, 0.35);
    const a2 = after(t, 'c-cross', 3, 0.35);
    card(ctx, 90, 1130, 430, 170, { r: 40, a: a1 });
    checkBadge(ctx, 170, 1215, 38, { a: a1, s: pop(t, cue('c-cross', 2)), fill: C.green });
    T(ctx, 'patlamaz', 225, 1217, { size: 44, weight: 900, color: C.ink, align: 'left', alpha: a1 });
    card(ctx, 560, 1130, 430, 170, { r: 40, a: a2 });
    checkBadge(ctx, 640, 1215, 38, { a: a2, s: pop(t, cue('c-cross', 3)), fill: C.green });
    T(ctx, 'kolay soyulur', 690, 1217, { size: 40, weight: 900, color: C.ink, align: 'left', alpha: a2 });
  };

  draw['c-starch'] = function (ctx, t, api) {
    const { cue, S0, after, pop, fadeIn } = api;
    dayBg(ctx, t);
    api.tag(ctx);
    const s0 = S0('c-starch');
    T(ctx, 'bir de sürpriz!', 540, 360, { hand: true, size: 80, weight: 700, color: C.amber, alpha: fadeIn(t, s0, 0.25) });
    // ceviz ≠ kestane = patates
    const w = after(t, 'c-starch', 1, 0.4);
    const p = after(t, 'c-starch', 2, 0.4);
    walnut(ctx, 200, 620, 95 * lerp(0.6, 1, pop(t, cue('c-starch', 1))), w);
    chestnut(ctx, 540, 625, 110, t, { a: fadeIn(t, s0 + 0.1, 0.25) });
    potato(ctx, 880, 625, 95 * lerp(0.6, 1, pop(t, cue('c-starch', 2))), p);
    T(ctx, '≠', 370, 620, { size: 110, weight: 900, color: C.grey, alpha: w });
    T(ctx, '=', 710, 620, { size: 110, weight: 900, color: C.teal, alpha: p });
    T(ctx, 'ceviz', 200, 760, { size: 34, weight: 800, color: C.muted, alpha: w });
    T(ctx, 'kestane', 540, 760, { size: 34, weight: 900, color: C.ink, alpha: fadeIn(t, s0 + 0.1) });
    T(ctx, 'patates', 880, 760, { size: 34, weight: 800, color: C.muted, alpha: p });
    // 100 gramda yağ ve karbonhidrat
    const ca = after(t, 'c-starch', 3, 0.35);
    card(ctx, 90, 850, 900, 470, { r: 44, a: ca });
    T(ctx, '100 gramda', 140, 905, { size: 30, weight: 800, color: C.muted, align: 'left', alpha: ca });
    const row = (label, y, vals, at) => {
      const ra = progress(t, at, at + 0.35);
      const g = progress(t, at + 0.1, at + 0.9, ease.inOut);
      T(ctx, label, 140, y, { size: 40, weight: 900, color: C.ink, align: 'left', alpha: ra });
      vals.forEach(([name, v, col], i) => {
        const yy = y + 58 + i * 52;
        T(ctx, name, 140, yy, { size: 28, weight: 800, color: C.muted, align: 'left', alpha: ra });
        ctx.save();
        ctx.globalAlpha *= ra;
        ctx.fillStyle = col;
        rr(ctx, 290, yy - 16, Math.max(8, 560 * (v / 65) * g), 32, 16);
        ctx.fill();
        ctx.restore();
        T(ctx, `${v} g`, 300 + Math.max(8, 560 * (v / 65) * g), yy + 1, { size: 30, weight: 900, color: col, align: 'left', alpha: ra * g });
      });
    };
    row('yağ', 975, [['ceviz', 65, '#c8955a'], ['kestane', 2, C.teal]], cue('c-starch', 3));
    row('karbonhidrat', 1155, [['ceviz', 14, '#c8955a'], ['kestane', 44, C.teal]], cue('c-starch', 4));
    // pişince yumuşar
    const ya = progress(t, cue('c-starch', 4) + 0.9, cue('c-starch', 4) + 1.3);
    T(ctx, 'bu yüzden pişince yumuşar', 540, 1400, { hand: true, size: 66, weight: 700, color: C.teal, alpha: ya });
    wisps(ctx, 540, 560, t, ya * 0.8, 3, 40);
  };

  draw['c-cta'] = function (ctx, t, api) {
    api.cta(ctx, t, { invite: 'Hangi sırrı merak ediyorsun?' });
  };

  // ---------------------------------------------------------------------------
  // Ses
  // ---------------------------------------------------------------------------
  function score(m, hz, api) {
    const { cue, end, S0 } = api;
    const bell = (t, n, g = 0.06, pan = 0) => m.bell(t, { freq: hz(n), gain: g, decay: 2.4, pan });
    const popS = (t, n, g = 0.04, pan = 0) => m.pop(t, { freq: hz(n), gain: g, pan });
    // 1 · ateş, titreme, patlama
    const tb1 = Math.max(1.2, end('c-hook') - 0.35);
    m.crackle(0, S0('c-water') + 0.3, { gain: 0.16, density: 30, roar: 0.25 });
    for (let x = 0.2; x < tb1; x += 0.12) m.tick(x, { gain: 0.02 + 0.03 * (x / tb1), tone: 2600 });
    m.boom(tb1, { gain: 0.35, freq: 70 });
    m.click(tb1, { gain: 0.3, tone: 1800 });
    m.whoosh(tb1 + 0.02, { dur: 0.8, from: 3000, to: 600, gain: 0.08 });
    // 2 · su ve buhar
    m.blip(cue('c-water', 0) + 0.1, { freq: 520, dur: 0.6, slide: 300, gain: 0.03 });
    m.whoosh(cue('c-water', 1) + 0.5, { dur: 1.8, from: 400, to: 5000, gain: 0.07 });
    popS(cue('c-water', 1) + 1.4, 'A5', 0.06);
    // 3 · basınç ve patlama
    const tb3 = end('c-press') - 0.3;
    m.riser(cue('c-press', 1), Math.max(0.5, tb3 - cue('c-press', 1)), { gain: 0.07 });
    m.boom(tb3, { gain: 0.38, freq: 65 });
    m.click(tb3, { gain: 0.3, tone: 1600 });
    m.crackle(tb3, 0.6, { gain: 0.15, density: 50, roar: 0.1 });
    // 4 · bıçak, buhar, onaylar
    m.click(cue('c-cross', 0) + 0.2, { gain: 0.1, tone: 5200 });
    m.click(cue('c-cross', 0) + 0.65, { gain: 0.1, tone: 5200 });
    m.whoosh(cue('c-cross', 1), { dur: 1.2, from: 2500, to: 6000, gain: 0.05 });
    popS(cue('c-cross', 2), 'D5', 0.05, -0.3);
    popS(cue('c-cross', 3), 'F#5', 0.05, 0.3);
    // 5 · karşılaştırma
    bell(cue('c-starch', 0), 'B5', 0.05);
    m.blip(cue('c-starch', 1), { freq: 240, dur: 0.2, gain: 0.03 });
    popS(cue('c-starch', 2), 'E5', 0.05);
    popS(cue('c-starch', 3), 'C#5', 0.04);
    popS(cue('c-starch', 4), 'E5', 0.04);
  }

  window.FILM = K.short({
    title: 'Kestane ateşte neden patlar? · YUP Akademi',
    series: 'TABAĞINDAKİ BİLİM',
    gap: 0.15,
    breath: 0.25,
    wipe: 0.4,
    extra: { 'c-hook': 0.45, 'c-water': 0.9, 'c-press': 0.55, 'c-cross': 0.4, 'c-starch': 1.2, 'c-cta': 2.3 },
    lead: { 'c-hook': 0.1, 'c-water': 0.2, 'c-press': 0.2, 'c-cross': 0.2, 'c-starch': 0.2, 'c-cta': 0.3 },
    titles: {
      'c-hook': 'Buhar bombası',
      'c-water': 'Yarısı su',
      'c-press': 'Basınç',
      'c-cross': 'Çarpı',
      'c-starch': 'Patatese benzer',
      'c-cta': 'YUP Akademi',
    },
    chords: {
      'c-hook': ['D3', 'A3', 'F#4', 'C#5'],
      'c-water': ['B2', 'F#3', 'D4', 'A4'],
      'c-press': ['G2', 'D3', 'B3', 'F#4'],
      'c-cross': ['E3', 'B3', 'G4', 'D5'],
      'c-starch': ['A2', 'E3', 'C#4', 'G#4'],
      'c-cta': ['D3', 'A3', 'F#4', 'A4'],
    },
    draw,
    score,
  });
})();
