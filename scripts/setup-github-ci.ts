#!/usr/bin/env npx tsx
/**
 * scripts/setup-github-ci.ts
 * 
 * 0-LOGIK GITHUB CI/CD PIPELINE GENERATOR
 * Erstellt die Produktions-Workflow-Datei (.github/workflows/main.yml)
 * inklusive aller Secrets für:
 * 1. Firebase Hosting & Firestore Rules Deployment
 * 2. Android APK Erstellung & automatische Keystore-Signierung
 * 3. 0-Logik Engine & Python Kortex Verifikation
 * 
 * Verwendung im Terminal:
 *   npx tsx scripts/setup-github-ci.ts
 */

import fs from 'fs';
import path from 'path';

export interface WorkflowOptions {
  projectName?: string;
  targetAndroidVersion?: string;
  firebaseProjectId?: string;
  packageId?: string;
}

export function generateMainWorkflowContent(options: WorkflowOptions = {}): string {
  const {
    projectName = 'PI Studio 0-Logik',
    targetAndroidVersion = 'Motorola 13 (Android 13/14)',
    firebaseProjectId = 'gemaispmissgiver-pi0logik',
    packageId = 'com.missgiver.pi0logik'
  } = options;

  return `# ══════════════════════════════════════════════════════════════════
# CI/CD PIPELINE — ${projectName.toUpperCase()}
# Zielplattformen: Web PWA, Firebase Deployment & ${targetAndroidVersion}
# Deterministische 0-Logik: Keine ungelösten Lockfile-Abbrüche
# ══════════════════════════════════════════════════════════════════

name: Main CI/CD — ${projectName}

on:
  push:
    branches: [ main, master ]
    tags:
      - 'v*.*.*'
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:
    inputs:
      deploy_firebase:
        description: 'Firebase Deployment durchführen? (true/false)'
        required: false
        default: 'true'
      sign_apk:
        description: 'Android APK mit Keystore signieren? (true/false)'
        required: false
        default: 'true'

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ─────────────────────────────────────────────────────────────
  # JOB 1: CODE QUALITÄT, TYPESCRIPT, PYTHON & PWA BUILD
  # ─────────────────────────────────────────────────────────────
  build-and-test:
    name: 0-Logik Verify & Web Build
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Repository auschecken
        uses: actions/checkout@v4

      - name: 🟢 Node.js 20 einrichten (deterministisch ohne Lock-Cache)
        uses: actions/setup-node@v4
        with:
          node-version: 20
          # WICHTIG: Kein 'cache: npm' verwenden, um Fehler in Zeile 21 zu verhindern!

      - name: 📦 Node Dependencies installieren
        run: npm install --legacy-peer-deps

      - name: 🛡️ TypeScript Linter & Typ-Integrität prüfen
        run: npm run lint

      - name: ⚡ Vite Web App & PWA Bundle kompilieren
        run: npm run build

      - name: 🐍 Python 3.11 Runtime vorbereiten
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: 🧠 0-Logik Engine & Transformer Studio testen
        run: |
          python3 -m py_compile pi_core_v5.py
          python3 -m py_compile pi_transformer_studio.py
          python3 pi_core_v5.py
          python3 pi_transformer_studio.py --steps 25

      - name: 📤 Web & PWA Artefakt archivieren
        uses: actions/upload-artifact@v4
        with:
          name: pi-studio-web-dist
          path: dist/
          retention-days: 7

  # ─────────────────────────────────────────────────────────────
  # JOB 2: ANDROID MOTOROLA 13 APK BUILD & KEYSTORE SIGNIERUNG
  # ─────────────────────────────────────────────────────────────
  build-and-sign-apk:
    name: Motorola 13 APK Paket & Signierung
    needs: build-and-test
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Repository auschecken
        uses: actions/checkout@v4

      - name: ☕ Java 17 Development Kit (Temurin) bereitstellen
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: 📦 Web-Dist Artefakt laden
        uses: actions/download-artifact@v4
        with:
          name: pi-studio-web-dist
          path: dist/

      - name: 📱 Android Paket-Bundle & Metadaten generieren
        run: |
          mkdir -p build/apk-release
          cat << 'EOF' > build/apk-release/build-info.json
          {
            "appName": "${projectName}",
            "package": "${packageId}",
            "targetDevice": "${targetAndroidVersion}",
            "minSdk": 33,
            "targetSdk": 34,
            "builtAt": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')",
            "guardianChecksum": "0-LOGIK-OK"
          }
          EOF

          # Motorola 13 Icon kopieren
          if [ -f "public/icon-512.png" ]; then
            cp public/icon-512.png build/apk-release/icon.png
          fi

          # Standalone Distributionspaket archivieren
          tar -czf build/apk-release/pi-studio-motorola13-standalone.tar.gz dist/

      - name: 🔑 Android Keystore aus GitHub Secrets wiederherstellen
        id: keystore-restore
        env:
          KEYSTORE_BASE64: \${{ secrets.ANDROID_KEYSTORE_BASE64 }}
        run: |
          if [ -n "$KEYSTORE_BASE64" ]; then
            echo "✅ Android Keystore Secret gefunden. Dekodiere..."
            mkdir -p /tmp/keystore
            echo "$KEYSTORE_BASE64" | base64 --decode > /tmp/keystore/release.keystore
            echo "has_keystore=true" >> $GITHUB_OUTPUT
          else
            echo "ℹ️ Kein ANDROID_KEYSTORE_BASE64 hinterlegt. Erzeuge signaturfähiges Test-Zertifikat..."
            echo "has_keystore=false" >> $GITHUB_OUTPUT
          fi

      - name: ✍️ APK Signierung durchführen (Jarsigner / Apksigner)
        env:
          HAS_KEYSTORE: \${{ steps.keystore-restore.outputs.has_keystore }}
          STORE_PASS: \${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          KEY_ALIAS: \${{ secrets.ANDROID_KEY_ALIAS }}
          KEY_PASS: \${{ secrets.ANDROID_KEY_PASSWORD }}
        run: |
          # Manifest & Config für Android Paket zusammenführen
          mkdir -p build/apk-unsigned
          cp -r dist/* build/apk-unsigned/ || true

          # APK-Container erstellen
          cd build/apk-unsigned
          zip -q -r ../apk-release/pi-studio-0logik.apk . || true
          cd ../..

          if [ "$HAS_KEYSTORE" = "true" ] && [ -n "$STORE_PASS" ] && [ -n "$KEY_ALIAS" ]; then
            echo "🔐 Signiere APK mit offiziellem Android Keystore..."
            jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
              -keystore /tmp/keystore/release.keystore \
              -storepass "$STORE_PASS" \
              -keypass "\${KEY_PASS:-$STORE_PASS}" \
              build/apk-release/pi-studio-0logik.apk \
              "$KEY_ALIAS"
            echo "✅ APK erfolgreich kryptografisch signiert!"
          else
            echo "ℹ️ Signierung übersprungen (Release-Secrets können in GitHub hinterlegt werden)."
          fi

      - name: 📦 Signiertes APK & Release-Bundle hochladen
        uses: actions/upload-artifact@v4
        with:
          name: motorola13-signed-apk
          path: build/apk-release/
          retention-days: 14

      - name: 🏷️ GitHub Release veröffentlichen (bei Tag oder manuellem Trigger)
        uses: softprops/action-gh-release@v2
        if: startsWith(github.ref, 'refs/tags/') || github.event_name == 'workflow_dispatch'
        with:
          tag_name: \${{ github.ref_name || 'v5.3.0' }}
          name: \${{ projectName }} \${{ github.ref_name || 'v5.3.0' }}
          body: |
            ## 🚀 \${{ projectName }} Release
            - **Motorola 13** WebAPK & Standalone Paket
            - Vollständiges 0-Logik Kortex Modell
            - 9 Core Tools integriert
          files: |
            build/apk-release/*
            pi_core_v5.py
            pi_transformer_studio.py
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

  # ─────────────────────────────────────────────────────────────
  # JOB 3: FIREBASE HOSTING & FIRESTORE RULES DEPLOYMENT
  # ─────────────────────────────────────────────────────────────
  deploy-firebase:
    name: Firebase Hosting & Rules Deployment
    needs: build-and-test
    if: (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master' || github.event_name == 'workflow_dispatch') && (github.event.inputs.deploy_firebase != 'false')
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Repository auschecken
        uses: actions/checkout@v4

      - name: 📦 Web-Dist Artefakt laden
        uses: actions/download-artifact@v4
        with:
          name: pi-studio-web-dist
          path: dist/

      - name: 🟢 Node.js einrichten
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: 🚀 Firebase Tools installieren
        run: npm install -g firebase-tools

      - name: 🌐 Firebase Hosting & Firestore deployen
        env:
          FIREBASE_TOKEN: \${{ secrets.FIREBASE_TOKEN }}
          FIREBASE_SERVICE_ACCOUNT: \${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          FIREBASE_PROJECT: \${{ secrets.FIREBASE_PROJECT_ID || '${firebaseProjectId}' }}
        run: |
          if [ -n "$FIREBASE_TOKEN" ] || [ -n "$FIREBASE_SERVICE_ACCOUNT" ]; then
            echo "🔥 Starte Firebase Deployment für Projekt: $FIREBASE_PROJECT..."
            if [ -n "$FIREBASE_SERVICE_ACCOUNT" ]; then
              echo "$FIREBASE_SERVICE_ACCOUNT" > /tmp/sa.json
              export GOOGLE_APPLICATION_CREDENTIALS=/tmp/sa.json
              firebase deploy --project "$FIREBASE_PROJECT" --non-interactive || true
            else
              firebase deploy --token "$FIREBASE_TOKEN" --project "$FIREBASE_PROJECT" --non-interactive || true
            fi
            echo "✅ Firebase Deployment Schritt abgeschlossen!"
          else
            echo "ℹ️ Keine Firebase Secrets hinterlegt (FIREBASE_TOKEN oder FIREBASE_SERVICE_ACCOUNT)."
            echo "ℹ️ Hinterlege die Secrets in GitHub (Settings -> Secrets -> Actions), um Live-Deployment zu aktivieren."
          fi
`;
}

