import '../models/daily_task.dart';
import '../models/weather_data.dart';
import '../models/user_preferences.dart';
import '../utils/decision_engine.dart';
import 'daily_task_service.dart';

/// Kullanıcıya dönük tüm metinler: yaklaşık %70 zeki/net, %20 hafif mizah,
/// %10 sıcak “sen” dili. Aşırı ciddi, şakacı veya robotik olmamalı.
/// Ayrıntı: [MESSAGE_TONE.md](../../MESSAGE_TONE.md)
class WeatherMessageService {
  WeatherMessageService._();

  // ── Bugün: Başlık ──────────────────────────────────────────────────────────

  static String headline(
    WeatherMessageType type,
    UserMode mode,
    TimeSlot slot,
    WeatherData data,
    WeatherDecision decision, {
    List<HourlyEntry> todayHourly = const [],
  }) {
    final rainDetail = _rainWindowDetails(todayHourly);
    // Saatlik veride önümüzdeki saatlerde yağış penceresi varsa başlıkta önce onu kullan.
    // (Şu an gökyüzü "bulutlu" olsa bile yarın öğlene yağış bekleniyorsa üst metin
    // "Bugünün özeti" ile çelişmesin.)
    if (rainDetail != null) {
      return _rainHeadline(rainDetail, mode, isTomorrow: false);
    }
    if (mode == UserMode.farmer) {
      return _farmerHeadline(type, slot, data, decision);
    }
    return _cityHeadline(type, slot, data);
  }

  // ── Bugün: Alt Yazı ────────────────────────────────────────────────────────

  static String subtitle(
    WeatherMessageType type,
    UserMode mode,
    TimeSlot slot,
    WeatherData data,
    WeatherDecision decision, {
    List<HourlyEntry> todayHourly = const [],
  }) {
    final temp = data.temperature.round();
    final wind = data.windSpeed.round();
    if (mode == UserMode.farmer) {
      final rainDetail = _rainWindowDetails(todayHourly);
      if (rainDetail != null && !data.isRainingNow) {
        return _farmerSubtitleWhenRainForecast(
            type, slot, data, decision, temp, wind, rainDetail);
      }
      return _farmerSubtitle(type, slot, data, decision, temp, wind);
    }
    final rainDetail = _rainWindowDetails(todayHourly);
    if (rainDetail != null && data.isRainingNow) {
      return _citySubtitle(WeatherMessageType.rain, slot, data, temp);
    }
    if (rainDetail != null && !data.isRainingNow) {
      return _citySubtitleWhenRainForecast(slot, data, temp, rainDetail);
    }
    return _citySubtitle(type, slot, data, temp);
  }

  // ── Bugün: Önemli Notlar ───────────────────────────────────────────────────

  static String importantNotes(
    WeatherMessageType type,
    UserMode mode,
    TimeSlot slot,
    WeatherData data,
    WeatherDecision decision, {
    String? rainSummary,
  }) {
    final notes = mode == UserMode.farmer
        ? _farmerNotes(type, slot, data, decision)
        : _cityNotes(type, slot, data);
    if (rainSummary != null) return '$notes $rainSummary';
    return notes;
  }

  // ── Bugün: Günün Tamamının Özeti ─────────────────────────────────────────────

  static String todaySummary(
    WeatherData data,
    UserMode mode,
    WeatherDecision decision,
  ) {
    final buf = StringBuffer();
    final todayDaily = data.weeklyDaily.isNotEmpty ? data.weeklyDaily[0] : null;
    final hours = data.todayHourly;

    final maxT = todayDaily?.tempMax.round() ?? data.temperature.round();
    final minT = todayDaily?.tempMin.round() ?? data.temperature.round();
    final precipProb =
        todayDaily?.precipProbMax ?? data.precipitationProbability.round();
    final windMax = todayDaily?.windSpeedMax.round() ?? data.windSpeed.round();

    buf.write(
        'Bugün sıcaklık $minT° ile $maxT° arasında gidip gelecek; kabaca böyle düşünebilirsin. ');

    final rainWindow = _rainWindowFromHourly(hours);
    if (rainWindow != null) {
      buf.write('$rainWindow saatlerinde yağış ihtimali öne çıkıyor. ');
    } else if (precipProb >= 50) {
      buf.write('Gün içinde yağış ihtimali %$precipProb; takvimine göre not al. ');
    } else {
      buf.write('Şimdilik yağış için alarm çalmıyor; gün kuru geçebilir. ');
    }

    if (data.isStorm || (todayDaily != null && todayDaily.weatherCode >= 95)) {
      buf.write('Fırtına uyarısı var; açık alanlardan uzak dur. ');
    }
    if (data.isHailRisk ||
        (todayDaily != null && todayDaily.weatherCode >= 96)) {
      buf.write('Dolu riski var; araçları ve hassas eşyaları koru. ');
    }
    if (data.isFrostRisk || (todayDaily != null && todayDaily.tempMin <= 2)) {
      buf.write('Don riski var; sabah yollarda buzlanma olabilir. ');
    }
    if (windMax >= 40) {
      buf.write('Kuvvetli rüzgar bekleniyor ($windMax km/s). ');
    }

    if (mode == UserMode.farmer) {
      if (decision.canSpray && rainWindow == null && precipProb < 30) {
        final goodSlots = <String>[];
        final morningHours =
            hours.where((h) => h.time.hour >= 6 && h.time.hour < 12).toList();
        final eveningHours =
            hours.where((h) => h.time.hour >= 17 && h.time.hour < 21).toList();
        if (morningHours.isNotEmpty &&
            morningHours.every((h) => h.precipProbability < 30)) {
          goodSlots.add('sabah (06:00–12:00)');
        }
        if (eveningHours.isNotEmpty &&
            eveningHours.every((h) => h.precipProbability < 30)) {
          goodSlots.add('akşam (17:00–21:00)');
        }
        if (goodSlots.isNotEmpty) {
          buf.write('İlaçlama için uygun saatler: ${goodSlots.join(" ve ")}. ');
        } else {
          buf.write('İlaçlama için koşullar uygun; rüzgarı kontrol et. ');
        }
      } else if (rainWindow != null || precipProb >= 30) {
        buf.write('İlaçlama yapma; yağış ihtimali veya rüzgar uygun değil. ');
      }
      if (decision.shouldIrrigate) {
        buf.write('Toprak nemi düşük; akşam serinliğinde sulama yap. ');
      } else if (data.isRainingNow || precipProb >= 60) {
        buf.write('Sulama gereksiz; yağış toprak nemini artırıyor. ');
      }
    } else {
      if (rainWindow != null) {
        buf.write('Şemsiyeni yanına almayı unutma. ');
      }
      if (maxT >= 33) {
        buf.write(
            'Öğle saatlerinde sıcak olacak; güneş kremi ve bol su unutma. ');
      }
      if (minT <= 5) {
        buf.write('Sabah ve akşam soğuk olacak; kalın giyin. ');
      }
    }

    return buf.toString().trim();
  }

  // ── Yarın: Başlık ──────────────────────────────────────────────────────────

  static String tomorrowHeadline(
    DailyEntry d,
    UserMode mode,
    List<HourlyEntry> hours,
  ) {
    final rainDetail = _rainWindowDetails(hours);
    if (rainDetail != null) {
      return _rainHeadline(rainDetail, mode, isTomorrow: true);
    }
    final t = d.messageType;
    if (mode == UserMode.farmer) return _tomorrowFarmerHeadline(t, d);
    return _tomorrowCityHeadline(t, d);
  }

  // ── Yarın: Önemli Notlar ───────────────────────────────────────────────────

  static String tomorrowNotes(
    DailyEntry d,
    UserMode mode,
    List<HourlyEntry> hours,
  ) {
    final t = d.messageType;
    if (mode == UserMode.farmer) return _tomorrowFarmerNotes(t, d, hours);
    return _tomorrowCityNotes(t, d, hours);
  }

  // ── Yarın: Alt Yazı ────────────────────────────────────────────────────────

  static String tomorrowSubtitle(DailyEntry d, UserMode mode) {
    final min = d.tempMin.round();
    final max = d.tempMax.round();
    if (mode == UserMode.farmer) {
      if (d.precipProbMax >= 60)
        return 'En yüksek $max°, en düşük $min°. İlaçlama yapma, yağışa göre planla.';
      if (d.tempMin <= 2)
        return 'En yüksek $max°, en düşük $min°. Don riski var; hassas fideleri koru.';
      if (d.windSpeedMax > 40)
        return 'En yüksek $max°, en düşük $min°. Kuvvetli rüzgar bekleniyor.';
      return 'En yüksek $max°, en düşük $min°. Yağış ihtimali %${d.precipProbMax}.';
    }
    return 'En yüksek $max°, en düşük $min°. ${d.description}.';
  }

  // ── Haftalık: Başlık ───────────────────────────────────────────────────────

  static String weeklyHeadline(List<DailyEntry> days, UserMode mode) {
    if (days.isEmpty) return 'Bu haftanın hava durumu';
    final rainDays = days.where((d) => d.precipProbMax >= 50).length;
    final frostDays = days.where((d) => d.tempMin <= 2).length;
    final hasSevere = days.any((d) => d.weatherCode >= 95);
    final maxT = days.map((d) => d.tempMax).reduce((a, b) => a > b ? a : b);

    if (hasSevere) {
      return mode == UserMode.farmer
          ? 'Bu hafta hava biraz huysuz; önce güvenlik: koruma ve hasat için acele edilmesi gerekenleri öne al.'
          : 'Bu hafta hava sertleşebiliyor; panik yok ama uyarıları ciddiye al, küçük hazırlık büyük iş görür.';
    }
    if (maxT >= 35) {
      return mode == UserMode.farmer
          ? 'Bu hafta sıcaklık ${maxT.round()}°C\'ye kadar çıkıyor; öğleyi kısa tut, işi sabah ve akşama yay.'
          : 'Bu hafta ${maxT.round()}°C civarı görünüyor; su ve gölge planını şimdiden koy, öğleyle kavga etme.';
    }
    if (frostDays > 0) {
      return mode == UserMode.farmer
          ? 'Bu hafta $frostDays gün don riski var; hassas ürünleri koru, sabah sulama yapma.'
          : 'Bu hafta $frostDays gün don riski var; sabahları buzlanmaya dikkat et, kalın giyin.';
    }
    if (rainDays >= 4) {
      return mode == UserMode.farmer
          ? 'Bu hafta yağışlı gün sayısı fazla; tarla için pencere dar, yağışsız günleri iyi kullan.'
          : 'Bu hafta şemsiye sık düşecek; dışarı planını yağışa göre esnet, güneşli aralıkları değerlendir.';
    }
    if (rainDays >= 1) {
      return mode == UserMode.farmer
          ? 'Bu hafta $rainDays gün yağış ihtimali var; yağışsız günleri ilaçlama ve tarla işleri için değerlendir.'
          : 'Bu hafta $rainDays gün yağış ihtimali var; o günlerde şemsiyeni yanında tut, diğer günler daha ferah.';
    }
    return mode == UserMode.farmer
        ? 'Bu hafta tarla için genel olarak sakin bir tablo var; planını net tut, gerektiğinde küçük düzeltmeler yeter.'
        : 'Bu hafta hava çoğunlukla uyumlu; yağış yok denecek kadar az, planını rahat kurabilirsin.';
  }

