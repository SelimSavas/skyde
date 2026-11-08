/*
 * Var ve Yok kısa videosu 3 · Eskiden "ğ" neden bozuk görünürdü?
 * Dikey ekran için çizildi: bozuk ulaşan mesaj (Doğum → Doðum) → harfler sayı olarak gider → ilk liste (128 yer,
 * Türkçe harf yok) → boş yarıya herkes kendi harfini, farklı yere → 240: sende ğ, karşıda ð → Unicode: ğ = 287.
 * Sayılar gerçek kodlardır: ISO 8859-9 (Türkçe) ve ISO 8859-1 (Batı Avrupa) listelerinde 240; Unicode'da U+011F = 287.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { ease, progress, text, vis } = E;
  const { P, box, pill, check, strike, arrow } = Cizim;

  const cueOf = (api) => (id, k = 0) => api.cue(id, k);
  const MSG_OK = 'Doğum günün kutlu olsun!';
  const MSG_BAD = 'Doðum günün kutlu olsun!';

  // Mesaj balonu; bad: bozuk harfi kırmızı işaretle
  function bubble(ctx, msg, x, y, { mine = false, a = 1, bad = false, label = '' } = {}) {
    if (a <= 0.002) return;
    const size = 42;
    const w = E.measure(ctx, msg, { size }) + 64;
    const h = 96;
    const bx = mine ? x - w : x;
    box(ctx, bx, y - h / 2, w, h, { r: 30, fill: mine ? P.fire : '#1b2438', stroke: null, a });
    text(ctx, msg, bx + 32, y + 2, { size, color: mine ? P.ink : P.cream, align: 'left', alpha: a });
    if (bad) {
      const pre = E.measure(ctx, 'Do', { size });
      const cw = E.measure(ctx, 'ð', { size });
      const cx = bx + 32 + pre + cw / 2;
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.strokeStyle = P.error;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, y, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (label) text(ctx, label, mine ? x : x, y - h / 2 - 30, { size: 26, weight: 700, spacing: 4, color: P.muted, align: mine ? 'right' : 'left', alpha: a });
  }

  function hookScene(ctx, t, api) {
    bubble(ctx, MSG_OK, 990, 820, { mine: true, label: 'GÖNDERİLEN' });
    arrow(ctx, 540, 900, 540, 1040, { color: P.muted, a: 0.8 });
    bubble(ctx, MSG_BAD, 90, 1150, { bad: true, label: 'ULAŞAN' });
    const c = cueOf(api);
    pill(ctx, 'ğ  →  ð ?', 540, 1330, { size: 40, weight: 700, color: P.error, stroke: 'rgba(255,84,104,0.7)', a: progress(t, c('t-hook', 1), c('t-hook', 1) + 0.4) });
  }

  // Harfler ve numaraları (Türkçe listede)
  const WORD = [['D', 68], ['o', 111], ['ğ', 240], ['u', 117], ['m', 109]];
  function numScene(ctx, t, api) {
    const c = cueOf(api);
    WORD.forEach(([ch, n], i) => {
      const x = 540 + (i - 2) * 180;
      const a = progress(t, c('t-num', 0) + i * 0.08, c('t-num', 0) + i * 0.08 + 0.4);
      box(ctx, x - 75, 760, 150, 150, { r: 22, fill: P.panel, stroke: i === 2 ? P.fire : P.line, a });
      text(ctx, ch, x, 838, { size: 88, family: 'display', weight: 700, color: P.cream, alpha: a });
      const na = progress(t, c('t-num', 1) - 0.1 + i * 0.1, c('t-num', 1) + 0.3 + i * 0.1);
      arrow(ctx, x, 930, x, 1010, { color: P.dim, a: na, head: 12 });
      text(ctx, String(n), x, 1065, { size: 56, family: 'mono', weight: 700, color: i === 2 ? P.fire : P.digi, alpha: na });
    });
    const ya = progress(t, c('t-num', 2), c('t-num', 2) + 0.5);
    text(ctx, 'yola çıkan:', 540, 1200, { size: 32, family: 'serif', italic: true, color: P.muted, alpha: ya });
    text(ctx, '68  111  240  117  109', 540, 1270, { size: 50, family: 'mono', weight: 700, color: P.cream, alpha: ya });
  }

  // 256 yerlik liste: üst yarı İngilizce (128), alt yarı boş
  const CELL = 46;
  const GX = 540 - 8 * CELL;
  const GY = 650;
  const cellXY = (n) => [GX + (n % 16) * CELL, GY + Math.floor(n / 16) * CELL];
  const TR = { 199: 'Ç', 208: 'Ğ', 214: 'Ö', 220: 'Ü', 221: 'İ', 222: 'Ş', 231: 'ç', 240: 'ğ', 246: 'ö', 252: 'ü', 253: 'ı', 254: 'ş' };
  function tableScene(ctx, t, api) {
    const c = cueOf(api);
    const asciiA = progress(t, c('t-ascii', 0), c('t-ascii', 0) + 0.6);
    const halfA = progress(t, c('t-half', 0) - 0.2, c('t-half', 0) + 0.5);
    // üst yarı: İngilizce liste
    for (let n = 32; n < 128; n++) {
      const [x, y] = cellXY(n);
      const ch = String.fromCharCode(n);
      const letter = /[A-Za-z]/.test(ch);
      box(ctx, x + 2, y + 2, CELL - 4, CELL - 4, { r: 6, fill: letter ? 'rgba(124,200,255,0.12)' : 'rgba(42,52,80,0.35)', stroke: null, a: asciiA });
      text(ctx, ch, x + CELL / 2, y + CELL / 2 + 1, { size: 24, family: 'mono', color: letter ? P.cream : P.muted, alpha: asciiA });
    }
    for (let n = 0; n < 32; n++) {
      const [x, y] = cellXY(n);
      box(ctx, x + 2, y + 2, CELL - 4, CELL - 4, { r: 6, fill: 'rgba(42,52,80,0.25)', stroke: null, a: asciiA });
    }
    text(ctx, 'İLK LİSTE · 128 YER', 540, GY - 36, { size: 26, weight: 700, spacing: 5, color: P.muted, alpha: asciiA });
    // Türkçe harfler: listede yok
    const missA = progress(t, c('t-ascii', 1), c('t-ascii', 1) + 0.5) * (1 - halfA);
    ['ç', 'ğ', 'ı', 'İ', 'ö', 'ş', 'ü'].forEach((ch, i) => {
      const x = 540 + (i - 3) * 120;
      box(ctx, x - 45, 1150, 90, 90, { r: 16, fill: P.panel, stroke: 'rgba(255,84,104,0.6)', a: missA });
      text(ctx, ch, x, 1196, { size: 56, family: 'display', weight: 700, color: P.cream, alpha: missA });
      strike(ctx, x - 40, 1196, x + 40, P.error, missA, progress(t, c('t-ascii', 1) + 0.3 + i * 0.06, c('t-ascii', 1) + 0.6 + i * 0.06));
    });
    text(ctx, 'listede yok', 540, 1300, { size: 34, family: 'serif', italic: true, color: P.error, alpha: missA });
    // alt yarı: boş 128 yer
    if (halfA > 0) {
      for (let n = 128; n < 256; n++) {
        const [x, y] = cellXY(n);
        box(ctx, x + 2, y + 2, CELL - 4, CELL - 4, { r: 6, fill: 'rgba(255,165,71,0.07)', stroke: 'rgba(255,165,71,0.25)', lw: 1, a: halfA });
      }
      text(ctx, 'BOŞ YARI · 128 YER', 540, GY + 16 * CELL + 36, { size: 26, weight: 700, spacing: 5, color: P.fire, alpha: halfA * (1 - progress(t, c('t-half', 1), c('t-half', 1) + 0.4)) });
      // "kendi harflerini koydu": Türkçe harfler yerlerine
      const trA = progress(t, c('t-half', 1), c('t-half', 1) + 0.6);
      for (const [n, ch] of Object.entries(TR)) {
        const [x, y] = cellXY(+n);
        text(ctx, ch, x + CELL / 2, y + CELL / 2 + 1, { size: 26, family: 'display', weight: 700, color: P.fire, alpha: trA });
      }
      // "ama herkes farklı yere": 240 numaralı göz büyür, iki listenin harfi gösterilir
      const fA = progress(t, c('t-half', 2), c('t-half', 2) + 0.5);
      if (fA > 0) {
        const [x, y] = cellXY(240);
        box(ctx, x - 2, y - 2, CELL + 4, CELL + 4, { r: 8, fill: null, stroke: P.fire, lw: 4, a: fA });
        text(ctx, '240', x - 14, y + CELL / 2, { size: 24, family: 'mono', weight: 700, color: P.fire, align: 'right', alpha: fA });
        pill(ctx, 'Türkçe liste: ğ', 330, GY + 16 * CELL + 40, { size: 30, weight: 700, color: P.fire, a: fA });
        pill(ctx, 'Batı Avrupa: ð', 760, GY + 16 * CELL + 40, { size: 30, weight: 700, color: P.error, stroke: 'rgba(255,84,104,0.7)', a: fA * progress(t, c('t-half', 2) + 0.4, c('t-half', 2) + 0.8) });
      }
    }
  }

  // Aynı sayı, iki sözlük
  function dictScene(ctx, t, api) {
    const c = cueOf(api);
    const a0 = progress(t, c('t-240', 0) - 0.1, c('t-240', 0) + 0.4);
    const a1 = progress(t, c('t-240', 2) - 0.1, c('t-240', 2) + 0.4);
    text(ctx, '240', 540, 720, { size: 110, family: 'mono', weight: 700, color: P.cream, alpha: a0 });
    arrow(ctx, 470, 790, 300, 900, { color: P.fire, a: a0, p: progress(t, c('t-240', 0) + 0.2, c('t-240', 0) + 0.6) });
    arrow(ctx, 610, 790, 780, 900, { color: P.error, a: a1, p: progress(t, c('t-240', 2), c('t-240', 2) + 0.4) });
    box(ctx, 80, 920, 420, 300, { r: 26, fill: P.panel, stroke: P.fire, a: a0 });
    text(ctx, 'SENDEKİ LİSTE', 290, 975, { size: 24, weight: 700, spacing: 4, color: P.muted, alpha: a0 });
    text(ctx, 'ğ', 290, 1110, { size: 150, family: 'display', weight: 700, color: P.fire, alpha: progress(t, c('t-240', 1) - 0.1, c('t-240', 1) + 0.4) });
    box(ctx, 580, 920, 420, 300, { r: 26, fill: P.panel, stroke: P.error, a: a1 });
    text(ctx, 'KARŞIDAKİ LİSTE', 790, 975, { size: 24, weight: 700, spacing: 4, color: P.muted, alpha: a1 });
    text(ctx, 'ð', 790, 1110, { size: 150, family: 'display', weight: 700, color: P.error, alpha: a1 });
    bubble(ctx, MSG_BAD, 540 - E.measure(ctx, MSG_BAD, { size: 42 }) / 2 - 32, 1350, { bad: true, a: progress(t, c('t-240', 2) + 0.6, c('t-240', 2) + 1.1) });
  }

  // Unicode: tek dev liste
  const UNI = [['A', 65], ['ğ', 287], ['Ω', 937], ['Ж', 1046], ['€', 8364]];
  function uniScene(ctx, t, api) {
    const c = cueOf(api);
    const la = progress(t, c('t-uni', 0) - 0.1, c('t-uni', 0) + 0.5);
    box(ctx, 190, 680, 700, 560, { r: 28, fill: P.panel, stroke: P.line, a: la });
    text(ctx, 'UNICODE · TEK LİSTE', 540, 730, { size: 26, weight: 700, spacing: 5, color: P.digi, alpha: la });
    UNI.forEach(([ch, n], i) => {
      const y = 810 + i * 92;
      const a = progress(t, c('t-uni', 1) + i * 0.18, c('t-uni', 1) + i * 0.18 + 0.4);
      const hi = ch === 'ğ';
      const ha = hi ? progress(t, c('t-uni', 3) - 0.1, c('t-uni', 3) + 0.4) : 0;
      if (ha > 0) box(ctx, 220, y - 40, 640, 80, { r: 16, fill: 'rgba(255,165,71,0.14)', stroke: 'rgba(255,165,71,0.6)', a: ha * a });
      text(ctx, ch, 330, y, { size: 60, family: 'display', weight: 700, color: hi && ha > 0.5 ? P.fire : P.cream, alpha: a });
      text(ctx, String(n), 720, y, { size: 50, family: 'mono', weight: 700, color: hi && ha > 0.5 ? P.fire : P.digi, align: 'right', alpha: a });
    });
    const ok = progress(t, c('t-uni', 4) + 0.2, c('t-uni', 4) + 0.7);
    bubble(ctx, MSG_OK, 990, 1350, { mine: true, a: ok });
    check(ctx, 140, 1350, 56, P.ok, ok, progress(t, c('t-uni', 4) + 0.5, c('t-uni', 4) + 1.0));
  }

  function finaleScene(ctx, t, { start }) {
    const a = progress(t, start, start + 0.8);
    pill(ctx, 'ğ = 287, her yerde', 540, 1470, { size: 34, weight: 700, color: P.fire, a });
  }

  const pops = (id, ks, notes) => (m, hz, s) => ks.forEach((k, i) => m.pop(s.api.cue(id, k), { freq: hz(notes[i % notes.length]), gain: 0.07 }));

  window.FILM = Kisa.short({
    title: 'Kısa · Eskiden ğ neden bozuk görünürdü?',
    pad: ['C2', 'G2', 'E3', 'B3'],
    teaser: [],
    pause: { 't-hook': 0.4, 't-240': 0.4, 't-uni': 0.5 },
    shots: {
      't-hook': [{ draw: hookScene, sound: (m, hz, s) => m.buzz(s.api.cue('t-hook', 1), { gain: 0.06, dur: 0.25 }) }],
      't-num': [{ draw: numScene, sound: pops('t-num', [1, 2], ['C5', 'G5']) }],
      't-ascii': [{ draw: tableScene, sound: (m, hz, s) => m.buzz(s.api.cue('t-ascii', 1) + 0.3, { gain: 0.05, dur: 0.3 }) }],
      't-half': [{ draw: tableScene, sound: pops('t-half', [1, 2], ['E5', 'B4']) }],
      't-240': [{ draw: dictScene, sound: (m, hz, s) => { m.pop(s.api.cue('t-240', 1), { freq: hz('E5'), gain: 0.07 }); m.buzz(s.api.cue('t-240', 2), { gain: 0.06, dur: 0.3 }); } }],
      't-uni': [{
        draw: uniScene,
        sound: (m, hz, s) => {
          for (let i = 0; i < 5; i++) m.tick(s.api.cue('t-uni', 1) + i * 0.18, { gain: 0.04, tone: 2600 + i * 120 });
          m.bell(s.api.cue('t-uni', 3), { freq: hz('E5'), gain: 0.08, decay: 2.4 });
          m.bell(s.api.cue('t-uni', 4) + 0.5, { freq: hz('B5'), gain: 0.07, decay: 2.4 });
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
