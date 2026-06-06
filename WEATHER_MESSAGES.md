# Hava Durumu Mesaj Sistemi Dokümantasyonu

Bu dosya, **Skyde** uygulamasındaki tüm hava durumu mesajlarının kurallarını, şablonlarını ve eşik değerlerini tanımlar. `WeatherMessageService` sınıfı bu dokümana göre mesaj üretir.

**Ses tonu:** Yeni veya güncellenen metinler için önce [MESSAGE_TONE.md](MESSAGE_TONE.md) dosyasına bakın (yaklaşık %70 zeki, %20 hafif mizah, %10 sıcak “sen” dili).

---

## 1. Hava Durumu Tipleri ve WMO Kod Eşlemesi

| Tip ID           | Türkçe               | WMO Kodları                | Görsel Tema (`WeatherDisplayType`) |
| ---------------- | -------------------- | -------------------------- | ---------------------------------- |
| `clear`          | Açık Hava            | 0                          | `sunny`                            |
| `partlyCloudy`   | Parçalı Bulutlu      | 1, 2                       | `sunny`                            |
| `cloudy`         | Bulutlu / Kapalı     | 3                          | `cloudy`                           |
| `foggy`          | Sisli / Puslu        | 45, 48                     | `cloudy`                           |
| `drizzle`        | Çisenti              | 51, 53, 55                 | `rainy`                            |
| `rain`           | Yağmurlu             | 61, 63                     | `rainy`                            |
| `heavyRain`      | Şiddetli / Sağanak   | 65, 80, 81, 82             | `rainy`                            |
| `freezingRain`   | Dondurucu Yağmur     | 56, 57, 66, 67             | `rainy`                            |
| `snow`           | Kar Yağışı           | 71, 73, 75, 77, 85, 86    | `snowy`                            |
| `thunderstorm`   | Fırtına              | 95                         | `rainy`                            |
| `hail`           | Dolu ile Fırtına     | 96, 99                     | `rainy`                            |
| `extremeHeat`    | Kavurucu Sıcak       | Kod yok — `temp >= 35°C`  | `sunny`                            |
| `frost`          | Don / Ayaz           | Kod yok — `temp <= 2°C`   | `snowy`                            |
| `windy`          | Kuvvetli Rüzgar      | Kod yok — `wind >= 40 km/s`| `cloudy`                           |

### Tip Belirleme Öncelik Sırası

Birden fazla koşul aynı anda geçerli olabilir. Öncelik (yüksekten düşüğe):

1. `hail` — weatherCode >= 96
2. `thunderstorm` — weatherCode >= 95
3. `frost` — temp <= 2°C (WMO kar kodları yoksa)
4. `extremeHeat` — temp >= 35°C ve weatherCode <= 3
5. `windy` — windSpeed >= 40 km/s ve yağış yok
6. `freezingRain` — weatherCode 56, 57, 66, 67
7. `heavyRain` — weatherCode 65, 80, 81, 82
8. `snow` — weatherCode 71-77, 85-86
9. `rain` — weatherCode 61, 63
10. `drizzle` — weatherCode 51, 53, 55
11. `foggy` — weatherCode 45, 48
12. `cloudy` — weatherCode == 3
13. `partlyCloudy` — weatherCode 1, 2
14. `clear` — weatherCode == 0

---

## 2. Zaman Dilimleri

| Dilim     | Saat Aralığı | Başlık Öneki Örnekleri                  |
| --------- | ------------ | --------------------------------------- |
| `morning` | 06:00–12:00  | "Bu sabah...", "Sabah saatlerinde..."   |
| `afternoon` | 12:00–17:00 | "Öğleden sonra...", "Öğle saatlerinde..." |
| `evening` | 17:00–21:00  | "Bu akşam...", "Akşam saatlerinde..."   |
| `night`   | 21:00–06:00  | "Bu gece...", "Gece boyunca..."         |

---

## 3. Eşik Değerleri ve Özel Durumlar

### Genel Eşikler

| Durum               | Koşul                                       |
| ------------------- | -------------------------------------------- |
| Don riski           | `temperature <= 2°C`                         |
| Dolu riski          | `weatherCode >= 96`                          |
| Fırtına             | `weatherCode >= 95`                          |
| Aşırı Sıcak         | `temperature >= 35°C`                        |
| UV uyarısı          | Açık hava (`weatherCode <= 2`) + saat 12–15  |
| Sel riski           | `precipSum > 30 mm/gün` veya saatlik `precip > 10 mm` |
| Kuvvetli rüzgar     | `windSpeed >= 40 km/s`                       |
| Çok kuvvetli rüzgar | `windSpeed >= 60 km/s`                       |

### Çiftçi Moduna Özel Eşikler

| Durum               | Koşul                                                              |
| ------------------- | ------------------------------------------------------------------ |
| İlaçlama penceresi  | `windSpeed < 15 km/s` + `humidity 40–80%` + `precipProb < 30%` + fırtına yok |
| Sulama önerisi      | `soilMoisture < 0.3` + `precipProb < 40%` + yağmur yağmıyor       |
| İlaçlama uygun değil| `windSpeed >= 15 km/s` VEYA `precipProb >= 30%` VEYA yağmur var    |
| Hasat uyarısı       | 48 saat içinde yağış bekleniyor (`precipProb >= 60%`)              |

---

## 4. Mesaj Şablonları — Bugün

Her hava tipi için **Şehir Modu** ve **Çiftçi Modu** tamamen farklı mesajlar içerir.
Saat bilgisi olan mesajlarda `{saat}` yer tutucusu, yağış aralığı olanlarda `{yagisAraligi}` yer tutucusu kullanılır.

### 4.1 `clear` — Açık Hava

#### Şehir Modu

| Zaman Dilimi | Başlık (Headline) |
|---|---|
| Sabah | Güneşli ve güzel bir sabah; dışarıda kahveni içip güne enerjik başlayabilirsin. |
| Öğle | Öğleden sonra gökyüzü tertemiz; güneş gözlüğünü ve şapkanı alıp dışarıda vakit geçirebilirsin. |
| Akşam | Bu akşam hava sakin ve serin; kısa bir yürüyüş veya açık havada oturmak için ideal. |
| Gece | Gece boyunca açık ve sakin bir hava var; rahat bir uyku için pencereni hafif aralayabilirsin. |

