import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/weather_data.dart';
import 'weather_cache_service.dart';

class WeatherService {
  static const String _baseUrl = 'https://api.open-meteo.com/v1/forecast';

  Future<WeatherData> fetchWeather({
    required double latitude,
    required double longitude,
  }) async {
    final uri = Uri.parse(_baseUrl).replace(queryParameters: {
      'latitude':  latitude.toString(),
      'longitude': longitude.toString(),
      'current': [
        'temperature_2m',
        'apparent_temperature',
        'precipitation',
        'rain',
        'wind_speed_10m',
        'wind_gusts_10m',
        'relative_humidity_2m',
        'weather_code',
      ].join(','),
      'hourly': [
        'precipitation_probability',
        'precipitation',
        'soil_moisture_0_to_1cm',
        'temperature_2m',
        'weather_code',
      ].join(','),
      'daily': [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'precipitation_probability_max',
        'wind_speed_10m_max',
      ].join(','),
      'forecast_days': '7',
      'timezone': 'auto',
    });

    try {
      var response = await http.get(uri).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final body = response.body;
        final data = WeatherData.fromOpenMeteo(
          jsonDecode(body) as Map<String, dynamic>,
        );
        await WeatherCacheService.save(body);
        return data;
      }
      // Bir kez yeniden dene (ağ gecikmesi / geçici hata)
      response = await http.get(uri).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final body = response.body;
        final data = WeatherData.fromOpenMeteo(
          jsonDecode(body) as Map<String, dynamic>,
        );
        await WeatherCacheService.save(body);
        return data;
      }
      throw Exception('Hava durumu alınamadı: ${response.statusCode}');
    } catch (e) {
      // İsteğe bağlı: OpenWeatherMap fallback (API key gerekir)
      rethrow;
    }
  }
}
