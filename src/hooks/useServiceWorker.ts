import { useEffect } from 'react';

export const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      const register = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          console.log('ServiceWorker registration successful:', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available
                  if (confirm('Une nouvelle version est disponible. Recharger ?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        } catch (error) {
          console.error('ServiceWorker registration failed:', error);
        }
      };

      register();
    }
  }, []);
};