| Zaman Dilimi | Alt Yazı (Subtitle) |
|---|---|
| Sabah | Şu an {temp}°C, nem %{nem}. Güneşli ve rüzgarsız. |
| Öğle | Şu an {temp}°C. Güneş tepe noktada, gözlüğünü unutma. |
| Akşam | Şu an {temp}°C. Akşam serinliği başlıyor, ince bir hırka yeterli. |
| Gece | Şu an {temp}°C. Sakin ve berrak bir gece. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Hava güzel; güneş kremi sür ve bol su iç. Gün boyu dışarıda vakit geçirebilirsin. |
| Öğle | UV oranı yüksek olabilir; 12:00–15:00 arası doğrudan güneş altında kalma süreni kısalt. Şapka ve güneş kremi kullan. |
| Akşam | Hava sakin; dışarıda yemek, yürüyüş ya da bisiklet için ideal koşullar. |
| Gece | Olağandışı bir durum yok. Gece boyunca hava sakin kalacak. |

#### Çiftçi Modu

| Zaman Dilimi | Başlık (Headline) |
|---|---|
| Sabah | Sabah güneşli ve rüzgar hafif; ilaçlama ve tarla işleri için en verimli saatler başlıyor. |
| Öğle | Öğleden sonra güneş etkili; toprak nemi düşüyorsa akşam serinliğinde sulamayı planla. |
| Akşam | Akşam sakin ve serin; sulama, gözlem ve hafif tarla bakımı için uygun. |
| Gece | Gece boyunca hava açık ve sakin; sabah erken ilaçlama veya sulama planlayabilirsin. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | İlaçlama için ideal koşullar: rüzgar düşük, nem uygun. Sabah erkenden başla, öğle sıcağında ara ver. |
| Öğle | Toprak suyu buharlaşıyor; sulama yapacaksan akşam serinliğini bekle. Gün ortasında sulama su israfıdır. |
| Akşam | Akşam sulaması için uygun. Toprak nemini kontrol et; kuruysa bu akşam sula. |
| Gece | Sabah erken tarla işlerine çıkmayı planla. Gece boyunca sorun beklenmİyor. |

---

### 4.2 `partlyCloudy` — Parçalı Bulutlu

#### Şehir Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah parçalı bulutlu ama sıcak; hafif bir mont veya hırka yeterli olacak. |
| Öğle | Öğleden sonra bulutlar arasından güneş açıyor; dışarı planların için sorun yok. |
| Akşam | Akşam parçalı bulutlu ve serin; yürüyüş veya açık hava etkinlikleri için uygun. |
| Gece | Gece parçalı bulutlu ve sakin; yağış beklenmiyor, rahatça dinlenebilirsin. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Hava genel olarak güzel. Yağmur beklenmiyor; günlük planlarını rahatça yapabilirsin. |
| Öğle | Güneş zaman zaman çıkıyor; uzun süre dışarıdaysan güneş kremi ve su yanında olsun. |
| Akşam | Akşam serin olabilir; ince bir hırka veya ceket al. Yağış riski düşük. |
| Gece | Olağandışı bir durum yok; gece sakin geçecek. |

#### Çiftçi Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah parçalı bulutlu; ilaçlama koşulları uygun, rüzgar kontrol edildikten sonra başlanabilir. |
| Öğle | Öğleden sonra bulutlu ama yağışsız; tarla gözlemi ve bakım işleri için uygun. |
| Akşam | Akşam sakin; sulama ve hafif tarla işleri yapılabilir. |
| Gece | Gece boyunca yağış beklenmiyor; sabah ilaçlama planlanabilir. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Bulutlar güneşi kesiyor ama ilaçlama için sorun değil. Rüzgarı kontrol et ve sabah erkenden başla. |
| Öğle | Toprak nemi normal seviyelerdeyse sulama ertelenebilir. Bulutlu hava buharlaşmayı azaltıyor. |
| Akşam | Akşam sulaması verimli olacak; buharlaşma düşük. |
| Gece | Sabaha kadar sorun beklenmİyor. Erken saatlerde tarla işlerine başlayabilirsin. |

---

### 4.3 `cloudy` — Bulutlu / Kapalı

#### Şehir Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah gökyüzü kapalı ama yağış beklenmiyor; ince bir ceket veya mont al. |
| Öğle | Öğleden sonra bulutlu; güneş çıkması zor görünüyor ama yağış ihtimali düşük. |
| Akşam | Akşam kapalı ve serin; dışarı çıkacaksan üstüne bir şey al. |
| Gece | Gece boyunca kapalı hava devam edecek; yağış beklenmiyor. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Yağmur ihtimali düşük ama hava kapalı. Üşümemek için ince bir kat giyin. |
| Öğle | Güneş yok ama yağmur da yok; dışarı planların için engel görünmüyor. |
| Akşam | Akşam biraz daha serinleyebilir; kalın bir hırka veya ceket iyi olur. |
| Gece | Gece sakin; endişe edilecek bir durum yok. |

#### Çiftçi Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah bulutlu ama yağışsız; ilaçlama yapılabilir, rüzgarı kontrol et. |
| Öğle | Öğleden sonra kapalı hava; buharlaşma düşük, sulama yapacaksan erteleyebilirsin. |
| Akşam | Akşam bulutlu ve serin; toprak nemi kontrol edilip gerekirse sulama yapılabilir. |
| Gece | Gece boyunca yağış beklenmiyor; sabah erken tarla işlerine çıkılabilir. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Kapalı hava ilaçlama için kötü değil; buharlaşma düşük olduğundan ilacın etkisi uzun sürer. Rüzgarı kontrol et. |
| Öğle | Bulutlu havada toprak daha yavaş kurur; sulama acil değilse öğleden sonraya bırak. |
| Akşam | Toprak nemini elle kontrol et; kuruyorsa bu akşam sulama yap. |
| Gece | Sabah erken işlere başlamak için uygun koşullar bekleniyor. |

---

### 4.4 `foggy` — Sisli / Puslu

