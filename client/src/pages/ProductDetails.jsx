import '../styles/ProductDetails.css';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';
import { SEO, ProductSchema, BreadcrumbSchema } from '../components/seo';
import toast from 'react-hot-toast';

// Função auxiliar para verificar se uma cor é clara
const isLightColor = (color) => {
  if (!color) return false;
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
};

const ProductDetails = () => {
  const {
    products,
    navigate,
    currency,
    addToCart,
    cartItems,
    updateCartItem,
    axios,
  } = useAppContext();
  const { id, category } = useParams();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbStartIndex, setThumbStartIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    loading: true,
  });

  // 🆕 ESTADOS PARA TRANSIÇÃO DE CORES
  const [familyProducts, setFamilyProducts] = useState([]);
  const [displayProduct, setDisplayProduct] = useState(null);
  const [isColorTransitioning, setIsColorTransitioning] = useState(false);

  // Estados para o modal
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  const modalRef = useRef(null);
  const modalImageRef = useRef(null);

  const product = products.find(item => item._id === id);

  // Atualizar displayProduct quando produto muda
  useEffect(() => {
    if (product) {
      setDisplayProduct(product);
      setIsColorTransitioning(false);
    }
  }, [product?._id]);

  // 🆕 BUSCAR PRODUTOS DA MESMA FAMÍLIA
  useEffect(() => {
    if (product?.productFamily) {
      const family = products.filter(
        p => p.productFamily === product.productFamily
      );
      setFamilyProducts(family);
    } else {
      setFamilyProducts([]);
    }
  }, [product?.productFamily, products]);

  // Stock do produto atual
  const currentStock = displayProduct?.stock || 0;
  const isInactive = currentStock === 0;

  // Imagens do produto
  const displayImages = displayProduct?.image || [];

  // Key do carrinho
  const cartKey = displayProduct?._id;
  const cartQuantity = cartItems[cartKey] || 0;

  // Reset quando muda de produto (via URL)
  useEffect(() => {
    setCurrentImageIndex(0);
    setThumbStartIndex(0);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Sincronização com cartItems
  useEffect(() => {
    if (displayProduct) {
      const qty = cartItems[cartKey] || 0;
      setQuantity(Math.max(1, qty));
    }
  }, [displayProduct, cartItems, cartKey]);

  // Buscar produtos relacionados
  useEffect(() => {
    if (product && products.length > 0) {
      const productsCopy = [...products].filter(
        item =>
          product.category === item.category &&
          item._id !== product._id &&
          item.stock > 0 &&
          (product.productFamily ? item.productFamily !== product.productFamily : true)
      );
      setRelatedProducts(productsCopy);
    }
  }, [products, product]);

  // Buscar estatísticas de reviews
  useEffect(() => {
    if (product?._id) {
      fetchReviewStats();
    }
  }, [product]);

  const fetchReviewStats = async () => {
    try {
      setReviewStats(prev => ({ ...prev, loading: true }));
      const response = await axios.get(
        `/api/reviews/product/${product._id}?page=1&limit=1`
      );
      if (response.data.success) {
        setReviewStats({
          averageRating: response.data.stats.averageRating || 0,
          totalReviews: response.data.stats.totalReviews || 0,
          loading: false,
        });
      } else {
        setReviewStats({ averageRating: 0, totalReviews: 0, loading: false });
      }
    } catch (error) {
      setReviewStats({ averageRating: 0, totalReviews: 0, loading: false });
    }
  };

  // SEO
  const generateProductDescription = (product) => {
    if (!product) return '';
    const desc = Array.isArray(product.description) 
      ? product.description[0] 
      : product.description;
    return desc?.substring(0, 155) + (desc?.length > 155 ? '...' : '') || 
      `${product.name} - Compre na Elite Surfing Portugal.`;
  };

  const getBreadcrumbs = () => {
    if (!displayProduct) return [];
    return [
      { name: 'Home', url: '/' },
      { name: 'Produtos', url: '/products' },
      { name: displayProduct.category, url: `/products/${displayProduct.category?.toLowerCase()}` },
      { name: displayProduct.name }
    ];
  };

  // 🆕 HANDLER PARA TROCAR COR COM TRANSIÇÃO FLUIDA
  const handleColorClick = (familyProductId) => {
    if (familyProductId === displayProduct?._id) return;
    
    const newProduct = familyProducts.find(p => p._id === familyProductId);
    if (!newProduct) return;

    // Iniciar transição (fade out)
    setIsColorTransitioning(true);
    
    // Após fade-out, trocar produto e atualizar URL
    setTimeout(() => {
      setDisplayProduct(newProduct);
      setCurrentImageIndex(0);
      setThumbStartIndex(0);
      setQuantity(1);
      
      // Atualizar URL sem recarregar (para SEO e compartilhamento)
      window.history.replaceState(
        null, 
        '', 
        `/products/${newProduct.category.toLowerCase()}/${familyProductId}`
      );
      
      // Fade in
      setTimeout(() => {
        setIsColorTransitioning(false);
      }, 50);
    }, 200);
  };

  // Modal handlers
  const openModal = useCallback(
    index => {
      if (isInactive) return;
      setModalImageIndex(index || currentImageIndex);
      setIsModalOpen(true);
      setIsZoomed(false);
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    },
    [currentImageIndex, isInactive]
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    document.body.style.overflow = 'auto';
  }, []);

  // Quantidade handlers
  const increaseQuantity = () => {
    if (isInactive) return;
    if (quantity < currentStock) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      if (cartQuantity > 0) {
        updateCartItem(cartKey, newQuantity);
      }
    } else {
      toast.error(`Apenas ${currentStock} unidade(s) disponível(eis)`);
    }
  };

  const decreaseQuantity = () => {
    if (isInactive) return;
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      if (cartQuantity > 0) {
        updateCartItem(cartKey, newQuantity);
      }
    }
  };

  const handleAddToCart = () => {
    if (isInactive) return;
    
    if (quantity > currentStock) {
      toast.error(`Apenas ${currentStock} unidade(s) disponível(eis)`);
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart(displayProduct._id);
    }
    toast.success('Adicionado ao carrinho!');
  };

  const handleBuyNow = () => {
    if (isInactive) return;
    
    if (quantity > currentStock) {
      toast.error(`Apenas ${currentStock} unidade(s) disponível(eis)`);
      return;
    }
    
    if (!cartQuantity) {
      for (let i = 0; i < quantity; i++) {
        addToCart(displayProduct._id);
      }
    }
    navigate('/cart');
  };

  // Image navigation
  const changeImage = newIndex => {
    if (isInactive) return;
    setIsTransitioning(true);
    setCurrentImageIndex(newIndex);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const nextImage = () => {
    if (isInactive) return;
    const newIndex = (currentImageIndex + 1) % displayImages.length;
    changeImage(newIndex);
  };

  const prevImage = () => {
    if (isInactive) return;
    const newIndex = (currentImageIndex - 1 + displayImages.length) % displayImages.length;
    changeImage(newIndex);
  };

  // Touch handlers
  const handleTouchStart = e => setTouchStart(e.touches[0].clientX);
  const handleTouchMove = e => setTouchEnd(e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 50) {
      if (distance > 0) nextImage();
      else prevImage();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const toggleZoom = () => {
    if (isZoomed) {
      setIsZoomed(false);
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
    } else {
      setIsZoomed(true);
      setZoomLevel(2);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = e => {
      if (!isModalOpen) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') {
        setModalImageIndex(prev => (prev - 1 + displayImages.length) % displayImages.length);
      }
      if (e.key === 'ArrowRight') {
        setModalImageIndex(prev => (prev + 1) % displayImages.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, displayImages.length, closeModal]);

  if (!product || !displayProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* SEO */}
      <SEO
        title={`${displayProduct.name} | Elite Surfing Portugal`}
        description={generateProductDescription(displayProduct)}
        url={`https://elitesurfing.pt/products/${category}/${displayProduct._id}`}
        image={displayProduct.image?.[0]}
        type="product"
      />
      <ProductSchema product={displayProduct} currency={currency} />
      <BreadcrumbSchema items={getBreadcrumbs()} />

      <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6 flex flex-wrap items-center">
            <Link to="/" className="hover:text-primary transition-colors">
              Início
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link to="/products" className="hover:text-primary transition-colors">
              Produtos
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link
              to={`/products/${displayProduct.category?.toLowerCase()}`}
              className="hover:text-primary transition-colors"
            >
              {displayProduct.category}
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate max-w-[150px]">
              {displayProduct.name}
            </span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image com Transição */}
              <div
                className={`
                  relative aspect-square bg-white rounded-xl overflow-hidden shadow-lg
                  ${isInactive ? 'opacity-60' : 'cursor-pointer'}
                `}
                onClick={() => openModal(currentImageIndex)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* 🎨 Container com transição de cor */}
                <div className={`
                  w-full h-full transition-all duration-300 ease-out
                  ${isColorTransitioning 
                    ? 'opacity-0 scale-95 blur-sm' 
                    : 'opacity-100 scale-100 blur-0'
                  }
                `}>
                  <img
                    src={displayImages[currentImageIndex]}
                    alt={displayProduct.name}
                    className={`
                      w-full h-full object-contain transition-all duration-300
                      ${isTransitioning ? 'scale-95 opacity-80' : 'scale-100'}
                    `}
                  />
                </div>
                
                {/* Stock badges */}
                {isInactive && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                    Esgotado
                  </div>
                )}
                {!isInactive && currentStock <= 3 && (
                  <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg animate-pulse">
                    Últimas {currentStock}!
                  </div>
                )}

                {/* Navigation arrows */}
                {displayImages.length > 1 && !isInactive && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Zoom hint */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs">
                  Clique para ampliar
                </div>
              </div>

              {/* Thumbnails */}
              {displayImages.length > 1 && (
                <div className={`
                  flex gap-2 overflow-x-auto pb-2 transition-all duration-300
                  ${isColorTransitioning ? 'opacity-0' : 'opacity-100'}
                `}>
                  {displayImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => changeImage(index)}
                      disabled={isInactive}
                      className={`
                        flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all
                        ${currentImageIndex === index
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                        ${isInactive ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <img
                        src={img}
                        alt={`${displayProduct.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Specifications - Desktop */}
              <div className="hidden md:block">
                <button
                  onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                  className="flex items-center justify-between w-full p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <h3 className="text-base font-semibold text-gray-900">
                    Especificações Técnicas
                  </h3>
                  <svg
                    className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                      isDescriptionOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDescriptionOpen && (
                  <div className="mt-2 p-4 bg-white rounded-lg shadow-sm">
                    <ul className="space-y-2">
                      {displayProduct.description.map((desc, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700 text-sm">
                          <span className="text-primary mt-1 text-xs">●</span>
                          <span className="leading-relaxed">{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              {/* Product Title com Transição */}
              <div className={`
                transition-all duration-300
                ${isColorTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
              `}>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  {displayProduct.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  {reviewStats.loading ? (
                    <div className="flex gap-1">
                      {Array(5).fill('').map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex text-yellow-500 text-lg">
                      {Array(5).fill('').map((_, i) => (
                        <span key={i}>
                          {i < Math.round(reviewStats.averageRating) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-gray-600 text-sm">
                    {reviewStats.totalReviews > 0
                      ? `(${reviewStats.averageRating.toFixed(1)}) ${reviewStats.totalReviews} ${
                          reviewStats.totalReviews === 1 ? 'review' : 'reviews'
                        }`
                      : '(Sem reviews)'}
                  </span>
                </div>
              </div>

              {/* 🆕 SELETOR DE CORES COM TRANSIÇÃO */}
              {familyProducts.length > 1 && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`
                      text-sm font-semibold text-gray-900 transition-all duration-300
                      ${isColorTransitioning ? 'opacity-0' : 'opacity-100'}
                    `}>
                      Cor: {displayProduct.color || 'Selecione'}
                    </h3>
                    <span className={`
                      text-xs font-medium px-2 py-1 rounded-full transition-all duration-300
                      ${isColorTransitioning ? 'opacity-0' : 'opacity-100'}
                      ${currentStock > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                      }
                    `}>
                      {currentStock > 0 
                        ? `${currentStock} em stock` 
                        : 'Esgotado'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    {familyProducts.map((familyProduct) => {
                      const familyOutOfStock = (familyProduct.stock || 0) === 0;
                      const isSelected = familyProduct._id === displayProduct._id;
                      
                      return (
                        <button
                          key={familyProduct._id}
                          onClick={() => handleColorClick(familyProduct._id)}
                          disabled={isColorTransitioning}
                          title={`${familyProduct.color || familyProduct.name}${
                            familyOutOfStock ? ' (Esgotado)' : ` - ${familyProduct.stock} unidades`
                          }`}
                          className={`
                            relative w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300
                            transform hover:scale-110 active:scale-95
                            ${isSelected 
                              ? 'ring-4 ring-offset-2 ring-primary scale-110 shadow-lg' 
                              : 'hover:shadow-md'
                            }
                            ${familyOutOfStock && !isSelected ? 'opacity-50' : ''}
                            ${isColorTransitioning ? 'pointer-events-none' : ''}
                          `}
                          style={{ backgroundColor: familyProduct.colorCode || '#ccc' }}
                        >
                          {/* X para produtos esgotados */}
                          {familyOutOfStock && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </span>
                          )}
                          {/* Check para produto selecionado */}
                          {isSelected && !familyOutOfStock && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                          {/* Borda para cores claras */}
                          <span 
                            className="absolute inset-0 rounded-full border-2"
                            style={{ 
                              borderColor: isLightColor(familyProduct.colorCode) ? '#d1d5db' : 'transparent' 
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cor única (se definida mas sem família) */}
              {displayProduct.color && familyProducts.length <= 1 && (
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: displayProduct.colorCode || '#ccc' }}
                  />
                  <span className="text-sm text-gray-700">{displayProduct.color}</span>
                </div>
              )}

              {/* Price Section com Transição */}
              <div className={`
                bg-white p-4 rounded-lg shadow-sm transition-all duration-300
                ${isColorTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
              `}>
                <div className="space-y-1">
                  {displayProduct.price !== displayProduct.offerPrice && (
                    <p className="text-gray-500 text-sm line-through">
                      De: {displayProduct.price.toLocaleString('pt-PT', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} {currency}
                    </p>
                  )}
                  <p className="text-2xl font-bold text-gray-900">
                    {displayProduct.offerPrice.toLocaleString('pt-PT', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} {currency}
                  </p>
                  <p className="text-xs text-gray-600">(Impostos incluídos)</p>
                </div>
              </div>

              {/* Specifications - Mobile */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                  className="flex items-center justify-between w-full p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <h3 className="text-base font-semibold text-gray-900">
                    Especificações Técnicas
                  </h3>
                  <svg
                    className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                      isDescriptionOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDescriptionOpen && (
                  <div className="mt-2 p-4 bg-white rounded-lg shadow-sm">
                    <ul className="space-y-2">
                      {displayProduct.description.map((desc, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700 text-sm">
                          <span className="text-primary mt-1 text-xs">●</span>
                          <span className="leading-relaxed">{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Quantity and Add to Cart */}
              <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                {/* Quantity selector */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Quantidade:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decreaseQuantity}
                      disabled={isInactive || quantity <= 1}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        isInactive || quantity <= 1
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary hover:scale-105'
                      }`}
                    >
                      <span className="text-xl font-bold">-</span>
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={increaseQuantity}
                      disabled={isInactive || quantity >= currentStock}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        isInactive || quantity >= currentStock
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary hover:scale-105'
                      }`}
                    >
                      <span className="text-xl font-bold">+</span>
                    </button>
                  </div>
                </div>

                {/* Stock info */}
                <p className={`text-sm ${isInactive ? 'text-red-500' : 'text-gray-600'}`}>
                  {isInactive
                    ? 'Produto esgotado'
                    : currentStock <= 3
                    ? `⚠️ Apenas ${currentStock} em stock`
                    : `${currentStock} disponíveis`}
                </p>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isInactive}
                    className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all transform ${
                      isInactive
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary-dull active:scale-95'
                    }`}
                  >
                    Adicionar ao Carrinho
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isInactive}
                    className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all transform ${
                      isInactive
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-95'
                    }`}
                  >
                    Comprar Agora
                  </button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
                <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-primary text-lg mb-1">🚚</div>
                  <p>Envio Rápido</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-primary text-lg mb-1">🔒</div>
                  <p>Pagamento Seguro</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-primary text-lg mb-1">✅</div>
                  <p>Qualidade Premium</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-8">
            <ProductReviews productId={displayProduct._id} />
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                Produtos Relacionados
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.slice(0, 4).map(item => (
                  <ProductCard key={item._id} product={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeModal}
        >
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm">
            {modalImageIndex + 1} / {displayImages.length}
          </div>

          {/* Navigation arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalImageIndex(prev => (prev - 1 + displayImages.length) % displayImages.length);
                }}
                className="absolute left-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalImageIndex(prev => (prev + 1) % displayImages.length);
                }}
                className="absolute right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Main image */}
          <img
            ref={modalImageRef}
            src={displayImages[modalImageIndex]}
            alt={displayProduct.name}
            className={`max-w-[90vw] max-h-[85vh] object-contain transition-transform duration-200 ${
              isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            style={{
              transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              toggleZoom();
            }}
          />

          {/* Thumbnails */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2">
              {displayImages.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalImageIndex(index);
                  }}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    modalImageIndex === index
                      ? 'border-white ring-2 ring-white ring-offset-2 ring-offset-black'
                      : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProductDetails;