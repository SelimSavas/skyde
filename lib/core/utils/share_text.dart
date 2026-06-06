import 'package:share_plus/share_plus.dart';

/// Sistem paylaşım sayfası (mesaj, e-posta vb.) ile düz metin paylaşır.
Future<void> sharePlainText(String text) async {
  final t = text.trim();
  if (t.isEmpty) return;
  await Share.share(t);
}
