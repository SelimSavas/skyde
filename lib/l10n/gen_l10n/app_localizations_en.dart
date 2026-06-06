import 'app_localizations.dart';

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Skyde';

  @override
  String goodMorning(String name) {
    return 'Good morning, $name';
  }

  @override
  String goodAfternoon(String name) {
    return 'Good afternoon, $name';
  }

  @override
  String goodEvening(String name) {
    return 'Good evening, $name';
  }

  @override
  String get noRainToday => 'No rain today.';

  @override
  String get rainExpected => 'Rain is expected.';

  @override
  String get stormWarning => 'Storm warning! Take precautions.';

  @override
  String get frostWarning => 'Frost risk! Very cold tonight.';

  @override
  String get hailWarning => 'Hail danger! Protect your crops.';

  @override
  String get greenStatus => 'All clear, carry on.';

  @override
  String get yellowStatus => 'Be careful, changes coming.';

  @override
  String get redStatus => 'Stop, take action now!';

  @override
  String get irrigationNotNeeded => 'No need to irrigate today.';

  @override
  String get irrigationNeeded => 'You can irrigate today.';

  @override
  String get sprayingOk => 'Good conditions for spraying.';

  @override
  String get sprayingNotOk => 'Not suitable for spraying. Too windy.';

  @override
  String get onboarding_welcome => 'Hello! I am your weather assistant.';

  @override
  String get onboarding_nameQuestion => 'What should I call you?';

  @override
  String get onboarding_namePlaceholder => 'Enter your name (e.g. John)';

  @override
  String get onboarding_modeQuestion => 'Why do you follow the weather?';

  @override
  String get onboarding_cityMode => 'City Mode';

  @override
  String get onboarding_cityModeDesc => 'Going out, planning my day.';

  @override
  String get onboarding_farmerMode => 'Farmer Mode';

  @override
  String get onboarding_farmerModeDesc => 'I manage my farm or garden.';

  @override
  String get onboarding_locationQuestion => 'Can I access your location?';

  @override
  String get onboarding_allowLocation => 'Yes, use my location';

  @override
  String get onboarding_enterManual => 'No, I\'ll enter it manually';

  @override
  String get onboarding_continue => 'Continue';

  @override
  String get onboarding_start => 'Let\'s Start!';

  @override
  String get locationMyHome => 'My Home';

  @override
  String get locationAdd => 'Add Location';

  @override
  String get locationName => 'Location name (e.g. Lower Field, Vineyard)';

  @override
  String get settingsTitle => 'Settings';

  @override
  String get settingsName => 'Name';

  @override
  String get settingsMode => 'Mode';

  @override
  String get settingsLanguage => 'Language';

  @override
  String get settingsNotifications => 'Notifications';

  @override
  String get settingsVoice => 'Voice Reading';

  @override
  String get settingsVoiceButton => 'Listen';

  @override
  String notificationRainSoon(String name, int minutes) {
    return '$name, heavy rain starts in $minutes minutes.';
  }

  @override
  String notificationEveningSummary(String summary) {
    return 'Tomorrow: $summary';
  }

  @override
  String get lightJacketNeeded => 'A light jacket is enough.';

  @override
  String get heavyCoatNeeded => 'Wear a heavy coat.';

  @override
  String get umbrellaNeeded => 'Take an umbrella!';

  @override
  String get windyDay => 'It\'s a windy day.';

  @override
  String get loading => 'Getting weather...';

  @override
  String get errorNoLocation => 'Could not get location.';

  @override
  String get errorNoInternet => 'No internet connection.';

  @override
  String get retry => 'Try Again';

  @override
  String get donateButton => '☕ Buy Me a Coffee';

  @override
  String get splashTagline => 'Your weather & daily plan assistant';

  @override
  String get splashPreparing => 'Getting ready…';

  @override
  String get shareAction => 'Share';

  @override
  String get settingsSubtitle => 'Personalize your experience';

  @override
  String get settingsSectionUserMode => 'User Mode';

  @override
  String get settingsSectionName => 'What should we call you?';

  @override
  String get settingsSectionNotifications => 'Notification Preferences';

  @override
  String get settingsSectionVoice => 'Voice Reading';

  @override
  String get settingsSectionLocations => 'Locations & Panels';

  @override
  String get settingsSectionLanguage => 'Language';

  @override
  String get settingsSectionAbout => 'About';

  @override
  String get settingsCityModeSub => 'Daily life';

  @override
  String get settingsFarmerModeSub => 'Farm & production';

  @override
  String get settingsNameHint => 'Enter your name…';

  @override
  String get settingsNotifAllSub => 'Turn all weather alerts on/off';

  @override
  String get settingsEveningSummary => 'Evening Summary';

  @override
  String get settingsEveningSummarySub => 'Tomorrow\'s summary at 8:00 PM';

  @override
  String get settingsCriticalAlerts => 'Critical Alerts';

  @override
  String get settingsCriticalAlertsSub => 'Frost, hail, storm';

  @override
  String get settingsPrecipitationAlerts => 'Rain Alerts';

  @override
  String get settingsPrecipitationAlertsSub => 'Rain expected soon';

  @override
  String get settingsPlanReminders => 'Plan Reminders';

  @override
  String get settingsPlanRemindersSub => 'Short alerts based on your action plans';

  @override
  String get settingsTtsSub => 'Listen to voice summary on home screen';

  @override
  String get settingsVoiceDemoSub => 'Listen to current summary';

  @override
  String get settingsTtsHint => 'For better voice on Android, install the Google Text-to-speech engine (Settings → Language & input → Text-to-speech).';

  @override
  String get settingsManageLocations => 'Manage My Locations';

  @override
  String get settingsManageLocationsSub => 'Home, Field, Work…';

  @override
  String get settingsFarmerPanel => 'Farmer Panel';

  @override
  String get settingsFarmerPanelSub => 'Irrigation, spraying, frost/hail summary';

  @override
  String get settingsCustomizeTasks => 'Customize Tasks';

  @override
  String get settingsCustomizeTasksSub => 'Enable/disable city and farmer mode tasks';

  @override
  String get settingsVersion => 'Version';

  @override
  String get settingsWeatherData => 'Weather data';

  @override
  String get settingsWeatherDataValue => 'Open-Meteo (free)';

  @override
  String get settingsPrivacyPolicy => 'Privacy Policy';

  @override
  String get settingsPrivacyPolicySub => 'Data use and your rights';

  @override
  String get settingsPrivacyPolicyWeb => 'Privacy (Web)';

  @override
  String get settingsPrivacyPolicyWebSub => 'Official page for app stores';

  @override
  String get settingsDonateSub => 'Support the project';

  @override
  String get settingsFooter => 'Skyde · Powered by Open-Meteo';

  @override
  String get settingsLanguageTr => 'Turkish';

  @override
  String get settingsLanguageEn => 'English';

  @override
  String get privacyPolicyTitle => 'Privacy Policy';

  @override
  String get privacyPolicyBody => 'Skyde is a personal weather and daily planning assistant.\n\nData we collect\n• Location: Only while the app is open or for saved locations you choose.\n• Name & preferences: Stored locally on your device (mode, notifications, language).\n• Saved places & plans: Local storage on your device.\n• Notifications: Local alerts and optional Firebase Cloud Messaging (FCM) token.\n\nData sharing\n• Weather data comes from the Open-Meteo API; coordinates are sent to this service.\n• Your data is not sold to third parties.\n\nRetention\n• Preferences and cache stay on your device. Uninstalling removes local data.\n\nYour rights\n• You can turn off notifications and location in Settings.\n• Questions: support@skyde.app\n\nLast updated: March 2026';
}
