# 📱 Skyde — Proje Dokümantasyonu

> **Vizyon:** Teknolojiden uzak kullanıcılar için "Tek Soruya Tek Cevap" veren, samimi ve aksiyon odaklı hava durumu asistanı.

---

## 🎯 Misyon

Yaşlılar ve çiftçiler başta olmak üzere, karmaşık hava durumu uygulamalarından yorulmuş kullanıcılara; **"Hüseyin Amca, bugün tarlaya çıkabilir misin?"** sorusunun cevabını saniyeler içinde veren bir araç sunmak.

---

## 👤 Kullanıcı Segmentasyonu

İlk açılışta kullanıcıya tek bir soru sorulur. Bu seçim tüm deneyimi şekillendirir:

| Mod | Hedef Kullanıcı | Odak |
|-----|----------------|------|
| 🏙️ **Şehir Modu** | "Dışarı çıkacağım, günlük plan yapıyorum." | Günlük kıyafet, şemsiye, trafik |
| 🌾 **Çiftçi Modu** | "Üretim yapıyorum, tarlamı/bahçemi yönetiyorum." | Sulama, ilaçlama, don/dolu alarmı |

---

## 🧠 Temel Özellikler (Full MVP)

### 1. Kişiselleştirilmiş Ana Ekran

- **İsimle Hitap:** "Günaydın Hüseyin, bugün yağmur yok."
- **Dinamik Metin (NLG):** Rakamlar yerine doğal dil
  - ❌ "Rüzgar hızı 42 km/s, nem %78"
  - ✅ "Rüzgarlı bir gün. İlaçlamayı ertele."
- **Uyarı Sistemi:** Kritik koşullarda (don, dolu, fırtına) öne çıkan uyarı mesajları
- **Ses tonu:** Tüm kullanıcı metinleri için denge ve örnekler → [MESSAGE_TONE.md](MESSAGE_TONE.md) (zeki / hafif mizah / sıcaklık oranı)

### 2. Akıllı Bildirim Sistemi

| Tür | Örnek | Zamanlama |
|-----|-------|-----------|
| Yerel (Local) | "30 dakika sonra sağanak." | Anlık koşul tetiklemeli |
| Push (FCM) | "Donma riski! Bu gece -3°C." | Kritik eşik geçilince |
| Akşam Özeti | "Yarın: Öğleden sonra yağışlı, sabah sulama yapabilirsin." | Her gün 20:00 |

### 3. Çiftçi Dostu Fonksiyonlar

- **Sulama Kararı:** Tahmini yağış + toprak nemi → "Bugün sulama gerekmez"
- **İlaçlama Rehberi:** Rüzgar hızı + nem → "İlaçlama için uygun / uygun değil"
- **Don Alarmı:** Gece tahmin < 2°C → Anlık kritik push
- **Dolu Uyarısı:** Konvektif yağış tahmini → Kritik alarm

---

## 🛠 Teknik Kararlar

### Platform
**Flutter (Dart)**
- Tek kod tabanı → Android + iOS eşit kalite
- Çok dilli altyapı (flutter_localizations + ARB dosyaları) baştan kurulu
- Büyük font ve erişilebilirlik desteği native seviyede

### Hava Durumu API
**Open-Meteo** (birincil)
- Tamamen ücretsiz, API key gerektirmez
- Tarımsal veri desteği: `soil_moisture`, `windspeed`, `precipitation`
- Saatlik + günlük forecast endpoint'leri
- Fallback: OpenWeatherMap (kritik durum yedek API)

### Veri Depolama
**Yerel (Cihaz)**
- `SharedPreferences` → Kullanıcı adı, mod tercihi, dil
- `Hive` (NoSQL) → Kayıtlı konumlar ("Evim", "Alt Tarla", "Bağ")
- İnternet gerektirmez, kayıt/giriş yok

### Bildirimler
- **`flutter_local_notifications`** → Zamanlı yerel uyarılar
- **Firebase Cloud Messaging (FCM)** → Push bildirimleri (Android + iOS)
- Minimal Firebase backend (sadece FCM token yönetimi)

