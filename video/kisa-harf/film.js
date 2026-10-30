/*
 * Öğretici kısa video · A harfi aslında bir sayı (Birinci Kapı: Var ve Yok).
 * İlk üç çekim Birinci Kapı filminden yeniden çizilir; bayt (sekiz lamba, 64 + 1 = 65) ve MERHABA'nın
 * bitleri dikey ekran için burada çizilir, böylece sayılar telefonda da rahat okunur.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, ease, progress, text, glow } = E;
  const C = { ...Kisa.C, digi: '#7cc8ff', dim: '#4d566b', line: '#2a3450' };
  const FIRE = [255, 165, 71];
  const VALUES = [128, 64, 32, 16, 8, 4, 2, 1];
  const A_BITS = '01000001';
  const lampX = (i) => 540 + (i - 3.5) * 118;
  const LAMP_Y = 900;

  function bulb(ctx, x, y, a, on) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    if (on > 0) glow(ctx, x, y, 130, FIRE, 0.45 * on);
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fillStyle = '#141b2b';
    ctx.fill();
    if (on > 0) {
      const g = ctx.createRadialGradient(x - 10, y - 12, 4, x, y, 40);
      g.addColorStop(0, `rgba(255,226,160,${on})`);
      g.addColorStop(0.55, `rgba(255,165,71,${on})`);
      g.addColorStop(1, `rgba(232,84,26,${on})`);
      ctx.fillStyle = g;
      ctx.fill();
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = on > 0.5 ? 'rgba(255,190,120,0.9)' : '#3a4664';
    ctx.stroke();
    ctx.fillStyle = '#2a3450';
    ctx.fillRect(x - 15, y + 38, 30, 12);
    ctx.restore();
  }

  // Bayt: lambalar belirir, değerler sağdan sola yazılır; sonra 64 ve 1 yanar, toplam ve A
  function byteScene(ctx, t, { cue, end }) {
    const b0 = cue('h-byte', 0);
    const v0 = cue('h-byte', 1);
    const step = Math.max(0.2, (end('h-byte') - v0) / 8);
    const s0 = cue('h-sum', 0);
    text(ctx, '8 bit = 1 bayt', 540, 690, { size: 42, weight: 600, color: C.muted, alpha: progress(t, b0 + 0.6, b0 + 1.2) });
    VALUES.forEach((v, i) => {
      const x = lampX(i);
      const appear = progress(t, b0 + i * 0.06, b0 + i * 0.06 + 0.5);
      const tv = v0 + (7 - i) * step;
      const lit = (i === 1 ? progress(t, s0 + 0.15, s0 + 0.55) : 0) + (i === 7 ? progress(t, s0 + 0.95, s0 + 1.35) : 0);
      text(ctx, String(v), x, 800, { size: 34, family: 'mono', weight: 700, color: lit > 0.5 ? C.fire : C.cream, alpha: progress(t, tv, tv + 0.35) });
      bulb(ctx, x, LAMP_Y, appear, lit);
      const bit = A_BITS[i];
      text(ctx, bit, x, 990, { size: 44, family: 'mono', weight: 700, color: bit === '1' ? C.fire : C.dim, alpha: progress(t, s0 + 1.4 + i * 0.04, s0 + 1.8 + i * 0.04) });
    });
    // 64 + 1 = 65
    const sa = progress(t, cue('h-sum', 1) - 0.1, cue('h-sum', 1) + 0.35);
    E.runs(ctx, [
      ['64', { size: 88, family: 'display', weight: 700, color: C.fire }],
      [' + ', { size: 88, family: 'display', weight: 700, color: C.muted }],
      ['1', { size: 88, family: 'display', weight: 700, color: C.fire }],
      [' = ', { size: 88, family: 'display', weight: 700, color: C.muted }],
      ['65', { size: 88, family: 'display', weight: 700, color: C.cream }],
    ], 540, 1150, { alpha: sa });
    const aa = progress(t, cue('h-sum', 2) - 0.1, cue('h-sum', 2) + 0.4);
    if (aa > 0) glow(ctx, 540, 1320, 160, FIRE, 0.25 * aa);
    text(ctx, 'A', 540, 1330, { size: 190, family: 'serif', color: C.cream, alpha: aa });
  }

  function byteSound(m, hz, s) {
    const { cue } = s.api;
    if (s.lineId === 'h-byte') {
      for (let i = 0; i < 8; i++) m.tick(cue('h-byte', 0) + i * 0.06, { gain: 0.03, tone: 2400 + i * 80 });
      return;
    }
    const s0 = cue('h-sum', 0);
    m.pop(s0 + 0.15, { freq: hz('E5'), gain: 0.08 });
    m.pop(s0 + 0.95, { freq: hz('B5'), gain: 0.08 });
    m.bell(cue('h-sum', 1), { freq: hz('E5'), gain: 0.06, decay: 2 });
    m.bell(cue('h-sum', 2), { freq: hz('B5'), gain: 0.08, decay: 2.6 });
  }

  // MERHABA: her harf, numarası ve bitleri alt alta
  const WORD = 'MERHABA';
  function wordScene(ctx, t, { cue, end }) {
    const a0 = cue('h-msg', 0);
    const step = Math.max(0.25, (end('h-msg') - a0) / 8);
    const ha = progress(t, a0 - 0.3, a0 + 0.2);
    [['HARF', 230], ['SAYI', 400], ['BELLEKTE', 530 + 3.5 * 47 + 12]].forEach(([s, x]) => text(ctx, s, x, 610, { size: 26, weight: 600, spacing: 5, color: C.muted, alpha: ha }));
    [...WORD].forEach((ch, k) => {
      const y = 690 + k * 112;
      const a = progress(t, a0 + k * step, a0 + k * step + 0.4);
      if (a <= 0) return;
      const code = ch.charCodeAt(0);
      const bits = code.toString(2).padStart(8, '0');
      if (ch === 'A') {
        ctx.save();
        ctx.globalAlpha *= a;
        E.roundRect(ctx, 150, y - 50, 780, 100, 18);
        ctx.fillStyle = 'rgba(255,165,71,0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,165,71,0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
      text(ctx, ch, 230, y + 4, { size: 72, family: 'display', weight: 700, color: C.cream, alpha: a });
      text(ctx, String(code), 400, y + 4, { size: 56, family: 'mono', weight: 700, color: C.digi, alpha: a });
      [...bits].forEach((b, i) => text(ctx, b, 530 + i * 47, y + 4, { size: 46, family: 'mono', weight: 700, color: b === '1' ? C.fire : C.dim, align: 'left', alpha: a }));
    });
  }
  function wordSound(m, hz, s) {
    const { cue, end } = s.api;
    const a0 = cue('h-msg', 0);
    const step = Math.max(0.25, (end('h-msg') - a0) / 8);
    for (let k = 0; k < WORD.length; k++) m.click(a0 + k * step, { gain: 0.05, tone: 1500 + k * 120 });
  }

  // Bitiş kartının arkası: A'nın bitleri, kartın altında küçük bir lamba dizisi
  function finaleScene(ctx, t, { start }) {
    const a = progress(t, start, start + 0.8);
    ctx.save();
    ctx.translate(540, 1470);
    ctx.scale(0.6, 0.6);
    ctx.translate(-540, -LAMP_Y);
    VALUES.forEach((v, i) => bulb(ctx, lampX(i), LAMP_Y, a, A_BITS[i] === '1' ? a : 0));
    ctx.restore();
  }

  window.FILM = Kisa.short({
    title: 'Kısa · A harfi aslında bir sayı',
    pad: ['D2', 'A2', 'F#3', 'C#4'],
    teaser: [],
    pause: { 'h-hook': 0.3, 'h-sum': 0.8, 'h-msg': 0.4 },
    shots: {
      'h-hook': [{ src: (c) => c('letters-question', 0) + 1.6, view: [960, 480, 1000], crop: [300, 1080] }],
      'h-bits': [{ src: (c) => c('why-bit', 0) + 0.3, view: [960, 420, 1250], crop: [150, 1080] }],
      'h-code': [{ src: (c) => c('letters-cards', 0) - 2.2, view: [960, 480, 1300], crop: [150, 1080] }],
      'h-byte': [{ draw: byteScene, sound: byteSound, lineId: 'h-byte' }],
      'h-sum': [{ draw: byteScene, sound: byteSound, lineId: 'h-sum' }],
      'h-msg': [{ draw: wordScene, sound: wordSound }],
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
