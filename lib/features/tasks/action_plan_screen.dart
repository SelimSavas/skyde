import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../core/models/daily_task.dart';
import '../../core/models/user_preferences.dart';
import '../settings/settings_ui.dart';
import 'action_plan_detail_screen.dart';
import 'action_plan_task_catalog.dart';
import 'daily_task_provider.dart';

String actionPlanTitleForTab(int tabIndex) {
  return switch (tabIndex) {
    0 => 'Bugünü Planla',
    1 => 'Yarını Planla',
    _ => 'Haftayı Planla',
  };
}

PlanScope planScopeForTab(int tabIndex) {
  return switch (tabIndex) {
    0 => PlanScope.today,
    1 => PlanScope.tomorrow,
    _ => PlanScope.weekly,
  };
}

/// Ana sayfadaki «Planla» — Ayarlar ile aynı tam ekran düzeni.
class ActionPlanScreen extends StatefulWidget {
  final UserMode mode;
  final int tabIndex;

  const ActionPlanScreen({
    super.key,
    required this.mode,
    required this.tabIndex,
  });

  @override
  State<ActionPlanScreen> createState() => _ActionPlanScreenState();
}

class _ActionPlanScreenState extends State<ActionPlanScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<DailyTaskProvider>().loadTasks(widget.mode);
    });
  }

  @override
  Widget build(BuildContext context) {
    final scope = planScopeForTab(widget.tabIndex);
    final title = actionPlanTitleForTab(widget.tabIndex);

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
        body: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 20),
              SettingsPageHeader(
                title: title,
                subtitle:
                    'Eylem seç; detaylar ayrı sayfada açılır. En fazla 5 plan.',
                onClose: () => Navigator.pop(context),
              ),
              Expanded(
                child: Consumer<DailyTaskProvider>(
                  builder: (context, p, _) {
                    if (p.tasks.isEmpty) {
                      return Center(
                        child: Text(
                          'Görevler yükleniyor…',
                          style: settingsLex(
                            size: 14,
                            color: kSettingsSubtitleGray,
                          ),
                        ),
                      );
                    }
                    final tasks = ActionPlanTaskCatalog.sortedTasks(
                      widget.mode,
                      p.tasks,
                    );
                    return ListView(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
                      children: [
                        for (var i = 0; i < tasks.length; i++) ...[
                          if (_showCategoryHeader(tasks, i))
                            _CategoryHeaderRow(
                              mode: widget.mode,
                              taskId: tasks[i].id,
                              first: i == 0,
                            ),
                          _PlanActionTile(
                            task: tasks[i],
                            selected: p.isPlanned(scope, tasks[i].id),
                            onToggle: () =>
                                p.togglePlannedTask(scope, tasks[i].id),
                            onTap: () async {
                              final t = tasks[i];
                              final existing = p.planForTask(scope, t.id);
                              final detail =
                                  await Navigator.push<ActionPlanDetail?>(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ActionPlanDetailScreen(
                                    scope: scope,
                                    taskId: t.id,
                                    taskLabel: t.label,
                                    existing: existing,
                                  ),
                                ),
                              );
                              if (detail == null || !context.mounted) return;
                              final ok = await p.addOrUpdatePlan(
                                scope,
                                detail,
                                maxSelection: 5,
                              );
                              if (!ok && context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                      'En fazla 5 plan ekleyebilirsin.',
                                    ),
                                  ),
                                );
                              }
                            },
                          ),
                          if (i < tasks.length - 1)
                            const SizedBox(height: 8),
                        ],
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  bool _showCategoryHeader(List<DailyTask> tasks, int i) {
    if (i == 0) return true;
    return ActionPlanTaskCatalog.categoryKindFor(widget.mode, tasks[i - 1].id) !=
        ActionPlanTaskCatalog.categoryKindFor(widget.mode, tasks[i].id);
  }
}

class _CategoryHeaderRow extends StatelessWidget {
  final UserMode mode;
  final String taskId;
  final bool first;

  const _CategoryHeaderRow({
    required this.mode,
    required this.taskId,
    required this.first,
  });

  @override
  Widget build(BuildContext context) {
    final kind = ActionPlanTaskCatalog.categoryKindFor(mode, taskId);
    final meta = ActionPlanTaskCatalog.metaFor(kind, mode);
    return Padding(
      padding: EdgeInsets.only(top: first ? 0 : 16, bottom: 8),
      child: Row(
        children: [
          Icon(
            meta.sectionIcon,
            size: 18,
            color: kSettingsSectionLabel,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              meta.title,
              style: settingsLex(
                size: 12,
                weight: FontWeight.w600,
                letterSpacing: 0.2,
                color: kSettingsSectionLabel,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PlanActionTile extends StatelessWidget {
  final DailyTask task;
  final bool selected;
  final VoidCallback onTap;
  final VoidCallback onToggle;

  const _PlanActionTile({
    required this.task,
    required this.selected,
    required this.onTap,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final icon = ActionPlanTaskCatalog.iconForTaskId(task.id);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Ink(
          decoration: BoxDecoration(
            color: kSettingsCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: kSettingsBorder),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: kSettingsInputBg,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: Icon(
                    icon,
                    size: 21,
                    color: kSettingsSectionLabel,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    task.label,
                    style: settingsLex(
                      size: 15,
                      weight: selected ? FontWeight.w700 : FontWeight.w500,
                      color: kSettingsTitleColor,
                    ),
                  ),
                ),
                if (selected)
                  IconButton(
                    visualDensity: VisualDensity.compact,
                    onPressed: onToggle,
                    icon: const Icon(
                      Icons.close_rounded,
                      size: 20,
                      color: Color(0xFF6B7280),
                    ),
                  )
                else
                  Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: const Color(0xFFE5E7EB),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
