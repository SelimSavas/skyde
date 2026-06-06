import 'package:flutter/material.dart';
import '../models/weather_data.dart';
import '../models/user_preferences.dart';

// ── Stat veri yapısı ──────────────────────────────────────────────────────────

enum StatIconType { thermometer, droplets, wind, cloudRain, layers }

class StatData {
  final String label;
  final String value;
  final StatIconType iconType;
  const StatData(this.label, this.value, this.iconType);
}

// ── Tema yapısı (Figma: tasarım_revize / WeatherAssistant.tsx) ───────────────

class WeatherTheme {
  final LinearGradient gradient;
  final Color textColor;
  final Color subtitleColor;
  final Color iconColor;
  /// Vurgu çubuğu, takvim ikon zemin, chip noktası (Figma accentColor)
  final Color accentColor;
  final Color glassColor;
  final Color glassText;
  final Color glassStroke;
  final bool isDark;

  const WeatherTheme({
    required this.gradient,
    required this.textColor,
    required this.subtitleColor,
    required this.iconColor,
    required this.accentColor,
    required this.glassColor,
    required this.glassText,
    required this.glassStroke,
    required this.isDark,
  });

  static WeatherTheme of(WeatherDisplayType type, UserMode mode) =>
      _themes[mode]![type]!;

  /// Figma revize: şehir modunda gökyüzü tipi + fırtına / açık gökyüzü varyantları.
  static WeatherTheme forHome({
    required WeatherData data,
    required WeatherDisplayType displayType,
    required UserMode mode,
    int tabIndex = 0,
  }) {
    if (mode == UserMode.farmer) {
      return of(displayType, mode);
    }
    if (isStormVisual(data, tabIndex)) {
      return _cityStorm;
    }
    if (displayType == WeatherDisplayType.sunny) {
      final msg = _messageTypeForTab(data, tabIndex);
      if (msg == WeatherMessageType.clear ||
          msg == WeatherMessageType.partlyCloudy) {
        return _cityClearSky;
      }
    }
    return of(displayType, UserMode.city);
  }

  static WeatherMessageType _messageTypeForTab(WeatherData data, int tabIndex) {
    switch (tabIndex) {
      case 1:
        return data.weeklyDaily.length > 1
            ? data.weeklyDaily[1].messageType
            : data.messageType;
      case 2:
        return data.messageType;
      default:
        return data.messageType;
    }
  }

  /// Sekme + günlük veriye göre fırtına görseli (mor gradient).
  static bool isStormVisual(WeatherData data, int tabIndex) {
    switch (tabIndex) {
      case 0:
        return data.messageType == WeatherMessageType.thunderstorm;
      case 1:
        return data.weeklyDaily.length > 1 &&
            data.weeklyDaily[1].messageType ==
                WeatherMessageType.thunderstorm;
      case 2:
        return data.weeklyDaily
            .any((d) => d.messageType == WeatherMessageType.thunderstorm);
      default:
        return false;
    }
  }

  /// Sekmeye göre arka plan / ikon tipi: 0=Bugün, 1=Yarın, 2=Haftalık
  static WeatherDisplayType displayTypeForTab(int tabIndex, WeatherData data) {
    switch (tabIndex) {
      case 1:
        if (data.weeklyDaily.length > 1) return data.weeklyDaily[1].displayType;
        return data.weatherType;
      case 2:
        if (data.weeklyDaily.isEmpty) return data.weatherType;
        final days = data.weeklyDaily;
        final rainy =
            days.where((d) => d.displayType == WeatherDisplayType.rainy).length;
        final snowy =
            days.where((d) => d.displayType == WeatherDisplayType.snowy).length;
        if (snowy > 0) return WeatherDisplayType.snowy;
        if (rainy > 0) return WeatherDisplayType.rainy;
        final cloudy =
            days.where((d) => d.displayType == WeatherDisplayType.cloudy).length;
        if (cloudy > 0) return WeatherDisplayType.cloudy;
        return WeatherDisplayType.sunny;
      default:
        return data.weatherType;
    }
  }

