import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../core/models/user_preferences.dart';
import '../../l10n/gen_l10n/app_localizations.dart';
import '../home/home_screen.dart';
import 'onboarding_provider.dart';

// ── Stil yardımcıları ─────────────────────────────────────────────────────────

TextStyle _lex({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = const Color(0xFF0A2540),
  double? letterSpacing,
  double? height,
}) =>
    GoogleFonts.lexend(
        fontSize: size,
        fontWeight: weight,
        color: color,
        letterSpacing: letterSpacing,
        height: height);

// Onboarding boyunca sabit arka plan gradyanı (açık gökyüzü)
const _bgGradient = LinearGradient(
  colors: [Color(0xFF5EC2F0), Color(0xFF81D4FA), Color(0xFFFEFCF3)],
  stops: [0.0, 0.45, 1.0],
  begin: Alignment.topCenter,
  end: Alignment.bottomCenter,
);

const _textDark    = Color(0xFF0A2540);
const _textMid     = Color(0xFF1565C0);
const _glassColor  = Color(0x3DFFFFFF);
const _glassStroke = Color(0x66FFFFFF);

// ── Ana ekran ─────────────────────────────────────────────────────────────────

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageController = PageController();
  int _currentPage = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _next() {
    if (_currentPage < 2) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 380),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _finish() async {
    await context.read<OnboardingProvider>().complete();
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        systemNavigationBarColor: Colors.transparent,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: const Color(0xFF5EC2F0),
        body: Stack(
          fit: StackFit.expand,
          children: [
            // Gradyan arka plan
            Container(decoration: const BoxDecoration(gradient: _bgGradient)),

            // Sayfa içeriği
            SafeArea(
              child: Column(
                children: [
                  // Adım göstergesi
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(3, (i) {
                        final active = i == _currentPage;
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: active ? 24 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: active
                                ? _textDark
                                : _textDark.withOpacity(0.25),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        );
                      }),
                    ),
                  ),

                  // Sayfalar
                  Expanded(
                    child: PageView(
                      controller: _pageController,
                      physics: const NeverScrollableScrollPhysics(),
                      onPageChanged: (p) => setState(() => _currentPage = p),
                      children: [
                        _NamePage(onNext: _next),
                        _ModePage(onNext: _next),
                        _LocationPage(onDone: _finish),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Sayfa 1 — İsim ───────────────────────────────────────────────────────────

class _NamePage extends StatefulWidget {
  final VoidCallback onNext;
  const _NamePage({required this.onNext});

  @override
  State<_NamePage> createState() => _NamePageState();
}

class _NamePageState extends State<_NamePage> {
  final _ctrl = TextEditingController();

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(
        28, 8, 28,
        MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Uygulama logosu
          Center(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(28),
              child: Image.asset(
                'assets/images/logo.png',
                width: 100,
                height: 100,
                fit: BoxFit.cover,
              ),
            ),
          ),

          const SizedBox(height: 28),
          Center(
            child: Text(
              l10n.onboarding_welcome,
              style: _lex(size: 15, color: _textMid, height: 1.4),
              textAlign: TextAlign.center,
            ),
          ),

          const SizedBox(height: 36),

          // İsim sorusu
          Text(
            l10n.onboarding_nameQuestion,
            style: _lex(size: 13, weight: FontWeight.w600,
                color: _textMid, letterSpacing: 0.2),
          ),
          const SizedBox(height: 10),

          // İsim giriş alanı (cam efektli)
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0x55FFFFFF),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: _glassStroke),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 18),
                child: TextField(
                  controller: _ctrl,
                  style: _lex(size: 18, weight: FontWeight.w600, color: _textDark),
                  decoration: InputDecoration(
                    hintText: l10n.onboarding_namePlaceholder,
                    hintStyle: _lex(size: 18, color: _textDark.withOpacity(0.35)),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  textCapitalization: TextCapitalization.words,
                  onChanged: (_) => setState(() {}),
                ),
              ),
            ),
          ),

          const SizedBox(height: 28),

          _PrimaryButton(
            label: l10n.onboarding_continue,
            enabled: _ctrl.text.trim().isNotEmpty,
            onTap: () {
              context.read<OnboardingProvider>().setName(_ctrl.text.trim());
              widget.onNext();
            },
          ),
        ],
      ),
    );
  }
}

// ── Sayfa 2 — Mod Seçimi ─────────────────────────────────────────────────────

class _ModePage extends StatelessWidget {
  final VoidCallback onNext;
  const _ModePage({required this.onNext});

  @override
  Widget build(BuildContext context) {
    final l10n    = AppLocalizations.of(context)!;
    final provider = context.watch<OnboardingProvider>();

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(28, 8, 28, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.onboarding_modeQuestion,
            style: _lex(size: 24, weight: FontWeight.w800,
                color: _textDark, letterSpacing: -0.6, height: 1.2),
          ),
          const SizedBox(height: 8),
          Text(
            'Bu seçim her zaman ayarlardan değiştirilebilir.',
            style: _lex(size: 13, color: _textMid),
          ),

          const SizedBox(height: 28),

          // Şehir modu kartı
          _ModeCard(
            icon: Icons.location_city_rounded,
            title: l10n.onboarding_cityMode,
            description: l10n.onboarding_cityModeDesc,
            gradient: const LinearGradient(
              colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            selected: provider.selectedMode == UserMode.city,
            onTap: () => context.read<OnboardingProvider>().setMode(UserMode.city),
          ),

          const SizedBox(height: 14),

          // Çiftçi modu kartı
          _ModeCard(
            icon: Icons.agriculture_rounded,
            title: l10n.onboarding_farmerMode,
            description: l10n.onboarding_farmerModeDesc,
            gradient: const LinearGradient(
              colors: [Color(0xFFF6A623), Color(0xFF2ECC71)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            selected: provider.selectedMode == UserMode.farmer,
            onTap: () =>
                context.read<OnboardingProvider>().setMode(UserMode.farmer),
          ),

          const SizedBox(height: 28),

          _PrimaryButton(
            label: l10n.onboarding_continue,
            enabled: provider.selectedMode != null,
            onTap: onNext,
          ),
        ],
      ),
    );
  }
}

