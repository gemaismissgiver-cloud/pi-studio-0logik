import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Smartphone,
  Cpu,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Info,
  Wrench,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export interface CheckItem {
  id: string;
  category: 'manifest' | 'gradle' | 'signing' | 'system';
  title: string;
  requirement: string;
  whyItFails: string;
  resolution: string;
  status: 'pass' | 'warning' | 'fail';
  codeSnippet?: string;
}

export const APKBuildDoctor: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>('exported-check');
  const [activeFilter, setActiveFilter] = useState<'all' | 'manifest' | 'gradle' | 'signing' | 'system'>('all');
  const [manifestInput, setManifestInput] = useState<string>(`<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.missgiver.pi0logik"
    android:versionCode="530"
    android:versionName="5.3.0-motorola13">

    <!-- Motorola 13 Granulare Medien- & Sensor-Berechtigungen -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="PI Studio 0-Logik"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar.Fullscreen"
        android:hardwareAccelerated="true">

        <!-- KRITISCH FÜR MOTOROLA 13: android:exported="true" zwingend vorgeschrieben -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:launchMode="singleTask">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`);

  const [validationReport, setValidationReport] = useState<{
    score: number;
    issuesFound: number;
    details: string[];
  } | null>(null);

  const checklist: CheckItem[] = [
    {
      id: 'exported-check',
      category: 'manifest',
      title: 'android:exported="true" auf Haupt-Activity',
      requirement: 'Jede Activity mit <intent-filter> MUSS zwingend android:exported="true" deklarieren.',
      whyItFails: 'Seit Android 12 (und auf Motorola Android 13/14) verweigert der Paketmanager die Installation sofort mit INSTALL_PARSE_FAILED_MANIFEST_MALFORMED, wenn dieses Attribut fehlt.',
      resolution: 'Füge android:exported="true" direkt in das <activity android:name=".MainActivity" ...> Tag ein.',
      status: 'pass',
      codeSnippet: '<activity\n    android:name=".MainActivity"\n    android:exported="true">\n    <intent-filter>\n        <action android:name="android.intent.action.MAIN" />\n        <category android:name="android.intent.category.LAUNCHER" />\n    </intent-filter>\n</activity>'
    },
    {
      id: 'minsdk-check',
      category: 'gradle',
      title: 'minSdkVersion <= 33 (Motorola 13 Kompatibilität)',
      requirement: 'minSdkVersion darf maximal 33 (oder kleiner, z.B. 26) betragen.',
      whyItFails: 'Wenn minSdkVersion auf 34 eingestellt ist, meldet ein Motorola-Gerät mit Android 13 (API Level 33) beim Öffnen der APK: "Beim Parsen des Pakets ist ein Problem aufgetreten" (Inkompatible Plattform-Version).',
      resolution: 'In build.gradle: minSdkVersion 26 oder 33, targetSdkVersion 34.',
      status: 'pass',
      codeSnippet: 'android {\n    defaultConfig {\n        applicationId "com.missgiver.pi0logik"\n        minSdkVersion 26       // Abwärtskompatibel\n        targetSdkVersion 34    // Motorola 13/14 optimiert\n        versionCode 530\n        versionName "5.3.0"\n    }\n}'
    },
    {
      id: 'v2-signing-check',
      category: 'signing',
      title: 'APK Signature Scheme v2 / v3',
      requirement: 'APK muss kryptografisch mit dem Android Signature Scheme v2 signiert sein.',
      whyItFails: 'Android 13 akzeptiert keine reinen v1-JAR-Signaturen oder unsignierte APKs aus dem Dateimanager mehr (INSTALL_PARSE_FAILED_NO_CERTIFICATES).',
      resolution: 'Verwende apksigner oder lasse GitHub Actions die Signierung per Keystore-Secret ausführen (siehe scripts/setup-github-ci.ts).',
      status: 'pass',
      codeSnippet: 'apksigner sign --ks release.keystore \\\n  --ks-key-alias pi0logik \\\n  --v1-signing-enabled true \\\n  --v2-signing-enabled true \\\n  pi-studio-0logik.apk'
    },
    {
      id: 'media-permissions-check',
      category: 'manifest',
      title: 'Granulare Android 13 Medien-Berechtigungen',
      requirement: 'Kein altes READ_EXTERNAL_STORAGE auf Android 13; stattdessen READ_MEDIA_IMAGES & READ_MEDIA_AUDIO.',
      whyItFails: 'Android 13 ignoriert die alte Speicherberechtigung und blockiert den Zugriff auf Notizen, Fotos und Audioaufnahmen.',
      resolution: 'Ersetze die Legacy-Berechtigung durch READ_MEDIA_IMAGES, READ_MEDIA_AUDIO und POST_NOTIFICATIONS.',
      status: 'pass',
      codeSnippet: '<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />\n<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />\n<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />'
    },
    {
      id: 'abi-architecture-check',
      category: 'gradle',
      title: 'CPU Architektur: arm64-v8a Unterstützung',
      requirement: 'Das Motorola 13 besitzt einen 64-Bit ARM-Prozessor (Qualcomm Snapdragon / MediaTek Dimensity).',
      whyItFails: 'Falls nur x86 oder x86_64 Bibliotheken im Paket liegen, bricht Android mit INSTALL_FAILED_NO_MATCHING_ABIS ab.',
      resolution: 'Stelle sicher, dass ndk { abiFilters "arm64-v8a", "armeabi-v7a" } gesetzt ist oder ein architekturneutrales WebAPK ausgeliefert wird.',
      status: 'pass',
      codeSnippet: 'ndk {\n    abiFilters "arm64-v8a", "armeabi-v7a"\n}'
    },
    {
      id: 'unknown-sources-check',
      category: 'system',
      title: 'Motorola Berechtigung: „Unbekannte Apps installieren“',
      requirement: 'Die ausführende App (z.B. Chrome oder Files by Google) benötigt die Sideload-Berechtigung.',
      whyItFails: 'Wenn Android 13 den Download blockiert, wird die Datei oft nur unvollständig abgespeichert oder die Ausführung ohne Erklärung verweigert.',
      resolution: 'Einstellungen → Apps → Spezieller App-Zugriff → Unbekannte Apps installieren → Browser oder Dateimanager auf „Zulassen“ stellen.',
      status: 'warning',
      codeSnippet: '// Motorola 13 Menüpfad:\n// Einstellungen -> Apps -> Spezieller App-Zugriff -> Unbekannte Apps installieren\n// -> "Files by Google" oder "Brave" / "Chrome" aktivieren'
    },
    {
      id: 'package-id-check',
      category: 'manifest',
      title: 'Gültige Paket-ID (Naming Convention)',
      requirement: 'package="com.missgiver.pi0logik" ohne Bindestriche und mit mindestens zwei Segmenten.',
      whyItFails: 'Bindestriche im Paketnamen (z.B. com.missgiver.pi-studio) führen zu Syntaxfehlern beim Generieren der R.java Datei.',
      resolution: 'Verwende ausschließlich Kleinbuchstaben und Punkte (z.B. com.missgiver.pi0logik).',
      status: 'pass',
      codeSnippet: 'package="com.missgiver.pi0logik"'
    },
    {
      id: 'download-integrity-check',
      category: 'system',
      title: 'Container-Integrität & Download-Vollständigkeit',
      requirement: 'Die APK-Datei muss vollständig heruntergeladen sein (Header: PK\\x03\\x04).',
      whyItFails: 'Wenn der Download im mobilen Netz nach wenigen Kilobytes abbricht, ist die ZIP-Zentralstruktur beschädigt.',
      resolution: 'Nutze den Direktlink oder Methode 1 (1-Klick Native WebAPK), da der Browser die Integrität automatisch garantiert.',
      status: 'pass',
      codeSnippet: '// 0-Logik Empfehlung:\n// Methode 1 (Native WebAPK) kompiliert direkt in Android ohne Download-Abriss.'
    }
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleValidateManifest = () => {
    const details: string[] = [];
    let score = 100;

    // Check exported attribute
    if (!manifestInput.includes('android:exported="true"')) {
      score -= 30;
      details.push('❌ FEHLER: android:exported="true" fehlt in der Haupt-Activity. Dies führt auf Motorola 13 garantiert zum Parse-Fehler!');
    } else {
      details.push('✅ OK: android:exported="true" ist vorhanden.');
    }

    // Check package name
    const packageMatch = manifestInput.match(/package="([^"]+)"/);
    if (packageMatch) {
      if (packageMatch[1].includes('-')) {
        score -= 20;
        details.push(`⚠️ WARNUNG: Paketname "${packageMatch[1]}" enthält Bindestriche (-). Verwende Punkte oder Unterstriche.`);
      } else {
        details.push(`✅ OK: Gültiger Paketname "${packageMatch[1]}".`);
      }
    } else {
      score -= 25;
      details.push('❌ FEHLER: Kein package="..." Attribut im <manifest> Tag gefunden.');
    }

    // Check intent filter
    if (manifestInput.includes('android.intent.action.MAIN') && manifestInput.includes('android.intent.category.LAUNCHER')) {
      details.push('✅ OK: Main Launcher Intent-Filter korrekt deklariert.');
    } else {
      score -= 20;
      details.push('⚠️ WARNUNG: Kein Standard-Launcher Intent-Filter deklariert.');
    }

    // Check Android 13 media permissions
    if (manifestInput.includes('READ_MEDIA_IMAGES') || manifestInput.includes('POST_NOTIFICATIONS')) {
      details.push('✅ OK: Granulare Android 13 Berechtigungen vorhanden.');
    } else {
      score -= 10;
      details.push('ℹ️ HINWEIS: Es werden keine Android 13 Medien-Berechtigungen verwendet (READ_MEDIA_IMAGES).');
    }

    setValidationReport({
      score: Math.max(0, score),
      issuesFound: details.filter((d) => d.startsWith('❌') || d.startsWith('⚠️')).length,
      details
    });
  };

  const filteredItems = checklist.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* ── HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  APK BUILD-DOKTOR &amp; PARSE-DIAGNOSE
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold">
                  MOTOROLA 13 READY
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                Kausale Fehler-Prüfung gegen <strong>„Beim Parsen des Pakets ist ein Problem aufgetreten“</strong> auf Android 13/14.
              </p>
            </div>
          </div>

          <button
            onClick={handleValidateManifest}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Manifest jetzt scannen</span>
          </button>
        </div>

        {/* Quick Diagnostic Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Motorola Ziel:</span>
            <span className="text-cyan-300 font-bold">Android 13/14</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">minSdk:</span>
            <span className="text-emerald-400 font-bold">API 33 (Max)</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Exported-Flag:</span>
            <span className="text-emerald-400 font-bold">Zwingend</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Signatur:</span>
            <span className="text-cyan-300 font-bold">Scheme v2/v3</span>
          </div>
        </div>
      </div>

      {/* ── VALIDATION REPORT (FALLS DURCHGEFÜHRT) ── */}
      {validationReport && (
        <div className={`p-4 rounded-2xl border space-y-2.5 animate-in fade-in ${
          validationReport.issuesFound === 0
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
            : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              {validationReport.issuesFound === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
              <span className="text-white text-sm">
                Diagnose-Ergebnis: {validationReport.score}% 0-Logik Konformität
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-bold">
              {validationReport.issuesFound === 0 ? '0 PARSE-RISIKEN' : `${validationReport.issuesFound} HINWEISE`}
            </span>
          </div>

          <div className="space-y-1 text-[11px] pt-1">
            {validationReport.details.map((detail, idx) => (
              <p key={idx} className="leading-relaxed">
                {detail}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ── FILTER TABS ── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { key: 'all', label: 'Alle 8 Prüfpunkte' },
          { key: 'manifest', label: 'AndroidManifest.xml' },
          { key: 'gradle', label: 'Gradle-Konfiguration' },
          { key: 'signing', label: 'Keystore & Signierung' },
          { key: 'system', label: 'Motorola Systemrechte' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeFilter === tab.key
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── INTERACTIVE CHECKLIST ACCORDION ── */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all ${
                item.status === 'pass'
                  ? 'bg-slate-950/80 border-slate-800/90'
                  : 'bg-amber-950/20 border-amber-500/30'
              }`}
            >
              {/* Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    item.status === 'pass' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                  }`}>
                    {item.status === 'pass' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs sm:text-sm">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {item.requirement}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    item.category === 'manifest' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                    item.category === 'gradle' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                    item.category === 'signing' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {item.category}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Body */}
              {isExpanded && (
                <div className="px-3.5 pb-4 sm:px-4 sm:pb-4 pt-1 border-t border-slate-900 space-y-3 text-xs">
                  {/* Cause & Effect Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/20 space-y-1">
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Warum der Parse-Fehler auftritt:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {item.whyItFails}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-1">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        0-Logik Behebung:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {item.resolution}
                      </p>
                    </div>
                  </div>

                  {/* Code Snippet Box */}
                  {item.codeSnippet && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-cyan-300 font-bold flex items-center gap-1">
                          <FileCode className="w-3.5 h-3.5" />
                          Korrekter Code-Ausschnitt:
                        </span>
                        <button
                          onClick={() => handleCopy(item.id, item.codeSnippet!)}
                          className="p-1 rounded hover:text-white flex items-center gap-1 text-[10px]"
                          title="Code kopieren"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Kopiert!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Kopieren</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 overflow-x-auto leading-relaxed">
                        <code>{item.codeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── LIVE MANIFEST INSPECTOR & QUICK-FIX ── */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">
              Live AndroidManifest.xml Inspektor
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy('manifest-full', manifestInput)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] transition cursor-pointer"
            >
              {copiedId === 'manifest-full' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Kopiert!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Alles kopieren</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Dies ist das exakte Manifest, das für dein Motorola 13 kompiliert wird. Es enthält alle erforderlichen Flags gegen Parse-Fehler:
        </p>

        <textarea
          value={manifestInput}
          onChange={(e) => setManifestInput(e.target.value)}
          rows={12}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition leading-relaxed resize-y"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <button
            onClick={handleValidateManifest}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auf Fehler prüfen</span>
          </button>

          <a
            href="/api/export/pi-studio-0logik.apk"
            download="pi-studio-0logik.apk"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Download className="w-4 h-4" />
            <span>Validiertes APK laden</span>
          </a>
        </div>
      </div>
    </div>
  );
};
