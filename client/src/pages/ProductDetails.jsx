import '../styles/ProductDetails.css';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';
import { SEO, ProductSchema, BreadcrumbSchema } from '../components/seo';
import toast from 'react-hot-toast';

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

  // 🆕 ESTADOS PARA FAMÍLIA DE CORES
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isImageLoading, setIsImageLoading] = useState(false);

  const imageScrollRef = useRef(null);
  const modalRef = useRef(null);
  const modalImageRef = useRef(null);
  const pinchStartDistance = useRef(0);

  const product = products.find(item => item._id === id);

  // 🎯 Atualizar displayProduct quando produto muda
  useEffect(() => {
    if (product) {
      setDisplayProduct(product);
      setIsColorTransitioning(false);
    }
  }, [product?._id]);

  // 🎯 Buscar produtos da mesma família
  useEffect(() => {
    if (product?.productFamily) {
      const family = products.filter(
        p => p.productFamily === product.productFamily
      );
      // Ordenar: produto atual primeiro
      family.sort((a, b) => {
        if (a._id === product._id) return -1;
        if (b._id === product._id) return 1;
        return (a.color || '').localeCompare(b.color || '');
      });
      setFamilyProducts(family);
    } else {
      setFamilyProducts([]);
    }
  }, [product?.productFamily, products, product?._id]);

  // Verificar se produto está inativo
  const isInactive = !displayProduct?.inStock || (displayProduct?.stock || 0) <= 0;
  const currentStock = displayProduct?.stock || 0;
  const isLowStock = currentStock > 0 && currentStock <= 3;

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

  // Sincronização com cartItems
  useEffect(() => {
    if (displayProduct) {
      const cartQuantity = cartItems[displayProduct._id] || 0;
      setQuantity(Math.max(1, cartQuantity || 1));
    }
  }, [displayProduct?._id, cartItems]);

  // Produtos relacionados (excluindo a família atual)
  useEffect(() => {
    if (product && products.length > 0) {
      const productsCopy = [...products].filter(
        item =>
          product.category === item.category &&
          item._id !== product._id &&
          item.inStock &&
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
  }, [product?._id]);

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

  // 🎯 HANDLER PARA TROCAR COR
  const handleColorClick = (familyProductId) => {
    if (familyProductId === displayProduct?._id) return;
    
    const newProduct = familyProducts.find(p => p._id === familyProductId);
    if (!newProduct) return;

    // Iniciar transição
    setIsColorTransitioning(true);
    
    setTimeout(() => {
      setDisplayProduct(newProduct);
      setCurrentImageIndex(0);
      setThumbStartIndex(0);
      setQuantity(1);
      
      // Atualizar URL sem recarregar
      window.history.replaceState(
        null, 
        '', 
        `/products/${newProduct.category.toLowerCase()}/${familyProductId}`
      );
      
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

  // Touch handlers para swipe
  const minSwipeDistance = 50;

  const onTouchStart = useCallback(e => {
    if (isZoomed) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, [isZoomed]);

  const onTouchMove = useCallback(e => {
    if (isZoomed) return;
    setTouchEnd(e.targetTouches[0].clientX);
  }, [isZoomed]);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || isZoomed || !displayProduct) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      const nextIndex = modalImageIndex < displayProduct.image.length - 1 ? modalImageIndex + 1 : 0;
      setModalImageIndex(nextIndex);
      setCurrentImageIndex(nextIndex);
    }

    if (isRightSwipe) {
      const prevIndex = modalImageIndex > 0 ? modalImageIndex - 1 : displayProduct.image.length - 1;
      setModalImageIndex(prevIndex);
      setCurrentImageIndex(prevIndex);
    }
  }, [touchStart, touchEnd, modalImageIndex, displayProduct, isZoomed]);

  // Double tap para zoom
  const lastTap = useRef(0);
  const handleDoubleTap = useCallback(e => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap.current;

    if (tapLength < 300 && tapLength > 0) {
      e.preventDefault();
      if (isZoomed) {
        setIsZoomed(false);
        setZoomLevel(1);
        setImagePosition({ x: 0, y: 0 });
      } else {
        setIsZoomed(true);
        setZoomLevel(2);
      }
    }
    lastTap.current = currentTime;
  }, [isZoomed]);

  // Pinch to zoom
  const handlePinch = useCallback(e => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      if (pinchStartDistance.current === 0) {
        pinchStartDistance.current = distance;
      } else {
        const scale = distance / pinchStartDistance.current;
        const newZoomLevel = Math.min(Math.max(1, zoomLevel * scale), 3);
        setZoomLevel(newZoomLevel);
        setIsZoomed(newZoomLevel > 1);
      }
    }
  }, [zoomLevel]);

  const handlePinchEnd = useCallback(() => {
    pinchStartDistance.current = 0;
  }, []);

  // Arrastar imagem com zoom
  const handleMouseDown = useCallback(e => {
    if (!isZoomed) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  }, [isZoomed, imagePosition]);

  const handleMouseMove = useCallback(e => {
    if (!isDragging || !isZoomed) return;
    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, isZoomed, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Navegação do modal
  const nextModalImage = useCallback(() => {
    if (!displayProduct) return;
    setIsImageLoading(true);
    const newIndex = modalImageIndex < displayProduct.image.length - 1 ? modalImageIndex + 1 : 0;
    setModalImageIndex(newIndex);
    setCurrentImageIndex(newIndex);
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  }, [modalImageIndex, displayProduct]);

  const prevModalImage = useCallback(() => {
    if (!displayProduct) return;
    setIsImageLoading(true);
    const newIndex = modalImageIndex > 0 ? modalImageIndex - 1 : displayProduct.image.length - 1;
    setModalImageIndex(newIndex);
    setCurrentImageIndex(newIndex);
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  }, [modalImageIndex, displayProduct]);

  // Navegação com teclado
  useEffect(() => {
    const handleKeyDown = e => {
      if (!isModalOpen) return;
      if (e.key === 'ArrowLeft') prevModalImage();
      else if (e.key === 'ArrowRight') nextModalImage();
      else if (e.key === 'Escape') closeModal();
    };

    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isModalOpen, nextModalImage, prevModalImage, closeModal]);

  // Scroll mobile
  useEffect(() => {
    if (imageScrollRef.current && window.innerWidth < 640) {
      const scrollContainer = imageScrollRef.current;
      const imageWidth = scrollContainer.offsetWidth;
      scrollContainer.scrollLeft = currentImageIndex * imageWidth;
    }
  }, [currentImageIndex]);

  // 🎯 HANDLERS DE QUANTIDADE COM VALIDAÇÃO DE STOCK
  const increaseQuantity = () => {
    if (isInactive) return;
    
    const cartQuantity = cartItems[displayProduct._id] || 0;
    const totalAfterIncrease = cartQuantity + 1;
    
    if (totalAfterIncrease > currentStock) {
      toast.error(`Apenas ${currentStock} unidade(s) disponível(eis)`);
      return;
    }
    
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    if (cartQuantity > 0) {
      updateCartItem(displayProduct._id, cartQuantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (isInactive) return;
    const cartQuantity = cartItems[displayProduct._id] || 0;
    
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      if (cartQuantity > 1) {
        updateCartItem(displayProduct._id, cartQuantity - 1);
      }
    }
  };

  const handleAddToCart = () => {
    if (isInactive) return;
    
    const cartQuantity = cartItems[displayProduct._id] || 0;
    const totalAfterAdd = cartQuantity + quantity;
    
    if (totalAfterAdd > currentStock) {
      toast.error(`Apenas ${currentStock} unidade(s) disponível(eis). Já tens ${cartQuantity} no carrinho.`);
      return;
    }
    
    // Adicionar quantidade selecionada
    for (let i = 0; i < quantity; i++) {
      addToCart(displayProduct._id);
    }
  };

  const handleBuyNow = () => {
    if (isInactive) return;
    
    const cartQuantity = cartItems[displayProduct._id] || 0;
    
    if (cartQuantity === 0) {
      if (quantity > currentStock) {
        toast.error(`Apenas ${currentStock} unidade(s) disponível(eis)`);
        return;
      }
      for (let i = 0; i < quantity; i++) {
        addToCart(displayProduct._id);
      }
    }
    navigate('/cart');
  };

  const changeImage = newIndex => {
    if (isInactive) return;
    setIsTransitioning(true);
    setCurrentImageIndex(newIndex);

    if (window.innerWidth >= 640 && displayProduct) {
      if (newIndex >= thumbStartIndex + 5) {
        setThumbStartIndex(prev => Math.min(prev + 1, Math.max(0, displayProduct.image.length - 5)));
      } else if (newIndex < thumbStartIndex) {
        setThumbStartIndex(prev => Math.max(prev - 1, 0));
      }
    }

    setTimeout(() => setIsTransitioning(false), 300);
  };

  const nextImage = () => {
    if (isInactive || !displayProduct) return;
    const newIndex = (currentImageIndex + 1) % displayProduct.image.length;
    changeImage(newIndex);
  };

  const prevImage = () => {
    if (isInactive || !displayProduct) return;
    const newIndex = (currentImageIndex - 1 + displayProduct.image.length) % displayProduct.image.length;
    changeImage(newIndex);
  };

  const scrollThumbsLeft = () => {
    if (isInactive || !displayProduct) return;
    const newIndex = thumbStartIndex - 1;
    setThumbStartIndex(newIndex < 0 ? Math.max(0, displayProduct.image.length - 5) : newIndex);
  };

  const scrollThumbsRight = () => {
    if (isInactive || !displayProduct) return;
    const newIndex = thumbStartIndex + 1;
    setThumbStartIndex(newIndex > displayProduct.image.length - 5 ? 0 : newIndex);
  };

  const selectThumbnail = index => {
    if (isInactive) return;
    changeImage(index);
  };

  const handleImageScroll = ref => {
    if (ref.current) {
      const scrollContainer = ref.current;
      const imageWidth = scrollContainer.offsetWidth;
      const newIndex = Math.round(scrollContainer.scrollLeft / imageWidth);
      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex);
      }
    }
  };

  // Helper: verificar se cor é clara
  const isLightColor = (color) => {
    if (!color) return false;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 200;
  };

  if (!product || !displayProduct) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-gray-600'>Carregando produto...</p>
        </div>
      </div>
    );
  }

  const cartQuantity = cartItems[displayProduct._id] || 0;

  return (
    <>
      {/* SEO */}
      <SEO 
        title={displayProduct.name}
        description={generateProductDescription(displayProduct)}
        image={displayProduct.image?.[0]}
        url={`/products/${category || displayProduct.category?.toLowerCase()}/${displayProduct._id}`}
        type="product"
      >
        <ProductSchema 
          product={{
            ...displayProduct,
            averageRating: reviewStats.averageRating,
            reviewCount: reviewStats.totalReviews
          }} 
        />
        <BreadcrumbSchema items={getBreadcrumbs()} />
      </SEO>

      <div className='mt-12 px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32'>
        {/* Modal de Imagem */}
        {isModalOpen && (
          <div
            className='fixed inset-0 bg-black z-50 flex items-center justify-center'
            onClick={closeModal}
            style={{ touchAction: isZoomed ? 'none' : 'pan-y' }}
          >
            <button
              className='absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-all duration-300 z-50 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center'
              onClick={closeModal}
            >
              ×
            </button>

            <div className='absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm z-50'>
              {modalImageIndex + 1} / {displayProduct.image.length}
            </div>

            {isZoomed && (
              <div className='absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm z-50'>
                Zoom: {Math.round(zoomLevel * 100)}%
              </div>
            )}

            <div
              className='relative w-full h-full flex items-center justify-center'
              onClick={e => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchMove={e => {
                onTouchMove(e);
                if (e.touches.length === 2) handlePinch(e);
              }}
              onTouchEnd={() => {
                onTouchEnd();
                handlePinchEnd();
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {isImageLoading && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/50 z-40'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white'></div>
                </div>
              )}

              <img
                ref={modalImageRef}
                src={displayProduct.image[modalImageIndex]}
                alt={`${displayProduct.name} - Imagem ${modalImageIndex + 1}`}
                className='max-w-full max-h-full object-contain transition-transform duration-300'
                style={{
                  transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                  cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
                  userSelect: 'none',
                  touchAction: 'none',
                }}
                onClick={handleDoubleTap}
                onLoad={() => setIsImageLoading(false)}
                draggable={false}
              />

              {!isZoomed && displayProduct.image.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); prevModalImage(); }}
                    className='absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 sm:p-3 shadow-lg hover:bg-white transition-all duration-300 active:scale-90'
                  >
                    <img src={assets.arrow_left} alt='' className='w-4 h-4 sm:w-5 sm:h-5' />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); nextModalImage(); }}
                    className='absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 sm:p-3 shadow-lg hover:bg-white transition-all duration-300 active:scale-90'
                  >
                    <img src={assets.arrow_right} alt='' className='w-4 h-4 sm:w-5 sm:h-5' />
                  </button>
                </>
              )}

              {!isZoomed && displayProduct.image.length > 1 && (
                <div className='absolute bottom-0 left-0 right-0 bg-black/70 p-2 sm:p-4'>
                  <div className='flex gap-2 justify-center overflow-x-auto scrollbar-hide max-w-full'>
                    {displayProduct.image.map((image, index) => (
                      <button
                        key={index}
                        onClick={e => {
                          e.stopPropagation();
                          setModalImageIndex(index);
                          setCurrentImageIndex(index);
                          setIsImageLoading(true);
                        }}
                        className={`flex-shrink-0 border-2 transition-all duration-300 ${
                          modalImageIndex === index
                            ? 'border-white scale-110'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={image} alt={`Thumbnail ${index + 1}`} className='w-12 h-12 sm:w-16 sm:h-16 object-cover' />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Breadcrumbs */}
        <nav className='text-sm md:text-base mb-6'>
          <Link to='/' className='hover:text-primary transition-colors duration-200'>Home</Link>
          <span className='mx-2 text-gray-400'>/</span>
          <Link to='/products' className='hover:text-primary transition-colors duration-200'>Products</Link>
          <span className='mx-2 text-gray-400'>/</span>
          <Link to={`/products/${displayProduct.category.toLowerCase()}`} className='hover:text-primary transition-colors duration-200'>
            {displayProduct.category}
          </Link>
          <span className='mx-2 text-gray-400'>/</span>
          <span className='text-primary font-medium'>{displayProduct.name}</span>
        </nav>

        {/* Product Content */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16'>
          {/* Images Section */}
          <div className='flex flex-col gap-4'>
            {/* Main Image Container */}
            <div className='relative w-full max-w-[450px] h-[350px] sm:h-[450px] mx-auto'>
              {/* Mobile Carousel */}
              <div
                ref={imageScrollRef}
                onScroll={() => handleImageScroll(imageScrollRef)}
                className='flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide sm:hidden border border-gray-200 rounded-xl shadow-sm relative'
              >
                {displayProduct.image.map((image, index) => (
                  <div key={index} className='relative w-full h-full flex-shrink-0 snap-center'>
                    <img
                      src={image}
                      alt={`Imagem ${index + 1}`}
                      className={`w-full h-full object-contain transition-all duration-300 ${
                        isInactive ? 'blur-sm grayscale cursor-default' : 'cursor-pointer'
                      } ${isColorTransitioning ? 'opacity-0' : 'opacity-100'}`}
                      onClick={() => !isInactive && openModal(index)}
                    />
                  </div>
                ))}

                {isInactive && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] pointer-events-none rounded-xl'>
                    <div className='bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-2xl border-2 border-white/30 transform rotate-[-5deg] animate-pulse'>
                      INDISPONÍVEL
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Main Image */}
              <div className='relative border border-gray-200 w-full h-full rounded-xl overflow-hidden hidden sm:block shadow-sm'>
                <img
                  src={displayProduct.image[currentImageIndex]}
                  alt='Produto'
                  className={`w-full h-full object-contain transition-all duration-300 ${
                    isTransitioning ? 'opacity-70' : 'opacity-100'
                  } ${isInactive ? 'blur-sm grayscale cursor-default' : 'cursor-pointer'} ${
                    isColorTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`}
                  onClick={() => !isInactive && openModal(currentImageIndex)}
                />

                {isInactive && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] rounded-xl pointer-events-none'>
                    <div className='bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-2xl border-2 border-white/30 transform rotate-[-5deg] animate-pulse'>
                      INDISPONÍVEL
                    </div>
                  </div>
                )}

                {/* Badge Stock Baixo */}
                {isLowStock && !isInactive && (
                  <div className='absolute top-3 left-3 bg-orange-500 text-white text-sm px-3 py-1.5 rounded-lg font-medium animate-pulse shadow-lg'>
                    Últimas {currentStock} unidades!
                  </div>
                )}

                {!isInactive && (
                  <div className='absolute top-2 right-2 bg-black/50 text-white p-2 rounded-lg text-xs opacity-0 hover:opacity-100 transition-opacity'>
                    🔍 Clique para ampliar
                  </div>
                )}

                {!isInactive && displayProduct.image.length > 1 && (
                  <>
                    <button
                      onClick={e => { e.stopPropagation(); prevImage(); }}
                      className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-3 shadow-lg hover:bg-white transition-all duration-300 active:scale-90'
                    >
                      <img src={assets.arrow_left} alt='Anterior' className='w-4 h-4' />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); nextImage(); }}
                      className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-3 shadow-lg hover:bg-white transition-all duration-300 active:scale-90'
                    >
                      <img src={assets.arrow_right} alt='Próxima' className='w-4 h-4' />
                    </button>
                  </>
                )}
              </div>

              {/* Mobile Dots */}
              <div className='flex justify-center gap-2 mt-4 sm:hidden'>
                {displayProduct.image.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => !isInactive && changeImage(index)}
                    disabled={isInactive}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      currentImageIndex === index ? 'bg-primary scale-110' : 'bg-gray-300 hover:bg-gray-400'
                    } ${isInactive ? 'cursor-not-allowed opacity-50' : ''}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Thumbnails */}
            {!isInactive && (
              <div className='hidden sm:flex justify-center'>
                <div className='flex items-center gap-2 max-w-[550px]'>
                  {displayProduct.image.length > 5 && (
                    <button onClick={scrollThumbsLeft} className='p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 active:scale-90 flex-shrink-0'>
                      <img src={assets.arrow_left} alt='Anterior' className='w-4 h-4' />
                    </button>
                  )}

                  <div className='flex gap-3 overflow-hidden'>
                    {displayProduct.image.slice(thumbStartIndex, thumbStartIndex + 5).map((image, index) => (
                      <div
                        key={thumbStartIndex + index}
                        onClick={() => selectThumbnail(thumbStartIndex + index)}
                        className={`border-2 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0 ${
                          currentImageIndex === thumbStartIndex + index
                            ? 'border-primary scale-105 shadow-lg'
                            : 'border-gray-300 hover:scale-105 hover:border-gray-400'
                        }`}
                      >
                        <img src={image} alt={`Thumbnail ${thumbStartIndex + index + 1}`} className='w-full h-full object-cover transition-transform duration-300' />
                      </div>
                    ))}
                  </div>

                  {displayProduct.image.length > 5 && (
                    <button onClick={scrollThumbsRight} className='p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 active:scale-90 flex-shrink-0'>
                      <img src={assets.arrow_right} alt='Próxima' className='w-4 h-4' />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Especificações - Desktop */}
            <div className='hidden sm:flex justify-center'>
              <div className='w-full max-w-[550px]'>
                <button
                  onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                  className='flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200'
                >
                  <h3 className='text-base md:text-lg font-semibold text-gray-900'>Especificações Técnicas</h3>
                  <svg className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isDescriptionOpen ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                </button>
                {isDescriptionOpen && (
                  <div className='mt-3 p-3 border border-gray-200 rounded-lg bg-white'>
                    <ul className='space-y-2'>
                      {displayProduct.description.map((desc, index) => (
                        <li key={index} className='flex items-start gap-2 text-gray-700 text-sm'>
                          <span className='text-primary mt-1 text-xs'>●</span>
                          <span className='leading-relaxed'>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className='space-y-4'>
            {/* Título com transição */}
            <div className={`transition-all duration-200 ${isColorTransitioning ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0'}`}>
              <h1 className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight'>
                {displayProduct.name}
              </h1>

              {/* Rating */}
              <div className='flex items-center gap-2 mt-2'>
                <div className='flex items-center gap-1'>
                  {reviewStats.loading ? (
                    <div className='flex gap-1'>
                      {Array(5).fill('').map((_, i) => (
                        <div key={i} className='w-4 h-4 bg-gray-200 rounded animate-pulse'></div>
                      ))}
                    </div>
                  ) : (
                    <div className='flex text-yellow-500 text-lg'>
                      {Array(5).fill('').map((_, i) => (
                        <span key={i} className='transition-transform duration-200 hover:scale-110'>
                          {i < Math.round(reviewStats.averageRating) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {!reviewStats.loading && (
                  <span className='text-gray-600 text-sm'>
                    {reviewStats.totalReviews > 0
                      ? `(${reviewStats.averageRating.toFixed(1)}) ${reviewStats.totalReviews} ${reviewStats.totalReviews === 1 ? 'review' : 'reviews'}`
                      : '(Sem reviews)'}
                  </span>
                )}
              </div>
            </div>

            {/* 🆕 SELETOR DE CORES */}
            {familyProducts.length > 1 && (
              <div className='bg-white border border-gray-200 p-4 rounded-lg'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className={`text-sm font-semibold text-gray-900 transition-all duration-200 ${isColorTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    Cor: <span className='font-normal'>{displayProduct.color || 'Selecione'}</span>
                  </h3>
                </div>
                
                <div className='flex items-center gap-3 flex-wrap'>
                  {familyProducts.map((familyProduct) => {
                    const fpStock = familyProduct.stock || 0;
                    const fpOutOfStock = fpStock <= 0;
                    const isSelected = familyProduct._id === displayProduct._id;
                    const isLight = isLightColor(familyProduct.colorCode);
                    
                    return (
                      <button
                        key={familyProduct._id}
                        onClick={() => handleColorClick(familyProduct._id)}
                        disabled={isColorTransitioning}
                        title={`${familyProduct.color || familyProduct.name}${fpOutOfStock ? ' (Esgotado)' : ` - ${fpStock} disponíveis`}`}
                        className={`
                          relative w-10 h-10 md:w-11 md:h-11 rounded-full transition-all duration-200
                          transform hover:scale-110 active:scale-95
                          ${isSelected ? 'ring-[3px] ring-offset-2 ring-gray-800 scale-110' : ''}
                          ${fpOutOfStock && !isSelected ? 'opacity-50' : ''}
                          ${isColorTransitioning ? 'pointer-events-none' : ''}
                          ${isLight ? 'border-2 border-gray-300' : 'border border-gray-200'}
                        `}
                        style={{ backgroundColor: familyProduct.colorCode || '#ccc' }}
                      >
                        {/* X para esgotado */}
                        {fpOutOfStock && (
                          <span className='absolute inset-0 flex items-center justify-center'>
                            <svg className='w-5 h-5 text-gray-600 drop-shadow' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
                              <path d='M18 6L6 18M6 6l12 12' />
                            </svg>
                          </span>
                        )}
                        {/* Check para selecionado */}
                        {isSelected && !fpOutOfStock && (
                          <span className='absolute inset-0 flex items-center justify-center'>
                            <svg className={`w-5 h-5 drop-shadow ${isLight ? 'text-gray-800' : 'text-white'}`} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
                              <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Preço com transição */}
            <div className={`bg-gray-50 p-3 md:p-4 rounded-lg transition-all duration-200 ${isColorTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <div className='space-y-1'>
                <p className='text-gray-500 text-sm line-through'>
                  De: {displayProduct.price.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                </p>
                <p className='text-xl md:text-2xl font-bold text-gray-900'>
                  {displayProduct.offerPrice.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                </p>
                <p className='text-xs text-gray-600'>(Impostos incluídos)</p>
              </div>
            </div>

            {/* Especificações - Mobile */}
            <div className='sm:hidden'>
              <button
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                className='flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200'
              >
                <h3 className='text-base md:text-lg font-semibold text-gray-900'>Especificações Técnicas</h3>
                <svg className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isDescriptionOpen ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </button>
              {isDescriptionOpen && (
                <div className='mt-3 p-3 border border-gray-200 rounded-lg bg-white'>
                  <ul className='space-y-2'>
                    {displayProduct.description.map((desc, index) => (
                      <li key={index} className='flex items-start gap-2 text-gray-700 text-sm'>
                        <span className='text-primary mt-1 text-xs'>●</span>
                        <span className='leading-relaxed'>{desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Stock e Quantidade */}
            <div className={`bg-white border p-3 md:p-4 rounded-lg transition-all duration-300 ${isInactive ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
              <div className='space-y-3'>
                {/* Status de Stock */}
                <div className='flex items-center gap-2'>
                  <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                    isInactive ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' : 'bg-green-500 shadow-lg shadow-green-500/50'
                  }`}></div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${isInactive ? 'text-red-700' : 'text-green-700'}`}>
                    {isInactive ? 'Produto Indisponível' : isLowStock ? `Últimas ${currentStock} unidades!` : `Em Stock - ${currentStock} disponíveis`}
                  </span>
                </div>

                {/* Seletor de Quantidade */}
                {!isInactive && (
                  <div>
                    <label className='block text-sm font-semibold text-gray-900 mb-2'>Quantidade</label>
                    <div className='flex items-center w-fit'>
                      <button
                        onClick={decreaseQuantity}
                        className='w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-lg hover:bg-gray-50 transition-colors duration-200 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <div className='w-16 h-10 flex items-center justify-center border-t border-b border-gray-300 bg-gray-50 text-base font-semibold'>
                        {quantity}
                      </div>
                      <button
                        onClick={increaseQuantity}
                        className='w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-lg hover:bg-gray-50 transition-colors duration-200 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={cartQuantity + quantity >= currentStock}
                      >
                        +
                      </button>
                    </div>
                    {cartQuantity > 0 && (
                      <p className='text-xs text-primary mt-1'>
                        {cartQuantity} {cartQuantity === 1 ? 'item' : 'itens'} no carrinho
                      </p>
                    )}
                  </div>
                )}

                {isInactive && (
                  <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                    <p className='text-sm text-red-700 text-center'>
                      Este produto está temporariamente indisponível
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className='space-y-3'>
              {isInactive ? (
                <>
                  <div className='bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-5 text-center'>
                    <div className='flex items-center justify-center gap-3 mb-3'>
                      <svg className='w-8 h-8 text-red-500 animate-pulse' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                      </svg>
                      <span className='text-red-700 font-bold text-xl'>PRODUTO INDISPONÍVEL</span>
                    </div>
                    <p className='text-red-600 text-sm'>
                      Este produto está temporariamente indisponível.<br />
                      Entre em contacto connosco para saber quando voltará ao stock.
                    </p>
                  </div>
                  <button onClick={() => navigate('/contact')} className='w-full py-3 px-4 text-base font-semibold bg-primary/10 text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-300 active:scale-[0.98]'>
                    Contacte-nos para Mais Informações
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleAddToCart} className='w-full py-3 px-4 text-base font-semibold bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all duration-300 active:scale-[0.98] border border-gray-200'>
                    Adicionar ao Carrinho
                  </button>
                  <button onClick={handleBuyNow} className='w-full py-3 px-4 text-base font-semibold bg-primary text-white rounded-lg hover:bg-primary-dull transition-all duration-300 active:scale-[0.98] shadow-lg hover:shadow-xl'>
                    Comprar Agora
                  </button>
                </>
              )}
            </div>

            {/* Info Adicional */}
            <div className={`p-3 md:p-4 rounded-lg transition-all duration-300 ${isInactive ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
              {isInactive ? (
                <div className='space-y-2 text-center'>
                  <p className='text-red-700 font-semibold'>🚫 Produto Temporariamente Indisponível</p>
                  <p className='text-sm text-red-600'>Entre em contacto para saber quando voltará ao stock</p>
                </div>
              ) : (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center'>
                      <span className='text-white text-xs'>✓</span>
                    </div>
                    <span className='text-xs md:text-sm text-gray-700'>Envio grátis para Portugal Continental</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center'>
                      <span className='text-white text-xs'>✓</span>
                    </div>
                    <span className='text-xs md:text-sm text-gray-700'>Garantia de 24 meses</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center'>
                      <span className='text-white text-xs'>✓</span>
                    </div>
                    <span className='text-xs md:text-sm text-gray-700'>Devolução gratuita em 30 dias</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className='mt-16'>
          <ProductReviews productId={displayProduct._id} />
        </div>

        {/* Produtos Relacionados */}
        <div className='mt-20'>
          <div className='text-center mb-12'>
            <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>Produtos Relacionados</h2>
            <div className='w-20 h-1 bg-primary rounded-full mx-auto'></div>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6'>
            {relatedProducts.slice(0, 10).map((relProduct, index) => (
              <ProductCard key={index} product={relProduct} />
            ))}
          </div>

          {relatedProducts.length > 10 && (
            <div className='text-center mt-12'>
              <button
                onClick={() => { navigate('/products'); window.scrollTo(0, 0); }}
                className='inline-flex items-center px-8 py-3 border border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 font-medium'
              >
                Ver Mais Produtos
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetails;