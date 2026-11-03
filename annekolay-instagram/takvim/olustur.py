"""30 günlük takvimi tek kaynaktan Markdown ve CSV olarak üretir."""
import csv, datetime as dt
from pathlib import Path

ROOT = Path(__file__).resolve().parent
START = dt.date(2026, 11, 9)
GUN = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
AY = {11: "Kas", 12: "Ara"}
# (format, seri, segment, sütun, başlık, kanca, uzman, örnek)
ROWS = [
 ("Carousel", "Tanışalım", "Ada & Defne", "Marka", "Ada ve Defne ile tanışın", "Bu defteri birlikte yazacağız.", False, "p01-tanisin"),
 ("Reels", "Kimse Söylemedi", "Yeni Anne", "Eğitim", "Yenidoğanla ilk hafta: 5 normal şey", "Bebeğin bunları yapıyorsa derin bir nefes al.", True, "p02-kimse-yeni (Short #01 hazır)"),
 ("Reels", "Ada Sorar, Defne Anlatır #1", "Ada & Defne", "Duygusal", "Lohusalık gerçekten 40 gün mü?", "Herkes 40 gün diyor. Peki 41. gün ne oluyor?", True, "p03-adasorar"),
 ("Carousel", "Hafta Hafta Ada · 20", "Hamilelik", "Eğitim", "Bebeğin bu hafta yaklaşık bir muz boyunda (ilk kıpırtılar, detaylı ultrason, yan yatış)", "Yarı yoldayız!", True, "p04-hafta20, p05-hafta20-ic"),
 ("Reels", "Pamuk Bu Ay", "Yeni Anne", "Eğitim", "Pamuk 2 aylık: ilk sosyal gülümseme", "Bu gülümseme gaz değil, sana!", True, "p06-pamuk"),
 ("Reels", "Mini Test", "Ada & Defne", "Eğlence", "Bunu kim dedi: Ada mı, Defne mi?", "“Gece 4'te acıktım, uykum da kaçtı.”", False, "p07-test"),
 ("Tek görsel", "Gece Notları #1", "Yeni Anne", "Duygusal", "İkisi aynı anda doğru", "Bu gece üçüncü kez uyandık.", False, "p08-gece"),
 ("Carousel", "Uzman Masası", "Yeni Anne", "Eğitim", "Lohusalık hüznü mü, depresyon mu?", "Farkı bilmek, yardım istemeyi kolaylaştırır.", True, "p09-uzman"),
 ("Reels", "Kimse Söylemedi", "Hamilelik", "Eğitim", "Hamilelikte kimsenin söylemediği 5 şey (burun tıkanıklığı, diş eti kanaması, karında koyu çizgi, bacak krampları, canlı rüyalar)", "Burnun tıkalı ama hasta değilsin.", True, "p10-kimse-hamile"),
 ("Reels", "Ada Sorar, Defne Anlatır #2", "Ada & Defne", "Eğitim", "Hastane çantasını ne zaman hazırlamalıyım?", "Çantam hâlâ boş, geç mi kaldım?", True, ""),
 ("Carousel", "Hafta Hafta Ada · 21", "Hamilelik", "Eğitim", "21. hafta: tekmeler belirginleşiyor", "Bu kıpırtı gaz mı, bebek mi?", True, ""),
 ("Reels", "Pamuk Bu Hafta", "Yeni Anne", "Eğitim", "Gaz sancısında 4 sakinleştirme yolu", "Akşam 6 oldu, ağlama başladı mı?", True, ""),
 ("Reels", "Birlikte Kuruyoruz", "Ada & Defne", "Marka", "Anneler için bir kutu hazırlasaydık içinde ne olurdu?", "Bir hayalimiz var ve sana ihtiyacımız var.", False, ""),
 ("Tek görsel", "Ada'nın Günlüğü #1", "Hamilelik", "Duygusal", "İlk tekme", "Bugün içimden biri bana merhaba dedi.", False, ""),
 ("Carousel", "Uzman Masası", "Hamilelik", "Eğitim", "Gebelikte hangi tarafa yatmalı?", "Sırtüstü mü, yan mı? Kısa cevap: yan.", True, ""),
 ("Reels", "Kimse Söylemedi", "Yeni Anne", "Eğitim", "Doğumdan sonra kimsenin söylemediği 5 şey (lohusa kanaması, gece terlemesi, sütün gelişi, saç dökülmesi, duygusal iniş çıkışlar)", "Doğum bitti, şimdi ne olacak?", True, ""),
 ("Reels", "Ada Sorar, Defne Anlatır #3", "Ada & Defne", "Duygusal", "Doğumdan korkuyorum, bu normal mi?", "Korkmak, hazır olmadığın anlamına gelmez.", True, ""),
 ("Carousel", "Hafta Hafta Ada · 22", "Hamilelik", "Eğitim", "22. hafta: bebek sesini duymaya başlıyor", "Ona bugün ne anlattın?", True, ""),
 ("Reels", "Pamuk Bu Hafta", "Yeni Anne", "Duygusal", "Defne'nin ilk \"kendime 20 dakika\"sı", "Pamuk uyudu. Ve ben ilk kez kendime çay yaptım.", False, ""),
 ("Reels", "Mini Test", "Ada & Defne", "Eğlence", "Hamilelikte ve lohusalıkta: aynı soru, iki cevap", "Soru: Dün gece kaçta uyandın?", False, ""),
 ("Tek görsel", "Gece Notları #2", "Yeni Anne", "Duygusal", "Herkes bebeği sordu", "Herkes bebeği sordu. Ben iyiyim, sanırım.", False, ""),
 ("Carousel", "Bu Defter Neden Var?", "Ada & Defne", "Marka", "AnneKolay manifestosu", "Annelere eksiklerini değil, güçlerini hatırlatmak için.", False, ""),
 ("Reels", "Sizden Gelenler", "Hamilelik", "Topluluk", "Aşerme haritası: en tuhaf isteklerinizi topladık", "Gece 2'de turşu isteyen bir tek ben miyim?", False, ""),
 ("Reels", "Ada & Defne Cevaplıyor", "Ada & Defne", "Topluluk", "Soru kutusundan en çok sorulan 3 soru", "Sordunuz, uzmanımıza götürdük.", True, ""),
 ("Carousel", "Hafta Hafta Ada · 23", "Hamilelik", "Eğitim", "23. hafta: ayaklar şişiyorsa (normal olan ve doktora gidilecek durumlar)", "Ayakkabıların dar gelmeye başladı mı?", True, ""),
 ("Reels", "Pamuk Bu Ay", "Yeni Anne", "Eğitim", "Pamuk 3. aya giriyor: 4 küçük adım", "Pamuk bu ay ellerini keşfetti.", True, ""),
 ("Reels", "Anne Sözlüğü", "Ada & Defne", "Eğlence", "\"Bebek uyurken sen de uyu\" ne demek?", "Sözlükte yok ama her anne biliyor.", False, ""),
 ("Tek görsel", "Ada'nın Günlüğü #2", "Hamilelik", "Duygusal", "Bedenim değişiyor, ben de", "Aynada bugün yeni birini gördüm.", False, ""),
 ("Carousel", "Uzman Masası", "Hamilelik", "Eğitim", "Şeker yükleme testi: ne zaman, nasıl?", "24-28. hafta arasındaysan bu sayfa senin için.", True, ""),
 ("Reels", "Sizden Gelenler", "Yeni Anne", "Topluluk", "Sizin ilk haftanız: 5 anneden 5 cümle", "İlk haftanı tek cümleyle anlat dedik.", False, ""),
]

