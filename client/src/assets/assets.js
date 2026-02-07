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
import decks_banner from './decks-banner.jpg';
import decks_card from './decks-card1.jpg';
import decks_card2 from './decks-card2.jpg';

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
  arrow_right,
  arrow_left,
  arrow_up,
  arrow_down,
  empty_cart,
  decks_banner,
  decks_card,
  decks_card2,
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
    image: decks_card2,
    bannerImage: decks_banner,
  },
  {
    id: 'leashes',
    name: 'Leashes',
    slug: 'leashes',
    description: 'Leashes premium para máxima segurança e durabilidade. Construídos para suportar as condições mais exigentes.',
    image: decks_card,
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
// 🎯 CATEGORIES - Simplificado (apenas text, path e group)
// ═══════════════════════════════════════════════════════════════════
export const categories = [
  // ═══ DECKS ═══
  { text: 'Deck J-Bay', path: 'Deck-J-Bay', group: 'decks' },
  { text: 'Deck Fiji Classic', path: 'Deck-Fiji-Classic', group: 'decks' },
  { text: 'Deck Noronha', path: 'Deck-Noronha', group: 'decks' },
  { text: 'Deck Saquarema', path: 'Deck-Saquarema', group: 'decks' },
  { text: 'Deck Hawaii Grom', path: 'Deck-Hawaii-Grom', group: 'decks' },
  { text: 'Deck Tahiti', path: 'Deck-Tahiti', group: 'decks' },
  
  // ═══ WAX ═══
  { text: 'Fu Wax Cool', path: 'Fuwax-Cool', group: 'wax' },
  { text: 'Bull Wax Cool', path: 'Bullwax-Cool', group: 'wax' },
  
  // ═══ LEASHES ═══ (adicionar quando tiveres produtos)
   { text: 'Leash 6ft-6mm', path: 'Leash-6ft-6mm', group: 'leashes' },
   { text: 'Leash 6ft-7mm', path: 'Leash-6ft-6mm', group: 'leashes' },
   { text: 'Leash 7ft-7mm', path: 'Leash-7ft-7mm', group: 'leashes' },
   { text: 'Leash 8ft-7mm', path: 'Leash-8ft-7mm', group: 'leashes' },
  
  // ═══ CAPAS ═══ (adicionar quando tiveres produtos)
   { text: 'Capa Shortboard 5-8', path: 'Capa-Shortboard-5-8', group: 'capas' },
   { text: 'Capa Shortboard 6-0', path: 'Capa-Shortboard-6-0', group: 'capas' },
   { text: 'Capa Shortboard 6-4', path: 'Capa-Shortboard-6-4', group: 'capas' },
   { text: 'Capa Fish-Hibrid 5-8', path: 'Capa-Fish-Hibrid-5-8', group: 'capas' },
   { text: 'Capa Fish-Hibrid 6-0', path: 'Capa-Fish-Hibrid-6-0', group: 'capas' },
   { text: 'Capa Fish-Hibrid 6-4', path: 'Capa-Fish-Hibrid-6-4', group: 'capas' },
   { text: 'Capa Fish-Hibrid 6-8', path: 'Capa-Fish-Hibrid-6-8', group: 'capas' },
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