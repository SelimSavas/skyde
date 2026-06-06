import 'package:hive/hive.dart';

part 'daily_task.g.dart';

@HiveType(typeId: 1)
class DailyTask extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String label;

  @HiveField(2)
  final String mode; // 'city' or 'farmer'

  @HiveField(3)
  bool isActive;

  @HiveField(4)
  bool isPersistent;

  @HiveField(5)
  String? lastActiveDate; // yyyy-MM-dd

  DailyTask({
    required this.id,
    required this.label,
    required this.mode,
    this.isActive = false,
    this.isPersistent = false,
    this.lastActiveDate,
  });
}

class DailyTaskDefaults {
  static const cityTasks = [
    {'id': 'city_outdoor', 'label': 'Dışarı çıkacağım'},
    {'id': 'city_driving', 'label': 'Araç kullanacağım'},
    {'id': 'city_sport', 'label': 'Spor yapacağım'},
    {'id': 'city_picnic', 'label': 'Piknik / etkinlik var'},
    {'id': 'city_meeting', 'label': 'İş toplantısı var'},
    {'id': 'city_work', 'label': 'İşe gidiyorum'},
    {'id': 'city_school', 'label': 'Okul / servis'},
    {'id': 'city_shopping', 'label': 'Alışveriş yapacağım'},
    {'id': 'city_kids', 'label': 'Çocuklar dışarıda olacak'},
    {'id': 'city_walk', 'label': 'Yürüyüş / koşu yapacağım'},
    {'id': 'city_guests', 'label': 'Misafir gelecek'},
  ];

  static const farmerTasks = [
    {'id': 'farmer_spray', 'label': 'İlaçlama yapacağım'},
    {'id': 'farmer_irrigate', 'label': 'Sulama yapacağım'},
    {'id': 'farmer_harvest', 'label': 'Hasat var'},
    {'id': 'farmer_fertilize', 'label': 'Gübreleme yapacağım'},
    {'id': 'farmer_seedling', 'label': 'Fide dikimi'},
    {'id': 'farmer_field', 'label': 'Tarlaya çıkacağım'},
    {'id': 'farmer_animal', 'label': 'Hayvan bakımı'},
    {'id': 'farmer_greenhouse', 'label': 'Sera işleri'},
    {'id': 'farmer_pruning', 'label': 'Budama yapacağım'},
    {'id': 'farmer_sowing', 'label': 'Tohum ekimi'},
  ];
}
