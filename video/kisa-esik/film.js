/*
 * Var ve Yok kısa videosu 1 · Bilgisayar neden sadece 0 ve 1 ile sayar?
 * Dikey ekran için çizildi. Tek bir gerilim grafiği satırdan satıra gelişir: sakin gerilim → oynayan gerilim →
 * on seviyede 7'nin 8'e kayması → tek eşik çizgisi ve okunan bitler → daha çok oynasa da bitler değişmez.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, ease, progress, noise, text, vis } = E;
  const { P, box, pill, check, strike } = Cizim;

  // Grafik kutusu ve gerilim → y eşlemesi (0–5 V)
  const G = { x: 90, y: 700, w: 900, h: 600 };
  const VMAX = 5;
  const vy = (v) => G.y + G.h - 30 - (v / VMAX) * (G.h - 60);
  const WINDOW = 3; // grafikte görünen geçmiş (sn)
  const TRACE_X1 = G.x + G.w - 120; // sağda 1/0 ve seviye etiketlerine yer kalsın
  const BIT = 0.6; // eşik bölümündeki bir bitin süresi (sn)
  const BITS = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0];

  let api = null; // cue/end, ilk çizimde dolar (bütün satırlarınki aynı)
  const cue = (id, k = 0) => api.cue(id, k);

  // Zaman τ'daki gerilim: bölümlere göre gürültü genliği ve taban değişir
  function volt(tau) {
    const tTwo = cue('e-two', 0) - 0.4;
    const amp =
      tau < cue('e-wobble', 0) ? 0.04
        : tau < cue('e-ten', 0) ? 0.04 + 0.28 * progress(tau, cue('e-wobble', 0), cue('e-wobble', 0) + 1.6)
          : tau < cue('e-safe', 0) ? 0.32
            : 0.32 + 0.22 * progress(tau, cue('e-safe', 0), cue('e-safe', 0) + 1.2);
    let base = 3.75; // 7. seviyenin ortası
    // e-ten: "küçük bir oynama" sözünde gerilim bir an 8. seviyeye taşar
    const bump = cue('e-ten', 1) + 0.35;
    base += 0.45 * Math.exp(-(((tau - bump) / 0.22) ** 2));
    if (tau > tTwo) {
      const k = Math.floor((tau - tTwo) / BIT);
      const bit = BITS[((k % BITS.length) + BITS.length) % BITS.length];
      const prev = BITS[(((k - 1) % BITS.length) + BITS.length) % BITS.length];
      const f = clamp(((tau - tTwo) - k * BIT) / 0.06);
      const lvl = (b) => (b ? 4.2 : 0.8);
      const sq = lvl(prev) + (lvl(bit) - lvl(prev)) * f;
      base = base + (sq - base) * progress(tau, tTwo, tTwo + 0.3);
    }
    const n = (noise(tau * 7, 3) - 0.5) * 2 * 0.7 + (noise(tau * 23, 9) - 0.5) * 2 * 0.3;
    return clamp(base + n * amp, 0.05, VMAX - 0.05);
  }

  function panel(ctx, t, a, labelsA = 1) {
    box(ctx, G.x, G.y, G.w, G.h, { r: 24, fill: 'rgba(13,20,36,0.92)', stroke: P.line, a });
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = 'rgba(42,52,80,0.6)';
    ctx.lineWidth = 1;
    for (let v = 1; v < VMAX; v++) {
      ctx.beginPath();
      ctx.moveTo(G.x + 70, vy(v));
      ctx.lineTo(G.x + G.w - 20, vy(v));
      ctx.stroke();
      text(ctx, `${v} V`, G.x + 40, vy(v), { size: 20, family: 'mono', color: P.dim, alpha: labelsA });
    }
    ctx.restore();
    text(ctx, 'TELDEKİ GERİLİM', G.x + 30, G.y - 34, { size: 24, weight: 700, spacing: 5, color: P.muted, align: 'left', alpha: a });
  }

  function trace(ctx, t, a, color = P.digi) {
    const x0 = G.x + 80;
    const x1 = TRACE_X1;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.beginPath();
    ctx.rect(x0, G.y, x1 - x0, G.h);
    ctx.clip();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 3) {
      const tau = t - (1 - (x - x0) / (x1 - x0)) * WINDOW;
      const y = vy(volt(tau));
      if (x === x0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
    // ucun parlak noktası
    const v = volt(t);
    E.glow(ctx, x1, vy(v), 40, [124, 200, 255], 0.6 * a);
  }

  function readout(ctx, t, a) {
    const v = volt(Math.floor(t / 0.12) * 0.12);
    text(ctx, `${v.toFixed(2).replace('.', ',')} V`, G.x + G.w - 40, G.y + 54, { size: 52, family: 'mono', weight: 700, color: P.cream, align: 'right', alpha: a });
  }

  // ---------------------------------------------------------------------------
  // Sahneler
  // ---------------------------------------------------------------------------

  // Açılış: 0–9 rakamları; "yalnızca sıfır ve bir" sözünde 2–9 söner ve çizilir, 0 ile 1 parlar
  function hookScene(ctx, t, a) {
    api = a;
    const k = cue('e-hook', 1);
    const fade = progress(t, k, k + 0.8, ease.inOut);
    for (let d = 0; d < 10; d++) {
      const col = d % 5;
      const row = Math.floor(d / 5);
      const x = 540 + (col - 2) * 180;
      const y = 900 + row * 230;
      const keep = d < 2;
      const color = keep ? (fade > 0.5 ? P.fire : P.cream) : P.cream;
      if (keep && fade > 0) E.glow(ctx, x, y, 140, Cizim.FIRE, 0.35 * fade);
      text(ctx, String(d), x, y, { size: 150, family: 'mono', weight: 700, color, alpha: keep ? 1 : 1 - 0.8 * fade });
      if (!keep) strike(ctx, x - 50, y, x + 50, P.error, 0.9, progress(t, k + 0.15 + (d - 2) * 0.05, k + 0.55 + (d - 2) * 0.05));
    }
  }

  function graphScene(ctx, t, a) {
    api = a;
    const tTen = cue('e-ten', 0);
    const tTwo = cue('e-two', 0);
    // on seviye bantları (e-ten)
    const bandsA = progress(t, tTen - 0.2, tTen + 0.5) * (1 - progress(t, tTwo - 0.2, tTwo + 0.5));
    panel(ctx, t, 1, 1 - bandsA);
    if (bandsA > 0) {
      for (let i = 0; i < 10; i++) {
        const y0 = vy(i * 0.5);
        const y1 = vy((i + 1) * 0.5);
        ctx.save();
        ctx.globalAlpha *= bandsA * (i % 2 ? 0.18 : 0.08);
        ctx.fillStyle = i === 7 ? P.fire : '#7f8db0';
        ctx.fillRect(G.x + 80, y1, TRACE_X1 - G.x - 80, y0 - y1);
        ctx.restore();
        text(ctx, String(i), G.x + 44, (y0 + y1) / 2, { size: 26, family: 'mono', weight: 700, color: i === 7 ? P.fire : P.muted, alpha: bandsA });
      }
      // gerilim 8. seviyeye taştığında uyarı
      const over = volt(t) >= 4.0 && t > tTen && t < tTwo;
      const warn = over ? 1 : 0;
      pill(ctx, '7 mi, 8 mi?', 540, G.y + G.h + 70, { size: 34, color: P.error, stroke: 'rgba(255,84,104,0.7)', a: bandsA * Math.max(warn, progress(t, cue('e-ten', 1) + 0.3, cue('e-ten', 1) + 0.6) * 0.9) });
    }
    // eşik (e-two, e-safe)
    const thA = progress(t, tTwo + 0.2, tTwo + 0.9);
    if (thA > 0) {
      const y = vy(2.5);
      ctx.save();
      ctx.globalAlpha *= thA * 0.12;
      ctx.fillStyle = P.fire;
      ctx.fillRect(G.x + 80, G.y + 10, TRACE_X1 - G.x - 80, y - G.y - 10);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha *= thA;
      ctx.strokeStyle = P.cream;
      ctx.lineWidth = 3;
      ctx.setLineDash([16, 12]);
      ctx.beginPath();
      ctx.moveTo(G.x + 80, y);
      ctx.lineTo(TRACE_X1, y);
      ctx.stroke();
      ctx.restore();
      pill(ctx, 'EŞİK', G.x + 170, y - 38, { size: 24, weight: 700, color: P.cream, stroke: 'rgba(243,237,225,0.5)', a: thA });
      text(ctx, '1', G.x + G.w - 60, vy(4.2), { size: 80, family: 'mono', weight: 700, color: P.fire, alpha: thA * progress(t, cue('e-two', 2), cue('e-two', 2) + 0.4) });
      text(ctx, '0', G.x + G.w - 60, vy(0.8), { size: 80, family: 'mono', weight: 700, color: P.muted, alpha: thA * progress(t, cue('e-two', 3), cue('e-two', 3) + 0.4) });
      // okunan bitler: her bitin ortasında, grafikle birlikte kayar
      const bitsA = progress(t, cue('e-two', 3) + 0.3, cue('e-two', 3) + 0.8);
      const x0 = G.x + 80;
      const x1 = TRACE_X1;
      const t0 = tTwo - 0.4;
      for (let k = 0; k < BITS.length * 2; k++) {
        const tc = t0 + (k + 0.5) * BIT;
        if (tc > t || tc < t - WINDOW) continue;
        const x = x0 + (1 - (t - tc) / WINDOW) * (x1 - x0);
        if (x < G.x + 190) continue; // "OKUNAN" etiketine binmesin
        const b = volt(tc) > 2.5 ? 1 : 0;
        text(ctx, String(b), x, G.y + G.h + 64, { size: 56, family: 'mono', weight: 700, color: b ? P.fire : P.dim, alpha: bitsA });
      }
      text(ctx, 'OKUNAN', G.x + 20, G.y + G.h + 64, { size: 20, weight: 700, spacing: 4, color: P.muted, align: 'left', alpha: bitsA });
    }
    trace(ctx, t, 1);
    readout(ctx, t, 1 - thA);
    // e-wobble etiketleri
    const wA = vis(t, cue('e-wobble', 1) - 0.1, tTen + 0.3, 0.4, 0.4);
    pill(ctx, 'ısı', 330, G.y + G.h + 70, { size: 32, a: wA });
    pill(ctx, 'parazit', 640, G.y + G.h + 70, { size: 32, a: wA * progress(t, cue('e-wobble', 1) + 0.3, cue('e-wobble', 1) + 0.7) });
    // e-safe: cevap değişmez
    const sA = progress(t, cue('e-safe', 1) - 0.2, cue('e-safe', 1) + 0.4);
    if (sA > 0) {
      check(ctx, 330, G.y + G.h + 170, 60, P.ok, sA, progress(t, cue('e-safe', 1), cue('e-safe', 1) + 0.5));
      text(ctx, 'bitler doğru okunur', 380, G.y + G.h + 172, { size: 36, family: 'serif', italic: true, color: P.cream, align: 'left', alpha: sA });
    }
  }

  // Sade sesler: elektrik uğultusu ve cızırtı efekti yok (konuşmanın üstünde parazit gibi duyuluyordu)
  function graphSound(m, hz, s) {
    const { cue: c } = s.api;
    if (s.lineId === 'e-ten') m.pop(c('e-ten', 1) + 0.35, { freq: hz('D5'), gain: 0.05 });
    if (s.lineId === 'e-two') {
      m.bell(c('e-two', 1), { freq: hz('E5'), gain: 0.05, decay: 2 });
      m.pop(c('e-two', 2), { freq: hz('B5'), gain: 0.05 });
      m.pop(c('e-two', 3), { freq: hz('E4'), gain: 0.05 });
    }
    if (s.lineId === 'e-safe') m.bell(c('e-safe', 1), { freq: hz('G#5'), gain: 0.05, decay: 2.4 });
  }

  function finaleScene(ctx, t, { start }) {
    const a = progress(t, start, start + 0.8);
    const row = [1, 0, 1, 1, 0, 0, 1, 0];
    row.forEach((b, i) => text(ctx, String(b), 540 + (i - 3.5) * 74, 1480, { size: 56, family: 'mono', weight: 700, color: b ? P.fire : P.dim, alpha: a }));
  }

  const g = (lineId) => ({ draw: graphScene, sound: graphSound, lineId });

  window.FILM = Kisa.short({
    title: 'Kısa · Bilgisayar neden sadece 0 ve 1 ile sayar?',
    pad: ['D2', 'A2', 'F#3', 'C#4'],
    padGain: 0.08,
    padCutoff: 520,
    whoosh: false,
    teaser: [],
    pause: { 'e-hook': 0.3, 'e-ten': 0.3, 'e-safe': 0.4 },
    shots: {
      'e-hook': [{ draw: hookScene }],
      'e-volt': [g('e-volt')],
      'e-wobble': [g('e-wobble')],
      'e-ten': [g('e-ten')],
      'e-two': [g('e-two')],
      'e-safe': [g('e-safe')],
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
