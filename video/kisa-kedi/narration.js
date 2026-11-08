/*
 * YUP Akademi · Lup kısa video — Kediler insanların psikoloğu (10 dakika hayvan okşamak stres hormonunu düşürdü; Ekim
 * 2026'da Kyoto'da kedisi yakınında duran sahiplerin keyfi daha yerinde, oksitosin sahiple kedide birlikte değişiyor;
 * kediler insan yüzü ve sesindeki duyguyu eşleştiriyor; yavaş göz kırpma kedi dilinde gülümseme). Tek çağrı sonda.
 * Altyazı kisa-nefes'teki gibi: ortanın biraz altında, kutusuz, en fazla 3 sözcük, sola akar.
 * Kayıt metni konuşma dilinde (-yo), ekrandaki metin yazım kuralına göre (-yor); sözcükler aynı.
 * Ses etiketleri ([whispers], [chuckles]) yalnız seslendirme-pause.txt'de. Kaynaklar: kaynaklar.md.
 * Kayıt gelince: bash video/araclar/kaydi-bol.sh kisa-kedi <kayit.mp3> Kedi && python3 video/araclar/dudak.py kisa-kedi
 */
window.NARRATION = {
  lines: [
    { id: 'k-hook', say: "Kedin, evdeki psikoloğun: Randevu istemiyor, seni yargılamıyor, üstelik etkisi ölçülebiliyor." },
    { id: 'k-stres', say: "Bir araştırmada, kedi ve köpekleri sadece on dakika okşayan öğrencilerin stres hormonu düştü." },
    { id: 'k-japon', say: "Geçen ay Japonya'da da şu görüldü: Kedisi yanında daha çok vakit geçiren insanların keyfi daha yerinde. Bağ hormonu oksitosin de insanla kedide birlikte inip çıkıyor." },
    { id: 'k-okur', say: "Kedin seni okuyabiliyor da: Yüzünden ve sesinden mutlu mu kızgın mı olduğunu anlıyor. Ama yorum yapmıyor, sadece yanında kalıyor." },
    { id: 'k-goz', say: "Şimdi şunu dene: Kedine bakıp gözlerini yavaşça kırp. O da yavaşça kırparsa, sana kedi dilinde gülümsedi demektir." },
    { id: 'k-kapanis', say: "Yani psikoloğun dört ayaklı, seans ücreti de bir kap mama." },
    { id: 'k-cta', say: "Kedisiyle terapiye giren arkadaşına gönder." },
  ],
};
