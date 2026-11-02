/*
 * Eşlik testi melodisi (özgün beste, Re majör, 120 BPM). İki cümle: soru (A, yarım kadansla biter) ve cevap (A',
 * La7 → Re tam kadans). Testte cevap cümlesi yeden notada (Do#5) durur; izleyicinin beyni son notayı (Re5) tamamlar.
 * Yanlış bitiş: Re5 yerine Re#5 (Re majör akorla yarım ses sürtüşmesi).
 *   MELODI.cal(m, t, { son: 'yok' | 'dogru' | 'yanlis' })  → biten zamanı döndürür
 *   MELODI.son(m, t, { yanlis })                          → yalnız son nota ve akor
 */
(function (root) {
  'use strict';
  const hz = root.Synth.hz;
  const BPM = 120;
  const B = 60 / BPM;
  // [nota, vuruş]
  const A = [['D5', 1], ['F#5', 1], ['A5', 1.5], ['G5', 0.5], ['F#5', 1], ['D5', 1], ['E5', 2]];
  const A2 = [['D5', 1], ['F#5', 1], ['A5', 1.5], ['G5', 0.5], ['E5', 1], ['C#5', 1]];
  // her ölçünün akoru (4 vuruş): Re, La, Re, La7
  const AKOR = [['D3', 'F#3', 'A3'], ['A2', 'E3', 'C#4'], ['D3', 'F#3', 'A3'], ['A2', 'G3', 'C#4']];
  const nota = (m, t, n, b, g = 1) => m.pluck(t, { freq: hz(n), gain: 0.13 * g, tone: 'piano', decay: Math.min(1.6, 0.5 + b * B), wet: 0.3 });
  const akor = (m, t, ch, g = 1) => ch.forEach((n, i) => m.pluck(t + i * 0.012, { freq: hz(n), gain: 0.05 * g, tone: 'piano', decay: 2.2, pan: -0.2 + i * 0.2, wet: 0.35 }));
  function cal(m, t, { son = 'yok', g = 1 } = {}) {
    let x = t;
    for (let bar = 0; bar < 4; bar++) {
      akor(m, t + bar * 4 * B, AKOR[bar], g);
      akor(m, t + bar * 4 * B + 2 * B, AKOR[bar], g * 0.7);
    }
    for (const [n, b] of [...A, ...A2]) {
      nota(m, x, n, b, g);
      x += b * B;
    }
    if (son !== 'yok') return sonNota(m, x, { yanlis: son === 'yanlis', g });
    return x;
  }
  function sonNota(m, t, { yanlis = false, g = 1 } = {}) {
    nota(m, t, yanlis ? 'D#5' : 'D5', 2, g * 1.1);
    akor(m, t, ['D3', 'F#3', 'A3', 'D4'], g * 1.1);
    return t + 2 * B;
  }
  // Son ölçü (yanlış biteni tekrar dinletmek için): Mi5 Do#5 → son
  function sonOlcu(m, t, { yanlis = false, g = 1 } = {}) {
    akor(m, t, AKOR[3], g);
    nota(m, t, 'E5', 1, g);
    nota(m, t + B, 'C#5', 1, g);
    return sonNota(m, t + 2 * B, { yanlis, g });
  }
  // sure: durdurulan melodinin süresi (sn); son notası 2 vuruş
  const sure = [...A, ...A2].reduce((q, [, b]) => q + b, 0) * B;
  root.MELODI = { BPM, B, A, A2, cal, son: sonNota, sonOlcu, sure };
})(typeof window !== 'undefined' ? window : globalThis);
