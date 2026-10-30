/*
 * Önsöz kısa videosu (YouTube Shorts) — seslendirme metni. Bkz. video/kisa/kisa.js.
 * show: ekrandaki altyazı (*yıldızlı* sözcükler vurgulanır); say: okunacak metin.
 * Metni değiştirince: node video/narrate.mjs <klasör> --pay 1.1
 */
window.NARRATION = {
  lines: [
    { id: 'b-hook', say: 'Sekiz yüz yıllık bu köprüyü, ne ayakta tutuyor?', show: '800 yıllık bu köprüyü,\nne *ayakta tutuyor?*' },
    { id: 'b-force', say: 'Görünmeyen bir güç: taşları birbirine kilitleyen basınç.', show: '*Görünmeyen bir güç:* taşları birbirine kilitleyen basınç.' },
    { id: 'b-second', say: 'Bugün insanlık, ikinci bir köprü kuruyor. Bu kez taştan değil:', show: 'Bugün insanlık, *ikinci bir köprü* kuruyor. Bu kez taştan değil:' },
    { id: 'b-parts', say: 'cam liflerden, uydulardan, yazılımdan.', show: '*cam liflerden, uydulardan, yazılımdan.*' },
    { id: 'b-life', say: 'Ve hepimiz, her gün onun içinde yaşıyoruz.', show: 'Ve hepimiz, *her gün onun içinde* yaşıyoruz.' },
    { id: 'b-cta', say: 'Bu görünmez köprünün hikâyesi, kanalımızda.', show: 'Bu görünmez köprünün hikâyesi, *kanalımızda.*' },
  ],
};
