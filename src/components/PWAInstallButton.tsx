import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, CheckCircle, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isMotorolaOrAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-xs font-mono">
        <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
        <span>Motorola Standalone Aktiv</span>
      </div>
    );
  }

  return (
    <>
      {isInstallable ? (
        <button
          onClick={install}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs transition shadow-sm cursor-pointer active:scale-95"
          title="Als native App auf Motorola 13 installieren"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>App Installieren</span>
        </button>
      ) : (
        <button
          onClick={() => setShowGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Motorola 13 Setup</span>
        </button>
      )}

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-cyan-900/60 p-6 shadow-2xl relative text-slate-200">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Motorola 13 Paket-Installation</h3>
                <p className="text-xs text-cyan-400 font-mono">com.missgiver.pi0logik</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                <p className="font-semibold text-cyan-300">Option 1: Direkte PWA-Installation (Empfohlen)</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Tippe im Chrome Browser rechts oben auf die <strong>3 Punkte (Menü)</strong>.</li>
                  <li>Wähle <strong>&quot;App installieren&quot;</strong> oder <strong>&quot;Zum Startbildschirm hinzufügen&quot;</strong>.</li>
                  <li>Die App läuft isoliert im Standalone-Vollbild auf deinem Motorola 13.</li>
                </ol>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                <p className="font-semibold text-blue-300">Option 2: APK-Paket &amp; GitHub Actions</p>
                <p className="text-slate-400">
                  Automatisierte Builds generieren bei jedem Release ein signiertes APK über GitHub Actions (siehe Reiter &quot;Motorola APK&quot;).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
            >
              Verstanden
            </button>
          </div>
        </div>
      )}
    </>
  );
};