  static List<StatData> stats(
    WeatherDisplayType type,
    UserMode mode,
    WeatherData data,
  ) {
    final StatData fourthStat;

    if ((type == WeatherDisplayType.rainy || type == WeatherDisplayType.snowy) &&
        data.precipitation > 0.1) {
      fourthStat = StatData(
        'Yağış',
        '${data.precipitation.toStringAsFixed(1)}mm',
        StatIconType.cloudRain,
      );
    } else if (type == WeatherDisplayType.snowy) {
      fourthStat = StatData(
        'Hissedilen',
        '${data.feelsLike.round()}°C',
        StatIconType.thermometer,
      );
    } else if (mode == UserMode.farmer && data.soilMoisture != null) {
      final pct = (data.soilMoisture! * 100).round();
      fourthStat = StatData('Toprak', '%$pct', StatIconType.layers);
    } else if (data.windGusts > data.windSpeed + 12) {
      fourthStat = StatData(
        'Güst',
        '${data.windGusts.round()} km/s',
        StatIconType.wind,
      );
    } else {
      fourthStat = StatData(
        'Yağış İht.',
        '%${data.precipitationProbability.round()}',
        StatIconType.cloudRain,
      );
    }

    return [
      StatData('Sıcaklık', '${data.temperature.round()}°C', StatIconType.thermometer),
      StatData('Nem', '%${data.humidity.round()}', StatIconType.droplets),
      StatData('Rüzgar', '${data.windSpeed.round()} km/s', StatIconType.wind),
      fourthStat,
    ];
  }

  /// Şehir · Bugün: sıcaklık + his + nem + yağış iht. (günlük karar için özet)
  static List<StatData> statsCityFourToday(WeatherData data) => [
        StatData(
          'Sıcaklık',
          '${data.temperature.round()}°C',
          StatIconType.thermometer,
        ),
        StatData(
          'Hissedilen',
          '${data.feelsLike.round()}°C',
          StatIconType.thermometer,
        ),
        StatData('Nem', '%${data.humidity.round()}', StatIconType.droplets),
        StatData(
          'Yağış İht.',
          '%${data.precipitationProbability.round()}',
          StatIconType.cloudRain,
        ),
      ];

  /// Şehir modu — 4 metrik / sekme:
  /// - Bugün: anlık özet (sıcaklık, his, nem, yağış iht.)
  /// - Yarın: yarınki günlük paket (max/min, yağış, rüzgar)
  /// - Haftalık: hafta max/min, yağışlı gün sayısı, don riski
  static List<StatData> statsCityFourForTab(WeatherData data, int tabIndex) {
    switch (tabIndex) {
      case 1:
        if (data.weeklyDaily.length > 1) {
          final d = data.weeklyDaily[1];
          return [
            StatData(
              'Yarın Max',
              '${d.tempMax.round()}°C',
              StatIconType.thermometer,
            ),
            StatData(
              'Yarın Min',
              '${d.tempMin.round()}°C',
              StatIconType.thermometer,
            ),
            StatData(
              'Yağış İht.',
              '%${d.precipProbMax}',
              StatIconType.cloudRain,
            ),
            StatData(
              'Rüzgar',
              '${d.windSpeedMax.round()} km/s',
              StatIconType.wind,
            ),
          ];
        }
        return statsCityFourToday(data);
      case 2:
        if (data.weeklyDaily.isEmpty) return statsCityFourToday(data);
        final days = data.weeklyDaily;
        final maxT = days.map((d) => d.tempMax).reduce((a, b) => a > b ? a : b);
        final minT = days.map((d) => d.tempMin).reduce((a, b) => a < b ? a : b);
        final rain = days.where((d) => d.precipProbMax >= 50).length;
        final frost = days.where((d) => d.tempMin <= 0).length;
        return [
          StatData('Hafta Max', '${maxT.round()}°C', StatIconType.thermometer),
          StatData('Hafta Min', '${minT.round()}°C', StatIconType.thermometer),
          StatData('Yağışlı Gün', '$rain gün', StatIconType.cloudRain),
          StatData(
            'Don Riski',
            frost > 0 ? '$frost gün' : 'Yok',
            StatIconType.layers,
          ),
        ];
      default:
        return statsCityFourToday(data);
    }
  }
}

