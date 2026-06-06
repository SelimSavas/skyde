import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/models/user_preferences.dart';
import '../../core/services/preferences_service.dart';
import 'daily_task_provider.dart';

TextStyle _lex({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = const Color(0xFF111111),
  double? height,
}) =>
    GoogleFonts.lexend(
      fontSize: size,
      fontWeight: weight,
      color: color,
      height: height,
    );

const _bg = Color(0xFFF8F8FC);
const _card = Colors.white;
const _sectionLabel = Color(0xFF6B7280);
const _titleColor = Color(0xFF111111);
const _subtitleGray = Color(0xFF8E8E93);

class CustomizeScreen extends StatefulWidget {
  const CustomizeScreen({super.key});

  @override
  State<CustomizeScreen> createState() => _CustomizeScreenState();
}

class _CustomizeScreenState extends State<CustomizeScreen> {
  UserMode? _mode;

  @override
  void initState() {
    super.initState();
    _loadMode();
  }

  Future<void> _loadMode() async {
    final prefs = await PreferencesService().load();
    setState(() => _mode = prefs.mode);
    if (mounted) {
      context.read<DailyTaskProvider>().loadTasks(prefs.mode);
    }
  }

  @override
  Widget build(BuildContext context) {
    final taskProvider = context.watch<DailyTaskProvider>();

    return Scaffold(
      backgroundColor: _bg,
      body: CustomScrollView(
        slivers: [
          SliverAppBar.large(
            backgroundColor: _bg,
            surfaceTintColor: _bg,
            title: Text(
              'Bugün Ne Yapacaksın?',
              style: _lex(size: 24, weight: FontWeight.w700, color: _titleColor),
            ),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_rounded, size: 20),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                if (_mode != null) ...[
                  Text(
                    _mode == UserMode.city
                        ? 'Şehir Modu Görevleri'
                        : 'Çiftçi Modu Görevleri',
                    style: _lex(
                      size: 12,
                      weight: FontWeight.w600,
                      color: _sectionLabel,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Bugün yapacağın işleri işaretle; hava durumu mesajları ve bildirimlerin buna göre özelleşsin.',
                    style: _lex(size: 13, color: _subtitleGray, height: 1.4),
                  ),
                  const SizedBox(height: 16),
                  _TaskListCard(
                    tasks: taskProvider.tasks,
                    onToggle: (id, val) => taskProvider.toggleTask(id, val),
                    onTogglePersistent: (id, val) =>
                        taskProvider.togglePersistent(id, val),
                  ),
                  const SizedBox(height: 20),
                  _InfoCard(
                    icon: Icons.auto_awesome_rounded,
                    title: 'Nasıl Çalışır?',
                    body: 'Seçtiğin görevlere göre ana ekrandaki hava durumu '
                        'mesajları ve bildirimlerin otomatik özelleşir. '
                        'Örneğin "İlaçlama yapacağım" seçersen ve rüzgar '
                        'kuvvetliyse, sana özel bir uyarı alırsın.',
                  ),
                  const SizedBox(height: 12),
                  _InfoCard(
                    icon: Icons.push_pin_rounded,
                    title: 'Kalıcı Görevler',
                    body: 'Görevin yanındaki 📌 simgesine dokun; o görev her '
                        'gün otomatik aktif olur ve sıfırlanmaz.',
                  ),
                  const SizedBox(height: 40),
                ],
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _TaskListCard extends StatelessWidget {
  final List tasks;
  final void Function(String id, bool val) onToggle;
  final void Function(String id, bool val) onTogglePersistent;

  const _TaskListCard({
    required this.tasks,
    required this.onToggle,
    required this.onTogglePersistent,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: _card,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: List.generate(tasks.length, (i) {
          final task = tasks[i];
          return Column(
            children: [
              _TaskRow(
                label: task.label,
                isActive: task.isActive,
                isPersistent: task.isPersistent,
                onToggle: (val) => onToggle(task.id, val),
                onTogglePersistent: (val) =>
                    onTogglePersistent(task.id, val),
              ),
              if (i < tasks.length - 1)
                Divider(
                  height: 1,
                  indent: 52,
                  color: Colors.grey.withOpacity(0.1),
                ),
            ],
          );
        }),
      ),
    );
  }
}

class _TaskRow extends StatelessWidget {
  final String label;
  final bool isActive;
  final bool isPersistent;
  final ValueChanged<bool> onToggle;
  final ValueChanged<bool> onTogglePersistent;

  const _TaskRow({
    required this.label,
    required this.isActive,
    required this.isPersistent,
    required this.onToggle,
    required this.onTogglePersistent,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => onToggle(!isActive),
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: isActive
                    ? const Color(0xFF2ECC71)
                    : Colors.grey.withOpacity(0.15),
                borderRadius: BorderRadius.circular(7),
              ),
              child: isActive
                  ? const Icon(Icons.check_rounded,
                      size: 16, color: Colors.white)
                  : null,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: _lex(
                  size: 15,
                  weight: isActive ? FontWeight.w600 : FontWeight.w400,
                  color: isActive ? _titleColor : _subtitleGray,
                ),
              ),
            ),
            GestureDetector(
              onTap: () => onTogglePersistent(!isPersistent),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isPersistent
                      ? const Color(0xFFFFF3E0)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '📌',
                  style: TextStyle(
                    fontSize: 16,
                    color: isPersistent ? null : Colors.grey.withOpacity(0.35),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String body;

  const _InfoCard({
    required this.icon,
    required this.title,
    required this.body,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFEEF2FF),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: const Color(0xFF6366F1)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: _lex(
                    size: 13,
                    weight: FontWeight.w700,
                    color: const Color(0xFF4338CA),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  body,
                  style: _lex(
                    size: 12,
                    color: const Color(0xFF6366F1),
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
