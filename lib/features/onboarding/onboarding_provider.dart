import 'package:flutter/material.dart';
import '../../core/models/user_preferences.dart';
import '../../core/services/location_service.dart';
import '../../core/services/preferences_service.dart';

class OnboardingProvider extends ChangeNotifier {
  final _prefsService = PreferencesService();
  final _locationService = LocationService();

  String _name = '';
  UserMode? _mode;

  String get name => _name;
  UserMode? get selectedMode => _mode;

  void setName(String name) {
    _name = name;
    notifyListeners();
  }

  void setMode(UserMode mode) {
    _mode = mode;
    notifyListeners();
  }

  Future<void> requestLocation() async {
    await _locationService.getCurrentLocation();
    notifyListeners();
  }

  Future<void> complete() async {
    final prefs = UserPreferences(
      name: _name,
      mode: _mode ?? UserMode.city,
      isOnboardingComplete: true,
    );
    await _prefsService.save(prefs);
  }
}
