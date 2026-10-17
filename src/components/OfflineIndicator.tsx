import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-cyan-950 border border-cyan-500/60 px-3.5 py-2 text-xs font-mono text-cyan-200 shadow-xl backdrop-blur-md">
      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
      <WifiOff className="w-3.5 h-3.5 text-cyan-400" />
      <span>0-Logik Offline-Modus aktiv — Lokaler Kortex verfügbar.</span>
    </div>
  );
};
