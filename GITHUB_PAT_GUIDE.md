# 🔑 SCHRITT-FÜR-SCHRITT ANLEITUNG: GITHUB PERSONAL ACCESS TOKEN (PAT) ERSTELLEN
═══════════════════════════════════════════════════════════════════════════════

Mit diesem Token kann PI Studio 0-Logik direkt von deiner App aus Commits,
Releases und APK-Builds nach GitHub übertragen – ohne Passwörter im Klartext.

---

### SCHRITT 1: ZU DEN GITHUB-EINSTELLUNGEN NAVIGIEREN
1. Öffne im Browser: **https://github.com/settings/tokens**
   *(Oder: Auf github.com oben rechts auf dein **Profilbild** klicken → **Settings** auswählen).*
2. Scrolle in der linken Menüleiste ganz nach unten und klicke auf:
   👉 **<> Developer Settings** (Entwicklereinstellungen).

---

### SCHRITT 2: TOKEN-TYP AUSWÄHLEN
1. Klicke im linken Menü auf:
   👉 **Personal access tokens**
2. Wähle im Untermenü:
   👉 **Tokens (classic)**
3. Klicke oben rechts auf den blauen Button:
   👉 **Generate new token** → **Generate new token (classic)**.
   *(Eventuell fragt GitHub nach deiner Bestätigung oder 2FA-Code).*

---

### SCHRITT 3: BERECHTIGUNGEN (SCOPES) EINSTELLEN
1. **Note (Beschreibung):**
   Gib einen Namen ein, z.B.:
   `PI-Studio-0Logik`
2. **Expiration (Gültigkeitsdauer):**
   Wähle nach Wunsch:
   * **90 days** (Empfohlen für Sicherheit)
   * Oder: **No expiration** (läuft nie ab)
3. **Select scopes (Berechtigungen ankreuzen):**
   Setze bei folgenden zwei Feldern ein Häkchen:
   * ✅ **`repo`** (Ganz oben — Volle Kontrolle über Repositories, Commits & Uploads)
   * ✅ **`workflow`** (Etwas weiter unten — Erlaubt das Aktualisieren der GitHub Actions Workflows)

---

### SCHRITT 4: TOKEN ERZEUGEN & KOPIEREN
1. Scrolle ganz nach unten und klicke auf den grünen Button:
   👉 **Generate token**
2. **WICHTIG:** GitHub zeigt den Token jetzt **nur ein einziges Mal** an!
   Er beginnt immer mit: `ghp_...` (z.B. `ghp_aBcD123456789...`).
3. Klicke auf das kleine **Kopier-Symbol** neben dem Token.

---

### SCHRITT 5: IN PI STUDIO EINFÜGEN & SPEICHERN
1. Öffne in PI Studio den Reiter:
   👉 **Build / Git** → Unterreiter **GitHub Studio**.
2. Füge den kopierten Token (`ghp_...`) in das Feld:
   👉 **„GitHub Personal Access Token (PAT)“** ein.
3. Gib deinen Wunschnamen für das Repository ein (z.B. `pi-studio-0logik` oder `PI_Studio_v1.0`).
4. Klicke auf:
   👉 **🚀 DIREKT ZU GITHUB HOCHLADEN**

---

### WAS PASSIERT DANACH?
* PI Studio erstellt oder aktualisiert dein GitHub Repository vollautomatisch.
* GitHub Actions startet die reparierte **main.yml** Pipeline.
* Dein Motorola 13 Standalone-Paket wird kompiliert und im Reiter **Releases** als Download bereitgestellt!

═══════════════════════════════════════════════════════════════════════════════
0-Logik: Deterministisch. Autonom. Berechenbar.
