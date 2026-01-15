import { Helmet } from 'react-helmet-async';

/**
 * SEO Component - Elite Surfing Portugal
 * 
 * REGRAS CRÍTICAS PARA CANONICAL TAGS:
 * 1. Usar SEMPRE URL absoluta completa (https://www.elitesurfing.pt/...)
 * 2. Usar SEMPRE o mesmo formato que o sitemap.xml
 * 3. SEM trailing slash (exceto para a homepage que é /)
 * 4. Cada página DEVE ter self-referencing canonical
 * 5. prioritizeSeoTags garante que canonical é renderizada primeiro
 */

const BASE_URL = 'https://www.elitesurfing.pt';

/**
 * Normaliza a URL para formato canónico consistente
 * - Remove trailing slash (exceto para /)
 * - Garante que começa com /
 * - Remove parâmetros de query desnecessários
 */
const normalizeUrl = (url) => {
  if (!url || url === '/') return '';
  
  // Remover parâmetros de query para canonical
  let cleanUrl = url.split('?')[0];
  
  // Garantir que começa com /
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }
  
  // Remover trailing slash (mas não para root)
  if (cleanUrl !== '/' && cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.slice(0, -1);
  }
  
  return cleanUrl;
};

const SEO = ({ 
  title, 
  description, 
  image = '/og-image.jpg',
  url = '',
  type = 'website',
  noindex = false,
  children
}) => {
  // Normalizar URL para canonical
  const normalizedPath = normalizeUrl(url);
  const fullUrl = `${BASE_URL}${normalizedPath}`;
  
  // Garantir URL absoluta para imagem
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  
  // Formatar título
  const fullTitle = title 
    ? `${title} | Elite Surfing Portugal` 
    : 'Elite Surfing Portugal - Loja Online de Surf';
  
  // Garantir descrição com fallback
  const metaDescription = description || 'Loja online de equipamento de surf em Portugal. Decks, leashes, quilhas, capas, wax e acessórios de surf.';
  
  return (
    <>
      {/* 
        prioritizeSeoTags: Garante que tags SEO críticas (title, canonical, og:*) 
        são renderizadas ANTES de outras tags menos importantes.
        Isto é crucial para o Google processar correctamente as canonicals.
      */}
      <Helmet prioritizeSeoTags>
        {/* Title - tag mais importante */}
        <title>{fullTitle}</title>
        
        {/* Canonical - CRÍTICO: deve ser idêntica à URL no sitemap */}
        <link rel="canonical" href={fullUrl} />
        
        {/* Meta Description */}
        <meta name="description" content={metaDescription} />
        
        {/* Robots */}
        {noindex ? (
          <meta name="robots" content="noindex, nofollow" />
        ) : (
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        )}
        
        {/* Open Graph - Essencial para redes sociais */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={fullImage} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content="Elite Surfing Portugal" />
        <meta property="og:locale" content="pt_PT" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={fullImage} />
        
        {/* Hreflang para SEO internacional */}
        <link rel="alternate" hrefLang="pt-PT" href={fullUrl} />
        <link rel="alternate" hrefLang="x-default" href={fullUrl} />
      </Helmet>
      
      {/* Structured Data (JSON-LD) passado como children */}
      {children}
    </>
  );
};

export default SEO;