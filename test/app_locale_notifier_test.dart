import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yagmurvarmi/core/app_locale_notifier.dart';

void main() {
  test('applyLanguageCode updates locale and notifies once', () {
    final notifier = AppLocaleNotifier();
    var notifications = 0;
    notifier.addListener(() => notifications++);

    notifier.applyLanguageCode('en');
    expect(notifier.locale, const Locale('en'));
    expect(notifications, 1);

    notifier.applyLanguageCode('en');
    expect(notifications, 1);

    notifier.applyLanguageCode('tr');
    expect(notifier.locale, const Locale('tr'));
    expect(notifications, 2);
  });
}
