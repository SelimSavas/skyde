/*
 * YUP Akademi · Lup · Vücudun Gizli Ayarları — Soğukta ağzımızdan neden duman çıkar? (nefes su buharıyla dolu, 0 °C hava
 * bunun ancak sekizde birini taşır, fazlası damlacığa dönüşür: minicik bir bulut; kuru havada yeniden buhar olur;
 * günde 1,5–2 su bardağı suyu nefesle veririz, kış onu görünür yapar). Tek çağrı sonda.
 * Bu videoda da üstte başlık yok: seslendirme sözcük sözcük akar (kisa-salyangoz ile aynı akış). Kayıt metni konuşma
 * dilinde (-yo: taşıyabiliyo, dönüşüyo), ekranda akan metin yazım kuralına göre (-yor); sözcükler birebir aynı.
 * Ses etiketleri ([excited], [chuckles]) yalnız seslendirme-pause.txt'de. Kaynaklar: kaynaklar.md.
 * Kayıt gelince: bash video/araclar/kaydi-bol.sh kisa-nefes <kayit.mp3> Nefes && python3 video/araclar/dudak.py kisa-nefes
 */
window.NARRATION = {
  lines: [
    { id: 'n-hook', say: "Soğukta ağzından çıkan o duman, aslında duman değil; az önce kendi yaptığın minicik bir bulut." },
    { id: 'n-buhar', say: "Ciğerlerinden çıkan nefes ılık ve su buharıyla dolu. Sıfır derecedeki hava ise bunun ancak sekizde biri kadar suyu taşıyabiliyor." },
    { id: 'n-damla', say: "Nefesin soğuk havaya çarpınca, fazla su sığacak yer bulamıyor ve minicik damlacıklara dönüşüyor. Gökteki bulutlar da böyle oluşuyor." },
    { id: 'n-kayip', say: "Birkaç saniye sonra kaybolması da bundan: Damlacıklar etraftaki kuru havaya karışıp yeniden görünmez buhara dönüyor." },
    { id: 'n-bardak', say: "Üstelik sen bu suyu yaz kış veriyorsun: Günde bir buçuk, iki su bardağı kadar. Kış sadece onu görünür yapıyor." },
    { id: 'n-cta', say: "Kışın ejderha gibi duman üfleyen arkadaşına gönder." },
  ],
};
