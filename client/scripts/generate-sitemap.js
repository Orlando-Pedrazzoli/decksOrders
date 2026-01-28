import fs from 'fs';
import path from 'path';

/**
 * =====================================================
 * Gerador de Sitemaps - Elite Surfing Portugal
 * Versão: 2.0.0
 * Última atualização: 2026-01-28
 * =====================================================
 * 
 * Gera 5 ficheiros XML em /public:
 * 
 * 1. sitemap.xml          - Índice principal (sitemap index)
 * 2. sitemap-static.xml   - Páginas estáticas (home, contact, faq, etc.)
 * 3. sitemap-collections.xml - Grupos/Coleções (/collections/decks, etc.)
 * 4. sitemap-categories.xml  - Modelos/Subcategorias (/products/deck-tahiti, etc.)
 * 5. sitemap-products.xml    - Produtos individuais com imagens
 * 
 * EXECUÇÃO:
 * - Manual: npm run sitemap
 * - Automática: Executa antes do build (npm run build)
 * 
 * IMPORTANTE:
 * - As URLs aqui DEVEM corresponder às rotas do App.jsx
 * - As URLs aqui DEVEM corresponder às definidas no seoConfig.js
 * =====================================================
 */

// =====================================================
// CONFIGURAÇÃO
// =====================================================

const SITE_URL = 'https://www.elitesurfing.pt';
const API_URL = 'https://elitesurfingeu-backend.vercel.app';

