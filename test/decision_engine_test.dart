import 'package:flutter_test/flutter_test.dart';
import 'package:yagmurvarmi/core/models/weather_data.dart';
import 'package:yagmurvarmi/core/utils/decision_engine.dart';

WeatherData _sample({
  double temp = 20,
  double wind = 5,
  double precipProb = 10,
  bool raining = false,
  bool frost = false,
  bool hail = false,
  bool storm = false,
  double? soilMoisture,
}) {
  return WeatherData(
    temperature: temp,
    feelsLike: temp,
    precipitation: raining ? 2 : 0,
    precipitationProbability: precipProb,
    windSpeed: wind,
    windGusts: wind,
    humidity: 50,
    soilMoisture: soilMoisture,
    weatherCode: raining ? 61 : 0,
    isRainingNow: raining,
    isFrostRisk: frost,
    isHailRisk: hail,
    isStorm: storm,
    fetchedAt: DateTime.now(),
  );
}

void main() {
  test('frost triggers critical alert', () {
    final d = DecisionEngine.evaluate(_sample(frost: true));
    expect(d.hasCriticalAlert, isTrue);
    expect(d.alertKeys, contains('frostWarning'));
  });

  test('rain blocks spraying', () {
    final d = DecisionEngine.evaluate(_sample(raining: true, wind: 5));
    expect(d.canSpray, isFalse);
  });

  test('calm dry weather allows spraying', () {
    final d = DecisionEngine.evaluate(_sample(wind: 8, precipProb: 10));
    expect(d.canSpray, isTrue);
  });

  test('high soil moisture skips irrigation', () {
    final d = DecisionEngine.evaluate(_sample(soilMoisture: 0.35));
    expect(d.shouldIrrigate, isFalse);
  });

  test('clothingKey suggests umbrella when raining', () {
    final key = DecisionEngine.clothingKey(_sample(raining: true));
    expect(key, 'umbrellaNeeded');
  });
}
