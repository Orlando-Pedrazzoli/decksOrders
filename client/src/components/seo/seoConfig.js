// Configuração SEO centralizada para todas as páginas estáticas
const seoConfig = {
  home: {
    title: null, // Usa título padrão
    description: 'Loja online de equipamento de surf em Portugal. Decks, leashes, quilhas, capas, wax e acessórios de surf. Entregas em Portugal Continental. Qualidade e preços competitivos.',
    url: '/'
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
    noindex: true
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
    description: 'Política de privacidade da Elite Surfing Portugal. Saiba como protegemos os seus dados pessoais.',
    url: '/privacy'
  },
  terms: {
    title: 'Termos e Condições',
    description: 'Termos e condições de utilização da loja online Elite Surfing Portugal. Informações sobre compras, envios e devoluções.',
    url: '/terms'
  },
  refund: {
    title: 'Política de Reembolso',
    description: 'Política de reembolso e devoluções da Elite Surfing Portugal. Conheça os seus direitos e o processo de devolução.',
    url: '/refund-policy'
  },
  myOrders: {
    title: 'Os Meus Pedidos',
    description: 'Consulte o histórico dos seus pedidos na Elite Surfing Portugal.',
    url: '/my-orders',
    noindex: true
  }
};

// Descrições por categoria
export const categoryDescriptions = {
  deck: {
    title: 'Decks de Tracção para Surf',
    description: 'Decks e grips de tracção para prancha de surf. Maior aderência e conforto. Várias cores e designs disponíveis.'
  },
  leash: {
    title: 'Leashes para Surf',
    description: 'Leashes e amarras de qualidade para prancha de surf. Diferentes tamanhos para ondas pequenas a grandes.'
  },
  quilhas: {
    title: 'Quilhas e Fins para Surf',
    description: 'Quilhas e fins para todos os tipos de prancha. FCS, Futures e outros sistemas. Melhore a performance da sua prancha.'
  },
  fins: {
    title: 'Quilhas e Fins para Surf',
    description: 'Quilhas e fins para todos os tipos de prancha. FCS, Futures e outros sistemas. Melhore a performance da sua prancha.'
  },
  capas: {
    title: 'Capas para Prancha de Surf',
    description: 'Capas protetoras para prancha de surf. Proteção contra sol, riscos e impactos. Vários tamanhos disponíveis.'
  },
  wax: {
    title: 'Wax para Surf',
    description: 'Wax e parafina para prancha de surf. Diferentes temperaturas de água. Maior aderência garantida.'
  },
  acessorios: {
    title: 'Acessórios de Surf',
    description: 'Acessórios diversos para surf. Ferramentas, racks, protetores e muito mais para o surfista.'
  },
  acessórios: {
    title: 'Acessórios de Surf',
    description: 'Acessórios diversos para surf. Ferramentas, racks, protetores e muito mais para o surfista.'
  }
};

export default seoConfig;