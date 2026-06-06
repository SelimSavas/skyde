import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/app_locale_notifier.dart';
import '../../core/constants/app_urls.dart';
import '../../core/models/user_preferences.dart';
import '../../core/services/preferences_service.dart';
import '../../core/services/tts_service.dart';
import '../home/home_provider.dart';
import '../tasks/daily_task_provider.dart';
import '../farmer/farmer_screen.dart';
import '../legal/privacy_policy_screen.dart';
import '../locations/locations_screen.dart';
import '../tasks/customize_screen.dart';
import '../../l10n/gen_l10n/app_localizations.dart';
import 'settings_ui.dart';

// ── Ana Ekran ─────────────────────────────────────────────────────────────────

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _prefsService   = PreferencesService();
  final _nameController = TextEditingController();

  UserPreferences? _prefs;
  bool _nameSaved = false;
  String _appVersion = '…';

  @override
  void initState() {
    super.initState();
    _loadPrefs();
    _loadVersion();
  }

  Future<void> _loadVersion() async {
    final info = await PackageInfo.fromPlatform();
    if (!mounted) return;
    setState(() => _appVersion = '${info.version}+${info.buildNumber}');
  }

  Future<void> _loadPrefs() async {
    final p = await _prefsService.load();
    setState(() {
      _prefs = p;
      _nameController.text = p.name;
    });
  }

  Future<void> _save() async {
    if (_prefs != null) await _prefsService.save(_prefs!);
  }

  void _speakCurrentSummary() {
    final home = context.read<HomeProvider>();
    final data = home.weatherData;
    final prefs = home.prefs;
    if (data == null || prefs == null) {
      TtsService.speak('Hava durumu henüz yüklenmedi. Lütfen ana sayfayı açıp bekleyin.');
      return;
    }
    final part1 = '${prefs.name}, bugün ${data.weatherDescription}. Sıcaklık ${data.temperature.round()} derece.';
    final part2 = data.precipitationProbability >= 50
        ? ' Yağış ihtimali yüzde ${data.precipitationProbability.round()}.'
        : '';
    TtsService.speak(part1 + part2);
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
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
      child: _buildScaffold(),
    );
  }

  Widget _buildScaffold() {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: kSettingsBackground,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SettingsPageHeader(
              title: l10n.settingsTitle,
              subtitle: l10n.settingsSubtitle,
              onClose: () => Navigator.pop(context),
            ),
            Expanded(
              child: _prefs == null
                  ? const Center(child: CircularProgressIndicator())
                  : ListView(
                      padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
                      children: [
                        SettingsSection(
                          label: '🎛️  ${l10n.settingsSectionUserMode}',
                          child: _ModeToggle(
                            mode: _prefs!.mode,
                            cityLabel: l10n.onboarding_cityMode,
                            citySub: l10n.settingsCityModeSub,
                            farmerLabel: l10n.onboarding_farmerMode,
                            farmerSub: l10n.settingsFarmerModeSub,
                            onChanged: (m) async {
                              setState(() => _prefs = _prefs!.copyWith(mode: m));
                              await _save();
                              if (!mounted) return;
                              await context
                                  .read<HomeProvider>()
                                  .reloadPrefsFromStorage();
                              if (!mounted) return;
                              final mode = context
                                      .read<HomeProvider>()
                                      .prefs
                                      ?.mode ??
                                  m;
                              await context
                                  .read<DailyTaskProvider>()
                                  .loadTasks(mode);
                            },
                          ),
                        ),
                        const SizedBox(height: 20),
                        SettingsSection(
                          label: '👤  ${l10n.settingsSectionName}',
                          child: _NameInput(
                            controller: _nameController,
                            saved: _nameSaved,
                            hint: l10n.settingsNameHint,
                            onSave: () {
                              final name = _nameController.text.trim();
                              if (name.isEmpty) return;
                              setState(() {
                                _prefs = _prefs!.copyWith(name: name);
                                _nameSaved = true;
                              });
                              _save();
                              Future.delayed(
                                const Duration(milliseconds: 1800),
                                () {
                                  if (mounted) setState(() => _nameSaved = false);
                                },
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 20),
                        SettingsSection(
                          label: '🔔  ${l10n.settingsSectionNotifications}',
                          child: SettingsCard(
                            children: [
                              _NotifRow(
                                iconBg: const Color(0x1A6366F1),
                                iconColor: const Color(0xFF6366F1),
                                icon: Icons.notifications_rounded,
                                label: l10n.settingsNotifications,
                                sub: l10n.settingsNotifAllSub,
                                value: _prefs!.notificationsEnabled,
                                divider: true,
                                onChanged: (v) {
                                  setState(() => _prefs =
                                      _prefs!.copyWith(notificationsEnabled: v));
                                  _save();
                                },
                              ),
                              _NotifRow(
                                iconBg: const Color(0x1A10B981),
                                iconColor: const Color(0xFF10B981),
                                icon: Icons.nightlight_round,
                                label: l10n.settingsEveningSummary,
                                sub: l10n.settingsEveningSummarySub,
                                value: _prefs!.notificationsEveningSummary,
                                divider: true,
                                onChanged: (v) {
                                  setState(() => _prefs =
                                      _prefs!.copyWith(notificationsEveningSummary: v));
                                  _save();
                                },
                              ),
                              _NotifRow(
                                iconBg: const Color(0x1AF59E0B),
                                iconColor: const Color(0xFFF59E0B),
                                icon: Icons.warning_amber_rounded,
                                label: l10n.settingsCriticalAlerts,
                                sub: l10n.settingsCriticalAlertsSub,
                                value: _prefs!.notificationsCriticalAlerts,
                                divider: true,
                                onChanged: (v) {
                                  setState(() => _prefs =
                                      _prefs!.copyWith(notificationsCriticalAlerts: v));
                                  _save();
                                },
                              ),
                              _NotifRow(
                                iconBg: const Color(0x1A3B82F6),
                                iconColor: const Color(0xFF3B82F6),
                                icon: Icons.water_drop_rounded,
                                label: l10n.settingsPrecipitationAlerts,
                                sub: l10n.settingsPrecipitationAlertsSub,
                                value: _prefs!.notificationsPrecipitationAlerts,
                                divider: true,
                                onChanged: (v) {
                                  setState(() => _prefs =
                                      _prefs!.copyWith(notificationsPrecipitationAlerts: v));
                                  _save();
                                },
                              ),
                              _NotifRow(
                                iconBg: const Color(0x1A22C55E),
                                iconColor: const Color(0xFF22C55E),
                                icon: Icons.event_note_rounded,
                                label: l10n.settingsPlanReminders,
                                sub: l10n.settingsPlanRemindersSub,
                                value: _prefs!.notificationsPlanAlerts,
                                onChanged: (v) {
                                  setState(() => _prefs =
                                      _prefs!.copyWith(notificationsPlanAlerts: v));
                                  _save();
                                },
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                        SettingsSection(
                          label: '🔊  ${l10n.settingsSectionVoice}',
                          child: SettingsCard(
                            children: [
                              _NotifRow(
                                iconBg: const Color(0x1A8B5CF6),
                                iconColor: const Color(0xFF8B5CF6),
                                icon: Icons.record_voice_over_rounded,
                                label: l10n.settingsVoice,
                                sub: l10n.settingsTtsSub,
                                value: _prefs!.voiceEnabled,
                                divider: true,
                                onChanged: (v) {
                                  setState(() => _prefs =
                                      _prefs!.copyWith(voiceEnabled: v));
                                  _save();
                                },
                              ),
                              _VoiceDemoRow(
                                onSpeak: _speakCurrentSummary,
                                listenLabel: l10n.settingsVoiceButton,
                                subLabel: l10n.settingsVoiceDemoSub,
                              ),
                              Padding(
                                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                                child: Text(
                                  l10n.settingsTtsHint,
                                  style: settingsLex(size: 11, color: kSettingsSubtitleGray),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                        SettingsSection(
                          label: '📍  ${l10n.settingsSectionLocations}',
                          child: SettingsCard(
                            children: [
                              _NavRow(
                                iconBg: const Color(0x1A6366F1),
                                iconColor: const Color(0xFF6366F1),
                                icon: Icons.place_rounded,
                                label: l10n.settingsManageLocations,
                                sub: l10n.settingsManageLocationsSub,
                                onTap: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (_) => const LocationsScreen()),
                                ),
                              ),
                              _NavRow(
                                iconBg: const Color(0x1A22C55E),
                                iconColor: const Color(0xFF22C55E),
                                icon: Icons.agriculture_rounded,
                                label: l10n.settingsFarmerPanel,
                                sub: l10n.settingsFarmerPanelSub,
                                onTap: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (_) => const FarmerScreen()),
                                ),
                              ),
                              _NavRow(
                                iconBg: const Color(0x1AF59E0B),
                                iconColor: const Color(0xFFF59E0B),
                                icon: Icons.checklist_rounded,
                                label: l10n.settingsCustomizeTasks,
                                sub: l10n.settingsCustomizeTasksSub,
                                onTap: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (_) => const CustomizeScreen()),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                        SettingsSection(
                          label: '🌐  ${l10n.settingsSectionLanguage}',
                          child: SettingsCard(
                            children: [
                              _LanguageRow(
                                langCode: _prefs!.languageCode,
                                languageLabel: l10n.settingsLanguage,
                                trLabel: l10n.settingsLanguageTr,
                                enLabel: l10n.settingsLanguageEn,
                                onToggle: () async {
                                  final newLang =
                                      _prefs!.languageCode == 'tr' ? 'en' : 'tr';
                                  setState(() => _prefs =
                                      _prefs!.copyWith(languageCode: newLang));
                                  await _save();
                                  if (!context.mounted) return;
                                  await context
                                      .read<AppLocaleNotifier>()
                                      .setLanguageCode(newLang);
                                },
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                        SettingsSection(
                          label: 'ℹ️  ${l10n.settingsSectionAbout}',
                          child: SettingsCard(
                            children: [
                              _AboutRow(
                                label: l10n.settingsVersion,
                                value: _appVersion,
                              ),
                              _AboutRow(
                                label: l10n.settingsWeatherData,
                                value: l10n.settingsWeatherDataValue,
                              ),
                              _NavRow(
                                iconBg: const Color(0x1A3B82F6),
                                iconColor: const Color(0xFF3B82F6),
                                icon: Icons.privacy_tip_outlined,
                                label: l10n.settingsPrivacyPolicy,
                                sub: l10n.settingsPrivacyPolicySub,
                                onTap: () => Navigator.push(
                                  context,
                                  MaterialPageRoute<void>(
                                    builder: (_) =>
                                        const PrivacyPolicyScreen(),
                                  ),
                                ),
                              ),
                              _LinkRow(
                                icon: Icons.language_rounded,
                                label: l10n.settingsPrivacyPolicyWeb,
                                sub: l10n.settingsPrivacyPolicyWebSub,
                                url: AppUrls.privacyPolicy,
                              ),
                              _LinkRow(
                                icon: Icons.coffee_rounded,
                                label: l10n.donateButton,
                                sub: l10n.settingsDonateSub,
                                url: AppUrls.donate,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 32),
                        Center(
                          child: Text(
                            l10n.settingsFooter,
                            style: settingsLex(size: 11, color: const Color(0xFFC7C7CC)),
                          ),
                        ),
                        const SizedBox(height: 8),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Mod Geçiş Butonu ──────────────────────────────────────────────────────────

class _ModeToggle extends StatelessWidget {
  final UserMode mode;
  final String cityLabel;
  final String citySub;
  final String farmerLabel;
  final String farmerSub;
  final ValueChanged<UserMode> onChanged;
  const _ModeToggle({
    required this.mode,
    required this.cityLabel,
    required this.citySub,
    required this.farmerLabel,
    required this.farmerSub,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: const Color(0x0D000000),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x0F000000)),
      ),
      child: Row(
        children: [
          _ModeBtn(
            active: mode == UserMode.city,
            label: cityLabel,
            sub: citySub,
            icon: Icons.location_city_rounded,
            gradient: const LinearGradient(
              colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            onTap: () => onChanged(UserMode.city),
          ),
          const SizedBox(width: 6),
          _ModeBtn(
            active: mode == UserMode.farmer,
            label: farmerLabel,
            sub: farmerSub,
            icon: Icons.agriculture_rounded,
            gradient: const LinearGradient(
              colors: [Color(0xFFF6A623), Color(0xFF2ECC71)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            onTap: () => onChanged(UserMode.farmer),
          ),
        ],
      ),
    );
  }
}

class _ModeBtn extends StatelessWidget {
  final bool active;
  final String label;
  final String sub;
  final IconData icon;
  final Gradient gradient;
  final VoidCallback onTap;

  const _ModeBtn({
    required this.active,
    required this.label,
    required this.sub,
    required this.icon,
    required this.gradient,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
          decoration: BoxDecoration(
            gradient: active ? gradient : null,
            color: active ? null : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            boxShadow: active
                ? [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.16),
                      blurRadius: 14,
                      offset: const Offset(0, 4),
                    )
                  ]
                : null,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 18,
                color: active ? Colors.white : kSettingsSubtitleGray,
              ),
              const SizedBox(height: 6),
              Text(
                label,
                style: settingsLex(
                  size: 12,
                  weight: FontWeight.w700,
                  color: active ? Colors.white : kSettingsTitleColor,
                  letterSpacing: -0.2,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                sub,
                style: settingsLex(
                  size: 10,
                  color:
                      active ? Colors.white.withOpacity(0.72) : kSettingsSubtitleGray,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── İsim Girişi ───────────────────────────────────────────────────────────────

class _NameInput extends StatelessWidget {
  final TextEditingController controller;
  final bool saved;
  final String hint;
  final VoidCallback onSave;

  const _NameInput({
    required this.controller,
    required this.saved,
    required this.hint,
    required this.onSave,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            decoration: BoxDecoration(
              color: kSettingsInputBg,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: kSettingsBorder),
            ),
            child: Row(
              children: [
                const Icon(Icons.person_rounded,
                    size: 16, color: kSettingsSubtitleGray),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: controller,
                    style: settingsLex(
                        size: 14,
                        weight: FontWeight.w500,
                        color: kSettingsTitleColor),
                    decoration: InputDecoration(
                      hintText: hint,
                      hintStyle: settingsLex(size: 14, color: kSettingsSubtitleGray),
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                      border: InputBorder.none,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 8),
        GestureDetector(
          onTap: onSave,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: saved
                  ? const Color(0xFF34C759)
                  : controller.text.isNotEmpty
                      ? const Color(0xFF6366F1)
                      : const Color(0xFFE5E5EA),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              saved ? Icons.check_rounded : Icons.chevron_right_rounded,
              size: 20,
              color: controller.text.isNotEmpty || saved
                  ? Colors.white
                  : const Color(0xFFAEAEB2),
            ),
          ),
        ),
      ],
    );
  }
}

// ── Bildirim Satırı ───────────────────────────────────────────────────────────

class _NotifRow extends StatelessWidget {
  final Color iconBg;
  final Color iconColor;
  final IconData icon;
  final String label;
  final String sub;
  final bool value;
  final bool divider;
  final ValueChanged<bool> onChanged;

  const _NotifRow({
    required this.iconBg,
    required this.iconColor,
    required this.icon,
    required this.label,
    required this.sub,
    required this.value,
    required this.onChanged,
    this.divider = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: iconBg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 16, color: iconColor),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label,
                        style: settingsLex(
                            size: 14,
                            weight: FontWeight.w600,
                            letterSpacing: -0.2)),
                    const SizedBox(height: 2),
                    Text(sub, style: settingsLex(size: 11, color: kSettingsSubtitleGray)),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              CupertinoSwitch(
                value: value,
                onChanged: onChanged,
                activeColor: const Color(0xFF34C759),
              ),
            ],
          ),
        ),
        if (divider)
          const Divider(height: 1, indent: 62, color: kSettingsDivider),
      ],
    );
  }
}

// ── Sesli Dinle butonu ───────────────────────────────────────────────────────

class _VoiceDemoRow extends StatelessWidget {
  final VoidCallback onSpeak;
  final String listenLabel;
  final String subLabel;

  const _VoiceDemoRow({
    required this.onSpeak,
    required this.listenLabel,
    required this.subLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 14),
      child: Material(
        color: const Color(0x1A8B5CF6),
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onSpeak,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(
              children: [
                const Icon(Icons.volume_up_rounded,
                    size: 20, color: Color(0xFF8B5CF6)),
                const SizedBox(width: 10),
                Text(listenLabel,
                    style: settingsLex(
                        size: 14,
                        weight: FontWeight.w600,
                        color: kSettingsTitleColor)),
                const SizedBox(width: 6),
                Text(subLabel,
                    style: settingsLex(size: 12, color: kSettingsSubtitleGray)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Hakkında satırı (sadece metin) ───────────────────────────────────────────

class _AboutRow extends StatelessWidget {
  final String label;
  final String value;

  const _AboutRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: settingsLex(size: 14, color: kSettingsSubtitleGray)),
          Text(value, style: settingsLex(size: 14, weight: FontWeight.w500)),
        ],
      ),
    );
  }
}

// ── Dış link satırı ──────────────────────────────────────────────────────────

class _LinkRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String sub;
  final String url;

  const _LinkRow({
    required this.icon,
    required this.label,
    required this.sub,
    required this.url,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        final uri = Uri.tryParse(url);
        if (uri != null && await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        }
      },
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Icon(icon, size: 18, color: kSettingsSubtitleGray),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: settingsLex(size: 14, weight: FontWeight.w600)),
                  if (sub.isNotEmpty)
                    Text(sub, style: settingsLex(size: 11, color: kSettingsSubtitleGray)),
                ],
              ),
            ),
            const Icon(Icons.open_in_new_rounded, size: 16, color: kSettingsSubtitleGray),
          ],
        ),
      ),
    );
  }
}

// ── Navigasyon Satırı ─────────────────────────────────────────────────────────

class _NavRow extends StatelessWidget {
  final Color iconBg;
  final Color iconColor;
  final IconData icon;
  final String label;
  final String sub;
  final VoidCallback onTap;

  const _NavRow({
    required this.iconBg,
    required this.iconColor,
    required this.icon,
    required this.label,
    required this.sub,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 16, color: iconColor),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: settingsLex(
                          size: 14,
                          weight: FontWeight.w600,
                          letterSpacing: -0.2)),
                  const SizedBox(height: 2),
                  Text(sub, style: settingsLex(size: 11, color: kSettingsSubtitleGray)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded,
                size: 16, color: Color(0xFFC7C7CC)),
          ],
        ),
      ),
    );
  }
}

// ── Dil Satırı ────────────────────────────────────────────────────────────────

class _LanguageRow extends StatelessWidget {
  final String langCode;
  final String languageLabel;
  final String trLabel;
  final String enLabel;
  final VoidCallback onToggle;

  const _LanguageRow({
    required this.langCode,
    required this.languageLabel,
    required this.trLabel,
    required this.enLabel,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: const Color(0x1A22C55E),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.language_rounded,
                size: 16, color: Color(0xFF16A34A)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(languageLabel,
                    style: settingsLex(
                        size: 14,
                        weight: FontWeight.w600,
                        letterSpacing: -0.2)),
                const SizedBox(height: 2),
                Text(langCode == 'tr' ? trLabel : enLabel,
                    style: settingsLex(size: 11, color: kSettingsSubtitleGray)),
              ],
            ),
          ),
          GestureDetector(
            onTap: onToggle,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0x0F000000),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: kSettingsBorder),
              ),
              child: Text(
                langCode == 'tr' ? '🇹🇷  TR' : '🇬🇧  EN',
                style: settingsLex(
                    size: 12,
                    weight: FontWeight.w700,
                    color: kSettingsTitleColor),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
