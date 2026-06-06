import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';

import '../../features/home/home_provider.dart';
import 'locations_provider.dart';
import 'map_picker_screen.dart';

// ── Stil yardımcıları ─────────────────────────────────────────────────────────

TextStyle _lex({
  double size = 14,
  FontWeight weight = FontWeight.w400,
  Color color = const Color(0xFF111111),
  double? letterSpacing,
}) =>
    GoogleFonts.lexend(
        fontSize: size,
        fontWeight: weight,
        color: color,
        letterSpacing: letterSpacing);

const _bg          = Color(0xFFF8F8FC);
const _card        = Colors.white;
const _divider     = Color(0x0F000000);
const _grayText    = Color(0xFF8E8E93);
const _border      = Color(0x0F000000);

// ── Ana Ekran ─────────────────────────────────────────────────────────────────

class LocationsScreen extends StatelessWidget {
  const LocationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<LocationsProvider>();

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        systemNavigationBarColor: Colors.transparent,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: _bg,
        body: SafeArea(
          child: Column(
            children: [
              // Header
              _Header(onAdd: () => _showAddSheet(context)),

                    // İçerik: her zaman Konumum + liste veya boş durum
              Expanded(
                child: provider.locations.isEmpty
                    ? _EmptyStateWithLive(
                        provider: provider,
                        onAdd: () => _showAddSheet(context),
                      )
                    : _LocationList(
                        provider: provider,
                        onDelete: (i) => _confirmDelete(context, provider, i),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAddSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ChangeNotifierProvider.value(
        value: context.read<LocationsProvider>(),
        child: const _AddSheet(),
      ),
    );
  }

  void _confirmDelete(
      BuildContext context, LocationsProvider provider, int index) {
    final name = provider.locations[index].name;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          '"$name" silinsin mi?',
          style: _lex(size: 16, weight: FontWeight.w700),
        ),
        content: Text(
          'Bu yer kalıcı olarak silinecek.',
          style: _lex(size: 13, color: _grayText),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('İptal',
                style: _lex(
                    size: 14,
                    weight: FontWeight.w600,
                    color: const Color(0xFF6B7280))),
          ),
          TextButton(
            onPressed: () {
              provider.delete(index);
              Navigator.pop(ctx);
            },
            child: Text('Sil',
                style: _lex(
                    size: 14,
                    weight: FontWeight.w700,
                    color: const Color(0xFFEF4444))),
          ),
        ],
      ),
    );
  }
}

// ── Header ────────────────────────────────────────────────────────────────────

class _Header extends StatelessWidget {
  final VoidCallback onAdd;
  const _Header({required this.onAdd});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 14, 16, 14),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: _divider)),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: const Color(0x0F000000),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.arrow_back_ios_new_rounded,
                  size: 15, color: Color(0xFF3C3C43)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Yerlerim',
                    style:
                        _lex(size: 18, weight: FontWeight.w800, letterSpacing: -0.4)),
                const SizedBox(height: 1),
                Text('Kayıtlı konumlarını yönet',
                    style: _lex(size: 11, color: _grayText)),
              ],
            ),
          ),
          // Ekle butonu
          GestureDetector(
            onTap: onAdd,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF6366F1), Color(0xFF4F46E5)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF6366F1).withOpacity(0.35),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.add_rounded, size: 16, color: Colors.white),
                  const SizedBox(width: 5),
                  Text('Yer Ekle',
                      style: _lex(
                          size: 12,
                          weight: FontWeight.w700,
                          color: Colors.white)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Konum Listesi ─────────────────────────────────────────────────────────────

class _LocationList extends StatelessWidget {
  final LocationsProvider provider;
  final void Function(int) onDelete;

  const _LocationList({required this.provider, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      // +1: ilk sıra her zaman "Konumum" kartı
      itemCount: provider.locations.length + 1,
      itemBuilder: (context, i) {
        if (i == 0) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: _LiveLocationCard(
              isActive: provider.useLiveLocation,
              address: provider.liveAddress,
              addressLoading: provider.liveAddressLoading,
              onSelect: () async {
                await provider.setLiveLocation();
                if (context.mounted) {
                  context.read<HomeProvider>().loadData(
                        locationsProvider: provider,
                      );
                }
              },
            ),
          );
        }

        final loc = provider.locations[i - 1];
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: _LocationCard(
            name: loc.name,
            latitude: loc.latitude,
            longitude: loc.longitude,
            isDefault: loc.isDefault,
            onSetDefault: () async {
              await provider.setDefault(i - 1);
              if (context.mounted) {
                context.read<HomeProvider>().loadData(
                      locationsProvider: provider,
                    );
              }
            },
            onDelete: () => onDelete(i - 1),
          ),
        );
      },
    );
  }
}

