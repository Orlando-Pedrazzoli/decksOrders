// SEO Components - Elite Surfing Portugal
export { default as SEO } from './SEO';
export { 
  OrganizationSchema, 
  WebSiteSchema, 
  SiteNavigationSchema,
  ProductSchema, 
  BreadcrumbSchema, 
  FAQSchema,
  LocalBusinessSchema 
} from './JsonLd';
export { 
  default as seoConfig, 
  categoryDescriptions, 
  collectionDescriptions,  // NOVO
  getCategorySEO,
  getCollectionSEO         // NOVO
} from './seoConfig';