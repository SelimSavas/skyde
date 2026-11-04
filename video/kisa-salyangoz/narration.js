/*
 * YUP Akademi · Lup · Yakın Plan — Salyangozlar neden yağmurda ortaya çıkar? (sümük neredeyse tamamen su, kuru havada
 * kabuk kapısı, yağmur "gişesiz otoyol", müzede dört yıl sonra uyanan çöl salyangozu). Tek çağrı sonda.
 * Bu videoda üstte başlık yok: seslendirme metni sözcük sözcük akar (film.js, akış). Akan metin bu dosyadaki say
 * alanlarından gelir; bu yüzden metin kayıtla birebir aynı tutulmalı.
 * Ses etiketleri ([chuckles], [excited]) yalnız seslendirme-pause.txt'de. Kaynaklar: kaynaklar.md.
 * Kayıt gelince: bash video/araclar/kaydi-bol.sh kisa-salyangoz <kayit.mp3> Salyangoz && python3 video/araclar/dudak.py kisa-salyangoz
 */
window.NARRATION = {
  lines: [
    { id: 's-hook', say: "Yağmur yağınca kaldırımı dolduran salyangozlar, aslında günlerdir kabuklarının içinde bu anı bekliyordu." },
    { id: 's-sumuk', say: "Çünkü salyangoz yürümüyor, kendi ürettiği sümüğün üstünde kayıyor. Ve o sümüğün neredeyse tamamı su." },
    { id: 's-kapi', say: "Kuru havada attığı her adım, vücudundan su götürüyor. O yüzden kabuğunun ağzını, kuruyan sümükten bir kapıyla mühürleyip bekliyor." },
    { id: 's-yagmur', say: "Yağmur yağınca hava nemli, yer ıslak; kaybettiği su azalıyor. Salyangoz için yağmur, gişesiz bir otoyol." },
    { id: 's-muze', say: "Beklemekte de ustalar: Bir müzede, ölü sanılıp kartona yapıştırılan bir çöl salyangozu, dört yıl sonra suya konunca uyanıp yürümüş." },
    { id: 's-cta', say: "Yağmurdan sonra salyangozlara basmamak için parmak ucunda yürüyen arkadaşına gönder." },
  ],
};
