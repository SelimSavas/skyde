/*
 * Önsöz kısa videosu (YouTube Shorts) — seslendirme metni. Bkz. video/kisa/kisa.js.
 * show: ekrandaki altyazı (*yıldızlı* sözcükler vurgulanır); say: okunacak metin.
 * Metni değiştirince: node video/narrate.mjs <klasör> --pay 1.1
 */
window.NARRATION = {
  lines: [
    { id: 'a-hook', say: 'Gönder’e bastığın o an, mesajın nereye gidiyor?', show: 'Gönder’e bastığın o an,\nmesajın *nereye gidiyor?*' },
    { id: 'a-bits', say: 'Önce harfler, var ve yok’a dönüşüyor.', show: 'Önce harfler, *var ve yok’a* dönüşüyor.' },
    { id: 'a-light', say: 'Sonra görünmez dalgalara biniyor; ışık olup denizleri aşıyor.', show: 'Sonra görünmez dalgalara biniyor; *ışık olup* denizleri aşıyor.' },
    { id: 'a-lock', say: 'Yolda kim görürse görsün, okuyamıyor.', show: 'Yolda kim görürse görsün, *okuyamıyor.*' },
    { id: 'a-fast', say: 'Ve bütün bunlar, saniyenin onda birinde oluyor.', show: 'Ve bütün bunlar, *saniyenin onda birinde* oluyor.' },
    { id: 'a-cta', say: 'Bu görünmez yolculuğun tamamı, kanalımızda.', show: 'Bu görünmez yolculuğun *tamamı, kanalımızda.*' },
  ],
};
