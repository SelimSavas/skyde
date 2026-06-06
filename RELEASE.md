# Skyde — Yayın Kontrol Listesi

## 1. Android (Play Store)

```bash
# Keystore (bir kez — şifreler android/keystore-credentials.local.txt)
./scripts/create_release_keystore.sh

# Release AAB
flutter build appbundle --release
# Çıktı: build/app/outputs/bundle/release/app-release.aab
```

**Mevcut build (Haziran 2026):** `app-release.aab` (~41 MB) upload keystore ile imzalandı.

- Play Console → **Gizlilik politikası URL**:
  `https://selimsavas.github.io/skyde/privacy-policy.html`
  (GitHub Pages — `scripts/publish_github_pages.sh`)
- **Veri güvenliği** formu: konum, bildirim token, yerel tercihler.
- **İçerik derecelendirmesi** anketini doldurun.

## 2. iOS (App Store / TestFlight)

Mac gerekir:

```bash
cd ios && pod install && cd ..
flutter build ipa --release
```

- `ios/Runner/GoogleService-Info.plist` mevcut (Firebase).
- Apple Developer hesabı + imzalama sertifikaları gerekli.

## 3. Mağaza görselleri

| Öğe | Boyut |
|-----|-------|
| Play feature graphic | 1024×500 |
| Play ikon | 512×512 |
| App Store ikon | 1024×1024 |
| Ekran görüntüleri | Telefon (min. 2) |

## 4. Sürüm

`pubspec.yaml` → `version: 0.2.0+2` (her yayında `+buildNumber` artırın).

## 5. Güvenlik

- `android/key.properties` ve `*.jks` repoya **eklenmez**.
- `destek@skyde.app` e-postasını gerçek destek adresiyle güncelleyin.
