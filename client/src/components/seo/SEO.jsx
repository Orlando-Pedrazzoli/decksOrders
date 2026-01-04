import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://elitesurfing.pt';

const SEO = ({ 
  title, 
  description, 
  image = '/og-image.jpg',
  url = '',
  type = 'website',
  noindex = false,
  children  // Schemas JSON-LD
}) => {
  const fullUrl = `${BASE_URL}${url}`;
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  
  // Construir título como string pura
  const fullTitle = title ? `${title} | Elite Surfing Portugal` : 'Elite Surfing Portugal';
  
  return (
    <>
      <Helmet>
        {/* Título - deve ser string pura */}
        <title>{fullTitle}</title>
        
        {/* Meta Tags Básicas */}
        <meta name="description" content={description} />
        <link rel="canonical" href={fullUrl} />
        
        {/* Robots */}
        {noindex && <meta name="robots" content="noindex, nofollow" />}
        
        {/* Open Graph */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={fullImage} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content="Elite Surfing Portugal" />
        <meta property="og:locale" content="pt_PT" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={fullImage} />
      </Helmet>
      
      {/* JSON-LD Schemas - renderizados FORA do Helmet */}
      {children}
    </>
  );
};

export default SEO;