#### Şehir Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah yoğun sis var; araç kullanıyorsan sis farlarını aç ve yavaş git. |
| Öğle | Öğleden sonra sis dağılıyor; görüş mesafesi artıyor ama yolda dikkatli ol. |
| Akşam | Akşam hafif pus var; yürürken ve araç kullanırken görüş mesafesine dikkat et. |
| Gece | Gece boyunca sis ve pus etkili; dışarıda hareket edeceksen çok dikkatli ol. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Görüş mesafesi çok düşük olabilir. Araçta sis farlarını aç, hızını düşür. Yürürken açık renkli giyin. |
| Öğle | Sis genellikle öğleye doğru dağılır; yine de trafikte dikkatli ol. |
| Akşam | Akşam yeniden puslanabildilir; dışarıda hareket edeceksen reflektörlü veya parlak giysiler tercih et. |
| Gece | Görüş çok sınırlı; araç kullanmak zorundaysan sis farları + düşük hız. |

#### Çiftçi Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah yoğun sis var; ilaçlama yapma, nem çok yüksek ve ilacın etkisi azalır. |
| Öğle | Öğleye doğru sis açılıyor; açıldıktan sonra ilaçlama yapılabilir. |
| Akşam | Akşam hafif pus var; ilaçlama için uygun değil, sulama yapılabilir. |
| Gece | Gece boyunca yoğun nem ve sis var; tarla işleri sabaha bırakılmalı. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Sis sırasında ilaçlama yapma; nem %90 üstünde olduğunda ilaç tutmaz ve damla oluşur. Sis açılana kadar bekle. |
| Öğle | Sis kalktıysa ve rüzgar uygunsa ilaçlama yapılabilir. Toprak nemini kontrol et. |
| Akşam | Yoğun nem koşullarında mantari hastalık riski artar; yaprak gözlemi yap. |
| Gece | Gece nemi ve sis, bitkilerde mantari hastalık riskini artırır. Sabah tarlayı kontrol et. |

---

### 4.5 `drizzle` — Çisenti

#### Şehir Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah hafif çisenti var; şemsiye veya kapüşonlu bir mont al, fazla ıslanmazsın ama hazırlıklı ol. |
| Öğle | Öğleden sonra çisenti devam ediyor; kısa işler için dışarı çıkabilirsin ama şemsiyeni yanında tut. |
| Akşam | Akşam hafif çisenti var; yürüyüşe çıkacaksan su geçirmez bir ceket iyi olur. |
| Gece | Gece hafif çisenti devam edecek; dışarıda bıraktığın eşyaları içeri al. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Hafif yağış; şemsiye veya yağmurluk yeterli. Yollar hafif ıslak olabilir, dikkatli yürü. |
| Öğle | Çisenti devam ederse de günlük planlarını çok etkilemez; yanında yağmurluk bulundur. |
| Akşam | Çisenti hafifliyorsa dışarı çıkmak sorun değil ama bir yağmurluk al. |
| Gece | Olağandışı bir durum yok; hafif çisenti sabaha kadar devam edebilir. |

#### Çiftçi Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah çisenti var; ilaçlama yapma, ilacı yağmur yıkar. Sulama da gereksiz. |
| Öğle | Öğleden sonra çisenti devam ediyor; tarla işlerini ertele, toprak ıslanıyor. |
| Akşam | Akşam hafif çisenti; toprak nem alıyor, sulama yapma. Drenajı kontrol et. |
| Gece | Gece çisenti devam edecek; sabah toprak nemini kontrol edip planlama yap. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Çisenti sırasında ilaçlama kesinlikle yapma; ilaç tutmaz ve yıkanır. Yağış durduğunda en az 2 saat bekle. |
| Öğle | Toprak ıslak; traktör ve ağır ekipmanla tarlaya girme, toprak sıkışır. |
| Akşam | Sulama gereksiz; yağış toprak nemini artırıyor. Drenaj kanallarını kontrol et. |
| Gece | Sabah tarlayı kontrol et; toprak nemini ölç ve buna göre günü planla. |

---

### 4.6 `rain` — Yağmurlu

#### Şehir Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah yağmur yağıyor; şemsiyeni ve su geçirmez ayakkabılarını al, yolda dikkatli ol. |
| Öğle | Öğleden sonra yağmur devam ediyor; dışarı zorunlu işler için çık, şemsiyeni unutma. |
| Akşam | Bu akşam yağmur var; dışarı çıkacaksan yağmurluğunu giy ve ıslak yollara dikkat et. |
| Gece | Gece boyunca yağmur devam edecek; araç kullanacaksan görüş mesafesine dikkat et. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Yağmur devam ediyor. Şemsiye ve su geçirmez ayakkabı şart. Trafikte mesafe bırak, frenleme mesafesi uzar. |
| Öğle | Yağmur durmazsa dışarı planlarını ertele veya kapalı mekanlara yönel. Otopark tercihin kapalı olsun. |
| Akşam | Islak yollarda dikkatli yürü; ayakkabılarının tabanı kaymaya uygun olmasın. |
| Gece | Gece yağmur altında araç kullanmak zorundaysan sis farlarını ve silecekleri kontrol et. |

#### Çiftçi Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah yağmur yağıyor; bugün ilaçlama ve gübreleme yapma, yağış sonrasını bekle. |
| Öğle | Öğleden sonra yağmur devam ediyor; tarla işlerini ertele, drenajı kontrol et. |
| Akşam | Akşam yağmur var; sulama yapma, toprak zaten nem alıyor. Drenaj kanallarını kontrol et. |
| Gece | Gece yağmur devam edecek; sabah toprak durumunu değerlendir, ıslaksa tarlaya girme. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Yağmur altında ilaçlama ve gübreleme yapma; ilaç yıkanır, gübre akar. Yağış bittikten sonra en az 4 saat bekle. |
| Öğle | Toprak ıslak; ağır ekipmanla tarlaya girme, toprak sıkışır ve kök bölgesine zarar verir. |
| Akşam | Drenaj kanallarını kontrol et; tarlada su birikmesi varsa tahliye yap. Sulama kesinlikle gereksiz. |
| Gece | Sabah tarlayı kontrol et; toprak çok ıslaksa kurumasını bekle, 24-48 saat ertele. |

---

### 4.7 `heavyRain` — Şiddetli Yağmur / Sağanak

