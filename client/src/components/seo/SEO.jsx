import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://www.elitesurfing.pt';

const SEO = ({ 
  title, 
  description, 
  image = '/og-image.jpg',
  url = '',
  type = 'website',
  noindex = false,
  children
}) => {
  const fullUrl = `${BASE_URL}${url}`;
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  const fullTitle = title ? `${title} | Elite Surfing Portugal` : 'Elite Surfing Portugal - Loja Online de Surf';
  
  return (
    <>
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={fullUrl} />
        
        {noindex && <meta name="robots" content="noindex, nofollow" />}
        
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={fullImage} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content="Elite Surfing Portugal" />
        <meta property="og:locale" content="pt_PT" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={fullImage} />
        
        <link rel="alternate" hrefLang="pt-PT" href={fullUrl} />
        <link rel="alternate" hrefLang="x-default" href={fullUrl} />
      </Helmet>
      
      {children}
    </>
  );
};

export default SEO;