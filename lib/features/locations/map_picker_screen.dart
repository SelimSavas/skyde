import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_map/flutter_map.dart';
import '../../core/utils/debug_log.dart';

/// Haritadan bir nokta seçip geri döndürür. [Navigator.pop(context, LatLng?)]
class MapPickerScreen extends StatefulWidget {
  /// Başlangıç merkezi (örn. mevcut konum veya Türkiye)
  final LatLng? initialCenter;
  final double initialZoom;

  const MapPickerScreen({
    super.key,
    this.initialCenter,
    this.initialZoom = 5,
  });

  @override
  State<MapPickerScreen> createState() => _MapPickerScreenState();
}

class _MapPickerScreenState extends State<MapPickerScreen> {
  static const _turkeyCenter = LatLng(39.0, 35.0);

  final _mapController = MapController();
  LatLng? _selected;
  bool _loadingLocation = false;

  LatLng get _center => widget.initialCenter ?? _turkeyCenter;

  @override
  void initState() {
    super.initState();
    if (widget.initialCenter == null) _tryMoveToCurrentLocation();
  }

  Future<void> _tryMoveToCurrentLocation() async {
    setState(() => _loadingLocation = true);
    try {
      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
      );
      if (mounted) {
        _mapController.move(
          LatLng(pos.latitude, pos.longitude),
          14,
        );
      }
    } catch (e, st) {
      logSilentFailure('mapPicker.gps', e, st);
    }
    if (mounted) setState(() => _loadingLocation = false);
  }

  void _onMapTap(TapPosition tapPosition, LatLng latlng) {
    setState(() => _selected = latlng);
  }

  void _confirm() {
    if (_selected != null) {
      Navigator.of(context).pop(_selected);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        systemNavigationBarColor: Colors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: const Color(0xFFF8F8FC),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.close_rounded, color: Color(0xFF111111)),
            onPressed: () => Navigator.of(context).pop(),
          ),
          title: Text(
            'Haritadan konum seç',
            style: GoogleFonts.lexend(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF111111),
            ),
          ),
          centerTitle: true,
        ),
        body: Stack(
          children: [
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _center,
                initialZoom: widget.initialZoom,
                onTap: _onMapTap,
                interactionOptions: const InteractionOptions(
                  flags: InteractiveFlag.all,
                ),
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.yagmurvarmi.yagmurvarmi',
                ),
                if (_selected != null)
                  MarkerLayer(
                    markers: [
                      Marker(
                        point: _selected!,
                        width: 40,
                        height: 40,
                        child: const Icon(
                          Icons.location_on_rounded,
                          color: Color(0xFF6366F1),
                          size: 40,
                        ),
                      ),
                    ],
                  ),
              ],
            ),

            // Alt bilgi
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                padding: EdgeInsets.fromLTRB(20, 16, 20, 16 + MediaQuery.of(context).padding.bottom),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.06),
                      blurRadius: 12,
                      offset: const Offset(0, -4),
                    ),
                  ],
                ),
                child: SafeArea(
                  top: false,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _selected == null
                            ? 'Haritada bir noktaya dokunun'
                            : '${_selected!.latitude.toStringAsFixed(4)}°, ${_selected!.longitude.toStringAsFixed(4)}°',
                        style: GoogleFonts.lexend(
                          fontSize: 13,
                          color: const Color(0xFF8E8E93),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          OutlinedButton.icon(
                            onPressed: _loadingLocation ? null : _tryMoveToCurrentLocation,
                            icon: _loadingLocation
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  )
                                : const Icon(Icons.my_location_rounded, size: 18),
                            label: const Text('Konumuma git'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF6366F1),
                              side: const BorderSide(color: Color(0xFF6366F1)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: FilledButton(
                              onPressed: _selected != null ? _confirm : null,
                              style: FilledButton.styleFrom(
                                backgroundColor: const Color(0xFF6366F1),
                                foregroundColor: Colors.white,
                              ),
                              child: const Text('Bu konumu kullan'),
                            ),
                          ),
                        ],
                      ),
                    ],
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
