# GitHub Pages — Gizlilik Politikası

## Hedef URL

```
https://KULLANICI_ADINIZ.github.io/skyde/privacy-policy.html
```

`KULLANICI_ADINIZ` = GitHub profil URL'nizdeki isim (`https://github.com/burasi`).

> **Hesap:** `SelimSavas` — Pages URL'leri küçük harfle yayınlanır (`selimsavas.github.io`).

## Adımlar

### 0. Kullanıcı adınızı bulun

GitHub'a giriş yapın → profil → adres çubuğu: `github.com/KULLANICI_ADINIZ`

```bash
cp scripts/github_pages.local.example scripts/github_pages.local
# github_pages.local → GITHUB_USER=gerçek_adınız
```

### 1. GitHub'da repo oluştur

1. https://github.com/new
2. **Repository name:** `skyde`
3. **Public**
4. README, .gitignore, license **ekleme**
5. **Create repository**

### 2. Kodu push et

```bash
cd /home/slm/yagmurvarmi
./scripts/publish_github_pages.sh
```

veya:

```bash
GITHUB_USER=KULLANICI_ADINIZ ./scripts/publish_github_pages.sh
```

Push sırasında GitHub kullanıcı adı + **Personal Access Token** (şifre yerine) istenir.
Token: GitHub → Settings → Developer settings → Personal access tokens → `repo` izni.

### 3. Pages'i aç

1. https://github.com/SelimSavas/skyde/settings/pages
2. **Source:** Deploy from a branch
3. **Branch:** `main` → Folder: **`/docs`**
4. **Save**

1–2 dakika sonra site yayında olur.

### 4. Play Console

**Policy → Privacy policy** alanına yapıştır:

`https://selimsavas.github.io/skyde/privacy-policy.html`

`lib/core/constants/app_urls.dart` içindeki URL ile aynıdır.
