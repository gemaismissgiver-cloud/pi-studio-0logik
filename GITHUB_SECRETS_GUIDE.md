# 🔐 GITHUB SECRETS ANLEITUNG FÜR PI STUDIO 0-LOGIK
══════════════════════════════════════════════════════════════════

Damit deine GitHub Actions Pipeline automatisch:
1. Dein APK mit einem offiziellen Keystore signiert (keine Android-Sicherheitswarnung)
2. Deine Web App automatisch auf Firebase Hosting & Firestore deployt

Trage folgende Secrets in dein GitHub Repository ein:
**Pfad:** GitHub Repository → **Settings** → **Secrets and variables** → **Actions** → Button **New repository secret**

---

### 1. ANDROID APK SIGNIERUNGS-SECRETS

| Secret-Name | Beschreibung | Beispielwert |
| :--- | :--- | :--- |
| `ANDROID_KEYSTORE_BASE64` | Dein Android .keystore oder .jks als Base64-String | `base64 -w 0 release.keystore` |
| `ANDROID_KEYSTORE_PASSWORD` | Das Passwort für deinen Keystore | `MeinSicheresPasswort123!` |
| `ANDROID_KEY_ALIAS` | Der Alias-Name des Schlüssels | `pi0logik` |
| `ANDROID_KEY_PASSWORD` | Passwort für den Schlüssel (oft gleich wie Keystore) | `MeinSicheresPasswort123!` |

> **Tipp:** Wenn du noch keinen Keystore hast, kannst du ihn mit einem Befehl erzeugen:
> ```bash
> keytool -genkey -v -keystore release.keystore -alias pi0logik -keyalg RSA -keysize 2048 -validity 10000
> base64 -w 0 release.keystore > release.keystore.base64.txt
> ```
> Kopiere dann den Inhalt von `release.keystore.base64.txt` in das Secret `ANDROID_KEYSTORE_BASE64`.

---

### 2. FIREBASE DEPLOYMENT SECRETS

| Secret-Name | Beschreibung | Beispielwert |
| :--- | :--- | :--- |
| `FIREBASE_TOKEN` | Firebase CLI Login Token (`firebase login:ci`) | `1//0g...xyz` |
| `FIREBASE_PROJECT_ID` | Die Firebase Cloud Projekt-ID | `gemaispmissgiver-pi0logik` |
| `FIREBASE_SERVICE_ACCOUNT` | (Optional) Dienstkonto JSON als Base64 oder Raw | `{"type": "service_account", ...}` |

> **Token generieren:**
> Führe lokal im Terminal aus: `npx firebase login:ci`
> Der ausgegebene Token wird als `FIREBASE_TOKEN` in GitHub hinterlegt.

---

### 3. KI / GEMINI API SECRET (OPTIONAL)

| Secret-Name | Beschreibung |
| :--- | :--- |
| `GEMINI_API_KEY` | Google AI Studio API Key für erweiterte Kortex-Berechnungen |

══════════════════════════════════════════════════════════════════
0-Logik: Deterministisch. Sicher. Berechenbar.
