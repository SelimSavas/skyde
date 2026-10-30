/*
 * Önsöz kısa videosu (YouTube Shorts) — seslendirme metni. Bkz. video/kisa/kisa.js.
 * show: ekrandaki altyazı (*yıldızlı* sözcükler vurgulanır); say: okunacak metin.
 * Metni değiştirince: node video/narrate.mjs <klasör> --pay 1.1
 */
window.NARRATION = {
  lines: [
    { id: 'c-hook', say: 'Sen, ekranın hangi tarafındasın?', show: 'Sen, ekranın\n*hangi tarafındasın?*' },
    { id: 'c-two', say: 'İki çocuk, aynı uygulamayı kullanıyor. Biri yalnızca kullanıyor.', show: 'İki çocuk, aynı uygulamayı kullanıyor. Biri *yalnızca kullanıyor.*' },
    { id: 'c-ask', say: 'Diğeri soruyor: Bu neden böyle çalışıyor? Bunu kim, ne için tasarladı?', show: 'Diğeri *soruyor:* Bu neden böyle çalışıyor? Bunu kim, ne için tasarladı?' },
    { id: 'c-maker', say: 'İkinci çocuk, birincinin dünyasını kuran kişidir.', show: 'İkinci çocuk, birincinin *dünyasını kuran* kişidir.' },
    { id: 'c-cta', say: 'Arkasına geçmek için, videonun tamamı kanalımızda.', show: 'Arkasına geçmek için, videonun tamamı *kanalımızda.*' },
  ],
};
