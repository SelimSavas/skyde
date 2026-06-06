import 'app_localizations.dart';

/// The translations for Turkish (`tr`).
class AppLocalizationsTr extends AppLocalizations {
  AppLocalizationsTr([String locale = 'tr']) : super(locale);

  @override
  String get appTitle => 'Skyde';

  @override
  String goodMorning(String name) {
    return 'Günaydın $name';
  }

  @override
  String goodAfternoon(String name) {
    return 'İyi günler $name';
  }

  @override
  String goodEvening(String name) {
    return 'İyi akşamlar $name';
  }

  @override
  String get noRainToday => 'Bugün yağmur yok.';

  @override
  String get rainExpected => 'Yağmur bekleniyor.';

  @override
  String get stormWarning => 'Fırtına uyarısı! Önlem al.';

  @override
  String get frostWarning => 'Donma riski! Bu gece çok soğuk.';

  @override
  String get hailWarning => 'Dolu tehlikesi! Ürünleri koru.';

  @override
  String get greenStatus => 'Sorun yok, işine bak.';

  @override
  String get yellowStatus => 'Dikkatli ol, değişim geliyor.';

  @override
  String get redStatus => 'Dur, hemen önlem al!';

  @override
  String get irrigationNotNeeded => 'Bugün sulama gerekmez.';

  @override
  String get irrigationNeeded => 'Sulama yapabilirsin.';

  @override
  String get sprayingOk => 'İlaçlama için uygun.';

  @override
  String get sprayingNotOk => 'İlaçlama için uygun değil. Rüzgar çok sert.';

  @override
  String get onboarding_welcome => 'Merhaba! Ben senin hava asistanınım.';

  @override
  String get onboarding_nameQuestion => 'Sana nasıl sesleneyim?';

  @override
  String get onboarding_namePlaceholder => 'Adını yaz (örn: Hüseyin)';

  @override
  String get onboarding_modeQuestion => 'Hava durumunu ne için takip ediyorsun?';

  @override
  String get onboarding_cityMode => 'Şehir Modu';

  @override
  String get onboarding_cityModeDesc => 'Dışarı çıkacağım, günlük plan yapıyorum.';

  @override
  String get onboarding_farmerMode => 'Çiftçi Modu';

  @override
  String get onboarding_farmerModeDesc => 'Üretim yapıyorum, tarlamı/bahçemi yönetiyorum.';

  @override
  String get onboarding_locationQuestion => 'Konumuna erişebilir miyim?';

  @override
  String get onboarding_allowLocation => 'Evet, konumumu al';

  @override
  String get onboarding_enterManual => 'Hayır, kendim gireceğim';

  @override
  String get onboarding_continue => 'Devam Et';

  @override
  String get onboarding_start => 'Başlayalım!';

  @override
  String get locationMyHome => 'Evim';

  @override
  String get locationAdd => 'Yer Ekle';

  @override
  String get locationName => 'Yer adı (örn: Alt Tarla, Bağ)';

  @override
  String get settingsTitle => 'Ayarlar';

  @override
  String get settingsName => 'İsim';

  @override
  String get settingsMode => 'Mod';

  @override
  String get settingsLanguage => 'Dil';

  @override
  String get settingsNotifications => 'Bildirimler';

  @override
  String get settingsVoice => 'Sesli Okuma';

  @override
  String get settingsVoiceButton => 'Sesli Dinle';

  @override
  String notificationRainSoon(String name, int minutes) {
    return '$name, $minutes dakika sonra sağanak başlıyor.';
  }

  @override
  String notificationEveningSummary(String summary) {
    return 'Yarın: $summary';
  }

  @override
  String get lightJacketNeeded => 'Hafif ceket yeterli.';

  @override
  String get heavyCoatNeeded => 'Kalın mont giy.';

  @override
  String get umbrellaNeeded => 'Şemsiye al!';

  @override
  String get windyDay => 'Rüzgarlı bir gün.';

  @override
  String get loading => 'Hava durumu alınıyor...';

  @override
  String get errorNoLocation => 'Konum alınamadı.';

  @override
  String get errorNoInternet => 'İnternet bağlantısı yok.';

  @override
  String get retry => 'Tekrar Dene';

  @override
  String get donateButton => '☕ Bir Kahve Ismarla';

  @override
  String get splashTagline => 'Hava ve günlük plan asistanın';

  @override
  String get splashPreparing => 'Hazırlanıyor…';

  @override
  String get shareAction => 'Paylaş';

  @override
  String get settingsSubtitle => 'Deneyimini kişiselleştir';

  @override
  String get settingsSectionUserMode => 'Kullanıcı Modu';

