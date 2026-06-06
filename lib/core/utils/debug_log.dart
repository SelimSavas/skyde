import 'package:flutter/foundation.dart';

/// Üretimde sessiz, debug modda görünür hata kaydı.
void logSilentFailure(String context, [Object? error, StackTrace? stackTrace]) {
  if (!kDebugMode) return;
  debugPrint('[$context] $error');
  if (stackTrace != null) debugPrint(stackTrace.toString());
}
