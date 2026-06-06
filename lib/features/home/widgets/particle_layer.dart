import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../core/models/weather_data.dart';

/// Referans (WeatherScreen.tsx) ile birebir: akan partikül arka planları
class ParticleLayer extends StatefulWidget {
  final WeatherDisplayType type;
  final bool isDark;
  /// Figma fırtına: mor tonlu yağış + hafif parıltı
  final bool stormVisual;

  const ParticleLayer({
    super.key,
    required this.type,
    required this.isDark,
    this.stormVisual = false,
  });

  @override
  State<ParticleLayer> createState() => _ParticleLayerState();
}

class _ParticleLayerState extends State<ParticleLayer>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 24),
    )..repeat();
  }

  @override
  void didUpdateWidget(ParticleLayer old) {
    super.didUpdateWidget(old);
    if (old.type != widget.type || old.stormVisual != widget.stormVisual) {
      _ctrl.forward(from: 0.0);
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, __) => SizedBox.expand(
        child: CustomPaint(
          painter: _ParticlePainter(
            widget.type,
            widget.isDark,
            _ctrl.value,
            stormVisual: widget.stormVisual,
          ),
        ),
      ),
    );
  }
}

// ── Referans: SunnyParticles, CloudyParticles, RainyParticles, SnowyParticles ─

class _ParticlePainter extends CustomPainter {
  final WeatherDisplayType type;
  final bool isDark;
  final double t;
  final bool stormVisual;

  const _ParticlePainter(
    this.type,
    this.isDark,
    this.t, {
    this.stormVisual = false,
  });

  double _sd(int s1, int s2) => math.Random(s1 * 97 + s2).nextDouble();

  @override
  void paint(Canvas canvas, Size size) {
    if (stormVisual) {
      _paintStorm(canvas, size);
      return;
    }
    switch (type) {
      case WeatherDisplayType.sunny:
        _paintSunny(canvas, size);
        break;
      case WeatherDisplayType.cloudy:
        _paintCloudy(canvas, size);
        break;
      case WeatherDisplayType.rainy:
        _paintRainy(canvas, size);
        break;
      case WeatherDisplayType.snowy:
        _paintSnowy(canvas, size);
        break;
    }
  }

  /// Referans: SunnyParticles — 12 orbs, y [-22,0], scale [1, 1.12], opacity pulse
  /// + radial gradient üst merkez (rgba(255,230,80,0.22), blur 8px)
  void _paintSunny(Canvas canvas, Size size) {
    // Üst radyal parlaklık (referans: radial-gradient circle rgba(255,230,80,0.22) 0%, transparent 65%, blur 8px)
    final center = Offset(size.width * 0.5, -size.height * 0.15);
    final radius = size.width * 0.8;
    canvas.drawCircle(
      center,
      radius,
      Paint()
        ..shader = RadialGradient(
          colors: [
            const Color(0x38FFE650),
            const Color(0x22FFE650),
            Colors.transparent,
          ],
          stops: const [0.0, 0.35, 0.65],
        ).createShader(Rect.fromCircle(center: center, radius: radius))
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8),
    );