  // ── Haftalık: Alt Yazı ─────────────────────────────────────────────────────

  static String weeklySubtitle(List<DailyEntry> days) {
    if (days.isEmpty) return '7 günlük tahmin birazdan burada.';
    final maxT = days.map((d) => d.tempMax).reduce((a, b) => a > b ? a : b);
    final minT = days.map((d) => d.tempMin).reduce((a, b) => a < b ? a : b);
    return 'Haftalık tablo: ${minT.round()}° ile ${maxT.round()}° arasında gidip geliyor; uç değerlere göre giyinmeyi ayarla.';
  }

  // ── Haftalık: Özet Metin ───────────────────────────────────────────────────

  static String weeklyNotes(List<DailyEntry> days, UserMode mode) {
    if (days.isEmpty) return '';
    final dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    final rainDays = days.where((d) => d.precipProbMax >= 50).length;
    final frostDays = days.where((d) => d.tempMin <= 2).length;
    final maxT = days.map((d) => d.tempMax).reduce((a, b) => a > b ? a : b);
    final minT = days.map((d) => d.tempMin).reduce((a, b) => a < b ? a : b);

    final buf = StringBuffer();
    buf.write(
        'Bu hafta sıcaklık ${minT.round()}°C ile ${maxT.round()}°C arasında oynuyor; kabaca böyle düşün. ');

    if (rainDays == 0) {
      buf.write(
          'Yağış tarafı şimdilik sakin; dışarı ve hafif işler için hafta genel olarak uyumlu görünüyor. ');
    } else if (rainDays <= 2) {
      buf.write(
          '$rainDays günde yağış ihtimali var; o günlerde şemsiyeyi çantaya at, geri kalanı daha rahat. ');
    } else {
      buf.write(
          '$rainDays gün yağışlı veya yağış ihtimali yüksek; planı birkaç parçaya bölmek işini kolaylaştırır. ');
    }
    if (frostDays > 0) {
      buf.write(
          '$frostDays günde don riski var; sabah yollarda buzlanmaya ve soğuğa dikkat et. ');
    }

    if (mode == UserMode.farmer) {
      final goodDays = days
          .where((d) => d.precipProbMax < 30 && d.windSpeedMax < 30)
          .toList();
      if (goodDays.isNotEmpty) {
        final names =
            goodDays.map((d) => dayNames[d.date.weekday - 1]).join(', ');
        buf.write('İlaçlama ve sulama için en uygun günler: $names. ');
      }
      final fDays = days.where((d) => d.tempMin <= 2).toList();
      if (fDays.isNotEmpty) {
        final names = fDays.map((d) => dayNames[d.date.weekday - 1]).join(', ');
        buf.write(
            'Don riski olan günler: $names. Hassas fideleri koru, sabah sulama yapma. ');
      }
      final heavyRainDays = days.where((d) => d.precipSum > 15).toList();
      if (heavyRainDays.isNotEmpty) {
        final names =
            heavyRainDays.map((d) => dayNames[d.date.weekday - 1]).join(', ');
        buf.write(
            'Yoğun yağış günleri: $names. Tarlaya girme, drenajı kontrol et. ');
      }
      final windDays = days.where((d) => d.windSpeedMax > 40).toList();
      if (windDays.isNotEmpty) {
        final names =
            windDays.map((d) => dayNames[d.date.weekday - 1]).join(', ');
        buf.write(
            'Kuvvetli rüzgar günleri: $names. İlaçlama yapma, ekipmanları sabitle. ');
      }
      if (goodDays.isEmpty &&
          heavyRainDays.isEmpty &&
          windDays.isEmpty &&
          fDays.isEmpty) {
        buf.write(
            'Hafta genel olarak sıradan bir tablo; rutin işleri yap, abartıya gerek yok.');
      }
    } else {
      if (rainDays >= 4) {
        buf.write(
            'Yağışlı günlerde kapalı mekan veya kısa süreli dışarı; güneşli aralıkları yürüyüş için sakla.');
      } else if (rainDays == 0) {
        buf.write(
            'Dışarı çıkmak için hafta genel olarak elverişli; yine de su ve şapka alışkanlığını bozma.');
      } else {
        buf.write('Yağışsız günleri dışarı ve uzun yürüyüş için öne çekmek mantıklı.');
      }
    }
    return buf.toString();
  }

  // ── Bildirim Metinleri ─────────────────────────────────────────────────────

  static String notificationText(
    WeatherMessageType type,
    UserMode mode,
    WeatherData data, {
    String? rainTime,
  }) {
    if (mode == UserMode.farmer) {
      return switch (type) {
        WeatherMessageType.thunderstorm =>
            'Hava huysuz: tarlada işi bırak, ekipmanı güvene al.',
        WeatherMessageType.hail =>
            'Dolu geliyor; ürünü ve örtüyü şimdi düşün, sonra pişmanlık olmasın.',
        WeatherMessageType.frost =>
            'Don kapıda; fideleri ört, sabah sulamayı ertele.',
        WeatherMessageType.heavyRain =>
            'Yağış sert; drenaja bak, ıslak tarlaya girmeyi unut.',
        WeatherMessageType.extremeHeat =>
            'Sıcak baskın; öğleyi tarlada geçirme, suyu unutma.',
        WeatherMessageType.freezingRain =>
            'Dondurucu yağmur; bitkiyi ve kendini koru, acele et.',
        _ => rainTime != null
            ? '$rainTime civarında yağış var; ilaçlama için uygun değil.'
            : 'Kısa özet: ${data.weatherDescription}.',
      };
    }
    return switch (type) {
      WeatherMessageType.thunderstorm =>
          'Fırtına var; dışarı çıkma, pencereyi kapat, acele yok.',
      WeatherMessageType.hail => 'Dolu riski; arabayı kapalı yere, seni sağa al.',
      WeatherMessageType.frost =>
          'Sabah buz ihtimali; yavaş git, kalın giyin.',
      WeatherMessageType.heavyRain =>
          'Şiddetli yağış; alt geçit ve su birikintisine uzak dur.',
      WeatherMessageType.extremeHeat =>
          'Sıcak baskıyor; su ve gölge planını şimdi yap.',
      WeatherMessageType.freezingRain =>
          'Yollar kaygan; zorunlu değilse dışarı çıkma.',
      _ => rainTime != null
          ? '$rainTime civarında yağmur; şemsiye hazır olsun.'
          : 'Özet: ${data.weatherDescription}.',
    };
  }

  // ── Görev Bazlı Başlık ──────────────────────────────────────────────────────

  static String taskAwareHeadline(
    WeatherMessageType type,
    UserMode mode,
    TimeSlot slot,
    WeatherData data,
    WeatherDecision decision,
    List<DailyTask> activeTasks, {
    List<HourlyEntry> todayHourly = const [],
  }) {
    if (activeTasks.isEmpty) {
      return headline(type, mode, slot, data, decision,
          todayHourly: todayHourly);
    }

    final alerts =
        DailyTaskService.generateTaskAlerts(activeTasks, data, decision, mode);
    if (alerts.isEmpty) {
      final base =
          headline(type, mode, slot, data, decision, todayHourly: todayHourly);
      final taskNames =
          activeTasks.map((t) => t.label.toLowerCase()).take(2).join(' ve ');
      return '$base Seçtiğin $taskNames için şimdilik hava yoluna girmiş görünüyor.';
    }

    final topAlert = DailyTaskService.cleanLeadingDecor(alerts.first);
    return topAlert;
  }

  // ── Görev Bazlı Bildirim ──────────────────────────────────────────────────

