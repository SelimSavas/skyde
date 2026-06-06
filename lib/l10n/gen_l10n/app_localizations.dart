import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_tr.dart';

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'gen_l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale) : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates = <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('tr')
  ];

  /// No description provided for @appTitle.
  ///
  /// In tr, this message translates to:
  /// **'Skyde'**
  String get appTitle;

  /// No description provided for @goodMorning.
  ///
  /// In tr, this message translates to:
  /// **'Günaydın {name}'**
  String goodMorning(String name);

  /// No description provided for @goodAfternoon.
  ///
  /// In tr, this message translates to:
  /// **'İyi günler {name}'**
  String goodAfternoon(String name);

  /// No description provided for @goodEvening.
  ///
  /// In tr, this message translates to:
  /// **'İyi akşamlar {name}'**
  String goodEvening(String name);

  /// No description provided for @noRainToday.
  ///
  /// In tr, this message translates to:
  /// **'Bugün yağmur yok.'**
  String get noRainToday;

  /// No description provided for @rainExpected.
  ///
  /// In tr, this message translates to:
  /// **'Yağmur bekleniyor.'**
  String get rainExpected;

  /// No description provided for @stormWarning.
  ///
  /// In tr, this message translates to:
  /// **'Fırtına uyarısı! Önlem al.'**
  String get stormWarning;

  /// No description provided for @frostWarning.
  ///
  /// In tr, this message translates to:
  /// **'Donma riski! Bu gece çok soğuk.'**
  String get frostWarning;

  /// No description provided for @hailWarning.
  ///
  /// In tr, this message translates to:
  /// **'Dolu tehlikesi! Ürünleri koru.'**
  String get hailWarning;

  /// No description provided for @greenStatus.
  ///
  /// In tr, this message translates to:
  /// **'Sorun yok, işine bak.'**
  String get greenStatus;

  /// No description provided for @yellowStatus.
  ///
  /// In tr, this message translates to:
  /// **'Dikkatli ol, değişim geliyor.'**
  String get yellowStatus;

  /// No description provided for @redStatus.
  ///
  /// In tr, this message translates to:
  /// **'Dur, hemen önlem al!'**
  String get redStatus;

  /// No description provided for @irrigationNotNeeded.
  ///
  /// In tr, this message translates to:
  /// **'Bugün sulama gerekmez.'**
  String get irrigationNotNeeded;

  /// No description provided for @irrigationNeeded.
  ///
  /// In tr, this message translates to:
  /// **'Sulama yapabilirsin.'**
  String get irrigationNeeded;

  /// No description provided for @sprayingOk.
  ///
  /// In tr, this message translates to:
  /// **'İlaçlama için uygun.'**
  String get sprayingOk;

  /// No description provided for @sprayingNotOk.
  ///
  /// In tr, this message translates to:
  /// **'İlaçlama için uygun değil. Rüzgar çok sert.'**
  String get sprayingNotOk;

  /// No description provided for @onboarding_welcome.
  ///
  /// In tr, this message translates to:
  /// **'Merhaba! Ben senin hava asistanınım.'**
  String get onboarding_welcome;

  /// No description provided for @onboarding_nameQuestion.
  ///
  /// In tr, this message translates to:
  /// **'Sana nasıl sesleneyim?'**
  String get onboarding_nameQuestion;

  /// No description provided for @onboarding_namePlaceholder.
  ///
  /// In tr, this message translates to:
  /// **'Adını yaz (örn: Hüseyin)'**
  String get onboarding_namePlaceholder;

  /// No description provided for @onboarding_modeQuestion.
  ///
  /// In tr, this message translates to:
  /// **'Hava durumunu ne için takip ediyorsun?'**
  String get onboarding_modeQuestion;

  /// No description provided for @onboarding_cityMode.
  ///
  /// In tr, this message translates to:
  /// **'Şehir Modu'**
  String get onboarding_cityMode;

  /// No description provided for @onboarding_cityModeDesc.
  ///
  /// In tr, this message translates to:
  /// **'Dışarı çıkacağım, günlük plan yapıyorum.'**
  String get onboarding_cityModeDesc;

  /// No description provided for @onboarding_farmerMode.
  ///
  /// In tr, this message translates to:
  /// **'Çiftçi Modu'**
  String get onboarding_farmerMode;

  /// No description provided for @onboarding_farmerModeDesc.
  ///
  /// In tr, this message translates to:
  /// **'Üretim yapıyorum, tarlamı/bahçemi yönetiyorum.'**
  String get onboarding_farmerModeDesc;

  /// No description provided for @onboarding_locationQuestion.
  ///
  /// In tr, this message translates to:
  /// **'Konumuna erişebilir miyim?'**
  String get onboarding_locationQuestion;

  /// No description provided for @onboarding_allowLocation.
  ///
  /// In tr, this message translates to:
  /// **'Evet, konumumu al'**
  String get onboarding_allowLocation;

  /// No description provided for @onboarding_enterManual.
  ///
  /// In tr, this message translates to:
  /// **'Hayır, kendim gireceğim'**
  String get onboarding_enterManual;

  /// No description provided for @onboarding_continue.
  ///
  /// In tr, this message translates to:
  /// **'Devam Et'**
  String get onboarding_continue;

  /// No description provided for @onboarding_start.
  ///
  /// In tr, this message translates to:
  /// **'Başlayalım!'**
  String get onboarding_start;

  /// No description provided for @locationMyHome.
  ///
  /// In tr, this message translates to:
  /// **'Evim'**
  String get locationMyHome;

  /// No description provided for @locationAdd.
  ///
  /// In tr, this message translates to:
  /// **'Yer Ekle'**
  String get locationAdd;

  /// No description provided for @locationName.
  ///
  /// In tr, this message translates to:
  /// **'Yer adı (örn: Alt Tarla, Bağ)'**
  String get locationName;

  /// No description provided for @settingsTitle.
  ///
  /// In tr, this message translates to:
  /// **'Ayarlar'**
  String get settingsTitle;

  /// No description provided for @settingsName.
  ///
  /// In tr, this message translates to:
  /// **'İsim'**
  String get settingsName;

  /// No description provided for @settingsMode.
  ///
  /// In tr, this message translates to:
  /// **'Mod'**
  String get settingsMode;

  /// No description provided for @settingsLanguage.
  ///
  /// In tr, this message translates to:
  /// **'Dil'**
  String get settingsLanguage;

  /// No description provided for @settingsNotifications.
  ///
  /// In tr, this message translates to:
  /// **'Bildirimler'**
  String get settingsNotifications;

  /// No description provided for @settingsVoice.
  ///
  /// In tr, this message translates to:
  /// **'Sesli Okuma'**
  String get settingsVoice;

  /// No description provided for @settingsVoiceButton.
  ///
  /// In tr, this message translates to:
  /// **'Sesli Dinle'**
  String get settingsVoiceButton;

  /// No description provided for @notificationRainSoon.
  ///
  /// In tr, this message translates to:
  /// **'{name}, {minutes} dakika sonra sağanak başlıyor.'**
  String notificationRainSoon(String name, int minutes);

  /// No description provided for @notificationEveningSummary.
  ///
  /// In tr, this message translates to:
  /// **'Yarın: {summary}'**
  String notificationEveningSummary(String summary);

  /// No description provided for @lightJacketNeeded.
  ///
  /// In tr, this message translates to:
  /// **'Hafif ceket yeterli.'**
  String get lightJacketNeeded;

  /// No description provided for @heavyCoatNeeded.
  ///
  /// In tr, this message translates to:
  /// **'Kalın mont giy.'**
  String get heavyCoatNeeded;

  /// No description provided for @umbrellaNeeded.
  ///
  /// In tr, this message translates to:
  /// **'Şemsiye al!'**
  String get umbrellaNeeded;

  /// No description provided for @windyDay.
  ///
  /// In tr, this message translates to:
  /// **'Rüzgarlı bir gün.'**
  String get windyDay;

  /// No description provided for @loading.
  ///
  /// In tr, this message translates to:
  /// **'Hava durumu alınıyor...'**
  String get loading;

  /// No description provided for @errorNoLocation.
  ///
  /// In tr, this message translates to:
  /// **'Konum alınamadı.'**
  String get errorNoLocation;

  /// No description provided for @errorNoInternet.
  ///
  /// In tr, this message translates to:
  /// **'İnternet bağlantısı yok.'**
  String get errorNoInternet;

  /// No description provided for @retry.
  ///
  /// In tr, this message translates to:
  /// **'Tekrar Dene'**
  String get retry;

  /// No description provided for @donateButton.
  ///
  /// In tr, this message translates to:
  /// **'☕ Bir Kahve Ismarla'**
  String get donateButton;

  /// No description provided for @splashTagline.
  ///
  /// In tr, this message translates to:
  /// **'Hava ve günlük plan asistanın'**
  String get splashTagline;

  /// No description provided for @splashPreparing.
  ///
  /// In tr, this message translates to:
  /// **'Hazırlanıyor…'**
  String get splashPreparing;

  /// No description provided for @shareAction.
  ///
  /// In tr, this message translates to:
  /// **'Paylaş'**
  String get shareAction;

  /// No description provided for @settingsSubtitle.
  ///
  /// In tr, this message translates to:
  /// **'Deneyimini kişiselleştir'**
  String get settingsSubtitle;

  /// No description provided for @settingsSectionUserMode.
  ///
  /// In tr, this message translates to:
  /// **'Kullanıcı Modu'**
  String get settingsSectionUserMode;

  /// No description provided for @settingsSectionName.
  ///
  /// In tr, this message translates to:
  /// **'Sana nasıl hitap edelim?'**
  String get settingsSectionName;

  /// No description provided for @settingsSectionNotifications.
  ///
  /// In tr, this message translates to:
  /// **'Bildirim Tercihleri'**
  String get settingsSectionNotifications;

  /// No description provided for @settingsSectionVoice.
  ///
  /// In tr, this message translates to:
  /// **'Sesli Okuma'**
  String get settingsSectionVoice;

  /// No description provided for @settingsSectionLocations.
  ///
  /// In tr, this message translates to:
  /// **'Konumlar & Paneller'**
  String get settingsSectionLocations;

  /// No description provided for @settingsSectionLanguage.
  ///
  /// In tr, this message translates to:
  /// **'Dil'**
  String get settingsSectionLanguage;

  /// No description provided for @settingsSectionAbout.
  ///
  /// In tr, this message translates to:
  /// **'Hakkında'**
  String get settingsSectionAbout;

  /// No description provided for @settingsCityModeSub.
  ///
  /// In tr, this message translates to:
  /// **'Günlük yaşam'**
  String get settingsCityModeSub;

  /// No description provided for @settingsFarmerModeSub.
  ///
  /// In tr, this message translates to:
  /// **'Tarla & Üretim'**
  String get settingsFarmerModeSub;

  /// No description provided for @settingsNameHint.
  ///
  /// In tr, this message translates to:
  /// **'İsminizi girin…'**
  String get settingsNameHint;

  /// No description provided for @settingsNotifAllSub.
  ///
  /// In tr, this message translates to:
  /// **'Tüm hava uyarılarını aç/kapat'**
  String get settingsNotifAllSub;

  /// No description provided for @settingsEveningSummary.
  ///
  /// In tr, this message translates to:
  /// **'Akşam Özeti'**
  String get settingsEveningSummary;

  /// No description provided for @settingsEveningSummarySub.
  ///
  /// In tr, this message translates to:
  /// **'Her gün 20:00\'de yarının özeti'**
  String get settingsEveningSummarySub;

  /// No description provided for @settingsCriticalAlerts.
  ///
  /// In tr, this message translates to:
  /// **'Kritik Uyarılar'**
  String get settingsCriticalAlerts;

  /// No description provided for @settingsCriticalAlertsSub.
  ///
  /// In tr, this message translates to:
  /// **'Don, dolu, fırtına'**
  String get settingsCriticalAlertsSub;

  /// No description provided for @settingsPrecipitationAlerts.
  ///
  /// In tr, this message translates to:
  /// **'Yağış Uyarıları'**
  String get settingsPrecipitationAlerts;

  /// No description provided for @settingsPrecipitationAlertsSub.
  ///
  /// In tr, this message translates to:
  /// **'Yakında yağış bekleniyor'**
  String get settingsPrecipitationAlertsSub;

  /// No description provided for @settingsPlanReminders.
  ///
  /// In tr, this message translates to:
  /// **'Plan Hatırlatmaları'**
  String get settingsPlanReminders;

  /// No description provided for @settingsPlanRemindersSub.
  ///
  /// In tr, this message translates to:
  /// **'Kaydettiğin aksiyon planlarına göre kısa uyarı'**
  String get settingsPlanRemindersSub;

  /// No description provided for @settingsTtsSub.
  ///
  /// In tr, this message translates to:
  /// **'Ana ekranda sesli özet dinle'**
  String get settingsTtsSub;

  /// No description provided for @settingsVoiceDemoSub.
  ///
  /// In tr, this message translates to:
  /// **'Güncel özeti dinle'**
  String get settingsVoiceDemoSub;

  /// No description provided for @settingsTtsHint.
  ///
  /// In tr, this message translates to:
  /// **'Daha kaliteli ses için Android\'de \"Google Metin okuma\" motorunu yükleyebilirsiniz (Ayarlar → Dil ve giriş → Metin okuma).'**
  String get settingsTtsHint;

  /// No description provided for @settingsManageLocations.
  ///
  /// In tr, this message translates to:
  /// **'Konumlarımı Yönet'**
  String get settingsManageLocations;

  /// No description provided for @settingsManageLocationsSub.
  ///
  /// In tr, this message translates to:
  /// **'Evim, Tarla, İşyeri…'**
  String get settingsManageLocationsSub;

  /// No description provided for @settingsFarmerPanel.
  ///
  /// In tr, this message translates to:
  /// **'Çiftçi Paneli'**
  String get settingsFarmerPanel;

  /// No description provided for @settingsFarmerPanelSub.
  ///
  /// In tr, this message translates to:
  /// **'Sulama, ilaçlama, don/dolu özeti'**
  String get settingsFarmerPanelSub;

  /// No description provided for @settingsCustomizeTasks.
  ///
  /// In tr, this message translates to:
  /// **'Görevleri Özelleştir'**
  String get settingsCustomizeTasks;

  /// No description provided for @settingsCustomizeTasksSub.
  ///
  /// In tr, this message translates to:
  /// **'Şehir ve çiftçi modu görevlerini aç/kapat'**
  String get settingsCustomizeTasksSub;

  /// No description provided for @settingsVersion.
  ///
  /// In tr, this message translates to:
  /// **'Sürüm'**
  String get settingsVersion;

  /// No description provided for @settingsWeatherData.
  ///
  /// In tr, this message translates to:
  /// **'Hava verisi'**
  String get settingsWeatherData;

  /// No description provided for @settingsWeatherDataValue.
  ///
  /// In tr, this message translates to:
  /// **'Open-Meteo (ücretsiz)'**
  String get settingsWeatherDataValue;

  /// No description provided for @settingsPrivacyPolicy.
  ///
  /// In tr, this message translates to:
  /// **'Gizlilik Politikası'**
  String get settingsPrivacyPolicy;

  /// No description provided for @settingsPrivacyPolicySub.
  ///
  /// In tr, this message translates to:
  /// **'Veri kullanımı ve haklarınız'**
  String get settingsPrivacyPolicySub;

  /// No description provided for @settingsPrivacyPolicyWeb.
  ///
  /// In tr, this message translates to:
  /// **'Gizlilik (Web)'**
  String get settingsPrivacyPolicyWeb;

  /// No description provided for @settingsPrivacyPolicyWebSub.
  ///
  /// In tr, this message translates to:
  /// **'Mağaza için resmi sayfa'**
  String get settingsPrivacyPolicyWebSub;

  /// No description provided for @settingsDonateSub.
  ///
  /// In tr, this message translates to:
  /// **'Projeyi destekle'**
  String get settingsDonateSub;

  /// No description provided for @settingsFooter.
  ///
  /// In tr, this message translates to:
  /// **'Skyde · Open-Meteo ile çalışır'**
  String get settingsFooter;

  /// No description provided for @settingsLanguageTr.
  ///
  /// In tr, this message translates to:
  /// **'Türkçe'**
  String get settingsLanguageTr;

  /// No description provided for @settingsLanguageEn.
  ///
  /// In tr, this message translates to:
  /// **'English'**
  String get settingsLanguageEn;

  /// No description provided for @privacyPolicyTitle.
  ///
  /// In tr, this message translates to:
  /// **'Gizlilik Politikası'**
  String get privacyPolicyTitle;

  /// No description provided for @privacyPolicyBody.
  ///
  /// In tr, this message translates to:
  /// **'Skyde (“uygulama”) kişisel hava durumu ve günlük plan asistanıdır.\n\nToplanan veriler\n• Konum: Hava tahmini için yalnızca uygulama açıkken veya sizin seçtiğiniz kayıtlı konumlar.\n• İsim ve tercihler: Cihazınızda yerel olarak saklanır (mod, bildirim, dil).\n• Kayıtlı yerler ve planlar: Cihazınızda yerel depolama (Hive / SharedPreferences).\n• Bildirimler: Yerel uyarılar ve isteğe bağlı Firebase Cloud Messaging (FCM) token.\n\nVeri paylaşımı\n• Hava verisi Open-Meteo API’sinden alınır; konum koordinatları bu servise gönderilir.\n• Verileriniz üçüncü taraflara satılmaz.\n\nSaklama\n• Tercihler ve önbellek cihazınızda kalır. Uygulamayı kaldırınca yerel veriler silinir.\n\nHaklarınız\n• Bildirimleri ve konumu ayarlardan kapatabilirsiniz.\n• Sorularınız için: destek@skyde.app\n\nSon güncelleme: Mart 2026'**
  String get privacyPolicyBody;
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>['en', 'tr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {


  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en': return AppLocalizationsEn();
    case 'tr': return AppLocalizationsTr();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.'
  );
}