// ── Şehir: Figma (amber/slate/gray/cyan gökyüzü + fırtına + clear) ───────────

/// from-indigo-900 via-purple-800 to-slate-900 + purple-500 accent
const _cityStorm = WeatherTheme(
  gradient: LinearGradient(
    colors: [
      Color(0xFF312E81),
      Color(0xFF6B21A8),
      Color(0xFF0F172A),
    ],
    stops: [0.0, 0.45, 1.0],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  ),
  textColor: Color(0xFFFFFFFF),
  subtitleColor: Color(0xFFE9D5FF),
  iconColor: Color(0xFFE9D5FF),
  accentColor: Color(0xFFA855F7),
  glassColor: Color(0x1AFFFFFF),
  glassText: Color(0xFFFFFFFF),
  glassStroke: Color(0x33FFFFFF),
  isDark: true,
);

/// from-sky-400 via-blue-400 to-cyan-400 + sky-300 accent
const _cityClearSky = WeatherTheme(
  gradient: LinearGradient(
    colors: [
      Color(0xFF38BDF8),
      Color(0xFF60A5FA),
      Color(0xFF22D3EE),
    ],
    stops: [0.0, 0.5, 1.0],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  ),
  textColor: Color(0xFFFFFFFF),
  subtitleColor: Color(0xFFE0F2FE),
  iconColor: Color(0xFFE0F2FE),
  accentColor: Color(0xFF7DD3FC),
  glassColor: Color(0x33FFFFFF),
  glassText: Color(0xFFFFFFFF),
  glassStroke: Color(0x33FFFFFF),
  isDark: false,
);

// ── Tema renk tablosu ─────────────────────────────────────────────────────────

