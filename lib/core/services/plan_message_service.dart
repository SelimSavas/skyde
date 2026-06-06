import '../models/action_plan.dart';
import '../models/user_preferences.dart';
import '../models/weather_data.dart';
import '../utils/decision_engine.dart';
import 'daily_task_service.dart';

/// Plan + saatlik hava + ulaşım için metin üretimi.
/// Ton: `MESSAGE_TONE.md` — net, bağlam kuran; kritikte mizah yok.
class PlanMessageService {
  PlanMessageService._();

  static String evaluatePlan(
    ActionPlanDetail plan,
    PlanScope scope,
    WeatherData data,
    WeatherDecision decision,
    UserMode mode,
  ) {
    final scopeKey = switch (scope) {
      PlanScope.today => 'today',
      PlanScope.tomorrow => 'tomorrow',
      PlanScope.weekly => 'weekly',
    };
    final rainWindow =
        scope == PlanScope.weekly ? null : DailyTaskService.rainWindowForScope(scopeKey, data);

    final h = _hourlyForPlan(plan, scope, data);
    final double rainRisk =
        (h?.precipProbability ?? data.precipitationProbability).toDouble();
    final wind = data.windSpeed;
    final temp = h?.temperature ?? data.temperature;
    final weatherCode = h?.weatherCode ?? data.weatherCode;

    final hourLabel = _hm(plan.startMinute);

    // Kritik çiftçi kuralı — tek cümle, net
    final farmerBlock = _farmerHardBlock(plan, data, wind, temp, h);
    if (farmerBlock != null) return farmerBlock;

    final narrative = _taskNarrative(
      plan.taskId,
      plan.taskLabel,
      scope,
      data,
      rainWindow: rainWindow,
    );

    final logistics = StringBuffer();
    logistics.write('$hourLabel civarında ');

    if (rainRisk >= 60) {
      logistics.write('yağış ihtimali belirgin; ');
    } else if (rainRisk >= 35) {
      logistics.write('yağış ihtimali orta; ');
    } else {
      logistics.write('hava görece daha sakin görünüyor; ');
    }

    _appendTransport(plan, logistics, rainRisk, wind, weatherCode);
    _appendOutdoor(plan, logistics, temp, weatherCode);
    _appendFarmerSoft(plan, logistics, data, decision, mode, rainRisk, wind);

    final tail = _recommendationTail(rainRisk, plan);

    return '${plan.taskLabel}: $narrative ${logistics.toString().trim()} $tail'
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();
  }

  /// Kart gövdesi: başlıkta zaten [taskLabel] olduğu için tekrar etmeden metin.
  static String evaluatePlanSubtitle(
    ActionPlanDetail plan,
    PlanScope scope,
    WeatherData data,
    WeatherDecision decision,
    UserMode mode,
  ) {
    final full = evaluatePlan(plan, scope, data, decision, mode);
    final prefix = '${plan.taskLabel}: ';
    if (full.startsWith(prefix)) {
      return full.substring(prefix.length).trim();
    }
    return full;
  }

  /// Gün içi dakika → `09:00` biçimi.
  static String formatMinuteOfDay(int minute) =>
      '${(minute ~/ 60).toString().padLeft(2, '0')}:${(minute % 60).toString().padLeft(2, '0')}';

  /// Başlangıç ve varsa bitiş: `09:00` veya `09:00–10:30`.
  static String formatPlanTimeRange(ActionPlanDetail plan) {
    final s = formatMinuteOfDay(plan.startMinute);
    final e = plan.endMinute;
    if (e == null || e == plan.startMinute) return s;
    return '$s–${formatMinuteOfDay(e)}';
  }

