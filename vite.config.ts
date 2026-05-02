import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

// Plugin to copy PWA files to dist
function pwaPlugin() {
  return {
    name: 'vite-plugin-pwa-copy',
    apply: 'build',
    closeBundle() {
      const outDir = 'dist';
      if (!existsSync(outDir)) return;

      // Copy service worker
      copyFileSync('public/sw.js', `${outDir}/sw.js`);
      copyFileSync('public/manifest.json', `${outDir}/manifest.json`);
      copyFileSync('public/offline.html', `${outDir}/offline.html`);

      // Copy icons if they exist
      const icons = ['icon.svg', 'icon-192.png', 'icon-512.png'];
      icons.forEach(icon => {
        if (existsSync(`public/${icon}`)) {
          copyFileSync(`public/${icon}`, `${outDir}/${icon}`);
        }
      });

      console.log('PWA files copied to dist');
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // Include Netlify environment variables
  const finalEnv = { ...process.env, ...env };
  return {
    plugins: [react(), tailwindcss(), pwaPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(finalEnv.GEMINI_API_KEY),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(finalEnv.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(finalEnv.VITE_SUPABASE_ANON_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      // Use local modules instead of CDN
      optimizeDeps: {
        include: ['motion', '@supabase/supabase-js', 'lucide-react', 'recharts']
      }
    },
  };
});
