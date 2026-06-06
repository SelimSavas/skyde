/// Görsel tema seçimi için 4 hava tipi
enum WeatherDisplayType { sunny, cloudy, rainy, snowy }

/// Mesaj üretimi için 14 detaylı hava tipi (WEATHER_MESSAGES.md referans)
enum WeatherMessageType {
  clear, partlyCloudy, cloudy, foggy,
  drizzle, rain, heavyRain, freezingRain,
  snow, thunderstorm, hail,
  extremeHeat, frost, windy,
}

/// Gün içi 4 zaman dilimi
enum TimeSlot { morning, afternoon, evening, night }

extension TimeSlotExt on TimeSlot {
  static TimeSlot fromHour(int hour) {
    if (hour >= 6 && hour < 12) return TimeSlot.morning;
    if (hour >= 12 && hour < 17) return TimeSlot.afternoon;
    if (hour >= 17 && hour < 21) return TimeSlot.evening;
    return TimeSlot.night;
  }
}

// ── Saatlik veri girişi ───────────────────────────────────────────────────────

class HourlyEntry {
  final DateTime time;
  final double temperature;
  final double precipitation;
  final int precipProbability;
  final int weatherCode;

  const HourlyEntry({
    required this.time,
    required this.temperature,
    required this.precipitation,
    required this.precipProbability,
    required this.weatherCode,
  });

  bool get isRainy =>
      precipitation > 0 ||
      (weatherCode >= 51 && weatherCode <= 82) ||
      precipProbability >= 40;

  bool get isAlert => precipProbability >= 60 || isRainy;
}

// ── Günlük veri girişi ────────────────────────────────────────────────────────

class DailyEntry {
  final DateTime date;
  final double tempMax;
  final double tempMin;
  final double precipSum;
  final int precipProbMax;
  final int weatherCode;
  final double windSpeedMax;

  const DailyEntry({
    required this.date,
    required this.tempMax,
    required this.tempMin,
    required this.precipSum,
    required this.precipProbMax,
    required this.weatherCode,
    required this.windSpeedMax,
  });

  WeatherDisplayType get displayType {
    if (tempMax <= 2 ||
        (weatherCode >= 71 && weatherCode <= 77) ||
        weatherCode == 85 ||
        weatherCode == 86) return WeatherDisplayType.snowy;
    if ((weatherCode >= 51 && weatherCode <= 82) || precipProbMax >= 60) {
      return WeatherDisplayType.rainy;
    }
    if (weatherCode >= 3) return WeatherDisplayType.cloudy;
    return WeatherDisplayType.sunny;
  }

  WeatherMessageType get messageType {
    if (weatherCode >= 96) return WeatherMessageType.hail;
    if (weatherCode == 95) return WeatherMessageType.thunderstorm;
    if (tempMin <= 2 && weatherCode < 71) return WeatherMessageType.frost;
    if (tempMax >= 35 && weatherCode <= 3) return WeatherMessageType.extremeHeat;
    if (windSpeedMax >= 40 && precipProbMax < 30 && weatherCode < 51) {
      return WeatherMessageType.windy;
    }
    if (weatherCode == 56 || weatherCode == 57 ||
        weatherCode == 66 || weatherCode == 67) return WeatherMessageType.freezingRain;
    if (weatherCode == 65 || (weatherCode >= 80 && weatherCode <= 82)) {
      return WeatherMessageType.heavyRain;
    }
    if (weatherCode >= 71 && weatherCode <= 77 ||
        weatherCode == 85 || weatherCode == 86) return WeatherMessageType.snow;
    if (weatherCode == 61 || weatherCode == 63) return WeatherMessageType.rain;
    if (weatherCode == 51 || weatherCode == 53 || weatherCode == 55) {
      return WeatherMessageType.drizzle;
    }
    if (weatherCode == 45 || weatherCode == 48) return WeatherMessageType.foggy;
    if (weatherCode == 3) return WeatherMessageType.cloudy;
    if (weatherCode == 1 || weatherCode == 2) return WeatherMessageType.partlyCloudy;
    return WeatherMessageType.clear;
  }

  String get description {
    if (weatherCode == 0) return 'Açık';
    if (weatherCode <= 3) return 'Parçalı bulutlu';
    if (weatherCode <= 48) return 'Sisli';
    if (weatherCode <= 55) return 'Çisenti';
    if (weatherCode <= 63) return 'Yağmurlu';
    if (weatherCode <= 65) return 'Şiddetli yağmur';
    if (weatherCode <= 67) return 'Dondurucu yağmur';
    if (weatherCode <= 75) return 'Karlı';
    if (weatherCode <= 77) return 'Kar taneleri';
    if (weatherCode <= 82) return 'Sağanak';
    if (weatherCode <= 86) return 'Kar sağanağı';
    if (weatherCode == 95) return 'Fırtına';
    return 'Dolu ile fırtına';
  }
}

