import 'dart:math' as math;
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../core/models/user_preferences.dart';
import '../../core/models/weather_data.dart';
import '../../core/utils/share_text.dart';
import '../../core/services/tts_service.dart';
import '../../core/services/daily_task_service.dart';
import '../../core/services/plan_message_service.dart';
import '../../core/services/weather_message_service.dart';
import '../../core/utils/decision_engine.dart';
import '../../core/utils/weather_theme.dart';
import '../locations/locations_provider.dart';
import '../locations/locations_screen.dart';
import '../settings/settings_screen.dart';
import '../tasks/action_plan_screen.dart';
import '../tasks/action_plan_task_catalog.dart';
import '../tasks/daily_task_provider.dart';
import '../../l10n/gen_l10n/app_localizations.dart';
import 'home_provider.dart';
import 'widgets/figma_layout.dart';
import 'widgets/figma_weather_lucide_icon.dart';
import 'widgets/particle_layer.dart';

// ── Figma WeatherAssistant.tsx — border white/20 ────────────────────────────

const Color _kFigmaGlassBorder = Color(0x33FFFFFF);
const double _kFigmaBlurMd = 12;

TextStyle _font({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = Colors.white,
  double? height,
  double? letterSpacing,
}) =>
    GoogleFonts.lexend(
      fontSize: size,
      fontWeight: weight,
      color: color,
      height: height,
      letterSpacing: letterSpacing,
    );

String _shareFooter(AppLocalizations? l10n) =>
    '\n\n— ${l10n?.appTitle ?? 'Skyde'}';

String _shareMainWeatherText(
  BuildContext context,
  String headline,
  String subtitle,
  String? locationName,
) {
  final l10n = AppLocalizations.of(context);
  final loc = locationName?.trim() ?? '';
  final header =
      loc.isEmpty ? '' : '$loc\n\n';
  return '$header${headline.trim()}\n\n${subtitle.trim()}${_shareFooter(l10n)}';
}

class _ShareIconButton extends StatelessWidget {
  const _ShareIconButton({
    required this.theme,
    required this.text,
    required this.tooltip,
  });

