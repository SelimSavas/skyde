import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/models/action_plan.dart';
import '../settings/settings_ui.dart';

const _weekdayShort = <String>['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

/// Görev planı detay formu — Ayarlar ile aynı görsel dil (tam sayfa).
class ActionPlanDetailScreen extends StatefulWidget {
  final PlanScope scope;
  final String taskId;
  final String taskLabel;
  final ActionPlanDetail? existing;

  const ActionPlanDetailScreen({
    super.key,
    required this.scope,
    required this.taskId,
    required this.taskLabel,
    this.existing,
  });

  @override
  State<ActionPlanDetailScreen> createState() => _ActionPlanDetailScreenState();
}

class _ActionPlanDetailScreenState extends State<ActionPlanDetailScreen> {
  late int startMinute;
  late int? endMinute;
  late TransportType transport;
  late OutdoorLevel outdoor;
  late RepeatRule repeatRule;
  late int weekdayMask;
  late Map<String, String> extras;

  @override
  void initState() {
    super.initState();
    final e = widget.existing;
    startMinute = e?.startMinute ?? (9 * 60);
    endMinute = e?.endMinute ?? (10 * 60);
    transport = e?.transport ??
        (widget.taskId == 'city_work'
            ? TransportType.walking
            : TransportType.none);
    outdoor = e?.outdoor ?? OutdoorLevel.partial;
    repeatRule = e?.repeatRule ?? RepeatRule.none;
    weekdayMask = e?.weekdayMask ?? 0;
    extras = Map<String, String>.from(e?.extras ?? {});
  }

  bool get cityWork => widget.taskId == 'city_work';
  bool get cityShopping => widget.taskId == 'city_shopping';
  bool get citySchool => widget.taskId == 'city_school';
  bool get cityOutdoor => widget.taskId == 'city_outdoor';
  bool get farmerSpray => widget.taskId == 'farmer_spray';
  bool get farmerIrrigate => widget.taskId == 'farmer_irrigate';
  bool get farmerHarvest => widget.taskId == 'farmer_harvest';
  bool get farmerField => widget.taskId == 'farmer_field';

  Future<void> _pickStart() async {
    final t = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(hour: startMinute ~/ 60, minute: startMinute % 60),
    );
    if (t == null) return;
    setState(() => startMinute = _roundTo15(t.hour * 60 + t.minute));
  }

  Future<void> _pickEnd() async {
    final base = endMinute ?? (startMinute + 60);
    final t = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(hour: base ~/ 60, minute: base % 60),
    );
    if (t == null) return;
    setState(() => endMinute = _roundTo15(t.hour * 60 + t.minute));
  }

  void _toggleWeekday(int day) {
    const all = 0x7F;
    var m = weekdayMask == 0 ? all : weekdayMask;
    m ^= 1 << (day - 1);
    setState(() {
      if (m == 0 || m == all) {
        weekdayMask = 0;
      } else {
        weekdayMask = m;
      }
    });
  }

  bool _daySelected(int day) {
    if (weekdayMask == 0) return true;
    return (weekdayMask & (1 << (day - 1))) != 0;
  }

  void _save() {
    if (cityWork && endMinute == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('İşe giderken dönüş saati zorunlu.'),
        ),
      );
      return;
    }
    final detail = ActionPlanDetail(
      taskId: widget.taskId,
      taskLabel: widget.taskLabel,
      startMinute: _roundTo15(startMinute),
      endMinute: endMinute == null ? null : _roundTo15(endMinute!),
      transport: transport,
      outdoor: outdoor,
      extras: extras,
      repeatRule: repeatRule,
      weekdayMask: weekdayMask,
    );
    Navigator.pop(context, detail);
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        systemNavigationBarColor: Colors.transparent,
        systemNavigationBarDividerColor: Colors.transparent,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: kSettingsBackground,
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SettingsPageHeader(
              title: '${widget.taskLabel} · Detay',
              subtitle: 'Zaman, ulaşım ve tekrar seçenekleri',
              onClose: () => Navigator.pop(context),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                children: [
                  SettingsSection(
                    label: 'ZAMAN',
                    child: SettingsCard(
                      children: [
                        _timeTile('Başlangıç', _hm(startMinute), _pickStart),
                        const Divider(height: 1, color: kSettingsDivider),
                        _timeTile(
                          'Bitiş / Dönüş',
                          endMinute == null ? 'Seçilmedi' : _hm(endMinute!),
                          _pickEnd,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  SettingsSection(
                    label: 'ULAŞIM',
                    child: SettingsCard(
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
                          child: Wrap(
                            spacing: 6,
                            runSpacing: 6,
                            children: TransportType.values.map((t) {
                              final selected = transport == t;
                              return ChoiceChip(
                                label: Text(_transportLabel(t)),
                                selected: selected,
                                onSelected: (_) =>
                                    setState(() => transport = t),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  SettingsSection(
                    label: 'AÇIK ALAN',
                    child: SettingsCard(
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
                          child: Wrap(
                            spacing: 6,
                            children: OutdoorLevel.values.map((o) {
                              final selected = outdoor == o;
                              return ChoiceChip(
                                label: Text(_outdoorLabel(o)),
                                selected: selected,
                                onSelected: (_) =>
                                    setState(() => outdoor = o),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (widget.scope == PlanScope.weekly) ...[
                    const SizedBox(height: 16),
                    SettingsSection(
                      label: 'HAFTANIN GÜNLERİ',
                      child: SettingsCard(
                        children: [
                          Padding(
                            padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
                            child: Text(
                              'Hiç seçilmezse tüm günler geçerli sayılır.',
                              style: settingsLex(
                                size: 11,
                                color: kSettingsSubtitleGray,
                              ),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
                            child: Wrap(
                              spacing: 6,
                              runSpacing: 6,
                              children: List.generate(7, (i) {
                                final day = i + 1;
                                final sel = _daySelected(day);
                                return FilterChip(
                                  label: Text(_weekdayShort[i]),
                                  selected: sel,
                                  onSelected: (_) {
                                    _toggleWeekday(day);
                                  },
                                );
                              }),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  ..._cityDetailSections(),
                  ..._farmerDetailSections(),
                  const SizedBox(height: 16),
                  SettingsSection(
                    label: 'PLAN SABİTLEME',
                    child: SettingsCard(
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
                          child: Wrap(
                            spacing: 6,
                            children: RepeatRule.values.map((r) {
                              final selected = repeatRule == r;
                              return ChoiceChip(
                                label: Text(_repeatLabel(r)),
                                selected: selected,
                                onSelected: (_) =>
                                    setState(() => repeatRule = r),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Vazgeç'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: FilledButton(
                          onPressed: _save,
                          child: const Text('Kaydet'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _cityDetailSections() {
    final w = _cityExtras();
    if (w.isEmpty) return [];
    return [
      const SizedBox(height: 16),
      SettingsSection(
        label: 'ŞEHİR DETAYLARI',
        child: SettingsCard(children: w),
      ),
    ];
  }

  List<Widget> _farmerDetailSections() {
    final w = _farmerExtras();
    if (w.isEmpty) return [];
    return [
      const SizedBox(height: 16),
      SettingsSection(
        label: 'ÇİFTÇİ DETAYLARI',
        child: SettingsCard(children: w),
      ),
    ];
  }

  List<Widget> _cityExtras() {
    final w = <Widget>[];
    if (cityShopping) {
      w.addAll([
        _extrasChips(
          title: 'Tahmini süre',
          values: const ['30dk', '1sa', '2sa+'],
          selected: extras['duration'],
          onSelect: (v) => setState(() => extras['duration'] = v),
        ),
        _extrasChips(
          title: 'Yürüme mesafesi',
          values: const ['Var', 'Yok'],
          selected: extras['walkDistance'],
          onSelect: (v) => setState(() => extras['walkDistance'] = v),
        ),
      ]);
    }
    if (citySchool) {
      w.addAll([
        _extrasChips(
          title: 'Servis saati',
          values: const ['Var', 'Yok'],
          selected: extras['hasShuttleTime'],
          onSelect: (v) => setState(() => extras['hasShuttleTime'] = v),
        ),
        _extrasChips(
          title: 'Bekleme açık havada mı?',
          values: const ['Evet', 'Hayır'],
          selected: extras['waitOutdoor'],
          onSelect: (v) => setState(() => extras['waitOutdoor'] = v),
        ),
      ]);
    }
    if (cityOutdoor) {
      w.addAll([
        _extrasChips(
          title: 'Yaklaşık süre',
          values: const ['30dk', '1sa', '2sa+'],
          selected: extras['duration'],
          onSelect: (v) => setState(() => extras['duration'] = v),
        ),
      ]);
    }
    return w;
  }

  List<Widget> _farmerExtras() {
    final w = <Widget>[];
    if (farmerSpray) {
      w.addAll([
        _extrasChips(
          title: 'İlaç tipi',
          values: const ['Toz', 'Sıvı'],
          selected: extras['sprayType'],
          onSelect: (v) => setState(() => extras['sprayType'] = v),
        ),
        _extrasChips(
          title: 'Rüzgara duyarlı mı?',
          values: const ['Evet', 'Hayır'],
          selected: extras['windSensitive'],
          onSelect: (v) => setState(() => extras['windSensitive'] = v),
        ),
      ]);
    }
    if (farmerIrrigate) {
      w.addAll([
        _extrasChips(
          title: 'Zaman',
          values: const ['Sabah', 'Öğle', 'Akşam'],
          selected: extras['irrigateSlot'],
          onSelect: (v) => setState(() => extras['irrigateSlot'] = v),
        ),
        _extrasChips(
          title: 'Yöntem',
          values: const ['Damla', 'Yağmurlama', 'Elle'],
          selected: extras['irrigateType'],
          onSelect: (v) => setState(() => extras['irrigateType'] = v),
        ),
      ]);
    }
    if (farmerHarvest) {
      w.addAll([
        _extrasChips(
          title: 'Ürün tipi',
          values: const ['Mevsimlik sebze', 'Meyve', 'Tahıl'],
          selected: extras['productType'],
          onSelect: (v) => setState(() => extras['productType'] = v),
        ),
        _extrasChips(
          title: 'Makine kullanılacak mı?',
          values: const ['Evet', 'Hayır'],
          selected: extras['machine'],
          onSelect: (v) => setState(() => extras['machine'] = v),
        ),
      ]);
    }
    if (farmerField) {
      w.addAll([
        _extrasChips(
          title: 'Tahmini süre',
          values: const ['1sa', '2sa', '4sa+'],
          selected: extras['duration'],
          onSelect: (v) => setState(() => extras['duration'] = v),
        ),
        _extrasChips(
          title: 'Açık arazide mi?',
          values: const ['Evet', 'Hayır'],
          selected: extras['openField'],
          onSelect: (v) => setState(() => extras['openField'] = v),
        ),
      ]);
    }
    return w;
  }

  Widget _timeTile(String label, String value, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Expanded(
              child: Text(
                label,
                style: settingsLex(size: 14, color: kSettingsTitleColor),
              ),
            ),
            Text(
              value,
              style: settingsLex(
                size: 14,
                weight: FontWeight.w700,
                color: kSettingsTitleColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _extrasChips({
    required String title,
    required List<String> values,
    required String? selected,
    required void Function(String) onSelect,
  }) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: settingsLex(size: 12, color: kSettingsTitleColor),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 6,
            children: values
                .map(
                  (v) => ChoiceChip(
                    label: Text(v),
                    selected: selected == v,
                    onSelected: (_) => onSelect(v),
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}

int _roundTo15(int minuteOfDay) {
  final rounded = ((minuteOfDay + 7) ~/ 15) * 15;
  return rounded.clamp(0, 23 * 60 + 45);
}

String _hm(int m) =>
    '${(m ~/ 60).toString().padLeft(2, '0')}:${(m % 60).toString().padLeft(2, '0')}';

String _transportLabel(TransportType t) {
  return switch (t) {
    TransportType.car => 'Araba',
    TransportType.bus => 'Otobüs',
    TransportType.shuttle => 'Servis',
    TransportType.walking => 'Yürüyerek',
    TransportType.bicycle => 'Bisiklet',
    TransportType.none => 'Araç Yok',
  };
}

String _outdoorLabel(OutdoorLevel o) {
  return switch (o) {
    OutdoorLevel.yes => 'Evet',
    OutdoorLevel.partial => 'Kısmen',
    OutdoorLevel.no => 'Hayır',
  };
}

String _repeatLabel(RepeatRule r) {
  return switch (r) {
    RepeatRule.none => 'Tek sefer',
    RepeatRule.daily => 'Her gün',
    RepeatRule.weekdays => 'Hafta içi',
  };
}
