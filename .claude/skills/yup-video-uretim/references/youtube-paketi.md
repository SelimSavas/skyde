# YouTube yükleme paketi

Kullanıcı "başlık, açıklama ve etiketleri tam ver" dediğinde bu paketin tamamı verilir. Repo varsa `video/<bolum>/youtube/aciklama.txt` dosyasına da yazılır. Örnekler:
- Tabağındaki Bilim: `sogan-neden-aglatir/youtube/aciklama.txt`
- Bilişim: `ch02-tasa-kazinan-mantik/youtube/aciklama.txt`
- Uykunun Bilimi: `yup-mavi-isik/youtube/aciklama.txt`

## Sınırlar (paketi vermeden önce say)

| Alan | Sınır | Not |
|---|---|---|
| Başlık | 100 karakter | Telefonda ilk ~60 karakter görünür. Önce merak sorusu, en sonda seri adı ve numarası gelir. |
| Açıklama | 5.000 **bayt** | Türkçe harfler (ç ğ ı ö ş ü İ) 2 bayt, emoji 4 bayt sayılır. Hem karakteri hem baytı yaz. `<` ve `>` kullanılmaz. |
| Bölümler | İlki `0:00`, en az 3 bölüm, her biri ≥10 sn | `node video/araclar/bolumler.cjs video/<bolum> [--satir]` |
| Etiketler | 500 karakter | Virgüller sayılır, boşluk içeren etikete +2 eklenir. ~25 etiket hedeflenir. |
| Hashtag | Açıklamadaki ilk 3 hashtag başlığın üstünde görünür | Seri hashtag'i ilk sırada olur. |
| Kapak | 1280×720, 2 MB altı, 16:9 | Sağ alt köşe boş kalır (süre etiketi oraya gelir). |

Sayım için:
```bash
python3 -c "import sys;s=open(sys.argv[1]).read();print(len(s),'karakter',len(s.encode()),'bayt')" aciklama-govde.txt
```

## Paket şablonu

```
YUP AKADEMİ · <SERİ> #N · <BÖLÜM ADI> · YOUTUBE YÜKLEME PAKETİ
Video: <bolum>-youtube.mp4 (M:SS) · Altyazı: altyazi-tr.srt

1) BAŞLIK
<Seçilen başlık>
Alternatifler:
• …
• …

2) AÇIKLAMA  (çizgiler arasını olduğu gibi yapıştır; X karakter / Y bayt, sınır 5.000)
----------------------------------------
<İlk cümle: aranan soruyu ve cevabın kancasını taşır; anahtar kelimeler burada (~140 karakter)>

<İkinci paragraf: bu videoda ne göreceksin, sonunda ne kazanacaksın.>

<Seri satırı: "🍳 Tabağındaki Bilim serisinin N. bölümü. Serinin tamamı: [OYNATMA LİSTESİ BAĞLANTISI]">

▶ BU VİDEODA NELER ÖĞRENECEKSİN?   (Bilişim'de: madde listesi, emoji yok)
• … (6–9 madde; her biri tek cümle, somut bilgi ve sayı içerir)

BÖLÜMLER
0:00 <merak sorusu>
0:28 …
…

✅ BU AKŞAM DENE        (Tabağındaki Bilim / Uykunun Bilimi)
1. …: <neden>
…

🔍 EFSANE Mİ, GERÇEK Mİ?   (Tabağındaki Bilim)
• <inanç>: ŞÜPHELİ (kısa gerekçe)
…

💬 <izleyiciye soru, yorum daveti>. Sıradaki bölüm: <sonraki sorunun kendisi>
🔔 Yeni bölümler için abone ol.

📚 KAYNAKLAR
<Konu>: <Yazar> vd., <Dergi> <Yıl> · https://doi.org/…
…

YUP Akademi · merak edenler için.

#<SeriHashtag> #<konu> #<konu2>
----------------------------------------

3) ETİKETLER  (virgüllerle birlikte yapıştır; N etiket, ≈ X / 500)
<seri adı>, <ana konu>, <arama cümleleri: "soğan neden ağlatır", "… nasıl", "… neden">, <ilgili terimler>, <genel: bilim, popüler bilim, eğitici video>, YUP Akademi

4) YOUTUBE STUDIO AYARLARI
• Oynatma listesi    : "<Seri> | YUP Akademi" (Bilişim: "Bilişim Teknolojileri Yetkinliği | Dijital Dünyayı Baştan Sona Anlamak"); liste yoksa liste açıklaması da ver
• İzleyiciler        : Hayır, çocuklara özel değil
• Değiştirilmiş veya yapay içerik : EVET (seslendirme kanal sahibinin sesinden yapay zekâyla üretildi; cezası yok, küçük bir etiket eklenir)
• Dil                : Türkçe · Altyazılar → Dosya yükle → "Zamanlamayla" → altyazi-tr.srt
• Kategori           : Tabağındaki Bilim/Uykunun Bilimi: Bilim ve Teknoloji (alt. Eğitim) · Bilişim: Eğitim
• Lisans             : Standart YouTube Lisansı · Yerleştirmeye izin ver
• Yorumlar           : Açık; sıralama "En popüler"
• Bitiş ekranı       : son 15–20 sn (M:SS – M:SS). Hangi tarafın boş olduğunu yaz (karakter ya da ortadaki yazı kapanmasın).
                       Öğeler: Abone ol + sıradaki video (yayınlandıysa) ya da oynatma listesi.
• Bilgi kartları     : 2–3 kart (önceki bölüm başta, seri listesi ortada, sıradaki bölüm sonda)

5) SABİTLENMİŞ YORUM
<Tahmin ya da deneyim soran bir soru + zaman damgası + sıradaki bölümün kancası>

6) KÜÇÜK RESİM
<Gemini promptu; bkz. gemini-promptlari.md>
```

