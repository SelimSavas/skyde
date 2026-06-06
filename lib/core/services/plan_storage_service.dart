import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/action_plan.dart';
import '../utils/debug_log.dart';

/// Arka plan bildirimi ve dış servisler için plan JSON okuma (provider ile aynı anahtarlar).
class PlanStorageService {
  static const _plansKey = 'action_plans_v2';

  static Future<Map<PlanScope, List<ActionPlanDetail>>> loadPlans() async {
    final sp = await SharedPreferences.getInstance();
    final raw = sp.getString(_plansKey);
    final out = <PlanScope, List<ActionPlanDetail>>{
      for (final s in PlanScope.values) s: <ActionPlanDetail>[],
    };
    if (raw == null || raw.isEmpty) return out;
    try {
      final obj = jsonDecode(raw) as Map<String, dynamic>;
      for (final scope in PlanScope.values) {
        final arr = (obj[scope.name] as List?) ?? const [];
        out[scope] = arr
            .map((e) =>
                ActionPlanDetail.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
      }
    } catch (e, st) {
      logSilentFailure('planStorage.load', e, st);
    }
    return out;
  }
}