  final WeatherTheme theme;
  final String text;
  final String tooltip;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => sharePlainText(text),
          borderRadius: BorderRadius.circular(999),
          child: Padding(
            padding: const EdgeInsets.all(4),
            child: Icon(
              LucideIcons.share_2,
              size: 22,
              color: theme.textColor.withOpacity(0.88),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Ana Ekran ─────────────────────────────────────────────────────────────────

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _tabIndex = 0; // 0=Bugün 1=Yarın 2=Haftalık

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final hp = context.read<HomeProvider>();
      // Açılışta [_AppEntry] zaten ilk hava yüklemesini bitirdiyse tekrar istek atma.
      final alreadyReady = hp.status == HomeStatus.success && hp.weatherData != null;
      if (!alreadyReady) {
        hp.loadData(locationsProvider: context.read<LocationsProvider>());
      }
      _initTasks();
    });
  }

  Future<void> _initTasks() async {
    await DailyTaskService.init();
    if (!mounted) return;
    final homeProvider = context.read<HomeProvider>();
    final prefs = homeProvider.prefs;
    if (prefs != null) {
      final tp = context.read<DailyTaskProvider>();
      await tp.loadTasks(prefs.mode);
      if (homeProvider.weatherData != null && homeProvider.decision != null) {
        tp.updateAlerts(
            homeProvider.weatherData!, homeProvider.decision!, prefs.mode);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<HomeProvider>();
    // Sekmeye göre tema ve tip (Bugün/Yarın/Haftalık)
    WeatherTheme? displayTheme = provider.theme;
    WeatherDisplayType? displayType;
    String? headlineText;
    String? subtitleText;
    bool isDark = displayTheme?.isDark ?? false;

    if (provider.status == HomeStatus.success &&
        provider.weatherData != null &&
        provider.prefs != null &&
        provider.decision != null) {
      final data = provider.weatherData!;
      final prefs = provider.prefs!;
      final decision = provider.decision!;
      displayType = WeatherTheme.displayTypeForTab(_tabIndex, data);
      displayTheme = WeatherTheme.forHome(
        data: data,
        displayType: displayType,
        mode: prefs.mode,
        tabIndex: _tabIndex,
      );
      isDark = displayTheme.isDark;

      final msgType = data.messageType;
      final slot = TimeSlotExt.fromHour(DateTime.now().hour);

      switch (_tabIndex) {
        case 0:
          headlineText = WeatherMessageService.headline(
            msgType,
            prefs.mode,
            slot,
            data,
            decision,
            todayHourly: data.todayHourly,
          );
          subtitleText = WeatherMessageService.subtitle(
            msgType,
            prefs.mode,
            slot,
            data,
            decision,
            todayHourly: data.todayHourly,
          );
          break;
        case 1:
          if (data.weeklyDaily.length > 1) {
            final tomorrowDaily = data.weeklyDaily[1];
            headlineText = WeatherMessageService.tomorrowHeadline(
              tomorrowDaily,
              prefs.mode,
              data.tomorrowHourly,
            );
            subtitleText = WeatherMessageService.tomorrowSubtitle(
                tomorrowDaily, prefs.mode);
          } else {
            headlineText = WeatherMessageService.headline(
              msgType,
              prefs.mode,
              slot,
              data,
              decision,
              todayHourly: data.todayHourly,
            );
            subtitleText = WeatherMessageService.subtitle(
              msgType,
              prefs.mode,
              slot,
              data,
              decision,
              todayHourly: data.todayHourly,
            );
          }
          break;
        case 2:
          headlineText = WeatherMessageService.weeklyHeadline(
              data.weeklyDaily, prefs.mode);
          subtitleText = WeatherMessageService.weeklySubtitle(data.weeklyDaily);
          break;
        default:
          headlineText = WeatherMessageService.headline(
            msgType,
            prefs.mode,
            slot,
            data,
            decision,
            todayHourly: data.todayHourly,
          );
          subtitleText = WeatherMessageService.subtitle(
            msgType,
            prefs.mode,
            slot,
            data,
            decision,
            todayHourly: data.todayHourly,
          );
      }

      // Görev uyarılarını güncelle
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          context
              .read<DailyTaskProvider>()
              .updateAlerts(data, decision, prefs.mode);
        }
      });

    }

    // Status bar + nav bar rengi sekmeye göre temadan
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      statusBarBrightness: isDark ? Brightness.dark : Brightness.light,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarDividerColor: Colors.transparent,
      systemNavigationBarIconBrightness:
          isDark ? Brightness.light : Brightness.dark,
      // Üstte OS’in eklediği koyu “kontrast” şeridini kapatır
      systemStatusBarContrastEnforced: false,
      systemNavigationBarContrastEnforced: false,
    ));

    return Scaffold(
      // Gradyanın ilk rengi: arka plan tam dolmazsa siyah şerit yerine uyumlu ton
      backgroundColor: const Color(0xFF1a1a2e),
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Gradyan — status bar / eski başlık alanı dahil tam ekran
          Positioned.fill(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 650),
              transitionBuilder: (child, anim) =>
                  FadeTransition(opacity: anim, child: child),
              child: _GradientBg(
                key: ValueKey('bg_${_tabIndex}_${displayType?.name ?? "x"}'),
                gradient: displayTheme?.gradient ??
                    const LinearGradient(
                      colors: [Color(0xFF1a1a2e), Color(0xFF16213e)],
                    ),
              ),
            ),
          ),

          // 2. Partikül katmanı — sekmeye göre tip değişir
          if (provider.weatherData != null && displayType != null)
            Positioned.fill(
              child: IgnorePointer(
                child: RepaintBoundary(
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 700),
                    transitionBuilder: (child, anim) =>
                        FadeTransition(opacity: anim, child: child),
                    child: ParticleLayer(
                      key: ValueKey(
                          'part_${_tabIndex}_${displayType.name}_${WeatherTheme.isStormVisual(provider.weatherData!, _tabIndex)}'),
                      type: displayType,
                      isDark: isDark,
                      stormVisual: WeatherTheme.isStormVisual(
                          provider.weatherData!, _tabIndex),
                    ),
                  ),
                ),
              ),
            ),

          // 3. İçerik — üstte ayrı “gri/siyah bant” yok; çentik için sadece içerik padding’i
          SafeArea(
            top: false,
            child: switch (provider.status) {
              HomeStatus.loading => _buildLoading(context, isDark),
              HomeStatus.error => _buildError(context, provider, isDark),
              HomeStatus.success => _buildSuccess(
                  context,
                  provider,
                  isDark,
                  displayTheme!,
                  displayType!,
                  headlineText!,
                  subtitleText!,
                ),
            },
          ),
        ],
      ),
    );
  }

  // ── Yükleniyor ────────────────────────────────────────────────────────────

  Widget _buildLoading(BuildContext context, bool isDark) {
    final textColor = isDark ? Colors.white : const Color(0xFF0A2540);
    final top = MediaQuery.of(context).viewPadding.top;
    return Padding(
      padding: EdgeInsets.only(top: top),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(
              color: textColor.withOpacity(0.7),
              strokeWidth: 2.5,
            ),
            const SizedBox(height: 20),
            Text(
              'Hava durumu alınıyor…',
              style: _font(size: 15, color: textColor.withOpacity(0.7)),
            ),
          ],
        ),
      ),
    );
  }

  // ── Hata ──────────────────────────────────────────────────────────────────

  Widget _buildError(BuildContext context, HomeProvider provider, bool isDark) {
    const textColor = Colors.white;
    final top = MediaQuery.of(context).viewPadding.top;
    return Padding(
      padding: EdgeInsets.only(top: top),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
            const Text('⚠️', style: TextStyle(fontSize: 64)),
            const SizedBox(height: 16),
            Text(
              'Veri alınamadı',
              style: _font(
                  size: 20,
                  weight: FontWeight.w700,
                  color: textColor,
                  height: 1.2),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              provider.errorMessage ?? '',
              style: _font(size: 13, color: textColor.withOpacity(0.65)),
              textAlign: TextAlign.center,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 28),
            _GlassButton(
              isDark: true,
              glassColor: const Color(0x33FFFFFF),
              glassStroke: const Color(0x55FFFFFF),
              onTap: () => provider.loadData(
                locationsProvider: context.read<LocationsProvider>(),
              ),
              child: Text(
                'Tekrar Dene',
                style: _font(
                    size: 14, weight: FontWeight.w700, color: Colors.white),
              ),
            ),
            const SizedBox(height: 12),
            _GlassButton(
              isDark: true,
              glassColor: const Color(0x22FFFFFF),
              glassStroke: const Color(0x44FFFFFF),
              onTap: () async {
                final loaded = await provider.loadFromCache();
                if (mounted && !loaded) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                          'Önbellekte veri yok. Önce internetle açıp veri alın.'),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                }
              },
              child: Text(
                'Önbellekteki veriyi göster',
                style: _font(
                    size: 14, weight: FontWeight.w600, color: Colors.white70),
              ),
            ),
            ],
          ),
        ),
      ),
    );
  }

  void _speakSummary(
    BuildContext context,
    WeatherData data,
    UserPreferences prefs,
    String headline,
    String subtitle, {
    List<String>? planSpeechLines,
  }) {
    final cleanHead = headline.replaceAll('\n', ' ');
    var text = '${prefs.name}, $cleanHead. $subtitle';
    if (planSpeechLines != null && planSpeechLines.isNotEmpty) {
      text += ' Planların: ${planSpeechLines.join(' ')}';
    }
    TtsService.speak(text);
  }

  PlanScope _scopeForTab(int tabIndex) {
    return switch (tabIndex) {
      0 => PlanScope.today,
      1 => PlanScope.tomorrow,
      _ => PlanScope.weekly,
    };
  }

  String _planLabelForTab(int tabIndex) {
    return switch (tabIndex) {
      0 => 'Bugünü Planla',
      1 => 'Yarını Planla',
      _ => 'Haftayı Planla',
    };
  }

  Future<void> _openPlanPage(
    BuildContext context, {
    required UserMode mode,
    required int tabIndex,
  }) async {
    await Navigator.push<void>(
      context,
      MaterialPageRoute<void>(
        builder: (_) => ActionPlanScreen(
          mode: mode,
          tabIndex: tabIndex,
        ),
      ),
    );
  }

  String _formatPlanHm(int m) =>
      '${(m ~/ 60).toString().padLeft(2, '0')}:${(m % 60).toString().padLeft(2, '0')}';

  void _showPlannedList(
    BuildContext context, {
    required PlanScope scope,
    required WeatherTheme theme,
  }) {
    final selected = context.read<DailyTaskProvider>().plansForScope(scope);
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: theme.glassColor.withOpacity(0.95),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: Text(
          'Plan Listesi',
          style:
              _font(size: 16, weight: FontWeight.w800, color: theme.textColor),
        ),
        content: selected.isEmpty
            ? Text(
                'Henüz görev seçmedin.',
                style: _font(size: 13, color: theme.subtitleColor),
              )
            : SizedBox(
                width: 280,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: selected
                      .map((e) => Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: Text(
                              '• ${e.taskLabel} (${_formatPlanHm(e.startMinute)})',
                              style: _font(
                                size: 13,
                                color: theme.textColor,
                                height: 1.35,
                              ),
                            ),
                          ))
                      .toList(),
                ),
              ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Kapat',
              style: _font(
                  size: 13, weight: FontWeight.w700, color: theme.textColor),
            ),
          ),
        ],
      ),
    );
  }

  static String _lastUpdateText(DateTime? time, bool fromCache) {
    if (time == null) return '';
    final min = DateTime.now().difference(time).inMinutes;
    if (min < 1) {
      return fromCache ? 'Önbellekten · Az önce' : 'Az önce güncellendi';
    }
    if (min < 60) {
      return fromCache
          ? 'Önbellekten · $min dk önce'
          : 'Veriler $min dk önce güncellendi';
    }
    final h = min ~/ 60;
    return fromCache
        ? 'Önbellekten · $h saat önce'
        : 'Veriler $h saat önce güncellendi';
  }

  // ── Başarılı ──────────────────────────────────────────────────────────────

  Widget _buildSuccess(
    BuildContext context,
    HomeProvider provider,
    bool isDark,
    WeatherTheme displayTheme,
    WeatherDisplayType displayType,
    String headline,
    String subtitle,
  ) {
    final data = provider.weatherData!;
    final decision = provider.decision!;
    final prefs = provider.prefs!;
    final theme = displayTheme;
    final type = displayType;
    final taskProvider = context.watch<DailyTaskProvider>();
    final scope = _scopeForTab(_tabIndex);
    final planAlerts =
        taskProvider.alertsForScope(scope, data, decision, prefs.mode);
    final sortedEffectivePlans = List<ActionPlanDetail>.from(
      taskProvider.effectivePlansForScope(scope),
    )..sort((a, b) {
        final c = a.startMinute.compareTo(b.startMinute);
        if (c != 0) return c;
        final ae = a.endMinute ?? a.startMinute;
        final be = b.endMinute ?? b.startMinute;
        return ae.compareTo(be);
      });

    // Sekmeye göre istatistikler (Bugün / Yarın / Haftalık)
    List<StatData> stats;
    if (_tabIndex == 1 && data.weeklyDaily.length > 1) {
      // Yarın
      final d = data.weeklyDaily[1];
      stats = [
        StatData(
            'Yarın Max', '${d.tempMax.round()}°C', StatIconType.thermometer),
        StatData(
            'Yarın Min', '${d.tempMin.round()}°C', StatIconType.thermometer),
        StatData('Yağış İht.', '%${d.precipProbMax}', StatIconType.cloudRain),
        StatData('Rüzgar', '${d.windSpeedMax.round()} km/s', StatIconType.wind),
      ];
    } else if (_tabIndex == 2 && data.weeklyDaily.isNotEmpty) {
      // Haftalık
      final days = data.weeklyDaily;
      final maxT = days.map((d) => d.tempMax).reduce((a, b) => a > b ? a : b);
      final minT = days.map((d) => d.tempMin).reduce((a, b) => a < b ? a : b);
      final rain = days.where((d) => d.precipProbMax >= 50).length;
      final frost = days.where((d) => d.tempMin <= 0).length;
      stats = [
        StatData('Hafta Max', '${maxT.round()}°C', StatIconType.thermometer),
        StatData('Hafta Min', '${minT.round()}°C', StatIconType.thermometer),
        StatData('Yağışlı Gün', '$rain gün', StatIconType.cloudRain),
        StatData(
            'Don Riski', frost > 0 ? '$frost gün' : 'Yok', StatIconType.layers),
      ];
    } else {
      // Bugün (varsayılan)
      stats = WeatherTheme.stats(data.weatherType, prefs.mode, data);
    }

    // 4 metrik: şehir → statsCityFourForTab; çiftçi → tab’a göre üretilen stats (4 öğe)
    final List<StatData> statsGrid = prefs.mode == UserMode.city
        ? WeatherTheme.statsCityFourForTab(data, _tabIndex)
        : stats.take(4).toList();

    return Column(
      children: [
        // ── Header — status bar yok; sadece çentik + küçük nefes payı
        Padding(
          padding: EdgeInsets.fromLTRB(
            FigmaLayout.padH,
            MediaQuery.of(context).viewPadding.top + 12,
            FigmaLayout.padH,
            0,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _LocationChip(
                name: provider.activeLocationName,
                theme: theme,
                onTap: () async {
                  await Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const LocationsScreen()),
                  );
                  if (context.mounted) {
                    context.read<HomeProvider>().loadData(
                          locationsProvider: context.read<LocationsProvider>(),
                        );
                  }
                },
              ),
              _GlassIconButton(
                theme: theme,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SettingsScreen()),
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: FigmaLayout.gapAfterHeader),

        // ── Tab + TTS — rounded-3xl p-2 gap-2 mb-5 ───────────────────────────
        _TabBar(
          selected: _tabIndex,
          theme: theme,
          onSelect: (i) => setState(() => _tabIndex = i),
          onTts: () {
            final lines = sortedEffectivePlans
                .map(
                  (p) => PlanMessageService.evaluatePlan(
                    p,
                    scope,
                    data,
                    decision,
                    prefs.mode,
                  ),
                )
                .toList();
            _speakSummary(
              context,
              data,
              prefs,
              headline,
              subtitle,
              planSpeechLines: lines.isEmpty ? null : lines,
            );
          },
        ),
        SizedBox(height: FigmaLayout.gapAfterHeader),

        // Plan — track yüksekliği = diğer üst kontrollerle aynı
        Padding(
          padding: EdgeInsets.symmetric(horizontal: FigmaLayout.padH),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(FigmaLayout.tabBarRadius),
            child: BackdropFilter(
              filter: ImageFilter.blur(
                  sigmaX: _kFigmaBlurMd, sigmaY: _kFigmaBlurMd),
              child: Container(
                height: FigmaLayout.controlTrackHeight,
                padding: EdgeInsets.symmetric(
                  horizontal: FigmaLayout.planRowPaddingH,
                  vertical: FigmaLayout.planRowPaddingV,
                ),
                decoration: BoxDecoration(
                  color: theme.glassColor,
                  borderRadius: BorderRadius.circular(FigmaLayout.tabBarRadius),
                  border: Border.all(color: _kFigmaGlassBorder),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onTap: () => _openPlanPage(
                          context,
                          mode: prefs.mode,
                          tabIndex: _tabIndex,
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: EdgeInsets.all(FigmaLayout.planAccentPadding),
                              decoration: BoxDecoration(
                                color: theme.accentColor,
                                borderRadius: BorderRadius.circular(
                                    FigmaLayout.planAccentRadius),
                              ),
                              child: Icon(
                                LucideIcons.calendar,
                                size: FigmaLayout.planCalendarIconSize,
                                color: ThemeData.estimateBrightnessForColor(
                                            theme.accentColor) ==
                                        Brightness.dark
                                    ? Colors.white
                                    : const Color(0xFF0F172A),
                              ),
                            ),
                            SizedBox(width: FigmaLayout.planRowInnerGap),
                            Expanded(
                              child: Text(
                                _planLabelForTab(_tabIndex),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: _font(
                                  size: FigmaLayout.planTitleSize,
                                  weight: FontWeight.w600,
                                  color: theme.glassText,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    GestureDetector(
                      onTap: () => _showPlannedList(
                        context,
                        scope: _scopeForTab(_tabIndex),
                        theme: theme,
                      ),
                      child: Stack(
                        clipBehavior: Clip.none,
                        alignment: Alignment.center,
                        children: [
                          Icon(
                            LucideIcons.list,
                            size: FigmaLayout.glassIconMd,
                            color: theme.textColor.withOpacity(0.95),
                          ),
                          if (taskProvider.plannedCount(
                                  _scopeForTab(_tabIndex)) >
                              0)
                            Positioned(
                              right: -6,
                              top: -6,
                              child: Container(
                                constraints: const BoxConstraints(minWidth: 18),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 5, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF22C55E),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: Text(
                                  '${taskProvider.plannedCount(_scopeForTab(_tabIndex))}',
                                  textAlign: TextAlign.center,
                                  style: _font(
                                    size: 10,
                                    weight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        SizedBox(height: FigmaLayout.gapAfterPlan),

        // ── Ana içerik — px-5, space-y-4 ────────────────────────────────────
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => provider.loadData(
              locationsProvider: context.read<LocationsProvider>(),
            ),
            color: theme.textColor,
            backgroundColor: theme.glassColor,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                children: [
                  Center(
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 550),
                      transitionBuilder: (child, anim) => ScaleTransition(
                        scale: Tween(begin: 0.7, end: 1.0).animate(
                          CurvedAnimation(
                              parent: anim, curve: Curves.easeOutBack),
                        ),
                        child: FadeTransition(opacity: anim, child: child),
                      ),
                      child: _WeatherIconCard(
                        key: ValueKey(
                            'icon_${prefs.mode.name}_${type.name}_${WeatherTheme.isStormVisual(data, _tabIndex)}'),
                        type: type,
                        iconColor: theme.iconColor,
                        glassColor: theme.glassColor,
                        glassStroke: theme.glassStroke,
                        isNight: prefs.mode == UserMode.city &&
                            (DateTime.now().hour >= 20 ||
                                DateTime.now().hour < 6),
                        stormVisual:
                            WeatherTheme.isStormVisual(data, _tabIndex),
                      ),
                    ),
                  ),
                  SizedBox(height: FigmaLayout.gapAfterPlan),
                  // Ana metin — rounded-3xl p-6, w-16 h-1 accent, text-base leading-7
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: FigmaLayout.padH),
                    child: ClipRRect(
                      borderRadius:
                          BorderRadius.circular(FigmaLayout.cardRadiusLg),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(
                            sigmaX: _kFigmaBlurMd, sigmaY: _kFigmaBlurMd),
                        child: Container(
                          width: double.infinity,
                          padding: EdgeInsets.all(FigmaLayout.mainCardPadding),
                          decoration: BoxDecoration(
                            color: theme.glassColor,
                            borderRadius:
                                BorderRadius.circular(FigmaLayout.cardRadiusLg),
                            border: Border.all(color: _kFigmaGlassBorder),
                          ),
                          child: Column(
                            children: [
                              Center(
                                child: Container(
                                  width: FigmaLayout.accentBarW,
                                  height: FigmaLayout.accentBarH,
                                  decoration: BoxDecoration(
                                    color: theme.accentColor,
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Column(
                                      children: [
                                        Text(
                                          headline,
                                          textAlign: TextAlign.center,
                                          style: _font(
                                            size: 16,
                                            weight: FontWeight.w500,
                                            color: theme.textColor,
                                            height: 1.75,
                                          ),
                                        ),
                                        const SizedBox(height: 16),
                                        Text(
                                          subtitle,
                                          textAlign: TextAlign.center,
                                          style: _font(
                                            size: 14,
                                            weight: FontWeight.w400,
                                            color: theme.subtitleColor
                                                .withOpacity(0.9),
                                            height: 1.5,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  _ShareIconButton(
                                    theme: theme,
                                    tooltip: AppLocalizations.of(context)
                                            ?.shareAction ??
                                        'Paylaş',
                                    text: _shareMainWeatherText(
                                      context,
                                      headline,
                                      subtitle,
                                      provider.activeLocationName,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  if (sortedEffectivePlans.isNotEmpty) ...[
                    SizedBox(height: FigmaLayout.sectionGap),
                    for (var pi = 0; pi < sortedEffectivePlans.length; pi++) ...[
                      if (pi > 0) SizedBox(height: FigmaLayout.sectionGap),
                      Padding(
                        padding:
                            EdgeInsets.symmetric(horizontal: FigmaLayout.padH),
                        child: _PlannedActionGlassCard(
                          plan: sortedEffectivePlans[pi],
                          scope: scope,
                          data: data,
                          decision: decision,
                          mode: prefs.mode,
                          theme: theme,
                        ),
                      ),
                    ],
                  ],
                  if (_tabIndex == 0) ...[
                    SizedBox(height: FigmaLayout.sectionGap),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: FigmaLayout.padH),
                      child: ClipRRect(
                        borderRadius:
                            BorderRadius.circular(FigmaLayout.cardRadiusLg),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(
                              sigmaX: _kFigmaBlurMd, sigmaY: _kFigmaBlurMd),
                          child: Container(
                            width: double.infinity,
                            padding: EdgeInsets.all(FigmaLayout.mainCardPadding),
                            decoration: BoxDecoration(
                              color: theme.glassColor,
                              borderRadius: BorderRadius.circular(
                                  FigmaLayout.cardRadiusLg),
                              border: Border.all(color: _kFigmaGlassBorder),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      width: 8,
                                      height: 8,
                                      decoration: BoxDecoration(
                                        color: theme.accentColor,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        'Bugünün Özeti',
                                        style: _font(
                                          size: 16,
                                          weight: FontWeight.w600,
                                          color: theme.textColor,
                                        ),
                                      ),
                                    ),
                                    _ShareIconButton(
                                      theme: theme,
                                      tooltip: AppLocalizations.of(context)
                                              ?.shareAction ??
                                          'Paylaş',
                                      text:
                                          'Bugünün Özeti\n\n${WeatherMessageService.todaySummary(
                                        data,
                                        prefs.mode,
                                        decision,
                                      )}${_shareFooter(AppLocalizations.of(context))}',
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  WeatherMessageService.todaySummary(
                                    data,
                                    prefs.mode,
                                    decision,
                                  ),
                                  textAlign: TextAlign.justify,
                                  style: _font(
                                    size: 14,
                                    weight: FontWeight.w400,
                                    color: theme.glassText.withOpacity(0.9),
                                    height: 1.75,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                  SizedBox(height: FigmaLayout.sectionGap),

                  // İstatistik — grid pt-2, gap-3, rounded-3xl p-5
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 450),
                    child: Padding(
                      key: ValueKey(
                          'stats_${prefs.mode.name}_${type.name}_$_tabIndex'),
                      padding: EdgeInsets.fromLTRB(
                        FigmaLayout.padH,
                        8,
                        FigmaLayout.padH,
                        0,
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: statsGrid
                            .map(
                              (s) => Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 3),
                                  child: _StatCard(
                                    stat: s,
                                    theme: theme,
                                  ),
                                ),
                              ),
                            )
                            .toList(),
                      ),
                    ),
                  ),

                  if (provider.lastFetchTime != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      _lastUpdateText(
                          provider.lastFetchTime, provider.fromCache),
                      style: _font(
                        size: 11,
                        weight: FontWeight.w400,
                        color: theme.subtitleColor.withOpacity(0.8),
                      ),
                    ),
                  ],
                  const SizedBox(height: 14),

                  // ── Tab İçeriği ─────────────────────────────────────────
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    transitionBuilder: (child, anim) => FadeTransition(
                      opacity: anim,
                      child: SlideTransition(
                        position: Tween<Offset>(
                          begin: const Offset(0, 0.04),
                          end: Offset.zero,
                        ).animate(CurvedAnimation(
                            parent: anim, curve: Curves.easeOut)),
                        child: child,
                      ),
                    ),
                    child: KeyedSubtree(
                      key: ValueKey(_tabIndex),
                      // Bugün / Yarın: güncelleme satırının altında ek kart yok
                      child: switch (_tabIndex) {
                        0 => const SizedBox.shrink(),
                        1 => const SizedBox.shrink(),
                        _ => _WeeklyTab(
                            data: data,
                            prefs: prefs,
                            theme: theme,
                            planAlerts: planAlerts,
                          ),
                      },
                    ),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 4),
      ],
    );
  }
}

/// Planlanan eylem — ana hava kartı ile aynı cam / accent çubuğu düzeni.
class _PlannedActionGlassCard extends StatelessWidget {
  final ActionPlanDetail plan;
  final PlanScope scope;
  final WeatherData data;
  final WeatherDecision decision;
  final UserMode mode;
  final WeatherTheme theme;

  const _PlannedActionGlassCard({
    required this.plan,
    required this.scope,
    required this.data,
    required this.decision,
    required this.mode,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    final icon = ActionPlanTaskCatalog.iconForTaskId(plan.taskId);
    final timeRange = PlanMessageService.formatPlanTimeRange(plan);
    final body = PlanMessageService.evaluatePlanSubtitle(
      plan,
      scope,
      data,
      decision,
      mode,
    );
    final fullPlan = PlanMessageService.evaluatePlan(
      plan,
      scope,
      data,
      decision,
      mode,
    );
    final shareText =
        '${plan.taskLabel} · $timeRange\n\n$fullPlan${_shareFooter(AppLocalizations.of(context))}';

    return ClipRRect(
      borderRadius: BorderRadius.circular(FigmaLayout.cardRadiusLg),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: _kFigmaBlurMd, sigmaY: _kFigmaBlurMd),
        child: Container(
          width: double.infinity,
          padding: EdgeInsets.all(FigmaLayout.mainCardPadding),
          decoration: BoxDecoration(
            color: theme.glassColor,
            borderRadius: BorderRadius.circular(FigmaLayout.cardRadiusLg),
            border: Border.all(color: _kFigmaGlassBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: FigmaLayout.accentBarW,
                  height: FigmaLayout.accentBarH,
                  decoration: BoxDecoration(
                    color: theme.accentColor,
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: theme.subtitleColor.withOpacity(0.14),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: _kFigmaGlassBorder),
                    ),
                    alignment: Alignment.center,
                    child: Icon(
                      icon,
                      size: 22,
                      color: theme.accentColor,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                plan.taskLabel,
                                style: _font(
                                  size: 16,
                                  weight: FontWeight.w600,
                                  color: theme.textColor,
                                  height: 1.35,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              timeRange,
                              style: _font(
                                size: 13,
                                weight: FontWeight.w600,
                                color: theme.subtitleColor.withOpacity(0.95),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                body,
                                textAlign: TextAlign.left,
                                style: _font(
                                  size: 14,
                                  weight: FontWeight.w400,
                                  color: theme.subtitleColor.withOpacity(0.9),
                                  height: 1.5,
                                ),
                              ),
                            ),
                            _ShareIconButton(
                              theme: theme,
                              tooltip: AppLocalizations.of(context)
                                      ?.shareAction ??
                                  'Paylaş',
                              text: shareText,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Gradyan Arka Plan ─────────────────────────────────────────────────────────

class _GradientBg extends StatelessWidget {
  final LinearGradient gradient;
  const _GradientBg({super.key, required this.gradient});

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: DecoratedBox(
        decoration: BoxDecoration(gradient: gradient),
      ),
    );
  }
}

// ── Konum Chip'i ──────────────────────────────────────────────────────────────

class _LocationChip extends StatelessWidget {
  final String? name;
  final WeatherTheme theme;
  final VoidCallback onTap;

  const _LocationChip(
      {required this.name, required this.theme, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        height: FigmaLayout.controlTrackHeight,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: BackdropFilter(
            filter: ImageFilter.blur(
                sigmaX: _kFigmaBlurMd, sigmaY: _kFigmaBlurMd),
            child: Container(
              padding: EdgeInsets.symmetric(
                horizontal: FigmaLayout.locationPaddingH,
                vertical: FigmaLayout.locationPaddingV,
              ),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: theme.glassColor,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: _kFigmaGlassBorder),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    LucideIcons.map_pin,
                    size: FigmaLayout.controlIconSize,
                    color: theme.textColor,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    name ?? 'Konumum',
                    style: _font(
                      size: FigmaLayout.tabLabelSize,
                      weight: FontWeight.w500,
                      color: theme.textColor,
                      letterSpacing: -0.2,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Icon(
                    LucideIcons.chevron_down,
                    size: FigmaLayout.controlIconSize,
                    color: theme.textColor.withOpacity(0.75),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Cam İkon Butonu ───────────────────────────────────────────────────────────

class _GlassIconButton extends StatelessWidget {
  final WeatherTheme theme;
  final VoidCallback onTap;

  const _GlassIconButton({required this.theme, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(999),
        child: BackdropFilter(
          filter: ImageFilter.blur(
              sigmaX: _kFigmaBlurMd, sigmaY: _kFigmaBlurMd),
          child: Container(
            width: FigmaLayout.settingsButtonSize,
            height: FigmaLayout.settingsButtonSize,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: theme.glassColor,
              borderRadius: BorderRadius.circular(999),
              border: Border.all(color: _kFigmaGlassBorder),
            ),
            child: Icon(
              LucideIcons.settings,
              size: FigmaLayout.controlIconSize,
              color: theme.textColor,
            ),
          ),
        ),
      ),
    );
  }
}

// ── Cam Buton (genel) ─────────────────────────────────────────────────────────

class _GlassButton extends StatelessWidget {
  final bool isDark;
  final Color glassColor;
  final Color glassStroke;
  final VoidCallback onTap;
  final Widget child;

  const _GlassButton({
    required this.isDark,
    required this.glassColor,
    required this.glassStroke,
    required this.onTap,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            decoration: BoxDecoration(
              color: glassColor,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: glassStroke),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}

// ── Hava İkon Kartı (cam efektli 120×120) ────────────────────────────────────

class _WeatherIconCard extends StatefulWidget {
  final WeatherDisplayType type;
  final Color iconColor;
  final Color glassColor;
  final Color glassStroke;
  final bool isNight;
  final bool stormVisual;

  const _WeatherIconCard({
    super.key,
    required this.type,
    required this.iconColor,
    required this.glassColor,
    required this.glassStroke,
    this.isNight = false,
    this.stormVisual = false,
  });

  @override
  State<_WeatherIconCard> createState() => _WeatherIconCardState();
}

class _WeatherIconCardState extends State<_WeatherIconCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: _animDuration,
    )..repeat(reverse: _shouldReverse);
  }

  Duration get _animDuration {
    if (widget.stormVisual) {
      return const Duration(milliseconds: 2500);
    }
    return switch (widget.type) {
      WeatherDisplayType.sunny => const Duration(seconds: 20),
      WeatherDisplayType.cloudy => const Duration(milliseconds: 4500),
      WeatherDisplayType.rainy => const Duration(milliseconds: 2500),
      WeatherDisplayType.snowy => const Duration(seconds: 5),
    };
  }

  bool get _shouldReverse =>
      widget.type != WeatherDisplayType.sunny || widget.isNight;

  @override
  void didUpdateWidget(covariant _WeatherIconCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.type != widget.type ||
        oldWidget.isNight != widget.isNight ||
        oldWidget.stormVisual != widget.stormVisual) {
      _ctrl
        ..duration = _animDuration
        ..reset();
      _ctrl.repeat(reverse: _shouldReverse);
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Widget _motion(Widget child) {
    final v = _ctrl.value;
    if (widget.stormVisual) {
      return Transform.translate(
        offset: Offset(0, -10 * math.sin(v * math.pi)),
        child: child,
      );
    }
    if (widget.type == WeatherDisplayType.sunny && !widget.isNight) {
      return Transform.rotate(
        angle: v * 2 * math.pi,
        child: child,
      );
    }
    if (widget.type == WeatherDisplayType.rainy) {
      return Transform.translate(
        offset: Offset(0, -10 * math.sin(v * math.pi)),
        child: child,
      );
    }
    return Transform.translate(
      offset: Offset(0, -5 * math.sin(v * math.pi)),
      child: child,
    );
  }

  @override
  Widget build(BuildContext context) {
    final icon = FigmaWeatherLucideIcon(
      type: widget.type,
      color: widget.iconColor,
      isNight: widget.isNight,
      stormVisual: widget.stormVisual,
    );
    return ClipRRect(
      borderRadius:
          BorderRadius.circular(FigmaLayout.weatherIconCardRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: _kFigmaBlurMd, sigmaY: _kFigmaBlurMd),
        child: Container(
          padding: const EdgeInsets.all(FigmaLayout.weatherIconCardPadding),
          decoration: BoxDecoration(
            color: widget.glassColor,
            borderRadius:
                BorderRadius.circular(FigmaLayout.weatherIconCardRadius),
            border: Border.all(color: _kFigmaGlassBorder),
          ),
          child: RepaintBoundary(
            child: AnimatedBuilder(
              animation: _ctrl,
              builder: (_, __) => _motion(icon),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Stat Kart (cam) ───────────────────────────────────────────────────────────

class _StatCard extends StatelessWidget {
  final StatData stat;
  final WeatherTheme theme;

  const _StatCard({required this.stat, required this.theme});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(FigmaLayout.cardRadiusLg),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: _kFigmaBlurMd, sigmaY: _kFigmaBlurMd),
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: FigmaLayout.statCardPaddingH,
            vertical: FigmaLayout.statCardPaddingV,
          ),
          decoration: BoxDecoration(
            color: theme.glassColor,
            borderRadius: BorderRadius.circular(FigmaLayout.cardRadiusLg),
            border: Border.all(color: _kFigmaGlassBorder),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Icon(
                  _lucideIcon,
                  size: FigmaLayout.statIconSize,
                  color: theme.iconColor,
                ),
              ),
              SizedBox(height: FigmaLayout.statIconGap),
              SizedBox(
                height: FigmaLayout.statValueMinHeight,
                child: Center(
                  child: Text(
                    stat.value,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: _font(
                      size: FigmaLayout.statValueSize,
                      weight: FontWeight.w700,
                      color: theme.glassText,
                      letterSpacing: -0.3,
                      height: 1.12,
                    ),
                  ),
                ),
              ),
              SizedBox(
                height: FigmaLayout.statLabelMinHeight,
                child: Center(
                  child: Text(
                    stat.label,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: _font(
                      size: FigmaLayout.statLabelSize,
                      weight: FontWeight.w500,
                      color: theme.subtitleColor.withOpacity(0.85),
                      height: 1.25,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData get _lucideIcon => switch (stat.iconType) {
        StatIconType.thermometer => LucideIcons.thermometer,
        StatIconType.droplets => LucideIcons.droplets,
        StatIconType.wind => LucideIcons.wind,
        StatIconType.cloudRain => LucideIcons.cloud_rain,
        StatIconType.layers => LucideIcons.layers,
      };
}

// ── Tab Seçici ────────────────────────────────────────────────────────────────

class _TabBar extends StatelessWidget {
  final int selected;
  final WeatherTheme theme;
  final void Function(int) onSelect;
  final VoidCallback? onTts;

  const _TabBar({
    required this.selected,
    required this.theme,
    required this.onSelect,
    this.onTts,
  });

  static const _labels = ['Bugün', 'Yarın', 'Haftalık'];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: FigmaLayout.padH),
      child: SizedBox(
        height: FigmaLayout.controlTrackHeight,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(FigmaLayout.tabBarRadius),
                child: BackdropFilter(
                  filter: ImageFilter.blur(
                      sigmaX: _kFigmaBlurMd, sigmaY: _kFigmaBlurMd),
                  child: Container(
                    padding: EdgeInsets.all(FigmaLayout.tabBarInnerPadding),
                    decoration: BoxDecoration(
                      color: theme.glassColor,
                      borderRadius:
                          BorderRadius.circular(FigmaLayout.tabBarRadius),
                      border: Border.all(color: _kFigmaGlassBorder),
                    ),
                    child: Row(
                      children: List.generate(3, (i) {
                        final active = selected == i;
                        return Expanded(
                          child: GestureDetector(
                            onTap: () => onSelect(i),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              alignment: Alignment.center,
                              padding: EdgeInsets.symmetric(
                                vertical: FigmaLayout.tabVerticalPadding,
                              ),
                              decoration: BoxDecoration(
                                color: active
                                    ? (theme.isDark
                                        ? Colors.white.withOpacity(0.28)
                                        : Colors.white.withOpacity(0.32))
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(
                                    FigmaLayout.tabPillRadius),
                                boxShadow: active
                                    ? [
                                        BoxShadow(
                                          color: Colors.black.withOpacity(
                                              theme.isDark ? 0.22 : 0.10),
                                          blurRadius: 10,
                                          offset: const Offset(0, 3),
                                        ),
                                      ]
                                    : null,
                              ),
                              child: Text(
                                _labels[i],
                                textAlign: TextAlign.center,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: _font(
                                  size: FigmaLayout.tabLabelSize,
                                  weight: active
                                      ? FontWeight.w600
                                      : FontWeight.w500,
                                  color: theme.textColor
                                      .withOpacity(active ? 1.0 : 0.78),
                                  letterSpacing: -0.2,
                                ),
                              ),
                            ),
                          ),
                        );
                      }),
                    ),
                  ),
                ),
              ),
            ),
            if (onTts != null) ...[
              SizedBox(width: FigmaLayout.tabBarGap),
              GestureDetector(
                onTap: onTts,
                child: ClipRRect(
                  borderRadius:
                      BorderRadius.circular(FigmaLayout.tabPillRadius),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(
                        sigmaX: _kFigmaBlurMd, sigmaY: _kFigmaBlurMd),
                    child: Container(
                      width: FigmaLayout.ttsButtonWidth,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: theme.glassColor,
                        borderRadius:
                            BorderRadius.circular(FigmaLayout.tabPillRadius),
                        border: Border.all(color: _kFigmaGlassBorder),
                      ),
                      child: Icon(
                        LucideIcons.volume_2,
                        size: FigmaLayout.controlIconSize,
                        color: theme.textColor.withOpacity(0.95),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ── Haftalık Tab ──────────────────────────────────────────────────────────────

class _WeeklyTab extends StatelessWidget {
  final WeatherData data;
  final UserPreferences prefs;
  final WeatherTheme theme;
  final List<String> planAlerts;

  const _WeeklyTab({
    required this.data,
    required this.prefs,
    required this.theme,
    required this.planAlerts,
  });

  static const _dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  @override
  Widget build(BuildContext context) {
    final isFarmer = prefs.mode == UserMode.farmer;
    final days = data.weeklyDaily;
    final footer = _shareFooter(AppLocalizations.of(context));
    if (days.isEmpty) {
      return Padding(
        padding: EdgeInsets.symmetric(horizontal: FigmaLayout.padH),
        child: _GlassInfoCard(
          theme: theme,
          icon: Icons.calendar_month_rounded,
          iconColor: const Color(0xFF60A5FA),
          title: 'Haftalık veri yükleniyor',
          body: 'Lütfen bekleyin veya yenileyin.',
        ),
      );
    }

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: FigmaLayout.padH),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Haftalık özet metin
          _GlassInfoCard(
            theme: theme,
            icon: Icons.calendar_month_rounded,
            iconColor: const Color(0xFF818CF8),
            title: '7 Günlük Özet',
            body: WeatherMessageService.weeklyNotes(days, prefs.mode),
            shareText:
                '7 Günlük Özet\n\n${WeatherMessageService.weeklyNotes(days, prefs.mode)}$footer',
          ),
          const SizedBox(height: 10),

          // Günlük liste
          _SectionLabel(
            label: 'Günlük Tahmin',
            icon: Icons.view_list_rounded,
            theme: theme,
          ),
          const SizedBox(height: 8),

          ClipRRect(
            borderRadius: BorderRadius.circular(18),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
              child: Container(
                decoration: BoxDecoration(
                  color: theme.glassColor,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: theme.glassStroke),
                ),
                child: Column(
                  children: List.generate(days.length, (i) {
                    final d = days[i];
                    final isToday = i == 0;
                    final isTomorrow = i == 1;
                    return _DayRow(
                      day: isToday
                          ? 'Bugün'
                          : isTomorrow
                              ? 'Yarın'
                              : _dayNames[d.date.weekday - 1],
                      entry: d,
                      theme: theme,
                      showDivider: i < days.length - 1,
                    );
                  }),
                ),
              ),
            ),
          ),

          const SizedBox(height: 10),

          // Çiftçi haftalık tavsiyesi
          if (isFarmer)
            _GlassInfoCard(
              theme: theme,
              icon: Icons.agriculture_rounded,
              iconColor: const Color(0xFF4ADE80),
              title: 'Bu Hafta Çiftçi Notu',
              body: WeatherMessageService.weeklyNotes(days, UserMode.farmer),
              shareText:
                  'Bu Hafta Çiftçi Notu\n\n${WeatherMessageService.weeklyNotes(days, UserMode.farmer)}$footer',
            ),
          if (planAlerts.isNotEmpty) ...[
            const SizedBox(height: 10),
            for (final alert in planAlerts.take(5)) ...[
              _GlassInfoCard(
                theme: theme,
                icon: Icons.rule_folder_rounded,
                iconColor: const Color(0xFF60A5FA),
                title: 'Planına Özel Dikkat Edilecekler',
                body: alert.replaceAll(RegExp(r'^[^\\w]+'), ''),
                shareText:
                    'Planına Özel Dikkat Edilecekler\n\n${alert.replaceAll(RegExp(r'^[^\\w]+'), '')}$footer',
              ),
              const SizedBox(height: 10),
            ],
          ],
        ],
      ),
    );
  }
}

// ── Yardımcı Bileşenler ───────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  final String label;
  final IconData icon;
  final WeatherTheme theme;

  const _SectionLabel(
      {required this.label, required this.icon, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 12, color: theme.subtitleColor.withOpacity(0.8)),
        const SizedBox(width: 5),
        Text(
          label.toUpperCase(),
          style: _font(
            size: 10,
            weight: FontWeight.w700,
            color: theme.subtitleColor.withOpacity(0.8),
            letterSpacing: 0.8,
          ),
        ),
      ],
    );
  }
}

/// Cam zemin üzerine bilgi kartı
class _GlassInfoCard extends StatelessWidget {
  final WeatherTheme theme;
  final IconData icon;
  final Color iconColor;
  final String title;
  final String body;
  /// Doluysa satır sonunda paylaş ikonu gösterilir (tam paylaşılacak metin).
  final String? shareText;

  const _GlassInfoCard({
    required this.theme,
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.body,
    this.shareText,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: theme.glassColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: theme.glassStroke),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.18),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 18, color: iconColor),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: _font(
                        size: 13,
                        weight: FontWeight.w700,
                        color: theme.textColor,
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      body,
                      style: _font(
                        size: 12,
                        color: theme.subtitleColor,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              if (shareText != null && shareText!.trim().isNotEmpty)
                _ShareIconButton(
                  theme: theme,
                  tooltip: l10n?.shareAction ?? 'Paylaş',
                  text: shareText!,
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Haftalık listede tek gün satırı
class _DayRow extends StatelessWidget {
  final String day;
  final DailyEntry entry;
  final WeatherTheme theme;
  final bool showDivider;

  const _DayRow({
    required this.day,
    required this.entry,
    required this.theme,
    required this.showDivider,
  });

  IconData get _icon => switch (entry.displayType) {
        WeatherDisplayType.sunny => Icons.wb_sunny_rounded,
        WeatherDisplayType.cloudy => Icons.cloud_rounded,
        WeatherDisplayType.rainy => Icons.grain_rounded,
        WeatherDisplayType.snowy => Icons.ac_unit_rounded,
      };

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          child: Row(
            children: [
              // Gün adı
              SizedBox(
                width: 38,
                child: Text(
                  day,
                  style: _font(
                    size: 12,
                    weight: FontWeight.w700,
                    color: theme.textColor,
                    letterSpacing: -0.2,
                  ),
                ),
              ),
              // Hava ikonu
              Icon(_icon, size: 18, color: theme.iconColor),
              const SizedBox(width: 8),
              // Açıklama
              Expanded(
                child: Text(
                  entry.description,
                  style: _font(
                    size: 11,
                    color: theme.subtitleColor,
                  ),
                ),
              ),
              // Yağış ihtimali
              if (entry.precipProbMax > 0)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(
                    color: entry.precipProbMax >= 60
                        ? const Color(0x3360A5FA)
                        : theme.glassColor,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '%${entry.precipProbMax}',
                    style: _font(
                      size: 10,
                      weight: FontWeight.w700,
                      color: entry.precipProbMax >= 60
                          ? const Color(0xFF93C5FD)
                          : theme.subtitleColor,
                    ),
                  ),
                ),
              const SizedBox(width: 8),
              // Sıcaklık
              Text(
                '${entry.tempMax.round()}° / ${entry.tempMin.round()}°',
                style: _font(
                  size: 11,
                  weight: FontWeight.w600,
                  color: theme.textColor,
                ),
              ),
            ],
          ),
        ),
        if (showDivider)
          Divider(
            height: 1,
            color: theme.glassStroke,
            indent: 14,
            endIndent: 14,
          ),
      ],
    );
  }
}

// ── Yardımcı fonksiyon ────────────────────────────────────────────────────────
