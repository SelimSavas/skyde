/*
 * Kısa 3 · Ekranın hangi tarafındasın? (Önsöz'ün 7. bölümünden).
 * Çekimler Önsöz'ün anlarını src(cue) ile seçer; view: Önsöz koordinatlarında [x, y, görünen genişlik].
 */
window.FILM = Kisa.short({
  title: 'Kısa · Ekranın hangi tarafındasın?',
  pad: ['G2', 'D3', 'B3', 'E4'],
  teaser: ['mesaj', 'kopru'],
  pause: { 'c-hook': 0.5, 'c-maker': 0.9 },
  shots: {
    'c-hook': [{ src: (c) => c('who-side', 1) + 1.6, view: [975, 640, 960], crop: [260, 1080] }],
    'c-two': [{ src: (c) => c('who-two', 2) - 0.3, view: [1110, 680, 1320], rate: 0.5, crop: [250, 1080] }],
    'c-ask': [{ src: (c) => c('who-two', 2) + 1.4, view: [1110, 680, 1320], rate: 1.1, crop: [250, 1080] }],
    'c-maker': [{ src: (c) => c('who-two', 7), view: [1110, 680, 1320], crop: [250, 1080] }],
  },
});
