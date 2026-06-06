import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_preferences.dart';

class PreferencesService {
  static const _keyName = 'user_name';
  static const _keyMode = 'user_mode';
  static const _keyLanguage = 'language_code';
  static const _keyNotifications = 'notifications_enabled';
  static const _keyNotifEvening = 'notifications_evening_summary';
  static const _keyNotifCritical = 'notifications_critical_alerts';
  static const _keyNotifPrecip = 'notifications_precipitation_alerts';
  static const _keyNotifPlan = 'notifications_plan_alerts';
  static const _keyVoice = 'voice_enabled';
  static const _keyOnboarding = 'onboarding_complete';

  Future<UserPreferences> load() async {
    final prefs = await SharedPreferences.getInstance();
    return UserPreferences(
      name: prefs.getString(_keyName) ?? '',
      mode: prefs.getString(_keyMode) == 'farmer' ? UserMode.farmer : UserMode.city,
      languageCode: prefs.getString(_keyLanguage) ?? 'tr',
      notificationsEnabled: prefs.getBool(_keyNotifications) ?? true,
      notificationsEveningSummary: prefs.getBool(_keyNotifEvening) ?? true,
      notificationsCriticalAlerts: prefs.getBool(_keyNotifCritical) ?? true,
      notificationsPrecipitationAlerts: prefs.getBool(_keyNotifPrecip) ?? true,
      notificationsPlanAlerts: prefs.getBool(_keyNotifPlan) ?? true,
      voiceEnabled: prefs.getBool(_keyVoice) ?? false,
      isOnboardingComplete: prefs.getBool(_keyOnboarding) ?? false,
    );
  }

  Future<void> save(UserPreferences prefs) async {
    final sp = await SharedPreferences.getInstance();
    await sp.setString(_keyName, prefs.name);
    await sp.setString(_keyMode, prefs.mode == UserMode.farmer ? 'farmer' : 'city');
    await sp.setString(_keyLanguage, prefs.languageCode);
    await sp.setBool(_keyNotifications, prefs.notificationsEnabled);
    await sp.setBool(_keyNotifEvening, prefs.notificationsEveningSummary);
    await sp.setBool(_keyNotifCritical, prefs.notificationsCriticalAlerts);
    await sp.setBool(_keyNotifPrecip, prefs.notificationsPrecipitationAlerts);
    await sp.setBool(_keyNotifPlan, prefs.notificationsPlanAlerts);
    await sp.setBool(_keyVoice, prefs.voiceEnabled);
    await sp.setBool(_keyOnboarding, prefs.isOnboardingComplete);
  }
}
