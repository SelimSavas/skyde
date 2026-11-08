/*
 * Dikey kısa videolar için ortak çizim parçaları (lamba, kutu, etiket, işaretler).
 * Kısa videonun kendi çizdiği sahneler (kisa.js'teki draw çekimleri) bunları kullanır; renkler kursun paletidir.
 */
(function (root) {
  'use strict';

  const E = root.Engine;
  const { clamp, glow, text } = E;

  const P = {
    cream: '#f3ede1',
    muted: '#9aa3b8',
    dim: '#4d566b',
    line: '#2a3450',
    wire: '#3a4664',
    panel: '#0d1424',
    fire: '#ffa547',
    flame: '#ffd27a',
    digi: '#7cc8ff',
    error: '#ff5468',
    ok: '#7fe0a3',
    ink: '#05070d',
  };
  const FIRE = [255, 165, 71];

  // Ampul: a görünürlük, on 0..1 yanıklık
  function bulb(ctx, x, y, r, a = 1, on = 0) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    if (on > 0) glow(ctx, x, y, r * 3.2, FIRE, 0.42 * on);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#141b2b';
    ctx.fill();
    if (on > 0) {
      const g = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.1, x, y, r);
      g.addColorStop(0, `rgba(255,226,160,${on})`);
      g.addColorStop(0.55, `rgba(255,165,71,${on})`);
      g.addColorStop(1, `rgba(232,84,26,${on})`);
      ctx.fillStyle = g;
      ctx.fill();
    }
    ctx.lineWidth = Math.max(2, r * 0.075);
    ctx.strokeStyle = on > 0.5 ? 'rgba(255,190,120,0.9)' : P.wire;
    ctx.stroke();
    ctx.fillStyle = P.line;
    ctx.fillRect(x - r * 0.38, y + r * 0.95, r * 0.76, r * 0.3);
    ctx.restore();
  }

  // Yuvarlatılmış kutu
  function box(ctx, x, y, w, h, { r = 20, fill = P.panel, stroke = P.line, lw = 2, a = 1 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    E.roundRect(ctx, x, y, w, h, r);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.lineWidth = lw;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Ortalanmış hap biçimli etiket
  function pill(ctx, label, x, y, { size = 30, color = P.cream, fill = 'rgba(8,11,20,0.85)', stroke = 'rgba(255,165,71,0.6)', a = 1, weight = 600, pad = 26 } = {}) {
    if (a <= 0.002) return;
    const w = E.measure(ctx, label, { size, weight }) + pad * 2;
    const h = size * 1.9;
    box(ctx, x - w / 2, y - h / 2, w, h, { r: h / 2, fill, stroke, a });
    text(ctx, label, x, y + 1, { size, weight, color, alpha: a });
  }

  function check(ctx, x, y, s, color = P.ok, a = 1, p = 1) {
    if (a <= 0.002 || p <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const pts = [[x - s * 0.45, y], [x - s * 0.12, y + s * 0.32], [x + s * 0.48, y - s * 0.36]];
    const l1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
    const l2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
    const d = p * (l1 + l2);
    ctx.moveTo(...pts[0]);
    if (d <= l1) ctx.lineTo(pts[0][0] + (pts[1][0] - pts[0][0]) * (d / l1), pts[0][1] + (pts[1][1] - pts[0][1]) * (d / l1));
    else {
      ctx.lineTo(...pts[1]);
      const q = (d - l1) / l2;
      ctx.lineTo(pts[1][0] + (pts[2][0] - pts[1][0]) * q, pts[1][1] + (pts[2][1] - pts[1][1]) * q);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Üstü çizili: p 0..1 çizginin ilerlemesi
  function strike(ctx, x0, y, x1, color = P.error, a = 1, p = 1, lw = 6) {
    if (a <= 0.002 || p <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x0 + (x1 - x0) * clamp(p), y);
    ctx.stroke();
    ctx.restore();
  }

  function arrow(ctx, x0, y0, x1, y1, { color = P.muted, lw = 4, head = 16, a = 1, p = 1 } = {}) {
    if (a <= 0.002 || p <= 0) return;
    const x = x0 + (x1 - x0) * p;
    const y = y0 + (y1 - y0) * p;
    const ang = Math.atan2(y1 - y0, x1 - x0);
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - head * Math.cos(ang - 0.45), y - head * Math.sin(ang - 0.45));
    ctx.lineTo(x - head * Math.cos(ang + 0.45), y - head * Math.sin(ang + 0.45));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 4294967296 → "4.294.967.296"
  const dots = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  root.Cizim = { P, FIRE, bulb, box, pill, check, strike, arrow, dots };
})(window);
