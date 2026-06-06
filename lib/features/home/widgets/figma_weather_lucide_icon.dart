import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';

import '../../../core/models/weather_data.dart';
import 'figma_layout.dart';

/// Figma / WeatherAssistant.tsx — Lucide çizgi ikonları (stroke 1.5 hissi, font tabanlı)
class FigmaWeatherLucideIcon extends StatelessWidget {
  final WeatherDisplayType type;
  final Color color;
  final bool isNight;
  final bool stormVisual;

  const FigmaWeatherLucideIcon({
    super.key,
    required this.type,
    required this.color,
    this.isNight = false,
    this.stormVisual = false,
  });

  IconData get _data {
    if (stormVisual) return LucideIcons.cloud_lightning;
    return switch (type) {
      WeatherDisplayType.sunny =>
        isNight ? LucideIcons.moon : LucideIcons.sun,
      WeatherDisplayType.cloudy => LucideIcons.cloud,
      WeatherDisplayType.rainy => LucideIcons.cloud_rain,
      WeatherDisplayType.snowy => LucideIcons.cloud_snow,
    };
  }

  @override
  Widget build(BuildContext context) {
    return Icon(
      _data,
      size: FigmaLayout.weatherIconSize,
      color: color,
      // Lucide font ikonları ince çizgi; optical center için hizalı
    );
  }
}