def rows():
    for i, r in enumerate(ROWS):
        d = START + dt.timedelta(days=i)
        ada = 20 + i // 7
        pamuk_hf = (d - dt.date(2026, 9, 14)).days // 7
        yield [i + 1, f"{GUN[d.weekday()]} {d.day} {AY[d.month]}", *r[:6], "✓" if r[6] else "", r[7], f"{ada}. hafta", f"{pamuk_hf} haftalık"]

HEAD = ["Gün", "Tarih", "Format", "Seri", "Segment", "Sütun", "Başlık / konu", "Kanca", "Uzman", "Örnek tasarım", "Ada", "Pamuk"]
data = list(rows())
with open(ROOT / "takvim-30-gun.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f); w.writerow(HEAD); w.writerows(data)

from collections import Counter
sut, seg, fmt = Counter(r[5] for r in data), Counter(r[4] for r in data), Counter(r[2] for r in data)
md = ["# 30 günlük takvim", "",
      "Başlangıç **Pazartesi 9 Kasım 2026**. Haftada 7 gönderi: 4 Reels, 2 carousel, 1 tek görsel. `Uzman` sütununda ✓ olan gönderiler uzman onayı olmadan yayınlanmaz. Takvimin CSV hali Assets → Takvim'dedir; Google Sheets ya da Notion'a aktarılabilir.", "",
      f"Denge: {', '.join(f'{k} {v}' for k, v in seg.most_common())} · " + ", ".join(f"{k} {v}" for k, v in sut.most_common()) + f" · {', '.join(f'{k} {v}' for k, v in fmt.most_common())}.", "",
      "İlk ay eğitim ağırlığı (%47) bilinçli olarak marka kitabındaki %35'in üstündedir. Kaydedilen ve paylaşılan bilgi içerikleri yeni hesabı keşfete taşır. 2. aydan itibaren eğitim %35'e iner, topluluk ve eğlence artar.", ""]
for wk in range(0, 30, 7):
    week = data[wk:wk + 7]
    md += [f"## {wk // 7 + 1}. hafta · Ada {week[0][10]}, Pamuk {week[0][11]}", "",
           "| Gün | Tarih | Format | Seri | Segment | Sütun | Başlık / konu | Kanca | Uzman |", "|---|---|---|---|---|---|---|---|---|"]
    md += [f"| {r[0]} | {r[1]} | {r[2]} | {r[3]} | {r[4]} | {r[5]} | {r[6]} | {r[7]} | {r[8]} |" for r in week]
    md.append("")
md += ["## Story'lerden beslenen içerikler", "",
       "- **Gün 13'ten itibaren** her Cumartesi story'de soru kutusu açılır: \"Ada ve Defne'ye sor\". Cevaplar Gün 24 Reels'ine konu olur.",
       "- **Gün 15-22 arası** story'de \"En tuhaf aşermen ne?\" sorusu sorulur; cevaplar Gün 23'teki \"Aşerme haritası\"na dönüşür.",
       "- **Gün 13'teki \"Birlikte Kuruyoruz\"** gönderisinin yorumları kaydedilir. Bu, kurulacak şirketin ilk kutusu için ücretsiz pazar araştırmasıdır.",
       "- **Gün 25-30 arası** story'de \"İlk haftanı tek cümleyle anlat\" sorusu sorulur; cevaplar Gün 30'a konu olur."]
(ROOT / "05-takvim-30-gun.md").write_text("\n".join(md) + "\n", encoding="utf-8")
print(seg, sut, fmt)