final _themes = <UserMode, Map<WeatherDisplayType, WeatherTheme>>{
  UserMode.city: {
    /// from-amber-400 via-orange-400 to-yellow-500
    WeatherDisplayType.sunny: const WeatherTheme(
      gradient: LinearGradient(
        colors: [
          Color(0xFFFBBF24),
          Color(0xFFFB923C),
          Color(0xFFEAB308),
        ],
        stops: [0.0, 0.5, 1.0],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      textColor: Color(0xFFFFFFFF),
      subtitleColor: Color(0xFFFFF7ED),
      iconColor: Color(0xFFFEF9C3),
      accentColor: Color(0xFFFACC15),
      glassColor: Color(0x33FFFFFF),
      glassText: Color(0xFFFFFFFF),
      glassStroke: Color(0x33FFFFFF),
      isDark: false,
    ),
    /// from-gray-500 via-gray-400 to-gray-600
    WeatherDisplayType.cloudy: const WeatherTheme(
      gradient: LinearGradient(
        colors: [
          Color(0xFF6B7280),
          Color(0xFF9CA3AF),
          Color(0xFF4B5563),
        ],
        stops: [0.0, 0.45, 1.0],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      textColor: Color(0xFFFFFFFF),
      subtitleColor: Color(0xFFE5E7EB),
      iconColor: Color(0xFFF3F4F6),
      accentColor: Color(0xFFD1D5DB),
      glassColor: Color(0x26FFFFFF),
      glassText: Color(0xFFFFFFFF),
      glassStroke: Color(0x33FFFFFF),
      isDark: true,
    ),
    /// from-slate-700 via-slate-600 to-slate-800
    WeatherDisplayType.rainy: const WeatherTheme(
      gradient: LinearGradient(
        colors: [
          Color(0xFF334155),
          Color(0xFF475569),
          Color(0xFF1E293B),
        ],
        stops: [0.0, 0.5, 1.0],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      textColor: Color(0xFFFFFFFF),
      subtitleColor: Color(0xFFBFDBFE),
      iconColor: Color(0xFFBFDBFE),
      accentColor: Color(0xFF60A5FA),
      glassColor: Color(0x1AFFFFFF),
      glassText: Color(0xFFFFFFFF),
      glassStroke: Color(0x33FFFFFF),
      isDark: true,
    ),
    /// from-blue-300 via-cyan-200 to-blue-400 — text slate-800
    WeatherDisplayType.snowy: const WeatherTheme(
      gradient: LinearGradient(
        colors: [
          Color(0xFF93C5FD),
          Color(0xFFA5F3FC),
          Color(0xFF60A5FA),
        ],
        stops: [0.0, 0.5, 1.0],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      textColor: Color(0xFF1E293B),
      subtitleColor: Color(0xFF334155),
      iconColor: Color(0xFF2563EB),
      accentColor: Color(0xFF67E8F9),
      glassColor: Color(0x4DFFFFFF),
      glassText: Color(0xFF1E293B),
      glassStroke: Color(0x8CFFFFFF),
      isDark: false,
    ),
  },
  UserMode.farmer: {
    WeatherDisplayType.sunny: const WeatherTheme(
      gradient: LinearGradient(
        colors: [Color(0xFFF9A825), Color(0xFFFFB300), Color(0xFF66BB6A)],
        stops: [0.0, 0.4, 1.0],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      textColor: Color(0xFF1B3A1F),
      subtitleColor: Color(0xFF2E7D32),
      iconColor: Color(0xFFBF360C),
      accentColor: Color(0xFFF57C00),
      glassColor: Color(0x33FFFFFF),
      glassText: Color(0xFF1B3A1F),
      glassStroke: Color(0x66FFFFFF),
      isDark: false,
    ),
    WeatherDisplayType.cloudy: const WeatherTheme(
      gradient: LinearGradient(
        colors: [Color(0xFF8D6E63), Color(0xFFBCAAA4), Color(0xFFEEEEEE)],
        stops: [0.0, 0.5, 1.0],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      textColor: Color(0xFF3E2723),
      subtitleColor: Color(0xFF5D4037),
      iconColor: Color(0xFF6D4C41),
      accentColor: Color(0xFF8D6E63),
      glassColor: Color(0x52FFFFFF),
      glassText: Color(0xFF3E2723),
      glassStroke: Color(0x8CFFFFFF),
      isDark: false,
    ),
    WeatherDisplayType.rainy: const WeatherTheme(
      gradient: LinearGradient(
        colors: [Color(0xFF0D1F26), Color(0xFF1C3138), Color(0xFF2E7D32)],
        stops: [0.0, 0.5, 1.0],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      textColor: Color(0xFFFFFFFF),
      subtitleColor: Color(0xFF80CBC4),
      iconColor: Color(0xFF4DB6AC),
      accentColor: Color(0xFF26A69A),
      glassColor: Color(0x14FFFFFF),
      glassText: Color(0xFFFFFFFF),
      glassStroke: Color(0x29FFFFFF),
      isDark: true,
    ),
    WeatherDisplayType.snowy: const WeatherTheme(
      gradient: LinearGradient(
        colors: [Color(0xFF6ECFDA), Color(0xFFB2EBF2), Color(0xFF1A237E)],
        stops: [0.0, 0.4, 1.0],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      textColor: Color(0xFFE8EAF6),
      subtitleColor: Color(0xFFC5CAE9),
      iconColor: Color(0xFF7986CB),
      accentColor: Color(0xFF9FA8DA),
      glassColor: Color(0x24FFFFFF),
      glassText: Color(0xFFE8EAF6),
      glassStroke: Color(0x40FFFFFF),
      isDark: true,
    ),
  },
};
