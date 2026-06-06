import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../l10n/gen_l10n/app_localizations.dart';
import '../home/home_provider.dart';

class FarmerScreen extends StatelessWidget {
  const FarmerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final provider = context.watch<HomeProvider>();
    final decision = provider.decision;
    final weather = provider.weatherData;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('🌾 Çiftçi Paneli'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        titleTextStyle: AppTextStyles.mainMessage,
      ),
      body: decision == null || weather == null
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(24),
              children: [
                _FarmerInfoCard(
                  emoji: '💧',
                  title: 'Sulama',
                  message: decision.shouldIrrigate ? l10n.irrigationNeeded : l10n.irrigationNotNeeded,
                  positive: !decision.shouldIrrigate,
                  detail: weather.soilMoisture != null
                      ? 'Toprak nemi: ${(weather.soilMoisture! * 100).round()}%'
                      : 'Yağış tahmini: ${weather.precipitationProbability.round()}%',
                ),
                const SizedBox(height: 16),
                _FarmerInfoCard(
                  emoji: '🌿',
                  title: 'İlaçlama',
                  message: decision.canSpray ? l10n.sprayingOk : l10n.sprayingNotOk,
                  positive: decision.canSpray,
                  detail: 'Rüzgar: ${weather.windSpeed.round()} km/s',
                ),
                const SizedBox(height: 16),
                _FarmerInfoCard(
                  emoji: '🌡️',
                  title: 'Don Riski',
                  message: weather.isFrostRisk ? l10n.frostWarning : 'Don riski yok.',
                  positive: !weather.isFrostRisk,
                  detail: 'Sıcaklık: ${weather.temperature.round()}°C',
                ),
                const SizedBox(height: 16),
                _FarmerInfoCard(
                  emoji: '🌩️',
                  title: 'Dolu / Fırtına',
                  message: weather.isHailRisk
                      ? l10n.hailWarning
                      : weather.isStorm
                          ? l10n.stormWarning
                          : 'Dolu veya fırtına yok.',
                  positive: !weather.isHailRisk && !weather.isStorm,
                  detail: 'Durum kodu takibi aktif',
                ),
              ],
            ),
    );
  }
}

class _FarmerInfoCard extends StatelessWidget {
  final String emoji;
  final String title;
  final String message;
  final bool positive;
  final String detail;

  const _FarmerInfoCard({
    required this.emoji,
    required this.title,
    required this.message,
    required this.positive,
    required this.detail,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: positive ? AppColors.greenLight : AppColors.yellowLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: positive ? AppColors.green : AppColors.yellow,
          width: 1.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 28)),
              const SizedBox(width: 10),
              Text(title, style: AppTextStyles.actionText.copyWith(fontWeight: FontWeight.w700)),
              const Spacer(),
              Icon(
                positive ? Icons.check_circle : Icons.warning_rounded,
                color: positive ? AppColors.green : AppColors.yellow,
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(message, style: AppTextStyles.farmerInfo),
          const SizedBox(height: 6),
          Text(detail, style: AppTextStyles.caption),
        ],
      ),
    );
  }
}