#### Şehir Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah şiddetli yağmur var; zorunlu olmadıkça dışarı çıkma, sel ve su baskını riskine dikkat et. |
| Öğle | Öğleden sonra sağanak devam ediyor; alt geçitlerden ve dere yataklarından uzak dur. |
| Akşam | Bu akşam şiddetli yağmur bekleniyor; dışarıdaki eşyalarını içeri al, pencerelerini kapat. |
| Gece | Gece boyunca sağanak devam edecek; araç kullanma, sel riski var. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Şiddetli yağış; alt geçitler ve çukur bölgelerde su birikebilir. Araçla su birikintilerine girme. Mümkünse evde kal. |
| Öğle | Sağanak yağış sürerken trafikte olmaktan kaçın. Bodrum ve zemin katlarını kontrol et, su sızması olabilir. |
| Akşam | Dışarıda bırakılmış eşyaları, çamaşırları ve saksıları içeri al. Pencere ve balkonları kapat. |
| Gece | Gece sel uyarılarını takip et. Cep telefonunu şarjlı tut; acil durumda hazır ol. |

#### Çiftçi Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah şiddetli yağmur; tüm tarla işlerini iptal et, ekipmanları kapalı yere al. |
| Öğle | Sağanak devam ediyor; drenaj kanallarını ve set yapılarını kontrol et, taşma riski var. |
| Akşam | Akşam şiddetli yağış; tarlada su birikmesi kontrolü yap, hayvanları kapalı alanlara al. |
| Gece | Gece boyunca sağanak sürecek; sabah sel hasarını kontrol et. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Şiddetli yağışta kesinlikle tarlaya girme. Drenajları aç, tıkanıklık varsa gider. Ekipmanları kapalı yere al. |
| Öğle | Toprak doymuş durumda; yağış sonrası en az 48 saat tarlaya girme. Sel riski olan bölgeleri kontrol et. |
| Akşam | Tarlada su baskını kontrolü yap. Sera ve örtü altı yapıları kontrol et. Hayvanları içeri al. |
| Gece | Acil durumda drenajı kontrol et. Sabah hasar tespiti yap; erozyon ve kök çürümesi riski var. |

---

### 4.8 `freezingRain` — Dondurucu Yağmur

#### Şehir Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah dondurucu yağmur var; yollar ve kaldırımlar buz tutmuş olabilir, çok dikkatli yürü. |
| Öğle | Öğleden sonra dondurucu yağmur etkili; araç kullanma, yollar çok kaygan. |
| Akşam | Bu akşam dondurucu yağmur bekleniyor; dışarı çıkmaktan kaçın, yollar çok tehlikeli. |
| Gece | Gece dondurucu yağmur devam edecek; sabah yollar buz olacak, erken çıkacaksan çok dikkat et. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Yollar ve kaldırımlar buz kaplı olabilir. Dışarı çıkmak zorundaysan kaymaz tabanlı ayakkabı giy, adımlarını kısa at. |
| Öğle | Araçta kış lastiği yoksa trafiğe çıkma. Frenleme mesafesi normalin 5 katına çıkar. |
| Akşam | Mümkünse evde kal. Dondurucu yağmur en tehlikeli hava olaylarından biridir. |
| Gece | Sabah yollar tamamen buzlu olacak. Erken yola çıkacaksan aracını önceden çalıştır ve ısıt. |

#### Çiftçi Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah dondurucu yağmur; tüm tarla işlerini iptal et, meyve ağaçları ve fideler ciddi risk altında. |
| Öğle | Öğleden sonra donma devam ediyor; sera ve örtü altı yapıları kontrol et, çökme riski var. |
| Akşam | Akşam dondurucu yağmur etkili; bitkileri acil olarak örtü ile koru. |
| Gece | Gece boyunca buz tabakası oluşacak; dallar kırılabilir, örtüleri kontrol et. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Dondurucu yağmur bitkileri öldürebilir. Hassas fideleri ve meyve ağaçlarını hemen örtü ile sar. Sulama yapma. |
| Öğle | Sera ve tünel yapılarında buz birikimi çökmeye yol açabilir; üstlerini temizle. |
| Akşam | Tüm hassas bitkileri örtü altına al. Sera ısıtmalarını çalıştır. |
| Gece | Dal kırılması riski var; ağaçların altından geçme. Sabah hasar tespiti yap. |

---

### 4.9 `snow` — Kar Yağışı

#### Şehir Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah kar yağıyor; kalın giyin, kaymaz ayakkabı giy ve yollara dikkat et. |
| Öğle | Öğleden sonra kar devam ediyor; araç kullanacaksan kış lastiği ve zincir kontrol et. |
| Akşam | Bu akşam kar yağışı var; dışarıda kalmaktan kaçın, yollar kaygan. |
| Gece | Gece boyunca kar bekleniyor; sabah yollar kaplı olacak, erken çık veya evde kal. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Kalın mont, bere, eldiven ve atkı giy. Yollarda buzlanma olabilir; yavaş yürü, adımlarını kısa at. |
| Öğle | Araçta yakıt, battaniye ve fener bulundur. Kış lastiği şart; zincirleri kontrol et. |
| Akşam | Evde sıcak kal. Dışarıda bırakılan boruları ve muslukları dona karşı koru. |
| Gece | Sabah kar temizliği gerekecek; kürek ve tuz hazırla. Elektrik kesintisine karşı el feneri hazır tut. |

#### Çiftçi Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah kar yağıyor; tüm tarla işlerini iptal et, sera ve örtüleri kontrol et. |
| Öğle | Öğleden sonra kar devam ediyor; sera çatılarındaki kar birikimini temizle, çökme riski var. |
| Akşam | Akşam kar etkili; hayvanları kapalı alanlara al, su borularını dona karşı koru. |
| Gece | Gece boyunca kar ve don; seraları ısıt, hassas ürünleri acil olarak örtü altına al. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Kar ve don riski birlikte geliyor. Fideler ve hassas ürünler için çift kat örtü kur. Sulama borularını kapat. |
| Öğle | Sera çatılarında kar birikiyorsa temizle; ağırlık çökmeye yol açar. İçerideki sıcaklığı kontrol et. |
| Akşam | Hayvanları içeri al; su kaplarındaki buz kırılmalı. Tüm dış muslukları kapat. |
| Gece | Sera ısıtma sistemlerini çalıştır. Sabah hasar ve don kontrolü yap. |

---

### 4.10 `thunderstorm` — Fırtına

