/**
 * SEO Configuration - Elite Surfing Portugal
 * 
 * REGRAS:
 * 1. URLs SEM trailing slash (exceto homepage que usa '')
 * 2. URLs devem ser idênticas às do sitemap.xml
 * 3. Descrições entre 120-160 caracteres para melhor exibição no Google
 * 
 * Última atualização: 2026-01-26
 */

const seoConfig = {
  home: {
    title: null, // Usa título padrão
    description: 'Loja online de equipamento de surf em Portugal. Decks, leashes, quilhas, capas, wax e acessórios de surf. Entregas em Portugal Continental. Qualidade e preços competitivos.',
    url: '' // Homepage - será convertido para https://www.elitesurfing.pt
  },
  products: {
    title: 'Todos os Produtos',
    description: 'Descubra a nossa coleção completa de equipamento de surf. Decks de tracção, leashes, quilhas, capas para prancha, wax e acessórios. Envio rápido para todo Portugal.',
    url: '/products'
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
    url: '/contact'
  },
  faq: {
    title: 'Perguntas Frequentes',
    description: 'Encontre respostas para as perguntas mais frequentes sobre compras, envios, devoluções e produtos na Elite Surfing Portugal.',
    url: '/faq'
  },
  privacy: {
    title: 'Política de Privacidade',
    description: 'Política de privacidade da Elite Surfing Portugal. Saiba como protegemos os seus dados pessoais e informações de pagamento.',
    url: '/privacy'
  },
  terms: {
    title: 'Termos e Condições',
    description: 'Termos e condições de utilização da loja online Elite Surfing Portugal. Informações sobre compras, envios, garantias e devoluções.',
    url: '/terms'
  },
  refund: {
    title: 'Política de Reembolso',
    description: 'Política de reembolso e devoluções da Elite Surfing Portugal. Conheça os seus direitos, prazos e o processo de devolução de produtos.',
    url: '/refund-policy'
  },
  myOrders: {
    title: 'Os Meus Pedidos',
    description: 'Consulte o histórico dos seus pedidos na Elite Surfing Portugal.',
    url: '/my-orders',
    noindex: true // Página privada - não indexar
  },
  addAddress: {
    title: 'Adicionar Morada',
    description: 'Adicione uma nova morada de entrega na Elite Surfing Portugal.',
    url: '/add-address',
    noindex: true // Página privada - não indexar
  },
  writeReview: {
    title: 'Escrever Review',
    description: 'Partilhe a sua opinião sobre os produtos Elite Surfing Portugal.',
    url: '/write-review',
    noindex: true // Página privada - não indexar
  },
  orderSuccess: {
    title: 'Encomenda Confirmada',
    description: 'A sua encomenda foi confirmada com sucesso na Elite Surfing Portugal.',
    url: '/order-success',
    noindex: true // Página privada - não indexar
  }
};

/**
 * Descrições SEO para páginas de COLLECTIONS (grupos principais)
 * Estas são as páginas de categoria de alto nível: /collections/decks, etc.
 */
export const collectionDescriptions = {
  'decks': {
    title: 'Decks de Surf - Traction Pads',
    description: 'Decks de tracção de alta qualidade para surf. Traction pads em E.V.A premium com diversas texturas e cores. Modelos Tahiti, Hawaii, Saquarema, Noronha, Fiji e J-Bay.',
    url: '/collections/decks',
    keywords: ['decks surf', 'traction pad', 'grip surf', 'pad prancha']
  },
  'leashes': {
    title: 'Leashes de Surf',
    description: 'Leashes de surf premium para máxima segurança e durabilidade. Vários tamanhos disponíveis: 6ft, 7ft e 8ft. Construídos para suportar as condições mais exigentes.',
    url: '/collections/leashes',
    keywords: ['leash surf', 'amarração prancha', 'leash 6ft', 'leash 7ft']
  },
  'capas': {
    title: 'Capas para Prancha de Surf',
    description: 'Capas de protecção para pranchas de surf. Modelos para shortboard, fish e híbridas. Materiais resistentes e designs funcionais para proteger a tua prancha.',
    url: '/collections/capas',
    keywords: ['capa prancha surf', 'boardbag', 'proteção prancha']
  },
  'wax': {
    title: 'Wax para Surf - Parafina',
    description: 'Wax e parafina premium para surf. Fu Wax Cool Water para águas entre 11°C e 17°C. Utilizada por surfistas profissionais. Alto desempenho garantido.',
    url: '/collections/wax',
    keywords: ['wax surf', 'parafina surf', 'fu wax', 'cera prancha']
  }
};