  @override
  String get settingsSectionName => 'Sana nasıl hitap edelim?';

  @override
  String get settingsSectionNotifications => 'Bildirim Tercihleri';

  @override
  String get settingsSectionVoice => 'Sesli Okuma';

  @override
  String get settingsSectionLocations => 'Konumlar & Paneller';

  @override
  String get settingsSectionLanguage => 'Dil';

  @override
  String get settingsSectionAbout => 'Hakkında';

  @override
  String get settingsCityModeSub => 'Günlük yaşam';

  @override
  String get settingsFarmerModeSub => 'Tarla & Üretim';

  @override
  String get settingsNameHint => 'İsminizi girin…';

  @override
  String get settingsNotifAllSub => 'Tüm hava uyarılarını aç/kapat';

  @override
  String get settingsEveningSummary => 'Akşam Özeti';

  @override
  String get settingsEveningSummarySub => 'Her gün 20:00\'de yarının özeti';

  @override
  String get settingsCriticalAlerts => 'Kritik Uyarılar';

  @override
  String get settingsCriticalAlertsSub => 'Don, dolu, fırtına';

  @override
  String get settingsPrecipitationAlerts => 'Yağış Uyarıları';

  @override
  String get settingsPrecipitationAlertsSub => 'Yakında yağış bekleniyor';

  @override
  String get settingsPlanReminders => 'Plan Hatırlatmaları';

  @override
  String get settingsPlanRemindersSub => 'Kaydettiğin aksiyon planlarına göre kısa uyarı';

  @override
  String get settingsTtsSub => 'Ana ekranda sesli özet dinle';

  @override
  String get settingsVoiceDemoSub => 'Güncel özeti dinle';

  @override
  String get settingsTtsHint => 'Daha kaliteli ses için Android\'de \"Google Metin okuma\" motorunu yükleyebilirsiniz (Ayarlar → Dil ve giriş → Metin okuma).';

  @override
  String get settingsManageLocations => 'Konumlarımı Yönet';

  @override
  String get settingsManageLocationsSub => 'Evim, Tarla, İşyeri…';

  @override
  String get settingsFarmerPanel => 'Çiftçi Paneli';

  @override
  String get settingsFarmerPanelSub => 'Sulama, ilaçlama, don/dolu özeti';

  @override
  String get settingsCustomizeTasks => 'Görevleri Özelleştir';

  @override
  String get settingsCustomizeTasksSub => 'Şehir ve çiftçi modu görevlerini aç/kapat';

  @override
  String get settingsVersion => 'Sürüm';

  @override
  String get settingsWeatherData => 'Hava verisi';

  @override
  String get settingsWeatherDataValue => 'Open-Meteo (ücretsiz)';

  @override
  String get settingsPrivacyPolicy => 'Gizlilik Politikası';

  @override
  String get settingsPrivacyPolicySub => 'Veri kullanımı ve haklarınız';

  @override
  String get settingsPrivacyPolicyWeb => 'Gizlilik (Web)';

  @override
  String get settingsPrivacyPolicyWebSub => 'Mağaza için resmi sayfa';

  @override
  String get settingsDonateSub => 'Projeyi destekle';

  @override
  String get settingsFooter => 'Skyde · Open-Meteo ile çalışır';

  @override
  String get settingsLanguageTr => 'Türkçe';

  @override
  String get settingsLanguageEn => 'English';

  @override
  String get privacyPolicyTitle => 'Gizlilik Politikası';

  @override
  String get privacyPolicyBody => 'Skyde (“uygulama”) kişisel hava durumu ve günlük plan asistanıdır.\n\nToplanan veriler\n• Konum: Hava tahmini için yalnızca uygulama açıkken veya sizin seçtiğiniz kayıtlı konumlar.\n• İsim ve tercihler: Cihazınızda yerel olarak saklanır (mod, bildirim, dil).\n• Kayıtlı yerler ve planlar: Cihazınızda yerel depolama (Hive / SharedPreferences).\n• Bildirimler: Yerel uyarılar ve isteğe bağlı Firebase Cloud Messaging (FCM) token.\n\nVeri paylaşımı\n• Hava verisi Open-Meteo API’sinden alınır; konum koordinatları bu servise gönderilir.\n• Verileriniz üçüncü taraflara satılmaz.\n\nSaklama\n• Tercihler ve önbellek cihazınızda kalır. Uygulamayı kaldırınca yerel veriler silinir.\n\nHaklarınız\n• Bildirimleri ve konumu ayarlardan kapatabilirsiniz.\n• Sorularınız için: destek@skyde.app\n\nSon güncelleme: Mart 2026';
}