#### Şehir Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah gök gürültülü fırtına bekleniyor; zorunlu olmadıkça dışarı çıkma. |
| Öğle | Öğleden sonra fırtına etkili; açık alanlardan, ağaçlardan ve metal yapılardan uzak dur. |
| Akşam | Bu akşam fırtına var; pencere ve kapıları kapat, dışarıda eşya bırakma. |
| Gece | Gece fırtına devam edecek; elektrik kesintisine hazır ol, el feneri hazırla. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Yıldırım riski var; açık alanlardan uzak dur. Şarj edilecek cihazları fişten çek. Mümkünse evde kal. |
| Öğle | Fırtına sırasında ağaç altında durma, yüksek yerlere çıkma. Araçtaysan araçta kal. |
| Akşam | Balkon ve bahçedeki uçucu eşyaları içeri al. Pencere ve kepenkleri kapat. |
| Gece | Elektrik kesintisi olabilir; el feneri ve şarjlı batarya hazırla. Fırtına geçene kadar evde kal. |

#### Çiftçi Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah fırtına bekleniyor; tüm tarla işlerini iptal et, ekipmanları bağla ve içeri al. |
| Öğle | Fırtına devam ediyor; tarlaya kesinlikle çıkma, hayvanları kapalı alana al. |
| Akşam | Akşam fırtına etkili; sera ve örtüleri kontrol et, uçma ve hasar riski var. |
| Gece | Gece fırtına sürecek; sabah hasar tespiti yap, kırık dalları ve devrilenleri kontrol et. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Yıldırım tarlada çok tehlikelidir; kesinlikle açık alanda durma. Sulama pompalarını kapat, elektrik kesilmesine karşı jeneratörü hazırla. |
| Öğle | Ekipmanları kapalı yere al veya sıkıca bağla. Sera örtülerini kontrol et; rüzgar koparabilir. |
| Akşam | Hayvanları içeri al. Sera kapılarını kapat ve mümkünse iç takviye yap. |
| Gece | Sabah tüm tarlayı, seraları ve ekipmanları gez. Hasar tespiti yap ve sigortana bildir. |

---

### 4.11 `hail` — Dolu ile Fırtına

#### Şehir Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah dolu riski var; aracını kapalı yere al, dışarıda durma. |
| Öğle | Öğleden sonra dolu bekleniyor; dışarı çıkma, araçları ve eşyaları koru. |
| Akşam | Bu akşam dolu riski var; pencere ve balkon kapılarını kapat, aracını kapalı yere al. |
| Gece | Gece dolu bekleniyor; araç dışarıdaysa üzerini kalın bir örtüyle ört. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Dolu araçlara ciddi hasar verir; kapalı otopark kullan. Dışarıdaysan hemen bir binaya sığın. |
| Öğle | Dolu sırasında ağaç altına sığınma, dallar kırılabilir. Sağlam bir bina bul. |
| Akşam | Aracın ve eşyaların dışarıdaysa hemen içeri al. Cam kırılma riski var. |
| Gece | Araç dışarıdaysa kalın battaniye veya örtü ile koru. Sabah hasar kontrolü yap. |

#### Çiftçi Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah dolu riski var; ürünleri acil olarak dolu filesi veya örtü ile koru. |
| Öğle | Öğleden sonra dolu bekleniyor; hasat edilecek ürünler varsa hemen topla, koruma önlemlerini al. |
| Akşam | Akşam dolu riski; sera camlarını ve örtü altı yapılarını kontrol et. |
| Gece | Gece dolu bekleniyor; tüm koruma önlemlerinin alındığından emin ol. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Dolu tüm ürünleri yok edebilir. Dolu filesi veya kalın örtü hemen kur. Olgunlaşmış ürünleri acil hasat et. |
| Öğle | Seralarda cam kırılması riski var; mümkünse iç takviye yap. Meyve ağaçlarına koruyucu file ger. |
| Akşam | Tüm koruma önlemlerini kontrol et. Dolu sonrası hasar sigortasına hemen bildir. |
| Gece | Sabah erken hasar tespiti yap. Kırık dalları kes ve yaraları ilaçla. Sigortayı bilgilendir. |

---

### 4.12 `extremeHeat` — Kavurucu Sıcak

#### Şehir Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah bile sıcak başlıyor; bol su iç ve güne erken başla, öğlen molası ver. |
| Öğle | Öğleden sonra kavurucu sıcak; 12:00–16:00 arası doğrudan güneş altında kalma. |
| Akşam | Bu akşam sıcaklık biraz düşse de bunaltıcı; bol su iç ve serinle. |
| Gece | Gece bile sıcak; uyku kaliteniz için odanızı havalandırın veya klima kullanın. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Sıcaklık {temp}°C ve artıyor. Güneş kremi (SPF 50+), şapka ve bol su şart. Yaşlıları ve çocukları kontrol et. |
| Öğle | Güneş çarpması riski çok yüksek. Gölge arayın, her 20 dakikada su için. Açık havada spor yapmayın. |
| Akşam | Asfalt ve beton hâlâ sıcak; çıplak ayakla yürümeyin. Bol su için, hafif giyin. |
| Gece | Gece bile {temp}°C altına düşmeyebilir. Odanızı havalandırın, elektrik kesilmesine karşı hazırlıklı olun. |

#### Çiftçi Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah erkenden tarla işlerine başla; sıcak yükselmeden önce bitirmek önemli. |
| Öğle | Öğle sıcağında kesinlikle tarlada çalışma; güneş çarpması riski çok yüksek. |
| Akşam | Akşam serinliğinde sulama yap; gündüz sulaması suyun buharlaşmasına neden olur. |
| Gece | Gece sulaması için en uygun zaman; buharlaşma en düşük seviyede. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Erken saatlerde (06:00–09:00) çalış, sonra mola ver. Bol su iç, gölgede dinlen. Hayvanların su kaynağını kontrol et. |
| Öğle | 11:00–16:00 arası tarlaya çıkma. Sıcak çarpması belirtileri: baş dönmesi, mide bulantısı. Hemen gölgeye geç ve su iç. |
| Akşam | Akşam sulaması ideal; sabah sulamak yerine akşam sula, toprak gece boyunca nemi tutar. Damla sulama tercih et. |
| Gece | Gece sulaması buharlaşmayı minimuma indirir. Meyve ağaçlarını ve fideleri bol sula. |

---

### 4.13 `frost` — Don / Ayaz

