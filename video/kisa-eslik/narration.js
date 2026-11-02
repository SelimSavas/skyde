/*
 * YUP Akademi · Lup · Vücudun Gizli Ayarları — Bilmediğin şarkıya eşlik etmek (müzikte tahmin, yanlış nota alarmı, dopamin)
 * Video sözle değil melodiyle açılır: özgün melodi (melodi.js) son notadan önce durur, ekranda "Son notayı sen söyle".
 * İlk satır melodiden sonra gelir (lead), "İşte o nota:"dan sonra doğru son, 2. satırdan sonra yanlış son çalar.
 * YouTuber üslubu; ses etiketleri ([whispers] vb.) yalnız seslendirme-pause.txt'de. Tek çağrı sonda. Kaynaklar: kaynaklar.md.
 * Kayıt gelince: bash video/araclar/kaydi-bol.sh kisa-eslik <kayit.mp3> Eslik && python3 video/araclar/dudak.py kisa-eslik
 */
window.NARRATION = {
  lines: [
    { id: 'e-durak', say: 'Durdu... ama kafanda son nota hâlâ çalıyor, değil mi? İşte o nota:' },
    { id: 'e-yanlis', say: 'Şimdi bir de yanlış biteni dinle.' },
    { id: 'e-alarm', say: 'Yüzünü buruşturan o his, beyninin "bu yanlış" alarmı. Bu alarm, müzik eğitimi hiç almamış insanların beyninde bile ölçülüyor.' },
    { id: 'e-tahmin', say: 'Çünkü beynin müziği dinlemiyor, tahmin ediyor. Duyduğun binlerce şarkıdan, hangi notanın eve döndüğünü kendi kendine öğrendi.' },
    { id: 'e-dopamin', say: 'Tahminin tuttukça beynin seni ödüllendiriyor; en sevdiğin anı beklerken, daha o an gelmeden dopamin salgılıyor. Hiç bilmediğin şarkıya eşlik etmenin keyfi bu.' },
    { id: 'e-cta', say: '"Müzik kulağım yok" diyen arkadaşına gönder: Beyni bu testi çoktan geçti.' },
  ],
};
