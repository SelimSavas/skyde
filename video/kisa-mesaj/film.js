/*
 * Kısa 1 · Mesajın görünmez yolculuğu (Önsöz'ün 1. ve 2. bölümlerinden).
 * Çekimler Önsöz'ün anlarını src(cue) ile seçer; view: Önsöz koordinatlarında [x, y, görünen genişlik].
 */
window.FILM = Kisa.short({
  title: 'Kısa · Mesajın görünmez yolculuğu',
  pad: ['F2', 'C3', 'A3', 'E4'],
  teaser: ['kopru', 'dunya', 'ekran', 'ahilik'],
  pause: { 'a-fast': 0.4 },
  shots: {
    'a-hook': [{ src: (c) => c('night-send', 0) - 0.6, view: [[1185, 430, 700], [1070, 440, 830]] }],
    'a-bits': [{ src: (c) => c('jr-switch', 2), view: [[1245, 450, 900], [1245, 450, 800]], crop: [150, 1080] }],
    'a-light': [
      { src: (c) => c('jr-wifi', 0) + 0.3, view: [[640, 600, 960], [1150, 600, 960]], crop: [150, 1080] },
      { k: 1, src: (c) => c('jr-fiber', 1), view: [[700, 640, 950], [1150, 640, 950]], crop: [150, 1080] },
    ],
    'a-lock': [{ src: (c) => c('jr-lock', 0), view: [[970, 500, 1330], [990, 500, 1290]], rate: 1.4, crop: [150, 1080] }],
    'a-fast': [
      { src: (c) => c('jr-left', 0), view: [[1200, 420, 780], [1200, 400, 700]], crop: [150, 1080] },
      { k: 1, src: (c) => c('night-send', 1) + 0.3, view: [[1000, 420, 900], [1000, 420, 820]] },
    ],
  },
});
