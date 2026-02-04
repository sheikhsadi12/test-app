import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env variables from .env file if present, or from system env (GitHub Secrets)
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // IMPORTANT: Sets the base path to relative. 
    // This fixes the "white screen" issue on GitHub Pages (404 for assets).
    base: './', 
    define: {
      // This injects the API_KEY from GitHub Secrets (or .env) into the code during build.
      // It replaces 'process.env.API_KEY' with the actual string value.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    }
  };
});