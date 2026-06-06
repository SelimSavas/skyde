import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Ayarlar ekranı ile aynı tipografi (Lexend).
TextStyle settingsLex({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = const Color(0xFF111111),
  double? letterSpacing,
  double? height,
}) =>
    GoogleFonts.lexend(
      fontSize: size,
      fontWeight: weight,
      color: color,
      letterSpacing: letterSpacing,
      height: height,
    );

const kSettingsBackground = Color(0xFFF8F8FC);
const kSettingsCard = Colors.white;
const kSettingsSectionLabel = Color(0xFF6B7280);
const kSettingsTitleColor = Color(0xFF111111);
const kSettingsSubtitleGray = Color(0xFF8E8E93);
const kSettingsDivider = Color(0x0F000000);
const kSettingsInputBg = Color(0xFFF2F2F7);
const kSettingsBorder = Color(0x0F000000);

/// Üst başlık + kapat (Ayarlar ile aynı).
class SettingsPageHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  final VoidCallback onClose;

  const SettingsPageHeader({
    super.key,
    required this.title,
    required this.subtitle,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 14, 16, 14),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: kSettingsDivider)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: settingsLex(
                    size: 20,
                    weight: FontWeight.w800,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: settingsLex(size: 12, color: kSettingsSubtitleGray),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: onClose,
            child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: const Color(0x12000000),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(
                Icons.close_rounded,
                size: 16,
                color: Color(0xFF3C3C43),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class SettingsSection extends StatelessWidget {
  final String label;
  final Widget child;

  const SettingsSection({
    super.key,
    required this.label,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            label,
            style: settingsLex(
              size: 11,
              weight: FontWeight.w700,
              color: kSettingsSectionLabel,
              letterSpacing: 0.7,
            ),
          ),
        ),
        child,
      ],
    );
  }
}

class SettingsCard extends StatelessWidget {
  final List<Widget> children;

  const SettingsCard({super.key, required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: kSettingsCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kSettingsBorder),
      ),
      child: Column(children: children),
    );
  }
}
