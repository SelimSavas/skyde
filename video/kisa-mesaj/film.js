/*
 * Kısa 1 · Mesajın görünmez yolculuğu (Önsöz'ün 1. ve 2. bölümlerinden).
 * Çekimler Önsöz'ün anlarını src(cue) ile seçer; view: Önsöz koordinatlarında [x, y, görünen genişlik].
 */
window.FILM = Kisa.short({
  title: 'Kısa · Mesajın görünmez yolculuğu',
  pad: ['F2', 'C3', 'A3', 'E4'],
  teaser: ['kopru', 'dunya'],
  pause: { 'a-fast': 0.4 },
  shots: {
    'a-hook': [{ src: (c) => c('night-send', 0) - 0.6, view: [1080, 430, 820] }],
    'a-bits': [{ src: (c) => c('jr-switch', 2), view: [1245, 450, 860], crop: [150, 1080] }],
    'a-light': [
      { src: (c) => c('jr-wifi', 0) + 0.3, view: [925, 600, 1220], crop: [150, 1080] },
      { k: 1, src: (c) => c('jr-fiber', 1), view: [925, 640, 1000], crop: [150, 1080] },
    ],
    'a-lock': [{ src: (c) => c('jr-lock', 0), view: [975, 500, 1320], rate: 1.3, crop: [150, 1080] }],
    'a-fast': [{ src: (c) => c('jr-left', 0) + 2.5, view: [1200, 380, 700], crop: [100, 1080] }],
  },
});
