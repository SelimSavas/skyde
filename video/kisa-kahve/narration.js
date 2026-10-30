/*
 * YUP Akademi · "Bu sensin" kısa video — Kahvesini içmeden konuşulamayan arkadaşın abartmıyor (kafein yoksunluğu)
 * Gönder kalıbı: kanca bir insan tipini anlatır, bilim onu haklı çıkarır, tek çağrı "arkadaşına gönder" (sonda).
 * Kurgu: her satırın içinde de 1–1,5 saniyede bir görüntü değişir; sabah kahvesinin sırrı baştan vaat edilir, 4. satırda ödenir.
 * Türkçe seslendirme metni. Her satır kendi sahnesidir (film.js). Sayılar yazıyla; kaynaklar: kaynaklar.md.
 * Kayıt metni: seslendirme-pause.txt. Kaydı olan satırın metni değişirse kimliği de değişmeli.
 * Kayıt gelince: bash video/araclar/kaydi-bol.sh kisa-kahve <kayit.mp3> Kahve
 */
window.NARRATION = {
  lines: [
    { id: 'k-hook', say: 'Kahvesini içmeden konuşulamayan arkadaşın abartmıyor. Bu, tıp kitabında yazan bir yoksunluk.' },
    { id: 'k-lock', say: 'Kafein, beyindeki yorgunluk sinyalinin kilidine oturur. Her gün içersen beyin daha çok kilit yapar.' },
    { id: 'k-crash', say: 'Kahveyi kesince o kilitlerin hepsi yorgunlukla dolar: Baş ağrısı, sinirlilik, uyuşukluk.' },
    { id: 'k-morning', say: 'Bu da son fincandan on iki saat kadar sonra başlar: Yani tam sabah.' },
    { id: 'k-twist', say: 'İşin ilginci: Her gün içiyorsan, sabah kahvesi seni süper yapmıyor; sadece normale döndürüyor.' },
    { id: 'k-cta', say: 'Kahvesiz yapamayan arkadaşına gönder. Ama önce kahvesini içsin.' },
  ],
};