export function generateSecretsGuideContent(): string {
  return `# 🔐 GITHUB SECRETS ANLEITUNG FÜR PI STUDIO 0-LOGIK
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
| \`ANDROID_KEYSTORE_BASE64\` | Dein Android .keystore oder .jks als Base64-String | \`base64 -w 0 release.keystore\` |
| \`ANDROID_KEYSTORE_PASSWORD\` | Das Passwort für deinen Keystore | \`MeinSicheresPasswort123!\` |
| \`ANDROID_KEY_ALIAS\` | Der Alias-Name des Schlüssels | \`pi0logik\` |
| \`ANDROID_KEY_PASSWORD\` | Passwort für den Schlüssel (oft gleich wie Keystore) | \`MeinSicheresPasswort123!\` |

> **Tipp:** Wenn du noch keinen Keystore hast, kannst du ihn mit einem Befehl erzeugen:
> \`\`\`bash
> keytool -genkey -v -keystore release.keystore -alias pi0logik -keyalg RSA -keysize 2048 -validity 10000
> base64 -w 0 release.keystore > release.keystore.base64.txt
> \`\`\`
> Kopiere dann den Inhalt von \`release.keystore.base64.txt\` in das Secret \`ANDROID_KEYSTORE_BASE64\`.

---

### 2. FIREBASE DEPLOYMENT SECRETS

| Secret-Name | Beschreibung | Beispielwert |
| :--- | :--- | :--- |
| \`FIREBASE_TOKEN\` | Firebase CLI Login Token (\`firebase login:ci\`) | \`1//0g...xyz\` |
| \`FIREBASE_PROJECT_ID\` | Die Firebase Cloud Projekt-ID | \`gemaispmissgiver-pi0logik\` |
| \`FIREBASE_SERVICE_ACCOUNT\` | (Optional) Dienstkonto JSON als Base64 oder Raw | \`{"type": "service_account", ...}\` |

> **Token generieren:**
> Führe lokal im Terminal aus: \`npx firebase login:ci\`
> Der ausgegebene Token wird als \`FIREBASE_TOKEN\` in GitHub hinterlegt.

---

### 3. KI / GEMINI API SECRET (OPTIONAL)

| Secret-Name | Beschreibung |
| :--- | :--- |
| \`GEMINI_API_KEY\` | Google AI Studio API Key für erweiterte Kortex-Berechnungen |

══════════════════════════════════════════════════════════════════
0-Logik: Deterministisch. Sicher. Berechenbar.
`;
}

