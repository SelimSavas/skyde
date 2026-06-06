import 'package:hive/hive.dart';
import '../models/daily_task.dart';
import '../models/weather_data.dart';
import '../models/user_preferences.dart';
import '../utils/decision_engine.dart';

class DailyTaskService {
  static const _boxName = 'daily_tasks';

  static Box<DailyTask> get _box => Hive.box<DailyTask>(_boxName);

  static Future<void> init() async {
    if (!Hive.isBoxOpen(_boxName)) {
      await Hive.openBox<DailyTask>(_boxName);
    }
    await _ensureDefaults();
    await _resetExpiredTasks();
  }

  static Future<void> _ensureDefaults() async {
    final box = _box;
    for (final t in DailyTaskDefaults.cityTasks) {
      if (!box.containsKey(t['id'])) {
        await box.put(
          t['id'],
          DailyTask(id: t['id']!, label: t['label']!, mode: 'city'),
        );
      }
    }
    for (final t in DailyTaskDefaults.farmerTasks) {
      if (!box.containsKey(t['id'])) {
        await box.put(
          t['id'],
          DailyTask(id: t['id']!, label: t['label']!, mode: 'farmer'),
        );
      }
    }
  }

  static Future<void> _resetExpiredTasks() async {
    final today = _todayStr();
    for (final task in _box.values) {
      if (task.isActive && !task.isPersistent && task.lastActiveDate != today) {
        task.isActive = false;
        task.lastActiveDate = null;
        await task.save();
      }
    }
  }

  static List<DailyTask> getTasksForMode(UserMode mode) {
    final modeStr = mode == UserMode.city ? 'city' : 'farmer';
    return _box.values.where((t) => t.mode == modeStr).toList();
  }

  static List<DailyTask> getActiveTasksForMode(UserMode mode) {
    return getTasksForMode(mode).where((t) => t.isActive).toList();
  }

  static Future<void> toggleTask(String id, bool active) async {
    final task = _box.get(id);
    if (task == null) return;
    task.isActive = active;
    task.lastActiveDate = active ? _todayStr() : null;
    await task.save();
  }

  static Future<void> togglePersistent(String id, bool persistent) async {
    final task = _box.get(id);
    if (task == null) return;
    task.isPersistent = persistent;
    await task.save();
  }

