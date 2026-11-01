/*
 * YUP Akademi · Lup · Vücudun Gizli Ayarları — Ampule bakınca gelen renkli leke (ardıl görüntü, gözkapağının kırmızısı, ekranda deney)
 * Kanca bir ters köşedir (leke ampulün değil, gözün); 4. satır izleyiciye deney yaptırır, ardından 10 sn sessiz geri sayım;
 * 5. satırda siyah beyaz Lup izleyicinin gözünde renklenir. Tek çağrı sonda: "arkadaşına gönder". Kaynaklar: kaynaklar.md.
 * Kayıt metni: seslendirme-pause.txt. Kaydı olan satırın metni değişirse kimliği de değişmeli.
 * Kayıt gelince: bash video/araclar/kaydi-bol.sh kisa-ampul <kayit.mp3> Ampul && python3 video/araclar/dudak.py kisa-ampul
 */
window.NARRATION = {
  lines: [
    { id: 'a-hook', say: 'Ampule bakıp gözünü kapattığında gördüğün o renkli leke, ampulün değil, yorulmuş göz hücrelerinin rengi.' },
    { id: 'a-solma', say: 'Işık, gözünün arkasındaki hücrelerin boyasını bir anlığına soldurur. Solan hücreler toparlanırken leke renkten renge geçer.' },
    { id: 'a-kapak', say: 'Arkadaki kırmızılık da gözkapağın: Işık kapaktan geçerken kanın maviyi ve yeşili yutar, geriye kırmızı kalır.' },
    { id: 'a-dene', say: "Şimdi dene: Lup'un camındaki noktaya on saniye bak, gözünü hiç kıpırdatma." },
    { id: 'a-bak', say: 'Şimdi bak: Ekrandaki Lup siyah beyaz. Renkleri senin gözün boyuyor.' },
    { id: 'a-cta', say: 'Gözünün asla kanmayacağını söyleyen arkadaşına gönder: On saniye yeter.' },
  ],
};