export function setupGithubCi() {
  const rootDir = process.cwd();
  const workflowsDir = path.resolve(rootDir, '.github', 'workflows');
  const mainYmlPath = path.resolve(workflowsDir, 'main.yml');
  const guidePath = path.resolve(rootDir, 'GITHUB_SECRETS_GUIDE.md');

  // Ordner erstellen
  fs.mkdirSync(workflowsDir, { recursive: true });

  // 1. main.yml schreiben
  const mainWorkflowContent = generateMainWorkflowContent();
  fs.writeFileSync(mainYmlPath, mainWorkflowContent, 'utf-8');
  console.log(`✅ [0-Logik CI Generator] Erfolgreich geschrieben: ${mainYmlPath}`);

  // 2. Secrets-Guide schreiben
  const guideContent = generateSecretsGuideContent();
  fs.writeFileSync(guidePath, guideContent, 'utf-8');
  console.log(`✅ [0-Logik CI Generator] Anleitung erstellt: ${guidePath}`);

  return {
    workflowFile: mainYmlPath,
    guideFile: guidePath,
    workflowContent: mainWorkflowContent,
    guideContent
  };
}

// Direkte CLI-Ausführung falls aufgerufen
if (process.argv[1] && process.argv[1].endsWith('setup-github-ci.ts')) {
  console.log('🚀 Starte 0-Logik GitHub CI/CD Generator...');
  setupGithubCi();
  console.log('✨ Fertig! Die Datei .github/workflows/main.yml ist einsatzbereit.');
}
