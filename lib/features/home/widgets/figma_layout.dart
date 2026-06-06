/// Üst şerit: konum / ayar / sekmeler / ses / plan — tek yükseklik + uyumlu ikonlar
abstract final class FigmaLayout {
  static const double padH = 20;
  static const double padTop = 30;
  /// Kontrol satırları arası (çizelge)
  static const double gapAfterHeader = 10;
  static const double gapAfterPlan = 20;

  // ── Üst kontrol şeridi (tek track yüksekliği) ─────────────────────────────
  static const double controlTrackHeight = 40;
  static const double controlIconSize = 18;

  static const double locationPaddingH = 14;
  static const double locationPaddingV = 0;

  static const double settingsButtonSize = controlTrackHeight;

  static const double tabBarInnerPadding = 5;
  static const double tabBarGap = 8;
  static const double tabVerticalPadding = 6;
  static const double tabLabelSize = 13;

  static const double ttsButtonWidth = controlTrackHeight;

  static const double planRowPaddingH = 12;
  static const double planRowPaddingV = 0;
  static const double planCalendarIconSize = 18;
  static const double planAccentPadding = 6;
  static const double planAccentRadius = 9;
  static const double planTitleSize = 14;
  static const double planRowInnerGap = 9;

  /// Ses / liste ikonları (track ile uyumlu)
  static const double glassIconMd = controlIconSize;

  // ── Kartlar, ikon, istatistik ─────────────────────────────────────────────
  static const double sectionGap = 16;
  static const double cardRadiusLg = 24;
  static const double cardRadiusMd = 16;
  static const double tabBarRadius = 20;
  static const double tabPillRadius = 14;

  static const double weatherIconSize = 96;
  static const double weatherIconCardPadding = 40;
  static const double weatherIconCardRadius = 40;

  static const double mainCardPadding = 24;
  static const double accentBarW = 64;
  static const double accentBarH = 4;

  /// 4 sütun — kartlar daha kompakt
  static const double statCardPaddingH = 6;
  static const double statCardPaddingV = 12;
  static const double statIconSize = 22;
  static const double statValueSize = 17;
  static const double statValueMinHeight = 46;
  static const double statLabelMinHeight = 34;
  static const double statIconGap = 8;
  static const double statLabelSize = 10;
}
