import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { preferenceBootstrap, sitePreferences } from './packages/ui/src/preferences';
export default defineConfig({
  build: { manifest: true },
  resolve: { dedupe: ['react', 'react-dom'] },
  optimizeDeps: { exclude: ['@terapevti4no/ui'] },
  plugins: [react(), {
    name: 'saved-preferences',
    transformIndexHtml: () => [{ tag: 'script', children: preferenceBootstrap(sitePreferences), injectTo: 'head-prepend' }],
  }],
});
