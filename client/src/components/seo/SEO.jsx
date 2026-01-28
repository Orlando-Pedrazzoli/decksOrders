import { Helmet } from 'react-helmet-async';

/**
 * SEO Component - Elite Surfing Portugal
 * Versão: 2.0.0
 * Última atualização: 2026-01-28
 * 
 * REGRAS CRÍTICAS PARA CANONICAL TAGS:
 * 1. Usar SEMPRE URL absoluta completa (https://www.elitesurfing.pt/...)
 * 2. Usar SEMPRE o mesmo formato que o sitemap.xml
 * 3. SEM trailing slash (exceto para a homepage que é /)
 * 4. Cada página DEVE ter self-referencing canonical
 * 5. prioritizeSeoTags garante que canonical é renderizada primeiro
 */

const BASE_URL = 'https://www.elitesurfing.pt';
const DEFAULT_IMAGE = '/og-image.jpg';
const SITE_NAME = 'Elite Surfing Portugal';

/**
 * Normaliza a URL para formato canónico consistente
 * - Remove trailing slash (exceto para /)
 * - Garante que começa com /
 * - Remove parâmetros de query desnecessários
 * - Remove fragmentos (#)
 */
const normalizeUrl = (url) => {
  if (!url || url === '/') return '';
  
  // Remover fragmentos e parâmetros de query para canonical
  let cleanUrl = url.split('?')[0].split('#')[0];
  
  // Garantir que começa com /
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }
  
  // Remover trailing slash (mas não para root)
  if (cleanUrl !== '/' && cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.slice(0, -1);
  }
  
  // Normalizar múltiplas barras
  cleanUrl = cleanUrl.replace(/\/+/g, '/');
  
  return cleanUrl;
};

/**
 * Trunca texto para tamanho ideal de meta description
 * Google exibe ~155-160 caracteres
 */
const truncateDescription = (text, maxLength = 155) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
};

const SEO = ({ 
  title, 
  description, 
  image = DEFAULT_IMAGE,
  url = '',
  type = 'website',
  noindex = false,
  article = null, // Para páginas de blog/artigos
  product = null, // Para páginas de produto (dados adicionais)
  children
}) => {
  // Normalizar URL para canonical
  const normalizedPath = normalizeUrl(url);
  const fullUrl = `${BASE_URL}${normalizedPath}`;
  
  // Garantir URL absoluta para imagem
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  
  // Formatar título - máximo 60 caracteres para Google
  const pageTitle = title ? title : 'Loja Online de Surf';
  const fullTitle = `${pageTitle} | ${SITE_NAME}`;
  
  // Garantir descrição com fallback e truncamento
  const defaultDescription = 'Loja online de equipamento de surf em Portugal. Decks, leashes, quilhas, capas, wax e acessórios de surf. Entregas em Portugal Continental.';
  const metaDescription = truncateDescription(description || defaultDescription);
  
  // Data atual para freshness
  const currentDate = new Date().toISOString();
  
  return (
    <>
      {/* 
        prioritizeSeoTags: Garante que tags SEO críticas (title, canonical, og:*) 
        são renderizadas ANTES de outras tags menos importantes.
        Isto é crucial para o Google processar correctamente as canonicals.
      */}
      <Helmet prioritizeSeoTags>
        {/* ===== TAGS CRÍTICAS ===== */}
        
        {/* Title - tag mais importante, máximo 60 caracteres */}
        <title>{fullTitle}</title>
        
        {/* Canonical - CRÍTICO: deve ser idêntica à URL no sitemap */}
        <link rel="canonical" href={fullUrl} />
        
        {/* Meta Description - 150-160 caracteres ideal */}
        <meta name="description" content={metaDescription} />
        
        {/* ===== ROBOTS ===== */}
        {noindex ? (
          <meta name="robots" content="noindex, nofollow" />
        ) : (
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        )}
        <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow"} />
        
        {/* ===== OPEN GRAPH (Facebook, LinkedIn, WhatsApp) ===== */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={fullImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={pageTitle} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="pt_PT" />
        
        {/* Artigo específico */}
        {article && (
          <>
            <meta property="article:published_time" content={article.publishedTime} />
            <meta property="article:modified_time" content={article.modifiedTime || currentDate} />
            <meta property="article:author" content={article.author || SITE_NAME} />
            {article.tags && article.tags.map((tag, i) => (
              <meta key={i} property="article:tag" content={tag} />
            ))}
          </>
        )}
        
        {/* Produto específico */}
        {product && (
          <>
            <meta property="product:price:amount" content={product.price} />
            <meta property="product:price:currency" content="EUR" />
            <meta property="product:availability" content={product.inStock ? "in stock" : "out of stock"} />
            <meta property="product:brand" content="Elite Surfing" />
          </>
        )}
        
        {/* ===== TWITTER CARD ===== */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={fullImage} />
        <meta name="twitter:image:alt" content={pageTitle} />
        
        {/* ===== IDIOMA E REGIÃO ===== */}
        <link rel="alternate" hrefLang="pt-PT" href={fullUrl} />
        <link rel="alternate" hrefLang="pt" href={fullUrl} />
        <link rel="alternate" hrefLang="x-default" href={fullUrl} />
        <meta property="og:locale:alternate" content="pt_BR" />
        
        {/* ===== OUTROS META ===== */}
        <meta name="author" content={SITE_NAME} />
        <meta name="generator" content="React" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Geo tags */}
        <meta name="geo.region" content="PT-11" />
        <meta name="geo.placename" content="Oeiras, Portugal" />
        
      </Helmet>
      
      {/* Structured Data (JSON-LD) passado como children */}
      {children}
    </>
  );
};

export default SEO;