  /// Bildirim: kısa başlık + gövde (ton dengeli, emoji yok).
  static ({String title, String body, int priority})? notificationForPlan({
    required ActionPlanDetail plan,
    required PlanScope scope,
    required WeatherData data,
    required UserMode mode,
    required String userName,
  }) {
    final h = _hourlyForPlan(plan, scope, data);
    final double rainRisk =
        (h?.precipProbability ?? data.precipitationProbability).toDouble();
    final wind = data.windSpeed;
    final temp = h?.temperature ?? data.temperature;
    final weatherCode = h?.weatherCode ?? data.weatherCode;

    final farmerBlock = _farmerHardBlock(plan, data, wind, temp, h);
    if (farmerBlock != null) {
      return (
        title: userName.isEmpty ? 'Plan uyarısı' : '$userName, plan uyarısı',
        body: farmerBlock,
        priority: 100,
      );
    }

    var priority = 0;
    if (plan.taskId == 'farmer_spray' && wind > 12) priority = 85;
    if (weatherCode >= 95 || data.messageType == WeatherMessageType.hail) {
      priority = 95;
    }
    if (rainRisk >= 70 && (plan.outdoor != OutdoorLevel.no)) priority += 40;
    if (plan.transport == TransportType.bicycle && (wind >= 25 || rainRisk >= 50)) {
      priority += 35;
    }
    if (plan.transport == TransportType.walking && rainRisk >= 55) priority += 30;
    if (temp >= 36 && plan.outdoor != OutdoorLevel.no) priority += 25;
    if (temp <= 0 && plan.outdoor != OutdoorLevel.no) priority += 25;

    if (priority < 28) return null;

    final short = _notificationShort(plan, scope, data, rainRisk, wind, temp, weatherCode);
    return (
      title: userName.isEmpty ? 'Bugünkü plan' : '$userName, bugünkü plan',
      body: short,
      priority: priority,
    );
  }

  static String _notificationShort(
    ActionPlanDetail plan,
    PlanScope scope,
    WeatherData data,
    double rainRisk,
    double wind,
    double temp,
    int weatherCode,
  ) {
    final t = plan.taskLabel;
    final hm = _hm(plan.startMinute);
    if (plan.taskId == 'farmer_spray' && wind > 15) {
      return '$t ($hm): Rüzgar ${wind.round()} km/s; ilaçlamayı ertele.';
    }
    if (weatherCode >= 95) {
      return '$t ($hm): Dolu riski var; açık alanda kalma, saati kaydır.';
    }
    if (rainRisk >= 65 && plan.transport == TransportType.walking) {
      return '$t ($hm): Yağış ihtimali yüksek; yürüyüşü yağışsız saate al.';
    }
    if (rainRisk >= 65 &&
        (plan.transport == TransportType.bus || plan.transport == TransportType.shuttle)) {
      return '$t ($hm): Beklemede ıslanmamak için kapalı durak ve tampon süre ekle.';
    }
    if (wind >= 28 && plan.transport == TransportType.bicycle) {
      return '$t ($hm): Rüzgar güçlü; bisikleti bugün hafiflet veya ertele.';
    }
    if (temp >= 36 && plan.outdoor != OutdoorLevel.no) {
      return '$t ($hm): Sıcak baskın; su ve gölge planını netleştir.';
    }
    if (temp <= 1 && plan.outdoor != OutdoorLevel.no) {
      return '$t ($hm): Soğuk baskın; katmanlı giyin, beklemeyi kısalt.';
    }
    return '$t ($hm): Hava planına göre küçük bir ayarlama düşünmek iyi olur.';
  }

  static String? _farmerHardBlock(
    ActionPlanDetail plan,
    WeatherData data,
    double wind,
    double temp,
    HourlyEntry? h,
  ) {
    if (plan.taskId == 'farmer_spray' && wind > 15) {
      return '${plan.taskLabel}: Rüzgar ${wind.round()} km/s; ilaçlamayı ertele veya saati değiştir.';
    }
    if (plan.taskId == 'farmer_harvest') {
      final startHour = plan.startMinute ~/ 60;
      final highHumidity = data.humidity >= 88;
      if (startHour < 9 && (highHumidity || temp <= 2)) {
        return '${plan.taskLabel}: Sabah çiği veya don etkisi olabilir; hasadı biraz daha geç başlatmak daha güvenli.';
      }
    }
    if (h != null && h.weatherCode >= 95 && plan.taskId.startsWith('farmer_')) {
      return '${plan.taskLabel}: Dolu riski var; açık alanda işi erteleyip güvenliği öne al.';
    }
    return null;
  }