  static String _todayStr() {
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  // ── Görev-Hava Uyarı Eşleme ──────────────────────────────────────────────

  static List<String> generateTaskAlerts(
    List<DailyTask> activeTasks,
    WeatherData data,
    WeatherDecision decision,
    UserMode mode,
  ) {
    final alerts = <String>[];
    final msgType = data.messageType;
    final isRainy = msgType == WeatherMessageType.rain ||
        msgType == WeatherMessageType.heavyRain ||
        msgType == WeatherMessageType.drizzle;
    final isStormy = msgType == WeatherMessageType.thunderstorm ||
        msgType == WeatherMessageType.hail;

    for (final task in activeTasks) {
      final a = _alertForTask(task.id, data, decision, isRainy, isStormy);
      if (a != null) alerts.add(a);
    }
    return alerts;
  }

  static String? _alertForTask(
    String taskId,
    WeatherData data,
    WeatherDecision decision,
    bool isRainy,
    bool isStormy,
  ) {
    switch (taskId) {
      // ── Şehir görevleri ──
      case 'city_outdoor':
        if (isStormy)
          return '⚠️ Dışarı çıkma planını ertele; fırtına/dolu riski var.';
        if (isRainy)
          return '🌧️ Dışarı çıkacaksan şemsiye ve yağmurluk al; yollar ıslak olacak.';
        if (data.temperature >= 35)
          return '☀️ Dışarı çıkacaksan güneş kremi, şapka ve bol su al; kavurucu sıcak var.';
        if (data.isFrostRisk)
          return '🥶 Dışarı çıkacaksan kalın giyin; don ve buzlanma riski var.';
        return null;

      case 'city_driving':
        if (isStormy)
          return '⚠️ Araç kullanma; fırtına ve dolu araçlara ciddi hasar verebilir.';
        if (data.messageType == WeatherMessageType.freezingRain)
          return '🧊 Yollar buzlu; araç kullanmak çok tehlikeli. Mümkünse ertele.';
        if (data.messageType == WeatherMessageType.snow)
          return '❄️ Kar yağışı var; kış lastiği ve zincir kontrol et, yavaş git.';
        if (data.messageType == WeatherMessageType.foggy)
          return '🌫️ Sis var; sis farlarını aç, hızını düşür, mesafe bırak.';
        if (isRainy)
          return '🌧️ Yollar ıslak; frenleme mesafesi uzar, dikkatli sür.';
        return null;

      case 'city_sport':
        if (isStormy || isRainy)
          return '🏃 Açık hava sporu için uygun değil; kapalı alan tercih et.';
        if (data.temperature >= 33)
          return '🏃 Sıcakta spor tehlikeli; sabah erken veya akşam serinliğinde yap.';
        if (data.isFrostRisk)
          return '🏃 Soğukta spor yaparken kalın giyin ve ısınma hareketleri yap.';
        if (data.windSpeed >= 40)
          return '🏃 Kuvvetli rüzgarda açık hava sporu riskli; kapalı alan tercih et.';
        return null;

      case 'city_picnic':
        if (isStormy || isRainy)
          return '🧺 Piknik/etkinlik planını ertele veya kapalı mekana taşı; yağış var.';
        if (data.temperature >= 35)
          return '🧺 Piknik için gölgeli alan seç; güneş kremi ve bol su al.';
        if (data.windSpeed >= 35)
          return '🧺 Kuvvetli rüzgar var; piknik düzeni kurulumunda dikkat et.';
        return null;

      case 'city_meeting':
        if (isRainy || isStormy)
          return '💼 Toplantıya giderken şemsiye al; yolda gecikme olabilir.';
        if (data.messageType == WeatherMessageType.snow)
          return '💼 Kar yağışı trafiği yavaşlatabilir; erken çık.';
        return null;

      case 'city_work':
        if (isStormy) {
          return 'İşe gidişte fırtına riski var; mümkünse saati kaydır veya toplu taşıma düşün.';
        }
        if (isRainy) {
          return 'İşe giderken yağış bekleniyor; tampon süre ve yedek rota işini kolaylaştırır.';
        }
        if (data.messageType == WeatherMessageType.snow) {
          return 'Kar yağışı işe gidiş süresini uzatabilir; erken çık, güzergâhı netleştir.';
        }
        if (data.messageType == WeatherMessageType.foggy) {
          return 'Sis görüşü kısar; işe giderken hızını düşür, mesafe bırak.';
        }
        return null;

      case 'city_school':
        if (isStormy || isRainy) {
          return 'Okul veya servis saatinde yağış var; yedek kıyafet ve ayakkabı iyi hazırlık olur.';
        }
        if (data.temperature >= 35) {
          return 'Okul çıkışında sıcak baskısı için su ve şapka unutma.';
        }
        if (data.isFrostRisk) {
          return 'Sabah don etkisi olabilir; katmanlı giyin, servis beklemesini kısalt.';
        }
        return null;

      case 'city_shopping':
        if (isStormy) return '🛒 Alışverişi ertele; fırtına riski var.';
        if (isRainy) return '🛒 Şemsiyeni al ve kapalı otopark kullan.';
        return null;

      case 'city_kids':
        if (isStormy || isRainy)
          return '👧 Çocukları dışarı çıkarma; kapalı alan etkinlikleri planla.';
        if (data.temperature >= 35)
          return '👧 Çocukları öğle sıcağında dışarıda tutma; güneş kremi ve şapka şart.';
        if (data.isFrostRisk)
          return '👧 Çocukları kalın giydirip kısa süreli dışarı çıkar; yollar kaygan.';
        return null;

      case 'city_walk':
        if (isStormy)
          return '🚶 Yürüyüş/koşu planını iptal et; fırtına/dolu tehlikesi var.';
        if (isRainy)
          return '🚶 Su geçirmez ayakkabı ve yağmurluk giy; ıslak zeminlerde dikkat.';
        if (data.temperature >= 35)
          return '🚶 Sabah erken veya akşam serinliğinde yürü; öğle güneşinden kaçın.';
        return null;

      case 'city_guests':
        if (isRainy)
          return '🏠 Misafirler gelirken yolda yağış olabilir; kapalı otopark öner.';
        if (isStormy)
          return '🏠 Fırtına nedeniyle misafirlerin yolda dikkatli olmasını söyle.';
        return null;

      // ── Çiftçi görevleri ──
      case 'farmer_spray':
        if (!decision.canSpray) {
          if (data.windSpeed >= 15)
            return '🚫 İlaçlama yapma; rüzgar ${data.windSpeed.round()} km/s, ilaç sürüklenir.';
          if (isRainy)
            return '🚫 İlaçlama yapma; yağmur ilacı yıkar. Yağış bittikten sonra en az 4 saat bekle.';
          if (data.precipitationProbability >= 30)
            return '🚫 İlaçlama riskli; yağış ihtimali %${data.precipitationProbability.round()}.';
          return '🚫 İlaçlama için koşullar uygun değil; yarını bekle.';
        }
        return '✅ İlaçlama için koşullar uygun; rüzgar düşük, nem ideal. Sabah erkenden başla.';

      case 'farmer_irrigate':
        if (!decision.shouldIrrigate)
          return '💧 Sulama şu an gereksiz; toprak nemi yeterli veya yağış bekleniyor.';
        if (data.temperature >= 30)
          return '💧 Gündüz sulama yapma, su buharlaşır. Akşam serinliğinde sula.';
        return '💧 Sulama için uygun; akşam serinliğinde damla sulama tercih et.';

      case 'farmer_harvest':
        if (isRainy || isStormy)
          return '🌾 Hasat ertele; ürün ıslak olur ve kalite düşer. Yağış sonrası kurumasını bekle.';
        if (data.precipitationProbability >= 60)
          return '🌾 Bugün hasat et; yarın yağış ihtimali yüksek, gecikme risk.';
        if (data.humidity >= 80)
          return '🌾 Nem çok yüksek; hasat edilen ürün çürüyebilir, kurutma alanı hazırla.';
        return null;

      case 'farmer_fertilize':
        if (isRainy)
          return '🌿 Gübreleme yapma; yağmur gübreyi yıkar ve su kaynaklarını kirletir.';
        if (data.windSpeed >= 20)
          return '🌿 Rüzgarda gübreleme yapma; gübre uçar ve eşit dağılmaz.';
        if (data.precipitationProbability >= 50)
          return '🌿 Gübreleme riskli; yağış bekleniyor, gübre akar.';
        return null;

      case 'farmer_seedling':
        if (data.isFrostRisk)
          return '🌱 Fide dikimi yapma; don fideleri öldürür. Don riski geçene kadar bekle.';
        if (isStormy)
          return '🌱 Fide dikimi için uygun değil; fırtına fidelere zarar verir.';
        if (data.temperature >= 35)
          return '🌱 Sıcakta fide dikme; akşam serinliğinde veya sabah erken dik.';
        return null;

      case 'farmer_field':
        if (isStormy)
          return '🚜 Tarlaya çıkma; fırtına çok tehlikeli. Açık alanda yıldırım riski var.';
        if (data.messageType == WeatherMessageType.heavyRain)
          return '🚜 Tarlaya girme; toprak doymuş, ekipman saplanır ve toprak sıkışır.';
        if (isRainy)
          return '🚜 Toprak ıslak; ağır ekipmanla girme, toprak sıkışması olur.';
        return null;

      case 'farmer_animal':
        if (isStormy || data.messageType == WeatherMessageType.hail)
          return '🐄 Hayvanları hemen kapalı alana al; dolu ve fırtına çok tehlikeli.';
        if (data.temperature >= 35)
          return '🐄 Hayvanların su kaynağını kontrol et; gölgelik alan sağla.';
        if (data.isFrostRisk)
          return '🐄 Hayvanların su kaplarındaki buzu kır; kapalı alanı ısıt.';
        return null;

      case 'farmer_greenhouse':
        if (data.messageType == WeatherMessageType.hail)
          return '🏡 Sera camlarını kontrol et; dolu kırar. Mümkünse iç takviye yap.';
        if (data.windSpeed >= 40)
          return '🏡 Sera örtülerini ve klipsleri kontrol et; rüzgar koparabilir.';
        if (data.messageType == WeatherMessageType.snow)
          return '🏡 Sera çatısındaki kar birikimini temizle; çökme riski var.';
        if (data.isFrostRisk)
          return '🏡 Sera ısıtmasını kontrol et; iç sıcaklık 2°C altına düşmesin.';
        return null;

      case 'farmer_pruning':
        if (isRainy)
          return '✂️ Yağmurda budama yapma; kesim yerleri enfeksiyon kapabilir. Kuru hava bekle.';
        if (data.isFrostRisk)
          return '✂️ Don döneminde budama yapma; kesim yerleri donar ve dal ölür.';
        return null;

      case 'farmer_sowing':
        if (isRainy || data.messageType == WeatherMessageType.heavyRain)
          return '🌰 Tohum ekimi ertele; ıslak toprakta tohum çürür.';
        if (data.isFrostRisk)
          return '🌰 Don riski var; tohum ekimi için bekle, toprak sıcaklığı yetersiz.';
        if (data.temperature >= 35)
          return '🌰 Sıcakta ekim yapma; toprak çok kuru, çimlenme zor. Akşam serinliğinde ek.';
        return null;

      default:
        return null;
    }
  }

  static String taskAlertNotification(
    List<DailyTask> activeTasks,
    WeatherData data,
    WeatherDecision decision,
    UserMode mode,
  ) {
    final alerts = generateTaskAlerts(activeTasks, data, decision, mode);
    if (alerts.isEmpty) return '';
    return cleanLeadingDecor(alerts.first);
  }

  static String cleanLeadingDecor(String text) {
    return text.replaceFirst(RegExp(r'^[^A-Za-z0-9ÇĞİÖŞÜçğıöşü]+'), '').trim();
  }

  static String? rainWindowForScope(String scope, WeatherData data) {
    final now = DateTime.now();
    final List<HourlyEntry> source = switch (scope) {
      'today' =>
        data.todayHourly.where((h) => h.time.hour >= now.hour).toList(),
      'tomorrow' => data.tomorrowHourly,
      _ => const <HourlyEntry>[],
    };
    if (source.isEmpty) return null;

    final rainy = source
        .where((h) => h.precipitation > 0 || h.precipProbability >= 50)
        .map((h) => h.time)
        .toList();
    if (rainy.isEmpty) return null;
    return _formatHours(rainy);
  }

  static String? weeklyRainHint(WeatherData data) {
    final rainyDays =
        data.weeklyDaily.where((d) => d.precipProbMax >= 50).length;
    if (rainyDays == 0) return null;
    return 'Bu hafta $rainyDays gun yagis olasiligi yuksek.';
  }

  static String _formatHours(List<DateTime> times) {
    if (times.isEmpty) return '';
    times.sort();
    final blocks = <String>[];
    DateTime start = times.first;
    DateTime prev = times.first;

    for (var i = 1; i < times.length; i++) {
      final t = times[i];
      final isConsecutive = t.difference(prev).inHours == 1;
      if (!isConsecutive) {
        blocks.add(_blockLabel(start, prev));
        start = t;
      }
      prev = t;
    }
    blocks.add(_blockLabel(start, prev));
    return blocks.join(', ');
  }

  static String _blockLabel(DateTime start, DateTime end) {
    String hh(DateTime d) => '${d.hour.toString().padLeft(2, '0')}:00';
    if (start == end) return hh(start);
    return '${hh(start)}-${hh(end)}';
  }
}
