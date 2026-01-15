import fs from 'fs';
import path from 'path';

/**
 * Gerador de Sitemap - Elite Surfing Portugal
 * 
 * REGRAS CRÍTICAS:
 * 1. URLs DEVEM ser idênticas às canonical tags no SEO.jsx
 * 2. Usar www.elitesurfing.pt (COM www)
 * 3. SEM trailing slash nas URLs (exceto homepage)
 * 4. Incluir APENAS páginas indexáveis
 * 5. Excluir páginas com noindex
 */

const SITE_URL = 'https://www.elitesurfing.pt';
const API_URL = 'https://elitesurfingeu-backend.vercel.app';

// ========================================
// ROTAS ESTÁTICAS
// Estas DEVEM corresponder às rotas no App.jsx
// ========================================
const staticRoutes = [
  { url: '', changefreq: 'daily', priority: 1.0 },           // Homepage
  { url: '/products', changefreq: 'daily', priority: 0.9 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  { url: '/faq', changefreq: 'monthly', priority: 0.6 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { url: '/terms', changefreq: 'yearly', priority: 0.3 },
  { url: '/refund-policy', changefreq: 'yearly', priority: 0.3 },
];

// Páginas que NÃO devem estar no sitemap (noindex)
// - /cart - página privada de utilizador
// - /my-orders - página privada de utilizador
// - /add-address - página privada de utilizador
// - /write-review - página privada de utilizador
// - /order-success - página privada de utilizador
// - /seller/* - área de administração

// ========================================
// CATEGORIAS DE PRODUTOS
// Estas DEVEM corresponder às categorias reais no backend
// ========================================
const categories = [
  { slug: 'deck-tahiti', name: 'Deck Tahiti', priority: 0.8 },
  { slug: 'deck-hawaii-grom', name: 'Deck Hawaii Grom', priority: 0.8 },
  { slug: 'deck-saquarema', name: 'Deck Saquarema', priority: 0.8 },
  { slug: 'deck-noronha', name: 'Deck Noronha', priority: 0.8 },
  { slug: 'deck-fiji-classic', name: 'Deck Fiji Classic', priority: 0.8 },
  { slug: 'deck-j-bay', name: 'Deck J-Bay', priority: 0.8 },
  { slug: 'fuwax-cool', name: 'Fu Wax Cool', priority: 0.8 },
];

// Slugs de produtos inválidos/removidos
const invalidProductSlugs = [
  'Deck-Bells',
  'deck-bells',
];

/**
 * Normaliza URL removendo trailing slash
 */
const normalizeUrl = (url) => {
  if (!url || url === '/') return '';
  let clean = url;
  if (!clean.startsWith('/')) clean = '/' + clean;
  if (clean.endsWith('/')) clean = clean.slice(0, -1);
  return clean;
};

/**
 * Busca produtos da API
 */
async function fetchProducts() {
  try {
    console.log('🔍 Conectando à API...');
    const response = await fetch(`${API_URL}/api/product/list`);
    const data = await response.json();
    
    if (data.success && data.products) {
      const validProducts = data.products.filter(product => {
        const productId = product._id || '';
        const productSlug = product.slug || '';
        
        // Excluir produtos inválidos
        if (invalidProductSlugs.includes(productId) || invalidProductSlugs.includes(productSlug)) {
          return false;
        }
        
        // Incluir APENAS produtos em stock
        if (product.inStock !== true) {
          return false;
        }
        
        // Incluir APENAS variantes principais (isMainVariant !== false)
        // Isto evita duplicação de URLs para variantes de cor
        if (product.isMainVariant === false) {
          return false;
        }
        
        return true;
      });
      
      console.log(`✅ ${validProducts.length} produtos válidos encontrados`);
      return validProducts;
    }
    
    console.log('⚠️ Nenhum produto encontrado na API');
    return [];
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error.message);
    return [];
  }
}

/**
 * Escapa caracteres especiais para XML
 */
function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Gera o XML do sitemap
 */
function generateSitemapXML(urls) {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  for (const item of urls) {
    // Normalizar URL (sem trailing slash)
    const normalizedUrl = normalizeUrl(item.url);
    const fullUrl = `${SITE_URL}${normalizedUrl}`;
    
    xml += `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${item.lastmod || today}</lastmod>
    <changefreq>${item.changefreq || 'weekly'}</changefreq>
    <priority>${item.priority || 0.5}</priority>`;
    
    // Adicionar imagem se disponível
    if (item.image) {
      xml += `
    <image:image>
      <image:loc>${escapeXml(item.image)}</image:loc>
      <image:title>${escapeXml(item.title || '')}</image:title>
    </image:image>`;
    }
    
    xml += `
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

/**
 * Função principal
 */
async function generateSitemap() {
  console.log('🚀 Iniciando geração do sitemap...\n');
  console.log(`📍 URL Base: ${SITE_URL}`);
  console.log('');
  
  const urls = [];
  
  // 1. Adicionar rotas estáticas
  console.log('📄 Adicionando rotas estáticas...');
  for (const route of staticRoutes) {
    urls.push({
      url: route.url,
      changefreq: route.changefreq,
      priority: route.priority
    });
    console.log(`   ✓ ${SITE_URL}${route.url || '/'}`);
  }
  
  // 2. Adicionar páginas de categorias
  console.log('\n📁 Adicionando categorias...');
  for (const cat of categories) {
    const catUrl = `/products/${cat.slug}`;
    urls.push({
      url: catUrl,
      changefreq: 'weekly',
      priority: cat.priority
    });
    console.log(`   ✓ ${SITE_URL}${catUrl}`);
  }
  
  // 3. Buscar e adicionar produtos
  console.log('\n🔍 Buscando produtos da API...');
  const products = await fetchProducts();
  
  if (products.length > 0) {
    console.log(`\n📦 Adicionando ${products.length} produtos...`);
    
    for (const product of products) {
      // Categoria em lowercase para URL
      const category = (product.category || '').toLowerCase();
      
      // URL do produto (sem trailing slash)
      const productUrl = `/products/${category}/${product._id}`;
      
      // Data de última modificação
      const lastmod = product.updatedAt 
        ? new Date(product.updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      urls.push({
        url: productUrl,
        lastmod,
        changefreq: 'weekly',
        priority: 0.7,
        image: product.image?.[0],
        title: product.name
      });
    }
  }
  
  // 4. Gerar XML
  const xml = generateSitemapXML(urls);
  
  // 5. Guardar ficheiro
  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  
  // 6. Resumo
  console.log('\n' + '='.repeat(50));
  console.log('✅ SITEMAP GERADO COM SUCESSO!');
  console.log('='.repeat(50));
  console.log(`📍 Ficheiro: ${outputPath}`);
  console.log(`📊 Total de URLs: ${urls.length}`);
  console.log(`   • Rotas estáticas: ${staticRoutes.length}`);
  console.log(`   • Categorias: ${categories.length}`);
  console.log(`   • Produtos: ${products.length}`);
  console.log('');
  console.log('⚠️  IMPORTANTE:');
  console.log('   1. Executar "npm run build" após gerar o sitemap');
  console.log('   2. O sitemap será copiado para /dist automaticamente');
  console.log('   3. Submeter novo sitemap no Google Search Console');
  console.log('');
}

// Executar
generateSitemap().catch(console.error);