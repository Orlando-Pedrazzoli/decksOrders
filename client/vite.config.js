import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import Sitemap from 'vite-plugin-sitemap'

// Rotas estáticas do site
const staticRoutes = [
  '/',
  '/products',
  '/cart',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
  '/refund-policy'
]

// Categorias de produtos
const categories = [
  'deck',
  'leash',
  'quilhas',
  'fins',
  'capas',
  'wax',
  'acessorios'
]

// Gerar rotas de categorias
const categoryRoutes = categories.map(cat => `/products/${cat}`)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    Sitemap({
      hostname: 'https://elitesurfing.pt',
      // Rotas a incluir no sitemap
      dynamicRoutes: [...staticRoutes, ...categoryRoutes],
      // Excluir rotas privadas/admin
      exclude: [
        '/my-orders',
        '/seller',
        '/seller/*',
        '/write-review',
        '/write-review/*',
        '/order-success',
        '/add-address'
      ],
      // Configurações de prioridade e frequência
      robots: [
        { 
          userAgent: '*', 
          allow: '/',
          disallow: ['/seller', '/my-orders', '/add-address', '/write-review']
        }
      ],
      // Última modificação
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date(),
      // Configurar prioridades específicas
      outDir: 'dist',
      readable: true
    })
  ],
})