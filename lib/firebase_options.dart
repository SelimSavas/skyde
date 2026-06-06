// Bu dosya "flutterfire configure" komutu çalıştırıldığında otomatik doldurulur.
// Şimdilik uygulama Firebase olmadan da çalışır (push bildirimler devre dışı).
//
// KURULUM ADIMLARI:
// 1. https://console.firebase.google.com → Yeni proje oluştur → "yagmurvarmi"
// 2. Terminalde: export PATH="$HOME/.npm-global/bin:$HOME/.pub-cache/bin:$PATH"
// 3. firebase login
// 4. cd /home/slm/yagmurvarmi && flutterfire configure
// 5. Bu dosya otomatik güncellenecek, main.dart'ta Firebase.initializeApp() açılacak.

// ignore_for_file: lines_longer_than_80_chars, avoid_classes_with_only_static_members
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) throw UnsupportedError('Web platformu desteklenmiyor.');
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError('Bu platform desteklenmiyor.');
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAz8TSc3X3ZnbaKc52wD_pRnWexOlFkUCs',
    appId: '1:781105967681:android:5e540c6d1086e7aaf60cc0',
    messagingSenderId: '781105967681',
    projectId: 'yagmurvarmi',
    storageBucket: 'yagmurvarmi.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyADFn7_FGRW-eVRa1M2oTL-FcKCn7cIaro',
    appId: '1:781105967681:ios:fa18f3e62733e80af60cc0',
    messagingSenderId: '781105967681',
    projectId: 'yagmurvarmi',
    storageBucket: 'yagmurvarmi.firebasestorage.app',
    iosBundleId: 'com.yagmurvarmi.yagmurvarmi',
  );

}