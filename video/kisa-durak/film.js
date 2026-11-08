/*
 * Öğretici kısa video · Mesajın beş durağı (Önsöz'ün 1. ve 2. bölümlerinden).
 * Her durak Önsöz'deki kendi sahnesiyle gösterilir; altyazının altında beş noktalı bir durak göstergesi
 * izleyicinin yolun neresinde olduğunu söyler.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { progress, ease, text } = E;
  const C = Kisa.C;
  const STEPS = [
    ['d-1', 'BİTLER'],
    ['d-2', 'WI-FI'],
    ['d-3', 'FİBER'],
    ['d-4', 'YÖNLENDİRİCİ'],
    ['d-5', 'ŞİFRE'],
  ];
  const dotX = (i) => 540 + (i - 2) * 120;
  const ROW_Y = 650;

  // Durak göstergesi: geçilen duraklar dolu, şimdiki durak turuncu ve adıyla
  function overlay(ctx, t, { line, scene }) {
    const cur = STEPS.findIndex(([id]) => id === line.id);
    const done = line.id === 'd-fast' ? STEPS.length : cur;
    if (cur < 0 && done !== STEPS.length) return;
    const a = cur === 0 ? progress(t, scene.start, scene.start + 0.5, ease.inOut) : 1;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = 'rgba(154,163,184,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(dotX(0), ROW_Y);
    ctx.lineTo(dotX(4), ROW_Y);
    ctx.stroke();
    if (done > 0) {
      ctx.strokeStyle = C.fire;
      ctx.beginPath();
      ctx.moveTo(dotX(0), ROW_Y);
      ctx.lineTo(dotX(Math.min(done, 4)), ROW_Y);
      ctx.stroke();
    }
    STEPS.forEach((_, i) => {
      const active = i === cur;
      const passed = i < done || active;
      ctx.beginPath();
      ctx.arc(dotX(i), ROW_Y, active ? 17 : 12, 0, Math.PI * 2);
      ctx.fillStyle = passed ? C.fire : '#0b1020';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = passed ? C.fire : 'rgba(154,163,184,0.6)';
      ctx.stroke();
      text(ctx, String(i + 1), dotX(i), ROW_Y + 1, { size: active ? 20 : 16, weight: 700, color: passed ? C.ink : C.muted });
    });
    ctx.restore();
    const label = cur >= 0 ? `DURAK ${cur + 1} · ${STEPS[cur][1]}` : 'BEŞ DURAK';
    text(ctx, label, 540, ROW_Y - 48, { size: 26, weight: 700, spacing: 6, color: C.fire, alpha: a });
  }

  window.FILM = Kisa.short({
    title: 'Kısa · Mesajın beş durağı',
    pad: ['F2', 'C3', 'A3', 'E4'],
    teaser: [],
    dy: 1090,
    pause: { 'd-hook': 0.3, 'd-fast': 0.5 },
    overlay,
    shots: {
      'd-hook': [{ src: (c) => c('night-send', 1) - 4.6, view: [1185, 430, 700] }], // "0,1 sn" yazısı d-fast'e kalsın
      'd-1': [{ src: (c) => c('jr-switch', 2), view: [1245, 470, 860], crop: [150, 1080] }],
      'd-2': [{ src: (c) => c('jr-wifi', 0) + 0.3, view: [925, 620, 1220], crop: [150, 1080] }],
      'd-3': [{ src: (c) => c('jr-fiber', 1), view: [925, 660, 1000], crop: [150, 1080] }],
      'd-4': [{ src: (c) => c('jr-routers', 1), view: [975, 580, 1400], crop: [150, 1080] }],
      'd-5': [{ src: (c) => c('jr-lock', 0), view: [975, 520, 1320], rate: 1.3, crop: [150, 1080] }],
      'd-fast': [{ src: (c) => c('night-send', 1) + 0.3, view: [1080, 400, 820] }],
    },
    card: { kicker: 'DEVAMI KANALDA', button: '▶  Videonun devamını izle' },
  });
})();
