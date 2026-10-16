/*
 * Öğretici kısa video (YouTube Shorts) — seslendirme metni. Bkz. video/kisa/kisa.js.
 * Önsöz'deki mesaj yolculuğundan tek bir bilgi: Gönder'e basınca mesajın geçtiği beş durak.
 * show: ekrandaki altyazı (*yıldızlı* sözcükler vurgulanır); say: okunacak metin. İkisinde öbek (noktalama) sayısı aynı olmalı.
 * Metni değiştirince: node video/narrate.mjs kisa-durak --pay 1.1
 */
window.NARRATION = {
  lines: [
    { id: 'd-hook', say: 'Gönder’e bastığında, mesajın beş duraktan geçer.', show: 'Gönder’e bastığında,\nmesajın *5 duraktan* geçer.' },
    { id: 'd-1', say: 'Bir: Harfler, bir ve sıfırlara dönüşür.', show: '1. Harfler, *bir ve sıfırlara* dönüşür.' },
    { id: 'd-2', say: 'İki: Radyo dalgasıyla evdeki modeme gider.', show: '2. *Radyo dalgasıyla* evdeki modeme gider.' },
    { id: 'd-3', say: 'Üç: Cam liflerde, ışık olarak yol alır.', show: '3. Cam liflerde, *ışık olarak* yol alır.' },
    { id: 'd-4', say: 'Dört: Yönlendiriciler, ona en uygun yolu seçer.', show: '4. Yönlendiriciler, ona *en uygun yolu* seçer.' },
    { id: 'd-5', say: 'Beş: Yol boyunca şifrelidir; araya giren biri okuyamaz.', show: '5. Yol boyunca *şifrelidir;* araya giren biri okuyamaz.' },
    { id: 'd-fast', say: 'Ve hepsi, saniyenin onda birinden kısa sürer.', show: 'Ve hepsi, *saniyenin onda birinden* kısa sürer.' },
    { id: 'd-cta', say: 'Videonun devamı, kanalımızda.', show: 'Videonun devamı, *kanalımızda.*' },
  ],
};