### Konum
- **GPS (geolocator)** → Otomatik anlık konum
- **Manuel Kayıtlı Yerler** → Kullanıcı "Evim", "Alt Tarla" gibi isimler atar
- Arka planda konum izni gerektirmez (uygulama açıkken yeterli)

### Lokalizasyon (Çok Dilli)
- `flutter_localizations` + `.arb` dosyaları
- İlk sürüm: 🇹🇷 Türkçe + 🇬🇧 İngilizce
- Genişletilebilir mimari (ileride Arapça, Bulgarca vs.)

---

## 🎨 Tasarım Prensipleri

**Süper Minimal — Büyük Yaz, Az Söyle**

- **Zemin:** Saf beyaz (#FFFFFF) / çok açık gri (#F5F5F5)
- **Font:** Minimum 18sp, başlıklar 32sp+ (yaşlı dostu)
- **Tek Ekranda Tek Mesaj:** Scroll yok, kaydırma yok, tek bakışta anlam
- **Animasyon:** Yok — sade ve hızlı
- **İkonlar:** Kelimelerle birlikte, tek başına ikon kullanılmaz

---

## 📂 Proje Dizin Yapısı

```
yagmurvarmi/
├── lib/
│   ├── main.dart
│   ├── core/
│   │   ├── constants/          # Renkler, stil sabitleri
│   │   ├── services/
│   │   │   ├── weather_service.dart      # Open-Meteo API
│   │   │   ├── location_service.dart     # GPS + kayıtlı yerler
│   │   │   ├── notification_service.dart # Local + FCM
│   │   │   ├── background_service.dart   # WorkManager arka plan
│   │   │   ├── preferences_service.dart  # Kullanıcı tercihleri
│   │   │   ├── tts_service.dart          # Sesli okuma
│   │   │   └── weather_cache_service.dart # Offline önbellek (son başarılı yanıt)
│   │   ├── models/
│   │   │   ├── weather_data.dart
│   │   │   ├── saved_location.dart
│   │   │   └── user_preferences.dart
│   │   └── utils/
│   │       └── decision_engine.dart      # Aksiyon karar motoru
│   ├── features/
│   │   ├── onboarding/         # İlk açılış: mod + isim + konum
│   │   ├── home/               # Ana ekran (şehir modu)
│   │   ├── farmer/             # Çiftçi modu ekranı
│   │   ├── locations/          # Kayıtlı yerler yönetimi
│   │   └── settings/           # Ayarlar
│   └── l10n/
│       ├── app_tr.arb          # Türkçe metinler
│       └── app_en.arb          # İngilizce metinler
├── android/
├── ios/
├── pubspec.yaml
└── PROJECT.md
```

---

## 📦 Bağımlılıklar (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # Hava Durumu
  http: ^1.2.0                    # Open-Meteo API çağrıları
  
  # Konum
  geolocator: ^12.0.0             # GPS
  geocoding: ^3.0.0               # Koordinat → Şehir adı
  
  # Depolama
  shared_preferences: ^2.2.3      # Kullanıcı tercihleri
  hive_flutter: ^1.1.0            # Kayıtlı konumlar
  hive: ^2.2.3
  
  # Bildirimler
  flutter_local_notifications: ^17.0.0
  firebase_messaging: ^15.0.0
  firebase_core: ^3.0.0
  workmanager: ^0.5.0
  timezone: ^0.9.0
  
  # Ses (Erişilebilirlik)
  flutter_tts: ^3.8.5             # Sesli özet
  
  # State Management
  provider: ^6.1.0                # Basit state yönetimi
```

---

## 🔄 Veri Akışı

```
GPS / Kayıtlı Yer
       ↓
Open-Meteo API
(precipitation, wind_gusts, soil_moisture, weather_code, temperature)
       ↓
WeatherData modeli
(ham veri parse & normalize)
       ↓
decision_engine.dart
(sulama/ilaçlama kararı + kritik uyarı tespiti)
       ↓
Ana Ekran (Şehir / Çiftçi)
+ Bildirim Sistemi
+ TTS (Sesli Özet)
```

---

## 💰 Gelir Modeli

| Yöntem | Açıklama |
|--------|----------|
| ☕ Kahve Ismarla | Uygulama içi bağış butonu (tek seferlik) |
| 🤝 Yerel Sponsorluk | Ziraat odası / kooperatif "Sponsorlu Mesaj" |
| 🚫 Reklam Yok | Banner/interstitial asla kullanılmaz |

---

## 🚫 "Kesinlikle Olmayacak" Listesi

- [ ] Radar haritası, bulut animasyonu
- [ ] UV indeksi, çiğ noktası, hissedilen sıcaklık gösterimi
- [ ] Kayıt / Giriş zorunluluğu
- [ ] 5 günlük detaylı tahmin tablosu
- [ ] Banner reklam

---

## 🗓 Geliştirme Yol Haritası

### Hafta 1 — Temel İskelet
- [x] Proje kurulumu (Flutter + Firebase)
- [x] Onboarding akışı (mod seçimi + isim + konum)
- [x] Open-Meteo API bağlantısı
- [x] Aksiyon karar motoru (sulama, ilaçlama, kritik uyarı)

### Hafta 2 — Kullanıcı Arayüzü
- [x] Şehir modu ana ekranı
- [x] Çiftçi modu ana ekranı
- [x] Kayıtlı konumlar ekranı ("Evim", "Alt Tarla" gibi)
- [x] Çok dilli altyapı (TR + EN)

### Hafta 3 — Bildirimler ve Erişilebilirlik
- [x] Yerel bildirimler (zamanlı, saat 20:00 akşam özeti)
- [x] Firebase push bildirimleri (FCM token entegrasyonu)
- [x] Sesli okuma (TTS — "🔊 Sesli Dinle" butonu)
- [x] Arka plan hava kontrolü (WorkManager)

### Hafta 4 — Test ve Yayın
- [x] Android release imzalama iskeleti (`scripts/create_release_keystore.sh`)
- [x] Gizlilik politikası (uygulama içi + `docs/privacy-policy.html`)
- [x] Splash optimizasyonu (~9 MB → ~630 KB)
- [x] Ayarlar ekranı EN/TR l10n
- [ ] CI workflow (GitHub token `workflow` izni gerekir; Pages push sonrası eklenebilir)
- [ ] Release AAB build (`flutter build appbundle --release`)
- [ ] iOS TestFlight (`pod install` + `flutter build ipa`)
- [ ] Kullanıcı testi (gerçek çiftçi/yaşlı ile)
- [ ] Play Store yayını

### Ek Özellikler (Tamamlanan)
- [x] **Çiftçi Paneli erişimi:** Ayarlar → Konumlar & Paneller → "Çiftçi Paneli" (sulama, ilaçlama, don/dolu)
- [x] **Sesli Okuma (TTS):** Ayarlarda "Sesli Okuma" aç/kapa + "Sesli Dinle" butonu (ana ekran & ayarlar)
- [x] **Offline önbellek:** Son başarılı hava verisi cache'lenir; hata ekranında "Önbellekteki veriyi göster"
- [x] **API dayanıklılığı:** Open-Meteo tekrar deneme; cache ile offline kullanım
- [x] **Bildirim tercihleri:** Akşam özeti, kritik uyarılar, yağış uyarıları ayrı ayrı açılıp kapatılabilir
- [x] **"Yakında yağış" bildirimi:** Sonraki saatlerde yüksek yağış ihtimalinde yerel bildirim
- [x] **Hakkında & Kahve Ismarla:** Ayarlarda sürüm, Open-Meteo teşekkür, bağış linki
- [x] **Uygulama kısayolları (Android 7.1+):** Launcher'da uzun basınca "Hava Durumu", "Konumum"
- [x] **Veri güncelleme metni:** "Veriler X dk önce güncellendi" / "Önbellekten · X dk önce"
- [x] **Performans:** Partikül katmanı RepaintBoundary ile izole; API tekrar deneme

---

## 📝 Notlar

> "Bu uygulamanın başarısı, sunduğu verinin doğruluğundan ziyade, bu veriyi Hüseyin Amca'nın hayatını nasıl kolaylaştıracak bir tavsiyeye dönüştürdüğünde saklıdır."

---

*Son güncelleme: Haziran 2026 | Versiyon: 0.2.0+2 | Yayın hazırlığı: l10n, gizlilik, CI, splash optimizasyonu*
