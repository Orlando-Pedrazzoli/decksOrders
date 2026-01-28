/**
 * SEO Configuration - Elite Surfing Portugal
 * Versão: 2.0.0
 * Última atualização: 2026-01-28
 * 
 * REGRAS:
 * 1. URLs SEM trailing slash (exceto homepage que usa '')
 * 2. URLs devem ser idênticas às do sitemap.xml
 * 3. Descrições entre 120-160 caracteres para melhor exibição no Google
 * 4. Títulos máximo 60 caracteres
 */

const BASE_URL = 'https://www.elitesurfing.pt';

/**
 * Configuração SEO para páginas estáticas
 */
const seoConfig = {
  home: {
    title: null, // Usa título padrão do SEO.jsx
    description: 'Loja online de equipamento de surf em Portugal. Decks, leashes, quilhas, capas, wax e acessórios de surf. Entregas em Portugal Continental. Qualidade e preços competitivos.',
    url: '', // Homepage - será convertido para https://www.elitesurfing.pt
    keywords: ['surf', 'loja surf portugal', 'acessórios surf', 'decks', 'leashes']
  },
  
  products: {
    title: 'Todos os Produtos',
    description: 'Descubra a nossa coleção completa de equipamento de surf. Decks de tracção, leashes, quilhas, capas para prancha, wax e acessórios. Envio rápido para todo Portugal.',
    url: '/products',
    keywords: ['produtos surf', 'equipamento surf', 'comprar surf portugal']
  },
  
  cart: {
    title: 'Carrinho de Compras',
    description: 'O seu carrinho de compras na Elite Surfing Portugal. Finalize a sua encomenda de equipamento de surf.',
    url: '/cart',
    noindex: true // Página privada - não indexar
  },
  
  contact: {
    title: 'Contacto',
    description: 'Entre em contacto com a Elite Surfing Portugal. Atendimento por WhatsApp, email ou telefone. Estamos disponíveis para ajudar com as suas dúvidas sobre equipamento de surf.',
    url: '/contact',
    keywords: ['contacto', 'elite surfing contacto', 'loja surf portugal contacto']
  },
  
  faq: {
    title: 'Perguntas Frequentes',
    description: 'Encontre respostas para as perguntas mais frequentes sobre compras, envios, devoluções e produtos na Elite Surfing Portugal.',
    url: '/faq',
    keywords: ['faq', 'perguntas frequentes', 'ajuda', 'dúvidas']
  },
  
  privacy: {
    title: 'Política de Privacidade',
    description: 'Política de privacidade da Elite Surfing Portugal. Saiba como protegemos os seus dados pessoais e informações de pagamento.',
    url: '/privacy',
    noindex: false
  },
  
  terms: {
    title: 'Termos e Condições',
    description: 'Termos e condições de utilização da loja online Elite Surfing Portugal. Informações sobre compras, envios, garantias e devoluções.',
    url: '/terms',
    noindex: false
  },
  
  refund: {
    title: 'Política de Reembolso',
    description: 'Política de reembolso e devoluções da Elite Surfing Portugal. Conheça os seus direitos, prazos e o processo de devolução de produtos.',
    url: '/refund-policy',
    noindex: false
  },
  
  // Páginas privadas - não indexar
  myOrders: {
    title: 'Os Meus Pedidos',
    description: 'Consulte o histórico dos seus pedidos na Elite Surfing Portugal.',
    url: '/my-orders',
    noindex: true
  },
  
  addAddress: {
    title: 'Adicionar Morada',
    description: 'Adicione uma nova morada de entrega na Elite Surfing Portugal.',
    url: '/add-address',
    noindex: true
  },
  
  writeReview: {
    title: 'Escrever Review',
    description: 'Partilhe a sua opinião sobre os produtos Elite Surfing Portugal.',
    url: '/write-review',
    noindex: true
  },
  
  orderSuccess: {
    title: 'Encomenda Confirmada',
    description: 'A sua encomenda foi confirmada com sucesso na Elite Surfing Portugal.',
    url: '/order-success',
    noindex: true
  }
};

