import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://www.elitesurfing.pt';
const API_URL = 'https://elitesurfingeu-backend.vercel.app';

const staticRoutes = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/products', changefreq: 'daily', priority: 0.9 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  { url: '/faq', changefreq: 'monthly', priority: 0.6 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { url: '/terms', changefreq: 'yearly', priority: 0.3 },
  { url: '/refund-policy', changefreq: 'yearly', priority: 0.3 },
];

const categories = [
  { slug: 'deck-tahiti', name: 'Deck Tahiti', priority: 0.8 },
  { slug: 'deck-hawaii-grom', name: 'Deck Hawaii Grom', priority: 0.8 },
  { slug: 'deck-saquarema', name: 'Deck Saquarema', priority: 0.8 },
  { slug: 'deck-noronha', name: 'Deck Noronha', priority: 0.8 },
  { slug: 'deck-fiji-classic', name: 'Deck Fiji Classic', priority: 0.8 },
  { slug: 'deck-j-bay', name: 'Deck J-Bay', priority: 0.8 },
  { slug: 'fuwax-cool', name: 'Fu Wax Cool', priority: 0.8 },
];

const invalidProductSlugs = [
  'Deck-Bells',
  'deck-bells',
];

async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/api/product/list`);
    const data = await response.json();
    
    if (data.success && data.products) {
      return data.products.filter(product => {
        const productId = product._id || '';
        const productSlug = product.slug || '';
        return !invalidProductSlugs.includes(productId) && 
               !invalidProductSlugs.includes(productSlug) &&
               product.inStock === true;
      });
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
    
    if (item.image) {
      const safeTitle = (item.title || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
      
      xml += `
    <image:image>
      <image:loc>${item.image}</image:loc>
      <image:title>${safeTitle}</image:title>
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
  
  console.log('📄 Adicionando rotas estáticas...');
  urls.push(...staticRoutes);
  
  console.log('📁 Adicionando categorias...');
  for (const cat of categories) {
    urls.push({
      url: `/products/${cat.slug}`,
      changefreq: 'weekly',
      priority: cat.priority
    });
  }
  
  console.log('🔍 Buscando produtos da API...');
  const products = await fetchProducts();
  console.log(`✅ ${products.length} produtos válidos (em stock) encontrados\n`);
  
  for (const product of products) {
    const category = (product.category || '').toLowerCase();
    
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
  
  const xml = generateSitemapXML(urls);
  
  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  
  console.log(`✅ Sitemap gerado com sucesso!`);
  console.log(`📍 Localização: ${outputPath}`);
  console.log(`📊 Total de URLs: ${urls.length}`);
  console.log(`   - Rotas estáticas: ${staticRoutes.length}`);
  console.log(`   - Categorias: ${categories.length}`);
  console.log(`   - Produtos: ${products.length}`);
}

generateSitemap().catch(console.error);