# Uygulama Mesaj Tonu

Tüm kullanıcıya dönük metinler (ana ekran, özet, bildirim, görev devamı vb.) şu dengede yazılır:

| Pay | Ne |
|-----|-----|
| **%70** | Zeki, net, bağlam kuran: saat, risk, pratik öneri. Gösterişli jargon yok. |
| **%20** | Hafif mizah: küçük ima, kısa nefes, abartısız. |
| **%10** | Sıcaklık: “sen” dili, kısa empati, yalnız hissettirmez. |

## Olmasın

- Resmî kurum dili, robot liste, sürekli ünlem
- Abartılı şaka, meme dili, sürekli espri
- Romantik / duygusal şiir, aşırı metafor

## Olsun

- “Sen” veya doğal tekil hitap; gerektiğinde “birlikte” hissi
- Bir cümle bilgi, bir cümle ne yapılır (veya tersi)
- Kritik uyarılarda netlik önce; mizah ikinci planda veya yok

## Teknik

- Metin üretimi: `lib/core/services/weather_message_service.dart`
- Plan/görev devamı (saatlik, ulaşım, açık alan, görev türü): `lib/core/services/plan_message_service.dart` ve `lib/features/tasks/daily_task_provider.dart`
- Görev uyarıları: `lib/core/services/daily_task_service.dart`

Yeni metin eklerken bu dosyayı oku; aynı dengeyi koru.
