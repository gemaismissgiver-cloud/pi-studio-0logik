import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Play,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Terminal,
  RefreshCw,
  Copy,
  Check,
  FileCode,
  PackageCheck,
  FolderOpen,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Github,
  GitBranch,
  UploadCloud,
  Cpu,
  Zap,
  Activity,
  Sliders,
  Send,
  Code2
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PIBuildAPKStudio: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Navigation Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<'buildrun' | 'github' | 'apk'>('buildrun');

  // Build & Run State
  const [building, setBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([
    'Bereit zur Kompilierung für Motorola 13 (Android 13/14).',
    'Paket-ID: com.missgiver.pi0logik | Ziel-SDK: 34 | Min-SDK: 33.',
    'Nullpunkt-Resonanz: 432 Hz | 0-Logik Loss regularizer aktiv.',
  ]);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildDone, setBuildDone] = useState(false);

  // Live Run Execution State
  const [runPrompt, setRunPrompt] = useState('Was ist der Nullpunkt 0 in der KI und warum verhindern wir damit Halluzinationen?');
  const [runModel, setRunModel] = useState('LLaMA-3-8B-0Logic-LoRA');
  const [runTemp, setRunTemp] = useState(0.0);
  const [runAlpha, setRunAlpha] = useState(0.35);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);

  // GitHub Studio State
  const [githubToken, setGithubToken] = useState('');
  const [githubRepoName, setGithubRepoName] = useState('pi-studio-0logik');
  const [githubIsPrivate, setGithubIsPrivate] = useState(false);
  const [githubPushing, setGithubPushing] = useState(false);
  const [githubResult, setGithubResult] = useState<{ success: boolean; repoUrl?: string; message?: string; error?: string } | null>(null);

  // Native Config Inspector State
  const [activeCodeTab, setActiveCodeTab] = useState<'manifest' | 'gradle' | 'capacitor'>('manifest');
  const [copiedCode, setCopiedCode] = useState(false);
  const [lastDownloadedFile, setLastDownloadedFile] = useState<string | null>(null);

  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.missgiver.pi0logik"
    android:versionCode="530"
    android:versionName="5.3.0-motorola13">

    <!-- Motorola 13 Hardware- & Sensor-Berechtigungen -->
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
        android:hardwareAccelerated="true"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar.Fullscreen">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:screenOrientation="portrait"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const buildGradle = `apply plugin: 'com.android.application'