class _ModeCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final Gradient gradient;
  final bool selected;
  final VoidCallback onTap;

  const _ModeCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.gradient,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: selected ? gradient : null,
          color: selected ? null : const Color(0x44FFFFFF),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? Colors.transparent : _glassStroke,
            width: 1.5,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 20,
                    offset: const Offset(0, 6),
                  )
                ]
              : null,
        ),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: selected
                    ? Colors.white.withOpacity(0.25)
                    : _glassColor,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                    color: selected
                        ? Colors.white.withOpacity(0.35)
                        : _glassStroke),
              ),
              child: Icon(
                icon,
                size: 26,
                color: selected ? Colors.white : _textDark,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: _lex(
                      size: 16,
                      weight: FontWeight.w700,
                      color: selected ? Colors.white : _textDark,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    description,
                    style: _lex(
                      size: 12,
                      color: selected
                          ? Colors.white.withOpacity(0.8)
                          : _textMid,
                      height: 1.3,
                    ),
                  ),
                ],
              ),
            ),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: selected
                    ? Colors.white
                    : Colors.white.withOpacity(0.3),
                border: Border.all(
                  color: selected
                      ? Colors.transparent
                      : _glassStroke,
                  width: 1.5,
                ),
              ),
              child: selected
                  ? const Icon(Icons.check_rounded,
                      size: 14, color: Color(0xFF667EEA))
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}

// ── Sayfa 3 — Konum ──────────────────────────────────────────────────────────

class _LocationPage extends StatefulWidget {
  final VoidCallback onDone;
  const _LocationPage({required this.onDone});

  @override
  State<_LocationPage> createState() => _LocationPageState();
}

class _LocationPageState extends State<_LocationPage> {
  bool _loading = false;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(28, 8, 28, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Konum ikonu
          Center(
            child: _GlassCard(
              width: 96,
              height: 96,
              radius: 28,
              child: const Icon(Icons.location_on_rounded,
                  size: 48, color: _textDark),
            ),
          ),

          const SizedBox(height: 28),

          Text(
            l10n.onboarding_locationQuestion,
            style: _lex(
              size: 24,
              weight: FontWeight.w800,
              color: _textDark,
              letterSpacing: -0.6,
              height: 1.2,
            ),
          ),

          const SizedBox(height: 10),

          Text(
            'Hava durumunu tam olarak senin konumuna göre göstereceğim.',
            style: _lex(size: 14, color: _textMid, height: 1.4),
          ),

          const SizedBox(height: 36),

          // GPS butonu
          _PrimaryButton(
            label: _loading
                ? 'Konum alınıyor…'
                : l10n.onboarding_allowLocation,
            enabled: !_loading,
            isLoading: _loading,
            onTap: () async {
              setState(() => _loading = true);
              await context.read<OnboardingProvider>().requestLocation();
              widget.onDone();
            },
          ),

          const SizedBox(height: 12),

          // Atla butonu
          GestureDetector(
            onTap: widget.onDone,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 16),
              alignment: Alignment.center,
              child: Text(
                l10n.onboarding_enterManual,
                style: _lex(
                  size: 14,
                  weight: FontWeight.w500,
                  color: _textDark.withOpacity(0.55),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Ortak bileşenler ──────────────────────────────────────────────────────────

/// Cam efektli kare/yuvarlak kart
class _GlassCard extends StatelessWidget {
  final double width;
  final double height;
  final double radius;
  final Widget child;

  const _GlassCard({
    required this.width,
    required this.height,
    required this.radius,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: _glassColor,
            borderRadius: BorderRadius.circular(radius),
            border: Border.all(color: _glassStroke, width: 1.5),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08),
                blurRadius: 24,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Center(child: child),
        ),
      ),
    );
  }
}

/// Ana aksiyon butonu (degrade dolgu)
class _PrimaryButton extends StatelessWidget {
  final String label;
  final bool enabled;
  final bool isLoading;
  final VoidCallback onTap;

  const _PrimaryButton({
    required this.label,
    required this.enabled,
    required this.onTap,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: double.infinity,
        height: 58,
        decoration: BoxDecoration(
          gradient: enabled
              ? const LinearGradient(
                  colors: [Color(0xFF0A2540), Color(0xFF1565C0)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: enabled ? null : _glassColor,
          borderRadius: BorderRadius.circular(16),
          border: enabled ? null : Border.all(color: _glassStroke),
          boxShadow: enabled
              ? [
                  BoxShadow(
                    color: const Color(0xFF1565C0).withOpacity(0.4),
                    blurRadius: 20,
                    offset: const Offset(0, 6),
                  ),
                ]
              : null,
        ),
        child: Center(
          child: isLoading
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                      color: Colors.white, strokeWidth: 2.5),
                )
              : Text(
                  label,
                  style: _lex(
                    size: 15,
                    weight: FontWeight.w700,
                    color: enabled
                        ? Colors.white
                        : _textDark.withOpacity(0.45),
                    letterSpacing: -0.2,
                  ),
                ),
        ),
      ),
    );
  }
}
