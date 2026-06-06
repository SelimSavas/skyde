import 'dart:async';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';
import 'core/app_locale_notifier.dart';
import 'core/models/daily_task.dart';
import 'core/models/saved_location.dart';
import 'core/models/user_preferences.dart';
import 'core/services/background_service.dart';
import 'core/services/notification_service.dart';
import 'core/services/daily_task_service.dart';
import 'core/services/preferences_service.dart';
import 'features/home/home_provider.dart';
import 'features/home/home_screen.dart';
import 'features/locations/locations_provider.dart';
import 'features/onboarding/onboarding_provider.dart';
import 'features/tasks/daily_task_provider.dart';
import 'features/onboarding/onboarding_screen.dart';
import 'features/splash/boot_image_screen.dart';
import 'firebase_options.dart';
import 'l10n/gen_l10n/app_localizations.dart';

// Uygulama arka planda/kapalıyken gelen FCM mesajlarını yakala
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  await NotificationService.showWeatherAlert(
    title: message.notification?.title ?? 'Hava Durumu Uyarısı',
    body: message.notification?.body ?? '',
    id: 10,
  );
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Üst status bar tamamen kapalı: OEM/şeffaf şerit + “boş üst bant” olmaz; sadece alt nav görünür.
  await SystemChrome.setEnabledSystemUIMode(
    SystemUiMode.manual,
    overlays: const [SystemUiOverlay.bottom],
  );

  // FCM: runApp öncesi kayıt (FlutterFire önerisi)
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  // Splash decode, ağır init ile paralel; runApp gecikmez → ara siyah ekran azalır
  final splashPrecache = _precacheBootSplashImage();

  runApp(SkydeApp(splashPrecache: splashPrecache));
}

/// [BootImageScreen] ile aynı asset — decode tamamlanmadan düz renk flaşı olmaz.
Future<void> _precacheBootSplashImage() async {
  const provider = AssetImage('assets/images/splash_logo.png');
  final stream = provider.resolve(ImageConfiguration.empty);
  final completer = Completer<void>();
  late final ImageStreamListener listener;
  listener = ImageStreamListener(
    (ImageInfo _, bool __) {
      if (!completer.isCompleted) completer.complete();
      stream.removeListener(listener);
    },
    onError: (Object e, StackTrace? st) {
      if (!completer.isCompleted) completer.completeError(e, st);
      stream.removeListener(listener);
    },
  );
  stream.addListener(listener);
  await completer.future;
}

Future<void> _setupFCM() async {
  final messaging = FirebaseMessaging.instance;

  // İzin iste (iOS için zorunlu, Android 13+ için de gerekli)
  await messaging.requestPermission(
    alert: true,
    badge: true,
    sound: true,
  );

  // Ön planda gelen bildirimleri göster
  await FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(
    alert: true,
    badge: true,
    sound: true,
  );

  // FCM token (ileride sunucuya göndermek için; loglama yok — üretim güvenliği)
  await messaging.getToken();

  // Uygulama açıkken gelen mesajları local notification olarak göster
  FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    if (message.notification != null) {
      NotificationService.showWeatherAlert(
        title: message.notification!.title ?? 'Hava Uyarısı',
        body: message.notification!.body ?? '',
        id: 11,
      );
    }
  });
}

class SkydeApp extends StatelessWidget {
  const SkydeApp({super.key, required this.splashPrecache});

  final Future<void> splashPrecache;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppLocaleNotifier()),
        ChangeNotifierProvider(create: (_) => OnboardingProvider()),
        ChangeNotifierProvider(create: (_) => LocationsProvider()),
        ChangeNotifierProvider(create: (_) => HomeProvider()),
        ChangeNotifierProvider(create: (_) => DailyTaskProvider()),
      ],
      child: _SkydeMaterialApp(splashPrecache: splashPrecache),
    );
  }
}

class _SkydeMaterialApp extends StatelessWidget {
  const _SkydeMaterialApp({required this.splashPrecache});

  final Future<void> splashPrecache;

  @override
  Widget build(BuildContext context) {
    final appLocale = context.watch<AppLocaleNotifier>().locale;

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2ECC71)),
        useMaterial3: true,
        fontFamily: 'Roboto',
        scaffoldBackgroundColor: Colors.transparent,
        canvasColor: Colors.transparent,
      ),
      locale: appLocale,
      localeResolutionCallback: (deviceLocale, supportedLocales) {
        if (appLocale != null) return appLocale;
        if (deviceLocale != null) {
          for (final locale in supportedLocales) {
            if (locale.languageCode == deviceLocale.languageCode) {
              return locale;
            }
          }
        }
        return const Locale('tr');
      },
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('tr'),
        Locale('en'),
      ],
      home: _AppEntry(splashPrecache: splashPrecache),
    );
  }
}

class _AppEntry extends StatefulWidget {
  const _AppEntry({required this.splashPrecache});

  final Future<void> splashPrecache;

  @override
  State<_AppEntry> createState() => _AppEntryState();
}

class _AppEntryState extends State<_AppEntry> {
  bool? _onboardingComplete;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _bootstrap());
  }

  /// Tercihler + (gerekirse) ilk hava isteği bitene kadar [BootImageScreen].
  Future<void> _bootstrap() async {
    Future<void> safePrecache() async {
      try {
        await widget.splashPrecache;
      } catch (e, st) {
        debugPrint('Boot splash önbellek: $e\n$st');
      }
    }

    Future<void> safeFirebase() async {
      try {
        await Firebase.initializeApp(
          options: DefaultFirebaseOptions.currentPlatform,
        );
      } catch (e, st) {
        debugPrint('Firebase init: $e\n$st');
      }
    }

    await Future.wait<void>([safePrecache(), safeFirebase()]);

    await Hive.initFlutter();
    Hive.registerAdapter(SavedLocationAdapter());
    Hive.registerAdapter(DailyTaskAdapter());
    await Hive.openBox<SavedLocation>('locations');
    await Hive.openBox<DailyTask>('daily_tasks');

    await NotificationService.init();
    try {
      await _setupFCM();
    } catch (e, st) {
      debugPrint('FCM kurulum: $e\n$st');
    }
    await BackgroundService.init();
    await BackgroundService.scheduleWeatherCheck();

    final UserPreferences prefs;
    try {
      prefs = await PreferencesService().load();
      await DailyTaskService.init();
    } catch (e, st) {
      debugPrint('Açılış (tercihler / görevler): $e\n$st');
      if (!mounted) return;
      setState(() => _onboardingComplete = false);
      return;
    }

    if (!mounted) return;
    context.read<AppLocaleNotifier>().applyLanguageCode(prefs.languageCode);
    await context.read<LocationsProvider>().waitForInitialPreferences();
    if (!mounted) return;

    if (!prefs.isOnboardingComplete) {
      setState(() => _onboardingComplete = false);
      return;
    }

    // Hata durumunda HomeProvider error; yine de ana ekrana geç (hata UI).
    await context.read<HomeProvider>().loadData(
          locationsProvider: context.read<LocationsProvider>(),
        );
    if (!mounted) return;
    setState(() => _onboardingComplete = true);
  }

  @override
  Widget build(BuildContext context) {
    if (_onboardingComplete == null) {
      return const BootImageScreen();
    }
    return _onboardingComplete! ? const HomeScreen() : const OnboardingScreen();
  }
}
