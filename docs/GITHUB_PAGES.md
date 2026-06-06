# GitHub Pages — Gizlilik Politikası

## Hedef URL

```
https://16savasselim.github.io/skyde/privacy-policy.html
```

Ana sayfa (aynı içerik):

```
https://16savasselim.github.io/skyde/
```

## Adımlar

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

Farklı kullanıcı/repo için:

```bash
GITHUB_USER=KULLANICI REPO_NAME=skyde ./scripts/publish_github_pages.sh
```

Push sırasında GitHub kullanıcı adı + **Personal Access Token** (şifre yerine) istenir.
Token: GitHub → Settings → Developer settings → Personal access tokens → `repo` izni.

### 3. Pages'i aç

1. https://github.com/16savasselim/skyde/settings/pages
2. **Source:** Deploy from a branch
3. **Branch:** `main` → Folder: **`/docs`**
4. **Save**

1–2 dakika sonra site yayında olur.

### 4. Play Console

**Policy → Privacy policy** alanına yapıştır:

`https://16savasselim.github.io/skyde/privacy-policy.html`

`lib/core/constants/app_urls.dart` içindeki URL ile aynıdır.