/**
 * Descrições SEO para páginas de SUBCATEGORIAS (modelos específicos)
 * Slug DEVE corresponder ao usado nas rotas e no sitemap
 */
export const categoryDescriptions = {
  'deck-tahiti': {
    title: 'Deck Tahiti - Decks de Tracção',
    description: 'Decks Tahiti de alta qualidade com E.V.A fresado em ângulo diamantado. Peça única com kicktail de 26mm. Várias cores disponíveis. Envio rápido para Portugal.',
    url: '/products/deck-tahiti'
  },
  'deck-hawaii-grom': {
    title: 'Deck Hawaii Grom - Decks de Surf',
    description: 'Decks Hawaii Grom em 3 partes com E.V.A fresado em ângulo diamantado. Kicktail de 26mm e fita adesiva alemã. Ideal para groms e surfistas de todos os níveis.',
    url: '/products/deck-hawaii-grom'
  },
  'deck-saquarema': {
    title: 'Deck Saquarema - Decks Premium',
    description: 'Decks Saquarema com EVA lixado e fresa dupla (Double Square Groove). 3 partes, barra central super soft e kicktail rígido de 25mm. Fita adesiva 3M.',
    url: '/products/deck-saquarema'
  },
  'deck-noronha': {
    title: 'Deck Noronha - Decks de Tracção',
    description: 'Decks Noronha com EVA lixado e fresa dupla em formato de quadrados. Barra central super soft com detalhes CNC. Várias cores disponíveis.',
    url: '/products/deck-noronha'
  },
  'deck-fiji-classic': {
    title: 'Deck Fiji Classic - Decks Clássicos',
    description: 'Decks Fiji Classic em 3 partes com E.V.A fresado em ângulo diamantado. Design clássico com várias combinações de cores. Kicktail de 26mm.',
    url: '/products/deck-fiji-classic'
  },
  'deck-j-bay': {
    title: 'Deck J-Bay - Decks de Surf',
    description: 'Decks J-Bay em 3 partes com E.V.A fresado em ângulo diamantado. Inspirados na famosa onda sul-africana. Várias cores e combinações disponíveis.',
    url: '/products/deck-j-bay'
  },
  'fuwax-cool': {
    title: 'Fu Wax Cool - Parafina para Surf',
    description: 'Parafina Fu Wax Cool Water para águas entre 11°C e 17°C. Utilizada por surfistas profissionais como Kelly Slater e Gabriel Medina. Alto desempenho garantido.',
    url: '/products/fuwax-cool'
  }
};

/**
 * Helper: Obter configuração SEO para uma collection (grupo)
 */
export const getCollectionSEO = (collectionSlug) => {
  const slug = (collectionSlug || '').toLowerCase();
  return collectionDescriptions[slug] || {
    title: `${collectionSlug} - Elite Surfing Portugal`,
    description: `Coleção ${collectionSlug} na Elite Surfing Portugal. Equipamento de surf de alta qualidade com envio para todo Portugal.`,
    url: `/collections/${slug}`
  };
};

/**
 * Helper: Obter configuração SEO para uma categoria (subcategoria)
 */
export const getCategorySEO = (categorySlug) => {
  const slug = (categorySlug || '').toLowerCase();
  return categoryDescriptions[slug] || {
    title: `${categorySlug} - Elite Surfing Portugal`,
    description: `Produtos ${categorySlug} na Elite Surfing Portugal. Equipamento de surf de alta qualidade com envio para todo Portugal.`,
    url: `/products/${slug}`
  };
};

export default seoConfig;