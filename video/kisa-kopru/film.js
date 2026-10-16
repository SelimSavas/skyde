/*
 * Kısa 2 · Sekiz yüz yıllık köprünün sırrı (Önsöz'ün 3. ve 4. bölümlerinden).
 * Çekimler Önsöz'ün anlarını src(cue) ile seçer; view: Önsöz koordinatlarında [x, y, görünen genişlik].
 */
window.FILM = Kisa.short({
  title: 'Kısa · Sekiz yüz yıllık köprünün sırrı',
  pad: ['A2', 'E3', 'B3', 'F#4'],
  teaser: ['mesaj', 'isik', 'ekran', 'ahilik'],
  shots: {
    'b-hook': [{ src: (c) => c('br-intro', 0) + 4.5, view: [[960, 560, 1150], [960, 540, 980]] }],
    'b-force': [
      { src: (c) => c('br-forces', 0), view: [[960, 560, 1100], [960, 540, 1000]] },
      { k: 1, src: (c) => c('br-forces', 1), view: [[900, 480, 950], [900, 460, 880]] },
    ],
    'b-second': [
      { src: (c) => c('inv-second', 0), view: [[960, 560, 1100], [960, 540, 1000]] },
      { k: 2, src: (c) => c('inv-second', 2), view: [[960, 560, 1000], [960, 560, 920]] },
    ],
    'b-parts': [
      { src: (c) => c('inv-parts', 0) + 0.3, view: [[960, 600, 900], [960, 620, 820]] },
      { k: 1, src: (c) => c('inv-parts', 1), view: [[960, 560, 1150], [960, 560, 1080]] },
      { k: 2, src: (c) => c('inv-parts', 3), view: [[960, 600, 1250], [960, 600, 1150]] },
    ],
    'b-life': [{ src: (c) => c('inv-life', 1), view: [[620, 520, 950], [1300, 520, 950]], rate: 1.3 }],
  },
});
