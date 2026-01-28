/**
 * SEO Components - Elite Surfing Portugal
 * Versão: 2.0.0
 * Última atualização: 2026-01-28
 * 
 * Exporta todos os componentes e utilitários de SEO
 */

// Componente principal de meta tags
export { default as SEO } from './SEO';

// Schemas JSON-LD (Structured Data)
export { 
  OrganizationSchema, 
  WebSiteSchema, 
  SiteNavigationSchema,
  ProductSchema, 
  BreadcrumbSchema, 
  FAQSchema,
  LocalBusinessSchema,
  CollectionSchema,      // NOVO
  ContactPageSchema      // NOVO
} from './JsonLd';

// Configurações e helpers
export { 
  default as seoConfig, 
  categoryDescriptions, 
  collectionDescriptions,
  getCategorySEO,
  getCollectionSEO
} from './seoConfig';