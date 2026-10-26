# Kosinüs Teoremini Sıfırdan Öğreniyorum — Video Senaryosu

> Bu dosya `script.js` içinden otomatik üretilir (`node render.js --docs`). Metni değiştirmek için `script.js` düzenlenir.

## Genel bilgiler

- **Hedef kitle:** Meslek lisesi 10. sınıf, matematikte temel eksikleri olabilecek öğrenciler
- **Toplam süre:** 13:43 (seslendirme süresi tahmini: sakin anlatım ≈ 117 kelime/dk)
- **Format:** 1920×1080 (16:9), 30 fps, Türkçe seslendirme, sade 2D dijital tahta
- **Replik sayısı:** 96 seslendirme + 3 sessiz düşünme beklemesi (5'er sn)
- **Renk dili (her sahnede aynı):** 1. kenar / a → mavi · 2. kenar / b → pembe · açı → turuncu · aranan kenar ve sonuç → yeşil · vurgu → sarı · yanlış/uyarı → kırmızı
- **Kurallar:** Formüller aşamalı yazılır; yeni işlem satırı gelince öncekiler soluklaşır; açı daima iki kenarın birleştiği köşede; tüm üçgenler verilen ölçülere göre ölçekli çizilir; ondalıklar virgülle (6,24).

## Ses kaydı nasıl yapılacak?

- Her replik ayrı dosya olarak kaydedilir; dosya adı tablodaki **Kod** olur: `01-01.mp3`, `01-02.mp3`, … (wav/m4a/ogg da olur).
- Dosyalar `video/kosinus-teoremi/ses/` klasörüne konur. Video, her repliği kendi sesinin uzunluğuna göre yeniden zamanlar; görseller otomatik kayar.
- Tek parça uzun kayıt da olur: repliklerin arasında ~1 sn sessizlik bırakılırsa kayıt sessizliklerden replik replik bölünür.
- Okuma tonu: sakin, samimi, acele etmeden. Formüller robot gibi değil, cümle gibi okunur ("ce kare eşittir a kare artı be kare…").
- Düşünme beklemeleri (⏸) için kayıt **yapılmaz**; video o 5 saniyeyi kendisi bekler.

## Akış

| Bölüm | Başlık | Başlangıç | Süre | Hedef |
|---|---|---|---|---|
| BÖLÜM 1 | Üçgeni Hatırlayalım | 0:00 | 0:59 | 1 dk |
| BÖLÜM 2 | Kosinüs Teoremi Nedir? | 0:59 | 1:55 | 2 dk |
| BÖLÜM 3 | Kosinüs Değeri Nasıl Bulunur? | 2:54 | 0:46 | 1 dk |
| BÖLÜM 4 | Birinci Örnek: En Kolay Soru | 3:41 | 1:45 | 2 dk |
| BÖLÜM 5 | İkinci Örnek: 60 Dereceli Üçgen | 5:26 | 1:42 | 2 dk |
| BÖLÜM 6 | Üçüncü Örnek: Günlük Hayat Problemi | 7:08 | 1:40 | 2 dk |
| BÖLÜM 7 | Dördüncü Örnek: Eksik Açıyı Bulma | 8:48 | 1:28 | 1–1,5 dk |
| BÖLÜM 8 | Öğrenciyle Birlikte Çözelim | 10:17 | 2:26 | 2–2,5 dk |
| BÖLÜM 9 | Konu Özeti | 12:43 | 1:00 | 1 dk |

## BÖLÜM 1 — Üçgeni Hatırlayalım

**Zaman:** 0:00 – 0:59 (0:59)

### Görsel yönergeler

- Açılış kartı: "Kosinüs Teoremini Sıfırdan Öğreniyorum" başlığı ortada büyük, altında "10. Sınıf · Matematik".
- Sol panelde sade bir üçgen kendini çizer. Sorular sağda tek tek belirir; cevap gelince yeşil onay işareti.
- "Kaç kenar?" sorusunda üç kenar sırayla parlar; "kaç açı?" sorusunda üç köşeye yay çizilir.
- Pisagor anında üçgen yumuşak bir geçişle dik üçgene dönüşür, dik açı karesi belirir; a² + b² = c² kartı sağda.
- "Sadece dik üçgenlerde!" uyarısı kırmızı çerçeveli kartla gelir.
- Kapanışta üçgen tekrar dik olmayan bir üçgene dönüşür; iki kenar ve aradaki açı parlarken üçüncü kenarda "?" kalır.

### Ekrandaki formüller (sırasıyla)

- `a² + b² = c²`

### Seslendirme ve zamanlama

| Kod | Zaman | Seslendirme | Ekranda |
|---|---|---|---|
| **01-01** | 0:00 | Merhaba arkadaşlar! Bugün birlikte kosinüs teoremini sıfırdan öğreneceğiz. Hiç merak etmeyin; adım adım, yavaş yavaş ilerleyeceğiz. | Açılış kartı |
| **01-02** | 0:10 | Önce küçük bir ısınma yapalım. Bir üçgenin kaç kenarı vardır? | Üçgen çizilir, soru sağda |
| **01-03** | 0:15 | Evet, üç kenarı vardır. Peki kaç açısı vardır? Yine üç! |  |
| **01-04** | 0:21 | Şimdi biraz düşündürecek bir soru: Bir üçgenin iki kenarını biliyorsak, üçüncü kenarını her zaman bulabilir miyiz? | İki kenar etiketlenir, üçüncü kenarda "?" |
| **01-05** | 0:31 | Dik üçgenlerde bunun cevabını zaten biliyorsunuz: Pisagor bağıntısı. Dik kenarların karelerinin toplamı, hipotenüsün karesine eşittir. | Üçgen dik üçgene dönüşür; a² + b² = c² |
| **01-06** | 0:39 | Ama dikkat! Pisagor bağıntısı, yalnızca dik üçgenlerde doğrudan kullanılır. | Uyarı kartı |
| **01-07** | 0:44 | Peki, üçgenimiz dik üçgen değilse ve iki kenarıyla aralarındaki açıyı biliyorsak, üçüncü kenarı nasıl bulabiliriz? | Üçgen dik olmayan üçgene döner; iki kenar + açı parlar, üçüncü kenar "?" |
| **01-08** | 0:53 | İşte bugün bu sorunun cevabını öğreneceğiz. | "Kosinüs Teoremi" yazısı belirir |

## BÖLÜM 2 — Kosinüs Teoremi Nedir?

**Zaman:** 0:59 – 2:54 (1:55)

### Görsel yönergeler

- Sol panelde büyük bir üçgen: köşeler sırayla A (üst), B (sağ alt), C (sol alt) olarak yazılır.
- Kenar isimleri, karşısındaki köşeyle birlikte parlayarak gelir: A ↔ a (mavi), B ↔ b (pembe), C ↔ c (yeşil).
- a ve b kenarlarının C köşesinde birleştiği vurgulanır; C köşesine turuncu açı yayı çizilir.
- Formül sağda büyük bir kartta soldan sağa "yazılarak" belirir. Her parça anlatılırken formülde ve üçgende aynı anda parlar.
- Parça açıklamaları formülün altında birer satır olarak birikir (en fazla 5 satır).
- Sonda sarı çerçeveli "Önemli" kartı ve formülün sözlü hâli gösterilir: ezber yerine isimlendirme mantığı.

### Ekrandaki formüller (sırasıyla)

- `c² = a² + b² − 2ab · cos(C)`
- `(aranan kenar)² = (1. kenar)² + (2. kenar)² − 2 · (1. kenar) · (2. kenar) · cos(aradaki açı)`

### Seslendirme ve zamanlama

| Kod | Zaman | Seslendirme | Ekranda |
|---|---|---|---|
| **02-01** | 0:59 | Önce üçgenimizi isimlendirelim. Köşelere A, B ve C diyelim. | Üçgen çizilir; köşeler A, B, C |
| **02-02** | 1:05 | Şimdi kenarlara isim vereceğiz. Burada çok basit bir kural var: Her kenar, karşısındaki köşenin küçük harfini alır. | Kural kartı |
| **02-03** | 1:14 | A köşesinin karşısındaki kenar, küçük a. B köşesinin karşısındaki kenar, küçük b. C köşesinin karşısındaki kenar da küçük c. | Köşe ve karşı kenar çiftleri sırayla parlar |
| **02-04** | 1:24 | Kosinüs teoremi bize şunu söyler: Bir üçgende iki kenarı ve bu iki kenarın arasındaki açıyı biliyorsak, üçüncü kenarı bulabiliriz. | "Bildiklerimiz → Bulacağımız" kartı |
| **02-05** | 1:35 | Bakın, a ve b kenarları C köşesinde birleşiyor. Yani a ile b arasındaki açı, C açısıdır. | a, b ve C köşesindeki açı vurgulanır |
| **02-06** | 1:43 | Formülümüz şöyle: c kare eşittir, a kare artı b kare, eksi iki a b çarpı kosinüs C. | Formül yazılır |
| **02-07** | 1:53 | Hemen korkmayın, bu formülü parça parça inceleyelim. |  |
| **02-08** | 1:57 | a kare, birinci kenarın karesi. b kare de ikinci kenarın karesi. | a² ve b² parlar |
| **02-09** | 2:04 | İki a b ise, bu iki kenarın çarpımının iki katı. | 2ab parlar |
| **02-10** | 2:09 | Kosinüs C ise, C açısının kosinüs değeri. Yani iki kenarın arasındaki açının kosinüsü. | cos(C) ve açı yayı parlar |
| **02-11** | 2:17 | Sol taraftaki c kare de aradığımız kenarın karesi; yani C açısının tam karşısındaki kenar. | c² ve c kenarı parlar |
| **02-12** | 2:24 | Bizim işimiz aslında çok basit: Bildiğimiz sayıları formülde yerine koyacağız, sonra da işlemleri sırayla yapacağız. |  |
| **02-13** | 2:33 | Şimdi çok önemli bir noktaya geldik. Bir açının karşısındaki kenarı arıyorsak, formülde o kenarın harfini tek başına bırakacak şekilde düşünmeliyiz. | Sarı "Önemli" kartı; c², c kenarı ve C açısı birlikte parlar |
| **02-14** | 2:44 | Harflerin yerlerini ezberlemek yerine, üçgeni doğru isimlendirmeyi öğrenmeliyiz. Üçgen doğru isimlendirilirse formül kendiliğinden yerine oturur. | Formülün sözlü hâli |

## BÖLÜM 3 — Kosinüs Değeri Nasıl Bulunur?

**Zaman:** 2:54 – 3:41 (0:46)

### Görsel yönergeler

- Sol tarafta iki sütunlu sade tablo: Açı | Kosinüs değeri. Satırlar yukarıdan aşağı tek tek belirir.
- 0°, 120° ve 180° satırları soluklaşır (şimdilik gerek yok); 60° ve 90° satırları sarı vurguyla kalır.
- Sağda iki büyük "akılda tut" kartı: cos(60°) = 1/2 ve cos(90°) = 0.
- Sonda hesap makinesi çizimi: ekranın sol üstündeki DEG göstergesi sarı halkayla parlar.

### Ekrandaki formüller (sırasıyla)

- `cos 0° = 1 · cos 60° = 1/2 · cos 90° = 0 · cos 120° = −1/2 · cos 180° = −1`

### Seslendirme ve zamanlama

| Kod | Zaman | Seslendirme | Ekranda |
|---|---|---|---|
| **03-01** | 2:55 | Formülde bir de kosinüs değeri var. Peki bu değeri nereden bulacağız? | "cos(açı) = ?" |
| **03-02** | 3:01 | Bazı açıların kosinüs değerlerini bu küçük tabloda görüyorsunuz. | Tablo satır satır belirir |
| **03-03** | 3:07 | Ama hepsini şimdi ezberlemenize hiç gerek yok. Şimdilik 60 derecenin kosinüsünün yarım olduğunu ve 90 derecenin kosinüsünün sıfır olduğunu bilmen yeterli. | 60° ve 90° satırları vurgulanır, diğerleri soluklaşır |
| **03-04** | 3:18 | Önce soruları çözmeyi öğrenelim. Diğer değerlere, ihtiyaç duyduğumuzda tekrar bakarız. |  |
| **03-05** | 3:24 | Bir de küçük bir ipucu: Hesap makinesi kullanacaksanız, ekranda DEG yazdığından, yani derece modunda olduğundan emin olun. | Hesap makinesi; DEG göstergesi parlar |
| **03-06** | 3:33 | Derece modunda değilse, işlemi doğru yapsanız bile yanlış sonuç alırsınız. |  |

## BÖLÜM 4 — Birinci Örnek: En Kolay Soru

**Zaman:** 3:41 – 5:26 (1:45)

### Görsel yönergeler

- Ölçekli dik üçgen: yatay kenar 4 cm (pembe), dikey kenar 3 cm (mavi), aradaki dik açı karesi turuncu; hipotenüs x (yeşil).
- Soru kartı sağ üstte. İşlemler altında satır satır; yeni satır gelince eski satırlar soluklaşır.
- Sayılar formüle girerken üçgende ilgili kenar parlar (3 → mavi kenar, 4 → pembe kenar, 90° → açı).
- "− 24 · 0" terimi kırmızı çizgiyle üstü çizilerek "yok olur".
- Sonuç yeşil çerçevede; üçgendeki x etiketi "5 cm" olur. Sonda Pisagor ile aynı sonucun çıktığı kartı.

### Ekrandaki formüller (sırasıyla)

- `x² = 3² + 4² − 2 · 3 · 4 · cos(90°)`
- `x² = 9 + 16 − 24 · 0`
- `x² = 25`
- `x = √25 = 5 cm`

### Seslendirme ve zamanlama

| Kod | Zaman | Seslendirme | Ekranda |
|---|---|---|---|
| **04-01** | 3:41 | Hadi ilk sorumuza geçelim. En kolay sorudan başlıyoruz. | "1. Örnek" kartı |
| **04-02** | 3:46 | Elimizde bir dik üçgen var. İki kenarı 3 santimetre ve 4 santimetre; bu iki kenarın arasındaki açı da 90 derece. | Dik üçgen çizilir: 3 cm, 4 cm, 90° |
| **04-03** | 3:57 | Üçüncü kenara x diyelim. Soru şu: x kaç santimetredir? | x etiketi ve soru kartı |
| **04-04** | 4:02 | Önce formülümüzü yazalım. Aradığımız kenar x; bu yüzden x kareyi eşittirin solunda tek başına bırakıyoruz. | "x² =" yazılır |
| **04-05** | 4:10 | Bildiğimiz kenarlar 3 ve 4. Bunları yerine koyuyoruz: x kare eşittir 3 kare artı 4 kare... | 3² + 4² yazılır |
| **04-06** | 4:19 | ...eksi 2 çarpı 3 çarpı 4 çarpı kosinüs 90. | − 2 · 3 · 4 · cos(90°) yazılır |
| **04-07** | 4:24 | Kosinüs 90 derecenin değeri neydi? Sıfır! | Not: cos(90°) = 0 |
| **04-08** | 4:28 | 3 kare 9 eder, 4 kare 16 eder. 2 çarpı 3 çarpı 4 de 24 eder. | x² = 9 + 16 − 24 · 0 |
| **04-09** | 4:37 | Sıfırla çarpılan her şey sıfır olur. Yani 24 çarpı 0, sıfırdır. Bu kısım tamamen gidiyor. | "− 24 · 0" üstü çizilir |
| **04-10** | 4:45 | Geriye 9 artı 16 kalıyor. Bu da 25 eder. | x² = 25 |
| **04-11** | 4:50 | x kare 25 ise, x'i bulmak için karekök alırız. Hangi sayının karesi 25 eder? 5'in! | x = √25 = 5 cm |
| **04-12** | 4:59 | Yani x, 5 santimetre. Tebrikler, ilk soruyu birlikte çözdük! | Üçgende x → 5 cm |
| **04-13** | 5:04 | Dikkat ederseniz, kosinüs teoremi burada Pisagor bağıntısıyla aynı sonucu verdi. Çünkü dik üçgende kosinüs 90 sıfırdır ve o kısım tamamen kaybolur. | Pisagor karşılaştırma kartı |
| **04-14** | 5:15 | Yani Pisagor bağıntısı, aslında kosinüs teoreminin özel bir hâlidir. Kosinüs teoremi ise her türlü üçgende çalışır. |  |

## BÖLÜM 5 — İkinci Örnek: 60 Dereceli Üçgen

**Zaman:** 5:26 – 7:08 (1:42)

### Görsel yönergeler

- Ölçekli üçgen: yatay kenar 7 cm (pembe), eğik kenar 5 cm (mavi), aralarında 60° (turuncu yay); karşı kenar x (yeşil).
- Formül dört parçada yazılır; her parça söylenirken üçgende ilgili kenar/açı parlar.
- Not alanında sırasıyla: cos(60°) = 1/2 → "39 tam kare değil" → "karekök tam sayı olmak zorunda değil" → √36 < √39 < √49 kontrolü.
- Sonuç: x = √39 ≈ 6,24 cm (yeşil çerçeve); üçgendeki x etiketi "≈ 6,24 cm" olur.
- Kapanış: sağda üç numaralı adım kartı — Yerleştir → cos değerini kullan → Karekök al.

### Ekrandaki formüller (sırasıyla)

- `x² = 5² + 7² − 2 · 5 · 7 · cos(60°)`
- `x² = 25 + 49 − 70 · 1/2`
- `x² = 74 − 35`
- `x² = 39`
- `x = √39 ≈ 6,24 cm`

### Seslendirme ve zamanlama

| Kod | Zaman | Seslendirme | Ekranda |
|---|---|---|---|
| **05-01** | 5:26 | Şimdi bir adım daha ileri gidelim. Bu kez üçgenimiz dik üçgen değil. | "2. Örnek" kartı |
| **05-02** | 5:33 | İki kenarı 5 santimetre ve 7 santimetre; bu kenarların arasındaki açı ise 60 derece. | Üçgen çizilir: 5 cm, 7 cm, 60° |
| **05-03** | 5:41 | Üçüncü kenar x kaç santimetredir? | Soru kartı |
| **05-04** | 5:44 | Önce sayıları formüle yerleştiriyoruz: x kare eşittir 5 kare artı 7 kare, eksi 2 çarpı 5 çarpı 7 çarpı kosinüs 60. | x² = 5² + 7² − 2 · 5 · 7 · cos(60°) |
| **05-05** | 5:56 | Kosinüs 60'ın değeri neydi? Yarım, yani bir bölü iki. | Not: cos(60°) = 1/2 |
| **05-06** | 6:01 | 5 kare 25, 7 kare 49 eder. 2 çarpı 5 çarpı 7 de 70 eder. | x² = 25 + 49 − 70 · 1/2 |
| **05-07** | 6:09 | 25 artı 49, 74 eder. 70'in yarısı da 35. | x² = 74 − 35 |
| **05-08** | 6:14 | 74'ten 35 çıkarınca 39 kalır. Yani x kare 39. | x² = 39 |
| **05-09** | 6:19 | Şimdi karekök alacağız. Ama 39; 36 ya da 49 gibi tam kare bir sayı değil. | x = √39; not: "39 tam kare değil" |
| **05-10** | 6:28 | Bu hiç sorun değil! Karekök her zaman tam sayı çıkmak zorunda değildir. Cevabı kök 39 olarak da bırakabiliriz. | Not: "Karekök tam sayı olmak zorunda değil!" |
| **05-11** | 6:38 | Hesap makinesiyle bakarsak, kök 39 yaklaşık 6 virgül 24 eder. Yani x, yaklaşık 6 virgül 24 santimetre. | ≈ 6,24 cm; üçgende x → ≈ 6,24 cm |
| **05-12** | 6:47 | Sonuç mantıklı mı? 36'nın kökü 6, 49'un kökü 7. 39 bu ikisinin arasında; sonucumuz da 6 ile 7 arasında çıktı. Harika! | Kontrol notu: √36 = 6 < √39 < √49 = 7 |
| **05-13** | 6:58 | Sırayı unutmayalım: Önce sayıları formüle yerleştiriyoruz. Sonra kosinüs değerini kullanıyoruz. En son karekök alıyoruz. | Üç adım kartı |

## BÖLÜM 6 — Üçüncü Örnek: Günlük Hayat Problemi

**Zaman:** 7:08 – 8:48 (1:40)

### Görsel yönergeler

- Sol panelde kuşbakışı inşaat alanı: bir noktadan çıkan iki yol (koyu gri asfalt, kesikli orta çizgi), uçlarında turuncu dubalar, köşede "İNŞAAT ALANI" tabelası.
- Yollar ölçekli: 6 m ve 8 m, aralarında 60° (turuncu yay).
- Kuş uçuşu mesafe yeşil kesikli çizgiyle çizilirken küçük bir kuş bir uçtan diğerine uçar.
- Ardından yolların üstüne renkli kenar çizgileri gelir: "iki yol + mesafe = üçgen".
- İşlemler sağda satır satır; sonuç ≈ 7,21 m. Sol altta "6 + 8 = 14 m ✗" uyarısı, ardından "açıyı da kullandık ✓".

### Ekrandaki formüller (sırasıyla)

- `x² = 6² + 8² − 2 · 6 · 8 · cos(60°)`
- `x² = 36 + 64 − 96 · 1/2`
- `x² = 100 − 48`
- `x² = 52`
- `x = √52 ≈ 7,21 m`

### Seslendirme ve zamanlama

| Kod | Zaman | Seslendirme | Ekranda |
|---|---|---|---|
| **06-01** | 7:09 | Şimdi matematiği gerçek hayata taşıyalım. | "3. Örnek" kartı |
| **06-02** | 7:12 | Bir inşaat alanında iki yol bir noktada birleşiyor. Birinci yolun uzunluğu 6 metre, ikinci yolun uzunluğu 8 metre. | İnşaat alanı: iki yol çizilir, 6 m ve 8 m |
| **06-03** | 7:22 | Yolların birleştiği noktadaki açı 60 derece. | 60° açı yayı |
| **06-04** | 7:26 | Biz, iki yolun uç noktaları arasındaki kuş uçuşu mesafeyi bulmak istiyoruz. Kuş uçuşu demek, iki nokta arasındaki dümdüz mesafe demek. | Kuş bir uçtan diğerine uçar; kesikli yeşil çizgi |
| **06-05** | 7:37 | Şekle dikkat edin: İki yol ve bu mesafe bir üçgen oluşturuyor. Bildiklerimiz: iki kenar, 6 ve 8; aralarındaki açı da 60 derece. | Yolların üstüne renkli kenarlar gelir: üçgen |
| **06-06** | 7:48 | Formüle yerleştirelim: x kare eşittir 6 kare artı 8 kare, eksi 2 çarpı 6 çarpı 8 çarpı kosinüs 60. | x² = 6² + 8² − 2 · 6 · 8 · cos(60°) |
| **06-07** | 7:59 | 6 kare 36, 8 kare 64 eder. 2 çarpı 6 çarpı 8 de 96. Kosinüs 60 da yarım. | x² = 36 + 64 − 96 · 1/2 |
| **06-08** | 8:09 | 36 artı 64, 100 eder. 96'nın yarısı da 48. | x² = 100 − 48 |
| **06-09** | 8:14 | 100'den 48 çıkarınca 52 kalır. Yani x kare 52. | x² = 52 |
| **06-10** | 8:19 | Karekök alıyoruz: kök 52, yaklaşık 7 virgül 21 eder. Yani iki uç arasındaki mesafe, yaklaşık 7 virgül 21 metre. | x = √52 ≈ 7,21 m; üçgende x → ≈ 7,21 m |
| **06-11** | 8:29 | Bir şeye dikkat edin: İki yolun uzunluğunu doğrudan toplamadık. Toplasaydık 14 metre bulurduk; ama bu yanlış olurdu. | Sol altta: 6 + 8 = 14 m ✗ |
| **06-12** | 8:39 | Çünkü yollar aynı doğrultuda değil. Aralarındaki açıyı da kullanarak, iki uç arasındaki mesafeyi hesapladık. | "Açıyı da kullandık ✓" |

## BÖLÜM 7 — Dördüncü Örnek: Eksik Açıyı Bulma

**Zaman:** 8:48 – 10:17 (1:28)

### Görsel yönergeler

- İkinci örnekteki üçgenin aynısı: b = 7 cm (pembe), a = 5 cm (mavi), c = √39 cm (yeşil); C köşesinde turuncu "?" yayı.
- İşlemler: c² = a² + b² − 2ab · cos(C) → cos(C) kesirli formül → değerler → 35/70 = 1/2 → C = 60°.
- Kesirler üst üste (pay/payda) yazılır; pay ve payda ayrı ayrı belirir.
- Sonda hesap makinesi: SHIFT ve cos tuşları sırayla parlar; ekranda cos⁻¹(1÷2) = 60.
- Uyarı kartı: "cos⁻¹, 1/cos demek değildir."

### Ekrandaki formüller (sırasıyla)

- `c² = a² + b² − 2ab · cos(C)`
- `cos(C) = (a² + b² − c²) / 2ab`
- `cos(C) = (25 + 49 − 39) / (2 · 5 · 7)`
- `cos(C) = 35/70 = 1/2`
- `C = 60°`
- `cos⁻¹(1/2) = 60°  (hesap makinesi: SHIFT + cos)`

### Seslendirme ve zamanlama

| Kod | Zaman | Seslendirme | Ekranda |
|---|---|---|---|
| **07-01** | 8:49 | Şimdi işi tersine çevirelim. Bu kez üçgenin üç kenarı da belli, ama bir açısı bilinmiyor. | "4. Örnek" kartı |
| **07-02** | 8:57 | a eşittir 5, b eşittir 7, c eşittir kök 39 santimetre. Tanıdık geldi mi? Bu, ikinci örnekteki üçgenin ta kendisi! | Üçgen: a = 5, b = 7, c = √39; not: "2. örnekteki üçgen!" |
| **07-03** | 9:08 | C açısını bulmak istiyoruz. Yine aynı formülle başlıyoruz. | C köşesinde "?"; temel formül yazılır |
| **07-04** | 9:13 | Bu kez kosinüs C'yi yalnız bırakacağız. Formülü düzenlersek şunu elde ederiz: kosinüs C eşittir, a kare artı b kare eksi c kare, bölü iki a b. | cos(C) = (a² + b² − c²) / 2ab |
| **07-05** | 9:27 | Değerleri yerleştirelim. a kare 25, b kare 49, c kare de 39. Çünkü kök 39'un karesi, 39'dur. | Değerler yerleştirilir; not: (√39)² = 39 |
| **07-06** | 9:36 | Üst taraf: 25 artı 49 eksi 39, yani 35. Alt taraf: 2 çarpı 5 çarpı 7, yani 70. | cos(C) = 35 / 70 |
| **07-07** | 9:46 | 35 bölü 70, yarım eder. Kosinüsü yarım olan açı hangisiydi? Tablomuzdan hatırlayalım: 60 derece! | = 1/2 → C = 60° |
| **07-08** | 9:54 | Hesap makinesinde bu işlem için kosinüs üzeri eksi bir, yani ark kosinüs kullanılır. Genelde SHIFT ve cos tuşlarına basarak açılır. | Hesap makinesi: SHIFT + cos → cos⁻¹(1÷2) = 60 |
| **07-09** | 10:05 | Küçük bir uyarı: Buradaki eksi bir, bir bölü kosinüs anlamına gelmez. Sadece, kosinüsü bu olan açı hangisi, demektir. | Uyarı kartı: cos⁻¹ ≠ 1 / cos |

## BÖLÜM 8 — Öğrenciyle Birlikte Çözelim

**Zaman:** 10:17 – 12:43 (2:26)

### Görsel yönergeler

- Her soru için: soru kartı + ölçekli üçgen → 5 saniyelik geri sayım ("Düşünme zamanı!", "İstersen videoyu durdur") → çözüm satırları.
- Geri sayım sırasında çözüm ekranda YOKTUR; seslendirme de susar (yalnızca halka ve sayı akar).
- Soru 1: 4 cm, 6 cm, 90° → √52 ≈ 7,21 cm.  Soru 2: 4 cm, 4 cm, 60° → 4 cm (eşkenar üçgen notu).  Soru 3: a = 3, b = 4, C = 60° → √13 ≈ 3,61 cm.
- Bölüm sonunda cesaretlendirici kart: "Hata yapmak öğrenmenin parçası."

### Ekrandaki formüller (sırasıyla)

- `x² = 4² + 6² − 2 · 4 · 6 · cos(90°)`
- `x² = 16 + 36 = 52`
- `x = √52 ≈ 7,21 cm`
- `x² = 16 + 16 − 2 · 4 · 4 · 1/2`
- `x² = 32 − 16 = 16`
- `x = √16 = 4 cm`
- `c² = 9 + 16 − 2 · 3 · 4 · 1/2`
- `c² = 25 − 12 = 13`
- `c = √13 ≈ 3,61 cm`

### Seslendirme ve zamanlama

| Kod | Zaman | Seslendirme | Ekranda |
|---|---|---|---|
| **08-01** | 10:17 | Şimdi sıra sizde! Üç kısa soru soracağım. Her sorudan sonra düşünmeniz için 5 saniye bekleyeceğim. Kalem kâğıt hazır mı? | "Sıra sende!" kartı |
| **08-02** | 10:28 | Birinci soru: İki kenarı 4 santimetre ve 6 santimetre olan bir üçgende, bu kenarlar arasındaki açı 90 derece. Üçüncü kenar kaç santimetredir? | Soru 1 kartı ve üçgen |
| — | 10:40 | *⏸ 5 sn sessiz bekleme — öğrenci düşünür* | ⏸ 5 sn düşünme (sessiz, geri sayım) |
| **08-03** | 10:46 | Hadi birlikte bakalım. x kare eşittir 4 kare artı 6 kare, eksi 2 çarpı 4 çarpı 6 çarpı kosinüs 90. | x² = 4² + 6² − 2 · 4 · 6 · cos(90°) |
| **08-04** | 10:56 | Kosinüs 90 sıfır olduğu için son kısım gidiyor. 16 artı 36, 52 eder. | x² = 16 + 36 = 52 |
| **08-05** | 11:04 | Yani x eşittir kök 52, yaklaşık 7 virgül 21 santimetre. Bulduysanız tebrikler! | x = √52 ≈ 7,21 cm |
| **08-06** | 11:10 | İkinci soru: İki kenarı 4 santimetre ve 4 santimetre olan bir üçgende, aralarındaki açı 60 derece. Üçüncü kenar kaç santimetredir? | Soru 2 kartı ve üçgen |
| — | 11:21 | *⏸ 5 sn sessiz bekleme — öğrenci düşünür* | ⏸ 5 sn düşünme (sessiz, geri sayım) |
| **08-07** | 11:27 | Hadi bakalım. x kare eşittir 16 artı 16, eksi 2 çarpı 4 çarpı 4 çarpı yarım. | x² = 16 + 16 − 2 · 4 · 4 · 1/2 |
| **08-08** | 11:36 | 2 çarpı 4 çarpı 4, 32 eder; yarısı da 16. 32 eksi 16, 16 eder. | x² = 32 − 16 = 16 |
| **08-09** | 11:44 | x kare 16 ise, x 4 santimetre. İlginç değil mi? Üç kenarın üçü de 4 çıktı. Bu bir eşkenar üçgen! | x = 4 cm; not: eşkenar üçgen |
| **08-10** | 11:55 | Üçüncü soru: Bir üçgende a eşittir 3 santimetre, b eşittir 4 santimetre ve C açısı 60 derece. c kenarını bulun. | Soru 3 kartı ve üçgen |
| — | 12:06 | *⏸ 5 sn sessiz bekleme — öğrenci düşünür* | ⏸ 5 sn düşünme (sessiz, geri sayım) |
| **08-11** | 12:11 | c kare eşittir 9 artı 16, eksi 2 çarpı 3 çarpı 4 çarpı yarım. | c² = 9 + 16 − 2 · 3 · 4 · 1/2 |
| **08-12** | 12:19 | 2 çarpı 3 çarpı 4, 24 eder; yarısı da 12. 25 eksi 12, 13 eder. | c² = 25 − 12 = 13 |
| **08-13** | 12:27 | Yani c eşittir kök 13, yaklaşık 3 virgül 61 santimetre. | c = √13 ≈ 3,61 cm |
| **08-14** | 12:33 | Yanlış yaptıysanız hiç dert etmeyin. Videoyu durdurup adımlara yeniden bakabilirsiniz. Hata yapmak, öğrenmenin bir parçasıdır. | Cesaretlendirici kart |

## BÖLÜM 9 — Konu Özeti

**Zaman:** 12:43 – 13:43 (1:00)

### Görsel yönergeler

- Solda numaralı 6 adım tek tek belirir. Sağda iki formül kartı: "Kenar bulma" ve "Açı bulma".
- Son cümlede her şey soluklaşır; ortada büyük kapanış mesajı kalır.

### Ekrandaki formüller (sırasıyla)

- `c² = a² + b² − 2ab · cos(C)`
- `cos(C) = (a² + b² − c²) / 2ab`

### Seslendirme ve zamanlama

| Kod | Zaman | Seslendirme | Ekranda |
|---|---|---|---|
| **09-01** | 12:44 | Harika bir iş çıkardınız! Şimdi bugün öğrendiklerimizi özetleyelim. | "Kosinüs teoremini kullanırken:" başlığı |
| **09-02** | 12:48 | Kosinüs teoremini kullanırken: Bir, üçgeni çiz. İki, bilinen iki kenarı belirle. Üç, bu iki kenarın arasındaki açıyı bul. | Adım 1–3 |
| **09-03** | 12:58 | Dört, doğru formülü yaz. Beş, sayıları ve kosinüs değerini yerine koy. Altı, işlemleri yap ve gerekiyorsa karekök al. | Adım 4–6 |
| **09-04** | 13:08 | Kenar bulmak için formülümüz: c kare eşittir, a kare artı b kare, eksi iki a b kosinüs C. | Kenar bulma kartı |
| **09-05** | 13:18 | Açı bulmak için de: kosinüs C eşittir, a kare artı b kare eksi c kare, bölü iki a b. | Açı bulma kartı |
| **09-06** | 13:28 | Kosinüs teoremi zor görünse de, aslında adım adım uyguladığımız bir yöntemdir. Üçgeni doğru çiz, verilenleri yerleştir ve işlemleri sırayla yap! | Kapanış mesajı |

## Matematiksel doğruluk kontrolü

Aşağıdaki değerler video üretilirken `script.js` içinde yeniden hesaplanır:

| Soru | Veriler (kenar, kenar, aradaki açı) | x² (hesap) | Sonuç (hesap) | Ekranda | Üçgen eşitsizliği | Durum |
|---|---|---|---|---|---|---|
| Örnek 1 | 3, 4, 90° | 25 | 5,00 | 5 | sağlanıyor | ✅ |
| Örnek 2 | 5, 7, 60° | 39 | 6,24 | 6,24 | sağlanıyor | ✅ |
| Örnek 3 (yollar) | 6, 8, 60° | 52 | 7,21 | 7,21 | sağlanıyor | ✅ |
| Soru 1 | 4, 6, 90° | 52 | 7,21 | 7,21 | sağlanıyor | ✅ |
| Soru 2 | 4, 4, 60° | 16 | 4,00 | 4 | sağlanıyor | ✅ |
| Soru 3 | 3, 4, 60° | 13 | 3,61 | 3,61 | sağlanıyor | ✅ |
| Örnek 4 (açı) | 5, 7, √39 | cos C = 0,5 | 60,0000° | 60° | sağlanıyor | ✅ |

- Kosinüs teoremi her üçgende geçerlidir; formüldeki açı her örnekte, kullanılan iki kenarın **arasındaki** açıdır.
- Kenar uzunlukları karekök alınarak bulunur; yalnızca pozitif kök (uzunluk) alınır.
- Açı bulmada ters kosinüs (cos⁻¹ / arccos) kullanılır; cos⁻¹, 1/cos anlamına gelmez.
- Hesap makinesi derece (DEG) modunda olmalıdır.
