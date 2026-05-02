import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => setShowBanner(false), 2000);
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

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-40 px-6 py-3 rounded-full shadow-lg flex items-center gap-3 ${
            isOnline
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi size={20} />
              <span className="font-medium">Vous êtes en ligne</span>
            </>
          ) : (
            <>
              <WifiOff size={20} />
              <span className="font-medium">Mode hors ligne - Les modifications seront synchronisées</span>
              <button
                onClick={() => window.location.reload()}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <RefreshCw size={18} />
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