## Yazım ipuçları

- **Başlık.** Arama dilinde soru sor ("Soğan Doğrarken Neden Ağlarız?") ve ardından şaşırtan bir kanca ekle ("Hızlı Doğramak İşe Yaramıyor"). Bilişim'de bölüm adı başta durur ("Taşa Kazınan Mantık: Elektrik Nasıl Düşünür?").
- **İlk cümle.** İzleyicinin arayacağı soruyu ve cevabın ilk ipucunu taşır.
- **Madde listesi.** Videodaki gerçek ve kaynaklı bilgilerden oluşur, sayılar rakamla yazılır ("saniyede 40 metre, yani saatte 144 kilometre"). Spoiler'dan korkma: arama ve izleyici güveni için iyidir.
- **Bölüm adları.** Merak uyandıran kısa sorular kullan ("Sarımsak neden ağlatmaz?").
- **Seride gezinme** (Bilişim): `SERİDE` bloğu, ardından `◀ Önceki: … [BAĞLANTI]`, `▶ Sıradaki: …` ve `Oynatma listesi: [BAĞLANTI]` satırları.
- **Bağlantılar.** Kullanıcının dolduracağı yerleri köşeli büyük harfle bırak: `[OYNATMA LİSTESİ BAĞLANTISI]`.
- **Etiketler.** Arama cümlelerini olduğu gibi ekle ("soğan doğrarken ağlamamak"). Son etiket kanal adıdır: Bilişim'de "YUP Stüdyo", diğer serilerde "YUP Akademi".

## Altyazı

```bash
node video/araclar/altyazi.cjs video/<bolum> video/<bolum>/youtube/altyazi-tr.srt
```

- SRT, filmin seslendirme planından (`cue`/`end`) yazılır. `dub.mjs` sesi bu anlara hizaladığı için zamanlar sesle örtüşür.
- `voice.js` taze olmalı.
- Satır en fazla 42 karakter, iki satırdır. Ekrandaki özgün yazım korunur ("S-oksit", "ENIAC").
- Videoya gömülmez. Kullanıcı YouTube'a ayrıca yükler.