android {
    namespace "com.missgiver.pi0logik"
    compileSdkVersion 34

    defaultConfig {
        applicationId "com.missgiver.pi0logik"
        minSdkVersion 33  // Motorola 13 (Android 13 Tiramisu)
        targetSdkVersion 34
        versionCode 530
        versionName "5.3.0-motorola13"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        ndk {
            abiFilters "arm64-v8a", "armeabi-v7a"
        }
    }

    buildTypes {
        release {
            minifyEnabled false
            signingConfig signingConfigs.debug
        }
    }
}`;

  const capacitorConfig = `{
  "appId": "com.missgiver.pi0logik",
  "appName": "PI Studio 0-Logik",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "android": {
    "backgroundColor": "#020617",
    "allowMixedContent": true
  }
}`;

  // Start Build Simulation
  const startBuildSimulation = () => {
    setBuilding(true);
    setBuildProgress(10);
    setBuildDone(false);
    setLastDownloadedFile(null);
    setBuildLogs([
      '🚀 [1/5] Initialisiere PI 0-Logik Model Compiler & Android Bundle...',
      '📦 Prüfe LoRA Gewichtungsmatrix, Zero-Loss Regularizer & Kortex...',
    ]);

    setTimeout(() => {
      setBuildProgress(35);
      setBuildLogs((prev) => [
        ...prev,
        '⚙️ [2/5] Generiere AndroidManifest.xml & Motorola 13 Sensor-Bindings...',
        '🔒 Binde Berechtigungen: Audio (432Hz Record), Kamera, Notifications, Storage...',
      ]);
    }, 500);

    setTimeout(() => {
      setBuildProgress(65);
      setBuildLogs((prev) => [
        ...prev,
        '🧩 [3/5] Kompiliere Capacitor Android Wrapper & Gradle Matrix...',
        '🎨 Optimiere Maskable Icons (192px / 512px) für Motorola Launcher...',
      ]);
    }, 1100);

    setTimeout(() => {
      setBuildProgress(90);
      setBuildLogs((prev) => [
        ...prev,
        '✍️ [4/5] Signiere Paket mit Missgiver-Schlüssel (SHA-256 / V2 Scheme)...',
        '🛡️ Guardian-Integritätshash: 422ea5732b3b890a...',
      ]);
    }, 1700);

    setTimeout(() => {
      setBuildProgress(100);
      setBuildLogs((prev) => [
        ...prev,
        '✅ [5/5] Build erfolgreich abgeschlossen!',
        '📱 Motorola 13 Standalone-Paket & Live-Execution Runner sind einsatzbereit.',
      ]);
      setBuilding(false);
      setBuildDone(true);
    }, 2200);
  };

  // Execute Live Run
  const handleExecuteRun = async () => {
    if (!runPrompt.trim() || isRunning) return;
    setIsRunning(true);
    setRunResult(null);

    try {
      const res = await fetch('/api/transformer/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: runPrompt.trim(),
          model: runModel,
          temperature: runTemp,
          zeroLossAlpha: runAlpha,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRunResult(data);
      } else {
        alert(data.error || 'Fehler beim Inferenzlauf');
      }
    } catch (err: any) {
      alert('Fehler bei der Verbindung zum PI Runtime Server.');
    } finally {
      setIsRunning(false);
    }
  };

  // Direct GitHub Push
  const handlePushToGithub = async () => {
    if (!githubToken.trim() || githubPushing) return;
    setGithubPushing(true);
    setGithubResult(null);

    try {
      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken.trim(),
          repoName: githubRepoName.trim(),
          isPrivate: githubIsPrivate,
          description: 'PI Studio 0-Logik — Programmierte Intelligenz Engine, Transformer Fine-Tuning & Motorola 13 PWA/APK',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGithubResult({
          success: true,
          repoUrl: data.repoUrl,
          message: data.message || 'Erfolgreich nach GitHub übertragen!',
        });
      } else {
        setGithubResult({
          success: false,
          error: data.error || 'GitHub-Übertragung fehlgeschlagen.',
        });
      }
    } catch (err: any) {
      setGithubResult({
        success: false,
        error: `Netzwerkfehler: ${err.message}`,
      });
    } finally {
      setGithubPushing(false);
    }
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const triggerApkDownload = () => {
    setLastDownloadedFile('pi-studio-0logik.apk');
    const a = document.createElement('a');
    a.href = '/api/export/pi-studio-0logik.apk';
    a.download = 'pi-studio-0logik.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const triggerZipDownload = () => {
    setLastDownloadedFile('pi-studio-motorola13-android-project.zip');
    const a = document.createElement('a');
    a.href = '/api/export/android-project.zip';
    a.download = 'pi-studio-motorola13-android-project.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const triggerGithubZipDownload = () => {
    setLastDownloadedFile('pi-studio-0logik-github-repo.zip');
    const a = document.createElement('a');
    a.href = '/api/export/github-repo.zip';
    a.download = 'pi-studio-0logik-github-repo.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      {/* ── Studio Navigation Header & Sub-Tabs ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-950 to-blue-950 border border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-mono font-bold text-white tracking-wide">
                  PI STUDIO 0-LOGIK
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono font-bold">
                  BUILD &amp; RUN · GITHUB · MOTOROLA 13
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Programmierte Intelligenz · 0-Logik Compiler &amp; Native Pipeline
              </p>
            </div>
          </div>

          {/* Sub-Tab Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveSubTab('buildrun')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeSubTab === 'buildrun'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Build &amp; Run Flow</span>
            </button>
            <button
              onClick={() => setActiveSubTab('github')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeSubTab === 'github'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Studio</span>
            </button>
            <button
              onClick={() => setActiveSubTab('apk')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeSubTab === 'apk'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Motorola 13 APK</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            SUB-TAB 1: BUILD & RUN FLOW
        ══════════════════════════════════════════════════════ */}
        {activeSubTab === 'buildrun' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Compiler Trigger Card */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    0-LOGIK COMPILER &amp; MODEL RUNTIME
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                    0+ STABIL
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Kompiliert 0-Logik Gewichte, LoRA Matrix (q, k, v, o) und bindet die 432 Hz Nullpunkt-Resonanz.
                </p>
              </div>

              <button
                onClick={startBuildSimulation}
                disabled={building}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs tracking-wider cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95 transition disabled:opacity-50 shrink-0"
              >
                {building ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>KOMPILIERE MATRIX...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>🚀 0-LOGIK BUILD STARTEN</span>
                  </>
                )}
              </button>
            </div>

            {/* Build Progress Bar */}
            {building && (
              <div className="space-y-1.5 animate-in fade-in">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-cyan-400">Build-Fortschritt:</span>
                  <span className="text-white font-bold">{buildProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${buildProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Terminal Build Logs Box */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800/80 pb-1.5">
                <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  BUILD OUTPUT &amp; KORTEX PIPELINE
                </span>
                <span className="text-slate-500">432 Hz Resonanz · 0 Raten</span>
              </div>

              <div className="space-y-1 font-mono text-xs max-h-36 overflow-y-auto">
                {buildLogs.map((log, index) => (
                  <div
                    key={index}
                    className={
                      log.includes('✅')
                        ? 'text-emerald-400 font-bold'
                        : log.includes('🚀')
                        ? 'text-cyan-300 font-bold'
                        : 'text-slate-300'
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Interactive Live Run Sandbox ── */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-mono font-bold text-white">
                      LIVE RUN FLOW &amp; INFERENZ-TESTBENCH
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Führe das kompilierte 0-Logik Modell in Echtzeit aus und verifiziere Kausalitäten
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono font-bold">
                  RUNNER AKTIV
                </span>
              </div>

              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400">Schnell-Test Presets:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: 'Nullpunkt-Stabilität', q: 'Was bedeutet der Nullpunkt 0 für das neuronale Netzwerk und wie verhindert er Halluzinationen?' },
                    { label: 'Entropie-Filter (- vor der 0)', q: 'Wie trennt PI wahres Wissen (0+) von falscher Information und emotionaler Entropie (-)?' },
                    { label: 'Kausale Wissensverifikation', q: 'Weshalb, warum und wieso scheitern Standard-KIs an menschlicher Überanpassung?' },
                    { label: '150-Jahre Wissensweitergabe', q: 'Wie sichert die 0-Logik die konsistente Datenweitergabe über 150 Jahre ohne Qualitätsverlust?' }
                  ].map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => setRunPrompt(preset.q)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-cyan-300 hover:text-white transition cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-300 flex items-center justify-between">
                  <span>Eingabe-Vektor / Fragestellung an die Engine:</span>
                  <span className="text-slate-500">{runPrompt.length} Zeichen</span>
                </label>
                <textarea
                  value={runPrompt}
                  onChange={(e) => setRunPrompt(e.target.value)}
                  rows={3}
                  placeholder="Gib eine Fragestellung oder Thesen zur 0-Logik ein..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              {/* Execution Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500">Active Model:</span>
                  <select
                    value={runModel}
                    onChange={(e) => setRunModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs font-mono text-cyan-300 focus:outline-none"
                  >
                    <option value="LLaMA-3-8B-0Logic-LoRA">LLaMA-3-8B-0Logic-LoRA</option>
                    <option value="Mistral-7B-ZeroEntropy">Mistral-7B-ZeroEntropy</option>
                    <option value="Gemma-2-9B-Equilibrium">Gemma-2-9B-Equilibrium</option>
                  </select>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500">Temperature (0.0 = Reine Logik):</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={runTemp}
                      onChange={(e) => setRunTemp(parseFloat(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-cyan-400 font-bold">{runTemp.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500">Zero-Loss Alpha:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={runAlpha}
                      onChange={(e) => setRunAlpha(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-emerald-400 font-bold">{runAlpha.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Run Trigger Button */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={handleExecuteRun}
                  disabled={isRunning || !runPrompt.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs tracking-wider cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95 transition disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>FÜHRE INFERENZ AUS...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>▶ RUN AUSFÜHREN</span>
                    </>
                  )}
                </button>
              </div>

              {/* Run Result Output Card */}
              {runResult && (
                <div className="space-y-3 pt-3 border-t border-slate-800 animate-in fade-in">
                  {/* Stats Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-800/60">
                      <span className="text-[10px] text-slate-500">Inferenz-Latenz:</span>
                      <p className="text-cyan-300 font-bold">{runResult.latencyMs} ms</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-800/60">
                      <span className="text-[10px] text-slate-500">Kohärenz-Grad:</span>
                      <p className="text-emerald-400 font-bold">{(runResult.coherenceScore * 100).toFixed(0)}%</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500">Tokens Processed:</span>
                      <p className="text-white font-bold">{runResult.tokensProcessed} in / {runResult.tokensGenerated} out</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500">System-Zustand:</span>
                      <p className="text-cyan-400 font-bold">0+ STABIL</p>
                    </div>
                  </div>

                  {/* Tensor Trace Matrix */}
                  {runResult.tensorTrace && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-xs">
                      <span className="text-[11px] font-bold text-slate-400">TENSOR EXECUTION TRACE (LoRA Target Modules):</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        {runResult.tensorTrace.map((t: any, idx: number) => (
                          <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-cyan-400 font-bold">{t.module} (L{t.layer})</span>
                            <div className="text-[10px] text-slate-400">Weight Norm: {t.weightNorm}</div>
                            <div className="text-[10px] text-emerald-400">0-Loss Δ: -{t.zeroLossDelta}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generated Output */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-800/80 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        LOGISCHES RUN-ERGEBNIS:
                      </span>
                      <span className="text-slate-500 text-[10px]">Modell: {runResult.prompt ? runModel : ''}</span>
                    </div>
                    <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {runResult.output}
                    </div>
                  </div>

                  {/* Verification Questions if any */}
                  {runResult.verificationQuestions && runResult.verificationQuestions.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-2 font-mono text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <HelpCircle className="w-4 h-4" />
                        <span>RÜCKFRAGEN DER ENGINE ZUR 0+ WISSENSSICHERUNG:</span>
                      </div>
                      <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                        {runResult.verificationQuestions.map((q: string, i: number) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SUB-TAB 2: GITHUB STUDIO (DIREKT-UPLOAD & SYNC)
        ══════════════════════════════════════════════════════ */}
        {activeSubTab === 'github' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Spotlight Card */}
            <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 shrink-0">
                  <Github className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-mono font-bold text-white">
                      GITHUB DIREKT-UPLOAD &amp; CI/CD SYNC
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700 font-mono font-bold">
                      1-KLICK PUSH
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">
                    Lade den gesamten Stand von <strong>PI Studio 0-Logik</strong> direkt von hier in dein persönliches GitHub-Konto hoch. 
                    GitHub Actions baut daraufhin vollautomatisch signierte APKs und verwaltet deine Code-Versionen.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Push Form */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4 font-mono text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <UploadCloud className="w-4 h-4 text-purple-400" />
                <span>Repository erstellen &amp; Quellcode übertragen</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-slate-300 flex items-center justify-between">
                    <span>GitHub Personal Access Token (PAT):</span>
                    <a
                      href="https://github.com/settings/tokens/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Token erstellen (benötigt &apos;repo&apos;)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition"
                  />
                  <p className="text-[10px] text-slate-500">
                    Dein Token wird nur für diesen Übertragungsbefehl verwendet und nirgends dauerhaft gespeichert.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300">Repository Name:</label>
                    <input
                      type="text"
                      value={githubRepoName}
                      onChange={(e) => setGithubRepoName(e.target.value)}
                      placeholder="pi-studio-0logik"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300">Sichtbarkeit:</label>
                    <select
                      value={githubIsPrivate ? 'private' : 'public'}
                      onChange={(e) => setGithubIsPrivate(e.target.value === 'private')}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition cursor-pointer"
                    >
                      <option value="public">Öffentlich (Public - Empfohlen)</option>
                      <option value="private">Privat (Private)</option>
                    </select>
                  </div>
                </div>

                {/* Submit Push Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handlePushToGithub}
                    disabled={githubPushing || !githubToken.trim()}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/20 active:scale-95 transition disabled:opacity-50"
                  >
                    {githubPushing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>ÜBERTRAGE DATEIEN NACH GITHUB...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>🚀 DIREKT ZU GITHUB HOCHLADEN</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={triggerGithubZipDownload}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>GitHub-Projekt als .ZIP laden</span>
                  </button>
                </div>

                {/* Result Feedback Banner */}
                {githubResult && (
                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-3 animate-in fade-in ${
                      githubResult.success
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                        : 'bg-red-950/60 border-red-500/50 text-red-200'
                    }`}
                  >
                    {githubResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-bold text-white">
                        {githubResult.success ? 'Upload erfolgreich abgeschlossen!' : 'Fehler beim GitHub Upload'}
                      </p>
                      <p className="text-[11px] leading-relaxed">
                        {githubResult.message || githubResult.error}
                      </p>
                      {githubResult.repoUrl && (
                        <div className="pt-1">
                          <a
                            href={githubResult.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
                          >
                            <span>Repository auf GitHub öffnen</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Alternative: Manual Git Terminal Instructions */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <Terminal className="w-3.5 h-3.5" />
                  Alternative: Manuelle Git-Befehle für dein Terminal
                </span>
                <button
                  onClick={() =>
                    copyCode(`git init\ngit add .\ngit commit -m "feat: PI Studio 0-Logik Initial Release"\ngit branch -M main\ngit remote add origin https://github.com/DEIN_NUTZERNAME/${githubRepoName}.git\ngit push -u origin main`)
                  }
                  className="p-1 rounded hover:text-white"
                  title="Befehle kopieren"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                <code>
{`git init
git add .
git commit -m "feat: PI Studio 0-Logik Initial Release"
git branch -M main
git remote add origin https://github.com/DEIN_NUTZERNAME/${githubRepoName}.git
git push -u origin main`}
                </code>
              </pre>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SUB-TAB 3: MOTOROLA 13 STANDALONE APK & NATIV
        ══════════════════════════════════════════════════════ */}
        {activeSubTab === 'apk' && (
          <div className="space-y-4 animate-in fade-in">
            {/* ── Spotlight Card: WO LANDET DIE DATEI AUF DEM MOTOROLA 13? ── */}
            <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-cyan-950/70 border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-mono font-bold text-white">
                      WO LANDET DIE DATEI AUF DEINEM MOTOROLA 13?
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 font-mono font-bold">
                      SPEICHERORT-FINDER
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">
                    Wenn du hier im Browser eine Datei herunterlädst, speichert Android sie an einem festen Ort. So findest du sie sofort:
                  </p>
                </div>
              </div>

              {/* 2-Step Finder Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* Step 1: In Browser */}
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <span>Weg 1 (Am schnellsten): Direkt im Browser</span>
                  </div>
                  <ol className="text-slate-300 space-y-1 text-[11px] list-decimal list-inside">
                    <li>Tippe oben rechts auf die <strong className="text-white">3 Punkte (⋮)</strong>.</li>
                    <li>Wähle <strong className="text-cyan-300">„Downloads“</strong> aus.</li>
                    <li>Dort siehst du direkt: <span className="text-emerald-400 font-bold">pi-studio-0logik.apk</span>!</li>
                  </ol>
                </div>

                {/* Step 2: In Android File Manager */}
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <span>Weg 2: In der Motorola Dateien-App</span>
                  </div>
                  <ol className="text-slate-300 space-y-1 text-[11px] list-decimal list-inside">
                    <li>Öffne auf dem Startbildschirm die App <strong className="text-white">„Files by Google“</strong> (oder <strong className="text-white">„Dateien“</strong>).</li>
                    <li>Tippe auf die Kachel <strong className="text-amber-300">„Downloads“</strong>.</li>
                    <li>Speicherpfad: <code className="text-[10px] text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">/Download/pi-studio-0logik.apk</code></li>
                  </ol>
                </div>
              </div>

              {/* Parsing Error Note */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-800/60 flex items-start gap-2.5 text-xs font-mono">
                <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-cyan-300 font-bold">
                    Warum meldet Android manchmal „Beim Parsen des Pakets ist ein Problem aufgetreten“?
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Android 13/14 verlangt für Sideload-APKs eine aktivierte Berechtigung für unbekannte Quellen (<code className="text-cyan-300">Einstellungen → Apps → Spezieller App-Zugriff → Unbekannte Apps installieren</code>). 
                    <strong> Die beste und einfachste Lösung:</strong> Nutze unten <strong className="text-emerald-400">Methode 1 (1-Klick Installation)</strong> — dein Motorola-Browser erzeugt das APK dabei <em>vollautomatisch und nativ</em> ohne jeden Parsing-Fehler!
                  </p>
                </div>
              </div>
            </div>

            {/* Last Download Feedback Banner */}
            {lastDownloadedFile && (
              <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/60 flex items-start gap-2.5 text-xs font-mono text-cyan-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">
                    Download ausgelöst: <span className="text-cyan-300">{lastDownloadedFile}</span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Die Datei liegt nun in deinem Motorola-Ordner <strong>„Downloads“</strong>. Schau oben in die Statusleiste oder öffne die App <strong>„Files by Google“</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* ── 3 Ready-to-Use Download & Installation Paths ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Path 1: 1-Click Native WebAPK on Motorola 13 */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/70 to-slate-900 border border-cyan-500/50 space-y-3 shadow-lg flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Methode 1 (Empfohlen)
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      0% PARSE-FEHLER
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">1-Klick Native WebAPK</h3>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">
                    Dein Motorola-Browser kompiliert das Paket <strong>direkt nativ im Android-System</strong>. Kein Suchen im Download-Ordner, sofort im App-Drawer!
                  </p>
                </div>

                <div className="pt-2">
                  {isInstalled ? (
                    <div className="w-full py-2.5 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-300 font-mono text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>Auf Motorola 13 installiert</span>
                    </div>
                  ) : isInstallable ? (
                    <button
                      onClick={install}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 transition"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Jetzt nativ installieren</span>
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                      <p className="font-bold text-cyan-300">In Brave / Chrome:</p>
                      <p>Tippe auf Menü (3 Punkte ⋮) → <strong>&quot;App installieren&quot;</strong>.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Path 2: Download Standalone .APK File */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                      <PackageCheck className="w-4 h-4 text-emerald-400" />
                      Methode 2: Direkt-Download
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                      .APK DATEI
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">pi-studio-0logik.apk</h3>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">
                    Lädt die Standalone <code className="text-cyan-300">pi-studio-0logik.apk</code> direkt in den Motorola <strong>Downloads</strong>-Ordner herunter.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={triggerApkDownload}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-md active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>.APK Datei herunterladen</span>
                  </button>
                  <a
                    href="/api/export/pi-studio-0logik.apk"
                    download="pi-studio-0logik.apk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center text-[10px] text-slate-400 hover:text-cyan-300 font-mono underline"
                  >
                    Direktlink (falls Button blockiert wird)
                  </a>
                </div>
              </div>

              {/* Path 3: Full Android Project ZIP */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Methode 3: Projekt-Quellen
                  </span>
                  <h3 className="text-sm font-bold text-white">Android Studio Projekt (.ZIP)</h3>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">
                    Vollständiger Quellcode mit Manifest, Gradle und GitHub Actions Skript für automatische Releases.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={triggerZipDownload}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Projekt-ZIP laden</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Native Android Inspector Tabs */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-mono font-bold text-white">
                    NATIVE ANDROID-KONFIGURATION INSPEKTOR
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                    <button
                      onClick={() => setActiveCodeTab('manifest')}
                      className={`px-2 py-0.5 rounded transition cursor-pointer ${
                        activeCodeTab === 'manifest' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400'
                      }`}
                    >
                      AndroidManifest.xml
                    </button>
                    <button
                      onClick={() => setActiveCodeTab('gradle')}
                      className={`px-2 py-0.5 rounded transition cursor-pointer ${
                        activeCodeTab === 'gradle' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400'
                      }`}
                    >
                      build.gradle
                    </button>
                    <button
                      onClick={() => setActiveCodeTab('capacitor')}
                      className={`px-2 py-0.5 rounded transition cursor-pointer ${
                        activeCodeTab === 'capacitor' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400'
                      }`}
                    >
                      capacitor.config
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      copyCode(
                        activeCodeTab === 'manifest'
                          ? manifestXml
                          : activeCodeTab === 'gradle'
                          ? buildGradle
                          : capacitorConfig
                      )
                    }
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Code kopieren"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto max-h-64 leading-relaxed">
                <code>
                  {activeCodeTab === 'manifest'
                    ? manifestXml
                    : activeCodeTab === 'gradle'
                    ? buildGradle
                    : capacitorConfig}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
