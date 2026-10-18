import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  FileCode2,
  Terminal,
  Copy,
  Check,
  Play,
  RotateCw,
  Upload,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Bug,
  Sparkles,
  Zap
} from 'lucide-react';

interface DiagnosticResult {
  fileName: string;
  lineNumber: number;
  endLineNumber?: number;
  columnNumber?: number;
  errorType: string;
  errorMessage: string;
  summary: string;
  causalAnalysis?: {
    was: string;
    weshalb: string;
    warum: string;
    wieso: string;
  };
  failingCodeSnippet: string;
  correctReplacementBlock: string;
  targetInstruction: string;
  localContext?: {
    exists: boolean;
    totalLines: number;
    startLine: number;
    endLine: number;
    snippetLines: Array<{ lineNumber: number; isTarget: boolean; code: string }>;
    exactLineContent: string;
  } | null;
}

export const PIBuildDoctorAgent: React.FC = () => {
  const [logInput, setLogInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRunningLiveBuild, setIsRunningLiveBuild] = useState(false);
  const [liveBuildLogs, setLiveBuildLogs] = useState<string | null>(null);
  const [liveBuildStatus, setLiveBuildStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [fixAppliedMessage, setFixAppliedMessage] = useState<string | null>(null);

  // Preset example errors to test the agent immediately
  const sampleErrors = [
    {
      title: 'TypeScript Typfehler (TS2322)',
      type: 'TypeScript',
      log: `src/components/PIBuildAPKStudio.tsx(142,9): error TS2322: Type 'string' is not assignable to type 'number'.
  140 |     "backgroundColor": "#020617",
  141 |     "allowMixedContent": true
> 142 |     "versionCode": "1"
      |     ^^^^^^^^^^^
  143 |   }`,
    },
    {
      title: 'Vite / Rollup Unresolved Module',
      type: 'Vite',
      log: `[vite] Internal server error: Failed to resolve import "../components/MissingHelper" from "src/App.tsx:28:1". Does the file exist?
  26 | import { PWAInstallButton } from './components/PWAInstallButton';
  27 | import { OfflineIndicator } from './components/OfflineIndicator';
> 28 | import { MissingHelper } from '../components/MissingHelper';
     |          ^^^^^^^^^^^^^
  29 | import { PIBuildAPKStudio } from './components/PIBuildAPKStudio';`,
    },
    {
      title: 'SyntaxError (Unerwartetes Token)',
      type: 'Syntax',
      log: `SyntaxError: Unexpected token, expected "}" at server.ts:1898:1
  1896 |   res.json({ success: true, entry });
> 1897 | 
       | ^
  1898 | async function startServer() {`,
    },
    {
      title: 'Android Gradle AAPT2 Resource Error',
      type: 'Gradle',
      log: `Execution failed for task ':app:processDebugResources'.
> /app/src/main/AndroidManifest.xml:24: AAPT: error: resource android:attr/missingAttribute not found.
Check the AndroidManifest.xml line 24 for invalid SDK attribute declarations.`,
    },
  ];

  // 1. Live Projekt-Build testen
  const handleRunLiveBuild = async () => {
    setIsRunningLiveBuild(true);
    setLiveBuildLogs(null);
    setLiveBuildStatus('IDLE');
    setFixAppliedMessage(null);

    try {
      const res = await fetch('/api/agent/run-build-check', { method: 'POST' });
      const data = await res.json();

      setLiveBuildLogs(data.combinedLog || data.stdout || data.stderr || 'Build beendet.');

      if (data.success && data.status === 'CLEAN_0_LOGIK') {
        setLiveBuildStatus('SUCCESS');
        setDiagnostic(null);
      } else {
        setLiveBuildStatus('FAILED');
        if (data.diagnostic) {
          setDiagnostic(data.diagnostic);
        }
      }
    } catch (err: any) {
      setLiveBuildStatus('FAILED');
      setLiveBuildLogs('Fehler bei der Build-Verbindung: ' + err.message);
    } finally {
      setIsRunningLiveBuild(false);
    }
  };

  // 2. Log-Text analysieren
  const handleAnalyzeLog = async (textToAnalyze?: string) => {
    const raw = (textToAnalyze || logInput).trim();
    if (!raw) return;

    setIsAnalyzing(true);
    setFixAppliedMessage(null);

    try {
      const res = await fetch('/api/agent/analyze-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logText: raw, context: '0-Logik PI Studio' }),
      });

      const data = await res.json();
      if (data.success && data.diagnostic) {
        setDiagnostic(data.diagnostic);
      }
    } catch (err: any) {
      console.error('Fehler bei der Log-Analyse:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 3. File Upload (.log, .txt, .err)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      setLogInput(content);
      handleAnalyzeLog(content);
    };
    reader.readAsText(file);
  };

  // 4. Code kopieren
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // 5. 1-Klick Auto-Reparatur auf Datei anwenden
  const handleApplyFix = async () => {
    if (!diagnostic) return;
    setIsApplyingFix(true);
    setFixAppliedMessage(null);

    try {
      const res = await fetch('/api/agent/apply-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: diagnostic.fileName,
          lineNumber: diagnostic.lineNumber,
          endLineNumber: diagnostic.endLineNumber || diagnostic.lineNumber,
          correctCodeBlock: diagnostic.correctReplacementBlock,
          originalSnippet: diagnostic.failingCodeSnippet,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFixAppliedMessage(data.message || 'Fix erfolgreich angewendet! Starte Verifikations-Build...');
        // Starte sofort einen automatischen Re-Build, um den Fix zu verifizieren
        setTimeout(() => {
          handleRunLiveBuild();
        }, 1200);
      } else {
        setFixAppliedMessage('Fehler: ' + (data.error || 'Fix konnte nicht angewendet werden.'));
      }
    } catch (err: any) {
      setFixAppliedMessage('Netzwerkfehler: ' + err.message);
    } finally {
      setIsApplyingFix(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Agent Header ── */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-cyan-500/30 p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-md">
              <Bug className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-mono font-bold text-white tracking-wide">
                  0-LOGIK BUILD-DOKTOR &amp; FEHLER-AGENT
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Kausale Erkennung Aktiv
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">
                  gemini-3.8-flash + Regex Kortex
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-1 leading-relaxed">
                Erkennt den exakten Build-Fail, pinpointet die <strong>Datei</strong> und <strong>Zeilennummer</strong>, analysiert den kausalen Grund und gibt den <strong>korrekten Ersatz-Code-Block</strong> mit Einbau-Position aus.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunLiveBuild}
              disabled={isRunningLiveBuild}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-mono text-xs font-bold transition shadow-lg shadow-cyan-900/30 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isRunningLiveBuild ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Kompiliere Live...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Live Build-Test ausführen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Live Build Status Banner (if run) ── */}
      {liveBuildStatus === 'SUCCESS' && (
        <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/50 p-4 text-emerald-200 font-mono text-xs shadow-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-sm text-white">✓ 0-FEHLER STATUS: LIVE BUILD KOMPILIERT ERFOLGREICH!</div>
            <p className="text-emerald-300/90 mt-1">
              Das Projekt wurde mit Vite / TypeScript vollständig fehlerfrei gebaut. Keine Abbrüche, keine verletzten Tokens. 0+ Stabilität gewahrt.
            </p>
            {liveBuildLogs && (
              <details className="mt-2 text-[11px] text-slate-400">
                <summary className="cursor-pointer hover:text-emerald-300 font-semibold">Terminal-Ausgabe einsehen</summary>
                <pre className="mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-[10px] overflow-x-auto text-slate-300 max-h-40">
                  {liveBuildLogs}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}

      {liveBuildStatus === 'FAILED' && (
        <div className="rounded-2xl bg-red-950/40 border border-red-500/50 p-4 text-red-200 font-mono text-xs shadow-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1">
            <div className="font-bold text-sm text-white">BUILD-ABBRUCH ERKANNT (FEHLER AKTIV)</div>
            <p className="text-red-300/90 mt-1">
              Der Build-Prozess brach ab. Der 0-Logik Agent hat die Ausgabe abgefangen und unten die genaue Datei, Zeile und Korrektur bereitgestellt.
            </p>
          </div>
        </div>
      )}

      {/* ── Input Section: Log einfügen oder Datei hochladen ── */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Build-Log, Fehlermeldung oder StackTrace eingeben
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono cursor-pointer transition border border-slate-700">
              <Upload className="w-3.5 h-3.5" />
              <span>Log-Datei laden</span>
              <input
                type="file"
                accept=".log,.txt,.err,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {logInput && (
              <button
                onClick={() => setLogInput('')}
                className="text-[11px] text-slate-500 hover:text-slate-300 font-mono px-2 py-1"
              >
                Leeren
              </button>
            )}
          </div>
        </div>

        {/* Quick Sample Errors */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-slate-400">Schnell-Test mit typischen Fehlern:</span>
          <div className="flex flex-wrap gap-1.5">
            {sampleErrors.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setLogInput(sample.log);
                  handleAnalyzeLog(sample.log);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-600/50 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition cursor-pointer"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={logInput}
            onChange={(e) => setLogInput(e.target.value)}
            placeholder="Füge hier deinen Compiler-Fehler, npm/vite build Fehler, Gradle Trace oder StackTrace ein..."
            rows={5}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition resize-y"
          />
        </div>

        {/* Trigger Analysis Button */}
        <div className="flex justify-end">
          <button
            onClick={() => handleAnalyzeLog()}
            disabled={isAnalyzing || !logInput.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-bold transition cursor-pointer disabled:opacity-40 active:scale-95 shadow-md"
          >
            {isAnalyzing ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>0-Logik Agent analysiert Fehler...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Fehler kausal analysieren &amp; Code generieren</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Fix Feedback Alert ── */}
      {fixAppliedMessage && (
        <div className="rounded-xl bg-cyan-950/90 border border-cyan-400 p-3.5 text-cyan-200 font-mono text-xs flex items-center justify-between gap-3 shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{fixAppliedMessage}</span>
          </div>
        </div>
      )}

      {/* ── Diagnostic Result Card ── */}
      {diagnostic && (
        <div className="rounded-2xl bg-slate-900 border border-cyan-500/40 p-6 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Top Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-lg bg-red-950 text-red-300 border border-red-700 font-mono text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>FAIL ERKANNT</span>
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-950 text-cyan-300 border border-slate-800 font-mono text-xs font-bold flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Datei: {diagnostic.fileName}</span>
              </span>
              <span className="px-3 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 font-mono text-xs font-bold">
                Zeile: {diagnostic.lineNumber} {diagnostic.endLineNumber && diagnostic.endLineNumber !== diagnostic.lineNumber ? `bis ${diagnostic.endLineNumber}` : ''}
              </span>
              {diagnostic.columnNumber && diagnostic.columnNumber > 1 && (
                <span className="px-2 py-1 rounded-lg bg-slate-950 text-slate-400 border border-slate-800 font-mono text-xs">
                  Spalte: {diagnostic.columnNumber}
                </span>
              )}
            </div>

            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
              Typ: {diagnostic.errorType}
            </span>
          </div>

          {/* Glasklare Einbau-Anweisung Banner */}
          <div className="rounded-xl bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-slate-950 border border-cyan-500/60 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-900/60 border border-cyan-400 text-cyan-300 shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Glasklare Einbau-Anweisung für Patricia / PI Studio:
                </h4>
                <p className="text-xs font-mono text-cyan-200 leading-relaxed font-semibold">
                  {diagnostic.targetInstruction}
                </p>
                <div className="text-[11px] font-mono text-slate-300 mt-2 flex flex-wrap gap-4 pt-1 border-t border-cyan-800/40">
                  <span>
                    📁 <strong>Ziel-Datei:</strong> <code className="text-cyan-300">{diagnostic.fileName}</code>
                  </span>
                  <span>
                    📍 <strong>Ziel-Zeile:</strong> <code className="text-amber-300">Zeile {diagnostic.lineNumber}</code>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Säulen Kausalanalyse (0-Logik) */}
          {diagnostic.causalAnalysis && (
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Kausale 0-Logik Ursachenanalyse (Was · Weshalb · Warum · Wieso)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">1. WAS IST PASSIERT:</span>
                  <p className="text-slate-300">{diagnostic.causalAnalysis.was}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">2. WESHALB AN DIESEM PUNKT:</span>
                  <p className="text-slate-300">{diagnostic.causalAnalysis.weshalb}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">3. WARUM BRICHT DER BUILD AB:</span>
                  <p className="text-slate-300">{diagnostic.causalAnalysis.warum}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">4. WIESO LÖST DIESER FIX DAS PROBLEM:</span>
                  <p className="text-slate-300">{diagnostic.causalAnalysis.wieso}</p>
                </div>
              </div>
            </div>
          )}

          {/* Code Diff / Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vorher: Fehlerhafter Code */}
            <div className="rounded-xl bg-slate-950 border border-red-900/60 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-red-400">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Fehlerhafter Code (Zeile {diagnostic.lineNumber})
                </span>
                <span className="text-[10px] text-slate-500">Vorher</span>
              </div>
              <pre className="p-3 rounded-lg bg-red-950/20 border border-red-900/40 text-xs font-mono text-red-200 overflow-x-auto whitespace-pre-wrap">
                {diagnostic.failingCodeSnippet || '// Keine Vorher-Zeile identifiziert'}
              </pre>
            </div>

            {/* Nachher: Korrekter Code-Block */}
            <div className="rounded-xl bg-slate-950 border border-emerald-900/60 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  KORREKTER ERSATZ-CODE (0-Logik)
                </span>
                <span className="text-[10px] text-emerald-500">Nachher</span>
              </div>
              <pre className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs font-mono text-emerald-200 overflow-x-auto whitespace-pre-wrap">
                {diagnostic.correctReplacementBlock}
              </pre>
            </div>
          </div>

          {/* Lokaler Datei-Kontext aus dem Projekt (falls vorhanden) */}
          {diagnostic.localContext && diagnostic.localContext.snippetLines && (
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="font-bold">Dateikontext aus dem Projekt ({diagnostic.fileName})</span>
                <span className="text-[10px]">Zeilen {diagnostic.localContext.startLine} bis {diagnostic.localContext.endLine}</span>
              </div>
              <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2.5 text-xs font-mono overflow-x-auto">
                {diagnostic.localContext.snippetLines.map((line) => (
                  <div
                    key={line.lineNumber}
                    className={`flex items-start gap-3 py-0.5 px-1.5 rounded ${
                      line.isTarget
                        ? 'bg-red-950/60 text-red-300 font-bold border-l-2 border-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="w-10 text-right text-slate-600 select-none shrink-0">
                      {line.lineNumber}:
                    </span>
                    <span className="whitespace-pre">{line.code}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons: Kopieren & 1-Klick Reparatur */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <button
              onClick={() => handleCopyCode(diagnostic.correctReplacementBlock)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition border border-slate-700 cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Code-Block kopiert!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Code-Block kopieren</span>
                </>
              )}
            </button>

            <button
              onClick={handleApplyFix}
              disabled={isApplyingFix}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-slate-950 font-mono text-xs font-bold transition shadow-lg cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isApplyingFix ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Wende Reparatur an...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>1-Klick Reparatur anwenden &amp; verifizieren</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
