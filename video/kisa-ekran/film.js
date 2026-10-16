/*
 * Kısa 3 · Ekranın hangi tarafındasın? (Önsöz'ün 7. bölümünden).
 * Çekimler Önsöz'ün anlarını src(cue) ile seçer; view: Önsöz koordinatlarında [x, y, görünen genişlik].
 */
window.FILM = Kisa.short({
  title: 'Kısa · Ekranın hangi tarafındasın?',
  pad: ['G2', 'D3', 'B3', 'E4'],
  teaser: ['mesaj', 'isik', 'kopru', 'ahilik'],
  pause: { 'c-hook': 0.5, 'c-maker': 0.9 },
  shots: {
    'c-hook': [{ src: (c) => c('who-side', 1) + 1.6, view: [[975, 640, 980], [975, 640, 900]], crop: [260, 1080] }],
    'c-two': [
      { src: (c) => c('who-two', 2) + 0.6, view: [[950, 760, 1080], [950, 760, 1000]], crop: [250, 1080] },
      { k: 2, src: (c) => c('who-two', 1), view: [[540, 760, 700], [540, 760, 620]], crop: [250, 1080] },
    ],
    'c-ask': [
      { src: (c) => c('who-two', 2), view: [[1350, 700, 800], [1350, 660, 760]] },
      { k: 1, src: (c) => c('who-two', 3), view: [[1370, 620, 900], [1390, 600, 860]] },
      { k: 2, src: (c) => c('who-two', 5), view: [[1390, 560, 950], [1390, 560, 900]] },
    ],
    'c-maker': [{ src: (c) => c('who-two', 7), view: [[950, 760, 1060], [950, 760, 980]], crop: [250, 1080] }],
  },
});
