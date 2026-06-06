import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';

import '../../core/models/daily_task.dart';
import '../../core/models/user_preferences.dart';

/// Planla ekranında görevlerin gruplandığı kategoriler (şehir / çiftçi ayrı set).
enum ActionPlanCategoryKind {
  /// Şehir: dışarı, spor, yürüyüş
  cityOutdoorMotion,

  /// Şehir: işe gidiş, toplantı, araç
  cityWorkTransport,

  /// Şehir: okul, çocuk, alışveriş
  cityFamilyDaily,

  /// Şehir: piknik, misafir
  citySocialEvents,

  /// Çiftçi: tarla, hasat, ekim, fide, gübre
  farmerFieldCrop,

  /// Çiftçi: ilaçlama, budama
  farmerPlantCare,

  /// Çiftçi: sulama
  farmerWater,

  /// Çiftçi: hayvan, sera
  farmerAnimalShed,
}

/// Kategori başlığı + bölüm ikonu (Lucide).
class ActionPlanCategoryMeta {
  final String title;
  final IconData sectionIcon;

  const ActionPlanCategoryMeta({
    required this.title,
    required this.sectionIcon,
  });
}

/// Planla listesi: kategori sırası, başlıklar ve görev başına ikon.
abstract final class ActionPlanTaskCatalog {
  static ActionPlanCategoryKind categoryKindFor(UserMode mode, String taskId) {
    if (mode == UserMode.city) {
      return switch (taskId) {
        'city_outdoor' ||
        'city_sport' ||
        'city_walk' =>
          ActionPlanCategoryKind.cityOutdoorMotion,
        'city_work' ||
        'city_meeting' ||
        'city_driving' =>
          ActionPlanCategoryKind.cityWorkTransport,
        'city_school' ||
        'city_kids' ||
        'city_shopping' =>
          ActionPlanCategoryKind.cityFamilyDaily,
        'city_picnic' || 'city_guests' => ActionPlanCategoryKind.citySocialEvents,
        _ => ActionPlanCategoryKind.cityOutdoorMotion,
      };
    }
    return switch (taskId) {
      'farmer_field' ||
      'farmer_harvest' ||
      'farmer_sowing' ||
      'farmer_seedling' ||
      'farmer_fertilize' =>
        ActionPlanCategoryKind.farmerFieldCrop,
      'farmer_spray' || 'farmer_pruning' => ActionPlanCategoryKind.farmerPlantCare,
      'farmer_irrigate' => ActionPlanCategoryKind.farmerWater,
      'farmer_animal' ||
      'farmer_greenhouse' =>
        ActionPlanCategoryKind.farmerAnimalShed,
      _ => ActionPlanCategoryKind.farmerFieldCrop,
    };
  }

  static int _categoryOrder(ActionPlanCategoryKind k, UserMode mode) {
    if (mode == UserMode.city) {
      return switch (k) {
        ActionPlanCategoryKind.cityOutdoorMotion => 0,
        ActionPlanCategoryKind.cityWorkTransport => 1,
        ActionPlanCategoryKind.cityFamilyDaily => 2,
        ActionPlanCategoryKind.citySocialEvents => 3,
        _ => 99,
      };
    }
    return switch (k) {
      ActionPlanCategoryKind.farmerFieldCrop => 0,
      ActionPlanCategoryKind.farmerPlantCare => 1,
      ActionPlanCategoryKind.farmerWater => 2,
      ActionPlanCategoryKind.farmerAnimalShed => 3,
      _ => 99,
    };
  }

  static ActionPlanCategoryMeta metaFor(ActionPlanCategoryKind k, UserMode mode) {
    if (mode == UserMode.city) {
      return switch (k) {
        ActionPlanCategoryKind.cityOutdoorMotion => const ActionPlanCategoryMeta(
            title: 'Dışarı & hareket',
            sectionIcon: LucideIcons.trees,
          ),
        ActionPlanCategoryKind.cityWorkTransport => const ActionPlanCategoryMeta(
            title: 'İş & ulaşım',
            sectionIcon: LucideIcons.briefcase,
          ),
        ActionPlanCategoryKind.cityFamilyDaily => const ActionPlanCategoryMeta(
            title: 'Günlük & aile',
            sectionIcon: LucideIcons.home,
          ),
        ActionPlanCategoryKind.citySocialEvents => const ActionPlanCategoryMeta(
            title: 'Etkinlik & sosyal',
            sectionIcon: LucideIcons.party_popper,
          ),
        _ => const ActionPlanCategoryMeta(
            title: 'Diğer',
            sectionIcon: LucideIcons.list,
          ),
      };
    }
    return switch (k) {
      ActionPlanCategoryKind.farmerFieldCrop => const ActionPlanCategoryMeta(
          title: 'Tarla & ürün',
          sectionIcon: LucideIcons.tractor,
        ),
      ActionPlanCategoryKind.farmerPlantCare => const ActionPlanCategoryMeta(
          title: 'Bitki bakımı',
          sectionIcon: LucideIcons.leaf,
        ),
      ActionPlanCategoryKind.farmerWater => const ActionPlanCategoryMeta(
          title: 'Sulama',
          sectionIcon: LucideIcons.droplets,
        ),
      ActionPlanCategoryKind.farmerAnimalShed => const ActionPlanCategoryMeta(
          title: 'Hayvan & yapı',
          sectionIcon: LucideIcons.warehouse,
        ),
      _ => const ActionPlanCategoryMeta(
          title: 'Diğer',
          sectionIcon: LucideIcons.list,
        ),
    };
  }

  /// Her eylem için en uygun Lucide sembolü.
  static IconData iconForTaskId(String taskId) {
    return switch (taskId) {
      // Şehir
      'city_outdoor' => LucideIcons.trees,
      'city_driving' => LucideIcons.car_front,
      'city_sport' => LucideIcons.activity,
      'city_picnic' => LucideIcons.tent_tree,
      'city_meeting' => LucideIcons.presentation,
      'city_work' => LucideIcons.briefcase,
      'city_school' => LucideIcons.school,
      'city_shopping' => LucideIcons.shopping_cart,
      'city_kids' => LucideIcons.baby,
      'city_walk' => LucideIcons.footprints,
      'city_guests' => LucideIcons.users_round,
      // Çiftçi
      'farmer_spray' => LucideIcons.spray_can,
      'farmer_irrigate' => LucideIcons.droplets,
      'farmer_harvest' => LucideIcons.wheat,
      'farmer_fertilize' => LucideIcons.leaf,
      'farmer_seedling' => LucideIcons.sprout,
      'farmer_field' => LucideIcons.tractor,
      'farmer_animal' => LucideIcons.beef,
      'farmer_greenhouse' => LucideIcons.warehouse,
      'farmer_pruning' => LucideIcons.scissors,
      'farmer_sowing' => LucideIcons.circle_dot,
      _ => LucideIcons.circle_help,
    };
  }

  /// Kategoriye göre sıralı görev listesi (aynı kategoride etiket alfabetik).
  static List<DailyTask> sortedTasks(UserMode mode, List<DailyTask> tasks) {
    final copy = List<DailyTask>.from(tasks);
    copy.sort((a, b) {
      final ka = categoryKindFor(mode, a.id);
      final kb = categoryKindFor(mode, b.id);
      final o = _categoryOrder(ka, mode).compareTo(_categoryOrder(kb, mode));
      if (o != 0) return o;
      return a.label.compareTo(b.label);
    });
    return copy;
  }
}
