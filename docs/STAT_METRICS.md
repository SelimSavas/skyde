# Üçlü → dörtlü istatistik kartları (şehir & çiftçi)

## Şehir modu — önerilen mantık

| Sekme   | Metrikler | Neden |
|--------|-----------|--------|
| **Bugün** | Sıcaklık, Hissedilen, Nem, Yağış iht. | Günlük giyim + şemsiye kararı; rüzgar genelde metin özetinde. |
| **Yarın** | Yarın Max, Yarın Min, Yağış iht., Rüzgar | Yarınki günlük paket; iş/okul dışı plan. |
| **Haftalık** | Hafta Max, Hafta Min, Yağışlı gün, Don riski | Haftalık ekstrem ve tarım/araç için don uyarısı. |

*Alternatif (ileride):* Bugün 4. kutuda **Rüzgar**; haftalıkta **En yüksek rüzgar** gibi takas edilebilir.

## Çiftçi modu — önerilen mantık

| Sekme | Kaynak | Metrikler (uygulama) |
|-------|--------|----------------------|
| **Bugün** | `WeatherTheme.stats` | Sıcaklık, Nem, Rüzgar + koşullu 4.: anlık yağış (mm), toprak nemi, güçlü güst veya yağış iht. |
| **Yarın** | `home_screen` tab 1 | Yarın Max/Min, Yağış iht., Rüzgar |
| **Haftalık** | `home_screen` tab 2 | Hafta Max/Min, Yağışlı gün, Don riski |

İlaçlama/sulama uyarıları metin ve görev katmanında kalır; sayılar “hızlı bakış” içindir.

## UI

Dört sütun için kartlar `figma_layout.dart` içinde küçültüldü (ikon, yazı, padding).