/**
 * Descrições SEO para páginas de COLLECTIONS (grupos principais)
 * Rotas: /collections/{slug}
 * Estas são as páginas de categoria de alto nível
 */
export const collectionDescriptions = {
  'decks': {
    title: 'Decks de Surf - Traction Pads',
    description: 'Decks de tracção de alta qualidade para surf. Traction pads em E.V.A premium com diversas texturas e cores. Modelos Tahiti, Hawaii, Saquarema, Noronha, Fiji e J-Bay.',
    url: '/collections/decks',
    keywords: ['decks surf', 'traction pad', 'grip surf', 'pad prancha'],
    image: '/og-image.jpg'
  },
  
  'leashes': {
    title: 'Leashes de Surf',
    description: 'Leashes de surf premium para máxima segurança e durabilidade. Vários tamanhos disponíveis: 6ft, 7ft e 8ft. Construídos para suportar as condições mais exigentes.',
    url: '/collections/leashes',
    keywords: ['leash surf', 'amarração prancha', 'leash 6ft', 'leash 7ft'],
    image: '/og-image.jpg'
  },
  
  'capas': {
    title: 'Capas para Prancha de Surf',
    description: 'Capas de protecção para pranchas de surf. Modelos para shortboard, fish e híbridas. Materiais resistentes e designs funcionais para proteger a tua prancha.',
    url: '/collections/capas',
    keywords: ['capa prancha surf', 'boardbag', 'proteção prancha'],
    image: '/og-image.jpg'
  },
  
  'wax': {
    title: 'Wax para Surf - Parafina',
    description: 'Wax e parafina premium para surf. Fu Wax Cool Water para águas entre 11°C e 17°C. Utilizada por surfistas profissionais. Alto desempenho garantido.',
    url: '/collections/wax',
    keywords: ['wax surf', 'parafina surf', 'fu wax', 'cera prancha'],
    image: '/og-image.jpg'
  }
};

/**
 * Descrições SEO para páginas de CATEGORIAS (modelos/subcategorias)
 * Rotas: /products/{slug}
 * Estas são as páginas que listam variantes de um modelo
 */
export const categoryDescriptions = {
  'deck-tahiti': {
    title: 'Deck Tahiti - Decks de Tracção',
    description: 'Decks Tahiti de alta qualidade com E.V.A fresado em ângulo diamantado. Peça única com kicktail de 26mm. Várias cores disponíveis. Envio rápido para Portugal.',
    url: '/products/deck-tahiti',
    keywords: ['deck tahiti', 'deck surf tahiti', 'traction pad tahiti']
  },
  
  'deck-hawaii-grom': {
    title: 'Deck Hawaii Grom - Decks de Surf',
    description: 'Decks Hawaii Grom em 3 partes com E.V.A fresado em ângulo diamantado. Kicktail de 26mm e fita adesiva alemã. Ideal para groms e surfistas de todos os níveis.',
    url: '/products/deck-hawaii-grom',
    keywords: ['deck hawaii grom', 'deck grom', 'deck surf criança']
  },
  
  'deck-saquarema': {
    title: 'Deck Saquarema - Decks Premium',
    description: 'Decks Saquarema com EVA lixado e fresa dupla (Double Square Groove). 3 partes, barra central super soft e kicktail rígido de 25mm. Fita adesiva 3M.',
    url: '/products/deck-saquarema',
    keywords: ['deck saquarema', 'deck premium', 'deck 3m']
  },
  
  'deck-noronha': {
    title: 'Deck Noronha - Decks de Tracção',
    description: 'Decks Noronha com EVA lixado e fresa dupla em formato de quadrados. Barra central super soft com detalhes CNC. Várias cores disponíveis.',
    url: '/products/deck-noronha',
    keywords: ['deck noronha', 'deck cnc', 'deck eva lixado']
  },
  
  'deck-fiji-classic': {
    title: 'Deck Fiji Classic - Decks Clássicos',
    description: 'Decks Fiji Classic em 3 partes com E.V.A fresado em ângulo diamantado. Design clássico com várias combinações de cores. Kicktail de 26mm.',
    url: '/products/deck-fiji-classic',
    keywords: ['deck fiji', 'deck classic', 'deck fiji classic']
  },
  
  'deck-j-bay': {
    title: 'Deck J-Bay - Decks de Surf',
    description: 'Decks J-Bay em 3 partes com E.V.A fresado em ângulo diamantado. Inspirados na famosa onda sul-africana. Várias cores e combinações disponíveis.',
    url: '/products/deck-j-bay',
    keywords: ['deck j-bay', 'deck jbay', 'deck surf j-bay']
  },
  
  'fuwax-cool': {
    title: 'Fu Wax Cool - Parafina para Surf',
    description: 'Parafina Fu Wax Cool Water para águas entre 11°C e 17°C. Utilizada por surfistas profissionais como Kelly Slater e Gabriel Medina. Alto desempenho garantido.',
    url: '/products/fuwax-cool',
    keywords: ['fu wax', 'fuwax cool', 'parafina surf', 'wax portugal']
  },
  
  // Adicionar novas categorias aqui conforme necessário
  'leash-6ft-6mm': {
    title: 'Leash 6ft 6mm - Leashes Comp',
    description: 'Leash competição 6ft com 6mm de espessura. Ideal para pranchas até 6\'6". Swivel duplo anti-torção. Material ultra-resistente.',
    url: '/products/leash-6ft-6mm',
    keywords: ['leash 6ft', 'leash comp', 'leash 6mm']
  }
};

