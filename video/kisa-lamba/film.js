/*
 * Var ve Yok kısa videosu 2 · 32 lambayla kaç farklı durum kurulur?
 * Dikey ekran için çizildi: 32 lambalık ızgara (soru) → tek lamba, 2 durum → iki lamba, 4 durum →
 * her yeni lamba ikiye katlar (8, 16, 32) → 8 lamba sayarak 256'ya (1 bayt) → 32 lamba, 4.294.967.296 (cevap).
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, ease, progress, noise, text } = E;
  const { P, bulb, pill, dots } = Cizim;

  const cueOf = (api) => (id, k = 0) => api.cue(id, k);

  // 32 lambalık ızgara (8 × 4)
  const gridX = (i) => 540 + ((i % 8) - 3.5) * 112;
  const gridY = (i) => 860 + Math.floor(i / 8) * 128;

  function hookScene(ctx, t, api) {
    const c = cueOf(api);
    for (let i = 0; i < 32; i++) {
      // her lamba kendi ritmiyle yanıp söner: olası durumların bir kısmını gezinir
      const on = noise(t * 1.6 + i * 3.7, 11) > 0.52 ? 1 : 0;
      bulb(ctx, gridX(i), gridY(i), 36, 1, on);
    }
    text(ctx, '32 lamba', 540, 1330, { size: 40, weight: 600, color: P.muted });
    const q = progress(t, c('l-hook', 0) + 0.4, c('l-hook', 0) + 1.0);
    E.runs(ctx, [
      ['= ', { size: 76, family: 'display', weight: 700, color: P.muted }],
      ['?', { size: 96, family: 'display', weight: 700, color: P.fire }],
      [' durum', { size: 76, family: 'display', weight: 700, color: P.cream }],
    ], 540, 1450, { alpha: q });
  }

  // Tek lamba: sönük = 0, yanık = 1
  function oneScene(ctx, t, api) {
    const c = cueOf(api);
    const aOff = progress(t, c('l-one', 0), c('l-one', 0) + 0.5);
    const aOn = progress(t, c('l-one', 1) + 0.5, c('l-one', 1) + 1.0);
    bulb(ctx, 330, 960, 110, aOff, 0);
    bulb(ctx, 750, 960, 110, aOn, aOn);
    text(ctx, 'sönük', 330, 1150, { size: 40, family: 'serif', italic: true, color: P.muted, alpha: progress(t, c('l-one', 1), c('l-one', 1) + 0.4) });
    text(ctx, 'yanık', 750, 1150, { size: 40, family: 'serif', italic: true, color: P.cream, alpha: aOn });
    const b = progress(t, c('l-one', 2), c('l-one', 2) + 0.4);
    text(ctx, '0', 330, 1250, { size: 96, family: 'mono', weight: 700, color: P.dim, alpha: b });
    text(ctx, '1', 750, 1250, { size: 96, family: 'mono', weight: 700, color: P.fire, alpha: b });
    pill(ctx, '2 durum', 540, 1420, { size: 40, weight: 700, color: P.fire, a: progress(t, c('l-one', 0) + 0.8, c('l-one', 0) + 1.3) });
  }

  // İki lamba: dört satır, söylendikçe
  const PAIRS = [[0, 0], [0, 1], [1, 0], [1, 1]];
  function twoScene(ctx, t, api) {
    const c = cueOf(api);
    PAIRS.forEach(([a, b], k) => {
      const ap = progress(t, c('l-two', 2 + k) - 0.1, c('l-two', 2 + k) + 0.35);
      const y = 730 + k * 150;
      bulb(ctx, 400, y, 50, ap, a * ap);
      bulb(ctx, 540, y, 50, ap, b * ap);
      text(ctx, `${a}${b}`, 720, y, { size: 64, family: 'mono', weight: 700, color: P.cream, alpha: ap });
    });
    pill(ctx, '4 durum', 540, 1400, { size: 40, weight: 700, color: P.fire, a: progress(t, c('l-two', 1), c('l-two', 1) + 0.4) });
  }

  // Her yeni lamba ikiye katlar: 1→2, 2→4, 3→8, 4→16, 5→32
  const ROWS = [[1, 2], [2, 4], [3, 8], [4, 16], [5, 32]];
  function doubleScene(ctx, t, api) {
    const c = cueOf(api);
    ROWS.forEach(([n, states], k) => {
      const at = k < 2 ? c('l-double', 0) + k * 0.25 : c('l-double', k);
      const ap = progress(t, at - 0.1, at + 0.4);
      const y = 700 + k * 150;
      for (let i = 0; i < n; i++) bulb(ctx, 150 + i * 62, y, 22, ap, 0.85 * ap);
      text(ctx, `${n} lamba`, 520, y, { size: 34, family: 'serif', italic: true, color: P.muted, alpha: ap });
      text(ctx, String(states), 900, y, { size: 72, family: 'mono', weight: 700, color: k >= 2 ? P.fire : P.cream, align: 'right', alpha: ap });
      if (k > 0) text(ctx, '×2', 960, y - 75, { size: 28, weight: 700, color: P.fire, alpha: ap });
    });
  }

  // 8 lamba ikili sayarak 255'e çıkar: 256 durum, 1 bayt
  function byteScene(ctx, t, api) {
    const c = cueOf(api);
    const t0 = c('l-byte', 0);
    const run = progress(t, t0 + 0.2, t0 + 2.6, ease.inOut);
    const value = Math.round(255 * run);
    const a = progress(t, t0 - 0.2, t0 + 0.3);
    text(ctx, '8 bit = 1 bayt', 540, 720, { size: 44, weight: 700, color: P.muted, alpha: progress(t, c('l-byte', 1), c('l-byte', 1) + 0.4) });
    for (let i = 0; i < 8; i++) {
      const bit = (value >> (7 - i)) & 1;
      bulb(ctx, 540 + (i - 3.5) * 118, 880, 42, a, bit);
      text(ctx, String(bit), 540 + (i - 3.5) * 118, 980, { size: 44, family: 'mono', weight: 700, color: bit ? P.fire : P.dim, alpha: a });
    }
    text(ctx, String(value), 540, 1140, { size: 120, family: 'mono', weight: 700, color: P.cream, alpha: a });
    text(ctx, '0’dan 255’e: 256 durum', 540, 1270, { size: 40, family: 'serif', italic: true, color: P.fire, alpha: progress(t, t0 + 2.4, t0 + 2.9) });
  }

  // 32 lamba: alt bitler hızla sayar, sayaç 4.294.967.296'ya tırmanır
  function bigScene(ctx, t, api) {
    const c = cueOf(api);
    const t0 = c('l-big', 0);
    const run = progress(t, t0 + 0.2, c('l-big', 1) + 1.2, ease.out);
    const total = 4294967296;
    // logaritmik tırmanış: sayılar basamak basamak büyüsün
    const shown = run >= 1 ? total : Math.round(Math.pow(2, 8 + 24 * run));
    for (let i = 0; i < 32; i++) {
      const bitIndex = 31 - i;
      const on = run >= 1 ? 1 : bitIndex < 8 + 24 * run ? (noise(t * (6 - bitIndex * 0.15) + i, 4) > 0.5 ? 1 : 0) : 0;
      bulb(ctx, gridX(i), gridY(i) - 120, 36, 1, on);
    }
    text(ctx, dots(shown), 540, 1330, { size: 92, family: 'mono', weight: 700, color: run >= 1 ? P.fire : P.cream });
    text(ctx, 'durum', 540, 1430, { size: 40, family: 'serif', italic: true, color: P.muted });
    pill(ctx, '4 milyardan fazla', 540, 640, { size: 34, weight: 700, color: P.fire, a: progress(t, c('l-big', 1), c('l-big', 1) + 0.4) });
  }

  function popSound(id, ks, notes) {
    return (m, hz, s) => ks.forEach((k, i) => m.pop(s.api.cue(id, k), { freq: hz(notes[i % notes.length]), gain: 0.07 }));
  }

  function finaleScene(ctx, t, { start }) {
    const a = progress(t, start, start + 0.8);
    for (let i = 0; i < 8; i++) bulb(ctx, 540 + (i - 3.5) * 74, 1480, 24, a, [1, 0, 1, 1, 0, 0, 1, 0][i] * a);
  }

  window.FILM = Kisa.short({
    title: 'Kısa · 32 lambayla kaç durum kurulur?',
    pad: ['E2', 'B2', 'G#3', 'D#4'],
    teaser: [],
    pause: { 'l-hook': 0.4, 'l-byte': 0.6, 'l-big': 0.5 },
    shots: {
      'l-hook': [{ draw: hookScene }],
      'l-one': [{ draw: oneScene, sound: popSound('l-one', [0, 1], ['E4', 'B4']) }],
      'l-two': [{ draw: twoScene, sound: popSound('l-two', [2, 3, 4, 5], ['E4', 'G#4', 'B4', 'E5']) }],
      'l-double': [{ draw: doubleScene, sound: popSound('l-double', [2, 3, 4], ['B4', 'E5', 'G#5']) }],
      'l-byte': [{
        draw: byteScene,
        sound: (m, hz, s) => {
          const t0 = s.api.cue('l-byte', 0);
          for (let k = 0; k < 16; k++) m.tick(t0 + 0.2 + k * 0.15, { gain: 0.03, tone: 2200 + k * 90 });
          m.bell(t0 + 2.6, { freq: hz('E5'), gain: 0.08, decay: 2.2 });
        },
      }],
      'l-big': [{
        draw: bigScene,
        sound: (m, hz, s) => {
          m.riser(s.api.cue('l-big', 0) + 0.2, 2, { gain: 0.04 });
          m.boom(s.api.cue('l-big', 1), { gain: 0.18 });
          m.bell(s.api.cue('l-big', 1) + 0.05, { freq: hz('B5'), gain: 0.08, decay: 2.6 });
        },
      }],
    },
    finale: { draw: finaleScene },
    card: {
      kicker: 'DEVAMI KANALDA',
      title: ['Birinci Kapı:', 'Var ve Yok'],
      sub: 'Bilişim Teknolojileri Yetkinliği · İki Simgeli Bir Evren',
      button: '▶  Videonun devamını izle',
    },
  });
})();
