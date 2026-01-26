import fs from 'fs';
import path from 'path';

/**
 * Gerador de Sitemaps - Elite Surfing Portugal
 * 
 * Gera 5 ficheiros em /public:
 * - sitemap.xml (índice)
 * - sitemap-static.xml
 * - sitemap-collections.xml (NOVO - grupos principais)
 * - sitemap-categories.xml (subcategorias de produtos)
 * - sitemap-products.xml
 * 
 * IMPORTANTE: As URLs aqui DEVEM ser idênticas às do seoConfig.js
 * 
 * Última atualização: 2026-01-26
 */

const SITE_URL = 'https://www.elitesurfing.pt';
const API_URL = 'https://elitesurfingeu-backend.vercel.app';

// ========================================
// CONFIGURAÇÕES (espelhadas do seoConfig.js)
// ========================================

// Páginas estáticas SEM noindex (do seoConfig.js)
const staticRoutes = [
  { url: '', changefreq: 'daily', priority: 1.0 },           // home
  { url: '/products', changefreq: 'daily', priority: 0.9 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  { url: '/faq', changefreq: 'monthly', priority: 0.6 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { url: '/terms', changefreq: 'yearly', priority: 0.3 },
  { url: '/refund-policy', changefreq: 'yearly', priority: 0.3 },
];

// Collections/Grupos principais (NOVO)
const collections = [
  { slug: 'decks', changefreq: 'weekly', priority: 0.9 },
  { slug: 'leashes', changefreq: 'weekly', priority: 0.9 },
  { slug: 'capas', changefreq: 'weekly', priority: 0.9 },
  { slug: 'wax', changefreq: 'weekly', priority: 0.9 },
];

// Categorias/Subcategorias de produtos
const categories = [
  'deck-tahiti',
  'deck-hawaii-grom',
  'deck-saquarema',
  'deck-noronha',
  'deck-fiji-classic',
  'deck-j-bay',
  'fuwax-cool',
];

// Produtos inválidos/removidos
const invalidProductSlugs = ['Deck-Bells', 'deck-bells'];

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

const escapeXml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const getToday = () => new Date().toISOString().split('T')[0];

// ========================================
// FETCH PRODUTOS
// ========================================

async function fetchProducts() {
  try {
    console.log('🔍 Conectando à API...');
    const response = await fetch(`${API_URL}/api/product/list`);
    const data = await response.json();

    if (!data.success || !data.products) {
      console.log('⚠️ Nenhum produto encontrado');
      return [];
    }

    const validProducts = data.products.filter((product) => {
      if (invalidProductSlugs.includes(product.slug)) return false;
      if (product.inStock !== true) return false;
      if (product.isMainVariant === false) return false;
      return true;
    });

    console.log(`✅ ${validProducts.length} produtos válidos`);
    return validProducts;
  } catch (err) {
    console.error('❌ Erro ao buscar produtos:', err.message);
    return [];
  }
}

// ========================================
// GERADORES DE XML
// ========================================

function generateSitemapIndex() {
  const today = getToday();
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-collections.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-categories.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-products.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;
}

function generateStaticSitemap() {
  const today = getToday();
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const route of staticRoutes) {
    const fullUrl = `${SITE_URL}${route.url}`;
    xml += `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

// NOVO: Sitemap para Collections/Grupos
function generateCollectionsSitemap() {
  const today = getToday();
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const collection of collections) {
    const fullUrl = `${SITE_URL}/collections/${collection.slug}`;
    xml += `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${collection.changefreq}</changefreq>
    <priority>${collection.priority}</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

function generateCategoriesSitemap() {
  const today = getToday();
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const cat of categories) {
    const fullUrl = `${SITE_URL}/products/${cat}`;
    xml += `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

function generateProductsSitemap(products) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  for (const product of products) {
    const category = (product.category || '').toLowerCase();
    const fullUrl = `${SITE_URL}/products/${category}/${product._id}`;
    const lastmod = product.updatedAt
      ? new Date(product.updatedAt).toISOString().split('T')[0]
      : getToday();

    xml += `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`;

    // Adicionar todas as imagens do produto (máximo 8 por URL)
    if (product.image && product.image.length > 0) {
      const images = product.image.slice(0, 8); // Google recomenda máximo 1000 imagens por sitemap
      for (const img of images) {
        xml += `
    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${escapeXml(product.name || '')}</image:title>
    </image:image>`;
      }
    }

    xml += `
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

// ========================================
// FUNÇÃO PRINCIPAL
// ========================================

async function generateSitemaps() {
  console.log('🚀 Iniciando geração de sitemaps...\n');
  console.log(`📍 URL Base: ${SITE_URL}`);
  console.log(`📅 Data: ${getToday()}\n`);

  const outputDir = path.join(process.cwd(), 'public');

  // Verificar se pasta existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Buscar produtos
  const products = await fetchProducts();

  // Gerar sitemaps
  console.log('\n📝 Gerando ficheiros XML...');

  // 1. Sitemap Index
  const sitemapIndex = generateSitemapIndex();
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemapIndex, 'utf8');
  console.log('   ✓ sitemap.xml (índice)');

  // 2. Static Sitemap
  const staticSitemap = generateStaticSitemap();
  fs.writeFileSync(path.join(outputDir, 'sitemap-static.xml'), staticSitemap, 'utf8');
  console.log(`   ✓ sitemap-static.xml (${staticRoutes.length} páginas)`);

  // 3. Collections Sitemap (NOVO)
  const collectionsSitemap = generateCollectionsSitemap();
  fs.writeFileSync(path.join(outputDir, 'sitemap-collections.xml'), collectionsSitemap, 'utf8');
  console.log(`   ✓ sitemap-collections.xml (${collections.length} collections)`);

  // 4. Categories Sitemap
  const categoriesSitemap = generateCategoriesSitemap();
  fs.writeFileSync(path.join(outputDir, 'sitemap-categories.xml'), categoriesSitemap, 'utf8');
  console.log(`   ✓ sitemap-categories.xml (${categories.length} categorias)`);

  // 5. Products Sitemap
  const productsSitemap = generateProductsSitemap(products);
  fs.writeFileSync(path.join(outputDir, 'sitemap-products.xml'), productsSitemap, 'utf8');
  console.log(`   ✓ sitemap-products.xml (${products.length} produtos)`);

  // Resumo
  const totalUrls = staticRoutes.length + collections.length + categories.length + products.length;
  console.log('\n' + '='.repeat(50));
  console.log('✅ SITEMAPS GERADOS COM SUCESSO!');
  console.log('='.repeat(50));
  console.log(`📊 Total de URLs: ${totalUrls}`);
  console.log(`   • Estáticas: ${staticRoutes.length}`);
  console.log(`   • Collections: ${collections.length}`);
  console.log(`   • Categorias: ${categories.length}`);
  console.log(`   • Produtos: ${products.length}`);
  console.log('\n📁 Ficheiros em /public:');
  console.log('   • sitemap.xml');
  console.log('   • sitemap-static.xml');
  console.log('   • sitemap-collections.xml');
  console.log('   • sitemap-categories.xml');
  console.log('   • sitemap-products.xml');
  console.log('\n🔗 URLs importantes:');
  console.log(`   • ${SITE_URL}/sitemap.xml`);
  console.log(`   • ${SITE_URL}/robots.txt`);
  console.log('');
}

generateSitemaps().catch(console.error);