// ── Ana model ─────────────────────────────────────────────────────────────────

class WeatherData {
  final double temperature;
  final double feelsLike;
  final double precipitation;
  final double precipitationProbability;
  final double windSpeed;
  final double windGusts;
  final double humidity;
  final double? soilMoisture;
  final int weatherCode;
  final bool isRainingNow;
  final bool isFrostRisk;
  final bool isHailRisk;
  final bool isStorm;
  final DateTime fetchedAt;

  /// Bugünün saatlik tahmini (mevcut saatten sonraki 24 saat)
  final List<HourlyEntry> todayHourly;

  /// Yarının saatlik tahmini
  final List<HourlyEntry> tomorrowHourly;

  /// 7 günlük günlük özet
  final List<DailyEntry> weeklyDaily;

  const WeatherData({
    required this.temperature,
    required this.feelsLike,
    required this.precipitation,
    required this.precipitationProbability,
    required this.windSpeed,
    required this.windGusts,
    required this.humidity,
    this.soilMoisture,
    required this.weatherCode,
    required this.isRainingNow,
    required this.isFrostRisk,
    required this.isHailRisk,
    required this.isStorm,
    required this.fetchedAt,
    this.todayHourly = const [],
    this.tomorrowHourly = const [],
    this.weeklyDaily = const [],
  });

  factory WeatherData.fromOpenMeteo(Map<String, dynamic> json) {
    final current = json['current'] as Map<String, dynamic>;
    final hourly  = json['hourly']  as Map<String, dynamic>?;
    final daily   = json['daily']   as Map<String, dynamic>?;

    final temp   = (current['temperature_2m']   as num).toDouble();
    final wind   = (current['wind_speed_10m']   as num).toDouble();
    final gusts  = (current['wind_gusts_10m']   as num? ?? wind).toDouble();
    final precip = (current['precipitation']    as num? ?? 0).toDouble();
    final rain   = (current['rain']             as num? ?? 0).toDouble();
    final humid  = (current['relative_humidity_2m'] as num? ?? 0).toDouble();
    final code   = (current['weather_code']     as num? ?? 0).toInt();

    // Sonraki 6 saatin yağış ihtimali ortalaması (mevcut başlık için)
    double precipProb = 0;
    if (hourly?['precipitation_probability'] != null) {
      final list = (hourly!['precipitation_probability'] as List)
          .take(6)
          .map((e) => (e as num? ?? 0).toDouble())
          .toList();
      if (list.isNotEmpty) precipProb = list.reduce((a, b) => a + b) / list.length;
    }

    // Toprak nemi — ilk saatin verisi
    final soilMoisture = hourly?['soil_moisture_0_to_1cm'] != null
        ? ((hourly!['soil_moisture_0_to_1cm'] as List).first as num? ?? 0)
            .toDouble()
        : null;

    final isRainingNow = precip > 0 ||
        rain > 0 ||
        (code >= 51 && code <= 67) ||
        (code >= 80 && code <= 82) ||
        (code >= 85 && code <= 86);

    // ── Saatlik forecast ayrıştır ─────────────────────────────────────────
    final now = DateTime.now();
    final todayDate = DateTime(now.year, now.month, now.day);
    final tomorrowDate = todayDate.add(const Duration(days: 1));

    final todayHourly   = <HourlyEntry>[];
    final tomorrowHourly = <HourlyEntry>[];

    if (hourly != null && hourly['time'] != null) {
      final times    = hourly['time']                    as List;
      final temps    = hourly['temperature_2m']          as List? ?? [];
      final probs    = hourly['precipitation_probability'] as List? ?? [];
      final precips  = hourly['precipitation']           as List? ?? [];
      final codes    = hourly['weather_code']            as List? ?? [];

      for (int i = 0; i < times.length; i++) {
        final t = DateTime.parse(times[i] as String);
        final entry = HourlyEntry(
          time:             t,
          temperature:      i < temps.length   ? (temps[i]   as num? ?? 0).toDouble() : 0,
          precipProbability: i < probs.length  ? (probs[i]   as num? ?? 0).toInt()    : 0,
          precipitation:    i < precips.length ? (precips[i] as num? ?? 0).toDouble() : 0,
          weatherCode:      i < codes.length   ? (codes[i]   as num? ?? 0).toInt()    : 0,
        );

        final day = DateTime(t.year, t.month, t.day);
        if (day == todayDate && t.isAfter(now.subtract(const Duration(hours: 1)))) {
          todayHourly.add(entry);
        } else if (day == tomorrowDate) {
          tomorrowHourly.add(entry);
        }
      }
    }

    // ── Günlük forecast ayrıştır ──────────────────────────────────────────
    final weeklyDaily = <DailyEntry>[];

    if (daily != null && daily['time'] != null) {
      final dTimes    = daily['time']                         as List;
      final dCodes    = daily['weather_code']                 as List? ?? [];
      final dMaxTemps = daily['temperature_2m_max']           as List? ?? [];
      final dMinTemps = daily['temperature_2m_min']           as List? ?? [];
      final dPrecips  = daily['precipitation_sum']            as List? ?? [];
      final dProbs    = daily['precipitation_probability_max'] as List? ?? [];
      final dWinds    = daily['wind_speed_10m_max']           as List? ?? [];

      for (int i = 0; i < dTimes.length; i++) {
        weeklyDaily.add(DailyEntry(
          date:         DateTime.parse(dTimes[i] as String),
          tempMax:      i < dMaxTemps.length ? (dMaxTemps[i] as num? ?? 0).toDouble() : 0,
          tempMin:      i < dMinTemps.length ? (dMinTemps[i] as num? ?? 0).toDouble() : 0,
          precipSum:    i < dPrecips.length  ? (dPrecips[i]  as num? ?? 0).toDouble() : 0,
          precipProbMax: i < dProbs.length   ? (dProbs[i]    as num? ?? 0).toInt()    : 0,
          weatherCode:  i < dCodes.length    ? (dCodes[i]    as num? ?? 0).toInt()    : 0,
          windSpeedMax: i < dWinds.length    ? (dWinds[i]    as num? ?? 0).toDouble() : 0,
        ));
      }
    }

    return WeatherData(
      temperature:             temp,
      feelsLike:               (current['apparent_temperature'] as num? ?? temp).toDouble(),
      precipitation:           precip,
      precipitationProbability: precipProb,
      windSpeed:               wind,
      windGusts:               gusts,
      humidity:                humid,
      soilMoisture:            soilMoisture,
      weatherCode:             code,
      isRainingNow:            isRainingNow,
      isFrostRisk:             temp <= 2.0,
      isHailRisk:              code >= 96,
      isStorm:                 code >= 95,
      fetchedAt:               DateTime.now(),
      todayHourly:             todayHourly,
      tomorrowHourly:          tomorrowHourly,
      weeklyDaily:             weeklyDaily,
    );
  }

