/*
 * YUP Akademi · Lup · Vücudun Gizli Ayarları — Kendini gıdıklayamamak (beynin tahmini, robot deneyi, güç tırmanması)
 * Kanca bir ters köşedir; 4. satır deneyin dönüm noktası (gecikme), 5. satır gündelik hayata bağlar (kardeş kavgası).
 * Tek çağrı sonda: "arkadaşına gönder". Kaynaklar: kaynaklar.md.
 * Kayıt metni: seslendirme-pause.txt. Kaydı olan satırın metni değişirse kimliği de değişmeli.
 * Kayıt gelince: bash video/araclar/kaydi-bol.sh kisa-gidik <kayit.mp3> Gidik && python3 video/araclar/dudak.py kisa-gidik
 */
window.NARRATION = {
  lines: [
    { id: 'g-hook', say: 'Kendini gıdıklayamazsın, çünkü beynin hamleni senden önce biliyor.' },
    { id: 'g-kopya', say: 'Elin daha kalkmadan beynin bir kopya çıkarıyor: Birazdan şuraya dokunacağım. Bildiği dokunuşun da sesini kısıyor.' },
    { id: 'g-robot', say: 'Bilim insanları bunu bir robotla denedi: Robotu kendi elinle oynatıp avucunu gıdıklattılar. Gıdıklanmadılar.' },
    { id: 'g-gecikme', say: 'Ama robota çok kısa bir gecikme ekleyince beyin şaşırdı. Yeniden gıdıklamaya başladı.' },
    { id: 'g-kardes', say: 'Kardeşinle "ben yavaş vurdum" kavgası da buradan çıkıyor: Herkes kendi vuruşunu olduğundan hafif hisseder.' },
    { id: 'g-cta', say: 'Gıdıklanmaya dayanamayan arkadaşına gönder: Onu bir tek kendi eli gıdıklayamıyor.' },
  ],
};
