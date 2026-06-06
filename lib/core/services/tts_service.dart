import 'package:flutter_tts/flutter_tts.dart';

class TtsService {
  static final FlutterTts _tts = FlutterTts();
  static bool _initialized = false;

  static Future<void> _init() async {
    if (_initialized) return;

    await _tts.setLanguage('tr-TR');
    // 0.5: Daha doğal hız
    await _tts.setSpeechRate(0.5);
    await _tts.setVolume(1.0);
    await _tts.setPitch(1.0);

    _initialized = true;
  }

  static Future<void> speak(String text) async {
    await _init();
    await _tts.stop();
    await _tts.speak(text);
  }

  static Future<void> stop() async {
    await _tts.stop();
  }

  /// Ana ekran özeti oluştur
  static String buildSummary({
    required String name,
    required String weatherDesc,
    required double temperature,
    required bool isRaining,
    required double precipProb,
    required double windSpeed,
    required String statusText,
    required bool isFarmerMode,
    required bool shouldIrrigate,
    required bool canSpray,
  }) {
    final buffer = StringBuffer();
    buffer.write('Merhaba $name. ');
    buffer.write('$weatherDesc. ');
    buffer.write('Sıcaklık ${temperature.round()} derece. ');

    if (isRaining) {
      buffer.write('Şu an yağmur yağıyor. ');
    } else if (precipProb >= 50) {
      buffer.write('Yağış ihtimali yüzde ${precipProb.round()}. ');
    } else {
      buffer.write('Yağış beklenmıyor. ');
    }

    if (windSpeed >= 30) {
      buffer.write('Rüzgar kuvvetli, ${windSpeed.round()} kilometre. ');
    }

    buffer.write('Durum: $statusText. ');

    if (isFarmerMode) {
      buffer.write(shouldIrrigate ? 'Sulama yapabilirsin. ' : 'Bugün sulama gerekmez. ');
      buffer.write(canSpray ? 'İlaçlama için uygun. ' : 'İlaçlama için uygun değil. ');
    }

    return buffer.toString();
  }
}