    // 12 orbs: left x%, top y%, size 35–125, duration 6–14s, delay 0–5s
    // animate y [0, -22, 0], scale [1, 1.12, 1], opacity [op, op*1.5, op]
    for (int i = 0; i < 12; i++) {
      final xPct = _sd(i, 0);
      final yPct = _sd(i, 1);
      final sizeVal = 35.0 + _sd(i, 2) * 90;
      final duration = 6.0 + _sd(i, 3) * 8;
      final delay = _sd(i, 4) * 5;
      final baseOp = 0.06 + _sd(i, 5) * 0.2;

      final phase = (t + delay) * 2 * math.pi / duration;
      final yOff = -11 * math.sin(phase);
      final scale = 1.0 + 0.12 * math.sin(phase);
      final op = baseOp + 0.5 * baseOp * math.sin(phase);
      final opClamp = (op < 0 ? 0.0 : (op > 1 ? 1.0 : op));

      final x = xPct * size.width;
      final y = yPct * size.height + yOff;
      final r = (sizeVal * 0.5 * scale).clamp(18.0, 70.0);

      canvas.drawCircle(
        Offset(x, y),
        r,
        Paint()
          ..color = Color.fromRGBO(255, 215, 50, opClamp * 0.38)
          ..maskFilter = MaskFilter.blur(BlurStyle.normal, 24),
      );
    }
  }

  /// Referans: CloudyParticles — 6 bulut, x [-12, 12, -12], duration 10–24s, blur 18px
  void _paintCloudy(Canvas canvas, Size size) {
    for (int i = 0; i < 6; i++) {
      final xPct = _sd(i, 0);
      final yPct = _sd(i, 1) * 0.6;
      final w = 70.0 + _sd(i, 2) * 130;
      final h = 28.0 + _sd(i, 3) * 55;
      final duration = 10.0 + _sd(i, 4) * 14;
      final delay = _sd(i, 5) * 6;

      final phase = (t + delay) * 2 * math.pi / duration;
      final xOff = 12 * math.sin(phase);
      final x = xPct * size.width + xOff;
      final y = yPct * size.height;

      canvas.drawOval(
        Rect.fromCenter(center: Offset(x, y), width: w, height: h),
        Paint()
          ..color = const Color(0x6BFFFFFF)
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 18),
      );
    }
  }

  /// Fırtına: mor-mavi damlalar + seyrek parlama
  void _paintStorm(Canvas canvas, Size size) {
    final stroke = Paint()
      ..color = isDark
          ? const Color(0x99E9D5FF)
          : const Color(0x88C4B5FD)
      ..strokeWidth = 1.8
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;
    const deg = 11 * math.pi / 180;
    for (var i = 0; i < 48; i++) {
      final xPct = _sd(i, 0) * 1.05;
      final h = 40.0 + _sd(i, 1) * 55;
      final dur = 0.45 + _sd(i, 2) * 0.55;
      final delay = _sd(i, 3) * 2.2;
      final rawT = (t * (1 / dur) + delay) % 1.0;
      final rawY = rawT * (size.height + 140) - 130;
      final x = xPct * size.width + rawY * 0.04;
      canvas.save();
      canvas.translate(x, rawY);
      canvas.rotate(deg);
      canvas.drawLine(Offset.zero, Offset(0, h), stroke);
      canvas.restore();
    }
    final flash = (math.sin(t * math.pi * 3) * 0.5 + 0.5) * 0.06;
    canvas.drawRect(
      Offset.zero & size,
      Paint()..color = const Color(0x33A855F7).withOpacity(flash),
    );
  }

  /// Referans: RainyParticles — 42 damla, 1.5px, h 35–90, rDrop: translateY(-120)→110vh, rotate 9deg
  /// duration 0.55–1.25s, delay 0–2.5s. Alt %25 gradient.
  void _paintRainy(Canvas canvas, Size size) {
    const deg9 = 9 * math.pi / 180;
    final stroke = Paint()
      ..color = isDark
          ? const Color(0x73A0D2FF)
          : const Color(0x595A8CC8)
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    for (int i = 0; i < 42; i++) {
      final xPct = _sd(i, 0) * 1.05;
      final h = 35.0 + _sd(i, 1) * 55;
      final dur = 0.55 + _sd(i, 2) * 0.7;
      final delay = _sd(i, 3) * 2.5;

      final totalH = size.height + 120 + h;
      final rawT = (t * (1 / dur) + delay) % 1.0;
      final rawY = rawT * totalH - 120;
      final x = xPct * size.width + rawY * 0.04;

      canvas.save();
      canvas.translate(x, rawY);
      canvas.rotate(deg9);
      canvas.drawLine(Offset(0, 0), Offset(0, h), stroke);
      canvas.restore();
    }

    final reflection = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          Colors.transparent,
          isDark
              ? const Color(0x1F508CC8)
              : const Color(0x143264A0),
        ],
      ).createShader(Rect.fromLTWH(0, size.height * 0.75, size.width, size.height * 0.25));
    canvas.drawRect(
      Rect.fromLTWH(0, size.height * 0.75, size.width, size.height * 0.25),
      reflection,
    );
  }

  /// Referans: SnowyParticles — 30 flake, size 4–11, sFall: 50% translateX(sw), 100% translateX(-0.4*sw), rotate 360
  /// duration 4–8s, delay 0–6s, --sw 8–38
  void _paintSnowy(Canvas canvas, Size size) {
    for (int i = 0; i < 30; i++) {
      final xPct = _sd(i, 0);
      final sizeVal = 4.0 + _sd(i, 1) * 7;
      final duration = 4.0 + _sd(i, 2) * 4;
      final delay = _sd(i, 3) * 6;
      final sw = 8.0 + _sd(i, 4) * 30;

      final rawT = ((t + delay) % duration) / duration;
      final y = rawT * (size.height + 80) - 30;
      final xSway = rawT <= 0.5
          ? sw * 2 * rawT
          : sw + (-0.4 * sw - sw) * (rawT - 0.5) * 2;
      final x = xPct * size.width + xSway;
      final rot = rawT * 2 * math.pi;

      canvas.save();
      canvas.translate(x, y);
      canvas.rotate(rot);
      final r = sizeVal * 0.5;
      canvas.drawCircle(
        Offset.zero,
        r + 2,
        Paint()
          ..color = const Color(0x66A0C8FF)
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3),
      );
      canvas.drawCircle(
        Offset.zero,
        r,
        Paint()
          ..color = Colors.white.withOpacity(0.88)
          ..style = PaintingStyle.fill,
      );
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(_ParticlePainter old) =>
      old.t != t ||
      old.type != type ||
      old.isDark != isDark ||
      old.stormVisual != stormVisual;
}