  static void _appendTransport(
    ActionPlanDetail plan,
    StringBuffer buf,
    double rainRisk,
    double wind,
    int weatherCode,
  ) {
    switch (plan.transport) {
      case TransportType.walking:
        if (rainRisk >= 45) {
          buf.write('yürürken ıslanma riski var; şemsiye veya yağmurluk mantıklı. ');
        }
        break;
      case TransportType.bicycle:
        if (wind >= 25 || rainRisk >= 40) {
          buf.write('bisiklette rüzgar ve ıslak zemin zorlayabilir; saati kaydır veya tempoyu düşür. ');
        }
        break;
      case TransportType.car:
        if (rainRisk >= 45 || weatherCode == 45 || weatherCode == 48) {
          buf.write('araçta görüş ve fren mesafesi için erken çıkmak iyi olur. ');
        }
        break;
      case TransportType.bus:
      case TransportType.shuttle:
        if (rainRisk >= 45) {
          buf.write('bekleme süresi varsa kapalı durak ve tampon süre düşün. ');
        }
        break;
      case TransportType.none:
        break;
    }
  }

  static void _appendOutdoor(
    ActionPlanDetail plan,
    StringBuffer buf,
    double temp,
    int weatherCode,
  ) {
    if (plan.outdoor == OutdoorLevel.no) return;
    if (temp >= 35) {
      buf.write('açık alanda sıcak baskısı için su ve gölge planı yap. ');
    }
    if (temp <= 2) {
      buf.write('don veya ayaz riski için katmanlı giyin. ');
    }
    if (weatherCode >= 96) {
      buf.write('dolu riski var; açıkta kalmayı ertelemek daha güvenli. ');
    }
  }

  static void _appendFarmerSoft(
    ActionPlanDetail plan,
    StringBuffer buf,
    WeatherData data,
    WeatherDecision decision,
    UserMode mode,
    double rainRisk,
    double wind,
  ) {
    if (mode != UserMode.farmer) return;
    if (plan.taskId == 'farmer_irrigate' && !decision.shouldIrrigate && rainRisk >= 55) {
      buf.write('yağış beklentisi sulamayı gereksiz kılabilir; dozu gözden geçir. ');
    }
    if (plan.taskId == 'farmer_fertilize' && rainRisk >= 50) {
      buf.write('yağış gübre akışını artırır; pencereyi daraltmak mantıklı olabilir. ');
    }
    if (plan.taskId == 'farmer_field' && rainRisk >= 60) {
      buf.write('toprak doygun olabilir; ağır ekipmanla girişi ertele. ');
    }
    if (plan.taskId == 'farmer_spray' && wind > 10 && wind <= 15) {
      buf.write('rüzgar sınırda; ilaç sürüklenmesine karşı dar pencere seç. ');
    }
  }

  static String _recommendationTail(num rainRisk, ActionPlanDetail plan) {
    if (rainRisk >= 70) {
      return 'Öneri: mümkünse ertele veya en az yirmi otuz dakika erken çık.';
    }
    if (rainRisk >= 45) {
      return 'Öneri: saati otuz altmış dakika kaydırmak konfor sağlayabilir.';
    }
    return 'Öneri: plan uyguna yakın; yine de kısa bir yedek senaryo bulundur.';
  }

  static HourlyEntry? _hourlyForPlan(
    ActionPlanDetail plan,
    PlanScope scope,
    WeatherData data,
  ) {
    final hour = plan.startMinute ~/ 60;
    final list = switch (scope) {
      PlanScope.today => data.todayHourly,
      PlanScope.tomorrow => data.tomorrowHourly,
      PlanScope.weekly => data.todayHourly,
    };
    if (list.isEmpty) return null;
    final same = list.where((e) => e.time.hour == hour).toList();
    if (same.isEmpty) return list.first;
    return same.first;
  }

  static String _hm(int m) =>
      '${(m ~/ 60).toString().padLeft(2, '0')}:${(m % 60).toString().padLeft(2, '0')}';