// ── Konum Kartı ───────────────────────────────────────────────────────────────

class _LocationCard extends StatelessWidget {
  final String name;
  final double latitude;
  final double longitude;
  final bool isDefault;
  final VoidCallback onSetDefault;
  final VoidCallback onDelete;

  const _LocationCard({
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.isDefault,
    required this.onSetDefault,
    required this.onDelete,
  });

  // İsme göre ikon seç
  IconData get _icon {
    final lower = name.toLowerCase();
    if (lower.contains('ev') || lower.contains('home')) {
      return Icons.home_rounded;
    }
    if (lower.contains('tarla') || lower.contains('bağ') ||
        lower.contains('bahçe') || lower.contains('çiftlik')) {
      return Icons.agriculture_rounded;
    }
    if (lower.contains('iş') || lower.contains('ofis')) {
      return Icons.business_center_rounded;
    }
    return Icons.place_rounded;
  }

  Color get _iconColor {
    if (isDefault) return const Color(0xFF6366F1);
    final lower = name.toLowerCase();
    if (lower.contains('tarla') || lower.contains('bağ') ||
        lower.contains('bahçe')) return const Color(0xFF16A34A);
    if (lower.contains('iş') || lower.contains('ofis')) {
      return const Color(0xFFF59E0B);
    }
    return const Color(0xFF6366F1);
  }

