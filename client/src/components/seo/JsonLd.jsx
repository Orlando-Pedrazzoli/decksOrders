// Organization Schema
export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Elite Surfing Portugal",
    "alternateName": "Elite Surfing",
    "url": "https://elitesurfing.pt",
    "logo": "https://elitesurfing.pt/logo.png",
    "image": "https://elitesurfing.pt/og-image.jpg",
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
    "url": "https://elitesurfing.pt",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://elitesurfing.pt/products?search={search_term_string}"
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
      "url": `https://elitesurfing.pt/products/${product.category?.toLowerCase()}/${product._id}`,
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

  // Add aggregate rating if reviews exist
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
      "item": item.url ? `https://elitesurfing.pt${item.url}` : undefined
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

// LocalBusiness Schema (for contact page)
export const LocalBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Elite Surfing Portugal",
    "image": "https://elitesurfing.pt/og-image.jpg",
    "url": "https://elitesurfing.pt",
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