# Üretim akışı

Haftada 7 gönderi (4 Reels, 2 carousel, 1 tek görsel) ve her gün 3-5 story. Tüm üretim yapay zekâ ve grafikle yapılır; tek bir kişi haftada yaklaşık 10-12 saatte yetiştirebilir.

## Haftalık döngü

| Ne zaman | Ne yapılır | Araç |
|---|---|---|
| Pazar akşamı (1 saat) | Gelecek haftanın 7 konusunu takvimden al, metin asistanına `/hafta` komutunu ver | ChatGPT (Metin asistanı) |
| Pazartesi (1 saat) | Sağlık içeren metinleri uzmana gönder | WhatsApp / e-posta |
| Pazartesi-Salı (3 saat) | Görselleri üret: karakter sahneleri, objeler, kolaj parçaları | ChatGPT (Görsel promptları) |
| Salı-Çarşamba (4 saat) | Carousel ve kapakları Canva'da diz; Reels seslendirmesini ElevenLabs'te üret ve CapCut'ta kurgula | Canva, ElevenLabs, CapCut |
| Çarşamba | Uzman dönüşlerini işle, damgayı yalnızca onaylananlara bas, haftayı planla | Meta Business Suite |
| Her gün (20 dk) | Story'ler ve yorum/DM yanıtları | Instagram |

## Günlük story ritmi

| Saat | Story | Amaç |
|---|---|---|
| 09.00 | "Günaydın" + günün mini bilgisi (tek cümle, Ada ya da Defne görseli) | Alışkanlık |
| 13.00 | Anket / test / emoji kaydırıcı ("Bugün kaç saat uyudun?") | Etkileşim ve veri |
| 19.00 | Günün gönderisini paylaş + "kaydet" hatırlatması | Erişim |
| 22.30 | Gece nöbeti ("Şu an uyanık olan anneler, buradayız 🌙") | Duygusal bağ |
| Cumartesi | Soru kutusu: "Ada ve Defne'ye sor" → cevaplar Çarşamba Reels'ine konu olur | Topluluk |

## Paylaşım saatleri

- Reels ve carousel: hafta içi **21.00-22.30**, hafta sonu **11.00-12.00**. Yeni anneler gece emzirmesinden önce, hamileler akşam dinlenirken telefondadır.
- Gece Notları: Pazar **22.30**.
- İlk 60 dakikada gelen her yoruma cevap verin. Cevaplar Ada ya da Defne'nin ağzından değil, "AnneKolay ekibi" olarak, sıcak ve kısa yazılır.

## Canva kurulumu

1. **Marka Kiti** oluşturun. Renk paleti: `krem` #FAF8F5, `keten` #EFE6D8, `toprak` #5A4426, `bronz` #8C6D3B, `altin` #D4AF37, `adacayi` #8A9A86, `adacayi-acik` #DCE3D8, `adacayi-derin` #4F5E4B, `kiremit` #C2785C, `seftali` #F2D3C2, `kil-derin` #8A4A33, `gece` #2E2A26.
2. Yazı tipleri: Başlık **Cormorant Garamond**, alt başlık ve gövde **Poppins**, el yazısı **Caveat**. Üçü de Canva'da hazırdır.
3. Logo: AnneKolay amblemi (Varlıklar → Logo).
4. Bu kitteki örnek gönderileri (Varlıklar → Şablonlar) Canva'ya yükleyip birebir şablon olarak kurun: Carousel kapağı, carousel iç sayfası, Gece Notu, Uzman Masası, Reels kapağı, Story anketi. Her şablon bir kez kurulur, sonra yalnızca metin ve karakter değişir.
5. Kolaj parçalarını (bant, yırtık kâğıt, polaroid çerçevesi, damga) ChatGPT'den şeffaf PNG olarak üretip Canva'da "Marka Kiti → Grafikler" klasörüne koyun.

## Reels üretimi

