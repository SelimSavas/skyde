enum UserMode { city, farmer }

class UserPreferences {
  final String name;
  final UserMode mode;
  final String languageCode;
  final bool notificationsEnabled;
  /// Akşam özeti (her gün 20:00)
  final bool notificationsEveningSummary;
  /// Kritik uyarılar (don, dolu, fırtına)
  final bool notificationsCriticalAlerts;
  /// Yağış öncesi ("Yakında yağış bekleniyor")
  final bool notificationsPrecipitationAlerts;
  /// Kayıtlı aksiyon planlarına göre hatırlatma
  final bool notificationsPlanAlerts;
  /// Sesli okuma (TTS) açık mı
  final bool voiceEnabled;
  final bool isOnboardingComplete;

  const UserPreferences({
    required this.name,
    required this.mode,
    this.languageCode = 'tr',
    this.notificationsEnabled = true,
    this.notificationsEveningSummary = true,
    this.notificationsCriticalAlerts = true,
    this.notificationsPrecipitationAlerts = true,
    this.notificationsPlanAlerts = true,
    this.voiceEnabled = false,
    this.isOnboardingComplete = false,
  });

  UserPreferences copyWith({
    String? name,
    UserMode? mode,
    String? languageCode,
    bool? notificationsEnabled,
    bool? notificationsEveningSummary,
    bool? notificationsCriticalAlerts,
    bool? notificationsPrecipitationAlerts,
    bool? notificationsPlanAlerts,
    bool? voiceEnabled,
    bool? isOnboardingComplete,
  }) {
    return UserPreferences(
      name: name ?? this.name,
      mode: mode ?? this.mode,
      languageCode: languageCode ?? this.languageCode,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      notificationsEveningSummary: notificationsEveningSummary ?? this.notificationsEveningSummary,
      notificationsCriticalAlerts: notificationsCriticalAlerts ?? this.notificationsCriticalAlerts,
      notificationsPrecipitationAlerts: notificationsPrecipitationAlerts ?? this.notificationsPrecipitationAlerts,
      notificationsPlanAlerts: notificationsPlanAlerts ?? this.notificationsPlanAlerts,
      voiceEnabled: voiceEnabled ?? this.voiceEnabled,
      isOnboardingComplete: isOnboardingComplete ?? this.isOnboardingComplete,
    );
  }
}
