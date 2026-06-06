import 'package:flutter/material.dart';

import 'services/preferences_service.dart';

/// Kayıtlı dil tercihini [MaterialApp.locale] ile senkron tutar.
class AppLocaleNotifier extends ChangeNotifier {
  Locale? _locale;

  Locale? get locale => _locale;

  void applyLanguageCode(String code) {
    final next = Locale(code);
    if (_locale == next) return;
    _locale = next;
    notifyListeners();
  }

  Future<void> loadFromStorage() async {
    final prefs = await PreferencesService().load();
    applyLanguageCode(prefs.languageCode);
  }

  Future<void> setLanguageCode(String code) async {
    final service = PreferencesService();
    final prefs = await service.load();
    await service.save(prefs.copyWith(languageCode: code));
    applyLanguageCode(code);
  }
}
