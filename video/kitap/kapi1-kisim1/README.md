# Birinci Kapı · 1. Kısım — Var ve Yok: Ders Kitabı ve Etkinlikler

*Var ve Yok* videosuna eşlik eden ders kitabı (Word). Video izlendikten sonra okunur; her ünite videodaki
bir sahneye karşılık gelir ve başındaki şerit o sahnenin dakikasını gösterir.

- 11 ünite, 19 etkinlik (kes-oyna bit kartları, piksel boyama, ses ızgarası, bozuk Türkçe metni onarma…)
- Bölüm özeti, kavram sözlüğü, değerlendirme soruları, proje, cevap anahtarı ve öğretmene notlar
- Görseller: videodan kareler (`gorseller/video_*.jpg`) ve kitaba özel, baskıya uygun şekiller

## Üretmek

```bash
python3 video/kitap/kapi1-kisim1/sekiller.py   # kitaba özel şekiller (matplotlib)
python3 video/kitap/kapi1-kisim1/kareler.py    # videodan kareler (render.mjs + kırpma)
node video/kitap/kapi1-kisim1/kitap.js         # → Birinci-Kapi-1-Var-ve-Yok-Ders-Kitabi.docx
```

`kitap.js` metnin tamamını içerir (`**kalın**`, `*italik*`, `` `kod` `` işaretlemesiyle); `yardimci.js` kutular,
tablolar, görseller ve yazma satırları gibi yapı taşlarını üretir. Etkinlik numaraları `E(...)` çağrılarının
sırasından gelir; etkinlik ekleyip çıkarınca cevap anahtarındaki numaraları da güncelleyin.