  Color get _iconBg => _iconColor.withOpacity(0.12);

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: _card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDefault
              ? const Color(0xFF6366F1).withOpacity(0.4)
              : _border,
          width: isDefault ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            // İkon
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: _iconBg,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(_icon, size: 20, color: _iconColor),
            ),
            const SizedBox(width: 14),

            // Bilgiler
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        name,
                        style: _lex(
                            size: 15,
                            weight: FontWeight.w700,
                            letterSpacing: -0.2),
                      ),
                      if (isDefault) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF6366F1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            'Aktif',
                            style: _lex(
                                size: 10,
                                weight: FontWeight.w700,
                                color: Colors.white),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    '${latitude.toStringAsFixed(3)}°, ${longitude.toStringAsFixed(3)}°',
                    style: _lex(size: 11, color: _grayText),
                  ),
                ],
              ),
            ),

            // Aksiyonlar
            if (!isDefault)
              GestureDetector(
                onTap: onSetDefault,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0x0F6366F1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                        color: const Color(0x336366F1), width: 1),
                  ),
                  child: Text(
                    'Seç',
                    style: _lex(
                        size: 12,
                        weight: FontWeight.w700,
                        color: const Color(0xFF6366F1)),
                  ),
                ),
              ),

            const SizedBox(width: 4),

            IconButton(
              icon: Icon(
                Icons.delete_outline_rounded,
                color: const Color(0xFFEF4444).withOpacity(0.7),
                size: 20,
              ),
              onPressed: onDelete,
              style: IconButton.styleFrom(
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                padding: const EdgeInsets.all(6),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Canlı Konum Kartı ─────────────────────────────────────────────────────────

class _LiveLocationCard extends StatefulWidget {
  final bool isActive;
  final String? address;
  final bool addressLoading;
  final VoidCallback onSelect;

  const _LiveLocationCard({
    required this.isActive,
    required this.onSelect,
    this.address,
    this.addressLoading = false,
  });

  @override
  State<_LiveLocationCard> createState() => _LiveLocationCardState();
}

class _LiveLocationCardState extends State<_LiveLocationCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulse;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _scale = Tween<double>(begin: 0.8, end: 1.1).animate(
      CurvedAnimation(parent: _pulse, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const activeGradient = LinearGradient(
      colors: [Color(0xFF10B981), Color(0xFF059669)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );

    return GestureDetector(
      onTap: widget.isActive ? null : widget.onSelect,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          gradient: widget.isActive ? activeGradient : null,
          color: widget.isActive ? null : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: widget.isActive
                ? Colors.transparent
                : const Color(0xFF10B981).withOpacity(0.4),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: widget.isActive
                  ? const Color(0xFF10B981).withOpacity(0.35)
                  : Colors.black.withOpacity(0.04),
              blurRadius: widget.isActive ? 20 : 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              // Canlı ikon — nabız animasyonu
              Stack(
                alignment: Alignment.center,
                children: [
                  if (widget.isActive)
                    ScaleTransition(
                      scale: _scale,
                      child: Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withOpacity(0.2),
                        ),
                      ),
                    ),
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: widget.isActive
                          ? Colors.white.withOpacity(0.2)
                          : const Color(0xFF10B981).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.my_location_rounded,
                      size: 22,
                      color: widget.isActive
                          ? Colors.white
                          : const Color(0xFF10B981),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 14),

              // Bilgiler
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          'Konumum',
                          style: _lex(
                            size: 15,
                            weight: FontWeight.w700,
                            letterSpacing: -0.2,
                            color: widget.isActive
                                ? Colors.white
                                : const Color(0xFF111111),
                          ),
                        ),
                        if (widget.isActive) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.25),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: const BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'Canlı',
                                  style: _lex(
                                    size: 10,
                                    weight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 3),
                    _LiveAddressLine(
                      address: widget.address,
                      loading: widget.addressLoading,
                      isActive: widget.isActive,
                    ),
                  ],
                ),
              ),

              if (!widget.isActive)
                GestureDetector(
                  onTap: widget.onSelect,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0x0F10B981),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                          color: const Color(0x3310B981), width: 1),
                    ),
                    child: Text(
                      'Seç',
                      style: _lex(
                        size: 12,
                        weight: FontWeight.w700,
                        color: const Color(0xFF10B981),
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
}

// ── Canlı Adres Satırı ────────────────────────────────────────────────────────

class _LiveAddressLine extends StatelessWidget {
  final String? address;
  final bool loading;
  final bool isActive;

  const _LiveAddressLine({
    required this.address,
    required this.loading,
    required this.isActive,
  });

  @override
  Widget build(BuildContext context) {
    final color = isActive ? Colors.white.withOpacity(0.8) : _grayText;

    if (loading) {
      return Row(
        children: [
          SizedBox(
            width: 10,
            height: 10,
            child: CircularProgressIndicator(
              strokeWidth: 1.5,
              color: color,
            ),
          ),
          const SizedBox(width: 6),
          Text('Konum alınıyor…', style: _lex(size: 11, color: color)),
        ],
      );
    }

    if (address != null && address!.isNotEmpty) {
      return Row(
        children: [
          Icon(
            Icons.location_on_rounded,
            size: 11,
            color: color,
          ),
          const SizedBox(width: 3),
          Flexible(
            child: Text(
              address!,
              style: _lex(size: 11, color: color),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      );
    }

    return Text(
      'GPS ile anlık konumunu kullan',
      style: _lex(size: 11, color: color),
    );
  }
}

// ── Boş Durum ─────────────────────────────────────────────────────────────────

/// Boş listede Konumum + ekle çağrısı
class _EmptyStateWithLive extends StatelessWidget {
  final LocationsProvider provider;
  final VoidCallback onAdd;
  const _EmptyStateWithLive(
      {required this.provider, required this.onAdd});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: Column(
        children: [
          _LiveLocationCard(
            isActive: provider.useLiveLocation,
            address: provider.liveAddress,
            addressLoading: provider.liveAddressLoading,
            onSelect: () async {
              await provider.setLiveLocation();
              if (context.mounted) {
                context.read<HomeProvider>().loadData(
                      locationsProvider: provider,
                    );
              }
            },
          ),
          const SizedBox(height: 24),
          _EmptyState(onAdd: onAdd),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final VoidCallback onAdd;
  const _EmptyState({required this.onAdd});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(
                color: const Color(0x0F6366F1),
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Icon(Icons.map_rounded,
                  size: 40, color: Color(0xFF6366F1)),
            ),
            const SizedBox(height: 20),
            Text(
              'Henüz yer eklemediniz.',
              style: _lex(size: 18, weight: FontWeight.w700, letterSpacing: -0.4),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              '"Evim", "Alt Tarla", "Bağ" gibi yerler ekleyerek hava durumunu takip edebilirsiniz.',
              style: _lex(size: 13, color: _grayText, letterSpacing: -0.1),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 28),
            GestureDetector(
              onTap: onAdd,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF6366F1), Color(0xFF4F46E5)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF6366F1).withOpacity(0.35),
                      blurRadius: 16,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.add_rounded,
                        size: 18, color: Colors.white),
                    const SizedBox(width: 8),
                    Text(
                      'İlk Yerimi Ekle',
                      style: _lex(
                          size: 14,
                          weight: FontWeight.w700,
                          color: Colors.white),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Yer Ekleme Alt Sayfası ────────────────────────────────────────────────────

class _AddSheet extends StatefulWidget {
  const _AddSheet();

  @override
  State<_AddSheet> createState() => _AddSheetState();
}

class _AddSheetState extends State<_AddSheet> {
  final _nameCtrl = TextEditingController();
  bool _loading = false;
  String? _error;
  LatLng? _selectedFromMap;

  static const _quickNames = [
    'Evim', 'İş Yerim', 'Alt Tarla', 'Üst Tarla',
    'Bağ', 'Bahçe', 'Çiftlik',
  ];

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFFF8F8FC),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.fromLTRB(
          20, 0, 20, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tutma çubuğu
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0x22000000),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
          ),

          Text('Yeni Yer Ekle',
              style: _lex(
                  size: 18, weight: FontWeight.w800, letterSpacing: -0.5)),
          const SizedBox(height: 4),
          Text('GPS veya haritadan dünyada bir konum seçin.',
              style: _lex(size: 12, color: _grayText)),

          const SizedBox(height: 18),

          // Hızlı isim seçenekleri
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _quickNames
                .map((name) => GestureDetector(
                      onTap: () {
                        _nameCtrl.text = name;
                        setState(() {});
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: _nameCtrl.text == name
                              ? const Color(0xFF6366F1)
                              : const Color(0xFFEEEEF5),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          name,
                          style: _lex(
                            size: 12,
                            weight: FontWeight.w600,
                            color: _nameCtrl.text == name
                                ? Colors.white
                                : const Color(0xFF3C3C43),
                          ),
                        ),
                      ),
                    ))
                .toList(),
          ),

          const SizedBox(height: 16),

          // İsim giriş alanı
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0x0F000000)),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                const Icon(Icons.label_outline_rounded,
                    size: 18, color: Color(0xFF8E8E93)),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _nameCtrl,
                    style: _lex(
                        size: 15,
                        weight: FontWeight.w600,
                        color: const Color(0xFF111111)),
                    decoration: InputDecoration(
                      hintText: 'Yer adı (örn: Alt Tarla)',
                      hintStyle: _lex(size: 15, color: _grayText),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    textCapitalization: TextCapitalization.words,
                    onChanged: (_) => setState(() {}),
                  ),
                ),
              ],
            ),
          ),

          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(_error!,
                style: _lex(
                    size: 12,
                    color: const Color(0xFFEF4444),
                    weight: FontWeight.w500)),
          ],

          const SizedBox(height: 16),

          // Haritadan seçilmiş konum kartı
          if (_selectedFromMap != null) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFEEEEF5),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.location_on_rounded,
                      color: Color(0xFF6366F1), size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${_selectedFromMap!.latitude.toStringAsFixed(4)}°, ${_selectedFromMap!.longitude.toStringAsFixed(4)}°',
                          style: _lex(
                              size: 13,
                              weight: FontWeight.w600,
                              color: const Color(0xFF111111)),
                        ),
                        const SizedBox(height: 2),
                        Text('Yukarıdan bir isim verip ekleyin.',
                            style: _lex(size: 11, color: _grayText)),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: () => setState(() => _selectedFromMap = null),
                    child: Text('Farklı seç',
                        style: _lex(
                            size: 12,
                            weight: FontWeight.w600,
                            color: const Color(0xFF6366F1))),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            GestureDetector(
              onTap: _loading ? null : _addFromMap,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  gradient: _loading
                      ? null
                      : const LinearGradient(
                          colors: [Color(0xFF6366F1), Color(0xFF4F46E5)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                  color: _loading ? const Color(0xFFEEEEF5) : null,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: _loading
                      ? null
                      : [
                          BoxShadow(
                            color: const Color(0xFF6366F1).withOpacity(0.35),
                            blurRadius: 16,
                            offset: const Offset(0, 5),
                          ),
                        ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (_loading)
                      const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                            strokeWidth: 2.5, color: Color(0xFF6366F1)),
                      )
                    else
                      const Icon(Icons.check_rounded,
                          size: 18, color: Colors.white),
                    const SizedBox(width: 10),
                    Text(
                      _loading ? 'Ekleniyor…' : 'Bu konumu ekle',
                      style: _lex(
                        size: 14,
                        weight: FontWeight.w700,
                        color: _loading ? _grayText : Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],

          // GPS butonu
          GestureDetector(
            onTap: _loading ? null : _addFromGps,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                gradient: _loading
                    ? null
                    : const LinearGradient(
                        colors: [Color(0xFF6366F1), Color(0xFF4F46E5)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                color: _loading ? const Color(0xFFEEEEF5) : null,
                borderRadius: BorderRadius.circular(14),
                boxShadow: _loading
                    ? null
                    : [
                        BoxShadow(
                          color: const Color(0xFF6366F1).withOpacity(0.35),
                          blurRadius: 16,
                          offset: const Offset(0, 5),
                        ),
                      ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (_loading)
                    const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2.5, color: Color(0xFF6366F1)),
                    )
                  else
                    const Icon(Icons.my_location_rounded,
                        size: 18, color: Colors.white),
                  const SizedBox(width: 10),
                  Text(
                    _loading ? 'Konum alınıyor…' : '📍 Şu anki konumumu ekle',
                    style: _lex(
                      size: 14,
                      weight: FontWeight.w700,
                      color: _loading ? _grayText : Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 10),

          // Haritadan seç butonu
          OutlinedButton.icon(
            onPressed: () async {
              final result = await Navigator.push<LatLng>(
                context,
                MaterialPageRoute(
                  builder: (_) => const MapPickerScreen(),
                ),
              );
              if (result != null && mounted) {
                setState(() {
                  _selectedFromMap = result;
                  _error = null;
                });
              }
            },
            icon: const Icon(Icons.map_rounded, size: 18),
            label: const Text('Haritadan dünyada bir konum seç'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              foregroundColor: const Color(0xFF6366F1),
              side: const BorderSide(color: Color(0xFF6366F1)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _addFromMap() async {
    if (_selectedFromMap == null) return;
    final name = _nameCtrl.text.trim();
    if (name.isEmpty) {
      setState(() => _error = 'Lütfen bir isim girin.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await context.read<LocationsProvider>().addManual(
            name: name,
            latitude: _selectedFromMap!.latitude,
            longitude: _selectedFromMap!.longitude,
          );
      if (mounted) Navigator.pop(context);
    } catch (_) {
      setState(() {
        _error = 'Konum eklenemedi.';
        _loading = false;
      });
    }
  }

  Future<void> _addFromGps() async {
    final name = _nameCtrl.text.trim();
    if (name.isEmpty) {
      setState(() => _error = 'Lütfen bir isim girin.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await context.read<LocationsProvider>().addFromGps(name);
      if (mounted) Navigator.pop(context);
    } catch (_) {
      setState(() {
        _error = 'Konum alınamadı. GPS açık mı?';
        _loading = false;
      });
    }
  }
}
