import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Smartphone,
  Download,
  Play,
  RotateCcw,
  Code2,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Plus,
  Compass,
  Zap,
  Save,
  BookOpen
} from 'lucide-react';

export interface GeneratedApp {
  id: string;
  title: string;
  prompt: string;
  category: string;
  createdAt: string;
  version: string;
  htmlCode: string;
  icon: string;
}

export const PIAppStudioCreator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [appName, setAppName] = useState('');
  const [category, setCategory] = useState('Produktivität');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedApps, setGeneratedApps] = useState<GeneratedApp[]>([]);
  const [activeApp, setActiveApp] = useState<GeneratedApp | null>(null);
  const [activeView, setActiveView] = useState<'preview' | 'code' | 'library'>('preview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const presetPrompts = [
    {
      title: 'Schichtplaner',
      category: 'Produktivität',
      prompt: 'Ein interaktiver Dienst- und Schichtplaner für Motorola 13 mit Farbmarkierungen für Früh-, Spät- und Nachtschicht, Monatsübersicht und Notizenfunktion.'
    },
    {
      title: 'Haushaltsbuch',
      category: 'Finanzen',
      prompt: 'Ein privater Ausgaben- und Budget-Rechner mit Monatsübersicht, Kategorien (Einkauf, Miete, Freizeit) und visuellen Budget-Balken mit LocalStorage-Speicherung.'
    },
    {
      title: 'Fitnesstracker & Timer',
      category: 'Gesundheit',
      prompt: 'Ein Intervall- und Workout-Timer mit Runden-Zähler, Trainingsprotokoll, akustischen Signalen und persönlicher Tages-Statistik.'
    },
    {
      title: 'Rezept- & Einkaufs-Manager',
      category: 'Lifestyle',
      prompt: 'Ein Rezeptbuch mit automatischer Portionsumrechnung, Zutaten-Checkboxen und einer 1-Klick Einkaufsliste zum Abhaken.'
    },
    {
      title: 'Privater Notiztresor',
      category: 'Sicherheit',
      prompt: 'Ein verschlüsselter privater Notizen- und Gedanken-Tresor mit PIN-Sperre, Schnellsuche, Tags und Exportfunktion.'
    }
  ];

  // Lade existierende Apps vom Server
  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const res = await fetch('/api/studio/apps');
      if (res.ok) {
        const data = await res.json();
        setGeneratedApps(data.apps || []);
        if (data.apps && data.apps.length > 0 && !activeApp) {
          setActiveApp(data.apps[0]);
        }
      }
    } catch {
      // Fallback
    }
  };

  const handleGenerateApp = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setStatusMessage('🧠 0-Logik Kortex kompiliert App-Architektur...');

    try {
      const res = await fetch('/api/studio/generate-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          title: appName.trim() || undefined,
          category
        })
      });

      const data = await res.json();
      if (data.success && data.app) {
        setGeneratedApps((prev) => [data.app, ...prev]);
        setActiveApp(data.app);
        setActiveView('preview');
        setStatusMessage(`✅ App „${data.app.title}“ erfolgreich generiert!`);
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage(`❌ Fehler: ${data.error || 'Generierung fehlgeschlagen'}`);
      }
    } catch (err: any) {
      setStatusMessage(`❌ Netzwerkfehler: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteApp = async (id: string) => {
    try {
      await fetch(`/api/studio/apps/${id}`, { method: 'DELETE' });
      setGeneratedApps((prev) => prev.filter((a) => a.id !== id));
      if (activeApp?.id === id) {
        setActiveApp(null);
      }
      setStatusMessage('App aus privater Bibliothek entfernt.');
      setTimeout(() => setStatusMessage(null), 2500);
    } catch {
      // ignore
    }
  };

  const copyCodeToClipboard = () => {
    if (!activeApp) return;
    navigator.clipboard.writeText(activeApp.htmlCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadStandaloneHtml = (app: GeneratedApp) => {
    const blob = new Blob([app.htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${app.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAppPackage = (app: GeneratedApp) => {
    // Löst Download über Server-Route aus
    window.location.href = `/api/studio/apps/${app.id}/export-apk`;
  };

  const selectPreset = (p: typeof presetPrompts[0]) => {
    setPrompt(p.prompt);
    setAppName(p.title);
    setCategory(p.category);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* ── HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-cyan-950/80 border border-purple-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  PI PRIVATES APP STUDIO
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700 font-bold">
                  PROMPT-TO-APP ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                Erschaffe <strong>beliebige neue Apps</strong> rein per natürlicher Sprache. Sofort lauffähig, offline-fähig &amp; installierbar auf deinem Motorola 13.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveView('library')}
              className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 font-bold transition cursor-pointer ${
                activeView === 'library'
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-slate-950/80 hover:bg-slate-900 text-slate-300 border-slate-800'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-purple-400" />
              <span>Meine Apps ({generatedApps.length})</span>
            </button>
          </div>
        </div>

        {/* Status Feedback */}
        {statusMessage && (
          <div className="p-2.5 rounded-xl bg-slate-950/90 border border-purple-500/40 text-purple-200 text-xs animate-in fade-in">
            {statusMessage}
          </div>
        )}
      </div>

      {/* ── PROMPT CREATOR INPUT CARD ── */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Was für eine neue App möchtest du erschaffen?</span>
          </span>
          <span className="text-[10px] text-slate-500">0-Logik Engine v5.3</span>
        </div>

        {/* Preset Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-400">Schnell-Vorlagen zum Ausprobieren:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {presetPrompts.map((p) => (
              <button
                key={p.title}
                onClick={() => selectPreset(p)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-cyan-300 hover:text-white transition cursor-pointer"
              >
                + {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-slate-400 text-[11px]">Name der App (optional):</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="z.B. Mein Schichtplaner, Haushaltsbuch, Einkaufsliste..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[11px]">Kategorie:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 transition cursor-pointer"
            >
              <option value="Produktivität">Produktivität &amp; Planung</option>
              <option value="Finanzen">Finanzen &amp; Rechner</option>
              <option value="Gesundheit">Gesundheit &amp; Fitness</option>
              <option value="Lifestyle">Lifestyle &amp; Haushalt</option>
              <option value="Sicherheit">Sicherheit &amp; Notizen</option>
              <option value="Audio & Medien">Audio &amp; Medien</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-slate-400 text-[11px]">Beschreibe die Funktionen deiner App:</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Beschreibe genau, was die App können soll. Z.B.: 'Ein Schichtplaner mit 3 Schichten (Früh, Spät, Nacht), Feiertagen, Notizen und Stundenberechnung pro Monat mit Speicherung.'"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition resize-y leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="text-[11px] text-slate-400">
            <span>✨ Erzeugt sofort lauffähiges HTML5, CSS &amp; JavaScript mit LocalStorage.</span>
          </div>

          <button
            onClick={handleGenerateApp}
            disabled={isGenerating || !prompt.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/25 active:scale-95 transition disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>KOMPILIERE DEINE NEUE APP...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>🚀 NEUE APP PER PROMPT BAUEN</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── MAIN WORKSPACE: PREVIEW / CODE / LIBRARY ── */}
      {activeApp ? (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
          {/* Workspace Nav Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{activeApp.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{activeApp.title}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    {activeApp.category}
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Erstellt: {new Date(activeApp.createdAt).toLocaleTimeString()} · Version {activeApp.version}
                </p>
              </div>
            </div>

            {/* Action Switchers */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveView('preview')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition cursor-pointer ${
                  activeView === 'preview'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Live Testen</span>
              </button>

              <button
                onClick={() => setActiveView('code')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition cursor-pointer ${
                  activeView === 'code'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Quellcode</span>
              </button>

              <button
                onClick={() => downloadStandaloneHtml(activeApp)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center gap-1 cursor-pointer transition"
                title="Standalone HTML Datei herunterladen"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Als HTML laden (Kein Parsing-Fehler)</span>
              </button>

              <button
                onClick={() => setFullscreenPreview(!fullscreenPreview)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title={fullscreenPreview ? 'Vollbild verlassen' : 'Im Smartphone-Vollbild testen'}
              >
                {fullscreenPreview ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 1. LIVE PREVIEW TAB */}
          {activeView === 'preview' && (
            <div className={`space-y-2 ${fullscreenPreview ? 'fixed inset-0 z-50 bg-black p-4 flex flex-col' : ''}`}>
              {fullscreenPreview && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white text-sm">Vollbild-Vorschau: {activeApp.title}</span>
                  <button
                    onClick={() => setFullscreenPreview(false)}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-white text-xs cursor-pointer"
                  >
                    Vollbild schließen
                  </button>
                </div>
              )}

              {/* Motorola 13 Device Container */}
              <div className="relative mx-auto w-full max-w-md bg-slate-900 rounded-[2.5rem] p-3 border-4 border-slate-700 shadow-2xl">
                {/* Camera Notch */}
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-black rounded-full" />
                </div>

                {/* IFrame Screen */}
                <div className="w-full h-[520px] bg-slate-950 rounded-[1.8rem] overflow-hidden border border-slate-800 shadow-inner">
                  <iframe
                    ref={iframeRef}
                    title={activeApp.title}
                    srcDoc={activeApp.htmlCode}
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
                  />
                </div>

                {/* Home Indicator */}
                <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto mt-2" />
              </div>

              {/* Explanation Note for Motorola 13 */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-800/60 flex items-start gap-2.5 text-xs">
                <Smartphone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-cyan-300">
                    Wie du diese neu erstellte App dauerhaft auf deinem Motorola 13 installierst:
                  </p>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Klicke oben auf <strong className="text-emerald-400">„Als HTML laden“</strong>. Die Datei landet in deinem Downloads-Ordner. Du kannst sie auf deinem Motorola 13 antippen und in Chrome öffnen → Menü (3 Punkte ⋮) → <strong>„Zum Startbildschirm hinzufügen“</strong>. Schon hast du ein echtes, eigenständiges App-Icon für deine neue App auf dem Handy!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. SOURCE CODE TAB */}
          {activeView === 'code' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-white">Vollständiger HTML5 / JS / Tailwind Code:</span>
                <button
                  onClick={copyCodeToClipboard}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Kopiert!' : 'Code kopieren'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 font-mono overflow-x-auto max-h-[480px] leading-relaxed">
                <code>{activeApp.htmlCode}</code>
              </pre>
            </div>
          )}
        </div>
      ) : null}

      {/* ── 3. MEINE ERSTELLTEN APPS (BIBLIOTHEK) ── */}
      {activeView === 'library' && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-purple-400" />
              <span>Deine privaten Apps ({generatedApps.length})</span>
            </h3>
            <button
              onClick={() => setActiveView('preview')}
              className="text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              Zurück zum Studio
            </button>
          </div>

          {generatedApps.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <p>Noch keine Apps erstellt.</p>
              <p className="text-[11px]">Gib oben einen Prompt ein, um deine erste persönliche App zu generieren!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {generatedApps.map((app) => (
                <div
                  key={app.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 transition ${
                    activeApp?.id === app.id
                      ? 'bg-purple-950/40 border-purple-500/60'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{app.icon}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        {app.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs">{app.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {app.prompt}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                    <button
                      onClick={() => {
                        setActiveApp(app);
                        setActiveView('preview');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition"
                    >
                      <Play className="w-3 h-3" />
                      <span>Starten</span>
                    </button>

                    <button
                      onClick={() => downloadStandaloneHtml(app)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                      title="Als HTML herunterladen"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteApp(app.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 cursor-pointer"
                      title="Löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
