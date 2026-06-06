import 'package:flutter/material.dart';
import 'package:geocoding/geocoding.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/models/saved_location.dart';
import '../../core/utils/debug_log.dart';
import '../../core/services/location_service.dart';

class LocationsProvider extends ChangeNotifier {
  final _box = Hive.box<SavedLocation>('locations');
  final _locationService = LocationService();

  static const _keyUseLive = 'use_live_location';

  bool _useLiveLocation = true; // Varsayılan: canlı konum açık

  /// Canlı konumun ters geocoding adresi ("Kadıköy, İstanbul" gibi)
  String? _liveAddress;
  bool _liveAddressLoading = false;

  /// [SharedPreferences] ile canlı/kayıtlı konum bayrağı yüklenene kadar bekle (ilk hava isteği öncesi).
  late final Future<void> _initialPreferencesFuture = _loadInitialPreferences();

  LocationsProvider();

  bool get useLiveLocation => _useLiveLocation;
  String? get liveAddress => _liveAddress;
  bool get liveAddressLoading => _liveAddressLoading;

  List<SavedLocation> get locations => _box.values.toList();

  /// Kaydedilmiş aktif yer (canlı konum seçili değilse)
  SavedLocation? get activeLocation {
    if (_useLiveLocation) return null; // Canlı konum → null döner
    final all = locations;
    if (all.isEmpty) return null;
    final defaults = all.where((l) => l.isDefault).toList();
    return defaults.isNotEmpty ? defaults.first : all.first;
  }

  Future<void> _loadInitialPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    _useLiveLocation = prefs.getBool(_keyUseLive) ?? true;
    notifyListeners();
    refreshLiveAddress();
  }

  /// İlk [loadData] öncesi çağır; kayıtlı yer / canlı konum seçimi diske yazılmış olsun.
  Future<void> waitForInitialPreferences() => _initialPreferencesFuture;

  /// GPS konumunu alıp ters geocoding ile adres çözer
  Future<void> refreshLiveAddress() async {
    _liveAddressLoading = true;
    notifyListeners();
    try {
      final position = await _locationService.getCurrentLocation();
      if (position == null) {
        _liveAddress = null;
      } else {
        final placemarks = await placemarkFromCoordinates(
          position.latitude,
          position.longitude,
        );
        if (placemarks.isNotEmpty) {
          final p = placemarks.first;
          // Mahalle > İlçe > İl şeklinde en anlamlı kombinasyon
          final parts = <String>[
            if ((p.subLocality ?? '').isNotEmpty) p.subLocality!,
            if ((p.locality ?? '').isNotEmpty) p.locality!,
            if ((p.administrativeArea ?? '').isNotEmpty) p.administrativeArea!,
          ];
          // En fazla 2 parça göster (mahalle+ilçe veya ilçe+il)
          _liveAddress = parts.take(2).join(', ');
        }
      }
    } catch (e, st) {
      logSilentFailure('locations.reverseGeocode', e, st);
      _liveAddress = null;
    }
    _liveAddressLoading = false;
    notifyListeners();
  }

  /// "Konumum" (canlı GPS) seçilince çağrılır
  Future<void> setLiveLocation() async {
    _useLiveLocation = true;
    refreshLiveAddress(); // adresi güncelle (await yok — arka planda)
    // Kayıtlı yerlerin varsayılan işaretini kaldır
    for (int i = 0; i < _box.length; i++) {
      final loc = _box.getAt(i)!;
      if (loc.isDefault) {
        await _box.putAt(i, SavedLocation(
          name: loc.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
          isDefault: false,
        ));
      }
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyUseLive, true);
    notifyListeners();
  }

  Future<void> addFromGps(String name) async {
    final position = await _locationService.getCurrentLocation();
    if (position == null) throw Exception('Konum alınamadı');
    await _add(SavedLocation(
      name: name,
      latitude: position.latitude,
      longitude: position.longitude,
      isDefault: locations.isEmpty,
    ));
  }

  Future<void> addManual({
    required String name,
    required double latitude,
    required double longitude,
  }) async {
    await _add(SavedLocation(
      name: name,
      latitude: latitude,
      longitude: longitude,
      isDefault: locations.isEmpty,
    ));
  }

  Future<void> _add(SavedLocation loc) async {
    await _box.add(loc);
    notifyListeners();
  }

  Future<void> delete(int index) async {
    final loc = _box.getAt(index);
    final wasDefault = loc?.isDefault ?? false;
    await _box.deleteAt(index);
    // Silinen varsayılan ise ilk kalan yeri varsayılan yap
    if (wasDefault && _box.isNotEmpty) {
      final first = _box.getAt(0)!;
      await _box.putAt(0, SavedLocation(
        name: first.name,
        latitude: first.latitude,
        longitude: first.longitude,
        isDefault: true,
      ));
    }
    notifyListeners();
  }

  Future<void> setDefault(int index) async {
    _useLiveLocation = false;
    for (int i = 0; i < _box.length; i++) {
      final loc = _box.getAt(i)!;
      await _box.putAt(i, SavedLocation(
        name: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        isDefault: i == index,
      ));
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyUseLive, false);
    notifyListeners();
  }
}
