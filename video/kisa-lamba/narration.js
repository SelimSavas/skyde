/*
 * Var ve Yok kısa videosu (YouTube Shorts) — seslendirme metni. Bkz. video/kisa/kisa.js.
 * show: ekrandaki altyazı (*yıldızlı* sözcükler vurgulanır); say: okunacak metin. İkisinde öbek (noktalama) sayısı aynı olmalı.
 */
window.NARRATION = {
  lines: [
    { id: 'l-hook', say: 'Otuz iki lambayla kaç farklı durum kurabilirsin? Tahminin muhtemelen çok düşük.', show: '32 lambayla kaç durum?\nTahminin *çok düşük.*' },
    { id: 'l-one', say: 'Tek lamba iki durum verir: sönük ya da yanık. Yani sıfır ya da bir.', show: 'Tek lamba *2 durum* verir: sönük ya da yanık. Yani *0 ya da 1.*' },
    { id: 'l-two', say: 'İki lamba, dört durum: kapalı kapalı, kapalı açık, açık kapalı, açık açık.', show: 'İki lamba, *4 durum:* kapalı kapalı, kapalı açık, açık kapalı, açık açık.' },
    { id: 'l-double', say: 'Her yeni lamba, durum sayısını ikiye katlar: sekiz, on altı, otuz iki.', show: 'Her yeni lamba, durum sayısını *ikiye katlar:* 8, 16, 32.' },
    { id: 'l-byte', say: 'Sekiz lambada iki yüz elli altı durum olur; buna bir bayt denir.', show: '*8 lambada 256 durum* olur; buna *1 bayt* denir.' },
    { id: 'l-big', say: 'Otuz iki lambada ise, dört milyarı geçer. Sezgimiz en çok burada yanılır.', show: '32 lambada ise, *4 milyarı geçer.* Sezgimiz en çok burada yanılır.' },
    { id: 'l-cta', say: 'Videonun devamı, kanalımızda.', show: 'Videonun devamı, *kanalımızda.*' },
  ],
};