#### Şehir Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah don ve buzlanma riski var; yollarda çok dikkatli ol, adımlarını kısa at. |
| Öğle | Öğleye doğru don etkisi azalıyor ama gölgeli bölgelerde hâlâ buzlanma olabilir. |
| Akşam | Bu akşam hava hızla soğuyor; dışarıda kalmaktan kaçın, kalın giyin. |
| Gece | Gece boyunca don bekleniyor; dış muslukları kapat, boruları dona karşı koru. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Kaldırımlar ve köprüler buzlu olabilir. Araçta kış lastiği şart; camlar buzluysa buz kazıyıcı kullan. Yaşlılar dışarı çıkmasın. |
| Öğle | Don genellikle güneş çıkınca çözülür; yine de gölgeli yerlerde dikkat. Araçta antifrizi kontrol et. |
| Akşam | Akşam hızla soğuyor; mont, eldiven, atkı ve bere giy. Dış muslukları damlat veya kapat. |
| Gece | Boruların donmaması için açık bırak veya izolasyon yap. Soba veya kombi güvenliğini kontrol et. |

#### Çiftçi Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah don var; hassas fideleri ve genç ürünleri acil olarak örtü ile koru. |
| Öğle | Don etkisi azalıyor; örtüleri güneş çıkınca havalandır ama akşam yine kapat. |
| Akşam | Bu akşam sıcaklık sıfırın altına düşecek; tüm koruma önlemlerini şimdi al. |
| Gece | Gece boyunca don etkili; sera ısıtmalarını çalıştır, sulama borularını koru. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Sabah sulama yapma; su donarsa köklere zarar verir. Don çözülene kadar (genellikle 09:00–10:00) bekle. Fidelere çift kat örtü koy. |
| Öğle | Don kalktıysa örtüleri aç ve havalandır; gün boyu kapalı kalırsa bitki terleyemez. Ama akşam yine kapat. |
| Akşam | Gece dona hazırlan: örtüleri kapat, sera kapılarını sıkıca kapa, ısıtmayı aç. Sulama borularını boşalt veya izole et. |
| Gece | Sera içi sıcaklığı izle; 2°C altına düşerse acil müdahale gerekir. Mum veya ısıtıcılarla destek ver. |

---

### 4.14 `windy` — Kuvvetli Rüzgar

#### Şehir Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah kuvvetli rüzgar var; şapka ve hafif eşyalara dikkat et, kapıları tutarak aç. |
| Öğle | Öğleden sonra rüzgar şiddetleniyor; dışarıda reklam panoları ve uçucu eşyalara dikkat. |
| Akşam | Bu akşam rüzgar etkili; balkon ve bahçedeki eşyaları sabitle veya içeri al. |
| Gece | Gece kuvvetli rüzgar devam edecek; pencere ve kapıların sıkıca kapalı olduğundan emin ol. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | Rüzgar {ruzgar} km/s. Şapka uçabilir, saç ve giysilere dikkat. Bisiklet ve motosiklet kullanmaktan kaçın. |
| Öğle | Ağaç altında durmayın, dal kırılabilir. İnşaat alanlarından uzak durun. |
| Akşam | Balkon ve terastaki saksı, şemsiye ve hafif mobilyaları sabitle. |
| Gece | Pencerelerin kapalı olduğundan emin ol. Şiddetli rüzgar gürültüsü normaldir; sakin ol. |

#### Çiftçi Modu

| Zaman Dilimi | Başlık |
|---|---|
| Sabah | Sabah kuvvetli rüzgar var; ilaçlama kesinlikle yapma, ilacın sürüklenmesi tehlikeli. |
| Öğle | Öğleden sonra rüzgar devam ediyor; sera örtülerini ve çit yapılarını kontrol et. |
| Akşam | Akşam rüzgar hâlâ etkili; ekipmanları sabitle, sera kapılarını kapat. |
| Gece | Gece rüzgar devam edecek; sabah hasar kontrolü yap. |

| Zaman Dilimi | Önemli Notlar |
|---|---|
| Sabah | İlaçlama yapma; rüzgar {ruzgar} km/s üzerinde olduğunda ilaç sürüklenir, komşu tarlalara zarar verir ve etkisi azalır. |
| Öğle | Sera örtülerinin sağlamlığını kontrol et; klips ve bağlantıları sıkıştır. Toz ve kum fırtınası riski varsa hayvanları içeri al. |
| Akşam | Rüzgar hâlâ güçlüyse ilaçlama ve toz uygulaması için yarını bekle. Ekipmanları bağla. |
| Gece | Sabah sera ve tarla hasarını kontrol et. Devrilmiş veya kırılmış dalları temizle. |

---

## 5. Mesaj Şablonları — Yarın

Yarın mesajları da aynı detayda olacak. Aşağıda her tip için şablonlar verilmiştir.
Yarın mesajlarında zaman dilimi yoktur (yarın tüm gün tek blok); bunun yerine saatlik yağış aralıkları başlığa eklenir.

### Yarın Başlık Kuralları

1. Saatlik veriden yağışlı saatler (`precipProbability >= 50` veya `precipitation > 0`) çıkarılır
2. Ardışık saatler blok halinde gruplanır (`_formatHours`)
3. Eğer yağış varsa başlığa eklenir: "Yarın {saat aralığı} yağış bekleniyor; {tavsiye}"
4. Eğer yağış yoksa genel durum başlığı kullanılır

### Yarın Şablonları (Şehir Modu)

