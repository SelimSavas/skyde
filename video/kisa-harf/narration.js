/*
 * Öğretici kısa video (YouTube Shorts) — seslendirme metni. Bkz. video/kisa/kisa.js.
 * Birinci Kapı'dan (Var ve Yok) tek bir bilgi: A harfi, makinenin içinde 65 sayısıdır, 65 de sekiz bittir.
 * show: ekrandaki altyazı (*yıldızlı* sözcükler vurgulanır); say: okunacak metin. İkisinde öbek (noktalama) sayısı aynı olmalı.
 * Metni değiştirince: node video/narrate.mjs kisa-harf --pay 1.1
 */
window.NARRATION = {
  lines: [
    { id: 'h-hook', say: 'Bilgisayarın içinde, tek bir harf bile yoktur.', show: 'Bilgisayarın içinde,\n*tek bir harf bile yoktur.*' },
    { id: 'h-bits', say: 'Çünkü makine yalnızca bir ve sıfır bilir.', show: 'Çünkü makine yalnızca *bir ve sıfır* bilir.' },
    { id: 'h-code', say: 'Bu yüzden her harfe bir numara verildi. A harfi, altmış beş.', show: 'Bu yüzden her harfe bir numara verildi. *A harfi, 65.*' },
    { id: 'h-byte', say: 'Bu sayı sekiz bitle saklanır. Bitlerin değeri, sağdan sola ikiye katlanır.', show: 'Bu sayı *8 bitle* saklanır. Bitlerin değeri, sağdan sola *ikiye katlanır.*' },
    { id: 'h-sum', say: 'Altmış dört ve bir açık: toplam altmış beş. İşte A.', show: '*64 ve 1* açık: toplam *65.* İşte *A.*' },
    { id: 'h-msg', say: 'Yazdığın her mesaj da, böyle bitlerden oluşur.', show: 'Yazdığın her mesaj da, *böyle bitlerden* oluşur.' },
    { id: 'h-cta', say: 'Videonun devamı, kanalımızda.', show: 'Videonun devamı, *kanalımızda.*' },
  ],
};