  static String taskAwareNotification(
    WeatherMessageType type,
    UserMode mode,
    WeatherData data,
    WeatherDecision decision,
    List<DailyTask> activeTasks, {
    String? rainTime,
  }) {
    if (activeTasks.isEmpty) {
      return notificationText(type, mode, data, rainTime: rainTime);
    }
    final alerts =
        DailyTaskService.generateTaskAlerts(activeTasks, data, decision, mode);
    if (alerts.isNotEmpty) {
      return DailyTaskService.cleanLeadingDecor(alerts.first);
    }
    return notificationText(type, mode, data, rainTime: rainTime);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  P R I V A T E   H E L P E R S
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Yağış aralığı ──────────────────────────────────────────────────────────

  /// Saatlik tahmine göre yağışlı saatlerin ilk/son anı ve metin aralığı.
  static ({String range, DateTime first, DateTime last})? _rainWindowDetails(
      List<HourlyEntry> hours) {
    if (hours.isEmpty) return null;
    final now = DateTime.now();
    final future = hours.where((h) => h.time.isAfter(now)).toList();
    final rainHours = future
        .where((h) => h.precipitation > 0 || h.precipProbability >= 50)
        .toList();
    if (rainHours.isEmpty) return null;
    final times = rainHours.map((h) => h.time).toList()..sort();
    final range = formatHours(times);
    return (range: range, first: times.first, last: times.last);
  }

  static String? _rainWindowFromHourly(List<HourlyEntry> hours) {
    return _rainWindowDetails(hours)?.range;
  }

  static String _rainHeadline(
      ({String range, DateTime first, DateTime last}) detail,
      UserMode mode,
      {required bool isTomorrow}) {
    final window = detail.range;
    final now = DateTime.now();
    final day = isTomorrow ? 'Yarın' : 'Bugün';
    final isSingle = !window.contains('–') && !window.contains(',');
    final endStr =
        '${detail.last.hour.toString().padLeft(2, '0')}:00';

    // Henüz yağış başlamadan önce: önce günün sonuna kadar süreyi söyle, sonra aralığı.
    if (!isSingle && now.isBefore(detail.first)) {
      if (mode == UserMode.farmer) {
        return '$day $endStr\'ye kadar yağışlı periyotlar var; $window aralığında yoğunlaşır. '
            'Sulama ve ilaçlama saatini buna göre sıkılaştır.';
      }
      return '$day $endStr\'ye kadar yağmur bekleniyor; $window aralığında başlayıp etkili olabilir. '
          'Şemsiye ve yağmurluk hazır olsun, yollar ıslak olabilir.';
    }

    if (mode == UserMode.farmer) {
      final verb =
          isSingle ? 'saat $window civarında' : '$window saatleri arasında';
      return '$day $verb yağış var; sulama ve ilaçlama saatini buna göre sıkılaştır.';
    }
    if (isSingle) {
      return '$day $window civarında kısa bir yağmur ihtimali var; şemsiye yanında dursun, ıslanmamaya çalış.';
    }
    return '$day $window aralığında yağmur bekleniyor; şemsiye ve yağmurluk hazır olsun, yollar ıslak olabilir.';
  }

  /// Saatleri insan okunur formata çevirir: 14:00, 14:00–17:00, 09:00–11:00, 14:00
  static String formatHours(List<DateTime> times) {
    if (times.isEmpty) return '';
    if (times.length == 1)
      return '${times.first.hour.toString().padLeft(2, '0')}:00';
    final blocks = <List<DateTime>>[];
    var current = [times.first];
    for (int i = 1; i < times.length; i++) {
      if (times[i].difference(times[i - 1]).inHours == 1) {
        current.add(times[i]);
      } else {
        blocks.add(current);
        current = [times[i]];
      }
    }
    blocks.add(current);
    return blocks.map((b) {
      if (b.length == 1) return '${b.first.hour.toString().padLeft(2, '0')}:00';
      return '${b.first.hour.toString().padLeft(2, '0')}:00–${b.last.hour.toString().padLeft(2, '0')}:00';
    }).join(', ');
  }

  // ── Şehir Modu: Bugün Başlık ──────────────────────────────────────────────

  static String _cityHeadline(
      WeatherMessageType type, TimeSlot slot, WeatherData data) {
    return switch (type) {
      WeatherMessageType.clear => switch (slot) {
          TimeSlot.morning =>
            'Güneş erken çıkmış; kahveyi dışarıda içmek için küçük bir bahane var.',
          TimeSlot.afternoon =>
            'Öğleden sonra gökyüzü açık; gözlük ve şapka yanına gelsin, güneş ciddi.',
          TimeSlot.evening =>
            'Akşam serin ve sakin; kısa bir yürüyüş veya bankta oturmak için iyi bir zaman.',
          TimeSlot.night =>
            'Gece sakin; uyku için pencereyi hafif aralarsan hava tazelenir, fazla soğuk değilse tabii.',
        },
      WeatherMessageType.partlyCloudy => switch (slot) {
          TimeSlot.morning =>
            'Sabah parçalı bulutlu ama sıcak; hafif bir mont veya hırka yeterli olacak.',
          TimeSlot.afternoon =>
            'Öğleden sonra bulutlar arasından güneş açıyor; dışarı planların için sorun yok.',
          TimeSlot.evening =>
            'Akşam parçalı bulutlu ve serin; yürüyüş veya açık hava etkinlikleri için uygun.',
          TimeSlot.night =>
            'Gece parçalı bulutlu ve sakin; yağış beklenmiyor, rahatça dinlenebilirsin.',
        },
      WeatherMessageType.cloudy => switch (slot) {
          TimeSlot.morning =>
            'Sabah gökyüzü kapalı ama yağış beklenmiyor; ince bir ceket veya mont al.',
          TimeSlot.afternoon =>
            'Öğleden sonra bulutlu; güneş çıkması zor görünüyor ama yağış ihtimali düşük.',
          TimeSlot.evening =>
            'Akşam kapalı ve serin; dışarı çıkacaksan üstüne bir şey al.',
          TimeSlot.night =>
            'Gece boyunca kapalı hava devam edecek; yağış beklenmiyor.',
        },
      WeatherMessageType.foggy => switch (slot) {
          TimeSlot.morning =>
            'Sabah yoğun sis var; araç kullanıyorsan sis farlarını aç ve yavaş git.',
          TimeSlot.afternoon =>
            'Öğleden sonra sis dağılıyor; görüş mesafesi artıyor ama yolda dikkatli ol.',
          TimeSlot.evening =>
            'Akşam hafif pus var; yürürken ve araç kullanırken görüş mesafesine dikkat et.',
          TimeSlot.night =>
            'Gece boyunca sis ve pus etkili; dışarıda hareket edeceksen çok dikkatli ol.',
        },
      WeatherMessageType.drizzle => switch (slot) {
          TimeSlot.morning =>
            'Sabah hafif çisenti var; şemsiye veya kapüşonlu bir mont al, fazla ıslanmazsın ama hazırlıklı ol.',
          TimeSlot.afternoon =>
            'Öğleden sonra çisenti devam ediyor; kısa işler için dışarı çıkabilirsin ama şemsiyeni yanında tut.',
          TimeSlot.evening =>
            'Akşam hafif çisenti var; yürüyüşe çıkacaksan su geçirmez bir ceket iyi olur.',
          TimeSlot.night =>
            'Gece hafif çisenti devam edecek; dışarıda bıraktığın eşyaları içeri al.',
        },
      WeatherMessageType.rain => switch (slot) {
          TimeSlot.morning =>
            'Sabah yağmur yağıyor; şemsiyeni ve su geçirmez ayakkabılarını al, yolda dikkatli ol.',
          TimeSlot.afternoon =>
            'Öğleden sonra yağmur devam ediyor; dışarı zorunlu işler için çık, şemsiyeni unutma.',
          TimeSlot.evening =>
            'Bu akşam yağmur var; dışarı çıkacaksan yağmurluğunu giy ve ıslak yollara dikkat et.',
          TimeSlot.night =>
            'Gece boyunca yağmur devam edecek; araç kullanacaksan görüş mesafesine dikkat et.',
        },
      WeatherMessageType.heavyRain => switch (slot) {
          TimeSlot.morning =>
            'Sabah şiddetli yağmur var; zorunlu olmadıkça dışarı çıkma, sel ve su baskını riskine dikkat et.',
          TimeSlot.afternoon =>
            'Öğleden sonra sağanak devam ediyor; alt geçitlerden ve dere yataklarından uzak dur.',
          TimeSlot.evening =>
            'Bu akşam şiddetli yağmur bekleniyor; dışarıdaki eşyalarını içeri al, pencerelerini kapat.',
          TimeSlot.night =>
            'Gece boyunca sağanak devam edecek; araç kullanma, sel riski var.',
        },
      WeatherMessageType.freezingRain => switch (slot) {
          TimeSlot.morning =>
            'Sabah dondurucu yağmur var; yollar ve kaldırımlar buz tutmuş olabilir, çok dikkatli yürü.',
          TimeSlot.afternoon =>
            'Öğleden sonra dondurucu yağmur etkili; araç kullanma, yollar çok kaygan.',
          TimeSlot.evening =>
            'Bu akşam dondurucu yağmur bekleniyor; dışarı çıkmaktan kaçın, yollar çok tehlikeli.',
          TimeSlot.night =>
            'Gece dondurucu yağmur devam edecek; sabah yollar buz olacak, erken çıkacaksan çok dikkat et.',
        },
      WeatherMessageType.snow => switch (slot) {
          TimeSlot.morning =>
            'Sabah kar yağıyor; kalın giyin, kaymaz ayakkabı giy ve yollara dikkat et.',
          TimeSlot.afternoon =>
            'Öğleden sonra kar devam ediyor; araç kullanacaksan kış lastiği ve zincir kontrol et.',
          TimeSlot.evening =>
            'Bu akşam kar yağışı var; dışarıda kalmaktan kaçın, yollar kaygan.',
          TimeSlot.night =>
            'Gece boyunca kar bekleniyor; sabah yollar kaplı olacak, erken çık veya evde kal.',
        },
      WeatherMessageType.thunderstorm => switch (slot) {
          TimeSlot.morning =>
            'Sabah gök gürültülü fırtına bekleniyor; zorunlu olmadıkça dışarı çıkma.',
          TimeSlot.afternoon =>
            'Öğleden sonra fırtına etkili; açık alanlardan, ağaçlardan ve metal yapılardan uzak dur.',
          TimeSlot.evening =>
            'Bu akşam fırtına var; pencere ve kapıları kapat, dışarıda eşya bırakma.',
          TimeSlot.night =>
            'Gece fırtına devam edecek; elektrik kesintisine hazır ol, el feneri hazırla.',
        },
      WeatherMessageType.hail => switch (slot) {
          TimeSlot.morning =>
            'Sabah dolu riski var; aracını kapalı yere al, dışarıda durma.',
          TimeSlot.afternoon =>
            'Öğleden sonra dolu bekleniyor; dışarı çıkma, araçları ve eşyaları koru.',
          TimeSlot.evening =>
            'Bu akşam dolu riski var; pencere ve balkon kapılarını kapat, aracını kapalı yere al.',
          TimeSlot.night =>
            'Gece dolu bekleniyor; araç dışarıdaysa üzerini kalın bir örtüyle ört.',
        },
      WeatherMessageType.extremeHeat => switch (slot) {
          TimeSlot.morning =>
            'Sabah bile sıcak başlıyor; bol su iç ve güne erken başla, öğlen molası ver.',
          TimeSlot.afternoon =>
            'Öğleden sonra kavurucu sıcak; 12:00–16:00 arası doğrudan güneş altında kalma.',
          TimeSlot.evening =>
            'Bu akşam sıcaklık biraz düşse de bunaltıcı; bol su iç ve serinle.',
          TimeSlot.night =>
            'Gece bile sıcak kalabilir; uyku için odayı havalandır, klima varsa abartmadan kullan.',
        },
      WeatherMessageType.frost => switch (slot) {
          TimeSlot.morning =>
            'Sabah don ve buzlanma riski var; yollarda çok dikkatli ol, adımlarını kısa at.',
          TimeSlot.afternoon =>
            'Öğleye doğru don etkisi azalıyor ama gölgeli bölgelerde hâlâ buzlanma olabilir.',
          TimeSlot.evening =>
            'Bu akşam hava hızla soğuyor; dışarıda kalmaktan kaçın, kalın giyin.',
          TimeSlot.night =>
            'Gece boyunca don bekleniyor; dış muslukları kapat, boruları dona karşı koru.',
        },
      WeatherMessageType.windy => switch (slot) {
          TimeSlot.morning =>
            'Sabah kuvvetli rüzgar var; şapka ve hafif eşyalara dikkat et, kapıları tutarak aç.',
          TimeSlot.afternoon =>
            'Öğleden sonra rüzgar şiddetleniyor; dışarıda reklam panoları ve uçucu eşyalara dikkat.',
          TimeSlot.evening =>
            'Bu akşam rüzgar etkili; balkon ve bahçedeki eşyaları sabitle veya içeri al.',
          TimeSlot.night =>
            'Gece kuvvetli rüzgar devam edecek; pencere ve kapıların sıkıca kapalı olduğundan emin ol.',
        },
    };
  }

  // ── Çiftçi Modu: Bugün Başlık ─────────────────────────────────────────────

  static String _farmerHeadline(WeatherMessageType type, TimeSlot slot,
      WeatherData data, WeatherDecision decision) {
    return switch (type) {
      WeatherMessageType.clear => switch (slot) {
          TimeSlot.morning =>
            'Sabah güneşli ve rüzgar hafif; ilaçlama ve tarla işleri için en verimli saatler başlıyor.',
          TimeSlot.afternoon =>
            'Öğleden sonra güneş etkili; toprak nemi düşüyorsa akşam serinliğinde sulamayı planla.',
          TimeSlot.evening =>
            'Akşam sakin ve serin; sulama, gözlem ve hafif tarla bakımı için uygun.',
          TimeSlot.night =>
            'Gece boyunca hava açık ve sakin; sabah erken ilaçlama veya sulama planlayabilirsin.',
        },
      WeatherMessageType.partlyCloudy => switch (slot) {
          TimeSlot.morning =>
            'Sabah parçalı bulutlu; ilaçlama koşulları uygun, rüzgar kontrol edildikten sonra başlanabilir.',
          TimeSlot.afternoon =>
            'Öğleden sonra bulutlu ama yağışsız; tarla gözlemi ve bakım işleri için uygun.',
          TimeSlot.evening =>
            'Akşam sakin; sulama ve hafif tarla işleri yapılabilir.',
          TimeSlot.night =>
            'Gece boyunca yağış beklenmiyor; sabah ilaçlama planlanabilir.',
        },
      WeatherMessageType.cloudy => switch (slot) {
          TimeSlot.morning =>
            'Sabah bulutlu ama yağışsız; ilaçlama yapılabilir, rüzgarı kontrol et.',
          TimeSlot.afternoon =>
            'Öğleden sonra kapalı hava; buharlaşma düşük, sulama yapacaksan erteleyebilirsin.',
          TimeSlot.evening =>
            'Akşam bulutlu ve serin; toprak nemi kontrol edilip gerekirse sulama yapılabilir.',
          TimeSlot.night =>
            'Gece boyunca yağış beklenmiyor; sabah erken tarla işlerine çıkılabilir.',
        },
      WeatherMessageType.foggy => switch (slot) {
          TimeSlot.morning =>
            'Sabah yoğun sis var; ilaçlama yapma, nem çok yüksek ve ilacın etkisi azalır.',
          TimeSlot.afternoon =>
            'Öğleye doğru sis açılıyor; açıldıktan sonra ilaçlama yapılabilir.',
          TimeSlot.evening =>
            'Akşam hafif pus var; ilaçlama için uygun değil, sulama yapılabilir.',
          TimeSlot.night =>
            'Gece boyunca yoğun nem ve sis var; tarla işleri sabaha bırakılmalı.',
        },
      WeatherMessageType.drizzle => switch (slot) {
          TimeSlot.morning =>
            'Sabah çisenti var; ilaçlama yapma, ilacı yağmur yıkar. Sulama da gereksiz.',
          TimeSlot.afternoon =>
            'Öğleden sonra çisenti devam ediyor; tarla işlerini ertele, toprak ıslanıyor.',
          TimeSlot.evening =>
            'Akşam hafif çisenti; toprak nem alıyor, sulama yapma. Drenajı kontrol et.',
          TimeSlot.night =>
            'Gece çisenti devam edecek; sabah toprak nemini kontrol edip planlama yap.',
        },
      WeatherMessageType.rain => switch (slot) {
          TimeSlot.morning =>
            'Sabah yağmur yağıyor; bugün ilaçlama ve gübreleme yapma, yağış sonrasını bekle.',
          TimeSlot.afternoon =>
            'Öğleden sonra yağmur devam ediyor; tarla işlerini ertele, drenajı kontrol et.',
          TimeSlot.evening =>
            'Akşam yağmur var; sulama yapma, toprak zaten nem alıyor. Drenaj kanallarını kontrol et.',
          TimeSlot.night =>
            'Gece yağmur devam edecek; sabah toprak durumunu değerlendir, ıslaksa tarlaya girme.',
        },
      WeatherMessageType.heavyRain => switch (slot) {
          TimeSlot.morning =>
            'Sabah şiddetli yağmur; tüm tarla işlerini iptal et, ekipmanları kapalı yere al.',
          TimeSlot.afternoon =>
            'Sağanak devam ediyor; drenaj kanallarını ve set yapılarını kontrol et, taşma riski var.',
          TimeSlot.evening =>
            'Akşam şiddetli yağış; tarlada su birikmesi kontrolü yap, hayvanları kapalı alanlara al.',
          TimeSlot.night =>
            'Gece boyunca sağanak sürecek; sabah sel hasarını kontrol et.',
        },
      WeatherMessageType.freezingRain => switch (slot) {
          TimeSlot.morning =>
            'Sabah dondurucu yağmur; tüm tarla işlerini iptal et, meyve ağaçları ve fideler ciddi risk altında.',
          TimeSlot.afternoon =>
            'Öğleden sonra donma devam ediyor; sera ve örtü altı yapıları kontrol et, çökme riski var.',
          TimeSlot.evening =>
            'Akşam dondurucu yağmur etkili; bitkileri acil olarak örtü ile koru.',
          TimeSlot.night =>
            'Gece boyunca buz tabakası oluşacak; dallar kırılabilir, örtüleri kontrol et.',
        },
      WeatherMessageType.snow => switch (slot) {
          TimeSlot.morning =>
            'Sabah kar yağıyor; tüm tarla işlerini iptal et, sera ve örtüleri kontrol et.',
          TimeSlot.afternoon =>
            'Öğleden sonra kar devam ediyor; sera çatılarındaki kar birikimini temizle, çökme riski var.',
          TimeSlot.evening =>
            'Akşam kar etkili; hayvanları kapalı alanlara al, su borularını dona karşı koru.',
          TimeSlot.night =>
            'Gece boyunca kar ve don; seraları ısıt, hassas ürünleri acil olarak örtü altına al.',
        },
      WeatherMessageType.thunderstorm => switch (slot) {
          TimeSlot.morning =>
            'Sabah fırtına bekleniyor; tüm tarla işlerini iptal et, ekipmanları bağla ve içeri al.',
          TimeSlot.afternoon =>
            'Fırtına devam ediyor; tarlaya kesinlikle çıkma, hayvanları kapalı alana al.',
          TimeSlot.evening =>
            'Akşam fırtına etkili; sera ve örtüleri kontrol et, uçma ve hasar riski var.',
          TimeSlot.night =>
            'Gece fırtına sürecek; sabah hasar tespiti yap, kırık dalları ve devrilenleri kontrol et.',
        },
      WeatherMessageType.hail => switch (slot) {
          TimeSlot.morning =>
            'Sabah dolu riski var; ürünleri acil olarak dolu filesi veya örtü ile koru.',
          TimeSlot.afternoon =>
            'Öğleden sonra dolu bekleniyor; hasat edilecek ürünler varsa hemen topla, koruma önlemlerini al.',
          TimeSlot.evening =>
            'Akşam dolu riski; sera camlarını ve örtü altı yapılarını kontrol et.',
          TimeSlot.night =>
            'Gece dolu bekleniyor; tüm koruma önlemlerinin alındığından emin ol.',
        },
      WeatherMessageType.extremeHeat => switch (slot) {
          TimeSlot.morning =>
            'Sabah erkenden tarla işlerine başla; sıcak yükselmeden önce bitirmek önemli.',
          TimeSlot.afternoon =>
            'Öğle sıcağında kesinlikle tarlada çalışma; güneş çarpması riski çok yüksek.',
          TimeSlot.evening =>
            'Akşam serinliğinde sulama yap; gündüz sulaması suyun buharlaşmasına neden olur.',
          TimeSlot.night =>
            'Gece sulaması için en uygun zaman; buharlaşma en düşük seviyede.',
        },
      WeatherMessageType.frost => switch (slot) {
          TimeSlot.morning =>
            'Sabah don var; hassas fideleri ve genç ürünleri acil olarak örtü ile koru.',
          TimeSlot.afternoon =>
            'Don etkisi azalıyor; örtüleri güneş çıkınca havalandır ama akşam yine kapat.',
          TimeSlot.evening =>
            'Bu akşam sıcaklık sıfırın altına düşecek; tüm koruma önlemlerini şimdi al.',
          TimeSlot.night =>
            'Gece boyunca don etkili; sera ısıtmalarını çalıştır, sulama borularını koru.',
        },
      WeatherMessageType.windy => switch (slot) {
          TimeSlot.morning =>
            'Sabah kuvvetli rüzgar var; ilaçlama kesinlikle yapma, ilacın sürüklenmesi tehlikeli.',
          TimeSlot.afternoon =>
            'Öğleden sonra rüzgar devam ediyor; sera örtülerini ve çit yapılarını kontrol et.',
          TimeSlot.evening =>
            'Akşam rüzgar hâlâ etkili; ekipmanları sabitle, sera kapılarını kapat.',
          TimeSlot.night =>
            'Gece rüzgar devam edecek; sabah hasar kontrolü yap.',
        },
    };
  }

  // ── Şehir Modu: Alt Yazı ──────────────────────────────────────────────────

  static String _citySubtitle(
      WeatherMessageType type, TimeSlot slot, WeatherData data, int temp) {
    return switch (type) {
      WeatherMessageType.clear || WeatherMessageType.partlyCloudy => switch (
            slot) {
          TimeSlot.morning =>
            'Şu an $temp°C, nem %${data.humidity.round()}. Güneşli ve rüzgarsız.',
          TimeSlot.afternoon =>
            'Şu an $temp°C. Güneş tepe noktada, gözlüğünü unutma.',
          TimeSlot.evening =>
            'Şu an $temp°C. Akşam serinliği başlıyor, ince bir hırka yeterli.',
          TimeSlot.night => 'Şu an $temp°C. Sakin ve berrak bir gece.',
        },
      WeatherMessageType.cloudy => switch (slot) {
          TimeSlot.morning =>
            'Şu an $temp°C. Kapalı ama kuru; ince bir ceket al.',
          TimeSlot.afternoon => 'Şu an $temp°C. Güneş yok ama yağmur da yok.',
          TimeSlot.evening => 'Şu an $temp°C. Serin ve kapalı bir akşam.',
          TimeSlot.night => 'Şu an $temp°C. Kapalı ve sakin bir gece.',
        },
      WeatherMessageType.foggy =>
        'Şu an $temp°C. Görüş mesafesi düşük; dikkatli ol.',
      WeatherMessageType.drizzle =>
        'Şu an $temp°C. Hafif çisenti var; şemsiye veya yağmurluk al.',
      WeatherMessageType.rain => data.isRainingNow
          ? 'Şu an yağmur var; şemsiyeni aç, ıslanmamaya dikkat et.'
          : 'Şu an $temp°C; yağış ihtimali var, şemsiyeni yanına al.',
      WeatherMessageType.heavyRain =>
        'Şu an $temp°C. Şiddetli yağış devam ediyor; mümkünse dışarı çıkma.',
      WeatherMessageType.freezingRain =>
        'Şu an $temp°C. Yollar buzlu; dışarı çıkmaktan kaçın.',
      WeatherMessageType.snow =>
        'Şu an $temp°C. Kar yağışı var; kalın giyin, kaymaz ayakkabı giy.',
      WeatherMessageType.thunderstorm =>
        'Şu an $temp°C. Fırtına etkili; evde kal, pencerelerini kapat.',
      WeatherMessageType.hail =>
        'Şu an $temp°C. Dolu riski var; sığınacak yer bul.',
      WeatherMessageType.extremeHeat =>
        'Şu an $temp°C! Bol su iç, güneşte kalma süresini kısalt.',
      WeatherMessageType.frost =>
        'Şu an $temp°C. Don ve buzlanma riski var; dikkatli ol.',
      WeatherMessageType.windy =>
        'Şu an $temp°C. Rüzgar ${data.windSpeed.round()} km/s; uçucu eşyalara dikkat.',
    };
  }

  /// Başlıkta yağış penceresi varken alt yazı “yağış yok / sakin gece” ile çelişmesin.
  static String _citySubtitleWhenRainForecast(
    TimeSlot slot,
    WeatherData data,
    int temp,
    ({String range, DateTime first, DateTime last}) detail,
  ) {
    final range = detail.range;
    final endStr =
        '${detail.last.hour.toString().padLeft(2, '0')}:00';
    final humidity = data.humidity.round();
    // Üst metin yağış odaklıyken: şu an kuru + gün içi yağış beklentisi.
    return switch (slot) {
      TimeSlot.morning =>
        'Şu an $temp°C, nem %$humidity. Yağmur henüz yok; gün içinde yağış bekleniyor (çoğunlukla $range, $endStr\'ye kadar). Şemsiyeni yanına al.',
      TimeSlot.afternoon =>
        'Şu an $temp°C. Yağmur şimdilik yok; önümüzdeki saatlerde yağış ihtimali var ($range, $endStr\'ye kadar).',
      TimeSlot.evening =>
        'Şu an $temp°C. Şu an kuru; akşam ve geceye doğru yağış bekleniyor ($range). Şemsiyeni unutma.',
      TimeSlot.night =>
        'Şu an $temp°C. Gece şimdilik sakin; gün içinde yağış bekleniyor (çoğunlukla $range, $endStr\'ye kadar). Şemsiyeni hazır tut.',
    };
  }

  static String _farmerSubtitleWhenRainForecast(
    WeatherMessageType type,
    TimeSlot slot,
    WeatherData data,
    WeatherDecision decision,
    int temp,
    int wind,
    ({String range, DateTime first, DateTime last}) detail,
  ) {
    final range = detail.range;
    final endStr =
        '${detail.last.hour.toString().padLeft(2, '0')}:00';
    final base =
        'Rüzgar $wind km/s. Gün içinde yağış bekleniyor ($range, $endStr\'ye kadar); ';
    return switch (type) {
      WeatherMessageType.clear ||
      WeatherMessageType.partlyCloudy =>
        '${base}ilaçlama ve sulama planını yağışa göre ayarla.',
      WeatherMessageType.cloudy => decision.shouldIrrigate
          ? '${base}toprak nemi düşükse sulama zamanını yağışa göre ertele.'
          : '${base}toprak nemi ve drenajı yağış öncesi kontrol et.',
      WeatherMessageType.foggy =>
        '${base}sis açılana kadar ilaçlama yapma.',
      WeatherMessageType.drizzle ||
      WeatherMessageType.rain ||
      WeatherMessageType.heavyRain =>
        '${base}drenajı ve sulama zamanını yağışa göre sıkılaştır.',
      WeatherMessageType.freezingRain ||
      WeatherMessageType.snow ||
      WeatherMessageType.frost =>
        '${base}don ve yol koşullarına dikkat et.',
      WeatherMessageType.thunderstorm ||
      WeatherMessageType.hail =>
        '${base}açık alanda iş bırak, ekipmanı koru.',
      WeatherMessageType.extremeHeat =>
        '${base}öğle sıcağında tarla işini kısalt.',
      WeatherMessageType.windy =>
        '${base}ilaçlama yapma; rüzgar ilacı sürükler.',
    };
  }

  // ── Çiftçi Modu: Alt Yazı ─────────────────────────────────────────────────

  static String _farmerSubtitle(WeatherMessageType type, TimeSlot slot,
      WeatherData data, WeatherDecision decision, int temp, int wind) {
    return switch (type) {
      WeatherMessageType.clear ||
      WeatherMessageType.partlyCloudy =>
        decision.canSpray
            ? 'Rüzgar $wind km/s, nem uygun. İlaçlama için uygun koşullar.'
            : decision.shouldIrrigate
                ? 'Toprak nemi düşük; akşam serinliğinde sulama yapabilirsin.'
                : 'Hava sakin; tarla işleri ve rutin bakım için uygun.',
      WeatherMessageType.cloudy => decision.shouldIrrigate
          ? 'Toprak nemi yeterli değil; sulama planlıyorsan bugün uygun.'
          : 'Toprak nemi yeterli; sulamayı erteleyebilirsin.',
      WeatherMessageType.foggy =>
        'Nem çok yüksek; ilaçlama yapma, sis açılana kadar bekle.',
      WeatherMessageType.drizzle ||
      WeatherMessageType.rain =>
        'Drenajı kontrol et; yağış sonrası toprak nemini değerlendir.',
      WeatherMessageType.heavyRain => decision.hasCriticalAlert
          ? 'Drenaj kanallarını kontrol et, ekipmanları kapalı yere al.'
          : 'Drenajı kontrol et; yağış sonrası tarlada su birikmesine dikkat.',
      WeatherMessageType.freezingRain =>
        'Bitkileri acil koru; sera ısıtmalarını aç.',
      WeatherMessageType.snow =>
        'Serayı kapat, hassas fideleri ört; sabah dona karşı tedbir al.',
      WeatherMessageType.thunderstorm =>
        'Tarlaya çıkma; sulama pompalarını kapat, jeneratörü hazırla.',
      WeatherMessageType.hail =>
        'Dolu filesi veya örtü kur; olgunlaşmış ürünleri acil hasat et.',
      WeatherMessageType.extremeHeat =>
        'Erken saatlerde çalış, öğle molası uzun tut. Akşam sula.',
      WeatherMessageType.frost =>
        'Don riski var; fideleri çift kat örtü ile koru, sabah sulama yapma.',
      WeatherMessageType.windy =>
        'İlaçlama yapma; rüzgar $wind km/s, ilaç sürüklenir ve etkisiz kalır.',
    };
  }

  // ── Şehir Modu: Önemli Notlar ─────────────────────────────────────────────

  static String _cityNotes(
      WeatherMessageType type, TimeSlot slot, WeatherData data) {
    return switch (type) {
      WeatherMessageType.clear => switch (slot) {
          TimeSlot.morning =>
            'Hava güzel; güneş kremi sür ve bol su iç. Gün boyu dışarıda vakit geçirebilirsin.',
          TimeSlot.afternoon =>
            'UV oranı yüksek olabilir; 12:00–15:00 arası doğrudan güneş altında kalma süreni kısalt. Şapka ve güneş kremi kullan.',
          TimeSlot.evening =>
            'Hava sakin; dışarıda yemek, yürüyüş ya da bisiklet için ideal koşullar.',
          TimeSlot.night =>
            'Gece ekstra bir sürpriz yok; hava sakin, uyku için uygun.',
        },
      WeatherMessageType.partlyCloudy => switch (slot) {
          TimeSlot.morning =>
            'Hava genel olarak güzel. Yağmur beklenmiyor; günlük planlarını rahatça yapabilirsin.',
          TimeSlot.afternoon =>
            'Güneş zaman zaman çıkıyor; uzun süre dışarıdaysan güneş kremi ve su yanında olsun.',
          TimeSlot.evening =>
            'Akşam serin olabilir; ince bir hırka veya ceket al. Yağış riski düşük.',
          TimeSlot.night => 'Gece sakin; ekstra bir dram yok, rahat uyuyabilirsin.',
        },
      WeatherMessageType.cloudy => switch (slot) {
          TimeSlot.morning =>
            'Yağmur ihtimali düşük ama hava kapalı. Üşümemek için ince bir kat giyin.',
          TimeSlot.afternoon =>
            'Güneş yok ama yağmur da yok; dışarı planların için engel görünmüyor.',
          TimeSlot.evening =>
            'Akşam biraz daha serinleyebilir; kalın bir hırka veya ceket iyi olur.',
          TimeSlot.night => 'Gece sakin; endişe edilecek bir durum yok.',
        },
      WeatherMessageType.foggy => switch (slot) {
          TimeSlot.morning =>
            'Görüş mesafesi çok düşük olabilir. Araçta sis farlarını aç, hızını düşür. Yürürken açık renkli giyin.',
          TimeSlot.afternoon =>
            'Sis genellikle öğleye doğru dağılır; yine de trafikte dikkatli ol.',
          TimeSlot.evening =>
            'Akşam yeniden puslanabilir; dışarıda hareket edeceksen reflektörlü veya parlak giysiler tercih et.',
          TimeSlot.night =>
            'Görüş çok sınırlı; araç kullanmak zorundaysan sis farları + düşük hız.',
        },
      WeatherMessageType.drizzle => switch (slot) {
          TimeSlot.morning =>
            'Hafif yağış; şemsiye veya yağmurluk yeterli. Yollar hafif ıslak olabilir, dikkatli yürü.',
          TimeSlot.afternoon =>
            'Çisenti devam ederse de günlük planlarını çok etkilemez; yanında yağmurluk bulundur.',
          TimeSlot.evening =>
            'Çisenti hafifliyorsa dışarı çıkmak sorun değil ama bir yağmurluk al.',
          TimeSlot.night =>
            'Hafif çisenti sabaha kadar sürebilir; ciddi bir şey değil ama pencereyi kontrol et.',
        },
      WeatherMessageType.rain => switch (slot) {
          TimeSlot.morning =>
            'Yağmur devam ediyor. Şemsiye ve su geçirmez ayakkabı şart. Trafikte mesafe bırak, frenleme mesafesi uzar.',
          TimeSlot.afternoon =>
            'Yağmur durmazsa dışarı planlarını ertele veya kapalı mekanlara yönel. Otopark tercihin kapalı olsun.',
          TimeSlot.evening =>
            'Islak yollarda dikkatli yürü; ayakkabılarının tabanı kaymaya uygun olmasın.',
          TimeSlot.night =>
            'Gece yağmur altında araç kullanmak zorundaysan sis farlarını ve silecekleri kontrol et.',
        },
      WeatherMessageType.heavyRain => switch (slot) {
          TimeSlot.morning =>
            'Şiddetli yağış; alt geçitler ve çukur bölgelerde su birikebilir. Araçla su birikintilerine girme. Mümkünse evde kal.',
          TimeSlot.afternoon =>
            'Sağanak yağış sürerken trafikte olmaktan kaçın. Bodrum ve zemin katlarını kontrol et, su sızması olabilir.',
          TimeSlot.evening =>
            'Dışarıda bırakılmış eşyaları, çamaşırları ve saksıları içeri al. Pencere ve balkonları kapat.',
          TimeSlot.night =>
            'Gece sel uyarılarını takip et. Cep telefonunu şarjlı tut; acil durumda hazır ol.',
        },
      WeatherMessageType.freezingRain => switch (slot) {
          TimeSlot.morning =>
            'Yollar ve kaldırımlar buz kaplı olabilir. Dışarı çıkmak zorundaysan kaymaz tabanlı ayakkabı giy, adımlarını kısa at.',
          TimeSlot.afternoon =>
            'Araçta kış lastiği yoksa trafiğe çıkma. Frenleme mesafesi normalin 5 katına çıkar.',
          TimeSlot.evening =>
            'Mümkünse evde kal. Dondurucu yağmur en tehlikeli hava olaylarından biridir.',
          TimeSlot.night =>
            'Sabah yollar tamamen buzlu olacak. Erken yola çıkacaksan aracını önceden çalıştır ve ısıt.',
        },
      WeatherMessageType.snow => switch (slot) {
          TimeSlot.morning =>
            'Kalın mont, bere, eldiven ve atkı giy. Yollarda buzlanma olabilir; yavaş yürü, adımlarını kısa at.',
          TimeSlot.afternoon =>
            'Araçta yakıt, battaniye ve fener bulundur. Kış lastiği şart; zincirleri kontrol et.',
          TimeSlot.evening =>
            'Evde sıcak kal. Dışarıda bırakılan boruları ve muslukları dona karşı koru.',
          TimeSlot.night =>
            'Sabah kar temizliği gerekecek; kürek ve tuz hazırla. Elektrik kesintisine karşı el feneri hazır tut.',
        },
      WeatherMessageType.thunderstorm => switch (slot) {
          TimeSlot.morning =>
            'Yıldırım riski var; açık alanlardan uzak dur. Şarj edilecek cihazları fişten çek. Mümkünse evde kal.',
          TimeSlot.afternoon =>
            'Fırtına sırasında ağaç altında durma, yüksek yerlere çıkma. Araçtaysan araçta kal.',
          TimeSlot.evening =>
            'Balkon ve bahçedeki uçucu eşyaları içeri al. Pencere ve kepenkleri kapat.',
          TimeSlot.night =>
            'Elektrik kesintisi olabilir; el feneri ve şarjlı batarya hazırla. Fırtına geçene kadar evde kal.',
        },
      WeatherMessageType.hail => switch (slot) {
          TimeSlot.morning =>
            'Dolu araçlara ciddi hasar verir; kapalı otopark kullan. Dışarıdaysan hemen bir binaya sığın.',
          TimeSlot.afternoon =>
            'Dolu sırasında ağaç altına sığınma, dallar kırılabilir. Sağlam bir bina bul.',
          TimeSlot.evening =>
            'Aracın ve eşyaların dışarıdaysa hemen içeri al. Cam kırılma riski var.',
          TimeSlot.night =>
            'Araç dışarıdaysa kalın battaniye veya örtü ile koru. Sabah hasar kontrolü yap.',
        },
      WeatherMessageType.extremeHeat => switch (slot) {
          TimeSlot.morning =>
            'Sıcaklık ${data.temperature.round()}°C ve artıyor. Güneş kremi (SPF 50+), şapka ve bol su şart. Yaşlıları ve çocukları kontrol et.',
          TimeSlot.afternoon =>
            'Güneş çarpması riski çok yüksek. Gölge arayın, her 20 dakikada su için. Açık havada spor yapmayın.',
          TimeSlot.evening =>
            'Asfalt ve beton hâlâ sıcak; çıplak ayakla yürümeyin. Bol su için, hafif giyin.',
          TimeSlot.night =>
            'Gece bile ${data.temperature.round()}°C altına düşmeyebilir. Odanızı havalandırın, elektrik kesilmesine karşı hazırlıklı olun.',
        },
      WeatherMessageType.frost => switch (slot) {
          TimeSlot.morning =>
            'Kaldırımlar ve köprüler buzlu olabilir. Araçta kış lastiği şart; camlar buzluysa buz kazıyıcı kullan. Yaşlılar dışarı çıkmasın.',
          TimeSlot.afternoon =>
            'Don genellikle güneş çıkınca çözülür; yine de gölgeli yerlerde dikkat. Araçta antifrizi kontrol et.',
          TimeSlot.evening =>
            'Akşam hızla soğuyor; mont, eldiven, atkı ve bere giy. Dış muslukları damlat veya kapat.',
          TimeSlot.night =>
            'Boruların donmaması için açık bırak veya izolasyon yap. Soba veya kombi güvenliğini kontrol et.',
        },
      WeatherMessageType.windy => switch (slot) {
          TimeSlot.morning =>
            'Rüzgar ${data.windSpeed.round()} km/s. Şapka uçabilir, saç ve giysilere dikkat. Bisiklet ve motosiklet kullanmaktan kaçın.',
          TimeSlot.afternoon =>
            'Ağaç altında durmayın, dal kırılabilir. İnşaat alanlarından uzak durun.',
          TimeSlot.evening =>
            'Balkon ve terastaki saksı, şemsiye ve hafif mobilyaları sabitle.',
          TimeSlot.night =>
            'Pencerelerin kapalı olduğundan emin ol. Şiddetli rüzgar gürültüsü normaldir; sakin ol.',
        },
    };
  }

  // ── Çiftçi Modu: Önemli Notlar ────────────────────────────────────────────

  static String _farmerNotes(WeatherMessageType type, TimeSlot slot,
      WeatherData data, WeatherDecision decision) {
    return switch (type) {
      WeatherMessageType.clear => switch (slot) {
          TimeSlot.morning =>
            'İlaçlama için ideal koşullar: rüzgar düşük, nem uygun. Sabah erkenden başla, öğle sıcağında ara ver.',
          TimeSlot.afternoon =>
            'Toprak suyu buharlaşıyor; sulama yapacaksan akşam serinliğini bekle. Gün ortasında sulama su israfıdır.',
          TimeSlot.evening =>
            'Akşam sulaması için uygun. Toprak nemini kontrol et; kuruysa bu akşam sula.',
          TimeSlot.night =>
            'Sabah erken tarla işlerine çıkmayı planla. Gece boyunca sorun beklenmiyor.',
        },
      WeatherMessageType.partlyCloudy => switch (slot) {
          TimeSlot.morning =>
            'Bulutlar güneşi kesiyor ama ilaçlama için sorun değil. Rüzgarı kontrol et ve sabah erkenden başla.',
          TimeSlot.afternoon =>
            'Toprak nemi normal seviyelerdeyse sulama ertelenebilir. Bulutlu hava buharlaşmayı azaltıyor.',
          TimeSlot.evening =>
            'Akşam sulaması verimli olacak; buharlaşma düşük.',
          TimeSlot.night =>
            'Sabaha kadar sorun beklenmiyor. Erken saatlerde tarla işlerine başlayabilirsin.',
        },
      WeatherMessageType.cloudy => switch (slot) {
          TimeSlot.morning =>
            'Kapalı hava ilaçlama için kötü değil; buharlaşma düşük olduğundan ilacın etkisi uzun sürer. Rüzgarı kontrol et.',
          TimeSlot.afternoon =>
            'Bulutlu havada toprak daha yavaş kurur; sulama acil değilse öğleden sonraya bırak.',
          TimeSlot.evening =>
            'Toprak nemini elle kontrol et; kuruyorsa bu akşam sulama yap.',
          TimeSlot.night =>
            'Sabah erken işlere başlamak için uygun koşullar bekleniyor.',
        },
      WeatherMessageType.foggy => switch (slot) {
          TimeSlot.morning =>
            'Sis sırasında ilaçlama yapma; nem %90 üstünde olduğunda ilaç tutmaz ve damla oluşur. Sis açılana kadar bekle.',
          TimeSlot.afternoon =>
            'Sis kalktıysa ve rüzgar uygunsa ilaçlama yapılabilir. Toprak nemini kontrol et.',
          TimeSlot.evening =>
            'Yoğun nem koşullarında mantari hastalık riski artar; yaprak gözlemi yap.',
          TimeSlot.night =>
            'Gece nemi ve sis, bitkilerde mantari hastalık riskini artırır. Sabah tarlayı kontrol et.',
        },
      WeatherMessageType.drizzle => switch (slot) {
          TimeSlot.morning =>
            'Çisenti sırasında ilaçlama kesinlikle yapma; ilaç tutmaz ve yıkanır. Yağış durduğunda en az 2 saat bekle.',
          TimeSlot.afternoon =>
            'Toprak ıslak; traktör ve ağır ekipmanla tarlaya girme, toprak sıkışır.',
          TimeSlot.evening =>
            'Sulama gereksiz; yağış toprak nemini artırıyor. Drenaj kanallarını kontrol et.',
          TimeSlot.night =>
            'Sabah tarlayı kontrol et; toprak nemini ölç ve buna göre günü planla.',
        },
      WeatherMessageType.rain => switch (slot) {
          TimeSlot.morning =>
            'Yağmur altında ilaçlama ve gübreleme yapma; ilaç yıkanır, gübre akar. Yağış bittikten sonra en az 4 saat bekle.',
          TimeSlot.afternoon =>
            'Toprak ıslak; ağır ekipmanla tarlaya girme, toprak sıkışır ve kök bölgesine zarar verir.',
          TimeSlot.evening =>
            'Drenaj kanallarını kontrol et; tarlada su birikmesi varsa tahliye yap. Sulama kesinlikle gereksiz.',
          TimeSlot.night =>
            'Sabah tarlayı kontrol et; toprak çok ıslaksa kurumasını bekle, 24-48 saat ertele.',
        },
      WeatherMessageType.heavyRain => switch (slot) {
          TimeSlot.morning =>
            'Şiddetli yağışta kesinlikle tarlaya girme. Drenajları aç, tıkanıklık varsa gider. Ekipmanları kapalı yere al.',
          TimeSlot.afternoon =>
            'Toprak doymuş durumda; yağış sonrası en az 48 saat tarlaya girme. Sel riski olan bölgeleri kontrol et.',
          TimeSlot.evening =>
            'Tarlada su baskını kontrolü yap. Sera ve örtü altı yapıları kontrol et. Hayvanları içeri al.',
          TimeSlot.night =>
            'Acil durumda drenajı kontrol et. Sabah hasar tespiti yap; erozyon ve kök çürümesi riski var.',
        },
      WeatherMessageType.freezingRain => switch (slot) {
          TimeSlot.morning =>
            'Dondurucu yağmur bitkileri öldürebilir. Hassas fideleri ve meyve ağaçlarını hemen örtü ile sar. Sulama yapma.',
          TimeSlot.afternoon =>
            'Sera ve tünel yapılarında buz birikimi çökmeye yol açabilir; üstlerini temizle.',
          TimeSlot.evening =>
            'Tüm hassas bitkileri örtü altına al. Sera ısıtmalarını çalıştır.',
          TimeSlot.night =>
            'Dal kırılması riski var; ağaçların altından geçme. Sabah hasar tespiti yap.',
        },
      WeatherMessageType.snow => switch (slot) {
          TimeSlot.morning =>
            'Kar ve don riski birlikte geliyor. Fideler ve hassas ürünler için çift kat örtü kur. Sulama borularını kapat.',
          TimeSlot.afternoon =>
            'Sera çatılarında kar birikiyorsa temizle; ağırlık çökmeye yol açar. İçerideki sıcaklığı kontrol et.',
          TimeSlot.evening =>
            'Hayvanları içeri al; su kaplarındaki buz kırılmalı. Tüm dış muslukları kapat.',
          TimeSlot.night =>
            'Sera ısıtma sistemlerini çalıştır. Sabah hasar ve don kontrolü yap.',
        },
      WeatherMessageType.thunderstorm => switch (slot) {
          TimeSlot.morning =>
            'Yıldırım tarlada çok tehlikelidir; kesinlikle açık alanda durma. Sulama pompalarını kapat, elektrik kesilmesine karşı jeneratörü hazırla.',
          TimeSlot.afternoon =>
            'Ekipmanları kapalı yere al veya sıkıca bağla. Sera örtülerini kontrol et; rüzgar koparabilir.',
          TimeSlot.evening =>
            'Hayvanları içeri al. Sera kapılarını kapat ve mümkünse iç takviye yap.',
          TimeSlot.night =>
            'Sabah tüm tarlayı, seraları ve ekipmanları gez. Hasar tespiti yap ve sigortana bildir.',
        },
      WeatherMessageType.hail => switch (slot) {
          TimeSlot.morning =>
            'Dolu tüm ürünleri yok edebilir. Dolu filesi veya kalın örtü hemen kur. Olgunlaşmış ürünleri acil hasat et.',
          TimeSlot.afternoon =>
            'Seralarda cam kırılması riski var; mümkünse iç takviye yap. Meyve ağaçlarına koruyucu file ger.',
          TimeSlot.evening =>
            'Tüm koruma önlemlerini kontrol et. Dolu sonrası hasar sigortasına hemen bildir.',
          TimeSlot.night =>
            'Sabah erken hasar tespiti yap. Kırık dalları kes ve yaraları ilaçla. Sigortayı bilgilendir.',
        },
      WeatherMessageType.extremeHeat => switch (slot) {
          TimeSlot.morning =>
            'Erken saatlerde (06:00–09:00) çalış, sonra mola ver. Bol su iç, gölgede dinlen. Hayvanların su kaynağını kontrol et.',
          TimeSlot.afternoon =>
            '11:00–16:00 arası tarlaya çıkma. Sıcak çarpması belirtileri: baş dönmesi, mide bulantısı. Hemen gölgeye geç ve su iç.',
          TimeSlot.evening =>
            'Akşam sulaması ideal; sabah sulamak yerine akşam sula, toprak gece boyunca nemi tutar. Damla sulama tercih et.',
          TimeSlot.night =>
            'Gece sulaması buharlaşmayı minimuma indirir. Meyve ağaçlarını ve fideleri bol sula.',
        },
      WeatherMessageType.frost => switch (slot) {
          TimeSlot.morning =>
            'Sabah sulama yapma; su donarsa köklere zarar verir. Don çözülene kadar (genellikle 09:00–10:00) bekle. Fidelere çift kat örtü koy.',
          TimeSlot.afternoon =>
            'Don kalktıysa örtüleri aç ve havalandır; gün boyu kapalı kalırsa bitki terleyemez. Ama akşam yine kapat.',
          TimeSlot.evening =>
            'Gece dona hazırlan: örtüleri kapat, sera kapılarını sıkıca kapa, ısıtmayı aç. Sulama borularını boşalt veya izole et.',
          TimeSlot.night =>
            'Sera içi sıcaklığı izle; 2°C altına düşerse acil müdahale gerekir. Mum veya ısıtıcılarla destek ver.',
        },
      WeatherMessageType.windy => switch (slot) {
          TimeSlot.morning =>
            'İlaçlama yapma; rüzgar ${data.windSpeed.round()} km/s üzerinde olduğunda ilaç sürüklenir, komşu tarlalara zarar verir ve etkisi azalır.',
          TimeSlot.afternoon =>
            'Sera örtülerinin sağlamlığını kontrol et; klips ve bağlantıları sıkıştır. Toz ve kum fırtınası riski varsa hayvanları içeri al.',
          TimeSlot.evening =>
            'Rüzgar hâlâ güçlüyse ilaçlama ve toz uygulaması için yarını bekle. Ekipmanları bağla.',
          TimeSlot.night =>
            'Sabah sera ve tarla hasarını kontrol et. Devrilmiş veya kırılmış dalları temizle.',
        },
    };
  }

  // ── Yarın: Şehir Başlık ───────────────────────────────────────────────────

  static String _tomorrowCityHeadline(WeatherMessageType type, DailyEntry d) {
    return switch (type) {
      WeatherMessageType.clear =>
        'Yarın güneşli ve güzel bir gün; planlarını güvenle yapabilirsin.',
      WeatherMessageType.partlyCloudy =>
        'Yarın parçalı bulutlu; güneş zaman zaman çıkacak, yağış beklenmiyor.',
      WeatherMessageType.cloudy =>
        'Yarın gökyüzü kapalı ama yağış ihtimali düşük; ince bir ceket al.',
      WeatherMessageType.foggy =>
        'Yarın sabah saatlerinde sis bekleniyor; araç kullanırken görüş mesafesine dikkat.',
      WeatherMessageType.drizzle =>
        'Yarın hafif çisenti bekleniyor; şemsiye veya yağmurluk yanında olsun.',
      WeatherMessageType.rain =>
        'Yarın yağmur bekleniyor; şemsiyeni ve yağmurluğunu hazırla.',
      WeatherMessageType.heavyRain =>
        'Yarın şiddetli yağış bekleniyor; mümkünse dışarı çıkmayı ertele.',
      WeatherMessageType.freezingRain =>
        'Yarın dondurucu yağmur bekleniyor; yollar çok kaygan olacak, araç kullanmaktan kaçın.',
      WeatherMessageType.snow =>
        'Yarın kar yağışı bekleniyor; kalın giyin ve kış hazırlığını tamamla.',
      WeatherMessageType.thunderstorm =>
        'Yarın gök gürültülü fırtına bekleniyor; dışarı planlarını ertele.',
      WeatherMessageType.hail =>
        'Yarın dolu riski var; araçlarını kapalı yere al ve dışarıda eşya bırakma.',
      WeatherMessageType.extremeHeat =>
        'Yarın kavurucu sıcak bekleniyor; öğle saatlerinde güneş altında kalma.',
      WeatherMessageType.frost =>
        'Yarın sabah don riski var; yollarda buzlanmaya dikkat et, kalın giyin.',
      WeatherMessageType.windy =>
        'Yarın kuvvetli rüzgar bekleniyor; dışarıda hafif eşyalara ve şapkana dikkat et.',
    };
  }

  // ── Yarın: Çiftçi Başlık ──────────────────────────────────────────────────

  static String _tomorrowFarmerHeadline(WeatherMessageType type, DailyEntry d) {
    return switch (type) {
      WeatherMessageType.clear =>
        'Yarın güneşli; ilaçlama, sulama ve tarla işleri için ideal koşullar bekleniyor.',
      WeatherMessageType.partlyCloudy =>
        'Yarın parçalı bulutlu; ilaçlama yapılabilir, rüzgarı kontrol et.',
      WeatherMessageType.cloudy =>
        'Yarın kapalı hava; ilaçlama uygunsa yapılabilir, sulama ihtiyacını kontrol et.',
      WeatherMessageType.foggy =>
        'Yarın sabah sis bekleniyor; sis kalkmadan ilaçlama yapma.',
      WeatherMessageType.drizzle =>
        'Yarın çisenti bekleniyor; ilaçlama ve gübreleme yapma, yağış durmasını bekle.',
      WeatherMessageType.rain =>
        'Yarın yağış bekleniyor; ilaçlama ve sulama planını ertele.',
      WeatherMessageType.heavyRain =>
        'Yarın şiddetli yağış bekleniyor; tüm tarla işlerini ertele.',
      WeatherMessageType.freezingRain =>
        'Yarın dondurucu yağmur; fideleri ve meyve ağaçlarını acil olarak koru.',
      WeatherMessageType.snow =>
        'Yarın kar bekleniyor; sera ve örtüleri kontrol et, hayvanları içeri al.',
      WeatherMessageType.thunderstorm =>
        'Yarın fırtına bekleniyor; tüm tarla işlerini iptal et, ekipmanları koru.',
      WeatherMessageType.hail =>
        'Yarın dolu riski var; ürünleri dolu filesiyle koru, olgunlaşmış ürünleri hemen topla.',
      WeatherMessageType.extremeHeat =>
        'Yarın çok sıcak; erken saatlerde çalış, öğle molası uzun tut.',
      WeatherMessageType.frost =>
        'Yarın sabah don riski var; hassas fideleri ve genç ürünleri bu akşam örtü ile koru.',
      WeatherMessageType.windy =>
        'Yarın kuvvetli rüzgar bekleniyor; ilaçlama yapma, sera örtülerini kontrol et.',
    };
  }

  // ── Yarın: Şehir Önemli Notlar ────────────────────────────────────────────

  static String _tomorrowCityNotes(
      WeatherMessageType type, DailyEntry d, List<HourlyEntry> hours) {
    final rainBlocks = hours
        .where((h) => h.precipProbability >= 50 || h.precipitation > 0)
        .toList();
    String? rainText;
    if (rainBlocks.isNotEmpty) {
      final times = rainBlocks.map((h) => h.time).toList();
      final formatted = formatHours(times);
      final isSingle = !formatted.contains('–') && !formatted.contains(',');
      rainText = isSingle
          ? 'Yarın saat $formatted civarında kısa süreli bir yağmur bekleniyor.'
          : 'Yarın $formatted saatleri arasında yağmur bekleniyor.';
    }

    return switch (type) {
      WeatherMessageType.clear =>
        'Yağmur beklenmiyor; uzun süreli dışarı etkinlikleri için ideal. Güneş kremi ve su unutma.',
      WeatherMessageType.partlyCloudy =>
        'Hafif bir ceket yeterli; gün boyu dışarıda olabilirsin.',
      WeatherMessageType.cloudy =>
        'Güneş çıkması zor; kapalı ama kuru bir gün bekleniyor.',
      WeatherMessageType.foggy =>
        'Sis genellikle öğleye doğru açılır; sabah trafiğinde dikkatli ol.',
      WeatherMessageType.drizzle => rainText != null
          ? '$rainText Şiddetli yağış değil ama ıslak yollar ve kaldırımlara dikkat.'
          : 'Şiddetli yağış değil ama ıslak yollar ve kaldırımlara dikkat.',
      WeatherMessageType.rain => rainText != null
          ? '$rainText Dışarı planlarını yağışsız saatlere ayarla. Islak yollarda dikkatli ol.'
          : 'Dışarı planlarını yağışsız saatlere ayarla. Islak yollarda dikkatli ol.',
      WeatherMessageType.heavyRain => rainText != null
          ? '$rainText Sel ve su baskını riski var. Alt geçitlerden uzak dur, kapalı otopark kullan.'
          : 'Sel ve su baskını riski var. Alt geçitlerden uzak dur, kapalı otopark kullan.',
      WeatherMessageType.freezingRain =>
        'Buzlanma çok tehlikeli; kış lastiği ve zincir şart. Mümkünse evde kal.',
      WeatherMessageType.snow =>
        'Yollar kaplı olacak; kış lastiği kontrol et. Yakıt ve erzak stokunu kontrol et.',
      WeatherMessageType.thunderstorm =>
        'Yıldırım ve kuvvetli rüzgar riski var. Elektronik cihazları fişten çek.',
      WeatherMessageType.hail =>
        'Dolu büyük hasar verebilir; cam ve araçları koru.',
      WeatherMessageType.extremeHeat =>
        'Bol su iç, güneş kremi ve şapka kullan. 11:00–16:00 arası dışarı çıkmayı sınırla.',
      WeatherMessageType.frost =>
        'Sabah erken yola çıkacaksan aracını önceden ısıt. Dış muslukları koru.',
      WeatherMessageType.windy =>
        'Bisiklet ve motosiklet kullanmaktan kaçın. Balkondaki eşyaları sabitle.',
    };
  }

  // ── Yarın: Çiftçi Önemli Notlar ───────────────────────────────────────────

  static String _tomorrowFarmerNotes(
      WeatherMessageType type, DailyEntry d, List<HourlyEntry> hours) {
    final rainHours = hours.where((h) => h.precipitation > 0).toList();
    String? rainWindow;
    if (rainHours.isNotEmpty) {
      final times = rainHours.map((h) => h.time).toList();
      final formatted = formatHours(times);
      rainWindow = formatted.contains('–') || formatted.contains(',')
          ? '$formatted saatleri arasında'
          : 'saat $formatted civarında';
    }

    return switch (type) {
      WeatherMessageType.clear =>
        'Rüzgar düşük ve yağış yok; sabah erkenden ilaçlama yap, akşam sula.',
      WeatherMessageType.partlyCloudy =>
        'Bulutlar buharlaşmayı azaltır; sulama verimli olacak.',
      WeatherMessageType.cloudy =>
        'Kapalı havada buharlaşma az; sulama acil değilse ertele.',
      WeatherMessageType.foggy =>
        'Nem çok yüksek; mantari hastalık riski artar, yaprak gözlemi yap.',
      WeatherMessageType.drizzle =>
        'Toprak nem alacak; sulama gereksiz. Yağış bittikten sonra 2 saat bekle.',
      WeatherMessageType.rain => rainWindow != null
          ? 'Yarın $rainWindow yağış bekleniyor. Tarlaya girme; toprak ıslak olacak. Drenajı kontrol et.'
          : 'Tarlaya girme; toprak ıslak olacak. Drenajı kontrol et.',
      WeatherMessageType.heavyRain => rainWindow != null
          ? 'Yarın $rainWindow şiddetli yağış. Drenaj ve set yapılarını kontrol et; sel riski var. Ekipmanları kapalı yere al.'
          : 'Drenaj ve set yapılarını kontrol et; sel riski var. Ekipmanları kapalı yere al.',
      WeatherMessageType.freezingRain =>
        'Dallar buz yüküyle kırılabilir; destek çubuğu koy. Sera ısıtmalarını aç.',
      WeatherMessageType.snow =>
        'Kar yükü sera çatılarını çökertebilir; temizle. Sulama borularını koru.',
      WeatherMessageType.thunderstorm =>
        'Yıldırım ve kuvvetli rüzgar riski. Sulama pompalarını kapat, jeneratörü hazırla.',
      WeatherMessageType.hail =>
        'Dolu tüm hasadı yok edebilir; acil hasat ve koruma önlemi al. Sigorta bilgilerini hazırla.',
      WeatherMessageType.extremeHeat =>
        '06:00–09:00 arası çalış, 10:00–16:00 arası mola. Akşam sula; gündüz sulama su israfı.',
      WeatherMessageType.frost =>
        'Sabah sulama yapma; su donarsa köklere zarar verir. Don çözülene kadar bekle.',
      WeatherMessageType.windy =>
        'İlaç sürüklenmesi riski var. Ekipmanları sabitle, hafif yapıları takviye et.',
    };
  }
}