  WeatherDisplayType get weatherType {
    if (temperature <= 0 ||
        (weatherCode >= 71 && weatherCode <= 77) ||
        weatherCode == 85 ||
        weatherCode == 86) return WeatherDisplayType.snowy;
    if (isRainingNow || weatherCode >= 51 || precipitationProbability >= 60) {
      return WeatherDisplayType.rainy;
    }
    if (weatherCode >= 3) return WeatherDisplayType.cloudy;
    return WeatherDisplayType.sunny;
  }

  WeatherMessageType get messageType {
    if (isHailRisk) return WeatherMessageType.hail;
    if (isStorm) return WeatherMessageType.thunderstorm;
    if (isFrostRisk && weatherCode < 71) return WeatherMessageType.frost;
    if (temperature >= 35 && weatherCode <= 3) return WeatherMessageType.extremeHeat;
    if (windSpeed >= 40 && !isRainingNow && weatherCode < 51) {
      return WeatherMessageType.windy;
    }
    if (weatherCode == 56 || weatherCode == 57 ||
        weatherCode == 66 || weatherCode == 67) return WeatherMessageType.freezingRain;
    if (weatherCode == 65 || (weatherCode >= 80 && weatherCode <= 82)) {
      return WeatherMessageType.heavyRain;
    }
    if ((weatherCode >= 71 && weatherCode <= 77) ||
        weatherCode == 85 || weatherCode == 86) return WeatherMessageType.snow;
    if (weatherCode == 61 || weatherCode == 63) return WeatherMessageType.rain;
    if (weatherCode == 51 || weatherCode == 53 || weatherCode == 55) {
      return WeatherMessageType.drizzle;
    }
    if (weatherCode == 45 || weatherCode == 48) return WeatherMessageType.foggy;
    if (weatherCode == 3) return WeatherMessageType.cloudy;
    if (weatherCode == 1 || weatherCode == 2) return WeatherMessageType.partlyCloudy;
    return WeatherMessageType.clear;
  }

  String get weatherDescription {
    if (weatherCode == 0) return 'Açık hava';
    if (weatherCode <= 3) return 'Parçalı bulutlu';
    if (weatherCode <= 48) return 'Sisli';
    if (weatherCode <= 55) return 'Çisenti';
    if (weatherCode <= 57) return 'Dondurucu çisenti';
    if (weatherCode <= 63) return 'Yağmurlu';
    if (weatherCode <= 65) return 'Şiddetli yağmur';
    if (weatherCode <= 67) return 'Dondurucu yağmur';
    if (weatherCode <= 75) return 'Karlı';
    if (weatherCode <= 77) return 'Kar taneleri';
    if (weatherCode <= 82) return 'Sağanak yağışlı';
    if (weatherCode <= 86) return 'Kar sağanağı';
    if (weatherCode == 95) return 'Gök gürültülü fırtına';
    return 'Dolu ile fırtına';
  }
}