| Tip | Başlık (yağış yoksa) | Önemli Notlar |
|---|---|---|
| clear | Yarın güneşli ve güzel bir gün; planlarını güvenle yapabilirsin. | Yağmur beklenmiyor; uzun süreli dışarı etkinlikleri için ideal. Güneş kremi ve su unutma. |
| partlyCloudy | Yarın parçalı bulutlu; güneş zaman zaman çıkacak, yağış beklenmiyor. | Hafif bir ceket yeterli; gün boyu dışarıda olabilirsin. |
| cloudy | Yarın gökyüzü kapalı ama yağış ihtimali düşük; ince bir ceket al. | Güneş çıkması zor; kapalı ama kuru bir gün bekleniyor. |
| foggy | Yarın sabah saatlerinde sis bekleniyor; araç kullanırken görüş mesafesine dikkat. | Sis genellikle öğleye doğru açılır; sabah trafiğinde dikkatli ol. |
| drizzle | Yarın hafif çisenti bekleniyor; şemsiye veya yağmurluk yanında olsun. | Şiddetli yağış değil ama ıslak yollar ve kaldırımlara dikkat. |
| rain | Yarın {yagisAraligi} yağmur bekleniyor; şemsiyeni ve yağmurluğunu hazırla. | Dışarı planlarını yağışsız saatlere ayarla. Islak yollarda dikkatli ol. |
| heavyRain | Yarın {yagisAraligi} şiddetli yağış bekleniyor; mümkünse dışarı çıkmayı ertele. | Sel ve su baskını riski var. Alt geçitlerden uzak dur, kapalı otopark kullan. |
| freezingRain | Yarın dondurucu yağmur bekleniyor; yollar çok kaygan olacak, araç kullanmaktan kaçın. | Buzlanma çok tehlikeli; kış lastiği ve zincir şart. Mümkünse evde kal. |
| snow | Yarın kar yağışı bekleniyor; kalın giyin ve kış hazırlığını tamamla. | Yollar kaplı olacak; kış lastiği kontrol et. Yakıt ve erzak stokunu kontrol et. |
| thunderstorm | Yarın gök gürültülü fırtına bekleniyor; dışarı planlarını ertele. | Yıldırım ve kuvvetli rüzgar riski var. Elektronik cihazları fişten çek. |
| hail | Yarın dolu riski var; araçlarını kapalı yere al ve dışarıda eşya bırakma. | Dolu büyük hasar verebilir; cam ve araçları koru. |
| extremeHeat | Yarın kavurucu sıcak bekleniyor; öğle saatlerinde güneş altında kalma. | Bol su iç, güneş kremi ve şapka kullan. 11:00–16:00 arası dışarı çıkmayı sınırla. |
| frost | Yarın sabah don riski var; yollarda buzlanmaya dikkat et, kalın giyin. | Sabah erken yola çıkacaksan aracını önceden ısıt. Dış muslukları koru. |
| windy | Yarın kuvvetli rüzgar bekleniyor; dışarıda hafif eşyalara ve şapkana dikkat et. | Bisiklet ve motosiklet kullanmaktan kaçın. Balkondaki eşyaları sabitle. |

### Yarın Şablonları (Çiftçi Modu)

| Tip | Başlık (yağış yoksa) | Önemli Notlar |
|---|---|---|
| clear | Yarın güneşli; ilaçlama, sulama ve tarla işleri için ideal koşullar bekleniyor. | Rüzgar düşük ve yağış yok; sabah erkenden ilaçlama yap, akşam sula. |
| partlyCloudy | Yarın parçalı bulutlu; ilaçlama yapılabilir, rüzgarı kontrol et. | Bulutlar buharlaşmayı azaltır; sulama verimli olacak. |
| cloudy | Yarın kapalı hava; ilaçlama uygunsa yapılabilir, sulama ihtiyacını kontrol et. | Kapalı havada buharlaşma az; sulama acil değilse ertele. |
| foggy | Yarın sabah sis bekleniyor; sis kalkmadan ilaçlama yapma. | Nem çok yüksek; mantari hastalık riski artar, yaprak gözlemi yap. |
| drizzle | Yarın çisenti bekleniyor; ilaçlama ve gübreleme yapma, yağış durmasını bekle. | Toprak nem alacak; sulama gereksiz. Yağış bittikten sonra 2 saat bekle. |
| rain | Yarın {yagisAraligi} yağış bekleniyor; ilaçlama ve sulama planını ertele. | Tarlaya girme; toprak ıslak olacak. Drenajı kontrol et. |
| heavyRain | Yarın {yagisAraligi} şiddetli yağış bekleniyor; tüm tarla işlerini ertele. | Drenaj ve set yapılarını kontrol et; sel riski var. Ekipmanları kapalı yere al. |
| freezingRain | Yarın dondurucu yağmur; fideleri ve meyve ağaçlarını acil olarak koru. | Dallar buz yüküyle kırılabilir; destek çubuğu koy. Sera ısıtmalarını aç. |
| snow | Yarın kar bekleniyor; sera ve örtüleri kontrol et, hayvanları içeri al. | Kar yükü sera çatılarını çökertebilir; temizle. Sulama borularını koru. |
| thunderstorm | Yarın fırtına bekleniyor; tüm tarla işlerini iptal et, ekipmanları koru. | Yıldırım ve kuvvetli rüzgar riski. Sulama pompalarını kapat, jeneratörü hazırla. |
| hail | Yarın dolu riski var; ürünleri dolu filesiyle koru, olgunlaşmış ürünleri hemen topla. | Dolu tüm hasadı yok edebilir; acil hasat ve koruma önlemi al. Sigorta bilgilerini hazırla. |
| extremeHeat | Yarın çok sıcak; erken saatlerde çalış, öğle molası uzun tut. | 06:00–09:00 arası çalış, 10:00–16:00 arası mola. Akşam sula; gündüz sulama su israfı. |
| frost | Yarın sabah don riski var; hassas fideleri ve genç ürünleri bu akşam örtü ile koru. | Sabah sulama yapma; su donarsa köklere zarar verir. Don çözülene kadar bekle. |
| windy | Yarın kuvvetli rüzgar bekleniyor; ilaçlama yapma, sera örtülerini kontrol et. | İlaç sürüklenmesi riski var. Ekipmanları sabitle, hafif yapıları takviye et. |

---

## 6. Mesaj Şablonları — Haftalık

Haftalık mesajlar da aynı detay seviyesinde olacak. 7 günlük veriden özet çıkarılır.

### Haftalık Başlık Kuralları

1. Yağışlı gün sayısı hesaplanır (`precipProbMax >= 50`)
2. Don riski olan gün sayısı hesaplanır (`tempMin <= 2`)
3. Hafta genelinin sıcaklık aralığı belirlenir
4. Şiddetli hava olayı günleri belirlenir (fırtına, dolu)

### Haftalık Özet Şablonları (Şehir Modu)

