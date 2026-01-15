import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ⚠️ IMPORTANTE: O sitemap é gerado pelo script /scripts/generate-sitemap.js
// que busca produtos da API e gera URLs dinâmicas completas.
// NÃO usar vite-plugin-sitemap aqui para evitar conflitos de URLs.

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  // Garantir que o build não remove o sitemap.xml da pasta public
  publicDir: 'public',
  build: {
    // Copiar arquivos estáticos da public para dist
    copyPublicDir: true,
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  }
})