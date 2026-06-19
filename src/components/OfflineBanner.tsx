import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 text-center transition-all duration-300 ${
      isOnline 
        ? 'bg-emerald-500 text-white' 
        : 'bg-slate-800 text-white'
    }`}>
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
        {isOnline ? (
          <>
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">You're back online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">You're offline. Some features may not work.</span>
          </>
        )}
      </div>
    </div>
  );
}