  static String _taskNarrative(
    String taskId,
    String taskLabel,
    PlanScope scope,
    WeatherData data, {
    String? rainWindow,
  }) {
    return switch (taskId) {
      'city_shopping' => switch (scope) {
          PlanScope.today => rainWindow != null
              ? 'Alışverişe bu saatlerde çıkacaksan kapalı AVM ve kapalı otopark seç; çıkış için yağışsız kısa bir pencere bırak.'
              : 'Alışverişe çıkacaksan yağışsız pencereyi seç; kapalı otopark ve su geçirmez ayakkabı konfor sağlar.',
          PlanScope.tomorrow =>
            'Yarın alışverişi günün ilk yarısına çekmek daha güvenli olabilir; dönüşte toplu taşıma alternatifi bulunsun.',
          PlanScope.weekly =>
            'Haftalık alışveriş için yağışsız günleri hedefle; ağır taşıma yapacaksan rüzgarın düşük olduğu saatleri seç.',
        },
      'city_driving' => switch (scope) {
          PlanScope.today => rainWindow != null
              ? 'Bu saatlerde araçla çıkacaksan fren mesafesini artır, hızını düşür ve rota için biraz daha erken çık.'
              : 'Trafikte fren mesafesini artır; yağışlı saatlerde ani şerit değişiminden kaçın.',
          PlanScope.tomorrow =>
            'Yarın aracı erken saatlerde kullanmak daha rahat olabilir; cam suyu, lastik ve far kontrolünü şimdiden yap.',
          PlanScope.weekly =>
            'Bu hafta uzun yol planın varsa şiddetli yağış ve rüzgar günlerinde rota ve saat esnetmek iyi olur.',
        },
      'city_outdoor' => switch (scope) {
          PlanScope.today => rainWindow != null
              ? 'Dışarıda olacaksan katmanlı giyin; yağış başladığında kapalı bir mola noktası planla.'
              : 'Dışarıda uzun kalacaksan katmanlı giyin; hava değişirse hızlı uyum için ince bir üstlük taşı.',
          PlanScope.tomorrow =>
            'Yarın dışarıdaki planları saatlik tahmine göre böl; yağışlı bloklarda kapalı alan planla.',
          PlanScope.weekly =>
            'Hafta boyunca açık hava planlarını hava penceresine yay; riskli günlerde süreyi kısalt.',
        },
      'city_sport' => switch (scope) {
          PlanScope.today =>
            'Açık hava sporu yapacaksan zeminin kayganlığına dikkat et; tempoyu düşürüp ısınma ve soğumayı uzat.',
          PlanScope.tomorrow =>
            'Yarın antrenmanı sabah erken ya da akşam üstü planlamak daha sağlıklı olur; aşırı sıcakta yüklenme yapma.',
          PlanScope.weekly =>
            'Haftalık spor planında açık ve kapalı alan alternatiflerini birlikte tut; hava sertleşirse içeri geç.',
        },
      'city_picnic' => switch (scope) {
          PlanScope.today =>
            'Piknik veya etkinlikte rüzgâr yönüne göre yer seç; yağış geçişlerine karşı küçük bir branda bulundur.',
          PlanScope.tomorrow =>
            'Yarın etkinliği yağışsız saatlere kaydırmak daha keyifli olur; erken toplanma planı riski azaltır.',
          PlanScope.weekly =>
            'Haftalık etkinlik için bir ana tarih bir de yedek tarih belirle; ani hava değişiminde plansız kalmazsın.',
        },
      'city_meeting' => switch (scope) {
          PlanScope.today =>
            'Toplantıya giderken ulaşım süresine en az on beş yirmi dakika tampon ekle; ıslak yolda gecikme olasılığı artar.',
          PlanScope.tomorrow =>
            'Yarın toplantı öncesi rota ve park seçeneğini bugünden netleştir; hava bozarsa zaman kaybını önlersin.',
          PlanScope.weekly =>
            'Bu haftaki toplantılar için uzaktan bağlantı seçeneğini hazır tut; riskli günlerde esneklik büyük avantaj sağlar.',
        },
      'city_work' => switch (scope) {
          PlanScope.today => rainWindow != null
              ? 'İşe giderken yağışlı saatlere denk gelmemek için tampon süre bırak; yedek rota veya toplu taşıma düşün.'
              : 'İşe gidişte süreyi netleştirmek; kaygan veya rüzgârlı günlerde biraz erken çıkmak stresten alır.',
          PlanScope.tomorrow =>
            'Yarın işe gidişi yağışlı bloklardan uzak tutmak için saati biraz kaydırmak konfor verir; park ve servis planını netleştir.',
          PlanScope.weekly =>
            'Haftalık işe gidişte yağışlı günlerde toplu taşıma veya yedek rota hazır olsun; tek tip plana kilitlenme.',
        },
      'city_school' => switch (scope) {
          PlanScope.today => rainWindow != null
              ? 'Okul veya servis saatinde beklemeyi mümkünse kapalı alana al; yedek üst ve ayakkabı pratik olur.'
              : 'Okula gidişte çanta ve kıyafeti katmanlı tut; ani yağışta çocuğun ıslanmasını azaltır.',
          PlanScope.tomorrow =>
            'Yarın okul çıkışına yağışa uygun katman ekle; servis varsa bekleme süresine küçük tampon koy.',
          PlanScope.weekly =>
            'Hafta boyunca okul günlerinde yağışlı günleri önden gör; servis ve yaya güzergâhını iki seçenekli tut.',
        },
      'city_kids' => switch (scope) {
          PlanScope.today => rainWindow != null
              ? 'Çocuklar dışarıda olacaksa yağmurdan önce ve sonra iç mekân molaları planla; yedek üst ve çorap hazır tut.'
              : 'Çocuklar dışarıdayken kısa aralıklarla kapalı alanda ısınma molası planlamak daha güvenli olur.',
          PlanScope.tomorrow =>
            'Yarın okul veya etkinlik çıkışına yağışa uygun kıyafet ekle; yedek üst ve çorap bulundurmak rahatlık sağlar.',
          PlanScope.weekly =>
            'Hafta boyunca çocukların dış mekân sürelerini hava penceresine göre ayarla; sert hava günlerinde kapalı etkinlik seç.',
        },
      'city_walk' => switch (scope) {
          PlanScope.today =>
            'Yürüyüş veya koşu için kaymaz tabanlı ayakkabı seç; rüzgâr artarsa daha korunaklı güzergâhta devam et.',
          PlanScope.tomorrow =>
            'Yarın tempolu yürüyüşü yağışsız bloklara koymak daha konforlu olur; süreyi kısalt ama rutini bozma.',
          PlanScope.weekly =>
            'Haftalık adım hedefini tek güne yükleme; havaya göre bölmek hem güvenli hem sürdürülebilir olur.',
        },
      'city_guests' => switch (scope) {
          PlanScope.today =>
            'Misafirler gelmeden önce ulaşım ve park bilgisini paylaş; yağışlı saatlerde gecikme ihtimaline göre esnek zaman bırak.',
          PlanScope.tomorrow =>
            'Yarın misafir planı varsa karşılama saatini hava penceresine göre seçmek herkesin konforunu artırır.',
          PlanScope.weekly =>
            'Hafta içindeki misafir günleri için hava durumuna uygun kapalı etkinlik alternatifi hazır tut.',
        },
      'farmer_spray' => switch (scope) {
          PlanScope.today =>
            'İlaçlamada rüzgâr ve yağış penceresini daralt; sakin saatlerde uygula ve kurumaya süre bırak.',
          PlanScope.tomorrow =>
            'Yarın ilaçlamayı sabah erken saatlere çekmek daha güvenli olur; yağış riski varsa bir sonraki pencereye ertele.',
          PlanScope.weekly =>
            'Haftalık ilaçlamada rüzgâr düşük günleri öne al; ardından yağış gelmeyecek blokları seçerek etkiyi koru.',
        },
      'farmer_irrigate' => switch (scope) {
          PlanScope.today =>
            'Sulamayı günün serin saatlerine alırsan buharlaşma kaybı azalır; toprak nemini parsel bazında takip et.',
          PlanScope.tomorrow =>
            'Yarın yağış olasılığı yüksekse sulama dozunu düşür veya ertele; fazla su kök bölgesinde stres yaratabilir.',
          PlanScope.weekly =>
            'Haftalık sulama planını yağışlı ve yağışsız günlere göre kademeli kur; tek seferde yüksek su vermekten kaçın.',
        },
      'farmer_harvest' => switch (scope) {
          PlanScope.today =>
            'Hasatta ürünün kuru saatlerde toplanması kaliteyi korur; yağış öncesi hızlı toplama ve uygun depolama önemli.',
          PlanScope.tomorrow =>
            'Yarın hasat düşünüyorsan yağış öncesi pencereye odaklan; nem yükselmeden toplama tamamlanmalı.',
          PlanScope.weekly =>
            'Bu hafta hasadı parçalı planla; kritik günlerde önce olgun ürünü alıp kayıp riskini azalt.',
        },
      'farmer_fertilize' => switch (scope) {
          PlanScope.today =>
            'Gübrelemede yağış ve rüzgâr olmayan pencereyi seç; uygulama sonrası toprakta tutunma süresi bırak.',
          PlanScope.tomorrow =>
            'Yarın yağış ihtimali varsa gübrelemeyi ertelemek daha doğru olur; aksi halde akma ve verim kaybı artar.',
          PlanScope.weekly =>
            'Haftalık gübrelemede hava sakin günleri seçerek dağılımı homojen tut; yağışlı günlerden kaçın.',
        },
      'farmer_seedling' => switch (scope) {
          PlanScope.today =>
            'Fide dikiminde soğuk rüzgâr ve ani yağış riskini azaltmak için koruyucu örtü hazır bulundur.',
          PlanScope.tomorrow =>
            'Yarın dikimde sabah serin ama stabil saatleri seçmek fide tutumunu artırır; aşırı sıcakta dikimden kaçın.',
          PlanScope.weekly =>
            'Hafta boyunca fide dikimini parçalı yapıp her parçayı hava penceresine göre yerleştirmek kaybı azaltır.',
        },
      'farmer_field' => switch (scope) {
          PlanScope.today =>
            'Tarlaya ağır ekipmanla girişi zemin durumuna göre ayarla; çok ıslak toprakta sıkışma riski ürün gelişimini zayıflatır.',
          PlanScope.tomorrow =>
            'Yarın saha çalışmasında sabah kontrolü yapıp zemin uygunluğunu teyit etmeden makine girişi planlama.',
          PlanScope.weekly =>
            'Haftalık tarla işlerinde önce zemin taşıma kapasitesini izle; riskli günlerde hafif işlere öncelik ver.',
        },
      'farmer_animal' => switch (scope) {
          PlanScope.today =>
            'Hayvanlarda su ve barınak kontrolünü sıklaştır; ani sıcaklık ve yağış geçişlerinde stres hızla artabilir.',
          PlanScope.tomorrow =>
            'Yarın yemleme ve sulama saatlerini hava penceresine göre düzenle; sert hava öncesi barınak güvenliğini kontrol et.',
          PlanScope.weekly =>
            'Bu hafta sürü yönetiminde korunaklı alan planını öne al; riskli günlerde dışarıda kalma süresini kısalt.',
        },
      'farmer_greenhouse' => switch (scope) {
          PlanScope.today =>
            'Serada havalandırma ve örtü gerilimini birlikte kontrol et; rüzgâr veya dolu riski varsa iç takviye uygula.',
          PlanScope.tomorrow =>
            'Yarın sera içinde nem ve sıcaklık dengesini erken saatten izle; hava sertleşmeden koruyucu önlemleri tamamla.',
          PlanScope.weekly =>
            'Haftalık sera planında riskli günler için sabit kontrol saatleri koy; klips, bağlantı ve ısıtma yedeğini hazır tut.',
        },
      'farmer_pruning' => switch (scope) {
          PlanScope.today =>
            'Budamada kesim yüzeyinin kuru kalması önemli; yağışlı ve aşırı nemli bloklarda budamayı ertele.',
          PlanScope.tomorrow =>
            'Yarın budama yapacaksan sabah kuru pencereyi seç; işlem sonrası yaraları koruyucu uygulamayla destekle.',
          PlanScope.weekly =>
            'Haftalık budama planını kuru günlere dağıtmak enfeksiyon riskini düşürür; soğuk gecelerde kesimden kaçın.',
        },
      'farmer_sowing' => switch (scope) {
          PlanScope.today =>
            'Ekimde toprak tavını kontrol ederek ilerle; aşırı ıslak veya aşırı sıcak bloklarda ekim verimi düşürebilir.',
          PlanScope.tomorrow =>
            'Yarın ekim için yağışsız pencereyi seçmek çimlenmeyi güçlendirir; aşırı rüzgârda tohum yatağı bozulabilir.',
          PlanScope.weekly =>
            'Bu hafta ekimi parçalı takvimle; her parça için hava ve toprak koşulunu ayrı doğrulamak çıktıyı iyileştirir.',
        },
      _ => switch (scope) {
          PlanScope.today =>
            '${taskLabel.toLowerCase()} için bugün saatlik hava geçişlerine göre esnek hareket etmek daha güvenli olur.',
          PlanScope.tomorrow =>
            '${taskLabel.toLowerCase()} için yarın hava penceresine dayalı plan yapmak iş gücünü daha verimli kullanır.',
          PlanScope.weekly =>
            '${taskLabel.toLowerCase()} için haftalık planı riskli günler ve uygun günler olarak ikiye bölmek faydalı olur.',
        },
    };
  }
}
