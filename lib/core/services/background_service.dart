import 'package:hive_flutter/hive_flutter.dart';
import 'package:workmanager/workmanager.dart';
import '../models/action_plan.dart';
import '../models/daily_task.dart';
import 'daily_task_service.dart';
import 'plan_message_service.dart';
import 'plan_storage_service.dart';
import 'weather_service.dart';
import 'notification_service.dart';
import 'location_service.dart';
import 'preferences_service.dart';
import '../utils/debug_log.dart';
import '../utils/decision_engine.dart';

const _weatherCheckTask = 'weatherCheck';

// Workmanager arka plan callback'i — top-level fonksiyon olmak zorunda
@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    if (task == _weatherCheckTask) {
      await _performWeatherCheck();
    }
    return Future.value(true);
  });
}

Future<void> _performWeatherCheck() async {
  try {
    final prefs = await PreferencesService().load();
    if (!prefs.notificationsEnabled) return;

    final position = await LocationService().getCurrentLocation();
    if (position == null) return;

    final weather = await WeatherService().fetchWeather(
      latitude: position.latitude,
      longitude: position.longitude,
    );

    final decision = DecisionEngine.evaluate(weather);

    // Kritik uyarı (don, dolu, fırtına) — tercihe bağlı
    if (prefs.notificationsCriticalAlerts && decision.hasCriticalAlert) {
      final alert = decision.alertKeys.isNotEmpty ? decision.alertKeys.first : '';
      String message = '';
      if (alert == 'frostWarning') message = '🌡️ Donma riski! Bu gece çok soğuk.';
      if (alert == 'hailWarning') message = '🌩️ Dolu tehlikesi! Ürünleri koru.';
      if (alert == 'stormWarning') message = '⛈️ Fırtına uyarısı! Önlem al.';
      if (message.isNotEmpty) {
        await NotificationService.showWeatherAlert(
          title: '${prefs.name}, dikkat!',
          body: message,
          id: 1,
        );
      }
    }

    // Yağış öncesi uyarı: sonraki 1–2 saatte yüksek ihtimal — tercihe bağlı
    if (prefs.notificationsPrecipitationAlerts && !decision.hasCriticalAlert) {
      final nextHours = weather.todayHourly.take(3).toList();
      final highProb = nextHours.any((h) => h.precipProbability >= 60);
      if (highProb && weather.precipitationProbability >= 50) {
        await NotificationService.showWeatherAlert(
          title: '${prefs.name}, yakında yağış',
          body: 'Önümüzdeki saatlerde yağış ihtimali yüksek. Şemsiyeni yanına al.',
          id: 2,
        );
      } else if (weather.precipitationProbability >= 80) {
        await NotificationService.showWeatherAlert(
          title: '${prefs.name}, yağmur geliyor',
          body: 'Yağış ihtimali %${weather.precipitationProbability.round()}. Hazırlıklı ol.',
          id: 2,
        );
      }
    }

    // Görev bazlı bildirim
    try {
      if (!Hive.isAdapterRegistered(1)) {
        Hive.registerAdapter(DailyTaskAdapter());
      }
      if (!Hive.isBoxOpen('daily_tasks')) {
        await Hive.openBox<DailyTask>('daily_tasks');
      }
      await DailyTaskService.init();
      final activeTasks = DailyTaskService.getActiveTasksForMode(prefs.mode);
      if (activeTasks.isNotEmpty) {
        final taskAlert = DailyTaskService.taskAlertNotification(
          activeTasks, weather, decision, prefs.mode,
        );
        if (taskAlert.isNotEmpty) {
          await NotificationService.showWeatherAlert(
            title: '${prefs.name}, görev uyarısı',
            body: taskAlert,
            id: 5,
          );
        }
      }
    } catch (e, st) {
      logSilentFailure('background.taskAlerts', e, st);
    }

    // Plan bazlı bildirimler (kayıtlı aksiyonlar)
    try {
      if (prefs.notificationsPlanAlerts && prefs.notificationsEnabled) {
        final plansMap = await PlanStorageService.loadPlans();
        final wd = DateTime.now().weekday;
        final candidates = <({String title, String body, int priority})>[];
        final seen = <String>{};
        void addForPlan(ActionPlanDetail p) {
          final key = '${p.taskId}_${p.startMinute}_${p.endMinute ?? -1}';
          if (seen.contains(key)) return;
          seen.add(key);
          final n = PlanMessageService.notificationForPlan(
            plan: p,
            scope: PlanScope.today,
            data: weather,
            mode: prefs.mode,
            userName: prefs.name,
          );
          if (n != null) {
            candidates.add(n);
          }
        }

        for (final p in plansMap[PlanScope.today] ?? const []) {
          addForPlan(p);
        }
        for (final p in plansMap[PlanScope.weekly] ?? const []) {
          if (weekdayMaskIncludes(p.weekdayMask, wd)) {
            addForPlan(p);
          }
        }
        candidates.sort((a, b) => b.priority.compareTo(a.priority));
        for (var i = 0; i < candidates.length && i < 3; i++) {
          final c = candidates[i];
          await NotificationService.showWeatherAlert(
            title: c.title,
            body: c.body,
            id: 600 + i,
          );
        }
      }
    } catch (e, st) {
      logSilentFailure('background.planAlerts', e, st);
    }

    // Akşam özeti (20:00) — tercihe bağlı
    final hour = DateTime.now().hour;
    if (prefs.notificationsEveningSummary && hour >= 18 && hour <= 21) {
      final summary = _buildEveningSummary(weather);
      await NotificationService.scheduleEveningSummary(
        userName: prefs.name,
        tomorrowSummary: summary,
      );
    }
  } catch (e, st) {
    logSilentFailure('background.weatherCheck', e, st);
  }
}

String _buildEveningSummary(dynamic weather) {
  final desc = weather.weatherDescription as String;
  final temp = (weather.temperature as double).round();
  final prob = (weather.precipitationProbability as double).round();

  if (weather.isFrostRisk as bool) {
    return 'Yarın don riski var! En düşük $temp°C. Önlem al.';
  }
  if (weather.isRainingNow as bool || prob >= 60) {
    return 'Yarın yağışlı. $desc. Yağış ihtimali %$prob.';
  }
  return 'Yarın $desc. Sıcaklık yaklaşık $temp°C. İyi geceler.';
}

class BackgroundService {
  static Future<void> init() async {
    await Workmanager().initialize(callbackDispatcher, isInDebugMode: false);
  }

  /// Her 3 saatte bir hava durumunu kontrol et
  static Future<void> scheduleWeatherCheck() async {
    await Workmanager().registerPeriodicTask(
      _weatherCheckTask,
      _weatherCheckTask,
      frequency: const Duration(hours: 3),
      constraints: Constraints(networkType: NetworkType.connected),
      existingWorkPolicy: ExistingWorkPolicy.keep,
    );
  }

  static Future<void> cancel() async {
    await Workmanager().cancelAll();
  }
}
