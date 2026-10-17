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
    final t = _effectiveType(type, data);
    final rainDetail = _rainWindowDetails(todayHourly);
    // Yağış penceresi varsa başlık onu söylesin (şu an bulutlu olsa bile).
    // Kritik tipte uyarı önde kalır, pencere sona eklenir.
    if (rainDetail != null && !_isCritical(t)) {
      return _rainHeadline(rainDetail, mode,
          isTomorrow: false, rainingNow: data.isRainingNow);
    }
    final base = mode == UserMode.farmer
        ? _farmerHeadline(t, slot, data, decision)
        : _cityHeadline(t, slot, data);
    if (rainDetail != null) return '$base ${_rainHint(rainDetail)}';
    return base;
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
    final t = _effectiveType(type, data);
    final temp = data.temperature.round();
    final wind = data.windSpeed.round();
    if (mode == UserMode.farmer) {
      final rainDetail = _rainWindowDetails(todayHourly);
      if (rainDetail != null && !data.isRainingNow) {
        return _farmerSubtitleWhenRainForecast(
            t, slot, data, decision, temp, wind, rainDetail);
      }
      return _farmerSubtitle(t, slot, data, decision, temp, wind);
    }
    final rainDetail = _rainWindowDetails(todayHourly);
    // Kritik tipte başlık tipe göre kalıyor, alt yazı da öyle kalsın.
    if (rainDetail != null && data.isRainingNow && !_isCritical(t)) {
      return _citySubtitle(WeatherMessageType.rain, slot, data, temp);
    }
    if (rainDetail != null && !data.isRainingNow && !_isCritical(t)) {
      return _citySubtitleWhenRainForecast(slot, data, temp, rainDetail);
    }
    return _citySubtitle(t, slot, data, temp);
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
    final t = _effectiveType(type, data);
    final notes = mode == UserMode.farmer
        ? _farmerNotes(t, slot, data, decision)
        : _cityNotes(t, slot, data);
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

    buf.write('Bugün sıcaklık $minT° ile $maxT° arası. ');

    final rainDetail = _rainWindowDetails(hours);
    final rainWindow = rainDetail?.range;
    // Günlük ihtimal saatlik pencereden düşük kalabiliyor, yüksek olanı söyle.
    final rainProb = rainDetail != null && rainDetail.prob > precipProb
        ? rainDetail.prob
        : precipProb;
    if (rainWindow != null) {
      buf.write('Yağış ${_rainWhen(rainWindow)} bekleniyor. ');
    } else if (data.isRainingNow) {
      buf.write('Şu an yağmur var, sonraki saatlerde dinmesi bekleniyor. ');
    } else if (precipProb >= 50) {
      buf.write('Gün içinde yağış ihtimali %$precipProb. ');
    } else {
      buf.write('Yağış beklenmiyor, gün kuru geçecek gibi. ');
    }

    if (data.isStorm || (todayDaily != null && todayDaily.weatherCode >= 95)) {
      buf.write('Fırtına uyarısı var. Açık alanlardan uzak dur. ');
    }
    if (data.isHailRisk ||
        (todayDaily != null && todayDaily.weatherCode >= 96)) {
      buf.write('Dolu riski var. Aracını ve hassas eşyalarını koru. ');
    }
    if (data.isFrostRisk || (todayDaily != null && todayDaily.tempMin <= 2)) {
      buf.write('Don riski var. Sabah yollarda buzlanma olabilir. ');
    }
    if (windMax >= 40) {
      buf.write('Rüzgar kuvvetli, en fazla $windMax km/s. ');
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
          buf.write('İlaçlama için koşullar uygun. Başlamadan rüzgara bak. ');
        }
      } else if (rainWindow != null || precipProb >= 30) {
        buf.write('Bugün ilaçlamayı ertele. Yağış ihtimali %$rainProb. ');
      }
      if (decision.shouldIrrigate && rainWindow != null) {
        buf.write('Toprak nemi düşük ama yağış geliyor. Sulamayı yağıştan sonraya bırak. ');
      } else if (decision.shouldIrrigate) {
        buf.write('Toprak nemi düşük. Akşam serinliğinde sula. ');
      } else if (data.isRainingNow || precipProb >= 60) {
        buf.write('Sulamaya gerek yok, yağış toprağı nemlendirecek. ');
      }
    } else {
      if (rainWindow != null) {
        buf.write('Şemsiyeni yanına al. ');
      }
      if (maxT >= 33) {
        buf.write('Öğle saatleri sıcak. Güneş kremi ve su yanında olsun. ');
      }
      if (minT <= 5) {
        buf.write('Sabah ve akşam soğuk, kalın giyin. ');
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
    final t = d.messageType;
    final rainDetail = _rainWindowDetails(hours);
    // Bugünle aynı kural: kritik tipte uyarı önde, pencere sonda.
    if (rainDetail != null && !_isCritical(t)) {
      return _rainHeadline(rainDetail, mode, isTomorrow: true);
    }
    final base = mode == UserMode.farmer
        ? _tomorrowFarmerHeadline(t, d)
        : _tomorrowCityHeadline(t, d);
    if (rainDetail != null) return '$base ${_rainHint(rainDetail)}';
    return base;
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
    final prob = d.precipProbMax;
    if (mode == UserMode.farmer) {
      if (prob >= 60)
        return 'En yüksek $max°, en düşük $min°. Yağış ihtimali %$prob, ilaçlama yapma.';
      if (d.tempMin <= 2)
        return 'En yüksek $max°, en düşük $min°. Don riski var, hassas fideleri koru.';
      if (d.windSpeedMax > 40)
        return 'En yüksek $max°, en düşük $min°. Rüzgar güçlü, en fazla ${d.windSpeedMax.round()} km/s.';
      return 'En yüksek $max°, en düşük $min°. Yağış ihtimali %$prob.';
    }
    // description kapalı havayı da "Parçalı bulutlu" diyor, başlıkla çelişmesin.
    return 'En yüksek $max°, en düşük $min°. Yağış ihtimali %$prob.';
  }

  // ── Haftalık: Başlık ───────────────────────────────────────────────────────

  static String weeklyHeadline(List<DailyEntry> days, UserMode mode) {
    if (days.isEmpty) return 'Bu haftanın hava durumu';
    final rainList = days.where((d) => d.precipProbMax >= 50).toList();
    final rainDays = rainList.length;
    final frostDays = days.where((d) => d.tempMin <= 2).length;
    final severeList = days.where((d) => d.weatherCode >= 95).toList();
    final maxT = days.map((d) => d.tempMax).reduce((a, b) => a > b ? a : b);

    if (severeList.isNotEmpty) {
      final names = _dayNameList(severeList);
      final plural = severeList.length > 1;
      return mode == UserMode.farmer
          ? 'Bu hafta $names fırtına ya da dolu riski var. Korumayı ve acil hasadı ${plural ? 'o günlerden' : 'o günden'} önce bitir.'
          : 'Bu hafta $names fırtına ya da dolu riski var. ${plural ? 'O günler' : 'O gün'} dışarı planlarını esnek tut.';
    }
    if (maxT >= 35) {
      return mode == UserMode.farmer
          ? 'Bu hafta en yüksek sıcaklık ${maxT.round()}°C. İşi sabaha ve akşama yay, öğleyi kısa tut.'
          : 'Bu hafta en yüksek sıcaklık ${maxT.round()}°C. Su ve gölge planını şimdiden yap, öğle güneşiyle inatlaşma.';
    }
    if (frostDays > 0) {
      return mode == UserMode.farmer
          ? 'Bu hafta $frostDays gün don riski var. Hassas ürünleri ört, sabah sulama yapma.'
          : 'Bu hafta $frostDays gün don riski var. Sabah buzlanmaya dikkat et, kalın giyin.';
    }
    if (rainDays >= 3) {
      return mode == UserMode.farmer
          ? 'Bu hafta $rainDays gün yağışlı görünüyor. Tarla için pencere dar, kuru günleri iyi kullan.'
          : 'Bu hafta $rainDays gün yağışlı görünüyor. Şemsiye çantanın kalıcı üyesi olabilir.';
    }
    if (rainDays >= 1) {
      final names = _dayNameList(rainList);
      final oGun = rainList.length > 1 ? 'O günler' : 'O gün';
      return mode == UserMode.farmer
          ? 'Bu hafta $names yağış ihtimali var. İlaçlama ve tarla işlerini kuru günlere koy.'
          : 'Bu hafta $names yağış ihtimali var. $oGun şemsiyen yanında olsun, kalan günler kuru.';
    }
    return mode == UserMode.farmer
        ? 'Bu hafta yağış beklenmiyor. İlaçlama, sulama ve tarla işleri için uygun bir hafta.'
        : 'Bu hafta yağış beklenmiyor. Planlarını rahat kurabilirsin.';
  }

  // ── Haftalık: Alt Yazı ─────────────────────────────────────────────────────

  static String weeklySubtitle(List<DailyEntry> days) {
    if (days.isEmpty) return '7 günlük tahmin birazdan burada.';
    final maxT = days.map((d) => d.tempMax).reduce((a, b) => a > b ? a : b);
    final minT = days.map((d) => d.tempMin).reduce((a, b) => a < b ? a : b);
    final tip = maxT - minT >= 12
        ? 'Serin ve sıcak günler karışık, katmanlı giyin.'
        : 'Sıcaklık hafta boyunca dengeli.';
    return 'Hafta boyunca ${minT.round()}° ile ${maxT.round()}° arası. $tip';
  }

  // ── Haftalık: Özet Metin ───────────────────────────────────────────────────

  static String weeklyNotes(List<DailyEntry> days, UserMode mode) {
    if (days.isEmpty) return '';
    final dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    final rainList = days.where((d) => d.precipProbMax >= 50).toList();
    final rainDays = rainList.length;
    final frostDays = days.where((d) => d.tempMin <= 2).length;
    final maxT = days.map((d) => d.tempMax).reduce((a, b) => a > b ? a : b);
    final minT = days.map((d) => d.tempMin).reduce((a, b) => a < b ? a : b);

    final buf = StringBuffer();
    buf.write(
        'Bu hafta sıcaklık ${minT.round()}°C ile ${maxT.round()}°C arası. ');

    final rainNames =
        rainList.map((d) => dayNames[d.date.weekday - 1]).join(', ');
    if (rainDays == 0) {
      buf.write('Yağış beklenmiyor. Dışarı işleri için uygun bir hafta. ');
    } else if (rainDays <= 2) {
      // Şemsiye önerisi şehir için, çiftçi tavsiyesi aşağıda.
      buf.write(mode == UserMode.farmer
          ? 'Yağış ihtimali olan günler: $rainNames. '
          : 'Yağış ihtimali olan günler: $rainNames. O günler şemsiyeyi çantaya at. ');
    } else {
      buf.write(
          '$rainDays gün yağışlı görünüyor ($rainNames). Planını kuru günlere göre böl. ');
    }
    // Çiftçide don günleri aşağıda isimle geçiyor, tekrar etme.
    if (frostDays > 0 && mode != UserMode.farmer) {
      buf.write(
          '$frostDays günde don riski var. Sabah buzlanmaya ve soğuğa dikkat et. ');
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
            'Don riski olan günler: $names. Hassas fideleri ört, sabah sulama yapma. ');
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
            'Kuvvetli rüzgar günleri: $names. İlaçlama yapma, ekipmanı sabitle. ');
      }
      if (goodDays.isEmpty &&
          heavyRainDays.isEmpty &&
          windDays.isEmpty &&
          fDays.isEmpty) {
        buf.write('Hafta sıradan görünüyor. Rutin işlerine devam edebilirsin.');
      }
    } else {
      if (rainDays >= 3) {
        buf.write(
            'Yağışlı günlerde kapalı mekan planla. Kuru günleri yürüyüşe sakla.');
      } else if (rainDays == 0) {
        buf.write(
            'Dışarı çıkmak için iyi bir hafta. Su ve şapkayı yine de unutma.');
      } else {
        buf.write('Uzun yürüyüş ve dışarı planlarını kuru günlere çek.');
      }
    }
    return buf.toString().trim();
  }

  // ── Bildirim Metinleri ─────────────────────────────────────────────────────

  static String notificationText(
    WeatherMessageType type,
    UserMode mode,
    WeatherData data, {
    String? rainTime,
  }) {
    final temp = data.temperature.round();
    final prob = data.precipitationProbability.round();
    if (mode == UserMode.farmer) {
      return switch (type) {
        WeatherMessageType.thunderstorm =>
            'Fırtına geliyor. Tarladaki işi bırak, ekipmanı güvene al.',
        WeatherMessageType.hail =>
            'Dolu riski var. Ürünü file ya da örtüyle şimdi koru.',
        WeatherMessageType.frost =>
            'Don riski, şu an $temp°C. Fideleri ört, sabah sulama yapma.',
        WeatherMessageType.heavyRain =>
            'Şiddetli yağış var. Drenaja bak, ıslak tarlaya girme.',
        WeatherMessageType.extremeHeat =>
            'Sıcaklık $temp°C. 11:00–16:00 arası tarlaya çıkma.',
        WeatherMessageType.freezingRain =>
            'Dondurucu yağmur var. Hassas bitkileri hemen ört.',
        _ => rainTime != null
            ? '$rainTime civarı yağış bekleniyor. O saatlerde ilaçlama yapma.'
            : 'Şu an $temp°C, rüzgar ${data.windSpeed.round()} km/s, yağış ihtimali %$prob.',
      };
    }
    return switch (type) {
      WeatherMessageType.thunderstorm =>
          'Fırtına var. Dışarı çıkma, pencereleri kapat.',
      WeatherMessageType.hail =>
          'Dolu riski var. Aracını kapalı yere al, sen de içeride kal.',
      WeatherMessageType.frost =>
          'Sabah buzlanma riski, şu an $temp°C. Yavaş yürü, kalın giyin.',
      WeatherMessageType.heavyRain =>
          'Şiddetli yağış var. Alt geçit ve su birikintilerinden uzak dur.',
      WeatherMessageType.extremeHeat =>
          'Sıcaklık $temp°C. Güneşte kalma, suyunu yanında taşı.',
      WeatherMessageType.freezingRain =>
          'Yollar buz tutabilir. Zorunlu değilse dışarı çıkma.',
      _ => rainTime != null
          ? '$rainTime civarı yağmur bekleniyor. Şemsiyeni al.'
          : 'Şu an $temp°C, yağış ihtimali %$prob.',
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
      final base = headline(type, mode, slot, data, decision,
          todayHourly: todayHourly);
      final taskNames =
          activeTasks.map((t) => t.label.toLowerCase()).take(2).join(' ve ');
      return '$base Seçtiğin $taskNames için şimdilik bir engel görünmüyor.';
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
      return notificationText(type, mode, data,
          rainTime: rainTime);
    }
    final alerts =
        DailyTaskService.generateTaskAlerts(activeTasks, data, decision, mode);
    if (alerts.isNotEmpty) {
      return DailyTaskService.cleanLeadingDecor(alerts.first);
    }
    return notificationText(type, mode, data,
        rainTime: rainTime);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  P R I V A T E   H E L P E R S
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Tip yardımcıları ───────────────────────────────────────────────────────

  /// Kod kuru dese de şu an yağıyorsa "kuru" metin çıkmasın.
  static WeatherMessageType _effectiveType(
      WeatherMessageType type, WeatherData data) {
    if (!data.isRainingNow) return type;
    return switch (type) {
      WeatherMessageType.clear ||
      WeatherMessageType.partlyCloudy ||
      WeatherMessageType.cloudy =>
        WeatherMessageType.drizzle,
      _ => type,
    };
  }

  /// Yağış penceresinin başlığı ezmemesi gereken tipler.
  static bool _isCritical(WeatherMessageType type) => switch (type) {
        WeatherMessageType.hail ||
        WeatherMessageType.thunderstorm ||
        WeatherMessageType.freezingRain ||
        WeatherMessageType.heavyRain ||
        WeatherMessageType.snow ||
        WeatherMessageType.frost =>
          true,
        _ => false,
      };

  /// Haftalık başlık için tam gün adları: "Salı ve Perşembe".
  static String _dayNameList(List<DailyEntry> ds) {
    const names = [
      'Pazartesi',
      'Salı',
      'Çarşamba',
      'Perşembe',
      'Cuma',
      'Cumartesi',
      'Pazar',
    ];
    final list = ds.map((d) => names[d.date.weekday - 1]).toList();
    if (list.length <= 1) return list.join();
    return '${list.sublist(0, list.length - 1).join(', ')} ve ${list.last}';
  }

  // ── Yağış aralığı ──────────────────────────────────────────────────────────

  /// Saatlik tahmine göre yağışlı saatlerin ilk/son anı, metin aralığı ve en
  /// yüksek ihtimali.
  static ({String range, DateTime first, DateTime last, int prob})?
      _rainWindowDetails(List<HourlyEntry> hours) {
    if (hours.isEmpty) return null;
    final now = DateTime.now();
    final future = hours.where((h) => h.time.isAfter(now)).toList();
    final rainHours = future
        .where((h) => h.precipitation > 0 || h.precipProbability >= 50)
        .toList();
    if (rainHours.isEmpty) return null;
    final times = rainHours.map((h) => h.time).toList()..sort();
    final range = formatHours(times);
    final prob = rainHours
        .map((h) => h.precipProbability)
        .reduce((a, b) => a > b ? a : b);
    return (range: range, first: times.first, last: times.last, prob: prob);
  }

  static String _hh(DateTime t) => '${t.hour.toString().padLeft(2, '0')}:00';

  /// "17:00'ye kadar" gibi, saatin okunuşuna göre doğru yönelme eki.
  static String _untilHour(DateTime t) {
    const ek = [
      'a', 'e', 'ye', 'e', 'e', 'e', 'ya', 'ye', 'e', 'a', 'a', 'e', //
      'ye', 'e', 'e', 'e', 'ya', 'ye', 'e', 'a', 'ye', 'e', 'ye', 'e',
    ];
    return "${_hh(t)}'${ek[t.hour]} kadar";
  }

  /// "15:00 civarı", "14:00–17:00 arası", "09:00, 14:00–17:00 saatlerinde".
  static String _rainWhen(String range) {
    if (range.contains(',')) return '$range saatlerinde';
    if (range.contains('–')) return '$range arası';
    return '$range civarı';
  }

  /// Kritik tip başlığının sonuna eklenen kısa pencere bilgisi.
  static String _rainHint(
          ({String range, DateTime first, DateTime last, int prob}) detail) =>
      'Yağışlı saatler: ${detail.range}.';

  static String _rainHeadline(
      ({String range, DateTime first, DateTime last, int prob}) detail,
      UserMode mode,
      {required bool isTomorrow,
      bool rainingNow = false}) {
    final window = detail.range;
    final day = isTomorrow ? 'Yarın' : 'Bugün';
    final isMulti = window.contains(',');
    final isSingle = !isMulti && !window.contains('–');
    final prob = detail.prob;

    // Yağmur şu an yağıyor ve kesintisiz sürüyorsa önce bitiş saatini söyle.
    final continuesNow = rainingNow &&
        !isTomorrow &&
        !isMulti &&
        detail.first.difference(DateTime.now()).inMinutes <= 60;
    if (continuesNow) {
      return mode == UserMode.farmer
          ? 'Yağış sürüyor, ${_untilHour(detail.last)} devam edebilir. Tarlaya girme, ilaçlamayı ertele.'
          : 'Yağmur sürüyor, ${_untilHour(detail.last)} devam edebilir. Şemsiyeni yanından ayırma.';
    }

    if (mode == UserMode.farmer) {
      if (isMulti) {
        return '$day yağış aralıklı: $window. İlaçlama için kuru bir aralık seç, sulamayı ertele.';
      }
      if (isSingle) {
        return '$day $window civarı kısa bir yağış geçebilir. Yağış ihtimali %$prob. İlaçlamayı bu saatten uzak tut.';
      }
      return '$day $window arası yağış bekleniyor. Yağış ihtimali %$prob. İlaçlamayı ertele, sulamayı yağışa göre ayarla.';
    }
    if (isMulti) {
      return '$day yağmur aralıklı: $window. En yüksek ihtimal %$prob. Şemsiye çantada kalsın.';
    }
    if (isSingle) {
      return '$day $window civarı kısa bir yağmur geçebilir. Yağış ihtimali %$prob. Şemsiyeni yanına al.';
    }
    return '$day $window arası yağmur bekleniyor. Yağış ihtimali %$prob. Şemsiyeni al, planını bu saatlere göre kur.';
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
            'Sabah güneşli. Kahveyi dışarıda içmek için iyi bir bahane.',
          TimeSlot.afternoon =>
            'Öğleden sonra açık ve güneşli. Şapka ve suyunu yanına al.',
          TimeSlot.evening =>
            'Akşam açık ve sakin. Kısa bir yürüyüş için tam vakti.',
          TimeSlot.night => 'Gece açık ve sakin. Yağış beklenmiyor.',
        },
      WeatherMessageType.partlyCloudy => switch (slot) {
          TimeSlot.morning =>
            'Sabah parçalı bulutlu. Hafif bir hırka yeter.',
          TimeSlot.afternoon =>
            'Öğleden sonra güneş ara ara açıyor. Dışarı planın varsa sorun yok.',
          TimeSlot.evening =>
            'Akşam parçalı bulutlu ve serin. Yürüyüş için uygun.',
          TimeSlot.night => 'Gece parçalı bulutlu. Yağış beklenmiyor.',
        },
      WeatherMessageType.cloudy => switch (slot) {
          TimeSlot.morning => 'Sabah kapalı ama kuru. İnce bir ceket al.',
          TimeSlot.afternoon =>
            'Öğleden sonra bulutlu. Güneş az, yağış ihtimali düşük.',
          TimeSlot.evening => 'Akşam kapalı ve serin. Üstüne bir kat al.',
          TimeSlot.night => 'Gece kapalı geçecek. Yağış beklenmiyor.',
        },
      WeatherMessageType.foggy => switch (slot) {
          TimeSlot.morning =>
            'Sabah sis var. Araçtaysan sis farlarını aç, yavaş git.',
          TimeSlot.afternoon =>
            'Öğleden sonra sis dağılıyor. Yolda yine de dikkatli ol.',
          TimeSlot.evening =>
            'Akşam pus var. Yolda görüş mesafesine dikkat et.',
          TimeSlot.night =>
            'Gece sis etkili. Araç kullanacaksan hızını düşür.',
        },
      WeatherMessageType.drizzle => switch (slot) {
          TimeSlot.morning =>
            'Sabah hafif çisenti var. Kapüşon ya da küçük bir şemsiye yeter.',
          TimeSlot.afternoon =>
            'Öğleden sonra çisenti sürüyor. Kısa işler için çıkabilirsin, şemsiye yanında olsun.',
          TimeSlot.evening =>
            'Akşam hafif çisenti var. Su geçirmez bir ceket iyi olur.',
          TimeSlot.night =>
            'Gece hafif çisenti sürecek. Dışarıda eşya bıraktıysan içeri al.',
        },
      WeatherMessageType.rain => switch (slot) {
          TimeSlot.morning =>
            'Sabah yağmur yağıyor. Şemsiyeni ve su geçirmez ayakkabını al.',
          TimeSlot.afternoon =>
            'Öğleden sonra yağmur sürüyor. Zorunlu değilse işleri sonraya bırak.',
          TimeSlot.evening =>
            'Bu akşam yağmur var. Çıkacaksan yağmurluk giy, ıslak yollara dikkat et.',
          TimeSlot.night =>
            'Gece yağmur sürecek. Araç kullanacaksan takip mesafesini aç.',
        },
      WeatherMessageType.heavyRain => switch (slot) {
          TimeSlot.morning =>
            'Sabah şiddetli yağış var. Zorunlu değilse çıkma, sel riskine dikkat et.',
          TimeSlot.afternoon =>
            'Öğleden sonra sağanak sürüyor. Alt geçitlerden ve dere yataklarından uzak dur.',
          TimeSlot.evening =>
            'Bu akşam şiddetli yağış var. Dışarıdaki eşyaları içeri al, pencereleri kapat.',
          TimeSlot.night =>
            'Gece sağanak sürecek. Sel riski var, mümkünse yola çıkma.',
        },
      WeatherMessageType.freezingRain => switch (slot) {
          TimeSlot.morning =>
            'Sabah dondurucu yağmur var. Yollar ve kaldırımlar buz tutmuş olabilir.',
          TimeSlot.afternoon =>
            'Öğleden sonra dondurucu yağmur sürüyor. Yollar çok kaygan, araç kullanma.',
          TimeSlot.evening =>
            'Bu akşam dondurucu yağmur var. Zorunlu değilse dışarı çıkma.',
          TimeSlot.night =>
            'Gece dondurucu yağmur sürecek. Sabah yollar buz olabilir, erken çıkacaksan dikkat et.',
        },
      WeatherMessageType.snow => switch (slot) {
          TimeSlot.morning =>
            'Sabah kar yağıyor. Kalın giyin, kaymaz tabanlı ayakkabı seç.',
          TimeSlot.afternoon =>
            'Öğleden sonra kar sürüyor. Araçla çıkacaksan kış lastiğini ve zinciri kontrol et.',
          TimeSlot.evening =>
            'Bu akşam kar var. Yollar kaygan, dışarıda uzun kalma.',
          TimeSlot.night =>
            'Gece kar bekleniyor. Sabah yollar kapalı olabilir, çıkışını buna göre planla.',
        },
      WeatherMessageType.thunderstorm => switch (slot) {
          TimeSlot.morning =>
            'Sabah gök gürültülü fırtına var. Zorunlu değilse dışarı çıkma.',
          TimeSlot.afternoon =>
            'Öğleden sonra fırtına etkili. Açık alan, ağaç ve direklerden uzak dur.',
          TimeSlot.evening =>
            'Bu akşam fırtına var. Pencereleri kapat, balkonu boşalt.',
          TimeSlot.night =>
            'Gece fırtına sürecek. Elektrik kesilebilir, el fenerini hazır et.',
        },
      WeatherMessageType.hail => switch (slot) {
          TimeSlot.morning =>
            'Sabah dolu riski var. Aracını kapalı yere çek, dışarıda bekleme.',
          TimeSlot.afternoon =>
            'Öğleden sonra dolu bekleniyor. Aracını ve eşyalarını koru.',
          TimeSlot.evening =>
            'Bu akşam dolu riski var. Aracını kapalı yere al, balkon kapısını kapat.',
          TimeSlot.night =>
            'Gece dolu bekleniyor. Araç dışarıdaysa üstünü kalın bir örtüyle kapat.',
        },
      WeatherMessageType.extremeHeat => switch (slot) {
          TimeSlot.morning =>
            'Sabah bile sıcak. İşlerini erken bitir, suyu yanından ayırma.',
          TimeSlot.afternoon =>
            'Öğleden sonra kavurucu sıcak. 11:00–16:00 arası doğrudan güneşte kalma.',
          TimeSlot.evening =>
            'Akşam sıcaklık biraz düşüyor ama hava hâlâ bunaltıcı. Bol su iç.',
          TimeSlot.night =>
            'Gece de sıcak. Yatmadan önce odayı havalandır.',
        },
      WeatherMessageType.frost => switch (slot) {
          TimeSlot.morning =>
            'Sabah don ve buzlanma riski var. Kaldırımda adımlarını kısa tut.',
          TimeSlot.afternoon =>
            'Öğleye doğru don çözülüyor. Gölgede kalan yerlerde buz kalabilir.',
          TimeSlot.evening =>
            'Bu akşam hava hızla soğuyor. Kalın giyin, dışarıda uzun kalma.',
          TimeSlot.night =>
            'Gece don bekleniyor. Dış muslukları kapat, boruları koru.',
        },
      WeatherMessageType.windy => switch (slot) {
          TimeSlot.morning =>
            'Sabah kuvvetli rüzgar var. Şapkana ve hafif eşyalarına sahip çık.',
          TimeSlot.afternoon =>
            'Öğleden sonra rüzgar güçleniyor. Tabela ve iskele yakınından geçme.',
          TimeSlot.evening =>
            'Bu akşam rüzgar etkili. Balkondaki eşyaları sabitle ya da içeri al.',
          TimeSlot.night =>
            'Gece kuvvetli rüzgar sürecek. Pencere ve kapıları sıkıca kapat.',
        },
    };
  }

  // ── Çiftçi Modu: Bugün Başlık ─────────────────────────────────────────────

  static String _farmerHeadline(WeatherMessageType type, TimeSlot slot,
      WeatherData data, WeatherDecision decision) {
    // Başlık ilaçlamayı ancak karar motoru izin veriyorsa önersin.
    final spray = decision.canSpray;
    return switch (type) {
      WeatherMessageType.clear => switch (slot) {
          TimeSlot.morning => spray
              ? 'Sabah açık, rüzgar ilaçlamaya uygun. Erken başla, öğle sıcağından önce bitir.'
              : 'Sabah açık ama ilaçlama koşulları sınırda. Rüzgarı ve nemi kontrol et.',
          TimeSlot.afternoon =>
            'Öğleden sonra güneş etkili. Sulamayı akşam serinliğine bırak.',
          TimeSlot.evening =>
            'Akşam sakin ve serin. Sulama ve tarla kontrolü için uygun.',
          TimeSlot.night =>
            'Gece açık ve sakin. Sabah erken ilaçlama ya da sulama planlayabilirsin.',
        },
      WeatherMessageType.partlyCloudy => switch (slot) {
          TimeSlot.morning => spray
              ? 'Sabah parçalı bulutlu. İlaçlama için uygun, başlamadan rüzgara bak.'
              : 'Sabah parçalı bulutlu. İlaçlama koşulları sınırda, rüzgarı kontrol et.',
          TimeSlot.afternoon =>
            'Öğleden sonra bulutlu ama kuru. Tarla kontrolü ve bakım için uygun.',
          TimeSlot.evening => 'Akşam sakin. Sulama ve hafif işler için uygun.',
          TimeSlot.night =>
            'Gece yağış beklenmiyor. Sabah ilaçlamayı planlayabilirsin.',
        },
      WeatherMessageType.cloudy => switch (slot) {
          TimeSlot.morning => spray
              ? 'Sabah kapalı ama kuru. İlaçlama yapabilirsin, önce rüzgara bak.'
              : 'Sabah kapalı ama kuru. İlaçlama koşulları sınırda, rüzgarı kontrol et.',
          TimeSlot.afternoon =>
            'Öğleden sonra kapalı. Buharlaşma düşük, sulama acil değilse bekleyebilir.',
          TimeSlot.evening =>
            'Akşam bulutlu ve serin. Toprak kuruysa bu akşam sula.',
          TimeSlot.night =>
            'Gece yağış beklenmiyor. Sabah erken tarlaya çıkabilirsin.',
        },
      WeatherMessageType.foggy => switch (slot) {
          TimeSlot.morning =>
            'Sabah yoğun sis var. İlaçlama yapma, nem çok yüksek.',
          TimeSlot.afternoon =>
            'Öğleye doğru sis açılıyor. Açıldıktan sonra rüzgar uygunsa ilaçlayabilirsin.',
          TimeSlot.evening =>
            'Akşam pus var. İlaçlamaya uygun değil, sulama yapabilirsin.',
          TimeSlot.night =>
            'Gece nem ve sis yüksek. Tarla işlerini sabaha bırak.',
        },
      WeatherMessageType.drizzle => switch (slot) {
          TimeSlot.morning =>
            'Sabah çisenti var. İlaçlama yapma, yağmur ilacı yıkar.',
          TimeSlot.afternoon =>
            'Öğleden sonra çisenti sürüyor. Toprak ıslanıyor, tarla işlerini ertele.',
          TimeSlot.evening =>
            'Akşam hafif çisenti var. Sulamaya gerek yok, drenaja bir bak.',
          TimeSlot.night =>
            'Gece çisenti sürecek. Sabah toprak nemine bakıp günü planla.',
        },
      WeatherMessageType.rain => switch (slot) {
          TimeSlot.morning =>
            'Sabah yağmur yağıyor. Bugün ilaçlama ve gübreleme yapma.',
          TimeSlot.afternoon =>
            'Öğleden sonra yağmur sürüyor. Tarla işlerini ertele, drenajı kontrol et.',
          TimeSlot.evening =>
            'Akşam yağmur var. Sulama yapma, drenaj kanallarına bak.',
          TimeSlot.night =>
            'Gece yağmur sürecek. Sabah toprak ıslaksa tarlaya girme.',
        },
      WeatherMessageType.heavyRain => switch (slot) {
          TimeSlot.morning =>
            'Sabah şiddetli yağış var. Tarla işlerini iptal et, ekipmanı kapalı yere al.',
          TimeSlot.afternoon =>
            'Öğleden sonra sağanak sürüyor. Drenajı ve setleri kontrol et, taşma riski var.',
          TimeSlot.evening =>
            'Akşam şiddetli yağış var. Su birikmesine bak, hayvanları içeri al.',
          TimeSlot.night =>
            'Gece sağanak sürecek. Sabah ilk iş sel hasarını kontrol et.',
        },
      WeatherMessageType.freezingRain => switch (slot) {
          TimeSlot.morning =>
            'Sabah dondurucu yağmur var. Tarla işlerini iptal et, fideler ve meyve ağaçları risk altında.',
          TimeSlot.afternoon =>
            'Öğleden sonra donma sürüyor. Sera ve örtü altı yapıları kontrol et, çökme riski var.',
          TimeSlot.evening =>
            'Akşam dondurucu yağmur etkili. Hassas bitkileri hemen ört.',
          TimeSlot.night =>
            'Gece buz tabakası oluşacak. Dallar kırılabilir, örtüleri kontrol et.',
        },
      WeatherMessageType.snow => switch (slot) {
          TimeSlot.morning =>
            'Sabah kar yağıyor. Tarla işlerini iptal et, sera ve örtüleri kontrol et.',
          TimeSlot.afternoon =>
            'Öğleden sonra kar sürüyor. Sera çatısındaki karı temizle, çökme riski var.',
          TimeSlot.evening =>
            'Akşam kar etkili. Hayvanları içeri al, su borularını dondan koru.',
          TimeSlot.night =>
            'Gece kar ve don var. Serayı ısıt, hassas ürünleri örtü altına al.',
        },
      WeatherMessageType.thunderstorm => switch (slot) {
          TimeSlot.morning =>
            'Sabah fırtına bekleniyor. Tarla işlerini iptal et, ekipmanı bağla ya da içeri al.',
          TimeSlot.afternoon =>
            'Öğleden sonra fırtına sürüyor. Tarlaya çıkma, hayvanları kapalı alana al.',
          TimeSlot.evening =>
            'Akşam fırtına etkili. Sera ve örtüleri kontrol et, rüzgar koparabilir.',
          TimeSlot.night =>
            'Gece fırtına sürecek. Sabah kırık dal ve devrilen yapılara bak.',
        },
      WeatherMessageType.hail => switch (slot) {
          TimeSlot.morning =>
            'Sabah dolu riski var. Ürünleri dolu filesi ya da örtüyle koru.',
          TimeSlot.afternoon =>
            'Öğleden sonra dolu bekleniyor. Olgun ürün varsa hemen topla.',
          TimeSlot.evening =>
            'Akşam dolu riski var. Sera camlarını ve örtü altı yapıları kontrol et.',
          TimeSlot.night =>
            'Gece dolu bekleniyor. Koruma önlemlerini yatmadan bir kez daha kontrol et.',
        },
      WeatherMessageType.extremeHeat => switch (slot) {
          TimeSlot.morning =>
            'Sabah serinken tarlaya çık. İşi sıcak bastırmadan bitir.',
          TimeSlot.afternoon =>
            'Öğle sıcağında tarlada çalışma. Güneş çarpması riski yüksek.',
          TimeSlot.evening =>
            'Akşam serinliği sulama için en iyi zaman. Gündüz suyun çoğu buharlaşır.',
          TimeSlot.night =>
            'Gece sulama için uygun. Buharlaşma en düşük seviyede.',
        },
      WeatherMessageType.frost => switch (slot) {
          TimeSlot.morning =>
            'Sabah don var. Hassas fideleri ve genç ürünleri hemen ört.',
          TimeSlot.afternoon =>
            'Don etkisi azalıyor. Örtüleri havalandır, akşam yine kapat.',
          TimeSlot.evening =>
            'Bu akşam sıcaklık ${data.temperature.round()}°C ve düşüyor. Koruma önlemlerini şimdi al.',
          TimeSlot.night =>
            'Gece don etkili. Sera ısıtmasını aç, sulama borularını koru.',
        },
      WeatherMessageType.windy => switch (slot) {
          TimeSlot.morning =>
            'Sabah kuvvetli rüzgar var. İlaçlama yapma, ilaç sürüklenir.',
          TimeSlot.afternoon =>
            'Öğleden sonra rüzgar sürüyor. Sera örtülerini ve çitleri kontrol et.',
          TimeSlot.evening =>
            'Akşam rüzgar hâlâ güçlü. Ekipmanı sabitle, sera kapılarını kapat.',
          TimeSlot.night => 'Gece rüzgar sürecek. Sabah hasar kontrolü yap.',
        },
    };
  }

  // ── Şehir Modu: Alt Yazı ──────────────────────────────────────────────────

  static String _citySubtitle(
      WeatherMessageType type, TimeSlot slot, WeatherData data, int temp) {
    final humidity = data.humidity.round();
    final wind = data.windSpeed.round();
    final feels = data.feelsLike.round();
    return switch (type) {
      WeatherMessageType.clear => switch (slot) {
          TimeSlot.morning => wind < 15
              ? 'Şu an $temp°C, nem %$humidity. Rüzgar hafif.'
              : 'Şu an $temp°C, nem %$humidity. Rüzgar $wind km/s.',
          TimeSlot.afternoon =>
            'Şu an $temp°C. Güneş tepede, gözlüğünü unutma.',
          TimeSlot.evening =>
            'Şu an $temp°C. Akşam serinliği başlıyor, ince bir hırka yeter.',
          TimeSlot.night => 'Şu an $temp°C. Açık ve sakin bir gece.',
        },
      WeatherMessageType.partlyCloudy => switch (slot) {
          TimeSlot.morning =>
            'Şu an $temp°C, nem %$humidity. Güneş bulutların arasından çıkıyor.',
          TimeSlot.afternoon =>
            'Şu an $temp°C. Güneş ara ara açıyor, gözlük işine yarar.',
          TimeSlot.evening =>
            'Şu an $temp°C. Akşam serinliği başlıyor, ince bir hırka yeter.',
          TimeSlot.night => 'Şu an $temp°C. Parçalı bulutlu, sakin bir gece.',
        },
      WeatherMessageType.cloudy => switch (slot) {
          TimeSlot.morning =>
            'Şu an $temp°C, hissedilen $feels°C. Nem %$humidity.',
          TimeSlot.afternoon => 'Şu an $temp°C. Güneş yok ama yağmur da yok.',
          TimeSlot.evening =>
            'Şu an $temp°C, hissedilen $feels°C. Serin bir akşam.',
          TimeSlot.night => 'Şu an $temp°C. Kapalı ve sakin bir gece.',
        },
      WeatherMessageType.foggy =>
        'Şu an $temp°C, nem %$humidity. Görüş mesafesi düşük, dikkatli ol.',
      WeatherMessageType.drizzle =>
        'Şu an $temp°C. Hafif çisenti var, şemsiye ya da yağmurluk yeter.',
      WeatherMessageType.rain => data.isRainingNow
          ? 'Şu an $temp°C ve yağmur yağıyor. Şemsiyeni aç.'
          : 'Şu an $temp°C. Yağış ihtimali %${data.precipitationProbability.round()}, şemsiyeni yanına al.',
      WeatherMessageType.heavyRain =>
        'Şu an $temp°C. Şiddetli yağış sürüyor, mümkünse dışarı çıkma.',
      WeatherMessageType.freezingRain =>
        'Şu an $temp°C. Yollar buzlu, dışarı çıkmaktan kaçın.',
      WeatherMessageType.snow => 'Şu an $temp°C. Kar yağıyor, kalın giyin.',
      WeatherMessageType.thunderstorm =>
        'Şu an $temp°C. Fırtına etkili, evde kal ve pencereleri kapat.',
      WeatherMessageType.hail =>
        'Şu an $temp°C. Dolu riski var, sağlam bir yere sığın.',
      WeatherMessageType.extremeHeat =>
        'Şu an $temp°C, hissedilen $feels°C. Bol su iç, güneşte kalma süreni kısalt.',
      WeatherMessageType.frost =>
        'Şu an $temp°C. Don ve buzlanma riski var, yürürken dikkatli ol.',
      WeatherMessageType.windy =>
        'Şu an $temp°C. Rüzgar $wind km/s, uçabilecek eşyalara dikkat.',
    };
  }

  /// Başlık yağış penceresini söylüyor. Alt yazı şu anki kuru durumu ve ilk
  /// yağış saatini verir, "yağış yok" demez.
  static String _citySubtitleWhenRainForecast(
    TimeSlot slot,
    WeatherData data,
    int temp,
    ({String range, DateTime first, DateTime last, int prob}) detail,
  ) {
    final firstStr = _hh(detail.first);
    final humidity = data.humidity.round();
    return switch (slot) {
      TimeSlot.morning =>
        'Şu an $temp°C, nem %$humidity. Yağmur henüz başlamadı, ilk yağış $firstStr civarı.',
      TimeSlot.afternoon =>
        'Şu an $temp°C ve kuru. İlk yağış $firstStr civarı, kısa işleri ondan önce hallet.',
      TimeSlot.evening =>
        'Şu an $temp°C ve kuru. İlk yağış $firstStr civarı, dönüş için şemsiye al.',
      TimeSlot.night =>
        'Şu an $temp°C ve kuru. İlk yağış $firstStr civarı, balkonda eşya kaldıysa içeri al.',
    };
  }

  static String _farmerSubtitleWhenRainForecast(
    WeatherMessageType type,
    TimeSlot slot,
    WeatherData data,
    WeatherDecision decision,
    int temp,
    int wind,
    ({String range, DateTime first, DateTime last, int prob}) detail,
  ) {
    final base = 'Rüzgar $wind km/s. İlk yağış ${_hh(detail.first)} civarı. ';
    return switch (type) {
      WeatherMessageType.clear ||
      WeatherMessageType.partlyCloudy =>
        '${base}İlaçlamayı yağıştan en az 4 saat önce bitir.',
      WeatherMessageType.cloudy => decision.shouldIrrigate
          ? '${base}Sulamayı yağıştan sonraya bırak.'
          : '${base}Yağıştan önce drenajı kontrol et.',
      WeatherMessageType.foggy => '${base}Sis açılmadan ilaçlama yapma.',
      WeatherMessageType.drizzle ||
      WeatherMessageType.rain ||
      WeatherMessageType.heavyRain =>
        '${base}Drenajı kontrol et, sulamaya gerek yok.',
      WeatherMessageType.freezingRain ||
      WeatherMessageType.snow ||
      WeatherMessageType.frost =>
        '${base}Bitkileri ört, yollara dikkat et.',
      WeatherMessageType.thunderstorm ||
      WeatherMessageType.hail =>
        '${base}Açık alandaki işi bırak, ekipmanı koru.',
      WeatherMessageType.extremeHeat =>
        '${base}Öğle sıcağında tarla işini kısa tut.',
      WeatherMessageType.windy =>
        '${base}İlaçlama yapma, rüzgar ilacı sürükler.',
    };
  }

  // ── Çiftçi Modu: Alt Yazı ─────────────────────────────────────────────────

  static String _farmerSubtitle(WeatherMessageType type, TimeSlot slot,
      WeatherData data, WeatherDecision decision, int temp, int wind) {
    final humidity = data.humidity.round();
    return switch (type) {
      WeatherMessageType.clear ||
      WeatherMessageType.partlyCloudy =>
        decision.canSpray
            ? 'Rüzgar $wind km/s, nem %$humidity. İlaçlama için uygun.'
            : decision.shouldIrrigate
                ? 'Toprak nemi düşük. Akşam serinliğinde sulayabilirsin.'
                : 'Rüzgar $wind km/s. İlaçlama için sınırda, rutin bakım için uygun.',
      WeatherMessageType.cloudy => decision.shouldIrrigate
          ? 'Toprak nemi düşük. Sulama planlıyorsan bugün uygun.'
          : 'Toprak nemi yeterli. Sulamayı erteleyebilirsin.',
      WeatherMessageType.foggy =>
        'Nem %$humidity. İlaçlama yapma, sis açılana kadar bekle.',
      WeatherMessageType.drizzle ||
      WeatherMessageType.rain =>
        'Drenajı kontrol et. Yağış bitince toprak nemine bak.',
      WeatherMessageType.heavyRain => decision.hasCriticalAlert
          ? 'Drenaj kanallarını kontrol et, ekipmanı kapalı yere al.'
          : 'Drenajı kontrol et. Tarlada su birikmesine dikkat.',
      WeatherMessageType.freezingRain =>
        'Şu an $temp°C. Bitkileri hemen koru, sera ısıtmasını aç.',
      WeatherMessageType.snow =>
        'Şu an $temp°C. Serayı kapat, hassas fideleri ört.',
      WeatherMessageType.thunderstorm =>
        'Tarlaya çıkma. Sulama pompalarını kapat, jeneratörü hazırla.',
      WeatherMessageType.hail =>
        'Dolu filesi ya da örtü kur. Olgun ürünü hemen topla.',
      WeatherMessageType.extremeHeat =>
        'Şu an $temp°C. Erken saatte çalış, öğle arasını uzun tut, akşam sula.',
      WeatherMessageType.frost =>
        'Şu an $temp°C. Fideleri çift kat ört, sabah sulama yapma.',
      WeatherMessageType.windy =>
        'Rüzgar $wind km/s. İlaçlama yapma, ilaç sürüklenir.',
    };
  }

  // ── Şehir Modu: Önemli Notlar ─────────────────────────────────────────────

  /// Notlar "yağmur yok" iddiası taşımaz. Yağış bilgisi başlıkta ve
  /// rainSummary'de, burada çelişki çıkmasın.
  static String _cityNotes(
      WeatherMessageType type, TimeSlot slot, WeatherData data) {
    return switch (type) {
      WeatherMessageType.clear => switch (slot) {
          TimeSlot.morning =>
            'Hava güzel. Güneş kremi sür, suyunu yanına al.',
          TimeSlot.afternoon =>
            'UV yüksek olabilir. 12:00–15:00 arası güneşte kalma süreni kısalt. Şapka ve güneş kremi kullan.',
          TimeSlot.evening =>
            'Hava sakin. Dışarıda yemek, yürüyüş ya da bisiklet için uygun.',
          TimeSlot.night => 'Gece sürpriz yok. Hava sakin, uyku için uygun.',
        },
      WeatherMessageType.partlyCloudy => switch (slot) {
          TimeSlot.morning =>
            'Hava genel olarak güzel. Günlük planlarını rahat yapabilirsin.',
          TimeSlot.afternoon =>
            'Güneş ara ara çıkıyor. Uzun süre dışarıdaysan güneş kremi ve su yanında olsun.',
          TimeSlot.evening => 'Akşam serin olabilir. İnce bir hırka al.',
          TimeSlot.night =>
            'Gece sakin geçecek. Ekstra bir dram yok, rahat uyu.',
        },
      WeatherMessageType.cloudy => switch (slot) {
          TimeSlot.morning =>
            'Hava kapalı ve serin. Üşümemek için ince bir kat ekle.',
          TimeSlot.afternoon =>
            'Güneş az, hava serin. Uzun süre dışarıdaysan bir kat fazla al.',
          TimeSlot.evening =>
            'Akşam biraz daha serinleyebilir. Kalın bir hırka iyi olur.',
          TimeSlot.night => 'Gece sakin. Endişelenecek bir durum yok.',
        },
      WeatherMessageType.foggy => switch (slot) {
          TimeSlot.morning =>
            'Görüş mesafesi çok düşük olabilir. Araçta sis farlarını aç, hızını düşür. Yürürken açık renkli giyin.',
          TimeSlot.afternoon =>
            'Sis genelde öğleye doğru dağılır. Trafikte yine de dikkatli ol.',
          TimeSlot.evening =>
            'Akşam yeniden puslanabilir. Yürüyeceksen parlak ya da reflektörlü bir şey giy.',
          TimeSlot.night =>
            'Görüş çok sınırlı. Araç kullanman gerekiyorsa sis farlarını aç, yavaş git.',
        },
      WeatherMessageType.drizzle => switch (slot) {
          TimeSlot.morning =>
            'Hafif yağış var. Şemsiye ya da yağmurluk yeter. Yollar kaygan olabilir, dikkatli yürü.',
          TimeSlot.afternoon =>
            'Çisenti planlarını pek bozmaz. Yağmurluğun yanında olsun.',
          TimeSlot.evening =>
            'Çisenti hafifliyorsa çıkmak sorun değil. Yine de bir yağmurluk al.',
          TimeSlot.night =>
            'Hafif çisenti sabaha kadar sürebilir. Açık pencere varsa kapat.',
        },
      WeatherMessageType.rain => switch (slot) {
          TimeSlot.morning =>
            'Yağmur sürüyor. Şemsiye ve su geçirmez ayakkabı şart. Trafikte mesafeyi aç, fren mesafesi uzar.',
          TimeSlot.afternoon =>
            'Yağmur dinmezse dışarı planını ertele ya da kapalı mekan seç. Kapalı otopark daha iyi.',
          TimeSlot.evening =>
            'Islak zeminde dikkatli yürü. Kaymayan tabanlı ayakkabı giy.',
          TimeSlot.night =>
            'Gece yağmurda araç kullanacaksan silecekleri ve farları kontrol et.',
        },
      WeatherMessageType.heavyRain => switch (slot) {
          TimeSlot.morning =>
            'Alt geçitler ve çukur yerlerde su birikebilir. Araçla su birikintisine girme. Mümkünse evde kal.',
          TimeSlot.afternoon =>
            'Sağanak sürerken trafiğe çıkma. Bodrum ve zemin katı kontrol et, su sızabilir.',
          TimeSlot.evening =>
            'Dışarıdaki çamaşır, saksı ve eşyaları içeri al. Pencere ve balkon kapılarını kapat.',
          TimeSlot.night =>
            'Sel uyarılarını takip et. Telefonun şarjlı olsun.',
        },
      WeatherMessageType.freezingRain => switch (slot) {
          TimeSlot.morning =>
            'Yollar ve kaldırımlar buz kaplı olabilir. Çıkman gerekiyorsa kaymaz tabanlı ayakkabı giy, adımlarını kısa tut.',
          TimeSlot.afternoon =>
            'Araçta kış lastiği yoksa yola çıkma. Buzda fren mesafesi kat kat uzar.',
          TimeSlot.evening =>
            'Mümkünse evde kal. Buzlu zeminde en dikkatli adım bile kayabilir.',
          TimeSlot.night =>
            'Sabah yollar buzlu olacak. Erken çıkacaksan aracı önceden çalıştırıp camları temizle.',
        },
      WeatherMessageType.snow => switch (slot) {
          TimeSlot.morning =>
            'Kalın mont, bere, eldiven ve atkı giy. Yollar buzlu olabilir, yavaş yürü.',
          TimeSlot.afternoon =>
            'Araçta yakıt, battaniye ve fener bulunsun. Kış lastiği şart, zinciri kontrol et.',
          TimeSlot.evening =>
            'Evde sıcak kal. Dışarıdaki boru ve muslukları dondan koru.',
          TimeSlot.night =>
            'Sabah kar temizliği gerekecek. Kürek ve tuzu hazırla, el fenerini el altında tut.',
        },
      WeatherMessageType.thunderstorm => switch (slot) {
          TimeSlot.morning =>
            'Yıldırım riski var. Açık alanlardan uzak dur. Gerekmeyen cihazları fişten çek.',
          TimeSlot.afternoon =>
            'Ağaç altında bekleme, yüksek yerlere çıkma. Araçtaysan araçta kal.',
          TimeSlot.evening =>
            'Balkon ve bahçedeki uçabilecek eşyaları içeri al. Pencereleri kapat.',
          TimeSlot.night =>
            'Elektrik kesilebilir. El feneri ve şarjlı bir batarya hazır olsun. Fırtına geçene kadar evde kal.',
        },
      WeatherMessageType.hail => switch (slot) {
          TimeSlot.morning =>
            'Dolu araçlara ciddi hasar verir. Kapalı otopark kullan. Dışarıdaysan hemen bir binaya gir.',
          TimeSlot.afternoon =>
            'Dolu sırasında ağaç altına sığınma, dallar kırılabilir. Sağlam bir bina bul.',
          TimeSlot.evening =>
            'Araç ve eşyaların dışarıdaysa içeri al. Cam kırılma riski var.',
          TimeSlot.night =>
            'Araç dışarıdaysa kalın bir battaniye ya da örtüyle koru. Sabah hasara bak.',
        },
      WeatherMessageType.extremeHeat => switch (slot) {
          TimeSlot.morning =>
            'Sıcaklık ${data.temperature.round()}°C ve artıyor. Güneş kremi, şapka ve bol su şart. Yaşlı ve çocuk yakınlarını kontrol et.',
          TimeSlot.afternoon =>
            'Güneş çarpması riski yüksek. Gölgede kal, 20 dakikada bir su iç. Açık havada spor yapma.',
          TimeSlot.evening =>
            'Asfalt hâlâ sıcak. Köpeğini yürüteceksen patilerini düşün. Bol su iç, hafif giyin.',
          TimeSlot.night =>
            'Gece de serinlemek zor. Odayı havalandır, yatmadan su iç.',
        },
      WeatherMessageType.frost => switch (slot) {
          TimeSlot.morning =>
            'Kaldırım ve köprüler buzlu olabilir. Camlar buzluysa kazıyıcı kullan. Yaşlı yakınlarına dikkatli olmalarını hatırlat.',
          TimeSlot.afternoon =>
            'Don güneşle çözülür ama gölgede buz kalır. Araçta antifrizi kontrol et.',
          TimeSlot.evening =>
            'Gece daha da soğuyacak. Mont, eldiven, atkı ve bere giy. Dış muslukları kapat.',
          TimeSlot.night =>
            'Borular donmasın diye musluğu hafif açık bırak ya da izole et. Soba ve kombi güvenliğini kontrol et.',
        },
      WeatherMessageType.windy => switch (slot) {
          TimeSlot.morning =>
            'Rüzgar ${data.windSpeed.round()} km/s. Şapkan uçabilir. Bisiklet ve motosikletle çıkmamaya çalış.',
          TimeSlot.afternoon =>
            'Ağaç altında bekleme, dal kırılabilir. İnşaat alanlarından uzak dur.',
          TimeSlot.evening =>
            'Balkondaki saksı, şemsiye ve hafif mobilyaları sabitle.',
          TimeSlot.night =>
            'Pencerelerin kapalı olduğundan emin ol. Gece uğultu olabilir, bu normal.',
        },
    };
  }

  // ── Çiftçi Modu: Önemli Notlar ────────────────────────────────────────────

  static String _farmerNotes(WeatherMessageType type, TimeSlot slot,
      WeatherData data, WeatherDecision decision) {
    final spray = decision.canSpray;
    return switch (type) {
      WeatherMessageType.clear => switch (slot) {
          TimeSlot.morning => spray
              ? 'İlaçlama için koşullar uygun. Sabah erken başla, öğle sıcağında ara ver.'
              : 'İlaçlama koşulları sınırda. Rüzgar düşene kadar bekle, rutin işlere geç.',
          TimeSlot.afternoon =>
            'Toprak hızla su kaybediyor. Sulamayı akşam serinliğine bırak, öğle sulamasında suyun çoğu boşa gider.',
          TimeSlot.evening =>
            'Akşam sulaması için uygun. Toprak kuruysa bu akşam sula.',
          TimeSlot.night =>
            'Gece sorun beklenmiyor. Sabah erken tarlaya çıkmayı planla.',
        },
      WeatherMessageType.partlyCloudy => switch (slot) {
          TimeSlot.morning => spray
              ? 'Bulutlar güneşi kesiyor ama ilaçlamaya engel değil. Rüzgara bak, sabah erken başla.'
              : 'İlaçlama koşulları sınırda. Rüzgarı ve nemi tekrar kontrol et.',
          TimeSlot.afternoon =>
            'Toprak nemi normalse sulamayı erteleyebilirsin. Bulutlar buharlaşmayı azaltıyor.',
          TimeSlot.evening =>
            'Akşam sulaması verimli olur. Buharlaşma düşük.',
          TimeSlot.night =>
            'Sabaha kadar sorun beklenmiyor. Erken saatte işe başlayabilirsin.',
        },
      WeatherMessageType.cloudy => switch (slot) {
          TimeSlot.morning => spray
              ? 'Kapalı hava ilaçlama için kötü değil. Buharlaşma düşük, ilaç daha uzun etkili kalır. Önce rüzgara bak.'
              : 'İlaçlama koşulları sınırda. Rüzgarı ve nemi kontrol etmeden başlama.',
          TimeSlot.afternoon =>
            'Bulutlu havada toprak yavaş kurur. Sulama acil değilse akşama bırak.',
          TimeSlot.evening =>
            'Toprak nemini elle kontrol et. Kuruysa bu akşam sula.',
          TimeSlot.night =>
            'Sabah erken işe başlamak için koşullar uygun görünüyor.',
        },
      WeatherMessageType.foggy => switch (slot) {
          TimeSlot.morning =>
            'Sis varken ilaçlama yapma. Nem %90 üstündeyse ilaç tutmaz, damla yapar. Sis açılana kadar bekle.',
          TimeSlot.afternoon =>
            'Sis kalktıysa ve rüzgar uygunsa ilaçlayabilirsin. Toprak nemine de bak.',
          TimeSlot.evening =>
            'Yüksek nem mantar hastalığı riskini artırır. Yaprakları kontrol et.',
          TimeSlot.night =>
            'Gece nemi ve sis mantar riskini artırır. Sabah tarlayı gez.',
        },
      WeatherMessageType.drizzle => switch (slot) {
          TimeSlot.morning =>
            'Çisenti varken ilaçlama yapma, ilaç yıkanır. Yağış durunca en az 2 saat bekle.',
          TimeSlot.afternoon =>
            'Toprak ıslak. Traktörle tarlaya girme, toprak sıkışır.',
          TimeSlot.evening =>
            'Sulamaya gerek yok, yağış toprağı nemlendiriyor. Drenaj kanallarına bak.',
          TimeSlot.night =>
            'Sabah toprak nemini ölç. Günü buna göre planla.',
        },
      WeatherMessageType.rain => switch (slot) {
          TimeSlot.morning =>
            'Yağmurda ilaçlama ve gübreleme yapma. İlaç yıkanır, gübre akar. Yağış bitince en az 4 saat bekle.',
          TimeSlot.afternoon =>
            'Toprak ıslak. Ağır ekipmanla girme, toprak sıkışır ve köklere zarar verir.',
          TimeSlot.evening =>
            'Drenaj kanallarını kontrol et, su birikiyorsa tahliye et. Sulamaya hiç gerek yok.',
          TimeSlot.night =>
            'Sabah toprak çok ıslaksa 24–48 saat bekle. Kuruyunca tarlaya gir.',
        },
      WeatherMessageType.heavyRain => switch (slot) {
          TimeSlot.morning =>
            'Şiddetli yağışta tarlaya girme. Drenajları aç, tıkanıklığı gider. Ekipmanı kapalı yere al.',
          TimeSlot.afternoon =>
            'Toprak doymuş durumda. Yağıştan sonra en az 48 saat tarlaya girme. Sel riski olan yerlere bak.',
          TimeSlot.evening =>
            'Tarlada su baskını var mı kontrol et. Sera ve örtü altını gez. Hayvanları içeri al.',
          TimeSlot.night =>
            'Gerekirse gece drenaja bak. Sabah erozyon ve kök çürümesi için hasar tespiti yap.',
        },
      WeatherMessageType.freezingRain => switch (slot) {
          TimeSlot.morning =>
            'Dondurucu yağmur bitkiyi öldürebilir. Fideleri ve meyve ağaçlarını hemen ört. Sulama yapma.',
          TimeSlot.afternoon =>
            'Sera ve tünelde biriken buz çökmeye yol açabilir. Üstlerini temizle.',
          TimeSlot.evening =>
            'Hassas bitkileri örtü altına al. Sera ısıtmasını çalıştır.',
          TimeSlot.night =>
            'Dal kırılma riski var. Ağaç altından geçme, sabah hasara bak.',
        },
      WeatherMessageType.snow => switch (slot) {
          TimeSlot.morning =>
            'Kar ve don birlikte geliyor. Fidelere çift kat örtü kur. Sulama borularını kapat.',
          TimeSlot.afternoon =>
            'Sera çatısında kar birikiyorsa temizle, ağırlık çökertir. İç sıcaklığı kontrol et.',
          TimeSlot.evening =>
            'Hayvanları içeri al, su kaplarındaki buzu kır. Dış muslukları kapat.',
          TimeSlot.night =>
            'Sera ısıtmasını çalıştır. Sabah don hasarına bak.',
        },
      WeatherMessageType.thunderstorm => switch (slot) {
          TimeSlot.morning =>
            'Yıldırım tarlada çok tehlikeli. Açık alanda durma. Sulama pompalarını kapat, jeneratörü hazırla.',
          TimeSlot.afternoon =>
            'Ekipmanı kapalı yere al ya da sıkıca bağla. Sera örtülerini kontrol et, rüzgar koparabilir.',
          TimeSlot.evening =>
            'Hayvanları içeri al. Sera kapılarını kapat, mümkünse içten destekle.',
          TimeSlot.night =>
            'Sabah tarlayı, serayı ve ekipmanı gez. Hasar varsa sigortana bildir.',
        },
      WeatherMessageType.hail => switch (slot) {
          TimeSlot.morning =>
            'Dolu ürünü tamamen yok edebilir. Dolu filesi ya da kalın örtüyü hemen kur. Olgun ürünü topla.',
          TimeSlot.afternoon =>
            'Sera camı kırılabilir, mümkünse içten destekle. Meyve ağaçlarına file ger.',
          TimeSlot.evening =>
            'Koruma önlemlerini son kez kontrol et. Hasar olursa sigortaya hemen bildir.',
          TimeSlot.night =>
            'Sabah erken hasara bak. Kırık dalları kes, yaraları ilaçla.',
        },
      WeatherMessageType.extremeHeat => switch (slot) {
          TimeSlot.morning =>
            '06:00–10:00 arası çalış, sonra mola ver. Bol su iç, gölgede dinlen. Hayvanların suyunu kontrol et.',
          TimeSlot.afternoon =>
            '11:00–16:00 arası tarlaya çıkma. Baş dönmesi ya da mide bulantısı varsa hemen gölgeye geç, su iç.',
          TimeSlot.evening =>
            'Akşam sulaması ideal. Toprak nemi gece boyunca tutar. Damla sulama daha verimli.',
          TimeSlot.night =>
            'Gece sulamada buharlaşma en düşük. Meyve ağaçlarını ve fideleri bol sula.',
        },
      WeatherMessageType.frost => switch (slot) {
          TimeSlot.morning =>
            'Sabah sulama yapma, donan su köke zarar verir. Don çözülene kadar bekle, genelde 09:00–10:00. Fidelere çift kat örtü koy.',
          TimeSlot.afternoon =>
            'Don kalktıysa örtüleri açıp havalandır. Bitki nefes alsın, akşam yine kapat.',
          TimeSlot.evening =>
            'Geceye hazırlan. Örtüleri kapat, sera kapılarını sıkıca kapa, ısıtmayı aç. Sulama borularını boşalt.',
          TimeSlot.night =>
            'Sera içini izle. 2°C altına inerse ek ısıtıcıyı devreye al.',
        },
      WeatherMessageType.windy => switch (slot) {
          TimeSlot.morning =>
            'İlaçlama yapma. Rüzgar ${data.windSpeed.round()} km/s, ilaç sürüklenir ve komşu tarlaya gider.',
          TimeSlot.afternoon =>
            'Sera örtülerini kontrol et, klips ve bağlantıları sıkıştır. Toz kalkıyorsa hayvanları içeri al.',
          TimeSlot.evening =>
            'Rüzgar hâlâ güçlüyse ilaçlamayı yarına bırak. Ekipmanı bağla.',
          TimeSlot.night =>
            'Sabah sera ve tarlada hasar var mı bak. Kırık dalları temizle.',
        },
    };
  }

  // ── Yarın: Şehir Başlık ───────────────────────────────────────────────────

  static String _tomorrowCityHeadline(WeatherMessageType type, DailyEntry d) {
    return switch (type) {
      WeatherMessageType.clear =>
        'Yarın güneşli. Plan yapmak için iyi bir gün.',
      WeatherMessageType.partlyCloudy =>
        'Yarın parçalı bulutlu. Güneş ara ara açacak, yağış beklenmiyor.',
      WeatherMessageType.cloudy =>
        'Yarın kapalı ama yağış ihtimali düşük. İnce bir ceket al.',
      WeatherMessageType.foggy =>
        'Yarın sabah sis bekleniyor. Araçla çıkacaksan yavaş git.',
      WeatherMessageType.drizzle =>
        'Yarın hafif çisenti bekleniyor. Şemsiye ya da yağmurluk yanında olsun.',
      WeatherMessageType.rain =>
        'Yarın yağmur bekleniyor. Şemsiyeni şimdiden kapının yanına koy.',
      WeatherMessageType.heavyRain =>
        'Yarın şiddetli yağış bekleniyor. Mümkünse dışarı planlarını ertele.',
      WeatherMessageType.freezingRain =>
        'Yarın dondurucu yağmur bekleniyor. Yollar çok kaygan olacak, araç kullanmamaya çalış.',
      WeatherMessageType.snow =>
        'Yarın kar bekleniyor. Kalın giyin, kış hazırlığını bu akşam tamamla.',
      WeatherMessageType.thunderstorm =>
        'Yarın gök gürültülü fırtına bekleniyor. Dışarı planlarını ertele.',
      WeatherMessageType.hail =>
        'Yarın dolu riski var. Aracını kapalı yere al, dışarıda eşya bırakma.',
      WeatherMessageType.extremeHeat =>
        'Yarın kavurucu sıcak var, en yüksek ${d.tempMax.round()}°C. Öğle saatlerinde güneşte kalma.',
      WeatherMessageType.frost =>
        'Yarın sabah don riski var, en düşük ${d.tempMin.round()}°C. Yollarda buzlanmaya dikkat et.',
      WeatherMessageType.windy =>
        'Yarın kuvvetli rüzgar bekleniyor. Hafif eşyalarına ve şapkana dikkat et.',
    };
  }

  // ── Yarın: Çiftçi Başlık ──────────────────────────────────────────────────

  static String _tomorrowFarmerHeadline(WeatherMessageType type, DailyEntry d) {
    return switch (type) {
      WeatherMessageType.clear => d.windSpeedMax < 15
          ? 'Yarın güneşli ve rüzgar hafif. İlaçlama, sulama ve tarla işleri için uygun.'
          : 'Yarın güneşli, rüzgar en fazla ${d.windSpeedMax.round()} km/s. İlaçlamayı sakin bir saate bırak.',
      WeatherMessageType.partlyCloudy =>
        'Yarın parçalı bulutlu. İlaçlama yapabilirsin, önce rüzgara bak.',
      WeatherMessageType.cloudy =>
        'Yarın kapalı ve kuru. İlaçlama uygunsa yapabilirsin, sulama ihtiyacına bak.',
      WeatherMessageType.foggy =>
        'Yarın sabah sis bekleniyor. Sis kalkmadan ilaçlama yapma.',
      WeatherMessageType.drizzle =>
        'Yarın çisenti bekleniyor. İlaçlama ve gübrelemeyi kuru bir güne bırak.',
      WeatherMessageType.rain =>
        'Yarın yağış bekleniyor. İlaçlama ve sulamayı ertele.',
      WeatherMessageType.heavyRain =>
        'Yarın şiddetli yağış bekleniyor. Tarla işlerini ertele.',
      WeatherMessageType.freezingRain =>
        'Yarın dondurucu yağmur var. Fideleri ve meyve ağaçlarını bu akşam koru.',
      WeatherMessageType.snow =>
        'Yarın kar bekleniyor. Sera ve örtüleri kontrol et, hayvanları içeri al.',
      WeatherMessageType.thunderstorm =>
        'Yarın fırtına bekleniyor. Tarla işlerini iptal et, ekipmanı koru.',
      WeatherMessageType.hail =>
        'Yarın dolu riski var. Ürünleri dolu filesiyle koru, olgun ürünü hemen topla.',
      WeatherMessageType.extremeHeat =>
        'Yarın çok sıcak, en yüksek ${d.tempMax.round()}°C. Erken saatte çalış, öğle arasını uzun tut.',
      WeatherMessageType.frost =>
        'Yarın sabah don riski var, en düşük ${d.tempMin.round()}°C. Hassas fideleri bu akşam ört.',
      WeatherMessageType.windy =>
        'Yarın kuvvetli rüzgar bekleniyor. İlaçlama yapma, sera örtülerini kontrol et.',
    };
  }

  // ── Yarın: Şehir Önemli Notlar ────────────────────────────────────────────

  static String _tomorrowCityNotes(
      WeatherMessageType type, DailyEntry d, List<HourlyEntry> hours) {
    // Başlıkla aynı pencere hesabı, metinler tutarlı kalsın.
    final rainDetail = _rainWindowDetails(hours);
    final rainText = rainDetail == null
        ? null
        : 'Yarın ${_rainWhen(rainDetail.range)} yağmur bekleniyor.';

    final base = switch (type) {
      WeatherMessageType.clear =>
        'Yağmur beklenmiyor. Uzun dışarı planları için uygun. Güneş kremi ve su unutma.',
      WeatherMessageType.partlyCloudy =>
        'Hafif bir ceket yeter. Gün boyu dışarıda olabilirsin.',
      WeatherMessageType.cloudy =>
        'Güneş az görünecek. Kapalı ama kuru bir gün.',
      WeatherMessageType.foggy =>
        'Sis genelde öğleye doğru açılır. Sabah trafiğinde dikkatli ol.',
      WeatherMessageType.drizzle =>
        'Şiddetli değil ama yollar ve kaldırımlar ıslak olacak.',
      WeatherMessageType.rain =>
        'Dışarı planını yağışsız saatlere kaydır. Islak yolda dikkatli ol.',
      WeatherMessageType.heavyRain =>
        'Sel ve su baskını riski var. Alt geçitlerden uzak dur, kapalı otopark kullan.',
      WeatherMessageType.freezingRain =>
        'Buzlanma çok tehlikeli. Kış lastiği ve zincir şart. Mümkünse evde kal.',
      WeatherMessageType.snow =>
        'Yollar karla kaplı olabilir. Kış lastiğini, yakıtı ve erzakı kontrol et.',
      WeatherMessageType.thunderstorm =>
        'Yıldırım ve kuvvetli rüzgar riski var. Gerekmeyen cihazları fişten çek.',
      WeatherMessageType.hail =>
        'Dolu ciddi hasar verebilir. Camları ve aracını koru.',
      WeatherMessageType.extremeHeat =>
        'Bol su iç, güneş kremi ve şapka kullan. 11:00–16:00 arası dışarıyı sınırla.',
      WeatherMessageType.frost =>
        'Sabah erken çıkacaksan aracı önceden ısıt. Dış muslukları koru.',
      WeatherMessageType.windy =>
        'Bisiklet ve motosikletle çıkmamaya çalış. Balkondaki eşyaları sabitle.',
    };
    if (rainText == null) return base;
    // Kuru tipte saatlik yağış varsa "yağmur yok" notu yerine pencereyi söyle.
    if (type == WeatherMessageType.clear ||
        type == WeatherMessageType.partlyCloudy ||
        type == WeatherMessageType.cloudy) {
      return '$rainText Şemsiyeni yanına al, kalan saatler kuru görünüyor.';
    }
    return '$rainText $base';
  }

  // ── Yarın: Çiftçi Önemli Notlar ───────────────────────────────────────────

  static String _tomorrowFarmerNotes(
      WeatherMessageType type, DailyEntry d, List<HourlyEntry> hours) {
    // Başlıkla aynı eşik (ihtimal >= 50 veya yağış > 0).
    final rainDetail = _rainWindowDetails(hours);
    final rainText = rainDetail == null
        ? null
        : 'Yarın ${_rainWhen(rainDetail.range)} yağış bekleniyor.';

    final base = switch (type) {
      WeatherMessageType.clear => d.windSpeedMax < 15
          ? 'Rüzgar hafif, yağış yok. Sabah erken ilaçla, akşam sula.'
          : 'Yağış yok ama rüzgar ${d.windSpeedMax.round()} km/s. İlaçlamayı rüzgarın düştüğü saate bırak.',
      WeatherMessageType.partlyCloudy =>
        'Bulutlar buharlaşmayı azaltır. Sulama verimli olur.',
      WeatherMessageType.cloudy =>
        'Kapalı havada buharlaşma az. Sulama acil değilse ertele.',
      WeatherMessageType.foggy =>
        'Nem çok yüksek. Mantar hastalığı riski artar, yaprakları kontrol et.',
      WeatherMessageType.drizzle =>
        'Toprak nem alacak, sulamaya gerek yok. Yağış bitince 2 saat bekle.',
      WeatherMessageType.rain =>
        'Tarlaya girme, toprak ıslak olacak. Drenajı kontrol et.',
      WeatherMessageType.heavyRain =>
        'Drenajı ve setleri kontrol et, sel riski var. Ekipmanı kapalı yere al.',
      WeatherMessageType.freezingRain =>
        'Dallar buz yüküyle kırılabilir, destek koy. Sera ısıtmasını aç.',
      WeatherMessageType.snow =>
        'Kar yükü sera çatısını çökertebilir, temizle. Sulama borularını koru.',
      WeatherMessageType.thunderstorm =>
        'Yıldırım ve kuvvetli rüzgar riski var. Sulama pompalarını kapat, jeneratörü hazırla.',
      WeatherMessageType.hail =>
        'Dolu hasadı yok edebilir. Acil hasat ve koruma önlemi al, sigorta bilgilerini hazırla.',
      WeatherMessageType.extremeHeat =>
        '06:00–10:00 arası çalış, 11:00–16:00 arası ara ver. Akşam sula, gündüz sulamada su boşa gider.',
      WeatherMessageType.frost =>
        'Sabah sulama yapma, donan su köke zarar verir. Don çözülene kadar bekle.',
      WeatherMessageType.windy =>
        'İlaç sürüklenme riski var. Ekipmanı sabitle, hafif yapıları güçlendir.',
    };
    if (rainText == null) return base;
    if (type == WeatherMessageType.clear ||
        type == WeatherMessageType.partlyCloudy ||
        type == WeatherMessageType.cloudy) {
      return '$rainText İlaçlamayı yağıştan en az 4 saat önce bitir.';
    }
    return '$rainText $base';
  }
}
