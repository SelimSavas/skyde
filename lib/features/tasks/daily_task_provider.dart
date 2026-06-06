import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/models/action_plan.dart';
import '../../core/models/daily_task.dart';
import '../../core/models/user_preferences.dart';
import '../../core/models/weather_data.dart';
import '../../core/services/daily_task_service.dart';
import '../../core/services/plan_message_service.dart';
import '../../core/utils/debug_log.dart';
import '../../core/utils/decision_engine.dart';

export '../../core/models/action_plan.dart';

class DailyTaskProvider extends ChangeNotifier {
  static const _plansKey = 'action_plans_v2';
  static const _plansDateKey = 'action_plans_last_date_v2';

  List<DailyTask> _tasks = [];
  List<String> _alerts = [];
  final Map<PlanScope, List<ActionPlanDetail>> _plansByScope = {
    PlanScope.today: <ActionPlanDetail>[],
    PlanScope.tomorrow: <ActionPlanDetail>[],
    PlanScope.weekly: <ActionPlanDetail>[],
  };

  List<DailyTask> get tasks => _tasks;
  List<DailyTask> get activeTasks => _tasks.where((t) => t.isActive).toList();
  List<String> get alerts => _alerts;
  bool get hasActiveTasks => _tasks.any((t) => t.isActive);
  int get activeCount => _tasks.where((t) => t.isActive).length;
  int plannedCount(PlanScope scope) => _plansByScope[scope]!.length;
  List<DailyTask> plannedTasks(PlanScope scope) {
    final ids = _plansByScope[scope]!.map((e) => e.taskId).toSet();
    return _tasks.where((t) => ids.contains(t.id)).toList();
  }

  List<ActionPlanDetail> plansForScope(PlanScope scope) =>
      List.unmodifiable(_plansByScope[scope]!);

  /// Bugün/yarın sekmesinde haftalık tekrarlar dahil tüm geçerli planlar (ana ekran kartları).
  List<ActionPlanDetail> effectivePlansForScope(PlanScope scope) =>
      List<ActionPlanDetail>.from(_effectivePlansForScope(scope));
  ActionPlanDetail? planForTask(PlanScope scope, String taskId) {
    final plans = _plansByScope[scope]!;
    final idx = plans.indexWhere((p) => p.taskId == taskId);
    if (idx < 0) return null;
    return plans[idx];
  }

  List<String> plannedTaskLabels(PlanScope scope) =>
      plannedTasks(scope).map((t) => t.label).toList();

  Future<void> loadTasks(UserMode mode) async {
    await DailyTaskService.init();
    _tasks = DailyTaskService.getTasksForMode(mode);
    await _loadPlans();
    await _rolloverPlansIfNeeded();
    _sanitizePlans();
    notifyListeners();
  }

  Future<void> toggleTask(String id, bool active) async {
    await DailyTaskService.toggleTask(id, active);
    final idx = _tasks.indexWhere((t) => t.id == id);
    if (idx >= 0) {
      _tasks[idx].isActive = active;
    }
    notifyListeners();
  }

  Future<void> togglePersistent(String id, bool persistent) async {
    await DailyTaskService.togglePersistent(id, persistent);
    final idx = _tasks.indexWhere((t) => t.id == id);
    if (idx >= 0) {
      _tasks[idx].isPersistent = persistent;
    }
    notifyListeners();
  }

  void updateAlerts(WeatherData data, WeatherDecision decision, UserMode mode) {
    final active = DailyTaskService.getActiveTasksForMode(mode);
    _alerts = DailyTaskService.generateTaskAlerts(active, data, decision, mode);
    notifyListeners();
  }

  bool isPlanned(PlanScope scope, String taskId) {
    return _plansByScope[scope]!.any((p) => p.taskId == taskId);
  }

  /// Returns false if max selection reached.
  bool togglePlannedTask(PlanScope scope, String taskId,
      {int maxSelection = 5}) {
    final plans = _plansByScope[scope]!;
    final idx = plans.indexWhere((p) => p.taskId == taskId);
    if (idx >= 0) {
      plans.removeAt(idx);
      _savePlans();
      notifyListeners();
      return true;
    }
    if (plans.length >= maxSelection) return false;
    final task = _tasks.firstWhere((t) => t.id == taskId);
    plans.add(
      ActionPlanDetail(
        taskId: task.id,
        taskLabel: task.label,
        startMinute: 9 * 60,
        endMinute: 10 * 60,
        transport: TransportType.none,
        outdoor: OutdoorLevel.partial,
        weekdayMask: 0,
      ),
    );
    _savePlans();
    notifyListeners();
    return true;
  }

