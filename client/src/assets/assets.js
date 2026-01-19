import logo from './logo.svg';
import logo_es from './logoes.png';
import search_icon from './search_icon.svg';
import remove_icon from './remove_icon.svg';
import arrow_right_icon_colored from './arrow_right_icon_colored.svg';
import star_icon from './star_icon.svg';
import star_dull_icon from './star_dull_icon.svg';
import cart_icon from './cart_icon.svg';
import nav_cart_icon from './nav_cart_icon.svg';
import add_icon from './add_icon.svg';
import refresh_icon from './refresh_icon.svg';
import arrow_right from './arrow_right.svg';
import arrow_left from './arrow_left.svg';
import arrow_up from './arrow_up.svg';
import arrow_down from './arrow_down.svg';
import product_list_icon from './product_list_icon.svg';
import order_icon from './order_icon.svg';
import upload_area from './upload_area.png';
import profile_icon from './profile_icon.png';
import menu_icon from './menu_icon.svg';
import delivery_truck_icon from './delivery_truck_icon.svg';
import leaf_icon from './leaf_icon.svg';
import coin_icon from './coin_icon.svg';
import box_icon from './box_icon.svg';
import trust_icon from './trust_icon.svg';
import empty_cart from './empty_cart.svg';
import black_arrow_icon from './black_arrow_icon.svg';
import white_arrow_icon from './white_arrow_icon.svg';
import add_address_iamge from './add_address_image.svg';
import deck_noronha from './noronhastroke.png';
import deck_saquarema from './SAQUAREMA.png';
import deck_Jbay from './J-BAY.png';
import deck_tahiti from './tahiti.png';
import deck_hawaii_grom from './hawaii-grom.png';
import deck_fiji_classic from './fiji-classic.png';
import fuwaxImg from './fuwax.jpg';

export const assets = {
  logo,
  logo_es,
  search_icon,
  remove_icon,
  arrow_right_icon_colored,
  star_icon,
  star_dull_icon,
  cart_icon,
  nav_cart_icon,
  add_icon,
  refresh_icon,
  product_list_icon,
  order_icon,
  upload_area,
  profile_icon,
  menu_icon,
  delivery_truck_icon,
  leaf_icon,
  coin_icon,
  trust_icon,
  black_arrow_icon,
  white_arrow_icon,
  add_address_iamge,
  box_icon,
  deck_Jbay,
  deck_saquarema,
  deck_hawaii_grom,
  deck_fiji_classic,
  deck_tahiti,
  arrow_right,
  arrow_left,
  arrow_up,
  arrow_down,
  fuwaxImg,
  empty_cart,
};

// ═══════════════════════════════════════════════════════════════════
// 🆕 GROUPS - Coleções principais (aparecem no CollectionsGrid)
// ═══════════════════════════════════════════════════════════════════
export const groups = [
  {
    id: 'decks',
    name: 'Decks',
    slug: 'decks',
    description: 'Traction pads de alta performance para todas as condições. Tecnologia EVA premium com texturas que garantem aderência máxima.',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1920&q=80',
  },
  {
    id: 'leashes',
    name: 'Leashes',
    slug: 'leashes',
    description: 'Leashes premium para máxima segurança e durabilidade. Construídos para suportar as condições mais exigentes.',
    image: 'https://images.unsplash.com/photo-1455264745730-cb3b76250ae8?w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1455264745730-cb3b76250ae8?w=1920&q=80',
  },
  {
    id: 'capas',
    name: 'Capas',
    slug: 'capas',
    description: 'Protege a tua prancha com as nossas capas de qualidade. Materiais resistentes e designs funcionais.',
    image: 'https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=1920&q=80',
  },
  {
    id: 'wax',
    name: 'Wax',
    slug: 'wax',
    description: 'Wax premium para o grip perfeito em qualquer temperatura. Fórmulas específicas para águas frias, temperadas e tropicais.',
    image: 'https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=1920&q=80',
  },
];