/**
 * Helper: Obter configuração SEO para uma collection (grupo)
 * @param {string} collectionSlug - Slug da coleção (ex: 'decks')
 * @returns {object} Configuração SEO
 */
export const getCollectionSEO = (collectionSlug) => {
  const slug = (collectionSlug || '').toLowerCase().trim();
  
  if (collectionDescriptions[slug]) {
    return collectionDescriptions[slug];
  }
  
  // Fallback para coleções não definidas
  const formattedName = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `${formattedName} - Elite Surfing Portugal`,
    description: `Coleção ${formattedName} na Elite Surfing Portugal. Equipamento de surf de alta qualidade com envio rápido para todo Portugal.`,
    url: `/collections/${slug}`,
    keywords: [slug, 'surf', 'portugal']
  };
};

/**
 * Helper: Obter configuração SEO para uma categoria (subcategoria/modelo)
 * @param {string} categorySlug - Slug da categoria (ex: 'deck-tahiti')
 * @returns {object} Configuração SEO
 */
export const getCategorySEO = (categorySlug) => {
  const slug = (categorySlug || '').toLowerCase().trim();
  
  if (categoryDescriptions[slug]) {
    return categoryDescriptions[slug];
  }
  
  // Fallback para categorias não definidas
  const formattedName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  return {
    title: `${formattedName} - Elite Surfing Portugal`,
    description: `Produtos ${formattedName} na Elite Surfing Portugal. Equipamento de surf de alta qualidade com envio rápido para todo Portugal.`,
    url: `/products/${slug}`,
    keywords: [slug, 'surf', 'portugal']
  };
};

/**
 * Helper: Gerar meta tags para produto individual
 * @param {object} product - Objeto do produto
 * @returns {object} Configuração SEO
 */
export const getProductSEO = (product) => {
  if (!product) return seoConfig.products;
  
  const category = (product.category || '').toLowerCase();
  const price = product.offerPrice || product.price;
  
  return {
    title: product.name,
    description: `${product.name} - €${price}. ${Array.isArray(product.description) ? product.description[0] : (product.description || '')}`.slice(0, 155),
    url: `/products/${category}/${product._id}`,
    image: product.image?.[0] || '/og-image.jpg',
    type: 'product',
    product: {
      price: price,
      inStock: product.inStock
    }
  };
};

export default seoConfig;