// Páginas estáticas (correspondem ao seoConfig.js)
// NOTA: Apenas páginas sem noindex:true
const staticRoutes = [
  { url: '', changefreq: 'daily', priority: 1.0 },           // home
  { url: '/products', changefreq: 'daily', priority: 0.9 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  { url: '/faq', changefreq: 'monthly', priority: 0.6 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { url: '/terms', changefreq: 'yearly', priority: 0.3 },
  { url: '/refund-policy', changefreq: 'yearly', priority: 0.3 },
];

// Collections/Grupos (correspondem às rotas /collections/:group)
const collections = [
  { slug: 'decks', changefreq: 'weekly', priority: 0.9 },
  { slug: 'leashes', changefreq: 'weekly', priority: 0.9 },
  { slug: 'capas', changefreq: 'weekly', priority: 0.9 },
  { slug: 'wax', changefreq: 'weekly', priority: 0.9 },
];

// Categorias/Modelos (correspondem às rotas /products/:category)
// Estas são as páginas que listam variantes de um modelo específico
const categories = [
  { slug: 'deck-tahiti', changefreq: 'weekly', priority: 0.8 },
  { slug: 'deck-hawaii-grom', changefreq: 'weekly', priority: 0.8 },
  { slug: 'deck-saquarema', changefreq: 'weekly', priority: 0.8 },
  { slug: 'deck-noronha', changefreq: 'weekly', priority: 0.8 },
  { slug: 'deck-fiji-classic', changefreq: 'weekly', priority: 0.8 },
  { slug: 'deck-j-bay', changefreq: 'weekly', priority: 0.8 },
  { slug: 'fuwax-cool', changefreq: 'weekly', priority: 0.8 },
  { slug: 'leash-6ft-6mm', changefreq: 'weekly', priority: 0.8 },
];

// Produtos a excluir (removidos/inválidos)
const invalidProductSlugs = ['Deck-Bells', 'deck-bells'];

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

/**
 * Escapa caracteres especiais para XML
 */
const escapeXml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Retorna data atual no formato YYYY-MM-DD
 */
const getToday = () => new Date().toISOString().split('T')[0];

/**
 * Formata data ISO para YYYY-MM-DD
 */
const formatDate = (dateString) => {
  if (!dateString) return getToday();
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch {
    return getToday();
  }
};

// =====================================================
// FETCH PRODUTOS DA API
// =====================================================

async function fetchProducts() {
  try {
    console.log('🔍 Conectando à API...');
    console.log(`   URL: ${API_URL}/api/product/list`);
    
    const response = await fetch(`${API_URL}/api/product/list`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();

    if (!data.success || !data.products) {
      console.log('⚠️ Nenhum produto encontrado na API');
      return [];
    }

    // Filtrar produtos válidos
    const validProducts = data.products.filter((product) => {
      // Excluir produtos com slugs inválidos
      if (invalidProductSlugs.includes(product.slug)) {
        console.log(`   ⊘ Excluído (slug inválido): ${product.slug}`);
        return false;
      }
      
      // Excluir produtos fora de stock (opcional - descomentar se necessário)
      // if (product.inStock !== true) {
      //   console.log(`   ⊘ Excluído (sem stock): ${product.name}`);
      //   return false;
      // }
      
      // Excluir variantes que não são principais (evita duplicados)
      if (product.isMainVariant === false) {
        return false;
      }
      
      return true;
    });

    console.log(`✅ ${validProducts.length} produtos válidos de ${data.products.length} total`);
    return validProducts;
    
  } catch (err) {
    console.error('❌ Erro ao buscar produtos:', err.message);
    console.log('   ℹ️ O sitemap de produtos será gerado vazio');
    return [];
  }
}

// =====================================================
// GERADORES DE XML
// =====================================================

/**
 * Gera sitemap index (índice de sitemaps)
 */
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

/**
 * Gera sitemap de páginas estáticas
 */
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

/**
 * Gera sitemap de collections/grupos
 * Rotas: /collections/{slug}
 */
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

/**
 * Gera sitemap de categorias/modelos
 * Rotas: /products/{slug}
 */
function generateCategoriesSitemap() {
  const today = getToday();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const cat of categories) {
    const fullUrl = `${SITE_URL}/products/${cat.slug}`;
    xml += `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${cat.changefreq}</changefreq>
    <priority>${cat.priority}</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

/**
 * Gera sitemap de produtos individuais com imagens
 * Rotas: /products/{category}/{id}
 */
function generateProductsSitemap(products) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  for (const product of products) {
    // Normalizar categoria para URL
    const category = (product.category || 'produtos').toLowerCase().trim();
    const fullUrl = `${SITE_URL}/products/${category}/${product._id}`;
    const lastmod = formatDate(product.updatedAt);
    const productName = escapeXml(product.name || '');

    xml += `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`;

    // Adicionar imagens do produto (máximo 8 por URL - recomendação Google)
    if (product.image && Array.isArray(product.image) && product.image.length > 0) {
      const images = product.image.slice(0, 8);
      
      for (const img of images) {
        if (img && typeof img === 'string') {
          xml += `
    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${productName}</image:title>
    </image:image>`;
        }
      }
    }

    xml += `
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

// =====================================================
// FUNÇÃO PRINCIPAL
// =====================================================

async function generateSitemaps() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   GERADOR DE SITEMAPS - Elite Surfing Portugal   ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📍 URL Base: ${SITE_URL}`);
  console.log(`📅 Data: ${getToday()}`);
  console.log('');

  const outputDir = path.join(process.cwd(), 'public');

  // Verificar/criar pasta public
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('📁 Pasta /public criada');
  }

  // Buscar produtos da API
  const products = await fetchProducts();

  console.log('');
  console.log('📝 Gerando ficheiros XML...');
  console.log('');

  // 1. Sitemap Index
  const sitemapIndex = generateSitemapIndex();
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemapIndex, 'utf8');
  console.log('   ✓ sitemap.xml (índice principal)');

  // 2. Static Sitemap
  const staticSitemap = generateStaticSitemap();
  fs.writeFileSync(path.join(outputDir, 'sitemap-static.xml'), staticSitemap, 'utf8');
  console.log(`   ✓ sitemap-static.xml (${staticRoutes.length} páginas)`);

  // 3. Collections Sitemap
  const collectionsSitemap = generateCollectionsSitemap();
  fs.writeFileSync(path.join(outputDir, 'sitemap-collections.xml'), collectionsSitemap, 'utf8');
  console.log(`   ✓ sitemap-collections.xml (${collections.length} coleções)`);

  // 4. Categories Sitemap
  const categoriesSitemap = generateCategoriesSitemap();
  fs.writeFileSync(path.join(outputDir, 'sitemap-categories.xml'), categoriesSitemap, 'utf8');
  console.log(`   ✓ sitemap-categories.xml (${categories.length} modelos)`);

  // 5. Products Sitemap
  const productsSitemap = generateProductsSitemap(products);
  fs.writeFileSync(path.join(outputDir, 'sitemap-products.xml'), productsSitemap, 'utf8');
  console.log(`   ✓ sitemap-products.xml (${products.length} produtos)`);

  // Resumo final
  const totalUrls = staticRoutes.length + collections.length + categories.length + products.length;
  
  console.log('');
  console.log('══════════════════════════════════════════════════');
  console.log('✅ SITEMAPS GERADOS COM SUCESSO!');
  console.log('══════════════════════════════════════════════════');
  console.log('');
  console.log('📊 Resumo:');
  console.log(`   • Páginas estáticas: ${staticRoutes.length}`);
  console.log(`   • Coleções:          ${collections.length}`);
  console.log(`   • Modelos:           ${categories.length}`);
  console.log(`   • Produtos:          ${products.length}`);
  console.log(`   ─────────────────────────`);
  console.log(`   • TOTAL URLs:        ${totalUrls}`);
  console.log('');
  console.log('📁 Ficheiros gerados em /public:');
  console.log('   • sitemap.xml');
  console.log('   • sitemap-static.xml');
  console.log('   • sitemap-collections.xml');
  console.log('   • sitemap-categories.xml');
  console.log('   • sitemap-products.xml');
  console.log('');
  console.log('🔗 URLs para verificar:');
  console.log(`   • ${SITE_URL}/sitemap.xml`);
  console.log(`   • ${SITE_URL}/robots.txt`);
  console.log('');
  console.log('📌 Próximo passo: Submeter sitemap.xml no Google Search Console');
  console.log('');
}

// Executar
generateSitemaps().catch(err => {
  console.error('');
  console.error('❌ ERRO FATAL:', err.message);
  console.error('');
  process.exit(1);
});