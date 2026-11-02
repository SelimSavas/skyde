/*
 * YUP Akademi · Lup · Vücudun Gizli Ayarları — Bilmediğin şarkıya eşlik etmek
 * Konu: Hiç bilmediğin bir şarkıya, sözlerini bilmesen de kısa sürede eşlik edersin. Video bunu izleyiciye yaşatır:
 * özgün melodi (melodi.js) bir kez tam çalar; ikinci kez yalnız cevap cümlesi çalar ve son notadan önce durur;
 * izleyici sonu kendisi tamamlar, ardından son nota gelir. Sonra neden: tahmin eden beyin, tekrar, ödül, birlikte söylemek.
 * Ses etiketi yok; tek çağrı sonda. Kaynaklar: kaynaklar.md. Çalışma: calisma.md.
 * Kayıt gelince: bash video/araclar/kaydi-bol.sh kisa-eslik <kayit.mp3> Eslik && python3 video/araclar/dudak.py kisa-eslik
 */
window.NARRATION = {
  lines: [
    { id: 'e-hook', say: 'Hiç duymadığın bir şarkıya, ikinci nakarata gelmeden eşlik etmeye başlarsın. Dene; bu melodiyi ilk kez duyuyorsun.' },
    { id: 'e-tekrar', say: 'Şimdi bir kez daha. Bu sefer sen de içinden eşlik et.' },
    { id: 'e-tamam', say: 'Sonunu çalmadım... ama sen tamamladın, değil mi?' },
    { id: 'e-neden', say: 'Çünkü beynin şarkıyı dinlemiyor, tahmin ediyor. Duyduğun binlerce şarkının kurallarını farkına varmadan ezberledi; nakarat ikinci kez geldiğinde onu çoktan kaydetmişti.' },
    { id: 'e-keyif', say: 'Tahminin tuttukça beynin seni ödüllendiriyor. Birlikte söylemek de yabancıları hızla yakınlaştırıyor; düğünde herkesin aynı şarkıya katılmasının bir sebebi de bu.' },
    { id: 'e-cta', say: 'Sözleri bilmeden her şarkıya eşlik eden arkadaşına gönder: Bu videoya da eşlik etti.' },
  ],
};
