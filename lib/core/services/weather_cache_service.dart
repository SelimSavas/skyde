import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/weather_data.dart';
import '../utils/debug_log.dart';

/// Son başarılı hava durumu yanıtını önbelleğe alır; offline veya API hatasında kullanılır.
class WeatherCacheService {
  static const _keyJson = 'weather_cache_json';
  static const _keyTime = 'weather_cache_time_ms';
  static const _maxAgeHours = 24;

  static Future<void> save(String rawJson) async {
    final sp = await SharedPreferences.getInstance();
    await sp.setString(_keyJson, rawJson);
    await sp.setInt(_keyTime, DateTime.now().millisecondsSinceEpoch);
  }

  static Future<WeatherData?> getCached() async {
    final sp = await SharedPreferences.getInstance();
    final jsonStr = sp.getString(_keyJson);
    final timeMs = sp.getInt(_keyTime);
    if (jsonStr == null || timeMs == null) return null;
    final age = DateTime.now().millisecondsSinceEpoch - timeMs;
    if (age > _maxAgeHours * 60 * 60 * 1000) return null;
    try {
      final map = jsonDecode(jsonStr) as Map<String, dynamic>;
      return WeatherData.fromOpenMeteo(map);
    } catch (e, st) {
      logSilentFailure('weatherCache.parse', e, st);
      return null;
    }
  }

  static Future<DateTime?> lastFetchTime() async {
    final sp = await SharedPreferences.getInstance();
    final timeMs = sp.getInt(_keyTime);
    if (timeMs == null) return null;
    return DateTime.fromMillisecondsSinceEpoch(timeMs);
  }
}
