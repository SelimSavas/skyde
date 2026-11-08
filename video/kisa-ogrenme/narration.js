/*
 * YUP Akademi · Lup kısa video — Öğrenmeyi öğrenmek: bir konuyu kendi başına araştırıp kavrayabilmek. Bilgi değişir,
 * öğrenme becerisi kalıcıdır. (İşverenlere göre aranan becerilerin ~%39'u 2030'a kadar değişecek; altını çizip tekrar
 * okumak en az işe yarayan yöntemlerden; kitabı kapatıp kendine anlatmak ve aralıklı tekrar en çok işe yarayanlardan.)
 * Tek çağrı sonda. Altyazı kisa-nefes'teki gibi: ortanın biraz altında, kutusuz, en fazla 3 sözcük, sola akar.
 * Kayıt metni konuşma dilinde (-yo: söylüyo, eskimiyo), ekrandaki metin yazım kuralına göre (-yor); sözcükler aynı.
 * Ses etiketleri ([whispers], [excited]) yalnız seslendirme-pause.txt'de. Kaynaklar: kaynaklar.md.
 * Kayıt gelince: bash video/araclar/kaydi-bol.sh kisa-ogrenme <kayit.mp3> Ogrenme && python3 video/araclar/dudak.py kisa-ogrenme
 */
window.NARRATION = {
  lines: [
    { id: 'o-hook', say: "Şu an iş hayatında aranan becerilerin neredeyse beşte ikisi, 2030'a kadar değişecek. Bunu işverenlerin kendisi söylüyor." },
    { id: 'o-beceri', say: "Yani bugün ezberlediğin bilgi yarın eskiyebilir. Ama bir beceri hiç eskimiyor: öğrenmeyi öğrenmek." },
    { id: 'o-kapi', say: "Bir konuyu kimse sana anlatmadan, kendi başına araştırıp kavrayabilmek. İş ararken de, ticaret yaparken de, bir alanda uzmanlaşırken de seni öne geçiren şey bu." },
    { id: 'o-yanilgi', say: "Şaşırtıcı kısmı şu: Altını çizip tekrar tekrar okumak, en az işe yarayan yöntemlerden biri." },
    { id: 'o-yontem', say: "Onun yerine kitabı kapat, öğrendiğini kendine anlat. Tıkandığın yer, eksiğin olan yer. Ertesi gün ve bir hafta sonra bir daha dene." },
    { id: 'o-kalici', say: "Çünkü bilgi değişir, ama öğrenme becerin hep seninle kalır." },
    { id: 'o-cta', say: "Kendi kendine bir şey öğrenmeye çalışan arkadaşına gönder." },
  ],
};