1. Metin asistanına `/reels` komutunu verin; sahne sahne senaryo, ekran yazısı ve ElevenLabs metni gelir.
2. Seslendirme: Ada ve Defne için iki ayrı ElevenLabs sesi seçin ve hiç değiştirmeyin (karakter sesleri tanınır olmalı). Model Multilingual v2, stability %50, style %0-15. Her sahneyi ayrı dosya olarak üretin.
3. Görseller: sahnelerdeki karakterleri ChatGPT'de şeffaf arka planla üretin. Kâğıt katmanlarını CapCut'ta ayrı katman yapıp hafif kaydırın (parallax). Bu, "stop-motion kâğıt" hissi verir.
4. Kurgu: 30-60 sn, ilk 3 saniyede kanca cümlesi ekranda, kelime kelime altyazı (Poppins SemiBold, `toprak`, aktif kelime `bronz` zemin üzerinde krem), sonda "kaydet / hamile bir arkadaşına gönder" çağrısı.
5. Kapak: Reels kapağı şablonu. Başlık ve karakter ortadaki 3:4 alanda kalır.
6. Fon müziği Instagram içinden, %5-10 seviyede eklenir; seslendirme her zaman net duyulur.

## Uzman onay akışı

1. Metin asistanı her sağlık içeriğini `[UZMAN ONAYI GEREKLİ]` etiketiyle teslim eder.
2. Uzman metni okur, düzeltir, onaylar. Onay tarihi ve uzmanın adı bir tabloya yazılır.
3. Yalnızca onaylanan gönderiye `Damga` basılır ve açıklamaya "Uzman kontrollü" eklenir. Uzmanın adı, izni varsa açıklamada etiketlenir.
4. Onaylanmayan içerik yayınlanmaz; yerine aynı gün için hazır bir duygusal ya da topluluk gönderisi konur.

## Açıklama metni yapısı

1. **Kanca satırı** (ilk 125 karakter, "devamı" kesilmeden okunur)
2. **Değer:** 3-5 kısa satır, madde ya da numaralı
3. **Ne zaman doktora** satırı (sağlık içeriğinde)
4. **Soru:** yorum isteyen tek bir soru ("Sen kaçıncı haftadasın?")
5. **Çağrı:** "Kaydet, lazım olacak" / "Hamile bir arkadaşına gönder"
6. Uyarı notu (sağlık içeriğinde)
7. **3-5 hashtag**

## Hashtag bankası

Her gönderide 3-5 hashtag kullanılır. Her zaman marka etiketi olan #annekolay, ardından segmentten iki ve konudan bir-iki etiket gelir.

- Marka: #annekolay #annedefteri
- Hamilelik: #hamilelik #gebelik #hamileanne #hamilelikhaftaları #ilkhamileliğim
- Yeni anne: #yenianne #lohusalık #yenidoğan #bebekbakımı #emzirme
- Ortak: #annelik #annebebek #bebekgelişimi #ilkkezanne

## Haftalık ölçüm

Takipçi sayısından önce bunlara bakılır (Instagram İstatistikler, her Pazartesi):

| Metrik | Neden | İlk 3 ay hedefi |
|---|---|---|
| Kaydetme / erişim | Bilginin değerli bulunduğunu gösterir | %3 ve üzeri |
| Paylaşım (DM) / erişim | "Arkadaşına gönder" çalışıyor mu | %2 ve üzeri |
| Yorum sayısı | Topluluk oluşuyor mu | Gönderi başına 10+ |
| Profil ziyaretinden takibe dönüşüm | Profil ve ızgara ikna ediyor mu | %20 ve üzeri |
| Reels 3. saniye izlenme | Kanca tutuyor mu | %60 ve üzeri |
| Story anket katılımı | Sadık çekirdek kitle | Story görüntüleyenlerin %10'u |

Her ayın sonunda en çok kaydedilen 3 gönderi bir sonraki ayın serilerini belirler.
