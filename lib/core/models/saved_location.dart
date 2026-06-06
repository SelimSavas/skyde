import 'package:hive/hive.dart';

part 'saved_location.g.dart';

@HiveType(typeId: 0)
class SavedLocation extends HiveObject {
  @HiveField(0)
  final String name;

  @HiveField(1)
  final double latitude;

  @HiveField(2)
  final double longitude;

  @HiveField(3)
  final bool isDefault;

  SavedLocation({
    required this.name,
    required this.latitude,
    required this.longitude,
    this.isDefault = false,
  });
}
