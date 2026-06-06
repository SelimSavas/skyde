import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../l10n/gen_l10n/app_localizations.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F8FC),
      appBar: AppBar(
        title: Text(
          l10n.privacyPolicyTitle,
          style: GoogleFonts.lexend(fontWeight: FontWeight.w700),
        ),
        backgroundColor: const Color(0xFFF8F8FC),
        elevation: 0,
        foregroundColor: const Color(0xFF111111),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
          child: Text(
            l10n.privacyPolicyBody,
            style: GoogleFonts.lexend(
              fontSize: 14,
              height: 1.55,
              color: const Color(0xFF333333),
            ),
          ),
        ),
      ),
    );
  }
}
