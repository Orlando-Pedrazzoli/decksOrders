/**
 * Script para gerar sitemap.xml com produtos dinâmicos
 * 
 * Este script busca todos os produtos da API e gera um sitemap.xml completo.
 * Executa: node scripts/generate-sitemap.js
 * 
 * Recomendado executar antes de cada deploy ou via cron job.
 */

import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://elitesurfing.pt';
const API_URL = 'https://elitesurfingeu-backend.vercel.app';

// Rotas estáticas
const staticRoutes = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/products', changefreq: 'daily', priority: 0.9 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  { url: '/faq', changefreq: 'monthly', priority: 0.6 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { url: '/terms', changefreq: 'yearly', priority: 0.3 },
  { url: '/refund-policy', changefreq: 'yearly', priority: 0.3 },
];

// Categorias
const categories = [
  { slug: 'deck', priority: 0.8 },
  { slug: 'leash', priority: 0.8 },
  { slug: 'quilhas', priority: 0.8 },
  { slug: 'fins', priority: 0.8 },
  { slug: 'capas', priority: 0.8 },
  { slug: 'wax', priority: 0.8 },
  { slug: 'acessorios', priority: 0.8 },
];

async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/api/product/list`);
    const data = await response.json();
    
    if (data.success && data.products) {
      return data.products;
    }
    console.log('⚠️ Nenhum produto encontrado na API');
    return [];
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error.message);
    return [];
  }
}

function generateSitemapXML(urls) {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  for (const item of urls) {
    xml += `  <url>
    <loc>${SITE_URL}${item.url}</loc>
    <lastmod>${item.lastmod || today}</lastmod>
    <changefreq>${item.changefreq || 'weekly'}</changefreq>
    <priority>${item.priority || 0.5}</priority>`;
    
    // Adicionar imagem se existir
    if (item.image) {
      xml += `
    <image:image>
      <image:loc>${item.image}</image:loc>
      <image:title>${item.title || ''}</image:title>
    </image:image>`;
    }
    
    xml += `
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

async function generateSitemap() {
  console.log('🚀 Iniciando geração do sitemap...\n');
  
  const urls = [];
  
  // Adicionar rotas estáticas
  console.log('📄 Adicionando rotas estáticas...');
  urls.push(...staticRoutes);
  
  // Adicionar categorias
  console.log('📁 Adicionando categorias...');
  for (const cat of categories) {
    urls.push({
      url: `/products/${cat.slug}`,
      changefreq: 'weekly',
      priority: cat.priority
    });
  }
  
  // Buscar e adicionar produtos
  console.log('🔍 Buscando produtos da API...');
  const products = await fetchProducts();
  console.log(`✅ ${products.length} produtos encontrados\n`);
  
  for (const product of products) {
    const category = product.category?.toLowerCase() || 'acessorios';
    const lastmod = product.updatedAt 
      ? new Date(product.updatedAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    
    urls.push({
      url: `/products/${category}/${product._id}`,
      lastmod,
      changefreq: 'weekly',
      priority: 0.7,
      image: product.image?.[0],
      title: product.name
    });
  }
  
  // Gerar XML
  const xml = generateSitemapXML(urls);
  
  // Guardar ficheiro
  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  
  console.log(`✅ Sitemap gerado com sucesso!`);
  console.log(`📍 Localização: ${outputPath}`);
  console.log(`📊 Total de URLs: ${urls.length}`);
  console.log(`   - Rotas estáticas: ${staticRoutes.length}`);
  console.log(`   - Categorias: ${categories.length}`);
  console.log(`   - Produtos: ${products.length}`);
}

// Executar
generateSitemap().catch(console.error);