/*
 * Kısa 2 · Sekiz yüz yıllık köprünün sırrı (Önsöz'ün 3. ve 4. bölümlerinden).
 * Çekimler Önsöz'ün anlarını src(cue) ile seçer; view: Önsöz koordinatlarında [x, y, görünen genişlik].
 */
window.FILM = Kisa.short({
  title: 'Kısa · Sekiz yüz yıllık köprünün sırrı',
  pad: ['A2', 'E3', 'B3', 'F#4'],
  teaser: ['mesaj', 'ekran'],
  shots: {
    'b-hook': [{ src: (c) => c('br-intro', 0) + 4.5, view: [960, 550, 1050] }],
    'b-force': [{ src: (c) => c('br-forces', 1) - 1.6, view: [960, 550, 1050] }],
    'b-second': [{ src: (c) => c('inv-second', 2) - 2.8, view: [960, 550, 1050] }],
    'b-parts': [{ src: (c) => c('inv-parts', 0) + 0.3, view: [960, 550, 1050], rate: 1.5 }],
    'b-life': [{ src: (c) => c('inv-life', 1), view: [960, 550, 1050], rate: 1.3 }],
  },
});
