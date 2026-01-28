/**
 * JSON-LD Structured Data - Elite Surfing Portugal
 * Versão: 2.0.0
 * Última atualização: 2026-01-28
 * 
 * IMPORTANTE: Todas as URLs devem usar www.elitesurfing.pt
 * Referência: https://schema.org/
 * Teste: https://search.google.com/test/rich-results
 */

const BASE_URL = 'https://www.elitesurfing.pt';
const SITE_NAME = 'Elite Surfing Portugal';
const LOGO_URL = `${BASE_URL}/logo.png`;
const OG_IMAGE = `${BASE_URL}/og-image.jpg`;

// =====================================================
// Organization Schema
// =====================================================
export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    "name": SITE_NAME,
    "alternateName": ["Elite Surfing", "Elite Surfing PT"],
    "url": BASE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": LOGO_URL,
      "width": 512,
      "height": 512
    },
    "image": OG_IMAGE,
    "description": "Loja online de equipamento e acessórios de surf em Portugal. Decks, leashes, quilhas, capas, wax e muito mais.",
    "foundingDate": "2023",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Avenida Doutor Francisco de Sá Carneiro 3, Apartamento 3D",
      "addressLocality": "Oeiras",
      "addressRegion": "Lisboa",
      "postalCode": "2780-241",
      "addressCountry": "PT"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 38.6979,
      "longitude": -9.3107
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+351-912-164-220",
        "contactType": "customer service",
        "availableLanguage": ["Portuguese", "English"],
        "areaServed": "PT"
      },
      {
        "@type": "ContactPoint",
        "telephone": "+351-912-164-220",
        "contactType": "sales",
        "availableLanguage": ["Portuguese", "English"],
        "areaServed": "PT"
      }
    ],
    "sameAs": [
      "https://wa.me/351912164220"
      // Adicionar URLs de redes sociais quando existirem:
      // "https://www.facebook.com/elitesurfingpt",
      // "https://www.instagram.com/elitesurfingpt"
    ]
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};

// =====================================================
// WebSite Schema with SearchAction
// =====================================================
export const WebSiteSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    "name": SITE_NAME,
    "alternateName": "Elite Surfing",
    "url": BASE_URL,
    "description": "Loja online de equipamento de surf em Portugal",
    "inLanguage": "pt-PT",
    "publisher": {
      "@id": `${BASE_URL}/#organization`
    },
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
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};

// =====================================================
// SiteNavigationElement Schema - Define os sitelinks
// =====================================================
export const SiteNavigationSchema = () => {
  const navigationItems = [
    { name: "Produtos", url: "/products" },
    { name: "Decks", url: "/collections/decks" },
    { name: "Leashes", url: "/collections/leashes" },
    { name: "Capas", url: "/collections/capas" },
    { name: "Wax", url: "/collections/wax" },
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
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};

// =====================================================
// Product Schema - Para páginas de produto
// =====================================================
export const ProductSchema = ({ product }) => {
  if (!product) return null;

  const category = (product.category || '').toLowerCase();
  const productUrl = `${BASE_URL}/products/${category}/${product._id}`;
  
  // Data de validade do preço (1 ano)
  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    "name": product.name,
    "description": Array.isArray(product.description) 
      ? product.description.join(' ') 
      : (product.description || ''),
    "image": product.image || [],
    "sku": product._id,
    "mpn": product.sku || product._id, // Manufacturer Part Number
    "brand": {
      "@type": "Brand",
      "name": "Elite Surfing"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "Elite Surfing Portugal"
    },
    "category": product.category || "Surf Accessories",
    "material": product.material || undefined,
    "color": product.color || undefined,
    "offers": {
      "@type": "Offer",
      "@id": `${productUrl}#offer`,
      "url": productUrl,
      "priceCurrency": "EUR",
      "price": product.offerPrice || product.price,
      "priceValidUntil": priceValidUntil.toISOString().split('T')[0],
      "availability": product.inStock 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": SITE_NAME,
        "@id": `${BASE_URL}/#organization`
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "PT"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "businessDays": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
          },
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 2,
            "unitCode": "d"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 3,
            "unitCode": "d"
          }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 14,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      }
    }
  };

  // Adicionar GTIN se disponível (código de barras)
  if (product.gtin || product.barcode || product.ean) {
    schema.gtin13 = product.gtin || product.barcode || product.ean;
  }

  // Adicionar ratings se disponíveis
  if (product.averageRating && product.reviewCount && product.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.averageRating.toFixed(1),
      "reviewCount": product.reviewCount,
      "bestRating": 5,
      "worstRating": 1
    };
  }

  // Adicionar reviews se disponíveis
  if (product.reviews && product.reviews.length > 0) {
    schema.review = product.reviews.slice(0, 5).map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5,
        "worstRating": 1
      },
      "author": {
        "@type": "Person",
        "name": review.userName || "Cliente"
      },
      "reviewBody": review.comment || review.title,
      "datePublished": review.createdAt ? new Date(review.createdAt).toISOString().split('T')[0] : undefined
    }));
  }

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};

// =====================================================
// BreadcrumbList Schema
// =====================================================
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
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};

// =====================================================
// FAQPage Schema
// =====================================================
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
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};

// =====================================================
// LocalBusiness / Store Schema
// =====================================================
export const LocalBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${BASE_URL}/#store`,
    "name": SITE_NAME,
    "image": OG_IMAGE,
    "url": BASE_URL,
    "telephone": "+351912164220",
    "email": "pedrazzoliorlando@gmail.com",
    "description": "Loja online de equipamento e acessórios de surf em Portugal",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Avenida Doutor Francisco de Sá Carneiro 3, Apartamento 3D",
      "addressLocality": "Oeiras",
      "addressRegion": "Lisboa",
      "postalCode": "2780-241",
      "addressCountry": "PT"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 38.6979,
      "longitude": -9.3107
    },
    "priceRange": "€€",
    "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Multibanco", "MB Way"],
    "currenciesAccepted": "EUR",
    "areaServed": {
      "@type": "Country",
      "name": "Portugal"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Produtos de Surf",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Decks",
          "itemListElement": {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Decks de Surf"
            }
          }
        },
        {
          "@type": "OfferCatalog",
          "name": "Leashes",
          "itemListElement": {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Leashes de Surf"
            }
          }
        }
      ]
    }
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};

// =====================================================
// CollectionPage Schema - Para páginas de coleção
// =====================================================
export const CollectionSchema = ({ collection, products = [] }) => {
  if (!collection) return null;

  const collectionUrl = `${BASE_URL}/collections/${collection.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${collectionUrl}#collection`,
    "name": collection.name,
    "description": collection.description,
    "url": collectionUrl,
    "isPartOf": {
      "@id": `${BASE_URL}/#website`
    },
    "about": {
      "@type": "Thing",
      "name": collection.name
    },
    "numberOfItems": products.length,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${BASE_URL}/products/${(product.category || '').toLowerCase()}/${product._id}`
      }))
    }
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};

// =====================================================
// ContactPage Schema - Para página de contacto
// =====================================================
export const ContactPageSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${BASE_URL}/contact#contactpage`,
    "name": "Contacto - Elite Surfing Portugal",
    "description": "Entre em contacto com a Elite Surfing Portugal",
    "url": `${BASE_URL}/contact`,
    "mainEntity": {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`
    }
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};