// ═══════════════════════════════════════════════════════════════════
// 🎯 CATEGORIES - Agora com campo 'group' para organização
// ═══════════════════════════════════════════════════════════════════
export const categories = [
  // ═══ DECKS ═══
  {
    text: 'Deck J-Bay',
    path: 'Deck-J-Bay',
    image: deck_Jbay,
    bgColor: '#FEF6DA',
    group: 'decks',  // 🆕
  },
  {
    text: 'Deck Fiji Classic',
    path: 'Deck-Fiji-Classic',
    image: deck_fiji_classic,
    bgColor: '#FEE0E0',
    group: 'decks',  // 🆕
  },
  {
    text: 'Deck Noronha',
    path: 'Deck-Noronha',
    image: deck_noronha,
    bgColor: '#F0F5DE',
    group: 'decks',  // 🆕
  },
  {
    text: 'Deck Saquarema',
    path: 'Deck-Saquarema',
    image: deck_saquarema,
    bgColor: '#E1F5EC',
    group: 'decks',  // 🆕
  },
  {
    text: 'Deck Hawaii Grom',
    path: 'Deck-Hawaii-Grom',
    image: deck_hawaii_grom,
    bgColor: '#FEE6CD',
    group: 'decks',  // 🆕
  },
  {
    text: 'Deck Tahiti',
    path: 'Deck-Tahiti',
    image: deck_tahiti,
    bgColor: '#E0F6FE',
    group: 'decks',  // 🆕
  },
  
  // ═══ WAX ═══
  {
    text: 'Fu Wax Cool',
    path: 'Fuwax-Cool',
    image: fuwaxImg,
    bgColor: '#E0F6FE',
    group: 'wax',  // 🆕
  },
  
  // ═══ LEASHES ═══ (adicionar quando tiveres produtos)
  // {
  //   text: 'Leash 6ft Comp',
  //   path: 'Leash-6ft-Comp',
  //   image: leashImg,
  //   bgColor: '#E8F4FD',
  //   group: 'leashes',
  // },
  
  // ═══ CAPAS ═══ (adicionar quando tiveres produtos)
  // {
  //   text: 'Capa Shortboard',
  //   path: 'Capa-Shortboard',
  //   image: capaImg,
  //   bgColor: '#FDF4E8',
  //   group: 'capas',
  // },
];

// ═══════════════════════════════════════════════════════════════════
// 🛠️ HELPERS - Funções utilitárias
// ═══════════════════════════════════════════════════════════════════

/**
 * Obter categorias filtradas por grupo
 * @param {string} groupSlug - Slug do grupo (ex: 'decks')
 * @returns {Array} Categorias do grupo
 */
export const getCategoriesByGroup = (groupSlug) => {
  return categories.filter(cat => cat.group === groupSlug);
};

/**
 * Obter grupo por slug
 * @param {string} slug - Slug do grupo
 * @returns {Object|undefined} Dados do grupo
 */
export const getGroupBySlug = (slug) => {
  return groups.find(g => g.slug === slug);
};

/**
 * Obter todos os grupos que têm categorias
 * @returns {Array} Grupos com pelo menos uma categoria
 */
export const getGroupsWithCategories = () => {
  return groups.filter(group => 
    categories.some(cat => cat.group === group.slug)
  );
};

// ═══════════════════════════════════════════════════════════════════
// 📎 FOOTER LINKS
// ═══════════════════════════════════════════════════════════════════
export const footerLinks = [
  {
    title: 'Quick Links',
    links: [
      { text: 'Home', url: '#' },
      { text: 'Best Sellers', url: '#' },
      { text: 'Offers & Deals', url: '#' },
      { text: 'Contact Us', url: '#' },
      { text: 'FAQs', url: '#' },
    ],
  },
  {
    title: 'Need help?',
    links: [
      { text: 'Delivery Information', url: '#' },
      { text: 'Return & Refund Policy', url: '#' },
      { text: 'Payment Methods', url: '#' },
      { text: 'Track your Order', url: '#' },
      { text: 'Contact Us', url: '#' },
    ],
  },
  {
    title: 'Follow Us',
    links: [
      { text: 'Instagram', url: '#' },
      { text: 'Twitter', url: '#' },
      { text: 'Facebook', url: '#' },
      { text: 'YouTube', url: '#' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// ⭐ FEATURES
// ═══════════════════════════════════════════════════════════════════
export const features = [
  {
    icon: delivery_truck_icon,
    title: 'Fastest Delivery',
    description: 'Groceries delivered in under 30 minutes.',
  },
  {
    icon: leaf_icon,
    title: 'Freshness Guaranteed',
    description: 'Fresh produce straight from the source.',
  },
  {
    icon: coin_icon,
    title: 'Affordable Prices',
    description: 'Quality groceries at unbeatable prices.',
  },
  {
    icon: trust_icon,
    title: 'Trusted by Thousands',
    description: 'Loved by 10,000+ happy customers.',
  },
];