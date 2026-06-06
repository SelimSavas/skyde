#!/usr/bin/env bash
# Play Store upload keystore oluşturur ve key.properties şablonunu doldurur.
# Kullanım: ./scripts/create_release_keystore.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEYSTORE="${KEYSTORE_PATH:-$ROOT/android/upload-keystore.jks}"
PROPS="$ROOT/android/key.properties"

if [[ -f "$KEYSTORE" ]]; then
  echo "Keystore zaten var: $KEYSTORE"
  exit 0
fi

STORE_PASS="${STORE_PASSWORD:-}"
KEY_PASS="${KEY_PASSWORD:-}"
if [[ -z "$STORE_PASS" ]]; then
  read -rsp "Store password (min 6 karakter): " STORE_PASS
  echo
fi
if [[ -z "$KEY_PASS" ]]; then
  read -rsp "Key password (Enter = store ile aynı): " KEY_PASS
  echo
  KEY_PASS="${KEY_PASS:-$STORE_PASS}"
fi

keytool -genkeypair -v \
  -keystore "$KEYSTORE" \
  -alias upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "$STORE_PASS" \
  -keypass "$KEY_PASS" \
  -dname "CN=Skyde, OU=Mobile, O=Skyde, L=Istanbul, ST=Istanbul, C=TR"

cat > "$PROPS" <<EOF
storePassword=$STORE_PASS
keyPassword=$KEY_PASS
keyAlias=upload
storeFile=$KEYSTORE
EOF

chmod 600 "$PROPS" 2>/dev/null || true
echo "✓ Keystore: $KEYSTORE"
echo "✓ key.properties oluşturuldu (repoya eklemeyin)"
