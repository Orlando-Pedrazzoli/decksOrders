// Organization Schema
export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Elite Surfing Portugal",
    "alternateName": "Elite Surfing",
    "url": "https://www.elitesurfing.pt",
    "logo": "https://www.elitesurfing.pt/logo.png",
    "image": "https://www.elitesurfing.pt/og-image.jpg",
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
    "url": "https://www.elitesurfing.pt",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.elitesurfing.pt/products?search={search_term_string}"
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
    { name: "Produtos", url: "https://www.elitesurfing.pt/products" },
    { name: "Deck Tahiti", url: "https://www.elitesurfing.pt/products/deck-tahiti" },
    { name: "Deck Saquarema", url: "https://www.elitesurfing.pt/products/deck-saquarema" },
    { name: "Deck Noronha", url: "https://www.elitesurfing.pt/products/deck-noronha" },
    { name: "Deck Fiji Classic", url: "https://www.elitesurfing.pt/products/deck-fiji-classic" },
    { name: "Deck J-Bay", url: "https://www.elitesurfing.pt/products/deck-j-bay" },
    { name: "Contacto", url: "https://www.elitesurfing.pt/contact" },
    { name: "FAQ", url: "https://www.elitesurfing.pt/faq" }
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": navigationItems.map((item, index) => ({
      "@type": "SiteNavigationElement",
      "position": index + 1,
      "name": item.name,
      "url": item.url
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
      "url": `https://www.elitesurfing.pt/products/${product.category?.toLowerCase()}/${product._id}`,
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

  if (product.averageRating && product.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.averageRating,
      "reviewCount": product.reviewCount
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
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url ? `https://www.elitesurfing.pt${item.url}` : undefined
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
    "image": "https://www.elitesurfing.pt/og-image.jpg",
    "url": "https://www.elitesurfing.pt",
    "telephone": "+351912164220",
    "email": "pedrazzoliorlando@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Avenida Doutor Francisco de Sá Carneiro 3, Apartamento 3D",
      "addressLocality": "Oeiras",
      "postalCode": "2780-241",
      "addressCountry": "PT"
    },
    "priceRange": "€€"
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};