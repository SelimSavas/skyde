/*
 * YUP Akademi · Lup · Vücudun Gizli Ayarları — Ampule bakınca gelen renkli leke (ardıl görüntü, gözkapağının kırmızısı, ekranda deney)
 * YouTuber üslubu: kısa cümleler, konuşma dili; ses etiketleri ([whispers] vb.) yalnız seslendirme-pause.txt'de.
 * Kanca bir ters köşedir (leke ampulden değil, gözden); 4. satır izleyiciye deney yaptırır, ardından 10 sn sessiz geri sayım;
 * 5. satırda siyah beyaz Lup izleyicinin gözünde renklenir. Tek çağrı sonda: "arkadaşına gönder". Kaynaklar: kaynaklar.md.
 * Kayıt metni: seslendirme-pause.txt. Kaydı olan satırın metni değişirse kimliği de değişmeli.
 * Kayıt gelince: bash video/araclar/kaydi-bol.sh kisa-ampul <kayit.mp3> Ampul && python3 video/araclar/dudak.py kisa-ampul
 */
window.NARRATION = {
  lines: [
    { id: 'a-hook', say: "Ampule bakıp gözünü kapatınca gördüğün o renkli leke var ya... ampulden gelmiyor. Senin gözünden geliyor." },
    { id: 'a-solma', say: "Işık, gözünün arkasındaki hücreleri bir anlığına yoruyor. Onlar toparlanırken leke renk değiştiriyor: bir turuncu, bir mor, bir yeşil." },
    { id: 'a-kapak', say: "Arkadaki kırmızılık mı? O da göz kapağın. Kapaktaki kan, ışığın mavisini, yeşilini yutuyor. Geriye kırmızısı kalıyor." },
    { id: 'a-dene', say: "Hadi dene: Lup'un camındaki noktaya bak. On saniye. Gözünü hiç oynatma." },
    { id: 'a-bak', say: "Şimdi... bak. Lup siyah beyaz. Ama renkli görüyorsun, değil mi? O renkler senin gözünden." },
    { id: 'a-cta', say: "Bunu \"benim gözüm kanmaz\" diyen arkadaşına gönder. On saniye yeter." },
  ],
};
