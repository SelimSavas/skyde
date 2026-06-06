import 'package:flutter/material.dart';
import '../../core/models/saved_location.dart';
import '../../core/models/user_preferences.dart';
import '../../core/models/weather_data.dart';
import '../../core/services/location_service.dart';
import '../../core/services/preferences_service.dart';
import '../../core/services/weather_cache_service.dart';
import '../../core/services/weather_service.dart';
import '../../core/utils/decision_engine.dart';
import '../../core/utils/weather_theme.dart';
import '../locations/locations_provider.dart';

enum HomeStatus { loading, success, error }

class HomeProvider extends ChangeNotifier {
  final _weatherService = WeatherService();
  final _locationService = LocationService();
  final _prefsService = PreferencesService();

  HomeStatus _status = HomeStatus.loading;
  WeatherData? _weatherData;
  WeatherDecision? _decision;
  UserPreferences? _prefs;
  String? _errorMessage;
  String? _activeLocationName;
  DateTime? _lastFetchTime;
  bool _fromCache = false;

  HomeStatus get status => _status;
  WeatherData? get weatherData => _weatherData;
  WeatherDecision? get decision => _decision;
  UserPreferences? get prefs => _prefs;
  String? get errorMessage => _errorMessage;
  String? get activeLocationName => _activeLocationName;
  DateTime? get lastFetchTime => _lastFetchTime;
  bool get fromCache => _fromCache;

  /// Önbellekte veri var mı (hata ekranında "Önbellekteki veriyi göster" için)
  Future<bool> get hasCachedData async =>
      await WeatherCacheService.getCached() != null;

  WeatherTheme? get theme {
    final data = _weatherData;
    final prefs = _prefs;
    if (data == null || prefs == null) return null;
    return WeatherTheme.forHome(
      data: data,
      displayType: data.weatherType,
      mode: prefs.mode,
      tabIndex: 0,
    );
  }

  /// Kaydedilmiş aktif yer varsa onu kullan, yoksa GPS'e düş
  Future<void> loadData({LocationsProvider? locationsProvider}) async {
    _status = HomeStatus.loading;
    notifyListeners();

    try {
      _prefs = await _prefsService.load();

      double? lat, lng;
      final bool useLive = locationsProvider?.useLiveLocation ?? true;
      final SavedLocation? activeLoc = locationsProvider?.activeLocation;

      if (!useLive && activeLoc != null) {
        // Kayıtlı yer seçili
        lat = activeLoc.latitude;
        lng = activeLoc.longitude;
        _activeLocationName = activeLoc.name;
      } else {
        // Canlı konum kullan
        final position = await _locationService.getCurrentLocation();
        if (position == null) throw Exception('Konum alınamadı');
        lat = position.latitude;
        lng = position.longitude;
        _activeLocationName = 'Konumum';
      }

      _weatherData = await _weatherService.fetchWeather(
        latitude: lat,
        longitude: lng,
      );
      _decision = DecisionEngine.evaluate(_weatherData!);
      _lastFetchTime = DateTime.now();
      _fromCache = false;
      _status = HomeStatus.success;
    } catch (e) {
      final usedCache = await _applyCacheIfAvailable();
      if (!usedCache) {
        _errorMessage = e.toString();
        _status = HomeStatus.error;
      }
    }

    notifyListeners();
  }

  Future<bool> _applyCacheIfAvailable() async {
    final cached = await WeatherCacheService.getCached();
    if (cached == null) return false;
    _weatherData = cached;
    _decision = DecisionEngine.evaluate(cached);
    _lastFetchTime = await WeatherCacheService.lastFetchTime();
    _fromCache = true;
    _status = HomeStatus.success;
    _errorMessage = null;
    if (_prefs == null) _prefs = await _prefsService.load();
    return true;
  }

  /// Önbellekteki son veriyi yükle (API hatasında kullanıcı seçerse). Önbellek yoksa false döner.
  Future<bool> loadFromCache() async {
    final ok = await _applyCacheIfAvailable();
    if (ok) notifyListeners();
    return ok;
  }

  /// Mod değişimi (tercihen Ayarlar üzerinden; prefs diske yazıldıktan sonra çağır)
  Future<void> switchMode(UserMode newMode) async {
    if (_prefs == null || _prefs!.mode == newMode) return;
    _prefs = _prefs!.copyWith(mode: newMode);
    await _prefsService.save(_prefs!);
    notifyListeners();
  }

  /// Ayarlardan dönünce veya diske yazılan tercihleri ana ekrana yansıt
  Future<void> reloadPrefsFromStorage() async {
    _prefs = await _prefsService.load();
    notifyListeners();
  }
}