  Future<bool> addOrUpdatePlan(
    PlanScope scope,
    ActionPlanDetail detail, {
    int maxSelection = 5,
  }) async {
    final plans = _plansByScope[scope]!;
    final idx = plans.indexWhere((p) => p.taskId == detail.taskId);
    if (idx < 0 && plans.length >= maxSelection) return false;
    if (idx >= 0) {
      plans[idx] = detail;
    } else {
      plans.add(detail);
    }
    await _savePlans();
    notifyListeners();
    return true;
  }

  List<String> alertsForScope(
    PlanScope scope,
    WeatherData data,
    WeatherDecision decision,
    UserMode mode,
  ) {
    final plans = _effectivePlansForScope(scope);
    if (plans.isEmpty) return const [];
    return plans
        .map((p) => PlanMessageService.evaluatePlan(p, scope, data, decision, mode))
        .toList();
  }

  void clearScope(PlanScope scope) {
    _plansByScope[scope]!.clear();
    _savePlans();
    notifyListeners();
  }

  void _sanitizePlans() {
    final validIds = _tasks.map((e) => e.id).toSet();
    for (final scope in PlanScope.values) {
      _plansByScope[scope]!.removeWhere((p) => !validIds.contains(p.taskId));
    }
  }

  /// Bugün / yarın sekmesinde haftalık plandan seçilen günler de devreye girer.
  List<ActionPlanDetail> _effectivePlansForScope(PlanScope scope) {
    if (scope == PlanScope.weekly) {
      return List.unmodifiable(_plansByScope[PlanScope.weekly]!);
    }
    final out = <ActionPlanDetail>[];
    final seen = <String>{};
    void addUnique(ActionPlanDetail p) {
      final key = '${p.taskId}_${p.startMinute}_${p.endMinute ?? -1}';
      if (seen.contains(key)) return;
      seen.add(key);
      out.add(p);
    }

    for (final p in _plansByScope[scope]!) {
      addUnique(p);
    }
    final weekly = _plansByScope[PlanScope.weekly]!;
    if (scope == PlanScope.today) {
      final wd = DateTime.now().weekday;
      for (final p in weekly) {
        if (weekdayMaskIncludes(p.weekdayMask, wd)) addUnique(p);
      }
    } else if (scope == PlanScope.tomorrow) {
      final wd = DateTime.now().add(const Duration(days: 1)).weekday;
      for (final p in weekly) {
        if (weekdayMaskIncludes(p.weekdayMask, wd)) addUnique(p);
      }
    }
    return out;
  }

  Future<void> _loadPlans() async {
    final sp = await SharedPreferences.getInstance();
    final raw = sp.getString(_plansKey);
    if (raw == null || raw.isEmpty) return;
    try {
      final obj = jsonDecode(raw) as Map<String, dynamic>;
      for (final scope in PlanScope.values) {
        final arr = (obj[scope.name] as List?) ?? const [];
        _plansByScope[scope] = arr
            .map((e) =>
                ActionPlanDetail.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
      }
    } catch (e, st) {
      logSilentFailure('dailyTask.loadPlans', e, st);
    }
  }

  Future<void> _savePlans() async {
    final sp = await SharedPreferences.getInstance();
    final data = <String, dynamic>{
      for (final scope in PlanScope.values)
        scope.name: _plansByScope[scope]!.map((e) => e.toJson()).toList(),
    };
    await sp.setString(_plansKey, jsonEncode(data));
  }

  Future<void> _rolloverPlansIfNeeded() async {
    final sp = await SharedPreferences.getInstance();
    final now = DateTime.now();
    final todayKey =
        '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    final last = sp.getString(_plansDateKey);
    if (last == todayKey) return;

    final tomorrowPlans =
        List<ActionPlanDetail>.from(_plansByScope[PlanScope.tomorrow]!);
    _plansByScope[PlanScope.today] = tomorrowPlans;
    _plansByScope[PlanScope.tomorrow] = [];

    // repeat items
    final base = _plansByScope[PlanScope.today]!;
    final weekday = now.weekday; // 1..7
    final source = List<ActionPlanDetail>.from(base);
    for (final p in source) {
      if (p.repeatRule == RepeatRule.daily ||
          (p.repeatRule == RepeatRule.weekdays && weekday <= 5)) {
        _plansByScope[PlanScope.tomorrow]!.add(p);
      }
    }
    await _savePlans();
    await sp.setString(_plansDateKey, todayKey);
  }
}
