// Plan detayı ve tekrar kuralları — DailyTaskProvider ile senkron.

enum PlanScope { today, tomorrow, weekly }

enum TransportType { car, bus, shuttle, walking, bicycle, none }

enum OutdoorLevel { yes, partial, no }

enum RepeatRule { none, daily, weekdays }

/// Haftalık sekmede gün seçimi: bit 0 = Pazartesi … bit 6 = Pazar.
/// `0` = tüm günler (geriye uyumlu).
class ActionPlanDetail {
  final String taskId;
  final String taskLabel;
  final int startMinute;
  final int? endMinute;
  final TransportType transport;
  final OutdoorLevel outdoor;
  final Map<String, String> extras;
  final RepeatRule repeatRule;

  /// 0 = her gün; aksi halde `weekday` (1–7, Pazartesi=1) için bit açık mı.
  final int weekdayMask;

  const ActionPlanDetail({
    required this.taskId,
    required this.taskLabel,
    required this.startMinute,
    this.endMinute,
    required this.transport,
    required this.outdoor,
    this.extras = const {},
    this.repeatRule = RepeatRule.none,
    this.weekdayMask = 0,
  });

  Map<String, dynamic> toJson() => {
        'taskId': taskId,
        'taskLabel': taskLabel,
        'startMinute': startMinute,
        'endMinute': endMinute,
        'transport': transport.name,
        'outdoor': outdoor.name,
        'extras': extras,
        'repeatRule': repeatRule.name,
        'weekdayMask': weekdayMask,
      };

  factory ActionPlanDetail.fromJson(Map<String, dynamic> json) {
    return ActionPlanDetail(
      taskId: json['taskId'] as String,
      taskLabel: json['taskLabel'] as String,
      startMinute: json['startMinute'] as int,
      endMinute: json['endMinute'] as int?,
      transport: TransportType.values.firstWhere(
        (e) => e.name == (json['transport'] as String? ?? 'none'),
        orElse: () => TransportType.none,
      ),
      outdoor: OutdoorLevel.values.firstWhere(
        (e) => e.name == (json['outdoor'] as String? ?? 'partial'),
        orElse: () => OutdoorLevel.partial,
      ),
      extras: (json['extras'] as Map?)?.map(
            (k, v) => MapEntry(k.toString(), v.toString()),
          ) ??
          const {},
      repeatRule: RepeatRule.values.firstWhere(
        (e) => e.name == (json['repeatRule'] as String? ?? 'none'),
        orElse: () => RepeatRule.none,
      ),
      weekdayMask: json['weekdayMask'] as int? ?? 0,
    );
  }
}

/// Dart [DateTime.weekday]: Pazartesi=1 … Pazar=7.
bool weekdayMaskIncludes(int mask, int weekday) {
  if (mask == 0) return true;
  if (weekday < 1 || weekday > 7) return false;
  return (mask & (1 << (weekday - 1))) != 0;
}
