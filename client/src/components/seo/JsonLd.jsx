/**
 * JSON-LD Structured Data - Elite Surfing Portugal
 * 
 * IMPORTANTE: Todas as URLs devem usar www.elitesurfing.pt
 */

const BASE_URL = 'https://www.elitesurfing.pt';

// Organization Schema
export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Elite Surfing Portugal",
    "alternateName": "Elite Surfing",
    "url": BASE_URL,
    "logo": `${BASE_URL}/logo.png`,
    "image": `${BASE_URL}/og-image.jpg`,
    "description": "Loja online de equipamento e acessórios de surf em Portugal. Decks, leashes, quilhas, capas, wax e muito mais.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Avenida Doutor Francisco de Sá Carneiro 3, Apartamento 3D",
      "addressLocality": "Oeiras",
      "postalCode": "2780-241",
      "addressCountry": "PT"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+351-912-164-220",
      "contactType": "customer service",
      "availableLanguage": ["Portuguese", "English"]
    },
    "sameAs": [
      "https://wa.me/351912164220"
    ]
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

// WebSite Schema with SearchAction
export const WebSiteSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Elite Surfing Portugal",
    "url": BASE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/products?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

// SiteNavigationElement Schema - Define os sitelinks corretos para o Google
export const SiteNavigationSchema = () => {
  const navigationItems = [
    { name: "Produtos", url: "/products" },
    { name: "Deck Tahiti", url: "/products/deck-tahiti" },
    { name: "Deck Saquarema", url: "/products/deck-saquarema" },
    { name: "Deck Noronha", url: "/products/deck-noronha" },
    { name: "Deck Fiji Classic", url: "/products/deck-fiji-classic" },
    { name: "Deck J-Bay", url: "/products/deck-j-bay" },
    { name: "Contacto", url: "/contact" },
    { name: "FAQ", url: "/faq" }
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": navigationItems.map((item, index) => ({
      "@type": "SiteNavigationElement",
      "position": index + 1,
      "name": item.name,
      "url": `${BASE_URL}${item.url}`
    }))
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

// Product Schema
export const ProductSchema = ({ product }) => {
  if (!product) return null;

  const category = (product.category || '').toLowerCase();
  const productUrl = `${BASE_URL}/products/${category}/${product._id}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": Array.isArray(product.description) 
      ? product.description.join(' ') 
      : product.description,
    "image": product.image?.[0] || '',
    "sku": product._id,
    "brand": {
      "@type": "Brand",
      "name": "Elite Surfing"
    },
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "EUR",
      "price": product.offerPrice || product.price,
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "availability": product.inStock 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Elite Surfing Portugal"
      }
    }
  };

  // Adicionar ratings se disponíveis
  if (product.averageRating && product.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.averageRating,
      "reviewCount": product.reviewCount,
      "bestRating": 5,
      "worstRating": 1
    };
  }

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

// BreadcrumbList Schema
export const BreadcrumbSchema = ({ items }) => {
  if (!items || items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url ? `${BASE_URL}${item.url}` : undefined
    }))
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

// FAQPage Schema
export const FAQSchema = ({ faqs }) => {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

// LocalBusiness Schema
export const LocalBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Elite Surfing Portugal",
    "image": `${BASE_URL}/og-image.jpg`,
    "url": BASE_URL,
    "telephone": "+351912164220",
    "email": "pedrazzoliorlando@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Avenida Doutor Francisco de Sá Carneiro 3, Apartamento 3D",
      "addressLocality": "Oeiras",
      "postalCode": "2780-241",
      "addressCountry": "PT"
    },
    "priceRange": "€€",
    "paymentAccepted": ["Cash", "Credit Card", "Multibanco", "MB Way"],
    "currenciesAccepted": "EUR"
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};