| Senaryo | Başlık |
|---|---|
| Yağışsız hafta | Bu hafta genel olarak güneşli ve sakin; yağış beklenmiyor, planlarını rahatça yap. |
| 1-2 gün yağışlı | Bu hafta {gunSayisi} gün yağış ihtimali var; o günlerde şemsiyeni yanında tut, diğer günler güzel. |
| 3+ gün yağışlı | Bu hafta çoğunlukla yağışlı; birçok gün şemsiye gerekecek, dışarı planlarını buna göre ayarla. |
| Don riski var | Bu hafta {donGun} gün don riski var; sabahları buzlanmaya dikkat et, kalın giyin. |
| Fırtına/Dolu var | Bu hafta şiddetli hava olayları bekleniyor; uyarıları takip et ve hazırlıklı ol. |
| Çok sıcak hafta | Bu hafta sıcaklık {maxT}°C'ye kadar çıkacak; bol su iç ve öğle güneşinden kaçın. |

### Haftalık Özet Şablonları (Çiftçi Modu)

| Senaryo | Başlık |
|---|---|
| Yağışsız hafta | Bu hafta ilaçlama, sulama ve tarla işleri için uygun koşullar bekleniyor; planını rahatça yap. |
| 1-2 gün yağışlı | Bu hafta {gunSayisi} gün yağış ihtimali var; yağışsız günleri ilaçlama ve tarla işleri için değerlendir. |
| 3+ gün yağışlı | Bu hafta birçok gün yağışlı; tarla işleri için sınırlı pencere var, yağışsız günleri iyi kullan. |
| Don riski var | Bu hafta {donGun} gün don riski var; hassas ürünleri koru, sabah sulama yapma. |
| Fırtına/Dolu var | Bu hafta fırtına/dolu riski var; acil koruma önlemi al, hasat edilecek ürünleri hemen topla. |

### Haftalık Önemli Notlar Kuralları (Çiftçi)

Notlarda şu bilgiler verilir:
- **İlaçlama/sulama için uygun günler**: Rüzgar < 30 km/s ve yağış ihtimali < 30% olan günler listelenir
- **Don riski olan günler**: Gün isimleriyle listelenir + koruma tavsiyesi
- **Yoğun yağış beklenen günler**: precipSum > 15mm olan günler + drenaj uyarısı
- **Kuvvetli rüzgar günleri**: windSpeedMax > 40 km/s olan günler + ilaçlama uyarısı

---

## 7. Bildirim Metinleri (Push / Local Notification)

Bildirimler kısa ve aksiyon odaklıdır. Maksimum 2 cümle.

| Durum | Şehir Modu | Çiftçi Modu |
|---|---|---|
| Fırtına | Fırtına uyarısı! Dışarı çıkma, pencere ve kapıları kapat. | Fırtına uyarısı! Tarla işlerini iptal et, ekipmanları koru. |
| Dolu | Dolu riski! Aracını kapalı yere al. | Dolu riski! Ürünleri acil koru, dolu filesi kur. |
| Don | Sabah don riski! Yollarda buzlanma olacak, dikkatli ol. | Don uyarısı! Fideleri ve hassas ürünleri örtü ile koru. |
| Şiddetli yağmur | Şiddetli yağış uyarısı! Alt geçitlerden uzak dur. | Şiddetli yağış! Drenajı kontrol et, tarlaya girme. |
| Aşırı sıcak | Kavurucu sıcak! Bol su iç, güneşte kalma. | Aşırı sıcak! 10:00-16:00 arası tarlaya çıkma. |
| Yağış yaklaşıyor | {saat}'te yağmur bekleniyor, şemsiyeni al. | {saat}'te yağış bekleniyor, ilaçlama yapma. |
| Akşam özeti | Yarın {durum}. {kisa_tavsiye} | Yarın {durum}. {ciftci_tavsiyesi} |

---

## 8. Yağış Saat Aralığı Formatlama Kuralları

Yağışlı saatler `_formatHours` fonksiyonu ile insan okunur formata çevrilir:

| Girdi | Çıktı |
|---|---|
| Tek saat | `14:00` |
| Ardışık aralık | `14:00–17:00` |
| Birden fazla blok | `09:00–11:00, 14:00–16:00` |
| Tek + aralık | `09:00, 14:00–17:00` |

### Mesajlara Entegrasyon

- Tek saat: "...saat {saat} civarında kısa süreli bir yağmur bekleniyor"
- Aralık: "...{saat aralığı} saatleri arasında yağmur bekleniyor"
- Birden fazla: "...{bloklar} saatlerinde yağmur bekleniyor"

---

## 9. Yer Tutucu (Placeholder) Referansı

Mesaj şablonlarında kullanılan dinamik değerler:

| Yer Tutucu | Kaynak | Örnek |
|---|---|---|
| `{temp}` | `data.temperature.round()` | 24 |
| `{nem}` | `data.humidity.round()` | 65 |
| `{ruzgar}` | `data.windSpeed.round()` | 35 |
| `{hissedilen}` | `data.feelsLike.round()` | 22 |
| `{yagisIhtimali}` | `data.precipitationProbability.round()` | 70 |
| `{toprakNemi}` | `(data.soilMoisture * 100).round()` | 28 |
| `{maxT}` | `daily.tempMax.round()` | 30 |
| `{minT}` | `daily.tempMin.round()` | 12 |
| `{yagisAraligi}` | `_formatHours(rainHours)` | 14:00–17:00 |
| `{gunSayisi}` | yağışlı gün sayısı | 3 |
| `{donGun}` | don riski olan gün sayısı | 2 |
| `{saat}` | belirli bir saat | 14:00 |

---

## 10. Mesaj Üretim Akışı

```
Veri Girişi: WeatherData + WeatherDecision + UserMode + DateTime.now()
    │
    ├─► WeatherMessageType belirleme (öncelik sırası ile)
    ├─► TimeSlot belirleme (saat dilimine göre)
    ├─► Yağış aralığı hesaplama (todayHourly / tomorrowHourly)
    │
    ├─► Şehir Modu ─────────────────────────────────────────►  Şehir Headline
    │   ├─► messageType + timeSlot + rainWindow ──────────►  Şehir Subtitle
    │   └─► messageType + timeSlot + data ────────────────►  Şehir Önemli Notlar
    │
    └─► Çiftçi Modu ────────────────────────────────────────►  Çiftçi Headline
        ├─► messageType + timeSlot + rainWindow + decision ► Çiftçi Subtitle
        └─► messageType + timeSlot + decision ────────────►  Çiftçi Önemli Notlar
```
