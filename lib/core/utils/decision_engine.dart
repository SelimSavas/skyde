import '../models/weather_data.dart';

class WeatherDecision {
  final bool shouldIrrigate;
  final bool canSpray;
  final bool hasCriticalAlert;   // don / dolu / fırtına
  final List<String> alertKeys;  // lokalizasyon anahtarları

  const WeatherDecision({
    required this.shouldIrrigate,
    required this.canSpray,
    required this.hasCriticalAlert,
    required this.alertKeys,
  });
}

class DecisionEngine {
  static WeatherDecision evaluate(WeatherData data) {
    final alerts = <String>[];

    // Kritik uyarılar
    if (data.isFrostRisk) alerts.add('frostWarning');
    if (data.isHailRisk) alerts.add('hailWarning');
    if (data.isStorm) alerts.add('stormWarning');

    // Yağış uyarıları
    if (data.isRainingNow) alerts.add('rainExpected');
    if (data.windSpeed >= 30 || data.windGusts >= 50) alerts.add('windyDay');

    if (alerts.isEmpty) alerts.add('noRainToday');

    // Sulama: şu an yağıyor, %40+ ihtimal veya toprak nemli
    final irrigationNotNeeded = data.isRainingNow ||
        data.precipitationProbability >= 40 ||
        (data.soilMoisture != null && data.soilMoisture! >= 0.3);

    // İlaçlama: rüzgar hafif, yağmur yok, fırtına yok
    final canSpray = !data.isRainingNow &&
        data.windSpeed < 15 &&
        data.precipitationProbability < 30 &&
        !data.isStorm;

    return WeatherDecision(
      shouldIrrigate: !irrigationNotNeeded,
      canSpray: canSpray,
      hasCriticalAlert: data.isFrostRisk || data.isHailRisk || data.isStorm,
      alertKeys: alerts,
    );
  }

  /// Kıyafet / şemsiye önerisi (şehir modu)
  static String clothingKey(WeatherData data) {
    if (data.isRainingNow || data.precipitationProbability >= 50) {
      return 'umbrellaNeeded';
    } else if (data.temperature < 10) {
      return 'heavyCoatNeeded';
    } else if (data.temperature < 18) {
      return 'lightJacketNeeded';
    }
    return 'noRainToday';
  }
}
